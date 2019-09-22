import React from 'react'
import { TabLink } from './TabLink/TabLink'
import { TabHandle } from './TabHandle/TabHandle'

function TabLinkList(props) {
    const tabLinks = props.tabLinks;
    const tabHandles = props.tabHandles;
    
    const tabLinkItems = tabLinks.map(({iconClass, title, href}) => (
    <TabLink key={title} iconClass={iconClass} title={title} href={href} />
    ));
    const tabHandleItems = tabHandles.map(({iconClass, title, click}) => (
        <TabHandle key={title} iconClass={iconClass} title={title} click={click} />
        )
    );
    return (
        <ul className="sc-tabmenu pure-menu pure-menu-horizontal">
            {tabLinkItems}
            {tabHandleItems}
        </ul>
    );
}


export function Tab (props) {
    return(
       <TabLinkList tabLinks={props.tabLinks} tabHandles={props.tabHandles} />
    );
}

export default Tab