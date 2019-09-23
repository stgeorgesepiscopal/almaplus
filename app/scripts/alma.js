import { options, searchData } from './storage';

export const saveNote = async (note ) => {
    var settings = await options.get()
    const url = `https://${settings.subdomain}.getalma.com/student/${settings.apiStudent}/save-note`
    fetch(url, {"body":`{"UserId":"${settings.apiStudent}","RoleId":"20","Note":"${note}"}`,"method":"POST","mode":"cors"}).then( (r) => { return r.text() }).then( (r) => { console.log(r)});   
}

export const deleteNote = async(noteId ) => {
    var settings = await options.get()
    const url = `https://${settings.subdomain}.getalma.com/student/${settings.apiStudent}/delete-note`
    fetch(url, {"body":`{"NoteId":"${noteId}"}`,"method":"POST","mode":"cors"}).then( (r) => { return r.text() }).then( (r) => { console.log(r)});   
}

export const sendMessage = async(to, subject, body ) => {
    var settings = await options.get()
    const url = `https://${settings.subdomain}.getalma.com/message/group/${settings.subdomain}_schoolcurrent_com`
    fetch(url, {"body":`{"Channels": ["1"], "UserIds":["${to}"], "Subject": "${subject}", "Message": "${body}"}`,"method":"POST","mode":"cors"}).then( (r) => { return r.text() }).then( (r) => { console.log(r)});   
}
//https://sges.getalma.com/student/5d67e14d70a9a1462f24cdc3/save-note