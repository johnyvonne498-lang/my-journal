'use strict';
globalThis.GrowthHealth=(()=>{
  let ui,opened=false,tab='card',sheet=0,kind='全部',imageDraft='',imageBusy=false,imageToken=0;
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const health=()=>ui.read().health||GrowthData.emptyHealth();
  const reminderList=()=>ui.read().countdowns.filter(r=>r.group==='health').sort((a,b)=>a.targetAt-b.targetAt);
  const dateLabel=s=>`${Number(s.slice(5,7))}月${Number(s.slice(8))}日`;
  const tabs=[['card','01','我的健康卡'],['records','02','身体小记录'],['reminders','03','健康小提醒']];
  function seal(){opened=false;imageToken++;imageBusy=false;imageDraft='';ui?.close();}
  function render(){
    if(!opened)return `<section class="health-room health-closed" aria-label="合上的健康档案"><div class="health-cover-scene"><div class="health-paper health-paper-back" aria-hidden="true"></div><div class="health-paper health-paper-front" aria-hidden="true"></div><button class="health-folder" data-health="open" aria-label="打开身体小档案"><span class="health-folder-tab">FOR MYSELF</span><span class="health-cover-label"><span class="health-cover-cross" aria-hidden="true">＋</span><small>MY HEALTH NOTES</small><strong>身体小档案</strong><span>关于身体的事，慢慢记下来。</span><i>轻轻点开 · 收好每一次照顾</i></span><span class="health-folder-band" aria-hidden="true"></span><span class="health-cover-stamp" aria-hidden="true">好好<br>照顾自己</span></button><div class="health-cover-cat" aria-hidden="true">${GrowthCats.art('lounge')}</div><span class="health-cover-caption">我的身体，也值得被认真照顾 ♡</span></div><div class="health-cover-intro"><span class="health-eyebrow">A LITTLE CARE FOR ME</span><h2>给身体，留一个小抽屉。</h2><p>不用每天填。需要的时候，<br>来这里记一笔、找一找。</p><ol>${tabs.map(([id,n,label])=>`<li><span>${n}</span><div><strong>${label}</strong><small>${({card:'过敏、用药和需要留意的事',records:'看诊、体检和检查单照片',reminders:'复查、洗牙和下一次体检'})[id]}</small></div></li>`).join('')}</ol><button class="health-open-link" data-health="open">打开我的档案 ${ui.icon('right')}</button><small class="health-cover-note">${ui.icon('lock')}内容收在里面，点击才展开。</small></div></section>`;
    return `<section class="health-room health-opened" aria-label="身体小档案"><header class="health-desk-heading"><div><span class="health-eyebrow">MY HEALTH NOTES</span><h2>一点点，照顾好自己</h2></div><button class="secondary" data-health="seal">${ui.icon('lock')}合上档案</button></header><div class="health-open-folder"><nav class="health-tabs" aria-label="健康档案分类">${tabs.map(([id,n,label])=>`<button data-health="tab" data-health-tab="${id}" aria-pressed="${tab===id}" class="${tab===id?'active':''}"><small>${n}</small>${label}</button>`).join('')}</nav><div class="health-inner-paper">${tab==='card'?renderCard():tab==='records'?renderRecords():renderReminders()}</div></div><p class="health-storage-note">${ui.icon('lock')}仅保存在本机，包含在完整备份中。合上只是收起内容，不是密码锁。</p></section>`;
  }
  function renderCard(){
    const card=health().card,fields=[['allergies','过敏与不耐受','药物、食物，或其他需要留意的过敏'],['medications','正在用的药','药名、用法，或医生的叮嘱'],['notes','需要留意的小事','既往情况、日常注意事项……']];
    return `<header class="health-paper-heading"><div><span>PERSONAL HEALTH CARD</span><h3>我的健康卡</h3><p>想到什么就记一点，空着也没关系。</p></div><button class="health-ink-button" data-health="card-edit">${ui.icon('edit')}写一写</button></header><dl class="health-card-fields">${fields.map(([key,title,hint])=>`<div><dt>${title}</dt><dd class="${card[key]?'':'is-empty'}">${card[key]?esc(card[key]):'还没填写 · '+hint}</dd></div>`).join('')}</dl><div class="health-card-bottom">${GrowthCats.art('paw')}<span>不着急，按自己的需要慢慢补充。</span></div>`;
  }
  function renderRecords(){
    const records=health().records.filter(r=>kind==='全部'||r.kind===kind).sort((a,b)=>b.date.localeCompare(a.date));
    const pages=Math.max(1,Math.ceil(records.length/8));sheet=Math.max(0,Math.min(sheet,pages-1));
    return `<header class="health-paper-heading"><div><span>LITTLE BODY NOTES</span><h3>身体小记录</h3><p>把时间、发生的事和医生的叮嘱收好。</p></div><button class="health-ink-button" data-health="record-add">${ui.icon('plus')}记一笔</button></header><div class="health-record-filters" role="group" aria-label="筛选身体记录">${['全部',...GrowthData.healthKinds].map(k=>`<button data-health="filter" data-health-kind="${k}" aria-pressed="${kind===k}" class="${kind===k?'active':''}">${k}</button>`).join('')}</div>${records.length?`<div class="health-record-list">${records.slice(sheet*8,sheet*8+8).map(r=>`<button class="health-record-row" data-health="record-view" data-health-id="${esc(r.id)}"><time datetime="${r.date}"><strong>${dateLabel(r.date)}</strong><small>${r.date.slice(0,4)}</small></time><span><small>${r.kind}${r.image?' · 有检查单照片':''}</small><strong>${esc(r.title)}</strong>${r.place?`<span>${esc(r.place)}</span>`:''}</span>${ui.icon('right')}</button>`).join('')}</div>${pages>1?`<div class="health-pagination"><button class="secondary" data-health="previous" ${sheet===0?'disabled':''}>上一页</button><span>${sheet+1} / ${pages}</span><button class="secondary" data-health="next" ${sheet===pages-1?'disabled':''}>下一页</button></div>`:''}`:`<div class="health-empty-note">${ui.icon('note')}<h4>${kind==='全部'?'这里还没有身体记录':'还没有这类记录'}</h4><p>一次看诊、一张检查单，<br>或者某天身体的小变化，都可以记在这里。</p><button class="text-btn" data-health="record-add">＋ 写下第一笔</button></div>`}`;
  }
  function renderReminders(){
    const items=reminderList();
    return `<header class="health-paper-heading"><div><span>A LITTLE REMINDER</span><h3>健康小提醒</h3><p>下次复查、洗牙或体检，提前记着。</p></div><button class="health-ink-button" data-health="reminder-add">${ui.icon('plus')}添个提醒</button></header>${items.length?`<div class="health-reminder-list">${items.map(r=>`<button class="health-reminder" data-health="reminder-edit" data-health-id="${esc(r.id)}"><span class="health-reminder-mark">${ui.icon('calendar')}</span><span><strong>${esc(r.title)}</strong><small>${esc(ui.formatTime(r.targetAt))}</small></span><span class="health-reminder-status">${r.reminded?r.acknowledged?'已确认':'已到提醒时间':`还有 ${Math.max(0,Math.ceil((r.targetAt-Date.now())/86400000))} 天`}</span></button>`).join('')}</div>`:`<div class="health-empty-note">${ui.icon('calendar')}<h4>暂时没有安排</h4><p>把下一次需要照顾自己的日子，<br>交给小提醒记着。</p><button class="text-btn" data-health="reminder-add">＋ 记住一个日子</button></div>`}<div class="health-reminder-note">${ui.icon('clock')}与「倒计时」共用提醒，不用重复添加。页面打开时提醒；关闭后不能保证准时通知，重新打开会补提醒。<button class="text-btn" data-page="countdown">去设置通知和提示音 ${ui.icon('right')}</button></div>`;
  }
  function actions(extra='',save='收好啦'){return `<div class="modal-actions">${extra}<button type="button" class="secondary" data-action="close-modal">先放一放</button><button class="primary" type="submit">${save}</button></div>`;}
  function editCard(){const c=health().card;ui.open('我的健康卡',`<form id="health-card-form">${[['allergies','过敏与不耐受'],['medications','正在用的药'],['notes','需要留意的小事']].map(([key,label])=>ui.field(label,`<textarea name="${key}" rows="3" maxlength="2000" placeholder="按需要填写，可以留空">${esc(c[key])}</textarea>`)).join('')}${actions()}</form>`);}
  function viewRecord(id){
    const r=health().records.find(r=>r.id===id);if(!r)return;
    ui.open(esc(r.title),`<article class="health-record-detail"><p class="health-detail-meta">${esc(r.date)} · ${r.kind}${r.place?' · '+esc(r.place):''}</p><p class="health-detail-text">${r.note?esc(r.note):'这次没有写备注。'}</p>${r.image?`<details class="health-attachment"><summary>查看检查单照片</summary><img src="${r.image}" alt="这次记录附带的检查单照片"></details>`:''}<div class="modal-actions"><button class="secondary" data-health="record-edit" data-health-id="${esc(r.id)}">${ui.icon('edit')}编辑记录</button><button class="primary" data-action="close-modal">收起来</button></div></article>`);
  }
  function editRecord(id){
    const r=health().records.find(r=>r.id===id)||{id:'',date:ui.today(),title:'',kind:'身体不适',place:'',note:'',image:''};imageToken++;imageDraft=r.image;imageBusy=false;
    ui.open(r.id?'补充这次记录':'给身体记一笔',`<form id="health-record-form"><input type="hidden" name="id" value="${esc(r.id)}"><div class="field-row">${ui.field('日期',`<input type="date" name="date" min="1900-01-01" max="2100-12-31" value="${esc(r.date)}" required>`)}${ui.field('记哪一类',`<select name="kind">${GrowthData.healthKinds.map(k=>`<option ${k===r.kind?'selected':''}>${k}</option>`).join('')}</select>`)}</div>${ui.field('这次的事',`<input name="title" maxlength="80" required value="${esc(r.title)}" placeholder="例如：年度体检、嗓子不舒服">`)}${ui.field('就诊地点（可不填）',`<input name="place" maxlength="120" value="${esc(r.place)}" placeholder="医院、诊所或科室">`)}${ui.field('记下的事（可不填）',`<textarea name="note" rows="4" maxlength="3000" placeholder="当时的感受、看诊结果、医生的交代……">${esc(r.note)}</textarea>`)}<label class="field"><span>检查单照片（可不放，每次一张）</span><input type="file" id="health-image-file" accept="image/jpeg,image/png,image/webp"><small>JPG / PNG / WebP，最大 10 MB，自动压缩后保存在本机。</small></label><div id="health-image-status" class="health-image-status" role="status">${r.image?'已附一张照片，保存后保留。':'还没附照片。'}</div><button type="button" class="text-btn" data-health="image-remove">移除附图</button>${actions(r.id?`<button type="button" class="secondary danger" data-health="record-delete" data-health-id="${esc(r.id)}">删除记录</button>`:'')}</form>`);
  }
  function commit(patch){try{ui.write(patch);return true;}catch(e){ui.toast(e.message||'保存失败，当前编辑还在，请先导出备份');return false;}}
  function saveHealth(next){if(!GrowthData.validHealth(next)){ui.toast('内容超出限制，请检查日期、文字或减少检查单照片后重试');return false;}return commit({health:next});}
  async function loadImage(input){
    const file=input.files?.[0];if(!file)return;const token=++imageToken;imageBusy=true;
    const status=document.getElementById('health-image-status'),isCurrent=()=>token===imageToken&&input.isConnected&&opened;
    if(status)status.textContent='正在压缩照片……';
    try{
      if(!['image/jpeg','image/png','image/webp'].includes(file.type)||file.size>10*1024*1024)throw Error('请选择 10 MB 以内的 JPG、PNG 或 WebP 照片');
      const url=URL.createObjectURL(file);let img;
      try{img=await new Promise((resolve,reject)=>{const i=new Image();i.onload=()=>resolve(i);i.onerror=()=>reject(Error('图片无法读取，请换一张照片'));i.src=url;});}finally{URL.revokeObjectURL(url);}
      let width=img.naturalWidth*Math.min(1,1600/img.naturalWidth,1600/img.naturalHeight),result='';
      for(let attempt=0;attempt<7;attempt++){
        const canvas=document.createElement('canvas');canvas.width=Math.max(1,Math.round(width));canvas.height=Math.max(1,Math.round(img.naturalHeight*width/img.naturalWidth));
        const ctx=canvas.getContext('2d');ctx.fillStyle='#fff';ctx.fillRect(0,0,canvas.width,canvas.height);ctx.drawImage(img,0,0,canvas.width,canvas.height);result=canvas.toDataURL('image/jpeg',.84);if(result.length<=260000)break;width*=.8;
      }
      if(result.length>260000)throw Error('照片仍然过大，请裁剪后再试');
      if(!isCurrent())return;imageDraft=result;status.textContent='照片准备好了，保存记录后一起收好。';
    }catch(e){if(isCurrent())status.textContent=e.message+'；之前的附图仍保留。';}
    finally{if(token===imageToken)imageBusy=false;}
  }
  function init(options){
    ui=options;
    document.addEventListener('click',event=>{
      const b=event.target.closest('[data-health]');if(!b||GrowthLocal.locked)return;
      const action=b.dataset.health,id=b.dataset.healthId;
      if(action==='open'){opened=true;ui.refresh();}
      if(action==='seal'){seal();ui.refresh();}
      if(!opened)return;
      if(action==='tab'&&tabs.some(([id])=>id===b.dataset.healthTab)){tab=b.dataset.healthTab;ui.refresh();}
      if(action==='card-edit')editCard();
      if(action==='record-add')editRecord();
      if(action==='record-view')viewRecord(id);
      if(action==='record-edit')editRecord(id);
      if(action==='filter'){kind=b.dataset.healthKind;sheet=0;ui.refresh();}
      if(action==='previous'||action==='next'){sheet+=action==='next'?1:-1;ui.refresh();}
      if(action==='image-remove'){imageToken++;imageBusy=false;imageDraft='';const status=document.getElementById('health-image-status');if(status)status.textContent='已移除待保存附图，保存记录后生效。';const input=document.getElementById('health-image-file');if(input)input.value='';}
      if(action==='record-delete')ui.confirm('删除这次身体记录？','这条记录和附带照片会一起移除，其他记录不受影响。',()=>{if(saveHealth({...health(),records:health().records.filter(r=>r.id!==id)})){ui.close();ui.refresh();ui.toast('记录已移除');}});
      if(action==='reminder-add')ui.countdown();
      if(action==='reminder-edit')ui.countdown(id);
    });
    document.addEventListener('change',event=>{if(event.target.id==='health-image-file'&&opened&&!GrowthLocal.locked)void loadImage(event.target);});
    document.addEventListener('submit',event=>{
      if(!['health-card-form','health-record-form'].includes(event.target.id))return;
      event.preventDefault();if(!opened||GrowthLocal.locked)return;const f=Object.fromEntries(new FormData(event.target));
      if(event.target.id==='health-card-form'){
        const card=Object.fromEntries(['allergies','medications','notes'].map(k=>[k,String(f[k]||'').trim()]));
        if(saveHealth({...health(),card})){ui.close();ui.refresh();ui.toast('健康卡已收好');}return;
      }
      if(imageBusy){ui.toast('照片还在处理中，请稍等再保存');return;}
      const old=health().records.find(r=>r.id===f.id);if(f.id&&!old){ui.toast('记录已不存在，请重新打开');return;}
      if(!old&&health().records.length>=1000){ui.toast('最多保存 1000 条身体记录，请先整理');return;}
      const r={id:old?.id||ui.uid(),date:f.date,kind:f.kind,title:String(f.title||'').trim(),place:String(f.place||'').trim(),note:String(f.note||'').trim(),image:imageDraft};
      if(!GrowthData.validHealthRecord(r)){ui.toast('请填写有效日期和记录名称，并检查文字长度');return;}
      const records=old?health().records.map(item=>item.id===r.id?r:item):[r,...health().records];
      if(saveHealth({...health(),records})){tab='records';kind='全部';sheet=0;imageToken++;ui.close();ui.refresh();ui.toast('身体记录已收好');}
    });
  }
  return {init,render,seal};
})();
