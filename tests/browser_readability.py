"""Atlas separation, actor-attached HUDs, targeting and independent four-frame impacts."""
from playwright.sync_api import sync_playwright
from pathlib import Path
import os,json,shutil
ROOT=Path(__file__).resolve().parents[1]
with sync_playwright() as p:
 b=p.chromium.launch(executable_path=os.environ.get('CHROMIUM_PATH') or shutil.which('chromium'),headless=True,args=['--no-sandbox']);page=b.new_page(viewport={'width':1440,'height':900});errors=[];failed=[]
 page.add_init_script("localStorage.setItem('moonveil-profile','검증 여행자')")
 page.on('pageerror',lambda e:errors.append(str(e)));page.on('response',lambda r:failed.append(r.url) if r.status>=400 else None)
 page.goto(os.environ.get('GAME_URL','http://127.0.0.1:5173'),wait_until='networkidle')
 def fixture(status=True,boss=True,card='slash'):
  page.evaluate('''async ({status,boss,card})=>{const {Game}=await import('./src/engine.js');const g=new Game();g.recruit('lyra');g.recruit('aria');g.s.floor=4;g.init();if(boss)g.startBattle('boss');g.addCard(card);const chosen=g.s.deck.find(c=>c.id===card);g.s.battle.hand=[chosen];g.s.battle.draw=g.s.deck.filter(c=>c.uid!==chosen.uid);g.s.battle.discard=[];g.s.battle.enemies.forEach(e=>{e.hp=e.maxHp=200;e.attack=5;e.target=2;});if(status){g.s.party[0].block=15;g.s.party[0].burn=3;g.s.party[0].weak=2;g.s.party[1].frozen=1;g.s.battle.enemies[0].weak=2;g.s.battle.enemies[0].burn=2;}g.save(localStorage);}''',{'status':status,'boss':boss,'card':card})
  page.reload(wait_until='networkidle');page.locator('[data-action=resume]').click();page.locator('.resume-encounter [data-action=resumebattle]').click();page.wait_for_timeout(100)
 fixture()
 metadata=page.evaluate('''async()=>{const {sprites}=await import('./src/visuals.js');return {heroes:sprites.heroes.map(r=>r.map(s=>({w:s.w,h:s.h}))),enemies:sprites.enemies.map(r=>r.map(s=>({w:s.w,h:s.h})))};}''')
 assert len(metadata['heroes'])==3 and len(metadata['enemies'])==6
 assert all(len(r)==6 for r in metadata['heroes']+metadata['enemies'])
 assert metadata['heroes'][0][0]=={'w':234,'h':288},metadata
 assert metadata['enemies'][0][0]=={'w':201,'h':159},metadata
 assert metadata['enemies'][3][0]=={'w':224,'h':201},metadata
 seol=page.locator('.unit-panel[data-hero-id=seol]');lyra=page.locator('.unit-panel[data-hero-id=lyra]');aria=page.locator('.unit-panel[data-hero-id=aria]')
 assert '15' in seol.locator('.shield-count').inner_text()
 assert '화상 3' in seol.inner_text() and '약화 2턴' in seol.inner_text()
 assert '빙결 1턴' in lyra.inner_text()
 assert aria.evaluate("e=>e.classList.contains('is-targeted')")
 assert '아리아 공격' in page.locator('.enemy-intent').inner_text()
 aria.click();assert aria.get_attribute('aria-pressed')=='true' and seol.get_attribute('aria-pressed')=='false'
 page.screenshot(path=str(ROOT/'docs/v5-status.png'))
 for w,h in [(1440,900),(1366,768),(1000,900),(390,844)]:
  page.set_viewport_size({'width':w,'height':h});page.reload(wait_until='networkidle');page.locator('[data-action=resume]').click();page.locator('.resume-encounter [data-action=resumebattle]').click();page.wait_for_timeout(100)
  assert page.evaluate('document.documentElement.scrollWidth<=innerWidth')
  assert page.evaluate('''()=>{const top=document.querySelector('.combat-controls').getBoundingClientRect().top;return [...document.querySelectorAll('.unit-panel')].every(e=>{const r=e.getBoundingClientRect();return r.x>=0&&r.right<=innerWidth&&r.bottom<=top+1});}'''),(w,h)
  if w==390:page.screenshot(path=str(ROOT/'docs/v5-mobile.png'),full_page=True)
 page.set_viewport_size({'width':1440,'height':900});fixture(False)
 page.evaluate('''()=>{window.impactFrames=new Set();window.skills=new Set();const tick=()=>{const c=document.querySelector('.cast-layer');if(c?.dataset.phase==='impact')impactFrames.add(c.dataset.impactFrame);if(c?.dataset.phase==='projectile')skills.add(c.dataset.skillFrame);requestAnimationFrame(tick)};tick();}''')
 page.locator('.hand [data-action=play]').first.click();page.wait_for_selector('.cast-layer',state='detached')
 assert set(page.evaluate('[...impactFrames]'))>=set(map(str,range(4)))
 assert set(page.evaluate('[...skills]'))>=set(map(str,range(4)))
 page.evaluate('''()=>{window.enemyImpacts=new Set();const tick=()=>{const c=document.querySelector('#scene');if(c?.dataset.enemyImpactFrame)enemyImpacts.add(c.dataset.enemyImpactFrame);requestAnimationFrame(tick)};tick();}''')
 before_turn=page.evaluate("JSON.parse(localStorage.getItem('moonveil-save-v1'))");page.locator('[data-action=endturn]').click();page.wait_for_timeout(300);during=page.evaluate("JSON.parse(localStorage.getItem('moonveil-save-v1'))");assert during['party']==before_turn['party'] and during['battle']['turn']==before_turn['battle']['turn'];page.wait_for_timeout(1400)
 assert set(page.evaluate('[...enemyImpacts]'))>=set(map(str,range(4)))
 fixture(False,False,'frost');page.locator('.hand [data-action=play]').first.click();page.wait_for_selector('.cast-layer',state='detached')
 assert '빙결 1턴' in page.locator('.unit-panel.foe.active-unit').inner_text()
 assert '빙결 · 행동 불가' in page.locator('.enemy-info.selected').inner_text()
 fixture(False,False,'storm');page.locator('.hand [data-action=play]').first.click();page.wait_for_selector('.cast-layer',state='detached')
 assert page.locator('.unit-panel.foe .status-badge.burn').count()==2
 assert errors==[] and failed==[],(errors,failed)
 print(json.dumps({'result':'passed','isolated_poses':54,'flight_frames':4,'player_impact_frames':4,'enemy_impact_frames':4,'checks':['full original neutral extents','selected ally/enemy','shield count at feet','actor-specific statuses','enemy named target','HUD stays above hand','desktop/mobile width fit','real freeze and burn effects'],'errors':errors,'asset_failures':failed},ensure_ascii=False))
 b.close()
