from playwright.sync_api import sync_playwright
import os,shutil,json
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
with sync_playwright() as p:
    browser=p.chromium.launch(headless=True,executable_path=os.environ.get('CHROMIUM_PATH') or shutil.which('chromium') or None,args=['--no-sandbox'])
    page=browser.new_page(viewport={'width':1440,'height':1000})
    errors=[]
    page.on('pageerror',lambda e:errors.append(str(e)))
    page.goto('http://127.0.0.1:5174',wait_until='networkidle')
    assert page.locator('.game-card').count()==5
    def fixture(phase,chapter=0,floor=1):
        page.evaluate('''async ({phase,chapter,floor})=>{
            const {Game,SAVE_KEY}=await import('./src/engine.js');
            const g=new Game().init();g.s.chapter=chapter;g.s.floor=floor;
            if(['chapter','ending','reward'].includes(phase)){
                g.startBattle('boss');g.victory();
                if(phase==='chapter')g.claimReward(null);
                if(phase==='ending'){g.s.phase='chapter';g.nextChapter();}
            }else{g.s.phase=phase;g.s.battle=null;}
            g.save(localStorage);
        }''',{'phase':phase,'chapter':chapter,'floor':floor})
        page.reload(wait_until='networkidle')
    fixture('rest',0,3)
    page.locator('[data-action="campupgrade"]').click()
    page.locator('[data-action="upgrade"]').first.click()
    assert page.locator('.map-floor.now .floor-number').inner_text()=='05'
    saved=page.evaluate("JSON.parse(localStorage.getItem('moonveil-save-v1'))")
    assert any(c['upgraded'] for c in saved['deck'])
    fixture('shop',1,1)
    page.locator('[data-action="buy"]').first.click()
    assert '35' in page.locator('.gold').inner_text()
    page.locator('[data-action="shopremove"]').click()
    page.locator('[data-action="remove"]').first.click()
    assert '0' in page.locator('.gold').inner_text()
    saved=page.evaluate("JSON.parse(localStorage.getItem('moonveil-save-v1'))")
    assert len(saved['deck'])==14 and saved['phase']=='shop'
    page.locator('[data-action="leave"]').click()
    assert page.locator('.map-floor.now .floor-number').inner_text()=='03'
    fixture('event',1,3)
    page.locator('[data-action="event"][data-effect="upgrade"]').click()
    page.locator('[data-action="upgrade"]').first.click()
    assert page.locator('.map-floor.now .floor-number').inner_text()=='05'
    fixture('chapter',0,5)
    page.locator('[data-action="nextchapter"]').click()
    assert 'CHAPTER 02' in page.locator('.chapterbar').inner_text()
    fixture('chapter',3,5)
    page.locator('[data-action="nextchapter"]').click()
    assert '우리가 돌아갈 곳' in page.locator('#modal-title').inner_text()
    page.locator('[data-action="newconfirm"]').click()
    page.locator('[data-action="reset"]').click()
    assert page.locator('[data-action="play"]').count()==5
    page.locator('[data-action="settings"]').click()
    page.locator('#import-save').set_input_files({'name':'invalid.json','mimeType':'application/json','buffer':b'{"invalid":true}'})
    page.wait_for_timeout(200)
    assert '유효한 월영' in page.locator('#toast').inner_text()
    assert errors==[],errors
    print(json.dumps({'result':'passed','checks':['Node server','camp upgrade','shop purchase and removal','event upgrade','chapter transition','ending','reset','invalid import'],'browser_errors':errors},ensure_ascii=False))
    browser.close()
