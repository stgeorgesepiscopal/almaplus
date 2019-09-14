import React from 'react'
import ReactDOM from 'react-dom'
import Tab from './components/Tab/Tab'

const tabLinks = [
    {
        'title': 'reports',
        'iconClass': 'fas fa-file-alt',
        'href': '/reports'
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
    {
        'title': 'transcripts',
        'iconClass': 'fas fa-file-invoice',
        'href': '/reports/transcripts'
    }
]

ReactDOM.render(
    <Tab className="menu-site" tabLinks={tabLinks} />,
     document.querySelector('.sc-tabmenu')
   );