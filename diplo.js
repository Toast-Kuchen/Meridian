'use strict';
// MERIDIAN 2.0 – Nachbarn und Diplomatie: Computergelenkte Siedlungen mit Charakter, Beziehungen, Verträgen,
// Bündnissen, Krieg und Rückabwicklung (Widerruf, Kündigung, Rückerstattung). Wird nach systems.js geladen.

const Dip = {
  PERS: {
    haendler: { n: 'Handelsrepublik', i: '⚖️', aggr: .15, honor: .6, greed: .8, mil: .7, wealth: 1.4 },
    krieger: { n: 'Kriegerklan', i: '⚔️', aggr: .8, honor: .4, greed: .5, mil: 1.4, wealth: .8 },
    ehre: { n: 'Ritterorden', i: '🛡️', aggr: .4, honor: .95, greed: .3, mil: 1.1, wealth: 1 },
    listig: { n: 'Listiger Fürst', i: '🦊', aggr: .5, honor: .2, greed: .7, mil: 1, wealth: 1.1 },
    fried: { n: 'Bauerngemeinde', i: '🌾', aggr: .1, honor: .7, greed: .3, mil: .6, wealth: .9 },
  },
  MOODPOOL: [['haendler', 'krieger', 'ehre', 'listig', 'fried'], ['haendler', 'fried', 'ehre'], ['krieger', 'listig', 'krieger', 'ehre']],
  NAMES: ['Eichenau', 'Falkenstein', 'Rabenfeld', 'Silberbach', 'Nordhafen', 'Rotmoor', 'Steinwacht', 'Lindenhof', 'Kupferberg', 'Sturmfels', 'Weidenau', 'Eisenhain'],
  COLS: ['#a8452f', '#3d6a9a', '#6a8a3a', '#8a5a9a'],
  SLOTS: [{ x: 24, y: -4, mid: 1 }, { x: 51, y: 24, mid: 5 }, { x: 24, y: 51, mid: 7 }, { x: -4, y: 24, mid: 3 }],   // Lage außerhalb der Karte (Karte = 48 × 48)

  nb(s, id) { return (s.nb || []).find(n => n.id === id); },
  name(id) { const n = Dip.nb(S, id); return n ? n.nm : 'Unbekannte'; },
  pers(n) { return Dip.PERS[n.p]; },
  pow(s) { return dfn(s) + dfn(s, 1) * .5; },     // eigene Stärke für Vergleiche mit Nachbarn
  clampRel(n) { n.rel = cl(Math.round(n.rel * 10) / 10, -100, 100); },
  civ(s) { return (s.tk && s.tk.civic4) ? .7 : 1; },
  gain(s, v) { return v * ((s.tk && s.tk.civic4) ? 1.5 : 1); },

  init(s, cfg) {
    s.nb = [];
    const n = cfg.nbn == null ? 3 : cfg.nbn, pool = Dip.MOODPOOL[cfg.mood || 0], slots = [0, 1, 2, 3].sort(() => Math.random() - .5).slice(0, n);
    const sc = [.7, 1, 1.35][cfg.nbs == null ? 1 : cfg.nbs] * DIFF[cfg.diff == null ? 1 : cfg.diff].nb, names = Dip.NAMES.slice().sort(() => Math.random() - .5), cols = Dip.COLS.slice().sort(() => Math.random() - .5);
    slots.forEach((sl, k) => {
      const p = choose(pool), P0 = Dip.PERS[p];
      s.nb.push({ id: k, nm: names[k], p, col: cols[k], x: Dip.SLOTS[sl].x, y: Dip.SLOTS[sl].y, mid: Dip.SLOTS[sl].mid, known: 0, alive: 1,
        mil: Math.round((6 + rint(4)) * P0.mil * sc * 10) / 10, sc, wealth: Math.round(90 * P0.wealth + rint(40)), rel: Math.round(rint(20) - 10 + (P0.honor - .5) * 10),
        tre: { trade: 0, peace: 0, ally: 0 }, war: 0, wt: 0, exh: 0, cf: 0, vas: 0, trib: 0, tl: 0, took: 0, ask: 0, sup: 0, wr: [], al: [], rl: {}, meet: 22 + rint(14) + k * 6 });
    });
    for (const a of s.nb) for (const b of s.nb) if (a.id < b.id) { const v = rint(50) - 25; a.rl[b.id] = v; b.rl[a.id] = v; }
  },

  // Verträge und ihre Wirkungen auf Preise
  cnt(s, k) { return (s.nb || []).filter(n => n.alive && n.tre[k]).length; },
  bm(s) { return Math.max(.85, 1 - .05 * Dip.cnt(s, 'trade')); },     // Einkaufsfaktor
  sm(s) { return Math.min(1.15, 1 + .05 * Dip.cnt(s, 'trade')); },    // Verkaufsfaktor
  support(s) { let v = 0; for (const n of s.nb || []) if (n.alive && n.tre.ally && n.rel >= 20) v += n.mil * (n.sup > 0 ? .2 : .1); return v; },
  allyOf(s) { return (s.nb || []).filter(n => n.alive && n.tre.ally); },

  // ---------- Takt (Ende jeder Periode) ----------
  tick(s, L, q) {
    if (q || !s.nb || !s.nb.length) return;
    const alive = s.nb.filter(n => n.alive), me = Dip.pow(s), pend = () => (s.pend || []).length < 3;
    for (const n of alive) {
      const P0 = Dip.pers(n);
      // Entdeckung
      if (!n.known && (s.exp[n.mid] || s.turn >= n.meet)) {
        n.known = 1; L.push('Neue Nachbarn entdeckt: ' + P0.i + ' ' + n.nm + ' (' + P0.n + ').'); Sys.chron(s, 'Kontakt mit ' + n.nm); Sys.pend(s, 'kontakt', { n: n.id }, 'dip');
      }
      // Wachstum
      n.mil = Math.min(90 * n.sc, n.mil + (.22 + Math.random() * .12) * P0.mil * n.sc);
      n.wealth += (1.5 + Math.random()) * P0.wealth;
      if (n.cf > 0) n.cf--; if (n.sup > 0) n.sup--;
      // Beziehung: Rückkehr zum Grundwert, Verträge, Tribut
      const base = Math.round((s.dr - 50) / 4);
      n.rel += cl(base - n.rel, -1, 1) * .5;
      if (n.tre.trade) { n.rel += .5; s.res.coins += Math.round(1 + n.wealth * .012); }
      if (n.tre.ally) n.rel += .6;
      if (n.vas) { n.rel -= .5; s.res.coins += n.trib; n.took += n.trib; if (--n.tl <= 0) { n.vas = 0; L.push(n.nm + ' zahlt keinen Tribut mehr.'); } else if (me < n.mil * .7 && Math.random() < .12) { n.vas = 0; n.rel -= 10; if (pend()) Sys.pend(s, 'aufstand', { n: n.id }, 'dip'); } }
      if (!n.known) { Dip.clampRel(n); continue; }
      // Mächte erzeugen Misstrauen
      if (me > n.mil * 2.2 && !n.tre.ally && !n.vas) n.rel -= .4;
      // Krieg gegen den Spieler
      if (n.war) {
        if (--n.wt <= 0) {
          if (!s.raid && s.peace <= 0) {
            const str = Math.round(n.mil * .5 * (.85 + Math.random() * .3) * 10) / 10;
            s.raid = { str, left: 2, merc: 0, by: n.id, from: [{ x: cl(n.x, 0, 47), y: cl(n.y, 0, 47) }] }; s.alert = 1; n.wt = 4 + rint(3);
            L.push(n.nm + ' greift an! Ankunft in 2 Perioden (Stärke etwa ' + Math.round(str) + ').');
          } else n.wt = 1;
        }
        n.rel -= .3;
        if ((n.exh >= 3 || n.rel > -25) && Math.random() < .12 + n.exh * .04 && pend() && !s.pend.some(p => p.id === 'frieden' && p.d.n === n.id)) Sys.pend(s, 'frieden', { n: n.id }, 'dip');
        Dip.clampRel(n); continue;
      }
      // Vorschläge und Drohungen der Nachbarn
      const rho = n.mil / Math.max(3, me), r = Math.random();
      if (pend() && !s.pend.some(p => p.t === 'dip' && p.d.n === n.id)) {
        if (!n.tre.peace && n.cf <= 0 && ((n.rel < -25 && r < P0.aggr * .12) || (rho > 1.6 && P0.aggr > .55 && n.rel < 15 && r < P0.aggr * .05))) {
          n.war = 1; n.wt = 3; n.exh = 0; for (const k of ['trade', 'peace', 'ally']) n.tre[k] = 0; Sys.pend(s, 'krieg', { n: n.id, why: n.rel < -25 ? 'Die Beziehungen sind zerrüttet.' : 'Sie halten deine Stadt für schwach.' }, 'dip'); Dip.warLinks(s, n, L);
        } else if (rho > 1.4 && P0.aggr > .5 && n.rel < 20 && !n.vas && n.cf <= 0 && r < P0.aggr * .07) Sys.pend(s, 'tribut', { n: n.id, a: Math.round(25 + s.turn * .6 + n.mil) }, 'dip');
        else if (n.rel >= 15 && !n.tre.trade && P0.greed > .4 && r < .08) Sys.pend(s, 'handel', { n: n.id }, 'dip');
        else if (n.rel >= 45 && !n.tre.ally && (n.tre.trade || n.tre.peace) && r < .06) Sys.pend(s, 'buendnis', { n: n.id }, 'dip');
        else if (n.tre.ally) {
          const foe = alive.find(o => o.id !== n.id && n.wr.includes(o.id));
          if (foe && r < .15 && !s.pend.some(p => p.id === 'hilfe')) Sys.pend(s, 'hilfe', { n: n.id, f: foe.id }, 'dip');
        }
      }
      // AI kündigt Verträge bei schlechter Stimmung (Rückabwicklung durch die Gegenseite)
      for (const [k, lim, why] of [['trade', -15, 'Der Handel lohnt nicht mehr, die Stimmung ist schlecht.'], ['ally', 10, 'Das Bündnis besteht nur noch auf dem Papier.'], ['peace', -35, 'Der Pakt ist nichts mehr wert.']]) {
        if (n.tre[k] && n.rel < lim && Math.random() < .25) { Dip.unwind(s, n, k, 'ai'); if (pend()) Sys.pend(s, 'kuendigung', { n: n.id, k, why }, 'dip'); }
      }
      Dip.clampRel(n);
    }
    // Nachbarn untereinander
    for (const a of alive) for (const b of alive) {
      if (a.id >= b.id) continue;
      a.rl[b.id] = cl((a.rl[b.id] || 0) + (rint(7) - 3) - Math.sign(a.rl[b.id] || 0), -100, 100); b.rl[a.id] = a.rl[b.id];
      const al = a.al.includes(b.id), wr = a.wr.includes(b.id);
      if (!al && !wr && a.rl[b.id] >= 55 && Math.random() < .05) { a.al.push(b.id); b.al.push(a.id); }
      if (!wr && a.rl[b.id] <= -50 && Math.random() < (Dip.pers(a).aggr + Dip.pers(b).aggr) * .06) { a.wr.push(b.id); b.wr.push(a.id); a.al = a.al.filter(x => x !== b.id); b.al = b.al.filter(x => x !== a.id); if (a.known && b.known) L.push(a.nm + ' und ' + b.nm + ' führen jetzt Krieg gegeneinander.'); }
      if (wr) {
        a.mil *= .992; b.mil *= .992; a.rl[b.id] = b.rl[a.id] = Math.min(a.rl[b.id], -30);
        if (Math.random() < .08) { const lo = a.mil < b.mil ? a : b, hi = lo === a ? b : a; lo.mil *= .75; hi.mil *= .94; if (Math.random() < .5) { a.wr = a.wr.filter(x => x !== b.id); b.wr = b.wr.filter(x => x !== a.id); } if (lo.mil < 3.5) { Dip.fall(s, lo, hi, L); } }
      }
    }
    // Koalition gegen einen übermächtigen Spieler
    const k = alive.filter(n => n.known);
    if (k.length >= 2 && s.turn > 40 && me > 2.2 * (k.reduce((x, n) => x + n.mil, 0) / k.length) && !k.some(n => n.tre.ally) && Math.random() < .03 && (s.pend || []).length < 3) {
      for (const n of k) { n.rel -= 12; for (const o of k) if (o !== n) { n.rl[o.id] = Math.max(n.rl[o.id] || 0, 30); } }
      Sys.pend(s, 'koalition', {}, 'dip');
    }
    
  },
  warLinks(s, n, L) {   // Verbündete und Feinde der Kriegsparteien beziehen Stellung
    for (const o of s.nb) if (o.alive && o.id !== n.id && o.tre.ally) { o.rel += 3; o.sup = 3; }
    for (const o of s.nb) if (o.alive && o.id !== n.id && n.al.includes(o.id)) { o.rel -= 8; }
  },
  fall(s, lo, hi, L) {
    lo.alive = 0; hi.mil += lo.mil * .8 + 3; hi.wealth += lo.wealth * .5;
    for (const o of s.nb) { o.al = o.al.filter(x => x !== lo.id); o.wr = o.wr.filter(x => x !== lo.id); }
    if (lo.war || lo.tre.ally || lo.vas) { lo.war = 0; lo.vas = 0; lo.tre = { trade: 0, peace: 0, ally: 0 }; }
    if (lo.known) { L.push(lo.nm + ' wurde von ' + hi.nm + ' erobert und gibt es nicht mehr.'); Sys.chron(s, lo.nm + ' wurde von ' + hi.nm + ' erobert'); }
  },

  // Rückabwicklung eines Vertrags. who: 'me' (Spieler) oder 'ai'. Liefert Textmeldung.
  unwind(s, n, k, who) {
    const age = s.turn - n.tre[k], names = { trade: 'Handelsabkommen', peace: 'Nichtangriffspakt', ally: 'Bündnis' };
    n.tre[k] = 0; let m = names[k] + ' mit ' + n.nm + ' ';
    if (who === 'me') {
      if (age <= 1) { if (n.fee && n.fee[k]) { s.res.coins += n.fee[k]; m += 'widerrufen (Widerrufsfrist): Gebühr ' + n.fee[k] + ' Münzen zurückerstattet, keine Strafe.'; n.fee[k] = 0; } else m += 'widerrufen, keine Strafe.'; return m; }
      const pen = { trade: 8, peace: 15, ally: 25 }[k]; n.rel -= pen; s.dr = Math.max(0, s.dr - (k === 'ally' ? 6 : 3));
      if (k === 'ally' && Dip.pers(n).honor > .6) n.rel -= 8;
      m += 'gekündigt: Beziehung −' + pen + ', Ansehen sinkt.';
    } else { n.rel -= 3; m += 'wurde von der Gegenseite beendet.'; }
    Dip.clampRel(n); return m;
  },
  raidDone(s, rep, raid) {   // Folgen eines Angriffs eines Nachbarn
    const n = Dip.nb(s, raid.by); if (!n) return;
    if (rep.win) { n.mil *= .88; n.exh++; n.rel -= 3; } else { n.mil *= 1.04; n.wealth += 25; n.exh = Math.max(0, n.exh - 1); }
    Dip.clampRel(n);
  },

  // ---------- Oberfläche ----------
  relBar(v) { const k = Math.round((v + 100) / 20); return '▮'.repeat(k) + '▯'.repeat(10 - k); },
  relTxt(v) { return v >= 60 ? 'herzlich' : v >= 30 ? 'freundlich' : v >= 10 ? 'wohlwollend' : v > -10 ? 'neutral' : v > -35 ? 'kühl' : v > -60 ? 'feindselig' : 'verfeindet'; },
  powTxt(n, s) { const r = n.mil / Math.max(3, Dip.pow(s)); return r < .6 ? 'deutlich schwächer' : r < .9 ? 'schwächer' : r < 1.15 ? 'ebenbürtig' : r < 1.6 ? 'stärker' : 'weit überlegen'; },
  status(n) { return [n.war ? '⚔️ Krieg' : '', n.tre.ally ? '🤝 Bündnis' : '', n.tre.trade ? '💰 Handel' : '', n.tre.peace ? '⚖️ Pakt' : '', n.vas ? '👑 tributpflichtig' : '', n.cf > 0 && !n.war ? '🕊️ Waffenruhe' : ''].filter(Boolean).join(' · ') || 'keine Verträge'; },
  listHtml() {
    const k = (S.nb || []).filter(n => n.known);
    return '<h2>🤝 Nachbarn</h2><p class=lg>Ansehen deiner Stadt: <b>' + Math.round(S.dr) + '</b>/100. Verträge zu brechen, schadet dem Ansehen.</p>' +
      (k.length ? k.map(n => { const P0 = Dip.pers(n); return '<button data-a="dp:' + n.id + '" style="background:' + (n.alive ? n.col : '#555') + '">' + P0.i + ' <b>' + n.nm + '</b> – ' + P0.n + (n.alive ? '' : ' (untergegangen)') + '<br><small>' + Dip.relBar(n.rel) + ' ' + Dip.relTxt(n.rel) + ' · ' + Dip.status(n) + '</small></button>'; }).join('') : '<p>Noch kein Kontakt. Erkunde die Randgebiete, um Nachbarn zu finden.</p>');
  },
  detailHtml(id) {
    const n = Dip.nb(S, id); if (!n) return Dip.listHtml();
    const P0 = Dip.pers(n), c = Dip.civ(S), a = id => 'dp:' + id + ':';
    const others = S.nb.filter(o => o.alive && o.id !== n.id && o.known);
    const rel = others.map(o => (n.al.includes(o.id) ? '🤝 ' : n.wr.includes(o.id) ? '⚔️ ' : '· ') + o.nm).join(', ');
    let h = '<h2>' + P0.i + ' ' + n.nm + '</h2><p>' + P0.n + ' · Stärke: <b>' + Dip.powTxt(n, S) + '</b> als deine Stadt<br>Beziehung: ' + Dip.relBar(n.rel) + ' <b>' + Math.round(n.rel) + '</b> (' + Dip.relTxt(n.rel) + ')<br>Status: ' + Dip.status(n) + (rel ? '<br><small>Andere Nachbarn: ' + rel + '</small>' : '') + '</p>';
    if (!n.alive) return h + '<p>Diese Siedlung ist untergegangen.</p><button data-a="dp">Zurück</button>';
    const B_ = (act, txt, ok, bg) => '<button data-a="' + a(id) + act + '" style="background:' + (bg || (ok ? '#2f4a2a' : '#6b6b5a')) + '">' + txt + '</button>';
    h += '<h3>Beziehung pflegen</h3>' + B_('env', '✉️ Gesandte schicken (🪙' + Math.round(15 * c) + ')', 1) + B_('gift', '🎁 Geschenk (🪙' + Math.round(30 * c) + ')', 1);
    if (!n.war) {
      h += '<h3>Verträge</h3>';
      h += n.tre.trade ? B_('c:trade', '✖ Handelsabkommen ' + (S.turn - n.tre.trade <= 1 ? 'widerrufen (ohne Strafe)' : 'kündigen'), 1, '#7a3b2a') : B_('trade', '💰 Handelsabkommen vorschlagen (🪙' + Math.round(20 * c) + ')', 1);
      h += n.tre.peace ? B_('c:peace', '✖ Nichtangriffspakt ' + (S.turn - n.tre.peace <= 1 ? 'widerrufen (ohne Strafe)' : 'kündigen'), 1, '#7a3b2a') : B_('pact', '⚖️ Nichtangriffspakt vorschlagen (🪙' + Math.round(25 * c) + ')', 1);
      h += n.tre.ally ? B_('c:ally', '✖ Bündnis ' + (S.turn - n.tre.ally <= 1 ? 'widerrufen (ohne Strafe)' : 'kündigen') + (S.turn - n.tre.ally > 1 ? ' – schadet dem Ansehen' : ''), 1, '#7a3b2a') : B_('ally', '🤝 Bündnis vorschlagen (🪙' + Math.round(40 * c) + ')', 1);
      if (n.tre.ally && (S.raid || (S.nb.some(o => o.war)))) h += B_('help', '🪖 Verbündeten um Hilfe bitten', 1);
      h += '<h3>Druckmittel</h3>' + (n.vas ? B_('free', '🕊️ Tributpflicht aufheben (Beziehung steigt)', 1) : B_('demand', '👑 Tribut fordern (nach Stärke)', 1));
      if (n.took > 0) h += B_('refund', '↩️ Tribut zurückerstatten (🪙' + Math.round(n.took) + ') – Rückabwicklung', 1);
      h += B_('war', '⚔️ Krieg erklären', 1, '#7a3b2a');
    } else {
      h += '<h3>Krieg</h3><p class=lg>Erschöpfung des Gegners: ' + n.exh + ' · nächster Angriff in etwa ' + Math.max(1, n.wt) + ' Periode(n).</p>' +
        B_('attack', '⚔️ Truppen entsenden (🔧6, 🪙30)', 1) + B_('peace', '🕊️ Frieden anbieten', 1) + B_('peace2', '🕊️ Frieden mit Reparationen (🪙' + Math.round(10 + n.mil * 3) + ')', 1);
      if (n.mil < Dip.pow(S) * .35 && n.exh >= 2) h += B_('subdue', '👑 Unterwerfen (Tribut erzwingen)', 1);
    }
    return h + '<button data-a="dp" style="background:#6b6b5a">« Alle Nachbarn</button>';
  },
  say(n, txt) { toast(n.nm + ': ' + txt); },
  act(a) {
    if (a === 'dp') { dlg(Dip.listHtml()); return true; }
    const p = a.split(':'), n = Dip.nb(S, +p[1]); if (!n) return false;
    if (p.length === 2) { dlg(Dip.detailHtml(n.id)); return true; }
    if (over()) return true;
    const act = p[2], c = Dip.civ(S), P0 = Dip.pers(n), pay = v => { v = Math.round(v); if (S.res.coins < v) { toast('Zu wenig Münzen (🪙' + v + ').'); return false; } S.res.coins -= v; return true; };
    const confirm = (txt, yes) => { if (p[p.length - 1] === 'y') return true; dlg('<h2>Sicher?</h2><p>' + txt + '</p><button data-a="' + a + ':y" style="background:#7a3b2a">' + yes + '</button><button data-a="dp:' + n.id + '" style="background:#6b6b5a">Zurück</button>', 1); return false; };
    if (act === 'env') { if (pay(15 * c)) { n.rel += Dip.gain(S, 6 - Math.min(3, n.ask)); n.ask = Math.max(0, n.ask - 0); Dip.clampRel(n); Dip.say(n, 'Eure Gesandten werden freundlich empfangen.'); } }
    else if (act === 'gift') { if (pay(30 * c)) { n.rel += Dip.gain(S, 12); n.wealth += 30; Dip.clampRel(n); Dip.say(n, 'Das Geschenk wird dankbar angenommen.'); } }
    else if (act === 'trade') { const need = 12 - 8 * P0.greed; if (n.rel < need) return Dip.say(n, 'Kein Interesse. Die Beziehung ist noch zu schlecht (nötig: ' + Math.ceil(need) + ').'), true; if (pay(20 * c)) { n.tre.trade = S.turn; (n.fee = n.fee || {}).trade = Math.round(20 * c); n.rel += 4; Dip.say(n, 'Das Handelsabkommen wird geschlossen. Widerruf ist eine Periode lang ohne Strafe möglich.'); } }
    else if (act === 'pact') { const need = 5 + 20 * P0.aggr; if (n.rel < need) return Dip.say(n, 'Der Pakt kommt nicht zustande (Beziehung nötig: ' + Math.ceil(need) + ').'), true; if (pay(25 * c)) { n.tre.peace = S.turn; (n.fee = n.fee || {}).peace = Math.round(25 * c); n.rel += 3; Dip.say(n, 'Der Nichtangriffspakt gilt. Widerruf ist eine Periode lang ohne Strafe möglich.'); } }
    else if (act === 'ally') { const need = 35 + 15 * (1 - P0.honor); if (!(n.tre.trade || n.tre.peace)) return Dip.say(n, 'Zuerst ein Handelsabkommen oder Pakt schließen.'), true; if (n.rel < need) return Dip.say(n, 'Für ein Bündnis fehlt das Vertrauen (nötig: ' + Math.ceil(need) + ').'), true; if (pay(40 * c)) { n.tre.ally = S.turn; (n.fee = n.fee || {}).ally = Math.round(40 * c); n.rel += 6; n.ask = 0; Dip.say(n, 'Das Bündnis ist besiegelt. Widerruf ist eine Periode lang ohne Strafe möglich.'); } }
    else if (act === 'c') { const k = p[3]; if (n.tre[k]) { const heavy = S.turn - n.tre[k] > 1; if (heavy && p[p.length - 1] !== 'y') { if (!confirm('Den Vertrag zu kündigen schadet der Beziehung und deinem Ansehen. Wirklich kündigen?', 'Ja, kündigen')) return true; } const m = Dip.unwind(S, n, k, 'me'); S.log.unshift('P' + S.turn + ': ' + m); Sys.chron(S, m); toast(m); } }
    else if (act === 'help') { if (n.tre.ally) { n.sup = 4; n.rel -= 3; Dip.clampRel(n); Dip.say(n, 'Wir schicken Truppen zu deiner Unterstützung (4 Perioden).'); } }
    else if (act === 'demand') {
      const r = Dip.pow(S) / Math.max(1, n.mil);
      if (r >= 1.5 || (r >= 1 && Math.random() < .5)) { n.vas = 1; n.trib = Math.max(2, Math.round(n.wealth * .02 + 2)); n.tl = 10; n.rel -= 12; n.cf = 3; S.dr = Math.max(0, S.dr - 2); Dip.clampRel(n); Dip.say(n, 'Wir beugen uns. Tribut: 🪙' + n.trib + ' je Periode für 10 Perioden.'); }
      else { n.rel -= 20; if (Math.random() < .5 && !n.war) { Dip.declare(S, n, 'Die Forderung wurde als Beleidigung aufgefasst.'); } else Dip.say(n, 'Eure Forderung ist anmaßend.'); Dip.clampRel(n); }
    }
    else if (act === 'free') { n.vas = 0; n.rel += 15; S.dr = Math.min(100, S.dr + 3); Dip.clampRel(n); Dip.say(n, 'Dieser Großmut wird nicht vergessen.'); }
    else if (act === 'refund') { const v = Math.round(n.took); if (pay(v)) { n.took = 0; n.vas = 0; n.rel += 25; S.dr = Math.min(100, S.dr + 5); Dip.clampRel(n); Dip.say(n, 'Die Rückerstattung des Tributs versöhnt uns.'); } }
    else if (act === 'war') {
      const brk = ['trade', 'peace', 'ally'].filter(k => n.tre[k]);
      if (!confirm('Einen Krieg gegen ' + n.nm + ' zu erklären kostet Ansehen' + (brk.length ? ' und beendet alle Verträge (Vertragsbruch schadet zusätzlich)' : '') + '. Wirklich?', 'Ja, Krieg erklären')) return true;
      if (brk.some(k => k !== 'trade')) { S.dr = Math.max(0, S.dr - 15); for (const o of S.nb) if (o.alive && o !== n && Dip.pers(o).honor > .6) o.rel -= 10; }
      for (const k of brk) n.tre[k] = 0; Dip.declare(S, n, 'Du hast den Krieg erklärt.', 1);
    }
    else if (act === 'peace' || act === 'peace2') {
      const rep = act === 'peace2' ? Math.round(10 + n.mil * 3) : 0; if (rep && !pay(rep)) return true;
      const ch = cl(.25 + n.exh * .12 + (n.rel + 60) / 300 - P0.aggr * .2 + (rep ? .3 : 0), .05, .95);
      if (Math.random() < ch) { Dip.peaceWith(S, n); Dip.say(n, 'Wir nehmen den Frieden an.'); } else { n.rel -= 2; Dip.say(n, 'Noch nicht. Der Kampf geht weiter.'); }
    }
    else if (act === 'attack') {
      if (S.res.coins < 30 || S.res.tools < 6) return toast('Benötigt 🔧6 und 🪙30.'), true;
      S.res.coins -= 30; S.res.tools -= 6;
      const f = dfn(S, 1) * (.8 + Math.random() * .4), e = n.mil * .9, win = f >= e;
      if (win) { const loot = Math.round(n.wealth * .15); S.res.coins += loot; n.wealth -= loot; n.mil *= .72; n.exh++; n.rel -= 6; Dip.say(n, 'Sieg! Beute: 🪙' + loot + '. Ihr Heer ist geschwächt.'); }
      else { const d = Math.max(1, Math.ceil(S.pop * .06)); S.pop = Math.max(2, S.pop - d); S.sat = Math.max(0, S.sat - 4); n.mil *= .97; Dip.say(n, 'Der Vorstoß scheiterte, ' + d + ' Bewohner sind gefallen.'); }
      S.log.unshift('P' + S.turn + ': Vorstoß gegen ' + n.nm + (win ? ' gewonnen.' : ' gescheitert.'));
    }
    else if (act === 'subdue') { n.vas = 1; n.trib = Math.max(3, Math.round(n.wealth * .03 + 3)); n.tl = 14; n.war = 0; n.cf = 10; n.rel = Math.min(n.rel, -20); S.dr = Math.max(0, S.dr - 1); Dip.say(n, 'Wir unterwerfen uns. Tribut: 🪙' + n.trib + ' für 14 Perioden.'); S.ps = (S.ps || 0) + 1; }
    after(); dlg(Dip.detailHtml(n.id)); return true;
  },
  declare(s, n, why, byMe) {
    n.war = 1; n.wt = 3; n.exh = 0; n.cf = 0; for (const k of ['trade', 'peace', 'ally']) n.tre[k] = 0; n.rel = Math.min(n.rel, -30);
    s.log.unshift('P' + s.turn + ': Krieg mit ' + n.nm + '. ' + why); Sys.chron(s, 'Krieg mit ' + n.nm); toast('Krieg mit ' + n.nm + '!');
    for (const o of s.nb) if (o.alive && o !== n && o.tre.ally) { o.sup = 3; if (n.al.includes(o.id)) o.rel -= 5; }
  },
  peaceWith(s, n) { n.war = 0; n.wt = 0; n.exh = 0; n.cf = 8; n.rel = Math.max(n.rel, -5); s.ps = (s.ps || 0) + 1; s.log.unshift('P' + s.turn + ': Frieden mit ' + n.nm + '.'); Sys.chron(s, 'Frieden mit ' + n.nm); if (s.raid && s.raid.by === n.id) s.raid = null; },
};

