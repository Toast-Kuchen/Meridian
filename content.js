'use strict';
// MERIDIAN 2.0 – Spielinhalte (Daten): Rohstoffe, Gebäude, Technologien, Jahreszeiten, Ziele, Meilensteine, Szenarien.
// Wird vor game.js geladen und enthält keine Spiellogik.

const VERSION = '2.0.0';
const ST5 = ['', 'Siedlung', 'Dorf', 'Stadt', 'Residenzstadt', 'Metropole'];
const POPST = [0, 0, 25, 60, 150, 250];           // Einwohner, ab denen die Stufe beginnt
const HALLCAP = [0, 100, 200, 400, 650, 900];     // Lagerplatz des Gemeindehauses je Stufe
const HALLN = ['', 'Gemeindehaus', 'Dorfzentrum', 'Rathaus', 'Residenz', 'Hauptstadtpalast'];
const RX = ['ore', 'iron', 'wool', 'cloth', 'beer', 'know'];
const RIX = { ore: '🔶', iron: '⛓️', wool: '🐑', cloth: '🧵', beer: '🍻', know: '📜' };
const RNX = { ore: 'Erz', iron: 'Eisen', wool: 'Wolle', cloth: 'Tuch', beer: 'Bier', know: 'Wissen' };
const NOCAP = ['coins', 'know'];                  // Rohstoffe ohne Lagergrenze
const PBX = { ore: 3.2, iron: 7, wool: 2.6, cloth: 5.5, beer: 4 };   // Grundpreise der neuen Waren

