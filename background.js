// On install, send user to welcome page to get webcam access
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason.search(/install/g) === -1) {
    return;
  }
  chrome.tabs.create({
    url: chrome.extension.getURL('welcome.html'),
    active: true
  });
});

///////////////////////////////////////////////////////////////////////////////

let time_betweeen = 15000;


// set global vid variable
const vid = document.querySelector('#webcamVideo');


// the link to your model provided by Teachable Machine export panel
const URL = "https://teachablemachine.withgoogle.com/models/wSHx_7N3/";

let model, labelContainer, maxPredictions;
// variable to store when last notification was sent
var last_notification = null

// function to convert milli seconds to seconds
function millisToMinutesAndSeconds(millis) {
  var minutes = Math.floor(millis / 60000);
  var seconds = ((millis % 60000) / 1000).toFixed(0);
  return minutes + ":" + (seconds < 10 ? '0' : '') + seconds;
}

// function to clear all notifications and send new notification
function sendNotification(current_time) {
  //console.log('send notification')
  chrome.notifications.clear('stop-touching-1');
  chrome.notifications.create(
    'stop-touching-1', {
      type: 'basic',
      iconUrl: 'new-logo.png',
      title: "Stop touching your face!",
      message: "Hey there, remember to try and not touch your face!"

    });
  last_notification = current_time

}


// Setup webcam
async function setupCam() {
  navigator.mediaDevices.getUserMedia({
    video: true
  }).then(mediaStream => {
    vid.srcObject = mediaStream;
    setupClassifier(vid);
  }).catch((error) => {
    console.warn(error);
  });
}


// function to stop stream and release webcam
function stopStreamedVideo(videoStream) {
  const stream = videoStream.srcObject;
  if (stream != null) {
    const tracks = stream.getTracks();

    tracks.forEach(function(track) {
      track.stop();
      track.enabled = false;
    });

    videoStream.srcObject = null;
  }
}


// function to setup tensorflow.js model
async function setupClassifier(vid) {
  const modelURL = URL + "model.json";
  const metadataURL = URL + "metadata.json";

  // load the model and metadata
  model = await tmImage.load(modelURL, metadataURL);
  maxPredictions = model.getTotalClasses();

  // loop to loop over images in webcam to predict if touching face
  // until vid stream is stopped

  chrome.storage.sync.get(['time-between'], function (result){
      console.log(result['time-between'])
      if(result['time-between'] === '1')
      {
          time_betweeen = 15000;
      }else if (result['time-between'] === '2') {
        time_betweeen = 60000;
      }
      else if (result['time-between'] === '3') {
        time_betweeen = 300000;
      }
      else if (result['time-between'] === '4') {
        time_betweeen = 1800000;
      }
      else if (result['time-between'] === '5') {
        time_betweeen = 3600000;
      }
  });
  while (vid.srcObject != null) {
    await predict(vid);

  }

}

// run the webcam image through the image model
async function predict(vid) {
  // predict can take in an image, video or canvas html element
  const prediction = await model.predict(vid);

  // if touching face
  if (prediction[0].className == 'touching-face') {
    // if prediiction is greater than 90 of touching face
    if (prediction[0].probability.toFixed(2) >= .90) {

      var date = new Date();
      var current_time = date.getTime();
      var diffInMillis = current_time - last_notification;

      // log time in seconds till next notification
      console.log(millisToMinutesAndSeconds(diffInMillis))


      // if it has been more than 15 seconds or if there is no last notification
      if (diffInMillis > time_betweeen || last_notification == null) {
        // send notification to user and update last-notification
        sendNotification(current_time);

      } else {
        //console.log('dont send notifcation')
      }

    }

  }

}


// If cam acecss has already been granted to this extension, setup webcam.
chrome.storage.local.get('camAccess', items => {
  chrome.storage.sync.get(['GDDM-active'], function(result) {
    if (result['GDDM-active'] == "false") {
      vid.pause();
      vid.src = "";
      stopStreamedVideo(vid);
    } else {
      //if (!!items['camAccess']) {
      if (!!items['camAccess']) {
        console.log('cam access already exists');
        setupCam();
      }
      //}
    }
  });


});

// If cam acecss gets granted to this extension, setup webcam.
chrome.storage.onChanged.addListener((changes, namespace) => {
  chrome.storage.sync.get(['GDDM-active'], function(result) {
    if (result['GDDM-active'] == "false") {
      vid.pause();
      vid.src = "";
      stopStreamedVideo(vid);
    } else {
      //if ('camAccess' in changes) {
      //console.log('cam access grantedddd');
      console.log('cam access granted');
      setupCam();

    }
    //}
  });

});
