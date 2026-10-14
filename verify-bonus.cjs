const vm=require('node:vm'),fs=require('node:fs'),assert=require('node:assert/strict');
function el(){return {hidden:false,disabled:false,textContent:'',style:{left:'',setProperty(){}},dataset:{},classList:{add(){},remove(){},toggle(){}},setPointerCapture(){}};}
const nodes={},controls=[el(),el()];controls[0].dataset.bonusDir='-1';controls[1].dataset.bonusDir='1';
const events={};let scheduled=0,cancelled=0,spoke=0,timestamp=0;
const ctx={console,concertCleared:false,tone(){},speak(){spoke++},$:id=>nodes[id]??=el(),document:{hidden:false,body:{dataset:{screen:'map'}},querySelectorAll:()=>controls,addEventListener:(type,fn)=>events[type]=fn},window:{addEventListener:(type,fn)=>events[type]=fn},requestAnimationFrame(){return ++scheduled},cancelAnimationFrame(){cancelled++},screen(id){ctx.document.body.dataset.screen=id}};
vm.createContext(ctx);vm.runInContext(fs.readFileSync('dist/bonus.js','utf8'),ctx);
function run(s){return vm.runInContext(s,ctx)}function step(n=1){for(let i=0;i<n;i++){timestamp+=50;run(`tickBonus(${timestamp})`)}}
run('startBonus()');assert.equal(ctx.document.body.dataset.screen,'map','Bonus must remain locked before concert');
run('concertCleared=true;startBonus();beginBonus()');step(105);assert.equal(run('bonusCaught'),1,'First star must be caught automatically');step(80);assert.equal(run('bonusCaught'),1);assert.ok(run('bonusDrop.guided&&bonusDrop.y<=48'),'Second star must wait for movement');
run('bonusDirection=1');step(10);run('bonusDirection=0');step(90);assert.equal(run('bonusCaught'),2,'Guided second catch');
step(20);run('bonusX=88');step(180);assert.equal(run('bonusCaught'),2,'Misses must not remove progress');
run('pauseBonus()');const before=run('bonusDrop.y');step(40);assert.equal(run('bonusDrop.y'),before,'Pause must freeze falling stars');assert.equal(run('bonusDirection'),0);run('pauseBonus()');
while(run('bonusCaught')<10){run('bonusX=bonusTargets[bonusCaught]');step(180)}step(20);
assert.equal(run('bonusPlaying'),false);assert.equal(nodes['bonus-finished'].hidden,false);assert.equal(nodes['bonus-score'].textContent,'10 / 10');assert.equal(nodes['bonus-star-fill'].style.clipPath,'inset(0% 0 0)');
run('startBonus();beginBonus();bonusDirection=1;screen("map")');assert.equal(run('bonusDirection'),0);assert.equal(run('bonusPlaying'),false);assert.ok(cancelled>0);
run('startBonus();beginBonus()');assert.equal(run('bonusCaught'),0);assert.equal(run('bonusX'),50);assert.equal(nodes['bonus-finished'].hidden,true);
events.keydown({key:'ArrowLeft',preventDefault(){}});step(10);assert.ok(run('bonusX')<50);events.keyup({key:'ArrowLeft'});const x=run('bonusX');step(10);assert.equal(run('bonusX'),x,'Key release must stop movement');
events.blur();assert.equal(run('bonusPaused'),true);assert.equal(spoke,0,'Speech must remain opt-in');nodes['bonus-read'].onclick();assert.equal(spoke,1);
console.log('PASS: bonus gate, automatic first catch, guided second star, misses, pause, 10-star finish, replay, scene exit, keyboard release and opt-in speech');
