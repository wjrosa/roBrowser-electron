const Utf8 = require('utf8');
const Path = require('path');

const dotenv = require('dotenv');
dotenv.config();

// Include library
const Client = require('./src/client');

module.exports = {
    init: () => {
        Client.path =  '';
        Client.data_ini =  process.env.CLIENT_RESPATH + process.env.CLIENT_DATAINI;
        Client.autoExtract =  process.env.CLIENT_AUTOEXTRACT;

        // Initialize client
        Client.init();
    },
    get: (req, res) => {
        // Get file
        const ext = Path.extname(req.query.filename).toLowerCase();
        const file = Client.getFile(req.query.filename);

        // File not found, end.
        if (!file) {
            console.log('Failed, file not found...', 'error');
            return;
        }

        console.log('Success !', 'success');

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
        res.send(file);
    },

    post: (req, res) => {
        /**
         * SEARCH ACCESS
         * This features is only used in map/rsm/str/grf viewer
         * If you are not using them, you can comment this block
         */
        if (req.body.filter && typeof req.body.filter == 'string') {
            const filter = req.body.filter;
            if (!process.env.CLIENT_ENABLESEARCH) {
                return;
            }
            const decodedFilter = Utf8.decode('/' + filter + '/i');
            const list = Client.search(decodedFilter);
            return res.send(list.join("\n"));
        }
    },
};
