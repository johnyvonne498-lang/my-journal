'use strict';
(function(root){
  const D=typeof module==='object'&&module.exports?require('./data-model.js'):root.GrowthData;
  const H=typeof module==='object'&&module.exports?require('./hotspots.js'):root.GrowthHotspots;
  const N=typeof module==='object'&&module.exports?require('./nav-order.js'):root.GrowthNavOrder;
  const PREF_KEYS=['upward.food-wheel.v1','upward.countdown-sound.v1','upward.daily-joke.v1','upward.cat-style.v1','upward.xhs-picks.v1',N.KEY];
  const copy=value=>JSON.parse(JSON.stringify(value));
  function validatePreferences(p){
    const fail=()=>{throw new Error('备份中的偏好设置格式不正确，未改动本机内容');};
    if(!p||typeof p!=='object'||Array.isArray(p)||Object.keys(p).some(k=>!PREF_KEYS.includes(k)))fail();
    for(const key of PREF_KEYS){
      const raw=p[key];if(raw===null||raw===undefined)continue;
      if(typeof raw!=='string'||raw.length>(key===H.KEY?100000:15000))fail();
      if(key===N.KEY){try{N.validate(JSON.parse(raw));}catch{fail();}continue;}
      if(key===H.KEY){try{H.validate(JSON.parse(raw));}catch{fail();}continue;}
      if(key==='upward.cat-style.v1'){if(!['real','cartoon'].includes(raw))fail();continue;}
      if(key==='upward.countdown-sound.v1'){if(!['on','off'].includes(raw))fail();continue;}
      let v;try{v=JSON.parse(raw);}catch{fail();}
      if(!v||typeof v!=='object'||typeof v.day!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(v.day))fail();
      if(key==='upward.daily-joke.v1'){if(!Number.isInteger(v.offset)||v.offset<0||v.offset>10000)fail();}
      else if(!Array.isArray(v.items)||v.items.length<2||v.items.length>12||!v.items.every(x=>typeof x==='string'&&x.trim()&&x.length<=12)||(v.selected!==null&&(!Number.isInteger(v.selected)||v.selected<0||v.selected>=v.items.length)))fail();
    }
    return p;
  }
  function validate(value){
    if(!value||value.format!=='upward-private-backup'||value.version!==1||typeof value.exportedAt!=='string'||!Number.isFinite(Date.parse(value.exportedAt)))throw new Error('请选择「有“记”可循完整备份」JSON 文件；旧的分项备份请用对应入口导入');
    const next=copy(value);D.validateGrowth(next.growth);D.validateJournal(next.journal);validatePreferences(next.preferences);return next;
  }
  function create(growth,journal,preferences){return validate({format:'upward-private-backup',version:1,exportedAt:new Date().toISOString(),growth,journal,preferences});}
  // Recovery is durable before either data store changes. Interrupted imports keep this snapshot.
  async function restore(value,io){
    const next=validate(value),previous=validate(await io.capture());
    await io.saveRecovery({status:'pending',savedAt:new Date().toISOString(),backup:previous});
    try{
      await io.applyJournal(next.journal);await io.applyGrowth(next.growth);await io.applyPreferences(next.preferences);
      await io.saveRecovery({status:'complete',savedAt:new Date().toISOString(),backup:previous});
    }catch(error){
      try{
        await io.applyJournal(previous.journal);await io.applyGrowth(previous.growth);await io.applyPreferences(previous.preferences);
        await io.saveRecovery({status:'rolled-back',savedAt:new Date().toISOString(),backup:previous});
      }catch(rollbackError){throw new Error('导入未完成，导入前副本仍保留在本机。请在「数据与备份」中导出或恢复副本。');}
      throw new Error('导入未完成，已恢复导入前的记录：'+(error.message||'存储失败'));
    }
  }
  const api={PREF_KEYS,validatePreferences,validate,create,restore};
  if(typeof module==='object'&&module.exports)module.exports=api;else root.GrowthBackup=api;
})(globalThis);
