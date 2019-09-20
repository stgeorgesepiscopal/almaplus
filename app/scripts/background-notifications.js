import {searchData} from './storage'


function clickedNotificationButton(id, button) {
    
}

export function notifyAlmaStart(items) {
    console.log("In notify function", items)
    
    /* 
    
        enrolled: true
        grade: "Pre-School 2s"
        href: "https://sges.getalma.com/workflows/processes/5d0a73db7b86eb6fe20f6092/5d0bb7cfa814e421937c1365/5d0bb7cfa814e4219478ff00"
        name: "Yockey, Campbell"
        process: "2019-2020 Registration (Pre-School)"
        stage: "Registration"
        status: "Active (complete)"
        updated: "9/20/2019"

    */

    if (items.length > 5) {
       const processes = items.reduce(
        (unique, item) => {
            if (!unique[item.process]) {
                unique[item.process] = { process: item.process, amount: 1, updated: item.updated, href: item.href }
            } else {
               unique[item.process]["amount"] = unique[item.process]["amount"] + 1 
            } 
            return unique
        }, 
        {} )

        console.log("Processes", processes);
       items = Object.values(processes).map(
           process => {
               return { process: process.process, name: process.amount + (process.amount > 1 ? " people" : " person" ), updated: process.updated, href: process.href }
           }
       )

    }
    console.log(items);

    

    items.forEach( (item) => {
        var now = Date.now();
        var id = "AlmaPlus"+item.href+now;

        searchData.get('startNotifications').then( n => { n.push({id: id, href: item.href}); searchData.startNotifications.set(n); })

        var opt = {
            type: "basic",
            title: item.name,
            message: `${item.name} updated ${item.process} on ${item.updated}`,
            contextMessage: "Alma+",
            iconUrl: chrome.runtime.getURL('images/icon-128.png'),
            requireInteraction: true,
            buttons: [
                {
                    title: "Go to Process",

                }
            ],
            
          }

          chrome.notifications.create(id, opt, function(id) {
            var timer = setTimeout(function(){chrome.notifications.clear(id);}, 60000);
          });
        


    })
    
   
      
    }

