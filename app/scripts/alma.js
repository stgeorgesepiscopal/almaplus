import { options, searchData } from './storage';
import { escapeDoubleQuotes } from './util'

export const saveNote = async (note ) => {
    var settings = await options.get()
    const url = `https://${settings.subdomain}.getalma.com/student/${settings.apiStudentUUID}/save-note`
    return await fetch(url, {"body":`{"UserId":"${settings.apiStudentUUID}","RoleId":"20","Note":"${escapeDoubleQuotes(JSON.stringify(note))}"}`,"method":"POST","mode":"cors"}).then( (r) => { return r.text() }).then( (r) => { return r }).catch( (e) => {throw e});   
}

export const deleteNote = async(noteId ) => {
    var settings = await options.get()
    const url = `https://${settings.subdomain}.getalma.com/student/${settings.apiStudentUUID}/delete-note`
    fetch(url, {"body":`{"NoteId":"${noteId}"}`,"method":"POST","mode":"cors"}).then( (r) => { return r.text() }).then( (r) => { console.log(r)});   
}

export const sendMessage = async(to, subject, body ) => {
    var settings = await options.get()
    const url = `https://${settings.subdomain}.getalma.com/message/group/${settings.subdomain}_schoolcurrent_com`
    fetch(url, {"body":`{"Channels": ["1"], "UserIds":["${to}"], "Subject": "${subject}", "Message": "${body}"}`,"method":"POST","mode":"cors"}).then( (r) => { return r.text() }).then( (r) => { console.log(r)});   
}
//https://sges.getalma.com/student/5d67e14d70a9a1462f24cdc3/save-note