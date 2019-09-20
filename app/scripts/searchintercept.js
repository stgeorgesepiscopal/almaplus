import { options, searchData } from './storage';
import { search, searchByEmail, searchWithLocations, locateStudent, searchHelp, searchAlmaStart, obCommands, checkForCommands } from './search'
import {log} from './util'

const MAX_RESULTS = 15

var currentRequest = null;
var isLoggedIn = true;

// The extension will create a writable stream and store it in this dict
// until the response body is available.
var outStreams = {};

var doSomething = function () {};

async function doSearch(text, callback) {
    var subdomain = await options.subdomain.get();
    var apiStudent = await options.apiStudentUUID.get();

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
      
      var results = [];
      currentRequest = await doWhat(searchText, function(json) {
        
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
          for (var i = 0, entry; i < (entries.HelpResults.length <= MAX_RESULTS ? entries.HelpResults.length : MAX_RESULTS) && (entry = entries.HelpResults[i]); i++) {
              var path = entry.href;
              var template = entry.title+": "+" <dim>"+entry.content+"</dim>";
              
              var description = template.replace(new RegExp(searchText,"gi"), "<match>$&</match>") ;
              
              results.push({
                  first: entry.title,
                  category: entry.content,
                  content: path ,
                  description: description
              });
          }
        }
        else if (entries.hasOwnProperty('AlmaStartResults'))
        {
          isLoggedIn = true;
          for (var i = 0, entry; i < (entries.AlmaStartResults.length <= MAX_RESULTS ? entries.AlmaStartResults.length : MAX_RESULTS) && (entry = entries.AlmaStartResults[i]); i++) {
              var path = entry.href;
              var template = entry.name+": "+" <dim>"+entry.process+"</dim>";
              
              var description = template.replace(new RegExp(searchText,"gi"), "<match>$&</match>") ;
              
              results.push({
                  first: entry.name,
                  
                  category: entry.process,
                  content: path ,
                  description: description
              });
          }
        }
        else if (entries.hasOwnProperty('Message'))
        {
          isLoggedIn = true;
            for (var i = 0, entry; i < (entries.Message.length <= MAX_RESULTS ? entries.Message.length : MAX_RESULTS) && (entry = entries.Message[i]); i++) {
                var path = "https://"+subdomain+".getalma.com/parent/"+entry.id+"/bio";
                var template = entry.FirstName+" "+entry.LastName+" ["+entry.EmailAddresses[0].EmailAddress+"]";
                var regex1 = /<[^>]+>/;
                var template_split = template.split(regex1);
                var description = '<dim>Parent</dim> '+template_split.filter(function(e){ return e != '' }).join(" | ").replace(new RegExp(searchText,"gi"), "<match>$&</match>") ;
                
                results.push({
                    first: entry.FirstName,
                    last: entry.LastName,
                    middle: entry.MiddleName,
                    preferred: entry.PreferredName,
                    category: entry.EmailAddresses[0].EmailAddress,
                    profileUrl: entry.ProfileUrl,
                    content: path ,
                    description: description
                });
            }
        }
        else {
            isLoggedIn = true;
            for (var i = 0, entry; i < (entries.length <= MAX_RESULTS ? entries.length : MAX_RESULTS) && (entry = entries[i]); i++) {
            var path = "https://"+subdomain+".getalma.com/"+entry.ProfileUrl;
            //var line =
            //    entry.getElementsByTagName("match")[0].getAttribute("lineNumber");
            //var file = path.split("/").pop();
            var template = entry.DisplayName;
            var regex1 = /<[^>]+>/;
            var template_split = template.split(regex1);
            
            
            
                var description = '<dim>［'+entry.Category+ '］</dim> '+template_split.filter(function(e){ return e != '' }).join(" | ").replace(new RegExp(searchText,"gi"), "<match>$&</match>");
                if (entry.hasOwnProperty('Location')) {
                  description += "   <url>"+entry.Location+"</url>"
                }
                //description += '<url>PARENT</url>';
    
            results.push({
                first: entry.FirstName,
                    last: entry.LastName,
                    middle: entry.MiddleName,
                    preferred: entry.PreferredName,
                    
                    profileUrl: entry.ProfileUrl,
                category: entry.hasOwnProperty('Location') ? entry.Location : entry.Category,
                content: "https://"+subdomain+".getalma.com/"+entry.ProfileUrl ,
                description: description
            });
            }
        }
        
        //chrome.omnibox.setDefaultSuggestion({description: "<url>Top Results: </url>"+results[0].description});
        if ( results.length <= 0 ){
         
          //chrome.omnibox.setDefaultSuggestion({description: "<url>No results found for </url><match>"+encode(searchText)+"</match>"});
          results[0] = {
              content: "",
              description: "No results"
          }
        }
        //console.log(formatForAlmaSearch(results));
        
        callback({success: true, data: formatForAlmaSearch(results)});

        
      });
      //console.log("currentRequest", currentRequest)
      //return currentRequest;

      
    
  }


