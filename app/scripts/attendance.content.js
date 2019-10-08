import React from 'react'
import ReactDOM from 'react-dom'
import Tab from './components/Tab/Tab'

import {injectScript, nodesFromXpath, clearBody} from './util'
import {Notes} from './components/Note/Note'
import {options, searchData, useStore} from './storage'

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

var classCache = []

async function fetchAndUpdateAttendance(node) {
    const updateNode = node;
    console.log(classCache)

    if (~classCache.indexOf(node.href)) {
        updateNode.parentElement.parentElement.children[4].append(classCache[node.href])
    } else {
    
        var url=node.href.replace(/student\//g, "home/get-student-schedule?studentId=");
        url = url.replace(/\/attendance.*/g,"&"+document.location.search.replace(/\?/g,"&"));

        if (settings.attendanceIgnoreClasses.indexOf(updateNode.parentElement.parentElement.children[2].innerText.trim()) <= -1) {
            
            const klass = await fetch(url)
            const res = await klass.json();
            const body = clearBody(res.Message.html)
            const parser = new DOMParser();
            const doc = parser.parseFromString(body, "text/html");
            const n = nodesFromXpath("//div[@class='class-info']", doc);
            
            const anchor = nodesFromXpath("//div[@class='class-info']//a",doc)
            console.log(anchor)
            
            const rosterF = await fetch(anchor[0].href + '/roster')
            const resF = await rosterF.text()
            const bodyF = clearBody(resF)
            const docF = parser.parseFromString(bodyF, "text/html")
            const nF = nodesFromXpath("//a[contains(@class,'fn')]",docF)
            nF.forEach( nn => {classCache[nn.href] = n[0].cloneNode(true) })
            


            updateNode.parentElement.parentElement.children[4].append(n[0]);
        };
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
    const removeNodes = nodesFromXpath(xpath, document)
    const notTaken = nodesFromXpath("//a[@data-codes='255']/strong")[0]
    notTaken.innerText = parseInt(notTaken.innerText) - removeNodes.length
    removeNodes.forEach( n => n.remove() )

    for (let n of nodesFromXpath("//tr[td[span[@class='attendance-nottaken']]]/td[2]/a[1]") ) { 
        console.log(n); await fetchAndUpdateAttendance(n); 
    }
    
    
    
    }
    
)
