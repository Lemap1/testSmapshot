const https = require('https');

const options = {
  hostname: 'smapshot.heig-vd.ch',
  path: '/api/v1/images/223587/attributes/?lang=fr',
  method: 'GET'
};

const req = https.request(options, res => {
  let data = '';
  res.on('data', chunk => {
    data += chunk;
  });
  res.on('end', () => {
    console.log(data);
  });
});

req.on('error', error => {
  console.error(error);
});

req.end();
