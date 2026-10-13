const palette=[{id:'purple',name:'LILA',hex:'#a873ff'},{id:'pink',name:'ROSA',hex:'#ff75bb'},{id:'cyan',name:'TURQUESA',hex:'#55e5dc'}];
const names=['Lara','Anne','Anne de Alemania'],symbols=['★','☀','▣'];
const $=id=>document.getElementById(id);
let team=[...palette],round=0,aim=-1,done=[],audio=null,sound=false;
const backgroundMusic=$('background-music'),finaleMusic=$('finale-music');
let music=backgroundMusic;
finaleMusic.volume=.45;
music.volume=.45;
let speechVersion=0,musicVersion=0;
function cancelSpeech(){speechVersion++;window.speechSynthesis?.cancel();music.muted=false;}
function screen(id){cancelSpeech();switchMusic(id);['intro','choose','map','stage','alley','paths','concert'].forEach(x=>$(x).hidden=x!==id);document.body.dataset.screen=id;window.scrollTo({top:0,behavior:'instant'});}
function tone(){if(!sound)return;try{audio??=new (window.AudioContext||window.webkitAudioContext)();audio.resume();const o=audio.createOscillator(),g=audio.createGain();o.connect(g);g.connect(audio.destination);o.frequency.value=660;g.gain.setValueAtTime(.035,audio.currentTime);g.gain.exponentialRampToValueAtTime(.001,audio.currentTime+.18);o.start();o.stop(audio.currentTime+.18);}catch{}}
function spanishVoice(){
 const voices=window.speechSynthesis?.getVoices?.()||[];
 return voices.find(v=>/^es(?:-|_)/i.test(v.lang)&&/Elvira|Helena|Laura|Sabina|Paulina|Monica|Mónica|Luciana|Penelope|Penélope|Conchita|Mia|Mía|Dalia|Paloma|female|mujer/i.test(v.name))||voices.find(v=>/^es(?:-|_)/i.test(v.lang));
}
function switchMusic(id){
 const next=id==='concert'&&finaleActive?finaleMusic:backgroundMusic;
 if(next===music)return;
 ++musicVersion;music.pause();music.currentTime=0;music.muted=false;music=next;music.muted=false;
 if(sound)playMusic();
}
function playMusic(){const version=++musicVersion;music.play().catch(()=>{if(version!==musicVersion)return;sound=false;updateSound();$('sound').textContent='♫ Reintentar sonido';});}
function speak(text){
 if(!window.speechSynthesis)return;
 const voice=spanishVoice();
 if(!voice){$('sound').textContent='Voz española no disponible';return;}
 const version=++speechVersion;
 window.speechSynthesis.cancel();
 music.muted=true;
 const u=new SpeechSynthesisUtterance(text);
 u.voice=voice;u.lang=voice.lang;u.rate=.85;
 const restore=()=>{if(version===speechVersion)music.muted=false;};
 u.onend=restore;u.onerror=restore;
 try{window.speechSynthesis.speak(u);}catch{restore();}
}
function pick(id){const c=palette.find(x=>x.id===id);$('choose-preview').classList.add('has-light');$('choose-caption').textContent='★ LARA · '+c.name;team=[c,...palette.filter(x=>x!==c)];document.documentElement.style.setProperty('--lara',c.hex);document.querySelectorAll('[data-pick]').forEach(b=>b.setAttribute('aria-pressed',b.dataset.pick===id));$('pass').hidden=false;$('pass-color').textContent=c.name;$('color-feedback').textContent='¡Tu luz es '+c.name.toLowerCase()+', Lara! Busca tu estrella y este color.';document.querySelectorAll('[data-person]').forEach((p,i)=>{p.style.setProperty('--member',team[i].hex);p.querySelector('.badge').textContent=symbols[i]+' '+names[i].toUpperCase();});tone();}
function reset(){round=0;aim=-1;done=[];$('success').hidden=true;$('feedback').textContent='Tú manejas el foco. Primero toca a Lara en el escenario.';render();}
function render(){const complete=done.includes(round);$('count').textContent=done.length+' / 3';$('next').hidden=!complete;$('next').textContent=round===2?'VER EL RASTRO →':'SIGUIENTE LUZ →';$('step-label').textContent=complete?'¡LUZ ENCENDIDA!':aim===round?'PASO 2 · EL COLOR':'PASO 1 · LA PERSONA';$('task').textContent=complete?'¡'+names[round]+' brilla!':aim===round?'Elige su color.':'Toca a '+names[round]+'.';$('instructions').textContent=complete?'¡El foco apunta a '+names[round]+' y su luz tiene el mismo color que su círculo!':aim===round?'Toca el botón del mismo color que el círculo bajo sus pies.':'Toca su figura en el escenario. El foco girará hacia ella.';$('light-colors').replaceChildren();if(aim===round&&!complete)team.forEach((c,i)=>{const b=document.createElement('button');b.style.background=c.hex;b.textContent=c.name;b.setAttribute('aria-label','Luz '+c.name.toLowerCase());b.onclick=()=>color(i);$('light-colors').append(b);});document.querySelectorAll('[data-person]').forEach((p,i)=>{p.classList.toggle('lit',done.includes(i));p.classList.toggle('wanted',i===round&&!complete);p.setAttribute('aria-pressed',i===aim);p.disabled=complete;});draw(complete?team[round].hex:aim===round?'#fff1ce':null);}
function draw(c){
 const layer=$('beams');layer.replaceChildren();
 function light(origin,target,color,active){
  const lamp=document.createElement('div');lamp.className='real-lamp'+(active?' active-lamp':'');
  lamp.style.left='calc('+origin+'% - 35px)';
  lamp.style.setProperty('--light',color||'#797989');
  lamp.style.transform='rotate('+(active&&aim>=0?(aim-1)*-28:0)+'deg)';
  lamp.innerHTML='<span></span><b>'+(active?'TU FOCO':'✓')+'</b>';layer.append(lamp);
  if(!color)return;
  const center=16.67+target*33.33,beam=document.createElement('div');
  beam.className='single-beam'+(active?' active-beam':'');
  beam.style.setProperty('--light',color);
  beam.style.clipPath='polygon('+(origin-2)+'% 0,'+(origin+2)+'% 0,'+(center+13)+'% 100%,'+(center-13)+'% 100%)';
  layer.append(beam);
  const glow=document.createElement('div');glow.className='floor-glow';
  glow.style.left=(target*33.33)+'%';glow.style.background=color;layer.append(glow);
 }
 done.forEach(i=>light(16.67+i*33.33,i,team[i].hex,false));
 if(!done.includes(round))light(50,aim,c,true);
}
function target(i){if(done.includes(round))return;aim=i;if(i!==round){$('feedback').textContent='Primero buscamos a '+names[round]+'. Toca su símbolo '+symbols[round]+'.';render();return;}$('feedback').textContent='¡Mira! El foco apunta hacia ella. Ahora elige el color de su círculo.';render();}
function color(i){if(i!==round){draw(team[i].hex);$('feedback').textContent='Ese color es de '+names[i]+'. Prueba el color de '+names[round]+'.';return;}done.push(round);tone();$('feedback').textContent='¡Sí! '+team[i].name+' para '+names[i]+'.';render();}
function explainMission(){speak('Vamos a iluminar a las tres personas. Primero toca a la persona que te pido. Después elige el mismo color que el círculo bajo sus pies. '+$('task').textContent+' '+$('instructions').textContent);}
$('start').onclick=()=>screen('choose');document.querySelectorAll('[data-pick]').forEach(b=>b.onclick=()=>pick(b.dataset.pick));$('enter').onclick=()=>screen('map');$('open-stage').onclick=()=>{reset();screen('stage');};$('back').onclick=()=>{window.speechSynthesis?.cancel();screen('map');};document.querySelectorAll('[data-person]').forEach(p=>p.onclick=()=>target(Number(p.dataset.person)));$('next').onclick=()=>{if(round===2){$('success').hidden=false;return;}round++;aim=-1;$('feedback').textContent='¡Vamos con '+names[round]+'!';render();};$('help').onclick=()=>speak($('task').textContent+' '+$('instructions').textContent);$('replay').onclick=reset;$('sound').onclick=()=>{sound=!sound;$('sound').setAttribute('aria-pressed',sound);$('sound').textContent=sound?'♫ Sonido activado':'♫ Sonido';tone();};

