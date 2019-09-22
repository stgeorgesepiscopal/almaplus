import { options, searchData } from './storage';
import { clearBody, nodesFromXpath, newObjects, log } from './util'
import {encode} from 'he'
import {notifyAlmaStart} from './background-notifications'

const initialize = function() {
  
  return Promise.all([
      options.initDefaults(),
      searchData.initDefaults()])

}

browser.runtime.onInstalled.addListener((details) => {
  console.log('previousVersion', details.previousVersion);
  
})



const getProcesses = async function(callback) {
  const subdomain = await options.get('subdomain');
  const url = "https://"+subdomain+".getalma.com/workflows/processes/review"

  var req = new XMLHttpRequest();
  req.open("GET", url, true);
  req.setRequestHeader("X-Requested-With", "XMLHttpRequest");
  req.onreadystatechange = function() {
    if (req.readyState == 4) {
      var body = clearBody(req.responseText);
      var parser = new DOMParser();
          var doc = parser.parseFromString(body, "text/html");
          var n = nodesFromXpath("//td//a", doc);
          
          var helpResults = []
          n.forEach((node) => {
            helpResults.push(
              {
                href: "https://"+subdomain+".getalma.com/"+node.getAttribute("href"),
                title: encode(node.textContent.trim()),
                
              }
            )
          });

        callback({Processes: helpResults});
    }
  }

  req.send(null);
  return req;

}

const getGradeLevels = async function() {
  const subdomain = await options.get('subdomain');
  const url = "https://"+subdomain+".getalma.com/settings"

  var req = new XMLHttpRequest();
  req.open("GET", url, true);
  req.setRequestHeader("X-Requested-With", "XMLHttpRequest");
  req.onreadystatechange = function() {
    if (req.readyState == 4) {
      var body = clearBody(req.responseText);
      
      var parser = new DOMParser();
        try {
          var doc = parser.parseFromString(body, "text/html");
          var gradeLevelFirst = parseInt(nodesFromXpath('//select[@name="GradeLevelFirst"]/option[@selected]', doc)[0].value)
          var gradeLevelLast = parseInt(nodesFromXpath('//select[@name="GradeLevelLast"]/option[@selected]', doc)[0].value)
          var n = nodesFromXpath('//input[contains(@name,"GradeLevels") and contains(@name,"Abbreviation")]', doc);
          
          var gradeLevels = []
          n.slice(gradeLevelFirst, gradeLevelLast+1).forEach((node) => {
            gradeLevels.push(
              {
                value: node.value,
                label: node.parentElement.parentElement.children[1].children[0].value
              }
            )
          });

          searchData.gradeLevels.set(gradeLevels)
        } catch (e) { console.log(e) }
        
    }
  }

  req.send(null);
  return req;
}

var getStudentsFromAProcess = async function(process, method) {
  const settings = await options.get()
  
  console.log(settings.subdomain)
  
    // Create the XHR request
    var request = new XMLHttpRequest();
    
    // Return it as a Promise
    return new Promise(function (resolve, reject) {
  
      // Setup our listener to process compeleted requests
      request.onreadystatechange = function () {
  
        // Only run if the request is complete
        if (request.readyState !== 4) return;
  
        // Process the response
        if (request.status >= 200 && request.status < 300) {
          var body = clearBody(request.responseText);
          var parser = new DOMParser();
          var doc = parser.parseFromString(body, "text/html");
          const enrolled = nodesFromXpath("//a[contains(@data-alma-modal,'WorkflowsAddStudentSisModal')]", doc).length > 0;
          
          if( ( !settings.ignoreEnrolled && !settings.ignoreApplicants ) || 
              ( !settings.ignoreEnrolled &&  enrolled ) || 
              ( !settings.ignoreApplicants &&  !enrolled ) )
            {
            var n = nodesFromXpath("//td//a", doc);
            
            var helpResults = []
            n.forEach((node) => {
              helpResults.push(
                {
                  href: "https://"+settings.subdomain+".getalma.com"+node.getAttribute("href"),
                  name: encode(node.textContent.trim()),
                  grade: encode(node.parentElement.parentElement.children[2].textContent.trim()),
                  stage: encode(node.parentElement.parentElement.children[3].textContent.trim()),
                  status: encode(node.parentElement.parentElement.children[4].textContent.trim()),
                  updated: encode(node.parentElement.parentElement.children[5].textContent.trim()),
                  process: process.title,
                  enrolled: enrolled,
                  
                }
              )
            });
          }

          // If successful
          resolve(helpResults);
        } else {
          // If failed
          reject({
            status: request.status,
            statusText: request.statusText
          });
        }
  
      };
  
      // Setup our HTTP request
      request.open(method || 'GET', process.href, true);
      request.setRequestHeader("X-Requested-With", "XMLHttpRequest");
      // Send the request
      request.send();
  
    });
  
}

