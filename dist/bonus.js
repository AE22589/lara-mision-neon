// Optional encore: one slow star at a time, no timer or lost lives.
let bonusFrame=0,bonusLast=0,bonusDirection=0,bonusKeys=new Set();
let bonusPlaying=false,bonusPaused=false,bonusCaught=0,bonusX=50,bonusDrop=null,bonusTransfer=null;
const bonusTargets=[50,68,32,72,45,24,60,78,36,50];
const bonusBeforeScreen=screen;
screen=function(id){if(id!=='bonus')stopBonus();bonusBeforeScreen(id);};
function stopBonus(){cancelAnimationFrame(bonusFrame);bonusFrame=0;bonusPlaying=false;bonusDirection=0;bonusKeys.clear();}
function startBonus(){
 if(!concertCleared)return;
 stopBonus();bonusCaught=0;bonusX=50;bonusPaused=false;bonusDrop=null;bonusTransfer=null;
 $('bonus').classList.remove('bonus-celebrating');$('bonus-welcome').hidden=false;$('bonus-finished').hidden=true;
 $('bonus-falling').hidden=true;$('bonus-transfer').hidden=true;$('bonus-pause').hidden=true;
 $('bonus-pause').textContent='Ⅱ Pausa';$('bonus-hint').textContent='Mantén pulsada una flecha para mover a Lara. Al soltar, se queda quieta.';
 $('bonus-score').textContent='0 / 10';$('bonus-star-fill').style.clipPath='inset(100% 0 0)';
 $('bonus-player').style.left='50%';$('bonus-open').hidden=false;
 document.querySelectorAll('[data-bonus-dir]').forEach(b=>{b.disabled=true;b.classList.remove('bonus-nudge');});
 screen('bonus');
}
function dropBonusStar(){
 const x=bonusTargets[bonusCaught];bonusDrop={x,y:25,guided:bonusCaught===1};
 $('bonus-falling').hidden=false;$('bonus-falling').style.left=x+'%';$('bonus-falling').style.top='25%';
 if(bonusCaught===0)$('bonus-hint').textContent='¡Mira! La primera estrella viene hacia Lara. Ella la recoge sola.';
 else if(bonusCaught===1){$('bonus-hint').textContent='Ahora mantén pulsada la flecha DERECHA →. Ponte debajo de la estrella.';$('bonus-right').classList.add('bonus-nudge');}
 else $('bonus-hint').textContent=bonusCaught>=9?'¡Solo falta una estrella, Lara!':bonusCaught>=7?'¡Ya casi lo tienes! Sigue así, Lara.':bonusCaught>=3?'¡Muy bien, Lara! Ponte debajo de la siguiente estrella.':'¡Lo estás haciendo genial! Recoge la siguiente estrella.';
}
function beginBonus(){
 $('bonus-welcome').hidden=true;bonusPlaying=true;bonusPaused=false;
 $('bonus-pause').hidden=false;document.querySelectorAll('[data-bonus-dir]').forEach(b=>b.disabled=false);
 dropBonusStar();bonusLast=0;bonusFrame=requestAnimationFrame(tickBonus);
}
function catchBonusStar(){
 const position={x:bonusDrop.x,y:bonusDrop.y};bonusDrop=null;bonusCaught++;tone();
 $('bonus-falling').hidden=true;$('bonus-score').textContent=bonusCaught+' / 10';
 $('bonus-star-fill').style.clipPath='inset('+(100-bonusCaught*10)+'% 0 0)';
 $('bonus-right').classList.remove('bonus-nudge');$('bonus-hint').textContent=(bonusCaught>=9?'¡Solo falta una!':bonusCaught>=7?'¡Ya casi lo tienes!':'¡Muy bien, Lara!')+' Su luz sube a nuestra gran estrella. '+bonusCaught+' de 10.';
 bonusTransfer={...position,elapsed:0};$('bonus-transfer').hidden=false;
}
function finishBonus(){
 bonusPlaying=false;bonusDirection=0;bonusKeys.clear();$('bonus-finished').hidden=false;$('bonus-pause').hidden=true;
 $('bonus').classList.add('bonus-celebrating');$('bonus-hint').textContent='¡Mira, Lara! ¡Nuestra estrella brilla con tu color!';
 document.querySelectorAll('[data-bonus-dir]').forEach(b=>b.disabled=true);
}
function tickBonus(now){
 bonusFrame=0;if(!bonusPlaying||document.body.dataset.screen!=='bonus')return;
 const dt=bonusLast?Math.min((now-bonusLast)/1000,.05):0;bonusLast=now;
 if(!bonusPaused&&!document.hidden){
  const direction=bonusKeys.size?(Number(bonusKeys.has('ArrowRight'))-Number(bonusKeys.has('ArrowLeft'))):bonusDirection;
  bonusX=Math.max(12,Math.min(88,bonusX+direction*34*dt));$('bonus-player').style.left=bonusX+'%';
  if(bonusTransfer){
   bonusTransfer.elapsed+=dt;const t=Math.min(1,bonusTransfer.elapsed/.85);
   $('bonus-transfer').style.left=(bonusTransfer.x+(50-bonusTransfer.x)*t)+'%';
   $('bonus-transfer').style.top=(bonusTransfer.y+(15-bonusTransfer.y)*t)+'%';
   if(t===1){bonusTransfer=null;$('bonus-transfer').hidden=true;if(bonusCaught===10){finishBonus();return;}dropBonusStar();}
  }else if(bonusDrop){
   // The second star waits until Lara reaches it: a playable tutorial.
   if(!bonusDrop.guided||Math.abs(bonusX-bonusDrop.x)<9){if(bonusDrop.guided)$('bonus-hint').textContent='¡Ahí! Suelta la flecha para quedarte debajo de la estrella.';bonusDrop.guided=false;bonusDrop.y+=14*dt;}
   else bonusDrop.y=Math.min(48,bonusDrop.y+14*dt);
   $('bonus-falling').style.top=bonusDrop.y+'%';
   if(bonusDrop.y>=60&&bonusDrop.y<=74&&Math.abs(bonusX-bonusDrop.x)<10)catchBonusStar();
   else if(bonusDrop.y>88){bonusDrop.y=25;$('bonus-hint').textContent='¡Vuelve otra estrella! Ponte debajo; no hay prisa.';}
  }
 }
 bonusFrame=requestAnimationFrame(tickBonus);
}
function pauseBonus(){if(!bonusPlaying)return;bonusPaused=!bonusPaused;bonusDirection=0;bonusKeys.clear();$('bonus-pause').textContent=bonusPaused?'▶ Seguir jugando':'Ⅱ Pausa';}
document.querySelectorAll('[data-bonus-dir]').forEach(b=>{
 b.onpointerdown=e=>{if(!bonusPlaying||bonusPaused)return;e.preventDefault();b.setPointerCapture(e.pointerId);bonusDirection=Number(b.dataset.bonusDir);};
 const release=()=>{bonusDirection=0;};b.onpointerup=release;b.onpointercancel=release;b.onlostpointercapture=release;
 b.onclick=e=>{if(e.detail===0&&bonusPlaying&&!bonusPaused){bonusX=Math.max(12,Math.min(88,bonusX+Number(b.dataset.bonusDir)*10));$('bonus-player').style.left=bonusX+'%';}};
});
window.addEventListener('keydown',e=>{if(!bonusPlaying||bonusPaused||!['ArrowLeft','ArrowRight'].includes(e.key))return;e.preventDefault();bonusKeys.add(e.key);});
window.addEventListener('keyup',e=>bonusKeys.delete(e.key));
window.addEventListener('blur',()=>{bonusDirection=0;bonusKeys.clear();if(bonusPlaying&&!bonusPaused)pauseBonus();});
document.addEventListener('visibilitychange',()=>{if(document.hidden&&bonusPlaying&&!bonusPaused)pauseBonus();});
$('bonus-start').onclick=beginBonus;$('bonus-pause').onclick=pauseBonus;
$('bonus-enter').onclick=startBonus;$('bonus-open').onclick=startBonus;$('bonus-replay').onclick=startBonus;
$('bonus-back').onclick=()=>screen('map');$('bonus-city').onclick=()=>screen('map');
$('bonus-read').onclick=()=>{if(bonusPlaying&&!bonusPaused)pauseBonus();speak('El pequeño travieso quiere jugar con nosotras. Vamos a llenar de luz la gran estrella. Mantén pulsada la flecha izquierda o derecha para mover a Lara. Suelta para parar. Ponte debajo de las estrellas que caen: Lara las recoge sola. No hay prisa.');};
