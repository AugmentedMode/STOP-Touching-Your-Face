/*function setupCam() {
  navigator.mediaDevices.getUserMedia({
    video: true
  }).then(mediaStream => {
    document.querySelector('#webcamVideo').srcObject = mediaStream;
  }).catch((error) => {
    console.warn(error);
  });
}

setupCam();*/



document.addEventListener('DOMContentLoaded', function(){
    var activeElement = document.getElementById("active-option");

    chrome.storage.sync.get(['GDDM-active'], function (result){
        if(result['GDDM-active'] === "false")
        {
            console.log('helllo im false');
            activeElement.checked = false;
        }else{
          console.log('helllo im false');
            activeElement.checked = true;
        }
    });
    activeElement.onclick = function(){
        let selection = this.checked + "";
        if(this.checked){
            // checked == true
            chrome.storage.sync.set({'GDDM-active' : selection});
        }else{
            // else false
            chrome.storage.sync.set({'GDDM-active' : selection});
        }
        chrome.tabs.query({currentWindow: true, active: true},
            function(tabs) {
                chrome.tabs.sendMessage(tabs[0].id, selection);
        })
    }
})
