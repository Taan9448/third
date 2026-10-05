"""Technique families, every effect branch, ultimate choices and compact desktop UI."""
from playwright.sync_api import sync_playwright
from pathlib import Path
import json,os,shutil
ROOT=Path(__file__).resolve().parents[1]
URL=os.environ.get('GAME_URL','http://127.0.0.1:5173')
with sync_playwright() as p:
 browser=p.chromium.launch(headless=True,executable_path=os.environ.get('CHROMIUM_PATH') or shutil.which('chromium') or None,args=['--no-sandbox'])
 page=browser.new_page(viewport={'width':1440,'height':900});errors=[]
 page.add_init_script("localStorage.setItem('moonveil-profile','검증 여행자')")
 page.on('pageerror',lambda e:errors.append(str(e)))
 page.goto(URL,wait_until='networkidle')
 def fixture(card='slash',charge=0,boss=False):
  page.evaluate('''async ({card,charge,boss})=>{
   const {Game}=await import('./src/engine.js');const g=new Game();const {HEROES,STARTER}=await import('./src/data.js');delete g.s.journeyVersion;g.s.party=HEROES.map(h=>({...h,hp:h.maxHp,block:0}));g.s.deck=STARTER.map((id,i)=>({id,uid:i+1,upgraded:false}));g.s.nextUid=15;g.init();if(boss){g.s.chapter=3;g.startBattle('boss');}
   if(!g.s.deck.some(c=>c.id===card))g.addCard(card);
   const chosen=g.s.deck.find(c=>c.id===card);g.s.battle.hand=[chosen];g.s.battle.draw=g.s.deck.filter(c=>c.uid!==chosen.uid);g.s.battle.discard=[];
   g.s.battle.linkCharge=charge;g.s.battle.qi=6;g.s.battle.mana=6;g.s.battle.enemies.forEach(e=>{e.hp=e.maxHp=500;e.attack=0;});g.s.party.forEach(h=>h.hp=35);g.save(localStorage);
  }''',{'card':card,'charge':charge,'boss':boss})
  page.reload(wait_until='networkidle');page.locator('[data-action=resume]').click();page.locator('.resume-encounter [data-action=resumebattle]').click()
 saved=lambda:page.evaluate("JSON.parse(localStorage.getItem('moonveil-save-v1'))")
 cards=page.evaluate("async()=>Object.keys((await import('./src/data.js')).CARDS)")
 for card in cards:
  fixture(card)
  before=saved();page.locator('.hand [data-action=play]').first.hover()
  assert page.locator('.card-preview').is_visible()
  page.locator('.hand [data-action=play]').first.click()
  page.wait_for_selector('.cast-layer')
  assert page.locator('.cast-layer').get_attribute('data-skill')==card
  assert page.locator('.card-shard').count()==24
  page.wait_for_selector('.cast-layer',state='detached',timeout=10000)
  assert saved()['battle']['energy']==before['battle']['energy']-page.evaluate('''async id=>(await import('./src/data.js')).CARDS[id].cost''',card)
  assert not page.locator('#app').get_attribute('aria-busy')
 for id in ['eclipse','astral','sanctuary']:
  fixture('slash',100)
  page.locator('[data-action=ultimate]').click()
  assert page.locator('.ultimate-options .game-card').count()==3
  if id=='eclipse':page.screenshot(path=str(ROOT/'docs/v3-ultimate-menu.png'))
  page.locator(f'[data-action="ultimate-use"][data-card="{id}"]').click()
  page.wait_for_selector('.cast-layer')
  assert page.locator('.cast-layer').get_attribute('data-skill')==id
  assert page.locator('.modal').count()==0
  page.wait_for_selector('.cast-layer',state='detached',timeout=10000)
  state=saved();assert state['battle']['linkCharge']==0 and state['battle']['energy']==3
  if id=='eclipse':assert state['battle']['enemies'][0]['hp']==468 and state['battle']['enemies'][1]['hp']==500
  elif id=='astral':assert all(e['hp']==480 and e['weak']==2 for e in state['battle']['enemies'])
  else:assert all(h['hp']==43 and h['block']==22 for h in state['party'])
 fixture('moon',100,True)
 page.screenshot(path=str(ROOT/'docs/v3-boss.png'))
 assert page.locator('.boss-scene').is_visible()
 page.locator('[data-action=deck]').click()
 assert page.evaluate('''()=>[...document.querySelectorAll('.collection-grid .game-card')].every(c=>c.querySelector('p').offsetTop+c.querySelector('p').offsetHeight+c.querySelector('.card-details').offsetTop<=c.querySelector('.card-bottom').offsetTop)''')
 page.keyboard.press('Escape')
 for w,h in [(1440,900),(1366,768),(1000,900)]:
  page.set_viewport_size({'width':w,'height':h});page.reload(wait_until='networkidle');page.locator('[data-action=resume]').click();page.locator('.resume-encounter [data-action=resumebattle]').click()
  assert page.evaluate('document.documentElement.scrollWidth<=innerWidth && document.documentElement.scrollHeight<=innerHeight+1')
  rect=page.locator('.hand .game-card').first.bounding_box();assert rect['y']>=0 and rect['y']+rect['height']<=h
 assert errors==[],errors
 print(json.dumps({'result':'passed','techniques':len(cards),'ultimate_choices':3,'checks':['all spell branches','24 textured fragments','casting cleanup','no double resource spending','ultimate choice outcomes','card text fit in collection','boss screen','desktop 900/768px viewport fit'],'browser_errors':errors},ensure_ascii=False))
 browser.close()
