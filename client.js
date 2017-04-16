var request = require('request');
var fs = require('fs');
var logger = require('winston');
var CronJob = require('cron').CronJob

// Every x minute
const cronPattern = '0 0/10 * 1/1 * ? *'
var
var job = new CronJob(cronPattern, function() {

  // Do request
  fireRequest()

}, function() {

  // Job stopped
  const date = new Date()
  logger.log("error", "Job stopped: " + date.toString())
}, true);

logger.add(logger.transports.File, { filename: 'logfile.log' });
logger.remove(logger.transports.Console);


var baseUrl = "http://138.68.175.78:3000/"
var pathNorth = "upload/north"
var pathWest = "upload/west"
var pathStatus = "status"

const timeInterval = 2700 * 1000;
const imageName = "lastImage.jpg"
const cmd0 = 'fswebcam -d /dev/video0 -r 1280x720 --jpeg 90 -D 3 -S 13 ' + imageName;
const cmd1 = 'fswebcam -d /dev/video1 -r 1280x720 --jpeg 90 -D 3 -S 13 ' + imageName;
const camera1 = "north";
const camera2 = "west";

function fireRequest() {
  request(
    { method: 'GET'
    , uri: baseUrl + pathStatus
    }
  , function (error, response, body) {

      if(!error) {
        if(body == "ON") {
          logger.log("info", "Received upload status: ON");
          snapPicture(cmd0, camera1, baseUrl+pathNorth);
        }
      } else {
        logger.log("error", "Error on status request");
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
      logger.log("error", "Error occured while uploading: " + err);
    } else {
      logger.log('info', 'Upload successful!  Server responded with:', body);
    }
    if(camera == camera1) {
      logger.log("info", "Snapping from camera 2");
      snapPicture(cmd1, camera2, baseUrl+pathWest);
    }
   });

}