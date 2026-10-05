"""Saved-state fixtures cover optional screens without completing four campaigns."""
from playwright.sync_api import sync_playwright
import os,shutil,json
with sync_playwright() as p:
    browser=p.chromium.launch(headless=True,executable_path=os.environ.get('CHROMIUM_PATH') or shutil.which('chromium') or None,args=['--no-sandbox'])
    page=browser.new_page(viewport={'width':1440,'height':1060})
    errors=[];page.add_init_script("localStorage.setItem('moonveil-profile','검증 여행자')")
    page.on('pageerror',lambda e:errors.append(str(e)))
    page.goto(os.environ.get('GAME_URL','http://127.0.0.1:5173'),wait_until='networkidle')
    def fixture(phase,chapter=0,floor=1):
        page.evaluate('''async ({phase,chapter,floor})=>{
            const {Game}=await import('./src/engine.js');
            const g=new Game();const {HEROES,STARTER}=await import('./src/data.js');delete g.s.journeyVersion;g.s.party=HEROES.map(h=>({...h,hp:h.maxHp,block:0}));g.s.deck=STARTER.map((id,i)=>({id,uid:i+1,upgraded:false}));g.s.nextUid=15;g.init();g.s.chapter=chapter;g.s.floor=floor;
            if(['chapter','ending','reward'].includes(phase)){
                g.startBattle('boss');g.victory();
                if(phase==='chapter')g.claimReward(null);
                if(phase==='ending'){g.s.phase='chapter';g.nextChapter();}
            }else{g.s.phase=phase;g.s.battle=null;}
            g.save(localStorage);
        }''',{'phase':phase,'chapter':chapter,'floor':floor})
        page.reload(wait_until='networkidle')
        page.locator('[data-action="resume"]').click()
        page.locator('.resume-encounter [data-action="continue"]').click()
    saved=lambda:page.evaluate("JSON.parse(localStorage.getItem('moonveil-save-v1'))")
    fixture('rest',0,3)
    page.locator('[data-action="campupgrade"]').click()
    page.locator('[data-action="upgrade"]').first.click()
    assert saved()['floor']==4 and any(c['upgraded'] for c in saved()['deck'])
    fixture('shop',1,1)
    page.locator('[data-action="buy"]').first.click()
    assert saved()['gold']==35
    page.locator('[data-action="shopremove"]').click()
    page.locator('[data-action="remove"]').first.click()
    assert saved()['gold']==0 and len(saved()['deck'])==14 and saved()['phase']=='shop'
    page.locator('[data-action="leave"]').click()
    assert saved()['floor']==2
    fixture('event',1,3)
    page.locator('[data-action="event"][data-effect="upgrade"]').click()
    page.locator('[data-action="upgrade"]').first.click()
    assert saved()['floor']==4
    fixture('chapter',0,5)
    page.locator('[data-action="nextchapter"]').click()
    assert saved()['chapter']==1 and page.locator('body').get_attribute('data-screen')=='stage'
    fixture('chapter',3,5)
    page.locator('[data-action="nextchapter"]').click()
    assert '우리가 돌아갈 곳' in page.locator('#modal-title').inner_text()
    page.locator('[data-action="newconfirm"]').click()
    page.locator('[data-action="reset"]').click()
    assert saved()['phase']=='map' and saved()['floor']==0 and page.locator('#scene').count()==0
    page.locator('[data-action="settings"]').click()
    page.locator('#import-save').set_input_files({'name':'invalid.json','mimeType':'application/json','buffer':b'{"invalid":true}'})
    page.wait_for_timeout(200)
    assert '유효한 월영' in page.locator('#toast').inner_text()
    assert errors==[],errors
    print(json.dumps({'result':'passed','checks':['camp upgrade','shop purchase/removal','event upgrade','chapter transition','ending','reset to stage','invalid import'],'browser_errors':errors},ensure_ascii=False))
    browser.close()
