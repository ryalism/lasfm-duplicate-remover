// ==UserScript==
// @name         Duplicate Song Checker
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Check for duplicate songs and delete them or perform a dry run, then navigate to the previous page
// @author       You
// @match        https://www.last.fm/user/username123/library*
// @grant        none
// @require      http://code.jquery.com/jquery-latest.js
// ==/UserScript==

(function() {
    'use strict';

    // Configuration variables
    const timeFrameInMinutes = 10; // Set the time frame for considering duplicates (e.g., 5 or 10 minutes)
    const reportOnly = true; // Set to true to save a report to sessionStorage and download it as a CSV, false to just delete duplicates
    const continuous = true; // Run continuously by loading the previous page, until it gets to page 1

    // Function to parse the date string from the timestamp
    function parseDate(dateStr) {
        let parts = dateStr.split(", ");
        let datePart = parts[0].split(" ");
        let day = parseInt(datePart[1]);
        let month = new Date(datePart[2] + " 1, 2000").getMonth();
        let year = parseInt(datePart[3]);
        let timeParts = parts[1].split(":");
        let date = new Date();
        date.setFullYear(year);
        date.setMonth(month);
        date.setDate(day);
        date.setHours(parseInt(timeParts[0]));
        date.setMinutes(parseInt(timeParts[1]));
        return date;
    }

    // Function to create a delay using a Promise
    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Function to convert the duplicate report to a CSV string
    function convertToCSV(duplicateReport) {
        let csv = 'Title,Artist,Timestamp\n';
        duplicateReport.forEach(song => {
            let timestamp = new Date(song.timestamp);
            csv += `"${song.title}","${song.artist}","${timestamp.toISOString()}"\n`;
        });
        return csv;
    }

    // Function to download the CSV file
    function downloadCSV(csv, filename) {
        let blob = new Blob([csv], {type: 'text/csv'});
        let url = URL.createObjectURL(blob);
        let a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    }

    // Async function to check for duplicate songs and delete them with a delay or perform a dry run
    async function checkForDuplicates(duplicateReport) {
        let songs = [];

        // Iterate through each song row
        $(".chartlist-row").each(function() {
            let song = {
                title: $(this).find(".chartlist-name a").text(),
                artist: $(this).find(".chartlist-artist a").text(),
                timestamp: parseDate($(this).find(".chartlist-timestamp span").attr("title"))
            };

            // Compare the current song to each song in the list
            for (let i = 0; i < songs.length; i++) {
                let other = songs[i];
                let timeDifference = Math.abs(song.timestamp - other.timestamp) / 60000; // Time difference in minutes

                // Check if the song is a duplicate (same title, artist, and within the specified time frame)
                if (song.title === other.title && song.artist === other.artist && timeDifference <= timeFrameInMinutes) {
                    duplicateReport.push(song);

                    if (!reportOnly) {
                        (async () => {
                            await sleep(300); // Wait for 300ms
                            $(this).find(".more-item--delete").click(); // Delete the duplicate row
                        })();
                    }
                    break;
                }
            }

            // Add the current song to the list
            songs.push(song);
        });

        // Wait for all deletions to complete
        await Promise.all(duplicateReport.map(() => sleep(300)));

        console.log("Duplicates found:", duplicateReport);
    }

    // Function to process the current page, checking for duplicates and navigating to the previous page
    function processPage(duplicateReport) {
        // Check for duplicates on the current page
        checkForDuplicates(duplicateReport);

        if (reportOnly) {
            sessionStorage.setItem('duplicateReport', JSON.stringify(duplicateReport));
        }

        // Get the current page number from the URL
        let currentPage = parseInt(new URLSearchParams(window.location.search).get("page"));
        
        // Set the timeout value based on the reportOnly setting
        let timeoutValue = reportOnly ? 0 : 500;

        // If the current page is greater than 1, navigate to the previous page after a 500ms delay
        if (currentPage > 1) {
            setTimeout(() => {
                // If there's an error, go back to previous page and try again
                if (window.location.toString().includes("delete")) {
                    window.location.href = window.location.origin + window.location.pathname + '?page=' + (currentPage);
                } else if (continuous) {
                    window.location.href = window.location.origin + window.location.pathname + '?page=' + (currentPage - 1);
                }
            }, timeoutValue);
        } else if (reportOnly) {
            // When it gets to the first page, download the duplicate report as a CSV
            let csv = convertToCSV(duplicateReport);
            downloadCSV(csv, 'duplicate_report.csv');
        }
    }

    // Execute the processPage function once the page is fully loaded
    $(document).ready(() => {
        let duplicateReport = reportOnly ? (JSON.parse(sessionStorage.getItem('duplicateReport')) || []) : [];
        processPage(duplicateReport);
    });
})();
