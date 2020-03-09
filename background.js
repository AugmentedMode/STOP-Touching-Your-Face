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

const vid = document.querySelector('#webcamVideo');


// the link to your model provided by Teachable Machine export panel
const URL = "https://teachablemachine.withgoogle.com/models/wSHx_7N3/";

let model, labelContainer, maxPredictions;
 var last_notification = null
//const vid = document.querySelector('#webcamVideo');

function millisToMinutesAndSeconds(millis) {
  var minutes = Math.floor(millis / 60000);
  var seconds = ((millis % 60000) / 1000).toFixed(0);
  return minutes + ":" + (seconds < 10 ? '0' : '') + seconds;
}

function sendNotification(current_time) {
  console.log('send notification')
  chrome.notifications.clear('stop-touching-1');
  chrome.notifications.create(
  'stop-touching-1',{
  type: 'basic',
  iconUrl: 'new-logo.png',
  title: "Stop touching your face!",
  message: "Hey there, remember to try and not touch your face!"

  });
  last_notification = current_time
  //chrome.storage.sync.set({'last-notification' : current_time});

}



// Setup webcam

async function setupCam() {
  navigator.mediaDevices.getUserMedia({
    video: true
  }).then(mediaStream => {

    console.log('setting up cam before media stream')
    vid.srcObject = mediaStream;
    console.log(vid.srcObject)
    setupClassifier(vid);
  }).catch((error) => {
    console.warn(error);
  });
}


function stopStreamedVideo(videoStream) {
  const stream = videoStream.srcObject;
  if (stream != null){
  const tracks = stream.getTracks();

  tracks.forEach(function(track) {
    track.stop();
    track.enabled = false;
  });

  videoStream.srcObject = null;
}
}


async function setupClassifier(vid) {
  const modelURL = URL + "model.json";
  const metadataURL = URL + "metadata.json";




  // load the model and metadata
  // Refer to tmImage.loadFromFiles() in the API to support files from a file picker
  // or files from your local hard drive
  // Note: the pose library adds "tmImage" object to your window (window.tmImage)
  model = await tmImage.load(modelURL, metadataURL);
  maxPredictions = model.getTotalClasses();


  while (vid.srcObject != null) {
    await predict(vid);

    // need to set yes_loop to false here

  }


  //window.requestAnimationFrame(loop);
  //console.log(vid.srcObject)

  /*
  document.getElementById('webcam-container').appendChild(vid);
  labelContainer = document.getElementById('label-container');
  for (let i = 0; i < maxPredictions; i++) { // and class labels
      labelContainer.appendChild(document.createElement('div'));

  }
  */
}
/*
async function loop() {

    await predict();
    console.log('in loop')

    window.requestAnimationFrame(loop);
}
*/

// run the webcam image through the image model
async function predict(vid) {
    // predict can take in an image, video or canvas html element
    const prediction = await model.predict(vid);
    //for (let i = 0; i < maxPredictions; i++) {
        const classPrediction =
            prediction[0].className + ": " + prediction[0].probability.toFixed(2);
          //  console.log(classPrediction)
        //labelContainer.childNodes[i].innerHTML = classPrediction;

          if (prediction[0].className == 'touching-face') {
            // if prediiction is greater than 90 of touching face - send notification
            if (prediction[0].probability.toFixed(2) >= .90) {
              console.log('over 90')

                //chrome.storage.sync.get(['last-notification'], function (result){

                  var date = new Date();
                  var current_time = date.getTime();
                  var diffInMillis =  current_time - last_notification;

                  console.log(millisToMinutesAndSeconds(diffInMillis))



                    if(diffInMillis > 15000 || last_notification == null)
                    {

                      sendNotification(current_time);


                    } else {
                      console.log('dont send notifcation')
                    }

            //  });




        }

  }





  //  }
}





// If cam acecss has already been granted to this extension, setup webcam.
chrome.storage.local.get('camAccess', items => {
  chrome.storage.sync.get(['GDDM-active'], function (result){
      if(result['GDDM-active'] == "false")
      {
          vid.pause();
          vid.src = "";
          console.log('stop stream')
          stopStreamedVideo(vid);
          console.log('stream stopped')
      }else{
        //if (!!items['camAccess']) {
        if (!!items['camAccess']) {
  console.log('cam access already exists');
  setupCam();
}
        //}
      }
  });
  //if (background_running) {


});

// If cam acecss gets granted to this extension, setup webcam.
chrome.storage.onChanged.addListener((changes, namespace) => {
  chrome.storage.sync.get(['GDDM-active'], function (result){
      if(result['GDDM-active'] == "false")
      {
          vid.pause();
          vid.src = "";
          console.log('stop stream')
          stopStreamedVideo(vid);
          console.log('stream stopped')
      }else{
        //if ('camAccess' in changes) {
          //console.log('cam access grantedddd');
    console.log('cam access granted');
    setupCam();





        }
      //}
  });
  //if (background_running) {


});
