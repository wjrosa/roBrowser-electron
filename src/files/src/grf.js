const Fs = require('fs');

module.exports = {
    /**
     * @var {string} fileTable binary
     */
    fileTable: '',


    /**
     * @var {Array} file header
     */
    header: [],


    /**
     * @var {boolean} is file loaded
     */
    loaded: false,


    /**
     * @var {fp}
     */
    fp: null,


    /**
     * @var {string} filename
     */
    filename: '',


    /**
     * @var {const} header size
     */
    HEADER_SIZE: 46,


    /**
     * Constructor, open the filename if specify
     *
     * @param {string} filename optional filename
     */
    init: (filename = '') => {
        if (filename) {
            this.open(filename);
        }
    },


    /**
     * Clean up memory
     */
    end: () => {
        if (this.fp && is_resource(this.fp)) {
            fclose(this.fp);
        }
    },

    /**
     * Open a file
     *
     * @param {string} filename file path
     */
    open: (filename ) => {
        try {
            Fs.existsSync(filename) && Fs.accessSync(filename, Fs.constants.R_OK);
        } catch (err) {
            Debug.write('Can\'t open GRF file "' + filename + '"', 'error');
            return;
        }

        if (filesize(filename) < this.HEADER_SIZE) {
            Debug.write('Not enough data in GRF "' + filename + '" to contain a valid header', 'error');
            return;
        }

        // Open it
        this.fp = fopen( filename, 'r' );
    },

    /**
     * Load the GRF
     */
    load: () => {
        if (empty(this.fp)) {
            Debug.write('File "' + this.filename + '" not opened yet', 'error');
            return;
        }

        // Parse header.
        this.header = unpack("a15signature/a15key/Ltable_offset/Lseeds/Lfilecount/Lversion", fread(this.fp, this.HEADER_SIZE) );

        if (this.header.signature !== 'Master of Magic' || this.header.version !== 0x200) {
            Debug.write('Invalid GRF version "' + this.filename + '". Can\'t opened it', 'error');
            return;
        }

        // Load table list
        fseek( this.fp, this.header.table_offset, SEEK_CUR);
        fileTableInfo   = unpack("Lpack_size/Lreal_size", fread(this.fp, 0x08));
        this.fileTable = gzuncompress( fread( this.fp, fileTableInfo.pack_size ), fileTableInfo.real_size );

        // Extraction error
        if (this.fileTable === false) {
            Debug.write('Can\t extract fileTable in GRF "' + this.filename + '"', 'error');
            return;
        }

        // Grf now loaded
        this.loaded = true;
    },

    /**
     * Search a filename
     *
     * @param {string} filename
     */
    getFile: (filename) => {
        if (!this.loaded) {
            return false;
        }

        // Case sensitive. faster
        let position = strpos( this.fileTable, filename + "\0");

        // Not case sensitive, slower...
        if (position === false){
            position = stripos( this.fileTable, filename + "\0");
        }

        // File not found
        if (position === false) {
            Debug.write('File not found in ' + this.filename);
            return false;
        }

        // Extract file info from fileList
        position += strlen(filename) + 1;
        const fileInfo  = unpack('Lpack_size/Llength_aligned/Lreal_size/Cflags/Lposition', substr(this.fileTable, position, 17) );

        // Just open file.
        if (fileInfo.flags !== 1) {
            Debug.write('Can\'t decrypt file in GRF ' + this.filename);
            return false;
        }

        // Extract file
        fseek( this.fp, fileInfo.position + this.HEADER_SIZE, SEEK_SET );
        const content = gzuncompress( fread(this.fp, fileInfo.pack_size), fileInfo.real_size );

        Debug.write('File found and extracted from ' + this.filename, 'success');

        return content;
    },

    /**
     * Filter
     * Find all occurences of a string in GRF list
     *
     * @param {string} regex
     */
    search: (regex) => {
        let list = [];
        preg_match_all( regex, this.fileTable, matches );

        if (!empty(matches)) {
            list = matches[0];
            sort(list);
        }

        return list;
    }
}