!function(e){var r={};function t(s){if(r[s])return r[s].exports;var n=r[s]={i:s,l:!1,exports:{}};return e[s].call(n.exports,n,n.exports,t),n.l=!0,n.exports}t.m=e,t.c=r,t.d=function(e,r,s){t.o(e,r)||Object.defineProperty(e,r,{enumerable:!0,get:s})},t.r=function(e){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},t.t=function(e,r){if(1&r&&(e=t(e)),8&r)return e;if(4&r&&"object"==typeof e&&e&&e.__esModule)return e;var s=Object.create(null);if(t.r(s),Object.defineProperty(s,"default",{enumerable:!0,value:e}),2&r&&"string"!=typeof e)for(var n in e)t.d(s,n,function(r){return e[r]}.bind(null,n));return s},t.n=function(e){var r=e&&e.__esModule?function(){return e.default}:function(){return e};return t.d(r,"a",r),r},t.o=function(e,r){return Object.prototype.hasOwnProperty.call(e,r)},t.p="",t(t.s=10)}({0:function(e,r,t){"use strict";e.exports=t(22)},10:function(e,r,t){"use strict";Object.defineProperty(r,"__esModule",{value:!0});const s=t(27),n=t(0);function o(e,r){n.useEffect(()=>(e.addListener(r),()=>{e.removeListener(r)}),[e])}function a(e,r){n.useEffect(()=>{!async function(){r(await e.get())}()},[e])}function i(e){return n.useCallback(async r=>await e.set(r),[e])}r.options=s.StorageArea.create({defaults:{subdomain:"sges",apiStudentUUID:"5d67e14d70a9a1462f24cdc3",displayChat:!1,signature:"",htmlMessaging:!0,almaStart:!1,almaStartPDFButtons:!0,almaStartIgnoreEnrolled:!1,almaStartIgnoreApplicants:!1,stayAlive:!1,googleApiCredentials:"",googleApiAccount:"",sheetId:"",defaultSearch:""},storageArea:"sync"}),r.searchData=s.StorageArea.create({defaults:{startStudents:[{}]},storageArea:"local"}),r.inputId=function(e){return`options-input-${e.key}`},r.useStore=function(e,r){const[t,s]=n.useState(r);return a(e,s),o(e,e=>{void 0!==e.newValue&&s(e.newValue)}),[t,i(e)]},r.useStoreChanged=o,r.useStoreGet=a,r.useStoreSet=i},11:function(e,r,t){"use strict";Object.defineProperty(r,"__esModule",{value:!0}),r.browser="undefined"==typeof window?{}:t(20)},18:function(e,r,t){"use strict";
/*
object-assign
(c) Sindre Sorhus
@license MIT
*/var s=Object.getOwnPropertySymbols,n=Object.prototype.hasOwnProperty,o=Object.prototype.propertyIsEnumerable;function a(e){if(null==e)throw new TypeError("Object.assign cannot be called with null or undefined");return Object(e)}e.exports=function(){try{if(!Object.assign)return!1;var e=new String("abc");if(e[5]="de","5"===Object.getOwnPropertyNames(e)[0])return!1;for(var r={},t=0;t<10;t++)r["_"+String.fromCharCode(t)]=t;if("0123456789"!==Object.getOwnPropertyNames(r).map((function(e){return r[e]})).join(""))return!1;var s={};return"abcdefghijklmnopqrst".split("").forEach((function(e){s[e]=e})),"abcdefghijklmnopqrst"===Object.keys(Object.assign({},s)).join("")}catch(e){return!1}}()?Object.assign:function(e,r){for(var t,i,g=a(e),l=1;l<arguments.length;l++){for(var c in t=Object(arguments[l]))n.call(t,c)&&(g[c]=t[c]);if(s){i=s(t);for(var m=0;m<i.length;m++)o.call(t,i[m])&&(g[i[m]]=t[i[m]])}}return g}},20:function(e,r,t){(function(t){var s,n,o;n=[e],void 0===(o="function"==typeof(s=function(e){"use strict";if(void 0===window.browser||Object.getPrototypeOf(window.browser)!==Object.prototype||Object.getPrototypeOf(t)!==Object.prototype){const r="The message port closed before a response was received.",t="Returning a Promise is the preferred way to send a reply from an onMessage/onMessageExternal listener, as the sendResponse will be removed from the specs (See https://developer.mozilla.org/docs/Mozilla/Add-ons/WebExtensions/API/runtime/onMessage)",s=()=>{const e={alarms:{clear:{minArgs:0,maxArgs:1},clearAll:{minArgs:0,maxArgs:0},get:{minArgs:0,maxArgs:1},getAll:{minArgs:0,maxArgs:0}},bookmarks:{create:{minArgs:1,maxArgs:1},get:{minArgs:1,maxArgs:1},getChildren:{minArgs:1,maxArgs:1},getRecent:{minArgs:1,maxArgs:1},getSubTree:{minArgs:1,maxArgs:1},getTree:{minArgs:0,maxArgs:0},move:{minArgs:2,maxArgs:2},remove:{minArgs:1,maxArgs:1},removeTree:{minArgs:1,maxArgs:1},search:{minArgs:1,maxArgs:1},update:{minArgs:2,maxArgs:2}},browserAction:{disable:{minArgs:0,maxArgs:1,fallbackToNoCallback:!0},enable:{minArgs:0,maxArgs:1,fallbackToNoCallback:!0},getBadgeBackgroundColor:{minArgs:1,maxArgs:1},getBadgeText:{minArgs:1,maxArgs:1},getPopup:{minArgs:1,maxArgs:1},getTitle:{minArgs:1,maxArgs:1},openPopup:{minArgs:0,maxArgs:0},setBadgeBackgroundColor:{minArgs:1,maxArgs:1,fallbackToNoCallback:!0},setBadgeText:{minArgs:1,maxArgs:1,fallbackToNoCallback:!0},setIcon:{minArgs:1,maxArgs:1},setPopup:{minArgs:1,maxArgs:1,fallbackToNoCallback:!0},setTitle:{minArgs:1,maxArgs:1,fallbackToNoCallback:!0}},browsingData:{remove:{minArgs:2,maxArgs:2},removeCache:{minArgs:1,maxArgs:1},removeCookies:{minArgs:1,maxArgs:1},removeDownloads:{minArgs:1,maxArgs:1},removeFormData:{minArgs:1,maxArgs:1},removeHistory:{minArgs:1,maxArgs:1},removeLocalStorage:{minArgs:1,maxArgs:1},removePasswords:{minArgs:1,maxArgs:1},removePluginData:{minArgs:1,maxArgs:1},settings:{minArgs:0,maxArgs:0}},commands:{getAll:{minArgs:0,maxArgs:0}},contextMenus:{remove:{minArgs:1,maxArgs:1},removeAll:{minArgs:0,maxArgs:0},update:{minArgs:2,maxArgs:2}},cookies:{get:{minArgs:1,maxArgs:1},getAll:{minArgs:1,maxArgs:1},getAllCookieStores:{minArgs:0,maxArgs:0},remove:{minArgs:1,maxArgs:1},set:{minArgs:1,maxArgs:1}},devtools:{inspectedWindow:{eval:{minArgs:1,maxArgs:2}},panels:{create:{minArgs:3,maxArgs:3,singleCallbackArg:!0}}},downloads:{cancel:{minArgs:1,maxArgs:1},download:{minArgs:1,maxArgs:1},erase:{minArgs:1,maxArgs:1},getFileIcon:{minArgs:1,maxArgs:2},open:{minArgs:1,maxArgs:1,fallbackToNoCallback:!0},pause:{minArgs:1,maxArgs:1},removeFile:{minArgs:1,maxArgs:1},resume:{minArgs:1,maxArgs:1},search:{minArgs:1,maxArgs:1},show:{minArgs:1,maxArgs:1,fallbackToNoCallback:!0}},extension:{isAllowedFileSchemeAccess:{minArgs:0,maxArgs:0},isAllowedIncognitoAccess:{minArgs:0,maxArgs:0}},history:{addUrl:{minArgs:1,maxArgs:1},deleteAll:{minArgs:0,maxArgs:0},deleteRange:{minArgs:1,maxArgs:1},deleteUrl:{minArgs:1,maxArgs:1},getVisits:{minArgs:1,maxArgs:1},search:{minArgs:1,maxArgs:1}},i18n:{detectLanguage:{minArgs:1,maxArgs:1},getAcceptLanguages:{minArgs:0,maxArgs:0}},identity:{launchWebAuthFlow:{minArgs:1,maxArgs:1}},idle:{queryState:{minArgs:1,maxArgs:1}},management:{get:{minArgs:1,maxArgs:1},getAll:{minArgs:0,maxArgs:0},getSelf:{minArgs:0,maxArgs:0},setEnabled:{minArgs:2,maxArgs:2},uninstallSelf:{minArgs:0,maxArgs:1}},notifications:{clear:{minArgs:1,maxArgs:1},create:{minArgs:1,maxArgs:2},getAll:{minArgs:0,maxArgs:0},getPermissionLevel:{minArgs:0,maxArgs:0},update:{minArgs:2,maxArgs:2}},pageAction:{getPopup:{minArgs:1,maxArgs:1},getTitle:{minArgs:1,maxArgs:1},hide:{minArgs:1,maxArgs:1,fallbackToNoCallback:!0},setIcon:{minArgs:1,maxArgs:1},setPopup:{minArgs:1,maxArgs:1,fallbackToNoCallback:!0},setTitle:{minArgs:1,maxArgs:1,fallbackToNoCallback:!0},show:{minArgs:1,maxArgs:1,fallbackToNoCallback:!0}},permissions:{contains:{minArgs:1,maxArgs:1},getAll:{minArgs:0,maxArgs:0},remove:{minArgs:1,maxArgs:1},request:{minArgs:1,maxArgs:1}},runtime:{getBackgroundPage:{minArgs:0,maxArgs:0},getBrowserInfo:{minArgs:0,maxArgs:0},getPlatformInfo:{minArgs:0,maxArgs:0},openOptionsPage:{minArgs:0,maxArgs:0},requestUpdateCheck:{minArgs:0,maxArgs:0},sendMessage:{minArgs:1,maxArgs:3},sendNativeMessage:{minArgs:2,maxArgs:2},setUninstallURL:{minArgs:1,maxArgs:1}},sessions:{getDevices:{minArgs:0,maxArgs:1},getRecentlyClosed:{minArgs:0,maxArgs:1},restore:{minArgs:0,maxArgs:1}},storage:{local:{clear:{minArgs:0,maxArgs:0},get:{minArgs:0,maxArgs:1},getBytesInUse:{minArgs:0,maxArgs:1},remove:{minArgs:1,maxArgs:1},set:{minArgs:1,maxArgs:1}},managed:{get:{minArgs:0,maxArgs:1},getBytesInUse:{minArgs:0,maxArgs:1}},sync:{clear:{minArgs:0,maxArgs:0},get:{minArgs:0,maxArgs:1},getBytesInUse:{minArgs:0,maxArgs:1},remove:{minArgs:1,maxArgs:1},set:{minArgs:1,maxArgs:1}}},tabs:{captureVisibleTab:{minArgs:0,maxArgs:2},create:{minArgs:1,maxArgs:1},detectLanguage:{minArgs:0,maxArgs:1},discard:{minArgs:0,maxArgs:1},duplicate:{minArgs:1,maxArgs:1},executeScript:{minArgs:1,maxArgs:2},get:{minArgs:1,maxArgs:1},getCurrent:{minArgs:0,maxArgs:0},getZoom:{minArgs:0,maxArgs:1},getZoomSettings:{minArgs:0,maxArgs:1},highlight:{minArgs:1,maxArgs:1},insertCSS:{minArgs:1,maxArgs:2},move:{minArgs:2,maxArgs:2},query:{minArgs:1,maxArgs:1},reload:{minArgs:0,maxArgs:2},remove:{minArgs:1,maxArgs:1},removeCSS:{minArgs:1,maxArgs:2},sendMessage:{minArgs:2,maxArgs:3},setZoom:{minArgs:1,maxArgs:2},setZoomSettings:{minArgs:1,maxArgs:2},update:{minArgs:1,maxArgs:2}},topSites:{get:{minArgs:0,maxArgs:0}},webNavigation:{getAllFrames:{minArgs:1,maxArgs:1},getFrame:{minArgs:1,maxArgs:1}},webRequest:{handlerBehaviorChanged:{minArgs:0,maxArgs:0}},windows:{create:{minArgs:0,maxArgs:1},get:{minArgs:1,maxArgs:2},getAll:{minArgs:0,maxArgs:1},getCurrent:{minArgs:0,maxArgs:1},getLastFocused:{minArgs:0,maxArgs:1},remove:{minArgs:1,maxArgs:1},update:{minArgs:2,maxArgs:2}}};if(0===Object.keys(e).length)throw new Error("api-metadata.json has not been included in browser-polyfill");const s=(e,r)=>(...t)=>{chrome.runtime.lastError?e.reject(chrome.runtime.lastError):r.singleCallbackArg||t.length<=1?e.resolve(t[0]):e.resolve(t)},n=e=>1==e?"argument":"arguments",o=(e,r,t)=>new Proxy(r,{apply:(r,s,n)=>t.call(s,e,...n)});let a=Function.call.bind(Object.prototype.hasOwnProperty);const i=(e,r={},t={})=>{let g=Object.create(null),l={has:(r,t)=>t in e||t in g,get(l,c,m){if(c in g)return g[c];if(!(c in e))return;let u=e[c];if("function"==typeof u)if("function"==typeof r[c])u=o(e,e[c],r[c]);else if(a(t,c)){let r=((e,r)=>(function(t,...o){if(o.length<r.minArgs)throw new Error(`Expected at least ${r.minArgs} ${n(r.minArgs)} for ${e}(), got ${o.length}`);if(o.length>r.maxArgs)throw new Error(`Expected at most ${r.maxArgs} ${n(r.maxArgs)} for ${e}(), got ${o.length}`);return new Promise((n,a)=>{if(r.fallbackToNoCallback)try{t[e](...o,s({resolve:n,reject:a},r))}catch(s){console.warn(`${e} API method doesn't seem to support the callback parameter, `+"falling back to call it without a callback: ",s),t[e](...o),r.fallbackToNoCallback=!1,r.noCallback=!0,n()}else r.noCallback?(t[e](...o),n()):t[e](...o,s({resolve:n,reject:a},r))})}))(c,t[c]);u=o(e,e[c],r)}else u=u.bind(e);else{if("object"!=typeof u||null===u||!a(r,c)&&!a(t,c))return Object.defineProperty(g,c,{configurable:!0,enumerable:!0,get:()=>e[c],set(r){e[c]=r}}),u;u=i(u,r[c],t[c])}return g[c]=u,u},set:(r,t,s,n)=>(t in g?g[t]=s:e[t]=s,!0),defineProperty:(e,r,t)=>Reflect.defineProperty(g,r,t),deleteProperty:(e,r)=>Reflect.deleteProperty(g,r)},c=Object.create(e);return new Proxy(c,l)},g=e=>({addListener(r,t,...s){r.addListener(e.get(t),...s)},hasListener:(r,t)=>r.hasListener(e.get(t)),removeListener(r,t){r.removeListener(e.get(t))}});let l=!1;const c=new class extends WeakMap{constructor(e,r){super(r),this.createItem=e}get(e){return this.has(e)||this.set(e,this.createItem(e)),super.get(e)}}(e=>"function"!=typeof e?e:function(r,s,n){let o,a,i=!1,g=new Promise(e=>{o=function(r){l||(console.warn(t,(new Error).stack),l=!0),i=!0,e(r)}});try{a=e(r,s,o)}catch(e){a=Promise.reject(e)}const c=!0!==a&&(e=>e&&"object"==typeof e&&"function"==typeof e.then)(a);if(!0!==a&&!c&&!i)return!1;const m=e=>{e.then(e=>{n(e)},e=>{let r;r=e&&(e instanceof Error||"string"==typeof e.message)?e.message:"An unexpected error occurred",n({__mozWebExtensionPolyfillReject__:!0,message:r})}).catch(e=>{console.error("Failed to send onMessage rejected reply",e)})};return m(c?a:g),!0}),m=({reject:e,resolve:t},s)=>{chrome.runtime.lastError?chrome.runtime.lastError.message===r?t():e(chrome.runtime.lastError):s&&s.__mozWebExtensionPolyfillReject__?e(new Error(s.message)):t(s)},u=(e,r,t,...s)=>{if(s.length<r.minArgs)throw new Error(`Expected at least ${r.minArgs} ${n(r.minArgs)} for ${e}(), got ${s.length}`);if(s.length>r.maxArgs)throw new Error(`Expected at most ${r.maxArgs} ${n(r.maxArgs)} for ${e}(), got ${s.length}`);return new Promise((e,r)=>{const n=m.bind(null,{resolve:e,reject:r});s.push(n),t.sendMessage(...s)})},A={runtime:{onMessage:g(c),onMessageExternal:g(c),sendMessage:u.bind(null,"sendMessage",{minArgs:1,maxArgs:3})},tabs:{sendMessage:u.bind(null,"sendMessage",{minArgs:2,maxArgs:3})}},f={clear:{minArgs:1,maxArgs:1},get:{minArgs:1,maxArgs:1},set:{minArgs:1,maxArgs:1}};return e.privacy={network:{networkPredictionEnabled:f,webRTCIPHandlingPolicy:f},services:{passwordSavingEnabled:f},websites:{hyperlinkAuditingEnabled:f,referrersEnabled:f}},i(chrome,A,e)};e.exports=s()}else e.exports=t})?s.apply(r,n):s)||(e.exports=o)}).call(this,t(20))},22:function(e,r,t){"use strict";
/** @license React v16.9.0
 * react.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */var s=t(18),n="function"==typeof Symbol&&Symbol.for,o=n?Symbol.for("react.element"):60103,a=n?Symbol.for("react.portal"):60106,i=n?Symbol.for("react.fragment"):60107,g=n?Symbol.for("react.strict_mode"):60108,l=n?Symbol.for("react.profiler"):60114,c=n?Symbol.for("react.provider"):60109,m=n?Symbol.for("react.context"):60110,u=n?Symbol.for("react.forward_ref"):60112,A=n?Symbol.for("react.suspense"):60113,f=n?Symbol.for("react.suspense_list"):60120,d=n?Symbol.for("react.memo"):60115,p=n?Symbol.for("react.lazy"):60116;n&&Symbol.for("react.fundamental"),n&&Symbol.for("react.responder");var x="function"==typeof Symbol&&Symbol.iterator;function h(e){for(var r=e.message,t="https://reactjs.org/docs/error-decoder.html?invariant="+r,s=1;s<arguments.length;s++)t+="&args[]="+encodeURIComponent(arguments[s]);return e.message="Minified React error #"+r+"; visit "+t+" for the full message or use the non-minified dev environment for full errors and additional helpful warnings. ",e}var y={isMounted:function(){return!1},enqueueForceUpdate:function(){},enqueueReplaceState:function(){},enqueueSetState:function(){}},b={};function v(e,r,t){this.props=e,this.context=r,this.refs=b,this.updater=t||y}function w(){}function k(e,r,t){this.props=e,this.context=r,this.refs=b,this.updater=t||y}v.prototype.isReactComponent={},v.prototype.setState=function(e,r){if("object"!=typeof e&&"function"!=typeof e&&null!=e)throw h(Error(85));this.updater.enqueueSetState(this,e,r,"setState")},v.prototype.forceUpdate=function(e){this.updater.enqueueForceUpdate(this,e,"forceUpdate")},w.prototype=v.prototype;var _=k.prototype=new w;_.constructor=k,s(_,v.prototype),_.isPureReactComponent=!0;var S={current:null},P={suspense:null},C={current:null},j=Object.prototype.hasOwnProperty,E={key:!0,ref:!0,__self:!0,__source:!0};function O(e,r,t){var s=void 0,n={},a=null,i=null;if(null!=r)for(s in void 0!==r.ref&&(i=r.ref),void 0!==r.key&&(a=""+r.key),r)j.call(r,s)&&!E.hasOwnProperty(s)&&(n[s]=r[s]);var g=arguments.length-2;if(1===g)n.children=t;else if(1<g){for(var l=Array(g),c=0;c<g;c++)l[c]=arguments[c+2];n.children=l}if(e&&e.defaultProps)for(s in g=e.defaultProps)void 0===n[s]&&(n[s]=g[s]);return{$$typeof:o,type:e,key:a,ref:i,props:n,_owner:C.current}}function $(e){return"object"==typeof e&&null!==e&&e.$$typeof===o}var T=/\/+/g,L=[];function R(e,r,t,s){if(L.length){var n=L.pop();return n.result=e,n.keyPrefix=r,n.func=t,n.context=s,n.count=0,n}return{result:e,keyPrefix:r,func:t,context:s,count:0}}function M(e){e.result=null,e.keyPrefix=null,e.func=null,e.context=null,e.count=0,10>L.length&&L.push(e)}function I(e,r,t){return null==e?0:function e(r,t,s,n){var i=typeof r;"undefined"!==i&&"boolean"!==i||(r=null);var g=!1;if(null===r)g=!0;else switch(i){case"string":case"number":g=!0;break;case"object":switch(r.$$typeof){case o:case a:g=!0}}if(g)return s(n,r,""===t?"."+N(r,0):t),1;if(g=0,t=""===t?".":t+":",Array.isArray(r))for(var l=0;l<r.length;l++){var c=t+N(i=r[l],l);g+=e(i,c,s,n)}else if(null===r||"object"!=typeof r?c=null:c="function"==typeof(c=x&&r[x]||r["@@iterator"])?c:null,"function"==typeof c)for(r=c.call(r),l=0;!(i=r.next()).done;)g+=e(i=i.value,c=t+N(i,l++),s,n);else if("object"===i)throw s=""+r,h(Error(31),"[object Object]"===s?"object with keys {"+Object.keys(r).join(", ")+"}":s,"");return g}(e,"",r,t)}function N(e,r){return"object"==typeof e&&null!==e&&null!=e.key?function(e){var r={"=":"=0",":":"=2"};return"$"+(""+e).replace(/[=:]/g,(function(e){return r[e]}))}(e.key):r.toString(36)}function U(e,r){e.func.call(e.context,r,e.count++)}function B(e,r,t){var s=e.result,n=e.keyPrefix;e=e.func.call(e.context,r,e.count++),Array.isArray(e)?F(e,s,t,(function(e){return e})):null!=e&&($(e)&&(e=function(e,r){return{$$typeof:o,type:e.type,key:r,ref:e.ref,props:e.props,_owner:e._owner}}(e,n+(!e.key||r&&r.key===e.key?"":(""+e.key).replace(T,"$&/")+"/")+t)),s.push(e))}function F(e,r,t,s,n){var o="";null!=t&&(o=(""+t).replace(T,"$&/")+"/"),I(e,B,r=R(r,o,s,n)),M(r)}function D(){var e=S.current;if(null===e)throw h(Error(321));return e}var q={Children:{map:function(e,r,t){if(null==e)return e;var s=[];return F(e,s,null,r,t),s},forEach:function(e,r,t){if(null==e)return e;I(e,U,r=R(null,null,r,t)),M(r)},count:function(e){return I(e,(function(){return null}),null)},toArray:function(e){var r=[];return F(e,r,null,(function(e){return e})),r},only:function(e){if(!$(e))throw h(Error(143));return e}},createRef:function(){return{current:null}},Component:v,PureComponent:k,createContext:function(e,r){return void 0===r&&(r=null),(e={$$typeof:m,_calculateChangedBits:r,_currentValue:e,_currentValue2:e,_threadCount:0,Provider:null,Consumer:null}).Provider={$$typeof:c,_context:e},e.Consumer=e},forwardRef:function(e){return{$$typeof:u,render:e}},lazy:function(e){return{$$typeof:p,_ctor:e,_status:-1,_result:null}},memo:function(e,r){return{$$typeof:d,type:e,compare:void 0===r?null:r}},useCallback:function(e,r){return D().useCallback(e,r)},useContext:function(e,r){return D().useContext(e,r)},useEffect:function(e,r){return D().useEffect(e,r)},useImperativeHandle:function(e,r,t){return D().useImperativeHandle(e,r,t)},useDebugValue:function(){},useLayoutEffect:function(e,r){return D().useLayoutEffect(e,r)},useMemo:function(e,r){return D().useMemo(e,r)},useReducer:function(e,r,t){return D().useReducer(e,r,t)},useRef:function(e){return D().useRef(e)},useState:function(e){return D().useState(e)},Fragment:i,Profiler:l,StrictMode:g,Suspense:A,unstable_SuspenseList:f,createElement:O,cloneElement:function(e,r,t){if(null==e)throw h(Error(267),e);var n=void 0,a=s({},e.props),i=e.key,g=e.ref,l=e._owner;if(null!=r){void 0!==r.ref&&(g=r.ref,l=C.current),void 0!==r.key&&(i=""+r.key);var c=void 0;for(n in e.type&&e.type.defaultProps&&(c=e.type.defaultProps),r)j.call(r,n)&&!E.hasOwnProperty(n)&&(a[n]=void 0===r[n]&&void 0!==c?c[n]:r[n])}if(1===(n=arguments.length-2))a.children=t;else if(1<n){c=Array(n);for(var m=0;m<n;m++)c[m]=arguments[m+2];a.children=c}return{$$typeof:o,type:e.type,key:i,ref:g,props:a,_owner:l}},createFactory:function(e){var r=O.bind(null,e);return r.type=e,r},isValidElement:$,version:"16.9.0",unstable_withSuspenseConfig:function(e,r){var t=P.suspense;P.suspense=void 0===r?null:r;try{e()}finally{P.suspense=t}},__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED:{ReactCurrentDispatcher:S,ReactCurrentBatchConfig:P,ReactCurrentOwner:C,IsSomeRendererActing:{current:!1},assign:s}},V={default:q},W=V&&q||V;e.exports=W.default||W},27:function(e,r,t){"use strict";t.r(r),t.d(r,"StorageArea",(function(){return a}));var s=t(11);const n={local:s.browser.storage.local,managed:s.browser.storage.managed,sync:s.browser.storage.sync},o=Symbol("all settings");class a{constructor(e){if(this._storageName="local",this._accessors={},this._listeners={},this._onChanged=(e,r)=>{if(r===this._storageName)for(const r in e)e.hasOwnProperty(r)&&(r in this._listeners&&t(r,this._listeners[r]),o in this._listeners&&t(r,this._listeners[o]));function t(r,t){for(const s of t)s(e[r],r)}},this.defaults=e.defaults,e.storageArea&&(this._storageName=e.storageArea),!(this._storageName in n))throw new Error(`Invalid storage area: ${this._storageName}`);this._storage=n[this._storageName],this._makeProperties(),s.browser.storage.onChanged.addListener(this._onChanged)}static create(e){return new a(e)}dispose(){s.browser.storage.onChanged.removeListener(this._onChanged);for(const e in this._listeners)this._listeners.hasOwnProperty(e)&&delete this._listeners[e]}async get(e){return void 0===e?await this._storage.get():(await this._storage.get(e))[e]}async initDefaults(){const e=await this.get(),r={};for(const t in this.defaults)!this.defaults.hasOwnProperty(t)||t in e||(r[t]=this.defaults[t]);return this.set(r)}async isDefined(e){return void 0!==await this.get(e)}async reset(e){if(e in this.defaults)return this.set(e,this.defaults[e]);throw new Error(`No default value for setting: ${e}`)}async resetAll(){return this.set(this.defaults)}async set(e,r){let t;return t="string"==typeof e?{[e]:r}:e,this._storage.set(t)}accessor(e){return this._accessors[e]||this._makeAccessor(e)}addListener(e,r){const{key:t,callback:s}=this._getListenerArgs(e,r);t in this._listeners?this._listeners[t].add(s):this._listeners[t]=new Set([s])}removeListener(e,r){const{key:t,callback:s}=this._getListenerArgs(e,r);t in this._listeners&&this._listeners[t].delete(s)}_getListenerArgs(e,r){let t,s;if(r){if("string"!=typeof e)throw new TypeError("Expected key to be a string");t=e,s=r}else{if("function"!=typeof e)throw new TypeError("Expected callback to be a function");t=o,s=e}return{key:t,callback:s}}_makeAccessor(e){const r={default:this.defaults[e],key:e,get:()=>this.get(e),set:r=>this.set(e,r),reset:()=>this.reset(e),addListener:r=>this.addListener(e,r),removeListener:r=>this.removeListener(e,r)};return this._accessors[e]=r,r}_makeProperties(){const e={};for(const r in this.defaults)this.defaults.hasOwnProperty(r)&&!this.hasOwnProperty(r)&&(e[r]={enumerable:!0,get:()=>this.accessor(r)});Object.defineProperties(this,e)}}}});
//# sourceMappingURL=storage.js.map