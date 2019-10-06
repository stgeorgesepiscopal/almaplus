import { nodesFromXpath, clearBody } from './util'
import {encode} from 'he'
import Fuse from 'fuse.js';
import { options, searchData } from './storage';

var settings = {subdomain: 'seastar', apiStudentUUID: '5d93801df7769f6c6624600b' }

async function initialize() {
    settings = await options.get()
}
initialize();


export const searchByEmail = function(query, callback) {
    var url = "https://"+settings.subdomain+".getalma.com/student/"+settings.apiStudentUUID+"/search-parents?email=" + query ;
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

  export const search = function (query, callback) {
    console.log("Debug Search", query);
    
    if(query.includes("@") )
    {
      return searchByEmail(query, callback);
        // https://sges.getalma.com/student/5d02296c70a9a12b391a12d5/search-parents?email=rjmcw
        //var url = "https://"+subdomain+".getalma.com/student/"+apiStudent+"/search-parents?email=" + query ;
    }
   
    var url = "https://"+settings.subdomain+".getalma.com/directory/search?q=" + query ;
    var req = new XMLHttpRequest();
    req.open("GET", url, true);
    req.setRequestHeader("X-Requested-With", "XMLHttpRequest");
    req.onreadystatechange = function() {
      if (req.readyState == 4) {

        const results = JSON.parse(req.responseText)
        console.log(results)
        results.sort( (a,b) => {
            var bigStringA = a.hasOwnProperty('PreferredName') ? a.PreferredName.toLowerCase().padEnd(20," ") : a.FirstName.toLowerCase().padEnd(20," ") +
                             a.FirstName.toLowerCase().padEnd(20," ") +
                             a.LastName.toLowerCase().padEnd(20," ") +
                             a.MiddleName.toLowerCase().padEnd(20," ")
            var bigStringB = b.hasOwnProperty('PreferredName') ? b.PreferredName.toLowerCase().padEnd(20," ") : b.FirstName.toLowerCase().padEnd(20," ") +
                             b.FirstName.toLowerCase().padEnd(20," ") +
                             b.LastName.toLowerCase().padEnd(20," ") +
                             b.MiddleName.toLowerCase().padEnd(20," ")
            return bigStringA.indexOf(query.toLowerCase()) - bigStringB.indexOf(query.toLowerCase())
        })
        callback(results);
      }
    }
    req.send(null);
    return req;
  }


export const searchWithLocations = function(query, callback) {

    if(query.includes("@") )
    {
      return searchByEmail(query, callback);
        // https://sges.getalma.com/student/5d02296c70a9a12b391a12d5/search-parents?email=rjmcw
        //var url = "https://"+subdomain+".getalma.com/student/"+apiStudent+"/search-parents?email=" + query ;
    }

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
    var url = "https://"+settings.subdomain+".getalma.com/home/get-student-schedule?studentId=" + studentId ;
    
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

    
    const helpSubdomain = (settings.subdomain == "seastar" ? "help-demo" : "help")
    const url = `http://${helpSubdomain}.getalma.com/en/?q=${query}`;

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
                  //href: "http://help.getalma.com"+node.children[0].pathname,
                  href: `http://${helpSubdomain}.getalma.com${node.children[0].pathname}`,
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

const _searchAlmaStart = async function(query) {
  const fuse = new Fuse(await searchData.get('startStudents'), {keys: ['name','process'], tokenize: true});
  return fuse.search(query)
}

export const searchAlmaStart = async function(query, callback) {
    if(await options.almaStartIncludeNotesInSearch.get()){
      callback({AlmaStartResults: (await _searchAlmaStartNotes(query)).concat(...await _searchAlmaStart(query)) }); 
    } else {
      callback({AlmaStartResults: await _searchAlmaStart(query) });   
    }
    
  }

const _searchAlmaStartNotes = async function(query) {
    const startStudents = await searchData.get('startStudents')
    const notes = await searchData.get('notes')
    console.log(notes)

    const searchableNotes = notes.map( (n) => { return n.body.split(/\s+/).map( (w) => { return {word: w, person: n.person} } ) } )
    console.log(searchableNotes)

    const notesFuse = new Fuse([].concat(...searchableNotes), {id: 'person', threshold: 0.3, keys:['word']})
    
    const notesMatches = Array.from(new Set(notesFuse.search(query)))
    console.log(notesMatches)
    
    const matches = startStudents.filter( (a) => {return ~notesMatches.indexOf(a.studentId)})
    return matches
    
  }

export const searchAlmaStartNotes = async function(query, callback) {
  callback({AlmaStartResults: await _searchAlmaStartNotes(query)})
}



export const obCommands = {
    'directory': search,
    'search': search,
    'email': searchByEmail,
    'whereis': searchWithLocations,
    'locate': searchWithLocations,
    'help': searchHelp,
    'start': searchAlmaStart,
    'as': searchAlmaStart,
    'notes': searchAlmaStartNotes,
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