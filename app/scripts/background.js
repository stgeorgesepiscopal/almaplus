import { options, searchData } from './storage';
import { clearBody, nodesFromXpath, newObjects } from './util'
import {encode} from 'he'

browser.runtime.onInstalled.addListener((details) => {
  console.log('previousVersion', details.previousVersion);
  
})

browser.runtime.onInstalled.addListener(async (details) => {
  console.log("Initializing Options");
  await options.initDefaults();
  console.log("Intializing Search Data Store");
  await searchData.initDefaults();
});

const log = function(l) {
  console.log(l);
}

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
    }
  }

  req.send(null);
  return req;
}

const getStudentsFromProcesses = async function(data) {
  const subdomain = await options.get('subdomain');
  const oldData = await searchData.get('startStudents'); 
  const ignoreEnrolled = await options.get('almaStartIgnoreEnrolled');
  const ignoreApplicants = await options.get('almaStartIgnoreApplicants');

  var d = [{}];
  var finished = 0;

  data.Processes.forEach( (process) => {
    var url = process.href;
    var req = new XMLHttpRequest();
    req.open("GET", url, true);
    req.setRequestHeader("X-Requested-With", "XMLHttpRequest");
    req.onreadystatechange = function() {
      if (req.readyState == 4) {
        var body = clearBody(req.responseText);
        var parser = new DOMParser();
            var doc = parser.parseFromString(body, "text/html");
            const enrolled = nodesFromXpath("//a[contains(@data-alma-modal,'WorkflowsAddStudentSisModal')]", doc).length > 0;
            if( ( !ignoreEnrolled && !ignoreApplicants ) || ( !ignoreEnrolled &&  enrolled ) || ( !ignoreApplicants &&  !enrolled ) )
            {
            var n = nodesFromXpath("//td//a", doc);
            
            var helpResults = []
            n.forEach((node) => {
              helpResults.push(
                {
                  href: "https://"+subdomain+".getalma.com"+node.getAttribute("href"),
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
        
            d.push(...helpResults);
            
            
          }
          finished++;
          console.log(finished);
          console.log(data.Processes.length)
          if (finished == data.Processes.length) {
            searchData.startStudents.set(d);
            console.log(newObjects(oldData, d))
          } 

         
      }
    }

    req.send(null);
    

  }

  );
}


var subdomain = '';

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

  main();
  getProcesses(getStudentsFromProcesses);
  getGradeLevels();

  setInterval(getProcesses, 60 * 5000, getStudentsFromProcesses);
  setInterval(getGradeLevels, 60 * 60000);


