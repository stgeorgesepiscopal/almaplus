import { saveAs } from 'file-saver';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib'
import {PromiseAllProgress} from './util'

//import html2canvas from 'html2canvas'
import { toPng, toJpeg, toBlob, toPixelData, toSvgDataURL } from 'html-to-image';



const readBlobAsArrayBuffer = (blob) => {
    const temporaryFileReader = new FileReader();
  
    return new Promise((resolve, reject) => {
      temporaryFileReader.onerror = () => {
        temporaryFileReader.abort();
        reject(new DOMException("Problem parsing input file."));
      };
  
      temporaryFileReader.onload = () => {
        resolve(temporaryFileReader.result);
      };
      temporaryFileReader.readAsArrayBuffer(blob);
    });
  };


  const offloadCreateHtmlPage = async(html, cb) => {

    return await new Promise( (resolve, reject) => {
        chrome.runtime.sendMessage(browser.runtime.id, {render: {html: html, cb: cb}}, function(response) {
            resolve(response)
        });
        
    }).catch( (e) => { console.log(e); return {type: 'none'} })
  }

/*
export const createHtmlPage = async (html, cb) => {
    var body = document.createElement("div")
    body.style.position = 'absolute'
    body.style.top = '-16384px'
    body.style.width = '850px'
    body.style.padding = '50px'
    
    body.innerHTML = html
    document.getElementsByTagName('body')[0].append(body)
    return await html2canvas(body, {
        allowTaint: true,
        backgroundColor: '#FFF',
        scale: 2,
        ignoreElement: (e) => {
            
        }
    }).then( (canvas) => { 
        //console.log("dataurl")
        //console.log(canvas.toDataURL('image/jpeg',1.0))
        return {
            type: 'image/jpeg',
            data: canvas.toDataURL('image/jpeg', 1.0) 
        }
    })
}*/

export const createHtmlPage = async (html, cb) => {
    var body = document.createElement("div")
    body.style.width = '850px'
    body.style.height = '1100px'
    body.style.padding = '50px'
    
    body.innerHTML = html
    document.getElementsByTagName('body')[0].append(body)
    return await toJpeg(body, {
        backgroundColor: '#FFF',
    }).then( (dataUrl) => { 
        body.remove()
        return {
            type: 'image/jpeg',
            data: dataUrl
        }
    })
}


export const createUnknownPage = async (blob, cb) => {

    //return createHtmlPage(`
    return await offloadCreateHtmlPage(`
    <div>
        <h3>Unknown File Type</h3>
        <p>${blob.type}</p>
    </div>
    `)
}

export const createImagePage = async (blob, type, cb) => {
    return Promise.resolve({
        type: type,
        data: blob
    })
}

export const createJpgPage = async(blob, cb) => {
    return createImagePage(blob, 'image/jpeg')
}

export const createPngPage = async(blob, cb) => {
    return createImagePage(blob, 'image/png')
}


export const createPDFPages = async (blob, cb) => {

    return PDFDocument.load(blob).then( (pdf)=> {
        
        return {
            type: 'pdf',
            data: pdf,
            pages: pdf.getPages().length
        }

    } )

}


const pdfDocType = {
    'application/pdf': createPDFPages,
    'image/jpeg': createJpgPage,
    'image/png': createPngPage,

}


const handleFile = async (uri, cb) => {

    let fileResponse = await fetch(uri);
    let blob = await fileResponse.blob();
    const blobArrayBuffer = await readBlobAsArrayBuffer(blob);
    let doWhat = pdfDocType[blob.type] || createUnknownPage

    return doWhat(blobArrayBuffer,cb)

}


const handlePage = async (bigPdf, page, cb) => {
    console.log("Page, ",page)
    if (page.type == 'pdf') {
        const copiedPages = await bigPdf.copyPages(
            page.data, 
            Array.from(Array(page.pages).keys())
            )
        
        copiedPages.forEach( cPage => {
            bigPdf.addPage(cPage)
        })
        
    } else if (~page.type.indexOf('image')) {
        let img = ''
        if (page.type == 'image/jpeg') { 
            img = await bigPdf.embedJpg(page.data)
        } else if (page.type == 'image/png') {
            img = await bigPdf.embedPng(page.data)
        }
        
            const imgDims = img.scale(0.75)
            const iPage = bigPdf.addPage([imgDims.width, imgDims.height])
            iPage.drawImage(img, {
                x: iPage.getWidth() / 2 - imgDims.width / 2,
                y: iPage.getHeight() / 2 - imgDims.height / 2,
                width: imgDims.width,
                height: imgDims.height
            })
        
        
    }

}


