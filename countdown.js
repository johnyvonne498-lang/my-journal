'use strict';
(function(root) {
  const offsets=[0,10,60,1440];
  const parts=(target,now=Date.now())=>{
    const seconds=Math.max(0,Math.ceil((target-now)/1000));
    return {days:Math.floor(seconds/86400),hours:Math.floor(seconds%86400/3600),minutes:Math.floor(seconds%3600/60),seconds:seconds%60,ended:target<=now};
  };
  const reminderAt=item=>item.targetAt-item.remindMinutes*60000;
  const due=(item,now=Date.now())=>!item.reminded&&reminderAt(item)<=now;
  const localInput=timestamp=>{
    const d=new Date(timestamp),pad=n=>String(n).padStart(2,'0');
    return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };
  const parseLocal=value=>{
    if(typeof value!=='string'||!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value))return NaN;
    const timestamp=new Date(value).getTime();
    return Number.isFinite(timestamp)&&localInput(timestamp)===value?timestamp:NaN;
  };
  const validItem=item=>!!item&&typeof item.id==='string'&&item.id.length>0&&item.id.length<=80&&typeof item.title==='string'&&!!item.title.trim()&&item.title.length<=40&&Number.isInteger(item.targetAt)&&item.targetAt>=new Date('1900-01-01T00:00').getTime()&&item.targetAt<=new Date('2100-12-31T23:59').getTime()&&offsets.includes(item.remindMinutes)&&typeof item.reminded==='boolean'&&typeof item.acknowledged==='boolean'&&(!item.acknowledged||item.reminded)&&(item.group===undefined||item.group==='health');
  const api={parts,reminderAt,due,localInput,parseLocal,validItem,offsets};
  if(typeof module==='object'&&module.exports)module.exports=api;
  else root.GrowthCountdown=api;
})(globalThis);
