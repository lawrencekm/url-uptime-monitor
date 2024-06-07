import express from 'express';
import bodyParser from 'body-parser';
import fs from 'fs';
import axios from 'axios';
import cron from 'node-cron';
import yargs from 'yargs/yargs';
import { hideBin } from 'yargs/helpers';
import dotenv from 'dotenv';
import FormData from 'form-data';
import validator from 'validator';

dotenv.config();

const app = express();
const port = 3000;
const path = './urls.json';

const smsNotificationEndpoint = process.env.SMS_NOTIFICATION_ENDPOINT;
const smsNotificationUsername = process.env.SMS_NOTIFICATION_USERNAME;
const smsNotificationKey = process.env.SMS_NOTIFICATION_KEY;
const smsNotificationType = process.env.SMS_NOTIFICATION_TYPE;
const smsNotificationChannel = process.env.SMS_NOTIFICATION_CHANNEL;
const smsNotificationFrom = process.env.SMS_NOTIFICATION_FROM;

const emailNotificationEndpoint = process.env.EMAIL_NOTIFICATION_ENDPOINT;
const emailNotificationUsername = process.env.EMAIL_NOTIFICATION_USERNAME;
const emailNotificationKey = process.env.EMAIL_NOTIFICATION_KEY;
const emailNotificationType = process.env.EMAIL_NOTIFICATION_TYPE;
const emailNotificationChannel = process.env.EMAIL_NOTIFICATION_CHANNEL;
const emailNotificationFrom = process.env.EMAIL_NOTIFICATION_FROM;

if (!smsNotificationEndpoint || !smsNotificationUsername || !smsNotificationKey || !smsNotificationType || !smsNotificationChannel || !smsNotificationFrom || 
    !emailNotificationEndpoint || !emailNotificationUsername || !emailNotificationKey || !emailNotificationType || !emailNotificationChannel || !emailNotificationFrom) {
  console.error('Missing environment variables. Please check your .env file.');
  process.exit(1);
}

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));

// Load URLs from file or initialize if not exists
const loadUrls = () => {
  try {
    if (!fs.existsSync(path)) {
      fs.writeFileSync(path, JSON.stringify([]));
    }
    const data = fs.readFileSync(path);
    return JSON.parse(data);
  } catch (error) {
    console.error('An error occurred:', error);
  }
};

const saveUrls = (urls) => {
  fs.writeFileSync(path, JSON.stringify(urls, null, 2));
};

const addUrl = (url, mobile, email) => {
  // Validate URL
  if (!validator.isURL(url)) {
    console.error('Invalid URL:', url);
    return 'Invalid URL';
  }
  
  // Validate mobile (assuming international format)
  if (!validator.isMobilePhone(mobile, 'any', { strictMode: false })) {
    console.error('Invalid mobile number:', mobile);
    return 'Invalid mobile number';
  }
  
  // Validate email
  const emails = email.split(',').map(e => e.trim());
  for (const e of emails) {
    if (!validator.isEmail(e)) {
      console.error('Invalid email:', e);
      return `Invalid email: ${e}`;
    }
  }

  const urls = loadUrls();
  if (Array.isArray(urls)) {
    // Check for duplicates
    const exists = urls.some(entry => entry.url === url);
    if (exists) {
      console.log('URL already exists.');
      return;
    }
  } else {
    console.error('urls is not an array');
  }

  urls.push({ url, mobile, email, last_status: null, last_time: null });
  saveUrls(urls);
  console.log(`Added URL: ${url}`);
};

const deleteUrl = (url) => {
  let urls = loadUrls();
  const initialLength = urls.length;
  urls = urls.filter((entry) => entry.url !== url);
  if (urls.length < initialLength) {
    saveUrls(urls);
    console.log(`Deleted URL: ${url}`);
  } else {
    console.log(`URL not found: ${url}`);
  }
};

// Function to send SMS
const sendSMS = async (url, mobile) => {
  try {
    let smsData = new FormData();
    smsData.append('project', smsNotificationUsername);
    smsData.append('from', smsNotificationFrom);
    smsData.append('to', mobile);
    smsData.append('campaign', 'URL Uptime Monitoring');
    smsData.append('channel', smsNotificationChannel);
    smsData.append('apiKey', smsNotificationKey);
    smsData.append('message', `${url} is not reachable`);
    smsData.append('type', smsNotificationType);

    let smsConfig = {
      method: 'post',
      maxBodyLength: Infinity,
      url: smsNotificationEndpoint,
      headers: { 
        'Accept': 'application/json', 
        'Content-Type': 'multipart/form-data', 
        ...smsData.getHeaders()
      },
      data: smsData
    };

    const smsResponse = await axios.request(smsConfig);
    console.log('SMS Response:', JSON.stringify(smsResponse.data));
  } catch (error) {
    console.error('Error sending SMS:', error.response ? error.response.data : error.message);
  }
};


// Function to send Email
const sendEmail = async (url, email) => {
  try {
    let emailData = new FormData();
    emailData.append('project', emailNotificationUsername);
    emailData.append('from', emailNotificationFrom);
    emailData.append('to', email);
    emailData.append('campaign', 'URL Uptime Monitoring');
    emailData.append('channel', emailNotificationChannel);
    emailData.append('apiKey', emailNotificationKey);
    emailData.append('message', `${url} is not reachable`);
    emailData.append('type', emailNotificationType);

    let emailConfig = {
      method: 'post',
      maxBodyLength: Infinity,
      url: emailNotificationEndpoint,
      headers: { 
        'Accept': 'application/json', 
        'Content-Type': 'multipart/form-data', 
        ...emailData.getHeaders()
      },
      data: emailData
    };

    const emailResponse = await axios.request(emailConfig);
    console.log('Email Response:', JSON.stringify(emailResponse.data));
  } catch (error) {
    console.error('Error sending Email:', error.response ? error.response.data : error.message);
  }
};

