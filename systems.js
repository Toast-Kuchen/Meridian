'use strict';
// MERIDIAN 2.0 – Zusatzsysteme: Jahreszeiten, Forschung, Wirtschaft, Aufträge, Ereignisse, Meilensteine, Chronik, Speicherhilfen.
// Wird nach content.js und vor game.js geladen. Greift zur Laufzeit auf die Spielglobale (S, B, R, ...) zu.

const rint = n => Math.floor(Math.random() * n);
const choose = a => a[rint(a.length)];
const TKN = id => !!(S.tk && S.tk[id]);

const Sys = {
  auto: false,   // Testmodus: Entscheidungen werden automatisch getroffen, Dialoge übersprungen

  // ---------- Jahreszeiten ----------
  sea(s) { return ((s.turn - 1) / 3 | 0) % 4; },
  year(s) { return 1 + ((s.turn - 1) / 12 | 0); },

  // Ertragsfaktor eines Betriebs für die Ware x (Jahreszeit, Technologien, Ereignisse)
  pm(s, b, x) {
    const id = b.id, se = SEAS[Sys.sea(s)], tk = s.tk || {}, md = s.md || {};
    let m = 1;
    const field = id === 'farm' || id === 'orchard' || id === 'pasture';
    if (x === 'food' && (field || id === 'fish')) {
      let f = field ? se.farm : se.fish;
      if (f < 1) {
        if (field) {
          if (tk.agri4) f = 1; else if (tk.agri3) f = 1 - (1 - f) / 2;
        }
        const dw = s.diff === 0 ? .6 : s.diff === 2 ? 1.2 : 1;   // Leicht: Winter mildern, Schwer: verschärfen
        f = 1 - (1 - f) * dw;
      }
      m *= f;
      if (field && tk.agri3) m *= 1.15;
      if (id === 'farm' && tk.agri1) m *= 1.15;
      if (field && md.duerre > 0) m *= (md.duerreMild ? .8 : .6);
      if (field && md.blight > 0) m *= .7;
    }
    if (x === 'wood' && id === 'wood') m *= se.wood;
    if (PROC.includes(id) && tk.craft4) m *= 1.2;
    return m;
  },
  eat(s) { return SEAS[Sys.sea(s)].eat; },

  // ---------- Baukosten und Bauzeiten (mit Technologien) ----------
  cost(id) {
    const c = Object.assign({}, B[id].c), tk = S.tk || {};
    if (c.stone && tk.craft1) c.stone = Math.max(1, Math.round(c.stone * .85));
    if (c.wood && tk.craft2) c.wood = Math.max(1, Math.round(c.wood * .85));
    return c;
  },
  btime(id) { const t = B[id].t; return t >= 2 && TKN('craft3') ? t - 1 : t; },
  locked(id) { const d = B[id]; return d.tech && !TKN(d.tech) ? 'Benötigt Technologie „' + TECH[d.tech].n + '“' : ''; },
  lawMax(s) { return s.stage + ((s.tk || {}).civic2 ? 1 : 0); },
  stageFor(pop) { let st = 1; for (let i = 2; i <= 5; i++) if (pop >= POPST[i]) st = i; return st; },

  // ---------- Forschung ----------
  canTech(id) {
    const t = TECH[id];
    if (TKN(id)) return 'Erforscht';
    if (S.tcur) return S.tcur.id === id ? 'In Arbeit' : 'Es wird bereits geforscht';
    if (t.req && !TKN(t.req)) return 'Zuerst: ' + TECH[t.req].n;
    if (S.res.know < t.cost) return 'Zu wenig Wissen (' + Math.floor(S.res.know) + '/' + t.cost + ')';
    return '';
  },
  startTech(id) {
    if (over()) return;
    const w = Sys.canTech(id); if (w) return toast(w);
    S.res.know -= TECH[id].cost; S.tcur = { id, left: TECH[id].t };
    Sys.chron(S, 'Forschung begonnen: ' + TECH[id].n); sfx('click'); after();
  },
  techHtml() {
    let h = '<h2>🔬 Forschung</h2><p>📜 Wissen: <b>' + Math.floor(S.res.know) + '</b>' + (S.tcur ? ' · In Arbeit: <b>' + TECH[S.tcur.id].n + '</b> (noch ' + S.tcur.left + ' Periode(n))' : '') + '<br>Wissen erzeugen Schule, Bibliothek, Gelehrtenturm und Universität. Es wird immer nur eine Technologie erforscht.</p>';
    for (const br in TBR) {
      h += '<h3>' + TBR[br][1] + ' ' + TBR[br][0] + '</h3>';
      for (const id in TECH) {
        const t = TECH[id]; if (t.br !== br) continue;
        const w = Sys.canTech(id), done = TKN(id);
        h += '<button data-a="rs:' + id + '" style="background:' + (done ? '#46703b' : w ? '#6b6b5a' : '#2f4a2a') + '">' + (done ? '✅ ' : S.tcur && S.tcur.id === id ? '🔬 ' : '') + t.i + ' ' + t.n + ' – 📜' + t.cost + ' · ' + t.t + ' Per.<br><small>' + t.d + (w && !done ? ' <b>(' + w + ')</b>' : '') + '</small></button>';
      }
    }
    return h;
  },

  // ---------- Handelsaufträge (Handelskontor, Hafen) ----------
  ordGoods() { return ['wood', 'stone', 'food', 'tools'].concat(['ore', 'iron', 'cloth', 'beer', 'wool'].filter(k => (S.pt && S.pt[k] > 0) || S.res[k] > 0)); },
  newOrder(s) {
    const g = choose(Sys.ordGoods()), pr = (PB[g] || PBX[g] || 3) * (s.mk && s.mk[g] || 1), n = (g === 'tools' ? 4 : 8) + rint(8) + s.stage * 2;
    const port = hasB(s, 'harbor') && Math.random() < .4;
    return { k: g, n, r: Math.round(pr * n * (port ? 2.2 : 1.6)), left: 8 + rint(4), ship: port ? 1 : 0 };
  },
  ordersHtml() {
    const o = S.ords || [];
    return '<b>Aufträge</b> (' + (S.od || 0) + ' erfüllt)<br>' + (o.length ? o.map((x, i) => '<button data-a="of:' + i + '" style="background:' + (S.res[x.k] >= x.n ? '#2f6a2a' : '#6b6b5a') + '">' + (x.ship ? '🚢 ' : '📜 ') + x.n + ' ' + RI[x.k] + ' ' + RN[x.k] + ' → 🪙' + x.r + ' (noch ' + x.left + ' Per.)</button>').join('') : 'Derzeit keine Aufträge. Alle paar Perioden kommen neue.') + '<br>';
  },
  fulfil(i) {
    const x = (S.ords || [])[i]; if (!x || over()) return;
    if (S.res[x.k] < x.n) return toast('Zu wenig ' + RN[x.k] + '.');
    S.res[x.k] -= x.n; S.res.coins += x.r; S.od = (S.od || 0) + 1; S.ords.splice(i, 1); S.ts = (S.ts || 0) + x.r;
    Sys.chron(S, 'Auftrag erfüllt: ' + x.n + ' ' + RN[x.k] + ' für ' + x.r + ' Münzen'); sfx('bell', .4); toast('Auftrag erfüllt: +🪙' + x.r); after();
  },

  // ---------- Chronik ----------
  chron(s, txt) { (s.chr = s.chr || []).push([s.turn, txt]); if (s.chr.length > 160) s.chr.splice(0, s.chr.length - 160); },
  chronHtml() {
    const c = (S.chr || []).slice().reverse().slice(0, 50);
    return '<h2>📖 Chronik</h2><div class=lg>' + (c.map(([t, x]) => '<b>Jahr ' + (1 + ((t - 1) / 12 | 0)) + ', ' + SEAS[((t - 1) / 3 | 0) % 4].i + ' P' + t + '</b>: ' + x).join('<br>') || 'Noch keine Einträge.') + '</div>';
  },

  // ---------- Ziele und Meilensteine ----------
  goalHtml() {
    const g = GOALS[S.goal] || GOALS.klassisch, l = g.chk(S);
    const mi = MILES.map(m => (S.mi && S.mi[m.id] ? '✅ ' : '⬜ ') + m.i + ' ' + m.n).join('<br>');
    return '<h2>' + g.i + ' Ziel: ' + g.n + '</h2><p>' + g.d + '</p><div class=lg>' + l.map(([t, ok, v]) => (ok ? '✅ ' : '⬜ ') + t + ' <b>(' + v + ')</b>').join('<br>') + '</div>' +
      '<h3>Meilensteine (' + Object.keys(S.mi || {}).length + '/' + MILES.length + ')</h3><div class=lg>' + mi + '</div>';
  },
  win(s) {
    if (s.goal === 'frei') return false;
    const g = GOALS[s.goal || 'klassisch'];
    return g.chk(s).every(x => x[1]);
  },
  miles(s, L, q) {
    for (const m of MILES) {
      if (s.mi[m.id] || !m.ok(s)) continue;
      if (q) continue;
      s.mi[m.id] = 1;
      for (const k in m.r) s.res[k] = (s.res[k] || 0) + m.r[k];
      L.push('Meilenstein: ' + m.i + ' ' + m.n + ' (' + Object.keys(m.r).map(k => RI[k] + m.r[k]).join(' ') + ')');
      Sys.chron(s, 'Meilenstein: ' + m.n);
    }
  },

  // ---------- Takt am Ende jeder Periode ----------
  tick(s, L, q) {
    // Forschung
    if (s.tcur && !q && --s.tcur.left <= 0) {
      s.tk[s.tcur.id] = 1; L.push('Erforscht: ' + TECH[s.tcur.id].i + ' ' + TECH[s.tcur.id].n + '!'); Sys.chron(s, 'Erforscht: ' + TECH[s.tcur.id].n);
      (s.bn = s.bn || []).push('<h2>🔬 Erforscht: ' + TECH[s.tcur.id].n + '</h2><p>' + TECH[s.tcur.id].d + '</p>'); s.tcur = null;
    }
    if (q) return;
    // Zähler für Siegpfade
    s.hs = (s.sat >= 80 && !(s.fam > 0)) ? (s.hs || 0) + 1 : 0;
    const n = (s.nb || []).filter(x => x.alive);
    s.hg = (n.length && n.every(x => x.known && (x.tre.ally || x.vas) && !x.war)) ? (s.hg || 0) + 1 : 0;
    // Wirkungsdauer von Ereignissen
    for (const k of ['duerre', 'blight', 'fest2', 'sermon', 'pact']) if (s.md[k] > 0) s.md[k]--;
    if (!(s.md.duerre > 0)) s.md.duerreMild = 0;
    // Jahreszeitenwechsel
    const sea = Sys.sea(s), prev = Sys.sea({ turn: s.turn - 1 });
    if (s.turn > 1 && sea !== prev) {
      L.push(SEAS[sea].i + ' ' + SEAS[sea].n + ' beginnt. ' + SEAS[sea].d);
      if (sea === 3 || sea === 2) (s.bn = s.bn || []).push('<h2>' + SEAS[sea].i + ' ' + SEAS[sea].n + '</h2><p>' + SEAS[sea].d + (sea === 2 ? ' Bald kommt der Winter: Die Felder liefern dann weniger.' : ' Die Erträge der Felder sinken, der Nahrungsverbrauch steigt um 10 %. Prüfe deine Vorräte.') + '</p>');
      Sys.chron(s, SEAS[sea].n + ' des Jahres ' + Sys.year(s) + ' beginnt');
    }
    // Aufträge
    s.ords = (s.ords || []).filter(o => --o.left > 0);
    if ((hasB(s, 'kontor') || hasB(s, 'harbor')) && s.ords.length < 3 && s.turn % 3 === 0) s.ords.push(Sys.newOrder(s));
    // Meilensteine
    Sys.miles(s, L, q);
  },

  // ---------- Ereignisse ----------
  pend(s, id, d, t) { (s.pend = s.pend || []).push({ t: t || 'evt', id, d: d || {} }); },
  events(s, L) {
    // Entscheidungen warten nicht auf Folgeperioden: höchstens zwei offene gleichzeitig
    Sys.chains(s, L);
    if ((s.pend || []).length >= 2) return;
    if (Math.random() > .38) return;
    const sea = Sys.sea(s), pool = [];
    for (const id in EVT) { const e = EVT[id]; const w = e.ok(s, sea) ? e.w : 0; for (let i = 0; i < w * 2; i++) pool.push(id); }
    if (!pool.length) return;
    const id = choose(pool), m = EVT[id].go(s, L);
    if (m) L.push(m);
  },
  chains(s, L) {
    for (const id in s.ch) {
      const c = s.ch[id];
      if (c && c.at && s.turn >= c.at) { c.at = 0; const E = CHN[id]; if (E) E(s, c, L); }
    }
  },
  pendHtml(p) {
    const E = p.t === 'dip' ? Dip.EV[p.id] : EVT[p.id];
    const v = E.show(S, p);
    return '<h2>' + v.ttl + '</h2><p>' + v.txt + '</p>' + v.o.map((l, i) => '<button data-a="po:' + i + '">' + l + '</button>').join('');
  },
  showPend() {
    if (Sys.auto) return Sys.autoPend();
    if (!S || over() || !$('dlg').hidden) return;
    const p = S.pend && S.pend[0]; if (!p) return;
    dlg(Sys.pendHtml(p), 1);
  },
  resolve(i) {
    const p = S.pend && S.pend[0]; if (!p) return;
    const E = p.t === 'dip' ? Dip.EV[p.id] : EVT[p.id], r = E.res(S, p, i);
    if (r === false) return;
    S.pend.shift();
    if (r) { S.log.unshift('P' + S.turn + ': ' + r); S.log.length = Math.min(S.log.length, 40); toast(r); Sys.chron(S, r); }
    $('dlg').hidden = true; after();
    if (dq.length) dq2(); else Sys.showPend();
  },
  autoPend() {   // Testmodus: zufällige gültige Option wählen
    let guard = 12;
    while (S.pend && S.pend.length && guard--) {
      const p = S.pend[0], E = p.t === 'dip' ? Dip.EV[p.id] : EVT[p.id], n = E.show(S, p).o.length;
      const order = Array.from({ length: n }, (_, i) => i).sort(() => Math.random() - .5);
      let ok = false;
      for (const i of order) { if (E.res(S, p, i) !== false) { ok = true; break; } }
      S.pend.shift();
      if (!ok) { /* nichts möglich: verwerfen */ }
    }
  },

  // ---------- Eingaben aus Dialogen ----------
  handle(a) {
    if (a.startsWith('po:')) { Sys.resolve(+a.slice(3)); return true; }
    if (a.startsWith('rs:')) { Sys.startTech(a.slice(3)); dlg(Sys.techHtml() + '<button data-a="cl">Schließen</button>', 1); return true; }
    if (a === 'tech') { dlg(Sys.techHtml()); return true; }
    if (a === 'goal') { dlg(Sys.goalHtml()); return true; }
    if (a === 'chron') { dlg(Sys.chronHtml()); return true; }
    if (a.startsWith('ng')) return Sys.ngAct(a);
    if (a.startsWith('gx:')) { Sys.gfxSet(a.slice(3)); return true; }
    if (a.startsWith('sl')) return Sys.slotAct(a);
    if (a.startsWith('dp') || a.startsWith('dq')) return Dip.act(a);
    return false;
  },

  // ---------- Neues Spiel (Szenario, Ziel, Schwierigkeit, Nachbarn) ----------
  cfg: { scn: 'zufall', goal: '', diff: 1, nbn: 3, mood: 0, nbs: 1 },
  MOODS: ['Gemischt', 'Friedlich', 'Kriegerisch'],
  NBS: ['Schwach', 'Normal', 'Stark'],
  ngHtml() {
    const c = Sys.cfg, sc = SCEN[c.scn], goal = c.goal || sc.goal, g = GOALS[goal];
    return '<h2>🆕 Neues Spiel</h2><p class=lg>Tippe auf eine Zeile, um die Einstellung zu wechseln.</p>' +
      '<button data-a="ng:scn">' + sc.i + ' Szenario: <b>' + sc.n + '</b><br><small>' + sc.d + '</small></button>' +
      '<button data-a="ng:goal">' + g.i + ' Ziel: <b>' + g.n + '</b><br><small>' + g.d + '</small></button>' +
      '<button data-a="ng:diff">' + DIFF[c.diff].i + ' Schwierigkeit: <b>' + DIFF[c.diff].n + '</b><br><small>' + DIFF[c.diff].d + '</small></button>' +
      '<button data-a="ng:nbn">🏴 Nachbarn: <b>' + (c.nbn ? c.nbn : 'keine') + '</b><br><small>Anzahl der Nachbarsiedlungen (0 bis 4), die von der Computerseite gelenkt werden.</small></button>' +
      '<button data-a="ng:mood">🎭 Charakter der Nachbarn: <b>' + Sys.MOODS[c.mood] + '</b><br><small>Gemischt würfelt Händler, Krieger, Ritter, Listige und Friedfertige.</small></button>' +
      '<button data-a="ng:nbs">💪 Stärke der Nachbarn: <b>' + Sys.NBS[c.nbs] + '</b></button>' +
      '<button data-a="ng:go" style="background:#46703b">▶ Spiel starten</button><button data-a="cl" style="background:#7a3b2a">Abbrechen</button>';
  },
  goalList() { return Object.keys(GOALS).filter(k => k !== 'hegemonie' || Sys.cfg.nbn > 0); },
  ngAct(a) {
    const c = Sys.cfg;
    if (a === 'ng') { dlg(Sys.ngHtml(), 1); return true; }
    if (a === 'ng:scn') { const k = Object.keys(SCEN); c.scn = k[(k.indexOf(c.scn) + 1) % k.length]; c.goal = ''; }
    else if (a === 'ng:goal') { const k = Sys.goalList(), cur = c.goal || SCEN[c.scn].goal; c.goal = k[(k.indexOf(cur) + 1) % k.length]; }
    else if (a === 'ng:diff') c.diff = (c.diff + 1) % 3;
    else if (a === 'ng:nbn') { c.nbn = (c.nbn + 1) % 5; if (!c.nbn && c.goal === 'hegemonie') c.goal = ''; }
    else if (a === 'ng:mood') c.mood = (c.mood + 1) % 3;
    else if (a === 'ng:nbs') c.nbs = (c.nbs + 1) % 3;
    else if (a === 'ng:go') { newGame(Object.assign({}, c)); $('dlg').hidden = true; after(); return true; }
    dlg(Sys.ngHtml(), 1); return true;
  },

  // ---------- Grafikqualität ----------
  gfxSet(v) { opt.gfx = v; try { localStorage.setItem('meridian-gfx', v); } catch (e) { } if (typeof buildSprites === 'function') buildSprites(v); save(); menu(); },

  // ---------- Spielstände: Plätze, Export, Import ----------
  slotKey(n) { return n > 1 ? 'save' + n : 'save'; },
  curSlot: 1,
  slotsHtml() {
    return '<h2>💾 Spielstände</h2><p class=lg>Aktiver Platz: <b>' + Sys.curSlot + '</b>. Dein Spiel wird automatisch im aktiven Platz gespeichert.</p>' +
      [1, 2, 3].map(n => '<button data-a="sl:use:' + n + '">Platz ' + n + (n === Sys.curSlot ? ' (aktiv)' : '') + ' – hierhin speichern und wechseln</button><button data-a="sl:load:' + n + '" style="background:#6b6b5a">Platz ' + n + ' laden</button>').join('') +
      '<h3>Sichern in eine Datei</h3><button data-a="sl:exp">⬇️ Spielstand als Datei exportieren</button><button data-a="sl:copy">📋 Als Text anzeigen (zum Kopieren)</button>' +
      '<button data-a="sl:imp">⬆️ Aus Datei importieren</button><button data-a="sl:paste">📥 Aus eingefügtem Text importieren</button>' +
      '<input id="impf" type="file" accept=".json,application/json,text/plain" hidden>';
  },
  exportText() { return JSON.stringify({ app: 'meridian', v: 10, S, opt }); },
  validSave(d) { return d && d.S && d.S.exp && d.S.cz != null && d.S.camp && d.S.zones && d.S.map && d.S.map.length === N * N && d.S.res && typeof d.S.turn === 'number'; },
  importText(t) {
    let d; try { d = JSON.parse(t); } catch (e) { toast('Das ist kein gültiger Spielstand (Lesefehler).'); return false; }
    if (!(d.v === 9 || d.v === 10) || !Sys.validSave(d)) { toast('Der Spielstand ist unvollständig oder stammt aus einer nicht unterstützten Version.'); return false; }
    S = Sys.migrate(d.S); opt = Object.assign(opt, d.opt || {}); idx(); centerOn(20, 20); mode = ghost = sel = zsel = null; battle = null; S.pend = S.pend || [];
    after(); toast('Spielstand importiert.'); return true;
  },
  slotAct(a) {
    const p = a.split(':');
    if (a === 'sl') { dlg(Sys.slotsHtml()); return true; }
    if (p[1] === 'use') { Sys.curSlot = +p[2]; put(Sys.slotKey(Sys.curSlot), { v: 10, S, opt }).then(() => { toast('Gespeichert in Platz ' + Sys.curSlot + '.'); try { localStorage.setItem('meridian-slot', Sys.curSlot); } catch (e) { } }); dlg(Sys.slotsHtml()); return true; }
    if (p[1] === 'load') { get(Sys.slotKey(+p[2])).then(d => { if (d && (d.v === 9 || d.v === 10) && Sys.validSave(d)) { Sys.curSlot = +p[2]; Sys.importText(JSON.stringify(d)); $('dlg').hidden = true; } else toast('Platz ' + p[2] + ' ist leer.'); }); return true; }
    if (p[1] === 'exp') {
      try { const b = new Blob([Sys.exportText()], { type: 'application/json' }), u = URL.createObjectURL(b), l = document.createElement('a'); l.href = u; l.download = 'meridian-spielstand-P' + S.turn + '.json'; document.body.appendChild(l); l.click(); l.remove(); setTimeout(() => URL.revokeObjectURL(u), 4000); toast('Datei wird heruntergeladen.'); }
      catch (e) { toast('Download nicht möglich: nutze „Als Text anzeigen“.'); }
      return true;
    }
    if (p[1] === 'copy') { dlg('<h2>📋 Spielstand als Text</h2><p class=lg>Markiere alles, kopiere es und speichere es als Textdatei. Zum Wiederherstellen fügst du ihn bei „Aus Text importieren“ ein.</p><textarea id="sav" readonly style="width:100%;height:160px;font:11px monospace">' + Sys.exportText().replace(/</g, '&lt;') + '</textarea>'); const t = $('sav'); if (t) { t.focus(); t.select(); } return true; }
    if (p[1] === 'paste') { dlg('<h2>📥 Aus Text importieren</h2><p class=lg>Füge den kompletten Text hier ein. Der aktuelle Stand wird ersetzt.</p><textarea id="sav" style="width:100%;height:160px;font:11px monospace"></textarea><button data-a="sl:go">Importieren</button>'); return true; }
    if (p[1] === 'go') { const t = $('sav'); if (t && Sys.importText(t.value)) $('dlg').hidden = true; return true; }
    if (p[1] === 'imp') { const f = $('impf'); if (f) { f.onchange = () => { const r = new FileReader(); r.onload = () => { if (Sys.importText(String(r.result))) $('dlg').hidden = true; }; r.readAsText(f.files[0]); }; f.click(); } return true; }
    return false;
  },
  migrate(s) {
    s.res = s.res || {}; for (const k of RX) if (s.res[k] == null) s.res[k] = 0;
    s.tk = s.tk || {}; if (s.tcur === undefined) s.tcur = null;
    s.goal = s.goal || 'klassisch'; s.scn = s.scn || 'zufall'; if (s.diff == null) s.diff = 1;
    s.mi = s.mi || {}; s.od = s.od || 0; s.ords = s.ords || []; s.md = s.md || {}; s.chr = s.chr || []; s.pend = s.pend || [];
    s.hs = s.hs || 0; s.hg = s.hg || 0; s.cd = s.cd || 0; s.ps = s.ps || 0; if (s.dr == null) s.dr = 50; s.nb = s.nb || []; s.ch = s.ch || {};
    s.mk = s.mk || {}; for (const k of ['food', 'wood', 'stone', 'tools', 'ore', 'iron', 'wool', 'cloth', 'beer']) if (s.mk[k] == null) s.mk[k] = 1;
    s.stage = Sys.stageFor(s.pop);
    return s;
  },
};

