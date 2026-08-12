var cp=Object.defineProperty;var up=(n,e,t)=>e in n?cp(n,e,{enumerable:!0,configurable:!0,writable:!0,value:t}):n[e]=t;var _=(n,e,t)=>up(n,typeof e!="symbol"?e+"":e,t);const lp=()=>{};var Ku={};/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const i2=function(n){const e=[];let t=0;for(let r=0;r<n.length;r++){let s=n.charCodeAt(r);s<128?e[t++]=s:s<2048?(e[t++]=s>>6|192,e[t++]=s&63|128):(s&64512)===55296&&r+1<n.length&&(n.charCodeAt(r+1)&64512)===56320?(s=65536+((s&1023)<<10)+(n.charCodeAt(++r)&1023),e[t++]=s>>18|240,e[t++]=s>>12&63|128,e[t++]=s>>6&63|128,e[t++]=s&63|128):(e[t++]=s>>12|224,e[t++]=s>>6&63|128,e[t++]=s&63|128)}return e},hp=function(n){const e=[];let t=0,r=0;for(;t<n.length;){const s=n[t++];if(s<128)e[r++]=String.fromCharCode(s);else if(s>191&&s<224){const i=n[t++];e[r++]=String.fromCharCode((s&31)<<6|i&63)}else if(s>239&&s<365){const i=n[t++],o=n[t++],c=n[t++],u=((s&7)<<18|(i&63)<<12|(o&63)<<6|c&63)-65536;e[r++]=String.fromCharCode(55296+(u>>10)),e[r++]=String.fromCharCode(56320+(u&1023))}else{const i=n[t++],o=n[t++];e[r++]=String.fromCharCode((s&15)<<12|(i&63)<<6|o&63)}}return e.join("")},o2={byteToCharMap_:null,charToByteMap_:null,byteToCharMapWebSafe_:null,charToByteMapWebSafe_:null,ENCODED_VALS_BASE:"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",get ENCODED_VALS(){return this.ENCODED_VALS_BASE+"+/="},get ENCODED_VALS_WEBSAFE(){return this.ENCODED_VALS_BASE+"-_."},HAS_NATIVE_SUPPORT:typeof atob=="function",encodeByteArray(n,e){if(!Array.isArray(n))throw Error("encodeByteArray takes an array as a parameter");this.init_();const t=e?this.byteToCharMapWebSafe_:this.byteToCharMap_,r=[];for(let s=0;s<n.length;s+=3){const i=n[s],o=s+1<n.length,c=o?n[s+1]:0,u=s+2<n.length,l=u?n[s+2]:0,p=i>>2,g=(i&3)<<4|c>>4;let T=(c&15)<<2|l>>6,b=l&63;u||(b=64,o||(T=64)),r.push(t[p],t[g],t[T],t[b])}return r.join("")},encodeString(n,e){return this.HAS_NATIVE_SUPPORT&&!e?btoa(n):this.encodeByteArray(i2(n),e)},decodeString(n,e){return this.HAS_NATIVE_SUPPORT&&!e?atob(n):hp(this.decodeStringToByteArray(n,e))},decodeStringToByteArray(n,e){this.init_();const t=e?this.charToByteMapWebSafe_:this.charToByteMap_,r=[];for(let s=0;s<n.length;){const i=t[n.charAt(s++)],c=s<n.length?t[n.charAt(s)]:0;++s;const l=s<n.length?t[n.charAt(s)]:64;++s;const g=s<n.length?t[n.charAt(s)]:64;if(++s,i==null||c==null||l==null||g==null)throw new fp;const T=i<<2|c>>4;if(r.push(T),l!==64){const b=c<<4&240|l>>2;if(r.push(b),g!==64){const O=l<<6&192|g;r.push(O)}}}return r},init_(){if(!this.byteToCharMap_){this.byteToCharMap_={},this.charToByteMap_={},this.byteToCharMapWebSafe_={},this.charToByteMapWebSafe_={};for(let n=0;n<this.ENCODED_VALS.length;n++)this.byteToCharMap_[n]=this.ENCODED_VALS.charAt(n),this.charToByteMap_[this.byteToCharMap_[n]]=n,this.byteToCharMapWebSafe_[n]=this.ENCODED_VALS_WEBSAFE.charAt(n),this.charToByteMapWebSafe_[this.byteToCharMapWebSafe_[n]]=n,n>=this.ENCODED_VALS_BASE.length&&(this.charToByteMap_[this.ENCODED_VALS_WEBSAFE.charAt(n)]=n,this.charToByteMapWebSafe_[this.ENCODED_VALS.charAt(n)]=n)}}};class fp extends Error{constructor(){super(...arguments),this.name="DecodeBase64StringError"}}const dp=function(n){const e=i2(n);return o2.encodeByteArray(e,!0)},ro=function(n){return dp(n).replace(/\./g,"")},a2=function(n){try{return o2.decodeString(n,!0)}catch(e){console.error("base64Decode failed: ",e)}return null};/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function pp(){if(typeof self<"u")return self;if(typeof window<"u")return window;if(typeof global<"u")return global;throw new Error("Unable to locate global object.")}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const mp=()=>pp().__FIREBASE_DEFAULTS__,gp=()=>{if(typeof process>"u"||typeof Ku>"u")return;const n=Ku.__FIREBASE_DEFAULTS__;if(n)return JSON.parse(n)},_p=()=>{if(typeof document>"u")return;let n;try{n=document.cookie.match(/__FIREBASE_DEFAULTS__=([^;]+)/)}catch{return}const e=n&&a2(n[1]);return e&&JSON.parse(e)},Oo=()=>{try{return lp()||mp()||gp()||_p()}catch(n){console.info(`Unable to get __FIREBASE_DEFAULTS__ due to: ${n}`);return}},c2=n=>Oo()?.emulatorHosts?.[n],u2=n=>{const e=c2(n);if(!e)return;const t=e.lastIndexOf(":");if(t<=0||t+1===e.length)throw new Error(`Invalid host ${e} with no separate hostname and port!`);const r=parseInt(e.substring(t+1),10);return e[0]==="["?[e.substring(1,t-1),r]:[e.substring(0,t),r]},l2=()=>Oo()?.config,h2=n=>Oo()?.[`_${n}`];/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class f2{constructor(){this.reject=()=>{},this.resolve=()=>{},this.promise=new Promise((e,t)=>{this.resolve=e,this.reject=t})}wrapCallback(e){return(t,r)=>{t?this.reject(t):this.resolve(r),typeof e=="function"&&(this.promise.catch(()=>{}),e.length===1?e(t):e(t,r))}}}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function d2(n,e){if(n.uid)throw new Error('The "uid" field is no longer supported by mockUserToken. Please use "sub" instead for Firebase Auth User ID.');const t={alg:"none",type:"JWT"},r=e||"demo-project",s=n.iat||0,i=n.sub||n.user_id;if(!i)throw new Error("mockUserToken must contain 'sub' or 'user_id' field!");const o={iss:`https://securetoken.google.com/${r}`,aud:r,iat:s,exp:s+3600,auth_time:s,sub:i,user_id:i,firebase:{sign_in_provider:"custom",identities:{}},...n};return[ro(JSON.stringify(t)),ro(JSON.stringify(o)),""].join(".")}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Qe(){return typeof navigator<"u"&&typeof navigator.userAgent=="string"?navigator.userAgent:""}function yp(){return typeof window<"u"&&!!(window.cordova||window.phonegap||window.PhoneGap)&&/ios|iphone|ipod|ipad|android|blackberry|iemobile/i.test(Qe())}function Ep(){const n=Oo()?.forceEnvironment;if(n==="node")return!0;if(n==="browser")return!1;try{return Object.prototype.toString.call(global.process)==="[object process]"}catch{return!1}}function Ip(){return typeof navigator<"u"&&navigator.userAgent==="Cloudflare-Workers"}function Nc(){const n=typeof chrome=="object"?chrome.runtime:typeof browser=="object"?browser.runtime:void 0;return typeof n=="object"&&n.id!==void 0}function Tp(){return typeof navigator=="object"&&navigator.product==="ReactNative"}function wp(){const n=Qe();return n.indexOf("MSIE ")>=0||n.indexOf("Trident/")>=0}function Ap(){return!Ep()&&!!navigator.userAgent&&navigator.userAgent.includes("Safari")&&!navigator.userAgent.includes("Chrome")}function Oc(){try{return typeof indexedDB=="object"}catch{return!1}}function kc(){return new Promise((n,e)=>{try{let t=!0;const r="validate-browser-context-for-indexeddb-analytics-module",s=self.indexedDB.open(r);s.onsuccess=()=>{s.result.close(),t||self.indexedDB.deleteDatabase(r),n(!0)},s.onupgradeneeded=()=>{t=!1},s.onerror=()=>{e(s.error?.message||"")}}catch(t){e(t)}})}function p2(){return!(typeof navigator>"u"||!navigator.cookieEnabled)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const vp="FirebaseError";class Ct extends Error{constructor(e,t,r){super(t),this.code=e,this.customData=r,this.name=vp,Object.setPrototypeOf(this,Ct.prototype),Error.captureStackTrace&&Error.captureStackTrace(this,lr.prototype.create)}}class lr{constructor(e,t,r){this.service=e,this.serviceName=t,this.errors=r}create(e,...t){const r=t[0]||{},s=`${this.service}/${e}`,i=this.errors[e],o=i?Rp(i,r):"Error",c=`${this.serviceName}: ${o} (${s}).`;return new Ct(s,c,r)}}function Rp(n,e){return n.replace(Cp,(t,r)=>{const s=e[r];return s!=null?String(s):`<${r}?>`})}const Cp=/\{\$([^}]+)}/g;function Pp(n){for(const e in n)if(Object.prototype.hasOwnProperty.call(n,e))return!1;return!0}function jt(n,e){if(n===e)return!0;const t=Object.keys(n),r=Object.keys(e);for(const s of t){if(!r.includes(s))return!1;const i=n[s],o=e[s];if(Yu(i)&&Yu(o)){if(!jt(i,o))return!1}else if(i!==o)return!1}for(const s of r)if(!t.includes(s))return!1;return!0}function Yu(n){return n!==null&&typeof n=="object"}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Ur(n){const e=[];for(const[t,r]of Object.entries(n))Array.isArray(r)?r.forEach(s=>{e.push(encodeURIComponent(t)+"="+encodeURIComponent(s))}):e.push(encodeURIComponent(t)+"="+encodeURIComponent(r));return e.length?"&"+e.join("&"):""}function _s(n){const e={};return n.replace(/^\?/,"").split("&").forEach(r=>{if(r){const[s,i]=r.split("=");e[decodeURIComponent(s)]=decodeURIComponent(i)}}),e}function ys(n){const e=n.indexOf("?");if(!e)return"";const t=n.indexOf("#",e);return n.substring(e,t>0?t:void 0)}function Sp(n,e){const t=new bp(n,e);return t.subscribe.bind(t)}class bp{constructor(e,t){this.observers=[],this.unsubscribes=[],this.observerCount=0,this.task=Promise.resolve(),this.finalized=!1,this.onNoObservers=t,this.task.then(()=>{e(this)}).catch(r=>{this.error(r)})}next(e){this.forEachObserver(t=>{t.next(e)})}error(e){this.forEachObserver(t=>{t.error(e)}),this.close(e)}complete(){this.forEachObserver(e=>{e.complete()}),this.close()}subscribe(e,t,r){let s;if(e===void 0&&t===void 0&&r===void 0)throw new Error("Missing Observer.");Np(e,["next","error","complete"])?s=e:s={next:e,error:t,complete:r},s.next===void 0&&(s.next=Ma),s.error===void 0&&(s.error=Ma),s.complete===void 0&&(s.complete=Ma);const i=this.unsubscribeOne.bind(this,this.observers.length);return this.finalized&&this.task.then(()=>{try{this.finalError?s.error(this.finalError):s.complete()}catch{}}),this.observers.push(s),i}unsubscribeOne(e){this.observers===void 0||this.observers[e]===void 0||(delete this.observers[e],this.observerCount-=1,this.observerCount===0&&this.onNoObservers!==void 0&&this.onNoObservers(this))}forEachObserver(e){if(!this.finalized)for(let t=0;t<this.observers.length;t++)this.sendOne(t,e)}sendOne(e,t){this.task.then(()=>{if(this.observers!==void 0&&this.observers[e]!==void 0)try{t(this.observers[e])}catch(r){typeof console<"u"&&console.error&&console.error(r)}})}close(e){this.finalized||(this.finalized=!0,e!==void 0&&(this.finalError=e),this.task.then(()=>{this.observers=void 0,this.onNoObservers=void 0}))}}function Np(n,e){if(typeof n!="object"||n===null)return!1;for(const t of e)if(t in n&&typeof n[t]=="function")return!0;return!1}function Ma(){}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Op=1e3,kp=2,Dp=14400*1e3,Vp=.5;function Qu(n,e=Op,t=kp){const r=e*Math.pow(t,n),s=Math.round(Vp*r*(Math.random()-.5)*2);return Math.min(Dp,r+s)}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function le(n){return n&&n._delegate?n._delegate:n}/**
 * @license
 * Copyright 2025 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function hr(n){try{return(n.startsWith("http://")||n.startsWith("https://")?new URL(n).hostname:n).endsWith(".cloudworkstations.dev")}catch{return!1}}async function ko(n){return(await fetch(n,{credentials:"include"})).ok}class At{constructor(e,t,r){this.name=e,this.instanceFactory=t,this.type=r,this.multipleInstances=!1,this.serviceProps={},this.instantiationMode="LAZY",this.onInstanceCreated=null}setInstantiationMode(e){return this.instantiationMode=e,this}setMultipleInstances(e){return this.multipleInstances=e,this}setServiceProps(e){return this.serviceProps=e,this}setInstanceCreatedCallback(e){return this.onInstanceCreated=e,this}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Zn="[DEFAULT]";/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class xp{constructor(e,t){this.name=e,this.container=t,this.component=null,this.instances=new Map,this.instancesDeferred=new Map,this.instancesOptions=new Map,this.onInitCallbacks=new Map}get(e){const t=this.normalizeInstanceIdentifier(e);if(!this.instancesDeferred.has(t)){const r=new f2;if(this.instancesDeferred.set(t,r),this.isInitialized(t)||this.shouldAutoInitialize())try{const s=this.getOrInitializeService({instanceIdentifier:t});s&&r.resolve(s)}catch{}}return this.instancesDeferred.get(t).promise}getImmediate(e){const t=this.normalizeInstanceIdentifier(e?.identifier),r=e?.optional??!1;if(this.isInitialized(t)||this.shouldAutoInitialize())try{return this.getOrInitializeService({instanceIdentifier:t})}catch(s){if(r)return null;throw s}else{if(r)return null;throw Error(`Service ${this.name} is not available`)}}getComponent(){return this.component}setComponent(e){if(e.name!==this.name)throw Error(`Mismatching Component ${e.name} for Provider ${this.name}.`);if(this.component)throw Error(`Component for ${this.name} has already been provided`);if(this.component=e,!!this.shouldAutoInitialize()){if(Mp(e))try{this.getOrInitializeService({instanceIdentifier:Zn})}catch{}for(const[t,r]of this.instancesDeferred.entries()){const s=this.normalizeInstanceIdentifier(t);try{const i=this.getOrInitializeService({instanceIdentifier:s});r.resolve(i)}catch{}}}}clearInstance(e=Zn){this.instancesDeferred.delete(e),this.instancesOptions.delete(e),this.instances.delete(e)}async delete(){const e=Array.from(this.instances.values());await Promise.all([...e.filter(t=>"INTERNAL"in t).map(t=>t.INTERNAL.delete()),...e.filter(t=>"_delete"in t).map(t=>t._delete())])}isComponentSet(){return this.component!=null}isInitialized(e=Zn){return this.instances.has(e)}getOptions(e=Zn){return this.instancesOptions.get(e)||{}}initialize(e={}){const{options:t={}}=e,r=this.normalizeInstanceIdentifier(e.instanceIdentifier);if(this.isInitialized(r))throw Error(`${this.name}(${r}) has already been initialized`);if(!this.isComponentSet())throw Error(`Component ${this.name} has not been registered yet`);const s=this.getOrInitializeService({instanceIdentifier:r,options:t});for(const[i,o]of this.instancesDeferred.entries()){const c=this.normalizeInstanceIdentifier(i);r===c&&o.resolve(s)}return s}onInit(e,t){const r=this.normalizeInstanceIdentifier(t),s=this.onInitCallbacks.get(r)??new Set;s.add(e),this.onInitCallbacks.set(r,s);const i=this.instances.get(r);return i&&e(i,r),()=>{s.delete(e)}}invokeOnInitCallbacks(e,t){const r=this.onInitCallbacks.get(t);if(r)for(const s of r)try{s(e,t)}catch{}}getOrInitializeService({instanceIdentifier:e,options:t={}}){let r=this.instances.get(e);if(!r&&this.component&&(r=this.component.instanceFactory(this.container,{instanceIdentifier:Lp(e),options:t}),this.instances.set(e,r),this.instancesOptions.set(e,t),this.invokeOnInitCallbacks(r,e),this.component.onInstanceCreated))try{this.component.onInstanceCreated(this.container,e,r)}catch{}return r||null}normalizeInstanceIdentifier(e=Zn){return this.component?this.component.multipleInstances?e:Zn:e}shouldAutoInitialize(){return!!this.component&&this.component.instantiationMode!=="EXPLICIT"}}function Lp(n){return n===Zn?void 0:n}function Mp(n){return n.instantiationMode==="EAGER"}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Fp{constructor(e){this.name=e,this.providers=new Map}addComponent(e){const t=this.getProvider(e.name);if(t.isComponentSet())throw new Error(`Component ${e.name} has already been registered with ${this.name}`);t.setComponent(e)}addOrOverwriteComponent(e){this.getProvider(e.name).isComponentSet()&&this.providers.delete(e.name),this.addComponent(e)}getProvider(e){if(this.providers.has(e))return this.providers.get(e);const t=new xp(e,this);return this.providers.set(e,t),t}getProviders(){return Array.from(this.providers.values())}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */var ie;(function(n){n[n.DEBUG=0]="DEBUG",n[n.VERBOSE=1]="VERBOSE",n[n.INFO=2]="INFO",n[n.WARN=3]="WARN",n[n.ERROR=4]="ERROR",n[n.SILENT=5]="SILENT"})(ie||(ie={}));const Up={debug:ie.DEBUG,verbose:ie.VERBOSE,info:ie.INFO,warn:ie.WARN,error:ie.ERROR,silent:ie.SILENT},Bp=ie.INFO,$p={[ie.DEBUG]:"log",[ie.VERBOSE]:"log",[ie.INFO]:"info",[ie.WARN]:"warn",[ie.ERROR]:"error"},qp=(n,e,...t)=>{if(e<n.logLevel)return;const r=new Date().toISOString(),s=$p[e];if(s)console[s](`[${r}]  ${n.name}:`,...t);else throw new Error(`Attempted to log a message with an invalid logType (value: ${e})`)};class Do{constructor(e){this.name=e,this._logLevel=Bp,this._logHandler=qp,this._userLogHandler=null}get logLevel(){return this._logLevel}set logLevel(e){if(!(e in ie))throw new TypeError(`Invalid value "${e}" assigned to \`logLevel\``);this._logLevel=e}setLogLevel(e){this._logLevel=typeof e=="string"?Up[e]:e}get logHandler(){return this._logHandler}set logHandler(e){if(typeof e!="function")throw new TypeError("Value assigned to `logHandler` must be a function");this._logHandler=e}get userLogHandler(){return this._userLogHandler}set userLogHandler(e){this._userLogHandler=e}debug(...e){this._userLogHandler&&this._userLogHandler(this,ie.DEBUG,...e),this._logHandler(this,ie.DEBUG,...e)}log(...e){this._userLogHandler&&this._userLogHandler(this,ie.VERBOSE,...e),this._logHandler(this,ie.VERBOSE,...e)}info(...e){this._userLogHandler&&this._userLogHandler(this,ie.INFO,...e),this._logHandler(this,ie.INFO,...e)}warn(...e){this._userLogHandler&&this._userLogHandler(this,ie.WARN,...e),this._logHandler(this,ie.WARN,...e)}error(...e){this._userLogHandler&&this._userLogHandler(this,ie.ERROR,...e),this._logHandler(this,ie.ERROR,...e)}}const Hp=(n,e)=>e.some(t=>n instanceof t);let Xu,Ju;function jp(){return Xu||(Xu=[IDBDatabase,IDBObjectStore,IDBIndex,IDBCursor,IDBTransaction])}function Gp(){return Ju||(Ju=[IDBCursor.prototype.advance,IDBCursor.prototype.continue,IDBCursor.prototype.continuePrimaryKey])}const m2=new WeakMap,sc=new WeakMap,g2=new WeakMap,Fa=new WeakMap,Dc=new WeakMap;function Wp(n){const e=new Promise((t,r)=>{const s=()=>{n.removeEventListener("success",i),n.removeEventListener("error",o)},i=()=>{t(Pn(n.result)),s()},o=()=>{r(n.error),s()};n.addEventListener("success",i),n.addEventListener("error",o)});return e.then(t=>{t instanceof IDBCursor&&m2.set(t,n)}).catch(()=>{}),Dc.set(e,n),e}function zp(n){if(sc.has(n))return;const e=new Promise((t,r)=>{const s=()=>{n.removeEventListener("complete",i),n.removeEventListener("error",o),n.removeEventListener("abort",o)},i=()=>{t(),s()},o=()=>{r(n.error||new DOMException("AbortError","AbortError")),s()};n.addEventListener("complete",i),n.addEventListener("error",o),n.addEventListener("abort",o)});sc.set(n,e)}let ic={get(n,e,t){if(n instanceof IDBTransaction){if(e==="done")return sc.get(n);if(e==="objectStoreNames")return n.objectStoreNames||g2.get(n);if(e==="store")return t.objectStoreNames[1]?void 0:t.objectStore(t.objectStoreNames[0])}return Pn(n[e])},set(n,e,t){return n[e]=t,!0},has(n,e){return n instanceof IDBTransaction&&(e==="done"||e==="store")?!0:e in n}};function Kp(n){ic=n(ic)}function Yp(n){return n===IDBDatabase.prototype.transaction&&!("objectStoreNames"in IDBTransaction.prototype)?function(e,...t){const r=n.call(Ua(this),e,...t);return g2.set(r,e.sort?e.sort():[e]),Pn(r)}:Gp().includes(n)?function(...e){return n.apply(Ua(this),e),Pn(m2.get(this))}:function(...e){return Pn(n.apply(Ua(this),e))}}function Qp(n){return typeof n=="function"?Yp(n):(n instanceof IDBTransaction&&zp(n),Hp(n,jp())?new Proxy(n,ic):n)}function Pn(n){if(n instanceof IDBRequest)return Wp(n);if(Fa.has(n))return Fa.get(n);const e=Qp(n);return e!==n&&(Fa.set(n,e),Dc.set(e,n)),e}const Ua=n=>Dc.get(n);function _2(n,e,{blocked:t,upgrade:r,blocking:s,terminated:i}={}){const o=indexedDB.open(n,e),c=Pn(o);return r&&o.addEventListener("upgradeneeded",u=>{r(Pn(o.result),u.oldVersion,u.newVersion,Pn(o.transaction),u)}),t&&o.addEventListener("blocked",u=>t(u.oldVersion,u.newVersion,u)),c.then(u=>{i&&u.addEventListener("close",()=>i()),s&&u.addEventListener("versionchange",l=>s(l.oldVersion,l.newVersion,l))}).catch(()=>{}),c}const Xp=["get","getKey","getAll","getAllKeys","count"],Jp=["put","add","delete","clear"],Ba=new Map;function Zu(n,e){if(!(n instanceof IDBDatabase&&!(e in n)&&typeof e=="string"))return;if(Ba.get(e))return Ba.get(e);const t=e.replace(/FromIndex$/,""),r=e!==t,s=Jp.includes(t);if(!(t in(r?IDBIndex:IDBObjectStore).prototype)||!(s||Xp.includes(t)))return;const i=async function(o,...c){const u=this.transaction(o,s?"readwrite":"readonly");let l=u.store;return r&&(l=l.index(c.shift())),(await Promise.all([l[t](...c),s&&u.done]))[0]};return Ba.set(e,i),i}Kp(n=>({...n,get:(e,t,r)=>Zu(e,t)||n.get(e,t,r),has:(e,t)=>!!Zu(e,t)||n.has(e,t)}));/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Zp{constructor(e){this.container=e}getPlatformInfoString(){return this.container.getProviders().map(t=>{if(e0(t)){const r=t.getImmediate();return`${r.library}/${r.version}`}else return null}).filter(t=>t).join(" ")}}function e0(n){return n.getComponent()?.type==="VERSION"}const oc="@firebase/app",el="0.15.1";/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const nn=new Do("@firebase/app"),t0="@firebase/app-compat",n0="@firebase/analytics-compat",r0="@firebase/analytics",s0="@firebase/app-check-compat",i0="@firebase/app-check",o0="@firebase/auth",a0="@firebase/auth-compat",c0="@firebase/database",u0="@firebase/data-connect",l0="@firebase/database-compat",h0="@firebase/functions",f0="@firebase/functions-compat",d0="@firebase/installations",p0="@firebase/installations-compat",m0="@firebase/messaging",g0="@firebase/messaging-compat",_0="@firebase/performance",y0="@firebase/performance-compat",E0="@firebase/remote-config",I0="@firebase/remote-config-compat",T0="@firebase/storage",w0="@firebase/storage-compat",A0="@firebase/firestore",v0="@firebase/ai",R0="@firebase/firestore-compat",C0="firebase",P0="12.16.0";/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const ac="[DEFAULT]",S0={[oc]:"fire-core",[t0]:"fire-core-compat",[r0]:"fire-analytics",[n0]:"fire-analytics-compat",[i0]:"fire-app-check",[s0]:"fire-app-check-compat",[o0]:"fire-auth",[a0]:"fire-auth-compat",[c0]:"fire-rtdb",[u0]:"fire-data-connect",[l0]:"fire-rtdb-compat",[h0]:"fire-fn",[f0]:"fire-fn-compat",[d0]:"fire-iid",[p0]:"fire-iid-compat",[m0]:"fire-fcm",[g0]:"fire-fcm-compat",[_0]:"fire-perf",[y0]:"fire-perf-compat",[E0]:"fire-rc",[I0]:"fire-rc-compat",[T0]:"fire-gcs",[w0]:"fire-gcs-compat",[A0]:"fire-fst",[R0]:"fire-fst-compat",[v0]:"fire-vertex","fire-js":"fire-js",[C0]:"fire-js-all"};/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Fs=new Map,b0=new Map,cc=new Map;function tl(n,e){try{n.container.addComponent(e)}catch(t){nn.debug(`Component ${e.name} failed to register with FirebaseApp ${n.name}`,t)}}function Nt(n){const e=n.name;if(cc.has(e))return nn.debug(`There were multiple attempts to register component ${e}.`),!1;cc.set(e,n);for(const t of Fs.values())tl(t,n);for(const t of b0.values())tl(t,n);return!0}function un(n,e){const t=n.container.getProvider("heartbeat").getImmediate({optional:!0});return t&&t.triggerHeartbeat(),n.container.getProvider(e)}function ze(n){return n==null?!1:n.settings!==void 0}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const N0={"no-app":"No Firebase App '{$appName}' has been created - call initializeApp() first","bad-app-name":"Illegal App name: '{$appName}'","duplicate-app":"Firebase App named '{$appName}' already exists with different options or config","app-deleted":"Firebase App named '{$appName}' already deleted","server-app-deleted":"Firebase Server App has been deleted","no-options":"Need to provide options, when not being deployed to hosting via source.","invalid-app-argument":"firebase.{$appName}() takes either no argument or a Firebase App instance.","invalid-log-argument":"First argument to `onLog` must be null or a function.","idb-open":"Error thrown when opening IndexedDB. Original error: {$originalErrorMessage}.","idb-get":"Error thrown when reading from IndexedDB. Original error: {$originalErrorMessage}.","idb-set":"Error thrown when writing to IndexedDB. Original error: {$originalErrorMessage}.","idb-delete":"Error thrown when deleting from IndexedDB. Original error: {$originalErrorMessage}.","finalization-registry-not-supported":"FirebaseServerApp deleteOnDeref field defined but the JS runtime does not support FinalizationRegistry.","invalid-server-app-environment":"FirebaseServerApp is not for use in browser environments."},Sn=new lr("app","Firebase",N0);/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class O0{constructor(e,t,r){this._isDeleted=!1,this._options={...e},this._config={...t},this._name=t.name,this._automaticDataCollectionEnabled=t.automaticDataCollectionEnabled,this._container=r,this.container.addComponent(new At("app",()=>this,"PUBLIC"))}get automaticDataCollectionEnabled(){return this.checkDestroyed(),this._automaticDataCollectionEnabled}set automaticDataCollectionEnabled(e){this.checkDestroyed(),this._automaticDataCollectionEnabled=e}get name(){return this.checkDestroyed(),this._name}get options(){return this.checkDestroyed(),this._options}get config(){return this.checkDestroyed(),this._config}get container(){return this._container}get isDeleted(){return this._isDeleted}set isDeleted(e){this._isDeleted=e}checkDestroyed(){if(this.isDeleted)throw Sn.create("app-deleted",{appName:this._name})}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const fr=P0;function k0(n,e={}){let t=n;typeof e!="object"&&(e={name:e});const r={name:ac,automaticDataCollectionEnabled:!0,...e},s=r.name;if(typeof s!="string"||!s)throw Sn.create("bad-app-name",{appName:String(s)});if(t||(t=l2()),!t)throw Sn.create("no-options");const i=Fs.get(s);if(i){if(jt(t,i.options)&&jt(r,i.config))return i;throw Sn.create("duplicate-app",{appName:s})}const o=new Fp(s);for(const u of cc.values())o.addComponent(u);const c=new O0(t,r,o);return Fs.set(s,c),c}function Vo(n=ac){const e=Fs.get(n);if(!e&&n===ac&&l2())return k0();if(!e)throw Sn.create("no-app",{appName:n});return e}function Ty(){return Array.from(Fs.values())}function ct(n,e,t){let r=S0[n]??n;t&&(r+=`-${t}`);const s=r.match(/\s|\//),i=e.match(/\s|\//);if(s||i){const o=[`Unable to register library "${r}" with version "${e}":`];s&&o.push(`library name "${r}" contains illegal characters (whitespace or "/")`),s&&i&&o.push("and"),i&&o.push(`version name "${e}" contains illegal characters (whitespace or "/")`),nn.warn(o.join(" "));return}Nt(new At(`${r}-version`,()=>({library:r,version:e}),"VERSION"))}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const D0="firebase-heartbeat-database",V0=1,Us="firebase-heartbeat-store";let $a=null;function y2(){return $a||($a=_2(D0,V0,{upgrade:(n,e)=>{switch(e){case 0:try{n.createObjectStore(Us)}catch(t){console.warn(t)}}}}).catch(n=>{throw Sn.create("idb-open",{originalErrorMessage:n.message})})),$a}async function x0(n){try{const t=(await y2()).transaction(Us),r=await t.objectStore(Us).get(E2(n));return await t.done,r}catch(e){if(e instanceof Ct)nn.warn(e.message);else{const t=Sn.create("idb-get",{originalErrorMessage:e?.message});nn.warn(t.message)}}}async function nl(n,e){try{const r=(await y2()).transaction(Us,"readwrite");await r.objectStore(Us).put(e,E2(n)),await r.done}catch(t){if(t instanceof Ct)nn.warn(t.message);else{const r=Sn.create("idb-set",{originalErrorMessage:t?.message});nn.warn(r.message)}}}function E2(n){return`${n.name}!${n.options.appId}`}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const L0=1024,M0=30;class F0{constructor(e){this.container=e,this._heartbeatsCache=null;const t=this.container.getProvider("app").getImmediate();this._storage=new B0(t),this._heartbeatsCachePromise=this._storage.read().then(r=>(this._heartbeatsCache=r,r))}async triggerHeartbeat(){try{const t=this.container.getProvider("platform-logger").getImmediate().getPlatformInfoString(),r=rl();if(this._heartbeatsCache?.heartbeats==null&&(this._heartbeatsCache=await this._heartbeatsCachePromise,this._heartbeatsCache?.heartbeats==null)||this._heartbeatsCache.lastSentHeartbeatDate===r||this._heartbeatsCache.heartbeats.some(s=>s.date===r))return;if(this._heartbeatsCache.heartbeats.push({date:r,agent:t}),this._heartbeatsCache.heartbeats.length>M0){const s=$0(this._heartbeatsCache.heartbeats);this._heartbeatsCache.heartbeats.splice(s,1)}return this._storage.overwrite(this._heartbeatsCache)}catch(e){nn.warn(e)}}async getHeartbeatsHeader(){try{if(this._heartbeatsCache===null&&await this._heartbeatsCachePromise,this._heartbeatsCache?.heartbeats==null||this._heartbeatsCache.heartbeats.length===0)return"";const e=rl(),{heartbeatsToSend:t,unsentEntries:r}=U0(this._heartbeatsCache.heartbeats),s=ro(JSON.stringify({version:2,heartbeats:t}));return this._heartbeatsCache.lastSentHeartbeatDate=e,r.length>0?(this._heartbeatsCache.heartbeats=r,await this._storage.overwrite(this._heartbeatsCache)):(this._heartbeatsCache.heartbeats=[],this._storage.overwrite(this._heartbeatsCache)),s}catch(e){return nn.warn(e),""}}}function rl(){return new Date().toISOString().substring(0,10)}function U0(n,e=L0){const t=[];let r=n.slice();for(const s of n){const i=t.find(o=>o.agent===s.agent);if(i){if(i.dates.push(s.date),sl(t)>e){i.dates.pop();break}}else if(t.push({agent:s.agent,dates:[s.date]}),sl(t)>e){t.pop();break}r=r.slice(1)}return{heartbeatsToSend:t,unsentEntries:r}}class B0{constructor(e){this.app=e,this._canUseIndexedDBPromise=this.runIndexedDBEnvironmentCheck()}async runIndexedDBEnvironmentCheck(){return Oc()?kc().then(()=>!0).catch(()=>!1):!1}async read(){if(await this._canUseIndexedDBPromise){const t=await x0(this.app);return t?.heartbeats?t:{heartbeats:[]}}else return{heartbeats:[]}}async overwrite(e){if(await this._canUseIndexedDBPromise){const r=await this.read();return nl(this.app,{lastSentHeartbeatDate:e.lastSentHeartbeatDate??r.lastSentHeartbeatDate,heartbeats:e.heartbeats})}else return}async add(e){if(await this._canUseIndexedDBPromise){const r=await this.read();return nl(this.app,{lastSentHeartbeatDate:e.lastSentHeartbeatDate??r.lastSentHeartbeatDate,heartbeats:[...r.heartbeats,...e.heartbeats]})}else return}}function sl(n){return ro(JSON.stringify({version:2,heartbeats:n})).length}function $0(n){if(n.length===0)return-1;let e=0,t=n[0].date;for(let r=1;r<n.length;r++)n[r].date<t&&(t=n[r].date,e=r);return e}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function q0(n){Nt(new At("platform-logger",e=>new Zp(e),"PRIVATE")),Nt(new At("heartbeat",e=>new F0(e),"PRIVATE")),ct(oc,el,n),ct(oc,el,"esm2020"),ct("fire-js","")}q0("");var H0="firebase",j0="12.16.0";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ct(H0,j0,"app");function I2(){return{"dependent-sdk-initialized-before-auth":"Another Firebase SDK was initialized and is trying to use Auth before Auth is initialized. Please be sure to call `initializeAuth` or `getAuth` before starting any other Firebase SDK."}}const G0=I2,T2=new lr("auth","Firebase",I2());/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const so=new Do("@firebase/auth");function W0(n,...e){so.logLevel<=ie.WARN&&so.warn(`Auth (${fr}): ${n}`,...e)}function Gi(n,...e){so.logLevel<=ie.ERROR&&so.error(`Auth (${fr}): ${n}`,...e)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function vt(n,...e){throw Lc(n,...e)}function nt(n,...e){return Lc(n,...e)}function Vc(n,e,t){const r={...G0(),[e]:t};return new lr("auth","Firebase",r).create(e,{appName:n.name})}function Ut(n){return Vc(n,"operation-not-supported-in-this-environment","Operations that alter the current user are not supported in conjunction with FirebaseServerApp")}function xc(n,e,t){const r=t;if(!(e instanceof r))throw r.name!==e.constructor.name&&vt(n,"argument-error"),Vc(n,"argument-error",`Type of ${e.constructor.name} does not match expected instance.Did you pass a reference from a different Auth SDK?`)}function Lc(n,...e){if(typeof n!="string"){const t=e[0],r=[...e.slice(1)];return r[0]&&(r[0].appName=n.name),n._errorFactory.create(t,...r)}return T2.create(n,...e)}function H(n,e,...t){if(!n)throw Lc(e,...t)}function Xt(n){const e="INTERNAL ASSERTION FAILED: "+n;throw Gi(e),new Error(e)}function rn(n,e){n||Xt(e)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function uc(){return typeof self<"u"&&self.location?.href||""}function w2(){return il()==="http:"||il()==="https:"}function il(){return typeof self<"u"&&self.location?.protocol||null}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function z0(){return typeof navigator<"u"&&navigator&&"onLine"in navigator&&typeof navigator.onLine=="boolean"&&(w2()||Nc()||"connection"in navigator)?navigator.onLine:!0}function K0(){if(typeof navigator>"u")return null;const n=navigator;return n.languages&&n.languages[0]||n.language||null}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class si{constructor(e,t){this.shortDelay=e,this.longDelay=t,rn(t>e,"Short delay should be less than long delay!"),this.isMobile=yp()||Tp()}get(){return z0()?this.isMobile?this.longDelay:this.shortDelay:Math.min(5e3,this.shortDelay)}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Mc(n,e){rn(n.emulator,"Emulator should always be set here");const{url:t}=n.emulator;return e?`${t}${e.startsWith("/")?e.slice(1):e}`:t}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class A2{static initialize(e,t,r){this.fetchImpl=e,t&&(this.headersImpl=t),r&&(this.responseImpl=r)}static fetch(){if(this.fetchImpl)return this.fetchImpl;if(typeof self<"u"&&"fetch"in self)return self.fetch;if(typeof globalThis<"u"&&globalThis.fetch)return globalThis.fetch;if(typeof fetch<"u")return fetch;Xt("Could not find fetch implementation, make sure you call FetchProvider.initialize() with an appropriate polyfill")}static headers(){if(this.headersImpl)return this.headersImpl;if(typeof self<"u"&&"Headers"in self)return self.Headers;if(typeof globalThis<"u"&&globalThis.Headers)return globalThis.Headers;if(typeof Headers<"u")return Headers;Xt("Could not find Headers implementation, make sure you call FetchProvider.initialize() with an appropriate polyfill")}static response(){if(this.responseImpl)return this.responseImpl;if(typeof self<"u"&&"Response"in self)return self.Response;if(typeof globalThis<"u"&&globalThis.Response)return globalThis.Response;if(typeof Response<"u")return Response;Xt("Could not find Response implementation, make sure you call FetchProvider.initialize() with an appropriate polyfill")}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Y0={CREDENTIAL_MISMATCH:"custom-token-mismatch",MISSING_CUSTOM_TOKEN:"internal-error",INVALID_IDENTIFIER:"invalid-email",MISSING_CONTINUE_URI:"internal-error",INVALID_PASSWORD:"wrong-password",MISSING_PASSWORD:"missing-password",INVALID_LOGIN_CREDENTIALS:"invalid-credential",EMAIL_EXISTS:"email-already-in-use",PASSWORD_LOGIN_DISABLED:"operation-not-allowed",INVALID_IDP_RESPONSE:"invalid-credential",INVALID_PENDING_TOKEN:"invalid-credential",FEDERATED_USER_ID_ALREADY_LINKED:"credential-already-in-use",MISSING_REQ_TYPE:"internal-error",EMAIL_NOT_FOUND:"user-not-found",RESET_PASSWORD_EXCEED_LIMIT:"too-many-requests",EXPIRED_OOB_CODE:"expired-action-code",INVALID_OOB_CODE:"invalid-action-code",MISSING_OOB_CODE:"internal-error",CREDENTIAL_TOO_OLD_LOGIN_AGAIN:"requires-recent-login",INVALID_ID_TOKEN:"invalid-user-token",TOKEN_EXPIRED:"user-token-expired",USER_NOT_FOUND:"user-token-expired",TOO_MANY_ATTEMPTS_TRY_LATER:"too-many-requests",PASSWORD_DOES_NOT_MEET_REQUIREMENTS:"password-does-not-meet-requirements",INVALID_CODE:"invalid-verification-code",INVALID_SESSION_INFO:"invalid-verification-id",INVALID_TEMPORARY_PROOF:"invalid-credential",MISSING_SESSION_INFO:"missing-verification-id",SESSION_EXPIRED:"code-expired",MISSING_ANDROID_PACKAGE_NAME:"missing-android-pkg-name",UNAUTHORIZED_DOMAIN:"unauthorized-continue-uri",INVALID_OAUTH_CLIENT_ID:"invalid-oauth-client-id",ADMIN_ONLY_OPERATION:"admin-restricted-operation",INVALID_MFA_PENDING_CREDENTIAL:"invalid-multi-factor-session",MFA_ENROLLMENT_NOT_FOUND:"multi-factor-info-not-found",MISSING_MFA_ENROLLMENT_ID:"missing-multi-factor-info",MISSING_MFA_PENDING_CREDENTIAL:"missing-multi-factor-session",SECOND_FACTOR_EXISTS:"second-factor-already-in-use",SECOND_FACTOR_LIMIT_EXCEEDED:"maximum-second-factor-count-exceeded",BLOCKING_FUNCTION_ERROR_RESPONSE:"internal-error",RECAPTCHA_NOT_ENABLED:"recaptcha-not-enabled",MISSING_RECAPTCHA_TOKEN:"missing-recaptcha-token",INVALID_RECAPTCHA_TOKEN:"invalid-recaptcha-token",INVALID_RECAPTCHA_ACTION:"invalid-recaptcha-action",MISSING_CLIENT_TYPE:"missing-client-type",MISSING_RECAPTCHA_VERSION:"missing-recaptcha-version",INVALID_RECAPTCHA_VERSION:"invalid-recaptcha-version",INVALID_REQ_TYPE:"invalid-req-type"};/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Q0=["/v1/accounts:signInWithCustomToken","/v1/accounts:signInWithEmailLink","/v1/accounts:signInWithIdp","/v1/accounts:signInWithPassword","/v1/accounts:signInWithPhoneNumber","/v1/token"],X0=new si(3e4,6e4);function dt(n,e){return n.tenantId&&!e.tenantId?{...e,tenantId:n.tenantId}:e}async function pt(n,e,t,r,s={}){return v2(n,s,async()=>{let i={},o={};r&&(e==="GET"?o=r:i={body:JSON.stringify(r)});const c=Ur({...o,key:n.config.apiKey}).slice(1),u=await n._getAdditionalHeaders();u["Content-Type"]="application/json",n.languageCode&&(u["X-Firebase-Locale"]=n.languageCode);const l={method:e,headers:u,...i};return Ip()||(l.referrerPolicy="strict-origin-when-cross-origin"),n.emulatorConfig&&hr(n.emulatorConfig.host)&&(l.credentials="include"),A2.fetch()(await R2(n,n.config.apiHost,t,c),l)})}async function v2(n,e,t){n._canInitEmulator=!1;const r={...Y0,...e};try{const s=new Z0(n),i=await Promise.race([t(),s.promise]);s.clearNetworkTimeout();const o=await i.json();if("needConfirmation"in o)throw Es(n,"account-exists-with-different-credential",o);if(i.ok&&!("errorMessage"in o))return o;{const c=i.ok?o.errorMessage:o.error.message,[u,l]=c.split(" : ");if(u==="FEDERATED_USER_ID_ALREADY_LINKED")throw Es(n,"credential-already-in-use",o);if(u==="EMAIL_EXISTS")throw Es(n,"email-already-in-use",o);if(u==="USER_DISABLED")throw Es(n,"user-disabled",o);const p=r[u]||u.toLowerCase().replace(/[_\s]+/g,"-");if(l)throw Vc(n,p,l);vt(n,p)}}catch(s){if(s instanceof Ct)throw s;vt(n,"network-request-failed",{message:String(s)})}}async function dr(n,e,t,r,s={}){const i=await pt(n,e,t,r,s);return"mfaPendingCredential"in i&&vt(n,"multi-factor-auth-required",{_serverResponse:i}),i}async function R2(n,e,t,r){const s=`${e}${t}?${r}`,i=n,o=i.config.emulator?Mc(n.config,s):`${n.config.apiScheme}://${s}`;return Q0.includes(t)&&(await i._persistenceManagerAvailable,i._getPersistenceType()==="COOKIE")?i._getPersistence()._getFinalTarget(o).toString():o}function J0(n){switch(n){case"ENFORCE":return"ENFORCE";case"AUDIT":return"AUDIT";case"OFF":return"OFF";default:return"ENFORCEMENT_STATE_UNSPECIFIED"}}class Z0{clearNetworkTimeout(){clearTimeout(this.timer)}constructor(e){this.auth=e,this.timer=null,this.promise=new Promise((t,r)=>{this.timer=setTimeout(()=>r(nt(this.auth,"network-request-failed")),X0.get())})}}function Es(n,e,t){const r={appName:n.name};t.email&&(r.email=t.email),t.phoneNumber&&(r.phoneNumber=t.phoneNumber);const s=nt(n,e,r);return s.customData._tokenResponse=t,s}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function ol(n){return n!==void 0&&n.getResponse!==void 0}function al(n){return n!==void 0&&n.enterprise!==void 0}class C2{constructor(e){if(this.siteKey="",this.recaptchaEnforcementState=[],e.recaptchaKey===void 0)throw new Error("recaptchaKey undefined");this.siteKey=e.recaptchaKey.split("/")[3],this.recaptchaEnforcementState=e.recaptchaEnforcementState}getProviderEnforcementState(e){if(!this.recaptchaEnforcementState||this.recaptchaEnforcementState.length===0)return null;for(const t of this.recaptchaEnforcementState)if(t.provider&&t.provider===e)return J0(t.enforcementState);return null}isProviderEnabled(e){return this.getProviderEnforcementState(e)==="ENFORCE"||this.getProviderEnforcementState(e)==="AUDIT"}isAnyProviderEnabled(){return this.isProviderEnabled("EMAIL_PASSWORD_PROVIDER")||this.isProviderEnabled("PHONE_PROVIDER")}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function e7(n){return(await pt(n,"GET","/v1/recaptchaParams")).recaptchaSiteKey||""}async function P2(n,e){return pt(n,"GET","/v2/recaptchaConfig",dt(n,e))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function t7(n,e){return pt(n,"POST","/v1/accounts:delete",e)}async function io(n,e){return pt(n,"POST","/v1/accounts:lookup",e)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function vs(n){if(n)try{const e=new Date(Number(n));if(!isNaN(e.getTime()))return e.toUTCString()}catch{}}async function n7(n,e=!1){const t=le(n),r=await t.getIdToken(e),s=Fc(r);H(s&&s.exp&&s.auth_time&&s.iat,t.auth,"internal-error");const i=typeof s.firebase=="object"?s.firebase:void 0,o=i?.sign_in_provider;return{claims:s,token:r,authTime:vs(qa(s.auth_time)),issuedAtTime:vs(qa(s.iat)),expirationTime:vs(qa(s.exp)),signInProvider:o||null,signInSecondFactor:i?.sign_in_second_factor||null}}function qa(n){return Number(n)*1e3}function Fc(n){const[e,t,r]=n.split(".");if(e===void 0||t===void 0||r===void 0)return Gi("JWT malformed, contained fewer than 3 sections"),null;try{const s=a2(t);return s?JSON.parse(s):(Gi("Failed to decode base64 JWT payload"),null)}catch(s){return Gi("Caught error parsing JWT payload as JSON",s?.toString()),null}}function cl(n){const e=Fc(n);return H(e,"internal-error"),H(typeof e.exp<"u","internal-error"),H(typeof e.iat<"u","internal-error"),Number(e.exp)-Number(e.iat)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function Nr(n,e,t=!1){if(t)return e;try{return await e}catch(r){throw r instanceof Ct&&r7(r)&&n.auth.currentUser===n&&await n.auth.signOut(),r}}function r7({code:n}){return n==="auth/user-disabled"||n==="auth/user-token-expired"}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class s7{constructor(e){this.user=e,this.isRunning=!1,this.timerId=null,this.errorBackoff=3e4}_start(){this.isRunning||(this.isRunning=!0,this.schedule())}_stop(){this.isRunning&&(this.isRunning=!1,this.timerId!==null&&clearTimeout(this.timerId))}getInterval(e){if(e){const t=this.errorBackoff;return this.errorBackoff=Math.min(this.errorBackoff*2,96e4),t}else{this.errorBackoff=3e4;const r=(this.user.stsTokenManager.expirationTime??0)-Date.now()-3e5;return Math.max(0,r)}}schedule(e=!1){if(!this.isRunning)return;const t=this.getInterval(e);this.timerId=setTimeout(async()=>{await this.iteration()},t)}async iteration(){try{await this.user.getIdToken(!0)}catch(e){e?.code==="auth/network-request-failed"&&this.schedule(!0);return}this.schedule()}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class lc{constructor(e,t){this.createdAt=e,this.lastLoginAt=t,this._initializeTime()}_initializeTime(){this.lastSignInTime=vs(this.lastLoginAt),this.creationTime=vs(this.createdAt)}_copy(e){this.createdAt=e.createdAt,this.lastLoginAt=e.lastLoginAt,this._initializeTime()}toJSON(){return{createdAt:this.createdAt,lastLoginAt:this.lastLoginAt}}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function oo(n){const e=n.auth,t=await n.getIdToken(),r=await Nr(n,io(e,{idToken:t}));H(r?.users.length,e,"internal-error");const s=r.users[0];n._notifyReloadListener(s);const i=s.providerUserInfo?.length?S2(s.providerUserInfo):[],o=o7(n.providerData,i),c=n.isAnonymous,u=!(n.email&&s.passwordHash)&&!o?.length,l=c?u:!1,p={uid:s.localId,displayName:s.displayName||null,photoURL:s.photoUrl||null,email:s.email||null,emailVerified:s.emailVerified||!1,phoneNumber:s.phoneNumber||null,tenantId:s.tenantId||null,providerData:o,metadata:new lc(s.createdAt,s.lastLoginAt),isAnonymous:l};Object.assign(n,p)}async function i7(n){const e=le(n);await oo(e),await e.auth._persistUserIfCurrent(e),e.auth._notifyListenersIfCurrent(e)}function o7(n,e){return[...n.filter(r=>!e.some(s=>s.providerId===r.providerId)),...e]}function S2(n){return n.map(({providerId:e,...t})=>({providerId:e,uid:t.rawId||"",displayName:t.displayName||null,email:t.email||null,phoneNumber:t.phoneNumber||null,photoURL:t.photoUrl||null}))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function a7(n,e){const t=await v2(n,{},async()=>{const r=Ur({grant_type:"refresh_token",refresh_token:e}).slice(1),{tokenApiHost:s,apiKey:i}=n.config,o=await R2(n,s,"/v1/token",`key=${i}`),c=await n._getAdditionalHeaders();c["Content-Type"]="application/x-www-form-urlencoded";const u={method:"POST",headers:c,body:r};return n.emulatorConfig&&hr(n.emulatorConfig.host)&&(u.credentials="include"),A2.fetch()(o,u)});return{accessToken:t.access_token,expiresIn:t.expires_in,refreshToken:t.refresh_token}}async function c7(n,e){return pt(n,"POST","/v2/accounts:revokeToken",dt(n,e))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ar{constructor(){this.refreshToken=null,this.accessToken=null,this.expirationTime=null}get isExpired(){return!this.expirationTime||Date.now()>this.expirationTime-3e4}updateFromServerResponse(e){H(e.idToken,"internal-error"),H(typeof e.idToken<"u","internal-error"),H(typeof e.refreshToken<"u","internal-error");const t="expiresIn"in e&&typeof e.expiresIn<"u"?Number(e.expiresIn):cl(e.idToken);this.updateTokensAndExpiration(e.idToken,e.refreshToken,t)}updateFromIdToken(e){H(e.length!==0,"internal-error");const t=cl(e);this.updateTokensAndExpiration(e,null,t)}async getToken(e,t=!1){return!t&&this.accessToken&&!this.isExpired?this.accessToken:(H(this.refreshToken,e,"user-token-expired"),this.refreshToken?(await this.refresh(e,this.refreshToken),this.accessToken):null)}clearRefreshToken(){this.refreshToken=null}async refresh(e,t){const{accessToken:r,refreshToken:s,expiresIn:i}=await a7(e,t);this.updateTokensAndExpiration(r,s,Number(i))}updateTokensAndExpiration(e,t,r){this.refreshToken=t||null,this.accessToken=e||null,this.expirationTime=Date.now()+r*1e3}static fromJSON(e,t){const{refreshToken:r,accessToken:s,expirationTime:i}=t,o=new Ar;return r&&(H(typeof r=="string","internal-error",{appName:e}),o.refreshToken=r),s&&(H(typeof s=="string","internal-error",{appName:e}),o.accessToken=s),i&&(H(typeof i=="number","internal-error",{appName:e}),o.expirationTime=i),o}toJSON(){return{refreshToken:this.refreshToken,accessToken:this.accessToken,expirationTime:this.expirationTime}}_assign(e){this.accessToken=e.accessToken,this.refreshToken=e.refreshToken,this.expirationTime=e.expirationTime}_clone(){return Object.assign(new Ar,this.toJSON())}_performRefresh(){return Xt("not implemented")}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function _n(n,e){H(typeof n=="string"||typeof n>"u","internal-error",{appName:e})}class St{constructor({uid:e,auth:t,stsTokenManager:r,...s}){this.providerId="firebase",this.proactiveRefresh=new s7(this),this.reloadUserInfo=null,this.reloadListener=null,this.uid=e,this.auth=t,this.stsTokenManager=r,this.accessToken=r.accessToken,this.displayName=s.displayName||null,this.email=s.email||null,this.emailVerified=s.emailVerified||!1,this.phoneNumber=s.phoneNumber||null,this.photoURL=s.photoURL||null,this.isAnonymous=s.isAnonymous||!1,this.tenantId=s.tenantId||null,this.providerData=s.providerData?[...s.providerData]:[],this.metadata=new lc(s.createdAt||void 0,s.lastLoginAt||void 0)}async getIdToken(e){const t=await Nr(this,this.stsTokenManager.getToken(this.auth,e));return H(t,this.auth,"internal-error"),this.accessToken!==t&&(this.accessToken=t,await this.auth._persistUserIfCurrent(this),this.auth._notifyListenersIfCurrent(this)),t}getIdTokenResult(e){return n7(this,e)}reload(){return i7(this)}_assign(e){this!==e&&(H(this.uid===e.uid,this.auth,"internal-error"),this.displayName=e.displayName,this.photoURL=e.photoURL,this.email=e.email,this.emailVerified=e.emailVerified,this.phoneNumber=e.phoneNumber,this.isAnonymous=e.isAnonymous,this.tenantId=e.tenantId,this.providerData=e.providerData.map(t=>({...t})),this.metadata._copy(e.metadata),this.stsTokenManager._assign(e.stsTokenManager))}_clone(e){const t=new St({...this,auth:e,stsTokenManager:this.stsTokenManager._clone()});return t.metadata._copy(this.metadata),t}_onReload(e){H(!this.reloadListener,this.auth,"internal-error"),this.reloadListener=e,this.reloadUserInfo&&(this._notifyReloadListener(this.reloadUserInfo),this.reloadUserInfo=null)}_notifyReloadListener(e){this.reloadListener?this.reloadListener(e):this.reloadUserInfo=e}_startProactiveRefresh(){this.proactiveRefresh._start()}_stopProactiveRefresh(){this.proactiveRefresh._stop()}async _updateTokensIfNecessary(e,t=!1){let r=!1;e.idToken&&e.idToken!==this.stsTokenManager.accessToken&&(this.stsTokenManager.updateFromServerResponse(e),r=!0),t&&await oo(this),await this.auth._persistUserIfCurrent(this),r&&this.auth._notifyListenersIfCurrent(this)}async delete(){if(ze(this.auth.app))return Promise.reject(Ut(this.auth));const e=await this.getIdToken();return await Nr(this,t7(this.auth,{idToken:e})),this.stsTokenManager.clearRefreshToken(),this.auth.signOut()}toJSON(){return{uid:this.uid,email:this.email||void 0,emailVerified:this.emailVerified,displayName:this.displayName||void 0,isAnonymous:this.isAnonymous,photoURL:this.photoURL||void 0,phoneNumber:this.phoneNumber||void 0,tenantId:this.tenantId||void 0,providerData:this.providerData.map(e=>({...e})),stsTokenManager:this.stsTokenManager.toJSON(),_redirectEventId:this._redirectEventId,...this.metadata.toJSON(),apiKey:this.auth.config.apiKey,appName:this.auth.name}}get refreshToken(){return this.stsTokenManager.refreshToken||""}static _fromJSON(e,t){const r=t.displayName??void 0,s=t.email??void 0,i=t.phoneNumber??void 0,o=t.photoURL??void 0,c=t.tenantId??void 0,u=t._redirectEventId??void 0,l=t.createdAt??void 0,p=t.lastLoginAt??void 0,{uid:g,emailVerified:T,isAnonymous:b,providerData:O,stsTokenManager:L}=t;H(g&&L,e,"internal-error");const M=Ar.fromJSON(this.name,L);H(typeof g=="string",e,"internal-error"),_n(r,e.name),_n(s,e.name),H(typeof T=="boolean",e,"internal-error"),H(typeof b=="boolean",e,"internal-error"),_n(i,e.name),_n(o,e.name),_n(c,e.name),_n(u,e.name),_n(l,e.name),_n(p,e.name);const Y=new St({uid:g,auth:e,email:s,emailVerified:T,displayName:r,isAnonymous:b,photoURL:o,phoneNumber:i,tenantId:c,stsTokenManager:M,createdAt:l,lastLoginAt:p});return O&&Array.isArray(O)&&(Y.providerData=O.map(ce=>({...ce}))),u&&(Y._redirectEventId=u),Y}static async _fromIdTokenResponse(e,t,r=!1){const s=new Ar;s.updateFromServerResponse(t);const i=new St({uid:t.localId,auth:e,stsTokenManager:s,isAnonymous:r});return await oo(i),i}static async _fromGetAccountInfoResponse(e,t,r){const s=t.users[0];H(s.localId!==void 0,"internal-error");const i=s.providerUserInfo!==void 0?S2(s.providerUserInfo):[],o=!(s.email&&s.passwordHash)&&!i?.length,c=new Ar;c.updateFromIdToken(r);const u=new St({uid:s.localId,auth:e,stsTokenManager:c,isAnonymous:o}),l={uid:s.localId,displayName:s.displayName||null,photoURL:s.photoUrl||null,email:s.email||null,emailVerified:s.emailVerified||!1,phoneNumber:s.phoneNumber||null,tenantId:s.tenantId||null,providerData:i,metadata:new lc(s.createdAt,s.lastLoginAt),isAnonymous:!(s.email&&s.passwordHash)&&!i?.length};return Object.assign(u,l),u}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const ul=new Map;function Jt(n){rn(n instanceof Function,"Expected a class definition");let e=ul.get(n);return e?(rn(e instanceof n,"Instance stored in cache mismatched with class"),e):(e=new n,ul.set(n,e),e)}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class b2{constructor(){this.type="NONE",this.storage={}}async _isAvailable(){return!0}async _set(e,t){this.storage[e]=t}async _get(e){const t=this.storage[e];return t===void 0?null:t}async _remove(e){delete this.storage[e]}_addListener(e,t){}_removeListener(e,t){}}b2.type="NONE";const ll=b2;/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Wi(n,e,t){return`firebase:${n}:${e}:${t}`}class vr{constructor(e,t,r){this.persistence=e,this.auth=t,this.userKey=r;const{config:s,name:i}=this.auth;this.fullUserKey=Wi(this.userKey,s.apiKey,i),this.fullPersistenceKey=Wi("persistence",s.apiKey,i),this.boundEventHandler=t._onStorageEvent.bind(t),this.persistence._addListener(this.fullUserKey,this.boundEventHandler)}setCurrentUser(e){return this.persistence._set(this.fullUserKey,e.toJSON())}async getCurrentUser(){const e=await this.persistence._get(this.fullUserKey);if(!e)return null;if(typeof e=="string"){const t=await io(this.auth,{idToken:e}).catch(()=>{});return t?St._fromGetAccountInfoResponse(this.auth,t,e):null}return St._fromJSON(this.auth,e)}removeCurrentUser(){return this.persistence._remove(this.fullUserKey)}savePersistenceForRedirect(){return this.persistence._set(this.fullPersistenceKey,this.persistence.type)}async setPersistence(e){if(this.persistence===e)return;const t=await this.getCurrentUser();if(await this.removeCurrentUser(),this.persistence=e,t)return this.setCurrentUser(t)}delete(){this.persistence._removeListener(this.fullUserKey,this.boundEventHandler)}static async create(e,t,r="authUser"){if(!t.length)return new vr(Jt(ll),e,r);const s=(await Promise.all(t.map(async l=>{if(await l._isAvailable())return l}))).filter(l=>l);let i=s[0]||Jt(ll);const o=Wi(r,e.config.apiKey,e.name);let c=null;for(const l of t)try{const p=await l._get(o);if(p){let g;if(typeof p=="string"){const T=await io(e,{idToken:p}).catch(()=>{});if(!T)break;g=await St._fromGetAccountInfoResponse(e,T,p)}else g=St._fromJSON(e,p);l!==i&&(c=g),i=l;break}}catch{}const u=s.filter(l=>l._shouldAllowMigration);return!i._shouldAllowMigration||!u.length?new vr(i,e,r):(i=u[0],c&&await i._set(o,c.toJSON()),await Promise.all(t.map(async l=>{if(l!==i)try{await l._remove(o)}catch{}})),new vr(i,e,r))}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function hl(n){const e=n.toLowerCase();if(e.includes("opera/")||e.includes("opr/")||e.includes("opios/"))return"Opera";if(D2(e))return"IEMobile";if(e.includes("msie")||e.includes("trident/"))return"IE";if(e.includes("edge/"))return"Edge";if(N2(e))return"Firefox";if(e.includes("silk/"))return"Silk";if(x2(e))return"Blackberry";if(L2(e))return"Webos";if(O2(e))return"Safari";if((e.includes("chrome/")||k2(e))&&!e.includes("edge/"))return"Chrome";if(V2(e))return"Android";{const t=/([a-zA-Z\d\.]+)\/[a-zA-Z\d\.]*$/,r=n.match(t);if(r?.length===2)return r[1]}return"Other"}function N2(n=Qe()){return/firefox\//i.test(n)}function O2(n=Qe()){const e=n.toLowerCase();return e.includes("safari/")&&!e.includes("chrome/")&&!e.includes("crios/")&&!e.includes("android")}function k2(n=Qe()){return/crios\//i.test(n)}function D2(n=Qe()){return/iemobile/i.test(n)}function V2(n=Qe()){return/android/i.test(n)}function x2(n=Qe()){return/blackberry/i.test(n)}function L2(n=Qe()){return/webos/i.test(n)}function Uc(n=Qe()){return/iphone|ipad|ipod/i.test(n)||/macintosh/i.test(n)&&/mobile/i.test(n)}function u7(n=Qe()){return Uc(n)&&!!window.navigator?.standalone}function l7(){return wp()&&document.documentMode===10}function M2(n=Qe()){return Uc(n)||V2(n)||L2(n)||x2(n)||/windows phone/i.test(n)||D2(n)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function F2(n,e=[]){let t;switch(n){case"Browser":t=hl(Qe());break;case"Worker":t=`${hl(Qe())}-${n}`;break;default:t=n}const r=e.length?e.join(","):"FirebaseCore-web";return`${t}/JsCore/${fr}/${r}`}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class h7{constructor(e){this.auth=e,this.queue=[]}pushCallback(e,t){const r=i=>new Promise((o,c)=>{try{const u=e(i);o(u)}catch(u){c(u)}});r.onAbort=t,this.queue.push(r);const s=this.queue.length-1;return()=>{this.queue[s]=()=>Promise.resolve()}}async runMiddleware(e){if(this.auth.currentUser===e)return;const t=[];try{for(const r of this.queue)await r(e),r.onAbort&&t.push(r.onAbort)}catch(r){t.reverse();for(const s of t)try{s()}catch{}throw this.auth._errorFactory.create("login-blocked",{originalMessage:r?.message})}}}/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function f7(n,e={}){return pt(n,"GET","/v2/passwordPolicy",dt(n,e))}/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const d7=6;class p7{constructor(e){const t=e.customStrengthOptions;this.customStrengthOptions={},this.customStrengthOptions.minPasswordLength=t.minPasswordLength??d7,t.maxPasswordLength&&(this.customStrengthOptions.maxPasswordLength=t.maxPasswordLength),t.containsLowercaseCharacter!==void 0&&(this.customStrengthOptions.containsLowercaseLetter=t.containsLowercaseCharacter),t.containsUppercaseCharacter!==void 0&&(this.customStrengthOptions.containsUppercaseLetter=t.containsUppercaseCharacter),t.containsNumericCharacter!==void 0&&(this.customStrengthOptions.containsNumericCharacter=t.containsNumericCharacter),t.containsNonAlphanumericCharacter!==void 0&&(this.customStrengthOptions.containsNonAlphanumericCharacter=t.containsNonAlphanumericCharacter),this.enforcementState=e.enforcementState,this.enforcementState==="ENFORCEMENT_STATE_UNSPECIFIED"&&(this.enforcementState="OFF"),this.allowedNonAlphanumericCharacters=e.allowedNonAlphanumericCharacters?.join("")??"",this.forceUpgradeOnSignin=e.forceUpgradeOnSignin??!1,this.schemaVersion=e.schemaVersion}validatePassword(e){const t={isValid:!0,passwordPolicy:this};return this.validatePasswordLengthOptions(e,t),this.validatePasswordCharacterOptions(e,t),t.isValid&&(t.isValid=t.meetsMinPasswordLength??!0),t.isValid&&(t.isValid=t.meetsMaxPasswordLength??!0),t.isValid&&(t.isValid=t.containsLowercaseLetter??!0),t.isValid&&(t.isValid=t.containsUppercaseLetter??!0),t.isValid&&(t.isValid=t.containsNumericCharacter??!0),t.isValid&&(t.isValid=t.containsNonAlphanumericCharacter??!0),t}validatePasswordLengthOptions(e,t){const r=this.customStrengthOptions.minPasswordLength,s=this.customStrengthOptions.maxPasswordLength;r&&(t.meetsMinPasswordLength=e.length>=r),s&&(t.meetsMaxPasswordLength=e.length<=s)}validatePasswordCharacterOptions(e,t){this.updatePasswordCharacterOptionsStatuses(t,!1,!1,!1,!1);let r;for(let s=0;s<e.length;s++)r=e.charAt(s),this.updatePasswordCharacterOptionsStatuses(t,r>="a"&&r<="z",r>="A"&&r<="Z",r>="0"&&r<="9",this.allowedNonAlphanumericCharacters.includes(r))}updatePasswordCharacterOptionsStatuses(e,t,r,s,i){this.customStrengthOptions.containsLowercaseLetter&&(e.containsLowercaseLetter||(e.containsLowercaseLetter=t)),this.customStrengthOptions.containsUppercaseLetter&&(e.containsUppercaseLetter||(e.containsUppercaseLetter=r)),this.customStrengthOptions.containsNumericCharacter&&(e.containsNumericCharacter||(e.containsNumericCharacter=s)),this.customStrengthOptions.containsNonAlphanumericCharacter&&(e.containsNonAlphanumericCharacter||(e.containsNonAlphanumericCharacter=i))}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class m7{constructor(e,t,r,s){this.app=e,this.heartbeatServiceProvider=t,this.appCheckServiceProvider=r,this.config=s,this.currentUser=null,this.emulatorConfig=null,this.operations=Promise.resolve(),this.authStateSubscription=new fl(this),this.idTokenSubscription=new fl(this),this.beforeStateQueue=new h7(this),this.redirectUser=null,this.isProactiveRefreshEnabled=!1,this.EXPECTED_PASSWORD_POLICY_SCHEMA_VERSION=1,this._canInitEmulator=!0,this._isInitialized=!1,this._deleted=!1,this._initializationPromise=null,this._popupRedirectResolver=null,this._errorFactory=T2,this._agentRecaptchaConfig=null,this._tenantRecaptchaConfigs={},this._projectPasswordPolicy=null,this._tenantPasswordPolicies={},this._resolvePersistenceManagerAvailable=void 0,this.lastNotifiedUid=void 0,this.languageCode=null,this.tenantId=null,this.settings={appVerificationDisabledForTesting:!1},this.frameworks=[],this.name=e.name,this.clientVersion=s.sdkClientVersion,this._persistenceManagerAvailable=new Promise(i=>this._resolvePersistenceManagerAvailable=i)}_initializeWithPersistence(e,t){return t&&(this._popupRedirectResolver=Jt(t)),this._initializationPromise=this.queue(async()=>{if(!this._deleted&&(this.persistenceManager=await vr.create(this,e),this._resolvePersistenceManagerAvailable?.(),!this._deleted)){if(this._popupRedirectResolver?._shouldInitProactively)try{await this._popupRedirectResolver._initialize(this)}catch{}await this.initializeCurrentUser(t),this.lastNotifiedUid=this.currentUser?.uid||null,!this._deleted&&(this._isInitialized=!0)}}),this._initializationPromise}async _onStorageEvent(){if(this._deleted)return;const e=await this.assertedPersistence.getCurrentUser();if(!(!this.currentUser&&!e)){if(this.currentUser&&e&&this.currentUser.uid===e.uid){this._currentUser._assign(e),await this.currentUser.getIdToken();return}await this._updateCurrentUser(e,!0)}}async initializeCurrentUserFromIdToken(e){try{const t=await io(this,{idToken:e}),r=await St._fromGetAccountInfoResponse(this,t,e);await this.directlySetCurrentUser(r)}catch(t){console.warn("FirebaseServerApp could not login user with provided authIdToken: ",t),await this.directlySetCurrentUser(null)}}async initializeCurrentUser(e){if(ze(this.app)){const i=this.app.settings.authIdToken;return i?new Promise(o=>{setTimeout(()=>this.initializeCurrentUserFromIdToken(i).then(o,o))}):this.directlySetCurrentUser(null)}const t=await this.assertedPersistence.getCurrentUser();let r=t,s=!1;if(e&&this.config.authDomain){await this.getOrInitRedirectPersistenceManager();const i=this.redirectUser?._redirectEventId,o=r?._redirectEventId,c=await this.tryRedirectSignIn(e);(!i||i===o)&&c?.user&&(r=c.user,s=!0)}if(!r)return this.directlySetCurrentUser(null);if(!r._redirectEventId){if(s)try{await this.beforeStateQueue.runMiddleware(r)}catch(i){r=t,this._popupRedirectResolver._overrideRedirectResult(this,()=>Promise.reject(i))}return r?this.reloadAndSetCurrentUserOrClear(r):this.directlySetCurrentUser(null)}return H(this._popupRedirectResolver,this,"argument-error"),await this.getOrInitRedirectPersistenceManager(),this.redirectUser&&this.redirectUser._redirectEventId===r._redirectEventId?this.directlySetCurrentUser(r):this.reloadAndSetCurrentUserOrClear(r)}async tryRedirectSignIn(e){let t=null;try{t=await this._popupRedirectResolver._completeRedirectFn(this,e,!0)}catch{await this._setRedirectUser(null)}return t}async reloadAndSetCurrentUserOrClear(e){try{await oo(e)}catch(t){if(t?.code!=="auth/network-request-failed")return this.directlySetCurrentUser(null)}return this.directlySetCurrentUser(e)}useDeviceLanguage(){this.languageCode=K0()}async _delete(){this._deleted=!0}async updateCurrentUser(e){if(ze(this.app))return Promise.reject(Ut(this));const t=e?le(e):null;return t&&H(t.auth.config.apiKey===this.config.apiKey,this,"invalid-user-token"),this._updateCurrentUser(t&&t._clone(this))}async _updateCurrentUser(e,t=!1){if(!this._deleted)return e&&H(this.tenantId===e.tenantId,this,"tenant-id-mismatch"),t||await this.beforeStateQueue.runMiddleware(e),this.queue(async()=>{await this.directlySetCurrentUser(e),this.notifyAuthListeners()})}async signOut(){return ze(this.app)?Promise.reject(Ut(this)):(await this.beforeStateQueue.runMiddleware(null),(this.redirectPersistenceManager||this._popupRedirectResolver)&&await this._setRedirectUser(null),this._updateCurrentUser(null,!0))}setPersistence(e){return ze(this.app)?Promise.reject(Ut(this)):this.queue(async()=>{await this.assertedPersistence.setPersistence(Jt(e))})}_getRecaptchaConfig(){return this.tenantId==null?this._agentRecaptchaConfig:this._tenantRecaptchaConfigs[this.tenantId]}async validatePassword(e){this._getPasswordPolicyInternal()||await this._updatePasswordPolicy();const t=this._getPasswordPolicyInternal();return t.schemaVersion!==this.EXPECTED_PASSWORD_POLICY_SCHEMA_VERSION?Promise.reject(this._errorFactory.create("unsupported-password-policy-schema-version",{})):t.validatePassword(e)}_getPasswordPolicyInternal(){return this.tenantId===null?this._projectPasswordPolicy:this._tenantPasswordPolicies[this.tenantId]}async _updatePasswordPolicy(){const e=await f7(this),t=new p7(e);this.tenantId===null?this._projectPasswordPolicy=t:this._tenantPasswordPolicies[this.tenantId]=t}_getPersistenceType(){return this.assertedPersistence.persistence.type}_getPersistence(){return this.assertedPersistence.persistence}_updateErrorMap(e){this._errorFactory=new lr("auth","Firebase",e())}onAuthStateChanged(e,t,r){return this.registerStateListener(this.authStateSubscription,e,t,r)}beforeAuthStateChanged(e,t){return this.beforeStateQueue.pushCallback(e,t)}onIdTokenChanged(e,t,r){return this.registerStateListener(this.idTokenSubscription,e,t,r)}authStateReady(){return new Promise((e,t)=>{if(this.currentUser)e();else{const r=this.onAuthStateChanged(()=>{r(),e()},t)}})}async revokeAccessToken(e){if(this.currentUser){const t=await this.currentUser.getIdToken(),r={providerId:"apple.com",tokenType:"ACCESS_TOKEN",token:e,idToken:t};this.tenantId!=null&&(r.tenantId=this.tenantId),await c7(this,r)}}toJSON(){return{apiKey:this.config.apiKey,authDomain:this.config.authDomain,appName:this.name,currentUser:this._currentUser?.toJSON()}}async _setRedirectUser(e,t){const r=await this.getOrInitRedirectPersistenceManager(t);return e===null?r.removeCurrentUser():r.setCurrentUser(e)}async getOrInitRedirectPersistenceManager(e){if(!this.redirectPersistenceManager){const t=e&&Jt(e)||this._popupRedirectResolver;H(t,this,"argument-error"),this.redirectPersistenceManager=await vr.create(this,[Jt(t._redirectPersistence)],"redirectUser"),this.redirectUser=await this.redirectPersistenceManager.getCurrentUser()}return this.redirectPersistenceManager}async _redirectUserForId(e){return this._isInitialized&&await this.queue(async()=>{}),this._currentUser?._redirectEventId===e?this._currentUser:this.redirectUser?._redirectEventId===e?this.redirectUser:null}async _persistUserIfCurrent(e){if(e===this.currentUser)return this.queue(async()=>this.directlySetCurrentUser(e))}_notifyListenersIfCurrent(e){e===this.currentUser&&this.notifyAuthListeners()}_key(){return`${this.config.authDomain}:${this.config.apiKey}:${this.name}`}_startProactiveRefresh(){this.isProactiveRefreshEnabled=!0,this.currentUser&&this._currentUser._startProactiveRefresh()}_stopProactiveRefresh(){this.isProactiveRefreshEnabled=!1,this.currentUser&&this._currentUser._stopProactiveRefresh()}get _currentUser(){return this.currentUser}notifyAuthListeners(){if(!this._isInitialized)return;this.idTokenSubscription.next(this.currentUser);const e=this.currentUser?.uid??null;this.lastNotifiedUid!==e&&(this.lastNotifiedUid=e,this.authStateSubscription.next(this.currentUser))}registerStateListener(e,t,r,s){if(this._deleted)return()=>{};const i=typeof t=="function"?t:t.next.bind(t);let o=!1;const c=this._isInitialized?Promise.resolve():this._initializationPromise;if(H(c,this,"internal-error"),c.then(()=>{o||i(this.currentUser)}),typeof t=="function"){const u=e.addObserver(t,r,s);return()=>{o=!0,u()}}else{const u=e.addObserver(t);return()=>{o=!0,u()}}}async directlySetCurrentUser(e){this.currentUser&&this.currentUser!==e&&this._currentUser._stopProactiveRefresh(),e&&this.isProactiveRefreshEnabled&&e._startProactiveRefresh(),this.currentUser=e,e?await this.assertedPersistence.setCurrentUser(e):await this.assertedPersistence.removeCurrentUser()}queue(e){return this.operations=this.operations.then(e,e),this.operations}get assertedPersistence(){return H(this.persistenceManager,this,"internal-error"),this.persistenceManager}_logFramework(e){!e||this.frameworks.includes(e)||(this.frameworks.push(e),this.frameworks.sort(),this.clientVersion=F2(this.config.clientPlatform,this._getFrameworks()))}_getFrameworks(){return this.frameworks}async _getAdditionalHeaders(){const e={"X-Client-Version":this.clientVersion};this.app.options.appId&&(e["X-Firebase-gmpid"]=this.app.options.appId);const t=await this.heartbeatServiceProvider.getImmediate({optional:!0})?.getHeartbeatsHeader();t&&(e["X-Firebase-Client"]=t);const r=await this._getAppCheckToken();return r&&(e["X-Firebase-AppCheck"]=r),e}async _getAppCheckToken(){if(ze(this.app)&&this.app.settings.appCheckToken)return this.app.settings.appCheckToken;const e=await this.appCheckServiceProvider.getImmediate({optional:!0})?.getToken();return e?.error&&W0(`Error while retrieving App Check token: ${e.error}`),e?.token}}function It(n){return le(n)}class fl{constructor(e){this.auth=e,this.observer=null,this.addObserver=Sp(t=>this.observer=t)}get next(){return H(this.observer,this.auth,"internal-error"),this.observer.next.bind(this.observer)}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let ii={async loadJS(){throw new Error("Unable to load external scripts")},recaptchaV2Script:"",recaptchaEnterpriseScript:"",gapiScript:""};function g7(n){ii=n}function Bc(n){return ii.loadJS(n)}function _7(){return ii.recaptchaV2Script}function y7(){return ii.recaptchaEnterpriseScript}function E7(){return ii.gapiScript}function U2(n){return`__${n}${Math.floor(Math.random()*1e6)}`}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const I7=500,T7=6e4,Li=1e12;class w7{constructor(e){this.auth=e,this.counter=Li,this._widgets=new Map}render(e,t){const r=this.counter;return this._widgets.set(r,new R7(e,this.auth.name,t||{})),this.counter++,r}reset(e){const t=e||Li;this._widgets.get(t)?.delete(),this._widgets.delete(t)}getResponse(e){const t=e||Li;return this._widgets.get(t)?.getResponse()||""}async execute(e){const t=e||Li;return this._widgets.get(t)?.execute(),""}}class A7{constructor(){this.enterprise=new v7}ready(e){e()}execute(e,t){return Promise.resolve("token")}render(e,t){return""}}class v7{ready(e){e()}execute(e,t){return Promise.resolve("token")}render(e,t){return""}}class R7{constructor(e,t,r){this.params=r,this.timerId=null,this.deleted=!1,this.responseToken=null,this.clickHandler=()=>{this.execute()};const s=typeof e=="string"?document.getElementById(e):e;H(s,"argument-error",{appName:t}),this.container=s,this.isVisible=this.params.size!=="invisible",this.isVisible?this.execute():this.container.addEventListener("click",this.clickHandler)}getResponse(){return this.checkIfDeleted(),this.responseToken}delete(){this.checkIfDeleted(),this.deleted=!0,this.timerId&&(clearTimeout(this.timerId),this.timerId=null),this.container.removeEventListener("click",this.clickHandler)}execute(){this.checkIfDeleted(),!this.timerId&&(this.timerId=window.setTimeout(()=>{this.responseToken=C7(50);const{callback:e,"expired-callback":t}=this.params;if(e)try{e(this.responseToken)}catch{}this.timerId=window.setTimeout(()=>{if(this.timerId=null,this.responseToken=null,t)try{t()}catch{}this.isVisible&&this.execute()},T7)},I7))}checkIfDeleted(){if(this.deleted)throw new Error("reCAPTCHA mock was already deleted!")}}function C7(n){const e=[],t="1234567890abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";for(let r=0;r<n;r++)e.push(t.charAt(Math.floor(Math.random()*t.length)));return e.join("")}const P7="recaptcha-enterprise",Rs="NO_RECAPTCHA",dl="onFirebaseAuthREInstanceReady";class Qt{constructor(e){this.type=P7,this.auth=It(e)}async verify(e="verify",t=!1){async function r(i){if(!t){if(i.tenantId==null&&i._agentRecaptchaConfig!=null)return i._agentRecaptchaConfig.siteKey;if(i.tenantId!=null&&i._tenantRecaptchaConfigs[i.tenantId]!==void 0)return i._tenantRecaptchaConfigs[i.tenantId].siteKey}return new Promise(async(o,c)=>{P2(i,{clientType:"CLIENT_TYPE_WEB",version:"RECAPTCHA_ENTERPRISE"}).then(u=>{if(u.recaptchaKey===void 0)c(new Error("recaptcha Enterprise site key undefined"));else{const l=new C2(u);return i.tenantId==null?i._agentRecaptchaConfig=l:i._tenantRecaptchaConfigs[i.tenantId]=l,o(l.siteKey)}}).catch(u=>{c(u)})})}function s(i,o,c){const u=window.grecaptcha;al(u)?u.enterprise.ready(()=>{u.enterprise.execute(i,{action:e}).then(l=>{o(l)}).catch(()=>{o(Rs)})}):c(Error("No reCAPTCHA enterprise script loaded."))}return this.auth.settings.appVerificationDisabledForTesting?new A7().execute("siteKey",{action:"verify"}):new Promise((i,o)=>{r(this.auth).then(async c=>{if(!t&&al(window.grecaptcha)&&Qt.scriptInjectionDeferred)await Qt.scriptInjectionDeferred.promise,s(c,i,o);else{if(typeof window>"u"){o(new Error("RecaptchaVerifier is only supported in browser"));return}let u=y7();u.length!==0&&(u+=c+`&onload=${dl}`),Qt.scriptInjectionDeferred=new f2,window[dl]=()=>{Qt.scriptInjectionDeferred?.resolve()},Bc(u).then(()=>Qt.scriptInjectionDeferred?.promise).then(()=>{s(c,i,o)}).catch(l=>{o(l)})}}).catch(c=>{o(c)})})}}Qt.scriptInjectionDeferred=null;async function ps(n,e,t,r=!1,s=!1){const i=new Qt(n);let o;if(s)o=Rs;else try{o=await i.verify(t)}catch{o=await i.verify(t,!0)}const c={...e};if(t==="mfaSmsEnrollment"||t==="mfaSmsSignIn"){if("phoneEnrollmentInfo"in c){const u=c.phoneEnrollmentInfo.phoneNumber,l=c.phoneEnrollmentInfo.recaptchaToken;Object.assign(c,{phoneEnrollmentInfo:{phoneNumber:u,recaptchaToken:l,captchaResponse:o,clientType:"CLIENT_TYPE_WEB",recaptchaVersion:"RECAPTCHA_ENTERPRISE"}})}else if("phoneSignInInfo"in c){const u=c.phoneSignInInfo.recaptchaToken;Object.assign(c,{phoneSignInInfo:{recaptchaToken:u,captchaResponse:o,clientType:"CLIENT_TYPE_WEB",recaptchaVersion:"RECAPTCHA_ENTERPRISE"}})}return c}return r?Object.assign(c,{captchaResp:o}):Object.assign(c,{captchaResponse:o}),Object.assign(c,{clientType:"CLIENT_TYPE_WEB"}),Object.assign(c,{recaptchaVersion:"RECAPTCHA_ENTERPRISE"}),c}async function Rr(n,e,t,r,s){if(s==="EMAIL_PASSWORD_PROVIDER")if(n._getRecaptchaConfig()?.isProviderEnabled("EMAIL_PASSWORD_PROVIDER")){const i=await ps(n,e,t,t==="getOobCode");return r(n,i)}else return r(n,e).catch(async i=>{if(i.code==="auth/missing-recaptcha-token"){console.log(`${t} is protected by reCAPTCHA Enterprise for this project. Automatically triggering the reCAPTCHA flow and restarting the flow.`);const o=await ps(n,e,t,t==="getOobCode");return r(n,o)}else return Promise.reject(i)});else if(s==="PHONE_PROVIDER")if(n._getRecaptchaConfig()?.isProviderEnabled("PHONE_PROVIDER")){const i=await ps(n,e,t);return r(n,i).catch(async o=>{if(n._getRecaptchaConfig()?.getProviderEnforcementState("PHONE_PROVIDER")==="AUDIT"&&(o.code==="auth/missing-recaptcha-token"||o.code==="auth/invalid-app-credential")){console.log(`Failed to verify with reCAPTCHA Enterprise. Automatically triggering the reCAPTCHA v2 flow to complete the ${t} flow.`);const c=await ps(n,e,t,!1,!0);return r(n,c)}return Promise.reject(o)})}else{const i=await ps(n,e,t,!1,!0);return r(n,i)}else return Promise.reject(s+" provider is not supported.")}async function S7(n){const e=It(n),t=await P2(e,{clientType:"CLIENT_TYPE_WEB",version:"RECAPTCHA_ENTERPRISE"}),r=new C2(t);e.tenantId==null?e._agentRecaptchaConfig=r:e._tenantRecaptchaConfigs[e.tenantId]=r,r.isAnyProviderEnabled()&&new Qt(e).verify()}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function b7(n,e){const t=un(n,"auth");if(t.isInitialized()){const s=t.getImmediate(),i=t.getOptions();if(jt(i,e??{}))return s;vt(s,"already-initialized")}return t.initialize({options:e})}function N7(n,e){const t=e?.persistence||[],r=(Array.isArray(t)?t:[t]).map(Jt);e?.errorMap&&n._updateErrorMap(e.errorMap),n._initializeWithPersistence(r,e?.popupRedirectResolver)}function O7(n,e,t){const r=It(n);H(/^https?:\/\//.test(e),r,"invalid-emulator-scheme");const s=!1,i=B2(e),{host:o,port:c}=k7(e),u=c===null?"":`:${c}`,l={url:`${i}//${o}${u}/`},p=Object.freeze({host:o,port:c,protocol:i.replace(":",""),options:Object.freeze({disableWarnings:s})});if(!r._canInitEmulator){H(r.config.emulator&&r.emulatorConfig,r,"emulator-config-failed"),H(jt(l,r.config.emulator)&&jt(p,r.emulatorConfig),r,"emulator-config-failed");return}r.config.emulator=l,r.emulatorConfig=p,r.settings.appVerificationDisabledForTesting=!0,hr(o)?ko(`${i}//${o}${u}`):D7()}function B2(n){const e=n.indexOf(":");return e<0?"":n.substr(0,e+1)}function k7(n){const e=B2(n),t=/(\/\/)?([^?#/]+)/.exec(n.substr(e.length));if(!t)return{host:"",port:null};const r=t[2].split("@").pop()||"",s=/^(\[[^\]]+\])(:|$)/.exec(r);if(s){const i=s[1];return{host:i,port:pl(r.substr(i.length+1))}}else{const[i,o]=r.split(":");return{host:i,port:pl(o)}}}function pl(n){if(!n)return null;const e=Number(n);return isNaN(e)?null:e}function D7(){function n(){const e=document.createElement("p"),t=e.style;e.innerText="Running in emulator mode. Do not use with production credentials.",t.position="fixed",t.width="100%",t.backgroundColor="#ffffff",t.border=".1em solid #000000",t.color="#b50000",t.bottom="0px",t.left="0px",t.margin="0px",t.zIndex="10000",t.textAlign="center",e.classList.add("firebase-emulator-warning"),document.body.appendChild(e)}typeof console<"u"&&typeof console.info=="function"&&console.info("WARNING: You are using the Auth Emulator, which is intended for local testing only.  Do not use with production credentials."),typeof window<"u"&&typeof document<"u"&&(document.readyState==="loading"?window.addEventListener("DOMContentLoaded",n):n())}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class xo{constructor(e,t){this.providerId=e,this.signInMethod=t}toJSON(){return Xt("not implemented")}_getIdTokenResponse(e){return Xt("not implemented")}_linkToIdToken(e,t){return Xt("not implemented")}_getReauthenticationResolver(e){return Xt("not implemented")}}async function V7(n,e){return pt(n,"POST","/v1/accounts:update",e)}async function x7(n,e){return pt(n,"POST","/v1/accounts:signUp",e)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function L7(n,e){return dr(n,"POST","/v1/accounts:signInWithPassword",dt(n,e))}async function $2(n,e){return pt(n,"POST","/v1/accounts:sendOobCode",dt(n,e))}async function M7(n,e){return $2(n,e)}async function F7(n,e){return $2(n,e)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function U7(n,e){return dr(n,"POST","/v1/accounts:signInWithEmailLink",dt(n,e))}async function B7(n,e){return dr(n,"POST","/v1/accounts:signInWithEmailLink",dt(n,e))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Bs extends xo{constructor(e,t,r,s=null){super("password",r),this._email=e,this._password=t,this._tenantId=s}static _fromEmailAndPassword(e,t){return new Bs(e,t,"password")}static _fromEmailAndCode(e,t,r=null){return new Bs(e,t,"emailLink",r)}toJSON(){return{email:this._email,password:this._password,signInMethod:this.signInMethod,tenantId:this._tenantId}}static fromJSON(e){const t=typeof e=="string"?JSON.parse(e):e;if(t?.email&&t?.password){if(t.signInMethod==="password")return this._fromEmailAndPassword(t.email,t.password);if(t.signInMethod==="emailLink")return this._fromEmailAndCode(t.email,t.password,t.tenantId)}return null}async _getIdTokenResponse(e){switch(this.signInMethod){case"password":const t={returnSecureToken:!0,email:this._email,password:this._password,clientType:"CLIENT_TYPE_WEB"};return Rr(e,t,"signInWithPassword",L7,"EMAIL_PASSWORD_PROVIDER");case"emailLink":return U7(e,{email:this._email,oobCode:this._password});default:vt(e,"internal-error")}}async _linkToIdToken(e,t){switch(this.signInMethod){case"password":const r={idToken:t,returnSecureToken:!0,email:this._email,password:this._password,clientType:"CLIENT_TYPE_WEB"};return Rr(e,r,"signUpPassword",x7,"EMAIL_PASSWORD_PROVIDER");case"emailLink":return B7(e,{idToken:t,email:this._email,oobCode:this._password});default:vt(e,"internal-error")}}_getReauthenticationResolver(e){return this._getIdTokenResponse(e)}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function Cr(n,e){return dr(n,"POST","/v1/accounts:signInWithIdp",dt(n,e))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const $7="http://localhost";class sn extends xo{constructor(){super(...arguments),this.pendingToken=null}static _fromParams(e){const t=new sn(e.providerId,e.signInMethod);return e.idToken||e.accessToken?(e.idToken&&(t.idToken=e.idToken),e.accessToken&&(t.accessToken=e.accessToken),e.nonce&&!e.pendingToken&&(t.nonce=e.nonce),e.pendingToken&&(t.pendingToken=e.pendingToken)):e.oauthToken&&e.oauthTokenSecret?(t.accessToken=e.oauthToken,t.secret=e.oauthTokenSecret):vt("argument-error"),t}toJSON(){return{idToken:this.idToken,accessToken:this.accessToken,secret:this.secret,nonce:this.nonce,pendingToken:this.pendingToken,providerId:this.providerId,signInMethod:this.signInMethod}}static fromJSON(e){const t=typeof e=="string"?JSON.parse(e):e,{providerId:r,signInMethod:s,...i}=t;if(!r||!s)return null;const o=new sn(r,s);return o.idToken=i.idToken||void 0,o.accessToken=i.accessToken||void 0,o.secret=i.secret,o.nonce=i.nonce,o.pendingToken=i.pendingToken||null,o}_getIdTokenResponse(e){const t=this.buildRequest();return Cr(e,t)}_linkToIdToken(e,t){const r=this.buildRequest();return r.idToken=t,Cr(e,r)}_getReauthenticationResolver(e){const t=this.buildRequest();return t.autoCreate=!1,Cr(e,t)}buildRequest(){const e={requestUri:$7,returnSecureToken:!0};if(this.pendingToken)e.pendingToken=this.pendingToken;else{const t={};this.idToken&&(t.id_token=this.idToken),this.accessToken&&(t.access_token=this.accessToken),this.secret&&(t.oauth_token_secret=this.secret),t.providerId=this.providerId,this.nonce&&!this.pendingToken&&(t.nonce=this.nonce),e.postBody=Ur(t)}return e}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function ml(n,e){return pt(n,"POST","/v1/accounts:sendVerificationCode",dt(n,e))}async function q7(n,e){return dr(n,"POST","/v1/accounts:signInWithPhoneNumber",dt(n,e))}async function H7(n,e){const t=await dr(n,"POST","/v1/accounts:signInWithPhoneNumber",dt(n,e));if(t.temporaryProof)throw Es(n,"account-exists-with-different-credential",t);return t}const j7={USER_NOT_FOUND:"user-not-found"};async function G7(n,e){const t={...e,operation:"REAUTH"};return dr(n,"POST","/v1/accounts:signInWithPhoneNumber",dt(n,t),j7)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Cs extends xo{constructor(e){super("phone","phone"),this.params=e}static _fromVerification(e,t){return new Cs({verificationId:e,verificationCode:t})}static _fromTokenResponse(e,t){return new Cs({phoneNumber:e,temporaryProof:t})}_getIdTokenResponse(e){return q7(e,this._makeVerificationRequest())}_linkToIdToken(e,t){return H7(e,{idToken:t,...this._makeVerificationRequest()})}_getReauthenticationResolver(e){return G7(e,this._makeVerificationRequest())}_makeVerificationRequest(){const{temporaryProof:e,phoneNumber:t,verificationId:r,verificationCode:s}=this.params;return e&&t?{temporaryProof:e,phoneNumber:t}:{sessionInfo:r,code:s}}toJSON(){const e={providerId:this.providerId};return this.params.phoneNumber&&(e.phoneNumber=this.params.phoneNumber),this.params.temporaryProof&&(e.temporaryProof=this.params.temporaryProof),this.params.verificationCode&&(e.verificationCode=this.params.verificationCode),this.params.verificationId&&(e.verificationId=this.params.verificationId),e}static fromJSON(e){typeof e=="string"&&(e=JSON.parse(e));const{verificationId:t,verificationCode:r,phoneNumber:s,temporaryProof:i}=e;return!r&&!t&&!s&&!i?null:new Cs({verificationId:t,verificationCode:r,phoneNumber:s,temporaryProof:i})}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function W7(n){switch(n){case"recoverEmail":return"RECOVER_EMAIL";case"resetPassword":return"PASSWORD_RESET";case"signIn":return"EMAIL_SIGNIN";case"verifyEmail":return"VERIFY_EMAIL";case"verifyAndChangeEmail":return"VERIFY_AND_CHANGE_EMAIL";case"revertSecondFactorAddition":return"REVERT_SECOND_FACTOR_ADDITION";default:return null}}function z7(n){const e=_s(ys(n)).link,t=e?_s(ys(e)).deep_link_id:null,r=_s(ys(n)).deep_link_id;return(r?_s(ys(r)).link:null)||r||t||e||n}class $c{constructor(e){const t=_s(ys(e)),r=t.apiKey??null,s=t.oobCode??null,i=W7(t.mode??null);H(r&&s&&i,"argument-error"),this.apiKey=r,this.operation=i,this.code=s,this.continueUrl=t.continueUrl??null,this.languageCode=t.lang??null,this.tenantId=t.tenantId??null}static parseLink(e){const t=z7(e);try{return new $c(t)}catch{return null}}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Br{constructor(){this.providerId=Br.PROVIDER_ID}static credential(e,t){return Bs._fromEmailAndPassword(e,t)}static credentialWithLink(e,t){const r=$c.parseLink(t);return H(r,"argument-error"),Bs._fromEmailAndCode(e,r.code,r.tenantId)}}Br.PROVIDER_ID="password";Br.EMAIL_PASSWORD_SIGN_IN_METHOD="password";Br.EMAIL_LINK_SIGN_IN_METHOD="emailLink";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class oi{constructor(e){this.providerId=e,this.defaultLanguageCode=null,this.customParameters={}}setDefaultLanguage(e){this.defaultLanguageCode=e}setCustomParameters(e){return this.customParameters=e,this}getCustomParameters(){return this.customParameters}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class $r extends oi{constructor(){super(...arguments),this.scopes=[]}addScope(e){return this.scopes.includes(e)||this.scopes.push(e),this}getScopes(){return[...this.scopes]}}class zi extends $r{static credentialFromJSON(e){const t=typeof e=="string"?JSON.parse(e):e;return H("providerId"in t&&"signInMethod"in t,"argument-error"),sn._fromParams(t)}credential(e){return this._credential({...e,nonce:e.rawNonce})}_credential(e){return H(e.idToken||e.accessToken,"argument-error"),sn._fromParams({...e,providerId:this.providerId,signInMethod:this.providerId})}static credentialFromResult(e){return zi.oauthCredentialFromTaggedObject(e)}static credentialFromError(e){return zi.oauthCredentialFromTaggedObject(e.customData||{})}static oauthCredentialFromTaggedObject({_tokenResponse:e}){if(!e)return null;const{oauthIdToken:t,oauthAccessToken:r,oauthTokenSecret:s,pendingToken:i,nonce:o,providerId:c}=e;if(!r&&!s&&!t&&!i||!c)return null;try{return new zi(c)._credential({idToken:t,accessToken:r,nonce:o,pendingToken:i})}catch{return null}}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class En extends $r{constructor(){super("facebook.com")}static credential(e){return sn._fromParams({providerId:En.PROVIDER_ID,signInMethod:En.FACEBOOK_SIGN_IN_METHOD,accessToken:e})}static credentialFromResult(e){return En.credentialFromTaggedObject(e)}static credentialFromError(e){return En.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e||!("oauthAccessToken"in e)||!e.oauthAccessToken)return null;try{return En.credential(e.oauthAccessToken)}catch{return null}}}En.FACEBOOK_SIGN_IN_METHOD="facebook.com";En.PROVIDER_ID="facebook.com";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class In extends $r{constructor(){super("google.com"),this.addScope("profile")}static credential(e,t){return sn._fromParams({providerId:In.PROVIDER_ID,signInMethod:In.GOOGLE_SIGN_IN_METHOD,idToken:e,accessToken:t})}static credentialFromResult(e){return In.credentialFromTaggedObject(e)}static credentialFromError(e){return In.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e)return null;const{oauthIdToken:t,oauthAccessToken:r}=e;if(!t&&!r)return null;try{return In.credential(t,r)}catch{return null}}}In.GOOGLE_SIGN_IN_METHOD="google.com";In.PROVIDER_ID="google.com";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Tn extends $r{constructor(){super("github.com")}static credential(e){return sn._fromParams({providerId:Tn.PROVIDER_ID,signInMethod:Tn.GITHUB_SIGN_IN_METHOD,accessToken:e})}static credentialFromResult(e){return Tn.credentialFromTaggedObject(e)}static credentialFromError(e){return Tn.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e||!("oauthAccessToken"in e)||!e.oauthAccessToken)return null;try{return Tn.credential(e.oauthAccessToken)}catch{return null}}}Tn.GITHUB_SIGN_IN_METHOD="github.com";Tn.PROVIDER_ID="github.com";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class wn extends $r{constructor(){super("twitter.com")}static credential(e,t){return sn._fromParams({providerId:wn.PROVIDER_ID,signInMethod:wn.TWITTER_SIGN_IN_METHOD,oauthToken:e,oauthTokenSecret:t})}static credentialFromResult(e){return wn.credentialFromTaggedObject(e)}static credentialFromError(e){return wn.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e)return null;const{oauthAccessToken:t,oauthTokenSecret:r}=e;if(!t||!r)return null;try{return wn.credential(t,r)}catch{return null}}}wn.TWITTER_SIGN_IN_METHOD="twitter.com";wn.PROVIDER_ID="twitter.com";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Or{constructor(e){this.user=e.user,this.providerId=e.providerId,this._tokenResponse=e._tokenResponse,this.operationType=e.operationType}static async _fromIdTokenResponse(e,t,r,s=!1){const i=await St._fromIdTokenResponse(e,r,s),o=gl(r);return new Or({user:i,providerId:o,_tokenResponse:r,operationType:t})}static async _forOperation(e,t,r){await e._updateTokensIfNecessary(r,!0);const s=gl(r);return new Or({user:e,providerId:s,_tokenResponse:r,operationType:t})}}function gl(n){return n.providerId?n.providerId:"phoneNumber"in n?"phone":null}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ao extends Ct{constructor(e,t,r,s){super(t.code,t.message),this.operationType=r,this.user=s,Object.setPrototypeOf(this,ao.prototype),this.customData={appName:e.name,tenantId:e.tenantId??void 0,_serverResponse:t.customData._serverResponse,operationType:r}}static _fromErrorAndOperation(e,t,r,s){return new ao(e,t,r,s)}}function q2(n,e,t,r){return(e==="reauthenticate"?t._getReauthenticationResolver(n):t._getIdTokenResponse(n)).catch(i=>{throw i.code==="auth/multi-factor-auth-required"?ao._fromErrorAndOperation(n,i,e,r):i})}async function K7(n,e,t=!1){const r=await Nr(n,e._linkToIdToken(n.auth,await n.getIdToken()),t);return Or._forOperation(n,"link",r)}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function H2(n,e,t=!1){const{auth:r}=n;if(ze(r.app))return Promise.reject(Ut(r));const s="reauthenticate";try{const i=await Nr(n,q2(r,s,e,n),t);H(i.idToken,r,"internal-error");const o=Fc(i.idToken);H(o,r,"internal-error");const{sub:c}=o;return H(n.uid===c,r,"user-mismatch"),Or._forOperation(n,s,i)}catch(i){throw i?.code==="auth/user-not-found"&&vt(r,"user-mismatch"),i}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function j2(n,e,t=!1){if(ze(n.app))return Promise.reject(Ut(n));const r="signIn",s=await q2(n,r,e),i=await Or._fromIdTokenResponse(n,r,s);return t||await n._updateCurrentUser(i.user),i}async function G2(n,e){return j2(It(n),e)}async function wy(n,e){return H2(le(n),e)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function Y7(n){const e=It(n);e._getPasswordPolicyInternal()&&await e._updatePasswordPolicy()}async function Ay(n,e,t){const r=It(n);await Rr(r,{requestType:"PASSWORD_RESET",email:e,clientType:"CLIENT_TYPE_WEB"},"getOobCode",F7,"EMAIL_PASSWORD_PROVIDER")}function vy(n,e,t){return ze(n.app)?Promise.reject(Ut(n)):G2(le(n),Br.credential(e,t)).catch(async r=>{throw r.code==="auth/password-does-not-meet-requirements"&&Y7(n),r})}async function Ry(n,e){const t=le(n),s={requestType:"VERIFY_EMAIL",idToken:await n.getIdToken()},{email:i}=await M7(t.auth,s);i!==n.email&&await n.reload()}function Cy(n,e){return Q7(le(n),null,e)}async function Q7(n,e,t){const{auth:r}=n,i={idToken:await n.getIdToken(),returnSecureToken:!0};t&&(i.password=t);const o=await Nr(n,V7(r,i));await n._updateTokensIfNecessary(o,!0)}function X7(n,e,t,r){return le(n).onIdTokenChanged(e,t,r)}function J7(n,e,t){return le(n).beforeAuthStateChanged(e,t)}function Py(n,e,t,r){return le(n).onAuthStateChanged(e,t,r)}function Sy(n){return le(n).signOut()}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function _l(n,e){return pt(n,"POST","/v2/accounts/mfaEnrollment:start",dt(n,e))}const co="__sak";/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class W2{constructor(e,t){this.storageRetriever=e,this.type=t}_isAvailable(){try{return this.storage?(this.storage.setItem(co,"1"),this.storage.removeItem(co),Promise.resolve(!0)):Promise.resolve(!1)}catch{return Promise.resolve(!1)}}_set(e,t){return this.storage.setItem(e,JSON.stringify(t)),Promise.resolve()}_get(e){const t=this.storage.getItem(e);return Promise.resolve(t?JSON.parse(t):null)}_remove(e){return this.storage.removeItem(e),Promise.resolve()}get storage(){return this.storageRetriever()}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Z7=1e3,e4=10;class z2 extends W2{constructor(){super(()=>window.localStorage,"LOCAL"),this.boundEventHandler=(e,t)=>this.onStorageEvent(e,t),this.listeners={},this.localCache={},this.pollTimer=null,this.fallbackToPolling=M2(),this._shouldAllowMigration=!0}forAllChangedKeys(e){for(const t of Object.keys(this.listeners)){const r=this.storage.getItem(t),s=this.localCache[t];r!==s&&e(t,s,r)}}onStorageEvent(e,t=!1){if(!e.key){this.forAllChangedKeys((o,c,u)=>{this.notifyListeners(o,u)});return}const r=e.key;t?this.detachListener():this.stopPolling();const s=()=>{const o=this.storage.getItem(r);!t&&this.localCache[r]===o||this.notifyListeners(r,o)},i=this.storage.getItem(r);l7()&&i!==e.newValue&&e.newValue!==e.oldValue?setTimeout(s,e4):s()}notifyListeners(e,t){this.localCache[e]=t;const r=this.listeners[e];if(r)for(const s of Array.from(r))s(t&&JSON.parse(t))}startPolling(){this.stopPolling(),this.pollTimer=setInterval(()=>{this.forAllChangedKeys((e,t,r)=>{this.onStorageEvent(new StorageEvent("storage",{key:e,oldValue:t,newValue:r}),!0)})},Z7)}stopPolling(){this.pollTimer&&(clearInterval(this.pollTimer),this.pollTimer=null)}attachListener(){window.addEventListener("storage",this.boundEventHandler)}detachListener(){window.removeEventListener("storage",this.boundEventHandler)}_addListener(e,t){Object.keys(this.listeners).length===0&&(this.fallbackToPolling?this.startPolling():this.attachListener()),this.listeners[e]||(this.listeners[e]=new Set,this.localCache[e]=this.storage.getItem(e)),this.listeners[e].add(t)}_removeListener(e,t){this.listeners[e]&&(this.listeners[e].delete(t),this.listeners[e].size===0&&delete this.listeners[e]),Object.keys(this.listeners).length===0&&(this.detachListener(),this.stopPolling())}async _set(e,t){await super._set(e,t),this.localCache[e]=JSON.stringify(t)}async _get(e){const t=await super._get(e);return this.localCache[e]=JSON.stringify(t),t}async _remove(e){await super._remove(e),delete this.localCache[e]}}z2.type="LOCAL";const t4=z2;/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class K2 extends W2{constructor(){super(()=>window.sessionStorage,"SESSION")}_addListener(e,t){}_removeListener(e,t){}}K2.type="SESSION";const Y2=K2;/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function n4(n){return Promise.all(n.map(async e=>{try{return{fulfilled:!0,value:await e}}catch(t){return{fulfilled:!1,reason:t}}}))}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Lo{constructor(e){this.eventTarget=e,this.handlersMap={},this.boundEventHandler=this.handleEvent.bind(this)}static _getInstance(e){const t=this.receivers.find(s=>s.isListeningto(e));if(t)return t;const r=new Lo(e);return this.receivers.push(r),r}isListeningto(e){return this.eventTarget===e}async handleEvent(e){const t=e,{eventId:r,eventType:s,data:i}=t.data,o=this.handlersMap[s];if(!o?.size)return;t.ports[0].postMessage({status:"ack",eventId:r,eventType:s});const c=Array.from(o).map(async l=>l(t.origin,i)),u=await n4(c);t.ports[0].postMessage({status:"done",eventId:r,eventType:s,response:u})}_subscribe(e,t){Object.keys(this.handlersMap).length===0&&this.eventTarget.addEventListener("message",this.boundEventHandler),this.handlersMap[e]||(this.handlersMap[e]=new Set),this.handlersMap[e].add(t)}_unsubscribe(e,t){this.handlersMap[e]&&t&&this.handlersMap[e].delete(t),(!t||this.handlersMap[e].size===0)&&delete this.handlersMap[e],Object.keys(this.handlersMap).length===0&&this.eventTarget.removeEventListener("message",this.boundEventHandler)}}Lo.receivers=[];/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function qc(n="",e=10){let t="";for(let r=0;r<e;r++)t+=Math.floor(Math.random()*10);return n+t}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class r4{constructor(e){this.target=e,this.handlers=new Set}removeMessageHandler(e){e.messageChannel&&(e.messageChannel.port1.removeEventListener("message",e.onMessage),e.messageChannel.port1.close()),this.handlers.delete(e)}async _send(e,t,r=50){const s=typeof MessageChannel<"u"?new MessageChannel:null;if(!s)throw new Error("connection_unavailable");let i,o;return new Promise((c,u)=>{const l=qc("",20);s.port1.start();const p=setTimeout(()=>{u(new Error("unsupported_event"))},r);o={messageChannel:s,onMessage(g){const T=g;if(T.data.eventId===l)switch(T.data.status){case"ack":clearTimeout(p),i=setTimeout(()=>{u(new Error("timeout"))},3e3);break;case"done":clearTimeout(i),c(T.data.response);break;default:clearTimeout(p),clearTimeout(i),u(new Error("invalid_response"));break}}},this.handlers.add(o),s.port1.addEventListener("message",o.onMessage),this.target.postMessage({eventType:e,eventId:l,data:t},[s.port2])}).finally(()=>{o&&this.removeMessageHandler(o)})}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Ce(){return window}function s4(n){Ce().location.href=n}/**
 * @license
 * Copyright 2020 Google LLC.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Hc(){return typeof Ce().WorkerGlobalScope<"u"&&typeof Ce().importScripts=="function"}async function i4(){if(!navigator?.serviceWorker)return null;try{return(await navigator.serviceWorker.ready).active}catch{return null}}function o4(){return navigator?.serviceWorker?.controller||null}function a4(){return Hc()?self:null}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Q2="firebaseLocalStorageDb",c4=1,uo="firebaseLocalStorage",X2="fbase_key";class ai{constructor(e){this.request=e}toPromise(){return new Promise((e,t)=>{this.request.addEventListener("success",()=>{e(this.request.result)}),this.request.addEventListener("error",()=>{t(this.request.error)})})}}function Mo(n,e){return n.transaction([uo],e?"readwrite":"readonly").objectStore(uo)}function u4(){const n=indexedDB.deleteDatabase(Q2);return new ai(n).toPromise()}function J2(){const n=indexedDB.open(Q2,c4);return new Promise((e,t)=>{n.addEventListener("error",()=>{t(n.error)}),n.addEventListener("upgradeneeded",()=>{const r=n.result;try{r.createObjectStore(uo,{keyPath:X2})}catch(s){t(s)}}),n.addEventListener("success",async()=>{const r=n.result;r.objectStoreNames.contains(uo)?e(r):(r.close(),await u4(),e(await J2()))})})}async function yl(n,e,t){const r=Mo(n,!0).put({[X2]:e,value:t});return new ai(r).toPromise()}async function l4(n,e){const t=Mo(n,!1).get(e),r=await new ai(t).toPromise();return r===void 0?null:r.value}function El(n,e){const t=Mo(n,!0).delete(e);return new ai(t).toPromise()}const h4=800,f4=3;class Z2{constructor(){this.type="LOCAL",this.dbPromise=null,this._shouldAllowMigration=!0,this.listeners={},this.localCache={},this.pollTimer=null,this.pendingWrites=0,this.receiver=null,this.sender=null,this.serviceWorkerReceiverAvailable=!1,this.activeServiceWorker=null,this._workerInitializationPromise=this.initializeServiceWorkerMessaging().then(()=>{},()=>{})}async _openDb(){return this.dbPromise?this.dbPromise:(this.dbPromise=J2(),this.dbPromise.catch(()=>{this.dbPromise=null}),this.dbPromise)}async _withRetries(e){let t=0;for(;;)try{const r=await this._openDb();return await e(r)}catch(r){if(t++>f4)throw r;this.dbPromise&&((await this.dbPromise).close(),this.dbPromise=null)}}async initializeServiceWorkerMessaging(){return Hc()?this.initializeReceiver():this.initializeSender()}async initializeReceiver(){this.receiver=Lo._getInstance(a4()),this.receiver._subscribe("keyChanged",async(e,t)=>({keyProcessed:(await this._poll()).includes(t.key)})),this.receiver._subscribe("ping",async(e,t)=>["keyChanged"])}async initializeSender(){if(this.activeServiceWorker=await i4(),!this.activeServiceWorker)return;this.sender=new r4(this.activeServiceWorker);const e=await this.sender._send("ping",{},800);e&&e[0]?.fulfilled&&e[0]?.value.includes("keyChanged")&&(this.serviceWorkerReceiverAvailable=!0)}async notifyServiceWorker(e){if(!(!this.sender||!this.activeServiceWorker||o4()!==this.activeServiceWorker))try{await this.sender._send("keyChanged",{key:e},this.serviceWorkerReceiverAvailable?800:50)}catch{}}async _isAvailable(){try{return indexedDB?(await this._withRetries(async e=>{await yl(e,co,"1"),await El(e,co)}),!0):!1}catch{}return!1}async _withPendingWrite(e){this.pendingWrites++;try{await e()}finally{this.pendingWrites--}}async _set(e,t){return this._withPendingWrite(async()=>(await this._withRetries(r=>yl(r,e,t)),this.localCache[e]=t,this.notifyServiceWorker(e)))}async _get(e){const t=await this._withRetries(r=>l4(r,e));return this.localCache[e]=t,t}async _remove(e){return this._withPendingWrite(async()=>(await this._withRetries(t=>El(t,e)),delete this.localCache[e],this.notifyServiceWorker(e)))}async _poll(){const e=await this._withRetries(s=>{const i=Mo(s,!1).getAll();return new ai(i).toPromise()});if(!e)return[];if(this.pendingWrites!==0)return[];const t=[],r=new Set;if(e.length!==0)for(const{fbase_key:s,value:i}of e)r.add(s),JSON.stringify(this.localCache[s])!==JSON.stringify(i)&&(this.notifyListeners(s,i),t.push(s));for(const s of Object.keys(this.localCache))this.localCache[s]&&!r.has(s)&&(this.notifyListeners(s,null),t.push(s));return t}notifyListeners(e,t){this.localCache[e]=t;const r=this.listeners[e];if(r)for(const s of Array.from(r))s(t)}startPolling(){this.stopPolling(),this.pollTimer=setInterval(async()=>this._poll(),h4)}stopPolling(){this.pollTimer&&(clearInterval(this.pollTimer),this.pollTimer=null)}_addListener(e,t){Object.keys(this.listeners).length===0&&this.startPolling(),this.listeners[e]||(this.listeners[e]=new Set,this._get(e)),this.listeners[e].add(t)}_removeListener(e,t){this.listeners[e]&&(this.listeners[e].delete(t),this.listeners[e].size===0&&delete this.listeners[e]),Object.keys(this.listeners).length===0&&this.stopPolling()}}Z2.type="LOCAL";const d4=Z2;/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Il(n,e){return pt(n,"POST","/v2/accounts/mfaSignIn:start",dt(n,e))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Ha=U2("rcb"),p4=new si(3e4,6e4);class m4{constructor(){this.hostLanguage="",this.counter=0,this.librarySeparatelyLoaded=!!Ce().grecaptcha?.render}load(e,t=""){return H(g4(t),e,"argument-error"),this.shouldResolveImmediately(t)&&ol(Ce().grecaptcha)?Promise.resolve(Ce().grecaptcha):new Promise((r,s)=>{const i=Ce().setTimeout(()=>{s(nt(e,"network-request-failed"))},p4.get());Ce()[Ha]=()=>{Ce().clearTimeout(i),delete Ce()[Ha];const c=Ce().grecaptcha;if(!c||!ol(c)){s(nt(e,"internal-error"));return}const u=c.render;c.render=(l,p)=>{const g=u(l,p);return this.counter++,g},this.hostLanguage=t,r(c)};const o=`${_7()}?${Ur({onload:Ha,render:"explicit",hl:t})}`;Bc(o).catch(()=>{clearTimeout(i),s(nt(e,"internal-error"))})})}clearedOneInstance(){this.counter--}shouldResolveImmediately(e){return!!Ce().grecaptcha?.render&&(e===this.hostLanguage||this.counter>0||this.librarySeparatelyLoaded)}}function g4(n){return n.length<=6&&/^\s*[a-zA-Z0-9\-]*\s*$/.test(n)}class _4{async load(e){return new w7(e)}clearedOneInstance(){}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Ps="recaptcha",y4={theme:"light",type:"image"};class by{constructor(e,t,r={...y4}){this.parameters=r,this.type=Ps,this.destroyed=!1,this.widgetId=null,this.tokenChangeListeners=new Set,this.renderPromise=null,this.recaptcha=null,this.auth=It(e),this.isInvisible=this.parameters.size==="invisible",H(typeof document<"u",this.auth,"operation-not-supported-in-this-environment");const s=typeof t=="string"?document.getElementById(t):t;H(s,this.auth,"argument-error"),this.container=s,this.parameters.callback=this.makeTokenCallback(this.parameters.callback),this._recaptchaLoader=this.auth.settings.appVerificationDisabledForTesting?new _4:new m4,this.validateStartingState()}async verify(){this.assertNotDestroyed();const e=await this.render(),t=this.getAssertedRecaptcha(),r=t.getResponse(e);return r||new Promise(s=>{const i=o=>{o&&(this.tokenChangeListeners.delete(i),s(o))};this.tokenChangeListeners.add(i),this.isInvisible&&t.execute(e)})}render(){try{this.assertNotDestroyed()}catch(e){return Promise.reject(e)}return this.renderPromise?this.renderPromise:(this.renderPromise=this.makeRenderPromise().catch(e=>{throw this.renderPromise=null,e}),this.renderPromise)}_reset(){this.assertNotDestroyed(),this.widgetId!==null&&this.getAssertedRecaptcha().reset(this.widgetId)}clear(){this.assertNotDestroyed(),this.destroyed=!0,this._recaptchaLoader.clearedOneInstance(),this.isInvisible||this.container.childNodes.forEach(e=>{this.container.removeChild(e)})}validateStartingState(){H(!this.parameters.sitekey,this.auth,"argument-error"),H(this.isInvisible||!this.container.hasChildNodes(),this.auth,"argument-error"),H(typeof document<"u",this.auth,"operation-not-supported-in-this-environment")}makeTokenCallback(e){return t=>{if(this.tokenChangeListeners.forEach(r=>r(t)),typeof e=="function")e(t);else if(typeof e=="string"){const r=Ce()[e];typeof r=="function"&&r(t)}}}assertNotDestroyed(){H(!this.destroyed,this.auth,"internal-error")}async makeRenderPromise(){if(await this.init(),!this.widgetId){let e=this.container;if(!this.isInvisible){const t=document.createElement("div");e.appendChild(t),e=t}this.widgetId=this.getAssertedRecaptcha().render(e,this.parameters)}return this.widgetId}async init(){H(w2()&&!Hc(),this.auth,"internal-error"),await E4(),this.recaptcha=await this._recaptchaLoader.load(this.auth,this.auth.languageCode||void 0);const e=await e7(this.auth);H(e,this.auth,"internal-error"),this.parameters.sitekey=e}getAssertedRecaptcha(){return H(this.recaptcha,this.auth,"internal-error"),this.recaptcha}}function E4(){let n=null;return new Promise(e=>{if(document.readyState==="complete"){e();return}n=()=>e(),window.addEventListener("load",n)}).catch(e=>{throw n&&window.removeEventListener("load",n),e})}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class I4{constructor(e,t){this.verificationId=e,this.onConfirmation=t}confirm(e){const t=Cs._fromVerification(this.verificationId,e);return this.onConfirmation(t)}}async function Ny(n,e,t){if(ze(n.app))return Promise.reject(Ut(n));const r=It(n),s=await T4(r,e,le(t));return new I4(s,i=>G2(r,i))}async function T4(n,e,t){if(!n._getRecaptchaConfig())try{await S7(n)}catch{console.log("Failed to initialize reCAPTCHA Enterprise config. Triggering the reCAPTCHA v2 verification.")}try{let r;if(typeof e=="string"?r={phoneNumber:e}:r=e,"session"in r){const s=r.session;if("phoneNumber"in r){H(s.type==="enroll",n,"internal-error");const i={idToken:s.credential,phoneEnrollmentInfo:{phoneNumber:r.phoneNumber,clientType:"CLIENT_TYPE_WEB"}};return(await Rr(n,i,"mfaSmsEnrollment",async(l,p)=>{if(p.phoneEnrollmentInfo.captchaResponse===Rs){H(t?.type===Ps,l,"argument-error");const g=await ja(l,p,t);return _l(l,g)}return _l(l,p)},"PHONE_PROVIDER").catch(l=>Promise.reject(l))).phoneSessionInfo.sessionInfo}else{H(s.type==="signin",n,"internal-error");const i=r.multiFactorHint?.uid||r.multiFactorUid;H(i,n,"missing-multi-factor-info");const o={mfaPendingCredential:s.credential,mfaEnrollmentId:i,phoneSignInInfo:{clientType:"CLIENT_TYPE_WEB"}};return(await Rr(n,o,"mfaSmsSignIn",async(p,g)=>{if(g.phoneSignInInfo.captchaResponse===Rs){H(t?.type===Ps,p,"argument-error");const T=await ja(p,g,t);return Il(p,T)}return Il(p,g)},"PHONE_PROVIDER").catch(p=>Promise.reject(p))).phoneResponseInfo.sessionInfo}}else{const s={phoneNumber:r.phoneNumber,clientType:"CLIENT_TYPE_WEB"};return(await Rr(n,s,"sendVerificationCode",async(u,l)=>{if(l.captchaResponse===Rs){H(t?.type===Ps,u,"argument-error");const p=await ja(u,l,t);return ml(u,p)}return ml(u,l)},"PHONE_PROVIDER").catch(u=>Promise.reject(u))).sessionInfo}}finally{t?._reset()}}async function ja(n,e,t){H(t.type===Ps,n,"argument-error");const r=await t.verify();H(typeof r=="string",n,"argument-error");const s={...e};if("phoneEnrollmentInfo"in s){const i=s.phoneEnrollmentInfo.phoneNumber,o=s.phoneEnrollmentInfo.captchaResponse,c=s.phoneEnrollmentInfo.clientType,u=s.phoneEnrollmentInfo.recaptchaVersion;return Object.assign(s,{phoneEnrollmentInfo:{phoneNumber:i,recaptchaToken:r,captchaResponse:o,clientType:c,recaptchaVersion:u}}),s}else if("phoneSignInInfo"in s){const i=s.phoneSignInInfo.captchaResponse,o=s.phoneSignInInfo.clientType,c=s.phoneSignInInfo.recaptchaVersion;return Object.assign(s,{phoneSignInInfo:{recaptchaToken:r,captchaResponse:i,clientType:o,recaptchaVersion:c}}),s}else return Object.assign(s,{recaptchaToken:r}),s}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Fo(n,e){return e?Jt(e):(H(n._popupRedirectResolver,n,"argument-error"),n._popupRedirectResolver)}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class jc extends xo{constructor(e){super("custom","custom"),this.params=e}_getIdTokenResponse(e){return Cr(e,this._buildIdpRequest())}_linkToIdToken(e,t){return Cr(e,this._buildIdpRequest(t))}_getReauthenticationResolver(e){return Cr(e,this._buildIdpRequest())}_buildIdpRequest(e){const t={requestUri:this.params.requestUri,sessionId:this.params.sessionId,postBody:this.params.postBody,tenantId:this.params.tenantId,pendingToken:this.params.pendingToken,returnSecureToken:!0,returnIdpCredential:!0};return e&&(t.idToken=e),t}}function w4(n){return j2(n.auth,new jc(n),n.bypassAuthState)}function A4(n){const{auth:e,user:t}=n;return H(t,e,"internal-error"),H2(t,new jc(n),n.bypassAuthState)}async function v4(n){const{auth:e,user:t}=n;return H(t,e,"internal-error"),K7(t,new jc(n),n.bypassAuthState)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ef{constructor(e,t,r,s,i=!1){this.auth=e,this.resolver=r,this.user=s,this.bypassAuthState=i,this.pendingPromise=null,this.eventManager=null,this.filter=Array.isArray(t)?t:[t]}execute(){return new Promise(async(e,t)=>{this.pendingPromise={resolve:e,reject:t};try{this.eventManager=await this.resolver._initialize(this.auth),await this.onExecution(),this.eventManager.registerConsumer(this)}catch(r){this.reject(r)}})}async onAuthEvent(e){const{urlResponse:t,sessionId:r,postBody:s,tenantId:i,error:o,type:c}=e;if(o){this.reject(o);return}const u={auth:this.auth,requestUri:t,sessionId:r,tenantId:i||void 0,postBody:s||void 0,user:this.user,bypassAuthState:this.bypassAuthState};try{this.resolve(await this.getIdpTask(c)(u))}catch(l){this.reject(l)}}onError(e){this.reject(e)}getIdpTask(e){switch(e){case"signInViaPopup":case"signInViaRedirect":return w4;case"linkViaPopup":case"linkViaRedirect":return v4;case"reauthViaPopup":case"reauthViaRedirect":return A4;default:vt(this.auth,"internal-error")}}resolve(e){rn(this.pendingPromise,"Pending promise was never set"),this.pendingPromise.resolve(e),this.unregisterAndCleanUp()}reject(e){rn(this.pendingPromise,"Pending promise was never set"),this.pendingPromise.reject(e),this.unregisterAndCleanUp()}unregisterAndCleanUp(){this.eventManager&&this.eventManager.unregisterConsumer(this),this.pendingPromise=null,this.cleanUp()}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const R4=new si(2e3,1e4);async function Oy(n,e,t){if(ze(n.app))return Promise.reject(nt(n,"operation-not-supported-in-this-environment"));const r=It(n);xc(n,e,oi);const s=Fo(r,t);return new Cn(r,"signInViaPopup",e,s).executeNotNull()}async function ky(n,e,t){const r=le(n);if(ze(r.auth.app))return Promise.reject(nt(r.auth,"operation-not-supported-in-this-environment"));xc(r.auth,e,oi);const s=Fo(r.auth,t);return new Cn(r.auth,"reauthViaPopup",e,s,r).executeNotNull()}class Cn extends ef{constructor(e,t,r,s,i){super(e,t,s,i),this.provider=r,this.authWindow=null,this.pollId=null,Cn.currentPopupAction&&Cn.currentPopupAction.cancel(),Cn.currentPopupAction=this}async executeNotNull(){const e=await this.execute();return H(e,this.auth,"internal-error"),e}async onExecution(){rn(this.filter.length===1,"Popup operations only handle one event");const e=qc();this.authWindow=await this.resolver._openPopup(this.auth,this.provider,this.filter[0],e),this.authWindow.associatedEvent=e,this.resolver._originValidation(this.auth).catch(t=>{this.reject(t)}),this.resolver._isIframeWebStorageSupported(this.auth,t=>{t||this.reject(nt(this.auth,"web-storage-unsupported"))}),this.pollUserCancellation()}get eventId(){return this.authWindow?.associatedEvent||null}cancel(){this.reject(nt(this.auth,"cancelled-popup-request"))}cleanUp(){this.authWindow&&this.authWindow.close(),this.pollId&&window.clearTimeout(this.pollId),this.authWindow=null,this.pollId=null,Cn.currentPopupAction=null}pollUserCancellation(){const e=()=>{if(this.authWindow?.window?.closed){this.pollId=window.setTimeout(()=>{this.pollId=null,this.reject(nt(this.auth,"popup-closed-by-user"))},8e3);return}this.pollId=window.setTimeout(e,R4.get())};e()}}Cn.currentPopupAction=null;/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const C4="pendingRedirect",Ki=new Map;class P4 extends ef{constructor(e,t,r=!1){super(e,["signInViaRedirect","linkViaRedirect","reauthViaRedirect","unknown"],t,void 0,r),this.eventId=null}async execute(){let e=Ki.get(this.auth._key());if(!e){try{const r=await S4(this.resolver,this.auth)?await super.execute():null;e=()=>Promise.resolve(r)}catch(t){e=()=>Promise.reject(t)}Ki.set(this.auth._key(),e)}return this.bypassAuthState||Ki.set(this.auth._key(),()=>Promise.resolve(null)),e()}async onAuthEvent(e){if(e.type==="signInViaRedirect")return super.onAuthEvent(e);if(e.type==="unknown"){this.resolve(null);return}if(e.eventId){const t=await this.auth._redirectUserForId(e.eventId);if(t)return this.user=t,super.onAuthEvent(e);this.resolve(null)}}async onExecution(){}cleanUp(){}}async function S4(n,e){const t=nf(e),r=tf(n);if(!await r._isAvailable())return!1;const s=await r._get(t)==="true";return await r._remove(t),s}async function b4(n,e){return tf(n)._set(nf(e),"true")}function N4(n,e){Ki.set(n._key(),e)}function tf(n){return Jt(n._redirectPersistence)}function nf(n){return Wi(C4,n.config.apiKey,n.name)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Dy(n,e,t){return O4(n,e,t)}async function O4(n,e,t){if(ze(n.app))return Promise.reject(Ut(n));const r=It(n);xc(n,e,oi),await r._initializationPromise;const s=Fo(r,t);return await b4(s,r),s._openRedirect(r,e,"signInViaRedirect")}async function Vy(n,e){return await It(n)._initializationPromise,rf(n,e,!1)}async function rf(n,e,t=!1){if(ze(n.app))return Promise.reject(Ut(n));const r=It(n),s=Fo(r,e),o=await new P4(r,s,t).execute();return o&&!t&&(delete o.user._redirectEventId,await r._persistUserIfCurrent(o.user),await r._setRedirectUser(null,e)),o}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const k4=600*1e3;class D4{constructor(e){this.auth=e,this.cachedEventUids=new Set,this.consumers=new Set,this.queuedRedirectEvent=null,this.hasHandledPotentialRedirect=!1,this.lastProcessedEventTime=Date.now()}registerConsumer(e){this.consumers.add(e),this.queuedRedirectEvent&&this.isEventForConsumer(this.queuedRedirectEvent,e)&&(this.sendToConsumer(this.queuedRedirectEvent,e),this.saveEventToCache(this.queuedRedirectEvent),this.queuedRedirectEvent=null)}unregisterConsumer(e){this.consumers.delete(e)}onEvent(e){if(this.hasEventBeenHandled(e))return!1;let t=!1;return this.consumers.forEach(r=>{this.isEventForConsumer(e,r)&&(t=!0,this.sendToConsumer(e,r),this.saveEventToCache(e))}),this.hasHandledPotentialRedirect||!V4(e)||(this.hasHandledPotentialRedirect=!0,t||(this.queuedRedirectEvent=e,t=!0)),t}sendToConsumer(e,t){if(e.error&&!sf(e)){const r=e.error.code?.split("auth/")[1]||"internal-error";t.onError(nt(this.auth,r))}else t.onAuthEvent(e)}isEventForConsumer(e,t){const r=t.eventId===null||!!e.eventId&&e.eventId===t.eventId;return t.filter.includes(e.type)&&r}hasEventBeenHandled(e){return Date.now()-this.lastProcessedEventTime>=k4&&this.cachedEventUids.clear(),this.cachedEventUids.has(Tl(e))}saveEventToCache(e){this.cachedEventUids.add(Tl(e)),this.lastProcessedEventTime=Date.now()}}function Tl(n){return[n.type,n.eventId,n.sessionId,n.tenantId].filter(e=>e).join("-")}function sf({type:n,error:e}){return n==="unknown"&&e?.code==="auth/no-auth-event"}function V4(n){switch(n.type){case"signInViaRedirect":case"linkViaRedirect":case"reauthViaRedirect":return!0;case"unknown":return sf(n);default:return!1}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function x4(n,e={}){return pt(n,"GET","/v1/projects",e)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const L4=/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/,M4=/^https?/;async function F4(n){if(n.config.emulator)return;const{authorizedDomains:e}=await x4(n);for(const t of e)try{if(U4(t))return}catch{}vt(n,"unauthorized-domain")}function U4(n){const e=uc(),{protocol:t,hostname:r}=new URL(e);if(n.startsWith("chrome-extension://")){const o=new URL(n);return o.hostname===""&&r===""?t==="chrome-extension:"&&n.replace("chrome-extension://","")===e.replace("chrome-extension://",""):t==="chrome-extension:"&&o.hostname===r}if(!M4.test(t))return!1;if(L4.test(n))return r===n;const s=n.replace(/\./g,"\\.");return new RegExp("^(.+\\."+s+"|"+s+")$","i").test(r)}/**
 * @license
 * Copyright 2020 Google LLC.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const B4=new si(3e4,6e4);function wl(){const n=Ce().___jsl;if(n?.H){for(const e of Object.keys(n.H))if(n.H[e].r=n.H[e].r||[],n.H[e].L=n.H[e].L||[],n.H[e].r=[...n.H[e].L],n.CP)for(let t=0;t<n.CP.length;t++)n.CP[t]=null}}function $4(n){return new Promise((e,t)=>{function r(){wl(),gapi.load("gapi.iframes",{callback:()=>{e(gapi.iframes.getContext())},ontimeout:()=>{wl(),t(nt(n,"network-request-failed"))},timeout:B4.get()})}if(Ce().gapi?.iframes?.Iframe)e(gapi.iframes.getContext());else if(Ce().gapi?.load)r();else{const s=U2("iframefcb");return Ce()[s]=()=>{gapi.load?r():t(nt(n,"network-request-failed"))},Bc(`${E7()}?onload=${s}`).catch(i=>t(i))}}).catch(e=>{throw Yi=null,e})}let Yi=null;function q4(n){return Yi=Yi||$4(n),Yi}/**
 * @license
 * Copyright 2020 Google LLC.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const H4=new si(5e3,15e3),j4="__/auth/iframe",G4="emulator/auth/iframe",W4={style:{position:"absolute",top:"-100px",width:"1px",height:"1px"},"aria-hidden":"true",tabindex:"-1"},z4=new Map([["identitytoolkit.googleapis.com","p"],["staging-identitytoolkit.sandbox.googleapis.com","s"],["test-identitytoolkit.sandbox.googleapis.com","t"]]);function K4(n){const e=n.config;H(e.authDomain,n,"auth-domain-config-required");const t=e.emulator?Mc(e,G4):`https://${n.config.authDomain}/${j4}`,r={apiKey:e.apiKey,appName:n.name,v:fr},s=z4.get(n.config.apiHost);s&&(r.eid=s);const i=n._getFrameworks();return i.length&&(r.fw=i.join(",")),`${t}?${Ur(r).slice(1)}`}async function Y4(n){const e=await q4(n),t=Ce().gapi;return H(t,n,"internal-error"),e.open({where:document.body,url:K4(n),messageHandlersFilter:t.iframes.CROSS_ORIGIN_IFRAMES_FILTER,attributes:W4,dontclear:!0},r=>new Promise(async(s,i)=>{await r.restyle({setHideOnLeave:!1});const o=nt(n,"network-request-failed"),c=Ce().setTimeout(()=>{i(o)},H4.get());function u(){Ce().clearTimeout(c),s(r)}r.ping(u).then(u,()=>{i(o)})}))}/**
 * @license
 * Copyright 2020 Google LLC.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Q4={location:"yes",resizable:"yes",statusbar:"yes",toolbar:"no"},X4=500,J4=600,Z4="_blank",em="http://localhost";class Al{constructor(e){this.window=e,this.associatedEvent=null}close(){if(this.window)try{this.window.close()}catch{}}}function tm(n,e,t,r=X4,s=J4){const i=Math.max((window.screen.availHeight-s)/2,0).toString(),o=Math.max((window.screen.availWidth-r)/2,0).toString();let c="";const u={...Q4,width:r.toString(),height:s.toString(),top:i,left:o},l=Qe().toLowerCase();t&&(c=k2(l)?Z4:t),N2(l)&&(e=e||em,u.scrollbars="yes");const p=Object.entries(u).reduce((T,[b,O])=>`${T}${b}=${O},`,"");if(u7(l)&&c!=="_self")return nm(e||"",c),new Al(null);const g=window.open(e||"",c,p);H(g,n,"popup-blocked");try{g.focus()}catch{}return new Al(g)}function nm(n,e){const t=document.createElement("a");t.href=n,t.target=e;const r=document.createEvent("MouseEvent");r.initMouseEvent("click",!0,!0,window,1,0,0,0,0,!1,!1,!1,!1,1,null),t.dispatchEvent(r)}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const rm="__/auth/handler",sm="emulator/auth/handler",im=encodeURIComponent("fac");async function vl(n,e,t,r,s,i){H(n.config.authDomain,n,"auth-domain-config-required"),H(n.config.apiKey,n,"invalid-api-key");const o={apiKey:n.config.apiKey,appName:n.name,authType:t,redirectUrl:r,v:fr,eventId:s};if(e instanceof oi){e.setDefaultLanguage(n.languageCode),o.providerId=e.providerId||"",Pp(e.getCustomParameters())||(o.customParameters=JSON.stringify(e.getCustomParameters()));for(const[p,g]of Object.entries({}))o[p]=g}if(e instanceof $r){const p=e.getScopes().filter(g=>g!=="");p.length>0&&(o.scopes=p.join(","))}n.tenantId&&(o.tid=n.tenantId);const c=o;for(const p of Object.keys(c))c[p]===void 0&&delete c[p];const u=await n._getAppCheckToken(),l=u?`#${im}=${encodeURIComponent(u)}`:"";return`${om(n)}?${Ur(c).slice(1)}${l}`}function om({config:n}){return n.emulator?Mc(n,sm):`https://${n.authDomain}/${rm}`}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Ga="webStorageSupport";class am{constructor(){this.eventManagers={},this.iframes={},this.originValidationPromises={},this._redirectPersistence=Y2,this._completeRedirectFn=rf,this._overrideRedirectResult=N4}async _openPopup(e,t,r,s){rn(this.eventManagers[e._key()]?.manager,"_initialize() not called before _openPopup()");const i=await vl(e,t,r,uc(),s);return tm(e,i,qc())}async _openRedirect(e,t,r,s){await this._originValidation(e);const i=await vl(e,t,r,uc(),s);return s4(i),new Promise(()=>{})}_initialize(e){const t=e._key();if(this.eventManagers[t]){const{manager:s,promise:i}=this.eventManagers[t];return s?Promise.resolve(s):(rn(i,"If manager is not set, promise should be"),i)}const r=this.initAndGetManager(e);return this.eventManagers[t]={promise:r},r.catch(()=>{delete this.eventManagers[t]}),r}async initAndGetManager(e){const t=await Y4(e),r=new D4(e);return t.register("authEvent",s=>(H(s?.authEvent,e,"invalid-auth-event"),{status:r.onEvent(s.authEvent)?"ACK":"ERROR"}),gapi.iframes.CROSS_ORIGIN_IFRAMES_FILTER),this.eventManagers[e._key()]={manager:r},this.iframes[e._key()]=t,r}_isIframeWebStorageSupported(e,t){this.iframes[e._key()].send(Ga,{type:Ga},s=>{const i=s?.[0]?.[Ga];i!==void 0&&t(!!i),vt(e,"internal-error")},gapi.iframes.CROSS_ORIGIN_IFRAMES_FILTER)}_originValidation(e){const t=e._key();return this.originValidationPromises[t]||(this.originValidationPromises[t]=F4(e)),this.originValidationPromises[t]}get _shouldInitProactively(){return M2()||O2()||Uc()}}const cm=am;var Rl="@firebase/auth",Cl="1.13.3";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class um{constructor(e){this.auth=e,this.internalListeners=new Map}getUid(){return this.assertAuthConfigured(),this.auth.currentUser?.uid||null}async getToken(e){return this.assertAuthConfigured(),await this.auth._initializationPromise,this.auth.currentUser?{accessToken:await this.auth.currentUser.getIdToken(e)}:null}addAuthTokenListener(e){if(this.assertAuthConfigured(),this.internalListeners.has(e))return;const t=this.auth.onIdTokenChanged(r=>{e(r?.stsTokenManager.accessToken||null)});this.internalListeners.set(e,t),this.updateProactiveRefresh()}removeAuthTokenListener(e){this.assertAuthConfigured();const t=this.internalListeners.get(e);t&&(this.internalListeners.delete(e),t(),this.updateProactiveRefresh())}assertAuthConfigured(){H(this.auth._initializationPromise,"dependent-sdk-initialized-before-auth")}updateProactiveRefresh(){this.internalListeners.size>0?this.auth._startProactiveRefresh():this.auth._stopProactiveRefresh()}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function lm(n){switch(n){case"Node":return"node";case"ReactNative":return"rn";case"Worker":return"webworker";case"Cordova":return"cordova";case"WebExtension":return"web-extension";default:return}}function hm(n){Nt(new At("auth",(e,{options:t})=>{const r=e.getProvider("app").getImmediate(),s=e.getProvider("heartbeat"),i=e.getProvider("app-check-internal"),{apiKey:o,authDomain:c}=r.options;H(o&&!o.includes(":"),"invalid-api-key",{appName:r.name});const u={apiKey:o,authDomain:c,clientPlatform:n,apiHost:"identitytoolkit.googleapis.com",tokenApiHost:"securetoken.googleapis.com",apiScheme:"https",sdkClientVersion:F2(n)},l=new m7(r,s,i,u);return N7(l,t),l},"PUBLIC").setInstantiationMode("EXPLICIT").setInstanceCreatedCallback((e,t,r)=>{e.getProvider("auth-internal").initialize()})),Nt(new At("auth-internal",e=>{const t=It(e.getProvider("auth").getImmediate());return(r=>new um(r))(t)},"PRIVATE").setInstantiationMode("EXPLICIT")),ct(Rl,Cl,lm(n)),ct(Rl,Cl,"esm2020")}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const fm=300,dm=h2("authIdTokenMaxAge")||fm;let Pl=null;const pm=n=>async e=>{const t=e&&await e.getIdTokenResult(),r=t&&(new Date().getTime()-Date.parse(t.issuedAtTime))/1e3;if(r&&r>dm)return;const s=t?.token;Pl!==s&&(Pl=s,await fetch(n,{method:s?"POST":"DELETE",headers:s?{Authorization:`Bearer ${s}`}:{}}))};function xy(n=Vo()){const e=un(n,"auth");if(e.isInitialized())return e.getImmediate();const t=b7(n,{popupRedirectResolver:cm,persistence:[d4,t4,Y2]}),r=h2("authTokenSyncURL");if(r&&typeof isSecureContext=="boolean"&&isSecureContext){const i=new URL(r,location.origin);if(location.origin===i.origin){const o=pm(i.toString());J7(t,o,()=>o(t.currentUser)),X7(t,c=>o(c))}}const s=c2("auth");return s&&O7(t,`http://${s}`),t}function mm(){return document.getElementsByTagName("head")?.[0]??document}g7({loadJS(n){return new Promise((e,t)=>{const r=document.createElement("script");r.setAttribute("src",n),r.onload=e,r.onerror=s=>{const i=nt("internal-error");i.customData=s,t(i)},r.type="text/javascript",r.charset="UTF-8",mm().appendChild(r)})},gapiScript:"https://apis.google.com/js/api.js",recaptchaV2Script:"https://www.google.com/recaptcha/api.js",recaptchaEnterpriseScript:"https://www.google.com/recaptcha/enterprise.js?render="});hm("Browser");var Sl=typeof globalThis<"u"?globalThis:typeof window<"u"?window:typeof global<"u"?global:typeof self<"u"?self:{};/** @license
Copyright The Closure Library Authors.
SPDX-License-Identifier: Apache-2.0
*/var bn,of;(function(){var n;/** @license

 Copyright The Closure Library Authors.
 SPDX-License-Identifier: Apache-2.0
*/function e(v,y){function I(){}I.prototype=y.prototype,v.F=y.prototype,v.prototype=new I,v.prototype.constructor=v,v.D=function(R,A,P){for(var E=Array(arguments.length-2),it=2;it<arguments.length;it++)E[it-2]=arguments[it];return y.prototype[A].apply(R,E)}}function t(){this.blockSize=-1}function r(){this.blockSize=-1,this.blockSize=64,this.g=Array(4),this.C=Array(this.blockSize),this.o=this.h=0,this.u()}e(r,t),r.prototype.u=function(){this.g[0]=1732584193,this.g[1]=4023233417,this.g[2]=2562383102,this.g[3]=271733878,this.o=this.h=0};function s(v,y,I){I||(I=0);const R=Array(16);if(typeof y=="string")for(var A=0;A<16;++A)R[A]=y.charCodeAt(I++)|y.charCodeAt(I++)<<8|y.charCodeAt(I++)<<16|y.charCodeAt(I++)<<24;else for(A=0;A<16;++A)R[A]=y[I++]|y[I++]<<8|y[I++]<<16|y[I++]<<24;y=v.g[0],I=v.g[1],A=v.g[2];let P=v.g[3],E;E=y+(P^I&(A^P))+R[0]+3614090360&4294967295,y=I+(E<<7&4294967295|E>>>25),E=P+(A^y&(I^A))+R[1]+3905402710&4294967295,P=y+(E<<12&4294967295|E>>>20),E=A+(I^P&(y^I))+R[2]+606105819&4294967295,A=P+(E<<17&4294967295|E>>>15),E=I+(y^A&(P^y))+R[3]+3250441966&4294967295,I=A+(E<<22&4294967295|E>>>10),E=y+(P^I&(A^P))+R[4]+4118548399&4294967295,y=I+(E<<7&4294967295|E>>>25),E=P+(A^y&(I^A))+R[5]+1200080426&4294967295,P=y+(E<<12&4294967295|E>>>20),E=A+(I^P&(y^I))+R[6]+2821735955&4294967295,A=P+(E<<17&4294967295|E>>>15),E=I+(y^A&(P^y))+R[7]+4249261313&4294967295,I=A+(E<<22&4294967295|E>>>10),E=y+(P^I&(A^P))+R[8]+1770035416&4294967295,y=I+(E<<7&4294967295|E>>>25),E=P+(A^y&(I^A))+R[9]+2336552879&4294967295,P=y+(E<<12&4294967295|E>>>20),E=A+(I^P&(y^I))+R[10]+4294925233&4294967295,A=P+(E<<17&4294967295|E>>>15),E=I+(y^A&(P^y))+R[11]+2304563134&4294967295,I=A+(E<<22&4294967295|E>>>10),E=y+(P^I&(A^P))+R[12]+1804603682&4294967295,y=I+(E<<7&4294967295|E>>>25),E=P+(A^y&(I^A))+R[13]+4254626195&4294967295,P=y+(E<<12&4294967295|E>>>20),E=A+(I^P&(y^I))+R[14]+2792965006&4294967295,A=P+(E<<17&4294967295|E>>>15),E=I+(y^A&(P^y))+R[15]+1236535329&4294967295,I=A+(E<<22&4294967295|E>>>10),E=y+(A^P&(I^A))+R[1]+4129170786&4294967295,y=I+(E<<5&4294967295|E>>>27),E=P+(I^A&(y^I))+R[6]+3225465664&4294967295,P=y+(E<<9&4294967295|E>>>23),E=A+(y^I&(P^y))+R[11]+643717713&4294967295,A=P+(E<<14&4294967295|E>>>18),E=I+(P^y&(A^P))+R[0]+3921069994&4294967295,I=A+(E<<20&4294967295|E>>>12),E=y+(A^P&(I^A))+R[5]+3593408605&4294967295,y=I+(E<<5&4294967295|E>>>27),E=P+(I^A&(y^I))+R[10]+38016083&4294967295,P=y+(E<<9&4294967295|E>>>23),E=A+(y^I&(P^y))+R[15]+3634488961&4294967295,A=P+(E<<14&4294967295|E>>>18),E=I+(P^y&(A^P))+R[4]+3889429448&4294967295,I=A+(E<<20&4294967295|E>>>12),E=y+(A^P&(I^A))+R[9]+568446438&4294967295,y=I+(E<<5&4294967295|E>>>27),E=P+(I^A&(y^I))+R[14]+3275163606&4294967295,P=y+(E<<9&4294967295|E>>>23),E=A+(y^I&(P^y))+R[3]+4107603335&4294967295,A=P+(E<<14&4294967295|E>>>18),E=I+(P^y&(A^P))+R[8]+1163531501&4294967295,I=A+(E<<20&4294967295|E>>>12),E=y+(A^P&(I^A))+R[13]+2850285829&4294967295,y=I+(E<<5&4294967295|E>>>27),E=P+(I^A&(y^I))+R[2]+4243563512&4294967295,P=y+(E<<9&4294967295|E>>>23),E=A+(y^I&(P^y))+R[7]+1735328473&4294967295,A=P+(E<<14&4294967295|E>>>18),E=I+(P^y&(A^P))+R[12]+2368359562&4294967295,I=A+(E<<20&4294967295|E>>>12),E=y+(I^A^P)+R[5]+4294588738&4294967295,y=I+(E<<4&4294967295|E>>>28),E=P+(y^I^A)+R[8]+2272392833&4294967295,P=y+(E<<11&4294967295|E>>>21),E=A+(P^y^I)+R[11]+1839030562&4294967295,A=P+(E<<16&4294967295|E>>>16),E=I+(A^P^y)+R[14]+4259657740&4294967295,I=A+(E<<23&4294967295|E>>>9),E=y+(I^A^P)+R[1]+2763975236&4294967295,y=I+(E<<4&4294967295|E>>>28),E=P+(y^I^A)+R[4]+1272893353&4294967295,P=y+(E<<11&4294967295|E>>>21),E=A+(P^y^I)+R[7]+4139469664&4294967295,A=P+(E<<16&4294967295|E>>>16),E=I+(A^P^y)+R[10]+3200236656&4294967295,I=A+(E<<23&4294967295|E>>>9),E=y+(I^A^P)+R[13]+681279174&4294967295,y=I+(E<<4&4294967295|E>>>28),E=P+(y^I^A)+R[0]+3936430074&4294967295,P=y+(E<<11&4294967295|E>>>21),E=A+(P^y^I)+R[3]+3572445317&4294967295,A=P+(E<<16&4294967295|E>>>16),E=I+(A^P^y)+R[6]+76029189&4294967295,I=A+(E<<23&4294967295|E>>>9),E=y+(I^A^P)+R[9]+3654602809&4294967295,y=I+(E<<4&4294967295|E>>>28),E=P+(y^I^A)+R[12]+3873151461&4294967295,P=y+(E<<11&4294967295|E>>>21),E=A+(P^y^I)+R[15]+530742520&4294967295,A=P+(E<<16&4294967295|E>>>16),E=I+(A^P^y)+R[2]+3299628645&4294967295,I=A+(E<<23&4294967295|E>>>9),E=y+(A^(I|~P))+R[0]+4096336452&4294967295,y=I+(E<<6&4294967295|E>>>26),E=P+(I^(y|~A))+R[7]+1126891415&4294967295,P=y+(E<<10&4294967295|E>>>22),E=A+(y^(P|~I))+R[14]+2878612391&4294967295,A=P+(E<<15&4294967295|E>>>17),E=I+(P^(A|~y))+R[5]+4237533241&4294967295,I=A+(E<<21&4294967295|E>>>11),E=y+(A^(I|~P))+R[12]+1700485571&4294967295,y=I+(E<<6&4294967295|E>>>26),E=P+(I^(y|~A))+R[3]+2399980690&4294967295,P=y+(E<<10&4294967295|E>>>22),E=A+(y^(P|~I))+R[10]+4293915773&4294967295,A=P+(E<<15&4294967295|E>>>17),E=I+(P^(A|~y))+R[1]+2240044497&4294967295,I=A+(E<<21&4294967295|E>>>11),E=y+(A^(I|~P))+R[8]+1873313359&4294967295,y=I+(E<<6&4294967295|E>>>26),E=P+(I^(y|~A))+R[15]+4264355552&4294967295,P=y+(E<<10&4294967295|E>>>22),E=A+(y^(P|~I))+R[6]+2734768916&4294967295,A=P+(E<<15&4294967295|E>>>17),E=I+(P^(A|~y))+R[13]+1309151649&4294967295,I=A+(E<<21&4294967295|E>>>11),E=y+(A^(I|~P))+R[4]+4149444226&4294967295,y=I+(E<<6&4294967295|E>>>26),E=P+(I^(y|~A))+R[11]+3174756917&4294967295,P=y+(E<<10&4294967295|E>>>22),E=A+(y^(P|~I))+R[2]+718787259&4294967295,A=P+(E<<15&4294967295|E>>>17),E=I+(P^(A|~y))+R[9]+3951481745&4294967295,v.g[0]=v.g[0]+y&4294967295,v.g[1]=v.g[1]+(A+(E<<21&4294967295|E>>>11))&4294967295,v.g[2]=v.g[2]+A&4294967295,v.g[3]=v.g[3]+P&4294967295}r.prototype.v=function(v,y){y===void 0&&(y=v.length);const I=y-this.blockSize,R=this.C;let A=this.h,P=0;for(;P<y;){if(A==0)for(;P<=I;)s(this,v,P),P+=this.blockSize;if(typeof v=="string"){for(;P<y;)if(R[A++]=v.charCodeAt(P++),A==this.blockSize){s(this,R),A=0;break}}else for(;P<y;)if(R[A++]=v[P++],A==this.blockSize){s(this,R),A=0;break}}this.h=A,this.o+=y},r.prototype.A=function(){var v=Array((this.h<56?this.blockSize:this.blockSize*2)-this.h);v[0]=128;for(var y=1;y<v.length-8;++y)v[y]=0;y=this.o*8;for(var I=v.length-8;I<v.length;++I)v[I]=y&255,y/=256;for(this.v(v),v=Array(16),y=0,I=0;I<4;++I)for(let R=0;R<32;R+=8)v[y++]=this.g[I]>>>R&255;return v};function i(v,y){var I=c;return Object.prototype.hasOwnProperty.call(I,v)?I[v]:I[v]=y(v)}function o(v,y){this.h=y;const I=[];let R=!0;for(let A=v.length-1;A>=0;A--){const P=v[A]|0;R&&P==y||(I[A]=P,R=!1)}this.g=I}var c={};function u(v){return-128<=v&&v<128?i(v,function(y){return new o([y|0],y<0?-1:0)}):new o([v|0],v<0?-1:0)}function l(v){if(isNaN(v)||!isFinite(v))return g;if(v<0)return M(l(-v));const y=[];let I=1;for(let R=0;v>=I;R++)y[R]=v/I|0,I*=4294967296;return new o(y,0)}function p(v,y){if(v.length==0)throw Error("number format error: empty string");if(y=y||10,y<2||36<y)throw Error("radix out of range: "+y);if(v.charAt(0)=="-")return M(p(v.substring(1),y));if(v.indexOf("-")>=0)throw Error('number format error: interior "-" character');const I=l(Math.pow(y,8));let R=g;for(let P=0;P<v.length;P+=8){var A=Math.min(8,v.length-P);const E=parseInt(v.substring(P,P+A),y);A<8?(A=l(Math.pow(y,A)),R=R.j(A).add(l(E))):(R=R.j(I),R=R.add(l(E)))}return R}var g=u(0),T=u(1),b=u(16777216);n=o.prototype,n.m=function(){if(L(this))return-M(this).m();let v=0,y=1;for(let I=0;I<this.g.length;I++){const R=this.i(I);v+=(R>=0?R:4294967296+R)*y,y*=4294967296}return v},n.toString=function(v){if(v=v||10,v<2||36<v)throw Error("radix out of range: "+v);if(O(this))return"0";if(L(this))return"-"+M(this).toString(v);const y=l(Math.pow(v,6));var I=this;let R="";for(;;){const A=pe(I,y).g;I=Y(I,A.j(y));let P=((I.g.length>0?I.g[0]:I.h)>>>0).toString(v);if(I=A,O(I))return P+R;for(;P.length<6;)P="0"+P;R=P+R}},n.i=function(v){return v<0?0:v<this.g.length?this.g[v]:this.h};function O(v){if(v.h!=0)return!1;for(let y=0;y<v.g.length;y++)if(v.g[y]!=0)return!1;return!0}function L(v){return v.h==-1}n.l=function(v){return v=Y(this,v),L(v)?-1:O(v)?0:1};function M(v){const y=v.g.length,I=[];for(let R=0;R<y;R++)I[R]=~v.g[R];return new o(I,~v.h).add(T)}n.abs=function(){return L(this)?M(this):this},n.add=function(v){const y=Math.max(this.g.length,v.g.length),I=[];let R=0;for(let A=0;A<=y;A++){let P=R+(this.i(A)&65535)+(v.i(A)&65535),E=(P>>>16)+(this.i(A)>>>16)+(v.i(A)>>>16);R=E>>>16,P&=65535,E&=65535,I[A]=E<<16|P}return new o(I,I[I.length-1]&-2147483648?-1:0)};function Y(v,y){return v.add(M(y))}n.j=function(v){if(O(this)||O(v))return g;if(L(this))return L(v)?M(this).j(M(v)):M(M(this).j(v));if(L(v))return M(this.j(M(v)));if(this.l(b)<0&&v.l(b)<0)return l(this.m()*v.m());const y=this.g.length+v.g.length,I=[];for(var R=0;R<2*y;R++)I[R]=0;for(R=0;R<this.g.length;R++)for(let A=0;A<v.g.length;A++){const P=this.i(R)>>>16,E=this.i(R)&65535,it=v.i(A)>>>16,zn=v.i(A)&65535;I[2*R+2*A]+=E*zn,ce(I,2*R+2*A),I[2*R+2*A+1]+=P*zn,ce(I,2*R+2*A+1),I[2*R+2*A+1]+=E*it,ce(I,2*R+2*A+1),I[2*R+2*A+2]+=P*it,ce(I,2*R+2*A+2)}for(v=0;v<y;v++)I[v]=I[2*v+1]<<16|I[2*v];for(v=y;v<2*y;v++)I[v]=0;return new o(I,0)};function ce(v,y){for(;(v[y]&65535)!=v[y];)v[y+1]+=v[y]>>>16,v[y]&=65535,y++}function he(v,y){this.g=v,this.h=y}function pe(v,y){if(O(y))throw Error("division by zero");if(O(v))return new he(g,g);if(L(v))return y=pe(M(v),y),new he(M(y.g),M(y.h));if(L(y))return y=pe(v,M(y)),new he(M(y.g),y.h);if(v.g.length>30){if(L(v)||L(y))throw Error("slowDivide_ only works with positive integers.");for(var I=T,R=y;R.l(v)<=0;)I=Be(I),R=Be(R);var A=we(I,1),P=we(R,1);for(R=we(R,2),I=we(I,2);!O(R);){var E=P.add(R);E.l(v)<=0&&(A=A.add(I),P=E),R=we(R,1),I=we(I,1)}return y=Y(v,A.j(y)),new he(A,y)}for(A=g;v.l(y)>=0;){for(I=Math.max(1,Math.floor(v.m()/y.m())),R=Math.ceil(Math.log(I)/Math.LN2),R=R<=48?1:Math.pow(2,R-48),P=l(I),E=P.j(y);L(E)||E.l(v)>0;)I-=R,P=l(I),E=P.j(y);O(P)&&(P=T),A=A.add(P),v=Y(v,E)}return new he(A,v)}n.B=function(v){return pe(this,v).h},n.and=function(v){const y=Math.max(this.g.length,v.g.length),I=[];for(let R=0;R<y;R++)I[R]=this.i(R)&v.i(R);return new o(I,this.h&v.h)},n.or=function(v){const y=Math.max(this.g.length,v.g.length),I=[];for(let R=0;R<y;R++)I[R]=this.i(R)|v.i(R);return new o(I,this.h|v.h)},n.xor=function(v){const y=Math.max(this.g.length,v.g.length),I=[];for(let R=0;R<y;R++)I[R]=this.i(R)^v.i(R);return new o(I,this.h^v.h)};function Be(v){const y=v.g.length+1,I=[];for(let R=0;R<y;R++)I[R]=v.i(R)<<1|v.i(R-1)>>>31;return new o(I,v.h)}function we(v,y){const I=y>>5;y%=32;const R=v.g.length-I,A=[];for(let P=0;P<R;P++)A[P]=y>0?v.i(P+I)>>>y|v.i(P+I+1)<<32-y:v.i(P+I);return new o(A,v.h)}r.prototype.digest=r.prototype.A,r.prototype.reset=r.prototype.u,r.prototype.update=r.prototype.v,of=r,o.prototype.add=o.prototype.add,o.prototype.multiply=o.prototype.j,o.prototype.modulo=o.prototype.B,o.prototype.compare=o.prototype.l,o.prototype.toNumber=o.prototype.m,o.prototype.toString=o.prototype.toString,o.prototype.getBits=o.prototype.i,o.fromNumber=l,o.fromString=p,bn=o}).apply(typeof Sl<"u"?Sl:typeof self<"u"?self:typeof window<"u"?window:{});var Mi=typeof globalThis<"u"?globalThis:typeof window<"u"?window:typeof global<"u"?global:typeof self<"u"?self:{};/** @license
Copyright The Closure Library Authors.
SPDX-License-Identifier: Apache-2.0
*/var af,Is,cf,Qi,hc,uf,lf,hf;(function(){var n,e=Object.defineProperty;function t(a){a=[typeof globalThis=="object"&&globalThis,a,typeof window=="object"&&window,typeof self=="object"&&self,typeof Mi=="object"&&Mi];for(var h=0;h<a.length;++h){var f=a[h];if(f&&f.Math==Math)return f}throw Error("Cannot find global object")}var r=t(this);function s(a,h){if(h)e:{var f=r;a=a.split(".");for(var m=0;m<a.length-1;m++){var C=a[m];if(!(C in f))break e;f=f[C]}a=a[a.length-1],m=f[a],h=h(m),h!=m&&h!=null&&e(f,a,{configurable:!0,writable:!0,value:h})}}s("Symbol.dispose",function(a){return a||Symbol("Symbol.dispose")}),s("Array.prototype.values",function(a){return a||function(){return this[Symbol.iterator]()}}),s("Object.entries",function(a){return a||function(h){var f=[],m;for(m in h)Object.prototype.hasOwnProperty.call(h,m)&&f.push([m,h[m]]);return f}});/** @license

 Copyright The Closure Library Authors.
 SPDX-License-Identifier: Apache-2.0
*/var i=i||{},o=this||self;function c(a){var h=typeof a;return h=="object"&&a!=null||h=="function"}function u(a,h,f){return a.call.apply(a.bind,arguments)}function l(a,h,f){return l=u,l.apply(null,arguments)}function p(a,h){var f=Array.prototype.slice.call(arguments,1);return function(){var m=f.slice();return m.push.apply(m,arguments),a.apply(this,m)}}function g(a,h){function f(){}f.prototype=h.prototype,a.Z=h.prototype,a.prototype=new f,a.prototype.constructor=a,a.Ob=function(m,C,N){for(var B=Array(arguments.length-2),ne=2;ne<arguments.length;ne++)B[ne-2]=arguments[ne];return h.prototype[C].apply(m,B)}}var T=typeof AsyncContext<"u"&&typeof AsyncContext.Snapshot=="function"?a=>a&&AsyncContext.Snapshot.wrap(a):a=>a;function b(a){const h=a.length;if(h>0){const f=Array(h);for(let m=0;m<h;m++)f[m]=a[m];return f}return[]}function O(a,h){for(let m=1;m<arguments.length;m++){const C=arguments[m];var f=typeof C;if(f=f!="object"?f:C?Array.isArray(C)?"array":f:"null",f=="array"||f=="object"&&typeof C.length=="number"){f=a.length||0;const N=C.length||0;a.length=f+N;for(let B=0;B<N;B++)a[f+B]=C[B]}else a.push(C)}}class L{constructor(h,f){this.i=h,this.j=f,this.h=0,this.g=null}get(){let h;return this.h>0?(this.h--,h=this.g,this.g=h.next,h.next=null):h=this.i(),h}}function M(a){o.setTimeout(()=>{throw a},0)}function Y(){var a=v;let h=null;return a.g&&(h=a.g,a.g=a.g.next,a.g||(a.h=null),h.next=null),h}class ce{constructor(){this.h=this.g=null}add(h,f){const m=he.get();m.set(h,f),this.h?this.h.next=m:this.g=m,this.h=m}}var he=new L(()=>new pe,a=>a.reset());class pe{constructor(){this.next=this.g=this.h=null}set(h,f){this.h=h,this.g=f,this.next=null}reset(){this.next=this.g=this.h=null}}let Be,we=!1,v=new ce,y=()=>{const a=Promise.resolve(void 0);Be=()=>{a.then(I)}};function I(){for(var a;a=Y();){try{a.h.call(a.g)}catch(f){M(f)}var h=he;h.j(a),h.h<100&&(h.h++,a.next=h.g,h.g=a)}we=!1}function R(){this.u=this.u,this.C=this.C}R.prototype.u=!1,R.prototype.dispose=function(){this.u||(this.u=!0,this.N())},R.prototype[Symbol.dispose]=function(){this.dispose()},R.prototype.N=function(){if(this.C)for(;this.C.length;)this.C.shift()()};function A(a,h){this.type=a,this.g=this.target=h,this.defaultPrevented=!1}A.prototype.h=function(){this.defaultPrevented=!0};var P=(function(){if(!o.addEventListener||!Object.defineProperty)return!1;var a=!1,h=Object.defineProperty({},"passive",{get:function(){a=!0}});try{const f=()=>{};o.addEventListener("test",f,h),o.removeEventListener("test",f,h)}catch{}return a})();function E(a){return/^[\s\xa0]*$/.test(a)}function it(a,h){A.call(this,a?a.type:""),this.relatedTarget=this.g=this.target=null,this.button=this.screenY=this.screenX=this.clientY=this.clientX=0,this.key="",this.metaKey=this.shiftKey=this.altKey=this.ctrlKey=!1,this.state=null,this.pointerId=0,this.pointerType="",this.i=null,a&&this.init(a,h)}g(it,A),it.prototype.init=function(a,h){const f=this.type=a.type,m=a.changedTouches&&a.changedTouches.length?a.changedTouches[0]:null;this.target=a.target||a.srcElement,this.g=h,h=a.relatedTarget,h||(f=="mouseover"?h=a.fromElement:f=="mouseout"&&(h=a.toElement)),this.relatedTarget=h,m?(this.clientX=m.clientX!==void 0?m.clientX:m.pageX,this.clientY=m.clientY!==void 0?m.clientY:m.pageY,this.screenX=m.screenX||0,this.screenY=m.screenY||0):(this.clientX=a.clientX!==void 0?a.clientX:a.pageX,this.clientY=a.clientY!==void 0?a.clientY:a.pageY,this.screenX=a.screenX||0,this.screenY=a.screenY||0),this.button=a.button,this.key=a.key||"",this.ctrlKey=a.ctrlKey,this.altKey=a.altKey,this.shiftKey=a.shiftKey,this.metaKey=a.metaKey,this.pointerId=a.pointerId||0,this.pointerType=a.pointerType,this.state=a.state,this.i=a,a.defaultPrevented&&it.Z.h.call(this)},it.prototype.h=function(){it.Z.h.call(this);const a=this.i;a.preventDefault?a.preventDefault():a.returnValue=!1};var zn="closure_listenable_"+(Math.random()*1e6|0),N6=0;function O6(a,h,f,m,C){this.listener=a,this.proxy=null,this.src=h,this.type=f,this.capture=!!m,this.ha=C,this.key=++N6,this.da=this.fa=!1}function Ti(a){a.da=!0,a.listener=null,a.proxy=null,a.src=null,a.ha=null}function wi(a,h,f){for(const m in a)h.call(f,a[m],m,a)}function k6(a,h){for(const f in a)h.call(void 0,a[f],f,a)}function z1(a){const h={};for(const f in a)h[f]=a[f];return h}const K1="constructor hasOwnProperty isPrototypeOf propertyIsEnumerable toLocaleString toString valueOf".split(" ");function Y1(a,h){let f,m;for(let C=1;C<arguments.length;C++){m=arguments[C];for(f in m)a[f]=m[f];for(let N=0;N<K1.length;N++)f=K1[N],Object.prototype.hasOwnProperty.call(m,f)&&(a[f]=m[f])}}function Ai(a){this.src=a,this.g={},this.h=0}Ai.prototype.add=function(a,h,f,m,C){const N=a.toString();a=this.g[N],a||(a=this.g[N]=[],this.h++);const B=pa(a,h,m,C);return B>-1?(h=a[B],f||(h.fa=!1)):(h=new O6(h,this.src,N,!!m,C),h.fa=f,a.push(h)),h};function da(a,h){const f=h.type;if(f in a.g){var m=a.g[f],C=Array.prototype.indexOf.call(m,h,void 0),N;(N=C>=0)&&Array.prototype.splice.call(m,C,1),N&&(Ti(h),a.g[f].length==0&&(delete a.g[f],a.h--))}}function pa(a,h,f,m){for(let C=0;C<a.length;++C){const N=a[C];if(!N.da&&N.listener==h&&N.capture==!!f&&N.ha==m)return C}return-1}var ma="closure_lm_"+(Math.random()*1e6|0),ga={};function Q1(a,h,f,m,C){if(Array.isArray(h)){for(let N=0;N<h.length;N++)Q1(a,h[N],f,m,C);return null}return f=Z1(f),a&&a[zn]?a.J(h,f,c(m)?!!m.capture:!1,C):D6(a,h,f,!1,m,C)}function D6(a,h,f,m,C,N){if(!h)throw Error("Invalid event type");const B=c(C)?!!C.capture:!!C;let ne=ya(a);if(ne||(a[ma]=ne=new Ai(a)),f=ne.add(h,f,m,B,N),f.proxy)return f;if(m=V6(),f.proxy=m,m.src=a,m.listener=f,a.addEventListener)P||(C=B),C===void 0&&(C=!1),a.addEventListener(h.toString(),m,C);else if(a.attachEvent)a.attachEvent(J1(h.toString()),m);else if(a.addListener&&a.removeListener)a.addListener(m);else throw Error("addEventListener and attachEvent are unavailable.");return f}function V6(){function a(f){return h.call(a.src,a.listener,f)}const h=x6;return a}function X1(a,h,f,m,C){if(Array.isArray(h))for(var N=0;N<h.length;N++)X1(a,h[N],f,m,C);else m=c(m)?!!m.capture:!!m,f=Z1(f),a&&a[zn]?(a=a.i,N=String(h).toString(),N in a.g&&(h=a.g[N],f=pa(h,f,m,C),f>-1&&(Ti(h[f]),Array.prototype.splice.call(h,f,1),h.length==0&&(delete a.g[N],a.h--)))):a&&(a=ya(a))&&(h=a.g[h.toString()],a=-1,h&&(a=pa(h,f,m,C)),(f=a>-1?h[a]:null)&&_a(f))}function _a(a){if(typeof a!="number"&&a&&!a.da){var h=a.src;if(h&&h[zn])da(h.i,a);else{var f=a.type,m=a.proxy;h.removeEventListener?h.removeEventListener(f,m,a.capture):h.detachEvent?h.detachEvent(J1(f),m):h.addListener&&h.removeListener&&h.removeListener(m),(f=ya(h))?(da(f,a),f.h==0&&(f.src=null,h[ma]=null)):Ti(a)}}}function J1(a){return a in ga?ga[a]:ga[a]="on"+a}function x6(a,h){if(a.da)a=!0;else{h=new it(h,this);const f=a.listener,m=a.ha||a.src;a.fa&&_a(a),a=f.call(m,h)}return a}function ya(a){return a=a[ma],a instanceof Ai?a:null}var Ea="__closure_events_fn_"+(Math.random()*1e9>>>0);function Z1(a){return typeof a=="function"?a:(a[Ea]||(a[Ea]=function(h){return a.handleEvent(h)}),a[Ea])}function $e(){R.call(this),this.i=new Ai(this),this.M=this,this.G=null}g($e,R),$e.prototype[zn]=!0,$e.prototype.removeEventListener=function(a,h,f,m){X1(this,a,h,f,m)};function Je(a,h){var f,m=a.G;if(m)for(f=[];m;m=m.G)f.push(m);if(a=a.M,m=h.type||h,typeof h=="string")h=new A(h,a);else if(h instanceof A)h.target=h.target||a;else{var C=h;h=new A(m,a),Y1(h,C)}C=!0;let N,B;if(f)for(B=f.length-1;B>=0;B--)N=h.g=f[B],C=vi(N,m,!0,h)&&C;if(N=h.g=a,C=vi(N,m,!0,h)&&C,C=vi(N,m,!1,h)&&C,f)for(B=0;B<f.length;B++)N=h.g=f[B],C=vi(N,m,!1,h)&&C}$e.prototype.N=function(){if($e.Z.N.call(this),this.i){var a=this.i;for(const h in a.g){const f=a.g[h];for(let m=0;m<f.length;m++)Ti(f[m]);delete a.g[h],a.h--}}this.G=null},$e.prototype.J=function(a,h,f,m){return this.i.add(String(a),h,!1,f,m)},$e.prototype.K=function(a,h,f,m){return this.i.add(String(a),h,!0,f,m)};function vi(a,h,f,m){if(h=a.i.g[String(h)],!h)return!0;h=h.concat();let C=!0;for(let N=0;N<h.length;++N){const B=h[N];if(B&&!B.da&&B.capture==f){const ne=B.listener,ke=B.ha||B.src;B.fa&&da(a.i,B),C=ne.call(ke,m)!==!1&&C}}return C&&!m.defaultPrevented}function L6(a,h){if(typeof a!="function")if(a&&typeof a.handleEvent=="function")a=l(a.handleEvent,a);else throw Error("Invalid listener argument");return Number(h)>2147483647?-1:o.setTimeout(a,h||0)}function eu(a){a.g=L6(()=>{a.g=null,a.i&&(a.i=!1,eu(a))},a.l);const h=a.h;a.h=null,a.m.apply(null,h)}class M6 extends R{constructor(h,f){super(),this.m=h,this.l=f,this.h=null,this.i=!1,this.g=null}j(h){this.h=arguments,this.g?this.i=!0:eu(this)}N(){super.N(),this.g&&(o.clearTimeout(this.g),this.g=null,this.i=!1,this.h=null)}}function Jr(a){R.call(this),this.h=a,this.g={}}g(Jr,R);var tu=[];function nu(a){wi(a.g,function(h,f){this.g.hasOwnProperty(f)&&_a(h)},a),a.g={}}Jr.prototype.N=function(){Jr.Z.N.call(this),nu(this)},Jr.prototype.handleEvent=function(){throw Error("EventHandler.handleEvent not implemented")};var Ia=o.JSON.stringify,F6=o.JSON.parse,U6=class{stringify(a){return o.JSON.stringify(a,void 0)}parse(a){return o.JSON.parse(a,void 0)}};function ru(){}function su(){}var Zr={OPEN:"a",hb:"b",ERROR:"c",tb:"d"};function Ta(){A.call(this,"d")}g(Ta,A);function wa(){A.call(this,"c")}g(wa,A);var Kn={},iu=null;function Ri(){return iu=iu||new $e}Kn.Ia="serverreachability";function ou(a){A.call(this,Kn.Ia,a)}g(ou,A);function es(a){const h=Ri();Je(h,new ou(h))}Kn.STAT_EVENT="statevent";function au(a,h){A.call(this,Kn.STAT_EVENT,a),this.stat=h}g(au,A);function Ze(a){const h=Ri();Je(h,new au(h,a))}Kn.Ja="timingevent";function cu(a,h){A.call(this,Kn.Ja,a),this.size=h}g(cu,A);function ts(a,h){if(typeof a!="function")throw Error("Fn must not be null and must be a function");return o.setTimeout(function(){a()},h)}function ns(){this.g=!0}ns.prototype.ua=function(){this.g=!1};function B6(a,h,f,m,C,N){a.info(function(){if(a.g)if(N){var B="",ne=N.split("&");for(let de=0;de<ne.length;de++){var ke=ne[de].split("=");if(ke.length>1){const xe=ke[0];ke=ke[1];const xt=xe.split("_");B=xt.length>=2&&xt[1]=="type"?B+(xe+"="+ke+"&"):B+(xe+"=redacted&")}}}else B=null;else B=N;return"XMLHTTP REQ ("+m+") [attempt "+C+"]: "+h+`
`+f+`
`+B})}function $6(a,h,f,m,C,N,B){a.info(function(){return"XMLHTTP RESP ("+m+") [ attempt "+C+"]: "+h+`
`+f+`
`+N+" "+B})}function _r(a,h,f,m){a.info(function(){return"XMLHTTP TEXT ("+h+"): "+H6(a,f)+(m?" "+m:"")})}function q6(a,h){a.info(function(){return"TIMEOUT: "+h})}ns.prototype.info=function(){};function H6(a,h){if(!a.g)return h;if(!h)return null;try{const N=JSON.parse(h);if(N){for(a=0;a<N.length;a++)if(Array.isArray(N[a])){var f=N[a];if(!(f.length<2)){var m=f[1];if(Array.isArray(m)&&!(m.length<1)){var C=m[0];if(C!="noop"&&C!="stop"&&C!="close")for(let B=1;B<m.length;B++)m[B]=""}}}}return Ia(N)}catch{return h}}var Ci={NO_ERROR:0,cb:1,qb:2,pb:3,kb:4,ob:5,rb:6,Ga:7,TIMEOUT:8,ub:9},uu={ib:"complete",Fb:"success",ERROR:"error",Ga:"abort",xb:"ready",yb:"readystatechange",TIMEOUT:"timeout",sb:"incrementaldata",wb:"progress",lb:"downloadprogress",Nb:"uploadprogress"},lu;function Aa(){}g(Aa,ru),Aa.prototype.g=function(){return new XMLHttpRequest},lu=new Aa;function rs(a){return encodeURIComponent(String(a))}function j6(a){var h=1;a=a.split(":");const f=[];for(;h>0&&a.length;)f.push(a.shift()),h--;return a.length&&f.push(a.join(":")),f}function hn(a,h,f,m){this.j=a,this.i=h,this.l=f,this.S=m||1,this.V=new Jr(this),this.H=45e3,this.J=null,this.o=!1,this.u=this.B=this.A=this.M=this.F=this.T=this.D=null,this.G=[],this.g=null,this.C=0,this.m=this.v=null,this.X=-1,this.K=!1,this.P=0,this.O=null,this.W=this.L=this.U=this.R=!1,this.h=new hu}function hu(){this.i=null,this.g="",this.h=!1}var fu={},va={};function Ra(a,h,f){a.M=1,a.A=Si(Vt(h)),a.u=f,a.R=!0,du(a,null)}function du(a,h){a.F=Date.now(),Pi(a),a.B=Vt(a.A);var f=a.B,m=a.S;Array.isArray(m)||(m=[String(m)]),Cu(f.i,"t",m),a.C=0,f=a.j.L,a.h=new hu,a.g=ju(a.j,f?h:null,!a.u),a.P>0&&(a.O=new M6(l(a.Y,a,a.g),a.P)),h=a.V,f=a.g,m=a.ba;var C="readystatechange";Array.isArray(C)||(C&&(tu[0]=C.toString()),C=tu);for(let N=0;N<C.length;N++){const B=Q1(f,C[N],m||h.handleEvent,!1,h.h||h);if(!B)break;h.g[B.key]=B}h=a.J?z1(a.J):{},a.u?(a.v||(a.v="POST"),h["Content-Type"]="application/x-www-form-urlencoded",a.g.ea(a.B,a.v,a.u,h)):(a.v="GET",a.g.ea(a.B,a.v,null,h)),es(),B6(a.i,a.v,a.B,a.l,a.S,a.u)}hn.prototype.ba=function(a){a=a.target;const h=this.O;h&&pn(a)==3?h.j():this.Y(a)},hn.prototype.Y=function(a){try{if(a==this.g)e:{const ne=pn(this.g),ke=this.g.ya(),de=this.g.ca();if(!(ne<3)&&(ne!=3||this.g&&(this.h.h||this.g.la()||Du(this.g)))){this.K||ne!=4||ke==7||(ke==8||de<=0?es(3):es(2)),Ca(this);var h=this.g.ca();this.X=h;var f=G6(this);if(this.o=h==200,$6(this.i,this.v,this.B,this.l,this.S,ne,h),this.o){if(this.U&&!this.L){t:{if(this.g){var m,C=this.g;if((m=C.g?C.g.getResponseHeader("X-HTTP-Initial-Response"):null)&&!E(m)){var N=m;break t}}N=null}if(a=N)_r(this.i,this.l,a,"Initial handshake response via X-HTTP-Initial-Response"),this.L=!0,Pa(this,a);else{this.o=!1,this.m=3,Ze(12),Yn(this),ss(this);break e}}if(this.R){a=!0;let xe;for(;!this.K&&this.C<f.length;)if(xe=W6(this,f),xe==va){ne==4&&(this.m=4,Ze(14),a=!1),_r(this.i,this.l,null,"[Incomplete Response]");break}else if(xe==fu){this.m=4,Ze(15),_r(this.i,this.l,f,"[Invalid Chunk]"),a=!1;break}else _r(this.i,this.l,xe,null),Pa(this,xe);if(pu(this)&&this.C!=0&&(this.h.g=this.h.g.slice(this.C),this.C=0),ne!=4||f.length!=0||this.h.h||(this.m=1,Ze(16),a=!1),this.o=this.o&&a,!a)_r(this.i,this.l,f,"[Invalid Chunked Response]"),Yn(this),ss(this);else if(f.length>0&&!this.W){this.W=!0;var B=this.j;B.g==this&&B.aa&&!B.P&&(B.j.info("Great, no buffering proxy detected. Bytes received: "+f.length),xa(B),B.P=!0,Ze(11))}}else _r(this.i,this.l,f,null),Pa(this,f);ne==4&&Yn(this),this.o&&!this.K&&(ne==4?Bu(this.j,this):(this.o=!1,Pi(this)))}else op(this.g),h==400&&f.indexOf("Unknown SID")>0?(this.m=3,Ze(12)):(this.m=0,Ze(13)),Yn(this),ss(this)}}}catch{}finally{}};function G6(a){if(!pu(a))return a.g.la();const h=Du(a.g);if(h==="")return"";let f="";const m=h.length,C=pn(a.g)==4;if(!a.h.i){if(typeof TextDecoder>"u")return Yn(a),ss(a),"";a.h.i=new o.TextDecoder}for(let N=0;N<m;N++)a.h.h=!0,f+=a.h.i.decode(h[N],{stream:!(C&&N==m-1)});return h.length=0,a.h.g+=f,a.C=0,a.h.g}function pu(a){return a.g?a.v=="GET"&&a.M!=2&&a.j.Aa:!1}function W6(a,h){var f=a.C,m=h.indexOf(`
`,f);return m==-1?va:(f=Number(h.substring(f,m)),isNaN(f)?fu:(m+=1,m+f>h.length?va:(h=h.slice(m,m+f),a.C=m+f,h)))}hn.prototype.cancel=function(){this.K=!0,Yn(this)};function Pi(a){a.T=Date.now()+a.H,mu(a,a.H)}function mu(a,h){if(a.D!=null)throw Error("WatchDog timer not null");a.D=ts(l(a.aa,a),h)}function Ca(a){a.D&&(o.clearTimeout(a.D),a.D=null)}hn.prototype.aa=function(){this.D=null;const a=Date.now();a-this.T>=0?(q6(this.i,this.B),this.M!=2&&(es(),Ze(17)),Yn(this),this.m=2,ss(this)):mu(this,this.T-a)};function ss(a){a.j.I==0||a.K||Bu(a.j,a)}function Yn(a){Ca(a);var h=a.O;h&&typeof h.dispose=="function"&&h.dispose(),a.O=null,nu(a.V),a.g&&(h=a.g,a.g=null,h.abort(),h.dispose())}function Pa(a,h){try{var f=a.j;if(f.I!=0&&(f.g==a||Sa(f.h,a))){if(!a.L&&Sa(f.h,a)&&f.I==3){try{var m=f.Ba.g.parse(h)}catch{m=null}if(Array.isArray(m)&&m.length==3){var C=m;if(C[0]==0){e:if(!f.v){if(f.g)if(f.g.F+3e3<a.F)Di(f),Oi(f);else break e;Va(f),Ze(18)}}else f.xa=C[1],0<f.xa-f.K&&C[2]<37500&&f.F&&f.A==0&&!f.C&&(f.C=ts(l(f.Va,f),6e3));yu(f.h)<=1&&f.ta&&(f.ta=void 0)}else Xn(f,11)}else if((a.L||f.g==a)&&Di(f),!E(h))for(C=f.Ba.g.parse(h),h=0;h<C.length;h++){let de=C[h];const xe=de[0];if(!(xe<=f.K))if(f.K=xe,de=de[1],f.I==2)if(de[0]=="c"){f.M=de[1],f.ba=de[2];const xt=de[3];xt!=null&&(f.ka=xt,f.j.info("VER="+f.ka));const Jn=de[4];Jn!=null&&(f.za=Jn,f.j.info("SVER="+f.za));const mn=de[5];mn!=null&&typeof mn=="number"&&mn>0&&(m=1.5*mn,f.O=m,f.j.info("backChannelRequestTimeoutMs_="+m)),m=f;const gn=a.g;if(gn){const xi=gn.g?gn.g.getResponseHeader("X-Client-Wire-Protocol"):null;if(xi){var N=m.h;N.g||xi.indexOf("spdy")==-1&&xi.indexOf("quic")==-1&&xi.indexOf("h2")==-1||(N.j=N.l,N.g=new Set,N.h&&(ba(N,N.h),N.h=null))}if(m.G){const La=gn.g?gn.g.getResponseHeader("X-HTTP-Session-Id"):null;La&&(m.wa=La,me(m.J,m.G,La))}}f.I=3,f.l&&f.l.ra(),f.aa&&(f.T=Date.now()-a.F,f.j.info("Handshake RTT: "+f.T+"ms")),m=f;var B=a;if(m.na=Hu(m,m.L?m.ba:null,m.W),B.L){Eu(m.h,B);var ne=B,ke=m.O;ke&&(ne.H=ke),ne.D&&(Ca(ne),Pi(ne)),m.g=B}else Fu(m);f.i.length>0&&ki(f)}else de[0]!="stop"&&de[0]!="close"||Xn(f,7);else f.I==3&&(de[0]=="stop"||de[0]=="close"?de[0]=="stop"?Xn(f,7):Da(f):de[0]!="noop"&&f.l&&f.l.qa(de),f.A=0)}}es(4)}catch{}}var z6=class{constructor(a,h){this.g=a,this.map=h}};function gu(a){this.l=a||10,o.PerformanceNavigationTiming?(a=o.performance.getEntriesByType("navigation"),a=a.length>0&&(a[0].nextHopProtocol=="hq"||a[0].nextHopProtocol=="h2")):a=!!(o.chrome&&o.chrome.loadTimes&&o.chrome.loadTimes()&&o.chrome.loadTimes().wasFetchedViaSpdy),this.j=a?this.l:1,this.g=null,this.j>1&&(this.g=new Set),this.h=null,this.i=[]}function _u(a){return a.h?!0:a.g?a.g.size>=a.j:!1}function yu(a){return a.h?1:a.g?a.g.size:0}function Sa(a,h){return a.h?a.h==h:a.g?a.g.has(h):!1}function ba(a,h){a.g?a.g.add(h):a.h=h}function Eu(a,h){a.h&&a.h==h?a.h=null:a.g&&a.g.has(h)&&a.g.delete(h)}gu.prototype.cancel=function(){if(this.i=Iu(this),this.h)this.h.cancel(),this.h=null;else if(this.g&&this.g.size!==0){for(const a of this.g.values())a.cancel();this.g.clear()}};function Iu(a){if(a.h!=null)return a.i.concat(a.h.G);if(a.g!=null&&a.g.size!==0){let h=a.i;for(const f of a.g.values())h=h.concat(f.G);return h}return b(a.i)}var Tu=RegExp("^(?:([^:/?#.]+):)?(?://(?:([^\\\\/?#]*)@)?([^\\\\/?#]*?)(?::([0-9]+))?(?=[\\\\/?#]|$))?([^?#]+)?(?:\\?([^#]*))?(?:#([\\s\\S]*))?$");function K6(a,h){if(a){a=a.split("&");for(let f=0;f<a.length;f++){const m=a[f].indexOf("=");let C,N=null;m>=0?(C=a[f].substring(0,m),N=a[f].substring(m+1)):C=a[f],h(C,N?decodeURIComponent(N.replace(/\+/g," ")):"")}}}function fn(a){this.g=this.o=this.j="",this.u=null,this.m=this.h="",this.l=!1;let h;a instanceof fn?(this.l=a.l,is(this,a.j),this.o=a.o,this.g=a.g,os(this,a.u),this.h=a.h,Na(this,Pu(a.i)),this.m=a.m):a&&(h=String(a).match(Tu))?(this.l=!1,is(this,h[1]||"",!0),this.o=as(h[2]||""),this.g=as(h[3]||"",!0),os(this,h[4]),this.h=as(h[5]||"",!0),Na(this,h[6]||"",!0),this.m=as(h[7]||"")):(this.l=!1,this.i=new us(null,this.l))}fn.prototype.toString=function(){const a=[];var h=this.j;h&&a.push(cs(h,wu,!0),":");var f=this.g;return(f||h=="file")&&(a.push("//"),(h=this.o)&&a.push(cs(h,wu,!0),"@"),a.push(rs(f).replace(/%25([0-9a-fA-F]{2})/g,"%$1")),f=this.u,f!=null&&a.push(":",String(f))),(f=this.h)&&(this.g&&f.charAt(0)!="/"&&a.push("/"),a.push(cs(f,f.charAt(0)=="/"?X6:Q6,!0))),(f=this.i.toString())&&a.push("?",f),(f=this.m)&&a.push("#",cs(f,Z6)),a.join("")},fn.prototype.resolve=function(a){const h=Vt(this);let f=!!a.j;f?is(h,a.j):f=!!a.o,f?h.o=a.o:f=!!a.g,f?h.g=a.g:f=a.u!=null;var m=a.h;if(f)os(h,a.u);else if(f=!!a.h){if(m.charAt(0)!="/")if(this.g&&!this.h)m="/"+m;else{var C=h.h.lastIndexOf("/");C!=-1&&(m=h.h.slice(0,C+1)+m)}if(C=m,C==".."||C==".")m="";else if(C.indexOf("./")!=-1||C.indexOf("/.")!=-1){m=C.lastIndexOf("/",0)==0,C=C.split("/");const N=[];for(let B=0;B<C.length;){const ne=C[B++];ne=="."?m&&B==C.length&&N.push(""):ne==".."?((N.length>1||N.length==1&&N[0]!="")&&N.pop(),m&&B==C.length&&N.push("")):(N.push(ne),m=!0)}m=N.join("/")}else m=C}return f?h.h=m:f=a.i.toString()!=="",f?Na(h,Pu(a.i)):f=!!a.m,f&&(h.m=a.m),h};function Vt(a){return new fn(a)}function is(a,h,f){a.j=f?as(h,!0):h,a.j&&(a.j=a.j.replace(/:$/,""))}function os(a,h){if(h){if(h=Number(h),isNaN(h)||h<0)throw Error("Bad port number "+h);a.u=h}else a.u=null}function Na(a,h,f){h instanceof us?(a.i=h,ep(a.i,a.l)):(f||(h=cs(h,J6)),a.i=new us(h,a.l))}function me(a,h,f){a.i.set(h,f)}function Si(a){return me(a,"zx",Math.floor(Math.random()*2147483648).toString(36)+Math.abs(Math.floor(Math.random()*2147483648)^Date.now()).toString(36)),a}function as(a,h){return a?h?decodeURI(a.replace(/%25/g,"%2525")):decodeURIComponent(a):""}function cs(a,h,f){return typeof a=="string"?(a=encodeURI(a).replace(h,Y6),f&&(a=a.replace(/%25([0-9a-fA-F]{2})/g,"%$1")),a):null}function Y6(a){return a=a.charCodeAt(0),"%"+(a>>4&15).toString(16)+(a&15).toString(16)}var wu=/[#\/\?@]/g,Q6=/[#\?:]/g,X6=/[#\?]/g,J6=/[#\?@]/g,Z6=/#/g;function us(a,h){this.h=this.g=null,this.i=a||null,this.j=!!h}function Qn(a){a.g||(a.g=new Map,a.h=0,a.i&&K6(a.i,function(h,f){a.add(decodeURIComponent(h.replace(/\+/g," ")),f)}))}n=us.prototype,n.add=function(a,h){Qn(this),this.i=null,a=yr(this,a);let f=this.g.get(a);return f||this.g.set(a,f=[]),f.push(h),this.h+=1,this};function Au(a,h){Qn(a),h=yr(a,h),a.g.has(h)&&(a.i=null,a.h-=a.g.get(h).length,a.g.delete(h))}function vu(a,h){return Qn(a),h=yr(a,h),a.g.has(h)}n.forEach=function(a,h){Qn(this),this.g.forEach(function(f,m){f.forEach(function(C){a.call(h,C,m,this)},this)},this)};function Ru(a,h){Qn(a);let f=[];if(typeof h=="string")vu(a,h)&&(f=f.concat(a.g.get(yr(a,h))));else for(a=Array.from(a.g.values()),h=0;h<a.length;h++)f=f.concat(a[h]);return f}n.set=function(a,h){return Qn(this),this.i=null,a=yr(this,a),vu(this,a)&&(this.h-=this.g.get(a).length),this.g.set(a,[h]),this.h+=1,this},n.get=function(a,h){return a?(a=Ru(this,a),a.length>0?String(a[0]):h):h};function Cu(a,h,f){Au(a,h),f.length>0&&(a.i=null,a.g.set(yr(a,h),b(f)),a.h+=f.length)}n.toString=function(){if(this.i)return this.i;if(!this.g)return"";const a=[],h=Array.from(this.g.keys());for(let m=0;m<h.length;m++){var f=h[m];const C=rs(f);f=Ru(this,f);for(let N=0;N<f.length;N++){let B=C;f[N]!==""&&(B+="="+rs(f[N])),a.push(B)}}return this.i=a.join("&")};function Pu(a){const h=new us;return h.i=a.i,a.g&&(h.g=new Map(a.g),h.h=a.h),h}function yr(a,h){return h=String(h),a.j&&(h=h.toLowerCase()),h}function ep(a,h){h&&!a.j&&(Qn(a),a.i=null,a.g.forEach(function(f,m){const C=m.toLowerCase();m!=C&&(Au(this,m),Cu(this,C,f))},a)),a.j=h}function tp(a,h){const f=new ns;if(o.Image){const m=new Image;m.onload=p(dn,f,"TestLoadImage: loaded",!0,h,m),m.onerror=p(dn,f,"TestLoadImage: error",!1,h,m),m.onabort=p(dn,f,"TestLoadImage: abort",!1,h,m),m.ontimeout=p(dn,f,"TestLoadImage: timeout",!1,h,m),o.setTimeout(function(){m.ontimeout&&m.ontimeout()},1e4),m.src=a}else h(!1)}function np(a,h){const f=new ns,m=new AbortController,C=setTimeout(()=>{m.abort(),dn(f,"TestPingServer: timeout",!1,h)},1e4);fetch(a,{signal:m.signal}).then(N=>{clearTimeout(C),N.ok?dn(f,"TestPingServer: ok",!0,h):dn(f,"TestPingServer: server error",!1,h)}).catch(()=>{clearTimeout(C),dn(f,"TestPingServer: error",!1,h)})}function dn(a,h,f,m,C){try{C&&(C.onload=null,C.onerror=null,C.onabort=null,C.ontimeout=null),m(f)}catch{}}function rp(){this.g=new U6}function Oa(a){this.i=a.Sb||null,this.h=a.ab||!1}g(Oa,ru),Oa.prototype.g=function(){return new bi(this.i,this.h)};function bi(a,h){$e.call(this),this.H=a,this.o=h,this.m=void 0,this.status=this.readyState=0,this.responseType=this.responseText=this.response=this.statusText="",this.onreadystatechange=null,this.A=new Headers,this.h=null,this.F="GET",this.D="",this.g=!1,this.B=this.j=this.l=null,this.v=new AbortController}g(bi,$e),n=bi.prototype,n.open=function(a,h){if(this.readyState!=0)throw this.abort(),Error("Error reopening a connection");this.F=a,this.D=h,this.readyState=1,hs(this)},n.send=function(a){if(this.readyState!=1)throw this.abort(),Error("need to call open() first. ");if(this.v.signal.aborted)throw this.abort(),Error("Request was aborted.");this.g=!0;const h={headers:this.A,method:this.F,credentials:this.m,cache:void 0,signal:this.v.signal};a&&(h.body=a),(this.H||o).fetch(new Request(this.D,h)).then(this.Pa.bind(this),this.ga.bind(this))},n.abort=function(){this.response=this.responseText="",this.A=new Headers,this.status=0,this.v.abort(),this.j&&this.j.cancel("Request was aborted.").catch(()=>{}),this.readyState>=1&&this.g&&this.readyState!=4&&(this.g=!1,ls(this)),this.readyState=0},n.Pa=function(a){if(this.g&&(this.l=a,this.h||(this.status=this.l.status,this.statusText=this.l.statusText,this.h=a.headers,this.readyState=2,hs(this)),this.g&&(this.readyState=3,hs(this),this.g)))if(this.responseType==="arraybuffer")a.arrayBuffer().then(this.Na.bind(this),this.ga.bind(this));else if(typeof o.ReadableStream<"u"&&"body"in a){if(this.j=a.body.getReader(),this.o){if(this.responseType)throw Error('responseType must be empty for "streamBinaryChunks" mode responses.');this.response=[]}else this.response=this.responseText="",this.B=new TextDecoder;Su(this)}else a.text().then(this.Oa.bind(this),this.ga.bind(this))};function Su(a){a.j.read().then(a.Ma.bind(a)).catch(a.ga.bind(a))}n.Ma=function(a){if(this.g){if(this.o&&a.value)this.response.push(a.value);else if(!this.o){var h=a.value?a.value:new Uint8Array(0);(h=this.B.decode(h,{stream:!a.done}))&&(this.response=this.responseText+=h)}a.done?ls(this):hs(this),this.readyState==3&&Su(this)}},n.Oa=function(a){this.g&&(this.response=this.responseText=a,ls(this))},n.Na=function(a){this.g&&(this.response=a,ls(this))},n.ga=function(){this.g&&ls(this)};function ls(a){a.readyState=4,a.l=null,a.j=null,a.B=null,hs(a)}n.setRequestHeader=function(a,h){this.A.append(a,h)},n.getResponseHeader=function(a){return this.h&&this.h.get(a.toLowerCase())||""},n.getAllResponseHeaders=function(){if(!this.h)return"";const a=[],h=this.h.entries();for(var f=h.next();!f.done;)f=f.value,a.push(f[0]+": "+f[1]),f=h.next();return a.join(`\r
`)};function hs(a){a.onreadystatechange&&a.onreadystatechange.call(a)}Object.defineProperty(bi.prototype,"withCredentials",{get:function(){return this.m==="include"},set:function(a){this.m=a?"include":"same-origin"}});function bu(a){let h="";return wi(a,function(f,m){h+=m,h+=":",h+=f,h+=`\r
`}),h}function ka(a,h,f){e:{for(m in f){var m=!1;break e}m=!0}m||(f=bu(f),typeof a=="string"?f!=null&&rs(f):me(a,h,f))}function Te(a){$e.call(this),this.headers=new Map,this.L=a||null,this.h=!1,this.g=null,this.D="",this.o=0,this.l="",this.j=this.B=this.v=this.A=!1,this.m=null,this.F="",this.H=!1}g(Te,$e);var sp=/^https?$/i,ip=["POST","PUT"];n=Te.prototype,n.Fa=function(a){this.H=a},n.ea=function(a,h,f,m){if(this.g)throw Error("[goog.net.XhrIo] Object is active with another request="+this.D+"; newUri="+a);h=h?h.toUpperCase():"GET",this.D=a,this.l="",this.o=0,this.A=!1,this.h=!0,this.g=this.L?this.L.g():lu.g(),this.g.onreadystatechange=T(l(this.Ca,this));try{this.B=!0,this.g.open(h,String(a),!0),this.B=!1}catch(N){Nu(this,N);return}if(a=f||"",f=new Map(this.headers),m)if(Object.getPrototypeOf(m)===Object.prototype)for(var C in m)f.set(C,m[C]);else if(typeof m.keys=="function"&&typeof m.get=="function")for(const N of m.keys())f.set(N,m.get(N));else throw Error("Unknown input type for opt_headers: "+String(m));m=Array.from(f.keys()).find(N=>N.toLowerCase()=="content-type"),C=o.FormData&&a instanceof o.FormData,!(Array.prototype.indexOf.call(ip,h,void 0)>=0)||m||C||f.set("Content-Type","application/x-www-form-urlencoded;charset=utf-8");for(const[N,B]of f)this.g.setRequestHeader(N,B);this.F&&(this.g.responseType=this.F),"withCredentials"in this.g&&this.g.withCredentials!==this.H&&(this.g.withCredentials=this.H);try{this.m&&(clearTimeout(this.m),this.m=null),this.v=!0,this.g.send(a),this.v=!1}catch(N){Nu(this,N)}};function Nu(a,h){a.h=!1,a.g&&(a.j=!0,a.g.abort(),a.j=!1),a.l=h,a.o=5,Ou(a),Ni(a)}function Ou(a){a.A||(a.A=!0,Je(a,"complete"),Je(a,"error"))}n.abort=function(a){this.g&&this.h&&(this.h=!1,this.j=!0,this.g.abort(),this.j=!1,this.o=a||7,Je(this,"complete"),Je(this,"abort"),Ni(this))},n.N=function(){this.g&&(this.h&&(this.h=!1,this.j=!0,this.g.abort(),this.j=!1),Ni(this,!0)),Te.Z.N.call(this)},n.Ca=function(){this.u||(this.B||this.v||this.j?ku(this):this.Xa())},n.Xa=function(){ku(this)};function ku(a){if(a.h&&typeof i<"u"){if(a.v&&pn(a)==4)setTimeout(a.Ca.bind(a),0);else if(Je(a,"readystatechange"),pn(a)==4){a.h=!1;try{const N=a.ca();e:switch(N){case 200:case 201:case 202:case 204:case 206:case 304:case 1223:var h=!0;break e;default:h=!1}var f;if(!(f=h)){var m;if(m=N===0){let B=String(a.D).match(Tu)[1]||null;!B&&o.self&&o.self.location&&(B=o.self.location.protocol.slice(0,-1)),m=!sp.test(B?B.toLowerCase():"")}f=m}if(f)Je(a,"complete"),Je(a,"success");else{a.o=6;try{var C=pn(a)>2?a.g.statusText:""}catch{C=""}a.l=C+" ["+a.ca()+"]",Ou(a)}}finally{Ni(a)}}}}function Ni(a,h){if(a.g){a.m&&(clearTimeout(a.m),a.m=null);const f=a.g;a.g=null,h||Je(a,"ready");try{f.onreadystatechange=null}catch{}}}n.isActive=function(){return!!this.g};function pn(a){return a.g?a.g.readyState:0}n.ca=function(){try{return pn(this)>2?this.g.status:-1}catch{return-1}},n.la=function(){try{return this.g?this.g.responseText:""}catch{return""}},n.La=function(a){if(this.g){var h=this.g.responseText;return a&&h.indexOf(a)==0&&(h=h.substring(a.length)),F6(h)}};function Du(a){try{if(!a.g)return null;if("response"in a.g)return a.g.response;switch(a.F){case"":case"text":return a.g.responseText;case"arraybuffer":if("mozResponseArrayBuffer"in a.g)return a.g.mozResponseArrayBuffer}return null}catch{return null}}function op(a){const h={};a=(a.g&&pn(a)>=2&&a.g.getAllResponseHeaders()||"").split(`\r
`);for(let m=0;m<a.length;m++){if(E(a[m]))continue;var f=j6(a[m]);const C=f[0];if(f=f[1],typeof f!="string")continue;f=f.trim();const N=h[C]||[];h[C]=N,N.push(f)}k6(h,function(m){return m.join(", ")})}n.ya=function(){return this.o},n.Ha=function(){return typeof this.l=="string"?this.l:String(this.l)};function fs(a,h,f){return f&&f.internalChannelParams&&f.internalChannelParams[a]||h}function Vu(a){this.za=0,this.i=[],this.j=new ns,this.ba=this.na=this.J=this.W=this.g=this.wa=this.G=this.H=this.u=this.U=this.o=null,this.Ya=this.V=0,this.Sa=fs("failFast",!1,a),this.F=this.C=this.v=this.m=this.l=null,this.X=!0,this.xa=this.K=-1,this.Y=this.A=this.D=0,this.Qa=fs("baseRetryDelayMs",5e3,a),this.Za=fs("retryDelaySeedMs",1e4,a),this.Ta=fs("forwardChannelMaxRetries",2,a),this.va=fs("forwardChannelRequestTimeoutMs",2e4,a),this.ma=a&&a.xmlHttpFactory||void 0,this.Ua=a&&a.Rb||void 0,this.Aa=a&&a.useFetchStreams||!1,this.O=void 0,this.L=a&&a.supportsCrossDomainXhr||!1,this.M="",this.h=new gu(a&&a.concurrentRequestLimit),this.Ba=new rp,this.S=a&&a.fastHandshake||!1,this.R=a&&a.encodeInitMessageHeaders||!1,this.S&&this.R&&(this.R=!1),this.Ra=a&&a.Pb||!1,a&&a.ua&&this.j.ua(),a&&a.forceLongPolling&&(this.X=!1),this.aa=!this.S&&this.X&&a&&a.detectBufferingProxy||!1,this.ia=void 0,a&&a.longPollingTimeout&&a.longPollingTimeout>0&&(this.ia=a.longPollingTimeout),this.ta=void 0,this.T=0,this.P=!1,this.ja=this.B=null}n=Vu.prototype,n.ka=8,n.I=1,n.connect=function(a,h,f,m){Ze(0),this.W=a,this.H=h||{},f&&m!==void 0&&(this.H.OSID=f,this.H.OAID=m),this.F=this.X,this.J=Hu(this,null,this.W),ki(this)};function Da(a){if(xu(a),a.I==3){var h=a.V++,f=Vt(a.J);if(me(f,"SID",a.M),me(f,"RID",h),me(f,"TYPE","terminate"),ds(a,f),h=new hn(a,a.j,h),h.M=2,h.A=Si(Vt(f)),f=!1,o.navigator&&o.navigator.sendBeacon)try{f=o.navigator.sendBeacon(h.A.toString(),"")}catch{}!f&&o.Image&&(new Image().src=h.A,f=!0),f||(h.g=ju(h.j,null),h.g.ea(h.A)),h.F=Date.now(),Pi(h)}qu(a)}function Oi(a){a.g&&(xa(a),a.g.cancel(),a.g=null)}function xu(a){Oi(a),a.v&&(o.clearTimeout(a.v),a.v=null),Di(a),a.h.cancel(),a.m&&(typeof a.m=="number"&&o.clearTimeout(a.m),a.m=null)}function ki(a){if(!_u(a.h)&&!a.m){a.m=!0;var h=a.Ea;Be||y(),we||(Be(),we=!0),v.add(h,a),a.D=0}}function ap(a,h){return yu(a.h)>=a.h.j-(a.m?1:0)?!1:a.m?(a.i=h.G.concat(a.i),!0):a.I==1||a.I==2||a.D>=(a.Sa?0:a.Ta)?!1:(a.m=ts(l(a.Ea,a,h),$u(a,a.D)),a.D++,!0)}n.Ea=function(a){if(this.m)if(this.m=null,this.I==1){if(!a){this.V=Math.floor(Math.random()*1e5),a=this.V++;const C=new hn(this,this.j,a);let N=this.o;if(this.U&&(N?(N=z1(N),Y1(N,this.U)):N=this.U),this.u!==null||this.R||(C.J=N,N=null),this.S)e:{for(var h=0,f=0;f<this.i.length;f++){t:{var m=this.i[f];if("__data__"in m.map&&(m=m.map.__data__,typeof m=="string")){m=m.length;break t}m=void 0}if(m===void 0)break;if(h+=m,h>4096){h=f;break e}if(h===4096||f===this.i.length-1){h=f+1;break e}}h=1e3}else h=1e3;h=Mu(this,C,h),f=Vt(this.J),me(f,"RID",a),me(f,"CVER",22),this.G&&me(f,"X-HTTP-Session-Id",this.G),ds(this,f),N&&(this.R?h="headers="+rs(bu(N))+"&"+h:this.u&&ka(f,this.u,N)),ba(this.h,C),this.Ra&&me(f,"TYPE","init"),this.S?(me(f,"$req",h),me(f,"SID","null"),C.U=!0,Ra(C,f,null)):Ra(C,f,h),this.I=2}}else this.I==3&&(a?Lu(this,a):this.i.length==0||_u(this.h)||Lu(this))};function Lu(a,h){var f;h?f=h.l:f=a.V++;const m=Vt(a.J);me(m,"SID",a.M),me(m,"RID",f),me(m,"AID",a.K),ds(a,m),a.u&&a.o&&ka(m,a.u,a.o),f=new hn(a,a.j,f,a.D+1),a.u===null&&(f.J=a.o),h&&(a.i=h.G.concat(a.i)),h=Mu(a,f,1e3),f.H=Math.round(a.va*.5)+Math.round(a.va*.5*Math.random()),ba(a.h,f),Ra(f,m,h)}function ds(a,h){a.H&&wi(a.H,function(f,m){me(h,m,f)}),a.l&&wi({},function(f,m){me(h,m,f)})}function Mu(a,h,f){f=Math.min(a.i.length,f);const m=a.l?l(a.l.Ka,a.l,a):null;e:{var C=a.i;let ne=-1;for(;;){const ke=["count="+f];ne==-1?f>0?(ne=C[0].g,ke.push("ofs="+ne)):ne=0:ke.push("ofs="+ne);let de=!0;for(let xe=0;xe<f;xe++){var N=C[xe].g;const xt=C[xe].map;if(N-=ne,N<0)ne=Math.max(0,C[xe].g-100),de=!1;else try{N="req"+N+"_"||"";try{var B=xt instanceof Map?xt:Object.entries(xt);for(const[Jn,mn]of B){let gn=mn;c(mn)&&(gn=Ia(mn)),ke.push(N+Jn+"="+encodeURIComponent(gn))}}catch(Jn){throw ke.push(N+"type="+encodeURIComponent("_badmap")),Jn}}catch{m&&m(xt)}}if(de){B=ke.join("&");break e}}B=void 0}return a=a.i.splice(0,f),h.G=a,B}function Fu(a){if(!a.g&&!a.v){a.Y=1;var h=a.Da;Be||y(),we||(Be(),we=!0),v.add(h,a),a.A=0}}function Va(a){return a.g||a.v||a.A>=3?!1:(a.Y++,a.v=ts(l(a.Da,a),$u(a,a.A)),a.A++,!0)}n.Da=function(){if(this.v=null,Uu(this),this.aa&&!(this.P||this.g==null||this.T<=0)){var a=4*this.T;this.j.info("BP detection timer enabled: "+a),this.B=ts(l(this.Wa,this),a)}},n.Wa=function(){this.B&&(this.B=null,this.j.info("BP detection timeout reached."),this.j.info("Buffering proxy detected and switch to long-polling!"),this.F=!1,this.P=!0,Ze(10),Oi(this),Uu(this))};function xa(a){a.B!=null&&(o.clearTimeout(a.B),a.B=null)}function Uu(a){a.g=new hn(a,a.j,"rpc",a.Y),a.u===null&&(a.g.J=a.o),a.g.P=0;var h=Vt(a.na);me(h,"RID","rpc"),me(h,"SID",a.M),me(h,"AID",a.K),me(h,"CI",a.F?"0":"1"),!a.F&&a.ia&&me(h,"TO",a.ia),me(h,"TYPE","xmlhttp"),ds(a,h),a.u&&a.o&&ka(h,a.u,a.o),a.O&&(a.g.H=a.O);var f=a.g;a=a.ba,f.M=1,f.A=Si(Vt(h)),f.u=null,f.R=!0,du(f,a)}n.Va=function(){this.C!=null&&(this.C=null,Oi(this),Va(this),Ze(19))};function Di(a){a.C!=null&&(o.clearTimeout(a.C),a.C=null)}function Bu(a,h){var f=null;if(a.g==h){Di(a),xa(a),a.g=null;var m=2}else if(Sa(a.h,h))f=h.G,Eu(a.h,h),m=1;else return;if(a.I!=0){if(h.o)if(m==1){f=h.u?h.u.length:0,h=Date.now()-h.F;var C=a.D;m=Ri(),Je(m,new cu(m,f)),ki(a)}else Fu(a);else if(C=h.m,C==3||C==0&&h.X>0||!(m==1&&ap(a,h)||m==2&&Va(a)))switch(f&&f.length>0&&(h=a.h,h.i=h.i.concat(f)),C){case 1:Xn(a,5);break;case 4:Xn(a,10);break;case 3:Xn(a,6);break;default:Xn(a,2)}}}function $u(a,h){let f=a.Qa+Math.floor(Math.random()*a.Za);return a.isActive()||(f*=2),f*h}function Xn(a,h){if(a.j.info("Error code "+h),h==2){var f=l(a.bb,a),m=a.Ua;const C=!m;m=new fn(m||"//www.google.com/images/cleardot.gif"),o.location&&o.location.protocol=="http"||is(m,"https"),Si(m),C?tp(m.toString(),f):np(m.toString(),f)}else Ze(2);a.I=0,a.l&&a.l.pa(h),qu(a),xu(a)}n.bb=function(a){a?(this.j.info("Successfully pinged google.com"),Ze(2)):(this.j.info("Failed to ping google.com"),Ze(1))};function qu(a){if(a.I=0,a.ja=[],a.l){const h=Iu(a.h);(h.length!=0||a.i.length!=0)&&(O(a.ja,h),O(a.ja,a.i),a.h.i.length=0,b(a.i),a.i.length=0),a.l.oa()}}function Hu(a,h,f){var m=f instanceof fn?Vt(f):new fn(f);if(m.g!="")h&&(m.g=h+"."+m.g),os(m,m.u);else{var C=o.location;m=C.protocol,h=h?h+"."+C.hostname:C.hostname,C=+C.port;const N=new fn(null);m&&is(N,m),h&&(N.g=h),C&&os(N,C),f&&(N.h=f),m=N}return f=a.G,h=a.wa,f&&h&&me(m,f,h),me(m,"VER",a.ka),ds(a,m),m}function ju(a,h,f){if(h&&!a.L)throw Error("Can't create secondary domain capable XhrIo object.");return h=a.Aa&&!a.ma?new Te(new Oa({ab:f})):new Te(a.ma),h.Fa(a.L),h}n.isActive=function(){return!!this.l&&this.l.isActive(this)};function Gu(){}n=Gu.prototype,n.ra=function(){},n.qa=function(){},n.pa=function(){},n.oa=function(){},n.isActive=function(){return!0},n.Ka=function(){};function Vi(){}Vi.prototype.g=function(a,h){return new mt(a,h)};function mt(a,h){$e.call(this),this.g=new Vu(h),this.l=a,this.h=h&&h.messageUrlParams||null,a=h&&h.messageHeaders||null,h&&h.clientProtocolHeaderRequired&&(a?a["X-Client-Protocol"]="webchannel":a={"X-Client-Protocol":"webchannel"}),this.g.o=a,a=h&&h.initMessageHeaders||null,h&&h.messageContentType&&(a?a["X-WebChannel-Content-Type"]=h.messageContentType:a={"X-WebChannel-Content-Type":h.messageContentType}),h&&h.sa&&(a?a["X-WebChannel-Client-Profile"]=h.sa:a={"X-WebChannel-Client-Profile":h.sa}),this.g.U=a,(a=h&&h.Qb)&&!E(a)&&(this.g.u=a),this.A=h&&h.supportsCrossDomainXhr||!1,this.v=h&&h.sendRawJson||!1,(h=h&&h.httpSessionIdParam)&&!E(h)&&(this.g.G=h,a=this.h,a!==null&&h in a&&(a=this.h,h in a&&delete a[h])),this.j=new Er(this)}g(mt,$e),mt.prototype.m=function(){this.g.l=this.j,this.A&&(this.g.L=!0),this.g.connect(this.l,this.h||void 0)},mt.prototype.close=function(){Da(this.g)},mt.prototype.o=function(a){var h=this.g;if(typeof a=="string"){var f={};f.__data__=a,a=f}else this.v&&(f={},f.__data__=Ia(a),a=f);h.i.push(new z6(h.Ya++,a)),h.I==3&&ki(h)},mt.prototype.N=function(){this.g.l=null,delete this.j,Da(this.g),delete this.g,mt.Z.N.call(this)};function Wu(a){Ta.call(this),a.__headers__&&(this.headers=a.__headers__,this.statusCode=a.__status__,delete a.__headers__,delete a.__status__);var h=a.__sm__;if(h){e:{for(const f in h){a=f;break e}a=void 0}(this.i=a)&&(a=this.i,h=h!==null&&a in h?h[a]:void 0),this.data=h}else this.data=a}g(Wu,Ta);function zu(){wa.call(this),this.status=1}g(zu,wa);function Er(a){this.g=a}g(Er,Gu),Er.prototype.ra=function(){Je(this.g,"a")},Er.prototype.qa=function(a){Je(this.g,new Wu(a))},Er.prototype.pa=function(a){Je(this.g,new zu)},Er.prototype.oa=function(){Je(this.g,"b")},Vi.prototype.createWebChannel=Vi.prototype.g,mt.prototype.send=mt.prototype.o,mt.prototype.open=mt.prototype.m,mt.prototype.close=mt.prototype.close,hf=function(){return new Vi},lf=function(){return Ri()},uf=Kn,hc={jb:0,mb:1,nb:2,Hb:3,Mb:4,Jb:5,Kb:6,Ib:7,Gb:8,Lb:9,PROXY:10,NOPROXY:11,Eb:12,Ab:13,Bb:14,zb:15,Cb:16,Db:17,fb:18,eb:19,gb:20},Ci.NO_ERROR=0,Ci.TIMEOUT=8,Ci.HTTP_ERROR=6,Qi=Ci,uu.COMPLETE="complete",cf=uu,su.EventType=Zr,Zr.OPEN="a",Zr.CLOSE="b",Zr.ERROR="c",Zr.MESSAGE="d",$e.prototype.listen=$e.prototype.J,Is=su,Te.prototype.listenOnce=Te.prototype.K,Te.prototype.getLastError=Te.prototype.Ha,Te.prototype.getLastErrorCode=Te.prototype.ya,Te.prototype.getStatus=Te.prototype.ca,Te.prototype.getResponseJson=Te.prototype.La,Te.prototype.getResponseText=Te.prototype.la,Te.prototype.send=Te.prototype.ea,Te.prototype.setWithCredentials=Te.prototype.Fa,af=Te}).apply(typeof Mi<"u"?Mi:typeof self<"u"?self:typeof window<"u"?window:{});/*!
 * re2js
 * RE2JS is the JavaScript port of RE2, a regular expression engine that provides linear time matching
 *
 * @version v0.4.3
 * @author Alexey Vasiliev
 * @homepage https://github.com/le0pard/re2js#readme
 * @repository github:le0pard/re2js
 * @license MIT
 */const ye=class ye{};_(ye,"FOLD_CASE",1),_(ye,"LITERAL",2),_(ye,"CLASS_NL",4),_(ye,"DOT_NL",8),_(ye,"ONE_LINE",16),_(ye,"NON_GREEDY",32),_(ye,"PERL_X",64),_(ye,"UNICODE_GROUPS",128),_(ye,"WAS_DOLLAR",256),_(ye,"MATCH_NL",ye.CLASS_NL|ye.DOT_NL),_(ye,"PERL",ye.CLASS_NL|ye.ONE_LINE|ye.PERL_X|ye.UNICODE_GROUPS),_(ye,"POSIX",0),_(ye,"UNANCHORED",0),_(ye,"ANCHOR_START",1),_(ye,"ANCHOR_BOTH",2);let q=ye;class S{static toUpperCase(e){const t=String.fromCodePoint(e).toUpperCase();if(t.length>1)return e;const r=String.fromCodePoint(t.codePointAt(0)).toLowerCase();return r.length>1||r.codePointAt(0)!==e?e:t.codePointAt(0)}static toLowerCase(e){const t=String.fromCodePoint(e).toLowerCase();if(t.length>1)return e;const r=String.fromCodePoint(t.codePointAt(0)).toUpperCase();return r.length>1||r.codePointAt(0)!==e?e:t.codePointAt(0)}}_(S,"CODES",new Map([["\x07",7],["\b",8],["	",9],[`
`,10],["\v",11],["\f",12],["\r",13],[" ",32],['"',34],["$",36],["&",38],["(",40],[")",41],["*",42],["+",43],["-",45],[".",46],["0",48],["1",49],["2",50],["3",51],["4",52],["5",53],["6",54],["7",55],["8",56],["9",57],[":",58],["<",60],[">",62],["?",63],["A",65],["B",66],["C",67],["F",70],["P",80],["Q",81],["U",85],["Z",90],["[",91],["\\",92],["]",93],["^",94],["_",95],["a",97],["b",98],["f",102],["i",105],["m",109],["n",110],["r",114],["s",115],["t",116],["v",118],["x",120],["z",122],["{",123],["|",124],["}",125]]));const d=class d{};_(d,"CASE_ORBIT",new Map([[75,107],[107,8490],[8490,75],[83,115],[115,383],[383,83],[181,924],[924,956],[956,181],[197,229],[229,8491],[8491,197],[452,453],[453,454],[454,452],[455,456],[456,457],[457,455],[458,459],[459,460],[460,458],[497,498],[498,499],[499,497],[837,921],[921,953],[953,8126],[8126,837],[914,946],[946,976],[976,914],[917,949],[949,1013],[1013,917],[920,952],[952,977],[977,1012],[1012,920],[922,954],[954,1008],[1008,922],[928,960],[960,982],[982,928],[929,961],[961,1009],[1009,929],[931,962],[962,963],[963,931],[934,966],[966,981],[981,934],[937,969],[969,8486],[8486,937],[1042,1074],[1074,7296],[7296,1042],[1044,1076],[1076,7297],[7297,1044],[1054,1086],[1086,7298],[7298,1054],[1057,1089],[1089,7299],[7299,1057],[1058,1090],[1090,7300],[7300,7301],[7301,1058],[1066,1098],[1098,7302],[7302,1066],[1122,1123],[1123,7303],[7303,1122],[7304,42570],[42570,42571],[42571,7304],[7776,7777],[7777,7835],[7835,7776],[223,7838],[7838,223],[8064,8072],[8072,8064],[8065,8073],[8073,8065],[8066,8074],[8074,8066],[8067,8075],[8075,8067],[8068,8076],[8076,8068],[8069,8077],[8077,8069],[8070,8078],[8078,8070],[8071,8079],[8079,8071],[8080,8088],[8088,8080],[8081,8089],[8089,8081],[8082,8090],[8090,8082],[8083,8091],[8091,8083],[8084,8092],[8092,8084],[8085,8093],[8093,8085],[8086,8094],[8094,8086],[8087,8095],[8095,8087],[8096,8104],[8104,8096],[8097,8105],[8105,8097],[8098,8106],[8106,8098],[8099,8107],[8107,8099],[8100,8108],[8108,8100],[8101,8109],[8109,8101],[8102,8110],[8110,8102],[8103,8111],[8111,8103],[8115,8124],[8124,8115],[8131,8140],[8140,8131],[912,8147],[8147,912],[944,8163],[8163,944],[8179,8188],[8188,8179],[64261,64262],[64262,64261],[66560,66600],[66600,66560],[66561,66601],[66601,66561],[66562,66602],[66602,66562],[66563,66603],[66603,66563],[66564,66604],[66604,66564],[66565,66605],[66605,66565],[66566,66606],[66606,66566],[66567,66607],[66607,66567],[66568,66608],[66608,66568],[66569,66609],[66609,66569],[66570,66610],[66610,66570],[66571,66611],[66611,66571],[66572,66612],[66612,66572],[66573,66613],[66613,66573],[66574,66614],[66614,66574],[66575,66615],[66615,66575],[66576,66616],[66616,66576],[66577,66617],[66617,66577],[66578,66618],[66618,66578],[66579,66619],[66619,66579],[66580,66620],[66620,66580],[66581,66621],[66621,66581],[66582,66622],[66622,66582],[66583,66623],[66623,66583],[66584,66624],[66624,66584],[66585,66625],[66625,66585],[66586,66626],[66626,66586],[66587,66627],[66627,66587],[66588,66628],[66628,66588],[66589,66629],[66629,66589],[66590,66630],[66630,66590],[66591,66631],[66631,66591],[66592,66632],[66632,66592],[66593,66633],[66633,66593],[66594,66634],[66634,66594],[66595,66635],[66635,66595],[66596,66636],[66636,66596],[66597,66637],[66637,66597],[66598,66638],[66638,66598],[66599,66639],[66639,66599],[66736,66776],[66776,66736],[66737,66777],[66777,66737],[66738,66778],[66778,66738],[66739,66779],[66779,66739],[66740,66780],[66780,66740],[66741,66781],[66781,66741],[66742,66782],[66782,66742],[66743,66783],[66783,66743],[66744,66784],[66784,66744],[66745,66785],[66785,66745],[66746,66786],[66786,66746],[66747,66787],[66787,66747],[66748,66788],[66788,66748],[66749,66789],[66789,66749],[66750,66790],[66790,66750],[66751,66791],[66791,66751],[66752,66792],[66792,66752],[66753,66793],[66793,66753],[66754,66794],[66794,66754],[66755,66795],[66795,66755],[66756,66796],[66796,66756],[66757,66797],[66797,66757],[66758,66798],[66798,66758],[66759,66799],[66799,66759],[66760,66800],[66800,66760],[66761,66801],[66801,66761],[66762,66802],[66802,66762],[66763,66803],[66803,66763],[66764,66804],[66804,66764],[66765,66805],[66805,66765],[66766,66806],[66806,66766],[66767,66807],[66807,66767],[66768,66808],[66808,66768],[66769,66809],[66809,66769],[66770,66810],[66810,66770],[66771,66811],[66811,66771],[66928,66967],[66967,66928],[66929,66968],[66968,66929],[66930,66969],[66969,66930],[66931,66970],[66970,66931],[66932,66971],[66971,66932],[66933,66972],[66972,66933],[66934,66973],[66973,66934],[66935,66974],[66974,66935],[66936,66975],[66975,66936],[66937,66976],[66976,66937],[66938,66977],[66977,66938],[66940,66979],[66979,66940],[66941,66980],[66980,66941],[66942,66981],[66981,66942],[66943,66982],[66982,66943],[66944,66983],[66983,66944],[66945,66984],[66984,66945],[66946,66985],[66985,66946],[66947,66986],[66986,66947],[66948,66987],[66987,66948],[66949,66988],[66988,66949],[66950,66989],[66989,66950],[66951,66990],[66990,66951],[66952,66991],[66991,66952],[66953,66992],[66992,66953],[66954,66993],[66993,66954],[66956,66995],[66995,66956],[66957,66996],[66996,66957],[66958,66997],[66997,66958],[66959,66998],[66998,66959],[66960,66999],[66999,66960],[66961,67e3],[67e3,66961],[66962,67001],[67001,66962],[66964,67003],[67003,66964],[66965,67004],[67004,66965],[68736,68800],[68800,68736],[68737,68801],[68801,68737],[68738,68802],[68802,68738],[68739,68803],[68803,68739],[68740,68804],[68804,68740],[68741,68805],[68805,68741],[68742,68806],[68806,68742],[68743,68807],[68807,68743],[68744,68808],[68808,68744],[68745,68809],[68809,68745],[68746,68810],[68810,68746],[68747,68811],[68811,68747],[68748,68812],[68812,68748],[68749,68813],[68813,68749],[68750,68814],[68814,68750],[68751,68815],[68815,68751],[68752,68816],[68816,68752],[68753,68817],[68817,68753],[68754,68818],[68818,68754],[68755,68819],[68819,68755],[68756,68820],[68820,68756],[68757,68821],[68821,68757],[68758,68822],[68822,68758],[68759,68823],[68823,68759],[68760,68824],[68824,68760],[68761,68825],[68825,68761],[68762,68826],[68826,68762],[68763,68827],[68827,68763],[68764,68828],[68828,68764],[68765,68829],[68829,68765],[68766,68830],[68830,68766],[68767,68831],[68831,68767],[68768,68832],[68832,68768],[68769,68833],[68833,68769],[68770,68834],[68834,68770],[68771,68835],[68835,68771],[68772,68836],[68836,68772],[68773,68837],[68837,68773],[68774,68838],[68838,68774],[68775,68839],[68839,68775],[68776,68840],[68840,68776],[68777,68841],[68841,68777],[68778,68842],[68842,68778],[68779,68843],[68843,68779],[68780,68844],[68844,68780],[68781,68845],[68845,68781],[68782,68846],[68846,68782],[68783,68847],[68847,68783],[68784,68848],[68848,68784],[68785,68849],[68849,68785],[68786,68850],[68850,68786],[71840,71872],[71872,71840],[71841,71873],[71873,71841],[71842,71874],[71874,71842],[71843,71875],[71875,71843],[71844,71876],[71876,71844],[71845,71877],[71877,71845],[71846,71878],[71878,71846],[71847,71879],[71879,71847],[71848,71880],[71880,71848],[71849,71881],[71881,71849],[71850,71882],[71882,71850],[71851,71883],[71883,71851],[71852,71884],[71884,71852],[71853,71885],[71885,71853],[71854,71886],[71886,71854],[71855,71887],[71887,71855],[71856,71888],[71888,71856],[71857,71889],[71889,71857],[71858,71890],[71890,71858],[71859,71891],[71891,71859],[71860,71892],[71892,71860],[71861,71893],[71893,71861],[71862,71894],[71894,71862],[71863,71895],[71895,71863],[71864,71896],[71896,71864],[71865,71897],[71897,71865],[71866,71898],[71898,71866],[71867,71899],[71899,71867],[71868,71900],[71900,71868],[71869,71901],[71901,71869],[71870,71902],[71902,71870],[71871,71903],[71903,71871],[93760,93792],[93792,93760],[93761,93793],[93793,93761],[93762,93794],[93794,93762],[93763,93795],[93795,93763],[93764,93796],[93796,93764],[93765,93797],[93797,93765],[93766,93798],[93798,93766],[93767,93799],[93799,93767],[93768,93800],[93800,93768],[93769,93801],[93801,93769],[93770,93802],[93802,93770],[93771,93803],[93803,93771],[93772,93804],[93804,93772],[93773,93805],[93805,93773],[93774,93806],[93806,93774],[93775,93807],[93807,93775],[93776,93808],[93808,93776],[93777,93809],[93809,93777],[93778,93810],[93810,93778],[93779,93811],[93811,93779],[93780,93812],[93812,93780],[93781,93813],[93813,93781],[93782,93814],[93814,93782],[93783,93815],[93815,93783],[93784,93816],[93816,93784],[93785,93817],[93817,93785],[93786,93818],[93818,93786],[93787,93819],[93819,93787],[93788,93820],[93820,93788],[93789,93821],[93821,93789],[93790,93822],[93822,93790],[93791,93823],[93823,93791],[125184,125218],[125218,125184],[125185,125219],[125219,125185],[125186,125220],[125220,125186],[125187,125221],[125221,125187],[125188,125222],[125222,125188],[125189,125223],[125223,125189],[125190,125224],[125224,125190],[125191,125225],[125225,125191],[125192,125226],[125226,125192],[125193,125227],[125227,125193],[125194,125228],[125228,125194],[125195,125229],[125229,125195],[125196,125230],[125230,125196],[125197,125231],[125231,125197],[125198,125232],[125232,125198],[125199,125233],[125233,125199],[125200,125234],[125234,125200],[125201,125235],[125235,125201],[125202,125236],[125236,125202],[125203,125237],[125237,125203],[125204,125238],[125238,125204],[125205,125239],[125239,125205],[125206,125240],[125240,125206],[125207,125241],[125241,125207],[125208,125242],[125242,125208],[125209,125243],[125243,125209],[125210,125244],[125244,125210],[125211,125245],[125245,125211],[125212,125246],[125246,125212],[125213,125247],[125247,125213],[125214,125248],[125248,125214],[125215,125249],[125249,125215],[125216,125250],[125250,125216],[125217,125251],[125251,125217]])),_(d,"C",[[0,31,1],[127,159,1],[173,888,715],[889,896,7],[897,899,1],[907,909,2],[930,1328,398],[1367,1368,1],[1419,1420,1],[1424,1480,56],[1481,1487,1],[1515,1518,1],[1525,1541,1],[1564,1757,193],[1806,1807,1],[1867,1868,1],[1970,1983,1],[2043,2044,1],[2094,2095,1],[2111,2140,29],[2141,2143,2],[2155,2159,1],[2191,2199,1],[2274,2436,162],[2445,2446,1],[2449,2450,1],[2473,2481,8],[2483,2485,1],[2490,2491,1],[2501,2502,1],[2505,2506,1],[2511,2518,1],[2520,2523,1],[2526,2532,6],[2533,2559,26],[2560,2564,4],[2571,2574,1],[2577,2578,1],[2601,2609,8],[2612,2618,3],[2619,2621,2],[2627,2630,1],[2633,2634,1],[2638,2640,1],[2642,2648,1],[2653,2655,2],[2656,2661,1],[2679,2688,1],[2692,2702,10],[2706,2729,23],[2737,2740,3],[2746,2747,1],[2758,2766,4],[2767,2769,2],[2770,2783,1],[2788,2789,1],[2802,2808,1],[2816,2820,4],[2829,2830,1],[2833,2834,1],[2857,2865,8],[2868,2874,6],[2875,2885,10],[2886,2889,3],[2890,2894,4],[2895,2900,1],[2904,2907,1],[2910,2916,6],[2917,2936,19],[2937,2945,1],[2948,2955,7],[2956,2957,1],[2961,2966,5],[2967,2968,1],[2971,2973,2],[2976,2978,1],[2981,2983,1],[2987,2989,1],[3002,3005,1],[3011,3013,1],[3017,3022,5],[3023,3025,2],[3026,3030,1],[3032,3045,1],[3067,3071,1],[3085,3089,4],[3113,3130,17],[3131,3141,10],[3145,3150,5],[3151,3156,1],[3159,3163,4],[3164,3166,2],[3167,3172,5],[3173,3184,11],[3185,3190,1],[3213,3217,4],[3241,3252,11],[3258,3259,1],[3269,3273,4],[3278,3284,1],[3287,3292,1],[3295,3300,5],[3301,3312,11],[3316,3327,1],[3341,3345,4],[3397,3401,4],[3408,3411,1],[3428,3429,1],[3456,3460,4],[3479,3481,1],[3506,3516,10],[3518,3519,1],[3527,3529,1],[3531,3534,1],[3541,3543,2],[3552,3557,1],[3568,3569,1],[3573,3584,1],[3643,3646,1],[3676,3712,1],[3715,3717,2],[3723,3748,25],[3750,3774,24],[3775,3781,6],[3783,3791,8],[3802,3803,1],[3808,3839,1],[3912,3949,37],[3950,3952,1],[3992,4029,37],[4045,4059,14],[4060,4095,1],[4294,4296,2],[4297,4300,1],[4302,4303,1],[4681,4686,5],[4687,4695,8],[4697,4702,5],[4703,4745,42],[4750,4751,1],[4785,4790,5],[4791,4799,8],[4801,4806,5],[4807,4823,16],[4881,4886,5],[4887,4955,68],[4956,4989,33],[4990,4991,1],[5018,5023,1],[5110,5111,1],[5118,5119,1],[5789,5791,1],[5881,5887,1],[5910,5918,1],[5943,5951,1],[5972,5983,1],[5997,6001,4],[6004,6015,1],[6110,6111,1],[6122,6127,1],[6138,6143,1],[6158,6170,12],[6171,6175,1],[6265,6271,1],[6315,6319,1],[6390,6399,1],[6431,6444,13],[6445,6447,1],[6460,6463,1],[6465,6467,1],[6510,6511,1],[6517,6527,1],[6572,6575,1],[6602,6607,1],[6619,6621,1],[6684,6685,1],[6751,6781,30],[6782,6794,12],[6795,6799,1],[6810,6815,1],[6830,6831,1],[6863,6911,1],[6989,6991,1],[7039,7156,117],[7157,7163,1],[7224,7226,1],[7242,7244,1],[7305,7311,1],[7355,7356,1],[7368,7375,1],[7419,7423,1],[7958,7959,1],[7966,7967,1],[8006,8007,1],[8014,8015,1],[8024,8030,2],[8062,8063,1],[8117,8133,16],[8148,8149,1],[8156,8176,20],[8177,8181,4],[8191,8203,12],[8204,8207,1],[8234,8238,1],[8288,8303,1],[8306,8307,1],[8335,8349,14],[8350,8351,1],[8385,8399,1],[8433,8447,1],[8588,8591,1],[9255,9279,1],[9291,9311,1],[11124,11125,1],[11158,11508,350],[11509,11512,1],[11558,11560,2],[11561,11564,1],[11566,11567,1],[11624,11630,1],[11633,11646,1],[11671,11679,1],[11687,11743,8],[11870,11903,1],[11930,12020,90],[12021,12031,1],[12246,12271,1],[12352,12439,87],[12440,12544,104],[12545,12548,1],[12592,12687,95],[12772,12782,1],[12831,42125,29294],[42126,42127,1],[42183,42191,1],[42540,42559,1],[42744,42751,1],[42955,42959,1],[42962,42964,2],[42970,42993,1],[43053,43055,1],[43066,43071,1],[43128,43135,1],[43206,43213,1],[43226,43231,1],[43348,43358,1],[43389,43391,1],[43470,43482,12],[43483,43485,1],[43519,43575,56],[43576,43583,1],[43598,43599,1],[43610,43611,1],[43715,43738,1],[43767,43776,1],[43783,43784,1],[43791,43792,1],[43799,43807,1],[43815,43823,8],[43884,43887,1],[44014,44015,1],[44026,44031,1],[55204,55215,1],[55239,55242,1],[55292,63743,1],[64110,64111,1],[64218,64255,1],[64263,64274,1],[64280,64284,1],[64311,64317,6],[64319,64325,3],[64451,64466,1],[64912,64913,1],[64968,64974,1],[64976,65007,1],[65050,65055,1],[65107,65127,20],[65132,65135,1],[65141,65277,136],[65278,65280,1],[65471,65473,1],[65480,65481,1],[65488,65489,1],[65496,65497,1],[65501,65503,1],[65511,65519,8],[65520,65531,1],[65534,65535,1],[65548,65575,27],[65595,65598,3],[65614,65615,1],[65630,65663,1],[65787,65791,1],[65795,65798,1],[65844,65846,1],[65935,65949,14],[65950,65951,1],[65953,65999,1],[66046,66175,1],[66205,66207,1],[66257,66271,1],[66300,66303,1],[66340,66348,1],[66379,66383,1],[66427,66431,1],[66462,66500,38],[66501,66503,1],[66518,66559,1],[66718,66719,1],[66730,66735,1],[66772,66775,1],[66812,66815,1],[66856,66863,1],[66916,66926,1],[66939,66955,16],[66963,66966,3],[66978,66994,16],[67002,67005,3],[67006,67071,1],[67383,67391,1],[67414,67423,1],[67432,67455,1],[67462,67505,43],[67515,67583,1],[67590,67591,1],[67593,67638,45],[67641,67643,1],[67645,67646,1],[67670,67743,73],[67744,67750,1],[67760,67807,1],[67827,67830,3],[67831,67834,1],[67868,67870,1],[67898,67902,1],[67904,67967,1],[68024,68027,1],[68048,68049,1],[68100,68103,3],[68104,68107,1],[68116,68120,4],[68150,68151,1],[68155,68158,1],[68169,68175,1],[68185,68191,1],[68256,68287,1],[68327,68330,1],[68343,68351,1],[68406,68408,1],[68438,68439,1],[68467,68471,1],[68498,68504,1],[68509,68520,1],[68528,68607,1],[68681,68735,1],[68787,68799,1],[68851,68857,1],[68904,68911,1],[68922,69215,1],[69247,69290,43],[69294,69295,1],[69298,69372,1],[69416,69423,1],[69466,69487,1],[69514,69551,1],[69580,69599,1],[69623,69631,1],[69710,69713,1],[69750,69758,1],[69821,69827,6],[69828,69839,1],[69865,69871,1],[69882,69887,1],[69941,69960,19],[69961,69967,1],[70007,70015,1],[70112,70133,21],[70134,70143,1],[70162,70210,48],[70211,70271,1],[70279,70281,2],[70286,70302,16],[70314,70319,1],[70379,70383,1],[70394,70399,1],[70404,70413,9],[70414,70417,3],[70418,70441,23],[70449,70452,3],[70458,70469,11],[70470,70473,3],[70474,70478,4],[70479,70481,2],[70482,70486,1],[70488,70492,1],[70500,70501,1],[70509,70511,1],[70517,70655,1],[70748,70754,6],[70755,70783,1],[70856,70863,1],[70874,71039,1],[71094,71095,1],[71134,71167,1],[71237,71247,1],[71258,71263,1],[71277,71295,1],[71354,71359,1],[71370,71423,1],[71451,71452,1],[71468,71471,1],[71495,71679,1],[71740,71839,1],[71923,71934,1],[71943,71944,1],[71946,71947,1],[71956,71959,3],[71990,71993,3],[71994,72007,13],[72008,72015,1],[72026,72095,1],[72104,72105,1],[72152,72153,1],[72165,72191,1],[72264,72271,1],[72355,72367,1],[72441,72447,1],[72458,72703,1],[72713,72759,46],[72774,72783,1],[72813,72815,1],[72848,72849,1],[72872,72887,15],[72888,72959,1],[72967,72970,3],[73015,73017,1],[73019,73022,3],[73032,73039,1],[73050,73055,1],[73062,73065,3],[73103,73106,3],[73113,73119,1],[73130,73439,1],[73465,73471,1],[73489,73531,42],[73532,73533,1],[73562,73647,1],[73649,73663,1],[73714,73726,1],[74650,74751,1],[74863,74869,6],[74870,74879,1],[75076,77711,1],[77811,77823,1],[78896,78911,1],[78934,82943,1],[83527,92159,1],[92729,92735,1],[92767,92778,11],[92779,92781,1],[92863,92874,11],[92875,92879,1],[92910,92911,1],[92918,92927,1],[92998,93007,1],[93018,93026,8],[93048,93052,1],[93072,93759,1],[93851,93951,1],[94027,94030,1],[94088,94094,1],[94112,94175,1],[94181,94191,1],[94194,94207,1],[100344,100351,1],[101590,101631,1],[101641,110575,1],[110580,110588,8],[110591,110883,292],[110884,110897,1],[110899,110927,1],[110931,110932,1],[110934,110947,1],[110952,110959,1],[111356,113663,1],[113771,113775,1],[113789,113791,1],[113801,113807,1],[113818,113819,1],[113824,118527,1],[118574,118575,1],[118599,118607,1],[118724,118783,1],[119030,119039,1],[119079,119080,1],[119155,119162,1],[119275,119295,1],[119366,119487,1],[119508,119519,1],[119540,119551,1],[119639,119647,1],[119673,119807,1],[119893,119965,72],[119968,119969,1],[119971,119972,1],[119975,119976,1],[119981,119994,13],[119996,120004,8],[120070,120075,5],[120076,120085,9],[120093,120122,29],[120127,120133,6],[120135,120137,1],[120145,120486,341],[120487,120780,293],[120781,121484,703],[121485,121498,1],[121504,121520,16],[121521,122623,1],[122655,122660,1],[122667,122879,1],[122887,122905,18],[122906,122914,8],[122917,122923,6],[122924,122927,1],[122990,123022,1],[123024,123135,1],[123181,123183,1],[123198,123199,1],[123210,123213,1],[123216,123535,1],[123567,123583,1],[123642,123646,1],[123648,124111,1],[124154,124895,1],[124903,124908,5],[124911,124927,16],[125125,125126,1],[125143,125183,1],[125260,125263,1],[125274,125277,1],[125280,126064,1],[126133,126208,1],[126270,126463,1],[126468,126496,28],[126499,126501,2],[126502,126504,2],[126515,126520,5],[126522,126524,2],[126525,126529,1],[126531,126534,1],[126536,126540,2],[126544,126547,3],[126549,126550,1],[126552,126560,2],[126563,126565,2],[126566,126571,5],[126579,126589,5],[126591,126602,11],[126620,126624,1],[126628,126634,6],[126652,126703,1],[126706,126975,1],[127020,127023,1],[127124,127135,1],[127151,127152,1],[127168,127184,16],[127222,127231,1],[127406,127461,1],[127491,127503,1],[127548,127551,1],[127561,127567,1],[127570,127583,1],[127590,127743,1],[128728,128731,1],[128749,128751,1],[128765,128767,1],[128887,128890,1],[128986,128991,1],[129004,129007,1],[129009,129023,1],[129036,129039,1],[129096,129103,1],[129114,129119,1],[129160,129167,1],[129198,129199,1],[129202,129279,1],[129620,129631,1],[129646,129647,1],[129661,129663,1],[129673,129679,1],[129726,129734,8],[129735,129741,1],[129756,129759,1],[129769,129775,1],[129785,129791,1],[129939,129995,56],[129996,130031,1],[130042,131071,1],[173792,173823,1],[177978,177983,1],[178206,178207,1],[183970,183983,1],[191457,191471,1],[192094,194559,1],[195102,196607,1],[201547,201551,1],[205744,917759,1],[918e3,1114111,1]]),_(d,"Cc",[[0,31,1],[127,159,1]]),_(d,"Cf",[[173,1536,1363],[1537,1541,1],[1564,1757,193],[1807,2192,385],[2193,2274,81],[6158,8203,2045],[8204,8207,1],[8234,8238,1],[8288,8292,1],[8294,8303,1],[65279,65529,250],[65530,65531,1],[69821,69837,16],[78896,78911,1],[113824,113827,1],[119155,119162,1],[917505,917536,31],[917537,917631,1]]),_(d,"Co",[[57344,63743,1],[983040,1048573,1],[1048576,1114109,1]]),_(d,"Cs",[[55296,57343,1]]),_(d,"L",[[65,90,1],[97,122,1],[170,181,11],[186,192,6],[193,214,1],[216,246,1],[248,705,1],[710,721,1],[736,740,1],[748,750,2],[880,884,1],[886,887,1],[890,893,1],[895,902,7],[904,906,1],[908,910,2],[911,929,1],[931,1013,1],[1015,1153,1],[1162,1327,1],[1329,1366,1],[1369,1376,7],[1377,1416,1],[1488,1514,1],[1519,1522,1],[1568,1610,1],[1646,1647,1],[1649,1747,1],[1749,1765,16],[1766,1774,8],[1775,1786,11],[1787,1788,1],[1791,1808,17],[1810,1839,1],[1869,1957,1],[1969,1994,25],[1995,2026,1],[2036,2037,1],[2042,2048,6],[2049,2069,1],[2074,2084,10],[2088,2112,24],[2113,2136,1],[2144,2154,1],[2160,2183,1],[2185,2190,1],[2208,2249,1],[2308,2361,1],[2365,2384,19],[2392,2401,1],[2417,2432,1],[2437,2444,1],[2447,2448,1],[2451,2472,1],[2474,2480,1],[2482,2486,4],[2487,2489,1],[2493,2510,17],[2524,2525,1],[2527,2529,1],[2544,2545,1],[2556,2565,9],[2566,2570,1],[2575,2576,1],[2579,2600,1],[2602,2608,1],[2610,2611,1],[2613,2614,1],[2616,2617,1],[2649,2652,1],[2654,2674,20],[2675,2676,1],[2693,2701,1],[2703,2705,1],[2707,2728,1],[2730,2736,1],[2738,2739,1],[2741,2745,1],[2749,2768,19],[2784,2785,1],[2809,2821,12],[2822,2828,1],[2831,2832,1],[2835,2856,1],[2858,2864,1],[2866,2867,1],[2869,2873,1],[2877,2908,31],[2909,2911,2],[2912,2913,1],[2929,2947,18],[2949,2954,1],[2958,2960,1],[2962,2965,1],[2969,2970,1],[2972,2974,2],[2975,2979,4],[2980,2984,4],[2985,2986,1],[2990,3001,1],[3024,3077,53],[3078,3084,1],[3086,3088,1],[3090,3112,1],[3114,3129,1],[3133,3160,27],[3161,3162,1],[3165,3168,3],[3169,3200,31],[3205,3212,1],[3214,3216,1],[3218,3240,1],[3242,3251,1],[3253,3257,1],[3261,3293,32],[3294,3296,2],[3297,3313,16],[3314,3332,18],[3333,3340,1],[3342,3344,1],[3346,3386,1],[3389,3406,17],[3412,3414,1],[3423,3425,1],[3450,3455,1],[3461,3478,1],[3482,3505,1],[3507,3515,1],[3517,3520,3],[3521,3526,1],[3585,3632,1],[3634,3635,1],[3648,3654,1],[3713,3714,1],[3716,3718,2],[3719,3722,1],[3724,3747,1],[3749,3751,2],[3752,3760,1],[3762,3763,1],[3773,3776,3],[3777,3780,1],[3782,3804,22],[3805,3807,1],[3840,3904,64],[3905,3911,1],[3913,3948,1],[3976,3980,1],[4096,4138,1],[4159,4176,17],[4177,4181,1],[4186,4189,1],[4193,4197,4],[4198,4206,8],[4207,4208,1],[4213,4225,1],[4238,4256,18],[4257,4293,1],[4295,4301,6],[4304,4346,1],[4348,4680,1],[4682,4685,1],[4688,4694,1],[4696,4698,2],[4699,4701,1],[4704,4744,1],[4746,4749,1],[4752,4784,1],[4786,4789,1],[4792,4798,1],[4800,4802,2],[4803,4805,1],[4808,4822,1],[4824,4880,1],[4882,4885,1],[4888,4954,1],[4992,5007,1],[5024,5109,1],[5112,5117,1],[5121,5740,1],[5743,5759,1],[5761,5786,1],[5792,5866,1],[5873,5880,1],[5888,5905,1],[5919,5937,1],[5952,5969,1],[5984,5996,1],[5998,6e3,1],[6016,6067,1],[6103,6108,5],[6176,6264,1],[6272,6276,1],[6279,6312,1],[6314,6320,6],[6321,6389,1],[6400,6430,1],[6480,6509,1],[6512,6516,1],[6528,6571,1],[6576,6601,1],[6656,6678,1],[6688,6740,1],[6823,6917,94],[6918,6963,1],[6981,6988,1],[7043,7072,1],[7086,7087,1],[7098,7141,1],[7168,7203,1],[7245,7247,1],[7258,7293,1],[7296,7304,1],[7312,7354,1],[7357,7359,1],[7401,7404,1],[7406,7411,1],[7413,7414,1],[7418,7424,6],[7425,7615,1],[7680,7957,1],[7960,7965,1],[7968,8005,1],[8008,8013,1],[8016,8023,1],[8025,8031,2],[8032,8061,1],[8064,8116,1],[8118,8124,1],[8126,8130,4],[8131,8132,1],[8134,8140,1],[8144,8147,1],[8150,8155,1],[8160,8172,1],[8178,8180,1],[8182,8188,1],[8305,8319,14],[8336,8348,1],[8450,8455,5],[8458,8467,1],[8469,8473,4],[8474,8477,1],[8484,8490,2],[8491,8493,1],[8495,8505,1],[8508,8511,1],[8517,8521,1],[8526,8579,53],[8580,11264,2684],[11265,11492,1],[11499,11502,1],[11506,11507,1],[11520,11557,1],[11559,11565,6],[11568,11623,1],[11631,11648,17],[11649,11670,1],[11680,11686,1],[11688,11694,1],[11696,11702,1],[11704,11710,1],[11712,11718,1],[11720,11726,1],[11728,11734,1],[11736,11742,1],[11823,12293,470],[12294,12337,43],[12338,12341,1],[12347,12348,1],[12353,12438,1],[12445,12447,1],[12449,12538,1],[12540,12543,1],[12549,12591,1],[12593,12686,1],[12704,12735,1],[12784,12799,1],[13312,19903,1],[19968,42124,1],[42192,42237,1],[42240,42508,1],[42512,42527,1],[42538,42539,1],[42560,42606,1],[42623,42653,1],[42656,42725,1],[42775,42783,1],[42786,42888,1],[42891,42954,1],[42960,42961,1],[42963,42965,2],[42966,42969,1],[42994,43009,1],[43011,43013,1],[43015,43018,1],[43020,43042,1],[43072,43123,1],[43138,43187,1],[43250,43255,1],[43259,43261,2],[43262,43274,12],[43275,43301,1],[43312,43334,1],[43360,43388,1],[43396,43442,1],[43471,43488,17],[43489,43492,1],[43494,43503,1],[43514,43518,1],[43520,43560,1],[43584,43586,1],[43588,43595,1],[43616,43638,1],[43642,43646,4],[43647,43695,1],[43697,43701,4],[43702,43705,3],[43706,43709,1],[43712,43714,2],[43739,43741,1],[43744,43754,1],[43762,43764,1],[43777,43782,1],[43785,43790,1],[43793,43798,1],[43808,43814,1],[43816,43822,1],[43824,43866,1],[43868,43881,1],[43888,44002,1],[44032,55203,1],[55216,55238,1],[55243,55291,1],[63744,64109,1],[64112,64217,1],[64256,64262,1],[64275,64279,1],[64285,64287,2],[64288,64296,1],[64298,64310,1],[64312,64316,1],[64318,64320,2],[64321,64323,2],[64324,64326,2],[64327,64433,1],[64467,64829,1],[64848,64911,1],[64914,64967,1],[65008,65019,1],[65136,65140,1],[65142,65276,1],[65313,65338,1],[65345,65370,1],[65382,65470,1],[65474,65479,1],[65482,65487,1],[65490,65495,1],[65498,65500,1],[65536,65547,1],[65549,65574,1],[65576,65594,1],[65596,65597,1],[65599,65613,1],[65616,65629,1],[65664,65786,1],[66176,66204,1],[66208,66256,1],[66304,66335,1],[66349,66368,1],[66370,66377,1],[66384,66421,1],[66432,66461,1],[66464,66499,1],[66504,66511,1],[66560,66717,1],[66736,66771,1],[66776,66811,1],[66816,66855,1],[66864,66915,1],[66928,66938,1],[66940,66954,1],[66956,66962,1],[66964,66965,1],[66967,66977,1],[66979,66993,1],[66995,67001,1],[67003,67004,1],[67072,67382,1],[67392,67413,1],[67424,67431,1],[67456,67461,1],[67463,67504,1],[67506,67514,1],[67584,67589,1],[67592,67594,2],[67595,67637,1],[67639,67640,1],[67644,67647,3],[67648,67669,1],[67680,67702,1],[67712,67742,1],[67808,67826,1],[67828,67829,1],[67840,67861,1],[67872,67897,1],[67968,68023,1],[68030,68031,1],[68096,68112,16],[68113,68115,1],[68117,68119,1],[68121,68149,1],[68192,68220,1],[68224,68252,1],[68288,68295,1],[68297,68324,1],[68352,68405,1],[68416,68437,1],[68448,68466,1],[68480,68497,1],[68608,68680,1],[68736,68786,1],[68800,68850,1],[68864,68899,1],[69248,69289,1],[69296,69297,1],[69376,69404,1],[69415,69424,9],[69425,69445,1],[69488,69505,1],[69552,69572,1],[69600,69622,1],[69635,69687,1],[69745,69746,1],[69749,69763,14],[69764,69807,1],[69840,69864,1],[69891,69926,1],[69956,69959,3],[69968,70002,1],[70006,70019,13],[70020,70066,1],[70081,70084,1],[70106,70108,2],[70144,70161,1],[70163,70187,1],[70207,70208,1],[70272,70278,1],[70280,70282,2],[70283,70285,1],[70287,70301,1],[70303,70312,1],[70320,70366,1],[70405,70412,1],[70415,70416,1],[70419,70440,1],[70442,70448,1],[70450,70451,1],[70453,70457,1],[70461,70480,19],[70493,70497,1],[70656,70708,1],[70727,70730,1],[70751,70753,1],[70784,70831,1],[70852,70853,1],[70855,71040,185],[71041,71086,1],[71128,71131,1],[71168,71215,1],[71236,71296,60],[71297,71338,1],[71352,71424,72],[71425,71450,1],[71488,71494,1],[71680,71723,1],[71840,71903,1],[71935,71942,1],[71945,71948,3],[71949,71955,1],[71957,71958,1],[71960,71983,1],[71999,72001,2],[72096,72103,1],[72106,72144,1],[72161,72163,2],[72192,72203,11],[72204,72242,1],[72250,72272,22],[72284,72329,1],[72349,72368,19],[72369,72440,1],[72704,72712,1],[72714,72750,1],[72768,72818,50],[72819,72847,1],[72960,72966,1],[72968,72969,1],[72971,73008,1],[73030,73056,26],[73057,73061,1],[73063,73064,1],[73066,73097,1],[73112,73440,328],[73441,73458,1],[73474,73476,2],[73477,73488,1],[73490,73523,1],[73648,73728,80],[73729,74649,1],[74880,75075,1],[77712,77808,1],[77824,78895,1],[78913,78918,1],[82944,83526,1],[92160,92728,1],[92736,92766,1],[92784,92862,1],[92880,92909,1],[92928,92975,1],[92992,92995,1],[93027,93047,1],[93053,93071,1],[93760,93823,1],[93952,94026,1],[94032,94099,67],[94100,94111,1],[94176,94177,1],[94179,94208,29],[94209,100343,1],[100352,101589,1],[101632,101640,1],[110576,110579,1],[110581,110587,1],[110589,110590,1],[110592,110882,1],[110898,110928,30],[110929,110930,1],[110933,110948,15],[110949,110951,1],[110960,111355,1],[113664,113770,1],[113776,113788,1],[113792,113800,1],[113808,113817,1],[119808,119892,1],[119894,119964,1],[119966,119967,1],[119970,119973,3],[119974,119977,3],[119978,119980,1],[119982,119993,1],[119995,119997,2],[119998,120003,1],[120005,120069,1],[120071,120074,1],[120077,120084,1],[120086,120092,1],[120094,120121,1],[120123,120126,1],[120128,120132,1],[120134,120138,4],[120139,120144,1],[120146,120485,1],[120488,120512,1],[120514,120538,1],[120540,120570,1],[120572,120596,1],[120598,120628,1],[120630,120654,1],[120656,120686,1],[120688,120712,1],[120714,120744,1],[120746,120770,1],[120772,120779,1],[122624,122654,1],[122661,122666,1],[122928,122989,1],[123136,123180,1],[123191,123197,1],[123214,123536,322],[123537,123565,1],[123584,123627,1],[124112,124139,1],[124896,124902,1],[124904,124907,1],[124909,124910,1],[124912,124926,1],[124928,125124,1],[125184,125251,1],[125259,126464,1205],[126465,126467,1],[126469,126495,1],[126497,126498,1],[126500,126503,3],[126505,126514,1],[126516,126519,1],[126521,126523,2],[126530,126535,5],[126537,126541,2],[126542,126543,1],[126545,126546,1],[126548,126551,3],[126553,126561,2],[126562,126564,2],[126567,126570,1],[126572,126578,1],[126580,126583,1],[126585,126588,1],[126590,126592,2],[126593,126601,1],[126603,126619,1],[126625,126627,1],[126629,126633,1],[126635,126651,1],[131072,173791,1],[173824,177977,1],[177984,178205,1],[178208,183969,1],[183984,191456,1],[191472,192093,1],[194560,195101,1],[196608,201546,1],[201552,205743,1]]),_(d,"foldL",[[837,837,1]]),_(d,"Ll",[[97,122,1],[181,223,42],[224,246,1],[248,255,1],[257,311,2],[312,328,2],[329,375,2],[378,382,2],[383,384,1],[387,389,2],[392,396,4],[397,402,5],[405,409,4],[410,411,1],[414,417,3],[419,421,2],[424,426,2],[427,429,2],[432,436,4],[438,441,3],[442,445,3],[446,447,1],[454,460,3],[462,476,2],[477,495,2],[496,499,3],[501,505,4],[507,563,2],[564,569,1],[572,575,3],[576,578,2],[583,591,2],[592,659,1],[661,687,1],[881,883,2],[887,891,4],[892,893,1],[912,940,28],[941,974,1],[976,977,1],[981,983,1],[985,1007,2],[1008,1011,1],[1013,1019,3],[1020,1072,52],[1073,1119,1],[1121,1153,2],[1163,1215,2],[1218,1230,2],[1231,1327,2],[1376,1416,1],[4304,4346,1],[4349,4351,1],[5112,5117,1],[7296,7304,1],[7424,7467,1],[7531,7543,1],[7545,7578,1],[7681,7829,2],[7830,7837,1],[7839,7935,2],[7936,7943,1],[7952,7957,1],[7968,7975,1],[7984,7991,1],[8e3,8005,1],[8016,8023,1],[8032,8039,1],[8048,8061,1],[8064,8071,1],[8080,8087,1],[8096,8103,1],[8112,8116,1],[8118,8119,1],[8126,8130,4],[8131,8132,1],[8134,8135,1],[8144,8147,1],[8150,8151,1],[8160,8167,1],[8178,8180,1],[8182,8183,1],[8458,8462,4],[8463,8467,4],[8495,8505,5],[8508,8509,1],[8518,8521,1],[8526,8580,54],[11312,11359,1],[11361,11365,4],[11366,11372,2],[11377,11379,2],[11380,11382,2],[11383,11387,1],[11393,11491,2],[11492,11500,8],[11502,11507,5],[11520,11557,1],[11559,11565,6],[42561,42605,2],[42625,42651,2],[42787,42799,2],[42800,42801,1],[42803,42865,2],[42866,42872,1],[42874,42876,2],[42879,42887,2],[42892,42894,2],[42897,42899,2],[42900,42901,1],[42903,42921,2],[42927,42933,6],[42935,42947,2],[42952,42954,2],[42961,42969,2],[42998,43002,4],[43824,43866,1],[43872,43880,1],[43888,43967,1],[64256,64262,1],[64275,64279,1],[65345,65370,1],[66600,66639,1],[66776,66811,1],[66967,66977,1],[66979,66993,1],[66995,67001,1],[67003,67004,1],[68800,68850,1],[71872,71903,1],[93792,93823,1],[119834,119859,1],[119886,119892,1],[119894,119911,1],[119938,119963,1],[119990,119993,1],[119995,119997,2],[119998,120003,1],[120005,120015,1],[120042,120067,1],[120094,120119,1],[120146,120171,1],[120198,120223,1],[120250,120275,1],[120302,120327,1],[120354,120379,1],[120406,120431,1],[120458,120485,1],[120514,120538,1],[120540,120545,1],[120572,120596,1],[120598,120603,1],[120630,120654,1],[120656,120661,1],[120688,120712,1],[120714,120719,1],[120746,120770,1],[120772,120777,1],[120779,122624,1845],[122625,122633,1],[122635,122654,1],[122661,122666,1],[125218,125251,1]]),_(d,"foldLl",[[65,90,1],[192,214,1],[216,222,1],[256,302,2],[306,310,2],[313,327,2],[330,376,2],[377,381,2],[385,386,1],[388,390,2],[391,393,2],[394,395,1],[398,401,1],[403,404,1],[406,408,1],[412,413,1],[415,416,1],[418,422,2],[423,425,2],[428,430,2],[431,433,2],[434,435,1],[437,439,2],[440,444,4],[452,453,1],[455,456,1],[458,459,1],[461,475,2],[478,494,2],[497,498,1],[500,502,2],[503,504,1],[506,562,2],[570,571,1],[573,574,1],[577,579,2],[580,582,1],[584,590,2],[837,880,43],[882,886,4],[895,902,7],[904,906,1],[908,910,2],[911,913,2],[914,929,1],[931,939,1],[975,984,9],[986,1006,2],[1012,1015,3],[1017,1018,1],[1021,1071,1],[1120,1152,2],[1162,1216,2],[1217,1229,2],[1232,1326,2],[1329,1366,1],[4256,4293,1],[4295,4301,6],[5024,5109,1],[7312,7354,1],[7357,7359,1],[7680,7828,2],[7838,7934,2],[7944,7951,1],[7960,7965,1],[7976,7983,1],[7992,7999,1],[8008,8013,1],[8025,8031,2],[8040,8047,1],[8072,8079,1],[8088,8095,1],[8104,8111,1],[8120,8124,1],[8136,8140,1],[8152,8155,1],[8168,8172,1],[8184,8188,1],[8486,8490,4],[8491,8498,7],[8579,11264,2685],[11265,11311,1],[11360,11362,2],[11363,11364,1],[11367,11373,2],[11374,11376,1],[11378,11381,3],[11390,11392,1],[11394,11490,2],[11499,11501,2],[11506,42560,31054],[42562,42604,2],[42624,42650,2],[42786,42798,2],[42802,42862,2],[42873,42877,2],[42878,42886,2],[42891,42893,2],[42896,42898,2],[42902,42922,2],[42923,42926,1],[42928,42932,1],[42934,42948,2],[42949,42951,1],[42953,42960,7],[42966,42968,2],[42997,65313,22316],[65314,65338,1],[66560,66599,1],[66736,66771,1],[66928,66938,1],[66940,66954,1],[66956,66962,1],[66964,66965,1],[68736,68786,1],[71840,71871,1],[93760,93791,1],[125184,125217,1]]),_(d,"Lm",[[688,705,1],[710,721,1],[736,740,1],[748,750,2],[884,890,6],[1369,1600,231],[1765,1766,1],[2036,2037,1],[2042,2074,32],[2084,2088,4],[2249,2417,168],[3654,3782,128],[4348,6103,1755],[6211,6823,612],[7288,7293,1],[7468,7530,1],[7544,7579,35],[7580,7615,1],[8305,8319,14],[8336,8348,1],[11388,11389,1],[11631,11823,192],[12293,12337,44],[12338,12341,1],[12347,12445,98],[12446,12540,94],[12541,12542,1],[40981,42232,1251],[42233,42237,1],[42508,42623,115],[42652,42653,1],[42775,42783,1],[42864,42888,24],[42994,42996,1],[43e3,43001,1],[43471,43494,23],[43632,43741,109],[43763,43764,1],[43868,43871,1],[43881,65392,21511],[65438,65439,1],[67456,67461,1],[67463,67504,1],[67506,67514,1],[92992,92995,1],[94099,94111,1],[94176,94177,1],[94179,110576,16397],[110577,110579,1],[110581,110587,1],[110589,110590,1],[122928,122989,1],[123191,123197,1],[124139,125259,1120]]),_(d,"Lo",[[170,186,16],[443,448,5],[449,451,1],[660,1488,828],[1489,1514,1],[1519,1522,1],[1568,1599,1],[1601,1610,1],[1646,1647,1],[1649,1747,1],[1749,1774,25],[1775,1786,11],[1787,1788,1],[1791,1808,17],[1810,1839,1],[1869,1957,1],[1969,1994,25],[1995,2026,1],[2048,2069,1],[2112,2136,1],[2144,2154,1],[2160,2183,1],[2185,2190,1],[2208,2248,1],[2308,2361,1],[2365,2384,19],[2392,2401,1],[2418,2432,1],[2437,2444,1],[2447,2448,1],[2451,2472,1],[2474,2480,1],[2482,2486,4],[2487,2489,1],[2493,2510,17],[2524,2525,1],[2527,2529,1],[2544,2545,1],[2556,2565,9],[2566,2570,1],[2575,2576,1],[2579,2600,1],[2602,2608,1],[2610,2611,1],[2613,2614,1],[2616,2617,1],[2649,2652,1],[2654,2674,20],[2675,2676,1],[2693,2701,1],[2703,2705,1],[2707,2728,1],[2730,2736,1],[2738,2739,1],[2741,2745,1],[2749,2768,19],[2784,2785,1],[2809,2821,12],[2822,2828,1],[2831,2832,1],[2835,2856,1],[2858,2864,1],[2866,2867,1],[2869,2873,1],[2877,2908,31],[2909,2911,2],[2912,2913,1],[2929,2947,18],[2949,2954,1],[2958,2960,1],[2962,2965,1],[2969,2970,1],[2972,2974,2],[2975,2979,4],[2980,2984,4],[2985,2986,1],[2990,3001,1],[3024,3077,53],[3078,3084,1],[3086,3088,1],[3090,3112,1],[3114,3129,1],[3133,3160,27],[3161,3162,1],[3165,3168,3],[3169,3200,31],[3205,3212,1],[3214,3216,1],[3218,3240,1],[3242,3251,1],[3253,3257,1],[3261,3293,32],[3294,3296,2],[3297,3313,16],[3314,3332,18],[3333,3340,1],[3342,3344,1],[3346,3386,1],[3389,3406,17],[3412,3414,1],[3423,3425,1],[3450,3455,1],[3461,3478,1],[3482,3505,1],[3507,3515,1],[3517,3520,3],[3521,3526,1],[3585,3632,1],[3634,3635,1],[3648,3653,1],[3713,3714,1],[3716,3718,2],[3719,3722,1],[3724,3747,1],[3749,3751,2],[3752,3760,1],[3762,3763,1],[3773,3776,3],[3777,3780,1],[3804,3807,1],[3840,3904,64],[3905,3911,1],[3913,3948,1],[3976,3980,1],[4096,4138,1],[4159,4176,17],[4177,4181,1],[4186,4189,1],[4193,4197,4],[4198,4206,8],[4207,4208,1],[4213,4225,1],[4238,4352,114],[4353,4680,1],[4682,4685,1],[4688,4694,1],[4696,4698,2],[4699,4701,1],[4704,4744,1],[4746,4749,1],[4752,4784,1],[4786,4789,1],[4792,4798,1],[4800,4802,2],[4803,4805,1],[4808,4822,1],[4824,4880,1],[4882,4885,1],[4888,4954,1],[4992,5007,1],[5121,5740,1],[5743,5759,1],[5761,5786,1],[5792,5866,1],[5873,5880,1],[5888,5905,1],[5919,5937,1],[5952,5969,1],[5984,5996,1],[5998,6e3,1],[6016,6067,1],[6108,6176,68],[6177,6210,1],[6212,6264,1],[6272,6276,1],[6279,6312,1],[6314,6320,6],[6321,6389,1],[6400,6430,1],[6480,6509,1],[6512,6516,1],[6528,6571,1],[6576,6601,1],[6656,6678,1],[6688,6740,1],[6917,6963,1],[6981,6988,1],[7043,7072,1],[7086,7087,1],[7098,7141,1],[7168,7203,1],[7245,7247,1],[7258,7287,1],[7401,7404,1],[7406,7411,1],[7413,7414,1],[7418,8501,1083],[8502,8504,1],[11568,11623,1],[11648,11670,1],[11680,11686,1],[11688,11694,1],[11696,11702,1],[11704,11710,1],[11712,11718,1],[11720,11726,1],[11728,11734,1],[11736,11742,1],[12294,12348,54],[12353,12438,1],[12447,12449,2],[12450,12538,1],[12543,12549,6],[12550,12591,1],[12593,12686,1],[12704,12735,1],[12784,12799,1],[13312,19903,1],[19968,40980,1],[40982,42124,1],[42192,42231,1],[42240,42507,1],[42512,42527,1],[42538,42539,1],[42606,42656,50],[42657,42725,1],[42895,42999,104],[43003,43009,1],[43011,43013,1],[43015,43018,1],[43020,43042,1],[43072,43123,1],[43138,43187,1],[43250,43255,1],[43259,43261,2],[43262,43274,12],[43275,43301,1],[43312,43334,1],[43360,43388,1],[43396,43442,1],[43488,43492,1],[43495,43503,1],[43514,43518,1],[43520,43560,1],[43584,43586,1],[43588,43595,1],[43616,43631,1],[43633,43638,1],[43642,43646,4],[43647,43695,1],[43697,43701,4],[43702,43705,3],[43706,43709,1],[43712,43714,2],[43739,43740,1],[43744,43754,1],[43762,43777,15],[43778,43782,1],[43785,43790,1],[43793,43798,1],[43808,43814,1],[43816,43822,1],[43968,44002,1],[44032,55203,1],[55216,55238,1],[55243,55291,1],[63744,64109,1],[64112,64217,1],[64285,64287,2],[64288,64296,1],[64298,64310,1],[64312,64316,1],[64318,64320,2],[64321,64323,2],[64324,64326,2],[64327,64433,1],[64467,64829,1],[64848,64911,1],[64914,64967,1],[65008,65019,1],[65136,65140,1],[65142,65276,1],[65382,65391,1],[65393,65437,1],[65440,65470,1],[65474,65479,1],[65482,65487,1],[65490,65495,1],[65498,65500,1],[65536,65547,1],[65549,65574,1],[65576,65594,1],[65596,65597,1],[65599,65613,1],[65616,65629,1],[65664,65786,1],[66176,66204,1],[66208,66256,1],[66304,66335,1],[66349,66368,1],[66370,66377,1],[66384,66421,1],[66432,66461,1],[66464,66499,1],[66504,66511,1],[66640,66717,1],[66816,66855,1],[66864,66915,1],[67072,67382,1],[67392,67413,1],[67424,67431,1],[67584,67589,1],[67592,67594,2],[67595,67637,1],[67639,67640,1],[67644,67647,3],[67648,67669,1],[67680,67702,1],[67712,67742,1],[67808,67826,1],[67828,67829,1],[67840,67861,1],[67872,67897,1],[67968,68023,1],[68030,68031,1],[68096,68112,16],[68113,68115,1],[68117,68119,1],[68121,68149,1],[68192,68220,1],[68224,68252,1],[68288,68295,1],[68297,68324,1],[68352,68405,1],[68416,68437,1],[68448,68466,1],[68480,68497,1],[68608,68680,1],[68864,68899,1],[69248,69289,1],[69296,69297,1],[69376,69404,1],[69415,69424,9],[69425,69445,1],[69488,69505,1],[69552,69572,1],[69600,69622,1],[69635,69687,1],[69745,69746,1],[69749,69763,14],[69764,69807,1],[69840,69864,1],[69891,69926,1],[69956,69959,3],[69968,70002,1],[70006,70019,13],[70020,70066,1],[70081,70084,1],[70106,70108,2],[70144,70161,1],[70163,70187,1],[70207,70208,1],[70272,70278,1],[70280,70282,2],[70283,70285,1],[70287,70301,1],[70303,70312,1],[70320,70366,1],[70405,70412,1],[70415,70416,1],[70419,70440,1],[70442,70448,1],[70450,70451,1],[70453,70457,1],[70461,70480,19],[70493,70497,1],[70656,70708,1],[70727,70730,1],[70751,70753,1],[70784,70831,1],[70852,70853,1],[70855,71040,185],[71041,71086,1],[71128,71131,1],[71168,71215,1],[71236,71296,60],[71297,71338,1],[71352,71424,72],[71425,71450,1],[71488,71494,1],[71680,71723,1],[71935,71942,1],[71945,71948,3],[71949,71955,1],[71957,71958,1],[71960,71983,1],[71999,72001,2],[72096,72103,1],[72106,72144,1],[72161,72163,2],[72192,72203,11],[72204,72242,1],[72250,72272,22],[72284,72329,1],[72349,72368,19],[72369,72440,1],[72704,72712,1],[72714,72750,1],[72768,72818,50],[72819,72847,1],[72960,72966,1],[72968,72969,1],[72971,73008,1],[73030,73056,26],[73057,73061,1],[73063,73064,1],[73066,73097,1],[73112,73440,328],[73441,73458,1],[73474,73476,2],[73477,73488,1],[73490,73523,1],[73648,73728,80],[73729,74649,1],[74880,75075,1],[77712,77808,1],[77824,78895,1],[78913,78918,1],[82944,83526,1],[92160,92728,1],[92736,92766,1],[92784,92862,1],[92880,92909,1],[92928,92975,1],[93027,93047,1],[93053,93071,1],[93952,94026,1],[94032,94208,176],[94209,100343,1],[100352,101589,1],[101632,101640,1],[110592,110882,1],[110898,110928,30],[110929,110930,1],[110933,110948,15],[110949,110951,1],[110960,111355,1],[113664,113770,1],[113776,113788,1],[113792,113800,1],[113808,113817,1],[122634,123136,502],[123137,123180,1],[123214,123536,322],[123537,123565,1],[123584,123627,1],[124112,124138,1],[124896,124902,1],[124904,124907,1],[124909,124910,1],[124912,124926,1],[124928,125124,1],[126464,126467,1],[126469,126495,1],[126497,126498,1],[126500,126503,3],[126505,126514,1],[126516,126519,1],[126521,126523,2],[126530,126535,5],[126537,126541,2],[126542,126543,1],[126545,126546,1],[126548,126551,3],[126553,126561,2],[126562,126564,2],[126567,126570,1],[126572,126578,1],[126580,126583,1],[126585,126588,1],[126590,126592,2],[126593,126601,1],[126603,126619,1],[126625,126627,1],[126629,126633,1],[126635,126651,1],[131072,173791,1],[173824,177977,1],[177984,178205,1],[178208,183969,1],[183984,191456,1],[191472,192093,1],[194560,195101,1],[196608,201546,1],[201552,205743,1]]),_(d,"Lt",[[453,459,3],[498,8072,7574],[8073,8079,1],[8088,8095,1],[8104,8111,1],[8124,8140,16],[8188,8188,1]]),_(d,"foldLt",[[452,454,2],[455,457,2],[458,460,2],[497,499,2],[8064,8071,1],[8080,8087,1],[8096,8103,1],[8115,8131,16],[8179,8179,1]]),_(d,"Lu",[[65,90,1],[192,214,1],[216,222,1],[256,310,2],[313,327,2],[330,376,2],[377,381,2],[385,386,1],[388,390,2],[391,393,2],[394,395,1],[398,401,1],[403,404,1],[406,408,1],[412,413,1],[415,416,1],[418,422,2],[423,425,2],[428,430,2],[431,433,2],[434,435,1],[437,439,2],[440,444,4],[452,461,3],[463,475,2],[478,494,2],[497,500,3],[502,504,1],[506,562,2],[570,571,1],[573,574,1],[577,579,2],[580,582,1],[584,590,2],[880,882,2],[886,895,9],[902,904,2],[905,906,1],[908,910,2],[911,913,2],[914,929,1],[931,939,1],[975,978,3],[979,980,1],[984,1006,2],[1012,1015,3],[1017,1018,1],[1021,1071,1],[1120,1152,2],[1162,1216,2],[1217,1229,2],[1232,1326,2],[1329,1366,1],[4256,4293,1],[4295,4301,6],[5024,5109,1],[7312,7354,1],[7357,7359,1],[7680,7828,2],[7838,7934,2],[7944,7951,1],[7960,7965,1],[7976,7983,1],[7992,7999,1],[8008,8013,1],[8025,8031,2],[8040,8047,1],[8120,8123,1],[8136,8139,1],[8152,8155,1],[8168,8172,1],[8184,8187,1],[8450,8455,5],[8459,8461,1],[8464,8466,1],[8469,8473,4],[8474,8477,1],[8484,8490,2],[8491,8493,1],[8496,8499,1],[8510,8511,1],[8517,8579,62],[11264,11311,1],[11360,11362,2],[11363,11364,1],[11367,11373,2],[11374,11376,1],[11378,11381,3],[11390,11392,1],[11394,11490,2],[11499,11501,2],[11506,42560,31054],[42562,42604,2],[42624,42650,2],[42786,42798,2],[42802,42862,2],[42873,42877,2],[42878,42886,2],[42891,42893,2],[42896,42898,2],[42902,42922,2],[42923,42926,1],[42928,42932,1],[42934,42948,2],[42949,42951,1],[42953,42960,7],[42966,42968,2],[42997,65313,22316],[65314,65338,1],[66560,66599,1],[66736,66771,1],[66928,66938,1],[66940,66954,1],[66956,66962,1],[66964,66965,1],[68736,68786,1],[71840,71871,1],[93760,93791,1],[119808,119833,1],[119860,119885,1],[119912,119937,1],[119964,119966,2],[119967,119973,3],[119974,119977,3],[119978,119980,1],[119982,119989,1],[120016,120041,1],[120068,120069,1],[120071,120074,1],[120077,120084,1],[120086,120092,1],[120120,120121,1],[120123,120126,1],[120128,120132,1],[120134,120138,4],[120139,120144,1],[120172,120197,1],[120224,120249,1],[120276,120301,1],[120328,120353,1],[120380,120405,1],[120432,120457,1],[120488,120512,1],[120546,120570,1],[120604,120628,1],[120662,120686,1],[120720,120744,1],[120778,125184,4406],[125185,125217,1]]),_(d,"Upper",d.Lu),_(d,"foldLu",[[97,122,1],[181,223,42],[224,246,1],[248,255,1],[257,303,2],[307,311,2],[314,328,2],[331,375,2],[378,382,2],[383,384,1],[387,389,2],[392,396,4],[402,405,3],[409,410,1],[414,417,3],[419,421,2],[424,429,5],[432,436,4],[438,441,3],[445,447,2],[453,454,1],[456,457,1],[459,460,1],[462,476,2],[477,495,2],[498,499,1],[501,505,4],[507,543,2],[547,563,2],[572,575,3],[576,578,2],[583,591,2],[592,596,1],[598,599,1],[601,603,2],[604,608,4],[609,613,2],[614,616,2],[617,620,1],[623,625,2],[626,629,3],[637,640,3],[642,643,1],[647,652,1],[658,669,11],[670,837,167],[881,883,2],[887,891,4],[892,893,1],[940,943,1],[945,974,1],[976,977,1],[981,983,1],[985,1007,2],[1008,1011,1],[1013,1019,3],[1072,1119,1],[1121,1153,2],[1163,1215,2],[1218,1230,2],[1231,1327,2],[1377,1414,1],[4304,4346,1],[4349,4351,1],[5112,5117,1],[7296,7304,1],[7545,7549,4],[7566,7681,115],[7683,7829,2],[7835,7841,6],[7843,7935,2],[7936,7943,1],[7952,7957,1],[7968,7975,1],[7984,7991,1],[8e3,8005,1],[8017,8023,2],[8032,8039,1],[8048,8061,1],[8112,8113,1],[8126,8144,18],[8145,8160,15],[8161,8165,4],[8526,8580,54],[11312,11359,1],[11361,11365,4],[11366,11372,2],[11379,11382,3],[11393,11491,2],[11500,11502,2],[11507,11520,13],[11521,11557,1],[11559,11565,6],[42561,42605,2],[42625,42651,2],[42787,42799,2],[42803,42863,2],[42874,42876,2],[42879,42887,2],[42892,42897,5],[42899,42900,1],[42903,42921,2],[42933,42947,2],[42952,42954,2],[42961,42967,6],[42969,42998,29],[43859,43888,29],[43889,43967,1],[65345,65370,1],[66600,66639,1],[66776,66811,1],[66967,66977,1],[66979,66993,1],[66995,67001,1],[67003,67004,1],[68800,68850,1],[71872,71903,1],[93792,93823,1],[125218,125251,1]]),_(d,"M",[[768,879,1],[1155,1161,1],[1425,1469,1],[1471,1473,2],[1474,1476,2],[1477,1479,2],[1552,1562,1],[1611,1631,1],[1648,1750,102],[1751,1756,1],[1759,1764,1],[1767,1768,1],[1770,1773,1],[1809,1840,31],[1841,1866,1],[1958,1968,1],[2027,2035,1],[2045,2070,25],[2071,2073,1],[2075,2083,1],[2085,2087,1],[2089,2093,1],[2137,2139,1],[2200,2207,1],[2250,2273,1],[2275,2307,1],[2362,2364,1],[2366,2383,1],[2385,2391,1],[2402,2403,1],[2433,2435,1],[2492,2494,2],[2495,2500,1],[2503,2504,1],[2507,2509,1],[2519,2530,11],[2531,2558,27],[2561,2563,1],[2620,2622,2],[2623,2626,1],[2631,2632,1],[2635,2637,1],[2641,2672,31],[2673,2677,4],[2689,2691,1],[2748,2750,2],[2751,2757,1],[2759,2761,1],[2763,2765,1],[2786,2787,1],[2810,2815,1],[2817,2819,1],[2876,2878,2],[2879,2884,1],[2887,2888,1],[2891,2893,1],[2901,2903,1],[2914,2915,1],[2946,3006,60],[3007,3010,1],[3014,3016,1],[3018,3021,1],[3031,3072,41],[3073,3076,1],[3132,3134,2],[3135,3140,1],[3142,3144,1],[3146,3149,1],[3157,3158,1],[3170,3171,1],[3201,3203,1],[3260,3262,2],[3263,3268,1],[3270,3272,1],[3274,3277,1],[3285,3286,1],[3298,3299,1],[3315,3328,13],[3329,3331,1],[3387,3388,1],[3390,3396,1],[3398,3400,1],[3402,3405,1],[3415,3426,11],[3427,3457,30],[3458,3459,1],[3530,3535,5],[3536,3540,1],[3542,3544,2],[3545,3551,1],[3570,3571,1],[3633,3636,3],[3637,3642,1],[3655,3662,1],[3761,3764,3],[3765,3772,1],[3784,3790,1],[3864,3865,1],[3893,3897,2],[3902,3903,1],[3953,3972,1],[3974,3975,1],[3981,3991,1],[3993,4028,1],[4038,4139,101],[4140,4158,1],[4182,4185,1],[4190,4192,1],[4194,4196,1],[4199,4205,1],[4209,4212,1],[4226,4237,1],[4239,4250,11],[4251,4253,1],[4957,4959,1],[5906,5909,1],[5938,5940,1],[5970,5971,1],[6002,6003,1],[6068,6099,1],[6109,6155,46],[6156,6157,1],[6159,6277,118],[6278,6313,35],[6432,6443,1],[6448,6459,1],[6679,6683,1],[6741,6750,1],[6752,6780,1],[6783,6832,49],[6833,6862,1],[6912,6916,1],[6964,6980,1],[7019,7027,1],[7040,7042,1],[7073,7085,1],[7142,7155,1],[7204,7223,1],[7376,7378,1],[7380,7400,1],[7405,7412,7],[7415,7417,1],[7616,7679,1],[8400,8432,1],[11503,11505,1],[11647,11744,97],[11745,11775,1],[12330,12335,1],[12441,12442,1],[42607,42610,1],[42612,42621,1],[42654,42655,1],[42736,42737,1],[43010,43014,4],[43019,43043,24],[43044,43047,1],[43052,43136,84],[43137,43188,51],[43189,43205,1],[43232,43249,1],[43263,43302,39],[43303,43309,1],[43335,43347,1],[43392,43395,1],[43443,43456,1],[43493,43561,68],[43562,43574,1],[43587,43596,9],[43597,43643,46],[43644,43645,1],[43696,43698,2],[43699,43700,1],[43703,43704,1],[43710,43711,1],[43713,43755,42],[43756,43759,1],[43765,43766,1],[44003,44010,1],[44012,44013,1],[64286,65024,738],[65025,65039,1],[65056,65071,1],[66045,66272,227],[66422,66426,1],[68097,68099,1],[68101,68102,1],[68108,68111,1],[68152,68154,1],[68159,68325,166],[68326,68900,574],[68901,68903,1],[69291,69292,1],[69373,69375,1],[69446,69456,1],[69506,69509,1],[69632,69634,1],[69688,69702,1],[69744,69747,3],[69748,69759,11],[69760,69762,1],[69808,69818,1],[69826,69888,62],[69889,69890,1],[69927,69940,1],[69957,69958,1],[70003,70016,13],[70017,70018,1],[70067,70080,1],[70089,70092,1],[70094,70095,1],[70188,70199,1],[70206,70209,3],[70367,70378,1],[70400,70403,1],[70459,70460,1],[70462,70468,1],[70471,70472,1],[70475,70477,1],[70487,70498,11],[70499,70502,3],[70503,70508,1],[70512,70516,1],[70709,70726,1],[70750,70832,82],[70833,70851,1],[71087,71093,1],[71096,71104,1],[71132,71133,1],[71216,71232,1],[71339,71351,1],[71453,71467,1],[71724,71738,1],[71984,71989,1],[71991,71992,1],[71995,71998,1],[72e3,72002,2],[72003,72145,142],[72146,72151,1],[72154,72160,1],[72164,72193,29],[72194,72202,1],[72243,72249,1],[72251,72254,1],[72263,72273,10],[72274,72283,1],[72330,72345,1],[72751,72758,1],[72760,72767,1],[72850,72871,1],[72873,72886,1],[73009,73014,1],[73018,73020,2],[73021,73023,2],[73024,73029,1],[73031,73098,67],[73099,73102,1],[73104,73105,1],[73107,73111,1],[73459,73462,1],[73472,73473,1],[73475,73524,49],[73525,73530,1],[73534,73538,1],[78912,78919,7],[78920,78933,1],[92912,92916,1],[92976,92982,1],[94031,94033,2],[94034,94087,1],[94095,94098,1],[94180,94192,12],[94193,113821,19628],[113822,118528,4706],[118529,118573,1],[118576,118598,1],[119141,119145,1],[119149,119154,1],[119163,119170,1],[119173,119179,1],[119210,119213,1],[119362,119364,1],[121344,121398,1],[121403,121452,1],[121461,121476,15],[121499,121503,1],[121505,121519,1],[122880,122886,1],[122888,122904,1],[122907,122913,1],[122915,122916,1],[122918,122922,1],[123023,123184,161],[123185,123190,1],[123566,123628,62],[123629,123631,1],[124140,124143,1],[125136,125142,1],[125252,125258,1],[917760,917999,1]]),_(d,"foldM",[[921,953,32],[8126,8126,1]]),_(d,"Mc",[[2307,2363,56],[2366,2368,1],[2377,2380,1],[2382,2383,1],[2434,2435,1],[2494,2496,1],[2503,2504,1],[2507,2508,1],[2519,2563,44],[2622,2624,1],[2691,2750,59],[2751,2752,1],[2761,2763,2],[2764,2818,54],[2819,2878,59],[2880,2887,7],[2888,2891,3],[2892,2903,11],[3006,3007,1],[3009,3010,1],[3014,3016,1],[3018,3020,1],[3031,3073,42],[3074,3075,1],[3137,3140,1],[3202,3203,1],[3262,3264,2],[3265,3268,1],[3271,3272,1],[3274,3275,1],[3285,3286,1],[3315,3330,15],[3331,3390,59],[3391,3392,1],[3398,3400,1],[3402,3404,1],[3415,3458,43],[3459,3535,76],[3536,3537,1],[3544,3551,1],[3570,3571,1],[3902,3903,1],[3967,4139,172],[4140,4145,5],[4152,4155,3],[4156,4182,26],[4183,4194,11],[4195,4196,1],[4199,4205,1],[4227,4228,1],[4231,4236,1],[4239,4250,11],[4251,4252,1],[5909,5940,31],[6070,6078,8],[6079,6085,1],[6087,6088,1],[6435,6438,1],[6441,6443,1],[6448,6449,1],[6451,6456,1],[6681,6682,1],[6741,6743,2],[6753,6755,2],[6756,6765,9],[6766,6770,1],[6916,6965,49],[6971,6973,2],[6974,6977,1],[6979,6980,1],[7042,7073,31],[7078,7079,1],[7082,7143,61],[7146,7148,1],[7150,7154,4],[7155,7204,49],[7205,7211,1],[7220,7221,1],[7393,7415,22],[12334,12335,1],[43043,43044,1],[43047,43136,89],[43137,43188,51],[43189,43203,1],[43346,43347,1],[43395,43444,49],[43445,43450,5],[43451,43454,3],[43455,43456,1],[43567,43568,1],[43571,43572,1],[43597,43643,46],[43645,43755,110],[43758,43759,1],[43765,44003,238],[44004,44006,2],[44007,44009,2],[44010,44012,2],[69632,69634,2],[69762,69808,46],[69809,69810,1],[69815,69816,1],[69932,69957,25],[69958,70018,60],[70067,70069,1],[70079,70080,1],[70094,70188,94],[70189,70190,1],[70194,70195,1],[70197,70368,171],[70369,70370,1],[70402,70403,1],[70462,70463,1],[70465,70468,1],[70471,70472,1],[70475,70477,1],[70487,70498,11],[70499,70709,210],[70710,70711,1],[70720,70721,1],[70725,70832,107],[70833,70834,1],[70841,70843,2],[70844,70846,1],[70849,71087,238],[71088,71089,1],[71096,71099,1],[71102,71216,114],[71217,71218,1],[71227,71228,1],[71230,71340,110],[71342,71343,1],[71350,71456,106],[71457,71462,5],[71724,71726,1],[71736,71984,248],[71985,71989,1],[71991,71992,1],[71997,72e3,3],[72002,72145,143],[72146,72147,1],[72156,72159,1],[72164,72249,85],[72279,72280,1],[72343,72751,408],[72766,72873,107],[72881,72884,3],[73098,73102,1],[73107,73108,1],[73110,73461,351],[73462,73475,13],[73524,73525,1],[73534,73535,1],[73537,94033,20496],[94034,94087,1],[94192,94193,1],[119141,119142,1],[119149,119154,1]]),_(d,"Me",[[1160,1161,1],[6846,8413,1567],[8414,8416,1],[8418,8420,1],[42608,42610,1]]),_(d,"Mn",[[768,879,1],[1155,1159,1],[1425,1469,1],[1471,1473,2],[1474,1476,2],[1477,1479,2],[1552,1562,1],[1611,1631,1],[1648,1750,102],[1751,1756,1],[1759,1764,1],[1767,1768,1],[1770,1773,1],[1809,1840,31],[1841,1866,1],[1958,1968,1],[2027,2035,1],[2045,2070,25],[2071,2073,1],[2075,2083,1],[2085,2087,1],[2089,2093,1],[2137,2139,1],[2200,2207,1],[2250,2273,1],[2275,2306,1],[2362,2364,2],[2369,2376,1],[2381,2385,4],[2386,2391,1],[2402,2403,1],[2433,2492,59],[2497,2500,1],[2509,2530,21],[2531,2558,27],[2561,2562,1],[2620,2625,5],[2626,2631,5],[2632,2635,3],[2636,2637,1],[2641,2672,31],[2673,2677,4],[2689,2690,1],[2748,2753,5],[2754,2757,1],[2759,2760,1],[2765,2786,21],[2787,2810,23],[2811,2815,1],[2817,2876,59],[2879,2881,2],[2882,2884,1],[2893,2901,8],[2902,2914,12],[2915,2946,31],[3008,3021,13],[3072,3076,4],[3132,3134,2],[3135,3136,1],[3142,3144,1],[3146,3149,1],[3157,3158,1],[3170,3171,1],[3201,3260,59],[3263,3270,7],[3276,3277,1],[3298,3299,1],[3328,3329,1],[3387,3388,1],[3393,3396,1],[3405,3426,21],[3427,3457,30],[3530,3538,8],[3539,3540,1],[3542,3633,91],[3636,3642,1],[3655,3662,1],[3761,3764,3],[3765,3772,1],[3784,3790,1],[3864,3865,1],[3893,3897,2],[3953,3966,1],[3968,3972,1],[3974,3975,1],[3981,3991,1],[3993,4028,1],[4038,4141,103],[4142,4144,1],[4146,4151,1],[4153,4154,1],[4157,4158,1],[4184,4185,1],[4190,4192,1],[4209,4212,1],[4226,4229,3],[4230,4237,7],[4253,4957,704],[4958,4959,1],[5906,5908,1],[5938,5939,1],[5970,5971,1],[6002,6003,1],[6068,6069,1],[6071,6077,1],[6086,6089,3],[6090,6099,1],[6109,6155,46],[6156,6157,1],[6159,6277,118],[6278,6313,35],[6432,6434,1],[6439,6440,1],[6450,6457,7],[6458,6459,1],[6679,6680,1],[6683,6742,59],[6744,6750,1],[6752,6754,2],[6757,6764,1],[6771,6780,1],[6783,6832,49],[6833,6845,1],[6847,6862,1],[6912,6915,1],[6964,6966,2],[6967,6970,1],[6972,6978,6],[7019,7027,1],[7040,7041,1],[7074,7077,1],[7080,7081,1],[7083,7085,1],[7142,7144,2],[7145,7149,4],[7151,7153,1],[7212,7219,1],[7222,7223,1],[7376,7378,1],[7380,7392,1],[7394,7400,1],[7405,7412,7],[7416,7417,1],[7616,7679,1],[8400,8412,1],[8417,8421,4],[8422,8432,1],[11503,11505,1],[11647,11744,97],[11745,11775,1],[12330,12333,1],[12441,12442,1],[42607,42612,5],[42613,42621,1],[42654,42655,1],[42736,42737,1],[43010,43014,4],[43019,43045,26],[43046,43052,6],[43204,43205,1],[43232,43249,1],[43263,43302,39],[43303,43309,1],[43335,43345,1],[43392,43394,1],[43443,43446,3],[43447,43449,1],[43452,43453,1],[43493,43561,68],[43562,43566,1],[43569,43570,1],[43573,43574,1],[43587,43596,9],[43644,43696,52],[43698,43700,1],[43703,43704,1],[43710,43711,1],[43713,43756,43],[43757,43766,9],[44005,44008,3],[44013,64286,20273],[65024,65039,1],[65056,65071,1],[66045,66272,227],[66422,66426,1],[68097,68099,1],[68101,68102,1],[68108,68111,1],[68152,68154,1],[68159,68325,166],[68326,68900,574],[68901,68903,1],[69291,69292,1],[69373,69375,1],[69446,69456,1],[69506,69509,1],[69633,69688,55],[69689,69702,1],[69744,69747,3],[69748,69759,11],[69760,69761,1],[69811,69814,1],[69817,69818,1],[69826,69888,62],[69889,69890,1],[69927,69931,1],[69933,69940,1],[70003,70016,13],[70017,70070,53],[70071,70078,1],[70089,70092,1],[70095,70191,96],[70192,70193,1],[70196,70198,2],[70199,70206,7],[70209,70367,158],[70371,70378,1],[70400,70401,1],[70459,70460,1],[70464,70502,38],[70503,70508,1],[70512,70516,1],[70712,70719,1],[70722,70724,1],[70726,70750,24],[70835,70840,1],[70842,70847,5],[70848,70850,2],[70851,71090,239],[71091,71093,1],[71100,71101,1],[71103,71104,1],[71132,71133,1],[71219,71226,1],[71229,71231,2],[71232,71339,107],[71341,71344,3],[71345,71349,1],[71351,71453,102],[71454,71455,1],[71458,71461,1],[71463,71467,1],[71727,71735,1],[71737,71738,1],[71995,71996,1],[71998,72003,5],[72148,72151,1],[72154,72155,1],[72160,72193,33],[72194,72202,1],[72243,72248,1],[72251,72254,1],[72263,72273,10],[72274,72278,1],[72281,72283,1],[72330,72342,1],[72344,72345,1],[72752,72758,1],[72760,72765,1],[72767,72850,83],[72851,72871,1],[72874,72880,1],[72882,72883,1],[72885,72886,1],[73009,73014,1],[73018,73020,2],[73021,73023,2],[73024,73029,1],[73031,73104,73],[73105,73109,4],[73111,73459,348],[73460,73472,12],[73473,73526,53],[73527,73530,1],[73536,73538,2],[78912,78919,7],[78920,78933,1],[92912,92916,1],[92976,92982,1],[94031,94095,64],[94096,94098,1],[94180,113821,19641],[113822,118528,4706],[118529,118573,1],[118576,118598,1],[119143,119145,1],[119163,119170,1],[119173,119179,1],[119210,119213,1],[119362,119364,1],[121344,121398,1],[121403,121452,1],[121461,121476,15],[121499,121503,1],[121505,121519,1],[122880,122886,1],[122888,122904,1],[122907,122913,1],[122915,122916,1],[122918,122922,1],[123023,123184,161],[123185,123190,1],[123566,123628,62],[123629,123631,1],[124140,124143,1],[125136,125142,1],[125252,125258,1],[917760,917999,1]]),_(d,"foldMn",[[921,953,32],[8126,8126,1]]),_(d,"N",[[48,57,1],[178,179,1],[185,188,3],[189,190,1],[1632,1641,1],[1776,1785,1],[1984,1993,1],[2406,2415,1],[2534,2543,1],[2548,2553,1],[2662,2671,1],[2790,2799,1],[2918,2927,1],[2930,2935,1],[3046,3058,1],[3174,3183,1],[3192,3198,1],[3302,3311,1],[3416,3422,1],[3430,3448,1],[3558,3567,1],[3664,3673,1],[3792,3801,1],[3872,3891,1],[4160,4169,1],[4240,4249,1],[4969,4988,1],[5870,5872,1],[6112,6121,1],[6128,6137,1],[6160,6169,1],[6470,6479,1],[6608,6618,1],[6784,6793,1],[6800,6809,1],[6992,7001,1],[7088,7097,1],[7232,7241,1],[7248,7257,1],[8304,8308,4],[8309,8313,1],[8320,8329,1],[8528,8578,1],[8581,8585,1],[9312,9371,1],[9450,9471,1],[10102,10131,1],[11517,12295,778],[12321,12329,1],[12344,12346,1],[12690,12693,1],[12832,12841,1],[12872,12879,1],[12881,12895,1],[12928,12937,1],[12977,12991,1],[42528,42537,1],[42726,42735,1],[43056,43061,1],[43216,43225,1],[43264,43273,1],[43472,43481,1],[43504,43513,1],[43600,43609,1],[44016,44025,1],[65296,65305,1],[65799,65843,1],[65856,65912,1],[65930,65931,1],[66273,66299,1],[66336,66339,1],[66369,66378,9],[66513,66517,1],[66720,66729,1],[67672,67679,1],[67705,67711,1],[67751,67759,1],[67835,67839,1],[67862,67867,1],[68028,68029,1],[68032,68047,1],[68050,68095,1],[68160,68168,1],[68221,68222,1],[68253,68255,1],[68331,68335,1],[68440,68447,1],[68472,68479,1],[68521,68527,1],[68858,68863,1],[68912,68921,1],[69216,69246,1],[69405,69414,1],[69457,69460,1],[69573,69579,1],[69714,69743,1],[69872,69881,1],[69942,69951,1],[70096,70105,1],[70113,70132,1],[70384,70393,1],[70736,70745,1],[70864,70873,1],[71248,71257,1],[71360,71369,1],[71472,71483,1],[71904,71922,1],[72016,72025,1],[72784,72812,1],[73040,73049,1],[73120,73129,1],[73552,73561,1],[73664,73684,1],[74752,74862,1],[92768,92777,1],[92864,92873,1],[93008,93017,1],[93019,93025,1],[93824,93846,1],[119488,119507,1],[119520,119539,1],[119648,119672,1],[120782,120831,1],[123200,123209,1],[123632,123641,1],[124144,124153,1],[125127,125135,1],[125264,125273,1],[126065,126123,1],[126125,126127,1],[126129,126132,1],[126209,126253,1],[126255,126269,1],[127232,127244,1],[130032,130041,1]]),_(d,"Nd",[[48,57,1],[1632,1641,1],[1776,1785,1],[1984,1993,1],[2406,2415,1],[2534,2543,1],[2662,2671,1],[2790,2799,1],[2918,2927,1],[3046,3055,1],[3174,3183,1],[3302,3311,1],[3430,3439,1],[3558,3567,1],[3664,3673,1],[3792,3801,1],[3872,3881,1],[4160,4169,1],[4240,4249,1],[6112,6121,1],[6160,6169,1],[6470,6479,1],[6608,6617,1],[6784,6793,1],[6800,6809,1],[6992,7001,1],[7088,7097,1],[7232,7241,1],[7248,7257,1],[42528,42537,1],[43216,43225,1],[43264,43273,1],[43472,43481,1],[43504,43513,1],[43600,43609,1],[44016,44025,1],[65296,65305,1],[66720,66729,1],[68912,68921,1],[69734,69743,1],[69872,69881,1],[69942,69951,1],[70096,70105,1],[70384,70393,1],[70736,70745,1],[70864,70873,1],[71248,71257,1],[71360,71369,1],[71472,71481,1],[71904,71913,1],[72016,72025,1],[72784,72793,1],[73040,73049,1],[73120,73129,1],[73552,73561,1],[92768,92777,1],[92864,92873,1],[93008,93017,1],[120782,120831,1],[123200,123209,1],[123632,123641,1],[124144,124153,1],[125264,125273,1],[130032,130041,1]]),_(d,"Nl",[[5870,5872,1],[8544,8578,1],[8581,8584,1],[12295,12321,26],[12322,12329,1],[12344,12346,1],[42726,42735,1],[65856,65908,1],[66369,66378,9],[66513,66517,1],[74752,74862,1]]),_(d,"No",[[178,179,1],[185,188,3],[189,190,1],[2548,2553,1],[2930,2935,1],[3056,3058,1],[3192,3198,1],[3416,3422,1],[3440,3448,1],[3882,3891,1],[4969,4988,1],[6128,6137,1],[6618,8304,1686],[8308,8313,1],[8320,8329,1],[8528,8543,1],[8585,9312,727],[9313,9371,1],[9450,9471,1],[10102,10131,1],[11517,12690,1173],[12691,12693,1],[12832,12841,1],[12872,12879,1],[12881,12895,1],[12928,12937,1],[12977,12991,1],[43056,43061,1],[65799,65843,1],[65909,65912,1],[65930,65931,1],[66273,66299,1],[66336,66339,1],[67672,67679,1],[67705,67711,1],[67751,67759,1],[67835,67839,1],[67862,67867,1],[68028,68029,1],[68032,68047,1],[68050,68095,1],[68160,68168,1],[68221,68222,1],[68253,68255,1],[68331,68335,1],[68440,68447,1],[68472,68479,1],[68521,68527,1],[68858,68863,1],[69216,69246,1],[69405,69414,1],[69457,69460,1],[69573,69579,1],[69714,69733,1],[70113,70132,1],[71482,71483,1],[71914,71922,1],[72794,72812,1],[73664,73684,1],[93019,93025,1],[93824,93846,1],[119488,119507,1],[119520,119539,1],[119648,119672,1],[125127,125135,1],[126065,126123,1],[126125,126127,1],[126129,126132,1],[126209,126253,1],[126255,126269,1],[127232,127244,1]]),_(d,"P",[[33,35,1],[37,42,1],[44,47,1],[58,59,1],[63,64,1],[91,93,1],[95,123,28],[125,161,36],[167,171,4],[182,183,1],[187,191,4],[894,903,9],[1370,1375,1],[1417,1418,1],[1470,1472,2],[1475,1478,3],[1523,1524,1],[1545,1546,1],[1548,1549,1],[1563,1565,2],[1566,1567,1],[1642,1645,1],[1748,1792,44],[1793,1805,1],[2039,2041,1],[2096,2110,1],[2142,2404,262],[2405,2416,11],[2557,2678,121],[2800,3191,391],[3204,3572,368],[3663,3674,11],[3675,3844,169],[3845,3858,1],[3860,3898,38],[3899,3901,1],[3973,4048,75],[4049,4052,1],[4057,4058,1],[4170,4175,1],[4347,4960,613],[4961,4968,1],[5120,5742,622],[5787,5788,1],[5867,5869,1],[5941,5942,1],[6100,6102,1],[6104,6106,1],[6144,6154,1],[6468,6469,1],[6686,6687,1],[6816,6822,1],[6824,6829,1],[7002,7008,1],[7037,7038,1],[7164,7167,1],[7227,7231,1],[7294,7295,1],[7360,7367,1],[7379,8208,829],[8209,8231,1],[8240,8259,1],[8261,8273,1],[8275,8286,1],[8317,8318,1],[8333,8334,1],[8968,8971,1],[9001,9002,1],[10088,10101,1],[10181,10182,1],[10214,10223,1],[10627,10648,1],[10712,10715,1],[10748,10749,1],[11513,11516,1],[11518,11519,1],[11632,11776,144],[11777,11822,1],[11824,11855,1],[11858,11869,1],[12289,12291,1],[12296,12305,1],[12308,12319,1],[12336,12349,13],[12448,12539,91],[42238,42239,1],[42509,42511,1],[42611,42622,11],[42738,42743,1],[43124,43127,1],[43214,43215,1],[43256,43258,1],[43260,43310,50],[43311,43359,48],[43457,43469,1],[43486,43487,1],[43612,43615,1],[43742,43743,1],[43760,43761,1],[44011,64830,20819],[64831,65040,209],[65041,65049,1],[65072,65106,1],[65108,65121,1],[65123,65128,5],[65130,65131,1],[65281,65283,1],[65285,65290,1],[65292,65295,1],[65306,65307,1],[65311,65312,1],[65339,65341,1],[65343,65371,28],[65373,65375,2],[65376,65381,1],[65792,65794,1],[66463,66512,49],[66927,67671,744],[67871,67903,32],[68176,68184,1],[68223,68336,113],[68337,68342,1],[68409,68415,1],[68505,68508,1],[69293,69461,168],[69462,69465,1],[69510,69513,1],[69703,69709,1],[69819,69820,1],[69822,69825,1],[69952,69955,1],[70004,70005,1],[70085,70088,1],[70093,70107,14],[70109,70111,1],[70200,70205,1],[70313,70731,418],[70732,70735,1],[70746,70747,1],[70749,70854,105],[71105,71127,1],[71233,71235,1],[71264,71276,1],[71353,71484,131],[71485,71486,1],[71739,72004,265],[72005,72006,1],[72162,72255,93],[72256,72262,1],[72346,72348,1],[72350,72354,1],[72448,72457,1],[72769,72773,1],[72816,72817,1],[73463,73464,1],[73539,73551,1],[73727,74864,1137],[74865,74868,1],[77809,77810,1],[92782,92783,1],[92917,92983,66],[92984,92987,1],[92996,93847,851],[93848,93850,1],[94178,113823,19645],[121479,121483,1],[125278,125279,1]]),_(d,"Pc",[[95,8255,8160],[8256,8276,20],[65075,65076,1],[65101,65103,1],[65343,65343,1]]),_(d,"Pd",[[45,1418,1373],[1470,5120,3650],[6150,8208,2058],[8209,8213,1],[11799,11802,3],[11834,11835,1],[11840,11869,29],[12316,12336,20],[12448,65073,52625],[65074,65112,38],[65123,65293,170],[69293,69293,1]]),_(d,"Pe",[[41,93,52],[125,3899,3774],[3901,5788,1887],[8262,8318,56],[8334,8969,635],[8971,9002,31],[10089,10101,2],[10182,10215,33],[10217,10223,2],[10628,10648,2],[10713,10715,2],[10749,11811,1062],[11813,11817,2],[11862,11868,2],[12297,12305,2],[12309,12315,2],[12318,12319,1],[64830,65048,218],[65078,65092,2],[65096,65114,18],[65116,65118,2],[65289,65341,52],[65373,65379,3]]),_(d,"Pf",[[187,8217,8030],[8221,8250,29],[11779,11781,2],[11786,11789,3],[11805,11809,4]]),_(d,"Pi",[[171,8216,8045],[8219,8220,1],[8223,8249,26],[11778,11780,2],[11785,11788,3],[11804,11808,4]]),_(d,"Po",[[33,35,1],[37,39,1],[42,46,2],[47,58,11],[59,63,4],[64,92,28],[161,167,6],[182,183,1],[191,894,703],[903,1370,467],[1371,1375,1],[1417,1472,55],[1475,1478,3],[1523,1524,1],[1545,1546,1],[1548,1549,1],[1563,1565,2],[1566,1567,1],[1642,1645,1],[1748,1792,44],[1793,1805,1],[2039,2041,1],[2096,2110,1],[2142,2404,262],[2405,2416,11],[2557,2678,121],[2800,3191,391],[3204,3572,368],[3663,3674,11],[3675,3844,169],[3845,3858,1],[3860,3973,113],[4048,4052,1],[4057,4058,1],[4170,4175,1],[4347,4960,613],[4961,4968,1],[5742,5867,125],[5868,5869,1],[5941,5942,1],[6100,6102,1],[6104,6106,1],[6144,6149,1],[6151,6154,1],[6468,6469,1],[6686,6687,1],[6816,6822,1],[6824,6829,1],[7002,7008,1],[7037,7038,1],[7164,7167,1],[7227,7231,1],[7294,7295,1],[7360,7367,1],[7379,8214,835],[8215,8224,9],[8225,8231,1],[8240,8248,1],[8251,8254,1],[8257,8259,1],[8263,8273,1],[8275,8277,2],[8278,8286,1],[11513,11516,1],[11518,11519,1],[11632,11776,144],[11777,11782,5],[11783,11784,1],[11787,11790,3],[11791,11798,1],[11800,11801,1],[11803,11806,3],[11807,11818,11],[11819,11822,1],[11824,11833,1],[11836,11839,1],[11841,11843,2],[11844,11855,1],[11858,11860,1],[12289,12291,1],[12349,12539,190],[42238,42239,1],[42509,42511,1],[42611,42622,11],[42738,42743,1],[43124,43127,1],[43214,43215,1],[43256,43258,1],[43260,43310,50],[43311,43359,48],[43457,43469,1],[43486,43487,1],[43612,43615,1],[43742,43743,1],[43760,43761,1],[44011,65040,21029],[65041,65046,1],[65049,65072,23],[65093,65094,1],[65097,65100,1],[65104,65106,1],[65108,65111,1],[65119,65121,1],[65128,65130,2],[65131,65281,150],[65282,65283,1],[65285,65287,1],[65290,65294,2],[65295,65306,11],[65307,65311,4],[65312,65340,28],[65377,65380,3],[65381,65792,411],[65793,65794,1],[66463,66512,49],[66927,67671,744],[67871,67903,32],[68176,68184,1],[68223,68336,113],[68337,68342,1],[68409,68415,1],[68505,68508,1],[69461,69465,1],[69510,69513,1],[69703,69709,1],[69819,69820,1],[69822,69825,1],[69952,69955,1],[70004,70005,1],[70085,70088,1],[70093,70107,14],[70109,70111,1],[70200,70205,1],[70313,70731,418],[70732,70735,1],[70746,70747,1],[70749,70854,105],[71105,71127,1],[71233,71235,1],[71264,71276,1],[71353,71484,131],[71485,71486,1],[71739,72004,265],[72005,72006,1],[72162,72255,93],[72256,72262,1],[72346,72348,1],[72350,72354,1],[72448,72457,1],[72769,72773,1],[72816,72817,1],[73463,73464,1],[73539,73551,1],[73727,74864,1137],[74865,74868,1],[77809,77810,1],[92782,92783,1],[92917,92983,66],[92984,92987,1],[92996,93847,851],[93848,93850,1],[94178,113823,19645],[121479,121483,1],[125278,125279,1]]),_(d,"Ps",[[40,91,51],[123,3898,3775],[3900,5787,1887],[8218,8222,4],[8261,8317,56],[8333,8968,635],[8970,9001,31],[10088,10100,2],[10181,10214,33],[10216,10222,2],[10627,10647,2],[10712,10714,2],[10748,11810,1062],[11812,11816,2],[11842,11861,19],[11863,11867,2],[12296,12304,2],[12308,12314,2],[12317,64831,52514],[65047,65077,30],[65079,65091,2],[65095,65113,18],[65115,65117,2],[65288,65339,51],[65371,65375,4],[65378,65378,1]]),_(d,"S",[[36,43,7],[60,62,1],[94,96,2],[124,126,2],[162,166,1],[168,169,1],[172,174,2],[175,177,1],[180,184,4],[215,247,32],[706,709,1],[722,735,1],[741,747,1],[749,751,2],[752,767,1],[885,900,15],[901,1014,113],[1154,1421,267],[1422,1423,1],[1542,1544,1],[1547,1550,3],[1551,1758,207],[1769,1789,20],[1790,2038,248],[2046,2047,1],[2184,2546,362],[2547,2554,7],[2555,2801,246],[2928,3059,131],[3060,3066,1],[3199,3407,208],[3449,3647,198],[3841,3843,1],[3859,3861,2],[3862,3863,1],[3866,3871,1],[3892,3896,2],[4030,4037,1],[4039,4044,1],[4046,4047,1],[4053,4056,1],[4254,4255,1],[5008,5017,1],[5741,6107,366],[6464,6622,158],[6623,6655,1],[7009,7018,1],[7028,7036,1],[8125,8127,2],[8128,8129,1],[8141,8143,1],[8157,8159,1],[8173,8175,1],[8189,8190,1],[8260,8274,14],[8314,8316,1],[8330,8332,1],[8352,8384,1],[8448,8449,1],[8451,8454,1],[8456,8457,1],[8468,8470,2],[8471,8472,1],[8478,8483,1],[8485,8489,2],[8494,8506,12],[8507,8512,5],[8513,8516,1],[8522,8525,1],[8527,8586,59],[8587,8592,5],[8593,8967,1],[8972,9e3,1],[9003,9254,1],[9280,9290,1],[9372,9449,1],[9472,10087,1],[10132,10180,1],[10183,10213,1],[10224,10626,1],[10649,10711,1],[10716,10747,1],[10750,11123,1],[11126,11157,1],[11159,11263,1],[11493,11498,1],[11856,11857,1],[11904,11929,1],[11931,12019,1],[12032,12245,1],[12272,12287,1],[12292,12306,14],[12307,12320,13],[12342,12343,1],[12350,12351,1],[12443,12444,1],[12688,12689,1],[12694,12703,1],[12736,12771,1],[12783,12800,17],[12801,12830,1],[12842,12871,1],[12880,12896,16],[12897,12927,1],[12938,12976,1],[12992,13311,1],[19904,19967,1],[42128,42182,1],[42752,42774,1],[42784,42785,1],[42889,42890,1],[43048,43051,1],[43062,43065,1],[43639,43641,1],[43867,43882,15],[43883,64297,20414],[64434,64450,1],[64832,64847,1],[64975,65020,45],[65021,65023,1],[65122,65124,2],[65125,65126,1],[65129,65284,155],[65291,65308,17],[65309,65310,1],[65342,65344,2],[65372,65374,2],[65504,65510,1],[65512,65518,1],[65532,65533,1],[65847,65855,1],[65913,65929,1],[65932,65934,1],[65936,65948,1],[65952,66e3,48],[66001,66044,1],[67703,67704,1],[68296,71487,3191],[73685,73713,1],[92988,92991,1],[92997,113820,20823],[118608,118723,1],[118784,119029,1],[119040,119078,1],[119081,119140,1],[119146,119148,1],[119171,119172,1],[119180,119209,1],[119214,119274,1],[119296,119361,1],[119365,119552,187],[119553,119638,1],[120513,120539,26],[120571,120597,26],[120629,120655,26],[120687,120713,26],[120745,120771,26],[120832,121343,1],[121399,121402,1],[121453,121460,1],[121462,121475,1],[121477,121478,1],[123215,123647,432],[126124,126128,4],[126254,126704,450],[126705,126976,271],[126977,127019,1],[127024,127123,1],[127136,127150,1],[127153,127167,1],[127169,127183,1],[127185,127221,1],[127245,127405,1],[127462,127490,1],[127504,127547,1],[127552,127560,1],[127568,127569,1],[127584,127589,1],[127744,128727,1],[128732,128748,1],[128752,128764,1],[128768,128886,1],[128891,128985,1],[128992,129003,1],[129008,129024,16],[129025,129035,1],[129040,129095,1],[129104,129113,1],[129120,129159,1],[129168,129197,1],[129200,129201,1],[129280,129619,1],[129632,129645,1],[129648,129660,1],[129664,129672,1],[129680,129725,1],[129727,129733,1],[129742,129755,1],[129760,129768,1],[129776,129784,1],[129792,129938,1],[129940,129994,1]]),_(d,"Sc",[[36,162,126],[163,165,1],[1423,1547,124],[2046,2047,1],[2546,2547,1],[2555,2801,246],[3065,3647,582],[6107,8352,2245],[8353,8384,1],[43064,65020,21956],[65129,65284,155],[65504,65505,1],[65509,65510,1],[73693,73696,1],[123647,126128,2481]]),_(d,"Sk",[[94,96,2],[168,175,7],[180,184,4],[706,709,1],[722,735,1],[741,747,1],[749,751,2],[752,767,1],[885,900,15],[901,2184,1283],[8125,8127,2],[8128,8129,1],[8141,8143,1],[8157,8159,1],[8173,8175,1],[8189,8190,1],[12443,12444,1],[42752,42774,1],[42784,42785,1],[42889,42890,1],[43867,43882,15],[43883,64434,20551],[64435,64450,1],[65342,65344,2],[65507,127995,62488],[127996,127999,1]]),_(d,"Sm",[[43,60,17],[61,62,1],[124,126,2],[172,177,5],[215,247,32],[1014,1542,528],[1543,1544,1],[8260,8274,14],[8314,8316,1],[8330,8332,1],[8472,8512,40],[8513,8516,1],[8523,8592,69],[8593,8596,1],[8602,8603,1],[8608,8614,3],[8622,8654,32],[8655,8658,3],[8660,8692,32],[8693,8959,1],[8992,8993,1],[9084,9115,31],[9116,9139,1],[9180,9185,1],[9655,9665,10],[9720,9727,1],[9839,10176,337],[10177,10180,1],[10183,10213,1],[10224,10239,1],[10496,10626,1],[10649,10711,1],[10716,10747,1],[10750,11007,1],[11056,11076,1],[11079,11084,1],[64297,65122,825],[65124,65126,1],[65291,65308,17],[65309,65310,1],[65372,65374,2],[65506,65513,7],[65514,65516,1],[120513,120539,26],[120571,120597,26],[120629,120655,26],[120687,120713,26],[120745,120771,26],[126704,126705,1]]),_(d,"So",[[166,169,3],[174,176,2],[1154,1421,267],[1422,1550,128],[1551,1758,207],[1769,1789,20],[1790,2038,248],[2554,2928,374],[3059,3064,1],[3066,3199,133],[3407,3449,42],[3841,3843,1],[3859,3861,2],[3862,3863,1],[3866,3871,1],[3892,3896,2],[4030,4037,1],[4039,4044,1],[4046,4047,1],[4053,4056,1],[4254,4255,1],[5008,5017,1],[5741,6464,723],[6622,6655,1],[7009,7018,1],[7028,7036,1],[8448,8449,1],[8451,8454,1],[8456,8457,1],[8468,8470,2],[8471,8478,7],[8479,8483,1],[8485,8489,2],[8494,8506,12],[8507,8522,15],[8524,8525,1],[8527,8586,59],[8587,8597,10],[8598,8601,1],[8604,8607,1],[8609,8610,1],[8612,8613,1],[8615,8621,1],[8623,8653,1],[8656,8657,1],[8659,8661,2],[8662,8691,1],[8960,8967,1],[8972,8991,1],[8994,9e3,1],[9003,9083,1],[9085,9114,1],[9140,9179,1],[9186,9254,1],[9280,9290,1],[9372,9449,1],[9472,9654,1],[9656,9664,1],[9666,9719,1],[9728,9838,1],[9840,10087,1],[10132,10175,1],[10240,10495,1],[11008,11055,1],[11077,11078,1],[11085,11123,1],[11126,11157,1],[11159,11263,1],[11493,11498,1],[11856,11857,1],[11904,11929,1],[11931,12019,1],[12032,12245,1],[12272,12287,1],[12292,12306,14],[12307,12320,13],[12342,12343,1],[12350,12351,1],[12688,12689,1],[12694,12703,1],[12736,12771,1],[12783,12800,17],[12801,12830,1],[12842,12871,1],[12880,12896,16],[12897,12927,1],[12938,12976,1],[12992,13311,1],[19904,19967,1],[42128,42182,1],[43048,43051,1],[43062,43063,1],[43065,43639,574],[43640,43641,1],[64832,64847,1],[64975,65021,46],[65022,65023,1],[65508,65512,4],[65517,65518,1],[65532,65533,1],[65847,65855,1],[65913,65929,1],[65932,65934,1],[65936,65948,1],[65952,66e3,48],[66001,66044,1],[67703,67704,1],[68296,71487,3191],[73685,73692,1],[73697,73713,1],[92988,92991,1],[92997,113820,20823],[118608,118723,1],[118784,119029,1],[119040,119078,1],[119081,119140,1],[119146,119148,1],[119171,119172,1],[119180,119209,1],[119214,119274,1],[119296,119361,1],[119365,119552,187],[119553,119638,1],[120832,121343,1],[121399,121402,1],[121453,121460,1],[121462,121475,1],[121477,121478,1],[123215,126124,2909],[126254,126976,722],[126977,127019,1],[127024,127123,1],[127136,127150,1],[127153,127167,1],[127169,127183,1],[127185,127221,1],[127245,127405,1],[127462,127490,1],[127504,127547,1],[127552,127560,1],[127568,127569,1],[127584,127589,1],[127744,127994,1],[128e3,128727,1],[128732,128748,1],[128752,128764,1],[128768,128886,1],[128891,128985,1],[128992,129003,1],[129008,129024,16],[129025,129035,1],[129040,129095,1],[129104,129113,1],[129120,129159,1],[129168,129197,1],[129200,129201,1],[129280,129619,1],[129632,129645,1],[129648,129660,1],[129664,129672,1],[129680,129725,1],[129727,129733,1],[129742,129755,1],[129760,129768,1],[129776,129784,1],[129792,129938,1],[129940,129994,1]]),_(d,"Z",[[32,160,128],[5760,8192,2432],[8193,8202,1],[8232,8233,1],[8239,8287,48],[12288,12288,1]]),_(d,"Zl",[[8232,8232,1]]),_(d,"Zp",[[8233,8233,1]]),_(d,"Zs",[[32,160,128],[5760,8192,2432],[8193,8202,1],[8239,8287,48],[12288,12288,1]]),_(d,"Adlam",[[125184,125259,1],[125264,125273,1],[125278,125279,1]]),_(d,"Ahom",[[71424,71450,1],[71453,71467,1],[71472,71494,1]]),_(d,"Anatolian_Hieroglyphs",[[82944,83526,1]]),_(d,"Arabic",[[1536,1540,1],[1542,1547,1],[1549,1562,1],[1564,1566,1],[1568,1599,1],[1601,1610,1],[1622,1647,1],[1649,1756,1],[1758,1791,1],[1872,1919,1],[2160,2190,1],[2192,2193,1],[2200,2273,1],[2275,2303,1],[64336,64450,1],[64467,64829,1],[64832,64911,1],[64914,64967,1],[64975,65008,33],[65009,65023,1],[65136,65140,1],[65142,65276,1],[69216,69246,1],[69373,69375,1],[126464,126467,1],[126469,126495,1],[126497,126498,1],[126500,126503,3],[126505,126514,1],[126516,126519,1],[126521,126523,2],[126530,126535,5],[126537,126541,2],[126542,126543,1],[126545,126546,1],[126548,126551,3],[126553,126561,2],[126562,126564,2],[126567,126570,1],[126572,126578,1],[126580,126583,1],[126585,126588,1],[126590,126592,2],[126593,126601,1],[126603,126619,1],[126625,126627,1],[126629,126633,1],[126635,126651,1],[126704,126705,1]]),_(d,"Armenian",[[1329,1366,1],[1369,1418,1],[1421,1423,1],[64275,64279,1]]),_(d,"Avestan",[[68352,68405,1],[68409,68415,1]]),_(d,"Balinese",[[6912,6988,1],[6992,7038,1]]),_(d,"Bamum",[[42656,42743,1],[92160,92728,1]]),_(d,"Bassa_Vah",[[92880,92909,1],[92912,92917,1]]),_(d,"Batak",[[7104,7155,1],[7164,7167,1]]),_(d,"Bengali",[[2432,2435,1],[2437,2444,1],[2447,2448,1],[2451,2472,1],[2474,2480,1],[2482,2486,4],[2487,2489,1],[2492,2500,1],[2503,2504,1],[2507,2510,1],[2519,2524,5],[2525,2527,2],[2528,2531,1],[2534,2558,1]]),_(d,"Bhaiksuki",[[72704,72712,1],[72714,72758,1],[72760,72773,1],[72784,72812,1]]),_(d,"Bopomofo",[[746,747,1],[12549,12591,1],[12704,12735,1]]),_(d,"Brahmi",[[69632,69709,1],[69714,69749,1],[69759,69759,1]]),_(d,"Braille",[[10240,10495,1]]),_(d,"Buginese",[[6656,6683,1],[6686,6687,1]]),_(d,"Buhid",[[5952,5971,1]]),_(d,"Canadian_Aboriginal",[[5120,5759,1],[6320,6389,1],[72368,72383,1]]),_(d,"Carian",[[66208,66256,1]]),_(d,"Caucasian_Albanian",[[66864,66915,1],[66927,66927,1]]),_(d,"Chakma",[[69888,69940,1],[69942,69959,1]]),_(d,"Cham",[[43520,43574,1],[43584,43597,1],[43600,43609,1],[43612,43615,1]]),_(d,"Cherokee",[[5024,5109,1],[5112,5117,1],[43888,43967,1]]),_(d,"Chorasmian",[[69552,69579,1]]),_(d,"Common",[[0,64,1],[91,96,1],[123,169,1],[171,185,1],[187,191,1],[215,247,32],[697,735,1],[741,745,1],[748,767,1],[884,894,10],[901,903,2],[1541,1548,7],[1563,1567,4],[1600,1757,157],[2274,2404,130],[2405,3647,1242],[4053,4056,1],[4347,5867,1520],[5868,5869,1],[5941,5942,1],[6146,6147,1],[6149,7379,1230],[7393,7401,8],[7402,7404,1],[7406,7411,1],[7413,7415,1],[7418,8192,774],[8193,8203,1],[8206,8292,1],[8294,8304,1],[8308,8318,1],[8320,8334,1],[8352,8384,1],[8448,8485,1],[8487,8489,1],[8492,8497,1],[8499,8525,1],[8527,8543,1],[8585,8587,1],[8592,9254,1],[9280,9290,1],[9312,10239,1],[10496,11123,1],[11126,11157,1],[11159,11263,1],[11776,11869,1],[12272,12292,1],[12294,12296,2],[12297,12320,1],[12336,12343,1],[12348,12351,1],[12443,12444,1],[12448,12539,91],[12540,12688,148],[12689,12703,1],[12736,12771,1],[12783,12832,49],[12833,12895,1],[12927,13007,1],[13055,13144,89],[13145,13311,1],[19904,19967,1],[42752,42785,1],[42888,42890,1],[43056,43065,1],[43310,43471,161],[43867,43882,15],[43883,64830,20947],[64831,65040,209],[65041,65049,1],[65072,65106,1],[65108,65126,1],[65128,65131,1],[65279,65281,2],[65282,65312,1],[65339,65344,1],[65371,65381,1],[65392,65438,46],[65439,65504,65],[65505,65510,1],[65512,65518,1],[65529,65533,1],[65792,65794,1],[65799,65843,1],[65847,65855,1],[65936,65948,1],[66e3,66044,1],[66273,66299,1],[113824,113827,1],[118608,118723,1],[118784,119029,1],[119040,119078,1],[119081,119142,1],[119146,119162,1],[119171,119172,1],[119180,119209,1],[119214,119274,1],[119488,119507,1],[119520,119539,1],[119552,119638,1],[119648,119672,1],[119808,119892,1],[119894,119964,1],[119966,119967,1],[119970,119973,3],[119974,119977,3],[119978,119980,1],[119982,119993,1],[119995,119997,2],[119998,120003,1],[120005,120069,1],[120071,120074,1],[120077,120084,1],[120086,120092,1],[120094,120121,1],[120123,120126,1],[120128,120132,1],[120134,120138,4],[120139,120144,1],[120146,120485,1],[120488,120779,1],[120782,120831,1],[126065,126132,1],[126209,126269,1],[126976,127019,1],[127024,127123,1],[127136,127150,1],[127153,127167,1],[127169,127183,1],[127185,127221,1],[127232,127405,1],[127462,127487,1],[127489,127490,1],[127504,127547,1],[127552,127560,1],[127568,127569,1],[127584,127589,1],[127744,128727,1],[128732,128748,1],[128752,128764,1],[128768,128886,1],[128891,128985,1],[128992,129003,1],[129008,129024,16],[129025,129035,1],[129040,129095,1],[129104,129113,1],[129120,129159,1],[129168,129197,1],[129200,129201,1],[129280,129619,1],[129632,129645,1],[129648,129660,1],[129664,129672,1],[129680,129725,1],[129727,129733,1],[129742,129755,1],[129760,129768,1],[129776,129784,1],[129792,129938,1],[129940,129994,1],[130032,130041,1],[917505,917536,31],[917537,917631,1]]),_(d,"foldCommon",[[924,956,32]]),_(d,"Coptic",[[994,1007,1],[11392,11507,1],[11513,11519,1]]),_(d,"Cuneiform",[[73728,74649,1],[74752,74862,1],[74864,74868,1],[74880,75075,1]]),_(d,"Cypriot",[[67584,67589,1],[67592,67594,2],[67595,67637,1],[67639,67640,1],[67644,67647,3]]),_(d,"Cypro_Minoan",[[77712,77810,1]]),_(d,"Cyrillic",[[1024,1156,1],[1159,1327,1],[7296,7304,1],[7467,7544,77],[11744,11775,1],[42560,42655,1],[65070,65071,1],[122928,122989,1],[123023,123023,1]]),_(d,"Deseret",[[66560,66639,1]]),_(d,"Devanagari",[[2304,2384,1],[2389,2403,1],[2406,2431,1],[43232,43263,1],[72448,72457,1]]),_(d,"Dives_Akuru",[[71936,71942,1],[71945,71948,3],[71949,71955,1],[71957,71958,1],[71960,71989,1],[71991,71992,1],[71995,72006,1],[72016,72025,1]]),_(d,"Dogra",[[71680,71739,1]]),_(d,"Duployan",[[113664,113770,1],[113776,113788,1],[113792,113800,1],[113808,113817,1],[113820,113823,1]]),_(d,"Egyptian_Hieroglyphs",[[77824,78933,1]]),_(d,"Elbasan",[[66816,66855,1]]),_(d,"Elymaic",[[69600,69622,1]]),_(d,"Ethiopic",[[4608,4680,1],[4682,4685,1],[4688,4694,1],[4696,4698,2],[4699,4701,1],[4704,4744,1],[4746,4749,1],[4752,4784,1],[4786,4789,1],[4792,4798,1],[4800,4802,2],[4803,4805,1],[4808,4822,1],[4824,4880,1],[4882,4885,1],[4888,4954,1],[4957,4988,1],[4992,5017,1],[11648,11670,1],[11680,11686,1],[11688,11694,1],[11696,11702,1],[11704,11710,1],[11712,11718,1],[11720,11726,1],[11728,11734,1],[11736,11742,1],[43777,43782,1],[43785,43790,1],[43793,43798,1],[43808,43814,1],[43816,43822,1],[124896,124902,1],[124904,124907,1],[124909,124910,1],[124912,124926,1]]),_(d,"Georgian",[[4256,4293,1],[4295,4301,6],[4304,4346,1],[4348,4351,1],[7312,7354,1],[7357,7359,1],[11520,11557,1],[11559,11565,6]]),_(d,"Glagolitic",[[11264,11359,1],[122880,122886,1],[122888,122904,1],[122907,122913,1],[122915,122916,1],[122918,122922,1]]),_(d,"Gothic",[[66352,66378,1]]),_(d,"Grantha",[[70400,70403,1],[70405,70412,1],[70415,70416,1],[70419,70440,1],[70442,70448,1],[70450,70451,1],[70453,70457,1],[70460,70468,1],[70471,70472,1],[70475,70477,1],[70480,70487,7],[70493,70499,1],[70502,70508,1],[70512,70516,1]]),_(d,"Greek",[[880,883,1],[885,887,1],[890,893,1],[895,900,5],[902,904,2],[905,906,1],[908,910,2],[911,929,1],[931,993,1],[1008,1023,1],[7462,7466,1],[7517,7521,1],[7526,7530,1],[7615,7936,321],[7937,7957,1],[7960,7965,1],[7968,8005,1],[8008,8013,1],[8016,8023,1],[8025,8031,2],[8032,8061,1],[8064,8116,1],[8118,8132,1],[8134,8147,1],[8150,8155,1],[8157,8175,1],[8178,8180,1],[8182,8190,1],[8486,43877,35391],[65856,65934,1],[65952,119296,53344],[119297,119365,1]]),_(d,"foldGreek",[[181,837,656]]),_(d,"Gujarati",[[2689,2691,1],[2693,2701,1],[2703,2705,1],[2707,2728,1],[2730,2736,1],[2738,2739,1],[2741,2745,1],[2748,2757,1],[2759,2761,1],[2763,2765,1],[2768,2784,16],[2785,2787,1],[2790,2801,1],[2809,2815,1]]),_(d,"Gunjala_Gondi",[[73056,73061,1],[73063,73064,1],[73066,73102,1],[73104,73105,1],[73107,73112,1],[73120,73129,1]]),_(d,"Gurmukhi",[[2561,2563,1],[2565,2570,1],[2575,2576,1],[2579,2600,1],[2602,2608,1],[2610,2611,1],[2613,2614,1],[2616,2617,1],[2620,2622,2],[2623,2626,1],[2631,2632,1],[2635,2637,1],[2641,2649,8],[2650,2652,1],[2654,2662,8],[2663,2678,1]]),_(d,"Han",[[11904,11929,1],[11931,12019,1],[12032,12245,1],[12293,12295,2],[12321,12329,1],[12344,12347,1],[13312,19903,1],[19968,40959,1],[63744,64109,1],[64112,64217,1],[94178,94179,1],[94192,94193,1],[131072,173791,1],[173824,177977,1],[177984,178205,1],[178208,183969,1],[183984,191456,1],[191472,192093,1],[194560,195101,1],[196608,201546,1],[201552,205743,1]]),_(d,"Hangul",[[4352,4607,1],[12334,12335,1],[12593,12686,1],[12800,12830,1],[12896,12926,1],[43360,43388,1],[44032,55203,1],[55216,55238,1],[55243,55291,1],[65440,65470,1],[65474,65479,1],[65482,65487,1],[65490,65495,1],[65498,65500,1]]),_(d,"Hanifi_Rohingya",[[68864,68903,1],[68912,68921,1]]),_(d,"Hanunoo",[[5920,5940,1]]),_(d,"Hatran",[[67808,67826,1],[67828,67829,1],[67835,67839,1]]),_(d,"Hebrew",[[1425,1479,1],[1488,1514,1],[1519,1524,1],[64285,64310,1],[64312,64316,1],[64318,64320,2],[64321,64323,2],[64324,64326,2],[64327,64335,1]]),_(d,"Hiragana",[[12353,12438,1],[12445,12447,1],[110593,110879,1],[110898,110928,30],[110929,110930,1],[127488,127488,1]]),_(d,"Imperial_Aramaic",[[67648,67669,1],[67671,67679,1]]),_(d,"Inherited",[[768,879,1],[1157,1158,1],[1611,1621,1],[1648,2385,737],[2386,2388,1],[6832,6862,1],[7376,7378,1],[7380,7392,1],[7394,7400,1],[7405,7412,7],[7416,7417,1],[7616,7679,1],[8204,8205,1],[8400,8432,1],[12330,12333,1],[12441,12442,1],[65024,65039,1],[65056,65069,1],[66045,66272,227],[70459,118528,48069],[118529,118573,1],[118576,118598,1],[119143,119145,1],[119163,119170,1],[119173,119179,1],[119210,119213,1],[917760,917999,1]]),_(d,"foldInherited",[[921,953,32],[8126,8126,1]]),_(d,"Inscriptional_Pahlavi",[[68448,68466,1],[68472,68479,1]]),_(d,"Inscriptional_Parthian",[[68416,68437,1],[68440,68447,1]]),_(d,"Javanese",[[43392,43469,1],[43472,43481,1],[43486,43487,1]]),_(d,"Kaithi",[[69760,69826,1],[69837,69837,1]]),_(d,"Kannada",[[3200,3212,1],[3214,3216,1],[3218,3240,1],[3242,3251,1],[3253,3257,1],[3260,3268,1],[3270,3272,1],[3274,3277,1],[3285,3286,1],[3293,3294,1],[3296,3299,1],[3302,3311,1],[3313,3315,1]]),_(d,"Katakana",[[12449,12538,1],[12541,12543,1],[12784,12799,1],[13008,13054,1],[13056,13143,1],[65382,65391,1],[65393,65437,1],[110576,110579,1],[110581,110587,1],[110589,110590,1],[110592,110880,288],[110881,110882,1],[110933,110948,15],[110949,110951,1]]),_(d,"Kawi",[[73472,73488,1],[73490,73530,1],[73534,73561,1]]),_(d,"Kayah_Li",[[43264,43309,1],[43311,43311,1]]),_(d,"Kharoshthi",[[68096,68099,1],[68101,68102,1],[68108,68115,1],[68117,68119,1],[68121,68149,1],[68152,68154,1],[68159,68168,1],[68176,68184,1]]),_(d,"Khitan_Small_Script",[[94180,101120,6940],[101121,101589,1]]),_(d,"Khmer",[[6016,6109,1],[6112,6121,1],[6128,6137,1],[6624,6655,1]]),_(d,"Khojki",[[70144,70161,1],[70163,70209,1]]),_(d,"Khudawadi",[[70320,70378,1],[70384,70393,1]]),_(d,"Lao",[[3713,3714,1],[3716,3718,2],[3719,3722,1],[3724,3747,1],[3749,3751,2],[3752,3773,1],[3776,3780,1],[3782,3784,2],[3785,3790,1],[3792,3801,1],[3804,3807,1]]),_(d,"Latin",[[65,90,1],[97,122,1],[170,186,16],[192,214,1],[216,246,1],[248,696,1],[736,740,1],[7424,7461,1],[7468,7516,1],[7522,7525,1],[7531,7543,1],[7545,7614,1],[7680,7935,1],[8305,8319,14],[8336,8348,1],[8490,8491,1],[8498,8526,28],[8544,8584,1],[11360,11391,1],[42786,42887,1],[42891,42954,1],[42960,42961,1],[42963,42965,2],[42966,42969,1],[42994,43007,1],[43824,43866,1],[43868,43876,1],[43878,43881,1],[64256,64262,1],[65313,65338,1],[65345,65370,1],[67456,67461,1],[67463,67504,1],[67506,67514,1],[122624,122654,1],[122661,122666,1]]),_(d,"Lepcha",[[7168,7223,1],[7227,7241,1],[7245,7247,1]]),_(d,"Limbu",[[6400,6430,1],[6432,6443,1],[6448,6459,1],[6464,6468,4],[6469,6479,1]]),_(d,"Linear_A",[[67072,67382,1],[67392,67413,1],[67424,67431,1]]),_(d,"Linear_B",[[65536,65547,1],[65549,65574,1],[65576,65594,1],[65596,65597,1],[65599,65613,1],[65616,65629,1],[65664,65786,1]]),_(d,"Lisu",[[42192,42239,1],[73648,73648,1]]),_(d,"Lycian",[[66176,66204,1]]),_(d,"Lydian",[[67872,67897,1],[67903,67903,1]]),_(d,"Mahajani",[[69968,70006,1]]),_(d,"Makasar",[[73440,73464,1]]),_(d,"Malayalam",[[3328,3340,1],[3342,3344,1],[3346,3396,1],[3398,3400,1],[3402,3407,1],[3412,3427,1],[3430,3455,1]]),_(d,"Mandaic",[[2112,2139,1],[2142,2142,1]]),_(d,"Manichaean",[[68288,68326,1],[68331,68342,1]]),_(d,"Marchen",[[72816,72847,1],[72850,72871,1],[72873,72886,1]]),_(d,"Masaram_Gondi",[[72960,72966,1],[72968,72969,1],[72971,73014,1],[73018,73020,2],[73021,73023,2],[73024,73031,1],[73040,73049,1]]),_(d,"Medefaidrin",[[93760,93850,1]]),_(d,"Meetei_Mayek",[[43744,43766,1],[43968,44013,1],[44016,44025,1]]),_(d,"Mende_Kikakui",[[124928,125124,1],[125127,125142,1]]),_(d,"Meroitic_Cursive",[[68e3,68023,1],[68028,68047,1],[68050,68095,1]]),_(d,"Meroitic_Hieroglyphs",[[67968,67999,1]]),_(d,"Miao",[[93952,94026,1],[94031,94087,1],[94095,94111,1]]),_(d,"Modi",[[71168,71236,1],[71248,71257,1]]),_(d,"Mongolian",[[6144,6145,1],[6148,6150,2],[6151,6169,1],[6176,6264,1],[6272,6314,1],[71264,71276,1]]),_(d,"Mro",[[92736,92766,1],[92768,92777,1],[92782,92783,1]]),_(d,"Multani",[[70272,70278,1],[70280,70282,2],[70283,70285,1],[70287,70301,1],[70303,70313,1]]),_(d,"Myanmar",[[4096,4255,1],[43488,43518,1],[43616,43647,1]]),_(d,"Nabataean",[[67712,67742,1],[67751,67759,1]]),_(d,"Nag_Mundari",[[124112,124153,1]]),_(d,"Nandinagari",[[72096,72103,1],[72106,72151,1],[72154,72164,1]]),_(d,"New_Tai_Lue",[[6528,6571,1],[6576,6601,1],[6608,6618,1],[6622,6623,1]]),_(d,"Newa",[[70656,70747,1],[70749,70753,1]]),_(d,"Nko",[[1984,2042,1],[2045,2047,1]]),_(d,"Nushu",[[94177,110960,16783],[110961,111355,1]]),_(d,"Nyiakeng_Puachue_Hmong",[[123136,123180,1],[123184,123197,1],[123200,123209,1],[123214,123215,1]]),_(d,"Ogham",[[5760,5788,1]]),_(d,"Ol_Chiki",[[7248,7295,1]]),_(d,"Old_Hungarian",[[68736,68786,1],[68800,68850,1],[68858,68863,1]]),_(d,"Old_Italic",[[66304,66339,1],[66349,66351,1]]),_(d,"Old_North_Arabian",[[68224,68255,1]]),_(d,"Old_Permic",[[66384,66426,1]]),_(d,"Old_Persian",[[66464,66499,1],[66504,66517,1]]),_(d,"Old_Sogdian",[[69376,69415,1]]),_(d,"Old_South_Arabian",[[68192,68223,1]]),_(d,"Old_Turkic",[[68608,68680,1]]),_(d,"Old_Uyghur",[[69488,69513,1]]),_(d,"Oriya",[[2817,2819,1],[2821,2828,1],[2831,2832,1],[2835,2856,1],[2858,2864,1],[2866,2867,1],[2869,2873,1],[2876,2884,1],[2887,2888,1],[2891,2893,1],[2901,2903,1],[2908,2909,1],[2911,2915,1],[2918,2935,1]]),_(d,"Osage",[[66736,66771,1],[66776,66811,1]]),_(d,"Osmanya",[[66688,66717,1],[66720,66729,1]]),_(d,"Pahawh_Hmong",[[92928,92997,1],[93008,93017,1],[93019,93025,1],[93027,93047,1],[93053,93071,1]]),_(d,"Palmyrene",[[67680,67711,1]]),_(d,"Pau_Cin_Hau",[[72384,72440,1]]),_(d,"Phags_Pa",[[43072,43127,1]]),_(d,"Phoenician",[[67840,67867,1],[67871,67871,1]]),_(d,"Psalter_Pahlavi",[[68480,68497,1],[68505,68508,1],[68521,68527,1]]),_(d,"Rejang",[[43312,43347,1],[43359,43359,1]]),_(d,"Runic",[[5792,5866,1],[5870,5880,1]]),_(d,"Samaritan",[[2048,2093,1],[2096,2110,1]]),_(d,"Saurashtra",[[43136,43205,1],[43214,43225,1]]),_(d,"Sharada",[[70016,70111,1]]),_(d,"Shavian",[[66640,66687,1]]),_(d,"Siddham",[[71040,71093,1],[71096,71133,1]]),_(d,"SignWriting",[[120832,121483,1],[121499,121503,1],[121505,121519,1]]),_(d,"Sinhala",[[3457,3459,1],[3461,3478,1],[3482,3505,1],[3507,3515,1],[3517,3520,3],[3521,3526,1],[3530,3535,5],[3536,3540,1],[3542,3544,2],[3545,3551,1],[3558,3567,1],[3570,3572,1],[70113,70132,1]]),_(d,"Sogdian",[[69424,69465,1]]),_(d,"Sora_Sompeng",[[69840,69864,1],[69872,69881,1]]),_(d,"Soyombo",[[72272,72354,1]]),_(d,"Sundanese",[[7040,7103,1],[7360,7367,1]]),_(d,"Syloti_Nagri",[[43008,43052,1]]),_(d,"Syriac",[[1792,1805,1],[1807,1866,1],[1869,1871,1],[2144,2154,1]]),_(d,"Tagalog",[[5888,5909,1],[5919,5919,1]]),_(d,"Tagbanwa",[[5984,5996,1],[5998,6e3,1],[6002,6003,1]]),_(d,"Tai_Le",[[6480,6509,1],[6512,6516,1]]),_(d,"Tai_Tham",[[6688,6750,1],[6752,6780,1],[6783,6793,1],[6800,6809,1],[6816,6829,1]]),_(d,"Tai_Viet",[[43648,43714,1],[43739,43743,1]]),_(d,"Takri",[[71296,71353,1],[71360,71369,1]]),_(d,"Tamil",[[2946,2947,1],[2949,2954,1],[2958,2960,1],[2962,2965,1],[2969,2970,1],[2972,2974,2],[2975,2979,4],[2980,2984,4],[2985,2986,1],[2990,3001,1],[3006,3010,1],[3014,3016,1],[3018,3021,1],[3024,3031,7],[3046,3066,1],[73664,73713,1],[73727,73727,1]]),_(d,"Tangsa",[[92784,92862,1],[92864,92873,1]]),_(d,"Tangut",[[94176,94208,32],[94209,100343,1],[100352,101119,1],[101632,101640,1]]),_(d,"Telugu",[[3072,3084,1],[3086,3088,1],[3090,3112,1],[3114,3129,1],[3132,3140,1],[3142,3144,1],[3146,3149,1],[3157,3158,1],[3160,3162,1],[3165,3168,3],[3169,3171,1],[3174,3183,1],[3191,3199,1]]),_(d,"Thaana",[[1920,1969,1]]),_(d,"Thai",[[3585,3642,1],[3648,3675,1]]),_(d,"Tibetan",[[3840,3911,1],[3913,3948,1],[3953,3991,1],[3993,4028,1],[4030,4044,1],[4046,4052,1],[4057,4058,1]]),_(d,"Tifinagh",[[11568,11623,1],[11631,11632,1],[11647,11647,1]]),_(d,"Tirhuta",[[70784,70855,1],[70864,70873,1]]),_(d,"Toto",[[123536,123566,1]]),_(d,"Ugaritic",[[66432,66461,1],[66463,66463,1]]),_(d,"Vai",[[42240,42539,1]]),_(d,"Vithkuqi",[[66928,66938,1],[66940,66954,1],[66956,66962,1],[66964,66965,1],[66967,66977,1],[66979,66993,1],[66995,67001,1],[67003,67004,1]]),_(d,"Wancho",[[123584,123641,1],[123647,123647,1]]),_(d,"Warang_Citi",[[71840,71922,1],[71935,71935,1]]),_(d,"Yezidi",[[69248,69289,1],[69291,69293,1],[69296,69297,1]]),_(d,"Yi",[[40960,42124,1],[42128,42182,1]]),_(d,"Zanabazar_Square",[[72192,72263,1]]),_(d,"CATEGORIES",new Map([["C",d.C],["Cc",d.Cc],["Cf",d.Cf],["Co",d.Co],["Cs",d.Cs],["L",d.L],["Ll",d.Ll],["Lm",d.Lm],["Lo",d.Lo],["Lt",d.Lt],["Lu",d.Lu],["M",d.M],["Mc",d.Mc],["Me",d.Me],["Mn",d.Mn],["N",d.N],["Nd",d.Nd],["Nl",d.Nl],["No",d.No],["P",d.P],["Pc",d.Pc],["Pd",d.Pd],["Pe",d.Pe],["Pf",d.Pf],["Pi",d.Pi],["Po",d.Po],["Ps",d.Ps],["S",d.S],["Sc",d.Sc],["Sk",d.Sk],["Sm",d.Sm],["So",d.So],["Z",d.Z],["Zl",d.Zl],["Zp",d.Zp],["Zs",d.Zs]])),_(d,"SCRIPTS",new Map([["Adlam",d.Adlam],["Ahom",d.Ahom],["Anatolian_Hieroglyphs",d.Anatolian_Hieroglyphs],["Arabic",d.Arabic],["Armenian",d.Armenian],["Avestan",d.Avestan],["Balinese",d.Balinese],["Bamum",d.Bamum],["Bassa_Vah",d.Bassa_Vah],["Batak",d.Batak],["Bengali",d.Bengali],["Bhaiksuki",d.Bhaiksuki],["Bopomofo",d.Bopomofo],["Brahmi",d.Brahmi],["Braille",d.Braille],["Buginese",d.Buginese],["Buhid",d.Buhid],["Canadian_Aboriginal",d.Canadian_Aboriginal],["Carian",d.Carian],["Caucasian_Albanian",d.Caucasian_Albanian],["Chakma",d.Chakma],["Cham",d.Cham],["Cherokee",d.Cherokee],["Chorasmian",d.Chorasmian],["Common",d.Common],["Coptic",d.Coptic],["Cuneiform",d.Cuneiform],["Cypriot",d.Cypriot],["Cypro_Minoan",d.Cypro_Minoan],["Cyrillic",d.Cyrillic],["Deseret",d.Deseret],["Devanagari",d.Devanagari],["Dives_Akuru",d.Dives_Akuru],["Dogra",d.Dogra],["Duployan",d.Duployan],["Egyptian_Hieroglyphs",d.Egyptian_Hieroglyphs],["Elbasan",d.Elbasan],["Elymaic",d.Elymaic],["Ethiopic",d.Ethiopic],["Georgian",d.Georgian],["Glagolitic",d.Glagolitic],["Gothic",d.Gothic],["Grantha",d.Grantha],["Greek",d.Greek],["Gujarati",d.Gujarati],["Gunjala_Gondi",d.Gunjala_Gondi],["Gurmukhi",d.Gurmukhi],["Han",d.Han],["Hangul",d.Hangul],["Hanifi_Rohingya",d.Hanifi_Rohingya],["Hanunoo",d.Hanunoo],["Hatran",d.Hatran],["Hebrew",d.Hebrew],["Hiragana",d.Hiragana],["Imperial_Aramaic",d.Imperial_Aramaic],["Inherited",d.Inherited],["Inscriptional_Pahlavi",d.Inscriptional_Pahlavi],["Inscriptional_Parthian",d.Inscriptional_Parthian],["Javanese",d.Javanese],["Kaithi",d.Kaithi],["Kannada",d.Kannada],["Katakana",d.Katakana],["Kawi",d.Kawi],["Kayah_Li",d.Kayah_Li],["Kharoshthi",d.Kharoshthi],["Khitan_Small_Script",d.Khitan_Small_Script],["Khmer",d.Khmer],["Khojki",d.Khojki],["Khudawadi",d.Khudawadi],["Lao",d.Lao],["Latin",d.Latin],["Lepcha",d.Lepcha],["Limbu",d.Limbu],["Linear_A",d.Linear_A],["Linear_B",d.Linear_B],["Lisu",d.Lisu],["Lycian",d.Lycian],["Lydian",d.Lydian],["Mahajani",d.Mahajani],["Makasar",d.Makasar],["Malayalam",d.Malayalam],["Mandaic",d.Mandaic],["Manichaean",d.Manichaean],["Marchen",d.Marchen],["Masaram_Gondi",d.Masaram_Gondi],["Medefaidrin",d.Medefaidrin],["Meetei_Mayek",d.Meetei_Mayek],["Mende_Kikakui",d.Mende_Kikakui],["Meroitic_Cursive",d.Meroitic_Cursive],["Meroitic_Hieroglyphs",d.Meroitic_Hieroglyphs],["Miao",d.Miao],["Modi",d.Modi],["Mongolian",d.Mongolian],["Mro",d.Mro],["Multani",d.Multani],["Myanmar",d.Myanmar],["Nabataean",d.Nabataean],["Nag_Mundari",d.Nag_Mundari],["Nandinagari",d.Nandinagari],["New_Tai_Lue",d.New_Tai_Lue],["Newa",d.Newa],["Nko",d.Nko],["Nushu",d.Nushu],["Nyiakeng_Puachue_Hmong",d.Nyiakeng_Puachue_Hmong],["Ogham",d.Ogham],["Ol_Chiki",d.Ol_Chiki],["Old_Hungarian",d.Old_Hungarian],["Old_Italic",d.Old_Italic],["Old_North_Arabian",d.Old_North_Arabian],["Old_Permic",d.Old_Permic],["Old_Persian",d.Old_Persian],["Old_Sogdian",d.Old_Sogdian],["Old_South_Arabian",d.Old_South_Arabian],["Old_Turkic",d.Old_Turkic],["Old_Uyghur",d.Old_Uyghur],["Oriya",d.Oriya],["Osage",d.Osage],["Osmanya",d.Osmanya],["Pahawh_Hmong",d.Pahawh_Hmong],["Palmyrene",d.Palmyrene],["Pau_Cin_Hau",d.Pau_Cin_Hau],["Phags_Pa",d.Phags_Pa],["Phoenician",d.Phoenician],["Psalter_Pahlavi",d.Psalter_Pahlavi],["Rejang",d.Rejang],["Runic",d.Runic],["Samaritan",d.Samaritan],["Saurashtra",d.Saurashtra],["Sharada",d.Sharada],["Shavian",d.Shavian],["Siddham",d.Siddham],["SignWriting",d.SignWriting],["Sinhala",d.Sinhala],["Sogdian",d.Sogdian],["Sora_Sompeng",d.Sora_Sompeng],["Soyombo",d.Soyombo],["Sundanese",d.Sundanese],["Syloti_Nagri",d.Syloti_Nagri],["Syriac",d.Syriac],["Tagalog",d.Tagalog],["Tagbanwa",d.Tagbanwa],["Tai_Le",d.Tai_Le],["Tai_Tham",d.Tai_Tham],["Tai_Viet",d.Tai_Viet],["Takri",d.Takri],["Tamil",d.Tamil],["Tangsa",d.Tangsa],["Tangut",d.Tangut],["Telugu",d.Telugu],["Thaana",d.Thaana],["Thai",d.Thai],["Tibetan",d.Tibetan],["Tifinagh",d.Tifinagh],["Tirhuta",d.Tirhuta],["Toto",d.Toto],["Ugaritic",d.Ugaritic],["Vai",d.Vai],["Vithkuqi",d.Vithkuqi],["Wancho",d.Wancho],["Warang_Citi",d.Warang_Citi],["Yezidi",d.Yezidi],["Yi",d.Yi],["Zanabazar_Square",d.Zanabazar_Square]])),_(d,"FOLD_CATEGORIES",new Map([["L",d.foldL],["Ll",d.foldLl],["Lt",d.foldLt],["Lu",d.foldLu],["M",d.foldM],["Mn",d.foldMn]])),_(d,"FOLD_SCRIPT",new Map([["Common",d.foldCommon],["Greek",d.foldGreek],["Inherited",d.foldInherited]]));let He=d;class X{static is32(e,t){let r=0,s=e.length;for(;r<s;){let i=r+Math.floor((s-r)/2),o=e[i];if(o[0]<=t&&t<=o[1])return(t-o[0])%o[2]===0;t<o[0]?s=i:r=i+1}return!1}static is(e,t){if(t<=this.MAX_LATIN1){for(let r of e)if(!(t>r[1]))return t<r[0]?!1:(t-r[0])%r[2]===0;return!1}return e.length>0&&t>=e[0][0]&&this.is32(e,t)}static isUpper(e){if(e<=this.MAX_LATIN1){const t=String.fromCodePoint(e);return t.toUpperCase()===t&&t.toLowerCase()!==t}return this.is(He.Upper,e)}static isPrint(e){return e<=this.MAX_LATIN1?e>=32&&e<127||e>=161&&e!==173:this.is(He.L,e)||this.is(He.M,e)||this.is(He.N,e)||this.is(He.P,e)||this.is(He.S,e)}static simpleFold(e){if(He.CASE_ORBIT.has(e))return He.CASE_ORBIT.get(e);const t=S.toLowerCase(e);return t!==e?t:S.toUpperCase(e)}static equalsIgnoreCase(e,t){if(e<0||t<0||e===t)return!0;if(e<=this.MAX_ASCII&&t<=this.MAX_ASCII)return S.CODES.get("A")<=e&&e<=S.CODES.get("Z")&&(e|=32),S.CODES.get("A")<=t&&t<=S.CODES.get("Z")&&(t|=32),e===t;for(let r=this.simpleFold(e);r!==e;r=this.simpleFold(r))if(r===t)return!0;return!1}}_(X,"MAX_RUNE",1114111),_(X,"MAX_ASCII",127),_(X,"MAX_LATIN1",255),_(X,"MAX_BMP",65535),_(X,"MIN_FOLD",65),_(X,"MAX_FOLD",125251);class ee{static emptyInts(){return[]}static isalnum(e){return S.CODES.get("0")<=e&&e<=S.CODES.get("9")||S.CODES.get("a")<=e&&e<=S.CODES.get("z")||S.CODES.get("A")<=e&&e<=S.CODES.get("Z")}static unhex(e){return S.CODES.get("0")<=e&&e<=S.CODES.get("9")?e-S.CODES.get("0"):S.CODES.get("a")<=e&&e<=S.CODES.get("f")?e-S.CODES.get("a")+10:S.CODES.get("A")<=e&&e<=S.CODES.get("F")?e-S.CODES.get("A")+10:-1}static escapeRune(e){let t="";if(X.isPrint(e))this.METACHARACTERS.indexOf(String.fromCodePoint(e))>=0&&(t+="\\"),t+=String.fromCodePoint(e);else switch(e){case S.CODES.get('"'):t+='\\"';break;case S.CODES.get("\\"):t+="\\\\";break;case S.CODES.get("	"):t+="\\t";break;case S.CODES.get(`
`):t+="\\n";break;case S.CODES.get("\r"):t+="\\r";break;case S.CODES.get("\b"):t+="\\b";break;case S.CODES.get("\f"):t+="\\f";break;default:{let r=e.toString(16);e<256?(t+="\\x",r.length===1&&(t+="0"),t+=r):t+=`\\x{${r}}`;break}}return t}static stringToRunes(e){return String(e).split("").map(t=>t.codePointAt(0))}static runeToString(e){return String.fromCodePoint(e)}static isWordRune(e){return S.CODES.get("a")<=e&&e<=S.CODES.get("z")||S.CODES.get("A")<=e&&e<=S.CODES.get("Z")||S.CODES.get("0")<=e&&e<=S.CODES.get("9")||e===S.CODES.get("_")}static emptyOpContext(e,t){let r=0;return e<0&&(r|=this.EMPTY_BEGIN_TEXT|this.EMPTY_BEGIN_LINE),e===S.CODES.get(`
`)&&(r|=this.EMPTY_BEGIN_LINE),t<0&&(r|=this.EMPTY_END_TEXT|this.EMPTY_END_LINE),t===S.CODES.get(`
`)&&(r|=this.EMPTY_END_LINE),this.isWordRune(e)!==this.isWordRune(t)?r|=this.EMPTY_WORD_BOUNDARY:r|=this.EMPTY_NO_WORD_BOUNDARY,r}static quoteMeta(e){return e.split("").map(t=>this.METACHARACTERS.indexOf(t)>=0?`\\${t}`:t).join("")}static charCount(e){return e>X.MAX_BMP?2:1}static stringToUtf8ByteArray(e){if(globalThis.TextEncoder)return Array.from(new TextEncoder().encode(e));{let t=[],r=0;for(let s=0;s<e.length;s++){let i=e.charCodeAt(s);i<128?t[r++]=i:i<2048?(t[r++]=i>>6|192,t[r++]=i&63|128):(i&64512)===55296&&s+1<e.length&&(e.charCodeAt(s+1)&64512)===56320?(i=65536+((i&1023)<<10)+(e.charCodeAt(++s)&1023),t[r++]=i>>18|240,t[r++]=i>>12&63|128,t[r++]=i>>6&63|128,t[r++]=i&63|128):(t[r++]=i>>12|224,t[r++]=i>>6&63|128,t[r++]=i&63|128)}return t}}static utf8ByteArrayToString(e){if(globalThis.TextDecoder)return new TextDecoder("utf-8").decode(new Uint8Array(e));{let t=[],r=0,s=0;for(;r<e.length;){let i=e[r++];if(i<128)t[s++]=String.fromCharCode(i);else if(i>191&&i<224){let o=e[r++];t[s++]=String.fromCharCode((i&31)<<6|o&63)}else if(i>239&&i<365){let o=e[r++],c=e[r++],u=e[r++],l=((i&7)<<18|(o&63)<<12|(c&63)<<6|u&63)-65536;t[s++]=String.fromCharCode(55296+(l>>10)),t[s++]=String.fromCharCode(56320+(l&1023))}else{let o=e[r++],c=e[r++];t[s++]=String.fromCharCode((i&15)<<12|(o&63)<<6|c&63)}}return t.join("")}}}_(ee,"METACHARACTERS","\\.+*?()|[]{}^$"),_(ee,"EMPTY_BEGIN_LINE",1),_(ee,"EMPTY_END_LINE",2),_(ee,"EMPTY_BEGIN_TEXT",4),_(ee,"EMPTY_END_TEXT",8),_(ee,"EMPTY_WORD_BOUNDARY",16),_(ee,"EMPTY_NO_WORD_BOUNDARY",32),_(ee,"EMPTY_ALL",-1);const ff=(n=[],e=0)=>{const t={};for(let r=0;r<n.length;r++){const s=n[r],i=e+r;t[s]=i,t[i]=s}return Object.freeze(t)},Ms=class Ms{getEncoding(){throw Error("not implemented")}isUTF8Encoding(){return this.getEncoding()===Ms.Encoding.UTF_8}isUTF16Encoding(){return this.getEncoding()===Ms.Encoding.UTF_16}};_(Ms,"Encoding",ff(["UTF_16","UTF_8"]));let Dn=Ms;class bl extends Dn{constructor(e=null){super(),this.bytes=e}getEncoding(){return Dn.Encoding.UTF_8}asCharSequence(){return ee.utf8ByteArrayToString(this.bytes)}asBytes(){return this.bytes}length(){return this.bytes.length}}class gm extends Dn{constructor(e=null){super(),this.charSequence=e}getEncoding(){return Dn.Encoding.UTF_16}asCharSequence(){return this.charSequence}asBytes(){return this.charSequence.toString().split("").map(e=>e.codePointAt(0))}length(){return this.charSequence.length}}class lo{static utf16(e){return new gm(e)}static utf8(e){return Array.isArray(e)?new bl(e):new bl(ee.stringToUtf8ByteArray(e))}}class Uo extends Error{constructor(e){super(e),this.name="RE2JSException"}}class Ae extends Uo{constructor(e,t=null){let r=`error parsing regexp: ${e}`;t&&(r+=`: \`${t}\``),super(r),this.name="RE2JSSyntaxException",this.message=r,this.error=e,this.input=t}getDescription(){return this.error}getPattern(){return this.input}}class _m extends Uo{constructor(e){super(e),this.name="RE2JSCompileException"}}class Yt extends Uo{constructor(e){super(e),this.name="RE2JSGroupException"}}class ym extends Uo{constructor(e){super(e),this.name="RE2JSFlagsException"}}class Em{static quoteReplacement(e){return e.indexOf("\\")<0&&e.indexOf("$")<0?e:e.split("").map(t=>{const r=t.codePointAt(0);return r===S.CODES["\\"]||r===S.CODES.$?`\\${t}`:t}).join("")}constructor(e,t){if(e===null)throw new Error("pattern is null");this.patternInput=e;const r=this.patternInput.re2();this.patternGroupCount=r.numberOfCapturingGroups(),this.groups=[],this.namedGroups=r.namedGroups,t instanceof Dn?this.resetMatcherInput(t):Array.isArray(t)?this.resetMatcherInput(lo.utf8(t)):this.resetMatcherInput(lo.utf16(t))}pattern(){return this.patternInput}reset(){return this.matcherInputLength=this.matcherInput.length(),this.appendPos=0,this.hasMatch=!1,this.hasGroups=!1,this.anchorFlag=0,this}resetMatcherInput(e){if(e===null)throw new Error("input is null");return this.matcherInput=e,this.reset(),this}start(e=0){if(typeof e=="string"){const t=this.namedGroups[e];if(!Number.isFinite(t))throw new Yt(`group '${e}' not found`);e=t}return this.loadGroup(e),this.groups[2*e]}end(e=0){if(typeof e=="string"){const t=this.namedGroups[e];if(!Number.isFinite(t))throw new Yt(`group '${e}' not found`);e=t}return this.loadGroup(e),this.groups[2*e+1]}group(e=0){if(typeof e=="string"){const s=this.namedGroups[e];if(!Number.isFinite(s))throw new Yt(`group '${e}' not found`);e=s}const t=this.start(e),r=this.end(e);return t<0&&r<0?null:this.substring(t,r)}groupCount(){return this.patternGroupCount}loadGroup(e){if(e<0||e>this.patternGroupCount)throw new Yt(`Group index out of bounds: ${e}`);if(!this.hasMatch)throw new Yt("perhaps no match attempted");if(e===0||this.hasGroups)return;let t=this.groups[1]+1;t>this.matcherInputLength&&(t=this.matcherInputLength);const r=this.patternInput.re2().matchMachineInput(this.matcherInput,this.groups[0],t,this.anchorFlag,1+this.patternGroupCount);if(!r[0])throw new Yt("inconsistency in matching group data");this.groups=r[1],this.hasGroups=!0}matches(){return this.genMatch(0,q.ANCHOR_BOTH)}lookingAt(){return this.genMatch(0,q.ANCHOR_START)}find(e=null){if(e!==null){if(e<0||e>this.matcherInputLength)throw new Yt(`start index out of bounds: ${e}`);return this.reset(),this.genMatch(e,0)}return e=0,this.hasMatch&&(e=this.groups[1],this.groups[0]===this.groups[1]&&e++),this.genMatch(e,q.UNANCHORED)}genMatch(e,t){const r=this.patternInput.re2().matchMachineInput(this.matcherInput,e,this.matcherInputLength,t,1);return r[0]?(this.groups=r[1],this.hasMatch=!0,this.hasGroups=!1,this.anchorFlag=t,!0):!1}substring(e,t){return this.matcherInput.isUTF8Encoding()?ee.utf8ByteArrayToString(this.matcherInput.asBytes().slice(e,t)):this.matcherInput.asCharSequence().substring(e,t).toString()}inputLength(){return this.matcherInputLength}appendReplacement(e,t=!1){let r="";const s=this.start(),i=this.end();return this.appendPos<s&&(r+=this.substring(this.appendPos,s)),this.appendPos=i,r+=t?this.appendReplacementInternalPerl(e):this.appendReplacementInternal(e),r}appendReplacementInternal(e){let t="",r=0;const s=e.length;for(let i=0;i<s-1;i++){if(e.codePointAt(i)===S.CODES.get("\\")){r<i&&(t+=e.substring(r,i)),i++,r=i;continue}if(e.codePointAt(i)===S.CODES.get("$")){let o=e.codePointAt(i+1);if(S.CODES.get("0")<=o&&o<=S.CODES.get("9")){let c=o-S.CODES.get("0");for(r<i&&(t+=e.substring(r,i)),i+=2;i<s&&(o=e.codePointAt(i),!(o<S.CODES.get("0")||o>S.CODES.get("9")||c*10+o-S.CODES.get("0")>this.patternGroupCount));i++)c=c*10+o-S.CODES.get("0");if(c>this.patternGroupCount)throw new Yt(`n > number of groups: ${c}`);const u=this.group(c);u!==null&&(t+=u),r=i,i--;continue}else if(o===S.CODES.get("{")){r<i&&(t+=e.substring(r,i)),i++;let c=i+1;for(;c<e.length&&e.codePointAt(c)!==S.CODES.get("}")&&e.codePointAt(c)!==S.CODES.get(" ");)c++;if(c===e.length||e.codePointAt(c)!==S.CODES.get("}"))throw new Yt("named capture group is missing trailing '}'");const u=e.substring(i+1,c);t+=this.group(u),r=c+1}}}return r<s&&(t+=e.substring(r,s)),t}appendReplacementInternalPerl(e){let t="",r=0;const s=e.length;for(let i=0;i<s-1;i++)if(e.codePointAt(i)===S.CODES.get("$")){let o=e.codePointAt(i+1);if(S.CODES.get("$")===o){r<i&&(t+=e.substring(r,i)),t+="$",i++,r=i+1;continue}else if(S.CODES.get("&")===o){r<i&&(t+=e.substring(r,i));const c=this.group(0);c!==null?t+=c:t+="$&",i++,r=i+1;continue}else if(S.CODES.get("1")<=o&&o<=S.CODES.get("9")){let c=o-S.CODES.get("0");for(r<i&&(t+=e.substring(r,i)),i+=2;i<s&&(o=e.codePointAt(i),!(o<S.CODES.get("0")||o>S.CODES.get("9")||c*10+o-S.CODES.get("0")>this.patternGroupCount));i++)c=c*10+o-S.CODES.get("0");if(c>this.patternGroupCount){t+=`$${c}`,r=i,i--;continue}const u=this.group(c);u!==null&&(t+=u),r=i,i--;continue}else if(o===S.CODES.get("<")){r<i&&(t+=e.substring(r,i)),i++;let c=i+1;for(;c<e.length&&e.codePointAt(c)!==S.CODES.get(">")&&e.codePointAt(c)!==S.CODES.get(" ");)c++;if(c===e.length||e.codePointAt(c)!==S.CODES.get(">")){t+=e.substring(i-1,c+1),r=c+1;continue}const u=e.substring(i+1,c);Object.prototype.hasOwnProperty.call(this.namedGroups,u)?t+=this.group(u):t+=`$<${u}>`,r=c+1}}return r<s&&(t+=e.substring(r,s)),t}appendTail(){return this.substring(this.appendPos,this.matcherInputLength)}replaceAll(e,t=!1){return this.replace(e,!0,t)}replaceFirst(e,t=!1){return this.replace(e,!1,t)}replace(e,t=!0,r=!1){let s="";for(this.reset();this.find()&&(s+=this.appendReplacement(e,r),!!t););return s+=this.appendTail(),s}}class An{static EOF(){return-8}canCheckPrefix(){return!0}endPos(){return this.end}}class Im extends An{constructor(e,t=0,r=e.length){super(),this.bytes=e,this.start=t,this.end=r}step(e){if(e+=this.start,e>=this.end)return An.EOF();let t=this.bytes[e++]&255;return(t&128)===0?t<<3|1:(t&224)===192?(t=t&31,e>=this.end?An.EOF():(t=t<<6|this.bytes[e++]&63,t<<3|2)):(t&240)===224?(t=t&15,e+1>=this.end?An.EOF():(t=t<<6|this.bytes[e++]&63,t=t<<6|this.bytes[e++]&63,t<<3|3)):(t=t&7,e+2>=this.end?An.EOF():(t=t<<6|this.bytes[e++]&63,t=t<<6|this.bytes[e++]&63,t=t<<6|this.bytes[e++]&63,t<<3|4))}index(e,t){t+=this.start;const r=this.indexOf(this.bytes,e.prefixUTF8,t);return r<0?r:r-t}context(e){e+=this.start;let t=-1;if(e>this.start&&e<=this.end){let s=e-1;if(t=this.bytes[s--],t>=128){let i=e-4;for(i<this.start&&(i=this.start);s>=i&&(this.bytes[s]&192)===128;)s--;s<this.start&&(s=this.start),t=this.step(s)>>3}}const r=e<this.end?this.step(e)>>3:-1;return ee.emptyOpContext(t,r)}indexOf(e,t,r=0){let s=t.length;if(s===0)return-1;let i=e.length;for(let o=r;o<=i-s;o++)for(let c=0;c<s&&e[o+c]===t[c];c++)if(c===s-1)return o;return-1}}class Tm extends An{constructor(e,t=0,r=e.length){super(),this.charSequence=e,this.start=t,this.end=r}step(e){if(e+=this.start,e<this.end){const t=this.charSequence.codePointAt(e);return t<<3|ee.charCount(t)}else return An.EOF()}index(e,t){t+=this.start;const r=this.charSequence.indexOf(e.prefix,t);return r<0?r:r-t}context(e){e+=this.start;const t=e>0&&e<=this.charSequence.length?this.charSequence.codePointAt(e-1):-1,r=e<this.charSequence.length?this.charSequence.codePointAt(e):-1;return ee.emptyOpContext(t,r)}}class ve{static fromUTF8(e,t=0,r=e.length){return new Im(e,t,r)}static fromUTF16(e,t=0,r=e.length){return new Tm(e,t,r)}}const Q=class Q{static isPseudoOp(e){return e>=Q.Op.LEFT_PAREN}static emptySubs(){return[]}static quoteIfHyphen(e){return e===S.CODES.get("-")?"\\":""}static fromRegexp(e){const t=new Q(e.op);return t.flags=e.flags,t.subs=e.subs,t.runes=e.runes,t.cap=e.cap,t.min=e.min,t.max=e.max,t.name=e.name,t.namedGroups=e.namedGroups,t}constructor(e){this.op=e,this.flags=0,this.subs=Q.emptySubs(),this.runes=null,this.min=0,this.max=0,this.cap=0,this.name=null,this.namedGroups={}}reinit(){this.flags=0,this.subs=Q.emptySubs(),this.runes=null,this.cap=0,this.min=0,this.max=0,this.name=null,this.namedGroups={}}toString(){return this.appendTo()}appendTo(){let e="";switch(this.op){case Q.Op.NO_MATCH:e+="[^\\x00-\\x{10FFFF}]";break;case Q.Op.EMPTY_MATCH:e+="(?:)";break;case Q.Op.STAR:case Q.Op.PLUS:case Q.Op.QUEST:case Q.Op.REPEAT:{const t=this.subs[0];switch(t.op>Q.Op.CAPTURE||t.op===Q.Op.LITERAL&&t.runes.length>1?e+=`(?:${t.appendTo()})`:e+=t.appendTo(),this.op){case Q.Op.STAR:e+="*";break;case Q.Op.PLUS:e+="+";break;case Q.Op.QUEST:e+="?";break;case Q.Op.REPEAT:e+=`{${this.min}`,this.min!==this.max&&(e+=",",this.max>=0&&(e+=this.max)),e+="}";break}(this.flags&q.NON_GREEDY)!==0&&(e+="?");break}case Q.Op.CONCAT:{for(let t of this.subs)t.op===Q.Op.ALTERNATE?e+=`(?:${t.appendTo()})`:e+=t.appendTo();break}case Q.Op.ALTERNATE:{let t="";for(let r of this.subs)e+=t,t="|",e+=r.appendTo();break}case Q.Op.LITERAL:(this.flags&q.FOLD_CASE)!==0&&(e+="(?i:");for(let t of this.runes)e+=ee.escapeRune(t);(this.flags&q.FOLD_CASE)!==0&&(e+=")");break;case Q.Op.ANY_CHAR_NOT_NL:e+="(?-s:.)";break;case Q.Op.ANY_CHAR:e+="(?s:.)";break;case Q.Op.CAPTURE:this.name===null||this.name.length===0?e+="(":e+=`(?P<${this.name}>`,this.subs[0].op!==Q.Op.EMPTY_MATCH&&(e+=this.subs[0].appendTo()),e+=")";break;case Q.Op.BEGIN_TEXT:e+="\\A";break;case Q.Op.END_TEXT:(this.flags&q.WAS_DOLLAR)!==0?e+="(?-m:$)":e+="\\z";break;case Q.Op.BEGIN_LINE:e+="^";break;case Q.Op.END_LINE:e+="$";break;case Q.Op.WORD_BOUNDARY:e+="\\b";break;case Q.Op.NO_WORD_BOUNDARY:e+="\\B";break;case Q.Op.CHAR_CLASS:if(this.runes.length%2!==0){e+="[invalid char class]";break}if(e+="[",this.runes.length===0)e+="^\\x00-\\x{10FFFF}";else if(this.runes[0]===0&&this.runes[this.runes.length-1]===X.MAX_RUNE){e+="^";for(let t=1;t<this.runes.length-1;t+=2){const r=this.runes[t]+1,s=this.runes[t+1]-1;e+=Q.quoteIfHyphen(r),e+=ee.escapeRune(r),r!==s&&(e+="-",e+=Q.quoteIfHyphen(s),e+=ee.escapeRune(s))}}else for(let t=0;t<this.runes.length;t+=2){const r=this.runes[t],s=this.runes[t+1];e+=Q.quoteIfHyphen(r),e+=ee.escapeRune(r),r!==s&&(e+="-",e+=Q.quoteIfHyphen(s),e+=ee.escapeRune(s))}e+="]";break;default:e+=this.op;break}return e}maxCap(){let e=0;if(this.op===Q.Op.CAPTURE&&(e=this.cap),this.subs!==null)for(let t of this.subs){const r=t.maxCap();e<r&&(e=r)}return e}equals(e){if(!(e!==null&&e instanceof Q)||this.op!==e.op)return!1;switch(this.op){case Q.Op.END_TEXT:{if((this.flags&q.WAS_DOLLAR)!==(e.flags&q.WAS_DOLLAR))return!1;break}case Q.Op.LITERAL:case Q.Op.CHAR_CLASS:{if(this.runes===null&&e.runes===null)break;if(this.runes===null||e.runes===null||this.runes.length!==e.runes.length)return!1;for(let t=0;t<this.runes.length;t++)if(this.runes[t]!==e.runes[t])return!1;break}case Q.Op.ALTERNATE:case Q.Op.CONCAT:{if(this.subs.length!==e.subs.length)return!1;for(let t=0;t<this.subs.length;++t)if(!this.subs[t].equals(e.subs[t]))return!1;break}case Q.Op.STAR:case Q.Op.PLUS:case Q.Op.QUEST:{if((this.flags&q.NON_GREEDY)!==(e.flags&q.NON_GREEDY)||!this.subs[0].equals(e.subs[0]))return!1;break}case Q.Op.REPEAT:{if((this.flags&q.NON_GREEDY)!==(e.flags&q.NON_GREEDY)||this.min!==e.min||this.max!==e.max||!this.subs[0].equals(e.subs[0]))return!1;break}case Q.Op.CAPTURE:{if(this.cap!==e.cap||(this.name===null?e.name!==null:this.name!==e.name)||!this.subs[0].equals(e.subs[0]))return!1;break}}return!0}};_(Q,"Op",ff(["NO_MATCH","EMPTY_MATCH","LITERAL","CHAR_CLASS","ANY_CHAR_NOT_NL","ANY_CHAR","BEGIN_LINE","END_LINE","BEGIN_TEXT","END_TEXT","WORD_BOUNDARY","NO_WORD_BOUNDARY","CAPTURE","STAR","PLUS","QUEST","REPEAT","CONCAT","ALTERNATE","LEFT_PAREN","VERTICAL_BAR"]));let D=Q;const fe=class fe{static isRuneOp(e){return fe.RUNE<=e&&e<=fe.RUNE_ANY_NOT_NL}static escapeRunes(e){let t='"';for(let r of e)t+=ee.escapeRune(r);return t+='"',t}constructor(e){this.op=e,this.out=0,this.arg=0,this.runes=null}matchRune(e){if(this.runes.length===1){const s=this.runes[0];return(this.arg&q.FOLD_CASE)!==0?X.equalsIgnoreCase(s,e):e===s}for(let s=0;s<this.runes.length&&s<=8;s+=2){if(e<this.runes[s])return!1;if(e<=this.runes[s+1])return!0}let t=0,r=this.runes.length/2|0;for(;t<r;){const s=t+((r-t)/2|0);if(this.runes[2*s]<=e){if(e<=this.runes[2*s+1])return!0;t=s+1}else r=s}return!1}toString(){switch(this.op){case fe.ALT:return`alt -> ${this.out}, ${this.arg}`;case fe.ALT_MATCH:return`altmatch -> ${this.out}, ${this.arg}`;case fe.CAPTURE:return`cap ${this.arg} -> ${this.out}`;case fe.EMPTY_WIDTH:return`empty ${this.arg} -> ${this.out}`;case fe.MATCH:return"match";case fe.FAIL:return"fail";case fe.NOP:return`nop -> ${this.out}`;case fe.RUNE:return this.runes===null?"rune <null>":["rune ",fe.escapeRunes(this.runes),(this.arg&q.FOLD_CASE)!==0?"/i":""," -> ",this.out].join("");case fe.RUNE1:return`rune1 ${fe.escapeRunes(this.runes)} -> ${this.out}`;case fe.RUNE_ANY:return`any -> ${this.out}`;case fe.RUNE_ANY_NOT_NL:return`anynotnl -> ${this.out}`;default:throw new Error("unhandled case in Inst.toString")}}};_(fe,"ALT",1),_(fe,"ALT_MATCH",2),_(fe,"CAPTURE",3),_(fe,"EMPTY_WIDTH",4),_(fe,"FAIL",5),_(fe,"MATCH",6),_(fe,"NOP",7),_(fe,"RUNE",8),_(fe,"RUNE1",9),_(fe,"RUNE_ANY",10),_(fe,"RUNE_ANY_NOT_NL",11);let te=fe;class wm{constructor(){this.inst=[],this.start=0,this.numCap=2}getInst(e){return this.inst[e]}numInst(){return this.inst.length}addInst(e){this.inst.push(new te(e))}skipNop(e){let t=this.inst[e];for(;t.op===te.NOP||t.op===te.CAPTURE;)t=this.inst[e],e=t.out;return t}prefix(){let e="",t=this.skipNop(this.start);if(!te.isRuneOp(t.op)||t.runes.length!==1)return[t.op===te.MATCH,e];for(;te.isRuneOp(t.op)&&t.runes.length===1&&(t.arg&q.FOLD_CASE)===0;)e+=String.fromCodePoint(t.runes[0]),t=this.skipNop(t.out);return[t.op===te.MATCH,e]}startCond(){let e=0,t=this.start;e:for(;;){const r=this.inst[t];switch(r.op){case te.EMPTY_WIDTH:e|=r.arg;break;case te.FAIL:return-1;case te.CAPTURE:case te.NOP:break;default:break e}t=r.out}return e}next(e){const t=this.inst[e>>1];return(e&1)===0?t.out:t.arg}patch(e,t){for(;e!==0;){const r=this.inst[e>>1];(e&1)===0?(e=r.out,r.out=t):(e=r.arg,r.arg=t)}}append(e,t){if(e===0)return t;if(t===0)return e;let r=e;for(;;){const i=this.next(r);if(i===0)break;r=i}const s=this.inst[r>>1];return(r&1)===0?s.out=t:s.arg=t,e}toString(){let e="";for(let t=0;t<this.inst.length;t++){const r=e.length;e+=t,t===this.start&&(e+="*"),e+="        ".substring(e.length-r),e+=this.inst[t],e+=`
`}return e}}class Fi{constructor(e=0,t=0,r=!1){this.i=e,this.out=t,this.nullable=r}}class Ss{static ANY_RUNE_NOT_NL(){return[0,S.CODES.get(`
`)-1,S.CODES.get(`
`)+1,X.MAX_RUNE]}static ANY_RUNE(){return[0,X.MAX_RUNE]}static compileRegexp(e){const t=new Ss,r=t.compile(e);return t.prog.patch(r.out,t.newInst(te.MATCH).i),t.prog.start=r.i,t.prog}constructor(){this.prog=new wm,this.newInst(te.FAIL)}newInst(e){return this.prog.addInst(e),new Fi(this.prog.numInst()-1,0,!0)}nop(){const e=this.newInst(te.NOP);return e.out=e.i<<1,e}fail(){return new Fi}cap(e){const t=this.newInst(te.CAPTURE);return t.out=t.i<<1,this.prog.getInst(t.i).arg=e,this.prog.numCap<e+1&&(this.prog.numCap=e+1),t}cat(e,t){return e.i===0||t.i===0?this.fail():(this.prog.patch(e.out,t.i),new Fi(e.i,t.out,e.nullable&&t.nullable))}alt(e,t){if(e.i===0)return t;if(t.i===0)return e;const r=this.newInst(te.ALT),s=this.prog.getInst(r.i);return s.out=e.i,s.arg=t.i,r.out=this.prog.append(e.out,t.out),r.nullable=e.nullable||t.nullable,r}loop(e,t){const r=this.newInst(te.ALT),s=this.prog.getInst(r.i);return t?(s.arg=e.i,r.out=r.i<<1):(s.out=e.i,r.out=r.i<<1|1),this.prog.patch(e.out,r.i),r}quest(e,t){const r=this.newInst(te.ALT),s=this.prog.getInst(r.i);return t?(s.arg=e.i,r.out=r.i<<1):(s.out=e.i,r.out=r.i<<1|1),r.out=this.prog.append(r.out,e.out),r}star(e,t){return e.nullable?this.quest(this.plus(e,t),t):this.loop(e,t)}plus(e,t){return new Fi(e.i,this.loop(e,t).out,e.nullable)}empty(e){const t=this.newInst(te.EMPTY_WIDTH);return this.prog.getInst(t.i).arg=e,t.out=t.i<<1,t}rune(e,t){const r=this.newInst(te.RUNE);r.nullable=!1;const s=this.prog.getInst(r.i);return s.runes=e,t&=q.FOLD_CASE,(e.length!==1||X.simpleFold(e[0])===e[0])&&(t&=-2),s.arg=t,r.out=r.i<<1,(t&q.FOLD_CASE)===0&&e.length===1||e.length===2&&e[0]===e[1]?s.op=te.RUNE1:e.length===2&&e[0]===0&&e[1]===X.MAX_RUNE?s.op=te.RUNE_ANY:e.length===4&&e[0]===0&&e[1]===S.CODES.get(`
`)-1&&e[2]===S.CODES.get(`
`)+1&&e[3]===X.MAX_RUNE&&(s.op=te.RUNE_ANY_NOT_NL),r}compile(e){switch(e.op){case D.Op.NO_MATCH:return this.fail();case D.Op.EMPTY_MATCH:return this.nop();case D.Op.LITERAL:if(e.runes.length===0)return this.nop();{let t=null;for(let r of e.runes){const s=this.rune([r],e.flags);t=t===null?s:this.cat(t,s)}return t}case D.Op.CHAR_CLASS:return this.rune(e.runes,e.flags);case D.Op.ANY_CHAR_NOT_NL:return this.rune(Ss.ANY_RUNE_NOT_NL(),0);case D.Op.ANY_CHAR:return this.rune(Ss.ANY_RUNE(),0);case D.Op.BEGIN_LINE:return this.empty(ee.EMPTY_BEGIN_LINE);case D.Op.END_LINE:return this.empty(ee.EMPTY_END_LINE);case D.Op.BEGIN_TEXT:return this.empty(ee.EMPTY_BEGIN_TEXT);case D.Op.END_TEXT:return this.empty(ee.EMPTY_END_TEXT);case D.Op.WORD_BOUNDARY:return this.empty(ee.EMPTY_WORD_BOUNDARY);case D.Op.NO_WORD_BOUNDARY:return this.empty(ee.EMPTY_NO_WORD_BOUNDARY);case D.Op.CAPTURE:{const t=this.cap(e.cap<<1),r=this.compile(e.subs[0]),s=this.cap(e.cap<<1|1);return this.cat(this.cat(t,r),s)}case D.Op.STAR:return this.star(this.compile(e.subs[0]),(e.flags&q.NON_GREEDY)!==0);case D.Op.PLUS:return this.plus(this.compile(e.subs[0]),(e.flags&q.NON_GREEDY)!==0);case D.Op.QUEST:return this.quest(this.compile(e.subs[0]),(e.flags&q.NON_GREEDY)!==0);case D.Op.CONCAT:{if(e.subs.length===0)return this.nop();{let t=null;for(let r of e.subs){const s=this.compile(r);t=t===null?s:this.cat(t,s)}return t}}case D.Op.ALTERNATE:{if(e.subs.length===0)return this.nop();{let t=null;for(let r of e.subs){const s=this.compile(r);t=t===null?s:this.alt(t,s)}return t}}default:throw new _m("regexp: unhandled case in compile")}}}class Pt{static simplify(e){if(e===null)return null;switch(e.op){case D.Op.CAPTURE:case D.Op.CONCAT:case D.Op.ALTERNATE:{let t=e;for(let r=0;r<e.subs.length;r++){const s=e.subs[r],i=Pt.simplify(s);t===e&&i!==s&&(t=D.fromRegexp(e),t.runes=null,t.subs=e.subs.slice(0,e.subs.length)),t!==e&&(t.subs[r]=i)}return t}case D.Op.STAR:case D.Op.PLUS:case D.Op.QUEST:{const t=Pt.simplify(e.subs[0]);return Pt.simplify1(e.op,e.flags,t,e)}case D.Op.REPEAT:{if(e.min===0&&e.max===0)return new D(D.Op.EMPTY_MATCH);const t=Pt.simplify(e.subs[0]);if(e.max===-1){if(e.min===0)return Pt.simplify1(D.Op.STAR,e.flags,t,null);if(e.min===1)return Pt.simplify1(D.Op.PLUS,e.flags,t,null);const s=new D(D.Op.CONCAT),i=[];for(let o=0;o<e.min-1;o++)i.push(t);return i.push(Pt.simplify1(D.Op.PLUS,e.flags,t,null)),s.subs=i.slice(0),s}if(e.min===1&&e.max===1)return t;let r=null;if(e.min>0){r=[];for(let s=0;s<e.min;s++)r.push(t)}if(e.max>e.min){let s=Pt.simplify1(D.Op.QUEST,e.flags,t,null);for(let i=e.min+1;i<e.max;i++){const o=new D(D.Op.CONCAT);o.subs=[t,s],s=Pt.simplify1(D.Op.QUEST,e.flags,o,null)}if(r===null)return s;r.push(s)}if(r!==null){const s=new D(D.Op.CONCAT);return s.subs=r.slice(0),s}return new D(D.Op.NO_MATCH)}}return e}static simplify1(e,t,r,s){return r.op===D.Op.EMPTY_MATCH||e===r.op&&(t&q.NON_GREEDY)===(r.flags&q.NON_GREEDY)?r:(s!==null&&s.op===e&&(s.flags&q.NON_GREEDY)===(t&q.NON_GREEDY)&&r===s.subs[0]||(s=new D(e),s.flags=t,s.subs=[r]),s)}}class ae{constructor(e,t){this.sign=e,this.cls=t}}const Nl=[48,57],Ol=[9,10,12,13,32,32],kl=[48,57,65,90,95,95,97,122],Dl=new Map([["\\d",new ae(1,Nl)],["\\D",new ae(-1,Nl)],["\\s",new ae(1,Ol)],["\\S",new ae(-1,Ol)],["\\w",new ae(1,kl)],["\\W",new ae(-1,kl)]]),Vl=[48,57,65,90,97,122],xl=[65,90,97,122],Ll=[0,127],Ml=[9,9,32,32],Fl=[0,31,127,127],Ul=[48,57],Bl=[33,126],$l=[97,122],ql=[32,126],Hl=[33,47,58,64,91,96,123,126],jl=[9,13,32,32],Gl=[65,90],Wl=[48,57,65,90,95,95,97,122],zl=[48,57,65,70,97,102],Kl=new Map([["[:alnum:]",new ae(1,Vl)],["[:^alnum:]",new ae(-1,Vl)],["[:alpha:]",new ae(1,xl)],["[:^alpha:]",new ae(-1,xl)],["[:ascii:]",new ae(1,Ll)],["[:^ascii:]",new ae(-1,Ll)],["[:blank:]",new ae(1,Ml)],["[:^blank:]",new ae(-1,Ml)],["[:cntrl:]",new ae(1,Fl)],["[:^cntrl:]",new ae(-1,Fl)],["[:digit:]",new ae(1,Ul)],["[:^digit:]",new ae(-1,Ul)],["[:graph:]",new ae(1,Bl)],["[:^graph:]",new ae(-1,Bl)],["[:lower:]",new ae(1,$l)],["[:^lower:]",new ae(-1,$l)],["[:print:]",new ae(1,ql)],["[:^print:]",new ae(-1,ql)],["[:punct:]",new ae(1,Hl)],["[:^punct:]",new ae(-1,Hl)],["[:space:]",new ae(1,jl)],["[:^space:]",new ae(-1,jl)],["[:upper:]",new ae(1,Gl)],["[:^upper:]",new ae(-1,Gl)],["[:word:]",new ae(1,Wl)],["[:^word:]",new ae(-1,Wl)],["[:xdigit:]",new ae(1,zl)],["[:^xdigit:]",new ae(-1,zl)]]);class je{static charClassToString(e,t){let r="[";for(let s=0;s<t;s+=2){s>0&&(r+=" ");const i=e[s],o=e[s+1];i===o?r+=`0x${i.toString(16)}`:r+=`0x${i.toString(16)}-0x${o.toString(16)}`}return r+="]",r}static cmp(e,t,r,s){const i=e[t]-r;return i!==0?i:s-e[t+1]}static qsortIntPair(e,t,r){const s=((t+r)/2|0)&-2,i=e[s],o=e[s+1];let c=t,u=r;for(;c<=u;){for(;c<r&&je.cmp(e,c,i,o)<0;)c+=2;for(;u>t&&je.cmp(e,u,i,o)>0;)u-=2;if(c<=u){if(c!==u){let l=e[c];e[c]=e[u],e[u]=l,l=e[c+1],e[c+1]=e[u+1],e[u+1]=l}c+=2,u-=2}}t<u&&je.qsortIntPair(e,t,u),c<r&&je.qsortIntPair(e,c,r)}constructor(e=ee.emptyInts()){this.r=e,this.len=e.length}toArray(){return this.len===this.r.length?this.r:this.r.slice(0,this.len)}cleanClass(){if(this.len<4)return this;je.qsortIntPair(this.r,0,this.len-2);let e=2;for(let t=2;t<this.len;t+=2){const r=this.r[t],s=this.r[t+1];if(r<=this.r[e-1]+1){s>this.r[e-1]&&(this.r[e-1]=s);continue}this.r[e]=r,this.r[e+1]=s,e+=2}return this.len=e,this}appendLiteral(e,t){return(t&q.FOLD_CASE)!==0?this.appendFoldedRange(e,e):this.appendRange(e,e)}appendRange(e,t){if(this.len>0){for(let r=2;r<=4;r+=2)if(this.len>=r){const s=this.r[this.len-r],i=this.r[this.len-r+1];if(e<=i+1&&s<=t+1)return e<s&&(this.r[this.len-r]=e),t>i&&(this.r[this.len-r+1]=t),this}}return this.r[this.len++]=e,this.r[this.len++]=t,this}appendFoldedRange(e,t){if(e<=X.MIN_FOLD&&t>=X.MAX_FOLD)return this.appendRange(e,t);if(t<X.MIN_FOLD||e>X.MAX_FOLD)return this.appendRange(e,t);e<X.MIN_FOLD&&(this.appendRange(e,X.MIN_FOLD-1),e=X.MIN_FOLD),t>X.MAX_FOLD&&(this.appendRange(X.MAX_FOLD+1,t),t=X.MAX_FOLD);for(let r=e;r<=t;r++){this.appendRange(r,r);for(let s=X.simpleFold(r);s!==r;s=X.simpleFold(s))this.appendRange(s,s)}return this}appendClass(e){for(let t=0;t<e.length;t+=2)this.appendRange(e[t],e[t+1]);return this}appendFoldedClass(e){for(let t=0;t<e.length;t+=2)this.appendFoldedRange(e[t],e[t+1]);return this}appendNegatedClass(e){let t=0;for(let r=0;r<e.length;r+=2){const s=e[r],i=e[r+1];t<=s-1&&this.appendRange(t,s-1),t=i+1}return t<=X.MAX_RUNE&&this.appendRange(t,X.MAX_RUNE),this}appendTable(e){for(let t of e){const r=t[0],s=t[1],i=t[2];if(i===1){this.appendRange(r,s);continue}for(let o=r;o<=s;o+=i)this.appendRange(o,o)}return this}appendNegatedTable(e){let t=0;for(let r of e){const s=r[0],i=r[1],o=r[2];if(o===1){t<=s-1&&this.appendRange(t,s-1),t=i+1;continue}for(let c=s;c<=i;c+=o)t<=c-1&&this.appendRange(t,c-1),t=c+1}return t<=X.MAX_RUNE&&this.appendRange(t,X.MAX_RUNE),this}appendTableWithSign(e,t){return t<0?this.appendNegatedTable(e):this.appendTable(e)}negateClass(){let e=0,t=0;for(let r=0;r<this.len;r+=2){const s=this.r[r],i=this.r[r+1];e<=s-1&&(this.r[t]=e,this.r[t+1]=s-1,t+=2),e=i+1}return this.len=t,e<=X.MAX_RUNE&&(this.r[this.len++]=e,this.r[this.len++]=X.MAX_RUNE),this}appendClassWithSign(e,t){return t<0?this.appendNegatedClass(e):this.appendClass(e)}appendGroup(e,t){let r=e.cls;return t&&(r=new je().appendFoldedClass(r).cleanClass().toArray()),this.appendClassWithSign(r,e.sign)}toString(){return je.charClassToString(this.r,this.len)}}class bs{static of(e,t){return new bs(e,t)}constructor(e,t){this.first=e,this.second=t}}class Am{constructor(e){this.str=e,this.position=0}pos(){return this.position}rewindTo(e){this.position=e}more(){return this.position<this.str.length}peek(){return this.str.codePointAt(this.position)}skip(e){this.position+=e}skipString(e){this.position+=e.length}pop(){const e=this.str.codePointAt(this.position);return this.position+=ee.charCount(e),e}lookingAt(e){return this.rest().startsWith(e)}rest(){return this.str.substring(this.position)}from(e){return this.str.substring(e,this.position)}toString(){return this.rest()}}const G=class G{static ANY_TABLE(){return[[0,X.MAX_RUNE,1]]}static unicodeTable(e){return e==="Any"?bs.of(G.ANY_TABLE(),G.ANY_TABLE()):He.CATEGORIES.has(e)?bs.of(He.CATEGORIES.get(e),He.FOLD_CATEGORIES.get(e)):He.SCRIPTS.has(e)?bs.of(He.SCRIPTS.get(e),He.FOLD_SCRIPT.get(e)):null}static minFoldRune(e){if(e<X.MIN_FOLD||e>X.MAX_FOLD)return e;let t=e;const r=e;for(e=X.simpleFold(e);e!==r;e=X.simpleFold(e))t>e&&(t=e);return t}static leadingRegexp(e){if(e.op===D.Op.EMPTY_MATCH)return null;if(e.op===D.Op.CONCAT&&e.subs.length>0){const t=e.subs[0];return t.op===D.Op.EMPTY_MATCH?null:t}return e}static literalRegexp(e,t){const r=new D(D.Op.LITERAL);return r.flags=t,r.runes=ee.stringToRunes(e),r}static parse(e,t){return new G(e,t).parseInternal()}static parseRepeat(e){const t=e.pos();if(!e.more()||!e.lookingAt("{"))return-1;e.skip(1);const r=G.parseInt(e);if(r===-1||!e.more())return-1;let s;if(!e.lookingAt(","))s=r;else{if(e.skip(1),!e.more())return-1;if(e.lookingAt("}"))s=-1;else if((s=G.parseInt(e))===-1)return-1}if(!e.more()||!e.lookingAt("}"))return-1;if(e.skip(1),r<0||r>1e3||s===-2||s>1e3||s>=0&&r>s)throw new Ae(G.ERR_INVALID_REPEAT_SIZE,e.from(t));return r<<16|s&X.MAX_BMP}static isValidCaptureName(e){if(e.length===0)return!1;for(let t=0;t<e.length;t++){const r=e.codePointAt(t);if(r!==S.CODES.get("_")&&!ee.isalnum(r))return!1}return!0}static parseInt(e){const t=e.pos();for(;e.more()&&e.peek()>=S.CODES.get("0")&&e.peek()<=S.CODES.get("9");)e.skip(1);const r=e.from(t);return r.length===0||r.length>1&&r.codePointAt(0)===S.CODES.get("0")?-1:r.length>8?-2:parseFloat(r,10)}static isCharClass(e){return e.op===D.Op.LITERAL&&e.runes.length===1||e.op===D.Op.CHAR_CLASS||e.op===D.Op.ANY_CHAR_NOT_NL||e.op===D.Op.ANY_CHAR}static matchRune(e,t){switch(e.op){case D.Op.LITERAL:return e.runes.length===1&&e.runes[0]===t;case D.Op.CHAR_CLASS:for(let r=0;r<e.runes.length;r+=2)if(e.runes[r]<=t&&t<=e.runes[r+1])return!0;return!1;case D.Op.ANY_CHAR_NOT_NL:return t!==S.CODES.get(`
`);case D.Op.ANY_CHAR:return!0}return!1}static mergeCharClass(e,t){switch(e.op){case D.Op.ANY_CHAR:break;case D.Op.ANY_CHAR_NOT_NL:G.matchRune(t,S.CODES.get(`
`))&&(e.op=D.Op.ANY_CHAR);break;case D.Op.CHAR_CLASS:t.op===D.Op.LITERAL?e.runes=new je(e.runes).appendLiteral(t.runes[0],t.flags).toArray():e.runes=new je(e.runes).appendClass(t.runes).toArray();break;case D.Op.LITERAL:if(t.runes[0]===e.runes[0]&&t.flags===e.flags)break;e.op=D.Op.CHAR_CLASS,e.runes=new je().appendLiteral(e.runes[0],e.flags).appendLiteral(t.runes[0],t.flags).toArray();break}}static parseEscape(e){const t=e.pos();if(e.skip(1),!e.more())throw new Ae(G.ERR_TRAILING_BACKSLASH);let r=e.pop();e:switch(r){case S.CODES.get("1"):case S.CODES.get("2"):case S.CODES.get("3"):case S.CODES.get("4"):case S.CODES.get("5"):case S.CODES.get("6"):case S.CODES.get("7"):if(!e.more()||e.peek()<S.CODES.get("0")||e.peek()>S.CODES.get("7"))break;case S.CODES.get("0"):{let s=r-S.CODES.get("0");for(let i=1;i<3&&!(!e.more()||e.peek()<S.CODES.get("0")||e.peek()>S.CODES.get("7"));i++)s=s*8+e.peek()-S.CODES.get("0"),e.skip(1);return s}case S.CODES.get("x"):{if(!e.more())break;if(r=e.pop(),r===S.CODES.get("{")){let o=0,c=0;for(;;){if(!e.more())break e;if(r=e.pop(),r===S.CODES.get("}"))break;const u=ee.unhex(r);if(u<0||(c=c*16+u,c>X.MAX_RUNE))break e;o++}if(o===0)break e;return c}const s=ee.unhex(r);if(!e.more())break;r=e.pop();const i=ee.unhex(r);if(s<0||i<0)break;return s*16+i}case S.CODES.get("a"):return S.CODES.get("\x07");case S.CODES.get("f"):return S.CODES.get("\f");case S.CODES.get("n"):return S.CODES.get(`
`);case S.CODES.get("r"):return S.CODES.get("\r");case S.CODES.get("t"):return S.CODES.get("	");case S.CODES.get("v"):return S.CODES.get("\v");default:if(!ee.isalnum(r))return r;break}throw new Ae(G.ERR_INVALID_ESCAPE,e.from(t))}static parseClassChar(e,t){if(!e.more())throw new Ae(G.ERR_MISSING_BRACKET,e.from(t));return e.lookingAt("\\")?G.parseEscape(e):e.pop()}static concatRunes(e,t){return[...e,...t]}constructor(e,t=0){this.wholeRegexp=e,this.flags=t,this.numCap=0,this.namedGroups={},this.stack=[],this.free=null}newRegexp(e){let t=this.free;return t!==null&&t.subs!==null&&t.subs.length>0?(this.free=t.subs[0],t.reinit(),t.op=e):t=new D(e),t}reuse(e){e.subs!==null&&e.subs.length>0&&(e.subs[0]=this.free),this.free=e}pop(){return this.stack.pop()}popToPseudo(){const e=this.stack.length;let t=e;for(;t>0&&!D.isPseudoOp(this.stack[t-1].op);)t--;const r=this.stack.slice(t,e);return this.stack=this.stack.slice(0,t),r}push(e){if(e.op===D.Op.CHAR_CLASS&&e.runes.length===2&&e.runes[0]===e.runes[1]){if(this.maybeConcat(e.runes[0],this.flags&-2))return null;e.op=D.Op.LITERAL,e.runes=[e.runes[0]],e.flags=this.flags&-2}else if(e.op===D.Op.CHAR_CLASS&&e.runes.length===4&&e.runes[0]===e.runes[1]&&e.runes[2]===e.runes[3]&&X.simpleFold(e.runes[0])===e.runes[2]&&X.simpleFold(e.runes[2])===e.runes[0]||e.op===D.Op.CHAR_CLASS&&e.runes.length===2&&e.runes[0]+1===e.runes[1]&&X.simpleFold(e.runes[0])===e.runes[1]&&X.simpleFold(e.runes[1])===e.runes[0]){if(this.maybeConcat(e.runes[0],this.flags|q.FOLD_CASE))return null;e.op=D.Op.LITERAL,e.runes=[e.runes[0]],e.flags=this.flags|q.FOLD_CASE}else this.maybeConcat(-1,0);return this.stack.push(e),e}maybeConcat(e,t){const r=this.stack.length;if(r<2)return!1;const s=this.stack[r-1],i=this.stack[r-2];return s.op!==D.Op.LITERAL||i.op!==D.Op.LITERAL||(s.flags&q.FOLD_CASE)!==(i.flags&q.FOLD_CASE)?!1:(i.runes=G.concatRunes(i.runes,s.runes),e>=0?(s.runes=[e],s.flags=t,!0):(this.pop(),this.reuse(s),!1))}newLiteral(e,t){const r=this.newRegexp(D.Op.LITERAL);return r.flags=t,(t&q.FOLD_CASE)!==0&&(e=G.minFoldRune(e)),r.runes=[e],r}literal(e){this.push(this.newLiteral(e,this.flags))}op(e){const t=this.newRegexp(e);return t.flags=this.flags,this.push(t)}repeat(e,t,r,s,i,o){let c=this.flags;if((c&q.PERL_X)!==0&&(i.more()&&i.lookingAt("?")&&(i.skip(1),c^=q.NON_GREEDY),o!==-1))throw new Ae(G.ERR_INVALID_REPEAT_OP,i.from(o));const u=this.stack.length;if(u===0)throw new Ae(G.ERR_MISSING_REPEAT_ARGUMENT,i.from(s));const l=this.stack[u-1];if(D.isPseudoOp(l.op))throw new Ae(G.ERR_MISSING_REPEAT_ARGUMENT,i.from(s));const p=this.newRegexp(e);p.min=t,p.max=r,p.flags=c,p.subs=[l],this.stack[u-1]=p}concat(){this.maybeConcat(-1,0);const e=this.popToPseudo();return e.length===0?this.push(this.newRegexp(D.Op.EMPTY_MATCH)):this.push(this.collapse(e,D.Op.CONCAT))}alternate(){const e=this.popToPseudo();return e.length>0&&this.cleanAlt(e[e.length-1]),e.length===0?this.push(this.newRegexp(D.Op.NO_MATCH)):this.push(this.collapse(e,D.Op.ALTERNATE))}cleanAlt(e){e.op===D.Op.CHAR_CLASS&&(e.runes=new je(e.runes).cleanClass().toArray(),e.runes.length===2&&e.runes[0]===0&&e.runes[1]===X.MAX_RUNE?(e.runes=null,e.op=D.Op.ANY_CHAR):e.runes.length===4&&e.runes[0]===0&&e.runes[1]===S.CODES.get(`
`)-1&&e.runes[2]===S.CODES.get(`
`)+1&&e.runes[3]===X.MAX_RUNE&&(e.runes=null,e.op=D.Op.ANY_CHAR_NOT_NL))}collapse(e,t){if(e.length===1)return e[0];let r=0;for(let c of e)r+=c.op===t?c.subs.length:1;let s=new Array(r).fill(null),i=0;for(let c of e)c.op===t?(s.splice(i,c.subs.length,...c.subs),i+=c.subs.length,this.reuse(c)):s[i++]=c;let o=this.newRegexp(t);if(o.subs=s,t===D.Op.ALTERNATE&&(o.subs=this.factor(o.subs),o.subs.length===1)){const c=o;o=o.subs[0],this.reuse(c)}return o}factor(e){if(e.length<2)return e;let t=0,r=e.length,s=0,i=null,o=0,c=0,u=0;for(let p=0;p<=r;p++){let g=null,T=0,b=0;if(p<r){let O=e[t+p];if(O.op===D.Op.CONCAT&&O.subs.length>0&&(O=O.subs[0]),O.op===D.Op.LITERAL&&(g=O.runes,T=O.runes.length,b=O.flags&q.FOLD_CASE),b===c){let L=0;for(;L<o&&L<T&&i[L]===g[L];)L++;if(L>0){o=L;continue}}}if(p!==u)if(p===u+1)e[s++]=e[t+u];else{const O=this.newRegexp(D.Op.LITERAL);O.flags=c,O.runes=i.slice(0,o);for(let Y=u;Y<p;Y++)e[t+Y]=this.removeLeadingString(e[t+Y],o);const L=this.collapse(e.slice(t+u,t+p),D.Op.ALTERNATE),M=this.newRegexp(D.Op.CONCAT);M.subs=[O,L],e[s++]=M}u=p,i=g,o=T,c=b}r=s,t=0,u=0,s=0;let l=null;for(let p=0;p<=r;p++){let g=null;if(!(p<r&&(g=G.leadingRegexp(e[t+p]),l!==null&&l.equals(g)&&(G.isCharClass(l)||l.op===D.Op.REPEAT&&l.min===l.max&&G.isCharClass(l.subs[0]))))){if(p!==u)if(p===u+1)e[s++]=e[t+u];else{const T=l;for(let L=u;L<p;L++){const M=L!==u;e[t+L]=this.removeLeadingRegexp(e[t+L],M)}const b=this.collapse(e.slice(t+u,t+p),D.Op.ALTERNATE),O=this.newRegexp(D.Op.CONCAT);O.subs=[T,b],e[s++]=O}u=p,l=g}}r=s,t=0,u=0,s=0;for(let p=0;p<=r;p++)if(!(p<r&&G.isCharClass(e[t+p]))){if(p!==u)if(p===u+1)e[s++]=e[t+u];else{let g=u;for(let b=u+1;b<p;b++){const O=e[t+g],L=e[t+b];(O.op<L.op||O.op===L.op&&(O.runes!==null?O.runes.length:0)<(L.runes!==null?L.runes.length:0))&&(g=b)}const T=e[t+u];e[t+u]=e[t+g],e[t+g]=T;for(let b=u+1;b<p;b++)G.mergeCharClass(e[t+u],e[t+b]),this.reuse(e[t+b]);this.cleanAlt(e[t+u]),e[s++]=e[t+u]}p<r&&(e[s++]=e[t+p]),u=p+1}r=s,t=0,u=0,s=0;for(let p=0;p<r;++p)p+1<r&&e[t+p].op===D.Op.EMPTY_MATCH&&e[t+p+1].op===D.Op.EMPTY_MATCH||(e[s++]=e[t+p]);return r=s,t=0,e.slice(t,r)}removeLeadingString(e,t){if(e.op===D.Op.CONCAT&&e.subs.length>0){const r=this.removeLeadingString(e.subs[0],t);if(e.subs[0]=r,r.op===D.Op.EMPTY_MATCH)switch(this.reuse(r),e.subs.length){case 0:case 1:e.op=D.Op.EMPTY_MATCH,e.subs=null;break;case 2:{const s=e;e=e.subs[1],this.reuse(s);break}default:e.subs=e.subs.slice(1,e.subs.length);break}return e}return e.op===D.Op.LITERAL&&(e.runes=e.runes.slice(t,e.runes.length),e.runes.length===0&&(e.op=D.Op.EMPTY_MATCH)),e}removeLeadingRegexp(e,t){if(e.op===D.Op.CONCAT&&e.subs.length>0){switch(t&&this.reuse(e.subs[0]),e.subs=e.subs.slice(1,e.subs.length),e.subs.length){case 0:{e.op=D.Op.EMPTY_MATCH,e.subs=D.emptySubs();break}case 1:{const r=e;e=e.subs[0],this.reuse(r);break}}return e}return t&&this.reuse(e),this.newRegexp(D.Op.EMPTY_MATCH)}parseInternal(){if((this.flags&q.LITERAL)!==0)return G.literalRegexp(this.wholeRegexp,this.flags);let e=-1,t=-1,r=-1;const s=new Am(this.wholeRegexp);for(;s.more();){let o=-1;e:switch(s.peek()){case S.CODES.get("("):if((this.flags&q.PERL_X)!==0&&s.lookingAt("(?")){this.parsePerlFlags(s);break}this.op(D.Op.LEFT_PAREN).cap=++this.numCap,s.skip(1);break;case S.CODES.get("|"):this.parseVerticalBar(),s.skip(1);break;case S.CODES.get(")"):this.parseRightParen(),s.skip(1);break;case S.CODES.get("^"):(this.flags&q.ONE_LINE)!==0?this.op(D.Op.BEGIN_TEXT):this.op(D.Op.BEGIN_LINE),s.skip(1);break;case S.CODES.get("$"):(this.flags&q.ONE_LINE)!==0?this.op(D.Op.END_TEXT).flags|=q.WAS_DOLLAR:this.op(D.Op.END_LINE),s.skip(1);break;case S.CODES.get("."):(this.flags&q.DOT_NL)!==0?this.op(D.Op.ANY_CHAR):this.op(D.Op.ANY_CHAR_NOT_NL),s.skip(1);break;case S.CODES.get("["):this.parseClass(s);break;case S.CODES.get("*"):case S.CODES.get("+"):case S.CODES.get("?"):{o=s.pos();let c=null;switch(s.pop()){case S.CODES.get("*"):c=D.Op.STAR;break;case S.CODES.get("+"):c=D.Op.PLUS;break;case S.CODES.get("?"):c=D.Op.QUEST;break}this.repeat(c,t,r,o,s,e);break}case S.CODES.get("{"):{o=s.pos();const c=G.parseRepeat(s);if(c<0){s.rewindTo(o),this.literal(s.pop());break}t=c>>16,r=(c&X.MAX_BMP)<<16>>16,this.repeat(D.Op.REPEAT,t,r,o,s,e);break}case S.CODES.get("\\"):{const c=s.pos();if(s.skip(1),(this.flags&q.PERL_X)!==0&&s.more())switch(s.pop()){case S.CODES.get("A"):this.op(D.Op.BEGIN_TEXT);break e;case S.CODES.get("b"):this.op(D.Op.WORD_BOUNDARY);break e;case S.CODES.get("B"):this.op(D.Op.NO_WORD_BOUNDARY);break e;case S.CODES.get("C"):throw new Ae(G.ERR_INVALID_ESCAPE,"\\C");case S.CODES.get("Q"):{let g=s.rest();const T=g.indexOf("\\E");T>=0&&(g=g.substring(0,T)),s.skipString(g),s.skipString("\\E");let b=0;for(;b<g.length;){const O=g.codePointAt(b);this.literal(O),b+=ee.charCount(O)}break e}case S.CODES.get("z"):this.op(D.Op.END_TEXT);break e;default:s.rewindTo(c);break}const u=this.newRegexp(D.Op.CHAR_CLASS);if(u.flags=this.flags,s.lookingAt("\\p")||s.lookingAt("\\P")){const p=new je;if(this.parseUnicodeClass(s,p)){u.runes=p.toArray(),this.push(u);break e}}const l=new je;if(this.parsePerlClassEscape(s,l)){u.runes=l.toArray(),this.push(u);break e}s.rewindTo(c),this.reuse(u),this.literal(G.parseEscape(s));break}default:this.literal(s.pop());break}e=o}if(this.concat(),this.swapVerticalBar()&&this.pop(),this.alternate(),this.stack.length!==1)throw new Ae(G.ERR_MISSING_PAREN,this.wholeRegexp);return this.stack[0].namedGroups=this.namedGroups,this.stack[0]}parsePerlFlags(e){const t=e.pos(),r=e.rest();if(r.startsWith("(?P<")||r.startsWith("(?<")){const c=r.charAt(2)==="P"?4:3,u=r.indexOf(">");if(u<0)throw new Ae(G.ERR_INVALID_NAMED_CAPTURE,r);const l=r.substring(c,u);if(e.skipString(l),e.skip(c+1),!G.isValidCaptureName(l))throw new Ae(G.ERR_INVALID_NAMED_CAPTURE,r.substring(0,u+1));const p=this.op(D.Op.LEFT_PAREN);if(p.cap=++this.numCap,this.namedGroups[l])throw new Ae(G.ERR_DUPLICATE_NAMED_CAPTURE,l);this.namedGroups[l]=this.numCap,p.name=l;return}e.skip(2);let s=this.flags,i=1,o=!1;e:for(;e.more();){const c=e.pop();switch(c){case S.CODES.get("i"):s|=q.FOLD_CASE,o=!0;break;case S.CODES.get("m"):s&=-17,o=!0;break;case S.CODES.get("s"):s|=q.DOT_NL,o=!0;break;case S.CODES.get("U"):s|=q.NON_GREEDY,o=!0;break;case S.CODES.get("-"):if(i<0)break e;i=-1,s=~s,o=!1;break;case S.CODES.get(":"):case S.CODES.get(")"):if(i<0){if(!o)break e;s=~s}c===S.CODES.get(":")&&this.op(D.Op.LEFT_PAREN),this.flags=s;return;default:break e}}throw new Ae(G.ERR_INVALID_PERL_OP,e.from(t))}parseVerticalBar(){this.concat(),this.swapVerticalBar()||this.op(D.Op.VERTICAL_BAR)}swapVerticalBar(){const e=this.stack.length;if(e>=3&&this.stack[e-2].op===D.Op.VERTICAL_BAR&&G.isCharClass(this.stack[e-1])&&G.isCharClass(this.stack[e-3])){let t=this.stack[e-1],r=this.stack[e-3];if(t.op>r.op){const s=r;r=t,t=s,this.stack[e-3]=r}return G.mergeCharClass(r,t),this.reuse(t),this.pop(),!0}if(e>=2){const t=this.stack[e-1],r=this.stack[e-2];if(r.op===D.Op.VERTICAL_BAR)return e>=3&&this.cleanAlt(this.stack[e-3]),this.stack[e-2]=t,this.stack[e-1]=r,!0}return!1}parseRightParen(){if(this.concat(),this.swapVerticalBar()&&this.pop(),this.alternate(),this.stack.length<2)throw new Ae(G.ERR_INTERNAL_ERROR,"stack underflow");const t=this.pop(),r=this.pop();if(r.op!==D.Op.LEFT_PAREN)throw new Ae(G.ERR_MISSING_PAREN,this.wholeRegexp);this.flags=r.flags,r.cap===0?this.push(t):(r.op=D.Op.CAPTURE,r.subs=[t],this.push(r))}parsePerlClassEscape(e,t){const r=e.pos();if((this.flags&q.PERL_X)===0||!e.more()||e.pop()!==S.CODES.get("\\")||!e.more())return!1;e.pop();const s=e.from(r),i=Dl.has(s)?Dl.get(s):null;return i===null?!1:(t.appendGroup(i,(this.flags&q.FOLD_CASE)!==0),!0)}parseNamedClass(e,t){const r=e.rest(),s=r.indexOf(":]");if(s<0)return!1;const i=r.substring(0,s+2);e.skipString(i);const o=Kl.has(i)?Kl.get(i):null;if(o===null)throw new Ae(G.ERR_INVALID_CHAR_RANGE,i);return t.appendGroup(o,(this.flags&q.FOLD_CASE)!==0),!0}parseUnicodeClass(e,t){const r=e.pos();if((this.flags&q.UNICODE_GROUPS)===0||!e.lookingAt("\\p")&&!e.lookingAt("\\P"))return!1;e.skip(1);let s=1,i=e.pop();if(i===S.CODES.get("P")&&(s=-1),!e.more())throw e.rewindTo(r),new Ae(G.ERR_INVALID_CHAR_RANGE,e.rest());i=e.pop();let o;if(i!==S.CODES.get("{"))o=ee.runeToString(i);else{const p=e.rest(),g=p.indexOf("}");if(g<0)throw e.rewindTo(r),new Ae(G.ERR_INVALID_CHAR_RANGE,e.rest());o=p.substring(0,g),e.skipString(o),e.skip(1)}o.length!==0&&o.codePointAt(0)===S.CODES.get("^")&&(s=0-s,o=o.substring(1));const c=G.unicodeTable(o);if(c===null)throw new Ae(G.ERR_INVALID_CHAR_RANGE,e.from(r));const u=c.first,l=c.second;if((this.flags&q.FOLD_CASE)===0||l===null)t.appendTableWithSign(u,s);else{const p=new je().appendTable(u).appendTable(l).cleanClass().toArray();t.appendClassWithSign(p,s)}return!0}parseClass(e){const t=e.pos();e.skip(1);const r=this.newRegexp(D.Op.CHAR_CLASS);r.flags=this.flags;const s=new je;let i=1;e.more()&&e.lookingAt("^")&&(i=-1,e.skip(1),(this.flags&q.CLASS_NL)===0&&s.appendRange(S.CODES.get(`
`),S.CODES.get(`
`)));let o=!0;for(;!e.more()||e.peek()!==S.CODES.get("]")||o;){if(e.more()&&e.lookingAt("-")&&(this.flags&q.PERL_X)===0&&!o){const p=e.rest();if(p==="-"||!p.startsWith("-]"))throw e.rewindTo(t),new Ae(G.ERR_INVALID_CHAR_RANGE,e.rest())}o=!1;const c=e.pos();if(e.lookingAt("[:")){if(this.parseNamedClass(e,s))continue;e.rewindTo(c)}if(this.parseUnicodeClass(e,s)||this.parsePerlClassEscape(e,s))continue;e.rewindTo(c);const u=G.parseClassChar(e,t);let l=u;if(e.more()&&e.lookingAt("-")){if(e.skip(1),e.more()&&e.lookingAt("]"))e.skip(-1);else if(l=G.parseClassChar(e,t),l<u)throw new Ae(G.ERR_INVALID_CHAR_RANGE,e.from(c))}(this.flags&q.FOLD_CASE)===0?s.appendRange(u,l):s.appendFoldedRange(u,l)}e.skip(1),s.cleanClass(),i<0&&s.negateClass(),r.runes=s.toArray(),this.push(r)}};_(G,"ERR_INTERNAL_ERROR","regexp/syntax: internal error"),_(G,"ERR_INVALID_CHAR_RANGE","invalid character class range"),_(G,"ERR_INVALID_ESCAPE","invalid escape sequence"),_(G,"ERR_INVALID_NAMED_CAPTURE","invalid named capture"),_(G,"ERR_INVALID_PERL_OP","invalid or unsupported Perl syntax"),_(G,"ERR_INVALID_REPEAT_OP","invalid nested repetition operator"),_(G,"ERR_INVALID_REPEAT_SIZE","invalid repeat count"),_(G,"ERR_MISSING_BRACKET","missing closing ]"),_(G,"ERR_MISSING_PAREN","missing closing )"),_(G,"ERR_MISSING_REPEAT_ARGUMENT","missing argument to repetition operator"),_(G,"ERR_TRAILING_BACKSLASH","trailing backslash at end of expression"),_(G,"ERR_DUPLICATE_NAMED_CAPTURE","duplicate capture group name");let fc=G;class vm{constructor(){this.inst=null,this.cap=[]}}class Yl{constructor(){this.sparse=[],this.densePcs=[],this.denseThreads=[],this.size=0}contains(e){const t=this.sparse[e];return t<this.size&&this.densePcs[t]===e}isEmpty(){return this.size===0}add(e){const t=this.size++;return this.sparse[e]=t,this.denseThreads[t]=null,this.densePcs[t]=e,t}clear(){this.sparse=[],this.densePcs=[],this.denseThreads=[],this.size=0}toString(){let e="{";for(let t=0;t<this.size;t++)t!==0&&(e+=", "),e+=this.densePcs[t];return e+="}",e}}class Pr{static fromRE2(e){const t=new Pr;return t.prog=e.prog,t.re2=e,t.q0=new Yl(t.prog.numInst()),t.q1=new Yl(t.prog.numInst()),t.pool=[],t.poolSize=0,t.matched=!1,t.matchcap=Array(t.prog.numCap<2?2:t.prog.numCap).fill(0),t.ncap=0,t}static fromMachine(e){const t=new Pr;return t.re2=e.re2,t.prog=e.prog,t.q0=e.q0,t.q1=e.q1,t.pool=e.pool,t.poolSize=e.poolSize,t.matched=e.matched,t.matchcap=e.matchcap,t.ncap=e.ncap,t}init(e){this.ncap=e,e>this.matchcap.length?this.initNewCap(e):this.resetCap(e)}resetCap(e){for(let t=0;t<this.poolSize;t++){const r=this.pool[t];r.cap=Array(e).fill(0)}}initNewCap(e){for(let t=0;t<this.poolSize;t++){const r=this.pool[t];r.cap=Array(e).fill(0)}this.matchcap=Array(e).fill(0)}submatches(){return this.ncap===0?ee.emptyInts():this.matchcap.slice(0,this.ncap)}alloc(e){let t;return this.poolSize>0?(this.poolSize--,t=this.pool[this.poolSize]):t=new vm,t.inst=e,t}freeQueue(e,t=0){const r=e.size-t,s=this.poolSize+r;this.pool.length<s&&(this.pool=this.pool.slice(0,Math.max(this.pool.length*2,s)));for(let i=t;i<e.size;i++){const o=e.denseThreads[i];o!==null&&(this.pool[this.poolSize]=o,this.poolSize++)}e.clear()}freeThread(e){this.pool.length<=this.poolSize&&(this.pool=this.pool.slice(0,this.pool.length*2)),this.pool[this.poolSize]=e,this.poolSize++}match(e,t,r){const s=this.re2.cond;if(s===ee.EMPTY_ALL||(r===q.ANCHOR_START||r===q.ANCHOR_BOTH)&&t!==0)return!1;this.matched=!1,this.matchcap=Array(this.prog.numCap).fill(-1);let i=this.q0,o=this.q1,c=e.step(t),u=c>>3,l=c&7,p=-1,g=0;c!==An.EOF()&&(c=e.step(t+l),p=c>>3,g=c&7);let T;for(t===0?T=ee.emptyOpContext(-1,u):T=e.context(t);;){if(i.isEmpty()){if((s&ee.EMPTY_BEGIN_TEXT)!==0&&t!==0||this.matched)break;if(this.re2.prefix.length!==0&&p!==this.re2.prefixRune&&e.canCheckPrefix()){const L=e.index(this.re2,t);if(L<0)break;t+=L,c=e.step(t),u=c>>3,l=c&7,c=e.step(t+l),p=c>>3,g=c&7}}!this.matched&&(t===0||r===q.UNANCHORED)&&(this.ncap>0&&(this.matchcap[0]=t),this.add(i,this.prog.start,t,this.matchcap,T,null));const b=t+l;if(T=e.context(b),this.step(i,o,t,b,u,T,r,t===e.endPos()),l===0||this.ncap===0&&this.matched)break;t+=l,u=p,l=g,u!==-1&&(c=e.step(t+l),p=c>>3,g=c&7);const O=i;i=o,o=O}return this.freeQueue(o),this.matched}step(e,t,r,s,i,o,c,u){const l=this.re2.longest;for(let p=0;p<e.size;p++){let g=e.denseThreads[p];if(g===null)continue;if(l&&this.matched&&this.ncap>0&&this.matchcap[0]<g.cap[0]){this.freeThread(g);continue}const T=g.inst;let b=!1;switch(T.op){case te.MATCH:if(c===q.ANCHOR_BOTH&&!u)break;this.ncap>0&&(!l||!this.matched||this.matchcap[1]<r)&&(g.cap[1]=r,this.matchcap=g.cap.slice(0,this.ncap)),l||this.freeQueue(e,p+1),this.matched=!0;break;case te.RUNE:b=T.matchRune(i);break;case te.RUNE1:b=i===T.runes[0];break;case te.RUNE_ANY:b=!0;break;case te.RUNE_ANY_NOT_NL:b=i!==S.CODES.get(`
`);break;default:throw new Error("bad inst")}b&&(g=this.add(t,T.out,s,g.cap,o,g)),g!==null&&(this.freeThread(g),e.denseThreads[p]=null)}e.clear()}add(e,t,r,s,i,o){if(t===0||e.contains(t))return o;const c=e.add(t),u=this.prog.inst[t];switch(u.op){case te.FAIL:break;case te.ALT:case te.ALT_MATCH:o=this.add(e,u.out,r,s,i,o),o=this.add(e,u.arg,r,s,i,o);break;case te.EMPTY_WIDTH:(u.arg&~i)===0&&(o=this.add(e,u.out,r,s,i,o));break;case te.NOP:o=this.add(e,u.out,r,s,i,o);break;case te.CAPTURE:if(u.arg<this.ncap){const l=s[u.arg];s[u.arg]=r,this.add(e,u.out,r,s,i,null),s[u.arg]=l}else o=this.add(e,u.out,r,s,i,o);break;case te.MATCH:case te.RUNE:case te.RUNE1:case te.RUNE_ANY:case te.RUNE_ANY_NOT_NL:o===null?o=this.alloc(u):o.inst=u,this.ncap>0&&o.cap!==s&&(o.cap=s.slice(0,this.ncap)),e.denseThreads[c]=o,o=null;break;default:throw new Error("unhandled")}return o}}class Rm{constructor(e){this.value=e}get(){return this.value}set(e){this.value=e}compareAndSet(e,t){return this.value===e?(this.value=t,!0):!1}}class yn{static initTest(e){const t=yn.compile(e),r=new yn(t.expr,t.prog,t.numSubexp,t.longest);return r.cond=t.cond,r.prefix=t.prefix,r.prefixUTF8=t.prefixUTF8,r.prefixComplete=t.prefixComplete,r.prefixRune=t.prefixRune,r}static compile(e){return yn.compileImpl(e,q.PERL,!1)}static compilePOSIX(e){return yn.compileImpl(e,q.POSIX,!0)}static compileImpl(e,t,r){let s=fc.parse(e,t);const i=s.maxCap();s=Pt.simplify(s);const o=Ss.compileRegexp(s),c=new yn(e,o,i,r),[u,l]=o.prefix();return c.prefixComplete=u,c.prefix=l,c.prefixUTF8=ee.stringToUtf8ByteArray(c.prefix),c.prefix.length>0&&(c.prefixRune=c.prefix.codePointAt(0)),c.namedGroups=s.namedGroups,c}static match(e,t){return yn.compile(e).match(t)}constructor(e,t,r=0,s=0){this.expr=e,this.prog=t,this.numSubexp=r,this.longest=s,this.cond=t.startCond(),this.prefix=null,this.prefixUTF8=null,this.prefixComplete=!1,this.prefixRune=0,this.pooled=new Rm}numberOfCapturingGroups(){return this.numSubexp}get(){let e;do e=this.pooled.get();while(e&&!this.pooled.compareAndSet(e,e.next));return e}reset(){this.pooled.set(null)}put(e,t){let r=this.pooled.get();do r=this.pooled.get(),!t&&r&&(e=Pr.fromMachine(e),t=!0),e.next!==r&&(e.next=r);while(!this.pooled.compareAndSet(r,e))}toString(){return this.expr}doExecute(e,t,r,s){let i=this.get(),o=!1;i?i.next!==null&&(i=Pr.fromMachine(i),o=!0):(i=Pr.fromRE2(this),o=!0),i.init(s);const c=i.match(e,t,r)?i.submatches():null;return this.put(i,o),c}match(e){return this.doExecute(ve.fromUTF16(e),0,q.UNANCHORED,0)!==null}matchWithGroup(e,t,r,s,i){return e instanceof Dn||(e=lo.utf16(e)),this.matchMachineInput(e,t,r,s,i)}matchMachineInput(e,t,r,s,i){if(t>r)return[!1,null];const o=e.isUTF16Encoding()?ve.fromUTF16(e.asCharSequence(),0,r):ve.fromUTF8(e.asBytes(),0,r),c=this.doExecute(o,t,s,2*i);return c===null?[!1,null]:[!0,c]}matchUTF8(e){return this.doExecute(ve.fromUTF8(e),0,q.UNANCHORED,0)!==null}replaceAll(e,t){return this.replaceAllFunc(e,()=>t,2*e.length+1)}replaceFirst(e,t){return this.replaceAllFunc(e,()=>t,1)}replaceAllFunc(e,t,r){let s=0,i=0,o="";const c=ve.fromUTF16(e);let u=0;for(;i<=e.length;){const l=this.doExecute(c,i,q.UNANCHORED,2);if(l===null||l.length===0)break;o+=e.substring(s,l[0]),(l[1]>s||l[0]===0)&&(o+=t(e.substring(l[0],l[1])),u++),s=l[1];const p=c.step(i)&7;if(i+p>l[1]?i+=p:i+1>l[1]?i++:i=l[1],u>=r)break}return o+=e.substring(s),o}pad(e){if(e===null)return null;let t=(1+this.numSubexp)*2;if(e.length<t){let r=new Array(t).fill(-1);for(let s=0;s<e.length;s++)r[s]=e[s];e=r}return e}allMatches(e,t,r=s=>s){let s=[];const i=e.endPos();t<0&&(t=i+1);let o=0,c=0,u=-1;for(;c<t&&o<=i;){const l=this.doExecute(e,o,q.UNANCHORED,this.prog.numCap);if(l===null||l.length===0)break;let p=!0;if(l[1]===o){l[0]===u&&(p=!1);const g=e.step(o);g<0?o=i+1:o+=g&7}else o=l[1];u=l[1],p&&(s.push(r(this.pad(l))),c++)}return s}findUTF8(e){const t=this.doExecute(ve.fromUTF8(e),0,q.UNANCHORED,2);return t===null?null:e.slice(t[0],t[1])}findUTF8Index(e){const t=this.doExecute(ve.fromUTF8(e),0,q.UNANCHORED,2);return t===null?null:t.slice(0,2)}find(e){const t=this.doExecute(ve.fromUTF16(e),0,q.UNANCHORED,2);return t===null?"":e.substring(t[0],t[1])}findIndex(e){return this.doExecute(ve.fromUTF16(e),0,q.UNANCHORED,2)}findUTF8Submatch(e){const t=this.doExecute(ve.fromUTF8(e),0,q.UNANCHORED,this.prog.numCap);if(t===null)return null;const r=new Array(1+this.numSubexp).fill(null);for(let s=0;s<r.length;s++)2*s<t.length&&t[2*s]>=0&&(r[s]=e.slice(t[2*s],t[2*s+1]));return r}findUTF8SubmatchIndex(e){return this.pad(this.doExecute(ve.fromUTF8(e),0,q.UNANCHORED,this.prog.numCap))}findSubmatch(e){const t=this.doExecute(ve.fromUTF16(e),0,q.UNANCHORED,this.prog.numCap);if(t===null)return null;const r=new Array(1+this.numSubexp).fill(null);for(let s=0;s<r.length;s++)2*s<t.length&&t[2*s]>=0&&(r[s]=e.substring(t[2*s],t[2*s+1]));return r}findSubmatchIndex(e){return this.pad(this.doExecute(ve.fromUTF16(e),0,q.UNANCHORED,this.prog.numCap))}findAllUTF8(e,t){const r=this.allMatches(ve.fromUTF8(e),t,s=>e.slice(s[0],s[1]));return r.length===0?null:r}findAllUTF8Index(e,t){const r=this.allMatches(ve.fromUTF8(e),t,s=>s.slice(0,2));return r.length===0?null:r}findAll(e,t){const r=this.allMatches(ve.fromUTF16(e),t,s=>e.substring(s[0],s[1]));return r.length===0?null:r}findAllIndex(e,t){const r=this.allMatches(ve.fromUTF16(e),t,s=>s.slice(0,2));return r.length===0?null:r}findAllUTF8Submatch(e,t){const r=this.allMatches(ve.fromUTF8(e),t,s=>{let i=new Array(s.length/2|0).fill(null);for(let o=0;o<i.length;o++)s[2*o]>=0&&(i[o]=e.slice(s[2*o],s[2*o+1]));return i});return r.length===0?null:r}findAllUTF8SubmatchIndex(e,t){const r=this.allMatches(ve.fromUTF8(e),t);return r.length===0?null:r}findAllSubmatch(e,t){const r=this.allMatches(ve.fromUTF16(e),t,s=>{let i=new Array(s.length/2|0).fill(null);for(let o=0;o<i.length;o++)s[2*o]>=0&&(i[o]=e.substring(s[2*o],s[2*o+1]));return i});return r.length===0?null:r}findAllSubmatchIndex(e,t){const r=this.allMatches(ve.fromUTF16(e),t);return r.length===0?null:r}}const et=class et{static quote(e){return ee.quoteMeta(e)}static compile(e,t=0){let r=e;if((t&et.CASE_INSENSITIVE)!==0&&(r=`(?i)${r}`),(t&et.DOTALL)!==0&&(r=`(?s)${r}`),(t&et.MULTILINE)!==0&&(r=`(?m)${r}`),(t&-32)!==0)throw new ym("Flags should only be a combination of MULTILINE, DOTALL, CASE_INSENSITIVE, DISABLE_UNICODE_GROUPS, LONGEST_MATCH");let s=q.PERL;(t&et.DISABLE_UNICODE_GROUPS)!==0&&(s&=-129);const i=new et(e,t);return i.re2Input=yn.compileImpl(r,s,(t&et.LONGEST_MATCH)!==0),i}static matches(e,t){return et.compile(e).matcher(t).matches()}static initTest(e,t,r){if(e==null)throw new Error("pattern is null");if(r==null)throw new Error("re2 is null");const s=new et(e,t);return s.re2Input=r,s}constructor(e,t){this.patternInput=e,this.flagsInput=t}reset(){this.re2Input.reset()}flags(){return this.flagsInput}pattern(){return this.patternInput}re2(){return this.re2Input}matches(e){return this.matcher(e).matches()}matcher(e){return Array.isArray(e)&&(e=lo.utf8(e)),new Em(this,e)}split(e,t=0){const r=this.matcher(e),s=[];let i=0,o=0;for(;r.find();){if(o===0&&r.end()===0){o=r.end();continue}if(t>0&&s.length===t-1)break;if(o===r.start()){if(t===0){i+=1,o=r.end();continue}}else for(;i>0;)s.push(""),i-=1;s.push(r.substring(o,r.start())),o=r.end()}if(t===0&&o!==r.inputLength()){for(;i>0;)s.push(""),i-=1;s.push(r.substring(o,r.inputLength()))}return(t!==0||s.length===0)&&s.push(r.substring(o,r.inputLength())),s}toString(){return this.patternInput}groupCount(){return this.re2Input.numberOfCapturingGroups()}namedGroups(){return this.re2Input.namedGroups}equals(e){return this===e?!0:e===null||this.constructor!==e.constructor?!1:this.flagsInput===e.flagsInput&&this.patternInput===e.patternInput}};_(et,"CASE_INSENSITIVE",1),_(et,"DOTALL",2),_(et,"MULTILINE",4),_(et,"DISABLE_UNICODE_GROUPS",8),_(et,"LONGEST_MATCH",16);let $s=et;/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ge{constructor(e){this.uid=e}isAuthenticated(){return this.uid!=null}toKey(){return this.isAuthenticated()?"uid:"+this.uid:"anonymous-user"}isEqual(e){return e.uid===this.uid}}Ge.UNAUTHENTICATED=new Ge(null),Ge.GOOGLE_CREDENTIALS=new Ge("google-credentials-uid"),Ge.FIRST_PARTY=new Ge("first-party-uid"),Ge.MOCK_USER=new Ge("mock-user");/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let qr="12.15.0";function Cm(n){qr=n}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *//**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Vn=new Do("@firebase/firestore");function Ir(){return Vn.logLevel}function Ly(n){Vn.setLogLevel(n)}function $(n,...e){if(Vn.logLevel<=ie.DEBUG){const t=e.map(Gc);Vn.debug(`Firestore (${qr}): ${n}`,...t)}}function on(n,...e){if(Vn.logLevel<=ie.ERROR){const t=e.map(Gc);Vn.error(`Firestore (${qr}): ${n}`,...t)}}function Ot(n,...e){if(Vn.logLevel<=ie.WARN){const t=e.map(Gc);Vn.warn(`Firestore (${qr}): ${n}`,...t)}}function Gc(n){if(typeof n=="string")return n;try{return(function(t){return JSON.stringify(t)})(n)}catch{return n}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function z(n,e,t){let r="Unexpected state";typeof e=="string"?r=e:t=e,df(n,r,t)}function df(n,e,t){let r=`FIRESTORE (${qr}) INTERNAL ASSERTION FAILED: ${e} (ID: ${n.toString(16)})`;if(t!==void 0)try{r+=" CONTEXT: "+JSON.stringify(t)}catch{r+=" CONTEXT: "+t}throw on(r),new Error(r)}function j(n,e,t,r){let s="Unexpected state";typeof t=="string"?s=t:r=t,n||df(e,s,r)}function Z(n,e){return n}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const V={OK:"ok",CANCELLED:"cancelled",UNKNOWN:"unknown",INVALID_ARGUMENT:"invalid-argument",DEADLINE_EXCEEDED:"deadline-exceeded",NOT_FOUND:"not-found",ALREADY_EXISTS:"already-exists",PERMISSION_DENIED:"permission-denied",UNAUTHENTICATED:"unauthenticated",RESOURCE_EXHAUSTED:"resource-exhausted",FAILED_PRECONDITION:"failed-precondition",ABORTED:"aborted",OUT_OF_RANGE:"out-of-range",UNIMPLEMENTED:"unimplemented",INTERNAL:"internal",UNAVAILABLE:"unavailable",DATA_LOSS:"data-loss"};class U extends Ct{constructor(e,t){super(e,t),this.code=e,this.message=t,this.toString=()=>`${this.name}: [code=${this.code}]: ${this.message}`}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Bt{constructor(){this.promise=new Promise(((e,t)=>{this.resolve=e,this.reject=t}))}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class pf{constructor(e,t){this.user=t,this.type="OAuth",this.headers=new Map,this.headers.set("Authorization",`Bearer ${e}`)}}class Pm{getToken(){return Promise.resolve(null)}invalidateToken(){}start(e,t){e.enqueueRetryable((()=>t(Ge.UNAUTHENTICATED)))}shutdown(){}}class Sm{constructor(e){this.token=e,this.changeListener=null}getToken(){return Promise.resolve(this.token)}invalidateToken(){}start(e,t){this.changeListener=t,e.enqueueRetryable((()=>t(this.token.user)))}shutdown(){this.changeListener=null}}class bm{constructor(e){this.t=e,this.currentUser=Ge.UNAUTHENTICATED,this.i=0,this.forceRefresh=!1,this.auth=null}start(e,t){j(this.o===void 0,42304);let r=this.i;const s=u=>this.i!==r?(r=this.i,t(u)):Promise.resolve();let i=new Bt;this.o=()=>{this.i++,this.currentUser=this.u(),i.resolve(),i=new Bt,e.enqueueRetryable((()=>s(this.currentUser)))};const o=()=>{const u=i;e.enqueueRetryable((async()=>{await u.promise,await s(this.currentUser)}))},c=u=>{$("FirebaseAuthCredentialsProvider","Auth detected"),this.auth=u,this.o&&(this.auth.addAuthTokenListener(this.o),o())};this.t.onInit((u=>c(u))),setTimeout((()=>{if(!this.auth){const u=this.t.getImmediate({optional:!0});u?c(u):($("FirebaseAuthCredentialsProvider","Auth not yet detected"),i.resolve(),i=new Bt)}}),0),o()}getToken(){const e=this.i,t=this.forceRefresh;return this.forceRefresh=!1,this.auth?this.auth.getToken(t).then((r=>this.i!==e?($("FirebaseAuthCredentialsProvider","getToken aborted due to token change."),this.getToken()):r?(j(typeof r.accessToken=="string",31837,{l:r}),new pf(r.accessToken,this.currentUser)):null)):Promise.resolve(null)}invalidateToken(){this.forceRefresh=!0}shutdown(){this.auth&&this.o&&this.auth.removeAuthTokenListener(this.o),this.o=void 0}u(){const e=this.auth&&this.auth.getUid();return j(e===null||typeof e=="string",2055,{h:e}),new Ge(e)}}class Nm{constructor(e,t,r){this.T=e,this.P=t,this.R=r,this.type="FirstParty",this.user=Ge.FIRST_PARTY,this.I=new Map}A(){return this.R?this.R():null}get headers(){this.I.set("X-Goog-AuthUser",this.T);const e=this.A();return e&&this.I.set("Authorization",e),this.P&&this.I.set("X-Goog-Iam-Authorization-Token",this.P),this.I}}class Om{constructor(e,t,r){this.T=e,this.P=t,this.R=r}getToken(){return Promise.resolve(new Nm(this.T,this.P,this.R))}start(e,t){e.enqueueRetryable((()=>t(Ge.FIRST_PARTY)))}shutdown(){}invalidateToken(){}}class Ql{constructor(e){this.value=e,this.type="AppCheck",this.headers=new Map,e&&e.length>0&&this.headers.set("x-firebase-appcheck",this.value)}}class km{constructor(e,t){this.V=t,this.forceRefresh=!1,this.appCheck=null,this.m=null,this.p=null,ze(e)&&e.settings.appCheckToken&&(this.p=e.settings.appCheckToken)}start(e,t){j(this.o===void 0,3512);const r=i=>{i.error!=null&&$("FirebaseAppCheckTokenProvider",`Error getting App Check token; using placeholder token instead. Error: ${i.error.message}`);const o=i.token!==this.m;return this.m=i.token,$("FirebaseAppCheckTokenProvider",`Received ${o?"new":"existing"} token.`),o?t(i.token):Promise.resolve()};this.o=i=>{e.enqueueRetryable((()=>r(i)))};const s=i=>{$("FirebaseAppCheckTokenProvider","AppCheck detected"),this.appCheck=i,this.o&&this.appCheck.addTokenListener(this.o)};this.V.onInit((i=>s(i))),setTimeout((()=>{if(!this.appCheck){const i=this.V.getImmediate({optional:!0});i?s(i):$("FirebaseAppCheckTokenProvider","AppCheck not yet detected")}}),0)}getToken(){if(this.p)return Promise.resolve(new Ql(this.p));const e=this.forceRefresh;return this.forceRefresh=!1,this.appCheck?this.appCheck.getToken(e).then((t=>t?(j(typeof t.token=="string",44558,{tokenResult:t}),this.m=t.token,new Ql(t.token)):null)):Promise.resolve(null)}invalidateToken(){this.forceRefresh=!0}shutdown(){this.appCheck&&this.o&&this.appCheck.removeTokenListener(this.o),this.o=void 0}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Dm(n){const e=typeof self<"u"&&(self.crypto||self.msCrypto),t=new Uint8Array(n);if(e&&typeof e.getRandomValues=="function")e.getRandomValues(t);else for(let r=0;r<n;r++)t[r]=Math.floor(256*Math.random());return t}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Wc{static newId(){const e="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",t=62*Math.floor(4.129032258064516);let r="";for(;r.length<20;){const s=Dm(40);for(let i=0;i<s.length;++i)r.length<20&&s[i]<t&&(r+=e.charAt(s[i]%62))}return r}}function se(n,e){return n<e?-1:n>e?1:0}function dc(n,e){const t=Math.min(n.length,e.length);for(let r=0;r<t;r++){const s=n.charAt(r),i=e.charAt(r);if(s!==i)return Wa(s)===Wa(i)?se(s,i):Wa(s)?1:-1}return se(n.length,e.length)}const Vm=55296,xm=57343;function Wa(n){const e=n.charCodeAt(0);return e>=Vm&&e<=xm}function kr(n,e,t){return n.length===e.length&&n.every(((r,s)=>t(r,e[s])))}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Mt="__name__";class Lt{constructor(e,t,r){t===void 0?t=0:t>e.length&&z(637,{offset:t,range:e.length}),r===void 0?r=e.length-t:r>e.length-t&&z(1746,{length:r,range:e.length-t}),this.segments=e,this.offset=t,this.len=r}get length(){return this.len}isEqual(e){return Lt.comparator(this,e)===0}child(e){const t=this.segments.slice(this.offset,this.limit());return e instanceof Lt?e.forEach((r=>{t.push(r)})):t.push(e),this.construct(t)}limit(){return this.offset+this.length}popFirst(e){return e=e===void 0?1:e,this.construct(this.segments,this.offset+e,this.length-e)}popLast(){return this.construct(this.segments,this.offset,this.length-1)}firstSegment(){return this.segments[this.offset]}lastSegment(){return this.get(this.length-1)}get(e){return this.segments[this.offset+e]}isEmpty(){return this.length===0}isPrefixOf(e){if(e.length<this.length)return!1;for(let t=0;t<this.length;t++)if(this.get(t)!==e.get(t))return!1;return!0}isImmediateParentOf(e){if(this.length+1!==e.length)return!1;for(let t=0;t<this.length;t++)if(this.get(t)!==e.get(t))return!1;return!0}forEach(e){for(let t=this.offset,r=this.limit();t<r;t++)e(this.segments[t])}toArray(){return this.segments.slice(this.offset,this.limit())}static comparator(e,t){const r=Math.min(e.length,t.length);for(let s=0;s<r;s++){const i=Lt.compareSegments(e.get(s),t.get(s));if(i!==0)return i}return se(e.length,t.length)}static compareSegments(e,t){const r=Lt.isNumericId(e),s=Lt.isNumericId(t);return r&&!s?-1:!r&&s?1:r&&s?Lt.extractNumericId(e).compare(Lt.extractNumericId(t)):dc(e,t)}static isNumericId(e){return e.startsWith("__id")&&e.endsWith("__")}static extractNumericId(e){return bn.fromString(e.substring(4,e.length-2))}}class ue extends Lt{construct(e,t,r){return new ue(e,t,r)}canonicalString(){return this.toArray().join("/")}toString(){return this.canonicalString()}toStringWithLeadingSlash(){return`/${this.canonicalString()}`}toUriEncodedString(){return this.toArray().map(encodeURIComponent).join("/")}static fromString(...e){const t=[];for(const r of e){if(r.indexOf("//")>=0)throw new U(V.INVALID_ARGUMENT,`Invalid segment (${r}). Paths must not contain // in them.`);t.push(...r.split("/").filter((s=>s.length>0)))}return new ue(t)}static emptyPath(){return new ue([])}}const Lm=/^[_a-zA-Z][_a-zA-Z0-9]*$/;class De extends Lt{construct(e,t,r){return new De(e,t,r)}static isValidIdentifier(e){return Lm.test(e)}canonicalString(){return this.toArray().map((e=>(e=e.replace(/\\/g,"\\\\").replace(/`/g,"\\`"),De.isValidIdentifier(e)||(e="`"+e+"`"),e))).join(".")}toString(){return this.canonicalString()}isKeyField(){return this.length===1&&this.get(0)===Mt}static keyField(){return new De([Mt])}static fromServerFormat(e){const t=[];let r="",s=0;const i=()=>{if(r.length===0)throw new U(V.INVALID_ARGUMENT,`Invalid field path (${e}). Paths must not be empty, begin with '.', end with '.', or contain '..'`);t.push(r),r=""};let o=!1;for(;s<e.length;){const c=e[s];if(c==="\\"){if(s+1===e.length)throw new U(V.INVALID_ARGUMENT,"Path has trailing escape character: "+e);const u=e[s+1];if(u!=="\\"&&u!=="."&&u!=="`")throw new U(V.INVALID_ARGUMENT,"Path has invalid escape sequence: "+e);r+=u,s+=2}else c==="`"?(o=!o,s++):c!=="."||o?(r+=c,s++):(i(),s++)}if(i(),o)throw new U(V.INVALID_ARGUMENT,"Unterminated ` in path: "+e);return new De(t)}static emptyPath(){return new De([])}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class W{constructor(e){this.path=e}static fromPath(e){return new W(ue.fromString(e))}static fromName(e){return new W(ue.fromString(e).popFirst(5))}static empty(){return new W(ue.emptyPath())}get collectionGroup(){return this.path.popLast().lastSegment()}hasCollectionId(e){return this.path.length>=2&&this.path.get(this.path.length-2)===e}getCollectionGroup(){return this.path.get(this.path.length-2)}getCollectionPath(){return this.path.popLast()}isEqual(e){return e!==null&&ue.comparator(this.path,e.path)===0}toString(){return this.path.toString()}static comparator(e,t){return ue.comparator(e.path,t.path)}static isDocumentKey(e){return e.length%2==0}static fromSegments(e){return new W(new ue(e.slice()))}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function mf(n,e,t){if(!t)throw new U(V.INVALID_ARGUMENT,`Function ${n}() cannot be called with an empty ${e}.`)}function Mm(n,e,t,r){if(e===!0&&r===!0)throw new U(V.INVALID_ARGUMENT,`${n} and ${t} cannot be used together.`)}function Xl(n){if(!W.isDocumentKey(n))throw new U(V.INVALID_ARGUMENT,`Invalid document reference. Document references must have an even number of segments, but ${n} has ${n.length}.`)}function Jl(n){if(W.isDocumentKey(n))throw new U(V.INVALID_ARGUMENT,`Invalid collection reference. Collection references must have an odd number of segments, but ${n} has ${n.length}.`)}function ci(n){return typeof n=="object"&&n!==null&&(Object.getPrototypeOf(n)===Object.prototype||Object.getPrototypeOf(n)===null)}function Bo(n){if(n===void 0)return"undefined";if(n===null)return"null";if(typeof n=="string")return n.length>20&&(n=`${n.substring(0,20)}...`),JSON.stringify(n);if(typeof n=="number"||typeof n=="boolean")return""+n;if(typeof n=="object"){if(n instanceof Array)return"an array";{const e=(function(r){return r.constructor?r.constructor.name:null})(n);return e?`a custom ${e} object`:"an object"}}return typeof n=="function"?"a function":z(12329,{type:typeof n})}function Ye(n,e){if("_delegate"in n&&(n=n._delegate),!(n instanceof e)){if(e.name===n.constructor.name)throw new U(V.INVALID_ARGUMENT,"Type does not match the expected instance. Did you pass a reference from a different Firestore SDK?");{const t=Bo(n);throw new U(V.INVALID_ARGUMENT,`Expected type '${e.name}', but it was: ${t}`)}}return n}function Fm(n,e){if(e<=0)throw new U(V.INVALID_ARGUMENT,`Function ${n}() requires a positive number, but it was: ${e}.`)}/**
 * @license
 * Copyright 2025 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Se(n,e){const t={typeString:n};return e&&(t.value=e),t}function ui(n,e){if(!ci(n))throw new U(V.INVALID_ARGUMENT,"JSON must be an object");let t;for(const r in e)if(e[r]){const s=e[r].typeString,i="value"in e[r]?{value:e[r].value}:void 0;if(!(r in n)){t=`JSON missing required field: '${r}'`;break}const o=n[r];if(s&&typeof o!==s){t=`JSON field '${r}' must be a ${s}.`;break}if(i!==void 0&&o!==i.value){t=`Expected '${r}' field to equal '${i.value}'`;break}}if(t)throw new U(V.INVALID_ARGUMENT,t);return!0}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Zl=-62135596800,eh=1e6;class ge{static now(){return ge.fromMillis(Date.now())}static fromDate(e){return ge.fromMillis(e.getTime())}static fromMillis(e){const t=Math.floor(e/1e3),r=Math.floor((e-1e3*t)*eh);return new ge(t,r)}constructor(e,t){if(this.seconds=e,this.nanoseconds=t,t<0)throw new U(V.INVALID_ARGUMENT,"Timestamp nanoseconds out of range: "+t);if(t>=1e9)throw new U(V.INVALID_ARGUMENT,"Timestamp nanoseconds out of range: "+t);if(e<Zl)throw new U(V.INVALID_ARGUMENT,"Timestamp seconds out of range: "+e);if(e>=253402300800)throw new U(V.INVALID_ARGUMENT,"Timestamp seconds out of range: "+e)}toDate(){return new Date(this.toMillis())}toMillis(){return 1e3*this.seconds+this.nanoseconds/eh}_compareTo(e){return this.seconds===e.seconds?se(this.nanoseconds,e.nanoseconds):se(this.seconds,e.seconds)}isEqual(e){return e.seconds===this.seconds&&e.nanoseconds===this.nanoseconds}toString(){return"Timestamp(seconds="+this.seconds+", nanoseconds="+this.nanoseconds+")"}toJSON(){return{type:ge._jsonSchemaVersion,seconds:this.seconds,nanoseconds:this.nanoseconds}}static fromJSON(e){if(ui(e,ge._jsonSchema))return new ge(e.seconds,e.nanoseconds)}valueOf(){const e=this.seconds-Zl;return String(e).padStart(12,"0")+"."+String(this.nanoseconds).padStart(9,"0")}}ge._jsonSchemaVersion="firestore/timestamp/1.0",ge._jsonSchema={type:Se("string",ge._jsonSchemaVersion),seconds:Se("number"),nanoseconds:Se("number")};/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class J{static fromTimestamp(e){return new J(e)}static min(){return new J(new ge(0,0))}static max(){return new J(new ge(253402300799,999999999))}constructor(e){this.timestamp=e}compareTo(e){return this.timestamp._compareTo(e.timestamp)}isEqual(e){return this.timestamp.isEqual(e.timestamp)}toMicroseconds(){return 1e6*this.timestamp.seconds+this.timestamp.nanoseconds/1e3}toString(){return"SnapshotVersion("+this.timestamp.toString()+")"}toTimestamp(){return this.timestamp}}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const qs=-1;function Um(n,e){const t=n.toTimestamp().seconds,r=n.toTimestamp().nanoseconds+1,s=J.fromTimestamp(r===1e9?new ge(t+1,0):new ge(t,r));return new xn(s,W.empty(),e)}function Bm(n){return new xn(n.readTime,n.key,qs)}class xn{constructor(e,t,r){this.readTime=e,this.documentKey=t,this.largestBatchId=r}static min(){return new xn(J.min(),W.empty(),qs)}static max(){return new xn(J.max(),W.empty(),qs)}}function $m(n,e){let t=n.readTime.compareTo(e.readTime);return t!==0?t:(t=W.comparator(n.documentKey,e.documentKey),t!==0?t:se(n.largestBatchId,e.largestBatchId))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const qm="The current tab is not in the required state to perform this operation. It might be necessary to refresh the browser tab.";class Hm{constructor(){this.onCommittedListeners=[]}addOnCommittedListener(e){this.onCommittedListeners.push(e)}raiseOnCommittedEvent(){this.onCommittedListeners.forEach((e=>e()))}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function Hr(n){if(n.code!==V.FAILED_PRECONDITION||n.message!==qm)throw n;$("LocalStore","Unexpectedly lost primary lease")}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class x{constructor(e){this.nextCallback=null,this.catchCallback=null,this.result=void 0,this.error=void 0,this.isDone=!1,this.callbackAttached=!1,e((t=>{this.isDone=!0,this.result=t,this.nextCallback&&this.nextCallback(t)}),(t=>{this.isDone=!0,this.error=t,this.catchCallback&&this.catchCallback(t)}))}catch(e){return this.next(void 0,e)}next(e,t){return this.callbackAttached&&z(59440),this.callbackAttached=!0,this.isDone?this.error?this.wrapFailure(t,this.error):this.wrapSuccess(e,this.result):new x(((r,s)=>{this.nextCallback=i=>{this.wrapSuccess(e,i).next(r,s)},this.catchCallback=i=>{this.wrapFailure(t,i).next(r,s)}}))}toPromise(){return new Promise(((e,t)=>{this.next(e,t)}))}wrapUserFunction(e){try{const t=e();return t instanceof x?t:x.resolve(t)}catch(t){return x.reject(t)}}wrapSuccess(e,t){return e?this.wrapUserFunction((()=>e(t))):x.resolve(t)}wrapFailure(e,t){return e?this.wrapUserFunction((()=>e(t))):x.reject(t)}static resolve(e){return new x(((t,r)=>{t(e)}))}static reject(e){return new x(((t,r)=>{r(e)}))}static waitFor(e){return new x(((t,r)=>{let s=0,i=0,o=!1;e.forEach((c=>{++s,c.next((()=>{++i,o&&i===s&&t()}),(u=>r(u)))})),o=!0,i===s&&t()}))}static or(e){let t=x.resolve(!1);for(const r of e)t=t.next((s=>s?x.resolve(s):r()));return t}static forEach(e,t){const r=[];return e.forEach(((s,i)=>{r.push(t.call(this,s,i))})),this.waitFor(r)}static mapArray(e,t){return new x(((r,s)=>{const i=e.length,o=new Array(i);let c=0;for(let u=0;u<i;u++){const l=u;t(e[l]).next((p=>{o[l]=p,++c,c===i&&r(o)}),(p=>s(p)))}}))}static doWhile(e,t){return new x(((r,s)=>{const i=()=>{e()===!0?t().next((()=>{i()}),s):r()};i()}))}}function jm(n){const e=n.match(/Android ([\d.]+)/i),t=e?e[1].split(".").slice(0,2).join("."):"-1";return Number(t)}function jr(n){return n.name==="IndexedDbTransactionError"}/**
 * @license
 * Copyright 2018 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class $o{constructor(e,t){this.previousValue=e,t&&(t.sequenceNumberHandler=r=>this.ae(r),this.ue=r=>t.writeSequenceNumber(r))}ae(e){return this.previousValue=Math.max(e,this.previousValue),this.previousValue}next(){const e=++this.previousValue;return this.ue&&this.ue(e),e}}$o.ce=-1;/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const zc=-1;function qo(n){return n==null}function Hs(n){return n===0&&1/n==-1/0}function Gm(n){return typeof n=="number"&&Number.isInteger(n)&&!Hs(n)&&n<=Number.MAX_SAFE_INTEGER&&n>=Number.MIN_SAFE_INTEGER}function Wm(n){return typeof n=="string"}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const gf="";function zm(n){let e="";for(let t=0;t<n.length;t++)e.length>0&&(e=th(e)),e=Km(n.get(t),e);return th(e)}function Km(n,e){let t=e;const r=n.length;for(let s=0;s<r;s++){const i=n.charAt(s);switch(i){case"\0":t+="";break;case gf:t+="";break;default:t+=i}}return t}function th(n){return n+gf+""}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class _e{constructor(e,t){this.comparator=e,this.root=t||Fe.EMPTY}insert(e,t){return new _e(this.comparator,this.root.insert(e,t,this.comparator).copy(null,null,Fe.BLACK,null,null))}remove(e){return new _e(this.comparator,this.root.remove(e,this.comparator).copy(null,null,Fe.BLACK,null,null))}get(e){let t=this.root;for(;!t.isEmpty();){const r=this.comparator(e,t.key);if(r===0)return t.value;r<0?t=t.left:r>0&&(t=t.right)}return null}indexOf(e){let t=0,r=this.root;for(;!r.isEmpty();){const s=this.comparator(e,r.key);if(s===0)return t+r.left.size;s<0?r=r.left:(t+=r.left.size+1,r=r.right)}return-1}isEmpty(){return this.root.isEmpty()}get size(){return this.root.size}minKey(){return this.root.minKey()}maxKey(){return this.root.maxKey()}inorderTraversal(e){return this.root.inorderTraversal(e)}forEach(e){this.inorderTraversal(((t,r)=>(e(t,r),!1)))}toString(){const e=[];return this.inorderTraversal(((t,r)=>(e.push(`${t}:${r}`),!1))),`{${e.join(", ")}}`}reverseTraversal(e){return this.root.reverseTraversal(e)}getIterator(){return new Ui(this.root,null,this.comparator,!1)}getIteratorFrom(e){return new Ui(this.root,e,this.comparator,!1)}getReverseIterator(){return new Ui(this.root,null,this.comparator,!0)}getReverseIteratorFrom(e){return new Ui(this.root,e,this.comparator,!0)}}class Ui{constructor(e,t,r,s){this.isReverse=s,this.nodeStack=[];let i=1;for(;!e.isEmpty();)if(i=t?r(e.key,t):1,t&&s&&(i*=-1),i<0)e=this.isReverse?e.left:e.right;else{if(i===0){this.nodeStack.push(e);break}this.nodeStack.push(e),e=this.isReverse?e.right:e.left}}getNext(){let e=this.nodeStack.pop();const t={key:e.key,value:e.value};if(this.isReverse)for(e=e.left;!e.isEmpty();)this.nodeStack.push(e),e=e.right;else for(e=e.right;!e.isEmpty();)this.nodeStack.push(e),e=e.left;return t}hasNext(){return this.nodeStack.length>0}peek(){if(this.nodeStack.length===0)return null;const e=this.nodeStack[this.nodeStack.length-1];return{key:e.key,value:e.value}}}class Fe{constructor(e,t,r,s,i){this.key=e,this.value=t,this.color=r??Fe.RED,this.left=s??Fe.EMPTY,this.right=i??Fe.EMPTY,this.size=this.left.size+1+this.right.size}copy(e,t,r,s,i){return new Fe(e??this.key,t??this.value,r??this.color,s??this.left,i??this.right)}isEmpty(){return!1}inorderTraversal(e){return this.left.inorderTraversal(e)||e(this.key,this.value)||this.right.inorderTraversal(e)}reverseTraversal(e){return this.right.reverseTraversal(e)||e(this.key,this.value)||this.left.reverseTraversal(e)}min(){return this.left.isEmpty()?this:this.left.min()}minKey(){return this.min().key}maxKey(){return this.right.isEmpty()?this.key:this.right.maxKey()}insert(e,t,r){let s=this;const i=r(e,s.key);return s=i<0?s.copy(null,null,null,s.left.insert(e,t,r),null):i===0?s.copy(null,t,null,null,null):s.copy(null,null,null,null,s.right.insert(e,t,r)),s.fixUp()}removeMin(){if(this.left.isEmpty())return Fe.EMPTY;let e=this;return e.left.isRed()||e.left.left.isRed()||(e=e.moveRedLeft()),e=e.copy(null,null,null,e.left.removeMin(),null),e.fixUp()}remove(e,t){let r,s=this;if(t(e,s.key)<0)s.left.isEmpty()||s.left.isRed()||s.left.left.isRed()||(s=s.moveRedLeft()),s=s.copy(null,null,null,s.left.remove(e,t),null);else{if(s.left.isRed()&&(s=s.rotateRight()),s.right.isEmpty()||s.right.isRed()||s.right.left.isRed()||(s=s.moveRedRight()),t(e,s.key)===0){if(s.right.isEmpty())return Fe.EMPTY;r=s.right.min(),s=s.copy(r.key,r.value,null,null,s.right.removeMin())}s=s.copy(null,null,null,null,s.right.remove(e,t))}return s.fixUp()}isRed(){return this.color}fixUp(){let e=this;return e.right.isRed()&&!e.left.isRed()&&(e=e.rotateLeft()),e.left.isRed()&&e.left.left.isRed()&&(e=e.rotateRight()),e.left.isRed()&&e.right.isRed()&&(e=e.colorFlip()),e}moveRedLeft(){let e=this.colorFlip();return e.right.left.isRed()&&(e=e.copy(null,null,null,null,e.right.rotateRight()),e=e.rotateLeft(),e=e.colorFlip()),e}moveRedRight(){let e=this.colorFlip();return e.left.left.isRed()&&(e=e.rotateRight(),e=e.colorFlip()),e}rotateLeft(){const e=this.copy(null,null,Fe.RED,null,this.right.left);return this.right.copy(null,null,this.color,e,null)}rotateRight(){const e=this.copy(null,null,Fe.RED,this.left.right,null);return this.left.copy(null,null,this.color,null,e)}colorFlip(){const e=this.left.copy(null,null,!this.left.color,null,null),t=this.right.copy(null,null,!this.right.color,null,null);return this.copy(null,null,!this.color,e,t)}checkMaxDepth(){const e=this.check();return Math.pow(2,e)<=this.size+1}check(){if(this.isRed()&&this.left.isRed())throw z(43730,{key:this.key,value:this.value});if(this.right.isRed())throw z(14113,{key:this.key,value:this.value});const e=this.left.check();if(e!==this.right.check())throw z(27949);return e+(this.isRed()?0:1)}}Fe.EMPTY=null,Fe.RED=!0,Fe.BLACK=!1;Fe.EMPTY=new class{constructor(){this.size=0}get key(){throw z(57766)}get value(){throw z(16141)}get color(){throw z(16727)}get left(){throw z(29726)}get right(){throw z(36894)}copy(e,t,r,s,i){return this}insert(e,t,r){return new Fe(e,t)}remove(e,t){return this}isEmpty(){return!0}inorderTraversal(e){return!1}reverseTraversal(e){return!1}minKey(){return null}maxKey(){return null}isRed(){return!1}checkMaxDepth(){return!0}check(){return 0}};/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class be{constructor(e){this.comparator=e,this.data=new _e(this.comparator)}has(e){return this.data.get(e)!==null}first(){return this.data.minKey()}last(){return this.data.maxKey()}get size(){return this.data.size}indexOf(e){return this.data.indexOf(e)}forEach(e){this.data.inorderTraversal(((t,r)=>(e(t),!1)))}forEachInRange(e,t){const r=this.data.getIteratorFrom(e[0]);for(;r.hasNext();){const s=r.getNext();if(this.comparator(s.key,e[1])>=0)return;t(s.key)}}forEachWhile(e,t){let r;for(r=t!==void 0?this.data.getIteratorFrom(t):this.data.getIterator();r.hasNext();)if(!e(r.getNext().key))return}firstAfterOrEqual(e){const t=this.data.getIteratorFrom(e);return t.hasNext()?t.getNext().key:null}getIterator(){return new nh(this.data.getIterator())}getIteratorFrom(e){return new nh(this.data.getIteratorFrom(e))}add(e){return this.copy(this.data.remove(e).insert(e,!0))}delete(e){return this.has(e)?this.copy(this.data.remove(e)):this}isEmpty(){return this.data.isEmpty()}unionWith(e){let t=this;return t.size<e.size&&(t=e,e=this),e.forEach((r=>{t=t.add(r)})),t}isEqual(e){if(!(e instanceof be)||this.size!==e.size)return!1;const t=this.data.getIterator(),r=e.data.getIterator();for(;t.hasNext();){const s=t.getNext().key,i=r.getNext().key;if(this.comparator(s,i)!==0)return!1}return!0}toArray(){const e=[];return this.forEach((t=>{e.push(t)})),e}toString(){const e=[];return this.forEach((t=>e.push(t))),"SortedSet("+e.toString()+")"}copy(e){const t=new be(this.comparator);return t.data=e,t}}class nh{constructor(e){this.iter=e}getNext(){return this.iter.getNext().key}hasNext(){return this.iter.hasNext()}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class _t{constructor(e){this.fields=e,e.sort(De.comparator)}static empty(){return new _t([])}unionWith(e){let t=new be(De.comparator);for(const r of this.fields)t=t.add(r);for(const r of e)t=t.add(r);return new _t(t.toArray())}covers(e){for(const t of this.fields)if(t.isPrefixOf(e))return!0;return!1}isEqual(e){return kr(this.fields,e.fields,((t,r)=>t.isEqual(r)))}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function ho(n){let e=0;for(const t in n)Object.prototype.hasOwnProperty.call(n,t)&&e++;return e}function Gn(n,e){for(const t in n)Object.prototype.hasOwnProperty.call(n,t)&&e(t,n[t])}function _f(n,e){const t=[];for(const r in n)Object.prototype.hasOwnProperty.call(n,r)&&t.push(e(n[r],r,n));return t}function yf(n){for(const e in n)if(Object.prototype.hasOwnProperty.call(n,e))return!1;return!0}/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ef extends Error{constructor(){super(...arguments),this.name="Base64DecodeError"}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ne{constructor(e){this.binaryString=e}static fromBase64String(e){const t=(function(s){try{return atob(s)}catch(i){throw typeof DOMException<"u"&&i instanceof DOMException?new Ef("Invalid base64 string: "+i):i}})(e);return new Ne(t)}static fromUint8Array(e){const t=(function(s){let i="";for(let o=0;o<s.length;++o)i+=String.fromCharCode(s[o]);return i})(e);return new Ne(t)}[Symbol.iterator](){let e=0;return{next:()=>e<this.binaryString.length?{value:this.binaryString.charCodeAt(e++),done:!1}:{value:void 0,done:!0}}}toBase64(){return(function(t){return btoa(t)})(this.binaryString)}toUint8Array(){return(function(t){const r=new Uint8Array(t.length);for(let s=0;s<t.length;s++)r[s]=t.charCodeAt(s);return r})(this.binaryString)}approximateByteSize(){return 2*this.binaryString.length}compareTo(e){return se(this.binaryString,e.binaryString)}isEqual(e){return this.binaryString===e.binaryString}}Ne.EMPTY_BYTE_STRING=new Ne("");const Ym=new RegExp(/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(?:\.(\d+))?Z$/);function Ln(n){if(j(!!n,39018),typeof n=="string"){let e=0;const t=Ym.exec(n);if(j(!!t,46558,{timestamp:n}),t[1]){let s=t[1];s=(s+"000000000").substr(0,9),e=Number(s)}const r=new Date(n);return{seconds:Math.floor(r.getTime()/1e3),nanos:e}}return{seconds:Ee(n.seconds),nanos:Ee(n.nanos)}}function Ee(n){return typeof n=="number"?n:typeof n=="string"?Number(n):0}function Mn(n){return typeof n=="string"?Ne.fromBase64String(n):Ne.fromUint8Array(n)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const If="server_timestamp",Tf="__type__",wf="__previous_value__",Af="__local_write_time__";function Ho(n){return(n?.mapValue?.fields||{})[Tf]?.stringValue===If}function li(n){const e=n.mapValue.fields[wf];return Ho(e)?li(e):e}function Dr(n){const e=Ln(n.mapValue.fields[Af].timestampValue);return new ge(e.seconds,e.nanos)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Qm{constructor(e,t,r,s,i,o,c,u,l,p,g){this.databaseId=e,this.appId=t,this.persistenceKey=r,this.host=s,this.ssl=i,this.forceLongPolling=o,this.autoDetectLongPolling=c,this.longPollingOptions=u,this.useFetchStreams=l,this.isUsingEmulator=p,this.apiKey=g}}const js="(default)";class Gs{constructor(e,t){this.projectId=e,this.database=t||js}static empty(){return new Gs("","")}get isDefaultDatabase(){return this.database===js}isEqual(e){return e instanceof Gs&&e.projectId===this.projectId&&e.database===this.database}}function Xm(n,e){if(!Object.prototype.hasOwnProperty.apply(n.options,["projectId"]))throw new U(V.INVALID_ARGUMENT,'"projectId" not provided in firebase.initializeApp.');return new Gs(n.options.projectId,e)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const vf="__type__",Jm="__max__",Bi={mapValue:{}},Rf="__vector__",Ws="value",Vr={nullValue:"NULL_VALUE"},lt={booleanValue:!0},Me={booleanValue:!1};function Oe(n){return"nullValue"in n?0:"booleanValue"in n?1:"integerValue"in n||"doubleValue"in n?2:"timestampValue"in n?3:"stringValue"in n?5:"bytesValue"in n?6:"referenceValue"in n?7:"geoPointValue"in n?8:"arrayValue"in n?9:"mapValue"in n?Ho(n)?4:Zm(n)?9007199254740991:fo(n)?10:11:z(28295,{value:n})}function Rt(n,e,t){if(n===e)return!0;const r=Oe(n);if(r!==Oe(e))return!1;switch(r){case 0:case 9007199254740991:return!0;case 1:return n.booleanValue===e.booleanValue;case 4:return Dr(n).isEqual(Dr(e));case 3:return(function(i,o){if(typeof i.timestampValue=="string"&&typeof o.timestampValue=="string"&&i.timestampValue.length===o.timestampValue.length)return i.timestampValue===o.timestampValue;const c=Ln(i.timestampValue),u=Ln(o.timestampValue);return c.seconds===u.seconds&&c.nanos===u.nanos})(n,e);case 5:return n.stringValue===e.stringValue;case 6:return(function(i,o){return Mn(i.bytesValue).isEqual(Mn(o.bytesValue))})(n,e);case 7:return n.referenceValue===e.referenceValue;case 8:return(function(i,o){return Ee(i.geoPointValue.latitude)===Ee(o.geoPointValue.latitude)&&Ee(i.geoPointValue.longitude)===Ee(o.geoPointValue.longitude)})(n,e);case 2:return(function(i,o,c){if("integerValue"in i&&"integerValue"in o)return Ee(i.integerValue)===Ee(o.integerValue);let u,l;if("doubleValue"in i&&"doubleValue"in o)u=Ee(i.doubleValue),l=Ee(o.doubleValue);else{if(!c?.Ee)return!1;u=Ee(i.integerValue??i.doubleValue),l=Ee(o.integerValue??o.doubleValue)}return u===l?!!c?.he||Hs(u)===Hs(l):!!(c===void 0||c.Te)&&isNaN(u)&&isNaN(l)})(n,e,t);case 9:return kr(n.arrayValue.values||[],e.arrayValue.values||[],((s,i)=>Rt(s,i,t)));case 10:case 11:return(function(i,o,c){const u=i.mapValue.fields||{},l=o.mapValue.fields||{};if(ho(u)!==ho(l))return!1;for(const p in u)if(u.hasOwnProperty(p)&&(l[p]===void 0||!Rt(u[p],l[p],c)))return!1;return!0})(n,e,t);default:return z(52216,{left:n})}}function zs(n,e){return(n.values||[]).find((t=>Rt(t,e)))!==void 0}function ht(n,e){if(n===e)return 0;const t=Oe(n),r=Oe(e);if(t!==r)return se(t,r);switch(t){case 0:case 9007199254740991:return 0;case 1:return se(n.booleanValue,e.booleanValue);case 2:return(function(i,o){const c=Ee(i.integerValue||i.doubleValue),u=Ee(o.integerValue||o.doubleValue);return c<u?-1:c>u?1:c===u?0:isNaN(c)?isNaN(u)?0:-1:1})(n,e);case 3:return rh(n.timestampValue,e.timestampValue);case 4:return rh(Dr(n),Dr(e));case 5:return dc(n.stringValue,e.stringValue);case 6:return(function(i,o){const c=Mn(i),u=Mn(o);return c.compareTo(u)})(n.bytesValue,e.bytesValue);case 7:return(function(i,o){const c=i.split("/"),u=o.split("/");for(let l=0;l<c.length&&l<u.length;l++){const p=se(c[l],u[l]);if(p!==0)return p}return se(c.length,u.length)})(n.referenceValue,e.referenceValue);case 8:return(function(i,o){const c=se(Ee(i.latitude),Ee(o.latitude));return c!==0?c:se(Ee(i.longitude),Ee(o.longitude))})(n.geoPointValue,e.geoPointValue);case 9:return sh(n.arrayValue,e.arrayValue);case 10:return(function(i,o){const c=i.fields||{},u=o.fields||{},l=c[Ws]?.arrayValue,p=u[Ws]?.arrayValue,g=se(l?.values?.length||0,p?.values?.length||0);return g!==0?g:sh(l,p)})(n.mapValue,e.mapValue);case 11:return(function(i,o){if(i===Bi.mapValue&&o===Bi.mapValue)return 0;if(i===Bi.mapValue)return 1;if(o===Bi.mapValue)return-1;const c=i.fields||{},u=Object.keys(c),l=o.fields||{},p=Object.keys(l);u.sort(),p.sort();for(let g=0;g<u.length&&g<p.length;++g){const T=dc(u[g],p[g]);if(T!==0)return T;const b=ht(c[u[g]],l[p[g]]);if(b!==0)return b}return se(u.length,p.length)})(n.mapValue,e.mapValue);default:throw z(23264,{Pe:t})}}function rh(n,e){if(typeof n=="string"&&typeof e=="string"&&n.length===e.length)return se(n,e);const t=Ln(n),r=Ln(e),s=se(t.seconds,r.seconds);return s!==0?s:se(t.nanos,r.nanos)}function sh(n,e){const t=n.values||[],r=e.values||[];for(let s=0;s<t.length&&s<r.length;++s){const i=ht(t[s],r[s]);if(i!==void 0&&i!==0)return i}return se(t.length,r.length)}function xr(n){return pc(n)}function pc(n){return"nullValue"in n?"null":"booleanValue"in n?""+n.booleanValue:"integerValue"in n?""+n.integerValue:"doubleValue"in n?""+n.doubleValue:"timestampValue"in n?(function(t){const r=Ln(t);return`time(${r.seconds},${r.nanos})`})(n.timestampValue):"stringValue"in n?n.stringValue:"bytesValue"in n?(function(t){return Mn(t).toBase64()})(n.bytesValue):"referenceValue"in n?(function(t){return W.fromName(t).toString()})(n.referenceValue):"geoPointValue"in n?(function(t){return`geo(${t.latitude},${t.longitude})`})(n.geoPointValue):"arrayValue"in n?(function(t){let r="[",s=!0;for(const i of t.values||[])s?s=!1:r+=",",r+=pc(i);return r+"]"})(n.arrayValue):"mapValue"in n?(function(t){const r=Object.keys(t.fields||{}).sort();let s="{",i=!0;for(const o of r)i?i=!1:s+=",",s+=`${o}:${pc(t.fields[o])}`;return s+"}"})(n.mapValue):z(61005,{value:n})}function Xi(n){switch(Oe(n)){case 0:case 1:return 4;case 2:return 8;case 3:case 8:return 16;case 4:const e=li(n);return e?16+Xi(e):16;case 5:return 2*n.stringValue.length;case 6:return Mn(n.bytesValue).approximateByteSize();case 7:return n.referenceValue.length;case 9:return(function(r){return(r.values||[]).reduce(((s,i)=>s+Xi(i)),0)})(n.arrayValue);case 10:case 11:return(function(r){let s=0;return Gn(r.fields,((i,o)=>{s+=i.length+Xi(o)})),s})(n.mapValue);default:throw z(13486,{value:n})}}function ih(n,e){return{referenceValue:`projects/${n.projectId}/databases/${n.database}/documents/${e.path.canonicalString()}`}}function Ft(n){return!!n&&"integerValue"in n}function tr(n){return!!n&&"doubleValue"in n}function Fn(n){return Ft(n)||tr(n)}function Lr(n){return!!n&&"arrayValue"in n}function yt(n){return!!n&&"nullValue"in n}function ft(n){return!!n&&"doubleValue"in n&&isNaN(Number(n.doubleValue))}function rr(n){return!!n&&"mapValue"in n}function fo(n){return(n?.mapValue?.fields||{})[vf]?.stringValue===Rf}function mc(n){return(n?.mapValue?.fields||{})[Ws]?.arrayValue}function Ns(n){if(n.geoPointValue)return{geoPointValue:{...n.geoPointValue}};if(n.timestampValue&&typeof n.timestampValue=="object")return{timestampValue:{...n.timestampValue}};if(n.mapValue){const e={mapValue:{fields:{}}};return Gn(n.mapValue.fields,((t,r)=>e.mapValue.fields[t]=Ns(r))),e}if(n.arrayValue){const e={arrayValue:{values:[]}};for(let t=0;t<(n.arrayValue.values||[]).length;++t)e.arrayValue.values[t]=Ns(n.arrayValue.values[t]);return e}return{...n}}function Zm(n){return(((n.mapValue||{}).fields||{}).__type__||{}).stringValue===Jm}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ke{constructor(e){this.value=e}static empty(){return new Ke({mapValue:{}})}field(e){if(e.isEmpty())return this.value;{let t=this.value;for(let r=0;r<e.length-1;++r)if(t=(t.mapValue.fields||{})[e.get(r)],!rr(t))return null;return t=(t.mapValue.fields||{})[e.lastSegment()],t||null}}set(e,t){this.getFieldsMap(e.popLast())[e.lastSegment()]=Ns(t)}setAll(e){let t=De.emptyPath(),r={},s=[];e.forEach(((o,c)=>{if(!t.isImmediateParentOf(c)){const u=this.getFieldsMap(t);this.applyChanges(u,r,s),r={},s=[],t=c.popLast()}o?r[c.lastSegment()]=Ns(o):s.push(c.lastSegment())}));const i=this.getFieldsMap(t);this.applyChanges(i,r,s)}delete(e){const t=this.field(e.popLast());rr(t)&&t.mapValue.fields&&delete t.mapValue.fields[e.lastSegment()]}isEqual(e){return Rt(this.value,e.value)}getFieldsMap(e){let t=this.value;t.mapValue.fields||(t.mapValue={fields:{}});for(let r=0;r<e.length;++r){let s=t.mapValue.fields[e.get(r)];rr(s)&&s.mapValue.fields||(s={mapValue:{fields:{}}},t.mapValue.fields[e.get(r)]=s),t=s}return t.mapValue.fields}applyChanges(e,t,r){Gn(t,((s,i)=>e[s]=i));for(const s of r)delete e[s]}clone(){return new Ke(Ns(this.value))}}function Cf(n){const e=[];return Gn(n.fields,((t,r)=>{const s=new De([t]);if(rr(r)){const i=Cf(r.mapValue).fields;if(i.length===0)e.push(s);else for(const o of i)e.push(s.child(o))}else e.push(s)})),new _t(e)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function jo(n,e){if(n.useProto3Json){if(isNaN(e))return{doubleValue:"NaN"};if(e===1/0)return{doubleValue:"Infinity"};if(e===-1/0)return{doubleValue:"-Infinity"}}return{doubleValue:Hs(e)?"-0":e}}function Kc(n){return{integerValue:""+n}}function Yc(n,e,t){return Number.isInteger(e)&&t?.preferIntegers||Gm(e)?Kc(e):jo(n,e)}/**
 * @license
 * Copyright 2018 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Go{constructor(){this._=void 0}}function eg(n,e,t){return n instanceof Ks?(function(s,i){const o={fields:{[Tf]:{stringValue:If},[Af]:{timestampValue:{seconds:s.seconds,nanos:s.nanoseconds}}}};return i&&Ho(i)&&(i=li(i)),i&&(o.fields[wf]=i),{mapValue:o}})(t,e):n instanceof Mr?Sf(n,e):n instanceof Ys?bf(n,e):n instanceof Qs?(function(s,i){const o=Pf(s,i),c=go(o)+go(s.Re);return Ft(o)&&Ft(s.Re)?Kc(c):jo(s.serializer,c)})(n,e):n instanceof po?(function(s,i){return oh(s,i,Math.min)})(n,e):n instanceof mo?(function(s,i){return oh(s,i,Math.max)})(n,e):void 0}function tg(n,e,t){return n instanceof Mr?Sf(n,e):n instanceof Ys?bf(n,e):t}function Pf(n,e){return n instanceof Qs?Fn(e)?e:{integerValue:0}:null}class Ks extends Go{}class Mr extends Go{constructor(e){super(),this.elements=e}}function Sf(n,e){const t=Nf(e);for(const r of n.elements)t.some((s=>Rt(s,r)))||t.push(r);return{arrayValue:{values:t}}}class Ys extends Go{constructor(e){super(),this.elements=e}}function bf(n,e){let t=Nf(e);for(const r of n.elements)t=t.filter((s=>!Rt(s,r)));return{arrayValue:{values:t}}}class Qc extends Go{constructor(e,t){super(),this.serializer=e,this.Re=t}}class Qs extends Qc{}class po extends Qc{}class mo extends Qc{}function oh(n,e,t){if(!Fn(e))return n.Re;const r=t(go(e),go(n.Re));return Ft(e)&&Ft(n.Re)?Kc(r):jo(n.serializer,r)}function go(n){return Ee(n.integerValue||n.doubleValue)}function Nf(n){return Lr(n)&&n.arrayValue.values?n.arrayValue.values.slice():[]}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Of{constructor(e,t){this.field=e,this.transform=t}}function ng(n,e){return n.field.isEqual(e.field)&&(function(r,s){return r instanceof Mr&&s instanceof Mr||r instanceof Ys&&s instanceof Ys?kr(r.elements,s.elements,Rt):r instanceof Qs&&s instanceof Qs||r instanceof po&&s instanceof po||r instanceof mo&&s instanceof mo?Rt(r.Re,s.Re):r instanceof Ks&&s instanceof Ks})(n.transform,e.transform)}class rg{constructor(e,t){this.version=e,this.transformResults=t}}class rt{constructor(e,t){this.updateTime=e,this.exists=t}static none(){return new rt}static exists(e){return new rt(void 0,e)}static updateTime(e){return new rt(e)}get isNone(){return this.updateTime===void 0&&this.exists===void 0}isEqual(e){return this.exists===e.exists&&(this.updateTime?!!e.updateTime&&this.updateTime.isEqual(e.updateTime):!e.updateTime)}}function Ji(n,e){return n.updateTime!==void 0?e.isFoundDocument()&&e.version.isEqual(n.updateTime):n.exists===void 0||n.exists===e.isFoundDocument()}class Wo{}function kf(n,e){if(!n.hasLocalMutations||e&&e.fields.length===0)return null;if(e===null)return n.isNoDocument()?new zo(n.key,rt.none()):new hi(n.key,n.data,rt.none());{const t=n.data,r=Ke.empty();let s=new be(De.comparator);for(let i of e.fields)if(!s.has(i)){let o=t.field(i);o===null&&i.length>1&&(i=i.popLast(),o=t.field(i)),o===null?r.delete(i):r.set(i,o),s=s.add(i)}return new Wn(n.key,r,new _t(s.toArray()),rt.none())}}function sg(n,e,t){n instanceof hi?(function(s,i,o){const c=s.value.clone(),u=ch(s.fieldTransforms,i,o.transformResults);c.setAll(u),i.convertToFoundDocument(o.version,c).setHasCommittedMutations()})(n,e,t):n instanceof Wn?(function(s,i,o){if(!Ji(s.precondition,i))return void i.convertToUnknownDocument(o.version);const c=ch(s.fieldTransforms,i,o.transformResults),u=i.data;u.setAll(Df(s)),u.setAll(c),i.convertToFoundDocument(o.version,u).setHasCommittedMutations()})(n,e,t):(function(s,i,o){i.convertToNoDocument(o.version).setHasCommittedMutations()})(0,e,t)}function Os(n,e,t,r){return n instanceof hi?(function(i,o,c,u){if(!Ji(i.precondition,o))return c;const l=i.value.clone(),p=uh(i.fieldTransforms,u,o);return l.setAll(p),o.convertToFoundDocument(o.version,l).setHasLocalMutations(),null})(n,e,t,r):n instanceof Wn?(function(i,o,c,u){if(!Ji(i.precondition,o))return c;const l=uh(i.fieldTransforms,u,o),p=o.data;return p.setAll(Df(i)),p.setAll(l),o.convertToFoundDocument(o.version,p).setHasLocalMutations(),c===null?null:c.unionWith(i.fieldMask.fields).unionWith(i.fieldTransforms.map((g=>g.field)))})(n,e,t,r):(function(i,o,c){return Ji(i.precondition,o)?(o.convertToNoDocument(o.version).setHasLocalMutations(),null):c})(n,e,t)}function ig(n,e){let t=null;for(const r of n.fieldTransforms){const s=e.data.field(r.field),i=Pf(r.transform,s||null);i!=null&&(t===null&&(t=Ke.empty()),t.set(r.field,i))}return t||null}function ah(n,e){return n.type===e.type&&!!n.key.isEqual(e.key)&&!!n.precondition.isEqual(e.precondition)&&!!(function(r,s){return r===void 0&&s===void 0||!(!r||!s)&&kr(r,s,((i,o)=>ng(i,o)))})(n.fieldTransforms,e.fieldTransforms)&&(n.type===0?n.value.isEqual(e.value):n.type!==1||n.data.isEqual(e.data)&&n.fieldMask.isEqual(e.fieldMask))}class hi extends Wo{constructor(e,t,r,s=[]){super(),this.key=e,this.value=t,this.precondition=r,this.fieldTransforms=s,this.type=0}getFieldMask(){return null}}class Wn extends Wo{constructor(e,t,r,s,i=[]){super(),this.key=e,this.data=t,this.fieldMask=r,this.precondition=s,this.fieldTransforms=i,this.type=1}getFieldMask(){return this.fieldMask}}function Df(n){const e=new Map;return n.fieldMask.fields.forEach((t=>{if(!t.isEmpty()){const r=n.data.field(t);e.set(t,r)}})),e}function ch(n,e,t){const r=new Map;j(n.length===t.length,32656,{Ie:t.length,Ae:n.length});for(let s=0;s<t.length;s++){const i=n[s],o=i.transform,c=e.data.field(i.field);r.set(i.field,tg(o,c,t[s]))}return r}function uh(n,e,t){const r=new Map;for(const s of n){const i=s.transform,o=t.data.field(s.field);r.set(s.field,eg(i,o,e))}return r}class zo extends Wo{constructor(e,t){super(),this.key=e,this.precondition=t,this.type=2,this.fieldTransforms=[]}getFieldMask(){return null}}class og extends Wo{constructor(e,t){super(),this.key=e,this.precondition=t,this.type=3,this.fieldTransforms=[]}getFieldMask(){return null}}/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ag{constructor(e,t,r){this.alias=e,this.aggregateType=t,this.fieldPath=r}}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class _o{constructor(e,t){this.position=e,this.inclusive=t}}function lh(n,e,t){let r=0;for(let s=0;s<n.position.length;s++){const i=e[s],o=n.position[s];if(i.field.isKeyField()?r=W.comparator(W.fromName(o.referenceValue),t.key):r=ht(o,t.data.field(i.field)),i.dir==="desc"&&(r*=-1),r!==0)break}return r}function hh(n,e){if(n===null)return e===null;if(e===null||n.inclusive!==e.inclusive||n.position.length!==e.position.length)return!1;for(let t=0;t<n.position.length;t++)if(!Rt(n.position[t],e.position[t]))return!1;return!0}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Vf{}class Pe extends Vf{constructor(e,t,r){super(),this.field=e,this.op=t,this.value=r}static create(e,t,r){return e.isKeyField()?t==="in"||t==="not-in"?this.createKeyFieldInFilter(e,t,r):new ug(e,t,r):t==="array-contains"?new fg(e,r):t==="in"?new dg(e,r):t==="not-in"?new pg(e,r):t==="array-contains-any"?new mg(e,r):new Pe(e,t,r)}static createKeyFieldInFilter(e,t,r){return t==="in"?new lg(e,r):new hg(e,r)}matches(e){const t=e.data.field(this.field);return this.op==="!="?t!==null&&t.nullValue===void 0&&this.matchesComparison(ht(t,this.value)):t!==null&&Oe(this.value)===Oe(t)&&this.matchesComparison(ht(t,this.value))}matchesComparison(e){switch(this.op){case"<":return e<0;case"<=":return e<=0;case"==":return e===0;case"!=":return e!==0;case">":return e>0;case">=":return e>=0;default:return z(47266,{operator:this.op})}}isInequality(){return["<","<=",">",">=","!=","not-in"].indexOf(this.op)>=0}getFlattenedFilters(){return[this]}getFilters(){return[this]}}class kt extends Vf{constructor(e,t){super(),this.filters=e,this.op=t,this.Ve=null}static create(e,t){return new kt(e,t)}matches(e){return xf(this)?this.filters.find((t=>!t.matches(e)))===void 0:this.filters.find((t=>t.matches(e)))!==void 0}getFlattenedFilters(){return this.Ve!==null||(this.Ve=this.filters.reduce(((e,t)=>e.concat(t.getFlattenedFilters())),[])),this.Ve}getFilters(){return Object.assign([],this.filters)}}function xf(n){return n.op==="and"}function Lf(n){return cg(n)&&xf(n)}function cg(n){for(const e of n.filters)if(e instanceof kt)return!1;return!0}function gc(n){if(n instanceof Pe)return n.field.canonicalString()+n.op.toString()+xr(n.value);if(Lf(n))return n.filters.map((e=>gc(e))).join(",");{const e=n.filters.map((t=>gc(t))).join(",");return`${n.op}(${e})`}}function Mf(n,e){return n instanceof Pe?(function(r,s){return s instanceof Pe&&r.op===s.op&&r.field.isEqual(s.field)&&Rt(r.value,s.value)})(n,e):n instanceof kt?(function(r,s){return s instanceof kt&&r.op===s.op&&r.filters.length===s.filters.length?r.filters.reduce(((i,o,c)=>i&&Mf(o,s.filters[c])),!0):!1})(n,e):void z(19439)}function Ff(n){return n instanceof Pe?(function(t){return`${t.field.canonicalString()} ${t.op} ${xr(t.value)}`})(n):n instanceof kt?(function(t){return t.op.toString()+" {"+t.getFilters().map(Ff).join(" ,")+"}"})(n):"Filter"}class ug extends Pe{constructor(e,t,r){super(e,t,r),this.key=W.fromName(r.referenceValue)}matches(e){const t=W.comparator(e.key,this.key);return this.matchesComparison(t)}}class lg extends Pe{constructor(e,t){super(e,"in",t),this.keys=Uf("in",t)}matches(e){return this.keys.some((t=>t.isEqual(e.key)))}}class hg extends Pe{constructor(e,t){super(e,"not-in",t),this.keys=Uf("not-in",t)}matches(e){return!this.keys.some((t=>t.isEqual(e.key)))}}function Uf(n,e){return(e.arrayValue?.values||[]).map((t=>W.fromName(t.referenceValue)))}class fg extends Pe{constructor(e,t){super(e,"array-contains",t)}matches(e){const t=e.data.field(this.field);return Lr(t)&&zs(t.arrayValue,this.value)}}class dg extends Pe{constructor(e,t){super(e,"in",t)}matches(e){const t=e.data.field(this.field);return t!==null&&zs(this.value.arrayValue,t)}}class pg extends Pe{constructor(e,t){super(e,"not-in",t)}matches(e){if(zs(this.value.arrayValue,{nullValue:"NULL_VALUE"}))return!1;const t=e.data.field(this.field);return t!==null&&t.nullValue===void 0&&!zs(this.value.arrayValue,t)}}class mg extends Pe{constructor(e,t){super(e,"array-contains-any",t)}matches(e){const t=e.data.field(this.field);return!(!Lr(t)||!t.arrayValue.values)&&t.arrayValue.values.some((r=>zs(this.value.arrayValue,r)))}}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Xs{constructor(e,t="asc"){this.field=e,this.dir=t}}function gg(n,e){return n.dir===e.dir&&n.field.isEqual(e.field)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class We{constructor(e,t,r,s,i,o,c){this.key=e,this.documentType=t,this.version=r,this.readTime=s,this.createTime=i,this.data=o,this.documentState=c}static newInvalidDocument(e){return new We(e,0,J.min(),J.min(),J.min(),Ke.empty(),0)}static newFoundDocument(e,t,r,s){return new We(e,1,t,J.min(),r,s,0)}static newNoDocument(e,t){return new We(e,2,t,J.min(),J.min(),Ke.empty(),0)}static newUnknownDocument(e,t){return new We(e,3,t,J.min(),J.min(),Ke.empty(),2)}convertToFoundDocument(e,t){return!this.createTime.isEqual(J.min())||this.documentType!==2&&this.documentType!==0||(this.createTime=e),this.version=e,this.documentType=1,this.data=t,this.documentState=0,this}convertToNoDocument(e){return this.version=e,this.documentType=2,this.data=Ke.empty(),this.documentState=0,this}convertToUnknownDocument(e){return this.version=e,this.documentType=3,this.data=Ke.empty(),this.documentState=2,this}setHasCommittedMutations(){return this.documentState=2,this}setHasLocalMutations(){return this.documentState=1,this.version=J.min(),this}setReadTime(e){return this.readTime=e,this}get hasLocalMutations(){return this.documentState===1}get hasCommittedMutations(){return this.documentState===2}get hasPendingWrites(){return this.hasLocalMutations||this.hasCommittedMutations}isValidDocument(){return this.documentType!==0}isFoundDocument(){return this.documentType===1}isNoDocument(){return this.documentType===2}isUnknownDocument(){return this.documentType===3}isEqual(e){return e instanceof We&&this.key.isEqual(e.key)&&this.version.isEqual(e.version)&&this.documentType===e.documentType&&this.documentState===e.documentState&&this.data.isEqual(e.data)}mutableCopy(){return new We(this.key,this.documentType,this.version,this.readTime,this.createTime,this.data.clone(),this.documentState)}toString(){return`Document(${this.key}, ${this.version}, ${JSON.stringify(this.data.value)}, {createTime: ${this.createTime}}), {documentType: ${this.documentType}}), {documentState: ${this.documentState}})`}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class _g{constructor(e,t=null,r=[],s=[],i=null,o=null,c=null){this.path=e,this.collectionGroup=t,this.orderBy=r,this.filters=s,this.limit=i,this.startAt=o,this.endAt=c,this.de=null}}function fh(n,e=null,t=[],r=[],s=null,i=null,o=null){return new _g(n,e,t,r,s,i,o)}function Bf(n){const e=Z(n);if(e.de===null){let t=e.path.canonicalString();e.collectionGroup!==null&&(t+="|cg:"+e.collectionGroup),t+="|f:",t+=e.filters.map((r=>gc(r))).join(","),t+="|ob:",t+=e.orderBy.map((r=>(function(i){return i.field.canonicalString()+i.dir})(r))).join(","),qo(e.limit)||(t+="|l:",t+=e.limit),e.startAt&&(t+="|lb:",t+=e.startAt.inclusive?"b:":"a:",t+=e.startAt.position.map((r=>xr(r))).join(",")),e.endAt&&(t+="|ub:",t+=e.endAt.inclusive?"a:":"b:",t+=e.endAt.position.map((r=>xr(r))).join(",")),e.de=t}return e.de}function $f(n,e){if(n.limit!==e.limit||n.orderBy.length!==e.orderBy.length)return!1;for(let t=0;t<n.orderBy.length;t++)if(!gg(n.orderBy[t],e.orderBy[t]))return!1;if(n.filters.length!==e.filters.length)return!1;for(let t=0;t<n.filters.length;t++)if(!Mf(n.filters[t],e.filters[t]))return!1;return n.collectionGroup===e.collectionGroup&&!!n.path.isEqual(e.path)&&!!hh(n.startAt,e.startAt)&&hh(n.endAt,e.endAt)}function er(n){return!!n.isCorePipeline}function qf(n){return!!n.path&&W.isDocumentKey(n.path)&&n.collectionGroup===null&&n.filters.length===0}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Gr{constructor(e,t=null,r=[],s=[],i=null,o="F",c=null,u=null){this.path=e,this.collectionGroup=t,this.explicitOrderBy=r,this.filters=s,this.limit=i,this.limitType=o,this.startAt=c,this.endAt=u,this.fe=null,this.me=null,this.pe=null,this.startAt,this.endAt}}function yg(n,e,t,r,s,i,o,c){return new Gr(n,e,t,r,s,i,o,c)}function Ko(n){return new Gr(n)}function dh(n){return n.filters.length===0&&n.limit===null&&n.startAt==null&&n.endAt==null&&(n.explicitOrderBy.length===0||n.explicitOrderBy.length===1&&n.explicitOrderBy[0].field.isKeyField())}function Eg(n){return W.isDocumentKey(n.path)&&n.collectionGroup===null&&n.filters.length===0}function Hf(n){return n.collectionGroup!==null}function ks(n){const e=Z(n);if(e.fe===null){e.fe=[];const t=new Set;for(const i of e.explicitOrderBy)e.fe.push(i),t.add(i.field.canonicalString());const r=e.explicitOrderBy.length>0?e.explicitOrderBy[e.explicitOrderBy.length-1].dir:"asc";(function(o){let c=new be(De.comparator);return o.filters.forEach((u=>{u.getFlattenedFilters().forEach((l=>{l.isInequality()&&(c=c.add(l.field))}))})),c})(e).forEach((i=>{t.has(i.canonicalString())||i.isKeyField()||e.fe.push(new Xs(i,r))})),t.has(De.keyField().canonicalString())||e.fe.push(new Xs(De.keyField(),r))}return e.fe}function $t(n){const e=Z(n);return e.me||(e.me=jf(e,ks(n))),e.me}function Ig(n){const e=Z(n);return e.pe||(e.pe=jf(e,n.explicitOrderBy)),e.pe}function jf(n,e){if(n.limitType==="F")return fh(n.path,n.collectionGroup,e,n.filters,n.limit,n.startAt,n.endAt);{e=e.map((s=>{const i=s.dir==="desc"?"asc":"desc";return new Xs(s.field,i)}));const t=n.endAt?new _o(n.endAt.position,n.endAt.inclusive):null,r=n.startAt?new _o(n.startAt.position,n.startAt.inclusive):null;return fh(n.path,n.collectionGroup,e,n.filters,n.limit,t,r)}}function _c(n,e){const t=n.filters.concat([e]);return new Gr(n.path,n.collectionGroup,n.explicitOrderBy.slice(),t,n.limit,n.limitType,n.startAt,n.endAt)}function Tg(n,e){const t=n.explicitOrderBy.concat([e]);return new Gr(n.path,n.collectionGroup,t,n.filters.slice(),n.limit,n.limitType,n.startAt,n.endAt)}function yo(n,e,t){return new Gr(n.path,n.collectionGroup,n.explicitOrderBy.slice(),n.filters.slice(),e,t,n.startAt,n.endAt)}function wg(n,e){return $f($t(n),$t(e))&&n.limitType===e.limitType}function Ds(n){return`Query(target=${(function(t){let r=t.path.canonicalString();return t.collectionGroup!==null&&(r+=" collectionGroup="+t.collectionGroup),t.filters.length>0&&(r+=`, filters: [${t.filters.map((s=>Ff(s))).join(", ")}]`),qo(t.limit)||(r+=", limit: "+t.limit),t.orderBy.length>0&&(r+=`, orderBy: [${t.orderBy.map((s=>(function(o){return`${o.field.canonicalString()} (${o.dir})`})(s))).join(", ")}]`),t.startAt&&(r+=", startAt: ",r+=t.startAt.inclusive?"b:":"a:",r+=t.startAt.position.map((s=>xr(s))).join(",")),t.endAt&&(r+=", endAt: ",r+=t.endAt.inclusive?"a:":"b:",r+=t.endAt.position.map((s=>xr(s))).join(",")),`Target(${r})`})($t(n))}; limitType=${n.limitType})`}function Yo(n,e){return e.isFoundDocument()&&(function(r,s){const i=s.key.path;return r.collectionGroup!==null?s.key.hasCollectionId(r.collectionGroup)&&r.path.isPrefixOf(i):W.isDocumentKey(r.path)?r.path.isEqual(i):r.path.isImmediateParentOf(i)})(n,e)&&(function(r,s){for(const i of ks(r))if(!i.field.isKeyField()&&s.data.field(i.field)===null)return!1;return!0})(n,e)&&(function(r,s){for(const i of r.filters)if(!i.matches(s))return!1;return!0})(n,e)&&(function(r,s){return!(r.startAt&&!(function(o,c,u){const l=lh(o,c,u);return o.inclusive?l<=0:l<0})(r.startAt,ks(r),s)||r.endAt&&!(function(o,c,u){const l=lh(o,c,u);return o.inclusive?l>=0:l>0})(r.endAt,ks(r),s))})(n,e)}function Xc(n){return(e,t)=>{let r=!1;for(const s of ks(n)){const i=Ag(s,e,t);if(i!==0)return i;r=r||s.field.isKeyField()}return 0}}function Ag(n,e,t){const r=n.field.isKeyField()?W.comparator(e.key,t.key):(function(i,o,c){const u=o.data.field(i),l=c.data.field(i);return u!==null&&l!==null?ht(u,l):z(42886)})(n.field,e,t);switch(n.dir){case"asc":return r;case"desc":return-1*r;default:return z(19790,{direction:n.dir})}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class vg{constructor(e,t){this.count=e,this.unchangedNames=t}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */var Re,oe;function Rg(n){switch(n){case V.OK:return z(64938);case V.CANCELLED:case V.UNKNOWN:case V.DEADLINE_EXCEEDED:case V.RESOURCE_EXHAUSTED:case V.INTERNAL:case V.UNAVAILABLE:case V.UNAUTHENTICATED:return!1;case V.INVALID_ARGUMENT:case V.NOT_FOUND:case V.ALREADY_EXISTS:case V.PERMISSION_DENIED:case V.FAILED_PRECONDITION:case V.ABORTED:case V.OUT_OF_RANGE:case V.UNIMPLEMENTED:case V.DATA_LOSS:return!0;default:return z(15467,{code:n})}}function Gf(n){if(n===void 0)return on("GRPC error has no .code"),V.UNKNOWN;switch(n){case Re.OK:return V.OK;case Re.CANCELLED:return V.CANCELLED;case Re.UNKNOWN:return V.UNKNOWN;case Re.DEADLINE_EXCEEDED:return V.DEADLINE_EXCEEDED;case Re.RESOURCE_EXHAUSTED:return V.RESOURCE_EXHAUSTED;case Re.INTERNAL:return V.INTERNAL;case Re.UNAVAILABLE:return V.UNAVAILABLE;case Re.UNAUTHENTICATED:return V.UNAUTHENTICATED;case Re.INVALID_ARGUMENT:return V.INVALID_ARGUMENT;case Re.NOT_FOUND:return V.NOT_FOUND;case Re.ALREADY_EXISTS:return V.ALREADY_EXISTS;case Re.PERMISSION_DENIED:return V.PERMISSION_DENIED;case Re.FAILED_PRECONDITION:return V.FAILED_PRECONDITION;case Re.ABORTED:return V.ABORTED;case Re.OUT_OF_RANGE:return V.OUT_OF_RANGE;case Re.UNIMPLEMENTED:return V.UNIMPLEMENTED;case Re.DATA_LOSS:return V.DATA_LOSS;default:return z(39323,{code:n})}}(oe=Re||(Re={}))[oe.OK=0]="OK",oe[oe.CANCELLED=1]="CANCELLED",oe[oe.UNKNOWN=2]="UNKNOWN",oe[oe.INVALID_ARGUMENT=3]="INVALID_ARGUMENT",oe[oe.DEADLINE_EXCEEDED=4]="DEADLINE_EXCEEDED",oe[oe.NOT_FOUND=5]="NOT_FOUND",oe[oe.ALREADY_EXISTS=6]="ALREADY_EXISTS",oe[oe.PERMISSION_DENIED=7]="PERMISSION_DENIED",oe[oe.UNAUTHENTICATED=16]="UNAUTHENTICATED",oe[oe.RESOURCE_EXHAUSTED=8]="RESOURCE_EXHAUSTED",oe[oe.FAILED_PRECONDITION=9]="FAILED_PRECONDITION",oe[oe.ABORTED=10]="ABORTED",oe[oe.OUT_OF_RANGE=11]="OUT_OF_RANGE",oe[oe.UNIMPLEMENTED=12]="UNIMPLEMENTED",oe[oe.INTERNAL=13]="INTERNAL",oe[oe.UNAVAILABLE=14]="UNAVAILABLE",oe[oe.DATA_LOSS=15]="DATA_LOSS";/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class pr{constructor(e,t){this.mapKeyFn=e,this.equalsFn=t,this.inner={},this.innerSize=0}get(e){const t=this.mapKeyFn(e),r=this.inner[t];if(r!==void 0){for(const[s,i]of r)if(this.equalsFn(s,e))return i}}has(e){return this.get(e)!==void 0}set(e,t){const r=this.mapKeyFn(e),s=this.inner[r];if(s===void 0)return this.inner[r]=[[e,t]],void this.innerSize++;for(let i=0;i<s.length;i++)if(this.equalsFn(s[i][0],e))return void(s[i]=[e,t]);s.push([e,t]),this.innerSize++}delete(e){const t=this.mapKeyFn(e),r=this.inner[t];if(r===void 0)return!1;for(let s=0;s<r.length;s++)if(this.equalsFn(r[s][0],e))return r.length===1?delete this.inner[t]:r.splice(s,1),this.innerSize--,!0;return!1}forEach(e){Gn(this.inner,((t,r)=>{for(const[s,i]of r)e(s,i)}))}isEmpty(){return yf(this.inner)}size(){return this.innerSize}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Cg=new _e(W.comparator);function at(){return Cg}const Wf=new _e(W.comparator);function Tr(...n){let e=Wf;for(const t of n)e=e.insert(t.key,t);return e}function zf(n){let e=Wf;return n.forEach(((t,r)=>e=e.insert(t,r.overlayedDocument))),e}function vn(){return Vs()}function Kf(){return Vs()}function Vs(){return new pr((n=>n.toString()),((n,e)=>n.isEqual(e)))}const Pg=new _e(W.comparator),Sg=new be(W.comparator);function re(...n){let e=Sg;for(const t of n)e=e.add(t);return e}const bg=new be(se);function Ng(){return bg}/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Og(){return new TextEncoder}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const kg=new bn([4294967295,4294967295],0);function ph(n){const e=Og().encode(n),t=new of;return t.update(e),new Uint8Array(t.digest())}function mh(n){const e=new DataView(n.buffer),t=e.getUint32(0,!0),r=e.getUint32(4,!0),s=e.getUint32(8,!0),i=e.getUint32(12,!0);return[new bn([t,r],0),new bn([s,i],0)]}class Jc{constructor(e,t,r){if(this.bitmap=e,this.padding=t,this.hashCount=r,t<0||t>=8)throw new Ts(`Invalid padding: ${t}`);if(r<0)throw new Ts(`Invalid hash count: ${r}`);if(e.length>0&&this.hashCount===0)throw new Ts(`Invalid hash count: ${r}`);if(e.length===0&&t!==0)throw new Ts(`Invalid padding when bitmap length is 0: ${t}`);this.ge=8*e.length-t,this.ye=bn.fromNumber(this.ge)}we(e,t,r){let s=e.add(t.multiply(bn.fromNumber(r)));return s.compare(kg)===1&&(s=new bn([s.getBits(0),s.getBits(1)],0)),s.modulo(this.ye).toNumber()}be(e){return!!(this.bitmap[Math.floor(e/8)]&1<<e%8)}mightContain(e){if(this.ge===0)return!1;const t=ph(e),[r,s]=mh(t);for(let i=0;i<this.hashCount;i++){const o=this.we(r,s,i);if(!this.be(o))return!1}return!0}static create(e,t,r){const s=e%8==0?0:8-e%8,i=new Uint8Array(Math.ceil(e/8)),o=new Jc(i,s,t);return r.forEach((c=>o.insert(c))),o}insert(e){if(this.ge===0)return;const t=ph(e),[r,s]=mh(t);for(let i=0;i<this.hashCount;i++){const o=this.we(r,s,i);this.ve(o)}}ve(e){const t=Math.floor(e/8),r=e%8;this.bitmap[t]|=1<<r}}class Ts extends Error{constructor(){super(...arguments),this.name="BloomFilterError"}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class fi{constructor(e,t,r,s,i,o){this.snapshotVersion=e,this.targetChanges=t,this.targetMismatches=r,this.documentUpdates=s,this.augmentedDocumentUpdates=i,this.resolvedLimboDocuments=o}static createSynthesizedRemoteEventForCurrentChange(e,t,r){const s=new Map;return s.set(e,di.createSynthesizedTargetChangeForCurrentChange(e,t,r)),new fi(J.min(),s,new _e(se),at(),at(),re())}}class di{constructor(e,t,r,s,i){this.resumeToken=e,this.current=t,this.addedDocuments=r,this.modifiedDocuments=s,this.removedDocuments=i}static createSynthesizedTargetChangeForCurrentChange(e,t,r){return new di(r,t,re(),re(),re())}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Zi{constructor(e,t,r,s){this.Se=e,this.removedTargetIds=t,this.key=r,this.De=s}}class Yf{constructor(e,t){this.targetId=e,this.xe=t}}class Qf{constructor(e,t,r=Ne.EMPTY_BYTE_STRING,s=null){this.state=e,this.targetIds=t,this.resumeToken=r,this.cause=s}}class gh{constructor(e){this.targetId=e,this.Ce=0,this.Fe=_h(),this.Oe=Ne.EMPTY_BYTE_STRING,this.Me=!1,this.Ne=!0}get current(){return this.Me}get resumeToken(){return this.Oe}get Le(){return this.Ce!==0}get Be(){return this.Ne}Ue(e){e.approximateByteSize()>0&&(this.Ne=!0,this.Oe=e)}ke(){let e=re(),t=re(),r=re();return this.Fe.forEach(((s,i)=>{switch(i){case 0:e=e.add(s);break;case 2:t=t.add(s);break;case 1:r=r.add(s);break;default:z(38017,{changeType:i})}})),new di(this.Oe,this.Me,e,t,r)}qe(){this.Ne=!1,this.Fe=_h()}$e(e,t){this.Ne=!0,this.Fe=this.Fe.insert(e,t)}Ke(e){this.Ne=!0,this.Fe=this.Fe.remove(e)}We(){this.Ce+=1}Qe(){this.Ce-=1,j(this.Ce>=0,3241,{Ce:this.Ce,targetId:this.targetId})}Ge(){this.Ne=!0,this.Me=!0}}const ms="WatchChangeAggregator";class Dg{constructor(e){this.ze=e,this.je=new Map,this.He=at(),this.Je=$i(),this.Ye=at(),this.Ze=$i(),this.Xe=new _e(se)}et(e){for(const t of e.Se)e.De&&e.De.isFoundDocument()?this.tt(t,e.De):this.nt(t,e.key,e.De);for(const t of e.removedTargetIds)this.nt(t,e.key,e.De)}rt(e){this.forEachTarget(e,(t=>{const r=this.je.get(t);if(r)switch(e.state){case 0:this.it(t)&&r.Ue(e.resumeToken);break;case 1:r.Qe(),r.Le||r.qe(),r.Ue(e.resumeToken);break;case 2:r.Qe(),r.Le||this.removeTarget(t);break;case 3:this.it(t)&&(r.Ge(),r.Ue(e.resumeToken));break;case 4:this.it(t)&&(this.st(t),r.Ue(e.resumeToken));break;default:z(56790,{state:e.state})}else $(ms,`handleTargetChange received targetChange for untracked target ID (${t}) with state (${e.state})`)}))}forEachTarget(e,t){e.targetIds.length>0?e.targetIds.forEach(t):this.je.forEach(((r,s)=>{this.it(s)&&t(s)}))}_t(e){return er(e)?e.getPipelineSourceType()==="documents"&&e.getPipelineDocuments()?.length===1:qf(e)}ot(e){const t=e.targetId,r=e.xe.count,s=this.ut(t);if(s){const i=s.target;if(this._t(i))if(r===0){const o=new W(er(i)?ue.fromString(i.getPipelineDocuments()[0]):i.path);this.nt(t,o,We.newNoDocument(o,J.min()))}else j(r===1,20013,"Single document existence filter with count: "+r);else{const o=this.ct(t);if(o!==r){const c=this.lt(e),u=c?this.Et(c,e,o):1;if(u!==0){this.st(t);const l=u===2?"TargetPurposeExistenceFilterMismatchBloom":"TargetPurposeExistenceFilterMismatch";this.Xe=this.Xe.insert(t,l)}}}}}lt(e){const t=e.xe.unchangedNames;if(!t||!t.bits)return null;const{bits:{bitmap:r="",padding:s=0},hashCount:i=0}=t;let o,c;try{o=Mn(r).toUint8Array()}catch(u){if(u instanceof Ef)return Ot("Decoding the base64 bloom filter in existence filter failed ("+u.message+"); ignoring the bloom filter and falling back to full re-query."),null;throw u}try{c=new Jc(o,s,i)}catch(u){return Ot(u instanceof Ts?"BloomFilter error: ":"Applying bloom filter failed: ",u),null}return c.ge===0?null:c}Et(e,t,r){return t.xe.count===r-this.Pt(e,t.targetId)?0:2}Pt(e,t){const r=this.ze.getRemoteKeysForTarget(t);let s=0;return r.forEach((i=>{const o=this.ze.Tt(),c=`projects/${o.projectId}/databases/${o.database}/documents/${i.path.canonicalString()}`;e.mightContain(c)||(this.nt(t,i,null),s++)})),s}Rt(e){const t=new Map;this.je.forEach(((i,o)=>{const c=this.ut(o);if(c){if(i.current&&this._t(c.target)){const u=er(c.target)?ue.fromString(c.target.getPipelineDocuments()[0]):c.target.path,l=new W(u);this.It(l).has(o)||this.At(o,l)||this.nt(o,l,We.newNoDocument(l,e))}i.Be&&(t.set(o,i.ke()),i.qe())}}));let r=re();this.Ze.forEach(((i,o)=>{let c=!0;o.forEachWhile((u=>{const l=this.ut(u);return!l||l.purpose==="TargetPurposeLimboResolution"||(c=!1,!1)})),c&&(r=r.add(i))})),this.He.forEach(((i,o)=>o.setReadTime(e))),this.Ye.forEach(((i,o)=>o.setReadTime(e)));const s=new fi(e,t,this.Xe,this.He,this.Ye,r);return this.He=at(),this.Je=$i(),this.Ye=at(),this.Ze=$i(),this.Xe=new _e(se),s}tt(e,t){const r=this.je.get(e);if(!r||!this.it(e))return void $(ms,`addDocumentToTarget received document for unknown inactive target (${e})`);const s=this.At(e,t.key)?2:0;r.$e(t.key,s),er(this.ut(e).target)&&this.ut(e).target.getPipelineFlavor()!=="exact"?this.Ye=this.Ye.insert(t.key,t):this.He=this.He.insert(t.key,t),this.Je=this.Je.insert(t.key,this.It(t.key).add(e)),this.Ze=this.Ze.insert(t.key,this.Vt(t.key).add(e))}nt(e,t,r){const s=this.je.get(e);s&&this.it(e)?(this.At(e,t)?s.$e(t,1):s.Ke(t),this.Ze=this.Ze.insert(t,this.Vt(t).delete(e)),this.Ze=this.Ze.insert(t,this.Vt(t).add(e)),r&&(er(this.ut(e).target)&&this.ut(e).target.getPipelineFlavor()!=="exact"?this.Ye=this.Ye.insert(t,r):this.He=this.He.insert(t,r))):$(ms,`removeDocumentFromTarget received document for unknown or inactive target (${e})`)}removeTarget(e){this.je.delete(e)}ct(e){const t=this.je.get(e);if(!t)return 0;const r=t.ke();return this.ze.getRemoteKeysForTarget(e).size+r.addedDocuments.size-r.removedDocuments.size}We(e){let t=this.je.get(e);t||($(ms,`recordPendingTargetRequest set up tracking for target ID ${e}`),t=new gh(e),this.je.set(e,t)),t.We()}Vt(e){let t=this.Ze.get(e);return t||(t=new be(se),this.Ze=this.Ze.insert(e,t)),t}It(e){let t=this.Je.get(e);return t||(t=new be(se),this.Je=this.Je.insert(e,t)),t}it(e){const t=this.ut(e)!==null;return t||$(ms,"Detected inactive target",e),t}ut(e){const t=this.je.get(e);return t===void 0||t.Le?null:this.ze.dt(e)}st(e){this.je.set(e,new gh(e)),this.ze.getRemoteKeysForTarget(e).forEach((t=>{this.nt(e,t,null)}))}At(e,t){return this.ze.getRemoteKeysForTarget(e).has(t)}}function $i(){return new _e(W.comparator)}function _h(){return new _e(W.comparator)}const Vg={asc:"ASCENDING",desc:"DESCENDING"},xg={"<":"LESS_THAN","<=":"LESS_THAN_OR_EQUAL",">":"GREATER_THAN",">=":"GREATER_THAN_OR_EQUAL","==":"EQUAL","!=":"NOT_EQUAL","array-contains":"ARRAY_CONTAINS",in:"IN","not-in":"NOT_IN","array-contains-any":"ARRAY_CONTAINS_ANY"},Lg={and:"AND",or:"OR"};class Mg{constructor(e,t){this.databaseId=e,this.useProto3Json=t}}function yc(n,e){return n.useProto3Json||qo(e)?e:{value:e}}function Eo(n,e){return n.useProto3Json?`${new Date(1e3*e.seconds).toISOString().replace(/\.\d*/,"").replace("Z","")}.${("000000000"+e.nanoseconds).slice(-9)}Z`:{seconds:""+e.seconds,nanos:e.nanoseconds}}function Zc(n){const e=Ln(n);return new ge(e.seconds,e.nanos)}function Xf(n,e){return n.useProto3Json?e.toBase64():e.toUint8Array()}function eo(n,e){return Eo(n,e.toTimestamp())}function qt(n){return j(!!n,49232),J.fromTimestamp(Zc(n))}function e1(n,e){return Ec(n,e).canonicalString()}function Ec(n,e){const t=(function(s){return new ue(["projects",s.projectId,"databases",s.database])})(n).child("documents");return e===void 0?t:t.child(e)}function Jf(n){const e=ue.fromString(n);return j(sd(e),10190,{key:e.toString()}),e}function Io(n,e){return e1(n.databaseId,e.path)}function za(n,e){const t=Jf(e);if(t.get(1)!==n.databaseId.projectId)throw new U(V.INVALID_ARGUMENT,"Tried to deserialize key from different project: "+t.get(1)+" vs "+n.databaseId.projectId);if(t.get(3)!==n.databaseId.database)throw new U(V.INVALID_ARGUMENT,"Tried to deserialize key from different database: "+t.get(3)+" vs "+n.databaseId.database);return new W(ed(t))}function Zf(n,e){return e1(n.databaseId,e)}function Fg(n){const e=Jf(n);return e.length===4?ue.emptyPath():ed(e)}function Ic(n){return new ue(["projects",n.databaseId.projectId,"databases",n.databaseId.database]).canonicalString()}function ed(n){return j(n.length>4&&n.get(4)==="documents",29091,{key:n.toString()}),n.popFirst(5)}function yh(n,e,t){return{name:Io(n,e),fields:t.value.mapValue.fields}}function Ug(n,e){let t;if("targetChange"in e){e.targetChange;const r=(function(l){return l==="NO_CHANGE"?0:l==="ADD"?1:l==="REMOVE"?2:l==="CURRENT"?3:l==="RESET"?4:z(39313,{state:l})})(e.targetChange.targetChangeType||"NO_CHANGE"),s=e.targetChange.targetIds||[],i=(function(l,p){return l.useProto3Json?(j(p===void 0||typeof p=="string",58123),Ne.fromBase64String(p||"")):(j(p===void 0||p instanceof Buffer||p instanceof Uint8Array,16193),Ne.fromUint8Array(p||new Uint8Array))})(n,e.targetChange.resumeToken),o=e.targetChange.cause,c=o&&(function(l){const p=l.code===void 0?V.UNKNOWN:Gf(l.code);return new U(p,l.message||"")})(o);t=new Qf(r,s,i,c||null)}else if("documentChange"in e){e.documentChange;const r=e.documentChange;r.document,r.document.name,r.document.updateTime;const s=za(n,r.document.name),i=qt(r.document.updateTime),o=r.document.createTime?qt(r.document.createTime):J.min(),c=new Ke({mapValue:{fields:r.document.fields}}),u=We.newFoundDocument(s,i,o,c),l=r.targetIds||[],p=r.removedTargetIds||[];t=new Zi(l,p,u.key,u)}else if("documentDelete"in e){e.documentDelete;const r=e.documentDelete;r.document;const s=za(n,r.document),i=r.readTime?qt(r.readTime):J.min(),o=We.newNoDocument(s,i),c=r.removedTargetIds||[];t=new Zi([],c,o.key,o)}else if("documentRemove"in e){e.documentRemove;const r=e.documentRemove;r.document;const s=za(n,r.document),i=r.removedTargetIds||[];t=new Zi([],i,s,null)}else{if(!("filter"in e))return z(11601,{ft:e});{e.filter;const r=e.filter;r.targetId;const{count:s=0,unchangedNames:i}=r,o=new vg(s,i),c=r.targetId;t=new Yf(c,o)}}return t}function Bg(n,e){let t;if(e instanceof hi)t={update:yh(n,e.key,e.value)};else if(e instanceof zo)t={delete:Io(n,e.key)};else if(e instanceof Wn)t={update:yh(n,e.key,e.data),updateMask:Qg(e.fieldMask)};else{if(!(e instanceof og))return z(16599,{gt:e.type});t={verify:Io(n,e.key)}}return e.fieldTransforms.length>0&&(t.updateTransforms=e.fieldTransforms.map((r=>(function(i,o){const c=o.transform;if(c instanceof Ks)return{fieldPath:o.field.canonicalString(),setToServerValue:"REQUEST_TIME"};if(c instanceof Mr)return{fieldPath:o.field.canonicalString(),appendMissingElements:{values:c.elements}};if(c instanceof Ys)return{fieldPath:o.field.canonicalString(),removeAllFromArray:{values:c.elements}};if(c instanceof Qs)return{fieldPath:o.field.canonicalString(),increment:c.Re};if(c instanceof po)return{fieldPath:o.field.canonicalString(),minimum:c.Re};if(c instanceof mo)return{fieldPath:o.field.canonicalString(),maximum:c.Re};throw z(20930,{transform:o.transform})})(0,r)))),e.precondition.isNone||(t.currentDocument=(function(s,i){return i.updateTime!==void 0?{updateTime:eo(s,i.updateTime)}:i.exists!==void 0?{exists:i.exists}:z(27497)})(n,e.precondition)),t}function $g(n,e){return n&&n.length>0?(j(e!==void 0,14353),n.map((t=>(function(s,i){let o=s.updateTime?qt(s.updateTime):qt(i);return o.isEqual(J.min())&&(o=qt(i)),new rg(o,s.transformResults||[])})(t,e)))):[]}function qg(n,e){return{documents:[Zf(n,e.path)]}}function td(n,e){const t={structuredQuery:{}},r=e.path;let s;e.collectionGroup!==null?(s=r,t.structuredQuery.from=[{collectionId:e.collectionGroup,allDescendants:!0}]):(s=r.popLast(),t.structuredQuery.from=[{collectionId:r.lastSegment()}]),t.parent=Zf(n,s);const i=(function(l){if(l.length!==0)return rd(kt.create(l,"and"))})(e.filters);i&&(t.structuredQuery.where=i);const o=(function(l){if(l.length!==0)return l.map((p=>(function(T){return{field:Rn(T.field),direction:zg(T.dir)}})(p)))})(e.orderBy);o&&(t.structuredQuery.orderBy=o);const c=yc(n,e.limit);return c!==null&&(t.structuredQuery.limit=c),e.startAt&&(t.structuredQuery.startAt=(function(l){return{before:l.inclusive,values:l.position}})(e.startAt)),e.endAt&&(t.structuredQuery.endAt=(function(l){return{before:!l.inclusive,values:l.position}})(e.endAt)),{yt:t,parent:s}}function Hg(n,e,t,r){const{yt:s,parent:i}=td(n,e),o={},c=[];let u=0;return t.forEach((l=>{const p="aggregate_"+u++;o[p]=l.alias,l.aggregateType==="count"?c.push({alias:p,count:{}}):l.aggregateType==="avg"?c.push({alias:p,avg:{field:Rn(l.fieldPath)}}):l.aggregateType==="sum"&&c.push({alias:p,sum:{field:Rn(l.fieldPath)}})})),{request:{structuredAggregationQuery:{aggregations:c,structuredQuery:s.structuredQuery},parent:s.parent},wt:o,parent:i}}function jg(n){let e=Fg(n.parent);const t=n.structuredQuery,r=t.from?t.from.length:0;let s=null;if(r>0){j(r===1,65062);const p=t.from[0];p.allDescendants?s=p.collectionId:e=e.child(p.collectionId)}let i=[];t.where&&(i=(function(g){const T=nd(g);return T instanceof kt&&Lf(T)?T.getFilters():[T]})(t.where));let o=[];t.orderBy&&(o=(function(g){return g.map((T=>(function(O){return new Xs(wr(O.field),(function(M){switch(M){case"ASCENDING":return"asc";case"DESCENDING":return"desc";default:return}})(O.direction))})(T)))})(t.orderBy));let c=null;t.limit&&(c=(function(g){let T;return T=typeof g=="object"?g.value:g,qo(T)?null:T})(t.limit));let u=null;t.startAt&&(u=(function(g){const T=!!g.before,b=g.values||[];return new _o(b,T)})(t.startAt));let l=null;return t.endAt&&(l=(function(g){const T=!g.before,b=g.values||[];return new _o(b,T)})(t.endAt)),yg(e,s,o,i,c,"F",u,l)}function Gg(n,e){const t=(function(s){switch(s){case"TargetPurposeListen":return null;case"TargetPurposeExistenceFilterMismatch":return"existence-filter-mismatch";case"TargetPurposeExistenceFilterMismatchBloom":return"existence-filter-mismatch-bloom";case"TargetPurposeLimboResolution":return"limbo-document";default:return z(28987,{purpose:s})}})(e.purpose);return t==null?null:{"goog-listen-tags":t}}function Wg(n,e){return{structuredPipeline:{pipeline:{stages:e.stages.map((t=>t._toProto(n)))}}}}function nd(n){return n.unaryFilter!==void 0?(function(t){switch(t.unaryFilter.op){case"IS_NAN":const r=wr(t.unaryFilter.field);return Pe.create(r,"==",{doubleValue:NaN});case"IS_NULL":const s=wr(t.unaryFilter.field);return Pe.create(s,"==",{nullValue:"NULL_VALUE"});case"IS_NOT_NAN":const i=wr(t.unaryFilter.field);return Pe.create(i,"!=",{doubleValue:NaN});case"IS_NOT_NULL":const o=wr(t.unaryFilter.field);return Pe.create(o,"!=",{nullValue:"NULL_VALUE"});case"OPERATOR_UNSPECIFIED":return z(61313);default:return z(60726)}})(n):n.fieldFilter!==void 0?(function(t){return Pe.create(wr(t.fieldFilter.field),(function(s){switch(s){case"EQUAL":return"==";case"NOT_EQUAL":return"!=";case"GREATER_THAN":return">";case"GREATER_THAN_OR_EQUAL":return">=";case"LESS_THAN":return"<";case"LESS_THAN_OR_EQUAL":return"<=";case"ARRAY_CONTAINS":return"array-contains";case"IN":return"in";case"NOT_IN":return"not-in";case"ARRAY_CONTAINS_ANY":return"array-contains-any";case"OPERATOR_UNSPECIFIED":return z(58110);default:return z(50506)}})(t.fieldFilter.op),t.fieldFilter.value)})(n):n.compositeFilter!==void 0?(function(t){return kt.create(t.compositeFilter.filters.map((r=>nd(r))),(function(s){switch(s){case"AND":return"and";case"OR":return"or";default:return z(1026)}})(t.compositeFilter.op))})(n):z(30097,{filter:n})}function zg(n){return Vg[n]}function Kg(n){return xg[n]}function Yg(n){return Lg[n]}function Rn(n){return{fieldPath:n.canonicalString()}}function wr(n){return De.fromServerFormat(n.fieldPath)}function rd(n){return n instanceof Pe?(function(t){if(t.op==="=="){if(ft(t.value))return{unaryFilter:{field:Rn(t.field),op:"IS_NAN"}};if(yt(t.value))return{unaryFilter:{field:Rn(t.field),op:"IS_NULL"}}}else if(t.op==="!="){if(ft(t.value))return{unaryFilter:{field:Rn(t.field),op:"IS_NOT_NAN"}};if(yt(t.value))return{unaryFilter:{field:Rn(t.field),op:"IS_NOT_NULL"}}}return{fieldFilter:{field:Rn(t.field),op:Kg(t.op),value:t.value}}})(n):n instanceof kt?(function(t){const r=t.getFilters().map((s=>rd(s)));return r.length===1?r[0]:{compositeFilter:{op:Yg(t.op),filters:r}}})(n):z(54877,{filter:n})}function Qg(n){const e=[];return n.fields.forEach((t=>e.push(t.canonicalString()))),{fieldPaths:e}}function sd(n){return n.length>=4&&n.get(0)==="projects"&&n.get(2)==="databases"}function id(n){return!!n&&typeof n._toProto=="function"&&n._protoValueType==="ProtoValue"}function Js(n,e){const t={fields:{}};return e.forEach(((r,s)=>{if(typeof s!="string")throw new Error(`Cannot encode map with non-string key: ${s}`);t.fields[s]=r._toProto(n)})),{mapValue:t}}function od(n){return{stringValue:n}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Qo(n){return new Mg(n,!0)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class wt{constructor(e){this._byteString=e}static fromBase64String(e){try{return new wt(Ne.fromBase64String(e))}catch(t){throw new U(V.INVALID_ARGUMENT,"Failed to construct data from Base64 string: "+t)}}static fromUint8Array(e){return new wt(Ne.fromUint8Array(e))}toBase64(){return this._byteString.toBase64()}toUint8Array(){return this._byteString.toUint8Array()}toString(){return"Bytes(base64: "+this.toBase64()+")"}isEqual(e){return this._byteString.isEqual(e._byteString)}toJSON(){return{type:wt._jsonSchemaVersion,bytes:this.toBase64()}}static fromJSON(e){if(ui(e,wt._jsonSchema))return wt.fromBase64String(e.bytes)}}wt._jsonSchemaVersion="firestore/bytes/1.0",wt._jsonSchema={type:Se("string",wt._jsonSchemaVersion),bytes:Se("string")};/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class pi{constructor(...e){for(let t=0;t<e.length;++t)if(e[t].length===0)throw new U(V.INVALID_ARGUMENT,"Invalid field name at argument $(i + 1). Field names must not be empty.");this._internalPath=new De(e)}isEqual(e){return this._internalPath.isEqual(e._internalPath)}}function Xg(){return new pi(Mt)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class mi{constructor(e){this._methodName=e}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ht{constructor(e,t){if(!isFinite(e)||e<-90||e>90)throw new U(V.INVALID_ARGUMENT,"Latitude must be a number between -90 and 90, but was: "+e);if(!isFinite(t)||t<-180||t>180)throw new U(V.INVALID_ARGUMENT,"Longitude must be a number between -180 and 180, but was: "+t);this._lat=e,this._long=t}get latitude(){return this._lat}get longitude(){return this._long}isEqual(e){return this._lat===e._lat&&this._long===e._long}_compareTo(e){return se(this._lat,e._lat)||se(this._long,e._long)}toJSON(){return{latitude:this._lat,longitude:this._long,type:Ht._jsonSchemaVersion}}static fromJSON(e){if(ui(e,Ht._jsonSchema))return new Ht(e.latitude,e.longitude)}}function ad(n){const e={};return n.timeoutSeconds!==void 0&&(e.timeoutSeconds=n.timeoutSeconds),e}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */Ht._jsonSchemaVersion="firestore/geoPoint/1.0",Ht._jsonSchema={type:Se("string",Ht._jsonSchemaVersion),latitude:Se("number"),longitude:Se("number")};class Jg{bt(e){}shutdown(){}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Eh="ConnectivityMonitor";class Ih{constructor(){this.vt=()=>this.St(),this.Dt=()=>this.xt(),this.Ct=[],this.Ft()}bt(e){this.Ct.push(e)}shutdown(){window.removeEventListener("online",this.vt),window.removeEventListener("offline",this.Dt)}Ft(){window.addEventListener("online",this.vt),window.addEventListener("offline",this.Dt)}St(){$(Eh,"Network connectivity changed: AVAILABLE");for(const e of this.Ct)e(0)}xt(){$(Eh,"Network connectivity changed: UNAVAILABLE");for(const e of this.Ct)e(1)}static C(){return typeof window<"u"&&window.addEventListener!==void 0&&window.removeEventListener!==void 0}}/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let qi=null;function Tc(){return qi===null?qi=(function(){return 268435456+Math.round(2147483648*Math.random())})():qi++,"0x"+qi.toString(16)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Ka="RestConnection",Zg={BatchGetDocuments:"batchGet",Commit:"commit",RunQuery:"runQuery",RunAggregationQuery:"runAggregationQuery",ExecutePipeline:"executePipeline"};class e3{get Ot(){return!1}constructor(e){this.databaseInfo=e,this.databaseId=e.databaseId;const t=e.ssl?"https":"http",r=encodeURIComponent(this.databaseId.projectId),s=encodeURIComponent(this.databaseId.database);this.Mt=t+"://"+e.host,this.Nt=`projects/${r}/databases/${s}`,this.Lt=this.databaseId.database===js?`project_id=${r}`:`project_id=${r}&database_id=${s}`}Bt(e,t,r,s,i){const o=Tc(),c=this.Ut(e,t.toUriEncodedString());$(Ka,`Sending RPC '${e}' ${o}:`,c,r);const u={"google-cloud-resource-prefix":this.Nt,"x-goog-request-params":this.Lt};this.kt(u,s,i);const{host:l}=new URL(c),p=hr(l);return this.qt(e,c,u,r,p).then((g=>($(Ka,`Received RPC '${e}' ${o}: `,g),g)),(g=>{throw Ot(Ka,`RPC '${e}' ${o} failed with error: `,g,"url: ",c,"request:",r),g}))}$t(e,t,r,s,i,o){return this.Bt(e,t,r,s,i)}kt(e,t,r){e["X-Goog-Api-Client"]=(function(){return"gl-js/ fire/"+qr})(),e["Content-Type"]="text/plain",this.databaseInfo.appId&&(e["X-Firebase-GMPID"]=this.databaseInfo.appId),t&&t.headers.forEach(((s,i)=>e[i]=s)),r&&r.headers.forEach(((s,i)=>e[i]=s))}Ut(e,t){const r=Zg[e];let s=`${this.Mt}/v1/${t}:${r}`;return this.databaseInfo.apiKey&&(s=`${s}?key=${encodeURIComponent(this.databaseInfo.apiKey)}`),s}terminate(){}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class t3{constructor(e){this.Kt=e.Kt,this.Wt=e.Wt}Qt(e){this.Gt=e}zt(e){this.jt=e}Ht(e){this.Jt=e}onMessage(e){this.Yt=e}close(){this.Wt()}send(e){this.Kt(e)}Zt(){this.Gt()}Xt(){this.jt()}en(e){this.Jt(e)}tn(e){this.Yt(e)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const qe="WebChannelConnection",gs=(n,e,t)=>{n.listen(e,(r=>{try{t(r)}catch(s){setTimeout((()=>{throw s}),0)}}))};class Sr extends e3{constructor(e){super(e),this.nn=[],this.forceLongPolling=e.forceLongPolling,this.autoDetectLongPolling=e.autoDetectLongPolling,this.useFetchStreams=e.useFetchStreams,this.longPollingOptions=e.longPollingOptions}static rn(){if(!Sr.sn){const e=lf();gs(e,uf.STAT_EVENT,(t=>{t.stat===hc.PROXY?$(qe,"STAT_EVENT: detected buffering proxy"):t.stat===hc.NOPROXY&&$(qe,"STAT_EVENT: detected no buffering proxy")})),Sr.sn=!0}}qt(e,t,r,s,i){const o=Tc();return new Promise(((c,u)=>{const l=new af;l.setWithCredentials(!0),l.listenOnce(cf.COMPLETE,(()=>{try{switch(l.getLastErrorCode()){case Qi.NO_ERROR:const g=l.getResponseJson();$(qe,`XHR for RPC '${e}' ${o} received:`,JSON.stringify(g)),c(g);break;case Qi.TIMEOUT:$(qe,`RPC '${e}' ${o} timed out`),u(new U(V.DEADLINE_EXCEEDED,"Request time out"));break;case Qi.HTTP_ERROR:const T=l.getStatus();if($(qe,`RPC '${e}' ${o} failed with status:`,T,"response text:",l.getResponseText()),T>0){let b=l.getResponseJson();Array.isArray(b)&&(b=b[0]);const O=b?.error;if(O&&O.status&&O.message){const L=(function(Y){const ce=Y.toLowerCase().replace(/_/g,"-");return Object.values(V).indexOf(ce)>=0?ce:V.UNKNOWN})(O.status);u(new U(L,O.message))}else u(new U(V.UNKNOWN,"Server responded with status "+l.getStatus()))}else u(new U(V.UNAVAILABLE,"Connection failed."));break;default:z(9055,{_n:e,streamId:o,an:l.getLastErrorCode(),un:l.getLastError()})}}finally{$(qe,`RPC '${e}' ${o} completed.`)}}));const p=JSON.stringify(s);$(qe,`RPC '${e}' ${o} sending request:`,s),l.send(t,"POST",p,r,15)}))}cn(e,t,r){const s=Tc(),i=[this.Mt,"/","google.firestore.v1.Firestore","/",e,"/channel"],o=this.createWebChannelTransport(),c={httpSessionIdParam:"gsessionid",initMessageHeaders:{},messageUrlParams:{database:`projects/${this.databaseId.projectId}/databases/${this.databaseId.database}`},sendRawJson:!0,supportsCrossDomainXhr:!0,internalChannelParams:{forwardChannelRequestTimeoutMs:6e5},forceLongPolling:this.forceLongPolling,detectBufferingProxy:this.autoDetectLongPolling},u=this.longPollingOptions.timeoutSeconds;u!==void 0&&(c.longPollingTimeout=Math.round(1e3*u)),this.useFetchStreams&&(c.useFetchStreams=!0),this.kt(c.initMessageHeaders,t,r),c.encodeInitMessageHeaders=!0;const l=i.join("");$(qe,`Creating RPC '${e}' stream ${s}: ${l}`,c);const p=o.createWebChannel(l,c);this.En(p);let g=!1,T=!1;const b=new t3({Kt:O=>{T?$(qe,`Not sending because RPC '${e}' stream ${s} is closed:`,O):(g||($(qe,`Opening RPC '${e}' stream ${s} transport.`),p.open(),g=!0),$(qe,`RPC '${e}' stream ${s} sending:`,O),p.send(O))},Wt:()=>p.close()});return gs(p,Is.EventType.OPEN,(()=>{T||($(qe,`RPC '${e}' stream ${s} transport opened.`),b.Zt())})),gs(p,Is.EventType.CLOSE,(()=>{T||(T=!0,$(qe,`RPC '${e}' stream ${s} transport closed`),b.en(),this.hn(p))})),gs(p,Is.EventType.ERROR,(O=>{T||(T=!0,Ot(qe,`RPC '${e}' stream ${s} transport errored. Name:`,O.name,"Message:",O.message),b.en(new U(V.UNAVAILABLE,"The operation could not be completed")))})),gs(p,Is.EventType.MESSAGE,(O=>{if(!T){const L=O.data[0];j(!!L,16349);const M=L,Y=M?.error||M[0]?.error;if(Y){$(qe,`RPC '${e}' stream ${s} received error:`,Y);const ce=Y.status;let he=(function(we){const v=Re[we];if(v!==void 0)return Gf(v)})(ce),pe=Y.message;ce==="NOT_FOUND"&&pe.includes("database")&&pe.includes("does not exist")&&pe.includes(this.databaseId.database)&&Ot(`Database '${this.databaseId.database}' not found. Please check your project configuration.`),he===void 0&&(he=V.INTERNAL,pe="Unknown error status: "+ce+" with message "+Y.message),T=!0,b.en(new U(he,pe)),p.close()}else $(qe,`RPC '${e}' stream ${s} received:`,L),b.tn(L)}})),Sr.rn(),setTimeout((()=>{b.Xt()}),0),b}terminate(){this.nn.forEach((e=>e.close())),this.nn=[]}En(e){this.nn.push(e)}hn(e){this.nn=this.nn.filter((t=>t===e))}kt(e,t,r){super.kt(e,t,r),this.databaseInfo.apiKey&&(e["x-goog-api-key"]=this.databaseInfo.apiKey)}createWebChannelTransport(){return hf()}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function n3(n){return new Sr(n)}Sr.sn=!1;class cd{constructor(e,t,r=1e3,s=1.5,i=6e4){this.Tn=e,this.timerId=t,this.Pn=r,this.Rn=s,this.In=i,this.An=0,this.Vn=null,this.dn=Date.now(),this.reset()}reset(){this.An=0}fn(){this.An=this.In}mn(e){this.cancel();const t=Math.floor(this.An+this.pn()),r=Math.max(0,Date.now()-this.dn),s=Math.max(0,t-r);s>0&&$("ExponentialBackoff",`Backing off for ${s} ms (base delay: ${this.An} ms, delay with jitter: ${t} ms, last attempt: ${r} ms ago)`),this.Vn=this.Tn.enqueueAfterDelay(this.timerId,s,(()=>(this.dn=Date.now(),e()))),this.An*=this.Rn,this.An<this.Pn&&(this.An=this.Pn),this.An>this.In&&(this.An=this.In)}gn(){this.Vn!==null&&(this.Vn.skipDelay(),this.Vn=null)}cancel(){this.Vn!==null&&(this.Vn.cancel(),this.Vn=null)}pn(){return(Math.random()-.5)*this.An}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Th="PersistentStream";class ud{constructor(e,t,r,s,i,o,c,u){this.Tn=e,this.yn=r,this.wn=s,this.connection=i,this.authCredentialsProvider=o,this.appCheckCredentialsProvider=c,this.listener=u,this.state=0,this.bn=0,this.vn=null,this.Sn=null,this.stream=null,this.Dn=0,this.xn=new cd(e,t)}Cn(){return this.state===1||this.state===5||this.Fn()}Fn(){return this.state===2||this.state===3}start(){this.Dn=0,this.state!==4?this.auth():this.On()}async stop(){this.Cn()&&await this.close(0)}Mn(){this.state=0,this.xn.reset()}Nn(){this.Fn()&&this.vn===null&&(this.vn=this.Tn.enqueueAfterDelay(this.yn,6e4,(()=>this.Ln())))}Bn(e){this.Un(),this.stream.send(e)}async Ln(){if(this.Fn())return this.close(0)}Un(){this.vn&&(this.vn.cancel(),this.vn=null)}kn(){this.Sn&&(this.Sn.cancel(),this.Sn=null)}async close(e,t){this.Un(),this.kn(),this.xn.cancel(),this.bn++,e!==4?this.xn.reset():t&&t.code===V.RESOURCE_EXHAUSTED?(on(t.toString()),on("Using maximum backoff delay to prevent overloading the backend."),this.xn.fn()):t&&t.code===V.UNAUTHENTICATED&&this.state!==3&&(this.authCredentialsProvider.invalidateToken(),this.appCheckCredentialsProvider.invalidateToken()),this.stream!==null&&(this.qn(),this.stream.close(),this.stream=null),this.state=e,await this.listener.Ht(t)}qn(){}auth(){this.state=1;const e=this.$n(this.bn),t=this.bn;Promise.all([this.authCredentialsProvider.getToken(),this.appCheckCredentialsProvider.getToken()]).then((([r,s])=>{this.bn===t&&this.Kn(r,s)}),(r=>{e((()=>{const s=new U(V.UNKNOWN,"Fetching auth token failed: "+r.message);return this.Wn(s)}))}))}Kn(e,t){const r=this.$n(this.bn);this.stream=this.Qn(e,t),this.stream.Qt((()=>{r((()=>this.listener.Qt()))})),this.stream.zt((()=>{r((()=>(this.state=2,this.Sn=this.Tn.enqueueAfterDelay(this.wn,1e4,(()=>(this.Fn()&&(this.state=3),Promise.resolve()))),this.listener.zt())))})),this.stream.Ht((s=>{r((()=>this.Wn(s)))})),this.stream.onMessage((s=>{r((()=>++this.Dn==1?this.Gn(s):this.onNext(s)))}))}On(){this.state=5,this.xn.mn((async()=>{this.state=0,this.start()}))}Wn(e){return $(Th,`close with error: ${e}`),this.stream=null,this.close(4,e)}$n(e){return t=>{this.Tn.enqueueAndForget((()=>this.bn===e?t():($(Th,"stream callback skipped by getCloseGuardedDispatcher."),Promise.resolve())))}}}class r3 extends ud{constructor(e,t,r,s,i,o){super(e,"listen_stream_connection_backoff","listen_stream_idle","health_check_timeout",t,r,s,o),this.serializer=i}Qn(e,t){return this.connection.cn("Listen",e,t)}Gn(e){return this.onNext(e)}onNext(e){this.xn.reset();const t=Ug(this.serializer,e),r=(function(i){if(!("targetChange"in i))return J.min();const o=i.targetChange;return o.targetIds&&o.targetIds.length?J.min():o.readTime?qt(o.readTime):J.min()})(e);return this.listener.zn(t,r)}jn(e){const t={};t.database=Ic(this.serializer),t.addTarget=(function(i,o){let c;const u=o.target;if(c=er(u)?{pipelineQuery:Wg(i,u)}:qf(u)?{documents:qg(i,u)}:{query:td(i,u).yt},c.targetId=o.targetId,o.resumeToken.approximateByteSize()>0){c.resumeToken=Xf(i,o.resumeToken);const l=yc(i,o.expectedCount);l!==null&&(c.expectedCount=l)}else if(o.snapshotVersion.compareTo(J.min())>0){c.readTime=Eo(i,o.snapshotVersion.toTimestamp());const l=yc(i,o.expectedCount);l!==null&&(c.expectedCount=l)}return c})(this.serializer,e);const r=Gg(this.serializer,e);r&&(t.labels=r),this.Bn(t)}Hn(e){const t={};t.database=Ic(this.serializer),t.removeTarget=e,this.Bn(t)}}class s3 extends ud{constructor(e,t,r,s,i,o){super(e,"write_stream_connection_backoff","write_stream_idle","health_check_timeout",t,r,s,o),this.serializer=i}get Jn(){return this.Dn>0}start(){this.lastStreamToken=void 0,super.start()}qn(){this.Jn&&this.Yn([])}Qn(e,t){return this.connection.cn("Write",e,t)}Gn(e){return j(!!e.streamToken,31322),this.lastStreamToken=e.streamToken,j(!e.writeResults||e.writeResults.length===0,55816),this.listener.Zn()}onNext(e){j(!!e.streamToken,12678),this.lastStreamToken=e.streamToken,this.xn.reset();const t=$g(e.writeResults,e.commitTime),r=qt(e.commitTime);return this.listener.Xn(r,t)}er(){const e={};e.database=Ic(this.serializer),this.Bn(e)}Yn(e){const t={streamToken:this.lastStreamToken,writes:e.map((r=>Bg(this.serializer,r)))};this.Bn(t)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class i3{}class o3 extends i3{constructor(e,t,r,s){super(),this.authCredentials=e,this.appCheckCredentials=t,this.connection=r,this.serializer=s,this.tr=!1}nr(){if(this.tr)throw new U(V.FAILED_PRECONDITION,"The client has already been terminated.")}Bt(e,t,r,s){return this.nr(),Promise.all([this.authCredentials.getToken(),this.appCheckCredentials.getToken()]).then((([i,o])=>this.connection.Bt(e,Ec(t,r),s,i,o))).catch((i=>{throw i.name==="FirebaseError"?(i.code===V.UNAUTHENTICATED&&(this.authCredentials.invalidateToken(),this.appCheckCredentials.invalidateToken()),i):new U(V.UNKNOWN,i.toString())}))}$t(e,t,r,s,i){return this.nr(),Promise.all([this.authCredentials.getToken(),this.appCheckCredentials.getToken()]).then((([o,c])=>this.connection.$t(e,Ec(t,r),s,o,c,i))).catch((o=>{throw o.name==="FirebaseError"?(o.code===V.UNAUTHENTICATED&&(this.authCredentials.invalidateToken(),this.appCheckCredentials.invalidateToken()),o):new U(V.UNKNOWN,o.toString())}))}terminate(){this.tr=!0,this.connection.terminate()}}function a3(n,e,t,r){return new o3(n,e,t,r)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const c3="ComponentProvider",wh=new Map;function u3(n,e,t,r,s){return new Qm(n,e,t,s.host,s.ssl,s.experimentalForceLongPolling,s.experimentalAutoDetectLongPolling,ad(s.experimentalLongPollingOptions),s.useFetchStreams,s.isUsingEmulator,r)}/**
 * @license
 * Copyright 2018 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Ah={didRun:!1,sequenceNumbersCollected:0,targetsRemoved:0,documentsRemoved:0},ld=41943040;class ot{static withCacheSize(e){return new ot(e,ot.DEFAULT_COLLECTION_PERCENTILE,ot.DEFAULT_MAX_SEQUENCE_NUMBERS_TO_COLLECT)}constructor(e,t,r){this.cacheSizeCollectionThreshold=e,this.percentileToCollect=t,this.maximumSequenceNumbersToCollect=r}}ot.DEFAULT_COLLECTION_PERCENTILE=10,ot.DEFAULT_MAX_SEQUENCE_NUMBERS_TO_COLLECT=1e3,ot.DEFAULT=new ot(ld,ot.DEFAULT_COLLECTION_PERCENTILE,ot.DEFAULT_MAX_SEQUENCE_NUMBERS_TO_COLLECT),ot.DISABLED=new ot(-1,0,0);/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const vh="LruGarbageCollector",hd=1048576;function Rh([n,e],[t,r]){const s=se(n,t);return s===0?se(e,r):s}class l3{constructor(e){this.rr=e,this.buffer=new be(Rh),this.ir=0}sr(){return++this.ir}_r(e){const t=[e,this.sr()];if(this.buffer.size<this.rr)this.buffer=this.buffer.add(t);else{const r=this.buffer.last();Rh(t,r)<0&&(this.buffer=this.buffer.delete(r).add(t))}}get maxValue(){return this.buffer.last()[0]}}class h3{constructor(e,t,r){this.garbageCollector=e,this.asyncQueue=t,this.localStore=r,this.ar=null}start(){this.garbageCollector.params.cacheSizeCollectionThreshold!==-1&&this.ur(6e4)}stop(){this.ar&&(this.ar.cancel(),this.ar=null)}get started(){return this.ar!==null}ur(e){$(vh,`Garbage collection scheduled in ${e}ms`),this.ar=this.asyncQueue.enqueueAfterDelay("lru_garbage_collection",e,(async()=>{this.ar=null;try{await this.localStore.collectGarbage(this.garbageCollector)}catch(t){jr(t)?$(vh,"Ignoring IndexedDB error during garbage collection: ",t):await Hr(t)}await this.ur(3e5)}))}}class f3{constructor(e,t){this.cr=e,this.params=t}calculateTargetCount(e,t){return this.cr.lr(e).next((r=>Math.floor(t/100*r)))}nthSequenceNumber(e,t){if(t===0)return x.resolve($o.ce);const r=new l3(t);return this.cr.forEachTarget(e,(s=>r._r(s.sequenceNumber))).next((()=>this.cr.Er(e,(s=>r._r(s))))).next((()=>r.maxValue))}removeTargets(e,t,r){return this.cr.removeTargets(e,t,r)}removeOrphanedDocuments(e,t){return this.cr.removeOrphanedDocuments(e,t)}collect(e,t){return this.params.cacheSizeCollectionThreshold===-1?($("LruGarbageCollector","Garbage collection skipped; disabled"),x.resolve(Ah)):this.getCacheSize(e).next((r=>r<this.params.cacheSizeCollectionThreshold?($("LruGarbageCollector",`Garbage collection skipped; Cache size ${r} is lower than threshold ${this.params.cacheSizeCollectionThreshold}`),Ah):this.hr(e,t)))}getCacheSize(e){return this.cr.getCacheSize(e)}hr(e,t){let r,s,i,o,c,u,l;const p=Date.now();return this.calculateTargetCount(e,this.params.percentileToCollect).next((g=>(g>this.params.maximumSequenceNumbersToCollect?($("LruGarbageCollector",`Capping sequence numbers to collect down to the maximum of ${this.params.maximumSequenceNumbersToCollect} from ${g}`),s=this.params.maximumSequenceNumbersToCollect):s=g,o=Date.now(),this.nthSequenceNumber(e,s)))).next((g=>(r=g,c=Date.now(),this.removeTargets(e,r,t)))).next((g=>(i=g,u=Date.now(),this.removeOrphanedDocuments(e,r)))).next((g=>(l=Date.now(),Ir()<=ie.DEBUG&&$("LruGarbageCollector",`LRU Garbage Collection
	Counted targets in ${o-p}ms
	Determined least recently used ${s} in `+(c-o)+`ms
	Removed ${i} targets in `+(u-c)+`ms
	Removed ${g} documents in `+(l-u)+`ms
Total Duration: ${l-p}ms`),x.resolve({didRun:!0,sequenceNumbersCollected:s,targetsRemoved:i,documentsRemoved:g}))))}}function d3(n,e){return new f3(n,e)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const fd="firestore.googleapis.com",Ch=!0;class Ph{constructor(e){if(e.host===void 0){if(e.ssl!==void 0)throw new U(V.INVALID_ARGUMENT,"Can't provide ssl option if host option is not set");this.host=fd,this.ssl=Ch}else this.host=e.host,this.ssl=e.ssl??Ch;if(this.isUsingEmulator=e.emulatorOptions!==void 0,this.credentials=e.credentials,this.ignoreUndefinedProperties=!!e.ignoreUndefinedProperties,this.localCache=e.localCache,e.cacheSizeBytes===void 0)this.cacheSizeBytes=ld;else{if(e.cacheSizeBytes!==-1&&e.cacheSizeBytes<hd)throw new U(V.INVALID_ARGUMENT,"cacheSizeBytes must be at least 1048576");this.cacheSizeBytes=e.cacheSizeBytes}Mm("experimentalForceLongPolling",e.experimentalForceLongPolling,"experimentalAutoDetectLongPolling",e.experimentalAutoDetectLongPolling),this.experimentalForceLongPolling=!!e.experimentalForceLongPolling,this.experimentalForceLongPolling?this.experimentalAutoDetectLongPolling=!1:e.experimentalAutoDetectLongPolling===void 0?this.experimentalAutoDetectLongPolling=!0:this.experimentalAutoDetectLongPolling=!!e.experimentalAutoDetectLongPolling,this.experimentalLongPollingOptions=ad(e.experimentalLongPollingOptions??{}),(function(r){if(r.timeoutSeconds!==void 0){if(isNaN(r.timeoutSeconds))throw new U(V.INVALID_ARGUMENT,`invalid long polling timeout: ${r.timeoutSeconds} (must not be NaN)`);if(r.timeoutSeconds<5)throw new U(V.INVALID_ARGUMENT,`invalid long polling timeout: ${r.timeoutSeconds} (minimum allowed value is 5)`);if(r.timeoutSeconds>30)throw new U(V.INVALID_ARGUMENT,`invalid long polling timeout: ${r.timeoutSeconds} (maximum allowed value is 30)`)}})(this.experimentalLongPollingOptions),this.useFetchStreams=!!e.useFetchStreams}isEqual(e){return this.host===e.host&&this.ssl===e.ssl&&this.credentials===e.credentials&&this.cacheSizeBytes===e.cacheSizeBytes&&this.experimentalForceLongPolling===e.experimentalForceLongPolling&&this.experimentalAutoDetectLongPolling===e.experimentalAutoDetectLongPolling&&(function(r,s){return r.timeoutSeconds===s.timeoutSeconds})(this.experimentalLongPollingOptions,e.experimentalLongPollingOptions)&&this.ignoreUndefinedProperties===e.ignoreUndefinedProperties&&this.useFetchStreams===e.useFetchStreams}}class Xo{constructor(e,t,r,s){this._authCredentials=e,this._appCheckCredentials=t,this._databaseId=r,this._app=s,this.type="firestore-lite",this._persistenceKey="(lite)",this._settings=new Ph({}),this._settingsFrozen=!1,this._emulatorOptions={},this._terminateTask="notTerminated"}get app(){if(!this._app)throw new U(V.FAILED_PRECONDITION,"Firestore was not initialized using the Firebase SDK. 'app' is not available");return this._app}get _initialized(){return this._settingsFrozen}get _terminated(){return this._terminateTask!=="notTerminated"}_setSettings(e){if(this._settingsFrozen)throw new U(V.FAILED_PRECONDITION,"Firestore has already been started and its settings can no longer be changed. You can only modify settings before calling any other methods on a Firestore object.");this._settings=new Ph(e),this._emulatorOptions=e.emulatorOptions||{},e.credentials!==void 0&&(this._authCredentials=(function(r){if(!r)return new Pm;switch(r.type){case"firstParty":return new Om(r.sessionIndex||"0",r.iamToken||null,r.authTokenFactory||null);case"provider":return r.client;default:throw new U(V.INVALID_ARGUMENT,"makeAuthCredentialsProvider failed due to invalid credential type")}})(e.credentials))}_getSettings(){return this._settings}_getEmulatorOptions(){return this._emulatorOptions}_freezeSettings(){return this._settingsFrozen=!0,this._settings}_delete(){return this._terminateTask==="notTerminated"&&(this._terminateTask=this._terminate()),this._terminateTask}async _restart(){this._terminateTask==="notTerminated"?await this._terminate():this._terminateTask="notTerminated"}toJSON(){return{app:this._app,databaseId:this._databaseId,settings:this._settings}}_terminate(){return(function(t){const r=wh.get(t);r&&($(c3,"Removing Datastore"),wh.delete(t),r.terminate())})(this),Promise.resolve()}}function p3(n,e,t,r={}){n=Ye(n,Xo);const s=hr(e),i=n._getSettings(),o={...i,emulatorOptions:n._getEmulatorOptions()},c=`${e}:${t}`;s&&ko(`https://${c}`),i.host!==fd&&i.host!==c&&Ot("Host has been set in both settings() and connectFirestoreEmulator(), emulator host will be used.");const u={...i,host:c,ssl:s,emulatorOptions:r};if(!jt(u,o)&&(n._setSettings(u),r.mockUserToken)){let l,p;if(typeof r.mockUserToken=="string")l=r.mockUserToken,p=Ge.MOCK_USER;else{l=d2(r.mockUserToken,n._app?.options.projectId);const g=r.mockUserToken.sub||r.mockUserToken.user_id;if(!g)throw new U(V.INVALID_ARGUMENT,"mockUserToken must contain 'sub' or 'user_id' field!");p=new Ge(g)}n._authCredentials=new Sm(new pf(l,p))}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ln{constructor(e,t,r){this.converter=t,this._query=r,this.type="query",this.firestore=e}withConverter(e){return new ln(this.firestore,e,this._query)}}class Ie{constructor(e,t,r){this.converter=t,this._key=r,this.type="document",this.firestore=e}get _path(){return this._key.path}get id(){return this._key.path.lastSegment()}get path(){return this._key.path.canonicalString()}get parent(){return new Nn(this.firestore,this.converter,this._key.path.popLast())}withConverter(e){return new Ie(this.firestore,e,this._key)}toJSON(){return{type:Ie._jsonSchemaVersion,referencePath:this._key.toString()}}static fromJSON(e,t,r){if(ui(t,Ie._jsonSchema))return new Ie(e,r||null,new W(ue.fromString(t.referencePath)))}}Ie._jsonSchemaVersion="firestore/documentReference/1.0",Ie._jsonSchema={type:Se("string",Ie._jsonSchemaVersion),referencePath:Se("string")};class Nn extends ln{constructor(e,t,r){super(e,t,Ko(r)),this._path=r,this.type="collection"}get id(){return this._query.path.lastSegment()}get path(){return this._query.path.canonicalString()}get parent(){const e=this._path.popLast();return e.isEmpty()?null:new Ie(this.firestore,null,new W(e))}withConverter(e){return new Nn(this.firestore,e,this._path)}}function Fy(n,e,...t){if(n=le(n),mf("collection","path",e),n instanceof Xo){const r=ue.fromString(e,...t);return Jl(r),new Nn(n,null,r)}{if(!(n instanceof Ie||n instanceof Nn))throw new U(V.INVALID_ARGUMENT,"Expected first argument to collection() to be a CollectionReference, a DocumentReference or FirebaseFirestore");const r=n._path.child(ue.fromString(e,...t));return Jl(r),new Nn(n.firestore,null,r)}}function m3(n,e,...t){if(n=le(n),arguments.length===1&&(e=Wc.newId()),mf("doc","path",e),n instanceof Xo){const r=ue.fromString(e,...t);return Xl(r),new Ie(n,null,new W(r))}{if(!(n instanceof Ie||n instanceof Nn))throw new U(V.INVALID_ARGUMENT,"Expected first argument to doc() to be a CollectionReference, a DocumentReference or FirebaseFirestore");const r=n._path.child(ue.fromString(e,...t));return Xl(r),new Ie(n.firestore,n instanceof Nn?n.converter:null,new W(r))}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *//**
 * @license
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ut{constructor(e){this._values=(e||[]).map((t=>t))}toArray(){return this._values.map((e=>e))}isEqual(e){return(function(r,s){if(r.length!==s.length)return!1;for(let i=0;i<r.length;++i)if(r[i]!==s[i])return!1;return!0})(this._values,e._values)}toJSON(){return{type:ut._jsonSchemaVersion,vectorValues:this._values}}static fromJSON(e){if(ui(e,ut._jsonSchema)){if(Array.isArray(e.vectorValues)&&e.vectorValues.every((t=>typeof t=="number")))return new ut(e.vectorValues);throw new U(V.INVALID_ARGUMENT,"Expected 'vectorValues' field to be a number array")}}}ut._jsonSchemaVersion="firestore/vectorValue/1.0",ut._jsonSchema={type:Se("string",ut._jsonSchemaVersion),vectorValues:Se("object")};/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const g3=/^__.*__$/;class _3{constructor(e,t,r){this.data=e,this.fieldMask=t,this.fieldTransforms=r}toMutation(e,t){return this.fieldMask!==null?new Wn(e,this.data,this.fieldMask,t,this.fieldTransforms):new hi(e,this.data,t,this.fieldTransforms)}}class dd{constructor(e,t,r){this.data=e,this.fieldMask=t,this.fieldTransforms=r}toMutation(e,t){return new Wn(e,this.data,this.fieldMask,t,this.fieldTransforms)}}function pd(n){switch(n){case 0:case 2:case 1:return!0;case 3:case 4:return!1;default:throw z(40011,{dataSource:n})}}class Jo{constructor(e,t,r,s,i,o){this.settings=e,this.databaseId=t,this.serializer=r,this.ignoreUndefinedProperties=s,i===void 0&&this.validatePath(),this.fieldTransforms=i||[],this.fieldMask=o||[]}get path(){return this.settings.path}get dataSource(){return this.settings.dataSource}contextWith(e){return new Jo({...this.settings,...e},this.databaseId,this.serializer,this.ignoreUndefinedProperties,this.fieldTransforms,this.fieldMask)}childContextForField(e){const t=this.path?.child(e),r=this.contextWith({path:t,arrayElement:!1});return r.validatePathSegment(e),r}childContextForFieldPath(e){const t=this.path?.child(e),r=this.contextWith({path:t,arrayElement:!1});return r.validatePath(),r}childContextForArray(e){return this.contextWith({path:void 0,arrayElement:!0})}createError(e){return To(e,this.settings.methodName,this.settings.hasConverter||!1,this.path,this.settings.targetDoc)}contains(e){return this.fieldMask.find((t=>e.isPrefixOf(t)))!==void 0||this.fieldTransforms.find((t=>e.isPrefixOf(t.field)))!==void 0}validatePath(){if(this.path)for(let e=0;e<this.path.length;e++)this.validatePathSegment(this.path.get(e))}validatePathSegment(e){if(e.length===0)throw this.createError("Document fields must not be empty");if(pd(this.dataSource)&&g3.test(e))throw this.createError('Document fields cannot begin and end with "__"')}}class y3{constructor(e,t,r){this.databaseId=e,this.ignoreUndefinedProperties=t,this.serializer=r||Qo(e)}createContext(e,t,r,s=!1){return new Jo({dataSource:e,methodName:t,targetDoc:r,path:De.emptyPath(),arrayElement:!1,hasConverter:s},this.databaseId,this.serializer,this.ignoreUndefinedProperties)}}function gi(n){const e=n._freezeSettings(),t=Qo(n._databaseId);return new y3(n._databaseId,!!e.ignoreUndefinedProperties,t)}function t1(n,e,t,r,s,i={}){const o=n.createContext(i.merge||i.mergeFields?2:0,e,t,s);s1("Data must be an object, but it was:",o,r);const c=_d(r,o);let u,l;if(i.merge)u=new _t(o.fieldMask),l=o.fieldTransforms;else if(i.mergeFields){const p=[];for(const g of i.mergeFields){const T=Un(e,g,t);if(!o.contains(T))throw new U(V.INVALID_ARGUMENT,`Field '${T}' is specified in your field mask but missing from your input data.`);Id(p,T)||p.push(T)}u=new _t(p),l=o.fieldTransforms.filter((g=>u.covers(g.field)))}else u=null,l=o.fieldTransforms;return new _3(new Ke(c),u,l)}class Zo extends mi{_toFieldTransform(e){if(e.dataSource!==2)throw e.dataSource===1?e.createError(`${this._methodName}() can only appear at the top level of your update data`):e.createError(`${this._methodName}() cannot be used with set() unless you pass {merge:true}`);return e.fieldMask.push(e.path),null}isEqual(e){return e instanceof Zo}}function E3(n,e,t){return new Jo({dataSource:3,targetDoc:e.settings.targetDoc,methodName:n._methodName,arrayElement:t},e.databaseId,e.serializer,e.ignoreUndefinedProperties)}class n1 extends mi{_toFieldTransform(e){return new Of(e.path,new Ks)}isEqual(e){return e instanceof n1}}class r1 extends mi{constructor(e,t){super(e),this.Tr=t}_toFieldTransform(e){const t=E3(this,e,!0),r=this.Tr.map((i=>an(i,t))),s=new Mr(r);return new Of(e.path,s)}isEqual(e){return e instanceof r1&&jt(this.Tr,e.Tr)}}function md(n,e,t,r){const s=n.createContext(1,e,t);s1("Data must be an object, but it was:",s,r);const i=[],o=Ke.empty();Gn(r,((u,l)=>{const p=Ed(e,u,t);l=le(l);const g=s.childContextForFieldPath(p);if(l instanceof Zo)i.push(p);else{const T=an(l,g);T!=null&&(i.push(p),o.set(p,T))}}));const c=new _t(i);return new dd(o,c,s.fieldTransforms)}function gd(n,e,t,r,s,i){const o=n.createContext(1,e,t),c=[Un(e,r,t)],u=[s];if(i.length%2!=0)throw new U(V.INVALID_ARGUMENT,`Function ${e}() needs to be called with an even number of arguments that alternate between field names and values.`);for(let T=0;T<i.length;T+=2)c.push(Un(e,i[T])),u.push(i[T+1]);const l=[],p=Ke.empty();for(let T=c.length-1;T>=0;--T)if(!Id(l,c[T])){const b=c[T];let O=u[T];O=le(O);const L=o.childContextForFieldPath(b);if(O instanceof Zo)l.push(b);else{const M=an(O,L);M!=null&&(l.push(b),p.set(b,M))}}const g=new _t(l);return new dd(p,g,o.fieldTransforms)}function I3(n,e,t,r=!1){return an(t,n.createContext(r?4:3,e))}function an(n,e,t){if(yd(n=le(n)))return s1("Unsupported field value:",e,n),_d(n,e);if(n instanceof mi)return(function(s,i){if(!pd(i.dataSource))throw i.createError(`${s._methodName}() can only be used with update() and set()`);if(!i.path)throw i.createError(`${s._methodName}() is not currently supported inside arrays`);const o=s._toFieldTransform(i);o&&i.fieldTransforms.push(o)})(n,e),null;if(n===void 0&&e.ignoreUndefinedProperties)return null;if(e.path&&e.fieldMask.push(e.path),n instanceof Array){if(e.settings.arrayElement&&e.dataSource!==4)throw e.createError("Nested arrays are not supported");return(function(s,i){const o=[];let c=0;for(const u of s){let l=an(u,i.childContextForArray(c));l==null&&(l={nullValue:"NULL_VALUE"}),o.push(l),c++}return{arrayValue:{values:o}}})(n,e)}return(function(s,i,o){if((s=le(s))===null)return{nullValue:"NULL_VALUE"};if(typeof s=="number")return Yc(i.serializer,s,o);if(typeof s=="boolean")return{booleanValue:s};if(typeof s=="string")return{stringValue:s};if(s instanceof Date){const c=ge.fromDate(s);return{timestampValue:Eo(i.serializer,c)}}if(s instanceof ge){const c=new ge(s.seconds,1e3*Math.floor(s.nanoseconds/1e3));return{timestampValue:Eo(i.serializer,c)}}if(s instanceof Ht)return{geoPointValue:{latitude:s.latitude,longitude:s.longitude}};if(s instanceof wt)return{bytesValue:Xf(i.serializer,s._byteString)};if(s instanceof Ie){const c=i.databaseId,u=s.firestore._databaseId;if(!u.isEqual(c))throw i.createError(`Document reference is for database ${u.projectId}/${u.database} but should be for database ${c.projectId}/${c.database}`);return{referenceValue:e1(s.firestore._databaseId||i.databaseId,s._key.path)}}if(s instanceof ut)return(function(u,l){const p=u instanceof ut?u.toArray():u;return{mapValue:{fields:{[vf]:{stringValue:Rf},[Ws]:{arrayValue:{values:p.map((T=>{if(typeof T!="number")throw l.createError("VectorValues must only contain numeric values.");return jo(l.serializer,T)}))}}}}}})(s,i);if(id(s))return s._toProto(i.serializer);throw i.createError(`Unsupported field value: ${Bo(s)}`)})(n,e,t)}function _d(n,e){const t={};return yf(n)?e.path&&e.path.length>0&&e.fieldMask.push(e.path):Gn(n,((r,s)=>{const i=an(s,e.childContextForField(r));i!=null&&(t[r]=i)})),{mapValue:{fields:t}}}function yd(n){return!(typeof n!="object"||n===null||n instanceof Array||n instanceof Date||n instanceof ge||n instanceof Ht||n instanceof wt||n instanceof Ie||n instanceof mi||n instanceof ut||id(n))}function s1(n,e,t){if(!yd(t)||!ci(t)){const r=Bo(t);throw r==="an object"?e.createError(n+" a custom object"):e.createError(n+" "+r)}}function Un(n,e,t){if((e=le(e))instanceof pi)return e._internalPath;if(typeof e=="string")return Ed(n,e);throw To("Field path arguments must be of type string or ",n,!1,void 0,t)}const T3=new RegExp("[~\\*/\\[\\]]");function Ed(n,e,t){if(e.search(T3)>=0)throw To(`Invalid field path (${e}). Paths must not contain '~', '*', '/', '[', or ']'`,n,!1,void 0,t);try{return new pi(...e.split("."))._internalPath}catch{throw To(`Invalid field path (${e}). Paths must not be empty, begin with '.', end with '.', or contain '..'`,n,!1,void 0,t)}}function To(n,e,t,r,s){const i=r&&!r.isEmpty(),o=s!==void 0;let c=`Function ${e}() called with invalid data`;t&&(c+=" (via `toFirestore()`)"),c+=". ";let u="";return(i||o)&&(u+=" (found",i&&(u+=` in field ${r}`),o&&(u+=` in document ${s}`),u+=")"),new U(V.INVALID_ARGUMENT,c+n+u)}function Id(n,e){return n.some((t=>t.isEqual(e)))}function Td(n){return typeof n._readUserData=="function"}/**
 * @license
 * Copyright 2025 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Xe{constructor(e){this.optionDefinitions=e}_getKnownOptions(e,t){const r=Ke.empty();for(const s in this.optionDefinitions)if(this.optionDefinitions.hasOwnProperty(s)){const i=this.optionDefinitions[s];if(s in e){const o=e[s];let c;i.nestedOptions&&ci(o)?c={mapValue:{fields:new Xe(i.nestedOptions).getOptionsProto(t,o)}}:o&&(c=an(o,t)??void 0),c&&r.set(De.fromServerFormat(i.serverName),c)}}return r}getOptionsProto(e,t,r){const s=this._getKnownOptions(t,e);if(r){const i=new Map(_f(r,((o,c)=>[De.fromServerFormat(c),o!==void 0?an(o,e):null])));s.setAll(i)}return s.value.mapValue.fields??{}}}/**
 * @license
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function w3(n){return typeof n=="object"&&n!==null&&!!("nullValue"in n&&(n.nullValue===null||n.nullValue==="NULL_VALUE")||"booleanValue"in n&&(n.booleanValue===null||typeof n.booleanValue=="boolean")||"integerValue"in n&&(n.integerValue===null||typeof n.integerValue=="number"||typeof n.integerValue=="string")||"doubleValue"in n&&(n.doubleValue===null||typeof n.doubleValue=="number")||"timestampValue"in n&&(n.timestampValue===null||(function(t){return typeof t=="object"&&t!==null&&"seconds"in t&&(t.seconds===null||typeof t.seconds=="number"||typeof t.seconds=="string")&&"nanos"in t&&(t.nanos===null||typeof t.nanos=="number")})(n.timestampValue))||"stringValue"in n&&(n.stringValue===null||typeof n.stringValue=="string")||"bytesValue"in n&&(n.bytesValue===null||n.bytesValue instanceof Uint8Array)||"referenceValue"in n&&(n.referenceValue===null||typeof n.referenceValue=="string")||"geoPointValue"in n&&(n.geoPointValue===null||(function(t){return typeof t=="object"&&t!==null&&"latitude"in t&&(t.latitude===null||typeof t.latitude=="number")&&"longitude"in t&&(t.longitude===null||typeof t.longitude=="number")})(n.geoPointValue))||"arrayValue"in n&&(n.arrayValue===null||(function(t){return typeof t=="object"&&t!==null&&!(!("values"in t)||t.values!==null&&!Array.isArray(t.values))})(n.arrayValue))||"mapValue"in n&&(n.mapValue===null||(function(t){return typeof t=="object"&&t!==null&&!(!("fields"in t)||t.fields!==null&&!ci(t.fields))})(n.mapValue))||"fieldReferenceValue"in n&&(n.fieldReferenceValue===null||typeof n.fieldReferenceValue=="string")||"functionValue"in n&&(n.functionValue===null||(function(t){return typeof t=="object"&&t!==null&&!(!("name"in t)||t.name!==null&&typeof t.name!="string"||!("args"in t)||t.args!==null&&!Array.isArray(t.args))})(n.functionValue))||"pipelineValue"in n&&(n.pipelineValue===null||(function(t){return typeof t=="object"&&t!==null&&!(!("stages"in t)||t.stages!==null&&!Array.isArray(t.stages))})(n.pipelineValue)))}function Uy(){return new n1("serverTimestamp")}function By(...n){return new r1("arrayUnion",n)}function A3(n){return new ut(n)}/**
 * @license
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function F(n){let e;return n instanceof mr?n:(e=ci(n)?S3(n):n instanceof Array?b3(n):wd(n,void 0),e)}function Ya(n){if(n instanceof mr)return n;if(n instanceof ut)return Zs(n);if(Array.isArray(n))return Zs(A3(n));throw new Error("Unsupported value: "+typeof n)}function i1(n){return Wm(n)?to(n):F(n)}class mr{constructor(){this._protoValueType="ProtoValue"}add(e){return new k("add",[this,F(e)],"add")}asBoolean(){if(this instanceof Bn)return this;if(this instanceof zr)return new vd(this);if(this instanceof Wr)return new P3(this);if(this instanceof k)return new Ad(this);throw new U("invalid-argument",`Conversion of type ${typeof this} to BooleanExpression not supported.`)}subtract(e){return new k("subtract",[this,F(e)],"subtract")}multiply(e){return new k("multiply",[this,F(e)],"multiply")}divide(e){return new k("divide",[this,F(e)],"divide")}mod(e){return new k("mod",[this,F(e)],"mod")}equal(e){return new k("equal",[this,F(e)],"equal").asBoolean()}notEqual(e){return new k("not_equal",[this,F(e)],"notEqual").asBoolean()}lessThan(e){return new k("less_than",[this,F(e)],"lessThan").asBoolean()}lessThanOrEqual(e){return new k("less_than_or_equal",[this,F(e)],"lessThanOrEqual").asBoolean()}greaterThan(e){return new k("greater_than",[this,F(e)],"greaterThan").asBoolean()}greaterThanOrEqual(e){return new k("greater_than_or_equal",[this,F(e)],"greaterThanOrEqual").asBoolean()}arrayConcat(e,...t){const r=[e,...t].map((s=>F(s)));return new k("array_concat",[this,...r],"arrayConcat")}arrayContains(e){return new k("array_contains",[this,F(e)],"arrayContains").asBoolean()}arrayContainsAll(e){const t=Array.isArray(e)?new ws(e.map(F),"arrayContainsAll"):e;return new k("array_contains_all",[this,t],"arrayContainsAll").asBoolean()}arrayContainsAny(e){const t=Array.isArray(e)?new ws(e.map(F),"arrayContainsAny"):e;return new k("array_contains_any",[this,t],"arrayContainsAny").asBoolean()}arrayReverse(){return new k("array_reverse",[this])}arrayLength(){return new k("array_length",[this],"arrayLength")}equalAny(e){const t=Array.isArray(e)?new ws(e.map(F),"equalAny"):e;return new k("equal_any",[this,t],"equalAny").asBoolean()}notEqualAny(e){const t=Array.isArray(e)?new ws(e.map(F),"notEqualAny"):e;return new k("not_equal_any",[this,t],"notEqualAny").asBoolean()}exists(){return new k("exists",[this],"exists").asBoolean()}charLength(){return new k("char_length",[this],"charLength")}like(e){return new k("like",[this,F(e)],"like").asBoolean()}regexContains(e){return new k("regex_contains",[this,F(e)],"regexContains").asBoolean()}regexFind(e){return new k("regex_find",[this,F(e)],"regexFind")}regexFindAll(e){return new k("regex_find_all",[this,F(e)],"regexFindAll")}regexMatch(e){return new k("regex_match",[this,F(e)],"regexMatch").asBoolean()}stringContains(e){return new k("string_contains",[this,F(e)],"stringContains").asBoolean()}startsWith(e){return new k("starts_with",[this,F(e)],"startsWith").asBoolean()}endsWith(e){return new k("ends_with",[this,F(e)],"endsWith").asBoolean()}toLower(){return new k("to_lower",[this],"toLower")}toUpper(){return new k("to_upper",[this],"toUpper")}trim(e){const t=[this];return e&&t.push(F(e)),new k("trim",t,"trim")}ltrim(e){const t=[this];return e&&t.push(F(e)),new k("ltrim",t,"ltrim")}rtrim(e){const t=[this];return e&&t.push(F(e)),new k("rtrim",t,"rtrim")}type(){return new k("type",[this])}isType(e){return new k("is_type",[this,Zs(e)],"isType").asBoolean()}stringConcat(e,...t){const r=[e,...t].map(F);return new k("string_concat",[this,...r],"stringConcat")}stringIndexOf(e){return new k("string_index_of",[this,F(e)],"stringIndexOf")}stringRepeat(e){return new k("string_repeat",[this,F(e)],"stringRepeat")}stringReplaceAll(e,t){return new k("string_replace_all",[this,F(e),F(t)],"stringReplaceAll")}stringReplaceOne(e,t){return new k("string_replace_one",[this,F(e),F(t)],"stringReplaceOne")}concat(e,...t){const r=[e,...t].map(F);return new k("concat",[this,...r],"concat")}reverse(){return new k("reverse",[this],"reverse")}arrayFilter(e,t){return new k("array_filter",[this,F(e),t],"arrayFilter")}arrayTransform(e,t){return new k("array_transform",[this,F(e),t],"arrayTransform")}arrayTransformWithIndex(e,t,r){return new k("array_transform",[this,F(e),F(t),r],"arrayTransformWithIndex")}arraySlice(e,t){const r=[this,F(e)];return t!==void 0&&r.push(F(t)),new k("array_slice",r,"arraySlice")}arrayFirst(){return new k("array_first",[this],"arrayFirst")}arrayFirstN(e){return new k("array_first_n",[this,F(e)],"arrayFirstN")}arrayLast(){return new k("array_last",[this],"arrayLast")}arrayLastN(e){return new k("array_last_n",[this,F(e)],"arrayLastN")}arrayMaximum(){return new k("maximum",[this],"arrayMaximum")}arrayMaximumN(e){return new k("maximum_n",[this,F(e)],"arrayMaximumN")}arrayMinimum(){return new k("minimum",[this],"arrayMinimum")}arrayMinimumN(e){return new k("minimum_n",[this,F(e)],"arrayMinimumN")}arrayIndexOf(e){return new k("array_index_of",[this,F(e),F("first")],"arrayIndexOf")}arrayLastIndexOf(e){return new k("array_index_of",[this,F(e),F("last")],"arrayLastIndexOf")}arrayIndexOfAll(e){return new k("array_index_of_all",[this,F(e)],"arrayIndexOfAll")}byteLength(){return new k("byte_length",[this],"byteLength")}ceil(){return new k("ceil",[this])}floor(){return new k("floor",[this])}abs(){return new k("abs",[this])}exp(){return new k("exp",[this])}mapGet(e){return new k("map_get",[this,Zs(e)],"mapGet")}mapSet(e,t,...r){const s=[this,F(e),F(t),...r.map(F)];return new k("map_set",s,"mapSet")}mapKeys(){return new k("map_keys",[this],"mapKeys")}mapValues(){return new k("map_values",[this],"mapValues")}mapEntries(){return new k("map_entries",[this],"mapEntries")}getField(e){return new k("get_field",[this,F(e)],"get_field")}count(){return gt._create("count",[this],"count")}sum(){return gt._create("sum",[this],"sum")}average(){return gt._create("average",[this],"average")}minimum(){return gt._create("minimum",[this],"minimum")}maximum(){return gt._create("maximum",[this],"maximum")}first(){return gt._create("first",[this],"first")}last(){return gt._create("last",[this],"last")}arrayAgg(){return gt._create("array_agg",[this],"arrayAgg")}arrayAggDistinct(){return gt._create("array_agg_distinct",[this],"arrayAggDistinct")}countDistinct(){return gt._create("count_distinct",[this],"countDistinct")}logicalMaximum(e,...t){const r=[e,...t];return new k("maximum",[this,...r.map(F)],"logicalMaximum")}logicalMinimum(e,...t){const r=[e,...t];return new k("minimum",[this,...r.map(F)],"minimum")}vectorLength(){return new k("vector_length",[this],"vectorLength")}cosineDistance(e){return new k("cosine_distance",[this,Ya(e)],"cosineDistance")}dotProduct(e){return new k("dot_product",[this,Ya(e)],"dotProduct")}euclideanDistance(e){return new k("euclidean_distance",[this,Ya(e)],"euclideanDistance")}unixMicrosToTimestamp(){return new k("unix_micros_to_timestamp",[this],"unixMicrosToTimestamp")}timestampToUnixMicros(){return new k("timestamp_to_unix_micros",[this],"timestampToUnixMicros")}unixMillisToTimestamp(){return new k("unix_millis_to_timestamp",[this],"unixMillisToTimestamp")}timestampToUnixMillis(){return new k("timestamp_to_unix_millis",[this],"timestampToUnixMillis")}unixSecondsToTimestamp(){return new k("unix_seconds_to_timestamp",[this],"unixSecondsToTimestamp")}timestampToUnixSeconds(){return new k("timestamp_to_unix_seconds",[this],"timestampToUnixSeconds")}timestampAdd(e,t){return new k("timestamp_add",[this,F(e),F(t)],"timestampAdd")}timestampSubtract(e,t){return new k("timestamp_subtract",[this,F(e),F(t)],"timestampSubtract")}timestampDiff(e,t){return new k("timestamp_diff",[this,i1(e),F(t)],"timestampDiff")}timestampExtract(e,t){const r=[this,F(e)];return t&&r.push(F(t)),new k("timestamp_extract",r,"timestampExtract")}documentId(){return new k("document_id",[this],"documentId")}parent(){return new k("parent",[this],"parent")}substring(e,t){const r=F(e);return new k("substring",t===void 0?[this,r]:[this,r,F(t)],"substring")}arrayGet(e){return new k("array_get",[this,F(e)],"arrayGet")}isError(){return new k("is_error",[this],"isError").asBoolean()}ifError(e){const t=new k("if_error",[this,F(e)],"ifError");return e instanceof Bn?t.asBoolean():t}isAbsent(){return new k("is_absent",[this],"isAbsent").asBoolean()}mapRemove(e){return new k("map_remove",[this,F(e)],"mapRemove")}mapMerge(e,...t){const r=F(e),s=t.map(F);return new k("map_merge",[this,r,...s],"mapMerge")}pow(e){return new k("pow",[this,F(e)])}trunc(e){return e===void 0?new k("trunc",[this]):new k("trunc",[this,F(e)],"trunc")}round(e){return e===void 0?new k("round",[this]):new k("round",[this,F(e)],"round")}collectionId(){return new k("collection_id",[this])}length(){return new k("length",[this])}ln(){return new k("ln",[this])}sqrt(){return new k("sqrt",[this])}stringReverse(){return new k("string_reverse",[this])}ifAbsent(e){return new k("if_absent",[this,F(e)],"ifAbsent")}ifNull(e){return new k("if_null",[this,F(e)],"ifNull")}coalesce(e,...t){return new k("coalesce",[this,F(e),...t.map(F)],"coalesce")}join(e){return new k("join",[this,F(e)],"join")}log10(){return new k("log10",[this])}arraySum(){return new k("sum",[this])}split(e){return new k("split",[this,F(e)])}timestampTruncate(e,t){const r=[this,F(e)];return t&&r.push(F(t)),new k("timestamp_trunc",r)}ascending(){return N3(this)}descending(){return O3(this)}as(e){return new R3(this,e,"as")}}class gt{constructor(e,t){this.name=e,this.params=t,this.exprType="AggregateFunction",this._protoValueType="ProtoValue"}static _create(e,t,r){const s=new gt(e,t);return s._methodName=r,s}as(e){return new v3(this,e,"as")}_toProto(e){return{functionValue:{name:this.name,args:this.params.map((t=>t._toProto(e)))}}}_readUserData(e){e=this._methodName?e.contextWith({methodName:this._methodName}):e,this.params.forEach((t=>t._readUserData(e)))}}class v3{constructor(e,t,r){this.aggregate=e,this.alias=t,this._methodName=r}_readUserData(e){this.aggregate._readUserData(e)}}class R3{constructor(e,t,r){this.expr=e,this.alias=t,this._methodName=r,this.exprType="AliasedExpression",this.selectable=!0}_readUserData(e){this.expr._readUserData(e)}}class ws extends mr{constructor(e,t){super(),this.Rr=e,this._methodName=t,this.expressionType="ListOfExpressions"}_toProto(e){return{arrayValue:{values:this.Rr.map((t=>t._toProto(e)))}}}_readUserData(e){this.Rr.forEach((t=>t._readUserData(e)))}}class Wr extends mr{constructor(e,t){super(),this.fieldPath=e,this._methodName=t,this.expressionType="Field",this.selectable=!0}get _fieldPath(){return this.fieldPath}get fieldName(){return this.fieldPath.canonicalString()}get alias(){return this.fieldName}get expr(){return this}geoDistance(e){return new k("geo_distance",[this,F(e)],"geoDistance")}_toProto(e){return{fieldReferenceValue:this.fieldPath.canonicalString()}}_readUserData(e){}}function to(n){return C3(n,"field")}function C3(n,e){return new Wr(typeof n=="string"?Mt===n?Xg()._internalPath:Un("field",n):n._internalPath,e)}class zr extends mr{constructor(e,t){super(),this.value=e,this._methodName=t,this.expressionType="Constant"}static _fromProto(e){const t=new zr(e,void 0);return t._protoValue=e,t}_toProto(e){return j(this._protoValue!==void 0,237),this._protoValue}_getValue(){return this._protoValue}_readUserData(e){e=this._methodName?e.contextWith({methodName:this._methodName}):e,w3(this._protoValue)||(this._protoValue=an(this.value,e))}}function Zs(n,e){return wd(n,"constant")}function wd(n,e){const t=new zr(n,e);return typeof n=="boolean"?new vd(t):t}class k extends mr{constructor(e,t,r,s){super(),this.name=e,this.params=t,this.expressionType="Function",this._optionsProto=void 0,r!==void 0&&(this._methodName=r),s!==void 0&&(this._options=s)}get _optionsUtil(){return new Xe({})}_toProto(e){const t={functionValue:{name:this.name,args:this.params.map((r=>r._toProto(e)))}};return this._optionsProto&&(t.functionValue.options=this._optionsProto),t}_readUserData(e){e=this._methodName?e.contextWith({methodName:this._methodName}):e,this.params.forEach((t=>t._readUserData(e))),this._options&&(this._optionsProto=this._optionsUtil.getOptionsProto(e,this._options))}}class Bn extends mr{get _methodName(){return this._expr._methodName}countIf(){return gt._create("count_if",[this],"countIf")}not(){return new k("not",[this],"not").asBoolean()}conditional(e,t){return new k("conditional",[this,e,t],"conditional")}ifError(e){const t=F(e),r=new k("if_error",[this,t],"ifError");return t instanceof Bn?r.asBoolean():r}_toProto(e){return this._expr._toProto(e)}_readUserData(e){this._expr._readUserData(e)}}class Ad extends Bn{constructor(e){super(),this._expr=e,this.expressionType="Function"}}class vd extends Bn{constructor(e){super(),this._expr=e,this.expressionType="Constant"}_getValue(){return this._expr._getValue()}}class P3 extends Bn{constructor(e){super(),this._expr=e,this.expressionType="Field"}}function S3(n,e){const t=[];for(const r in n)if(Object.prototype.hasOwnProperty.call(n,r)){const s=n[r];t.push(Zs(r)),t.push(F(s))}return new k("map",t,"map")}function b3(n){return(function(t,r){return new k("array",t.map((s=>F(s))),r)})(n,"array")}function N3(n){return new Rd(i1(n),"ascending","ascending")}function O3(n){return new Rd(i1(n),"descending","descending")}class Rd{constructor(e,t,r){this.expr=e,this.direction=t,this._methodName=r,this._protoValueType="ProtoValue"}_toProto(e){return{mapValue:{fields:{direction:od(this.direction),expression:this.expr._toProto(e)}}}}_readUserData(e){this.expr._readUserData(e)}}/**
 * @license
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Tt{constructor(e){this.optionsProto=void 0,{rawOptions:this.rawOptions,...this.knownOptions}=e}_readUserData(e){this.optionsProto=this._optionsUtil.getOptionsProto(e,this.knownOptions,this.rawOptions)}_toProto(e){return{name:this._name,options:this.optionsProto}}}class Cd extends Tt{get _name(){return"add_fields"}get _optionsUtil(){return new Xe({})}constructor(e,t){super(t),this.fields=e}_toProto(e){return{...super._toProto(e),args:[Js(e,this.fields)]}}_readUserData(e){super._readUserData(e),$n(this.fields,e)}}class Pd extends Tt{get _name(){return"aggregate"}get _optionsUtil(){return new Xe({})}constructor(e,t,r){super(r),this.groups=e,this.accumulators=t}_toProto(e){return{...super._toProto(e),args:[Js(e,this.accumulators),Js(e,this.groups)]}}_readUserData(e){super._readUserData(e),$n(this.groups,e),$n(this.accumulators,e)}}class Sd extends Tt{get _name(){return"distinct"}get _optionsUtil(){return new Xe({})}constructor(e,t){super(t),this.groups=e}_toProto(e){return{...super._toProto(e),args:[Js(e,this.groups)]}}_readUserData(e){super._readUserData(e),$n(this.groups,e)}}class ea extends Tt{get _name(){return"collection"}get _optionsUtil(){return new Xe({forceIndex:{serverName:"force_index"}})}constructor(e,t){super(t),this.Vr=e.startsWith("/")?e:"/"+e}_toProto(e){return{...super._toProto(e),args:[{referenceValue:this.Vr}]}}_readUserData(e){super._readUserData(e)}}class ta extends Tt{get _name(){return"collection_group"}get _optionsUtil(){return new Xe({forceIndex:{serverName:"force_index"}})}constructor(e,t){super(t),this.collectionId=e}_toProto(e){return{...super._toProto(e),args:[{referenceValue:""},{stringValue:this.collectionId}]}}_readUserData(e){super._readUserData(e)}}class o1 extends Tt{get _name(){return"database"}get _optionsUtil(){return new Xe({})}_toProto(e){return{...super._toProto(e)}}_readUserData(e){super._readUserData(e)}}class a1 extends Tt{get _name(){return"documents"}get _optionsUtil(){return new Xe({})}constructor(e,t){if(super(t),!e||e.length===0)throw new U(V.INVALID_ARGUMENT,"Empty document paths are not allowed in DocumentsSource");const r=e.map((i=>i.startsWith("/")?i:"/"+i)),s=new Set(r);if(s.size!==r.length)throw new U(V.INVALID_ARGUMENT,"Duplicate document paths are not allowed in DocumentsSource");this.dr=r,this.mr=s}_toProto(e){return{...super._toProto(e),args:this.dr.map((t=>({referenceValue:t})))}}_readUserData(e){super._readUserData(e)}}class na extends Tt{get _name(){return"where"}get _optionsUtil(){return new Xe({})}constructor(e,t){super(t),this.condition=e}_toProto(e){return{...super._toProto(e),args:[this.condition._toProto(e)]}}_readUserData(e){super._readUserData(e),$n(this.condition,e)}}class ar extends Tt{get _name(){return"limit"}get _optionsUtil(){return new Xe({})}constructor(e,t){j(!isNaN(e)&&e!==1/0&&e!==-1/0,34860),super(t),this.limit=e}_toProto(e){return{...super._toProto(e),args:[Yc(e,this.limit)]}}}class Sh extends Tt{get _name(){return"offset"}get _optionsUtil(){return new Xe({})}constructor(e,t){super(t),this.offset=e}_toProto(e){return{...super._toProto(e),args:[Yc(e,this.offset)]}}}class k3 extends Tt{get _name(){return"select"}get _optionsUtil(){return new Xe({})}constructor(e,t){super(t),this.selections=e}_toProto(e){return{...super._toProto(e),args:[Js(e,this.selections)]}}_readUserData(e){super._readUserData(e),$n(this.selections,e)}}class Zt extends Tt{get _name(){return"sort"}get _optionsUtil(){return new Xe({})}constructor(e,t){super(t),this.orderings=e}_toProto(e){return{...super._toProto(e),args:this.orderings.map((t=>t._toProto(e)))}}_readUserData(e){super._readUserData(e),$n(this.orderings,e)}}class c1 extends Tt{get _name(){return"replace_with"}get _optionsUtil(){return new Xe({})}constructor(e,t){super(t),this.map=e}_toProto(e){return{...super._toProto(e),args:[this.map._toProto(e),od(c1.pr)]}}_readUserData(e){super._readUserData(e),$n(this.map,e)}}c1.pr="full_replace";function $n(n,e){return Td(n)?n._readUserData(e):Array.isArray(n)?n.forEach((t=>t._readUserData(e))):n instanceof Map?n.forEach((t=>t._readUserData(e))):Object.values(n).forEach((t=>t._readUserData(e))),n}// Copyright 2024 Google LLC* @license
class tt{constructor(e,t,r){this.serializer=e,this.stages=t,this.listenOptions=r,this.isCorePipeline=!0}getPipelineCollection(){return ra(this)}getPipelineCollectionGroup(){return u1(this)}getPipelineCollectionId(){return D3(this)}getPipelineDocuments(){return wc(this)}getPipelineFlavor(){return(function(t){let r="exact";return t.stages.forEach(((s,i)=>{s._name!==Sd.name&&s._name!==Pd.name||(r="keyless"),s._name===k3.name&&r==="exact"&&(r="augmented"),s._name===Cd.name&&i<t.stages.length-1&&r==="exact"&&(r="augmented")})),r})(this)}getPipelineSourceType(){return On(this)}}function On(n){const e=n.stages[0];return e instanceof ea||e instanceof ta||e instanceof o1||e instanceof a1?e._name:"unknown"}function ra(n){if(On(n)==="collection")return n.stages[0].Vr}function u1(n){if(On(n)==="collection_group")return n.stages[0].collectionId}function D3(n){switch(On(n)){case"collection":return ue.fromString(ra(n)).lastSegment();case"collection_group":return u1(n);default:return}}function wc(n){if(On(n)==="documents")return n.stages[0].dr}class xs{constructor(e,t,r,s){this._db=e,this.userDataReader=t,this._userDataWriter=r,this.stages=s}wr(e,t){const r=this.userDataReader.createContext(3,e);return Td(t)?t._readUserData(r):Array.isArray(t)?t.forEach((s=>s._readUserData(r))):t.forEach((s=>s._readUserData(r))),t}where(e){const t=this.stages.map((r=>r));return this.wr("where",e),t.push(new na(e,{})),new xs(this._db,this.userDataReader,this._userDataWriter,t)}limit(e){const t=this.stages.map((r=>r));return t.push(new ar(e,{})),new xs(this._db,this.userDataReader,this._userDataWriter,t)}sort(e,...t){const r=this.stages.map((s=>s));return"orderings"in e?r.push(new Zt(this.wr("sort",e.orderings),{})):r.push(new Zt(this.wr("sort",[e,...t]),{})),new xs(this._db,this.userDataReader,this._userDataWriter,r)}br(e){return{pipeline:{stages:this.stages.map((t=>t._toProto(e)))}}}}// Copyright 2024 Google LLC* @license
class w{constructor(e,t){this.type=e,this.value=t}static vr(){return new w("ERROR",void 0)}static Sr(){return new w("UNSET",void 0)}static Dr(){return new w("NULL",Vr)}static newValue(e){return yt(e)?new w("NULL",Vr):(function(r){return!!r&&"booleanValue"in r})(e)?new w("BOOLEAN",e):Ft(e)?new w("INT",e):tr(e)?new w("DOUBLE",e):(function(r){return!!r&&"timestampValue"in r&&!!r.timestampValue})(e)?new w("TIMESTAMP",e):(function(r){return!!r&&"stringValue"in r})(e)?new w("STRING",e):(function(r){return!!r&&"bytesValue"in r})(e)?new w("BYTES",e):e.referenceValue?new w("REFERENCE",e):e.geoPointValue?new w("GEO_POINT",e):Lr(e)?new w("ARRAY",e):fo(e)?new w("VECTOR",e):rr(e)?new w("MAP",e):new w("ERROR",void 0)}Cr(){return this.type==="ERROR"||this.type==="UNSET"}Fr(){return this.type==="NULL"}}function Ls(n){if(!n.Cr())return n.value}function bd(n){return n instanceof Bn?n._expr:n}function K(n){if((n=bd(n))instanceof Wr)return new V3(n);if(n instanceof zr)return new x3(n);if(n instanceof ws)return new L3(n);if(n instanceof k){if(n.name==="add")return new U3(n);if(n.name==="subtract")return new B3(n);if(n.name==="multiply")return new $3(n);if(n.name==="divide")return new q3(n);if(n.name==="mod")return new H3(n);if(n.name==="and")return new j3(n);if(n.name==="equal")return new n9(n);if(n.name==="not_equal")return new r9(n);if(n.name==="less_than")return new s9(n);if(n.name==="less_than_or_equal")return new i9(n);if(n.name==="greater_than")return new o9(n);if(n.name==="greater_than_or_equal")return new a9(n);if(n.name==="array_concat")return new c9(n);if(n.name==="array_reverse")return new u9(n);if(n.name==="array_contains")return new l9(n);if(n.name==="array_contains_all")return new h9(n);if(n.name==="array_contains_any")return new f9(n);if(n.name==="array_length")return new d9(n);if(n.name==="array_element")return new p9(n);if(n.name==="equal_any")return new Nd(n);if(n.name==="not_equal_any")return new W3(n);if(n.name==="is_nan")return new z3(n);if(n.name==="is_not_nan")return new K3(n);if(n.name==="is_null")return new Y3(n);if(n.name==="is_not_null")return new Q3(n);if(n.name==="is_error")return new X3(n);if(n.name==="exists")return new J3(n);if(n.name==="not")return new sa(n);if(n.name==="or")return new G3(n);if(n.name==="xor")return new l1(n);if(n.name==="conditional")return new Z3(n);if(n.name==="maximum")return new e9(n);if(n.name==="minimum")return new t9(n);if(n.name==="reverse")return new m9(n);if(n.name==="replace_first")return new g9(n);if(n.name==="replace_all")return new _9(n);if(n.name==="char_length")return new y9(n);if(n.name==="byte_length")return new E9(n);if(n.name==="like")return new I9(n);if(n.name==="regex_contains")return new T9(n);if(n.name==="regex_match")return new w9(n);if(n.name==="string_contains")return new A9(n);if(n.name==="starts_with")return new v9(n);if(n.name==="ends_with")return new R9(n);if(n.name==="to_lower")return new C9(n);if(n.name==="to_upper")return new P9(n);if(n.name==="trim")return new S9(n);if(n.name==="string_concat")return new b9(n);if(n.name==="map_get")return new N9(n);if(n.name==="cosine_distance")return new O9(n);if(n.name==="dot_product")return new k9(n);if(n.name==="euclidean_distance")return new D9(n);if(n.name==="vector_length")return new V9(n);if(n.name==="unix_micros_to_timestamp")return new U9(n);if(n.name==="timestamp_to_unix_micros")return new q9(n);if(n.name==="unix_millis_to_timestamp")return new B9(n);if(n.name==="timestamp_to_unix_millis")return new H9(n);if(n.name==="unix_seconds_to_timestamp")return new $9(n);if(n.name==="timestamp_to_unix_seconds")return new j9(n);if(n.name==="timestamp_add")return new G9(n);if(n.name==="timestamp_subtract")return new W9(n)}throw new Error(`Unknown Expr : ${n}`)}class V3{constructor(e){this.expr=e}evaluate(e,t){if(this.expr.fieldName===Mt)return w.newValue({referenceValue:Io(e.serializer,t.key)});if(this.expr.fieldName==="__update_time__")return w.newValue({timestampValue:eo(e.serializer,t.version)});if(this.expr.fieldName==="__create_time__")return w.newValue({timestampValue:eo(e.serializer,t.createTime)});const r=t.data.field(this.expr._fieldPath);return r?Ho(r)?w.newValue((function(i,o){if(i.serverTimestampBehavior==="estimate")return{timestampValue:eo(i.serializer,J.fromTimestamp(Dr(o)))};if(i.serverTimestampBehavior==="previous"){const c=li(o);if(c)return c}return{nullValue:"NULL_VALUE"}})(e,r)):w.newValue(r):w.Sr()}}class x3{constructor(e){this.expr=e}evaluate(e,t){return w.newValue(this.expr._getValue())}}class L3{constructor(e){this.expr=e}evaluate(e,t){const r=this.expr.Rr.map((s=>K(s).evaluate(e,t)));return r.some((s=>s.Cr()))?w.vr():w.newValue({arrayValue:{values:r.map((s=>s.value))}})}}function Ue(n){return tr(n)?Number(n.doubleValue):Number(n.integerValue)}function Gt(n){return BigInt(n.integerValue)}const M3=BigInt("0x7fffffffffffffff"),F3=-BigInt("0x8000000000000000");class _i{constructor(e){this.expr=e}evaluate(e,t){j(this.expr.params.length>=2,24778);const r=K(this.expr.params[0]).evaluate(e,t),s=K(this.expr.params[1]).evaluate(e,t);let i=this.Or(r,s);for(const o of this.expr.params.slice(2)){const c=K(o).evaluate(e,t);i=this.Or(i,c)}return i}Or(e,t){if(e.Cr()||t.Cr())return w.vr();if(e.Fr()||t.Fr())return w.Dr();const r=e.value,s=t.value;if(!tr(r)&&!Ft(r)||!tr(s)&&!Ft(s))return w.vr();if(tr(r)||tr(s)){const i=this.Mr(r,s);return i?w.newValue(i):w.vr()}if(Ft(r)&&Ft(s)){const i=this.Nr(r,s);return i===void 0?w.vr():typeof i=="number"?w.newValue({doubleValue:i}):i<F3||i>M3?w.vr():w.newValue({integerValue:`${i}`})}return w.vr()}}function cn(n,e){return Oe(n)!==Oe(e)?"TYPE_MISMATCH":ft(n)||ft(e)?"NOT_EQ":yt(n)&&yt(e)?"EQ":yt(n)||yt(e)?"NULL":Lr(n)&&Lr(e)?(function(r,s){if(r.values?.length!==s.values?.length)return"NOT_EQ";let i=!1;for(let o=0;o<(r.values?.length??0);o++){const c=r.values[o],u=s.values[o];switch(cn(c,u)){case"EQ":break;case"NOT_EQ":case"TYPE_MISMATCH":return"NOT_EQ";case"NULL":i=!0;break;default:z(44609,{Lr:c,Br:u})}}return i?"NULL":"EQ"})(n.arrayValue,e.arrayValue):fo(n)&&fo(e)||rr(n)&&rr(e)?(function(r,s){const i=r.fields||{},o=s.fields||{};if(ho(i)!==ho(o))return"NOT_EQ";let c=!1;for(const u in i)if(i.hasOwnProperty(u)){if(o[u]===void 0)return"NOT_EQ";switch(cn(i[u],o[u])){case"NOT_EQ":case"TYPE_MISMATCH":return"NOT_EQ";case"NULL":c=!0}}return c?"NULL":"EQ"})(n.mapValue,e.mapValue):(function(r,s){return Rt(r,s,{Te:!1,Ee:!0,he:!0})})(n,e)?"EQ":"NOT_EQ"}class U3 extends _i{Nr(e,t){return Gt(e)+Gt(t)}Mr(e,t){return{doubleValue:Ue(e)+Ue(t)}}}class B3 extends _i{constructor(e){super(e),this.expr=e}Nr(e,t){return Gt(e)-Gt(t)}Mr(e,t){return{doubleValue:Ue(e)-Ue(t)}}}class $3 extends _i{constructor(e){super(e),this.expr=e}Nr(e,t){return Gt(e)*Gt(t)}Mr(e,t){return{doubleValue:Ue(e)*Ue(t)}}}class q3 extends _i{constructor(e){super(e),this.expr=e}Nr(e,t){const r=Gt(t);if(r!==BigInt(0))return Gt(e)/r}Mr(e,t){const r=Ue(t);return r===0?{doubleValue:Hs(r)?Number.NEGATIVE_INFINITY:Number.POSITIVE_INFINITY}:{doubleValue:Ue(e)/r}}}class H3 extends _i{constructor(e){super(e),this.expr=e}Nr(e,t){const r=Gt(t);if(r!==BigInt(0))return Gt(e)%r}Mr(e,t){const r=Ue(t);if(r!==0)return{doubleValue:Ue(e)%r}}}class j3{constructor(e){this.expr=e}evaluate(e,t){let r=!1,s=!1;for(const i of this.expr.params){const o=K(i).evaluate(e,t);switch(o.type){case"BOOLEAN":if(!o.value?.booleanValue)return w.newValue(Me);break;case"NULL":s=!0;break;default:r=!0}}return r?w.vr():s?w.Dr():w.newValue(lt)}}class sa{constructor(e){this.expr=e}evaluate(e,t){j(this.expr.params.length===1,9634);const r=K(this.expr.params[0]).evaluate(e,t);switch(r.type){case"BOOLEAN":return w.newValue({booleanValue:!r.value?.booleanValue});case"NULL":return w.Dr();default:return w.vr()}}}class G3{constructor(e){this.expr=e}evaluate(e,t){let r=!1,s=!1;for(const i of this.expr.params){const o=K(i).evaluate(e,t);switch(o.type){case"BOOLEAN":if(o.value?.booleanValue)return w.newValue(lt);break;case"NULL":s=!0;break;default:r=!0}}return r?w.vr():s?w.Dr():w.newValue(Me)}}class l1{constructor(e){this.expr=e}evaluate(e,t){let r=!1,s=!1;for(const i of this.expr.params){const o=K(i).evaluate(e,t);switch(o.type){case"BOOLEAN":r=l1.xor(r,!!o.value?.booleanValue);break;case"NULL":s=!0;break;default:return w.vr()}}return s?w.Dr():w.newValue({booleanValue:r})}static xor(e,t){return(e||t)&&!(e&&t)}}class Nd{constructor(e){this.expr=e}evaluate(e,t){j(this.expr.params.length===2,55094);let r=!1;const s=K(this.expr.params[0]).evaluate(e,t);switch(s.type){case"NULL":r=!0;break;case"ERROR":case"UNSET":return w.vr()}const i=K(this.expr.params[1]).evaluate(e,t);switch(i.type){case"ARRAY":break;case"NULL":r=!0;break;default:return w.vr()}if(r)return w.Dr();for(const o of i.value?.arrayValue?.values??[])switch(yt(s.value)&&yt(o)?"EQ":cn(s.value,o)){case"EQ":return w.newValue(lt);case"NOT_EQ":case"TYPE_MISMATCH":break;case"NULL":r=!0;break;default:z(44608,{value:s.value,candidate:o})}return r?w.Dr():w.newValue(Me)}}class W3{constructor(e){this.expr=e}evaluate(e,t){return new sa(new k("not",[new k("equal_any",this.expr.params)])).evaluate(e,t)}}class z3{constructor(e){this.expr=e}evaluate(e,t){j(this.expr.params.length===1,23322);const r=K(this.expr.params[0]).evaluate(e,t);switch(r.type){case"INT":return w.newValue(Me);case"DOUBLE":return w.newValue({booleanValue:isNaN(Ue(r.value))});case"NULL":return w.Dr();default:return w.vr()}}}class K3{constructor(e){this.expr=e}evaluate(e,t){return j(this.expr.params.length===1,50406),new sa(new k("not",[new k("is_nan",this.expr.params)])).evaluate(e,t)}}class Y3{constructor(e){this.expr=e}evaluate(e,t){switch(j(this.expr.params.length===1,23123),K(this.expr.params[0]).evaluate(e,t).type){case"NULL":return w.newValue(lt);case"UNSET":case"ERROR":return w.vr();default:return w.newValue(Me)}}}class Q3{constructor(e){this.expr=e}evaluate(e,t){return j(this.expr.params.length===1,23167),new sa(new k("not",[new k("is_null",this.expr.params)])).evaluate(e,t)}}class X3{constructor(e){this.expr=e}evaluate(e,t){return j(this.expr.params.length===1,5228),K(this.expr.params[0]).evaluate(e,t).type==="ERROR"?w.newValue(lt):w.newValue(Me)}}class J3{constructor(e){this.expr=e}evaluate(e,t){switch(j(this.expr.params.length===1,6877),K(this.expr.params[0]).evaluate(e,t).type){case"ERROR":return w.vr();case"UNSET":return w.newValue(Me);default:return w.newValue(lt)}}}class Z3{constructor(e){this.expr=e}evaluate(e,t){j(this.expr.params.length===3,11706);const r=K(this.expr.params[0]).evaluate(e,t);switch(r.type){case"BOOLEAN":return r.value?.booleanValue?K(this.expr.params[1]).evaluate(e,t):K(this.expr.params[2]).evaluate(e,t);case"NULL":return K(this.expr.params[2]).evaluate(e,t);default:return w.vr()}}}class e9{constructor(e){this.expr=e}evaluate(e,t){const r=this.expr.params.map((i=>K(i).evaluate(e,t)));let s;for(const i of r)switch(i.type){case"ERROR":case"UNSET":case"NULL":continue;default:s=s===void 0||ht(i.value,s.value)>0?i:s}return s===void 0?w.Dr():s}}class t9{constructor(e){this.expr=e}evaluate(e,t){const r=this.expr.params.map((i=>K(i).evaluate(e,t)));let s;for(const i of r)switch(i.type){case"ERROR":case"UNSET":case"NULL":continue;default:s=s===void 0||ht(i.value,s.value)<0?i:s}return s===void 0?w.Dr():s}}class Kr{constructor(e){this.expr=e}evaluate(e,t){j(this.expr.params.length===2,31033,`${this.expr.name}() function should have exactly 2 params`);const r=K(this.expr.params[0]).evaluate(e,t);switch(r.type){case"ERROR":case"UNSET":return w.vr()}const s=K(this.expr.params[1]).evaluate(e,t);switch(s.type){case"ERROR":case"UNSET":return w.vr()}return this.Ur(r,s)}}class n9 extends Kr{constructor(e){super(e),this.expr=e}Ur(e,t){if(e.Fr()&&t.Fr())return w.newValue(lt);if(e.Fr()||t.Fr()||ft(e.value)||ft(t.value)||Oe(e.value)!==Oe(t.value))return w.newValue(Me);switch(cn(e.value,t.value)){case"EQ":return w.newValue(lt);case"NOT_EQ":return w.newValue(Me);case"NULL":return w.Dr();default:z(44615,{left:e,right:t})}}}class r9 extends Kr{constructor(e){super(e),this.expr=e}Ur(e,t){switch(cn(e.value,t.value)){case"EQ":return w.newValue(Me);case"NOT_EQ":case"TYPE_MISMATCH":return w.newValue(lt);case"NULL":return w.Dr();default:z(44614,{left:e,right:t})}}}class s9 extends Kr{constructor(e){super(e),this.expr=e}Ur(e,t){return Oe(e.value)!==Oe(t.value)||ft(e.value)||ft(t.value)?w.newValue(Me):w.newValue({booleanValue:ht(e.value,t.value)<0})}}class i9 extends Kr{constructor(e){super(e),this.expr=e}Ur(e,t){return Oe(e.value)!==Oe(t.value)||ft(e.value)||ft(t.value)?w.newValue(Me):cn(e.value,t.value)==="EQ"?w.newValue(lt):w.newValue({booleanValue:ht(e.value,t.value)<0})}}class o9 extends Kr{constructor(e){super(e),this.expr=e}Ur(e,t){return Oe(e.value)!==Oe(t.value)||ft(e.value)||ft(t.value)?w.newValue(Me):w.newValue({booleanValue:ht(e.value,t.value)>0})}}class a9 extends Kr{constructor(e){super(e),this.expr=e}Ur(e,t){return Oe(e.value)!==Oe(t.value)||ft(e.value)||ft(t.value)?w.newValue(Me):cn(e.value,t.value)==="EQ"?w.newValue(lt):w.newValue({booleanValue:ht(e.value,t.value)>0})}}class c9{constructor(e){this.expr=e}evaluate(e,t){throw new Error("Unimplemented")}}class u9{constructor(e){this.expr=e}evaluate(e,t){j(this.expr.params.length===1,216);const r=K(this.expr.params[0]).evaluate(e,t);switch(r.type){case"NULL":return w.Dr();case"ARRAY":{const s=r.value.arrayValue?.values??[];return w.newValue({arrayValue:{values:[...s].reverse()}})}default:return w.vr()}}}class l9{constructor(e){this.expr=e}evaluate(e,t){return j(this.expr.params.length===2,52884),new Nd(new k("eq_any",[this.expr.params[1],this.expr.params[0]])).evaluate(e,t)}}class h9{constructor(e){this.expr=e}evaluate(e,t){j(this.expr.params.length===2,1392);let r=!1;const s=K(this.expr.params[0]).evaluate(e,t);switch(s.type){case"ARRAY":break;case"NULL":r=!0;break;default:return w.vr()}const i=K(this.expr.params[1]).evaluate(e,t);switch(i.type){case"ARRAY":break;case"NULL":r=!0;break;default:return w.vr()}if(r)return w.Dr();const o=i.value?.arrayValue?.values??[],c=s.value?.arrayValue?.values??[];for(const u of o){let l=!1;r=!1;for(const p of c){switch(yt(u)&&yt(p)?"EQ":cn(u,p)){case"EQ":l=!0;break;case"NOT_EQ":case"TYPE_MISMATCH":break;case"NULL":r=!0;break;default:z(44613,{value:p,search:u})}if(l)break}if(!l)return w.newValue(Me)}return w.newValue(lt)}}class f9{constructor(e){this.expr=e}evaluate(e,t){j(this.expr.params.length===2,2680);let r=!1;const s=K(this.expr.params[0]).evaluate(e,t);switch(s.type){case"ARRAY":break;case"NULL":r=!0;break;default:return w.vr()}const i=K(this.expr.params[1]).evaluate(e,t);switch(i.type){case"ARRAY":break;case"NULL":r=!0;break;default:return w.vr()}if(r)return w.Dr();const o=i.value?.arrayValue?.values??[],c=s.value?.arrayValue?.values??[];for(const u of c)for(const l of o)switch(yt(u)&&yt(l)?"EQ":cn(u,l)){case"EQ":return w.newValue(lt);case"NOT_EQ":case"TYPE_MISMATCH":break;case"NULL":r=!0;break;default:z(44608,{value:u,search:l})}return r?w.Dr():w.newValue(Me)}}class d9{constructor(e){this.expr=e}evaluate(e,t){j(this.expr.params.length===1,38605);const r=K(this.expr.params[0]).evaluate(e,t);switch(r.type){case"NULL":return w.Dr();case"ARRAY":return w.newValue({integerValue:`${r.value?.arrayValue?.values?.length??0}`});default:return w.vr()}}}class p9{constructor(e){this.expr=e}evaluate(e,t){throw new Error("Unimplemented")}}class m9{constructor(e){this.expr=e}evaluate(e,t){j(this.expr.params.length===1,1508);const r=K(this.expr.params[0]).evaluate(e,t);switch(r.type){case"NULL":return w.Dr();case"BYTES":{const s=r.value?.bytesValue;if(typeof s=="string"){const i=Ne.fromBase64String(s).toUint8Array();return i.reverse(),w.newValue({bytesValue:Ne.fromUint8Array(i).toBase64()})}return w.newValue({bytesValue:new Uint8Array(s).reverse()})}case"STRING":{const s=r.value?.stringValue,i=new Intl.__PRIVATE_Segmenter(void 0,{granularity:"grapheme"}).segment(s),o=Array.from(i,(c=>c.segment)).reverse();return w.newValue({stringValue:o.join("")})}default:return w.vr()}}}class g9{constructor(e){this.expr=e}evaluate(e,t){throw new Error("Unimplemented")}}class _9{constructor(e){this.expr=e}evaluate(e,t){throw new Error("Unimplemented")}}class y9{constructor(e){this.expr=e}evaluate(e,t){j(this.expr.params.length===1,19400);const r=K(this.expr.params[0]).evaluate(e,t);switch(r.type){case"NULL":return w.Dr();case"STRING":{const s=(function(o){let c=0;for(let u=0;u<o.length;u++){const l=o.codePointAt(u);if(l===void 0)return;if(l<=65535)if(l>=55296&&l<=57343)if(l<=56319){const p=o.codePointAt(u+1);p!==void 0&&p>=56320&&p<=57343?(c+=1,u++):c+=1}else c+=1;else c+=1;else{if(!(l<=1114111))return;c+=1,u++}}return c})(r.value.stringValue);return s===void 0?w.vr():w.newValue({integerValue:s})}default:return w.vr()}}}class E9{constructor(e){this.expr=e}evaluate(e,t){j(this.expr.params.length===1,8486);const r=K(this.expr.params[0]).evaluate(e,t);switch(r.type){case"BYTES":{const s=r.value?.bytesValue;return typeof s=="string"?w.newValue({integerValue:Ne.fromBase64String(s).toUint8Array().length}):w.newValue({integerValue:new Uint8Array(s).length})}case"STRING":{const s=(function(o){let c=0;for(let u=0;u<o.length;u++){const l=o.codePointAt(u);if(l===void 0)return;if(l>=55296&&l<=57343){if(!(l<=56319))return;{const p=o.codePointAt(u+1);if(p===void 0||!(p>=56320&&p<=57343))return;c+=4,u++}}else if(l<=127)c+=1;else if(l<=2047)c+=2;else if(l<=65535)c+=3;else{if(!(l<=1114111))return;c+=4,u++}}return c})(r.value?.stringValue);return s===void 0?w.vr():w.newValue({integerValue:s})}case"NULL":return w.Dr();default:return w.vr()}}}class Yr{constructor(e){this.expr=e}evaluate(e,t){j(this.expr.params.length===2,39773,`${this.expr.name}() function should have exactly two parameters`);let r=!1;const s=K(this.expr.params[0]).evaluate(e,t);switch(s.type){case"STRING":break;case"NULL":r=!0;break;default:return w.vr()}const i=K(this.expr.params[1]).evaluate(e,t);switch(i.type){case"STRING":break;case"NULL":r=!0;break;default:return w.vr()}return r?w.Dr():this.kr(s.value?.stringValue,i.value?.stringValue)}}class I9 extends Yr{kr(e,t){try{const r=(function(o){let c="";for(let u=0;u<o.length;u++){const l=o.charAt(u);switch(l){case"_":c+=".";break;case"%":c+=".*";break;case"\\":case".":case"*":case"?":case"+":case"^":case"$":case"|":case"(":case")":case"[":case"]":case"{":case"}":c+="\\"+l;break;default:c+=l}}return"^"+c+"$"})(t),s=$s.compile(r);return w.newValue({booleanValue:s.matches(e)})}catch(r){return Ot(`Invalid LIKE pattern converted to regex: ${t}, returning error. Error: ${r}`),w.vr()}}}class T9 extends Yr{kr(e,t){try{const r=$s.compile(t);return w.newValue({booleanValue:r.matcher(e).find()})}catch{return Ot(`Invalid regex pattern found in regex_contains: ${t}, returning error`),w.vr()}}}class w9 extends Yr{kr(e,t){try{return w.newValue({booleanValue:$s.compile(t).matches(e)})}catch{return Ot(`Invalid regex pattern found in regex_match: ${t}, returning error`),w.vr()}}}class A9 extends Yr{kr(e,t){return w.newValue({booleanValue:e.includes(t)})}}class v9 extends Yr{kr(e,t){return w.newValue({booleanValue:e.startsWith(t)})}}class R9 extends Yr{kr(e,t){return w.newValue({booleanValue:e.endsWith(t)})}}class C9{constructor(e){this.expr=e}evaluate(e,t){j(this.expr.params.length===1,29079);const r=K(this.expr.params[0]).evaluate(e,t);switch(r.type){case"STRING":return w.newValue({stringValue:r.value?.stringValue?.toLowerCase()});case"NULL":return w.Dr();default:return w.vr()}}}class P9{constructor(e){this.expr=e}evaluate(e,t){j(this.expr.params.length===1,60487);const r=K(this.expr.params[0]).evaluate(e,t);switch(r.type){case"STRING":return w.newValue({stringValue:r.value?.stringValue?.toUpperCase()});case"NULL":return w.Dr();default:return w.vr()}}}class S9{constructor(e){this.expr=e}evaluate(e,t){j(this.expr.params.length===1,28544);const r=K(this.expr.params[0]).evaluate(e,t);switch(r.type){case"STRING":return w.newValue({stringValue:r.value?.stringValue?.trim()});case"NULL":return w.Dr();default:return w.vr()}}}class b9{constructor(e){this.expr=e}evaluate(e,t){const r=this.expr.params.map((o=>K(o).evaluate(e,t)));let s="",i=!1;for(const o of r)switch(o.type){case"STRING":s+=o.value.stringValue;break;case"NULL":i=!0;break;default:return w.vr()}return i?w.Dr():w.newValue({stringValue:s})}}class N9{constructor(e){this.expr=e}evaluate(e,t){j(this.expr.params.length===2,4483);const r=K(this.expr.params[0]).evaluate(e,t);switch(r.type){case"UNSET":return w.Sr();case"MAP":break;default:return w.vr()}const s=K(this.expr.params[1]).evaluate(e,t);if(s.type!=="STRING")return w.vr();const i=r.value?.mapValue?.fields?.[s.value?.stringValue];return i===void 0?w.Sr():w.newValue(i)}}class h1{constructor(e){this.expr=e}evaluate(e,t){j(this.expr.params.length===2,25231,`${this.expr.name}() function should have exactly 2 params`);let r=!1;const s=K(this.expr.params[0]).evaluate(e,t);switch(s.type){case"VECTOR":break;case"NULL":r=!0;break;default:return w.vr()}const i=K(this.expr.params[1]).evaluate(e,t);switch(i.type){case"VECTOR":break;case"NULL":r=!0;break;default:return w.vr()}if(r)return w.Dr();const o=mc(s.value),c=mc(i.value);if(o===void 0||c===void 0||o.values?.length!==c.values?.length)return w.vr();const u=this.qr(o,c);return u===void 0||isNaN(u)?w.vr():w.newValue({doubleValue:u})}}class O9 extends h1{qr(e,t){const r=e?.values??[],s=t?.values??[];if(r.length===0)return;let i=0,o=0,c=0;for(let l=0;l<r.length;l++){if(!Fn(r[l])||!Fn(s[l]))return;const p=Ue(r[l]),g=Ue(s[l]);i+=p*g,o+=p*p,c+=g*g}const u=Math.sqrt(o)*Math.sqrt(c);if(u!==0)return 1-Math.max(-1,Math.min(1,i/u))}}class k9 extends h1{qr(e,t){const r=e?.values??[],s=t?.values??[];if(r.length===0)return 0;let i=0;for(let o=0;o<r.length;o++){if(!Fn(r[o])||!Fn(s[o]))return;i+=Ue(r[o])*Ue(s[o])}return i}}class D9 extends h1{qr(e,t){const r=e?.values??[],s=t?.values??[];if(r.length===0)return 0;let i=0;for(let o=0;o<r.length;o++){if(!Fn(r[o])||!Fn(s[o]))return;const c=Ue(r[o]),u=Ue(s[o]);i+=Math.pow(c-u,2)}return Math.sqrt(i)}}class V9{constructor(e){this.expr=e}evaluate(e,t){j(this.expr.params.length===1,39044);const r=K(this.expr.params[0]).evaluate(e,t);switch(r.type){case"VECTOR":{const s=mc(r.value);return w.newValue({integerValue:s?.values?.length??0})}case"NULL":return w.Dr();default:return w.vr()}}}const ei=BigInt(-62135596800),ti=BigInt(253402300799),wo=BigInt(1e3),kn=BigInt(1e6),x9=ei*wo,L9=ti*wo+BigInt(999),M9=ei*kn,F9=ti*kn+BigInt(999999);function f1(n){return n>=M9&&n<=F9}function Od(n){return n>=ei&&n<=ti}function ni(n,e){const t=BigInt(n);return!(t<ei||t>ti)&&!(e<0||e>=1e9)&&(t!==ei||e===0)&&!(t===ti&&e>999999999)}function kd(n,e){return e<0?{seconds:n-1,nanos:e+1e9}:{seconds:n,nanos:e}}function d1(n){return BigInt(n.seconds)*kn+BigInt(Math.trunc(n.nanoseconds/1e3))}class p1{constructor(e){this.expr=e}evaluate(e,t){j(this.expr.params.length===1,49262,`${this.expr.name}() function should have exactly one parameter`);const r=K(this.expr.params[0]).evaluate(e,t);switch(r.type){case"INT":return this.toTimestamp(BigInt(r.value.integerValue));case"NULL":return w.Dr();default:return w.vr()}}}class U9 extends p1{toTimestamp(e){if(!f1(e))return w.vr();let t=Number(e/kn),r=Number(e%kn*BigInt(1e3));const s=kd(t,r);return t=s.seconds,r=s.nanos,ni(t,r)?w.newValue({timestampValue:{seconds:t,nanos:r}}):w.vr()}}class B9 extends p1{toTimestamp(e){if(!(function(o){return o>=x9&&o<=L9})(e))return w.vr();let t=Number(e/wo),r=Number(e%wo*BigInt(1e6));const s=kd(t,r);return t=s.seconds,r=s.nanos,ni(t,r)?w.newValue({timestampValue:{seconds:t,nanos:r}}):w.vr()}}class $9 extends p1{toTimestamp(e){if(!Od(e))return w.vr();const t=Number(e);return w.newValue({timestampValue:{seconds:t,nanos:0}})}}class m1{constructor(e){this.expr=e}evaluate(e,t){j(this.expr.params.length===1,1265,`${this.expr.name}() function should have exactly one parameter`);const r=K(this.expr.params[0]).evaluate(e,t);switch(r.type){case"TIMESTAMP":break;case"NULL":return w.Dr();default:return w.vr()}const s=Zc(r.value.timestampValue);return ni(s.seconds,s.nanoseconds)?this.$r(s):w.vr()}}class q9 extends m1{$r(e){const t=d1(e);return f1(t)?w.newValue({integerValue:`${t.toString()}`}):w.vr()}}class H9 extends m1{$r(e){const t=d1(e),r=t/BigInt(1e3),s=t%BigInt(1e3);return r>BigInt(0)||s===BigInt(0)?w.newValue({integerValue:r.toString()}):w.newValue({integerValue:(r-BigInt(1)).toString()})}}class j9 extends m1{$r(e){const t=BigInt(e.seconds);return Od(t)?w.newValue({integerValue:t.toString()}):w.vr()}}class Dd{constructor(e){this.expr=e}evaluate(e,t){j(this.expr.params.length===3,2775,`${this.expr.name}() function should have exactly 3 parameters`);let r=!1;const s=K(this.expr.params[0]).evaluate(e,t);switch(s.type){case"TIMESTAMP":break;case"NULL":r=!0;break;default:return w.vr()}const i=K(this.expr.params[1]).evaluate(e,t);let o;switch(i.type){case"STRING":if(o=(function(ce){switch(ce){case"microsecond":return"microsecond";case"millisecond":return"millisecond";case"second":return"second";case"minute":return"minute";case"hour":return"hour";case"day":return"day";default:return}})(i.value.stringValue),o===void 0)return w.vr();break;case"NULL":r=!0;break;default:return w.vr()}const c=K(this.expr.params[2]).evaluate(e,t);switch(c.type){case"INT":break;case"NULL":r=!0;break;default:return w.vr()}if(r)return w.Dr();const u=BigInt(c.value.integerValue);let l;try{switch(o){case"microsecond":l=u;break;case"millisecond":l=u*BigInt(1e3);break;case"second":l=u*BigInt(1e6);break;case"minute":l=u*BigInt(6e7);break;case"hour":l=u*BigInt(36e8);break;case"day":l=u*BigInt(864e8);break;default:return w.vr()}if(o!=="microsecond"&&u!==BigInt(0)&&l/u!==BigInt(this.Kr(o)))return w.vr()}catch(Y){return Ot(`Error during timestamp arithmetic: ${Y}`),w.vr()}const p=Zc(s.value.timestampValue);if(!ni(p.seconds,p.nanoseconds))return w.vr();const g=d1(p),T=this.Wr(g,l);if(!f1(T))return w.vr();const b=Number(T/kn),O=T%kn,L=Number((O<0?O+kn:O)*BigInt(1e3)),M=O<0?b-1:b;return ni(M,L)?w.newValue({timestampValue:{seconds:M,nanos:L}}):w.vr()}Kr(e){switch(e){case"millisecond":return 1e3;case"second":return 1e6;case"minute":return 6e7;case"hour":return 36e8;case"day":return 864e8;default:return 1}}}class G9 extends Dd{Wr(e,t){return e+t}}class W9 extends Dd{Wr(e,t){return e-t}}function ri(n){if((n=bd(n))instanceof Wr)return`fld(${n.fieldName})`;if(n instanceof zr)return`cst(${(function(t){return t===null?"null":typeof t=="number"?t.toString():typeof t=="string"?`"${t}"`:t instanceof Ie?`ref(${t.path})`:t instanceof ut?`vec(${JSON.stringify(t)})`:JSON.stringify(t)})(n.value)})`;if(n instanceof k)return`fn(${n.name},[${n.params.map(ri).join(",")}])`;if(n.expressionType==="ListOfExpressions")return`list([${n.Rr.map(ri).join(",")}])`;throw new Error(`Unrecognized expr ${JSON.stringify(n,null,2)}`)}function z9(n){if(n instanceof Cd)return`${n._name}(${Hi(n.fields)})`;if(n instanceof Pd){let e=`${n._name}(${Hi(n.accumulators)})`;return n.groups.size>0&&(e+=`grouping(${Hi(n.groups)})`),e}if(n instanceof Sd)return`${n._name}(${Hi(n.groups)})`;if(n instanceof ea)return`${n._name}(${n.Vr})`;if(n instanceof ta)return`${n._name}(${n.collectionId})`;if(n instanceof o1)return`${n._name}()`;if(n instanceof a1)return`${n._name}(${n.dr.sort()})`;if(n instanceof na)return`${n._name}(${ri(n.condition)})`;if(n instanceof ar)return`${n._name}(${n.limit})`;if(n instanceof Zt)return`${n._name}(${(function(t){return t.map((r=>`${ri(r.expr)}${r.direction}`)).join(",")})(n.orderings)})`;throw new Error(`Unrecognized stage ${n._name}`)}function Hi(n){return`${Array.from(n.entries()).sort().map((([e,t])=>`${e}=${ri(t)}`)).join(",")}`}function tn(n){return n.stages.map((e=>z9(e))).join("|")}function Vd(n,e){return tn(n)===tn(e)}function Ve(n){return n instanceof tt}function bh(n){return Ve(n)?tn(n):Ds(n)}function xd(n){return Ve(n)?tn(n):(function(t){return`${Bf($t(t))}|lt:${t.limitType}`})(n)}function ia(n,e){return n instanceof tt&&e instanceof tt?Vd(n,e):!(n instanceof tt&&!(e instanceof tt)||!(n instanceof tt)&&e instanceof tt)&&wg(n,e)}function Ld(n){return er(n)?tn(n):Bf(n)}function Md(n,e){return n instanceof tt&&e instanceof tt?Vd(n,e):!(n instanceof tt&&!(e instanceof tt)||!(n instanceof tt)&&e instanceof tt)&&$f(n,e)}function K9(n,e){const t=(function(s){let i=!1;const o=[];for(const c of s)if(c instanceof Zt)if(i=!0,c.orderings.some((u=>u.expr instanceof Wr&&u.expr.fieldName===Mt)))o.push(c);else{const u=c.orderings.map((l=>l));u.push(to(Mt).ascending()),o.push(new Zt(u,{}))}else c instanceof ar&&(i||(o.push(new Zt([to(Mt).ascending()],{})),i=!0)),o.push(c);return i||o.push(new Zt([to(Mt).ascending()],{})),o})(n.stages);if(n.userDataReader){const r=n.userDataReader.createContext(3,"toCorePipeline");t.forEach((s=>s._readUserData(r)))}return new tt(n.userDataReader.serializer,t,e)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Y9{constructor(e,t,r,s){this.batchId=e,this.localWriteTime=t,this.baseMutations=r,this.mutations=s}applyToRemoteDocument(e,t){const r=t.mutationResults;for(let s=0;s<this.mutations.length;s++){const i=this.mutations[s];i.key.isEqual(e.key)&&sg(i,e,r[s])}}applyToLocalView(e,t){for(const r of this.baseMutations)r.key.isEqual(e.key)&&(t=Os(r,e,t,this.localWriteTime));for(const r of this.mutations)r.key.isEqual(e.key)&&(t=Os(r,e,t,this.localWriteTime));return t}applyToLocalDocumentSet(e,t){const r=Kf();return this.mutations.forEach((s=>{const i=e.get(s.key),o=i.overlayedDocument;let c=this.applyToLocalView(o,i.mutatedFields);c=t.has(s.key)?null:c;const u=kf(o,c);u!==null&&r.set(s.key,u),o.isValidDocument()||o.convertToNoDocument(J.min())})),r}keys(){return this.mutations.reduce(((e,t)=>e.add(t.key)),re())}isEqual(e){return this.batchId===e.batchId&&kr(this.mutations,e.mutations,((t,r)=>ah(t,r)))&&kr(this.baseMutations,e.baseMutations,((t,r)=>ah(t,r)))}}class g1{constructor(e,t,r,s){this.batch=e,this.commitVersion=t,this.mutationResults=r,this.docVersions=s}static from(e,t,r){j(e.mutations.length===r.length,58842,{Qr:e.mutations.length,Gr:r.length});let s=(function(){return Pg})();const i=e.mutations;for(let o=0;o<i.length;o++)s=s.insert(i[o].key,r[o].version);return new g1(e,t,r,s)}}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Q9{constructor(e,t){this.largestBatchId=e,this.mutation=t}getKey(){return this.mutation.key}isEqual(e){return e!==null&&this.mutation===e.mutation}toString(){return`Overlay{
      largestBatchId: ${this.largestBatchId},
      mutation: ${this.mutation.toString()}
    }`}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class en{constructor(e,t,r,s,i=J.min(),o=J.min(),c=Ne.EMPTY_BYTE_STRING,u=null){this.target=e,this.targetId=t,this.purpose=r,this.sequenceNumber=s,this.snapshotVersion=i,this.lastLimboFreeSnapshotVersion=o,this.resumeToken=c,this.expectedCount=u}withSequenceNumber(e){return new en(this.target,this.targetId,this.purpose,e,this.snapshotVersion,this.lastLimboFreeSnapshotVersion,this.resumeToken,this.expectedCount)}withResumeToken(e,t){return new en(this.target,this.targetId,this.purpose,this.sequenceNumber,t,this.lastLimboFreeSnapshotVersion,e,null)}withExpectedCount(e){return new en(this.target,this.targetId,this.purpose,this.sequenceNumber,this.snapshotVersion,this.lastLimboFreeSnapshotVersion,this.resumeToken,e)}withLastLimboFreeSnapshotVersion(e){return new en(this.target,this.targetId,this.purpose,this.sequenceNumber,this.snapshotVersion,e,this.resumeToken,this.expectedCount)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class X9{constructor(e){this.zr=e}}function J9(n){const e=jg({parent:n.parent,structuredQuery:n.structuredQuery});return n.limitType==="LAST"?yo(e,e.limit,"L"):e}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Z9{constructor(){this.Hi=new e8}addToCollectionParentIndex(e,t){return this.Hi.add(t),x.resolve()}getCollectionParents(e,t){return x.resolve(this.Hi.getEntries(t))}addFieldIndex(e,t){return x.resolve()}deleteFieldIndex(e,t){return x.resolve()}deleteAllFieldIndexes(e){return x.resolve()}createTargetIndexes(e,t){return x.resolve()}getDocumentsMatchingTarget(e,t){return x.resolve(null)}getIndexType(e,t){return x.resolve(0)}getFieldIndexes(e,t){return x.resolve([])}getNextCollectionGroupToUpdate(e){return x.resolve(null)}getMinOffset(e,t){return x.resolve(xn.min())}getMinOffsetFromCollectionGroup(e,t){return x.resolve(xn.min())}updateCollectionGroup(e,t,r){return x.resolve()}updateIndexEntries(e,t){return x.resolve()}}class e8{constructor(){this.index={}}add(e){const t=e.lastSegment(),r=e.popLast(),s=this.index[t]||new be(ue.comparator),i=!s.has(r);return this.index[t]=s.add(r),i}has(e){const t=e.lastSegment(),r=e.popLast(),s=this.index[t];return s&&s.has(r)}getEntries(e){return(this.index[e]||new be(ue.comparator)).toArray()}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class qn{constructor(e){this.Ds=e}next(){return this.Ds+=2,this.Ds}static xs(){return new qn(0)}static Cs(){return new qn(-1)}}// Copyright 2024 Google LLC* @license
function Fd(n,e){let t=e;for(const r of n.stages)t=n8({serializer:n.serializer,serverTimestampBehavior:n.listenOptions?.serverTimestampBehavior},r,t);return t}function oa(n,e){return Fd(n,[e]).length>0}function t8(n,e){return Ve(n)?oa(n,e):Yo(n,e)}function n8(n,e,t){if(e instanceof ea)return(function(s,i,o){return o.filter((c=>c.isFoundDocument()&&`/${c.key.getCollectionPath().canonicalString()}`===i.Vr))})(0,e,t);if(e instanceof na)return(function(s,i,o){return o.filter((c=>{const u=Ls(K(i.condition).evaluate(s,c));return u!==void 0&&Rt(u,lt)}))})(n,e,t);if(e instanceof ta)return(function(s,i,o){return o.filter((c=>c.isFoundDocument()&&c.key.getCollectionPath().lastSegment()===i.collectionId))})(0,e,t);if(e instanceof o1)return(function(s,i,o){return o.filter((c=>c.isFoundDocument()))})(0,0,t);if(e instanceof a1)return(function(s,i,o){return o.filter((c=>c.isFoundDocument()&&i.mr.has(c.key.path.toStringWithLeadingSlash())))})(0,e,t);if(e instanceof ar)return(function(s,i,o){return o.slice(0,i.limit)})(0,e,t);if(e instanceof Zt)return(function(s,i,o){const c=i.orderings.map((u=>({ks:K(u.expr),direction:u.direction})));return[...o].sort(((u,l)=>{for(const{ks:p,direction:g}of c){const T=Ls(p.evaluate(s,u)),b=Ls(p.evaluate(s,l)),O=ht(T??Vr,b??Vr);if(O!==0)return g==="ascending"?O:-O}return 0}))})(n,e,t);throw new Error(`Unknown stage: ${e._name}`)}function Ac(n){const e=(function(r){for(let s=r.stages.length-1;s>=0;s--){const i=r.stages[s];if(i instanceof Zt)return i.orderings}throw new Error("Pipeline must contain at least one Sort stage")})(n);return(t,r)=>{for(const s of e){const i=Ls(K(s.expr).evaluate({serializer:n.serializer},t)),o=Ls(K(s.expr).evaluate({serializer:n.serializer},r)),c=ht(i||Vr,o||Vr);if(c!==0)return s.direction==="ascending"?c:-c}return 0}}function Qa(n){for(let e=n.stages.length-1;e>=0;e--){const t=n.stages[e];if(t instanceof ar)return{limit:t.limit}}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class r8{constructor(){this.changes=new pr((e=>e.toString()),((e,t)=>e.isEqual(t))),this.changesApplied=!1}addEntry(e){this.assertNotApplied(),this.changes.set(e.key,e)}removeEntry(e,t){this.assertNotApplied(),this.changes.set(e,We.newInvalidDocument(e).setReadTime(t))}getEntry(e,t){this.assertNotApplied();const r=this.changes.get(t);return r!==void 0?x.resolve(r):this.getFromCache(e,t)}getEntries(e,t){return this.getAllFromCache(e,t)}apply(e){return this.assertNotApplied(),this.changesApplied=!0,this.applyChanges(e)}assertNotApplied(){}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *//**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class s8{constructor(e,t){this.overlayedDocument=e,this.mutatedFields=t}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class i8{constructor(e,t,r,s){this.remoteDocumentCache=e,this.mutationQueue=t,this.documentOverlayCache=r,this.indexManager=s}getDocument(e,t){let r=null;return this.documentOverlayCache.getOverlay(e,t).next((s=>(r=s,this.remoteDocumentCache.getEntry(e,t)))).next((s=>(r!==null&&Os(r.mutation,s,_t.empty(),ge.now()),s)))}getDocuments(e,t){return this.remoteDocumentCache.getEntries(e,t).next((r=>this.getLocalViewOfDocuments(e,r,re()).next((()=>r))))}getLocalViewOfDocuments(e,t,r=re()){const s=vn();return this.populateOverlays(e,s,t).next((()=>this.computeViews(e,t,s,r).next((i=>{let o=Tr();return i.forEach(((c,u)=>{o=o.insert(c,u.overlayedDocument)})),o}))))}getOverlayedDocuments(e,t){const r=vn();return this.populateOverlays(e,r,t).next((()=>this.computeViews(e,t,r,re())))}populateOverlays(e,t,r){const s=[];return r.forEach((i=>{t.has(i)||s.push(i)})),this.documentOverlayCache.getOverlays(e,s).next((i=>{i.forEach(((o,c)=>{t.set(o,c)}))}))}computeViews(e,t,r,s){let i=at();const o=Vs(),c=(function(){return Vs()})();return t.forEach(((u,l)=>{const p=r.get(l.key);s.has(l.key)&&(p===void 0||p.mutation instanceof Wn)?i=i.insert(l.key,l):p!==void 0?(o.set(l.key,p.mutation.getFieldMask()),Os(p.mutation,l,p.mutation.getFieldMask(),ge.now())):o.set(l.key,_t.empty())})),this.recalculateAndSaveOverlays(e,i).next((u=>(u.forEach(((l,p)=>o.set(l,p))),t.forEach(((l,p)=>c.set(l,new s8(p,o.get(l)??null)))),c)))}recalculateAndSaveOverlays(e,t){const r=Vs();let s=new _e(((o,c)=>o-c)),i=re();return this.mutationQueue.getAllMutationBatchesAffectingDocumentKeys(e,t).next((o=>{for(const c of o)c.keys().forEach((u=>{const l=t.get(u);if(l===null)return;let p=r.get(u)||_t.empty();p=c.applyToLocalView(l,p),r.set(u,p);const g=(s.get(c.batchId)||re()).add(u);s=s.insert(c.batchId,g)}))})).next((()=>{const o=[],c=s.getReverseIterator();for(;c.hasNext();){const u=c.getNext(),l=u.key,p=u.value,g=Kf();p.forEach((T=>{if(!i.has(T)){const b=kf(t.get(T),r.get(T));b!==null&&g.set(T,b),i=i.add(T)}})),o.push(this.documentOverlayCache.saveOverlays(e,l,g))}return x.waitFor(o)})).next((()=>r))}recalculateAndSaveOverlaysForDocumentKeys(e,t){return this.remoteDocumentCache.getEntries(e,t).next((r=>this.recalculateAndSaveOverlays(e,r)))}getDocumentsMatchingQuery(e,t,r,s){return Ve(t)?this.getDocumentsMatchingPipeline(e,t,r,s):Eg(t)?this.getDocumentsMatchingDocumentQuery(e,t.path):Hf(t)?this.getDocumentsMatchingCollectionGroupQuery(e,t,r,s):this.getDocumentsMatchingCollectionQuery(e,t,r,s)}getNextDocuments(e,t,r,s){return this.remoteDocumentCache.getAllFromCollectionGroup(e,t,r,s).next((i=>{const o=s-i.size>0?this.documentOverlayCache.getOverlaysForCollectionGroup(e,t,r.largestBatchId,s-i.size):x.resolve(vn());let c=qs,u=i;return o.next((l=>x.forEach(l,((p,g)=>(c<g.largestBatchId&&(c=g.largestBatchId),i.get(p)?x.resolve():this.remoteDocumentCache.getEntry(e,p).next((T=>{u=u.insert(p,T)}))))).next((()=>this.populateOverlays(e,l,i))).next((()=>this.computeViews(e,u,l,re()))).next((p=>({batchId:c,changes:zf(p)})))))}))}getDocumentsMatchingDocumentQuery(e,t){return this.getDocument(e,new W(t)).next((r=>{let s=Tr();return r.isFoundDocument()&&(s=s.insert(r.key,r)),s}))}getDocumentsMatchingCollectionGroupQuery(e,t,r,s){const i=t.collectionGroup;let o=Tr();return this.indexManager.getCollectionParents(e,i).next((c=>x.forEach(c,(u=>{const l=(function(g,T){return new Gr(T,null,g.explicitOrderBy.slice(),g.filters.slice(),g.limit,g.limitType,g.startAt,g.endAt)})(t,u.child(i));return this.getDocumentsMatchingCollectionQuery(e,l,r,s).next((p=>{p.forEach(((g,T)=>{o=o.insert(g,T)}))}))})).next((()=>o))))}getDocumentsMatchingCollectionQuery(e,t,r,s){let i;return this.documentOverlayCache.getOverlaysForCollection(e,t.path,r.largestBatchId).next((o=>(i=o,this.remoteDocumentCache.getDocumentsMatchingQuery(e,t,r,i,s)))).next((o=>this.retrieveMatchingLocalDocuments(i,o,(c=>Yo(t,c)))))}getDocumentsMatchingPipeline(e,t,r,s){if(On(t)==="collection_group"){const i=u1(t);let o=Tr();return this.indexManager.getCollectionParents(e,i).next((c=>x.forEach(c,(u=>{const l=(function(g,T){const b=g.stages.map((O=>O instanceof ta?new ea(T.canonicalString(),{}):O));return new tt(g.serializer,b)})(t,u.child(i));return this.getDocumentsMatchingPipeline(e,l,r,s).next((p=>{p.forEach(((g,T)=>{o=o.insert(g,T)}))}))})).next((()=>o))))}{let i;return this.getOverlaysForPipeline(e,t,r.largestBatchId).next((o=>{switch(i=o,On(t)){case"collection":return this.remoteDocumentCache.getDocumentsMatchingQuery(e,t,r,i,s);case"documents":let c=re();for(const u of wc(t))c=c.add(W.fromPath(u));return this.remoteDocumentCache.getEntries(e,c);case"database":return this.remoteDocumentCache.getAllEntries(e);default:throw new U("invalid-argument",`Invalid pipeline source to execute offline: ${tn(t)}`)}})).next((o=>this.retrieveMatchingLocalDocuments(i,o,(c=>oa(t,c)))))}}retrieveMatchingLocalDocuments(e,t,r){e.forEach(((i,o)=>{const c=o.getKey();t.get(c)===null&&(t=t.insert(c,We.newInvalidDocument(c)))}));let s=Tr();return t.forEach(((i,o)=>{const c=e.get(i);c!==void 0&&Os(c.mutation,o,_t.empty(),ge.now()),r(o)&&(s=s.insert(i,o))})),s}getOverlaysForPipeline(e,t,r){switch(On(t)){case"collection":return this.documentOverlayCache.getOverlaysForCollection(e,ue.fromString(ra(t)),r);case"collection_group":throw new U("invalid-argument",`Unexpected collection group pipeline: ${tn(t)}`);case"documents":return this.documentOverlayCache.getOverlays(e,wc(t).map((s=>W.fromPath(s))));case"database":return this.documentOverlayCache.getAllOverlays(e,r);default:throw new U("invalid-argument",`Failed to get overlays for pipeline: ${tn(t)}`)}}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class o8{constructor(e){this.serializer=e,this.Hs=new Map,this.Js=new Map}getBundleMetadata(e,t){return x.resolve(this.Hs.get(t))}saveBundleMetadata(e,t){return this.Hs.set(t.id,(function(s){return{id:s.id,version:s.version,createTime:qt(s.createTime)}})(t)),x.resolve()}getNamedQuery(e,t){return x.resolve(this.Js.get(t))}saveNamedQuery(e,t){return this.Js.set(t.name,(function(s){return{name:s.name,query:J9(s.bundledQuery),readTime:qt(s.readTime)}})(t)),x.resolve()}}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class a8{constructor(){this.overlays=new _e(W.comparator),this.Ys=new Map}getOverlay(e,t){return x.resolve(this.overlays.get(t))}getOverlays(e,t){const r=vn();return x.forEach(t,(s=>this.getOverlay(e,s).next((i=>{i!==null&&r.set(s,i)})))).next((()=>r))}getAllOverlays(e,t){const r=vn();return this.overlays.forEach(((s,i)=>{i.largestBatchId>t&&r.set(s,i)})),x.resolve(r)}saveOverlays(e,t,r){return r.forEach(((s,i)=>{this.Hr(e,t,i)})),x.resolve()}removeOverlaysForBatchId(e,t,r){const s=this.Ys.get(r);return s!==void 0&&(s.forEach((i=>this.overlays=this.overlays.remove(i))),this.Ys.delete(r)),x.resolve()}getOverlaysForCollection(e,t,r){const s=vn(),i=t.length+1,o=new W(t.child("")),c=this.overlays.getIteratorFrom(o);for(;c.hasNext();){const u=c.getNext().value,l=u.getKey();if(!t.isPrefixOf(l.path))break;l.path.length===i&&u.largestBatchId>r&&s.set(u.getKey(),u)}return x.resolve(s)}getOverlaysForCollectionGroup(e,t,r,s){let i=new _e(((l,p)=>l-p));const o=this.overlays.getIterator();for(;o.hasNext();){const l=o.getNext().value;if(l.getKey().getCollectionGroup()===t&&l.largestBatchId>r){let p=i.get(l.largestBatchId);p===null&&(p=vn(),i=i.insert(l.largestBatchId,p)),p.set(l.getKey(),l)}}const c=vn(),u=i.getIterator();for(;u.hasNext()&&(u.getNext().value.forEach(((l,p)=>c.set(l,p))),!(c.size()>=s)););return x.resolve(c)}Hr(e,t,r){const s=this.overlays.get(r.key);if(s!==null){const o=this.Ys.get(s.largestBatchId).delete(r.key);this.Ys.set(s.largestBatchId,o)}this.overlays=this.overlays.insert(r.key,new Q9(t,r));let i=this.Ys.get(t);i===void 0&&(i=re(),this.Ys.set(t,i)),this.Ys.set(t,i.add(r.key))}}/**
 * @license
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class c8{constructor(){this.sessionToken=Ne.EMPTY_BYTE_STRING}getSessionToken(e){return x.resolve(this.sessionToken)}setSessionToken(e,t){return this.sessionToken=t,x.resolve()}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class _1{constructor(){this.Zs=new be(Le.Xs),this.e_=new be(Le.t_)}isEmpty(){return this.Zs.isEmpty()}addReference(e,t){const r=new Le(e,t);this.Zs=this.Zs.add(r),this.e_=this.e_.add(r)}n_(e,t){e.forEach((r=>this.addReference(r,t)))}removeReference(e,t){this.r_(new Le(e,t))}i_(e,t){e.forEach((r=>this.removeReference(r,t)))}s_(e){const t=new W(new ue([])),r=new Le(t,e),s=new Le(t,e+1),i=[];return this.e_.forEachInRange([r,s],(o=>{this.r_(o),i.push(o.key)})),i}__(){this.Zs.forEach((e=>this.r_(e)))}r_(e){this.Zs=this.Zs.delete(e),this.e_=this.e_.delete(e)}o_(e){const t=new W(new ue([])),r=new Le(t,e),s=new Le(t,e+1);let i=re();return this.e_.forEachInRange([r,s],(o=>{i=i.add(o.key)})),i}containsKey(e){const t=new Le(e,0),r=this.Zs.firstAfterOrEqual(t);return r!==null&&e.isEqual(r.key)}}class Le{constructor(e,t){this.key=e,this.a_=t}static Xs(e,t){return W.comparator(e.key,t.key)||se(e.a_,t.a_)}static t_(e,t){return se(e.a_,t.a_)||W.comparator(e.key,t.key)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class u8{constructor(e,t){this.indexManager=e,this.referenceDelegate=t,this.mutationQueue=[],this.gs=1,this.u_=new be(Le.Xs)}checkEmpty(e){return x.resolve(this.mutationQueue.length===0)}addMutationBatch(e,t,r,s){const i=this.gs;this.gs++,this.mutationQueue.length>0&&this.mutationQueue[this.mutationQueue.length-1];const o=new Y9(i,t,r,s);this.mutationQueue.push(o);for(const c of s)this.u_=this.u_.add(new Le(c.key,i)),this.indexManager.addToCollectionParentIndex(e,c.key.path.popLast());return x.resolve(o)}lookupMutationBatch(e,t){return x.resolve(this.c_(t))}getNextMutationBatchAfterBatchId(e,t){const r=t+1,s=this.l_(r),i=s<0?0:s;return x.resolve(this.mutationQueue.length>i?this.mutationQueue[i]:null)}getHighestUnacknowledgedBatchId(){return x.resolve(this.mutationQueue.length===0?zc:this.gs-1)}getAllMutationBatches(e){return x.resolve(this.mutationQueue.slice())}getAllMutationBatchesAffectingDocumentKey(e,t){const r=new Le(t,0),s=new Le(t,Number.POSITIVE_INFINITY),i=[];return this.u_.forEachInRange([r,s],(o=>{const c=this.c_(o.a_);i.push(c)})),x.resolve(i)}getAllMutationBatchesAffectingDocumentKeys(e,t){let r=new be(se);return t.forEach((s=>{const i=new Le(s,0),o=new Le(s,Number.POSITIVE_INFINITY);this.u_.forEachInRange([i,o],(c=>{r=r.add(c.a_)}))})),x.resolve(this.E_(r))}getAllMutationBatchesAffectingQuery(e,t){const r=t.path,s=r.length+1;let i=r;W.isDocumentKey(i)||(i=i.child(""));const o=new Le(new W(i),0);let c=new be(se);return this.u_.forEachWhile((u=>{const l=u.key.path;return!!r.isPrefixOf(l)&&(l.length===s&&(c=c.add(u.a_)),!0)}),o),x.resolve(this.E_(c))}E_(e){const t=[];return e.forEach((r=>{const s=this.c_(r);s!==null&&t.push(s)})),t}removeMutationBatch(e,t){j(this.h_(t.batchId,"removed")===0,55003),this.mutationQueue.shift();let r=this.u_;return x.forEach(t.mutations,(s=>{const i=new Le(s.key,t.batchId);return r=r.delete(i),this.referenceDelegate.markPotentiallyOrphaned(e,s.key)})).next((()=>{this.u_=r}))}bs(e){}containsKey(e,t){const r=new Le(t,0),s=this.u_.firstAfterOrEqual(r);return x.resolve(t.isEqual(s&&s.key))}performConsistencyCheck(e){return this.mutationQueue.length,x.resolve()}h_(e,t){return this.l_(e)}l_(e){return this.mutationQueue.length===0?0:e-this.mutationQueue[0].batchId}c_(e){const t=this.l_(e);return t<0||t>=this.mutationQueue.length?null:this.mutationQueue[t]}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class l8{constructor(e){this.T_=e,this.docs=(function(){return new _e(W.comparator)})(),this.size=0}setIndexManager(e){this.indexManager=e}addEntry(e,t){const r=t.key,s=this.docs.get(r),i=s?s.size:0,o=this.T_(t);return this.docs=this.docs.insert(r,{document:t.mutableCopy(),size:o}),this.size+=o-i,this.indexManager.addToCollectionParentIndex(e,r.path.popLast())}removeEntry(e){const t=this.docs.get(e);t&&(this.docs=this.docs.remove(e),this.size-=t.size)}getEntry(e,t){const r=this.docs.get(t);return x.resolve(r?r.document.mutableCopy():We.newInvalidDocument(t))}getEntries(e,t){let r=at();return t.forEach((s=>{const i=this.docs.get(s);r=r.insert(s,i?i.document.mutableCopy():We.newInvalidDocument(s))})),x.resolve(r)}getAllEntries(e){let t=at();return this.docs.forEach(((r,s)=>{t=t.insert(r,s.document)})),x.resolve(t)}getDocumentsMatchingQuery(e,t,r,s){let i,o;Ve(t)?(i=ue.fromString(ra(t)),o=p=>oa(t,p)):(i=t.path,o=p=>Yo(t,p));let c=at();const u=new W(i.child("__id-9223372036854775808__")),l=this.docs.getIteratorFrom(u);for(;l.hasNext();){const{key:p,value:{document:g}}=l.getNext();if(!i.isPrefixOf(p.path))break;p.path.length>i.length+1||$m(Bm(g),r)<=0||(s.has(g.key)||o(g))&&(c=c.insert(g.key,g.mutableCopy()))}return x.resolve(c)}getAllFromCollectionGroup(e,t,r,s){z(9500)}P_(e,t){return x.forEach(this.docs,(r=>t(r)))}newChangeBuffer(e){return new h8(this)}getSize(e){return x.resolve(this.size)}}class h8 extends r8{constructor(e){super(),this.zs=e}applyChanges(e){const t=[];return this.changes.forEach(((r,s)=>{s.isValidDocument()?t.push(this.zs.addEntry(e,s)):this.zs.removeEntry(r)})),x.waitFor(t)}getFromCache(e,t){return this.zs.getEntry(e,t)}getAllFromCache(e,t){return this.zs.getEntries(e,t)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class f8{constructor(e){this.persistence=e,this.R_=new pr((t=>Ld(t)),Md),this.lastRemoteSnapshotVersion=J.min(),this.highestTargetId=0,this.I_=0,this.A_=new _1,this.targetCount=0,this.V_=qn.xs()}forEachTarget(e,t){return this.R_.forEach(((r,s)=>t(s))),x.resolve()}getLastRemoteSnapshotVersion(e){return x.resolve(this.lastRemoteSnapshotVersion)}getHighestSequenceNumber(e){return x.resolve(this.I_)}allocateTargetId(e){return this.highestTargetId=this.V_.next(),x.resolve(this.highestTargetId)}setTargetsMetadata(e,t,r){return r&&(this.lastRemoteSnapshotVersion=r),t>this.I_&&(this.I_=t),x.resolve()}Ms(e){this.R_.set(e.target,e);const t=e.targetId;t>this.highestTargetId&&(this.V_=new qn(t),this.highestTargetId=t),e.sequenceNumber>this.I_&&(this.I_=e.sequenceNumber)}addTargetData(e,t){return this.Ms(t),this.targetCount+=1,x.resolve()}updateTargetData(e,t){return this.Ms(t),x.resolve()}removeTargetData(e,t){return this.R_.delete(t.target),this.A_.s_(t.targetId),this.targetCount-=1,x.resolve()}removeTargets(e,t,r){let s=0;const i=[];return this.R_.forEach(((o,c)=>{c.sequenceNumber<=t&&r.get(c.targetId)===null&&(this.R_.delete(o),i.push(this.removeMatchingKeysForTargetId(e,c.targetId)),s++)})),x.waitFor(i).next((()=>s))}getTargetCount(e){return x.resolve(this.targetCount)}getTargetData(e,t){const r=this.R_.get(t)||null;return x.resolve(r)}addMatchingKeys(e,t,r){return this.A_.n_(t,r),x.resolve()}removeMatchingKeys(e,t,r){this.A_.i_(t,r);const s=this.persistence.referenceDelegate,i=[];return s&&t.forEach((o=>{i.push(s.markPotentiallyOrphaned(e,o))})),x.waitFor(i)}removeMatchingKeysForTargetId(e,t){return this.A_.s_(t),x.resolve()}getMatchingKeysForTargetId(e,t){const r=this.A_.o_(t);return x.resolve(r)}containsKey(e,t){return x.resolve(this.A_.containsKey(t))}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ud{constructor(e,t){this.d_={},this.overlays={},this.f_=new $o(0),this.m_=!1,this.m_=!0,this.p_=new c8,this.referenceDelegate=e(this),this.g_=new f8(this),this.indexManager=new Z9,this.remoteDocumentCache=(function(s){return new l8(s)})((r=>this.referenceDelegate.y_(r))),this.serializer=new X9(t),this.w_=new o8(this.serializer)}start(){return Promise.resolve()}shutdown(){return this.m_=!1,Promise.resolve()}get started(){return this.m_}setDatabaseDeletedListener(){}setNetworkEnabled(){}getIndexManager(e){return this.indexManager}getDocumentOverlayCache(e){let t=this.overlays[e.toKey()];return t||(t=new a8,this.overlays[e.toKey()]=t),t}getMutationQueue(e,t){let r=this.d_[e.toKey()];return r||(r=new u8(t,this.referenceDelegate),this.d_[e.toKey()]=r),r}getGlobalsCache(){return this.p_}getTargetCache(){return this.g_}getRemoteDocumentCache(){return this.remoteDocumentCache}getBundleCache(){return this.w_}runTransaction(e,t,r){$("MemoryPersistence","Starting transaction:",e);const s=new d8(this.f_.next());return this.referenceDelegate.b_(),r(s).next((i=>this.referenceDelegate.v_(s).next((()=>i)))).toPromise().then((i=>(s.raiseOnCommittedEvent(),i)))}S_(e,t){return x.or(Object.values(this.d_).map((r=>()=>r.containsKey(e,t))))}}class d8 extends Hm{constructor(e){super(),this.currentSequenceNumber=e}}class y1{constructor(e){this.persistence=e,this.D_=new _1,this.x_=null}static C_(e){return new y1(e)}get F_(){if(this.x_)return this.x_;throw z(60996)}addReference(e,t,r){return this.D_.addReference(r,t),this.F_.delete(r.toString()),x.resolve()}removeReference(e,t,r){return this.D_.removeReference(r,t),this.F_.add(r.toString()),x.resolve()}markPotentiallyOrphaned(e,t){return this.F_.add(t.toString()),x.resolve()}removeTarget(e,t){this.D_.s_(t.targetId).forEach((s=>this.F_.add(s.toString())));const r=this.persistence.getTargetCache();return r.getMatchingKeysForTargetId(e,t.targetId).next((s=>{s.forEach((i=>this.F_.add(i.toString())))})).next((()=>r.removeTargetData(e,t)))}b_(){this.x_=new Set}v_(e){const t=this.persistence.getRemoteDocumentCache().newChangeBuffer();return x.forEach(this.F_,(r=>{const s=W.fromPath(r);return this.O_(e,s).next((i=>{i||t.removeEntry(s,J.min())}))})).next((()=>(this.x_=null,t.apply(e))))}updateLimboDocument(e,t){return this.O_(e,t).next((r=>{r?this.F_.delete(t.toString()):this.F_.add(t.toString())}))}y_(e){return 0}O_(e,t){return x.or([()=>x.resolve(this.D_.containsKey(t)),()=>this.persistence.getTargetCache().containsKey(e,t),()=>this.persistence.S_(e,t)])}}class Ao{constructor(e,t){this.persistence=e,this.M_=new pr((r=>zm(r.path)),((r,s)=>r.isEqual(s))),this.garbageCollector=d3(this,t)}static C_(e,t){return new Ao(e,t)}b_(){}v_(e){return x.resolve()}forEachTarget(e,t){return this.persistence.getTargetCache().forEachTarget(e,t)}lr(e){const t=this.Ls(e);return this.persistence.getTargetCache().getTargetCount(e).next((r=>t.next((s=>r+s))))}Ls(e){let t=0;return this.Er(e,(r=>{t++})).next((()=>t))}Er(e,t){return x.forEach(this.M_,((r,s)=>this.Us(e,r,s).next((i=>i?x.resolve():t(s)))))}removeTargets(e,t,r){return this.persistence.getTargetCache().removeTargets(e,t,r)}removeOrphanedDocuments(e,t){let r=0;const s=this.persistence.getRemoteDocumentCache(),i=s.newChangeBuffer();return s.P_(e,(o=>this.Us(e,o,t).next((c=>{c||(r++,i.removeEntry(o,J.min()))})))).next((()=>i.apply(e))).next((()=>r))}markPotentiallyOrphaned(e,t){return this.M_.set(t,e.currentSequenceNumber),x.resolve()}removeTarget(e,t){const r=t.withSequenceNumber(e.currentSequenceNumber);return this.persistence.getTargetCache().updateTargetData(e,r)}addReference(e,t,r){return this.M_.set(r,e.currentSequenceNumber),x.resolve()}removeReference(e,t,r){return this.M_.set(r,e.currentSequenceNumber),x.resolve()}updateLimboDocument(e,t){return this.M_.set(t,e.currentSequenceNumber),x.resolve()}y_(e){let t=e.key.toString().length;return e.isFoundDocument()&&(t+=Xi(e.data.value)),t}Us(e,t,r){return x.or([()=>this.persistence.S_(e,t),()=>this.persistence.getTargetCache().containsKey(e,t),()=>{const s=this.M_.get(t);return x.resolve(s!==void 0&&s>r)}])}getCacheSize(e){return this.persistence.getRemoteDocumentCache().getSize(e)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class E1{constructor(e,t,r,s){this.targetId=e,this.fromCache=t,this.wo=r,this.bo=s}static vo(e,t){let r=re(),s=re();for(const i of t.docChanges)switch(i.type){case 0:r=r.add(i.doc.key);break;case 1:s=s.add(i.doc.key)}return new E1(e,t.fromCache,r,s)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function p8(n,e){return W.comparator(n.key,e.key)}/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class m8{constructor(){this._documentReadCount=0}get documentReadCount(){return this._documentReadCount}incrementDocumentReadCount(e){this._documentReadCount+=e}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class g8{constructor(){this.So=!1,this.Do=!1,this.xo=100,this.Co=(function(){return Ap()?8:jm(Qe())>0?6:4})()}initialize(e,t){this.Fo=e,this.indexManager=t,this.So=!0}getDocumentsMatchingQuery(e,t,r,s){const i={result:null};return this.Oo(e,t).next((o=>{i.result=o})).next((()=>{if(!i.result)return this.Mo(e,t,s,r).next((o=>{i.result=o}))})).next((()=>{if(i.result)return;const o=new m8;return this.No(e,t,o).next((c=>{if(i.result=c,this.Do)return this.Lo(e,t,o,c.size)}))})).next((()=>i.result))}Lo(e,t,r,s){return Ve(t)?x.resolve():r.documentReadCount<this.xo?(Ir()<=ie.DEBUG&&$("QueryEngine","SDK will not create cache indexes for query:",Ds(t),"since it only creates cache indexes for collection contains","more than or equal to",this.xo,"documents"),x.resolve()):(Ir()<=ie.DEBUG&&$("QueryEngine","Query:",Ds(t),"scans",r.documentReadCount,"local documents and returns",s,"documents as results."),r.documentReadCount>this.Co*s?(Ir()<=ie.DEBUG&&$("QueryEngine","The SDK decides to create cache indexes for query:",Ds(t),"as using cache indexes may help improve performance."),this.indexManager.createTargetIndexes(e,$t(t))):x.resolve())}Oo(e,t){if(Ve(t))return x.resolve(null);let r=t;if(dh(r))return x.resolve(null);let s=$t(r);return this.indexManager.getIndexType(e,s).next((i=>i===0?null:(r.limit!==null&&i===1&&(r=yo(r,null,"F"),s=$t(r)),this.indexManager.getDocumentsMatchingTarget(e,s).next((o=>{const c=re(...o);return this.Fo.getDocuments(e,c).next((u=>this.indexManager.getMinOffset(e,s).next((l=>{const p=this.Bo(r,u);return this.Uo(r,p,c,l.readTime)?this.Oo(e,yo(r,null,"F")):this.ko(e,p,r,l)}))))})))))}Mo(e,t,r,s){return(Ve(t)?(function(o){for(const c of o.stages){if(c instanceof ar||c instanceof Sh)return!1;if(c instanceof na){if(c.condition instanceof Ad&&c.condition._expr.name==="exists"&&c.condition._expr.params[0]instanceof Wr&&c.condition._expr.params[0].fieldName===Mt)continue;return!1}}return!0})(t):dh(t))||s.isEqual(J.min())?x.resolve(null):this.Fo.getDocuments(e,r).next((i=>{const o=this.Bo(t,i);return this.Uo(t,o,r,s)?x.resolve(null):(Ir()<=ie.DEBUG&&$("QueryEngine","Re-using previous result from %s to execute query: %s",s.toString(),bh(t)),this.ko(e,o,t,Um(s,qs)).next((c=>c)))}))}Bo(e,t){let r,s;return Ve(e)?(r=new be(p8),s=i=>oa(e,i)):(r=new be(Xc(e)),s=i=>Yo(e,i)),t.forEach(((i,o)=>{s(o)&&(r=r.add(o))})),r}Uo(e,t,r,s){if(Ve(e))return(function(c){return c.stages.some((u=>u instanceof ar||u instanceof Sh))})(e);if(e.limit===null)return!1;if(r.size!==t.size)return!0;const i=e.limitType==="F"?t.last():t.first();return!!i&&(i.hasPendingWrites||i.version.compareTo(s)>0)}No(e,t,r){return Ir()<=ie.DEBUG&&$("QueryEngine","Using full collection scan to execute query:",bh(t)),this.Fo.getDocumentsMatchingQuery(e,t,xn.min(),r)}ko(e,t,r,s){return this.Fo.getDocumentsMatchingQuery(e,r,s).next((i=>(t.forEach((o=>{i=i.insert(o.key,o)})),i)))}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const I1="LocalStore",_8=3e8;class y8{constructor(e,t,r,s){this.persistence=e,this.qo=t,this.serializer=s,this.$o=new _e(se),this.Ko=new pr((i=>Ld(i)),Md),this.Wo=new Map,this.Qo=e.getRemoteDocumentCache(),this.g_=e.getTargetCache(),this.w_=e.getBundleCache(),this.Go(r)}Go(e){this.documentOverlayCache=this.persistence.getDocumentOverlayCache(e),this.indexManager=this.persistence.getIndexManager(e),this.mutationQueue=this.persistence.getMutationQueue(e,this.indexManager),this.localDocuments=new i8(this.Qo,this.mutationQueue,this.documentOverlayCache,this.indexManager),this.Qo.setIndexManager(this.indexManager),this.qo.initialize(this.localDocuments,this.indexManager)}collectGarbage(e){return this.persistence.runTransaction("Collect garbage","readwrite-primary",(t=>e.collect(t,this.$o)))}}function E8(n,e,t,r){return new y8(n,e,t,r)}async function Bd(n,e){const t=Z(n);return await t.persistence.runTransaction("Handle user change","readonly",(r=>{let s;return t.mutationQueue.getAllMutationBatches(r).next((i=>(s=i,t.Go(e),t.mutationQueue.getAllMutationBatches(r)))).next((i=>{const o=[],c=[];let u=re();for(const l of s){o.push(l.batchId);for(const p of l.mutations)u=u.add(p.key)}for(const l of i){c.push(l.batchId);for(const p of l.mutations)u=u.add(p.key)}return t.localDocuments.getDocuments(r,u).next((l=>({zo:l,removedBatchIds:o,addedBatchIds:c})))}))}))}function I8(n,e){const t=Z(n);return t.persistence.runTransaction("Acknowledge batch","readwrite-primary",(r=>{const s=e.batch.keys(),i=t.Qo.newChangeBuffer({trackRemovals:!0});return(function(c,u,l,p){const g=l.batch,T=g.keys();let b=x.resolve();return T.forEach((O=>{b=b.next((()=>p.getEntry(u,O))).next((L=>{const M=l.docVersions.get(O);j(M!==null,48541),L.version.compareTo(M)<0&&(g.applyToRemoteDocument(L,l),L.isValidDocument()&&(L.setReadTime(l.commitVersion),p.addEntry(L)))}))})),b.next((()=>c.mutationQueue.removeMutationBatch(u,g)))})(t,r,e,i).next((()=>i.apply(r))).next((()=>t.mutationQueue.performConsistencyCheck(r))).next((()=>t.documentOverlayCache.removeOverlaysForBatchId(r,s,e.batch.batchId))).next((()=>t.localDocuments.recalculateAndSaveOverlaysForDocumentKeys(r,(function(c){let u=re();for(let l=0;l<c.mutationResults.length;++l)c.mutationResults[l].transformResults.length>0&&(u=u.add(c.batch.mutations[l].key));return u})(e)))).next((()=>t.localDocuments.getDocuments(r,s)))}))}function $d(n){const e=Z(n);return e.persistence.runTransaction("Get last remote snapshot version","readonly",(t=>e.g_.getLastRemoteSnapshotVersion(t)))}function T8(n,e){const t=Z(n),r=e.snapshotVersion;let s=t.$o;return t.persistence.runTransaction("Apply remote event","readwrite-primary",(i=>{const o=t.Qo.newChangeBuffer({trackRemovals:!0});s=t.$o;const c=[];e.targetChanges.forEach(((p,g)=>{const T=s.get(g);if(!T)return;c.push(t.g_.removeMatchingKeys(i,p.removedDocuments,g).next((()=>t.g_.addMatchingKeys(i,p.addedDocuments,g))));let b=T.withSequenceNumber(i.currentSequenceNumber);e.targetMismatches.get(g)!==null?b=b.withResumeToken(Ne.EMPTY_BYTE_STRING,J.min()).withLastLimboFreeSnapshotVersion(J.min()):p.resumeToken.approximateByteSize()>0&&(b=b.withResumeToken(p.resumeToken,r)),s=s.insert(g,b),(function(L,M,Y){return L.resumeToken.approximateByteSize()===0||M.snapshotVersion.toMicroseconds()-L.snapshotVersion.toMicroseconds()>=_8?!0:Y.addedDocuments.size+Y.modifiedDocuments.size+Y.removedDocuments.size>0})(T,b,p)&&c.push(t.g_.updateTargetData(i,b))}));let u=at(),l=re();if(e.documentUpdates.forEach((p=>{e.resolvedLimboDocuments.has(p)&&c.push(t.persistence.referenceDelegate.updateLimboDocument(i,p))})),c.push(w8(i,o,e.documentUpdates).next((p=>{u=p.jo,l=p.Ho}))),!r.isEqual(J.min())){const p=t.g_.getLastRemoteSnapshotVersion(i).next((g=>t.g_.setTargetsMetadata(i,i.currentSequenceNumber,r)));c.push(p)}return x.waitFor(c).next((()=>o.apply(i))).next((()=>t.localDocuments.getLocalViewOfDocuments(i,u,l))).next((()=>u))})).then((i=>(t.$o=s,i)))}function w8(n,e,t){let r=re(),s=re();return t.forEach((i=>r=r.add(i))),e.getEntries(n,r).next((i=>{let o=at();return t.forEach(((c,u)=>{const l=i.get(c);u.isFoundDocument()!==l.isFoundDocument()&&(s=s.add(c)),u.isNoDocument()&&u.version.isEqual(J.min())?(e.removeEntry(c,u.readTime),o=o.insert(c,u)):!l.isValidDocument()||u.version.compareTo(l.version)>0||u.version.compareTo(l.version)===0&&l.hasPendingWrites?(e.addEntry(u),o=o.insert(c,u)):$(I1,"Ignoring outdated watch update for ",c,". Current version:",l.version," Watch version:",u.version)})),{jo:o,Ho:s}}))}function A8(n,e){const t=Z(n);return t.persistence.runTransaction("Get next mutation batch","readonly",(r=>(e===void 0&&(e=zc),t.mutationQueue.getNextMutationBatchAfterBatchId(r,e))))}function v8(n,e){const t=Z(n);return t.persistence.runTransaction("Allocate target","readwrite",(r=>{let s;return t.g_.getTargetData(r,e).next((i=>i?(s=i,x.resolve(s)):t.g_.allocateTargetId(r).next((o=>(s=new en(e,o,"TargetPurposeListen",r.currentSequenceNumber),t.g_.addTargetData(r,s).next((()=>s)))))))})).then((r=>{const s=t.$o.get(r.targetId);return(s===null||r.snapshotVersion.compareTo(s.snapshotVersion)>0)&&(t.$o=t.$o.insert(r.targetId,r),t.Ko.set(e,r.targetId)),r}))}async function vc(n,e,t){const r=Z(n),s=r.$o.get(e),i=t?"readwrite":"readwrite-primary";try{t||await r.persistence.runTransaction("Release target",i,(o=>r.persistence.referenceDelegate.removeTarget(o,s)))}catch(o){if(!jr(o))throw o;$(I1,`Failed to update sequence numbers for target ${e}: ${o}`)}r.$o=r.$o.remove(e),r.Ko.delete(s.target)}function Nh(n,e,t){const r=Z(n);let s=J.min(),i=re();return r.persistence.runTransaction("Execute query","readwrite",(o=>(function(u,l,p){const g=Z(u),T=g.Ko.get(p);return T!==void 0?x.resolve(g.$o.get(T)):g.g_.getTargetData(l,p)})(r,o,Ve(e)?e:$t(e)).next((c=>{if(c)return s=c.lastLimboFreeSnapshotVersion,r.g_.getMatchingKeysForTargetId(o,c.targetId).next((u=>{i=u}))})).next((()=>r.qo.getDocumentsMatchingQuery(o,e,t?s:J.min(),t?i:re()))).next((c=>(R8(r,c),{documents:c,Jo:i})))))}function R8(n,e){e.forEach(((t,r)=>{const s=r.key.getCollectionGroup(),i=n.Wo.get(s)||J.min();r.readTime.compareTo(i)>0&&n.Wo.set(s,r.readTime)}))}class Oh{constructor(){this.activeTargetIds=Ng()}na(e){this.activeTargetIds=this.activeTargetIds.add(e)}ra(e){this.activeTargetIds=this.activeTargetIds.delete(e)}ta(){const e={activeTargetIds:this.activeTargetIds.toArray(),updateTimeMs:Date.now()};return JSON.stringify(e)}}class C8{constructor(){this.Ua=new Oh,this.ka={},this.onlineStateHandler=null,this.sequenceNumberHandler=null}addPendingMutation(e){}updateMutationState(e,t,r){}addLocalQueryTarget(e,t=!0){return t&&this.Ua.na(e),this.ka[e]||"not-current"}updateQueryState(e,t,r){this.ka[e]=t}removeLocalQueryTarget(e){this.Ua.ra(e)}isLocalQueryTarget(e){return this.Ua.activeTargetIds.has(e)}clearQueryState(e){delete this.ka[e]}getAllActiveQueryTargets(){return this.Ua.activeTargetIds}isActiveQueryTarget(e){return this.Ua.activeTargetIds.has(e)}start(){return this.Ua=new Oh,Promise.resolve()}handleUserChange(e,t,r){}setOnlineState(e){}shutdown(){}writeSequenceNumber(e){}notifyBundleLoaded(e){}}function Xa(){return typeof document<"u"?document:null}/**
 * @license
 * Copyright 2018 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class P8{constructor(e,t){this.asyncQueue=e,this.onlineStateHandler=t,this.state="Unknown",this.qa=0,this.$a=null,this.Ka=!0}Wa(){this.qa===0&&(this.Qa("Unknown"),this.$a=this.asyncQueue.enqueueAfterDelay("online_state_timeout",1e4,(()=>(this.$a=null,this.Ga("Backend didn't respond within 10 seconds."),this.Qa("Offline"),Promise.resolve()))))}za(e){this.state==="Online"?this.Qa("Unknown"):(this.qa++,this.qa>=1&&(this.ja(),this.Ga(`Connection failed 1 times. Most recent error: ${e.toString()}`),this.Qa("Offline")))}set(e){this.ja(),this.qa=0,e==="Online"&&(this.Ka=!1),this.Qa(e)}Qa(e){e!==this.state&&(this.state=e,this.onlineStateHandler(e))}Ga(e){const t=`Could not reach Cloud Firestore backend. ${e}
This typically indicates that your device does not have a healthy Internet connection at the moment. The client will operate in offline mode until it is able to successfully connect to the backend.`;this.Ka?(on(t),this.Ka=!1):$("OnlineStateTracker",t)}ja(){this.$a!==null&&(this.$a.cancel(),this.$a=null)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Wt="RemoteStore";class S8{constructor(e,t,r,s,i){this.localStore=e,this.datastore=t,this.asyncQueue=r,this.remoteSyncer={},this.Ha=[],this.Ja=new Map,this.Ya=new Map,this.Za=new Map,this.Xa=new qn(1e3),this.eu=new qn(1001),this.tu=new Set,this.nu=[],this.ru=i,this.ru.bt((o=>{r.enqueueAndForget((async()=>{gr(this)&&($(Wt,"Restarting streams for network reachability change."),await(async function(u){const l=Z(u);l.tu.add(4),await yi(l),l.iu.set("Unknown"),l.tu.delete(4),await aa(l)})(this))}))})),this.iu=new P8(r,s)}}async function aa(n){if(gr(n))for(const e of n.nu)await e(!0)}async function yi(n){for(const e of n.nu)await e(!1)}function Rc(n,e){return n.Ya.get(e)||void 0}function qd(n,e){const t=Z(n),r=Rc(t,e.targetId);if(r!==void 0&&t.Ja.has(r))return;const s=(function(c,u){const l=Rc(c,u);l!==void 0&&c.Za.delete(l);const p=(function(T,b){return b%2!=0?T.eu.next():T.Xa.next()})(c,u);return c.Ya.set(u,p),c.Za.set(p,u),p})(t,e.targetId);$(Wt,"remoteStoreListen mapping SDK target ID to remote",e.targetId,s);const i=new en(e.target,s,e.purpose,e.sequenceNumber,e.snapshotVersion,e.lastLimboFreeSnapshotVersion,e.resumeToken);t.Ja.set(s,i),v1(t)?A1(t):Qr(t).Fn()&&w1(t,i)}function T1(n,e){const t=Z(n),r=Qr(t),s=Rc(t,e);$(Wt,"remoteStoreUnlisten removing mapping of SDK target ID to remote",e,s),t.Ja.delete(s),t.Ya.delete(e),t.Za.delete(s),r.Fn()&&Hd(t,s),t.Ja.size===0&&(r.Fn()?r.Nn():gr(t)&&t.iu.set("Unknown"))}function w1(n,e){if(n.su.We(e.targetId),e.resumeToken.approximateByteSize()>0||e.snapshotVersion.compareTo(J.min())>0){const t=n.Za.get(e.targetId);if(t===void 0)return void $(Wt,"SDK target ID not found for remote ID: "+e.targetId);const r=n.remoteSyncer.getRemoteKeysForTarget(t).size;e=e.withExpectedCount(r)}Qr(n).jn(e)}function Hd(n,e){n.su.We(e),Qr(n).Hn(e)}function A1(n){n.su=new Dg({getRemoteKeysForTarget:e=>{const t=n.Za.get(e);return t!==void 0?n.remoteSyncer.getRemoteKeysForTarget(t):re()},dt:e=>n.Ja.get(e)||null,Tt:()=>n.datastore.serializer.databaseId}),Qr(n).start(),n.iu.Wa()}function v1(n){return gr(n)&&!Qr(n).Cn()&&n.Ja.size>0}function gr(n){return Z(n).tu.size===0}function jd(n){n.su=void 0}async function b8(n){n.iu.set("Online")}async function N8(n){n.Ja.forEach(((e,t)=>{w1(n,e)}))}async function O8(n,e){jd(n),v1(n)?(n.iu.za(e),A1(n)):n.iu.set("Unknown")}async function k8(n,e,t){if(n.iu.set("Online"),e instanceof Qf&&e.state===2&&e.cause)try{await(async function(s,i){const o=i.cause;for(const c of i.targetIds){if(s.Ja.has(c)){const u=s.Za.get(c);u!==void 0&&(await s.remoteSyncer.rejectListen(u,o),s.Ya.delete(u),s.Za.delete(c)),s.Ja.delete(c)}s.su.removeTarget(c)}})(n,e)}catch(r){$(Wt,"Failed to remove targets %s: %s ",e.targetIds.join(","),r),await vo(n,r)}else if(e instanceof Zi?n.su.et(e):e instanceof Yf?n.su.ot(e):n.su.rt(e),!t.isEqual(J.min()))try{const r=await $d(n.localStore);t.compareTo(r)>=0&&await(function(i,o){const c=i.su.Rt(o);c.targetChanges.forEach(((l,p)=>{if(l.resumeToken.approximateByteSize()>0){const g=i.Ja.get(p);g&&i.Ja.set(p,g.withResumeToken(l.resumeToken,o))}})),c.targetMismatches.forEach(((l,p)=>{const g=i.Ja.get(l);if(!g)return;i.Ja.set(l,g.withResumeToken(Ne.EMPTY_BYTE_STRING,g.snapshotVersion)),Hd(i,l);const T=new en(g.target,l,p,g.sequenceNumber);w1(i,T)}));const u=(function(p,g){const T=new Map;g.targetChanges.forEach(((O,L)=>{const M=p.Za.get(L);M!==void 0&&T.set(M,O)}));let b=new _e(se);return g.targetMismatches.forEach(((O,L)=>{const M=p.Za.get(O);M!==void 0&&(b=b.insert(M,L))})),new fi(g.snapshotVersion,T,b,g.documentUpdates,g.augmentedDocumentUpdates,g.resolvedLimboDocuments)})(i,c);return i.remoteSyncer.applyRemoteEvent(u)})(n,t)}catch(r){$(Wt,"Failed to raise snapshot:",r),await vo(n,r)}}async function vo(n,e,t){if(!jr(e))throw e;n.tu.add(1),await yi(n),n.iu.set("Offline"),t||(t=()=>$d(n.localStore)),n.asyncQueue.enqueueRetryable((async()=>{$(Wt,"Retrying IndexedDB access"),await t(),n.tu.delete(1),await aa(n)}))}function Gd(n,e){return e().catch((t=>vo(n,t,e)))}async function ca(n){const e=Z(n),t=Hn(e);let r=e.Ha.length>0?e.Ha[e.Ha.length-1].batchId:zc;for(;D8(e);)try{const s=await A8(e.localStore,r);if(s===null){e.Ha.length===0&&t.Nn();break}r=s.batchId,V8(e,s)}catch(s){await vo(e,s)}Wd(e)&&zd(e)}function D8(n){return gr(n)&&n.Ha.length<10}function V8(n,e){n.Ha.push(e);const t=Hn(n);t.Fn()&&t.Jn&&t.Yn(e.mutations)}function Wd(n){return gr(n)&&!Hn(n).Cn()&&n.Ha.length>0}function zd(n){Hn(n).start()}async function x8(n){Hn(n).er()}async function L8(n){const e=Hn(n);for(const t of n.Ha)e.Yn(t.mutations)}async function M8(n,e,t){const r=n.Ha.shift(),s=g1.from(r,e,t);await Gd(n,(()=>n.remoteSyncer.applySuccessfulWrite(s))),await ca(n)}async function F8(n,e){e&&Hn(n).Jn&&await(async function(r,s){if((function(o){return Rg(o)&&o!==V.ABORTED})(s.code)){const i=r.Ha.shift();Hn(r).Mn(),await Gd(r,(()=>r.remoteSyncer.rejectFailedWrite(i.batchId,s))),await ca(r)}})(n,e),Wd(n)&&zd(n)}async function kh(n,e){const t=Z(n);t.asyncQueue.verifyOperationInProgress(),$(Wt,"RemoteStore received new credentials");const r=gr(t);t.tu.add(3),await yi(t),r&&t.iu.set("Unknown"),await t.remoteSyncer.handleCredentialChange(e),t.tu.delete(3),await aa(t)}async function U8(n,e){const t=Z(n);e?(t.tu.delete(2),await aa(t)):e||(t.tu.add(2),await yi(t),t.iu.set("Unknown"))}function Qr(n){return n._u||(n._u=(function(t,r,s){const i=Z(t);return i.nr(),new r3(r,i.connection,i.authCredentials,i.appCheckCredentials,i.serializer,s)})(n.datastore,n.asyncQueue,{Qt:b8.bind(null,n),zt:N8.bind(null,n),Ht:O8.bind(null,n),zn:k8.bind(null,n)}),n.nu.push((async e=>{e?(n._u.Mn(),v1(n)?A1(n):n.iu.set("Unknown")):(await n._u.stop(),jd(n))}))),n._u}function Hn(n){return n.ou||(n.ou=(function(t,r,s){const i=Z(t);return i.nr(),new s3(r,i.connection,i.authCredentials,i.appCheckCredentials,i.serializer,s)})(n.datastore,n.asyncQueue,{Qt:()=>Promise.resolve(),zt:x8.bind(null,n),Ht:F8.bind(null,n),Zn:L8.bind(null,n),Xn:M8.bind(null,n)}),n.nu.push((async e=>{e?(n.ou.Mn(),await ca(n)):(await n.ou.stop(),n.Ha.length>0&&($(Wt,`Stopping write stream with ${n.Ha.length} pending writes`),n.Ha=[]))}))),n.ou}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class R1{constructor(e,t,r,s,i){this.asyncQueue=e,this.timerId=t,this.targetTimeMs=r,this.op=s,this.removalCallback=i,this.deferred=new Bt,this.then=this.deferred.promise.then.bind(this.deferred.promise),this.deferred.promise.catch((o=>{}))}get promise(){return this.deferred.promise}static createAndSchedule(e,t,r,s,i){const o=Date.now()+r,c=new R1(e,t,o,s,i);return c.start(r),c}start(e){this.timerHandle=setTimeout((()=>this.handleDelayElapsed()),e)}skipDelay(){return this.handleDelayElapsed()}cancel(e){this.timerHandle!==null&&(this.clearTimeout(),this.deferred.reject(new U(V.CANCELLED,"Operation cancelled"+(e?": "+e:""))))}handleDelayElapsed(){this.asyncQueue.enqueueAndForget((()=>this.timerHandle!==null?(this.clearTimeout(),this.op().then((e=>this.deferred.resolve(e)))):Promise.resolve()))}clearTimeout(){this.timerHandle!==null&&(this.removalCallback(this),clearTimeout(this.timerHandle),this.timerHandle=null)}}function C1(n,e){if(on("AsyncQueue",`${e}: ${n}`),jr(n))return new U(V.UNAVAILABLE,`${e}: ${n}`);throw n}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class sr{static emptySet(e){return new sr(e.comparator)}constructor(e){this.comparator=e?(t,r)=>e(t,r)||W.comparator(t.key,r.key):(t,r)=>W.comparator(t.key,r.key),this.keyedMap=Tr(),this.sortedSet=new _e(this.comparator)}has(e){return this.keyedMap.get(e)!=null}get(e){return this.keyedMap.get(e)}first(){return this.sortedSet.minKey()}last(){return this.sortedSet.maxKey()}isEmpty(){return this.sortedSet.isEmpty()}indexOf(e){const t=this.keyedMap.get(e);return t?this.sortedSet.indexOf(t):-1}get size(){return this.sortedSet.size}forEach(e){this.sortedSet.inorderTraversal(((t,r)=>(e(t),!1)))}add(e){const t=this.delete(e.key);return t.copy(t.keyedMap.insert(e.key,e),t.sortedSet.insert(e,null))}delete(e){const t=this.get(e);return t?this.copy(this.keyedMap.remove(e),this.sortedSet.remove(t)):this}isEqual(e){if(!(e instanceof sr)||this.size!==e.size)return!1;const t=this.sortedSet.getIterator(),r=e.sortedSet.getIterator();for(;t.hasNext();){const s=t.getNext().key,i=r.getNext().key;if(!s.isEqual(i))return!1}return!0}toString(){const e=[];return this.forEach((t=>{e.push(t.toString())})),e.length===0?"DocumentSet ()":`DocumentSet (
  `+e.join(`  
`)+`
)`}copy(e,t){const r=new sr;return r.comparator=this.comparator,r.keyedMap=e,r.sortedSet=t,r}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Dh{constructor(){this.au=new _e(W.comparator)}track(e){const t=e.doc.key,r=this.au.get(t);r?e.type!==0&&r.type===3?this.au=this.au.insert(t,e):e.type===3&&r.type!==1?this.au=this.au.insert(t,{type:r.type,doc:e.doc}):e.type===2&&r.type===2?this.au=this.au.insert(t,{type:2,doc:e.doc}):e.type===2&&r.type===0?this.au=this.au.insert(t,{type:0,doc:e.doc}):e.type===1&&r.type===0?this.au=this.au.remove(t):e.type===1&&r.type===2?this.au=this.au.insert(t,{type:1,doc:r.doc}):e.type===0&&r.type===1?this.au=this.au.insert(t,{type:2,doc:e.doc}):z(63341,{ft:e,uu:r}):this.au=this.au.insert(t,e)}cu(){const e=[];return this.au.inorderTraversal(((t,r)=>{e.push(r)})),e}}class Fr{constructor(e,t,r,s,i,o,c,u,l){this.query=e,this.docs=t,this.oldDocs=r,this.docChanges=s,this.mutatedKeys=i,this.fromCache=o,this.syncStateChanged=c,this.excludesMetadataChanges=u,this.hasCachedResults=l}static fromInitialDocuments(e,t,r,s,i){const o=[];return t.forEach((c=>{o.push({type:0,doc:c})})),new Fr(e,t,sr.emptySet(t),o,r,s,!0,!1,i)}get hasPendingWrites(){return!this.mutatedKeys.isEmpty()}isEqual(e){if(!(this.fromCache===e.fromCache&&this.hasCachedResults===e.hasCachedResults&&this.syncStateChanged===e.syncStateChanged&&this.mutatedKeys.isEqual(e.mutatedKeys)&&ia(this.query,e.query)&&this.docs.isEqual(e.docs)&&this.oldDocs.isEqual(e.oldDocs)))return!1;const t=this.docChanges,r=e.docChanges;if(t.length!==r.length)return!1;for(let s=0;s<t.length;s++)if(t[s].type!==r[s].type||!t[s].doc.isEqual(r[s].doc))return!1;return!0}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class B8{constructor(){this.lu=void 0,this.Eu=[]}hu(){return this.Eu.some((e=>e.Tu()))}}class $8{constructor(){this.queries=Vh(),this.onlineState="Unknown",this.Pu=new Set}terminate(){(function(t,r){const s=Z(t),i=s.queries;s.queries=Vh(),i.forEach(((o,c)=>{for(const u of c.Eu)u.onError(r)}))})(this,new U(V.ABORTED,"Firestore shutting down"))}}function Vh(){return new pr((n=>xd(n)),ia)}async function P1(n,e){const t=Z(n);let r=3;const s=e.query;let i=t.queries.get(s);i?!i.hu()&&e.Tu()&&(r=2):(i=new B8,r=e.Tu()?0:1);try{switch(r){case 0:i.lu=await t.onListen(s,!0);break;case 1:i.lu=await t.onListen(s,!1);break;case 2:await t.onFirstRemoteStoreListen(s)}}catch(o){const c=C1(o,`Initialization of query '${Ve(e.query)?tn(e.query):Ds(e.query)}' failed`);return void e.onError(c)}t.queries.set(s,i),i.Eu.push(e),e.Ru(t.onlineState),i.lu&&e.Iu(i.lu)&&b1(t)}async function S1(n,e){const t=Z(n),r=e.query;let s=3;const i=t.queries.get(r);if(i){const o=i.Eu.indexOf(e);o>=0&&(i.Eu.splice(o,1),i.Eu.length===0?s=e.Tu()?0:1:!i.hu()&&e.Tu()&&(s=2))}switch(s){case 0:return t.queries.delete(r),t.onUnlisten(r,!0);case 1:return t.queries.delete(r),t.onUnlisten(r,!1);case 2:return t.onLastRemoteStoreUnlisten(r);default:return}}function q8(n,e){const t=Z(n);let r=!1;for(const s of e){const i=s.query,o=t.queries.get(i);if(o){for(const c of o.Eu)c.Iu(s)&&(r=!0);o.lu=s}}r&&b1(t)}function H8(n,e,t){const r=Z(n),s=r.queries.get(e);if(s)for(const i of s.Eu)i.onError(t);r.queries.delete(e)}function b1(n){n.Pu.forEach((e=>{e.next()}))}var Cc;(function(n){n.Default="default",n.Cache="cache"})(Cc||(Cc={}));class N1{constructor(e,t,r){this.query=e,this.Au=t,this.Vu=!1,this.du=null,this.onlineState="Unknown",this.options=r||{}}Iu(e){if(!this.options.includeMetadataChanges){const r=[];for(const s of e.docChanges)s.type!==3&&r.push(s);e=new Fr(e.query,e.docs,e.oldDocs,r,e.mutatedKeys,e.fromCache,e.syncStateChanged,!0,e.hasCachedResults)}let t=!1;return this.Vu?this.fu(e)&&(this.Au.next(e),t=!0):this.mu(e,this.onlineState)&&(this.pu(e),t=!0),this.du=e,t}onError(e){this.Au.error(e)}Ru(e){this.onlineState=e;let t=!1;return this.du&&!this.Vu&&this.mu(this.du,e)&&(this.pu(this.du),t=!0),t}mu(e,t){if(!e.fromCache||!this.Tu())return!0;const r=t!=="Offline";return(!this.options.waitForSyncWhenOnline||!r)&&(!e.docs.isEmpty()||e.hasCachedResults||t==="Offline")}fu(e){if(e.docChanges.length>0)return!0;const t=this.du&&this.du.hasPendingWrites!==e.hasPendingWrites;return!(!e.syncStateChanged&&!t)&&this.options.includeMetadataChanges===!0}pu(e){e=Fr.fromInitialDocuments(e.query,e.docs,e.mutatedKeys,e.fromCache,e.hasCachedResults),this.Vu=!0,this.Au.next(e)}Tu(){return this.options.source!==Cc.Cache}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Kd{constructor(e){this.key=e}}class Yd{constructor(e){this.key=e}}class j8{constructor(e,t){this.query=e,this.Ou=t,this.Mu=null,this.hasCachedResults=!1,this.current=!1,this.Nu=re(),this.mutatedKeys=re(),this.Lu=Ve(e)?Ac(e):Xc(e),this.Bu=new sr(this.Lu)}get Uu(){return this.Ou}ku(e,t){const r=t?t.qu:new Dh,s=t?t.Bu:this.Bu;let i=t?t.mutatedKeys:this.mutatedKeys,o=s,c=!1;const[u,l]=this.$u(this.query,s);e.inorderTraversal(((g,T)=>{const b=s.get(g),O=t8(this.query,T)?T:null,L=!!b&&this.mutatedKeys.has(b.key),M=!!O&&(O.hasLocalMutations||this.mutatedKeys.has(O.key)&&O.hasCommittedMutations);let Y=!1;b&&O?b.data.isEqual(O.data)?L!==M&&(r.track({type:3,doc:O}),Y=!0):this.Ku(b,O)||(r.track({type:2,doc:O}),Y=!0,(u&&this.Lu(O,u)>0||l&&this.Lu(O,l)<0)&&(c=!0)):!b&&O?(r.track({type:0,doc:O}),Y=!0):b&&!O&&(r.track({type:1,doc:b}),Y=!0,(u||l)&&(c=!0)),Y&&(O?(o=o.add(O),i=M?i.add(g):i.delete(g)):(o=o.delete(g),i=i.delete(g)))}));const p=this.Wu(this.query);if(p)if(Ve(this.query)){const g=[];o.forEach((O=>g.push(O)));const T=Fd(this.query,g);let b=new sr(Ac(this.query));for(const O of T)b=b.add(O);o.forEach((O=>{b.has(O.key)||(i=i.delete(O.key),r.track({type:1,doc:O}))})),o=b}else{const g=this.Qu(this.query);for(;o.size>p;){const T=g==="F"?o.last():o.first();o=o.delete(T.key),i=i.delete(T.key),r.track({type:1,doc:T})}}return{Bu:o,qu:r,Uo:c,mutatedKeys:i}}Wu(e){return Ve(e)?Qa(e)?.limit:e.limit||void 0}Qu(e){if(Ve(e)){const t=Qa(e);return t&&t.limit<0?"L":"F"}return e.limitType}$u(e,t){if(Ve(e)){const r=Qa(e)?.limit;return[t.size===r?t.last():null,null]}return[e.limitType==="F"&&t.size===this.Wu(this.query)?t.last():null,e.limitType==="L"&&t.size===this.Wu(this.query)?t.first():null]}Ku(e,t){return e.hasLocalMutations&&t.hasCommittedMutations&&!t.hasLocalMutations}applyChanges(e,t,r,s){const i=this.Bu;this.Bu=e.Bu,this.mutatedKeys=e.mutatedKeys;const o=e.qu.cu();o.sort(((p,g)=>(function(b,O){const L=M=>{switch(M){case 0:return 1;case 2:case 3:return 2;case 1:return 0;default:return z(20277,{ft:M})}};return L(b)-L(O)})(p.type,g.type)||this.Lu(p.doc,g.doc))),this.Gu(r),s=s??!1;const c=t&&!s?this.zu():[],u=this.Nu.size===0&&this.current&&!s?1:0,l=u!==this.Mu;return this.Mu=u,o.length!==0||l?{snapshot:new Fr(this.query,e.Bu,i,o,e.mutatedKeys,u===0,l,!1,!!r&&r.resumeToken.approximateByteSize()>0),ju:c}:{ju:c}}Ru(e){return this.current&&e==="Offline"?(this.current=!1,this.applyChanges({Bu:this.Bu,qu:new Dh,mutatedKeys:this.mutatedKeys,Uo:!1},!1)):{ju:[]}}Hu(e){return!this.Ou.has(e)&&!!this.Bu.has(e)&&!this.Bu.get(e).hasLocalMutations}Gu(e){e&&(e.addedDocuments.forEach((t=>this.Ou=this.Ou.add(t))),e.modifiedDocuments.forEach((t=>{})),e.removedDocuments.forEach((t=>this.Ou=this.Ou.delete(t))),this.current=e.current)}zu(){if(!this.current)return[];const e=this.Nu;this.Nu=re(),this.Bu.forEach((r=>{this.Hu(r.key)&&(this.Nu=this.Nu.add(r.key))}));const t=[];return e.forEach((r=>{this.Nu.has(r)||t.push(new Yd(r))})),this.Nu.forEach((r=>{e.has(r)||t.push(new Kd(r))})),t}Ju(e){this.Ou=e.Jo,this.Nu=re();const t=this.ku(e.documents);return this.applyChanges(t,!0)}Yu(){return Fr.fromInitialDocuments(this.query,this.Bu,this.mutatedKeys,this.Mu===0,this.hasCachedResults)}}const O1="SyncEngine";class G8{constructor(e,t,r){this.query=e,this.targetId=t,this.view=r}}class W8{constructor(e){this.key=e,this.Zu=!1}}class z8{constructor(e,t,r,s,i,o){this.localStore=e,this.remoteStore=t,this.eventManager=r,this.sharedClientState=s,this.currentUser=i,this.maxConcurrentLimboResolutions=o,this.Xu={},this.ec=new pr((c=>xd(c)),ia),this.tc=new Map,this.nc=new Set,this.rc=new _e(W.comparator),this.sc=new Map,this._c=new _1,this.oc={},this.ac=new Map,this.uc=qn.Cs(),this.onlineState="Unknown",this.cc=void 0}get isPrimaryClient(){return this.cc===!0}}async function K8(n,e,t=!0){const r=t6(n);let s;const i=r.ec.get(e);return i?(r.sharedClientState.addLocalQueryTarget(i.targetId),s=i.view.Yu()):s=await Qd(r,e,t,!0),s}async function Y8(n,e){const t=t6(n);await Qd(t,e,!0,!1)}async function Qd(n,e,t,r){const s=await v8(n.localStore,Ve(e)?e:$t(e)),i=s.targetId,o=n.sharedClientState.addLocalQueryTarget(i,t);let c;return r&&(c=await Q8(n,e,i,o==="current",s.resumeToken)),n.isPrimaryClient&&t&&qd(n.remoteStore,s),c}async function Q8(n,e,t,r,s){n.lc=(g,T,b)=>(async function(L,M,Y,ce){let he=M.view.ku(Y);he.Uo&&(he=await Nh(L.localStore,M.query,!1).then((({documents:v})=>M.view.ku(v,he))));const pe=ce&&ce.targetChanges.get(M.targetId),Be=ce&&ce.targetMismatches.get(M.targetId)!=null,we=M.view.applyChanges(he,L.isPrimaryClient,pe,Be);return Lh(L,M.targetId,we.ju),we.snapshot})(n,g,T,b);const i=await Nh(n.localStore,e,!0),o=new j8(e,i.Jo),c=o.ku(i.documents),u=di.createSynthesizedTargetChangeForCurrentChange(t,r&&n.onlineState!=="Offline",s),l=o.applyChanges(c,n.isPrimaryClient,u);Lh(n,t,l.ju);const p=new G8(e,t,o);return n.ec.set(e,p),n.tc.has(t)?n.tc.get(t).push(e):n.tc.set(t,[e]),l.snapshot}async function X8(n,e,t){const r=Z(n),s=r.ec.get(e),i=r.tc.get(s.targetId);if(i.length>1)return r.tc.set(s.targetId,i.filter((o=>!ia(o,e)))),void r.ec.delete(e);r.isPrimaryClient?(r.sharedClientState.removeLocalQueryTarget(s.targetId),r.sharedClientState.isActiveQueryTarget(s.targetId)||await vc(r.localStore,s.targetId,!1).then((()=>{r.sharedClientState.clearQueryState(s.targetId),t&&T1(r.remoteStore,s.targetId),Pc(r,s.targetId)})).catch(Hr)):(Pc(r,s.targetId),await vc(r.localStore,s.targetId,!0))}async function J8(n,e){const t=Z(n),r=t.ec.get(e),s=t.tc.get(r.targetId);t.isPrimaryClient&&s.length===1&&(t.sharedClientState.removeLocalQueryTarget(r.targetId),T1(t.remoteStore,r.targetId))}async function Z8(n,e,t){const r=o5(n);try{const s=await(function(o,c){const u=Z(o),l=ge.now(),p=c.reduce(((b,O)=>b.add(O.key)),re());let g,T;return u.persistence.runTransaction("Locally write mutations","readwrite",(b=>{let O=at(),L=re();return u.Qo.getEntries(b,p).next((M=>{O=M,O.forEach(((Y,ce)=>{ce.isValidDocument()||(L=L.add(Y))}))})).next((()=>u.localDocuments.getOverlayedDocuments(b,O))).next((M=>{g=M;const Y=[];for(const ce of c){const he=ig(ce,g.get(ce.key).overlayedDocument);he!=null&&Y.push(new Wn(ce.key,he,Cf(he.value.mapValue),rt.exists(!0)))}return u.mutationQueue.addMutationBatch(b,l,Y,c)})).next((M=>{T=M;const Y=M.applyToLocalDocumentSet(g,L);return u.documentOverlayCache.saveOverlays(b,M.batchId,Y)}))})).then((()=>({batchId:T.batchId,changes:zf(g)})))})(r.localStore,e);r.sharedClientState.addPendingMutation(s.batchId),(function(o,c,u){let l=o.oc[o.currentUser.toKey()];l||(l=new _e(se)),l=l.insert(c,u),o.oc[o.currentUser.toKey()]=l})(r,s.batchId,t),await Ei(r,s.changes),await ca(r.remoteStore)}catch(s){const i=C1(s,"Failed to persist write");t.reject(i)}}async function Xd(n,e){const t=Z(n);try{const r=await T8(t.localStore,e);e.targetChanges.forEach(((s,i)=>{const o=t.sc.get(i);o&&(j(s.addedDocuments.size+s.modifiedDocuments.size+s.removedDocuments.size<=1,22616),s.addedDocuments.size>0?o.Zu=!0:s.modifiedDocuments.size>0?j(o.Zu,14607):s.removedDocuments.size>0&&(j(o.Zu,42227),o.Zu=!1))})),await Ei(t,r,e)}catch(r){await Hr(r)}}function xh(n,e,t){const r=Z(n);if(r.isPrimaryClient&&t===0||!r.isPrimaryClient&&t===1){const s=[];r.ec.forEach(((i,o)=>{const c=o.view.Ru(e);c.snapshot&&s.push(c.snapshot)})),(function(o,c){const u=Z(o);u.onlineState=c;let l=!1;u.queries.forEach(((p,g)=>{for(const T of g.Eu)T.Ru(c)&&(l=!0)})),l&&b1(u)})(r.eventManager,e),s.length&&r.Xu.zn(s),r.onlineState=e,r.isPrimaryClient&&r.sharedClientState.setOnlineState(e)}}async function e5(n,e,t){const r=Z(n);r.sharedClientState.updateQueryState(e,"rejected",t);const s=r.sc.get(e),i=s&&s.key;if(i){let o=new _e(W.comparator);o=o.insert(i,We.newNoDocument(i,J.min()));const c=re().add(i),u=new fi(J.min(),new Map,new _e(se),o,at(),c);await Xd(r,u),r.rc=r.rc.remove(i),r.sc.delete(e),k1(r)}else await vc(r.localStore,e,!1).then((()=>Pc(r,e,t))).catch(Hr)}async function t5(n,e){const t=Z(n),r=e.batch.batchId;try{const s=await I8(t.localStore,e);Zd(t,r,null),Jd(t,r),t.sharedClientState.updateMutationState(r,"acknowledged"),await Ei(t,s)}catch(s){await Hr(s)}}async function n5(n,e,t){const r=Z(n);try{const s=await(function(o,c){const u=Z(o);return u.persistence.runTransaction("Reject batch","readwrite-primary",(l=>{let p;return u.mutationQueue.lookupMutationBatch(l,c).next((g=>(j(g!==null,37113),p=g.keys(),u.mutationQueue.removeMutationBatch(l,g)))).next((()=>u.mutationQueue.performConsistencyCheck(l))).next((()=>u.documentOverlayCache.removeOverlaysForBatchId(l,p,c))).next((()=>u.localDocuments.recalculateAndSaveOverlaysForDocumentKeys(l,p))).next((()=>u.localDocuments.getDocuments(l,p)))}))})(r.localStore,e);Zd(r,e,t),Jd(r,e),r.sharedClientState.updateMutationState(e,"rejected",t),await Ei(r,s)}catch(s){await Hr(s)}}function Jd(n,e){(n.ac.get(e)||[]).forEach((t=>{t.resolve()})),n.ac.delete(e)}function Zd(n,e,t){const r=Z(n);let s=r.oc[r.currentUser.toKey()];if(s){const i=s.get(e);i&&(t?i.reject(t):i.resolve(),s=s.remove(e)),r.oc[r.currentUser.toKey()]=s}}function Pc(n,e,t=null){n.sharedClientState.removeLocalQueryTarget(e);for(const r of n.tc.get(e))n.ec.delete(r),t&&n.Xu.Ec(r,t);n.tc.delete(e),n.isPrimaryClient&&n._c.s_(e).forEach((r=>{n._c.containsKey(r)||e6(n,r)}))}function e6(n,e){n.nc.delete(e.path.canonicalString());const t=n.rc.get(e);t!==null&&(T1(n.remoteStore,t),n.rc=n.rc.remove(e),n.sc.delete(t),k1(n))}function Lh(n,e,t){for(const r of t)r instanceof Kd?(n._c.addReference(r.key,e),r5(n,r)):r instanceof Yd?($(O1,"Document no longer in limbo: "+r.key),n._c.removeReference(r.key,e),n._c.containsKey(r.key)||e6(n,r.key)):z(19791,{hc:r})}function r5(n,e){const t=e.key,r=t.path.canonicalString();n.rc.get(t)||n.nc.has(r)||($(O1,"New document in limbo: "+t),n.nc.add(r),k1(n))}function k1(n){for(;n.nc.size>0&&n.rc.size<n.maxConcurrentLimboResolutions;){const e=n.nc.values().next().value;n.nc.delete(e);const t=new W(ue.fromString(e)),r=n.uc.next();n.sc.set(r,new W8(t)),n.rc=n.rc.insert(t,r),qd(n.remoteStore,new en($t(Ko(t.path)),r,"TargetPurposeLimboResolution",$o.ce))}}async function Ei(n,e,t){const r=Z(n),s=[],i=[],o=[];r.ec.isEmpty()||(r.ec.forEach(((c,u)=>{o.push(r.lc(u,e,t).then((l=>{if((l||t)&&r.isPrimaryClient){const p=l?!l.fromCache:t?.targetChanges.get(u.targetId)?.current;r.sharedClientState.updateQueryState(u.targetId,p?"current":"not-current")}if(l){s.push(l);const p=E1.vo(u.targetId,l);i.push(p)}})))})),await Promise.all(o),r.Xu.zn(s),await(async function(u,l){const p=Z(u);try{await p.persistence.runTransaction("notifyLocalViewChanges","readwrite",(g=>x.forEach(l,(T=>x.forEach(T.wo,(b=>p.persistence.referenceDelegate.addReference(g,T.targetId,b))).next((()=>x.forEach(T.bo,(b=>p.persistence.referenceDelegate.removeReference(g,T.targetId,b)))))))))}catch(g){if(!jr(g))throw g;$(I1,"Failed to update sequence numbers: "+g)}for(const g of l){const T=g.targetId;if(!g.fromCache){const b=p.$o.get(T),O=b.snapshotVersion,L=b.withLastLimboFreeSnapshotVersion(O);p.$o=p.$o.insert(T,L)}}})(r.localStore,i))}async function s5(n,e){const t=Z(n);if(!t.currentUser.isEqual(e)){$(O1,"User change. New user:",e.toKey());const r=await Bd(t.localStore,e);t.currentUser=e,(function(i,o){i.ac.forEach((c=>{c.forEach((u=>{u.reject(new U(V.CANCELLED,o))}))})),i.ac.clear()})(t,"'waitForPendingWrites' promise is rejected due to a user change."),t.sharedClientState.handleUserChange(e,r.removedBatchIds,r.addedBatchIds),await Ei(t,r.zo)}}function i5(n,e){const t=Z(n),r=t.sc.get(e);if(r&&r.Zu)return re().add(r.key);{let s=re();const i=t.tc.get(e);if(!i)return s;for(const o of i??[]){const c=t.ec.get(o);s=s.unionWith(c.view.Uu)}return s}}function t6(n){const e=Z(n);return e.remoteStore.remoteSyncer.applyRemoteEvent=Xd.bind(null,e),e.remoteStore.remoteSyncer.getRemoteKeysForTarget=i5.bind(null,e),e.remoteStore.remoteSyncer.rejectListen=e5.bind(null,e),e.Xu.zn=q8.bind(null,e.eventManager),e.Xu.Ec=H8.bind(null,e.eventManager),e}function o5(n){const e=Z(n);return e.remoteStore.remoteSyncer.applySuccessfulWrite=t5.bind(null,e),e.remoteStore.remoteSyncer.rejectFailedWrite=n5.bind(null,e),e}class Ro{constructor(){this.kind="memory",this.synchronizeTabs=!1}async initialize(e){this.serializer=Qo(e.databaseInfo.databaseId),this.sharedClientState=this.Rc(e),this.persistence=this.Ic(e),await this.persistence.start(),this.localStore=this.Ac(e),this.gcScheduler=this.Vc(e,this.localStore),this.indexBackfillerScheduler=this.dc(e,this.localStore)}Vc(e,t){return null}dc(e,t){return null}Ac(e){return E8(this.persistence,new g8,e.initialUser,this.serializer)}Ic(e){return new Ud(y1.C_,this.serializer)}Rc(e){return new C8}async terminate(){this.gcScheduler?.stop(),this.indexBackfillerScheduler?.stop(),this.sharedClientState.shutdown(),await this.persistence.shutdown()}}Ro.provider={build:()=>new Ro};class a5 extends Ro{constructor(e){super(),this.cacheSizeBytes=e}Vc(e,t){j(this.persistence.referenceDelegate instanceof Ao,46915);const r=this.persistence.referenceDelegate.garbageCollector;return new h3(r,e.asyncQueue,t)}Ic(e){const t=this.cacheSizeBytes!==void 0?ot.withCacheSize(this.cacheSizeBytes):ot.DEFAULT;return new Ud((r=>Ao.C_(r,t)),this.serializer)}}class Sc{async initialize(e,t){this.localStore||(this.localStore=e.localStore,this.sharedClientState=e.sharedClientState,this.datastore=this.createDatastore(t),this.remoteStore=this.createRemoteStore(t),this.eventManager=this.createEventManager(t),this.syncEngine=this.createSyncEngine(t,!e.synchronizeTabs),this.sharedClientState.onlineStateHandler=r=>xh(this.syncEngine,r,1),this.remoteStore.remoteSyncer.handleCredentialChange=s5.bind(null,this.syncEngine),await U8(this.remoteStore,this.syncEngine.isPrimaryClient))}createEventManager(e){return(function(){return new $8})()}createDatastore(e){const t=Qo(e.databaseInfo.databaseId),r=n3(e.databaseInfo);return a3(e.authCredentials,e.appCheckCredentials,r,t)}createRemoteStore(e){return(function(r,s,i,o,c){return new S8(r,s,i,o,c)})(this.localStore,this.datastore,e.asyncQueue,(t=>xh(this.syncEngine,t,0)),(function(){return Ih.C()?new Ih:new Jg})())}createSyncEngine(e,t){return(function(s,i,o,c,u,l,p){const g=new z8(s,i,o,c,u,l);return p&&(g.cc=!0),g})(this.localStore,this.remoteStore,this.eventManager,this.sharedClientState,e.initialUser,e.maxConcurrentLimboResolutions,t)}async terminate(){await(async function(t){const r=Z(t);$(Wt,"RemoteStore shutting down."),r.tu.add(5),await yi(r),r.ru.shutdown(),r.iu.set("Unknown")})(this.remoteStore),this.datastore?.terminate(),this.eventManager?.terminate()}}Sc.provider={build:()=>new Sc};/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *//**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class D1{constructor(e){this.observer=e,this.muted=!1}next(e){this.muted||this.observer.next&&this.mc(this.observer.next,e)}error(e){this.muted||(this.observer.error?this.mc(this.observer.error,e):on("Uncaught Error in snapshot listener:",e.toString()))}gc(){this.muted=!0}mc(e,t){setTimeout((()=>{this.muted||e(t)}),0)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const jn="FirestoreClient";class c5{constructor(e,t,r,s,i){this.authCredentials=e,this.appCheckCredentials=t,this.asyncQueue=r,this._databaseInfo=s,this.user=Ge.UNAUTHENTICATED,this.clientId=Wc.newId(),this.authCredentialListener=()=>Promise.resolve(),this.appCheckCredentialListener=()=>Promise.resolve(),this._uninitializedComponentsProvider=i,this.authCredentials.start(r,(async o=>{$(jn,"Received user=",o.uid),await this.authCredentialListener(o),this.user=o})),this.appCheckCredentials.start(r,(o=>($(jn,"Received new app check token=",o),this.appCheckCredentialListener(o,this.user))))}get configuration(){return{asyncQueue:this.asyncQueue,databaseInfo:this._databaseInfo,clientId:this.clientId,authCredentials:this.authCredentials,appCheckCredentials:this.appCheckCredentials,initialUser:this.user,maxConcurrentLimboResolutions:100}}setCredentialChangeListener(e){this.authCredentialListener=e}setAppCheckTokenChangeListener(e){this.appCheckCredentialListener=e}terminate(){this.asyncQueue.enterRestrictedMode();const e=new Bt;return this.asyncQueue.enqueueAndForgetEvenWhileRestricted((async()=>{try{this._onlineComponents&&await this._onlineComponents.terminate(),this._offlineComponents&&await this._offlineComponents.terminate(),this.authCredentials.shutdown(),this.appCheckCredentials.shutdown(),e.resolve()}catch(t){const r=C1(t,"Failed to shutdown persistence");e.reject(r)}})),e.promise}}async function Ja(n,e){n.asyncQueue.verifyOperationInProgress(),$(jn,"Initializing OfflineComponentProvider");const t=n.configuration;await e.initialize(t);let r=t.initialUser;n.setCredentialChangeListener((async s=>{r.isEqual(s)||(await Bd(e.localStore,s),r=s)})),e.persistence.setDatabaseDeletedListener((()=>n.terminate())),n._offlineComponents=e}async function Mh(n,e){n.asyncQueue.verifyOperationInProgress();const t=await u5(n);$(jn,"Initializing OnlineComponentProvider"),await e.initialize(t,n.configuration),n.setCredentialChangeListener((r=>kh(e.remoteStore,r))),n.setAppCheckTokenChangeListener(((r,s)=>kh(e.remoteStore,s))),n._onlineComponents=e}async function u5(n){if(!n._offlineComponents)if(n._uninitializedComponentsProvider){$(jn,"Using user provided OfflineComponentProvider");try{await Ja(n,n._uninitializedComponentsProvider._offline)}catch(e){const t=e;if(!(function(s){return s.name==="FirebaseError"?s.code===V.FAILED_PRECONDITION||s.code===V.UNIMPLEMENTED:!(typeof DOMException<"u"&&s instanceof DOMException)||s.code===22||s.code===20||s.code===11})(t))throw t;Ot("Error using user provided cache. Falling back to memory cache: "+t),await Ja(n,new Ro)}}else $(jn,"Using default OfflineComponentProvider"),await Ja(n,new a5(void 0));return n._offlineComponents}async function V1(n){return n._onlineComponents||(n._uninitializedComponentsProvider?($(jn,"Using user provided OnlineComponentProvider"),await Mh(n,n._uninitializedComponentsProvider._online)):($(jn,"Using default OnlineComponentProvider"),await Mh(n,new Sc))),n._onlineComponents}function l5(n){return V1(n).then((e=>e.syncEngine))}function h5(n){return V1(n).then((e=>e.datastore))}async function Co(n){const e=await V1(n),t=e.eventManager;return t.onListen=K8.bind(null,e.syncEngine),t.onUnlisten=X8.bind(null,e.syncEngine),t.onFirstRemoteStoreListen=Y8.bind(null,e.syncEngine),t.onLastRemoteStoreUnlisten=J8.bind(null,e.syncEngine),t}function f5(n,e,t,r){const s=new D1(r),i=new N1(e,s,t);return n.asyncQueue.enqueueAndForget((async()=>P1(await Co(n),i))),()=>{s.gc(),n.asyncQueue.enqueueAndForget((async()=>S1(await Co(n),i)))}}function d5(n,e,t={}){const r=new Bt;return n.asyncQueue.enqueueAndForget((async()=>(function(i,o,c,u,l){const p=new D1({next:T=>{p.gc(),o.enqueueAndForget((()=>S1(i,g)));const b=T.docs.has(c);!b&&T.fromCache?l.reject(new U(V.UNAVAILABLE,"Failed to get document because the client is offline.")):b&&T.fromCache&&u&&u.source==="server"?l.reject(new U(V.UNAVAILABLE,'Failed to get document from server. (However, this document does exist in the local cache. Run again without setting source to "server" to retrieve the cached document.)')):l.resolve(T)},error:T=>l.reject(T)}),g=new N1(Ko(c.path),p,{includeMetadataChanges:!0,waitForSyncWhenOnline:!0});return P1(i,g)})(await Co(n),n.asyncQueue,e,t,r))),r.promise}function p5(n,e,t={}){const r=new Bt;return n.asyncQueue.enqueueAndForget((async()=>(function(i,o,c,u,l){const p=new D1({next:T=>{p.gc(),o.enqueueAndForget((()=>S1(i,g))),T.fromCache&&u.source==="server"?l.reject(new U(V.UNAVAILABLE,'Failed to get documents from server. (However, these documents may exist in the local cache. Run again without setting source to "server" to retrieve the cached documents.)')):l.resolve(T)},error:T=>l.reject(T)}),g=new N1(c instanceof xs?K9(c):c,p,{includeMetadataChanges:!0,waitForSyncWhenOnline:!0});return P1(i,g)})(await Co(n),n.asyncQueue,e,t,r))),r.promise}function m5(n,e,t){const r=new Bt;return n.asyncQueue.enqueueAndForget((async()=>{try{const s=await h5(n);r.resolve((async function(o,c,u){const l=Z(o),{request:p,wt:g,parent:T}=Hg(l.serializer,Ig(c),u);l.connection.Ot||delete p.parent;const b=(await l.$t("RunAggregationQuery",l.serializer.databaseId,T,p,1)).filter((L=>!!L.result));j(b.length===1,64727);const O=b[0].result?.aggregateFields;return Object.keys(O).reduce(((L,M)=>(L[g[M]]=O[M],L)),{})})(s,e,t))}catch(s){r.reject(s)}})),r.promise}function g5(n,e){const t=new Bt;return n.asyncQueue.enqueueAndForget((async()=>Z8(await l5(n),e,t))),t.promise}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Fh="AsyncQueue";class Uh{constructor(e=Promise.resolve()){this.qc=[],this.$c=!1,this.Kc=[],this.Wc=null,this.Qc=!1,this.Gc=!1,this.zc=[],this.xn=new cd(this,"async_queue_retry"),this.jc=()=>{const r=Xa();r&&$(Fh,"Visibility state changed to "+r.visibilityState),this.xn.gn()},this.Hc=e;const t=Xa();t&&typeof t.addEventListener=="function"&&t.addEventListener("visibilitychange",this.jc)}get isShuttingDown(){return this.$c}enqueueAndForget(e){this.enqueue(e)}enqueueAndForgetEvenWhileRestricted(e){this.Jc(),this.Yc(e)}enterRestrictedMode(e){if(!this.$c){this.$c=!0,this.Gc=e||!1;const t=Xa();t&&typeof t.removeEventListener=="function"&&t.removeEventListener("visibilitychange",this.jc)}}enqueue(e){if(this.Jc(),this.$c)return new Promise((()=>{}));const t=new Bt;return this.Yc((()=>this.$c&&this.Gc?Promise.resolve():(e().then(t.resolve,t.reject),t.promise))).then((()=>t.promise))}enqueueRetryable(e){this.enqueueAndForget((()=>(this.qc.push(e),this.Zc())))}async Zc(){if(this.qc.length!==0){try{await this.qc[0](),this.qc.shift(),this.xn.reset()}catch(e){if(!jr(e))throw e;$(Fh,"Operation failed with retryable error: "+e)}this.qc.length>0&&this.xn.mn((()=>this.Zc()))}}Yc(e){const t=this.Hc.then((()=>(this.Qc=!0,e().catch((r=>{throw this.Wc=r,this.Qc=!1,on("INTERNAL UNHANDLED ERROR: ",Bh(r)),r})).then((r=>(this.Qc=!1,r))))));return this.Hc=t,t}enqueueAfterDelay(e,t,r){this.Jc(),this.zc.indexOf(e)>-1&&(t=0);const s=R1.createAndSchedule(this,e,t,r,(i=>this.Xc(i)));return this.Kc.push(s),s}Jc(){this.Wc&&z(47125,{el:Bh(this.Wc)})}verifyOperationInProgress(){}async tl(){let e;do e=this.Hc,await e;while(e!==this.Hc)}nl(e){for(const t of this.Kc)if(t.timerId===e)return!0;return!1}rl(e){return this.tl().then((()=>{this.Kc.sort(((t,r)=>t.targetTimeMs-r.targetTimeMs));for(const t of this.Kc)if(t.skipDelay(),e!=="all"&&t.timerId===e)break;return this.tl()}))}il(e){this.zc.push(e)}Xc(e){const t=this.Kc.indexOf(e);this.Kc.splice(t,1)}}function Bh(n){let e=n.message||"";return n.stack&&(e=n.stack.includes(n.message)?n.stack:n.message+`
`+n.stack),e}class Dt extends Xo{constructor(e,t,r,s){super(e,t,r,s),this.type="firestore",this._queue=new Uh,this._persistenceKey=s?.name||"[DEFAULT]"}async _terminate(){if(this._firestoreClient){const e=this._firestoreClient.terminate();this._queue=new Uh(e),this._firestoreClient=void 0,await e}}}function $y(n,e,t){t||(t=js);const r=un(n,"firestore");if(r.isInitialized(t)){const s=r.getImmediate({identifier:t}),i=r.getOptions(t);if(jt(i,e))return s;throw new U(V.FAILED_PRECONDITION,"initializeFirestore() has already been called with different options. To avoid this error, call initializeFirestore() with the same options as when it was originally called, or call getFirestore() to return the already initialized instance.")}if(e.cacheSizeBytes!==void 0&&e.localCache!==void 0)throw new U(V.INVALID_ARGUMENT,"cache and cacheSizeBytes cannot be specified at the same time as cacheSizeBytes willbe deprecated. Instead, specify the cache size in the cache object");if(e.cacheSizeBytes!==void 0&&e.cacheSizeBytes!==-1&&e.cacheSizeBytes<hd)throw new U(V.INVALID_ARGUMENT,"cacheSizeBytes must be at least 1048576");return e.host&&hr(e.host)&&ko(e.host),r.initialize({options:e,instanceIdentifier:t})}function qy(n,e){const t=typeof n=="object"?n:Vo(),r=typeof n=="string"?n:js,s=un(t,"firestore").getImmediate({identifier:r});if(!s._initialized){const i=u2("firestore");i&&p3(s,...i)}return s}function Xr(n){if(n._terminated)throw new U(V.FAILED_PRECONDITION,"The client has already been terminated.");return n._firestoreClient||_5(n),n._firestoreClient}function _5(n){const e=n._freezeSettings(),t=u3(n._databaseId,n._app?.options.appId||"",n._persistenceKey,n._app?.options.apiKey,e);n._componentsProvider||e.localCache?._offlineComponentProvider&&e.localCache?._onlineComponentProvider&&(n._componentsProvider={_offline:e.localCache._offlineComponentProvider,_online:e.localCache._onlineComponentProvider}),n._firestoreClient=new c5(n._authCredentials,n._appCheckCredentials,n._queue,t,n._componentsProvider&&(function(s){const i=s?._online.build();return{_offline:s?._offline.build(i),_online:i}})(n._componentsProvider))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class y5{convertValue(e,t="none"){switch(Oe(e)){case 0:return null;case 1:return e.booleanValue;case 2:return Ee(e.integerValue||e.doubleValue);case 3:return this.convertTimestamp(e.timestampValue);case 4:return this.convertServerTimestamp(e,t);case 5:return e.stringValue;case 6:return this.convertBytes(Mn(e.bytesValue));case 7:return this.convertReference(e.referenceValue);case 8:return this.convertGeoPoint(e.geoPointValue);case 9:return this.convertArray(e.arrayValue,t);case 11:return this.convertObject(e.mapValue,t);case 10:return this.convertVectorValue(e.mapValue);default:throw z(62114,{value:e})}}convertObject(e,t){return this.convertObjectMap(e.fields,t)}convertObjectMap(e,t="none"){const r={};return Gn(e,((s,i)=>{r[s]=this.convertValue(i,t)})),r}convertVectorValue(e){const t=e.fields?.[Ws].arrayValue?.values?.map((r=>Ee(r.doubleValue)));return new ut(t)}convertGeoPoint(e){return new Ht(Ee(e.latitude),Ee(e.longitude))}convertArray(e,t){return(e.values||[]).map((r=>this.convertValue(r,t)))}convertServerTimestamp(e,t){switch(t){case"previous":const r=li(e);return r==null?null:this.convertValue(r,t);case"estimate":return this.convertTimestamp(Dr(e));default:return null}}convertTimestamp(e){const t=Ln(e);return new ge(t.seconds,t.nanos)}convertDocumentKey(e,t){const r=ue.fromString(e);j(sd(r),9688,{name:e});const s=new Gs(r.get(1),r.get(3)),i=new W(r.popFirst(5));return s.isEqual(t)||on(`Document ${i} contains a document reference within a different database (${s.projectId}/${s.database}) which is not supported. It will be treated as a reference in the current database (${t.projectId}/${t.database}) instead.`),i}}/**
 * @license
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ua extends y5{constructor(e){super(),this.firestore=e}convertBytes(e){return new wt(e)}convertReference(e){const t=this.convertDocumentKey(e,this.firestore._databaseId);return new Ie(this.firestore,null,t)}}const $h="@firebase/firestore",qh="4.16.0";/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Hh(n){return(function(t,r){if(typeof t!="object"||t===null)return!1;const s=t;for(const i of r)if(i in s&&typeof s[i]=="function")return!0;return!1})(n,["next","error","complete"])}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class E5{constructor(e="count",t){this._internalFieldPath=t,this.type="AggregateField",this.aggregateType=e}}class I5{constructor(e,t,r){this._userDataWriter=t,this._data=r,this.type="AggregateQuerySnapshot",this.query=e}data(){return this._userDataWriter.convertObjectMap(this._data)}_fieldsProto(){return new Ke({mapValue:{fields:this._data}}).clone().value.mapValue.fields}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class n6{constructor(e,t,r,s,i){this._firestore=e,this._userDataWriter=t,this._key=r,this._document=s,this._converter=i}get id(){return this._key.path.lastSegment()}get ref(){return new Ie(this._firestore,this._converter,this._key)}exists(){return this._document!==null}data(){if(this._document){if(this._converter){const e=new T5(this._firestore,this._userDataWriter,this._key,this._document,null);return this._converter.fromFirestore(e)}return this._userDataWriter.convertValue(this._document.data.value)}}_fieldsProto(){return this._document?.data.clone().value.mapValue.fields??void 0}get(e){if(this._document){const t=this._document.data.field(Un("DocumentSnapshot.get",e));if(t!==null)return this._userDataWriter.convertValue(t)}}}class T5 extends n6{data(){return super.data()}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function r6(n){if(n.limitType==="L"&&n.explicitOrderBy.length===0)throw new U(V.UNIMPLEMENTED,"limitToLast() queries require specifying at least one orderBy() clause")}class x1{}class L1 extends x1{}function Hy(n,e,...t){let r=[];e instanceof x1&&r.push(e),r=r.concat(t),(function(i){const o=i.filter((u=>u instanceof M1)).length,c=i.filter((u=>u instanceof la)).length;if(o>1||o>0&&c>0)throw new U(V.INVALID_ARGUMENT,"InvalidQuery. When using composite filters, you cannot use more than one filter at the top level. Consider nesting the multiple filters within an `and(...)` statement. For example: change `query(query, where(...), or(...))` to `query(query, and(where(...), or(...)))`.")})(r);for(const s of r)n=s._apply(n);return n}class la extends L1{constructor(e,t,r){super(),this._field=e,this._op=t,this._value=r,this.type="where"}static _create(e,t,r){return new la(e,t,r)}_apply(e){const t=this._parse(e);return s6(e._query,t),new ln(e.firestore,e.converter,_c(e._query,t))}_parse(e){const t=gi(e.firestore);return(function(i,o,c,u,l,p,g){let T;if(l.isKeyField()){if(p==="array-contains"||p==="array-contains-any")throw new U(V.INVALID_ARGUMENT,`Invalid Query. You can't perform '${p}' queries on documentId().`);if(p==="in"||p==="not-in"){Gh(g,p);const O=[];for(const L of g)O.push(jh(u,i,L));T={arrayValue:{values:O}}}else T=jh(u,i,g)}else p!=="in"&&p!=="not-in"&&p!=="array-contains-any"||Gh(g,p),T=I3(c,o,g,p==="in"||p==="not-in");return Pe.create(l,p,T)})(e._query,"where",t,e.firestore._databaseId,this._field,this._op,this._value)}}function jy(n,e,t){const r=e,s=Un("where",n);return la._create(s,r,t)}class M1 extends x1{constructor(e,t){super(),this.type=e,this._queryConstraints=t}static _create(e,t){return new M1(e,t)}_parse(e){const t=this._queryConstraints.map((r=>r._parse(e))).filter((r=>r.getFilters().length>0));return t.length===1?t[0]:kt.create(t,this._getOperator())}_apply(e){const t=this._parse(e);return t.getFilters().length===0?e:((function(s,i){let o=s;const c=i.getFlattenedFilters();for(const u of c)s6(o,u),o=_c(o,u)})(e._query,t),new ln(e.firestore,e.converter,_c(e._query,t)))}_getQueryConstraints(){return this._queryConstraints}_getOperator(){return this.type==="and"?"and":"or"}}class F1 extends L1{constructor(e,t){super(),this._field=e,this._direction=t,this.type="orderBy"}static _create(e,t){return new F1(e,t)}_apply(e){const t=(function(s,i,o){if(s.startAt!==null)throw new U(V.INVALID_ARGUMENT,"Invalid query. You must not call startAt() or startAfter() before calling orderBy().");if(s.endAt!==null)throw new U(V.INVALID_ARGUMENT,"Invalid query. You must not call endAt() or endBefore() before calling orderBy().");return new Xs(i,o)})(e._query,this._field,this._direction);return new ln(e.firestore,e.converter,Tg(e._query,t))}}function Gy(n,e="asc"){const t=e,r=Un("orderBy",n);return F1._create(r,t)}class U1 extends L1{constructor(e,t,r){super(),this.type=e,this._limit=t,this._limitType=r}static _create(e,t,r){return new U1(e,t,r)}_apply(e){return new ln(e.firestore,e.converter,yo(e._query,this._limit,this._limitType))}}function Wy(n){return Fm("limit",n),U1._create("limit",n,"F")}function jh(n,e,t){if(typeof(t=le(t))=="string"){if(t==="")throw new U(V.INVALID_ARGUMENT,"Invalid query. When querying with documentId(), you must provide a valid document ID, but it was an empty string.");if(!Hf(e)&&t.indexOf("/")!==-1)throw new U(V.INVALID_ARGUMENT,`Invalid query. When querying a collection by documentId(), you must provide a plain document ID, but '${t}' contains a '/' character.`);const r=e.path.child(ue.fromString(t));if(!W.isDocumentKey(r))throw new U(V.INVALID_ARGUMENT,`Invalid query. When querying a collection group by documentId(), the value provided must result in a valid document path, but '${r}' is not because it has an odd number of segments (${r.length}).`);return ih(n,new W(r))}if(t instanceof Ie)return ih(n,t._key);throw new U(V.INVALID_ARGUMENT,`Invalid query. When querying with documentId(), you must provide a valid string or a DocumentReference, but it was: ${Bo(t)}.`)}function Gh(n,e){if(!Array.isArray(n)||n.length===0)throw new U(V.INVALID_ARGUMENT,`Invalid Query. A non-empty array is required for '${e.toString()}' filters.`)}function s6(n,e){const t=(function(s,i){for(const o of s)for(const c of o.getFlattenedFilters())if(i.indexOf(c.op)>=0)return c.op;return null})(n.filters,(function(s){switch(s){case"!=":return["!=","not-in"];case"array-contains-any":case"in":return["not-in"];case"not-in":return["array-contains-any","in","not-in","!="];default:return[]}})(e.op));if(t!==null)throw t===e.op?new U(V.INVALID_ARGUMENT,`Invalid query. You cannot use more than one '${e.op.toString()}' filter.`):new U(V.INVALID_ARGUMENT,`Invalid query. You cannot use '${e.op.toString()}' filters with '${t.toString()}' filters.`)}function B1(n,e,t){let r;return r=n?t&&(t.merge||t.mergeFields)?n.toFirestore(e,t):n.toFirestore(e):e,r}function w5(){return new E5("count")}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function zy(n){return A5(n,{count:w5()})}function A5(n,e){const t=Ye(n.firestore,Dt),r=Xr(t),s=_f(e,((i,o)=>new ag(o,i.aggregateType,i._internalFieldPath)));return m5(r,n._query,s).then((i=>(function(c,u,l){const p=new ua(c);return new I5(u,p,l)})(t,n,i)))}class As{constructor(e,t){this.hasPendingWrites=e,this.fromCache=t}isEqual(e){return this.hasPendingWrites===e.hasPendingWrites&&this.fromCache===e.fromCache}}class ir extends n6{constructor(e,t,r,s,i,o){super(e,t,r,s,o),this._firestore=e,this._firestoreImpl=e,this.metadata=i}exists(){return super.exists()}data(e={}){if(this._document){if(this._converter){const t=new no(this._firestore,this._userDataWriter,this._key,this._document,this.metadata,null);return this._converter.fromFirestore(t,e)}return this._userDataWriter.convertValue(this._document.data.value,e.serverTimestamps)}}get(e,t={}){if(this._document){const r=this._document.data.field(Un("DocumentSnapshot.get",e));if(r!==null)return this._userDataWriter.convertValue(r,t.serverTimestamps)}}toJSON(){if(this.metadata.hasPendingWrites)throw new U(V.FAILED_PRECONDITION,"DocumentSnapshot.toJSON() attempted to serialize a document with pending writes. Await waitForPendingWrites() before invoking toJSON().");const e=this._document,t={};return t.type=ir._jsonSchemaVersion,t.bundle="",t.bundleSource="DocumentSnapshot",t.bundleName=this._key.toString(),!e||!e.isValidDocument()||!e.isFoundDocument()?t:(this._userDataWriter.convertObjectMap(e.data.value.mapValue.fields,"previous"),t.bundle=(this._firestore,this.ref.path,"NOT SUPPORTED"),t)}}ir._jsonSchemaVersion="firestore/documentSnapshot/1.0",ir._jsonSchema={type:Se("string",ir._jsonSchemaVersion),bundleSource:Se("string","DocumentSnapshot"),bundleName:Se("string"),bundle:Se("string")};class no extends ir{data(e={}){return super.data(e)}}class or{constructor(e,t,r,s){this._firestore=e,this._userDataWriter=t,this._snapshot=s,this.metadata=new As(s.hasPendingWrites,s.fromCache),this.query=r}get docs(){const e=[];return this.forEach((t=>e.push(t))),e}get size(){return this._snapshot.docs.size}get empty(){return this.size===0}forEach(e,t){this._snapshot.docs.forEach((r=>{e.call(t,new no(this._firestore,this._userDataWriter,r.key,r,new As(this._snapshot.mutatedKeys.has(r.key),this._snapshot.fromCache),this.query.converter))}))}docChanges(e={}){const t=!!e.includeMetadataChanges;if(t&&this._snapshot.excludesMetadataChanges)throw new U(V.INVALID_ARGUMENT,"To include metadata changes with your document changes, you must also pass { includeMetadataChanges:true } to onSnapshot().");return this._cachedChanges&&this._cachedChangesIncludeMetadataChanges===t||(this._cachedChanges=(function(s,i){if(s._snapshot.oldDocs.isEmpty()){let o=0;return s._snapshot.docChanges.map((c=>{Ve(s._snapshot.query)?Ac(s._snapshot.query):Xc(s.query._query);const u=new no(s._firestore,s._userDataWriter,c.doc.key,c.doc,new As(s._snapshot.mutatedKeys.has(c.doc.key),s._snapshot.fromCache),s.query.converter);return c.doc,{type:"added",doc:u,oldIndex:-1,newIndex:o++}}))}{let o=s._snapshot.oldDocs;return s._snapshot.docChanges.filter((c=>i||c.type!==3)).map((c=>{const u=new no(s._firestore,s._userDataWriter,c.doc.key,c.doc,new As(s._snapshot.mutatedKeys.has(c.doc.key),s._snapshot.fromCache),s.query.converter);let l=-1,p=-1;return c.type!==0&&(l=o.indexOf(c.doc.key),o=o.delete(c.doc.key)),c.type!==1&&(o=o.add(c.doc),p=o.indexOf(c.doc.key)),{type:v5(c.type),doc:u,oldIndex:l,newIndex:p}}))}})(this,t),this._cachedChangesIncludeMetadataChanges=t),this._cachedChanges}toJSON(){if(this.metadata.hasPendingWrites)throw new U(V.FAILED_PRECONDITION,"QuerySnapshot.toJSON() attempted to serialize a document with pending writes. Await waitForPendingWrites() before invoking toJSON().");const e={};e.type=or._jsonSchemaVersion,e.bundleSource="QuerySnapshot",e.bundleName=Wc.newId(),this._firestore._databaseId.database,this._firestore._databaseId.projectId;const t=[],r=[],s=[];return this.docs.forEach((i=>{i._document!==null&&(t.push(i._document),r.push(this._userDataWriter.convertObjectMap(i._document.data.value.mapValue.fields,"previous")),s.push(i.ref.path))})),e.bundle=(this._firestore,this.query._query,e.bundleName,"NOT SUPPORTED"),e}}function v5(n){switch(n){case 0:return"added";case 2:case 3:return"modified";case 1:return"removed";default:return z(61501,{type:n})}}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */or._jsonSchemaVersion="firestore/querySnapshot/1.0",or._jsonSchema={type:Se("string",or._jsonSchemaVersion),bundleSource:Se("string","QuerySnapshot"),bundleName:Se("string"),bundle:Se("string")};/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class R5{constructor(e,t){this._firestore=e,this._commitHandler=t,this._mutations=[],this._committed=!1,this._dataReader=gi(e)}set(e,t,r){this._verifyNotCommitted();const s=Za(e,this._firestore),i=B1(s.converter,t,r),o=t1(this._dataReader,"WriteBatch.set",s._key,i,s.converter!==null,r);return this._mutations.push(o.toMutation(s._key,rt.none())),this}update(e,t,r,...s){this._verifyNotCommitted();const i=Za(e,this._firestore);let o;return o=typeof(t=le(t))=="string"||t instanceof pi?gd(this._dataReader,"WriteBatch.update",i._key,t,r,s):md(this._dataReader,"WriteBatch.update",i._key,t),this._mutations.push(o.toMutation(i._key,rt.exists(!0))),this}delete(e){this._verifyNotCommitted();const t=Za(e,this._firestore);return this._mutations=this._mutations.concat(new zo(t._key,rt.none())),this}commit(){return this._verifyNotCommitted(),this._committed=!0,this._mutations.length>0?this._commitHandler(this._mutations):Promise.resolve()}_verifyNotCommitted(){if(this._committed)throw new U(V.FAILED_PRECONDITION,"A write batch can no longer be used after commit() has been called.")}}function Za(n,e){if((n=le(n)).firestore!==e)throw new U(V.INVALID_ARGUMENT,"Provided document reference is from a different Firestore instance.");return n}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Ky(n){n=Ye(n,Ie);const e=Ye(n.firestore,Dt),t=Xr(e);return d5(t,n._key).then((r=>i6(e,n,r)))}function Yy(n){n=Ye(n,ln);const e=Ye(n.firestore,Dt),t=Xr(e),r=new ua(e);return r6(n._query),p5(t,n._query).then((s=>new or(e,r,n,s)))}function Qy(n,e,t){n=Ye(n,Ie);const r=Ye(n.firestore,Dt),s=B1(n.converter,e,t),i=gi(r);return Ii(r,[t1(i,"setDoc",n._key,s,n.converter!==null,t).toMutation(n._key,rt.none())])}function Xy(n,e,t,...r){n=Ye(n,Ie);const s=Ye(n.firestore,Dt),i=gi(s);let o;return o=typeof(e=le(e))=="string"||e instanceof pi?gd(i,"updateDoc",n._key,e,t,r):md(i,"updateDoc",n._key,e),Ii(s,[o.toMutation(n._key,rt.exists(!0))])}function Jy(n){return Ii(Ye(n.firestore,Dt),[new zo(n._key,rt.none())])}function Zy(n,e){const t=Ye(n.firestore,Dt),r=m3(n),s=B1(n.converter,e),i=gi(n.firestore);return Ii(t,[t1(i,"addDoc",r._key,s,n.converter!==null,{}).toMutation(r._key,rt.exists(!1))]).then((()=>r))}function eE(n,...e){n=le(n);let t={includeMetadataChanges:!1,source:"default"},r=0;typeof e[r]!="object"||Hh(e[r])||(t=e[r++]);const s={includeMetadataChanges:t.includeMetadataChanges,source:t.source};if(Hh(e[r])){const l=e[r];e[r]=l.next?.bind(l),e[r+1]=l.error?.bind(l),e[r+2]=l.complete?.bind(l)}let i,o,c;if(n instanceof Ie)o=Ye(n.firestore,Dt),c=Ko(n._key.path),i={next:l=>{e[r]&&e[r](i6(o,n,l))},error:e[r+1],complete:e[r+2]};else{const l=Ye(n,ln);o=Ye(l.firestore,Dt),c=l._query;const p=new ua(o);i={next:g=>{e[r]&&e[r](new or(o,p,l,g))},error:e[r+1],complete:e[r+2]},r6(n._query)}const u=Xr(o);return f5(u,c,s,i)}function Ii(n,e){const t=Xr(n);return g5(t,e)}function i6(n,e,t){const r=t.docs.get(e._key),s=new ua(n);return new ir(n,s,e._key,r,new As(t.hasPendingWrites,t.fromCache),e.converter)}function tE(n){return n=Ye(n,Dt),Xr(n),new R5(n,(e=>Ii(n,e)))}(function(e,t=!0){Cm(fr),Nt(new At("firestore",((r,{instanceIdentifier:s,options:i})=>{const o=r.getProvider("app").getImmediate(),c=new Dt(new bm(r.getProvider("auth-internal")),new km(o,r.getProvider("app-check-internal")),Xm(o,s),o);return i={useFetchStreams:t,...i},c._setSettings(i),c}),"PUBLIC").setMultipleInstances(!0)),ct($h,qh,e),ct($h,qh,"esm2020")})();/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const o6="firebasestorage.googleapis.com",C5="storageBucket",P5=120*1e3,S5=600*1e3;/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Kt extends Ct{constructor(e,t,r=0){super(ec(e),`Firebase Storage: ${t} (${ec(e)})`),this.status_=r,this.customData={serverResponse:null},this._baseMessage=this.message,Object.setPrototypeOf(this,Kt.prototype)}get status(){return this.status_}set status(e){this.status_=e}_codeEquals(e){return ec(e)===this.code}get serverResponse(){return this.customData.serverResponse}set serverResponse(e){this.customData.serverResponse=e,this.customData.serverResponse?this.message=`${this._baseMessage}
${this.customData.serverResponse}`:this.message=this._baseMessage}}var zt;(function(n){n.UNKNOWN="unknown",n.OBJECT_NOT_FOUND="object-not-found",n.BUCKET_NOT_FOUND="bucket-not-found",n.PROJECT_NOT_FOUND="project-not-found",n.QUOTA_EXCEEDED="quota-exceeded",n.UNAUTHENTICATED="unauthenticated",n.UNAUTHORIZED="unauthorized",n.UNAUTHORIZED_APP="unauthorized-app",n.RETRY_LIMIT_EXCEEDED="retry-limit-exceeded",n.INVALID_CHECKSUM="invalid-checksum",n.CANCELED="canceled",n.INVALID_EVENT_NAME="invalid-event-name",n.INVALID_URL="invalid-url",n.INVALID_DEFAULT_BUCKET="invalid-default-bucket",n.NO_DEFAULT_BUCKET="no-default-bucket",n.CANNOT_SLICE_BLOB="cannot-slice-blob",n.SERVER_FILE_WRONG_SIZE="server-file-wrong-size",n.NO_DOWNLOAD_URL="no-download-url",n.INVALID_ARGUMENT="invalid-argument",n.INVALID_ARGUMENT_COUNT="invalid-argument-count",n.APP_DELETED="app-deleted",n.INVALID_ROOT_OPERATION="invalid-root-operation",n.INVALID_FORMAT="invalid-format",n.INTERNAL_ERROR="internal-error",n.UNSUPPORTED_ENVIRONMENT="unsupported-environment"})(zt||(zt={}));function ec(n){return"storage/"+n}function b5(){const n="An unknown error occurred, please check the error payload for server response.";return new Kt(zt.UNKNOWN,n)}function N5(){return new Kt(zt.RETRY_LIMIT_EXCEEDED,"Max retry time for operation exceeded, please try again.")}function O5(){return new Kt(zt.CANCELED,"User canceled the upload/download.")}function k5(n){return new Kt(zt.INVALID_URL,"Invalid URL '"+n+"'.")}function D5(n){return new Kt(zt.INVALID_DEFAULT_BUCKET,"Invalid default bucket '"+n+"'.")}function Wh(n){return new Kt(zt.INVALID_ARGUMENT,n)}function a6(){return new Kt(zt.APP_DELETED,"The Firebase app was deleted.")}function V5(n){return new Kt(zt.INVALID_ROOT_OPERATION,"The operation '"+n+"' cannot be performed on a root reference, create a non-root reference using child, such as .child('file.png').")}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class bt{constructor(e,t){this.bucket=e,this.path_=t}get path(){return this.path_}get isRoot(){return this.path.length===0}fullServerUrl(){const e=encodeURIComponent;return"/b/"+e(this.bucket)+"/o/"+e(this.path)}bucketOnlyServerUrl(){return"/b/"+encodeURIComponent(this.bucket)+"/o"}static makeFromBucketSpec(e,t){let r;try{r=bt.makeFromUrl(e,t)}catch{return new bt(e,"")}if(r.path==="")return r;throw D5(e)}static makeFromUrl(e,t){let r=null;const s="([A-Za-z0-9.\\-_]+)";function i(pe){pe.path.charAt(pe.path.length-1)==="/"&&(pe.path_=pe.path_.slice(0,-1))}const o="(/(.*))?$",c=new RegExp("^gs://"+s+o,"i"),u={bucket:1,path:3};function l(pe){pe.path_=decodeURIComponent(pe.path)}const p="v[A-Za-z0-9_]+",g=t.replace(/[.]/g,"\\."),T="(/([^?#]*).*)?$",b=new RegExp(`^https?://${g}/${p}/b/${s}/o${T}`,"i"),O={bucket:1,path:3},L=t===o6?"(?:storage.googleapis.com|storage.cloud.google.com)":t,M="([^?#]*)",Y=new RegExp(`^https?://${L}/${s}/${M}`,"i"),he=[{regex:c,indices:u,postModify:i},{regex:b,indices:O,postModify:l},{regex:Y,indices:{bucket:1,path:2},postModify:l}];for(let pe=0;pe<he.length;pe++){const Be=he[pe],we=Be.regex.exec(e);if(we){const v=we[Be.indices.bucket];let y=we[Be.indices.path];y||(y=""),r=new bt(v,y),Be.postModify(r);break}}if(r==null)throw k5(e);return r}}class x5{constructor(e){this.promise_=Promise.reject(e)}getPromise(){return this.promise_}cancel(e=!1){}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function L5(n,e,t){let r=1,s=null,i=null,o=!1,c=0;function u(){return c===2}let l=!1;function p(...M){l||(l=!0,e.apply(null,M))}function g(M){s=setTimeout(()=>{s=null,n(b,u())},M)}function T(){i&&clearTimeout(i)}function b(M,...Y){if(l){T();return}if(M){T(),p.call(null,M,...Y);return}if(u()||o){T(),p.call(null,M,...Y);return}r<64&&(r*=2);let he;c===1?(c=2,he=0):he=(r+Math.random())*1e3,g(he)}let O=!1;function L(M){O||(O=!0,T(),!l&&(s!==null?(M||(c=2),clearTimeout(s),g(0)):M||(c=1)))}return g(0),i=setTimeout(()=>{o=!0,L(!0)},t),L}function M5(n){n(!1)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function F5(n){return n!==void 0}function zh(n,e,t,r){if(r<e)throw Wh(`Invalid value for '${n}'. Expected ${e} or greater.`);if(r>t)throw Wh(`Invalid value for '${n}'. Expected ${t} or less.`)}function U5(n){const e=encodeURIComponent;let t="?";for(const r in n)if(n.hasOwnProperty(r)){const s=e(r)+"="+e(n[r]);t=t+s+"&"}return t=t.slice(0,-1),t}var Po;(function(n){n[n.NO_ERROR=0]="NO_ERROR",n[n.NETWORK_ERROR=1]="NETWORK_ERROR",n[n.ABORT=2]="ABORT"})(Po||(Po={}));/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function B5(n,e){const t=n>=500&&n<600,s=[408,429].indexOf(n)!==-1,i=e.indexOf(n)!==-1;return t||s||i}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class $5{constructor(e,t,r,s,i,o,c,u,l,p,g,T=!0,b=!1){this.url_=e,this.method_=t,this.headers_=r,this.body_=s,this.successCodes_=i,this.additionalRetryCodes_=o,this.callback_=c,this.errorCallback_=u,this.timeout_=l,this.progressCallback_=p,this.connectionFactory_=g,this.retry=T,this.isUsingEmulator=b,this.pendingConnection_=null,this.backoffId_=null,this.canceled_=!1,this.appDelete_=!1,this.promise_=new Promise((O,L)=>{this.resolve_=O,this.reject_=L,this.start_()})}start_(){const e=(r,s)=>{if(s){r(!1,new ji(!1,null,!0));return}const i=this.connectionFactory_();this.pendingConnection_=i;const o=c=>{const u=c.loaded,l=c.lengthComputable?c.total:-1;this.progressCallback_!==null&&this.progressCallback_(u,l)};this.progressCallback_!==null&&i.addUploadProgressListener(o),i.send(this.url_,this.method_,this.isUsingEmulator,this.body_,this.headers_).then(()=>{this.progressCallback_!==null&&i.removeUploadProgressListener(o),this.pendingConnection_=null;const c=i.getErrorCode()===Po.NO_ERROR,u=i.getStatus();if(!c||B5(u,this.additionalRetryCodes_)&&this.retry){const p=i.getErrorCode()===Po.ABORT;r(!1,new ji(!1,null,p));return}const l=this.successCodes_.indexOf(u)!==-1;r(!0,new ji(l,i))})},t=(r,s)=>{const i=this.resolve_,o=this.reject_,c=s.connection;if(s.wasSuccessCode)try{const u=this.callback_(c,c.getResponse());F5(u)?i(u):i()}catch(u){o(u)}else if(c!==null){const u=b5();u.serverResponse=c.getErrorText(),this.errorCallback_?o(this.errorCallback_(c,u)):o(u)}else if(s.canceled){const u=this.appDelete_?a6():O5();o(u)}else{const u=N5();o(u)}};this.canceled_?t(!1,new ji(!1,null,!0)):this.backoffId_=L5(e,t,this.timeout_)}getPromise(){return this.promise_}cancel(e){this.canceled_=!0,this.appDelete_=e||!1,this.backoffId_!==null&&M5(this.backoffId_),this.pendingConnection_!==null&&this.pendingConnection_.abort()}}class ji{constructor(e,t,r){this.wasSuccessCode=e,this.connection=t,this.canceled=!!r}}function q5(n,e){e!==null&&e.length>0&&(n.Authorization="Firebase "+e)}function H5(n,e){n["X-Firebase-Storage-Version"]="webjs/"+(e??"AppManager")}function j5(n,e){e&&(n["X-Firebase-GMPID"]=e)}function G5(n,e){e!==null&&(n["X-Firebase-AppCheck"]=e)}function W5(n,e,t,r,s,i,o=!0,c=!1){const u=U5(n.urlParams),l=n.url+u,p=Object.assign({},n.headers);return j5(p,e),q5(p,t),H5(p,i),G5(p,r),new $5(l,n.method,p,n.body,n.successCodes,n.additionalRetryCodes,n.handler,n.errorHandler,n.timeout,n.progressCallback,s,o,c)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function z5(n){if(n.length===0)return null;const e=n.lastIndexOf("/");return e===-1?"":n.slice(0,e)}function K5(n){const e=n.lastIndexOf("/",n.length-2);return e===-1?n:n.slice(e+1)}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class So{constructor(e,t){this._service=e,t instanceof bt?this._location=t:this._location=bt.makeFromUrl(t,e.host)}toString(){return"gs://"+this._location.bucket+"/"+this._location.path}_newRef(e,t){return new So(e,t)}get root(){const e=new bt(this._location.bucket,"");return this._newRef(this._service,e)}get bucket(){return this._location.bucket}get fullPath(){return this._location.path}get name(){return K5(this._location.path)}get storage(){return this._service}get parent(){const e=z5(this._location.path);if(e===null)return null;const t=new bt(this._location.bucket,e);return new So(this._service,t)}_throwIfRoot(e){if(this._location.path==="")throw V5(e)}}function Kh(n,e){const t=e?.[C5];return t==null?null:bt.makeFromBucketSpec(t,n)}function Y5(n,e,t,r={}){n.host=`${e}:${t}`;const s=hr(e);s&&ko(`https://${n.host}/b`),n._isUsingEmulator=!0,n._protocol=s?"https":"http";const{mockUserToken:i}=r;i&&(n._overrideAuthToken=typeof i=="string"?i:d2(i,n.app.options.projectId))}class Q5{constructor(e,t,r,s,i,o=!1){this.app=e,this._authProvider=t,this._appCheckProvider=r,this._url=s,this._firebaseVersion=i,this._isUsingEmulator=o,this._bucket=null,this._host=o6,this._protocol="https",this._appId=null,this._deleted=!1,this._maxOperationRetryTime=P5,this._maxUploadRetryTime=S5,this._requests=new Set,s!=null?this._bucket=bt.makeFromBucketSpec(s,this._host):this._bucket=Kh(this._host,this.app.options)}get host(){return this._host}set host(e){this._host=e,this._url!=null?this._bucket=bt.makeFromBucketSpec(this._url,e):this._bucket=Kh(e,this.app.options)}get maxUploadRetryTime(){return this._maxUploadRetryTime}set maxUploadRetryTime(e){zh("time",0,Number.POSITIVE_INFINITY,e),this._maxUploadRetryTime=e}get maxOperationRetryTime(){return this._maxOperationRetryTime}set maxOperationRetryTime(e){zh("time",0,Number.POSITIVE_INFINITY,e),this._maxOperationRetryTime=e}async _getAuthToken(){if(this._overrideAuthToken)return this._overrideAuthToken;const e=this._authProvider.getImmediate({optional:!0});if(e){const t=await e.getToken();if(t!==null)return t.accessToken}return null}async _getAppCheckToken(){if(ze(this.app)&&this.app.settings.appCheckToken)return this.app.settings.appCheckToken;const e=this._appCheckProvider.getImmediate({optional:!0});return e?(await e.getToken()).token:null}_delete(){return this._deleted||(this._deleted=!0,this._requests.forEach(e=>e.cancel()),this._requests.clear()),Promise.resolve()}_makeStorageReference(e){return new So(this,e)}_makeRequest(e,t,r,s,i=!0){if(this._deleted)return new x5(a6());{const o=W5(e,this._appId,r,s,t,this._firebaseVersion,i,this._isUsingEmulator);return this._requests.add(o),o.getPromise().then(()=>this._requests.delete(o),()=>this._requests.delete(o)),o}}async makeRequestWithTokens(e,t){const[r,s]=await Promise.all([this._getAuthToken(),this._getAppCheckToken()]);return this._makeRequest(e,t,r,s).getPromise()}}const Yh="@firebase/storage",Qh="0.14.3";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const c6="storage";function nE(n=Vo(),e){n=le(n);const r=un(n,c6).getImmediate({identifier:e}),s=u2("storage");return s&&X5(r,...s),r}function X5(n,e,t,r={}){Y5(n,e,t,r)}function J5(n,{instanceIdentifier:e}){const t=n.getProvider("app").getImmediate(),r=n.getProvider("auth-internal"),s=n.getProvider("app-check-internal");return new Q5(t,r,s,e,fr)}function Z5(){Nt(new At(c6,J5,"PUBLIC").setMultipleInstances(!0)),ct(Yh,Qh,""),ct(Yh,Qh,"esm2020")}Z5();const u6="@firebase/installations",$1="0.6.22";/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const l6=1e4,h6=`w:${$1}`,f6="FIS_v2",e_="https://firebaseinstallations.googleapis.com/v1",t_=3600*1e3,n_="installations",r_="Installations";/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const s_={"missing-app-config-values":'Missing App configuration value: "{$valueName}"',"not-registered":"Firebase Installation is not registered.","installation-not-found":"Firebase Installation not found.","request-failed":'{$requestName} request failed with error "{$serverCode} {$serverStatus}: {$serverMessage}"',"app-offline":"Could not process request. Application offline.","delete-pending-registration":"Can't delete installation while there is a pending registration request."},cr=new lr(n_,r_,s_);function d6(n){return n instanceof Ct&&n.code.includes("request-failed")}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function p6({projectId:n}){return`${e_}/projects/${n}/installations`}function m6(n){return{token:n.token,requestStatus:2,expiresIn:o_(n.expiresIn),creationTime:Date.now()}}async function g6(n,e){const r=(await e.json()).error;return cr.create("request-failed",{requestName:n,serverCode:r.code,serverMessage:r.message,serverStatus:r.status})}function _6({apiKey:n}){return new Headers({"Content-Type":"application/json",Accept:"application/json","x-goog-api-key":n})}function i_(n,{refreshToken:e}){const t=_6(n);return t.append("Authorization",a_(e)),t}async function y6(n){const e=await n();return e.status>=500&&e.status<600?n():e}function o_(n){return Number(n.replace("s","000"))}function a_(n){return`${f6} ${n}`}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function c_({appConfig:n,heartbeatServiceProvider:e},{fid:t}){const r=p6(n),s=_6(n),i=e.getImmediate({optional:!0});if(i){const l=await i.getHeartbeatsHeader();l&&s.append("x-firebase-client",l)}const o={fid:t,authVersion:f6,appId:n.appId,sdkVersion:h6},c={method:"POST",headers:s,body:JSON.stringify(o)},u=await y6(()=>fetch(r,c));if(u.ok){const l=await u.json();return{fid:l.fid||t,registrationStatus:2,refreshToken:l.refreshToken,authToken:m6(l.authToken)}}else throw await g6("Create Installation",u)}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function E6(n){return new Promise(e=>{setTimeout(e,n)})}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function u_(n){return btoa(String.fromCharCode(...n)).replace(/\+/g,"-").replace(/\//g,"_")}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const l_=/^[cdef][\w-]{21}$/,bc="";function h_(){try{const n=new Uint8Array(17);(self.crypto||self.msCrypto).getRandomValues(n),n[0]=112+n[0]%16;const t=f_(n);return l_.test(t)?t:bc}catch{return bc}}function f_(n){return u_(n).substr(0,22)}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function ha(n){return`${n.appName}!${n.appId}`}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const I6=new Map;function T6(n,e){const t=ha(n);w6(t,e),d_(t,e)}function w6(n,e){const t=I6.get(n);if(t)for(const r of t)r(e)}function d_(n,e){const t=p_();t&&t.postMessage({key:n,fid:e}),m_()}let nr=null;function p_(){return!nr&&"BroadcastChannel"in self&&(nr=new BroadcastChannel("[Firebase] FID Change"),nr.onmessage=n=>{w6(n.data.key,n.data.fid)}),nr}function m_(){I6.size===0&&nr&&(nr.close(),nr=null)}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const g_="firebase-installations-database",__=1,ur="firebase-installations-store";let tc=null;function q1(){return tc||(tc=_2(g_,__,{upgrade:(n,e)=>{switch(e){case 0:n.createObjectStore(ur)}}})),tc}async function bo(n,e){const t=ha(n),s=(await q1()).transaction(ur,"readwrite"),i=s.objectStore(ur),o=await i.get(t);return await i.put(e,t),await s.done,(!o||o.fid!==e.fid)&&T6(n,e.fid),e}async function A6(n){const e=ha(n),r=(await q1()).transaction(ur,"readwrite");await r.objectStore(ur).delete(e),await r.done}async function fa(n,e){const t=ha(n),s=(await q1()).transaction(ur,"readwrite"),i=s.objectStore(ur),o=await i.get(t),c=e(o);return c===void 0?await i.delete(t):await i.put(c,t),await s.done,c&&(!o||o.fid!==c.fid)&&T6(n,c.fid),c}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function H1(n){let e;const t=await fa(n.appConfig,r=>{const s=y_(r),i=E_(n,s);return e=i.registrationPromise,i.installationEntry});return t.fid===bc?{installationEntry:await e}:{installationEntry:t,registrationPromise:e}}function y_(n){const e=n||{fid:h_(),registrationStatus:0};return v6(e)}function E_(n,e){if(e.registrationStatus===0){if(!navigator.onLine){const s=Promise.reject(cr.create("app-offline"));return{installationEntry:e,registrationPromise:s}}const t={fid:e.fid,registrationStatus:1,registrationTime:Date.now()},r=I_(n,t);return{installationEntry:t,registrationPromise:r}}else return e.registrationStatus===1?{installationEntry:e,registrationPromise:T_(n)}:{installationEntry:e}}async function I_(n,e){try{const t=await c_(n,e);return bo(n.appConfig,t)}catch(t){throw d6(t)&&t.customData.serverCode===409?await A6(n.appConfig):await bo(n.appConfig,{fid:e.fid,registrationStatus:0}),t}}async function T_(n){let e=await Xh(n.appConfig);for(;e.registrationStatus===1;)await E6(100),e=await Xh(n.appConfig);if(e.registrationStatus===0){const{installationEntry:t,registrationPromise:r}=await H1(n);return r||t}return e}function Xh(n){return fa(n,e=>{if(!e)throw cr.create("installation-not-found");return v6(e)})}function v6(n){return w_(n)?{fid:n.fid,registrationStatus:0}:n}function w_(n){return n.registrationStatus===1&&n.registrationTime+l6<Date.now()}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function A_({appConfig:n,heartbeatServiceProvider:e},t){const r=v_(n,t),s=i_(n,t),i=e.getImmediate({optional:!0});if(i){const l=await i.getHeartbeatsHeader();l&&s.append("x-firebase-client",l)}const o={installation:{sdkVersion:h6,appId:n.appId}},c={method:"POST",headers:s,body:JSON.stringify(o)},u=await y6(()=>fetch(r,c));if(u.ok){const l=await u.json();return m6(l)}else throw await g6("Generate Auth Token",u)}function v_(n,{fid:e}){return`${p6(n)}/${e}/authTokens:generate`}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function j1(n,e=!1){let t;const r=await fa(n.appConfig,i=>{if(!R6(i))throw cr.create("not-registered");const o=i.authToken;if(!e&&P_(o))return i;if(o.requestStatus===1)return t=R_(n,e),i;{if(!navigator.onLine)throw cr.create("app-offline");const c=b_(i);return t=C_(n,c),c}});return t?await t:r.authToken}async function R_(n,e){let t=await Jh(n.appConfig);for(;t.authToken.requestStatus===1;)await E6(100),t=await Jh(n.appConfig);const r=t.authToken;return r.requestStatus===0?j1(n,e):r}function Jh(n){return fa(n,e=>{if(!R6(e))throw cr.create("not-registered");const t=e.authToken;return N_(t)?{...e,authToken:{requestStatus:0}}:e})}async function C_(n,e){try{const t=await A_(n,e),r={...e,authToken:t};return await bo(n.appConfig,r),t}catch(t){if(d6(t)&&(t.customData.serverCode===401||t.customData.serverCode===404))await A6(n.appConfig);else{const r={...e,authToken:{requestStatus:0}};await bo(n.appConfig,r)}throw t}}function R6(n){return n!==void 0&&n.registrationStatus===2}function P_(n){return n.requestStatus===2&&!S_(n)}function S_(n){const e=Date.now();return e<n.creationTime||n.creationTime+n.expiresIn<e+t_}function b_(n){const e={requestStatus:1,requestTime:Date.now()};return{...n,authToken:e}}function N_(n){return n.requestStatus===1&&n.requestTime+l6<Date.now()}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function O_(n){const e=n,{installationEntry:t,registrationPromise:r}=await H1(e);return r?r.catch(console.error):j1(e).catch(console.error),t.fid}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function k_(n,e=!1){const t=n;return await D_(t),(await j1(t,e)).token}async function D_(n){const{registrationPromise:e}=await H1(n);e&&await e}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function V_(n){if(!n||!n.options)throw nc("App Configuration");if(!n.name)throw nc("App Name");const e=["projectId","apiKey","appId"];for(const t of e)if(!n.options[t])throw nc(t);return{appName:n.name,projectId:n.options.projectId,apiKey:n.options.apiKey,appId:n.options.appId}}function nc(n){return cr.create("missing-app-config-values",{valueName:n})}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const C6="installations",x_="installations-internal",L_=n=>{const e=n.getProvider("app").getImmediate(),t=V_(e),r=un(e,"heartbeat");return{app:e,appConfig:t,heartbeatServiceProvider:r,_delete:()=>Promise.resolve()}},M_=n=>{const e=n.getProvider("app").getImmediate(),t=un(e,C6).getImmediate();return{getId:()=>O_(t),getToken:s=>k_(t,s)}};function F_(){Nt(new At(C6,L_,"PUBLIC")),Nt(new At(x_,M_,"PRIVATE"))}F_();ct(u6,$1);ct(u6,$1,"esm2020");/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const No="analytics",U_="firebase_id",B_="origin",$_=60*1e3,q_="https://firebase.googleapis.com/v1alpha/projects/-/apps/{app-id}/webConfig",G1="https://www.googletagmanager.com/gtag/js";/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const st=new Do("@firebase/analytics");/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const H_={"already-exists":"A Firebase Analytics instance with the appId {$id}  already exists. Only one Firebase Analytics instance can be created for each appId.","already-initialized":"initializeAnalytics() cannot be called again with different options than those it was initially called with. It can be called again with the same options to return the existing instance, or getAnalytics() can be used to get a reference to the already-initialized instance.","already-initialized-settings":"Firebase Analytics has already been initialized.settings() must be called before initializing any Analytics instanceor it will have no effect.","interop-component-reg-failed":"Firebase Analytics Interop Component failed to instantiate: {$reason}","invalid-analytics-context":"Firebase Analytics is not supported in this environment. Wrap initialization of analytics in analytics.isSupported() to prevent initialization in unsupported environments. Details: {$errorInfo}","indexeddb-unavailable":"IndexedDB unavailable or restricted in this environment. Wrap initialization of analytics in analytics.isSupported() to prevent initialization in unsupported environments. Details: {$errorInfo}","fetch-throttle":"The config fetch request timed out while in an exponential backoff state. Unix timestamp in milliseconds when fetch request throttling ends: {$throttleEndTimeMillis}.","config-fetch-failed":"Dynamic config fetch failed: [{$httpStatus}] {$responseMessage}","no-api-key":'The "apiKey" field is empty in the local Firebase config. Firebase Analytics requires this field tocontain a valid API key.',"no-app-id":'The "appId" field is empty in the local Firebase config. Firebase Analytics requires this field tocontain a valid app ID.',"no-client-id":'The "client_id" field is empty.',"invalid-gtag-resource":"Trusted Types detected an invalid gtag resource: {$gtagURL}."},Et=new lr("analytics","Analytics",H_);/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function j_(n){if(!n.startsWith(G1)){const e=Et.create("invalid-gtag-resource",{gtagURL:n});return st.warn(e.message),""}return n}function P6(n){return Promise.all(n.map(e=>e.catch(t=>t)))}function G_(n,e){let t;return window.trustedTypes&&(t=window.trustedTypes.createPolicy(n,e)),t}function W_(n,e){const t=G_("firebase-js-sdk-policy",{createScriptURL:j_}),r=document.createElement("script"),s=`${G1}?l=${n}&id=${e}`;r.src=t?t?.createScriptURL(s):s,r.async=!0,document.head.appendChild(r)}function z_(n){let e=[];return Array.isArray(window[n])?e=window[n]:window[n]=e,e}async function K_(n,e,t,r,s,i){const o=r[s];try{if(o)await e[o];else{const u=(await P6(t)).find(l=>l.measurementId===s);u&&await e[u.appId]}}catch(c){st.error(c)}n("config",s,i)}async function Y_(n,e,t,r,s){try{let i=[];if(s&&s.send_to){let o=s.send_to;Array.isArray(o)||(o=[o]);const c=await P6(t);for(const u of o){const l=c.find(g=>g.measurementId===u),p=l&&e[l.appId];if(p)i.push(p);else{i=[];break}}}i.length===0&&(i=Object.values(e)),await Promise.all(i),n("event",r,s||{})}catch(i){st.error(i)}}function Q_(n,e,t,r){async function s(i,...o){try{if(i==="event"){const[c,u]=o;await Y_(n,e,t,c,u)}else if(i==="config"){const[c,u]=o;await K_(n,e,t,r,c,u)}else if(i==="consent"){const[c,u]=o;n("consent",c,u)}else if(i==="get"){const[c,u,l]=o;n("get",c,u,l)}else if(i==="set"){const[c]=o;n("set",c)}else n(i,...o)}catch(c){st.error(c)}}return s}function X_(n,e,t,r,s){let i=function(...o){window[r].push(arguments)};return window[s]&&typeof window[s]=="function"&&(i=window[s]),window[s]=Q_(i,n,e,t),{gtagCore:i,wrappedGtag:window[s]}}function J_(n){const e=window.document.getElementsByTagName("script");for(const t of Object.values(e))if(t.src&&t.src.includes(G1)&&t.src.includes(n))return t;return null}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Z_=30,ey=1e3;class ty{constructor(e={},t=ey){this.throttleMetadata=e,this.intervalMillis=t}getThrottleMetadata(e){return this.throttleMetadata[e]}setThrottleMetadata(e,t){this.throttleMetadata[e]=t}deleteThrottleMetadata(e){delete this.throttleMetadata[e]}}const S6=new ty;function ny(n){return new Headers({Accept:"application/json","x-goog-api-key":n})}async function ry(n){const{appId:e,apiKey:t}=n,r={method:"GET",headers:ny(t)},s=q_.replace("{app-id}",e),i=await fetch(s,r);if(i.status!==200&&i.status!==304){let o="";try{const c=await i.json();c.error?.message&&(o=c.error.message)}catch{}throw Et.create("config-fetch-failed",{httpStatus:i.status,responseMessage:o})}return i.json()}async function sy(n,e=S6,t){const{appId:r,apiKey:s,measurementId:i}=n.options;if(!r)throw Et.create("no-app-id");if(!s){if(i)return{measurementId:i,appId:r};throw Et.create("no-api-key")}const o=e.getThrottleMetadata(r)||{backoffCount:0,throttleEndTimeMillis:Date.now()},c=new ay;return setTimeout(async()=>{c.abort()},$_),b6({appId:r,apiKey:s,measurementId:i},o,c,e)}async function b6(n,{throttleEndTimeMillis:e,backoffCount:t},r,s=S6){const{appId:i,measurementId:o}=n;try{await iy(r,e)}catch(c){if(o)return st.warn(`Timed out fetching this Firebase app's measurement ID from the server. Falling back to the measurement ID ${o} provided in the "measurementId" field in the local Firebase config. [${c?.message}]`),{appId:i,measurementId:o};throw c}try{const c=await ry(n);return s.deleteThrottleMetadata(i),c}catch(c){const u=c;if(!oy(u)){if(s.deleteThrottleMetadata(i),o)return st.warn(`Failed to fetch this Firebase app's measurement ID from the server. Falling back to the measurement ID ${o} provided in the "measurementId" field in the local Firebase config. [${u?.message}]`),{appId:i,measurementId:o};throw c}const l=Number(u?.customData?.httpStatus)===503?Qu(t,s.intervalMillis,Z_):Qu(t,s.intervalMillis),p={throttleEndTimeMillis:Date.now()+l,backoffCount:t+1};return s.setThrottleMetadata(i,p),st.debug(`Calling attemptFetch again in ${l} millis`),b6(n,p,r,s)}}function iy(n,e){return new Promise((t,r)=>{const s=Math.max(e-Date.now(),0),i=setTimeout(t,s);n.addEventListener(()=>{clearTimeout(i),r(Et.create("fetch-throttle",{throttleEndTimeMillis:e}))})})}function oy(n){if(!(n instanceof Ct)||!n.customData)return!1;const e=Number(n.customData.httpStatus);return e===429||e===500||e===503||e===504}class ay{constructor(){this.listeners=[]}addEventListener(e){this.listeners.push(e)}abort(){this.listeners.forEach(e=>e())}}async function cy(n,e,t,r,s){if(s&&s.global){n("event",t,r);return}else{const i=await e,o={...r,send_to:i};n("event",t,o)}}async function uy(n,e,t,r){if(r&&r.global){const s={};for(const i of Object.keys(t))s[`user_properties.${i}`]=t[i];return n("set",s),Promise.resolve()}else{const s=await e;n("config",s,{update:!0,user_properties:t})}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function ly(){if(Oc())try{await kc()}catch(n){return st.warn(Et.create("indexeddb-unavailable",{errorInfo:n?.toString()}).message),!1}else return st.warn(Et.create("indexeddb-unavailable",{errorInfo:"IndexedDB is not available in this environment."}).message),!1;return!0}async function hy(n,e,t,r,s,i,o){const c=sy(n);c.then(T=>{t[T.measurementId]=T.appId,n.options.measurementId&&T.measurementId!==n.options.measurementId&&st.warn(`The measurement ID in the local Firebase config (${n.options.measurementId}) does not match the measurement ID fetched from the server (${T.measurementId}). To ensure analytics events are always sent to the correct Analytics property, update the measurement ID field in the local config or remove it from the local config.`)}).catch(T=>st.error(T)),e.push(c);const u=ly().then(T=>{if(T)return r.getId()}),[l,p]=await Promise.all([c,u]);J_(i)||W_(i,l.measurementId),s("js",new Date);const g=o?.config??{};return g[B_]="firebase",g.update=!0,p!=null&&(g[U_]=p),s("config",l.measurementId,g),l.measurementId}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class fy{constructor(e){this.app=e}_delete(){return delete br[this.app.options.appId],Promise.resolve()}}let br={},Zh=[];const e2={};let rc="dataLayer",dy="gtag",t2,W1,n2=!1;function py(){const n=[];if(Nc()&&n.push("This is a browser extension environment."),p2()||n.push("Cookies are not available."),n.length>0){const e=n.map((r,s)=>`(${s+1}) ${r}`).join(" "),t=Et.create("invalid-analytics-context",{errorInfo:e});st.warn(t.message)}}function my(n,e,t){py();const r=n.options.appId;if(!r)throw Et.create("no-app-id");if(!n.options.apiKey)if(n.options.measurementId)st.warn(`The "apiKey" field is empty in the local Firebase config. This is needed to fetch the latest measurement ID for this Firebase app. Falling back to the measurement ID ${n.options.measurementId} provided in the "measurementId" field in the local Firebase config.`);else throw Et.create("no-api-key");if(br[r]!=null)throw Et.create("already-exists",{id:r});if(!n2){z_(rc);const{wrappedGtag:i,gtagCore:o}=X_(br,Zh,e2,rc,dy);W1=i,t2=o,n2=!0}return br[r]=hy(n,Zh,e2,e,t2,rc,t),new fy(n)}function rE(n=Vo()){n=le(n);const e=un(n,No);return e.isInitialized()?e.getImmediate():gy(n)}function gy(n,e={}){const t=un(n,No);if(t.isInitialized()){const s=t.getImmediate();if(jt(e,t.getOptions()))return s;throw Et.create("already-initialized")}return t.initialize({options:e})}async function sE(){if(Nc()||!p2()||!Oc())return!1;try{return await kc()}catch{return!1}}function _y(n,e,t){n=le(n),uy(W1,br[n.app.options.appId],e,t).catch(r=>st.error(r))}function yy(n,e,t,r){n=le(n),cy(W1,br[n.app.options.appId],e,t,r).catch(s=>st.error(s))}const r2="@firebase/analytics",s2="0.10.22";function Ey(){Nt(new At(No,(e,{options:t})=>{const r=e.getProvider("app").getImmediate(),s=e.getProvider("installations-internal").getImmediate();return my(r,s,t)},"PUBLIC")),Nt(new At("analytics-internal",n,"PRIVATE")),ct(r2,s2),ct(r2,s2,"esm2020");function n(e){try{const t=e.getProvider(No).getImmediate();return{logEvent:(r,s,i)=>yy(t,r,s,i),setUserProperties:(r,s)=>_y(t,r,s)}}catch(t){throw Et.create("interop-component-reg-failed",{reason:t})}}}Ey();export{Oy as $,By as A,eE as B,At as C,f2 as D,lr as E,Ct as F,In as G,Fy as H,jy as I,Gy as J,Hy as K,Do as L,Yy as M,Zy as N,zi as O,Br as P,wy as Q,ky as R,Sy as S,ge as T,Py as U,Vy as V,Ry as W,Ay as X,vy as Y,Dy as Z,Nt as _,ze as a,Cy as a0,by as a1,Ny as a2,Wy as a3,zy as a4,Jy as a5,tE as a6,un as b,u2 as c,Vo as d,Oc as e,o2 as f,le as g,pp as h,hr as i,Qu as j,Ty as k,k0 as l,xy as m,$y as n,qy as o,ko as p,nE as q,ct as r,Ly as s,sE as t,rE as u,m3 as v,Xy as w,Qy as x,Ky as y,Uy as z};
