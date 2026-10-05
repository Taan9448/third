"""Real UI regression checks; run npm start first, then python tests/browser_check.py."""
from playwright.sync_api import sync_playwright
import json, os, shutil
from pathlib import Path
ROOT = Path(__file__).resolve().parents[1]
URL = os.environ.get('GAME_URL', 'http://127.0.0.1:5173')
with sync_playwright() as p:
    browser = p.chromium.launch(headless=True, executable_path=os.environ.get('CHROMIUM_PATH') or shutil.which('chromium') or None, args=['--no-sandbox'])
    page = browser.new_page(viewport={'width':1440, 'height':1060}, device_scale_factor=1)
    errors=[]; failed=[]
    page.on('pageerror', lambda e: errors.append(str(e)))
    page.on('response', lambda r: failed.append(r.url) if r.status >= 400 else None)
    page.goto(URL, wait_until='networkidle')
    assert page.locator('body').get_attribute('data-screen') == 'title'
    assert page.locator('#scene, .hand, .route-list').count() == 0
    assert page.locator('[data-action="resumebattle"]').is_disabled()
    assert page.evaluate('document.fonts.check("16px Galmuri")')
    page.screenshot(path=str(ROOT/'docs/v2-title.png'), full_page=True)
    page.locator('[data-action="start"]').click()
    assert page.locator('body').get_attribute('data-screen') == 'stage'
    assert page.locator('#scene, .hand').count() == 0
    assert page.locator('.route-row').count() == 6
    page.screenshot(path=str(ROOT/'docs/v2-stage.png'), full_page=True)
    page.locator('[data-action="node"]:not(:disabled)').first.click()
    assert page.locator('body').get_attribute('data-screen') == 'battle'
    assert page.locator('.route-list').count() == 0
    assert page.locator('.hand .game-card').count() == 5
    assert page.evaluate('''() => [...document.querySelectorAll('.hand .game-card')].every(c => c.querySelector('.card-details p').getBoundingClientRect().bottom <= c.querySelector('.card-bottom').getBoundingClientRect().top)''')
    page.screenshot(path=str(ROOT/'docs/v2-battle.png'), full_page=True)
    saved=lambda: page.evaluate("JSON.parse(localStorage.getItem('moonveil-save-v1'))")
    before=saved(); target=before['battle']['selected']
    enemy_hp=lambda s: next(e['hp'] for e in s['battle']['enemies'] if e['uid']==target)
    page.locator('.hand [data-action="play"]').first.click()
    page.wait_for_function("document.querySelector('.cast-layer')?.dataset.phase === 'fracture'")
    assert enemy_hp(saved()) == enemy_hp(before)
    assert saved()['battle']['energy'] == 3
    page.screenshot(path=str(ROOT/'docs/v2-fracture.png'))
    page.keyboard.press('2'); page.keyboard.press('Space')  # Input is locked during casting.
    page.wait_for_function("document.querySelector('.cast-layer')?.dataset.phase === 'projectile'")
    assert enemy_hp(saved()) == enemy_hp(before)
    assert saved()['battle']['turn'] == 1
    page.screenshot(path=str(ROOT/'docs/v2-projectile.png'))
    page.wait_for_function("document.querySelector('.cast-layer')?.dataset.phase === 'impact'")
    assert enemy_hp(saved()) == enemy_hp(before)-9
    assert saved()['battle']['energy'] == 2
    page.wait_for_timeout(120)
    page.screenshot(path=str(ROOT/'docs/v2-impact.png'))
    page.wait_for_selector('.cast-layer', state='detached')
    assert page.locator('.hand .game-card').count() == 4
    page.locator('[data-action="map"]').click()
    assert page.locator('#scene, .hand').count() == 0
    page.locator('.resume-encounter [data-action="resumebattle"]').click()
    page.locator('[data-action="deck"]').click()
    assert page.locator('.collection-grid .game-card').count() == 14
    page.keyboard.press('Escape')
    page.locator('[data-action="story"]').click()
    assert page.locator('.story-entry').count() == 5
    page.keyboard.press('Escape')
    page.locator('[data-action="endturn"]').click()
    page.wait_for_timeout(750)
    assert saved()['battle']['turn'] == 2 and saved()['battle']['energy'] == 3
    page.reload(wait_until='networkidle')
    assert page.locator('body').get_attribute('data-screen') == 'title'
    page.locator('[data-action="resume"]').click()
    page.locator('.resume-encounter [data-action="resumebattle"]').click()
    assert '02' in page.locator('.turn-counter').inner_text()
    # Play the stock opening encounter through actual buttons.
    for _ in range(15):
        if page.locator('.modal').count(): break
        while page.locator('.hand [data-action="play"]:not([aria-disabled="true"])').count():
            page.locator('.hand [data-action="play"]:not([aria-disabled="true"])').first.click()
            page.wait_for_timeout(1650)
            if page.locator('.modal').count(): break
        if page.locator('.modal').count(): break
        page.locator('[data-action="endturn"]').click(); page.wait_for_timeout(750)
    assert '새로운 가능성' in page.locator('#modal-title').inner_text()
    assert page.locator('body').get_attribute('data-screen') == 'interlude'
    assert page.locator('#scene, .hand').count() == 0
    page.locator('[data-action="skipreward"]').click()
    page.locator('[data-action="node"][data-type="event"]:not(:disabled)').click()
    page.locator('[data-action="event"]').first.click()
    assert page.locator('[data-action="node"]:not(:disabled)').count() == 2
    mobile=browser.new_page(viewport={'width':390,'height':844},device_scale_factor=1,is_mobile=True,has_touch=True)
    mobile.on('pageerror',lambda e:errors.append(str(e)))
    mobile.goto(URL,wait_until='networkidle')
    assert mobile.evaluate('document.documentElement.scrollWidth<=innerWidth')
    mobile.locator('[data-action="start"]').click()
    assert mobile.evaluate('document.documentElement.scrollWidth<=innerWidth')
    mobile.locator('[data-action="node"]:not(:disabled)').first.click()
    mobile.screenshot(path=str(ROOT/'docs/v2-mobile.png'),full_page=True)
    assert mobile.evaluate('document.documentElement.scrollWidth<=innerWidth')
    mobile.locator('[data-action="target"]').last.click()
    mobile.locator('.hand [data-action="play"]').first.click()
    mobile.wait_for_timeout(1650)
    mobile.locator('[data-action="deck"]').click()
    assert mobile.locator('.collection-grid .game-card').count() == 14
    assert mobile.evaluate('document.documentElement.scrollWidth<=innerWidth')
    mobile.keyboard.press('Escape')
    mobile.locator('[data-action="map"]').click()
    assert mobile.locator('.route-list').is_visible()
    # Reduced motion has no shatter, but still spends exactly once.
    reduced=browser.new_page(viewport={'width':1000,'height':900},reduced_motion='reduce')
    reduced.goto(URL,wait_until='networkidle')
    reduced.locator('[data-action="start"]').click()
    reduced.locator('[data-action="node"]:not(:disabled)').first.click()
    reduced.locator('.hand [data-action="play"]').first.click()
    reduced.wait_for_timeout(400)
    assert reduced.locator('.cast-layer').count()==0
    assert '2' in reduced.locator('.energy-orb').inner_text()
    assert errors==[] and failed==[], {'errors':errors, 'failed_assets':failed}
    print(json.dumps({'result':'passed','checks':['separate title/stage/battle','bundled pixel font/assets','card text fit','fracture/projectile/impact','damage only at impact','casting input lock','targeting','turn','save resume','deck/story','actual victory/reward/event','390px overflow','reduced motion'], 'browser_errors':errors,'failed_assets':failed},ensure_ascii=False))
    browser.close()
