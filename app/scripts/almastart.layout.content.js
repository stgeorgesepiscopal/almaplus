import React from 'react'
import ReactDOM from 'react-dom'
import Tab from './components/Tab/Tab'
import {injectScript} from './util'
import {Notes} from './components/Note/Note'
import {searchData, useStore} from './storage'

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

async function renderNotes() {
    const notes = await searchData.notes.get()
    const n = notes.map( (note) => { return {name: note.name.source, body: note.name.body, date: note.name.uuid, uuid: note.name.uuid } } ) 
    return n
    
}

renderNotes().then( (n) =>
    {
        
        ReactDOM.render(<div id="notes-div" style={{display: 'none'}}><Notes notes={n}></Notes></div>, notesDiv)
        
    }
)



ReactDOM.render(
    <Tab className="menu-site" tabLinks={tabLinks} tabHandles={tabHandles} />,
     document.querySelector('.sc-tabmenu')
   );

   injectScript('', 'html', 'script',`
   
    var checkExist = setInterval(function() {
        if (document.querySelector('#notes')) {
            document.getElementById("notes").addEventListener("click", () => {
                console.log("clicked")
                document.getElementsByClassName("pure-g")[1].style.display="none"
                document.getElementById("notes-div").style.display = "block"
            });
        clearInterval(checkExist);
        }
        else {
            console.log("waiting");
        }
    }, 100); 


   `)