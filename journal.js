'use strict';
// Photo journals have their own IndexedDB store, keeping photos out of the plan's localStorage quota.
(() => {
  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const today = () => globalThis.GrowthWeather.dayKey();
  const blank = () => ({version:1,months:{},entries:[]});
  const tags = ['日常','小猫','穿搭','风景'];
  let state=blank(), month=today().slice(0,7), filter='', db, ready=false, error='', busy=false, ui, opened=false;
  let happyAnchor=today(), happyMonth='';
  const art = '<svg viewBox="0 0 120 100" fill="none" aria-hidden="true"><rect x="19" y="12" width="82" height="73" rx="5" fill="#fffdf8" stroke="#bda6a0" stroke-width="2" transform="rotate(-7 60 50)"/><rect x="29" y="20" width="64" height="48" rx="3" fill="#f2e9df"/><circle cx="75" cy="32" r="7" fill="#e8ca98"/><path d="m29 60 18-21 14 15 10-10 22 24H29" fill="#c4cdb4"/><path d="m42 80 7 2m6-1 19-2" stroke="#c5b1aa" stroke-width="2" stroke-linecap="round"/></svg>';
  const entries = (m=month) => state.entries.filter(e=>e.date.startsWith(m)).sort((a,b)=>a.date.localeCompare(b.date)||a.id.localeCompare(b.id));
  const notes = () => state.months[month] || {caption:'',joys:'',review:'',coverId:''};
  const button = (action,text,cls='secondary',extra='') => `<button type="button" class="${cls}" data-journal="${action}" ${extra}>${text}</button>`;
  const disabled = () => !ready||!!error||busy?'disabled':'';
  const imageValid = image => typeof image==='string' && image.length<=260000 && /^data:image\/(jpeg|webp|png);base64,[A-Za-z0-9+/]+={0,2}$/.test(image);
  const validDay = s => {if(typeof s!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(s)||s<'1900-01-01'||s>'2100-12-31')return false;const d=new Date(`${s}T12:00:00`);return !isNaN(d)&&`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`===s;};
  const validate = data => GrowthData.validateJournal(data);
  async function init(options) {
    ui=options;let hadLocal=false;
    try {
      db=await new Promise((resolve,reject)=>{const req=indexedDB.open('upward.photo-journal.v1',1);req.onupgradeneeded=()=>req.result.createObjectStore('journal');req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error);req.onblocked=()=>reject(new Error('请关闭其他旧版网页后刷新'));});
      const saved=await new Promise((resolve,reject)=>{const req=db.transaction('journal').objectStore('journal').get('state');req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error);});
      hadLocal=!!saved;if(saved)state=validate(saved);
    } catch(e){error=`手账存储暂时无法使用：${e.message || '请检查浏览器存储权限'}。现有记录未被覆盖。`;}
    ready=true;ui.refresh();
    if(!error)GrowthLocal.register('journal',{
      read:()=>state,empty:blank,hasLocal:hadLocal,validate,export:download,
      apply:async next=>{
        validate(next);
        busy=true;ui.refresh();
        try{
          await new Promise((resolve,reject)=>{const tx=db.transaction('journal','readwrite');tx.objectStore('journal').put(next,'state');tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error);});
          state=next;
        }finally{busy=false;ui.refresh();}
      }
    });
  }
  async function commit(next,message) {
    if(!ready||error||busy)return false;
    busy=true;
    try {
      await new Promise((resolve,reject)=>{const tx=db.transaction('journal','readwrite');tx.objectStore('journal').put(next,'state');tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error);});
      state=next;GrowthLocal.changed('journal');busy=false;ui.close();ui.refresh();ui.toast(message);return true;
    }catch{ui.toast('手账未保存成功，可能是存储空间不足。请导出备份后重试。');return false;}
    finally{busy=false;}
  }
  function coverFace(m,mini=false){return `<img class="diary-leather-photo" src="./assets/journal/leather-notebook.png" alt="棕色皮质搭扣手账本" decoding="async">`;}
  function home() {
    const m=today().slice(0,7);
    return `<section id="home-journal" class="journal-home card"><button class="diary-mini" data-journal="open-current" aria-label="查看生活手账封面">${coverFace(m,true)}</button><div><span class="home-kicker">MY LITTLE MEMORIES</span><h2>我的${Number(m.slice(5))}月 · 生活手账</h2><p>照片和心情，都藏在合上的书里。准备好了，再轻轻翻开。</p></div><button class="secondary" data-journal="open-current">查看封面 ${ui?.icon('right')||'→'}</button></section>`;
  }
  function render(){
    if(opened)return renderPages();
    return `<div class="journal-toolbar"><div class="journal-month-control">${button('prev',ui.icon('left'),'icon-btn',`aria-label="上个月" ${month==='1900-01'?'disabled':''}`)}<label class="journal-month-label"><span>${month.slice(0,4)} 年</span><strong>${Number(month.slice(5))} 月</strong><input type="month" value="${month}" min="1900-01" max="2100-12" aria-label="选择手账月份"></label>${button('next',ui.icon('right'),'icon-btn',`aria-label="下个月" ${month==='2100-12'?'disabled':''}`)}${button('current','回到本月','text-btn')}</div></div><section class="diary-shelf" aria-label="合上的生活手账"><div class="diary-book-stage"><header class="diary-object-heading"><h2>随手记一记</h2><p>照片和心情，想记就记</p></header><div class="diary-object"><button class="diary-closed" data-journal="open-book" aria-label="翻开${esc(month)}生活手账" ${disabled()}>${coverFace(month)}</button></div><div class="happy-book-caption"><button class="diary-open-button" data-journal="open-book" ${disabled()}>翻开这个月 ${ui.icon('right')}</button><p class="diary-shelf-note">${ui.icon('lock')}离开此页自动合上</p></div></div>${happyStack()}${error?`<p class="storage-warning" role="alert">${esc(error)}</p>`:!ready?'<p role="status">正在准备你的手账…</p>':''}</section>`;
  }
  function happyStack(){
    if(happyMonth!==month){happyMonth=month;happyAnchor=today().startsWith(month)?today():month+'-01';}
    const days=GrowthData.happyWeekDays(happyAnchor).filter(validDay),start=days[0],end=days.at(-1);
    const short=d=>`${Number(d.slice(5,7))}.${Number(d.slice(8))}`;
    return `<section class="happy-companion" aria-labelledby="happy-title"><header class="diary-object-heading"><h2 id="happy-title">今天的小开心</h2><p>每天存下三件小快乐</p></header><div class="happy-stationery"><div class="happy-paper-stack" aria-label="本周日期便签，点击日期展开">${days.map((day,i)=>`<button class="happy-date-paper paper-${i}" data-journal="happy-day" data-day="${day}" aria-label="${day} 开心便签${state.happyDays?.[day]?'，已记录':'，未记录'}" ${disabled()}><time datetime="${day}">${day.slice(5,7)}月${day.slice(8)}日</time></button>`).join('')}</div></div><div class="happy-book-caption"><div class="happy-week-nav"><button class="icon-btn" data-journal="happy-prev" aria-label="开心便签上一周" ${start<='1900-01-01'?'disabled':''}>${ui.icon('left')}</button><span>${start.slice(0,4)} · ${short(start)} — ${short(end)}</span><button class="icon-btn" data-journal="happy-next" aria-label="开心便签下一周" ${end>='2100-12-31'?'disabled':''}>${ui.icon('right')}</button></div><div class="happy-stack-actions">${button('happy-today','记下今天','primary',disabled())}${button('happy-week','本周回顾 ↗','text-btn',disabled())}</div></div></section>`;
  }
  function happyDayModal(day){
    if(!validDay(day))return;
    const original=Object.hasOwn(state.happyDays||{},day)?day:'',things=state.happyDays?.[day]||['','',''];
    ui.open('每日三件开心的事',`<form id="happy-day-form" class="happy-note-editor">${ui.field('便签日期 · 可以修改',`<input name="date" type="date" value="${day}" min="1900-01-01" max="2100-12-31" required>`)}<p class="happy-editor-intro">不用很特别，让你笑了一下也值得写下来。</p>${things.map((text,i)=>ui.field(`0${i+1} · 一件开心的事`,`<textarea name="joy${i}" rows="2" maxlength="1000" placeholder="${['今天有什么让你开心？','还有一个小小的好瞬间…','再收集一件喜欢的事吧'][i]}">${esc(text)}</textarea>`)).join('')}<p class="happy-form-error" role="alert"></p><div class="modal-actions">${original?button('happy-delete','删除便签','secondary danger',`data-day="${original}"`):''}<button type="button" class="secondary" data-action="close-modal">取消</button><button class="primary" type="submit">收好这张便签</button></div></form>`);
    const form=document.querySelector('#happy-day-form');
    form.addEventListener('submit',async event=>{
      event.preventDefault();if(busy)return;
      const fields=new FormData(form),date=String(fields.get('date'));
      try{
        const next=GrowthData.withHappyDay(state,original,date,[0,1,2].map(i=>String(fields.get(`joy${i}`))));
        form.querySelector('[type="submit"]').disabled=true;
        const saved=await commit(next,'三件小快乐，已经收好了');
        if(saved){month=date.slice(0,7);happyMonth=month;happyAnchor=date;ui.refresh();}
        else form.querySelector('[type="submit"]').disabled=false;
      }catch(e){form.querySelector('[role="alert"]').textContent=e.message;}
    });
  }
  function happyWeekModal(){
    const days=GrowthData.happyWeekDays(happyAnchor).filter(validDay),key=days[0];
    const count=days.filter(d=>state.happyDays?.[d]?.some(t=>t.trim())).length;
    ui.open('回看这一周的小快乐',`<form id="happy-week-form"><p class="happy-week-range">${days[0]} — ${days.at(-1)} · 已记录 ${count} 天</p><div class="happy-week-reading">${days.map((d,i)=>`<section><time datetime="${d}">${Number(d.slice(5,7))}/${Number(d.slice(8))} · 周${'一二三四五六日'[new Date(d+'T12:00:00').getDay()===0?6:new Date(d+'T12:00:00').getDay()-1]}</time>${state.happyDays?.[d]?.some(t=>t.trim())?`<ol>${state.happyDays[d].map(t=>`<li>${esc(t)||'<span class="happy-unwritten">还没写</span>'}</li>`).join('')}</ol>`:'<p class="happy-unwritten">这一天还没有留下小快乐。</p>'}</section>`).join('')}</div>${ui.field('本周最想记住的事 · 自己整理',`<textarea name="summary" rows="4" maxlength="4000" placeholder="挑几件最喜欢的事，或写下这一周的感受。不急着总结，也可以先空着。">${esc(state.happyWeeks?.[key]||'')}</textarea>`)}<p class="happy-form-error" role="alert"></p><div class="modal-actions"><button class="secondary" type="button" data-action="close-modal">合上</button><button class="primary" type="submit">保存本周回顾</button></div></form>`);
    const form=document.querySelector('#happy-week-form');
    form.addEventListener('submit',async event=>{
      event.preventDefault();if(busy)return;
      const next=structuredClone(state);next.happyWeeks={...next.happyWeeks,[key]:String(new FormData(form).get('summary')).trim()};
      try{validate(next);form.querySelector('[type="submit"]').disabled=true;if(!await commit(next,'这一周的快乐，已经收好了'))form.querySelector('[type="submit"]').disabled=false;}
      catch(e){form.querySelector('[role="alert"]').textContent=e.message;}
    });
  }
  function renderPages() {
    const list=entries(),n=notes(),cover=list.find(e=>e.id===n.coverId)||list[0],cat=list.filter(e=>e.tag==='小猫').at(-1),visible=filter?list.filter(e=>e.tag===filter):list;
    return `<div class="journal-toolbar"><div class="journal-month-control">${button('prev',ui.icon('left'),'icon-btn',`aria-label="上个月" ${month==='1900-01'?'disabled':''}`)}<label class="journal-month-label"><span>${month.slice(0,4)} 年</span><strong>${Number(month.slice(5))} 月</strong><input type="month" value="${month}" min="1900-01" max="2100-12" aria-label="选择手账月份"></label>${button('next',ui.icon('right'),'icon-btn',`aria-label="下个月" ${month==='2100-12'?'disabled':''}`)}${button('current','回到本月','text-btn')}</div><div class="journal-tools">${button('close-book',ui.icon('lock')+'合上手账','secondary')}${button('export','导出手账','text-btn',disabled())}${button('import','导入手账','text-btn',disabled())}${button('add',`${ui.icon('plus')}收藏一张照片`,'primary',disabled())}</div></div>${error?`<p class="storage-warning" role="alert">${esc(error)}</p>`:''}${!ready?'<p role="status">正在打开你的回忆本…</p>':''}<section class="journal-book" aria-label="${esc(month)}月度照片手账"><div class="journal-binding" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i><i></i></div><div class="journal-book-heading"><div><span class="home-kicker">A MONTH OF LITTLE JOYS</span><h2>把平凡的日子，过成喜欢的样子</h2></div><span class="journal-page-number">${month.slice(5)}<small> / ${month.slice(0,4)}</small></span></div><div class="journal-top-grid"><section class="journal-cover"><div class="journal-tape" aria-hidden="true"></div>${cover?`<button class="journal-cover-photo" data-journal="edit" data-id="${esc(cover.id)}" aria-label="编辑月度封面照片"><img src="${esc(cover.image)}" alt="${esc(cover.note||'本月封面')}" decoding="async"></button>`:`<button class="journal-cover-blank" data-journal="add" ${disabled()}>${art}<strong>这一页，等一个喜欢的瞬间</strong><span>点这里上传本月第一张照片</span></button>`}<div class="journal-cover-caption"><span>MONTHLY COVER</span><p>${esc(n.caption||'一张照片，一句心情，就是这个月的开场。')}</p>${button('notes',ui.icon('edit'),'icon-btn',`aria-label="编辑月份寄语" ${disabled()}`)}</div></section><div class="journal-side"><section class="journal-cat-note"><div>${cat?`<img src="${esc(cat.image)}" alt="我的小猫" decoding="async">`:ui.cat()}<span>WITH MY CAT</span></div><h3>${cat?'本月的猫猫营业中':'给我的小猫留个位置'}</h3><p>${cat?'把一起发呆、晒太阳的日常，都收进回忆里。':'上传真实的小猫照片，选「小猫」标签，它就会出现在这里。'}</p>${button('cat',cat?'再收藏一个猫猫瞬间':'加入我的小猫','text-btn',disabled())}</section><section class="journal-note"><span class="journal-note-label">✧ 本月采购清单</span><p class="journal-written">${esc(n.joys||'这个月需要买些什么？\n日用品、猫粮，或一直想添置的小物件，先记在这里。')}</p>${button('notes','写下要买的 '+ui.icon('edit'),'text-btn',disabled())}</section></div></div><section class="journal-wall"><div class="journal-wall-heading"><div><span class="journal-handwriting">little moments</span><p>${list.length} 个瞬间 · 慢慢收藏，慢慢喜欢</p></div><div class="journal-filters" role="group" aria-label="照片分类">${['',...tags].map(t=>button('filter',t||'全部',`journal-chip ${filter===t?'active':''}`,`data-tag="${esc(t)}" aria-pressed="${filter===t}"`)).join('')}</div></div><div class="journal-photo-grid">${visible.map((e,i)=>`<article class="journal-polaroid"><div class="journal-tape" aria-hidden="true"></div><button class="journal-photo-open" data-journal="edit" data-id="${esc(e.id)}" aria-label="编辑照片：${esc(e.note||e.date)}"><img src="${esc(e.image)}" alt="${esc(e.note||e.tag+'照片')}" loading="lazy" decoding="async"></button><div class="journal-photo-meta"><time datetime="${e.date}">${e.date.slice(5).replace('-',' / ')}</time><span>${esc(e.tag)}${cover?.id===e.id?' · 封面':''}</span></div><p>${esc(e.note||'给这个瞬间写一句小记…')}</p><div class="journal-photo-actions">${button('cover','设为封面','text-btn',`data-id="${esc(e.id)}" ${disabled()}`)}${button('edit',ui.icon('edit'),'icon-btn',`data-id="${esc(e.id)}" aria-label="编辑照片小记" ${disabled()}`)}</div></article>`).join('')}${!visible.length?`<div class="journal-photo-empty"><span>♡</span><p>${filter?'这个分类还没有照片':'这个月的故事，从第一张照片开始'}</p><small>猫猫的睡姿 · 路边的花 · 今天的穿搭</small>${button('add',ui.icon('plus')+'添加照片','secondary',disabled())}</div>`:`<button class="journal-add-tile" data-journal="add" ${disabled()}>${ui.icon('plus')}<span>再留住一个瞬间</span><small>照片 + 一句小记</small></button>`}</div></section><section class="journal-reflection"><div><span class="home-kicker">DEAR ME, THIS MONTH</span><h3>这个月，想记住的事</h3><p class="journal-written">${esc(n.review||'最喜欢的一天、一个新发现，或想对自己说的话。\n等月底翻到这里，给这个月留一封短短的信。')}</p></div>${button('notes',ui.icon('edit')+'写月末回顾','secondary',disabled())}</section><div class="journal-book-footer"><span>生活很可爱，你也是 ♡</span><span>${month} · memories</span></div></section><p class="journal-storage-note">照片和小记只保存在当前设备。可在「数据与备份」导出含照片的完整备份，也可用「导出手账」单独备份这本手账。清理数据或换手机前请先备份。</p>`;
  }
  function photoModal(id='',tag='') {
    if(!ready||error)return;
    const entry=state.entries.find(e=>e.id===id),date=entry?.date||(today().startsWith(month)?today():month+'-01');
    let draft=entry?.image||'',processing=false,epoch=0;
    ui.open(entry?'编辑这个瞬间':'收藏一个小瞬间',`<form id="journal-photo-form"><div class="journal-upload-preview">${draft?`<img src="${esc(draft)}" alt="待保存照片预览">`:art}</div><label class="field"><span>选择照片</span><input name="photo" type="file" accept="image/jpeg,image/png,image/webp"><small>支持 JPG、PNG、WebP，单张最大 15MB；保存压缩副本，原图请自己保留。</small></label><div class="field-row">${ui.field('记录日期',`<input name="date" type="date" value="${date}" min="1900-01-01" max="2100-12-31" required>`)}${ui.field('属于哪种小美好',`<select name="tag">${tags.map(t=>`<option ${t===(entry?.tag||tag||filter)?'selected':''}>${t}</option>`).join('')}</select>`)}</div>${ui.field('一句照片小记',`<textarea name="note" rows="3" maxlength="500" placeholder="例如：今天也被这只小猫治愈了">${esc(entry?.note||'')}</textarea>`)}<p class="journal-upload-status" role="status"></p><div class="modal-actions">${entry?button('delete','删除照片','secondary danger',`data-id="${esc(entry.id)}"`):''}<button class="secondary" type="button" data-action="close-modal">取消</button><button class="primary" type="submit" ${draft?'':'disabled'}>保存瞬间</button></div></form>`);
    const form=document.querySelector('#journal-photo-form'),submit=form.querySelector('[type="submit"]'),status=form.querySelector('[role="status"]');
    form.elements.photo.addEventListener('change',async event=>{
      const file=event.target.files[0];if(!file)return;
      const current=++epoch;processing=true;submit.disabled=true;status.textContent='正在整理照片…';
      try{const image=await compress(file);if(current!==epoch||!form.isConnected)return;draft=image;form.querySelector('.journal-upload-preview').innerHTML=`<img src="${esc(draft)}" alt="待保存照片预览">`;status.textContent='照片准备好了，保存后会收进对应月份。';}
      catch(e){if(current===epoch)status.textContent=e.message;}
      finally{if(current===epoch){processing=false;submit.disabled=!draft;}}
    });
    form.addEventListener('submit',async event=>{
      event.preventDefault();if(processing||!draft||busy)return;
      const fields=new FormData(form),date=String(fields.get('date'));if(!validDay(date))return;
      if(!entry&&state.entries.length>=300){ui.toast('当前最多收藏 300 张照片，请先整理和备份');return;}
      const next=structuredClone(state),record={id:entry?.id||(globalThis.crypto?.randomUUID?.()||`${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`),date,tag:String(fields.get('tag')),note:String(fields.get('note')).trim(),image:draft};
      next.entries=next.entries.filter(e=>e.id!==record.id);next.entries.push(record);
      if(entry&&entry.date.slice(0,7)!==date.slice(0,7)){for(const n of Object.values(next.months))if(n.coverId===record.id)n.coverId='';}
      submit.disabled=true;const oldMonth=month;month=date.slice(0,7);filter='';
      if(!await commit(next,'这个瞬间，已经好好收藏了')){month=oldMonth;submit.disabled=false;}
    });
  }
  async function compress(file) {
    if(!['image/jpeg','image/png','image/webp'].includes(file.type)||file.size>15*1024*1024)throw new Error('请选择 15MB 以内的 JPG、PNG 或 WebP；HEIC 请先转成 JPG。');
    const url=URL.createObjectURL(file),image=new Image();
    try{
      await new Promise((resolve,reject)=>{image.onload=resolve;image.onerror=()=>reject(new Error('照片读取失败，请换一张图片'));image.src=url;});
      if(image.naturalWidth*image.naturalHeight>60000000)throw new Error('照片尺寸过大，请先缩小再选择');
      const scale=Math.min(1,1100/Math.max(image.naturalWidth,image.naturalHeight)),canvas=document.createElement('canvas');canvas.width=Math.max(1,Math.round(image.naturalWidth*scale));canvas.height=Math.max(1,Math.round(image.naturalHeight*scale));
      const ctx=canvas.getContext('2d');if(!ctx)throw new Error('当前浏览器无法处理照片');ctx.fillStyle='#fffaf5';ctx.fillRect(0,0,canvas.width,canvas.height);ctx.drawImage(image,0,0,canvas.width,canvas.height);
      for(const q of [.82,.65,.48,.32]){const result=canvas.toDataURL('image/jpeg',q);if(result.length<=260000)return result;}
      throw new Error('这张照片压缩后仍然较大，请裁剪后再选择');
    }finally{URL.revokeObjectURL(url);}
  }
  function notesModal() {
    const n=notes(),editingMonth=month;
    ui.open('写给这个月的几句话',`<form id="journal-notes-form">${ui.field('月份寄语 · 放在封面下方',`<input name="caption" maxlength="100" value="${esc(n.caption)}" placeholder="例如：和小猫一起，把日子过得暖暖的">`)}${ui.field('本月采购清单',`<textarea name="joys" rows="4" maxlength="2000" placeholder="一行记一件，例如：猫粮、洗衣液、笔记本">${esc(n.joys)}</textarea>`)}${ui.field('月末回顾',`<textarea name="review" rows="4" maxlength="2000">${esc(n.review)}</textarea>`)}<div class="modal-actions"><button class="secondary" type="button" data-action="close-modal">取消</button><button class="primary" type="submit">保存到这个月</button></div></form>`);
    document.querySelector('#journal-notes-form').addEventListener('submit',async event=>{event.preventDefault();if(busy)return;const fields=new FormData(event.target),next=structuredClone(state);next.months[editingMonth]={...n,caption:String(fields.get('caption')).trim(),joys:String(fields.get('joys')).trim(),review:String(fields.get('review')).trim()};await commit(next,'这个月的心情已保存');});
  }
  function download() {
    const url=URL.createObjectURL(new Blob([JSON.stringify(state)],{type:'application/json'})),a=document.createElement('a');a.href=url;a.download=`有“记”可循-照片手账-${today()}.json`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);ui.toast('手账备份已生成，包含全部月份照片、小记和开心便签');
  }
  function importJournal() {
    const input=document.createElement('input');input.type='file';input.accept='.json,application/json';input.addEventListener('change',async()=>{
      const file=input.files[0];if(!file)return;if(file.size>85*1024*1024){ui.toast('手账备份不能超过 85MB');return;}
      try{const next=validate(JSON.parse(await file.text()));ui.confirm('导入这本手账？',`包含 ${next.entries.length} 张照片和 ${Object.keys(next.happyDays||{}).length} 张开心便签，将替换当前全部月份的照片、手账文字、开心便签与周回顾。请先导出当前手账。计划、习惯等记录不受影响。`,()=>{void commit(next,'手账已导入');},'替换并导入');}catch(e){ui.toast(e instanceof SyntaxError?'请选择有效的手账 JSON 备份':e.message);}
    });input.click();
  }
  document.addEventListener('click',async event=>{
    const el=event.target.closest('[data-journal]');if(!el||el.disabled||!ui||busy)return;const action=el.dataset.journal,id=el.dataset.id;
    if(action==='open-book'){opened=true;ui.refresh();document.querySelector('[data-journal="close-book"]')?.focus({preventScroll:true});return;}
    if(action==='close-book'){opened=false;ui.refresh();document.querySelector('[data-journal="open-book"]')?.focus({preventScroll:true});return;}
    if(action==='open-current'){opened=false;month=today().slice(0,7);filter='';ui.navigate('journal');return;}
    if(action==='prev'||action==='next'){const [y,m]=month.split('-').map(Number),d=new Date(y,m-1+(action==='prev'?-1:1),1);const next=`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;if(validDay(next+'-01'))month=next;filter='';ui.refresh();document.querySelector(`[data-journal="${action}"]`)?.focus({preventScroll:true});return;}
    if(action==='current'){month=today().slice(0,7);filter='';ui.refresh();return;}
    if(action==='filter'){filter=el.dataset.tag;ui.refresh();return;}
    if(!ready||error)return;
    if(action==='happy-day'){happyDayModal(el.dataset.day);return;}
    if(action==='happy-today'){happyDayModal(today());return;}
    if(action==='happy-week'){happyWeekModal();return;}
    if(action==='happy-prev'||action==='happy-next'){
      const d=new Date(happyAnchor+'T12:00:00');d.setDate(d.getDate()+(action==='happy-prev'?-7:7));
      const day=`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
      if(validDay(day)){happyAnchor=day;ui.refresh();}return;
    }
    if(action==='happy-delete'){const day=el.dataset.day;ui.confirm('删除这张开心便签？','会移除当天的三件开心的事；本周回顾会保留。',()=>{const next=structuredClone(state);delete next.happyDays[day];void commit(next,'便签已移除');},'删除便签');return;}
    if(action==='home-cat'){month=today().slice(0,7);photoModal('','小猫');return;}
    if(action==='add'||action==='cat')photoModal('',action==='cat'?'小猫':'');
    if(action==='edit')photoModal(id);
    if(action==='notes')notesModal();
    if(action==='export')download();
    if(action==='import')importJournal();
    if(action==='cover'){const next=structuredClone(state);next.months[month]={...notes(),coverId:id};await commit(next,'本月封面已换好');}
    if(action==='delete')ui.confirm('删除这张照片？','这张照片及其小记会移除。原始照片不受影响；想保留时请先导出手账。',()=>{const next=structuredClone(state);next.entries=next.entries.filter(e=>e.id!==id);for(const n of Object.values(next.months))if(n.coverId===id)n.coverId='';void commit(next,'照片已移除');});
  });
  document.addEventListener('change',event=>{if(event.target.matches('.journal-month-label input')&&validDay(event.target.value+'-01')){month=event.target.value;filter='';ui.refresh();}});
  globalThis.GrowthJournal={init,render,home,validate,seal:()=>{opened=false;}};
})();
