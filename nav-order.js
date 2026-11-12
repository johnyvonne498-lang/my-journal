'use strict';
(function(root){
  const KEY='upward.nav-order.v1';
  const defaults=['home','today','journal','books','health','countdown','wishes','hotspots','review','stats'];
  function validate(order){
    if(!Array.isArray(order)||order.length>defaults.length||new Set(order).size!==order.length||!order.every(id=>typeof id==='string'&&defaults.includes(id)))throw Error('栏目顺序格式不正确');
    return order;
  }
  function normalize(order){validate(order);return [...order,...defaults.filter(id=>!order.includes(id))];}
  function read(storage=root.localStorage){try{const raw=storage.getItem(KEY);return raw===null?[...defaults]:normalize(JSON.parse(raw));}catch{return [...defaults];}}
  function save(order,storage=root.localStorage){const next=normalize(order);storage.setItem(KEY,JSON.stringify(next));return next;}
  function move(order,id,target,after=false){
    const next=normalize(order);if(!next.includes(id)||!next.includes(target)||id===target)return next;
    next.splice(next.indexOf(id),1);next.splice(next.indexOf(target)+(after?1:0),0,id);return next;
  }
  function step(order,id,direction){
    const next=normalize(order),index=next.indexOf(id),target=index+direction;
    if(![-1,1].includes(direction)||index<0||target<0||target>=next.length)return next;
    [next[index],next[target]]=[next[target],next[index]];return next;
  }
  let ui,dragging='';
  const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  function rows(){
    const order=ui.current();
    return order.map((id,index)=>`<li class="nav-order-row" data-nav-row="${id}" draggable="true"><span class="nav-order-grip" aria-hidden="true">⠿</span><span class="nav-order-number" aria-hidden="true">${String(index+1).padStart(2,'0')}</span><span class="nav-order-name">${ui.icon(id)}<span>${esc(ui.name(id))}</span></span><span class="nav-order-moves"><button type="button" class="icon-btn" data-nav-order="up" data-nav-id="${id}" aria-label="上移${esc(ui.name(id))}" ${index===0?'disabled':''}>${ui.arrow('up')}</button><button type="button" class="icon-btn" data-nav-order="down" data-nav-id="${id}" aria-label="下移${esc(ui.name(id))}" ${index===order.length-1?'disabled':''}>${ui.arrow('down')}</button></span></li>`).join('');
  }
  function editor(){
    dragging='';ui.open('把常用的，放在顺手的位置',`<div class="nav-order-editor"><p class="nav-order-hint">电脑上拖动整行，或点击上下箭头。每次调整都会自动保存。</p><ol class="nav-order-list" id="nav-order-list" aria-label="栏目排序">${rows()}</ol><p class="nav-order-status" id="nav-order-status" role="status" aria-live="polite">手机可用上下箭头调整。</p><div class="modal-actions"><button type="button" class="secondary" data-nav-order="reset">恢复默认</button><button type="button" class="primary" data-action="close-modal">排好啦</button></div></div>`);
  }
  function apply(next,id='',direction=''){
    if(ui.locked())return;
    try{
      const saved=save(next);ui.apply(saved);ui.refresh();
      const list=document.getElementById('nav-order-list');if(list)list.innerHTML=rows();
      const status=document.getElementById('nav-order-status');if(status)status.textContent=id?`已保存：${ui.name(id)}排在第 ${saved.indexOf(id)+1} 位。`:'已恢复默认顺序。';
      if(id&&list){const row=list.querySelector(`[data-nav-row="${id}"]`),control=row?.querySelector(`[data-nav-order="${direction}"]:not(:disabled)`)||row?.querySelector('button:not(:disabled)');control?.focus({preventScroll:true});row?.scrollIntoView({block:'nearest'});}
    }catch(error){const status=document.getElementById('nav-order-status');if(status)status.textContent='未能保存，之前的顺序仍保留。';ui.toast('栏目顺序未能保存，请检查浏览器存储空间后重试');}
  }
  function clearDrag(){dragging='';document.querySelectorAll('.nav-order-row').forEach(row=>row.classList.remove('is-dragging','drop-before','drop-after'));}
  function init(options){
    ui=options;
    document.addEventListener('click',event=>{
      const b=event.target.closest('[data-nav-order]');if(!b||b.disabled||ui.locked())return;
      const action=b.dataset.navOrder,id=b.dataset.navId;
      if(action==='open')editor();
      if(action==='up'||action==='down')apply(step(ui.current(),id,action==='up'?-1:1),id,action);
      if(action==='reset')apply([...defaults]);
    });
    document.addEventListener('dragstart',event=>{
      const row=event.target.closest('[data-nav-row]');if(!row)return;
      if(ui.locked()){event.preventDefault();return;}dragging=row.dataset.navRow;
      event.dataTransfer.effectAllowed='move';event.dataTransfer.setData('text/plain',dragging);row.classList.add('is-dragging');
    });
    document.addEventListener('dragover',event=>{
      const row=event.target.closest('[data-nav-row]');if(!row||!dragging||ui.locked())return;
      event.preventDefault();event.dataTransfer.dropEffect='move';
      document.querySelectorAll('.nav-order-row').forEach(r=>r.classList.remove('drop-before','drop-after'));
      if(row.dataset.navRow!==dragging)row.classList.add(event.clientY>row.getBoundingClientRect().top+row.getBoundingClientRect().height/2?'drop-after':'drop-before');
    });
    document.addEventListener('drop',event=>{
      const row=event.target.closest('[data-nav-row]');if(!row||!dragging||ui.locked()){clearDrag();return;}
      event.preventDefault();const id=dragging,after=event.clientY>row.getBoundingClientRect().top+row.getBoundingClientRect().height/2,next=move(ui.current(),id,row.dataset.navRow,after);clearDrag();apply(next,id,'down');
    });
    document.addEventListener('dragend',clearDrag);
  }
  const api={KEY,defaults:[...defaults],validate,normalize,read,save,move,step,init};
  if(typeof module==='object'&&module.exports)module.exports=api;else root.GrowthNavOrder=api;
})(globalThis);
