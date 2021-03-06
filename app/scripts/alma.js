import { options, searchData } from './storage';
import { escapeDoubleQuotes, smarten } from './util'

export const saveNote = async (note ) => {
    var settings = await options.get()
    const url = `https://${settings.subdomain}.getalma.com/student/${settings.apiStudentUUID}/save-note`
    note.body = smarten(note.body)
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

export const saveMedical = async(student, alertMessage, notes) => {
    var settings = await options.get()
    const url = `https://${settings.subdomain}.getalma.com/student/${student}/medical-save`
    fetch(url, {"body":`{"MedicalAlertMessage":"${alertMessage}", "MedicalNotes":"${notes}", "redirect":"1"}`, "method":"POST", "mode":"cors"}).then( (r) => { return r.text() }).then( (r) => { console.log(r)});

}

export const getMedical = async(student) => {
    var settings = await options.get()
    const url = `https://${settings.subdomain}.getalma.com/reports/spreadsheets/student/get-complex-attribute-edit`
    var json = { attribute: { Entity: "Student", DataPath: "MedicalNotes"
        }, entityId: student }
    var f = await fetch(url, {"body":JSON.stringify(json),"method":"POST","mode":"cors"})
    var j = await f.json()
    var medAlert = j.Message.html.match(/<textarea name="MedicalAlertMessage" [^>]+>(.*)<\/textarea>/)[1]
    var medNotes = j.Message.html.match(/<textarea class="edit" name="MedicalNotes" [^>]+>(.*)<\/textarea>/)[1]
    return { MedicalAlertMessage: medAlert,
             MedicalNotes: medNotes,
             redirect: "1" }
    
}

export const uploadFile = async(student, file) => {
    var settings = await options.get()
    var fd = new FormData();
    console.log(file);
    fd.append("Files[]",file);
    fetch(`https://${settings.subdomain}.getalma.com/student/${student}/file-cabinet-upload`, {'Content-Type': 'disable', 'method': 'POST', 'body': fd}).then(r=>{console.log(r); return r.text()}).then(r=>{console.log(r)});

}

export const deleteFromProcess = async( processId, studentId, instanceId) => {
    // processId/studentId/instanceId ?
    // https://sges.getalma.com/workflows/processes/5d164e9ca814e40c8273473e/5d0bb8077b86eb2cb164f971/5d164fe97b86eb52ac1111bd/delete
    // https://sges.getalma.com/workflows/processes/5d164e9ca814e40c8273473e/5d0bb8007b86eb2cb3227e9f/5d16510a7b86eb52c74dbba6/delete
    // https://sges.getalma.com/workflows/processes/5d0bb4a0a814e421957d8eaa/5d0bb8077b86eb2cb164f971/5d0bb8077b86eb2cb21d74ae/delete
    var settings = await options.get()
    var fd = new FormData();
    fd.append("confirm","DESTROY");
    fd.append("id", instanceId);
    fetch(`https://${settings.subdomain}.getalma.com/workflows/processes/${processId}/${studentId}/${instanceId}/delete`, {'Content-Type': 'disable', 'method': 'POST', 'body': fd}).then(r=>{console.log(r); return r.text()}).then(r=>{console.log(r)});


}


export const goPlaces = [
        {keyword: 'directory', title: 'School Directory', url:`/directory`},
        {keyword: 'calendar', title: 'Calendar', url:`/calendar`},
        {keyword: 'courses', title: 'Courses', url:`/courses`},
        {keyword: 'classes', title: 'Classes', url:`/classes`},
        {keyword: 'bulk attendance', title: 'Attendance Bulk Editor', url:`/attendance`},
        {keyword: 'attendance today', title: 'Today\'s Attendance', url:`/reports/school-attendance`},
        {keyword: 'missing attendance', title: 'Today\'s Missing Attendance', url:`/reports/school-attendance?status=255`},
        {keyword: 'class attendance', title: 'Today\'s Class Attendance', url:`/reports/class-attendance`},
        {keyword: 'reports', title: 'Reports Library', url:`/reports`},
        {keyword: 'compliance reports', title: 'Compliance', url:`/reports/state-reporting`},
        {keyword: 'transcripts', title: 'Transcripts', url:`/reports/transcripts`},
        {keyword: 'report builder', title: 'Reports Builder', url:`/reports/report-builder-list`},
        {keyword: 'spreadsheet students', title: 'Student Spreadsheet Editor', url:`/reports/spreadsheets/student`},
        {keyword: 'spreadsheet parents', title: 'Parent Spreadsheet Editor', url:`/reports/spreadsheets/parent`},
        {keyword: 'spreadsheet staff', title: 'Staff Spreadsheet Editor', url:`/reports/spreadsheets/staff`},
        {keyword: 'spreadsheet classes', title: 'Class Spreadsheet Editor', url:`/reports/spreadsheets/class`},
        {keyword: 'spreadsheet classes', title: 'Class Spreadsheet Editor', url:`/reports/spreadsheets/class`},
        {keyword: 'template library', title: 'Report Card Template Library', url:`/report-cards/templates`},
        {keyword: 'targets', title: 'Report Card Targets', url:`/report-cards/targets`},
        {keyword: 'cycles', title: 'Report Card Cycles', url:`/report-cards/setup`},
        {keyword: 'activities', title: 'Activities', url:`/activities`},
        {keyword: 'scheduling', title: 'Scheduling', url:`/scheduling`},
        {keyword: 'alma start', title: 'Alma Start Process Review', url:`/workflows/processes/review`},
        {keyword: 'processes alma start', title: 'Alma Start Process List', url:`/workflows/processes`},
        {keyword: 'forms alma start', title: 'Alma Start Forms', url:`/workflows/forms`},
        {keyword: 'bulletin', title: 'Bulletin', url:`/bulletin`},
        {keyword: 'settings', title: 'Settings', url:`/settings`},
        {keyword: 'school year settings', title: 'Settings: School Year', url:`/settings/school-year`},
        {keyword: 'bell schedule settings', title: 'Settings: Bell Schedules', url:`/settings/schedule`},
        {keyword: 'settings attendance', title: 'Settings: Attendance', url:`/settings/attendance`},
        {keyword: 'subjects settings', title: 'Settings: Subjects', url:`/settings/subjects`},
        {keyword: 'grading scales settings', title: 'Settings: Grading Scales', url:`/settings/grading-scales`},
        {keyword: 'settings transcripts', title: 'Settings: Transcripts', url:`/settings/transcripts`},
        {keyword: 'groups settings', title: 'Settings: Groups', url:`/settings/groups`},
    ]