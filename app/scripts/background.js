import { options, watchers, searchData } from './storage';
import { clearBody, nodesFromXpath, newObjects, log, ms } from './util'
import { sendMessage } from './alma'
import {encode} from 'he'
import {notifyAlmaStart} from './background-notifications'

var settings = []

String.prototype.escapeSpecialChars = function() {
  return this.replace(/\\n/g, "\\n")
             .replace(/\\'/g, "\\'")
             .replace(/\\"/g, '\\"')
             .replace(/\\&/g, "\\&")
             .replace(/\\r/g, "\\r")
             .replace(/\\t/g, "\\t")
             .replace(/\\b/g, "\\b")
             .replace(/\\f/g, "\\f");
};

const doDefaultBlocking = () => { return {cancel: true}; }

const doBlocking = () => { return {cancel: true}; }

const doRedirect = () => {
  
    return {
      redirectUrl: "https://"+settings.subdomain+".getalma.com/"
    }
  
  
}

const changeReporter = (change, key) => {
  console.log(`${key} changed from ${change.oldValue} to ${change.newValue}`);
}

const activateDefaultBlocking = (subdomain) => {

  browser.webRequest.onBeforeRequest.addListener(
    doDefaultBlocking,
    {
      urls: ["https://"+subdomain+".getalma.com/js/alma-table-freeze.js*"], // https://sges.getalma.com/js/alma-table-freeze.js?v=v8.16.0
      types: ["script"] 
    },
    ["blocking"]
  )
  browser.webRequest.onBeforeRequest.addListener(
    doRedirect,
    {
      urls: ["https://"+subdomain+".getalma.com/tools"]
    },
    ["blocking"]
  )

}

const deactivateBlocking = () => {
  if(browser.webRequest.onBeforeRequest.hasListener(doBlocking)){
    browser.webRequest.onBeforeRequest.removeListener(doBlocking);
  }
}

const activateBlocking = (subdomain) => {
    
    deactivateBlocking()

    browser.webRequest.onBeforeRequest.addListener(
      doBlocking,
      {
        urls: ["https://"+subdomain+".getalma.com/ui/alma/alma-session-timeout.js*"],
        types: ["script"]
      },
      ["blocking"]
    );
}


const subdomainListener = (change, key) => {
  changeReporter(change,key)
  activateBlocking(change.newValue);
}

const almaStartListener = (change, key) => {
  changeReporter(change,key)
  doInitialize()
  getProcesses(getStudentsFromProcesses)
}

const adminModeListener = (change, key) => {
  changeReporter(change,key)
  doInitialize()

}

const stayAliveListener = (change, key) => {
  
  changeReporter(change, key)

  if (change.newValue) {
    activateBlocking(settings.subdomain)
  } else { 
    deactivateBlocking() 
  }
  
}

const notesListener = (change, key) => {
  changeReporter(change,key)
  getNotes()
}

const optionsListeners = [
  {
    key: 'subdomain', listener: subdomainListener
  },
  {
    key: 'apiStudentUUID', listener: changeReporter
  },
  {
    key: 'almaStartIgnoreApplicants', listener: almaStartListener
  },
  {
    key: 'almaStartIgnoreEnrolled', listener: almaStartListener
  },
  {
    key: 'stayAlive', listener: stayAliveListener
  },
  {
    key: 'adminMode', listener: adminModeListener
  },
]

const addOptionsListeners = () => {
  optionsListeners.forEach(
    ({key, listener}) => {
      options[key].addListener(listener)
    }
  )
}

const initializeDatastore = function() {
  
  return Promise.all([
      options.initDefaults(),
      searchData.initDefaults(),
      watchers.initDefaults()
    ])

}




const initialize = async function() {

  settings = await options.get()
  var request = new XMLHttpRequest();
  

  
  
  return new Promise(function (resolve, reject) {
      request.onreadystatechange = function () {
        
        if (request.readyState !== 4) return;
        if (request.status >= 200 && request.status < 300) {
          try {
            //console.log(request.responseText)
            const result = request.responseText.match(/user_id"?: ?"([^"]*)"/)[1]
            options.userUUID.set(result);
            console.log("UUID", result)
            chrome.browserAction.setBadgeText({text: ``})
            searchData.messages.set([])

            resolve(result);
          
          
          }
          catch (e) {
            chrome.browserAction.setBadgeBackgroundColor({color: [200,6,22,200]});
            chrome.browserAction.setBadgeText({text: `LOGIN`})
            searchData.messages.set([{text: 'Log in to Alma'}])
            

            reject({
              reason: "NOT LOGGED IN",
              e: e
            })
          }

          //const body = clearBody(request.responseText);
          //const body = request.responseText;
          //const parser = new DOMParser();
          //const doc = parser.parseFromString(body, "text/html");
          //const result = getUserId(doc)
          
        } else {

          reject({
            status: request.status,
            statusText: request.statusText
          });
        
        }
  
      };
  
      request.open('GET', `https://${settings.subdomain}.getalma.com/home`, true);
      request.setRequestHeader("X-Requested-With", "XMLHttpRequest");
      request.send();
  
    });

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
  settings = await options.get()
  const url = "https://"+settings.subdomain+".getalma.com/settings"

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
  settings = await options.get()
  
  var request = new XMLHttpRequest();
  
  return new Promise(function (resolve, reject) {
      request.onreadystatechange = function () {
        
        if (request.readyState !== 4) return;

        if (request.status >= 200 && request.status < 300) {

          const body = clearBody(request.responseText);
          const parser = new DOMParser();
          const doc = parser.parseFromString(body, "text/html");
          const enrolled = nodesFromXpath("//a[contains(@data-alma-modal,'WorkflowsAddStudentSisModal')]", doc).length > 0;
          const helpResults = []

          if( ( !settings.almaStartIgnoreEnrolled && !settings.almaStartIgnoreApplicants ) || 
              ( !settings.almaStartIgnoreEnrolled &&  enrolled ) || 
              ( !settings.almaStartIgnoreApplicants &&  !enrolled ) )
            {

            const n = nodesFromXpath("//td//a", doc);
            n.forEach((node) => {
              const href = "https://"+settings.subdomain+".getalma.com"+node.getAttribute("href")
              const [processId, studentId, instanceId] = href.split("/").slice(Math.max(href.split("/").length - 3, 1))

              

              helpResults.push(
                {
                  href: href,
                  name: encode(node.textContent.trim()),
                  grade: encode(node.parentElement.parentElement.children[2].textContent.trim()),
                  stage: encode(node.parentElement.parentElement.children[3].textContent.trim()),
                  status: encode(node.parentElement.parentElement.children[4].textContent.trim()),
                  updated: encode(node.parentElement.parentElement.children[5].textContent.trim()),
                  process: process.title,
                  processId: processId,
                  studentId: studentId,
                  instanceId: instanceId,
                  enrolled: enrolled,
                  
                }
              )
            });
          }

          resolve(helpResults);
        } else {

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
  settings = await options.get();
  
  

  const oldData = await searchData.get('startStudents'); 
  
  
  const dA = await Promise.all(
    data.Processes.map( p => getStudentsFromAProcess(p) )
  )
  const d = [].concat(...dA)
  
   


  const notifications = newObjects(oldData, d)
  if (notifications.length > 0) {
    searchData.startStudents.set(d);
    if(settings.almaStartBrowserNotifications || settings.almaStartEmailNotifications)
      notifyAlmaStart(notifications)
    
      
  } else if (oldData.length != d.length) {
    searchData.startStudents.set(d);
  }


}

const hasNotes = function(str) {
  return ~str.indexOf('Alma+')
}

const buildNotesUrl = function(subdomain, apiStudentUUID, offset=0) {
  const baseUrl = `https://${subdomain}.getalma.com/student/${apiStudentUUID}/load-notes?offset=`
  const tailUrl = `&r=20`
  return baseUrl + offset + tailUrl
}

const getNotesGroup = async function(page) {
  const url = buildNotesUrl(settings.subdomain, settings.apiStudentUUID, page*5)

  var request = new XMLHttpRequest();
  
  return new Promise(function (resolve, reject) {
      request.onreadystatechange = function () {
        
        if (request.readyState !== 4) return;

        if (request.status >= 200 && request.status < 300) {
          
          const results = JSON.parse(request.responseText)

          const body = clearBody(results.Message.html);
          const parser = new DOMParser();
          const doc = parser.parseFromString(body, "text/html");
          
          const notesResults = []

          if( hasNotes(body) )
            {

            const n = nodesFromXpath("//p", doc);

            n.forEach((p) => {
              
              if(hasNotes(p.textContent))
              {
                const json = JSON.parse(p.textContent.replace(/\n/g, "\\n"))
                const dateStr = p.parentElement.children[0].textContent
                let date = new Date()
                
                
                if(dateStr == "Yesterday") date.setDate(date.getDate() - 1)
                else if(~dateStr.indexOf('days')) { date.setDate(date.getDate() - parseInt(dateStr)) }
                else if(dateStr != "Today") date = new Date(dateStr)
                date.setHours(0,0,0,0)

                notesResults.push(
                  {
                    uuid: p.parentElement.children[4].children[0].value,
                    author: p.parentElement.children[2].textContent,
                    date: date.toDateString(),
                    dateInt: date.valueOf(),
                    person: json.uuid,
                    body: json.body,
                    type: json.type,
                    source: json.source,
                    
                  }
                )
              }
            });
          }

          resolve(notesResults);
        } else {

          reject({
            status: request.status,
            statusText: request.statusText
          });
        
        }
  
      };
  
      // Setup our HTTP request
      request.open('GET', url, true);
      request.setRequestHeader("X-Requested-With", "XMLHttpRequest");
      // Send the request
      request.send();
  
    });
  

  

}

const getNotes = async function(i=0) {
  settings = await options.get()
  const notes = await searchData.notes.get()
  console.log(notes.length, i)
  var d = []
  var dA = [[],[],[],[1]]
  
  if(i>0) {
    dA = await Promise.all([
      getNotesGroup(i),
      getNotesGroup(i+1),
      getNotesGroup(i+2),
      getNotesGroup(i+3)
    ])
    i = i+3
    d = [].concat(...dA)
  } else {
    d = await getNotesGroup(i)
    
  }
  
  const newNotes = newObjects(notes, d)
  console.log(newNotes)
  
  
  if ( newNotes.length > 0) {
    notes.push(...newNotes)
    await searchData.notes.set(notes)
    
    if (dA[3].length > 0)
      getNotes(i+1)
  }

}




    // Fill in default values for any unset settings.
const main = async function() {
  settings = await options.get();
  //searchData.notes.set([])
  

  return new Promise(function (resolve, reject) {

    try {

      if (settings.stayAlive) {
        activateBlocking(settings.subdomain)
      }
      activateDefaultBlocking(settings.subdomain)

      addOptionsListeners()
      //getNotesGroup(0).then((r)=>{ searchData.notes.set(r) });
      
      // searchData.notes.get().then( (notes) => {console.log(notes)})

      searchData.startStudents.addListener(changeReporter)
      watchers.notesWatcher.addListener(notesListener)
    
    resolve()
  } catch (e) {
    reject(e)
  }

  })
}

var processInterval = undefined
var notesInterval = undefined

const doInitialize = function(redirect=true) {
    initialize().then(
      () => {
        main().then(
         () => {
           clearInterval(processInterval)
           clearInterval(notesInterval)

            if(settings.almaStart && (!settings.almaStartIgnoreApplicants || !settings.almaStartIgnoreEnrolled)){
              getProcesses(getStudentsFromProcesses);
              getNotes()
              processInterval = setInterval(getProcesses, ms(5), getStudentsFromProcesses);
              notesInterval = setInterval(getNotes, ms(1));
            }

            if(settings.adminMode){
              getGradeLevels()
              setInterval(getGradeLevels, ms(60));
            }

            
            
          
            
            
            
          }
        ).catch( e => {throw e});
        
      }
    ).catch( e => { 
      
      console.log(e);
      
      if(redirect) {

        chrome.tabs.query({
          active: true,
          lastFocusedWindow: true,
          currentWindow: true
        }, function(tabs) {
            // and use that tab to fill in out title and url
            var tab = tabs[0];
            //console.log(tab)
            if(('url' in tab) && ~tab.url.indexOf('getalma.com')) {
              // already on Alma, change the location
              chrome.tabs.update(tab.id, {url: "https://"+settings.subdomain+".getalma.com/"});
            } else {
              // not on Alma, open new tab
              chrome.tabs.create({ url: "https://"+settings.subdomain+".getalma.com/", active:true }, function(tab){
                console.log("Login") //chrome.tabs.remove(tab.id);
            });
            }
            //console.log(tab.url);
            //alert(tab.url);
        });

      }

      setTimeout(doInitialize, 10*1000, false); return e; } )
  }

  initializeDatastore().then( ()=> { doInitialize() } ).catch( e => { console.log(e); return e; } )