// ---- Neue Gebäude (zusätzlich zu den 19 aus Version 1) ----
const BX = {
  mine: { n: 'Erzmine', i: '⛏️', c: { wood: 15, tools: 3, coins: 15 }, st: 2, t: 2, h: 14, rh: 8, w: '#8a8478', r: '#5a4a3a', job: 3, prod: { ore: 3 }, need: 3,
    d: 'Fördert Erz aus den Hügeln (braucht Hügel in 2 Feldern Umkreis). In der Schmelze wird daraus Eisen.' },
  smelter: { n: 'Schmelze', i: '🏭', c: { wood: 20, stone: 15, coins: 30 }, st: 2, t: 2, h: 22, rh: 12, w: '#7d7a76', r: '#4a3f3a', job: 2, use: { ore: 3, wood: 2 }, prod: { iron: 2 },
    d: 'Schmilzt Erz zu Eisen: aus 3 Erz und 2 Holz werden 2 Eisen.' },
  sheep: { n: 'Schäferei', i: '🐑', c: { wood: 15, coins: 12 }, st: 2, t: 1, h: 12, rh: 9, w: '#b59a6e', r: '#6b4a2a', job: 2, prod: { wool: 3 },
    d: 'Hält Schafe und liefert Wolle für die Weberei.' },
  weaver: { n: 'Weberei', i: '🧵', c: { wood: 20, stone: 8, coins: 25 }, st: 2, t: 2, h: 20, rh: 12, w: '#d8c9a8', r: '#7a4a6a', job: 2, use: { wool: 3 }, prod: { cloth: 2 },
    d: 'Webt aus 3 Wolle 2 Tuch. Tuch wird für Stadthäuser, Theater und Kathedrale gebraucht und lässt sich gut verkaufen.' },
  brewery: { n: 'Brauerei', i: '🍻', c: { wood: 20, stone: 10, coins: 25 }, st: 2, t: 2, h: 22, rh: 12, w: '#cdb88f', r: '#7a5a2c', job: 2, use: { food: 3 }, prod: { beer: 3 },
    d: 'Braut aus 3 Nahrung 3 Bier. Gasthäuser mit Biervorrat machen die Nachbarn deutlich zufriedener.' },
  orchard: { n: 'Obstgarten', i: '🍎', c: { wood: 12, coins: 10 }, st: 2, t: 1, h: 10, rh: 8, w: '#c9a66b', r: '#6b8a3a', job: 2, prod: { food: 4 }, tech: 'agri2',
    d: 'Obstbäume liefern Nahrung. Benötigt die Technologie „Obst- und Viehzucht“.' },
  pasture: { n: 'Viehweide', i: '🐄', c: { wood: 18, coins: 15 }, st: 2, t: 1, h: 10, rh: 8, w: '#b59a6e', r: '#7a5a35', job: 2, prod: { food: 4, wool: 1 }, tech: 'agri2',
    d: 'Rinder und Schafe liefern Nahrung und etwas Wolle. Benötigt „Obst- und Viehzucht“.' },
  school: { n: 'Schule', i: '🏫', c: { wood: 25, stone: 10, coins: 30 }, st: 2, t: 2, h: 22, rh: 12, w: '#e3d6b4', r: '#3d6a9a', job: 2, prod: { know: 2 },
    d: 'Lehrer und Schreiber erzeugen Wissen für die Forschung.' },
  library: { n: 'Bibliothek', i: '📚', c: { wood: 30, stone: 30, coins: 60 }, st: 3, t: 3, h: 26, rh: 14, w: '#dcd0b4', r: '#4a5a8a', job: 3, prod: { know: 4 },
    d: 'Sammelt Schriften und erzeugt viel Wissen. Für den Siegpfad Kultur nötig.' },
  scholar: { n: 'Gelehrtenturm', i: '🔭', c: { wood: 40, stone: 50, iron: 10, coins: 100 }, st: 4, t: 3, h: 46, rh: 14, s: .7, w: '#c9c3b4', r: '#3d4a7a', job: 3, prod: { know: 7 },
    d: 'Sternwarte und Studierstube: erzeugt sehr viel Wissen.' },
  chapel: { n: 'Kapelle', i: '⛪', c: { wood: 20, stone: 15, coins: 25 }, st: 2, t: 2, h: 22, rh: 16, w: '#e6dfcf', r: '#6b4a3a', job: 1, sat: 10, rad: 8,
    d: 'Ort der Andacht: Häuser im Umkreis von 4 Feldern sind zufriedener.' },
  bath: { n: 'Badehaus', i: '🛁', c: { wood: 25, stone: 20, coins: 40 }, st: 3, t: 2, h: 20, rh: 12, w: '#dcd3c0', r: '#4a7a8a', job: 2, sat: 10, rad: 8, tech: 'civic1',
    d: 'Reinlichkeit hebt die Stimmung im Umkreis von 4 Feldern. Benötigt „Heilkunde“.' },
  theater: { n: 'Theater', i: '🎭', c: { wood: 40, stone: 40, cloth: 10, coins: 80 }, st: 4, t: 3, h: 28, rh: 14, w: '#e0d2b2', r: '#8a3b4a', job: 3, sat: 16, rad: 10,
    d: 'Schauspiel und Musik: Häuser im Umkreis von 5 Feldern sind deutlich zufriedener.' },
  cathedral: { n: 'Kathedrale', i: '🏰', c: { wood: 80, stone: 120, cloth: 20, coins: 250 }, st: 4, t: 5, h: 52, rh: 20, s: 1.1, w: '#d9d3c4', r: '#4a5a7a', job: 3, sat: 25, rad: 12, wonder: 1,
    d: 'Wahrzeichen der Stadt: Häuser im Umkreis von 6 Feldern sind sehr zufrieden. Wunderbau für den Siegpfad Kultur.' },
  univ: { n: 'Universität', i: '🎓', c: { wood: 80, stone: 80, iron: 10, know: 40, coins: 250 }, st: 4, t: 5, h: 40, rh: 16, s: 1.05, w: '#e3dcc8', r: '#3d4a7a', job: 5, prod: { know: 10 }, wonder: 1,
    d: 'Hohe Schule der Wissenschaften: erzeugt sehr viel Wissen. Wunderbau für den Siegpfad Wissen.' },
  firehouse: { n: 'Feuerwache', i: '🚒', c: { wood: 20, stone: 10, coins: 25 }, st: 2, t: 1, h: 22, rh: 12, w: '#b8a98c', r: '#a8302a', job: 2, fire: 8,
    d: 'Löschtrupp mit Wassereimern: Gebäude im Umkreis von 4 Feldern sind vor Bränden geschützt.' },
  barracks: { n: 'Kaserne', i: '⚔️', c: { wood: 30, stone: 25, iron: 5, coins: 60 }, st: 3, t: 3, h: 24, rh: 14, w: '#a39f92', r: '#4a4a6a', job: 4, def: 8, gd: 8, prot: 6,
    d: 'Ausgebildete Truppen: Verteidigung 8, starke Expeditionsstreitmacht und Schutz im Umkreis von 3 Feldern.' },
  castle: { n: 'Burg', i: '🏯', c: { wood: 60, stone: 100, iron: 20, coins: 200 }, st: 4, t: 5, h: 50, rh: 20, s: 1.1, w: '#aaa699', r: '#5a3b3a', job: 4, def: 14, gd: 12, prot: 8, wonder: 1, tech: 'civic3',
    d: 'Festung: Verteidigung 14, mächtige Expeditionsstreitmacht, Schutz im Umkreis von 4 Feldern. Benötigt „Wehrbau“.' },
  kontor: { n: 'Handelskontor', i: '📒', c: { wood: 30, stone: 20, coins: 60 }, st: 3, t: 2, h: 24, rh: 14, w: '#d6c49a', r: '#2f5a4a', job: 3, prod: { coins: 4 }, tech: 'civic2',
    d: 'Vermittelt Handelsaufträge mit hohen Belohnungen und bringt Münzen. Benötigt „Rechtswesen“.' },
  harbor: { n: 'Hafen', i: '⚓', c: { wood: 40, stone: 20, coins: 70 }, st: 3, t: 3, h: 16, rh: 10, w: '#a98a5a', r: '#3d5a6a', job: 3, prod: { coins: 6 }, water: 1,
    d: 'Anlegestelle am Ufer: bringt Münzen und lockt Schiffe mit Aufträgen und Gästen an.' },
  mint: { n: 'Münzprägerei', i: '💰', c: { wood: 30, stone: 30, coins: 120 }, st: 4, t: 3, h: 24, rh: 12, w: '#c9c3b4', r: '#6a5a2a', job: 3, use: { iron: 1 }, prod: { coins: 10 }, tech: 'craft4',
    d: 'Prägt aus 1 Eisen 10 Münzen. Benötigt „Zunftwesen“.' },
  tenement: { n: 'Mietshaus', i: '🏢', c: { wood: 25, stone: 25, coins: 40 }, st: 4, t: 2, h: 40, rh: 14, w: '#d8c9a8', r: '#7a3b2a', home: 16,
    d: 'Mehrgeschossiges Haus für 16 Bewohner.' },
};

