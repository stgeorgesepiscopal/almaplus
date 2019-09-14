import {options} from './storage';

function injectScript(file_path, tag='html', type='script', text='') {
    
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
async function getOptions() {
    const settings = await options.get() ;
    if (settings.displayChat) {
        injectScript('','html','script',`
        var button = document.getElementsByClassName('switcher')[0].cloneNode(true);
        button.children[0].children[0].innerHTML = '<a class="pure-menu-link"><i class="fas fa-comment-dots fa-sm" ></i></a>'
        button.onclick = function() { Intercom('showMessages'); }
        document.getElementsByClassName('switcher')[0].parentElement.insertBefore(button, document.getElementsByClassName('switcher')[0].parentElement.children[1]);
        document.getElementsByClassName('switcher')[0].parentElement.insertBefore(document.createElement("div"), document.getElementsByClassName('switcher')[0].parentElement.children[1]);
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
