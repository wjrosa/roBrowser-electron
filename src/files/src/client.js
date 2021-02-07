const Fs = require('fs');
const Path = require('path');
const Ini = require('ini');
const Pathinfo = require('pathinfo');
const Utf8 = require('utf8');
const Jimp = require('jimp');

const { Ksort, Imagecreatefrombmpstring } = require('./helpers');

/**
 * @fileoverview Client - File Manager
 * @author Vincent Thibault (alias KeyWorld - Twitter: @robrowser)
 * @version 1.5.1
 */
module.exports = {
  path: Path.join(__dirname, '..'),
  data_ini: '',
  grfs: [],
  autoExtract: false,

  init() {
    if (this.data_ini) {
      console.log('No DATA.INI file defined in configs ?');
      return;
    }

    const path = this.path + this.data_ini;

    if (!Fs.existsSync(path)) {
      console.log(`File not found: ${path}`, 'error');
      return;
    }

    try {
      Fs.accessSync(path, Fs.constants.R_OK);
    } catch (err) {
      console.log(`Can't read file: ${path}`, 'error');
      return;
    }

    // Setup GRF context
    const data_ini = Ini.parse(Fs.readFileSync(path, 'utf-8')
      .toString());
    let grfs = [];
    const info = Pathinfo(path);

    const keys = Object.keys(data_ini);
    const index = keys.map(v => v.toLowerCase())
      .find(v => v === 'data');

    if (index === false) {
      console.log(`Can't find token "[Data]" in "${path}".`, 'error');
      return;
    }

    grfs = data_ini[keys[index]];
    grfs = Ksort(grfs);

    console.log(`File ${path} loaded.`, 'success');
    console.log('GRFs to use :', 'info');

    // Open GRFs files
    grfs.forEach((grf_filename, index) => {
      console.log(`${index}) ${info.dirname}/${grf_filename}`);

      this.grfs[index] = new Grf(`${info.dirname}/${grf_filename}`);
      this.grfs[index].filename = grf_filename;
    });
  },

  /**
   * Get a file from client, search it on data folder first and then on grf
   *
   * @param {string} path file path
   * @return {string|boolean} success
   */
  getFile(path) {
    const localPath = this.path + path.split('/').join('\\');
    const localPathEncoded = Utf8.encode(localPath);

    console.log(`Searching file ${path}...`, 'title');

    // Read data first
    if (Fs.existsSync(localPathEncoded) && !Fs.lstatSync(localPathEncoded).isDirectory()) {
      try {
        Fs.accessSync(localPathEncoded, Fs.constants.R_OK);

        console.log(`File found at ${localPath}`, 'success');

        // Store file
        if (this.autoExtract) {
          return this.store(path, Fs.readFileSync(localPathEncoded).toString());
        }
        return Fs.readFileSync(localPathEncoded).toString();
      } catch (err) {
        console.log(`File not found at ${localPath}`);

        this.grfs.forEach((grf) => {
          // Load GRF just if needed
          if (!grf.loaded) {
            console.log('Loading GRF: '.grf.filename, 'info');
            grf.load();
          }

          // If file is found
          const content = grf.getFile(localPath);
          if (content !== false) {
            if (this.autoExtract) {
              return this.store(path, content);
            }
          }
          return content;
        });
      }
    }
    return false;
  },

  /**
   * Storing file in data folder (convert it if needed)
   *
   * @param {string} path save to path
   * @param {string} content file content
   * @return {string} content
   */
  store(path, content) {
    let encodedPath = Utf8.encode(path);
    const current_path = this.path;
    const local_path = current_path + encodedPath.replace('\\', '/');
    const parent_path = local_path.replace(/[^\/]+$/, '');

    if (!Fs.existsSync(parent_path)) {
      if (!Fs.mkdirSync(parent_path, { recursive: true })) {
        console.log(`Can't build path ${parent_path}, need write permission ?`, 'error');
        return content;
      }
    }

    try {
      Fs.accessSync(parent_path, Fs.constants.R_OK);
    } catch (err) {
      console.log(`Can't write file to ${parent_path}, need write permission.`, 'error');
      return content;
    }

    // storing bmp images as png
    if (Pathinfo(encodedPath)
      .extname
      .toLowerCase() === 'bmp') {
      const bmpImage = Imagecreatefrombmpstring($content);
      encodedPath = local_path.replace(/.bmp|.BMP/g, '.png');
      Jimp.read(bmpImage, (err, image) => {
        if (err) {
          console.log(`Can't read image file on ${content}`, 'error');
          return;
        }
        image.write(encodedPath);
      });
      return Fs.readFileSync(encodedPath)
        .toString();
    }

    // Saving file
    Fs.writeFileSync(local_path, content);
    return content;
  },

  /**
   * Search files (only work in GRF)
   *
   * @param {string} filter regex
   * @return {Array} file list
   */
  search(filter) {
    let out = [];

    this.grfs.forEach((grf) => {
      // Load GRF only if needed
      if (grf.loaded) {
        grf.load();
      }

      // Search
      const list = grf.search(filter);

      // Merge
      out = [...new Set([...out, ...list])];
    });

    return out;
  },
};