$('help').onclick=explainMission;
let stageCleared=false,searchRound=0,foundThis=false,alleyCleared=false;
const spots=[{id:'boxes',name:'Las cajas',x:4,y:58,w:22,h:29},{id:'moon',name:'La luna',x:8,y:17,w:20,h:24},{id:'plant',name:'La maceta',x:36,y:62,w:20,h:25},{id:'star',name:'La estrella',x:72,y:15,w:22,h:25},{id:'machine',name:'La máquina',x:76,y:52,w:20,h:36},{id:'door',name:'La puerta',x:43,y:24,w:19,h:38}];
const hunt=[{spot:'moon',title:'¡Dos orejitas!',clue:'Se ha escondido junto a la luna que brilla. ¿Ves sus orejitas?',x:16,y:24,part:'ears'},{spot:'star',title:'¡Ahora está arriba!',clue:'Ha saltado hasta el letrero de la estrella. ¡Su cola lo delata!',x:85,y:26,part:'tail'},{spot:'boxes',title:'¡Oigo un ruido!',clue:'Toc, toc… ¡Hay alguien detrás de las cajas! Busca su sombra.',x:15,y:59,part:'shadow'}];
function unlockAlley(){stageCleared=true;$('open-alley').hidden=false;$('alley-locked').hidden=true;$('open-stage').classList.add('cleared');$('open-stage').querySelector('small').textContent='✓ LUCES ENCENDIDAS';}
function startSearch(){if(!stageCleared)return;searchRound=0;foundThis=false;$('crystal-found').hidden=true;screen('alley');showSearch();}
function showSearch(){const h=hunt[searchRound];$('clue-title').textContent=h.title;$('clue').textContent=h.clue;$('find-count').textContent=searchRound+' / 3';$('search-next').hidden=true;$('search-next').textContent=searchRound===2?'RECOGER EL CRISTAL →':'SEGUIRLO →';$('search-feedback').textContent='Mira la calle y toca su escondite.';$('peek').style.left=h.x+'%';$('peek').style.top=h.y+'%';$('peek').classList.remove('caught');$('hideouts').replaceChildren();spots.forEach(s=>{const b=document.createElement('button');b.className='hideout';b.style.left=s.x+'%';b.style.top=s.y+'%';b.style.width=s.w+'%';b.style.height=s.h+'%';b.setAttribute('aria-label',s.name);b.onclick=()=>search(s.id);$('hideouts').append(b);});}
function search(id){if(foundThis)return;if(id!==hunt[searchRound].spot){$('search-feedback').textContent='Aquí no está. Sigue buscando; no hay prisa.';return;}foundThis=true;tone();$('peek').classList.add('caught');$('find-count').textContent=(searchRound+1)+' / 3';$('search-feedback').textContent=searchRound===2?'¡Lo atrapaste! Tiene el cristal.':'¡Lo encontraste! «¡Uy! ¡Me has visto!»';$('search-next').hidden=false;}
const originalShowSearch=showSearch;
showSearch=function(){originalShowSearch();$('peek').dataset.part=hunt[searchRound].part;$('hide-cover').dataset.part=hunt[searchRound].part;};
$('follow-trail').onclick=()=>{unlockAlley();startSearch();};$('open-alley').onclick=startSearch;$('alley-back').onclick=()=>{window.speechSynthesis?.cancel();screen('map');};$('search-help').onclick=()=>speak(hunt[searchRound].clue);$('search-next').onclick=()=>{if(!foundThis)return;if(searchRound===2){alleyCleared=true;$('crystal-found').hidden=false;$('open-alley').classList.add('cleared');$('open-alley').querySelector('small').textContent='✓ CRISTAL RECUPERADO';return;}searchRound++;foundThis=false;showSearch();};$('return-city').onclick=()=>screen('map');$('search-replay').onclick=startSearch;
const originalNext=$('next').onclick;$('next').onclick=()=>{originalNext();if(done.length===3)unlockAlley();};
const previousScreen=screen;screen=function(id){previousScreen(id);if(id==='map'){document.body.dataset.progress=alleyCleared?'crystal':stageCleared?'alley':'stage';$('radio-message').textContent=alleyCleared?'«¡Tenemos el cristal! La torre de los dos caminos será nuestra próxima misión.»':stageCleared?'«¡Las luces ya están encendidas! Sigue el rastro hasta la calle de las sombras.»':'«¡Te recibo, Lara! Pulsa el escenario iluminado. Anne te está esperando.»';}};



