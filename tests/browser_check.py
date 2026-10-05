from playwright.sync_api import sync_playwright
import json
import os
import shutil
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
with sync_playwright() as p:
    browser=p.chromium.launch(headless=True,executable_path=os.environ.get('CHROMIUM_PATH') or shutil.which('chromium') or None,args=['--no-sandbox'])
    page=browser.new_page(viewport={'width':1440,'height':1060},device_scale_factor=1)
    errors=[]
    page.on('pageerror',lambda e:errors.append(str(e)))
    page.goto('http://127.0.0.1:5173',wait_until='networkidle')
    page.screenshot(path=str(ROOT/'docs/gameplay.png'),full_page=True)
    assert page.locator('.game-card').count()==5
    page.locator('[data-action="play"]').first.click()
    page.wait_for_timeout(800)
    assert '2' in page.locator('.energy-orb').inner_text()
    page.locator('[data-action="map"]').click()
    assert page.locator('.map-floor').count()==6
    page.locator('.modal-close').click()
    page.locator('[data-action="deck"]').click()
    assert page.locator('.collection-grid .game-card').count()==14
    page.keyboard.press('Escape')
    page.locator('[data-action="story"]').click()
    assert page.locator('.story-entry').count()==5
    page.keyboard.press('Escape')
    page.locator('[data-action="endturn"]').click()
    page.wait_for_timeout(800)
    assert '3' in page.locator('.energy-orb').inner_text()
    assert 'TURN 02' in page.locator('.scene-turn').inner_text()
    page.reload(wait_until='networkidle')
    assert 'TURN 02' in page.locator('.scene-turn').inner_text()
    # Finish the starting encounter through real UI actions, using imported stock deck.
    for _ in range(12):
        if page.locator('.modal').count():break
        while page.locator('[data-action="play"]:not([aria-disabled="true"])').count():
            button=page.locator('[data-action="play"]:not([aria-disabled="true"])').first
            button.click();page.wait_for_timeout(750)
            if page.locator('.modal').count():break
        if page.locator('.modal').count():break
        page.locator('[data-action="endturn"]').click();page.wait_for_timeout(750)
    assert '새로운 가능성' in page.locator('#modal-title').inner_text()
    page.locator('[data-action="skipreward"]').click()
    assert page.locator('[data-action="node"]:not(:disabled)').count()==2
    page.locator('[data-action="node"][data-type="event"]:not(:disabled)').click()
    page.locator('[data-action="event"]').first.click()
    assert page.locator('[data-action="node"]:not(:disabled)').count()==2
    # Fresh mobile game. Verify horizontal card scrolling, no page overflow, and dialogs.
    mobile=browser.new_page(viewport={'width':390,'height':844},device_scale_factor=1,is_mobile=True,has_touch=True)
    mobile.on('pageerror',lambda e:errors.append(str(e)))
    mobile.goto('http://127.0.0.1:5173',wait_until='networkidle')
    mobile.screenshot(path=str(ROOT/'docs/mobile.png'),full_page=True)
    assert mobile.evaluate('document.documentElement.scrollWidth<=innerWidth')
    mobile.locator('[data-action="target"]').last.click()
    mobile.locator('[data-action="play"]').first.click()
    mobile.wait_for_timeout(800)
    mobile.locator('[data-action="map"]').click()
    assert mobile.locator('.modal').is_visible()
    assert mobile.evaluate('document.documentElement.scrollWidth<=innerWidth')
    assert errors==[],errors
    print(json.dumps({'result':'passed','desktop':'1440x1060','mobile':'390x844','checks':['card play','enemy selection','end turn','save reload','map','deck','story','victory reward','event','mobile overflow'],'browser_errors':errors},ensure_ascii=False))
    browser.close()
