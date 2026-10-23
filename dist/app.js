'use strict';
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)], uid=()=>crypto.randomUUID?.()||'pd-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2);
let state={ratio:'wide',bg:'#ffffff',elements:[]}, photos=[],selected=null,mode='edit',page=0,showGrid=true,history=[],future=[];
const ratios={wide:[13.333333,7.5],standard:[10,7.5],portrait:[8.2677,11.6929],landscape:[297/25.4,210/25.4]}, names={image:'고정 이미지',photo:'사진 영역',text:'텍스트',rect:'사각형',ellipse:'원',line:'직선',arrow:'화살표'}, icons={image:'▣',photo:'▧',text:'T',rect:'□',ellipse:'○',line:'╱',arrow:'↗'};
const presets=[{n:1,label:'1장',cols:1},{n:2,label:'2장',cols:2},{n:3,label:'3장',cols:3},{n:4,label:'4장',cols:2},{n:6,label:'6장',cols:3},{n:0,label:'빈 페이지',cols:1}];
function toast(s){$('#toast').textContent=s;$('#toast').style.display='block';clearTimeout(toast.timer);toast.timer=setTimeout(()=>$('#toast').style.display='none',3500)}
function snapshot(){return JSON.stringify(state)}
function checkpoint(){history.push(snapshot());if(history.length>60)history.shift();future=[]}
let storageWarned=false;function remember(){try{localStorage.setItem('photodeck-layout-v1',snapshot());storageWarned=false}catch{if(!storageWarned){storageWarned=true;toast('자동 저장 공간이 부족합니다. 레이아웃 저장 버튼으로 파일을 보관하세요.')}}}
function slots(){return state.elements.filter(e=>e.type==='photo')}
function pages(){return slots().length?Math.ceil(photos.length/slots().length):0}
function elem(type,x=10,y=15,w=30,h=25){return {id:uid(),type,x,y,w,h,fill:type==='photo'?'#eff6f2':'#d8eae3',color:'#243b35',stroke:'#8ba99c',strokeWidth:1,fillNone:false,strokeNone:false,fontSize:24,bold:false,align:'left',rotation:0,text:'텍스트를 입력하세요',fit:'cover'}}
function applyPreset(n,record=true){if(record)checkpoint();let cols=n===6?3:n===4?2:n||1,rows=Math.ceil(n/cols)||1;state.elements=state.elements.filter(e=>e.type!=='photo');for(let i=0;i<n;i++){let w=(88-(cols-1)*3)/cols,h=(72-(rows-1)*4)/rows;state.elements.push(elem('photo',6+(i%cols)*(w+3),16+Math.floor(i/cols)*(h+4),w,h))}selected=null;page=0;render()}
$('#presets').innerHTML=presets.map(p=>`<button class="preset" data-n="${p.n}"><div class="mini" style="grid-template-columns:repeat(${p.cols},1fr)">${Array.from({length:p.n},()=>'<i></i>').join('')||'<span style="border:1px dashed #cbd8d2"></span>'}</div>${p.label}</button>`).join('');
$('#presets').onclick=e=>{let b=e.target.closest('[data-n]');if(b)applyPreset(+b.dataset.n)};
function render(){page=Math.max(0,Math.min(page,pages()-1));$('#ratio').value=state.ratio;$('#bg').value=state.bg;$('#canvas').style.aspectRatio=ratios[state.ratio].join('/');$('#canvas').style.backgroundColor=state.bg;$('#canvas').className=showGrid&&mode==='edit'?'grid':'';$('#editTab').classList.toggle('active',mode==='edit');$('#previewTab').classList.toggle('active',mode==='preview');$('#pageBadge').textContent=pages();$('#pager').hidden=mode!=='preview'||!pages();$('#pageNumber').textContent=`${page+1} / ${pages()} 페이지`;$('#canvasInfo').textContent=`${{wide:'16:9',standard:'4:3',portrait:'A4 세로',landscape:'A4 가로'}[state.ratio]} · ${mode==='edit'?'레이아웃 마스터':'슬라이드 미리보기'}`;$('#summary').textContent=slots().length?`사진 ${photos.length}장 ÷ 페이지당 ${slots().length}장 = ${pages()}페이지`:'사진 영역을 하나 이상 추가하세요.';$('#undo').disabled=!history.length;$('#redo').disabled=!future.length;renderCanvas();renderProps();renderLayers();remember()}
function renderCanvas(){const c=$('#canvas');c.replaceChildren();let si=0;const cw=c.clientWidth,iw=ratios[state.ratio][0];for(const e of state.elements){let d=document.createElement('div');d.className=`element ${e.type}${e.id===selected&&mode==='edit'?' selected':''}`;d.dataset.id=e.id;Object.assign(d.style,{left:e.x+'%',top:e.y+'%',width:e.w+'%',height:e.h+'%',transform:`rotate(${e.rotation}deg)`,color:e.color,fontSize:(e.fontSize*cw/iw/72)+'px',fontWeight:e.bold?'700':'400',textAlign:e.align,justifyContent:e.align==='center'?'center':e.align==='right'?'flex-end':'flex-start'});if(e.type==='photo'){let ix=page*slots().length+si++,p=photos[ix];if(mode==='preview'&&p){let img=document.createElement('img');img.src=p.data;img.alt=p.name;img.style.objectFit=e.fit;d.append(img);d.style.border='none';d.style.background='transparent'}else if(mode==='edit'){let b=document.createElement('b');b.textContent='▧';let t=document.createElement('span');t.textContent=`사진 ${si}`;d.append(b,t)}else{d.style.border='none';d.style.background='transparent'}}else if(e.type==='image'){let img=document.createElement('img');img.src=e.data;img.alt=e.name||'고정 이미지';img.style.objectFit=e.fit;d.append(img)}else if(e.type==='text'){d.textContent=e.text.replaceAll('{page}',page+1);d.style.padding='2px';}else if(['rect','ellipse'].includes(e.type)){d.style.background=e.fillNone?'transparent':e.fill;d.style.border=e.strokeNone?'none':`${e.strokeWidth}px solid ${e.stroke}`;if(e.type==='ellipse')d.style.borderRadius='50%'}else{d.innerHTML=`<svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none" style="overflow:visible"><defs><marker id="a${e.id}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" fill="${e.strokeNone?'none':e.stroke}"/></marker></defs><line x1="0" y1="50" x2="100" y2="50" stroke="${e.strokeNone?'none':e.stroke}" stroke-width="${e.strokeWidth}" vector-effect="non-scaling-stroke" ${e.type==='arrow'?`marker-end="url(#a${e.id})"`:''}/></svg>`}if(mode==='edit'){d.onpointerdown=ev=>startDrag(ev,e);}c.append(d)}if(mode==='edit'){const e=state.elements.find(item=>item.id===selected);if(e){const box=document.createElement('div');box.className='selection-box';Object.assign(box.style,{left:e.x+'%',top:e.y+'%',width:e.w+'%',height:e.h+'%',transform:'rotate('+e.rotation+'deg)'});const labels={nw:'왼쪽 위 모서리',n:'위쪽 변',ne:'오른쪽 위 모서리',e:'오른쪽 변',se:'오른쪽 아래 모서리',s:'아래쪽 변',sw:'왼쪽 아래 모서리',w:'왼쪽 변'};for(const handle of ['nw','n','ne','e','se','s','sw','w']){const point=document.createElement('div');point.className='resize-point resize-'+handle;point.title=labels[handle]+' 크기 조절'+(handle.length===2?' · Shift: 비율 유지':'');point.setAttribute('aria-label',point.title);point.onpointerdown=ev=>startDrag(ev,e,handle);box.append(point)}c.append(box)}}}
function resizeBox(start,handle,dx,dy,rect,keepRatio=false){
 const W=rect.width,H=rect.height,theta=(start.rotation||0)*Math.PI/180,cos=Math.cos(theta),sin=Math.sin(theta);
 const localX=dx*cos+dy*sin,localY=-dx*sin+dy*cos;
 const horizontal=handle.includes('e')?1:handle.includes('w')?-1:0,vertical=handle.includes('s')?1:handle.includes('n')?-1:0;
 const sw=start.w*W/100,sh=start.h*H/100,minW=W*.02,minH=H*.02;
 let w=horizontal?Math.max(minW,sw+horizontal*localX):sw,h=vertical?Math.max(minH,sh+vertical*localY):sh;
 if(keepRatio&&horizontal&&vertical){let scale=Math.abs((w-sw)/sw)>=Math.abs((h-sh)/sh)?w/sw:h/sh;scale=Math.max(minW/sw,minH/sh,scale);w=sw*scale;h=sh*scale}
 const cx=horizontal*(w-sw)/2,cy=vertical*(h-sh)/2;
 const next={x:start.x+((cx*cos-cy*sin)-(w-sw)/2)/W*100,y:start.y+((cx*sin+cy*cos)-(h-sh)/2)/H*100,w:w/W*100,h:h/H*100};
 const valid=b=>b.x>=-1e-8&&b.y>=-1e-8&&b.x+b.w<=100+1e-8&&b.y+b.h<=100+1e-8;
 if(!valid(next)){let lo=0,hi=1;for(let i=0;i<40;i++){const mid=(lo+hi)/2,b={};for(const k of ['x','y','w','h'])b[k]=start[k]+(next[k]-start[k])*mid;if(valid(b))lo=mid;else hi=mid}for(const k of ['x','y','w','h'])next[k]=start[k]+(next[k]-start[k])*lo}
 return next;
}
function startDrag(ev,e,handle=null){
 if(ev.button!==0)return;ev.stopPropagation();ev.preventDefault();
 selected=e.id;document.activeElement?.blur?.();renderCanvas();renderProps();renderLayers();
 const sx=ev.clientX,sy=ev.clientY,start={...e},rect=$('#canvas').getBoundingClientRect();let changed=false,finished=false;
 function move(m){
  if(m.pointerId!==ev.pointerId)return;
  const dx=m.clientX-sx,dy=m.clientY-sy;
  let box;
  if(handle)box=resizeBox(start,handle,dx,dy,rect,m.shiftKey);
  else{let mx=dx,my=dy;if(m.shiftKey){if(Math.abs(dx)>=Math.abs(dy))my=0;else mx=0}box={x:Math.max(0,Math.min(100-start.w,start.x+mx/rect.width*100)),y:Math.max(0,Math.min(100-start.h,start.y+my/rect.height*100)),w:start.w,h:start.h}}
  if(!['x','y','w','h'].some(k=>Math.abs(e[k]-box[k])>1e-8))return;
  if(!changed){checkpoint();changed=true}Object.assign(e,box);renderCanvas();
 }
 function finish(m){if(finished||(m?.pointerId!==undefined&&m.pointerId!==ev.pointerId))return;finished=true;window.removeEventListener('pointermove',move);window.removeEventListener('pointerup',finish);window.removeEventListener('pointercancel',finish);window.removeEventListener('blur',finish);render()}
 window.addEventListener('pointermove',move);window.addEventListener('pointerup',finish);window.addEventListener('pointercancel',finish);window.addEventListener('blur',finish);
}
$('#canvas').onpointerdown=e=>{if(e.target===$('#canvas')){selected=null;renderCanvas();renderProps();renderLayers()}};
function renderProps(){let box=$('#properties'),e=state.elements.find(e=>e.id===selected);if(!e){box.innerHTML='<div class="empty">캔버스의 요소를 선택하면<br>위치와 스타일을 바꿀 수 있어요.</div>';return}const num=(key,label,min,max,step=1)=>`<label>${label}<input type="number" data-key="${key}" value="${Math.round(e[key]*100)/100}" min="${min}" max="${max}" step="${step}"></label>`;box.innerHTML=`<div style="margin-top:17px;font-weight:600">${icons[e.type]} ${names[e.type]}</div><div class="propgrid">${num('x','X 위치 (%)',0,98,.5)}${num('y','Y 위치 (%)',0,98,.5)}${num('w','너비 (%)',2,100,.5)}${num('h','높이 (%)',2,100,.5)}${num('rotation','회전 (°)',-360,360)}</div>`;
if(e.type==='text')box.innerHTML+=`<label>내용 <small>{page} = 페이지 번호</small><textarea data-key="text"></textarea></label><div class="propgrid">${num('fontSize','글자 크기 (pt)',6,160)}<label>정렬<select data-key="align"><option value="left">왼쪽</option><option value="center">가운데</option><option value="right">오른쪽</option></select></label></div><label class="colorrow">글자 색<input type="color" data-key="color" value="${e.color}"></label><button id="bold" style="margin-top:12px" class="${e.bold?'active':''}"><b>B</b> 굵게</button>`;
if(e.type==='image')box.innerHTML+='<p style="font-size:10px;margin-top:10px">모든 슬라이드에 반복됩니다.</p><button id="replaceImage" style="margin-top:10px">이미지 교체</button>';
if(['photo','image'].includes(e.type))box.innerHTML+=`<label>사진 맞춤<select data-key="fit"><option value="cover">영역 채우기 (가운데 자르기)</option><option value="contain">사진 전체 보이기</option></select></label>`;
if(['rect','ellipse','line','arrow'].includes(e.type)){if(['rect','ellipse'].includes(e.type))box.innerHTML+=`<label class="colorrow">채우기<input type="color" data-key="fill" value="${e.fill}" ${e.fillNone?'disabled':''}></label><label class="none-toggle"><input type="checkbox" data-key="fillNone" ${e.fillNone?'checked':''}> 채우기 없음</label>`;box.innerHTML+=`<label class="colorrow">선 색<input type="color" data-key="stroke" value="${e.stroke}" ${e.strokeNone?'disabled':''}></label><label class="none-toggle"><input type="checkbox" data-key="strokeNone" ${e.strokeNone?'checked':''}> 선 없음</label>${num('strokeWidth','선 두께 (pt)',0,12,.5)}`}
box.innerHTML+='<div class="propbuttons"><button data-action="centerX">가로 중앙</button><button data-action="centerY">세로 중앙</button><button data-action="back">뒤로</button><button data-action="front">앞으로</button><button data-action="duplicate">복제</button><button data-action="delete">삭제</button></div>';
box.querySelectorAll('[data-key]').forEach(input=>{if(input.type==='checkbox')input.checked=!!e[input.dataset.key];else input.value=e[input.dataset.key];input.onchange=()=>{let key=input.dataset.key,v=input.type==='checkbox'?input.checked:input.type==='number'?+input.value:input.value;if(input.type==='number'){if(!Number.isFinite(v))return;v=Math.max(+input.min,Math.min(+input.max,v))}checkpoint();e[key]=v;e.x=Math.min(e.x,100-e.w);e.y=Math.min(e.y,100-e.h);render()}});if($('#replaceImage'))$('#replaceImage').onclick=()=>{imageReplaceId=e.id;$('#fixedImageInput').click()};if($('#bold'))$('#bold').onclick=()=>{checkpoint();e.bold=!e.bold;render()};box.querySelectorAll('[data-action]').forEach(b=>b.onclick=()=>act(b.dataset.action))}
function act(a){let e=state.elements.find(e=>e.id===selected);if(!e)return;checkpoint();let i=state.elements.indexOf(e);if(a==='delete'){state.elements.splice(i,1);selected=null}if(a==='duplicate'){let copy={...e,id:uid(),x:Math.min(100-e.w,e.x+2),y:Math.min(100-e.h,e.y+2)};state.elements.splice(i+1,0,copy);selected=copy.id}if(a==='front'&&i<state.elements.length-1)[state.elements[i],state.elements[i+1]]=[state.elements[i+1],e];if(a==='back'&&i>0)[state.elements[i],state.elements[i-1]]=[state.elements[i-1],e];if(a==='centerX')e.x=(100-e.w)/2;if(a==='centerY')e.y=(100-e.h)/2;render()}
function renderLayers(){let pi=0;$('#layers').replaceChildren();for(let e of state.elements){let d=document.createElement('div');d.className='layer'+(e.id===selected?' active':'');let icon=document.createElement('span');icon.textContent=icons[e.type];let t=document.createElement('span');t.textContent=names[e.type]+(e.type==='photo'?' '+(++pi):'');d.append(icon,t);d.onclick=()=>{mode='edit';selected=e.id;render()};$('#layers').append(d)}}
$('#tools').onclick=ev=>{let b=ev.target.closest('[data-add]');if(!b)return;if(b.dataset.add==='image'){imageReplaceId=null;$('#fixedImageInput').click();return}checkpoint();let e=elem(b.dataset.add);if(e.type==='text'){e.h=10;e.w=40;e.fontSize=22}if(['line','arrow'].includes(e.type))e.h=4;state.elements.push(e);selected=e.id;mode='edit';render()};$('#ratio').onchange=()=>{checkpoint();state.ratio=$('#ratio').value;render()};$('#bg').onchange=()=>{checkpoint();state.bg=$('#bg').value;render()};$('#editTab').onclick=()=>{mode='edit';render()};$('#previewTab').onclick=()=>{if(!photos.length){toast('사진을 먼저 추가하세요.');return}if(!slots().length){toast('사진 영역을 먼저 추가하세요.');return}mode='preview';selected=null;render()};$('#prevPage').onclick=()=>{page=Math.max(0,page-1);render()};$('#nextPage').onclick=()=>{page=Math.min(pages()-1,page+1);render()};$('#grid').onclick=()=>{showGrid=!showGrid;$('#grid').classList.toggle('active',showGrid);renderCanvas();$('#canvas').className=showGrid&&mode==='edit'?'grid':''};
function undo(){if(!history.length)return;future.push(snapshot());state=JSON.parse(history.pop());selected=null;render()}function redo(){if(!future.length)return;history.push(snapshot());state=JSON.parse(future.pop());selected=null;render()}$('#undo').onclick=undo;$('#redo').onclick=redo;let nudgeKey=null;
window.addEventListener('keyup',ev=>{if(ev.key.startsWith('Arrow'))nudgeKey=null});
window.addEventListener('blur',()=>{nudgeKey=null});
window.onkeydown=ev=>{
 if(document.activeElement?.matches?.('input,textarea,select,[contenteditable]:not([contenteditable="false"])'))return;
 if((ev.ctrlKey||ev.metaKey)&&ev.key.toLowerCase()==='z'){ev.preventDefault();ev.shiftKey?redo():undo();return}
 if((ev.ctrlKey||ev.metaKey)&&ev.key.toLowerCase()==='d'){ev.preventDefault();act('duplicate');return}
 if(['Delete','Backspace'].includes(ev.key)&&selected&&mode==='edit'){ev.preventDefault();act('delete');return}
 const directions={ArrowLeft:[-1,0],ArrowRight:[1,0],ArrowUp:[0,-1],ArrowDown:[0,1]},direction=directions[ev.key],e=state.elements.find(item=>item.id===selected);
 if(!direction||!e||mode!=='edit'||ev.ctrlKey||ev.metaKey||ev.altKey)return;
 ev.preventDefault();const rect=$('#canvas').getBoundingClientRect(),step=ev.shiftKey?10:1;
 const x=Math.max(0,Math.min(100-e.w,e.x+direction[0]*step/rect.width*100)),y=Math.max(0,Math.min(100-e.h,e.y+direction[1]*step/rect.height*100));
 if(x===e.x&&y===e.y)return;
 if(!ev.repeat||nudgeKey!==ev.key){checkpoint();nudgeKey=ev.key}
 e.x=x;e.y=y;render();
};

