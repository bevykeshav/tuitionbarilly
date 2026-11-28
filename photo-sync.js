/* photo-sync.js
   Sends the photos you take (homework / classwork / test) to the Google Sheet,
   so the parent app can show them. It only adds to the app, nothing else changes. */
(function(){
 var busy=false,_pput=window.pput;
 function CK(k){var p=k.split('|');return p[0]+'|'+p[1]+'|'+(p[2]||'hw')}
 function Q(){try{return JSON.parse(localStorage.getItem('tms_phq')||'{}')}catch(e){return {}}}
 function Qs(q){try{localStorage.setItem('tms_phq',JSON.stringify(q))}catch(e){}}
 var span=document.createElement('span');
 span.className='mu';span.style.cssText='margin-left:10px;text-decoration:underline;cursor:pointer';
 var host=document.getElementById('sy');
 if(host&&host.parentNode)host.parentNode.appendChild(span);
 span.onclick=function(){sync()};
 function st(t){span.textContent=t}
 function allKeys(){return idb().then(function(d){return new Promise(function(ok){var r=d.transaction('p').objectStore('p').getAllKeys();r.onsuccess=function(){ok(r.result||[])};r.onerror=function(){ok([])}})})}
 async function sync(){
  if(busy)return;
  if(!CU){st('Photos: no cloud link');return}
  if(!navigator.onLine){st('Photos: offline');return}
  busy=true;var why='';
  try{
   var bf='';try{bf=localStorage.getItem('tms_phbf')||''}catch(e){}
   if(!bf){var ks=await allKeys(),q0=Q();ks.forEach(function(k){if(!q0[k])q0[k]='s'});Qs(q0);try{localStorage.setItem('tms_phbf','1')}catch(e){}}
   for(;;){
    var q=Q(),keys=Object.keys(q);if(!keys.length)break;
    st('Photos: sending '+keys.length+' left...');
    var k=keys[0],ok=false;
    try{
     var r;
     if(q[k]==='s'){var v=await pget(k);r=v?await call({a:'pset',key:CK(k),data:v}):{ph:1,ok:true}}
     else r=await call({a:'pdel',key:CK(k)});
     if(!r||r.ph!==1)why='Apps Script not updated (Deploy > New version)';
     else if(r.error==='locked')why='secret key wrong';
     else if(!r.ok&&r.error!=='bad'&&r.error!=='big')why='error '+(r.error||'');
     ok=!!(r&&r.ph===1&&(r.ok||r.error==='bad'||r.error==='big'));
    }catch(e){why='no internet / blocked'}
    if(!ok)break;
    var q2=Q();if(q2[k]===q[k])delete q2[k];Qs(q2);
   }
  }catch(e){why='error'}
  busy=false;
  var left=Object.keys(Q()).length;
  st(left?'Photos: '+left+' not sent - '+(why||'tap to retry'):'Photos: all sent');
 }
 // every time a photo is saved or removed in the app, queue it for upload
 window.pput=async function(k,v){
  var r=await _pput(k,v);
  var q=Q();q[k]=v?'s':'d';Qs(q);sync();
  return r;
 };
 var _pull=window.pull;
 if(_pull)window.pull=async function(){var r=await _pull.apply(this,arguments);sync();return r};
 window.addEventListener('online',function(){sync()});
 setTimeout(sync,3000);
})();
