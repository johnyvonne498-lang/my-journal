'use strict';
(() => {
const KEY = 'upward.personal.v1';

const $ = (s, root = document) => root.querySelector(s);
const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const uid = () => globalThis.crypto?.randomUUID?.() || `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
const dateKey = (d = new Date()) => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
const parseDate = s => { const [y,m,d] = s.split('-').map(Number); const date = new Date(0); date.setHours(12,0,0,0); date.setFullYear(y,m-1,d); return date; };
const shiftDate = (s, n) => { const d = parseDate(s); d.setDate(d.getDate()+n); return dateKey(d); };
const validDate = s => typeof s === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(s) && dateKey(parseDate(s)) === s && s >= '1900-01-01' && s <= '2100-12-31';
const validTime = s => typeof s === 'string' && (s === '' || /^([01]\d|2[0-3]):[0-5]\d$/.test(s));
const validIconImage = value => typeof value === 'string' && (value === '' || (value.length <= 120000 && /^data:image\/(?:png|jpeg|webp);base64,[A-Za-z0-9+/]+={0,2}$/.test(value)));
const palettes = {blue:['#ad6b7e','#fbecef'],green:['#668d77','#edf4eb'],orange:['#b18355','#fcf0df'],purple:['#9581b1','#f1ecf7'],pink:['#bc758f','#fcecf3'],cyan:['#6f98a0','#edf5f5']};
const tint = key => {const [a,b] = palettes[key] || palettes.blue; return `--accent:${a};--tint:${b}`;};
const paths = {
leaf:'<path d="M12 21v-9M12 15C5 16 2 11 3 6c6-1 10 3 9 9Z"/><path d="M12 11c-1-6 3-9 9-8 1 6-3 9-9 8Z"/>',
calendar:'<rect x="3" y="5" width="18" height="16" rx="3"/><path d="M7 3v4m10-4v4M3 11h18m-13 4h2m4 0h2m-8 3h2"/>',
home:'<path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1Z"/>',
check:'<path d="m5 12 4 4L19 6"/>',
circle:'<circle cx="12" cy="12" r="9"/><path d="m8 12 3 3 5-6"/>',
clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
target:'<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>',
book:'<path d="M12 5C8 2 4 3 2 4v15c3-1 7-1 10 2 3-3 7-3 10-2V4c-2-1-6-2-10 1Zm0 0v16"/>',
chart:'<path d="M4 3v18h17M8 16v-4m5 4V8m5 8V5"/>',
note:'<rect x="4" y="3" width="16" height="18" rx="3"/><path d="M8 8h8m-8 4h8m-8 4h5"/>',
grid:'<rect x="3" y="3" width="7" height="7" rx="2"/><rect x="14" y="3" width="7" height="7" rx="2"/><rect x="3" y="14" width="7" height="7" rx="2"/><rect x="14" y="14" width="7" height="7" rx="2"/>',
settings:'<path d="m9 3 6 0 .7 3 2.3 1 2.6-.8 3 5-2.1 2.3.2 2.5 1.9 2.2-3 5-3-.9-2.1 1-1 2.7H9l-1-2.7-2.1-1-3 .9-3-5 1.9-2.2.2-2.5L0 11.3l3-5 2.6.8L8 6Z" transform="translate(2 0) scale(.83)"/><circle cx="12" cy="12" r="3"/>',
plus:'<path d="M12 5v14M5 12h14"/>',minus:'<path d="M5 12h14"/>',
left:'<path d="m14 6-6 6 6 6"/>',right:'<path d="m9 6 6 6-6 6"/>',
more:'<circle cx="12" cy="5" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="12" cy="19" r="1"/>',
star:'<path d="m12 3 2.8 5.7 6.3.9-4.6 4.4 1.1 6.3-5.6-3-5.6 3 1.1-6.3L3 9.6l6.2-.9Z"/>',
sun:'<circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5"/>',
run:'<circle cx="15" cy="4" r="2"/><path d="m12 8 4 4 4 1M4 10l5-2 3 3-3 5-5 4m8-7 3 3 1 5"/>',
water:'<path d="M12 3s-7 8-7 12a7 7 0 0 0 14 0c0-4-7-12-7-12Z"/><path d="M8 15a4 4 0 0 0 4 4"/>',
moon:'<path d="M21 13A9 9 0 0 1 11 3 9 9 0 1 0 21 13Z"/>',
video:'<rect x="3" y="4" width="18" height="16" rx="3"/><path d="m10 8 6 4-6 4Z"/>',
shield:'<path d="M12 3 4 6v6c0 5 8 9 8 9s8-4 8-9V6Z"/><path d="m8 12 3 3 5-6"/>',
download:'<path d="M12 3v12m-4-4 4 4 4-4M4 16v5h16v-5"/>',
upload:'<path d="M12 16V4m-4 4 4-4 4 4M4 16v5h16v-5"/>',
cloud:'<path d="M7 18a5 5 0 1 1 0-10 6 6 0 0 1 11-1 5 5 0 0 1 0 11Z"/><path d="m9 13 2 2 4-4"/>',
lock:'<rect x="5" y="10" width="14" height="11" rx="3"/><path d="M8 10V7a4 4 0 0 1 8 0v3m-4 5v2"/>',
x:'<path d="m6 6 12 12M6 18 18 6"/>',
edit:'<path d="m15 4 5 5M4 20l5-1L21 7a2 2 0 0 0-5-5L4 14Z"/>',
inbox:'<path d="m3 14 3-9h12l3 9v6H3Z"/><path d="M3 14h5l2 3h4l2-3h5"/>',
spark:'<path d="m12 3 2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5Z"/>',
logout:'<path d="M10 4H4v16h6m4-12 4 4-4 4m-6-4h10"/>'
};
Object.assign(paths, {
  cloudWeather:'<path d="M7 18a5 5 0 1 1 .6-10A6 6 0 0 1 19 9a4.5 4.5 0 0 1-1.5 9Z"/>',
  rain:'<path d="M7 15a5 5 0 1 1 0-10 6 6 0 0 1 11-1 5 5 0 0 1 1 11M7 18l-1 3m7-3-1 3m7-3-1 3"/>',
  storm:'<path d="M6 15a5 5 0 1 1 1-10 6 6 0 0 1 11-1 5 5 0 0 1 1 11M13 11l-4 6h5l-3 5"/>',
  snow:'<path d="M12 2v20M3.3 7l17.4 10M3.3 17 20.7 7M9 4l3 3 3-3M9 20l3-3 3 3M4 11l4-1-1-4m10 12-1-4 4-1M7 18l1-4-4-1m16-2-4-1 1-4"/>',
  mist:'<path d="M4 6h16M2 10h16M6 14h16M3 18h16"/>',
  wind:'<path d="M3 8h11a3 3 0 1 0-3-3M2 12h17a3 3 0 1 1-3 3M4 16h5a3 3 0 1 1-3 3"/>',
  umbrella:'<path d="M3 12a9 9 0 0 1 18 0H3Zm9-9V2m0 10v7a2 2 0 0 0 4 0M8 12c0-5 2-9 4-9s4 4 4 9"/>',
  shirt:'<path d="m8 3-6 4 3 5 3-2v11h8V10l3 2 3-5-6-4a4 4 0 0 1-8 0Z"/>',
  trousers:'<path d="M6 3h12l2 18h-6l-2-11-2 11H4L6 3Zm0 4h12M12 3v4"/>',
  shoe:'<path d="M3 8v11h18v-4l-8-3-3-6-3 4-4-2Zm0 8h18M12 11l-2 2m5-1-2 2"/>',
  refresh:'<path d="M20 7v5h-5M4 17v-5h5M6 6a8 8 0 0 1 13 2M5 16a8 8 0 0 0 13 2"/>',
  pin:'<path d="M19 10c0 5-7 11-7 11S5 15 5 10a7 7 0 1 1 14 0Z"/><circle cx="12" cy="10" r="2"/>'
});
const icon = (name, cls='') => `<svg class="${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true">${paths[name] || paths.target}</svg>`;
const PAGES = {health:['身体小档案','把关于身体的事，妥妥收好','shield'],books:['书单','读几页喜欢的书，留一点时间给自己','book'],hotspots:['小红书精选帖','收藏喜欢的帖子，给生活一点新灵感','spark'],wishes:['今年想做的事','把期待写下来，一件一件慢慢实现','star'],journal:['生活手账','一月一页，收藏小猫和生活里的小美好','book'],home:['首页','先照顾好自己，再开启今天的小目标','home'],countdown:['倒计时','把重要的日子，放进温柔的期待里','clock'],today:['每日计划','安排今天的小目标，也给好习惯打个勾','calendar'],review:['月度复盘','翻翻这个月，把小小的成长收好','note'],stats:['成长统计','每一份微小的坚持，都有迹可循','chart'],settings:['数据与备份','你的记录，由你自己掌握','settings']};
const NAV_DEFAULT = [['home','首页'],['today','每日计划'],['journal','生活手账'],['books','书单'],['health','身体小档案'],['countdown','倒计时'],['wishes','今年想做的事'],['hotspots','小红书精选帖'],['review','月度复盘'],['stats','成长统计']];
let NAV;
function loadNavOrder(){NAV=GrowthNavOrder.read().map(id=>NAV_DEFAULT.find(([route])=>route===id)).filter(Boolean);}
loadNavOrder();
const PRIORITIES = {high:['高','pink'],medium:['中','orange'],low:['低','green']};
let selectedDate = dateKey();
let wishYear=new Date().getFullYear(),wishFilter='all';
const H=globalThis.GrowthHotspots;
let pickFilter='全部',pickError='',picks=[];
function loadPicks(){try{picks=H.read();pickError='';}catch{picks=[];pickError='精选帖暂时无法读取，原始收藏未改动。请检查浏览器存储。';}}
loadPicks();
const wishCategories=['生活','学习','旅行','体验','其他'];
const routePage = id => id==='growth'?'journal':id==='habits'?'today':Object.hasOwn(PAGES,id)?id:'home';
let page = routePage(location.hash.slice(1));
let catFilter = null, storageError = '', unreadableOriginal = false, modalReturnFocus = null, toastTimer, reviewTimer;
let categoryImageDraft = '', categoryImageBusy = false, categoryImageEpoch = 0;
const W = globalThis.GrowthWeather;
let weather = W.readCache(), weatherBusy = false, weatherError = '', weatherAttemptAt = 0, homeDay = W.dayKey();
let jokeSelection = readJokeSelection();
const emptyData = () => ({version:1,example:false,categories:[],tasks:[],habits:[],reviews:{},monthlyReviews:{},sleepLogs:{},countdowns:[],yearlyGoals:[],moodLogs:{},books:[],readingExcerpts:[],health:GrowthData.emptyHealth()});
function seed() {
  const data = emptyData(); data.example = true;
  data.categories = [
    {id:'english',name:'英语学习',description:'每天学一点，让表达更自如',color:'blue',icon:'book'},
    {id:'fitness',name:'运动健康',description:'保持活力，照顾好自己的身体',color:'green',icon:'run'},
    {id:'reading',name:'阅读成长',description:'在阅读里，遇见更多可能',color:'orange',icon:'book'},
    {id:'video',name:'剪辑创作',description:'记录生活，也练习表达',color:'purple',icon:'video'},
    {id:'life',name:'生活整理',description:'给生活留一点秩序和空间',color:'cyan',icon:'home'},
    {id:'reflection',name:'自我提升',description:'停下来想一想，再向前一步',color:'pink',icon:'spark'}
  ];
  data.tasks = [
    ['07:30','08:00','晨间舒展，唤醒身体','fitness','low','伸展 10 分钟，喝一杯温水',true],
    ['08:30','09:00','背 30 个英语单词','english','high','复习昨天的单词，练习跟读',true],
    ['10:00','11:00','学习一个视频转场技巧','video','medium','完成一段 30 秒的小练习',false],
    ['14:00','14:30','完成 30 分钟有氧运动','fitness','high','换上运动鞋，给自己一点活力',false],
    ['20:00','20:30','阅读 30 分钟书籍','reading','medium','放下手机，专注阅读',false],
    ['21:30','21:45','写下今天的成长复盘','reflection','low','记录收获，也给明天留一个小目标',false]
  ].map(([time,end,title,category,priority,notes,done]) => ({id:uid(),date:selectedDate,time,end,title,category,priority,notes,done}));
  data.habits = [
    {id:uid(),name:'动一动',icon:'run',color:'green',target:1,logs:{[selectedDate]:1}},
    {id:uid(),name:'学英语',icon:'book',color:'blue',target:1,logs:{[selectedDate]:1}},
    {id:uid(),name:'读几页书',icon:'book',color:'orange',target:1,logs:{}},
    {id:uid(),name:'喝杯水',icon:'water',color:'cyan',target:8,logs:{[selectedDate]:3}},
    {id:uid(),name:'睡眠',icon:'moon',color:'purple',target:1,logs:{}}
  ];
  return data;
}
const validateData = GrowthData.validateGrowth;
let data, hadSavedData=false;
try { const saved = localStorage.getItem(KEY); hadSavedData=!!saved; data = saved ? validateData(JSON.parse(saved)) : seed(); }
catch { data = emptyData(); unreadableOriginal = true; storageError = '本地记录暂时无法读取。为保护原有内容，自动保存已暂停，请先导出原始数据或从备份恢复。'; }
function save() {
  if (storageError) return false;
  try { localStorage.setItem(KEY,JSON.stringify(data)); GrowthLocal.changed('growth'); return true; }
  catch { storageError = '浏览器未能保存记录，可能是存储空间不足或限制了存储。请立即导出备份。'; toast(storageError); return false; }
}
if (!storageError) save();
const tasksOn = (day=selectedDate) => data.tasks.filter(t=>t.date===day).sort((a,b)=>(a.time||'99:99').localeCompare(b.time||'99:99'));
const categoryOf = t => data.categories.find(c=>c.id===t.category) || {name:'未分类',color:'blue',icon:'target'};
const categoryIcon = c => c.iconImage ? `<img class="category-image" src="${esc(c.iconImage)}" alt="" decoding="async">` : icon(c.icon);
const habitCount = (h,day=selectedDate) => GrowthData.habitLogCount(h,day,data.sleepLogs);
const finishedHabits = (day=selectedDate) => data.habits.filter(h=>habitCount(h,day)>=h.target).length;
const dateLabel = day => `${parseDate(day).getMonth()+1}月${parseDate(day).getDate()}日 · 周${'日一二三四五六'[parseDate(day).getDay()]}`;
const fullDateLabel = day => `${parseDate(day).getFullYear()}年${dateLabel(day)}`;
const checkButton = (t,round=false) => `<button class="check ${t.done?'checked':''} ${round?'round':''}" data-action="toggle-task" data-id="${esc(t.id)}" aria-label="${t.done?'取消完成':'完成'}：${esc(t.title)}" aria-pressed="${t.done}">${t.done?icon('check'):''}</button>`;
const editButton = (type,id,name) => `<button class="more-btn" data-action="edit-${type}" data-id="${esc(id)}" aria-label="编辑${esc(name)}">${icon('more')}</button>`;
const empty = (message,action='',label='添加任务') => `<div class="empty">${icon('inbox')}<p>${message}</p>${action?`<button class="secondary" data-action="${action}">${icon('plus')}${label}</button>`:''}</div>`;
const cardHead = (name,title,action='',label='添加',badge='') => `<div class="card-head"><div class="card-title">${icon(name)}<h2>${title}</h2>${badge?`<span class="badge">${badge}</span>`:''}</div>${action?`<button class="add-link" data-action="${action}">${icon('plus')}${label}</button>`:''}</div>`;
function datePicker() {if(page==='review')return reviewMonthPicker();return `<div class="date-picker">${icon('calendar')}<button class="icon-btn" data-action="date-prev" aria-label="前一天">${icon('left')}</button><label class="date-input">${fullDateLabel(selectedDate)}<input type="date" id="selected-date" value="${selectedDate}" min="1900-01-01" max="2100-12-31" aria-label="选择日期"></label><button class="icon-btn" data-action="date-next" aria-label="后一天">${icon('right')}</button>${selectedDate!==dateKey()?'<button class="today-button" data-action="date-today">今天</button>':''}</div>`;}
function paintHome() {
  if(page!=='home')return;
  const target=$('#page-content'), restore=document.activeElement?.dataset?.action==='refresh-weather';
  if(target){
    const welcome=target.querySelector('.home-welcome'),weatherGrid=target.querySelector('.home-weather-grid');
    if(welcome&&weatherGrid&&target.querySelector('#home-food-wheel')){welcome.innerHTML=renderDailyJoke(W.dayKey());weatherGrid.innerHTML=renderWeather();}
    else target.innerHTML=renderHome();
  }
  if(restore)$('[data-action="refresh-weather"]')?.focus();
}
async function ensureWeather(force=false) {
  if(weatherBusy)return;
  const now=Date.now();
  if(!force && ((weather && weather.days[0].date===W.dayKey() && now-weather.fetchedAt<1800000 && !weatherError) || now-weatherAttemptAt<120000))return;
  weatherAttemptAt=now;weatherBusy=true;weatherError='';paintHome();
  try {weather=await W.fetchWeather();}
  catch {weatherError='暂时连不上天气服务，请检查网络后重试。';}
  finally {weatherBusy=false;paintHome();}
}
function renderWeather() {
  const today=W.dayKey(), currentDay=weather?.days[0], isToday=currentDay?.date===today;
  const label=weatherBusy?'正在更新':weatherError?'更新失败':weather?'已更新':'等待更新';
  const header=`<div class="home-card-heading"><div><span class="home-kicker">${icon('pin')} 长沙 · 湖南</span><h2>${weather&&!isToday?'上次天气缓存':'今日天气'}</h2></div><button class="weather-refresh" data-action="refresh-weather" ${weatherBusy?'disabled':''} aria-label="刷新长沙天气">${icon('refresh')}<span>${weatherBusy?'更新中':'刷新'}</span></button></div>`;
  if(!weather)return `<section class="card weather-card" aria-busy="${weatherBusy}">${header}<div class="weather-unavailable" role="status">${icon(weatherError?'cloudWeather':'sun')}<h3>${weatherError?'天气暂时没有加载成功':'正在查看长沙的天空…'}</h3><p>${weatherError?esc(weatherError):'温度和降雨信息马上就来。'}</p>${weatherError?'<button class="secondary" data-action="refresh-weather">重新获取天气</button>':''}</div><p class="weather-source">天气需联网获取 · 不使用设备定位</p></section>`;
  const c=weather.current, d=currentDay, condition=W.describe(c.code,c.isDay), updated=new Intl.DateTimeFormat('zh-CN',{timeZone:'Asia/Shanghai',month:'numeric',day:'numeric',hour:'2-digit',minute:'2-digit',hour12:false}).format(new Date(weather.fetchedAt));
  const cached=weatherError || !isToday || Date.now()-weather.fetchedAt>=1800000;
  return `<section class="card weather-card ${condition.kind}" aria-busy="${weatherBusy}">${header}<div class="weather-main"><div><div class="weather-temperature">${Math.round(c.temp)}<span>°C</span></div><div class="weather-condition">${esc(condition.text)}<span>体感 ${Math.round(c.feels)}°C</span></div></div><div class="weather-art">${icon(condition.icon)}${GrowthCats.art('window','weather-cat')}</div></div><div class="weather-metrics"><div>${icon('sun')}<span>全天温度</span><strong>${Math.round(d.low)}° — ${Math.round(d.high)}°</strong></div><div>${icon('umbrella')}<span>降雨概率</span><strong>${Math.round(d.rain)}<small>%</small></strong></div><div>${icon('wind')}<span>当前风速</span><strong>${(c.wind/3.6).toFixed(1)}<small>m/s</small></strong></div><div>${icon('water')}<span>相对湿度</span><strong>${Math.round(c.humidity)}<small>%</small></strong></div></div><div class="weather-forecast">${weather.days.map(day=>{const info=W.describe(day.code),name=day.date===today?'今天':day.date===shiftDate(today,1)?'明天':day.date===shiftDate(today,2)?'后天':`${Number(day.date.slice(5,7))}/${Number(day.date.slice(8))}`;return `<div><span>${name}</span>${icon(info.icon)}<span>${esc(info.text)}</span><strong>${Math.round(day.low)}° / ${Math.round(day.high)}°</strong></div>`;}).join('')}</div><div class="weather-status ${cached?'is-stale':''}" role="status">${cached?`${icon('clock')}<span>${weatherError?'联网更新失败。':''}${!isToday?'这不是今日天气；':''}当前显示 ${esc(updated)} 获取的缓存。</span>`:`<span class="weather-live-dot"></span><span>${label} · ${esc(updated)} 获取 · 预报时刻 ${esc(c.time.slice(11))}</span>`}</div><p class="weather-source">数据来源 <a href="https://open-meteo.com/" target="_blank" rel="noopener noreferrer">Open-Meteo</a> · 天气预报供出行参考</p></section>`;
}
const DAILY_JOKES = [
  [
    "我问小猫：你每天睡这么久，不怕浪费时间吗？",
    "它翻了个身：我这是在给梦加班。"
  ],
  [
    "今天给自己定了一个小目标：早睡。",
    "现在目标已经睡了，我还醒着。"
  ],
  [
    "为什么冰箱总是很冷静？",
    "因为它遇到什么事，都会先冷藏一下。"
  ],
  [
    "我对钱包说：你要学会自己长大。",
    "钱包说：那你先别给我减肥。"
  ],
  [
    "朋友问我最近在练什么。",
    "我说：练习把“再睡五分钟”控制在半小时以内。"
  ],
  [
    "我家的猫很有时间观念。",
    "每天饭点都准时提醒我：你又迟到了。"
  ],
  [
    "我买了一本《如何克服拖延》。",
    "等我有空，一定开始看。"
  ],
  [
    "为什么包子不爱说话？",
    "因为它一开口，就会露馅。"
  ],
  [
    "今天试着和生活握手言和。",
    "生活伸过来的，是一张待办清单。"
  ],
  [
    "我说要做一个自律的人。",
    "小猫说：那你先自觉把罐头打开。"
  ],
  [
    "为什么电脑喜欢喝咖啡？",
    "因为它也想 Java 一下。"
  ],
  [
    "我认真整理了桌面，整整半小时。",
    "现在除了东西在哪儿，其他都很清楚。"
  ],
  [
    "朋友说要多出去走走，世界很大。",
    "我走到楼下，发现早餐店也很香。"
  ],
  [
    "我问闹钟：你能不能温柔一点？",
    "它说：可以，但你得先学会一次就醒。"
  ],
  [
    "小猫为什么总坐在键盘上？",
    "因为它觉得，我的工作还需要它按爪确认。"
  ],
  [
    "我准备开始存钱了。",
    "第一步：把购物车命名为“仅供欣赏”。"
  ],
  [
    "为什么云朵从来不焦虑？",
    "因为想不开的时候，它就下点雨。"
  ],
  [
    "我给自己放了一天假。",
    "待办清单说：好的，那我们明天开个会。"
  ],
  [
    "今天出门前照了照镜子，决定自信一点。",
    "于是对镜子说：你今天运气不错，又见到我了。"
  ],
  [
    "小猫认真地盯着鱼缸。",
    "我问它在干什么，它说：看美食直播。"
  ],
  [
    "朋友说运动会让人快乐。",
    "我试过了，运动结束的那一刻，确实特别快乐。"
  ],
  [
    "我不是起床困难。",
    "我只是和被子签了长期合作协议。"
  ],
  [
    "为什么月亮晚上才上班？",
    "因为它白天要补觉，星星可以作证。"
  ],
  [
    "我问绿植：你怎么这么会过日子？",
    "它说：有光就吃，没事就长。"
  ],
  [
    "今天想给生活加点甜。",
    "结果奶茶先替我做出了决定。"
  ],
  [
    "我的记忆力其实很好。",
    "尤其是刚关灯时，会想起所有没做完的事。"
  ],
  [
    "我家的猫从不挑食。",
    "只挑我刚买的、最贵的那一包。"
  ],
  [
    "我决定每天走一万步。",
    "目前已经完成了第一步：决定。"
  ],
  [
    "为什么草莓总是很开心？",
    "因为它每天都有一点莓好的事。"
  ],
  [
    "我对周末说：能不能走慢一点？",
    "周末说：抱歉，我是限时体验。"
  ],
  [
    "小猫把水杯碰倒后，看了我一眼。",
    "那个眼神好像在说：你看，地心引力还在。"
  ],
  [
    "我做饭最拿手的是什么？",
    "是拿手机，看看外卖还有多久到。"
  ],
  [
    "为什么书架特别有安全感？",
    "因为不管怎样，它背后总有一整面墙。"
  ],
  [
    "我想成为一个有条理的人。",
    "所以先把烦恼分成了“明天再说”和“后天再说”。"
  ],
  [
    "今天的计划是：和小猫一起专注。",
    "它专注睡觉，我专注羡慕。"
  ],
  [
    "为什么饼干一到下午就很忙？",
    "因为大家都想找它聊点甜的。"
  ],
  [
    "我的手机提醒我：屏幕使用时间过长。",
    "我说：知道了，我再看一眼你怎么统计的。"
  ],
  [
    "我问枕头：你怎么这么懂我？",
    "它说：因为你每天都把心事倒给我听。"
  ],
  [
    "为什么橘子不容易迷路？",
    "因为它走到哪里，都带着自己的瓣侣。"
  ],
  [
    "我告诉小猫：今天我要好好学习。",
    "它立刻趴在书上：知识已经被我吸收了。"
  ]
];
function readJokeSelection() {
  try {
    const saved=JSON.parse(localStorage.getItem('upward.daily-joke.v1'));
    return saved && saved.day===W.dayKey() && Number.isInteger(saved.offset) && saved.offset>=0 && saved.offset<100000 ? saved : null;
  }catch {return null;}
}
function dailyJoke(day) {
  const dayNumber=Math.floor(Date.parse(`${day}T00:00:00Z`)/86400000);
  const offset=jokeSelection?.day===day?jokeSelection.offset:0;
  return DAILY_JOKES[((dayNumber+offset)%DAILY_JOKES.length+DAILY_JOKES.length)%DAILY_JOKES.length];
}
function nextJoke() {
  const day=W.dayKey();
  jokeSelection={day,offset:((jokeSelection?.day===day?jokeSelection.offset:0)+1)%DAILY_JOKES.length};
  try {localStorage.setItem('upward.daily-joke.v1',JSON.stringify(jokeSelection));}catch {}
  paintHome();
}
function catSticker(pose='head') { return GrowthCats.sticker(pose);
}
function renderDailyJoke(day) {
  const [setup,punchline]=dailyJoke(day);
  return `<div class="home-welcome-copy"><div class="joke-topline">${catSticker('meow-head')}<div><span class="home-kicker">DAILY GIGGLE · 每日笑话</span><span class="joke-tagline">今日份快乐，请签收 ♡</span></div></div><h2 class="daily-joke-setup">${esc(setup)}</h2><p class="daily-joke-punchline">${esc(punchline)}</p></div>${pawPlanButton()}<div class="daily-joke-footer"><div><time datetime="${day}">${dateLabel(day)}</time><span>每天一点小幽默</span></div><button class="joke-next" data-action="next-joke">${icon('refresh')}再来一个</button></div>`;
}
function pawPlanButton() {
  return `<div class="home-paw-entry"><button class="paw-plan-button" data-action="open-today" aria-label="开启每日计划" title="开启每日计划"><svg class="paw-plan-shape" viewBox="0 0 180 168" aria-hidden="true"><g class="paw-pads"><ellipse cx="27" cy="57" rx="17" ry="24" transform="rotate(-28 27 57)"/><ellipse cx="67" cy="29" rx="18" ry="25" transform="rotate(-9 67 29)"/><ellipse cx="113" cy="29" rx="18" ry="25" transform="rotate(9 113 29)"/><ellipse cx="153" cy="57" rx="17" ry="24" transform="rotate(28 153 57)"/><path d="M90 68C73 68 67 79 57 89C44 100 29 115 35 134C41 154 64 152 80 146Q90 142 100 146C116 152 139 154 145 134C151 115 136 100 123 89C113 79 107 68 90 68Z"/></g><g class="paw-shine"><ellipse cx="62" cy="24" rx="5" ry="10" transform="rotate(10 62 24)"/><ellipse cx="108" cy="24" rx="5" ry="10" transform="rotate(10 108 24)"/></g></svg><span class="paw-plan-label"><small>开启</small><strong>每日计划</strong></span></button><span class="paw-entry-hint">按下小爪，开始今天</span></div>`;
}
const FOOD_WHEEL_KEY='upward.food-wheel.v1';
const DEFAULT_FOODS=['长沙米粉','家常小炒','饺子馄饨','麻辣烫','盖码饭','面条','轻食沙拉','火锅'];
const FOOD_COLORS=['#f2d6df','#eee5cb','#dce8d7','#e5def0','#f6ddcc','#dbe9e9','#ebd9e3','#e9e7d4','#e3dcf0','#f2e1ce','#d6e6dc','#eee0e7'];
function readFoodWheel() {
  try {
    const saved=JSON.parse(localStorage.getItem(FOOD_WHEEL_KEY));
    if(saved&&Array.isArray(saved.items)&&saved.items.length>=2&&saved.items.length<=12&&saved.items.every(item=>typeof item==='string'&&item.trim()&&item.length<=12))return {items:saved.items,selected:saved.day===W.dayKey()&&Number.isInteger(saved.selected)&&saved.selected>=0&&saved.selected<saved.items.length?saved.selected:null};
  }catch {}
  return {items:[...DEFAULT_FOODS],selected:null};
}
const foodWheel={...readFoodWheel(),rotation:0,busy:false,duration:3800};
foodWheel.rotation=foodWheel.selected===null?0:(360-foodWheel.selected*360/foodWheel.items.length)%360;
function saveFoodWheel() {
  try {localStorage.setItem(FOOD_WHEEL_KEY,JSON.stringify({items:foodWheel.items,selected:foodWheel.selected,day:W.dayKey()}));return true;}catch{return false;}
}
function foodWheelSvg() {
  const count=foodWheel.items.length,step=360/count,point=(angle,r=147)=>[160+Math.cos(angle*Math.PI/180)*r,160+Math.sin(angle*Math.PI/180)*r];
  return `<svg class="food-wheel-disc" viewBox="0 0 320 320" style="transform:rotate(${foodWheel.rotation}deg);--spin-duration:${foodWheel.duration}ms" aria-hidden="true">${foodWheel.items.map((item,i)=>{const angle=-90+i*step,a=point(angle-step/2),b=point(angle+step/2),label=point(angle,104),maxLabel=count>8?4:6;return `<path d="M160 160L${a.join(' ')}A147 147 0 ${step>180?1:0} 1 ${b.join(' ')}Z" fill="${FOOD_COLORS[i]}" stroke="#fffaf5" stroke-width="2"/><text x="${label[0]}" y="${label[1]}" text-anchor="middle" dominant-baseline="middle" transform="rotate(${angle+90} ${label.join(' ')})" font-size="${count>8||item.length>7?10:13}">${esc(item.length>maxLabel?item.slice(0,maxLabel)+'…':item)}</text>`;}).join('')}<circle cx="160" cy="160" r="147" fill="none" stroke="#fffaf5" stroke-width="5"/></svg>`;
}
function renderFoodWheel() {
  const result=foodWheel.selected===null?'':foodWheel.items[foodWheel.selected];
  return `<section id="home-food-wheel" class="home-food-wheel" aria-labelledby="food-wheel-title"><div class="home-section-heading"><div><span class="home-kicker">A LITTLE YUMMY LUCK</span><h2 id="food-wheel-title">今天吃什么</h2></div><button class="text-btn" data-action="food-menu" ${foodWheel.busy?'disabled':''}>${icon('edit')}自定义菜单</button></div><div class="card food-wheel-card"><div class="food-wheel-stage"><span class="food-wheel-spark food-spark-one" aria-hidden="true">✧</span><span class="food-wheel-spark food-spark-two" aria-hidden="true">♡</span><div class="food-wheel-frame"><div class="food-wheel-pointer" aria-hidden="true"></div>${foodWheelSvg()}<button class="food-wheel-center" data-action="spin-food" aria-label="转动吃什么大转盘" ${foodWheel.busy?'disabled':''}>${catSticker('loaf')}<span>开转</span></button></div><p class="food-wheel-caption">小猫替你做个决定 ♡</p></div><div class="food-wheel-copy"><span class="food-wheel-tag">给选择困难一点小魔法</span><h3>好好吃饭，<br>也是今天的小确幸。</h3><p class="food-wheel-description">米粉、小炒，还是热乎乎的一碗面？<br>转一转，看看这一餐的灵感。</p><div class="food-wheel-result" role="status" aria-live="polite" aria-atomic="true"><span>${foodWheel.busy?'小猫正在帮你挑选…':result?'这一餐，就吃':'今天的美味，等你揭晓'}</span><strong>${foodWheel.busy?'转呀转，马上就好':result?esc(result):'会转到什么呢？'}</strong></div><button class="primary food-spin-button" data-action="spin-food" ${foodWheel.busy?'disabled':''}>${icon('refresh')}${foodWheel.busy?'正在转动…':result?'再转一次':'帮我选一餐'}</button><p class="food-wheel-note">每个选项机会相同 · 菜单可以换成你爱吃的</p></div></div><ul class="sr-only" aria-label="转盘菜单">${foodWheel.items.map(item=>`<li>${esc(item)}</li>`).join('')}</ul></section>`;
}
function updateFoodWheel() {
  const section=$('#home-food-wheel');
  if(!section)return;
  section.outerHTML=renderFoodWheel();
}
function spinFoodWheel() {
  if(foodWheel.busy)return;
  foodWheel.busy=true;
  const selected=Math.floor(Math.random()*foodWheel.items.length),step=360/foodWheel.items.length;
  const target=((360-selected*step+(Math.random()-.5)*step*.4)%360+360)%360;
  const rotation=foodWheel.rotation+1800+((target-foodWheel.rotation%360+360)%360);
  foodWheel.duration=matchMedia('(prefers-reduced-motion: reduce)').matches?0:3800;
  const section=$('#home-food-wheel'),disc=section?.querySelector('.food-wheel-disc'),status=section?.querySelector('.food-wheel-result');
  if(section){section.querySelectorAll('button').forEach(button=>button.disabled=true);if(status)status.innerHTML='<span>小猫正在帮你挑选…</span><strong>转呀转，马上就好</strong>';const button=section.querySelector('.food-spin-button');if(button)button.innerHTML=`${icon('refresh')}正在转动…`;}
  if(disc){disc.style.setProperty('--spin-duration',`${foodWheel.duration}ms`);disc.style.transform=`rotate(${rotation}deg)`;}
  foodWheel.rotation=rotation;
  setTimeout(()=>{
    foodWheel.selected=selected;foodWheel.busy=false;
    const saved=saveFoodWheel();
    const restore=document.activeElement?.dataset?.action==='spin-food';
    updateFoodWheel();
    if(restore)$('.food-spin-button')?.focus({preventScroll:true});
    if(!saved)toast('本次结果可用，但菜单未能保存到浏览器');
  },foodWheel.duration);
}
function foodMenuModal() {
  if(foodWheel.busy)return;
  openModal('把爱吃的放进转盘',`<form id="food-menu-form">${field('每行一种美食（2–12 项）',`<textarea name="foods" class="food-menu-input" rows="9" maxlength="160" required>${esc(foodWheel.items.join('\n'))}</textarea><small>每项最多 12 个字；重复选项会合并。保存新菜单后可重新开转。</small>`)}<div class="modal-actions"><button type="button" class="secondary" data-action="close-modal">取消</button><button type="submit" class="primary">保存菜单</button></div></form>`);
}
function renderHomeOverview() {
  const today=W.dayKey(),tasks=tasksOn(today),done=tasks.filter(t=>t.done).length,pending=tasks.filter(t=>!t.done),habits=finishedHabits(today);
  const upcoming=data.countdowns.filter(item=>item.targetAt>Date.now()).sort((a,b)=>a.targetAt-b.targetAt)[0];
  const days=upcoming?Math.ceil((upcoming.targetAt-Date.now())/86400000):0;
  return `<section class="home-overview" id="home-overview" aria-label="今日生活概览"><div class="home-section-heading"><div><span class="home-kicker">TODAY, ONE LITTLE STEP</span><h2>今天的小日子</h2></div>${data.example?'<span class="home-example-label">含示例记录</span>':''}${GrowthCats.home()}</div><div class="home-overview-grid"><section class="card home-task-summary"><div class="home-summary-title"><h3>${icon('calendar')}今日待办</h3><button class="text-btn" data-action="open-today">查看全部 ${icon('right')}</button></div><p class="home-summary-number"><strong>${done}<small> / ${tasks.length}</small></strong><span>件小事已完成</span></p><div class="home-task-preview">${pending.slice(0,3).map(t=>`<div>${checkButton(t,true)}<span>${esc(t.title)}</span></div>`).join('')||`<p>${tasks.length?'今天的待办都完成啦，给自己一个拥抱。':'今天想做什么？先写下一件小事。'}</p>`}</div><button class="text-btn" data-action="home-add-task">${icon('plus')}写一个小目标</button></section><button class="card home-habit-summary" data-action="open-today-habits"><span class="home-summary-title"><h3>${icon('leaf')}习惯小星光</h3>${icon('right')}</span><span class="home-summary-number"><strong>${habits}<small> / ${data.habits.length}</small></strong><span>个习惯已点亮</span></span><span class="home-habit-lights" aria-hidden="true">${data.habits.slice(0,12).map(h=>`<i class="${habitCount(h,today)>=h.target?'lit':''}"></i>`).join('')||'<i></i><i></i><i></i>'}</span><span class="home-summary-caption">点开每周打卡，为今天亮一盏小灯。</span></button><button class="card home-countdown-summary" data-page="countdown"><span class="home-summary-title"><h3>${icon('clock')}值得期待</h3>${icon('right')}</span><span class="home-summary-number"><strong>${upcoming?days:'♡'}<small>${upcoming?'天':''}</small></strong><span>${upcoming?'距离下个重要日子':'收藏一个想期待的日子'}</span></span><span class="home-upcoming-name">${upcoming?esc(upcoming.title):'生日、考试，或下一次旅行'}</span><span class="home-summary-caption">${upcoming?esc(countdownDate(upcoming.targetAt)):'点击添加你的第一个倒计时'}</span></button></div></section>`;
}
function renderHome() {
  const today=W.dayKey();
  return `<section class="home-welcome">${renderDailyJoke(today)}</section>${renderHomeOverview()}<div class="new-home-entries"><button class="new-home-entry" data-page="wishes">${GrowthCats.art('sit','entry-cat')}<span><strong>今年想做的事</strong><small>写下心愿，收藏每一次实现。</small></span></button><button class="new-home-entry" data-page="hotspots">${GrowthCats.art('funny','entry-cat')}<span><strong>小红书精选帖</strong><small>收藏一点生活灵感。</small></span></button></div><div class="home-weather-grid">${renderWeather()}</div>${GrowthJournal.home()}${renderFoodWheel()}`;
}
const C=globalThis.GrowthCountdown;
const REMINDER_LABELS={0:'当天准时提醒',10:'提前 10 分钟',60:'提前 1 小时',1440:'提前 1 天'};
let reminderAudio=null,soundEnabled=false;
try {soundEnabled=localStorage.getItem('upward.countdown-sound.v1')==='on';}catch {}
const countdownDate=timestamp=>new Intl.DateTimeFormat('zh-CN',{year:'numeric',month:'long',day:'numeric',hour:'2-digit',minute:'2-digit',hour12:false}).format(timestamp);
function countdownDigits(item) {
  const p=C.parts(item.targetAt);
  return [['days','天'],['hours','时'],['minutes','分'],['seconds','秒']].map(([key,label])=>`<span><strong>${key==='days'?p[key]:String(p[key]).padStart(2,'0')}</strong><small>${label}</small></span>`).join('');
}
function countdownState(item){return item.targetAt<=Date.now()?(item.group==='health'?'约定时间已到，记得查看安排':'目标时间已到，记得好好庆祝'):'距离这一天，还有';}
function countdownMessage(item) {
  return item.targetAt<=Date.now()?`“${item.title}”的目标时间已到。`:`“${item.title}”将在 ${countdownDate(item.targetAt)} 到来。`;
}
function renderCountdownAlerts() {
  const pending=data.countdowns.filter(item=>item.reminded&&!item.acknowledged);
  return pending.length?`<section class="countdown-alert-box" role="alert" aria-label="倒计时提醒"><div class="countdown-alert-heading">${icon('clock')}重要日子的小提醒</div>${pending.map(item=>`<div class="countdown-alert-row"><p>${esc(countdownMessage(item))}</p><button data-action="ack-countdown" data-id="${esc(item.id)}">知道啦</button></div>`).join('')}<small>网页休眠或关闭期间到期的提醒，会在恢复后补充显示。</small></section>`:'';
}
function notificationLabel() {
  return !('Notification' in window)?'此浏览器不支持系统通知':Notification.permission==='granted'?'系统通知已开启':Notification.permission==='denied'?'系统通知被禁用':'开启系统通知';
}
function renderCountdowns() {
  const sorted=[...data.countdowns].sort((a,b)=>(a.targetAt<=Date.now())-(b.targetAt<=Date.now())||a.targetAt-b.targetAt);
  return `<section class="countdown-intro"><div><span class="home-kicker">LITTLE DAYS, BIG EXPECTATIONS</span><h2>每一个期待，都有到来的日子。</h2><p>考试、生日、旅行……让小猫替你记着。</p></div><div class="countdown-intro-cat" aria-hidden="true">${GrowthCats.art('birthday')}<span>陪你一起等 ♡</span></div></section><div class="countdown-toolbar"><div class="countdown-preferences"><button class="secondary" data-action="enable-countdown-notifications" ${!('Notification' in window)||Notification.permission==='granted'?'disabled':''}>${icon('shield')}<span>${notificationLabel()}</span></button><button class="secondary" data-action="countdown-sound" aria-pressed="${soundEnabled}">${icon('spark')}提示音：${soundEnabled?(reminderAudio?.state==='running'?'开':'点击恢复'):'关'}</button></div><button class="primary" data-action="add-countdown">${icon('plus')}添加倒计时</button></div><p class="countdown-service-note">网页打开时到点提醒；后台休眠可能延迟，关闭网页后无法保证准时通知，重新打开会补提醒。系统通知需浏览器授权，提示音需本次打开后点击开启。</p><div class="countdown-grid">${sorted.length?sorted.map((item,index)=>`<section class="card countdown-card" style="${tint(['pink','green','purple','orange'][index%4])}" data-countdown-id="${esc(item.id)}"><div class="countdown-card-top"><span class="countdown-kind">${icon('calendar')}一个重要的日子</span><button class="more-btn" data-action="edit-countdown" data-id="${esc(item.id)}" aria-label="编辑${esc(item.title)}">${icon('edit')}</button></div><h2>${esc(item.title)}</h2><p class="countdown-target">${countdownDate(item.targetAt)} · 本地时间</p><span class="countdown-state">${countdownState(item)}</span><div class="countdown-digits" aria-label="剩余时间">${countdownDigits(item)}</div><div class="countdown-card-footer"><span>${icon('clock')}${REMINDER_LABELS[item.remindMinutes]}</span><span class="countdown-reminder-status">${item.reminded?item.acknowledged?'已确认提醒':'已提醒 · 待确认':'提醒已设置'}</span></div></section>`).join(''):`<section class="card countdown-empty">${catSticker()}<h2>把第一个期待的日子放进来吧</h2><p>设置日期和时间，到点会出现提醒。</p><button class="primary" data-action="add-countdown">${icon('plus')}添加第一个倒计时</button></section>`}</div>`;
}
function countdownModal(id='',group='') {
  const item=data.countdowns.find(item=>item.id===id),tomorrow=new Date();tomorrow.setDate(tomorrow.getDate()+1);tomorrow.setHours(9,0,0,0);
  openModal((item?.group||group)==='health'?(item?'编辑健康提醒':'添一个健康提醒'):item?'编辑倒计时':'添加一个期待的日子',`<form id="countdown-form"><input type="hidden" name="id" value="${esc(item?.id||'')}"><input type="hidden" name="group" value="${esc(item?.group||group)}">${field((item?.group||group)==='health'?'提醒什么':'倒计时名称',`<input name="title" maxlength="40" required placeholder="${(item?.group||group)==='health'?'例如：复查、洗牙、年度体检':'例如：考试、生日、出发去旅行'}" value="${esc(item?.title||'')}">`)}${field('目标日期与时间',`<input name="target" type="datetime-local" min="1900-01-01T00:00" max="2100-12-31T23:59" required value="${C.localInput(item?.targetAt||tomorrow.getTime())}"><small>按当前设备的本地时间设置；新倒计时请选择未来时间。</small>`)}${field('什么时候提醒',`<select name="remindMinutes">${Object.entries(REMINDER_LABELS).map(([value,label])=>`<option value="${value}" ${Number(value)===(item?.remindMinutes||0)?'selected':''}>${label}</option>`).join('')}</select>`)}<p class="countdown-form-note">网页打开时生效；请在倒计时页开启系统通知或提示音。若提前提醒时间已经过去，保存后会立即提醒。</p><div class="modal-actions">${item?`<button type="button" class="secondary danger" data-action="delete-countdown" data-id="${esc(item.id)}">删除</button>`:''}<button type="button" class="secondary" data-action="close-modal">取消</button><button type="submit" class="primary">${(item?.group||group)==='health'?'保存提醒':'保存倒计时'}</button></div></form>`);
}
function armReminderAudio() {
  try {const Audio=window.AudioContext||window.webkitAudioContext;if(!Audio)return false;reminderAudio ||= new Audio();void reminderAudio.resume().catch(()=>{});return true;}catch{return false;}
}
function playReminderSound() {
  if(!soundEnabled||!reminderAudio||reminderAudio.state!=='running')return;
  try {[0,.22,.44].forEach((offset,index)=>{const oscillator=reminderAudio.createOscillator(),gain=reminderAudio.createGain(),start=reminderAudio.currentTime+offset;oscillator.type='sine';oscillator.frequency.value=[659.25,783.99,987.77][index];gain.gain.setValueAtTime(0,start);gain.gain.linearRampToValueAtTime(.12,start+.025);gain.gain.exponentialRampToValueAtTime(.001,start+.4);oscillator.connect(gain);gain.connect(reminderAudio.destination);oscillator.start(start);oscillator.stop(start+.42);});}catch {}
}
async function showCountdownNotification(item) {
  if(!('Notification' in window)||Notification.permission!=='granted')return;
  const options={body:countdownMessage(item),icon:'./icon-192.png',tag:`countdown-${item.id}`,data:{url:new URL('./#countdown',location.href).href}};
  try {const registration='serviceWorker' in navigator?await navigator.serviceWorker.getRegistration():null;if(registration)await registration.showNotification(`有“记”可循 · ${item.title}`,options);else new Notification(`有“记”可循 · ${item.title}`,options);}catch {toast('系统通知未能发送，请查看页面内的倒计时提醒');}
}
async function enableCountdownNotifications() {
  if(!('Notification' in window)){toast('当前浏览器不支持系统通知，页面提醒仍然有效');return;}
  if(Notification.permission==='denied'){toast('请在浏览器的网站设置中允许通知，再回到这里');return;}
  try {const permission=await Notification.requestPermission();if(page==='countdown')render();toast(permission==='granted'?'系统通知已开启，网页需保持打开':'未开启系统通知，仍会在页面内提醒');}catch {toast('当前环境无法申请通知权限，页面提醒仍然有效');}
}
let homeOverviewSignature='';
function tickCountdowns() {
  if(GrowthLocal.locked)return;
  const overview=$('#home-overview');if(page==='home'&&overview){const signature=JSON.stringify(data.countdowns.map(item=>[item.id,item.title,Math.max(0,Math.ceil((item.targetAt-Date.now())/86400000))]));if(signature!==homeOverviewSignature){homeOverviewSignature=signature;overview.outerHTML=renderHomeOverview();}}
  const due=data.countdowns.filter(item=>C.due(item));
  if(due.length){due.forEach(item=>item.reminded=true);save();playReminderSound();due.forEach(item=>void showCountdownNotification(item));}
  document.querySelectorAll('[data-countdown-id]').forEach(card=>{const item=data.countdowns.find(item=>item.id===card.dataset.countdownId);if(!item)return;card.querySelector('.countdown-digits').innerHTML=countdownDigits(item);card.querySelector('.countdown-state').textContent=countdownState(item);card.querySelector('.countdown-reminder-status').textContent=item.reminded?item.acknowledged?'已确认提醒':'已提醒 · 待确认':'提醒已设置';});
  const alerts=$('#countdown-alerts'),signature=JSON.stringify(data.countdowns.filter(item=>item.reminded&&!item.acknowledged).map(item=>[item.id,item.title,item.targetAt,item.targetAt<=Date.now()]));
  if(alerts&&alerts.dataset.signature!==signature){alerts.dataset.signature=signature;alerts.innerHTML=renderCountdownAlerts();}
}

function renderWishes(){
  const all=data.yearlyGoals.filter(w=>w.year===wishYear),done=all.filter(w=>w.done).length,percent=all.length?Math.round(done/all.length*100):0;
  const list=all.filter(w=>wishFilter==='all'||w.done===(wishFilter==='done')).sort((a,b)=>Number(a.done)-Number(b.done));
  return `<section class="wish-hero"><div><span class="home-kicker">MY LITTLE WISH LIST</span><h2>${wishYear}，想和生活一起完成的事</h2><p>不用很宏大。去一次海边，学一道菜，或多陪陪小猫。</p><div class="wish-progress"><strong>${done} / ${all.length}</strong><span>个心愿已实现</span><b>${percent}%</b></div><div class="progress-track"><div class="progress-fill" style="width:${percent}%"></div></div></div><div class="wish-hero-cat">${GrowthCats.art('reach')}<span>慢慢实现，喵 ♡</span></div></section><div class="new-section-toolbar"><div class="wish-year-controls"><button class="icon-btn" data-action="wish-year-prev" aria-label="上一年" ${wishYear===1900?'disabled':''}>${icon('left')}</button><strong>${wishYear} 年</strong><button class="icon-btn" data-action="wish-year-next" aria-label="下一年" ${wishYear===2100?'disabled':''}>${icon('right')}</button><button class="text-btn" data-action="wish-this-year">今年</button></div><button class="primary" data-action="add-wish">${icon('plus')}写下一个心愿</button></div><div class="wish-filters" aria-label="筛选心愿">${[['all','全部'],['pending','想做的'],['done','已实现']].map(([id,label])=>`<button data-action="wish-filter" data-filter="${id}" aria-pressed="${wishFilter===id}" class="${wishFilter===id?'active':''}">${label}</button>`).join('')}</div>${list.length?`<div class="wish-grid">${list.map((w,i)=>`<article class="wish-card ${w.done?'is-done':''} tone-${wishCategories.indexOf(w.category)%3}"><div class="wish-card-top"><span>${esc(w.category)} · ${String(i+1).padStart(2,'0')}</span><button class="more-btn" data-action="edit-wish" data-id="${esc(w.id)}" aria-label="编辑心愿：${esc(w.title)}">${icon('edit')}</button></div><h2>${esc(w.title)}</h2>${w.note?`<p>${esc(w.note)}</p>`:'<p class="wish-blank">给期待留一点空间 ♡</p>'}<button class="wish-complete" data-action="toggle-wish" data-id="${esc(w.id)}" aria-pressed="${w.done}"><span>${w.done?icon('check'):icon('star')}</span>${w.done?'已经实现啦':'完成后，点亮这颗星'}</button></article>`).join('')}</div>`:empty(all.length?'这里还没有心愿，换个筛选看看吧。':'这一年的愿望清单还是空白，写下第一件想做的事吧。','add-wish','写下心愿')}`;
}
function wishModal(id=''){
  const w=data.yearlyGoals.find(w=>w.id===id)||{id:'',title:'',year:wishYear,category:'生活',note:''};
  openModal(w.id?'编辑我的心愿':'写下一个小心愿',`<form id="wish-form"><input type="hidden" name="id" value="${esc(w.id)}">${field('想做的事',`<input name="title" maxlength="100" required value="${esc(w.title)}" placeholder="例如：带小猫拍一组合照">`)}<div class="field-row">${field('哪一年',`<input type="number" name="year" min="1900" max="2100" required value="${w.year}">`)}${field('分类',`<select name="category">${wishCategories.map(c=>`<option ${w.category===c?'selected':''}>${c}</option>`).join('')}</select>`)}</div>${field('小小备注（选填）',`<textarea name="note" maxlength="1000" placeholder="想怎么实现，或为什么想做？">${esc(w.note)}</textarea>`)}<div class="modal-actions">${w.id?`<button type="button" class="secondary danger" data-action="delete-wish" data-id="${esc(w.id)}">删除心愿</button>`:''}<button type="button" class="secondary" data-action="close-modal">取消</button><button class="primary" type="submit">保存心愿</button></div></form>`);
}
function renderHotspots(){
  const visible=pickFilter==='全部'?picks:picks.filter(p=>p.category===pickFilter);
  return `<section class="hot-hero xhs-hero"><div><span class="home-kicker">LITTLE RED FINDS</span><h2>把喜欢的灵感，留在这一页</h2><p>手作、运动、旅行，和那些让日子变可爱的小发现。</p></div><span class="xhs-stamp" aria-hidden="true">小红书<br>灵感剪贴簿 ♡</span></section><div class="new-section-toolbar"><div class="wish-filters hot-source-tabs" role="group" aria-label="精选帖分类">${['全部',...H.categories].map(c=>`<button data-action="pick-filter" data-category="${c}" class="${c===pickFilter?'active':''}" aria-pressed="${c===pickFilter}">${c}</button>`).join('')}</div><button class="primary" data-action="add-pick" ${pickError?'disabled':''}>${icon('plus')}收藏帖子</button></div><p class="xhs-source-note">初始 4 篇来自小红书公开发现页，精选于 2026年11月11日；此后由你收藏维护。点击卡片阅读原帖，部分帖子可能需要登录小红书。</p>${pickError?`<p class="storage-warning" role="alert">${esc(pickError)}</p>`:''}<div class="xhs-grid">${visible.map((p,i)=>`<article class="xhs-pick card"><a class="xhs-pick-link" href="${esc(p.url)}" target="_blank" rel="noopener noreferrer"><div class="xhs-paper-art tone-${H.categories.indexOf(p.category)%4}" aria-hidden="true"><span>${({手作:'🧶',运动:'👟',旅行:'🧳',画画:'🎨',日常:'☕',学习:'📚',其他:'🌱'})[p.category]}</span><small>${esc(p.category)} · INSPIRATION</small><i>♡</i></div><div class="xhs-pick-copy"><span class="xhs-source">小红书原帖 ↗</span><h3>${esc(p.title)}</h3><p class="xhs-author">${p.author?'作者 · '+esc(p.author):'我的收藏'}</p><p>${esc(p.note)}</p></div></a><button class="text-btn xhs-edit" data-action="edit-pick" data-id="${esc(p.id)}" aria-label="编辑收藏：${esc(p.title)}">${icon('edit')}编辑收藏</button></article>`).join('')||'<div class="empty"><p>还没有这个分类的帖子，收藏一篇喜欢的吧。</p></div>'}</div><p class="hot-note">卡片插画是分类装饰；下方文字是收藏备注。此处保留标题与原帖链接，不复制帖子正文或图片。</p>`;
}
function pickModal(id=''){
  const p=picks.find(p=>p.id===id)||{id:'',title:'',author:'',category:'日常',url:'',note:''};
  openModal(p.id?'编辑我的收藏':'收藏一篇小红书帖子',`<form id="pick-form">${field('帖子标题',`<input name="title" required maxlength="150" value="${esc(p.title)}" placeholder="给喜欢的帖子写个标题">`)}${field('小红书分享链接',`<textarea name="url" rows="3" maxlength="4000" required placeholder="可粘贴小红书的整段分享文字，自动提取链接">${esc(p.url)}</textarea>`)}<div class="field-row">${field('作者（选填）',`<input name="author" maxlength="60" value="${esc(p.author)}">`)}${field('分类',`<select name="category">${H.categories.map(c=>`<option ${c===p.category?'selected':''}>${c}</option>`).join('')}</select>`)}</div>${field('收藏备注（选填）',`<textarea name="note" maxlength="300" rows="2">${esc(p.note)}</textarea>`)}<p class="pick-form-error" role="alert"></p><div class="modal-actions">${p.id?`<button type="button" class="secondary danger" data-action="remove-pick" data-id="${esc(p.id)}">移除收藏</button>`:''}<button type="button" class="secondary" data-action="close-modal">取消</button><button type="submit" class="primary">保存收藏</button></div></form>`);
  $('#pick-form').addEventListener('submit',event=>{
    event.preventDefault();const f=new FormData(event.target),item={id:p.id||uid(),title:String(f.get('title')).trim(),url:H.extractLink(f.get('url')),author:String(f.get('author')).trim(),category:String(f.get('category')),note:String(f.get('note')).trim()};
    try{const next=picks.filter(x=>x.id!==item.id);next.unshift(item);H.save(next);picks=next;pickFilter='全部';GrowthLocal.changed();closeModal();render();toast('已收进你的灵感剪贴簿');}catch(e){$('.pick-form-error').textContent=e.message||'保存失败，请检查存储空间';}
  });
}

function render() {
  if(page!=='journal')GrowthJournal.seal();
  const [title,subtitle] = PAGES[page];
  $('#app').innerHTML = `<aside class="sidebar"><div class="brand"><div class="brand-mark">${GrowthCats.art('legs','brand-cat-legs')}</div><div><strong>有“记”可循</strong><small>MY LITTLE JOURNAL</small></div></div><div class="nav-label nav-sort-heading"><span>我的成长空间</span><button class="nav-sort-entry" data-nav-order="open" aria-label="调整栏目顺序">调整顺序</button></div><nav aria-label="主导航">${NAV.map(([id,name])=>`<button class="nav-link ${page===id?'active':''}" data-page="${id}" ${page===id?'aria-current="page"':''}>${id==='home'?GrowthCats.art('head'):icon(PAGES[id][2])}<span>${name}</span>${page===id?'<i class="nav-dot"></i>':''}</button>`).join('')}</nav><div class="side-bottom"><div class="side-note">${GrowthCats.art('nap')}${icon('spark')}<p>今天也要开心呀，<br>慢慢来，小猫陪着你。</p></div><button class="nav-link ${page==='settings'?'active':''}" data-page="settings">${icon('settings')}<span>数据与备份</span></button><div class="side-footer"><div class="avatar">${catSticker()}</div><div><strong class="small">我的个人空间</strong><small>认真生活，慢慢成长</small></div>${icon('lock')}</div></div></aside><main class="main"><div class="content"><div class="topbar"><div class="breadcrumb">${icon('home')}<span>我的工作台</span>${icon('right')}<span>${title}</span></div><div class="top-actions"><span class="local-state" data-local-status></span><span class="saved">${icon(storageError?'inbox':'shield')}<span id="save-status" data-local-saved>${storageError?'保存异常':'本机已保存'}</span></span><button class="pill-icon" data-page="settings" aria-label="数据与备份">${icon('settings')}</button></div></div><div class="page-heading"><div><h1>${title}${GrowthCats.heading(page)}</h1><p>${subtitle}</p></div>${page==='home'?`<div class="home-date">${icon('calendar')}${fullDateLabel(W.dayKey())}<span>长沙</span></div>`:['settings','countdown','journal','books','health','wishes','hotspots'].includes(page)?'':datePicker()}</div>${storageError?`<div class="storage-warning" role="alert">${esc(storageError)}</div>`:''}<div id="local-panel"></div><div id="app-update" class="local-update" hidden>App 离线版本已更新，保存当前编辑后可刷新使用。<button class="secondary" data-local="reload">刷新</button></div><div id="countdown-alerts">${renderCountdownAlerts()}</div><div id="page-content">${({health:GrowthHealth.render,books:GrowthBooks.render,hotspots:renderHotspots,wishes:renderWishes,home:renderHome,today:renderToday,journal:GrowthJournal.render,countdown:renderCountdowns,review:renderReview,stats:renderStats,settings:renderSettings})[page]()}</div><div class="bottom-note">${icon('leaf')}一点一滴，成为更喜欢的自己</div></div></main><nav class="mobile-nav" aria-label="手机主导航">${NAV.filter(([id])=>['home','today','journal','wishes'].includes(id)).map(([id,name])=>`<button class="${page===id?'active':''}" data-page="${id}" ${page===id?'aria-current="page"':''}>${icon(PAGES[id][2])}<span>${({home:'首页',today:'计划',journal:'手账',countdown:'倒计时',habits:'习惯',growth:'成长',review:'复盘',stats:'统计',wishes:'心愿'})[id]}</span></button>`).join('')}<button data-action="more-pages" class="${!['home','today','journal','wishes'].includes(page)?'active':''}">${icon('grid')}<span>更多</span></button></nav>`;
  GrowthLocal.paint();
}
function companionArt() { return GrowthCats.companion();
}
function petCompanion() {
  const lines=['喵～收到摸摸！这就陪你把小目标一个个打勾。','爪爪给你力量，先挑一件最容易的小事吧！','你负责慢慢进步，我负责在旁边给你加油。','休息也算照顾自己。伸个懒腰，再一起出发吧！'];
  const el=$('#companion-message'),hero=$('.companion-hero');
  if(!el||!hero)return;
  const previous=el.textContent;
  el.textContent=lines[(Math.max(-1,lines.indexOf(previous))+1)%lines.length];
  hero.classList.remove('is-petted');
  requestAnimationFrame(()=>requestAnimationFrame(()=>{if(hero.isConnected)hero.classList.add('is-petted');}));
}
function statCard(name,value,label,color='blue',extra='') {return `<div class="stat" style="${tint(color)}"><div class="stat-icon">${icon(name)}</div><div><div class="stat-value">${value}</div><div class="stat-label">${label}</div></div>${extra?`<span class="stat-extra">${extra}</span>`:''}</div>`;}
function renderToday() {
  const tasks = tasksOn(), done = tasks.filter(t=>t.done).length, percent = tasks.length ? Math.round(done/tasks.length*100) : 0;
  const pending = tasks.filter(t=>!t.done), next = pending.find(t=>t.time) || pending[0];
  const priorities = [...pending].sort((a,b)=>['high','medium','low'].indexOf(a.priority)-['high','medium','low'].indexOf(b.priority)).slice(0,3);
  const hour = new Date().getHours(), greeting = selectedDate===dateKey() ? (hour<6?'夜深了，早点休息':hour<11?'早上好，开启美好的一天':hour<14?'中午好，给自己充充电':hour<19?'下午好，继续稳稳向前':'晚上好，今天也辛苦啦') : '每一天，都值得认真对待';
  return `${data.example?'<div class="demo-banner"><span>当前含有一组示例记录，你可以编辑体验，或清空后开始自己的计划。</span><button data-action="clear-demo">清空示例</button></div>':''}<section class="hero companion-hero" aria-label="小猫陪伴卡片">${companionArt()}<div class="hero-copy"><span class="companion-label">A LITTLE COMPANY · 小猫陪你过今天</span><div class="companion-bubble"><h2>${greeting.replace('，','，喵～<br>')}</h2><p id="companion-message" aria-live="polite">今天也不用很厉害，先做好一件小事。剩下的，我陪你慢慢来 ♡</p></div><div class="hero-tags"><span class="hero-tag">${icon('calendar')}${dateLabel(selectedDate)}</span><button class="pet-cat-button" data-action="pet-cat">摸摸小猫 <span aria-hidden="true">♡</span></button></div></div></section><div class="stats-grid">${statCard('target',`${done}<small>/ ${tasks.length}</small>`,'计划已完成','blue')}${statCard('circle',`${finishedHabits()}<small>/ ${data.habits.length}</small>`,'习惯已打卡','green')}${statCard('chart',`${percent}<small>%</small>`,'当日完成进度','purple')}${statCard('star',`${pending.length}<small>项</small>`,'等待你的小目标','orange')}</div><nav class="daily-section-links" aria-label="每日计划分区"><button data-action="jump-daily-habits">${icon('target')}习惯打卡<span>${finishedHabits()} / ${data.habits.length}</span></button><button data-action="jump-daily-tasks">${icon('calendar')}任务安排<span>${done} / ${tasks.length}</span></button></nav>${renderHabits()}<section id="daily-tasks" class="daily-tasks-section" aria-labelledby="daily-tasks-title" tabindex="-1"><div class="daily-tasks-heading"><div><span class="home-kicker">TODAY'S LITTLE STEPS</span><h2 id="daily-tasks-title">任务安排</h2></div><button class="primary" data-action="add-task">${icon('plus')}添加任务</button></div><div class="dashboard-grid daily-task-grid"><div class="column"><section class="card todos-card"><div class="card-head todo-sticker-heading"><div class="card-title"><div class="todo-sticker"><h2><span class="sr-only">to do list</span><svg class="todo-handwriting" viewBox="0 0 238 76" fill="none" aria-hidden="true"><g stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M23 18Q18 34 17 48Q16 60 29 51M9 32Q22 29 34 30"/><path d="M47 32C33 27 28 49 38 54C53 61 63 28 47 32Z"/><path d="M96 18Q91 32 88 52M90 35C76 21 66 45 74 53Q83 59 89 43"/><path d="M117 32C103 27 98 49 108 54C123 61 133 28 117 32Z"/><path d="M157 18C143 30 137 61 152 53M170 34Q166 44 164 53M173 23l.4-.3"/><path d="M196 34C187 23 175 36 184 42C203 50 185 63 176 53"/><path d="M216 19Q210 35 207 48Q204 60 218 51M199 33Q211 30 225 31"/></g></svg></h2></div><span class="badge">${tasks.length} 项</span></div><button class="add-link" data-action="add-task">${icon('plus')}新建待办</button></div>${tasks.length?`<div class="task-list">${tasks.map(t=>todoRow(t)).join('')}</div><div class="card-foot"><div class="progress-label"><span>慢慢来，每一步都算数</span><span>${percent}%</span></div><div class="progress-track"><div class="progress-fill" style="width:${percent}%"></div></div></div>`:empty('今天的计划，等你来写','add-task')}<button class="list-bottom" data-action="add-task">${icon('plus')}添加一个小目标</button></section><section class="card priority-card">${cardHead('star','优先做这些')}${priorities.length?`<div class="priority-list">${priorities.map(t=>{const [label,color]=PRIORITIES[t.priority];return `<div class="priority-row"><span class="priority-chip" style="${tint(color)}">${label}</span><div class="priority-info"><button class="task-name" data-action="edit-task" data-id="${esc(t.id)}">${esc(t.title)}</button><p>${t.time?`${t.time}${t.end?' — '+t.end:''}`:'时间由你安排'}</p></div>${checkButton(t,true)}</div>`;}).join('')}</div>`:empty(tasks.length?'计划都完成了，给自己一点掌声':'添加任务后，这里会按优先级排列')}</section></div><div class="column"><section class="card next-card">${cardHead('clock','下一件小事')}<div class="next-content">${next?`<div class="next-title">${esc(next.title)}</div><div class="next-meta">${icon('clock')}${next.time?`${next.time}${next.end?' — '+next.end:''}`:'按自己的节奏开始'}</div><button class="primary full" data-action="edit-task" data-id="${esc(next.id)}">查看任务 ${icon('right')}</button>`:`<div class="next-title">${tasks.length?'给自己一点休息':'从一件小事开始'}</div><div class="next-meta">${tasks.length?'今天的计划已经全部完成':'把想做的事，变成今天的行动'}</div><button class="primary full" data-action="${tasks.length?'go-review':'add-task'}">${tasks.length?'写一写复盘':'添加任务'} ${icon('right')}</button>`}</div></section><section class="card quote-card"><div class="quote-mark">“</div><p>你不需要看见整座阶梯，<br>只要迈出第一步。</p><small>给今天的自己</small></section></div></div></section>`;
}
function todoRow(t) {return `<div class="todo-row ${t.done?'task-done':''}">${checkButton(t)}<div class="todo-info"><button class="task-name" data-action="edit-task" data-id="${esc(t.id)}">${esc(t.title)}</button>${t.time?`<div class="todo-meta"><span>${t.time}</span></div>`:''}</div>${editButton('task',t.id,t.title)}</div>`;}
function habitWeekDays() {
  const monday=shiftDate(selectedDate,-((parseDate(selectedDate).getDay()+6)%7));
  return Array.from({length:7},(_,i)=>shiftDate(monday,i));
}
function habitArt(h){
  const faces='<circle cx="20" cy="27" r="1" fill="#665641"/><circle cx="28" cy="27" r="1" fill="#665641"/><path d="M22 31q2 2 4 0" fill="none"/>';
  const english=h.icon==='book'&&/英|语|单词|学习/.test(h.name);
  const drawings={
    run:'<path d="m15 12 10 3-2 10 6 4 9 1q5 2 3 8H8q-1-7 6-11Z" fill="#b6cda1"/><path d="m15 20 7 2m-9 3 8 2M8 35h33"/><path d="m5 16 5-2m-7 8h5" stroke="#d9a653"/><circle cx="29" cy="33" r="1" fill="#665641"/><circle cx="34" cy="33" r="1" fill="#665641"/>',
    book:english?'<path d="M8 9h32v25H23l-8 7v-7H8Z" fill="#f2c5b7"/><text x="24" y="27" text-anchor="middle" font-family="Comic Sans MS,cursive" font-weight="bold" font-size="14" fill="#805c48" stroke="none">hi!</text><path d="m34 5 2-3m7 8 3-1" stroke="#c69b44"/>':'<path d="M5 14q9-4 19 1 10-5 19-1v25q-10-4-19 0-10-4-19 0Z" fill="#f1d395"/><path d="M24 15v24M10 21l9 1m-9 5 8 1m11-6 9-1m-9 7 9-1"/><path d="m17 8 2-5 5 4 5-3 2 6" fill="#d4c4ae"/><circle cx="22" cy="9" r=".7"/><circle cx="27" cy="9" r=".7"/>',
    water:'<path d="M12 17h23l-3 25H15Z" fill="#c2dce4"/><path d="M35 21h5q7 10-6 11M13 24h20"/><path d="m28 5-4 12" stroke="#cd956c"/><path d="M18 6q-3 3 0 6" stroke="#96b4a9"/>'+faces,
    moon:'<path d="M33 9a17 17 0 1 0 7 26A18 18 0 0 1 33 9Z" fill="#d6c8e5"/><path d="m12 26 3 1m6-1 3-2m-8 7q4 3 6-1"/><path d="m39 5 1 4 4 1-4 1-1 4-1-4-4-1 4-1Z" fill="#edce75" stroke="#bf9b4a"/><text x="3" y="12" font-size="8" fill="#9583ad" stroke="none">z</text>',
    target:'<path d="M15 29h20l-3 13H18Z" fill="#e6b295"/><path d="M25 30V13"/><path d="M25 23Q9 25 10 12q13-1 15 11Z" fill="#b8cb96"/><path d="M25 17Q25 5 38 7q0 12-13 10Z" fill="#97b48a"/><circle cx="21" cy="34" r="1" fill="#665641"/><circle cx="28" cy="34" r="1" fill="#665641"/><path d="M23 38q2 2 4 0"/>',
    note:'<rect x="10" y="7" width="28" height="35" rx="4" fill="#edd6af"/><path d="M16 7v35m6-24h10m-10 7h7m-7 7h10"/><path d="m31 8 3-6 3 6-3-1Z" fill="#b4c3a0"/>',
    video:'<rect x="6" y="12" width="29" height="25" rx="6" fill="#d8c8e4"/><path d="m35 20 9-5v21l-9-5Z" fill="#e4b396"/><circle cx="16" cy="24" r="2" fill="#665641"/><circle cx="25" cy="24" r="2" fill="#665641"/><path d="m18 30 5 0"/>'
  };
  const drawing=drawings[h.icon]||drawings.target;
  return `<svg class="habit-doodle" viewBox="0 0 48 48" fill="none" stroke="#7e705b" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${drawing}</svg>`;
}

const DRINKS=[{id:'water',name:'白水'},{id:'coffee',name:'咖啡'},{id:'milktea',name:'奶茶'},{id:'tea',name:'茶'},{id:'juice',name:'果汁'},{id:'milk',name:'牛奶'},{id:'soda',name:'汽水'}];
let drinkImageDraft='',drinkImageBusy=false,drinkImageEpoch=0;
const isDrinkHabit=h=>h.icon==='water'||/喝了啥|喝什么|饮品/.test(h.name)||Object.keys(h.drinks||{}).length>0;
function drinkArt(record){
  if(record.kind==='photo')return `<img class="drink-photo-sticker" src="${esc(record.image)}" alt="自定义饮品贴纸">`;
  const drawings={
    water:'<path d="M18 5h12v7l5 5v24q0 4-4 4H17q-4 0-4-4V17l5-5Z" fill="#d4ebed"/><rect x="17" y="3" width="14" height="6" rx="2" fill="#9cbdcd"/><path d="M14 25q9-4 20 0v13H14Z" fill="#a7d1df"/><path d="M21 15v5" stroke="white" stroke-width="3"/>',
    coffee:'<path d="m12 16 4 28h18l4-28Z" fill="#e8c9a5"/><path d="M14 24h22l-1 12H15Z" fill="#fff4df"/><path d="M12 10h26l3 7H9Z" fill="#a58a71"/><path d="M15 7h20v4H15Z" fill="#bca28d"/><path d="M25 28c-5-5-9 2 0 6 9-4 5-11 0-6Z" fill="#c58d83" stroke="none"/>',
    milktea:'<path d="m12 18 4 26h17l4-26Z" fill="#e5bd98"/><path d="M13 26h23l-2 14H15Z" fill="#eed3b3"/><path d="M11 18q0-13 13-13t14 13Z" fill="#f9eadd"/><path d="m30 3-6 22" stroke="#bb8ca4" stroke-width="3"/><path d="M10 18h29"/><g fill="#816653" stroke="none"><circle cx="20" cy="37" r="2"/><circle cx="28" cy="40" r="2"/><circle cx="26" cy="33" r="2"/><circle cx="19" cy="42" r="1.5"/></g>',
    tea:'<path d="M9 18h28v18q-1 9-14 8Q9 44 9 35Z" fill="#c5d6ac"/><path d="M37 22h4q8 13-5 13M10 25h26"/><path d="M18 5q-5 4 0 8m9-10q-5 4 0 8" stroke="#b5c89f"/><path d="M18 33q7-10 12-5-2 9-12 5Z" fill="#91ae78"/><path d="m19 33 8-3"/>',
    juice:'<path d="m15 4 19 2 6 10-4 28H12V16Z" fill="#f4cb7b"/><path d="m15 4 1 11 24 1M16 15l-4 1M34 6l-3 9v29"/><path d="m26 2-3 12" stroke="#c38b6d" stroke-width="2.5"/><circle cx="22" cy="30" r="8" fill="#f4a761"/><path d="M23 21q0-6 7-5-1 5-7 5Z" fill="#91ae78"/><path d="M17 28q-2 4 1 6" stroke="#fff2ca"/>',
    milk:'<path d="m15 5 18 0 6 10v29H10V15Z" fill="#fffcf0"/><path d="m15 5 3 10h21M18 15v29"/><path d="M10 15h8v29h-8ZM18 15h21v10H18Z" fill="#b7d4e1"/><path d="M15 5h18l-3 5H16Z" fill="#b7d4e1"/><path d="m24 31 1-3 3 2 3-2 3 3v6q-5 4-10 0Z" fill="#e4d9c4"/><circle cx="27" cy="33" r=".8" fill="#76644d"/><circle cx="31" cy="33" r=".8" fill="#76644d"/>',
    soda:'<rect x="13" y="5" width="23" height="39" rx="6" fill="#e9b9b0"/><path d="M14 12h21M14 38h21"/><ellipse cx="24.5" cy="7" rx="8" ry="2" fill="#e3e1d6"/><path d="m23 6 4 0"/><circle cx="24" cy="26" r="8" fill="#fff1d9"/><path d="m26 19-6 8h6l-3 6" stroke="#c89065"/><g fill="#fff4e2" stroke="none"><circle cx="30" cy="15" r="1.4"/><circle cx="18" cy="34" r="1.3"/></g>'
  };
  return `<svg class="drink-art" viewBox="0 0 48 48" fill="none" stroke="#89775e" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${drawings[record.kind]||drawings.water}</svg>`;
}
function drinkDayCell(h,day,today){
  const record=h.drinks?.[day],name=record?(DRINKS.find(d=>d.id===record.kind)?.name||'自定义饮品'):'',done=habitCount(h,day)>=h.target;
  const label=`${h.name}，${day}，${record?name+'，点击更换或移除':done?'已有打卡，点击贴饮品':'未贴饮品，点击选择'}`;
  return `<td class="${day===today?'is-today':''}"><button type="button" class="habit-day-dot drink-day-slot ${record?'has-drink':done?'has-legacy-check':''}" data-action="record-drink" data-id="${esc(h.id)}" data-day="${day}" aria-label="${esc(label)}" title="${esc(label)}" ${validDate(day)?'':'disabled'}><span>${record?drinkArt(record):icon(done?'check':'plus')}</span></button></td>`;
}
function drinkModal(h,day){
  if(!h||!validDate(day))return;
  const record=h.drinks?.[day];drinkImageEpoch++;drinkImageBusy=false;drinkImageDraft=record?.kind==='photo'?record.image:'';
  openModal('今天喝了什么？',`<p class="mood-picker-date">${esc(fullDateLabel(day))} · ${esc(h.name)}</p><p class="modal-description">选一张饮品贴纸，贴进这一天。每天一张，随时可以更换。</p><div class="drink-sticker-picker" role="group" aria-label="饮品贴纸">${DRINKS.map(d=>`<button type="button" class="drink-sticker-option ${record?.kind===d.id?'is-selected':''}" data-action="save-drink" data-id="${esc(h.id)}" data-day="${day}" data-drink="${d.id}" aria-pressed="${record?.kind===d.id}">${drinkArt({kind:d.id})}<span>${d.name}</span></button>`).join('')}</div><form id="drink-photo-form"><input type="hidden" name="id" value="${esc(h.id)}"><input type="hidden" name="day" value="${day}"><div class="drink-upload-box"><span id="drink-photo-preview">${drinkImageDraft?drinkArt({kind:'photo',image:drinkImageDraft}):icon('upload')}</span><div><button type="button" class="text-btn" data-action="choose-drink-image">上传自己的饮品小图</button><p id="drink-image-status" role="status">JPG / PNG / WebP，最大 10 MB；自动裁成小贴纸。</p></div><button type="submit" class="secondary" id="save-drink-photo" ${drinkImageDraft?'':'disabled'}>贴上</button></div><input type="file" id="drink-image-file" accept="image/jpeg,image/png,image/webp" hidden aria-label="上传饮品贴纸"></form><p class="drink-record-note">贴上后计为当天习惯已完成；移除贴纸会恢复贴之前的打卡状态。图片仅保存在本机，包含在备份中。</p><div class="modal-actions">${record?`<button type="button" class="secondary" data-action="remove-drink" data-id="${esc(h.id)}" data-day="${day}">移除这张贴纸</button>`:''}<button type="button" class="secondary" data-action="close-modal">取消</button></div>`);
}
function saveDrink(h,day,record){
  if(!h||!validDate(day)||record!==null&&!GrowthData.validDrink(record))return;
  const previousLogs=h.logs,previousDrinks=h.drinks;
  Object.assign(h,GrowthData.withHabitDrink(h,day,record));
  try{validateData(data);}catch(error){h.logs=previousLogs;if(previousDrinks===undefined)delete h.drinks;else h.drinks=previousDrinks;toast(error.message);return;}
  if(!save()){h.logs=previousLogs;if(previousDrinks===undefined)delete h.drinks;else h.drinks=previousDrinks;return;}
  closeModal();render();toast(record?'饮品贴好啦 ♡':'已移除贴纸，恢复原来的打卡状态');
  Array.from(document.querySelectorAll('[data-action="record-drink"]')).find(el=>el.dataset.id===h.id&&el.dataset.day===day)?.focus({preventScroll:true});
}
async function handleDrinkImage(input){
  const file=input.files[0],form=$('#drink-photo-form');if(!file||!form)return;
  const epoch=++drinkImageEpoch;drinkImageBusy=true;$('#save-drink-photo').disabled=true;$('#drink-image-status').textContent='正在把图片变成小贴纸…';
  try{
    const image=await readCategoryImage(file,96,16000);
    if(epoch!==drinkImageEpoch||!form.isConnected)return;
    drinkImageDraft=image;$('#drink-photo-preview').innerHTML=drinkArt({kind:'photo',image});$('#drink-image-status').textContent='小贴纸准备好了，点击“贴上”保存。';
  }catch(error){if(epoch===drinkImageEpoch&&form.isConnected){$('#drink-image-status').textContent=error.message;toast(error.message);}}
  finally{if(epoch===drinkImageEpoch&&form.isConnected){drinkImageBusy=false;input.value='';$('#save-drink-photo').disabled=!drinkImageDraft;}}
}


const MOOD_COLORS=[
  {id:'red',name:'红色',label:'焦虑、害怕、妒忌、烦躁、愤怒、羞耻'},
  {id:'blue',name:'蓝色',label:'平静、踏实、安心、松弛'},
  {id:'slate',name:'灰蓝色',label:'疲惫、麻木、无聊、迷茫、低能量'},
  {id:'green',name:'绿色',label:'治愈、满足、温暖、感动'}
];
function renderMoodRow(days,today){
  return `<tr class="weekly-mood-row"><th scope="row"><div class="habit-week-name"><span class="habit-week-icon mood-row-art" aria-hidden="true"><i></i><i></i><i></i><i></i></span><span class="habit-name-button mood-row-label">情绪</span></div></th>${days.map(day=>{const value=data.moodLogs[day],mood=MOOD_COLORS.find(m=>m.id===value),label=`${day}情绪：${mood?mood.name+'，'+mood.label:'未记录'}，点击${mood?'修改':'记录'}`;return `<td class="${day===today?'is-today':''}"><button class="habit-day-dot mood-day-dot ${mood?'has-mood mood-'+mood.id:''}" data-action="record-week-mood" data-day="${day}" aria-label="${esc(label)}" title="${esc(label)}"><span>${mood?'<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="8" cy="10" r="1"/><circle cx="16" cy="10" r="1"/><path d="M9 15h6"/></svg>':icon('plus')}</span></button></td>`;}).join('')}</tr>`;
}
function renderMoodLegend(){return `<div class="weekly-mood-legend"><span class="mood-legend-title">情绪色卡 <small>每天选一种颜色，只记录，不计入打卡完成率。</small></span><div>${MOOD_COLORS.map(m=>`<span><i class="mood-swatch mood-${m.id}" aria-hidden="true"></i><span><strong>${m.name}</strong>${m.label}</span></span>`).join('')}</div></div>`;}
function moodModal(day){
  if(!validDate(day))return;
  const value=data.moodLogs[day];
  openModal('给这一天选个情绪色',`<p class="mood-picker-date">${esc(fullDateLabel(day))}</p><p class="modal-description">选择最接近今天感受的一组，之后随时可以换。</p><div class="weekly-mood-picker" role="group" aria-label="四色情绪">${MOOD_COLORS.map(m=>`<button type="button" data-action="save-week-mood" data-day="${day}" data-mood="${m.id}" class="mood-picker-option ${m.id===value?'is-selected':''}" aria-pressed="${m.id===value}"><i class="mood-swatch mood-${m.id}" aria-hidden="true"></i><span><strong>${m.name}</strong><small>${m.label}</small></span>${icon(m.id===value?'check':'right')}</button>`).join('')}</div><div class="modal-actions">${value?`<button type="button" class="secondary" data-action="save-week-mood" data-day="${day}" data-mood="">清除这天情绪</button>`:''}<button type="button" class="secondary" data-action="close-modal">取消</button></div>`);
}
function saveWeekMood(day,value){
  if(!validDate(day)||(value!==''&&!MOOD_COLORS.some(m=>m.id===value)))return;
  const previous=data.moodLogs;data.moodLogs={...previous};
  if(value)data.moodLogs[day]=value;else delete data.moodLogs[day];
  if(!save()){data.moodLogs=previous;return;}
  closeModal();render();toast(value?'这一天的情绪已收好':'已清除这天情绪');
  document.querySelector(`[data-action="record-week-mood"][data-day="${day}"]`)?.focus({preventScroll:true});
}
function renderHabits() {
  const days=habitWeekDays(),today=dateKey(),short=day=>`${parseDate(day).getMonth()+1}月${parseDate(day).getDate()}日`;
  const completed=days.reduce((n,day)=>n+finishedHabits(day),0);
  return `<section id="daily-habits" class="daily-habits-section" aria-labelledby="daily-habits-title" tabindex="-1"><div class="daily-habits-heading">${GrowthCats.art('tucked','habit-corner-cat')}<div><span class="home-kicker">LITTLE HABITS · 一点点坚持</span><h2 id="daily-habits-title">每周习惯打卡</h2><p>做到了，就为自己点亮一颗小圆点 ♡</p></div><button class="primary" data-action="add-habit">${icon('plus')}添加习惯</button></div><div class="card habit-week-card"><div class="habit-week-toolbar"><div class="habit-week-title"><span class="habit-week-sticker" aria-hidden="true">${icon('leaf')}</span><div><span class="habit-week-eyebrow">MY LITTLE WEEK</span><h3 aria-live="polite">${parseDate(days[0]).getFullYear()}年 · ${short(days[0])} — ${short(days[6])}</h3></div></div><div class="habit-week-nav" aria-label="习惯周切换"><button data-action="habit-week-prev" aria-label="上周" ${days[0]<='1900-01-01'?'disabled':''}>${icon('left')}</button><button data-action="habit-week-current">本周</button><button data-action="habit-week-next" aria-label="下周" ${days[6]>='2100-12-31'?'disabled':''}>${icon('right')}</button></div></div><div class="habit-week-scroll"><table class="habit-week-table"><caption class="sr-only">每周习惯打卡，周一至周日。习惯圆点点击标记完成或取消；饮品格点击选择贴纸；情绪一行点击选择四种颜色；睡眠格点击选择大概睡了几小时。</caption><colgroup><col class="habit-name-col">${days.map(()=>'<col>').join('')}</colgroup><thead><tr><th scope="col"><span class="habit-column-label">我的小习惯</span></th>${days.map((day,i)=>`<th scope="col" class="${day===today?'is-today':''}" ${day===today?'aria-current="date"':''}><span>周${'一二三四五六日'[i]}</span><small>${parseDate(day).getMonth()+1}/${parseDate(day).getDate()}</small>${day===today?'<em>今天</em>':''}</th>`).join('')}</tr></thead><tbody>${data.habits.map(h=>GrowthData.isSleepHabit(h)?GrowthSleep.row(days,today,h):`<tr style="${tint(h.color)}"><th scope="row"><div class="habit-week-name"><span class="habit-week-icon" aria-hidden="true">${habitArt(h)}</span><button class="habit-name-button" data-action="edit-habit" data-id="${esc(h.id)}" aria-label="编辑${esc(h.name)}">${esc(h.name)}${isDrinkHabit(h)?'<small class="drink-habit-hint">贴饮品</small>':''}</button><span class="habit-edit-hint" aria-hidden="true">${icon('edit')}</span></div></th>${days.map(day=>{if(isDrinkHabit(h))return drinkDayCell(h,day,today);const n=habitCount(h,day),done=n>=h.target,label=`${h.name}，${day}，${done?'已完成，点击取消':'未完成，点击点亮'}`;return `<td class="${day===today?'is-today':''}"><button class="habit-day-dot ${done?'is-done':''}" data-action="toggle-habit-day" data-id="${esc(h.id)}" data-day="${day}" aria-label="${esc(label)}" aria-pressed="${done}" title="${esc(h.name)} · ${day} · ${n}/${h.target} 次；${done?'点击取消当天打卡':'点击标记当天目标已完成'}" ${validDate(day)?'':'disabled'}><span>${done?icon('check'):''}</span></button></td>`;}).join('')}</tr>`).join('')}${data.habits.some(GrowthData.isSleepHabit)?'':GrowthSleep.row(days,today)}${renderMoodRow(days,today)}</tbody></table></div>${renderMoodLegend()}<div class="habit-week-footer"><span><i aria-hidden="true"></i>点亮 = 已完成 · 睡眠格记个大概 · 饮品格贴贴纸</span><span>本页已点亮 <strong>${completed}</strong> 颗</span></div></div></section>`;
}
function reviewMonthPicker(){
  const month=selectedDate.slice(0,7);
  return `<div class="date-picker review-month-picker">${icon('calendar')}<button class="icon-btn" data-action="review-prev" aria-label="上个月" ${month==='1900-01'?'disabled':''}>${icon('left')}</button><label class="date-input">${Number(month.slice(0,4))}年 ${Number(month.slice(5))}月<input type="month" id="review-month" value="${month}" min="1900-01" max="2100-12" aria-label="选择复盘月份"></label><button class="icon-btn" data-action="review-next" aria-label="下个月" ${month==='2100-12'?'disabled':''}>${icon('right')}</button>${month!==dateKey().slice(0,7)?'<button class="today-button" data-action="review-current">本月</button>':''}</div>`;
}
function renderReview(){
  const month=selectedDate.slice(0,7),r=data.monthlyReviews[month]||GrowthData.emptyReview(),summary=GrowthData.monthlyReviewSummary(data,month);
  return `<div class="page-intro"><div><h2>这个月，也有值得收好的瞬间</h2><p>不用写得很完整，记下你想留下的就好。每个月单独保存。</p></div>${icon('note')}</div>${GrowthSleep.chart(month)}<div class="review-layout"><section class="card review-form"><div class="review-group"><div class="review-label">${icon('sun')}这个月，过得怎么样？</div><div class="moods">${['充实','平静','一般','疲惫'].map(m=>`<button class="mood ${r.mood===m?'active':''}" data-action="mood" data-value="${m}" aria-pressed="${r.mood===m}">${m}</button>`).join('')}</div></div>${[['wins','star','这个月，有哪些小收获？','做成的事、学到的东西，或某个想记住的开心瞬间……'],['lessons','leaf','有什么想慢慢调整？','哪些事有点费劲？下次可以试试什么新办法？'],['tomorrow','sun','下个月，想试试什么？','给下个月的自己，留一两个小期待……']].map(([key,name,label,placeholder])=>`<div class="review-group"><label class="review-label" for="review-${key}">${icon(name)}${label}</label><textarea id="review-${key}" data-review="${key}" maxlength="10000" placeholder="${placeholder}">${esc(r[key])}</textarea></div>`).join('')}</section><aside class="card review-side"><h2>这个月的小小成绩</h2><div class="review-number"><span>计划完成</span><strong>${summary.done} / ${summary.tasks}</strong></div><div class="review-number"><span>习惯达标</span><strong>${summary.habitDone} 次</strong></div><div class="review-number"><span>已留下复盘</span><strong>${summary.months} 个月</strong></div><div class="review-hint">不需要每个月都很厉害。<br>认真过的小日子，都算数。</div></aside></div>${summary.history.length?`<details class="card review-history"><summary>翻翻这个月以前的每日记录 · ${summary.history.length} 篇</summary><div>${summary.history.map(([day,old])=>`<article><h3>${esc(day)}${old.mood?' · '+esc(old.mood):''}</h3>${[['wins','当天的收获'],['lessons','想法与改进'],['tomorrow','给明天的小目标']].map(([key,label])=>old[key]?`<h4>${label}</h4><p>${esc(old[key])}</p>`:'').join('')}</article>`).join('')}</div></details>`:''}`;
}
function reviewCount(){return [...Object.values(data.reviews),...Object.values(data.monthlyReviews)].filter(GrowthData.hasReview).length;}
function saveMonthlyReview(key,value){
  if(!['wins','lessons','tomorrow','mood'].includes(key))return false;
  const month=selectedDate.slice(0,7),record={...(data.monthlyReviews[month]||GrowthData.emptyReview()),[key]:value};
  try{writeGrowthPatch({monthlyReviews:{...data.monthlyReviews,[month]:record}});return true;}
  catch(error){toast(error.message);return false;}
}
function renderStats() {const days=Array.from({length:7},(_,i)=>shiftDate(selectedDate,i-6)),tasks=data.tasks.filter(t=>days.includes(t.date)),done=tasks.filter(t=>t.done).length,habitDone=days.reduce((n,d)=>n+finishedHabits(d),0),totalDone=data.tasks.filter(t=>t.done).length;return `<div class="page-intro"><div><h2>你的努力，都在这里</h2><p>最近 7 天：${dateLabel(days[0])} — ${dateLabel(days[6])}。${data.example?'当前包含示例数据。':''}</p></div>${icon('chart')}</div><div class="stats-grid">${statCard('circle',done,'近 7 天完成任务','blue')}${statCard('target',habitDone,'近 7 天习惯达标次数','green')}${statCard('star',totalDone,'累计完成任务','orange')}${statCard('note',reviewCount(),'累计复盘篇数','purple')}</div><section class="card chart-card"><div class="chart-top"><h2>近 7 天的行动记录</h2><div class="legend"><span><i style="background:#c58c9e"></i>完成任务</span><span><i style="background:#8eaf98"></i>习惯达标</span></div></div><div class="chart">${(()=>{const counts=days.map(d=>[tasksOn(d).filter(t=>t.done).length,finishedHabits(d)]),max=Math.max(4,...counts.flat());return days.map((d,i)=>`<div class="chart-column"><div class="bar-pair"><div class="bar" style="height:${counts[i][0]/max*85}%;background:#c58c9e" title="${d} 完成任务 ${counts[i][0]} 项"><span>${counts[i][0]||''}</span></div><div class="bar" style="height:${counts[i][1]/max*85}%;background:#8eaf98" title="${d} 习惯达标 ${counts[i][1]} 个"><span>${counts[i][1]||''}</span></div></div><span class="chart-day">${parseDate(d).getMonth()+1}/${parseDate(d).getDate()}</span></div>`).join('');})()}</div><p class="chart-empty-note">统计来自你保存的任务和习惯记录。习惯达标以当前设置的每日目标为准；删除记录后会同步更新。</p></section>`;}
function renderSettings() {return `<div id="local-settings">${GrowthLocal.settings()}</div><div class="settings-grid section-gap"><section class="card settings-card"><div class="large-icon" style="${tint('blue')}">${icon('download')}</div><h2>成长记录分项备份</h2><p>兼容以前的成长 JSON 备份，包含计划、习惯、倒计时、年度心愿、书单、阅读摘抄、健康档案、睡眠和复盘。照片手账可在「生活手账」中分项导出；想一次备份全部内容，请用上方的「完整备份」。</p><div class="setting-buttons"><button class="secondary" data-action="export">导出成长记录</button><button class="secondary" data-action="import">导入成长记录</button></div></section><section class="card settings-card"><div class="large-icon" style="${tint('green')}">${icon('shield')}</div><h2>慢慢成长，好好收藏</h2><p>当前保存 ${data.tasks.length} 条任务、${data.habits.length} 个习惯、${data.yearlyGoals.length} 个年度心愿、${(data.books||[]).length} 本书和 ${reviewCount()} 篇复盘。每台设备独立记录；清理浏览器、卸载主屏幕 App 或换手机前，请先导出完整备份。</p><div class="setting-buttons">${data.example?'<button class="secondary" data-action="clear-demo">清空示例记录</button>':''}<button class="secondary danger" data-action="reset">清空成长数据</button></div></section></div><div class="privacy-note">${icon('lock')} 你的生活记录保存在此设备，不上传、不配对、不跨设备同步。离线资源准备完成后，计划、打卡、年度心愿、书单、健康档案、照片手账和转盘可断网使用；天气与小红书原帖需要联网；天气断网时显示已有缓存及其获取时间，精选帖收藏可离线浏览。倒计时提醒需要页面正在运行，关闭 App 后无法保证系统通知。备份包含私人照片，请保存在你自己的文件空间。</div>`;}

function toast(message) {clearTimeout(toastTimer);const el=$('#toast');el.textContent=message;el.classList.add('show');toastTimer=setTimeout(()=>el.classList.remove('show'),3500);}
function scrollDailySection(id) {
  const section=document.getElementById(id);
  if(!section)return;
  section.focus({preventScroll:true});
  section.scrollIntoView({behavior:'instant',block:'start'});
}
function navigate(id,section='') {
  if(id==='habits'){id='today';section='daily-habits';}
  if(!Object.hasOwn(PAGES,id))return;
  if(page==='health'&&id!=='health')GrowthHealth.seal();
  page=id;location.hash=id;render();
  if(id==='home')ensureWeather();
  
  if(section)scrollDailySection(section);else window.scrollTo({top:0,behavior:'instant'});
}
function afterMutation(message='已保存') {const ok=save();render();toast(ok?message:(storageError||'保存失败，请导出备份'));}
function openModal(title,body) {modalReturnFocus=document.activeElement;$('#modal-root').innerHTML=`<div class="modal-overlay"><section class="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title"><div class="modal-header"><h2 id="modal-title">${title}</h2><button class="icon-btn" data-action="close-modal" aria-label="关闭">${icon('x')}</button></div><div class="modal-body">${body}</div></section></div>`;document.body.classList.add('modal-open');($('.modal input:not([type=hidden]):not([hidden]),.modal select:not([hidden]),.modal textarea:not([hidden])') || $('.modal button'))?.focus();}
function closeModal(force=false) {if(GrowthLocal.locked&&!force)return;$('#modal-root').innerHTML='';document.body.classList.remove('modal-open');if(modalReturnFocus?.isConnected)modalReturnFocus.focus();else document.querySelector('h1')?.focus();}
function field(label,html) {return `<label class="field"><span>${label}</span>${html}</label>`;}
function taskModal(id='',schedule=false,category='') {
  const t=data.tasks.find(t=>t.id===id)||{id:'',title:'',date:selectedDate,time:schedule?'09:00':'',end:'',category,priority:'medium',notes:''};
  openModal(t.id?'编辑任务':'给今天加一个小目标',`<form id="task-form"><input type="hidden" name="id" value="${esc(t.id)}">${field('想完成什么？',`<input name="title" value="${esc(t.title)}" maxlength="120" required placeholder="例如：阅读 20 分钟">`)}${field('日期',`<input type="date" name="date" value="${t.date}" min="1900-01-01" max="2100-12-31" required>`)}<div class="field-row">${field('开始时间（可选）',`<input type="time" name="time" value="${t.time}">`)}${field('结束时间（可选）',`<input type="time" name="end" value="${t.end}">`)}</div>${field('优先级',`<select name="priority">${Object.entries(PRIORITIES).map(([key,[name]])=>`<option value="${key}" ${key===t.priority?'selected':''}>${name}优先级</option>`).join('')}</select>`)}${field('给自己一点提示',`<textarea name="notes" maxlength="2000" placeholder="具体做什么，怎样更容易开始……">${esc(t.notes)}</textarea>`)}<div class="modal-actions">${t.id?`<button type="button" class="secondary danger" data-action="delete-task" data-id="${esc(t.id)}">删除</button>`:''}<button type="button" class="secondary" data-action="close-modal">取消</button><button type="submit" class="primary">保存任务</button></div></form>`);
}
function habitModal(id='') {const h=data.habits.find(h=>h.id===id)||{id:'',name:'',target:1,color:'green',icon:'target'};openModal(h.id?'编辑习惯':'从一个小习惯开始',`<form id="habit-form"><input type="hidden" name="id" value="${esc(h.id)}">${field('习惯名称',`<input name="name" maxlength="20" value="${esc(h.name)}" required placeholder="例如：喝杯水">`)}${field('每日目标次数',`<input name="target" type="number" min="1" max="100" step="1" value="${h.target}" required><small>例如喝水 8 次、阅读 1 次。周表点亮圆点即标记当天目标全部完成。饮品图标在周表使用贴纸记录，贴上即记为当天完成。修改目标后，历史完成率会按新目标计算。</small>`)}<div class="field-row">${field('图标',iconSelect(h.icon))}${field('颜色',colorSelect(h.color))}</div><div class="modal-actions">${h.id?`<button type="button" class="secondary danger" data-action="delete-habit" data-id="${esc(h.id)}">删除习惯</button>`:''}<button type="button" class="secondary" data-action="close-modal">取消</button><button type="submit" class="primary">保存习惯</button></div></form>`);}
function iconSelect(value) {return `<select name="icon">${Object.entries({target:'目标',run:'运动',book:'读书 / 学习',water:'饮品贴纸',moon:'睡眠',video:'创作',home:'生活',leaf:'成长',spark:'灵感',note:'记录'}).map(([k,v])=>`<option value="${k}" ${k===value?'selected':''}>${v}</option>`).join('')}</select>`;}
function colorSelect(value) {return `<select name="color">${Object.entries({blue:'草莓奶昔',green:'薄荷绿',orange:'暖杏黄',purple:'浅藤紫',pink:'蔷薇粉',cyan:'湖水青'}).map(([k,v])=>`<option value="${k}" ${k===value?'selected':''}>${v}</option>`).join('')}</select>`;}
function categoryModal(id='') {
  const c=data.categories.find(c=>c.id===id)||{id:'',name:'',description:'',color:'blue',icon:'leaf'};
  categoryImageEpoch++; categoryImageBusy=false; categoryImageDraft=c.iconImage||'';
  openModal(c.id?'编辑成长方向':'新增成长方向',`<form id="category-form"><input type="hidden" name="id" value="${esc(c.id)}">
    ${field('方向名称',`<input name="name" maxlength="40" required value="${esc(c.name)}" placeholder="例如：AI 学习">`)}
    ${field('一句话小目标',`<textarea name="description" maxlength="200" placeholder="你想在这个方向上实现什么？">${esc(c.description)}</textarea>`)}
    <div class="icon-upload-panel"><span class="upload-label">分类图标</span><div class="icon-upload-row">
      <div id="category-icon-preview" class="category-icon-preview" style="${tint(c.color)}">${categoryIcon(c)}</div>
      <div class="icon-upload-info"><div class="icon-upload-buttons"><button type="button" class="secondary" data-action="choose-category-image">${icon('upload')}上传小猫 / 自定义图片</button><button type="button" class="text-btn" id="remove-category-image" data-action="remove-category-image" ${c.iconImage?'':'hidden'}>恢复内置图标</button></div>
      <p id="category-image-status" role="status">支持 JPG、PNG、WebP，最大 10 MB；自动居中裁为方形小图标。</p></div>
    </div><input id="category-image-file" type="file" accept="image/jpeg,image/png,image/webp" hidden aria-label="上传分类图标"></div>
    <div class="field-row">${field('内置图标（未使用图片时显示）',iconSelect(c.icon))}${field('颜色',colorSelect(c.color))}</div>
    <div class="modal-actions">${c.id?`<button type="button" class="secondary danger" data-action="delete-category" data-id="${esc(c.id)}">删除方向</button>`:''}<button type="button" class="secondary" data-action="close-modal">取消</button><button type="submit" class="primary">保存方向</button></div></form>`);
}
function updateCategoryImagePreview(message='') {
  const form=$('#category-form'); if(!form)return;
  const fields=form.elements;
  $('#category-icon-preview').innerHTML=categoryIcon({iconImage:categoryImageDraft,icon:fields.namedItem('icon').value});
  $('#category-icon-preview').style.cssText=tint(fields.namedItem('color').value);
  $('#remove-category-image').hidden=!categoryImageDraft;
  const submit=form.querySelector('button[type="submit"]');submit.disabled=categoryImageBusy;submit.textContent=categoryImageBusy?'正在处理图片…':'保存方向';
  if(message)$('#category-image-status').textContent=message;
}
async function readCategoryImage(file,iconSize=128,maxLength=120000) {
  if(!['image/jpeg','image/png','image/webp'].includes(file.type))throw new Error('请选择 JPG、PNG 或 WebP 图片。iPhone 的 HEIC 照片请先转为 JPG。');
  if(file.size>10*1024*1024)throw new Error('图片超过 10 MB，请选择较小的照片。');
  const url=URL.createObjectURL(file),image=new Image();
  try {
    await new Promise((resolve,reject)=>{image.onload=resolve;image.onerror=()=>reject(new Error('图片无法读取，请换一张图片。'));image.src=url;});
    if(!image.naturalWidth||!image.naturalHeight||image.naturalWidth*image.naturalHeight>40000000)throw new Error('图片尺寸过大，请先缩小照片。');
    const canvas=document.createElement('canvas');canvas.width=canvas.height=iconSize;
    const context=canvas.getContext('2d');if(!context)throw new Error('浏览器暂时无法处理图片，请换个浏览器试试。');
    const size=Math.min(image.naturalWidth,image.naturalHeight);
    context.drawImage(image,(image.naturalWidth-size)/2,(image.naturalHeight-size)/2,size,size,0,0,iconSize,iconSize);
    const result=canvas.toDataURL('image/webp',.88);
    if(!validIconImage(result)||result.length>maxLength)throw new Error('图标文件仍然过大，请换一张简单的图片。');
    return result;
  } finally {URL.revokeObjectURL(url);}
}
async function handleCategoryImage(input) {
  const file=input.files[0],form=$('#category-form');if(!file||!form)return;
  const epoch=++categoryImageEpoch;categoryImageBusy=true;updateCategoryImagePreview('正在把照片处理为小图标…');
  try {
    const result=await readCategoryImage(file);
    if(epoch!==categoryImageEpoch||!form.isConnected)return;
    categoryImageDraft=result;updateCategoryImagePreview('图片已准备好，点击“保存方向”后生效；会随数据备份一起导出。');
  } catch(error) {if(epoch===categoryImageEpoch&&form.isConnected){updateCategoryImagePreview(error.message);toast(error.message);}}
  finally {if(epoch===categoryImageEpoch&&form.isConnected){categoryImageBusy=false;input.value='';updateCategoryImagePreview();}}
}
let confirmCallback;
function confirmModal(title,description,callback,label='确认删除') {confirmCallback=callback;openModal(title,`<p class="modal-description">${description}</p><div class="modal-actions"><button class="secondary" data-action="close-modal">取消</button><button class="primary" data-action="confirm">${label}</button></div>`);}
function exportData() {const content=unreadableOriginal ? (localStorage.getItem(KEY)||JSON.stringify(data)) : JSON.stringify(data,null,2);const blob=new Blob([content],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=`有“记”可循-${unreadableOriginal?'原始数据':'成长备份'}-${dateKey()}.json`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);toast('备份已生成，请妥善保存');}
function importData() {const input=document.createElement('input');input.type='file';input.accept='.json,application/json';input.addEventListener('change',async()=>{const file=input.files[0];if(!file)return;if(file.size>15*1024*1024){toast('备份超过 15MB，请检查文件');return;}try{const imported=validateData(JSON.parse(await file.text()));confirmModal('导入这份备份？',`备份包含 ${imported.tasks.length} 条任务、${imported.habits.length} 个习惯、${imported.yearlyGoals.length} 个年度心愿、${imported.books.length} 本书。导入会替换当前成长记录，请确认已导出当前数据。`,()=>{data=imported;storageError='';unreadableOriginal=false;catFilter=null;closeModal();afterMutation('备份导入成功');},'替换并导入');}catch(error){toast(error instanceof SyntaxError?'文件无法解析，请选择有效的 JSON 备份。':error.message);}});input.click();}
document.addEventListener('click',event=>{
  if(GrowthLocal.locked)return;
  const button=event.target.closest('button');
  if (!button) {if(event.target.classList.contains('modal-overlay'))closeModal();return;}
  if(button.dataset.page){navigate(button.dataset.page);return;}
  const {action,id}=button.dataset;
  if(!action)return;
  const task=data.tasks.find(t=>t.id===id),habit=data.habits.find(h=>h.id===id);
  switch(action){
    case 'more-pages':openModal('我的生活空间',`<div class="more-page-grid">${NAV.map(([route,name])=>`<button class="secondary" data-action="choose-page" data-route="${route}">${icon(PAGES[route][2])}${name}</button>`).join('')}</div><div class="nav-sort-mobile"><button data-nav-order="open">调整栏目顺序</button></div>`);break;
    case 'choose-page':closeModal();navigate(button.dataset.route);break;
    case 'add-pick':pickModal();break;
    case 'edit-pick':pickModal(button.dataset.id);break;
    case 'pick-filter':pickFilter=button.dataset.category;render();break;
    case 'remove-pick':confirmModal('移除这篇收藏？','只移除本工作台的链接收藏，小红书原帖不受影响。',()=>{try{const next=picks.filter(p=>p.id!==button.dataset.id);H.save(next);picks=next;closeModal();render();toast('已移除收藏');}catch{toast('移除失败，原收藏仍保留');}},'移除收藏');break;
    case 'wish-year-prev':case 'wish-year-next':wishYear=Math.max(1900,Math.min(2100,wishYear+(action==='wish-year-prev'?-1:1)));render();break;
    case 'wish-this-year':wishYear=new Date().getFullYear();render();break;
    case 'wish-filter':if(['all','pending','done'].includes(button.dataset.filter)){wishFilter=button.dataset.filter;render();}break;
    case 'add-wish':wishModal();break;
    case 'edit-wish':wishModal(id);break;
    case 'toggle-wish':{const wish=data.yearlyGoals.find(w=>w.id===id);if(wish){wish.done=!wish.done;afterMutation(wish.done?'又实现了一个小心愿 ♡':'已恢复为未完成');}break;}
    case 'delete-wish':{const wish=data.yearlyGoals.find(w=>w.id===id);if(wish)confirmModal('删除这个心愿？',`“${esc(wish.title)}”将从年度清单中移除。`,()=>{data.yearlyGoals=data.yearlyGoals.filter(w=>w.id!==id);closeModal();afterMutation('心愿已删除');});break;}
    case 'add-countdown':countdownModal();break;
    case 'edit-countdown':countdownModal(id);break;
    case 'delete-countdown':{const item=data.countdowns.find(item=>item.id===id);if(item)confirmModal('删除这个倒计时？',`“${esc(item.title)}”及其提醒将被移除。`,()=>{data.countdowns=data.countdowns.filter(item=>item.id!==id);closeModal();afterMutation('倒计时已删除');});break;}
    case 'ack-countdown':{const item=data.countdowns.find(item=>item.id===id);if(item){item.acknowledged=true;afterMutation('提醒已确认');}break;}
    case 'enable-countdown-notifications':void enableCountdownNotifications();break;
    case 'countdown-sound':soundEnabled=soundEnabled&&reminderAudio?.state!=='running'?true:!soundEnabled;if(soundEnabled&&!armReminderAudio()){soundEnabled=false;toast('当前浏览器无法播放提示音，页面提醒仍然有效');}try{localStorage.setItem('upward.countdown-sound.v1',soundEnabled?'on':'off');}catch{}if(soundEnabled){reminderAudio?.resume().then(playReminderSound).catch(()=>{});}render();break;
    case 'spin-food':spinFoodWheel();break;
    case 'food-menu':foodMenuModal();break;
    case 'next-joke':nextJoke();break;
    case 'pet-cat':petCompanion();break;
    case 'refresh-weather':ensureWeather(true);break;
    case 'home-add-task':selectedDate=W.dayKey();taskModal();break;
    case 'open-today':selectedDate=W.dayKey();navigate('today');break;
    case 'open-today-habits':selectedDate=W.dayKey();navigate('today','daily-habits');break;
    case 'jump-daily-habits':scrollDailySection('daily-habits');break;
    case 'jump-daily-tasks':scrollDailySection('daily-tasks');break;
    case 'open-today-review':selectedDate=W.dayKey();navigate('review');break;
    case 'close-modal':closeModal();break;
    case 'confirm':{const callback=confirmCallback;confirmCallback=null;callback?.();break;}
    case 'date-prev':case 'date-next':{const day=shiftDate(selectedDate,action==='date-prev'?-1:1);if(validDate(day)){selectedDate=day;render();}break;}
    case 'review-prev':case 'review-next':{const d=parseDate(selectedDate.slice(0,7)+'-01');d.setMonth(d.getMonth()+(action==='review-prev'?-1:1));const next=dateKey(d);if(validDate(next)){selectedDate=next;render();}break;}
    case 'review-current':selectedDate=dateKey();render();break;
    case 'date-today':selectedDate=dateKey();render();break;
    case 'add-task':taskModal();break;
    case 'add-schedule':taskModal('',true);break;
    case 'add-filtered-task':taskModal('',false,catFilter||'');break;
    case 'edit-task':if(task)taskModal(id);break;
    case 'toggle-task':if(task){task.done=!task.done;afterMutation(task.done?'又完成了一件小事，真好':'已恢复为待办');}break;
    case 'delete-task':if(task)confirmModal('删除这项任务？',`“${esc(task.title)}”会从日程和待办中一起移除。`,()=>{data.tasks=data.tasks.filter(t=>t.id!==id);closeModal();afterMutation('任务已删除');});break;
    case 'habit-week-prev':case 'habit-week-next':case 'habit-week-current':{
      const next=action==='habit-week-current'?dateKey():shiftDate(selectedDate,action==='habit-week-prev'?-7:7);
      selectedDate=next<'1900-01-01'?'1900-01-01':next>'2100-12-31'?'2100-12-31':next;
      render();
      document.querySelector(`[data-action="${action}"]`)?.focus({preventScroll:true});
      break;
    }
    case 'record-drink':drinkModal(habit,button.dataset.day);break;
    case 'save-drink':saveDrink(habit,button.dataset.day,{kind:button.dataset.drink});break;
    case 'remove-drink':saveDrink(habit,button.dataset.day,null);break;
    case 'choose-drink-image':$('#drink-image-file')?.click();break;
    case 'record-week-mood':moodModal(button.dataset.day);break;
    case 'save-week-mood':saveWeekMood(button.dataset.day,button.dataset.mood);break;
    case 'toggle-habit-day':{
      const day=button.dataset.day;
      if(habit&&validDate(day)){
        const done=habitCount(habit,day)>=habit.target;
        habit.logs[day]=done?0:habit.target;
        afterMutation(done?'已取消这一天的打卡':'一颗小圆点亮起来啦！');
        Array.from(document.querySelectorAll('[data-action="toggle-habit-day"]')).find(el=>el.dataset.id===id&&el.dataset.day===day)?.focus({preventScroll:true});
      }
      break;
    }
    case 'add-habit':habitModal();break;
    case 'edit-habit':if(habit)habitModal(id);break;
    case 'cycle-habit':case 'plus-habit':case 'minus-habit':if(habit){const n=habitCount(habit),next=action==='cycle-habit'?(n>=habit.target?0:n+1):Math.max(0,Math.min(habit.target,n+(action==='plus-habit'?1:-1)));habit.logs[selectedDate]=next;afterMutation(next>=habit.target?'这个习惯，今天也做到了':'打卡记录已更新');}break;
    case 'delete-habit':if(habit)confirmModal('删除这个习惯？','该习惯及全部历史打卡会一起删除。需要保留记录时，请先在“数据与备份”中导出。',()=>{data.habits=data.habits.filter(h=>h.id!==id);closeModal();afterMutation('习惯已删除');});break;
    case 'add-category':categoryModal();break;
    case 'edit-category':categoryModal(id);break;
    case 'choose-category-image':$('#category-image-file')?.click();break;
    case 'remove-category-image':categoryImageEpoch++;categoryImageDraft='';categoryImageBusy=false;updateCategoryImagePreview('已恢复内置图标，保存方向后生效。');break;
    case 'delete-category':confirmModal('删除这个成长方向？','已有任务会保留，并调整为“未分类”。',()=>{data.categories=data.categories.filter(c=>c.id!==id);data.tasks.forEach(t=>{if(t.category===id)t.category='';});if(catFilter===id)catFilter=null;closeModal();afterMutation('成长方向已删除');});break;
    case 'filter-category':catFilter=catFilter===id?null:id;render();if(catFilter)$('.section-gap')?.scrollIntoView({behavior:'smooth',block:'nearest'});break;
    case 'go-review':navigate('review');break;
    case 'mood':{const r=data.monthlyReviews[selectedDate.slice(0,7)];if(saveMonthlyReview('mood',r?.mood===button.dataset.value?'':button.dataset.value)){render();toast('这个月的状态已记录');}break;}
    case 'export':try{exportData();}catch{toast('导出失败，浏览器无法读取本地存储');}break;
    case 'import':importData();break;
    case 'clear-demo':confirmModal('从自己的计划开始？','这会清空全部示例及你在示例基础上添加的任务、打卡、睡眠、倒计时和复盘，保留习惯名称。请先导出想保留的记录。',()=>{data.example=false;data.tasks=[];data.reviews={};data.monthlyReviews={};data.sleepLogs={};data.countdowns=[];data.habits.forEach(h=>{h.logs={};if(h.drinks)h.drinks={};});closeModal();afterMutation('已清空记录，开始你的第一天吧');},'清空并开始');break;
    case 'reset':confirmModal('清空成长数据？','将删除本机的全部任务、习惯、倒计时、年度心愿、书单、阅读摘抄、健康档案、睡眠和复盘。照片手账独立保存，不受影响。此操作无法撤销，请先导出备份。',()=>{data=emptyData();storageError='';unreadableOriginal=false;catFilter=null;closeModal();afterMutation('成长数据已清空');},'确认清空全部');break;
    case 'install':GrowthLocal.install();break;
  }
});
document.addEventListener('change',event=>{
  if(event.target.id==='review-month'&&GrowthData.validMonth(event.target.value)){selectedDate=event.target.value+'-01';render();}
  if(event.target.id==='selected-date'&&validDate(event.target.value)){selectedDate=event.target.value;render();}
  if(event.target.id==='drink-image-file')void handleDrinkImage(event.target);
  if(event.target.id==='category-image-file')handleCategoryImage(event.target);
  if(event.target.closest('#category-form')&&['icon','color'].includes(event.target.name))updateCategoryImagePreview();
});
document.addEventListener('input',event=>{const key=event.target.dataset.review;if(!key)return;const ok=saveMonthlyReview(key,event.target.value);const status=$('#save-status');if(status)status.textContent=ok?'复盘已保存':'保存失败，请导出';clearTimeout(reviewTimer);reviewTimer=setTimeout(()=>{if(status?.isConnected&&ok)status.textContent='本机已保存';},1200);});
document.addEventListener('submit',event=>{
  const form=event.target,formId=form.getAttribute('id');
  if(formId==='drink-photo-form'){
    event.preventDefault();if(GrowthLocal.locked||drinkImageBusy||!drinkImageDraft)return;
    const f=Object.fromEntries(new FormData(form));saveDrink(data.habits.find(h=>h.id===f.id),f.day,{kind:'photo',image:drinkImageDraft});return;
  }
  if(formId==='wish-form'){
    event.preventDefault();if(GrowthLocal.locked)return;
    const f=Object.fromEntries(new FormData(form)),year=Number(f.year),title=String(f.title||'').trim(),note=String(f.note||'').trim();
    if(!title||title.length>100||note.length>1000||!Number.isInteger(year)||year<1900||year>2100||!wishCategories.includes(f.category)){toast('请检查心愿名称、年份和分类');return;}
    const old=data.yearlyGoals.find(w=>w.id===f.id);
    if(!old&&data.yearlyGoals.length>=2000){toast('最多可保存 2000 个年度心愿');return;}
    const item={id:old?.id||uid(),title,year,category:f.category,note,done:old?.done||false};
    if(old)Object.assign(old,item);else data.yearlyGoals.push(item);
    wishYear=year;wishFilter='all';closeModal();afterMutation('心愿已收好，慢慢实现吧 ♡');return;
  }
  if(formId==='countdown-form'){
    event.preventDefault();const fields=Object.fromEntries(new FormData(form)),title=String(fields.title||'').trim(),targetAt=C.parseLocal(fields.target),remindMinutes=Number(fields.remindMinutes);
    if(!title||title.length>40||!Number.isFinite(targetAt)||!C.offsets.includes(remindMinutes)){toast('请填写名称、有效日期和提醒时间');return;}
    const old=data.countdowns.find(item=>item.id===fields.id);
    if((!old||old.targetAt!==targetAt)&&targetAt<=Date.now()){toast('请选择一个未来的目标日期和时间');return;}
    if(!old&&data.countdowns.length>=100){toast('最多可保存 100 个倒计时');return;}
    const changed=!old||old.targetAt!==targetAt||old.remindMinutes!==remindMinutes;
    const item={id:old?.id||uid(),title,targetAt,remindMinutes,reminded:changed?false:old.reminded,acknowledged:changed?false:old.acknowledged,...((old?.group||fields.group)==='health'?{group:'health'}:{})};
    if(!C.validItem(item)){toast('请检查目标日期与时间');return;}
    try{writeGrowthPatch({countdowns:old?data.countdowns.map(r=>r.id===old.id?item:r):[...data.countdowns,item]});}
    catch(e){toast(e.message);return;}
    if(soundEnabled)armReminderAudio();closeModal();afterMutation('倒计时和提醒已保存');tickCountdowns();return;
  }
  if(formId==='food-menu-form'){
    event.preventDefault();
    const items=[...new Set(String(new FormData(form).get('foods')||'').split(/\r?\n/).map(item=>item.trim()).filter(Boolean))];
    if(items.length<2||items.length>12||items.some(item=>item.length>12)){toast('请填写 2–12 种美食，每项最多 12 个字');return;}
    foodWheel.items=items;foodWheel.selected=null;foodWheel.rotation=0;
    const saved=saveFoodWheel();closeModal();updateFoodWheel();
    $('[data-action="food-menu"]')?.focus({preventScroll:true});
    toast(saved?'菜单已保存，转一转试试吧':'菜单已更新，但浏览器未能保存，刷新后可能丢失');return;
  }
  if(!['task-form','habit-form','category-form'].includes(formId))return;
  event.preventDefault();const f=Object.fromEntries(new FormData(form));
  if(formId==='task-form'){
    if(!f.title.trim()){toast('先写下任务名称');return;}
    if(!validDate(f.date)){toast('请选择有效的日期');return;}
    if(f.end&&(!f.time||f.end<=f.time)){toast('结束时间要晚于开始时间；跨天任务请分开记录');return;}
    const old=data.tasks.find(t=>t.id===f.id),record={id:old?.id||uid(),title:f.title.trim(),date:f.date,time:f.time,end:f.end,category:old?.category||'',priority:f.priority,notes:f.notes.trim(),done:old?.done||false};
    if(old)Object.assign(old,record);else data.tasks.push(record);
    selectedDate=f.date;
  }else if(formId==='habit-form'){
    if(!f.name.trim()){toast('请填写习惯名称');return;}
    const target=Number(f.target);if(!Number.isInteger(target)||target<1||target>100){toast('每日目标请输入 1 到 100 的整数');return;}
    const old=data.habits.find(h=>h.id===f.id),record={id:old?.id||uid(),name:f.name.trim(),target,color:f.color,icon:f.icon,logs:old?.logs||{},...(old?.drinks!==undefined?{drinks:old.drinks}:{})};
    for(const d of Object.keys(record.logs))record.logs[d]=Math.min(record.logs[d],target);
    if(old)Object.assign(old,record);else data.habits.push(record);
  }else{
    if(!f.name.trim()){toast('请填写成长方向名称');return;}
    if(categoryImageBusy){toast('图片正在处理，请稍等');return;}
    const old=data.categories.find(c=>c.id===f.id),record={id:old?.id||uid(),name:f.name.trim(),description:f.description.trim(),color:f.color,icon:f.icon,iconImage:categoryImageDraft};
    if(old)Object.assign(old,record);else data.categories.push(record);
  }
  closeModal();afterMutation();
});
document.addEventListener('keydown',event=>{
  const modal=$('.modal');if(!modal)return;
  if(event.key==='Escape'){closeModal();return;}
  if(event.key==='Tab'){const items=[...modal.querySelectorAll('button:not(:disabled):not([hidden]),input:not([type=hidden]):not([hidden]),select:not([hidden]),textarea:not([hidden]),a[href]')],first=items[0],last=items.at(-1);if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}}
});
window.addEventListener('hashchange',()=>{
  const id=location.hash.slice(1),next=routePage(id);
  if(id==='habits')history.replaceState(null,'','#today');
  if(next!==page){if(page==='health')GrowthHealth.seal();page=next;render();if(page==='home')ensureWeather();}
  if(id==='habits')scrollDailySection('daily-habits');
});
const legacyHabitsRoute=location.hash==='#habits';
if(legacyHabitsRoute)history.replaceState(null,'','#today');
if(!unreadableOriginal)GrowthLocal.register('growth',{
  read:()=>data,empty:emptyData,hasLocal:hadSavedData,validate:validateData,export:exportData,
  apply:next=>{
    next=validateData(next);
    localStorage.setItem(KEY,JSON.stringify(next));data=next;storageError='';
    render();
  }
});
GrowthLocal.configure({
  toast,open:openModal,close:()=>closeModal(true),confirm:confirmModal,refresh:render,
  preferencesChanged:()=>{loadNavOrder();loadPicks();Object.assign(foodWheel,readFoodWheel(),{rotation:0,busy:false});jokeSelection=readJokeSelection();soundEnabled=localStorage.getItem('upward.countdown-sound.v1')==='on';render();}
});
void GrowthLocal.start();
function writeGrowthPatch(patch){
  if(GrowthLocal.locked)throw new Error('正在恢复备份，请稍后再保存');
  if(storageError)throw new Error(storageError);
  const next=validateData({...data,...patch});
  try{localStorage.setItem(KEY,JSON.stringify(next));}
  catch{throw new Error('浏览器未能保存记录，请先导出完整备份，再检查存储空间。当前编辑还在。');}
  data=next;GrowthLocal.changed('growth');
}
const localRecordUI={icon,uid,open:openModal,close:closeModal,field,confirm:confirmModal,toast,refresh:render,read:()=>data,write:writeGrowthPatch};
GrowthNavOrder.init({
  open:openModal,toast,refresh:render,locked:()=>GrowthLocal.locked,
  current:()=>NAV.map(([id])=>id),name:id=>PAGES[id][0],icon:id=>icon(PAGES[id][2]),
  arrow:direction=>icon(direction==='up'?'left':'right'),
  apply:order=>{NAV=order.map(id=>NAV_DEFAULT.find(([route])=>route===id));}
});
GrowthBooks.init(localRecordUI);
GrowthSleep.init({...localRecordUI,shift:shiftDate});
GrowthHealth.init({...localRecordUI,today:()=>W.dayKey(),formatTime:countdownDate,countdown:id=>countdownModal(id,'health')});
GrowthJournal.init({
  icon,cat:catSticker,open:openModal,close:closeModal,field,confirm:confirmModal,toast,navigate,
  refresh:()=>{
    if(page==='journal')render();
    else if(page==='home'){const card=$('#home-journal');if(card)card.outerHTML=GrowthJournal.home();}
  }
});
render();
tickCountdowns();
setInterval(tickCountdowns,1000);
document.addEventListener('visibilitychange',()=>{if(!document.hidden)tickCountdowns();});
window.addEventListener('focus',tickCountdowns);
if(legacyHabitsRoute)scrollDailySection('daily-habits');
if(page==='home'){ensureWeather();}

document.addEventListener('visibilitychange',()=>{if(!document.hidden&&page==='home'){const today=W.dayKey();if(today!==homeDay){homeDay=today;render();}else paintHome();ensureWeather();}});
window.addEventListener('online',()=>{if(page==='home'){ensureWeather(true);}});


setInterval(()=>{if(document.hidden||page!=='home')return;const today=W.dayKey();if(today!==homeDay){homeDay=today;render();}ensureWeather();},60000);
})();
