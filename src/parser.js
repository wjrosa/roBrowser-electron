const express = require('express');
const server = express();
const port = 5737;

const dotenv = require('dotenv');

dotenv.config();

const parser = require('./files');

// Handle game files
server.get('/remote', (req, res) => parser.get(req, res));
server.post('/remote', (req, res) => parser.post(req, res));

server.listen(port, () => {
  console.log(`parser is listening on port ${port}`);
});
