
URL Uptime Monitoring Application

This Node.js, express application allows you to monitor URLs and receive notifications via SMS or email when a URL is not accessible/reachable. You can add and delete URLs along with corresponding notification details via command-line arguments or an HTML form.

Author: Lawrence Njenga
Email: Lawrencekm04 @ gmail . com
Demo: To see a live demo of this application, please visit URL Monitoring Demo at https://www.urlmonitor.wezadata.com
Github: https://github.com/lawrencekm


Features
========
Monitor URLs and check their status every minute.
Receive notifications via SMS or email if a URL is not accessible.
Add and delete URLs using command-line arguments.
Add and delete URLs using an HTML form via a web interface.

Prerequisites
=============
Node.js installed on your system.
npm (Node Package Manager) installed on your system.

Installation
============
Clone the repository or download the source code.

Navigate to the project directory.

Install the necessary dependencies:

     npm install

Configuration
=============
Replace the placeholder URL in the notificationEndpoint variable with your actual notification endpoint URL.

Usage
========
Command-Line Interface
======================
You can add or delete URLs using command-line arguments.

Add a URL:
----------
     node server.mjs add --url "https://example.com" --mobile "1234567890,25472516429x" --email "example@example.com"

Delete a URL:
-------------
     node server.mjs delete --url "https://example.com"

Web Interface
=============
You can also add or delete URLs using an HTML form.

Start the server:

     node server.mjs

Open your browser and navigate to:

http://localhost:3000

Use the forms to add or delete URLs.

Code Explanation
server.mjs
Dependencies:

express: For creating the web server.
body-parser: For parsing form data.
fs: For file system operations.
axios: For making HTTP requests.
cron: For scheduling tasks.
yargs for commandline interface

Functions:

loadUrls: Loads URLs from a JSON file. Initializes an empty array if the file doesn't exist.
saveUrls: Saves the URL list to the JSON file.
addUrl: Adds a new URL, mobile number, and email to the list.
deleteUrl: Deletes a URL from the list.
sendNotification: Sends a notification to the specified endpoint.
checkUrls: Checks each URL's status and sends a notification if the URL is not accessible.

Cron Job:
=========
Schedules the checkUrls function to run every minute.

Express Server:
===============
Serves an HTML form for adding and deleting URLs.
Handles form submissions and updates the URL list accordingly.
HTML Form
The HTML form allows users to submit URLs, mobile numbers, and email addresses for monitoring or to delete an existing URL.

Example
=======
Add a URL via Command-Line:

node server.mjs add --url "https://sozuri.net" --mobile "254725164293" --email "lawrencekm04@gmail.com"

Delete a URL via Command-Line:

node server.mjs delete --url "https://sozuri.net"


Add/Delete URLs via Web Interface:

Start the server:
node server.mjs
Open your browser and navigate to http://localhost:3000.

Use the provided forms to add or delete URLs.

Testing
=========
This project uses Mocha as the testing framework, Chai for assertions, and Chai-HTTP for HTTP endpoint testing. To set up and run the tests, follow these steps:

Install Dependencies:

     npm install mocha chai chai-http

Create a test directory in your project root, and inside this directory, create a file named server.test.mjs.
Run the tests:

     npm test


License
=======
This project is licensed under the MIT License.