let imageReplaceId=null;
async function readFixedImage(file){
 if(!file||!/^image\/(jpeg|png|webp|gif)$/.test(file.type))throw Error('JPG, PNG, WebP, GIF 이미지를 선택하세요.');
 const bitmap=await createImageBitmap(file);
 try{const scale=Math.min(1,1200/Math.max(bitmap.width,bitmap.height)),canvas=document.createElement('canvas');canvas.width=Math.max(1,Math.round(bitmap.width*scale));canvas.height=Math.max(1,Math.round(bitmap.height*scale));canvas.getContext('2d').drawImage(bitmap,0,0,canvas.width,canvas.height);return {data:canvas.toDataURL('image/png'),width:canvas.width,height:canvas.height,name:file.name}}finally{bitmap.close()}
}
$('#fixedImageInput').onchange=async ev=>{const file=ev.target.files[0],target=imageReplaceId;ev.target.value='';if(!file)return;try{const image=await readFixedImage(file);let e=target?state.elements.find(e=>e.id===target):null;if(target&&!e)return;checkpoint();if(e){Object.assign(e,image)}else{const [W,H]=ratios[state.ratio],w=20,h=Math.min(40,w*W/H*image.height/image.width);e={...elem('image',6,5,w,h),...image,fit:'contain'};state.elements.push(e)}selected=e.id;mode='edit';render();toast(target?'고정 이미지를 교체했습니다.':'고정 이미지를 추가했습니다. 모든 슬라이드에 반복됩니다.')}catch(e){toast(e.message||'이미지를 읽을 수 없습니다.')}};

