import React from 'react'
import ReactDOM from 'react-dom'
import Tab from './components/Tab/Tab'
import {options} from './storage'

const tabLinks = [
    {
        'title': 'library',
        'iconClass': 'fas fa-file-alt',
        'href': '/reports'
    },
    {
        'title': 'builder',
        'iconClass': 'fas fa-hammer',
        'href': '/reports/report-builder-list'
    },
    {
        'title': 'students',
        'iconClass': 'fas fa-user-graduate',
        'href': '/reports/spreadsheets/student'
    },
    {
        'title': 'parents',
        'iconClass': 'fas fa-user-friends',
        'href': '/reports/spreadsheets/parent'
    },
    {
        'title': 'staff',
        'iconClass': 'fas fa-chalkboard-teacher',
        'href': '/reports/spreadsheets/staff'
    },
    {
        'title': 'classes',
        'iconClass': 'fas fa-school',
        'href': '/reports/spreadsheets/class'
    },
    
]
var settings = {}
async function getOptions() {
    settings = await options.get()
    if(settings.reportingComplianceTab)
    {
        tabLinks.push({
            'title': 'compliance',
            'iconClass': 'fas fa-check-double',
            'href': '/reports/state-reporting'
        })
    }
    if(settings.reportingTranscriptsTab) {
        tabLinks.push({
            'title': 'transcripts',
            'iconClass': 'fas fa-file-invoice',
            'href': '/reports/transcripts'
        })
    }

}

getOptions().then( () => {
ReactDOM.render(
    <Tab className="menu-site" tabLinks={tabLinks} tabHandles={[]}/>,
     document.querySelector('.sc-tabmenu')
   );
})
   