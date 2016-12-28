var https = require('https');
var fs = require('fs');

var profileToLoad = '';
// print process.argv
process.argv.forEach(function (val, index, array) {
  if (val.indexOf('profile') >= 0) {
    if (val.indexOf('=') > 0) {
      profileToLoad = '.' + (val.split('=')[1]);
    } else if (index < (process.argv.length -1)) {
      profileToLoad = '.' + (process.argv[index + 1]);
    }
  }
});

console.log('Loading config profile: ' + (profileToLoad !== '' ? profileToLoad : 'Default'));
var config = require('./config' + profileToLoad);

var providerLibraries = [];

for (var providerIndex in config.providers) {
  var provName = config.providers[providerIndex].name;
  console.log('Loading provider: ' + provName);
  providerLibraries[provName] = require('./Providers/' + provName + '.js');
  console.log('Loaded!');
}

function getProvider (provName) {
  for (var provIndex in config.providers) {
    if (config.providers[provIndex].name === provName)
      return config.providers[provIndex];
  }
  return null;
}

var downloadTrailIndex = -1;

if (!fs.existsSync(config.musicDir)) {
  fs.mkdirSync(config.musicDir);
}

var helperFunctions = {
  getFilenameForTrack: function (trackTitle, specialDir, extension) {
    var cleaned = ""+trackTitle;
    
    console.log('Cleaning: ' + trackTitle);
    
    for (var cl = 0; cl < 4; cl++) {
      cleaned = cleaned.replace("'", "`")
                              .replace('"', "`")
                              .replace('*', "_")
                              .replace(':', "_")
                              .replace('<', "_")
                              .replace('>', "_")
                              .replace('?', "_")
                              .replace('\\', "_")
                              .replace('/', "_")
                              .replace('|', "_")
    }
    
    console.log('Cleaned: ' + cleaned);
    
    var trackDir = config.musicDir + '/';
    
    if (specialDir !== null && specialDir !== '') {
      trackDir += specialDir + '/';
    }
    
    if (!fs.existsSync(trackDir)) {
      fs.mkdirSync(trackDir);
    }
    
    return trackDir + cleaned + '.' + extension;
  },
  fs: fs,
  https: https
};

function doInit () {
  downloadTrailIndex++;
  console.log('Now init @' + downloadTrailIndex);
  if (downloadTrailIndex >= config.downloads.length)
  {
    console.log('FINISHED!');
    return;
  }
  
  var download = config.downloads[downloadTrailIndex];
  
  providerLibraries[download.provider].startDownload(download, getProvider(download.provider).options, helperFunctions, doInit);
}

doInit();