const rasterExtensions=/\.(jpe?g|jfif|png|apng|webp|gif|bmp|avif|heic|heif)$/i;
let uploadQueue=Promise.resolve();
function snapshotDroppedFiles(transfer){
 const listed=Array.from(transfer?.files||[]),items=Array.from(transfer?.items||[]).filter(item=>item.kind==='file').map(item=>item.getAsFile()).filter(Boolean);
 return items.length>listed.length?items:listed;
}
async function filesFromEntries(entries){
 const files=[];
 async function visit(entry){
  if(entry.isFile){try{files.push(await new Promise((resolve,reject)=>entry.file(resolve,reject)))}catch{}return}
  if(!entry.isDirectory)return;
  const reader=entry.createReader();
  try{while(true){const batch=await new Promise((resolve,reject)=>reader.readEntries(resolve,reject));if(!batch.length)break;for(const child of batch)await visit(child)}}catch{}
 }
 for(const entry of entries)await visit(entry);return files;
}
function addFiles(files,source='사진 추가'){
 const pendingFiles=Array.from(files||[]);
 const task=uploadQueue.then(()=>processPhotoFiles(pendingFiles,source));uploadQueue=task.catch(()=>{});return task;
}
async function decodePhoto(file){
 if(typeof createImageBitmap==='function'){try{return await createImageBitmap(file)}catch{}}
 const url=URL.createObjectURL(file),img=new Image();
 try{await new Promise((resolve,reject)=>{img.onload=resolve;img.onerror=()=>reject(Error('이미지를 해석할 수 없습니다. JPG 또는 PNG로 변환해 주세요.'));img.src=url});return {width:img.naturalWidth,height:img.naturalHeight,image:img,close(){URL.revokeObjectURL(url)}}}catch(err){URL.revokeObjectURL(url);throw err}
}
async function processPhotoFiles(files,source){
 const report=$('#uploadStatus'),failures=$('#uploadFailures');failures.replaceChildren();
 let added=0;const errors=[];
 const progress=done=>{report.textContent=`${source}: 전달 ${files.length}개 · 처리 ${done}/${files.length} · 등록 ${added}장 · 실패 ${errors.length}개`;$('#photoCount').textContent=photos.length};
 if(!files.length){report.textContent='전달된 파일이 없습니다. 폴더 안의 사진 파일을 직접 선택해 주세요.';return {added:0,failed:0,received:0}}
 progress(0);
 for(let i=0;i<files.length;i++){
  const f=files[i];let bitmap;
  try{
   if(!/^image\//i.test(f.type||'')&&!rasterExtensions.test(f.name||''))throw Error('사진 파일이 아닙니다.');
   bitmap=await decodePhoto(f);if(!bitmap.width||!bitmap.height)throw Error('사진 크기를 읽을 수 없습니다.');
   const scale=Math.min(1,2560/Math.max(bitmap.width,bitmap.height)),canvas=document.createElement('canvas');canvas.width=Math.max(1,Math.round(bitmap.width*scale));canvas.height=Math.max(1,Math.round(bitmap.height*scale));
   const ctx=canvas.getContext('2d');if(!ctx)throw Error('이미지 처리 공간이 부족합니다.');ctx.drawImage(bitmap.image||bitmap,0,0,canvas.width,canvas.height);
   const jpeg=/image\/(jpeg|pjpeg)/i.test(f.type||'')||/\.(jpe?g|jfif)$/i.test(f.name||''),data=canvas.toDataURL(jpeg?'image/jpeg':'image/png',.92);
   if(!data.startsWith('data:image/'))throw Error('이미지 변환에 실패했습니다.');
   photos.push({id:uid(),name:f.name||`붙여넣은 사진 ${photos.length+1}.png`,data,width:canvas.width,height:canvas.height});added++;
  }catch(err){errors.push({name:f.name||'이름 없는 파일',message:/\.(heic|heif)$/i.test(f.name||'')?'이 브라우저에서 지원하지 않는 형식입니다. JPG 또는 PNG로 변환해 주세요.':err.message||'사진을 읽을 수 없습니다.'})}
  finally{bitmap?.close?.()}
  progress(i+1);
 }
 for(const err of errors){const li=document.createElement('li');li.textContent=`${err.name}: ${err.message}`;failures.append(li)}
 renderPhotos();render();progress(files.length);
 toast(`전달 ${files.length}개 · 사진 ${added}장 추가${errors.length?' · 실패 '+errors.length+'개 (아래 사유 확인)':''}`);
 return {added,failed:errors.length,received:files.length};
}
function renderPhotos(){$('#photoCount').textContent=photos.length;$('#dropzone').style.minHeight=photos.length?'85px':'126px';$('#photoList').replaceChildren();photos.forEach((p,i)=>{let card=document.createElement('div');card.className='photocard';let im=document.createElement('img');im.src=p.data;im.alt=p.name;let t=document.createElement('div');t.className='name';t.textContent=`${i+1}. ${p.name}`;t.title=p.name;let actions=document.createElement('div');actions.className='actions';for(let [label,title,fn,disabled] of [['←','앞으로',()=>{[photos[i-1],photos[i]]=[photos[i],photos[i-1]]},i===0],['→','뒤로',()=>{[photos[i+1],photos[i]]=[photos[i],photos[i+1]]},i===photos.length-1],['×','삭제',()=>photos.splice(i,1),false]]){let b=document.createElement('button');b.textContent=label;b.title=title;b.disabled=disabled;b.onclick=()=>{fn();renderPhotos();render()};actions.append(b)}card.append(im,t,actions);$('#photoList').append(card)})}
$('#addPhotos').onclick=$('#dropzone').onclick=()=>$('#fileInput').click();
$('#fileInput').onchange=ev=>{const files=Array.from(ev.target.files||[]);ev.target.value='';addFiles(files,'파일 선택')};
$('#clearPhotos').onclick=async()=>{await uploadQueue;photos=[];page=0;mode='edit';$('#uploadStatus').textContent='';$('#uploadFailures').replaceChildren();renderPhotos();render()};
function isFileDrag(ev){return Array.from(ev.dataTransfer?.types||[]).includes('Files')||Array.from(ev.dataTransfer?.items||[]).some(item=>item.kind==='file')}
document.addEventListener('dragover',ev=>{if(!isFileDrag(ev))return;$('#dropzone').classList.add('over');ev.preventDefault();ev.dataTransfer.dropEffect='copy'});
document.addEventListener('dragleave',ev=>{if(!ev.relatedTarget)$('#dropzone').classList.remove('over')});
document.addEventListener('drop',async ev=>{
 $('#dropzone').classList.remove('over');
 
 if(!isFileDrag(ev)&&!ev.dataTransfer?.files?.length)return;
 ev.preventDefault();$('#dropzone').classList.remove('over');const transfer=ev.dataTransfer,listed=snapshotDroppedFiles(transfer);
 // Snapshot entries before the browser clears its drag data store.
 const entries=Array.from(transfer?.items||[]).map(item=>{try{return item.webkitGetAsEntry?.()}catch{return null}}).filter(Boolean);
 const expanded=await filesFromEntries(entries);
 const files=expanded.length>listed.length?expanded:listed;
 await addFiles(files,'드래그 등록');
 if(files.length===1){const note=document.createElement('li');note.textContent='브라우저에서 파일 1개만 전달되었습니다. 여러 개를 선택했다면 사진 추가 버튼으로 등록해 주세요. (업로드 v10)';$('#uploadFailures').append(note)}
});

async function handleImagePaste(ev){
 const target=ev.target;
 if(target?.closest?.('input,textarea,select,[contenteditable]:not([contenteditable="false"])'))return;
 const clipboard=ev.clipboardData;if(!clipboard)return;
 let files=Array.from(clipboard.items||[]).filter(item=>item.kind==='file'&&item.type.startsWith('image/')).map(item=>item.getAsFile()).filter(Boolean);
 if(!files.length)files=Array.from(clipboard.files||[]).filter(file=>file.type.startsWith('image/'));
 if(!files.length)return;
 ev.preventDefault();
 try{const result=await addFiles(files);if(result.added&&!result.failed)toast(`복사한 사진 ${result.added}장을 추가했습니다.`)}catch{toast('복사한 사진을 읽을 수 없습니다. 사진 파일로 추가해 주세요.')}
}
window.addEventListener('paste',handleImagePaste);

function downloadBlob(blob,name){let a=document.createElement('a'),url=URL.createObjectURL(blob);a.href=url;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),10000)}$('#saveLayout').onclick=()=>downloadBlob(new Blob([JSON.stringify({app:'photodeck',version:1,layout:state},null,2)],{type:'application/json'}),'photodeck-layout.json');$('#loadLayout').onclick=()=>$('#layoutInput').click();
function validateLayout(o){if(o.app!=='photodeck'||o.version!==1||!o.layout||!ratios[o.layout.ratio]||!/^#[0-9a-f]{6}$/i.test(o.layout.bg)||!Array.isArray(o.layout.elements)||o.layout.elements.length>200)throw Error();for(let e of o.layout.elements){for(const key of ['fillNone','strokeNone']){if(e[key]===undefined)e[key]=false;if(typeof e[key]!=='boolean')throw Error()}if(!names[e.type]||!['x','y','w','h','fontSize','rotation','strokeWidth'].every(k=>Number.isFinite(e[k]))||e.x<0||e.y<0||e.w<2||e.h<2||e.x+e.w>100.01||e.y+e.h>100.01||e.fontSize<6||e.fontSize>160||Math.abs(e.rotation)>360||e.strokeWidth<0||e.strokeWidth>12||!['fill','color','stroke'].every(k=>/^#[0-9a-f]{6}$/i.test(e[k]))||!['cover','contain'].includes(e.fit)||!['left','center','right'].includes(e.align)||typeof e.text!=='string'||e.text.length>10000)throw Error();if(e.type==='image'&&(!/^data:image\/png;base64,[A-Za-z0-9+/=]+$/.test(e.data)||e.data.length>16000000||!Number.isFinite(e.width)||!Number.isFinite(e.height)||e.width<=0||e.height<=0||typeof e.name!=='string'))throw Error();e.id=uid()}return o.layout}
$('#layoutInput').onchange=async ev=>{try{let obj=validateLayout(JSON.parse(await ev.target.files[0].text()));checkpoint();state=obj;selected=null;mode='edit';render();toast('레이아웃을 불러왔습니다.')}catch{toast('유효한 PhotoDeck 레이아웃 파일을 선택하세요.')}ev.target.value=''};
async function createDeck(){if(!photos.length)throw Error('사진을 먼저 추가하세요.');if(!slots().length)throw Error('사진 영역을 하나 이상 추가하세요.');if(!window.PptxGenJS)throw Error('PPT 생성 기능을 불러오지 못했습니다. 새로고침해 주세요.');const ppt=new PptxGenJS(),[W,H]=ratios[state.ratio];ppt.defineLayout({name:'CUSTOM',width:W,height:H});ppt.layout='CUSTOM';ppt.author='PhotoDeck';ppt.subject='사진 자동 배치';ppt.title=$('#filename').value||'사진 모음';ppt.lang='ko-KR';for(let p=0;p<pages();p++){let slide=ppt.addSlide();slide.background={color:state.bg.slice(1)};let si=0;for(let e of state.elements){let x=e.x*W/100,y=e.y*H/100,w=e.w*W/100,h=e.h*H/100,rotate=e.rotation;if(['photo','image'].includes(e.type)){let photo=e.type==='image'?e:photos[p*slots().length+si++];if(!photo)continue;let scale=(e.fit==='contain'?Math.min:Math.max)(w/photo.width,h/photo.height),pw=photo.width*scale,ph=photo.height*scale;let size=e.fit==='contain'?{x:x+(w-pw)/2,y:y+(h-ph)/2,w:pw,h:ph}:{x,y,w:pw,h:ph,sizing:{type:'crop',x:(pw-w)/2,y:(ph-h)/2,w,h}};slide.addImage({data:photo.data,...size,rotate})}else if(e.type==='text'){slide.addText(e.text.replaceAll('{page}',p+1),{x,y,w,h,fontFace:'맑은 고딕',fontSize:e.fontSize,color:e.color.slice(1),bold:e.bold,align:e.align,margin:0,breakLine:false,rotate,valign:'mid',fit:'resize'})}else if(['rect','ellipse'].includes(e.type)){slide.addShape(e.type==='ellipse'?ppt.ShapeType.ellipse:ppt.ShapeType.rect,{x,y,w,h,rotate,fill:{color:e.fill.slice(1),transparency:e.fillNone?100:0},line:{color:e.stroke.slice(1),width:e.strokeWidth,transparency:e.strokeNone||e.strokeWidth===0?100:0}})}else{slide.addShape(ppt.ShapeType.line,{x,y:y+h/2,w,h:0,rotate,line:{color:e.stroke.slice(1),width:e.strokeWidth,transparency:e.strokeNone||e.strokeWidth===0?100:0,beginArrowType:'none',endArrowType:e.type==='arrow'?'triangle':'none'}})}}}return ppt}
$('#download').onclick=async()=>{let b=$('#download');b.disabled=true;b.textContent='PPT 생성 중…';try{let ppt=await createDeck();await ppt.writeFile({fileName:($('#filename').value.trim()||'사진 모음').replace(/[\\/:*?"<>|]/g,'_')+'.pptx'});toast(`${pages()}페이지의 PPT를 다운로드했습니다.`)}catch(e){toast(e.message||'파일 생성 중 오류가 발생했습니다.')}finally{b.disabled=false;b.textContent='PPTX 다운로드 ↗'}};
window.addEventListener('resize',()=>renderCanvas());try{let saved=localStorage.getItem('photodeck-layout-v1');if(saved)state=validateLayout({app:'photodeck',version:1,layout:JSON.parse(saved)});else applyPreset(2,false)}catch{applyPreset(2,false)}render();window.PhotoDeck={createDeck,getState:()=>state,getPhotos:()=>photos,pages};