const getStudentsFromProcesses = async function(data) {
  const subdomain = await options.get('subdomain');
  const almaStartBrowserNotifications = await options.get('almaStartBrowserNotifications');

  const oldData = await searchData.get('startStudents'); 
  
  
  const dA = await Promise.all(
    data.Processes.map( p => getStudentsFromAProcess(p) )
  )
  const d = [].concat(...dA)

   


  const notifications = newObjects(oldData, d)
  if (notifications.length > 0) {
    searchData.startStudents.set(d);
    notifyAlmaStart(notifications)
  }
  
  console.log(notifications)
  
}


const doBlocking = function(){ return {cancel: true}; }

    // Fill in default values for any unset settings.
const main = async function() {
  const settings = await options.get();
    console.log(settings.stayAlive)

    if (settings.stayAlive) {
      browser.webRequest.onBeforeRequest.addListener(
        doBlocking,
        {
          urls: ["https://"+settings.subdomain+".getalma.com/ui/alma/alma-session-timeout.js*"],
          types: ["script"]
        },
        ["blocking"]
      );
    }

    // A property is automatically created on the StorageArea object for each
    // setting with get(), set(), and other functions. Use addListener() to run
    // a function when a setting changes.
    options.subdomain.addListener((change, key) => {
        console.log(`subdomain changed from ${change.oldValue} to ${change.newValue}`);
        subdomain = change.newValue;

        if(browser.webRequest.onBeforeRequest.hasListener(doBlocking)){
          browser.webRequest.onBeforeRequest.removeListener(doBlocking);

          browser.webRequest.onBeforeRequest.addListener(
            doBlocking,
            {
              urls: ["https://"+subdomain+".getalma.com/ui/alma/alma-session-timeout.js*"],
              types: ["script"]
            },
            ["blocking"]
          );

          // callback_named is listening
        }

    });

    options.apiStudentUUID.addListener((change, key) => {
      console.log(`apiStudent changed from ${change.oldValue} to ${change.newValue}`);
    });

    searchData.startStudents.addListener((change, key) => {
      console.log(`startStudents changed`);
      
    });

    options.almaStartIgnoreApplicants.addListener((change, key) => {
       getProcesses(getStudentsFromProcesses);
      
    });

    options.almaStartIgnoreEnrolled.addListener((change, key) => {
       getProcesses(getStudentsFromProcesses);
      
    });

    options.stayAlive.addListener((change, key) => {
      if(browser.webRequest.onBeforeRequest.hasListener(doBlocking)){
        browser.webRequest.onBeforeRequest.removeListener(doBlocking);
      }
      if (change.newValue) {
        browser.webRequest.onBeforeRequest.addListener(
          doBlocking,
          {
            urls: ["https://"+subdomain+".getalma.com/ui/alma/alma-session-timeout.js*"],
            types: ["script"]
          },
          ["blocking"]
        );  
      }
      
      console.log(`apiStudent changed from ${change.oldValue} to ${change.newValue}`);
    });
 

  }

  initialize().then(
    () => {
      main();
      getProcesses(getStudentsFromProcesses);
      getGradeLevels();
    
      setInterval(getProcesses, 60 * 5000, getStudentsFromProcesses);
      setInterval(getGradeLevels, 60 * 60000);
    }
  )



