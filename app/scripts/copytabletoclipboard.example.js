
// Show images:
var filePill = document.getElementsByClassName("file-pill")[0]; var fileUri = filePill.childNodes[3].href; imgEl = document.createElement("img"); imgEl.src = fileUri; imgEl.width=400; filePill.append(imgEl);

// Copy Alma Start table data to clipboard
var range = document.createRange(); range.selectNodeContents(document.getElementsByClassName("students-list")[0]); window.getSelection().removeAllRanges(); window.getSelection().addRange(range); document.execCommand("copy");