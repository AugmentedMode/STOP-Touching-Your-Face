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

    chrome.storage.sync.get(['time-between'], function (result){
        console.log(result['time-between'])
        if(result['time-between'] === '1')
        {
            document.querySelector('#sel [value="' + 1 + '"]').selected = true;
        }else if (result['time-between'] === '2') {
          document.querySelector('#sel [value="' + 2 + '"]').selected = true;
        }
        else if (result['time-between'] === '3') {
          document.querySelector('#sel [value="' + 3 + '"]').selected = true;
        }
        else if (result['time-between'] === '4') {
          document.querySelector('#sel [value="' + 4 + '"]').selected = true;
        }
        else if (result['time-between'] === '5') {
          document.querySelector('#sel [value="' + 5 + '"]').selected = true;
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

//////////////////////////////////////////////////////////////////////



    document.getElementById("sel").addEventListener("change", myFunction);

    function myFunction() {
      var e = document.getElementById("sel");
      var strUser = e.options[e.selectedIndex].value;
      //console.log(strUser)
      var val = strUser;
      //document.querySelector('#sel [value="' + val + '"]').selected = true;
      console.log(val)
      chrome.storage.sync.set({'time-between' : val});
    }