// Function to send notifications
const sendNotification = async (url, mobile, email) => {
  await sendSMS(url, mobile);
  await sendEmail(url, email);
};

// Function to check URLs
const checkUrls = async () => {
  const urls = loadUrls();
  const currentTime = new Date().toISOString().replace('T', ' ').substring(0, 19);
  for (const urlObj of urls) {
    const { url, mobile, email } = urlObj;
    try {
      const response = await axios.get(url);
      if (response.status === 200) {
        urlObj.last_status = 'Accessible';
      } else {
        urlObj.last_status = 'Inaccessible';
        await sendNotification(url, mobile, email);
      }
    } catch (error) {
      urlObj.last_status = 'Inaccessible';
      await sendNotification(url, mobile, email);
    }
    urlObj.last_time = currentTime;
  }
  saveUrls(urls);
};



// Schedule the URL checks every 1,2,5 etc minutes. change to suit your needs e.g. '*/5 * * * *' for every 5 minutes, etc.
cron.schedule('* * * * *', checkUrls);

// Serve HTML form and table
app.get('/', (req, res) => {
  const urls = loadUrls();
  let tableRows = '';
  function maskString(string) {
    return string.slice(0, 4).replace(/./g, '*') + string.slice(4);
  }
  urls.forEach(({ url, mobile, email, last_status, last_time }) => {
    tableRows += `
      <tr>
        <td>${url}</td>
        <td>${maskString(mobile)}</td>
        <td>${maskString(email)}</td>
        <td>${last_status ? last_status : 'Not checked yet'}</td>
        <td>${last_time ? last_time : 'Not checked yet'}</td>
      </tr>`;
  });

  res.send(`
    <h1>URL Uptime Monitor</h1>
    <p>Monitor URLs and receive notifications every 1 minutes via SMS or email when a URL is not accessible/reachable. Notifications are ONLY sent when URL is NOT reachable. ie. returns non 200 HTTP status code.
    You can add and delete URLs along with corresponding notification details via command-line arguments or an HTML form.</p>
    <p><b>Demo:</b> To see a live demo of this application, please visit URL Monitoring Demo <a href="https://url-uptime-monitor.onrender.com/">HERE</a></p>
    <p>Read installation instructions, download code, or comment on Github: <a href="https://github.com/lawrencekm/url-uptime-monitor">URL Uptime Monitor</a></p>
    <h3>Add URL</h3>
    <form action="/add" method="post">
      <label for="url">URL to monitor:</label><br>
      <input type="url" id="url" name="url" required><br>
      <label for="mobile">Mobile to notify:</label><br>
      <input type="tel" id="mobile" name="mobile" placeholder="254725111111,2547xx" required><br>
      <label for="email">Email to notify:</label><br>
      <input type="email" id="email" name="email" placeholder="law@gmail.com,far@yahoo.com" required><br><br>
      <input type="submit" value="Add URL to track">
    </form>

    <h3>Delete URL</h3>
    <form action="/delete" method="post">
      <label for="url">URL:</label><br>
      <input type="text" id="url" name="url" required><br><br>
      <input type="submit" value="Delete URL">
    </form>

    <h3>URL Status</h3>
    <table border="1">
      <tr>
        <th>URL</th>
        <th>Mobile</th>
        <th>Email</th>
        <th>Last Status</th>
        <th>Last Time Checked</th>
      </tr>
      ${tableRows}
    </table>

    <script>
      setInterval(() => {
        window.location.reload();
      }, 60000); // Refresh the page every 5 minutes
    </script>
  `);
});

// Handle form submission to add URL
app.post('/add', (req, res) => {
  const { url, mobile, email } = req.body;
  addUrl(url, mobile, email);
  res.send('URL added successfully');
});

// Handle form submission to delete URL
app.post('/delete', (req, res) => {
  const { url } = req.body;
  deleteUrl(url);
  res.send('URL deleted successfully');
});

const argv = yargs(hideBin(process.argv))
  .command('add', 'Add a URL', {
    url: {
      description: 'The URL to monitor',
      alias: 'u',
      type: 'string',
      demandOption: true,
    },
    mobile: {
      description: 'The mobile number for notifications',
      alias: 'm',
      type: 'string',
      demandOption: true,
    },
    email: {
      description: 'The email for notifications',
      alias: 'e',
      type: 'string',
      demandOption: true,
    },
  })
  .command('delete', 'Delete a URL', {
    url: {
      description: 'The URL to delete',
      alias: 'u',
      type: 'string',
      demandOption: true,
    },
  })
  .help()
  .alias('help', 'h')
  .argv;

if (argv._.includes('add')) {
  addUrl(argv.url, argv.mobile, argv.email);
  process.exit();
} else if (argv._.includes('delete')) {
  deleteUrl(argv.url);
  process.exit();
}

// When using web interface
const server = app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});


console.log('URL monitoring service is running...');
export { app, server }; // Export both the app and the server