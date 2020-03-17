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

const messages = ["Hey there, remember to try and not touch your face!",
  "Touching your face can spread dirt, oil, and bacteria from your hands to your face.",
  "Did you know that on average people touch their faces around 23 times per hour!",
  "Would you put your face on the last thing you touched?",
  "The best way to prevent infections is to stop touching your face!",
  "Hey, remember to wash your hands several times throughout the day!"
]


// set global vid variable
const vid = document.querySelector('#webcamVideo');


// the link to your model provided by Teachable Machine export panel
const URL = "https://teachablemachine.withgoogle.com/models/-L0k6LxU/";

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
  var message_ = messages[Math.floor(Math.random() * messages.length)]

  chrome.notifications.clear('stop-touching-1');
  chrome.notifications.create(
    'stop-touching-1', {
      type: 'basic',
      iconUrl: 'new-logo.png',
      title: "STOP Touching Your Face!",
      message: message_

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

function stop(timer) {
  if (timer) {
    clearTimeout(timer);
    timer = 0;
  }
}

function lowPowerMode() {
  var date = new Date();
  var current_hour = date.getHours();

  if (current_hour >= 7 && current_hour <= 17) {
      timeout1 = setTimeout(function() {
        //console.log(("Hello"))
      }, 7200000);
      timeout2 = setTimeout(function() {
        //console.log(("Hello"))
      }, 14400000);

      if (current_hour <= 13){
        timeout3 = setTimeout(function() {
          //console.log(("Hello"))
        }, 21600000);
          return [timeout1, timeout2, timeout3];
      }

      return [timeout1, timeout2];

  } else {
    return [];
  }
}


// function to setup tensorflow.js model
async function setupClassifier(vid) {
  const modelURL = "/model.json"; //URL + "model.json"; //"model.json";
  const metadataURL = "/metadata.json"; //URL + "metadata.json"; //"metadata.json";

  // load the model and metadata
  model = await tmImage.load(modelURL, metadataURL);
  maxPredictions = model.getTotalClasses();

  // loop to loop over images in webcam to predict if touching face
  // until vid stream is stopped

  chrome.storage.sync.get(['time-between'], function(result) {
    if (result['time-between'] === '1') {
      time_betweeen = 15000;
    } else if (result['time-between'] === '2') {
      time_betweeen = 60000;
    } else if (result['time-between'] === '3') {
      time_betweeen = 300000;
    } else if (result['time-between'] === '4') {
      time_betweeen = 1800000;
    } else if (result['time-between'] === '5') {
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
      console.log('low power mode');
      values = lowPowerMode();
    } else {
      //if (!!items['camAccess']) {
      if (!!items['camAccess']) {
        console.log('cam access already exists');
        setupCam();
        try {
        if (values.length > 1) {
        timeout1 = values[0];
        timeout2 = values[1];
        stop(timeout1);
        stop(timeout2);
      }
        if (values.length == 3) {
          timeout3 = values[2];
          stop(timeout3);
        }
      }catch(err) {
    console.log('on startup')
  }
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
      console.log('low power mode');
      values = lowPowerMode();
    } else {
      //if ('camAccess' in changes) {
      //console.log('cam access grantedddd');
      console.log('cam access granted');
      setupCam();
      try {
      if (values.length > 1) {

      timeout1 = values[0];
      timeout2 = values[1];
      stop(timeout1);
      stop(timeout2);

    }
      if (values.length == 3) {
        timeout3 = values[2];
        stop(timeout3);
      }
    }catch(err) {
  console.log('on startup')
}

    }
    //}
  });

});
