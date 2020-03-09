// once loaded all popup html content
document.addEventListener('DOMContentLoaded', function(){
    // get data from on/off switch
    var activeElement = document.getElementById("active-option");

    // get data to see if element is on or off
    chrome.storage.sync.get(['GDDM-active'], function (result){
        if(result['GDDM-active'] === "false")
        {
            // is off
            activeElement.checked = false;
        }else{
           // is on
            activeElement.checked = true;
        }
    });
    // on lick of switch
    activeElement.onclick = function(){
        let selection = this.checked + "";
        if(this.checked){
            // set checked == true in chrome storage
            chrome.storage.sync.set({'GDDM-active' : selection});

        }else{
            // set checked == false in chrome storage
            chrome.storage.sync.set({'GDDM-active' : selection});

        }
        chrome.tabs.query({currentWindow: true, active: true},
            function(tabs) {
                chrome.tabs.sendMessage(tabs[0].id, selection);
        })
    }
})
