import chai from 'chai';
import chaiHttp from 'chai-http';
import fs from 'fs';
import { exec } from 'child_process';
import { fileURLToPath } from 'url';
import path from 'path';

chai.should();
chai.use(chaiHttp);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const urlsPath = path.join(__dirname, '../urls.json');

let server;
const testPort = 3001; // Use a different port for testing

describe('URL Monitoring Application', () => {
  before(async () => {
    process.env.PORT = testPort; // Set the test port
    const importedModule = await import('../server.mjs');
    server = importedModule.server;
  });

  after(() => {
    server.close(); // Ensure the server is closed after tests
  });

  // Clean up the urls.json file before each test
  beforeEach((done) => {
    fs.writeFileSync(urlsPath, JSON.stringify([]));
    done();
  });

  describe('GET /', () => {
    it('should get the home page', (done) => {
      chai.request(server)
        .get('/')
        .end((err, res) => {
          res.should.have.status(200);
          res.text.should.include('Add URL');
          res.text.should.include('Delete URL');
          res.text.should.include('URL Status');
          done();
        });
    });
  });

  describe('POST /add', () => {
    it('should add a URL', (done) => {
      chai.request(server)
        .post('/add')
        .type('form')
        .send({
          url: 'https://example.com',
          mobile: '1234567890',
          email: 'example@example.com'
        })
        .end((err, res) => {
          res.should.have.status(200);
          res.text.should.equal('URL added successfully');
          const urls = JSON.parse(fs.readFileSync(urlsPath));
          urls.should.be.a('array');
          urls.length.should.equal(1);
          urls[0].should.have.property('url').equal('https://example.com');
          urls[0].should.have.property('mobile').equal('1234567890');
          urls[0].should.have.property('email').equal('example@example.com');
          urls[0].should.have.property('last_status').equal(null);
          urls[0].should.have.property('last_time').equal(null);
          done();
        });
    });
  });

  describe('POST /delete', () => {
    it('should delete a URL', (done) => {
      // First add a URL
      const urls = [
        {
          url: 'https://example.com',
          mobile: '1234567890',
          email: 'example@example.com',
          last_status: null,
          last_time: null
        }
      ];
      fs.writeFileSync(urlsPath, JSON.stringify(urls));

      chai.request(server)
        .post('/delete')
        .type('form')
        .send({ url: 'https://example.com' })
        .end((err, res) => {
          res.should.have.status(200);
          res.text.should.equal('URL deleted successfully');
          const urls = JSON.parse(fs.readFileSync(urlsPath));
          urls.should.be.a('array');
          urls.length.should.equal(0);
          done();
        });
    });
  });

  describe('Command-line arguments', () => {
    it('should add a URL via command-line', (done) => {
      exec(`node server.mjs add --url "https://example-cli.com" --mobile "9876543210" --email "cli@example.com"`, (err, stdout, stderr) => {
        if (err) {
          console.error(`exec error: ${err}`);
          return;
        }
        const urls = JSON.parse(fs.readFileSync(urlsPath));
        urls.should.be.a('array');
        urls.length.should.equal(1);
        urls[0].should.have.property('url').equal('https://example-cli.com');
        urls[0].should.have.property('mobile').equal('9876543210');
        urls[0].should.have.property('email').equal('cli@example.com');
        urls[0].should.have.property('last_status').equal(null);
        urls[0].should.have.property('last_time').equal(null);
        done();
      });
    });

    it('should delete a URL via command-line', (done) => {
      // First add a URL
      const urls = [
        {
          url: 'https://example-cli.com',
          mobile: '9876543210',
          email: 'cli@example.com',
          last_status: null,
          last_time: null
        }
      ];
      fs.writeFileSync(urlsPath, JSON.stringify(urls));

      exec(`node server.mjs delete --url "https://example-cli.com"`, (err, stdout, stderr) => {
        if (err) {
          console.error(`exec error: ${err}`);
          return;
        }
        const urls = JSON.parse(fs.readFileSync(urlsPath));
        urls.should.be.a('array');
        urls.length.should.equal(0);
        done();
      });
    });
  });
});
