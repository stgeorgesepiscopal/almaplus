import { saveAs } from 'file-saver';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib'
import html2pdf from 'html2pdf.js'
import pdfFromProcess from './pdfutil'

(async function() {
    
    var newStyle = document.createElement('style'); newStyle.innerHTML = ".pure-button-pdf { color: #eb6841; background: #fff; } .pdfIcon { margin-left:10px; margin-right:10px;} .lds-circle { display: inline-block; transform: translateZ(1px); } .lds-circle { display: inline-block; animation: lds-circle 2.4s cubic-bezier(0, 0.2, 0.8, 1) infinite; } @keyframes lds-circle {  0%, 100% { animation-timing-function: cubic-bezier(0.5, 0, 1, 0.5); } 0% { transform: rotateY(0deg); } 50% { transform: rotateY(1800deg); animation-timing-function: cubic-bezier(0, 0.5, 0.5, 1); } 100% { transform: rotateY(3600deg); } }"; document.getElementsByTagName('head')[0].append(newStyle);

    var pdfIcon = document.createElement('button');
    pdfIcon.classList.add('pure-button', 'pure-button-pdf', 'pure-button-large');
        var iconElement = document.createElement('i');
    iconElement.classList.add('fas','fa-file-pdf','fa-1x', 'pdfIcon');
    pdfIcon.append(iconElement);
    var pdfButtonText = document.createElement('span');
    pdfButtonText.innerHTML = "Download PDF";
    var pdfButtonProgress = document.createElement('span');
    pdfIcon.append(pdfButtonText);
    pdfIcon.append(pdfButtonProgress);
    document.getElementsByClassName("profile-user")[0].append(pdfIcon);
    pdfIcon.onclick = async function() {
        iconElement.classList.add('lds-circle');
        pdfButtonText.innerHTML = "Generating...";
        pdfButtonProgress.innerHTML = "0%";
        pdfFromProcess(document, pdfIcon)





    

    };

    // Your code here...
})();