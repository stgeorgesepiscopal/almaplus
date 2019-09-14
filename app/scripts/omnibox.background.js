import { nodesFromXpath, clearBody } from './util'
import {encode} from 'he'
import Fuse from 'fuse.js';
import { options, searchData } from './storage';

var subdomain = "sges";
var apiStudent = "5d67e14d70a9a1462f24cdc3"
var currentRequest = null;
var topResult = '';
var isLoggedIn = false;

const shiftCharCode = Δ => c => String.fromCharCode(c.charCodeAt(0) + Δ);
const toFullWidth = str => str.replace(/[!-~]/g, shiftCharCode(0xFEE0));
const pad = (str, length, char = '　') => {
 str = toFullWidth(str.trim());
 if (str.length % 2 == 1) {
     str = ' '+str+' ';
     length = length + 1;
 }
 return str.padStart((str.length + length) / 2, char).padEnd(length, char);
}

 

chrome.omnibox.onInputEntered.addListener(function(text) {
    // Encode user input for special characters , / ? : @ & = + $ #
    //var newURL = 'https://www.google.com/search?q=' + ;
    if ( text.indexOf('http') == -1) {
        text = topResult.content;
    }
    chrome.tabs.create({ url: text });
  });

chrome.omnibox.onInputChanged.addListener(function(text, suggest) {
    if (currentRequest != null) {
        try {
          currentRequest.onreadystatechange = null;
          currentRequest.abort();
          currentRequest = null;
        } catch (e) {
          console.log(e)
        }
      }

      const [doWhat, searchText, command] = checkForCommands(text);
  
      try { updateDefaultSuggestion(encode(text)); } catch (err) { chrome.omnibox.setDefaultSuggestion( { description: '<url>ERROR: </url>'+err.toString() } ); };
      if (text == '' || text == 'halp'){
        chrome.omnibox.setDefaultSuggestion( { description: 'Start typing to search, or use commands: <match>l</match>ocate, <match>e</match>mail, ...' } );
        return;
      }

      
      

      
  
      currentRequest = doWhat(searchText, function(json) {
        var results = [];
        var entries = json;
        console.log("Debug Current Request", entries);
        if (entries.hasOwnProperty('ErrorCode') && entries.ErrorCode > 0) {
          isLoggedIn = false;
            results.push({
                content: "https://"+subdomain+".getalma.com/",
                description: "Log in to Alma"
            });
        }
        else if (entries.hasOwnProperty('HelpResults'))
        {
          isLoggedIn = true;
          for (var i = 0, entry; i < (entries.HelpResults.length <= 4 ? entries.HelpResults.length : 4) && (entry = entries.HelpResults[i]); i++) {
              var path = entry.href;
              var template = entry.title+": "+" <dim>"+entry.content+"</dim>";
              
              var description = template.replace(new RegExp(searchText,"gi"), "<match>$&</match>") ;
              
              results.push({
                  content: path ,
                  description: description
              });
          }
        }
        else if (entries.hasOwnProperty('AlmaStartResults'))
        {
          isLoggedIn = true;
          for (var i = 0, entry; i < (entries.AlmaStartResults.length <= 4 ? entries.AlmaStartResults.length : 4) && (entry = entries.AlmaStartResults[i]); i++) {
              var path = entry.href;
              var template = entry.name+": "+" <dim>"+entry.process+"</dim>";
              
              var description = template.replace(new RegExp(searchText,"gi"), "<match>$&</match>") ;
              
              results.push({
                  content: path ,
                  description: description
              });
          }
        }
        else if (entries.hasOwnProperty('Message'))
        {
          isLoggedIn = true;
            for (var i = 0, entry; i < (entries.Message.length <= 4 ? entries.Message.length : 4) && (entry = entries.Message[i]); i++) {
                var path = "https://"+subdomain+".getalma.com/parent/"+entry.id+"/bio";
                var template = entry.FirstName+" "+entry.LastName+" ["+entry.EmailAddresses[0].EmailAddress+"]";
                var regex1 = /<[^>]+>/;
                var template_split = template.split(regex1);
                var description = '<dim>［'+pad("Parent",8)+'］</dim> '+template_split.filter(function(e){ return e != '' }).join(" | ").replace(new RegExp(searchText,"gi"), "<match>$&</match>") ;
                
                results.push({
                    content: path ,
                    description: description
                });
            }
        }
        else {
            isLoggedIn = true;
            for (var i = 0, entry; i < (entries.length <= 4 ? entries.length : 4) && (entry = entries[i]); i++) {
            var path = "https://"+subdomain+".getalma.com/"+entry.ProfileUrl;
            //var line =
            //    entry.getElementsByTagName("match")[0].getAttribute("lineNumber");
            //var file = path.split("/").pop();
            var template = entry.DisplayName;
            var regex1 = /<[^>]+>/;
            var template_split = template.split(regex1);
            
            
            
                var description = '<dim>［'+pad(entry.Category,8) + '］</dim> '+template_split.filter(function(e){ return e != '' }).join(" | ").replace(new RegExp(searchText,"gi"), "<match>$&</match>");
                if (entry.hasOwnProperty('Location')) {
                  description += "   <url>"+entry.Location+"</url>"
                }
                //description += '<url>PARENT</url>';
    
            results.push({
                content: "https://"+subdomain+".getalma.com/"+entry.ProfileUrl ,
                description: description
            });
            }
        }
        topResult = results[0];
        //chrome.omnibox.setDefaultSuggestion({description: "<url>Top Results: </url>"+results[0].description});
        if(!isLoggedIn) {
          chrome.omnibox.setDefaultSuggestion({description: results[0].description});
          chrome.tabs.create({url:"https://"+subdomain+".getalma.com/", active:true}, function(tab){
            //chrome.tabs.remove(tab.id);
        });
        
        } else if ( results.length > 0 ){
          chrome.omnibox.setDefaultSuggestion({description: "<url>Top Result"+(command == 'search' ? "": " ["+command+"]")+": </url>"+topResult.description});
        }
        else {
          chrome.omnibox.setDefaultSuggestion({description: "<url>No results found for </url><match>"+encode(searchText)+"</match>"});
        }
        try {
          suggest(results);
        } catch(err) {
          suggest([{content: "#", description: "<url><match>Error:</match></url>"+err.toString() }]);
          chrome.omnibox.setDefaultSuggestion({description: "<url><match>Error:</match></url>"+err.toString()});
          console.log(err);
          console.log(results);
        }
      });
    
  });