function almaSearchObject(data) {
  return {
        "FirstName":data.first || ' ',  
        "MiddleName":data.middle || ' ', 
        "LastName":data.last || ' ', 
        "PreferredName":data.preferred || ' ', 
        "Category":data.category || ' ', 
        "ProfileUrl":data.profileUrl || 'https://www.google.com', 
        "ProfilePictureUrl":data.profilePicture || "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAMAAAAoLQ9TAAABYlBMVEX//////4ArqqpVqqpJyMhVzMzu7t3/3Zn/zoZKv79Vysrj4+NGublGublVyM5It7dJu7tSzMxJv7/625ZLwMDY29hGubxHu7tRys/f2tdTy83e3Nf00Xze2teA08NSy85Ry8703KFMwMLt6uRFuLhSy81Ft7lLwMN609NFtrhCs7NEt7jc2dSn3NpFt7ey3tvw0YhRys3d29dMwsNwzs7b2NNZy83z1pPr6ePT5OBDtbbD4NzQ499Vy89DtbV+zbhWzM5Sy85Sy85DtLVOxclQx8tSy85Cs7SjzszY1tLf49/k6ONTx8vY1tFKv8FCsrNSy85BsrI7pqWyz8zq6eQ/sLDV08/x0YI8qKc+ra0/rq4/r69CtLRHurtHu71Mw8ZNw8VNw8ZNxMZOxshPx8pQyctSys1Sy81Sy85UwMNUwsVUy82Lz7PT0c3U0c3a2NTd29bi39ri4Nri4Nvt1ZLt6uRlDFKnAAAAWHRSTlMAAgYGDg8PDxUYGBsdISouMTI4OEFWX2FlZ2xzhouQnJ2mq6ytr7m/wMHCwsLDxcnJysvQ0dPW1tnb3d3d3t/g4uPm6+vu8PHx8fHy8/P09fX4+fn6/v7+KOwyOQAAALxJREFUeAFVwQNzA0EAx9Ffbdu2bRvt1e3Wvn+Ndr9/NpNMMvceAelFBCT0pxFQPUZcQcvC3GkDMbmr0vt/LZAMSaVQJz3rbTsFOpqZnYRF6UV6rYQu02tayZR0f3X9UA95ntnPplyO72sAKDNrifnLilgphBxzduDpUe3TEz0zu43AsTm/e7qdP7LWTl0OAUsXN3vDo33WaepsA0oO1zftlnXGUzOKcWo+Pr9+/n6/B7OIqujeONkZqSIsBE87LJq+TbZJAAAAAElFTkSuQmCC"
    }
}

function formatForAlmaSearch(results){
    var ret = [];
        results.forEach( (r) => {
            ret.push(almaSearchObject(r))
        }
    )
    return ret;
}

async function doSearchStuff(query){
    var returnMe = await formatForAlmaSearch(query)
    return {success: true, data: returnMe}
}


async function searchIntercept() {

    const settings = await options.get();

    browser.runtime.onMessageExternal.addListener(
        function(request, sender, sendResponse) {
            
            doSearch(request.search, sendResponse);
            //doSearch(request.search).then(sendResponse)
            //doSearch(request.search).then(sendResponse);
            return true;
            
         
        });

}
searchIntercept();

// main();