import React from 'react'
import { TabLink } from './TabLink/TabLink'

function TabLinkList(props) {
    const tabLinks = props.tabLinks;
    
    const tabLinkItems = tabLinks.map(({iconClass, title, href}) => (
    <TabLink key={title} iconClass={iconClass} title={title} href={href} />
    )
    );
    return (
        <ul className="sc-tabmenu pure-menu pure-menu-horizontal">
            {tabLinkItems}
        </ul>
    );
}


export function Tab (props) {
    return(
       <TabLinkList tabLinks={props.tabLinks} />
    );
}

export default Tab