// ---------- Ereignistabelle ----------
const EVT = {
  ernte: { w: 3, ok: s => s.bld.some(b => b.id === 'farm'), go: (s) => { const n = 10 + 4 * (Sys.sea(s) === 2); s.res.food += n; return 'Gute Ernte: +' + n + ' Nahrung.'; } },
  reparatur: { w: 2, ok: s => s.turn > 3, go: s => { const c = Math.min(Math.floor(s.res.coins), 4 + s.stage * 2); s.res.coins -= c; return 'Reparaturen am Dorfweg kosten ' + c + ' Münzen.'; } },
  handwerker: { w: 1.5, ok: s => s.stage >= 2, go: s => { s.res.tools += 4; return 'Ein geschickter Handwerker lässt sich nieder: +4 Werkzeuge.'; } },
  gelehrter: { w: 2, ok: s => hasB(s, 'school') || hasB(s, 'library'), go: s => { s.res.know += 6; return 'Ein Gelehrter teilt sein Wissen: +6 Wissen.'; } },
  pilger: { w: 1.5, ok: s => hasB(s, 'chapel') || hasB(s, 'cathedral'), go: s => { const n = 12 + (hasB(s, 'cathedral') ? 30 : 0); s.res.coins += n; return 'Pilger spenden: +' + n + ' Münzen.'; } },
  schiff: { w: 2, ok: s => hasB(s, 'harbor'), go: s => { s.res.coins += 30; if (s.pop < stats(s).home) s.pop++; return 'Ein Schiff legt an: +30 Münzen und ein neuer Einwohner.'; } },
  preisschock: { w: 1.5, ok: s => s.turn > 6, go: s => { const k = choose(['food', 'wood', 'stone', 'tools', 'iron', 'cloth']), up = Math.random() < .5; s.mk[k] = cl((s.mk[k] || 1) * (up ? 1.4 : .7), .6, 1.6); return 'Preisschwankung: ' + RN[k] + ' ist ' + (up ? 'sehr gefragt (teurer)' : 'im Überfluss (günstiger)') + '.'; } },
  hochwasser: { w: 2, ok: (s, se) => se === 0 && s.map.some(m => m === 2) && s.turn > 6, go: s => {
    const c = s.bld.filter(b => b.id !== 'hall' && b.id !== 'road' && !b.dmg && !b.t && nearWater(s, b)); if (!c.length) return null;
    const n = Math.min(2, c.length); for (let i = 0; i < n; i++) c.splice(rint(c.length), 1)[0].dmg = 1;
    return 'Hochwasser! ' + n + ' Gebäude am Ufer wurden beschädigt (Reparatur 🪙5 je Gebäude).'; } },
  brand: { w: 2, ok: s => s.bld.length > 8, go: s => {
    const c = s.bld.filter(b => b.id !== 'hall' && b.id !== 'road' && b.id !== 'wall' && !b.dmg && !b.t); if (!c.length) return null;
    const b = choose(c), prot = s.bld.some(f => f.id === 'firehouse' && !f.t && !f.dmg && fd(f.x, f.y, 2, b.x, b.y, szd(B[b.id])) <= B.firehouse.fire);
    if (prot) return 'Feuer bei ' + B[b.id].n + '! Die Feuerwache löscht es rechtzeitig.';
    b.dmg = 1; s.res.wood = Math.max(0, s.res.wood - 8); return 'Brand! ' + B[b.id].n + ' ist beschädigt (Reparatur 🪙5), 8 Holz verbrannt. Eine Feuerwache hätte geholfen.'; } },
  sturm: { w: 1.5, ok: (s, se) => (se === 2 || se === 3) && s.bld.length > 6, go: s => {
    const c = s.bld.filter(b => b.id !== 'hall' && !B[b.id].flat && !b.dmg && !b.t); if (!c.length) return null; const b = choose(c);
    if (s.bld.some(p => B[p.id].prot && !p.t && !p.dmg && fd(p.x, p.y, szd(B[p.id]), b.x, b.y, szd(B[b.id])) <= B[p.id].prot)) return 'Ein Sturm zieht über das Land. Die Wehranlagen schützen die Gebäude.';
    b.dmg = 1; return 'Sturm! ' + B[b.id].n + ' wurde beschädigt (Reparatur 🪙5).'; } },
  missernte: { w: 1.5, ok: (s, se) => se === 2 && s.bld.some(b => b.id === 'farm'), go: s => { s.md.blight = 2; return 'Missernte durch Schädlinge: 2 Perioden lang −30 % Ertrag auf den Feldern.'; } },
  hungerwinter: { w: 1.5, ok: (s, se) => se === 3 && s.res.food < s.pop * 2.5 && s.turn > 12, go: s => { s.sat = Math.max(0, s.sat - 4); return 'Der Winter ist hart. Vorräte werden knapp, die Stimmung sinkt (−4 %).'; } },

  haendler: { w: 3, ok: s => s.turn > 2, go: s => { const k = choose(['wood', 'stone', 'food', 'tools'].concat(s.stage >= 2 ? ['ore', 'cloth', 'beer'] : [])), n = k === 'tools' ? 5 : 15; Sys.pend(s, 'haendler', { k, n, p: Math.round((PB[k] || PBX[k]) * (s.mk[k] || 1) * n * .75) }); return 'Ein fahrender Händler ist angekommen.'; },
    show: (s, p) => ({ ttl: '🧺 Fahrender Händler', txt: 'Ein Händler bietet ' + p.d.n + ' ' + RI[p.d.k] + ' ' + RN[p.d.k] + ' für 🪙' + p.d.p + ' an.', o: ['Kaufen (🪙' + p.d.p + ')', 'Ablehnen'] }),
    res: (s, p, i) => { if (i === 1) return 'Du lehnst das Angebot des Händlers ab.'; if (s.res.coins < p.d.p) { toast('Zu wenig Münzen.'); return false; } s.res.coins -= p.d.p; s.res[p.d.k] = capAdd(s, p.d.k, p.d.n); return 'Gekauft: ' + p.d.n + ' ' + RN[p.d.k] + '.'; } },
  familie: { w: 2, ok: s => s.pop < stats(s).home, go: s => { Sys.pend(s, 'familie', {}); return 'Eine Familie bittet um Aufnahme.'; },
    show: () => ({ ttl: '👨‍👩‍👧 Reisende', txt: 'Eine Familie bittet um Aufnahme. Sie braucht 5 Nahrung für die Ankunft.', o: ['Aufnehmen (🌾5)', 'Abweisen'] }),
    res: (s, p, i) => { if (i === 1) return 'Die Familie zieht weiter.'; if (s.res.food >= 5 && s.pop < stats(s).home) { s.res.food -= 5; s.pop++; return 'Eine Familie lässt sich nieder.'; } toast('Nicht möglich: Nahrung oder Wohnraum fehlt.'); return false; } },
  fluechtlinge: { w: 1.5, ok: s => stats(s).home - s.pop >= 4 && s.turn > 10, go: s => { Sys.pend(s, 'fluechtlinge', { n: 3 + rint(4) }); return 'Ein Flüchtlingszug nähert sich.'; },
    show: (s, p) => ({ ttl: '🚶 Flüchtlingszug', txt: p.d.n + ' Menschen fliehen vor Not und Krieg und bitten um Aufnahme. Sie brauchen ' + p.d.n * 2 + ' Nahrung.', o: ['Aufnehmen (🌾' + p.d.n * 2 + ')', 'Weiterziehen lassen'] }),
    res: (s, p, i) => { if (i === 1) return 'Die Flüchtlinge ziehen weiter.'; if (s.res.food < p.d.n * 2 || s.pop + p.d.n > stats(s).home) { toast('Nicht möglich: Nahrung oder Wohnraum fehlt.'); return false; } s.res.food -= p.d.n * 2; s.pop += p.d.n; s.sat = Math.max(0, s.sat - 2); return p.d.n + ' Flüchtlinge werden aufgenommen.'; } },
  duerre: { w: 2, ok: (s, se) => se === 1 && s.bld.some(b => b.id === 'farm'), go: s => { Sys.pend(s, 'duerre', {}); return 'Eine Dürre droht.'; },
    show: () => ({ ttl: '🌵 Dürre', txt: 'Die Sommerhitze lässt die Felder verdorren. Ohne Gegenmaßnahmen sinkt der Ertrag 3 Perioden lang um 40 %.', o: ['Notbewässerung (🪙25): nur −20 %', 'Aussitzen']}),
    res: (s, p, i) => { if (i === 0) { if (s.res.coins < 25) { toast('Zu wenig Münzen.'); return false; } s.res.coins -= 25; s.md.duerre = 3; s.md.duerreMild = 1; return 'Die Notbewässerung mildert die Dürre.'; } s.md.duerre = 3; s.md.duerreMild = 0; return 'Die Dürre trifft die Felder hart.'; } },
  erntefest: { w: 2, ok: (s, se) => se === 2 && s.pop >= 15, go: s => { Sys.pend(s, 'erntefest', {}); return 'Das Erntefest steht an.'; },
    show: () => ({ ttl: '🎃 Erntefest', txt: 'Die Bürger möchten die Ernte feiern.', o: ['Fest feiern (🌾15): Stimmung +10', 'Überschüsse verkaufen (+🪙30)']}),
    res: (s, p, i) => { if (i === 0) { if (s.res.food < 15) { toast('Zu wenig Nahrung.'); return false; } s.res.food -= 15; s.sat = Math.min(100, s.sat + 10); return 'Ein fröhliches Erntefest: Stimmung +10.'; } s.res.coins += 30; return 'Überschüsse verkauft: +30 Münzen.'; } },
  unruhe: { w: 2, ok: s => s.sat < 45 && s.pop >= 12, go: s => { Sys.pend(s, 'unruhe', {}); return 'Unruhe in der Bürgerschaft.'; },
    show: () => ({ ttl: '🔥 Unmut in der Stadt', txt: 'Die Bürger murren. Eine Abordnung verlangt Abhilfe.', o: ['Brot und Spiele (🌾15, 🪙20): Stimmung +8', 'Steuern um eine Stufe senken', 'Hart durchgreifen: Stimmung −4']}),
    res: (s, p, i) => { if (i === 0) { if (s.res.food < 15 || s.res.coins < 20) { toast('Zu wenig Nahrung oder Münzen.'); return false; } s.res.food -= 15; s.res.coins -= 20; s.sat = Math.min(100, s.sat + 8); return 'Brot und Spiele beruhigen die Bürger.'; } if (i === 1) { s.tax = Math.max(0, (s.tax == null ? 2 : s.tax) - 1); return 'Die Steuern werden gesenkt.'; } s.sat = Math.max(0, s.sat - 4); return 'Die Wache sorgt für Ruhe, aber nicht für Zufriedenheit.'; } },
  koenig: { w: 1, ok: s => s.stage >= 3 && s.turn > 20, go: s => { Sys.pend(s, 'koenig', {}); return 'Ein königlicher Gesandter kündigt sich an.'; },
    show: () => ({ ttl: '👑 Königlicher Besuch', txt: 'Ein Gesandter des Königs reist durch das Land und wünscht, die Stadt zu besuchen.', o: ['Festmahl geben (🌾30, 🪙40): +🪙100 und Stimmung +6', 'Schlicht empfangen: +🪙20', 'Absagen']}),
    res: (s, p, i) => { if (i === 0) { if (s.res.food < 30 || s.res.coins < 40) { toast('Zu wenig Nahrung oder Münzen.'); return false; } s.res.food -= 30; s.res.coins += 60; s.sat = Math.min(100, s.sat + 6); s.dr = Math.min(100, s.dr + 3); return 'Das Festmahl beeindruckt den Gesandten: +100 Münzen Gunstbeweis (netto +60).'; } if (i === 1) { s.res.coins += 20; return 'Ein schlichter Empfang: +20 Münzen.'; } return 'Du sagst den Besuch ab.'; } },
  spaeher: { w: 2, ok: s => s.turn >= 8 && !s.raid && s.peace <= 0, go: s => { Sys.pend(s, 'spaeher', {}); return 'Ein Späher berichtet von Fremden.'; },
    show: () => ({ ttl: '🕵️ Räuberspäher', txt: 'Ein Wächter hat einen Späher der Räuber gefangen. Er verrät, wann der nächste Überfall kommt.', o: ['Gegen 🪙20 freilassen: Überfall verzögert sich um 2 Perioden', 'Verhören: nächster Überfall wird früher bekannt', 'Einsperren']}),
    res: (s, p, i) => { if (i === 0) { if (s.res.coins < 20) { toast('Zu wenig Münzen.'); return false; } s.res.coins -= 20; s.nr += 2; return 'Der Späher berichtet falsch: Der Überfall verzögert sich um 2 Perioden.'; } if (i === 1) { s.nr = Math.max(s.turn + 1, s.nr - 1); s.res.tools += 2; return 'Das Verhör bringt Hinweise und 2 Werkzeuge ein.'; } s.sat = Math.min(100, s.sat + 1); return 'Der Späher wird eingesperrt.'; } },
  karawane: { w: 2, ok: s => s.stage >= 2, go: s => { const k = choose(['iron', 'cloth', 'beer', 'ore', 'wool']), n = 10; Sys.pend(s, 'karawane', { k, n, p: Math.round(PBX[k] * (s.mk[k] || 1) * n * .7) }); return 'Eine Handelskarawane macht Rast.'; },
    show: (s, p) => ({ ttl: '🐪 Handelskarawane', txt: 'Reisende Kaufleute verkaufen ' + p.d.n + ' ' + RI[p.d.k] + ' ' + RN[p.d.k] + ' mit Rabatt für 🪙' + p.d.p + '.', o: ['Kaufen (🪙' + p.d.p + ')', 'Ablehnen']}),
    res: (s, p, i) => { if (i === 1) return 'Die Karawane zieht weiter.'; if (s.res.coins < p.d.p) { toast('Zu wenig Münzen.'); return false; } s.res.coins -= p.d.p; s.res[p.d.k] = capAdd(s, p.d.k, p.d.n); return 'Die Karawane liefert ' + p.d.n + ' ' + RN[p.d.k] + '.'; } },
  // Ereignisketten
  ruine: { w: 1.2, ok: s => s.turn > 10 && !s.ch.eremit, go: s => { Sys.pend(s, 'ruine', {}); return 'Jäger haben eine alte Ruine entdeckt.'; },
    show: () => ({ ttl: '🏚️ Alte Ruine', txt: 'Jäger berichten von einer verfallenen Einsiedelei im Wald.', o: ['Erkunden lassen (🔧2)', 'Ignorieren']}),
    res: (s, p, i) => { if (i === 1) return 'Die Ruine bleibt unbeachtet.'; if (s.res.tools < 2) { toast('Zu wenig Werkzeug.'); return false; } s.res.tools -= 2; s.ch.eremit = { st: 1, at: s.turn + 3 }; return 'Ein Trupp zieht zur Ruine. Er meldet sich in einigen Perioden.'; } },
  fremde: { w: 1.2, ok: s => s.turn > 8 && s.stage >= 2 && !s.ch.fremde, go: s => { Sys.pend(s, 'fremde', {}); return 'Eine Karawane in Not bittet um Hilfe.'; },
    show: () => ({ ttl: '🐪 Karawane in Not', txt: 'Eine Handelskarawane hat die Achse gebrochen und der Proviant geht zur Neige. Sie bittet um Unterkunft und Essen.', o: ['Helfen (🌾20, 🪵8)', 'Abweisen']}),
    res: (s, p, i) => { if (i === 1) { s.ch.fremde = { st: 9, at: 0 }; return 'Die Karawane zieht weiter.'; } if (s.res.food < 20 || s.res.wood < 8) { toast('Zu wenig Nahrung oder Holz.'); return false; } s.res.food -= 20; s.res.wood -= 8; s.ch.fremde = { st: 1, at: s.turn + 4 }; return 'Du hilfst der Karawane. Der Anführer verspricht, sich zu revanchieren.'; } },
  prediger: { w: 1.2, ok: s => s.turn > 12 && s.pop >= 15 && !s.ch.prediger, go: s => { Sys.pend(s, 'prediger', {}); return 'Ein Wanderprediger kommt in die Stadt.'; },
    show: () => ({ ttl: '🧙 Wanderprediger', txt: 'Ein Wanderprediger bittet, auf dem Marktplatz sprechen zu dürfen.', o: ['Willkommen heißen', 'Aus der Stadt weisen']}),
    res: (s, p, i) => { if (i === 1) { s.ch.prediger = { st: 9, at: 0 }; return 'Der Prediger wird fortgeschickt.'; } s.ch.prediger = { st: 1, at: s.turn + 3 }; s.sat = Math.min(100, s.sat + 3); return 'Der Prediger spricht auf dem Markt. Die Bürger hören zu.'; } },
};
const nearWater = (s, b) => { for (let j = -2; j <= 3; j++) for (let i = -2; i <= 3; i++) { const x = b.x + i, y = b.y + j; if (x >= 0 && y >= 0 && x < N && y < N && s.map[y * N + x] === 2) return true; } return false; };
const capAdd = (s, k, n) => NOCAP.includes(k) ? s.res[k] + n : Math.min(stats(s).cap, s.res[k] + n);