// Reihenfolge der Bautabellen
const CAT2 = {
  'Rohstoffe': ['wood', 'quarry', 'mine', 'sheep'],
  'Gewerbe': ['smith', 'smelter', 'weaver', 'brewery', 'mint'],
  'Versorgung': ['farm', 'fish', 'orchard', 'pasture', 'mill', 'bakery'],
  'Wohnen': ['house', 'tenement', 'well', 'inn', 'chapel', 'bath', 'hosp', 'firehouse'],
  'Kultur': ['school', 'library', 'scholar', 'theater', 'cathedral', 'univ'],
  'Handel': ['road', 'store', 'market', 'kontor', 'harbor'],
  'Militär': ['tower', 'guard', 'wall', 'barracks', 'castle'],
};

// ---- Technologien: 3 Zweige zu je 4 Stufen ----
const TBR = { agri: ['Landwirtschaft', '🌾'], craft: ['Handwerk', '🔨'], civic: ['Gemeinwesen', '🏛️'] };
const TECH = {
  agri1: { br: 'agri', n: 'Dreifelderwirtschaft', i: '🌾', cost: 15, t: 3, d: 'Bauernhöfe liefern 15 % mehr Nahrung.' },
  agri2: { br: 'agri', n: 'Obst- und Viehzucht', i: '🍎', cost: 30, t: 4, req: 'agri1', d: 'Schaltet Obstgarten und Viehweide frei.' },
  agri3: { br: 'agri', n: 'Bewässerung', i: '💧', cost: 55, t: 5, req: 'agri2', d: 'Bauernhöfe, Obstgärten und Viehweiden +15 % Nahrung; der Winter schmälert die Ernte nur halb so stark.' },
  agri4: { br: 'agri', n: 'Vorratshaltung', i: '🏺', cost: 85, t: 6, req: 'agri3', d: 'Kein Ernteverlust im Winter; alle Lager +50.' },
  craft1: { br: 'craft', n: 'Steinmetzkunst', i: '🪨', cost: 15, t: 3, d: 'Bausteine kosten 15 % weniger Stein.' },
  craft2: { br: 'craft', n: 'Zimmermannskunst', i: '🪵', cost: 30, t: 4, req: 'craft1', d: 'Bauten kosten 15 % weniger Holz.' },
  craft3: { br: 'craft', n: 'Kranbau', i: '🏗️', cost: 55, t: 5, req: 'craft2', d: 'Alle Bauzeiten ab 2 Perioden sinken um eine Periode.' },
  craft4: { br: 'craft', n: 'Zunftwesen', i: '⚒️', cost: 85, t: 6, req: 'craft3', d: 'Schmiede, Schmelze, Bäckerei, Mühle, Weberei und Brauerei +20 %; schaltet die Münzprägerei frei.' },
  civic1: { br: 'civic', n: 'Heilkunde', i: '⚕️', cost: 15, t: 3, d: 'Seuchen fordern halb so viele Opfer; schaltet das Badehaus frei.' },
  civic2: { br: 'civic', n: 'Rechtswesen', i: '⚖️', cost: 30, t: 4, req: 'civic1', d: 'Ein Gesetz mehr gleichzeitig; schaltet das Handelskontor frei.' },
  civic3: { br: 'civic', n: 'Wehrbau', i: '🛡️', cost: 55, t: 5, req: 'civic2', d: 'Verteidigung und Expeditionsstärke +20 %; schaltet die Burg frei.' },
  civic4: { br: 'civic', n: 'Staatskunst', i: '📜', cost: 85, t: 6, req: 'civic3', d: 'Diplomatische Aktionen kosten 30 % weniger, Beziehungen verbessern sich schneller.' },
};
const TECHN = Object.keys(TECH).length;

