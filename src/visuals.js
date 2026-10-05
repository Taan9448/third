import {background as fallbackBackground,heroSprite as fallbackHero,portrait as fallbackPortrait,cardArt as fallbackCard} from './art.js';
import {attackFrame} from './animation.js';
import {setSkillAtlases} from './effects.js';
import {setEffectAtlas} from './effects.js';
const urls={heroAttacks:new URL('../assets/hero-attacks.webp',import.meta.url),enemyAttacks:new URL('../assets/enemy-attacks.webp',import.meta.url),skillA:new URL('../assets/skill-frames-a.webp',import.meta.url),skillB:new URL('../assets/skill-frames-b.webp',import.meta.url),effects:new URL('../assets/effects.webp',import.meta.url),heroes:new URL('../assets/heroes.webp',import.meta.url),worlds:new URL('../assets/worlds.webp',import.meta.url),cards:new URL('../assets/techniques.webp',import.meta.url),enemies:new URL('../assets/enemies.webp',import.meta.url)};
export const images={};
export async function loadAssets(){await Promise.all(Object.entries(urls).map(([key,url])=>new Promise(resolve=>{const im=new Image();im.onload=()=>{images[key]=im;resolve();};im.onerror=()=>resolve();im.src=url.href;})));setEffectAtlas(images.effects);setSkillAtlases(images.skillA,images.skillB);}
const owners=['seol','lyra','aria'];
const cardOrder=['slash','guard','spark','ward','bash','protect','bond','moon','storm','lotus','heal','focus','nova','fortress','flash','frost'];
export const worldPosition=['0% 0%','100% 0%','0% 100%','100% 100%'];
function tile(ctx,image,column,row,columns,rows,x,y,w,h){const tw=image.width/columns,th=image.height/rows;ctx.drawImage(image,column*tw,row*th,tw,th,x,y,w,h);}
export function portrait(canvas,id){if(!images.heroAttacks)return fallbackPortrait(canvas,id);canvas.width=100;canvas.height=100;const c=canvas.getContext('2d'),index=owners.indexOf(id);c.imageSmoothingEnabled=false;const tw=images.heroAttacks.width/6,th=images.heroAttacks.height/3;c.drawImage(images.heroAttacks,0,index*th,tw,th,0,0,100,100);}
export function cardArt(canvas,icon,owner,id){if(!images.cards)return fallbackCard(canvas,icon,owner);canvas.width=320;canvas.height=320;const c=canvas.getContext('2d'),index=Math.max(0,cardOrder.indexOf(id));c.imageSmoothingEnabled=false;tile(c,images.cards,index%4,Math.floor(index/4),4,4,0,0,320,320);}
export class Scene{
 constructor(canvas,chapter,party,enemies,selected=0){
  this.canvas=canvas;this.ctx=canvas.getContext('2d');this.chapter=chapter;this.party=party;this.enemies=enemies;this.selected=selected;this.effects=[];this.reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;this.alive=true;this.action=null;
  this.frame=this.frame.bind(this);const r=canvas.getBoundingClientRect();this.canvas.width=1440;this.canvas.height=Math.round(1440*r.height/r.width);this.bg=images.worlds?null:fallbackBackground(chapter);this.frame(performance.now());
 }
 stop(){this.alive=false;cancelAnimationFrame(this.raf);}
 burst(effect){this.effects.push({...effect,at:performance.now()+(effect.delay||0)});}
 perform(card){this.action={card,at:performance.now()};}
 baseline(){const r=this.canvas.getBoundingClientRect();return innerWidth<=700?.8:r.height<940?.46:.52;}
 targetPoint(uid){const r=this.canvas.getBoundingClientRect(),e=this.enemies.find(x=>x.uid===uid),i=this.enemies.indexOf(e);return{x:r.left+r.width*(this.enemies.length===1?.70:.65+i*.19),y:r.top+r.height*(this.baseline()-.12)};}
 heroPosition(i){return this.party.length===1?.25:this.party.length===2?[.20,.38][i]:[.12,.275,.425][i];}
 heroPoint(id){const r=this.canvas.getBoundingClientRect();return{x:r.left+r.width*this.heroPosition(this.party.findIndex(h=>h.id===id)),y:r.top+r.height*(this.baseline()-.15)};}
 frame(now){
  if(!this.alive)return;const c=this.ctx,w=this.canvas.width,h=this.canvas.height,r=this.canvas.getBoundingClientRect(),ratio=w/r.width,base=h*this.baseline(),stageH=base/.86;
  c.clearRect(0,0,w,h);c.imageSmoothingEnabled=false;
  if(images.worlds){tile(c,images.worlds,this.chapter%2,Math.floor(this.chapter/2),2,2,0,0,w,h);tile(c,images.worlds,this.chapter%2,Math.floor(this.chapter/2),2,2,0,0,w,stageH);}else c.drawImage(this.bg,0,0,w,h);
  const shade=c.createLinearGradient(0,0,0,h);shade.addColorStop(0,'#080e2460');shade.addColorStop(.3,'#090e2200');shade.addColorStop(.63,'#060b1720');shade.addColorStop(1,'#060816e8');c.fillStyle=shade;c.fillRect(0,0,w,h);
  this.effects=this.effects.filter(e=>now-e.at<1100);const active=this.effects.filter(e=>now>=e.at);
  if(!this.reduced){for(let i=0;i<32;i++){const x=(i*179+now*.012)%w,y=30+(i*53)%Math.max(1,stageH-30)+Math.sin(now*.001+i)*9;c.globalAlpha=.25+.2*Math.sin(now*.002+i);c.fillStyle=this.chapter===3?'#efb6ff':'#b6e6d8';c.fillRect(x,y,2,2);}c.globalAlpha=1;}
  const action=this.action&&now-this.action.at<1600?this.action:null;
  this.party.forEach((hero,i)=>{
   const x=w*this.heroPosition(i),hit=active.find(e=>e.type==='enemy'&&e.target===hero.id),attacking=action?.card.owner===hero.id;
   const at=attacking?now-action.at:0,move=attacking&&action.card.damage&&!this.reduced?Math.sin(Math.min(1,at/1100)*Math.PI)*(action.card.family==='wuxia'?90:30)*ratio:0;
   const bob=this.reduced?0:Math.round(Math.sin(now*.002+i)*1.5)*ratio,hh=Math.min(250,r.height*(innerWidth<=700?.35:.28))*ratio,ww=hh;
   c.save();c.globalAlpha=hero.hp>0?1:.18;this.shadow(x,base+5,ww*.40);const af=attacking?attackFrame(at):0;if(attacking||!action)this.canvas.dataset.heroAttackFrame=String(af);if(images.heroAttacks)tile(c,images.heroAttacks,af,owners.indexOf(hero.id),6,3,x-ww/2+move,base-hh+bob,ww,hh);else if(images.heroes)tile(c,images.heroes,i,0,3,1,x-ww/2+move,base-hh+bob,ww,hh);else c.drawImage(fallbackHero(hero.id),x-60,base-174,120,174);
   if(attacking&&!this.reduced&&at>320&&at<950){c.globalAlpha=.13;if(images.heroAttacks)tile(c,images.heroAttacks,af,owners.indexOf(hero.id),6,3,x-ww/2+move-18*ratio,base-hh+bob,ww,hh);c.globalAlpha=1;}
   if(hero.block>0){c.strokeStyle='#c7f9deaa';c.lineWidth=3*ratio;c.beginPath();c.ellipse(x,base-hh*.42,ww*.64,hh*.52,0,0,Math.PI*2);c.stroke();}
   if(hit&&now-hit.at<130){c.fillStyle='#ffd6b046';c.fillRect(x-ww/2,base-hh,ww,hh);}c.restore();
  });
  this.enemies.forEach((e,i)=>{
   const x=w*(this.enemies.length===1?.70:.65+i*.19),isBoss=['queen','demon'].includes(e.kind),cssHeight=isBoss?Math.min(380,r.height*.40):e.kind==='wolf'?Math.min(270,r.height*.30):Math.min(340,r.height*.38),hh=cssHeight*ratio,ww=hh*(e.kind==='wolf'?1.23:isBoss?.76:.81);
   const hit=active.find(f=>f.type==='attack'&&f.target===e.uid),dt=hit?now-hit.at:0,attack=active.find(f=>f.type==='enemy'&&f.source===e.uid),jump=attack&&!this.reduced?-Math.sin(Math.min(1,(now-attack.at)/500)*Math.PI)*45*ratio:0,dx=hit&&!this.reduced?Math.sin(dt*.10)*(1-dt/1100)*12*ratio:0,bob=e.kind==='wisp'&&!this.reduced?Math.sin(now*.002)*5*ratio:0;
   c.save();c.globalAlpha=e.hp>0?1:hit?Math.max(.02,.75-dt/600):.02;this.shadow(x,base+5,ww*.4);
   if(e.hp>0&&this.selected===e.uid){c.strokeStyle='#ffe6aa';c.lineWidth=2*ratio;c.setLineDash([12*ratio,8*ratio]);c.beginPath();c.ellipse(x,base+7,ww*.5,11*ratio,0,0,Math.PI*2);c.stroke();c.setLineDash([]);}
   if(images.enemies){const index=e.id==='master'?4:e.kind==='wolf'?0:e.kind==='wisp'?1:e.kind==='knight'?2:e.kind==='queen'?3:5;const ef=attack?attackFrame(now-attack.at,900):0;if(attack)this.canvas.dataset.enemyAttackFrame=String(ef);if(images.enemyAttacks)tile(c,images.enemyAttacks,ef,index,6,6,x-ww/2+dx+jump,base-hh+bob,ww,hh);else tile(c,images.enemies,index%3,Math.floor(index/3),3,2,x-ww/2+dx+jump,base-hh+bob,ww,hh);if(hit&&dt<90){c.globalCompositeOperation='screen';c.globalAlpha=.65;tile(c,images.enemies,index%3,Math.floor(index/3),3,2,x-ww/2+dx,base-hh+bob,ww,hh);}}
   else{c.fillStyle='#8c769d';c.fillRect(x-65,base-180,130,180);}c.restore();
  });
  active.forEach(e=>this.paint(e,now));this.raf=requestAnimationFrame(this.frame);
 }
 shadow(x,y,size){const c=this.ctx;c.fillStyle='#07101ba8';c.beginPath();c.ellipse(x,y,size,10,0,0,Math.PI*2);c.fill();}
 paint(e,now){
  const c=this.ctx,t=(now-e.at)/1100,r=this.canvas.getBoundingClientRect(),scale=this.canvas.width/r.width;
  if(!['attack','enemy','block','heal'].includes(e.type))return;
  const points=e.type==='enemy'?[this.heroPoint(e.target)]:e.type==='attack'?[this.targetPoint(e.target)]:this.party.filter(h=>h.hp>0).map(h=>this.heroPoint(h.id));
  points.forEach(p=>{const x=(p.x-r.left)*scale,y=(p.y-r.top)*scale;c.save();c.globalAlpha=1-t;c.font=`bold ${(e.combo?40:30)*scale}px Galmuri`;c.textAlign='center';c.lineWidth=5*scale;c.strokeStyle='#080d23';const label=e.amount===0?'방어':(e.type==='heal'?'+':e.type==='block'?'⛨ ':'')+e.amount;c.strokeText(label,x,y-35*scale-t*55*scale);c.fillStyle=e.type==='enemy'?'#ffb8a1':e.type==='heal'?'#a3ffd0':e.combo?'#ffe6a0':'#fff4dc';c.fillText(label,x,y-35*scale-t*55*scale);
   if(e.type==='enemy'&&t<.38){c.strokeStyle='#ff9c80';c.lineWidth=6*scale;for(let j=0;j<3;j++){c.beginPath();c.moveTo(x-55*scale+j*20*scale,y-55*scale);c.lineTo(x+55*scale+j*20*scale,y+40*scale);c.stroke();}}c.restore();});
 }
}
