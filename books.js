'use strict';
globalThis.GrowthBooks=(()=>{
  let ui,filter='all',sheet=0,excerptIndex=0;
  const labels={want:'想读',reading:'在读',done:'读完'};
  const colors={sage:'鼠尾草绿',butter:'奶油黄',rose:'玫瑰粉',sky:'雾蓝',clay:'陶土橘',lilac:'浅紫',cream:'米白',ink:'墨绿'};
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const all=()=>ui.read().books||[];
  const excerpts=()=>ui.read().readingExcerpts||[];
  function renderExcerpts(){
    const records=excerpts();excerptIndex=Math.max(0,Math.min(excerptIndex,records.length-1));const e=records[excerptIndex];
    return `<section class="reading-excerpts" aria-label="阅读摘抄"><header><h3>阅读摘抄</h3><small>${records.length} 则</small></header>${e?`<div class="reading-excerpt-entry"><p class="reading-excerpt-text" tabindex="0">${esc(e.text)}</p>${e.source?`<p class="reading-excerpt-source">— ${esc(e.source)}</p>`:''}<button class="text-btn" data-books="excerpt-edit" data-book-id="${esc(e.id)}" aria-label="编辑这则摘抄">${ui.icon('edit')}编辑</button></div>`:'<div class="reading-excerpt-empty"><p>还没有摘抄</p><span aria-hidden="true"></span><span aria-hidden="true"></span><span aria-hidden="true"></span></div>'}${records.length>1?`<div class="reading-excerpt-pager"><button class="icon-btn" data-books="excerpt-previous" aria-label="上一则摘抄" ${excerptIndex===0?'disabled':''}>${ui.icon('left')}</button><span>${excerptIndex+1} / ${records.length}</span><button class="icon-btn" data-books="excerpt-next" aria-label="下一则摘抄" ${excerptIndex===records.length-1?'disabled':''}>${ui.icon('right')}</button></div>`:''}<button class="reading-excerpt-add" data-books="excerpt-add">＋ 留一句喜欢的话</button></section>`;
  }
  function editExcerpt(id){
    const e=excerpts().find(e=>e.id===id)||{id:'',text:'',source:''};
    ui.open(e.id?'再读一遍这句话':'留一句喜欢的话',`<form id="reading-excerpt-form"><input type="hidden" name="id" value="${esc(e.id)}">${ui.field('喜欢的句子',`<textarea name="text" rows="5" maxlength="1000" required placeholder="写下或粘贴书里喜欢的一段话……">${esc(e.text)}</textarea>`)}${ui.field('出处（可不填）',`<input name="source" maxlength="160" value="${esc(e.source)}" placeholder="作者、书名，或页码">`)}<div class="modal-actions">${e.id?`<button type="button" class="text-btn danger" data-books="excerpt-delete" data-book-id="${esc(e.id)}">删除摘抄</button>`:''}<button type="button" class="secondary" data-action="close-modal">先放一放</button><button class="primary" type="submit">收好这句话</button></div></form>`);
  }
  function dimensions(id,i){let hash=0;for(const c of id)hash=(hash*31+c.charCodeAt(0))>>>0;return `--book-width:${[91,77,99,83,94,74,88,97][i%8]}%;--book-height:${47+hash%4*5}px;--book-shift:${i%3===0?-1:i%3===1?.7:-.3}deg`;}
  function spine(b,i,placeholder=false){
    const caption=placeholder?b.title:b.status==='done'?'已读完':b.totalPages?`${b.pages} / ${b.totalPages} 页`:labels[b.status];
    return `<button class="reading-spine book-${b.color}${placeholder?' book-placeholder':''}" style="${dimensions(b.id,i)}" data-books="${placeholder?'add':'edit'}" ${placeholder?'':`data-book-id="${esc(b.id)}"`} aria-label="${placeholder?'添加第一本书':`编辑《${esc(b.title)}》`}"><span class="spine-number">${String(i+1).padStart(2,'0')}</span><span class="spine-lettering">${esc(b.title)}${!placeholder&&b.author?`<small>${esc(b.author)}</small>`:''}</span><span class="spine-end">${placeholder?'＋':esc(caption)}</span></button>`;
  }
  function render(){
    const books=all(),p=GrowthData.bookProgress(books),filtered=books.filter(b=>filter==='all'||b.status===filter),pages=Math.max(1,Math.ceil(filtered.length/8));
    sheet=Math.max(0,Math.min(sheet,pages-1));const visible=filtered.slice(sheet*8,sheet*8+8);
    const ghosts=[{id:'empty-a',title:'第一本，想读什么？',color:'sage'},{id:'empty-b',title:'给喜欢的故事留个位',color:'butter'},{id:'empty-c',title:'不赶进度，慢慢翻',color:'rose'},{id:'empty-d',title:'一页一页，遇见新世界',color:'sky'},{id:'empty-e',title:'留一点时间给自己',color:'cream'}];
    return `<section class="reading-room" aria-label="我的书单"><header class="reading-top"><div><span class="reading-kicker">MY LITTLE BOOKSHELF</span><h2>读到哪儿，算哪儿</h2><p>把想读的收好，把读过的留下。</p></div><button class="primary reading-add" data-books="add">${ui.icon('plus')}添一本书</button></header><div class="reading-progress"><div class="reading-progress-copy"><span>书单里的小进度</span><strong>读完 <b>${p.done}</b> / ${p.total} 本</strong></div><div class="reading-progress-track" role="progressbar" aria-label="书单已读完比例" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${p.percent}" aria-valuetext="${p.total?`已读完 ${p.done} 本，共 ${p.total} 本`:'还没有添加书籍'}"><span style="width:${p.percent}%"></span></div><small>${p.total?`${p.percent}% · 一点一点，都是积累`:'从想读的第一本开始，不着急'}</small></div><div class="reading-tabs" role="group" aria-label="筛选书单">${[['all','全部',p.total],['want','想读',p.want],['reading','在读',p.reading],['done','读完',p.done]].map(([id,label,n])=>`<button data-books="filter" data-book-filter="${id}" aria-pressed="${filter===id}" class="${filter===id?'active':''}">${label}<span>${n}</span></button>`).join('')}</div><div class="reading-composition"><section class="reading-stack-area" aria-label="书脊书架"><div class="reading-section-title"><h3>我的小书堆</h3><span>${books.length?'点点书脊，记下读到的地方':'空书架示意 · 点一本开始'}</span></div><div class="reading-pile">${visible.length?visible.map((b,i)=>spine(b,sheet*8+i)).join(''):!books.length?ghosts.map((b,i)=>spine(b,i,true)).join(''):`<div class="reading-filter-empty">这里还没有${labels[filter]||''}的书<br><button class="text-btn" data-books="filter" data-book-filter="all">看看全部书籍</button></div>`}</div><div class="reading-shelf" aria-hidden="true"></div><div class="reading-cat">${GrowthCats.art('tucked')}<span>翻几页也很好 ♡</span></div></section><aside class="reading-scroll" aria-label="阅读摘抄卷轴"><div class="scroll-rod scroll-rod-top" aria-hidden="true"></div><div class="reading-scroll-paper"><blockquote class="scroll-woolf-quote"><p>不必匆忙，不必闪耀。<br>不必成为别人，做自己就好。</p><footer>— 伍尔夫<cite>《一间自己的房间》</cite></footer></blockquote>${renderExcerpts()}</div><div class="scroll-rod scroll-rod-bottom" aria-hidden="true"></div></aside></div>${pages>1?`<div class="reading-pagination"><button class="secondary" data-books="previous" ${sheet===0?'disabled':''}>${ui.icon('left')}上一页</button><span>${sheet+1} / ${pages}</span><button class="secondary" data-books="next" ${sheet===pages-1?'disabled':''}>下一页${ui.icon('right')}</button></div>`:''}<p class="reading-storage-note">${ui.icon('lock')}书单、感想和摘抄只存在这台设备，完整备份也会一起带上。</p></section>`;
  }
  function edit(id){
    const b=all().find(b=>b.id===id)||{id:'',title:'',author:'',status:'want',pages:0,totalPages:0,note:'',color:GrowthData.bookColors[all().length%8]};
    ui.open(b.id?'和这本书的小记录':'收下一本想读的书',`<form id="reading-book-form"><input type="hidden" name="id" value="${esc(b.id)}">${ui.field('书名',`<input name="title" maxlength="120" required value="${esc(b.title)}" placeholder="最近想翻开哪一本？">`)}${ui.field('作者（可不填）',`<input name="author" maxlength="80" value="${esc(b.author)}" placeholder="是谁写的故事">`)}<div class="field-row">${ui.field('读到哪一步',`<select name="status">${Object.entries(labels).map(([k,v])=>`<option value="${k}" ${b.status===k?'selected':''}>${v}</option>`).join('')}</select>`)}${ui.field('书脊颜色',`<select name="color">${Object.entries(colors).map(([k,v])=>`<option value="${k}" ${b.color===k?'selected':''}>${v}</option>`).join('')}</select>`)}</div><div class="field-row">${ui.field('已经读到（页）',`<input name="pages" type="number" min="0" max="100000" step="1" required value="${b.pages}">`)}${ui.field('总页数（不知道可填 0）',`<input name="totalPages" type="number" min="0" max="100000" step="1" required value="${b.totalPages}">`)}</div><p class="reading-form-tip">选“读完”会记到最后一页；选“想读”会清零已读页数。</p>${ui.field('随手写两句（可不填）',`<textarea name="note" rows="4" maxlength="4000" placeholder="喜欢的一句话，或者此刻的感想……">${esc(b.note)}</textarea>`)}<div class="modal-actions">${b.id?`<button type="button" class="text-btn danger" data-books="delete" data-book-id="${esc(b.id)}">移出书单</button>`:''}<button type="button" class="secondary" data-action="close-modal">先放一放</button><button class="primary" type="submit">收好啦</button></div></form>`);
  }
  function commit(patch){
    try{ui.write(patch);return true;}catch(error){ui.toast(error.message||'未能保存，当前编辑还在，请先导出备份');return false;}
  }
  function init(options){
    ui=options;
    document.addEventListener('click',e=>{
      const button=e.target.closest('[data-books]');if(!button||GrowthLocal.locked)return;
      const action=button.dataset.books,id=button.dataset.bookId;
      if(action==='add')edit();
      if(action==='edit')edit(id);
      if(action==='excerpt-add')editExcerpt();
      if(action==='excerpt-edit')editExcerpt(id);
      if(action==='excerpt-previous'||action==='excerpt-next'){excerptIndex+=action==='excerpt-next'?1:-1;ui.refresh();}
      if(action==='excerpt-delete')ui.confirm('删除这则摘抄？','只删除这段摘抄，书单里的书会保留。',()=>{if(commit({readingExcerpts:excerpts().filter(e=>e.id!==id)})){ui.close();ui.refresh();ui.toast('摘抄已删除');}});
      if(action==='filter'){filter=button.dataset.bookFilter;sheet=0;ui.refresh();}
      if(action==='previous'||action==='next'){sheet+=action==='next'?1:-1;ui.refresh();}
      if(action==='delete')ui.confirm('把这本书移出去？','这本书的页数和随手感想也会移除。',()=>{if(commit({books:all().filter(b=>b.id!==id)})){ui.close();ui.refresh();ui.toast('已经移出书单');}});
    });
    document.addEventListener('submit',e=>{
      if(e.target.id==='reading-excerpt-form'){
        e.preventDefault();if(GrowthLocal.locked)return;
        const f=Object.fromEntries(new FormData(e.target)),old=excerpts().find(e=>e.id===f.id);
        if(f.id&&!old){ui.toast('这则摘抄已不存在，请重新打开');return;}
        if(!old&&excerpts().length>=1000){ui.toast('已收藏 1000 则摘抄，请先整理再添加');return;}
        const record={id:old?.id||ui.uid(),text:f.text.trim(),source:f.source.trim()};
        if(!GrowthData.validReadingExcerpt(record)){ui.toast('先写下喜欢的句子吧（最多 1000 字）');return;}
        const next=old?excerpts().map(e=>e.id===old.id?record:e):[record,...excerpts()];
        if(commit({readingExcerpts:next})){excerptIndex=next.findIndex(e=>e.id===record.id);ui.close();ui.refresh();ui.toast('这句话，收好啦');}return;
      }
      if(e.target.id!=='reading-book-form')return;e.preventDefault();if(GrowthLocal.locked)return;
      const f=Object.fromEntries(new FormData(e.target)),old=all().find(b=>b.id===f.id);
      if(f.id&&!old){ui.toast('这本书已经不存在，请重新打开书单');return;}
      if(!old&&all().length>=1000){ui.toast('书架已放满 1000 本，请先整理再添加');return;}
      const totalPages=Number(f.totalPages),rawPages=Number(f.pages);
      if(!Number.isInteger(rawPages)||!Number.isInteger(totalPages)||rawPages<0||rawPages>100000||totalPages<0||totalPages>100000){ui.toast('页数请填 0 到 100000 的整数');return;}
      const record={id:old?.id||ui.uid(),title:f.title.trim(),author:f.author.trim(),status:f.status,color:f.color,pages:f.status==='want'?0:f.status==='done'&&totalPages?totalPages:rawPages,totalPages,note:f.note.trim()};
      if(!record.title){ui.toast('先写下书名吧');return;}
      if(record.totalPages&&record.pages>record.totalPages){ui.toast('已读页数不能超过总页数');return;}
      if(!GrowthData.validBook(record)){ui.toast('请检查书籍信息后再保存');return;}
      const next=old?all().map(b=>b.id===old.id?record:b):[...all(),record];
      if(commit({books:next})){filter='all';sheet=Math.floor(next.findIndex(b=>b.id===record.id)/8);ui.close();ui.refresh();ui.toast('这本书，收好啦');}
    });
  }
  return {init,render};
})();