// ---- Jahreszeiten: 3 Perioden je Jahreszeit, 12 Perioden je Jahr ----
const SEAS = [
  { n: 'Frühling', i: '🌱', farm: 1.0, fish: 1.0, wood: 1.0, eat: 1.0, tint: 'rgba(150,230,120,.06)', d: 'Alles wächst.' },
  { n: 'Sommer', i: '☀️', farm: 1.1, fish: 1.0, wood: 1.0, eat: 1.0, tint: 'rgba(255,230,120,.07)', d: 'Gute Erntezeit für Felder.' },
  { n: 'Herbst', i: '🍂', farm: 1.25, fish: 1.0, wood: 1.0, eat: 1.0, tint: 'rgba(255,150,60,.10)', d: 'Haupterntezeit. Zeit, Vorräte für den Winter anzulegen.' },
  { n: 'Winter', i: '❄️', farm: .55, fish: .85, wood: .85, eat: 1.1, tint: 'rgba(190,215,255,.16)', d: 'Felder ruhen, der Verbrauch steigt. Lege Vorräte an.' },
];
const PROC = ['smith', 'smelter', 'bakery', 'mill', 'weaver', 'brewery'];  // Verarbeiter (Zunftwesen)

// ---- Schwierigkeit ----
const DIFF = [
  { n: 'Leicht', i: '🌼', raid: .75, nb: .8, win: .7, start: 1.25, d: 'Schwächere Angriffe, milderer Winter, mehr Startkapital.' },
  { n: 'Normal', i: '⚖️', raid: 1, nb: 1, win: .55, start: 1, d: 'So war das Spiel gedacht.' },
  { n: 'Schwer', i: '🔥', raid: 1.3, nb: 1.3, win: .45, start: .85, d: 'Stärkere Angriffe und Nachbarn, härterer Winter.' },
];

