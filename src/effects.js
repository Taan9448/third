import {skillFrame,TECHNIQUE_ROWS} from './animation.js';
let skillAtlases=[];
export function setSkillAtlases(a,b){skillAtlases=[a,b];}
export function animatedSkill(c,card,origin,targets,progress,unit){const id=({eclipse:'moon',astral:'nova',sanctuary:'fortress'})[card.id]||card.id,index=TECHNIQUE_ROWS.indexOf(id),im=skillAtlases[Math.floor(index/8)];if(!im||index<0)return;const frame=skillFrame(progress),tw=im.width/4,th=im.height/8;const travel=Math.min(1,progress/.50),size=unit*(card.ultimate?3.4:2.5);(card.damage?targets:targets.length?targets:[origin]).forEach(end=>{const x=card.damage?origin.x+(end.x-origin.x)*travel:end.x,y=card.damage?origin.y+(end.y-origin.y)*travel:end.y;c.save();c.imageSmoothingEnabled=false;c.globalAlpha*=progress>.85?Math.max(0,(1-progress)/.15):.85;c.drawImage(im,frame*tw,index%8*th,tw,th,x-size/2,y-size/2,size,size);c.restore();});}
// Procedural pixel spell shapes. Canvas is rendered at half resolution by cast.js.
let atlas=null;
export function setEffectAtlas(image){atlas=image;}
function texture(c,index,x,y,w,h,angle=0,alpha=1){
 if(!atlas)return false;const tw=atlas.width/4,th=atlas.height/2;c.save();c.translate(x,y);c.rotate(angle);c.globalAlpha*=alpha;c.imageSmoothingEnabled=false;c.drawImage(atlas,index%4*tw,Math.floor(index/4)*th,tw,th,-w/2,-h/2,w,h);c.restore();return true;
}
export const clamp=t=>Math.max(0,Math.min(1,t));
export const ease=t=>1-Math.pow(1-clamp(t),3);
export function crescent(c,x,y,size,angle,color,alpha=1){
 if(atlas){const index=color==='#c894ff'?1:0;texture(c,index,x-size*.12,y,size*1.9,size*2.25,angle,alpha);return;}
 c.save();c.translate(x,y);c.rotate(angle);c.globalAlpha*=alpha;
 c.fillStyle=color;c.beginPath();c.moveTo(0,-size);c.quadraticCurveTo(size*1.65,0,0,size);c.quadraticCurveTo(size*.48,0,0,-size);c.fill();
 c.strokeStyle='#efffff';c.lineWidth=Math.max(3,size*.036);c.beginPath();c.moveTo(0,-size*.96);c.quadraticCurveTo(size*1.46,0,0,size*.96);c.stroke();
 c.restore();
}
export function circle(c,x,y,r,t,color){
 if(atlas&&color.includes('c4'))texture(c,7,x,y,r*2.4,r*2.4,t,.55);
 c.save();c.translate(x,y);c.rotate(t);c.strokeStyle=color;c.lineWidth=2;
 for(const radius of [r,r*.83,r*.59]){c.beginPath();c.arc(0,0,radius,0,Math.PI*2);c.stroke();}
 for(let i=0;i<8;i++){c.save();c.rotate(i*Math.PI/4);c.beginPath();c.moveTo(r*.65,-5);c.lineTo(r*.76,-5);c.lineTo(r*.76,-13);c.lineTo(r*.85,0);c.lineTo(r*.76,13);c.lineTo(r*.76,5);c.lineTo(r*.65,5);c.stroke();c.restore();}
 c.beginPath();for(let i=0;i<=6;i++){const a=i*Math.PI/3;c.lineTo(Math.cos(a)*r*.56,Math.sin(a)*r*.56);}c.stroke();c.restore();
}
export function crystal(c,x,y,size,angle,color){
 c.save();c.translate(x,y);c.rotate(angle);c.fillStyle=color;c.beginPath();c.moveTo(0,-size);c.lineTo(size*.23,-size*.2);c.lineTo(0,size*.25);c.lineTo(-size*.23,-size*.2);c.closePath();c.fill();
 c.fillStyle='#efffff';c.beginPath();c.moveTo(0,-size);c.lineTo(0,size*.25);c.lineTo(-size*.23,-size*.2);c.closePath();c.fill();c.restore();
}
function shield(c,x,y,size,color){
 if(atlas&&color==='#ffdb83'){texture(c,5,x,y,size*1.45,size*2.1);return;}
 c.save();c.translate(x,y);c.fillStyle=color+'38';c.strokeStyle=color;c.lineWidth=4;c.beginPath();c.moveTo(0,-size);c.lineTo(size*.6,-size*.63);c.lineTo(size*.51,size*.48);c.lineTo(0,size);c.lineTo(-size*.51,size*.48);c.lineTo(-size*.6,-size*.63);c.closePath();c.fill();c.stroke();
 c.lineWidth=2;c.strokeRect(-size*.23,-size*.23,size*.46,size*.46);c.rotate(Math.PI/4);c.strokeRect(-size*.23,-size*.23,size*.46,size*.46);c.restore();
}
function sword(c,x,y,size,angle,color){
 c.save();c.translate(x,y);c.rotate(angle);crystal(c,0,0,size,0,color);c.fillStyle='#ebc577';c.fillRect(-size*.2,size*.2,size*.4,size*.07);c.fillStyle='#142b30';c.fillRect(-size*.04,size*.27,size*.08,size*.25);c.restore();
}
function lance(c,x,y,size,angle,color){
 if(atlas){texture(c,2,x,y,size*.8,size*1.9,angle+Math.PI/2);return;}
 c.save();c.translate(x,y);c.rotate(angle);c.fillStyle=color;c.fillRect(-size,-6,size,12);c.fillStyle='#fff5ff';c.fillRect(-size,-2,size,4);crystal(c,0,0,27,Math.PI/2,color);c.restore();
}
function meteor(c,x,y,size,t){
 if(atlas){texture(c,3,x-12,y-30,size*3.0,size*4.5);return;}
 c.save();c.translate(x,y);c.rotate(-.5);for(let j=0;j<8;j++){c.globalAlpha=(1-j/9);c.fillStyle=j<2?'#fff3b9':j<4?'#ffb967':'#a15aff';c.fillRect(-size/2+j*2,-size/2-j*size*.5,size-j*2,size*.8);}c.globalAlpha=1;crystal(c,0,0,size,.5,'#ffe7aa');c.restore();
}
// Each skill owns a different silhouette, path and impact rather than a recolored bolt.
export function spell(c,card,origin,targets,t,ms,color,unit){
 const p=clamp(t),id=card.id,large=card.ultimate||card.type==='연계',size=unit*(large?1.4:1);
 c.save();c.lineCap='square';
 if(['slash','moon','lotus','flash','eclipse'].includes(id)){
  const end=targets[0],f=ease(p),x=origin.x+(end.x-origin.x)*f,y=origin.y+(end.y-origin.y)*f;
  const cuts=id==='lotus'?2:id==='flash'?3:id==='eclipse'?5:1;
  for(let j=0;j<cuts;j++){const q=clamp((p-j*.08)*1.3),px=origin.x+(end.x-origin.x)*ease(q),py=origin.y+(end.y-origin.y)*ease(q);crescent(c,px-j*10,py,size*(id==='flash'?.65:1),-.48+j*.75,color,.95-j*.14);}
  if(id==='moon'||id==='eclipse')crescent(c,x+15,y,size*1.1,.48,'#c894ff',.8);
  if(p<.55)sword(c,origin.x,origin.y,60*unit/90,-.6,color);
  for(let j=0;j<14;j++){c.globalAlpha=.5;c.fillStyle=j%2?'#eaffff':color;const x0=origin.x+(x-origin.x)*j/14;c.fillRect(x0,origin.y+(y-origin.y)*j/14+Math.sin(j*2+ms*.02)*20,5,3);}c.globalAlpha=1;
 }else if(id==='spark'){
  circle(c,origin.x,origin.y,size*.75,ms*.003,color);
  for(let j=0;j<5;j++){const q=clamp((p-j*.06)*1.32),end=targets[0],x=origin.x+(end.x-origin.x)*ease(q),y=origin.y+(end.y-origin.y)*ease(q)+Math.sin(q*Math.PI)*(j-2)*30;lance(c,x,y,size*.8,Math.atan2(end.y-origin.y,end.x-origin.x),color);}
 }else if(['storm','astral'].includes(id)){
  targets.forEach((end,i)=>{circle(c,end.x,end.y+40,size*.85,ms*.002,'#b083ff');for(let j=0;j<4;j++){const q=clamp((p-j*.065-i*.025)*1.3);meteor(c,end.x+(j-1.5)*32-(1-q)*130,end.y-(1-q)*300,23*unit/90,q);}});
 }else if(id==='frost'){
  const end=targets[0];circle(c,end.x,end.y+55,size*.85,-ms*.002,'#7ae7ff');
  if(atlas)texture(c,4,end.x,end.y+20,size*2.2,size*2.5*clamp(p*1.6));
  for(let j=0;j<7&&!atlas;j++){const q=clamp((p-.3-j*.03)*2),a=(j-3)*.23;crystal(c,end.x+(j-3)*13,end.y+70,size*1.5*q,a,'#61cdff');}
  for(let j=0;j<3;j++)crystal(c,origin.x+(end.x-origin.x)*ease(p),origin.y+(end.y-origin.y)*p+(j-1)*25,35,-1.1,'#8cecff');
 }else if(id==='nova'){
  targets.forEach(end=>{const r=size*(.3+.9*p);c.fillStyle='#110923';c.beginPath();c.arc(end.x,end.y,r*.5,0,Math.PI*2);c.fill();for(let j=0;j<3;j++){c.strokeStyle=['#cd99ff','#fcdbff','#5e3acd'][j];c.lineWidth=6-j;c.beginPath();c.ellipse(end.x,end.y,r,r*.42,ms*.005+j,0,Math.PI*2);c.stroke();}for(let j=0;j<12;j++){const a=j*.523+ms*.004;crystal(c,end.x+Math.cos(a)*r,end.y+Math.sin(a)*r,18,a+Math.PI/2,'#d4aeff');}});
 }else if(id==='bash'){
  const end=targets[0],q=ease(p);c.save();c.translate(end.x,end.y-(1-q)*240);c.rotate((1-q)*-1.4);c.fillStyle='#6b3d24';c.fillRect(-5,-100,10,130);c.fillStyle='#ffce64';c.fillRect(-45,-26,90,55);c.strokeStyle='#fff6ba';c.lineWidth=4;c.strokeRect(-37,-19,74,41);c.restore();
 }else if(['protect','ward','fortress','sanctuary'].includes(id)){
  targets.forEach((end,i)=>{const q=ease(clamp((p-i*.035)*1.2));circle(c,end.x,end.y+60,size*.8*q,ms*.002,color);shield(c,end.x,end.y,size*q,color);if(id==='fortress'||id==='sanctuary'){shield(c,end.x-size*.6,end.y,size*.65*q,color);shield(c,end.x+size*.6,end.y,size*.65*q,color);}});
 }else if(id==='guard'){
  targets.forEach(end=>{for(let j=0;j<3;j++){c.strokeStyle=j===0?'#efffff':color;c.lineWidth=7-j*2;c.beginPath();c.ellipse(end.x,end.y+30,size*(.5+p*.6),size*.26,ms*.003+j*.5,0,Math.PI*2);c.stroke();}});
 }else if(id==='heal'){
  targets.forEach(end=>{c.fillStyle='#ffe49a';for(let j=0;j<5;j++)c.fillRect(end.x+(j-2)*25,end.y-120,3,210*p);circle(c,end.x,end.y-100,size*.47,ms*.002,'#ffda82');for(let j=0;j<10;j++){const a=j*.628;c.fillRect(end.x+Math.cos(a)*size*.55,end.y-100+Math.sin(a)*size*.55,5,5);}});
 }else if(id==='focus'||id==='bond'){
  const centers=id==='bond'?targets:[origin];centers.forEach(end=>{circle(c,end.x,end.y,size*(.5+p*.4),ms*.003,color);for(let j=0;j<3;j++){const a=j*2.094+ms*.004;crystal(c,end.x+Math.cos(a)*size*.65,end.y+Math.sin(a)*size*.4,22,a,[color,'#c698ff','#ffe29e'][j]);}});
 }else targets.forEach(end=>crescent(c,end.x,end.y,size,0,color));
 c.restore();
}
export function impact(c,card,end,t,color,unit){
 const p=clamp(t),size=unit*(card.ultimate?2:card.type==='연계'?1.5:1);
 c.save();c.globalAlpha=1-p;
 if(p<.18){c.globalAlpha=(1-p/.18)*.7;c.fillStyle='#fff9dd';c.fillRect(end.x-size,end.y-size,size*2,size*2);c.globalAlpha=1-p;}
 if(atlas&&card.damage)texture(c,6,end.x,end.y,size*(1.4+p*.9),size*(1.4+p*.9),0,(1-p)*.95);
 const rings=card.ultimate?3:2;for(let j=0;j<rings;j++){c.strokeStyle=j%2?'#fff6e8':color;c.lineWidth=(7-j*2)*(1-p)+1;c.beginPath();c.ellipse(end.x,end.y,(15+p*size)*(1+j*.23),(15+p*size*.62)*(1+j*.23),-.2,0,Math.PI*2);c.stroke();}
 for(let j=0;j<90;j++){const a=j*2.399,r=(30+j%16*12)*p*unit/90; c.fillStyle=j%3?color:'#fff7dc';const w=2+j%4;c.fillRect(end.x+Math.cos(a)*r,end.y+Math.sin(a)*r-r*.08,w,w);}
 if(card.damage){for(let j=0;j<(card.hits||1);j++)crescent(c,end.x-30+j*25,end.y,size*.8,-.8+j*1.8,color,1-p);}
 if(card.id==='frost')for(let j=0;j<8;j++)crystal(c,end.x+(j-3.5)*18,end.y+60,size*(1-p),(j-3.5)*.2,'#8feaff');
 c.restore();
}
