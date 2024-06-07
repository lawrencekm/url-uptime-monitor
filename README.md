
URL Uptime Monitor
=================================
This Node.js, express application allows you to monitor URLs and receive notifications via SMS or email when a URL is not accessible/reachable. You can add and delete URLs along with corresponding notification details via command-line arguments or an HTML form. Notifications are ONLY sent when URL is NOT reachable. ie. when your URL returns non 200 HTTP status code.

Author: Lawrence Njenga

Demo: To see a live demo of this application, please visit URL Monitoring Demo at https://url-uptime-monitor.onrender.com/

View code on Github: https://github.com/lawrencekm/url-uptime-monitor


Features
========
Monitor URLs and check their status every 5 minutes. Edit the line cron.schedule('*/5 * * * *', checkUrls); in server.mjs accordingly to adjust frequency of tracking.
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


Configuration
=============
create a .env file with notification parameters

eg.
SMS_NOTIFICATION_ENDPOINT="https://sozuri.net/api/v1/messaging"
SMS_NOTIFICATION_USERNAME="doves"
SMS_NOTIFICATION_KEY="zpVkxu8rYD.............O1aPrM78StB6PPz0GwQ"
SMS_NOTIFICATION_CHANNEL="sms"
SMS_NOTIFICATION_TYPE="promotional"
SMS_NOTIFICATION_FROM="Sozuri"

EMAIL_NOTIFICATION_ENDPOINT="https://sozuri.net/api/v1/messaging/email"
EMAIL_NOTIFICATION_USERNAME="Doves"
EMAIL_NOTIFICATION_KEY="zpVkxu8rYD3UOUhtm............VXSRHO1aPrM78StB6PPz0GwQ"
EMAIL_NOTIFICATION_CHANNEL="email"
EMAIL_NOTIFICATION_TYPE="email"
EMAIL_NOTIFICATION_FROM="john@sozuri.net"

Replace the values in the .env file variable with your actual notification endpoint URL.

Create a urls.json file in the document root writable by the web user to save your tracked URLS. This application uses a file to store urls to track. 

Install the necessary dependencies:

     npm install

Note: You can fork the repo and deploy it render.com as I have done in the demo in minutes, (platform to build, deploy, and scale your apps with unparalleled ease with free options)

Docker installation
-------------
You can run the aplication in a docker container simply by
-Ensure you have docker compose or docker desktop installed
-Clone the repo and run. 
     docker compose up --build -d 
-Access your application at http://yourserver:3000  #modify the port as necessary in server.mjs

USAGE
========
1.Command-Line Interface
======================
You can add or delete URLs using command-line arguments.

Add a URL:
----------
     node server.mjs add --url "https://example.com" --mobile "1234567890,25472516429x" --email "example@example.com"

Delete a URL:
-------------
     node server.mjs delete --url "https://example.com"

2.Web Interface
=============
You can also add or delete URLs using an HTML form.

Start the server:

     node server.mjs or npm start

Open your browser and navigate to:

http://localhost:3000

Use the forms to add or delete URLs. You must enter the URL exactly(without trailing/leading spaces) to delete.


Code Explanation
================
server.mjs

Dependencies:
------------
express: For creating the web server.
body-parser: For parsing form data.
fs: For file system operations.
axios: For making HTTP requests.
cron: For scheduling tasks.
yargs for commandline interface
dotenv for getting values from .env file
FormData for encoding form inputs
validator for form data validation

Functions:
----------
loadUrls: Loads URLs from a JSON file. Initializes an empty array if the file doesn't exist.
saveUrls: Saves the URL list to the JSON file.
addUrl: Adds a new URL, mobile number, and email to the list.
deleteUrl: Deletes a URL from the list.
sendNotification: Sends a notification to the specified endpoint.
checkUrls: Checks each URL's status and sends a notification if the URL is not accessible.

Cron Job:
---------
Schedules the checkUrls function to run every minute.

Express Server:
---------------
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

CHANGELOG
=========
For a detailed list of changes, see the [changelog](./CHANGELOG.md).

License
=======
This project is licensed under the MIT License.