// ---- Siegpfade ----
const GOALS = {
  klassisch: { n: 'Blühende Stadt', i: '🏘️', d: '100 Einwohner, 60 % Zufriedenheit, 20 Nahrung und 100 Münzen.',
    chk: s => [['Einwohner ≥ 100', s.pop >= 100, s.pop + '/100'], ['Zufriedenheit ≥ 60 %', s.sat >= 60, Math.round(s.sat) + ' %'], ['Nahrung ≥ 20', s.res.food >= 20, Math.floor(s.res.food) + ''], ['Münzen ≥ 100', s.res.coins >= 100, Math.floor(s.res.coins) + '']] },
  wohlstand: { n: 'Handelsmacht', i: '💰', d: 'Residenzstadt, 1500 Münzen, 5 Handelsaufträge erfüllt und ein Handelskontor.',
    chk: s => [['Stufe Residenzstadt', s.stage >= 4, ST5[s.stage]], ['Münzen ≥ 1500', s.res.coins >= 1500, Math.floor(s.res.coins) + '/1500'], ['Aufträge erfüllt ≥ 5', (s.od || 0) >= 5, (s.od || 0) + '/5'], ['Handelskontor steht', hasB(s, 'kontor'), hasB(s, 'kontor') ? 'ja' : 'nein']] },
  wissen: { n: 'Hort des Wissens', i: '🎓', d: 'Alle 12 Technologien erforscht und eine Universität gebaut.',
    chk: s => [['Technologien 12/12', Object.keys(s.tk || {}).length >= TECHN, Object.keys(s.tk || {}).length + '/' + TECHN], ['Universität steht', hasB(s, 'univ'), hasB(s, 'univ') ? 'ja' : 'nein']] },
  wehr: { n: 'Wehrhafte Festung', i: '🏯', d: 'Burg gebaut, Verteidigung ≥ 35, 3 Angriffe abgewehrt und ein Räuberlager zerschlagen.',
    chk: s => [['Burg steht', hasB(s, 'castle'), hasB(s, 'castle') ? 'ja' : 'nein'], ['Verteidigung ≥ 35', dfn(s) >= 35, Math.round(dfn(s)) + '/35'], ['Angriffe abgewehrt ≥ 3', (s.rw || 0) >= 3, (s.rw || 0) + '/3'], ['Räuberlager zerschlagen', (s.cd || 0) >= 1, (s.cd || 0) + '/1']] },
  kultur: { n: 'Kulturstadt', i: '🎭', d: 'Kathedrale, Theater und Bibliothek, Zufriedenheit ≥ 75 %, Residenzstadt.',
    chk: s => [['Kathedrale steht', hasB(s, 'cathedral'), hasB(s, 'cathedral') ? 'ja' : 'nein'], ['Theater steht', hasB(s, 'theater'), hasB(s, 'theater') ? 'ja' : 'nein'], ['Bibliothek steht', hasB(s, 'library'), hasB(s, 'library') ? 'ja' : 'nein'], ['Zufriedenheit ≥ 75 %', s.sat >= 75, Math.round(s.sat) + ' %'], ['Stufe Residenzstadt', s.stage >= 4, ST5[s.stage]]] },
  harmonie: { n: 'Harmonie', i: '☮️', d: '120 Einwohner und 10 Perioden in Folge Zufriedenheit ≥ 80 % ohne Hunger.',
    chk: s => [['Einwohner ≥ 120', s.pop >= 120, s.pop + '/120'], ['10 Perioden Zufriedenheit ≥ 80 %', (s.hs || 0) >= 10, (s.hs || 0) + '/10']] },
  hegemonie: { n: 'Führende Macht', i: '👑', d: 'Stufe Stadt, alle Nachbarn sind Verbündete oder Tributpflichtige, kein Krieg, 10 Perioden in Folge.',
    chk: s => { const n = (s.nb || []).filter(x => x.alive); return [['Nachbarn vorhanden', n.length > 0, n.length + ''], ['Stufe Stadt', s.stage >= 3, ST5[s.stage]], ['Alle verbündet oder tributpflichtig', n.length > 0 && n.every(x => x.known && (x.tre.ally || x.vas) && !x.war), n.filter(x => x.known && (x.tre.ally || x.vas) && !x.war).length + '/' + n.length], ['10 Perioden in Folge', (s.hg || 0) >= 10, (s.hg || 0) + '/10']] } },
  frei: { n: 'Freies Spiel', i: '🧩', d: 'Kein Sieg: baue, forsche und verhandle, solange du magst.', chk: s => [['Kein Ziel', false, '–']] },
};
function hasB(s, id) { return s.bld.some(b => b.id === id && !b.t && !b.dmg); }
function cntB(s, id) { return s.bld.filter(b => b.id === id && !b.t).length; }

// ---- Szenarien ----
const SCEN = {
  zufall: { n: 'Zufallsland', i: '🎲', d: 'Zufällige Karte wie im Original: Wald, Hügel, ein Fluss.', goal: 'klassisch', f: 1.2, h: 2.1, river: 1, coast: 0, res: {} },
  fluss: { n: 'Flusstal', i: '🏞️', d: 'Breiter Fluss, viel Wiese, wenig Berge. Reich an Nahrung, arm an Stein. Ziel: Handelsmacht.', goal: 'wohlstand', f: 1.7, h: 2.9, river: 2, coast: 0, res: { food: 30, wood: 30, stone: 4 } },
  berg: { n: 'Bergland', i: '⛰️', d: 'Viele Hügel und Wälder, Erz und Stein im Überfluss, aber wenig Ackerland. Ziel: Wehrhafte Festung.', goal: 'wehr', f: 1.0, h: 1.3, river: 0, coast: 0, res: { stone: 14, tools: 5, food: 18 } },
  kueste: { n: 'Küstenland', i: '🌊', d: 'Meer im Süden, fischreiche Küste, Platz für einen Hafen. Ziel: Kulturstadt.', goal: 'kultur', f: 1.5, h: 2.6, river: 0, coast: 1, res: { food: 24, coins: 50 } },
};