// Folgeereignisse der Ketten (laufen, wenn die gemerkte Periode erreicht ist)
const CHN = {
  eremit(s, c, L) {
    if (c.st === 1) { Sys.pend(s, 'eremit1', {}); c.st = 2; }
  },
  fremde(s, c, L) { if (c.st === 1) { Sys.pend(s, 'fremde2', {}); c.st = 2; } },
  prediger(s, c, L) {
    if (c.st === 1) { s.md.sermon = 6; s.sat = Math.min(100, s.sat + 4); L.push('Die Predigten des Wanderpredigers finden Anhänger: Stimmung +4.'); c.st = 2; c.at = s.turn + 4; }
    else if (c.st === 2) { Sys.pend(s, 'prediger2', {}); c.st = 3; }
  },
};
Object.assign(EVT, {
  eremit1: { w: 0, ok: () => false, go: () => null,
    show: () => ({ ttl: '🏚️ Das Erbe des Eremiten', txt: 'Der Trupp kehrt zurück. In der Ruine fanden sich alte Schriften, eine vergrabene Truhe und die Spur eines Weges in unbekanntes Land.', o: ['Schriften studieren: +25 Wissen', 'Truhe öffnen: +🪙80', 'Der Spur folgen: ein Gebiet wird erkundet']}),
    res: (s, p, i) => { s.ch.eremit = { st: 9, at: 0 }; if (i === 0) { s.res.know += 25; return 'Die Schriften enthalten altes Wissen: +25 Wissen.'; } if (i === 1) { s.res.coins += 80; return 'Die Truhe enthält Münzen: +80.'; } const z = [0, 1, 2, 3, 4, 5, 6, 7, 8].filter(k => !s.exp[k]); if (z.length) { s.exp[choose(z)] = 1; return 'Die Spur führt in neues Land: ein Gebiet wurde erkundet.'; } s.res.know += 10; return 'Alles ist bereits erkundet; die Aufzeichnungen bringen +10 Wissen.'; } },
  fremde2: { w: 0, ok: () => false, go: () => null,
    show: () => ({ ttl: '🐪 Dank der Karawane', txt: 'Der Karawanenführer kehrt zurück und möchte sich erkenntlich zeigen.', o: ['Handelsvertrag: Marktpreise 10 Perioden lang günstig', 'Wertvolle Waren: +6 🧵 und +6 ⛓️', 'Eine Karte: ein Gebiet wird erkundet']}),
    res: (s, p, i) => { s.ch.fremde = { st: 9, at: 0 }; if (i === 0) { for (const k of ['food', 'wood', 'stone', 'tools']) s.mk[k] = Math.max(.6, s.mk[k] * .8); return 'Der Handelsvertrag senkt die Preise am Markt.'; } if (i === 1) { s.res.cloth += 6; s.res.iron += 6; return 'Die Karawane schenkt Tuch und Eisen.'; } const z = [0, 1, 2, 3, 4, 5, 6, 7, 8].filter(k => !s.exp[k]); if (z.length) { s.exp[choose(z)] = 1; return 'Die Karte zeigt ein neues Gebiet.'; } s.res.coins += 40; return 'Alles ist erkundet; stattdessen gibt es 40 Münzen.'; } },
  prediger2: { w: 0, ok: () => false, go: () => null,
    show: () => ({ ttl: '🧙 Streit um den Prediger', txt: 'Die Gemeinde ist gespalten: Die einen wollen eine Kapelle für den Prediger, die anderen halten ihn für einen Aufwiegler.', o: ['Kapelle stiften (🪙40): Stimmung +8', 'Predigten verbieten: Stimmung −6', 'Beide Seiten vermitteln (🪙15)']}),
    res: (s, p, i) => { if (i === 0) { if (s.res.coins < 40) { toast('Zu wenig Münzen.'); return false; } s.res.coins -= 40; s.sat = Math.min(100, s.sat + 8); s.ch.prediger = { st: 9, at: 0 }; return 'Die Gemeinde dankt dir für die Stiftung.'; } if (i === 1) { s.sat = Math.max(0, s.sat - 6); s.ch.prediger = { st: 9, at: 0 }; return 'Das Verbot spaltet die Stadt weiter.'; } if (s.res.coins < 15) { toast('Zu wenig Münzen.'); return false; } s.res.coins -= 15; s.sat = Math.min(100, s.sat + 2); s.ch.prediger = { st: 9, at: 0 }; return 'Die Vermittlung beruhigt die Gemüter.'; } },
});

