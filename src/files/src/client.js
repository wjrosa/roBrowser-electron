const Fs = require('fs');
const Path = require('path');
const Ini = require('ini');
const Pathinfo = require('pathinfo');

const { Ksort } = require('./helpers');

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
    const dataIni = Ini.parse(Fs.readFileSync(path, 'utf-8').toString());
    let GRFs = [];
    const info = Pathinfo(path);

    const keys = Object.keys(dataIni);
    const index = keys.map(v => v.toLowerCase())
      .find(v => v === 'data');

    if (index === false) {
      console.log(`Can't find token "[Data]" in "${path}".`, 'error');
      return;
    }

    GRFs = dataIni[keys[index]];
    GRFs = Ksort(GRFs);

    console.log(`File ${path} loaded.`, 'success');
    console.log('GRFs to use :', 'info');

    // Open GRFs files
    GRFs.forEach((grfFilename, i) => {
      console.log(`${i}) ${info.dirname}/${grfFilename}`);

      this.grfs[i] = new Grf(`${info.dirname}/${grfFilename}`);
      this.grfs[i].filename = grfFilename;
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

    console.log(`Searching file ${path}...`, 'title');

    // Read data first
    if (Fs.existsSync(localPath) && !Fs.lstatSync(localPath).isDirectory()) {
      try {
        Fs.accessSync(localPath, Fs.constants.R_OK);

        console.log(`File found at ${localPath}`, 'success');

        // Store file
        if (this.autoExtract) {
          return this.store(path, Fs.readFileSync(localPath).toString());
        }
        return Fs.readFileSync(localPath).toString();
      } catch (err) {
        console.log(`File not found at ${localPath}`);

        this.grfs.forEach((grf) => {
          // Load GRF just if needed
          if (!grf.loaded) {
            console.log(`Loading GRF: ${grf.filename}`, 'info');
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
};