// ---- Meilensteine (kleine Belohnungen) ----
const MILES = [
  { id: 'm1', n: 'Dorf gegründet', i: '🏘️', ok: s => s.stage >= 2, r: { coins: 20 } },
  { id: 'm2', n: 'Stadtrecht', i: '🏙️', ok: s => s.stage >= 3, r: { coins: 40 } },
  { id: 'm3', n: 'Residenzstadt', i: '🏰', ok: s => s.stage >= 4, r: { coins: 80 } },
  { id: 'm4', n: 'Metropole', i: '🌆', ok: s => s.stage >= 5, r: { coins: 150, know: 20 } },
  { id: 'm5', n: 'Fünf Wohnhäuser', i: '🏠', ok: s => s.bld.filter(b => B[b.id].home && !b.t).length >= 5, r: { coins: 10 } },
  { id: 'm6', n: 'Frisches Wasser (3 Brunnen)', i: '⛲', ok: s => cntB(s, 'well') >= 3, r: { stone: 6 } },
  { id: 'm7', n: 'Erster Marktplatz', i: '🧺', ok: s => cntB(s, 'market') >= 1, r: { coins: 15 } },
  { id: 'm8', n: 'Eisenzeit', i: '⛓️', ok: s => ((s.pt || {}).iron || 0) >= 10, r: { know: 5 } },
  { id: 'm9', n: 'Feine Stoffe', i: '🧵', ok: s => ((s.pt || {}).cloth || 0) >= 10, r: { coins: 25 } },
  { id: 'm10', n: 'Prost!', i: '🍻', ok: s => ((s.pt || {}).beer || 0) >= 6, r: { coins: 15 } },
  { id: 'm11', n: 'Erste Erkenntnis', i: '📜', ok: s => Object.keys(s.tk || {}).length >= 1, r: { know: 5 } },
  { id: 'm12', n: 'Sechs Technologien', i: '🔬', ok: s => Object.keys(s.tk || {}).length >= 6, r: { know: 15, coins: 40 } },
  { id: 'm13', n: 'Alle Technologien', i: '🎓', ok: s => Object.keys(s.tk || {}).length >= TECHN, r: { coins: 200 } },
  { id: 'm14', n: 'Wehrhaft', i: '🛡️', ok: s => (s.rw || 0) >= 1, r: { tools: 3 } },
  { id: 'm15', n: 'Fünf Angriffe abgewehrt', i: '⚔️', ok: s => (s.rw || 0) >= 5, r: { coins: 60 } },
  { id: 'm16', n: 'Lagerbrecher', i: '🏴', ok: s => (s.cd || 0) >= 1, r: { coins: 50 } },
  { id: 'm17', n: 'Erster Handelsauftrag', i: '📒', ok: s => (s.od || 0) >= 1, r: { coins: 30 } },
  { id: 'm18', n: 'Fünf Handelsaufträge', i: '📦', ok: s => (s.od || 0) >= 5, r: { coins: 100 } },
  { id: 'm19', n: 'Fünf Gebiete', i: '🗺️', ok: s => s.zones.filter(Boolean).length >= 5, r: { coins: 40 } },
  { id: 'm20', n: 'Das ganze Land', i: '🌍', ok: s => s.zones.filter(Boolean).length >= 9, r: { coins: 120 } },
  { id: 'm21', n: 'Den ersten Winter überstanden', i: '❄️', ok: s => s.turn > 12, r: { coins: 25 } },
  { id: 'm22', n: 'Fünf Jahre', i: '📅', ok: s => s.turn > 60, r: { coins: 60 } },
  { id: 'm23', n: 'Glückliche Bürger (90 %)', i: '😊', ok: s => s.sat >= 90, r: { coins: 40 } },
  { id: 'm24', n: 'Erstes Bündnis', i: '🤝', ok: s => (s.nb || []).some(n => n.tre.ally), r: { coins: 40 } },
  { id: 'm25', n: 'Friedensstifter', i: '🕊️', ok: s => (s.ps || 0) >= 1, r: { coins: 50 } },
  { id: 'm26', n: 'Weltgewandt (alle Nachbarn kontaktiert)', i: '🧭', ok: s => (s.nb || []).length > 0 && s.nb.every(n => n.known), r: { coins: 40, know: 10 } },
  { id: 'm27', n: 'Wunderbauer', i: '✨', ok: s => s.bld.some(b => B[b.id].wonder && !b.t), r: { coins: 100 } },
];
