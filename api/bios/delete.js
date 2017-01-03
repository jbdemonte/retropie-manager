var fs = require('fs');
var path = require('path');
var tools = require('../../server/tools');
var config = require('../../config.json');

module.exports = function (req, res) {

  var promises = (Array.isArray(req.body.files) ? req.body.files : []).map(function (file) {
    // check requested file is in the bios path
    var filePath = path.resolve(config.path.bios + '/' + file);
    if (filePath.indexOf(config.path.bios) === 0) {
      return new Promise(function (resolve, reject) {
        fs.unlink(filePath, function (err) {
          if (err) {
            return reject(err);
          }
          resolve();
        });
      });
    } else {
      return Promise.reject(new Error('Unknown file ' + file));
    }
  });

  Promise
    .all(promises)
    .then(function () {
      res.send({});
    })
    .catch(function (err) {
      res.status(400).send({error: err ? err.message : 'Unknown error'});
    });
};