const search = function (query, callback) {
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

  const searchByEmail = function(query, callback) {
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

  const searchWithLocations = function(query, callback) {

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

  const searchHelp = function(query, callback) {

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


  const searchAlmaStart = async function(query, callback) {
    const fuse = new Fuse(await searchData.get('startStudents'), {keys: ['name','process']});
    
    callback({AlmaStartResults: fuse.search(query)}); 
    return new XMLHttpRequest();
  }


  const locateStudent = async function(studentId) {
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
  
  
  
  function updateDefaultSuggestion(text) {
   
  
    var description = '<url>Searching Alma for </url> ';
    description += '<match>' + text + '</match>';
    
    
    chrome.omnibox.setDefaultSuggestion({
      description: description
    });
  }
  
  chrome.omnibox.onInputStarted.addListener(function() {
    chrome.omnibox.setDefaultSuggestion( { description: 'Start typing to search, or use commands: <match>l</match>ocate, <match>e</match>mail, ...' } );
  });


const obCommands = {
  'search': search,
  'email': searchByEmail,
  'whereis': searchWithLocations,
  'locate': searchWithLocations,
  'help': searchHelp,
  'start': searchAlmaStart,
  'as': searchAlmaStart
}

const checkForCommands = function(text) {
  let doWhat = search;
  let command = "search";
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
