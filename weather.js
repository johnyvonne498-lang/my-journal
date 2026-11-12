'use strict';
(() => {
  const CITY = '长沙', CACHE_KEY = 'upward.changsha.weather.v1';
  const URL = 'https://api.open-meteo.com/v1/forecast?latitude=28.23&longitude=112.94&current=temperature_2m,apparent_temperature,relative_humidity_2m,weather_code,wind_speed_10m,is_day&daily=weather_code,temperature_2m_max,temperature_2m_min,apparent_temperature_max,apparent_temperature_min,precipitation_probability_max,precipitation_sum,wind_speed_10m_max,uv_index_max&timezone=Asia%2FShanghai&forecast_days=3';
  const dayKey = (date = new Date()) => {
    const parts = new Intl.DateTimeFormat('en-US', {timeZone:'Asia/Shanghai',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(date);
    const value = type => parts.find(p => p.type === type).value;
    return `${value('year')}-${value('month')}-${value('day')}`;
  };
  const number = (value, low, high) => typeof value === 'number' && Number.isFinite(value) && value >= low && value <= high;
  const date = value => typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(value)) && new Date(value).toISOString().slice(0,10) === value;
  function validate(value) {
    const c = value?.current;
    if (!value || value.city !== CITY || !number(value.fetchedAt, 1, Date.now()+300000) || !c || typeof c.time !== 'string' || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(c.time) || !date(c.time.slice(0,10)) || !number(c.temp,-80,65) || !number(c.feels,-100,80) || !number(c.code,0,99) || !number(c.wind,0,500) || !number(c.humidity,0,100) || ![0,1].includes(c.isDay) || !Array.isArray(value.days) || value.days.length !== 3) throw new Error('天气数据暂不完整');
    value.days.forEach((d,i) => {
      if (!date(d.date) || !number(d.high,-80,65) || !number(d.low,-80,65) || d.low>d.high || !number(d.feelsLow,-100,80) || !number(d.feelsHigh,-100,80) || !number(d.rain,0,100) || !number(d.precip,0,1000) || !number(d.wind,0,500) || !number(d.uv,0,30) || !number(d.code,0,99) || (i && Date.parse(d.date)-Date.parse(value.days[i-1].date)!==86400000)) throw new Error('天气数据暂不完整');
    });
    if (c.time.slice(0,10) !== value.days[0].date) throw new Error('天气日期不一致');
    return value;
  }
  function normalize(raw, fetchedAt = Date.now()) {
    if (raw?.timezone !== 'Asia/Shanghai' || !raw.current || !raw.daily || !Array.isArray(raw.daily.time)) throw new Error('天气数据暂不完整');
    const c = raw.current, d = raw.daily;
    return validate({city:CITY,fetchedAt,current:{time:c.time,temp:c.temperature_2m,feels:c.apparent_temperature,code:c.weather_code,wind:c.wind_speed_10m,humidity:c.relative_humidity_2m,isDay:c.is_day},days:d.time.slice(0,3).map((day,i)=>({date:day,code:d.weather_code?.[i],high:d.temperature_2m_max?.[i],low:d.temperature_2m_min?.[i],feelsHigh:d.apparent_temperature_max?.[i],feelsLow:d.apparent_temperature_min?.[i],rain:d.precipitation_probability_max?.[i],precip:d.precipitation_sum?.[i],wind:d.wind_speed_10m_max?.[i],uv:d.uv_index_max?.[i]}))});
  }
  function describe(code, isDay = 1) {
    if (code===0) return {text:isDay?'晴':'晴朗',icon:isDay?'sun':'moon',kind:'sunny'};
    if ([1,2].includes(code)) return {text:'多云',icon:'cloudWeather',kind:'cloudy'};
    if (code===3) return {text:'阴',icon:'cloudWeather',kind:'cloudy'};
    if ([45,48].includes(code)) return {text:'雾',icon:'mist',kind:'cloudy'};
    if ([71,73,75,77,85,86].includes(code)) return {text:'降雪',icon:'snow',kind:'snowy'};
    if ([95,96,99].includes(code)) return {text:'雷雨',icon:'storm',kind:'rainy'};
    if ([56,57,66,67].includes(code)) return {text:'冻雨',icon:'rain',kind:'rainy'};
    if ([51,53,55].includes(code)) return {text:'毛毛雨',icon:'rain',kind:'rainy'};
    if ([61,80].includes(code)) return {text:'小雨',icon:'rain',kind:'rainy'};
    if ([63,81].includes(code)) return {text:'中雨',icon:'rain',kind:'rainy'};
    if ([65,82].includes(code)) return {text:'大雨',icon:'rain',kind:'rainy'};
    return {text:'天气预报',icon:'cloudWeather',kind:'cloudy'};
  }
  function outfit(snapshot) {
    const c = snapshot.current, d = snapshot.days[0], t = c.feels;
    let title, top, bottom, shoes;
    if(t<=5) [title,top,bottom,shoes]=['把温暖穿在身上','保暖内搭 + 毛衣 + 羽绒服','加绒长裤，怕冷可加保暖裤','保暖运动鞋或短靴'];
    else if(t<=12) [title,top,bottom,shoes]=['今天适合穿暖一点','长袖内搭 + 毛衣 / 卫衣 + 厚外套','厚长裤或牛仔裤','包脚运动鞋，搭配厚袜'];
    else if(t<=18) [title,top,bottom,shoes]=['一件外套，刚刚好','长袖打底 + 针织衫 / 夹克','长裤或厚一些的长裙','运动鞋或休闲鞋'];
    else if(t<=24) [title,top,bottom,shoes]=['轻松穿，也留一件外搭','长袖衬衫或薄卫衣，备薄外套','轻薄长裤或长裙','透气运动鞋或休闲鞋'];
    else if(t<=29) [title,top,bottom,shoes]=['轻薄透气，舒服出门','棉质短袖，空调房备薄开衫','轻薄长裤、短裤或裙装','透气运动鞋或凉鞋'];
    else [title,top,bottom,shoes]=['清爽穿搭，注意防暑','宽松、透气的浅色短袖','轻薄短裤或裙装','透气鞋履，避免闷热'];
    const tips = [];
    const wet = d.rain>=40 || d.precip>=0.5 || describe(c.code).kind==='rainy' || describe(d.code).kind==='rainy';
    if (wet) {tips.push('有降雨可能，带伞出门；优先选防水、防滑鞋。');shoes='防水、防滑的包脚鞋';}
    if (describe(c.code).kind==='snowy' || describe(d.code).kind==='snowy' || [56,57,66,67].includes(d.code)) {tips.push('雨雪天气留意路面湿滑，外搭尽量防风防水。');shoes='保暖、防滑短靴';}
    if (d.high-d.low>=8) tips.push('早晚温差较大，分层穿搭，方便增减衣物。');
    if (d.feelsLow<=8 && t>8) tips.push('早晚偏冷，晚归时多带一件保暖外套。');
    if (d.wind>=25) tips.push('风较大，选防风外套，收好帽子和围巾。');
    if (d.uv>=6) tips.push('紫外线较强，准备防晒霜、遮阳帽或遮阳伞。');
    if ([95,96,99].includes(d.code)) tips.push('可能有雷雨，尽量避开空旷处和树下停留。');
    if(t>=30) tips.push('减少正午长时间户外活动，及时补水。');
    if(!tips.length) tips.push('按活动量和个人体感微调；室内外温差大时备一件外搭。');
    return {title,top,bottom,shoes,tips,wet};
  }
  function readCache() {
    try {const value=validate(JSON.parse(localStorage.getItem(CACHE_KEY)));return Date.now()-value.fetchedAt<7*86400000?value:null;} catch {return null;}
  }
  async function fetchWeather() {
    const controller = new AbortController(), timeout = setTimeout(()=>controller.abort(),12000);
    try {
      const response = await fetch(URL,{signal:controller.signal,cache:'no-store'});
      if(!response.ok) throw new Error('天气服务暂不可用');
      const value=normalize(await response.json());
      if(value.days[0].date!==dayKey())throw new Error('天气服务尚未更新到今天');
      try {localStorage.setItem(CACHE_KEY,JSON.stringify(value));} catch {}
      return value;
    } finally {clearTimeout(timeout);}
  }
  globalThis.GrowthWeather=Object.freeze({dayKey,validate,normalize,describe,outfit,readCache,fetchWeather});
})();
