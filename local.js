'use strict';
(() => {
  const channels=new Map(),B=GrowthBackup;
  let ui,registration=null,offlineReady=false,installed=matchMedia('(display-mode: standalone)').matches||navigator.standalone===true;
  let installEvent=null,registrationError='',recovery=null,recoveryDB=null,busy=false,updateReady=false,persisted=false;
  const secure=globalThis.isSecureContext===true;
  const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  let resolveReady;
  const ready=new Promise(resolve=>{resolveReady=resolve;});
  async function register(name,provider){channels.set(name,provider);if(channels.has('growth')&&channels.has('journal'))resolveReady();paint();}
  function changed(){paint();}
  function configure(options){ui=options;}
  function download(value,name){
    const file=new File([JSON.stringify(value)],name,{type:'application/json'}),url=URL.createObjectURL(file),a=document.createElement('a');
    a.href=url;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),60000);
  }
  async function openRecovery(){
    if(recoveryDB)return recoveryDB;
    recoveryDB=await new Promise((resolve,reject)=>{const r=indexedDB.open('upward.private-recovery.v1',1);r.onupgradeneeded=()=>r.result.createObjectStore('snapshots');r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);r.onblocked=()=>reject(new Error('请关闭旧页面后重试备份'));});
    return recoveryDB;
  }
  async function readRecovery(){const db=await openRecovery();return new Promise((resolve,reject)=>{const r=db.transaction('snapshots').objectStore('snapshots').get('before-import');r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);});}
  async function saveRecovery(value){const db=await openRecovery();await new Promise((resolve,reject)=>{const tx=db.transaction('snapshots','readwrite');tx.objectStore('snapshots').put(value,'before-import');tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error);});recovery=value;paint();}
  function capture(){
    if(!channels.has('growth')||!channels.has('journal'))throw new Error('数据尚未完整读取，请稍后重试；如有读取异常，请先使用分项导出');
    const p={};for(const key of B.PREF_KEYS)p[key]=localStorage.getItem(key);
    return B.create(channels.get('growth').read(),channels.get('journal').read(),p);
  }
  async function applyPreferences(p){for(const key of B.PREF_KEYS){if(p[key]==null)localStorage.removeItem(key);else localStorage.setItem(key,p[key]);}ui.preferencesChanged();}
  const io={capture,saveRecovery,applyGrowth:value=>channels.get('growth').apply(value),applyJournal:value=>channels.get('journal').apply(value),applyPreferences};
  async function exportAll(){try{const value=capture();download(value,`有“记”可循-完整备份-${new Date().toISOString().slice(0,10)}.json`);ui.toast('完整备份已生成，含照片；请在下载或「文件」中确认保存');}catch(e){ui.toast(e.message||'备份未能生成，请使用分项导出保留原始记录');}}
  function importAll(){
    if(busy)return;
    if(recovery?.status==='pending'){ui.toast('上次导入尚未处理，请先导出或恢复导入前副本');return;}
    const input=document.createElement('input');input.type='file';input.accept='.json,application/json';
    input.addEventListener('change',async()=>{
      const file=input.files[0];if(!file)return;if(file.size>100*1024*1024){ui.toast('备份超过 100MB，请检查文件');return;}
      try{
        const value=B.validate(JSON.parse(await file.text()));capture();
        ui.confirm('用完整备份替换本机记录？',`包含 ${value.growth.tasks.length} 条待办、${value.growth.habits.length} 个习惯、${value.growth.yearlyGoals.length} 个年度心愿、${value.growth.books.length} 本书、${value.growth.readingExcerpts.length} 则阅读摘抄、${value.growth.health.records.length} 条身体记录（含健康卡）和 ${value.journal.entries.length} 张照片、${Object.keys(value.journal.happyDays||{}).length} 张开心便签。全部月份、每周回顾及偏好会一起替换。导入前会先在本机保存恢复副本。`,()=>void runRestore(value),'替换并导入');
      }catch(e){ui.toast(e instanceof SyntaxError?'文件无法解析，请选择完整备份 JSON':e.message);}
    });input.click();
  }
  async function runRestore(value){
    if(busy)return;busy=true;ui.close();ui.open('正在恢复本机记录','<p class="modal-description" role="status">正在保存恢复副本并写入照片，请保持当前页面打开。</p>');paint();
    try{await B.restore(value,io);ui.close();ui.refresh();ui.toast('完整备份已恢复，仅保存在当前设备');}
    catch(e){ui.close();ui.refresh();ui.toast(e.message);}
    finally{busy=false;paint();}
  }
  async function restoreRecovery(){
    if(!recovery||busy)return;
    try{
      const value=B.validate(recovery.backup);
      ui.confirm('恢复导入前副本？','将替换当前计划、照片和偏好。建议先下载当前完整备份，确认需要恢复后再继续。',async()=>{
        if(busy)return;busy=true;ui.close();paint();
        try{await io.applyJournal(value.journal);await io.applyGrowth(value.growth);await applyPreferences(value.preferences);await saveRecovery({...recovery,status:'recovered'});ui.refresh();ui.toast('已恢复到导入前');}
        catch(e){ui.toast('未能完成恢复，副本仍保留；请先下载副本后重试');}
        finally{busy=false;paint();}
      },'恢复副本');
    }catch(e){ui.toast(e.message);}
  }
  function status(){return !secure?'需 HTTPS 才能离线安装':offlineReady?(navigator.onLine?'离线已就绪':'离线使用中'):registrationError?'离线准备失败':'正在准备离线…';}
  function settings(){
    return `<section class="card private-app-card"><div class="private-app-art" aria-hidden="true">✿</div><div><span class="home-kicker">MY PRIVATE LITTLE APP</span><h2>只在这台设备，留住小小日常</h2><p>计划、打卡和照片都保存在本机，不连接电脑，也不上传记录。${installed?'你正在使用独立窗口版。':'添加到主屏幕，下次点图标就能打开。'}</p><div class="local-pills"><span>${esc(status())}</span><span>${persisted?'已获存储保留许可':'记得定期备份'}</span></div></div></section><div class="settings-grid"><section class="card settings-card"><div class="large-icon">↓</div><h2>一份备份，装下全部生活</h2><p>待办、习惯、倒计时、年度心愿、书单、阅读感想及摘抄、健康卡及身体记录、复盘、全部月份的照片手账、每日开心便签、每周回顾和自选菜单，一次导出。备份包含照片副本，请保存到你自己的「文件」里。</p><div class="setting-buttons"><button class="primary" data-local="export" ${busy?'disabled':''}>导出完整备份</button><button class="secondary" data-local="import" ${busy?'disabled':''}>恢复完整备份</button></div></section><section class="card settings-card"><div class="large-icon">♡</div><h2>放到手机主屏幕</h2><p>${secure?'等上方显示「离线已就绪」，再添加到主屏幕。首次安装后请试一次飞行模式。':'当前地址无法启用离线缓存。iPhone 首次安装需要通过 Safari 打开 HTTPS 地址；电脑 localhost 可用于离线测试。'}</p><div class="setting-buttons"><button class="primary" data-local="install">${installed?'查看安装状态':'添加到主屏幕'}</button><button class="secondary" data-local="persist">申请保留本机数据</button></div><p class="local-footnote">保留许可不能防止手动清理或卸载导致的数据丢失，备份仍然需要。</p></section></div>${recovery?`<section class="card local-recovery"><h2>${recovery.status==='pending'?'上次导入未完成':'保留了一份导入前副本'}</h2><p>副本保存时间：${esc(new Date(recovery.savedAt).toLocaleString('zh-CN'))}。可以先下载检查，再决定是否恢复。</p><div class="setting-buttons"><button class="secondary" data-local="export-recovery">下载导入前副本</button><button class="secondary" data-local="restore-recovery" ${busy?'disabled':''}>恢复导入前副本</button></div></section>`:''}`;
  }
  function paint(){
    const badge=document.querySelector('[data-local-status]');if(badge)badge.textContent=status();
    const panel=document.querySelector('#local-panel');if(panel)panel.innerHTML=recovery?.status==='pending'?'<div class="storage-warning">上次完整导入未完成，导入前副本仍在本机。请到「数据与备份」下载或恢复副本。</div>':'';
    const node=document.querySelector('#local-settings');if(node&&!node.contains(document.activeElement)){const html=settings();if(node.innerHTML!==html)node.innerHTML=html;}
    const update=document.querySelector('#app-update');if(update)update.hidden=!updateReady;
  }
  function install(){
    if(installEvent){const event=installEvent;installEvent=null;void event.prompt();return;}
    ui.open('把「有“记”可循」放到主屏幕',`<div class="install-guide"><div class="install-cat" aria-hidden="true">🐾</div><h3>${installed?'已经在独立窗口中啦':'以后，点小图标就能进来'}</h3><p class="modal-description">${!secure?'当前是普通 HTTP 地址，暂不能启用完整离线功能。请先打开安装用的 HTTPS 地址。':offlineReady?'页面已保存好离线资源。添加后请打开一次，再用飞行模式检查。':'离线资源还在准备，请联网保持页面打开，准备完成后再安装。'}</p><ol><li><strong>iPhone / iPad：</strong>用 Safari 打开，点「分享」→「添加到主屏幕」；若出现「作为网页 App 打开」，保持开启。</li><li><strong>安卓：</strong>用支持安装的浏览器，在菜单里选「安装应用」或「添加到主屏幕」。</li><li><strong>电脑：</strong>用 Edge / Chrome 地址栏的安装按钮，或浏览器菜单中的安装入口。</li></ol><p class="modal-description">不同设备分别保存记录。Safari 与主屏幕 App 的数据是否共用取决于系统版本；请在最终使用的入口记录，迁移时用完整备份。</p><button class="primary" data-action="close-modal">知道啦</button></div>`);
  }
  async function checkOffline(){
    if(!('caches' in globalThis)||!registration)return;
    try{const response=await fetch('./offline-files.json',{cache:'no-store'});if(response.ok){const files=await response.json();const keys=await caches.keys();const activeKey=keys.includes(files.cache)?files.cache:null;if(activeKey){const cache=await caches.open(activeKey);offlineReady=(await Promise.all(files.files.map(p=>cache.match(new URL(p,location.href),{ignoreSearch:true})))).every(Boolean);}}}
    catch{if(navigator.serviceWorker.controller)navigator.serviceWorker.controller.postMessage({type:'CHECK_OFFLINE'});}
    paint();
  }
  async function start(){
    try{recovery=await readRecovery();}catch(e){registrationError='恢复副本存储暂不可用';}
    if(navigator.storage?.persisted)try{persisted=await navigator.storage.persisted();}catch{}
    if(secure&&'serviceWorker' in navigator){
      try{
        registration=await navigator.serviceWorker.register('./sw.js',{updateViaCache:'none'});
        await navigator.serviceWorker.ready;await checkOffline();
        navigator.serviceWorker.addEventListener('message',event=>{if(event.data?.type==='OFFLINE_STATUS'){offlineReady=event.data.ready;paint();}});
        navigator.serviceWorker.addEventListener('controllerchange',()=>{updateReady=true;void checkOffline();paint();});
        navigator.serviceWorker.controller?.postMessage({type:'CHECK_OFFLINE'});
      }catch(e){registrationError='离线缓存准备失败，请联网刷新后重试';}
    }
    paint();
  }
  window.addEventListener('beforeinstallprompt',event=>{event.preventDefault();installEvent=event;paint();});
  window.addEventListener('appinstalled',()=>{installed=true;paint();});
  window.addEventListener('online',()=>{paint();void checkOffline();});window.addEventListener('offline',paint);
  document.addEventListener('click',async event=>{
    const button=event.target.closest('[data-local]');if(!button||button.disabled)return;
    const action=button.dataset.local;
    if(action==='install')install();if(action==='export')void exportAll();if(action==='import')importAll();
    if(action==='export-recovery'&&recovery)download(recovery.backup,'有“记”可循-导入前完整副本.json');
    if(action==='restore-recovery')void restoreRecovery();
    if(action==='reload')location.reload();
    if(action==='persist'){
      try{persisted=!!(await navigator.storage?.persist?.());ui.toast(persisted?'已获存储保留许可，请继续定期备份':'浏览器未授予保留许可，请定期导出完整备份');paint();}catch{ui.toast('当前浏览器不支持此功能，请使用完整备份');}
    }
  });
  globalThis.GrowthLocal={register,changed,configure,start,paint,settings,install,exportAll,ready,get locked(){return busy;}};
})();
