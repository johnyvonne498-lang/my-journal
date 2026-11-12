'use strict';
// Transparent stickers cut from the user's own cat photos.
globalThis.GrowthCats=(()=>{
  function art(pose='head',className=''){
    const name=['head','sit','nap','meow-head','meow','birthday','lounge','legs','hang','lookback','window','curl','loaf','paw','funny','reach','tucked','cuddle'].includes(pose)?pose:'head';
    return `<img class="cat-mascot cat-real mascot-${name} ${className}" src="./assets/cat-stickers/${name}.png" alt="" aria-hidden="true" decoding="async">`;
  }
  function sticker(pose='head'){return art(pose,'joke-cat');}
  function companion(){return `<div class="companion-scene tabby-companion">${art('cuddle','companion-cat')}<span class="companion-name">今日陪伴员 · 我的小猫</span></div>`;}
  function home(){return `<span class="desk-cat-nap" aria-hidden="true">${art('lounge')}<span>慢慢来，小猫陪着你 ♡</span></span>`;}
  function heading(page){const pose={health:'cuddle',books:'loaf',journal:'curl',growth:'lookback',review:'paw',stats:'loaf',hotspots:'funny'}[page];return pose?art(pose,'heading-cat'):'';}
  return {art,sticker,companion,home,heading};
})();
