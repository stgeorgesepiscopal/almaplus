import React from 'react'

const TabHandle = ( {click, iconClass, title} ) => {
    const pureMenuItem = "pure-menu-item"
    const pureMenuLink = "pure-menu-link"

    return(
       <li className={pureMenuItem}>
           <button id={title} className={pureMenuLink} title={title}>{iconClass != "" && <i className={iconClass}> </i> }{' '} {title} </button>
       </li> 
    );
}

export {TabHandle};
export default TabHandle;