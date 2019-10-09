import React from 'react'
import ReactDOM from 'react-dom'
import Tab from './components/Tab/Tab'

import {injectScript, nodesFromXpath, clearBody} from './util'
import {Notes} from './components/Note/Note'
import {options, searchData, useStore} from './storage'

const throat = require('throat')(Promise);

var settings = {}
async function buildXpath() {
    settings = await options.get()
    if (settings.attendanceIgnoreClasses.length > 0) {
        const classes = settings.attendanceIgnoreClasses.map( a => `contains(text(),'${a}')` )
        return `//tr[td[${classes.join(' or ')}]]`
    }
    else {
        return `/false`
    }
}

var classCache = {}
var abortControllers = {}

function updateClasses(node) {
    const student = node.href.split('/')[4]
    if (classCache.hasOwnProperty(student)) {
        node.parentElement.parentElement.children[4].innerHTML = ''
        node.parentElement.parentElement.children[4].append(classCache[student])
    }
}

async function fetchAndUpdateAttendance(node) {
    
    const updateNode = node;
    const student = node.href.split('/')[4]
    var n
    
    if (classCache.hasOwnProperty(student)) {
        return student
    } else {
        var controller = new AbortController()
        var signal = controller.signal
        abortControllers[student] = controller
    
        var url=node.href.replace(/student\//g, "home/get-student-schedule?studentId=");
        url = url.replace(/\/attendance.*/g,"&"+document.location.search.replace(/\?/g,"&"));

        if (settings.attendanceIgnoreClasses.indexOf(updateNode.parentElement.parentElement.children[2].innerText.trim()) <= -1) {
            
            const res = await fetch(url, {signal})
            const json = await res.json() 
        
            const body = clearBody(json.Message.html)
            const parser = new DOMParser();
            const doc = parser.parseFromString(body, "text/html");
            n = nodesFromXpath("//div[@class='class-info']", doc);
            
            const anchor = nodesFromXpath("//div[@class='class-info']//a",doc)
            
            const res2 = await fetch(anchor[0].href + '/roster')
            const text = await res2.text()
            const body2 = clearBody(text)
            const doc2 = parser.parseFromString(body2, "text/html")
            const nF = nodesFromXpath("//a[contains(@class,'fn')]",doc2)
                        
                        nF.forEach( nn => {
                            let student = nn.href.split('/')[4]
                            classCache[student] = n[0].cloneNode(true) 
                            if (abortControllers.hasOwnProperty(student)){
                                
                                abortControllers[student].abort()
                            }
                        })
                        nodesFromXpath("//tr[td[span[@class='attendance-nottaken']]]/td[2]/a[1]").forEach(
                            (n) => {
                                updateClasses(n)
                            }
                        )
                    

                    
                    
                    

                }
            return student
            
            
            
            
            
            
            


           // updateNode.parentElement.parentElement.children[4].append(n[0]);
        }
    }
    
  

var newStyle = document.createElement("style");
  newStyle.innerHTML = `
.pill {
background-color: #fff;
padding: .5em;
border-radius: 5px;
display: inline-block;
cursor: default;
margin-top: 1em;
font-size: 8pt;
}
.pure-button-pdf { color: #eb6841; background: #fff; padding: 0.1em;}
.pdfIcon { margin-left:2px; margin-right:2px;}
.lds-circle { display: inline-block; transform: translateZ(1px); }
.lds-circle { display: inline-block; animation: lds-circle 2.4s cubic-bezier(0, 0.2, 0.8, 1) infinite; }
@keyframes lds-circle {  0%, 100% { animation-timing-function: cubic-bezier(0.5, 0, 1, 0.5); } 0% { transform: rotateY(0deg); } 50% { transform: rotateY(1800deg); animation-timing-function: cubic-bezier(0, 0.5, 0.5, 1); } 100% { transform: rotateY(3600deg); } }

.class-info {
    flex-grow:1;
    padding-right: 0.75em;
}
.class-grade {
    flex: 0 0 50px;
    text-align: center;
    font-size: 1.5em;
    color: #888;
}
.class-grade small {
    display: block;
    font-size: .6em;
}
.class-info > span {
    font-size: .9em;
    color: #888;
    margin-right: 1em;
    white-space: nowrap;
}
.class-name {
    margin: 0 0 0.2em 0;
    font-size: 1em;
}

`;
  document.getElementsByTagName("head")[0].append(newStyle);

buildXpath().then( async (xpath) => {
    performance.mark("start-script")
    const removeNodes = nodesFromXpath(xpath, document)
    const notTaken = nodesFromXpath("//a[@data-codes='255']/strong")[0]
    notTaken.innerText = parseInt(notTaken.innerText) - removeNodes.length
    removeNodes.forEach( n => n.remove() )

    var lock = throat(4)

    var data = Promise.allSettled(nodesFromXpath("//tr[td[span[@class='attendance-nottaken']]]/td[2]/a[1]").map( (n)=> { 
        return lock(() => fetchAndUpdateAttendance(n)); 
    }))
    data.then( (d) => { 
        nodesFromXpath("//tr[td[span[@class='attendance-nottaken']]]/td[2]/a[1]").forEach(
            (n) => {
                updateClasses(n)
            }
        )
        performance.mark("end-script")
        performance.measure("total-script-execution-time", "start-script", "end-script");
        console.log(performance.getEntriesByName('total-script-execution-time'))
    })
    
    
        
    
    
    
    
    }
    
)
