const fs = require('fs');
const path = require('path');

const storageDirectoryPath = path.join(__dirname, '../..', 'storage');
const backupDirectoryPath = path.join(storageDirectoryPath, 'backups');

const containerNames = ['storage', 'guildsettings', 'usersettings'];

const containers = [];

containerNames.forEach(name => {
    containers.push({
        name: name,
        file_old: path.join(storageDirectoryPath, name + '.json'),
        files: [path.join(storageDirectoryPath, name + '0.json'), path.join(storageDirectoryPath, name + '1.json')],
        flip: 0,
    });
    // Used for permanent storage
    exports[containerNames[name]] = {};
});

/**
 * Load all data files.
 * Uses the newer one of the two files or,
 * if one is corrupted, the working one.
 */
function load() {
    fs.mkdirSync(storageDirectoryPath, { recursive: true });
    containers.forEach(container => {
        if (!fs.existsSync(container.files[0])) fs.writeFileSync(container.files[0], '{}');
        if (!fs.existsSync(container.files[1])) fs.writeFileSync(container.files[1], '{}');

        if (fs.existsSync(container.file_old)) {
            // Move old storage.json file over to the new storage0 and storage1 alternating system
            exports.storage = JSON.parse(fs.readFileSync(container.file_old).toString(), reviver);
            save();
            fs.unlinkSync(container.file_old);
            return;
        }

        // Attempt reading both files, treat as empty with timestamp 0 on error
        let st0;
        let st1;
        try {
            st0 = JSON.parse(fs.readFileSync(container.files[0]).toString(), reviver);
        }
        catch (error) {
            st0 = { timestamp: 0 };
        }
        try {
            st1 = JSON.parse(fs.readFileSync(container.files[1]).toString(), reviver);
        }
        catch (error) {
            st1 = { timestamp: 0 };
        }
        // Use the newer one of the two files
        if (st0.timestamp > st1.timestamp) {
            exports[container.name] = st0;
            container.flip = 1;
        }
        else {
            exports[container.name] = st1;
            container.flip = 0;
        }
    });
}

/**
 * Save data to file.
 * Uses two files alternating between them in
 * case the process gets killed or the bot crashes
 * during the writing process.
 * @param {String} name
 */
function save(name) {
    fs.mkdirSync(storageDirectoryPath, { recursive: true });
    const container = containers.find(c => c.name == name);
    exports[container.name].timestamp = Date.now();
    fs.writeFileSync(container.files[container.flip], JSON.stringify(exports[container.name], replacer));
    if (container.flip == 0) {
        container.flip = 1;
    }
    else {
        container.flip = 0;
    }
}

/**
 * Create a backup of the current data.
 */
function backup() {
    fs.mkdirSync(backupDirectoryPath, { recursive: true });
    containers.forEach(container => {
        exports[container.name].timestamp = Date.now();
        const date = new Date();
        const options = { hour12: false, hour: 'numeric', minute: 'numeric', second: 'numeric' };
        fs.writeFileSync(path.join(backupDirectoryPath, container.name + date.toLocaleDateString('en-US', options).replace(/[ ,\\/:-]/g, '_') + '.json'), JSON.stringify(exports[container.name], replacer));
    });
}

/**
 * Creates a storage dump.
 * @returns {Map<String,String>} File name matching stringified JSON data.
 */
function createDump() {
    const ret = new Map();
    containers.forEach(container => {
        ret.set(container.name, JSON.stringify(exports[container.name], replacer));
    });
    return ret;
}

/**
 * Utility function to delete an element from an array
 * @param {*} array 
 * @param {*} element 
 */
function deleteFromArray(array, element) {
    const index = array.indexOf(element);
    if (index > -1) {
        array.splice(index, 1);
    }
}

/**
 * Replacer Function to support storing Map objects
 */
function replacer(key, value) {
    if (value instanceof Map) {
        return {
            dataType: 'Map',
            value: Array.from(value.entries()),
        };
    }
    else {
        return value;
    }
}

/**
 * Reviver Function to support loading Map objects
 */
function reviver(key, value) {
    if (typeof value == 'object' && value != null) {
        if (value.dataType == 'Map') {
            return new Map(value.value);
        }
    }
    return value;
}

exports.load = load;
exports.save = save;
exports.backup = backup;
exports.createDump = createDump;
exports.deleteFromArray = deleteFromArray;
