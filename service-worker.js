const CACHE_NAME = "football-simulator-v65";
const BADGE_IDS = ["513","529","515","518","516","564","536","556","575","514","520","517","527","534","532","547","528","545","538","578","549","551","546","544","543","552","555","591","586","568","560","542","540","524","522","521","525","526","537","533","531","530","519","523","1756","1755","1762","1759","1764","1772","1778","1793","1754","1767","1771","1758","1760","1776","1782","1775","1761","1768","1757","1763","78142","12868","5095","5094","2061","1846","1837","1836","1817","1803","1798","1794","1792","1789","1788","1787","1781","1780","1777","1770","1766","1765","804","805","807","8568","842","806","813","822","841","820","860","814","810","823","803","851","809","848","815","2241","816","817","818","808","832","838","856","819","2399","853","4404","855","811","829","861","824","1042","1068","1039","1081","1038","1040","1053","1047","1043","1044","4293","1066","1041","1054","1057","1074","1049","1072","2542","2077","15420","8028","4260","2544","2239","2229","2065","1100","1098","1088","1079","1077","1076","1075","1069","1067","1059","1058","1052","1045","731","737","740","729","735","738","730","743","744","752","2258","767","763","757","733","739","759","750","779","768","766","2097","2250","11772","4213","2749","765","762","746","741","734","749","751","761","756","732"];
const CORE_ASSETS = [
  "./",
  "./index.html",
  "./styles.css?v=65",
  "./app.js?v=65",
  "./manifest.json",
  "./vendor/lucide.min.js",
  "./data/dongqiudi-data.js",
  "./data/badge-sources.json",
  "./assets/trophies/league.png",
  "./assets/trophies/domestic-cup.png",
  "./assets/trophies/continental-cup.png",
  "./assets/trophies/international-cup.png",
  "./assets/trophies/11.png",
  "./assets/trophies/16.png",
  "./assets/trophies/22.png",
  "./assets/trophies/32.png",
  "./assets/trophies/67.png",
  "./assets/trophies/1301385.png",
  "./assets/trophies/1301394.png",
  "./assets/trophies/1301407.png",
  "./assets/trophies/1301410.png",
  "./assets/trophies/1301412.png",
  "./assets/trophies/1301423.png",
  "./assets/trophies/1301426.png",
  "./assets/trophies/1301427.png",
  ...BADGE_IDS.map(id => `./assets/badges/${id}.png`)
];

self.addEventListener("install", event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(CORE_ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key)))).then(() => self.clients.claim()));
});

self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;
  const fetchOptions=event.request.mode === "navigate" ? {cache:"no-store"} : undefined;
  event.respondWith(fetch(event.request,fetchOptions).then(response => {
    const copy=response.clone();caches.open(CACHE_NAME).then(cache => cache.put(event.request,copy));return response;
  }).catch(() => caches.match(event.request).then(response => response || caches.match("./index.html"))));
});
