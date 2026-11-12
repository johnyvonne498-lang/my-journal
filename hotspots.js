'use strict';
(function(root){
  const KEY='upward.xhs-picks.v1';
  const categories=['手作','运动','旅行','画画','日常','学习','其他'];
  // Titles, authors and original URLs observed on the public discovery page on 2026-11-11.
  const curated=[
    {id:'crochet',title:'百搭双层加厚包底（钩织教程）',author:'阿琴DDP',category:'手作',url:'https://www.rednote.com/discovery/item/69aa6a50000000002801eaa0',note:'给想动手做点小东西的日子留一点灵感。'},
    {id:'running',title:'人这辈子一定要体验一次！悉尼晨跑☀️🏃‍♀️🌳',author:'谢耳拉',category:'运动',url:'https://www.rednote.com/discovery/item/6aae0e950000000012034a3a',note:'把运动和旅行的期待，放进生活清单。'},
    {id:'egypt',title:'埃及14days攻略+行程分享',author:'由紀ovo',category:'旅行',url:'https://www.rednote.com/discovery/item/6a0a80fd000000000702c2a5',note:'下一段旅行，可以先从读一篇游记开始。'},
    {id:'drawing',title:'1️⃣6️⃣6️⃣禅绕画日常练习打卡～',author:'画画的baby',category:'画画',url:'https://www.rednote.com/discovery/item/6a26147a0000000017029d19',note:'看看别人如何把一点点练习，变成日常。'}
  ];
  function safeLink(value){try{const u=new URL(value);return u.protocol==='https:'&&!u.username&&!u.password&&['www.xiaohongshu.com','xiaohongshu.com','www.rednote.com','rednote.com','xhslink.com','www.xhslink.com'].includes(u.hostname)&&u.href.length<=2000?u.href:'';}catch{return '';}}
  function extractLink(text){return String(text).match(/https:\/\/[^\s<>"'，。；）】]+/g)?.map(safeLink).find(Boolean)||'';}
  function validate(items){
    if(!Array.isArray(items)||items.length>30)throw new Error('最多收藏 30 篇精选帖');
    const ids=new Set();
    for(const item of items){
      if(!item||typeof item.id!=='string'||!item.id||item.id.length>100||ids.has(item.id)||typeof item.title!=='string'||!item.title.trim()||item.title.length>150||typeof item.author!=='string'||item.author.length>60||!categories.includes(item.category)||typeof item.note!=='string'||item.note.length>300||!safeLink(item.url))throw new Error('请填写标题和有效的小红书分享链接');
      ids.add(item.id);
    }
    return items;
  }
  function read(storage=root.localStorage){const raw=storage.getItem(KEY);return raw===null?curated.map(x=>({...x})):validate(JSON.parse(raw));}
  function save(items,storage=root.localStorage){validate(items);storage.setItem(KEY,JSON.stringify(items));}
  const api={KEY,categories,curated,safeLink,extractLink,validate,read,save};
  if(typeof module==='object'&&module.exports)module.exports=api;else root.GrowthHotspots=api;
})(globalThis);