// ---------- Darstellung: Bodenfarben je Jahreszeit, Himmel, Tag und Nacht, Partikel ----------
Sys.ground = function (m, se, h) {
  // m: 0 Wiese, 1 Wald (Boden), 3 Huegel; se: 0 Fruehling .. 3 Winter
  if (m === 1) return ['hsl(104,32%,' + (30 + h * 6) + '%)', 'hsl(100,30%,' + (30 + h * 6) + '%)', 'hsl(44,28%,' + (32 + h * 6) + '%)', 'hsl(200,14%,' + (72 + h * 6) + '%)'][se];
  if (m === 3) return se === 3 ? 'hsl(210,14%,' + (76 + h * 7) + '%)' : 'hsl(40,12%,' + (52 + h * 8) + '%)';
  return ['hsl(' + (90 + h * 12) + ',38%,' + (46 + h * 7) + '%)', 'hsl(' + (82 + h * 12) + ',34%,' + (44 + h * 7) + '%)', 'hsl(' + (52 + h * 10) + ',40%,' + (44 + h * 7) + '%)', 'hsl(' + (200 + h * 10) + ',20%,' + (86 + h * 6) + '%)'][se];
};
Sys.pts = [];
Sys.sky = function (t, dt) {
  const se = Sys.sea(S), hi = opt.gfx === 'hi';
  g.fillStyle = SEAS[se].tint; g.fillRect(0, 0, W, H);
  if (!hi) { Sys.pts.length = 0; return; }
  const dark = Math.max(0, -Math.cos((t / 360) % 1 * 2 * Math.PI)) * .3;   // 6-Minuten-Tageszyklus, nur Optik
  if (dark > .01) { g.fillStyle = 'rgba(18,28,70,' + dark.toFixed(3) + ')'; g.fillRect(0, 0, W, H); }
  const kind = se === 3 ? 'snow' : se === 2 ? 'leaf' : se === 0 ? 'petal' : null;
  if (!kind) { Sys.pts.length = 0; return; }
  const want = kind === 'snow' ? 90 : 34;
  while (Sys.pts.length < want) Sys.pts.push({ x: Math.random() * W, y: Math.random() * H, v: .4 + Math.random(), s: 1 + Math.random() * 1.6, p: Math.random() * 6 });
  while (Sys.pts.length > want) Sys.pts.pop();
  for (const p of Sys.pts) {
    p.y += p.v * (kind === 'snow' ? 26 : 20) * dt; p.x += Math.sin(t * 1.3 + p.p) * 14 * dt + (kind === 'snow' ? 3 : 9) * dt;
    if (p.y > H + 5) { p.y = -5; p.x = Math.random() * W; } if (p.x > W + 5) p.x = -5;
    g.fillStyle = kind === 'snow' ? 'rgba(255,255,255,.85)' : kind === 'leaf' ? 'rgba(214,112,36,.85)' : 'rgba(255,186,204,.8)';
    g.beginPath(); g.ellipse(p.x, p.y, p.s * (kind === 'snow' ? 1 : 1.7), p.s, p.p, 0, 7); g.fill();
  }
};