// ---------- Vorschläge und Meldungen der Nachbarn (Entscheidungen) ----------
Dip.EV = {
  kontakt: {
    show: (s, p) => { const n = Dip.nb(s, p.d.n), P0 = Dip.pers(n); return { ttl: P0.i + ' Neue Nachbarn: ' + n.nm, txt: 'Gesandte aus <b>' + n.nm + '</b> (' + P0.n + ') erreichen deine Stadt und stellen sich vor. ' + (n.p === 'krieger' ? 'Sie wirken kampflustig.' : n.p === 'haendler' ? 'Sie interessieren sich für Handel.' : n.p === 'ehre' ? 'Sie sprechen von Ehre und Bündnistreue.' : n.p === 'listig' ? 'Ihr Lächeln wirkt berechnend.' : 'Sie wollen vor allem in Ruhe leben.') + ' Über 🤝 kannst du Beziehungen pflegen und Verträge schließen.', o: ['Gesandte freundlich empfangen (+6)', 'Abwarten'] }; },
    res: (s, p, i) => { const n = Dip.nb(s, p.d.n); if (i === 0) { n.rel += 6; return n.nm + ' erinnert sich an den freundlichen Empfang.'; } return 'Du nimmst den ersten Kontakt zur Kenntnis.'; },
  },
  handel: {
    show: (s, p) => { const n = Dip.nb(s, p.d.n); return { ttl: '💰 Handelsangebot von ' + n.nm, txt: n.nm + ' schlägt ein Handelsabkommen vor: bessere Preise am Markt und regelmäßige Einnahmen. Du kannst es eine Periode lang ohne Strafe widerrufen.', o: ['Annehmen', 'Ablehnen'] }; },
    res: (s, p, i) => { const n = Dip.nb(s, p.d.n); if (i === 0) { n.tre.trade = s.turn; n.rel += 4; return 'Handelsabkommen mit ' + n.nm + ' geschlossen.'; } n.rel -= 2; return 'Du lehnst das Handelsabkommen ab.'; },
  },
  buendnis: {
    show: (s, p) => { const n = Dip.nb(s, p.d.n); return { ttl: '🤝 Bündnisangebot von ' + n.nm, txt: n.nm + ' bietet ein Bündnis an. Verbündete helfen bei Angriffen, erwarten aber Beistand in ihren Kriegen. Ein Bruch schadet deinem Ansehen.', o: ['Bündnis eingehen', 'Ablehnen'] }; },
    res: (s, p, i) => { const n = Dip.nb(s, p.d.n); if (i === 0) { n.tre.ally = s.turn; n.rel += 8; n.ask = 0; return 'Bündnis mit ' + n.nm + ' geschlossen.'; } n.rel -= 3; return 'Du lehnst das Bündnis höflich ab.'; },
  },
  tribut: {
    show: (s, p) => { const n = Dip.nb(s, p.d.n); return { ttl: '👑 Forderung von ' + n.nm, txt: n.nm + ' hält deine Stadt für schwach und verlangt einmalig <b>🪙' + p.d.a + '</b> Tribut. Sonst droht Krieg.', o: ['Zahlen (🪙' + p.d.a + ')', 'Verhandeln (🪙' + Math.round(p.d.a / 2) + ', 50 % Erfolg)', 'Ablehnen'] }; },
    res: (s, p, i) => {
      const n = Dip.nb(s, p.d.n);
      if (i === 0) { if (s.res.coins < p.d.a) { toast('Zu wenig Münzen.'); return false; } s.res.coins -= p.d.a; n.wealth += p.d.a; n.rel += 3; n.cf = 8; s.dr = Math.max(0, s.dr - 2); return 'Du zahlst ' + p.d.a + ' Münzen Tribut an ' + n.nm + '.'; }
      if (i === 1) { const h = Math.round(p.d.a / 2); if (s.res.coins < h) { toast('Zu wenig Münzen.'); return false; } s.res.coins -= h; if (Math.random() < .5) { n.cf = 6; n.rel += 2; return 'Die Verhandlung gelingt: ' + n.nm + ' gibt sich mit ' + h + ' Münzen zufrieden.'; } n.rel -= 8; Dip.declare(s, n, 'Die Verhandlung scheiterte.'); return 'Die Verhandlung scheitert, ' + n.nm + ' marschiert.'; }
      if (Math.random() < .5) { n.rel -= 15; Dip.declare(s, n, 'Du hast die Forderung abgelehnt.'); return 'Du lehnst ab. ' + n.nm + ' erklärt den Krieg.'; } n.rel -= 12; n.cf = 4; return 'Du lehnst ab. ' + n.nm + ' murrt, greift aber nicht an.';
    },
  },
  krieg: {
    show: (s, p) => { const n = Dip.nb(s, p.d.n); const al = Dip.allyOf(s); return { ttl: '⚔️ Kriegserklärung von ' + n.nm, txt: n.nm + ' erklärt dir den Krieg. ' + p.d.why + ' Rechne mit Angriffen alle paar Perioden. ' + (al.length ? 'Deine Verbündeten (' + al.map(a => a.nm).join(', ') + ') stehen bereit.' : 'Du hast keine Verbündeten.') + ' Über 🤝 kannst du Frieden anbieten, Truppen entsenden oder Hilfe anfordern.', o: ['Verstanden'] }; },
    res: (s, p) => 'Krieg mit ' + Dip.name(p.d.n) + '.',
  },
  hilfe: {
    show: (s, p) => { const n = Dip.nb(s, p.d.n), f = Dip.nb(s, p.d.f); return { ttl: '🛡️ Bündnisfall: ' + n.nm, txt: 'Dein Verbündeter <b>' + n.nm + '</b> ist im Krieg mit <b>' + f.nm + '</b> und bittet um Beistand.', o: ['Beistehen: ' + f.nm + ' den Krieg erklären', 'Neutral bleiben (schadet der Freundschaft)', 'Vermitteln (🪙30, 50 % Erfolg)'] }; },
    res: (s, p, i) => {
      const n = Dip.nb(s, p.d.n), f = Dip.nb(s, p.d.f);
      if (i === 0) { n.rel += 20; s.dr = Math.min(100, s.dr + 2); n.ask = 0; if (f && f.alive) Dip.declare(s, f, 'Du stehst deinem Verbündeten ' + n.nm + ' bei.'); return 'Du stehst ' + n.nm + ' bei und erklärst ' + (f ? f.nm : 'dem Feind') + ' den Krieg.'; }
      if (i === 1) { n.rel -= 12; n.ask++; if (n.ask >= 2) { const m = Dip.unwind(s, n, 'ally', 'ai'); return 'Du bleibst neutral. ' + m + ' (Nach wiederholter Weigerung.)'; } return 'Du bleibst neutral. ' + n.nm + ' ist enttäuscht.'; }
      if (s.res.coins < 30) { toast('Zu wenig Münzen.'); return false; } s.res.coins -= 30;
      if (Math.random() < .5 && f) { n.wr = n.wr.filter(x => x !== f.id); f.wr = f.wr.filter(x => x !== n.id); n.rel += 5; return 'Die Vermittlung gelingt: ' + n.nm + ' und ' + f.nm + ' schließen Frieden.'; } n.rel += 1; return 'Die Vermittlung scheitert, aber der Versuch wird gewürdigt.';
    },
  },
  frieden: {
    show: (s, p) => { const n = Dip.nb(s, p.d.n); return { ttl: '🕊️ Friedensangebot von ' + n.nm, txt: n.nm + ' ist des Krieges müde und bietet einen Waffenstillstand an.', o: ['Frieden annehmen', 'Ablehnen'] }; },
    res: (s, p, i) => { const n = Dip.nb(s, p.d.n); if (i === 0) { Dip.peaceWith(s, n); return 'Frieden mit ' + n.nm + '.'; } n.rel -= 3; return 'Du lehnst den Frieden ab.'; },
  },
  kuendigung: {
    show: (s, p) => { const n = Dip.nb(s, p.d.n); const nm = { trade: 'Das Handelsabkommen', peace: 'Der Nichtangriffspakt', ally: 'Das Bündnis' }[p.d.k]; return { ttl: '✖ Vertrag beendet: ' + n.nm, txt: nm + ' mit <b>' + n.nm + '</b> wurde von der Gegenseite gekündigt. ' + p.d.why, o: ['Verstanden'] }; },
    res: (s, p) => 'Vertrag mit ' + Dip.name(p.d.n) + ' beendet.',
  },
  aufstand: {
    show: (s, p) => { const n = Dip.nb(s, p.d.n); return { ttl: '🔥 Tributpflicht beendet', txt: n.nm + ' schüttelt die Tributpflicht ab, weil deine Truppen zu schwach wirken.', o: ['Verstanden'] }; },
    res: (s, p) => Dip.name(p.d.n) + ' ist wieder frei.',
  },
  koalition: {
    show: () => ({ ttl: '🧭 Misstrauen unter den Nachbarn', txt: 'Deine Stärke macht den Nachbarn Angst. Sie tauschen Boten aus und rücken zusammen. Verträge und Geschenke können das Misstrauen dämpfen.', o: ['Verstanden'] }),
    res: () => 'Die Nachbarn rücken gegen deine Stadt zusammen.',
  },
};

