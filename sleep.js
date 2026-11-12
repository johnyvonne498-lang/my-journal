'use strict';
globalThis.GrowthSleep=(()=>{
  let ui;
  const D=globalThis.GrowthData;
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const duration=n=>n===null?'还没记录':`${Math.floor(n/60)?Math.floor(n/60)+'小时':''}${n%60?n%60+'分':''}`;
  const hours=n=>String(Math.round(n/6)/10);
  function row(days,today,habit){
    const logs=ui.read().sleepLogs||{};
    return `<tr class="weekly-sleep-row"><th scope="row"><div class="habit-week-name"><span class="habit-week-icon sleep-row-art" aria-hidden="true">${ui.icon('moon')}<i>z</i></span><span class="habit-name-button">睡眠<small class="drink-habit-hint">记个大概</small></span>${habit?`<button class="sleep-habit-edit" data-action="edit-habit" data-id="${esc(habit.id)}" aria-label="编辑睡眠习惯">${ui.icon('edit')}</button>`:''}</div></th>${days.map(day=>{
      const r=logs[day],n=D.sleepMinutes(day,r),old=habit&&(habit.logs[day]||0)>=habit.target;
      const label=`${day}睡眠，${n!==null?(Object.hasOwn(r,'hours')?'约':'')+duration(n)+'，'+(r.quality||'未填感受'):old?'以前已打卡，未记录时长':'未记录'}，点击${r?'修改':'记录'}`;
      return `<td class="${day===today?'is-today':''}"><button class="sleep-day-cell ${r?'has-sleep':''}" data-sleep="edit" data-sleep-day="${day}" aria-label="${esc(label)}" title="${esc(label)}" ${D.validMonth(day.slice(0,7))&&/^\d{4}-\d{2}-\d{2}$/.test(day)?'':'disabled'}>${n!==null?`<strong>${hours(n)}<small>h</small></strong><span>${Object.hasOwn(r,'hours')?'约睡了':r.quality||'已记录'}</span>`:`<span class="sleep-empty-moon" aria-hidden="true">${ui.icon('moon')}</span><small>${old?'已打卡':'＋'}</small>`}</button></td>`;
    }).join('')}</tr>`;
  }
  function edit(day){
    if(!D.validMonth(day.slice(0,7)))return;
    const r=ui.read().sleepLogs?.[day],n=D.sleepMinutes(day,r);
    ui.open('昨晚大概睡了多久？',`<form id="sleep-form"><input type="hidden" name="day" value="${esc(day)}"><p class="sleep-editor-date">${esc(day)} <span>· 记在醒来的这一天</span></p><p class="sleep-editor-intro">不用记几点睡、几点起，凭感觉选一个就好。</p><div class="sleep-quick-grid" role="group" aria-label="选择大概睡眠时长，点击即保存">${[5,6,7,8,9,10].map(h=>`<button type="button" class="sleep-quick-choice ${n===h*60?'is-selected':''}" data-sleep="quick" data-sleep-day="${day}" data-sleep-hours="${h}" aria-pressed="${n===h*60}"><span aria-hidden="true">${ui.icon('moon')}</span><strong>${h}<small> 小时</small></strong></button>`).join('')}</div><p class="sleep-quick-hint">点一下就收好，也可以随时改。</p>${r?`<p class="sleep-current">这天已记：${Object.hasOwn(r,'hours')?'约':''}${duration(n)}${!Object.hasOwn(r,'hours')?`（${esc(r.bedtime)} → ${esc(r.wake)}）`:''}</p>`:''}<details class="sleep-custom"><summary>其他时长</summary><div class="sleep-custom-fields">${ui.field('大约几小时',`<input type="number" name="hours" min="0.5" max="24" step="0.5" value="${n===null?'':n/60}" placeholder="比如 7.5" aria-label="大约几小时">`)}<button type="submit" class="primary">记下</button></div><p class="sleep-editor-note">半小时为一格，估一下就好。</p></details><p class="sleep-form-error" role="alert"></p><div class="modal-actions">${r?`<button type="button" class="secondary danger" data-sleep="remove" data-sleep-day="${day}">删除这次记录</button>`:''}<button type="button" class="secondary" data-action="close-modal">先不记</button></div></form>`);
  }
  function error(form,message){const el=form?.querySelector('.sleep-form-error');if(el)el.textContent=message;else ui.toast(message);}
  function save(day,value,form){
    const record={hours:value,quality:''};
    if(!D.validSleep(day,record)){error(form,'选个大约的时长吧，支持 0.5～24 小时，半小时一格。');return;}
    try{ui.write({sleepLogs:{...ui.read().sleepLogs,[day]:record}});}
    catch(e){error(form,e.message);return;}
    ui.close();ui.refresh();ui.toast('收好啦 · 大约睡了 '+duration(D.sleepMinutes(day,record)));
  }
  function submit(form){const f=Object.fromEntries(new FormData(form));save(f.day,Number(f.hours),form);}
  function chart(month){
    const logs=ui.read().sleepLogs||{},s=D.sleepMonth(logs,month),max=Math.max(12,...s.days.map(d=>d.minutes===null?0:Math.ceil(d.minutes/120)*2));
    const left=43,right=664,top=20,bottom=205,x=i=>left+i/(s.days.length-1)*(right-left),y=n=>bottom-n/60/max*(bottom-top);
    let path='',connected=false;
    for(let i=0;i<s.days.length;i++){const d=s.days[i];if(d.minutes===null){connected=false;continue;}path+=`${connected?'L':'M'}${x(i).toFixed(1)},${y(d.minutes).toFixed(1)} `;connected=true;}
    const chartTitle=`${Number(month.slice(5))}月睡眠时长折线图，已记录${s.count}天${s.average!==null?'，平均'+(s.estimated?'约':'')+duration(s.average):''}`;
    return `<section class="card sleep-month-card" aria-labelledby="sleep-month-heading"><header><div><span class="home-kicker">MY LITTLE NIGHTS</span><h2 id="sleep-month-heading">这个月，睡得怎么样？</h2><p>每一颗小点，都是好好休息的一晚。</p></div><span class="sleep-chart-moon" aria-hidden="true">${ui.icon('moon')}</span></header><div class="sleep-month-summary"><span>记下了 <strong>${s.count}</strong> 天</span><span>平均每晚 <strong>${s.average!==null?(s.estimated?'约':'')+duration(s.average):'—'}</strong></span></div><div class="sleep-chart-wrap"><div class="sleep-chart-scroll" tabindex="0" role="region" aria-label="睡眠时长图表，可横向滚动"><svg class="sleep-line-chart" viewBox="0 0 690 244" role="img" aria-label="${chartTitle}"><text x="5" y="12" class="sleep-axis-text">小时</text>${Array.from({length:5},(_,i)=>max*i/4).map(v=>`<line x1="${left}" y1="${y(v*60)}" x2="${right}" y2="${y(v*60)}" class="sleep-grid-line"/><text x="31" y="${y(v*60)+4}" text-anchor="end" class="sleep-axis-text">${v}</text>`).join('')}${s.days.map((d,i)=>i===0||(i+1)%5===0||i===s.days.length-1?`<text x="${x(i)}" y="231" text-anchor="middle" class="sleep-axis-text">${i+1}日</text>`:'').join('')}${s.average!==null?`<line x1="${left}" y1="${y(s.average)}" x2="${right}" y2="${y(s.average)}" class="sleep-average-line"/>`:''}<path d="${path}" class="sleep-data-line"/>${s.days.map((d,i)=>d.minutes===null?'':`<circle cx="${x(i)}" cy="${y(d.minutes)}" r="5" class="sleep-data-point"><title>${d.day} · ${Object.hasOwn(logs[d.day],'hours')?'约':''}${duration(d.minutes)}${Object.hasOwn(logs[d.day],'hours')?' · 估计时长':` · ${logs[d.day].bedtime} — ${logs[d.day].wake}`}${logs[d.day].quality?' · '+logs[d.day].quality:''}</title></circle>`).join('')}</svg></div>${!s.count?'<div class="sleep-chart-empty"><strong>小曲线，等你来画</strong><span>在「我的小习惯 → 睡眠」里记一晚，<br>这里就会多一颗小点。</span></div>':''}</div><footer class="sleep-chart-legend"><span><i></i>睡眠时长</span><span><b></b>本月平均</span><small>按记下的时长画图，未记录的日期不计入平均。</small></footer>${s.count?`<details class="sleep-record-details"><summary>翻翻这个月的睡眠记录</summary><div class="sleep-record-table"><table><caption class="sr-only">本月睡眠明细</caption><thead><tr><th>起床日期</th><th>入睡 → 起床</th><th>时长</th><th>感受</th></tr></thead><tbody>${s.days.filter(d=>d.minutes!==null).map(d=>`<tr><th>${d.day}</th><td>${Object.hasOwn(logs[d.day],'hours')?'估计时长':`${logs[d.day].bedDate.slice(5)} ${logs[d.day].bedtime} → ${logs[d.day].wake}`} </td><td>${Object.hasOwn(logs[d.day],'hours')?'约':''}${duration(d.minutes)}</td><td>${logs[d.day].quality||'—'}</td></tr>`).join('')}</tbody></table></div></details>`:''}</section>`;
  }
  function init(options){
    ui=options;
    document.addEventListener('click',event=>{
      const button=event.target.closest('[data-sleep]');if(!button)return;
      const day=button.dataset.sleepDay;
      if(button.dataset.sleep==='edit')edit(day);
      if(button.dataset.sleep==='quick')save(day,Number(button.dataset.sleepHours),button.closest('#sleep-form'));
      if(button.dataset.sleep==='remove')ui.confirm('删除这次睡眠记录？','这天的睡眠时长会从折线图中移除。以前的习惯打卡仍然保留。',()=>{
        const next={...ui.read().sleepLogs};delete next[day];
        try{ui.write({sleepLogs:next});}catch(e){ui.toast(e.message);return;}
        ui.close();ui.refresh();ui.toast('已删除这次睡眠记录');
      });
    });
    document.addEventListener('submit',event=>{if(event.target.id!=='sleep-form')return;event.preventDefault();submit(event.target);});
  }
  return {init,row,chart,duration};
})();
