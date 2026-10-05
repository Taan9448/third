// Original pixel artwork. Logical pixel coordinates keep sprites crisp at any size.
const palettes=[['#111c1a','#26352d','#344337','#627059','#a5b99a'],['#181724','#302637','#484052','#83717b','#c6b9c9'],['#251b1d','#3d2c2d','#574038','#967567','#c9ac87'],['#191521','#302138','#513244','#9b627e','#d4b5cd']];
function seeded(seed){return()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};}
function rect(c,color,x,y,w,h){c.fillStyle=color;c.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h));}
function poly(c,color,points){c.fillStyle=color;c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(Math.round(x),Math.round(y)):c.moveTo(Math.round(x),Math.round(y)));c.closePath();c.fill();}
export function background(chapter=0){
 const canvas=document.createElement('canvas');canvas.width=480;canvas.height=200;const c=canvas.getContext('2d'),p=palettes[chapter],rnd=seeded(72+chapter);
 rect(c,p[0],0,0,480,200);
 const glow=c.createRadialGradient(285,53,8,285,60,220);glow.addColorStop(0,p[3]);glow.addColorStop(1,p[0]);c.fillStyle=glow;c.fillRect(0,0,480,200);
 // Distant moon and thin horizontal clouds.
 rect(c,p[4],274,22,23,25);rect(c,p[4],270,26,31,17);rect(c,p[3],279,26,4,3);rect(c,p[3],292,37,6,4);
 for(let i=0;i<36;i++){rect(c,p[2],rnd()*480,20+rnd()*60,20+rnd()*45,1+rnd()*3);}
 for(let layer=0;layer<3;layer++){const base=115+layer*19;for(let x=-30;x<500;x+=40){poly(c,p[Math.min(2,layer)],[[x-25,base],[x+20,50+layer*20+rnd()*35],[x+65,base]]);}}
 // A forgotten gate at the end of the path.
 rect(c,p[2],250,76,75,64);rect(c,p[1],263,91,50,50);poly(c,p[1],[[263,95],[288,77],[313,95]]);rect(c,p[3],246,73,82,4);rect(c,p[3],254,83,5,54);rect(c,p[3],315,83,5,54);
 for(let i=0;i<5;i++){rect(c,p[3],244-i*7,141+i*4,88+i*14,2);}
 // Forest silhouettes, roots and stepped canopy.
 if(chapter===0)for(let layer=0;layer<2;layer++){for(let i=0;i<9;i++){const x=i*63-25+rnd()*20;const color=layer===0?p[1]:p[0];let width=layer===0?7:12;if(x>210&&x<340)continue;rect(c,color,x,0,width,165);poly(c,color,[[x,100],[x-18,169],[x+width+18,169],[x+width,100]]);poly(c,color,[[x+2,45],[x-34,16],[x-36,12],[x+2,32]]);poly(c,color,[[x+4,60],[x+39,25],[x+45,25],[x+6,75]]);for(let j=0;j<12;j++)rect(c,color,x-35+rnd()*78,-10+rnd()*50,20+rnd()*28,4+rnd()*14);rect(c,p[2],x+2,30,1,90);}}

 if(chapter===1){
  for(const x of [20,112,355,432]){rect(c,p[1],x,20,25,140);rect(c,p[2],x+4,28,17,120);rect(c,p[3],x+4,28,2,120);for(let y=36;y<145;y+=14){rect(c,p[0],x+4,y,17,2);}rect(c,p[2],x-4,17,33,6);poly(c,p[1],[[x-3,17],[x+12,0],[x+28,17]]);rect(c,p[0],x+8,47,9,21);rect(c,'#b77b7150',x+10,50,5,16);}
  rect(c,p[1],140,50,63,107);poly(c,p[2],[[134,50],[170,28],[210,50]]);rect(c,p[0],154,83,31,72);rect(c,p[3],151,80,37,4);rect(c,p[2],154,85,3,72);rect(c,p[2],185,85,3,72);
  for(let y=20;y<120;y+=22)rect(c,p[1],0,y,480,1);
 }else if(chapter===2){
  for(const x of [12,34,72,399,436,463]){rect(c,p[1],x,0,4,165);rect(c,p[2],x,0,1,165);for(let y=15;y<150;y+=19){rect(c,p[3],x,y,4,1);poly(c,p[1],[[x,y],[x-15,y-8],[x-20,y-8],[x-6,y-1]]);poly(c,p[1],[[x,y+5],[x+14,y-7],[x+19,y-8],[x+5,y+6]]);}}
  rect(c,p[1],115,75,84,65);rect(c,p[2],120,86,74,51);poly(c,p[1],[[102,79],[118,73],[155,55],[191,73],[209,79]]);poly(c,p[3],[[102,79],[118,76],[155,61],[191,76],[209,79],[195,83],[118,83]]);rect(c,p[0],134,99,44,41);rect(c,p[3],140,99,2,40);rect(c,p[3],170,99,2,40);for(const x of [123,184]){rect(c,'#b98458',x,87,8,12);rect(c,'#e2b87b',x+2,88,4,10);rect(c,p[0],x+3,98,2,6);}
 }else if(chapter===3){
  poly(c,'#ae729b',[[297,0],[275,31],[287,50],[259,75],[278,91],[260,133],[281,140],[272,94],[266,77],[297,48],[282,32],[307,0]]);
  poly(c,'#e2bdd7',[[296,0],[279,31],[291,50],[263,77],[281,90],[263,133],[269,96],[269,78],[295,51],[284,31],[301,0]]);
  for(let i=0;i<13;i++){const x=rnd()*480,y=20+rnd()*110;poly(c,p[1],[[x,y],[x+10,y-4],[x+27,y+2],[x+14,y+12]]);rect(c,p[3],x+7,y,12,1);}
  for(const x of [15,74,381,446]){poly(c,p[1],[[x,160],[x+6,76],[x+12,65],[x+23,110],[x+28,163]]);rect(c,p[2],x+11,84,2,61);}
 }
 rect(c,p[1],0,154,480,46);poly(c,p[2],[[260,136],[310,139],[405,200],[40,200]]);
 for(let i=0;i<200;i++){const x=rnd()*480,y=155+rnd()*45;rect(c,i%4===0?p[3]:p[0],x,y,2+rnd()*7,1);}
 // Broken architecture and foreground undergrowth.
 for(const x of [33,432]){rect(c,p[1],x,113,15,46);rect(c,p[2],x+3,116,9,38);rect(c,p[3],x+3,116,2,38);rect(c,p[2],x-4,110,22,4);rect(c,p[2],x-5,155,25,4);for(let y=122;y<155;y+=8)rect(c,p[1],x+3,y,9,1);}
 for(let i=0;i<100;i++){const x=rnd()*480,y=177+rnd()*23;poly(c,p[0],[[x,y+15],[x-3,y-5],[x+1,y+6],[x+5,y-2],[x+3,y+15]]);}
 for(let i=0;i<42;i++)rect(c,p[2],rnd()*480,rnd()*152,2,2);
 return canvas;
}
export function heroSprite(id){
 const cv=document.createElement('canvas');cv.width=40;cv.height=58;const c=cv.getContext('2d');
 const hair=id==='seol'?'#22252c':id==='lyra'?'#d5bfdc':'#d5ad69';const cloth=id==='seol'?'#638f85':id==='lyra'?'#7b628e':'#b39e73';const bright=id==='seol'?'#b7d5ba':id==='lyra'?'#c7a6df':'#f0d5a1';const dark='#252735',skin='#e7bea3';
 // Long hair, face, a deliberately feminine silhouette and layered costume.
 rect(c,dark,13,5,15,17);rect(c,hair,12,7,17,20);rect(c,hair,10,16,6,24);rect(c,hair,25,15,7,29);rect(c,skin,16,13,11,10);rect(c,'#b88777',16,21,10,2);rect(c,dark,18,16,2,2);rect(c,dark,25,16,2,2);rect(c,hair,14,8,16,7);rect(c,hair,14,13,5,5);rect(c,bright,27,11,3,3);rect(c,dark,14,24,15,20);poly(c,cloth,[[16,24],[26,24],[29,39],[33,48],[10,48],[14,36]]);rect(c,bright,19,25,3,18);rect(c,dark,13,35,16,3);rect(c,bright,13,35,16,1);rect(c,bright,11,44,20,2);rect(c,dark,14,47,5,9);rect(c,dark,24,47,5,9);rect(c,'#807b73',14,52,5,2);rect(c,'#807b73',24,52,5,2);poly(c,cloth,[[14,25],[8,27],[5,39],[12,40],[17,30]]);rect(c,bright,5,37,7,2);rect(c,skin,7,39,4,3);poly(c,cloth,[[26,25],[31,27],[33,36],[28,39],[25,29]]);rect(c,skin,29,36,4,4);
 if(id==='seol'){rect(c,'#c6b49a',30,35,8,2);rect(c,'#e1e3d6',34,15,2,24);rect(c,'#8db5b2',33,18,1,17);rect(c,'#d8bc78',33,34,4,2);rect(c,'#aa534e',13,33,2,20);rect(c,'#df9692',12,45,2,8);}
 if(id==='lyra'){rect(c,'#665540',34,17,2,37);rect(c,'#dec58e',31,14,8,3);rect(c,'#baa6e2',33,8,4,8);rect(c,'#e9d9ff',34,10,2,4);poly(c,'#78618c',[[12,11],[18,0],[26,9],[32,11]]);rect(c,'#bca0ce',10,10,22,2);rect(c,'#f0d398',19,28,3,3);}
 if(id==='aria'){rect(c,'#d4cfb5',11,25,7,4);rect(c,'#d4cfb5',25,25,7,4);poly(c,'#ded9bb',[[29,30],[39,31],[38,44],[33,49],[28,43]]);poly(c,'#8e937f',[[31,33],[37,34],[36,42],[33,46],[30,41]]);rect(c,'#e2c684',33,34,1,9);rect(c,'#e2c684',30,37,7,1);rect(c,'#d4cfb5',5,21,2,19);rect(c,'#cfb57e',3,37,6,2);}
 return cv;
}
function enemySprite(kind,chapter){
 const cv=document.createElement('canvas');cv.width=90;cv.height=82;const c=cv.getContext('2d'),violet=chapter>=2?'#76566f':'#60677e',light=chapter>=2?'#ba8193':'#9996b1',dark='#222330';
 if(kind==='wolf'){
 poly(c,dark,[[4,57],[14,45],[22,37],[44,33],[63,41],[73,25],[80,28],[83,40],[88,48],[82,56],[68,56],[61,65],[22,65]]);
 poly(c,violet,[[9,54],[23,39],[44,38],[59,45],[71,30],[77,31],[77,43],[85,48],[78,52],[65,51],[57,61],[24,60]]);
 poly(c,light,[[20,45],[39,40],[53,45],[61,49],[54,52],[35,47]]);poly(c,dark,[[65,41],[67,19],[75,34]]);poly(c,light,[[67,36],[68,25],[72,34]]);
 poly(c,dark,[[8,54],[2,45],[0,50],[4,59],[19,60]]);rect(c,violet,22,57,7,16);rect(c,dark,22,70,11,4);rect(c,violet,52,58,6,15);rect(c,dark,51,71,11,3);rect(c,violet,64,54,6,12);rect(c,dark,63,65,10,4);rect(c,'#ddabbb',77,44,3,2);rect(c,'#f3d3cc',81,51,3,2);rect(c,dark,35,51,3,4);rect(c,light,23,42,4,3);
 }else if(kind==='wisp'){
 poly(c,dark,[[30,67],[24,51],[26,36],[40,23],[42,7],[50,24],[65,30],[72,44],[61,61],[50,69]]);poly(c,'#658b89',[[34,64],[30,49],[34,35],[44,29],[47,16],[52,31],[63,36],[66,46],[56,60],[45,64]]);poly(c,'#afd0b7',[[40,52],[36,44],[43,36],[51,35],[58,43],[51,54]]);rect(c,'#e1eee1',42,40,4,3);rect(c,'#e1eee1',52,40,4,3);rect(c,'#335751',43,46,10,2);rect(c,'#8aa893',20,39,3,3);rect(c,'#8aa893',67,23,3,3);
 }else if(kind==='knight'){
 rect(c,dark,30,18,23,20);rect(c,violet,32,21,19,15);rect(c,light,32,23,18,3);rect(c,dark,32,29,16,5);rect(c,'#dc8a92',34,30,4,2);rect(c,'#dc8a92',44,30,4,2);rect(c,dark,28,36,31,28);rect(c,violet,31,37,25,22);rect(c,light,31,37,25,5);rect(c,light,41,39,4,17);rect(c,dark,32,59,8,18);rect(c,dark,47,59,8,18);rect(c,violet,32,63,7,10);rect(c,violet,47,63,7,10);rect(c,violet,20,38,9,25);rect(c,violet,59,38,9,22);rect(c,'#ccc4aa',70,20,3,47);rect(c,'#b3837c',66,51,11,3);
 }else{
 // Crowned sorceress / towering demon: silhouette varies by boss kind.
 poly(c,dark,[[20,76],[28,37],[33,25],[29,13],[37,18],[41,6],[48,18],[57,12],[54,29],[63,38],[73,76]]);poly(c,violet,[[26,73],[34,40],[40,32],[52,32],[61,48],[67,73]]);rect(c,light,37,21,17,11);rect(c,dark,39,25,4,2);rect(c,dark,48,25,4,2);rect(c,'#ceb892',35,17,20,4);rect(c,'#ceb892',35,11,3,8);rect(c,'#ceb892',44,7,3,12);rect(c,'#ceb892',53,11,3,8);rect(c,'#d4af92',43,34,5,20);poly(c,light,[[31,39],[16,31],[12,33],[27,52]]);poly(c,light,[[58,39],[74,31],[78,34],[62,53]]);rect(c,'#bdbca4',45,58,2,15);rect(c,light,28,70,37,3);
 if(kind==='demon'){poly(c,'#553a54',[[31,33],[8,18],[1,35],[16,31],[26,56]]);poly(c,'#553a54',[[59,33],[81,18],[89,35],[75,31],[66,56]]);rect(c,'#ef9688',40,25,3,2);rect(c,'#ef9688',48,25,3,2);}
 else{poly(c,'#608176',[[15,75],[8,45],[12,30],[14,48],[23,56]]);poly(c,'#608176',[[73,74],[84,48],[79,29],[78,47],[68,57]]);}
 }
 return cv;
}
export class Scene {
 constructor(canvas,chapter,party,enemies){this.canvas=canvas;this.ctx=canvas.getContext('2d');this.chapter=chapter;this.party=party;this.enemies=enemies;this.bg=background(chapter);this.heroes=Object.fromEntries(['seol','lyra','aria'].map(id=>[id,heroSprite(id)]));this.foes=enemies.map(e=>enemySprite(e.kind,chapter));this.effects=[];this.alive=true;this.reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;this.frame=this.frame.bind(this);this.raf=requestAnimationFrame(this.frame);}
 stop(){this.alive=false;cancelAnimationFrame(this.raf);}
 burst(effect){this.effects.push({...effect,at:performance.now()});}
 frame(now){if(!this.alive)return;const c=this.ctx,w=960,h=400;this.canvas.width!==w&&(this.canvas.width=w);this.canvas.height!==h&&(this.canvas.height=h);c.imageSmoothingEnabled=false;c.clearRect(0,0,w,h);c.drawImage(this.bg,0,0,w,h);
 const active=this.effects.filter(e=>now-e.at<750);this.effects=active;
 if(!this.reduced){for(let i=0;i<20;i++){const x=(i*137+now*.008)%w,y=40+(i*51)%270+Math.sin(now*.001+i)*10;c.globalAlpha=.15+.2*(1+Math.sin(now*.002+i));rect(c,'#d8d99e',x,y,2,2);}c.globalAlpha=1;}
 const xs=[155,285,407];this.party.forEach((hero,i)=>{const attack=active.find(e=>e.owner===hero.id&&e.type==='attack');const dx=attack&&!this.reduced?Math.sin((now-attack.at)/750*Math.PI)*28:0;const hit=active.find(e=>e.type==='enemy'&&e.target===hero.id);c.globalAlpha=hero.hp>0?1:.24;rect(c,'#15211b',xs[i]-29,309,59,7);const bob=this.reduced?0:Math.round(Math.sin(now*.003+i)*1.5);c.drawImage(this.heroes[hero.id],xs[i]-40+dx,195+bob,80,116);if(hero.block>0){c.strokeStyle='#9ecfc380';c.lineWidth=2;c.beginPath();c.ellipse(xs[i],255,42,60,0,0,Math.PI*2);c.stroke();}if(hit&&now-hit.at<180){c.fillStyle='#ffbd9460';c.fillRect(xs[i]-30,215,60,85);}c.globalAlpha=1;});
 this.enemies.forEach((enemy,i)=>{if(enemy.hp<=0){c.globalAlpha=.14;}const x=this.enemies.length===1?735:650+i*175;const hit=active.find(e=>e.type==='attack'&&e.target===enemy.uid),dt=hit?now-hit.at:0,shake=hit&&!this.reduced?Math.sin(dt*.08)*Math.max(0,1-dt/600)*6:0,bob=enemy.kind==='wisp'&&!this.reduced?Math.sin(now*.002)*7:0;rect(c,'#15211b',x-46,309,92,7);const scale=['queen','demon'].includes(enemy.kind)?2:1.7;c.drawImage(this.foes[i],x-45*scale+shake,311-82*scale+bob,90*scale,82*scale);if(hit&&dt<150){c.globalCompositeOperation='screen';c.globalAlpha=.7;c.drawImage(this.foes[i],x-45*scale+shake,311-82*scale+bob,90*scale,82*scale);c.globalCompositeOperation='source-over';}c.globalAlpha=1;});
 active.forEach(e=>this.paintEffect(e,now));this.raf=requestAnimationFrame(this.frame);
 }
 paintEffect(e,now){const c=this.ctx,t=(now-e.at)/750,enemyX=this.enemies.length===1?735:650+(e.target||0)*175,x=e.type==='enemy'?({seol:155,lyra:285,aria:407}[e.target]):enemyX,y=250;c.save();c.globalAlpha=Math.max(0,1-t);
 if(e.type==='attack'){
 const color=e.owner==='lyra'?'#d6b2ff':e.owner==='aria'?'#ffe2a4':'#baf4dc';c.strokeStyle=color;c.lineWidth=e.combo?10:5;c.shadowColor=color;c.shadowBlur=18;
 if(e.owner==='lyra'){for(let i=0;i<5;i++){const a=i*Math.PI*2/5+t*2;c.beginPath();c.moveTo(x+Math.cos(a)*90*(1-t),y+Math.sin(a)*90*(1-t));c.lineTo(x,y);c.stroke();}}
 else{c.beginPath();c.moveTo(x-65+t*60,y+70-t*40);c.lineTo(x+65-t*30,y-70+t*25);c.stroke();c.lineWidth=2;c.beginPath();c.arc(x,y,40+t*45,-1.7,.8);c.stroke();}
 for(let i=0;i<18;i++){const a=i*2.399;rect(c,color,x+Math.cos(a)*t*105,y+Math.sin(a)*t*70,3+(i%3),3);}
 }else if(e.type==='enemy'){c.strokeStyle='#e5a591';c.lineWidth=4;c.beginPath();c.moveTo(x-22+t*20,y-25);c.lineTo(x+25-t*10,y+28);c.stroke();for(let i=0;i<8;i++){const a=i*2.399;rect(c,e.amount?'#e5a591':'#b8d5cf',x+Math.cos(a)*t*65,y+Math.sin(a)*t*65,3,3);}}else if(e.type==='resonate'||e.type==='combo'){c.strokeStyle=e.type==='combo'?'#eed298':'#c9a8fa';c.lineWidth=3;c.beginPath();c.ellipse(485,240,150+t*270,30+t*90,0,0,Math.PI*2);c.stroke();}
 if(['attack','enemy'].includes(e.type)){c.shadowBlur=8;c.shadowColor='#000';c.fillStyle=e.type==='enemy'?'#efa98e':e.combo?'#f3db94':'#fff4dc';c.font=`bold ${e.combo?38:30}px Georgia`;c.textAlign='center';c.fillText(e.amount===0?'방어':e.amount,x,y-60-t*50);}
 c.restore();
 }
}
export function portrait(canvas,id){const c=canvas.getContext('2d');canvas.width=64;canvas.height=64;c.imageSmoothingEnabled=false;rect(c,'#25312c',0,0,64,64);const sprite=heroSprite(id);c.drawImage(sprite,8,1,64,93);}
export function cardArt(canvas,icon,owner){canvas.width=160;canvas.height=84;const c=canvas.getContext('2d');const color=owner==='seol'?'#aad3bd':owner==='lyra'?'#c4a8df':'#e1c18a',base=owner==='seol'?'#233c33':owner==='lyra'?'#352a43':'#403727';rect(c,base,0,0,160,84);const rnd=seeded(icon.length*39);for(let i=0;i<70;i++)rect(c,'#ffffff08',rnd()*160,rnd()*84,2,2);for(let i=0;i<8;i++)rect(c,color+'20',8+i*20,70-i%3*6,16,1);
 c.save();c.translate(80,41);c.strokeStyle=color;c.fillStyle=color;c.lineWidth=2;
 if(icon==='sword'||icon==='hammer'){c.rotate(.6);rect(c,color,-3,-31,6,45);rect(c,'#edf0d7',-1,-28,2,39);rect(c,'#b6945f',-12,14,24,3);rect(c,'#9b6857',-2,17,4,12);}
 else if(icon==='shield'){poly(c,color,[[-20,-24],[20,-24],[17,12],[0,28],[-17,12]]);poly(c,base,[[-15,-19],[15,-19],[12,9],[0,22],[-12,9]]);rect(c,color,-1,-13,2,28);rect(c,color,-10,-5,20,2);}
 else if(icon==='moon'){c.beginPath();c.arc(0,0,24,0,Math.PI*2);c.fill();c.fillStyle=base;c.beginPath();c.arc(10,-6,22,0,Math.PI*2);c.fill();rect(c,'#ecdcb8',15,8,4,4);rect(c,color,-26,-25,2,2);}
 else if(icon==='star'||icon==='sun'){poly(c,color,[[0,-30],[7,-8],[27,0],[7,8],[0,30],[-7,8],[-27,0],[-7,-8]]);poly(c,'#f0e6d1',[[0,-12],[4,-4],[12,0],[4,4],[0,12],[-4,4],[-12,0],[-4,-4]]);}
 else if(icon==='bond'){for(const x of [-12,12]){c.beginPath();c.ellipse(x,0,17,23,x<0?-.5:.5,0,Math.PI*2);c.stroke();}rect(c,'#ecdbb4',-3,-3,6,6);}
 else if(icon==='lotus'){for(let i=0;i<5;i++){c.save();c.rotate((i-2)*.4);poly(c,color,[[0,20],[-9,-6],[0,-24],[9,-6]]);c.restore();}}
 else if(icon==='rune'){c.strokeRect(-18,-18,36,36);c.rotate(.8);c.strokeRect(-14,-14,28,28);}
 else {for(let i=0;i<3;i++){c.beginPath();c.moveTo(-27,-13+i*14);c.bezierCurveTo(-4,-35+i*14,4,9+i*14,27,-13+i*14);c.stroke();}}
 c.restore();rect(c,color+'55',0,83,160,1);
}
export class AudioFX {
 constructor(){this.enabled=true;this.ctx=null;}
 play(type='attack'){if(!this.enabled)return;try{const C=window.AudioContext||window.webkitAudioContext;this.ctx??=new C();this.ctx.resume();const ctx=this.ctx,t=ctx.currentTime;const osc=ctx.createOscillator(),gain=ctx.createGain();osc.type=type==='attack'?'sawtooth':'sine';osc.frequency.setValueAtTime(type==='attack'?330:type==='enemy'?140:520,t);osc.frequency.exponentialRampToValueAtTime(type==='attack'?70:260,t+.16);gain.gain.setValueAtTime(.055,t);gain.gain.exponentialRampToValueAtTime(.001,t+.22);osc.connect(gain);gain.connect(ctx.destination);osc.start(t);osc.stop(t+.23);if(type==='combo'){for(let i=0;i<3;i++){const o=ctx.createOscillator(),g=ctx.createGain();o.frequency.value=[523,659,784][i];g.gain.setValueAtTime(.035,t+i*.06);g.gain.exponentialRampToValueAtTime(.001,t+.7);o.connect(g);g.connect(ctx.destination);o.start(t+i*.06);o.stop(t+.7);}}}catch{/* Sound is optional. */}}
}
