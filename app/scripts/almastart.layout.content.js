import React from 'react'
import ReactDOM from 'react-dom'
import Tab from './components/Tab/Tab'
import {injectScript} from './util'

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


ReactDOM.render(<div id="notes-div" style={{display: 'none'}}><ul><li><span className="date dimmed">Yesterday</span><img src="data:image/svg+xml;base64,PHN2ZyB2ZXJzaW9uPSIxLjEiIGJhc2VQcm9maWxlPSJmdWxsIiB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMzAiIGZpbGw9IiMzZmMxYzgiIC8+PHRleHQgeD0iMzAiIHk9IjQxLjIiIGZvbnQtZmFtaWx5PSJIZWx2ZXRpY2EiIGZvbnQtc2l6ZT0iMzIiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiNmZmZmZmYiPlJNPC90ZXh0Pjwvc3ZnPg==" alt="" className="photo profile-pic profile-pic-medium" /><h5>Meyers, Ryan</h5><p>A note</p></li></ul></div>, notesDiv)

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