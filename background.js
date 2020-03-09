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
//const vid = document.querySelector('#webcamVideo');



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
    console.log('in loop')

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
    for (let i = 0; i < maxPredictions; i++) {
        const classPrediction =
            prediction[i].className + ": " + prediction[i].probability.toFixed(2);
            console.log(classPrediction)
        //labelContainer.childNodes[i].innerHTML = classPrediction;

    }
}





// If cam acecss has already been granted to this extension, setup webcam.
chrome.storage.local.get('camAccess', items => {
  chrome.storage.sync.get(['GDDM-active'], function (result){
      if(result['GDDM-active'] == "false")
      {
          console.log('helllo im false');
          vid.pause();
          vid.src = "";
          stopStreamedVideo(vid);
      }else{
        console.log('helllo im true');
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
          console.log('helllo im false');
          vid.pause();
          vid.src = "";
          stopStreamedVideo(vid);
      }else{
        console.log('helllo im true');
        //if ('camAccess' in changes) {
          //console.log('cam access grantedddd');
    console.log('cam access granted');
    setupCam();





        }
      //}
  });
  //if (background_running) {


});