let pathsCleared=false,radioRound=0,sourceSelected=false,signals=[];
const radioPoints=[{name:'Lara',x:14,y:31,symbol:'★'},{name:'Anne',x:30,y:76,symbol:'☀'},{name:'Anne de Alemania',x:57,y:43,symbol:'▣'},{name:'La torre',x:90,y:29,symbol:'◆'}];
const radioLinks=[{from:0,to:1,story:'«Lara, tú vas por los tejados y yo por el túnel. ¡Mándame un saludo!»',message:'«¡Hola, Lara! Te escucho. Aunque vayamos por caminos distintos, seguimos conectadas.»'},{from:1,to:2,story:'«Anne de Alemania está al otro lado de la radio. ¡Vamos a saludarla!»',message:'«¡Os escucho desde Alemania! Lara, te quiero muchísimo y me encanta ser tu amiga.»'},{from:2,to:3,story:'«Ya estamos conectadas. ¡Llevemos nuestra señal hasta la torre!»',message:'«¡La torre recibe la señal! Nos vemos allí, Lara.»'}];
function unlockPaths(){if(!alleyCleared)return;$('open-paths').hidden=false;$('paths-locked').hidden=true;}
function startPaths(){if(!alleyCleared)return;unlockPaths();radioRound=0;sourceSelected=false;signals=[];$('paths-complete').hidden=true;$('radio-feedback').textContent='Arrastra el punto luminoso. También puedes tocar primero el inicio y después el destino.';screen('paths');renderRadio();}
function connection(a,b,preview=false){const world=$('antennas').getBoundingClientRect(),x1=a.x*world.width/100,y1=a.y*world.height/100,x2=b.x*world.width/100,y2=b.y*world.height/100;const line=document.createElement('div');line.className='radio-link'+(preview?' preview-link':'');line.style.left=a.x+'%';line.style.top=a.y+'%';line.style.width=Math.hypot(x2-x1,y2-y1)+'px';line.style.transform='rotate('+Math.atan2(y2-y1,x2-x1)*180/Math.PI+'deg)';$('radio-connections').append(line);return line;}
function renderRadio(){const link=radioLinks[radioRound],complete=signals.includes(radioRound);$('signal-count').textContent=signals.length+' / 3';$('radio-task').textContent=complete?'¡Mensaje recibido!':'Conecta con '+radioPoints[link.to].name+'.';$('radio-story').textContent=link.story;$('antenna-instruction').textContent=complete?'¡La luz ha llegado! Escucha la respuesta.':'Haz clic en la luz de '+radioPoints[link.from].name+', mantén pulsado el botón del ratón y arrástrala hasta '+radioPoints[link.to].name+'. Allí, suelta el botón. ¡La radio se conectará!' ;$('radio-next').hidden=!complete;$('radio-next').textContent=radioRound===2?'ENTRAR EN LA TORRE →':'OTRO SALUDO →';$('antennas').replaceChildren();$('radio-connections').replaceChildren();signals.forEach(i=>connection(radioPoints[radioLinks[i].from],radioPoints[radioLinks[i].to]));radioPoints.forEach((p,i)=>{const b=document.createElement('button');b.className='radio-point'+(!complete&&i===link.from?' source-point':'')+(!complete&&i===link.to?' destination-point':'');b.style.left=p.x+'%';b.style.top=p.y+'%';b.innerHTML='<span class="radio-device"><i class="device-antenna"></i><span class="device-screen">'+p.symbol+'</span><span class="device-speaker"></span><i class="device-led"></i></span><small class="device-name">'+p.name.toUpperCase()+'</small>';b.setAttribute('aria-label',p.name+(i===link.from?', inicio de la señal':i===link.to?', destino de la señal':''));b.onclick=()=>tapRadio(i);b.onpointerdown=e=>dragRadio(e,i,b);$('antennas').append(b);});}
function tapRadio(i){if(signals.includes(radioRound))return;const l=radioLinks[radioRound];if(i===l.from){sourceSelected=true;$('radio-feedback').textContent='Ahora toca a '+radioPoints[l.to].name+'.';}else if(sourceSelected&&i===l.to)finishSignal();else $('radio-feedback').textContent='Empieza en la luz de '+radioPoints[l.from].name+'.';}
const renderArcadeRadios=renderRadio;
renderRadio=function(){renderArcadeRadios();const tower=$('antennas').children[3];tower.dataset.tower='true';tower.innerHTML='<span class="radio-device"><span class="pixel-tower"></span></span><small class="device-name">LA TORRE</small>';};
function finishSignal(){if(signals.includes(radioRound))return;signals.push(radioRound);sourceSelected=false;tone();renderRadio();$('radio-feedback').textContent=radioLinks[radioRound].message;}
function dragRadio(e,i,button){const l=radioLinks[radioRound];if(i!==l.from||signals.includes(radioRound))return;sourceSelected=true;const box=$('antennas').getBoundingClientRect();let moved=false,preview;button.setPointerCapture(e.pointerId);button.onpointermove=event=>{moved=true;preview?.remove();preview=connection(radioPoints[i],{x:(event.clientX-box.left)/box.width*100,y:(event.clientY-box.top)/box.height*100},true);};button.onpointerup=event=>{button.onpointermove=null;button.onpointerup=null;preview?.remove();if(!moved)return;const dest=radioPoints[l.to],px=box.left+dest.x*box.width/100,py=box.top+dest.y*box.height/100;if(Math.hypot(event.clientX-px,event.clientY-py)<Math.max(55,box.width*.065))finishSignal();else $('radio-feedback').textContent='Lleva la luz hasta '+dest.name+'. Puedes probar otra vez.';};button.onpointercancel=()=>{preview?.remove();button.onpointermove=null;button.onpointerup=null;};}
$('open-paths').onclick=startPaths;$('continue-paths').onclick=startPaths;$('paths-back').onclick=()=>{window.speechSynthesis?.cancel();screen('map');};$('radio-next').onclick=()=>{if(!signals.includes(radioRound))return;if(radioRound===2){pathsCleared=true;$('paths-complete').hidden=false;$('open-paths').classList.add('cleared');$('open-paths').querySelector('small').textContent='✓ RADIOS CONECTADAS';return;}radioRound++;sourceSelected=false;$('radio-feedback').textContent='Sigue la luz hasta la siguiente persona.';renderRadio();};$('radio-read').onclick=()=>speak(signals.includes(radioRound)?radioLinks[radioRound].message:$('radio-story').textContent+' '+$('antenna-instruction').textContent);$('paths-city').onclick=()=>screen('map');$('paths-replay').onclick=startPaths;
const previousSearchNext=$('search-next').onclick;$('search-next').onclick=()=>{previousSearchNext();if(alleyCleared)unlockPaths();};
const mapScreen=screen;screen=function(id){mapScreen(id);if(id==='map'&&alleyCleared){unlockPaths();document.body.dataset.progress=pathsCleared?'tower':'paths';$('radio-message').textContent=pathsCleared?'«¡Las radios funcionan y tenemos dos cristales! El gran concierto será nuestra siguiente misión.»':'«Lara, Anne te espera en los dos caminos. ¡Vamos a conectar las radios!»';}};
window.addEventListener('resize',()=>{if(document.body.dataset.screen==='paths')renderRadio();});
function updateSound(){ $('sound').setAttribute('aria-pressed',sound);$('sound').textContent=sound?'♫ Sonido activado':'♫ Sonido';}
$('sound').onclick=()=>{sound=!sound;++musicVersion;updateSound();if(sound)playMusic();else music.pause();};


