import { nodesFromXpath, clearBody } from './util'
import {encode} from 'he'
import Fuse from 'fuse.js';
import { options, searchData } from './storage';

var subdomain = '';
var apiStudent = '';

async function initialize() {
     subdomain = await options.subdomain.get();
     apiStudent = await options.apiStudentUUID.get();
}
initialize();


export const search = function (query, callback) {
    console.log("Debug Search", query);
    if (query == 'halp')
      return;
    
    if(query.includes("@") )
    {
      return searchByEmail(query, callback);
        // https://sges.getalma.com/student/5d02296c70a9a12b391a12d5/search-parents?email=rjmcw
        //var url = "https://"+subdomain+".getalma.com/student/"+apiStudent+"/search-parents?email=" + query ;
    }
   
    var url = "https://"+subdomain+".getalma.com/directory/search?q=" + query ;
    var req = new XMLHttpRequest();
    req.open("GET", url, true);
    req.setRequestHeader("X-Requested-With", "XMLHttpRequest");
    req.onreadystatechange = function() {
      if (req.readyState == 4) {
        callback(JSON.parse(req.responseText));
      }
    }
    req.send(null);
    return req;
  }

export const searchByEmail = function(query, callback) {
    var url = "https://"+subdomain+".getalma.com/student/"+apiStudent+"/search-parents?email=" + query ;
    var req = new XMLHttpRequest();
    req.open("GET", url, true);
    req.setRequestHeader("X-Requested-With", "XMLHttpRequest");
    req.onreadystatechange = function() {
      if (req.readyState == 4) {
        callback(JSON.parse(req.responseText));
      }
    }
    req.send(null);
    return req;
  }

export const searchWithLocations = function(query, callback) {

    var req = search(query, async function(json){
      var entries = json;
      var justStudents = []
      for (var i = 0, entry; i < entries.length && (entry = entries[i]) && justStudents.length < 4; i++) {
        if (entry.RoleId == 20) {
          justStudents.push(entry)
        }
      }
      var done = 0;
      chrome.omnibox.setDefaultSuggestion({description: "<url>Processing... </url> 1 of "+(justStudents.length)});
      justStudents.forEach( (entry, index) => {
        
        console.log(entry);
        var thisIndex = index;
        locateStudent(entry.id).then( (location)=>{
          done++;
          chrome.omnibox.setDefaultSuggestion({description: "<url>Processing... </url>"+done+"of "+(justStudents.length)});
          justStudents[thisIndex]['Location'] = location;
          if(done == justStudents.length) {
            callback(justStudents);
          }
          
        });
      });
     

    });
    return req;

  }

export const locateStudent = async function(studentId) {
    var url = "https://"+subdomain+".getalma.com/home/get-student-schedule?studentId=" + studentId ;
    
    var response = await fetch(url);
    var json = await response.json();
    var body = clearBody(json.Message.html);
            
            var parser = new DOMParser();
            var doc = parser.parseFromString(body, "text/html");

            var n = nodesFromXpath("//div[contains(@class,'schedule-today')]/div[contains(@class,'class')][not(contains(@class,'class-complete'))]", doc);
            
            if (n.length <= 0) {
              n = nodesFromXpath("//div[contains(@class,'schedule-today')]/div[contains(@class,'class')]", doc);
              console.log(n);
              if (n.length <= 0) {
                return "";
              }
            
            }
            
            var className = n[0].children[1].children[0].children[0].textContent.trim();
            var classTime = n[0].children[0].children[1].textContent.trim();
            var room = n[0].children[1].children[0].children[n[0].children[1].children[0].childElementCount - 1].textContent.trim();
            return className + " (" + room + ") "+classTime;
           
          
  }


export const searchHelp = function(query, callback) {

    const url = "http://help.getalma.com/en/?q="+query;
    var req = new XMLHttpRequest();
    req.open("GET", url, true);
    req.setRequestHeader("X-Requested-With", "XMLHttpRequest");
    req.onreadystatechange = function() {
      if (req.readyState == 4) {
        var body = clearBody(req.responseText);
        var parser = new DOMParser();
            var doc = parser.parseFromString(body, "text/html");
            var n = nodesFromXpath("//div[contains(@class,'search-results__row')]", doc);
            console.log(n);
            var helpResults = []
            n.forEach((node) => {
              helpResults.push(
                {
                  href: node.children[0].href,
                  title: encode(node.children[0].children[0].children[0].textContent.trim()),
                  content: encode(node.children[0].children[0].children[1].textContent.trim())

                }
              )
            });

          callback({HelpResults: helpResults});
      }
    }

    req.send(null);
    return req;
            
  }

export const searchAlmaStart = async function(query, callback) {
    const fuse = new Fuse(await searchData.get('startStudents'), {keys: ['name','process']});
    
    callback({AlmaStartResults: fuse.search(query)}); 
    return new XMLHttpRequest();
  }



export const obCommands = {
    'search': search,
    'email': searchByEmail,
    'whereis': searchWithLocations,
    'locate': searchWithLocations,
    'help': searchHelp,
    'start': searchAlmaStart,
    'as': searchAlmaStart
  }
  
  
export const checkForCommands = async function(text) {
    const defaultSearch = await options.defaultSearch.get();
    let doWhat = obCommands[defaultSearch];
    let command = defaultSearch;
    Object.entries(obCommands).forEach(([key, value]) => {
        var keySplit = key.split('');
        var regexString = "^"+keySplit.shift()+keySplit.join('?')+'?'+'\\s';
        var re = new RegExp(regexString, "g");
        if(text.match(re)){
          doWhat = value;
          text = text.replace(re, "");
          command = key;
        };
        
    });
    return [doWhat, text, command];
  }