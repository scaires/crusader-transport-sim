// store.json
// synchronous version of https://github.com/alexkwolfe/json-fs-store

var fs = require('graceful-fs'),
    path = require('path'),
    uuid = require('node-uuid'),
    mkdirp = require('mkdirp');

module.exports = function(dir) {
  dir = dir || path.join(process.cwd(), 'store');

  return {

    // store in this directory

    dir: dir,

    // list all stored objects by reading the file system

    list: function() {
      var self = this;
      mkdirp.sync(dir);
      var files = readdir(dir);
      files = files.filter(function(f) { return f.substr(-5) === ".json"; });
      var fileObjs = files.map(function(f) {
        return loadFile(f);
      });
      sort(fileObjs);
      return fileObjs;
    },


    // store an object to file

    add: function(obj) {
      mkdirp.sync(dir);
      var json;
      obj.id = obj.id || uuid.v4();
      try {
        json = JSON.stringify(obj, null, 2);
      }
      catch (e) {
        return cb(e);
      }
      fs.writeFileSync(path.join(dir, obj.id + '.json'), json, 'utf8');
      return obj;
    },


    // delete an object's file

    remove: function(id, cb) {
      mkdirp.sync(dir);
      fs.unlinkSync(path.join(dir, id + '.json'));
    },


    // load an objsect from file

    load: function(id) {
      mkdirp.sync(dir)
      return loadFile(path.join(dir, id + '.json'));
    }

  }
};

var readdir = function(dir) {
  var files = fs.readdirSync(dir);
  files = files.map(function(f) {
    return path.join(dir, f);
  });
  return files;
};


var loadFile = function(f) {
  var code = fs.readFileSync(f, 'utf8');
  try {
    var jsonObj = JSON.parse(code);
  }
  catch (e) {
    console.log("Error parsing " + f + ": " + e);
  }
  return jsonObj;
};

var sort = function(objs) {
  objs.sort(function(obj1, obj2) {
    var nameA = obj1.name.toUpperCase() || ''; // ignore upper and lowercase
    var nameB = obj2.name.toUpperCase() || ''; // ignore upper and lowercase
    if (nameA < nameB) {
      return -1;
    }
    if (nameA > nameB) {
      return 1;
    }

    // names must be equal
    return 0;
  });
};