const dancePattern=[0,1,2,0],danceSymbols=['★','ϟ','☾'];
let finaleActive=false;
let danceStep=0,danceReady=false,danceShowing=false,danceVersion=0,concertCleared=false;
function unlockConcert(){if(!pathsCleared)return;$('open-concert').hidden=false;$('concert-locked').hidden=true;}
function startConcert(){if(!pathsCleared)return;finaleActive=false;$('concert').classList.remove('finale-active');unlockConcert();danceVersion++;danceStep=0;danceReady=false;danceShowing=false;$('treasure').hidden=true;$('treasure-message').hidden=true;$('open-treasure').hidden=false;screen('concert');renderDance();$('dance-feedback').textContent='Primero mira el baile. Después, toca los dibujos en el mismo orden.';}
function renderDance(){ $('dance-count').textContent=danceStep+' / 4';$('dance-sequence').replaceChildren();dancePattern.forEach((_,i)=>{const step=document.createElement('span');step.textContent=i<danceStep?'✓':'?';step.className=i<danceStep?'dance-ok':'';$('dance-sequence').append(step);});document.querySelectorAll('[data-dance]').forEach(b=>{b.disabled=!danceReady||danceShowing;b.classList.remove('dance-flash');});$('dance-demo').disabled=danceShowing;$('dance-task').textContent=danceShowing?'Mira el baile…':danceReady?'¡Ahora tú, Lara!':'¡Ensayamos juntas!';}
async function demoDance(){const version=++danceVersion;danceStep=0;danceReady=false;danceShowing=true;renderDance();$('dance-feedback').textContent='Mira qué dibujos se iluminan. Son cuatro pasos.';for(let i=0;i<dancePattern.length;i++){if(version!==danceVersion)return;const pad=document.querySelector('[data-dance="'+dancePattern[i]+'"]'),step=$('dance-sequence').children[i];pad.classList.add('dance-flash');step.textContent=danceSymbols[dancePattern[i]];tone();await new Promise(r=>setTimeout(r,800));if(version!==danceVersion)return;pad.classList.remove('dance-flash');await new Promise(r=>setTimeout(r,250));}if(version!==danceVersion)return;danceShowing=false;danceReady=true;renderDance();$('dance-feedback').textContent='¡Ahora repite los cuatro pasos! Puedes volver a mirar si quieres.';}
function dancePress(i){if(!danceReady||danceShowing)return;if(i!==dancePattern[danceStep]){danceStep=0;renderDance();$('dance-feedback').textContent='¡Lo ensayamos otra vez! Empieza con la estrella ★. Puedes tocar VER LOS PASOS.';return;}tone();document.querySelectorAll('[data-dancer]').forEach(d=>{d.classList.remove('dance-move');void d.offsetWidth;d.classList.add('dance-move');});danceStep++;renderDance();if(danceStep===4){danceReady=false;concertCleared=true;renderDance();startFinale();$('dance-feedback').textContent='¡Lo hiciste! El concierto está encendido.';$('open-concert').classList.add('cleared');$('open-concert').querySelector('small').textContent='✓ CONCIERTO ENCENDIDO';}else $('dance-feedback').textContent='¡Sí! Sigue con el siguiente paso.';}
$('open-concert').onclick=startConcert;$('continue-concert').onclick=startConcert;$('concert-back').onclick=()=>{danceVersion++;danceShowing=false;screen('map');};$('dance-demo').onclick=demoDance;document.querySelectorAll('[data-dance]').forEach(b=>b.onclick=()=>dancePress(Number(b.dataset.dance)));$('dance-read').onclick=()=>speak('Mira primero los cuatro dibujos que se iluminan. Después toca los mismos dibujos en el mismo orden. Puedes volver a ver los pasos cuando quieras.');$('open-treasure').onclick=()=>{$('open-treasure').hidden=true;$('treasure-message').hidden=false;};$('treasure-read').onclick=()=>speak('Lara, el tesoro eres tú. Eres importante por ser tú. No tienes que ganar ningún juego para que te queramos. Anne te quiere siempre: cuando te ríes, cuando lloras y cuando te enfadas. Anne de Alemania te quiere muchísimo y le encanta ser tu amiga. Hay una sorpresa para ti. Pregunta a Anne dónde te espera tu regalo.');$('final-city').onclick=()=>screen('map');
const nextRadioRound=$('radio-next').onclick;$('radio-next').onclick=()=>{nextRadioRound();if(pathsCleared)unlockConcert();};
const finalMapScreen=screen;screen=function(id){if(id!=='concert'){danceVersion++;danceShowing=false;}finalMapScreen(id);if(id==='map'&&pathsCleared){unlockConcert();$('radio-message').textContent=concertCleared?'«¡Lara, la ciudad brilla! Puedes volver a jugar en cualquiera de los lugares.»':'«¡Ya tenemos los cristales! Lara, necesitamos tu ayuda para el baile del concierto.»';}};
function fitMap(){const map=$('map'),city=map.querySelector('.city');if(!map.clientWidth||!city||document.body.dataset.screen!=='map')return;const side=window.innerWidth>=1000;let used=0;Array.from(map.children).forEach(c=>{if(c===city||(side&&c.classList.contains('radio')))return;const style=getComputedStyle(c);used+=c.getBoundingClientRect().height+parseFloat(style.marginTop||0)+parseFloat(style.marginBottom||0);});const available=Math.max(100,map.clientHeight-used-16),column=side?Math.max(100,map.clientWidth-Math.min(320,Math.max(245,window.innerWidth*.23))-20):map.clientWidth,width=Math.min(column,available*16/9);city.style.width=width+'px';city.style.height=width*9/16+'px';}
const fitScene=screen;screen=function(id){fitScene(id);if(id==='map')fitMap();};window.addEventListener('resize',fitMap);

function startFinale(){finaleActive=true;$('concert').classList.add('finale-active');$('treasure').hidden=true;screen('concert');}
$('reveal-final-treasure').onclick=()=>{$('treasure').hidden=false;};
