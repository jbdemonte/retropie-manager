var fs = require('fs');

/**
 * Merge a host config with the systems
 * @param {string} host
 * @return {object}
 */
function merge(host) {
  var mod = require('./hosts/' + host + '.json');
  var result = {host: host, path: mod.path};

  // build a systems list based on
  result.systems = require('./systems')
    .map(function (system) {
      var hsys = mod.systems[system.id];
      if (hsys) {
        return Object.assign({}, system, typeof hsys === 'object' ? hsys : {});
      }
    })
    .filter(function (system) {
      return system;
    })
    .map(function (system) {
      if (system.bios) {
        system.bios = Object.keys(system.bios).map(function (md5) {
          var item = system.bios[md5];
          var isObject = typeof item === 'object';
          var data = {
            md5: md5.toLowerCase(),
            file: isObject ? item.file : item,
            path: isObject ? (item.path || '').replace('$(ROMS)', mod.path.roms) : mod.path.roms
          };
          // remove trailing /
          data.path = data.path.replace(/\/+$/, '');
          Object.freeze(data);
          return data;
        });
      }

      Object.freeze(system);
      return system;
    });

  Object.freeze(result);
  return result;
}

/*
   RetroPie
   Based on https://github.com/RetroPie/RetroPie-Setup/blob/master/platforms.cfg
 */
try {
  fs.statSync('/home/pi/RetroPie');
  module.exports = merge('RetroPie');
  return ;
} catch (err) {}


/*
 Recalbox
 Based on https://github.com/recalbox/recalbox-manager/blob/recalbox-4.1.x/project/MANIFEST.xml
 */
try {
  fs.statSync('/recalbox/');
  module.exports = merge('Recalbox');
  return ;
} catch (err) {}

/*
 Lakka
 Based on http://www.lakka.tv/doc/Hardware-support/
 */
try {
  if (fs.readFileSync('/etc/distribution') === 'Lakka') {
    module.exports = merge('Lakka');
    return ;
  }
} catch (err) {}


/*
 User default
 */
try {
  module.exports = merge('default');
  return ;
} catch (err) {}


module.exports = {};