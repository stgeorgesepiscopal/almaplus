import { nodesFromXpath, clearBody } from './util'
import {encode} from 'he'
import Fuse from 'fuse.js';
import { options, searchData } from './storage';

import { search, searchByEmail, searchWithLocations, locateStudent, searchHelp, searchAlmaStart, obCommands, checkForCommands } from './search'

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

chrome.omnibox.onInputChanged.addListener(async function(text, suggest) {
    if (currentRequest != null) {
        try {
          currentRequest.onreadystatechange = null;
          currentRequest.abort();
          currentRequest = null;
        } catch (e) {
          console.log(e)
        }
      }

      const [doWhat, searchText, command] = await checkForCommands(text);
  
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
                var template = entry.FirstName+" "+( entry.MiddleName.toLowerCase().indexOf(searchText.toLowerCase()) > -1 ? entry.MiddleName + " " : "")+( entry.PreferredName != entry.FirstName && entry.PreferredName.toLowerCase().indexOf(searchText.toLowerCase()) > -1 ? "("+entry.PreferredName + ") " : "")+entry.LastName+" ["+entry.EmailAddresses[0].EmailAddress+"]";
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
            var template = entry.FirstName+" "+( entry.MiddleName.toLowerCase().indexOf(searchText.toLowerCase()) > -1 ? entry.MiddleName + " " : "")+( entry.PreferredName != entry.FirstName && entry.PreferredName.toLowerCase().indexOf(searchText.toLowerCase()) > -1 ? "("+entry.PreferredName + ") " : "")+entry.LastName
            var regex1 = /<[^>]+>/;
            var template_split = template.split(regex1);
            
            
            
                var description = '<dim>［'+pad(entry.Category,8) + '］</dim> '+template_split.filter(function(e){ return e != '' }).join(" | ").replace(new RegExp(searchText,"gi"), "<match>$&</match>");
                if (entry.hasOwnProperty('Location')) {
                  description += "   <url>"+entry.Location+"</url>"
                }
                
    
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

