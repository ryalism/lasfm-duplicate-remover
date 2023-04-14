# Last.fm Duplicate Remover

Last.fm Duplicate Remover is a Tampermonkey userscript designed to find and optionally delete duplicate songs in a Last.fm user's library. The script provides the following features:

## Features

- Identifies duplicate songs in a Last.fm user's library based on the song title, artist, and timestamp within a specified time frame.
- Offers a report-only mode that saves a list of detected duplicates to sessionStorage and downloads it as a CSV file without deleting any entries.
- Supports continuous mode that processes each library page automatically, navigating back from the last page to the first one.
- Uses jQuery for DOM manipulation and interaction with Last.fm's website.

## Configuration

The script offers the following configuration options:

- `timeFrameInMinutes`: Time frame (in minutes) for considering duplicates. Songs with the same title and artist played within this time frame are considered duplicates (e.g., 5 or 10 minutes).
- `reportOnly`: Set to `true` to enable report-only mode, which saves a report of detected duplicates to sessionStorage and downloads it as a CSV file. Set to `false` to delete duplicates without creating a report.
- `continuous`: Set to `true` to enable continuous mode, which processes each library page automatically by navigating back from the last page to the first one.

## Installation

1. Install the Tampermonkey browser extension.
2. Create a new Tampermonkey script and replace its content with the provided script.
3. Add your Last.fm username in the script @match directive.
4. Save the script, then navigate to your Last.fm library page (e.g., `https://www.last.fm/user/username123/library`).
5. The script will run automatically and process the library pages according to the specified configuration options.

## Usage

The script will run automatically when you visit a Last.fm library page that matches the specified URL pattern. It will process the library pages according to the specified configuration options, either deleting duplicates and/or creating a report of detected duplicates.

If `reportOnly` is set to `true`, the script will save a list of detected duplicates to sessionStorage and download it as a CSV file when it reaches the first page. If `reportOnly` is set to `false`, the script will delete duplicates without creating a report.

If running this multiple times, clear your session storage or remove the `duplicateReport` item.

In continuous mode, the script will navigate back from the last page to the first one, processing each library page automatically. If you want to process only the current library page, set `continuous` to `false`.

This is designed to run a little slower than some other scripts to increase accuracy and prevent errors.

## License

This script is provided under the MIT License.
