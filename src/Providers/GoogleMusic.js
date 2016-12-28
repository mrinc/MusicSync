var provider = {};

var PlayMusic = require('playmusic');
var pm = new PlayMusic();

function _downloadURL(track) {
  var trackFile = provider._helperFunctions.getFilenameForTrack(track.title, _workingDir, 'mp3');
  try {
    provider._helperFunctions.fs.accessSync(trackFile, provider._helperFunctions.fs.F_OK);
    // Do something
    
    //check filesize
    var stats = provider._helperFunctions.fs.statSync(trackFile);
    var fileSizeInBytes = stats["size"];
    //Convert the file size to megabytes (optional)
    var fileSizeInMegabytes = fileSizeInBytes / 1000000.0;
    console.log('Existing filesize: ' + fileSizeInMegabytes + 'Mb');
    if (fileSizeInMegabytes >= 5) {
      console.log(track.title + " is already locally stored, we will ignore");
      _startDownloadTrail(false);
      return;
    }    
  } catch (e) {
    if (e.code == 'ENOENT') {
      console.log(track.title + " doesn't exist, lets download");
    } else {
      console.log('File isn`t accessable... something went wrong');
      console.log(e);
      return;
    }
  }
  
  try {
    pm.getStreamUrl((_trackData[_workingCounter].id || _trackData[_workingCounter].nid), function(err, resp) {
      console.log(track.title + " Got stream - ");
      
      var file = provider._helperFunctions.fs.createWriteStream(trackFile);
      var request = provider._helperFunctions.https.get(resp, function (response) {
        try {
          response.pipe(file);
          console.log('Saved file: ' + track.title + '.mp3');
        } catch (e) {
          console.log('Well fk , pipe couldnt download ' + track.title);
        }
      });
      console.log('Created file: ' + track.title + '.mp3');
      _startDownloadTrail(true);
    });
  } catch (e) {
    console.log('Well cheese crackers, we couldnt download ' + track.title);
    console.log(e);
    provider._helperFunctions.fs.writeFile(trackFile, "", function(err) {});
    _startDownloadTrail(true);
  }
}

function _startDownloadTrail(requireWait) {
  _workingCounter++;

  if (_trackData == null || _workingCounter >= _trackData.length) {      
    console.log('Partial Sync Complete!');
    setTimeout(_getDownloadInfoAndStartDownloads, 100);
    return;
  }

  var timoutHere = requireWait ? 80000 : 10;
  console.log('Set timeout : [' + _workingCounter + ']@' + timoutHere + ' ' + _trackData[_workingCounter].title + ' #' + (_trackData[_workingCounter].id || _trackData[_workingCounter].nid));
  setTimeout(function () {
    console.log('Run timeout : [' + _workingCounter + '] ' + _trackData[_workingCounter].title + ' #' + (_trackData[_workingCounter].id || _trackData[_workingCounter].nid));
    _downloadURL(_trackData[_workingCounter]);
  }, timoutHere);
}

var _workingCounter = -1;
var _workingStationCounter = -1;
var _workingDir = '';
var _trackData = [];

function _getDownloadInfoAndStartDownloads () {
  _workingStationCounter++;
  
  if (_workingStationCounter >= provider._stations.length) {
    console.log('Google Music Complete!');
    provider._callback();
    return;
  }
  
  var station = provider._stations[_workingStationCounter];
  _workingDir = station.folder || '';
  
  switch (station.type) {
    case 'favourites': {
      console.log('Get Favs');
      pm.getFavorites(function (err, data) {
        _trackData = data.track;
        console.log('Found ' + _trackData.length + ' favs');
          if (_trackData.length > 0) {
            _startDownloadTrail(false);
          }
      });
    }
    break;
    case 'station': {
      console.log('Get Station: ' + station.id);
      pm.getStationTracks(station.id, 20000, function (err, data) {
        if (err)
          return console.log("Eish! " + data.error.message);
        _trackData = (data.data.stations[0].tracks);
        console.log('Found ' + _trackData.length + ' favs');
          if (_trackData.length > 0) {
            _startDownloadTrail(false);
          }
      });
    }
    break;
  }
}

provider.startDownload = function (download, options, helperFunctions, callback) {
  provider._callback = callback;
  provider._helperFunctions = helperFunctions;
  provider._options = options;
  provider._stations = download.stations;
  
  console.log('Init GoogleMusic');
  pm.init(options, function (err) {
    console.log('Authed?');
    if (err) console.error(err);
    console.log('Yes');
    _getDownloadInfoAndStartDownloads();
  });
}

module.exports = provider;