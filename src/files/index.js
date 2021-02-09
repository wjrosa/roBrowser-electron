const Path = require('path');

const dotenv = require('dotenv');

dotenv.config();

// Include library
const Client = require('./src/client');

module.exports = {
  get: (req, res) => {
    // Get file
    const ext = Path.extname(req.query.filename).toLowerCase().replace('.', '');
    const file = Client.getFile(req.query.filename);

    // File not found, end.
    if (!file) {
      console.error('Failed, file not found...');
      return res.status(404).send('File not found');
    }

    console.log('Success!');

    res.set('Cache-Control', 'max-age=3600, public');

    // Display appropriate header
    switch (ext) {
      case 'jpg':
      case 'jpeg':
        res.set('Content-Type', 'image/jpeg');
        break;
      case 'bmp':
        res.set('Content-Type', 'image/bmp');
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
