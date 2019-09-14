
import { options, useStore, inputId } from './storage';

async function reloadDashboard() {
    const stayAlive = await options.get('stayAlive');
    const subdomain = await options.get('subdomain');

    if(stayAlive){
        document.getElementById('bgiframe').src = "";
        document.getElementById('bgiframe').src = "https://"+subdomain+".getalma.com/keep-alive";
    }
   
}
setInterval(reloadDashboard, 60 * 1000)