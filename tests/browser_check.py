"""Real UI: profile, solo prologue, actual animation frames, story recruitment and maps."""
from playwright.sync_api import sync_playwright
from pathlib import Path
import os,json,shutil
ROOT=Path(__file__).resolve().parents[1]
with sync_playwright() as p:
 b=p.chromium.launch(executable_path=os.environ.get('CHROMIUM_PATH') or shutil.which('chromium'),headless=True,args=['--no-sandbox'])
 page=b.new_page(viewport={'width':1440,'height':900});errors=[];failed=[]
 page.on('pageerror',lambda e:errors.append(str(e)))
 page.on('response',lambda r:failed.append(r.url) if r.status>=400 else None)
 page.goto(os.environ.get('GAME_URL','http://127.0.0.1:5173'),wait_until='networkidle')
 assert page.locator('.star-sky .twinkle').count()==76
 assert page.locator('.title-party-art').count()==0
 page.screenshot(path=str(ROOT/'docs/v4-title.png'))
 page.locator('#traveler-name').fill('달빛 여행자');page.locator('#profile-form button').click()
 assert page.locator('.profile-welcome').inner_text().endswith('달빛 여행자')
 page.locator('[data-action=start]').click()
 saved=lambda:page.evaluate("JSON.parse(localStorage.getItem('moonveil-save-v1'))")
 assert len(saved()['party'])==1 and len(saved()['deck'])==8
 assert page.locator('.map-stop').count()==6 and page.locator('.map-paths path').count()==5
 poster=page.locator('.chapter-illustration').bounding_box();assert poster['width']/poster['height']>1.5
 page.screenshot(path=str(ROOT/'docs/v4-stage.png'),full_page=True)
 page.locator('[data-action=node]:not(:disabled)').first.click()
 assert page.locator('.combat-party .party-member').count()==1
 assert page.locator('.hand .game-card.fantasy').count()==0
 page.screenshot(path=str(ROOT/'docs/v4-battle.png'))
 page.evaluate('''()=>{window.frameProof={hero:new Set(),skill:new Set()};const tick=()=>{const s=document.querySelector('#scene'),c=document.querySelector('.cast-layer');if(s)frameProof.hero.add(s.dataset.heroAttackFrame);if(c&&c.dataset.phase!=='lift'&&c.dataset.phase!=='fracture')frameProof.skill.add(c.dataset.skillFrame);requestAnimationFrame(tick)};tick();}''')
 before=saved();page.locator('.hand [data-action=play]').first.click()
 page.wait_for_function("document.querySelector('.cast-layer')?.dataset.phase==='fracture'")
 assert saved()['battle']['energy']==3 and saved()['battle']['enemies'][0]['hp']==24
 page.keyboard.press('2');page.keyboard.press('Space')
 page.wait_for_selector('.cast-layer',state='detached')
 proof=page.evaluate('({hero:[...frameProof.hero],skill:[...frameProof.skill]})')
 assert set(proof['hero'])>=set(map(str,range(6))),proof
 assert set(proof['skill'])>=set(map(str,range(4))),proof
 assert saved()['battle']['enemies'][0]['hp']==15 and saved()['battle']['energy']==2
 page.evaluate('''()=>{window.enemyFrames=new Set();const tick=()=>{const s=document.querySelector('#scene');if(s)enemyFrames.add(s.dataset.enemyAttackFrame);requestAnimationFrame(tick)};tick();}''')
 page.locator('[data-action=endturn]').click();page.wait_for_timeout(1400)
 assert set(page.evaluate('[...enemyFrames]'))>=set(map(str,range(6)))
 # Complete the real first encounter with UI buttons.
 for _ in range(12):
  if saved()['phase']!='battle':break
  card=page.locator('.hand [data-action=play]:not(.unplayable)').first
  if card.count():card.click();page.wait_for_selector('.cast-layer',state='detached')
  else:page.locator('[data-action=endturn]').click();page.wait_for_timeout(1400)
 assert saved()['phase']=='reward'
 page.locator('[data-action=skipreward]').click()
 page.locator('[data-action=node]:not(:disabled)').first.click()
 assert saved()['phase']=='story'
 page.locator('[data-action=join]').click()
 assert [h['id'] for h in saved()['party']]==['seol','lyra'] and saved()['floor']==2
 # Prepare a valid map state at the next meeting, preserving real recruitment.
 page.evaluate('''()=>{const s=JSON.parse(localStorage.getItem('moonveil-save-v1'));s.floor=3;s.phase='map';s.battle=null;localStorage.setItem('moonveil-save-v1',JSON.stringify(s));}''')
 page.reload(wait_until='networkidle');page.locator('[data-action=resume]').click()
 page.locator('[data-action=node]:not(:disabled)').first.click();page.locator('[data-action=join]').click()
 assert [h['id'] for h in saved()['party']]==['seol','lyra','aria']
 page.locator('[data-action=story]').first.click();assert page.locator('.chronicle-stop').count()==5
 page.wait_for_timeout(300);page.screenshot(path=str(ROOT/'docs/v4-story.png'))
 page.keyboard.press('Escape')
 page.set_viewport_size({'width':390,'height':844});page.reload(wait_until='networkidle');page.locator('[data-action=resume]').click()
 assert page.evaluate('document.documentElement.scrollWidth<=innerWidth'), 'mobile map page overflow'
 page.screenshot(path=str(ROOT/'docs/v4-mobile.png'),full_page=True)
 assert errors==[] and failed==[],(errors,failed)
 print(json.dumps({'result':'passed','frames':proof,'enemy_attack_frames':6,'checks':['local profile','solo start','no unrecruited cards','landscape journey art','connected route map','connected story map','Lyra/Aria ordered recruitment','input lock and impact timing','mobile overflow'],'errors':errors,'asset_failures':failed},ensure_ascii=False))
 b.close()
