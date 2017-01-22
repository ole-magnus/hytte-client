var request = require('request');
var fs = require('fs');
var logger = require('winston');

logger.add(logger.transports.File, { filename: 'logfile.log' });
logger.remove(logger.transports.Console);


var baseUrl = "http://192.168.0.11:3000/"
var pathNorth = "upload/north"
var pathWest = "upload/west"
var pathStatus = "status"

var timeInterval = 3600 * 1000;
var imageName = "lastImage.jpg"
var cmd0 = 'fswebcam -d /dev/video0 -r 1280x720 --jpeg 90 -D 3 -S 13 ' + imageName;
var cmd1 = 'fswebcam -d /dev/video1 -r 1280x720 --jpeg 90 -D 3 -S 13 ' + imageName;
var camera1 = "north";
var camera2 = "west";

startJob()

function startJob() {
  fireRequest();
  setInterval(function(){
    fireRequest();
  }, timeInterval);
}



function fireRequest() {
  request(
    { method: 'GET'
    , uri: url + pathStatus
    }
  , function (error, response, body) {

      if(!error) {
        if(body == "ON") {
          logger.log("info", "Received upload status: ON");
          snapPicture(cmd0, camera1, baseUrl+pathNorth);
        }
      } else {
  logger.log("error", "Error when uploading picture");
      }
  });
}

var exec = require('child_process').exec;



function snapPicture(cmd, camera, url) {
  exec(cmd, function(error, stfout, stderr) {
    logger.log("info", "Picture taken. CMD: " + cmd);
    postImage(__dirname + "/" + imageName, camera, url);
  });
}


function postImage(imagePath, camera, url) {
  var formData = {
    // Pass a simple key-value pair
    name: camera,

    file: fs.createReadStream(imagePath)
  };

  request.post({url: url, formData: formData}, function optionalCallback(err, httpResponse, body) {
    if (err) {
      return logger.log("error", "Error occured while uploading: " + err);
    }
    logger.log('info', 'Upload successful!  Server responded with:', body);
    if(camera == camera1) {
        logger.log("info", "Snapping from camera 2");
      snapPicture(cmd1, camera2, baseUrl+pathWest);
    }
   });

}