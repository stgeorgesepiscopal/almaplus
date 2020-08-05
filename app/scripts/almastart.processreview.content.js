import { saveAs } from 'file-saver';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib'
import html2pdf from 'html2pdf.js'
import {pdfFromProcess} from './pdfutil'
import { search } from './search'
import { options } from './storage'
import { uploadFile } from './alma'
import { nodesFromXpath, clearBody } from './util'

var settings = [{subdomain:'unknown'}];

(async function() {
    
    var newStyle = document.createElement('style'); newStyle.innerHTML = ".pure-button-pdf { color: #eb6841; background: #fff; } .pdfIcon { margin-left:10px; margin-right:10px;} .lds-circle { display: inline-block; transform: translateZ(1px); } .lds-circle { display: inline-block; animation: lds-circle 2.4s cubic-bezier(0, 0.2, 0.8, 1) infinite; } @keyframes lds-circle {  0%, 100% { animation-timing-function: cubic-bezier(0.5, 0, 1, 0.5); } 0% { transform: rotateY(0deg); } 50% { transform: rotateY(1800deg); animation-timing-function: cubic-bezier(0, 0.5, 0.5, 1); } 100% { transform: rotateY(3600deg); } }"; document.getElementsByTagName('head')[0].append(newStyle);

    var completedStudents = nodesFromXpath('//tr[.//td[contains(text(),"Complete")]]/td/a')

    completedStudents.forEach(element => {

        var pdfIcon = document.createElement('span');
        pdfIcon.classList.add('pure-button', 'pure-button-pdf', 'pure-button-large');
            var iconElement = document.createElement('i');
        iconElement.classList.add('fas','fa-file-pdf','fa-1x', 'pdfIcon');
        pdfIcon.append(iconElement);
        var pdfButtonText = document.createElement('span');
        pdfButtonText.innerHTML = "PDF";
        var pdfButtonProgress = document.createElement('span');
        pdfIcon.append(pdfButtonText);
        pdfIcon.append(pdfButtonProgress);
        element.parentElement.parentElement.children[4].classList.add("no-clickable")
        element.parentElement.parentElement.children[4].append(pdfIcon);
        
        
        var onClickFunction = async function(event) {
           
            var response = await fetch(element.href);
            var json = await response.text();
            var body = clearBody(json);
            
            var parser = new DOMParser();
            var doc = parser.parseFromString(body, "text/html");
            iconElement.classList.add('lds-circle');
            pdfButtonText.innerHTML = "";
            pdfButtonProgress.innerHTML = "0%";
            pdfFromProcess(doc, false,(pPercent=0,pMessage='') => {
                if (pPercent) {  pdfButtonProgress.innerHTML = parseInt(pPercent)+'%' } else { iconElement.classList.remove('lds-circle'); }
                if (pMessage) {  pdfButtonText.innerHTML = pMessage }
                if (~pMessage.indexOf("Done")) {
                     iconElement.classList.remove('lds-circle')
                     pdfButtonProgress.innerHTML = ""
                    }
            })

        };

        pdfIcon.onclick = function(e) {
            e.stopPropagation();
            onClickFunction();
        }

    });

    // Your code here...
})();
/** 
(async function() {
    
    var newStyle = document.createElement('style'); newStyle.innerHTML = ".pure-button-pdf { color: #eb6841; background: #fff; } .pdfIcon { margin-left:10px; margin-right:10px;} .lds-circle { display: inline-block; transform: translateZ(1px); } .lds-circle { display: inline-block; animation: lds-circle 2.4s cubic-bezier(0, 0.2, 0.8, 1) infinite; } @keyframes lds-circle {  0%, 100% { animation-timing-function: cubic-bezier(0.5, 0, 1, 0.5); } 0% { transform: rotateY(0deg); } 50% { transform: rotateY(1800deg); animation-timing-function: cubic-bezier(0, 0.5, 0.5, 1); } 100% { transform: rotateY(3600deg); } }"; document.getElementsByTagName('head')[0].append(newStyle);

    var pdfIcon = document.createElement('button');
    pdfIcon.classList.add('pure-button', 'pure-button-pdf', 'pure-button-large');
        var iconElement = document.createElement('i');
    iconElement.classList.add('fas','fa-file-pdf','fa-1x', 'pdfIcon');
    pdfIcon.append(iconElement);
    var pdfButtonText = document.createElement('span');
    pdfButtonText.innerHTML = "Download Health PDF";
    var pdfButtonProgress = document.createElement('span');
    pdfIcon.append(pdfButtonText);
    pdfIcon.append(pdfButtonProgress);
    document.getElementsByClassName("profile-user")[0].append(pdfIcon);
    pdfIcon.onclick = async function() {
        iconElement.classList.add('lds-circle');
        pdfButtonText.innerHTML = "Generating...";
        pdfButtonProgress.innerHTML = "0%";
        pdfFromProcess(document, true,(pPercent=0,pMessage='') => {
            if (pPercent) {  pdfButtonProgress.innerHTML = parseInt(pPercent)+'%' } else { iconElement.classList.remove('lds-circle'); }
            if (pMessage) {  pdfButtonText.innerHTML = pMessage }
            if (~pMessage.indexOf("Done")) { iconElement.classList.remove('lds-circle')}
        })

    };

    // Your code here...
})();

(async function() {
    settings = await options.get();
    search(document.getElementsByClassName('fn')[0].textContent, res=>{
        console.log(res);
        if(res.length > 0) {
            var studentId = res[0].id;
            var studentName = res[0].DisplayName;

            var pdfIcon = document.createElement('button');
            pdfIcon.classList.add('pure-button', 'pure-button-pdf', 'pure-button-large');
                var iconElement = document.createElement('i');
            iconElement.classList.add('fas','fa-file-pdf','fa-1x', 'pdfIcon');
            pdfIcon.append(iconElement);
            var pdfButtonText = document.createElement('span');
            pdfButtonText.innerHTML = `Place PDF in File Cabinet (${studentName})`;
            var pdfButtonProgress = document.createElement('span');
            pdfIcon.append(pdfButtonText);
            pdfIcon.append(pdfButtonProgress);
            document.getElementsByClassName("profile-user")[0].append(pdfIcon);
            pdfIcon.onclick = async function() {
                iconElement.classList.add('lds-circle');
                pdfButtonText.innerHTML = "Generating...";
                pdfButtonProgress.innerHTML = "0%";
                var fileBlob = await pdfFromProcess(document, false,(pPercent=0,pMessage='') => {
                    if (pPercent) {  pdfButtonProgress.innerHTML = parseInt(pPercent)+'%' } else { iconElement.classList.remove('lds-circle'); }
                    if (pMessage) {  pdfButtonText.innerHTML = pMessage }
                    if (~pMessage.indexOf("Done")) { iconElement.classList.remove('lds-circle')}
                }, true)
                uploadFile(studentId, fileBlob)


            };
        }

    })
    
    

    // Your code here...
})();


(async function() {
    settings = await options.get();
    search(document.getElementsByClassName('fn')[0].textContent, res=>{
        console.log(res);
        if(res.length > 0) {
            var studentId = res[0].id;
            var studentName = res[0].DisplayName;

            var pdfIcon = document.createElement('button');
            pdfIcon.classList.add('pure-button', 'pure-button-pdf', 'pure-button-large');
                var iconElement = document.createElement('i');
            iconElement.classList.add('fas','fa-file-pdf','fa-1x', 'pdfIcon');
            pdfIcon.append(iconElement);
            var pdfButtonText = document.createElement('span');
            pdfButtonText.innerHTML = `Place Health PDF in File Cabinet (${studentName})`;
            var pdfButtonProgress = document.createElement('span');
            pdfIcon.append(pdfButtonText);
            pdfIcon.append(pdfButtonProgress);
            document.getElementsByClassName("profile-user")[0].append(pdfIcon);
            pdfIcon.onclick = async function() {
                iconElement.classList.add('lds-circle');
                pdfButtonText.innerHTML = "Generating...";
                pdfButtonProgress.innerHTML = "0%";
                var fileBlob = await pdfFromProcess(document, true,(pPercent=0,pMessage='') => {
                    if (pPercent) {  pdfButtonProgress.innerHTML = parseInt(pPercent)+'%' } else { iconElement.classList.remove('lds-circle'); }
                    if (pMessage) {  pdfButtonText.innerHTML = pMessage }
                    if (~pMessage.indexOf("Done")) { iconElement.classList.remove('lds-circle')}
                }, true)
                uploadFile(studentId, fileBlob)


            };
        }

    })
    
    

    // Your code here...
})();

*/