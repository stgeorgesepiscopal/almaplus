import {options} from './storage'
import {injectScript} from './util'

async function getOptions() {
    const settings = await options.get() ;

    injectScript('', 'html', 'script',`

    function getUrlVars(url) {
        var vars = {};
        var parts = url.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m,key,value) {
            vars[key] = decodeURIComponent(value);
        });
        return vars;
    }

    function getUrlParam(url, parameter){
        var urlparameter = '';
        if(url.indexOf(parameter) > -1){
            urlparameter = getUrlVars(url)[parameter];
            }
        return urlparameter;
    }

    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
      }
      

    var searchResults = false;

    var extensionId = "${browser.runtime.id}";



    const sendMessage = async function(message) {
        
        return searchResults ;
        //results.then( function(r) { console.log("In the then", r); return r;} );

    }
    
    var _open = XMLHttpRequest.prototype.open;
    window.XMLHttpRequest.prototype.open = function (method, URL) {
        var _onreadystatechange = this.onreadystatechange,
            _this = this;
            __this = this;

        _this.onreadystatechange = function () {
            // catch only completed 'api/search/universal' requests
            if (_this.readyState === 4 && _this.status === 200 && ~URL.indexOf('/directory/search')) {
                try {
                    searchResults = false;
                    console.log("in readyState")
                    //////////////////////////////////////
                    // THIS IS ACTIONS FOR YOUR REQUEST //
                    //             EXAMPLE:             //
                    //////////////////////////////////////
                    // var data = JSON.parse(_this.responseText); // {"fields": ["a","b"]}
                    var data = []
                    // data[0].ProfileUrl = "https://sges.getalma.com/directory/search?q=maddie"
                    console.log(getUrlParam(_this.responseURL, "q"));
                    console.log("Sending message")
                    
                        
                        chrome.runtime.sendMessage(extensionId, {search: getUrlParam(_this.responseURL, "q")},
                        function(response) {
                            console.log("Response: ",response);
                        if (!response.success) {
                            
                            //handleError(url);
                        }
                        console.log("In callback")
                        console.log(response.data)
                        searchResults = response.data
                        console.log("about to set property", searchResults);
                        // rewrite responseText
                        Object.defineProperty(_this, 'responseText', {value: JSON.stringify(searchResults)});
                        if (_onreadystatechange) _onreadystatechange.apply(__this, arguments);

                        });
                        
                        console.log("After sendMessage")
                        console.log(searchResults)

                   

                   
                    
                    
                    
                    /////////////// END //////////////////
                } catch (e) {}

                console.log('Caught! :)', method, URL/*, _this.responseText*/);
            }
            else
            {
                if (_onreadystatechange) _onreadystatechange.apply(this, arguments);
            }
            // call original callback
           
        };

        // detect any onreadystatechange changing
        Object.defineProperty(this, "onreadystatechange", {
            get: function () {
                return _onreadystatechange;
            },
            set: function (value) {
                _onreadystatechange = value;
            }
        });

        return _open.apply(_this, arguments);
    };

    document.getElementsByName("q")[0].placeholder="Alma+ SuperSearch";

    `
    );

    if (settings.displayChat) {
        injectScript('','html','script',`
        var button = document.getElementsByClassName('switcher')[0].cloneNode(true);
        button.children[0].children[0].innerHTML = '<a class="pure-menu-link"><i class="fas fa-comment-dots fa-sm" ></i></a>'
        button.onclick = function() { Intercom('showMessages'); }
        
        document.getElementsByClassName('switcher')[0].parentElement.insertBefore(button, document.getElementsByClassName('switcher')[0].parentElement.children[1]);
        
        var insertDiv = document.createElement("div");
        insertDiv.style.width = "100%";
        document.getElementsByClassName('switcher')[0].parentElement.insertBefore(insertDiv, document.getElementsByClassName('switcher')[0].parentElement.children[1]);
        `);
    }
    if (settings.htmlMessaging) {
        injectScript('','html','script',`
        var whenDefined = function($context, $variable, $callback){

            if( $context[$variable] ){
                $callback();
            } else {
              
                Object.defineProperty($context, $variable, {
                    configurable: true,
                    enumerable: true,
                    writeable: true,
                    get: function() {
                        return this['_' + $variable];
                    },
                    set: function(val) {
                        this['_' + $variable] = val;
                        $callback();
                    }
                });
            }
        }
        var bubbleUpButton = document.createElement("span");
        bubbleUpButton.classList.add("pure-button");
        bubbleUpButton.innerHTML = 'HTML <i class="fas fa-eye"></i>';
        

        const bubbleUp = function() {
            console.log("Bubbling Up");
            //tinyMCE.activeEditor.targetElm.value = tinyMCE.activeEditor.targetElm.value.replace(/>/g, "> ");
            tinyMCE.activeEditor.setContent(tinyMCE.activeEditor.targetElm.value);
               // tinyMCE.activeEditor.save();
        }

        const showHTML = function() {
            if (tinyMCE.activeEditor.targetElm.style.display == "none") {
                tinyMCE.activeEditor.targetElm.style.display = "block";
                bubbleUpButton.innerHTML = 'HTML <i class="fas fa-eye-slash"></i>';
            }
            else {
                tinyMCE.activeEditor.targetElm.style.display = "none";
                bubbleUpButton.innerHTML = 'HTML <i class="fas fa-eye"></i>';
            }
        }
        bubbleUpButton.onclick = showHTML;

        whenDefined(window, 'tinyMCE', function(){

            whenDefined(tinyMCE, 'activeEditor', function() {
                //tinyMCE.activeEditor.targetElm.style.display = "block";
                if (tinyMCE.activeEditor.targetElm.value == ""){
                    try { tinyMCE.activeEditor.setContent(\`<p></p><p>`+
                    settings.signature
                    +`</p>\`)} catch (err) { console.log(err) }
                }
                tinyMCE.activeEditor.targetElm.oninput = bubbleUp;
                tinyMCE.activeEditor.targetElm.parentElement.insertBefore(bubbleUpButton, tinyMCE.activeEditor.targetElm);
            });
        });
        


        `);
    }
    if (settings.stayAlive) {
        injectScript('','html','script',`
        /*jslint unparam: true*/
        /*global YUI: false*/
        /**
         * Alma Session Timeout Warning
         */
        YUI.add('alma-session-timeout', function (Y) {
            'use strict';

            function SessionTimeout(ttl, keepAliveUrl, logoutUrl) {
                this.ttl = ttl;
                this.keepAliveUrl = keepAliveUrl;
                this.logoutUrl = logoutUrl;
                // warn when session is 90% expired, but no more than 10 minutes before
                
            }

            SessionTimeout.prototype.start = function () {
                this.warningTimer = Y.later(this.warn, this, this.showWarning);
                this.logoutTimer = Y.later(this.ttl, this, this.logout);
            };

            SessionTimeout.prototype.cancel = function () {
                if (this.warningTimer) {
                    this.warningTimer.cancel();
                    this.warningTimer = null;
                }
                if (this.logoutTimer) {
                    this.logoutTimer.cancel();
                    this.logoutTimer = null;
                }
            };

            SessionTimeout.prototype.reset = function () {
                this.cancel();
                
            };

            SessionTimeout.prototype.showWarning = function () {
                Y.Alma.Dialog.confirm({
                    message: 'Your login session is about to expire, would you like to continue?',
                    acceptButton: 'Continue',
                    denyButton: 'Logout'
                }, function (ok) {
                    if (ok) {
                        this.keepAlive();
                    } else {
                        this.logout();
                    }
                }, this);
            };

            SessionTimeout.prototype.keepAlive = function () {
                Y.SC.IO.get(this.keepAliveUrl);
            };

            SessionTimeout.prototype.logout = function () {
                    console.log("Not logging out");
            };

            Y.namespace('Alma').SessionTimeout = SessionTimeout;

        }, '1.0.0', {
            requires: ['sc-io', 'alma-dialog']
        });
        `);
    }
}
getOptions();