export const pdfAssemblePages = async (pages, cb) => {

    return PDFDocument.create().then( async (bigPdf) => {
        
        cb(0,"Assembling")
        
        const all_pages = await PromiseAllProgress(pages.flat(), cb)
        
        
        all_pages.forEach( async (page, i) => {
            cb( (i/all_pages.length) )
            await handlePage(bigPdf, page)
        })
        return bigPdf
    });

}

const fetchAndReturnJson = async (taskUri, cb) => {
    let headers = new Headers({
        "Accept"       : "application/json",
        "Content-Type" : "application/json",
        "X-Requested-With": "XMLHttpRequest"
    });
    let formUri = taskUri.replace("task-details","form")
    cb(  0 + "% " , "Fetching ")

    return fetch(formUri, {method: "GET", headers: headers})
            .then(async function(response) {
                if(!response.ok){ // 500, try going back to 'task-details' instead of 'form' 
                    return await fetch(taskUri, {method: "GET", headers: headers})
                    .then(function(response) {
                        if(response.ok) { // Must be internal task - grab it
                            return response.json()
                        }
                    
                    }).catch( (e) => {  // Otherwise just return empty and log to console for debug
                        console.log(e)
                        return {'Message': {'html': '', 'header':''}}
                    })
                    
                    
                }
                
            return response.json();
        })
}


const fetchAndReturnPages = async (taskUri, cb) => {

    const pages = []

    
        // Headers to keep html page wrapper off of result
    let headers = new Headers({
        "Accept"       : "application/json",
        "Content-Type" : "application/json",
        "X-Requested-With": "XMLHttpRequest"
    });
    let taskNum = parseInt(taskUri.match(/task=([0-9]+)/)[1]);

    return fetchAndReturnJson(taskUri, cb).then( async (myJson) => {

        let jsonHTML = myJson.Message.html;
            jsonHTML = jsonHTML.replace(/form-section/g,"form-section-off");
            jsonHTML = jsonHTML.replace(/<ul class/g,"<ul style=\"display:none;\" class");

            if(!myJson.Message.hasOwnProperty('header')){
                myJson.Message['header'] = 'Internal Task'
                jsonHTML = '<div class="task-details">'+jsonHTML+'</div>'
                jsonHTML = jsonHTML.replace(/<div class="hd"/g,"<div style=\"display:none;\" class=\"hd\"");
                jsonHTML = jsonHTML.replace(/textarea/g,"pre");
                //console.log(jsonHTML)
            }
        
        let files = jsonHTML.match(/\/workflows\/processes\/.*\/get-file\?id=[a-zA-z0-9]*/g);
        
        //pages.push(createHtmlPage(jsonHTML))
        pages.push(await offloadCreateHtmlPage(jsonHTML))

        if (files) {
            // Handle files

            return Promise.all(files.map( (f) => {
                return handleFile(f, cb)
            })).then( (a) => {
                //console.log("a",a)
                return pages.concat([...a])
            })
        
        } else {
            return pages
        }

    })


}

export const defaultProgressCallback = (pPercent=0, pMessage="Completed...") => {
    console.log(`${pPercent}% ${pMessage}`)
}

export const pdfFromProcess = async(doc=document, onlyHealth=false, cb=defaultProgressCallback, returnFile=false) => {
    var allCompletedTasks = doc.getElementsByClassName("task-completed");
    console.log(completedTasks);
    var xpath, studentName, processName = "";
    studentName = doc.getElementsByClassName("fn")[0].innerText.trim();
        if (onlyHealth) {
          processName =
            "HEALTH " + doc.getElementById("page-header").innerText.trim();
          xpath =
            "//li[contains(@class,'task')][div/h5[contains(text(),'Health' ) or contains(text(), 'Medi')]]";
        } else {
          processName = doc.getElementById("page-header").innerText.trim();
          xpath = "//li[contains(@class,'task')]";
        }
    if(onlyHealth) {
        var completedTasks = Array.from(allCompletedTasks).filter(e=>{
            return (~e.textContent.toLowerCase().indexOf('health') || ~e.textContent.toLowerCase().indexOf('medi'))
        })
    } else {
        var completedTasks = Array.from(allCompletedTasks)
    }

    cb(0,'Fetching')

    var pageSets = await PromiseAllProgress(
        Array.from(completedTasks).map( (task, i) => {
            return fetchAndReturnPages(task.dataset.href, cb)
        }), cb
    )
    var pdf = await pdfAssemblePages([].concat([...pageSets]), cb)
    if (returnFile) {
        var f = new File([await pdf.save()], studentName + " - " + processName + ".pdf", {
            type: "application/pdf"
        })
        cb(100, "Done");
        return f
    } else {
        await saveAs(
            new Blob([await pdf.save()]),
            studentName + " - " + processName + ".pdf"
            )
    
            cb(100, "Done")
        }
    }

