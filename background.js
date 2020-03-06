// Do first-time setup to gain access to webcam, if necessary.
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason.search(/install/g) === -1) {
    return;
  }
  chrome.tabs.create({
    url: chrome.extension.getURL('welcome.html'),
    active: true
  });
});




const vid = document.querySelector('#webcamVideo');


// Setup webcam

async function setupCam() {
  navigator.mediaDevices.getUserMedia({
    video: true
  }).then(mediaStream => {
    vid.srcObject = mediaStream;
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
        if (!!items['camAccess']) {
          console.log('cam access already exists');
          setupCam();
        }
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
          setupCam();
        }
      //}
  });
  //if (background_running) {


});
