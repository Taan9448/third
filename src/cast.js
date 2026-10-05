import {clamp,ease,circle,spell,impact,animatedSkill} from './effects.js';
function copyCard(source){
 const clone=source.cloneNode(true);clone.removeAttribute('data-action');clone.removeAttribute('data-uid');clone.removeAttribute('aria-disabled');clone.classList.remove('unplayable');clone.tabIndex=-1;
 const src=[...source.querySelectorAll('canvas')];clone.querySelectorAll('canvas').forEach((c,i)=>{c.width=src[i].width;c.height=src[i].height;c.getContext('2d').drawImage(src[i],0,0);});return clone;
}
// Twenty-four textured triangular fragments, rather than six paper slabs.
function fragments(){const list=[];for(let row=0;row<4;row++)for(let col=0;col<3;col++)for(let side=0;side<2;side++){
 const x=col*100/3,y=row*25,w=100/3,h=25;
 const points=side?[[x,y],[x+w,y+h],[x,y+h]]:[[x,y],[x+w,y],[x+w,y+h]];
 const index=list.length;list.push({clip:'polygon('+points.map(p=>p.join('% ')+'%').join(',')+')',dx:(col-1)*115+Math.sin(index*2.4)*65,dy:(row-1.5)*83+Math.cos(index*1.7)*35,rot:Math.sin(index*3.1)*135});
 }return list;}
