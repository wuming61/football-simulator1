(() => {
  "use strict";

  const APP_VERSION = "V1.5";
  const SAVE_KEY = "football-simulator-v0-save";
  const SAVE_INDEX_KEY = "football-simulator-save-index-v1";
  const SAVE_PREFIX = "football-simulator-save-slot-";
  const MOD_KEY = "football-simulator-mod-packs";
  const START_DATE = "2026-08-01";
  const PLAYER_WEEKLY_PLANS = {
    balanced:{label:"均衡训练",icon:"scale",summary:"维持体能、状态与技术稳定",training:"balanced",fitness:0,morale:.08,trust:.05,tactical:.08,development:.07},
    finishing:{label:"终结加练",icon:"target",summary:"提高射门成长和进攻信心，体能恢复稍慢",training:"intense",fitness:-.35,morale:.12,trust:.08,tactical:.03,development:.16,attribute:"shooting"},
    creativity:{label:"组织与技术",icon:"route",summary:"强化传球、盘带和战术理解",training:"balanced",fitness:-.12,morale:.08,trust:.07,tactical:.16,development:.13,attribute:"passing"},
    defending:{label:"防守职责",icon:"shield-check",summary:"提高防守执行和教练信任",training:"intense",fitness:-.28,morale:.04,trust:.17,tactical:.12,development:.12,attribute:"defending"},
    recovery:{label:"恢复周期",icon:"battery-charging",summary:"优先恢复体能并降低伤病风险",training:"recovery",fitness:.65,morale:.16,trust:-.02,tactical:.02,development:.02},
    competition:{label:"争取首发",icon:"shirt",summary:"用额外训练和录像分析挑战位置竞争",training:"intense",fitness:-.42,morale:.1,trust:.2,tactical:.18,development:.1},
    chemistry:{label:"队友合练",icon:"users-round",summary:"增强更衣室关系、默契与无球协作",training:"balanced",fitness:-.08,morale:.18,trust:.08,tactical:.1,development:.06}
  };
  const PLAYER_MATCH_PLANS = {
    balanced:{label:"执行部署",icon:"circle-dot",summary:"保持正常强度，优先完成教练部署",attributes:{},trust:.3,risk:0,fatigue:1,injuryRisk:1},
    conserve:{label:"为后续留力",icon:"battery-medium",summary:"减少冲刺和对抗，为更重要的下一场保存体能",attributes:{pace:-3,physical:-2,shooting:-1,passing:1},trust:-.15,risk:-2,fatigue:.72,injuryRisk:.72},
    allout:{label:"倾尽全力",icon:"flame",summary:"提高跑动、对抗和进攻投入，承担更高疲劳与伤病风险",attributes:{pace:3,physical:3,shooting:2,defending:1},trust:.25,risk:3,fatigue:1.24,injuryRisk:1.32},
    safe:{label:"避免受伤",icon:"shield",summary:"主动规避危险对抗，降低受伤概率但牺牲比赛影响力",attributes:{physical:-3,defending:-1,dribbling:-2,shooting:-1,passing:1},trust:-.05,risk:-3,fatigue:.82,injuryRisk:.55},
    attack:{label:"主动进攻",icon:"swords",summary:"更多前插和射门，承担丢失球权风险",attributes:{shooting:3,pace:2,dribbling:1,defending:-2},trust:.1,risk:2,fatigue:1.1,injuryRisk:1.08},
    creative:{label:"承担组织",icon:"sparkles",summary:"增加持球与关键传球尝试",attributes:{passing:3,dribbling:2,physical:-1},trust:.2,risk:1,fatigue:1.04,injuryRisk:1.02},
    defensive:{label:"专注防守",icon:"scan-line",summary:"提高对抗和位置纪律",attributes:{defending:3,physical:2,shooting:-2},trust:.4,risk:0,fatigue:1.05,injuryRisk:1.07}
  };
  const DQD_DATA = window.DQD_DATA || { meta:{ teamCount:0, playerCount:0 }, leagues:{}, teams:[] };
  const LEGACY_TEAM_MAP = {
    mci:"dqd-529", ars:"dqd-513", liv:"dqd-516", mun:"dqd-515", lee:"dqd-534", sun:"dqd-536",
    rma:"dqd-1755", fcb:"dqd-1756", atm:"dqd-1759", dep:"dqd-1757", bay:"dqd-804", b04:"dqd-806",
    bvb:"dqd-807", hsv:"dqd-810", int:"dqd-1042", acm:"dqd-1038", juv:"dqd-1040", pal:"dqd-1052",
    psg:"dqd-731", om:"dqd-735", asm:"dqd-730", ste:"dqd-746"
  };

  const LEAGUES = {
    ENG1: { name: "英格兰超级联赛", short: "英超", country: "英格兰", tier: 1, matches: 38, cup: "足总杯", extraCup: "联赛杯" },
    ENG2: { name: "英格兰冠军联赛", short: "英冠", country: "英格兰", tier: 2, matches: 46, cup: "足总杯", extraCup: "联赛杯" },
    ENG3: { name: "英格兰足球甲级联赛", short: "英甲", country: "英格兰", tier: 3, matches: 46, cup: "足总杯", extraCup: "联赛杯" },
    ESP1: { name: "西班牙甲级联赛", short: "西甲", country: "西班牙", tier: 1, matches: 38, cup: "国王杯" },
    ESP2: { name: "西班牙乙级联赛", short: "西乙", country: "西班牙", tier: 2, matches: 42, cup: "国王杯" },
    ESP3: { name: "西班牙皇家足协甲级联赛", short: "西协甲", country: "西班牙", tier: 3, matches: 38, cup: "国王杯" },
    GER1: { name: "德国甲级联赛", short: "德甲", country: "德国", tier: 1, matches: 34, cup: "德国杯" },
    GER2: { name: "德国乙级联赛", short: "德乙", country: "德国", tier: 2, matches: 34, cup: "德国杯" },
    GER3: { name: "德国足球丙级联赛", short: "德丙", country: "德国", tier: 3, matches: 38, cup: "德国杯" },
    ITA1: { name: "意大利甲级联赛", short: "意甲", country: "意大利", tier: 1, matches: 38, cup: "意大利杯" },
    ITA2: { name: "意大利乙级联赛", short: "意乙", country: "意大利", tier: 2, matches: 38, cup: "意大利杯" },
    ITA3: { name: "意大利足球丙级联赛", short: "意丙", country: "意大利", tier: 3, matches: 38, cup: "意大利杯" },
    FRA1: { name: "法国甲级联赛", short: "法甲", country: "法国", tier: 1, matches: 34, cup: "法国杯" },
    FRA2: { name: "法国乙级联赛", short: "法乙", country: "法国", tier: 2, matches: 34, cup: "法国杯" },
    FRA3: { name: "法国全国联赛", short: "法丙", country: "法国", tier: 3, matches: 34, cup: "法国杯" }
  };

  const CLUBS = [
    { id:"mci", name:"Manchester City", code:"MCI", league:"ENG1", prestige:94, budget:185, coach:"Pep Guardiola" },
    { id:"ars", name:"Arsenal", code:"ARS", league:"ENG1", prestige:91, budget:148, coach:"Mikel Arteta" },
    { id:"liv", name:"Liverpool", code:"LIV", league:"ENG1", prestige:92, budget:142, coach:"Arne Slot" },
    { id:"mun", name:"Manchester United", code:"MUN", league:"ENG1", prestige:87, budget:121, coach:"Rúben Amorim" },
    { id:"lee", name:"Leeds United", code:"LEE", league:"ENG2", prestige:74, budget:44, coach:"Daniel Farke" },
    { id:"sun", name:"Sunderland", code:"SUN", league:"ENG2", prestige:68, budget:31, coach:"Régis Le Bris" },
    { id:"rma", name:"Real Madrid", code:"RMA", league:"ESP1", prestige:98, budget:210, coach:"Xabi Alonso" },
    { id:"fcb", name:"FC Barcelona", code:"BAR", league:"ESP1", prestige:96, budget:102, coach:"Hansi Flick" },
    { id:"atm", name:"Atlético Madrid", code:"ATM", league:"ESP1", prestige:89, budget:83, coach:"Diego Simeone" },
    { id:"dep", name:"Deportivo La Coruña", code:"DEP", league:"ESP2", prestige:70, budget:22, coach:"Antonio Hidalgo" },
    { id:"bay", name:"Bayern München", code:"FCB", league:"GER1", prestige:95, budget:176, coach:"Vincent Kompany" },
    { id:"b04", name:"Bayer Leverkusen", code:"B04", league:"GER1", prestige:88, budget:92, coach:"Erik ten Hag" },
    { id:"bvb", name:"Borussia Dortmund", code:"BVB", league:"GER1", prestige:89, budget:105, coach:"Niko Kovač" },
    { id:"hsv", name:"Hamburger SV", code:"HSV", league:"GER2", prestige:72, budget:27, coach:"Merlin Polzin" },
    { id:"int", name:"Inter", code:"INT", league:"ITA1", prestige:93, budget:108, coach:"Cristian Chivu" },
    { id:"acm", name:"AC Milan", code:"MIL", league:"ITA1", prestige:90, budget:97, coach:"Massimiliano Allegri" },
    { id:"juv", name:"Juventus", code:"JUV", league:"ITA1", prestige:91, budget:99, coach:"Igor Tudor" },
    { id:"pal", name:"Palermo", code:"PAL", league:"ITA2", prestige:69, budget:24, coach:"Filippo Inzaghi" },
    { id:"psg", name:"Paris Saint-Germain", code:"PSG", league:"FRA1", prestige:96, budget:196, coach:"Luis Enrique" },
    { id:"om", name:"Olympique Marseille", code:"OM", league:"FRA1", prestige:85, budget:72, coach:"Roberto De Zerbi" },
    { id:"asm", name:"AS Monaco", code:"ASM", league:"FRA1", prestige:84, budget:78, coach:"Adi Hütter" },
    { id:"ste", name:"Saint-Étienne", code:"ASSE", league:"FRA2", prestige:70, budget:20, coach:"Eirik Horneland" }
  ];

  const REAL_PLAYERS = [
    { id:"haaland", name:"Erling Haaland", dqdName:"哈兰德", club:"mci", position:"ST", age:26, overall:91, potential:93, value:185, wage:520, pace:89, shooting:94, passing:70, dribbling:82, defending:45, physical:90 },
    { id:"rodri", name:"Rodri", dqdName:"罗德里", club:"mci", position:"DM", age:30, overall:90, potential:90, value:105, wage:390, pace:66, shooting:76, passing:89, dribbling:84, defending:88, physical:84 },
    { id:"saka", name:"Bukayo Saka", dqdName:"萨卡", club:"ars", position:"RW", age:24, overall:89, potential:92, value:152, wage:320, pace:88, shooting:86, passing:86, dribbling:90, defending:56, physical:72 },
    { id:"bellingham", name:"Jude Bellingham", dqdName:"贝林厄姆", club:"rma", position:"CM", age:23, overall:91, potential:94, value:194, wage:410, pace:84, shooting:86, passing:88, dribbling:91, defending:80, physical:86 },
    { id:"mbappe", name:"Kylian Mbappé", dqdName:"姆巴佩", club:"rma", position:"ST", age:27, overall:92, potential:93, value:205, wage:610, pace:97, shooting:92, passing:83, dribbling:93, defending:38, physical:80 },
    { id:"yamal", name:"Lamine Yamal", dqdName:"亚马尔", club:"fcb", position:"RW", age:19, overall:89, potential:96, value:190, wage:280, pace:91, shooting:84, passing:88, dribbling:94, defending:40, physical:65 },
    { id:"pedri", name:"Pedri", dqdName:"佩德里", club:"fcb", position:"CM", age:23, overall:88, potential:92, value:132, wage:280, pace:79, shooting:75, passing:91, dribbling:92, defending:70, physical:66 },
    { id:"musiala", name:"Jamal Musiala", dqdName:"穆西亚拉", club:"bay", position:"AM", age:23, overall:90, potential:93, value:168, wage:350, pace:89, shooting:84, passing:87, dribbling:94, defending:52, physical:68 },
    { id:"wirtz", name:"Florian Wirtz", dqdName:"维尔茨", club:"liv", position:"AM", age:23, overall:89, potential:93, value:160, wage:340, pace:82, shooting:84, passing:91, dribbling:92, defending:54, physical:67 },
    { id:"lautaro", name:"Lautaro Martínez", dqdName:"劳塔罗-马丁内斯", club:"int", position:"ST", age:28, overall:89, potential:89, value:112, wage:310, pace:85, shooting:90, passing:78, dribbling:86, defending:48, physical:82 },
    { id:"doue", name:"Désiré Doué", dqdName:"杜埃", club:"psg", position:"LW", age:21, overall:86, potential:93, value:118, wage:245, pace:90, shooting:81, passing:82, dribbling:92, defending:51, physical:72 },
    { id:"vitinha", name:"Vitinha", dqdName:"维蒂尼亚", club:"psg", position:"CM", age:26, overall:89, potential:91, value:124, wage:280, pace:78, shooting:76, passing:92, dribbling:91, defending:74, physical:68 }
  ];

  const COACHES = [
    { name:"Pep Guardiola", club:"mci", overall:94, tactics:97, people:88, youth:85, transfers:86 },
    { name:"Mikel Arteta", club:"ars", overall:90, tactics:92, people:87, youth:91, transfers:84 },
    { name:"Xabi Alonso", club:"rma", overall:91, tactics:93, people:90, youth:88, transfers:82 },
    { name:"Hansi Flick", club:"fcb", overall:90, tactics:92, people:86, youth:88, transfers:80 },
    { name:"Diego Simeone", club:"atm", overall:91, tactics:93, people:91, youth:79, transfers:83 },
    { name:"Vincent Kompany", club:"bay", overall:86, tactics:88, people:86, youth:87, transfers:79 },
    { name:"Luis Enrique", club:"psg", overall:93, tactics:94, people:90, youth:87, transfers:84 },
    { name:"Simone Inzaghi", club:"int", overall:92, tactics:94, people:88, youth:82, transfers:83 }
  ];

  const OPPONENTS = {
    ENG1:["Arsenal","Aston Villa","Bournemouth","Brentford","Brighton","Burnley","Chelsea","Crystal Palace","Everton","Fulham","Leeds United","Liverpool","Manchester City","Manchester United","Newcastle United","Nottingham Forest","Sunderland","Tottenham Hotspur","West Ham United","Wolverhampton"],
    ENG2:["Birmingham City","Blackburn Rovers","Bristol City","Charlton Athletic","Coventry City","Derby County","Hull City","Ipswich Town","Leicester City","Middlesbrough","Millwall","Norwich City","Oxford United","Portsmouth","Preston North End","Queens Park Rangers","Sheffield United","Sheffield Wednesday","Southampton","Stoke City","Swansea City","Watford","West Bromwich Albion","Wrexham"],
    ENG3:["AFC Wimbledon","Barnsley","Blackpool","Bolton Wanderers","Bradford City","Burton Albion","Cardiff City","Doncaster Rovers","Exeter City","Huddersfield Town","Leyton Orient","Lincoln City","Luton Town","Mansfield Town","Northampton Town","Peterborough United","Plymouth Argyle","Port Vale","Reading","Rotherham United","Stevenage","Stockport County","Wigan Athletic","Wycombe Wanderers"],
    ESP1:["Athletic Club","Atlético Madrid","Barcelona","Celta Vigo","Deportivo Alavés","Elche","Espanyol","Getafe","Girona","Levante","Mallorca","Osasuna","Rayo Vallecano","Real Betis","Real Madrid","Real Oviedo","Real Sociedad","Sevilla","Valencia","Villarreal"],
    ESP2:["Albacete","Almería","Burgos","Cádiz","Castellón","Córdoba","Cultural Leonesa","Deportivo La Coruña","Eibar","Granada","Huesca","Las Palmas","Leganés","Málaga","Mirandés","Racing Santander","Real Valladolid","Real Zaragoza","Sporting Gijón","Valladolid Promesas","Ceuta","Andorra"],
    ESP3:["Alcorcón","Antequera","Arenteiro","Barakaldo","Cartagena","Celta Fortuna","Eldense","Europa","Gimnàstic","Hércules","Ibiza","Lugo","Marbella","Mérida","Ponferradina","Real Murcia","Sabadell","Sanluqueño","Tenerife","Unionistas"],
    GER1:["Augsburg","Bayern München","Bayer Leverkusen","Borussia Dortmund","Borussia Mönchengladbach","Eintracht Frankfurt","Freiburg","Hamburger SV","Heidenheim","Hoffenheim","Köln","Mainz 05","RB Leipzig","St. Pauli","Stuttgart","Union Berlin","Werder Bremen","Wolfsburg"],
    GER2:["Arminia Bielefeld","Bochum","Darmstadt 98","Dynamo Dresden","Elversberg","Fortuna Düsseldorf","Greuther Fürth","Hannover 96","Hertha BSC","Holstein Kiel","Kaiserslautern","Karlsruher SC","Magdeburg","Nürnberg","Paderborn","Preußen Münster","Schalke 04","Südtirol"],
    GER3:["1860 München","Alemannia Aachen","Energie Cottbus","Erzgebirge Aue","Hansa Rostock","Jahn Regensburg","MSV Duisburg","Rot-Weiss Essen","Saarbrücken","Schweinfurt 05","Stuttgart II","Verl","Viktoria Köln","Waldhof Mannheim","Wehen Wiesbaden","Osnabrück","Ingolstadt","Havelse","Dortmund II","Freiburg II"],
    ITA1:["Atalanta","Bologna","Cagliari","Como","Cremonese","Fiorentina","Genoa","Hellas Verona","Inter","Juventus","Lazio","Lecce","AC Milan","Napoli","Parma","Pisa","Roma","Sassuolo","Torino","Udinese"],
    ITA2:["Avellino","Bari","Carrarese","Catanzaro","Cesena","Empoli","Frosinone","Juve Stabia","Mantova","Modena","Monza","Padova","Palermo","Pescara","Reggiana","Sampdoria","Spezia","Südtirol","Venezia","Virtus Entella"],
    ITA3:["Arezzo","Ascoli","Audace Cerignola","Benevento","Catania","Crotone","Feralpisalò","Gubbio","Lecco","Novara","Perugia","Pineto","Pontedera","Pro Vercelli","Rimini","Sorrento","Ternana","Triestina","Vicenza","Virtus Verona"],
    FRA1:["Angers","Auxerre","Brest","Le Havre","Lens","Lille","Lorient","Lyon","Marseille","Metz","Monaco","Nantes","Nice","Paris FC","Paris Saint-Germain","Rennes","Strasbourg","Toulouse"],
    FRA2:["Amiens","Annecy","Bastia","Boulogne","Clermont","Dunkerque","Grenoble","Guingamp","Laval","Le Mans","Montpellier","Nancy","Pau","Red Star","Reims","Rodez","Saint-Étienne","Troyes"],
    FRA3:["Aubagne","Bourg-Péronnas","Caen","Châteauroux","Concarneau","Dijon","Fleury 91","Le Puy","Orléans","Paris 13 Atletico","Quevilly-Rouen","Rouen","Sochaux","Valenciennes","Versailles","Villefranche","Nancy II","Nîmes"]
  };

  const CUP_ROUNDS = {
    "足总杯":["第 3 轮","十六强","八强","半决赛","决赛"],
    "联赛杯":["第 2 轮","十六强","八强","半决赛","决赛"],
    "国王杯":["第三轮","十六强","八强","半决赛","决赛"],
    "德国杯":["第二轮","十六强","八强","半决赛","决赛"],
    "意大利杯":["第二轮","十六强","八强","半决赛","决赛"],
    "法国杯":["第九轮","十六强","八强","半决赛","决赛"]
  };
  const EUROPEAN_OPPONENTS = ["Benfica","Ajax","Inter","Barcelona","Celtic","Bayer Leverkusen","AS Monaco","Atlético Madrid","PSV","Napoli","Sporting CP","RB Leipzig","Galatasaray","Atalanta","Club Brugge","Olympiacos","Feyenoord","Porto","Fenerbahçe","Rangers","Anderlecht","Slavia Praha","PAOK","Rapid Wien","Fiorentina","Real Betis","Viktoria Plzeň","Ludogorets"];
  const EUROPEAN_COMPETITIONS = {
    ucl:{key:"ucl",name:"欧冠",fullName:"欧洲冠军联赛",matches:8,pots:4,perPot:2,offsets:[39,53,74,88,109,123,165,173],fieldTarget:86,fieldSpread:12},
    uel:{key:"uel",name:"欧联杯",fullName:"欧足联欧洲联赛",matches:8,pots:4,perPot:2,offsets:[39,68,75,89,110,124,166,173],fieldTarget:80,fieldSpread:14},
    uecl:{key:"uecl",name:"欧协联",fullName:"欧足联欧洲协会联赛",matches:6,pots:6,perPot:1,offsets:[54,75,89,110,124,131],fieldTarget:74,fieldSpread:16}
  };
  const EUROPEAN_COMPETITION_BY_NAME=Object.fromEntries(Object.values(EUROPEAN_COMPETITIONS).map(item=>[item.name,item]));
  const EUROPEAN_NATIONS=new Set(["英格兰","法国","德国","西班牙","意大利","葡萄牙","荷兰","比利时","克罗地亚","丹麦","瑞士","奥地利","挪威","瑞典","波兰","塞尔维亚","土耳其","希腊","苏格兰","爱尔兰","乌克兰","捷克","斯洛伐克","匈牙利","罗马尼亚","斯洛文尼亚","威尔士"]);
  const SOUTH_AMERICAN_NATIONS=new Set(["阿根廷","巴西","乌拉圭","哥伦比亚","厄瓜多尔","智利","秘鲁","巴拉圭","委内瑞拉","玻利维亚"]);
  const AFRICAN_NATIONS=new Set(["摩洛哥","塞内加尔","埃及","阿尔及利亚","尼日利亚","喀麦隆","科特迪瓦","加纳","突尼斯","马里","南非","刚果民主共和国"]);
  const ASIAN_NATIONS=new Set(["日本","韩国","中国","澳大利亚","伊朗","沙特阿拉伯","卡塔尔","乌兹别克斯坦","伊拉克","约旦","阿联酋"]);
  const NATIONAL_TEAM_STRENGTH={阿根廷:92,法国:92,西班牙:91,英格兰:90,巴西:90,葡萄牙:88,德国:88,荷兰:87,意大利:87,比利时:85,乌拉圭:85,克罗地亚:84,摩洛哥:83,日本:81,美国:80,墨西哥:80,韩国:79,塞内加尔:79,哥伦比亚:84,丹麦:82,瑞士:82,奥地利:81,挪威:81,土耳其:80,尼日利亚:79,喀麦隆:78,埃及:78,澳大利亚:77,伊朗:77,沙特阿拉伯:74,中国:68};
  const NATIONAL_OPPONENTS={
    europe:["法国","西班牙","英格兰","德国","葡萄牙","荷兰","意大利","比利时","克罗地亚","丹麦","瑞士","奥地利","挪威","土耳其","瑞典","波兰","塞尔维亚","乌克兰"],
    southAmerica:["阿根廷","巴西","乌拉圭","哥伦比亚","厄瓜多尔","智利","秘鲁","巴拉圭","委内瑞拉","玻利维亚"],
    africa:["摩洛哥","塞内加尔","埃及","阿尔及利亚","尼日利亚","喀麦隆","科特迪瓦","加纳","突尼斯","马里","南非"],
    asia:["日本","韩国","澳大利亚","伊朗","沙特阿拉伯","卡塔尔","乌兹别克斯坦","伊拉克","约旦","阿联酋","中国"],
    other:["美国","墨西哥","加拿大","哥斯达黎加","牙买加","巴拿马","新西兰"]
  };
  const BACKGROUND_LEAGUES = [
    {id:"BRA1",name:"巴西甲级联赛",country:"巴西",tier:2,clubs:[["Flamengo",84,81],["Palmeiras",85,82],["Botafogo",81,79],["Corinthians",80,77],["São Paulo",81,78],["Fluminense",78,76],["Internacional",78,76],["Grêmio",77,75]]},
    {id:"USA1",name:"美国职业足球大联盟",country:"美国",tier:3,clubs:[["Inter Miami",82,78],["LAFC",79,76],["Columbus Crew",77,75],["Seattle Sounders",78,75],["Atlanta United",75,72],["New York City",75,73],["LA Galaxy",77,74],["FC Cincinnati",76,74]]},
    {id:"KSA1",name:"沙特职业联赛",country:"沙特阿拉伯",tier:2,clubs:[["Al Hilal",86,83],["Al Nassr",84,81],["Al Ittihad",83,81],["Al Ahli",82,80],["Al Ettifaq",75,73],["Al Shabab",75,73],["Al Qadsiah",76,74],["Al Taawoun",72,71]]},
    {id:"JPN1",name:"日本 J1 联赛",country:"日本",tier:3,clubs:[["Kashima Antlers",75,73],["Urawa Red Diamonds",76,73],["Vissel Kobe",76,74],["Yokohama F. Marinos",75,73],["Kawasaki Frontale",75,72],["Sanfrecce Hiroshima",74,73],["FC Tokyo",72,70],["Gamba Osaka",73,71]]},
    {id:"NED1",name:"荷兰甲级联赛",country:"荷兰",tier:2,clubs:[["PSV",85,82],["Ajax",83,80],["Feyenoord",84,81],["AZ Alkmaar",78,76],["FC Twente",77,75],["Utrecht",74,73],["Heerenveen",71,69],["Groningen",70,68]]},
    {id:"POR1",name:"葡萄牙超级联赛",country:"葡萄牙",tier:2,clubs:[["Benfica",86,82],["Sporting CP",85,82],["Porto",84,81],["Braga",79,77],["Vitória SC",75,73],["Famalicão",72,70],["Boavista",69,67],["Rio Ave",70,68]]}
  ];
  const DQD_TEAM_INDEX = new Map(DQD_DATA.teams.map(team => [`dqd-${team.id}`, team]));
  const DQD_BADGE_INDEX = new Map();
  DQD_DATA.teams.forEach(team => {
    [team.name, team.englishName].filter(Boolean).forEach(name => DQD_BADGE_INDEX.set(comparableClubName(name), team));
  });

  function comparableClubName(name) {
    return name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/\b(fc|cf|as|ac|sv|olympique)\b/g, "").replace(/[^\p{L}\p{N}]/gu, "");
  }

  const POSITION_LABELS={GK:"门将",CB:"中后卫",RB:"右后卫",LB:"左后卫",RWB:"右边翼卫",LWB:"左边翼卫",DM:"后腰",CM:"中前卫",RM:"右边前卫",LM:"左边前卫",AM:"前腰",RW:"右边锋",LW:"左边锋",ST:"中锋",CF:"影锋"};
  const POSITION_ORDER=["GK","RB","CB","LB","RWB","LWB","DM","CM","RM","LM","AM","RW","LW","CF","ST"];
  const LEGACY_POSITION_GROUPS={DF:["RB","CB","CB","LB","RWB","LWB","CB","RB","LB","CB"],FB:["RB","LB","RWB","LWB"],WG:["RW","LW","RM","LM"],MF:["DM","CM","RM","LM","AM"],CB:["CB","CB","RB","LB","RWB","LWB"],CM:["DM","CM","CM","AM","RM","LM"],ST:["ST","CF","ST","CF"]};

  function sourcePositionPattern(group) {
    if(group==="DF")return LEGACY_POSITION_GROUPS.DF;if(group==="CM")return LEGACY_POSITION_GROUPS.CM;if(group==="ST")return ["ST","RW","LW","CF","ST","RW","LW","CF"];
    return [group||"CM"];
  }
  function detailedSourcePosition(sourcePlayer,index,players=[]) {
    const group=sourcePlayer?.positionGroup||sourcePlayer?.position||"CM",number=Number(sourcePlayer?.number),sameGroup=players.filter(player=>(player.positionGroup||player.position)===group),ordinal=Math.max(0,sameGroup.indexOf(sourcePlayer)>=0?sameGroup.indexOf(sourcePlayer):index);
    if(group==="GK")return "GK";
    if(group==="DF"){
      if(number===2)return ordinal%2?"RWB":"RB";if(number===3)return ordinal%2?"LWB":"LB";if([4,5,6].includes(number))return "CB";
    }
    if(group==="CM"){
      if(number===6)return "DM";if(number===8)return "CM";if(number===10)return "AM";if(number===7)return "RM";if(number===11)return "LM";
    }
    if(group==="ST"){
      if(number===9)return "ST";if(number===10)return "CF";if(number===7)return "RW";if(number===11)return "LW";
    }
    const pattern=sourcePositionPattern(group);return pattern[ordinal%pattern.length];
  }
  function migrateDetailedPositions(players=[],clubId=null) {
    const sourceTeam=clubId?DQD_TEAM_INDEX.get(clubId):null;
    players.forEach((player,index)=>{
      const legacy=LEGACY_POSITION_GROUPS[player.position];
      if(["DF","FB","WG","MF"].includes(player.position)&&legacy){player.position=legacy[index%legacy.length];return;}
      if(!sourceTeam||player.dataStatus!=="dongqiudi-2026-07-31")return;
      const sourceIndex=sourceTeam.players.findIndex(source=>source.number===player.number&&comparableClubName(source.name)===comparableClubName(player.name));
      if(sourceIndex<0)return;
      player.position=detailedSourcePosition(sourceTeam.players[sourceIndex],sourceIndex,sourceTeam.players);
    });
    return players;
  }

  const SOURCE_ATTRIBUTE_OFFSETS={
    GK:{pace:-14,shooting:-25,passing:-5,dribbling:-18,defending:-8,physical:1},CB:{pace:-3,shooting:-16,passing:-3,dribbling:-8,defending:7,physical:5},
    RB:{pace:6,shooting:-9,passing:2,dribbling:3,defending:5,physical:2},LB:{pace:6,shooting:-9,passing:2,dribbling:3,defending:5,physical:2},
    RWB:{pace:8,shooting:-5,passing:4,dribbling:6,defending:3,physical:3},LWB:{pace:8,shooting:-5,passing:4,dribbling:6,defending:3,physical:3},
    DM:{pace:-2,shooting:-7,passing:5,dribbling:-2,defending:7,physical:4},CM:{pace:2,shooting:-2,passing:8,dribbling:3,defending:2,physical:2},
    RM:{pace:7,shooting:0,passing:6,dribbling:7,defending:-1,physical:2},LM:{pace:7,shooting:0,passing:6,dribbling:7,defending:-1,physical:2},
    AM:{pace:5,shooting:5,passing:9,dribbling:9,defending:-9,physical:-1},RW:{pace:9,shooting:7,passing:4,dribbling:11,defending:-13,physical:0},LW:{pace:9,shooting:7,passing:4,dribbling:11,defending:-13,physical:0},
    ST:{pace:5,shooting:12,passing:-4,dribbling:4,defending:-16,physical:6},CF:{pace:5,shooting:8,passing:5,dribbling:7,defending:-14,physical:3}
  };
  function sourcePlayerAttributes(position,overall) {
    const offsets=SOURCE_ATTRIBUTE_OFFSETS[position]||SOURCE_ATTRIBUTE_OFFSETS.CM,value=key=>clamp(overall+Number(offsets[key]||0),key==="defending"?25:35,96);
    return {pace:value("pace"),shooting:value("shooting"),passing:value("passing"),dribbling:value("dribbling"),defending:value("defending"),physical:value("physical")};
  }

  function applyDongqiudiData() {
    if (!DQD_DATA.teams.length) return;
    const clubs = DQD_DATA.teams.map(team => {
      const market = team.marketValueM || (LEAGUES[team.leagueId].tier === 1 ? 180 : 45);
      const prestige = clamp(Math.round(68 + 18 * Math.log10(Math.max(8, market) / 80)), 58, 96);
      const sourceName = team.englishName || team.name;
      const words = sourceName.replace(/[^\p{L}\p{N}\s]/gu, " ").trim().split(/\s+/).filter(Boolean);
      const code = (words.length > 1 ? words.map(word => word[0]).join("") : String(team.id)).slice(0,4).toUpperCase();
      return {
        id:`dqd-${team.id}`, name:team.name, englishName:team.englishName, code, league:team.leagueId,
        prestige, budget:Math.max(8, Math.round(market * (LEAGUES[team.leagueId].tier === 1 ? .11 : .08))),
        coach:"未导入", city:team.city, stadium:team.stadium, marketValueM:team.marketValueM,
        dataStatus:"dongqiudi-2026-07-31", source:team.source
      };
    });
    CLUBS.splice(0, CLUBS.length, ...clubs);
    Object.keys(OPPONENTS).forEach(leagueId => {
      const imported=DQD_DATA.teams.filter(team => team.leagueId === leagueId).map(team => team.name);if(imported.length)OPPONENTS[leagueId]=imported;
    });
    REAL_PLAYERS.forEach(player => { player.club = LEGACY_TEAM_MAP[player.club] || player.club; });
    COACHES.forEach(coach => { coach.club = LEGACY_TEAM_MAP[coach.club] || coach.club; });
    const featured=[...REAL_PLAYERS];
    const allPlayers=DQD_DATA.teams.flatMap(team => {
      const club=clubs.find(item=>item.id===`dqd-${team.id}`);
      return team.players.map((sourcePlayer,index)=>{
        const position=detailedSourcePosition(sourcePlayer,index,team.players);
        const overall=estimatedRating(sourcePlayer,club);
        const potential=clamp(overall+(sourcePlayer.age<=20?8:sourcePlayer.age<=23?5:sourcePlayer.age<=26?2:0),overall,95);
        const base={id:`dqd-real-${team.id}-${index}`,name:sourcePlayer.name,dqdName:sourcePlayer.name,club:club.id,position,age:sourcePlayer.age||24,overall,potential,value:sourcePlayer.marketValueM??Math.max(1,overall-64),wage:Math.round(overall*club.prestige*.014),nationality:sourcePlayer.nationality,...sourcePlayerAttributes(position,overall),dataStatus:"dongqiudi-2026-07-31",ratingSource:"game-estimate-v1"};
        const curated=featured.find(player=>player.club===club.id&&comparableClubName(player.dqdName||player.name)===comparableClubName(sourcePlayer.name));
        return curated?{...base,...curated,dqdName:sourcePlayer.name,club:club.id,nationality:sourcePlayer.nationality}:base;
      });
    }).sort((a,b)=>b.overall-a.overall||a.name.localeCompare(b.name,"zh-CN"));
    REAL_PLAYERS.splice(0,REAL_PLAYERS.length,...allPlayers);
  }

  function completeClubDirectory() {
    Object.entries(OPPONENTS).forEach(([leagueId,names]) => {
      names.forEach((name,index) => {
        if (CLUBS.some(club => comparableClubName(club.name) === comparableClubName(name))) return;
        const tier=LEAGUES[leagueId].tier;
        const prestige=clamp((tier===1?76:tier===2?64:56)+((names.length-index)%7),52,86);
        CLUBS.push({
          id:`${leagueId.toLowerCase()}-${index+1}`,
          name,
          code:name.split(/\s+/).map(part=>part[0]).join("").slice(0,4).toUpperCase(),
          league:leagueId,
          prestige,
          budget:Math.round((tier===1?38:13)+(prestige-60)*1.7),
          coach:"人员数据待授权导入",
          dataStatus:"club-directory"
        });
      });
    });
  }

  applyDongqiudiData();
  completeClubDirectory();
  const BASE_CLUB_LEAGUES=Object.fromEntries(CLUBS.map(club=>[club.id,club.league]));
  const REAL_PLAYER_ID_INDEX=new Map(REAL_PLAYERS.map(player=>[player.id,player]));
  const REAL_PLAYER_NAME_INDEX=new Map();REAL_PLAYERS.forEach(player=>[player.name,player.dqdName].filter(Boolean).forEach(name=>{const key=comparableClubName(name),list=REAL_PLAYER_NAME_INDEX.get(key)||[];if(!list.includes(player))list.push(player);REAL_PLAYER_NAME_INDEX.set(key,list);}));

  const FIRST = ["Alex","Mateo","Luca","Noah","Daniel","João","Theo","Elias","Samuel","Nico","Leo","Tom","Milan","Iker","Hugo","Ben","Adam","Oscar","Julian","Rafael","Marco","Felix","David","Yanis"];
  const LAST = ["Martin","Silva","Costa","Meyer","Rossi","Bernard","Wilson","Santos","Garcia","Novak","Diallo","Murphy","Keller","Lopez","Marin","Andersson","Ricci","Bauer","Fernandes","Moreau","Taylor","Pereira","Schmidt","Romero"];
  const POSITIONS = ["GK","RB","CB","CB","LB","DM","CM","CM","AM","RW","LW","ST","GK","RWB","CB","LWB","DM","RM","LM","CF","ST","CB","AM","CM"];
  const YOUTH_NATION_FOUNDATION={英格兰:91,西班牙:94,德国:91,意大利:89,法国:95,葡萄牙:91,荷兰:92,比利时:88,阿根廷:94,巴西:96,乌拉圭:88,克罗地亚:87,塞尔维亚:84,丹麦:84,挪威:82,瑞典:82,波兰:81,摩洛哥:85,塞内加尔:82,尼日利亚:84,科特迪瓦:83,日本:84,韩国:79,美国:81,墨西哥:82,哥伦比亚:87,厄瓜多尔:83,奥地利:82,瑞士:83,土耳其:82,苏格兰:80,爱尔兰:76,中国:68};
  const YOUTH_NAMES={
    英格兰:[["Oliver","George","Harry","Noah","Jack","Charlie"],["Smith","Taylor","Wilson","Walker","Bennett","Palmer"]],西班牙:[["Hugo","Mateo","Alejandro","Pablo","Iker","Nico"],["Garcia","Martinez","Lopez","Sanchez","Navarro","Ortega"]],德国:[["Noah","Leon","Finn","Jonas","Felix","Lukas"],["Meyer","Schmidt","Bauer","Keller","Wagner","Hoffmann"]],意大利:[["Luca","Matteo","Alessandro","Marco","Tommaso","Elia"],["Rossi","Ricci","Romano","Conti","Moretti","Gallo"]],法国:[["Hugo","Theo","Lucas","Enzo","Mathis","Yanis"],["Martin","Bernard","Dubois","Moreau","Diallo","Laurent"]],葡萄牙:[["Joao","Tiago","Diogo","Rafael","Goncalo","Duarte"],["Silva","Costa","Pereira","Fernandes","Santos","Carvalho"]],荷兰:[["Daan","Sem","Luuk","Mees","Jesse","Finn"],["de Jong","van Dijk","Bakker","Smit","Visser","Bos"]],比利时:[["Arthur","Louis","Jules","Victor","Milan","Mathis"],["Peeters","Janssens","Maes","Willems","Jacobs","Dubois"]],阿根廷:[["Mateo","Thiago","Santino","Lautaro","Julian","Tomas"],["Romero","Fernandez","Alvarez","Acosta","Medina","Rojas"]],巴西:[["Gabriel","Matheus","Rafael","Lucas","Joao","Vinicius"],["Silva","Santos","Oliveira","Costa","Souza","Pereira"]],克罗地亚:[["Luka","Ivan","Marko","Mateo","Ante","Dino"],["Kovacic","Peric","Maric","Juric","Novak","Basic"]],摩洛哥:[["Youssef","Adam","Ilyas","Amine","Rayan","Mehdi"],["El Amrani","Benali","Alaoui","Bennani","Idrissi","Tahiri"]],日本:[["Haruto","Yuto","Sota","Ren","Riku","Kaito"],["Sato","Suzuki","Takahashi","Tanaka","Ito","Watanabe"]],韩国:[["Min-jun","Ji-ho","Seo-jun","Hyun-woo","Jun-ho","Tae-yang"],["Kim","Lee","Park","Choi","Jung","Kang"]]
  };
  const YOUTH_UPGRADE_COSTS={facilities:[0,0,6,12,22,36],recruitment:[0,0,4,9,17,28]};

  let setup = { role:"coach", origin:"real", identity:COACHES[0].name, clubId:COACHES[0].club, leagueId:clubById(COACHES[0].club).league, customName:"", customAge:35, customPosition:"CM" };
  let activeSaveId = null;
  let frontScreen = "menu";
  let state = null;
  let modal = null;
  let conversationSession = null;
  let playerProfileRegistry = new Map();
  let playerProfileSequence = 0;
  let clubProfileRegistry = new Map();
  let clubProfileSequence = 0;
  let transferRecommendationRegistry = [];
  let matchTimer = null;
  let matchCanvasFrame = null;
  let busyTaskActive = false;

  const app = document.getElementById("app");

  function esc(value) {
    return String(value ?? "").replace(/[&<>'"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"}[c]));
  }

  function icon(name) { return `<i data-lucide="${name}" class="icon" aria-hidden="true"></i>`; }
  function clubById(id) { return CLUBS.find(c => c.id === id) || CLUBS[0]; }
  function leagueOf(club) { return LEAGUES[club.league]; }
  function resetClubLeagueAssignments() {CLUBS.forEach(club=>{club.league=BASE_CLUB_LEAGUES[club.id]||club.league;});}
  function applyClubLeagueAssignments(save) {resetClubLeagueAssignments();Object.entries(save?.worldClubLeagues||{}).forEach(([clubId,leagueId])=>{const club=CLUBS.find(item=>item.id===clubId);if(club&&LEAGUES[leagueId])club.league=leagueId;});}
  function leagueClubNames(leagueId) {const names=CLUBS.filter(club=>club.league===leagueId).map(club=>club.name);return names.length?names:[...(OPPONENTS[leagueId]||[])];}
  function rand(min, max) { return Math.random() * (max - min) + min; }
  function clamp(n, min, max) { return Math.max(min, Math.min(max, n)); }
  function money(n) { return `€${Number(n).toFixed(n >= 10 ? 1 : 2)}m`; }
  function formatDate(value, withYear = true) {
    const d = new Date(`${value}T12:00:00`);
    return new Intl.DateTimeFormat("zh-CN", { month:"short", day:"numeric", ...(withYear ? {year:"numeric"} : {}) }).format(d);
  }
  function matchClockLabel(minute) { const value=Number(minute)||0;return value>90?`90+${value-90}'`:`${value}'`; }
  function eventMinuteLabel(minute) { return matchClockLabel(minute); }

  function playerTransferRecords(save,player) {
    if(!save||!player)return [];
    const records=[...(save.transferHistory||[]),...(save.transferMarket?.records||[])],unique=new Map();records.forEach(record=>{if(sameTransferPlayer(record,player))unique.set(record.id,record);});
    return [...unique.values()].sort((a,b)=>a.date.localeCompare(b.date)||String(a.id).localeCompare(String(b.id)));
  }

  function mergePlayerCareerStats(player,records) {
    const rows=[...(Array.isArray(player.careerStats)?player.careerStats:[])];
    records.forEach(record=>{
      if(Array.isArray(record.careerHistory))rows.push(...record.careerHistory);
      if(record.careerSegment)rows.push(record.careerSegment);
    });
    const unique=new Map();
    rows.forEach((row,index)=>{
      const key=`${row.season}|${row.clubId||row.club}|${row.endDate||row.startDate||"full"}|${row.appearances||0}|${row.goals||0}|${row.assists||0}`;
      if(!unique.has(key))unique.set(key,{...row,_order:index});
    });
    return [...unique.values()].sort((a,b)=>Number(b.season||0)-Number(a.season||0)||String(b.endDate||"").localeCompare(String(a.endDate||""))||b._order-a._order).map(({_order,...row})=>row);
  }

  function playerProfileData(player,context={}) {
    const raw={...player,name:player.name||player.playerName,...context};
    const local=state?.squad?.find(item=>item.id===raw.id||comparableClubName(item.name)===comparableClubName(raw.name));
    const opponent=state?.activeMatch?.opponentPlayers?.find(item=>item.id===raw.id||comparableClubName(item.name)===comparableClubName(raw.name));
    const real=REAL_PLAYERS.find(item=>item.id===raw.id||comparableClubName(item.name)===comparableClubName(raw.name)||comparableClubName(item.dqdName)===comparableClubName(raw.name));
    const merged={...(real||{}),...(opponent||{}),...(local||{}),...raw},records=playerTransferRecords(state,merged),latestTransfer=records.at(-1);
    merged.name||="未知球员";merged.position||="CM";merged.age=Number(merged.age)||24;
    merged.overall=Number(merged.overall||merged.ca)||65;merged.potential=Math.max(merged.overall,Number(merged.potential||merged.pa)||merged.overall);
    if(!local&&real){merged.age=effectivePlayerAge(real,state);merged.value=currentPlayerMarketValue(real,state);}
    const canonicalClubId=latestTransfer?.toId||(local?state.clubId:real?currentPlayerClubId(state,real):merged.clubId),canonicalClub=canonicalClubId?clubById(canonicalClubId):null;
    merged.clubId=canonicalClub?.id||merged.clubId;merged.clubName=canonicalClub?.name||merged.clubName||(resolveClub(merged.club)?.name)||merged.club||"未知俱乐部";
    hydrateWorldPlayerStats(state,merged,merged.clubId);
    merged.transferHistory=records;merged.latestTransfer=latestTransfer||null;merged.careerStats=mergePlayerCareerStats(merged,records);
    if(latestTransfer?.contract)merged.contract={...(merged.contract||{}),...latestTransfer.contract};
    merged.contractEnd=merged.contract?.endSeason||merged.contractEnd;
    return merged;
  }

  function playerNameLink(player,context={}) {
    const profile=playerProfileData(player,context),token=`player-profile-${++playerProfileSequence}`;
    playerProfileRegistry.set(token,profile);
    return `<button type="button" class="player-profile-link" data-player-profile="${token}">${esc(profile.name)}</button>`;
  }

  function resolveClub(value) {
    if (!value) return null;
    if (typeof value === "object" && value.id) return CLUBS.find(item=>item.id===value.id) || null;
    const raw=String(value),byId=CLUBS.find(item=>item.id===raw);
    const target=comparableClubName(raw),exact=byId || findClubByName(raw) || CLUBS.find(item=>comparableClubName(item.englishName||"")===target);
    if(exact)return exact;
    const partial=target.length>=4?CLUBS.filter(item=>{const names=[item.name,item.englishName].filter(Boolean).map(comparableClubName);return names.some(name=>name.includes(target)||target.includes(name));}):[];
    return partial.length===1?partial[0]:null;
  }

  function clubProfileData(value) {
    const club=resolveClub(value)||clubById(state?.clubId);
    const league=club?leagueOf(club):null;
    const source=club?DQD_TEAM_INDEX.get(club.id):null;
    const roster=club?aiClubPlayers(state,club.id):[];
    return {club,league,source,roster};
  }

  function clubNameLink(value,context={}) {
    const club=resolveClub(value);if(!club)return esc(context.label||value||"球队");
    const token=`club-profile-${++clubProfileSequence}`;clubProfileRegistry.set(token,club);
    return `<button type="button" class="club-profile-link" data-club-profile="${token}">${esc(context.label||club.name)}</button>`;
  }

  function createWorldHistory() {return {seasons:[],competitions:{},clubHonors:{},promotions:[]};}
  function ensureWorldHistory(save=state) {
    if(!save)return createWorldHistory();
    const history=save.worldHistory||(save.worldHistory=createWorldHistory());history.seasons=Array.isArray(history.seasons)?history.seasons:[];history.competitions=history.competitions&&typeof history.competitions==="object"?history.competitions:{};history.clubHonors=history.clubHonors&&typeof history.clubHonors==="object"?history.clubHonors:{};history.promotions=Array.isArray(history.promotions)?history.promotions:[];
    save.worldClubLeagues=save.worldClubLeagues&&typeof save.worldClubLeagues==="object"?save.worldClubLeagues:Object.fromEntries(CLUBS.map(club=>[club.id,club.league]));
    (save.honors||[]).filter(item=>item.scope==="俱乐部").forEach(item=>recordClubHonor(save,save.clubId,item.name,item.season,item.name,{legacy:true}));return history;
  }
  function recordClubHonor(save,clubId,name,season,competition=name,details={}) {
    if(!save||!clubId||!name)return null;const history=save.worldHistory||(save.worldHistory=createWorldHistory());history.clubHonors||={};const records=history.clubHonors[clubId]||=([]),key=`${season}|${name}`;let record=records.find(item=>`${item.season}|${item.name}`===key);if(!record){record={id:`honor-${clubId}-${season}-${comparableClubName(name)}`,clubId,name,competition,season,...details};records.unshift(record);}else Object.assign(record,details);return record;
  }
  function recordCompetitionSeason(save,name,record) {const history=ensureWorldHistory(save),records=history.competitions[name]||=([]),existing=records.find(item=>Number(item.season)===Number(record.season));if(existing)Object.assign(existing,record);else records.unshift({...record,name});records.sort((a,b)=>b.season-a.season);history.competitions[name]=records.slice(0,30);return existing||records[0];}

  function historicalClubHonors(club) {
    const league=LEAGUES[BASE_CLUB_LEAGUES[club.id]]||leagueOf(club), honors=[];
    if (!club) return honors;
    const seed=String(club.id).split("").reduce((sum,ch)=>sum+ch.charCodeAt(0),0);
    const top=Number(club.prestige||0)>=86;
    if (top) honors.push({name:`${league?.name||"国内顶级联赛"}冠军`,count:1+(seed%5),asset:trophyAsset(`${league?.name||"联赛"}冠军`)});
    if (Number(club.prestige||0)>=80) honors.push({name:league?.cup||"国内杯赛",count:1+(seed%3),asset:trophyAsset(league?.cup||"国内杯赛")});
    if (Number(club.prestige||0)>=92) honors.push({name:"洲际赛事冠军",count:1+(seed%2),asset:"continental-cup.png"});
    return honors.map(item=>({...item,source:"历史资料",seasons:[]}));
  }
  function clubHonors(club) {
    if(!club)return [];const earned=state?ensureWorldHistory(state).clubHonors[club.id]||[]:[],groups=new Map();
    historicalClubHonors(club).forEach(item=>groups.set(item.name,{...item}));earned.forEach(record=>{const item=groups.get(record.name)||{name:record.name,count:0,asset:trophyAsset(record.name),source:"存档记录",seasons:[]};item.count=Number(item.count||0)+1;item.seasons=[...new Set([...(item.seasons||[]),record.season])].sort((a,b)=>b-a);item.source=item.source==="历史资料"?"历史资料 + 存档记录":"存档记录";groups.set(record.name,item);});return [...groups.values()].sort((a,b)=>(b.seasons?.[0]||0)-(a.seasons?.[0]||0)||b.count-a.count);
  }
  function addDays(value, days) {
    const d = new Date(`${value}T12:00:00`); d.setDate(d.getDate() + days); return d.toISOString().slice(0,10);
  }
  function daysBetween(a,b) { return Math.round((new Date(`${b}T12:00:00`) - new Date(`${a}T12:00:00`)) / 86400000); }
  function initials(name) { return name.split(/\s+/).map(x => x[0]).slice(0,2).join("").toUpperCase(); }
  function badgeTeam(value) {
    const club = typeof value === "object" ? value : CLUBS.find(item => item.id === value || comparableClubName(item.name) === comparableClubName(String(value || "")) || comparableClubName(item.englishName || "") === comparableClubName(String(value || "")));
    const directId = String(club?.id || value || "").match(/^dqd-(\d+)$/)?.[1];
    const source = directId ? DQD_DATA.teams.find(team => String(team.id) === directId) : DQD_BADGE_INDEX.get(comparableClubName(club?.name || String(value || ""))) || DQD_BADGE_INDEX.get(comparableClubName(club?.englishName || ""));
    return { id:directId || (source ? String(source.id) : ""), name:club?.name || source?.name || String(value || ""), code:club?.code || initials(source?.englishName || source?.name || String(value || "")) };
  }
  function clubBadge(value, className="") {
    const team=badgeTeam(value),label=team.name||"球队";
    return `<span class="club-badge ${esc(className)}" title="${esc(label)}"><span class="club-badge-fallback" aria-hidden="true">${esc(team.code||"FC")}</span>${team.id?`<img src="assets/badges/${team.id}.png" alt="${esc(label)}队徽" loading="lazy" onerror="this.remove()">`:""}</span>`;
  }
  function playerRoleLabel(pos) { return POSITION_LABELS[pos]||({FB:"边后卫",DF:"后卫",WG:"边锋",MF:"中场"})[pos]||pos; }
  function positionSortRank(pos) { const index=POSITION_ORDER.indexOf(pos);return index>=0?index:99; }
  function averageRating(player) { return player?.appearances ? Number(player.ratingTotal||0)/player.appearances : 0; }

  const WORLD_PLAYER_STAT_KEYS=["appearances","minutes","goals","assists","ratingTotal","keyPasses","chancesCreated","successfulDribbles","progressivePasses","tackles","tacklesWon","interceptions","clearances","blocks","duels","duelsWon","recoveries","pressuresWon","saves","cleanSheets","yellowCards","redCards"];
  function emptyWorldPlayerStats() {return Object.fromEntries(WORLD_PLAYER_STAT_KEYS.map(key=>[key,0]));}
  function ensureWorldPlayerStats(save=state) {
    if(!save)return {season:2026,players:{},archives:{},processedMatches:{}};
    const world=save.worldPlayerStats||(save.worldPlayerStats={season:Number(save.season||2026),players:{},archives:{},processedMatches:{}});
    world.season=Number(world.season||save.season||2026);world.players=world.players&&typeof world.players==="object"?world.players:{};world.archives=world.archives&&typeof world.archives==="object"?world.archives:{};world.processedMatches=world.processedMatches&&typeof world.processedMatches==="object"?world.processedMatches:{};
    Object.values(world.players).forEach(record=>{record.segments=Array.isArray(record.segments)?record.segments.filter(segment=>segment?.endDate):[];});const processed=Object.keys(world.processedMatches);if(processed.length>240)world.processedMatches=Object.fromEntries(processed.slice(-240).map(key=>[key,true]));
    return world;
  }
  function canonicalWorldPlayer(save,player,clubId=null) {
    if(!player)return null;const ids=[player.sourcePlayerId,player.playerId,player.id].filter(Boolean),direct=ids.map(id=>REAL_PLAYER_ID_INDEX.get(id)).find(Boolean);if(direct)return direct;
    const name=comparableClubName(player.name||player.playerName||"");if(!name)return null;const matches=REAL_PLAYER_NAME_INDEX.get(name)||[];if(matches.length===1)return matches[0];
    return matches.find(candidate=>currentPlayerClubId(save,candidate)===(clubId||player.clubId||player.club))||matches[0]||null;
  }
  function worldPlayerKey(save,player,clubId=null) {const canonical=canonicalWorldPlayer(save,player,clubId);return canonical?.id||player?.sourcePlayerId||player?.playerId||player?.id||`name-${comparableClubName(player?.name||player?.playerName||"unknown")}`;}
  function ensureWorldPlayerRecord(save,player,clubId=null,seedFromPlayer=false) {
    if(!save||!player)return null;const world=ensureWorldPlayerStats(save),canonical=canonicalWorldPlayer(save,player,clubId),id=worldPlayerKey(save,player,clubId),resolvedClubId=clubId||player.clubId||player.club||(canonical?currentPlayerClubId(save,canonical):null)||save.clubId;
    let record=world.players[id];if(!record){record={playerId:id,name:player.name||player.playerName||canonical?.name||"未知球员",season:Number(save.season||world.season),clubId:resolvedClubId,position:player.position||canonical?.position||"CM",overall:Number(player.overall||canonical?.overall||65),...emptyWorldPlayerStats(),segments:[]};world.players[id]=record;if(seedFromPlayer)WORLD_PLAYER_STAT_KEYS.forEach(key=>{record[key]=Number(player[key]||0);});}
    record.clubId=resolvedClubId||record.clubId;record.name=player.name||player.playerName||record.name;record.position=player.position||record.position;record.overall=Number(player.overall||record.overall||65);record.segments=Array.isArray(record.segments)?record.segments:[];return record;
  }
  function addWorldPlayerStats(save,player,clubId,delta={},meta={}) {
    const record=ensureWorldPlayerRecord(save,player,clubId,false);if(!record)return null;WORLD_PLAYER_STAT_KEYS.forEach(key=>{const amount=Number(delta[key]||0);record[key]=Number(record[key]||0)+amount;});
    if(meta.rating!==undefined)record.lastRating=Number(meta.rating);if(meta.date)record.lastMatchDate=meta.date;return record;
  }
  function syncWorldPlayerSnapshot(save,player,clubId=save?.clubId) {
    const record=ensureWorldPlayerRecord(save,player,clubId,true);if(!record)return null;WORLD_PLAYER_STAT_KEYS.forEach(key=>{record[key]=Number(player[key]||0);});record.lastRating=player.lastRating??record.lastRating;record.lastMatchDate=player.lastMatchDate||record.lastMatchDate;return record;
  }
  function syncManagedSquadWorldStats(save=state) {(save?.squad||[]).forEach(player=>syncWorldPlayerSnapshot(save,player,save.clubId));}
  function hydrateWorldPlayerStats(save,player,clubId=null) {
    if(!save||!player)return player;const id=worldPlayerKey(save,player,clubId),record=ensureWorldPlayerStats(save).players[id];if(!record)return player;WORLD_PLAYER_STAT_KEYS.forEach(key=>{player[key]=Number(record[key]||0);});player.lastRating=record.lastRating??player.lastRating;player.form=record.lastRating??player.form;const archived=ensureWorldPlayerStats(save).archives[id]||[];player.careerStats=mergePlayerCareerStats({...player,careerStats:[...(player.careerStats||[]),...archived]},[]);return player;
  }
  function moveWorldPlayerClub(save,player,fromId,toId,date) {
    const record=syncWorldPlayerSnapshot(save,player,fromId)||ensureWorldPlayerRecord(save,player,fromId,true);if(!record)return null;const segment={...Object.fromEntries(WORLD_PLAYER_STAT_KEYS.map(key=>[key,Number(record[key]||0)])),id:`world-segment-${record.season}-${record.playerId}-${fromId}-${date}`,season:record.season,clubId:fromId,club:clubById(fromId).name,startDate:record.lastTransferDate||`${record.season}-08-01`,endDate:date,partialSeason:true,average:record.appearances?Number((Number(record.ratingTotal||0)/record.appearances).toFixed(2)):0};record.segments=[...(record.segments||[]),segment].slice(-8);record.clubId=toId;record.lastTransferDate=date;return record;
  }
  function archiveWorldPlayerSeason(save=state) {
    const world=ensureWorldPlayerStats(save);Object.entries(world.players).forEach(([id,record])=>{const current={...Object.fromEntries(WORLD_PLAYER_STAT_KEYS.map(key=>[key,Number(record[key]||0)])),id:`world-season-${record.season}-${id}-${record.clubId}`,season:record.season,clubId:record.clubId,club:clubById(record.clubId).name,endDate:save.date,partialSeason:false,average:record.appearances?Number((Number(record.ratingTotal||0)/record.appearances).toFixed(2)):0},rows=[...(record.segments||[]),current];world.archives[id]=[...rows,...(world.archives[id]||[])].slice(0,24);});world.players={};world.processedMatches={};world.season=Number(save.season||2026)+1;return world;
  }

  function compactWorldPlayerStats(save=state) {const world=ensureWorldPlayerStats(save);world.processedMatches=Object.fromEntries(Object.keys(world.processedMatches||{}).slice(-120).map(key=>[key,true]));world.archives=Object.fromEntries(Object.entries(world.archives||{}).map(([id,rows])=>[id,(rows||[]).slice(0,12).map(row=>{const compact={...row};WORLD_PLAYER_STAT_KEYS.forEach(key=>{if(!compact[key])delete compact[key];});delete compact.name;delete compact.overall;delete compact.position;return compact;})]));Object.values(world.players||{}).forEach(record=>{record.segments=(record.segments||[]).slice(-4);});return world;}

  const MARKET_VALUE_POSITION_FACTORS={GK:.82,CB:.9,RB:.92,LB:.92,RWB:.96,LWB:.96,DM:.95,CM:1,RM:1.02,LM:1.02,AM:1.06,RW:1.09,LW:1.09,CF:1.09,ST:1.11};
  function marketQuarterKey(date=START_DATE) {const parsed=new Date(`${date}T12:00:00`),quarter=Math.floor(parsed.getMonth()/3)+1;return `${parsed.getFullYear()}-Q${quarter}`;}
  function isMarketValueReviewDate(date) {return ["01-01","04-01","07-01","10-01"].includes(String(date||"").slice(5));}
  function managedSquadPlayer(player,save=state) {return (save?.squad||[]).some(item=>item===player||item.id===player?.id||item.sourcePlayerId===player?.id||player?.sourcePlayerId===item.id);}
  function effectivePlayerAge(player,save=state) {return Number(player?.age||24)+(REAL_PLAYERS.includes(player)&&!managedSquadPlayer(player,save)?Math.max(0,Number(save?.season||2026)-2026):0);}
  function marketValueAgeFactor(age) {
    if(age<=19)return 1.18;if(age<=21)return 1.22;if(age<=23)return 1.18;if(age<=25)return 1.12;if(age<=27)return 1.04;if(age<=29)return .92;
    return ({30:.78,31:.64,32:.5,33:.38,34:.28,35:.2})[age]||.14;
  }
  function marketValueRatingFactor(rating) {
    if(rating>=7.8)return 1.26;if(rating>=7.4)return 1.16+(rating-7.4)*.25;if(rating>=7)return 1.08+(rating-7)*.2;
    if(rating>=6.6)return 1+(rating-6.6)*.2;if(rating>=6.3)return .9+(rating-6.3)/3;return .86;
  }
  function calculatePlayerMarketValue(player,save=state) {
    const ca=clamp(Number(player?.overall||player?.ca)||60,40,99),pa=clamp(Math.max(ca,Number(player?.potential||player?.pa)||ca),ca,99),age=effectivePlayerAge(player,save),gap=Math.max(0,pa-ca);
    const potentialRate=age<=21?.065:age<=23?.05:age<=25?.035:age<=27?.022:.008,potentialFactor=clamp(1+gap*potentialRate,1,1.6),positionFactor=MARKET_VALUE_POSITION_FACTORS[player?.position]||1;
    const clubId=managedSquadPlayer(player,save)?save?.clubId:(save?.transferMarket?.clubOverrides?.[player?.id]||player?.clubId||player?.club),club=CLUBS.find(item=>item.id===clubId),prestigeFactor=club?clamp(.9+(Number(club.prestige||75)-65)*.004,.9,1.09):1;
    const appearances=Math.max(0,Number(player?.appearances||0)),rating=averageRating(player),playedClubMatches=Math.max(appearances,(save?.schedule||[]).filter(fixture=>fixture.status==="played"&&!fixture.international).length,Number(save?.played||0)),performanceTracked=managedSquadPlayer(player,save)||appearances>0;
    const performanceFactor=appearances>=3&&rating?marketValueRatingFactor(rating):1,attendanceFactor=performanceTracked&&playedClubMatches>=5?clamp(.86+(appearances/playedClubMatches)*.22,.88,1.08):1;
    const expectedContribution=({GK:.015,CB:.06,RB:.1,LB:.1,RWB:.16,LWB:.16,DM:.1,CM:.22,RM:.28,LM:.28,AM:.36,RW:.4,LW:.4,CF:.48,ST:.5})[player?.position]||.22,contributionPerGame=appearances?(Number(player?.goals||0)+Number(player?.assists||0)*.85)/appearances:0,contributionFactor=appearances>=3?1+clamp((contributionPerGame/expectedContribution-1)*.055,0,.14):1;
    const currentInjury=Number(player?.injured||0),injuryFactor=currentInjury>=30?.92:currentInjury>=14?.96:1,seasonInjuryDays=Number(player?.development?.injuryDays||0),availabilityFactor=seasonInjuryDays>=80?.95:seasonInjuryDays>=40?.98:1;
    const raw=Math.pow(1.17,ca-60)*marketValueAgeFactor(age)*potentialFactor*positionFactor*prestigeFactor*performanceFactor*attendanceFactor*contributionFactor*injuryFactor*availabilityFactor;
    const bounded=clamp(raw,.05,300);return Number(bounded.toFixed(bounded>=10?1:2));
  }
  function initializePlayerMarketValue(player,save=state,date=save?.date) {
    const current=Number(player?.value),value=Number.isFinite(current)&&current>0?current:calculatePlayerMarketValue(player,save),existing=player.marketValueState||{};
    player.value=value;player.marketValueState={season:Number(existing.season??save?.season??2026),seasonStartValue:Number(existing.seasonStartValue??value),previousValue:Number(existing.previousValue??value),targetValue:Number(existing.targetValue??calculatePlayerMarketValue(player,save)),lastChange:Number(existing.lastChange||0),lastUpdatedDate:existing.lastUpdatedDate||date||START_DATE,reason:existing.reason||"季度估值基准"};return player.marketValueState;
  }
  function quarterlyMarketValue(player,save=state,date=save?.date) {
    const market=initializePlayerMarketValue(player,save,date),previous=Number(player.value||market.previousValue||.05),target=calculatePlayerMarketValue(player,save),next=Number(clamp(target,Math.max(.05,previous*.7),Math.max(.08,previous*1.42)).toFixed(target>=10||previous>=10?1:2));
    player.value=next;player.marketValueState={...market,season:Number(save?.season||market.season),previousValue:previous,targetValue:target,lastChange:Number((next-previous).toFixed(2)),lastUpdatedDate:date,reason:"季度身价评估"};return {player,previous,value:next,target,change:Number((next-previous).toFixed(2))};
  }
  function ensureMarketValuation(save=state) {
    if(!save)return null;save.worldMarketValues=save.worldMarketValues&&typeof save.worldMarketValues==="object"?save.worldMarketValues:{};REAL_PLAYERS.forEach(player=>{if(!Number.isFinite(Number(save.worldMarketValues[player.id])))save.worldMarketValues[player.id]=Number(player.value)||calculatePlayerMarketValue(player,save);});
    save.marketValuation={lastQuarterKey:marketQuarterKey(save.date||START_DATE),lastUpdatedDate:save.date||START_DATE,...(save.marketValuation||{})};(save.squad||[]).forEach(player=>initializePlayerMarketValue(player,save,save.date));return save.marketValuation;
  }
  function currentPlayerMarketValue(player,save=state) {
    const local=(save?.squad||[]).find(item=>item===player||item.id===player?.id||item.sourcePlayerId===player?.id);if(local)return Number(local.value)||calculatePlayerMarketValue(local,save);
    const stored=save?.worldMarketValues?.[player?.id];return Number.isFinite(Number(stored))?Number(stored):(Number(player?.value)||calculatePlayerMarketValue(player,save));
  }
  function resetSeasonMarketValueBaseline(save=state) {(save?.squad||[]).forEach(player=>{const market=initializePlayerMarketValue(player,save,save.date);market.season=save.season;market.seasonStartValue=Number(player.value||0);});}
  function runQuarterlyMarketValueReview(save=state,date=save?.date) {
    const valuation=ensureMarketValuation(save),key=marketQuarterKey(date);if(!isMarketValueReviewDate(date)||valuation.lastQuarterKey===key)return null;
    const changes=(save.squad||[]).map(player=>quarterlyMarketValue(player,save,date));REAL_PLAYERS.forEach(player=>{const previous=Number(save.worldMarketValues[player.id]??player.value)||.05,target=calculatePlayerMarketValue(player,save);save.worldMarketValues[player.id]=Number(clamp(target,Math.max(.05,previous*.7),Math.max(.08,previous*1.42)).toFixed(target>=10||previous>=10?1:2));});
    valuation.lastQuarterKey=key;valuation.lastUpdatedDate=date;const movers=[...changes].sort((a,b)=>Math.abs(b.change)-Math.abs(a.change)).slice(0,3),label=`${key.slice(0,4)} 年第 ${key.at(-1)} 季度`;
    addNotification({title:`${label}球员身价评估已发布`,type:"transfer",date,detail:"最新估值综合年龄、当前能力、潜力、赛季出勤、场均评分以及进球助攻表现，并将作为转会谈判的最新参考。",facts:movers.map(item=>`${item.player.name}：${money(item.previous)} → ${money(item.value)}（${item.change>0?"+":item.change<0?"-":""}${money(Math.abs(item.change))}）`)});
    return {type:"market-value",title:"季度球员身价评估已发布",view:"squad",changes};
  }

  function notificationId(prefix="notice") { return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2,8)}`; }
  function notificationTypeFromTitle(title="") {
    if(title.includes("赛后")||title.includes("取胜")||title.includes("战平")||title.includes("告负"))return "match";
    if(title.includes("医疗")||title.includes("伤"))return "medical";
    if(title.includes("董事会")||title.includes("目标"))return "board";
    if(title.includes("赛程"))return "schedule";
    if(title.includes("欧冠"))return "competition";
    if(title.includes("引援")||title.includes("转会"))return "transfer";
    return "general";
  }
  function normalizeNotification(item,index=0,save=state) {
    if(item&&typeof item==="object")return {
      id:item.id||notificationId("notice"),title:item.title||"俱乐部通知",type:item.type||notificationTypeFromTitle(item.title),date:item.date||save?.date||START_DATE,
      read:Boolean(item.read),detail:item.detail||"该事项已归档，可在这里查看处理结果。",facts:Array.isArray(item.facts)?item.facts:[],reportId:item.reportId||null
    };
    const title=String(item||"俱乐部通知"),type=notificationTypeFromTitle(title);
    const details={
      match:"这条赛后通知来自旧版本存档，当时尚未保存详细比赛数据。之后完成的比赛会保留完整技术统计、球员评分与换人记录。",
      medical:"医疗组已完成检查或恢复评估。该通知来自旧版本存档，因此没有可追溯的个人医学明细。",
      board:"董事会已经确认当前赛季目标，将根据联赛成绩、杯赛进度和球队发展持续评估你的表现。",
      schedule:"赛程办公室已经生成本赛季日程，后续杯赛轮次会在前一轮结束后实时确定。",
      competition:"该项赛事进度已经更新。后续轮次只会在晋级结果确定后生成。",
      transfer:"这项建议已经交给球探与管理层评估，最终决定取决于预算、阵容需求和球员意愿。",
      general:"该事项已归档，可在这里查看处理结果。"
    };
    return {id:`legacy-${index}-${Math.abs(title.split("").reduce((sum,char)=>sum+char.charCodeAt(0),0))}`,title,type,date:save?.date||START_DATE,read:false,detail:details[type],facts:[],reportId:null};
  }
  function addNotification(payload) {
    state.notifications ||= [];
    state.notifications.unshift(normalizeNotification({...payload,id:payload.id||notificationId(payload.type||"notice"),read:false},0,state));
    state.notifications=state.notifications.slice(0,20);
    state.inboxUnread=state.notifications.filter(item=>!item.read).length;
  }
  function initialNotifications(club,schedule) {
    const league=leagueOf(club),next=schedule[0];
    return [
      {id:"initial-board",title:"董事会：新赛季目标已确认",type:"board",date:START_DATE,read:false,detail:`董事会要求球队在 ${league.name} 保持竞争力，并根据俱乐部声望争取合理的联赛排名。杯赛表现、阵容发展和财政健康也会纳入评估。`,facts:[`联赛目标：争取前 ${club.prestige>=90?4:club.prestige>=80?8:14} 名`,`杯赛目标：至少进入中后段轮次`,`转会预算：${money(club.budget)}`]},
      {id:"initial-medical",title:"医疗组：全队体检完成",type:"medical",date:START_DATE,read:false,detail:"一线队季前体检已经完成。医疗组会根据体能、伤病和赛程密度动态调整恢复建议。",facts:["当前无新增伤病","密集赛程将提高轮换与恢复权重"]},
      {id:"initial-schedule",title:"赛程办公室：新赛季日程已生成",type:"schedule",date:START_DATE,read:false,detail:"联赛和已确定的杯赛日程已经生成。淘汰赛后续轮次不会预先锁定，只有上一轮结束并确认晋级后才会生成日期和对手。",facts:[`已确定 ${schedule.length} 场比赛`,next?`首场：${formatDate(next.date,false)} 对阵 ${next.opponent}`:"暂无待赛比赛","正式比赛间隔至少 72 小时"]}
    ];
  }

  function estimatedRating(sourcePlayer, club) {
    const value = sourcePlayer.marketValueM ?? Math.max(1, club.marketValueM / 28);
    return clamp(Math.round(65 + 10 * Math.log10(value + 1) + (club.prestige - 75) * .08), 58, 92);
  }

  function createSquad(club, controlled) {
    const sourceTeam = DQD_TEAM_INDEX.get(club.id);
    if (sourceTeam?.players?.length) {
      const squad = sourceTeam.players.map((sourcePlayer, index) => {
        const overall = estimatedRating(sourcePlayer, club);
        const youthGrowth = sourcePlayer.age <= 20 ? 8 : sourcePlayer.age <= 23 ? 5 : sourcePlayer.age <= 26 ? 2 : 0;
        return {
          id:`dqd-player-${sourceTeam.id}-${index}`, name:sourcePlayer.name, number:sourcePlayer.number,
          position:detailedSourcePosition(sourcePlayer,index,sourceTeam.players),
          nationality:sourcePlayer.nationality, age:sourcePlayer.age || 24, overall,
          potential:clamp(overall + youthGrowth, overall, 95), value:sourcePlayer.marketValueM ?? Math.max(1, overall - 64),
          sourceValueLabel:sourcePlayer.marketValueLabel, wage:Math.round(overall * club.prestige * .014),...sourcePlayerAttributes(detailedSourcePosition(sourcePlayer,index,sourceTeam.players),overall),
          fitness:Math.round(rand(84,100)), morale:Math.round(rand(68,95)), form:0, lastRating:null,
          ratingTotal:0, appearances:0, goals:0, assists:0, injured:0, injury:null,
          dataStatus:"dongqiudi-2026-07-31", ratingSource:"game-estimate-v1"
        };
      });
      if (controlled && controlled.club === club.id) {
        const sourceName = controlled.dqdName || controlled.name;
        let existing = squad.findIndex(player => comparableClubName(player.name) === comparableClubName(sourceName));
        if (existing < 0) existing = squad.findIndex(player => player.position === controlled.position);
        const base = existing >= 0 ? squad[existing] : {};
        const controlledRecord = { ...base, ...controlled, id:"controlled", fitness:96, morale:88, form:0, lastRating:null, ratingTotal:0, appearances:0, goals:0, assists:0, injured:0, injury:null, consecutiveStarts:0, lastMatchMinutes:0, lastMatchDate:null };
        if (existing >= 0) squad[existing] = controlledRecord; else squad.push(controlledRecord);
      }
      return squad.sort((a,b) => positionSortRank(a.position)-positionSortRank(b.position));
    }
    const squad = [];
    for (let i=0; i<22; i++) {
      const base = clamp(Math.round(club.prestige - 20 + rand(-7,8)), 61, 91);
      const age = Math.round(rand(18,34));
      squad.push({
        id:`p-${i}`, name:`${FIRST[(i*5 + club.code.length)%FIRST.length]} ${LAST[(i*7 + club.name.length)%LAST.length]}`,
        position:POSITIONS[i], age, overall:base, potential:clamp(base + Math.round(rand(age < 23 ? 3 : 0, age < 23 ? 12 : 3)),base,95),
        value:Math.max(1, Math.round((base-58)*(base-58)*0.08*(age>30?.65:1)*10)/10),
        wage:Math.round(base*club.prestige*.014), fitness:Math.round(rand(84,100)), morale:Math.round(rand(68,95)),
        form:0, lastRating:null, ratingTotal:0, appearances:0, goals:0, assists:0, injured:0, injury:null,
        dataStatus:"generated-v0"
      });
    }
    if (controlled && controlled.club === club.id) {
      const existing = squad.findIndex(p => p.position === controlled.position);
      squad[existing] = { ...controlled, id:"controlled", fitness:96, morale:88, form:0, lastRating:null, ratingTotal:0, appearances:0, goals:0, assists:0, injured:0, injury:null, consecutiveStarts:0, lastMatchMinutes:0, lastMatchDate:null };
    }
    return squad.sort((a,b) => positionSortRank(a.position)-positionSortRank(b.position));
  }

  function ensurePlayerContract(player,season=2026) {
    const unit=stableScoutingUnit(`${player.id||player.name}|contract-v1`),wage=Math.max(4,Number(player.wage)||Math.round((player.overall||65)*1.5));
    player.contract||={weeklyWage:wage,signingBonus:Number(Math.max(.1,wage*.035).toFixed(1)),appearanceFee:Math.round(wage*.08),releaseClause:Number(Math.max(1,(player.value||2)*(1.65+unit*.7)).toFixed(1)),role:(player.overall||0)>=85?"核心主力":(player.overall||0)>=76?"常规主力":"轮换球员",endSeason:season+2+Math.floor(unit*3)};
    player.contract.weeklyWage??=wage;player.contract.signingBonus??=Number(Math.max(.1,wage*.035).toFixed(1));player.contract.appearanceFee??=Math.round(wage*.08);player.contract.releaseClause??=Number(Math.max(1,(player.value||2)*1.8).toFixed(1));player.contract.role||="轮换球员";player.contract.endSeason??=season+2;
    player.listed??=false;player.transferRequestStatus??="none";
    return player.contract;
  }

  function leagueHomeNation(club) {
    return ({ENG1:"英格兰",ENG2:"英格兰",ENG3:"英格兰",ESP1:"西班牙",ESP2:"西班牙",ESP3:"西班牙",GER1:"德国",GER2:"德国",GER3:"德国",ITA1:"意大利",ITA2:"意大利",ITA3:"意大利",FRA1:"法国",FRA2:"法国",FRA3:"法国"})[club?.league]||leagueOf(club)?.country||"英格兰";
  }

  function estimatedYouthDepartment(club) {
    const facilities=clamp(Math.round((Number(club?.prestige||70)-54)/10),1,5),recruitment=clamp(Math.round((Number(club?.prestige||70)-58)/9),1,5),unit=stableScoutingUnit(`youth-director|${club?.id||club?.name}`);
    return {facilities,recruitment,director:{name:`${FIRST[Math.floor(unit*FIRST.length)]} ${LAST[Math.floor(stableScoutingUnit(`${club?.id}|director-last`)*LAST.length)]}`,judgingAbility:clamp(Math.round(52+Number(club?.prestige||70)*.28+unit*16),50,94),judgingPotential:clamp(Math.round(55+Number(club?.prestige||70)*.3+stableScoutingUnit(`${club?.id}|director-pa`)*15),52,96),workingWithYoungsters:clamp(Math.round(54+Number(club?.prestige||70)*.24+stableScoutingUnit(`${club?.id}|director-youth`)*18),50,95)}};
  }

  function initialRegenTemplates() {
    return [
      {key:"retired-template-a",nationality:"阿根廷",position:"ST",potential:94,availableIntakeYear:2027},
      {key:"retired-template-b",nationality:"比利时",position:"CM",potential:91,availableIntakeYear:2027},
      {key:"retired-template-c",nationality:"克罗地亚",position:"CM",potential:89,availableIntakeYear:2027},
      {key:"retired-template-d",nationality:"波兰",position:"ST",potential:91,availableIntakeYear:2027},
      {key:"retired-template-e",nationality:"西班牙",position:"DM",potential:89,availableIntakeYear:2027},
      {key:"retired-template-f",nationality:"德国",position:"GK",potential:89,availableIntakeYear:2027}
    ];
  }

  function createYouthSystem(save) {
    const club=clubById(save.clubId),department=estimatedYouthDepartment(club);
    return {
      academy:{...department,lastIntakeYear:null,currentIntake:null,prospects:[],intakeHistory:[],promotions:[],upgrades:[]},
      world:{retiredTemplates:initialRegenTemplates(),usedTemplateKeys:[],retiredSourceTokens:[],prospects:[],lastGlobalIntakeYear:null}
    };
  }

  function ensureYouthSystem(save=state) {
    if(!save)return null;
    const base=createYouthSystem(save);save.youthAcademy=save.youthAcademy&&typeof save.youthAcademy==="object"?save.youthAcademy:base.academy;save.youthWorld=save.youthWorld&&typeof save.youthWorld==="object"?save.youthWorld:base.world;
    const academy=save.youthAcademy,world=save.youthWorld,department=estimatedYouthDepartment(clubById(save.clubId));
    academy.facilities=clamp(Math.round(Number(academy.facilities||department.facilities)),1,5);academy.recruitment=clamp(Math.round(Number(academy.recruitment||department.recruitment)),1,5);academy.director={...department.director,...(academy.director||{})};academy.prospects=Array.isArray(academy.prospects)?academy.prospects:[];academy.intakeHistory=Array.isArray(academy.intakeHistory)?academy.intakeHistory:[];academy.promotions=Array.isArray(academy.promotions)?academy.promotions:[];academy.upgrades=Array.isArray(academy.upgrades)?academy.upgrades:[];
    world.retiredTemplates=Array.isArray(world.retiredTemplates)?world.retiredTemplates:initialRegenTemplates();world.usedTemplateKeys=Array.isArray(world.usedTemplateKeys)?world.usedTemplateKeys:[];world.retiredSourceTokens=Array.isArray(world.retiredSourceTokens)?world.retiredSourceTokens:[];world.prospects=Array.isArray(world.prospects)?world.prospects:[];
    return {academy,world};
  }

  function youthDepartmentScore(department) {
    const director=department?.director||{};return clamp(Math.round(Number(department?.facilities||1)*11+Number(department?.recruitment||1)*9+Number(director.judgingPotential||60)*.22+Number(director.workingWithYoungsters||60)*.12),20,100);
  }

  function youthNationForClub(club,department,key) {
    const home=leagueHomeNation(club),network=Number(department?.recruitment||1),foreignChance=.08+(network-1)*.105,foreign=stableScoutingUnit(`${key}|foreign`)<foreignChance;
    if(!foreign)return home;
    const nations=Object.keys(YOUTH_NATION_FOUNDATION),target=stableScoutingUnit(`${key}|nation`),weighted=nations.map(nation=>({nation,weight:(YOUTH_NATION_FOUNDATION[nation]||72)*(nation===home?1.3:1)})),total=weighted.reduce((sum,item)=>sum+item.weight,0);let cursor=target*total;
    return weighted.find(item=>(cursor-=item.weight)<=0)?.nation||home;
  }

  function youthName(nationality,key) {
    const pools=YOUTH_NAMES[nationality]||[FIRST,LAST],first=pools[0][Math.floor(stableScoutingUnit(`${key}|first`)*pools[0].length)],last=pools[1][Math.floor(stableScoutingUnit(`${key}|last`)*pools[1].length)];return `${first} ${last}`;
  }

  function youthPosition(key) {
    const positions=["GK","RB","CB","LB","RWB","LWB","DM","CM","RM","LM","AM","RW","LW","ST","CF"],weights=[.09,.06,.15,.06,.035,.035,.09,.14,.045,.045,.07,.06,.06,.09,.055],unit=stableScoutingUnit(`${key}|position`);let cursor=unit;for(let i=0;i<positions.length;i++){cursor-=weights[i];if(cursor<=0)return positions[i];}return "CF";
  }

  function youthDetailedAttributes(position,overall,key) {
    const unit=positionUnit(position),variation=name=>Math.round((stableScoutingUnit(`${key}|${name}`)-.5)*8),value=(name,offset)=>clamp(Math.round(overall+offset+variation(name)),30,94);
    return {pace:value("pace",position==="GK"?-13:["RW","LW","RM","LM","RWB","LWB","RB","LB"].includes(position)?7:1),shooting:value("shooting",["ST","CF","RW","LW","AM"].includes(position)?7:unit==="midfield"?-1:-13),passing:value("passing",unit==="midfield"||["RWB","LWB","CF"].includes(position)?7:position==="GK"?-7:0),dribbling:value("dribbling",unit==="attack"||["RM","LM","RWB","LWB"].includes(position)?5:unit==="midfield"?3:-8),defending:value("defending",unit==="defence"?8:position==="DM"?7:position==="GK"?-5:-15),physical:value("physical",unit==="defence"?5:0),goalkeeping:value("goalkeeping",position==="GK"?10:-25)};
  }

  function createYouthProspect(save,club,intakeYear,index,options={}) {
    const department=club.id===save.clubId?ensureYouthSystem(save).academy:estimatedYouthDepartment(club),key=`youth|${intakeYear}|${club.id}|${index}|${options.template?.key||"new"}`,regen=Boolean(options.template),nationality=regen?options.template.nationality:youthNationForClub(club,department,key),position=regen?options.template.position:youthPosition(key),foundation=YOUTH_NATION_FOUNDATION[nationality]||74;
    const quality=clamp((department.facilities-1)/4*.34+(department.recruitment-1)/4*.28+(Number(department.director.judgingPotential||60)-50)/46*.23+(foundation-65)/31*.15,0,1),talent=Math.pow(stableScoutingUnit(`${key}|talent`),.95+(1-quality)*1.5),rare=stableScoutingUnit(`${key}|rare`)<.012+quality*.045?4:0;
    const potential=regen?clamp(Number(options.template.potential||88)+Math.floor(stableScoutingUnit(`${key}|regen-pa`)*7)-3,70,97):clamp(Math.round(60+quality*11+talent*25+rare),62,96),age=stableScoutingUnit(`${key}|age`)<.58?15:16,current=clamp(Math.round(42+department.facilities*2+Number(department.director.workingWithYoungsters||60)*.045+stableScoutingUnit(`${key}|ca`)*11),42,potential-8),details=youthDetailedAttributes(position,current,key);
    return {id:`academy-${intakeYear}-${club.id}-${index}-${Math.floor(stableScoutingUnit(key)*1e6).toString(36)}`,name:youthName(nationality,key),nationality,position,age,overall:current,potential,value:Number(Math.max(.08,(current-38)*(potential-55)*.003).toFixed(2)),wage:1,fitness:94,morale:78,form:0,lastRating:null,ratingTotal:0,appearances:0,goals:0,assists:0,injured:0,injury:null,status:"trial",intakeYear,clubId:club.id,originType:regen?"regen":"newgen",templateKey:regen?options.template.key:null,trainingProgress:0,mentorshipDays:0,mentorId:null,mentorName:null,dataStatus:"academy-generated-v1",ratingSource:"game-estimate-v1",...details};
  }

  function chooseRegenClub(save,template,intakeYear) {
    const candidates=CLUBS.map(club=>{const department=club.id===save.clubId?ensureYouthSystem(save).academy:estimatedYouthDepartment(club),home=leagueHomeNation(club)===template.nationality?1.55:1;return {club,weight:(18+youthDepartmentScore(department))*home};}),total=candidates.reduce((sum,item)=>sum+item.weight,0);let cursor=stableScoutingUnit(`${template.key}|${intakeYear}|club`)*total;return candidates.find(item=>(cursor-=item.weight)<=0)?.club||candidates[0].club;
  }

  function allocateAnnualRegens(save,intakeYear) {
    const {world}=ensureYouthSystem(save),allocated=[];
    world.retiredTemplates.filter(template=>!world.usedTemplateKeys.includes(template.key)&&Number(template.availableIntakeYear||0)<=intakeYear).forEach((template,index)=>{
      const club=chooseRegenClub(save,template,intakeYear),prospect=createYouthProspect(save,club,intakeYear,`regen-${index}`,{template});world.usedTemplateKeys.push(template.key);allocated.push(prospect);
      if(club.id!==save.clubId)world.prospects.unshift({...prospect,status:"academy",scoutedDate:`${intakeYear}-03-15`});
    });
    world.prospects=world.prospects.slice(0,120);return allocated;
  }

  function generateGlobalYouthClass(save,intakeYear) {
    const {world}=ensureYouthSystem(save);if(world.lastGlobalIntakeYear===intakeYear)return;world.lastGlobalIntakeYear=intakeYear;
    const clubs=seededShuffle(CLUBS,`global-youth|${intakeYear}`).slice(0,28),prospects=clubs.map((club,index)=>createYouthProspect(save,club,intakeYear,`global-${index}`)).filter(player=>player.potential>=82).sort((a,b)=>b.potential-a.potential).slice(0,12).map(player=>({...player,status:"academy",scoutedDate:`${intakeYear}-03-15`}));world.prospects.unshift(...prospects);world.prospects=world.prospects.filter((player,index,array)=>array.findIndex(item=>item.id===player.id)===index).slice(0,120);
  }

  function runYouthIntake(save,date) {
    if(!/^\d{4}-03-15$/.test(date))return null;const intakeYear=Number(date.slice(0,4)),{academy}=ensureYouthSystem(save);if(Number(academy.lastIntakeYear||0)===intakeYear)return null;
    academy.prospects=academy.prospects.filter(player=>player.status==="academy");const allocated=allocateAnnualRegens(save,intakeYear),target=10+Math.floor(stableScoutingUnit(`${save.clubId}|${intakeYear}|intake-size`)*3),ourRegens=allocated.filter(player=>player.clubId===save.clubId).slice(0,target),newgens=[];
    for(let index=0;ourRegens.length+newgens.length<target;index++)newgens.push(createYouthProspect(save,clubById(save.clubId),intakeYear,index));
    const intake=[...ourRegens,...newgens].sort((a,b)=>b.potential-a.potential||b.overall-a.overall);if(save.role==="player"){const openSlots=Math.max(0,20-academy.prospects.filter(player=>player.status==="academy").length),signCount=Math.min(openSlots,clamp(Math.round(3+academy.director.judgingPotential/25),4,7));intake.slice(0,signCount).forEach(player=>player.status="academy");}
    academy.prospects.push(...intake);academy.lastIntakeYear=intakeYear;academy.currentIntake={year:intakeYear,date,playerIds:intake.map(player=>player.id),count:intake.length,signed:save.role==="player"?intake.filter(player=>player.status==="academy").length:0};academy.intakeHistory.unshift({year:intakeYear,count:intake.length,bestPotential:Math.max(...intake.map(player=>player.potential)),signed:academy.currentIntake.signed});academy.intakeHistory=academy.intakeHistory.slice(0,12);generateGlobalYouthClass(save,intakeYear);
    addNotification({title:`青训选拔日：${intake.length} 名试训球员到队`,type:"youth",date,detail:save.role==="coach"?"青训总监已经提交本年度选拔名单。试训球员不会自动进入一线队，你可以签入学院、安排导师并在成熟后晋升。":"AI 教练组已经完成本年度青训选拔，并签下其中最受认可的年轻球员。",facts:[`青训设施：${academy.facilities} 级`,`招募网络：${academy.recruitment} 级`,`青训总监判断潜力：${academy.director.judgingPotential}`,`本届最高潜力区间：${scoutedPotentialRange(intake[0],academy)}`]});
    return {type:"youth",title:`青训选拔日：${intake.length} 名新秀接受评估`,view:"academy"};
  }

  function scoutedPotentialRange(player,academy=ensureYouthSystem(state)?.academy) {
    const uncertainty=clamp(Math.round(10-(Number(academy?.director?.judgingPotential||60)-50)/9),3,10),offset=Math.round((stableScoutingUnit(`${player.id}|scout`)-.5)*uncertainty),center=clamp(Number(player.potential||70)+offset,50,97);return `${clamp(center-uncertainty,45,97)}–${clamp(center+uncertainty,50,99)}`;
  }

  function advanceYouthDevelopment(save) {
    const {academy}=ensureYouthSystem(save);academy.prospects.filter(player=>player.status==="academy").forEach(player=>{
      const mentor=player.mentorId?save.squad.find(item=>item.id===player.mentorId):null;if(player.mentorId&&!mentor){player.mentorId=null;player.mentorName=null;}
      const daily=.0014+academy.facilities*.00055+Number(academy.director.workingWithYoungsters||60)*.000018+(mentor?.0014:0);player.trainingProgress=Number(player.trainingProgress||0)+daily;if(mentor)player.mentorshipDays=Number(player.mentorshipDays||0)+1;
      const growth=Math.min(Math.floor(player.trainingProgress),Math.max(0,Number(player.potential||player.overall)-Number(player.overall||0)));if(growth>0){const before=playerAttributeSnapshot(player);player.overall+=growth;player.trainingProgress-=growth;Object.assign(player,youthDetailedAttributes(player.position,player.overall,`${player.id}|growth-${player.overall}`));recordAttributeDevelopment(player,before,{season:save.season,reason:"青训成长",overallChange:growth,accumulate:true});}
    });
  }

  function addRetirementTemplate(save,player,endingSeason) {
    if(Number(player.overall||0)<82)return;const {world}=ensureYouthSystem(save),sourceToken=Math.floor(stableScoutingUnit(`${comparableClubName(player.name)}|retired-source`)*1e12).toString(36),key=`retired-${sourceToken}-${endingSeason}`;if(world.retiredSourceTokens.includes(sourceToken)||world.retiredTemplates.some(item=>item.key===key)||world.usedTemplateKeys.includes(key))return;
    world.retiredSourceTokens.push(sourceToken);world.retiredTemplates.push({key,nationality:String(player.nationality||leagueHomeNation(clubById(save.clubId))).split("/")[0],position:player.position||"CM",potential:clamp(Math.max(Number(player.potential||0),Number(player.overall||0)),82,96),availableIntakeYear:endingSeason+2});
  }

  function collectSeasonRetirements(save,endingSeason) {
    ensureYouthSystem(save);const retired=[];save.squad.forEach(player=>{if(player.id===save.controlledId)return;const threshold=player.position==="GK"?38:35,age=Number(player.age||24),chance=age<threshold?0:clamp(.16+(age-threshold)*.19,0,1),willRetire=age>=threshold&&stableScoutingUnit(`${player.id}|retire|${endingSeason}`)<chance;if(willRetire){retired.push(player);addRetirementTemplate(save,player,endingSeason);}});
    const world=ensureYouthSystem(save).world;REAL_PLAYERS.filter(player=>Number(player.overall||0)>=84).map(player=>({...player,simulatedAge:Number(player.age||24)+Math.max(0,endingSeason-2026)})).filter(player=>{const threshold=player.position==="GK"?38:35,chance=player.simulatedAge<threshold?0:clamp(.12+(player.simulatedAge-threshold)*.17,0,.9),sourceToken=Math.floor(stableScoutingUnit(`${comparableClubName(player.name)}|retired-source`)*1e12).toString(36);return !world.retiredSourceTokens.includes(sourceToken)&&stableScoutingUnit(`${player.id}|world-retire|${endingSeason}`)<chance;}).sort((a,b)=>b.overall-a.overall).slice(0,10).forEach(player=>addRetirementTemplate(save,player,endingSeason));
    return retired;
  }

  function rolloverYouthSeason(save) {
    const youthSystem=ensureYouthSystem(save),academy=youthSystem.academy;
    academy.prospects=academy.prospects.filter(player=>player.status==="academy");
    academy.prospects.forEach(player=>{dynamicPotentialAssessment(player,save,{academy:true,facilities:academy.facilities,mentorDays:player.mentorshipDays});player.age++;});
    academy.prospects=academy.prospects.filter(player=>player.age<=19);
    academy.currentIntake=null;
    youthSystem.world.prospects.forEach(player=>{
      player.age++;
      const club=clubById(player.clubId),department=estimatedYouthDepartment(club),growth=Math.min(Math.max(0,player.potential-player.overall),1+(department.facilities>=4?1:0));
      player.overall+=growth;
    });
    youthSystem.world.prospects=youthSystem.world.prospects.filter(player=>player.age<=19).slice(0,120);
    if(save.role!=="player")return [];
    const promoted=[];
    academy.prospects.filter(player=>player.age>=17&&(player.potential>=80||player.overall>=64)).sort((a,b)=>b.overall+b.potential*.2-(a.overall+a.potential*.2)).slice(0,Math.max(0,Math.min(2,29-save.squad.length))).forEach(player=>promoted.push(graduateYouthPlayer(save,academy,player,save.date)));
    return promoted;
  }

  function seededShuffle(items,key) {
    return [...items].map((item,index)=>({item,order:stableScoutingUnit(`${key}|${String(item)}|${index}`)})).sort((a,b)=>a.order-b.order).map(entry=>entry.item);
  }

  function leagueRoundDates(leagueId,season,count) {
    const start=`${season}-08-08`,targetMonthDay=({ENG1:"05-23",ENG2:"05-08",ESP1:"05-23",ESP2:"05-29",GER1:"05-22",GER2:"05-08",ITA1:"05-23",ITA2:"05-15",FRA1:"05-22",FRA2:"05-08"})[leagueId]||"05-22";
    const target=`${season+1}-${targetMonthDay}`,gaps=Array.from({length:Math.max(0,count-1)},()=>7),reserved=new Set();
    const setLongGap=(index,value)=>{if(index>=0&&index<gaps.length){gaps[index]=Math.max(gaps[index],value);reserved.add(index);}};
    [3,7,11,Math.max(15,count-11)].forEach(index=>setLongGap(index,14));
    if(["GER1","GER2"].includes(leagueId))setLongGap(Math.min(15,gaps.length-1),28);
    else if(["ESP1","ESP2","ITA1","ITA2","FRA1","FRA2"].includes(leagueId))setLongGap(Math.min(16,gaps.length-1),14);
    const midweekCount=({ENG1:6,ENG2:12,ESP1:6,ESP2:8,GER1:4,GER2:6,ITA1:6,ITA2:6,FRA1:4,FRA2:5})[leagueId]||4,midweekGaps=new Set();
    for(let slot=1;slot<=midweekCount;slot++){
      const ideal=Math.round(slot*(gaps.length-2)/(midweekCount+1));let chosen=-1;
      for(let distance=0;distance<gaps.length&&chosen<0;distance++){
        for(const candidate of [ideal+distance,ideal-distance]){
          if(candidate<0||candidate+1>=gaps.length||reserved.has(candidate)||reserved.has(candidate+1)||midweekGaps.has(candidate-1)||midweekGaps.has(candidate)||midweekGaps.has(candidate+1))continue;
          chosen=candidate;break;
        }
      }
      if(chosen>=0){gaps[chosen]=3;gaps[chosen+1]=4;midweekGaps.add(chosen);midweekGaps.add(chosen+1);}
    }
    const totalDays=()=>gaps.reduce((sum,value)=>sum+value,0);let remaining=daysBetween(addDays(start,totalDays()),target);
    const pauseCandidates=seededShuffle(gaps.map((_,index)=>index).filter(index=>!reserved.has(index)&&!midweekGaps.has(index)),`league-pauses|${leagueId}|${season}`);
    let cursor=0;while(remaining>=7&&pauseCandidates.length){gaps[pauseCandidates[cursor%pauseCandidates.length]]+=7;remaining-=7;cursor++;}
    if(remaining!==0&&gaps.length)gaps[gaps.length-1]+=remaining;
    const dates=[start];for(const gap of gaps)dates.push(addDays(dates.at(-1),gap));
    return dates;
  }

  function leagueHomePattern(opponents,key) {
    const pattern=[];let previous=null,run=0,homes=0;
    opponents.forEach((opponent,index)=>{
      let home=stableScoutingUnit(`${key}|${opponent}|${index}`)>=.5;
      if(home===previous&&run>=2)home=!home;
      const remaining=opponents.length-index;if(home&&homes>=Math.ceil(opponents.length/2))home=false;
      if(!home&&remaining<=Math.ceil(opponents.length/2)-homes)home=true;
      run=home===previous?run+1:1;previous=home;if(home)homes++;pattern.push(home);
    });
    return pattern;
  }

  function qualifiedEuropeanCompetition(club,season) {
    if(leagueOf(club).tier!==1)return null;
    const rank={ucl:1,uel:2,uecl:3},honors=state?.honors||[];
    let titleQualification=null;
    if(honors.some(item=>item.season===season-1&&[`${EUROPEAN_COMPETITIONS.ucl.fullName}冠军`,`${EUROPEAN_COMPETITIONS.uel.fullName}冠军`].includes(item.name)))titleQualification=EUROPEAN_COMPETITIONS.ucl;
    else if(honors.some(item=>item.season===season-1&&item.name===`${EUROPEAN_COMPETITIONS.uecl.fullName}冠军`))titleQualification=EUROPEAN_COMPETITIONS.uel;
    let domesticQualification=null;
    if(!state||season===2026){
      const leagueRank=[...CLUBS].filter(item=>item.league===club.league&&leagueOf(item)?.tier===1).sort((a,b)=>b.prestige-a.prestige||a.name.localeCompare(b.name,"zh-CN")).findIndex(item=>item.id===club.id)+1;
      const uclPlaces=club.league==="FRA1"?3:4;
      if(leagueRank>0&&leagueRank<=uclPlaces)domesticQualification=EUROPEAN_COMPETITIONS.ucl;
      else if(leagueRank>0&&leagueRank<=uclPlaces+2)domesticQualification=EUROPEAN_COMPETITIONS.uel;
      else if(leagueRank===uclPlaces+3)domesticQualification=EUROPEAN_COMPETITIONS.uecl;
      return [domesticQualification,titleQualification].filter(Boolean).sort((a,b)=>rank[a.key]-rank[b.key])[0]||null;
    }
    const previous=(state.history||[]).find(item=>item.season===season-1);if(!previous||previous.leagueId&&previous.leagueId!==club.league)return titleQualification;
    const uclPlaces=club.league==="FRA1"?3:4;
    if(previous.position<=uclPlaces)domesticQualification=EUROPEAN_COMPETITIONS.ucl;
    else if(previous.position<=uclPlaces+2)domesticQualification=EUROPEAN_COMPETITIONS.uel;
    else if(previous.position===uclPlaces+3)domesticQualification=EUROPEAN_COMPETITIONS.uecl;
    return [domesticQualification,titleQualification].filter(Boolean).sort((a,b)=>rank[a.key]-rank[b.key])[0]||null;
  }

  function qualifiedForChampionsLeague(club,season) { return qualifiedEuropeanCompetition(club,season)?.key==="ucl"; }

  function europeanCompetitionPool(club) {
    const externalAssociations={Benfica:"POR",Ajax:"NED",Celtic:"SCO",PSV:"NED","Sporting CP":"POR",Galatasaray:"TUR","Club Brugge":"BEL",Olympiacos:"GRE"},externalStrength={Benfica:86,Ajax:83,Celtic:79,PSV:85,"Sporting CP":85,Galatasaray:82,"Club Brugge":78,Olympiacos:77},entries=new Map();
    CLUBS.filter(item=>leagueOf(item)?.tier===1&&item.id!==club.id&&item.league!==club.league).forEach(item=>entries.set(`club:${item.id}`,{name:item.name,association:item.league,prestige:item.prestige}));
    EUROPEAN_OPPONENTS.forEach(name=>{
      const imported=CLUBS.find(item=>comparableClubName(item.name)===comparableClubName(name)||comparableClubName(item.englishName||"")===comparableClubName(name));
      if(imported){if(imported.id!==club.id&&imported.league!==club.league)entries.set(`club:${imported.id}`,{name:imported.name,association:imported.league,prestige:imported.prestige});return;}
      entries.set(`external:${comparableClubName(name)}`,{name,association:externalAssociations[name]||name,prestige:externalStrength[name]||80});
    });
    return [...entries.values()];
  }

  function europeanCompetitionField(club,season,config) {
    const pool=europeanCompetitionPool(club).map(item=>({...item,fit:Math.abs(item.prestige-config.fieldTarget),qualifyingScore:item.prestige+stableScoutingUnit(`${config.key}-field|${season}|${item.name}`)*config.fieldSpread}));
    if(config.key==="ucl")return pool.sort((a,b)=>b.qualifyingScore-a.qualifyingScore||b.prestige-a.prestige).slice(0,35);
    return pool.sort((a,b)=>a.fit-b.fit||b.qualifyingScore-a.qualifyingScore).slice(0,35).sort((a,b)=>b.prestige-a.prestige);
  }

  function championsLeagueField(club,season) { return europeanCompetitionField(club,season,EUROPEAN_COMPETITIONS.ucl); }

  function drawEuropeanLeagueOpponents(club,season,config=EUROPEAN_COMPETITIONS.ucl) {
    const pool=europeanCompetitionField(club,season,config).sort((a,b)=>b.prestige-a.prestige||a.name.localeCompare(b.name)),potSize=Math.ceil(pool.length/config.pots),selected=[],associationCounts=new Map();
    for(let pot=0;pot<config.pots;pot++){
      const candidates=seededShuffle(pool.slice(pot*potSize,(pot+1)*potSize).map(item=>item.name),`${config.key}-pot-${pot}|${season}|${club.id}`).map(name=>pool.find(item=>item.name===name)).filter(Boolean);
      for(const candidate of candidates){
        if(selected.filter(item=>item.pot===pot).length>=config.perPot)break;
        if((associationCounts.get(candidate.association)||0)>=2)continue;
        selected.push({...candidate,pot});associationCounts.set(candidate.association,(associationCounts.get(candidate.association)||0)+1);
      }
      for(const candidate of candidates){
        if(selected.filter(item=>item.pot===pot).length>=config.perPot)break;
        if(selected.some(item=>item.name===candidate.name))continue;
        selected.push({...candidate,pot});associationCounts.set(candidate.association,(associationCounts.get(candidate.association)||0)+1);
      }
    }
    return seededShuffle(selected,`${config.key}-order|${season}|${club.id}`).map(item=>item.name).slice(0,config.matches);
  }

  function primaryNationality(player) { return String(player?.nationality||"").split("/")[0].trim(); }
  function nationalConfederation(nation) {
    if(EUROPEAN_NATIONS.has(nation))return "europe";if(SOUTH_AMERICAN_NATIONS.has(nation))return "southAmerica";if(AFRICAN_NATIONS.has(nation))return "africa";if(ASIAN_NATIONS.has(nation))return "asia";return "other";
  }
  function nationalCompetitionFor(nation,season) {
    const confederation=nationalConfederation(nation),summer=season+1;
    if(season===2026&&confederation!=="europe")return "国际A级赛";
    if(summer%4===2)return "世界杯";
    if(confederation==="europe"&&summer%4===0)return "欧洲杯";
    if(confederation==="southAmerica"&&summer%4===0)return "美洲杯";
    if(confederation==="africa"&&summer%2===1)return "非洲杯";
    if(confederation==="asia"&&summer%4===3)return "亚洲杯";
    if(confederation==="other"&&summer%2===1)return "洲际国家杯";
    if(confederation==="europe"&&season%2===0)return "欧国联";
    return "世界杯预选赛";
  }
  function eligibleForNationalTeam(player,nation) {
    if(!player||!nation)return false;const strength=NATIONAL_TEAM_STRENGTH[nation]||74,threshold=clamp(strength-10,66,83);
    return Number(player.overall||0)>=threshold&&Number(player.age||25)<=38;
  }
  function generateInternationalSchedule(player,season) {
    const nation=primaryNationality(player);if(!eligibleForNationalTeam(player,nation))return [];
    const competition=nationalCompetitionFor(nation,season),confederation=nationalConfederation(nation),pool=(NATIONAL_OPPONENTS[confederation]||NATIONAL_OPPONENTS.other).filter(item=>item!==nation),tournament=["世界杯","欧洲杯","美洲杯","非洲杯","亚洲杯","洲际国家杯"].includes(competition);
    const count=tournament?3:competition==="欧国联"?6:competition==="国际A级赛"?4:8,offsets=tournament?[313,319,325]:competition==="国际A级赛"?[39,67,95,228]:[35,39,63,67,91,95,224,228],opponents=seededShuffle(pool,`national|${competition}|${nation}|${season}`).slice(0,count),homes=leagueHomePattern(opponents,`national-home|${nation}|${season}`);
    return opponents.map((opponent,index)=>({id:`nat-${season}-${index}`,date:addDays(`${season}-08-01`,offsets[index]),competition,round:tournament?`小组赛第 ${index+1} 轮`:competition==="国际A级赛"?`国际比赛日第 ${index+1} 场`:`${competition==="欧国联"?"联赛阶段":"预选赛"}第 ${index+1} 轮`,stageIndex:index,phase:tournament?"group":"league",knockout:false,international:true,teamName:nation,opponent,opponentStrength:NATIONAL_TEAM_STRENGTH[opponent]||74,home:tournament?index%2===0:homes[index],neutral:tournament,status:"upcoming",score:null}));
  }

  function cupRoundTargetDate(competition,stage,season) {
    const calendars={"足总杯":[154,182,210,245,281],"联赛杯":[18,46,81,130,204],"国王杯":[80,158,186,242,288],"德国杯":[74,123,193,249,287],"意大利杯":[109,158,200,249,287],"法国杯":[151,179,207,242,280]},offsets=calendars[competition]||[28,56,91,133,189],base=offsets[Math.min(stage,offsets.length-1)]??(28+stage*28),jitter=Math.round(stableScoutingUnit(`cup-date|${competition}|${season}|${stage}`)*2)-1;
    return addDays(`${season}-08-08`,base+jitter);
  }

  function fixtureCalendarPriority(fixture,leagueShort) {
    if(fixture.international)return 4;
    if(EUROPEAN_COMPETITION_BY_NAME[fixture.competition])return 3;
    if(fixture.knockout)return 2;
    return fixture.competition===leagueShort?1:0;
  }

  function resolveFixtureSpacing(fixtures,leagueShort) {
    const protectedFixtures=fixtures.filter(fixture=>fixture.competition!==leagueShort);
    for(let attempt=0;attempt<30;attempt++){
      protectedFixtures.sort((a,b)=>a.date.localeCompare(b.date)||fixtureCalendarPriority(b,leagueShort)-fixtureCalendarPriority(a,leagueShort));let changed=false;
      for(let index=1;index<protectedFixtures.length;index++){
        const previous=protectedFixtures[index-1],current=protectedFixtures[index];if(daysBetween(previous.date,current.date)>=3)continue;
        if(fixtureCalendarPriority(previous,leagueShort)<fixtureCalendarPriority(current,leagueShort))previous.date=addDays(current.date,-3);
        else current.date=addDays(previous.date,3);
        changed=true;break;
      }
      if(!changed)break;
    }
    const occupied=[...protectedFixtures],leagueFixtures=fixtures.filter(fixture=>fixture.competition===leagueShort).sort((a,b)=>Number(a.stageIndex??a.id.split("-").at(-1))-Number(b.stageIndex??b.id.split("-").at(-1)));let previousLeagueDate=null;
    leagueFixtures.forEach(fixture=>{
      const original=fixture.date,candidates=[];for(let distance=0;distance<=14;distance++){candidates.push(addDays(original,-distance));if(distance)candidates.push(addDays(original,distance));}
      let chosen=candidates.find(date=>(!previousLeagueDate||daysBetween(previousLeagueDate,date)>=3)&&occupied.every(item=>Math.abs(daysBetween(item.date,date))>=3));
      if(!chosen){chosen=previousLeagueDate?addDays(previousLeagueDate,3):original;while(occupied.some(item=>Math.abs(daysBetween(item.date,chosen))<3))chosen=addDays(chosen,1);}
      fixture.date=chosen;previousLeagueDate=chosen;occupied.push(fixture);
    });
    fixtures.sort((a,b)=>a.date.localeCompare(b.date));
  }

  function generateSchedule(club, season = 2026, careerPlayer=null) {
    const league = leagueOf(club);
    const opponents = leagueClubNames(club.league).filter(n => comparableClubName(n)!==comparableClubName(club.name));
    const firstLeg=seededShuffle(opponents,`league-first|${season}|${club.id}`),homePattern=leagueHomePattern(firstLeg,`league-home|${season}|${club.id}`),homeByOpponent=new Map(firstLeg.map((name,index)=>[name,homePattern[index]]));
    const secondLeg=seededShuffle(firstLeg,`league-second|${season}|${club.id}`),ordered=[...firstLeg,...secondLeg],dates=leagueRoundDates(club.league,season,league.matches);
    const fixtures = [],start = `${season}-08-08`;
    for (let i=0; i<league.matches; i++) {
      const opponent=ordered[i%Math.max(1,ordered.length)]||"联赛对手",secondHalf=i>=firstLeg.length,firstHome=homeByOpponent.get(opponent)??true;
      fixtures.push({ id:`l-${season}-${i}`, date:dates[i]||addDays(start,i*7), competition:league.short, round:`第 ${i+1} 轮`, opponent, home:secondHalf?!firstHome:firstHome, status:"upcoming", score:null });
    }
    fixtures.push({ id:`c-${season}-0`, date:cupRoundTargetDate(league.cup,0,season), competition:league.cup, round:CUP_ROUNDS[league.cup][0], stageIndex:0, phase:"knockout", knockout:true, opponent:drawDomesticOpponent(club,[]), home:Math.random()<.58, status:"upcoming", score:null });
    if (league.extraCup) fixtures.push({ id:`e-${season}-0`, date:cupRoundTargetDate(league.extraCup,0,season), competition:league.extraCup, round:CUP_ROUNDS[league.extraCup][0], stageIndex:0, phase:"knockout", knockout:true, opponent:drawDomesticOpponent(club,[]), home:Math.random()<.5, status:"upcoming", score:null });
    const european=qualifiedEuropeanCompetition(club,season);
    if (european) {
      const opponents=drawEuropeanLeagueOpponents(club,season,european),homes=leagueHomePattern(opponents,`${european.key}-home|${season}|${club.id}`);
      european.offsets.forEach((offset,i) => fixtures.push({ id:`${european.key}-${season}-${i}`, date:addDays(start,offset), competition:european.name, competitionKey:european.key, round:`联赛阶段第 ${i+1} 轮`, stageIndex:i, phase:"league", knockout:false, opponent:opponents[i]||`${european.name}联赛阶段对手`, home:homes[i], status:"upcoming", score:null }));
    }
    const internationalPlayer=careerPlayer||(state?.role==="player"?controlledPlayer():null);
    if(internationalPlayer)fixtures.push(...generateInternationalSchedule(internationalPlayer,season));
    resolveFixtureSpacing(fixtures,league.short);
    return fixtures;
  }

  function repairCompetitionCalendar(save) {
    const club=clubById(save.clubId),league=leagueOf(club),season=Number(save.season)||2026,leagueDates=leagueRoundDates(club.league,season,league.matches),seasonStart=`${season}-08-08`;
    (save.schedule||[]).filter(fixture=>fixture.competition===league.short).forEach(fixture=>{
      if(fixture.status!=="upcoming")return;const roundIndex=Math.max(0,Number(fixture.id?.split("-").at(-1)??String(fixture.round).match(/\d+/)?.[0]??1)-(fixture.id?.startsWith("l-")?0:1));fixture.date=leagueDates[Math.min(roundIndex,leagueDates.length-1)]||fixture.date;
    });
    (save.schedule||[]).filter(fixture=>fixture.status==="upcoming"&&[league.cup,league.extraCup].includes(fixture.competition)).forEach(fixture=>{fixture.date=cupRoundTargetDate(fixture.competition,Number(fixture.stageIndex)||0,season);});
    Object.values(EUROPEAN_COMPETITIONS).forEach(config=>{
      const leaguePhase=(save.schedule||[]).filter(fixture=>fixture.competition===config.name&&fixture.phase==="league").sort((a,b)=>(a.stageIndex||0)-(b.stageIndex||0));
      leaguePhase.forEach((fixture,index)=>{fixture.competitionKey||=config.key;if(fixture.status==="upcoming")fixture.date=addDays(seasonStart,config.offsets[fixture.stageIndex??index]??config.offsets[index]??config.offsets.at(-1));});
      const pool=europeanCompetitionPool(club),associationOf=name=>pool.find(item=>item.name===name)?.association||name,used=new Set(),associationCounts=new Map();
      leaguePhase.filter(fixture=>fixture.status==="played").forEach(fixture=>{used.add(comparableClubName(fixture.opponent));const association=associationOf(fixture.opponent);associationCounts.set(association,(associationCounts.get(association)||0)+1);});
      const candidates=drawEuropeanLeagueOpponents(club,season,config).filter(name=>!used.has(comparableClubName(name)));
      leaguePhase.filter(fixture=>fixture.status==="upcoming").forEach(fixture=>{
        const index=candidates.findIndex(name=>!used.has(comparableClubName(name))&&(associationCounts.get(associationOf(name))||0)<2),fallback=candidates.findIndex(name=>!used.has(comparableClubName(name))),chosen=candidates[index>=0?index:fallback];if(!chosen)return;
        fixture.opponent=chosen;used.add(comparableClubName(chosen));const association=associationOf(chosen);associationCounts.set(association,(associationCounts.get(association)||0)+1);
      });
    });
    resolveFixtureSpacing((save.schedule||[]).filter(fixture=>fixture.status==="upcoming"),league.short);
    enforceCalendarIntegrity(save,league.short);
    save.schedule?.sort((a,b)=>a.date.localeCompare(b.date));
  }

  function enforceCalendarIntegrity(save,leagueShort) {
    const played=(save.schedule||[]).filter(item=>item.status==="played").sort((a,b)=>a.date.localeCompare(b.date)),upcoming=(save.schedule||[]).filter(item=>item.status==="upcoming"),locked=played.map(item=>item.date),current=save.date||START_DATE;
    const priority=fixture=>fixture.international?4:EUROPEAN_COMPETITION_BY_NAME[fixture.competition]?3:fixture.knockout?2:fixture.competition===leagueShort?1:0;
    upcoming.sort((a,b)=>priority(b)-priority(a)||a.date.localeCompare(b.date)).forEach(fixture=>{
      let date=fixture.date<current?current:fixture.date,guard=0;while(locked.some(value=>Math.abs(daysBetween(value,date))<3)&&guard++<40)date=addDays(date,1);fixture.date=date;locked.push(date);
    });
  }

  function drawDomesticOpponent(club, excluded) {
    const pool=leagueClubNames(club.league).filter(name=>comparableClubName(name)!==comparableClubName(club.name)&&!excluded.includes(name));
    return pool[Math.floor(rand(0,pool.length))]||"待定对手";
  }

  function findAvailableFixtureDate(preferred) {
    let date=preferred;
    for (let attempts=0; attempts<30; attempts++) {
      const conflict=state.schedule.some(f=>Math.abs(daysBetween(f.date,date))<3);
      if (!conflict) return date;
      date=addDays(date,1);
    }
    return date;
  }

  function poisson(lambda) {
    const limit=Math.exp(-lambda);let product=1,count=0;
    do {count++;product*=Math.random();} while(product>limit && count<12);
    return count-1;
  }

  function loadModPacks() {
    try {const parsed=JSON.parse(localStorage.getItem(MOD_KEY)||"[]");return Array.isArray(parsed)?parsed:[];} catch {return [];}
  }

  function backgroundLeagueCatalog() {
    const builtIn=BACKGROUND_LEAGUES.map(league=>({...league,source:"background-generated"}));
    const imported=loadModPacks().flatMap(pack=>(pack.leagues||[]).filter(league=>league.simulation==="background").map(league=>({
      id:league.id,name:league.name,country:league.country||"社区数据",tier:Number(league.tier)||3,source:`mod:${pack.packId}`,
      clubs:(pack.clubs||[]).filter(club=>club.leagueId===league.id).map(club=>[club.name,clamp(Number(club.prestige)||68,40,99),clamp(Number(club.averageAbility)||65,35,99)])
    }))).filter(league=>league.clubs.length>=4);
    return [...builtIn,...imported].filter((league,index,all)=>all.findIndex(item=>item.id===league.id)===index);
  }

  function createBackgroundWorld(season=2026) {
    const leagues={};
    backgroundLeagueCatalog().forEach(league=>{
      const clubs=league.clubs.map((club,index)=>({id:`${league.id}-${index+1}`,name:club[0],reputation:club[1],ability:club[2],p:0,w:0,d:0,l:0,gf:0,ga:0,gd:0,pts:0}));
      leagues[league.id]={id:league.id,name:league.name,country:league.country,tier:league.tier,source:league.source,round:0,clubs,results:[],scorers:[]};
    });
    return {season,currentDate:`${season}-08-01`,nextRoundDate:`${season}-08-08`,leagues};
  }

  function simulateBackgroundMatch(home,away) {
    const gap=Number(home.ability||65)-Number(away.ability||65),homeGoals=poisson(clamp(1.36*Math.exp(gap/22)+.16,.18,5.4)),awayGoals=poisson(clamp(1.08*Math.exp(-gap/22),.12,4.8));
    home.p++;away.p++;home.gf+=homeGoals;home.ga+=awayGoals;away.gf+=awayGoals;away.ga+=homeGoals;
    if(homeGoals>awayGoals){home.w++;away.l++;home.pts+=3;}else if(homeGoals<awayGoals){away.w++;home.l++;away.pts+=3;}else{home.d++;away.d++;home.pts++;away.pts++;}
    home.gd=home.gf-home.ga;away.gd=away.gf-away.ga;
    return {home:home.name,away:away.name,homeGoals,awayGoals};
  }

  function simulateBackgroundRound(league,date) {
    const clubs=league.clubs,rotation=league.round%Math.max(1,clubs.length-1),matches=[];
    for(let i=0;i<Math.floor(clubs.length/2);i++){
      const home=clubs[(i+rotation)%clubs.length],away=clubs[(clubs.length-1-i+rotation)%clubs.length];
      if(home===away)continue;
      const result=simulateBackgroundMatch(home,away);matches.push(result);
      const goals=result.homeGoals+result.awayGoals;
      for(let g=0;g<goals;g++){
        const scoringClub=g<result.homeGoals?home:away;
        const scorerName=`${FIRST[Math.floor(rand(0,FIRST.length))]} ${LAST[Math.floor(rand(0,LAST.length))]}`;
        const scorer=league.scorers.find(item=>item.name===scorerName&&item.club===scoringClub.name);
        if(scorer)scorer.goals++;else league.scorers.push({name:scorerName,club:scoringClub.name,goals:1,generated:true});
      }
    }
    league.round++;league.results.unshift({date,round:league.round,matches});league.results=league.results.slice(0,8);
    league.scorers.sort((a,b)=>b.goals-a.goals||a.name.localeCompare(b.name));league.scorers=league.scorers.slice(0,20);
  }

  function simulateBackgroundWorld(targetDate) {
    if(!state.backgroundWorld)state.backgroundWorld=createBackgroundWorld(state.season);
    const world=state.backgroundWorld;
    while(world.nextRoundDate<=targetDate){Object.values(world.leagues).forEach(league=>simulateBackgroundRound(league,world.nextRoundDate));world.nextRoundDate=addDays(world.nextRoundDate,7);}
    if(world.currentDate<targetDate)world.currentDate=targetDate;
  }

  function standings(league) {
    return [...league.clubs].sort((a,b)=>b.pts-a.pts||b.gd-a.gd||b.gf-a.gf||a.name.localeCompare(b.name));
  }

  const MAJOR_LEAGUE_IDS=["ENG1","ESP1","GER1","ITA1","FRA1"];

  function createMajorLeagueWorld(season=2026,userClubId) {
    const leagueIds=Object.keys(LEAGUES),leagues={};
    leagueIds.forEach(leagueId=>{
      const clubs=CLUBS.filter(club=>club.league===leagueId).map(club=>({
        id:club.id,name:club.name,code:club.code,sourceId:club.id,prestige:club.prestige,ability:club.prestige,
        p:0,w:0,d:0,l:0,gf:0,ga:0,gd:0,pts:0,form:[]
      }));
      leagues[leagueId]={id:leagueId,name:LEAGUES[leagueId].name,short:LEAGUES[leagueId].short,country:LEAGUES[leagueId].country,tier:LEAGUES[leagueId].tier,round:0,roundDates:leagueRoundDates(leagueId,season,LEAGUES[leagueId].matches),clubs,results:[],scorers:[],totalGoals:0,processedFixtureIds:[]};
    });
    return {season,currentDate:`${season}-08-01`,nextRoundDate:`${season}-08-08`,leagues};
  }

  function majorStandings(league) {
    return [...league.clubs].sort((a,b)=>b.pts-a.pts||b.gd-a.gd||b.gf-a.gf||a.name.localeCompare(b.name,"zh-CN"));
  }

  function pairLeagueClubs(clubs,round) {
    if(clubs.length<2)return [];
    const ordered=[...clubs].sort((a,b)=>a.id.localeCompare(b.id)),fixed=ordered[0],rest=ordered.slice(1),rotation=round%Math.max(1,rest.length);
    const rotated=[fixed,...rest.slice(rotation),...rest.slice(0,rotation)],pairs=[];
    for(let index=0;index<Math.floor(rotated.length/2);index++){
      const first=rotated[index],second=rotated[rotated.length-1-index];
      if(first&&second&&first!==second)pairs.push((round+index)%2?[second,first]:[first,second]);
    }
    return pairs;
  }

  function pickLeagueScorer(club,save=state) {
    const players=save?aiClubPlayers(save,club.id):[],preferred=players.filter(player=>["ST","CF","RW","LW"].includes(player.position)),secondary=players.filter(player=>["AM","CM","RM","LM"].includes(player.position)),pool=preferred.length?preferred:secondary.length?secondary:players;
    if(pool.length){const player=weightedPick(pool,item=>Math.max(1,Number(item.shooting||item.overall||65)-45)*(["ST","CF"].includes(item.position)?1.3:1));return {name:player.name,playerId:worldPlayerKey(save,player,club.id),generated:false};}
    return {name:`${FIRST[Math.floor(rand(0,FIRST.length))]} ${LAST[Math.floor(rand(0,LAST.length))]}`,generated:true};
  }

  function addMajorScorer(league,club,scorerInfo) {
    const existing=league.scorers.find(item=>item.name===scorerInfo.name&&item.club===club.name);
    if(existing)existing.goals++;else league.scorers.push({name:scorerInfo.name,club:club.name,clubId:club.id,goals:1,generated:Boolean(scorerInfo.generated)});
  }

  function simulateWorldTeamMatch(save,club,opponent,goals,goalsAgainst,date,scorerHints=[],fixtureId=null) {
    if(!save||club.id===save.clubId)return scorerHints;const world=ensureWorldPlayerStats(save),matchKey=`${save.season}|${date}|${fixtureId||`${club.id}-${opponent.id}`}|${club.id}`;if(world.processedMatches[matchKey])return scorerHints;world.processedMatches[matchKey]=true;
    const roster=aiClubPlayers(save,club.id).filter(player=>!player.injured);if(!roster.length)return scorerHints;const profile=aiCoachProfile(save,club.id,clubById(club.id).coach||club.id),ranked=[...roster].sort((a,b)=>(aiLineupScore(b,profile,false)+(stableScoutingUnit(`${matchKey}|${b.id}`)-.5)*4)-(aiLineupScore(a,profile,false)+(stableScoutingUnit(`${matchKey}|${a.id}`)-.5)*4)),selection=chooseFormationPlayers(ranked,null,profile.name,{profile}),starters=selection.players.length===11?selection.players:ranked.slice(0,11),bench=ranked.filter(player=>!starters.includes(player)).slice(0,5),subMinutes=bench.map((player,index)=>58+Math.floor(stableScoutingUnit(`${matchKey}|sub|${player.id}`)*27)),participants=[...starters,...bench],events=new Map(participants.map(player=>[player,{goals:0,assists:0}]));
    const scorers=[];for(let index=0;index<goals;index++){const hint=scorerHints[index],hintPlayer=hint&&!hint.generated?participants.find(player=>comparableClubName(player.name)===comparableClubName(hint.name)):null,scorer=hintPlayer||weightedPick(participants,player=>{const unit=positionUnit(player.position),role=unit==="a"?1.65:unit==="m"?1:.22;return Math.max(1,Number(player.shooting||player.overall||65)-42)*role;});if(!scorer)continue;events.get(scorer).goals++;scorers.push({name:scorer.name,playerId:worldPlayerKey(save,scorer,club.id),generated:Boolean(scorer.generated)});if(participants.length>1&&stableScoutingUnit(`${matchKey}|assist|${index}`)<.78){const creator=weightedPick(participants.filter(player=>player!==scorer),player=>{const unit=positionUnit(player.position),role=unit==="a"?1.2:unit==="m"?1.45:.38;return Math.max(1,Number(player.passing||player.overall||65)-42)*role;});if(creator)events.get(creator).assists++;}}
    const result=goals>goalsAgainst?1:goals===goalsAgainst?0:-1;participants.forEach(player=>{const starter=starters.includes(player),subIndex=bench.indexOf(player),minutes=starter?(bench.length&&subIndex<0&&starters.indexOf(player)<bench.length?subMinutes[starters.indexOf(player)]:90):90-subMinutes[subIndex],event=events.get(player),unit=positionUnit(player.position),abilityEdge=(Number(player.overall||65)-Number(club.ability||club.prestige||70))*.018,noise=(stableScoutingUnit(`${matchKey}|rating|${player.id}`)-.5)*.72,rating=clamp(6.35+result*.32+abilityEdge+noise+event.goals*.72+event.assists*.42-(goalsAgainst>=3&&unit==="d"?.22:0),4.6,9.7),defensive=unit==="d"||player.position==="GK",creative=unit==="m"||["RW","LW","CF"].includes(player.position),duels=Math.max(1,Math.round(minutes/13+stableScoutingUnit(`${matchKey}|duel|${player.id}`)*4)),tackles=defensive?Math.round(minutes/38+stableScoutingUnit(`${matchKey}|tackle|${player.id}`)*3):Math.round(stableScoutingUnit(`${matchKey}|tackle|${player.id}`)*2),keyPasses=creative?Math.round(stableScoutingUnit(`${matchKey}|key|${player.id}`)*3):stableScoutingUnit(`${matchKey}|key|${player.id}`)>.8?1:0,cardRoll=stableScoutingUnit(`${matchKey}|card|${player.id}`),delta={appearances:1,minutes,goals:event.goals,assists:event.assists,ratingTotal:Number(rating.toFixed(2)),keyPasses,chancesCreated:keyPasses,successfulDribbles:unit==="a"?Math.round(stableScoutingUnit(`${matchKey}|dribble|${player.id}`)*4):0,progressivePasses:creative?Math.round(minutes/18+stableScoutingUnit(`${matchKey}|progress|${player.id}`)*4):Math.round(minutes/45),tackles,tacklesWon:Math.min(tackles,Math.round(tackles*(.55+stableScoutingUnit(`${matchKey}|won|${player.id}`)*.4))),interceptions:defensive?Math.round(stableScoutingUnit(`${matchKey}|interception|${player.id}`)*4):Math.round(stableScoutingUnit(`${matchKey}|interception|${player.id}`)*2),clearances:defensive?Math.round(stableScoutingUnit(`${matchKey}|clearance|${player.id}`)*6):0,blocks:defensive?Math.round(stableScoutingUnit(`${matchKey}|block|${player.id}`)*2):0,duels,duelsWon:Math.round(duels*(.42+stableScoutingUnit(`${matchKey}|duelwon|${player.id}`)*.35)),recoveries:Math.round(minutes/18+stableScoutingUnit(`${matchKey}|recover|${player.id}`)*4),pressuresWon:Math.round(minutes/30+stableScoutingUnit(`${matchKey}|pressure|${player.id}`)*3),saves:player.position==="GK"?Math.max(0,Math.round(2+stableScoutingUnit(`${matchKey}|save|${player.id}`)*4-goalsAgainst*.45)):0,cleanSheets:player.position==="GK"&&goalsAgainst===0?1:0,yellowCards:cardRoll>.89?1:0,redCards:cardRoll>.995?1:0};addWorldPlayerStats(save,player,club.id,delta,{rating,date});});return scorers.length?scorers:scorerHints;
  }

  function applyMajorLeagueMatch(league,home,away,options={}) {
    const gap=Number(home.ability||65)-Number(away.ability||65),homeGoals=options.homeGoals??poisson(clamp(1.4*Math.exp(gap/22)+.16,.18,5.5)),awayGoals=options.awayGoals??poisson(clamp(1.08*Math.exp(-gap/22),.12,4.9));
    home.p++;away.p++;home.gf+=homeGoals;home.ga+=awayGoals;away.gf+=awayGoals;away.ga+=homeGoals;
    let homeForm="D",awayForm="D";
    if(homeGoals>awayGoals){home.w++;away.l++;home.pts+=3;homeForm="W";awayForm="L";}else if(homeGoals<awayGoals){away.w++;home.l++;away.pts+=3;homeForm="L";awayForm="W";}else{home.d++;away.d++;home.pts++;away.pts++;}
    home.gd=home.gf-home.ga;away.gd=away.gf-away.ga;home.form=[homeForm,...home.form].slice(0,5);away.form=[awayForm,...away.form].slice(0,5);league.totalGoals+=homeGoals+awayGoals;
    const save=options.save||state,date=options.date||save?.date||START_DATE,homeScorers=simulateWorldTeamMatch(save,home,away,homeGoals,awayGoals,date,options.homeScorers||[],options.fixtureId),awayScorers=simulateWorldTeamMatch(save,away,home,awayGoals,homeGoals,date,options.awayScorers||[],options.fixtureId);
    for(let goal=0;goal<homeGoals;goal++)addMajorScorer(league,home,homeScorers?.[goal]||options.homeScorers?.[goal]||pickLeagueScorer(home,save));
    for(let goal=0;goal<awayGoals;goal++)addMajorScorer(league,away,awayScorers?.[goal]||options.awayScorers?.[goal]||pickLeagueScorer(away,save));
    return {home:home.name,away:away.name,homeId:home.id,awayId:away.id,homeGoals,awayGoals,fixtureId:options.fixtureId||null};
  }

  function finishMajorLeagueRound(league,date,matches) {
    league.round++;league.results.unshift({date,round:league.round,matches});league.results=league.results.slice(0,12);
    league.scorers.sort((a,b)=>b.goals-a.goals||a.name.localeCompare(b.name,"zh-CN"));league.scorers=league.scorers.slice(0,30);
  }

  function simulateMajorLeagueRound(save,league,date) {
    const matches=pairLeagueClubs(league.clubs,league.round).map(([home,away])=>applyMajorLeagueMatch(league,home,away,{save,date}));
    finishMajorLeagueRound(league,date,matches);
  }

  function simulateMajorLeagueWorld(save,targetDate) {
    save.majorLeagueWorld||=createMajorLeagueWorld(save.season||2026,save.clubId);
    const world=save.majorLeagueWorld,userLeague=clubById(save.clubId).league,previousCache=aiTransferRuntimeCache,ownsCache=!previousCache||previousCache.save!==save;if(ownsCache)aiTransferRuntimeCache=createAiTransferRuntimeCache(save,targetDate);
    const pending=[];try{Object.entries(world.leagues).forEach(([leagueId,league])=>{
      league.roundDates||=leagueRoundDates(leagueId,save.season||2026,LEAGUES[leagueId]?.matches||38);if(leagueId===userLeague)return;
      while(league.round<league.roundDates.length&&league.roundDates[league.round]<=targetDate)simulateMajorLeagueRound(save,league,league.roundDates[league.round]);
      if(league.roundDates[league.round])pending.push(league.roundDates[league.round]);
    });}finally{if(ownsCache)aiTransferRuntimeCache=previousCache;}
    world.nextRoundDate=pending.sort()[0]||addDays(targetDate,7);
    if(world.currentDate<targetDate)world.currentDate=targetDate;
  }

  function eventScorerList(m,ours) {
    if(!m)return [];
    const players=ours?state.squad:(m.opponentPlayers||[]),events=ours?m.playerEvents:m.opponentEvents,names=[];
    Object.entries(events||{}).forEach(([id,event])=>{const player=players.find(item=>item.id===id);for(let goal=0;goal<(event.goals||0);goal++)names.push({name:player?.name||"未知球员",generated:Boolean(player?.generated)});});
    return names;
  }

  function recordUserLeagueRound(save,fixture,match=null) {
    const userClub=clubById(save.clubId),league=save.majorLeagueWorld?.leagues[userClub.league];
    if(!league||fixture.competition!==LEAGUES[userClub.league].short||league.processedFixtureIds.includes(fixture.id))return;
    const ours=league.clubs.find(club=>club.id===save.clubId),opponent=league.clubs.find(club=>comparableClubName(club.name)===comparableClubName(fixture.opponent));
    if(!ours||!opponent||!fixture.score)return;
    const home=fixture.home?ours:opponent,away=fixture.home?opponent:ours,ourScorers=eventScorerList(match,true),opponentScorers=eventScorerList(match,false);
    const actual=applyMajorLeagueMatch(league,home,away,{save,date:fixture.date,homeGoals:fixture.score.home,awayGoals:fixture.score.away,homeScorers:fixture.home?ourScorers:opponentScorers,awayScorers:fixture.home?opponentScorers:ourScorers,fixtureId:fixture.id});
    const remaining=league.clubs.filter(club=>club!==ours&&club!==opponent),matches=[actual,...pairLeagueClubs(remaining,league.round).map(([homeClub,awayClub])=>applyMajorLeagueMatch(league,homeClub,awayClub,{save,date:fixture.date}))];
    league.processedFixtureIds.push(fixture.id);finishMajorLeagueRound(league,fixture.date,matches);
    const table=majorStandings(league),userRow=table.find(club=>club.id===save.clubId);save.points=userRow?.pts||0;save.leaguePosition=Math.max(1,table.findIndex(club=>club.id===save.clubId)+1);
    if(save.majorLeagueWorld.currentDate<fixture.date)save.majorLeagueWorld.currentDate=fixture.date;
  }

  function rebuildMajorLeagueWorld(save) {
    save.majorLeagueWorld=createMajorLeagueWorld(save.season||2026,save.clubId);simulateMajorLeagueWorld(save,save.date||START_DATE);
    const leagueShort=LEAGUES[clubById(save.clubId).league].short;
    (save.schedule||[]).filter(fixture=>fixture.status==="played"&&fixture.competition===leagueShort&&fixture.score).sort((a,b)=>a.date.localeCompare(b.date)).forEach(fixture=>recordUserLeagueRound(save,fixture));
  }

  function europeanWorldClubPool() {
    const externalStrength={Benfica:86,Ajax:83,Celtic:79,PSV:85,"Sporting CP":85,Galatasaray:82,"Club Brugge":78,Olympiacos:77,Feyenoord:84,Porto:84,"Fenerbahçe":81,Rangers:78,Anderlecht:76,"Slavia Praha":76,PAOK:75,"Rapid Wien":73,Fiorentina:83,"Real Betis":82,"Viktoria Plzeň":74,Ludogorets:71},entries=new Map();
    CLUBS.filter(club=>leagueOf(club)?.tier===1).forEach(club=>entries.set(comparableClubName(club.name),{id:club.id,name:club.name,code:club.code,association:club.league,ability:Number(club.prestige||72),external:false}));
    EUROPEAN_OPPONENTS.forEach(name=>{
      const local=resolveClub(name);if(local&&leagueOf(local)?.tier===1){entries.set(comparableClubName(local.name),{id:local.id,name:local.name,code:local.code,association:local.league,ability:Number(local.prestige||72),external:false});return;}
      const key=comparableClubName(name);if(!entries.has(key))entries.set(key,{id:`euro-${key}`,name,code:initials(name),association:`external-${key}`,ability:Number(externalStrength[name]||clamp(72+Math.round(stableScoutingUnit(`euro-strength|${name}`)*12),68,86)),external:true});
    });
    return [...entries.values()];
  }

  function europeanUserLeagueFixtures(save,config) {
    return (save.schedule||[]).filter(fixture=>fixture.competition===config.name&&fixture.phase==="league").sort((a,b)=>Number(a.stageIndex||0)-Number(b.stageIndex||0));
  }

  function createEuropeanFields(save) {
    const pool=europeanWorldClubPool(),byName=new Map(pool.map(club=>[comparableClubName(club.name),club])),userClub=clubById(save.clubId),configs=Object.values(EUROPEAN_COMPETITIONS),reserved=new Map(),requiredByCompetition={};
    configs.forEach(config=>{
      const fixtures=europeanUserLeagueFixtures(save,config),required=[];
      if(fixtures.length){required.push(byName.get(comparableClubName(userClub.name))||{id:userClub.id,name:userClub.name,code:userClub.code,association:userClub.league,ability:Number(userClub.prestige||72),external:false});fixtures.forEach(fixture=>{const key=comparableClubName(fixture.opponent),entry=byName.get(key)||{id:`euro-${key}`,name:fixture.opponent,code:initials(fixture.opponent),association:`external-${key}`,ability:clamp(config.fieldTarget+Math.round((stableScoutingUnit(`fixture-strength|${fixture.opponent}`)-.5)*12),68,92),external:true};byName.set(key,entry);if(!pool.some(item=>item.id===entry.id))pool.push(entry);required.push(entry);});}
      requiredByCompetition[config.key]=required.filter((club,index,array)=>array.findIndex(item=>item.id===club.id)===index);requiredByCompetition[config.key].forEach(club=>reserved.set(club.id,config.key));
    });
    const used=new Set(),fields={};
    configs.forEach(config=>{
      const required=requiredByCompetition[config.key],ranked=pool.filter(club=>!used.has(club.id)&&(!reserved.has(club.id)||reserved.get(club.id)===config.key)).sort((a,b)=>{
        const score=club=>config.key==="ucl"?club.ability+stableScoutingUnit(`${config.key}|${save.season}|${club.id}`)*5:-Math.abs(club.ability-config.fieldTarget)*1.7+club.ability*.22+stableScoutingUnit(`${config.key}|${save.season}|${club.id}`)*7;
        return score(b)-score(a)||b.ability-a.ability||a.name.localeCompare(b.name);
      }),selected=[...required];
      ranked.forEach(club=>{if(selected.length<36&&!selected.some(item=>item.id===club.id))selected.push(club);});
      if(selected.length<36)pool.filter(club=>!selected.some(item=>item.id===club.id)).sort((a,b)=>b.ability-a.ability).forEach(club=>{if(selected.length<36)selected.push(club);});
      selected.slice(0,36).forEach(club=>used.add(club.id));fields[config.key]=selected.slice(0,36);
    });
    return fields;
  }

  function europeanPairKey(firstId,secondId) {return [firstId,secondId].sort().join("|");}

  function matchEuropeanRound(clubs,usedPairs,seed,depth=0) {
    if(!clubs.length)return [];const first=clubs[0],candidates=seededShuffle(clubs.slice(1).filter(candidate=>!usedPairs.has(europeanPairKey(first.id,candidate.id))),`${seed}|${depth}|${first.id}`);
    for(const second of candidates){const rest=clubs.filter(club=>club!==first&&club!==second),remainingPairs=matchEuropeanRound(rest,usedPairs,seed,depth+1);if(remainingPairs)return [[first,second],...remainingPairs];}
    return null;
  }

  function createEuropeanRoundMatches(save,config,clubs,roundIndex,usedPairs) {
    const userFixture=europeanUserLeagueFixtures(save,config).find(fixture=>Number(fixture.stageIndex||0)===roundIndex),userClub=clubs.find(club=>club.id===save.clubId),opponent=userFixture?clubs.find(club=>comparableClubName(club.name)===comparableClubName(userFixture.opponent)):null,pairs=[];
    if(userFixture&&userClub&&opponent){pairs.push(userFixture.home?[userClub,opponent]:[opponent,userClub]);usedPairs.add(europeanPairKey(userClub.id,opponent.id));}
    const forcedIds=new Set(pairs.flat().map(club=>club.id)),remaining=seededShuffle(clubs.filter(club=>!forcedIds.has(club.id)),`europe-round|${config.key}|${save.season}|${roundIndex}`),matched=matchEuropeanRound(remaining,usedPairs,`europe-match|${config.key}|${save.season}|${roundIndex}`)||[];
    matched.forEach(([first,second])=>{const home=stableScoutingUnit(`europe-home|${config.key}|${save.season}|${roundIndex}|${first.id}|${second.id}`)>=.5?first:second,away=home===first?second:first;pairs.push([home,away]);usedPairs.add(europeanPairKey(first.id,second.id));});
    return pairs.map(([home,away],matchIndex)=>({id:`${config.key}-${save.season}-world-${roundIndex}-${matchIndex}`,stageIndex:roundIndex,date:userFixture?.date||addDays(`${save.season}-08-08`,config.offsets[roundIndex]),homeId:home.id,awayId:away.id,home:home.name,away:away.name,status:"upcoming",homeGoals:null,awayGoals:null,userFixtureId:userFixture&&(home.id===save.clubId||away.id===save.clubId)?userFixture.id:null}));
  }

  function createEuropeanWorld(save) {
    const fields=createEuropeanFields(save),competitions={};
    Object.values(EUROPEAN_COMPETITIONS).forEach(config=>{
      const clubs=fields[config.key].map(club=>({...club,p:0,w:0,d:0,l:0,gf:0,ga:0,gd:0,pts:0,form:[]})),usedPairs=new Set(),rounds=[];
      for(let roundIndex=0;roundIndex<config.matches;roundIndex++){const matches=createEuropeanRoundMatches(save,config,clubs,roundIndex,usedPairs),date=matches[0]?.date||addDays(`${save.season}-08-08`,config.offsets[roundIndex]);rounds.push({index:roundIndex,date,status:"upcoming",matches});}
      competitions[config.key]={key:config.key,name:config.name,fullName:config.fullName,season:save.season,round:0,clubs,rounds,totalGoals:0};
    });
    return {season:save.season,currentDate:`${save.season}-08-01`,competitions};
  }

  function europeanStandings(competition) {
    return [...(competition?.clubs||[])].sort((a,b)=>b.pts-a.pts||b.gd-a.gd||b.gf-a.gf||a.name.localeCompare(b.name,"zh-CN"));
  }

  function applyEuropeanLeagueMatch(competition,match,options={}) {
    const home=competition.clubs.find(club=>club.id===match.homeId),away=competition.clubs.find(club=>club.id===match.awayId);if(!home||!away)return null;
    const gap=Number(home.ability||72)-Number(away.ability||72),homeGoals=options.homeGoals??poisson(clamp(1.36*Math.exp(gap/23)+.15,.15,5.2)),awayGoals=options.awayGoals??poisson(clamp(1.08*Math.exp(-gap/23),.12,4.7));home.p++;away.p++;home.gf+=homeGoals;home.ga+=awayGoals;away.gf+=awayGoals;away.ga+=homeGoals;let homeForm="D",awayForm="D";
    if(homeGoals>awayGoals){home.w++;away.l++;home.pts+=3;homeForm="W";awayForm="L";}else if(homeGoals<awayGoals){away.w++;home.l++;away.pts+=3;homeForm="L";awayForm="W";}else{home.d++;away.d++;home.pts++;away.pts++;}
    home.gd=home.gf-home.ga;away.gd=away.gf-away.ga;home.form=[homeForm,...home.form].slice(0,5);away.form=[awayForm,...away.form].slice(0,5);match.status="played";match.homeGoals=homeGoals;match.awayGoals=awayGoals;competition.totalGoals+=homeGoals+awayGoals;return match;
  }

  function simulateEuropeanCompetitionRound(save,competition,round) {
    if(round.status==="played")return true;const userMatch=round.matches.find(match=>match.userFixtureId),userFixture=userMatch?(save.schedule||[]).find(fixture=>fixture.id===userMatch.userFixtureId):null;if(userMatch&&userFixture?.status!=="played")return false;
    round.matches.forEach(match=>{if(match===userMatch&&userFixture?.score)applyEuropeanLeagueMatch(competition,match,{homeGoals:userFixture.score.home,awayGoals:userFixture.score.away});else applyEuropeanLeagueMatch(competition,match);});round.status="played";competition.round=Math.max(competition.round,round.index+1);return true;
  }

  function simulateEuropeanWorld(save,targetDate) {
    save.europeanWorld||=createEuropeanWorld(save);Object.values(save.europeanWorld.competitions||{}).forEach(competition=>{for(const round of competition.rounds||[]){if(round.status==="played"||round.date>targetDate)continue;if(!simulateEuropeanCompetitionRound(save,competition,round))break;}});if(save.europeanWorld.currentDate<targetDate)save.europeanWorld.currentDate=targetDate;return save.europeanWorld;
  }

  function rebuildEuropeanWorld(save) {save.europeanWorld=createEuropeanWorld(save);simulateEuropeanWorld(save,save.date||START_DATE);return save.europeanWorld;}

  function europeanLeaguePosition(save,competitionKey) {
    const competition=save?.europeanWorld?.competitions?.[competitionKey],table=europeanStandings(competition),index=table.findIndex(club=>club.id===save.clubId);return index>=0?index+1:null;
  }

  function validateModPack(pack) {
    if(!pack||pack.schemaVersion!==1||typeof pack.packId!=="string"||!pack.packId.trim())throw new Error("缺少有效的 schemaVersion 或 packId");
    if(!Array.isArray(pack.leagues)||!Array.isArray(pack.clubs)||!Array.isArray(pack.players))throw new Error("leagues、clubs、players 必须是数组");
    const leagueIds=new Set(pack.leagues.map(item=>item.id));
    if(leagueIds.size!==pack.leagues.length||[...leagueIds].some(id=>!id))throw new Error("联赛 ID 缺失或重复");
    if(pack.clubs.some(club=>!club.id||!club.name||!leagueIds.has(club.leagueId)))throw new Error("俱乐部缺少 ID、名称或关联了不存在的联赛");
    const clubIds=new Set(pack.clubs.map(item=>item.id));
    if(clubIds.size!==pack.clubs.length)throw new Error("俱乐部 ID 重复");
    if(pack.players.some(player=>!player.id||!player.name||!clubIds.has(player.clubId)||Number(player.ca)<1||Number(player.ca)>99||Number(player.pa)<Number(player.ca)||Number(player.pa)>99))throw new Error("球员字段或 CA/PA 范围无效");
    return {...pack,name:pack.name||pack.packId,importedAt:new Date().toISOString()};
  }

  function createState() {
    resetClubLeagueAssignments();
    const club = clubById(setup.clubId);
    let controlled = null;
    let person;
    if (setup.role === "player") {
      controlled = setup.origin === "real"
        ? { ...REAL_PLAYERS.find(p => p.id === setup.identity) }
        : { id:"custom", name:setup.customName || "新星球员", club:club.id, position:setup.customPosition, age:Number(setup.customAge)||18, nationality:leagueOf(club).country, overall:68, potential:88, value:5.8, wage:28, pace:72, shooting:68, passing:70, dribbling:73, defending:60, physical:69 };
      person = controlled.name;
    } else {
      const selected = COACHES.find(c => c.name === setup.identity);
      person = setup.origin === "real" ? selected.name : (setup.customName || "新任主教练");
    }
    const squad = createSquad(club, controlled);
    squad.forEach(player=>{ensurePlayerDevelopment(player,2026);ensurePlayerContract(player,2026);});
    const coachProfile = setup.role === "coach" && setup.origin === "real"
      ? { ...COACHES.find(c => c.name === setup.identity) }
      : { name:person, overall:70, tactics:72, people:70, youth:68, transfers:69 };
    const schedule=generateSchedule(club,2026,controlled);
    const created={
      version:44, role:setup.role, origin:setup.origin, person, clubId:club.id, date:START_DATE, season:2026, view:"home",
      funds:club.budget, reputation:setup.role === "coach" ? coachProfile.overall : controlled.overall,
      squad, coachProfile, controlledId:setup.role === "player" ? "controlled" : null,
      schedule, played:0, wins:0, draws:0, losses:0, points:0, leaguePosition:1,
      training:"balanced", tactic:"balanced", transferRequests:0, inboxUnread:3, continueStatus:null,
      competitionProgress:{ europe:createEuropeanProgress(club,2026), cups:{}, international:{} },
      backgroundWorld:createBackgroundWorld(2026), worldLeague:"BRA1",majorLeagueWorld:createMajorLeagueWorld(2026,club.id),majorLeagueId:club.league,worldCenterMode:"domestic",europeanCompetitionKey:"ucl",europeanRoundFilters:{},worldPlayerStats:{season:2026,players:{},archives:{},processedMatches:{}},
      media:[
        { source:"Football Daily", title:`${person} 正式开启 ${club.name} 生涯`, body:`新赛季从 2026 年 8 月 1 日开始。外界将密切关注这段生涯的第一步。`, date:START_DATE, type:"career" },
        { source:"The Tactical Room", title:`${club.name} 季前展望：稳定性将决定上限`, body:`球队需要在密集赛程中管理体能，并在两个转会窗口做出准确判断。`, date:START_DATE, type:"analysis" }
      ],
      honors:[], history:[], worldHistory:createWorldHistory(),worldClubLeagues:Object.fromEntries(CLUBS.map(item=>[item.id,item.league])),notifications:initialNotifications(club,schedule),matchReports:[],fixtureArchives:[],fixtureSeasonFilter:"current",squadSort:{key:"position",direction:"asc"},squadSearch:"",fixtureFilter:"all",
      activeMatch:null, selectedTransfer:null, transferNegotiations:[],transferRequestsLog:[],transferHistory:[],retired:false,
      playerCareer:setup.role==="player"?createPlayerCareer(controlled,club):null,
      coachCareer:setup.role==="coach"?createCoachCareer():null
    };
    created.europeanWorld=createEuropeanWorld(created);
    const youth=createYouthSystem(created);created.youthAcademy=youth.academy;created.youthWorld=youth.world;
    ensureMarketValuation(created);
    created.transferMarket=createTransferMarket(created.season);
    syncManagedSquadWorldStats(created);
    ensureClubFinances(created);
    simulateTransferMarket(created,START_DATE);
    return created;
  }

  function saveStorageKey(id) { return id==="legacy"?SAVE_KEY:`${SAVE_PREFIX}${id}`; }
  function loadSaveIndex() {
    try {
      const parsed=JSON.parse(localStorage.getItem(SAVE_INDEX_KEY)||"[]"),index=Array.isArray(parsed)?parsed:[];
      if(localStorage.getItem(SAVE_KEY)&&!index.some(item=>item.id==="legacy"))index.push({id:"legacy",updatedAt:0,legacy:true});
      return index.filter(item=>item?.id&&localStorage.getItem(saveStorageKey(item.id))).sort((a,b)=>Number(b.updatedAt||0)-Number(a.updatedAt||0));
    } catch(error) { console.error("存档索引加载失败",error);return localStorage.getItem(SAVE_KEY)?[{id:"legacy",updatedAt:0,legacy:true}]:[]; }
  }
  function saveMetadata(save,id=activeSaveId) {
    const club=clubById(save.clubId),metadata={id,person:save.person,club:club.name,clubId:club.id,role:save.role,season:save.season,date:save.date,played:save.played||0,updatedAt:Date.now(),legacy:id==="legacy"};
    const index=loadSaveIndex().filter(item=>item.id!==id);index.unshift(metadata);localStorage.setItem(SAVE_INDEX_KEY,JSON.stringify(index));return metadata;
  }
  function loadState(id=activeSaveId||loadSaveIndex()[0]?.id) {
    try { const raw=id?localStorage.getItem(saveStorageKey(id)):null;if(!raw)return null;activeSaveId=id;const loaded=migrateState(JSON.parse(raw));saveMetadata(loaded,id);return loaded; } catch (error) { console.error("存档加载失败",error);return null; }
  }
  function migrateState(saved) {
    if (!saved) return null;
    const previousVersion=saved.version||1;
    resetClubLeagueAssignments();
    saved.clubId = LEGACY_TEAM_MAP[saved.clubId] || saved.clubId;
    saved.honors=Array.isArray(saved.honors)?saved.honors:[];ensureWorldHistory(saved);applyClubLeagueAssignments(saved);
    saved.competitionProgress ||= { cups:{} };
    const legacyUcl=saved.competitionProgress.ucl;
    saved.competitionProgress.europe ||= legacyUcl?{ucl:{...legacyUcl}}:createEuropeanProgress(clubById(saved.clubId),saved.season||2026);
    Object.values(saved.competitionProgress.europe).forEach(progress=>{progress.played??=0;progress.points??=0;progress.gf??=0;progress.ga??=0;progress.position??=null;progress.eliminated??=false;progress.knockoutStage??=-1;});
    saved.competitionProgress.international ||= {};
    saved.competitionProgress.cups ||= {};
    saved.squad ||= [];
    if(previousVersion<32)migrateDetailedPositions(saved.squad,saved.clubId);
    saved.squad.forEach(player => {
      player.lastRating ??= Number(player.form) || null;
      player.ratingTotal ??= player.appearances ? Number(player.form || 6) * player.appearances : 0;
      player.appearances ??= 0; player.goals ??= 0; player.assists ??= 0;
      player.consecutiveStarts??=0;player.lastMatchMinutes??=0;player.lastMatchDate??=null;
      player.careerStats=Array.isArray(player.careerStats)?player.careerStats:[];
      player.development||={season:saved.season||2026,startOverall:Number(player.overall||65),minutes:Math.round(Number(player.appearances||0)*75),injuryDays:0};
      ensurePlayerContract(player,saved.season||2026);
    });
    if(previousVersion<43||!saved.worldPlayerStats){saved.worldPlayerStats={season:Number(saved.season||2026),players:{},archives:{},processedMatches:{}};syncManagedSquadWorldStats(saved);}else ensureWorldPlayerStats(saved);
    if(previousVersion<6&&saved.played>0){
      const keepers=saved.squad.filter(player=>player.position==="GK");
      if(keepers.length&&keepers.every(player=>!player.appearances)){
        const firstChoice=[...keepers].sort((a,b)=>(b.overall||0)-(a.overall||0))[0];
        firstChoice.appearances=saved.played;firstChoice.ratingTotal=Number((saved.played*6).toFixed(2));firstChoice.lastRating=6;firstChoice.form=6;
        saved.notifications=[{id:"v6-goalkeeper-repair",title:"数据修复：门将出场统计已校正",type:"general",date:saved.date,read:false,detail:`旧版本的首发选择遗漏了门将。系统已将此前 ${saved.played} 场比赛的出场记录校正到当时能力最高的门将 ${firstChoice.name}，历史评分按中性基准 6.00 计入；新比赛将记录实际首发门将与实时评分。`,facts:[`校正球员：${firstChoice.name}`,`补录出场：${saved.played} 场`,`历史基准评分：6.00`]},...(saved.notifications||[])];
      }
    }
    saved.notifications=(saved.notifications||[]).map((item,index)=>normalizeNotification(item,index,saved));
    saved.matchReports=Array.isArray(saved.matchReports)?saved.matchReports:[];
    saved.fixtureArchives=Array.isArray(saved.fixtureArchives)?saved.fixtureArchives.map(archive=>({...archive,fixtures:Array.isArray(archive.fixtures)?archive.fixtures:[]})):[];
    saved.fixtureSeasonFilter||="current";
    saved.squadSort||={key:"position",direction:"asc"};
    saved.squadSearch||="";
    saved.fixtureFilter||="all";
    saved.transferNegotiations=Array.isArray(saved.transferNegotiations)?saved.transferNegotiations:[];
    saved.transferRequestsLog=Array.isArray(saved.transferRequestsLog)?saved.transferRequestsLog:[];
    saved.continueStatus||=null;
    saved.inboxUnread=saved.notifications.filter(item=>!item.read).length;
    if (saved.activeMatch) {
      saved.activeMatch.tactic ||= saved.role === "coach" ? saved.tactic : "balanced";
      saved.activeMatch.lastDecisionMinute ??= -10;
      saved.activeMatch.decisionBonus ??= 0;
      saved.activeMatch.decisionRisk ??= 0;
      saved.activeMatch.decisionEvent = null;
      saved.activeMatch.lineupIds ||= saved.squad.filter(player=>!player.injured).slice(0,11).map(player=>player.id);
      saved.activeMatch.playerEvents ||= {};
      saved.activeMatch.speed??=1;saved.activeMatch.paused??=true;saved.activeMatch.pauseReason||="resume";saved.activeMatch.halfTimeTalkDone??=saved.activeMatch.minute>45;saved.activeMatch.postMatchTalkDone??=false;saved.activeMatch.pendingTalk??=saved.activeMatch.minute===45?"halfTime":null;saved.activeMatch.heatmap||={};saved.activeMatch.visualTick??=0;saved.activeMatch.stoppageTime??=null;saved.activeMatch.aiNextTacticalMinute||={ours:Math.round(rand(24,38)),opponent:Math.round(rand(24,38))};
      if(saved.activeMatch.pauseReason==="decision"){saved.activeMatch.pauseReason=null;saved.activeMatch.paused=false;}
      ensureMatchRuntime(saved,saved.activeMatch);
      repairMatchLineups(saved,saved.activeMatch);
      if(saved.role==="player"&&!saved.activeMatch.controlledSelection){
        const starter=(saved.activeMatch.initialLineupIds||[]).includes(saved.controlledId),bench=(saved.activeMatch.initialBenchIds||[]).includes(saved.controlledId);
        saved.activeMatch.controlledSelection={status:starter?"starter":bench?"bench":"rest",label:starter?"本场首发":bench?"替补待命":"本场轮休",reason:starter?"本场阵容已在旧版本中确定":bench?"本场替补名单已在旧版本中确定":"本场名单已在旧版本中确定"};
      }
      if(!(saved.activeMatch.lineupIds||[]).includes(saved.activeMatch.selectedHeatmapPlayer))saved.activeMatch.selectedHeatmapPlayer=saved.activeMatch.lineupIds?.[0]||null;
    }
    if ((saved.version || 1) < 3) {
      saved.schedule = (saved.schedule || []).filter(fixture => !(fixture.knockout && fixture.stageIndex > 0 && fixture.status === "upcoming"));
      saved.version = 3;
    }
    if ((saved.version || 1) < 4) {
      saved.backgroundWorld ||= createBackgroundWorld(saved.season||2026);
      saved.worldLeague ||= Object.keys(saved.backgroundWorld.leagues)[0]||"BRA1";
      saved.version=4;
    }
    if ((saved.version || 1) < 5) saved.version=5;
    if ((saved.version || 1) < 6) saved.version=6;
    if(previousVersion<43||!saved.majorLeagueWorld)rebuildMajorLeagueWorld(saved);else simulateMajorLeagueWorld(saved,saved.date||START_DATE);
    saved.majorLeagueId=saved.majorLeagueWorld.leagues[saved.majorLeagueId]?saved.majorLeagueId:clubById(saved.clubId).league;
    if(previousVersion<42||!saved.europeanWorld)rebuildEuropeanWorld(saved);else simulateEuropeanWorld(saved,saved.date||START_DATE);
    saved.worldCenterMode=saved.worldCenterMode==="europe"?"europe":"domestic";saved.europeanCompetitionKey=saved.europeanWorld.competitions[saved.europeanCompetitionKey]?saved.europeanCompetitionKey:"ucl";saved.europeanRoundFilters=saved.europeanRoundFilters&&typeof saved.europeanRoundFilters==="object"?saved.europeanRoundFilters:{};
    saved.transferHistory=Array.isArray(saved.transferHistory)?saved.transferHistory:[];if(saved.transferMarket)repairTransferOwnership(saved,saved.transferMarket);
    if(previousVersion<8||!saved.transferMarket){saved.transferMarket=createTransferMarket(saved.season||2026);repairTransferOwnership(saved,saved.transferMarket);simulateTransferMarket(saved,saved.date||START_DATE);}
    else if(previousVersion<10)rebuildTransferMarketFromPostOpeningActivity(saved);
    else simulateTransferMarket(saved,saved.date||START_DATE);
    const historicalTransfers=[...(Array.isArray(saved.transferHistory)?saved.transferHistory:[]),...(saved.transferMarket?.records||[])],uniqueTransfers=new Map();historicalTransfers.forEach(record=>uniqueTransfers.set(record.id,record));saved.transferHistory=[...uniqueTransfers.values()].sort((a,b)=>b.date.localeCompare(a.date)).slice(0,500);
    repairTransferOwnership(saved,saved.transferMarket);
    saved.transferHistory.forEach(record=>{record.careerHistory=Array.isArray(record.careerHistory)?record.careerHistory:[];record.careerSegment||={id:`career-legacy-transfer-${record.id}`,season:record.season||saved.season,club:clubById(record.fromId).name,clubId:record.fromId,appearances:0,goals:0,assists:0,average:0,overallStart:record.overall,overallEnd:record.overall,change:0,partialSeason:true,endDate:record.date,dataUnavailable:true};});
    if(previousVersion<17&&saved.role==="player"){
      const player=saved.squad.find(item=>item.id===saved.controlledId);saved.schedule=(saved.schedule||[]).filter(item=>!item.international||item.status==="played");
      if(player){const additions=generateInternationalSchedule(player,saved.season||2026).filter(item=>item.date>=saved.date);saved.schedule.push(...additions);}
      resolveFixtureSpacing((saved.schedule||[]).filter(item=>item.status==="upcoming"),LEAGUES[clubById(saved.clubId).league].short);
    }
    if((previousVersion<17||saved.calendarRepairPending)&&!saved.activeMatch){repairCompetitionCalendar(saved);delete saved.calendarRepairPending;}
    else if(previousVersion<17&&saved.activeMatch)saved.calendarRepairPending=true;
    if(previousVersion<18){
      (saved.matchReports||[]).forEach(normalizeLegacyReportHeatmaps);
      if(saved.activeMatch&&!saved.activeMatch.heatmapNormalized){
        const ourIds=new Set([...(saved.activeMatch.initialLineupIds||[]),...(saved.activeMatch.initialBenchIds||[]),...(saved.activeMatch.lineupIds||[]),...(saved.activeMatch.benchIds||[])]);
        if(!saved.activeMatch.fixture?.home)ourIds.forEach(id=>{if(saved.activeMatch.heatmap?.[id])saved.activeMatch.heatmap[id]=saved.activeMatch.heatmap[id].map(([x,y])=>[Number((100-x).toFixed(1)),y]);});
        saved.activeMatch.heatmapNormalized=true;
      }
    }
    if(previousVersion<20&&saved.activeMatch?.fixture?.international&&Number(saved.activeMatch.minute||0)===0)saved.activeMatch=null;
    saved.schedule?.sort((a,b)=>a.date.localeCompare(b.date));
    if(saved.role==="player")saved.playerCareer=ensurePlayerCareer(saved);
    if(saved.role==="coach")saved.coachCareer=ensureCoachCareer(saved);
    ensureYouthSystem(saved);if(!["home","squad","fixtures","world","academy","transfers","media","career","profile"].includes(saved.view))saved.view="home";
    ensureMarketValuation(saved);
    ensureClubFinances(saved);
    saved.version=44;
    return saved;
  }
  function saveState() {
    if(!state)return;
    if(!activeSaveId)activeSaveId=`career-${Date.now().toString(36)}`;
    const storageKey=saveStorageKey(activeSaveId);try{localStorage.setItem(storageKey,JSON.stringify(state));saveMetadata(state,activeSaveId);}catch(error){if(error?.name!=="QuotaExceededError")throw error;compactWorldPlayerStats(state);state.matchReports=(state.matchReports||[]).slice(0,260);state.fixtureArchives=(state.fixtureArchives||[]).slice(0,12);state.media=(state.media||[]).slice(0,40);state.notifications=(state.notifications||[]).slice(0,30);try{localStorage.setItem(storageKey,JSON.stringify(state));saveMetadata(state,activeSaveId);toast("存档数据已压缩，操作可以继续");}catch(retryError){console.error("存档压缩后仍无法保存",retryError);toast("本地存储空间不足，已保留当前页面状态");}}
  }
  function resetSave() {
    if(activeSaveId)localStorage.removeItem(saveStorageKey(activeSaveId));
    const index=loadSaveIndex().filter(item=>item.id!==activeSaveId);localStorage.setItem(SAVE_INDEX_KEY,JSON.stringify(index));
    state=null;activeSaveId=null;modal=null;conversationSession=null;frontScreen="menu";render();
  }
  function controlledPlayer() { return state?.squad.find(p => p.id === state.controlledId); }
  function nextFixture() { return state?.schedule.filter(f=>f.status==="upcoming").sort((a,b)=>a.date.localeCompare(b.date))[0]; }
  function seasonScheduleComplete(save=state) { return Boolean(save?.schedule?.length)&&!save.schedule.some(fixture=>fixture.status==="upcoming"); }
  function continueActionMode(save=state) {
    if(!save||save.retired)return "disabled";
    const fixture=(save.schedule||[]).filter(item=>item.status==="upcoming").sort((a,b)=>a.date.localeCompare(b.date))[0];
    if(!fixture)return seasonScheduleComplete(save)?"season":"disabled";
    return fixture.date<=save.date?"match":"advance";
  }

  function createCoachCareer() {
    return {
      boardConfidence:66,dressingRoom:68,mediaHeat:28,preparations:[],story:null,storyHistory:[],
      nextStoryDate:addDays(START_DATE,8)
    };
  }

  function ensureCoachCareer(save=state) {
    if(!save||save.role!=="coach")return null;
    const base=createCoachCareer(),career=save.coachCareer||(save.coachCareer={});
    Object.entries(base).forEach(([key,value])=>{if(career[key]===undefined||career[key]===null)career[key]=Array.isArray(value)?[...value]:value&&typeof value==="object"?{...value}:value;});
    career.boardConfidence=clamp(Number(career.boardConfidence||base.boardConfidence),0,100);
    career.dressingRoom=clamp(Number(career.dressingRoom||base.dressingRoom),0,100);
    career.mediaHeat=clamp(Number(career.mediaHeat||base.mediaHeat),0,100);
    career.preparations=Array.isArray(career.preparations)?career.preparations.filter(item=>Number(item?.remainingMatches||0)>0).slice(-6):[];
    career.storyHistory=Array.isArray(career.storyHistory)?career.storyHistory.slice(0,20):[];
    if(career.story&&typeof career.story!=="object")career.story=null;
    return career;
  }

  const COACH_STORY_EVENTS=[
    {id:"opposition-analysis",title:"对手分析会议",detail:({fixture})=>`分析组已经完成对 ${fixture?.opponent||"下一个对手"} 的压迫路线、弱侧空当与定位球习惯拆解。你必须决定把有限准备时间投入在哪里。`,choices:[
      {id:"deep-scout",icon:"scan-search",label:"深度战术拆解",detail:"未来 2 场提高战术执行与整体比赛强度",preparation:{tactical:5,strength:2.2,possession:2,matches:2}},
      {id:"transition-drill",icon:"fast-forward",label:"转换进攻演练",detail:"未来 2 场提高进攻转换，但训练消耗略高",preparation:{strength:3.2,possession:1,matches:2},fitness:-1},
      {id:"recovery-priority",icon:"battery-charging",label:"恢复优先",detail:"全队补充体能，并降低未来 2 场伤病风险",preparation:{injuryFactor:.72,matches:2},fitness:3}
    ]},
    {id:"medical-load",title:"医疗与负荷会议",detail:()=>"队医指出赛程即将变得密集。继续加码可以保住比赛锐度，也可能把疲劳推向伤病边缘。",choices:[
      {id:"reduce-load",icon:"heart-pulse",label:"降低训练负荷",detail:"全队恢复更多，未来 2 场伤病风险下降",preparation:{injuryFactor:.68,matches:2},fitness:5},
      {id:"keep-intensity",icon:"flame",label:"保持比赛强度",detail:"未来 2 场提升对抗强度，代价是当前体能",preparation:{strength:3.1,matches:2},fitness:-3},
      {id:"individualise",icon:"sliders-horizontal",label:"个性化恢复",detail:"优先保护低体能与老将，保留战术锐度",preparation:{tactical:2,injuryFactor:.82,matches:2},targetedRecovery:true}
    ]},
    {id:"dressing-room",title:"更衣室角色冲突",detail:()=>"一名出场时间下降的核心球员对角色感到不满，几名年轻球员也开始观察你的处理方式。",choices:[
      {id:"private-talk",icon:"messages-square",label:"私下安抚",detail:"提高更衣室氛围与士气，未来 2 场更稳定",dressingRoom:6,preparation:{tactical:1,strength:1.2,matches:2}},
      {id:"clear-rules",icon:"clipboard-check",label:"公开明确规则",detail:"加强战术纪律与选人标准，但部分球员短期不满",dressingRoom:-2,preparation:{tactical:5,matches:2}},
      {id:"captain-mediation",icon:"users-round",label:"交给队长调解",detail:"平衡冲突，提升更衣室和媒体形象",dressingRoom:3,mediaHeat:-4,preparation:{strength:1,matches:2}}
    ]},
    {id:"board-meeting",title:"董事会季度会议",detail:()=>"董事会要求你就赛季目标、阵容投入与当前表现作出清晰承诺。每一种回应都会改变他们的耐心与资源倾向。",choices:[
      {id:"accept-target",icon:"circle-check",label:"接受谨慎目标",detail:"提高董事会信任，未来 2 场球队更稳定",boardConfidence:7,preparation:{tactical:2,matches:2}},
      {id:"request-resources",icon:"landmark",label:"要求额外资源",detail:"争取转会资金；信任不足时会造成董事会压力",boardFunding:true,mediaHeat:3},
      {id:"protect-squad",icon:"shield",label:"优先保护球队",detail:"降低舆论与更衣室压力，但董事会耐心会小幅下降",boardConfidence:-3,dressingRoom:4,mediaHeat:-7,preparation:{injuryFactor:.86,matches:2}}
    ]},
    {id:"academy-pathway",title:"青训融入方案",detail:()=>"青训总监提交了几名高潜小将的报告。是立即给出一线队路径，还是先把成长环境打牢？",choices:[
      {id:"cup-pathway",icon:"graduation-cap",label:"明确杯赛机会",detail:"一名高潜年轻人在未来 3 场获得明显选人优先级",youthPriority:true,preparation:{matches:3}},
      {id:"development-path",icon:"chart-no-axes-column-increasing",label:"先安排发展训练",detail:"提升青训球员士气与训练成长，短期不干扰主力轮换",youthDevelopment:true,dressingRoom:2},
      {id:"loan-scout",icon:"send",label:"安排外租评估",detail:"增加年轻球员的市场关注，并保留一线队稳定性",loanInterest:true,boardConfidence:2}
    ]},
    {id:"media-pressure",title:"媒体质疑升温",detail:()=>"赛前发布会上，外界开始追问近期表现与更衣室情况。你的口径会迅速传回球队内部。",choices:[
      {id:"shield-players",icon:"shield-check",label:"保护球员",detail:"降低媒体热度，提高更衣室信任",mediaHeat:-9,dressingRoom:5,preparation:{strength:1.2,matches:2}},
      {id:"take-responsibility",icon:"badge",label:"主动承担责任",detail:"未来 2 场提高战术执行，但教练个人压力上升",mediaHeat:3,boardConfidence:2,preparation:{tactical:4,strength:1,matches:2}},
      {id:"fight-back",icon:"megaphone",label:"强硬回应",detail:"短期提升斗志，但媒体压力与比赛波动都会加大",mediaHeat:10,dressingRoom:1,preparation:{strength:3.5,matches:1}}
    ]}
  ];

  function coachPreparationSummary(career=ensureCoachCareer()) {
    return (career?.preparations||[]).map(item=>`${item.label} · ${item.remainingMatches} 场`).join("；");
  }

  function coachMatchEffect() {
    const career=ensureCoachCareer();
    return (career?.preparations||[]).reduce((effect,item)=>({
      strength:effect.strength+Number(item.strength||0),tactical:effect.tactical+Number(item.tactical||0),possession:effect.possession+Number(item.possession||0),
      injuryFactor:effect.injuryFactor*Math.min(1,Number(item.injuryFactor||1)),youthPriorityId:effect.youthPriorityId||item.youthPriorityId||null,sources:[...effect.sources,item.label]
    }),{strength:0,tactical:0,possession:0,injuryFactor:1,youthPriorityId:null,sources:[]});
  }

  function settleCoachPreparation(result) {
    const career=ensureCoachCareer();if(!career)return;
    career.preparations.forEach(item=>item.remainingMatches=Math.max(0,Number(item.remainingMatches||0)-1));
    career.preparations=career.preparations.filter(item=>item.remainingMatches>0);
    career.boardConfidence=clamp(career.boardConfidence+(result.won?1.5:(result.draw ? .25 : -1.4)),0,100);
    career.dressingRoom=clamp(career.dressingRoom+(result.won?1.1:(result.draw ? .15 : -.9)),0,100);
    career.mediaHeat=clamp(career.mediaHeat+(result.won?-1:(result.draw ? .4 : 2.2)),0,100);
  }

  function grantCoachPreparation(choice,event) {
    const career=ensureCoachCareer(),prep=choice.preparation;if(!career||!prep)return;
    career.preparations.push({id:`coach-prep-${Date.now()}-${choice.id}`,label:`${event.title}：${choice.label}`,remainingMatches:Math.max(1,Number(prep.matches||1)),strength:Number(prep.strength||0),tactical:Number(prep.tactical||0),possession:Number(prep.possession||0),injuryFactor:Number(prep.injuryFactor||1),youthPriorityId:choice.youthPriorityId||null,createdDate:state.date});
    career.preparations=career.preparations.slice(-6);
  }

  function resolveCoachStoryChoice(choiceId) {
    const career=ensureCoachCareer(),story=career?.story;if(!story||story.status!=="active")return;
    const event=COACH_STORY_EVENTS.find(item=>item.id===story.eventId),baseChoice=event?.choices.find(item=>item.id===choiceId),choice=baseChoice?{...baseChoice,preparation:{...(baseChoice.preparation||{})}}:null;if(!event||!choice)return;
    career.boardConfidence=clamp(career.boardConfidence+Number(choice.boardConfidence||0),0,100);career.dressingRoom=clamp(career.dressingRoom+Number(choice.dressingRoom||0),0,100);career.mediaHeat=clamp(career.mediaHeat+Number(choice.mediaHeat||0),0,100);
    if(choice.fitness)state.squad.forEach(player=>{player.fitness=clamp(Number(player.fitness||75)+Number(choice.fitness),25,100);});
    if(choice.targetedRecovery)state.squad.filter(player=>player.age>=30||Number(player.fitness||100)<78).forEach(player=>{player.fitness=clamp(Number(player.fitness||75)+5,25,100);});
    if(choice.boardFunding){const funding=career.boardConfidence>=58?Math.round(6+career.boardConfidence*.16):0;state.funds+=funding;career.boardConfidence=clamp(career.boardConfidence-(funding?3:7),0,100);}
    if(choice.youthPriority){const prospect=[...state.squad].filter(player=>player.age<=21&&!player.injured).sort((a,b)=>(b.potential-b.overall)-(a.potential-a.overall)||b.potential-a.potential)[0];if(prospect){choice.youthPriorityId=prospect.id;story.detail=`你已向 ${prospect.name} 承诺明确机会；未来 3 场他会获得真实的选人优先级。`;}}
    if(choice.youthDevelopment)state.squad.filter(player=>player.age<=20).forEach(player=>{const dev=ensurePlayerDevelopment(player,state.season);dev.trainingScore=Number((Number(dev.trainingScore||0)+.8).toFixed(2));player.morale=clamp(Number(player.morale||75)+2,25,100);});
    if(choice.loanInterest){const prospect=[...state.squad].filter(player=>player.age<=21).sort((a,b)=>b.potential-a.potential)[0];if(prospect)prospect.loanInterestUntil=addDays(state.date,45);}
    grantCoachPreparation(choice,event);
    career.storyHistory.unshift({id:story.id,date:state.date,eventId:event.id,title:event.title,choice:choice.label,effect:choice.preparation?`${coachPreparationSummary(career)}`:choice.boardFunding?"董事会已评估资源请求":"球队状态已更新"});career.storyHistory=career.storyHistory.slice(0,20);career.story=null;career.nextStoryDate=addDays(state.date,11+Math.floor(stableScoutingUnit(`${state.date}|${event.id}|coach-story`)*9));
    modal=null;saveState();render();toast("教练决定已进入后续比赛与球队管理结算");
  }

  function applyCoachCareerDay(targetDate) {
    if(state.role!=="coach")return null;
    const career=ensureCoachCareer();
    if(career.story?.status==="waiting"&&career.story.nextDate<=targetDate){career.story.status="active";return {type:"coach-career",title:career.story.title,view:"home"};}
    if(!career.story&&targetDate>=career.nextStoryDate){const fixture=nextFixture(),events=COACH_STORY_EVENTS,event=events[Math.floor(stableScoutingUnit(`${targetDate}|${state.clubId}|coach-story|${career.storyHistory.length}`)*events.length)];career.story={id:`coach-story-${Date.now()}-${event.id}`,status:"active",eventId:event.id,title:event.title,detail:event.detail({fixture}),date:targetDate};return {type:"coach-career",title:event.title,view:"home"};}
    return null;
  }

  function createPlayerCareer(player,club) {
    const status=player?.overall>=club.prestige-2?"常规主力":player?.overall>=club.prestige-7?"轮换竞争":"一线队候选";
    return {
      weeklyPlan:"balanced",weeklyPlanSetDate:START_DATE,weeklyPlanChanges:0,matchPlan:"balanced",matchPlanFixtureId:null,
      trust:clamp(Math.round(58+(Number(player?.overall||65)-Number(club?.prestige||70))*.7),38,78),confidence:72,tactical:62,professionalism:68,chemistry:64,pressure:28,
      relationships:{coach:62,teammates:66,captain:60,family:76,agent:70,fans:55,media:52},status,
      lastInteractionDate:null,interactionHistory:[],conversationHistory:[],pendingIssues:[],requests:[],story:null,storyHistory:[],nextStoryDate:addDays(START_DATE,9),
      responseMomentum:0,responseMatches:0,responseSource:null,recentRatings:[],
      trainingDays:0,weeklyReportDate:START_DATE,selectionStreak:0,benchStreak:0,lastOutcome:"新赛季报到",seasonObjectives:createPlayerObjectives(player),
      objectiveProgress:{appearances:0,ratings:0,goals:0,assists:0},contractStance:"留队竞争",renewalNegotiation:null,renewalLastEvaluatedDate:null,transferOffer:null,transferOfferHistory:[],marketInterestUntil:null,selectionPushUntil:null,recoveryProtectionUntil:null,loanParentClubId:null,loanEndSeason:null,loanSearchUntil:null,signingSuggestions:[]
    };
  }

  function createPlayerObjectives(player) {
    const attacker=["ST","CF","RW","LW","AM"].includes(player?.position),creator=["CM","RM","LM","AM","RW","LW","CF"].includes(player?.position);
    return [
      {id:"appearances",label:"稳定进入比赛名单",target:player?.overall>=84?28:20,unit:"场"},
      {id:"rating",label:"保持赛季平均评分",target:6.8,unit:"评分"},
      {id:attacker?"goals":creator?"assists":"trust",label:attacker?"直接贡献进球":creator?"创造助攻":"赢得教练信任",target:attacker?10:creator?8:76,unit:attacker||creator?"次":"%"}
    ];
  }

  function ensurePlayerCareer(save=state) {
    if(!save||save.role!=="player")return null;
    const player=(save.squad||[]).find(item=>item.id===save.controlledId),club=clubById(save.clubId),base=createPlayerCareer(player,club);
    const career=save.playerCareer||(save.playerCareer={});
    Object.entries(base).forEach(([key,value])=>{if(career[key]===undefined||career[key]===null)career[key]=Array.isArray(value)?[...value]:value&&typeof value==="object"?{...value}:value;});
    career.relationships={...base.relationships,...(career.relationships||{})};
    career.interactionHistory=Array.isArray(career.interactionHistory)?career.interactionHistory:[];
    career.conversationHistory=Array.isArray(career.conversationHistory)?career.conversationHistory:[];
    career.pendingIssues=Array.isArray(career.pendingIssues)?career.pendingIssues:[];
    career.requests=Array.isArray(career.requests)?career.requests:[];
    career.storyHistory=Array.isArray(career.storyHistory)?career.storyHistory:[];
    career.transferOfferHistory=Array.isArray(career.transferOfferHistory)?career.transferOfferHistory:[];
    career.signingSuggestions=Array.isArray(career.signingSuggestions)?career.signingSuggestions:[];
    if(career.transferOffer&&typeof career.transferOffer!=="object")career.transferOffer=null;
    career.seasonObjectives=Array.isArray(career.seasonObjectives)&&career.seasonObjectives.length?career.seasonObjectives:createPlayerObjectives(player);
    career.objectiveProgress={...base.objectiveProgress,...(career.objectiveProgress||{})};
    if(career.renewalNegotiation&&typeof career.renewalNegotiation!=="object")career.renewalNegotiation=null;
    career.lastInteractions={...(career.lastInteractions||{})};
    ["trust","confidence","tactical","professionalism","chemistry","pressure"].forEach(key=>career[key]=clamp(Number(career[key]??base[key]),0,100));
    career.responseMomentum=clamp(Number(career.responseMomentum||0),0,6);career.responseMatches=clamp(Math.round(Number(career.responseMatches||0)),0,4);career.recentRatings=Array.isArray(career.recentRatings)?career.recentRatings.slice(0,5):[];
    const legacyBoosts=career.temporaryAttributeBoosts&&typeof career.temporaryAttributeBoosts==="object"?career.temporaryAttributeBoosts:{},legacyMatches=clamp(Math.round(Number(career.temporaryBoostMatches||0)),0,4);if(!Array.isArray(career.temporaryBuffs))career.temporaryBuffs=legacyMatches&&Object.values(legacyBoosts).some(value=>Number(value)>0)?[{id:"legacy-positive-buff",source:career.temporaryBoostSource||career.responseSource||"旧存档状态",boosts:{...legacyBoosts},remainingMatches:legacyMatches}]:[];syncTemporaryBuffState(career);
    Object.keys(career.relationships).forEach(key=>career.relationships[key]=clamp(Number(career.relationships[key]),0,100));
    return career;
  }

  function careerRelationshipLabel(key) {
    return ({coach:"主教练",teammates:"队友",captain:"队长",family:"亲友",agent:"经纪人",fans:"球迷",media:"媒体"})[key]||key;
  }

  function careerValueLabel(value) {
    return value>=85?"非常稳固":value>=72?"良好":value>=58?"正常":value>=42?"承压":"关系紧张";
  }

  function changePlayerCareer(changes={}) {
    const career=ensurePlayerCareer();if(!career)return;
    Object.entries(changes).forEach(([key,delta])=>{
      if(key.startsWith("relationship:")){
        const relation=key.split(":")[1];career.relationships[relation]=clamp(Number(career.relationships[relation]||50)+Number(delta||0),0,100);
      }else if(["trust","confidence","tactical","professionalism","chemistry","pressure"].includes(key))career[key]=clamp(Number(career[key]||50)+Number(delta||0),0,100);
    });
  }

  function positionalResponseBoosts(player,choice) {
    const unit=positionUnit(player.position),primary=player.position==="GK"?"goalkeeping":unit==="defence"?"defending":unit==="midfield"?"passing":["RW","LW","CF"].includes(player.position)?"dribbling":"shooting";
    const profiles={
      review:{passing:3,defending:2},extra:{[primary]:4,physical:2},coach:{passing:2,defending:2},support:{passing:2,dribbling:2,shooting:2},media:{shooting:2,physical:1}
    };
    return profiles[choice]||{[primary]:2};
  }

  function syncTemporaryBuffState(career) {
    career.temporaryBuffs=(Array.isArray(career.temporaryBuffs)?career.temporaryBuffs:[]).filter(buff=>Number(buff?.remainingMatches||0)>0&&Object.values(buff?.boosts||{}).some(value=>Number(value)>0)).slice(-8);
    const totals={};career.temporaryBuffs.forEach(buff=>Object.entries(buff.boosts||{}).forEach(([key,value])=>{totals[key]=clamp(Number(totals[key]||0)+Math.max(0,Number(value||0)),0,10);}));career.temporaryAttributeBoosts=totals;career.temporaryBoostMatches=career.temporaryBuffs.reduce((maximum,buff)=>Math.max(maximum,Number(buff.remainingMatches||0)),0);
    career.temporaryBoostSources=[...new Set(career.temporaryBuffs.map(buff=>buff.source).filter(Boolean))];career.temporaryBoostSource=career.temporaryBoostSources.length>1?`${career.temporaryBoostSources.length} 项正面状态叠加`:career.temporaryBoostSources[0]||null;return career;
  }

  function grantPerformanceResponse(choice,options={}) {
    const career=ensurePlayerCareer(),player=controlledPlayer();if(!career||!player)return;
    const labels={review:"录像复盘",extra:"专项加练",coach:"教练指导",support:"心理支持",media:"公开回应",conversation:"关键会谈"},boosts=options.boosts||positionalResponseBoosts(player,choice),matches=clamp(Number(options.matches||3),1,4),momentum=clamp(Number(options.momentum||({review:4,extra:5,coach:4.5,support:3.5,media:2.5}[choice]||2)),0,6),source=options.source||labels[choice]||"状态调整";
    career.temporaryBuffs=Array.isArray(career.temporaryBuffs)?career.temporaryBuffs:[];career.temporaryBuffs.push({id:`buff-${Date.now()}-${Math.random().toString(36).slice(2,7)}`,source,boosts:Object.fromEntries(Object.entries(boosts).filter(([,value])=>Number(value)>0).map(([key,value])=>[key,Number(value)])),remainingMatches:matches,createdDate:state.date});syncTemporaryBuffState(career);
    career.responseMomentum=Math.max(Number(career.responseMomentum||0),momentum);career.responseMatches=Math.max(Number(career.responseMatches||0),matches);career.responseSource=career.temporaryBoostSource;
  }

  function attributeBoostSummary(boosts={}) {
    const labels={pace:"速度",shooting:"射门",passing:"传球",dribbling:"盘带",defending:"防守",physical:"身体",goalkeeping:"门将技术"};
    return Object.entries(boosts).filter(([,value])=>Number(value)>0).map(([key,value])=>`${labels[key]||key} +${Number(value)}`).join(" · ");
  }

  function temporaryBoostSummary(career=ensurePlayerCareer()) {
    return attributeBoostSummary(career?.temporaryAttributeBoosts||{});
  }

  function recentPlayerAverage(career=ensurePlayerCareer()) {
    const ratings=(career?.recentRatings||[]).map(Number).filter(Number.isFinite);
    return ratings.length?ratings.reduce((sum,value)=>sum+value,0)/ratings.length:null;
  }

  function settlePerformanceResponse(career,rating,minutes) {
    if(!career||minutes<20)return;
    career.recentRatings=[Number(Number(rating||6).toFixed(2)),...(career.recentRatings||[])].slice(0,5);
    if(Number(career.responseMatches||0)>0){
      career.responseMatches=Math.max(0,Number(career.responseMatches||0)-1);
      if(rating>=7)career.responseMomentum=Math.max(0,Number(career.responseMomentum||0)-2.5);
      else if(rating>=6.4)career.responseMomentum=Number(career.responseMomentum||0)*.72;
      else career.responseMomentum=Number(career.responseMomentum||0)*.88;
      if(!career.responseMatches){career.responseMomentum=0;career.responseSource=null;}
    }
    if(career.temporaryBuffs?.length){career.temporaryBuffs.forEach(buff=>buff.remainingMatches=Math.max(0,Number(buff.remainingMatches||0)-1));syncTemporaryBuffState(career);if(career.temporaryBuffs.length)career.responseSource=career.temporaryBoostSource;}
  }

  function careerDaysSince(date) { return date?daysBetween(date,state.date):999; }

  function playerPlanTrainingMode() {
    const career=ensurePlayerCareer(),plan=PLAYER_WEEKLY_PLANS[career?.weeklyPlan]||PLAYER_WEEKLY_PLANS.balanced;return plan.training;
  }

  function renewalPerformanceScore(player,career) {
    const club=clubById(state.clubId),average=averageRating(player)||6.35,appearances=Number(player.appearances||0),minutes=Number(player.development?.minutes||appearances*72),unit=positionUnit(player.position);
    const direct=Number(player.goals||0)*(["attack","midfield"].includes(unit)?2.1:.8)+Number(player.assists||0)*(["attack","midfield"].includes(unit)?1.8:1.1);
    const defensive=(Number(player.tacklesWon||0)+Number(player.interceptions||0)+Number(player.clearances||0)*.35)/Math.max(4,appearances)*(["defence","goalkeeper"].includes(unit)?1.5:.45);
    return (Number(player.overall||65)-Number(club.prestige||70))*.85+(average-6.35)*18+Math.min(10,appearances*.45)+Math.min(6,minutes/700)+Math.min(8,direct)+Math.min(6,defensive)+(Number(career.trust||50)-55)*.18+(Number(career.professionalism||50)-55)*.08;
  }

  function renewalClubOffer(player,date=state.date) {
    const career=ensurePlayerCareer(),club=clubById(state.clubId),average=averageRating(player)||6.35,performance=renewalPerformanceScore(player,career),current=Math.max(2,Number(player.contract?.weeklyWage||player.wage||20));
    const raise=clamp(.08+Math.max(0,Number(player.overall||65)-Number(club.prestige||70))*.012+Math.max(0,average-6.45)*.11,0.06,.42),weeklyWage=Math.round(current*(1+raise));
    const role=Number(player.overall||0)>=club.prestige+4?"核心主力":Number(player.overall||0)>=club.prestige-2?"常规主力":Number(player.overall||0)>=club.prestige-7?"轮换球员":"替补球员",years=player.age<=23?4:player.age>=31?2:3;
    const offer={weeklyWage,signingBonus:Number(Math.max(.1,weeklyWage*(.035+Math.max(0,performance)*.0008)).toFixed(1)),appearanceFee:Math.max(1,Math.round(weeklyWage*.09)),releaseClause:Number(Math.max(Number(player.value||1)*1.9,Number(player.contract?.releaseClause||0)*.92).toFixed(1)),role,years};
    return {offer,performance,date};
  }

  function createRenewalNegotiation(date=state.date,source="club") {
    const career=ensurePlayerCareer(),player=controlledPlayer();if(!career||!player)return null;
    const existing=career.renewalNegotiation;if(existing&&["active","completed"].includes(existing.status))return existing;
    const proposal=renewalClubOffer(player,date),club=clubById(state.clubId),session={id:`renewal-${state.season}-${player.id}-${date}`,status:"active",round:1,clubPatience:82,createdDate:date,deadlineDate:addDays(date,28),source,clubTarget:{...proposal.offer},offer:{...proposal.offer},lastSubmitted:{...proposal.offer},history:[{round:1,speaker:club.name,text:`俱乐部提出正式续约报价：周薪 €${proposal.offer.weeklyWage}K，${proposal.offer.years} 年合同，承诺${proposal.offer.role}。`} ]};
    career.renewalNegotiation=session;career.contractStance="续约谈判中";career.renewalLastEvaluatedDate=date;
    addNotification({title:`正式续约报价：${club.name} 希望与你续约`,type:"transfer",date,detail:`俱乐部已送上完整个人条款，报价在 ${formatDate(session.deadlineDate,false)} 前有效。你可以接受、还价、拒绝或稍后处理。`,facts:[`周薪：€${proposal.offer.weeklyWage}K`,`合同：${proposal.offer.years} 年`,`角色承诺：${proposal.offer.role}`]});
    return session;
  }

  function evaluatePlayerRenewal(date=state.date,requested=false) {
    const career=ensurePlayerCareer(),player=controlledPlayer();if(!career||!player||Number(player.contract?.endSeason||state.season+2)>state.season+1)return null;
    const current=career.renewalNegotiation;if(current&&["active","completed"].includes(current.status))return current;
    if(!requested&&career.renewalLastEvaluatedDate&&daysBetween(career.renewalLastEvaluatedDate,date)<30)return null;
    career.renewalLastEvaluatedDate=date;const score=renewalPerformanceScore(player,career),threshold=4+(stableScoutingUnit(`${player.id}|renewal|${date.slice(0,7)}`)-.5)*5;
    if(requested?score>=-1:score>=threshold)return createRenewalNegotiation(date,requested?"agent":"club");
    career.contractStance="等待俱乐部报价";
    if(requested)addNotification({title:"俱乐部暂未提出续约报价",type:"transfer",date,detail:"教练组希望先观察接下来的出场时间和比赛表现。合同不会自动续签，经纪人会在表现或处境改变后再次评估。",facts:[`合同至 ${player.contract.endSeason} 年`,`教练信任：${Math.round(career.trust)}%`,`赛季评分：${(averageRating(player)||6.35).toFixed(2)}`]});
    return null;
  }

  function renewalById(id) {const session=ensurePlayerCareer()?.renewalNegotiation;return session?.id===id?session:null;}

  function renewalRoleRank(role){return ({"替补球员":0,"轮换球员":1,"常规主力":2,"核心主力":3})[role]??1;}

  function completePlayerRenewal(session) {
    const career=ensurePlayerCareer(),player=controlledPlayer(),offer=session.offer;player.contract={...(player.contract||{}),weeklyWage:Number(offer.weeklyWage),signingBonus:Number(offer.signingBonus),appearanceFee:Number(offer.appearanceFee),releaseClause:Number(offer.releaseClause),role:offer.role,endSeason:state.season+Number(offer.years)};player.wage=Number(offer.weeklyWage);
    session.status="completed";session.completedDate=state.date;session.history.push({round:session.round,speaker:"双方",text:`续约完成：合同至 ${player.contract.endSeason} 年，周薪 €${player.contract.weeklyWage}K，角色为${player.contract.role}。`});career.contractStance="续约达成";changePlayerCareer({trust:2,confidence:3,"relationship:agent":3,"relationship:coach":2});
    addNotification({title:`官方：${player.name} 完成续约`,type:"transfer",date:state.date,detail:`你已与 ${clubById(state.clubId).name} 签署新合同，全部谈判条款已经写入球员详情。`,facts:[`合同至 ${player.contract.endSeason} 年`,`周薪 €${player.contract.weeklyWage}K`,`角色承诺：${player.contract.role}`]});modal=null;saveState();render();toast("续约合同已经签署");
  }

  function acceptPlayerRenewal(id) {const session=renewalById(id);if(session?.status==="active")completePlayerRenewal(session);}

  function submitPlayerRenewalCounter(id) {
    const session=renewalById(id);if(!session||session.status!=="active")return;const number=(selector,fallback)=>Number(document.getElementById(selector)?.value??fallback),offer={weeklyWage:number("renew-wage",session.offer.weeklyWage),signingBonus:number("renew-signing",session.offer.signingBonus),appearanceFee:number("renew-appearance",session.offer.appearanceFee),releaseClause:number("renew-release",session.offer.releaseClause),role:document.getElementById("renew-role")?.value||session.offer.role,years:number("renew-years",session.offer.years)};
    if(!offer.weeklyWage||offer.signingBonus<0||offer.appearanceFee<0||offer.releaseClause<1||offer.years<1||offer.years>5)return toast("请检查合同条款");
    const target=session.clubTarget,changes=Object.keys(offer).filter(key=>String(offer[key])!==String(session.lastSubmitted?.[key])).length,wagePressure=offer.weeklyWage/Math.max(1,target.weeklyWage),bonusPressure=offer.signingBonus/Math.max(.1,target.signingBonus),feePressure=offer.appearanceFee/Math.max(1,target.appearanceFee),releasePressure=target.releaseClause/Math.max(1,offer.releaseClause),rolePressure=Math.max(0,renewalRoleRank(offer.role)-renewalRoleRank(target.role))*.14,yearsPressure=Math.max(0,offer.years-target.years)*.05;
    const demand=(wagePressure*.48+bonusPressure*.16+feePressure*.1+releasePressure*.12+rolePressure+yearsPressure),tolerance=1.03+(100-session.clubPatience)*.0007+Math.max(0,renewalPerformanceScore(controlledPlayer(),ensurePlayerCareer()))*.004;
    session.round+=1;session.offer=offer;session.lastSubmitted={...offer};session.history.push({round:session.round,speaker:"经纪人",text:`还价：周薪 €${Math.round(offer.weeklyWage)}K，${offer.years} 年，角色承诺${offer.role}，并调整奖金、津贴与解约金。`});
    if(demand<=tolerance){session.history.push({round:session.round,speaker:clubById(state.clubId).name,text:"俱乐部接受这份还价，可以立即签署合同。"});completePlayerRenewal(session);return;}
    const loss=clamp(Math.round(Math.max(4,(demand-tolerance)*70)+Math.max(0,changes-2)*3),4,38);session.clubPatience=clamp(session.clubPatience-loss,0,100);
    if(!session.clubPatience){session.status="withdrawn";session.closedReason="俱乐部因谈判分歧过大撤回报价";ensurePlayerCareer().contractStance="续约谈判破裂";session.history.push({round:session.round,speaker:clubById(state.clubId).name,text:"双方要求相距过大，俱乐部退出谈判。"});}
    else{const soften=.3,adjust=(asked,targetValue)=>Number((asked+(targetValue-asked)*soften).toFixed(1));session.offer={weeklyWage:Math.round(adjust(offer.weeklyWage,target.weeklyWage)),signingBonus:adjust(offer.signingBonus,target.signingBonus),appearanceFee:Math.round(adjust(offer.appearanceFee,target.appearanceFee)),releaseClause:adjust(offer.releaseClause,target.releaseClause),role:renewalRoleRank(offer.role)<=renewalRoleRank(target.role)?offer.role:target.role,years:Math.round(adjust(offer.years,target.years))};session.history.push({round:session.round,speaker:clubById(state.clubId).name,text:`无法接受当前要求。俱乐部给出调整后的报价，耐心剩余 ${session.clubPatience}%。`});}
    saveState();render();
  }

  function rejectPlayerRenewal(id) {const session=renewalById(id);if(!session||session.status!=="active")return;session.status="rejected";session.closedReason="你拒绝了俱乐部的续约报价";session.history.push({round:session.round,speaker:"球员",text:"拒绝续约，合同到期前将继续履行现有合同。"});const career=ensurePlayerCareer();career.contractStance="拒绝续约";career.renewalLastEvaluatedDate=state.date;changePlayerCareer({trust:-3,"relationship:coach":-2,"relationship:agent":2});modal=null;saveState();render();toast("你已拒绝续约报价");}

  function applyPlayerCareerDay(targetDate) {
    if(state.role!=="player")return null;
    const career=ensurePlayerCareer(),player=controlledPlayer(),plan=PLAYER_WEEKLY_PLANS[career.weeklyPlan]||PLAYER_WEEKLY_PLANS.balanced;if(!player)return null;
    career.trainingDays=Number(career.trainingDays||0)+1;
    if(career.renewalNegotiation?.status==="active"&&targetDate>career.renewalNegotiation.deadlineDate){career.renewalNegotiation.status="withdrawn";career.renewalNegotiation.closedReason="续约报价已经过期";career.renewalNegotiation.history.push({round:career.renewalNegotiation.round,speaker:clubById(state.clubId).name,text:"报价有效期已过，俱乐部撤回本轮续约方案。"});career.contractStance="续约报价已过期";addNotification({title:"续约报价已经过期",type:"transfer",date:targetDate,detail:"你没有在截止日前作出决定，俱乐部已经撤回报价。之后是否重启谈判将取决于合同期限和比赛表现。",facts:[`现有合同至 ${player.contract?.endSeason} 年`,`教练信任：${Math.round(career.trust)}%`]});}
    const transferOffer=career.transferOffer;
    if(transferOffer?.status==="active"&&targetDate>transferOffer.deadlineDate){transferOffer.status="expired";transferOffer.expiredDate=targetDate;career.transferOfferHistory.unshift(transferOffer);career.transferOfferHistory=career.transferOfferHistory.slice(0,20);player.transferRequestStatus=transferOffer.loan?null:"submitted";state.transferRequestsLog.forEach(item=>{if(item.id===transferOffer.id)item.status="expired";});addNotification({title:`${clubById(transferOffer.toId).name} 的${transferOffer.loan?"租借方案":"转会报价"}已过期`,type:"transfer",date:targetDate,detail:transferOffer.loan?"你没有在截止日前答复，经纪人会继续联系其他能提供比赛时间的球队。":"你没有在截止日前答复。离队申请仍然有效，经纪人会继续向其他合适俱乐部传达你的意愿。",facts:[transferOffer.loan?"形式：赛季租借":`原报价转会费：${money(transferOffer.fee)}`,`申请状态：${transferOffer.loan?"继续寻找租借球队":"市场优先推荐"}`,`当前合同至 ${player.contract?.endSeason} 年`]});}
    player.fitness=clamp(Number(player.fitness||70)+plan.fitness,25,100);
    player.morale=clamp(Number(player.morale||75)+plan.morale,25,100);
    career.trust=clamp(career.trust+plan.trust,0,100);career.tactical=clamp(career.tactical+plan.tactical,0,100);
    const relationships=career.relationships;career.trust=clamp(career.trust+(relationships.coach-50)*.0035,0,100);career.chemistry=clamp(career.chemistry+(relationships.teammates-50)*.004,0,100);career.confidence=clamp(career.confidence+(relationships.fans-50)*.002+(relationships.media-50)*.001,0,100);career.pressure=clamp(career.pressure-(relationships.family-50)*.003-(relationships.captain-50)*.0015,0,100);
    if(career.weeklyPlan==="chemistry")career.relationships.teammates=clamp(career.relationships.teammates+.22,0,100);
    const development=ensurePlayerDevelopment(player,state.season);development.trainingScore=Number((Number(development.trainingScore||0)+plan.development).toFixed(2));
    const focusAttribute=plan.attribute;if(focusAttribute)development.attributeFocus={...(development.attributeFocus||{}),[focusAttribute]:Number((development.attributeFocus?.[focusAttribute]||0)+plan.development)};
    const dueRequest=career.requests.find(item=>item.status==="pending"&&item.dueDate<=targetDate);
    if(dueRequest)return resolveCareerRequest(dueRequest,targetDate);
    const renewal=evaluatePlayerRenewal(targetDate);if(renewal?.status==="active"&&renewal.createdDate===targetDate)return {type:"player-renewal",title:"俱乐部提出正式续约报价",view:"home"};
    if(career.story&&career.story.status==="waiting"&&career.story.nextDate<=targetDate){career.story.status="active";return {type:"player-career",title:career.story.title,view:"home"};}
    if(!career.story&&targetDate>=career.nextStoryDate){startPlayerStory(targetDate);return {type:"player-career",title:career.story.title,view:"home"};}
    return null;
  }

  const PLAYER_STATE_EVENTS=[
    {id:"training-flow",when:({player})=>player.position!=="GK"&&player.fitness>=76,title:"训练场进入最佳节奏",detail:({fixture})=>`连续几组高强度对抗中，你的触球和移动明显比平时更顺。教练允许你把这股感觉带进对 ${fixture?.opponent||"下一个对手"} 的准备。`,choices:[
      {id:"one-touch",icon:"route",label:"巩固一脚出球",detail:"把比赛节奏转化为传接与摆脱优势",boosts:{passing:3,dribbling:2},matches:3,momentum:3.5,effects:{tactical:2,confidence:2},fitness:-2},
      {id:"explosive",icon:"zap",label:"强化第一步爆发",detail:"用短距离冲刺制造下一场的速度优势",boosts:{pace:4,physical:2},matches:2,momentum:4,effects:{confidence:3},fitness:-4},
      {id:"finishing-touch",icon:"target",label:"延续射门脚感",detail:"留下加练最后一击和禁区处理",boosts:{shooting:4,dribbling:1},matches:2,momentum:4.5,effects:{confidence:3,trust:1},fitness:-3}
    ]},
    {id:"keeper-clinic",when:({player})=>player.position==="GK",title:"门将教练安排专项课",detail:({fixture})=>`教练组根据 ${fixture?.opponent||"下一个对手"} 的射门习惯设计了专门训练，你可以选择最需要强化的比赛环节。`,choices:[
      {id:"keeper-reactions",icon:"scan-eye",label:"近距离反应",detail:"强化扑救反应与门线爆发",boosts:{goalkeeping:4,physical:2},matches:3,momentum:4,effects:{confidence:3},fitness:-3},
      {id:"keeper-build",icon:"send",label:"后场出球",detail:"练习受压时的传球选择与第一脚处理",boosts:{goalkeeping:2,passing:4},matches:3,momentum:3.5,effects:{tactical:3,trust:1},fitness:-2},
      {id:"keeper-sweep",icon:"shield",label:"扩大防守范围",detail:"提高出击速度和禁区控制力",boosts:{goalkeeping:3,pace:3},matches:2,momentum:4,effects:{trust:2,confidence:2},fitness:-4}
    ]},
    {id:"analyst-report",when:()=>true,title:"分析师送来个人对手报告",detail:({fixture})=>`报告拆解了 ${fixture?.opponent||"近期对手"} 的压迫方向、防线空当和二点球习惯。你只能选择一个重点带进比赛。`,choices:[
      {id:"analyst-space",icon:"route",label:"研究传球线路",detail:"提前识别压迫后的空当",boosts:{passing:4,dribbling:1},matches:2,momentum:3.5,effects:{tactical:4,trust:1}},
      {id:"analyst-transition",icon:"fast-forward",label:"研究转换瞬间",detail:"强化启动、带球和反击选择",boosts:{pace:3,dribbling:3},matches:2,momentum:4,effects:{tactical:3,confidence:2}},
      {id:"analyst-duels",icon:"shield-check",label:"研究对位弱点",detail:"针对对手惯用脚和身体方向准备攻防对抗",boosts:{defending:3,physical:3},matches:3,momentum:3,effects:{tactical:3,professionalism:2}}
    ]},
    {id:"coach-detail",when:({career,context})=>career.tactical>=62||context.decisive,title:"主教练留下你单独讲解",detail:({fixture})=>`全队训练结束后，主教练用战术板解释了对 ${fixture?.opponent||"下一个对手"} 时你这一侧的具体职责。`,choices:[
      {id:"coach-halfspace",icon:"map",label:"攻击肋部空间",detail:"理解接球角度与第三人跑位",boosts:{passing:3,dribbling:2},matches:3,momentum:3.5,effects:{tactical:4,trust:3}},
      {id:"coach-behind",icon:"move-up-right",label:"冲击防线身后",detail:"把启动时机和终结动作作为重点",boosts:{pace:3,shooting:3},matches:2,momentum:4,effects:{tactical:3,trust:2}},
      {id:"coach-balance",icon:"shield",label:"保护攻守平衡",detail:"优先提升回追、对抗和站位执行",boosts:{defending:4,physical:2},matches:3,momentum:3,effects:{tactical:4,trust:4}}
    ]},
    {id:"teammate-sync",when:({career})=>career.chemistry>=60,title:"队友提出加练配合套路",detail:({fixture})=>`同侧队友希望在对 ${fixture?.opponent||"下一个对手"} 前把几个固定信号练熟，这会直接改变你们接下来几场的场上默契。`,choices:[
      {id:"sync-wall",icon:"repeat-2",label:"练撞墙与回做",detail:"提高短传衔接和狭小空间处理",boosts:{passing:3,dribbling:3},matches:3,momentum:3.5,effects:{chemistry:4,"relationship:teammates":3}},
      {id:"sync-overlap",icon:"git-merge",label:"练交叉与套边",detail:"强化无球启动和最后一传后的前插",boosts:{pace:3,passing:2},matches:3,momentum:3.5,effects:{chemistry:4,tactical:2}},
      {id:"sync-press",icon:"users-round",label:"练协同压迫",detail:"统一上抢时机与二点球保护",boosts:{defending:3,physical:3},matches:3,momentum:3,effects:{chemistry:5,"relationship:teammates":3}}
    ]},
    {id:"captain-rally",when:({career,context})=>context.decisive||career.pressure>=42,title:"队长在关键时刻找你谈话",detail:({context})=>`${context.matchImportance}临近，队长认为你的情绪会影响发挥，希望你先确定自己在场上的心理锚点。`,choices:[
      {id:"captain-calm",icon:"waves",label:"先把比赛踢简单",detail:"用稳定处理降低压力并进入节奏",boosts:{passing:3,defending:2},matches:2,momentum:3,effects:{pressure:-6,confidence:2,"relationship:captain":3}},
      {id:"captain-lead",icon:"badge",label:"主动承担责任",detail:"在关键区域要求球并影响比赛",boosts:{shooting:3,physical:3},matches:2,momentum:4.5,effects:{confidence:5,pressure:2,trust:2}},
      {id:"captain-fight",icon:"flame",label:"把压力变成对抗",detail:"提高拼抢强度和推进侵略性",boosts:{dribbling:2,defending:2,physical:3},matches:2,momentum:4,effects:{confidence:3,"relationship:captain":3},fitness:-2}
    ]},
    {id:"family-reset",when:({career,player})=>career.pressure>=34||player.morale<80,title:"亲友帮你暂时离开足球",detail:()=>"短暂的家庭时间让你从评分、竞争和舆论中抽离出来。回到训练基地时，你可以选择怎样重新进入比赛状态。",choices:[
      {id:"reset-clear",icon:"brain",label:"清空杂念",detail:"恢复专注，让技术动作重新稳定",boosts:{passing:2,dribbling:2,shooting:2},matches:2,momentum:3.5,effects:{pressure:-8,confidence:4,"relationship:family":3},morale:4},
      {id:"reset-rest",icon:"battery-charging",label:"彻底休息一天",detail:"用身体恢复换取更好的比赛活力",boosts:{pace:2,physical:4},matches:2,momentum:3,effects:{pressure:-5},fitness:7,morale:3},
      {id:"reset-purpose",icon:"focus",label:"重新确认目标",detail:"把外界压力转化为清晰的比赛任务",boosts:{passing:2,defending:2,physical:2},matches:3,momentum:3,effects:{professionalism:3,confidence:3,pressure:-4}}
    ]},
    {id:"supporters-energy",when:({career,context})=>Boolean(context.fixture?.home)&&career.relationships.fans>=54,title:"主场球迷送来特别支持",detail:({fixture})=>`训练基地外的球迷为对 ${fixture?.opponent||"下一个对手"} 的比赛制作了横幅。你感受到期待，也必须决定如何使用这股能量。`,choices:[
      {id:"fans-entertain",icon:"sparkles",label:"用突破回应看台",detail:"主动制造一对一和推进场面",boosts:{pace:3,dribbling:4},matches:2,momentum:4,effects:{confidence:4,"relationship:fans":3}},
      {id:"fans-decisive",icon:"crosshair",label:"争取直接决定比赛",detail:"把注意力集中在最后一击",boosts:{shooting:4,physical:2},matches:2,momentum:4.5,effects:{confidence:5,pressure:2}},
      {id:"fans-work",icon:"shield-check",label:"用投入回报支持",detail:"强化跑动、对抗和防守执行",boosts:{defending:3,physical:3},matches:3,momentum:3.5,effects:{trust:2,"relationship:fans":3}}
    ]},
    {id:"media-momentum",when:({player})=>Number(player.lastRating||0)>=7,title:"出色表现带来舆论顺风",detail:({player})=>`上一场 ${Number(player.lastRating).toFixed(2)} 的评分让外界开始集中讨论你的状态。处理得当，这股势头可以延续到接下来的比赛。`,choices:[
      {id:"media-attack",icon:"target",label:"接受关键球员期待",detail:"保持侵略性，继续追求直接贡献",boosts:{shooting:4,dribbling:2},matches:2,momentum:5,effects:{confidence:5,pressure:2,"relationship:media":2}},
      {id:"media-control",icon:"scale",label:"强调稳定和控制",detail:"把好状态延续到传球与比赛阅读",boosts:{passing:4,defending:1},matches:3,momentum:3.5,effects:{professionalism:2,trust:2}},
      {id:"media-team",icon:"users",label:"把赞誉归于队友",detail:"利用更衣室支持强化场上协作",boosts:{passing:3,physical:2},matches:3,momentum:3.5,effects:{chemistry:4,"relationship:teammates":3,"relationship:media":1}}
    ]},
    {id:"recovery-breakthrough",when:({player})=>player.fitness<=82,title:"理疗团队找到恢复突破口",detail:()=>"医疗与体能团队调整了你的恢复方案，肌肉疲劳明显缓解。你可以把额外恢复资源用在一个比赛方向。",choices:[
      {id:"recovery-speed",icon:"wind",label:"恢复启动速度",detail:"优先处理下肢疲劳和短距离爆发",boosts:{pace:4,physical:2},matches:2,momentum:3.5,effects:{confidence:2},fitness:8},
      {id:"recovery-technique",icon:"circle-dot",label:"恢复触球精度",detail:"以低负荷技术训练重新建立球感",boosts:{passing:3,dribbling:3},matches:2,momentum:3,effects:{pressure:-3},fitness:6},
      {id:"recovery-contact",icon:"dumbbell",label:"恢复对抗能力",detail:"强化核心稳定与对抗保护",boosts:{defending:2,physical:4},matches:3,momentum:3,effects:{professionalism:2},fitness:5}
    ]},
    {id:"bench-spark",when:({career})=>career.benchStreak===1,title:"替补席观察带来新发现",detail:({fixture})=>`没有首发让你看清了球队进攻中的一个空档。面对 ${fixture?.opponent||"下一个对手"}，你可以提前准备一种改变局面的方式。`,choices:[
      {id:"bench-impact",icon:"zap",label:"准备替补冲击",detail:"上场后立即用速度和突破改变节奏",boosts:{pace:4,dribbling:3},matches:2,momentum:4.5,effects:{confidence:3,trust:1}},
      {id:"bench-create",icon:"route",label:"准备梳理进攻",detail:"从场边观察转化为更清楚的传球选择",boosts:{passing:4,shooting:1},matches:2,momentum:3.5,effects:{tactical:3,trust:2}},
      {id:"bench-secure",icon:"shield",label:"准备稳定局面",detail:"用防守、对抗和控球赢得教练信任",boosts:{defending:4,physical:2},matches:3,momentum:3,effects:{professionalism:2,trust:3}}
    ]},
    {id:"big-match-clarity",when:({context})=>context.decisive,title:"关键比赛前出现罕见专注感",detail:({context})=>`${context.competitionSituation}。赛前最后一次训练中，环境似乎安静下来，你对比赛的第一步行动异常清楚。`,choices:[
      {id:"bigmatch-create",icon:"eye",label:"寻找决定性传球",detail:"把专注力用于观察与创造机会",boosts:{passing:4,dribbling:2},matches:2,momentum:5,effects:{confidence:4,pressure:-2}},
      {id:"bigmatch-score",icon:"crosshair",label:"寻找决定性射门",detail:"在关键区域保持冷静和终结欲望",boosts:{shooting:5,physical:1},matches:2,momentum:5.5,effects:{confidence:5,pressure:1}},
      {id:"bigmatch-defend",icon:"shield-check",label:"先赢下每次对抗",detail:"把注意力放在站位、回追和身体对抗",boosts:{defending:4,physical:3},matches:2,momentum:4.5,effects:{trust:3,pressure:-2}}
    ]},
    {id:"contract-focus",when:({player})=>Number(player.contract?.endSeason||999)<=Number(state.season||2026)+1,title:"合同传闻开始影响训练场",detail:()=>"经纪人收到外界询问，队内也开始讨论你的未来。你需要决定让谈判噪音如何影响接下来的比赛。",choices:[
      {id:"contract-agent",icon:"briefcase",label:"让经纪人处理",detail:"扩大市场联系，同时保持场上专注",boosts:{passing:2,dribbling:2},matches:2,momentum:3,effects:{"relationship:agent":4,"relationship:coach":-1}},
      {id:"contract-professional",icon:"shield-check",label:"专注履行合同",detail:"用职业态度换取教练信任与稳定表现",boosts:{passing:2,defending:2,physical:2},matches:3,momentum:3.5,effects:{trust:3,professionalism:3}},
      {id:"contract-home",icon:"heart-handshake",label:"公开表达留队意愿",detail:"赢得球迷支持，强化主场比赛信心",boosts:{shooting:2,physical:2},matches:2,momentum:3,effects:{"relationship:fans":4,confidence:3}}
    ]},
    {id:"load-warning",when:({player,context})=>player.fitness<76||context.fixture&&daysBetween(state.date,context.fixture.date)<=3,title:"身体发出负荷预警",detail:()=>"体能团队在监测中发现疲劳指标上升。选择忽略它可能保住训练锐度，也会显著改变接下来的伤病风险。",choices:[
      {id:"load-recover",icon:"battery-charging",label:"主动恢复",detail:"提高体能并获得更可靠的伤病保护",boosts:{pace:2,physical:2},matches:2,momentum:2.5,effects:{pressure:-3},fitness:8,recoveryProtection:28},
      {id:"load-push",icon:"flame",label:"继续合练",detail:"短期提升对抗和比赛感觉，但会消耗体能",boosts:{physical:4,defending:2},matches:2,momentum:4,effects:{confidence:3},fitness:-5},
      {id:"load-manage",icon:"sliders-horizontal",label:"和教练控制负荷",detail:"保护身体并展示战术纪律",boosts:{passing:2,dribbling:2},matches:3,momentum:3,effects:{trust:3,tactical:3},fitness:4}
    ]},
    {id:"role-adjustment",when:({career})=>career.benchStreak>=1||career.tactical<65,title:"教练要求调整场上职责",detail:({fixture})=>`针对 ${fixture?.opponent||"下一个对手"} 的比赛计划，教练希望你承担不同于习惯的职责。适应速度将直接影响出场顺位。`,choices:[
      {id:"role-accept",icon:"clipboard-check",label:"接受新职责",detail:"提高战术适应与教练信任",boosts:{passing:3,defending:2},matches:3,momentum:3.5,effects:{tactical:5,trust:4}},
      {id:"role-practice",icon:"dumbbell",label:"请求专项演练",detail:"把新职责转化为个人技术提升，代价是体能",boosts:{dribbling:3,physical:3,pace:2},matches:2,momentum:4,effects:{tactical:3,professionalism:2},fitness:-3},
      {id:"role-insist",icon:"circle-dot",label:"坚持原有角色",detail:"保持个人自信，但会降低战术适配",boosts:{shooting:3,dribbling:2},matches:2,momentum:3,effects:{confidence:3,tactical:-3,"relationship:coach":-2}}
    ]}
  ];

  function eligiblePlayerStateEvents(career=ensurePlayerCareer(),player=controlledPlayer(),context=playerConversationContext()) {
    return PLAYER_STATE_EVENTS.filter(event=>event.when({career,player,context}));
  }

  function startPlayerStateEvent(date,eventId=null) {
    const career=ensurePlayerCareer(),player=controlledPlayer(),context=playerConversationContext(),eligible=eligiblePlayerStateEvents(career,player,context),event=eventId?PLAYER_STATE_EVENTS.find(item=>item.id===eventId):eligible[Math.floor(stableScoutingUnit(`${date}|${player.id}|state-event|${career.storyHistory.length}`)*eligible.length)];if(!event)return null;
    career.story={id:`state-${event.id}-${Date.now()}-${Math.random().toString(36).slice(2,6)}`,type:"state-boost",eventId:event.id,stage:1,status:"active",date,title:event.title,detail:event.detail({career,player,context,fixture:context.fixture}),nextDate:null,choices:event.choices.map(choice=>({...choice,boosts:{...choice.boosts},effects:{...(choice.effects||{})}}))};return career.story;
  }

  function startPlayerStory(date) {
    const career=ensurePlayerCareer(),player=controlledPlayer(),form=Number(player.lastRating||player.form||6.4),urgentType=career.benchStreak>=2?"selection":form<6.2?"form":player.contract?.endSeason<=state.season+1?"contract":career.trust<55?"coach":null;if(!urgentType&&stableScoutingUnit(`${date}|${player.id}|story-type`)<.76&&startPlayerStateEvent(date))return;const type=urgentType||"competition";
    const content={
      selection:["位置竞争加剧","教练组正在重新评估这个位置的出场顺序。接下来一周的态度和训练会影响轮换。"],
      form:["低迷期的回应","连续表现没有达到预期，媒体和教练组都在等待你的回应。"],
      contract:["未来需要决定","经纪人提醒你合同进入关键阶段，俱乐部正在观察你的长期态度。"],
      coach:["教练信任出现波动","主教练希望看到更稳定的战术执行，而不只是个人数据。"],
      competition:["队内竞争者状态出色","同位置队友近期训练表现很好，你需要决定如何回应竞争。"]
    }[type];
    career.story={id:`story-${Date.now()}-${Math.random().toString(36).slice(2,6)}`,type,stage:1,status:"active",date,title:content[0],detail:content[1],nextDate:null,choices:[]};
  }

  function playerStoryChoices(story) {
    const stage=Number(story?.stage||1),type=story?.type;
    if(type==="state-boost")return story.choices||[];
    if(stage===1){
      if(type==="contract")return [{id:"agent",icon:"briefcase",label:"让经纪人接触俱乐部",detail:"推动续约，但会把未来问题公开化"},{id:"wait",icon:"clock-3",label:"专注球场表现",detail:"暂不施压，用比赛赢得筹码"},{id:"exit",icon:"door-open",label:"评估离队可能",detail:"扩大市场选择，也会影响教练关系"}];
      if(type==="form")return [{id:"review",icon:"video",label:"加看比赛录像",detail:"提升战术理解并修正失误"},{id:"train",icon:"dumbbell",label:"进行额外训练",detail:"争取信任，但增加短期疲劳"},{id:"calm",icon:"heart-pulse",label:"接受心理辅导",detail:"先恢复信心和稳定性"}];
      return [{id:"compete",icon:"flame",label:"正面竞争",detail:"增加训练投入，争取教练认可"},{id:"team",icon:"handshake",label:"保持团队态度",detail:"维护更衣室关系和职业形象"},{id:"talk",icon:"message-circle",label:"与教练沟通",detail:"询问明确的改进方向"}];
    }
    return [{id:"commit",icon:"check-circle",label:"接受教练安排",detail:"稳定位置并继续兑现承诺"},{id:"demand",icon:"megaphone",label:"要求更多机会",detail:"高风险地争取出场时间"},{id:"agent",icon:"briefcase",label:"交给经纪人处理",detail:"减少正面冲突，推动职业方案"}];
  }

  function resolvePlayerStoryChoice(choice) {
    const career=ensurePlayerCareer(),story=career?.story;if(!story||story.status!=="active")return;
    if(story.type==="state-boost"){
      const selected=(story.choices||[]).find(item=>item.id===choice),player=controlledPlayer();if(!selected||!player)return;changePlayerCareer(selected.effects||{});player.fitness=clamp(Number(player.fitness||75)+Number(selected.fitness||0),25,100);player.morale=clamp(Number(player.morale||75)+Number(selected.morale||0),25,100);if(selected.recoveryProtection)career.recoveryProtectionUntil=addDays(state.date,Number(selected.recoveryProtection));grantPerformanceResponse("conversation",{boosts:selected.boosts,matches:selected.matches||2,momentum:selected.momentum||3,source:story.title});career.storyHistory.unshift({id:story.id,type:story.type,eventId:story.eventId,stage:1,date:state.date,choice,title:story.title,boosts:{...selected.boosts},matches:selected.matches||2,recoveryProtection:selected.recoveryProtection||0});career.lastOutcome=`${story.title}：${selected.label}`;career.story=null;career.nextStoryDate=addDays(state.date,14+Math.floor(stableScoutingUnit(`${state.date}|${story.eventId}|next`)*11));modal=null;saveState();render();toast("临时状态提升已生效");return;
    }
    const effects={
      review:{trust:2,tactical:4,confidence:1,professionalism:2},train:{trust:4,confidence:2,professionalism:2},calm:{confidence:6,"relationship:coach":1},
      compete:{trust:3,confidence:3,professionalism:1},team:{trust:2,"relationship:teammates":5,"relationship:captain":3},talk:{trust:2,"relationship:coach":5,tactical:2},
      wait:{trust:1,professionalism:3},exit:{trust:-4,"relationship:agent":4,"relationship:coach":-3},
      commit:{trust:4,"relationship:coach":4,professionalism:2},demand:{trust:-3,confidence:3,"relationship:coach":-5},agent:{"relationship:agent":4,"relationship:coach":-1}
    }[choice]||{};
    changePlayerCareer(effects);
    const player=controlledPlayer();if(["train","compete"].includes(choice))player.fitness=clamp(player.fitness-5,25,100);
    const responseChoices={review:{choice:"review",source:"职业事件：录像复盘"},train:{choice:"extra",source:"职业事件：额外训练"},calm:{choice:"support",source:"职业事件：心理调整"},compete:{choice:"extra",source:"位置竞争：正面竞争",matches:2,momentum:3.5},team:{choice:"support",source:"位置竞争：团队配合",matches:2,momentum:3},talk:{choice:"coach",source:"位置竞争：教练指导",matches:2,momentum:3.5}},response=responseChoices[choice];
    if(response)grantPerformanceResponse(response.choice,{source:response.source,matches:response.matches||3,momentum:response.momentum});
    if(choice==="agent"&&story.type==="contract")queueCareerRequest("contract");
    if(choice==="exit")career.contractStance="考虑离队";
    career.storyHistory.unshift({id:story.id,type:story.type,stage:story.stage,date:state.date,choice,title:story.title});
    if(story.stage===1){story.stage=2;story.status="waiting";story.nextDate=addDays(state.date,7);story.title="职业事件后续";story.detail="教练组和更衣室已经注意到你的选择，下一次沟通将决定这段事件如何收尾。";}
    else{story.status="completed";career.lastOutcome=`${story.title}已经结束`;career.story=null;career.nextStoryDate=addDays(state.date,18+Math.floor(Math.random()*15));}
    modal=null;saveState();render();toast("你的选择已经记录，后续会随时间发展");
  }

  function queueCareerRequest(type) {
    const career=ensurePlayerCareer();if(!career||career.requests.some(item=>item.type===type&&item.status==="pending"))return false;
    const labels={contract:"续约与待遇评估",loan:"外租申请",market:"市场兴趣调查"};career.requests.unshift({id:`request-${type}-${Date.now()}`,type,label:labels[type],date:state.date,dueDate:addDays(state.date,type==="market"?3:5),status:"pending"});return true;
  }

  function resolveCareerRequest(request,date) {
    const career=ensurePlayerCareer(),player=controlledPlayer(),average=averageRating(player)||6.35,club=clubById(state.clubId);request.status="resolved";request.resolvedDate=date;
    if(request.type==="contract"){
      const session=evaluatePlayerRenewal(date,true);if(session){request.outcome=`俱乐部同意开启正式续约谈判，完整报价已送达。周薪 €${session.offer.weeklyWage}K，拟签 ${session.offer.years} 年。`;changePlayerCareer({"relationship:agent":3});}
      else{career.contractStance="等待俱乐部报价";changePlayerCareer({confidence:-2,"relationship:agent":1});request.outcome="俱乐部暂时没有提出正式报价，将继续根据出场时间和表现评估。";}
    }else if(request.type==="loan"){
      const accepted=career.trust<72||player.contract?.role==="替补球员"||Number(player.appearances||0)<Math.max(4,Number(state.played||0)*.45);career.contractStance=accepted?"允许寻求外租":"留队竞争";career.loanSearchUntil=accepted?addDays(date,70):null;request.outcome=accepted?"俱乐部已批准外租并开始联系能提供比赛时间的球队；收到正式租借方案后由你决定。":"教练希望你继续留队竞争，本次外租申请被拒绝。";changePlayerCareer({trust:accepted?-2:1,"relationship:agent":2});
    }else{const interest=clamp(Math.round((player.overall-club.prestige+16)*3+(average-6.3)*18+(career.relationships.agent-50)*.18),5,94);career.marketInterestUntil=addDays(date,30);request.outcome=`经纪人已经启动为期 30 天的市场摸排，当前获得合适报价的概率约为 ${interest}%。这段时间会直接提高其他俱乐部送出正式报价的概率。`;changePlayerCareer({"relationship:agent":2});}
    addNotification({title:`经纪人：${request.label}已有结果`,type:"transfer",date,detail:request.outcome,facts:[`当前立场：${career.contractStance}`,`教练信任：${Math.round(career.trust)}%`,`赛季评分：${average.toFixed(2)}`]});
    return {type:"player-request",title:`经纪人回复：${request.label}`,view:"home"};
  }

  function canCareerAction(action) {
    const career=ensurePlayerCareer(),last=career?.lastInteractions?.[action];return !last||daysBetween(last,state.date)>=5;
  }

  function setPlayerWeeklyPlan(planId) {
    const career=ensurePlayerCareer(),plan=PLAYER_WEEKLY_PLANS[planId];if(!career||!plan)return;
    if(career.weeklyPlan===planId){modal=null;render();return;}
    if(daysBetween(career.weeklyPlanSetDate,state.date)<7&&career.weeklyPlanChanges>0)changePlayerCareer({professionalism:-2,trust:-1});
    career.weeklyPlan=planId;career.weeklyPlanSetDate=state.date;career.weeklyPlanChanges=Number(career.weeklyPlanChanges||0)+1;
    career.interactionHistory.unshift({date:state.date,type:"plan",title:`周计划改为${plan.label}`});modal=null;saveState();render();toast(`本周重点：${plan.label}`);
  }

  function setPlayerMatchPlan(planId) {
    const career=ensurePlayerCareer(),plan=PLAYER_MATCH_PLANS[planId],fixture=nextFixture();if(!career||!plan||!fixture)return;
    career.matchPlan=planId;career.matchPlanFixtureId=fixture.id;career.interactionHistory.unshift({date:state.date,type:"match-plan",title:`对阵 ${fixture.opponent}：${plan.label}`});saveState();render();toast(`比赛计划：${plan.label}`);
  }

  function resolveCareerAction(action,choice) {
    const career=ensurePlayerCareer(),player=controlledPlayer();if(!career||!player||!canCareerAction(action)){toast("这项沟通刚刚进行过，请先推进几天");return;}
    const effects={
      coach:{feedback:{trust:2,tactical:3,"relationship:coach":4},chance:{trust:-1,confidence:2,"relationship:coach":-1},role:{trust:1,"relationship:coach":2,professionalism:1}},
      training:{technical:{trust:2,professionalism:2},physical:{trust:2,confidence:2},recovery:{confidence:2,professionalism:1}},
      teammates:{mentor:{"relationship:teammates":4,"relationship:captain":4,professionalism:2},social:{"relationship:teammates":6,confidence:3},competition:{"relationship:teammates":-1,confidence:4,trust:2}},
      support:{psychology:{confidence:7,professionalism:1},captain:{confidence:3,"relationship:captain":5},media:{"relationship:fans":4,"relationship:media":4,trust:-1}},
      agent:{contract:{"relationship:agent":2},loan:{"relationship:agent":2,trust:-1},market:{"relationship:agent":3}}
    }[action]?.[choice]||{};
    changePlayerCareer(effects);
    if(action==="training"){
      player.fitness=clamp(player.fitness+(choice==="recovery"?8:choice==="physical"?-6:-4),25,100);const development=ensurePlayerDevelopment(player,state.season),technicalKey=player.position==="GK"?"goalkeeping":["CB","RB","LB","RWB","LWB","DM"].includes(player.position)?"defending":["ST","CF","RW","LW"].includes(player.position)?"shooting":"passing";development.trainingScore=Number((Number(development.trainingScore||0)+(choice==="technical"?.8:choice==="physical"?.65:.25)).toFixed(2));
      if(choice==="technical"){development.attributeFocus={...(development.attributeFocus||{}),[technicalKey]:Number((development.attributeFocus?.[technicalKey]||0)+.8)};grantPerformanceResponse("conversation",{source:"个人专项技术加练",matches:2,momentum:2.5,boosts:{[technicalKey]:3,dribbling:technicalKey==="goalkeeping"?0:1}});}
      if(choice==="physical"){development.attributeFocus={...(development.attributeFocus||{}),physical:Number((development.attributeFocus?.physical||0)+.65)};grantPerformanceResponse("conversation",{source:"个人身体强化训练",matches:2,momentum:3,boosts:{physical:3,pace:2}});}
      if(choice==="recovery"){career.recoveryProtectionUntil=addDays(state.date,7);career.pressure=clamp(career.pressure-3,0,100);}
    }
    if(action==="coach"&&choice==="chance")career.selectionPushUntil=addDays(state.date,14);
    if(action==="coach"&&choice==="role")career.selectionPushUntil=addDays(state.date,21);
    if(action==="teammates"&&choice==="mentor"){career.chemistry=clamp(career.chemistry+3,0,100);career.tactical=clamp(career.tactical+2,0,100);}
    if(action==="teammates"&&choice==="social"){career.chemistry=clamp(career.chemistry+6,0,100);player.morale=clamp(player.morale+4,0,100);}
    if(action==="teammates"&&choice==="competition"){player.fitness=clamp(player.fitness-4,25,100);grantPerformanceResponse("conversation",{source:"更衣室对抗训练",matches:2,momentum:3,boosts:{physical:2,pace:2,defending:1}});}
    if(action==="support"&&choice==="psychology")career.pressure=clamp(career.pressure-9,0,100);
    if(action==="support"&&choice==="captain")career.chemistry=clamp(career.chemistry+3,0,100);
    if(action==="support"&&choice==="media"){state.reputation=clamp(Number(state.reputation||player.overall)+1,1,99);player.morale=clamp(player.morale+2,0,100);}
    if(action==="agent")queueCareerRequest(choice);
    career.lastInteractions[action]=state.date;career.lastInteractionDate=state.date;career.interactionHistory.unshift({date:state.date,type:action,title:careerActionOutcome(action,choice)});career.lastOutcome=careerActionOutcome(action,choice);
    modal=null;saveState();render();toast(career.lastOutcome);
  }

  function careerActionOutcome(action,choice) {
    return ({feedback:"教练给出了明确的录像改进意见",chance:"你向教练表达了争取首发的态度",role:"你与教练讨论了队内定位",technical:"完成了一次专项技术加练",physical:"完成了一次身体强化训练",recovery:"完成恢复与理疗",mentor:"你参加了队长组织的小组交流",social:"你主动融入了更衣室",competition:"你在对抗训练中展示了竞争心",psychology:"心理团队帮助你重新建立比赛节奏",captain:"队长与你进行了单独沟通",media:"你接受采访并正面回应了近况",contract:"经纪人已经提交续约评估",loan:"经纪人已经提交外租申请",market:"经纪人开始调查市场兴趣"})[choice]||"职业安排已更新";
  }

  function createPerformanceIssue(rating,minutes,fixture) {
    const career=ensurePlayerCareer();if(!career)return;
    const existing=career.pendingIssues.some(item=>item.status==="open");if(existing)return;
    let type,title,detail;
    if(minutes===0&&career.benchStreak>=2){type="selection";title="连续未获出场机会";detail="你连续没有得到出场时间，需要决定如何回应教练的轮换安排。";}
    else if(minutes>0&&rating<6.15){type="poor-form";title=`${rating.toFixed(2)} 分后的回应`;detail=`对阵 ${fixture.opponent} 的表现没有达到要求。下一步行动会影响信心和教练信任。`;}
    else return;
    career.pendingIssues.unshift({id:`issue-${Date.now()}`,type,title,detail,date:fixture.date,status:"open"});
  }

  function resolvePerformanceIssue(choice) {
    const career=ensurePlayerCareer(),issue=career?.pendingIssues.find(item=>item.id===modal?.id&&item.status==="open"),player=controlledPlayer();if(!issue||!player)return;
    const effects={review:{trust:3,tactical:4,professionalism:2},extra:{trust:4,confidence:2,professionalism:2},coach:{trust:2,"relationship:coach":5,confidence:2},support:{confidence:7,"relationship:captain":2},media:{"relationship:fans":4,"relationship:media":3,trust:-2}}[choice]||{};changePlayerCareer(effects);
    grantPerformanceResponse(choice);if(choice==="extra")player.fitness=clamp(player.fitness-6,25,100);if(choice==="support")player.morale=clamp(player.morale+4,25,100);
    issue.status="resolved";issue.choice=choice;issue.resolvedDate=state.date;career.lastOutcome=careerActionOutcome(choice==="extra"?"training":"support",choice);modal=null;saveState();render();toast("恢复方案已经开始执行");
  }

  function updatePlayerCareerAfterMatch(player,rating,minutes,fixture) {
    const career=ensurePlayerCareer();if(!career||!player)return;
    const responseActive=Number(career.responseMatches||0)>0||Number(career.temporaryBoostMatches||0)>0;
    if(minutes>0){career.selectionStreak=Number(career.selectionStreak||0)+1;career.benchStreak=0;changePlayerCareer({trust:rating>=7.3?3:rating>=6.7?1:rating<6.15?-3:-1,confidence:rating>=7.3?5:rating>=6.7?2:rating<6.15?(responseActive?-3:-5):-2,professionalism:rating>=6.5?.5:0});}
    else{career.selectionStreak=0;career.benchStreak=Number(career.benchStreak||0)+1;changePlayerCareer({confidence:-1,trust:career.benchStreak>=3?-1:0});}
    const planId=fixture.playerMatchPlan||career.matchPlan,plan=PLAYER_MATCH_PLANS[planId]||PLAYER_MATCH_PLANS.balanced,upcoming=nextFixture(),strategicConserve=planId==="conserve"&&upcoming&&fixtureSelectionImportance(upcoming)>fixtureSelectionImportance(fixture)+.1,planTrust=strategicConserve?.2:plan.trust;changePlayerCareer({trust:rating>=6.5?planTrust:Math.min(0,planTrust-1),pressure:rating>=7?-2:rating<6.1?3:0,chemistry:minutes>=30&&rating>=6.5?.5:0});
    if((fixture.playerPlanTimeline||[]).length>=5)changePlayerCareer({professionalism:-1,trust:-.5});
    career.status=career.trust>=82?"核心成员":career.trust>=70?"常规主力":career.trust>=58?"轮换竞争":career.trust>=45?"替补顺位":"边缘球员";
    career.objectiveProgress={appearances:Number(player.appearances||0),ratings:Number((averageRating(player)||0).toFixed(2)),goals:Number(player.goals||0),assists:Number(player.assists||0),trust:Math.round(career.trust)};
    createPerformanceIssue(rating,minutes,fixture);
    settlePerformanceResponse(career,rating,minutes);
  }

  function weekdayLabel(date) {
    return new Date(`${date}T12:00:00`).toLocaleDateString("zh-CN",{weekday:"short"});
  }

  function ensurePlayerDevelopment(player,season=state?.season||2026) {
    player.careerStats=Array.isArray(player.careerStats)?player.careerStats:[];
    player.potentialHistory=Array.isArray(player.potentialHistory)?player.potentialHistory:[];
    if(!player.development||player.development.season!==season)player.development={season,startOverall:Number(player.overall||65),startAttributes:playerAttributeSnapshot(player),minutes:0,injuryDays:0};
    player.development.startOverall??=Number(player.overall||65);player.development.startPotential??=Number(player.potential||player.overall||65);player.development.startAttributes||=playerAttributeSnapshot(player);player.development.minutes??=0;player.development.injuryDays??=0;player.development.trainingScore??=0;player.development.attributeFocus||={};player.development.inSeasonProgress??=0;player.development.inSeasonGrowth??=0;player.development.lastProgressDate??=null;player.development.potentialAssessed??=false;
    return player.development;
  }

  function dynamicPotentialAssessment(player,save=state,options={}) {
    if(!player)return null;const season=Number(options.season??save?.season??state?.season??2026);player.potentialHistory=Array.isArray(player.potentialHistory)?player.potentialHistory:[];if(player.potentialAssessmentSeason===season)return {change:0,before:Number(player.potential||player.overall||65),after:Number(player.potential||player.overall||65)};
    const development=options.academy?null:ensurePlayerDevelopment(player,season),before=Math.max(Number(player.overall||40),Number(player.potential||player.overall||40)),age=Number(player.age||24),average=Number(player.appearances||0)>=3?averageRating(player):0,minutes=Number(options.minutes??player.development?.minutes??Number(player.appearances||0)*75),training=Number(options.trainingScore??player.development?.trainingScore??0),injuryDays=Number(options.injuryDays??player.development?.injuryDays??0),seasonGrowth=Number(player.overall||0)-Number(development?.startOverall||player.overall||0),mentorDays=Number(options.mentorDays??player.mentorshipDays??0),facilities=Number(options.facilities??0);
    let evidence=0,change=0,reason="潜力评估保持稳定";
    if(options.academy){evidence=(facilities-2)*.55+mentorDays/70+Number(player.trainingProgress||0)*.7+(Number(player.overall||0)-Number(player.development?.startOverall||player.overall||0))*.35;if(age<=17&&evidence>=2.2)change=1;else if(age<=19&&evidence>=3.8)change=1;reason=change>0?"青训培养质量与导师反馈":"青训培养轨迹";}
    else{
      const ageEvidence=age<=18?3.1:age<=20?2.6:age<=22?2.1:age<=24?1.35:age<=27?.55:0,performance=average?clamp((average-6.55)*2.7,-1.5,3.8):0,exposure=minutes>=2600?1.45:minutes>=1800?1.05:minutes>=1000?.55:minutes<350?-.8:0,trainingEvidence=clamp(training/70,0,.95)+(save?.training==="intense"?.22:save?.training==="recovery"?-.12:0),growthEvidence=clamp(seasonGrowth*.28,-1,1.5),availability=injuryDays>=120?-1.25:injuryDays>=60?-.45:0;
      evidence=ageEvidence+performance+exposure+trainingEvidence+growthEvidence+availability;
      if(age<=20&&evidence>=6.1)change=2;else if(age<=23&&evidence>=5.1)change=2;else if(age<=27&&evidence>=5.8)change=1;else if(age<=23&&evidence>=3.9)change=1;
      if(change>0)reason="高质量出场与持续成长重新上调潜力";
      if(!change&&evidence<=-1.8&&before-Number(player.overall||0)>2&&age>=22) {change=-1;reason="长期低出场、伤病或表现下滑导致潜力下调";}
    }
    const after=clamp(before+change,Number(player.overall||40),99);change=after-before;player.potential=after;player.potentialAssessmentSeason=season;if(development)development.potentialAssessed=true;const record={season,before,after,change,reason,evidence:Number(evidence.toFixed(2))};if(change){player.potentialHistory.unshift(record);player.potentialHistory=player.potentialHistory.slice(0,8);player.lastPotentialChange=record;}else if(!player.lastPotentialChange)player.lastPotentialChange=null;
    return record;
  }

  function recordPlayerDevelopment(player,minutes) {
    const development=ensurePlayerDevelopment(player,state.season);
    development.minutes=Math.round(Number(development.minutes||0)+Number(minutes||0));
  }

  function toast(message) {
    const el = document.createElement("div"); el.className="toast"; el.textContent=message;
    document.getElementById("toast-region").appendChild(el);
    setTimeout(() => el.remove(), 3200);
  }

  function busyFrame(double=false) {
    const schedule=window.requestAnimationFrame||((callback)=>setTimeout(callback,16));
    return new Promise(resolve=>schedule(()=>double?schedule(resolve):resolve()));
  }

  function updateBusyProgress(percent,detail) {
    const region=document.getElementById("busy-region");if(!region)return;
    const value=clamp(Math.round(Number(percent)||0),0,100),bar=region.querySelector(".busy-progress-value"),number=region.querySelector(".busy-percent"),stage=region.querySelector(".busy-stage");
    if(bar)bar.style.setProperty("--busy-progress",String(value/100));
    if(number)number.textContent=`${value}%`;
    if(stage&&detail)stage.textContent=detail;
  }

  function showBusyTask(title,detail,initialProgress=10) {
    const region=document.getElementById("busy-region");if(!region)return;
    region.innerHTML=`<div class="busy-panel"><div class="busy-heading"><span class="busy-spinner" aria-hidden="true"></span><div><span class="eyebrow">正在处理</span><h2>${esc(title)}</h2></div></div><p>${esc(detail)}</p><div class="busy-progress" aria-hidden="true"><span class="busy-progress-value"></span></div><div class="busy-progress-meta"><span class="busy-stage">准备数据</span><strong class="busy-percent">${initialProgress}%</strong></div></div>`;
    region.classList.add("active");region.setAttribute("aria-hidden","false");document.body.classList.add("is-busy");app.setAttribute("aria-busy","true");
    updateBusyProgress(initialProgress,"准备数据");
  }

  function hideBusyTask() {
    const region=document.getElementById("busy-region");if(region){region.classList.remove("active");region.setAttribute("aria-hidden","true");region.innerHTML="";}
    document.body.classList.remove("is-busy");app.removeAttribute("aria-busy");
  }

  async function runBusyTask(config,work) {
    if(busyTaskActive)return;
    busyTaskActive=true;const started=Date.now();showBusyTask(config.title,config.detail,config.initialProgress||10);
    try{
      await busyFrame(true);
      await work({progress:updateBusyProgress,yieldFrame:()=>busyFrame(false)});
      updateBusyProgress(100,config.completeLabel||"处理完成");
    }catch(error){console.error("耗时操作执行失败",error);toast(config.errorLabel||"处理失败，请重试");}
    finally{
      const remaining=Math.max(0,280-(Date.now()-started));if(remaining)await new Promise(resolve=>setTimeout(resolve,remaining));
      await busyFrame(false);hideBusyTask();busyTaskActive=false;
    }
  }

  function continueGameWithLoading() {
    const mode=continueActionMode(),ready=mode==="match",seasonReady=mode==="season";
    if(mode==="disabled")return;
    return runBusyTask({title:seasonReady?"正在结算赛季":ready?"正在准备比赛":"正在推进足球世界",detail:seasonReady?"归档成绩与球员成长，日期将保持不变":ready?"生成双方名单、战术与比赛环境":"同步赛程、体能、转会市场与各项赛事",completeLabel:seasonReady?"休赛期已开始":ready?"比赛准备完成":"时间推进完成"},async ({progress,yieldFrame})=>{
      progress(28,seasonReady?"结算球员发展":ready?"选择首发与替补阵容":"更新赛程与球员状态");await yieldFrame();continueGame();progress(92,seasonReady?"准备夏窗与新赛季赛程":ready?"载入比赛界面":"整理最新动态");
    });
  }

  function transferActionWithLoading(action="start") {
    const contractStage=action==="submit"&&negotiationById(modal?.id)?.stage==="contract";
    const title=action==="start"?"正在建立转会谈判":contractStage?"正在评估个人合同":"正在评估转会报价";
    const detail=action==="start"?"核对预算、球员估值和俱乐部立场":contractStage?"经纪人正在核对待遇、角色与合同条款":"出售俱乐部正在评估费用结构与附加条款";
    return runBusyTask({title,detail,completeLabel:contractStage?"合同评估完成":"谈判状态已更新"},async ({progress,yieldFrame})=>{
      progress(35,action==="start"?"建立谈判档案":"核对本轮条款");await yieldFrame();if(action==="start")confirmTransfer();else submitNegotiation();progress(92,"更新预算与谈判记录");
    });
  }

  function renderIcons() { if (window.lucide) window.lucide.createIcons(); }
  function render() {
    stopMatchClock();
    if(state?.activeMatch?.finished&&state.activeMatch.postMatchTalkDone&&!state.activeMatch.pendingTalk){finishMatch();return;}
    playerProfileRegistry=new Map();playerProfileSequence=0;
    app.innerHTML = !state ? (frontScreen==="setup"?renderSetup():renderMainMenu()) : state.activeMatch ? `${renderMatch()}${renderModal()}` : renderShell();
    bindEvents(); renderIcons();
    if(state?.activeMatch){drawMatchCanvas();startMatchClock();}
  }

  function setupIdentityId(item) { return setup.role==="coach"?item.name:item.id; }
  function setupIdentities() { return setup.role==="coach"?COACHES:REAL_PLAYERS; }
  function normalizeSetupSelection() {
    const identities=setupIdentities(),current=identities.find(item=>setupIdentityId(item)===setup.identity);
    if(setup.origin==="real"&&current){setup.clubId=current.club;setup.leagueId=clubById(current.club).league;return;}
    const eligibleClubIds=setup.origin==="real"?new Set(identities.map(item=>item.club)):new Set(CLUBS.map(club=>club.id));
    const eligibleClubs=CLUBS.filter(club=>eligibleClubIds.has(club.id));
    if(!LEAGUES[setup.leagueId]||!eligibleClubs.some(club=>club.league===setup.leagueId))setup.leagueId=eligibleClubs[0]?.league||"ENG1";
    if(!eligibleClubs.some(club=>club.id===setup.clubId&&club.league===setup.leagueId))setup.clubId=eligibleClubs.find(club=>club.league===setup.leagueId)?.id||eligibleClubs[0]?.id;
    if(setup.origin==="real")setup.identity=setupIdentityId(identities.find(item=>item.club===setup.clubId)||identities[0]);
  }

  function renderSetupBrowser(includeIdentity) {
    normalizeSetupSelection();
    const identities=setupIdentities(),eligibleClubIds=setup.origin==="real"?new Set(identities.map(item=>item.club)):new Set(CLUBS.map(club=>club.id));
    const leagueIds=Object.keys(LEAGUES).filter(id=>CLUBS.some(club=>club.league===id&&eligibleClubIds.has(club.id)));
    const clubs=CLUBS.filter(club=>club.league===setup.leagueId&&eligibleClubIds.has(club.id));
    const people=identities.filter(item=>item.club===setup.clubId),selected=people.find(item=>setupIdentityId(item)===setup.identity)||people[0],club=clubById(setup.clubId);
    const identityField=includeIdentity?`<div class="field setup-person-field"><label for="identity">选择${setup.role==="coach"?"教练":"球员"}</label><select class="select" id="identity" name="identity">${people.map(item=>`<option value="${esc(setupIdentityId(item))}" ${setupIdentityId(item)===setup.identity?"selected":""}>${esc(item.name)} · ${setup.role==="player"?`${playerRoleLabel(item.position)} · ${item.age} 岁 · `:""}能力 ${item.overall}</option>`).join("")}</select></div>`:"";
    const preview=includeIdentity&&selected?`<div class="setup-selection-preview">${clubBadge(club,"club-badge-setup")}<div><strong>${esc(selected.name)}</strong><span>${esc(club.name)} · ${LEAGUES[club.league].short}${setup.role==="player"?` · ${playerRoleLabel(selected.position)} · ${selected.age} 岁`:""}</span></div><b>${selected.overall}</b></div>`:"";
    return `<div class="setup-browser ${includeIdentity?"with-person":""}"><div class="field"><label for="setup-league">联赛</label><select class="select" id="setup-league" name="leagueId">${leagueIds.map(id=>`<option value="${id}" ${id===setup.leagueId?"selected":""}>${esc(LEAGUES[id].name)}</option>`).join("")}</select></div><div class="field"><label for="setup-club">球队</label><select class="select" id="setup-club" name="clubId">${clubs.map(item=>`<option value="${item.id}" ${item.id===setup.clubId?"selected":""}>${esc(item.name)}</option>`).join("")}</select></div>${identityField}</div>${preview}`;
  }

  function renderMainMenu() {
    const saves=loadSaveIndex();
    return `<main class="save-menu"><header class="save-menu-header"><div class="brand">${icon("circle-dot")}<span class="brand-name">Football Simulator</span><span class="version-tag">${APP_VERSION}</span></div><div><span class="eyebrow">职业足球生涯模拟</span><h1>选择你的生涯</h1><p>继续一段职业道路，或从新的更衣室重新开始。</p></div></header><section class="save-menu-panel"><div class="save-menu-title"><div><h2>本机存档</h2><span>${saves.length} 个生涯</span></div><button class="btn btn-primary" id="new-career">${icon("plus")}创建新生涯</button></div><div class="save-slot-list">${saves.map(item=>{const club=clubById(item.clubId),hasDetails=Boolean(item.person);return `<article class="save-slot"><div class="save-slot-club">${clubBadge(club,"club-badge-save")}</div><div class="save-slot-main"><span>${hasDetails?`${item.role==="coach"?"主教练":"职业球员"} · ${item.season}/${String(Number(item.season||2026)+1).slice(2)}`:"旧版生涯存档"}</span><strong>${esc(item.person||"读取旧存档")}</strong><small>${esc(item.club||club.name)}${item.date?` · ${formatDate(item.date,false)} · 已赛 ${item.played||0} 场`:""}</small></div><div class="save-slot-actions"><button class="btn btn-primary" data-load-save="${esc(item.id)}">${icon("play")}继续</button><button class="btn btn-icon btn-ghost" data-delete-save="${esc(item.id)}" title="删除存档" aria-label="删除存档">${icon("trash-2")}</button></div></article>`;}).join("")||`<div class="save-empty">${icon("folder-open")}<strong>还没有生涯存档</strong><span>创建第一段教练或球员生涯。</span></div>`}</div></section></main>`;
  }

  function renderSetup() {
    normalizeSetupSelection();
    return `<main class="setup">
      <section class="setup-visual">
        <div class="brand">${icon("circle-dot")}<span class="brand-name">Football Simulator</span><span class="version-tag">${APP_VERSION}</span></div>
        <div class="setup-copy"><h1>书写你的<br>足球人生</h1><p>从 2026 年 8 月 1 日开始，以教练或球员身份经历比赛、转会、伤病、舆论与荣誉。每一个决定都会留在你的生涯里。</p></div>
      </section>
      <section class="setup-panel">
        <form class="setup-form" id="setup-form">
          <div class="eyebrow">创建新生涯</div><h2>选择你的身份</h2><p class="setup-step">存档会保存在当前浏览器中，可随时继续。</p>
          <div class="field"><span class="field-label">游戏视角</span><div class="segmented">
            <button type="button" class="choice ${setup.role==="coach"?"active":""}" data-setup="role" data-value="coach">${icon("clipboard-list")}<strong>主教练</strong><small>管理阵容、战术、转会与球队目标</small></button>
            <button type="button" class="choice ${setup.role==="player"?"active":""}" data-setup="role" data-value="player">${icon("shirt")}<strong>职业球员</strong><small>专注表现、成长、合同与个人选择</small></button>
          </div></div>
          <div class="field"><span class="field-label">角色来源</span><div class="segmented">
            <button type="button" class="choice ${setup.origin==="real"?"active":""}" data-setup="origin" data-value="real">${icon("database")}<strong>代表性真实角色</strong><small>使用真实球队阵容与游戏估算评级</small></button>
            <button type="button" class="choice ${setup.origin==="custom"?"active":""}" data-setup="origin" data-value="custom">${icon("user-round-plus")}<strong>创建虚拟角色</strong><small>自定义姓名与起始球队</small></button>
          </div></div>
          ${setup.origin === "real" ? renderSetupBrowser(true) : `
            <div class="grid grid-2"><div class="field"><label for="custom-name">姓名</label><input class="input" id="custom-name" name="customName" maxlength="30" value="${esc(setup.customName)}" placeholder="输入角色姓名" required></div>
            ${setup.role === "player" ? `<div class="field"><label for="custom-age">起始年龄</label><input class="input" id="custom-age" name="customAge" type="number" min="16" max="40" value="${setup.customAge}"></div>` : `<div class="field"><label for="custom-age">起始年龄</label><input class="input" id="custom-age" name="customAge" type="number" min="25" max="75" value="${setup.customAge}"></div>`}</div>
            ${setup.role === "player" ? `<div class="field"><label for="custom-position">场上位置</label><select class="select" id="custom-position" name="customPosition">${POSITION_ORDER.map(p=>`<option value="${p}" ${setup.customPosition===p?"selected":""}>${p} · ${playerRoleLabel(p)}</option>`).join("")}</select></div>`:""}
            ${renderSetupBrowser(false)}`}
          <div class="data-note"><strong>数据快照：</strong>已导入懂球帝 2026-07-31 公开页面中的 ${DQD_DATA.meta.teamCount} 支球队和 ${DQD_DATA.meta.playerCount} 名球员，覆盖五大联赛一、二级。球员能力与潜力为游戏模型估算，不是懂球帝评分。</div>
          <div class="setup-actions"><button class="btn btn-primary" type="submit">${icon("play")}开始生涯</button><button class="btn" type="button" id="cancel-new-career">返回主页面</button></div>
        </form>
      </section>
    </main>`;
  }

  const NAV = [
    ["home","layout-dashboard","总览"],["squad","users","阵容"],["fixtures","calendar-days","赛程"],["world","chart-no-axes-column-increasing","联赛"],["academy","graduation-cap","青训"],["transfers","repeat-2","转会"],["media","newspaper","媒体"],["career","trophy","生涯"],["profile","user-round","角色"]
  ];

  function navButton(item) { return `<button class="nav-btn ${state.view===item[0]?"active":""}" data-view="${item[0]}">${icon(item[1])}<span>${item[2]}</span></button>`; }
  function viewTitle() { return ({home:"生涯中心",squad:"一线队",fixtures:"赛程与结果",world:"联赛中心",academy:"青训中心",transfers:"转会中心",media:"媒体中心",career:"生涯档案",profile:"角色发展"})[state.view]; }

  function renderShell() {
    const club=clubById(state.clubId),next=nextFixture(),continueMode=continueActionMode(),matchReady=continueMode==="match",seasonReady=continueMode==="season",continueNote=seasonReady?"结算本赛季并生成新赛季":matchReady?`${next.competition} · ${next.opponent}`:(state.continueStatus?.title||"推进至下一重要事件");
    return `<div class="shell">
      <aside class="sidebar"><div class="brand">${icon("circle-dot")}<span class="brand-name">FS 26</span><span class="version-tag">${APP_VERSION}</span></div><nav class="nav" aria-label="主导航">${NAV.map(navButton).join("")}</nav><div class="nav-spacer"></div><button class="nav-btn main-menu-button" id="return-main-menu">${icon("house")}<span>主页面</span></button><div class="profile-mini">${clubBadge(club,"club-badge-profile")}<div><strong>${esc(state.person)}</strong><span>${state.role==="coach"?"主教练":"职业球员"} · ${esc(club.name)}</span></div></div></aside>
      <main class="main"><header class="topbar"><div class="topbar-club">${clubBadge(club,"club-badge-topbar")}<div class="topbar-title"><h1>${viewTitle()}</h1><p>${esc(club.name)} · ${LEAGUES[club.league].short}</p></div></div><div class="topbar-actions"><button class="btn btn-icon topbar-home" id="return-main-menu-mobile" title="返回主页面" aria-label="返回主页面">${icon("house")}</button><div class="continue-date"><strong>${formatDate(state.date,false)}</strong><span>${weekdayLabel(state.date)}</span></div><button class="continue-button" id="continue-game" aria-label="${seasonReady?"进入新赛季":matchReady?"进入比赛":"继续时间"}" ${continueMode==="disabled"?"disabled":""}><span class="continue-copy"><b>${seasonReady?"新赛季":matchReady?"进入比赛":"继续"}</b><small><span class="continue-note">${esc(continueNote)}</span><span class="continue-mobile-date">${formatDate(state.date,false)} · ${weekdayLabel(state.date)}</span></small></span>${icon(seasonReady?"calendar-plus":matchReady?"play":"chevrons-right")}</button></div></header><div class="content">${renderView()}</div></main>
      <nav class="mobile-nav" aria-label="移动端主导航">${NAV.slice(0,3).map(navButton).join("")}${navButton(NAV[3])}<button class="nav-btn ${["academy","transfers","media","career","profile"].includes(state.view)?"active":""}" id="open-mobile-menu">${icon("menu")}<span>更多</span></button></nav>
      ${renderModal()}
    </div>`;
  }

  function renderView() {
    return ({ home:renderHome, squad:renderSquad, fixtures:renderFixtures, world:renderWorld, academy:renderYouthAcademy, transfers:renderTransfers, media:renderMedia, career:renderCareer, profile:renderProfile })[state.view]();
  }

  function notificationIcon(type) { return ({match:"clipboard-list",medical:"briefcase-medical",board:"landmark",schedule:"calendar-days",competition:"trophy",transfer:"arrow-right-left",youth:"graduation-cap"})[type]||"bell"; }

  function renderHome() {
    if(state.role==="player")return renderPlayerHome();
    const club=clubById(state.clubId), next=nextFixture(), p=controlledPlayer(),finance=ensureClubFinances(state),coachCareer=ensureCoachCareer(),activeCoachStory=coachCareer?.story?.status==="active"?coachCareer.story:null;
    const nextOurTeam=next?.teamName||club;
    const played=state.schedule.filter(fixture=>fixture.status==="played"&&fixture.competition===leagueOf(club).short).length;
    const unread=state.notifications.filter(item=>!item.read).length;
    return `<div class="page-heading"><span class="eyebrow">${state.season}/${String(state.season+1).slice(2)} 赛季</span><h2>${greeting()}，${esc(state.person)}</h2><p>${state.retired?"你的职业生涯已经结束，所有记录已归档。":"这里是今天最需要你处理的事项。"}</p></div>
      ${activeCoachStory?`<section class="career-alert story"><div>${icon("clipboard-pen-line")}<span><strong>${esc(activeCoachStory.title)}</strong><small>${esc(activeCoachStory.detail)}</small></span></div><button class="btn btn-primary" data-open-coach-event>作出决定</button></section>`:""}
      <section class="stats" aria-label="赛季关键数据">
        <div class="stat"><div class="stat-label">联赛排名</div><div class="stat-value">${played?state.leaguePosition:"—"}<small> / ${leagueClubNames(club.league).length}</small></div><div class="stat-context">${state.points} 分 · ${played} 场</div></div>
        <div class="stat"><div class="stat-label">${state.role==="coach"?"执教评分":"当前能力"}</div><div class="stat-value">${state.role==="coach"?state.coachProfile.overall:p.overall}</div><div class="stat-context">声望 ${state.reputation}</div></div>
        <div class="stat"><div class="stat-label">${state.role==="coach"?"转会预算":"赛季评分"}</div><div class="stat-value">${state.role==="coach"?money(state.funds):(averageRating(p)||6).toFixed(2)}</div><div class="stat-context">${state.role==="coach"?`本季经营划拨 +${money(finance.operatingAllocated||0)}`:`${p.goals} 球 · ${p.assists} 助`}</div></div>
        <div class="stat"><div class="stat-label">球队状态</div><div class="stat-value">${Math.round(state.squad.reduce((s,x)=>s+x.fitness,0)/state.squad.length)}%</div><div class="stat-context">${state.squad.filter(x=>x.injured>0).length} 名伤员</div></div>
      </section>
      <div class="grid grid-main">
        <div class="grid">
          ${next ? `<section class="panel fixture-hero"><div class="fixture-inner"><div class="fixture-meta"><span>${esc(next.competition)} · ${esc(next.round)}</span><span>${formatDate(next.date)} · 20:00</span></div><div class="fixture-teams"><div class="team-block">${clubBadge(next.home?nextOurTeam:next.opponent,"club-badge-hero")}<div class="team-name">${clubNameLink(next.home?nextOurTeam:next.opponent)}</div></div><div class="versus">VS</div><div class="team-block away">${clubBadge(next.home?next.opponent:nextOurTeam,"club-badge-hero")}<div class="team-name">${clubNameLink(next.home?next.opponent:nextOurTeam)}</div></div></div><div class="fixture-actions">${state.role==="coach"?`<div class="form-inline"><label for="tactic">赛前方案</label><select class="select" id="tactic"><option value="balanced" ${state.tactic==="balanced"?"selected":""}>平衡控制</option><option value="press" ${state.tactic==="press"?"selected":""}>高位逼抢</option><option value="counter" ${state.tactic==="counter"?"selected":""}>快速反击</option><option value="defensive" ${state.tactic==="defensive"?"selected":""}>稳守阵型</option></select></div>`:`<div class="form-inline"><label>球队战术</label><span class="tag">由主教练决定</span></div>`}<button class="btn btn-primary" id="start-match">${icon(next.date<=state.date?"play":"chevrons-right")}${next.date<=state.date?"进入比赛":"推进时间"}</button></div></div></section>` : `<section class="panel"><div class="empty">${icon("calendar-check")}<h3>赛季赛程已结束</h3><p>结算本赛季并生成下一赛季赛程。</p><button class="btn btn-primary" id="new-season">开始新赛季</button></div></section>`}
          <section class="panel"><div class="panel-header"><h3>最近动态</h3><span class="meta">实时</span></div><div class="list">${state.media.slice(0,3).map(m=>`<div class="list-row"><span class="status-dot ${m.type==="injury"?"red":m.type==="transfer"?"amber":""}"></span><div class="list-row-main"><div class="list-row-title">${esc(m.title)}</div><div class="list-row-sub">${esc(m.source)} · ${formatDate(m.date,false)}</div></div></div>`).join("")}</div></section>
        </div>
        <div class="grid">
          <section class="panel"><div class="panel-header"><h3>${state.role==="coach"?"球队焦点":"个人状态"}</h3></div><div class="panel-body">${state.role==="coach"?renderCoachFocus():renderPlayerFocus(p)}</div></section>
          <section class="panel"><div class="panel-header"><h3>待办</h3><span class="meta">${unread?`${unread} 项未读`:`${state.notifications.length} 项`}</span></div><div class="list">${state.notifications.slice(0,6).map(n=>`<button class="list-row notification-row ${n.read?"":"unread"}" data-notification="${esc(n.id)}"><div class="avatar">${icon(notificationIcon(n.type))}</div><div class="list-row-main"><div class="list-row-title">${esc(n.title)}</div><div class="list-row-sub">${n.read?"已查看":"需要查看"} · ${formatDate(n.date,false)}</div></div>${icon("chevron-right")}</button>`).join("")||`<div class="empty compact">暂无待办事项</div>`}</div></section>
        </div>
      </div>`;
  }

  function objectiveCurrent(career,player,objective) {
    if(objective.id==="rating")return Number(averageRating(player)||0);
    if(objective.id==="trust")return Math.round(career.trust);
    return Number(player[objective.id]||career.objectiveProgress?.[objective.id]||0);
  }

  function playerSelectionForecast(player,career,fixture) {
    if(!fixture)return {label:"暂无比赛",tone:"neutral",detail:"赛程尚未生成"};
    if(player.injured)return {label:"无法出场",tone:"danger",detail:`${player.injury||"伤病"} · 预计还需 ${player.injured} 天`};
    const form=Number(player.lastRating||player.form||6.35),fitness=Number(player.fitness||80),role=player.contract?.role||"轮换球员",selectionPush=career.selectionPushUntil&&state.date<=career.selectionPushUntil?3:0,coachRelationship=(Number(career.relationships?.coach||50)-50)*.045,score=(player.overall-clubById(state.clubId).prestige)*1.2+(career.trust-60)*.22+(career.tactical-60)*.08+(form-6.3)*5+(fitness-80)*.08+coachRelationship+selectionPush+({"核心主力":7,"常规主力":4,"轮换球员":1,"替补球员":-3})[role];
    if(fitness<68)return {label:"预计轮休",tone:"warn",detail:"体能尚未达到首发要求"};
    if(score>=3)return {label:"预计首发",tone:"good",detail:"当前状态和教练信任处于首发区间"};
    if(score>=-4)return {label:"替补竞争",tone:"warn",detail:"训练表现和比赛计划仍能改变顺位"};
    return {label:"名单边缘",tone:"danger",detail:"需要提升状态、信任或战术适配"};
  }

  function renderPlayerHome() {
    const player=controlledPlayer(),career=ensurePlayerCareer(),club=clubById(state.clubId),fixture=nextFixture(),continueMode=continueActionMode(),seasonReady=continueMode==="season",forecast=seasonReady?{label:"赛季结束",tone:"good",detail:"可以结算本赛季并进入下一赛季"}:playerSelectionForecast(player,career,fixture),weekly=PLAYER_WEEKLY_PLANS[career.weeklyPlan]||PLAYER_WEEKLY_PLANS.balanced,renewal=career.renewalNegotiation,transferOffer=career.transferOffer?.status==="active"?career.transferOffer:null;
    const currentMatchPlan=career.matchPlanFixtureId===fixture?.id?career.matchPlan:"balanced",openIssue=career.pendingIssues.find(item=>item.status==="open"),activeStory=career.story?.status==="active"?career.story:null,pendingRequests=career.requests.filter(item=>item.status==="pending");
    const recentAverage=recentPlayerAverage(career),seasonAverage=player.appearances?(averageRating(player)||6):null,responseActive=career.responseMatches>0&&career.temporaryBoostMatches>0,responseSummary=temporaryBoostSummary(career);
    const fitness=Math.round(Number(player.fitness||0)),fitnessTone=fitness<60?"danger":fitness<78?"warn":"good",fitnessLabel=player.injured?"伤病恢复中":fitness>=90?"状态充沛":fitness>=78?"体力良好":fitness>=68?"可以出场":"建议恢复";
    const contact=(id,detail)=>{const item=CONVERSATION_CONTACTS[id],last=career.lastInteractions[`conversation:${id}`],available=!last||daysBetween(last,state.date)>=3;return `<button class="career-command" data-conversation="${id}" ${available?"":"disabled"}>${icon(item.icon)}<span><strong>${item.label}</strong><small>${available?detail:"刚刚交流过，过几天再谈"}</small></span>${icon("message-circle")}</button>`;};
    return `<div class="player-command-heading"><div><span class="eyebrow">${state.season}/${String(state.season+1).slice(2)} · 球员生涯</span><h2>${esc(player.name)}</h2><p>${clubNameLink(club.name)} · ${playerRoleLabel(player.position)} · ${career.status}</p></div><div class="player-heading-metrics"><div class="player-overall"><span>当前能力</span><strong>${player.overall}</strong></div><div class="player-fitness-summary ${fitnessTone}"><span>体力</span><strong>${fitness}%</strong><i><b style="width:${fitness}%"></b></i><small>${fitnessLabel}</small></div></div></div>
      <section class="player-status-strip player-status-six" aria-label="个人关键状态"><div><span>教练信任</span><strong>${Math.round(career.trust)}%</strong><i><b style="width:${career.trust}%"></b></i></div><div><span>比赛信心</span><strong>${Math.round(career.confidence)}%</strong><i><b style="width:${career.confidence}%"></b></i></div><div><span>战术理解</span><strong>${Math.round(career.tactical)}%</strong><i><b style="width:${career.tactical}%"></b></i></div><div><span>队友默契</span><strong>${Math.round(career.chemistry)}%</strong><i><b style="width:${career.chemistry}%"></b></i></div><div><span>心理压力</span><strong>${Math.round(career.pressure)}%</strong><i><b class="pressure" style="width:${career.pressure}%"></b></i></div><div><span>${recentAverage!==null?"近五场评分":"赛季评分"}</span><strong>${(recentAverage??seasonAverage)?.toFixed(2)||"—"}</strong><small>${recentAverage!==null?`赛季 ${seasonAverage?.toFixed(2)||"—"} · `:""}${player.appearances||0} 场 · ${player.goals||0} 球 · ${player.assists||0} 助</small></div></section>
      ${renewal?.status==="active"?`<section class="career-alert renewal"><div>${icon("file-signature")}<span><strong>${esc(club.name)} 已提出正式续约报价</strong><small>周薪 €${Math.round(renewal.offer.weeklyWage)}K · ${renewal.offer.years} 年 · ${esc(renewal.offer.role)} · ${formatDate(renewal.deadlineDate,false)} 前回复</small></span></div><button class="btn btn-primary" data-open-renewal="${renewal.id}">谈判</button></section>`:""}
      ${transferOffer?`<section class="career-alert renewal"><div>${icon("repeat-2")}<span><strong>${esc(clubById(transferOffer.toId).name)} 送来正式${transferOffer.loan?"租借方案":"转会报价"}</strong><small>${transferOffer.loan?"赛季租借 · 原合同继续":`转会费 ${money(transferOffer.fee)} · 周薪 €${Math.round(transferOffer.contract.weeklyWage)}K · ${transferOffer.contract.years} 年`} · ${esc(transferOffer.contract.role)} · ${formatDate(transferOffer.deadlineDate,false)} 前回复</small></span></div><button class="btn btn-primary" data-open-player-transfer-offer="${transferOffer.id}">查看方案</button></section>`:""}
      ${responseActive?`<section class="career-alert recovery"><div>${icon("trending-up")}<span><strong>${esc(career.responseSource||"状态调整")}正在转化为比赛状态</strong><small>${esc(responseSummary)} · 剩余 ${Math.min(career.responseMatches,career.temporaryBoostMatches)} 场有效出场${recentAverage!==null?` · 近期均分 ${recentAverage.toFixed(2)}`:""}</small></span></div><b class="response-momentum">状态动量 ${Number(career.responseMomentum||0).toFixed(1)}</b></section>`:""}
      ${(openIssue||activeStory)?`<section class="career-alert ${openIssue?"urgent":"story"}"><div>${icon(openIssue?"triangle-alert":"radio")}<span><strong>${esc((openIssue||activeStory).title)}</strong><small>${esc((openIssue||activeStory).detail)}</small></span></div><button class="btn btn-primary" data-open-career-event="${openIssue?`issue:${openIssue.id}`:"story"}">处理</button></section>`:""}
      <div class="player-command-grid">
        <div class="player-command-main">
          <section class="panel player-next-match"><div class="panel-header"><div><span class="eyebrow">${seasonReady?"赛季结算":"下一场比赛"}</span><h3>${fixture?`${esc(fixture.competition)} · ${esc(fixture.opponent)}`:seasonReady?`${state.season}/${String(state.season+1).slice(2)} 赛季已结束`:"赛季等待中"}</h3></div><span class="selection-forecast ${forecast.tone}">${forecast.label}</span></div><div class="player-match-brief"><div>${clubBadge(club,"club-badge-command")}<span><small>${fixture?formatDate(fixture.date):seasonReady?"全部比赛已完成":"—"}</small><strong>${fixture?`${fixture.home?"主场":"客场"} 对阵 ${esc(fixture.opponent)}`:seasonReady?"准备进入下一赛季":"暂无待赛比赛"}</strong><em>${esc(forecast.detail)}</em></span></div></div>${fixture?`<div class="match-plan-picker"><div><strong>个人比赛计划</strong><span>计划会影响场上属性、风险和体能消耗</span></div><div class="match-plan-options">${Object.entries(PLAYER_MATCH_PLANS).map(([id,plan])=>`<button class="${currentMatchPlan===id?"active":""}" data-match-plan="${id}" title="${esc(plan.summary)}">${icon(plan.icon)}<span>${plan.label}</span></button>`).join("")}</div></div>`:""}<div class="player-match-actions"><button class="btn btn-primary" id="start-match" ${continueMode==="disabled"?"disabled":""}>${icon(seasonReady?"calendar-plus":fixture?.date<=state.date?"play":"chevrons-right")}${seasonReady?"开始新赛季":fixture?.date<=state.date?"进入比赛":"推进至比赛或重要事件"}</button></div></section>
          <section class="panel career-actions-panel"><div class="panel-header"><div><h3>人物交流</h3><span class="meta">每次会谈都会结合当前赛季处境</span></div></div><div class="career-command-list conversation-contacts">${contact("coach","理解战术、讨论机会与比赛负荷")}${contact("teammate","约定跑位信号并提升场上默契")}${contact("captain","了解更衣室并处理关键比赛压力")}${contact("family","谈生活、压力与职业未来")}${contact("media","回应表现、球队目标与外界质疑")}${contact("agent","讨论合同、转会市场与职业策略")}</div></section>
          <section class="panel career-objectives-panel"><div class="panel-header"><h3>赛季个人目标</h3><span class="meta">表现、出场与发展共同结算</span></div><div class="career-objectives">${career.seasonObjectives.map(objective=>{const current=objectiveCurrent(career,player,objective),progress=clamp(current/objective.target*100,0,100);return `<div><span><strong>${esc(objective.label)}</strong><small>${objective.id==="rating"?current.toFixed(2):Math.round(current)} / ${objective.target}${objective.unit}</small></span><i><b style="width:${progress}%"></b></i></div>`;}).join("")}</div></section>
        </div>
        <aside class="player-command-side">
          <section class="panel weekly-plan-panel"><div class="panel-header"><h3>本周重点</h3><button class="btn btn-sm" data-open-player-modal="weeklyPlan">${icon("pencil")}调整</button></div><div class="weekly-plan-current">${icon(weekly.icon)}<div><strong>${weekly.label}</strong><p>${weekly.summary}</p><small>已执行 ${career.trainingDays||0} 个训练日</small></div></div></section>
          <section class="panel relationships-panel"><div class="panel-header"><h3>职业关系</h3><span class="meta">实时变化</span></div><div class="relationship-list">${Object.entries(career.relationships).map(([key,value])=>`<div><span>${careerRelationshipLabel(key)}<small>${careerValueLabel(value)}</small></span><strong>${Math.round(value)}</strong><i><b style="width:${value}%"></b></i></div>`).join("")}</div></section>
          <section class="panel agent-status-panel"><div class="panel-header"><h3>经纪人与未来</h3><span class="meta">${career.contractStance}</span></div><div class="agent-status"><div><span>合同到期</span><strong>${player.contract?.endSeason||state.season+2}</strong></div><div><span>队内角色</span><strong>${esc(player.contract?.role||"轮换球员")}</strong></div>${pendingRequests.length?`<p>${icon("clock-3")} ${pendingRequests.map(item=>`${item.label} · ${formatDate(item.dueDate,false)} 前回复`).join("；")}</p>`:`<p>${icon("check")} 当前没有等待中的经纪事务</p>`}</div></section>
          <section class="panel career-log-panel"><div class="panel-header"><h3>最近会谈与决定</h3></div><div class="career-log">${career.conversationHistory.slice(0,3).map(item=>`<div><time>${formatDate(item.date,false)}</time><span><strong>${esc(item.person)}</strong><small>${esc(item.context)}</small></span></div>`).join("")}${career.interactionHistory.filter(item=>item.type!=="conversation").slice(0,3).map(item=>`<div><time>${formatDate(item.date,false)}</time><span>${esc(item.title)}</span></div>`).join("")||(!career.conversationHistory.length?`<div class="empty compact">会谈和职业决定会记录在这里</div>`:"")}</div></section>
        </aside>
      </div>`;
  }

  function greeting() { const h=new Date().getHours(); return h<11?"早上好":h<18?"下午好":"晚上好"; }
  function renderCoachFocus() {
    const fit=[...state.squad].sort((a,b)=>a.fitness-b.fitness).slice(0,2),career=ensureCoachCareer(),preparations=coachPreparationSummary(career)||"暂无持续比赛准备";
    return `<div class="attribute-grid">${[["董事会信任",career.boardConfidence],["更衣室",career.dressingRoom],["媒体压力",100-career.mediaHeat]].map(([label,value])=>`<div class="attribute"><label>${label}</label><strong>${Math.round(value)}%</strong><div class="meter ${value<45?"danger":value<65?"warn":""}"><span style="width:${value}%"></span></div></div>`).join("")}</div><div class="data-note">当前比赛准备：${esc(preparations)}</div><div class="timeline">${fit.map(p=>`<div class="timeline-item"><span class="timeline-mark"></span><time>体能 ${p.fitness}%</time><strong>${esc(p.name)}</strong><p>${p.injured?`${esc(p.injury)} · 预计缺阵 ${p.injured} 天`:"体能偏低，下一场建议控制出场时间。"}</p></div>`).join("")}</div>`;
  }
  function renderPlayerFocus(p) {
    return `<div class="attribute-grid">${[["当前能力",p.overall],["潜力",p.potential],["体能",p.fitness],["士气",p.morale]].map(([k,v])=>`<div class="attribute"><label>${k}</label><strong>${k==="体能"||k==="士气"?`${Math.round(v)}%`:v}</strong><div class="meter ${v<60?"danger":v<78?"warn":""}"><span style="width:${v}%"></span></div></div>`).join("")}</div>`;
  }

  const SQUAD_SORT_OPTIONS=[["position","位置"],["name","姓名"],["age","年龄"],["overall","当前能力"],["potential","潜力"],["appearances","出场"],["goals","进球"],["assists","助攻"],["average","场均评分"],["fitness","体能"],["value","身价"]];
  function squadSortValue(player,key) {
    if(key==="average")return averageRating(player);
    if(key==="position")return positionSortRank(player.position);
    if(key==="name")return player.name||"";
    return Number(player[key]||0);
  }
  function sortedSquad() {
    const sort=state.squadSort||{key:"position",direction:"asc"},direction=sort.direction==="desc"?-1:1;
    return [...state.squad].sort((a,b)=>{
      const left=squadSortValue(a,sort.key),right=squadSortValue(b,sort.key);
      const result=typeof left==="string"?left.localeCompare(right,"zh-CN"):(left-right);
      return result*direction||a.name.localeCompare(b.name,"zh-CN");
    });
  }
  function sortHeader(label,key,className="") {
    const active=state.squadSort?.key===key,direction=state.squadSort?.direction||"asc";
    return `<button class="sort-button ${active?"active":""} ${className}" data-squad-sort="${key}" aria-label="按${label}排序">${label}${active?icon(direction==="asc"?"arrow-up":"arrow-down"):""}</button>`;
  }

  function renderSquad() {
    const query=(state.squadSearch||"").trim().toLowerCase(),players=sortedSquad(),visibleCount=players.filter(player=>!query||player.name.toLowerCase().includes(query)).length;
    const sort=state.squadSort||{key:"position",direction:"asc"};
    return `<div class="page-heading"><span class="eyebrow">球队管理</span><h2>${state.role==="coach"?"一线队阵容":"队友与竞争"}</h2><p>能力、体能、状态和伤病会共同影响教练的用人。</p></div>
      <div class="filterbar"><input class="input" id="squad-search" placeholder="搜索球员" value="${esc(state.squadSearch||"")}"><select class="select" id="training"><option value="recovery" ${state.training==="recovery"?"selected":""}>恢复训练</option><option value="balanced" ${state.training==="balanced"?"selected":""}>平衡训练</option><option value="intense" ${state.training==="intense"?"selected":""}>高强度训练</option></select><div class="squad-sort-controls"><select class="select" id="squad-sort-select" aria-label="阵容排序字段">${SQUAD_SORT_OPTIONS.map(([key,label])=>`<option value="${key}" ${sort.key===key?"selected":""}>按${label}排序</option>`).join("")}</select><button class="btn btn-icon" id="squad-sort-direction" aria-label="切换排序方向" title="切换排序方向">${icon(sort.direction==="asc"?"arrow-up":"arrow-down")}</button></div></div>
      <section class="panel"><div class="panel-header"><h3>注册阵容</h3><span class="meta" id="squad-count">${visibleCount===state.squad.length?`${state.squad.length} 名球员`:`显示 ${visibleCount} / ${state.squad.length}`}</span></div><div class="table-wrap"><table><thead><tr><th>${sortHeader("球员","name")}</th><th>${sortHeader("位置","position")}</th><th class="num">${sortHeader("年龄","age","num")}</th><th class="num"><span class="sort-pair">${sortHeader("能力","overall","num")}<span>/</span>${sortHeader("潜力","potential","num")}</span></th><th class="num">${sortHeader("出场","appearances","num")}</th><th class="num">${sortHeader("进球","goals","num")}</th><th class="num">${sortHeader("助攻","assists","num")}</th><th class="num">${sortHeader("场均评分","average","num")}</th><th>${sortHeader("体能","fitness")}</th><th class="num hide-mobile">${sortHeader("身价","value","num")}</th><th>情况</th></tr></thead><tbody id="squad-body">${players.map(player=>playerRow(player,Boolean(query&&!player.name.toLowerCase().includes(query)))).join("")}</tbody></table></div></section>`;
  }
  function playerRow(p,hidden=false) {
    const average = p.appearances ? averageRating(p).toFixed(2) : "—";
    return `<tr data-player-name="${esc(p.name.toLowerCase())}" ${hidden?"hidden":""}><td class="player-name"><strong>${p.id==="controlled"?"★ ":""}${playerNameLink(p,{clubId:state.clubId,clubName:clubById(state.clubId).name})}</strong><span>${p.number?`#${p.number} · `:""}${esc(p.nationality||"一线队")}</span></td><td><span class="tag">${playerRoleLabel(p.position)}</span></td><td class="num">${p.age}</td><td class="num"><span class="rating">${p.overall}</span> / ${p.potential}</td><td class="num">${p.appearances}</td><td class="num">${p.goals}</td><td class="num">${p.assists}</td><td class="num">${average}</td><td><div class="fitness-cell"><div class="meter ${p.fitness<60?"danger":p.fitness<78?"warn":""}"><span style="width:${p.fitness}%"></span></div><strong>${Math.round(p.fitness)}%</strong></div></td><td class="num hide-mobile">${money(p.value)}</td><td>${p.injured?`<span class="tag red">${esc(p.injury)}</span>`:`<span class="tag green">可出场</span>`}</td></tr>`;
  }

  function academyMentorCandidates(prospect) {
    return state.squad.filter(player=>player.id!==state.controlledId||Number(player.age||0)>=23).filter(player=>Number(player.age||0)>=23&&positionUnit(player.position)===positionUnit(prospect.position)&&Number(player.overall||0)>=Number(prospect.overall||0)+8).sort((a,b)=>(b.overall+b.age*.12)-(a.overall+a.age*.12)).slice(0,8);
  }

  function signYouthProspect(id) {
    if(state.role!=="coach")return;const {academy}=ensureYouthSystem(),player=academy.prospects.find(item=>item.id===id&&item.status==="trial");if(!player)return;if(academy.prospects.filter(item=>item.status==="academy").length>=20){toast("学院注册名额已满，请先晋升或放弃其他球员");return;}player.status="academy";player.signedDate=state.date;academy.currentIntake.signed=Number(academy.currentIntake.signed||0)+1;const history=academy.intakeHistory.find(item=>item.year===academy.currentIntake.year);if(history)history.signed=academy.currentIntake.signed;saveState();render();toast(`${player.name} 已签入青训学院`);
  }

  function releaseYouthProspect(id) {
    if(state.role!=="coach")return;const {academy}=ensureYouthSystem(),player=academy.prospects.find(item=>item.id===id);if(!player)return;academy.prospects=academy.prospects.filter(item=>item.id!==id);if(player.status==="academy"&&academy.currentIntake?.playerIds?.includes(player.id)){academy.currentIntake.signed=Math.max(0,Number(academy.currentIntake.signed||0)-1);const history=academy.intakeHistory.find(item=>item.year===academy.currentIntake.year);if(history)history.signed=academy.currentIntake.signed;}saveState();render();toast(`${player.name} 已离开青训营`);
  }

  function graduateYouthPlayer(save,academy,player,date) {
    const graduate={...player,status:undefined,number:null,joinedDate:date,academyGraduate:true,mentorHistory:player.mentorName?[{name:player.mentorName,days:player.mentorshipDays||0}]:[],consecutiveStarts:0,lastMatchMinutes:0,lastMatchDate:null,lastSelectionStatus:null};delete graduate.mentorId;delete graduate.mentorName;ensurePlayerDevelopment(graduate,save.season);ensurePlayerContract(graduate,save.season);graduate.contract={...graduate.contract,weeklyWage:Math.max(2,Math.round(graduate.overall*.035)),role:"一线队候选",endSeason:save.season+3};save.squad.push(graduate);initializePlayerMarketValue(graduate,save,date);academy.prospects=academy.prospects.filter(item=>item.id!==player.id);academy.promotions.unshift({id:graduate.id,name:graduate.name,date,age:graduate.age,overall:graduate.overall,position:graduate.position});academy.promotions=academy.promotions.slice(0,30);return graduate;
  }

  function promoteYouthProspect(id) {
    if(state.role!=="coach")return;const {academy}=ensureYouthSystem(),player=academy.prospects.find(item=>item.id===id&&item.status==="academy");if(!player)return;if(player.age<16){toast("球员年满 16 岁后才能签署一线队合同");return;}if(state.squad.length>=32){toast("一线队阵容已达 32 人，请先清理名额");return;}
    const graduate=graduateYouthPlayer(state,academy,player,state.date);addNotification({title:`青训晋升：${graduate.name} 进入一线队`,type:"youth",date:state.date,detail:"青训球员已经签署职业合同并加入一线队，他将参与正常的训练、轮换和比赛发展。",facts:[`${playerRoleLabel(graduate.position)} · ${graduate.age} 岁`,`当前能力：${graduate.overall}`,`青训评估潜力：${scoutedPotentialRange(graduate,academy)}`,graduate.mentorHistory.length?`导师：${graduate.mentorHistory[0].name}，共同训练 ${graduate.mentorHistory[0].days} 天`:"尚未建立导师关系"]});saveState();render();toast(`${graduate.name} 已晋升一线队`);
  }

  function assignYouthMentor(prospectId,mentorId) {
    if(state.role!=="coach")return;const {academy}=ensureYouthSystem(),prospect=academy.prospects.find(item=>item.id===prospectId&&item.status==="academy"),mentor=state.squad.find(item=>item.id===mentorId);if(!prospect||!mentor||!academyMentorCandidates(prospect).some(item=>item.id===mentor.id))return;prospect.mentorId=mentor.id;prospect.mentorName=mentor.name;prospect.mentorAssignedDate=state.date;saveState();render();toast(`${mentor.name} 将担任 ${prospect.name} 的导师`);
  }

  function upgradeYouthArea(area) {
    if(state.role!=="coach"||!["facilities","recruitment"].includes(area))return;const {academy}=ensureYouthSystem(),level=Number(academy[area]||1);if(level>=5){toast("该项目已经达到最高等级");return;}const next=level+1,cost=YOUTH_UPGRADE_COSTS[area][next];if(state.funds<cost){toast(`预算不足，升级需要 ${money(cost)}`);return;}state.funds=Number((state.funds-cost).toFixed(2));academy[area]=next;academy.upgrades.unshift({area,level:next,cost,date:state.date});addNotification({title:`青训${area==="facilities"?"设施":"招募网络"}升级至 ${next} 级`,type:"youth",date:state.date,detail:area==="facilities"?"更好的训练场、医疗支持和住宿条件会提高青年球员的起始能力与成长速度。":"更广的球探覆盖会提高海外苗子比例，并增加发现高潜力球员的机会。",facts:[`投入：${money(cost)}`,`当前部门综合评分：${youthDepartmentScore(academy)}/100`]});saveState();render();toast(`青训${area==="facilities"?"设施":"招募网络"}已升级`);
  }

  function youthProspectCard(player,academy,trial=false) {
    const mentors=trial?[]:academyMentorCandidates(player),mentor=player.mentorId?state.squad.find(item=>item.id===player.mentorId):null,currentUncertainty=clamp(Math.round(8-(academy.director.judgingAbility-50)/10),2,8),currentRange=`${clamp(player.overall-currentUncertainty,35,95)}–${clamp(player.overall+currentUncertainty,40,97)}`;
    return `<article class="youth-player"><div class="youth-player-main"><div class="academy-avatar">${initials(player.name)}</div><div><strong>${esc(player.name)}</strong><span>${esc(player.nationality)} · ${playerRoleLabel(player.position)} · ${player.age} 岁</span></div></div><div class="youth-estimates"><span>当前能力 <b>${currentRange}</b></span><span>潜力评估 <b>${scoutedPotentialRange(player,academy)}</b></span></div>${trial?`<div class="youth-actions">${state.role==="coach"?`<button class="btn btn-sm btn-primary" data-sign-youth="${esc(player.id)}">${icon("file-signature")}签入学院</button><button class="btn btn-sm" data-release-youth="${esc(player.id)}">放弃</button>`:`<span class="tag">教练组评估中</span>`}</div>`:`<div class="youth-mentor"><div><span>导师</span><strong>${mentor?esc(mentor.name):"尚未指定"}</strong><small>${mentor?`共同训练 ${player.mentorshipDays||0} 天 · 成长加速生效`:`选择同位置资深球员可提高发展速度`}</small></div>${state.role==="coach"&&mentors.length?`<select class="select" id="mentor-${esc(player.id)}">${mentors.map(item=>`<option value="${esc(item.id)}" ${player.mentorId===item.id?"selected":""}>${esc(item.name)} · ${item.age} 岁 · ${item.overall}</option>`).join("")}</select><button class="btn btn-sm" data-assign-mentor="${esc(player.id)}">${icon("users-round")}指定</button>`:""}</div><div class="youth-actions">${state.role==="coach"?`<button class="btn btn-sm btn-primary" data-promote-youth="${esc(player.id)}" ${player.age<16?"disabled":""}>${icon("arrow-up-circle")}晋升一线队</button><button class="btn btn-sm" data-release-youth="${esc(player.id)}">放弃培养</button>`:`<span class="tag green">学院培养中</span>`}</div>`}</article>`;
  }

  function renderYouthAcademy() {
    const club=clubById(state.clubId),{academy,world}=ensureYouthSystem(),trialists=academy.prospects.filter(player=>player.status==="trial"),signed=academy.prospects.filter(player=>player.status==="academy"),dateParts=state.date.split("-").map(Number),nextYear=(dateParts[1]<3||(dateParts[1]===3&&dateParts[2]<15))?dateParts[0]:dateParts[0]+1,nextIntake=`${nextYear}-03-15`,score=youthDepartmentScore(academy),facilityNext=academy.facilities<5?YOUTH_UPGRADE_COSTS.facilities[academy.facilities+1]:0,recruitmentNext=academy.recruitment<5?YOUTH_UPGRADE_COSTS.recruitment[academy.recruitment+1]:0,global=world.prospects.filter(player=>player.clubId!==state.clubId).slice(0,8);
    return `<div class="page-heading academy-heading"><span class="eyebrow">Youth Academy · ${state.season}/${String(state.season+1).slice(2)}</span><h2>青训中心</h2><p>设施、人力、国家足球底蕴与导师关系共同决定青年球员的产出和成长。</p></div>
      <section class="academy-overview"><div class="academy-score"><span>部门综合评分</span><strong>${score}</strong><small>/ 100</small></div><div><span>下次选拔日</span><strong>${formatDate(nextIntake)}</strong><small>${Math.max(0,daysBetween(state.date,nextIntake))} 天后</small></div><div><span>学院人数</span><strong>${signed.length}</strong><small>上限 20 人</small></div><div><span>本届试训</span><strong>${trialists.length}</strong><small>${academy.currentIntake?`${academy.currentIntake.year} 届`:`等待 3 月 15 日`}</small></div></section>
      <div class="academy-department-grid"><section class="panel academy-department"><div class="panel-header"><h3>青训设施</h3><span class="academy-level">${academy.facilities} / 5</span></div><div class="academy-level-track">${[1,2,3,4,5].map(level=>`<i class="${level<=academy.facilities?"active":""}"></i>`).join("")}</div><p>决定试训球员的起始能力，并持续提高学院训练成长速度。</p>${state.role==="coach"&&academy.facilities<5?`<button class="btn btn-sm" data-upgrade-youth="facilities">${icon("building-2")}升级至 ${academy.facilities+1} 级 · ${money(facilityNext)}</button>`:`<span class="tag green">${academy.facilities===5?"已达最高等级":"由俱乐部管理"}</span>`}</section>
      <section class="panel academy-department"><div class="panel-header"><h3>招募网络</h3><span class="academy-level">${academy.recruitment} / 5</span></div><div class="academy-level-track">${[1,2,3,4,5].map(level=>`<i class="${level<=academy.recruitment?"active":""}"></i>`).join("")}</div><p>扩大海外覆盖范围，提高发现不同国家高潜力球员的概率。</p>${state.role==="coach"&&academy.recruitment<5?`<button class="btn btn-sm" data-upgrade-youth="recruitment">${icon("radar")}升级至 ${academy.recruitment+1} 级 · ${money(recruitmentNext)}</button>`:`<span class="tag green">${academy.recruitment===5?"已达最高等级":"由俱乐部管理"}</span>`}</section>
      <section class="panel academy-director"><div class="panel-header"><div><span class="eyebrow">青训总监</span><h3>${esc(academy.director.name)}</h3></div><span class="tag">合同稳定</span></div><div class="director-attributes"><div><span>判断能力</span><strong>${academy.director.judgingAbility}</strong></div><div><span>判断潜力</span><strong>${academy.director.judgingPotential}</strong></div><div><span>培养年轻人</span><strong>${academy.director.workingWithYoungsters}</strong></div></div></section></div>
      ${trialists.length?`<section class="panel academy-section"><div class="panel-header"><div><h3>${academy.currentIntake?.year} 青训选拔名单</h3><span class="meta">试训评估为区间值，签约后仍需长期观察</span></div><span class="tag">${trialists.length} 人待决定</span></div><div class="youth-player-list">${trialists.map(player=>youthProspectCard(player,academy,true)).join("")}</div></section>`:`<section class="panel academy-section"><div class="empty compact">${icon("calendar-search")}<h3>当前没有待评估试训球员</h3><p>每年 3 月 15 日会自动生成 10–12 人的青训选拔名单。</p></div></section>`}
      <section class="panel academy-section"><div class="panel-header"><div><h3>学院球员与导师</h3><span class="meta">导师需与球员属于相同位置单元，并至少年长至 23 岁</span></div><span class="tag green">${signed.length} 人</span></div><div class="youth-player-list">${signed.map(player=>youthProspectCard(player,academy,false)).join("")||`<div class="empty compact">签入的试训球员会进入学院名单</div>`}</div></section>
      <section class="panel academy-section global-youth"><div class="panel-header"><div><h3>全球青训观察</h3><span class="meta">只展示公开球探区间，不标记球员生成来源</span></div><span class="tag">${world.prospects.length} 名已记录</span></div><div class="global-youth-list">${global.map(player=>`<div><span><strong>${esc(player.name)}</strong><small>${clubNameLink(clubById(player.clubId).name)} · ${esc(player.nationality)} · ${playerRoleLabel(player.position)} · ${player.age} 岁</small></span><b>${scoutedPotentialRange(player,estimatedYouthDepartment(clubById(player.clubId)))}</b></div>`).join("")||`<div class="empty compact">下一次全球选拔日后将形成观察名单</div>`}</div></section>`;
  }

  function matchReportForFixture(fixture,save=state) {
    if(!fixture||!save)return null;const reports=save.matchReports||[];
    return (fixture.reportId&&reports.find(report=>report.id===fixture.reportId))||reports.find(report=>report.fixtureId===fixture.id)||null;
  }

  function archiveSeasonFixtures(save=state) {
    if(!save?.schedule?.length)return null;const season=Number(save.season),fixtures=save.schedule.filter(fixture=>fixture.status==="played").map(fixture=>{const report=matchReportForFixture(fixture,save);return {...fixture,score:fixture.score?{...fixture.score}:null,penalties:fixture.penalties?{...fixture.penalties}:null,reportId:fixture.reportId||report?.id||null};});if(!fixtures.length)return null;
    const archive={season,clubId:save.clubId,clubName:clubById(save.clubId).name,leagueId:clubById(save.clubId).league,fixtures};save.fixtureArchives=Array.isArray(save.fixtureArchives)?save.fixtureArchives:[];save.fixtureArchives=[archive,...save.fixtureArchives.filter(item=>Number(item.season)!==season)].sort((a,b)=>b.season-a.season).slice(0,30);return archive;
  }

  function selectedFixtureArchive() {
    const key=state.fixtureSeasonFilter||"current";if(key==="current")return {season:state.season,clubId:state.clubId,clubName:clubById(state.clubId).name,fixtures:state.schedule,current:true};
    const season=Number(key.replace("season-","")),archive=(state.fixtureArchives||[]).find(item=>Number(item.season)===season);if(archive)return {...archive,current:false};state.fixtureSeasonFilter="current";return {season:state.season,clubId:state.clubId,clubName:clubById(state.clubId).name,fixtures:state.schedule,current:true};
  }

  function renderFixtures() {
    const archive=selectedFixtureArchive(),fixtures=archive.fixtures||[],competitions=[...new Set(fixtures.map(fixture=>fixture.competition))],validFilter=state.fixtureFilter==="all"||competitions.includes(state.fixtureFilter);if(!validFilter)state.fixtureFilter="all";
    const filter=state.fixtureFilter||"all",allUpcoming=fixtures.filter(f=>f.status==="upcoming").sort((a,b)=>a.date.localeCompare(b.date)),allPlayed=fixtures.filter(f=>f.status==="played").sort((a,b)=>b.date.localeCompare(a.date)),upcoming=filter==="all"?allUpcoming:allUpcoming.filter(f=>f.competition===filter),played=filter==="all"?allPlayed:allPlayed.filter(f=>f.competition===filter),selectedFixtures=fixtures.filter(f=>filter==="all"||f.competition===filter),homeCount=selectedFixtures.filter(f=>f.home).length,awayCount=selectedFixtures.length-homeCount,seasonLabel=`${archive.season}/${String(Number(archive.season)+1).slice(2)}`,seasonOptions=(state.fixtureArchives||[]).map(item=>`<option value="season-${item.season}" ${state.fixtureSeasonFilter===`season-${item.season}`?"selected":""}>${item.season}/${String(Number(item.season)+1).slice(2)} · ${esc(item.clubName||clubById(item.clubId).name)}</option>`).join("");
    return `<div class="page-heading"><span class="eyebrow">${seasonLabel}</span><h2>赛程与结果</h2><p>点击已经结束的比赛可重新查看完整赛后分析；历史赛季比赛会随存档永久保留。</p></div>
      <div class="filterbar"><label for="fixture-season-filter">赛季</label><select class="select" id="fixture-season-filter" aria-label="选择赛季"><option value="current" ${archive.current?"selected":""}>${state.season}/${String(state.season+1).slice(2)} · 当前赛季</option>${seasonOptions}</select><label for="fixture-filter">赛事</label><select class="select" id="fixture-filter" aria-label="筛选赛事"><option value="all" ${filter==="all"?"selected":""}>全部赛事 (${fixtures.length})</option>${competitions.map(name=>`<option value="${esc(name)}" ${filter===name?"selected":""}>${esc(name)} (${fixtures.filter(f=>f.competition===name).length})</option>`).join("")}</select><span class="tag">${filter==="all"?"全部赛事":esc(filter)} · ${selectedFixtures.length} 场 · 主 ${homeCount} / 客 ${awayCount}</span></div>
      <div class="grid grid-2">${archive.current?`<section class="panel"><div class="panel-header"><h3>接下来</h3><span class="meta">${upcoming.length} 场</span></div><div class="list">${upcoming.slice(0,60).map(f=>fixtureRow(f)).join("")||`<div class="empty">赛程已完成</div>`}</div></section>`:""}<section class="panel ${archive.current?"":"fixture-history-panel"}"><div class="panel-header"><h3>${archive.current?"比赛结果":`${seasonLabel} 比赛记录`}</h3><span class="meta">${played.length} 场 · 点击查看赛后分析</span></div><div class="list">${played.slice(0,80).map(f=>fixtureRow(f,archive.clubId)).join("")||`<div class="empty">尚未进行比赛</div>`}</div></section></div>`;
  }
  function fixtureRow(f,clubId=state.clubId) {
    const club=clubById(clubId),report=f.status==="played"?matchReportForFixture(f):null,interactive=Boolean(report),content=`${clubBadge(f.opponent,"club-badge-list")}<div class="list-row-main"><div class="list-row-title">${f.home?"vs":"@"} ${clubNameLink(f.opponent)}</div><div class="list-row-sub">${esc(f.competition)} · ${esc(f.round)} · ${formatDate(f.date,false)}</div></div><div class="list-row-value">${f.status==="played"?`<strong>${f.score.home} - ${f.score.away}</strong><div class="list-row-sub">${resultLabel(f,club)}${interactive?` · 赛后分析 ${icon("chevron-right")}`:" · 报告未保存"}</div>`:`<span class="tag">${f.home?"主场":"客场"}</span>`}</div>`;
    return interactive?`<div class="list-row fixture-result-row" role="button" tabindex="0" data-match-report="${esc(report.id)}" aria-label="查看 ${esc(f.opponent)} 比赛的赛后分析">${content}</div>`:`<div class="list-row">${content}</div>`;
  }
  function resultLabel(f) { const ours=f.home?f.score.home:f.score.away, theirs=f.home?f.score.away:f.score.home; if(f.penalties)return f.penalties.winner==="us"?"点球胜":"点球负"; return ours>theirs?"胜":ours===theirs?"平":"负"; }

  function leaguePositionZone(league,index,total) {
    const versusPlayoff=PROMOTION_RULES[league.country]?.playoff==="versus";
    if(league.tier===2){if(index<2)return {className:"promotion",label:"直接升级"};if(versusPlayoff&&index===2)return {className:"playoff",label:"升级附加赛"};if(!versusPlayoff&&index<6)return {className:"playoff",label:"升级附加赛"};if(versusPlayoff&&index===total-3)return {className:"playoff",label:"保级附加赛"};if(index>=total-(versusPlayoff?2:3))return {className:"relegation",label:"直接降级"};return null;}
    if(league.tier===3){if(index<2)return {className:"promotion",label:"直接升级"};if((versusPlayoff&&index===2)||(!versusPlayoff&&index<6))return {className:"playoff",label:"升级附加赛"};return null;}
    if(index===0)return {className:"champion",label:"榜首"};if(index<4)return {className:"continental",label:"欧冠区"};if(versusPlayoff&&index===total-3)return {className:"playoff",label:"保级附加赛"};if(index>=total-(versusPlayoff?2:3))return {className:"relegation",label:"直接降级"};return null;
  }

  function renderLeagueForm(form=[]) {
    return `<div class="form-strip">${[...form].reverse().map(result=>`<span class="${result.toLowerCase()}">${result}</span>`).join("")||`<span class="empty-form">—</span>`}</div>`;
  }

  function europeanPositionZone(index) {
    if(index<8)return {className:"europe-direct",label:"直接晋级十六强"};if(index<24)return {className:"europe-playoff",label:"淘汰赛附加赛"};return {className:"europe-out",label:"联赛阶段出局"};
  }

  function renderEuropeanCenter() {
    state.europeanWorld||=createEuropeanWorld(state);const keys=Object.keys(EUROPEAN_COMPETITIONS);if(!state.europeanWorld.competitions[state.europeanCompetitionKey])state.europeanCompetitionKey="ucl";state.europeanRoundFilters||={};
    const key=state.europeanCompetitionKey,config=EUROPEAN_COMPETITIONS[key],competition=state.europeanWorld.competitions[key],table=europeanStandings(competition),nextRoundIndex=competition.rounds.findIndex(round=>round.status!=="played"),storedRound=Number(state.europeanRoundFilters[key]),selectedIndex=Number.isInteger(storedRound)&&storedRound>=0&&storedRound<competition.rounds.length?storedRound:(nextRoundIndex>=0?nextRoundIndex:competition.rounds.length-1),selectedRound=competition.rounds[selectedIndex],userRow=table.find(club=>club.id===state.clubId),userPosition=userRow?table.findIndex(club=>club.id===state.clubId)+1:null,playedMatches=competition.rounds.flatMap(round=>round.matches).filter(match=>match.status==="played").length,knockoutFixtures=(state.schedule||[]).filter(fixture=>fixture.competition===config.name&&fixture.phase==="knockout").sort((a,b)=>a.date.localeCompare(b.date));
    const matchMarkup=selectedRound.matches.map(match=>{const userMatch=match.homeId===state.clubId||match.awayId===state.clubId,score=match.status==="played"?`${match.homeGoals} - ${match.awayGoals}`:formatDate(match.date,false);return `<div class="europe-fixture ${userMatch?"user-result":""}"><span class="league-result-team">${clubBadge(match.homeId||match.home,"club-badge-result")}<b>${clubNameLink(match.home)}</b></span><strong class="${match.status==="played"?"played":"upcoming"}">${score}</strong><span class="league-result-team away">${clubBadge(match.awayId||match.away,"club-badge-result")}<b>${clubNameLink(match.away)}</b></span></div>`;}).join("");
    return `<section class="europe-center" aria-label="欧洲赛事中心"><header class="europe-header"><img src="assets/trophies/${trophyAsset(config.fullName)}" alt="${esc(config.name)}奖杯"><div><span class="eyebrow">${state.season}/${String(state.season+1).slice(2)} · 欧洲赛事</span><h2>${esc(config.fullName)}</h2><p>36 队联赛阶段 · ${config.matches} 轮 · 更新至 ${formatDate(state.europeanWorld.currentDate)}</p></div><div class="league-live">${icon("radio")}实时模拟</div></header>
      <nav class="league-tabs europe-tabs" role="tablist" aria-label="选择欧洲赛事">${keys.map(competitionKey=>{const item=EUROPEAN_COMPETITIONS[competitionKey],active=competitionKey===key,userInCompetition=Boolean(state.europeanWorld.competitions[competitionKey]?.clubs.some(club=>club.id===state.clubId));return `<button role="tab" aria-selected="${active}" class="league-tab ${active?"active":""}" data-europe-competition="${competitionKey}"><span>${item.name}</span>${userInCompetition?`<small>我的赛事</small>`:""}</button>`;}).join("")}</nav>
      <div class="europe-summary"><span><b>${competition.round}</b> / ${config.matches} 轮已完成</span><span><b>${playedMatches}</b> 场已赛</span><span><b>${competition.totalGoals}</b> 粒进球</span><span>${userRow?`本队第 <b>${userPosition}</b> 名 · ${userRow.pts} 分`:`<b>未参赛</b>`}</span></div>
      <div class="europe-layout"><section class="panel league-table-panel"><div class="panel-header"><h3>${esc(config.name)}联赛阶段积分榜</h3><span class="meta">积分、净胜球、进球数依次排名</span></div><div class="table-wrap"><table class="league-table europe-table"><thead><tr><th class="num">排名</th><th>俱乐部</th><th>近况</th><th class="num">赛</th><th class="num">胜</th><th class="num">平</th><th class="num">负</th><th class="num">进/失</th><th class="num">净胜</th><th class="num">积分</th></tr></thead><tbody>${table.map((club,index)=>{const zone=europeanPositionZone(index),isUser=club.id===state.clubId;return `<tr class="${isUser?"user-club-row":""}"><td class="num position-cell"><span class="position-mark ${zone.className}" title="${zone.label}">${index+1}</span></td><td class="league-club-cell">${clubBadge(club.id||club.name,"club-badge-table")}<div class="player-name"><strong>${isUser?"★ ":""}${clubNameLink(club.name)}</strong><span>${zone.label}</span></div></td><td>${renderLeagueForm(club.form)}</td><td class="num">${club.p}</td><td class="num">${club.w}</td><td class="num">${club.d}</td><td class="num">${club.l}</td><td class="num">${club.gf}/${club.ga}</td><td class="num">${club.gd>0?"+":""}${club.gd}</td><td class="num"><span class="rating league-points">${club.pts}</span></td></tr>`;}).join("")}</tbody></table></div><div class="league-legend europe-legend"><span><i class="europe-direct"></i>第 1–8 名：直通十六强</span><span><i class="europe-playoff"></i>第 9–24 名：淘汰赛附加赛</span><span><i class="europe-out"></i>第 25–36 名：出局</span></div></section>
        <aside class="europe-fixtures-panel"><section class="panel"><div class="panel-header europe-round-header"><div><h3>联赛阶段对局</h3><span class="meta">${formatDate(selectedRound.date,false)} · 18 场</span></div><select class="select" id="europe-round" aria-label="选择欧战轮次">${competition.rounds.map(round=>`<option value="${round.index}" ${round.index===selectedIndex?"selected":""}>第 ${round.index+1} 轮 · ${round.status==="played"?"已赛":"未赛"}</option>`).join("")}</select></div><div class="europe-fixtures">${matchMarkup}</div></section>
        ${knockoutFixtures.length?`<section class="panel"><div class="panel-header"><h3>本队淘汰赛路径</h3><span class="meta">已生成对局</span></div><div class="europe-knockout-list">${knockoutFixtures.map(fixture=>`<div><span>${esc(fixture.round)} · ${formatDate(fixture.date,false)}</span><strong>${fixture.home?"vs":"@"} ${clubNameLink(fixture.opponent)}${fixture.status==="played"?` · ${fixture.score.home}-${fixture.score.away}`:""}</strong></div>`).join("")}</div></section>`:""}</aside></div></section>`;
  }

  function renderWorld() {
    state.majorLeagueWorld||=createMajorLeagueWorld(state.season,state.clubId);
    const world=state.majorLeagueWorld,userClub=clubById(state.clubId),leagueIds=Object.keys(LEAGUES).filter(id=>world.leagues[id]);
    if(!world.leagues[state.majorLeagueId])state.majorLeagueId=userClub.league;
    const league=world.leagues[state.majorLeagueId],table=majorStandings(league),latest=league.results[0],matchesPlayed=Math.round(league.clubs.reduce((sum,club)=>sum+club.p,0)/2),leader=table[0],averageGoals=matchesPlayed?league.totalGoals/matchesPlayed:0;
    const background=state.backgroundWorld||createBackgroundWorld(state.season),backgroundIds=Object.keys(background.leagues),packs=loadModPacks();
    if(!background.leagues[state.worldLeague])state.worldLeague=backgroundIds[0];
    const selectedBackground=background.leagues[state.worldLeague],worldHistory=ensureWorldHistory(state),leagueHistory=worldHistory.competitions[league.name]||[],europeHistory=Object.values(EUROPEAN_COMPETITIONS).flatMap(config=>(worldHistory.competitions[config.fullName]||[]).slice(0,4)).sort((a,b)=>b.season-a.season||a.name.localeCompare(b.name)),nationalHistory=Object.values(worldHistory.competitions).flat().filter(record=>record.kind==="national").sort((a,b)=>b.season-a.season||a.name.localeCompare(b.name)).slice(0,12),seasonLabel=season=>`${season}/${String(Number(season)+1).slice(2)}`,userRecord=record=>record.userStage?`${esc(record.userStage)} · ${Number(record.userPoints||0)} 分 · ${Number(record.userGoalsFor||0)}/${Number(record.userGoalsAgainst||0)}`:"未参赛";
    const centerMode=state.worldCenterMode==="europe"?"europe":"domestic";
    return `<div class="league-page">
      <nav class="competition-center-tabs" aria-label="选择赛事中心"><button class="${centerMode==="domestic"?"active":""}" data-world-center="domestic">国内联赛</button>${Object.values(EUROPEAN_COMPETITIONS).map(config=>`<button class="${centerMode==="europe"&&state.europeanCompetitionKey===config.key?"active":""}" data-world-center="${config.key}">${config.name}</button>`).join("")}</nav>
      <div class="world-domestic-live" ${centerMode==="domestic"?"":"hidden"}>
      <section class="league-banner"><img src="assets/trophies/${leagueTrophyAsset(league.id)}" alt="${esc(league.short)}冠军奖杯"><div><span class="eyebrow">${state.season}/${String(state.season+1).slice(2)} · ${esc(league.country)}</span><h2>${esc(league.name)}</h2><p>${league.id===userClub.league?`${esc(userClub.name)} 所在联赛`:"五大联赛实时追踪"} · 更新至 ${formatDate(world.currentDate)}</p></div><div class="league-live">${icon("radio")}游戏内实时</div></section>
      <nav class="league-tabs" role="tablist" aria-label="选择联赛">${leagueIds.map(id=>`<button role="tab" aria-selected="${id===league.id}" class="league-tab ${id===league.id?"active":""}" data-major-league="${id}"><span>${LEAGUES[id].short}</span>${id===userClub.league?`<small>我的联赛</small>`:""}</button>`).join("")}</nav>
      <section class="stats league-stats" aria-label="联赛关键数据"><div class="stat"><div class="stat-label">领头羊</div><div class="stat-value league-team-value">${esc(leader?.name||"待定")}</div><div class="stat-context">${leader?.pts||0} 分 · 净胜 ${leader?.gd>0?"+":""}${leader?.gd||0}</div></div><div class="stat"><div class="stat-label">已完成轮次</div><div class="stat-value">${league.round}</div><div class="stat-context">共 ${matchesPlayed} 场比赛</div></div><div class="stat"><div class="stat-label">联赛进球</div><div class="stat-value">${league.totalGoals}</div><div class="stat-context">场均 ${averageGoals.toFixed(2)} 球</div></div><div class="stat"><div class="stat-label">射手榜首</div><div class="stat-value league-team-value">${league.scorers[0]?playerNameLink(league.scorers[0],{position:"ST",clubName:league.scorers[0].club}):"待定"}</div><div class="stat-context">${league.scorers[0]?.goals||0} 球${league.scorers[0]?` · ${esc(league.scorers[0].club)}`:""}</div></div></section>
      <div class="league-layout"><section class="panel league-table-panel"><div class="panel-header"><h3>实时积分榜</h3><span class="meta">胜负关系依次按积分、净胜球、进球数排列</span></div><div class="table-wrap"><table class="league-table"><thead><tr><th class="num">排名</th><th>俱乐部</th><th>近况</th><th class="num">赛</th><th class="num">胜</th><th class="num">平</th><th class="num">负</th><th class="num league-goals-col">进/失</th><th class="num">净胜</th><th class="num">积分</th></tr></thead><tbody>${table.map((club,index)=>{const zone=leaguePositionZone(league,index,table.length),isUser=club.id===state.clubId;return `<tr class="${isUser?"user-club-row":""}"><td class="num position-cell"><span class="position-mark ${zone?.className||""}" title="${zone?.label||""}">${index+1}</span></td><td class="league-club-cell">${clubBadge(club,"club-badge-table")}<div class="player-name"><strong>${isUser?"★ ":""}${clubNameLink(club.name)}</strong><span>${zone?.label||`俱乐部战力 ${club.ability}`}</span></div></td><td>${renderLeagueForm(club.form)}</td><td class="num">${club.p}</td><td class="num">${club.w}</td><td class="num">${club.d}</td><td class="num">${club.l}</td><td class="num league-goals-col">${club.gf}/${club.ga}</td><td class="num">${club.gd>0?"+":""}${club.gd}</td><td class="num"><span class="rating league-points">${club.pts}</span></td></tr>`;}).join("")}</tbody></table></div><div class="league-legend"><span><i class="champion"></i>榜首</span><span><i class="continental"></i>${league.tier===1?"欧冠区":"直接升级"}</span>${league.tier!==1?`<span><i class="playoff"></i>附加赛</span>`:""}${league.tier<3?`<span><i class="relegation"></i>降级区</span>`:""}</div></section>
        <aside class="league-sidebar"><section class="panel"><div class="panel-header"><h3>最近赛果</h3><span class="meta">${latest?`${formatDate(latest.date,false)} · 第 ${latest.round} 轮`:"等待首轮"}</span></div>${latest?`<div class="league-results">${latest.matches.map(match=>`<div class="league-result ${match.homeId===state.clubId||match.awayId===state.clubId?"user-result":""}"><span class="league-result-team">${clubBadge(match.homeId||match.home,"club-badge-result")}<b>${esc(match.home)}</b></span><strong>${match.homeGoals} - ${match.awayGoals}</strong><span class="league-result-team away">${clubBadge(match.awayId||match.away,"club-badge-result")}<b>${esc(match.away)}</b></span></div>`).join("")}</div>`:`<div class="empty">首轮比赛完成后显示赛果</div>`}</section>
        <section class="panel"><div class="panel-header"><h3>射手榜</h3><span class="meta">前 8 名</span></div><div class="league-scorers">${league.scorers.slice(0,8).map((scorer,index)=>`<div class="league-scorer"><span class="scorer-rank">${index+1}</span><div><strong>${playerNameLink(scorer,{position:"ST",clubName:scorer.club})}</strong><small>${esc(scorer.club)}${scorer.generated?" · 模拟球员":""}</small></div><b>${scorer.goals}</b></div>`).join("")||`<div class="empty">尚无进球记录</div>`}</div></section></aside></div></div>
      <div class="world-europe-live" ${centerMode==="europe"?"":"hidden"}>${renderEuropeanCenter()}</div>
      <section class="panel"><div class="panel-header"><h3>${esc(league.name)} 历史赛季</h3><span class="meta">最终积分榜、冠军、升降级与射手</span></div><div class="table-wrap"><table class="player-career-table"><thead><tr><th>赛季</th><th>冠军 / 亚军</th><th>赛季规模</th><th>最佳射手</th><th>升级</th><th>降级</th></tr></thead><tbody>${leagueHistory.map(record=>`<tr><td>${seasonLabel(record.season)}</td><td><strong>${clubNameLink(record.champion)}</strong><small> / ${clubNameLink(record.runnerUp)}</small></td><td>${record.matches} 场 · ${record.goals} 球</td><td>${esc(record.topScorer||"—")} · ${record.topScorerGoals||0} 球</td><td>${(record.promoted||[]).map(name=>clubNameLink(name)).join("、")||"—"}</td><td>${(record.relegated||[]).map(name=>clubNameLink(name)).join("、")||"—"}</td></tr><tr class="season-history-row"><td colspan="6"><details class="season-history-details"><summary>${icon("table-2")}查看 ${seasonLabel(record.season)} 完整最终积分榜</summary><div class="table-wrap"><table class="league-table archived-league-table"><thead><tr><th class="num">排名</th><th>俱乐部</th><th class="num">赛</th><th class="num">胜</th><th class="num">平</th><th class="num">负</th><th class="num">进/失</th><th class="num">净胜</th><th class="num">积分</th></tr></thead><tbody>${(record.table||[]).map(row=>`<tr><td class="num">${row.position}</td><td>${clubNameLink(row.name)}</td><td class="num">${row.p}</td><td class="num">${row.w}</td><td class="num">${row.d}</td><td class="num">${row.l}</td><td class="num">${row.gf}/${row.ga}</td><td class="num">${row.gd>0?"+":""}${row.gd}</td><td class="num"><strong>${row.pts}</strong></td></tr>`).join("")}</tbody></table></div></details></td></tr>`).join("")||`<tr><td colspan="6"><div class="empty compact">完成首个赛季后生成历史档案</div></td></tr>`}</tbody></table></div></section>
      <div class="grid grid-2"><section class="panel"><div class="panel-header"><h3>欧洲赛事历史</h3><span class="meta">欧冠、欧联杯、欧协联</span></div><div class="table-wrap"><table class="player-career-table"><thead><tr><th>赛季</th><th>赛事</th><th>冠军</th><th>亚军</th><th>比赛 / 进球</th><th>本队记录</th></tr></thead><tbody>${europeHistory.map(record=>`<tr><td>${seasonLabel(record.season)}</td><td>${esc(record.shortName||record.name)}</td><td>${clubNameLink(record.champion)}</td><td>${clubNameLink(record.runnerUp)}</td><td>${record.matches} / ${record.goals}</td><td>${userRecord(record)}</td></tr>`).join("")||`<tr><td colspan="6">暂无历史赛季</td></tr>`}</tbody></table></div></section><section class="panel"><div class="panel-header"><h3>国家队赛事历史</h3><span class="meta">冠军、亚军与赛事规模</span></div><div class="table-wrap"><table class="player-career-table"><thead><tr><th>赛季</th><th>赛事</th><th>冠军</th><th>亚军</th><th>比赛 / 进球</th><th>国家队记录</th></tr></thead><tbody>${nationalHistory.map(record=>`<tr><td>${seasonLabel(record.season)}</td><td>${esc(record.name)}</td><td>${esc(record.champion||"—")}</td><td>${esc(record.runnerUp||"—")}</td><td>${record.matches} / ${record.goals}</td><td>${record.userTeam?`${esc(record.userTeam)} · ${userRecord(record)}`:"未参赛"}</td></tr>`).join("")||`<tr><td colspan="6">暂无历史赛季</td></tr>`}</tbody></table></div></section></div>
      <details class="panel league-extension"><summary>${icon("globe-2")}<span>扩展联赛与社区 MOD</span><small>${backgroundIds.length} 个后台联赛 · ${packs.length} 个 MOD</small>${icon("chevron-down")}</summary><div class="panel-body"><div class="filterbar"><select class="select" id="world-league">${backgroundIds.map(id=>`<option value="${esc(id)}" ${id===state.worldLeague?"selected":""}>${esc(background.leagues[id].name)} · ${esc(background.leagues[id].country)}</option>`).join("")}</select><button class="btn" id="import-mod">${icon("upload")}导入 MOD</button><button class="btn" id="export-mod">${icon("download")}导出数据包</button><button class="btn btn-danger" id="clear-mods" ${packs.length?"":"disabled"}>${icon("trash-2")}清除 MOD</button><input id="mod-file" type="file" accept="application/json,.json" hidden></div><div class="extension-summary"><span>${esc(selectedBackground?.name||"扩展联赛")}</span><strong>第 ${selectedBackground?.round||0} 轮</strong><small>后台模拟，不影响五大联赛正式积分榜</small></div></div></details>
      <div class="data-note"><strong>数据口径：</strong>俱乐部和球员名称来自 2026-07-31 数据快照；积分、赛果、进球及排名是当前存档内随日期实时更新的模拟数据。</div>
    </div>`;
  }

  const TRANSFER_ROLE_TARGETS={GK:2,CB:4,RB:1,LB:1,RWB:1,LWB:1,DM:2,CM:3,RM:1,LM:1,AM:2,RW:2,LW:2,ST:2,CF:1};
  const AI_TRANSFER_TARGETS={goalkeeper:2,defence:7,midfield:7,attack:5};
  const AI_TRANSFER_MINIMUMS={goalkeeper:2,defence:5,midfield:5,attack:3};
  const AI_SQUAD_LIMITS={ideal:27,soft:29,hard:32};
  let aiTransferRuntimeCache=null;

  function transferRole(position) {
    return POSITION_LABELS[position]?position:({DF:"CB",FB:"RB",MF:"CM",WG:"RW"})[position]||"ST";
  }

  function stableScoutingUnit(value) {
    let hash=2166136261;
    for(let i=0;i<value.length;i++){hash^=value.charCodeAt(i);hash=Math.imul(hash,16777619);}
    return (hash>>>0)/4294967295;
  }

  const LEAGUE_BROADCAST_BASE={ENG1:118,ENG2:45,ESP1:78,ESP2:18,GER1:72,GER2:16,ITA1:65,ITA2:15,FRA1:48,FRA2:12};
  function clubLeagueSize(club) {return Math.max(2,leagueClubNames(club.league).length||Number(LEAGUES[club.league]?.matches||38)/2+1);}
  function seasonBroadcastRevenue(club,position=clubLeagueSize(club),participants=clubLeagueSize(club)) {
    const league=LEAGUES[club.league]||{tier:1},base=LEAGUE_BROADCAST_BASE[club.league]??(league.tier===1?42:10),rank=clamp(Math.round(Number(position)||participants),1,participants),placeRate=club.league==="ENG1"?3.25:league.tier===1?1.75:.42;
    return Number((base+Math.max(0,participants-rank)*placeRate).toFixed(1));
  }
  function seasonCommercialRevenue(club,season) {const unit=stableScoutingUnit(`${club.id}|commercial|${season}`);return Number(clamp(14+(Number(club.prestige||65)-55)*1.05+unit*14,10,82).toFixed(1));}
  function seasonMatchdayRevenue(club,season) {const unit=stableScoutingUnit(`${club.id}|matchday|${season}`),tier=LEAGUES[club.league]?.tier||1;return Number(clamp((tier===1?18:6)+(Number(club.prestige||65)-55)*(tier===1?.82:.28)+unit*8,5,62).toFixed(1));}
  function ownerInvestmentFor(club,season,key="season",currentBudget=club.budget) {
    const annual=key==="season",lowBudget=Number(currentBudget||0)<Number(club.budget||10)*.32,chance=(annual?.16:.026)+(lowBudget?.055:0),unit=stableScoutingUnit(`${club.id}|owner|${season}|${key}`);if(unit>=chance)return 0;
    const amountUnit=stableScoutingUnit(`${club.id}|owner-amount|${season}|${key}`);return Number(clamp(Number(club.budget||10)*(.12+amountUnit*.26),4,72).toFixed(1));
  }
  function previousClubLeaguePositions(save=state) {
    const positions={};Object.values(save?.majorLeagueWorld?.leagues||{}).forEach(league=>majorStandings(league).forEach((club,index)=>{positions[club.id]=index+1;}));if(save?.clubId)positions[save.clubId]=Number(save.leaguePosition||positions[save.clubId]||1);return positions;
  }
  function seasonFinancePlans(save,nextSeason,positions=previousClubLeaguePositions(save)) {
    const previousBudgets=save?.transferMarket?.budgets||{},budgets={},reports={};
    CLUBS.forEach(club=>{const participants=clubLeagueSize(club),position=positions[club.id]||1+Math.floor(stableScoutingUnit(`${club.id}|position|${nextSeason-1}`)*participants),broadcast=seasonBroadcastRevenue(club,position,participants),commercial=seasonCommercialRevenue(club,nextSeason),matchday=seasonMatchdayRevenue(club,nextSeason),previous=Math.max(0,Number(previousBudgets[club.id]||0)),carryover=Number((previous*.56).toFixed(1)),baseAllocation=Number((Number(club.budget||10)*.44).toFixed(1)),broadcastAllocation=Number((broadcast*.42).toFixed(1)),commercialAllocation=Number((commercial*.25).toFixed(1)),matchdayAllocation=Number((matchday*.12).toFixed(1)),ownerInvestment=ownerInvestmentFor(club,nextSeason,"season",previous),transferBudget=Number(clamp(carryover+baseAllocation+broadcastAllocation+commercialAllocation+matchdayAllocation+ownerInvestment,6,380).toFixed(1));budgets[club.id]=transferBudget;reports[club.id]={season:nextSeason,clubId:club.id,league:club.league,position,participants,broadcast,commercial,matchday,carryover,baseAllocation,broadcastAllocation,commercialAllocation,matchdayAllocation,ownerInvestment,transferBudget};});
    return {season:nextSeason,budgets,reports};
  }
  function ensureClubFinances(save=state) {
    if(!save)return null;const finance=save.finances||(save.finances={});finance.season=Number(finance.season||save.season||2026);finance.lastOperatingMonth||=String(save.date||START_DATE).slice(0,7);finance.ledger=Array.isArray(finance.ledger)?finance.ledger:[];finance.seasonReports=Array.isArray(finance.seasonReports)?finance.seasonReports:[];finance.ownerInvestments=finance.ownerInvestments&&typeof finance.ownerInvestments==="object"?finance.ownerInvestments:{};finance.operatingAllocated=Number(finance.operatingAllocated||0);finance.totalBroadcast=Number(finance.totalBroadcast||0);
    if(!finance.seasonReports.length)finance.seasonReports.unshift({season:save.season,clubId:save.clubId,openingBudget:Number(save.funds||clubById(save.clubId).budget||0),transferBudget:Number(save.funds||0),legacyBaseline:true,date:save.date||START_DATE});return finance;
  }
  function addClubTransferBudget(save,clubId,amount) {const value=Number(amount||0);if(!value)return;const market=ensureTransferMarket(save);market.budgets[clubId]=Number((Number(market.budgets[clubId]||0)+value).toFixed(1));if(clubId===save.clubId)save.funds=Number((Number(save.funds||0)+value).toFixed(1));}
  function monthlyOperatingRevenue(club,date) {const prestige=Number(club.prestige||65),tier=LEAGUES[club.league]?.tier||1,retailMonth=["03","06","09","12"].includes(String(date).slice(5,7)),unit=stableScoutingUnit(`${club.id}|operations|${String(date).slice(0,7)}`),matchday=Number(clamp((tier===1?1.35:.42)+(prestige-55)*(tier===1?.055:.018)+unit*.65,.25,4.5).toFixed(1)),commercial=Number(clamp((tier===1?.75:.22)+(prestige-55)*(tier===1?.07:.022)+(retailMonth?1.15:.25)+unit*.8,.2,5.8).toFixed(1)),allocation=Number(((matchday+commercial)*(.2+clamp((prestige-65)/500,0,.06))).toFixed(1));return {matchday,commercial,gross:Number((matchday+commercial).toFixed(1)),allocation};}
  function financeEntryLabel(entry) {return ({season:"新赛季预算",operations:"比赛日与商业经营",owner:"老板注资"})[entry?.type]||"俱乐部收入";}
  function activateSeasonFinances(save,plans,date=save.date) {
    const report=plans.reports[save.clubId],finance=ensureClubFinances(save);finance.season=save.season;finance.lastOperatingMonth=String(date).slice(0,7);finance.operatingAllocated=0;finance.totalBroadcast=report.broadcast;finance.ownerInvestments={};Object.values(plans.reports).forEach(item=>{if(item.ownerInvestment)finance.ownerInvestments[item.clubId]=save.season;});finance.seasonReports.unshift({...report,date});finance.seasonReports=finance.seasonReports.slice(0,12);finance.ledger.unshift({id:`finance-season-${save.season}`,season:save.season,date,type:"season",gross:Number((report.broadcast+report.commercial+report.matchday+report.ownerInvestment).toFixed(1)),allocation:report.transferBudget,detail:`联赛第 ${report.position} 名 · 新赛季预算`});finance.ledger=finance.ledger.slice(0,60);return report;
  }
  function runMonthlyClubFinances(save=state,date=save?.date) {
    if(!save||String(date).slice(8)!=="01")return null;const finance=ensureClubFinances(save),monthKey=String(date).slice(0,7);if(finance.lastOperatingMonth===monthKey||save.transferMarket?.season!==save.season)return null;finance.lastOperatingMonth=monthKey;let userOperations=null,userOwner=0;
    CLUBS.forEach(club=>{const operations=monthlyOperatingRevenue(club,date);addClubTransferBudget(save,club.id,operations.allocation);const ownerKey=`${save.season}:${club.id}`,owner=finance.ownerInvestments[club.id]===save.season?0:ownerInvestmentFor(club,save.season,monthKey,save.transferMarket?.budgets?.[club.id]);if(owner){addClubTransferBudget(save,club.id,owner);finance.ownerInvestments[club.id]=save.season;}if(club.id===save.clubId){userOperations=operations;userOwner=owner;finance.operatingAllocated=Number((finance.operatingAllocated+operations.allocation+owner).toFixed(1));finance.ledger.unshift({id:`finance-operations-${monthKey}`,season:save.season,date,type:"operations",gross:operations.gross,allocation:operations.allocation,matchday:operations.matchday,commercial:operations.commercial});if(owner)finance.ledger.unshift({id:`finance-owner-${monthKey}`,season:save.season,date,type:"owner",gross:owner,allocation:owner});}});finance.ledger=finance.ledger.slice(0,60);
    const reportMonth=["03","06","09","12"].includes(monthKey.slice(5)),visible=reportMonth||userOwner>0;if(!visible)return null;const facts=[`比赛日收入：${money(userOperations.matchday)}`,`球衣、周边与商业收入：${money(userOperations.commercial)}`,`划入转会预算：${money(userOperations.allocation)}`];if(userOwner)facts.push(`老板额外注资：${money(userOwner)}`);addNotification({title:userOwner?"董事会：老板完成额外注资":"董事会：季度俱乐部运营报告",type:"board",date,detail:"俱乐部已结算门票、比赛日消费、球衣周边和商业合作收入，其中一部分由董事会划入一线队转会预算。",facts});save.media.unshift({source:"Club Finance",title:userOwner?`${clubById(save.clubId).name} 获得老板额外注资`:`${clubById(save.clubId).name} 发布季度运营报告`,body:`本期经营收入 ${money(userOperations.gross)}，其中 ${money(userOperations.allocation+userOwner)} 已进入转会预算。`,date,type:"finance"});return {type:"finance",title:userOwner?"老板注资已到账":"季度俱乐部运营收入已结算",view:"transfers"};
  }

  function coachDecisionProfile(identity,attributes={}) {
    const name=String(identity||"AI 教练"),unit=key=>stableScoutingUnit(`${name}|${key}`);
    const tactics=Number(attributes.tactics||attributes.overall||72),people=Number(attributes.people||attributes.overall||72),youth=Number(attributes.youth||70),transfers=Number(attributes.transfers||72);
    return {
      name,tactics,people,youth,transfers,
      risk:clamp(.28+unit("risk")*.48+(tactics-72)/260,.18,.86),
      rotation:clamp(.22+unit("rotation")*.46+(people-72)/300,.16,.82),
      substitutionActivity:clamp(.32+unit("substitutions")*.42+(tactics-70)/300,.22,.9),
      youthTrust:clamp(.2+unit("youth")*.34+(youth-65)/150,.16,.86),
      budgetDiscipline:clamp(.38+unit("budget")*.4+(transfers-70)/260,.28,.9),
      formationSeed:unit("formation")
    };
  }

  function aiCoachProfile(save,clubId,identity=null) {
    const club=CLUBS.find(item=>item.id===clubId)||{id:String(clubId),name:String(clubId),prestige:78,coach:identity||String(clubId)},isUserCoach=clubId===save.clubId&&save.role==="coach",source=isUserCoach?save.coachProfile:COACHES.find(coach=>coach.club===clubId);
    return coachDecisionProfile(identity||source?.name||club.coach||club.name,source||{overall:club.prestige-8,tactics:club.prestige-7,people:club.prestige-10,youth:70,transfers:70});
  }

  function transferWindow(date,season=state?.season||2026) {
    const summerStart=`${season}-06-15`,summerEnd=`${season}-09-01`,winterStart=`${season+1}-01-01`,winterEnd=`${season+1}-02-02`;
    if(date>=summerStart&&date<=summerEnd)return {key:`summer-${season}`,label:`${season} 夏季转会窗`,start:summerStart,end:summerEnd,open:true};
    if(date>=winterStart&&date<=winterEnd)return {key:`winter-${season+1}`,label:`${season+1} 冬季转会窗`,start:winterStart,end:winterEnd,open:true};
    if(date>winterEnd)return {key:`winter-${season+1}`,label:`${season+1} 冬季转会窗`,start:winterStart,end:winterEnd,open:false};
    return {key:`summer-${season}`,label:`${season} 夏季转会窗`,start:summerStart,end:summerEnd,open:false};
  }

  function transferTickDelay(date,season) {
    const windowInfo=transferWindow(date,season);if(!windowInfo.open)return Math.round(rand(5,8));
    const daysLeft=daysBetween(date,windowInfo.end);if(daysLeft<=7)return 1;if(daysLeft<=21)return Math.round(rand(1,2));return Math.round(rand(1,2));
  }

  function createTransferMarket(season=2026,openingBudgets=null) {
    const openingDate=transferSeasonOpening(season);
    return {season,currentDate:openingDate,nextTickDate:addDays(openingDate,transferTickDelay(openingDate,season)),records:[],rumors:[],userOffers:[],clubOverrides:{},budgets:openingBudgets?{...openingBudgets}:Object.fromEntries(CLUBS.map(club=>[club.id,Number(club.budget)||10])),sequence:0};
  }

  function transferOwnershipSignature(save,market) {
    const edge=records=>records.length?`${records.length}:${records[0]?.id||""}:${records[0]?.fromId||""}:${records[0]?.toId||""}:${records.at(-1)?.id||""}`:"0";
    return `${edge(save?.transferHistory||[])}|${edge(market?.records||[])}`;
  }

  function repairTransferOwnership(save,market=save?.transferMarket) {
    if(!save||!market)return {};
    market.records=Array.isArray(market.records)?market.records:[];market.clubOverrides=market.clubOverrides&&typeof market.clubOverrides==="object"?market.clubOverrides:{};
    const signature=transferOwnershipSignature(save,market);if(market.ownershipHistorySignature===signature)return market.clubOverrides;
    const references=new Map(),unique=new Map();[...(save.transferHistory||[]),...market.records].forEach(record=>{if(!record?.toId)return;const key=record.id||`${record.playerId}|${record.date}|${record.toId}`;if(!references.has(key))references.set(key,[]);references.get(key).push(record);if(!unique.has(key))unique.set(key,record);});
    const groups=new Map();unique.forEach((record,key)=>{const playerId=record.playerId||record.sourcePlayerId;if(!playerId)return;if(!groups.has(playerId))groups.set(playerId,[]);groups.get(playerId).push({key,record});});
    groups.forEach((entries,playerId)=>{entries.sort((a,b)=>String(a.record.date||"").localeCompare(String(b.record.date||""))||String(a.record.id||"").localeCompare(String(b.record.id||"")));const canonical=REAL_PLAYERS.find(player=>player.id===playerId);let currentClubId=canonical?.club||entries[0]?.record.fromId||null;entries.forEach(({key,record})=>{const oldFromId=record.fromId;if(currentClubId&&oldFromId!==currentClubId){(references.get(key)||[record]).forEach(copy=>{copy.fromId=currentClubId;if(copy.careerSegment&&(!copy.careerSegment.clubId||copy.careerSegment.clubId===oldFromId)){copy.careerSegment.clubId=currentClubId;copy.careerSegment.club=clubById(currentClubId).name;}});}currentClubId=record.toId||currentClubId;});if(currentClubId)market.clubOverrides[playerId]=currentClubId;});
    market.ownershipHistorySignature=transferOwnershipSignature(save,market);return market.clubOverrides;
  }

  function transferSeasonOpening(season=2026) {
    return season===2026?START_DATE:`${season}-06-15`;
  }

  function rebuildTransferMarketFromPostOpeningActivity(save) {
    const market=ensureTransferMarket(save),openingDate=transferSeasonOpening(market.season||save.season||2026),oldRumors=[...market.rumors];
    const generatedBeforeOpening=oldRumors.filter(rumor=>(rumor.createdDate||"")<openingDate);
    const cameFromPreOpeningRumor=record=>generatedBeforeOpening.some(rumor=>
      rumor.playerId===record.playerId&&rumor.fromId===record.fromId&&rumor.toId===record.toId&&
      Number(rumor.fee)===Number(record.fee)&&(rumor.completedDate||record.date)===record.date
    );
    market.records=market.records.filter(record=>record.date>=transferSeasonOpening(record.season||market.season)&&!cameFromPreOpeningRumor(record));
    market.rumors=oldRumors.filter(rumor=>(rumor.createdDate||"")>=transferSeasonOpening(rumor.season||market.season));
    market.clubOverrides={};delete market.ownershipHistorySignature;
    market.budgets=Object.fromEntries(CLUBS.map(club=>[club.id,Number(club.budget)||10]));
    [...market.records].sort((a,b)=>a.date.localeCompare(b.date)).forEach(record=>{
      market.clubOverrides[record.playerId]=record.toId;
      market.budgets[record.toId]=Number(Math.max(0,Number(market.budgets[record.toId]||0)-Number(record.fee||0)).toFixed(1));
      market.budgets[record.fromId]=Number((Number(market.budgets[record.fromId]||0)+Number(record.fee||0)*.82).toFixed(1));
    });
    const validUserSignings=new Set(market.records.filter(record=>record.toId===save.clubId).map(record=>record.playerId));
    save.squad=(save.squad||[]).filter(player=>!String(player.id||"").startsWith("ai-signing-")||validUserSignings.has(player.sourcePlayerId));
    save.funds=Number((market.records.reduce((funds,record)=>funds+(record.fromId===save.clubId?Number(record.fee||0)*.82:0)-(record.toId===save.clubId?Number(record.fee||0):0),Number(clubById(save.clubId).budget)||10)).toFixed(1));
    save.media=(save.media||[]).filter(item=>item.type!=="transfer"||(item.date||openingDate)>=openingDate);
    market.currentDate=save.date||openingDate;
    market.nextTickDate=addDays(market.currentDate,transferTickDelay(market.currentDate,market.season));
    repairTransferOwnership(save,market);
  }

  function ensureTransferMarket(save) {
    const market=save.transferMarket||(save.transferMarket=createTransferMarket(save.season||2026));
    market.records=Array.isArray(market.records)?market.records:[];market.rumors=Array.isArray(market.rumors)?market.rumors:[];market.userOffers=Array.isArray(market.userOffers)?market.userOffers:[];market.clubOverrides||={};market.budgets||={};market.sequence??=0;
    CLUBS.forEach(club=>{market.budgets[club.id]??=Number(club.budget)||10;});repairTransferOwnership(save,market);
    return market;
  }

  function currentPlayerClubId(save,player) {
    if(aiTransferRuntimeCache?.save===save&&aiTransferRuntimeCache.playerClubIds.has(player.id))return aiTransferRuntimeCache.playerClubIds.get(player.id);
    return ensureTransferMarket(save).clubOverrides[player.id]||player.club;
  }

  function createAiTransferRuntimeCache(save,date) {
    const byClub=new Map(),sellerRoleGroups=new Map(),playerClubIds=new Map();REAL_PLAYERS.forEach(player=>{const clubId=ensureTransferMarket(save).clubOverrides[player.id]||player.club,snapshot=hydrateWorldPlayerStats(save,{...player,age:effectivePlayerAge(player,save),value:currentPlayerMarketValue(player,save)},clubId);playerClubIds.set(player.id,clubId);if(!byClub.has(clubId))byClub.set(clubId,[]);byClub.get(clubId).push(snapshot);const key=`${clubId}|${positionUnit(player.position)}`;if(!sellerRoleGroups.has(key))sellerRoleGroups.set(key,[]);sellerRoleGroups.get(key).push(snapshot);});byClub.set(save.clubId,save.squad||[]);[...sellerRoleGroups.keys()].filter(key=>key.startsWith(`${save.clubId}|`)).forEach(key=>sellerRoleGroups.delete(key));(save.squad||[]).forEach(player=>{playerClubIds.set(player.id,save.clubId);const key=`${save.clubId}|${positionUnit(player.position)}`;if(!sellerRoleGroups.has(key))sellerRoleGroups.set(key,[]);sellerRoleGroups.get(key).push(player);});sellerRoleGroups.forEach(group=>group.sort((a,b)=>(b.overall||0)-(a.overall||0)));return {save,date,byClub,sellerRoleGroups,playerClubIds,clubNeeds:new Map(),clubCounts:Object.fromEntries([...byClub].map(([clubId,players])=>[clubId,players.length]))};
  }

  function aiClubPlayers(save,clubId) {
    if(clubId===save.clubId)return save.squad||[];
    if(aiTransferRuntimeCache?.save===save)return aiTransferRuntimeCache.byClub.get(clubId)||[];
    return REAL_PLAYERS.filter(player=>currentPlayerClubId(save,player)===clubId).map(player=>hydrateWorldPlayerStats(save,{...player,age:effectivePlayerAge(player,save),value:currentPlayerMarketValue(player,save)},clubId));
  }

  function aiSquadNeeds(save,clubId) {
    if(aiTransferRuntimeCache?.save===save&&aiTransferRuntimeCache.clubNeeds.has(clubId))return aiTransferRuntimeCache.clubNeeds.get(clubId);
    const club=clubById(clubId),players=aiClubPlayers(save,clubId),groups=Object.fromEntries(Object.keys(AI_TRANSFER_TARGETS).map(role=>[role,[]]));
    players.forEach(player=>groups[positionUnit(player.position)].push(player));
    const squadStrength=[...players].sort((a,b)=>(b.overall||0)-(a.overall||0)).slice(0,11).reduce((sum,player)=>sum+Number(player.overall||60),0)/Math.max(1,Math.min(11,players.length));
    const needs=Object.fromEntries(Object.entries(AI_TRANSFER_TARGETS).map(([role,target])=>{
      const rolePlayers=groups[role].sort((a,b)=>(b.overall||0)-(a.overall||0)),core=rolePlayers.slice(0,target),average=core.reduce((sum,player)=>sum+Number(player.overall||60),0)/Math.max(1,core.length);
      const shortage=Math.max(0,target-rolePlayers.length),qualityTarget=clamp(club.prestige-7,58,89),qualityGap=Math.max(0,qualityTarget-average);
      return [role,{role,count:rolePlayers.length,target,average,shortage,score:shortage*11+qualityGap*1.5+(squadStrength-average)*.45}];
    }));
    const result={club,players,groups,needs,squadStrength};if(aiTransferRuntimeCache?.save===save)aiTransferRuntimeCache.clubNeeds.set(clubId,result);return result;
  }

  function sameTransferPlayer(left,right) {
    if(!left||!right)return false;
    const ids=new Set([left.id,left.playerId,left.sourcePlayerId].filter(Boolean));
    if([right.id,right.playerId,right.sourcePlayerId].filter(Boolean).some(id=>ids.has(id)))return true;
    const leftName=left.name||left.playerName,rightName=right.name||right.playerName;
    return Boolean(leftName&&rightName&&comparableClubName(leftName)===comparableClubName(rightName));
  }

  function canonicalTransferPlayer(save,sellerId,player) {
    return REAL_PLAYERS.find(candidate=>currentPlayerClubId(save,candidate)===sellerId&&sameTransferPlayer(candidate,player))||null;
  }

  function activeOutgoingRumors(save,sellerId) {
    return ensureTransferMarket(save).rumors.filter(rumor=>rumor.status==="active"&&!rumor.advisoryOnly&&rumor.fromId===sellerId);
  }

  function aiSurplusCandidates(save,sellerId) {
    const market=ensureTransferMarket(save),needs=aiSquadNeeds(save,sellerId),players=needs.players,active=activeOutgoingRumors(save,sellerId),projectedSize=players.length-active.length;
    if(players.length<=AI_SQUAD_LIMITS.soft||projectedSize<=AI_SQUAD_LIMITS.ideal)return [];
    const activeByRole={};active.forEach(rumor=>{const role=positionUnit(rumor.position);activeByRole[role]=(activeByRole[role]||0)+1;});
    const playedMatches=sellerId===save.clubId?Number(save.played||0):Math.max(0,Math.round(daysBetween(`${save.season}-08-01`,save.date||`${save.season}-08-01`)/7));
    return players.map(player=>{
      const role=positionUnit(player.position),group=[...(needs.groups[role]||[])].sort((a,b)=>(b.overall||0)-(a.overall||0)),rank=group.findIndex(item=>sameTransferPlayer(item,player));
      const remainingInRole=group.length-Number(activeByRole[role]||0),roleTarget=AI_TRANSFER_TARGETS[role]||4,roleExcess=remainingInRole-roleTarget,minimum=AI_TRANSFER_MINIMUMS[role]||3;
      const contractRole=player.contract?.role||"",age=Number(player.age||24),overall=Number(player.overall||60),potential=Number(player.potential||overall),clubLevel=Number(needs.club.prestige||70);
      const controlled=player.id===save.controlledId||sameTransferPlayer(player,(save.squad||[]).find(item=>item.id===save.controlledId));
      const highPotential=age<=22&&potential>=Math.max(overall+4,clubLevel-3),coreRole=contractRole==="核心主力"||(contractRole==="常规主力"&&rank<roleTarget);
      const recentSigning=market.records.some(record=>record.toId===sellerId&&sameTransferPlayer(record,player)&&daysBetween(record.date,save.date||record.date)<90);
      const alreadyActive=active.some(rumor=>sameTransferPlayer(rumor,player));
      const protectedPlayer=controlled||rank<=0||highPotential||coreRole||recentSigning||alreadyActive||remainingInRole<=minimum||(!player.listed&&rank<roleTarget&&overall>=needs.needs[role].average);
      if(protectedPlayer||rank<0||roleExcess<=0)return null;
      const expectedMinutes=Math.max(1,playedMatches*72),minutes=Number(player.development?.minutes||Number(player.appearances||0)*72),usageRatio=playedMatches>=4?clamp(minutes/expectedMinutes,0,1):clamp((roleTarget-rank)/Math.max(1,roleTarget),0,1);
      const depthScore=(rank/Math.max(1,group.length-1))*24,usageScore=(1-usageRatio)*15,qualityGap=Math.max(0,needs.squadStrength-overall),ageScore=age>=31?6:age>=28?3:0,potentialProtection=Math.max(0,potential-overall)*(age<=24?1.3:.45);
      const contractScore=player.listed?18:player.contract?.endSeason<=save.season+1?5:0,urgency=(projectedSize-AI_SQUAD_LIMITS.soft)*4+Math.max(0,projectedSize-AI_SQUAD_LIMITS.hard)*5;
      const score=urgency+roleExcess*5+depthScore+usageScore+qualityGap*.8+ageScore+contractScore-potentialProtection;
      const reason=players.length>AI_SQUAD_LIMITS.hard?"阵容人数过多，球员不在主要轮换计划内":`${transferRoleLabel(role)}人员冗余，需要为轮换顺位靠后的球员寻找出场机会`;
      return {player,canonical:canonicalTransferPlayer(save,sellerId,player),sellerId,needs,role,rank,roleExcess,projectedSize,score,reason};
    }).filter(Boolean).sort((a,b)=>b.score-a.score||a.player.overall-b.player.overall||b.player.age-a.player.age);
  }

  function transferRoleLabel(role) {
    return ({goalkeeper:"门将",defence:"后防线",midfield:"中场",attack:"锋线"})[role]||role;
  }

  function aiCanSell(save,sellerId,player,indexedGroup=null) {
    const role=positionUnit(player.position),group=indexedGroup||aiSquadNeeds(save,sellerId).groups[role]||[],minimum=AI_TRANSFER_MINIMUMS[role]||3;
    if(group.length<=minimum)return false;
    const rank=[...group].sort((a,b)=>(b.overall||0)-(a.overall||0)).findIndex(item=>item.id===player.id||item.sourcePlayerId===player.id||comparableClubName(item.name)===comparableClubName(player.name)),sellerClub=clubById(sellerId);
    if(rank===0&&Number(player.overall||0)>=sellerClub.prestige-6)return false;
    return rank>=Math.max(1,Math.floor(group.length*.42))||(player.age>=29&&rank>=1)||Number(player.overall||0)<sellerClub.prestige-10;
  }

  function youngBreakoutScore(save,player,seller,buyer,date=save.date) {
    const age=Number(player.age||effectivePlayerAge(player,save)||25),overall=Number(player.overall||60),potential=Number(player.potential||overall),appearances=Number(player.appearances||0),minutes=Number(player.development?.minutes||appearances*72),average=appearances?averageRating(player):Number(player.lastRating||player.form||0),unit=positionUnit(player.position);
    if(age>23||buyer.prestige<82||buyer.prestige-seller.prestige<9||potential<Math.max(80,overall+4))return -Infinity;
    const attacking=Number(player.goals||0)*(["attack","midfield"].includes(unit)?1.8:.45)+Number(player.assists||0)*(["attack","midfield"].includes(unit)?1.55:.7),defending=(Number(player.tacklesWon||0)+Number(player.interceptions||0)+Number(player.clearances||0)*.3)/Math.max(3,appearances)*(["defence","goalkeeper"].includes(unit)?1.35:.4);
    const exposure=Math.min(13,appearances*.7+minutes/850),form=average?clamp((average-6.35)*16,-8,17):0,growth=Math.max(0,potential-overall),contract=Math.max(0,2-(Number(player.contract?.endSeason||save.season+3)-save.season))*4;
    return (24-age)*2.2+growth*1.3+(potential-78)*.8+exposure+form+Math.min(10,attacking)+Math.min(7,defending)+(buyer.prestige-seller.prestige)*.45+contract;
  }

  function aiCanPoachYoungTalent(save,sellerId,player,buyer,indexedGroup=null,date=save.date) {
    const seller=clubById(sellerId),role=positionUnit(player.position),group=indexedGroup||aiSquadNeeds(save,sellerId).groups[role]||[],minimum=AI_TRANSFER_MINIMUMS[role]||3,controlled=player.id===save.controlledId||sameTransferPlayer(player,(save.squad||[]).find(item=>item.id===save.controlledId));
    if(controlled||group.length<=minimum||youngBreakoutScore(save,player,seller,buyer,date)<25)return false;
    const active=activeOutgoingRumors(save,sellerId).filter(rumor=>positionUnit(rumor.position)===role).length;return group.length-active>minimum;
  }

  function transferFee(player,buyer,seller,sequence=0,save=state) {
    const value=Math.max(.5,currentPlayerMarketValue(player,save)||Math.max(1,Number(player.overall||65)-64)),potentialPremium=Math.max(0,Number(player.potential||player.overall)-Number(player.overall||0))*.045,prestigePressure=Math.max(0,seller.prestige-buyer.prestige)*.012,breakout=youngBreakoutScore(save,player,seller,buyer,save.date);
    const youthProtection=Number.isFinite(breakout)&&breakout>=25?clamp(.2+(23-Number(player.age||23))*.035+Math.max(0,(averageRating(player)||6.35)-6.6)*.22+Math.max(0,Number(player.potential||0)-84)*.025,.2,.72):0;
    const variation=.9+stableScoutingUnit(`${player.id}|${buyer.id}|${seller.id}|${sequence}`)*.28;
    return Number(Math.max(.5,value*(1+potentialPremium+prestigePressure+youthProtection)*variation).toFixed(1));
  }

  function aiTransferCandidate(save,buyerId,date=save.date) {
    const market=ensureTransferMarket(save),buyerNeeds=aiSquadNeeds(save,buyerId),buyer=buyerNeeds.club,budget=Number(market.budgets[buyerId]||buyer.budget||0),coach=aiCoachProfile(save,buyerId);
    const windowKey=transferWindow(date,save.season).key,roleActivity={},windowActivity=[...market.records.filter(record=>record.windowKey===windowKey),...market.rumors.filter(rumor=>rumor.windowKey===windowKey&&rumor.status==="active")];
    windowActivity.forEach(item=>{const role=positionUnit(item.position);roleActivity[role]=(roleActivity[role]||0)+1;});
    const need=weightedPick(Object.values(buyerNeeds.needs),item=>{
      const count=roleActivity[item.role]||0,goalkeeperCrowded=item.role==="goalkeeper"&&count>=Math.max(2,Math.ceil(windowActivity.length*.22));
      const positionalPreference=.82+stableScoutingUnit(`${coach.name}|transfer-role|${item.role}`)*.36;
      return goalkeeperCrowded?0:(Math.max(0,item.score)+3)*positionalPreference/(1+count*1.35);
    });if(!need||budget<1)return null;
    const sellerRoleGroups=aiTransferRuntimeCache?.save===save?aiTransferRuntimeCache.sellerRoleGroups:new Map();
    if(!sellerRoleGroups.size){REAL_PLAYERS.forEach(player=>{const clubId=currentPlayerClubId(save,player),key=`${clubId}|${positionUnit(player.position)}`;if(!sellerRoleGroups.has(key))sellerRoleGroups.set(key,[]);sellerRoleGroups.get(key).push(player);});[...sellerRoleGroups.keys()].filter(key=>key.startsWith(`${save.clubId}|`)).forEach(key=>sellerRoleGroups.delete(key));(save.squad||[]).forEach(player=>{const key=`${save.clubId}|${positionUnit(player.position)}`;if(!sellerRoleGroups.has(key))sellerRoleGroups.set(key,[]);sellerRoleGroups.get(key).push(player);});sellerRoleGroups.forEach(group=>group.sort((a,b)=>(b.overall||0)-(a.overall||0)));}
    const candidatePool=[...sellerRoleGroups.values()].flat();
    const candidates=candidatePool.filter(player=>{
      const sellerId=currentPlayerClubId(save,player);if(sellerId===buyerId)return false;
      if(market.records.some(record=>record.season===save.season&&record.playerId===player.id))return false;
      if(save.role==="coach"&&sellerId===save.clubId)return false;
      if(save.role==="player"&&sellerId===save.clubId&&comparableClubName(player.name)===comparableClubName((save.squad||[]).find(item=>item.id===save.controlledId)?.name||""))return false;
      const seller=clubById(sellerId),role=positionUnit(player.position),fee=transferFee(player,buyer,seller,market.sequence,save);
      const spendingLimit=budget*(.72+coach.risk*.14+coach.budgetDiscipline*.08);
      const sellerGroup=sellerRoleGroups.get(`${sellerId}|${role}`)||[],poaching=aiCanPoachYoungTalent(save,sellerId,player,buyer,sellerGroup,date);
      if(role!==need.role||fee>spendingLimit||(!aiCanSell(save,sellerId,player,sellerGroup)&&!poaching))return false;
      if(player.overall>=85&&buyer.prestige<85)return false;
      if(player.potential>=88&&buyer.prestige<80)return false;
      if(player.overall>buyer.prestige+6||player.overall<Math.max(54,buyer.prestige-18))return false;
      return true;
    }).map(player=>{
      const sellerId=currentPlayerClubId(save,player),seller=clubById(sellerId),fee=transferFee(player,buyer,seller,market.sequence,save),improvement=Number(player.overall||0)-need.average,growth=Math.max(0,Number(player.potential||player.overall)-Number(player.overall||0)),breakout=youngBreakoutScore(save,player,seller,buyer,date);
      const upward=buyer.prestige-seller.prestige,affordability=Math.max(-18,12-fee/Math.max(1,budget)*18),destinationFit=18-Math.abs((buyer.prestige-5)-Number(player.overall||0));
      const ageFit=player.age<=23?coach.youthTrust*7:player.age>=30?(1-coach.youthTrust)*4:3;
      const score=need.score*1.6+improvement*2.2+growth*(.55+coach.youthTrust)+ageFit+upward*.45+affordability*(.65+coach.budgetDiscipline*.55)+destinationFit+(Number.isFinite(breakout)?breakout*.34:0)+(stableScoutingUnit(`${market.season}|${buyerId}|${player.id}`)-.5)*16;
      return {player,sellerId,seller,buyer,fee,need,score,poaching:Number.isFinite(breakout)&&breakout>=25,breakout};
    }).sort((a,b)=>b.score-a.score||b.player.potential-a.player.potential||b.player.overall-a.player.overall);
    return candidates[0]||null;
  }

  function transferRumorExists(market,playerId,buyerId) {
    return market.rumors.some(rumor=>rumor.playerId===playerId&&rumor.toId===buyerId&&rumor.status==="active");
  }

  function aiSurplusBuyer(save,candidate,date=save.date) {
    const market=ensureTransferMarket(save),player=candidate.player,seller=clubById(candidate.sellerId),role=candidate.role,sequence=market.sequence;
    const discount=candidate.projectedSize>AI_SQUAD_LIMITS.hard?.84:candidate.projectedSize>AI_SQUAD_LIMITS.soft+1?.9:.95;
    const buyers=CLUBS.filter(club=>{
      if(club.id===candidate.sellerId||(save.role==="coach"&&club.id===save.clubId))return false;
      const buyerNeeds=aiSquadNeeds(save,club.id),budget=Number(market.budgets[club.id]||0),fee=Number((transferFee(candidate.canonical||player,club,seller,sequence,save)*discount).toFixed(1));
      if(buyerNeeds.players.length>=AI_SQUAD_LIMITS.soft||budget<fee)return false;
      if(Number(player.overall||0)>club.prestige+7||Number(player.overall||0)<Math.max(52,club.prestige-19))return false;
      if(Number(player.overall||0)>=85&&club.prestige<84)return false;
      return buyerNeeds.needs[role]&&buyerNeeds.needs[role].score>1;
    }).map(club=>{
      const buyerNeeds=aiSquadNeeds(save,club.id),need=buyerNeeds.needs[role],fee=Number((transferFee(candidate.canonical||player,club,seller,sequence,save)*discount).toFixed(1)),abilityGain=Number(player.overall||0)-need.average;
      const score=need.score*1.8+abilityGain*1.4+(club.prestige-seller.prestige)*.25+(AI_SQUAD_LIMITS.soft-buyerNeeds.players.length)*2+(stableScoutingUnit(`${date}|surplus-buyer|${club.id}|${player.id}`)-.5)*8;
      return {club,fee,need,score};
    }).sort((a,b)=>b.score-a.score);
    return buyers[0]||null;
  }

  function createAiSurplusSaleRumor(save,date,preferredSellerId=null) {
    const market=ensureTransferMarket(save),eligibleClubs=preferredSellerId?CLUBS.filter(club=>club.id===preferredSellerId):CLUBS.filter(club=>!(save.role==="coach"&&club.id===save.clubId)),sellers=eligibleClubs.map(club=>{
      const actual=aiClubPlayers(save,club.id).length,projected=actual-activeOutgoingRumors(save,club.id).length;
      return {club,projected,weight:actual>AI_SQUAD_LIMITS.soft?Math.max(0,projected-AI_SQUAD_LIMITS.ideal)*Math.max(1,actual-AI_SQUAD_LIMITS.soft):0};
    }).filter(item=>item.weight>0);
    while(sellers.length){
      const selected=weightedPick(sellers,item=>item.weight),index=sellers.indexOf(selected);if(index>=0)sellers.splice(index,1);
      const candidates=aiSurplusCandidates(save,selected.club.id);
      for(const candidate of candidates.slice(0,6)){
        const buyer=aiSurplusBuyer(save,candidate,date);if(!buyer)continue;
        const player=candidate.player,canonical=candidate.canonical,playerId=canonical?.id||player.sourcePlayerId||player.id;
        if(transferRumorExists(market,playerId,buyer.club.id))continue;
        const resolveDays=Math.round(rand(3,8)),confidence=clamp(Math.round(58+candidate.score*.24+buyer.need.score*.35),48,90);
        const rumor={id:`rumor-${market.season}-${++market.sequence}`,season:save.season,windowKey:transferWindow(date,save.season).key,createdDate:date,resolveDate:addDays(date,resolveDays),status:"active",sellerDriven:true,playerId,sourcePlayerId:player.id,playerName:player.name,position:player.position,overall:player.overall,potential:player.potential,fromId:candidate.sellerId,toId:buyer.club.id,fee:buyer.fee,confidence,reason:candidate.reason};
        market.rumors.unshift(rumor);
        const important=rumor.fromId===save.clubId||rumor.toId===save.clubId||rumor.fee>=45||rumor.overall>=84;
        reportTransferStory(save,`${clubById(rumor.fromId).name} 为 ${rumor.playerName} 寻找下家`,`${clubById(rumor.fromId).name} 正在主动精简一线队，${clubById(rumor.toId).name} 已就 ${rumor.playerName} 展开接触，预计费用约 ${money(rumor.fee)}。原因是${rumor.reason}。`,date,important);
        return rumor;
      }
    }
    return null;
  }

  function reportTransferStory(save,title,body,date,important=false) {
    if(!important)return;
    save.media.unshift({source:"Transfer Desk",title,body,date,type:"transfer"});save.media=save.media.slice(0,100);
  }

  function createUserClubEliteInterest(save,date) {
    const market=ensureTransferMarket(save),windowKey=transferWindow(date,save.season).key,seller=clubById(save.clubId);if(seller.prestige>=82||market.rumors.some(rumor=>rumor.eliteInterest&&rumor.windowKey===windowKey))return null;
    const controlled=(save.squad||[]).find(player=>player.id===save.controlledId),pool=save.role==="player"?(controlled?[controlled]:[]):(save.squad||[]),buyers=CLUBS.filter(club=>club.prestige>=82&&club.prestige-seller.prestige>=9&&Number(market.budgets[club.id]||0)>=8);
    const options=[];for(const player of pool){const role=positionUnit(player.position),sellerGroup=(save.squad||[]).filter(item=>positionUnit(item.position)===role);if(sellerGroup.length<=Number(AI_TRANSFER_MINIMUMS[role]||3))continue;for(const buyer of buyers){const breakout=youngBreakoutScore(save,player,seller,buyer,date),fee=transferFee(player,buyer,seller,market.sequence,save);if(breakout>=25&&fee<=Number(market.budgets[buyer.id]||0)*.88)options.push({player,buyer,breakout,fee});}}
    const target=options.sort((a,b)=>b.breakout-a.breakout||b.buyer.prestige-a.buyer.prestige)[0];if(!target)return null;
    const rumor={id:`rumor-${market.season}-${++market.sequence}`,season:save.season,windowKey,createdDate:date,resolveDate:addDays(date,10),status:"active",advisoryOnly:true,eliteInterest:true,playerId:target.player.sourcePlayerId||target.player.id,sourcePlayerId:target.player.id,playerName:target.player.name,position:target.player.position,overall:target.player.overall,potential:target.player.potential,fromId:save.clubId,toId:target.buyer.id,fee:target.fee,confidence:clamp(Math.round(48+target.breakout*.55),52,88),reason:"看中他在小俱乐部展现出的年龄、潜力与比赛表现"};market.rumors.unshift(rumor);
    addNotification({title:`豪门关注：${target.buyer.name} 正在考察 ${target.player.name}`,type:"transfer",date,detail:save.role==="player"?"你的赛季表现已经进入更高声望俱乐部的引援视野。这不是自动转会，未来决定仍取决于正式报价、俱乐部态度和你的职业选择。":"对方正在准备针对本队年轻核心的引援方案。系统不会替你出售球员，挂牌与最终决定仍由你掌握。",facts:[`${playerRoleLabel(target.player.position)} · ${target.player.age} 岁`,`本季 ${target.player.appearances||0} 场 · 评分 ${(averageRating(target.player)||6.35).toFixed(2)}`,`预估费用：${money(target.fee)}`]});
    reportTransferStory(save,`${target.buyer.name} 关注 ${target.player.name}`,`${target.buyer.name} 的球探持续考察这名年轻球员，年龄、潜力和本赛季表现是兴趣的主要来源。${seller.name} 对其估值约为 ${money(target.fee)}。`,date,true);return rumor;
  }

  function createAiTransferRumor(save,date) {
    const market=ensureTransferMarket(save),clubCounts=aiTransferRuntimeCache?.save===save?aiTransferRuntimeCache.clubCounts:{};if(!aiTransferRuntimeCache||aiTransferRuntimeCache.save!==save){REAL_PLAYERS.forEach(player=>{const clubId=currentPlayerClubId(save,player);clubCounts[clubId]=(clubCounts[clubId]||0)+1;});clubCounts[save.clubId]=(save.squad||[]).length;}
    const clubs=CLUBS.filter(club=>{
      if(save.role==="coach"&&club.id===save.clubId)return false;
      const size=clubCounts[club.id]||0,needs=aiSquadNeeds(save,club.id),criticalShortage=Object.values(needs.needs).some(need=>need.shortage>0);
      return Number(market.budgets[club.id]||0)>=3&&size>=14&&(size<AI_SQUAD_LIMITS.soft||criticalShortage);
    });
    if(!clubs.length)return null;
    const buyer=weightedPick(clubs,club=>Math.max(1,club.prestige-55)*Math.max(1,Number(market.budgets[club.id]||0)/20)),candidate=buyer&&aiTransferCandidate(save,buyer.id,date);
    if(!candidate||transferRumorExists(market,candidate.player.id,buyer.id))return null;
    const resolveDays=Math.round(rand(3,8)),confidence=clamp(Math.round(54+candidate.score*.48+(buyer.prestige-candidate.seller.prestige)*.8),32,92),roleReason=candidate.poaching?`看中他在小俱乐部展现出的年龄、潜力与比赛表现`:candidate.need.shortage?`${transferRoleLabel(candidate.need.role)}人数不足`:`希望提升${transferRoleLabel(candidate.need.role)}的即战力`;
    const rumor={id:`rumor-${market.season}-${++market.sequence}`,season:save.season,windowKey:transferWindow(date,save.season).key,createdDate:date,resolveDate:addDays(date,resolveDays),status:"active",playerId:candidate.player.id,playerName:candidate.player.name,position:candidate.player.position,overall:candidate.player.overall,potential:candidate.player.potential,fromId:candidate.sellerId,toId:buyer.id,fee:candidate.fee,confidence,reason:roleReason};
    market.rumors.unshift(rumor);
    const userInvolved=rumor.fromId===save.clubId||rumor.toId===save.clubId,important=userInvolved||rumor.fee>=55||rumor.overall>=85;
    reportTransferStory(save,`${clubById(rumor.toId).name} 有意引进 ${rumor.playerName}`,`${clubById(rumor.toId).name} 正在评估从 ${clubById(rumor.fromId).name} 引进 ${rumor.playerName} 的可能，预计费用约 ${money(rumor.fee)}。消息人士称，${roleReason}是这项兴趣的主要原因。`,date,important);
    return rumor;
  }

  function createCoachTransferReport(save,date) {
    if(save.role!=="coach")return null;
    const market=ensureTransferMarket(save),existing=market.rumors.some(rumor=>rumor.advisoryOnly&&rumor.status==="active");if(existing)return null;
    const target=aiTransferCandidate(save,save.clubId,date),ownNeeds=aiSquadNeeds(save,save.clubId),surplusCandidate=aiSurplusCandidates(save,save.clubId)[0],surplus=surplusCandidate?.player,surplusBuyer=surplusCandidate?aiSurplusBuyer(save,surplusCandidate,date):null;
    const outgoing=surplusBuyer&&(ownNeeds.players.length>AI_SQUAD_LIMITS.hard||Math.random()<.62);
    if(!target&&!outgoing)return null;
    let rumor;
    if(outgoing){
      const buyer=surplusBuyer.club;
      rumor={id:`rumor-${market.season}-${++market.sequence}`,season:save.season,windowKey:transferWindow(date,save.season).key,createdDate:date,resolveDate:addDays(date,Math.round(rand(7,14))),status:"active",advisoryOnly:true,sellerDriven:true,playerId:surplusCandidate.canonical?.id||surplus.sourcePlayerId||surplus.id,sourcePlayerId:surplus.id,playerName:surplus.name,position:surplus.position,overall:surplus.overall,potential:surplus.potential,fromId:save.clubId,toId:buyer.id,fee:surplusBuyer.fee,confidence:Math.round(rand(48,76)),reason:surplusCandidate.reason};
    }else{
      rumor={id:`rumor-${market.season}-${++market.sequence}`,season:save.season,windowKey:transferWindow(date,save.season).key,createdDate:date,resolveDate:addDays(date,Math.round(rand(7,14))),status:"active",advisoryOnly:true,playerId:target.player.id,playerName:target.player.name,position:target.player.position,overall:target.player.overall,potential:target.player.potential,fromId:target.sellerId,toId:save.clubId,fee:target.fee,confidence:Math.round(rand(42,78)),reason:target.need.shortage?`${transferRoleLabel(target.need.role)}人数不足`:`提升${transferRoleLabel(target.need.role)}强度`};
    }
    market.rumors.unshift(rumor);
    reportTransferStory(save,rumor.toId===save.clubId?`${clubById(save.clubId).name} 将 ${rumor.playerName} 列入考察名单`:`教练组建议为 ${rumor.playerName} 寻找下家`,rumor.toId===save.clubId?`俱乐部正在评估从 ${clubById(rumor.fromId).name} 引进 ${rumor.playerName} 的可行性，阵容分析认为球队需要${rumor.reason}。目前尚未提交正式报价。`:`阵容评估认为：${rumor.reason}。${clubById(rumor.toId).name} 可能愿意提供约 ${money(rumor.fee)}，但挂牌和接受报价仍由你决定。`,date,true);
    return rumor;
  }

  function transferCareerSegment(save,player,club,date,statsTracked=true) {
    const worldRecord=ensureWorldPlayerStats(save).players[worldPlayerKey(save,player,club.id)],worldSegment=worldRecord?.segments?.find(item=>item.clubId===club.id&&!item.endDate),source=worldSegment||player,appearances=Number(source.appearances||0),start=Number(player.development?.startOverall||player.overall||65),end=Number(player.overall||65);
    const segment={id:`career-transfer-${save.season}-${player.sourcePlayerId||player.id}-${date}-${club.id}`,season:save.season,club:club.name,clubId:club.id,appearances,goals:Number(source.goals||0),assists:Number(source.assists||0),average:Number((appearances?(Number(source.ratingTotal||0)/appearances):0).toFixed(2)),overallStart:start,overallEnd:end,change:end-start,partialSeason:true,endDate:date,dataUnavailable:!statsTracked};
    ["keyPasses","chancesCreated","successfulDribbles","progressivePasses","tackles","tacklesWon","interceptions","clearances","blocks","duels","duelsWon","recoveries","pressuresWon","saves","cleanSheets","yellowCards","redCards"].forEach(key=>{segment[key]=Number(source[key]||0);});
    return segment;
  }

  function transferContract(player,rumor,season) {
    const offered=rumor.contract||{},years=Number(offered.years)||3,wage=Math.max(4,Number(offered.weeklyWage||player.contract?.weeklyWage||player.wage)||Math.round(Number(player.overall||65)*1.5));
    return {...(player.contract||{}),...offered,weeklyWage:wage,signingBonus:Number(offered.signingBonus??player.contract?.signingBonus??Math.max(.1,wage*.035)),appearanceFee:Number(offered.appearanceFee??player.contract?.appearanceFee??Math.round(wage*.08)),releaseClause:Number(offered.releaseClause??player.contract?.releaseClause??Math.max(1,Number(player.value||2)*1.9)),role:offered.role||player.contract?.role||(Number(player.overall||0)>=85?"核心主力":Number(player.overall||0)>=76?"常规主力":"轮换球员"),endSeason:Number(offered.endSeason)||season+years};
  }

  function addUserSquadSigning(save,sourcePlayer,transferData={}) {
    if(save.squad.some(player=>comparableClubName(player.name)===comparableClubName(sourcePlayer.name)))return;
    const signing={...sourcePlayer,id:`ai-signing-${sourcePlayer.id}-${Date.now()}-${Math.random().toString(36).slice(2,6)}`,sourcePlayerId:sourcePlayer.id,club:save.clubId,clubId:save.clubId,joinedDate:transferData.date||save.date,careerStats:transferData.careerStats||sourcePlayer.careerStats||[],contract:transferData.contract||sourcePlayer.contract,fitness:94,morale:86,injured:0,injury:null};
    hydrateWorldPlayerStats(save,signing,save.clubId);
    ensurePlayerDevelopment(signing,save.season);ensurePlayerContract(signing,save.season);save.squad.push(signing);initializePlayerMarketValue(signing,save,transferData.date||save.date);
  }

  function completeTransfer(save,rumor,date,forced=false) {
    const market=ensureTransferMarket(save),userSquadPlayer=rumor.fromId===save.clubId?(save.squad||[]).find(player=>sameTransferPlayer(player,rumor)):null,canonical=REAL_PLAYER_ID_INDEX.get(rumor.playerId)||canonicalTransferPlayer(save,rumor.fromId,userSquadPlayer||rumor),sourcePlayer=userSquadPlayer||(canonical?hydrateWorldPlayerStats(save,{...canonical},rumor.fromId):null);
    const validSource=sourcePlayer&&(rumor.fromId===save.clubId?Boolean(userSquadPlayer):Boolean(canonical&&currentPlayerClubId(save,canonical)===rumor.fromId));if(!validSource||userSquadPlayer?.id===save.controlledId){rumor.status="collapsed";return false;}
    const buyer=clubById(rumor.toId),seller=clubById(rumor.fromId),budget=Number(market.budgets[buyer.id]||0),successChance=clamp(.58+(buyer.prestige-seller.prestige)/120+(rumor.confidence-50)/130,.38,.94);
    if(!forced&&(budget<rumor.fee||Math.random()>successChance)){rumor.status="collapsed";if(rumor.fromId===save.clubId||rumor.toId===save.clubId)reportTransferStory(save,`${rumor.playerName} 的转会谈判暂时停止`,`相关俱乐部未能在费用、阵容计划或球员意愿上达成一致，这笔交易目前不会继续推进。`,date,true);return false;}
    const statsTracked=Boolean(userSquadPlayer||ensureWorldPlayerStats(save).players[worldPlayerKey(save,sourcePlayer,seller.id)]),careerSegment=transferCareerSegment(save,sourcePlayer,seller,date,statsTracked),careerHistory=[...(sourcePlayer.careerStats||[])],newContract=transferContract(sourcePlayer,rumor,save.season);
    moveWorldPlayerClub(save,sourcePlayer,seller.id,buyer.id,date);market.budgets[buyer.id]=Number(Math.max(0,budget-rumor.fee).toFixed(1));market.budgets[seller.id]=Number((Number(market.budgets[seller.id]||0)+rumor.fee*.82).toFixed(1));market.clubOverrides[(canonical||sourcePlayer).id]=buyer.id;
    if(buyer.id===save.clubId)addUserSquadSigning(save,canonical||sourcePlayer,{date,contract:newContract,careerStats:[...careerHistory,careerSegment]});
    if(seller.id===save.clubId)save.squad=save.squad.filter(player=>player.id===save.controlledId||!sameTransferPlayer(player,sourcePlayer));
    if(buyer.id===save.clubId)save.funds=Number(Math.max(0,Number(save.funds||0)-rumor.fee).toFixed(1));
    if(seller.id===save.clubId)save.funds=Number((Number(save.funds||0)+rumor.fee*.82).toFixed(1));
    rumor.status="completed";rumor.completedDate=date;
    const record={id:`transfer-${market.season}-${++market.sequence}`,season:save.season,windowKey:rumor.windowKey,date,playerId:(canonical||sourcePlayer).id,playerName:sourcePlayer.name,position:sourcePlayer.position,overall:sourcePlayer.overall,potential:sourcePlayer.potential,fromId:seller.id,toId:buyer.id,fee:rumor.fee,reason:rumor.reason,clauses:rumor.clauses||null,contract:newContract,careerHistory,careerSegment};
    market.records.unshift(record);
    save.transferHistory=Array.isArray(save.transferHistory)?save.transferHistory:[];save.transferHistory.unshift(record);save.transferHistory=save.transferHistory.filter((item,index,list)=>list.findIndex(other=>other.id===item.id)===index).slice(0,500);
    const important=record.fromId===save.clubId||record.toId===save.clubId||record.fee>=45||record.overall>=84;
    reportTransferStory(save,`官方：${record.playerName} 加盟 ${buyer.name}`,`${buyer.name} 以约 ${money(record.fee)} 从 ${seller.name} 签下 ${record.playerName}。这笔交易针对${rumor.reason.replace("希望","")}，并符合球队的预算和阵容结构。`,date,important);
    return true;
  }

  function playerTransferRequestChance(save=state,player=controlledPlayer()) {
    const club=clubById(save.clubId),average=averageRating(player)||6.35,contractUrgency=Number(player.contract?.endSeason||save.season+3)<=save.season+1?10:0,performance=Math.max(0,average-6.35)*11+Math.min(9,Number(player.appearances||0)*.32),mobility=Math.max(0,Number(player.potential||player.overall)-Number(player.overall||0))*.7;
    return clamp(Math.round(68+Math.max(-8,Number(player.overall||0)-Number(club.prestige||70))*1.15+performance+mobility+contractUrgency),70,96);
  }

  function playerExternalMarketInterest(save,player) {
    const club=clubById(save.clubId),average=averageRating(player)||6.35,career=save.role==="player"?ensurePlayerCareer(save):null,contractUrgency=Number(player.contract?.endSeason||save.season+3)<=save.season+1?12:0,performance=Math.max(0,average-6.35)*14+Math.min(10,Number(player.appearances||0)*.34),mobility=Math.max(0,Number(player.potential||player.overall)-Number(player.overall||0))*.7,agentReach=(Number(career?.relationships?.agent||50)-50)*.18,marketBrief=career?.marketInterestUntil&&save.date<=career.marketInterestUntil?18:0;
    return clamp(Math.round(32+Math.max(-7,Number(player.overall||0)-Number(club.prestige||70))*3.1+performance+mobility+contractUrgency+agentReach+marketBrief),26,94);
  }

  function createControlledPlayerMarketOffer(save,date=save.date,requested=false) {
    if(save.role!=="player")return null;const player=(save.squad||[]).find(item=>item.id===save.controlledId),career=ensurePlayerCareer(save),market=ensureTransferMarket(save);if(!player||career.transferOffer?.status==="active")return null;
    if(requested&&player.transferRequestStatus!=="submitted")return null;
    if(!requested&&["submitted","offer-received"].includes(player.transferRequestStatus))return null;
    if(!requested&&career.lastTransferDate&&daysBetween(career.lastTransferDate,date)<60)return null;
    const interest=requested?playerTransferRequestChance(save,player):playerExternalMarketInterest(save,player);
    if(!requested&&stableScoutingUnit(`${date}|external-player-offer|${save.clubId}|${player.id}`)>interest/100)return null;
    const seller=clubById(save.clubId),role=positionUnit(player.position),windowKey=transferWindow(date,save.season).key,previousClubs=new Set((career.transferOfferHistory||[]).filter(item=>item.windowKey===windowKey).map(item=>item.toId));
    const candidates=CLUBS.filter(club=>club.id!==seller.id&&!previousClubs.has(club.id)).map(buyer=>{
      const budget=Number(market.budgets[buyer.id]||buyer.budget||0),needs=aiSquadNeeds(save,buyer.id),need=needs.needs[role],fee=Number((transferFee(player,buyer,seller,market.sequence,save)*(requested ? .84 : .96)).toFixed(1)),abilityFit=Number(player.overall||0)-Number(need?.average||buyer.prestige-12),prestigeFit=12-Math.abs((buyer.prestige-4)-Number(player.overall||0));
      if(!need||budget<fee||player.overall>buyer.prestige+9||player.overall<buyer.prestige-20)return null;
      const score=need.score*2.1+abilityFit*1.7+prestigeFit+(buyer.prestige-seller.prestige)*.25+(interest-65)*.55+(stableScoutingUnit(`${date}|request-offer|${buyer.id}|${player.id}`)-.5)*8;
      return {buyer,need,fee,score,interest};
    }).filter(Boolean).sort((a,b)=>b.score-a.score||b.buyer.prestige-a.buyer.prestige);
    const target=candidates[0];if(!target)return null;
    const wage=Math.max(4,Math.round(Number(player.contract?.weeklyWage||player.wage||20)*(1.06+Math.max(0,target.buyer.prestige-seller.prestige)*.006))),years=player.age<=23?4:player.age>=30?2:3,contract={weeklyWage:wage,signingBonus:Number(Math.max(.1,wage*.045).toFixed(1)),appearanceFee:Math.round(wage*.1),releaseClause:Number(Math.max(Number(player.value||1)*2.1,Number(player.contract?.releaseClause||0)).toFixed(1)),role:Number(player.overall||0)>=target.buyer.prestige-4?"常规主力":"轮换球员",years};
    const reason=requested?"球员已提交正式转会申请，买方加速推进谈判":"近期表现、能力与位置适配度促使买方直接报价",offer={id:`player-offer-${save.season}-${player.id}-${++market.sequence}`,status:"active",createdDate:date,deadlineDate:addDays(date,requested?12:9),windowKey,playerId:player.id,playerName:player.name,fromId:seller.id,toId:target.buyer.id,fee:target.fee,confidence:target.interest,reason,contract};career.transferOffer=offer;career.lastMarketOfferDate=date;player.transferRequestStatus="offer-received";
    save.transferRequestsLog.unshift({id:offer.id,date,type:requested?"player-offer":"player-external-offer",playerId:player.id,playerName:player.name,fromId:seller.id,toId:target.buyer.id,status:"active"});addNotification({title:`正式报价：${target.buyer.name} 希望签下 ${player.name}`,type:"transfer",date,detail:requested?"提交转会申请后，经纪人已将你的离队意愿传达给市场。对方送来正式报价，最终去留由你决定。":"对方球探持续考察了你的表现，俱乐部决定直接送来正式报价。是否转会完全由你决定。",facts:[`转会费：${money(target.fee)}`,`周薪：€${wage}K · ${years} 年`,`队内角色：${contract.role}`]});reportTransferStory(save,`${target.buyer.name} 向 ${player.name} 提交正式报价`,requested?`${player.name} 提交转会申请后，${target.buyer.name} 加快了谈判进程。预计转会费为 ${money(target.fee)}。`:`${target.buyer.name} 持续跟进 ${player.name} 的位置表现和市场价值，现已向 ${seller.name} 提交正式报价。`,date,true);return offer;
  }

  function createPlayerTransferRequestOffer(save,date=save.date) {return createControlledPlayerMarketOffer(save,date,true);}
  function createUnsolicitedControlledPlayerOffer(save,date=save.date) {return createControlledPlayerMarketOffer(save,date,false);}

  function createPlayerLoanOffer(save,date=save.date) {
    if(save.role!=="player"||!transferWindow(date,save.season).open)return null;const career=ensurePlayerCareer(save),player=(save.squad||[]).find(item=>item.id===save.controlledId),market=ensureTransferMarket(save);if(!player||!career.loanSearchUntil||date>career.loanSearchUntil||career.transferOffer?.status==="active")return null;
    const seller=clubById(save.clubId),role=positionUnit(player.position),previous=new Set((career.transferOfferHistory||[]).filter(item=>item.loan&&item.windowKey===transferWindow(date,save.season).key).map(item=>item.toId)),candidates=CLUBS.filter(club=>club.id!==seller.id&&!previous.has(club.id)).map(buyer=>{const need=aiSquadNeeds(save,buyer.id).needs[role];if(!need||player.overall>buyer.prestige+12||player.overall<buyer.prestige-18)return null;const startingChance=need.score*2.2+Math.max(0,player.overall-need.average)*2.4+Math.max(0,8-Math.abs(buyer.prestige-player.overall))*1.3+(stableScoutingUnit(`${date}|loan|${buyer.id}|${player.id}`)-.5)*8;return {buyer,need,score:startingChance};}).filter(Boolean).sort((a,b)=>b.score-a.score);
    const target=candidates[0];if(!target)return null;const contract={...(player.contract||{}),weeklyWage:Number(player.contract?.weeklyWage||player.wage||20),signingBonus:0,appearanceFee:Number(player.contract?.appearanceFee||0),releaseClause:Number(player.contract?.releaseClause||player.value*2),role:target.need.shortage?"常规主力":"轮换球员",years:0},offer={id:`loan-offer-${save.season}-${player.id}-${++market.sequence}`,loan:true,status:"active",createdDate:date,deadlineDate:addDays(date,9),windowKey:transferWindow(date,save.season).key,playerId:player.id,playerName:player.name,fromId:seller.id,toId:target.buyer.id,fee:0,confidence:clamp(Math.round(58+target.score*.55),55,94),reason:"外租申请获批，目标俱乐部承诺提供比赛机会",contract};career.transferOffer=offer;career.lastMarketOfferDate=date;player.transferRequestStatus="offer-received";save.transferRequestsLog.unshift({id:offer.id,date,type:"player-loan-offer",playerId:player.id,playerName:player.name,fromId:seller.id,toId:target.buyer.id,status:"active"});addNotification({title:`正式租借方案：${target.buyer.name}`,type:"transfer",date,detail:"俱乐部已经同意外租，对方承诺根据状态提供一线队机会。你可以接受、拒绝或稍后决定。",facts:[`租期：至 ${save.season}/${String(save.season+1).slice(2)} 赛季结束`,`计划角色：${contract.role}`,`工资仍按现有合同执行`]});return offer;
  }

  function createUserClubExternalOffer(save,date=save.date) {
    if(save.role!=="coach")return null;const market=ensureTransferMarket(save),windowKey=transferWindow(date,save.season).key;if(market.userOffers.some(offer=>offer.status==="active"))return null;
    if(stableScoutingUnit(`${date}|user-club-external-bid|${save.clubId}`)>.84)return null;
    const seller=clubById(save.clubId),options=[];
    for(const player of save.squad||[]){
      const role=positionUnit(player.position),sameRole=(save.squad||[]).filter(item=>positionUnit(item.position)===role),depth=Math.max(0,sameRole.length-Number(AI_TRANSFER_MINIMUMS[role]||2));
      for(const buyer of CLUBS){
        if(buyer.id===seller.id)continue;
        const needs=aiSquadNeeds(save,buyer.id),need=needs.needs[role],budget=Number(market.budgets[buyer.id]||buyer.budget||0),fee=Number((transferFee(player,buyer,seller,market.sequence,save)*(player.listed?.95:1)).toFixed(1));
        if(!need||budget<fee||player.overall>buyer.prestige+9||player.overall<buyer.prestige-20)continue;
        const performance=Math.max(0,(averageRating(player)||6.35)-6.35)*8+Math.min(7,Number(player.appearances||0)*.24),listedBoost=player.listed?18:0,appeal=need.score*2+Math.max(0,player.overall-need.average)*1.8+Math.max(0,player.potential-player.overall)*.45+performance+depth*2+(buyer.prestige-seller.prestige)*.2+listedBoost+(stableScoutingUnit(`${date}|club-offer|${buyer.id}|${player.id}`)-.5)*8;
        options.push({player,buyer,fee,need,appeal});
      }
    }
    const target=options.sort((a,b)=>b.appeal-a.appeal||b.buyer.prestige-a.buyer.prestige)[0];if(!target)return null;
    const offer={id:`club-offer-${save.season}-${target.player.id}-${++market.sequence}`,type:"external-bid",status:"active",createdDate:date,deadlineDate:addDays(date,8),windowKey,playerId:target.player.sourcePlayerId||target.player.id,sourcePlayerId:target.player.id,playerName:target.player.name,position:target.player.position,overall:target.player.overall,potential:target.player.potential,fromId:seller.id,toId:target.buyer.id,fee:target.fee,confidence:clamp(Math.round(54+target.appeal*.42),52,94),reason:target.need.shortage?`${transferRoleLabel(target.need.role)}人员不足`:`看中其近期表现与位置适配`};market.userOffers.unshift(offer);
    save.transferRequestsLog.unshift({id:offer.id,date,type:"club-external-offer",playerId:offer.sourcePlayerId,playerName:offer.playerName,fromId:seller.id,toId:offer.toId,status:"active"});addNotification({title:`外部报价：${target.buyer.name} 希望签下 ${target.player.name}`,type:"transfer",date,detail:"对方已提交可执行的正式报价。球队出售与否由你决定，报价不会被 AI 自动接受。",facts:[`转会费：${money(target.fee)}`,`${playerRoleLabel(target.player.position)} · ${target.player.age} 岁`,`报价截止：${formatDate(offer.deadlineDate,false)}`]});reportTransferStory(save,`${target.buyer.name} 报价 ${target.player.name}`,`${target.buyer.name} 已向 ${seller.name} 提交正式报价，主要原因是${offer.reason}。`,date,true);return offer;
  }

  function acceptUserClubExternalOffer(id) {const market=ensureTransferMarket(state),offer=market.userOffers.find(item=>item.id===id&&item.status==="active");if(!offer)return;const rumor={...offer,status:"active"};if(!completeTransfer(state,rumor,state.date,true)){offer.status="collapsed";toast("该报价已经无法完成");saveState();render();return;}offer.status="completed";offer.completedDate=state.date;state.transferRequestsLog.forEach(item=>{if(item.id===offer.id)item.status="completed";});modal=null;saveState();render();toast("已接受外部报价，转会完成");}
  function rejectUserClubExternalOffer(id) {const market=ensureTransferMarket(state),offer=market.userOffers.find(item=>item.id===id&&item.status==="active");if(!offer)return;offer.status="rejected";offer.rejectedDate=state.date;state.transferRequestsLog.forEach(item=>{if(item.id===offer.id)item.status="rejected";});addNotification({title:`已拒绝 ${clubById(offer.toId).name} 对 ${offer.playerName} 的报价`,type:"transfer",date:state.date,detail:"球员继续留队，其他俱乐部仍可能在窗口内再次接触。",facts:[`拒绝金额：${money(offer.fee)}`,`报价球队：${clubById(offer.toId).name}`]});modal=null;saveState();render();toast("已拒绝外部报价");}

  function completeControlledPlayerTransfer(offer) {
    const player=controlledPlayer(),market=ensureTransferMarket(state),seller=clubById(state.clubId),buyer=clubById(offer.toId),loan=Boolean(offer.loan);if(!player||!buyer)return false;
    syncWorldPlayerSnapshot(state,player,seller.id);const careerSegment=transferCareerSegment(state,player,seller,state.date,true),careerHistory=[...(player.careerStats||[])],contract=loan?{...player.contract}:transferContract(player,{contract:offer.contract},state.season),record={id:`${loan?"loan":"transfer"}-${market.season}-${++market.sequence}`,type:loan?"loan":"transfer",season:state.season,windowKey:offer.windowKey,date:state.date,playerId:player.sourcePlayerId||player.id,playerName:player.name,position:player.position,overall:player.overall,potential:player.potential,fromId:seller.id,toId:buyer.id,fee:loan?0:offer.fee,reason:loan?"球员外租申请获批":"球员正式转会申请获批",contract,careerHistory,careerSegment};
    const budget=Number(market.budgets[buyer.id]||buyer.budget||0);if(!loan&&budget<offer.fee)return false;if(!loan){market.budgets[buyer.id]=Number(Math.max(0,budget-offer.fee).toFixed(1));market.budgets[seller.id]=Number((Number(market.budgets[seller.id]||0)+offer.fee*.82).toFixed(1));}market.clubOverrides[player.sourcePlayerId||player.id]=buyer.id;
    moveWorldPlayerClub(state,player,seller.id,buyer.id,state.date);const moved={...player,club:buyer.id,clubId:buyer.id,joinedDate:state.date,careerStats:[...careerHistory,careerSegment],contract,weeklyWage:contract.weeklyWage,wage:contract.weeklyWage,fitness:94,morale:84,injured:0,injury:null,consecutiveStarts:0,lastMatchMinutes:0,lastMatchDate:null,lastSelectionStatus:null,transferRequestStatus:"completed"};delete moved.development;ensurePlayerDevelopment(moved,state.season);initializePlayerMarketValue(moved,state,state.date);
    const newSquad=createSquad(buyer,moved);newSquad.forEach(item=>{hydrateWorldPlayerStats(state,item,buyer.id);ensurePlayerContract(item,state.season);ensurePlayerDevelopment(item,state.season);});const controlledIndex=newSquad.findIndex(item=>item.id==="controlled");newSquad[controlledIndex>=0?controlledIndex:0]=moved;state.clubId=buyer.id;state.squad=newSquad;state.controlledId="controlled";state.schedule=generateSchedule(buyer,state.season,moved).filter(fixture=>fixture.date>=state.date);const buyerLeague=state.majorLeagueWorld?.leagues?.[buyer.league],buyerStanding=buyerLeague?.clubs?.find(item=>item.id===buyer.id),buyerTable=buyerLeague?majorStandings(buyerLeague):[];state.played=Number(buyerStanding?.p||0);state.wins=Number(buyerStanding?.w||0);state.draws=Number(buyerStanding?.d||0);state.losses=Number(buyerStanding?.l||0);state.points=Number(buyerStanding?.pts||0);state.leaguePosition=Math.max(1,buyerTable.findIndex(item=>item.id===buyer.id)+1);state.competitionProgress={europe:createEuropeanProgress(buyer,state.season),cups:{},international:{}};state.majorLeagueId=buyer.league;rebuildEuropeanWorld(state);state.funds=Number(market.budgets[buyer.id]||buyer.budget||0);state.activeMatch=null;
    market.records.unshift(record);state.transferHistory=Array.isArray(state.transferHistory)?state.transferHistory:[];state.transferHistory.unshift(record);state.transferHistory=state.transferHistory.filter((item,index,list)=>list.findIndex(other=>other.id===item.id)===index).slice(0,500);const career=ensurePlayerCareer();career.transferOffer={...offer,status:"accepted",completedDate:state.date};career.transferOfferHistory.unshift(career.transferOffer);career.transferOfferHistory=career.transferOfferHistory.slice(0,20);career.trust=55;career.chemistry=54;career.relationships={...career.relationships,coach:52,teammates:52,captain:50};career.status="新环境适应";career.contractStance=loan?"外租效力中":"已转会";career.lastTransferDate=state.date;if(loan){career.loanParentClubId=seller.id;career.loanEndSeason=state.season;career.loanSearchUntil=null;}state.transferRequestsLog.forEach(item=>{if(item.id===offer.id)item.status="completed";});addNotification({title:loan?`租借完成：${moved.name} 加盟 ${buyer.name}`:`官方：${moved.name} 加盟 ${buyer.name}`,type:"transfer",date:state.date,detail:loan?`你将为 ${buyer.name} 效力至本赛季结束，原合同与母队归属保持不变。当季累计数据继续保留，并按两家俱乐部分段记录。`:"转会申请已获批。当季出场、进球、助攻、评分及细分数据全部延续，同时开始记录新俱乐部阶段。",facts:[`${seller.name} → ${buyer.name}`,`当季累计：${moved.appearances||0} 场 · ${moved.goals||0} 球 · ${moved.assists||0} 助攻`,loan?"形式：赛季租借":`转会费：${money(offer.fee)}`,loan?`计划角色：${offer.contract?.role||"轮换球员"}`:`新合同至 ${contract.endSeason} 年 · ${contract.role}`]});state.media.unshift({source:"Transfer Desk",title:loan?`租借：${moved.name} 加盟 ${buyer.name}`:`官方：${moved.name} 加盟 ${buyer.name}`,body:loan?`${moved.name} 将从 ${seller.name} 租借至 ${buyer.name}，租期到本赛季结束。`:`${buyer.name} 以 ${money(offer.fee)} 从 ${seller.name} 签下 ${moved.name}。球员此前已提交正式转会申请。`,date:state.date,type:"transfer"});return true;
  }

  function acceptPlayerTransferOffer(id) {const offer=ensurePlayerCareer()?.transferOffer;if(!offer||offer.id!==id||offer.status!=="active")return;if(!completeControlledPlayerTransfer(offer)){toast("买方预算或报价状态已发生变化");return;}modal=null;saveState();render();toast(offer.loan?"租借已经完成，新的出场竞争开始了":"转会已经完成，欢迎来到新俱乐部");}

  function rejectPlayerTransferOffer(id) {const career=ensurePlayerCareer(),offer=career?.transferOffer;if(!offer||offer.id!==id||offer.status!=="active")return;offer.status="rejected";offer.rejectedDate=state.date;career.transferOfferHistory.unshift(offer);career.transferOfferHistory=career.transferOfferHistory.slice(0,20);const player=controlledPlayer();player.transferRequestStatus=offer.loan?null:"submitted";state.transferRequestsLog.forEach(item=>{if(item.id===offer.id)item.status="rejected";});addNotification({title:`你拒绝了 ${clubById(offer.toId).name} 的${offer.loan?"租借方案":"报价"}`,type:"transfer",date:state.date,detail:offer.loan?"外租许可仍然有效，经纪人会继续联系其他能提供比赛时间的球队。":"转会申请仍然有效，市场会在之后继续寻找其他合适机会。",facts:[offer.loan?"形式：赛季租借":`拒绝报价：${money(offer.fee)}`,`当前合同至 ${player.contract?.endSeason} 年`]});modal=null;saveState();render();toast(offer.loan?"已拒绝该租借方案":"已拒绝该报价");}

  function simulateTransferMarket(save,targetDate) {
    const market=ensureTransferMarket(save);if(market.season!==save.season)return;
    while(market.nextTickDate<=targetDate){
      const tickDate=market.nextTickDate,windowInfo=transferWindow(tickDate,save.season);
      market.rumors.filter(rumor=>rumor.status==="active"&&rumor.resolveDate<=tickDate).forEach(rumor=>{if(rumor.advisoryOnly)rumor.status="expired";else completeTransfer(save,rumor,tickDate);});
      market.userOffers.filter(offer=>offer.status==="active"&&offer.deadlineDate<tickDate).forEach(offer=>{offer.status="expired";offer.expiredDate=tickDate;save.transferRequestsLog.forEach(item=>{if(item.id===offer.id)item.status="expired";});if(save.role==="coach")addNotification({title:`${clubById(offer.toId).name} 对 ${offer.playerName} 的报价已过期`,type:"transfer",date:tickDate,detail:"你没有在截止日前答复，对方已撤回报价。其他球队仍可能在转会窗继续接触。",facts:[`原报价：${money(offer.fee)}`,`球员：${offer.playerName}`]});});
      if(windowInfo.open){const daysLeft=daysBetween(tickDate,windowInfo.end),attempts=daysLeft<=7?5:daysLeft<=21?4:2;aiTransferRuntimeCache=createAiTransferRuntimeCache(save,tickDate);try{createPlayerLoanOffer(save,tickDate);createPlayerTransferRequestOffer(save,tickDate);createUnsolicitedControlledPlayerOffer(save,tickDate);createUserClubExternalOffer(save,tickDate);createUserClubEliteInterest(save,tickDate);for(let attempt=0;attempt<attempts;attempt++){if(save.role==="player")createAiSurplusSaleRumor(save,tickDate,save.clubId);createAiSurplusSaleRumor(save,tickDate);if(attempt===0||Math.random()<(daysLeft<=7?.92:.74))createAiTransferRumor(save,tickDate);}createCoachTransferReport(save,tickDate);}finally{aiTransferRuntimeCache=null;}}
      market.nextTickDate=addDays(tickDate,transferTickDelay(tickDate,save.season));
    }
    market.rumors.filter(rumor=>rumor.status==="active"&&rumor.resolveDate<=targetDate).forEach(rumor=>{if(rumor.advisoryOnly)rumor.status="expired";else completeTransfer(save,rumor,targetDate);});
    market.currentDate=targetDate;market.records=market.records.slice(0,160);market.rumors=market.rumors.slice(0,120);market.userOffers=market.userOffers.slice(0,60);
  }

  function transferSquadNeeds() {
    const club=clubById(state.clubId),groups=Object.fromEntries(Object.keys(TRANSFER_ROLE_TARGETS).map(role=>[role,[]]));
    state.squad.forEach(player=>groups[transferRole(player.position)].push(player));
    return Object.fromEntries(Object.entries(TRANSFER_ROLE_TARGETS).map(([role,target])=>{
      const players=groups[role].sort((a,b)=>b.overall-a.overall),core=players.slice(0,target);
      const average=core.length?core.reduce((sum,player)=>sum+player.overall,0)/core.length:club.prestige-18;
      const shortage=Math.max(0,target-players.length),qualityGap=Math.max(0,club.prestige-4-average);
      return [role,{score:clamp(shortage*6+qualityGap*.9,0,30),average,count:players.length,target}];
    }));
  }

  function transferRecommendations(limit=8) {
    const club=clubById(state.clubId),needs=transferSquadNeeds(),funds=Math.max(1,Number(state.funds)||club.budget||1);
    const ownNames=new Set(state.squad.map(player=>comparableClubName(player.name)));
    const minimumOverall=Math.max(58,club.prestige-16);
    const candidates=REAL_PLAYERS.filter(player=>{
      const currentClubId=currentPlayerClubId(state,player);
      if(currentClubId===state.clubId||ownNames.has(comparableClubName(player.name)))return false;
      return player.overall>=minimumOverall||player.potential>=club.prestige-5;
    }).map(player=>{
      const currentClubId=currentPlayerClubId(state,player),sourceClub=clubById(currentClubId),role=transferRole(player.position),need=needs[role];
      const value=Math.max(.5,currentPlayerMarketValue(player,state)||Math.max(1,player.overall-64)),age=effectivePlayerAge(player,state);
      const affinity=stableScoutingUnit(`${club.id}|${player.id}|${state.season}`),budgetRatio=funds/value;
      const improvement=clamp(player.overall-need.average,-10,12),qualityFit=16-Math.abs((club.prestige-5)-player.overall)*.75;
      const growth=Math.max(0,player.potential-player.overall)*1.15+(player.age<=21?4:player.age<=24?2:0);
      const affordability=budgetRatio>=1?10+Math.min(7,(budgetRatio-1)*4):-Math.min(30,(1-budgetRatio)*34);
      const score=need.score+improvement*1.15+qualityFit+growth+affordability+(affinity-.5)*44+(sourceClub.league===club.league?2:0);
      const prestigeDelta=club.prestige-sourceClub.prestige;
      const interest=clamp(Math.round(47+prestigeDelta*1.65+need.score*.55+(affinity-.5)*16+(budgetRatio>=1?5:-9)),5,93);
      const reason=need.score>=17?`${playerRoleLabel(player.position)}重点补强`:improvement>=4?"提升位置即战力":player.potential-player.overall>=5?"潜力投资":"阵容适配";
      return {...player,clubId:currentClubId,club:sourceClub.name,age,value,interest,score,reason,role};
    }).sort((a,b)=>b.score-a.score||b.potential-a.potential||b.overall-a.overall);
    const selected=[],roleCounts={};
    for(const player of candidates){
      if((roleCounts[player.role]||0)>=3)continue;
      selected.push(player);roleCounts[player.role]=(roleCounts[player.role]||0)+1;
      if(selected.length===limit)break;
    }
    if(selected.length<limit){for(const player of candidates){if(selected.includes(player))continue;selected.push(player);if(selected.length===limit)break;}}
    return selected;
  }

  function negotiationById(id) { return (state.transferNegotiations||[]).find(item=>item.id===id); }
  function transferPackageValue(terms) {
    return Number((Number(terms.fee||0)+Number(terms.installments||0)*.82+Number(terms.appearanceAddon||0)*.38+Number(terms.goalAddon||0)*.32+Number(terms.sellOn||0)*.012*Number(terms.fee||0)).toFixed(1));
  }
  function startNegotiation(player) {
    const current=(state.transferNegotiations||[]).find(item=>item.playerId===player.id&&!["completed","walked"].includes(item.status));
    if(current){modal={type:"negotiation",id:current.id};render();return;}
    const value=Math.max(.5,Number(player.value)||1),wage=Math.max(5,Number(player.wage)||Math.round(player.overall*1.5)),unit=stableScoutingUnit(`${player.id}|negotiation|${state.season}`);
    const session={id:`neg-${Date.now()}-${Math.random().toString(36).slice(2,6)}`,playerId:player.id,playerName:player.name,fromId:player.clubId,stage:"club",status:"active",round:1,clubPatience:100,agentPatience:100,createdDate:state.date,lastUpdated:state.date,valuation:value,interest:player.interest,clubTarget:Number((value*(1.08+unit*.24)).toFixed(1)),agentTarget:Number((wage*(1.04+unit*.18)).toFixed(0)),terms:{fee:Number((value*.92).toFixed(1)),installments:Number((value*.12).toFixed(1)),appearanceAddon:Number((value*.05).toFixed(1)),goalAddon:0,sellOn:5},contract:{weeklyWage:Math.round(wage),signingBonus:Number(Math.max(.2,value*.025).toFixed(1)),appearanceFee:Math.round(wage*.08),releaseClause:Number((value*2).toFixed(1)),role:player.overall>=84?"核心主力":"常规主力",years:4},history:[{round:0,speaker:"球探主管",text:`${clubById(player.clubId).name} 对球员估值约 ${money(value)}。经纪人希望先看到明确的球队计划。`}],playerSnapshot:{...player}};
    state.transferNegotiations.unshift(session);modal={type:"negotiation",id:session.id};saveState();render();
  }
  function negotiationPatienceLoss(ratio,changes) { return Math.round((ratio<.65?28:ratio<.82?14:ratio>1.55?7:3)+Math.max(0,changes-2)*4); }
  function submitClubOffer(session) {
    const terms={fee:Number(document.getElementById("neg-fee")?.value),installments:Number(document.getElementById("neg-installments")?.value),appearanceAddon:Number(document.getElementById("neg-appearance")?.value),goalAddon:Number(document.getElementById("neg-goals")?.value),sellOn:Number(document.getElementById("neg-sell-on")?.value)};
    if(Object.values(terms).some(value=>!Number.isFinite(value)||value<0)||terms.fee<=0){toast("请填写有效的转会条款");return;}
    const total=Number((terms.fee+terms.installments).toFixed(1));if(total>state.funds){toast("固定转会支出超过可用预算");return;}
    const previous=session.terms,changes=Object.keys(terms).filter(key=>Math.abs(Number(terms[key])-Number(previous[key]))>.01).length,value=transferPackageValue(terms),ratio=value/session.clubTarget;session.terms=terms;session.round++;session.lastUpdated=state.date;
    if(ratio>=.96){session.stage="contract";session.history.push({round:session.round,speaker:clubById(session.fromId).name,text:`接受报价：固定部分 ${money(total)}，附加条款折算后总价值 ${money(value)}。可以与球员经纪人谈合同。`});toast("俱乐部接受报价，进入个人合同谈判");}
    else{session.clubPatience=clamp(session.clubPatience-negotiationPatienceLoss(ratio,changes),0,100);const counter=Number((session.clubTarget*(.98+Math.random()*.05)).toFixed(1));session.terms.fee=Number(Math.max(1,counter-session.terms.installments*.82-session.terms.appearanceAddon*.38-session.terms.goalAddon*.32).toFixed(1));session.history.push({round:session.round,speaker:clubById(session.fromId).name,text:`报价仍低于估值。我们给出的还价以 ${money(session.terms.fee)} 基础费用为核心，耐心剩余 ${session.clubPatience}%。`});if(!session.clubPatience){session.status="walked";session.closedReason="出售俱乐部退出谈判";}}
    saveState();render();
  }
  function submitContractOffer(session) {
    const contract={weeklyWage:Number(document.getElementById("neg-wage")?.value),signingBonus:Number(document.getElementById("neg-signing")?.value),appearanceFee:Number(document.getElementById("neg-appearance-fee")?.value),releaseClause:Number(document.getElementById("neg-release")?.value),role:document.getElementById("neg-role")?.value,years:Number(document.getElementById("neg-years")?.value)};
    if(!contract.weeklyWage||contract.signingBonus<0||contract.appearanceFee<0||!contract.releaseClause){toast("请填写有效的合同条款");return;}
    const roleScore=({"核心主力":1.14,"常规主力":1.05,"轮换球员":.94,"替补球员":.82})[contract.role]||.9,releaseScore=contract.releaseClause>=session.valuation*2?.05:contract.releaseClause>=session.valuation*1.4?.12:.2;
    const value=contract.weeklyWage+contract.signingBonus*4+contract.appearanceFee*.3,valueTarget=session.agentTarget+session.valuation*.1,ratio=(value/valueTarget)*roleScore+releaseScore+(session.interest-50)/250;const previous=session.contract,changes=Object.keys(contract).filter(key=>String(contract[key])!==String(previous[key])).length;session.contract=contract;session.round++;
    if(ratio>=.98){
      const p=session.playerSnapshot,market=ensureTransferMarket(state),rumor={id:`manual-negotiation-${++market.sequence}`,season:state.season,windowKey:transferWindow(state.date,state.season).key,createdDate:state.date,resolveDate:state.date,status:"active",playerId:p.id,playerName:p.name,position:p.position,overall:p.overall,potential:p.potential,fromId:session.fromId,toId:state.clubId,fee:Number((session.terms.fee+session.terms.installments).toFixed(1)),confidence:100,reason:p.reason||"协商引援",clauses:{...session.terms},contract:{...contract}};
      market.rumors.unshift(rumor);completeTransfer(state,rumor,state.date,true);const signed=state.squad.find(player=>player.sourcePlayerId===p.id||player.id===p.id);if(signed)signed.contract={...contract,endSeason:state.season+contract.years};session.status="completed";session.stage="completed";session.history.push({round:session.round,speaker:"经纪人",text:`合同达成：周薪 €${Math.round(contract.weeklyWage)}K，定位为${contract.role}，合约 ${contract.years} 年。`});modal=null;toast(`${p.name} 已完成签约`);
    }else{session.agentPatience=clamp(session.agentPatience-negotiationPatienceLoss(ratio,changes),0,100);session.contract.weeklyWage=Math.round(session.agentTarget*(.98+Math.random()*.06));session.contract.signingBonus=Number(Math.max(session.contract.signingBonus,session.valuation*.03).toFixed(1));session.history.push({round:session.round,speaker:"球员经纪人",text:`待遇或球队角色还不够有说服力。新的周薪要求为 €${session.contract.weeklyWage}K，耐心剩余 ${session.agentPatience}%。`});if(!session.agentPatience){session.status="walked";session.closedReason="经纪人退出谈判";}}
    saveState();render();
  }
  function submitNegotiation() { const session=negotiationById(modal?.id);if(!session||session.status!=="active")return;if(session.stage==="club")submitClubOffer(session);else submitContractOffer(session); }
  function withdrawNegotiation(id) { const session=negotiationById(id);if(!session)return;session.status="walked";session.closedReason="我方主动退出";session.history.push({round:session.round,speaker:"我方",text:"结束本次谈判。"});modal=null;saveState();render(); }
  function toggleTransferList(playerId) { const player=state.squad.find(item=>item.id===playerId);if(!player)return;player.listed=!player.listed;state.transferRequestsLog.unshift({id:`list-${Date.now()}`,date:state.date,type:player.listed?"listed":"unlisted",playerId,playerName:player.name,status:"submitted"});addNotification({title:`董事会：${player.name} ${player.listed?"已被挂牌":"已撤出转会名单"}`,type:"transfer",date:state.date,detail:player.listed?"足球总监会向符合预算和阵容需求的俱乐部推荐这名球员，后续报价仍需主教练确认。":"足球总监已停止主动推介该球员。"});saveState();render(); }

  function renderTransfers() {
    const market=ensureTransferMarket(state),windowInfo=transferWindow(state.date,state.season),windowOpen=windowInfo.open,recommendations=transferRecommendations();transferRecommendationRegistry=recommendations;
    const club=clubById(state.clubId),seasonRecords=market.records.filter(record=>record.season===state.season&&(record.fromId===state.clubId||record.toId===state.clubId)).sort((a,b)=>b.date.localeCompare(a.date));
    const windowRecords=market.records.filter(record=>record.windowKey===windowInfo.key).sort((a,b)=>b.fee-a.fee||b.date.localeCompare(a.date)).slice(0,12);
    const rumors=market.rumors.filter(rumor=>rumor.windowKey===windowInfo.key&&rumor.status==="active").sort((a,b)=>(b.fromId===state.clubId||b.toId===state.clubId)-(a.fromId===state.clubId||a.toId===state.clubId)||b.confidence-a.confidence||b.fee-a.fee).slice(0,8);
    const spent=seasonRecords.filter(record=>record.toId===state.clubId).reduce((sum,record)=>sum+record.fee,0),income=seasonRecords.filter(record=>record.fromId===state.clubId).reduce((sum,record)=>sum+record.fee,0);
    const negotiations=(state.transferNegotiations||[]).filter(item=>item.status==="active"),finance=ensureClubFinances(state),financeEntries=finance.ledger.filter(entry=>Number(entry.season)===Number(state.season)).slice(0,8),operatingAllocated=financeEntries.filter(entry=>entry.type!=="season").reduce((sum,entry)=>sum+Number(entry.allocation||0),0),playerCareer=state.role==="player"?ensurePlayerCareer():null,playerOffer=playerCareer?.transferOffer?.status==="active"?playerCareer.transferOffer:null,clubOffer=state.role==="coach"?market.userOffers.find(offer=>offer.status==="active"):null,transferStatus=playerOffer?"已收到正式报价":controlledPlayer()?.transferRequestStatus==="submitted"?"已进入优先买家池":"尚未申请离队";
    return `<div class="page-heading"><span class="eyebrow">${windowOpen?"转会窗口开放":"转会窗口关闭"}</span><h2>转会中心</h2><p>转会费与个人合同分阶段谈判，报价结构、承诺和回复方式都会消耗对方耐心。</p></div>
      <section class="stats"><div class="stat"><div class="stat-label">可用预算</div><div class="stat-value">${money(state.funds)}</div><div class="stat-context">经营与注资 +${money(operatingAllocated)}</div></div><div class="stat"><div class="stat-label">赛季支出</div><div class="stat-value">${money(spent)}</div><div class="stat-context">${seasonRecords.filter(record=>record.toId===state.clubId).length} 名球员转入</div></div><div class="stat"><div class="stat-label">出售收入</div><div class="stat-value">${money(income)}</div><div class="stat-context">${seasonRecords.filter(record=>record.fromId===state.clubId).length} 名球员转出</div></div><div class="stat"><div class="stat-label">当前窗口</div><div class="stat-value transfer-window-value">${esc(windowInfo.label.replace("转会窗","窗"))}</div><div class="stat-context">${windowOpen?`开放至 ${formatDate(windowInfo.end,false)}`:"已关闭"}</div></div></section>
      <section class="panel club-finance-panel"><div class="panel-header"><h3>俱乐部财政与预算来源</h3><span class="meta">转播 · 比赛日 · 商业 · 注资</span></div><div class="table-wrap"><table><thead><tr><th>日期</th><th>来源</th><th>说明</th><th class="num">收入</th><th class="num">进入转会预算</th></tr></thead><tbody>${financeEntries.map(entry=>`<tr><td>${formatDate(entry.date,false)}</td><td><span class="tag ${entry.type==="owner"?"green":""}">${financeEntryLabel(entry)}</span></td><td>${esc(entry.detail||(entry.type==="operations"?`门票 ${money(entry.matchday||0)} · 球衣周边 ${money(entry.commercial||0)}`:"董事会赛季预算方案"))}</td><td class="num">${money(entry.gross||0)}</td><td class="num"><strong>+${money(entry.allocation||0)}</strong></td></tr>`).join("")||`<tr><td colspan="5"><div class="empty compact">本赛季财政账目将在收入结算后显示</div></td></tr>`}</tbody></table></div></section>
      ${state.role==="player"?`<div class="panel transfer-actions-panel"><div class="panel-header"><h3>个人转会立场</h3><span class="meta">${transferStatus}</span></div><div class="panel-body">${playerOffer?`<section class="career-alert renewal"><div>${icon("file-signature")}<span><strong>${esc(clubById(playerOffer.toId).name)} 已提交正式${playerOffer.loan?"租借方案":"转会报价"}</strong><small>${playerOffer.loan?"赛季租借 · 原合同继续":`转会费 ${money(playerOffer.fee)} · 周薪 €${Math.round(playerOffer.contract.weeklyWage)}K · ${playerOffer.contract.years} 年`} · ${esc(playerOffer.contract.role)} · ${formatDate(playerOffer.deadlineDate,false)} 前答复</small></span></div><button class="btn btn-primary" data-open-player-transfer-offer="${playerOffer.id}">查看方案</button></section>`:controlledPlayer()?.transferRequestStatus==="submitted"?`<div class="data-note">你的离队意愿已经进入市场优先候选池。符合预算、位置需求和实力匹配的俱乐部会优先评估，并以正式报价联系你。</div>`:""}<div class="grid grid-2"><button class="btn" id="request-transfer" ${!windowOpen||["submitted","offer-received"].includes(controlledPlayer()?.transferRequestStatus)?"disabled":""}>${icon("send")}正式提交转会申请</button><button class="btn" id="suggest-signing">${icon("message-square")}向教练建议引援</button></div></div></div>`:`<section class="panel transfer-actions-panel"><div class="panel-header"><h3>挂牌与离队管理</h3><span class="meta">${clubOffer?"收到外部正式报价":"向董事会提交正式名单"}</span></div>${clubOffer?`<div class="panel-body"><section class="career-alert renewal"><div>${icon("file-signature")}<span><strong>${esc(clubById(clubOffer.toId).name)} 报价 ${esc(clubOffer.playerName)}</strong><small>转会费 ${money(clubOffer.fee)} · ${playerRoleLabel(clubOffer.position)} · ${formatDate(clubOffer.deadlineDate,false)} 前回复</small></span></div><button class="btn btn-primary" data-open-user-club-offer="${clubOffer.id}">处理报价</button></section></div>`:""}<div class="transfer-list-squad">${[...state.squad].sort((a,b)=>a.overall-b.overall).slice(0,8).map(player=>`<div><span><strong>${esc(player.name)}</strong><small>${playerRoleLabel(player.position)} · ${player.overall} · ${money(player.value)}</small></span><button class="btn btn-sm ${player.listed?"btn-danger":""}" data-list-player="${esc(player.id)}">${player.listed?"撤销挂牌":"挂牌出售"}</button></div>`).join("")}</div></section>`}
      ${negotiations.length?`<section class="panel negotiation-desk"><div class="panel-header"><h3>谈判桌</h3><span class="meta">${negotiations.length} 项进行中</span></div><div class="negotiation-list">${negotiations.map(session=>`<button data-open-negotiation="${session.id}"><div><span class="tag ${session.stage==="contract"?"green":"amber"}">${session.stage==="contract"?"个人合同":"俱乐部报价"}</span><strong>${esc(session.playerName)}</strong><small>第 ${session.round} 轮 · ${esc(clubById(session.fromId).name)}</small></div><div class="patience-mini"><label>俱乐部 ${session.clubPatience}%</label><i><span style="width:${session.clubPatience}%"></span></i><label>经纪人 ${session.agentPatience}%</label><i><span style="width:${session.agentPatience}%"></span></i></div>${icon("chevron-right")}</button>`).join("")}</div></section>`:""}
      <div class="transfer-overview"><section class="panel"><div class="panel-header"><h3>${esc(club.name)} · 本赛季转会记录</h3><span class="meta">${seasonRecords.length} 笔 · 净支出 ${money(spent-income)}</span></div><div class="table-wrap"><table class="transfer-record-table"><thead><tr><th>日期</th><th>类型</th><th>球员</th><th>交易球队</th><th class="num">转会费</th></tr></thead><tbody>${seasonRecords.map(record=>{const incoming=record.toId===state.clubId,other=clubById(incoming?record.fromId:record.toId),playerClub=clubById(incoming?record.toId:record.fromId);return `<tr><td>${formatDate(record.date,false)}</td><td><span class="tag ${incoming?"green":"red"}">${incoming?"转入":"转出"}</span></td><td class="player-name"><strong>${playerNameLink(record,{name:record.playerName,clubName:playerClub.name})}</strong><span>${playerRoleLabel(record.position)} · ${record.overall}/${record.potential}</span></td><td><span class="transfer-club">${clubBadge(other,"club-badge-result")}<b>${esc(other.name)}</b></span></td><td class="num"><strong>${money(record.fee)}</strong></td></tr>`;}).join("")||`<tr><td colspan="5"><div class="empty compact">${state.season}/${String(state.season+1).slice(2)} 赛季尚无本队正式交易</div></td></tr>`}</tbody></table></div></section>
      <section class="panel"><div class="panel-header"><h3>正在发展的转会传闻</h3><span class="meta">兴趣、报价与谈判</span></div><div class="transfer-rumors">${rumors.map(rumor=>{const from=clubById(rumor.fromId),to=clubById(rumor.toId),userInvolved=rumor.fromId===state.clubId||rumor.toId===state.clubId;return `<article class="transfer-rumor ${userInvolved?"user-involved":""}"><div class="transfer-rumor-main"><span class="tag amber">可信度 ${rumor.confidence}%</span><strong>${playerNameLink(rumor,{name:rumor.playerName,clubName:from.name})}</strong><small>${playerRoleLabel(rumor.position)} · ${esc(from.name)} → ${esc(to.name)}</small></div><div class="transfer-rumor-fee"><b>${money(rumor.fee)}</b><span>${esc(rumor.reason)}</span></div></article>`;}).join("")||`<div class="empty compact">目前没有可信度足够高的活跃传闻</div>`}</div></section></div>
      <section class="panel transfer-important"><div class="panel-header"><h3>${esc(windowInfo.label)} · 重要转会</h3><span class="meta">按转会费从高到低 · 最近更新 ${formatDate(market.currentDate,false)}</span></div><div class="table-wrap"><table><thead><tr><th class="num">排名</th><th>球员</th><th>转出球队</th><th>转入球队</th><th>日期</th><th class="num">转会费</th></tr></thead><tbody>${windowRecords.map((record,index)=>{const from=clubById(record.fromId),to=clubById(record.toId);return `<tr><td class="num"><span class="scorer-rank">${index+1}</span></td><td class="player-name"><strong>${playerNameLink(record,{name:record.playerName,clubName:to.name})}</strong><span>${playerRoleLabel(record.position)} · 能力 ${record.overall} / 潜力 ${record.potential}</span></td><td><span class="transfer-club">${clubBadge(from,"club-badge-result")}<b>${esc(from.name)}</b></span></td><td><span class="transfer-club">${clubBadge(to,"club-badge-result")}<b>${esc(to.name)}</b></span></td><td>${formatDate(record.date,false)}</td><td class="num"><strong class="transfer-fee">${money(record.fee)}</strong></td></tr>`;}).join("")||`<tr><td colspan="6"><div class="empty compact">该转会窗尚无已完成的重要交易</div></td></tr>`}</tbody></table></div></section>
      <section class="panel"><div class="panel-header"><h3>球探推荐</h3><span class="meta">${esc(club.name)} · 按阵容缺口动态生成</span></div><div class="table-wrap"><table><thead><tr><th>球员</th><th>位置</th><th class="num">年龄</th><th class="num">能力 / 潜力</th><th class="num">估值</th><th class="num">加盟意愿</th><th></th></tr></thead><tbody>${recommendations.map((p,i)=>`<tr><td class="player-name"><strong>${playerNameLink(p,{clubName:p.club})}</strong><span>${esc(p.club)} · ${esc(p.reason)}</span></td><td><span class="tag">${playerRoleLabel(p.position)}</span></td><td class="num">${p.age}</td><td class="num"><span class="rating">${p.overall}</span> / ${p.potential}</td><td class="num">${money(p.value)}</td><td class="num">${p.interest}%</td><td class="num"><button class="btn btn-sm" data-transfer="${i}" ${!windowOpen?"disabled":""}>${state.role==="coach"?"报价":"建议"}</button></td></tr>`).join("")}</tbody></table></div></section>`;
  }

  function renderMedia() {
    return `<div class="page-heading"><span class="eyebrow">舆论与叙事</span><h2>媒体中心</h2><p>报道会根据比赛、转会、表现、伤病和荣誉动态生成。</p></div><div class="grid grid-main"><section class="panel"><div class="panel-header"><h3>新闻流</h3><span class="meta">${state.media.length} 篇</span></div>${state.media.map(m=>`<article class="media-item"><div class="media-source">${icon(m.type==="injury"?"activity":m.type==="transfer"?"repeat-2":"radio")} ${esc(m.source)}</div><h3>${esc(m.title)}</h3><p>${esc(m.body)}</p><div class="media-time">${formatDate(m.date)}</div></article>`).join("")}</section><aside class="panel"><div class="panel-header"><h3>媒体评价模型</h3></div><div class="panel-body"><div class="timeline"><div class="timeline-item"><span class="timeline-mark"></span><strong>事件权重</strong><p>比赛级别、转会金额、对手实力与赛事阶段决定热度。</p></div><div class="timeline-item"><span class="timeline-mark"></span><strong>叙事连续性</strong><p>连胜、低迷、伤愈回归与争冠形势形成长期话题。</p></div><div class="timeline-item"><span class="timeline-mark"></span><strong>角色关系</strong><p>玩家建议、转会申请与比赛决策改变媒体态度。</p></div></div></div></aside></div>`;
  }

  function renderCareer() {
    if(state.role!=="player"){
      const honors=(state.honors||[]).filter(h=>h.name!=="单场 MVP"),coachCareer=ensureCoachCareer(),decisions=coachCareer.storyHistory||[];
      return `<div class="page-heading"><span class="eyebrow">永久记录</span><h2>执教档案</h2><p>完整保存每个赛季的战绩、主要荣誉与关键管理决定。</p></div><section class="stats"><div class="stat"><div class="stat-label">执教赛季</div><div class="stat-value">${state.season-2025}</div><div class="stat-context">始于 2026-08-01</div></div><div class="stat"><div class="stat-label">正式比赛</div><div class="stat-value">${state.played}</div><div class="stat-context">胜 ${state.wins} · 平 ${state.draws} · 负 ${state.losses}</div></div><div class="stat"><div class="stat-label">执教积分</div><div class="stat-value">${state.points}</div><div class="stat-context">当前赛季累计</div></div><div class="stat"><div class="stat-label">主要荣誉</div><div class="stat-value">${honors.length}</div><div class="stat-context">俱乐部与国家队冠军</div></div></section><div class="grid grid-2"><section class="panel"><div class="panel-header"><h3>主要荣誉</h3></div>${renderCareerHonors(honors)}</section><section class="panel"><div class="panel-header"><h3>关键决策档案</h3><span class="meta">${decisions.length} 项</span></div>${decisions.length?`<div class="list">${decisions.slice(0,8).map(item=>`<div class="list-row"><div class="list-row-main"><div class="list-row-title">${esc(item.title)}：${esc(item.choice)}</div><div class="list-row-sub">${formatDate(item.date,false)} · ${esc(item.effect||"已写入球队结算")}</div></div></div>`).join("")}</div>`:`<div class="empty compact">训练、医疗、更衣室与董事会决定会记录在这里</div>`}</section><section class="panel"><div class="panel-header"><h3>赛季历史</h3></div>${state.history.length?`<div class="list">${state.history.map(h=>`<div class="list-row"><div class="list-row-main"><div class="list-row-title">${h.season}/${String(h.season+1).slice(2)} 赛季</div><div class="list-row-sub">${esc(h.club)} · ${h.played} 场 · ${h.wins} 胜 · 联赛第 ${h.position}</div></div></div>`).join("")}</div>`:`<div class="empty">首个赛季进行中</div>`}</section></div>`;
    }
    const p=controlledPlayer(),archive=playerCareerArchive(p),keeper=positionUnit(p.position)==="GK";
    const creative=[["关键传球",archive.totals.keyPasses],["创造机会",archive.totals.chancesCreated],["成功盘带",archive.totals.successfulDribbles],["推进传球",archive.totals.progressivePasses]],defensive=[["成功抢断",`${archive.totals.tacklesWon} / ${archive.totals.tackles}`],["拦截",archive.totals.interceptions],["解围",archive.totals.clearances],["封堵",archive.totals.blocks],["对抗成功",`${archive.totals.duelsWon} / ${archive.totals.duels}`],["夺回球权",archive.totals.recoveries],["压迫成功",archive.totals.pressuresWon]],goalkeeping=[["扑救",archive.totals.saves],["零封",archive.totals.cleanSheets]];
    const seasonRows=archive.rows.map(row=>`<tr class="${row.current?"current-season-row":""}"><td><strong>${row.season}/${String(Number(row.season)+1).slice(2)}</strong>${row.current?`<span class="career-current-tag">进行中</span>`:row.partialSeason?`<span class="career-current-tag muted">阶段</span>`:""}</td><td>${esc(row.club||"未知俱乐部")}</td><td class="num">${Number(row.appearances||0)}</td><td class="num">${Number(row.goals||0)}</td><td class="num">${Number(row.assists||0)}</td><td class="num">${Number(row.keyPasses||0)}</td><td class="num">${Number(row.tacklesWon||0)} / ${Number(row.tackles||0)}</td><td class="num">${Number(row.interceptions||0)}</td><td class="num">${Number(row.clearances||0)}</td><td class="num">${Number(row.saves||0)} / ${Number(row.cleanSheets||0)}</td><td class="num"><span class="rating">${Number(row.average||0)>0?Number(row.average).toFixed(2):"—"}</span></td><td class="num">${row.overallStart??"—"} → ${row.overallEnd??p.overall}</td></tr>`).join("");
    const transfers=archive.transfers.map(record=>{const from=clubById(record.fromId),to=clubById(record.toId),fee=Number(record.fee||0);return `<tr><td>${record.date?formatDate(record.date):"日期未记录"}</td><td><span class="transfer-club">${clubBadge(from,"club-badge-result")}<b>${esc(from.name)}</b></span></td><td><span class="transfer-club">${clubBadge(to,"club-badge-result")}<b>${esc(to.name)}</b></span></td><td class="num"><strong>${fee>0?money(fee):"自由转会"}</strong></td><td>${esc(record.reason||"正式转会")}</td></tr>`;}).join("");
    return `<div class="page-heading"><span class="eyebrow">永久记录</span><h2>生涯档案</h2><p>${esc(p.name)} 的正式比赛数据、主要荣誉与职业流动记录。</p></div><section class="stats career-summary-stats"><div class="stat"><div class="stat-label">生涯出场</div><div class="stat-value">${archive.totals.appearances}</div><div class="stat-context">${archive.seasons} 个赛季 · ${archive.clubs} 家俱乐部</div></div><div class="stat"><div class="stat-label">进球</div><div class="stat-value">${archive.totals.goals}</div><div class="stat-context">场均 ${(archive.totals.goals/Math.max(1,archive.totals.appearances)).toFixed(2)}</div></div><div class="stat"><div class="stat-label">助攻</div><div class="stat-value">${archive.totals.assists}</div><div class="stat-context">场均 ${(archive.totals.assists/Math.max(1,archive.totals.appearances)).toFixed(2)}</div></div><div class="stat"><div class="stat-label">生涯评分</div><div class="stat-value">${archive.average?archive.average.toFixed(2):"—"}</div><div class="stat-context">按出场加权计算</div></div><div class="stat"><div class="stat-label">主要荣誉</div><div class="stat-value">${archive.honors.length}</div><div class="stat-context">冠军与重要个人奖项</div></div><div class="stat"><div class="stat-label">单场 MVP</div><div class="stat-value">${archive.mvpCount}</div><div class="stat-context">仅记录累计次数</div></div></section><section class="panel career-data-panel"><div class="panel-header"><h3>生涯累计数据</h3><span class="meta">所有已记录正式比赛</span></div>${keeper?renderCareerMetricGroup("门将表现",goalkeeping):""}${renderCareerMetricGroup("组织与推进",creative)}${renderCareerMetricGroup("防守与对抗",defensive)}${!keeper?renderCareerMetricGroup("门将数据",goalkeeping):""}</section><section class="panel career-season-panel"><div class="panel-header"><h3>赛季与俱乐部明细</h3><span class="meta">转会前后的阶段数据分别保留</span></div><div class="table-wrap"><table class="player-career-table career-archive-table"><thead><tr><th>赛季</th><th>俱乐部</th><th class="num">出场</th><th class="num">进球</th><th class="num">助攻</th><th class="num">关键传球</th><th class="num">抢断成功</th><th class="num">拦截</th><th class="num">解围</th><th class="num">扑救 / 零封</th><th class="num">评分</th><th class="num">能力变化</th></tr></thead><tbody>${seasonRows}</tbody></table></div></section><div class="career-archive-grid"><section class="panel"><div class="panel-header"><h3>主要荣誉</h3><span class="meta">单场 MVP 已汇总至顶部</span></div>${renderCareerHonors(archive.honors)}</section><section class="panel"><div class="panel-header"><h3>转会履历</h3><span class="meta">${archive.transfers.length} 次正式转会</span></div><div class="table-wrap"><table class="career-transfer-table"><thead><tr><th>日期</th><th>转出</th><th>转入</th><th class="num">费用</th><th>原因 / 方式</th></tr></thead><tbody>${transfers||`<tr><td colspan="5"><div class="empty compact">尚无正式转会记录</div></td></tr>`}</tbody></table></div></section></div>`;
  }

  const CAREER_STAT_KEYS=["appearances","goals","assists","keyPasses","chancesCreated","successfulDribbles","progressivePasses","tackles","tacklesWon","interceptions","clearances","blocks","duels","duelsWon","recoveries","pressuresWon","saves","cleanSheets"];
  function playerCareerArchive(player) {
    const profile=playerProfileData(player),archived=(profile.careerStats||[]).map(row=>({...row})),current={id:`career-current-${state.season}-${state.clubId}`,season:state.season,club:clubById(state.clubId).name,clubId:state.clubId,current:true,appearances:Number(player.appearances||0),goals:Number(player.goals||0),assists:Number(player.assists||0),average:Number((averageRating(player)||0).toFixed(2)),overallStart:Number(player.development?.startOverall||player.overall||0),overallEnd:Number(player.overall||0)};
    CAREER_STAT_KEYS.forEach(key=>{if(!["appearances","goals","assists"].includes(key))current[key]=Number(player[key]||0);});
    const rows=[current,...archived].sort((a,b)=>Number(b.season||0)-Number(a.season||0)||(a.current?-1:b.current?1:String(b.endDate||"").localeCompare(String(a.endDate||"")))),totals=Object.fromEntries(CAREER_STAT_KEYS.map(key=>[key,rows.reduce((sum,row)=>sum+Number(row[key]||0),0)])),ratingTotal=rows.reduce((sum,row)=>sum+Number(row.average||0)*Number(row.appearances||0),0),honors=(state.honors||[]).filter(h=>h.name!=="单场 MVP"&&/冠军|金球奖|最佳球员|最佳阵容|金靴|金手套|年度最佳|足球先生/.test(h.name));
    const legacyMvp=(state.honors||[]).filter(h=>h.name==="单场 MVP").length,mvpCount=Math.max(Number(state.mvpCount||0),legacyMvp),seasons=new Set(rows.filter(row=>Number(row.appearances||0)>0||row.current).map(row=>row.season)).size,clubs=new Set(rows.filter(row=>row.clubId||row.club).map(row=>row.clubId||row.club)).size;
    return {rows,totals,average:totals.appearances?ratingTotal/totals.appearances:0,honors,mvpCount,seasons,clubs,transfers:playerTransferRecords(state,profile).sort((a,b)=>String(b.date||"").localeCompare(String(a.date||"")))};
  }
  function renderCareerMetricGroup(title,metrics) {return `<div class="career-metric-section"><h4>${title}</h4><div class="career-metric-grid">${metrics.map(([label,value])=>`<div><span>${label}</span><strong>${value}</strong></div>`).join("")}</div></div>`;}
  function renderCareerHonors(honors) {return honors.length?`<div class="career-honor-list">${honors.map(h=>`<div class="career-honor-row"><div class="trophy-thumb"><img src="assets/trophies/${trophyAsset(h.name)}" alt=""></div><div><strong>${esc(h.name)}</strong><span>${h.season?`${h.season}/${String(Number(h.season)+1).slice(2)} · `:""}${esc(h.scope||"生涯荣誉")}</span></div></div>`).join("")}</div>`:`<div class="empty">${icon("trophy")}<h3>暂无主要荣誉</h3><p>冠军与重要个人奖项会永久记录在这里。</p></div>`;}

  function trophyAsset(name) {
    if (/世界杯/.test(name)) return "1301385.png";
    if (/欧冠|欧洲冠军联赛/.test(name)) return "1301394.png";
    if (/英格兰超级联赛|英超/.test(name)) return "11.png";
    if (/西班牙甲级联赛|西甲/.test(name)) return "67.png";
    if (/德国甲级联赛|德甲/.test(name)) return "22.png";
    if (/意大利甲级联赛|意甲/.test(name)) return "32.png";
    if (/法国甲级联赛|法甲/.test(name)) return "16.png";
    if (/足总杯/.test(name)) return "1301426.png";
    if (/联赛杯/.test(name)) return "1301427.png";
    if (/国王杯/.test(name)) return "1301423.png";
    if (/德国杯/.test(name)) return "1301410.png";
    if (/意大利杯/.test(name)) return "1301412.png";
    if (/法国杯/.test(name)) return "1301407.png";
    if (/欧洲杯|美洲杯|国家队/.test(name)) return "international-cup.png";
    if (/欧联|欧协|洲际|俱乐部世界杯/.test(name)) return "continental-cup.png";
    return "league.png";
  }

  function leagueTrophyAsset(leagueId) {
    return ({ENG1:"11.png",ESP1:"67.png",GER1:"22.png",ITA1:"32.png",FRA1:"16.png"})[leagueId] || "league.png";
  }

  function renderProfile() {
    const p=controlledPlayer(), c=state.coachProfile;
    const attrs=state.role==="coach"?[["战术",c.tactics],["人员管理",c.people],["青训",c.youth],["转会判断",c.transfers]]:[["速度",p.pace||70],["射门",p.shooting||65],["传球",p.passing||68],["盘带",p.dribbling||69],["防守",p.defending||60],["身体",p.physical||68]];
    return `<div class="page-heading"><span class="eyebrow">${state.role==="coach"?"教练档案":"球员档案"}</span><h2>${esc(state.person)}</h2><p>${esc(clubById(state.clubId).name)} · ${state.role==="coach"?"主教练":`${playerRoleLabel(p.position)} · ${p.age} 岁`}</p></div>
      <div class="grid grid-main"><section class="panel"><div class="panel-header"><h3>能力概览</h3><span class="meta">综合 ${state.role==="coach"?c.overall:p.overall}</span></div><div class="panel-body"><div class="attribute-grid">${attrs.map(([k,v])=>`<div class="attribute"><label>${k}</label><strong>${v}</strong><div class="meter ${v<60?"danger":v<75?"warn":""}"><span style="width:${v}%"></span></div></div>`).join("")}</div></div></section>
      <div class="grid"><section class="panel"><div class="panel-header"><h3>发展机制</h3></div><div class="panel-body"><p style="margin:0;color:var(--muted);font-size:12px;line-height:1.7">${state.role==="coach"?"比赛结果、战术执行、球员发展与荣誉会改变教练能力及声望。连续失利也会带来下降。":"年龄、训练强度、出场时间、评分、荣誉与伤病共同作用于当前能力和潜力。重大伤病也有小概率带来心理韧性提升。"}</p></div></section><section class="panel"><div class="panel-header"><h3>职业决定</h3></div><div class="panel-body"><button class="btn btn-danger" id="retire" ${state.retired?"disabled":""}>${icon("log-out")}宣布退役</button></div></section><button class="btn btn-ghost" id="reset-save">${icon("trash-2")}删除当前存档</button></div></div>`;
  }

  function renderMatch() {
    const m=state.activeMatch, club=clubById(state.clubId), f=m.fixture;
    const ourName=f.teamName||club.name,homeName=f.home?ourName:f.opponent, awayName=f.home?f.opponent:ourName;
    const heatPlayers=(m.lineupIds||[]).map(id=>matchOurPlayers(m).find(player=>player.id===id)).filter(Boolean);
    const roleStatus=m.controlledSelection,roleBanner=state.role==="player"&&roleStatus?`<div class="player-match-role ${roleStatus.status}"><span>${esc(roleStatus.label)}</span><strong>${esc(roleStatus.reason)}</strong></div>`:"";
    const response=m.performanceResponse,playerPlanControl=state.role==="player"?`<section class="panel live-player-plan"><div class="panel-header"><div><h3>个人比赛方式</h3><span class="meta">${m.lineupIds.includes(state.controlledId)?"正在场上执行":"等待登场"}</span></div></div>${response?.summary?`<div class="live-response">${icon("trending-up")}<span><strong>${esc(response.source)}</strong><small>${esc(response.summary)} · 本场生效</small></span></div>`:""}<div class="live-plan-options">${Object.entries(PLAYER_MATCH_PLANS).map(([id,plan])=>`<button class="${m.controlledMatchPlan===id?"active":""}" data-live-player-plan="${id}" title="${esc(plan.summary)}">${icon(plan.icon)}<span>${plan.label}</span></button>`).join("")}</div><p>${esc(PLAYER_MATCH_PLANS[m.controlledMatchPlan]?.summary||"")}</p></section>`:"";
    return `<main class="match-screen"><header class="match-topbar"><button class="btn btn-icon match-home-button" id="return-main-menu-match" title="返回主页面" aria-label="返回主页面">${icon("house")}</button><div class="match-club">${clubBadge(homeName,"club-badge-match")}<span>${clubNameLink(homeName)}</span></div><div class="match-score"><span class="score-number">${m.home}</span><span class="match-clock ${m.paused?"paused":""}">${m.finished?"FT":m.minute===45&&m.pendingTalk==="halfTime"?"HT":matchClockLabel(m.minute)}</span><span class="score-number">${m.away}</span></div><div class="match-club away"><span>${clubNameLink(awayName)}</span>${clubBadge(awayName,"club-badge-match")}</div></header>
      ${roleBanner}<div class="match-layout"><div class="match-main"><div class="match-priority-grid"><section class="panel match-commentary-panel"><div class="panel-header"><h3>比赛实况</h3><span class="meta">${esc(f.competition)} · ${esc(f.round)}</span></div><div class="panel-body commentary" id="commentary">${m.commentary.slice().reverse().map(e=>`<div class="commentary-line"><time>${eventMinuteLabel(e.minute)}</time><span>${esc(e.text)}</span></div>`).join("")}</div></section>${renderMatchStats(m)}${renderFeaturedRatings(m)}</div>
      <div class="match-visual-row"><section class="canvas-match-stage" aria-label="2D 比赛演播"><canvas id="match-canvas"></canvas><div class="canvas-status"><span class="live-indicator"><i></i>${m.paused?"比赛暂停":"LIVE"}</span><span>${esc(m.visualAction?.label||`${m.formation} vs ${m.opponentFormation}`)}</span></div>${m.paused&&!m.pendingTalk&&!m.finished?`<button class="canvas-play" id="toggle-match-play" aria-label="继续比赛">${icon("play")}</button>`:""}</section>
      <div class="match-tools">${playerPlanControl}<section class="panel match-playback"><div class="panel-header"><h3>演播控制</h3><span class="meta">${m.paused?"已暂停":"时间推进中"}</span></div><div class="panel-body"><div class="playback-row"><button class="btn btn-icon" id="toggle-match-play" title="${m.pendingTalk?"比赛暂停":m.paused?"继续":"暂停"}" ${m.pendingTalk?"disabled":""}>${icon(m.pendingTalk?"pause":m.paused?"play":"pause")}</button><div class="speed-control">${[1,2,4].map(speed=>`<button class="${m.speed===speed?"active":""}" data-match-speed="${speed}" ${m.pendingTalk?"disabled":""}>${speed}x</button>`).join("")}</div></div><button class="btn skip-result" id="skip-match" ${m.pendingTalk||m.finished?"disabled":""}>${icon("fast-forward")}直接查看赛果</button></div></section>
      <section class="panel heatmap-panel"><div class="panel-header"><h3>球员热力图</h3><span class="meta">实时跑位采样</span></div><div class="panel-body"><select class="select" id="heatmap-player">${heatPlayers.map(player=>`<option value="${esc(player.id)}" ${m.selectedHeatmapPlayer===player.id?"selected":""}>${esc(player.name)} · ${playerRoleLabel(player.position)}</option>`).join("")}</select><canvas id="heatmap-canvas" width="420" height="220"></canvas></div></section></div></div>
      <div class="match-team-grid">${renderMatchTeam(m,"home")}${renderMatchTeam(m,"away")}</div>${m.finished&&!m.pendingTalk?`<button class="btn btn-primary finish-report" id="finish-match">${icon("clipboard-check")}返回并生成赛后报告</button>`:""}</div></div>${renderTeamTalkOverlay(m)}</main>`;
  }

  function renderTeamTalkOverlay(m) {
    if(!m.pendingTalk)return "";const half=m.pendingTalk==="halfTime",ours=m.fixture.home?m.home:m.away,theirs=m.fixture.home?m.away:m.home;
    if(state.role==="player"){const profile=m.aiCoachProfiles?.ours||coachDecisionProfile("AI"),choice=aiTeamTalkChoice(m,profile),content={inspire:["激昂","我们仍在比赛中。提高对抗速度，下一次机会必须更坚决。"],criticize:["严厉","目前的执行远低于要求。减少无谓失误，立刻提高比赛强度。"],calm:["冷静","领先不等于结束。保持距离，不要被对手带乱节奏。"],encourage:["鼓励","节奏是对的，传球后继续移动，机会会出现。"]}[choice];return `<div class="team-talk-overlay"><div class="team-talk"><span class="eyebrow">${half?"中场休息":"赛后更衣室"} · AI 主教练</span><h2>${content[0]}</h2><blockquote>${esc(content[1])}</blockquote><button class="btn btn-primary" data-team-talk="listen">${icon("check")}继续</button></div></div>`;}
    return `<div class="team-talk-overlay"><div class="team-talk"><span class="eyebrow">${half?"中场讲话":"赛后讲话"}</span><h2>${half?"你要如何改变下半场？":"最后一句话会留在更衣室"}</h2><div class="talk-options"><button data-team-talk="inspire">${icon("flame")}<strong>激昂</strong><span>提升士气与进攻欲望，风险同步上升</span></button><button data-team-talk="encourage">${icon("heart-handshake")}<strong>鼓励</strong><span>稳定情绪并小幅恢复体能</span></button><button data-team-talk="criticize">${icon("message-square-warning")}<strong>批评</strong><span>提高战术执行，可能打击低士气球员</span></button><button data-team-talk="calm">${icon("shield-check")}<strong>冷静</strong><span>降低比赛风险并保持阵型</span></button></div></div></div>`;
  }

  function matchTeamData(m,side) {
    const oursSide=m.fixture.home?"home":"away",isOurs=side===oursSide;
    if(isOurs)return {key:"ours",name:m.fixture.teamName||clubById(state.clubId).name,formation:m.formation,players:matchOurPlayers(m),lineupIds:m.lineupIds||[],initialLineupIds:m.initialLineupIds||m.lineupIds||[],initialBenchIds:m.initialBenchIds||m.benchIds||[],benchIds:m.benchIds||[],ratings:m.liveRatings||{},events:m.playerEvents||{},substitutions:(m.substitutions||[]).filter(item=>item.team==="ours"),isOurs:true};
    return {key:"opponent",name:m.fixture.opponent,formation:m.opponentFormation,players:m.opponentPlayers||[],lineupIds:m.opponentLineupIds||[],initialLineupIds:m.opponentInitialLineupIds||m.opponentLineupIds||[],initialBenchIds:m.opponentInitialBenchIds||m.opponentBenchIds||[],benchIds:m.opponentBenchIds||[],ratings:m.opponentRatings||{},events:m.opponentEvents||{},substitutions:(m.substitutions||[]).filter(item=>item.team==="opponent"),isOurs:false};
  }

  function matchPlayer(team,id) { return team.players.find(player=>player.id===id); }
  function ratingClass(value) { return value>=7.5?"excellent":value<6?"poor":""; }
  function eventMarks(event={}) {
    const defensive=(event.tacklesWon||0)+(event.interceptions||0)+(event.clearances||0)+(event.blocks||0)+(event.saves||0);
    const impact=(event.keyPasses||0)+(event.chancesCreated||0)+(event.successfulDribbles||0)+(event.progressivePasses||0)+(event.recoveries||0)+(event.pressuresWon||0);
    const defensiveTitle=`成功抢断 ${event.tacklesWon||0} · 拦截 ${event.interceptions||0} · 解围 ${event.clearances||0} · 封堵 ${event.blocks||0} · 扑救 ${event.saves||0}`;
    const impactTitle=`关键传球 ${event.keyPasses||0} · 创造机会 ${event.chancesCreated||0} · 成功盘带 ${event.successfulDribbles||0} · 推进传球 ${event.progressivePasses||0} · 夺回球权 ${event.recoveries||0} · 压迫成功 ${event.pressuresWon||0}`;
    return `${event.goals?`<span class="match-event goal" title="进球">${event.goals}球</span>`:""}${event.assists?`<span class="match-event assist" title="助攻">${event.assists}助</span>`:""}${event.shots?`<span class="match-event" title="射正 ${event.onTarget||0} / 射门 ${event.shots}">射 ${event.onTarget||0}/${event.shots}</span>`:""}${impact?`<span class="match-event" title="${impactTitle}">贡献 ${impact}</span>`:""}${defensive?`<span class="match-event" title="${defensiveTitle}">防 ${defensive}</span>`:""}${event.yellow?`<span class="card-mark yellow" title="黄牌"></span>`:""}${event.red?`<span class="card-mark red" title="红牌"></span>`:""}`;
  }

  function renderMatchPlayerRow(team,id,kind) {
    const player=matchPlayer(team,id);if(!player)return "";
    const active=team.lineupIds.includes(id),subbedOn=team.substitutions.some(item=>item.inId===id),subbedOff=team.substitutions.some(item=>item.outId===id),sentOff=Number(team.events[id]?.red||0)>0;
    const rating=team.ratings[id],showRating=kind==="starter"||subbedOn||subbedOff;
    const status=sentOff?"红牌罚下":subbedOff?"已换下":subbedOn?"替补登场":active?"场上":"替补";
    const movement=subbedOff?`<b class="substitution-badge off">${icon("arrow-down")}换下</b>`:subbedOn?`<b class="substitution-badge on">${icon("arrow-up")}换上</b>`:"";
    return `<div class="match-player-row ${active?"active":""} ${subbedOff?"subbed-off":""}"><span class="shirt-no">${player.number||"-"}</span><div class="match-player-main"><strong><span class="player-link-wrap">${playerNameLink(player,{clubName:team.name})}${movement}</span></strong><span>${playerRoleLabel(player.position)} · ${status}</span></div><div class="match-event-marks">${eventMarks(team.events[id])}</div><span class="live-rating ${showRating?ratingClass(Number(rating||6)):"muted"}">${showRating?Number(rating||6).toFixed(2):"—"}</span></div>`;
  }

  function renderSubstitutionControls(m,team) {
    if(!team.isOurs||state.role!=="coach"||m.finished)return "";
    const remaining=5-team.substitutions.length;
    if(remaining<=0)return `<div class="sub-limit">本场换人名额已用完</div>`;
    const onOptions=team.lineupIds.map(id=>matchPlayer(team,id)).filter(Boolean).sort((a,b)=>(a.position==="GK")-(b.position==="GK")),offOptions=team.benchIds.map(id=>matchPlayer(team,id)).filter(Boolean).sort((a,b)=>(a.position==="GK")-(b.position==="GK"));
    return `<div class="sub-controls"><select class="select" id="sub-out" aria-label="换下球员">${onOptions.map(player=>`<option value="${esc(player.id)}" data-position="${esc(player.position)}">换下 · ${esc(player.name)} (${Number(team.ratings[player.id]||6).toFixed(2)})</option>`).join("")}</select><select class="select" id="sub-in" aria-label="换上球员">${offOptions.map(player=>`<option value="${esc(player.id)}" data-position="${esc(player.position)}">换上 · ${esc(player.name)} · ${playerRoleLabel(player.position)}</option>`).join("")}</select><button class="btn btn-sm" id="make-substitution" ${offOptions.length?"":"disabled"}>${icon("arrow-right-left")}确认换人</button><span class="sub-limit">剩余 ${remaining} 个名额</span></div>`;
  }

  function renderMatchTeam(m,side) {
    const team=matchTeamData(m,side);
    clubProfileRegistry.set(`match-team-${side}`,resolveClub(team.name));
    return `<section class="panel match-team"><div class="panel-header"><div class="match-team-title">${clubBadge(team.name,"club-badge-team")}<h3>${esc(team.name)}</h3></div><span class="meta">${team.formation||"灵活阵型"} · 已换 ${team.substitutions.length}/5</span></div>${renderSubstitutionControls(m,team)}<div class="match-squad-section"><h4>首发阵容</h4>${team.initialLineupIds.map(id=>renderMatchPlayerRow(team,id,"starter")).join("")}</div><div class="match-squad-section bench"><h4>替补球员</h4>${team.initialBenchIds.map(id=>renderMatchPlayerRow(team,id,"bench")).join("")||`<div class="empty compact">暂无替补</div>`}</div>${team.substitutions.length?`<div class="sub-log"><h4>换人记录</h4>${team.substitutions.map(item=>`<div><time>${eventMinuteLabel(item.minute)}</time><span class="sub-on"><b>换上</b>${esc(item.inName)}</span><span class="sub-off"><b>换下</b>${esc(item.outName)}</span><small>${esc(item.reason||"战术调整")}</small></div>`).join("")}</div>`:""}</section>`;
  }

  function renderMatchStats(m) {
    const home=m.fixture.home?m.stats.ours:m.stats.opponent,away=m.fixture.home?m.stats.opponent:m.stats.ours;
    const homePoss=m.fixture.home?m.possession:100-m.possession,awayPoss=100-homePoss;
    const rows=[["控球率",`${homePoss}%`,`${awayPoss}%`],["射门",home.shots,away.shots],["射正",home.onTarget,away.onTarget],["预期进球",Number(home.xg).toFixed(2),Number(away.xg).toFixed(2)],["角球",home.corners,away.corners],["犯规",home.fouls,away.fouls],["黄牌",home.yellow||0,away.yellow||0],["红牌",home.red||0,away.red||0]];
    const ourName=m.fixture.teamName||clubById(state.clubId).name;return `<section class="panel match-data-panel"><div class="panel-header"><h3>比赛数据</h3><span class="meta">实时更新</span></div><div class="match-stat-head"><strong>${esc(m.fixture.home?ourName:m.fixture.opponent)}</strong><span>数据</span><strong>${esc(m.fixture.home?m.fixture.opponent:ourName)}</strong></div><div class="match-stat-list">${rows.map(([label,homeValue,awayValue])=>`<div class="match-stat-row"><strong>${homeValue}</strong><span>${label}</span><strong>${awayValue}</strong></div>`).join("")}</div><div class="possession-bar"><span style="width:${homePoss}%"></span></div></section>`;
  }

  function renderFeaturedRatings(m) {
    const side=key=>{
      const team=matchTeamData(m,key),rows=team.lineupIds.map((id,index)=>{
        const player=matchPlayer(team,id),substitution=team.substitutions.find(item=>item.inId===id);
        return {player,rating:Number(team.ratings[id]||6),events:team.events[id]||{},substitution,index};
      }).filter(item=>item.player).sort((a,b)=>positionSortRank(a.player.position)-positionSortRank(b.player.position)||a.index-b.index);
      return `<div class="featured-rating-team"><strong>${esc(team.name)}</strong>${rows.map(({player,rating,events,substitution})=>`<div class="featured-rating-row ${substitution?"substitute":""}"><span class="featured-position">${playerRoleLabel(player.position)}</span><span class="featured-player-name">${esc(player.name)}${substitution?` <b class="featured-sub-badge">${icon("arrow-up")}换上</b>`:""}${events.goals?` <b class="featured-goal">${events.goals}球</b>`:""}</span><em class="${ratingClass(rating)}">${rating.toFixed(2)}</em></div>`).join("")}</div>`;
    };
    return `<section class="panel featured-ratings"><div class="panel-header"><h3>球员评分</h3><span class="meta">按位置 · 场上球员</span></div><div class="featured-ratings-body">${side("home")}${side("away")}</div></section>`;
  }

  function renderMatchCenter(m) {
    return `<div class="match-center">${renderMatchStats(m)}<div class="match-team-grid">${renderMatchTeam(m,"home")}${renderMatchTeam(m,"away")}</div></div>`;
  }

  function renderPlayersOnPitch(m) {
    const dots=[]; const home=[[7,50],[22,18],[22,40],[22,60],[22,82],[43,25],[43,50],[43,75],[66,25],[70,50],[66,75]];
    const away=home.map(([x,y])=>[100-x,y]);
    const homeTeam=matchTeamData(m,"home"),awayTeam=matchTeamData(m,"away");
    home.forEach((point,i)=>{const player=matchPlayer(homeTeam,homeTeam.lineupIds[i]);dots.push(`<span class="player-dot home" title="${esc(player?.name||"")}" style="left:${point[0]}%;top:${point[1]}%">${player?.number||i+1}</span>`);});
    away.forEach((point,i)=>{const player=matchPlayer(awayTeam,awayTeam.lineupIds[i]);dots.push(`<span class="player-dot" title="${esc(player?.name||"")}" style="left:${point[0]}%;top:${point[1]}%">${player?.number||i+1}</span>`);}); return dots.join("");
  }
  function visualFormationPoints(m,side) {
    const team=matchTeamData(m,side),players=team.lineupIds.map(id=>matchPlayer(team,id)).filter(Boolean),positionTotals={},positionIndexes={};
    players.forEach(player=>{positionTotals[player.position]=(positionTotals[player.position]||0)+1;});
    const lanes={RB:16,LB:84,RWB:12,LWB:88,RM:18,LM:82,RW:18,LW:82},lines={GK:6,CB:22,RB:24,LB:24,RWB:38,LWB:38,DM:40,CM:48,RM:53,LM:53,AM:62,RW:69,LW:69,CF:66,ST:74};
    const spread=(position,index,total)=>{
      if(lanes[position]!=null)return lanes[position];
      if(total<=1)return 50;
      const width=position==="CB"?50:position==="ST"?28:position==="CM"?42:34;
      return 50-width/2+width*(index/(total-1));
    };
    const base=players.map(player=>{const index=positionIndexes[player.position]||0,total=positionTotals[player.position]||1;positionIndexes[player.position]=index+1;return [lines[player.position]??55,spread(player.position,index,total)];});
    return side==="home"?base:base.map(([x,y])=>[100-x,y]);
  }
  function matchVisualPositions(m,side,tick=performance.now()/900) {
    const homeTeam=m.fixture.home?"ours":"opponent",teamKey=side==="home"?homeTeam:(homeTeam==="ours"?"opponent":"ours"),action=m.visualAction||{},attacking=action.team?teamKey===action.team:(teamKey==="ours"?m.possession>=50:m.possession<50),direction=side==="home"?1:-1,push=({build:5,attack:11,shot:17,goal:19,save:14,defend:2})[action.kind]||7;
    return visualFormationPoints(m,side).map(([x,y],index)=>({x:clamp(x+direction*(attacking?push:-Math.max(2,push*.32))+Math.sin(tick+index*1.7)*2.4,4,96),y:clamp(y+Math.cos(tick*.82+index*1.31)*3.7,5,95)}));
  }
  function setMatchVisualAction(m,team,kind,label) { m.visualAction={team,kind,label,startedAt:Date.now()}; }
  function paintPitch(ctx,width,height) {
    ctx.fillStyle="#177642";ctx.fillRect(0,0,width,height);const stripe=width/10;for(let i=0;i<10;i++){ctx.fillStyle=i%2?"rgba(255,255,255,.025)":"rgba(0,0,0,.035)";ctx.fillRect(i*stripe,0,stripe,height);}
    ctx.strokeStyle="rgba(238,255,244,.72)";ctx.lineWidth=Math.max(1,width/600);ctx.strokeRect(width*.025,height*.045,width*.95,height*.91);ctx.beginPath();ctx.moveTo(width/2,height*.045);ctx.lineTo(width/2,height*.955);ctx.stroke();ctx.beginPath();ctx.arc(width/2,height/2,height*.13,0,Math.PI*2);ctx.stroke();ctx.beginPath();ctx.arc(width/2,height/2,2.5,0,Math.PI*2);ctx.fillStyle=ctx.strokeStyle;ctx.fill();
    [[.025,.25,.14,.5],[.835,.25,.14,.5],[.025,.38,.065,.24],[.91,.38,.065,.24]].forEach(([x,y,w,h])=>ctx.strokeRect(width*x,height*y,width*w,height*h));
  }
  function drawMatchCanvas() {
    const canvas=document.getElementById("match-canvas");if(!canvas)return;
    const animate=()=>{const current=document.getElementById("match-canvas");if(!current||!state?.activeMatch){matchCanvasFrame=null;return;}drawMatchCanvasFrame();matchCanvasFrame=requestAnimationFrame(animate);};animate();drawHeatmapCanvas();
  }
  function drawMatchCanvasFrame() {
    const canvas=document.getElementById("match-canvas"),m=state?.activeMatch;if(!canvas||!m)return;const rect=canvas.getBoundingClientRect(),ratio=Math.min(2,window.devicePixelRatio||1),width=Math.max(320,Math.round(rect.width*ratio)),height=Math.max(190,Math.round(rect.height*ratio));if(canvas.width!==width||canvas.height!==height){canvas.width=width;canvas.height=height;}const ctx=canvas.getContext("2d");paintPitch(ctx,width,height);
    const tick=performance.now()/(m.paused?3000:900),home=matchTeamData(m,"home"),away=matchTeamData(m,"away"),drawTeam=(team,side,color)=>{const points=matchVisualPositions(m,side,tick);points.forEach((point,index)=>{const player=matchPlayer(team,team.lineupIds[index]);if(!player)return;const x=point.x/100*width,y=point.y/100*height,r=Math.max(5,width*.008);ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fillStyle=color;ctx.fill();ctx.strokeStyle="rgba(255,255,255,.86)";ctx.lineWidth=1.5*ratio;ctx.stroke();ctx.fillStyle=side==="home"?"#102018":"#fff";ctx.font=`700 ${Math.max(7,width*.010)}px Inter, sans-serif`;ctx.textAlign="center";ctx.textBaseline="middle";ctx.fillText(String(player.number||index+1),x,y);});return points;};
    const homePoints=drawTeam(home,"home","#e8f0ec"),awayPoints=drawTeam(away,"away","#ef4f61"),action=m.visualAction||{},homeKey=m.fixture.home?"ours":"opponent",attackingHome=action.team?homeKey===action.team:m.possession>=50,points=attackingHome?homePoints:awayPoints,direction=attackingHome?1:-1,owner=points[(m.minute+(m.visualTick||0))%Math.max(1,points.length)],duration=({1:1050,2:520,4:260})[m.speed]||1050,progress=m.paused?.25:clamp((Date.now()-Number(action.startedAt||Date.now()))/duration,0,1),targetX=action.kind==="goal"?(direction>0?98:2):action.kind==="shot"||action.kind==="save"?(direction>0?92:8):owner?clamp(owner.x+direction*(12+progress*12),4,96):m.ballX,targetY=action.kind==="goal"?50:owner?clamp(owner.y+Math.sin(progress*Math.PI)*10,7,93):m.ballY,ballX=((owner?.x||m.ballX)*(1-progress)+targetX*progress)/100*width,ballY=((owner?.y||m.ballY)*(1-progress)+targetY*progress)/100*height;ctx.beginPath();ctx.arc(ballX,ballY,Math.max(3,width*.0045),0,Math.PI*2);ctx.fillStyle="#fff";ctx.fill();ctx.strokeStyle="#142019";ctx.lineWidth=1;ctx.stroke();
  }
  function sampleMatchHeatmap(m) {
    [["home",matchTeamData(m,"home")],["away",matchTeamData(m,"away")]].forEach(([side,team])=>{matchVisualPositions(m,side,m.minute*.37).forEach((point,index)=>{const id=team.lineupIds[index];if(!id)return;const normalizedX=side==="away"?100-point.x:point.x;(m.heatmap[id]||(m.heatmap[id]=[])).push([Number(normalizedX.toFixed(1)),Number(point.y.toFixed(1))]);m.heatmap[id]=m.heatmap[id].slice(-180);});});m.heatmapNormalized=true;m.visualTick=(m.visualTick||0)+1;
  }
  function drawHeatmapCanvas() {
    const canvas=document.getElementById("heatmap-canvas"),m=state?.activeMatch;if(!canvas||!m)return;const ctx=canvas.getContext("2d"),width=canvas.width,height=canvas.height;paintPitch(ctx,width,height);const points=m.heatmap?.[m.selectedHeatmapPlayer]||[];points.forEach(([px,py],index)=>{const x=px/100*width,y=py/100*height,r=22*(.45+index/Math.max(1,points.length));const gradient=ctx.createRadialGradient(x,y,0,x,y,r);gradient.addColorStop(0,"rgba(255,232,80,.22)");gradient.addColorStop(.5,"rgba(255,112,48,.12)");gradient.addColorStop(1,"rgba(255,40,40,0)");ctx.fillStyle=gradient;ctx.fillRect(x-r,y-r,r*2,r*2);});
  }
  function matchPhase(m) {
    if(m.minute<25)return {id:"opening",label:"开局阶段"};
    if(m.minute<45)return {id:"firstHalf",label:"半场前"};
    if(m.minute<70)return {id:"middle",label:"下半场中段"};
    return {id:"closing",label:"决胜阶段"};
  }

  function matchSituation(m) {
    const ours=m.fixture.home?m.home:m.away,theirs=m.fixture.home?m.away:m.home;
    return ours>theirs?{id:"leading",label:"领先"}:ours<theirs?{id:"trailing",label:"落后"}:{id:"level",label:"平局"};
  }

  function playerDecisionGroup(position) {
    if(position==="GK")return "goalkeeper";
    if(["CB","DF","RB","LB","RWB","LWB"].includes(position))return "defender";
    if(position==="DM")return "holding";
    if(["CM","RM","LM"].includes(position))return "midfielder";
    if(["AM","RW","LW","CF"].includes(position))return "creator";
    return "forward";
  }

  function pd(id,iconName,label,desc,config,successText,failureText) {
    const {possession=0,fitness=-1,bonus=0,risk=0,skill="overall",chance=.65,stat="control",win=.12,lose=-.18}=config;
    return {id,icon:iconName,label,desc,effect:{possession,fitness,bonus,tactical:0,risk},resolution:{skill,chance,stat,win,lose,successText,failureText}};
  }

  function scenario(id,iconName,title,detail,zone,pressure,threat,options) { return {id,icon:iconName,title,detail,zone,pressure,threat,options}; }

  const PLAYER_DECISION_SCENARIOS = {
    goalkeeper:{
      opening:scenario("gk-opening-cross","circle-dot","边路传中直奔六码区","对手边锋摆脱后送出带弧线的传中，前锋正冲向你与中卫之间。","六码区","中",.24,[
        pd("gk-claim","hand","果断出击摘球","抢在前锋之前控制高球",{possession:4,fitness:-2,bonus:4,risk:2,chance:.7,stat:"save",win:.2,lose:-.32},"你判断准确，高点稳稳摘下传中。","你出击稍慢，皮球从手边滑向门前。"),
        pd("gk-punch","shield","双拳击出","优先把球清出危险区域",{possession:1,fitness:-2,bonus:3,risk:1,chance:.78,stat:"clear",win:.14,lose:-.2},"你用双拳把球击出禁区。","击球落点不佳，对手拿到第二点。"),
        pd("gk-line","map-pin","守住门线","相信中卫处理传中",{possession:0,fitness:0,bonus:1,risk:-2,chance:.73,stat:"save",win:.1,lose:-.22},"你保持重心，随后封住近距离攻门。","中卫漏人，你被迫面对近距离头球。"),
        pd("gk-counter-throw","send","摘球后快发手抛球","争取立即发动反击",{possession:2,fitness:-2,bonus:5,risk:4,chance:.62,stat:"distribution",win:.2,lose:-.25},"你摘球后迅速手抛发动反击。","快发路线被识破，球队再次承压。")]),
      firstHalf:scenario("gk-pressed-backpass","triangle-alert","回传球遭遇前锋逼抢","中卫在压力下把球回传给你，对方前锋已封住中路接应线。","小禁区外","高",.2,[
        pd("gk-short-pass","shuffle","短传中卫","用脚下配合绕过逼抢",{possession:5,fitness:-1,bonus:4,risk:4,skill:"passing",chance:.64,stat:"distribution",win:.18,lose:-.35},"你冷静找到空出的中卫，破解第一线逼抢。","短传被对手预判，禁区前出现险情。"),
        pd("gk-wide-pass","split","分给边后卫","利用边路空当继续组织",{possession:3,fitness:-1,bonus:3,risk:2,skill:"passing",chance:.7,stat:"distribution",win:.15,lose:-.22},"你把球准确送到边路安全区域。","传球力量不足，边后卫被迫回追。"),
        pd("gk-long-kick","send","长传找前锋","越过逼抢直接争夺第二点",{possession:-2,fitness:-1,bonus:4,risk:2,skill:"passing",chance:.66,stat:"distribution",win:.12,lose:-.12},"长传越过中场，前锋成功争到落点。","长传直接交还球权。"),
        pd("gk-clear-stand","shield-check","踢出边线","不在危险区域承担风险",{possession:-3,fitness:0,bonus:0,risk:-5,chance:.92,stat:"clear",win:.06,lose:-.08},"你把球安全踢出边线，化解逼抢。","解围碰到逼抢球员后出了底线。")]),
      middle:scenario("gk-one-on-one","goal","对手形成单刀","直塞穿透防线，对方前锋正带球进入禁区，你必须立即决定站位。","禁区正面","极高",.38,[
        pd("gk-rush","move-up","快速出击封角度","缩短距离迫使前锋提前处理",{possession:1,fitness:-3,bonus:6,risk:5,chance:.66,stat:"save",win:.28,lose:-.42},"你迅速出击，用身体封住对方射门。","前锋抢先挑射，皮球越过你的头顶。"),
        pd("gk-hold-depth","map-pin","控制出击距离","边退边保持扑救反应空间",{possession:0,fitness:-1,bonus:4,risk:1,chance:.72,stat:"save",win:.22,lose:-.3},"你控制好距离，倒地封住低射。","前锋晃出角度后把球推向远角。"),
        pd("gk-spread","maximize-2","提前扩大封堵面积","判断射门瞬间展开身体",{possession:0,fitness:-2,bonus:5,risk:3,chance:.69,stat:"save",win:.25,lose:-.36},"你展开身体，皮球击中腿部弹出。","你提前倒地，对手轻松变向。"),
        pd("gk-delay","clock-3","等待后卫回追","不给前锋轻易过掉你的机会",{possession:1,fitness:0,bonus:2,risk:-1,chance:.68,stat:"save",win:.16,lose:-.26},"你的延缓奏效，回追后卫完成干扰。","后卫未能赶上，前锋获得从容射门时间。")]),
      closing:scenario("gk-late-set-piece","flag","最后阶段定位球压入禁区","对手把中卫也推到门前，任意球正落向拥挤的后点区域。","后点门前","极高",.34,[
        pd("gk-command","megaphone","指挥防线盯人","先确保每个抢点球员都被控制",{possession:1,fitness:-1,bonus:3,risk:-2,chance:.78,stat:"clear",win:.16,lose:-.22},"你的指挥让防线抢到第一落点。","沟通出现混乱，对手在后点获得空间。"),
        pd("gk-attack-cross","hand","越过人群摘球","主动终结这次定位球",{possession:4,fitness:-3,bonus:6,risk:5,chance:.62,stat:"save",win:.3,lose:-.48},"你穿过人群高高跃起，将球牢牢抱住。","你没能碰到皮球，球门短暂失去保护。"),
        pd("gk-punch-wide","shield","击向边线","避免把球留在禁区中央",{possession:0,fitness:-2,bonus:4,risk:2,chance:.72,stat:"clear",win:.2,lose:-.28},"你准确把球击向边线，危险解除。","你只蹭到皮球，对手仍能补射。"),
        pd("gk-launch-late","send","控制后立刻长传","利用对手中卫压上后的空当",{possession:-2,fitness:-2,bonus:6,risk:4,skill:"passing",chance:.6,stat:"distribution",win:.22,lose:-.2},"你快速开球，前场形成以多打少。","长传落点太深，对方门将轻松得到。")])
    },
    defender:{
      opening:scenario("df-wing-duel","swords","边路一对一防守","对方边锋接球后正面加速，身后的套边球员也在靠近。","防守边路","中",.24,[
        pd("df-show-wide","move-right","迫使走外线","封住内切路线等待协防",{possession:1,fitness:-2,bonus:3,risk:-2,skill:"defending",chance:.77,stat:"tackle",win:.16,lose:-.2},"你控制距离，把对手逼向边线。","对手突然变向，从你身前切入。"),
        pd("df-front-tackle","shield","主动上抢","在对手起速前抢下皮球",{possession:3,fitness:-3,bonus:5,risk:4,skill:"defending",chance:.64,stat:"tackle",win:.23,lose:-.34},"你看准触球时机干净断球。","上抢落空，对手从身侧突破。"),
        pd("df-delay-run","clock-3","延缓推进","跟随对手移动等待队友回位",{possession:0,fitness:-1,bonus:2,risk:-3,skill:"defending",chance:.82,stat:"control",win:.12,lose:-.14},"你成功拖慢进攻，队友已经回防。","你后退过深，让对手获得传中空间。"),
        pd("df-track-overlap","scan-line","跟住套边球员","把持球人交给中场协防",{possession:0,fitness:-3,bonus:3,risk:0,skill:"pace",chance:.7,stat:"intercept",win:.15,lose:-.22},"你及时切断套边传球路线。","持球人利用无人压迫完成内切。")]),
      firstHalf:scenario("df-cross-defence","circle-dot","传中落向禁区中路","对手从边路起球，前锋正在你身前与点球点之间抢位。","禁区中路","高",.3,[
        pd("df-attack-ball","move-up","主动迎球解围","抢在前锋之前处理第一落点",{possession:0,fitness:-3,bonus:5,risk:3,skill:"defending",chance:.72,stat:"clear",win:.22,lose:-.34},"你迎球跃起，把传中顶出危险区域。","你判断落点失误，前锋在身后完成头球。"),
        pd("df-block-runner","shield-check","卡住前锋路线","用身体阻止对手冲向落点",{possession:1,fitness:-2,bonus:4,risk:1,skill:"physical",chance:.75,stat:"clear",win:.18,lose:-.25},"你占住位置，让门将轻松收下皮球。","身体对抗失败，对手抢到身前。"),
        pd("df-drop-cover","undo-2","退向门前保护","防止传中越过整条防线",{possession:0,fitness:-1,bonus:2,risk:-2,skill:"defending",chance:.79,stat:"clear",win:.13,lose:-.18},"你退到关键区域，稳妥完成解围。","退得太深，第二点区域无人保护。"),
        pd("df-head-counter","send","头球找中场","解围同时尝试保留球权",{possession:3,fitness:-2,bonus:4,risk:4,skill:"passing",chance:.61,stat:"intercept",win:.2,lose:-.28},"你把头球准确摆渡给中场队友。","头球落到对方脚下，攻势继续。")]),
      middle:scenario("df-transition","triangle-alert","丢球后的快速反击","本队进攻被断，对手带球冲向你与另一名中卫之间。","中后场转换","高",.32,[
        pd("df-step-out","arrow-up","迎前封堵","在对手抬头前破坏推进",{possession:2,fitness:-4,bonus:6,risk:5,skill:"defending",chance:.64,stat:"tackle",win:.25,lose:-.38},"你果断迎前断球，反击被终止。","对手一脚出球越过你的防区。"),
        pd("df-drop-line","undo-2","快速退守","优先保护禁区和身后空间",{possession:0,fitness:-3,bonus:3,risk:-3,skill:"pace",chance:.76,stat:"control",win:.15,lose:-.2},"你快速回到防线，迫使对手减速。","回退中失去持球人，防线被迫收缩。"),
        pd("df-cover-pass","split","封锁直塞路线","诱导持球人自己完成低质量射门",{possession:1,fitness:-2,bonus:4,risk:-1,skill:"defending",chance:.74,stat:"intercept",win:.19,lose:-.25},"你封住最危险的传球，对手只能仓促起脚。","对手看穿意图，把球塞入另一侧空当。"),
        pd("df-tactical-foul","octagon","战术犯规","用犯规换取全队重新落位",{possession:-1,fitness:-1,bonus:1,risk:-5,skill:"defending",chance:.82,stat:"foul",win:.05,lose:-.35},"你在安全区域及时犯规，阻止反击。","犯规位置危险，主裁判也掏出了牌。")]),
      closing:scenario("df-box-scramble","flame","禁区内连续争抢","皮球在禁区内多次折射，对手已经准备近距离补射。","六码区前","极高",.4,[
        pd("df-slide-block","shield","倒地封堵","不惜身体挡住这次射门",{possession:0,fitness:-5,bonus:7,risk:4,skill:"defending",chance:.7,stat:"clear",win:.3,lose:-.42},"你倒地挡出近距离射门。","皮球从你腿边穿过，直奔球门。"),
        pd("df-clear-stands","send","大脚解围","把球尽快送离禁区",{possession:-4,fitness:-2,bonus:4,risk:-4,skill:"defending",chance:.86,stat:"clear",win:.14,lose:-.2},"你不再犹豫，大脚把球踢上看台。","解围踢疵，皮球仍留在门前。"),
        pd("df-hold-offside","scan-line","保持造越位线","相信整条防线同步前压",{possession:2,fitness:-1,bonus:6,risk:7,skill:"defending",chance:.58,stat:"intercept",win:.28,lose:-.48},"防线同步前压，对手被判越位。","队友没有同步，前锋获得单刀。"),
        pd("df-find-outlet","shuffle","解围找队友","尝试以传球结束连续防守",{possession:4,fitness:-2,bonus:5,risk:5,skill:"passing",chance:.6,stat:"distribution",win:.23,lose:-.32},"你在压力下找到接应点，球队成功脱困。","传球被封堵，禁区内再次混战。")])
    },
    holding:{
      opening:scenario("dm-pressed-receive","circle-dot","背身接球遭到贴防","中卫把球交给你，对方前腰已经从身后压迫，边路有空当。","后场中路","中",.18,[
        pd("dm-one-touch","shuffle","一脚回做","快速释放球权重新移动",{possession:4,fitness:-1,bonus:3,risk:-3,skill:"passing",chance:.82,stat:"pass",win:.12,lose:-.14},"你一脚回做并摆脱盯防。","回传力量偏小，队友被迫仓促处理。"),
        pd("dm-turn-away","rotate-ccw","转身摆脱","用身体护球带过第一道压迫",{possession:3,fitness:-3,bonus:6,risk:5,skill:"dribbling",chance:.61,stat:"dribble",win:.25,lose:-.35},"你倚住对手完成转身，面前豁然开朗。","对手从身后把球捅走。"),
        pd("dm-switch-wide","split","直接转移边路","利用对手收缩留下的空间",{possession:3,fitness:-1,bonus:5,risk:3,skill:"passing",chance:.69,stat:"pass",win:.2,lose:-.24},"你送出准确转移，边路获得推进机会。","转移球被边锋提前判断。"),
        pd("dm-draw-foul","shield-check","护球等待犯规","利用身体保护球权",{possession:3,fitness:-2,bonus:2,risk:-2,skill:"physical",chance:.76,stat:"control",win:.12,lose:-.2},"你护住球并赢得后场任意球。","裁判没有表示，皮球被抢走。")]),
      firstHalf:scenario("dm-stop-counter","zap","对方从中路发动转换","本队边后卫仍在前场，对手持球人正准备把球送向空出的肋部。","中圈附近","高",.28,[
        pd("dm-intercept-lane","split","预判直塞","提前移动封住传球线路",{possession:3,fitness:-2,bonus:5,risk:1,skill:"defending",chance:.73,stat:"intercept",win:.22,lose:-.25},"你提前截下直塞，立即夺回球权。","对手改变传球方向，绕过你的封锁。"),
        pd("dm-front-tackle","shield","正面抢断","不给持球人抬头观察的时间",{possession:2,fitness:-4,bonus:6,risk:4,skill:"defending",chance:.65,stat:"tackle",win:.25,lose:-.34},"你强硬而干净地完成抢断。","对手轻巧拨球，突破你的上抢。"),
        pd("dm-screen-defence","map-pin","保护中卫身前","保持位置压缩危险区域",{possession:0,fitness:-2,bonus:3,risk:-3,skill:"defending",chance:.8,stat:"control",win:.14,lose:-.16},"你站住关键位置，迫使对手走边。","你只关注中路，对方边锋获得空间。"),
        pd("dm-drop-between","undo-2","落入中卫之间","临时形成三中卫阻止反击",{possession:1,fitness:-3,bonus:4,risk:-2,skill:"defending",chance:.76,stat:"clear",win:.18,lose:-.2},"你及时回到防线，破坏了最后一传。","回撤稍晚，对手已经进入禁区。")]),
      middle:scenario("dm-second-ball","activity","中场出现第二落点","双方争顶后皮球弹向中圈，你和对方中场同时冲向落点。","中圈","中",.2,[
        pd("dm-press-second","arrow-up","抢先压迫","用强度夺下第二点",{possession:3,fitness:-4,bonus:5,risk:3,skill:"physical",chance:.68,stat:"tackle",win:.22,lose:-.28},"你抢先伸脚，把球控制下来。","对手先触球并从你身边摆脱。"),
        pd("dm-secure-ball","shield-check","先护住皮球","控制节奏等待队友接应",{possession:5,fitness:-2,bonus:3,risk:-2,skill:"physical",chance:.78,stat:"control",win:.15,lose:-.18},"你用身体隔开对手，稳稳控制球权。","对抗中失去平衡，皮球被对方拿走。"),
        pd("dm-first-switch","send","第一时间转移","趁对手阵型未稳发动进攻",{possession:1,fitness:-2,bonus:6,risk:5,skill:"passing",chance:.62,stat:"pass",win:.24,lose:-.3},"你不停球完成转移，进攻突然提速。","仓促传球偏离目标。"),
        pd("dm-carry-forward","move-up","带球越过中线","利用中路无人防守的空间",{possession:2,fitness:-4,bonus:6,risk:5,skill:"dribbling",chance:.61,stat:"dribble",win:.24,lose:-.32},"你带球穿过中场，迫使对手后退。","带球过大，对手从侧面断球。")]),
      closing:scenario("dm-late-turnover","triangle-alert","最后阶段中路丢球","队友冒险直塞被断，对手正在中圈形成三打三转换。","中圈后方","极高",.34,[
        pd("dm-stop-foul","octagon","立即战术犯规","终止转换并接受判罚风险",{possession:-1,fitness:-2,bonus:1,risk:-6,skill:"defending",chance:.8,stat:"foul",win:.05,lose:-.4},"你及时拉住对手，球队得以重新站位。","你没能阻止推进，反而吃到一张牌。"),
        pd("dm-delay-counter","clock-3","延缓持球人","边退边封住向前线路",{possession:0,fitness:-3,bonus:4,risk:-3,skill:"defending",chance:.75,stat:"control",win:.18,lose:-.23},"你逼迫对方横传，回防人数已经到位。","持球人突然加速，从你身侧通过。"),
        pd("dm-win-and-direct","send","抢断后直接向前","把防守瞬间转成最后机会",{possession:1,fitness:-4,bonus:8,risk:7,skill:"passing",chance:.55,stat:"pass",win:.3,lose:-.38},"你断球后送出直传，前锋获得冲刺机会。","直传被拦截，球队再次暴露在反击中。"),
        pd("dm-track-runner","scan-line","跟住无球前插者","牺牲上抢确保禁区人数",{possession:0,fitness:-4,bonus:4,risk:-4,skill:"pace",chance:.73,stat:"intercept",win:.18,lose:-.24},"你一路跟回禁区，抢先处理横传。","你在回追中被对手甩开半个身位。")])
    },
    midfielder:{
      opening:scenario("cm-open-space","waypoints","中场获得向前空间","你在中圈接球，对手两条线之间暂时没有球员上抢。","中场中路","低",.14,[
        pd("cm-simple-settle","shuffle","简洁交给前腰","让球队保持开局节奏",{possession:5,fitness:0,bonus:2,risk:-3,skill:"passing",chance:.86,stat:"pass",win:.1,lose:-.1},"你准确把球送到前腰脚下。","传球稍慢，前腰被迫回传。"),
        pd("cm-switch-play","split","长传转移弱侧","迅速改变进攻方向",{possession:2,fitness:-1,bonus:5,risk:3,skill:"passing",chance:.69,stat:"pass",win:.19,lose:-.23},"你的转移准确找到无人盯防的边路。","长传出了边线。"),
        pd("cm-carry-space","move-up","带球向前推进","吸引中场后再寻找队友",{possession:3,fitness:-3,bonus:5,risk:3,skill:"dribbling",chance:.68,stat:"dribble",win:.2,lose:-.25},"你带球推进十余米，迫使防线收缩。","对手从侧后方完成抢断。"),
        pd("cm-third-man","repeat-2","寻找第三人配合","用连续传递穿过中场",{possession:4,fitness:-2,bonus:6,risk:4,skill:"passing",chance:.64,stat:"pass",win:.22,lose:-.27},"连续撞墙配合让你们进入进攻三区。","队友没有理解跑位，传球被截断。")]),
      firstHalf:scenario("cm-half-space","sparkles","肋部出现接球窗口","前锋回撤带走中卫，你在禁区前右侧获得短暂空当。","进攻肋部","中",.2,[
        pd("cm-through-ball","send","送出直塞","抓住防线移动中的缝隙",{possession:-1,fitness:-2,bonus:7,risk:6,skill:"passing",chance:.59,stat:"pass",win:.27,lose:-.3},"直塞穿透防线，队友形成射门。","直塞被中卫伸脚拦下。"),
        pd("cm-wall-pass","repeat-2","与前锋撞墙","继续向禁区前沿移动",{possession:3,fitness:-3,bonus:6,risk:3,skill:"passing",chance:.68,stat:"pass",win:.22,lose:-.24},"撞墙配合成功，你在禁区前重新得球。","回做被对手预判。"),
        pd("cm-edge-shot","crosshair","禁区外起脚","利用对手没有及时上抢",{possession:-2,fitness:-2,bonus:6,risk:5,skill:"shooting",chance:.57,stat:"shot",win:.23,lose:-.2},"你的远射迫使门将做出扑救。","射门没有压住，皮球高出横梁。"),
        pd("cm-recycle","undo-2","回传重新组织","保留球权等待更好机会",{possession:5,fitness:1,bonus:1,risk:-4,skill:"passing",chance:.9,stat:"pass",win:.08,lose:-.08},"你没有勉强处理，球队重新展开进攻。","回传让进攻节奏暂时中断。")]),
      middle:scenario("cm-tempo-choice","gauge","比赛节奏突然加快","双方连续转换，中场空间增大，你接球时队友正在不同方向前插。","中圈前方","中",.22,[
        pd("cm-quick-vertical","fast-forward","快速纵向传递","趁对方防线未落位推进",{possession:0,fitness:-2,bonus:7,risk:5,skill:"passing",chance:.62,stat:"pass",win:.25,lose:-.28},"你快速把球打到防线身后。","传球被回追中场拦截。"),
        pd("cm-late-run","move-up","交球后继续前插","从第二线攻击禁区空间",{possession:0,fitness:-5,bonus:7,risk:5,skill:"pace",chance:.62,stat:"shot",win:.26,lose:-.26},"你后插上接到回做并完成射门。","前插时机稍晚，队友只能转移。"),
        pd("cm-control-tempo","circle-dot","踩住节奏","用连续控球稳定中场",{possession:6,fitness:1,bonus:2,risk:-4,skill:"passing",chance:.86,stat:"control",win:.12,lose:-.1},"你用几次安全传递让比赛重新受控。","对手突然上抢，迫使你仓促出球。"),
        pd("cm-wide-switch","split","转移到弱侧","利用快速转换后的横向空当",{possession:2,fitness:-2,bonus:5,risk:3,skill:"passing",chance:.7,stat:"pass",win:.2,lose:-.22},"转移准确落到弱侧队友脚下。","皮球飞行太久，对手完成移动。")]),
      closing:scenario("cm-late-loose-ball","flame","禁区弧顶出现第二点","角球被顶出后，皮球正落向你所在的禁区弧区域。","禁区弧顶","高",.27,[
        pd("cm-volley","crosshair","直接凌空射门","不给防线再次封堵的时间",{possession:-3,fitness:-3,bonus:9,risk:8,skill:"shooting",chance:.48,stat:"shot",win:.34,lose:-.25},"你迎球抽射，皮球直奔球门死角。","凌空射门没有吃准部位。"),
        pd("cm-slip-pass","send","顺势塞入禁区","寻找仍处于有利位置的前锋",{possession:-1,fitness:-2,bonus:8,risk:6,skill:"passing",chance:.57,stat:"pass",win:.3,lose:-.3},"你送出隐蔽直塞，前锋获得绝佳机会。","传球被密集防线挡回。"),
        pd("cm-wide-cross","move-up-right","分边后立即传中","重新把球送回门前",{possession:0,fitness:-3,bonus:6,risk:4,skill:"passing",chance:.64,stat:"cross",win:.23,lose:-.22},"你与边路完成配合，传中落到危险区域。","分边节奏偏慢，对手重新站稳。"),
        pd("cm-secure-second","shield-check","控制第二点","避免被对手直接反击",{possession:5,fitness:-1,bonus:2,risk:-5,skill:"dribbling",chance:.84,stat:"control",win:.12,lose:-.16},"你稳稳停下皮球，继续围攻。","停球稍大，对手抢到反击机会。")])
    },
    creator:{
      opening:scenario("am-isolation","move-up-right","边路形成一对一","你在边线附近接球，边后卫独自面对你，队友正从外侧套上。","进攻边路","中",.18,[
        pd("am-take-on","swords","正面突破","利用速度直接挑战边后卫",{possession:-1,fitness:-3,bonus:6,risk:5,skill:"dribbling",chance:.64,stat:"dribble",win:.25,lose:-.28},"你变向突破边后卫，进入传中区域。","对手判断准确，把球断下。"),
        pd("am-use-overlap","move-up-right","交给套边队友","吸引防守后利用外侧通道",{possession:3,fitness:-1,bonus:5,risk:2,skill:"passing",chance:.75,stat:"pass",win:.19,lose:-.18},"你传球时机准确，套边队友获得空间。","边后卫提前封住传球线路。"),
        pd("am-cut-combine","repeat-2","内切寻求配合","进入肋部与中场打撞墙",{possession:2,fitness:-3,bonus:6,risk:4,skill:"dribbling",chance:.66,stat:"dribble",win:.23,lose:-.27},"你内切后完成配合，继续向禁区推进。","内切路线拥挤，皮球被破坏。"),
        pd("am-early-cross","send","提前传中","趁中卫还未完全落位送球",{possession:-1,fitness:-2,bonus:5,risk:4,skill:"passing",chance:.65,stat:"cross",win:.2,lose:-.2},"传中越过前点，后点队友获得机会。","传中高度不足，被第一点解围。")]),
      firstHalf:scenario("am-between-lines","sparkles","在两线之间接球","你背对球门接到中场传球，身后防守者正在快速贴近。","禁区前沿","高",.23,[
        pd("am-turn-face","rotate-ccw","转身面对球门","用第一脚触球摆脱贴防",{possession:1,fitness:-3,bonus:7,risk:6,skill:"dribbling",chance:.59,stat:"dribble",win:.28,lose:-.34},"你漂亮转身，直接面对防线。","防守者从身后把球捅走。"),
        pd("am-first-through","send","不停球直塞","利用视野找到前锋跑位",{possession:-1,fitness:-1,bonus:7,risk:5,skill:"passing",chance:.62,stat:"pass",win:.27,lose:-.28},"你不停球送出直塞，前锋形成机会。","传球意图被中卫识破。"),
        pd("am-layoff-move","repeat-2","回做后前插","避开贴防重新寻找接球点",{possession:4,fitness:-3,bonus:5,risk:1,skill:"passing",chance:.75,stat:"pass",win:.19,lose:-.18},"回做与前插衔接流畅，你在禁区前再次得球。","队友没有及时回传。"),
        pd("am-turn-shot","crosshair","转身直接射门","利用防守者尚未封堵的瞬间",{possession:-3,fitness:-2,bonus:7,risk:7,skill:"shooting",chance:.51,stat:"shot",win:.28,lose:-.25},"你转身起脚，射门迫使门将侧扑。","射门被贴身防守者封堵。")]),
      middle:scenario("am-counter-choice","zap","反击中形成前场三打三","你带球越过中线，左右两侧都有队友高速前插。","进攻转换","高",.25,[
        pd("am-carry-counter","move-up","继续带球吸引防守","等待中卫作出选择后再处理",{possession:1,fitness:-5,bonus:7,risk:5,skill:"dribbling",chance:.63,stat:"dribble",win:.27,lose:-.3},"你带球吸引中卫，为队友创造空当。","带球节奏拖慢，对手完成回防。"),
        pd("am-release-early","send","提前送出直塞","让速度最快的队友直接冲刺",{possession:-1,fitness:-2,bonus:8,risk:6,skill:"passing",chance:.59,stat:"pass",win:.3,lose:-.3},"提前量恰到好处，队友获得单刀。","直塞力量过大，门将先得到球。"),
        pd("am-wide-lane","move-up-right","拉向边路推进","扩大进攻宽度并保留球权",{possession:3,fitness:-4,bonus:5,risk:2,skill:"pace",chance:.72,stat:"dribble",win:.2,lose:-.2},"你拉开宽度，反击得以继续推进。","对手边后卫及时封住线路。"),
        pd("am-slow-support","gauge","减速等待支援","避免三打三演变成丢球反击",{possession:5,fitness:0,bonus:2,risk:-4,skill:"passing",chance:.86,stat:"control",win:.1,lose:-.12},"你保护球权，更多队友已经赶到。","反击机会随着减速消失。")]),
      closing:scenario("am-edge-late","clock-3","禁区前获得最后处理机会","对手防线全部退入禁区，你在弧顶左侧接球，封堵者正快速冲出。","禁区弧侧","极高",.29,[
        pd("am-curl-shot","crosshair","兜射远角","利用封堵者重心尝试决定比赛",{possession:-3,fitness:-4,bonus:9,risk:8,skill:"shooting",chance:.5,stat:"shot",win:.34,lose:-.25},"你的弧线球绕过封堵直奔远角。","射门被冲出的后卫挡下。"),
        pd("am-beat-blocker","swords","扣过封堵者","进入禁区后再选择射门或传球",{possession:-1,fitness:-5,bonus:9,risk:9,skill:"dribbling",chance:.5,stat:"dribble",win:.34,lose:-.4},"你扣过封堵者，禁区内出现巨大空间。","对手伸脚断球并立即发动反击。"),
        pd("am-cutback","undo-2","分边后接倒三角","寻找点球点附近的队友",{possession:1,fitness:-3,bonus:7,risk:4,skill:"passing",chance:.64,stat:"cross",win:.27,lose:-.24},"倒三角传到无人区域，队友迎球射门。","传球被门前第一名后卫挡出。"),
        pd("am-win-foul","shield-check","护球制造犯规","争取位置理想的定位球",{possession:2,fitness:-3,bonus:5,risk:1,skill:"dribbling",chance:.72,stat:"control",win:.2,lose:-.22},"对手碰倒了你，球队获得前场任意球。","裁判认为身体接触合理，比赛继续。")])
    },
    forward:{
      opening:scenario("st-press-build","arrow-up","对方中卫横向出球","对手后场正在倒脚，其中一名中卫停球稍大，门将是他的回传选择。","前场压迫区","中",.16,[
        pd("st-press-centre","flame","直接压迫中卫","迫使持球者立即处理",{possession:2,fitness:-4,bonus:5,risk:2,skill:"pace",chance:.68,stat:"tackle",win:.2,lose:-.14},"你的压迫迫使中卫把球踢出边线。","中卫冷静传球，从你身边化解压力。"),
        pd("st-block-keeper","split","封锁回传门将","诱导中卫向危险区域出球",{possession:1,fitness:-3,bonus:4,risk:1,skill:"pace",chance:.72,stat:"intercept",win:.18,lose:-.15},"你封住回传线路，队友完成抢断。","中卫找到另一侧安全接应。"),
        pd("st-curve-press","rotate-ccw","弧线跑动逼抢","同时限制中卫与后腰的连接",{possession:2,fitness:-4,bonus:6,risk:3,skill:"physical",chance:.66,stat:"intercept",win:.23,lose:-.18},"你的跑动切断两条线路，球队在前场夺球。","跑动角度被识破，对方顺利推进。"),
        pd("st-hold-shape","map-pin","保持进攻位置","保存体能等待队友统一压迫",{possession:0,fitness:1,bonus:1,risk:-2,chance:.88,stat:"control",win:.06,lose:-.08},"你保持阵型，没有让防线被轻易拉开。","对手从容组织，逐渐推进过半场。")]),
      firstHalf:scenario("st-box-cross","send","边路传中即将到来","边锋已经抬头，你位于两名中卫之间，门前有三个可攻击区域。","禁区中路","高",.25,[
        pd("st-near-post","move-up-right","冲击前点","抢在中卫之前完成触球",{possession:-1,fitness:-4,bonus:7,risk:5,skill:"pace",chance:.61,stat:"shot",win:.28,lose:-.22},"你抢到前点，把传中蹭向球门。","中卫跟住跑位，抢先完成解围。"),
        pd("st-far-post","move-right","绕向后点","避开正面对抗等待传中过顶",{possession:0,fitness:-3,bonus:6,risk:3,skill:"pace",chance:.67,stat:"shot",win:.25,lose:-.2},"你绕到后点，无人干扰完成攻门。","传中没有越过第一名中卫。"),
        pd("st-penalty-spot","map-pin","停在点球点","观察落点后攻击第二点",{possession:1,fitness:-2,bonus:5,risk:1,skill:"shooting",chance:.71,stat:"shot",win:.22,lose:-.18},"皮球被顶到点球点，你迎球完成射门。","后腰及时回收，封住你的起脚。"),
        pd("st-screen-defender","shield-check","卡住中卫","为后插上的队友制造空间",{possession:2,fitness:-3,bonus:4,risk:0,skill:"physical",chance:.74,stat:"control",win:.18,lose:-.18},"你牵制中卫，队友从后排获得射门机会。","裁判吹罚你进攻犯规。")]),
      middle:scenario("st-through-chance","zap","直塞形成单刀机会","你反越位成功，门将正在出击，身侧还有一名队友同步跟进。","禁区正面","极高",.3,[
        pd("st-first-shot","crosshair","第一时间低射","不给回追后卫封堵机会",{possession:-3,fitness:-3,bonus:9,risk:7,skill:"shooting",chance:.57,stat:"shot",win:.35,lose:-.25},"你第一时间推射远角，门将来不及反应。","射门角度太正，被门将封住。"),
        pd("st-round-keeper","swords","趟过门将","追求更高质量的空门机会",{possession:-2,fitness:-5,bonus:10,risk:10,skill:"dribbling",chance:.48,stat:"dribbleShot",win:.42,lose:-.48},"你冷静趟过门将，面对空门。","门将准确扑到脚下，把球没收。"),
        pd("st-square-pass","split","横传跟进队友","用传球绕过出击门将",{possession:1,fitness:-2,bonus:8,risk:4,skill:"passing",chance:.67,stat:"pass",win:.32,lose:-.24},"你的横传越过门将，队友轻松完成射门。","横传被回追后卫伸脚破坏。"),
        pd("st-protect-wait","shield-check","护球等待支援","避免在角度不足时仓促处理",{possession:3,fitness:-3,bonus:4,risk:1,skill:"physical",chance:.72,stat:"control",win:.18,lose:-.22},"你护住球，后插上队友已经到位。","回追后卫从身后完成抢断。")]),
      closing:scenario("st-late-scramble","flame","门前出现最后机会","射门被门将挡出，皮球弹向六码区，你与中卫同时冲向落点。","六码区","极高",.36,[
        pd("st-snap-rebound","crosshair","抢先补射","不调整直接把球送回门前",{possession:-3,fitness:-5,bonus:10,risk:8,skill:"shooting",chance:.56,stat:"shot",win:.38,lose:-.28},"你抢先伸脚补射，皮球直奔球门。","仓促补射偏出近门柱。"),
        pd("st-slide-finish","move-up","倒地铲射","用最大伸展距离争夺落点",{possession:-3,fitness:-6,bonus:10,risk:9,skill:"physical",chance:.5,stat:"shot",win:.4,lose:-.36},"你倒地铲到皮球，门将已经失去位置。","你慢了半步，中卫率先解围。"),
        pd("st-layoff-late","undo-2","回做弧顶队友","利用防线全部收向门前的空间",{possession:1,fitness:-2,bonus:8,risk:5,skill:"passing",chance:.62,stat:"pass",win:.3,lose:-.25},"你把球回做，队友迎球劲射。","回做力量太轻，被防守者截下。"),
        pd("st-win-corner","flag","护球制造角球","保留最后一次定位球机会",{possession:2,fitness:-3,bonus:5,risk:-1,skill:"physical",chance:.76,stat:"control",win:.18,lose:-.16},"你把球打在后卫腿上，赢得角球。","后卫稳稳护球出了底线。")])
    }
  };

  function coachDecisionEvent(m) {
    const phase=matchPhase(m),situation=matchSituation(m),possession=m.possession;
    const events={opening:["对手开局主动压迫","对手前锋正在封锁后场短传线路。","本方后场","中"],firstHalf:[possession<48?"中场控制权正在流失":"肋部空间逐渐出现",possession<48?"对手连续赢得第二落点，球队难以稳定推进。":"对手边后卫频繁内收，边路和肋部之间出现空当。","中场","中"],middle:[situation.id==="trailing"?"球队需要改变比赛走势":situation.id==="leading"?"对手开始提高进攻人数":"比赛进入拉锯阶段",situation.id==="trailing"?"当前进攻投入不足，禁区内接应点有限。":situation.id==="leading"?"对手阵线明显前移，身后空间与防守压力同时增加。":"双方攻防转换加快，中场距离正在拉大。","全场","高"],closing:[situation.id==="trailing"?"时间正在快速流逝":situation.id==="leading"?"对手发起最后围攻":"下一次攻防可能决定比赛",`比赛来到 ${m.minute}'，当前${situation.label}，体能与风险控制将直接影响结果。`,"决胜区域","极高"]};
    const item=events[phase.id];return {id:`coach-${phase.id}-${m.minute}`,icon:"radio",title:item[0],detail:item[1],zone:item[2],pressure:item[3],groupLabel:"全队",minute:m.minute,scoreLabel:situation.label};
  }

  function generateDecisionEvent(m,save=state) {
    if(save.role==="coach")return coachDecisionEvent(m);
    const player=save.squad.find(item=>item.id===save.controlledId);if(!player)return null;
    const group=playerDecisionGroup(player.position),phase=matchPhase(m),situation=matchSituation(m),base=PLAYER_DECISION_SCENARIOS[group]?.[phase.id];if(!base)return null;
    const groupLabel=({goalkeeper:"门将",defender:"后卫",holding:"后腰",midfielder:"中场",creator:"前腰 / 边锋",forward:"前锋"})[group];
    return {...base,options:base.options.map(option=>({...option,effect:{...option.effect},resolution:{...option.resolution}})),group,groupLabel,minute:m.minute,scoreLabel:situation.label,detail:`${base.detail} 当前比分${situation.label}，比赛处于${phase.label}。`};
  }

  function ensureDecisionEvent(m,save=state) {
    if(!m||m.finished)return null;
    if(save.role==="player"&&!(m.lineupIds||[]).includes(save.controlledId))return null;
    if(!m.decisionEvent||m.decisionEvent.minute!==m.minute)m.decisionEvent=generateDecisionEvent(m,save);
    return m.decisionEvent;
  }

  function renderDecisionEvent(event) {
    return `<article class="live-decision-event"><div class="live-event-icon">${icon(event.icon||"radio")}</div><div class="live-event-copy"><span>第 ${event.minute}' · 场上即时事件</span><strong>${esc(event.title)}</strong><p>${esc(event.detail)}</p></div><div class="live-event-tags"><span>${icon("map-pin")}${esc(event.zone)}</span><span class="pressure-${event.pressure==="极高"?"critical":event.pressure==="高"?"high":"normal"}">${icon("activity")}压力 ${esc(event.pressure)}</span></div></article>`;
  }

  function matchDecisions(m=state.activeMatch) {
    const phase=matchPhase(m).id,situation=matchSituation(m).id;
    const d=(id,icon,label,desc,possession,fitness,bonus,tactical,risk,text)=>({id,icon,label,desc,effect:{possession,fitness,bonus,tactical,risk},text});
    if(state.role==="coach"){
      if(phase==="opening")return [
        d("observe-press","scan-line","观察性压迫","试探对方出球，风险较低",3,-2,2,2,1,"球队保持阵型进行试探性压迫。"),
        d("build-back","waypoints","从后场组织","提高控球，耐心寻找空间",5,1,1,2,0,"球队从门将开始耐心组织进攻。"),
        d("attack-wide","move-up-right","主攻边路","增加推进速度与传中机会",-1,-2,4,3,2,"进攻重心转向边路，边后卫开始频繁套上。"),
        d("settle-team","megaphone","稳定军心","减少开局波动并提升执行力",1,0,2,2,-1,"场边要求全队保持冷静，严格执行赛前部署。")
      ];
      if(phase==="firstHalf")return [
        d("half-space","split","加强肋部渗透","创造更高质量机会，但容易丢球",2,-3,5,4,3,"球队开始反复攻击中卫与边后卫之间的空当。"),
        d("first-half-counter","zap","提速反击","牺牲控球，快速冲击身后",-4,-2,6,3,4,"球队加快由守转攻，向对方防线身后送球。"),
        d("slow-before-half","gauge","压低比赛节奏","保存体能，减少半场前失误",5,1,0,2,-2,"球队放缓节奏，用控球度过半场前的阶段。"),
        d("mark-playmaker","crosshair","限制对方核心","减少威胁，但增加防守消耗",1,-2,3,3,2,"中场开始贴身限制对方的进攻组织者。")
      ];
      if(phase==="middle"&&situation==="trailing")return [
        d("early-push","arrow-up","提前大举压上","显著增加机会，也暴露身后",-2,-5,8,5,7,"球队整体阵线前移，开始持续围攻。"),
        d("overlap-backs","move-up-right","边后卫套上","拉开宽度并制造人数优势",1,-4,6,4,5,"两名边后卫同时压上参与进攻。"),
        d("load-box","users-round","增加禁区人数","提高抢点概率，反击风险更高",-3,-3,7,4,6,"更多球员进入禁区等待传中与二点球。"),
        d("patient-chase","gauge","保持耐心","稳住控球，等待防线出现漏洞",5,1,2,2,-2,"球队没有盲目进攻，而是继续耐心调动防线。")
      ];
      if(phase==="middle"&&situation==="leading")return [
        d("control-midfield","circle-dot","控制中场","压缩空间并牢牢掌握球权",6,1,1,3,-2,"球队增加中场接应点，开始控制比赛。"),
        d("keep-counter","zap","保留反击点","保持纵深，对手不敢全线压上",-2,-1,4,2,2,"锋线仍留在前场，随时准备发动反击。"),
        d("lower-press","battery-medium","降低压迫","恢复体能，但让出部分主动权",2,3,0,1,-3,"球队降低压迫频率，保持紧凑站位。"),
        d("deny-creator","shield-check","限制核心","切断对方最危险的进攻来源",1,-2,2,3,1,"防守重心转向限制对方核心球员。")
      ];
      if(phase==="middle")return [
        d("mid-tempo","fast-forward","中场提速","争取主动，承担一定转换风险",2,-3,5,4,3,"球队突然提高节奏，试图打破僵局。"),
        d("invite-counter","zap","诱导后反击","主动让出空间，寻找反击机会",-3,-1,5,3,3,"球队略微回收，等待对方阵型前压。"),
        d("keep-control","gauge","继续控场","降低波动，等待更稳妥的机会",5,1,1,2,-2,"球队保持控球，不急于完成最后一传。"),
        d("rally-team","megaphone","鼓励全队","提升专注与短期执行力",1,0,3,3,0,"场边的鼓励让全队重新集中注意力。")
      ];
      if(situation==="trailing")return [
        d("all-out","swords","全线压上","机会大增，极易遭到反击",-5,-7,10,7,10,"球队全线压过半场，比赛进入最后一搏。"),
        d("box-bombard","send","直接轰炸禁区","连续传中争抢二点球",-7,-5,9,5,9,"球队放弃繁复组织，连续将球送入禁区。"),
        d("desperate-press","flame","高位疯狂反抢","压迫收益高，体能消耗巨大",2,-7,8,6,8,"所有球员在前场展开不惜体力的反抢。"),
        d("keeper-up","goal","门将参与进攻","最后时刻最高收益与最高风险",-6,-8,12,4,14,"门将也进入前场，球队孤注一掷。")
      ];
      if(situation==="leading")return [
        d("low-block","shield","收缩低位防守","减少身后空间，放弃进攻人数",-4,3,0,5,-5,"球队退守低位，用密集站位保护领先。"),
        d("kill-tempo","clock-3","控球拖慢节奏","降低比赛回合并保存体能",8,2,0,4,-4,"球队利用安全传递主动消耗比赛时间。"),
        d("safe-counter","zap","只打安全反击","保留少量威胁，不轻易投入兵力",-2,1,3,3,-1,"球队只在机会明确时才发动反击。"),
        d("protect-energy","battery-charging","保护体能","降低强度，稳妥完成比赛",2,4,-1,1,-4,"球队控制跑动强度并保持阵型完整。")
      ];
      return [
        d("late-push","swords","最后一搏","全力争胜，但输球风险明显提高",-3,-6,9,6,9,"球队大举压上争取最后的进球。"),
        d("measured-win","scale","谨慎争胜","保持平衡并寻找高质量机会",3,-2,4,4,2,"球队在保持平衡的前提下继续争胜。"),
        d("set-piece-push","flag","定位球压上","利用定位球制造决定性机会",-1,-3,7,4,5,"高大球员全部进入禁区争抢定位球。"),
        d("accept-draw","shield-check","守住平局","减少风险并控制最后阶段",5,2,-1,3,-4,"球队不再冒险，优先确保不被绝杀。")
      ];
    }
    const event=ensureDecisionEvent(m);
    return event?.options||[];
  }

  function renderMatchReport(report) {
    if(!report)return `<div class="report-missing">这条通知来自旧版本存档，没有可回溯的比赛明细。</div>`;
    const rows=[["控球率",`${report.homeStats.possession}%`,`${report.awayStats.possession}%`],["射门",report.homeStats.shots,report.awayStats.shots],["射正",report.homeStats.onTarget,report.awayStats.onTarget],["预期进球",Number(report.homeStats.xg).toFixed(2),Number(report.awayStats.xg).toFixed(2)],["角球",report.homeStats.corners,report.awayStats.corners],["犯规",report.homeStats.fouls,report.awayStats.fouls],["黄牌",report.homeStats.yellow||0,report.awayStats.yellow||0],["红牌",report.homeStats.red||0,report.awayStats.red||0]];
    const ratingRows=[...(report.ratings||[])].sort((a,b)=>positionSortRank(a.position)-positionSortRank(b.position)||b.minutes-a.minutes||b.rating-a.rating);
    return `<div class="report-score"><div><span>${clubNameLink(report.homeName)}</span><strong>${report.score.home}</strong></div><div class="report-result"><span>${esc(report.competition)} · ${esc(report.round)}</span><b>全场</b>${report.penalties?`<small>点球 ${report.penalties.home}-${report.penalties.away}</small>`:""}</div><div><strong>${report.score.away}</strong><span>${clubNameLink(report.awayName)}</span></div></div>
      <section class="report-section"><div class="report-team-head"><strong>${esc(report.homeName)}</strong><span>比赛数据</span><strong>${esc(report.awayName)}</strong></div>${rows.map(([label,home,away])=>`<div class="report-stat-row"><strong>${home}</strong><span>${label}</span><strong>${away}</strong></div>`).join("")}</section>
      <section class="report-section"><h3>球员表现</h3><div class="report-mvp">${icon("star")}<span>本场最佳</span><strong>${playerNameLink(report.mvp,{clubName:report.mvp.ours?(report.teamName||clubById(state.clubId).name):report.awayName})} · ${Number(report.mvp.rating).toFixed(2)}</strong></div><div class="table-wrap"><table class="report-player-table"><thead><tr><th>球员</th><th>位置</th><th class="num">分钟</th><th class="num">进球</th><th class="num">助攻</th><th>关键贡献</th><th>防守数据</th><th>评分依据</th><th class="num">评分</th></tr></thead><tbody>${ratingRows.map(player=>{const subOn=report.substitutions.find(item=>item.team==="ours"&&item.inId===player.id),subOff=report.substitutions.find(item=>item.team==="ours"&&item.outId===player.id),movement=subOff?`<b class="substitution-badge off">${icon("arrow-down")}换下</b>`:subOn?`<b class="substitution-badge on">${icon("arrow-up")}换上</b>`:"";return `<tr><td><span class="player-link-wrap">${playerNameLink(player,{clubName:report.teamName||clubById(state.clubId).name})}${movement}</span></td><td>${playerRoleLabel(player.position)}</td><td class="num">${player.minutes}</td><td class="num">${player.goals}</td><td class="num">${player.assists}</td><td>${playerContributionText(player)}</td><td>${playerDefensiveText(player)}</td><td>${(player.ratingReasons||[]).map(esc).join(" · ")||"稳定完成职责"}</td><td class="num"><span class="live-rating ${ratingClass(player.rating)}">${Number(player.rating).toFixed(2)}</span></td></tr>`;}).join("")}</tbody></table></div></section>
      ${report.heatmapSummary?.length?`<section class="report-section"><h3>场上活动区域</h3><div class="report-heatmap-summary">${report.heatmapSummary.slice(0,8).map(player=>`<div><strong>${esc(player.name)}</strong><span>${esc(player.zone)}</span><i><b style="width:${player.intensity}%"></b></i></div>`).join("")}</div></section>`:""}
      <section class="report-section"><h3>换人与医疗</h3>${report.substitutions.length?`<div class="report-events substitution-events">${report.substitutions.map(item=>{const ours=item.team==="ours";return `<div class="${ours?"report-sub-ours":"report-sub-opponent"}"><time>${eventMinuteLabel(item.minute)}</time><span class="report-team-label">${ours?"本队":"对手"}</span><span class="sub-on"><b>换上</b>${esc(item.inName)}</span><span class="sub-off"><b>换下</b>${esc(item.outName)}</span><small>${esc(item.reason||"战术调整")}</small></div>`;}).join("")}</div>`:`<p class="report-copy">本场没有换人记录。</p>`}${report.injuries.length?`<div class="report-injuries">${report.injuries.map(item=>`<span class="tag red">${item.team==="opponent"?"对手":"本队"} · ${esc(item.name)} · ${esc(item.injury)} · ${item.days} 天</span>`).join("")}</div>`:`<p class="report-copy">本场没有新增伤病。</p>`}</section>`;
  }

  function playerContributionText(player) {
    const parts=[];
    if(player.passes)parts.push(`传球 ${player.accuratePasses||0}/${player.passes}`);
    if(player.shots)parts.push(`射门 ${player.onTarget||0}/${player.shots}`);
    if(player.keyPasses)parts.push(`关键传球 ${player.keyPasses}`);
    if(player.chancesCreated)parts.push(`创造机会 ${player.chancesCreated}`);
    if(player.successfulDribbles)parts.push(`过人 ${player.successfulDribbles}`);
    if(player.progressivePasses)parts.push(`推进 ${player.progressivePasses}`);
    if(player.recoveries)parts.push(`夺回 ${player.recoveries}`);
    if(player.pressuresWon)parts.push(`压迫 ${player.pressuresWon}`);
    return parts.length?parts.join(" · "):"—";
  }

  function playerDefensiveText(player) {
    const parts=[];
    if(player.tackles)parts.push(`抢断 ${player.tacklesWon}/${player.tackles}`);
    if(player.interceptions)parts.push(`拦截 ${player.interceptions}`);
    if(player.clearances)parts.push(`解围 ${player.clearances}`);
    if(player.blocks)parts.push(`封堵 ${player.blocks}`);
    if(player.duels)parts.push(`对抗 ${player.duelsWon}/${player.duels}`);
    if(player.saves)parts.push(`扑救 ${player.saves}`);
    if(player.cleanSheets)parts.push("零封");
    return parts.length?parts.join(" · "):"—";
  }

  function renderNotificationDetail(notification) {
    const report=notification.reportId?(state.matchReports||[]).find(item=>item.id===notification.reportId):null;
    return `<div class="notification-meta">${icon(notificationIcon(notification.type))}<span>${formatDate(notification.date)} · ${notification.read?"已查看":"未读"}</span></div>${notification.detail?`<p class="report-copy lead">${esc(notification.detail)}</p>`:""}${notification.facts?.length?`<ul class="report-facts">${notification.facts.map(fact=>`<li>${esc(fact)}</li>`).join("")}</ul>`:""}${notification.type==="match"?renderMatchReport(report):""}`;
  }

  function openNotification(id) {
    const notification=state.notifications.find(item=>item.id===id);if(!notification)return;
    notification.read=true;state.inboxUnread=state.notifications.filter(item=>!item.read).length;modal={type:"notification",id};saveState();render();
  }

  function openFixtureReport(id) {
    const report=(state.matchReports||[]).find(item=>item.id===id);if(!report){toast("这场比赛的历史报告不可用");return;}modal={type:"matchReport",id:report.id};render();
  }

  function profileAttribute(player,key,modifier=0,sourceKey=null) {
    const direct=sourceKey?Number(player[sourceKey]):Number(player[key]);
    if(Number.isFinite(direct)&&direct>0)return clamp(Math.round(direct+modifier*.35),1,99);
    const variance=(stableScoutingUnit(`${player.id||player.name}|${key}`)-.5)*10;
    return clamp(Math.round(Number(player.overall||65)+modifier+variance),1,99);
  }

  function playerAttributeGroups(player) {
    const p=player,position=p.position;
    if(position==="GK")return [
      ["守门",[["反应","reflexes",6],["手型","handling",3],["一对一","oneOnOnes",4],["制空范围","aerialReach",2],["指挥防线","command",2],["开球","kicking",0,"passing"]]],
      ["精神",[["预判","anticipation",3],["决断","decisions",2],["镇定","composure",2],["集中","concentration",4],["站位","positioning",4],["交流","communication",3]]],
      ["身体",[["爆发力","acceleration",-8,"pace"],["灵活","agility",2,"dribbling"],["平衡","balance",0,"physical"],["弹跳","jumping",3,"physical"],["强壮","strength",1,"physical"],["耐力","stamina",-8,"physical"]]]
    ];
    const boosts={
      CB:{finishing:-15,passing:-3,dribbling:-8,tackling:10,positioning:9,offTheBall:-7,pace:-3,strength:7},
      DF:{finishing:-15,passing:-3,dribbling:-8,tackling:10,positioning:9,offTheBall:-7,pace:-3,strength:7},
      RB:{finishing:-8,passing:2,dribbling:2,tackling:5,positioning:4,pace:5,stamina:8},LB:{finishing:-8,passing:2,dribbling:2,tackling:5,positioning:4,pace:5,stamina:8},
      RWB:{finishing:-5,passing:4,dribbling:5,tackling:3,positioning:2,offTheBall:4,pace:7,stamina:10},LWB:{finishing:-5,passing:4,dribbling:5,tackling:3,positioning:2,offTheBall:4,pace:7,stamina:10},
      DM:{finishing:-7,passing:4,dribbling:-2,tackling:8,positioning:8,vision:3,workRate:7,strength:3},
      CM:{finishing:-2,passing:7,dribbling:2,tackling:2,positioning:2,vision:6,workRate:6,stamina:5},
      RM:{finishing:0,passing:5,dribbling:6,tackling:-2,positioning:0,vision:5,offTheBall:5,pace:6,stamina:7},LM:{finishing:0,passing:5,dribbling:6,tackling:-2,positioning:0,vision:5,offTheBall:5,pace:6,stamina:7},
      AM:{finishing:4,passing:7,dribbling:7,tackling:-10,positioning:-3,vision:9,offTheBall:5,agility:4},
      RW:{finishing:5,passing:3,dribbling:9,tackling:-12,vision:3,offTheBall:7,pace:8,agility:6},LW:{finishing:5,passing:3,dribbling:9,tackling:-12,vision:3,offTheBall:7,pace:8,agility:6},
      ST:{finishing:11,passing:-4,dribbling:3,tackling:-15,positioning:-5,composure:6,offTheBall:10,pace:4,strength:5},
      CF:{finishing:7,passing:5,dribbling:7,tackling:-14,positioning:-4,vision:7,composure:7,offTheBall:8,pace:4,strength:1}
    }[position]||{};
    const a=(label,key,sourceKey=null)=>[label,key,boosts[key]||0,sourceKey];
    return [
      ["技术",[a("停球","firstTouch"),a("技术","technique"),a("传球","passing","passing"),a("盘带","dribbling","dribbling"),a("射门","finishing","shooting"),a("抢断","tackling","defending")]],
      ["精神",[a("预判","anticipation"),a("决断","decisions"),a("镇定","composure"),a("视野","vision"),a("站位","positioning"),a("无球跑动","offTheBall"),a("工作投入","workRate")]],
      ["身体",[a("爆发力","acceleration","pace"),a("速度","pace","pace"),a("灵活","agility","dribbling"),a("耐力","stamina","physical"),a("强壮","strength","physical"),a("平衡","balance","physical")]]
    ];
  }

  function playerAttributeSnapshot(player) {
    const snapshot={};playerAttributeGroups(player).forEach(([,attributes])=>attributes.forEach(([,key,modifier,sourceKey])=>{snapshot[key]=profileAttribute(player,key,modifier,sourceKey);}));return snapshot;
  }

  function attributeChanges(before={},after={}) {
    return Object.fromEntries(Object.keys(after).map(key=>[key,Number(after[key]||0)-Number(before[key]??after[key]??0)]).filter(([,change])=>change!==0));
  }

  function recordAttributeDevelopment(player,before,details={}) {
    const season=Number(details.season??state?.season??2026),reason=details.reason||"赛季发展",current=attributeChanges(before,playerAttributeSnapshot(player)),previous=player.lastAttributeDevelopment,accumulate=details.accumulate&&previous?.season===season&&previous?.reason===reason,changes=accumulate?{...(previous.changes||{})}:{...current};
    if(accumulate)Object.entries(current).forEach(([key,change])=>{const total=Number(changes[key]||0)+change;if(total)changes[key]=total;else delete changes[key];});
    player.lastAttributeDevelopment={season,reason,overallChange:Number(details.overallChange||0)+(accumulate?Number(previous.overallChange||0):0),changes};return player.lastAttributeDevelopment;
  }

  const DEVELOPMENT_ATTRIBUTE_PRIORITIES={
    GK:["physical","passing","pace"],CB:["defending","physical","passing"],RB:["pace","defending","physical"],LB:["pace","defending","physical"],
    RWB:["pace","physical","passing"],LWB:["pace","physical","passing"],DM:["defending","passing","physical"],CM:["passing","physical","dribbling"],
    RM:["passing","pace","physical"],LM:["passing","pace","physical"],AM:["passing","dribbling","shooting"],RW:["pace","dribbling","shooting"],LW:["pace","dribbling","shooting"],
    ST:["shooting","physical","pace"],CF:["shooting","passing","dribbling"]
  };
  function inSeasonGrowthCap(player) {return player.age<=19?4:player.age<=21?3:player.age<=24?2:player.age<=30?1:0;}
  function adjustPlayerCoreAttributes(player,change,development=ensurePlayerDevelopment(player)) {
    if(!change)return;
    const focused=Object.entries(development.attributeFocus||{}).sort((a,b)=>b[1]-a[1]).map(([key])=>key),priorities=DEVELOPMENT_ATTRIBUTE_PRIORITIES[player.position]||DEVELOPMENT_ATTRIBUTE_PRIORITIES.CM,keys=[...new Set([...focused,...priorities])].filter(key=>Number.isFinite(Number(player[key]))&&Number(player[key])>0);if(!keys.length)return;
    for(let point=0;point<Math.abs(change);point++)for(let index=0;index<Math.min(2,keys.length);index++){const key=keys[(point*2+index)%keys.length];player[key]=clamp(Number(player[key])+(change>0?1:-1),1,99);}
  }
  function applyInSeasonPlayerGrowth(player,save=state,date=save?.date) {
    const development=ensurePlayerDevelopment(player,save?.season||state.season),gap=Math.max(0,Number(player.potential||player.overall)-Number(player.overall||0)),remainingCap=Math.max(0,inSeasonGrowthCap(player)-Number(development.inSeasonGrowth||0)),growth=Math.min(Math.floor(Number(development.inSeasonProgress||0)),gap,remainingCap);if(growth<=0)return null;
    const before=playerAttributeSnapshot(player),previousOverall=Number(player.overall||65);player.overall=clamp(previousOverall+growth,40,99);adjustPlayerCoreAttributes(player,growth,development);development.inSeasonProgress=Number(Math.max(0,Number(development.inSeasonProgress||0)-growth).toFixed(4));development.inSeasonGrowth=Number(development.inSeasonGrowth||0)+growth;development.lastGrowthDate=date;
    const record=recordAttributeDevelopment(player,before,{season:save.season,reason:"赛季中成长",overallChange:growth,accumulate:true});
    if(save===state&&save.role==="player"&&player.id===save.controlledId){state.reputation=clamp(Math.max(Number(state.reputation||0),player.overall),1,99);addNotification({title:`球员发展：${player.name} 当前能力提升至 ${player.overall}`,type:"general",date:date||save.date,detail:"训练质量、比赛时间和场上表现共同推动了本次赛季中成长，提升已经即时反映到当前能力与细项属性。",facts:[`当前能力：${previousOverall} → ${player.overall}`,`本赛季中已提升：${development.inSeasonGrowth} 点`,`细项属性变化：${Object.keys(record.changes||{}).length} 项`]});}
    return {player,growth,previousOverall,record};
  }
  function addMatchDevelopmentProgress(player,rating,minutes,save=state) {
    const development=ensurePlayerDevelopment(player,save.season),performance=rating>=8?.09:rating>=7.4?.055:rating>=6.9?.03:rating>=6.4?.012:0,minutesFactor=clamp(Number(minutes||0)/90,.2,1);development.inSeasonProgress=Number((Number(development.inSeasonProgress||0)+performance*minutesFactor).toFixed(4));return applyInSeasonPlayerGrowth(player,save,save.date);
  }
  function advanceInSeasonDevelopment(save=state,date=save.date) {
    const results=[];(save.squad||[]).forEach(player=>{const development=ensurePlayerDevelopment(player,save.season);if(development.lastProgressDate===date)return;development.lastProgressDate=date;const gap=Math.max(0,Number(player.potential||player.overall)-Number(player.overall||0));if(!gap||!inSeasonGrowthCap(player))return;const ageRate=player.age<=19?.0052:player.age<=21?.0043:player.age<=24?.0033:player.age<=27?.0022:player.age<=30?.0012:0,average=averageRating(player),performance=average?clamp(.82+(average-6.4)*.22,.72,1.24):.88,morale=clamp(.82+Number(player.morale||75)/420,.88,1.08),availability=player.injured?.25:1,trainingMode=save.role==="player"&&player.id===save.controlledId?(PLAYER_WEEKLY_PLANS[save.playerCareer?.weeklyPlan]?.training||"balanced"):save.training,trainingFactor=trainingMode==="intense"?1.16:trainingMode==="recovery"?.82:1,potentialFactor=1+Math.min(10,gap)*.035;development.inSeasonProgress=Number((Number(development.inSeasonProgress||0)+ageRate*performance*morale*availability*trainingFactor*potentialFactor).toFixed(4));const result=applyInSeasonPlayerGrowth(player,save,date);if(result)results.push(result);});return results;
  }

  function playerTraits(player) {
    const pools={
      GK:["喜欢手抛球发动反击","倾向短传出球","出击控制传中","指挥防线站位","一对一保持站立"],
      CB:["从后场组织进攻","贴身盯防对手","倒地铲球较少","长传转移","定位球前插争顶"],
      RB:["沿右路套上","提前传中","内收参与组织","积极回追","尝试抢断"],LB:["沿左路套上","提前传中","内收参与组织","积极回追","尝试抢断"],
      RWB:["全程保持边路宽度","频繁下底传中","前插进入进攻三区","高强度往返","丢球后立即回追"],LWB:["全程保持边路宽度","频繁下底传中","前插进入进攻三区","高强度往返","丢球后立即回追"],
      DM:["回撤接球","控制比赛节奏","简单短传","保护防线身前","尝试长距离转移"],
      CM:["控制比赛节奏","前插进入禁区","尝试直塞球","大范围转移","积极压迫"],
      RM:["右路接应串联","提前传中","协助边后卫防守","斜向前插","大范围转移"],LM:["左路接应串联","提前传中","协助边后卫防守","斜向前插","大范围转移"],
      AM:["在空当接球","尝试直塞球","带球突破","禁区外射门","与队友撞墙配合"],
      RW:["从右路内切","带球突破","利用速度过人","尝试倒三角传球","攻击后点"],LW:["从左路内切","带球突破","利用速度过人","尝试倒三角传球","攻击后点"],
      ST:["反越位前插","背身拿球","第一时间射门","攻击近门柱","牵制中后卫"],
      CF:["回撤到中场接球","游弋于防线之间","与中锋撞墙配合","后插上进入禁区","尝试直塞球"]
    };
    const pool=pools[player.position]||pools.CM,start=Math.floor(stableScoutingUnit(`${player.id||player.name}|traits`)*pool.length);
    return [pool[start],pool[(start+2)%pool.length],pool[(start+4)%pool.length]];
  }

  function playerDevelopmentScore(player) {
    const avg=averageRating(player)||6,appearances=Number(player.appearances||0),minutes=Number(player.development?.minutes||appearances*75),injuryDays=Number(player.development?.injuryDays||0),trainingScore=Number(player.development?.trainingScore||0),gap=Math.max(0,Number(player.potential||player.overall)-Number(player.overall||0));
    const ageBase=player.age<=19?.78:player.age<=21?.62:player.age<=23?.42:player.age<=26?.18:player.age<=29?.04:player.age<=31?-.18:player.age<=33?-.48:-.82;
    const performance=clamp((avg-6.45)*.5,-.35,.55),playingTime=minutes>=2400?.25:minutes>=1200?.12:minutes<350?-.14:0,potential=Math.min(.35,gap*.035),training=clamp(trainingScore/80,0,.32),injury=Math.min(.6,injuryDays/150);
    return ageBase+performance+playingTime+potential+training-injury;
  }

  function annualPlayerGrowthTarget(player,score=playerDevelopmentScore(player)) {
    let target=score>=1.85?4:score>=1.45?3:score>=.75?2:score>=.4?1:score<=-1.1?-2:score<=-.35?-1:0;if(target<=0||player.age>23)return target;
    const development=ensurePlayerDevelopment(player,state?.season||2026),initialGap=Math.max(0,Number(player.potential||player.overall)-Number(development.startOverall||player.overall)),minutes=Number(development.minutes||0),average=averageRating(player)||0,highPotential=initialGap>=9||(Number(player.potential||0)>=90&&initialGap>=6),mainstayMinutes=minutes>=2400,elitePerformance=average>=7.65,bonuses=[highPotential,mainstayMinutes,elitePerformance].filter(Boolean).length,ageCap=player.age<=19?7:player.age<=21?6:5;
    if(target>=3&&bonuses)target=Math.min(ageCap,target+bonuses);
    return Math.min(target,initialGap);
  }

  function developmentOutlook(player) {
    const score=playerDevelopmentScore(player),gap=Math.max(0,player.potential-player.overall);
    if(!gap&&player.age<=27&&score>=.75)return ["等待潜力重估","高质量出场和持续成长仍可能重新打开能力上限"];
    if(!gap&&player.age<30)return ["接近当前能力上限","突破表现仍可能在赛季结算时上调潜力"];
    if(score>=1.45)return ["突破赛季","训练与高评分比赛会在赛季中推动成长，全年可能提升 3–4 点"];
    if(score>=.75)return ["明显上升","稳定出场和良好评分可在赛季中提升 1–2 点"];
    if(score>=.25)return ["稳步发展","训练积累达到阈值后会即时提升能力"];
    if(score<=-.65)return ["下降风险","年龄、伤病或出场不足可能导致能力下降"];
    return ["保持稳定","当前发展趋势不会带来快速变化"];
  }

  function renderPlayerProfileModal(player) {
    const p=playerProfileData(player),groups=playerAttributeGroups(p),traits=playerTraits(p),[outlook,outlookText]=developmentOutlook(p),currentAverage=p.appearances?(averageRating(p)||6).toFixed(2):"—",attributeDevelopment=p.lastAttributeDevelopment,attributeChangeCount=Object.keys(attributeDevelopment?.changes||{}).length,attributeChangeLabel=attributeChangeCount?`${attributeDevelopment.reason} · ${attributeDevelopment.season}/${String(attributeDevelopment.season+1).slice(2)}`:"1–99",seasonValueChange=Number((Number(p.value||0)-Number(p.marketValueState?.seasonStartValue??p.value??0)).toFixed(2)),potentialChange=p.lastPotentialChange;
    const career=[...(p.careerStats||[])],transfers=[...(p.transferHistory||[])].sort((a,b)=>b.date.localeCompare(a.date)),latest=p.latestTransfer,contractEnd=p.contractEnd||state.season+2+Math.floor(stableScoutingUnit(`${p.id||p.name}|contract`)*3);
    return `<div class="modal-backdrop"><div class="modal player-profile-modal" role="dialog" aria-modal="true" aria-labelledby="player-profile-title"><div class="modal-header player-profile-header"><div class="player-profile-avatar">${initials(p.name)}</div><div><span>${clubNameLink(p.clubName)}</span><h2 id="player-profile-title">${esc(p.name)}</h2><p>${playerRoleLabel(p.position)} · ${p.age} 岁 · ${esc(p.nationality||"国籍未知")}</p></div><button class="btn btn-icon btn-ghost" data-close-modal aria-label="关闭">${icon("x")}</button></div><div class="modal-body player-profile-body">
      <section class="player-profile-summary"><div><label>当前能力</label><strong>${p.overall}</strong></div><div><label>动态潜力</label><strong>${p.potential}</strong>${potentialChange?.change?`<small class="potential-change ${potentialChange.change>0?"up":"down"}" title="${esc(potentialChange.reason)}">${potentialChange.season}/${String(potentialChange.season+1).slice(2)} ${potentialChange.change>0?"↑":"↓"}${Math.abs(potentialChange.change)}</small>`:`<small class="potential-change">持续评估</small>`}</div><div><label>身价 · 季度更新</label><strong>${money(p.value||0)}</strong><small class="market-value-change ${seasonValueChange>0?"up":seasonValueChange<0?"down":""}">本季 ${seasonValueChange>0?"↑":seasonValueChange<0?"↓":"持平"}${seasonValueChange?` ${money(Math.abs(seasonValueChange))}`:""}</small></div><div><label>合同</label><strong>${contractEnd} 年</strong></div><div><label>体能</label><strong>${Math.round(p.fitness??100)}%</strong></div><div><label>士气</label><strong>${Math.round(p.morale??75)}%</strong></div></section>
      <section class="player-profile-grid"><div class="player-profile-section"><div class="player-profile-section-head"><h3>当前合同</h3><span>${esc(p.contract?.role||"轮换球员")}</span></div><div class="profile-stat-list"><div><span>所属俱乐部</span><strong>${clubNameLink(p.clubName)}</strong></div><div><span>合同到期</span><strong>${contractEnd} 年</strong></div><div><span>周薪</span><strong>€${Math.round(Number(p.contract?.weeklyWage||p.wage||0))}K</strong></div><div><span>出场津贴</span><strong>€${Math.round(Number(p.contract?.appearanceFee||0))}K</strong></div><div><span>解约金</span><strong>${money(p.contract?.releaseClause||0)}</strong></div><div><span>队内角色</span><strong>${esc(p.contract?.role||"轮换球员")}</strong></div></div></div><div class="player-profile-section"><div class="player-profile-section-head"><h3>加盟信息</h3><span>${latest?formatDate(latest.date,false):"青训或原有球员"}</span></div><div class="profile-stat-list"><div><span>当前球队</span><strong>${clubNameLink(p.clubName)}</strong></div><div><span>加盟日期</span><strong>${latest?formatDate(latest.date):"赛季开始前"}</strong></div><div><span>来自</span><strong>${latest?clubNameLink(clubById(latest.fromId).name):"原有阵容"}</strong></div><div><span>转会费</span><strong>${latest?money(latest.fee):"—"}</strong></div><div><span>交易方式</span><strong>${latest?.clauses?"协商转会":"永久转会"}</strong></div><div><span>生涯转会</span><strong>${transfers.length} 次</strong></div></div></div></section>
      <section class="player-profile-section"><div class="player-profile-section-head"><h3>细分属性</h3><span>${esc(attributeChangeLabel)}</span></div><div class="detailed-attributes">${groups.map(([title,attrs])=>`<div class="attribute-column"><h4>${title}</h4>${attrs.map(([label,key,modifier,sourceKey])=>{const value=profileAttribute(p,key,modifier,sourceKey),change=Number(attributeDevelopment?.changes?.[key]||0);return `<div><span>${label}</span><span class="attribute-reading"><strong class="${value>=85?"elite":value<60?"weak":""}">${value}</strong>${change?`<small class="attribute-change ${change>0?"up":"down"}" title="${esc(`${attributeDevelopment.reason}：${change>0?"提升":"下降"} ${Math.abs(change)} 点`)}">${change>0?"+":""}${change}</small>`:""}</span></div>`;}).join("")}</div>`).join("")}</div></section>
      <section class="player-profile-grid"><div class="player-profile-section"><div class="player-profile-section-head"><h3>本赛季数据</h3><span>${state.season}/${String(state.season+1).slice(2)}</span></div><div class="profile-stat-list"><div><span>出场</span><strong>${p.appearances||0}</strong></div><div><span>进球</span><strong>${p.goals||0}</strong></div><div><span>助攻</span><strong>${p.assists||0}</strong></div><div><span>场均评分</span><strong>${currentAverage}</strong></div><div><span>国家队</span><strong>${p.internationalAppearances||0} 场</strong></div><div><span>国家队进球/助攻</span><strong>${p.internationalGoals||0} / ${p.internationalAssists||0}</strong></div></div></div><div class="player-profile-section"><div class="player-profile-section-head"><h3>发展趋势</h3><span>${outlook}</span></div><div class="development-outlook"><strong>${outlook}</strong><p>${outlookText}。训练与比赛积累达到阈值后会在赛季中即时成长，季度身价评估会同步反映变化。</p><div class="meter"><span style="width:${clamp(50+playerDevelopmentScore(p)*35,8,92)}%"></span></div></div></div></section>
      <section class="player-profile-section"><div class="player-profile-section-head"><h3>踢球习惯</h3><span>${traits.length} 项</span></div><div class="player-traits">${traits.map(trait=>`<span>${icon("sparkles")}${esc(trait)}</span>`).join("")}</div></section>
      ${transfers.length?`<section class="player-profile-section"><div class="player-profile-section-head"><h3>转会履历</h3><span>${transfers.length} 笔正式转会</span></div><div class="table-wrap"><table class="player-career-table"><thead><tr><th>日期</th><th>转出球队</th><th>转入球队</th><th class="num">转会费</th><th>原因</th></tr></thead><tbody>${transfers.map(record=>`<tr><td>${formatDate(record.date)}</td><td>${clubNameLink(clubById(record.fromId).name)}</td><td>${clubNameLink(clubById(record.toId).name)}</td><td class="num">${money(record.fee)}</td><td>${esc(record.reason||"阵容规划")}</td></tr>`).join("")}</tbody></table></div></section>`:""}
      <section class="player-profile-section"><div class="player-profile-section-head"><h3>生涯数据</h3><span>${career.length+1} 个俱乐部阶段</span></div><div class="table-wrap"><table class="player-career-table"><thead><tr><th>赛季</th><th>俱乐部</th><th class="num">出场</th><th class="num">进球</th><th class="num">助攻</th><th class="num">评分</th><th class="num">阶段</th></tr></thead><tbody><tr class="current-season-row"><td>${state.season}/${String(state.season+1).slice(2)}</td><td>${clubNameLink(p.clubName)}</td><td class="num">${p.appearances||0}</td><td class="num">${p.goals||0}</td><td class="num">${p.assists||0}</td><td class="num">${currentAverage}</td><td class="num">${latest?`${formatDate(latest.date,false)} 起`:"进行中"}</td></tr>${career.map(row=>`<tr><td>${row.season}/${String(Number(row.season||state.season)+1).slice(2)}</td><td>${clubNameLink(row.club||p.clubName)}</td><td class="num">${row.dataUnavailable?"—":row.appearances||0}</td><td class="num">${row.dataUnavailable?"—":row.goals||0}</td><td class="num">${row.dataUnavailable?"—":row.assists||0}</td><td class="num">${row.dataUnavailable?"—":row.appearances?Number(row.average||0).toFixed(2):"—"}</td><td class="num">${row.dataUnavailable?"历史版本未记录":row.partialSeason&&row.endDate?`至 ${formatDate(row.endDate,false)}`:row.change===undefined?"已记录":`${row.change>0?"+":""}${row.change||0}`}</td></tr>`).join("")}</tbody></table></div></section>
    </div></div></div>`;
  }

  function renderClubProfileModal(value) {
    const data=clubProfileData(value),club=data.club,league=data.league,roster=[...(data.roster||[])].sort((a,b)=>positionSortRank(a.position)-positionSortRank(b.position)||Number(b.overall||0)-Number(a.overall||0));
    if(!club)return "";
    const standing=state.majorLeagueWorld?.leagues?.[club.league]?.clubs?.find(item=>item.id===club.id),table=state.majorLeagueWorld?.leagues?.[club.league]?majorStandings(state.majorLeagueWorld.leagues[club.league]):[],rank=table.findIndex(item=>item.id===club.id)+1,honors=clubHonors(club);
    const average=roster.length?Math.round(roster.reduce((sum,p)=>sum+Number(p.overall||0),0)/roster.length):0,totalValue=roster.reduce((sum,p)=>sum+currentPlayerMarketValue(p,state),0);
    return `<div class="modal-backdrop"><div class="modal club-profile-modal" role="dialog" aria-modal="true" aria-labelledby="club-profile-title"><div class="modal-header club-profile-header"><div class="club-profile-badge">${clubBadge(club,"club-badge-profile-modal")}</div><div><span>${esc(league?.short||"俱乐部")}${league?.country?` · ${esc(league.country)}`:""}</span><h2 id="club-profile-title">${esc(club.name)}</h2><p>${esc(club.city||"城市资料待更新")} · ${esc(club.stadium||"主场资料待更新")} · 主教练 ${esc(club.coach||"资料待更新")}</p></div><button class="btn btn-icon btn-ghost" data-close-modal aria-label="关闭">${icon("x")}</button></div><div class="modal-body club-profile-body">
      <section class="club-profile-summary"><div><label>俱乐部声望</label><strong>${club.prestige||"—"}</strong></div><div><label>阵容人数</label><strong>${roster.length}</strong></div><div><label>平均能力</label><strong>${average||"—"}</strong></div><div><label>阵容总身价</label><strong>${money(totalValue)}</strong></div><div><label>当前排名</label><strong>${rank||"—"}${rank?` / ${table.length}`:""}</strong></div><div><label>本赛季积分</label><strong>${standing?.pts??"—"}</strong></div></section>
      <section class="club-profile-section"><div class="club-profile-section-head"><h3>一线队阵容</h3><span>按位置排序 · ${roster.length} 人 · 本赛季模拟数据</span></div><div class="table-wrap"><table class="club-roster-table"><thead><tr><th>球员</th><th>位置</th><th class="num">年龄</th><th class="num">能力 / 潜力</th><th class="num">出场</th><th class="num">进球 / 助攻</th><th class="num">评分</th><th class="num">身价</th></tr></thead><tbody>${roster.map(player=>`<tr><td class="player-name"><strong>${playerNameLink(player,{clubName:club.name})}</strong><span>${player.nationality?esc(player.nationality):"球员"}</span></td><td><span class="tag">${playerRoleLabel(player.position)}</span></td><td class="num">${player.age||"—"}</td><td class="num"><span class="rating">${player.overall||"—"}</span> / ${player.potential||player.overall||"—"}</td><td class="num">${player.appearances||0}</td><td class="num">${player.goals||0} / ${player.assists||0}</td><td class="num">${player.appearances?averageRating(player).toFixed(2):"—"}</td><td class="num">${money(currentPlayerMarketValue(player,state))}</td></tr>`).join("")||`<tr><td colspan="8"><div class="empty compact">暂无可用阵容数据</div></td></tr>`}</tbody></table></div></section>
      <section class="club-profile-grid"><div class="club-profile-section"><div class="club-profile-section-head"><h3>俱乐部荣誉</h3><span>历史资料与存档实绩</span></div><div class="club-honors">${honors.map(item=>`<div class="club-honor"><img src="assets/trophies/${item.asset||"league.png"}" alt=""><div><strong>${esc(item.name)}</strong><span>${item.count} 次${item.seasons?.length?` · 存档：${item.seasons.map(season=>`${season}/${String(season+1).slice(2)}`).join("、")}`:` · ${item.source||"历史资料"}`}</span></div></div>`).join("")||`<p class="report-copy">暂无已记录荣誉。</p>`}</div></div><div class="club-profile-section"><div class="club-profile-section-head"><h3>近期状态</h3><span>${standing?`${standing.w}胜 ${standing.d}平 ${standing.l}负`:"当前赛季"}</span></div><div class="club-form-row"><div><label>战绩</label><strong>${standing?`${standing.w}-${standing.d}-${standing.l}`:"—"}</strong></div><div><label>进失球</label><strong>${standing?`${standing.gf} / ${standing.ga}`:"—"}</strong></div><div><label>近况</label><strong>${standing?.form?.length?standing.form.map(item=>`<i class="form-dot ${item}"></i>`).join(""):"—"}</strong></div></div></div></section>
    </div></div></div>`;
  }

  const CONVERSATION_CONTACTS={
    coach:{label:"主教练",icon:"clipboard-list",relation:"coach"},teammate:{label:"队友",icon:"users-round",relation:"teammates"},captain:{label:"队长",icon:"shield-check",relation:"captain"},family:{label:"亲朋好友",icon:"heart",relation:"family"},media:{label:"媒体",icon:"mic-2",relation:"media"},agent:{label:"经纪人",icon:"briefcase",relation:"agent"}
  };

  function playerConversationContext() {
    const player=controlledPlayer(),career=ensurePlayerCareer(),fixture=nextFixture(),played=[...(state.schedule||[])].filter(item=>item.status==="played").sort((a,b)=>b.date.localeCompare(a.date))[0],league=leagueOf(clubById(state.clubId)),leagueRemaining=Math.max(0,Number(league?.matches||38)-Number(state.played||0));
    const titleRace=state.leaguePosition===1?"球队目前领跑联赛":state.leaguePosition<=4&&leagueRemaining<=12?`球队排名第 ${state.leaguePosition}，仍在争冠集团`:state.leaguePosition<=6?`球队排名第 ${state.leaguePosition}，正在争夺欧战席位`:state.leaguePosition>=15?`球队排名第 ${state.leaguePosition}，积分压力正在上升`:`球队目前排名第 ${state.leaguePosition}`;
    const decisive=fixture&&(/决赛|半决赛|淘汰|附加赛|八强|十六强/.test(`${fixture.round||""}${fixture.phase||""}`)||leagueRemaining<=5),matchImportance=decisive?"决定赛季走向的关键比赛":fixture?.competition!==league?.short?`${fixture.competition}的重要比赛`:"下一轮联赛",form=player.lastRating?`上一场评分 ${Number(player.lastRating).toFixed(2)}`:played?`上一场${played.score?`比分 ${played.score.home}-${played.score.away}`:"已经结束"}`:"赛季刚刚开始";
    const titleChance=clamp(Math.round(78-(Math.max(1,state.leaguePosition)-1)*11+(leagueRemaining>20?-18:leagueRemaining<8?8:0)),2,88),competitionSituation=fixture&&fixture.competition!==league?.short?`${fixture.competition} ${fixture.round||fixture.stageName||"当前阶段"}${fixture.phase==="knockout"?"，球队正在争取晋级":""}`:`联赛剩余约 ${leagueRemaining} 轮`;
    return {fixture,played,titleRace,titleChance,competitionSituation,matchImportance,form,fitness:Math.round(player.fitness||0),morale:Math.round(player.morale||0),trust:Math.round(career.trust),confidence:Math.round(career.confidence),pressure:Math.round(career.pressure),selection:career.status,decisive};
  }

  function conversationPerson(contact) {
    const club=clubById(state.clubId),player=controlledPlayer(),others=state.squad.filter(item=>item.id!==player.id&&!item.injured);
    if(contact==="coach")return club.coach||"主教练";
    if(contact==="teammate")return [...others].sort((a,b)=>(positionUnit(b.position)===positionUnit(player.position)?1:0)-(positionUnit(a.position)===positionUnit(player.position)?1:0)||b.overall-a.overall)[0]?.name||"队友";
    if(contact==="captain")return [...others].sort((a,b)=>(b.age+b.overall/10)-(a.age+a.overall/10))[0]?.name||"球队队长";
    if(contact==="family")return "你最信任的家人";if(contact==="media")return "赛前记者";return "你的经纪人";
  }

  function conversationOpening(contact,ctx) {
    const opponent=ctx.fixture?.opponent||"下一个对手",lines={coach:[`我刚看完训练录像。${ctx.titleRace}，模型给出的联赛夺冠可能约 ${ctx.titleChance}%。对 ${opponent} 这场我需要知道你准备怎样执行。`,`我们单独谈谈。${ctx.form}，${ctx.competitionSituation}，你的选择会影响我对你的使用。`],teammate:[`下一场对 ${opponent}，我们在你这一侧的配合还可以更快。你希望我怎样接应？`,`最近更衣室都在谈${ctx.competitionSituation}。场上如果局面僵住，我们得先统一想法。`],captain:[`${ctx.titleRace}，夺冠可能约 ${ctx.titleChance}%。这种阶段每个人的情绪都会被放大。你现在最需要解决什么？`,`你目前在队里的位置是“${ctx.selection}”。${ctx.competitionSituation}，我可以给建议，但你得告诉我真实想法。`],family:[`${ctx.form}。先别管外面的声音，你自己现在感觉怎么样？`,`我知道${ctx.matchImportance}快到了。你的体能是 ${ctx.fitness}%，别把所有压力都一个人扛着。`],media:[`${ctx.titleRace}，当前夺冠可能约 ${ctx.titleChance}%。你如何看待下一场对 ${opponent}，以及自己最近的表现？`,`外界很关注你在${ctx.matchImportance}中的角色。${ctx.competitionSituation}，你愿意怎样回应质疑？`],agent:[`${ctx.form}，教练信任是 ${ctx.trust}%。我们需要谈谈你接下来几个月的职业策略。`,`合同和出场顺位都在变化。${ctx.competitionSituation}，现在每一次公开表态都会影响谈判位置。`]}[contact];
    return lines[Math.floor(stableScoutingUnit(`${state.date}|${contact}|${state.played}`)*lines.length)];
  }

  function conversationChoices(contact,stage) {
    if(stage===0)return ({coach:[{id:"tactics",label:"请他讲清战术职责",text:"我想更准确地理解自己的跑位和无球职责。",effects:{tactical:4,trust:2,"relationship:coach":3}},{id:"minutes",label:"坦率讨论出场机会",text:"我想知道自己距离稳定首发还差什么。",effects:{confidence:2,trust:-1,"relationship:coach":1}},{id:"workload",label:"协商比赛负荷",text:"赛程很密，我希望一起决定该在哪场全力投入。",effects:{professionalism:2,trust:2,"relationship:coach":2}}],teammate:[{id:"patterns",label:"约定场上配合",text:"我们把套边、回做和前插的信号统一一下。",effects:{chemistry:5,"relationship:teammates":4,tactical:1}},{id:"support",label:"聊聊彼此的压力",text:"最近大家压力都不小，我想听听你的真实感受。",effects:{pressure:-3,confidence:2,"relationship:teammates":5}},{id:"challenge",label:"要求提高训练强度",text:"我们得在对抗训练里把比赛强度先做出来。",effects:{confidence:3,professionalism:1,"relationship:teammates":-1}}],captain:[{id:"advice",label:"请教关键比赛经验",text:"这种关键阶段，你会怎样控制情绪和节奏？",effects:{pressure:-4,tactical:2,"relationship:captain":4}},{id:"room",label:"了解更衣室气氛",text:"队里最近真正担心的是什么？",effects:{chemistry:3,"relationship:captain":3,"relationship:teammates":2}},{id:"lead",label:"主动承担责任",text:"我愿意在场上和更衣室承担更多责任。",effects:{trust:2,professionalism:3,"relationship:captain":3}}],family:[{id:"honest",label:"说出真实压力",text:"我最近一直担心位置和表现，确实有点喘不过气。",effects:{pressure:-7,confidence:3,"relationship:family":4}},{id:"balance",label:"讨论生活与比赛平衡",text:"我不想让足球吞掉全部生活，需要重新找回节奏。",effects:{pressure:-5,professionalism:1,"relationship:family":3}},{id:"future",label:"谈谈职业未来",text:"我在想，留队竞争是否仍是最适合我的路。",effects:{confidence:1,"relationship:family":3,"relationship:agent":1}}],media:[{id:"teamfirst",label:"把球队放在首位",text:"个人数据不是重点，我们只关心球队目标。",effects:{trust:2,professionalism:2,"relationship:media":2,"relationship:fans":2}},{id:"accountable",label:"正面承担责任",text:"我的表现还能更好，结果不好时我不会回避责任。",effects:{pressure:2,trust:2,"relationship:media":4,"relationship:fans":3}},{id:"bold",label:"表达取胜信心",text:"我们有能力赢下这场，我也准备好承担关键角色。",effects:{confidence:4,pressure:3,"relationship:media":2}}],agent:[{id:"contract",label:"评估续约条件",text:"请你了解俱乐部对续约和队内角色的真实态度。",effects:{"relationship:agent":3}},{id:"market",label:"调查市场兴趣",text:"先低调了解市场，不要影响我在队内的位置。",effects:{"relationship:agent":4,trust:-1}},{id:"focus",label:"暂缓场外动作",text:"目前先专注比赛，等表现更稳定再谈未来。",effects:{professionalism:3,pressure:-2,"relationship:agent":1}}]})[contact]||[];
    return [{id:"listen",label:"接受建议并确认行动",text:"我明白了，我会把这件事落实到训练和比赛里。",effects:{professionalism:2}},{id:"clarify",label:"追问具体执行细节",text:"能再具体一点吗？我希望知道下一步该怎么做。",effects:{tactical:2,chemistry:1}},{id:"assert",label:"坚持自己的判断",text:"我理解你的看法，但最终我想按自己的方式承担结果。",effects:{confidence:3,pressure:1,professionalism:-1}}];
  }

  function conversationReply(contact,stage,ctx) {
    if(stage===0){const situation=ctx.decisive?"这正是关键阶段，下一场会放大这个决定。":"赛季还长，但习惯会从现在开始形成。";return ({coach:`我会把要求说得更直接：先完成整体职责，再争取个人发挥。${situation}`,teammate:`好，比赛里我会留意你的第一步移动。我们需要互相补位，而不是各踢各的。${situation}`,captain:`你愿意把话说开是好事。压力不会消失，但可以变成更清楚的行动。${situation}`,family:"你不需要在每一天证明全部价值。把能控制的事情做好，其他声音先放在外面。",media:`这句话会被完整写进赛前报道。${ctx.titleRace}，公众会用下一场表现检验你的回答。`,agent:"我会按你的意思处理，但不会越过你和俱乐部公开交锋。当前的出场和表现仍是最重要的筹码。"})[contact];}
    return ({coach:"很好。训练场上我会观察你的执行，比赛名单不会只看名气。",teammate:"说定了。上场后用第一次配合建立节奏，我会主动给你信号。",captain:"保持这个态度。局面困难时先做正确的下一件事。",family:"比赛结束后也记得联系我，无论结果如何，生活不会只剩一个评分。",media:"谢谢你的回答。报道会同时呈现球队处境和你的态度。",agent:"我会记录这次决定，并在合适时机向你反馈，不让场外事务干扰比赛。"})[contact];
  }

  function startConversation(contact) {
    const career=ensurePlayerCareer(),definition=CONVERSATION_CONTACTS[contact];if(!career||!definition)return;const last=career.lastInteractions[`conversation:${contact}`];if(last&&daysBetween(last,state.date)<3){toast("你们刚刚谈过，先让局势发展几天");return;}
    const context=playerConversationContext(),person=conversationPerson(contact);conversationSession={id:`talk-${Date.now()}`,contact,person,stage:0,context,choices:[],effects:{},transcript:[{speaker:person,side:"npc",text:conversationOpening(contact,context)}]};modal={type:"conversation"};render();
  }

  function chooseConversation(choiceId) {
    const session=conversationSession,career=ensurePlayerCareer();if(!session||!career)return;const choice=conversationChoices(session.contact,session.stage).find(item=>item.id===choiceId);if(!choice)return;
    session.choices.push(choice.id);session.transcript.push({speaker:state.person,side:"player",text:choice.text});Object.entries(choice.effects||{}).forEach(([key,value])=>session.effects[key]=Number(session.effects[key]||0)+Number(value||0));session.transcript.push({speaker:session.person,side:"npc",text:conversationReply(session.contact,session.stage,session.context)});
    if(session.stage===0){session.stage=1;render();return;}changePlayerCareer(session.effects);const definition=CONVERSATION_CONTACTS[session.contact];career.lastInteractions[`conversation:${session.contact}`]=state.date;career.lastInteractionDate=state.date;career.conversationHistory.unshift({id:session.id,date:state.date,contact:session.contact,person:session.person,context:`${session.context.titleRace}；${session.context.matchImportance}；${session.context.form}`,choices:[...session.choices],effects:{...session.effects},transcript:session.transcript.map(item=>({...item}))});career.conversationHistory=career.conversationHistory.slice(0,40);career.interactionHistory.unshift({date:state.date,type:"conversation",title:`与${definition.label}完成了一次深入交流`});if(session.contact==="agent"&&session.choices[0]==="contract")queueCareerRequest("contract");if(session.contact==="agent"&&session.choices[0]==="market")queueCareerRequest("market");
    const lastRating=Number(controlledPlayer()?.lastRating||0),openingChoice=session.choices[0],conversationBoosts={tactics:{passing:2,defending:2},patterns:{passing:2,dribbling:2},advice:{physical:2,defending:1},honest:{passing:1,dribbling:1},balance:{passing:1,dribbling:1},accountable:{shooting:1,physical:1}}[openingChoice];if(lastRating&&lastRating<6.35&&conversationBoosts)grantPerformanceResponse("conversation",{boosts:conversationBoosts,matches:2,momentum:2.5,source:`与${definition.label}会谈`});
    conversationSession=null;modal=null;saveState();render();toast("这次谈话及其影响已记录到职业生涯");
  }

  function careerActionChoices(action) {
    return ({
      coach:[{id:"feedback",icon:"video",label:"要求具体反馈",detail:"请教教练自己在录像和训练中最需要改进的内容"},{id:"chance",icon:"shirt",label:"表达首发意愿",detail:"明确要求更多机会，信任不足时可能适得其反"},{id:"role",icon:"clipboard-list",label:"讨论队内角色",detail:"了解当前顺位和教练对未来的计划"}],
      training:[{id:"technical",icon:"target",label:"专项技术加练",detail:"积累成长进度，短期消耗体能"},{id:"physical",icon:"activity",label:"身体对抗训练",detail:"提高比赛信心和训练评价"},{id:"recovery",icon:"battery-charging",label:"恢复与理疗",detail:"快速恢复体能，成长收益较低"}],
      teammates:[{id:"mentor",icon:"shield-check",label:"参加队长小组",detail:"改善队长、队友关系和职业形象"},{id:"social",icon:"coffee",label:"主动融入球队",detail:"明显改善更衣室关系和信心"},{id:"competition",icon:"flame",label:"提高对抗强度",detail:"展示竞争心，但可能让部分队友不满"}],
      support:[{id:"psychology",icon:"heart-pulse",label:"接受心理辅导",detail:"显著恢复比赛信心"},{id:"captain",icon:"message-circle",label:"找队长谈谈",detail:"得到更衣室支持和建议"},{id:"media",icon:"mic-2",label:"正面回应媒体",detail:"改善球迷与媒体态度，教练未必欢迎"}],
      agent:[{id:"contract",icon:"file-signature",label:"要求续约评估",detail:"俱乐部会根据表现、信任和合同期限回复"},{id:"loan",icon:"send",label:"申请外租",detail:"争取稳定出场，但可能降低当前教练信任"},{id:"market",icon:"radar",label:"调查市场兴趣",detail:"了解获得合适报价的现实概率"}]
    })[action]||[];
  }

  function renderPlayerCareerModal() {
    const career=ensurePlayerCareer();if(!career)return "";
    if(modal.type==="conversation"){
      const session=conversationSession;if(!session)return "";const definition=CONVERSATION_CONTACTS[session.contact],choices=conversationChoices(session.contact,session.stage);
      return `<div class="modal-backdrop"><div class="modal conversation-modal" role="dialog" aria-modal="true" aria-labelledby="conversation-title"><div class="modal-header conversation-header"><div class="conversation-avatar">${icon(definition.icon)}</div><div><span class="eyebrow">${definition.label} · ${esc(session.context.matchImportance)}</span><h2 id="conversation-title">与 ${esc(session.person)} 交谈</h2></div><button class="btn btn-icon btn-ghost" data-close-conversation aria-label="结束交谈">${icon("x")}</button></div><div class="conversation-context"><span>${esc(session.context.titleRace)} · 夺冠可能 ${session.context.titleChance}%</span><span>${esc(session.context.competitionSituation)}</span><span>${esc(session.context.form)}</span><span>体能 ${session.context.fitness}% · 压力 ${session.context.pressure}%</span></div><div class="conversation-transcript">${session.transcript.map(item=>`<article class="conversation-message ${item.side}"><small>${esc(item.speaker)}</small><p>${esc(item.text)}</p></article>`).join("")}</div><div class="conversation-choices"><span>${session.stage===0?"你准备怎么回应？":"把谈话落到具体行动"}</span>${choices.map(choice=>`<button data-conversation-choice="${choice.id}"><strong>${esc(choice.label)}</strong><small>${esc(choice.text)}</small></button>`).join("")}</div></div></div>`;
    }
    if(modal.type==="weeklyPlan")return `<div class="modal-backdrop"><div class="modal player-career-modal" role="dialog" aria-modal="true"><div class="modal-header"><div><span class="eyebrow">个人训练周期</span><h2>安排本周重点</h2></div><button class="btn btn-icon btn-ghost" data-close-modal aria-label="关闭">${icon("x")}</button></div><div class="modal-body"><div class="career-choice-grid">${Object.entries(PLAYER_WEEKLY_PLANS).map(([id,plan])=>`<button class="career-choice ${career.weeklyPlan===id?"active":""}" data-weekly-plan="${id}">${icon(plan.icon)}<span><strong>${plan.label}</strong><small>${plan.summary}</small></span>${career.weeklyPlan===id?`<b>${icon("check")}当前</b>`:""}</button>`).join("")}</div><div class="data-note">一周内反复更改计划会降低职业态度和教练信任。高强度训练能加快成长，但会影响体能恢复。</div></div></div></div>`;
    if(modal.type==="careerAction"){
      const titles={coach:"与主教练沟通",training:"安排个人训练",teammates:"经营更衣室关系",support:"处理场外状态",agent:"联系经纪人"};
      return `<div class="modal-backdrop"><div class="modal player-career-modal" role="dialog" aria-modal="true"><div class="modal-header"><div><span class="eyebrow">职业行动</span><h2>${titles[modal.action]}</h2></div><button class="btn btn-icon btn-ghost" data-close-modal aria-label="关闭">${icon("x")}</button></div><div class="modal-body"><div class="career-choice-grid compact">${careerActionChoices(modal.action).map(choice=>`<button class="career-choice" data-career-choice="${choice.id}">${icon(choice.icon)}<span><strong>${choice.label}</strong><small>${choice.detail}</small></span>${icon("chevron-right")}</button>`).join("")}</div></div></div></div>`;
    }
    if(modal.type==="playerIssue"){
      const issue=career.pendingIssues.find(item=>item.id===modal.id);if(!issue)return "";
      const choices=[{id:"review",icon:"video",label:"复盘比赛录像",detail:"未来 3 场传球 +3、防守 +2，并提升战术理解"},{id:"extra",icon:"dumbbell",label:"立即专项加练",detail:"未来 3 场位置核心属性 +4、身体 +2，但消耗体能"},{id:"coach",icon:"messages-square",label:"主动找教练沟通",detail:"未来 3 场传球、防守各 +2，并获得明确职责"},{id:"support",icon:"heart-pulse",label:"接受心理支持",detail:"未来 3 场传球、盘带、射门各 +2，优先恢复稳定性"},{id:"media",icon:"mic-2",label:"公开承担责任",detail:"未来 3 场射门 +2、身体 +1，舆论压力风险更高"}];
      return `<div class="modal-backdrop"><div class="modal player-career-modal" role="dialog" aria-modal="true"><div class="modal-header"><div><span class="eyebrow">表现恢复计划</span><h2>${esc(issue.title)}</h2></div><button class="btn btn-icon btn-ghost" data-close-modal aria-label="关闭">${icon("x")}</button></div><div class="modal-body"><p class="career-modal-lead">${esc(issue.detail)}</p><div class="career-choice-grid compact">${choices.map(choice=>`<button class="career-choice" data-issue-choice="${choice.id}">${icon(choice.icon)}<span><strong>${choice.label}</strong><small>${choice.detail}</small></span>${icon("chevron-right")}</button>`).join("")}</div></div></div></div>`;
    }
    if(modal.type==="playerStory"){
      const story=career.story;if(!story)return "";
      return `<div class="modal-backdrop"><div class="modal player-career-modal" role="dialog" aria-modal="true"><div class="modal-header"><div><span class="eyebrow">${story.type==="state-boost"?"临时状态事件":`连续职业事件 · 第 ${story.stage} 阶段`}</span><h2>${esc(story.title)}</h2></div><button class="btn btn-icon btn-ghost" data-close-modal aria-label="关闭">${icon("x")}</button></div><div class="modal-body"><p class="career-modal-lead">${esc(story.detail)}</p><div class="career-choice-grid compact">${playerStoryChoices(story).map(choice=>`<button class="career-choice" data-story-choice="${choice.id}">${icon(choice.icon)}<span><strong>${choice.label}</strong><small>${esc(choice.detail)}${story.type==="state-boost"?` · ${esc(attributeBoostSummary(choice.boosts))} · 持续 ${choice.matches||2} 场`:""}</small></span>${icon("chevron-right")}</button>`).join("")}</div><div class="data-note">${story.type==="state-boost"?"选择会立即提升对应细项属性，并在指定的有效出场次数后结束；不同事件不会永久改变球员基础能力。":"这不是一次性弹窗。选择会在几天后产生后续，并改变教练、队友、经纪人或媒体关系。"}</div></div></div></div>`;
    }
    return "";
  }

  function renderModal() {
    if (!modal) return "";
    if (modal.type === "coachStory") return renderCoachStoryModal();
    if (["weeklyPlan","careerAction","playerIssue","playerStory","conversation"].includes(modal.type)) return renderPlayerCareerModal();
    if (modal.type === "playerProfile") return renderPlayerProfileModal(modal.player);
    if (modal.type === "clubProfile") return renderClubProfileModal(modal.club);
    if (modal.type === "mobileMenu") return `<div class="modal-backdrop mobile-menu-backdrop"><div class="modal mobile-menu" role="dialog" aria-modal="true"><div class="modal-header"><h2>更多页面</h2><button class="btn btn-icon btn-ghost" data-close-modal aria-label="关闭">${icon("x")}</button></div><div class="mobile-menu-grid">${NAV.slice(4).map(navButton).join("")}</div></div></div>`;
    if (modal.type === "notification") {
      const notification=state.notifications.find(item=>item.id===modal.id);if(!notification)return "";
      return `<div class="modal-backdrop"><div class="modal report-modal" role="dialog" aria-modal="true" aria-labelledby="notification-title"><div class="modal-header"><h2 id="notification-title">${esc(notification.title)}</h2><button class="btn btn-icon btn-ghost" data-close-modal aria-label="关闭">${icon("x")}</button></div><div class="modal-body">${renderNotificationDetail(notification)}</div><div class="modal-actions"><button class="btn btn-primary" data-close-modal>完成查看</button></div></div></div>`;
    }
    if (modal.type === "matchReport") {
      const report=(state.matchReports||[]).find(item=>item.id===modal.id);if(!report)return "";
      return `<div class="modal-backdrop"><div class="modal report-modal" role="dialog" aria-modal="true" aria-labelledby="fixture-report-title"><div class="modal-header"><div><span class="eyebrow">${report.season?`${report.season}/${String(Number(report.season)+1).slice(2)} · `:""}${esc(report.competition||"正式比赛")}</span><h2 id="fixture-report-title">${esc(report.homeName)} ${report.score.home}-${report.score.away} ${esc(report.awayName)}</h2></div><button class="btn btn-icon btn-ghost" data-close-modal aria-label="关闭">${icon("x")}</button></div><div class="modal-body">${renderMatchReport(report)}</div><div class="modal-actions"><button class="btn btn-primary" data-close-modal>返回赛程</button></div></div></div>`;
    }
    if (modal.type === "renewal") {
      const session=renewalById(modal.id);if(!session)return "";const closed=session.status!=="active",offer=session.offer;
      const patience=`<div class="patience-bar ${session.clubPatience<=30?"danger":session.clubPatience<=60?"warn":""}"><div><span>${esc(clubById(state.clubId).name)} 耐心</span><strong>${session.clubPatience}%</strong></div><i><span style="width:${session.clubPatience}%"></span></i></div>`;
      return `<div class="modal-backdrop"><div class="modal negotiation-modal" role="dialog" aria-modal="true"><div class="modal-header"><div><span class="eyebrow">第 ${session.round} 轮 · 球员续约</span><h2>${esc(controlledPlayer().name)}</h2></div><button class="btn btn-icon btn-ghost" data-close-modal aria-label="关闭">${icon("x")}</button></div><div class="negotiation-patience renewal-patience">${patience}<div class="renewal-deadline"><span>报价截止</span><strong>${formatDate(session.deadlineDate,false)}</strong></div></div><div class="modal-body negotiation-body"><section class="negotiation-summary"><div><span>当前周薪</span><strong>€${Math.round(Number(controlledPlayer().contract?.weeklyWage||0))}K</strong></div><div><span>合同到期</span><strong>${controlledPlayer().contract?.endSeason} 年</strong></div><div><span>本季评分</span><strong>${(averageRating(controlledPlayer())||6.35).toFixed(2)}</strong></div><div><span>谈判状态</span><strong>${closed?esc(session.closedReason||"已经结束"):"等待你的决定"}</strong></div></section>${closed?`<div class="negotiation-closed">${icon(session.status==="completed"?"circle-check":"circle-x")}<strong>${esc(session.closedReason||(session.status==="completed"?"续约已经完成":"谈判已经结束"))}</strong><span>现有合同状态已同步到球员详情。</span></div>`:`<section class="negotiation-form"><h3>俱乐部当前报价</h3><div class="negotiation-fields"><label>周薪<small>千欧元</small><input class="input" id="renew-wage" type="number" min="1" step="1" value="${offer.weeklyWage}"></label><label>签约奖金<small>百万欧元</small><input class="input" id="renew-signing" type="number" min="0" step="0.1" value="${offer.signingBonus}"></label><label>出场津贴<small>千欧元</small><input class="input" id="renew-appearance" type="number" min="0" step="1" value="${offer.appearanceFee}"></label><label>解约金<small>百万欧元</small><input class="input" id="renew-release" type="number" min="1" step="1" value="${offer.releaseClause}"></label><label>队内角色<small>承诺</small><select class="select" id="renew-role">${["核心主力","常规主力","轮换球员","替补球员"].map(role=>`<option ${offer.role===role?"selected":""}>${role}</option>`).join("")}</select></label><label>合同年限<small>年</small><input class="input" id="renew-years" type="number" min="1" max="5" value="${offer.years}"></label></div></section>`}<section class="negotiation-history"><h3>谈判记录</h3>${session.history.slice().reverse().map(item=>`<article><span>第 ${item.round} 轮</span><div><strong>${esc(item.speaker)}</strong><p>${esc(item.text)}</p></div></article>`).join("")}</section></div><div class="modal-actions">${closed?`<button class="btn btn-primary" data-close-modal>返回</button>`:`<button class="btn btn-danger" id="reject-renewal">拒绝续约</button><button class="btn" data-close-modal>稍后决定</button><button class="btn" id="counter-renewal">提交还价</button><button class="btn btn-primary" id="accept-renewal">接受报价</button>`}</div></div></div>`;
    }
    if (modal.type === "playerTransferOffer") {
      const career=ensurePlayerCareer(),offer=career?.transferOffer;if(!offer||offer.id!==modal.id)return "";const buyer=clubById(offer.toId),seller=clubById(offer.fromId),contract=offer.contract||{},active=offer.status==="active",loan=Boolean(offer.loan);
      return `<div class="modal-backdrop"><div class="modal negotiation-modal" role="dialog" aria-modal="true"><div class="modal-header"><div><span class="eyebrow">${loan?"正式租借方案":"正式转会报价"} · ${active?"等待球员决定":"报价已结束"}</span><h2>${esc(buyer.name)}</h2></div><button class="btn btn-icon btn-ghost" data-close-modal aria-label="关闭">${icon("x")}</button></div><div class="negotiation-patience renewal-patience"><div class="renewal-deadline"><span>报价截止</span><strong>${formatDate(offer.deadlineDate,false)}</strong></div><div class="renewal-deadline"><span>市场匹配度</span><strong>${offer.confidence}%</strong></div></div><div class="modal-body negotiation-body"><section class="negotiation-summary"><div><span>${loan?"租借费用":"转会费"}</span><strong>${loan?"赛季租借":money(offer.fee)}</strong></div><div><span>转会路径</span><strong>${esc(seller.name)} → ${esc(buyer.name)}</strong></div><div><span>当前能力</span><strong>${controlledPlayer()?.overall || "-"}</strong></div><div><span>计划角色</span><strong>${esc(contract.role||"轮换球员")}</strong></div></section><section class="negotiation-form"><h3>${loan?"租借安排":"个人合同条款"}</h3><div class="negotiation-fields">${loan?`<label>租借期限<small>自动回归</small><strong>本赛季结束</strong></label><label>工资承担<small>现有合同</small><strong>母队合同继续</strong></label><label>出场计划<small>目标定位</small><strong>${esc(contract.role||"轮换球员")}</strong></label>`:`<label>周薪<small>千欧元</small><strong>€${Math.round(Number(contract.weeklyWage||0))}K</strong></label><label>签约奖金<small>百万欧元</small><strong>${money(contract.signingBonus||0)}</strong></label><label>出场津贴<small>千欧元</small><strong>€${Math.round(Number(contract.appearanceFee||0))}K</strong></label><label>解约金<small>百万欧元</small><strong>${money(contract.releaseClause||0)}</strong></label><label>队内角色<small>承诺</small><strong>${esc(contract.role||"轮换球员")}</strong></label><label>合同年限<small>年</small><strong>${contract.years||"-"} 年</strong></label>`}</div></section><div class="data-note">${loan?`接受后立即租借至 ${esc(buyer.name)}，赛季结束自动回到 ${esc(seller.name)}；租借期间的出场、进球、助攻和评分会写入职业档案。`:`接受后将立即完成转会。你在 ${esc(seller.name)} 的本季数据会写入职业档案，新俱乐部从今天起重新统计。`}</div></div><div class="modal-actions">${active?`<button class="btn btn-danger" id="reject-player-transfer-offer">拒绝${loan?"租借方案":"报价"}</button><button class="btn" data-close-modal>稍后决定</button><button class="btn btn-primary" id="accept-player-transfer-offer">接受并${loan?"租借":"转会"}</button>`:`<button class="btn btn-primary" data-close-modal>返回</button>`}</div></div></div>`;
    }
    if (modal.type === "userClubOffer") {
      const offer=ensureTransferMarket(state).userOffers.find(item=>item.id===modal.id);if(!offer)return "";const buyer=clubById(offer.toId),seller=clubById(offer.fromId),active=offer.status==="active";
      return `<div class="modal-backdrop"><div class="modal negotiation-modal" role="dialog" aria-modal="true"><div class="modal-header"><div><span class="eyebrow">外部正式报价 · ${active?"等待主教练决定":"报价已结束"}</span><h2>${esc(offer.playerName)}</h2></div><button class="btn btn-icon btn-ghost" data-close-modal aria-label="关闭">${icon("x")}</button></div><div class="negotiation-patience renewal-patience"><div class="renewal-deadline"><span>报价截止</span><strong>${formatDate(offer.deadlineDate,false)}</strong></div><div class="renewal-deadline"><span>报价可信度</span><strong>${offer.confidence}%</strong></div></div><div class="modal-body negotiation-body"><section class="negotiation-summary"><div><span>转会费</span><strong>${money(offer.fee)}</strong></div><div><span>转会路径</span><strong>${esc(seller.name)} → ${esc(buyer.name)}</strong></div><div><span>位置</span><strong>${playerRoleLabel(offer.position)}</strong></div><div><span>能力 / 潜力</span><strong>${offer.overall} / ${offer.potential}</strong></div></section><div class="data-note">接受报价会立即完成转会并更新预算、阵容与职业数据；拒绝后球员继续留队，窗口内仍可能收到其他球队的接触。</div></div><div class="modal-actions">${active?`<button class="btn btn-danger" id="reject-user-club-offer">拒绝报价</button><button class="btn" data-close-modal>稍后决定</button><button class="btn btn-primary" id="accept-user-club-offer">接受报价</button>`:`<button class="btn btn-primary" data-close-modal>返回</button>`}</div></div></div>`;
    }
    if (modal.type === "negotiation") {
      const session=negotiationById(modal.id);if(!session)return "";const p=session.playerSnapshot,clubStage=session.stage==="club",closed=session.status!=="active";
      const patience=(label,value)=>`<div class="patience-bar ${value<=30?"danger":value<=60?"warn":""}"><div><span>${label}</span><strong>${value}%</strong></div><i><span style="width:${value}%"></span></i></div>`;
      return `<div class="modal-backdrop"><div class="modal negotiation-modal" role="dialog" aria-modal="true"><div class="modal-header"><div><span class="eyebrow">第 ${session.round} 轮 · ${clubStage?"俱乐部协议":"个人合同"}</span><h2>${esc(session.playerName)}</h2></div><button class="btn btn-icon btn-ghost" data-close-modal aria-label="关闭">${icon("x")}</button></div><div class="negotiation-patience">${patience(clubById(session.fromId).name,session.clubPatience)}${patience("球员经纪人",session.agentPatience)}</div><div class="modal-body negotiation-body">
        <section class="negotiation-summary"><div><span>参考身价</span><strong>${money(session.valuation)}</strong></div><div><span>加盟意愿</span><strong>${session.interest}%</strong></div><div><span>可用预算</span><strong>${money(state.funds)}</strong></div><div><span>当前阶段</span><strong>${closed?"谈判结束":clubStage?"转会费":"个人条款"}</strong></div></section>
        ${closed?`<div class="negotiation-closed">${icon("circle-x")}<strong>${esc(session.closedReason||"谈判已结束")}</strong><span>本次谈判不会继续推进。</span></div>`:clubStage?`<section class="negotiation-form"><h3>转会报价结构</h3><div class="negotiation-fields"><label>基础转会费<small>百万欧元</small><input class="input" id="neg-fee" type="number" min="0.5" step="0.5" value="${session.terms.fee}"></label><label>分期付款<small>百万欧元</small><input class="input" id="neg-installments" type="number" min="0" step="0.5" value="${session.terms.installments}"></label><label>出场附加条款<small>百万欧元</small><input class="input" id="neg-appearance" type="number" min="0" step="0.5" value="${session.terms.appearanceAddon}"></label><label>进球附加条款<small>百万欧元</small><input class="input" id="neg-goals" type="number" min="0" step="0.5" value="${session.terms.goalAddon}"></label><label>二次转会分成<small>百分比</small><input class="input" id="neg-sell-on" type="number" min="0" max="50" step="1" value="${session.terms.sellOn}"></label></div></section>`:`<section class="negotiation-form"><h3>个人合同条款</h3><div class="negotiation-fields"><label>周薪<small>千欧元</small><input class="input" id="neg-wage" type="number" min="1" step="1" value="${session.contract.weeklyWage}"></label><label>签约奖金<small>百万欧元</small><input class="input" id="neg-signing" type="number" min="0" step="0.1" value="${session.contract.signingBonus}"></label><label>出场津贴<small>千欧元</small><input class="input" id="neg-appearance-fee" type="number" min="0" step="1" value="${session.contract.appearanceFee}"></label><label>解约金<small>百万欧元</small><input class="input" id="neg-release" type="number" min="1" step="1" value="${session.contract.releaseClause}"></label><label>队内角色<small>承诺</small><select class="select" id="neg-role">${["核心主力","常规主力","轮换球员","替补球员"].map(role=>`<option ${session.contract.role===role?"selected":""}>${role}</option>`).join("")}</select></label><label>合同年限<small>年</small><input class="input" id="neg-years" type="number" min="1" max="5" value="${session.contract.years}"></label></div></section>`}
        <section class="negotiation-history"><h3>谈判记录</h3>${session.history.slice().reverse().map(item=>`<article><span>${item.round?`第 ${item.round} 轮`:"背景"}</span><div><strong>${esc(item.speaker)}</strong><p>${esc(item.text)}</p></div></article>`).join("")}</section></div><div class="modal-actions">${closed?`<button class="btn btn-primary" data-close-modal>返回转会中心</button>`:`<button class="btn btn-danger" id="withdraw-negotiation">退出谈判</button><button class="btn btn-primary" id="submit-negotiation">${clubStage?"提交俱乐部报价":"提交合同报价"}</button>`}</div></div></div>`;
    }
    if (modal.type === "transfer") {
      const p=modal.player;if(!p)return "";return `<div class="modal-backdrop"><div class="modal" role="dialog" aria-modal="true"><div class="modal-header"><h2>${state.role==="coach"?"建立谈判":"建议引援"}</h2><button class="btn btn-icon btn-ghost" data-close-modal aria-label="关闭">${icon("x")}</button></div><div class="modal-body"><div class="list-row" style="padding:0 0 18px"><div class="avatar">${initials(p.name)}</div><div class="list-row-main"><div class="list-row-title">${esc(p.name)}</div><div class="list-row-sub">${playerRoleLabel(p.position)} · ${p.age} 岁 · ${esc(p.club)} · 能力 ${p.overall} / 潜力 ${p.potential}</div></div></div>${state.role==="coach"?`<div class="data-note">谈判将先与出售俱乐部协商基础转会费、分期、附加条款及二次转会分成；达成后再与经纪人谈个人合同。双方都会记录耐心值。</div>`:`<p style="color:var(--muted);font-size:12px;line-height:1.7">你会向主教练建议考察这名球员。你的球队地位与该球员的适配度会影响建议被采纳的概率。</p>`}</div><div class="modal-actions"><button class="btn" data-close-modal>取消</button><button class="btn btn-primary" id="confirm-transfer">${state.role==="coach"?"开启谈判":"提交建议"}</button></div></div></div>`;
    }
    if (modal.type === "retire") return `<div class="modal-backdrop"><div class="modal" role="dialog" aria-modal="true"><div class="modal-header"><h2>确认退役</h2><button class="btn btn-icon btn-ghost" data-close-modal aria-label="关闭">${icon("x")}</button></div><div class="modal-body"><p style="color:var(--muted);line-height:1.7">退役会结束当前可推进的生涯，但不会删除历史记录。球员通常在 33–43 岁退役，玩家可以提前作出自己的决定。</p></div><div class="modal-actions"><button class="btn" data-close-modal>继续生涯</button><button class="btn btn-danger" id="confirm-retire">宣布退役</button></div></div></div>`;
    return "";
  }

  function renderCoachStoryModal() {
    const career=ensureCoachCareer(),story=career?.story,event=COACH_STORY_EVENTS.find(item=>item.id===story?.eventId);if(!story||!event)return "";
    return `<div class="modal-backdrop"><div class="modal player-career-modal" role="dialog" aria-modal="true"><div class="modal-header"><div><span class="eyebrow">教练管理事件</span><h2>${esc(event.title)}</h2></div><button class="btn btn-icon btn-ghost" data-close-modal aria-label="关闭">${icon("x")}</button></div><div class="modal-body"><p class="career-modal-lead">${esc(story.detail)}</p><div class="career-choice-grid compact">${event.choices.map(choice=>`<button class="career-choice" data-coach-story-choice="${choice.id}">${icon(choice.icon)}<span><strong>${esc(choice.label)}</strong><small>${esc(choice.detail)}</small></span>${icon("chevron-right")}</button>`).join("")}</div><div class="data-note">决定会在董事会信任、更衣室、媒体、选人、体能保护或接下来比赛的战术执行中产生实际后果。</div></div></div></div>`;
  }

  function openClubProfile(value) {
    const club=resolveClub(value); if(!club)return;
    modal={type:"clubProfile",club}; render();
  }

  function bindEvents() {
    document.getElementById("new-career")?.addEventListener("click",()=>{frontScreen="setup";render();});
    document.getElementById("cancel-new-career")?.addEventListener("click",()=>{frontScreen="menu";render();});
    document.querySelectorAll("[data-load-save]").forEach(button=>button.addEventListener("click",()=>{state=loadState(button.dataset.loadSave);frontScreen="menu";render();}));
    document.querySelectorAll("[data-delete-save]").forEach(button=>button.addEventListener("click",()=>{const id=button.dataset.deleteSave;if(!confirm("确定删除这个存档？此操作无法撤销。"))return;localStorage.removeItem(saveStorageKey(id));localStorage.setItem(SAVE_INDEX_KEY,JSON.stringify(loadSaveIndex().filter(item=>item.id!==id)));render();}));
    document.querySelectorAll("[data-setup]").forEach(b=>b.addEventListener("click",()=>{
      setup[b.dataset.setup]=b.dataset.value;
      if (b.dataset.setup==="role") {const first=setup.role==="coach"?COACHES[0]:REAL_PLAYERS[0];setup.identity=setupIdentityId(first);setup.clubId=first.club;setup.leagueId=clubById(first.club).league;}
      render();
    }));
    document.getElementById("setup-league")?.addEventListener("change",e=>{setup.leagueId=e.target.value;const identities=setupIdentities(),eligible=setup.origin==="real"?new Set(identities.map(item=>item.club)):new Set(CLUBS.map(club=>club.id));setup.clubId=CLUBS.find(club=>club.league===setup.leagueId&&eligible.has(club.id))?.id;if(setup.origin==="real")setup.identity=setupIdentityId(identities.find(item=>item.club===setup.clubId)||identities[0]);render();});
    document.getElementById("setup-club")?.addEventListener("change",e=>{setup.clubId=e.target.value;setup.leagueId=clubById(setup.clubId).league;if(setup.origin==="real"){const item=setupIdentities().find(person=>person.club===setup.clubId);if(item)setup.identity=setupIdentityId(item);}render();});
    document.getElementById("identity")?.addEventListener("change",e=>{setup.identity=e.target.value;const item=setupIdentities().find(person=>setupIdentityId(person)===setup.identity);if(item){setup.clubId=item.club;setup.leagueId=clubById(item.club).league;}render();});
    const form=document.getElementById("setup-form"); if(form) form.addEventListener("submit",e=>{ e.preventDefault(); const fd=new FormData(form); for(const [k,v] of fd) setup[k]=v; if(setup.origin==="real") { const item=setup.role==="coach"?COACHES.find(c=>c.name===setup.identity):REAL_PLAYERS.find(p=>p.id===setup.identity); if(!item){toast("请选择有效的球员或教练");return;} setup.clubId=item.club; } activeSaveId=`career-${Date.now().toString(36)}`;state=createState(); saveState(); render(); toast("生涯创建成功"); });
    const returnMain=()=>{saveState();stopMatchClock();state=null;modal=null;conversationSession=null;frontScreen="menu";render();};document.getElementById("return-main-menu")?.addEventListener("click",returnMain);document.getElementById("return-main-menu-mobile")?.addEventListener("click",returnMain);document.getElementById("return-main-menu-match")?.addEventListener("click",returnMain);
    document.querySelectorAll("[data-view]").forEach(b=>b.addEventListener("click",()=>{const target=b.dataset.view;if(target==="transfers"){runBusyTask({title:"正在加载转会中心",detail:"更新球探推荐、市场传闻与谈判状态",completeLabel:"转会中心已更新"},async ({progress,yieldFrame})=>{progress(38,"分析阵容缺口与候选球员");await yieldFrame();state.view=target;saveState();render();progress(94,"整理市场信息");});return;}state.view=target;saveState();render();}));
    document.querySelectorAll("[data-open-player-modal]").forEach(button=>button.addEventListener("click",()=>{modal={type:button.dataset.openPlayerModal};render();}));
    document.querySelectorAll("[data-career-action]").forEach(button=>button.addEventListener("click",()=>{if(!canCareerAction(button.dataset.careerAction)){toast("这项沟通刚刚进行过，请先推进几天");return;}modal={type:"careerAction",action:button.dataset.careerAction};render();}));
    document.querySelectorAll("[data-conversation]").forEach(button=>button.addEventListener("click",()=>startConversation(button.dataset.conversation)));
    document.querySelectorAll("[data-conversation-choice]").forEach(button=>button.addEventListener("click",()=>chooseConversation(button.dataset.conversationChoice)));
    document.querySelectorAll("[data-close-conversation]").forEach(button=>button.addEventListener("click",()=>{conversationSession=null;modal=null;render();}));
    document.querySelectorAll("[data-match-plan]").forEach(button=>button.addEventListener("click",()=>setPlayerMatchPlan(button.dataset.matchPlan)));
    document.querySelectorAll("[data-open-career-event]").forEach(button=>button.addEventListener("click",()=>{const value=button.dataset.openCareerEvent;if(value.startsWith("issue:"))modal={type:"playerIssue",id:value.slice(6)};else modal={type:"playerStory"};render();}));
    document.querySelectorAll("[data-open-coach-event]").forEach(button=>button.addEventListener("click",()=>{modal={type:"coachStory"};render();}));
    document.querySelectorAll("[data-weekly-plan]").forEach(button=>button.addEventListener("click",()=>setPlayerWeeklyPlan(button.dataset.weeklyPlan)));
    document.querySelectorAll("[data-career-choice]").forEach(button=>button.addEventListener("click",()=>resolveCareerAction(modal?.action,button.dataset.careerChoice)));
    document.querySelectorAll("[data-issue-choice]").forEach(button=>button.addEventListener("click",()=>resolvePerformanceIssue(button.dataset.issueChoice)));
    document.querySelectorAll("[data-story-choice]").forEach(button=>button.addEventListener("click",()=>resolvePlayerStoryChoice(button.dataset.storyChoice)));
    document.querySelectorAll("[data-coach-story-choice]").forEach(button=>button.addEventListener("click",()=>resolveCoachStoryChoice(button.dataset.coachStoryChoice)));
    document.getElementById("open-mobile-menu")?.addEventListener("click",()=>{modal={type:"mobileMenu"};render();});
    document.getElementById("continue-game")?.addEventListener("click",continueGameWithLoading);
    document.getElementById("start-match")?.addEventListener("click",continueGameWithLoading);
    document.getElementById("new-season")?.addEventListener("click",continueGameWithLoading);
    document.getElementById("tactic")?.addEventListener("change",e=>{state.tactic=e.target.value;saveState();});
    document.getElementById("training")?.addEventListener("change",e=>{state.training=e.target.value;saveState();toast("训练强度已更新");});
    document.getElementById("squad-search")?.addEventListener("input",e=>{state.squadSearch=e.target.value;let visible=0;document.querySelectorAll("#squad-body tr").forEach(r=>{r.hidden=!r.dataset.playerName.includes(e.target.value.toLowerCase());if(!r.hidden)visible++;});const count=document.getElementById("squad-count");if(count)count.textContent=visible===state.squad.length?`${state.squad.length} 名球员`:`显示 ${visible} / ${state.squad.length}`;saveState();});
    document.querySelectorAll("[data-squad-sort]").forEach(button=>button.addEventListener("click",()=>{const key=button.dataset.squadSort,current=state.squadSort||{};state.squadSort={key,direction:current.key===key&&current.direction==="desc"?"asc":current.key===key?"desc":["name","position","age"].includes(key)?"asc":"desc"};saveState();render();}));
    document.getElementById("squad-sort-select")?.addEventListener("change",e=>{const key=e.target.value;state.squadSort={key,direction:["name","position","age"].includes(key)?"asc":"desc"};saveState();render();});
    document.getElementById("squad-sort-direction")?.addEventListener("click",()=>{state.squadSort.direction=state.squadSort.direction==="asc"?"desc":"asc";saveState();render();});
    document.querySelectorAll("[data-sign-youth]").forEach(button=>button.addEventListener("click",()=>signYouthProspect(button.dataset.signYouth)));
    document.querySelectorAll("[data-release-youth]").forEach(button=>button.addEventListener("click",()=>releaseYouthProspect(button.dataset.releaseYouth)));
    document.querySelectorAll("[data-promote-youth]").forEach(button=>button.addEventListener("click",()=>promoteYouthProspect(button.dataset.promoteYouth)));
    document.querySelectorAll("[data-assign-mentor]").forEach(button=>button.addEventListener("click",()=>assignYouthMentor(button.dataset.assignMentor,document.getElementById(`mentor-${button.dataset.assignMentor}`)?.value)));
    document.querySelectorAll("[data-upgrade-youth]").forEach(button=>button.addEventListener("click",()=>upgradeYouthArea(button.dataset.upgradeYouth)));
    document.getElementById("fixture-season-filter")?.addEventListener("change",event=>{state.fixtureSeasonFilter=event.target.value;state.fixtureFilter="all";saveState();render();});
    document.getElementById("fixture-filter")?.addEventListener("change",event=>{state.fixtureFilter=event.target.value;saveState();render();});
    document.querySelectorAll("[data-match-report]").forEach(row=>{const open=event=>{if(event.target.closest?.("[data-club-profile]"))return;if(event.type==="keydown"&&!['Enter',' '].includes(event.key))return;event.preventDefault();openFixtureReport(row.dataset.matchReport);};row.addEventListener("click",open);row.addEventListener("keydown",open);});
    document.querySelectorAll("[data-notification]").forEach(button=>button.addEventListener("click",()=>openNotification(button.dataset.notification)));
    document.querySelectorAll("[data-player-profile]").forEach(button=>button.addEventListener("click",()=>{const player=playerProfileRegistry.get(button.dataset.playerProfile);if(!player)return;modal={type:"playerProfile",player};render();}));
    document.querySelectorAll(".league-club-cell,.league-result-team,.transfer-club,.match-club,.match-team-title,.report-team-head strong").forEach(element=>element.addEventListener("click",event=>{if(event.target.closest("button"))return;let label=(element.querySelector(".player-name strong,.league-result-team b,.transfer-club b,.match-team-title h3,.report-team-head strong")||element).textContent.replace(/^★\s*/,"").trim();if(element.classList.contains("match-club")){label=label.replace(/^[A-Z]{2,5}/,"").replace(/[A-Z]{2,5}$/ ,"").trim();}openClubProfile(label);}));
    document.querySelectorAll("[data-club-profile]").forEach(button=>button.addEventListener("click",()=>{const club=clubProfileRegistry.get(button.dataset.clubProfile);if(club)openClubProfile(club);}));
    document.querySelectorAll("[data-major-league]").forEach(button=>button.addEventListener("click",()=>{state.majorLeagueId=button.dataset.majorLeague;saveState();render();}));
    document.querySelectorAll("[data-world-center]").forEach(button=>button.addEventListener("click",()=>{const target=button.dataset.worldCenter;state.worldCenterMode=target==="domestic"?"domestic":"europe";if(target!=="domestic")state.europeanCompetitionKey=target;saveState();render();}));
    document.querySelectorAll("[data-europe-competition]").forEach(button=>button.addEventListener("click",()=>{state.europeanCompetitionKey=button.dataset.europeCompetition;saveState();render();}));
    document.getElementById("europe-round")?.addEventListener("change",event=>{state.europeanRoundFilters||={};state.europeanRoundFilters[state.europeanCompetitionKey]=Number(event.target.value);saveState();render();});
    document.querySelectorAll("[data-transfer]").forEach(b=>b.addEventListener("click",()=>{const player=transferRecommendationRegistry[Number(b.dataset.transfer)];if(!player)return;modal={type:"transfer",player};render();}));
    document.querySelectorAll("[data-open-negotiation]").forEach(button=>button.addEventListener("click",()=>{modal={type:"negotiation",id:button.dataset.openNegotiation};render();}));
    document.querySelectorAll("[data-open-renewal]").forEach(button=>button.addEventListener("click",()=>{modal={type:"renewal",id:button.dataset.openRenewal};render();}));
    document.querySelectorAll("[data-open-player-transfer-offer]").forEach(button=>button.addEventListener("click",()=>{modal={type:"playerTransferOffer",id:button.dataset.openPlayerTransferOffer};render();}));
    document.querySelectorAll("[data-open-user-club-offer]").forEach(button=>button.addEventListener("click",()=>{modal={type:"userClubOffer",id:button.dataset.openUserClubOffer};render();}));
    document.querySelectorAll("[data-list-player]").forEach(button=>button.addEventListener("click",()=>toggleTransferList(button.dataset.listPlayer)));
    document.querySelectorAll("[data-close-modal]").forEach(b=>b.addEventListener("click",()=>{modal=null;render();}));
    document.getElementById("confirm-transfer")?.addEventListener("click",()=>transferActionWithLoading("start"));
    document.getElementById("submit-negotiation")?.addEventListener("click",()=>transferActionWithLoading("submit"));
    document.getElementById("withdraw-negotiation")?.addEventListener("click",()=>withdrawNegotiation(modal?.id));
    document.getElementById("accept-renewal")?.addEventListener("click",()=>acceptPlayerRenewal(modal?.id));
    document.getElementById("counter-renewal")?.addEventListener("click",()=>submitPlayerRenewalCounter(modal?.id));
    document.getElementById("reject-renewal")?.addEventListener("click",()=>rejectPlayerRenewal(modal?.id));
    document.getElementById("accept-player-transfer-offer")?.addEventListener("click",()=>acceptPlayerTransferOffer(modal?.id));
    document.getElementById("reject-player-transfer-offer")?.addEventListener("click",()=>rejectPlayerTransferOffer(modal?.id));
    document.getElementById("accept-user-club-offer")?.addEventListener("click",()=>acceptUserClubExternalOffer(modal?.id));
    document.getElementById("reject-user-club-offer")?.addEventListener("click",()=>rejectUserClubExternalOffer(modal?.id));
    document.getElementById("request-transfer")?.addEventListener("click",requestTransfer);
    document.getElementById("suggest-signing")?.addEventListener("click",()=>{const target=transferRecommendations(1)[0];if(!target){toast("当前没有符合预算和阵容需求的引援目标");return;}modal={type:"transfer",player:target};render();});
    document.getElementById("retire")?.addEventListener("click",()=>{modal={type:"retire"};render();});
    document.getElementById("confirm-retire")?.addEventListener("click",retire);
    document.getElementById("reset-save")?.addEventListener("click",()=>{ if(confirm("确定删除当前存档？此操作无法撤销。")) resetSave(); });
    document.querySelectorAll("#toggle-match-play").forEach(button=>button.addEventListener("click",toggleMatchPlay));
    document.querySelectorAll("[data-match-speed]").forEach(button=>button.addEventListener("click",()=>setMatchSpeed(button.dataset.matchSpeed)));
    document.querySelectorAll("[data-live-player-plan]").forEach(button=>button.addEventListener("click",()=>setLivePlayerPlan(button.dataset.livePlayerPlan)));
    document.getElementById("skip-match")?.addEventListener("click",()=>{const m=state.activeMatch;if(!m||m.finished)return;m.paused=true;stopMatchClock();runBusyTask({title:"正在模拟剩余比赛",detail:"计算比赛事件、临场换人、技术统计与球员评分",initialProgress:Math.max(8,Math.round(m.minute/100*82)),completeLabel:"赛后分析已生成"},skipMatch);});
    document.querySelectorAll("[data-team-talk]").forEach(button=>button.addEventListener("click",()=>applyTeamTalk(button.dataset.teamTalk)));
    document.getElementById("heatmap-player")?.addEventListener("change",event=>{state.activeMatch.selectedHeatmapPlayer=event.target.value;saveState();drawHeatmapCanvas();});
    document.getElementById("make-substitution")?.addEventListener("click",makeManualSubstitution);
    document.getElementById("sub-out")?.addEventListener("change",syncSubstitutionOptions);
    document.getElementById("finish-match")?.addEventListener("click",()=>runBusyTask({title:"正在生成赛后分析",detail:"汇总比赛数据、球员评分、换人与医疗记录",completeLabel:"赛后分析已生成"},async ({progress,yieldFrame})=>{progress(44,"计算最终评分");await yieldFrame();finishMatch({openReport:true});progress(94,"整理赛后报告");}));
    document.getElementById("world-league")?.addEventListener("change",e=>{state.worldLeague=e.target.value;saveState();render();});
    document.getElementById("import-mod")?.addEventListener("click",()=>document.getElementById("mod-file")?.click());
    document.getElementById("mod-file")?.addEventListener("change",importModFile);
    document.getElementById("export-mod")?.addEventListener("click",exportModPacks);
    document.getElementById("clear-mods")?.addEventListener("click",clearModPacks);
    syncSubstitutionOptions();
  }

  async function importModFile(event) {
    const file=event.target.files?.[0];if(!file)return;
    try{
      const pack=validateModPack(JSON.parse(await file.text())),packs=loadModPacks();
      const next=[...packs.filter(item=>item.packId!==pack.packId),pack];localStorage.setItem(MOD_KEY,JSON.stringify(next));
      const fresh=createBackgroundWorld(state.season);
      Object.entries(fresh.leagues).forEach(([id,league])=>{if(!state.backgroundWorld.leagues[id])state.backgroundWorld.leagues[id]=league;});
      state.worldLeague=pack.leagues.find(item=>item.simulation==="background")?.id||state.worldLeague;saveState();render();toast(`已导入 ${pack.name}`);
    }catch(error){toast(`MOD 导入失败：${error.message}`);}
  }

  function downloadJson(filename,value) {
    const blob=new Blob([JSON.stringify(value,null,2)],{type:"application/json"}),url=URL.createObjectURL(blob),link=document.createElement("a");
    link.href=url;link.download=filename;link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
  }

  function exportModPacks() {
    const packs=loadModPacks();let exported;
    if(packs.length){exported={schemaVersion:1,packId:`community-export-${Date.now()}`,name:"Football Simulator community export",leagues:packs.flatMap(pack=>pack.leagues||[]),clubs:packs.flatMap(pack=>pack.clubs||[]),players:packs.flatMap(pack=>pack.players||[])};}
    else{exported={schemaVersion:1,packId:"builtin-background-example",name:"Built-in background league example",leagues:BACKGROUND_LEAGUES.map(league=>({id:league.id,name:league.name,country:league.country,tier:league.tier,simulation:"background"})),clubs:BACKGROUND_LEAGUES.flatMap(league=>league.clubs.map((club,index)=>({id:`${league.id.toLowerCase()}-${index+1}`,name:club[0],leagueId:league.id,prestige:club[1],averageAbility:club[2]}))),players:[]};}
    downloadJson("football-simulator-mod-pack.json",exported);toast("可再次导入的 MOD 数据包已导出");
  }

  function clearModPacks() {
    if(!confirm("清除当前浏览器中的所有 MOD 数据包？"))return;
    localStorage.removeItem(MOD_KEY);const builtIn=new Set(BACKGROUND_LEAGUES.map(item=>item.id));
    Object.keys(state.backgroundWorld.leagues).forEach(id=>{if(!builtIn.has(id))delete state.backgroundWorld.leagues[id];});
    if(!state.backgroundWorld.leagues[state.worldLeague])state.worldLeague="BRA1";saveState();render();toast("MOD 数据包已清除");
  }

  function recoverFitness(player,days,training) {
    let fitness=Number(player.fitness||70),remaining=Math.max(0,Math.floor(days));
    const trainingFactor=training==="recovery"?1.3:training==="intense"?.72:1;
    const ageFactor=player.age>=34?.86:player.age>=30?.94:player.age<=23?1.05:1;
    const injuryDays=Math.max(0,Number(player.injured||0));
    let elapsed=0;
    while(remaining-->0&&fitness<100){
      const base=fitness<70?4.8:fitness<85?3.75:fitness<93?2.6:1.35;
      const injuryFactor=elapsed<injuryDays?.48:1;
      fitness=clamp(fitness+base*trainingFactor*ageFactor*injuryFactor,35,100);
      elapsed++;
    }
    return Math.round(fitness);
  }

  function importantTransferEvent(previousRecordIds,previousRumorIds) {
    const market=ensureTransferMarket(state),newRecords=market.records.filter(record=>!previousRecordIds.has(record.id)),newRumors=market.rumors.filter(rumor=>rumor.status==="active"&&!previousRumorIds.has(rumor.id));
    const record=newRecords.find(item=>item.fromId===state.clubId||item.toId===state.clubId||item.fee>=45||item.overall>=84);
    if(record){const buyer=clubById(record.toId);return {type:"transfer",title:`转会完成：${record.playerName} 加盟 ${buyer.name}`,view:"transfers"};}
    const rumor=newRumors.find(item=>item.fromId===state.clubId||item.toId===state.clubId||item.fee>=55||item.overall>=85);
    if(rumor){return {type:"transfer",title:`转会动态：${clubById(rumor.toId).name} 有意 ${rumor.playerName}`,view:"transfers"};}
    return null;
  }

  function offseasonCalendarEvent(save,date) {
    if(Number(date.slice(0,4))!==Number(save?.season))return null;
    const milestones={
      "06-15":{type:"transfer-window",title:"夏季转会窗口正式开启",view:"transfers"},
      "07-01":{type:"offseason",title:"新赛季阵容与合同注册评估",view:"squad"},
      "07-15":{type:"preseason",title:"一线队季前集训正式开始",view:"squad"},
      "08-01":{type:"season-launch",title:"新赛季准备工作完成",view:"home"}
    };
    return milestones[date.slice(5)]||null;
  }

  function advanceCareerDay(targetDate) {
    const market=ensureTransferMarket(state),previousRecordIds=new Set(market.records.map(record=>record.id)),previousRumorIds=new Set(market.rumors.map(rumor=>rumor.id));
    state.squad.forEach(player=>{
      const training=state.role==="player"&&player.id===state.controlledId?playerPlanTrainingMode():state.training;
      player.fitness=recoverFitness(player,1,training);
      if(player.injured){player.injured=Math.max(0,player.injured-1);if(!player.injured){player.injury=null;player.morale=clamp(player.morale+3,0,100);}}
    });
    simulateBackgroundWorld(targetDate);
    simulateMajorLeagueWorld(state,targetDate);
    simulateEuropeanWorld(state,targetDate);
    state.date=targetDate;
    advanceYouthDevelopment(state);
    const youthEvent=runYouthIntake(state,targetDate);
    const playerEvent=applyPlayerCareerDay(targetDate);
    const coachEvent=applyCoachCareerDay(targetDate);
    advanceInSeasonDevelopment(state,targetDate);
    const marketValueEvent=runQuarterlyMarketValueReview(state,targetDate);
    const financeEvent=runMonthlyClubFinances(state,targetDate);
    simulateTransferMarket(state,targetDate);
    const transferEvent=importantTransferEvent(previousRecordIds,previousRumorIds),offseasonEvent=offseasonCalendarEvent(state,targetDate);
    return youthEvent||playerEvent||coachEvent||marketValueEvent||financeEvent||transferEvent||offseasonEvent;
  }

  function continueGame() {
    const mode=continueActionMode();if(mode==="disabled")return;if(mode==="season"){newSeason();return;}const fixture=nextFixture();
    if(fixture.date<=state.date){state.continueStatus={type:"match",title:`${fixture.competition}比赛日：对阵 ${fixture.opponent}`,date:state.date};saveState();startMatch();return;}
    state.continueStatus=null;
    let event=null,cursor=state.date,guard=0;
    while(cursor<fixture.date&&guard++<370){
      cursor=addDays(cursor,1);
      event=advanceCareerDay(cursor);
      if(event)break;
      if(cursor===fixture.date){event={type:"match",title:`${fixture.competition}比赛日：对阵 ${fixture.opponent}`,view:"home"};break;}
    }
    if(!event)event={type:"calendar",title:"时间推进已暂停",view:state.view};
    state.continueStatus={type:event.type,title:event.title,date:state.date};
    if(event.view)state.view=event.view;
    saveState();render();toast(`${formatDate(state.date,false)} · ${event.title}`);
  }

  function positionUnit(position) {
    if(position==="GK")return "goalkeeper";
    if(["RB","LB","RWB","LWB","DF","CB"].includes(position))return "defence";
    if(["DM","CM","RM","LM","AM","MF"].includes(position))return "midfield";
    return "attack";
  }

  const AI_FORMATIONS=[
    {name:"4-3-3",slots:["GK","RB","CB","CB","LB","DM","CM","CM","RW","ST","LW"]},
    {name:"4-4-2",slots:["GK","RB","CB","CB","LB","RM","CM","CM","LM","ST","ST"]},
    {name:"3-5-2",slots:["GK","CB","CB","CB","RWB","DM","CM","CM","LWB","ST","CF"]},
    {name:"3-4-3",slots:["GK","CB","CB","CB","RWB","CM","CM","LWB","RW","ST","LW"]},
    {name:"5-3-2",slots:["GK","RWB","CB","CB","CB","LWB","DM","CM","AM","ST","CF"]}
  ];
  const POSITION_SLOT_ALTERNATIVES={
    GK:{GK:14},CB:{CB:14,DM:5,RB:3,LB:3},RB:{RB:14,RWB:11,CB:5,RM:3},LB:{LB:14,LWB:11,CB:5,LM:3},RWB:{RWB:14,RB:11,RM:8,RW:4},LWB:{LWB:14,LB:11,LM:8,LW:4},
    DM:{DM:14,CM:9,CB:6},CM:{CM:14,DM:9,AM:8,RM:7,LM:7},RM:{RM:14,RW:10,RWB:8,CM:6},LM:{LM:14,LW:10,LWB:8,CM:6},AM:{AM:14,CF:10,CM:8,RW:6,LW:6},
    RW:{RW:14,RM:10,CF:7,AM:6,ST:4},LW:{LW:14,LM:10,CF:7,AM:6,ST:4},ST:{ST:14,CF:11,RW:4,LW:4},CF:{CF:14,ST:11,AM:10,RW:7,LW:7}
  };
  const POSITION_FIT_SELECTION_WEIGHT=6;
  function positionSlotFit(position,slot) {return POSITION_SLOT_ALTERNATIVES[slot]?.[position]??-18;}
  function assignFormationSlots(sortedPlayers,formation,scorePlayer) {
    const remaining=[...sortedPlayers],pending=formation.slots.map((slot,index)=>({slot,index})),assigned=new Array(formation.slots.length);let valid=true;
    while(pending.length){
      const slotChoice=pending.map(entry=>{
        const options=remaining.map(player=>({player,fit:positionSlotFit(player.position,entry.slot)})).filter(item=>item.fit>-10);
        return {...entry,options,natural:options.filter(item=>item.fit>=11).length};
      }).sort((a,b)=>a.natural-b.natural||a.options.length-b.options.length||b.slot.length-a.slot.length||a.index-b.index)[0];
      if(!slotChoice?.options.length){valid=false;break;}
      const choice=slotChoice.options.sort((a,b)=>(scorePlayer(b.player)+b.fit*POSITION_FIT_SELECTION_WEIGHT)-(scorePlayer(a.player)+a.fit*POSITION_FIT_SELECTION_WEIGHT))[0];
      assigned[slotChoice.index]={player:choice.player,slot:slotChoice.slot,fit:choice.fit};remaining.splice(remaining.indexOf(choice.player),1);pending.splice(pending.findIndex(entry=>entry.index===slotChoice.index),1);
    }
    const completed=assigned.filter(Boolean);return {players:completed.map(item=>item.player),assignments:completed,valid:valid&&completed.length===formation.slots.length,fitScore:completed.reduce((sum,item)=>sum+item.fit,0)};
  }
  function aiLineupScore(player,profile=null,dense=false) {
    const coach=profile||coachDecisionProfile("AI"),fitnessWeight=dense?.22:.13,formWeight=.1,abilityWeight=1-fitnessWeight-formWeight;
    const youthBonus=player.age<=22?coach.youthTrust*1.8:0,experienceBonus=player.age>=29?(1-coach.risk)*.8:0;
    return (player.overall||60)*abilityWeight+(player.fitness||80)*fitnessWeight+(player.form||6)*10*formWeight+youthBonus+experienceBonus;
  }
  function fixtureSelectionImportance(fixture) {
    if(!fixture)return .65;
    const competition=String(fixture.competition||""),round=String(fixture.round||fixture.stageName||""),knockout=fixture.knockout||fixture.phase==="knockout";
    let importance=fixture.international?.78:/欧冠|冠军联赛/.test(competition)?.86:/欧联/.test(competition)?.76:/欧协/.test(competition)?.68:/杯|Cup|Pokal|Copa/.test(competition)?.56:.64;
    if(knockout)importance=Math.max(importance,.84);
    if(/决赛/.test(round))importance=.99;else if(/半决赛/.test(round))importance=Math.max(importance,.94);else if(/八强|四分之一/.test(round))importance=Math.max(importance,.89);
    const ourClub=state?.clubId?clubById(state.clubId):null,opponent=findClubByName(fixture.opponent),opponentStrength=Number(fixture.opponentStrength||opponent?.prestige||74);
    if(ourClub)importance+=clamp((opponentStrength-ourClub.prestige)/35,-.08,.12);
    if(!knockout&&state?.played>=28&&(state.leaguePosition<=4||state.leaguePosition>=Math.max(15,leagueClubNames(ourClub?.league).length-4)))importance+=.08;
    return clamp(importance,.42,1);
  }
  function tacticalSelectionFit(player,tactic="balanced") {
    const attribute=key=>Number(player[key]??player.overall??70),keys=({
      press:["physical","pace","workRate","defending"],counter:["pace","shooting","passing"],defensive:["defending","physical","positioning"],balanced:["passing","technique","dribbling"]
    })[tactic]||["passing","physical"];
    const average=keys.reduce((sum,key)=>sum+attribute(key),0)/keys.length;
    return clamp((average-70)/7,-2.4,2.8);
  }
  function playerSelectionWorkload(player,fixture,dense,importance) {
    const starts=Number(player.consecutiveStarts||0),minutes=Number(player.lastMatchMinutes||0),days=player.lastMatchDate?daysBetween(player.lastMatchDate,fixture.date):99;
    let penalty=Math.max(0,starts-1)*(dense?3.1:1.45)*(1-importance*.25);
    if(days<=5&&minutes>=70)penalty+=(6-days)*.8+Math.max(0,minutes-70)*.035;
    if((player.fitness||100)<78)penalty+=(78-Number(player.fitness||78))*(dense?.2:.1);
    if(player.age>=32&&days<=5)penalty+=1.1;
    return penalty;
  }
  function matchSelectionScore(player,fixture,profile,dense,tactic) {
    const importance=fixtureSelectionImportance(fixture),form=Number(player.lastRating||player.form||6.35),morale=Number(player.morale??75),fitness=Number(player.fitness??85),role=player.contract?.role||"轮换球员";
    const abilityWeight=.61+importance*.08,fitnessWeight=dense?.2:.13,formWeight=.09,roleBonus=({"核心主力":2.7,"常规主力":1.45,"轮换球员":.35,"替补球员":-.6})[role]||0;
    const youthBonus=player.age<=22?profile.youthTrust*1.15:0,experienceBonus=player.age>=29?(1-profile.risk)*.55:0,variation=(stableScoutingUnit(`lineup|${fixture.id||fixture.date}|${player.id||player.name}|${profile.name||"coach"}`)-.5)*(1.5+profile.rotation*2.4);
    const career=state?.role==="player"&&player.id===state.controlledId?ensurePlayerCareer(state):null,selectionPush=career?.selectionPushUntil&&fixture.date<=career.selectionPushUntil?2.4:0,coachRelationship=career?(Number(career.relationships?.coach||50)-50)*.025:0,careerBonus=career?(career.trust-60)*.075+(career.tactical-60)*.035+(career.professionalism-60)*.025+(career.chemistry-60)*.015-(career.pressure-35)*.018+selectionPush+coachRelationship:0;
    const coachCareer=state?.role==="coach"?ensureCoachCareer(state):null,preparedYouthBonus=coachCareer?.preparations.some(item=>item.youthPriorityId===player.id)?7.5:0;
    return Number(player.overall||60)*abilityWeight+fitness*fitnessWeight+(form-5.5)*10*formWeight+(morale-75)*.025+roleBonus+youthBonus+experienceBonus+tacticalSelectionFit(player,tactic)+careerBonus+preparedYouthBonus-playerSelectionWorkload(player,fixture,dense,importance)+variation;
  }
  function controlledSelectionSummary(player,fixture,lineup,bench,dense) {
    if(!player)return null;
    const samePlayer=item=>item===player||item?.id===player.id||item?.sourcePlayerId===player.id||player.sourcePlayerId&&item?.sourcePlayerId===player.sourcePlayerId,status=lineup.some(samePlayer)?"starter":bench.some(samePlayer)?"bench":"rest",form=Number(player.lastRating||player.form||6.35),fitness=Number(player.fitness??100),starts=Number(player.consecutiveStarts||0),importance=fixtureSelectionImportance(fixture);
    let reason;
    if(player.injured)reason=`${player.injury||"伤病"}恢复中，未进入比赛名单`;
    else if(status==="starter")reason=importance>=.86?"重要比赛采用主力阵容":dense&&starts>=2?"阵容需要，密集赛程继续首发":state.role==="player"&&ensurePlayerCareer()?.trust>=72?"近期表现与教练信任达到首发要求":"综合能力、状态与战术适配达到首发要求";
    else if(fitness<72)reason=status==="bench"?"体能尚未恢复到首发标准，进入替补席":"体能恢复计划，安排本场休息";
    else if(dense&&(starts>=2||Number(player.lastMatchMinutes||0)>=75))reason=status==="bench"?"密集赛程控制连续出场负荷，进入替补席":"密集赛程轮休，未进入本场名单";
    else if(form<6.05)reason=status==="bench"?"近期状态影响首发顺位，进入替补席":"近期状态与位置竞争导致轮休";
    else reason=status==="bench"?"战术轮换，进入替补席等待临场机会":"阵容竞争与战术安排，未进入本场名单";
    return {status,reason,label:status==="starter"?"本场首发":status==="bench"?"替补待命":"本场轮休"};
  }
  function coachFormationBias(identity,index,profile=null) {
    const coach=profile||coachDecisionProfile(identity),preferred=Math.floor(coach.formationSeed*AI_FORMATIONS.length);
    return index===preferred?2.2:Math.abs(index-preferred)===1?.55:0;
  }
  function chooseFormationPlayers(sortedPlayers,controlledId=null,identity="AI",options={}) {
    const profile=options.profile||coachDecisionProfile(identity),dense=Boolean(options.dense),scorePlayer=options.scorePlayer||((player)=>aiLineupScore(player,profile,dense));
    const candidates=AI_FORMATIONS.map((formation,index)=>{
      const assignment=assignFormationSlots(sortedPlayers,formation,scorePlayer),players=assignment.players,valid=assignment.valid;
      const balancePenalty=players.filter(player=>(player.fitness||100)<66).length*(2.8-profile.rotation);
      return {name:formation.name,players,assignments:assignment.assignments,score:valid?players.reduce((sum,player)=>sum+scorePlayer(player),0)+assignment.fitScore*1.35+coachFormationBias(identity,index,profile)-balancePenalty:-Infinity};
    }).sort((a,b)=>b.score-a.score);
    const choice=candidates[0],selected=[...(Number.isFinite(choice?.score)?choice.players:[])];
    sortedPlayers.filter(player=>player.position!=="GK"&&!selected.includes(player)).forEach(player=>{if(selected.length<11)selected.push(player);});
    sortedPlayers.filter(player=>!selected.includes(player)).forEach(player=>{if(selected.length<11)selected.push(player);});
    return {players:selected.slice(0,11),name:choice?.name||"灵活阵型",assignments:choice?.assignments||[]};
  }

  function selectFormationPlayers(sortedPlayers,controlledId=null,identity="AI") { return chooseFormationPlayers(sortedPlayers,controlledId,identity).players; }

  function selectMatchBench(sortedPlayers,lineup,size=9) {
    const remaining=sortedPlayers.filter(player=>!lineup.includes(player)),backupKeeper=remaining.find(player=>player.position==="GK"),bench=[];
    if(backupKeeper)bench.push(backupKeeper);
    remaining.filter(player=>player!==backupKeeper).forEach(player=>{if(bench.length<size)bench.push(player);});
    return bench;
  }

  function repairMatchLineups(save,m) {
    const repair=(players,lineupKey,initialKey,benchKey,initialBenchKey,controlledId=null)=>{
      const initialIds=m[initialKey]||m[lineupKey]||[],currentIds=m[lineupKey]||[],available=[...players].sort((a,b)=>(b.overall||0)-(a.overall||0));
      const keeper=available.find(player=>player.id===controlledId&&player.position==="GK")||available.find(player=>player.position==="GK");
      if(!keeper)return;
      const addKeeper=ids=>{
        if(ids.some(id=>players.find(player=>player.id===id)?.position==="GK"))return;
        const replaceIndex=ids.map((id,index)=>({id,index,player:players.find(player=>player.id===id)})).filter(item=>item.player&&item.id!==controlledId&&item.player.position!=="GK").at(-1)?.index;
        if(replaceIndex!=null)ids[replaceIndex]=keeper.id;
      };
      addKeeper(initialIds);addKeeper(currentIds);m[initialKey]=initialIds;m[lineupKey]=currentIds;
      const lineupPlayers=initialIds.map(id=>players.find(player=>player.id===id)).filter(Boolean),benchSize=m.fixture?.international?12:9,orderedBench=selectMatchBench(available,lineupPlayers,benchSize).map(player=>player.id);
      m[initialBenchKey]=orderedBench;m[benchKey]=(m[benchKey]||orderedBench).filter(id=>!currentIds.includes(id));
      if(!m[benchKey].some(id=>players.find(player=>player.id===id)?.position==="GK")){
        const reserve=available.find(player=>player.position==="GK"&&!currentIds.includes(player.id));if(reserve)m[benchKey].unshift(reserve.id);
      }
      m[benchKey]=[...new Set(m[benchKey])].slice(0,benchSize);
    };
    repair(m.ourPlayers||save.squad||[],"lineupIds","initialLineupIds","benchIds","initialBenchIds",save.role==="player"?save.controlledId:null);
    if(m.opponentPlayers)repair(m.opponentPlayers,"opponentLineupIds","opponentInitialLineupIds","opponentBenchIds","opponentInitialBenchIds");
  }

  function matchOurPlayers(m) {
    const controlled=controlledPlayer();return (m?.ourPlayers||state.squad).map(player=>controlled&&player.id===state.controlledId?controlled:player);
  }

  function buildNationalMatchSquad(nation,fixture,controlled=null,idPrefix="national") {
    const quotas={goalkeeper:3,defence:8,midfield:7,attack:5},generatedPositions={goalkeeper:["GK","GK","GK"],defence:["RB","CB","CB","CB","LB","RWB","LWB","CB"],midfield:["DM","DM","CM","CM","RM","LM","AM"],attack:["RW","LW","ST","ST","CF"]};
    const candidates=REAL_PLAYERS.filter(item=>primaryNationality(item)===nation&&(!controlled||comparableClubName(item.name)!==comparableClubName(controlled.name))).sort((a,b)=>b.overall-a.overall||a.age-b.age),squad=controlled?[controlled]:[];
    Object.keys(quotas).forEach(unit=>{
      const needed=quotas[unit]-squad.filter(item=>positionUnit(item.position)===unit).length;
      candidates.filter(item=>positionUnit(item.position)===unit).slice(0,Math.max(0,needed)).forEach((item,index)=>squad.push({...item,id:`${idPrefix}-${item.id}`,number:item.number||index+1,fitness:Math.round(rand(84,100)),morale:82}));
    });
    let generatedIndex=0;
    Object.entries(quotas).forEach(([unit,quota])=>{
      while(squad.filter(item=>positionUnit(item.position)===unit).length<quota){
        const unitIndex=squad.filter(item=>positionUnit(item.position)===unit).length,position=generatedPositions[unit][unitIndex%generatedPositions[unit].length],overall=clamp(Math.round((NATIONAL_TEAM_STRENGTH[nation]||74)-10+rand(-4,5)),58,89),index=generatedIndex++;
        squad.push({id:`${idPrefix}-generated-${fixture.id}-${index}`,name:`${FIRST[(index*5+nation.length)%FIRST.length]} ${LAST[(index*7+nation.length)%LAST.length]}`,number:index+1,position,overall,fitness:Math.round(rand(86,100)),morale:80,nationality:nation,generated:true});
      }
    });
    const ordered=Object.keys(quotas).flatMap(unit=>squad.filter(item=>positionUnit(item.position)===unit).sort((a,b)=>b.overall-a.overall)).slice(0,23),keeperNumbers=[1,12,23],outfieldNumbers=[2,3,4,5,6,7,8,9,10,11,13,14,15,16,17,18,19,20,21,22],used=new Set();
    return ordered.map(item=>{const pool=positionUnit(item.position)==="goalkeeper"?keeperNumbers:outfieldNumbers,number=pool.find(value=>!used.has(value))||Array.from({length:23},(_,index)=>index+1).find(value=>!used.has(value))||item.number;used.add(number);return item===controlled?item:{...item,number};});
  }

  function createNationalMatchSquad(player,fixture) {
    return buildNationalMatchSquad(fixture.teamName||primaryNationality(player),fixture,player,"national");
  }

  function selectMatchLineup(fixture,tactic="balanced") {
    const previous=[...state.schedule].filter(item=>item.status==="played"&&item.date<fixture.date).sort((a,b)=>b.date.localeCompare(a.date))[0];
    const dense=previous&&daysBetween(previous.date,fixture.date)<=5;
    const identity=fixture.international?`${fixture.teamName}国家队主教练`:state.role==="player"?(clubById(state.clubId).coach||state.clubId):(state.coachProfile?.name||state.clubId),profile=aiCoachProfile(state,fixture.international?fixture.teamName:state.clubId,identity);
    const pool=fixture.international?createNationalMatchSquad(controlledPlayer(),fixture):state.squad;
    const selectionScore=player=>matchSelectionScore(player,fixture,profile,Boolean(dense),tactic),available=pool.filter(player=>!player.injured).sort((a,b)=>selectionScore(b)-selectionScore(a));
    const controlled=controlledPlayer(),selection=chooseFormationPlayers(available,null,identity,{profile,dense:Boolean(dense),scorePlayer:selectionScore}),lineup=selection.players;
    const strongestPool=[...available].sort((a,b)=>b.overall-a.overall),strongest=chooseFormationPlayers(strongestPool,null,identity,{profile,dense:false}).players,rotated=strongest.filter(player=>!lineup.includes(player)).length;
    const bench=selectMatchBench(available,lineup,fixture.international?12:9);
    const controlledSelection=state.role==="player"?controlledSelectionSummary(controlled,fixture,lineup,bench,Boolean(dense)):null;
    return {lineup,bench,pool,dense:Boolean(dense),rotated,formation:selection.name,coachProfile:profile,controlledSelection};
  }

  function findClubByName(name) {
    const target=comparableClubName(name);
    return CLUBS.find(club=>comparableClubName(club.name)===target||comparableClubName(club.englishName||"")===target);
  }

  function createOpponentMatchSquad(fixture) {
    if(fixture.international)return buildNationalMatchSquad(fixture.opponent,fixture,null,`opp-national-${fixture.id}`);
    const opponentClub=findClubByName(fixture.opponent),prestige=fixture.opponentStrength||opponentClub?.prestige||78;
    const imported=opponentClub?aiClubPlayers(state,opponentClub.id):[];
    const players=[...imported].sort((a,b)=>b.overall-a.overall).slice(0,20).map((player,index)=>({
      ...player,id:`opp-${fixture.id}-${player.id}`,name:player.name,number:player.number||index+1,position:player.position,overall:player.overall,fitness:Math.round(rand(82,100))
    }));
    for(let index=players.length;index<20;index++){
      const position=POSITIONS[index%POSITIONS.length],overall=clamp(Math.round(prestige-14+rand(-5,6)),58,91);
      players.push({id:`opp-${fixture.id}-generated-${index}`,name:`${FIRST[(index*3+fixture.opponent.length)%FIRST.length]} ${LAST[(index*5+fixture.opponent.length)%LAST.length]}`,number:index+1,position,overall,fitness:Math.round(rand(82,100)),generated:true});
    }
    while(players.filter(player=>player.position==="GK").length<2){
      const reserve=[...players].reverse().find(player=>player.generated&&player.position!=="GK");if(!reserve)break;reserve.position="GK";
    }
    return players;
  }

  function emptyMatchEvent() {
    return {goals:0,assists:0,shots:0,onTarget:0,bigChancesMissed:0,penaltiesMissed:0,mistakes:0,errorsLeadingToGoal:0,yellow:0,red:0,passes:0,accuratePasses:0,possessionLost:0,tackles:0,tacklesWon:0,interceptions:0,clearances:0,blocks:0,duels:0,duelsWon:0,wasDribbled:0,saves:0,cleanSheets:0,keyPasses:0,chancesCreated:0,dribblesAttempted:0,successfulDribbles:0,progressivePasses:0,recoveries:0,pressuresWon:0,defensiveRating:0,impactRating:0,decisionRating:0,ratingDelta:0,ratingReasons:[]};
  }

  function ensureMatchEvent(events,id) {
    const event=events[id]||(events[id]=emptyMatchEvent());
    Object.entries(emptyMatchEvent()).forEach(([key,value])=>{event[key]??=value;});
    return event;
  }

  function ensureMatchRuntime(save,m) {
    const squad=m.ourPlayers||save.squad||[],initial=m.initialLineupIds||[...(m.lineupIds||[])];
    m.initialLineupIds=initial;
    if(save.role==="coach")m.coachEffect||=coachMatchEffect();
    if(!m.benchIds){const lineupPlayers=initial.map(id=>squad.find(player=>player.id===id)).filter(Boolean),available=squad.filter(player=>!player.injured).sort((a,b)=>b.overall-a.overall);m.benchIds=selectMatchBench(available,lineupPlayers).map(player=>player.id);}
    m.initialBenchIds||=[...m.benchIds];
    m.opponentPlayers||=createOpponentMatchSquad(m.fixture);
    const opponentClub=findClubByName(m.fixture.opponent),opponentProfile=aiCoachProfile(save,opponentClub?.id||m.fixture.opponent,opponentClub?.coach||m.fixture.opponent);
    m.aiCoachProfiles||={ours:aiCoachProfile(save,save.clubId,save.role==="player"?(clubById(save.clubId).coach||save.clubId):(save.coachProfile?.name||save.clubId)),opponent:opponentProfile};
    m.aiLastSubMinute||={ours:-20,opponent:-20};
    m.aiLastTacticalMinute||={ours:-20,opponent:-20};
    m.aiTacticalPlans||={ours:"balanced",opponent:"balanced"};
    if(!m.opponentLineupIds){const opponentSelection=chooseFormationPlayers([...m.opponentPlayers].sort((a,b)=>aiLineupScore(b,opponentProfile,false)-aiLineupScore(a,opponentProfile,false)),null,opponentProfile.name,{profile:opponentProfile});m.opponentLineupIds=opponentSelection.players.map(player=>player.id);m.opponentFormation=opponentSelection.name;}
    m.opponentInitialLineupIds||=[...m.opponentLineupIds];
    if(!m.opponentBenchIds){const lineupPlayers=m.opponentLineupIds.map(id=>m.opponentPlayers.find(player=>player.id===id)).filter(Boolean);m.opponentBenchIds=selectMatchBench([...m.opponentPlayers].sort((a,b)=>b.overall-a.overall),lineupPlayers).map(player=>player.id);}
    m.opponentInitialBenchIds||=[...m.opponentBenchIds];
    repairMatchLineups(save,m);
    m.formation||=chooseFormationPlayers(squad.filter(player=>m.initialLineupIds.includes(player.id)).sort((a,b)=>b.overall-a.overall),save.role==="player"?save.controlledId:null,save.coachProfile?.name||save.clubId).name;
    m.opponentFormation||=chooseFormationPlayers(m.opponentPlayers.filter(player=>m.opponentInitialLineupIds.includes(player.id)).sort((a,b)=>b.overall-a.overall),null,opponentProfile.name,{profile:opponentProfile}).name;
    m.liveRatings||=Object.fromEntries([...m.initialLineupIds,...m.initialBenchIds].map(id=>[id,6]));
    m.opponentRatings||=Object.fromEntries(m.opponentPlayers.map(player=>[player.id,6]));
    m.playerEvents||={};m.opponentEvents||={};m.substitutions||=[];m.dismissals||=[];
    m.controlledMatchPlan||="balanced";m.playerPlanTimeline=Array.isArray(m.playerPlanTimeline)?m.playerPlanTimeline:[{minute:0,plan:m.controlledMatchPlan}];m.playerPlanMinutes||={};m.lastPlayerPlanChangeMinute??=-10;
    [...m.initialLineupIds,...m.initialBenchIds].forEach(id=>ensureMatchEvent(m.playerEvents,id));
    m.opponentPlayers.forEach(player=>ensureMatchEvent(m.opponentEvents,player.id));
    m.stats||={ours:{shots:Number(m.shots)||0,onTarget:0,corners:0,fouls:0,xg:0,yellow:0,red:0},opponent:{shots:0,onTarget:0,corners:0,fouls:0,xg:0,yellow:0,red:0}};
    m.stats.ours||={shots:Number(m.shots)||0,onTarget:0,corners:0,fouls:0,xg:0,yellow:0,red:0};
    m.stats.opponent||={shots:0,onTarget:0,corners:0,fouls:0,xg:0,yellow:0,red:0};
    [m.stats.ours,m.stats.opponent].forEach(stats=>{stats.shots??=0;stats.onTarget??=0;stats.corners??=0;stats.fouls??=0;stats.xg??=0;stats.yellow??=0;stats.red??=0;});
  }

  function startMatch() {
    const fixture=nextFixture(); if(!fixture||state.retired)return;
    state.date=fixture.date;
    const tactic=state.role==="coach"?state.tactic:chooseAiTactic(fixture);
    const career=state.role==="player"?ensurePlayerCareer():null,coachEffect=state.role==="coach"?coachMatchEffect():null,controlledMatchPlan=career&&career.matchPlanFixtureId===fixture.id?career.matchPlan:"balanced",selection=selectMatchLineup(fixture,tactic),lineupIds=selection.lineup.map(player=>player.id),benchIds=selection.bench.map(player=>player.id),playerEvents=Object.fromEntries([...lineupIds,...benchIds].map(id=>[id,emptyMatchEvent()]));
    const playerRoleNote=selection.controlledSelection?` ${state.person}${selection.controlledSelection.label}：${selection.controlledSelection.reason}。`:"";
    const matchPlanNote=career?` 个人比赛计划：${PLAYER_MATCH_PLANS[controlledMatchPlan].label}。`:"",coachPlanNote=coachEffect?.sources?.length?` 已落实赛前准备：${coachEffect.sources.join("、")}。`:"",opening=`主裁判吹响开场哨，球队排出 ${selection.formation}，采用${({balanced:"平衡控制",press:"高位逼抢",counter:"快速反击",defensive:"稳守阵型"})[tactic]}。${selection.dense?` 面对密集赛程，AI 教练轮换了 ${selection.rotated} 名常规主力。`:""}${playerRoleNote}${matchPlanNote}${coachPlanNote}`;
    const performanceResponse=career?.temporaryBoostMatches>0?{source:career.responseSource||career.temporaryBoostSource||"状态调整",summary:temporaryBoostSummary(career),boosts:{...(career.temporaryAttributeBoosts||{})},matches:Number(career.temporaryBoostMatches||0)}:null;
    state.activeMatch={fixture,tactic,formation:selection.formation,controlledMatchPlan,performanceResponse,coachEffect,playerPlanTimeline:[{minute:0,plan:controlledMatchPlan}],playerPlanMinutes:{},lastPlayerPlanChangeMinute:-10,ourPlayers:fixture.international?selection.pool:null,minute:0,home:0,away:0,possession:clamp((tactic==="press"?55:tactic==="defensive"?43:51)+Number(coachEffect?.possession||0),30,70),shots:0,tactical:clamp(70+Number(coachEffect?.tactical||0),45,98),fitness:Math.round(selection.lineup.reduce((s,p)=>s+p.fitness,0)/Math.max(1,selection.lineup.length)),playerRating:6,ballX:50,ballY:50,finished:false,commentary:[{minute:0,text:opening}],decisionBonus:0,decisionRisk:0,lineupIds,initialLineupIds:[...lineupIds],benchIds,initialBenchIds:[...benchIds],playerEvents,liveRatings:Object.fromEntries([...lineupIds,...benchIds].map(id=>[id,6])),denseSchedule:selection.dense,rotationCount:selection.rotated,controlledSelection:selection.controlledSelection,mvpId:null,aiCoachProfiles:{ours:selection.coachProfile},aiLastSubMinute:{ours:-20,opponent:-20},aiLastTacticalMinute:{ours:-20,opponent:-20},aiNextTacticalMinute:{ours:Math.round(rand(24,38)),opponent:Math.round(rand(24,38))},aiTacticalPlans:{ours:"balanced",opponent:"balanced"},stats:{ours:{shots:0,onTarget:0,corners:0,fouls:0,xg:0,yellow:0,red:0},opponent:{shots:0,onTarget:0,corners:0,fouls:0,xg:0,yellow:0,red:0}},speed:1,paused:true,pauseReason:"kickoff",pendingTalk:null,halfTimeTalkDone:false,postMatchTalkDone:false,stoppageTime:null,heatmap:{},selectedHeatmapPlayer:lineupIds.includes(state.controlledId)?state.controlledId:lineupIds[0],visualTick:0,visualAction:{team:"ours",kind:"build",label:"开球准备",startedAt:Date.now()},narrativeSeed:Math.random()};
    ensureMatchRuntime(state,state.activeMatch);
    saveState(); render();
  }

  function chooseAiTactic(fixture) {
    const fitness=state.squad.reduce((sum,player)=>sum+player.fitness,0)/Math.max(1,state.squad.length),profile=aiCoachProfile(state,state.clubId,clubById(state.clubId).coach||state.clubId),club=clubById(state.clubId),opponent=findClubByName(fixture.opponent),strengthEdge=club.prestige-(opponent?.prestige||78);
    if(fitness<72)return "defensive";
    if(strengthEdge>=7&&fixture.home&&profile.risk>.38)return "press";
    if(strengthEdge<=-6)return profile.risk>.62?"counter":"defensive";
    return profile.risk>.62?"press":profile.risk<.34?"counter":"balanced";
  }

  function registerControlledDecisionGoal(m,player) {
    scoreForUs(m);addPlayerEvent(m,player,"goals",1.2);m.lastGoalDetail={team:"ours",scorerId:player.id,scorerName:player.name,assisterId:null,assisterName:null};return player;
  }

  function resolvePlayerDecision(m,decision,event) {
    const player=controlledPlayer(),resolution=decision.resolution,e=decision.effect;if(!player||!resolution)return {success:true,text:decision.text||decision.label};
    const attribute=Number(player[resolution.skill]??player.overall??70),chance=clamp(resolution.chance+(attribute-70)*.004+(m.fitness-70)*.0015-Math.max(0,e.risk)*.004,0.24,.93),success=Math.random()<chance;
    const playerMatchEvent=ensureMatchEvent(m.playerEvents,player.id),requestedRating=success?resolution.win:resolution.lose;
    const ratingDelta=requestedRating>0?Math.min(requestedRating,Math.max(0,1.25-Number(playerMatchEvent.decisionRating||0))):requestedRating;
    playerMatchEvent.decisionRating=Number((Number(playerMatchEvent.decisionRating||0)+ratingDelta).toFixed(2));
    m.possession=clamp(m.possession+(success?e.possession:-Math.sign(e.possession)*Math.min(2,Math.abs(e.possession))),30,70);
    m.fitness=clamp(m.fitness+e.fitness,30,100);
    m.decisionBonus=clamp(m.decisionBonus+(success?e.bonus:Math.min(0,e.bonus-3)),-5,20);
    m.decisionRisk=clamp((m.decisionRisk||0)+(success?e.risk:Math.max(2,Math.abs(e.risk)*.7)),-8,18);
    adjustRating(m.liveRatings,player.id,ratingDelta);m.playerRating=Number(m.liveRatings[player.id]||m.playerRating);
    const ours=m.stats.ours,opponent=m.stats.opponent,stat=resolution.stat;
    let outcomeText=success?resolution.successText:resolution.failureText,scored=false,conceded=false;
    if(["shot","dribbleShot"].includes(stat)){
      const shotXg=stat==="dribbleShot" ? .32 : .17;ours.shots++;ours.xg=Number((ours.xg+shotXg).toFixed(2));m.shots=ours.shots;
      if(success){ours.onTarget++;const goalChance=(stat==="dribbleShot" ? .31 : .19)+(Number(player.shooting||player.overall)-70)/250;if(Math.random()<goalChance){registerControlledDecisionGoal(m,player);scored=true;outcomeText=`进球！${player.name} 的选择直接改写了比分。`;}}
    }else if(["pass","cross"].includes(stat)&&success&&Math.random()<.34){ours.shots++;ours.xg=Number((ours.xg+(stat==="cross" ? .12 : .16)).toFixed(2));if(Math.random()<.42)ours.onTarget++;m.shots=ours.shots;}
    if(stat==="save"){
      opponent.shots++;opponent.onTarget++;opponent.xg=Number((opponent.xg+(event?.threat||.2)).toFixed(2));
      if(success)playerMatchEvent.saves++;
      if(!success&&Math.random()<(event?.threat||.25)){const scorer=registerOpponentGoal(m);conceded=true;outcomeText=`${resolution.failureText} ${scorer.name} 抓住机会完成进球。`;}
    }else if(!success&&["clear","tackle","intercept","distribution"].includes(stat)&&Math.random()<(event?.threat||.2)*.6){opponent.shots++;opponent.xg=Number((opponent.xg+.11).toFixed(2));if(Math.random()<.3)opponent.onTarget++;}
    if(["tackle","intercept","clear"].includes(stat))recordDefensiveAction(m,false,player,({intercept:"interception",clear:"clearance"})[stat]||stat,success,0);
    if(stat==="foul"){m.stats.ours.fouls++;if(!success&&Math.random()<.55){const playerEvent=m.playerEvents[player.id]||{};if(!playerEvent.yellow&&!playerEvent.red){addPlayerEvent(m,player,"yellow",-.25);outcomeText+=` ${player.name} 领到黄牌。`;}}}
    const mark=ratingDelta>=0?`+${ratingDelta.toFixed(2)}`:ratingDelta.toFixed(2);
    return {success,scored,conceded,text:`${event?.title||"关键场景"}：${outcomeText} 个人评分 ${mark}。`};
  }

  function applyDecision(type) {
    const m=state.activeMatch; if(!m||m.finished)return;
    if(state.role==="player"&&!(m.lineupIds||[]).includes(state.controlledId)){toast("你未进入本场比赛名单");return;}
    const event=ensureDecisionEvent(m),decision=matchDecisions(m).find(item=>item.id===type);if(!decision||!event)return;
    const e=decision.effect;
    let resultText;
    if(state.role==="coach"){
      m.possession=clamp(m.possession+e.possession,30,70);m.fitness=clamp(m.fitness+e.fitness,30,100);m.decisionBonus=clamp(m.decisionBonus+e.bonus,-5,20);m.decisionRisk=clamp((m.decisionRisk||0)+e.risk,-8,18);m.tactical=clamp(m.tactical+e.tactical*.7,45,98);resultText=decision.text;
    }else resultText=resolvePlayerDecision(m,decision,event).text;
    m.lastDecisionMinute=m.minute;m.nextDecisionMinute=Math.min(88,m.minute+Math.round(rand(8,16)));m.decisionEvent=null;m.pauseReason=null;m.paused=false;m.commentary.push({minute:m.minute,text:resultText});saveState();render();
  }

  function performSubstitution(m,teamKey,outId,inId,reason="战术调整") {
    const opponent=teamKey==="opponent",lineup=opponent?m.opponentLineupIds:m.lineupIds,bench=opponent?m.opponentBenchIds:m.benchIds;
    const substitutions=m.substitutions.filter(item=>item.team===teamKey);if(substitutions.length>=5)return false;
    const outIndex=lineup.indexOf(outId),inIndex=bench.indexOf(inId);if(outIndex<0||inIndex<0||outId===inId)return false;
    const players=opponent?m.opponentPlayers:matchOurPlayers(m),outPlayer=players.find(player=>player.id===outId),inPlayer=players.find(player=>player.id===inId);if(!outPlayer||!inPlayer)return false;
    lineup[outIndex]=inId;bench.splice(inIndex,1);
    if(opponent){m.opponentRatings[inId]??=6;ensureMatchEvent(m.opponentEvents,inId);}
    else{m.liveRatings[inId]??=6;ensureMatchEvent(m.playerEvents,inId);}
    m.substitutions.push({team:teamKey,minute:m.minute,outId,inId,outName:outPlayer.name,inName:inPlayer.name,reason});
    m.aiLastSubMinute||={ours:-20,opponent:-20};m.aiLastSubMinute[teamKey]=m.minute;
    m.commentary.push({minute:m.minute,text:`${opponent?m.fixture.opponent:clubById(state.clubId).name} 换人：${inPlayer.name} 换下 ${outPlayer.name}（${reason}）。`});
    return true;
  }

  function makeManualSubstitution() {
    const m=state.activeMatch;if(!m||m.finished||state.role!=="coach")return;
    const outId=document.getElementById("sub-out")?.value,inId=document.getElementById("sub-in")?.value;
    const outPlayer=matchOurPlayers(m).find(player=>player.id===outId),inPlayer=matchOurPlayers(m).find(player=>player.id===inId);
    if(!outPlayer||!inPlayer||(outPlayer.position==="GK")!==(inPlayer.position==="GK")){toast("门将只能与门将互换");return;}
    if(!performSubstitution(m,"ours",outId,inId,"教练指令")){toast("无法完成这次换人");return;}
    saveState();render();toast("换人已经生效");
  }

  function syncSubstitutionOptions() {
    const out=document.getElementById("sub-out"),incoming=document.getElementById("sub-in");if(!out||!incoming)return;
    const outPosition=out.selectedOptions[0]?.dataset.position;
    [...incoming.options].forEach(option=>{option.disabled=(outPosition==="GK")!==(option.dataset.position==="GK");});
    if(incoming.selectedOptions[0]?.disabled){const first=[...incoming.options].find(option=>!option.disabled);if(first)incoming.value=first.value;}
  }

  function matchScoreDifference(m,teamKey) {
    const ours=m.fixture.home?m.home:m.away,theirs=m.fixture.home?m.away:m.home,difference=ours-theirs;
    return teamKey==="ours"?difference:-difference;
  }

  function matchPlayerEnergy(player,m,teamKey) {
    const entered=m.substitutions.find(item=>item.team===teamKey&&item.inId===player.id)?.minute??0,minutes=Math.max(0,m.minute-entered);
    const controlled=teamKey==="ours"&&state.role==="player"&&player.id===state.controlledId,plan=controlled?PLAYER_MATCH_PLANS[m.controlledMatchPlan||"balanced"]:null;
    const roleDrain=(player.position==="GK"?.035:["RWB","LWB","RM","LM"].includes(player.position)?.158:["RB","LB","RW","LW","CM"].includes(player.position)?.145:.105)*Number(plan?.fatigue||1);
    return clamp(Number(player.fitness||88)-minutes*roleDrain,32,100);
  }

  function aiSubstitutionRoleFit(inPlayer,outPlayer,mode) {
    const incomingUnit=positionUnit(inPlayer.position),samePosition=inPlayer.position===outPlayer.position,sameUnit=incomingUnit===positionUnit(outPlayer.position),slotFit=positionSlotFit(inPlayer.position,outPlayer.position),base=samePosition?15:slotFit>0?slotFit:sameUnit?4:-15;
    if(mode==="attack")return base+(incomingUnit==="attack"?12:incomingUnit==="midfield"?5:-5);
    if(mode==="protect")return base+(incomingUnit==="defence"?12:incomingUnit==="midfield"?5:-5);
    return base;
  }

  function chooseAiSubstitution(m,teamKey,context={}) {
    const opponent=teamKey==="opponent",lineup=opponent?m.opponentLineupIds:m.lineupIds,bench=opponent?m.opponentBenchIds:m.benchIds,players=opponent?m.opponentPlayers:matchOurPlayers(m),ratings=opponent?m.opponentRatings:m.liveRatings,events=opponent?m.opponentEvents:m.playerEvents;
    if(!lineup.length||!bench.length)return false;
    const profile=m.aiCoachProfiles?.[teamKey]||aiCoachProfile(state,opponent?(findClubByName(m.fixture.opponent)?.id||m.fixture.opponent):state.clubId,opponent?m.fixture.opponent:null),difference=matchScoreDifference(m,teamKey),minute=m.minute;
    const mode=difference<0&&minute>=52?"attack":difference>0&&minute>=68?"protect":"balance";
    const substitutionIds=new Set(m.substitutions.filter(item=>item.team===teamKey).flatMap(item=>[item.inId,item.outId]));
    const active=lineup.map(id=>players.find(player=>player.id===id)).filter(Boolean).filter(player=>player.position!=="GK");
    const eligibleOut=active.filter(player=>{
      const entrance=m.substitutions.find(item=>item.team===teamKey&&item.inId===player.id);
      if(!entrance)return true;
      const minutesSinceEntrance=minute-entrance.minute,emergency=Boolean(player.injured||player.matchInjured)||Number(events[player.id]?.red||0)>0||matchPlayerEnergy(player,m,teamKey)<42;
      return emergency||minutesSinceEntrance>=35&&Number(ratings[player.id]||6)<5.25;
    });
    if(!eligibleOut.length)return false;
    const outgoing=eligibleOut.map(player=>{
      const event=events[player.id]||{},energy=matchPlayerEnergy(player,m,teamKey),rating=Number(ratings[player.id]||6),unit=positionUnit(player.position),injured=Boolean(player.injured||player.matchInjured);
      let urgency=(injured?70:0)+(72-energy)*.18+(6.25-rating)*4+(event.yellow?1.8:0)+(event.red?30:0)+(event.mistakes||0)*4;
      if(mode==="attack")urgency+=unit==="defence"?2.3:unit==="attack"&&rating>=6.7?-2.5:0;
      if(mode==="protect")urgency+=unit==="attack"?2.2:unit==="defence"&&rating>=6.7?-2.5:0;
      if(substitutionIds.has(player.id))urgency-=18;
      return {player,energy,rating,event,injured,urgency};
    }).sort((a,b)=>b.urgency-a.urgency);
    const out=outgoing[0];if(!out)return false;
    const available=bench.map(id=>players.find(player=>player.id===id)).filter(Boolean).filter(player=>player.position!=="GK");
    const incoming=available.map(player=>{
      const fit=aiSubstitutionRoleFit(player,out.player,mode),energy=Number(player.fitness||88),growth=Math.max(0,Number(player.potential||player.overall)-Number(player.overall||0));
      return {player,score:fit+Number(player.overall||68)*.32+energy*.12+(player.age<=22?profile.youthTrust*growth*.16:0)};
    }).filter(item=>item.score>(context.forced?10:20)).sort((a,b)=>b.score-a.score)[0];
    if(!incoming)return false;
    const upgrade=incoming.score-(Number(out.player.overall||68)*.32+out.energy*.12),urgencyThreshold=minute>=82?-.5:mode!=="balance"&&minute>=65?.8:2.5;
    if(out.urgency+upgrade*.25<urgencyThreshold&&!context.forced)return false;
    const reason=out.injured?"伤病被迫调整":out.event.red?"红牌后调整阵型":out.event.yellow&&minute>=55?"规避第二张黄牌":out.energy<62?"体能下降":mode==="attack"?"加强进攻":mode==="protect"?"稳固防守":out.rating<5.8?"改善场上表现":"保持比赛强度";
    return performSubstitution(m,teamKey,out.player.id,incoming.player.id,reason);
  }

  function ensureAiSubstitutionPlan(m,teamKey) {
    m.aiSubstitutionPlans||={};
    if(m.aiSubstitutionPlans[teamKey])return m.aiSubstitutionPlans[teamKey];
    const profile=m.aiCoachProfiles?.[teamKey]||coachDecisionProfile(teamKey),dense=teamKey==="ours"&&Boolean(m.denseSchedule);
    const firstMinute=clamp(Math.round(57+rand(-7,7)-profile.substitutionActivity*4-(dense?3:0)),48,64);
    return m.aiSubstitutionPlans[teamKey]={nextMinute:firstMinute,appetite:rand(-4,5),createdMinute:m.minute,lastReason:"观察比赛"};
  }

  function aiSubstitutionSignals(m,teamKey) {
    const opponent=teamKey==="opponent",ids=opponent?m.opponentLineupIds:m.lineupIds,players=opponent?m.opponentPlayers:matchOurPlayers(m),ratings=opponent?m.opponentRatings:m.liveRatings,events=opponent?m.opponentEvents:m.playerEvents;
    const active=ids.map(id=>players.find(player=>player.id===id)).filter(player=>player&&player.position!=="GK");
    const energies=active.map(player=>matchPlayerEnergy(player,m,teamKey)),criticalEnergy=energies.filter(value=>value<56).length,tired=energies.filter(value=>value<64).length;
    const cardRisk=active.filter(player=>Boolean(events[player.id]?.yellow)&&matchPlayerEnergy(player,m,teamKey)<76).length,poor=active.filter(player=>Number(ratings[player.id]||6)<5.55).length,injuryRisk=active.filter(player=>Boolean(player.injured||player.matchInjured)).length;
    return {criticalEnergy,tired,cardRisk,poor,injuryRisk,difference:matchScoreDifference(m,teamKey)};
  }

  function aiSubstitutionDemand(m,teamKey,count,plan,profile,signals) {
    const opponent=teamKey==="opponent",bench=opponent?m.opponentBenchIds:m.benchIds,dense=teamKey==="ours"&&Boolean(m.denseSchedule);
    const elapsed=clamp((m.minute-50)/37,0,1),losing=signals.difference<0,leading=signals.difference>0;
    let demand=elapsed*34+profile.substitutionActivity*13+plan.appetite+(dense?4:0);
    demand+=signals.tired*1.35+signals.criticalEnergy*5.5+signals.cardRisk*7+signals.poor*2.3;
    if(losing&&m.minute>=55)demand+=6+Math.min(6,Math.abs(signals.difference)*2);
    if(leading&&m.minute>=72)demand+=2.5;
    if(m.minute>=82)demand+=2;if(m.minute>=88)demand+=2.5;
    const thresholds=[9,18,27,35,43],desired=thresholds.filter(value=>demand>=value).length;
    const emergency=signals.injuryRisk>0||signals.cardRisk>0||signals.criticalEnergy>0||signals.poor>=2&&m.minute>=54;
    return Math.min(5,(bench||[]).length,emergency?Math.max(count+1,desired):desired);
  }

  function maybeAutoSubstitutions(m) {
    const consider=teamKey=>{
      const count=m.substitutions.filter(item=>item.team===teamKey).length;if(count>=5||m.minute<48||m.minute>90)return;
      const plan=ensureAiSubstitutionPlan(m,teamKey),profile=m.aiCoachProfiles?.[teamKey]||coachDecisionProfile(teamKey),signals=aiSubstitutionSignals(m,teamKey),desired=aiSubstitutionDemand(m,teamKey,count,plan,profile,signals),remaining=Math.max(0,desired-count);if(!remaining)return;
      const emergency=signals.injuryRisk>0||signals.cardRisk>0||signals.criticalEnergy>0||signals.poor>=2&&m.minute>=54,urgentScore=signals.difference<0&&m.minute>=55,protectLead=signals.difference>0&&m.minute>=68;
      if(urgentScore)plan.nextMinute=Math.min(plan.nextMinute,m.minute+Math.round(rand(0,5)));
      if(emergency)plan.nextMinute=Math.min(plan.nextMinute,m.minute);
      if(m.minute<plan.nextMinute&&!emergency)return;
      let batch=1;
      if(remaining>=2&&m.minute>=70&&(signals.difference<=-2||signals.criticalEnergy>=2||signals.cardRisk>=2)&&Math.random()<.58)batch=2;
      let completed=0;
      while(completed<batch&&chooseAiSubstitution(m,teamKey,{forced:true})){completed++;}
      if(!completed){plan.nextMinute=m.minute+2;return;}
      const stateDelay=urgentScore?-2:protectLead?2:signals.tired>=3?-1:0,baseDelay=rand(5,11)+(1-profile.substitutionActivity)*3+stateDelay;
      plan.nextMinute=m.minute>=88?90:clamp(Math.round(m.minute+baseDelay),m.minute+2,90);plan.lastReason=emergency?"球员状态":urgentScore?"追赶比分":protectLead?"保护领先":"比赛节奏";
    };
    consider("opponent");if(state.role==="player"||m.skipMode)consider("ours");
  }

  function maybeAiTacticalAdjustments(m) {
    const adjust=teamKey=>{
      if(m.minute<18||m.minute>90)return;
      m.aiLastTacticalMinute||={ours:-20,opponent:-20};m.aiNextTacticalMinute||={ours:Math.round(rand(24,38)),opponent:Math.round(rand(24,38))};
      const difference=matchScoreDifference(m,teamKey),profile=m.aiCoachProfiles?.[teamKey]||coachDecisionProfile(teamKey),late=m.minute>=70,opponent=teamKey==="opponent",ourStats=m.stats[teamKey],theirStats=m.stats[opponent?"ours":"opponent"],teamPossession=opponent?100-m.possession:m.possession;
      const teamDismissals=(m.dismissals||[]).filter(item=>item.team===teamKey).length,theirDismissals=(m.dismissals||[]).filter(item=>item.team!==teamKey).length,xgEdge=Number(ourStats.xg||0)-Number(theirStats.xg||0),urgent=teamDismissals!==theirDismissals||m.minute>=58&&Math.abs(difference)>=2||m.minute>=74&&difference!==0;
      if(m.minute<Number(m.aiNextTacticalMinute[teamKey]||30)&&!urgent)return;
      if(m.minute-Number(m.aiLastTacticalMinute[teamKey]??-20)<(urgent?7:11))return;
      m.aiNextTacticalMinute[teamKey]=m.minute+Math.round(rand(urgent?7:11,urgent?13:20));
      let key="balanced",label="保持平衡",possession=0,bonus=0,risk=0;
      if(teamDismissals>theirDismissals){key="counter";label="少一人后压缩阵型寻找反击";possession=-2;bonus=1;risk=-3;}
      else if(theirDismissals>teamDismissals&&difference<=0){key="push";label="利用人数优势扩大进攻宽度";possession=2;bonus=2;risk=2;}
      else if(difference<0&&(late||profile.risk>.56||xgEdge<-.55)){key="press";label=difference<=-2?"增加前场人数全力追分":"提高压迫强度";possession=2;bonus=3;risk=4;}
      else if(difference>0&&late){key="protect";label="降低防线风险保护领先";possession=-1;bonus=-1;risk=-4;}
      else if(difference===0&&late&&profile.risk>.58){key="push";label="主动争取制胜球";possession=1;bonus=2;risk=3;}
      else if(teamPossession<43&&xgEdge<-.25){key=profile.risk>.5?"press":"counter";label=key==="press"?"前移阵线争夺中场":"减少无效控球转向快速反击";possession=key==="press"?2:-1;bonus=2;risk=key==="press"?3:-2;}
      else if(profile.risk<.34){key="counter";label="降低节奏等待反击";possession=-1;bonus=1;risk=-2;}
      m.aiTacticalPlans||={ours:"balanced",opponent:"balanced"};if(m.aiTacticalPlans[teamKey]===key)return;
      const direction=teamKey==="ours"?1:-1;m.possession=clamp(m.possession+possession*direction,30,70);m.decisionBonus=clamp(m.decisionBonus+bonus*direction,-8,20);m.decisionRisk=clamp((m.decisionRisk||0)+risk,-12,18);
      m.aiLastTacticalMinute[teamKey]=m.minute;m.aiTacticalPlans[teamKey]=key;
      m.commentary.push({minute:m.minute,text:`${teamKey==="ours"?clubById(state.clubId).name:m.fixture.opponent} 教练组作出调整：${label}。`});
    };
    adjust("opponent");if(state.role==="player"||m.skipMode)adjust("ours");
  }

  function defensiveRoleWeight(position) {
    if(position==="CB")return 6;
    if(["RB","LB","DM"].includes(position))return 4.5;
    if(["RWB","LWB"].includes(position))return 3.8;
    if(position==="CM")return 2.6;
    if(["RM","LM"].includes(position))return 2.4;
    if(position==="GK")return .35;
    return 1;
  }

  function defensiveAbility(player) {
    return matchAttribute(player,"defending");
  }

  function matchAttribute(player,key) {
    const modifiers={
      pace:{GK:-18,CB:-3,RB:6,LB:6,RWB:8,LWB:8,DM:-2,CM:2,RM:7,LM:7,AM:5,RW:9,LW:9,ST:5,CF:5},
      shooting:{GK:-28,CB:-16,RB:-9,LB:-9,RWB:-5,LWB:-5,DM:-7,CM:-2,RM:0,LM:0,AM:5,RW:7,LW:7,ST:12,CF:8},
      passing:{GK:-2,CB:-3,RB:2,LB:2,RWB:4,LWB:4,DM:5,CM:8,RM:6,LM:6,AM:9,RW:4,LW:4,ST:-4,CF:5},
      dribbling:{GK:-22,CB:-9,RB:3,LB:3,RWB:6,LWB:6,DM:-2,CM:3,RM:7,LM:7,AM:9,RW:11,LW:11,ST:4,CF:7},
      defending:{GK:-12,CB:11,RB:7,LB:7,RWB:4,LWB:4,DM:9,CM:3,RM:-1,LM:-1,AM:-9,RW:-13,LW:-13,ST:-16,CF:-14},
      physical:{GK:1,CB:8,RB:3,LB:3,RWB:4,LWB:4,DM:5,CM:3,RM:2,LM:2,AM:-1,RW:0,LW:0,ST:6,CF:3},
      goalkeeping:{GK:8}
    };
    const directKey=key==="goalkeeping"?null:key,direct=directKey?Number(player[directKey]):NaN;
    if(Number.isFinite(direct)&&direct>0)return clamp(direct,1,99);
    const modifier=modifiers[key]?.[player.position]||0;
    if(key==="goalkeeping"){
      if(player.position!=="GK")return clamp(Number(player.overall||55)-30,1,60);
      const attributes=["reflexes","handling","oneOnOnes","positioning","concentration"].map(attribute=>Number(player[attribute])).filter(value=>Number.isFinite(value)&&value>0);
      if(attributes.length)return clamp(attributes.reduce((sum,value)=>sum+value,0)/attributes.length,1,99);
    }
    return profileAttribute(player,key,modifier,directKey);
  }

  function effectiveMatchAttribute(player,key,m,teamKey) {
    const base=matchAttribute(player,key),energy=matchPlayerEnergy(player,m,teamKey),morale=Number(player.morale??75);
    const controlled=teamKey==="ours"&&state.role==="player"&&player.id===state.controlledId,career=controlled?ensurePlayerCareer():null,plan=controlled?PLAYER_MATCH_PLANS[m.controlledMatchPlan||"balanced"]:null;
    const chemistryBoost=career&&["passing","dribbling","pace"].includes(key)?(career.chemistry-60)*.025:0,relationshipBoost=career&&["passing","dribbling","pace"].includes(key)?(Number(career.relationships?.teammates||50)-50)*.012:0,planBoost=Number(plan?.attributes?.[key]||0),temporaryBoost=career&&career.temporaryBoostMatches>0?Number(career.temporaryAttributeBoosts?.[key]||0):0,mentalBoost=career?(career.confidence-60)*.035+(career.tactical-60)*.025-(career.pressure-35)*.028+chemistryBoost+relationshipBoost+Number(career.responseMomentum||0)*.18:0;
    return clamp(base+(energy-78)*.075+(morale-75)*.025+planBoost+temporaryBoost+mentalBoost,25,99);
  }

  function controlledPlayerInvolvementBoost(m,creator=false) {
    if(state.role!=="player")return 1;const career=ensurePlayerCareer(),confidence=Number(career?.confidence||60),chemistry=Number(career?.chemistry||60),momentum=Number(career?.responseMomentum||0),temporary=Number(career?.temporaryBoostMatches||0)>0;
    return clamp(1.08+(confidence-60)*.002+(creator?(chemistry-60)*.0015:0)+momentum*.045+(temporary?.04:0),1.02,1.46);
  }

  function pickDefensivePlayer(players) {
    const weighted=players.map(player=>({player,weight:defensiveRoleWeight(player.position)*(1+(defensiveAbility(player)-65)/80)}));
    const total=weighted.reduce((sum,item)=>sum+item.weight,0);let cursor=Math.random()*total;
    for(const item of weighted){cursor-=item.weight;if(cursor<=0)return item.player;}
    return weighted.at(-1)?.player;
  }

  function recordDefensiveAction(m,opponent,player,action,success,ratingDelta) {
    if(!player)return;
    const events=opponent?m.opponentEvents:m.playerEvents,ratings=opponent?m.opponentRatings:m.liveRatings,event=ensureMatchEvent(events,player.id);
    if(action==="tackle"){event.tackles++;event.duels++;if(success){event.tacklesWon++;event.duelsWon++;}}
    else if(action==="duel"){event.duels++;if(success)event.duelsWon++;}
    else if(success&&action==="interception")event.interceptions++;
    else if(success&&action==="clearance")event.clearances++;
    else if(success&&action==="block")event.blocks++;
    const requested=Number(ratingDelta)||0,current=Number(event.defensiveRating||0),applied=requested>0?Math.min(requested,Math.max(0,1.7-current)):requested;
    event.defensiveRating=Number((current+applied).toFixed(2));event.ratingDelta=Number((Number(event.ratingDelta||0)+applied).toFixed(2));
    adjustRating(ratings,player.id,applied);
    if(!opponent&&player.id===state.controlledId)m.playerRating=Number(m.liveRatings[player.id]||m.playerRating);
  }

  function simulateDefensiveActions(m,opponent) {
    const ids=opponent?m.opponentLineupIds:m.lineupIds,players=opponent?m.opponentPlayers:matchOurPlayers(m);
    const active=ids.map(id=>players.find(player=>player.id===id)).filter(Boolean);if(!active.length)return;
    const pressure=opponent?m.possession:100-m.possession,attempts=1+(Math.random()<clamp((pressure-38)/100,.08,.34)?1:0);
    for(let index=0;index<attempts;index++){
      const player=pickDefensivePlayer(active);if(!player)continue;
      const roll=Math.random(),action=roll<.31?"tackle":roll<.54?"interception":roll<.74?"duel":roll<.91?"clearance":"block";
      const teamKey=opponent?"opponent":"ours",ability=effectiveMatchAttribute(player,"defending",m,teamKey),physical=effectiveMatchAttribute(player,"physical",m,teamKey),fitness=matchPlayerEnergy(player,m,teamKey);
      const successChance=clamp(.52+(ability-68)*.006+(physical-68)*.002+(fitness-70)*.0015, .4,.87),success=Math.random()<successChance;
      const reward=({tackle:.085,interception:.075,duel:.055,clearance:.06,block:.12})[action]+Math.max(0,pressure-50)/700;
      recordDefensiveAction(m,opponent,player,action,success,success?reward:["tackle","duel"].includes(action)?-.025:-.012);
    }
  }

  function registerGoalkeeperSave(m,opponent,shotXg=.12) {
    const ids=opponent?m.opponentLineupIds:m.lineupIds,players=opponent?m.opponentPlayers:matchOurPlayers(m);
    const keeper=ids.map(id=>players.find(player=>player.id===id)).find(player=>player?.position==="GK");if(!keeper)return null;
    const event=ensureMatchEvent(opponent?m.opponentEvents:m.playerEvents,keeper.id);event.saves++;
    recordDefensiveAction(m,opponent,keeper,"save",true,clamp(.09+Number(shotXg)*.18,.1,.18));return keeper;
  }

  function sideMinutesPlayed(m,playerId,opponent=false) {
    const team=opponent?"opponent":"ours",initial=opponent?m.opponentInitialLineupIds:m.initialLineupIds;
    const entered=(initial||[]).includes(playerId)?0:m.substitutions.find(item=>item.team===team&&item.inId===playerId)?.minute;
    if(entered==null)return 0;const left=m.substitutions.find(item=>item.team===team&&item.outId===playerId)?.minute??m.dismissals?.find(item=>item.team===team&&item.playerId===playerId)?.minute??90;return clamp(left-entered,0,90);
  }

  function applyCleanSheetBonuses(m) {
    if(m.cleanSheetBonusesApplied)return;m.cleanSheetBonusesApplied=true;
    const oursConceded=m.fixture.home?m.away:m.home,opponentConceded=m.fixture.home?m.home:m.away;
    const apply=(opponent,conceded)=>{
      if(conceded)return;
      const players=opponent?m.opponentPlayers:matchOurPlayers(m),initial=opponent?m.opponentInitialLineupIds:m.initialLineupIds,team=opponent?"opponent":"ours";
      const ids=[...new Set([...(initial||[]),...m.substitutions.filter(item=>item.team===team).map(item=>item.inId)])];
      ids.forEach(id=>{
        const player=players.find(item=>item.id===id),minutes=sideMinutesPlayed(m,id,opponent);if(!player||minutes<60)return;
        const bonus=player.position==="GK" ? .35 : player.position==="CB" ? .28 : ["RB","LB"].includes(player.position) ? .25 : ["RWB","LWB"].includes(player.position) ? .17 : player.position==="DM" ? .2 : player.position==="CM" ? .08 : 0;
        if(!bonus)return;const event=ensureMatchEvent(opponent?m.opponentEvents:m.playerEvents,id);event.cleanSheets=1;recordDefensiveAction(m,opponent,player,"cleanSheet",true,bonus);
      });
    };
    apply(false,oursConceded);apply(true,opponentConceded);
  }

  function adjustRating(map,id,delta) { if(id!=null)map[id]=Number(clamp(Number(map[id]||6)+delta,1,10).toFixed(2)); }

  function contributionProfile(position) {
    if(position==="GK")return [{stat:"progressivePasses",weight:4,reward:.055,skill:"passing"},{stat:"recoveries",weight:1,reward:.045,skill:"overall"}];
    if(["CB","RB","LB"].includes(position))return [{stat:"recoveries",weight:4,reward:.055,skill:"defending"},{stat:"progressivePasses",weight:3,reward:.045,skill:"passing"},{stat:"pressuresWon",weight:2,reward:.045,skill:"physical"}];
    if(["RWB","LWB"].includes(position))return [{stat:"progressivePasses",weight:3,reward:.05,skill:"passing"},{stat:"successfulDribbles",weight:3,reward:.06,skill:"dribbling"},{stat:"keyPasses",weight:2,reward:.08,skill:"passing"},{stat:"recoveries",weight:2,reward:.05,skill:"defending"}];
    if(position==="DM")return [{stat:"recoveries",weight:4,reward:.06,skill:"defending"},{stat:"progressivePasses",weight:4,reward:.05,skill:"passing"},{stat:"keyPasses",weight:1,reward:.075,skill:"passing"}];
    if(position==="CM")return [{stat:"progressivePasses",weight:4,reward:.055,skill:"passing"},{stat:"keyPasses",weight:3,reward:.08,skill:"passing"},{stat:"chancesCreated",weight:2,reward:.1,skill:"passing"},{stat:"recoveries",weight:2,reward:.05,skill:"defending"}];
    if(["RM","LM"].includes(position))return [{stat:"progressivePasses",weight:3,reward:.05,skill:"passing"},{stat:"successfulDribbles",weight:3,reward:.06,skill:"dribbling"},{stat:"keyPasses",weight:3,reward:.08,skill:"passing"},{stat:"pressuresWon",weight:2,reward:.045,skill:"physical"}];
    if(["AM","RW","LW","CF"].includes(position))return [{stat:"successfulDribbles",weight:4,reward:.065,skill:"dribbling"},{stat:"keyPasses",weight:3,reward:.08,skill:"passing"},{stat:"chancesCreated",weight:3,reward:.1,skill:"passing"},{stat:"pressuresWon",weight:1,reward:.045,skill:"physical"}];
    return [{stat:"pressuresWon",weight:3,reward:.05,skill:"physical"},{stat:"chancesCreated",weight:2,reward:.09,skill:"passing"},{stat:"successfulDribbles",weight:2,reward:.06,skill:"dribbling"},{stat:"keyPasses",weight:1,reward:.075,skill:"passing"}];
  }

  function weightedPick(items,weightOf) {
    const weighted=items.map(item=>({item,weight:Math.max(.01,Number(weightOf(item))||0)})),total=weighted.reduce((sum,entry)=>sum+entry.weight,0);
    let cursor=Math.random()*total;
    for(const entry of weighted){cursor-=entry.weight;if(cursor<=0)return entry.item;}
    return weighted.at(-1)?.item;
  }

  function recordPlayerContribution(m,opponent,player,action,success) {
    const events=opponent?m.opponentEvents:m.playerEvents,ratings=opponent?m.opponentRatings:m.liveRatings,event=ensureMatchEvent(events,player.id);
    const teamKey=opponent?"opponent":"ours",ability=action.skill==="overall"?Number(player.overall||70):effectiveMatchAttribute(player,action.skill,m,teamKey),requested=success?action.reward:-.012,current=Number(event.impactRating||0);
    if(success)event[action.stat]=(event[action.stat]||0)+1;
    const applied=requested>0?Math.min(requested,Math.max(0,1.05-current)):requested;
    event.impactRating=Number((current+applied).toFixed(2));event.ratingDelta=Number((Number(event.ratingDelta||0)+applied).toFixed(2));
    adjustRating(ratings,player.id,applied);
    if(!opponent&&player.id===state.controlledId)m.playerRating=Number(m.liveRatings[player.id]||m.playerRating);
    return ability;
  }

  function simulatePlayerContributions(m,opponent) {
    const ids=opponent?m.opponentLineupIds:m.lineupIds,players=opponent?m.opponentPlayers:matchOurPlayers(m),events=opponent?m.opponentEvents:m.playerEvents;
    const active=ids.map(id=>players.find(player=>player.id===id)).filter(Boolean);if(!active.length)return;
    const possession=opponent?100-m.possession:m.possession,teamKey=opponent?"opponent":"ours",minutesFactor=clamp(.75+(possession-50)*.012,.48,1.35);
    active.forEach(player=>{
      const event=ensureMatchEvent(events,player.id),passing=effectiveMatchAttribute(player,"passing",m,teamKey),roleVolume=({GK:1.15,CB:2.35,RB:1.85,LB:1.85,RWB:1.72,LWB:1.72,DM:2.45,CM:2.55,RM:1.9,LM:1.9,AM:1.8,RW:1.32,LW:1.32,CF:1.65,ST:1.18})[player.position]||1.5,attempted=Math.max(1,Math.round(roleVolume*minutesFactor+rand(0,1.6))),accuracy=clamp(.69+(passing-60)*.0048+(possession-50)*.0015,player.position==="GK"?.62:.68,.96),completed=Array.from({length:attempted}).filter(()=>Math.random()<accuracy).length;
      event.passes+=attempted;event.accuratePasses+=completed;event.possessionLost+=attempted-completed;
    });
    const attempts=1+(Math.random()<.72?1:0)+(Math.random()<.16?1:0);
    for(let index=0;index<attempts;index++){
      const player=weightedPick(active,item=>{
      const event=ensureMatchEvent(events,item.id),profile=contributionProfile(item.position),quality=profile.reduce((sum,action)=>sum+matchAttribute(item,action.skill),0)/profile.length,roleBoost=["CM","RM","LM","AM","RW","LW","ST","CF"].includes(item.position)?1.14:1,controlledBoost=!opponent&&state.role==="player"&&item.id===state.controlledId?controlledPlayerInvolvementBoost(m,true):1;
        return controlledBoost*roleBoost*Math.pow(clamp(quality/70,.55,1.45),2)*(1+Math.min(.35,Number(event.impactRating||0)*.25));
      });
      if(!player)continue;
      const profiles=contributionProfile(player.position),action=weightedPick(profiles,item=>item.weight);
      const ability=action.skill==="overall"?Number(player.overall||70):effectiveMatchAttribute(player,action.skill,m,teamKey),fitness=matchPlayerEnergy(player,m,teamKey);
      const chance=clamp(.55+(ability-68)*.006+(fitness-72)*.0015+(possession-50)*.002,.4,.88);
      const success=Math.random()<chance,event=ensureMatchEvent(events,player.id);if(action.stat==="successfulDribbles")event.dribblesAttempted++;
      if(!success&&["successfulDribbles","progressivePasses","keyPasses"].includes(action.stat))event.possessionLost++;
      recordPlayerContribution(m,opponent,player,action,success);
    }
  }

  function updateLiveRatings(m) {
    m.lineupIds.forEach(id=>adjustRating(m.liveRatings,id,rand(-.025,.035)+(m.possession-50)/7000));
    m.opponentLineupIds.forEach(id=>adjustRating(m.opponentRatings,id,rand(-.025,.035)+(50-m.possession)/7000));
    if(state.role==="player"&&(m.lineupIds||[]).includes(state.controlledId))m.playerRating=Number(m.liveRatings[state.controlledId]||m.playerRating);
  }

  function activeMatchPlayers(m,teamKey) {
    const opponent=teamKey==="opponent",ids=opponent?m.opponentLineupIds:m.lineupIds,players=opponent?m.opponentPlayers:matchOurPlayers(m);
    return ids.map(id=>players.find(player=>player.id===id)).filter(Boolean);
  }

  function attackRoleWeight(position,creator=false) {
    if(creator)return ({GK:.05,CB:.25,RB:.7,LB:.7,RWB:1.15,LWB:1.15,DM:.75,CM:1.3,RM:1.75,LM:1.75,AM:2.15,RW:2.75,LW:2.75,ST:1.9,CF:2.2})[position]||1;
    return ({GK:.02,CB:.22,RB:.45,LB:.45,RWB:.65,LWB:.65,DM:.55,CM:.8,RM:1.05,LM:1.05,AM:1.55,RW:2.05,LW:2.05,ST:3.1,CF:2.8})[position]||1;
  }

  function assistPartnershipWeight(providerPosition,scorerPosition) {
    if(["ST","CF"].includes(scorerPosition))return ["RW","LW"].includes(providerPosition)?1.2:["RM","LM","RWB","LWB"].includes(providerPosition)?1.14:["AM"].includes(providerPosition)?1.1:["ST","CF"].includes(providerPosition)?.86:1;
    if(["RW","LW"].includes(scorerPosition))return ["ST","CF"].includes(providerPosition)?1.38:["RB","LB","RWB","LWB"].includes(providerPosition)?1.12:providerPosition==="AM"?1.06:1;
    if(scorerPosition==="AM")return ["ST","CF"].includes(providerPosition)?1.22:["RW","LW"].includes(providerPosition)?1.12:1;
    return ["ST","CF"].includes(providerPosition)?1.12:["RW","LW","RM","LM"].includes(providerPosition)?1.08:1;
  }

  function teamMatchQuality(m,teamKey,mode) {
    const players=activeMatchPlayers(m,teamKey);if(!players.length)return 60;
    const values=players.map(player=>{
      if(mode==="attack")return effectiveMatchAttribute(player,"passing",m,teamKey)*.42+effectiveMatchAttribute(player,"dribbling",m,teamKey)*.28+effectiveMatchAttribute(player,"pace",m,teamKey)*.15+effectiveMatchAttribute(player,"shooting",m,teamKey)*.15;
      if(player.position==="GK")return effectiveMatchAttribute(player,"goalkeeping",m,teamKey);
      return effectiveMatchAttribute(player,"defending",m,teamKey)*.68+effectiveMatchAttribute(player,"physical",m,teamKey)*.32;
    }).sort((a,b)=>b-a);
    const relevant=mode==="attack"?values.slice(0,7):values.slice(0,8);
    return relevant.reduce((sum,value)=>sum+value,0)/Math.max(1,relevant.length);
  }

  function teamOverallStrength(m,teamKey) {
    const players=activeMatchPlayers(m,teamKey),club=teamKey==="ours"?(m.fixture.international?{prestige:NATIONAL_TEAM_STRENGTH[m.fixture.teamName]||74}:clubById(state.clubId)):(m.fixture.international?{prestige:m.fixture.opponentStrength||74}:findClubByName(m.fixture.opponent));
    if(!players.length)return Number(club?.prestige||65);
    const ability=players.reduce((sum,player)=>sum+Number(player.overall||65),0)/players.length;
    const energy=players.reduce((sum,player)=>sum+matchPlayerEnergy(player,m,teamKey),0)/players.length;
    const numbers=Math.min(0,players.length-11)*3.5;
    const coachBonus=teamKey==="ours"&&state.role==="coach"?Number(m.coachEffect?.strength||0):0;
    return ability*.78+Number(club?.prestige||ability)*.22+(energy-78)*.045+numbers+coachBonus;
  }

  function matchStrengthEdge(m,teamKey) {
    const other=teamKey==="ours"?"opponent":"ours";
    return teamOverallStrength(m,teamKey)-teamOverallStrength(m,other);
  }

  function selectAttackPlayer(m,teamKey,creator=false,exclude=null) {
    const candidates=activeMatchPlayers(m,teamKey).filter(player=>player.position!=="GK"&&player!==exclude);if(!candidates.length)return null;
    return weightedPick(candidates,player=>{
      const passing=effectiveMatchAttribute(player,"passing",m,teamKey),dribbling=effectiveMatchAttribute(player,"dribbling",m,teamKey),pace=effectiveMatchAttribute(player,"pace",m,teamKey),shooting=effectiveMatchAttribute(player,"shooting",m,teamKey);
      const skill=creator?passing*.6+dribbling*.28+pace*.12:shooting*.68+pace*.18+dribbling*.14;
      const opponent=teamKey==="opponent",event=ensureMatchEvent(opponent?m.opponentEvents:m.playerEvents,player.id),usage=creator?Number(event.keyPasses||0):Number(event.shots||0),usageBalance=1/(1+usage*(creator ? .075 : .18)),controlledBoost=teamKey==="ours"&&state.role==="player"&&player.id===state.controlledId?controlledPlayerInvolvementBoost(m,creator):1;
      const partnership=creator&&exclude?assistPartnershipWeight(player.position,exclude.position):1;
      return usageBalance*controlledBoost*attackRoleWeight(player.position,creator)*partnership*Math.pow(clamp(skill/70,.45,1.5),2.35);
    });
  }

  function recordShot(m,teamKey,shooter,onTarget) {
    if(!shooter)return;const opponent=teamKey==="opponent",events=opponent?m.opponentEvents:m.playerEvents,ratings=opponent?m.opponentRatings:m.liveRatings,event=ensureMatchEvent(events,shooter.id);
    event.shots++;if(onTarget)event.onTarget++;
    const delta=onTarget?.035:-.012;event.ratingDelta=Number((Number(event.ratingDelta||0)+delta).toFixed(2));adjustRating(ratings,shooter.id,delta);
    if(!opponent&&shooter.id===state.controlledId)m.playerRating=Number(m.liveRatings[shooter.id]||m.playerRating);
  }

  function recordChanceCreation(m,teamKey,creator,shooter) {
    if(!creator||creator===shooter)return;const opponent=teamKey==="opponent",events=opponent?m.opponentEvents:m.playerEvents,ratings=opponent?m.opponentRatings:m.liveRatings,event=ensureMatchEvent(events,creator.id),passing=effectiveMatchAttribute(creator,"passing",m,teamKey);
    event.keyPasses++;if(Math.random()<clamp(.34+(passing-65)*.009,.28,.78))event.chancesCreated++;
    const delta=.055;event.ratingDelta=Number((Number(event.ratingDelta||0)+delta).toFixed(2));adjustRating(ratings,creator.id,delta);
    if(!opponent&&creator.id===state.controlledId)m.playerRating=Number(m.liveRatings[creator.id]||m.playerRating);
  }

  function simulateTeamAttack(m,teamKey) {
    const opponent=teamKey==="opponent",possession=opponent?100-m.possession:m.possession,attack=teamMatchQuality(m,teamKey,"attack"),defence=teamMatchQuality(m,opponent?"ours":"opponent","defence"),strengthEdge=matchStrengthEdge(m,teamKey),dominance=Math.sign(strengthEdge)*Math.pow(Math.abs(strengthEdge)/10,1.25),plan=m.aiTacticalPlans?.[teamKey]||"balanced",planModifier=({press:.012,push:.02,counter:-.004,protect:-.028,balanced:0})[plan]||0,risk=teamKey==="ours"?Number(m.decisionRisk||0):-Number(m.decisionRisk||0);
    const chance=clamp(.118+(possession-50)*.0016+(attack-defence)*.0025+strengthEdge*.0025+dominance*.008+planModifier+risk*.0012,.035,.29);if(Math.random()>=chance)return false;
    const shooter=selectAttackPlayer(m,teamKey,false);if(!shooter)return false;const creator=selectAttackPlayer(m,teamKey,true,shooter);
    const shooterSkill=effectiveMatchAttribute(shooter,"shooting",m,teamKey),creatorSkill=creator?effectiveMatchAttribute(creator,"passing",m,teamKey):attack,pace=effectiveMatchAttribute(shooter,"pace",m,teamKey),defencePressure=defence-70;
    const xg=clamp(rand(.025,.16)+(shooterSkill-70)*.0015+(creatorSkill-70)*.0008+(pace-70)*.0004-defencePressure*.001+strengthEdge*.0014+Math.max(0,dominance)*.006,.015,.48),stats=m.stats[teamKey];stats.shots++;stats.xg=Number((stats.xg+xg).toFixed(2));if(teamKey==="ours")m.shots=stats.shots;
    const targetChance=clamp(.29+(shooterSkill-68)*.0045+xg*.35-(defence-70)*.0012,.2,.6),onTarget=Math.random()<targetChance;recordShot(m,teamKey,shooter,onTarget);recordChanceCreation(m,teamKey,creator,shooter);
    if(creator&&["AM","RM","LM","RW","LW","CF"].includes(creator.position)&&Math.random()<clamp((effectiveMatchAttribute(creator,"dribbling",m,teamKey)-45)/100,.18,.56)){
      const event=ensureMatchEvent(opponent?m.opponentEvents:m.playerEvents,creator.id);event.successfulDribbles++;
    }
    if(!onTarget){if(xg>=.24)ensureMatchEvent(opponent?m.opponentEvents:m.playerEvents,shooter.id).bigChancesMissed++;const corner=Math.random()<clamp(.2+(defence-65)*.003,.18,.38);if(corner)stats.corners++;setMatchVisualAction(m,teamKey,"shot",`${shooter.name} 完成射门`);const missTemplates=corner?[`${shooter.name} 的射门被后卫封堵后出了底线。`,`${creator&&creator!==shooter?`${creator.name} 送出传球，`:""}${shooter.name} 起脚，防守球员伸腿将球挡出。`,`${shooter.name} 在禁区边缘尝试远射，皮球折射出底线。`]:[`${creator&&creator!==shooter?`${creator.name} 送出传球，`:""}${shooter.name} 的射门稍稍偏出。`,`${shooter.name} 在防守压力下起脚，皮球高出横梁。`,`${shooter.name} 抢到落点，但仓促攻门没有压住。`,`${shooter.name} 从肋部内切后低射，皮球擦柱而出。`];m.commentary.push({minute:m.minute,text:missTemplates[Math.floor(rand(0,missTemplates.length))]});return true;}
    stats.onTarget++;const defendingKey=opponent?"ours":"opponent",keeper=activeMatchPlayers(m,defendingKey).find(player=>player.position==="GK"),keeperSkill=keeper?effectiveMatchAttribute(keeper,"goalkeeping",m,defendingKey):60,finishingEdge=clamp(1+(shooterSkill-keeperSkill)*.008+strengthEdge*.008,.58,1.45),goalChance=clamp(xg*finishingEdge,.015,.62),goal=Math.random()<clamp(goalChance/targetChance,.04,.78);
    if(goal){const scorer=opponent?registerOpponentGoal(m,shooter,creator):registerOurGoal(m,shooter,creator),assisterId=m.lastGoalDetail?.team===teamKey?m.lastGoalDetail.assisterId:null,assister=assisterId?activeMatchPlayers(m,teamKey).find(player=>player.id===assisterId):null,assistLead=assistCommentaryLead(assister,scorer);setMatchVisualAction(m,teamKey,"goal",`${scorer.name} 破门`);m.commentary.push({minute:m.minute,text:`进球！${assistLead?`${assistLead}，`:""}${scorer.name} 用${shooterSkill>=84?"高质量":"果断"}射门攻破球门。`});}
    else{if(xg>=.28)ensureMatchEvent(opponent?m.opponentEvents:m.playerEvents,shooter.id).bigChancesMissed++;registerGoalkeeperSave(m,!opponent,xg);setMatchVisualAction(m,teamKey,"save",`${shooter.name} 的射门被扑出`);m.commentary.push({minute:m.minute,text:`${shooter.name} 的射门命中目标，${keeper?.name||"门将"} 完成扑救。`});}
    return true;
  }

  function stopMatchClock() { if(matchTimer){clearInterval(matchTimer);matchTimer=null;}if(matchCanvasFrame){cancelAnimationFrame(matchCanvasFrame);matchCanvasFrame=null;} }
  function startMatchClock() {
    const m=state?.activeMatch;if(!m||m.finished||m.paused)return;
    const delay=({1:1050,2:520,4:260})[m.speed]||1050;
    matchTimer=setInterval(()=>{if(!state?.activeMatch||state.activeMatch.paused||state.activeMatch.finished){stopMatchClock();return;}advanceMatchMinute();},delay);
  }
  function toggleMatchPlay() { const m=state.activeMatch;if(!m||m.finished||m.pendingTalk)return;m.paused=!m.paused;m.pauseReason=m.paused?"manual":null;saveState();render(); }
  function setMatchSpeed(speed) { const m=state.activeMatch;if(!m)return;m.speed=[1,2,4].includes(Number(speed))?Number(speed):1;saveState();render(); }
  function setLivePlayerPlan(planId) {
    const m=state.activeMatch,plan=PLAYER_MATCH_PLANS[planId];if(!m||state.role!=="player"||!plan||m.finished)return;if(m.controlledMatchPlan===planId)return;
    if(m.minute-Number(m.lastPlayerPlanChangeMinute||-10)<4){toast("先执行当前策略几分钟，再做调整");return;}
    m.controlledMatchPlan=planId;m.lastPlayerPlanChangeMinute=m.minute;m.playerPlanTimeline.push({minute:m.minute,plan:planId});m.commentary.push({minute:m.minute,text:`${state.person} 调整个人比赛方式：${plan.label}。`});saveState();render();toast(`场上策略：${plan.label}`);
  }
  function recordPlayerPlanMinute(m) {
    if(state.role!=="player"||!m.lineupIds.includes(state.controlledId))return;const plan=m.controlledMatchPlan||"balanced";m.playerPlanMinutes[plan]=Number(m.playerPlanMinutes[plan]||0)+1;
  }
  function dominantPlayerPlan(m) { return Object.entries(m.playerPlanMinutes||{}).sort((a,b)=>b[1]-a[1])[0]?.[0]||m.controlledMatchPlan||"balanced"; }
  function weightedPlayerPlanFactor(m,key) { const entries=Object.entries(m?.playerPlanMinutes||{}),total=entries.reduce((sum,item)=>sum+item[1],0);if(!total)return Number(PLAYER_MATCH_PLANS[m?.controlledMatchPlan||"balanced"]?.[key]||1);return entries.reduce((sum,[id,minutes])=>sum+Number(PLAYER_MATCH_PLANS[id]?.[key]||1)*minutes,0)/total; }
  function calculateStoppageTime(m) {
    const substitutions=(m.substitutions||[]).length,cards=Number(m.stats.ours.yellow||0)+Number(m.stats.opponent.yellow||0)+Number(m.stats.ours.red||0)+Number(m.stats.opponent.red||0),goals=m.home+m.away,dismissals=(m.dismissals||[]).length;
    return clamp(Math.round(rand(1.4,2.9)+substitutions*.17+cards*.18+goals*.24+dismissals*.5),3,9);
  }
  function advanceMatchMinute(options={}) {
    const m=state.activeMatch;if(!m||m.finished)return;
    m.minute+=1;recordPlayerPlanMinute(m);simulateSegment(m);sampleMatchHeatmap(m);
    if(m.minute===45&&!m.halfTimeTalkDone&&!options.skipPauses){m.paused=true;m.pauseReason="halfTime";m.pendingTalk="halfTime";m.commentary.push({minute:45,text:"上半场结束，双方球员返回更衣室。"});}
    if(m.minute===90&&m.stoppageTime==null){m.stoppageTime=calculateStoppageTime(m);m.commentary.push({minute:90,text:`第四官员示意下半场补时 ${m.stoppageTime} 分钟。`});}
    if(m.minute>=90+Number(m.stoppageTime||0)){applyCleanSheetBonuses(m);m.finished=true;m.paused=true;m.pauseReason="fullTime";m.pendingTalk="postMatch";m.commentary.push({minute:m.minute,text:"全场比赛结束。球员们向看台致意。"});}
    if(!options.silent&&(m.minute%3===0||m.paused||m.finished)){saveState();render();}else if(!options.silent){updateMatchHud(m);drawMatchCanvasFrame();}
  }
  async function skipMatch({progress,yieldFrame}={}) {
    const m=state.activeMatch;if(!m||m.finished)return;m.paused=true;m.pendingTalk=null;m.skipMode=true;
    let guard=0;while(!m.finished&&guard<110){const chunkEnd=Math.min(guard+8,110);while(!m.finished&&guard++<chunkEnd)advanceMatchMinute({skipPauses:true,silent:true});if(progress)progress(Math.min(90,12+Math.round(m.minute/Math.max(90,90+Number(m.stoppageTime||0))*76)),`已模拟至 ${Math.min(m.minute,90+Number(m.stoppageTime||0))}'`);if(yieldFrame)await yieldFrame();}
    if(progress)progress(94,"计算最终评分与赛后数据");
    m.pendingTalk=null;m.postMatchTalkDone=true;m.pauseReason="fullTime";finishMatch({openReport:true});
  }
  function aiTeamTalkChoice(m,profile=m.aiCoachProfiles?.ours||coachDecisionProfile("AI")) {
    const ours=m.fixture.home?m.home:m.away,theirs=m.fixture.home?m.away:m.home,difference=ours-theirs,xgEdge=Number(m.stats.ours.xg||0)-Number(m.stats.opponent.xg||0);
    if(difference<=-2)return profile.people>=76?"inspire":"criticize";
    if(difference<0)return xgEdge>.35?"encourage":"inspire";
    if(difference>=2)return "calm";
    if(difference>0)return profile.risk>.64?"encourage":"calm";
    return xgEdge<-.45&&profile.people<76?"criticize":"encourage";
  }
  function teamTalkReaction(m,type,profile) {
    const ours=m.fixture.home?m.home:m.away,theirs=m.fixture.home?m.away:m.home,difference=ours-theirs,lineup=matchOurPlayers(m).filter(player=>m.lineupIds.includes(player.id)),morale=lineup.reduce((sum,player)=>sum+Number(player.morale||75),0)/Math.max(1,lineup.length);
    let fit=0;
    if(type==="inspire")fit=difference<0?.75:difference===0?.35:difference>=2?-.35:0;
    else if(type==="encourage")fit=Math.abs(difference)<=1?.55:difference<=-2?-.15:.2;
    else if(type==="criticize")fit=difference<=-2?.7:difference<0?.35:difference>0?-.75:-.15;
    else if(type==="calm")fit=difference>0?.7:difference===0?.15:difference<=-2?-.55:-.15;
    if(type==="criticize"&&morale<68)fit-=.45;
    return clamp(fit+(Number(profile.people||70)-72)/55+rand(-.28,.28),-1,1);
  }
  function applyTeamTalk(type) {
    const m=state.activeMatch;if(!m||!m.pendingTalk)return;const half=m.pendingTalk==="halfTime",profile=m.aiCoachProfiles?.ours||coachDecisionProfile(state.person||"AI"),actualType=type==="listen"?aiTeamTalkChoice(m,profile):type,reaction=teamTalkReaction(m,actualType,profile),scale=clamp(.7+reaction*.45,.2,1.2);
    if(actualType==="inspire"){m.tactical=clamp(m.tactical+3*scale,45,98);m.decisionBonus=clamp(m.decisionBonus+4*scale,-5,20);m.decisionRisk=clamp(m.decisionRisk+3,-8,18);}
    else if(actualType==="encourage"){m.fitness=clamp(m.fitness+3*scale,30,100);m.tactical=clamp(m.tactical+1.5*scale,45,98);}
    else if(actualType==="criticize"){m.tactical=clamp(m.tactical+(reaction>=0?4*scale:reaction*2),45,98);m.fitness=clamp(m.fitness-1,30,100);}
    else if(actualType==="calm"){m.decisionRisk=clamp(m.decisionRisk-4*scale,-8,18);m.fitness=clamp(m.fitness+1.5*scale,30,100);}
    const moraleDelta=Math.round((actualType==="criticize"?2.5:1.8)*reaction);matchOurPlayers(m).forEach(player=>{if(m.lineupIds.includes(player.id))player.morale=clamp(player.morale+moraleDelta,0,100);});
    const labels={inspire:"激昂讲话",encourage:"鼓励全队",criticize:"严厉批评",calm:"要求冷静"},response=reaction>.45?"球员反应积极":reaction<-.35?"部分球员反应消极":"更衣室反应平静";m.commentary.push({minute:m.minute,text:`更衣室：${labels[actualType]||"完成讲话"}，${response}。`});m.pendingTalk=null;
    if(half){m.halfTimeTalkDone=true;m.pauseReason=null;m.paused=false;saveState();render();return;}
    m.postMatchTalkDone=true;m.pauseReason="fullTime";m.paused=true;finishMatch();
  }
  function updateMatchHud(m) {
    const clock=document.querySelector(".match-clock"),scores=document.querySelectorAll(".score-number");if(clock)clock.textContent=matchClockLabel(m.minute);if(scores[0])scores[0].textContent=m.home;if(scores[1])scores[1].textContent=m.away;
  }

  function ambientMatchCommentary(m) {
    const ours=clubById(state.clubId).name,opponent=m.fixture.opponent,difference=matchScoreDifference(m,"ours"),ourPlan=m.aiTacticalPlans?.ours||"balanced",opponentPlan=m.aiTacticalPlans?.opponent||"balanced",ourPlayers=activeMatchPlayers(m,"ours").filter(player=>player.position!=="GK"),opponentPlayers=activeMatchPlayers(m,"opponent").filter(player=>player.position!=="GK"),ourPlayer=ourPlayers[Math.floor(rand(0,ourPlayers.length))],opponentPlayer=opponentPlayers[Math.floor(rand(0,opponentPlayers.length))];
    let templates;
    if(m.minute<18)templates=[`${ours} 开场后耐心倒脚，试图确认对手的压迫方式。`,`${opponent} 的两条线保持紧凑，暂时没有轻易前压。`,`${ourPlayer?.name||"本队中场"} 回撤接应，球队从后场重新组织。`,`双方在中场连续争夺第二落点，比赛节奏尚未完全打开。`];
    else if(m.minute>=78&&difference<0)templates=[`${ours} 明显加快出球速度，边后卫的位置已经接近边锋。`,`对手开始压缩禁区前沿，${ourPlayer?.name||"本队球员"} 很难获得从容起脚的空间。`,`${opponent} 退守后留下反击通道，下一次丢球可能非常危险。`,`本队连续把球送入禁区，落点争夺变得越来越激烈。`];
    else if(m.minute>=78&&difference>0)templates=[`${ours} 主动降低节奏，控球重点转向边线和安全区域。`,`${opponent} 提高前场人数，${opponentPlayer?.name||"对方前锋"} 不断冲击防线身后。`,`本队阵型回收得更紧，首先保护禁区中路。`,`比赛进入守胜阶段，每一次界外球都在消耗对手的进攻时间。`];
    else if(ourPlan==="press"||opponentPlan==="press")templates=[`${ourPlan==="press"?ours:opponent} 提高压迫强度，后场出球空间明显缩小。`,`${ourPlayer?.name||"本队中场"} 在高压下快速转移，试图绕开第一道防线。`,`双方阵线前移，攻防转换开始频繁出现。`,`${opponentPlayer?.name||"对方中场"} 接球时立即遭到夹击，只能回传保护球权。`];
    else if(m.possession>=57)templates=[`${ours} 通过连续传递把对手压回半场。`,`边后卫套上接球，传中被第一点解围。`,`${ourPlayer?.name||"本队中场"} 抢下第二落点，进攻继续组织。`,`前锋回撤做球，边路获得向前推进空间。`,`一次直塞被对方中卫提前判断并截断。`];
    else if(m.possession<=43)templates=[`${opponent} 掌握较多球权，本队暂时保持紧凑阵型。`,`门将短传发动进攻，后场耐心寻找安全出口。`,`中卫在禁区前完成关键拦截，化解对手的连续推进。`,`对手快速转移到边路，本队边后卫及时回追破坏传中。`,`双方在中场连续争夺球权，比赛暂时陷入拉锯。`];
    else templates=[`双方都没有贸然压上，中场空间被压缩得很小。`,`${ourPlayer?.name||"本队球员"} 转身摆脱后向前输送，防线及时封住线路。`,`${opponentPlayer?.name||"对手球员"} 尝试纵向推进，但队友接应距离过远。`,`球权几次易手，双方都在等待更清晰的进攻机会。`,`一次边路配合形成传中，禁区内没有人抢到第一点。`];
    const recent=new Set(m.commentary.slice(-8).map(item=>item.text)),available=templates.filter(text=>!recent.has(text));return (available.length?available:templates)[Math.floor(rand(0,(available.length?available:templates).length))];
  }

  function createMatchInjury(player,energy,contact=false) {
    const profiles=contact?[{name:"脚踝扭伤",min:8,max:28,weight:4},{name:"膝关节扭伤",min:18,max:75,weight:1.2},{name:"小腿挫伤",min:4,max:14,weight:3},{name:"肩部撞伤",min:5,max:18,weight:1.5}]:[{name:"腿筋拉伤",min:12,max:42,weight:4},{name:"内收肌拉伤",min:10,max:35,weight:2.5},{name:"小腿肌肉拉伤",min:8,max:28,weight:2.2},{name:"肌肉疲劳",min:3,max:10,weight:3}];
    const profile=weightedPick(profiles,item=>item.weight),ageFactor=player.age>=32?1.2:player.age<=23?.9:1,physicalFactor=clamp(1.12-(matchAttribute(player,"physical")-65)/180,.82,1.18),fatigueFactor=clamp(1+(68-energy)/100,.9,1.3);
    return {injury:profile.name,days:clamp(Math.round(rand(profile.min,profile.max)*ageFactor*physicalFactor*fatigueFactor),3,120)};
  }

  function maybeMatchInjury(m,contactTeam=null) {
    if(m.minute<10||m.minute>88||m.minute-Number(m.lastInjuryMinute||-30)<18)return;
    const recoveryCareer=state.role==="player"?ensurePlayerCareer():null,base=.00125*(m.denseSchedule?1.28:1)*(m.tactic==="press"?1.12:1),contactBoost=contactTeam?.teamKey ? .0017 : 0;if(Math.random()>=base+contactBoost)return;
    const teamKey=contactTeam?.teamKey?contactTeam.teamKey==="ours"?"opponent":"ours":Math.random()<.5?"ours":"opponent",players=activeMatchPlayers(m,teamKey).filter(player=>player.position!=="GK"&&!player.injured&&!player.matchInjured);if(!players.length)return;
    const player=weightedPick(players,item=>{const energy=matchPlayerEnergy(item,m,teamKey),ageRisk=item.age>=31?1.25:item.age<=23?.85:1,controlled=teamKey==="ours"&&state.role==="player"&&item.id===state.controlledId,planRisk=controlled?Number(PLAYER_MATCH_PLANS[m.controlledMatchPlan||"balanced"]?.injuryRisk||1):1,recoveryRisk=(controlled&&recoveryCareer?.recoveryProtectionUntil&&state.date<=recoveryCareer.recoveryProtectionUntil) ? .55 : 1;return ageRisk*(1+Math.max(0,70-energy)/24)*(1.18-matchAttribute(item,"physical")/180)*planRisk*recoveryRisk;}),energy=matchPlayerEnergy(player,m,teamKey),detail=createMatchInjury(player,energy,Boolean(contactTeam));
    if(teamKey==="ours"){player.injured=detail.days;player.injury=detail.injury;ensurePlayerDevelopment(player,state.season).injuryDays+=detail.days;}else player.matchInjured=detail.injury;
    m.matchInjuries||=[];m.matchInjuries.push({team:teamKey,playerId:player.id,name:player.name,injury:detail.injury,days:detail.days,minute:m.minute});m.lastInjuryMinute=m.minute;
    m.commentary.push({minute:m.minute,text:`${player.name} 在一次${contactTeam?"对抗":"跑动"}后无法继续坚持，医疗组初步判断为${detail.injury}。`});
    if(teamKey==="opponent"||state.role==="player"||m.skipMode)chooseAiSubstitution(m,teamKey,{forced:true,injury:true});
  }

  function simulateSegment(m) {
    const strengthEdge=matchStrengthEdge(m,"ours"),tacticPossession=({press:4,balanced:0,counter:-4,defensive:-7})[m.tactic]||0,planPossession=({press:3,push:2,counter:-2,protect:-3,balanced:0})[m.aiTacticalPlans?.ours||"balanced"]-({press:3,push:2,counter:-2,protect:-3,balanced:0})[m.aiTacticalPlans?.opponent||"balanced"],dismissalEdge=((m.dismissals||[]).filter(item=>item.team==="opponent").length-(m.dismissals||[]).filter(item=>item.team==="ours").length)*5,targetPossession=clamp(50+strengthEdge*.72+(m.fixture.home?2:-2)+tacticPossession+planPossession+dismissalEdge,27,73),visualTeam=Math.random()<m.possession/100?"ours":"opponent";setMatchVisualAction(m,visualTeam,Math.random()<.35?"attack":"build",visualTeam==="ours"?"本队组织推进":"对手持球推进");m.ballX=clamp(rand(12,88)+m.decisionBonus*.25,8,92);m.ballY=rand(12,88);
    m.fitness=clamp(m.fitness-rand(.11,.24)*(m.tactic==="press"?1.18:1),30,100);
    m.possession=clamp(Math.round(m.possession+(targetPossession-m.possession)*.045+rand(-.8,.8)),29,71);
    const firstTeam=Math.random()<m.possession/100?"ours":"opponent",secondTeam=firstTeam==="ours"?"opponent":"ours",majorEvent=simulateTeamAttack(m,firstTeam)||simulateTeamAttack(m,secondTeam);
    let foulContext=null;if(Math.random()<.215){const teamKey=Math.random()<(100-m.possession)/100?"ours":"opponent";m.stats[teamKey].fouls++;foulContext={teamKey};if(Math.random()<.1)registerCard(m,teamKey);}
    maybeMatchInjury(m,foulContext);
    if(!majorEvent&&Math.random()<.075)m.commentary.push({minute:m.minute,text:ambientMatchCommentary(m)});
    if(m.minute%3===0){simulateDefensiveActions(m,false);simulateDefensiveActions(m,true);simulatePlayerContributions(m,false);simulatePlayerContributions(m,true);updateLiveRatings(m);}
    maybeAiTacticalAdjustments(m);maybeAutoSubstitutions(m);
    m.decisionBonus*=.96;m.decisionRisk=(m.decisionRisk||0)*.94;m.commentary=m.commentary.slice(-90);
  }
  function recordScoreTimeline(m,team){m.scoreTimeline||=[];m.scoreTimeline.push({team,minute:m.minute,home:m.home,away:m.away});}
  function scoreForUs(m){if(m.fixture.home)m.home++;else m.away++;recordScoreTimeline(m,"ours");}
  function scoreForOpponent(m){if(m.fixture.home)m.away++;else m.home++;recordScoreTimeline(m,"opponent");}

  function addPlayerEvent(m,player,type,delta) {
    const event=ensureMatchEvent(m.playerEvents,player.id);
    event[type]=(event[type]||0)+1;event.ratingDelta=Number(((event.ratingDelta||0)+delta).toFixed(2));
    adjustRating(m.liveRatings,player.id,delta);
    if(player.id===state.controlledId)m.playerRating=Number(m.liveRatings[player.id]||m.playerRating);
  }

  function addOpponentEvent(m,player,type,delta) {
    const event=ensureMatchEvent(m.opponentEvents,player.id);
    event[type]=(event[type]||0)+1;event.ratingDelta=Number(((event.ratingDelta||0)+delta).toFixed(2));adjustRating(m.opponentRatings,player.id,delta);
  }

  const MATCH_ASSIST_RATES={created:.86,unstructured:.68};

  function assistCommentaryLead(assister,scorer) {
    if(!assister)return "";if(["ST","CF"].includes(assister.position))return `${assister.name} 回撤做球送出助攻`;if(["RW","LW","RM","LM"].includes(assister.position))return `${assister.name} 从边路送出传中助攻`;if(["RB","LB","RWB","LWB"].includes(assister.position))return `${assister.name} 套边后送出助攻`;if(assister.position==="AM")return `${assister.name} 在禁区前沿送出直塞助攻`;return `${assister.name} 送出最后一传`;
  }

  function selectGoalAssister(lineup,scorer,selectedAssister=null) {
    const assistPool=lineup.filter(player=>player.id!==scorer.id&&player.position!=="GK");if(!assistPool.length)return null;
    const preferred=selectedAssister?assistPool.find(player=>player.id===selectedAssister.id):null,rate=preferred?MATCH_ASSIST_RATES.created:MATCH_ASSIST_RATES.unstructured;if(Math.random()>=rate)return null;
    return preferred||weightedPick(assistPool,player=>attackRoleWeight(player.position,true)*assistPartnershipWeight(player.position,scorer.position)*Math.pow(matchAttribute(player,"passing")/70,2.1));
  }

  function registerOurGoal(m,selectedScorer=null,selectedAssister=null) {
    scoreForUs(m);const lineup=m.lineupIds.map(id=>matchOurPlayers(m).find(player=>player.id===id)).filter(Boolean);
    if(!lineup.length)return {name:"本队球员"};
    const attackers=lineup.filter(player=>["ST","CF","RW","LW","AM","RM","LM","CM"].includes(player.position)),pool=attackers.length?attackers:lineup;
    const scorer=selectedScorer||weightedPick(pool,player=>attackRoleWeight(player.position,false)*Math.pow(matchAttribute(player,"shooting")/70,2.2));
    addPlayerEvent(m,scorer,"goals",1.2);
    const assister=selectGoalAssister(lineup,scorer,selectedAssister);if(assister)addPlayerEvent(m,assister,"assists",.7);m.lastGoalDetail={team:"ours",scorerId:scorer.id,scorerName:scorer.name,assisterId:assister?.id||null,assisterName:assister?.name||null};
    if(Math.random()<.22){const defenders=m.opponentLineupIds.map(id=>m.opponentPlayers.find(player=>player.id===id)).filter(player=>player&&["GK","CB","RB","LB","RWB","LWB","DM"].includes(player.position));const mistake=defenders[Math.floor(rand(0,defenders.length))];if(mistake){addOpponentEvent(m,mistake,"mistakes",-1);ensureMatchEvent(m.opponentEvents,mistake.id).errorsLeadingToGoal++;}}
    return scorer;
  }

  function registerOpponentGoal(m,selectedScorer=null,selectedAssister=null) {
    scoreForOpponent(m);const lineup=m.opponentLineupIds.map(id=>m.opponentPlayers.find(player=>player.id===id)).filter(Boolean);
    if(!lineup.length)return {name:"对手球员"};
    const attackers=lineup.filter(player=>["ST","CF","RW","LW","AM","RM","LM","CM"].includes(player.position)),pool=attackers.length?attackers:lineup,scorer=selectedScorer||weightedPick(pool,player=>attackRoleWeight(player.position,false)*Math.pow(matchAttribute(player,"shooting")/70,2.2));addOpponentEvent(m,scorer,"goals",1.2);
    const assister=selectGoalAssister(lineup,scorer,selectedAssister);if(assister)addOpponentEvent(m,assister,"assists",.7);m.lastGoalDetail={team:"opponent",scorerId:scorer.id,scorerName:scorer.name,assisterId:assister?.id||null,assisterName:assister?.name||null};
    if(Math.random()<.2){const defenders=m.lineupIds.map(id=>matchOurPlayers(m).find(player=>player.id===id)).filter(player=>player&&["GK","CB","RB","LB","RWB","LWB","DM"].includes(player.position));const mistake=defenders[Math.floor(rand(0,defenders.length))];if(mistake){addPlayerEvent(m,mistake,"mistakes",-1);ensureMatchEvent(m.playerEvents,mistake.id).errorsLeadingToGoal++;}}
    return scorer;
  }

  function registerMistake(m,risk) {
    const lineup=m.lineupIds.map(id=>matchOurPlayers(m).find(player=>player.id===id)).filter(Boolean);
    if(!lineup.length)return null;
    if(Math.random()>clamp(.18+risk/60,.18,.46))return null;
    const defenders=lineup.filter(player=>["GK","CB","RB","LB","RWB","LWB","DM"].includes(player.position)),pool=defenders.length?defenders:lineup;
    const player=weightedPick(pool,item=>{const concentration=effectiveMatchAttribute(item,"passing",m,"ours")*.45+effectiveMatchAttribute(item,"defending",m,"ours")*.55,planRisk=state.role==="player"&&item.id===state.controlledId?Math.max(.65,1+Number(PLAYER_MATCH_PLANS[m.controlledMatchPlan||"balanced"]?.risk||0)*.08):1;return planRisk*clamp((105-concentration)/35,.35,1.8);});addPlayerEvent(m,player,"mistakes",-1);return player;
  }

  function registerCard(m,teamKey=null) {
    const opponent=teamKey?teamKey==="opponent":Math.random()<.5,lineup=opponent?m.opponentLineupIds.map(id=>m.opponentPlayers.find(player=>player.id===id)).filter(Boolean):m.lineupIds.map(id=>matchOurPlayers(m).find(player=>player.id===id)).filter(Boolean);if(!lineup.length)return;
    const player=weightedPick(lineup,item=>item.position==="GK"?.25:["CB","RB","LB","DM"].includes(item.position)?1.55:["RWB","LWB","CM","RM","LM"].includes(item.position)?1.25:1),events=opponent?m.opponentEvents:m.playerEvents,event=events[player.id]||{},addEvent=opponent?addOpponentEvent:addPlayerEvent,stats=m.stats[opponent?"opponent":"ours"];
    if(event.red)return;const secondYellow=Boolean(event.yellow)&&Math.random()<.34,red=secondYellow||Math.random()<.035;
    if(red){
      if(secondYellow){addEvent(m,player,"yellow",-.25);stats.yellow++;}
      addEvent(m,player,"red",-1.25);
      const team=opponent?"opponent":"ours",ids=opponent?m.opponentLineupIds:m.lineupIds,index=ids.indexOf(player.id);if(index>=0)ids.splice(index,1);
      stats.red++;
      m.dismissals||=[];m.dismissals.push({team,playerId:player.id,playerName:player.name,minute:m.minute});
      m.commentary.push({minute:m.minute,text:`${player.name} ${secondYellow?"累计两张黄牌":"被直接红牌"}罚下，球队将少一人作战。`});
    }
    else if(!event.yellow){addEvent(m,player,"yellow",-.25);stats.yellow++;m.commentary.push({minute:m.minute,text:`${player.name} 因犯规领到黄牌。`});}
  }

  function positionAwareRating(player,event,minutes,context) {
    const unit=positionUnit(player.position),passRate=event.passes?event.accuratePasses/event.passes:0,duelLosses=Math.max(0,(event.duels||0)-(event.duelsWon||0)),failedTackles=Math.max(0,(event.tackles||0)-(event.tacklesWon||0));
    let rating=6.18+(context.result>0?.08:context.result<0?-.05:0)+(Math.min(90,minutes)-60)*.0008;
    rating+=(event.goals||0)*(unit==="defence"||player.position==="GK"?1.45:unit==="midfield"?1.28:1.14)+(event.assists||0)*.68;
    rating+=(event.onTarget||0)*.055-Math.max(0,(event.shots||0)-(event.onTarget||0))*.018-(event.bigChancesMissed||0)*.32-(event.penaltiesMissed||0)*.72;
    rating+=(event.keyPasses||0)*.085+(event.chancesCreated||0)*.13+(event.progressivePasses||0)*.026+(event.successfulDribbles||0)*.065+(event.recoveries||0)*.025+(event.pressuresWon||0)*.02;
    rating+=(event.tacklesWon||0)*.07-failedTackles*.022+(event.interceptions||0)*.075+(event.clearances||0)*.04+(event.blocks||0)*.11+(event.duelsWon||0)*.027-duelLosses*.014;
    if(event.passes>=10)rating+=clamp((passRate-(player.position==="GK"?.72:.79))*1.25,-.22,.2)*Math.min(1,event.passes/38);
    rating-=Math.min(.42,(event.possessionLost||0)*(unit==="attack"?.011:.016));
    if(player.position==="GK")rating+=(event.saves||0)*.14+(event.cleanSheets? .34:0)-context.conceded*.22;
    else if(unit==="defence")rating+=(event.cleanSheets? .26:0)-Math.max(0,context.conceded-1)*.08;
    else if(player.position==="DM")rating+=(event.cleanSheets? .12:0)-Math.max(0,context.conceded-2)*.025;
    rating-=(event.mistakes||0)*.62+(event.errorsLeadingToGoal||0)*.55+(event.yellow||0)*.22+(event.red||0)*1.18;
    const career=state.role==="player"&&player.id===state.controlledId?ensurePlayerCareer():null,responseActive=career&&career.responseMatches>0,positiveActions=(event.keyPasses||0)+(event.chancesCreated||0)+(event.successfulDribbles||0)+(event.progressivePasses||0)+(event.recoveries||0)+(event.pressuresWon||0)+(event.tacklesWon||0)+(event.interceptions||0);
    if(responseActive&&minutes>=20)rating+=clamp(.04+Number(career.responseMomentum||0)*.025+positiveActions*.004,.04,.23);
    const reasons=[];
    if(event.goals)reasons.push(`${event.goals} 个进球`);if(event.assists)reasons.push(`${event.assists} 次助攻`);if(responseActive&&rating>=6.35)reasons.push(`${career.responseSource||"状态调整"}开始见效`);if(event.saves>=3)reasons.push(`${event.saves} 次扑救`);if(event.cleanSheets)reasons.push("完成零封");if(event.keyPasses>=2)reasons.push(`${event.keyPasses} 次关键传球`);if(event.chancesCreated)reasons.push(`${event.chancesCreated} 次创造良机`);if(event.successfulDribbles>=3)reasons.push(`${event.successfulDribbles} 次成功过人`);if((event.tacklesWon||0)+(event.interceptions||0)+(event.clearances||0)>=5)reasons.push("防守贡献突出");if(event.bigChancesMissed)reasons.push(`错失 ${event.bigChancesMissed} 次良机`);if(event.errorsLeadingToGoal)reasons.push("失误导致丢球");if(event.red)reasons.push("红牌罚下");else if(event.yellow)reasons.push("领到黄牌");
    event.ratingReasons=reasons.slice(0,4);return Number(clamp(rating,3,10).toFixed(2));
  }

  function finalizeMatchRatings(m) {
    if(m.ratingsFinalized)return;m.ratingsFinalized=true;applyCleanSheetBonuses(m);
    const ourGoals=m.fixture.home?m.home:m.away,opponentGoals=m.fixture.home?m.away:m.home,ourResult=Math.sign(ourGoals-opponentGoals);
    const apply=(teamKey,players,initial,ratings,events,conceded,result)=>{
      const participantIds=[...new Set([...(initial||[]),...(m.substitutions||[]).filter(item=>item.team===teamKey).map(item=>item.inId)])];
      participantIds.forEach(id=>{const player=players.find(item=>item.id===id),minutes=sideMinutesPlayed(m,id,teamKey==="opponent");if(!player||!minutes)return;ratings[id]=positionAwareRating(player,ensureMatchEvent(events,id),minutes,{conceded,result});});
    };
    apply("ours",matchOurPlayers(m),m.initialLineupIds,m.liveRatings,m.playerEvents,opponentGoals,ourResult);apply("opponent",m.opponentPlayers||[],m.opponentInitialLineupIds,m.opponentRatings,m.opponentEvents,ourGoals,-ourResult);
    if(state.role==="player")m.playerRating=Number(m.liveRatings[state.controlledId]||6);
  }

  function matchMinutesPlayed(m,playerId) {
    const entered=m.initialLineupIds.includes(playerId)?0:m.substitutions.find(item=>item.team==="ours"&&item.inId===playerId)?.minute;
    if(entered==null)return 0;const left=m.substitutions.find(item=>item.team==="ours"&&item.outId===playerId)?.minute??m.dismissals?.find(item=>item.team==="ours"&&item.playerId===playerId)?.minute??90;return clamp(left-entered,0,90);
  }

  function matchFitnessDrain(player,minutes,tactic) {
    const ranges={
      GK:[3,6],CB:[11,17],RB:[16,23],LB:[16,23],RWB:[20,28],LWB:[20,28],
      DM:[15,21],CM:[18,25],RM:[19,27],LM:[19,27],AM:[17,24],RW:[19,27],LW:[19,27],ST:[16,23],CF:[17,24]
    };
    const [low,high]=ranges[player.position]||[15,22];
    const tacticFactor=tactic==="press"?1.12:tactic==="defensive"?.92:tactic==="counter"?1.02:1;
    const ageFactor=player.age>=34?1.12:player.age>=30?1.06:player.age<=23?.97:1;
    const planFactor=state.role==="player"&&player.id===state.controlledId?weightedPlayerPlanFactor(state.activeMatch,"fatigue"):1;
    return Math.max(1,Math.round(rand(low,high)*(minutes/90)*tacticFactor*ageFactor*planFactor));
  }

  function heatmapZone(player,points) {
    if(!points.length)return "暂无数据";
    const averageX=points.reduce((sum,item)=>sum+item[0],0)/points.length;
    const zoneX=averageX<35?"后场":averageX>65?"前场":"中场";
    const lane=({RB:"右路",RWB:"右路",RM:"右路",RW:"右路",LB:"左路",LWB:"左路",LM:"左路",LW:"左路"})[player?.position]||(() => {
      const averageY=points.reduce((sum,item)=>sum+item[1],0)/points.length;
      return averageY<34?"左路":averageY>66?"右路":"中路";
    })();
    return `${zoneX}${lane}`;
  }

  function normalizeLegacyReportHeatmaps(report) {
    if(!Array.isArray(report?.heatmapSummary))return;
    const away=report.teamName===report.awayName,positions=new Map((report.ratings||[]).map(item=>[item.id,item.position]));
    report.heatmapSummary.forEach(item=>{
      if(away&&Array.isArray(item.points))item.points=item.points.map(([x,y])=>[Number((100-x).toFixed(1)),y]);
      const player={position:item.position||positions.get(item.id)};item.position=player.position||item.position;item.zone=heatmapZone(player,item.points||[]);
    });
  }

  function createMatchReport(m,mvp,result) {
    const f=m.fixture,club=clubById(state.clubId),ourStats={...m.stats.ours,possession:m.possession},opponentStats={...m.stats.opponent,possession:100-m.possession};
    const participantIds=[...new Set([...(m.initialLineupIds||[]),...(m.substitutions||[]).filter(item=>item.team==="ours").map(item=>item.inId)])];
    const ratings=participantIds.map(id=>{
      const player=matchOurPlayers(m).find(item=>item.id===id),events=m.playerEvents?.[id]||{};if(!player)return null;
      return {id,name:player.name,position:player.position,minutes:matchMinutesPlayed(m,id),goals:events.goals||0,assists:events.assists||0,shots:events.shots||0,onTarget:events.onTarget||0,bigChancesMissed:events.bigChancesMissed||0,passes:events.passes||0,accuratePasses:events.accuratePasses||0,possessionLost:events.possessionLost||0,tackles:events.tackles||0,tacklesWon:events.tacklesWon||0,interceptions:events.interceptions||0,clearances:events.clearances||0,blocks:events.blocks||0,duels:events.duels||0,duelsWon:events.duelsWon||0,saves:events.saves||0,cleanSheets:events.cleanSheets||0,keyPasses:events.keyPasses||0,chancesCreated:events.chancesCreated||0,successfulDribbles:events.successfulDribbles||0,progressivePasses:events.progressivePasses||0,recoveries:events.recoveries||0,pressuresWon:events.pressuresWon||0,ratingReasons:[...(events.ratingReasons||[])],rating:Number(m.liveRatings?.[id]??6)};
    }).filter(player=>player&&player.minutes>0).sort((a,b)=>positionSortRank(a.position)-positionSortRank(b.position)||b.minutes-a.minutes||b.rating-a.rating);
    const recordedInjuries=(m.matchInjuries||[]).map(item=>({...item})),recordedIds=new Set(recordedInjuries.filter(item=>item.team==="ours").map(item=>item.playerId)),injuries=[...recordedInjuries,...participantIds.map(id=>matchOurPlayers(m).find(player=>player.id===id)).filter(player=>player?.injured&&!recordedIds.has(player.id)).map(player=>({team:"ours",playerId:player.id,name:player.name,injury:player.injury,days:player.injured,minute:null}))];
    const heatmapSummary=participantIds.map(id=>{const player=matchOurPlayers(m).find(item=>item.id===id),points=(m.heatmap?.[id]||[]).slice(-90);if(!player||!points.length)return null;return {id,name:player.name,position:player.position,zone:heatmapZone(player,points),intensity:clamp(Math.round(points.length/90*100),12,100),points:points.filter((_,index)=>index%3===0)};}).filter(Boolean);
    return {
      id:`report-${f.id}-${Date.now()}`,fixtureId:f.id,season:state.season,clubId:state.clubId,date:f.date,competition:f.competition,round:f.round,result,
      teamName:f.teamName||club.name,homeName:f.home?(f.teamName||club.name):f.opponent,awayName:f.home?f.opponent:(f.teamName||club.name),score:{home:m.home,away:m.away},penalties:f.penalties?{...f.penalties}:null,
      homeStats:f.home?ourStats:opponentStats,awayStats:f.home?opponentStats:ourStats,mvp:{...mvp},ratings,
      substitutions:(m.substitutions||[]).map(item=>({...item})),injuries,formation:m.formation,opponentFormation:m.opponentFormation,heatmapSummary,playerMatchPlan:m.controlledMatchPlan||null,performanceResponse:m.performanceResponse?{...m.performanceResponse,boosts:{...(m.performanceResponse.boosts||{})}}:null,teamTalks:{halfTime:Boolean(m.halfTimeTalkDone),postMatch:Boolean(m.postMatchTalkDone)}
    };
  }

  function knockoutDecisionContext(fixture,ours,theirs) {
    if(!(fixture.knockout||fixture.phase==="knockout"))return {requiresWinner:false,ours,theirs,aggregate:false};
    if(EUROPEAN_COMPETITION_BY_NAME[fixture.competition]&&fixture.leg===1)return {requiresWinner:false,ours,theirs,aggregate:true};
    if(EUROPEAN_COMPETITION_BY_NAME[fixture.competition]&&fixture.leg===2){
      const first=state.schedule.find(item=>item.tieId===fixture.tieId&&item.leg===1&&item.status==="played"&&item.score),firstOurs=first?(first.home?first.score.home:first.score.away):0,firstTheirs=first?(first.home?first.score.away:first.score.home):0;
      return {requiresWinner:true,ours:firstOurs+ours,theirs:firstTheirs+theirs,aggregate:true,firstOurs,firstTheirs};
    }
    return {requiresWinner:true,ours,theirs,aggregate:false};
  }

  function simulatePenaltyShootout(m) {
    const chanceFor=teamKey=>{
      const other=teamKey==="ours"?"opponent":"ours",takers=activeMatchPlayers(m,teamKey).filter(player=>player.position!=="GK").map(player=>effectiveMatchAttribute(player,"shooting",m,teamKey)).sort((a,b)=>b-a).slice(0,5),keeper=activeMatchPlayers(m,other).find(player=>player.position==="GK"),finishing=takers.reduce((sum,value)=>sum+value,0)/Math.max(1,takers.length),goalkeeping=keeper?effectiveMatchAttribute(keeper,"goalkeeping",m,other):68;
      return clamp(.74+(finishing-goalkeeping)*.0032,.62,.86);
    };
    const oursChance=chanceFor("ours"),opponentChance=chanceFor("opponent");let ours=0,opponent=0;
    for(let kick=0;kick<5;kick++){if(Math.random()<oursChance)ours++;if(Math.random()<opponentChance)opponent++;}
    let suddenDeath=0;while(ours===opponent&&suddenDeath++<8){const ourKick=Math.random()<oursChance,opponentKick=Math.random()<opponentChance;if(ourKick)ours++;if(opponentKick)opponent++;}
    if(ours===opponent){if(Math.random()<clamp(.5+matchStrengthEdge(m,"ours")*.008,.38,.62))ours++;else opponent++;}
    return {ours,opponent,winner:ours>opponent?"us":"opponent"};
  }

  function createMatchMediaStory(m,fixture,ours,theirs,won,draw,result,mvp) {
    const club=clubById(state.clubId),ourName=fixture.teamName||club.name,strengthEdge=matchStrengthEdge(m,"ours"),shotEdge=Number(m.stats.ours.shots||0)-Number(m.stats.opponent.shots||0),xgEdge=Number(m.stats.ours.xg||0)-Number(m.stats.opponent.xg||0),timeline=m.scoreTimeline||[],wasBehind=timeline.some(item=>{const ourScore=fixture.home?item.home:item.away,opponentScore=fixture.home?item.away:item.home;return ourScore<opponentScore;}),lastGoal=timeline.at(-1),lateGoal=lastGoal&&lastGoal.minute>=80,redCards=Number(m.stats.ours.red||0)+Number(m.stats.opponent.red||0),penaltyText=fixture.penalties?`（点球 ${fixture.penalties.home}-${fixture.penalties.away}）`:"";
    const european=EUROPEAN_COMPETITION_BY_NAME[fixture.competition],sources=european?[`${fixture.competition}之夜`,"欧洲赛场","战术观察"]:fixture.international?["国家队比赛日","国际赛场","赛后复盘"]:["Matchday Live","赛后复盘","Football Daily"],source=sources[Math.floor(rand(0,sources.length))];
    let angle="常规",headline=`${ourName} ${ours}-${theirs}${penaltyText} ${result} ${fixture.opponent}`,lead=`双方完成一场节奏多变的比赛。${ourName} 控球率 ${m.possession}%，射门 ${m.stats.ours.shots} 次，预期进球 ${m.stats.ours.xg.toFixed(2)}。`;
    if(european&&["晋级","点球晋级"].includes(result)){angle=`${fixture.competition}晋级`;headline=`${fixture.competition}：${ourName} 淘汰 ${fixture.opponent}，挺进下一轮`;lead=`比赛的压力一直延续到终场。${fixture.aggregate?`两回合总比分 ${fixture.aggregate.ours}-${fixture.aggregate.theirs}。`:"球队在决定性比赛中把握住了机会。"}`;}
    else if(won&&strengthEdge<=-5){angle="爆冷";headline=`爆冷：${ourName} ${ours}-${theirs} 击败实力占优的 ${fixture.opponent}`;lead=`赛前并不被看好的 ${ourName} 依靠执行力改变了实力对比，比赛计划和关键机会把握成为胜负分水岭。`;}
    else if(won&&wasBehind){angle="逆转";headline=`逆转取胜：${ourName} ${ours}-${theirs} 击败 ${fixture.opponent}`;lead=`球队在落后局面下改变节奏，临场调整和替补球员的贡献推动了比赛转折。`;}
    else if(won&&shotEdge>=6&&xgEdge>=.75){angle="压制";headline=`场面占优：${ourName} ${ours}-${theirs} 战胜 ${fixture.opponent}`;lead=`${ourName} 在射门和机会质量上占据优势，全场 ${m.stats.ours.shots} 次射门创造 ${m.stats.ours.xg.toFixed(2)} xG。`;}
    else if(won&&xgEdge<=-.35){angle="效率";headline=`把握机会：${ourName} ${ours}-${theirs} 击败 ${fixture.opponent}`;lead=`对手创造了更多预期进球，但 ${ourName} 的终结效率和门将表现改变了结果。`;}
    else if(lateGoal){angle="终场转折";headline=`${lastGoal.minute>=90?"补时":"末段"}定局：${ourName} ${ours}-${theirs} ${result} ${fixture.opponent}`;lead=`比赛直到最后阶段才分出方向，${lastGoal.minute>=90?"补时进球":"终场前的关键进球"}成为赛后讨论中心。`;}
    else if(redCards){angle="红牌转折";headline=`红牌改变走势：${ourName} ${ours}-${theirs} ${result} ${fixture.opponent}`;lead=`本场出现 ${redCards} 张红牌，人数变化迫使双方重新调整阵型和比赛计划。`;}
    else if(draw&&Math.abs(xgEdge)>=.7){angle="结果偏离场面";headline=`${ourName} ${ours}-${theirs} 战平 ${fixture.opponent}，场面与结果并不完全一致`;lead=`双方的预期进球为 ${m.stats.ours.xg.toFixed(2)}-${m.stats.opponent.xg.toFixed(2)}，机会质量与最终比分存在明显差异。`;}
    const controlledMinutes=state.role==="player"?matchMinutesPlayed(m,state.controlledId):0,roleNote=state.role==="player"?(controlledMinutes?`${state.person} 出场 ${controlledMinutes} 分钟，评分 ${m.playerRating.toFixed(2)}。`:`${state.person} 本场未出场。`):`教练组战术执行评分 ${m.tactical.toFixed(0)}。`;
    return {source,title:headline,body:`${lead}${roleNote} 本场最佳为 ${mvp.name}（${Number(mvp.rating).toFixed(2)}）。`,date:fixture.date,type:"match",angle};
  }

  function finishMatch(options={}) {
    const m=state.activeMatch,f=m.fixture,club=clubById(state.clubId),ours=f.home?m.home:m.away,theirs=f.home?m.away:m.home,draw=ours===theirs,decision=knockoutDecisionContext(f,ours,theirs),decidingDraw=decision.ours===decision.theirs;
    if(decision.requiresWinner&&decidingDraw){
      const shootout=simulatePenaltyShootout(m);
      f.penalties={home:f.home?shootout.ours:shootout.opponent,away:f.home?shootout.opponent:shootout.ours,winner:shootout.winner};
    }
    const won=decision.requiresWinner?(decision.ours>decision.theirs||(decidingDraw&&f.penalties?.winner==="us")):ours>theirs;
    if(decision.aggregate)f.aggregate={ours:decision.ours,theirs:decision.theirs};
    finalizeMatchRatings(m);
    f.status="played";f.score={home:m.home,away:m.away};
    const scheduledFixture=state.schedule.find(item=>item.id===f.id);
    if(scheduledFixture&&scheduledFixture!==f)Object.assign(scheduledFixture,{status:"played",score:{...f.score},...(f.penalties?{penalties:{...f.penalties}}:{})});
    simulateEuropeanWorld(state,f.date);
    state.played++;
    if(ours>theirs)state.wins++;else if(draw)state.draws++;else state.losses++;
    const league=leagueOf(clubById(state.clubId)),isLeague=f.competition===league.short;
    if(isLeague){if(ours>theirs)state.points+=3;else if(draw)state.points++;recordUserLeagueRound(state,f,m);}
    const participantIds=[...new Set([...(m.initialLineupIds||m.lineupIds||[]),...m.substitutions.filter(item=>item.team==="ours").map(item=>item.inId)])];
    const matchParticipants=participantIds.map(id=>matchOurPlayers(m).find(player=>player.id===id)).filter(Boolean),lineup=participantIds.map(id=>state.squad.find(player=>player.id===id)).filter(Boolean);
    const starters=new Set(m.initialLineupIds||[]),workloadPlayers=f.international?state.squad.filter(player=>player.id===state.controlledId):state.squad;
    workloadPlayers.forEach(player=>{
      const minutes=matchMinutesPlayed(m,player.id),started=starters.has(player.id);
      player.consecutiveStarts=started?Number(player.consecutiveStarts||0)+1:0;
      player.lastMatchMinutes=minutes;
      if(minutes>0)player.lastMatchDate=f.date;
      player.lastSelectionStatus=started?"starter":minutes>0?"substitute":participantIds.includes(player.id)?"unused-substitute":"rest";
    });
    lineup.forEach((p,i)=>{
      const minutes=matchMinutesPlayed(m,p.id);if(minutes<=0)return;if(f.international)p.internationalAppearances=Number(p.internationalAppearances||0)+1;else p.appearances++;
      recordPlayerDevelopment(p,minutes);
      p.fitness=clamp(p.fitness-matchFitnessDrain(p,minutes,m.tactic),25,100);
      const events=m.playerEvents?.[p.id]||{goals:0,assists:0,mistakes:0,yellow:0,red:0,ratingDelta:0};
      if(f.international){p.internationalGoals=Number(p.internationalGoals||0)+(events.goals||0);p.internationalAssists=Number(p.internationalAssists||0)+(events.assists||0);}else{p.goals+=(events.goals||0);p.assists+=(events.assists||0);}
      ["tackles","tacklesWon","interceptions","clearances","blocks","duels","duelsWon","saves","cleanSheets","keyPasses","chancesCreated","successfulDribbles","progressivePasses","recoveries","pressuresWon"].forEach(key=>{p[key]=Number(p[key]||0)+Number(events[key]||0);});
      p.yellowCards=Number(p.yellowCards||0)+Number(events.yellow||0);p.redCards=Number(p.redCards||0)+Number(events.red||0);
      p.lastRating=Number(clamp(m.liveRatings?.[p.id]??(p.id==="controlled"?m.playerRating:6),1,10).toFixed(2));
      p.form=p.lastRating;if(f.international)p.internationalRatingTotal=Number((Number(p.internationalRatingTotal||0)+p.lastRating).toFixed(2));else p.ratingTotal=Number((Number(p.ratingTotal||0)+p.lastRating).toFixed(2));
      addMatchDevelopmentProgress(p,p.lastRating,minutes,state);
      const resultMorale=won?2:draw?0:-2,performanceMorale=p.lastRating>=7.5?2:p.lastRating<5.8?-2:p.lastRating>=6.8?1:0,minutesMorale=minutes<25&&["核心主力","常规主力"].includes(p.contract?.role)?-1:0;p.morale=clamp(Number(p.morale||75)+resultMorale+performanceMorale+minutesMorale,25,100);
      const postCareer=state.role==="player"&&p.id===state.controlledId?ensurePlayerCareer():null,postMatchProtection=postCareer?.recoveryProtectionUntil&&state.date<=postCareer.recoveryProtectionUntil ? .55 : 1,coachInjuryProtection=state.role==="coach"?Number(m.coachEffect?.injuryFactor||1):1,postMatchInjuryFactor=(state.role==="player"&&p.id===state.controlledId?weightedPlayerPlanFactor(m,"injuryRisk"):1)*postMatchProtection*coachInjuryProtection;
      if(!p.injured&&Math.random()<Math.max(.0025,(70-p.fitness)/1300)*postMatchInjuryFactor){
        const detail=createMatchInjury(p,p.fitness,false);p.injured=detail.days;p.injury=detail.injury;
        ensurePlayerDevelopment(p,state.season).injuryDays+=detail.days;
      }
    });
    if(!f.international)syncManagedSquadWorldStats(state);
    if(!f.international)state.squad.filter(player=>!participantIds.includes(player.id)&&!player.injured&&["核心主力","常规主力"].includes(player.contract?.role)).forEach(player=>{if(Math.random()<.38)player.morale=clamp(Number(player.morale||75)-1,25,100);});
    const ourBest=[...matchParticipants].filter(player=>matchMinutesPlayed(m,player.id)>0).sort((a,b)=>(m.liveRatings[b.id]||0)-(m.liveRatings[a.id]||0))[0],opponentBest=(m.opponentPlayers||[]).filter(player=>(m.opponentInitialLineupIds||[]).includes(player.id)||m.substitutions.some(item=>item.team==="opponent"&&item.inId===player.id)).sort((a,b)=>(m.opponentRatings[b.id]||0)-(m.opponentRatings[a.id]||0))[0];
    const mvp=opponentBest&&(m.opponentRatings[opponentBest.id]||0)>(m.liveRatings[ourBest?.id]||0)?{id:opponentBest.id,name:opponentBest.name,rating:m.opponentRatings[opponentBest.id],ours:false}:{id:ourBest?.id,name:ourBest?.name||"待评定",rating:m.liveRatings[ourBest?.id]||6,ours:true};m.mvpId=mvp.id;
    if(state.role==="player") {const p=controlledPlayer(),controlledMinutes=matchMinutesPlayed(m,state.controlledId),controlledRating=controlledMinutes?Number(m.liveRatings[state.controlledId]||m.playerRating||6):6;if(lineup.includes(p)){updatePlayerAbility(p,controlledRating);if(mvp.ours&&mvp.id===p.id){state.mvpCount=(state.mvpCount||0)+1;state.honors.unshift({name:"单场 MVP",season:state.season,scope:`${f.competition} · ${f.opponent}`});}}updatePlayerCareerAfterMatch(p,controlledRating,controlledMinutes,{...f,playerMatchPlan:dominantPlayerPlan(m),playerPlanTimeline:m.playerPlanTimeline});}
    else {updateCoachAbility(won,draw,m.tactical);settleCoachPreparation({won,draw});}
    handleCompetitionProgress(f,{won,draw,ours,theirs,decision});
    const decidingEuropeanTie=Boolean(EUROPEAN_COMPETITION_BY_NAME[f.competition])&&f.phase==="knockout"&&(f.leg===2||f.round==="决赛");
    const decidingKnockout=(Boolean(EUROPEAN_COMPETITION_BY_NAME[f.competition])||f.international)&&f.phase==="knockout"&&(f.leg!==1),result=f.penalties?(won?"点球晋级":"点球出局"):(decidingEuropeanTie||decidingKnockout)?(won?"晋级":"出局"):won?"取胜":draw?"战平":"告负";
    const penaltyText=f.penalties?`（点球 ${f.penalties.home}-${f.penalties.away}）`:"";
    state.media.unshift(createMatchMediaStory(m,f,ours,theirs,won,draw,result,mvp));
    const injured=lineup.find(p=>p.injured&&Math.random()<.5);if(injured)state.media.unshift({source:"Club Medical",title:`${injured.name} 将因${injured.injury}缺阵`,body:`医疗组预计恢复时间约 ${injured.injured} 天。康复质量将影响体能与能力变化。`,date:f.date,type:"injury"});
    const report=createMatchReport(m,mvp,result);f.reportId=report.id;if(scheduledFixture)scheduledFixture.reportId=report.id;state.matchReports.unshift(report);state.matchReports=state.matchReports.slice(0,1200);
    addNotification({title:"医疗组：恢复计划已生成",type:"medical",date:f.date,detail:"医疗组已经根据本场出场时间、体能消耗和伤病情况生成恢复计划。下一场选人会自动考虑球员体能与赛程密度。",facts:report.injuries.length?report.injuries.map(item=>`${item.name}：${item.injury}，预计缺阵 ${item.days} 天`):["本场没有新增伤病","低体能球员将优先安排恢复训练"]});
    const reportNotification={title:`赛后分析：${ours}-${theirs} ${result}`,type:"match",date:f.date,detail:`${f.teamName||club.name} 已完成本场比赛，完整技术统计、球员评分、换人与医疗记录如下。`,reportId:report.id};addNotification(reportNotification);
    const reportNotice=state.notifications[0];state.date=addDays(f.date,1);state.continueStatus=null;simulateMajorLeagueWorld(state,state.date);simulateBackgroundWorld(state.date);simulateEuropeanWorld(state,state.date);runMonthlyClubFinances(state,state.date);simulateTransferMarket(state,state.date);state.activeMatch=null;if(state.calendarRepairPending){repairCompetitionCalendar(state);delete state.calendarRepairPending;}
    if(options.openReport&&reportNotice){reportNotice.read=true;state.inboxUnread=state.notifications.filter(item=>!item.read).length;modal={type:"notification",id:reportNotice.id};}
    saveState();render();toast(options.openReport?"已直接生成赛后分析":"比赛已记录，赛后报告已生成");
  }

  const EUROPEAN_KNOCKOUT_ROUNDS=["淘汰赛附加赛","十六强","八强","半决赛","决赛"];

  function createEuropeanProgress(club,season) {
    const config=qualifiedEuropeanCompetition(club,season);return config?{[config.key]:{played:0,points:0,gf:0,ga:0,position:null,eliminated:false,knockoutStage:-1}}:{};
  }

  function drawEuropeanKnockoutOpponent(config,round,stageIndex) {
    const used=new Set(state.schedule.filter(item=>item.competition===config.name).map(item=>comparableClubName(item.opponent))),club=clubById(state.clubId);
    const minimum=config.key==="ucl"?82:config.key==="uel"?75:68,pool=[...new Set([...CLUBS.filter(item=>leagueOf(item)?.tier===1&&item.id!==club.id&&item.prestige>=minimum).map(item=>item.name),...EUROPEAN_OPPONENTS])].filter(name=>!used.has(comparableClubName(name))&&comparableClubName(name)!==comparableClubName(club.name));
    return seededShuffle(pool,`${config.key}-ko|${state.season}|${round}|${stageIndex}`)[0]||`${config.name}淘汰赛对手`;
  }

  function scheduleEuropeanKnockoutRound(config,round,stageIndex,afterDate,waitDays) {
    const opponent=drawEuropeanKnockoutOpponent(config,round,stageIndex),baseDate=findAvailableFixtureDate(addDays(afterDate,waitDays)),tieId=`${config.key}-tie-${state.season}-${stageIndex}-${Date.now()}`;
    if(round==="决赛")state.schedule.push({id:`${tieId}-final`,date:baseDate,competition:config.name,competitionKey:config.key,round,stageIndex,phase:"knockout",knockout:true,neutral:true,opponent,home:Math.random()<.5,status:"upcoming",score:null});
    else{
      const firstHome=stableScoutingUnit(`${tieId}|home`)>.5,secondDate=findAvailableFixtureDate(addDays(baseDate,7));
      state.schedule.push({id:`${tieId}-1`,tieId,leg:1,date:baseDate,competition:config.name,competitionKey:config.key,round:`${round}·首回合`,stageName:round,stageIndex,phase:"knockout",knockout:true,opponent,home:firstHome,status:"upcoming",score:null});
      state.schedule.push({id:`${tieId}-2`,tieId,leg:2,date:secondDate,competition:config.name,competitionKey:config.key,round:`${round}·次回合`,stageName:round,stageIndex,phase:"knockout",knockout:true,opponent,home:!firstHome,status:"upcoming",score:null});
    }
    state.schedule.sort((a,b)=>a.date.localeCompare(b.date));return opponent;
  }

  function estimateEuropeanLeaguePosition(progress,club,config) {
    const season=state?.season||2026,field=europeanCompetitionField(club,season,config);
    const rows=field.map(team=>{
      let points=0,gf=0,ga=0;const baseline=config.fieldTarget,winChance=clamp(.35+(team.prestige-baseline)*.014,.18,.62),drawChance=clamp(.24-(team.prestige-baseline)*.001,.19,.27);
      for(let round=0;round<config.matches;round++){
        const result=stableScoutingUnit(`${config.key}-result|${round*7919}|${team.name}|${season}`),goals=stableScoutingUnit(`${config.key}-goals|${round*3571}|${team.name}|${season}`),conceded=stableScoutingUnit(`${config.key}-against|${round*1877}|${team.name}|${season}`);
        if(result<winChance){points+=3;const scored=1+Math.floor(goals*3);gf+=scored;ga+=Math.floor(conceded*Math.min(3,scored));}
        else if(result<winChance+drawChance){points++;const scored=Math.floor(goals*3);gf+=scored;ga+=scored;}
        else{const allowed=1+Math.floor(conceded*3);ga+=allowed;gf+=Math.floor(goals*Math.min(3,allowed));}
      }
      return {name:team.name,points,gf,ga,gd:gf-ga,user:false};
    });
    rows.push({name:club.name,points:Number(progress.points||0),gf:Number(progress.gf||0),ga:Number(progress.ga||0),gd:Number(progress.gf||0)-Number(progress.ga||0),user:true});
    rows.sort((a,b)=>b.points-a.points||b.gd-a.gd||b.gf-a.gf||a.name.localeCompare(b.name));
    return rows.findIndex(row=>row.user)+1;
  }

  const NATIONAL_KNOCKOUT_ROUNDS={世界杯:["三十二强","十六强","八强","半决赛","决赛"],欧洲杯:["十六强","八强","半决赛","决赛"],美洲杯:["八强","半决赛","决赛"],非洲杯:["十六强","八强","半决赛","决赛"],亚洲杯:["十六强","八强","半决赛","决赛"],洲际国家杯:["八强","半决赛","决赛"],欧国联:["八强","半决赛","决赛"]};
  function scheduleNationalKnockoutRound(competition,round,stageIndex,afterDate) {
    const nation=primaryNationality(controlledPlayer()),pool=(NATIONAL_OPPONENTS[nationalConfederation(nation)]||NATIONAL_OPPONENTS.other).filter(item=>item!==nation&&!state.schedule.some(fixture=>fixture.international&&fixture.opponent===item)),opponent=seededShuffle(pool,`national-ko|${competition}|${state.season}|${round}`)[0]||"国家队淘汰赛对手",date=findAvailableFixtureDate(addDays(afterDate,round==="决赛"?5:4));
    state.schedule.push({id:`nat-ko-${state.season}-${stageIndex}-${Date.now()}`,date,competition,round,stageIndex,phase:"knockout",knockout:true,international:true,teamName:nation,opponent,opponentStrength:NATIONAL_TEAM_STRENGTH[opponent]||76,home:stableScoutingUnit(`${competition}|${round}|home`)>.5,neutral:true,status:"upcoming",score:null});state.schedule.sort((a,b)=>a.date.localeCompare(b.date));return opponent;
  }

  function handleCompetitionProgress(fixture,result) {
    const club=clubById(state.clubId),league=leagueOf(club);
    const domesticCups=[league.cup,league.extraCup].filter(Boolean);
    if(domesticCups.includes(fixture.competition)){
      const rounds=CUP_ROUNDS[fixture.competition];
      const stage=fixture.stageIndex||0;
      state.competitionProgress.cups[fixture.competition]={stage,eliminated:!result.won};
      if(!result.won)return;
      if(stage>=rounds.length-1){state.honors.unshift({name:`${fixture.competition}冠军`,season:state.season,scope:"俱乐部"});return;}
      const used=state.schedule.filter(item=>item.competition===fixture.competition).map(item=>item.opponent);
      state.schedule.push({id:`cup-${fixture.competition}-${state.season}-${stage+1}`,date:findAvailableFixtureDate(cupRoundTargetDate(fixture.competition,stage+1,state.season)),competition:fixture.competition,round:rounds[stage+1],stageIndex:stage+1,phase:"knockout",knockout:true,opponent:drawDomesticOpponent(club,used),home:Math.random()<.5,status:"upcoming",score:null});
      state.schedule.sort((a,b)=>a.date.localeCompare(b.date));
      return;
    }
    if(fixture.international){
      const progress=state.competitionProgress.international[fixture.competition]||=( {played:0,points:0,gf:0,ga:0,eliminated:false,stageIndex:-1} );progress.played++;progress.gf+=result.ours;progress.ga+=result.theirs;
      if(fixture.phase!=="knockout")progress.points+=result.ours>result.theirs?3:result.draw?1:0;
      if(fixture.phase==="group"&&progress.played===3){
        const qualifies=progress.points>=4||(progress.points===3&&stableScoutingUnit(`national-third|${fixture.competition}|${state.season}|${fixture.teamName}`)>.46);if(!qualifies){progress.eliminated=true;addNotification({title:`${fixture.competition}：小组赛出局`,type:"competition",date:fixture.date,detail:"球队未能进入小组前两名或成绩最好的小组第三名行列。",facts:[`小组赛：${progress.points} 分`,`进 ${progress.gf} 球 / 失 ${progress.ga} 球`]});return;}
        const rounds=NATIONAL_KNOCKOUT_ROUNDS[fixture.competition]||["八强","半决赛","决赛"],opponent=scheduleNationalKnockoutRound(fixture.competition,rounds[0],0,fixture.date);progress.stageIndex=0;addNotification({title:`${fixture.competition}：晋级${rounds[0]}`,type:"competition",date:fixture.date,detail:`国家队从小组赛出线，下一场对阵 ${opponent}。`,facts:[`小组赛：${progress.points} 分`,`进 ${progress.gf} 球 / 失 ${progress.ga} 球`]});return;
      }
      if(fixture.phase==="league"){
        const target=fixture.competition==="欧国联"?6:8;if(progress.played<target)return;
        if(fixture.competition==="欧国联"&&progress.points>=10){const opponent=scheduleNationalKnockoutRound(fixture.competition,"八强",0,fixture.date);progress.stageIndex=0;addNotification({title:"欧国联：晋级八强",type:"competition",date:fixture.date,detail:`国家队完成联赛阶段，八强将对阵 ${opponent}。`,facts:[`联赛阶段：${progress.points} 分`,`进 ${progress.gf} 球 / 失 ${progress.ga} 球`]});}
        else if(fixture.competition==="世界杯预选赛"){const qualified=progress.points>=13;if(qualified)state.honors.unshift({name:"晋级世界杯正赛",season:state.season,scope:"国家队"});addNotification({title:`世界杯预选赛：${qualified?"获得正赛资格":"未能直接晋级"}`,type:"competition",date:fixture.date,detail:qualified?"国家队在预选赛中达到晋级线。":"国家队积分未达到直接晋级线。",facts:[`预选赛：${progress.points} 分`,`进 ${progress.gf} 球 / 失 ${progress.ga} 球`]});}
        return;
      }
      if(fixture.phase==="knockout"){
        const rounds=NATIONAL_KNOCKOUT_ROUNDS[fixture.competition]||["八强","半决赛","决赛"],index=Math.max(0,rounds.findIndex(round=>fixture.round.includes(round)));if(!result.won){progress.eliminated=true;addNotification({title:`${fixture.competition}：${fixture.round}出局`,type:"competition",date:fixture.date,detail:`国家队未能战胜 ${fixture.opponent}。`,facts:[`比分：${result.ours}-${result.theirs}`]});return;}
        if(index>=rounds.length-1){state.honors.unshift({name:`${fixture.competition}冠军`,season:state.season,scope:"国家队"});addNotification({title:`${fixture.competition}：国家队夺冠`,type:"competition",date:fixture.date,detail:`国家队在决赛中击败 ${fixture.opponent}。`,facts:[`决赛比分：${result.ours}-${result.theirs}`]});return;}
        const opponent=scheduleNationalKnockoutRound(fixture.competition,rounds[index+1],index+1,fixture.date);progress.stageIndex=index+1;addNotification({title:`${fixture.competition}：晋级${rounds[index+1]}`,type:"competition",date:fixture.date,detail:`国家队淘汰 ${fixture.opponent}，下一场对阵 ${opponent}。`,facts:[`本场比分：${result.ours}-${result.theirs}`]});return;
      }
      return;
    }
    const config=EUROPEAN_COMPETITION_BY_NAME[fixture.competition];if(!config)return;
    state.competitionProgress.europe||={};const progress=state.competitionProgress.europe[config.key]||=( {played:0,points:0,gf:0,ga:0,position:null,eliminated:false,knockoutStage:-1} );
    if(fixture.phase==="league"){
      progress.played++;progress.points+=result.ours>result.theirs?3:result.draw?1:0;progress.gf+=result.ours;progress.ga+=result.theirs;
      if(progress.played<config.matches)return;
      progress.position=europeanLeaguePosition(state,config.key)||estimateEuropeanLeaguePosition(progress,club,config);
      if(progress.position>24){progress.eliminated=true;addNotification({title:`${config.name}：联赛阶段第 ${progress.position} 名，未能晋级`,type:"competition",date:fixture.date,detail:`${config.name}联赛阶段已经结束。第 25 至 36 名直接出局，不会降入其他欧战。`,facts:[`战绩：${progress.points} 分，进 ${progress.gf} 球 / 失 ${progress.ga} 球`,`联赛阶段排名：第 ${progress.position} 名`,`赛事状态：已出局`]});return;}
      const direct=progress.position<=8,round=direct?"十六强":"淘汰赛附加赛",stageIndex=direct?1:0,opponent=scheduleEuropeanKnockoutRound(config,round,stageIndex,fixture.date,direct?35:14);
      progress.knockoutStage=stageIndex;
      addNotification({title:`${config.name}：联赛阶段第 ${progress.position} 名，${direct?"直接晋级十六强":"进入淘汰赛附加赛"}`,type:"competition",date:fixture.date,detail:`${config.name}联赛阶段已经结束。球队将对阵 ${opponent}，${direct?"无需参加附加赛":"通过两回合比赛争夺十六强席位"}。`,facts:[`战绩：${progress.points} 分，进 ${progress.gf} 球 / 失 ${progress.ga} 球`,`联赛阶段排名：第 ${progress.position} 名`,direct?"晋级路径：直接进入十六强":"晋级路径：淘汰赛附加赛"]});
      return;
    }
    if(fixture.phase==="knockout"){
      const round=fixture.stageName||fixture.round,currentIndex=Math.max(0,EUROPEAN_KNOCKOUT_ROUNDS.findIndex(item=>round.includes(item)));
      if(fixture.leg===1)return;
      if(!result.won){progress.eliminated=true;addNotification({title:`${config.name}：${round}出局`,type:"competition",date:fixture.date,detail:`球队未能越过 ${fixture.opponent}。${fixture.aggregate?`两回合总比分 ${fixture.aggregate.ours}-${fixture.aggregate.theirs}。`:"本场比赛已结束。"}`,facts:[`对手：${fixture.opponent}`,"赛事状态：已出局"]});return;}
      if(currentIndex>=EUROPEAN_KNOCKOUT_ROUNDS.length-1){state.honors.unshift({name:`${config.fullName}冠军`,season:state.season,scope:"俱乐部"});addNotification({title:`${config.name}：球队夺得冠军`,type:"competition",date:fixture.date,detail:`球队赢得${config.fullName}决赛。`,facts:[`决赛对手：${fixture.opponent}`,"赛事状态：冠军"]});return;}
      const nextIndex=currentIndex+1,nextRound=EUROPEAN_KNOCKOUT_ROUNDS[nextIndex],opponent=scheduleEuropeanKnockoutRound(config,nextRound,nextIndex,fixture.date,nextRound==="决赛"?24:21);
      progress.knockoutStage=nextIndex;addNotification({title:`${config.name}：晋级${nextRound}`,type:"competition",date:fixture.date,detail:`球队淘汰 ${fixture.opponent}，下一轮将对阵 ${opponent}。`,facts:[fixture.aggregate?`两回合总比分：${fixture.aggregate.ours}-${fixture.aggregate.theirs}`:`本场比分：${result.ours}-${result.theirs}`,`下一轮：${nextRound}`]});
    }
  }

  function updatePlayerAbility(p,rating) {
    ensurePlayerDevelopment(p,state.season);
    state.reputation=clamp(Math.round(state.reputation+(rating-6)*.08),1,99);
  }
  function updateCoachAbility(won,draw,tactical) {const c=state.coachProfile;const chance=(won?.12:draw?.035:-.025)+(tactical-70)/800;if(chance>0&&Math.random()<chance){c.overall=clamp(c.overall+1,1,99);c.tactics=clamp(c.tactics+(Math.random()<.5?1:0),1,99);}if(chance<0&&Math.random()<Math.abs(chance)){c.overall=clamp(c.overall-1,1,99);}state.reputation=c.overall;}

  function settlePlayerSeason(player) {
    const development=ensurePlayerDevelopment(player,state.season),start=Number(development.startOverall||player.overall||65),potentialResult=dynamicPotentialAssessment(player,state),score=playerDevelopmentScore(player),gap=Math.max(0,Number(player.potential||player.overall)-Number(player.overall||0));
    const annualTarget=annualPlayerGrowthTarget(player,score);let change=annualTarget;
    if(change>0)change=Math.max(0,change-Number(development.inSeasonGrowth||0));
    if(change>0&&!gap)change=0;
    if(change>gap)change=gap;
    player.overall=clamp(Number(player.overall||65)+change,40,99);adjustPlayerCoreAttributes(player,change,development);
    const seasonalChange=Number(player.overall||65)-start;recordAttributeDevelopment(player,development.startAttributes,{season:state.season,reason:"赛季发展",overallChange:seasonalChange});
    const seasonRecord={season:state.season,club:clubById(state.clubId).name,clubId:state.clubId,appearances:Number(player.appearances||0),goals:Number(player.goals||0),assists:Number(player.assists||0),average:Number((averageRating(player)||0).toFixed(2)),overallStart:start,overallEnd:player.overall,change:seasonalChange,potentialStart:Number(development.startPotential||potentialResult?.before||player.potential),potentialEnd:Number(player.potential),potentialChange:Number(player.potential)-Number(development.startPotential||potentialResult?.before||player.potential)};
    ["keyPasses","chancesCreated","successfulDribbles","progressivePasses","tackles","tacklesWon","interceptions","clearances","blocks","duels","duelsWon","recoveries","pressuresWon","saves","cleanSheets"].forEach(key=>{seasonRecord[key]=Number(player[key]||0);});
    player.careerStats=[...(player.careerStats||[]),seasonRecord].slice(-12);
    if(state.role==="player"&&player.id===state.controlledId&&potentialResult?.change)addNotification({title:`潜力重新评估：${player.name} ${potentialResult.change>0?"上调":"下调"}至 ${player.potential}`,type:"general",date:state.date,detail:potentialResult.reason,facts:[`潜力：${potentialResult.before} → ${potentialResult.after}`,`本季 ${player.appearances||0} 场 · 场均 ${(averageRating(player)||0).toFixed(2)}`,`当前能力：${player.overall}`]});
    return {player,change:seasonalChange,settlementChange:change,annualTarget,score,potentialResult};
  }

  function nextTransferWindowOpening(date,season=state.season) {
    const summer=`${season}-06-15`,winter=`${season+1}-01-01`,nextSummer=`${season+1}-06-15`;
    if(date<summer)return summer;
    if(date<winter)return winter;
    if(date<=`${season+1}-02-02`)return date;
    return nextSummer;
  }

  function submitPlayerSigningSuggestion(player) {
    const career=ensurePlayerCareer(),club=clubById(state.clubId),market=ensureTransferMarket(state),recommendations=transferRecommendations(20),target=recommendations.find(item=>item.id===player.id);
    if(!career||!target){toast("这名球员已经不在可执行的引援名单中");return false;}
    const key=`${state.season}:${target.id}`,existing=career.signingSuggestions.find(item=>item.key===key&&["active","shortlisted","completed"].includes(item.status));
    if(existing){toast(existing.status==="completed"?"这项引援已经完成":"教练组正在处理这项建议");return false;}
    const sourceId=target.clubId||currentPlayerClubId(state,target),source=clubById(sourceId),roleNeed=transferSquadNeeds()[target.role]||{score:0,average:club.prestige-8},budget=Number(market.budgets[club.id]||state.funds||0),fee=Number(transferFee(target,club,source,market.sequence,state).toFixed(1)),fit=clamp((target.overall-roleNeed.average)*.8+roleNeed.score*.7, -12, 18),trust=(career.trust-50)*.32,roleFit=target.overall>=club.prestige-6?8:0,adoptionChance=clamp(Math.round(48+trust+fit+roleFit+(budget>=fee?10:-28)+(career.relationships.coach-50)*.18),8,92),windowStart=nextTransferWindowOpening(state.date,state.season),windowInfo=transferWindow(windowStart,state.season),accepted=budget>=fee&&stableScoutingUnit(`${key}|signing-suggestion`)<=adoptionChance/100;
    const suggestion={key,id:`suggestion-${Date.now()}`,date:state.date,playerId:target.id,playerName:target.name,status:accepted?"active":"rejected",adoptionChance,fee};career.signingSuggestions.unshift(suggestion);career.signingSuggestions=career.signingSuggestions.slice(0,30);
    if(accepted){
      const resolveDate=windowInfo.open?addDays(state.date,Math.round(rand(4,9))):windowStart,rumor={id:`player-suggestion-${state.season}-${++market.sequence}`,season:state.season,windowKey:windowInfo.key,createdDate:state.date,resolveDate,status:"active",playerId:target.id,sourcePlayerId:target.id,playerName:target.name,position:target.position,overall:target.overall,potential:target.potential,fromId:source.id,toId:club.id,fee,confidence:clamp(adoptionChance+8,45,96),reason:`球员建议补强：${target.reason}`};market.rumors.unshift(rumor);suggestion.rumorId=rumor.id;state.transferRequestsLog.unshift({id:suggestion.id,date:state.date,type:"player-signing-suggestion",playerId:target.id,playerName:target.name,fromId:source.id,toId:club.id,status:"active"});addNotification({title:`教练组采纳你的引援建议：${target.name}`,type:"transfer",date:state.date,detail:windowInfo.open?`球探部门已向 ${source.name} 发出正式接触，预计 ${formatDate(resolveDate,false)} 前给出结果。`:`建议已进入下一次转会窗的优先清单，届时会自动推进正式报价。`,facts:[`预计费用：${money(fee)}`,`位置适配：${playerRoleLabel(target.position)}`,`采纳概率：${adoptionChance}%`]});
    }else{state.transferRequestsLog.unshift({id:suggestion.id,date:state.date,type:"player-signing-suggestion",playerId:target.id,playerName:target.name,fromId:source.id,toId:club.id,status:"rejected"});addNotification({title:`教练组暂不采纳引援建议：${target.name}`,type:"transfer",date:state.date,detail:budget<fee?"球探认可球员，但当前预算不足以推进正式报价。":"教练组认为当前阵容需求或球员适配度还不足以启动谈判。",facts:[`预计费用：${money(fee)}`,`建议采纳概率：${adoptionChance}%`,`教练信任：${Math.round(career.trust)}%`]});}
    career.interactionHistory.unshift({date:state.date,type:"signing-suggestion",title:`建议引进 ${target.name}`,status:suggestion.status});career.lastOutcome=accepted?`教练组已采纳你关于${target.name}的引援建议`:`教练组暂不采纳${target.name}的引援建议`;modal=null;saveState();render();toast(career.lastOutcome);return accepted;
  }

  function confirmTransfer() {
    const p=modal?.player;if(!p){modal=null;render();return;}
    if(state.role==="player"){submitPlayerSigningSuggestion(p);return;}
    startNegotiation(p);
  }

  function requestTransfer() {
    const p=controlledPlayer();if(!p||["submitted","offer-received"].includes(p.transferRequestStatus))return;
    state.transferRequests++;p.transferRequestStatus="submitted";p.morale=clamp(p.morale-4,0,100);
    const club=clubById(state.clubId),likely=playerTransferRequestChance(state,p),request={id:`request-${Date.now()}`,date:state.date,type:"player-request",playerId:p.id,playerName:p.name,status:"submitted"};state.transferRequestsLog.unshift(request);
    addNotification({title:`董事会：已受理 ${state.person} 的转会申请`,type:"transfer",date:state.date,detail:`申请已进入优先买家池，经纪人会优先向符合预算和位置需求的俱乐部推荐你。当前获得正式报价的估计概率为 ${likely}%。`,facts:[`合同至 ${p.contract?.endSeason||state.season+2} 年`,`当前角色：${p.contract?.role||"轮换球员"}`,`解约金：${money(p.contract?.releaseClause||0)}`]});
    state.media.unshift({source:"Transfer Desk",title:`${state.person} 向 ${club.name} 提交正式转会申请`,body:`离队意愿已进入优先买家池。按照当前能力、表现和合同状态，获得合适正式报价的估计概率为 ${likely}%。`,date:state.date,type:"transfer"});
    let offer=null;const windowInfo=transferWindow(state.date,state.season);if(windowInfo.open){aiTransferRuntimeCache=createAiTransferRuntimeCache(state,state.date);try{offer=createPlayerTransferRequestOffer(state,state.date);}finally{aiTransferRuntimeCache=null;}}
    if(offer)modal={type:"playerTransferOffer",id:offer.id};saveState();render();toast(offer?"已有俱乐部立即送来正式报价":"正式转会申请已提交，市场会优先寻找买家");
  }

  const LEAGUE_LADDERS={英格兰:["ENG1","ENG2","ENG3"],西班牙:["ESP1","ESP2","ESP3"],德国:["GER1","GER2","GER3"],意大利:["ITA1","ITA2","ITA3"],法国:["FRA1","FRA2","FRA3"]};
  const PROMOTION_RULES={英格兰:{direct:2,total:3,playoff:"lower"},西班牙:{direct:2,total:3,playoff:"lower"},德国:{direct:2,total:3,playoff:"versus"},意大利:{direct:2,total:3,playoff:"lower"},法国:{direct:2,total:3,playoff:"versus"}};

  function simulatedFinalLeagueTable(save,leagueId,season=save.season) {
    const current=save.majorLeagueWorld?.leagues?.[leagueId],members=CLUBS.filter(club=>club.league===leagueId);
    if(current&&current.clubs.length===members.length&&current.clubs.some(club=>club.p>0))return majorStandings(current).map(club=>({...club}));
    const matches=Number(LEAGUES[leagueId]?.matches||Math.max(2,(members.length-1)*2)),ordered=members.map(club=>({club,score:Number(club.prestige||60)+(stableScoutingUnit(`league-final|${season}|${leagueId}|${club.id}`)-.5)*17})).sort((a,b)=>b.score-a.score||a.club.name.localeCompare(b.club.name,"zh-CN"));
    return ordered.map((entry,index)=>{const strength=(ordered.length-index-1)/Math.max(1,ordered.length-1),points=clamp(Math.round(matches*(.72+strength*.98)+(stableScoutingUnit(`league-points|${season}|${entry.club.id}`)-.5)*7),Math.round(matches*.35),matches*3),wins=Math.min(matches,Math.floor(points/3)),draws=Math.min(matches-wins,points-wins*3),losses=Math.max(0,matches-wins-draws),gf=Math.max(12,Math.round(matches*(.78+strength*.92))),ga=Math.max(10,Math.round(matches*(1.5-strength*.78)));return {id:entry.club.id,name:entry.club.name,code:entry.club.code,prestige:entry.club.prestige,ability:entry.club.prestige,p:matches,w:wins,d:draws,l:losses,gf,ga,gd:gf-ga,pts:points,form:[]};});
  }

  function playoffPromotedClub(save,lowerTable,rule,country,boundary) {
    if(rule.playoff==="lower"){const pool=lowerTable.slice(rule.direct,Math.min(lowerTable.length,rule.direct+4));return [...pool].sort((a,b)=>(Number(b.prestige||clubById(b.id).prestige)+stableScoutingUnit(`promotion-playoff|${save.season}|${boundary}|${b.id}`)*8)-(Number(a.prestige||clubById(a.id).prestige)+stableScoutingUnit(`promotion-playoff|${save.season}|${boundary}|${a.id}`)*8))[0]||lowerTable[rule.direct];}
    return lowerTable[rule.direct]||null;
  }

  function archiveSeasonCompetitions(save,leagueRecords) {
    const history=ensureWorldHistory(save),season=save.season,userClub=clubById(save.clubId),userHonor=name=>(save.honors||[]).some(item=>item.season===season&&item.scope==="俱乐部"&&item.name===name),pickFinalists=(key,candidates)=>[...candidates].map(club=>({club,score:Number(club.prestige||60)+stableScoutingUnit(`${key}|${season}|${club.id}`)*15})).sort((a,b)=>b.score-a.score).slice(0,2).map(item=>item.club);
    Object.entries(leagueRecords).forEach(([leagueId,record])=>{recordCompetitionSeason(save,LEAGUES[leagueId].name,{...record,kind:"league"});if(record.championId)recordClubHonor(save,record.championId,`${LEAGUES[leagueId].name}冠军`,season,LEAGUES[leagueId].name,{type:"league"});});
    const cupNames=[...new Set(Object.values(LEAGUES).map(league=>league.cup).filter(Boolean))];cupNames.forEach(cup=>{const candidates=CLUBS.filter(club=>leagueOf(club)?.cup===cup),[simChampion,simRunnerUp]=pickFinalists(`cup|${cup}`,candidates),champion=userHonor(`${cup}冠军`)?userClub:simChampion,runnerUp=champion?.id===simChampion?.id?simRunnerUp:simChampion;recordCompetitionSeason(save,cup,{season,kind:"cup",champion:champion?.name||"待定",championId:champion?.id||null,runnerUp:runnerUp?.name||"待定",matches:Math.round(candidates.length*1.8),goals:Math.round(candidates.length*4.4)});if(champion)recordClubHonor(save,champion.id,`${cup}冠军`,season,cup,{type:"cup"});});
    const europeanRanked=CLUBS.filter(club=>leagueOf(club)?.tier===1).sort((a,b)=>b.prestige-a.prestige);Object.values(EUROPEAN_COMPETITIONS).forEach(config=>{const candidates=config.key==="ucl"?europeanRanked.slice(0,40):config.key==="uel"?europeanRanked.slice(24,68):europeanRanked.slice(46),[simChampion,simRunnerUp]=pickFinalists(`europe|${config.key}`,candidates),honorName=`${config.fullName}冠军`,champion=userHonor(honorName)?userClub:simChampion,runnerUp=champion?.id===simChampion?.id?simRunnerUp:simChampion,progress=save.competitionProgress?.europe?.[config.key];recordCompetitionSeason(save,config.fullName,{season,kind:"europe",shortName:config.name,champion:champion?.name||"待定",championId:champion?.id||null,runnerUp:runnerUp?.name||"待定",participants:36,matches:config.key==="uecl"?141:189,goals:Math.round((config.key==="ucl"?3.02:2.83)*(config.key==="uecl"?141:189)),userClubId:progress?save.clubId:null,userStage:progress?userHonor(honorName)?"冠军":progress.eliminated?"出局":progress.position?`联赛阶段第 ${progress.position} 名`:"参赛中":null,userPoints:progress?.points??null,userGoalsFor:progress?.gf??null,userGoalsAgainst:progress?.ga??null});if(champion)recordClubHonor(save,champion.id,honorName,season,config.fullName,{type:"europe"});});
    const scheduledNational=[...new Set([...(save.schedule||[]).filter(fixture=>fixture.international).map(fixture=>fixture.competition),...["英格兰","阿根廷","摩洛哥","日本"].map(nation=>nationalCompetitionFor(nation,season))])];scheduledNational.filter(Boolean).forEach(name=>{const nations=[...new Set(Object.values(NATIONAL_OPPONENTS).flat())],ranked=nations.map(nation=>({nation,score:Number(NATIONAL_TEAM_STRENGTH[nation]||74)+stableScoutingUnit(`national-final|${name}|${season}|${nation}`)*13})).sort((a,b)=>b.score-a.score),controlledNation=save.role==="player"?primaryNationality(controlledPlayer()):null,nationalWon=(save.honors||[]).some(item=>item.season===season&&item.scope==="国家队"&&item.name===`${name}冠军`),champion=nationalWon&&controlledNation?controlledNation:ranked[0]?.nation,runnerUp=ranked.find(item=>item.nation!==champion)?.nation,progress=save.competitionProgress?.international?.[name];recordCompetitionSeason(save,name,{season,kind:"national",champion,runnerUp,matches:["世界杯","欧洲杯"].includes(name)?64:Math.max(24,nations.length*2),goals:["世界杯","欧洲杯"].includes(name)?172:Math.round(nations.length*4.2),userTeam:progress?controlledNation:null,userStage:progress?nationalWon?"冠军":progress.eliminated?"出局":"完成赛程":null,userPoints:progress?.points??null,userGoalsFor:progress?.gf??null,userGoalsAgainst:progress?.ga??null});});
    history.seasons.unshift({season,date:save.date,leagueIds:Object.keys(leagueRecords),competitionCount:Object.values(history.competitions).filter(records=>records.some(item=>item.season===season)).length});history.seasons=history.seasons.filter((item,index,list)=>list.findIndex(other=>other.season===item.season)===index).slice(0,30);
  }

  function archiveWorldSeasonAndApplyPromotion(save) {
    const history=ensureWorldHistory(save),leagueRecords={},tables={},userLeagueId=clubById(save.clubId).league,userLeagueTitle=`${LEAGUES[userLeagueId].name}冠军`,userWonLeague=(save.honors||[]).some(item=>item.season===save.season&&item.scope==="俱乐部"&&item.name===userLeagueTitle);Object.keys(LEAGUES).forEach(leagueId=>{const table=simulatedFinalLeagueTable(save,leagueId,save.season),userIndex=leagueId===userLeagueId&&userWonLeague?table.findIndex(club=>club.id===save.clubId):-1;if(userIndex>0){const [userRow]=table.splice(userIndex,1);table.unshift({...userRow,p:Number(save.played||userRow.p),w:Number(save.wins||userRow.w),d:Number(save.draws||userRow.d),l:Number(save.losses||userRow.l),pts:Number(save.points||userRow.pts)});}tables[leagueId]=table;leagueRecords[leagueId]={season:save.season,leagueId,champion:table[0]?.name||"待定",championId:table[0]?.id||null,runnerUp:table[1]?.name||"待定",matches:Math.round(table.reduce((sum,club)=>sum+Number(club.p||0),0)/2),goals:Math.round(table.reduce((sum,club)=>sum+Number(club.gf||0),0)),topScorer:save.majorLeagueWorld?.leagues?.[leagueId]?.scorers?.[0]?.name||"赛季数据模拟",topScorerGoals:save.majorLeagueWorld?.leagues?.[leagueId]?.scorers?.[0]?.goals||Math.round(18+stableScoutingUnit(`scorer|${save.season}|${leagueId}`)*15),table:table.map((club,index)=>({position:index+1,id:club.id,name:club.name,p:club.p,w:club.w,d:club.d,l:club.l,gf:club.gf,ga:club.ga,gd:club.gd,pts:club.pts})),promoted:[],relegated:[],incomingPromoted:[],incomingRelegated:[]};});
    const changes=[];Object.entries(LEAGUE_LADDERS).forEach(([country,ladder])=>{const rule=PROMOTION_RULES[country];for(let level=0;level<ladder.length-1;level++){const upperId=ladder[level],lowerId=ladder[level+1],upper=tables[upperId]||[],lower=tables[lowerId]||[];if(!upper.length||!lower.length)continue;const promoted=lower.slice(0,rule.direct),relegated=upper.slice(-rule.total);if(rule.playoff==="lower"){const winner=playoffPromotedClub(save,lower,rule,country,`${upperId}-${lowerId}`);if(winner&&!promoted.some(item=>item.id===winner.id))promoted.push(winner);}else{const lowerCandidate=lower[rule.direct],upperCandidate=upper[upper.length-rule.total],lowerScore=Number(clubById(lowerCandidate?.id).prestige||0)+stableScoutingUnit(`versus|${save.season}|${upperId}|${lowerCandidate?.id}`)*8,upperScore=Number(clubById(upperCandidate?.id).prestige||0)+stableScoutingUnit(`versus|${save.season}|${upperId}|${upperCandidate?.id}`)*8;if(lowerCandidate&&upperCandidate&&lowerScore>upperScore)promoted.push(lowerCandidate);else relegated.splice(0,1);}
      promoted.slice(0,rule.total).forEach(club=>changes.push({clubId:club.id,clubName:club.name,fromId:lowerId,toId:upperId,type:"promoted",season:save.season}));relegated.slice(-promoted.length).forEach(club=>changes.push({clubId:club.id,clubName:club.name,fromId:upperId,toId:lowerId,type:"relegated",season:save.season}));leagueRecords[upperId].relegated.push(...relegated.slice(-promoted.length).map(club=>club.name));leagueRecords[upperId].incomingPromoted.push(...promoted.slice(0,rule.total).map(club=>club.name));leagueRecords[lowerId].promoted.push(...promoted.slice(0,rule.total).map(club=>club.name));leagueRecords[lowerId].incomingRelegated.push(...relegated.slice(-promoted.length).map(club=>club.name));}});
    archiveSeasonCompetitions(save,leagueRecords);changes.forEach(change=>{save.worldClubLeagues[change.clubId]=change.toId;const club=clubById(change.clubId);club.league=change.toId;});history.promotions.unshift(...changes);history.promotions=history.promotions.slice(0,300);const userChange=changes.find(change=>change.clubId===save.clubId);if(userChange)addNotification({title:`联赛变动：${userChange.type==="promoted"?"升级":"降级"}至 ${LEAGUES[userChange.toId].name}`,type:"competition",date:save.date,detail:`赛季最终排名触发了正式升降级。下赛季赛程、转播收入、转会预算和对手将全部按照 ${LEAGUES[userChange.toId].name} 重新生成。`,facts:[`${LEAGUES[userChange.fromId].name} → ${LEAGUES[userChange.toId].name}`,`生效赛季：${save.season+1}/${String(save.season+2).slice(2)}`]});return {leagueRecords,changes,userChange};
  }

  function returnControlledPlayerFromLoan() {
    if(state.role!=="player")return false;
    const career=ensurePlayerCareer(),player=controlledPlayer(),parentId=career?.loanParentClubId;
    if(!career||!player||!parentId||Number(career.loanEndSeason)>Number(state.season))return false;
    const parent=clubById(parentId);if(!parent)return false;
    const from=clubById(state.clubId),record={id:`loan-return-${state.season}-${Date.now()}`,type:"loan-return",season:state.season,windowKey:"season-end",date:state.date,playerId:player.sourcePlayerId||player.id,playerName:player.name,position:player.position,overall:player.overall,potential:player.potential,fromId:from.id,toId:parent.id,fee:0,reason:"赛季租借结束自动回归母队",contract:{...(player.contract||{})},careerHistory:[...(player.careerStats||[])]};
    const moved={...player,club:parent.id,clubId:parent.id,joinedDate:state.date,transferRequestStatus:"none",lastSelectionStatus:null,fitness:clamp(Number(player.fitness||80)+5,25,100),morale:clamp(Number(player.morale||75)+3,25,100)};
    const squad=createSquad(parent,moved),index=squad.findIndex(item=>item.id==="controlled");if(index>=0)squad[index]=moved;else squad.push(moved);
    state.clubId=parent.id;state.squad=squad.sort((a,b)=>positionSortRank(a.position)-positionSortRank(b.position));state.controlledId="controlled";state.schedule=generateSchedule(parent,state.season,moved).filter(fixture=>fixture.date>=state.date);state.played=0;state.wins=0;state.draws=0;state.losses=0;state.points=0;state.leaguePosition=1;state.competitionProgress={europe:createEuropeanProgress(parent,state.season),cups:{},international:{}};state.majorLeagueWorld=createMajorLeagueWorld(state.season,parent.id);state.majorLeagueId=parent.league;rebuildEuropeanWorld(state);state.funds=Number(state.transferMarket?.budgets?.[parent.id]||parent.budget||10);
    const market=ensureTransferMarket(state);market.clubOverrides[moved.sourcePlayerId||moved.id]=parent.id;market.records.unshift(record);state.transferHistory=Array.isArray(state.transferHistory)?state.transferHistory:[];state.transferHistory.unshift(record);state.transferHistory=state.transferHistory.slice(0,500);
    career.loanParentClubId=null;career.loanEndSeason=null;career.loanSearchUntil=null;career.contractStance="租借回归";career.status="回到母队，重新竞争位置";career.trust=clamp(career.trust+2,0,100);career.chemistry=clamp(career.chemistry-3,0,100);career.relationships={...career.relationships,coach:clamp(Number(career.relationships.coach||50)-2,0,100),teammates:clamp(Number(career.relationships.teammates||50)-4,0,100)};
    addNotification({title:`租借期满：${moved.name} 回归 ${parent.name}`,type:"transfer",date:state.date,detail:`你在 ${from.name} 的租借期已经结束，母队已重新登记你的合同与注册资格。租借期间的出场、进球、助攻和评分已保留在职业档案。`,facts:[`${from.name} → ${parent.name}`,`当前合同至 ${moved.contract?.endSeason||state.season+2} 年`,`回归后角色：重新竞争` ]});state.media.unshift({source:"Transfer Desk",title:`${moved.name} 租借回归 ${parent.name}`,body:`在 ${from.name} 完成一个赛季的历练后，${moved.name} 回到母队。`,date:state.date,type:"transfer"});return true;
  }

  function retire() {state.retired=true;state.history.unshift({season:state.season,club:clubById(state.clubId).name,played:state.played,wins:state.wins,position:state.leaguePosition});state.media.unshift({source:"Football Daily",title:`${state.person} 宣布结束职业生涯`,body:"一段足球生涯在今天落幕，完整比赛、数据和荣誉记录将永久保留。",date:state.date,type:"career"});modal=null;saveState();render();toast("职业生涯已归档");}

  function newSeason() {
    const transitionDate=state.date;
    archiveSeasonFixtures(state);
    state.history.unshift({season:state.season,club:clubById(state.clubId).name,clubId:state.clubId,leagueId:clubById(state.clubId).league,league:LEAGUES[clubById(state.clubId).league].name,played:state.played,wins:state.wins,position:state.leaguePosition,points:state.points});
    if(state.leaguePosition===1)state.honors.unshift({name:LEAGUES[clubById(state.clubId).league].name+"冠军",season:state.season,scope:"俱乐部"});
    if(state.role==="player"&&averageRating(controlledPlayer())>=7.6)state.honors.unshift({name:"赛季最佳球员",season:state.season,scope:"个人"});
    archiveWorldSeasonAndApplyPromotion(state);
    syncManagedSquadWorldStats(state);archiveWorldPlayerSeason(state);
    const developmentResults=state.squad.map(settlePlayerSeason),growthLeaders=developmentResults.filter(item=>item.change!==0).sort((a,b)=>b.change-a.change).slice(0,3),retiredPlayers=collectSeasonRetirements(state,state.season);if(retiredPlayers.length)state.squad=state.squad.filter(player=>!retiredPlayers.includes(player));
    returnControlledPlayerFromLoan();
    const nextSeasonFinances=seasonFinancePlans(state,state.season+1,previousClubLeaguePositions(state));
    state.season++;state.date=transitionDate;state.schedule=generateSchedule(clubById(state.clubId),state.season);state.fixtureSeasonFilter="current";state.fixtureFilter="all";state.wins=0;state.draws=0;state.losses=0;state.points=0;state.leaguePosition=1;state.competitionProgress={europe:createEuropeanProgress(clubById(state.clubId),state.season),cups:{},international:{}};state.backgroundWorld=createBackgroundWorld(state.season);state.worldLeague=Object.keys(state.backgroundWorld.leagues)[0]||"BRA1";state.majorLeagueWorld=createMajorLeagueWorld(state.season,state.clubId);state.majorLeagueId=clubById(state.clubId).league;state.europeanWorld=createEuropeanWorld(state);state.europeanRoundFilters={};state.transferMarket=createTransferMarket(state.season,nextSeasonFinances.budgets);repairTransferOwnership(state,state.transferMarket);state.funds=Number(nextSeasonFinances.budgets[state.clubId]||clubById(state.clubId).budget||10);const financeReport=activateSeasonFinances(state,nextSeasonFinances,state.date);simulateTransferMarket(state,state.date);
    state.squad.forEach(p=>{p.age++;p.appearances=0;p.goals=0;p.assists=0;p.form=0;p.lastRating=null;p.ratingTotal=0;p.fitness=95;p.consecutiveStarts=0;p.lastMatchMinutes=0;p.lastMatchDate=null;p.lastSelectionStatus=null;["tackles","tacklesWon","interceptions","clearances","blocks","duels","duelsWon","saves","cleanSheets","keyPasses","chancesCreated","successfulDribbles","progressivePasses","recoveries","pressuresWon","yellowCards","redCards"].forEach(key=>{p[key]=0;});ensurePlayerDevelopment(p,state.season);});syncManagedSquadWorldStats(state);resetSeasonMarketValueBaseline(state);
    rolloverYouthSeason(state).forEach(graduate=>addNotification({title:`AI 教练提拔青训球员：${graduate.name}`,type:"youth",date:state.date,detail:"教练组根据年龄、当前能力、潜力和一线队名额完成了青训晋升。",facts:[`${playerRoleLabel(graduate.position)} · ${graduate.age} 岁`,`当前能力：${graduate.overall}`,`合同角色：${graduate.contract.role}`]}));
    if(state.role==="player"){
      const career=ensurePlayerCareer(),player=controlledPlayer();career.trainingDays=0;career.weeklyPlanChanges=0;career.weeklyPlanSetDate=state.date;career.matchPlan="balanced";career.matchPlanFixtureId=null;career.pendingIssues=[];career.story=null;career.nextStoryDate=addDays(state.date,10);career.selectionStreak=0;career.benchStreak=0;career.seasonObjectives=createPlayerObjectives(player);career.objectiveProgress={appearances:0,ratings:0,goals:0,assists:0,trust:Math.round(career.trust)};career.requests=career.requests.filter(item=>item.status==="pending");
    }
    if(growthLeaders.length)state.media.unshift({source:"Player Development",title:"赛季球员发展报告已发布",body:growthLeaders.map(item=>`${item.player.name} ${item.change>0?`提升 ${item.change} 点`:`下降 ${Math.abs(item.change)} 点`}`).join("；"),date:state.date,type:"career"});
    if(retiredPlayers.length){state.media.unshift({source:"Football Daily",title:`${retiredPlayers.map(player=>player.name).join("、")} 宣布退役`,body:"退役球员的完整生涯记录已经归档。达到精英能力级别的球员会进入隐藏的后续人才模板池。",date:state.date,type:"career"});addNotification({title:`一线队退役：${retiredPlayers.length} 名球员结束生涯`,type:"youth",date:state.date,detail:"退役球员已从一线队名单移除。高水平球员的国籍、位置和潜力轮廓可能在未来青训选拔中以匿名新秀形式重新出现。",facts:retiredPlayers.map(player=>`${player.name} · ${playerRoleLabel(player.position)} · ${player.age} 岁`)});}
    const broadcastFact=financeReport.league==="ENG1"?`英超转播分成：约 £${Math.round(financeReport.broadcast/1.18)}m（${money(financeReport.broadcast)} 等值）`:`联赛转播分成：${money(financeReport.broadcast)}`;addNotification({title:`董事会：${state.season}/${String(state.season+1).slice(2)} 赛季转会预算已批准`,type:"board",date:state.date,detail:"董事会综合上赛季排名、联赛转播分成、商业经营、比赛日收入预测、预算结转和老板投入，确定了新赛季可用转会资金。",facts:[broadcastFact,`商业与比赛日收入预测：${money(financeReport.commercial+financeReport.matchday)}`,`上季预算结转：${money(financeReport.carryover)}`,financeReport.ownerInvestment?`老板注资：${money(financeReport.ownerInvestment)}`:"本季暂无额外老板注资",`新赛季转会预算：${money(financeReport.transferBudget)}`]});state.media.unshift({source:"Club Finance",title:`${clubById(state.clubId).name} 公布新赛季转会预算`,body:`转播、商业经营、比赛日收入和预算结转共同形成 ${money(financeReport.transferBudget)} 的可用转会资金。`,date:state.date,type:"finance"});
    state.media.unshift({source:"Football Daily",title:`${state.season}/${String(state.season+1).slice(2)} 赛季准备期开始`,body:"赛季结算已经完成。日期不会跳过休赛期，夏季转会、国家队比赛、经纪事务和季前动态会随时间逐日推进。",date:state.date,type:"career"});saveState();render();toast("赛季结算完成，进入休赛期");
  }

  render();
})();