// ---------- Zeichnen der Nachbarsiedlungen und Antippen ----------
Dip.hit = function (x, y) { for (const n of S.nb || []) if (n.known && Math.hypot(x - n.x, y - n.y) < 3.6) return n; return null; };
Dip.CEN = { haendler: 'market', krieger: 'tower', ehre: 'guard', listig: 'inn', fried: 'mill' };
Dip.OFF = [[-2, -1], [1, -2], [-1, 2], [2, 1], [0, -3], [-3, 1], [3, -1], [0, 3]];
Dip.draw = function (t) {
  if (!S.nb || !S.nb.length) return;
  const z = cam.z, L = S.nb.filter(n => n.known).sort((a, b) => a.x + a.y - b.x - b.y);
  for (const n of L) {
    const [cx, cy] = P(n.x, n.y); if (cx < -170 * z || cx > W + 170 * z || cy < -150 * z || cy > H + 150 * z) continue;
    const P0 = Dip.pers(n), al = n.alive ? 1 : .4;
    g.globalAlpha = al;
    for (let j = -3; j <= 3; j++) for (let i = -3; i <= 3; i++) if (Math.abs(i) + Math.abs(j) <= 4) { const [px, py] = P(n.x + i, n.y + j); dia(px, py, 1.03, Sys.sea(S) === 3 ? (((i + j) & 1) ? '#dfe7e6' : '#e8eeed') : ((i + j) & 1) ? '#7a9a52' : '#86a45a'); }
    const cnt = n.alive ? 3 + Math.min(5, (n.wealth / 120) | 0) : 2, items = [];
    for (let k = 0; k < cnt; k++) items.push({ id: 'house', o: Dip.OFF[k] });
    items.push({ id: Dip.CEN[n.p] || 'house', o: [0, 0] });
    items.sort((a, b) => a.o[0] + a.o[1] - b.o[0] - b.o[1]);
    for (const it of items) { const c = (Sys.sea(S) === 3 && SPR[it.id + 'w']) || SPR[it.id], [px, py] = P(n.x + it.o[0], n.y + it.o[1]); if (c) spr(c, px, py + 8 * z, al, it.id === 'house' ? .85 : 1); }
    g.globalAlpha = 1;
    // Fahne
    const [fx, fy] = P(n.x, n.y); g.strokeStyle = '#4a3a22'; g.lineWidth = 2 * z; g.beginPath(); g.moveTo(fx, fy - 20 * z); g.lineTo(fx, fy - 72 * z); g.stroke();
    g.fillStyle = n.col; g.beginPath(); g.moveTo(fx, fy - 72 * z); g.lineTo(fx + 22 * z, fy - 66 * z + Math.sin(t * 3 + n.id) * 2 * z); g.lineTo(fx, fy - 58 * z); g.closePath(); g.fill();
    // Namensschild
    const s = P0.i + ' ' + n.nm + (n.alive ? '' : ' †') + (n.war ? ' ⚔️' : n.tre.ally ? ' 🤝' : n.tre.trade ? ' 💰' : '');
    g.font = 'bold ' + Math.max(11, 13 * z) + 'px sans-serif'; g.textAlign = 'center';
    const w = g.measureText(s).width + 12;
    g.fillStyle = 'rgba(29,43,27,.82)'; g.beginPath(); g.roundRect ? g.roundRect(fx - w / 2, fy + 34 * z, w, 20 * Math.max(.8, z), 8) : g.rect(fx - w / 2, fy + 34 * z, w, 20 * Math.max(.8, z)); g.fill();
    g.fillStyle = '#f4ecd8'; g.fillText(s, fx, fy + 34 * z + 14 * Math.max(.8, z));
  }
  g.globalAlpha = 1;
};