export function castCard({element,card,scene,targets,onImpact,audio}){
 const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
 if(reduced)return new Promise((resolve,reject)=>{element.classList.add('card-casting');setTimeout(()=>{try{onImpact();audio.play(card.damage?'attack':'block');setTimeout(resolve,180);}catch(e){reject(e);}},90);});
 const r=element.getBoundingClientRect(),arena=scene.canvas.getBoundingClientRect();
 const color=card.id==='frost'?'#87e9ff':card.family==='wuxia'?'#73ffe0':card.owner==='aria'?'#ffdb83':'#c495ff';
 const origin={x:arena.left+arena.width*.48,y:arena.top+arena.height*(innerWidth<=700?.43:.36)},start={x:r.left+r.width/2,y:r.top+r.height/2};
 const unit=Math.max(46,Math.min(112,arena.width*.09)),rate=card.ultimate?1.4:1,hitAt=1060*rate,endAt=1660*rate;
 const root=document.createElement('div');root.className='cast-layer'+(card.ultimate?' ultimate-cast':'');root.dataset.skill=card.id;root.dataset.phase='lift';root.style.setProperty('--cast-color',color);root.setAttribute('aria-hidden','true');
 const veil=document.createElement('div');veil.className='cast-veil';root.append(veil);
 const banner=document.createElement('div');banner.className='skill-banner';const label=document.createElement('small');label.textContent=card.ultimate?'합격절기 · 동료들의 힘':card.family==='wuxia'?'청운 검보 · 무공':'별의 기록 · 판타지';const name=document.createElement('strong');name.textContent=card.name;banner.append(label,name);root.append(banner);
 const fly=document.createElement('div');fly.className='cast-card';fly.style.width=r.width+'px';fly.style.height=r.height+'px';fly.append(copyCard(element));root.append(fly);
 const crack=document.createElementNS('http://www.w3.org/2000/svg','svg');crack.setAttribute('viewBox','0 0 100 150');crack.classList.add('card-cracks');
 crack.innerHTML='<path d="M48 0 51 18 40 29 54 46 44 62 60 78 44 96 57 116 49 150 M40 29 23 32 15 19 0 24 M54 46 71 39 81 52 100 45 M44 62 30 74 16 67 0 82 M60 78 75 84 85 71 100 78 M44 96 30 101 22 121 0 115 M57 116 74 128 88 118 100 130" />';fly.append(crack);
 const canvas=document.createElement('canvas');canvas.className='cast-canvas';const scale=.5;canvas.width=Math.ceil(innerWidth*scale);canvas.height=Math.ceil(innerHeight*scale);const ctx=canvas.getContext('2d');ctx.scale(scale,scale);ctx.imageSmoothingEnabled=false;root.append(canvas);document.body.append(root);
 element.classList.add('card-casting');scene.perform?.(card);audio.play('charge');
 const shards=fragments().map(s=>{const el=document.createElement('div');el.className='card-shard';el.style.width=r.width+'px';el.style.height=r.height+'px';el.style.clipPath=s.clip;el.append(copyCard(element));root.append(el);return {...s,el};});
 return new Promise((resolve,reject)=>{
  const at=performance.now(),scrollAt={x:scrollX,y:scrollY};let impacted=false,shattered=false;
  function finish(error){root.remove();document.querySelector('.battle-scene')?.classList.remove('impact-shake');document.querySelector('.battle-screen')?.classList.remove('skill-impact');error?reject(error):resolve();}
  function frame(now){try{
   const actual=now-at,ms=actual/rate,ox=scrollAt.x-scrollX,oy=scrollAt.y-scrollY;
   ctx.clearRect(0,0,innerWidth,innerHeight);ctx.save();ctx.translate(ox,oy);
   root.dataset.skillFrame=String(Math.max(0,Math.min(3,Math.floor((ms-520)/1140*4))));
   root.dataset.phase=ms<220?'lift':ms<520?'fracture':actual<hitAt?'projectile':'impact';
   const lift=ease(ms/220),x=start.x+(origin.x-start.x)*lift,y=start.y+(origin.y-start.y)*lift;
   fly.style.left=(x-r.width/2+ox)+'px';fly.style.top=(y-r.height/2+oy)+'px';fly.style.transform=`rotate(${Math.sin(ms*.045)*clamp((ms-220)/140)*2}deg) scale(${1+lift*.06})`;fly.style.opacity=ms<520?1:0;
   crack.style.opacity=clamp((ms-210)/130);crack.style.strokeDashoffset=String(700*(1-clamp((ms-220)/300)));
   veil.style.opacity=String(Math.min(card.ultimate?.45:.22,clamp(ms/300)*.3)*(1-clamp((actual-hitAt)/450)));
   banner.style.opacity=String(clamp((ms-100)/160)*(1-clamp((actual-hitAt-200)/300)));
   if(ms>220&&ms<840){ctx.globalAlpha=1-clamp((ms-620)/220);circle(ctx,origin.x,origin.y,unit*(.7+clamp((ms-220)/250)*.7),ms*.003,color);ctx.globalAlpha=1;}
   if(ms>=520&&!shattered){shattered=true;audio.play('shatter');}
   shards.forEach((s,i)=>{const t=clamp((ms-520)/470);s.el.style.display=ms>=520&&t<1?'block':'none';s.el.style.left=(origin.x-r.width/2+s.dx*ease(t)+ox)+'px';s.el.style.top=(origin.y-r.height/2+s.dy*ease(t)+t*t*80+oy)+'px';s.el.style.transform=`rotate(${s.rot*t}deg) scale(${1-t*.55})`;s.el.style.opacity=String(1-t);});
   if(ms>=520&&ms<1060){const t=(ms-520)/540;for(let j=0;j<44;j++){const a=j*2.399,radius=unit*(.2+t*2);ctx.globalAlpha=1-t;ctx.fillStyle=j%3?color:'#fff9d5';ctx.fillRect(origin.x+Math.cos(a)*radius,origin.y+Math.sin(a)*radius,3+j%3,3+j%3);}ctx.globalAlpha=1;spell(ctx,card,origin,targets,t,ms,color,unit);}
   if(actual>=hitAt&&!impacted){impacted=true;onImpact();audio.play(card.ultimate||card.type==='연계'?'combo':card.damage?'impact':'block');document.querySelector('.battle-scene')?.classList.add('impact-shake');document.querySelector('.battle-screen')?.classList.add('skill-impact');}
   if(actual>=hitAt){const t=clamp((actual-hitAt)/600);targets.forEach(end=>impact(ctx,card,end,t,color,unit));if(!card.damage){ctx.globalAlpha=1-t;spell(ctx,card,origin,targets,1,ms,color,unit);ctx.globalAlpha=1;}}
   if(ms>=520)animatedSkill(ctx,card,origin,targets,clamp((ms-520)/1140),unit);
   ctx.restore();if(actual<endAt)requestAnimationFrame(frame);else finish();
  }catch(e){finish(e);}}
  requestAnimationFrame(frame);
 });
}
