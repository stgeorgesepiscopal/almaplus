import React from 'react'

const TabLink = ( {href, iconClass, title} ) => {
    const pureMenuItem = "pure-menu-item"
    const pureMenuLink = "pure-menu-link"
    return(
       <li className={pureMenuItem}>
           <a href={href} className={pureMenuLink} title={title}>{iconClass != "" && <i className={iconClass}> </i> }{' '} {title}</a>
       </li> 
    );
}

export {TabLink};
export default TabLink;