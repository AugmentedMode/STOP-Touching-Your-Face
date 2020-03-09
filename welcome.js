// on install - get webcam access then close webcam
navigator.mediaDevices.getUserMedia({
    video: true
  }).then(stream => {
    document.querySelector('#status').innerHTML =
      'Webcam access granted for extension, please close this tab';
    chrome.storage.local.set({
      'camAccess': true
    }, () => {});
    stream.getTracks()[0].stop();

  })


  .catch(err => {
    document.querySelector('#status').innerHTML =
      'Error getting webcam access for extension: ' + err.toString();
    console.error(err);
  });
