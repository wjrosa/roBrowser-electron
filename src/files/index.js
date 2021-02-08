const Path = require('path');

const dotenv = require('dotenv');

dotenv.config();

// Include library
const Client = require('./src/client');

module.exports = {
  init: () => {
    Client.path = '';
    Client.data_ini = process.env.CLIENT_RESPATH + process.env.CLIENT_DATAINI;
    Client.autoExtract = process.env.CLIENT_AUTOEXTRACT;

    // Initialize client
    Client.init();
  },
  get: (req, res) => {
    // Get file
    const ext = Path.extname(req.query.filename).toLowerCase().replace('.', '');
    const file = Client.getFile(req.query.filename);

    // File not found, end.
    if (!file) {
      console.log('Failed, file not found...', 'error');
      res.status(404);
      return res.send('File not found');
    }

    console.log('Success!', 'success');

    res.status(200);
    res.set('Cache-Control', 'max-age=2592000, public');

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
    return res.end(file);
  },
};
