import {background as fallbackBackground,heroSprite as fallbackHero,portrait as fallbackPortrait,cardArt as fallbackCard} from './art.js';
import {decodeSprites,drawSprite,spriteBounds,fitSpriteScale} from './sprites.js';
import {attackFrame} from './animation.js';
import {setImpactAtlas,animatedImpact,animatedSkill,spell,clamp} from './effects.js';
import {setSkillAtlases} from './effects.js';
import {setEffectAtlas} from './effects.js';
const urls={impacts:new URL('../assets/impacts.webp',import.meta.url),heroAttacks:new URL('../assets/hero-attacks.webp',import.meta.url),enemyAttacks:new URL('../assets/enemy-attacks.webp',import.meta.url),skillA:new URL('../assets/skill-frames-a.webp',import.meta.url),skillB:new URL('../assets/skill-frames-b.webp',import.meta.url),effects:new URL('../assets/effects.webp',import.meta.url),heroes:new URL('../assets/heroes.webp',import.meta.url),worlds:new URL('../assets/worlds.webp',import.meta.url),cards:new URL('../assets/techniques.webp',import.meta.url),enemies:new URL('../assets/enemies.webp',import.meta.url)};
export const images={};export const sprites={};
export async function loadAssets(){await Promise.all(Object.entries(urls).map(([key,url])=>new Promise(resolve=>{const im=new Image();im.onload=()=>{images[key]=im;resolve();};im.onerror=()=>resolve();im.src=url.href;})));if(images.heroAttacks)sprites.heroes=decodeSprites(images.heroAttacks,3);if(images.enemyAttacks)sprites.enemies=decodeSprites(images.enemyAttacks,6,{splitQueen:true});setImpactAtlas(images.impacts);setEffectAtlas(images.effects);setSkillAtlases(images.skillA,images.skillB);}
const owners=['seol','lyra','aria'];
const cardOrder=['slash','guard','spark','ward','bash','protect','bond','moon','storm','lotus','heal','focus','nova','fortress','flash','frost'];
export const worldPosition=['0% 0%','100% 0%','0% 100%','100% 100%'];
function tile(ctx,image,column,row,columns,rows,x,y,w,h){const tw=image.width/columns,th=image.height/rows;ctx.drawImage(image,column*tw,row*th,tw,th,x,y,w,h);}
export function portrait(canvas,id){const sprite=sprites.heroes?.[owners.indexOf(id)]?.[0];if(!sprite)return fallbackPortrait(canvas,id);canvas.width=100;canvas.height=100;const c=canvas.getContext('2d');c.imageSmoothingEnabled=false;const scale=90/sprite.h;drawSprite(c,sprite,50,97,scale);}
export function cardArt(canvas,icon,owner,id){if(!images.cards)return fallbackCard(canvas,icon,owner);canvas.width=320;canvas.height=320;const c=canvas.getContext('2d'),index=Math.max(0,cardOrder.indexOf(id));c.imageSmoothingEnabled=false;tile(c,images.cards,index%4,Math.floor(index/4),4,4,0,0,320,320);}
export class Scene{
 constructor(canvas,chapter,party,enemies,selected=0){
  this.canvas=canvas;this.ctx=canvas.getContext('2d');this.chapter=chapter;this.party=party;this.enemies=enemies;this.selected=selected;this.activeHero=party[0]?.id;this.effects=[];this.reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;this.alive=true;this.action=null;
  this.frame=this.frame.bind(this);const r=canvas.getBoundingClientRect();this.canvas.width=1440;this.canvas.height=Math.round(1440*r.height/r.width);this.bg=images.worlds?null:fallbackBackground(chapter);this.frame(performance.now());
 }
 stop(){this.alive=false;cancelAnimationFrame(this.raf);}
 burst(effect){this.effects.push({...effect,at:performance.now()+(effect.delay||0)});}
 perform(card){this.activeHero=card.owner;this.action={card,at:performance.now()};}
 focusHero(id){this.activeHero=id;}
 baseline(){const r=this.canvas.getBoundingClientRect(),dock=this.canvas.parentElement.querySelector('.combat-dock')?.getBoundingClientRect();return Math.max(.25,Math.min(innerWidth<=700?.70:.48,dock?(dock.top-r.top-(innerWidth<=700?92:108))/r.height:.42));}
 targetPoint(uid){const r=this.canvas.getBoundingClientRect(),e=this.enemies.find(x=>x.uid===uid),i=this.enemies.indexOf(e);return{x:r.left+r.width*(this.enemies.length===1?.70:.65+i*.19),y:r.top+r.height*(this.baseline()-.12)};}
 heroPosition(i){return this.party.length===1?.25:this.party.length===2?[.20,.38][i]:[.12,.275,.425][i];}
 heroPoint(id){const r=this.canvas.getBoundingClientRect();return{x:r.left+r.width*this.heroPosition(this.party.findIndex(h=>h.id===id)),y:r.top+r.height*(this.baseline()-.15)};}
 frame(now){
  if(!this.alive)return;const c=this.ctx,w=this.canvas.width,h=this.canvas.height,r=this.canvas.getBoundingClientRect(),ratio=w/r.width,base=h*this.baseline(),stageH=base/.86;
  c.clearRect(0,0,w,h);c.imageSmoothingEnabled=false;
  if(images.worlds){tile(c,images.worlds,this.chapter%2,Math.floor(this.chapter/2),2,2,0,0,w,h);tile(c,images.worlds,this.chapter%2,Math.floor(this.chapter/2),2,2,0,0,w,stageH);}else c.drawImage(this.bg,0,0,w,h);
  const shade=c.createLinearGradient(0,0,0,h);shade.addColorStop(0,'#080e2460');shade.addColorStop(.3,'#090e2200');shade.addColorStop(.63,'#060b1720');shade.addColorStop(1,'#060816e8');c.fillStyle=shade;c.fillRect(0,0,w,h);
  this.effects=this.effects.filter(e=>now-e.at<1300);const active=this.effects.filter(e=>now>=e.at);
  if(!this.reduced){for(let i=0;i<32;i++){const x=(i*179+now*.012)%w,y=30+(i*53)%Math.max(1,stageH-30)+Math.sin(now*.001+i)*9;c.globalAlpha=.25+.2*Math.sin(now*.002+i);c.fillStyle=this.chapter===3?'#efb6ff':'#b6e6d8';c.fillRect(x,y,2,2);}c.globalAlpha=1;}
  this.syncPanels();this.targetLines();
  const action=this.action&&now-this.action.at<1600?this.action:null;
  this.party.forEach((hero,i)=>{
   const x=w*this.heroPosition(i),hit=active.find(e=>e.type==='enemy'&&e.target===hero.id),attacking=action?.card.owner===hero.id;
   const at=attacking?now-action.at:0,move=attacking&&action.card.damage&&!this.reduced?Math.sin(Math.min(1,at/1100)*Math.PI)*(action.card.family==='wuxia'?90:30)*ratio:0;
   const bob=this.reduced?0:Math.round(Math.sin(now*.002+i)*1.5)*ratio,hh=Math.min(250,r.height*(innerWidth<=700?.35:.28))*ratio,ww=hh;
   c.save();c.globalAlpha=hero.hp>0?1:.25;this.shadow(x,base+5,hh*.35);const af=attacking?attackFrame(at):0;if(attacking||!action)this.canvas.dataset.heroAttackFrame=String(af);
   const pose=sprites.heroes?.[owners.indexOf(hero.id)]?.[af],scale=pose?fitSpriteScale(sprites.heroes[owners.indexOf(hero.id)],x,Math.min(hh,innerWidth<=700?this.canvas.width*.16/sprites.heroes[owners.indexOf(hero.id)][0].w*sprites.heroes[owners.indexOf(hero.id)][0].h:hh),w,8*ratio,base):1;
   if(pose){drawSprite(c,pose,x+move,base+bob,scale);if(attacking&&!this.reduced&&at>320&&at<950){c.globalAlpha=.15;drawSprite(c,pose,x+move-16*ratio,base+bob,scale);c.globalAlpha=1;}}
   else c.drawImage(fallbackHero(hero.id),x-60,base-174,120,174);
   if(this.activeHero===hero.id&&hero.hp>0)this.selection(x,base,pose?sprites.heroes[owners.indexOf(hero.id)][0].w*scale*.55:hh*.43,'#7effd4');
   if(hero.block>0)this.barrier(x+move,base,pose?pose.h*scale:hh,ratio);
   if(hit&&now-hit.at<130){c.fillStyle='#ffd6b046';c.fillRect(x-ww/2,base-hh,ww,hh);}c.restore();
  });
  this.enemies.forEach((e,i)=>{
   const x=w*(this.enemies.length===1?.70:.65+i*.19),index=e.id==='master'?4:e.kind==='wolf'?0:e.kind==='wisp'?1:e.kind==='knight'?2:e.kind==='queen'?3:5,neutral=sprites.enemies?.[index]?.[0],cssHeight=Math.min([215,255,275,310,300,330][index],r.height*(innerWidth<=700?.40:.36)),hh=cssHeight*ratio,scale=neutral?fitSpriteScale(sprites.enemies[index],x,Math.min(hh,innerWidth<=700?w*(this.enemies.length===1?.30:.16)/neutral.w*neutral.h:hh),w,8*ratio,base):1,ww=neutral?neutral.w*scale:hh;
   const hit=active.find(f=>f.type==='attack'&&f.target===e.uid),dt=hit?now-hit.at:0,attack=active.find(f=>f.type==='enemy'&&f.source===e.uid),jump=attack&&!this.reduced?-Math.sin(Math.min(1,(now-attack.at)/500)*Math.PI)*45*ratio:0,dx=hit&&!this.reduced?Math.sin(dt*.10)*(1-dt/1100)*12*ratio:0,bob=e.kind==='wisp'&&!this.reduced?Math.sin(now*.002)*5*ratio:0;
   c.save();c.globalAlpha=e.hp>0?1:hit?Math.max(.02,.75-dt/600):.02;this.shadow(x,base+5,ww*.4);
   if(e.hp>0&&this.selected===e.uid)this.selection(x,base,Math.min(ww*.48,150*ratio),'#ffda79');
   const ef=attack?attackFrame(now-attack.at,900):0;if(attack)this.canvas.dataset.enemyAttackFrame=String(ef);const pose=sprites.enemies?.[index]?.[ef];
   if(pose){drawSprite(c,pose,x+dx+jump,base+bob,scale);if(hit&&dt<100){c.globalCompositeOperation='screen';c.globalAlpha=.4;drawSprite(c,pose,x+dx,base+bob,scale);}}
   else{c.fillStyle='#8c769d';c.fillRect(x-65,base-180,130,180);}if(e.block>0)this.barrier(x,base,hh,ratio);c.restore();
  });
  active.forEach(e=>this.paint(e,now));this.raf=requestAnimationFrame(this.frame);
 }
 syncPanels(){const r=this.canvas.getBoundingClientRect();this.canvas.parentElement.querySelectorAll('.unit-panel').forEach(el=>{const hero=el.dataset.heroId,index=hero?this.party.findIndex(h=>h.id===hero):this.enemies.findIndex(e=>e.uid===Number(el.dataset.enemyId)),x=hero?this.heroPosition(index):this.enemies.length===1?.70:.65+index*.19;el.style.left=x*100+'%';el.style.top=(r.height*this.baseline()+14)+'px';});}
 targetLines(){if(!this.intents)return;const c=this.ctx,w=this.canvas.width,h=this.canvas.height,base=h*this.baseline();c.save();for(const intent of this.intents){if(['guard','frozen'].includes(intent.type))continue;const i=this.enemies.findIndex(e=>e.uid===intent.uid);if(this.enemies[i]?.hp<=0)continue;const from=w*(this.enemies.length===1?.70:.65+i*.19),targets=intent.type==='sweep'?this.party.map((p,j)=>p.hp>0?j:-1).filter(j=>j>=0):[intent.target];for(const j of targets){if(!this.party[j]||this.party[j].hp<=0)continue;const to=w*this.heroPosition(j),selected=intent.uid===this.selected,y=base-13;c.strokeStyle=selected?'#ff9d82':'#cf88759a';c.lineWidth=selected?4:3;c.setLineDash(selected?[]:[8,8]);c.beginPath();c.moveTo(from,y);c.quadraticCurveTo((from+to)/2,y-38,to,y);c.stroke();c.setLineDash([]);c.fillStyle='#ffb098';c.beginPath();c.moveTo(to,y);c.lineTo(to+13,y-9);c.lineTo(to+13,y+5);c.fill();}}c.restore();}
 selection(x,base,size,color){const c=this.ctx;c.save();c.strokeStyle=color;c.fillStyle=color;c.lineWidth=3;const y=base+4;c.beginPath();c.ellipse(x,y,size,9,0,0,Math.PI*2);c.stroke();for(const side of [-1,1]){c.fillRect(x+side*size-6,y-10,12,3);c.fillRect(x+side*size-6,y-10,3,18);}c.beginPath();c.moveTo(x-8,base-12);c.lineTo(x+8,base-12);c.lineTo(x,base-4);c.fill();c.restore();}
 barrier(x,base,height,ratio){const c=this.ctx;c.save();const y=base-height*.45,sz=height*.37;c.fillStyle='#73deff20';c.strokeStyle='#8ce8ff';c.lineWidth=3*ratio;c.beginPath();c.moveTo(x,y-sz);c.lineTo(x+sz*.7,y-sz*.55);c.lineTo(x+sz*.65,y+sz*.5);c.lineTo(x,y+sz);c.lineTo(x-sz*.65,y+sz*.5);c.lineTo(x-sz*.7,y-sz*.55);c.closePath();c.fill();c.stroke();c.strokeStyle='#dcf9ff';c.lineWidth=2*ratio;for(let i=-1;i<=1;i++){c.beginPath();c.moveTo(x-sz*.4,y+i*sz*.35);c.lineTo(x+sz*.4,y+i*sz*.35);c.stroke();}c.restore();}
 shadow(x,y,size){const c=this.ctx;c.fillStyle='#07101ba8';c.beginPath();c.ellipse(x,y,size,10,0,0,Math.PI*2);c.fill();}
 paint(e,now){
  const c=this.ctx,elapsed=now-e.at,r=this.canvas.getBoundingClientRect(),scale=this.canvas.width/r.width;
  if(!['attack','enemy','block','heal','frozen'].includes(e.type))return;
  const points=e.type==='enemy'?[this.heroPoint(e.target)]:['attack','frozen'].includes(e.type)?[this.targetPoint(e.target)]:this.party.filter(h=>h.hp>0).map(h=>this.heroPoint(h.id));
  const incoming=e.type==='enemy'&&e.source!=null,hitAt=incoming?540:0;
  points.forEach(p=>{const end={x:(p.x-r.left)*scale,y:(p.y-r.top)*scale};
   if(incoming){const source=this.enemies.find(a=>a.uid===e.source),sp=this.targetPoint(e.source),origin={x:(sp.x-r.left)*scale,y:(sp.y-r.top)*scale},card={id:source?.kind==='wisp'?'frost':source?.kind==='wolf'?'flash':['demon','hell'].includes(source?.id)?'storm':'slash',family:'wuxia',damage:1},unit=65*scale;
    if(elapsed>=250&&elapsed<hitAt){const t=(elapsed-250)/(hitAt-250);spell(c,card,origin,[end],t,elapsed,'#ff9c80',unit);animatedSkill(c,card,origin,[end],t,unit);}
    if(elapsed>=hitAt&&elapsed<hitAt+640){const t=(elapsed-hitAt)/640;this.canvas.dataset.enemyImpactFrame=String(Math.min(3,Math.floor(t*4)));animatedImpact(c,card,end,t,unit);}
   }else if(e.status==='burn'&&elapsed<640)animatedImpact(c,{damage:1,status:'burn'},end,elapsed/640,65*scale);
   if(elapsed<hitAt)return;const t=clamp((elapsed-hitAt)/700);c.save();c.globalAlpha=1-t;c.font=`bold ${(e.combo?40:30)*scale}px Galmuri`;c.textAlign='center';c.lineWidth=5*scale;c.strokeStyle='#080d23';const label=e.type==='frozen'?'빙결 · 행동 불가':e.amount===0?'방어':(e.type==='heal'?'+':e.type==='block'?'⛨ ':'')+e.amount;c.strokeText(label,end.x,end.y-35*scale-t*55*scale);c.fillStyle=e.type==='enemy'?'#ffb8a1':e.type==='heal'?'#a3ffd0':e.combo?'#ffe6a0':'#fff4dc';c.fillText(label,end.x,end.y-35*scale-t*55*scale);c.restore();
  });
 }
}
