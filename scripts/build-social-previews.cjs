/* Render actual project artwork into share cards. Serve site/ locally first. */
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright-core');
const fs=require('fs'),path=require('path');
const root=path.resolve(__dirname,'..'),config=JSON.parse(fs.readFileSync(path.join(root,'docs/social-previews.json')));
const origin=process.env.PORTFOLIO_PREVIEW_ORIGIN||'http://localhost:8766';
const escape=s=>s.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
(async()=>{const browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH||'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});const page=await browser.newPage({viewport:{width:1200,height:630},deviceScaleFactor:1});
for(const item of config.projects){
 const home=item.slug==='portfolio',brass=['sarabesh','dwellers'].includes(item.slug),mint=item.slug==='frey';
 const art=home?'<div class="montage">'+['assets/covers/rancourt.webp','assets/covers/digital-hub.webp','assets/covers/sarabesh.webp','dwellers/assets/dwellers-cover.png'].map(a=>'<img src="'+origin+'/'+a+'">').join('')+'</div>':'<img class="art" src="'+origin+'/'+item.art+'">';
 const html='<!doctype html><html><head><meta charset="utf-8"><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Grandstander:wght@600&family=Inter+Tight:wght@500;600&display=swap"><style>'+ 
 '@font-face{font-family:Rye;src:url('+origin+'/sarabesh/assets/fonts/Rye-Regular.ttf)}*{box-sizing:border-box}body{margin:0;width:1200px;height:630px;background:#f1f5f6;color:#223640;font-family:"Inter Tight",sans-serif;display:flex}.copy{width:600px;padding:58px 58px 44px;display:flex;flex-direction:column;background:radial-gradient(#bdcdd2 1px,transparent 1px) 0 0/28px 28px}.brand{display:flex;align-items:center;gap:15px;font-size:23px}.brand img{width:58px;height:58px;object-fit:contain}h1{font:600 '+(item.title.length>22?'55':'68')+'px/1.12 Grandstander,sans-serif;letter-spacing:-1.7px;margin:auto 0 22px}p{font-size:29px;line-height:1.35;margin:0;max-width:465px}.footer{font-size:23px;margin-top:auto;padding-top:30px;color:#2c6e7e}.art{width:600px;height:630px;object-fit:cover;object-position:center}.montage{width:600px;height:630px;display:grid;grid-template-columns:1fr 1fr;gap:16px;padding:26px 26px 26px 4px;align-content:center}.montage img{width:277px;height:277px;object-fit:cover;border:9px solid white;box-shadow:0 4px 12px #22364018}.montage img:nth-child(odd){rotate:-2deg}.montage img:nth-child(even){rotate:2deg}'+
 (brass?'body{background:#14291f;color:#efd9a2}.copy{background:radial-gradient(#bc975c22 1px,transparent 1px) 0 0/28px 28px}h1{font-family:Rye,serif;font-weight:400;letter-spacing:-1px}.footer{color:#cfad71}':'')+
 (mint?'body{background:#d9fff7;color:#00665c}.copy{background:radial-gradient(#00b8ab30 1px,transparent 1px) 0 0/28px 28px}.footer{color:#008f86}':'')+
 '</style></head><body><section class="copy"><div class="brand"><img src="'+origin+'/assets/inkpromptu-logo.png"><span>Sandy Tayts</span></div><h1>'+escape(item.title)+'</h1><p>'+escape(item.summary)+'</p><div class="footer">sandy.tayts.com</div></section>'+art+'</body></html>';
 await page.setContent(html,{waitUntil:'networkidle'});await page.evaluate(()=>Promise.all([document.fonts.ready,...[...document.images].map(i=>i.decode())]));
 const destination=path.join(root,'site',item.image);await page.screenshot({path:destination,type:'jpeg',quality:91});console.log(item.slug);
}await browser.close()})().catch(e=>{console.error(e);process.exit(1)});
