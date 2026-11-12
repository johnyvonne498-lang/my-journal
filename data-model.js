'use strict';
(function(root){
const GrowthCountdown=typeof module==='object'&&module.exports?require('./countdown.js'):root.GrowthCountdown;
const keys=s=>Object.fromEntries(s.split(' ').map(k=>[k,true]));
const palettes=keys('blue green orange purple pink cyan');
const paths=keys('leaf calendar home check circle clock target book chart note grid settings plus minus left right more star sun run water moon video shield download upload cloud lock x edit inbox spark logout cloudWeather rain storm snow mist wind umbrella shirt trousers shoe refresh pin');
const PRIORITIES=keys('high medium low');
const tags=['日常','小猫','穿搭','风景'];
const dateKey = (d = new Date()) => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
const parseDate = s => { const [y,m,d] = s.split('-').map(Number); const date = new Date(0); date.setHours(12,0,0,0); date.setFullYear(y,m-1,d); return date; };
const shiftDate = (s, n) => { const d = parseDate(s); d.setDate(d.getDate()+n); return dateKey(d); };
const validDate = s => typeof s === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(s) && dateKey(parseDate(s)) === s && s >= '1900-01-01' && s <= '2100-12-31';
const validTime = s => typeof s === 'string' && (s === '' || /^([01]\d|2[0-3]):[0-5]\d$/.test(s));
const validMonth = s => typeof s==='string' && /^\d{4}-\d{2}$/.test(s) && validDate(`${s}-01`);
const emptyReview = () => ({wins:'',lessons:'',tomorrow:'',mood:''});
const hasReview = r => !!r && !!(r.wins.trim()||r.lessons.trim()||r.tomorrow.trim()||r.mood);
const isSleepHabit = h => ['早一点睡','早睡','睡眠','睡眠记录'].includes(h.name);
const sleepQualities = ['','睡得香','还不错','没睡好'];
function sleepMinutes(day,r){
  if(!validDate(day)||!r||typeof r!=='object'||Array.isArray(r))return null;
  if(Object.hasOwn(r,'hours'))return typeof r.hours==='number'&&Number.isFinite(r.hours)&&r.hours>=0.5&&r.hours<=24&&Number.isInteger(r.hours*2)?r.hours*60:null;
  if(!validDate(r.bedDate)||!r.bedtime||!r.wake||!validTime(r.bedtime)||!validTime(r.wake))return null;
  const [by,bm,bd]=r.bedDate.split('-').map(Number),[wy,wm,wd]=day.split('-').map(Number);
  const [bh,bmin]=r.bedtime.split(':').map(Number),[wh,wmin]=r.wake.split(':').map(Number);
  const minutes=(Date.UTC(wy,wm-1,wd,wh,wmin)-Date.UTC(by,bm-1,bd,bh,bmin))/60000;
  return minutes>0&&minutes<=1440?minutes:null;
}
function validSleep(day,r){return !!r&&typeof r==='object'&&!Array.isArray(r)&&sleepMinutes(day,r)!==null&&sleepQualities.includes(r.quality);}
function sleepMonth(logs,month){
  if(!validMonth(month))throw new Error('月份不正确');
  const length=new Date(Number(month.slice(0,4)),Number(month.slice(5)),0).getDate();
  const days=Array.from({length},(_,i)=>{const day=`${month}-${String(i+1).padStart(2,'0')}`;return {day,minutes:sleepMinutes(day,logs[day])};});
  const recorded=days.filter(d=>d.minutes!==null),sum=recorded.reduce((n,d)=>n+d.minutes,0);
  return {days,count:recorded.length,estimated:recorded.some(d=>Object.hasOwn(logs[d.day],'hours')),average:recorded.length?Math.round(sum/recorded.length):null};
}
const habitLogCount = (h,day,sleepLogs={}) => isSleepHabit(h)&&validSleep(day,sleepLogs[day])?h.target:(h.logs[day]||0);
function monthlyReviewSummary(data,month){
  if(!validMonth(month))throw new Error('月份不正确');
  const tasks=data.tasks.filter(t=>t.date.startsWith(month+'-'));
  const habitDone=data.habits.reduce((n,h)=>{const days=new Set([...Object.keys(h.logs),...(isSleepHabit(h)?Object.keys(data.sleepLogs||{}):[])]);return n+[...days].filter(day=>day.startsWith(month+'-')&&habitLogCount(h,day,data.sleepLogs)>=h.target).length;},0);
  const history=Object.entries(data.reviews).filter(([day,r])=>day.startsWith(month+'-')&&hasReview(r)).sort(([a],[b])=>b.localeCompare(a));
  return {tasks:tasks.length,done:tasks.filter(t=>t.done).length,habitDone,history,months:Object.values(data.monthlyReviews||{}).filter(hasReview).length};
}
const drinkKinds=['water','coffee','milktea','tea','juice','milk','soda','photo'];
const validDrink = r => !!r && typeof r==='object' && !Array.isArray(r) && drinkKinds.includes(r.kind) &&
  (r.kind==='photo' ? typeof r.image==='string' && r.image.length<=16000 && /^data:image\/(?:png|jpeg|webp);base64,[A-Za-z0-9+/]+={0,2}$/.test(r.image) : r.image===undefined) &&
  (r.previousCount===undefined || Number.isInteger(r.previousCount) && r.previousCount>=0 && r.previousCount<=100);
// A sticker counts as completion. Removing it restores the exact earlier check-in.
function withHabitDrink(h,day,record){
  if(!validDate(day)||record!==null&&!validDrink(record))throw new Error('饮品贴纸格式不正确');
  const logs={...h.logs},drinks={...h.drinks},old=drinks[day];
  if(record){
    const next={kind:record.kind};if(record.kind==='photo')next.image=record.image;
    if(old){if(old.previousCount!==undefined)next.previousCount=old.previousCount;}
    else if(Object.hasOwn(logs,day))next.previousCount=logs[day];
    drinks[day]=next;logs[day]=h.target;
  }else if(old){
    if(old.previousCount===undefined)delete logs[day];else logs[day]=Math.min(old.previousCount,h.target);
    delete drinks[day];
  }
  return {logs,...(h.drinks!==undefined||record?{drinks}:{})};
}
const validIconImage = value => typeof value === 'string' && (value === '' || (value.length <= 120000 && /^data:image\/(?:png|jpeg|webp);base64,[A-Za-z0-9+/]+={0,2}$/.test(value)));
const bookColors=['sage','butter','rose','sky','clay','lilac','cream','ink'];
const healthKinds=['身体不适','看诊','体检','其他'];
const emptyHealth=()=>({card:{allergies:'',medications:'',notes:''},records:[]});
function validHealthRecord(r){
  return !!r && typeof r==='object' && !Array.isArray(r) &&
    typeof r.id==='string' && r.id.length>0 && r.id.length<=80 && validDate(r.date) &&
    typeof r.title==='string' && !!r.title.trim() && r.title.length<=80 && healthKinds.includes(r.kind) &&
    typeof r.place==='string' && r.place.length<=120 && typeof r.note==='string' && r.note.length<=3000 &&
    typeof r.image==='string' && (r.image==='' || r.image.length<=260000 && /^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/]+={0,2}$/.test(r.image));
}
function validHealth(h){
  return !!h && typeof h==='object' && !Array.isArray(h) && !!h.card && typeof h.card==='object' && !Array.isArray(h.card) &&
    ['allergies','medications','notes'].every(k=>typeof h.card[k]==='string' && h.card[k].length<=2000) &&
    Array.isArray(h.records) && h.records.length<=1000 && h.records.every(validHealthRecord) &&
    new Set(h.records.map(r=>r.id)).size===h.records.length && h.records.reduce((n,r)=>n+r.image.length,0)<=1600000;
}
function validBook(b){
  return !!b && typeof b==='object' && !Array.isArray(b) &&
    typeof b.id==='string' && b.id.length>0 && b.id.length<=80 &&
    typeof b.title==='string' && !!b.title.trim() && b.title.length<=120 &&
    typeof b.author==='string' && b.author.length<=80 &&
    ['want','reading','done'].includes(b.status) && bookColors.includes(b.color) &&
    Number.isInteger(b.pages) && b.pages>=0 && b.pages<=100000 &&
    Number.isInteger(b.totalPages) && b.totalPages>=0 && b.totalPages<=100000 &&
    (!b.totalPages || b.pages<=b.totalPages) &&
    (b.status!=='want' || b.pages===0) &&
    (b.status!=='done' || !b.totalPages || b.pages===b.totalPages) &&
    typeof b.note==='string' && b.note.length<=4000;
}
function bookProgress(books){
  const total=books.length,done=books.filter(b=>b.status==='done').length;
  return {total,done,want:books.filter(b=>b.status==='want').length,reading:books.filter(b=>b.status==='reading').length,percent:total?Math.round(done/total*100):0};
}
function validReadingExcerpt(e){
  return !!e && typeof e==='object' && !Array.isArray(e) &&
    typeof e.id==='string' && e.id.length>0 && e.id.length<=80 &&
    typeof e.text==='string' && !!e.text.trim() && e.text.length<=1000 &&
    typeof e.source==='string' && e.source.length<=160;
}
  const imageValid = image => typeof image==='string' && image.length<=260000 && /^data:image\/(jpeg|webp|png);base64,[A-Za-z0-9+/]+={0,2}$/.test(image);
  const validDay = s => {if(typeof s!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(s)||s<'1900-01-01'||s>'2100-12-31')return false;const d=new Date(`${s}T12:00:00`);return !isNaN(d)&&`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`===s;};
function validateData(data) {
  const fail = () => {throw new Error('备份格式不正确，未修改现有数据。');};
  const text = (s,n=2000) => typeof s === 'string' && s.length <= n;
  const ids = list => list.every(x => x && text(x.id,80) && x.id.length > 0) && new Set(list.map(x=>x.id)).size === list.length;
  if (!data || data.version !== 1 || typeof data.example !== 'boolean' || !Array.isArray(data.tasks) || !Array.isArray(data.categories) || !Array.isArray(data.habits) || !data.reviews || typeof data.reviews !== 'object' || Array.isArray(data.reviews)) fail();
  if (data.tasks.length > 50000 || data.categories.length > 200 || data.habits.length > 200 || ![data.tasks,data.categories,data.habits].every(ids)) fail();
  if (!data.categories.every(c=>text(c.name,40) && c.name.trim() && text(c.description,200) && Object.hasOwn(palettes,c.color) && Object.hasOwn(paths,c.icon) && (c.iconImage === undefined || validIconImage(c.iconImage)))) fail();
  const cats = new Set(data.categories.map(c=>c.id));
  if (!data.tasks.every(t=>text(t.title,120) && t.title.trim() && text(t.notes) && validDate(t.date) && validTime(t.time) && validTime(t.end) && (!t.end || (t.time && t.end>t.time)) && typeof t.done === 'boolean' && Object.hasOwn(PRIORITIES,t.priority) && (t.category==='' || cats.has(t.category)))) fail();
  if (!data.habits.every(h=>text(h.name,20) && h.name.trim() && Object.hasOwn(palettes,h.color) && Object.hasOwn(paths,h.icon) && Number.isInteger(h.target) && h.target>=1 && h.target<=100 && h.logs && typeof h.logs==='object' && !Array.isArray(h.logs) && Object.entries(h.logs).every(([d,n])=>validDate(d) && Number.isInteger(n) && n>=0 && n<=h.target))) fail();
  let drinkSize=0;
  for(const h of data.habits){
    if(h.drinks===undefined)continue;
    if(!h.drinks||typeof h.drinks!=='object'||Array.isArray(h.drinks)||Object.keys(h.drinks).length>50000||!Object.entries(h.drinks).every(([day,r])=>validDate(day)&&validDrink(r)))fail();
    drinkSize+=JSON.stringify(h.drinks).length;
  }
  if(drinkSize>1500000)throw new Error('饮品贴纸存储已满，请先导出备份并减少自定义图片。');
  if (!Object.entries(data.reviews).every(([d,r])=>validDate(d) && r && ['wins','lessons','tomorrow'].every(k=>text(r[k],10000)) && ['', '充实','平静','一般','疲惫'].includes(r.mood))) fail();
  if(data.monthlyReviews===undefined)data.monthlyReviews={};
  if(!data.monthlyReviews||typeof data.monthlyReviews!=='object'||Array.isArray(data.monthlyReviews)||Object.keys(data.monthlyReviews).length>2412||!Object.entries(data.monthlyReviews).every(([m,r])=>validMonth(m)&&r&&typeof r==='object'&&!Array.isArray(r)&&['wins','lessons','tomorrow'].every(k=>text(r[k],10000))&&['','充实','平静','一般','疲惫'].includes(r.mood)))fail();
  if(data.sleepLogs===undefined)data.sleepLogs={};
  if(!data.sleepLogs||typeof data.sleepLogs!=='object'||Array.isArray(data.sleepLogs)||Object.keys(data.sleepLogs).length>50000||!Object.entries(data.sleepLogs).every(([day,r])=>validSleep(day,r)))fail();
  if(data.countdowns===undefined)data.countdowns=[];
  if(!Array.isArray(data.countdowns)||data.countdowns.length>100||!ids(data.countdowns)||!data.countdowns.every(GrowthCountdown.validItem))fail();
  if(data.yearlyGoals===undefined)data.yearlyGoals=[];
  if(!Array.isArray(data.yearlyGoals)||data.yearlyGoals.length>2000||!ids(data.yearlyGoals)||!data.yearlyGoals.every(g=>text(g.title,100)&&g.title.trim()&&Number.isInteger(g.year)&&g.year>=1900&&g.year<=2100&&['生活','学习','旅行','体验','其他'].includes(g.category)&&text(g.note,1000)&&typeof g.done==='boolean'))fail();
  if(data.moodLogs===undefined)data.moodLogs={};
  if(!data.moodLogs||typeof data.moodLogs!=='object'||Array.isArray(data.moodLogs)||Object.keys(data.moodLogs).length>50000||!Object.entries(data.moodLogs).every(([day,color])=>validDate(day)&&['red','blue','slate','green'].includes(color)))fail();
  if(data.books===undefined)data.books=[];
  if(!Array.isArray(data.books)||data.books.length>1000||!ids(data.books)||!data.books.every(validBook))fail();
  if(data.readingExcerpts===undefined)data.readingExcerpts=[];
  if(!Array.isArray(data.readingExcerpts)||data.readingExcerpts.length>1000||!ids(data.readingExcerpts)||!data.readingExcerpts.every(validReadingExcerpt))fail();
  if(data.health===undefined)data.health=emptyHealth();
  if(!validHealth(data.health))fail();
  return data;
}
  function validate(data) {
    const fail=()=>{throw new Error('手账备份格式不正确，现有手账未改变');};
    if(!data||data.version!==1||!Array.isArray(data.entries)||data.entries.length>300||!data.months||typeof data.months!=='object'||Array.isArray(data.months))fail();
    const ids=new Set();
    for(const e of data.entries){if(!e||typeof e.id!=='string'||!e.id||e.id.length>80||ids.has(e.id)||!validDay(e.date)||!tags.includes(e.tag)||typeof e.note!=='string'||e.note.length>500||!imageValid(e.image))fail();ids.add(e.id);}
    if(Object.keys(data.months).length>2412)fail();
    for(const [m,n] of Object.entries(data.months)){if(!validDay(`${m}-01`)||!n||!['caption','joys','review','coverId'].every(k=>typeof n[k]==='string')||n.caption.length>100||n.joys.length>2000||n.review.length>2000||n.coverId.length>80||n.coverId&&!data.entries.some(e=>e.id===n.coverId&&e.date.startsWith(m)))fail();}
    for(const key of ['happyDays','happyWeeks']){
      const records=data[key];if(records===undefined)continue;
      if(!records||typeof records!=='object'||Array.isArray(records)||Object.keys(records).length>50000)fail();
      for(const [day,value] of Object.entries(records)){
        if(!validDay(day))fail();
        if(key==='happyDays'){
          if(!Array.isArray(value)||value.length!==3||!value.every(s=>typeof s==='string'&&s.length<=1000))fail();
        }else if(happyWeekDays(day)[0]!==day||typeof value!=='string'||value.length>4000)fail();
      }
    }
    return data;
  }

// Calendar arithmetic uses local noon, avoiding daylight-saving and UTC date shifts.
function happyWeekDays(day){
  if(!validDay(day))throw new Error('请选择有效的日期');
  const start=shiftDate(day,-((parseDate(day).getDay()+6)%7));
  return Array.from({length:7},(_,i)=>shiftDate(start,i));
}
function withHappyDay(state,original,date,things){
  if(!validDay(date)||!Array.isArray(things)||things.length!==3||!things.every(t=>typeof t==='string'&&t.length<=1000))throw new Error('请检查日期和三件开心的事');
  const days={...state.happyDays};
  if(date!==original&&Object.hasOwn(days,date))throw new Error('这个日期已有便签，请先打开那天的便签，避免覆盖');
  if(original)delete days[original];days[date]=things.map(t=>t.trim());
  const next={...state,happyDays:days};validate(next);return next;
}

const api={validateGrowth:validateData,validateJournal:validate,drinkKinds,validDrink,withHabitDrink,happyWeekDays,withHappyDay,bookColors,validBook,bookProgress,validReadingExcerpt,healthKinds,emptyHealth,validHealthRecord,validHealth,validMonth,emptyReview,hasReview,monthlyReviewSummary,isSleepHabit,sleepQualities,sleepMinutes,validSleep,sleepMonth,habitLogCount};
if(typeof module==='object'&&module.exports)module.exports=api;else root.GrowthData=api;
})(globalThis);
