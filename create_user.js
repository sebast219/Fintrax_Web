const http = require('http');

const postData = JSON.stringify({
  email: "sebayepa219@gmail.com",
  password: "Sebast2190.",
  firstName: "Sebastian",
  lastName: "Test"
});

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/v1/auth/signup',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData)
  }
};

const req = http.request(options, (res) => {
  console.log(`Status: ${res.statusCode}`);
  console.log(`Headers: ${JSON.stringify(res.headers)}`);
  res.setEncoding('utf8');
  res.on('data', (chunk) => {
    console.log(`Body: ${chunk}`);
  });
  res.on('end', () => {
    console.log('No more data in response.');
  });
});

req.on('error', (e) => {
  console.error(`Problem with request: ${e.message}`);
});

req.write(postData);
req.end();
