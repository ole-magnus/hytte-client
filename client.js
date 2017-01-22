var request = require('request');
var fs = require('fs');
var logger = require('winston');

logger.add(logger.transports.File, { filename: 'logfile.log' });
logger.remove(logger.transports.Console);

var timeInterval = 3600 * 1000;
var imageName = "lastImage.jpg"
var cmd0 = 'fswebcam -d /dev/video0 -r 1280x720 --jpeg 90 -D 3 -S 13 ' + imageName;
var cmd1 = 'fswebcam -d /dev/video1 -r 1280x720 --jpeg 90 -D 3 -S 13 ' + imageName;
var camera1 = "1stCamera";
var camera2 = "2ndCamera";

request(
    { method: 'GET'
    , uri: 'http://178.62.193.16:8080/upload/interval'
    }
  , function (error, response, body) {

      if(!error) {
        //timeInterval = parseInt(body) * 1000;
	logger.log("info", "TimeInterval is set to " + timeInterval);
	startJob();
      }
    });

function startJob() {
	fireRequest();
	setInterval(function(){
	  fireRequest();
	}, timeInterval);
}



function fireRequest() {
  request(
    { method: 'GET'
    , uri: 'http://178.62.193.16:8080/upload/status'
    }
  , function (error, response, body) {

      if(!error) {
        if(body == "ON") {
          logger.log("info", "Received upload status: ON");
          snapPicture(cmd0, camera1);
        }
      } else {
	logger.log("error", "Error when uploading picture");
    	}
	});
}

var exec = require('child_process').exec;



function snapPicture(cmd, camera) {
  exec(cmd, function(error, stfout, stderr) {
    logger.log("info", "Picture taken. CMD: " + cmd);
    postImage(__dirname + "/" + imageName, camera);
  });
}


function postImage(imagePath, camera) {
  var formData = {
    // Pass a simple key-value pair
    name: camera,

    file: fs.createReadStream(imagePath)
  };

  request.post({url:'http://178.62.193.16:8080/upload', formData: formData}, function optionalCallback(err, httpResponse, body) {
    if (err) {
    	return logger.log("error", "Error occured while uploading: " + err);
    }
    logger.log('info', 'Upload successful!  Server responded with:', body);
    if(camera == camera1) {
        logger.log("info", "Snapping from camera 2");
    	snapPicture(cmd1, camera2);
    }
   });

}