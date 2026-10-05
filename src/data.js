export const HEROES = [
  { id:'seol', name:'설아', title:'경계를 넘는 검', role:'검객', color:'#9ecfc3', maxHp:68, lore:'청운문의 허드렛일을 하던 말단 제자. 남의 짐을 드느라 다져진 하체와 누구도 가르쳐 주지 않은 검. 두 세계의 흐름을 몸으로 기억한다.' },
  { id:'lyra', name:'리라', title:'별의 마지막 제자', role:'마법사', color:'#c3a3e0', maxHp:48, lore:'마왕에게 멸망한 별빛 학회의 마지막 마법사. 차원의 틈을 연구하다 설아를 구했다. 세계를 지키는 일에는 고향의 경계가 없다고 믿는다.' },
  { id:'aria', name:'아리아', title:'새벽의 방패', role:'수호자', color:'#e0bc7b', maxHp:78, lore:'버림받은 국경 도시의 기사. 상관의 철수 명령 대신 주민들을 선택했다. 방패는 왕을 위해 드는 것이 아니라 곁에 선 이를 위해 드는 것.' }
];
export const CARDS = {
  slash: {name:'월하참',owner:'seol',type:'공격',cost:1,damage:9,qi:1,icon:'sword',text:'적 하나에게 피해 9. 기 1을 얻습니다.',flavor:'달빛이 닿기 전에, 검이 닿는다.'},
  guard: {name:'유수보',owner:'seol',type:'방어',cost:1,block:6,qi:1,icon:'wind',text:'동료 모두 방어 6. 기 1을 얻습니다.',flavor:'물은 부서지지 않는다.'},
  spark: {name:'별빛 화살',owner:'lyra',type:'공격',cost:1,damage:8,mana:1,icon:'star',text:'적 하나에게 피해 8. 마나 1을 얻습니다.',flavor:'길을 잃어도 별은 남는다.'},
  ward: {name:'별의 장막',owner:'lyra',type:'방어',cost:1,block:7,mana:1,icon:'shield',text:'동료 모두 방어 7. 마나 1을 얻습니다.',flavor:'이 작은 하늘 아래라면.'},
  bash: {name:'새벽의 일격',owner:'aria',type:'공격',cost:1,damage:10,icon:'hammer',text:'피해 10. 대상에게 약화 1턴.',weak:1,flavor:'내 뒤로 물러서.'},
  protect: {name:'불굴의 맹세',owner:'aria',type:'방어',cost:1,block:9,icon:'shield',text:'동료 모두 방어 9.',flavor:'오늘도, 모두 함께 돌아간다.'},
  bond: {name:'이어진 마음',owner:'aria',type:'지원',cost:0,draw:1,mana:1,icon:'bond',text:'카드 1장 뽑기. 마나 1을 얻습니다.',flavor:'홀로 건널 수 없는 길도 있다.'},
  moon: {name:'월영 · 공명',owner:'seol',type:'연계',cost:2,damage:15,spendQi:2,spendMana:2,bonus:19,icon:'moon',text:'피해 15. 기 2 · 마나 2가 있으면 소비해 추가 피해 19.',flavor:'서로 다른 흐름이, 하나의 검 끝에서.'},
  storm: {burn:2,name:'유성우',owner:'lyra',type:'공격',cost:2,damage:12,all:true,mana:2,icon:'star',text:'모든 적 피해 12 · 화상 2. 마나 2를 얻습니다.',flavor:'하늘이 무너지는 것이 아니다. 응답하는 것이다.',rarity:'희귀'},
  lotus: {name:'청련검무',owner:'seol',type:'공격',cost:1,damage:7,hits:2,qi:2,icon:'lotus',text:'피해 7을 2회. 기 2를 얻습니다.',flavor:'꽃잎 하나에 검식 하나.',rarity:'희귀'},
  heal: {name:'새벽의 기도',owner:'aria',type:'지원',cost:1,heal:7,icon:'sun',text:'생존한 동료 모두 체력 7 회복.',flavor:'해가 뜨기 전이 가장 어둡다.'},
  focus: {name:'운기조식',owner:'seol',type:'지원',cost:0,qi:2,draw:1,icon:'wind',text:'기 2를 얻고 카드 1장 뽑기.',flavor:'숨을 고르면, 길이 보인다.'},
  nova: {name:'성운 붕괴',owner:'lyra',type:'연계',cost:2,damage:14,all:true,spendQi:1,spendMana:3,bonus:12,icon:'moon',text:'모든 적 피해 14. 기 1 · 마나 3을 소비하면 피해 +12.',flavor:'끝난 별이 남기는 마지막 빛.',rarity:'희귀'},
  fortress: {name:'여명의 성벽',owner:'aria',type:'방어',cost:2,block:18,draw:1,icon:'shield',text:'동료 모두 방어 18. 카드 1장 뽑기.',flavor:'우리가 서 있는 곳이 마지막 성벽.',rarity:'희귀'},
  flash: {name:'섬광보',owner:'seol',type:'공격',cost:0,damage:5,icon:'sword',text:'적 하나에게 피해 5.',flavor:'생각보다 빠르게.'},
  frost: {frozen:1,name:'빙결의 룬',owner:'lyra',type:'공격',cost:1,damage:6,weak:2,mana:1,icon:'rune',text:'피해 6 · 약화 2턴 · 빙결 1턴. 마나 1 획득.',flavor:'고요 또한 마법이다.'}
};
export const STARTER = ['slash','guard','spark','protect','moon','slash','spark','bash','ward','bond','guard','protect','slash','spark'];
export const RELICS = {
  pendant:{name:'금 간 월석',icon:'☾',text:'기와 마나의 상한이 6. 두 세계를 건넌 증표.'},
  ribbon:{name:'붉은 매듭',icon:'⌘',text:'동료 연계 발동 시 피해 +3.',comboBonus:3},
  prism:{name:'별의 결정',icon:'◇',text:'전투 시작 시 마나 2.',startMana:2},
  bell:{name:'새벽의 종',icon:'♧',text:'전투 승리 시 생존한 동료 체력 5 회복.',victoryHeal:5},
  scroll:{name:'무명 검보',icon:'▤',text:'매 턴 기 1.',turnQi:1}
};
export const CHAPTERS = [
 {title:'낯선 달 아래',subtitle:'별이 잠든 숲',world:'판타지',color:'#829e75',boss:'thorn',bossName:'가시의 여왕',intro:'장문 연화와 마교의 밀담을 엿들은 설아는 쫓기다 절벽으로 떨어진다. 품속의 낡은 월석이 깨어나고, 낯선 숲에서 홀로 눈을 뜬다. 별빛 폐허에서 리라를, 국경 마을에서 아리아를 만나 동료가 된다. 돌아갈 길을 찾는 세 사람 앞에 숲을 잠식한 마왕의 잔재가 나타난다.',outro:'가시의 왕관 아래에는 마왕에게 뿌리를 빼앗긴 숲의 수호자가 있었다. 설아는 내공으로 오염을 끊고, 리라는 마나로 상처를 잇는다. 두 흐름의 공명은 기적이지만, 월석에는 또 하나의 금이 생긴다.'},
 {title:'별을 삼킨 왕',subtitle:'잿빛 왕성',world:'판타지',color:'#a998ba',boss:'demon',bossName:'마왕 아스테르',intro:'마왕 아스테르는 별빛 학회의 차원 연구를 빼앗아 다른 세계의 생명으로 불멸을 꿈꾼다. 설아가 들었던 밀담의 문양이 왕성에도 새겨져 있다. 두 세계의 배신은 처음부터 하나의 거래였다.',outro:'마왕을 쓰러뜨리고 고향으로 돌아갈 문을 연다. 리라는 폐허가 된 학회의 기록을 챙기고, 아리아는 설아의 귀환에 동행한다. 문 너머의 무림에는 석 달이 아닌 삼 년이 흘렀다.'},
 {title:'돌아온 검',subtitle:'뒤집힌 청운문',world:'무림',color:'#bd8071',boss:'master',bossName:'장문 연화',intro:'연화는 마교주와 손잡고 무림을 장악했다. 말단 제자들이 저항의 씨앗이 되어 설아를 기다린다. 연화는 월석이 본래 세계의 기둥이었음을 알고도, 영생을 위해 마왕에게 그 조각을 넘겼다.',outro:'마교주와 연화를 쓰러뜨리는 마지막 공명이 봉인진을 깨뜨린다. 무림에 없는 마나가 지맥의 기와 충돌하고 하늘이 찢어진다. 승리의 순간, 설아는 자신이 재앙의 마지막 열쇠였음을 깨닫는다.'},
 {title:'경계를 꿰매는 빛',subtitle:'세계의 틈',world:'경계',color:'#b9818f',boss:'hell',bossName:'지옥왕 나락',intro:'지옥왕 나락은 두 세계의 탐욕을 부추겨 경계를 무너뜨렸다. 설아는 월석을 버리고 도망칠 수 있다. 하지만 그녀는 동료들의 손을 잡고 틈으로 들어간다. 책임은 혼자 짊어지는 벌이 아니라 함께 끝내는 약속이다.',outro:'나락의 왕관이 부서지고 세 사람은 월석에 검과 별과 맹세를 새긴다. 세계를 가르는 대신 서로의 흐름을 받아들이는 새로운 경계. 문은 닫히지만 동료들은 남는다. 설아는 작은 문파를 세운다. 출신도 세계도 묻지 않는, 돌아올 곳을.'}
];
export const ENEMIES = {
 wolf:{name:'그림자 늑대',hp:34,attack:9,kind:'wolf'},
 wisp:{name:'타락한 정령',hp:26,attack:7,kind:'wisp'},
 knight:{name:'잿빛 기사',hp:46,attack:11,kind:'knight'},
 assassin:{name:'마교 추격자',hp:38,attack:10,kind:'knight'},
 horror:{name:'틈의 포식자',hp:45,attack:12,kind:'wolf'},
 thorn:{name:'가시의 여왕',hp:115,attack:15,kind:'queen'},
 demon:{name:'마왕 아스테르',hp:140,attack:17,kind:'demon'},
 cult:{name:'마교주 혈련',hp:88,attack:14,kind:'queen'},
 master:{name:'장문 연화',hp:138,attack:17,kind:'queen'},
 hell:{name:'지옥왕 나락',hp:178,attack:19,kind:'demon'}
};
export const EVENTS = [
 {title:'별빛이 고인 샘',subtitle:'잔잔한 물 위에, 두 개의 달이 비친다.',text:'리라가 샘에 손을 담근다. “별빛이 아직 살아 있어. 상처를 씻어도 좋고, 작은 결정을 가져가도 좋아.” 설아는 처음으로 고향의 달이 아닌 달 아래에서 마음을 놓는다.',choices:[{label:'잠시 쉬어 간다',detail:'모든 동료 체력 20 회복',effect:'heal'},{label:'별의 결정을 가져간다',detail:'유물 획득 · 이미 있다면 45금',effect:'prism'}]},
 {title:'검을 놓은 사람',subtitle:'길가의 작은 대장간. 불빛은 아직 따뜻하다.',text:'은퇴한 여검객은 설아의 검을 살핀다. “멋진 검법은 필요 없어. 지켜야 할 것이 있을 때, 네 검이 어디로 가는지 기억해.” 그녀는 일행에게 한 번의 담금질을 약속한다.',choices:[{label:'검을 맡긴다',detail:'덱의 카드 1장 강화',effect:'upgrade'},{label:'쓰지 않는 검식을 잊는다',detail:'덱의 카드 1장 제거',effect:'remove'}]},
 {title:'이름 없는 이들의 등불',subtitle:'마교의 눈을 피해 살아남은 청운문 제자들.',text:'설아에게 물을 건네던 옛 동문이 이제 피난민의 길잡이가 되어 있었다. “너만 기다린 건 아니야. 우리도 할 수 있는 일을 했어.” 허드렛일로 맺은 인연들이 작은 저항이 되었다.',choices:[{label:'모두의 매듭을 묶는다',detail:'붉은 매듭 유물 · 이미 있다면 45금',effect:'ribbon'},{label:'피난처에서 휴식한다',detail:'모든 동료 체력 20 회복',effect:'heal'}]},
 {title:'틈 너머의 목소리',subtitle:'서로 다른 세계에서 떨어진 기억 조각들.',text:'틈 속에서 설아는 도망치던 자신의 목소리를 듣는다. 아리아가 어깨에 손을 얹는다. “돌아왔잖아. 지금 여기 있는 네가 답이야.” 리라의 빛이 흩어진 기억을 하나로 묶는다.',choices:[{label:'약속을 검에 새긴다',detail:'덱의 카드 1장 강화',effect:'upgrade'},{label:'서로의 손을 놓지 않는다',detail:'모든 동료 체력 20 회복',effect:'heal'}]}
];
export function cardInfo(instance) {
 const card=CARDS[instance.id];
 return {...card,id:instance.id,family:card.owner==='seol'?'wuxia':'fantasy',name:card.name+(instance.upgraded?' +':''),damage:card.damage?card.damage+(instance.upgraded?3:0):0,block:card.block?card.block+(instance.upgraded?3:0):0,heal:card.heal?card.heal+(instance.upgraded?3:0):0};
}

// Player-selected payoff for the party's alternating card sequence.
export const ULTIMATES = {
 eclipse:{id:'eclipse',name:'월영천광',owner:'seol',family:'wuxia',type:'합격절기',cost:0,damage:32,weak:1,art:'moon',text:'선택한 적 피해 32. 약화 1턴. 합격 게이지 100 소비.',flavor:'검과 별이, 한 번의 참격으로.',ultimate:true},
 astral:{id:'astral',name:'천체연쇄',owner:'lyra',family:'fantasy',type:'합격절기',cost:0,damage:20,all:true,weak:2,art:'nova',text:'모든 적 피해 20. 약화 2턴. 합격 게이지 100 소비.',flavor:'세 사람의 약속이 하늘을 깨운다.',ultimate:true},
 sanctuary:{id:'sanctuary',name:'서광성역',owner:'aria',family:'fantasy',type:'합격절기',cost:0,block:22,heal:8,art:'fortress',text:'생존 동료 모두 방어 22와 회복 8. 합격 게이지 100 소비.',flavor:'이 빛 안에서는 누구도 홀로 서지 않는다.',ultimate:true}
};
