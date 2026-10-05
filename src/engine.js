import {HEROES,CARDS,STARTER,RELICS,CHAPTERS,ENEMIES,cardInfo} from './data.js';
export const SAVE_KEY='moonveil-save-v1';
export const VERSION=1;
export function shuffle(items,rng=Math.random) {
 const out=[...items]; for(let i=out.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[out[i],out[j]]=[out[j],out[i]];} return out;
}
export class Game {
 constructor(saved=null,rng=Math.random){this.rng=rng;this.state=saved || this.create();}
 create(){return {version:VERSION,chapter:0,floor:0,phase:'battle',gold:80,deck:STARTER.map((id,i)=>({id,uid:i+1,upgraded:false})),nextUid:STARTER.length+1,party:HEROES.map(h=>({...h,hp:h.maxHp,block:0})),relics:['pendant'],history:[],battles:0,battle:null,reward:[],introSeen:false};}
 get s(){return this.state;}
 init(){if(!this.s.battle&&this.s.phase==='battle')this.startBattle('battle',true);return this;}
 log(text){this.s.history.unshift(text);this.s.history=this.s.history.slice(0,50);}
 addCard(id){if(!CARDS[id])return false;this.s.deck.push({id,uid:this.s.nextUid++,upgraded:false});return true;}
 heal(amount,revive=false){this.s.party.forEach(h=>{if(h.hp>0||revive)h.hp=Math.min(h.maxHp,h.hp+amount);});}
 get nodes(){const f=this.s.floor;const sets=[['battle','battle'],['event','shop'],['elite','battle'],['rest','event'],['battle','elite'],['boss']];return sets[f] || [];}
 startBattle(type='battle',opening=false){
 const c=this.s.chapter;let ids;
 if(type==='boss')ids=[CHAPTERS[c].boss];
 else if(c===2&&this.s.floor===4)ids=['cult'];
 else if(type==='elite')ids=c===2?['cult']:c===0?['knight','wisp']:c===1?['knight','knight']:['horror','wisp'];
 else ids=c===0?['wolf','wisp']:c===1?['knight','wisp']:c===2?['assassin','assassin']:['horror','wisp'];
 const enemies=ids.map((id,i)=>{const e=ENEMIES[id],hp=e.hp+(type==='boss'?0:c*5)+(type==='elite'?8:0);return {...e,id,uid:i,hp,maxHp:hp,attack:e.attack+(type==='boss'?0:c),block:0,weak:0,target:i%3};});
 this.s.party.forEach(h=>h.block=0);
 this.s.battle={type,enemies,turn:1,energy:3,qi:0,mana:this.s.relics.reduce((n,id)=>n+(RELICS[id].startMana||0),0),combo:0,lastOwner:null,selected:0,draw:shuffle(this.s.deck,this.rng),discard:[],hand:[]};
 this.s.phase='battle';
 if(opening){const fixed=['slash','spark','protect','bond','moon'];fixed.forEach(id=>{const i=this.s.battle.draw.findIndex(x=>x.id===id);this.s.battle.hand.push(this.s.battle.draw.splice(i,1)[0]);});}else this.draw(5);
 this.turnRelics();this.log(`${CHAPTERS[c].subtitle} · ${type==='boss'?'우두머리':type==='elite'?'정예':'전투'} 시작`);
 }
 turnRelics(){this.s.battle.qi=Math.min(6,this.s.battle.qi+this.s.relics.reduce((n,id)=>n+(RELICS[id].turnQi||0),0));}
 draw(n){const b=this.s.battle;for(let i=0;i<n&&b.hand.length<10;i++){if(!b.draw.length){if(!b.discard.length)break;b.draw=shuffle(b.discard,this.rng);b.discard=[];}b.hand.push(b.draw.pop());}}
 intent(e){const b=this.s.battle;if(b.turn%3===0){if(['thorn','demon','hell'].includes(e.id))return {type:'sweep',amount:e.id==='thorn'?9:e.id==='demon'?11:e.hp<e.maxHp/2?15:12,label:e.id==='thorn'?'가시 폭풍':e.id==='demon'?'멸성':'경계 붕괴',target:e.target};return {type:'heavy',amount:e.attack+(e.id==='master'?8:5),label:e.id==='master'?'무영검':'강공',target:e.target};}if(b.turn%4===0)return {type:'guard',amount:12,label:'방어',target:e.target};return {type:'attack',amount:e.attack,label:'공격',target:e.target};}
 canPlay(instance){const b=this.s.battle,c=cardInfo(instance);if(this.s.phase!=='battle')return '전투 중에만 사용할 수 있습니다.';if(!this.s.party.find(h=>h.id===c.owner&&h.hp>0))return '이 동료는 쓰러졌습니다. 야영지에서 회복하세요.';if(c.cost>b.energy)return '행동력이 부족합니다.';return '';}
 play(uid){
 const b=this.s.battle;if(this.s.phase!=='battle')return {error:'현재 카드를 사용할 수 없습니다.'};
 const i=b.hand.findIndex(x=>x.uid===uid);if(i<0)return {error:'손패에 없는 카드입니다.'};
 const instance=b.hand[i],c=cardInfo(instance),error=this.canPlay(instance);if(error)return {error};
 b.hand.splice(i,1);b.discard.push(instance);b.energy-=c.cost;
 const effects=[];let bonus=0;
 if(c.spendQi&&b.qi>=c.spendQi&&b.mana>=c.spendMana){b.qi-=c.spendQi;b.mana-=c.spendMana;bonus=c.bonus;effects.push({type:'resonate',text:'기 · 마나 공명',owner:c.owner});}
 b.qi=Math.min(6,b.qi+(c.qi||0));b.mana=Math.min(6,b.mana+(c.mana||0));
 b.combo=b.lastOwner&&b.lastOwner!==c.owner?b.combo+1:1;b.lastOwner=c.owner;
 const combo=b.combo>=3;if(combo){b.combo=0;b.lastOwner=null;effects.push({type:'combo',text:'동료 연계',owner:c.owner});}
 const comboBonus=combo?5+this.s.relics.reduce((n,id)=>n+(RELICS[id].comboBonus||0),0):0;
 if(c.damage){const targets=c.all?b.enemies.filter(e=>e.hp>0):[b.enemies.find(e=>e.uid===b.selected&&e.hp>0)||b.enemies.find(e=>e.hp>0)];targets.filter(Boolean).forEach(e=>{let actual=0;for(let hit=0;hit<(c.hits||1);hit++){const damage=c.damage+bonus+comboBonus;const absorb=Math.min(e.block,damage);e.block-=absorb;const dealt=Math.min(e.hp,damage-absorb);e.hp-=dealt;actual+=dealt;}if(c.weak)e.weak=Math.max(e.weak,c.weak);effects.push({type:'attack',target:e.uid,amount:actual,owner:c.owner,icon:c.icon,combo:combo||bonus>0});});}
 if(c.block)this.s.party.filter(h=>h.hp>0).forEach(h=>{h.block+=c.block+comboBonus;});
 else if(combo&&!c.damage)this.s.party.filter(h=>h.hp>0).forEach(h=>h.block+=comboBonus);
 if(c.block)effects.push({type:'block',amount:c.block,owner:c.owner});
 if(c.heal){this.heal(c.heal);effects.push({type:'heal',amount:c.heal,owner:c.owner});}
 if(c.draw)this.draw(c.draw);
 if(!b.enemies.some(e=>e.uid===b.selected&&e.hp>0))b.selected=b.enemies.find(e=>e.hp>0)?.uid??0;
 this.log(`${HEROES.find(h=>h.id===c.owner).name} · ${c.name}${bonus?' — 공명!':''}${combo?' — 동료 연계!':''}`);
 if(b.enemies.every(e=>e.hp<=0))this.victory();
 return {effects,card:c};
 }
 endTurn(){
 if(this.s.phase!=='battle')return [];
 const b=this.s.battle,effects=[];
 b.enemies.filter(e=>e.hp>0).forEach(e=>{e.block=0;const intent=this.intent(e);if(intent.type==='guard'){e.block+=intent.amount;effects.push({type:'enemyBlock',target:e.uid,amount:intent.amount});}else{let target=this.s.party[e.target];if(target.hp<=0)target=this.s.party.find(h=>h.hp>0);const targets=intent.type==='sweep'?this.s.party.filter(h=>h.hp>0):target?[target]:[];targets.forEach(h=>{const damage=Math.floor(intent.amount*(e.weak>0?.65:1)),absorb=Math.min(h.block,damage);h.block-=absorb;const dealt=Math.min(h.hp,damage-absorb);h.hp-=dealt;effects.push({type:'enemy',target:h.id,source:e.uid,amount:dealt,absorbed:absorb});});}if(e.weak>0)e.weak--;});
 b.discard.push(...b.hand);b.hand=[];
 if(this.s.party.every(h=>h.hp<=0)){this.s.phase='defeat';this.log('원정 종료 · 다시 시작할 수 있습니다.');return effects;}
 this.s.party.forEach(h=>h.block=0);b.turn++;b.energy=3;b.combo=0;b.lastOwner=null;b.enemies.forEach(e=>{const living=this.s.party.map((h,i)=>h.hp>0?i:-1).filter(i=>i>=0);e.target=living[(b.turn+e.uid)%living.length];});this.turnRelics();this.draw(5);this.log(`${b.turn}번째 턴`);return effects;
 }
 victory(){const b=this.s.battle;this.s.battles++;this.s.gold+=b.type==='boss'?85:b.type==='elite'?55:30;this.s.relics.forEach(id=>{if(RELICS[id].victoryHeal)this.heal(RELICS[id].victoryHeal);});if(b.type==='elite'||b.type==='boss'){const options=Object.keys(RELICS).filter(id=>!this.s.relics.includes(id));if(options.length){const id=options[Math.floor(this.rng()*options.length)];this.s.relics.push(id);this.log(`유물 획득 · ${RELICS[id].name}`);}}this.s.reward=shuffle(Object.keys(CARDS),this.rng).slice(0,3);this.s.phase='reward';this.log('전투 승리 · 새로운 선택');}
 claimReward(id){if(this.s.phase!=='reward')return false;if(id&&!this.s.reward.includes(id))return false;if(id)this.addCard(id);this.finishNode();return true;}
 finishNode(){if(this.s.battle?.type==='boss'&&this.s.phase==='reward'){this.s.phase='chapter';return;}this.s.floor++;this.s.phase='map';this.s.battle=null;}
 nextChapter(){if(this.s.phase!=='chapter')return;if(this.s.chapter===3){this.s.phase='ending';return;}this.s.chapter++;this.s.floor=0;this.s.battle=null;this.heal(25,true);this.s.phase='map';}
 chooseNode(type){if(this.s.phase!=='map'||!this.nodes.includes(type))return false;this.s.battle=null;if(['battle','elite','boss'].includes(type))this.startBattle(type,this.s.chapter===0&&this.s.floor===0&&this.s.battles===0);else this.s.phase=type;return true;}
 rest(){if(this.s.phase!=='rest')return;this.heal(26,true);this.log('야영 · 모든 동료 체력 26 회복');this.finishNode();}
 upgrade(uid){const card=this.s.deck.find(c=>c.uid===uid);if(!card||card.upgraded)return false;card.upgraded=true;this.log(`${CARDS[card.id].name} 강화`);return true;}
 remove(uid){if(this.s.deck.length<=8)return false;const i=this.s.deck.findIndex(c=>c.uid===uid);if(i<0)return false;this.log(`${CARDS[this.s.deck[i].id].name} 제거`);this.s.deck.splice(i,1);return true;}
 event(effect){if(this.s.phase!=='event')return false;if(effect==='heal')this.heal(20,true);else if(RELICS[effect]){if(!this.s.relics.includes(effect))this.s.relics.push(effect);else this.s.gold+=45;}else return false;this.finishNode();return true;}
 buyCard(id){if(this.s.phase!=='shop'||!CARDS[id]||this.s.gold<45)return false;this.s.gold-=45;this.addCard(id);return true;}
 save(storage){try{storage.setItem(SAVE_KEY,JSON.stringify(this.s));return true;}catch{return false;}}
 static load(storage){
  try{
   const s=JSON.parse(storage.getItem(SAVE_KEY));
   const integer=(n,min,max)=>Number.isInteger(n)&&n>=min&&n<=max;
   const validCard=c=>c&&Object.hasOwn(CARDS,c.id)&&integer(c.uid,1,1000000)&&typeof c.upgraded==='boolean';
   if(!s||s.version!==VERSION||!integer(s.chapter,0,3)||!integer(s.floor,0,5)||!['battle','map','reward','rest','event','shop','chapter','ending','defeat'].includes(s.phase)||!Array.isArray(s.deck)||s.deck.length<8||s.deck.length>200||!s.deck.every(validCard)||new Set(s.deck.map(c=>c.uid)).size!==s.deck.length||!Array.isArray(s.party)||s.party.length!==3||!s.party.every((h,i)=>h.id===HEROES[i].id&&integer(h.hp,0,HEROES[i].maxHp)&&integer(h.block,0,1000))||!Array.isArray(s.relics)||!s.relics.every(id=>Object.hasOwn(RELICS,id))||new Set(s.relics).size!==s.relics.length||!integer(s.gold,0,1000000)||!integer(s.nextUid,1,1000000)||s.nextUid<=Math.max(...s.deck.map(c=>c.uid))||!Array.isArray(s.history)||!s.history.every(x=>typeof x==='string')||!Array.isArray(s.reward)||!s.reward.every(id=>Object.hasOwn(CARDS,id))||!integer(s.battles,0,10000))return null;
   if(s.battle!=null||['battle','reward','chapter','defeat'].includes(s.phase)){
    const b=s.battle;
    if(!b||!['battle','elite','boss'].includes(b.type)||!Array.isArray(b.enemies)||!b.enemies.length||b.enemies.length>4||!b.enemies.every(e=>Object.hasOwn(ENEMIES,e.id)&&integer(e.uid,0,3)&&integer(e.hp,0,e.maxHp)&&integer(e.maxHp,1,10000)&&integer(e.attack,0,1000)&&integer(e.block,0,1000)&&integer(e.weak,0,100)&&integer(e.target,0,2))||!['hand','draw','discard'].every(k=>Array.isArray(b[k])&&b[k].every(validCard))||!integer(b.energy,0,3)||!integer(b.turn,1,10000)||!integer(b.qi,0,6)||!integer(b.mana,0,6)||!integer(b.combo,0,2)||!(b.lastOwner===null||HEROES.some(h=>h.id===b.lastOwner))||!integer(b.selected,0,3))return null;
   }
   if(s.battle)s.battle.enemies=s.battle.enemies.map(e=>({...ENEMIES[e.id],id:e.id,uid:e.uid,hp:e.hp,maxHp:e.maxHp,attack:e.attack,block:e.block,weak:e.weak,target:e.target}));
   s.party=s.party.map((h,i)=>({...HEROES[i],hp:h.hp,block:h.block}));
   return s;
  }catch{return null;}
 }
}
