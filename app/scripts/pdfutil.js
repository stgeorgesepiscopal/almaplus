import { saveAs } from 'file-saver';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib'

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
        
        const all_pages = await Promise.all(pages.flat())
        
        
        all_pages.forEach( async (page, i) => {
            //console.log("Create.then.pages",page,i)
            await handlePage(bigPdf, page)
            cb( ( (i+1) / all_pages.length ) + "% " , "Assembling ")
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

const defaultProgressCallback = (pPercent=0, pMessage="Completed...") => {
    console.log(`${pPercent}% ${pMessage}`)
}

export const pdfFromProcess = async(doc=document, onlyHealth=false, cb=defaultProgressCallback) => {
    var completedTasks = doc.getElementsByClassName("task-completed");
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

    Promise.all(
        Array.from(completedTasks).map( (task, i) => {
            cb(  50 + "% " , "Fetching ")
            return fetchAndReturnPages(task.dataset.href, cb)
        })
    ).then( (pageSets) => {
        //console.log(pageSets)
        return pdfAssemblePages([].concat([...pageSets]), cb)
    }).then( async (pdf) => {
        cb(100+"%", "Done ")
        return saveAs(
            new Blob([await pdf.save()]),
            studentName + " - " + processName + ".pdf"
            )
        
    }).then( () => {
        cb(100+"%", "Done ")
    })
}


export const pdfFromProcessOld = async (doc, pdfButton, progressCallback=defaultProgressCallback) => {
var completedTasks = doc.getElementsByClassName("task-completed");
    var allHTML = [];
    var numDone = 0;
    var totalTasks = completedTasks.length;
   
    const bigPdf = await PDFDocument.create();
    for (var task of completedTasks) {
        var taskUri = task.dataset.href;
        // Replace 'task-details' with 'form' to get the actual form data (but it will break internal tasks, so needs catch)
        var formUri = taskUri.replace("task-details","form");
        // Headers to keep html page wrapper off of result
        let headers = new Headers({
            "Accept"       : "application/json",
            "Content-Type" : "application/json",
            "X-Requested-With": "XMLHttpRequest"
        });
        
        // @todo: Account for multi-stage forms - right now assumes single stage per form

        // From uri, detect task number 
        var taskNum = parseInt(taskUri.match(/task=([0-9]+)/)[1]);
        

        await fetch(formUri, {method: "GET", headers: headers})
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
            .then(function(myJson) {
            //console.log(myJson);
            var jsonHTML = myJson.Message.html;
            jsonHTML = jsonHTML.replace(/form-section/g,"form-section-off");
            jsonHTML = jsonHTML.replace(/<ul class/g,"<ul style=\"display:none;\" class");

            if(!myJson.Message.hasOwnProperty('header')){
                myJson.Message['header'] = 'Internal Task'
                jsonHTML = '<div class="task-details">'+jsonHTML+'</div>'
                jsonHTML = jsonHTML.replace(/<div class="hd"/g,"<div style=\"display:none;\" class=\"hd\"");
            }
            //jsonHTML = '<span class="page-break"><span>'+jsonHTML

            //console.log(jsonHTML);
            //var files = jsonHTML.match(/<a href="(\/workflows\/processes\/.*\/get-file\?id=[a-zA-z0-9]*)">/g);
            var files = jsonHTML.match(/\/workflows\/processes\/.*\/get-file\?id=[a-zA-z0-9]*/g);
            if (files) {
                totalTasks += files.length;
                for (var file of files) {
                    fetch(file).then(function(response) {

                        return response.blob(); }
                                     ).then(async function(blob) {
                        //console.log(blob.type);
                        let reader = new FileReader();
                        reader.readAsArrayBuffer(blob);
                        reader.onload = async function(e) {

                        //blob.arrayBuffer().then(async function(myBuffer){
                            if (blob.type === "application/pdf") {
                        const pdf = await PDFDocument.load(e.target.result);
                        //console.log(pdf);
                        const numPages = pdf.getPages().length;

                        const copiedPages = await bigPdf.copyPages(pdf, Array.from(Array(numPages).keys()));
                        copiedPages.forEach((page) => {
                            bigPdf.addPage(page);
                        });
                            }
                            else if (blob.type === "image/jpeg") {

                                // Embed the JPG image bytes and PNG image bytes
                                const jpgImage = await bigPdf.embedJpg(e.target.result)

                                // Get the width/height of the JPG image scaled down to 25% of its original size
                                const jpgDims = jpgImage.scale(.5)

                                // Add a blank page to the document
                                const page = bigPdf.addPage([jpgDims.width, jpgDims.height])

                                // Draw the JPG image in the center of the page
                                page.drawImage(jpgImage, {
                                    x: page.getWidth() / 2 - jpgDims.width / 2,
                                    y: page.getHeight() / 2 - jpgDims.height / 2,
                                    width: jpgDims.width,
                                    height: jpgDims.height,
                                });

                            }
                        
                            numDone += 1;
                            progressCallback(parseInt(100 * (numDone / (totalTasks + 3) )).toString() + "%")
                            //pdfButtonProgress.innerHTML = parseInt(100 * (numDone / (totalTasks + 3) )).toString() + "%";
                        if (numDone === totalTasks){
                            
                            html2pdf().set({
                                html2canvas:  { scale: 2 },
                                pagebreak: { before: '.page-break', avoid: ['div','h1','.form-section-offs'] }
                                //pagebreak: { before: '.page-break' }
                            }).from(cssInfo+"<div style=\"padding:100px;\">"+allHTML.join(" ")+"</div>").output('datauristring').then(async function (pdfAsString) {
                                //pdfButtonProgress.innerHTML = parseInt(100 * (numDone / (totalTasks + 2))).toString() + "%";
                                progressCallback(parseInt(100 * (numDone / (totalTasks + 2) )).toString() + "%")
                                const htmlPdf = await PDFDocument.load(pdfAsString);
                                //pdfButtonProgress.innerHTML = parseInt(100 * (numDone / (totalTasks + 1.5))).toString() + "%";
                                progressCallback(parseInt(100 * (numDone / (totalTasks + 1.5) )).toString() + "%")
                                const numPages = bigPdf.getPages().length;
                                const copiedPages = await htmlPdf.copyPages(bigPdf, Array.from(Array(numPages).keys()));
                                //pdfButtonProgress.innerHTML = parseInt(100 * (numDone / (totalTasks + 1.2))).toString() + "%";
                                progressCallback(parseInt(100 * (numDone / (totalTasks + 1.2) )).toString() + "%")
                                copiedPages.forEach((page) => {
                                    htmlPdf.addPage(page);
                                });
                                progressCallback(parseInt(100 * (numDone / (totalTasks + 1) )).toString() + "%")
                                //pdfButtonProgress.innerHTML = parseInt(100 * (numDone / (totalTasks + 1))).toString() + "%";
                                //const pdfUrl = URL.createObjectURL(
                                //    new Blob([await htmlPdf.save()], { type: 'application/pdf' }),
                                //);
                                var studentName = document.getElementsByClassName("fn")[0].innerText;
                    var processName = document.getElementById("page-header").innerText;
                    saveAs(new Blob([await htmlPdf.save()]), studentName+" - "+processName+".pdf");
                                //pdfButtonProgress.innerHTML = parseInt(100 * (numDone / totalTasks)).toString() + "%";
                                progressCallback(parseInt(100 * (numDone / (totalTasks) )).toString() + "%")
                                //iconElement.classList.remove('lds-circle');
                                //pdfButtonText.innerHTML = "PDF Saved!";
                                //pdfButtonProgress.innerHTML = "";
                                progressCallback("", "PDF Saved!")
                                //htmlPdf.save();
                            });


                            // const bigPdf = await PDFLib.PDFDocument.load(FormPdf);
                            // bigPdf.addPage(pdf);



                        }
                        //};

                        };

                    });
                }
            }
            //console.log(files);
            var jsonHeader = myJson.Message.header;
            allHTML[taskNum] = "<span class=\"page-break\"></span><h1 >"+jsonHeader+"</h1>"+jsonHTML;
            numDone += 1;
            // pdfButtonProgress.innerHTML = parseInt(100 * (numDone / (totalTasks + 3))).toString() + "%";
            progressCallback(parseInt(100 * (numDone / (totalTasks + 3) )).toString() + "%")

            // <a href="/workflows/processes/5d0a73db7b86eb6fe20f6092/5d1a18b97b86eb0a7532e0f9/5d1a18b97b86eb39037d417d/get-file?id=5d372340a814e42a0d1872e1">


            if (numDone === totalTasks){
                //console.log(cssInfo+"<div style=\"padding:100px;\">"+allHTML.join(" ")+"</div>")
                html2pdf().set({
                                html2canvas:  { scale: 2 },
                                pagebreak: { before: '.page-break', avoid: ['div','h1','.form-section-offs'] }
                                //pagebreak: { before: '.page-break' }
                            }).from(cssInfo+"<div style=\"padding:100px;\">"+allHTML.join(" ")+"</div>").output('datauristring').then(async function (pdfAsString) {
                                //pdfButtonProgress.innerHTML = parseInt(100 * (numDone / (totalTasks + 2))).toString() + "%";
                                progressCallback(parseInt(100 * (numDone / (totalTasks + 2) )).toString() + "%")
                                const htmlPdf = await PDFDocument.load(pdfAsString);
                                //pdfButtonProgress.innerHTML = parseInt(100 * (numDone / (totalTasks + 1.5))).toString() + "%";
                                progressCallback(parseInt(100 * (numDone / (totalTasks + 1.5) )).toString() + "%")
                                const numPages = bigPdf.getPages().length;
                                const copiedPages = await htmlPdf.copyPages(bigPdf, Array.from(Array(numPages).keys()));
                                //pdfButtonProgress.innerHTML = parseInt(100 * (numDone / (totalTasks + 1.2))).toString() + "%";
                                progressCallback(parseInt(100 * (numDone / (totalTasks + 1.2) )).toString() + "%")
                                copiedPages.forEach((page) => {
                                    htmlPdf.addPage(page);
                                });
                                progressCallback(parseInt(100 * (numDone / (totalTasks + 1) )).toString() + "%")
                                //pdfButtonProgress.innerHTML = parseInt(100 * (numDone / (totalTasks + 1))).toString() + "%";
                                //const pdfUrl = URL.createObjectURL(
                                //    new Blob([await htmlPdf.save()], { type: 'application/pdf' }),
                                //);
                                var studentName = document.getElementsByClassName("fn")[0].innerText;
                    var processName = document.getElementById("page-header").innerText;
                    saveAs(new Blob([await htmlPdf.save()]), studentName+" - "+processName+".pdf");
                                //pdfButtonProgress.innerHTML = parseInt(100 * (numDone / totalTasks)).toString() + "%";
                                progressCallback(parseInt(100 * (numDone / (totalTasks) )).toString() + "%")
                                //iconElement.classList.remove('lds-circle');
                                //pdfButtonText.innerHTML = "PDF Saved!";
                                //pdfButtonProgress.innerHTML = "";
                                progressCallback("", "PDF Saved!")
                                //htmlPdf.save();
                            });
                    //saveAs(await htmlPdf.save(), "Form.pdf");
                                //window.open(pdfUrl, '_blank');
                                //htmlPdf.save();
                            // });
                // console.log(allHTML);
            }
        }).catch( (e) => { console.log(e) });
    }
}
