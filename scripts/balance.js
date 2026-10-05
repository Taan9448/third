// A heuristic playthrough across the entire campaign. No health or deck cheats.
import {Game} from '../src/engine.js';
import {cardInfo} from '../src/data.js';
function rng(seed){return()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};}
const results=[];
for(let seed=1;seed<=30;seed++){
 const g=new Game(null,rng(seed)).init();let steps=0;
 while(!['defeat','ending'].includes(g.s.phase)&&steps++<10000){
  const s=g.s,b=s.battle;
  if(s.phase==='battle'){
   const alive=b.enemies.filter(e=>e.hp>0);b.selected=alive.sort((a,b)=>a.hp-b.hp)[0].uid;
   const incoming=s.party.map(()=>0);alive.forEach(e=>{const i=g.intent(e);if(i.type==='sweep')incoming.forEach((_,j)=>incoming[j]+=Math.floor(i.amount*(e.weak>0?.65:1)));else if(i.type!=='guard')incoming[e.target]+=Math.floor(i.amount*(e.weak>0?.65:1));});
   const scored=b.hand.filter(c=>!g.canPlay(c)).map(x=>{const c=cardInfo(x);const res=c.spendQi&&b.qi>=c.spendQi&&b.mana>=c.spendMana?c.bonus:0;const harm=b.combo===2&&b.lastOwner!==c.owner?5:0;
    let value=0;if(c.damage)value+=(c.damage+res+harm)*(c.hits||1)*(c.all?alive.length:1)*1.1;
    if(c.block)s.party.forEach((h,i)=>{if(h.hp>0)value+=Math.min(c.block+harm,Math.max(0,incoming[i]-h.block))*(h.hp<20?1.8:1.3);});
    if(c.heal)s.party.forEach(h=>{if(h.hp>0)value+=Math.min(h.maxHp-h.hp,c.heal)*1.5;});
    value+=(c.draw||0)*6+Math.min(6-b.qi,c.qi||0)*2+Math.min(6-b.mana,c.mana||0)*2+(harm?4:0);value/=(c.cost||.3);return {uid:x.uid,value};
   }).sort((a,b)=>b.value-a.value);
   if(b.linkCharge>=100){const threatened=s.party.some(h=>h.hp>0&&h.hp<20);const choice=threatened&&!g.canUltimate('sanctuary')?'sanctuary':alive.length>1&&!g.canUltimate('astral')?'astral':'eclipse';if(!g.canUltimate(choice)){g.ultimate(choice);continue;}}
   if(scored.length&&scored[0].value>0)g.play(scored[0].uid);else g.endTurn();
  }else if(s.phase==='reward'){
   const priority=['heal','lotus','storm','fortress','nova','focus','frost'];
   const best=[...s.reward].sort((a,b)=>(priority.includes(a)?priority.indexOf(a):100)-(priority.includes(b)?priority.indexOf(b):100))[0];
   const copies=s.deck.filter(c=>c.id===best).length;g.claimReward(priority.includes(best)&&copies<2?best:null);
  }else if(s.phase==='map'){const preferred=s.floor===1?'shop':s.floor===2?'elite':s.floor===3?'rest':s.floor===4?'battle':s.floor===5?'boss':'battle';g.chooseNode(g.nodes.includes(preferred)?preferred:g.nodes[0]);}
  else if(s.phase==='story')g.finishStory();
  else if(s.phase==='rest')g.rest();
  else if(s.phase==='shop'){if(s.gold>=45&&s.deck.filter(c=>c.id==='heal').length<2)g.buyCard('heal');else if(s.gold>=45&&s.deck.filter(c=>c.id==='lotus').length<2&&s.chapter===0)g.buyCard('lotus');else if(s.gold>=45&&s.deck.filter(c=>c.id==='fortress').length<1)g.buyCard('fortress');g.finishNode();}
  else if(s.phase==='chapter')g.nextChapter();
  else if(s.phase==='event')g.event('heal');
 }
 results.push({seed,result:g.s.phase,chapter:g.s.chapter+1,hp:g.s.party.map(h=>h.hp),battles:g.s.battles,steps});
}
console.log(JSON.stringify({wins:results.filter(x=>x.result==='ending').length,runs:results.length,results},null,2));
