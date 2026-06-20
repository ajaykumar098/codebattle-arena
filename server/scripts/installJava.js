const http = require('http');

async function installJava() {
  const data = JSON.stringify({
    language: 'java',
    version: '15.0.2'
  });

  const options = {
    hostname: 'localhost',
    port: 2000,
    path: '/api/v2/packages',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': data.length
    }
  };

  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        console.log('Response:', body);
        resolve(body);
      });
    });

    req.on('error', (error) => {
      console.error('Error:', error.message);
      reject(error);
    });

    req.write(data);
    req.end();
  });
}

installJava();
