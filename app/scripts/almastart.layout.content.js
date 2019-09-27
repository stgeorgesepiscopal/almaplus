import React from 'react'
import ReactDOM from 'react-dom'
import Tab from './components/Tab/Tab'

import {injectScript} from './util'
import {Notes} from './components/Note/Note'
import {options, searchData, useStore} from './storage'

const tabLinks = [
    {
        'title': 'overview',
        'iconClass': 'fas fa-file-alt',
        'href': document.querySelector('.sc-tabmenu').children[0].children[0].children[0].href
    },
    
]

const tabHandles = [
    {
        'title': 'notes',
        'iconClass': 'fas fa-id-card',
        'onClick': function() { document.querySelector('.sc-tabmenu').style.display = "none" }
    }
]

var notesDiv = document.createElement("div")
notesDiv.id = "notes-outer-div"
notesDiv.classList.add("profile-notes")
notesDiv.innerHTML = ``
document.getElementById("content").appendChild(notesDiv)

const [processId, studentId, instanceId] = document.location.pathname.split("/").slice(Math.max(document.location.pathname.split("/").length - 3, 1))

var newNoteTemplate = ''
var templateLines = 4

async function renderNotes() {
    
    const notes = await searchData.notes.get()
    
    //console.log(notes)
    //const n = notes.map( (note) => { return {name: note.author, body: note.body, date: note.date, uuid: note.uuid } } ) 
    const filteredNotes = notes.filter( note => note.person == studentId ).sort( (a,b)=>{ return a.dateInt > b.dateInt })
    if (filteredNotes.length == 0) {
        newNoteTemplate = await options.almaStartNewNoteTemplate.get()
        templateLines = (newNoteTemplate.match(/\n/g) || []).length + 1
    }
    return filteredNotes
    
}

renderNotes().then( (n) =>
    {
        
        ReactDOM.render(
        <div id="notes-div" style={{display: 'none'}}>
            <Notes notes={n}></Notes>
            <form class="pure-form" >
                <textarea class="pure-input-1" id="addNoteTextArea" name="Note" rows={templateLines} placeholder="add your note here" required="" defaultValue={newNoteTemplate}></textarea>
                <div class="buttons">
                    <span class="pure-button pure-button-primary" id="addNoteButton">Add Note</span>
                </div>
            </form>
        </div>, notesDiv)
        
    }
)



ReactDOM.render(
    <Tab className="menu-site" tabLinks={tabLinks} tabHandles={tabHandles} />,
     document.querySelector('.sc-tabmenu')
   );

   injectScript('', 'html', 'script',`
   
    var checkExist = setInterval(function() {
        if (document.querySelector('#notes') && document.querySelector('#addNoteButton') ) {
            document.getElementById("notes").addEventListener("click", () => {
                document.getElementsByClassName("pure-g")[1].style.display="none"
                document.getElementById("notes-div").style.display = "block"
                Array.from(document.getElementsByTagName('h3')).pop().innerText = "Notes"
            });
            
            document.getElementById("addNoteButton").addEventListener("click", () => {

                chrome.runtime.sendMessage(extensionId, {note: { body: document.getElementById('addNoteTextArea').value, uuid: '${studentId}', source: 'Alma+', type: 'almaStartPerson'  }},
                    function(response) {
                        console.log("Response: ",response);
                        if (!response.success) {
                            console.log("ERROR")
                        } else
                        {
                            var noteList = document.getElementById("noteList")
                            var note = document.createElement("li")
                            note.style.marginLeft="5px"
                            note.innerHTML = '<p>'+response.note.body+'</p><span class="date dimmed" style="float:none; font-size:10px;">Now</span>'+
                                '<img src="${chrome.runtime.getURL('images/icon-128.png')}" alt="" class="photo profile-pic profile-pic-medium" />'+
                                '<h5 style="display:inline; font-size: 12px; padding-left:5px;" >Me</h5>'
                            noteList.appendChild(note)
                            // Display the new note
                        }
                    }
                );
            });
                        
                        
            clearInterval(checkExist);
        }
        else {
            console.log("waiting");
        }
    }, 100); 

   `)