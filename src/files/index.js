const Path = require('path');

const dotenv = require('dotenv');

dotenv.config();

// Include library
const Client = require('./src/client');

module.exports = {
  // Get file
  get: (req, res) => {
    let filename = req.query.filename;

    // Replace login background
    if (Path.basename(filename) === 'bgi_temp.bmp') {
      filename = filename.replace('bmp', 'png');
    }
    const file = Client.getFile(filename);

    // File not found, end.
    if (!file) {
      console.error('Failed, file not found...');
      return res.status(404).send('File not found');
    }

    console.log('Success!');

    res.set('Cache-Control', 'no-cache');

    // Display appropriate header
    const ext = Path.extname(filename).toLowerCase().replace('.', '');
    switch (ext) {
      case 'jpg':
      case 'jpeg':
        res.set('Content-Type', 'image/jpeg');
        break;
      case 'bmp':
        res.set('Content-Type', 'image/bmp');
        break;
      case 'png':
        res.set('Content-Type', 'image/png');
        break;
      case 'gif':
        res.set('Content-Type', 'image/gif');
        break;
      case 'xml':
        res.set('Content-Type', 'application/xml');
        break;
      case 'txt':
        res.set('Content-Type', 'text/plain');
        break;
      case 'mp3':
        res.set('Content-Type', 'audio/mp3');
        break;
      default:
        res.set('Content-Type', 'application/octet-stream');
        break;
    }
    return res.status(200).send(file);
  },
};
