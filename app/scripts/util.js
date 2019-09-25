export function clearBody(body) {
    body = body.replace(/src=/g,"data-src=");
    body = body.replace(/<link/g, "nolink");
    return body;
}

export function isFunction(object) {
  return !!(object && object.constructor && object.call && object.apply);
 }

export async function fetchAndUpdate(node) {
  const updateNode = node;
    // https://sges.getalma.com/reports/school-attendance?date=2019-08-27&status=255
    // https://sges.getalma.com/student/5d165b14749ea438fa6dc7ff/attendance?week=2019-W35
    // https://sges.getalma.com/home/get-student-schedule?studentId=5d165b14749ea438fa6dc7ff&date=2019-08-28

  var url=node.href.replace(/student\//g, "home/get-student-schedule?studentId=");
    url = url.replace(/\/attendance.*/g,"&"+document.location.search.replace(/\?/g,"&"));

    if (["PS1","PS2","PK3"].indexOf(updateNode.parentElement.parentElement.children[2].innerText.trim()) <= -1) {
        console.log(updateNode.parentElement.parentElement.children[2].innerText);

        fetch(url)
            .then(function(response) {
            return response.json();
        })
            .then(function(body) {
            body = clearBody(body.Message.html);
            var parser = new DOMParser();
            var doc = parser.parseFromString(body, "text/html");

            var n = nodesFromXpath("//div[@class='class-info']", doc);
            //console.log(n[0]);
            //console.log(node.textContent.trim());
            //var newNode = document.createElement("div");
            //newNode.classList.add("pill");

            //newNode.innerHTML =
            //  '<i class="far fa-times-circle" style="color:#eb6841;"></i>' +
            //  node.textContent.trim();

            updateNode.parentElement.parentElement.children[4].append(n[0]);


        });
    }
}

function isEquivalent(a, b) {
  // Create arrays of property names
  var aProps = Object.getOwnPropertyNames(a);
  var bProps = Object.getOwnPropertyNames(b);

  // If number of properties is different,
  // objects are not equivalent
  if (aProps.length != bProps.length) {
      return false;
  }

  for (var i = 0; i < aProps.length; i++) {
      var propName = aProps[i];

      // If values of same property are not equal,
      // objects are not equivalent
      if (a[propName] !== b[propName]) {
          return false;
      }
  }

  // If we made it this far, objects
  // are considered equivalent
  return true;
}



export const newObjects = (oldArray, newArray, compare="updated") => {
  return newArray.filter(function(obj) {
    return !oldArray.some(function(obj2) {
        return isEquivalent(obj, obj2);
    });
});
}


export function nodesFromXpath(xpath, doc=document) {
  // var xpath = "//tr[td[text()='No Record']]/td[2]/a";
  var result = document.evaluate(
    xpath,
    doc,
    null,
    XPathResult.ANY_TYPE,
    null
  );
  var node,
    nodes = [];
  while ((node = result.iterateNext())) {
    nodes.push(node);
  }
  return nodes;

}

export function closeWindow() {
  window.close();
}
  
export function log(t) {
  console.log(t);
}

export function injectScript(file_path, tag='html', type='script', text='') {
    
  var node = document.getElementsByTagName(tag)[0];
  var tag_type = type == 'link' ? 'link' : 'script';
  var script = document.createElement(tag_type);
  if(type == 'script') {
  script.setAttribute('type', 'text/javascript');
  }
  else if ( type == 'module' ) {
  script.setAttribute('type', 'module');
  }
  else {
      script.setAttribute('rel', 'stylesheet');
      script.setAttribute('media', 'screen');
      
  }
  if (text == '') {
      script.setAttribute(tag_type == 'script' ? 'src': 'href', file_path);
  }
  else {
      script.innerHTML = text;
  }
  node.appendChild(script);
}

export function escapeDoubleQuotes(str) {
	return str.replace(/\\([\s\S])|(")/g,"\\$1$2"); 
}

export function ms(m){
  return m * 1000 * 60
}