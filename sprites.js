'use strict';
// MERIDIAN 2.0 – SVG-Sprites. Jedes Motiv wird einmal als SVG erzeugt und in einen Offscreen-Canvas gerastert
// (viewBox 80x110, Anker = Kachelmitte bei (40,84)). buildSprites('std'|'hi') baut alles neu auf:
//   std = 2fache, hi = 3fache Rasterung mit zusaetzlichen Details. Winterfassungen tragen das Kuerzel „w“,
//   Baumvarianten der Jahreszeiten „s“ (Fruehling), „“ (Sommer), „a“ (Herbst), „w“ (Winter).
const SPR = {}, SM = {};
let buildSprites;
(function () {
  const cl = (v, a, b) => Math.max(a, Math.min(b, v)),
    sh = (c, f) => '#' + [1, 3, 5].map(i => { const v = parseInt(c.substr(i, 2), 16); return cl(Math.round(f > 1 ? v + (255 - v) * (f - 1) : v * f), 0, 255).toString(16).padStart(2, '0'); }).join(''),
    P = a => a.map(p => p[0].toFixed(1) + ',' + p[1].toFixed(1)).join(' '),
    pl = (a, f, e = '') => `<polygon points="${P(a)}" fill="${f}" ${e}/>`,
    ln = (a, b, c, w = 1, o = 1) => `<line x1="${a[0].toFixed(1)}" y1="${a[1].toFixed(1)}" x2="${b[0].toFixed(1)}" y2="${b[1].toFixed(1)}" stroke="${c}" stroke-width="${w}" stroke-opacity="${o}" stroke-linecap="round"/>`,
    lp = (a, b, k) => [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k],
    ci = (x, y, r, f, e = '') => `<circle cx="${x}" cy="${y}" r="${r}" fill="${f}" ${e}/>`,
    el = (x, y, rx, ry, f, e = '') => `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="${f}" ${e}/>`,
    rc = (x, y, w, h, f, e = '') => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${f}" ${e}/>`,
    dia = (cx, cy, hw, hh) => [[cx - hw, cy], [cx, cy + hh], [cx + hw, cy], [cx, cy - hh]];
  let HI = false, SNOW = false, SC = 2, SE = 1;
  const SN = '#f4f8fb';

  const mk = (n, svg, w, h, sc) => {
    const k = sc || SC, im = new Image();
    im.onload = () => { const c = document.createElement('canvas'); c.width = Math.round(w * k); c.height = Math.round(h * k); c.getContext('2d').drawImage(im, 0, 0, c.width, c.height); SPR[n] = c; };
    im.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="${Math.round(w * k)}" height="${Math.round(h * k)}" viewBox="0 0 ${w} ${h}">${svg}</svg>`);
  };
  const base = (f = '#b59a6e', o = .5) => pl(dia(43, 87, 30, 15), 'rgba(0,0,0,.2)') + pl(dia(40, 84, 30, 15), SNOW ? '#e4eaec' : f, `fill-opacity="${SNOW ? .92 : o}"`);

  // ---------- Kleinteile ----------
  const barrel = (x, y, c = '#8a5f34') => el(x, y + 3.6, 3.2, 1.4, 'rgba(0,0,0,.25)') + rc(x - 3, y - 3, 6, 6.4, c) + el(x, y + 3.4, 3, 1.3, sh(c, .8)) + el(x, y - 3, 3, 1.3, sh(c, 1.25)) + ln([x - 3, y - .8], [x + 3, y - .8], '#3a2a18', .7) + ln([x - 3, y + 1.8], [x + 3, y + 1.8], '#3a2a18', .7);
  const crate = (x, y, c = '#b08a52') => pl([[x - 4, y], [x, y + 2], [x + 4, y], [x, y - 2]], sh(c, 1.2)) + pl([[x - 4, y], [x, y + 2], [x, y + 7], [x - 4, y + 5]], c) + pl([[x, y + 2], [x + 4, y], [x + 4, y + 5], [x, y + 7]], sh(c, .75)) + ln([x - 4, y + 2.5], [x, y + 4.5], '#5a4028', .6) + ln([x, y + 4.5], [x + 4, y + 2.5], '#5a4028', .6);
  const bush = (x, y, s = 1, c = '#4a8a3c') => SNOW ? el(x, y, 5 * s, 3.2 * s, '#d8e2e4') + el(x - 1, y - 1.6 * s, 3.4 * s, 2.2 * s, SN) : el(x, y + 1, 5 * s, 2 * s, 'rgba(0,0,0,.18)') + ci(x - 2 * s, y - .5 * s, 3.2 * s, sh(c, .85)) + ci(x + 2 * s, y - .5 * s, 3.4 * s, c) + ci(x, y - 2.4 * s, 3 * s, sh(c, 1.18));
  const flag = (x, y, len, c, k = 0) => ln([x, y], [x, y - len], '#4a3320', 1.2) + pl([[x, y - len], [x + 11, y - len + 3 + k], [x, y - len + 7]], c);
  const fence = (a, b, n = 4, c = '#8a6a3a') => { let r = ln(lp(a, b, 0), lp(a, b, 1), c, .9); const t = [a[0] - 0, a[1] - 3.5], u = [b[0], b[1] - 3.5]; r += ln(t, u, c, .9); for (let i = 0; i <= n; i++) { const p = lp(a, b, i / n); r += ln(p, [p[0], p[1] - 5], c, 1.3); } return r; };
  const col = (a, hgt, c) => rc(a[0] - 1.5, a[1] - hgt, 3, hgt, sh(c, 1.18)) + rc(a[0] - 2.2, a[1] - hgt - 1.2, 4.4, 1.6, sh(c, 1.28)) + rc(a[0] - 2.2, a[1] - .4, 4.4, 1.4, sh(c, 1));
  const dome = (x, y, r, c, lant = 1) => `<path d="M${x - r} ${y} A${r} ${r * .9} 0 0 1 ${x + r} ${y}Z" fill="${c}"/><path d="M${x} ${y - r * .9} A${r} ${r * .9} 0 0 1 ${x + r} ${y} L${x} ${y}Z" fill="rgba(0,0,0,.2)"/>` + (SNOW ? `<path d="M${x - r * .7} ${y - r * .55} A${r} ${r * .9} 0 0 1 ${x + r * .7} ${y - r * .55}Z" fill="${SN}" opacity=".9"/>` : '') + (lant ? rc(x - 1.4, y - r * .9 - 5, 2.8, 5, '#e0d4b0') + pl([[x - 2, y - r * .9 - 5], [x, y - r * .9 - 9], [x + 2, y - r * .9 - 5]], '#e0b048') : '');
  const spire = (x, y, w, h, c) => pl([[x - w, y], [x, y - h], [x + w, y]], c) + pl([[x, y - h], [x + w, y], [x, y]], 'rgba(0,0,0,.22)') + (SNOW ? pl([[x, y - h], [x + w * .45, y - h * .55], [x - w * .45, y - h * .55]], SN) : '') + ln([x, y - h], [x, y - h - 5], '#e0b048', 1) + ln([x - 1.6, y - h - 3.4], [x + 1.6, y - h - 3.4], '#e0b048', 1);
  const sheep = (x, y, s = 1) => el(x, y + 3 * s, 4.2 * s, 1.3 * s, 'rgba(0,0,0,.18)') + ln([x - 2 * s, y + 2 * s], [x - 2 * s, y + 4 * s], '#3a3a3a', .9 * s) + ln([x + 2 * s, y + 2 * s], [x + 2 * s, y + 4 * s], '#3a3a3a', .9 * s) + ci(x - 2.2 * s, y, 2.6 * s, '#f1efe6') + ci(x + .6 * s, y - .8 * s, 3 * s, '#f6f4ec') + ci(x + 2.4 * s, y + .4 * s, 2.2 * s, '#ebe8dc') + ci(x + 4.2 * s, y - .6 * s, 1.5 * s, '#3a3a3a') + el(x + 3.8 * s, y - 1.9 * s, .7 * s, 1.1 * s, '#3a3a3a');
  const cow = (x, y, s = 1) => el(x, y + 4 * s, 6 * s, 1.6 * s, 'rgba(0,0,0,.18)') + [[-3.6, 2], [-1.4, 3], [2.6, 2], [4.4, 3]].map(([a, b]) => ln([x + a * s, y + b * s], [x + a * s, y + (b + 2.2) * s], '#4a3a2a', 1 * s)).join('') + `<rect x="${x - 5.5 * s}" y="${y - 3 * s}" width="${11 * s}" height="${6 * s}" rx="${2.4 * s}" fill="#f2efe6"/>` + ci(x - 2 * s, y - .6 * s, 2 * s, '#6b4a2a') + ci(x + 2.4 * s, y + .6 * s, 1.7 * s, '#6b4a2a') + `<rect x="${x + 4.2 * s}" y="${y - 4 * s}" width="${3.8 * s}" height="${3.6 * s}" rx="${1.2 * s}" fill="#e8e2d2"/>` + ci(x + 7.4 * s, y - 1.8 * s, .6 * s, '#c47a7a') + ln([x + 4.6 * s, y - 4 * s], [x + 4 * s, y - 5.4 * s], '#d8d0b8', .8 * s) + ln([x + 7.6 * s, y - 4 * s], [x + 8.2 * s, y - 5.4 * s], '#d8d0b8', .8 * s) + ln([x - 5.5 * s, y - 2 * s], [x - 7 * s, y + 1 * s], '#4a3a2a', .8 * s);
  const hen = (x, y) => el(x, y + 1.6, 2.4, .8, 'rgba(0,0,0,.2)') + el(x, y, 2.4, 1.8, '#f0e6d4') + ci(x + 1.6, y - 1.6, 1.1, '#f0e6d4') + pl([[x + 2.5, y - 1.7], [x + 3.7, y - 1.4], [x + 2.5, y - 1.1]], '#e0a030') + ci(x + 1.5, y - 2.5, .5, '#c0392b') + ln([x - 2, y - .5], [x - 3.2, y - 1.8], '#cdbb98', 1);
  const smallTree = (x, y, c = '#5a9a46', fr = '#d9533a') => el(x, y + 1.4, 4.4, 1.4, 'rgba(0,0,0,.2)') + rc(x - .9, y - 5, 1.8, 6.4, '#5a3d22') + ci(x, y - 8, 4.4, sh(c, .85)) + ci(x - 2, y - 6.6, 2.8, c) + ci(x + 2, y - 7, 3, sh(c, 1.15)) + (SNOW ? '' : ci(x - 1.4, y - 7.6, .9, fr) + ci(x + 1.8, y - 6.2, .9, fr) + ci(x + .4, y - 9.6, .9, fr));

  // ---------- Hausbau ----------
  function hut(o) {
    const s = o.s || 1, cx = 40 + (o.ox || 0), cy = 84 + (o.oy || 0), h = o.h, rh = o.rh || 0, hw = 26 * s, hh = 13 * s, w = o.w,
      L = (u, v) => [cx - hw + hw * u, cy + hh * u - v], R = (u, v) => [cx + hw * u, cy + hh - hh * u - v], dk = sh(w, .74);
    let x = pl(dia(cx + 3, cy + 3, hw + 2, hh + 1), 'rgba(0,0,0,.22)');
    x += pl([L(0, 0), L(1, 0), L(1, h), L(0, h)], w) + pl([R(0, 0), R(1, 0), R(1, h), R(0, h)], dk);
    if (!o.nofound) x += pl([L(0, 0), L(1, 0), L(1, 2.4), L(0, 2.4)], '#8c8578') + pl([R(0, 0), R(1, 0), R(1, 2.4), R(0, 2.4)], '#6f695e');
    for (const f of [L, R]) {
      if (o.st === 'timber') {
        for (const u of [0, .5, 1]) x += ln(f(u, 0), f(u, h), '#4a3320', 1.2);
        for (const v of [0, h * .5, h]) x += ln(f(0, v), f(1, v), '#4a3320', 1.2);
        x += ln(f(0, 0), f(.5, h * .5), '#4a3320', .9) + ln(f(1, 0), f(.5, h * .5), '#4a3320', .9);
        if (HI) for (let k = 0; k < 9; k++) { const p = f(.08 + (k * .37) % .84, 2 + (k * 5.3) % (h - 4)); x += ci(p[0], p[1], .5, sh(w, .85), 'opacity=".7"'); }
      } else if (o.st === 'stone') {
        for (let k = 1; k < h / 4; k++) { x += ln(f(0, k * 4), f(1, k * 4), sh(w, .7), .6); for (let u = k % 2 ? .15 : .4; u < 1; u += .25) x += ln(f(u, k * 4), f(u, k * 4 - 4), sh(w, .7), .6); }
        if (HI) for (let k = 0; k < 7; k++) { const a = f(.1 + (k * .29) % .8, 4 + (k * 7) % Math.max(5, h - 8)), b = f(.1 + (k * .29) % .8 + .12, a ? 0 : 0); x += pl([a, [a[0] + 3.2, a[1] + 1.5], [a[0] + 3.2, a[1] - 2.2], [a[0], a[1] - 3.6]], sh(w, k % 2 ? .93 : 1.07), 'opacity=".45"'); }
      }
    }
    if (o.cols) { for (const u of o.cols) x += pl([L(u - .025, 0), L(u + .035, 0), L(u + .035, h), L(u - .025, h)], sh(w, 1.16)) + pl([L(u - .04, h), L(u + .05, h), L(u + .05, h - 1.8), L(u - .04, h - 1.8)], sh(w, 1.26)); }
    const rows = o.rows || 1;
    const wn = (f, u, v, glow) => {
      const a = f(u, v), b = f(u + .15, v), c = f(u + .15, v + 6.5), d = f(u, v + 6.5); let r = '';
      if (o.shut) r += pl([f(u - .06, v), f(u, v), f(u, v + 6.5), f(u - .06, v + 6.5)], o.shut) + pl([f(u + .15, v), f(u + .21, v), f(u + .21, v + 6.5), f(u + .15, v + 6.5)], o.shut);
      r += pl([a, b, c, d], glow ? '#f3c969' : (o.glass || '#2d3b4d'), 'stroke="#efe3c4" stroke-width=".8"');
      if (HI || o.mull) r += ln(lp(a, b, .5), lp(d, c, .5), '#efe3c4', .5) + ln(lp(a, d, .5), lp(b, c, .5), '#efe3c4', .5);
      if (o.fb) { const p = f(u - .02, v), q = f(u + .17, v); r += pl([[p[0], p[1] + .2], [q[0], q[1] + .2], [q[0], q[1] + 2.4], [p[0], p[1] + 2.4]], '#6b4a2a') + ci((p[0] + q[0]) / 2 - 2, p[1] - .3, 1, '#d9533a') + ci((p[0] + q[0]) / 2, p[1] - .7, 1, '#f0a0b0') + ci((p[0] + q[0]) / 2 + 2, p[1] - .3, 1, '#e8c34a'); }
      return r;
    };
    if (!o.nowin) for (let r = 0; r < rows; r++) { const v = rows > 1 ? h * (.25 + .4 * r) + 1 : h * .5; x += wn(L, .6, v, o.glow) + (o.st === 'timber' || rows > 1 ? wn(L, .8, v, 0) : '') + wn(R, .25, v, 0) + wn(R, .6, v, o.glow); }
    if (rows > 1) x += ln(L(0, h * .62 - .5), L(1, h * .62 - .5), sh(w, .8), .8) + ln(R(0, h * .62 - .5), R(1, h * .62 - .5), sh(w, .66), .8);
    if (o.door) {
      const k = L(.36, h * .3), dw = o.wide ? .5 : .22;
      x += pl([L(.18 - .02, 0), L(.18 + dw + .02, 0), L(.18 + dw + .02, h * .6 + 1), L(.18 - .02, h * .6 + 1)], '#6a4a2a') + pl([L(.18, 0), L(.18 + dw, 0), L(.18 + dw, h * .6), L(.18, h * .6)], o.doorc || '#4a2f1b', 'stroke="#2a1a0e" stroke-width=".6"');
      if (o.wide) x += ln(L(.18 + dw / 2, 0), L(.18 + dw / 2, h * .6), '#2a1a0e', .8);
      else x += ci(k[0], k[1], .7, '#e0b048');
      if (o.arch) { const t = L(.18 + dw / 2, h * .6); x += `<path d="M${(t[0] - 5).toFixed(1)} ${(t[1] + 2).toFixed(1)} Q${t[0].toFixed(1)} ${(t[1] - 5).toFixed(1)} ${(t[0] + 5).toFixed(1)} ${(t[1] + 5).toFixed(1)}" fill="none" stroke="${sh(w, 1.25)}" stroke-width="1.2"/>`; }
      x += pl([L(.16, 0), L(.2 + dw, 0), L(.2 + dw, -1.2), L(.16, -1.2)], '#9a948a');
    }
    const TL = L(0, h), TB = L(1, h), TR = R(1, h), TT = [cx, cy - hh - h], rf = o.r;
    x += pl([L(0, h), L(1, h), L(1, h - 2.4), L(0, h - 2.4)], 'rgba(0,0,0,.2)') + pl([R(0, h), R(1, h), R(1, h - 2.4), R(0, h - 2.4)], 'rgba(0,0,0,.28)');
    if (o.flat) {
      x += pl([TL, TB, TR, TT], sh(w, 1.18), 'stroke="rgba(0,0,0,.25)" stroke-width=".6"');
      if (SNOW) x += pl([TL, TB, TR, TT], 'rgba(244,248,251,.92)');
      if (o.mer) for (const u of [.1, .4, .7]) x += pl([L(u, h), L(u + .15, h), L(u + .15, h + 3), L(u, h + 3)], sh(w, 1.05)) + pl([R(u, h), R(u + .15, h), R(u + .15, h + 3), R(u, h + 3)], sh(w, .8));
    } else if (o.hip) {
      const A = [cx, cy - h - rh];
      x += pl([TL, TB, A], rf) + pl([TB, TR, A], sh(rf, .72)) + ln(TL, A, sh(rf, .6), .6) + ln(TB, A, sh(rf, .6), .6);
      for (let k = 1; k < 5; k++) x += ln(lp(TL, A, k / 5), lp(TB, A, k / 5), sh(rf, .7), .5, .6);
      if (SNOW) x += pl([A, lp(A, TL, .55), lp(A, TB, .55)], SN) + pl([A, lp(A, TB, .55), lp(A, TR, .55)], '#dde6ea');
    } else {
      const M1 = lp(TL, TT, .5), M2 = lp(TB, TR, .5), a = [M1[0], M1[1] - rh], b = [M2[0], M2[1] - rh];
      x += pl([TB, TR, b], dk) + pl([TL, TB, b, a], rf, 'stroke="rgba(0,0,0,.25)" stroke-width=".6"');
      for (let k = 1; k < 5; k++) {
        x += ln(lp(TL, a, k / 5), lp(TB, b, k / 5), sh(rf, .7), .7, .6);
        if (HI) for (let j = 0; j < 7; j++) { const p = lp(lp(TL, a, k / 5), lp(TB, b, k / 5), (j + (k % 2 ? .2 : .7)) / 7), q = lp(lp(TL, a, (k + 1) / 5), lp(TB, b, (k + 1) / 5), (j + (k % 2 ? .2 : .7)) / 7); x += ln(p, q, sh(rf, .78), .5, .55); }
      }
      x += ln(a, b, sh(rf, 1.25), 1.4) + ln(TL, TB, sh(rf, .55), 1.2);
      if (o.dorm) for (const u of o.dorm) { const pt = lp(lp(TL, TB, u), lp(a, b, u), .45); x += pl([[pt[0] - 3.2, pt[1] - 1.5], [pt[0] + 3.2, pt[1] + 1.6], [pt[0] + 3.2, pt[1] - 4.4], [pt[0] - 3.2, pt[1] - 7.5]], w) + pl([[pt[0] - 2, pt[1] - 1.8], [pt[0] + 2, pt[1] + .2], [pt[0] + 2, pt[1] - 3.4], [pt[0] - 2, pt[1] - 5.4]], o.glow ? '#f3c969' : '#2d3b4d') + pl([[pt[0] - 4, pt[1] - 6.6], [pt[0], pt[1] - 12], [pt[0] + 4, pt[1] - 3.4]], rf, 'stroke="rgba(0,0,0,.3)" stroke-width=".5"'); }
      if (SNOW) {
        const pa = lp(a, TL, .5), pb = lp(b, TB, .5); let pts = [a, b];
        for (let i = 0; i <= 7; i++) { const p = lp(pb, pa, i / 7); pts.push([p[0], p[1] + (i % 2 ? 2.4 : .2)]); }
        x += pl(pts, SN, 'stroke="#c9d6dc" stroke-width=".5"') + ln(a, b, '#ffffff', 1.2);
      }
      if (o.chim) { const m = lp(a, b, o.chim); x += `<rect x="${m[0] - 3}" y="${m[1] - 6}" width="6" height="9" fill="#8f7d6c"/><rect x="${m[0] - 4}" y="${m[1] - 8}" width="8" height="3" fill="${SNOW ? SN : '#6d5e50'}"/>`; SM[o.id] = [m[0] - 40, m[1] - 9 - 84]; }
    }
    return x;
  }
  const pz = (x, y) => `<g fill="none" stroke="#a8642a" stroke-width="1.5"><circle cx="${x - 2.6}" cy="${y}" r="2.6"/><circle cx="${x + 2.6}" cy="${y}" r="2.6"/><path d="M${x - 1.6} ${y + 2} L${x + 1.6} ${y - 2} M${x + 1.6} ${y + 2} L${x - 1.6} ${y - 2}"/></g>` + ln([x - 6, y - 5.5], [x, y - 3.5], '#4a3320', .8),
    cross = (x, y, k) => `<g transform="translate(${x} ${y}) skewY(${k})"><rect x="-6" y="-2.2" width="12" height="4.4" fill="#fff"/><rect x="-2.2" y="-6" width="4.4" height="12" fill="#fff"/><rect x="-5" y="-1.4" width="10" height="2.8" fill="#c0392b"/><rect x="-1.4" y="-5" width="2.8" height="10" fill="#c0392b"/></g>`;
  const stall = (x, y, c) => { const a0 = [x, y - 16], a1 = [x + 18, y - 7], b0 = [x, y - 10], b1 = [x + 18, y - 1]; let r = ln([x, y + 3], [x, y - 14], '#5a4028', 1.5) + ln([x + 18, y + 12], [x + 18, y - 3], '#5a4028', 1.5) + pl([[x, y - 2], [x + 18, y + 7], [x + 18, y + 12], [x, y + 3]], '#8a6a3a') + ci(x + 5, y + 1, 2, '#d9533a') + ci(x + 10, y + 3.5, 2, '#e8c34a') + ci(x + 14, y + 5.5, 2, '#7ab648'); for (let i = 0; i < 3; i++) r += pl([lp(a0, a1, i / 3), lp(a0, a1, (i + 1) / 3), lp(b0, b1, (i + 1) / 3), lp(b0, b1, i / 3)], i % 2 ? '#f2ead8' : c); if (SNOW) r += pl([a0, a1, lp(a1, b1, .3), lp(a0, b0, .3)], SN); return r; },
    tent = (x, y, c) => pl([[x - 12, y], [x, y - 26], [x + 12, y]], c, 'stroke="rgba(0,0,0,.3)" stroke-width=".6"') + pl([[x, y - 26], [x + 12, y], [x + 3, y]], 'rgba(0,0,0,.22)') + pl([[x - 3, y], [x, y - 9], [x + 3, y]], '#2a1a0e'),
    log = (a, b) => `<rect x="${a}" y="${b}" width="14" height="5" rx="2.5" fill="#8a5f34"/><ellipse cx="${a + 12}" cy="${b + 2.5}" rx="2" ry="2.4" fill="#d6b07a"/>`;

  // ---------- Gebaeude ----------
  const H = {
    house: () => base() + hut({ id: 'house', w: '#e6d6b0', r: '#b04a32', h: 18, rh: 14, st: 'timber', door: 1, chim: .3, glow: 1, shut: '#4a7a4a', fb: 1 }) + bush(66, 90, .8) + bush(14, 92, .7, '#5a9a46'),
    burgher: () => base() + hut({ id: 'burgher', w: '#dccbaa', r: '#8f3b2a', h: 30, rh: 16, st: 'timber', door: 1, chim: .25, rows: 2, glow: 1, shut: '#3d5a8a', fb: 1, dorm: [.5] }) + bush(66, 91, .8),
    town: () => base() + hut({ id: 'town', w: '#eadfc4', r: '#7a3b2a', h: 38, rh: 18, st: 'timber', door: 1, chim: .25, rows: 2, glow: 1, shut: '#7a3b2a', fb: 1, dorm: [.28, .72], arch: 1 }) + ci(24, 66, 2, '#e0b048') + bush(66, 91, .9, '#5a9a46') + bush(12, 93, .7),
    tenement: () => base() + hut({ id: 'tenement', w: '#d8c9a8', r: '#7a3b2a', h: 42, rh: 14, st: 'timber', door: 1, chim: .3, rows: 3, glow: 1, shut: '#4a6a3a', fb: 1 }) + ln([14, 66], [30, 74], '#6b4a2a', .8) + pl([[16, 68], [20, 70], [19, 75], [15, 73]], '#e8e2d2') + pl([[22, 71], [27, 73], [26, 78], [21, 76]], '#c8a8a8') + barrel(66, 92),
    farm: () => {
      let f = pl(dia(40, 84, 30, 15), SNOW ? '#e6ecee' : '#b8a04a', 'stroke="#6b5a2a"');
      for (let k = 1; k < 9; k++) f += ln(lp([10, 84], [40, 69], k / 9), lp([40, 99], [70, 84], k / 9), SNOW ? (k % 2 ? '#c4ced2' : '#f4f8fb') : (k % 2 ? '#8f7a2e' : '#d9bd5a'), 1.6, .9);
      return f + hut({ id: 'farm', ox: -2, oy: -6, s: .55, w: '#c9a66b', r: '#7a5a35', h: 16, rh: 12, st: 'timber', door: 1, shut: '#6a4a2a' }) + (SNOW ? el(60, 92, 4, 2.4, SN) : ci(58, 93, 3.5, '#e0c060') + ci(63, 91, 3, '#d4b24e')) + (HI && !SNOW ? hen(52, 96) + hen(24, 92) : '');
    },
    wood: () => base('#8a7a5a', .55) + hut({ id: 'wood', ox: -8, oy: -6, s: .6, w: '#9c7a4a', r: '#5b4025', h: 14, rh: 10, st: 'timber', door: 1 }) + log(48, 93) + log(52, 88) + log(46, 88) + ln([62, 80], [66, 70], '#5a4028', 1.6) + pl([[64, 69], [70, 68], [68, 72]], '#9a9a9a'),
    quarry: () => base('#9a9484', .8) + pl(dia(40, 86, 22, 11), '#6f6a5f') + pl(dia(40, 84, 20, 10), '#8d887b') + pl([[34, 86], [40, 82], [47, 86], [44, 91], [36, 91]], '#b9b4a6', 'stroke="#6f6a5f" stroke-width=".6"') + pl([[48, 89], [53, 86], [58, 90], [54, 94], [49, 93]], '#a9a496', 'stroke="#6f6a5f" stroke-width=".6"') + ln([20, 88], [20, 60], '#5a4028', 2) + ln([20, 62], [34, 72], '#5a4028', 1.6) + ln([34, 72], [34, 84], '#333', .8) + pl([[16, 90], [24, 86], [28, 89], [20, 94]], '#c9b78e') + (SNOW ? pl([[34, 86], [40, 82], [47, 86], [41, 85]], SN) : ''),
    smith: () => base('#6f6a60', .5) + hut({ id: 'smith', w: '#8f8c86', r: '#4a4a58', h: 20, rh: 14, st: 'stone', door: 1, chim: .55, shut: '#3a3a44' }) + ci(22, 82, 2.6, '#ff8a2a') + pl([[52, 93], [60, 90], [58, 94], [54, 95]], '#333') + rc(61, 85, 4, 5, '#555') + pl([[59, 85], [67, 85], [65, 83], [60, 83]], '#777'),
    bakery: () => base() + hut({ id: 'bakery', w: '#f0dfba', r: '#c8682a', h: 20, rh: 14, st: 'timber', door: 1, chim: .5, glow: 1, shut: '#8a4a2a', fb: 1 }) + el(58, 93, 4, 2.2, '#c98a3a') + pz(21.5, 71) + el(64, 90, 2.6, 1.4, '#e8c98a') + crate(12, 90),
    mill: () => base('#9a9a7a', .5) + `<path d="M25 82 A15 7.5 0 0 0 55 82 L49 44 A9 4.5 0 0 0 31 44Z" fill="#e8dec6"/><path d="M40 89.5 A15 7.5 0 0 0 55 82 L49 44 L40 48.5Z" fill="rgba(0,0,0,.2)"/><path d="M30 44 A10 5 0 0 0 50 44 L40 24Z" fill="#7a5a35"/><path d="M40 49 L50 44 L40 24Z" fill="rgba(0,0,0,.2)"/><rect x="31" y="78" width="6" height="8" rx="3" fill="#4a2f1b"/><rect x="33" y="60" width="4" height="6" fill="#2d3b4d"/>` + ci(48, 50, 2.5, '#5a4028') + [[-1, -1], [1, -1], [1, 1], [-1, 1]].map(([a, b]) => pl([[48, 50], [48 + a * 18, 50 + b * 12], [48 + a * 18 + b * 2.4, 50 + b * 12 - a * 2.4]], 'rgba(240,232,210,.92)', 'stroke="#6a5238" stroke-width=".6"')).join('') + ci(48, 50, 2, '#5a4028') + (SNOW ? `<path d="M31 38 L40 24 L49 38Z" fill="${SN}"/>` : '') + barrel(60, 92) + crate(18, 92),
    market: () => base('#c9b78e', .9) + stall(14, 80, '#b8382a') + stall(38, 86, '#2a6aa8') + el(64, 90, 4, 2.5, '#8a5f34') + barrel(62, 80) + crate(66, 94),
    store: () => base() + hut({ id: 'store', w: '#b79566', r: '#6b4a2a', h: 22, rh: 12, st: 'timber', door: 1, wide: 1, shut: '#5a3d22' }) + rc(56, 87, 7, 8, '#8a5f34', 'rx="2"') + rc(56, 90, 7, 1, '#4a3320') + crate(14, 92) + crate(20, 96),
    well: () => base('#9aa08a', .6) + `<path d="M28 84 v-8 a12 6 0 0 0 24 0 v8 a12 6 0 0 1 -24 0z" fill="#aaa497"/><ellipse cx="40" cy="76" rx="12" ry="6" fill="#bdb7a8"/><ellipse cx="40" cy="76" rx="8.5" ry="4" fill="${SNOW ? '#b8d4e4' : '#3f78a8'}"/>` + ln([30, 76], [30, 56], '#5a4028', 2) + ln([50, 76], [50, 56], '#5a4028', 2) + pl([[26, 58], [40, 46], [54, 58]], '#8a4a30') + pl([[40, 46], [54, 58], [40, 58]], 'rgba(0,0,0,.2)') + ln([40, 58], [40, 70], '#ccc', .6) + (SNOW ? pl([[40, 46], [46, 52], [34, 52]], SN) : '') + rc(37, 68, 6, 5, '#8a5f34'),
    tower: () => base('#6f6a60', .4) + hut({ id: 'tower', s: .62, h: 46, rh: 16, hip: 1, w: '#b8b2a2', r: '#7a3b2a', st: 'stone', door: 1, arch: 1 }) + ln([40, 22], [40, 10], '#333', .8) + pl([[40, 10], [50, 13], [40, 16]], '#c0392b'),
    guard: () => base() + hut({ id: 'guard', w: '#a9a597', r: '#3d5a9a', h: 22, rh: 14, st: 'stone', door: 1, shut: '#3d5a9a' }) + ln([64, 92], [64, 58], '#4a3320', 1.2) + pl([[64, 58], [74, 61], [64, 67]], '#3d5a9a') + rc(10, 86, 3, 8, '#6b4a2a') + ln([8, 88], [15, 88], '#999', 1),
    fish: () => `<ellipse cx="40" cy="86" rx="27" ry="10" fill="rgba(255,255,255,.25)"/>` + [[18, 78], [40, 89], [62, 78]].map(([x, y]) => ln([x, y], [x, y + 10], '#4a3320', 2.4)).join('') + pl(dia(40, 78, 22, 11), '#8a6a3a', 'stroke="#4a3320" stroke-width=".6"') + hut({ id: 'fish', s: .5, oy: -6, w: '#b59a6e', r: '#4a6a7a', h: 12, rh: 9, st: 'timber', door: 1 }) + pl([[54, 86], [68, 80], [68, 92], [54, 98]], 'rgba(235,230,205,.3)', 'stroke="#d9d2b8" stroke-width=".6"') + ln([58, 88], [58, 97], '#d9d2b8', .5) + ln([62, 86], [62, 95], '#d9d2b8', .5) + ln([65, 84], [65, 93], '#d9d2b8', .5) + ln([54, 92], [68, 86], '#d9d2b8', .5) + ci(54, 86, 1.3, '#c0392b') + ci(68, 80, 1.3, '#c0392b'),
    inn: () => base() + hut({ id: 'inn', w: '#e0cfae', r: '#9a3b2a', h: 24, rh: 14, st: 'timber', door: 1, chim: .4, rows: 2, glow: 1, shut: '#7a3b2a', fb: 1 }) + ln([62, 88], [62, 66], '#4a3320', 1.2) + pl([[62, 66], [72, 69], [62, 74]], '#c8902a') + barrel(14, 92) + barrel(20, 95),
    hosp: () => base() + hut({ id: 'hosp', w: '#e9e4d6', r: '#4a7a9a', h: 26, rh: 14, st: 'stone', door: 1, rows: 2, shut: '#4a7a9a' }) + cross(27, 70.5, 26.57) + cross(53, 75.5, -26.57),
    hall1: () => base('#b8a98c', .95) + hut({ id: 'hall1', w: '#d9c9a8', r: '#7a3b2a', h: 26, rh: 14, st: 'timber', door: 1, chim: .3, rows: 2, glow: 1, shut: '#6a4a2a', arch: 1 }) + ln([40, 44], [40, 24], '#4a3320', 1.4) + pl([[40, 24], [55, 28], [40, 35]], '#c0392b') + ci(62, 88, 3, '#e0b048'),
    hall2: () => base('#b8a98c', .95) + hut({ id: 'hall2', w: '#cfc6b0', r: '#8a3b2a', h: 34, rh: 16, st: 'stone', door: 1, rows: 2, shut: '#6a3b2a', arch: 1 }) + hut({ id: 't1', s: .35, ox: -24, oy: 6, w: '#cfc6b0', r: '#8a3b2a', h: 40, rh: 12, hip: 1, st: 'stone' }) + ln([40, 34], [40, 12], '#4a3320', 1.4) + pl([[40, 12], [56, 16], [40, 24]], '#c0392b') + ci(52, 68, 3.4, '#e0b048'),
    hall3: () => base('#b8a98c', .95) + hut({ id: 'hall3', w: '#e6dcc4', r: '#3d5a9a', h: 44, rh: 20, st: 'stone', door: 1, rows: 2, glow: 1, shut: '#3d5a9a', arch: 1 }) + hut({ id: 't2', s: .35, ox: -24, oy: 6, w: '#e6dcc4', r: '#3d5a9a', h: 44, rh: 12, hip: 1, st: 'stone' }) + hut({ id: 't3', s: .35, ox: 24, oy: 6, w: '#e6dcc4', r: '#3d5a9a', h: 44, rh: 12, hip: 1, st: 'stone' }) + ln([40, 22], [40, 6], '#4a3320', 1.4) + pl([[40, 6], [55, 9], [40, 16]], '#e0b048') + ci(40, 50, 5, '#f2ead8') + ln([40, 50], [40, 46.5], '#333', .9) + ln([40, 50], [43, 50], '#333', .9),
    hall4: () => base('#b8a98c', .95) + hut({ id: 'hall4', w: '#eee4cc', r: '#3d6a5a', h: 40, rh: 18, st: 'stone', door: 1, rows: 3, glow: 1, shut: '#3d6a5a', arch: 1, cols: [.55, .7, .85], wide: 1 }) + hut({ id: 'h4a', s: .34, ox: -26, oy: 7, w: '#eee4cc', r: '#3d6a5a', h: 46, rh: 12, hip: 1, st: 'stone' }) + hut({ id: 'h4b', s: .34, ox: 26, oy: 7, w: '#eee4cc', r: '#3d6a5a', h: 46, rh: 12, hip: 1, st: 'stone' }) + rc(37.6, 26, 4.8, 8, '#e0d4b0') + pl([[36.5, 26], [40, 19], [43.5, 26]], '#e0b048') + flag(40, 19, 8, '#e0b048') + ci(40, 54, 5, '#f2ead8') + ln([40, 54], [40, 50.5], '#333', .9) + ln([40, 54], [43, 54], '#333', .9),
    hall5: () => base('#c4b898', 1) + hut({ id: 'hall5', w: '#f2ead2', r: '#b8892a', h: 44, rh: 18, st: 'stone', door: 1, rows: 3, glow: 1, shut: '#8a2a2a', arch: 1, cols: [.52, .66, .8, .94], wide: 1 }) + hut({ id: 'h5a', s: .36, ox: -27, oy: 8, w: '#f2ead2', r: '#b8892a', h: 50, rh: 13, hip: 1, st: 'stone' }) + hut({ id: 'h5b', s: .36, ox: 27, oy: 8, w: '#f2ead2', r: '#b8892a', h: 50, rh: 13, hip: 1, st: 'stone' }) + dome(40, 30, 7, '#d8a838', 0) + flag(40, 21, 8, '#8a2a2a') + flag(14, 36, 8, '#e0b048', 1) + flag(66, 36, 8, '#e0b048', 1) + el(40, 94, 6, 2.6, '#9ac4d8') + ci(40, 91, 1.2, '#e8f4fa') + ci(40, 89, .8, '#e8f4fa') + ci(40, 54, 5, '#f2ead2', 'stroke="#b8892a" stroke-width=".8"'),
    wall: () => hut({ id: 'wall', s: .9, h: 14, flat: 1, mer: 1, w: '#b5b0a0', st: 'stone', nowin: 1 }),
    road: () => { let r = pl(dia(40, 84, 30, 15), SNOW ? '#c8cdcb' : '#a89878', 'stroke="#7d6f55" stroke-width=".6"'); for (let i = 0; i < 16; i++) { const a = i * 2.4, q = (i % 5 + 1) / 6; r += `<ellipse cx="${(40 + Math.cos(a) * q * 24).toFixed(1)}" cy="${(84 + Math.sin(a) * q * 11).toFixed(1)}" rx="4.5" ry="2.4" fill="${SNOW ? (i % 2 ? '#e6eaec' : '#d2d8da') : (i % 2 ? '#c4b693' : '#b3a487')}" stroke="#8d7f63" stroke-width=".4"/>`; } return r; },
    camp: () => base('#6f5a3a', .6) + tent(26, 90, '#a8452f') + tent(54, 88, '#7a6a4a') + ci(40, 93, 2.2, '#ff8a2a') + ln([36, 95], [44, 94], '#4a3320', 1.5) + ln([40, 70], [40, 40], '#4a3320', 1.2) + pl([[40, 40], [53, 44], [40, 50]], '#8a1c1c'),

    // ----- neu in Version 2 -----
    mine: () => base('#8a8070', .75) + pl([[8, 86], [18, 54], [40, 40], [62, 52], [74, 84], [58, 96], [24, 96]], '#8a8478') + pl([[18, 54], [40, 40], [44, 62], [26, 72]], '#a8a296') + pl([[40, 40], [62, 52], [60, 70], [44, 62]], '#9a9488') + pl([[62, 52], [74, 84], [58, 96], [60, 70]], '#6f6a60') + (SNOW ? pl([[18, 54], [40, 40], [62, 52], [50, 56], [40, 50], [28, 58]], SN) : '') +
      `<path d="M31 90 L31 76 Q40 66 49 76 L49 90Z" fill="#1c1812"/>` + ln([29, 90], [29, 74], '#6b4a2a', 2.4) + ln([51, 90], [51, 74], '#6b4a2a', 2.4) + ln([27, 75], [53, 75], '#6b4a2a', 2.6) + ln([40, 90], [64, 100], '#555', .9) + ln([36, 90], [60, 101], '#555', .9) + pl([[56, 91], [66, 95], [64, 99], [54, 95]], '#6a5a4a') + ci(60, 92, 2, '#c8782a') + ci(63, 93.5, 1.6, '#d98a3a') + ci(24, 78, 1.5, '#f3c969') + ln([24, 76], [24, 72], '#4a3320', .8),
    smelter: () => base('#6f6a60', .55) + hut({ id: 'smelter', w: '#8a8680', r: '#4a3f3a', h: 24, rh: 12, st: 'stone', door: 1, wide: 1, doorc: '#3a1a10', nowin: 1 }) + `<rect x="50" y="30" width="9" height="44" fill="#7a7068"/><rect x="48.5" y="27" width="12" height="5" fill="${SNOW ? SN : '#5a4f48'}"/>` + ci(33, 78, 3.2, '#ff7a20') + ci(33, 78, 5.2, 'rgba(255,140,40,.35)') + pl([[8, 92], [16, 89], [20, 92], [12, 96]], '#6a6a72') + pl([[10, 90], [18, 87], [19, 89], [11, 92]], '#8a8a96') + ln([22, 94], [30, 91], '#9a9aa6', 2) + (SM.smelter = [54.5 - 40, 27 - 84], ''),
    sheep: () => base('#8aa860', .7) + hut({ id: 'sheep', ox: 10, oy: -8, s: .62, w: '#b59a6e', r: '#6b4a2a', h: 14, rh: 10, st: 'timber', door: 1, wide: 1 }) + fence([8, 86], [30, 98], 4) + fence([30, 98], [56, 98], 4) + sheep(20, 92, .9) + sheep(34, 95, .9) + sheep(46, 93, .8) + rc(60, 92, 7, 5, '#d9bd5a') + ln([60, 94.5], [67, 94.5], '#a88a2a', .6),
    weaver: () => base() + hut({ id: 'weaver', w: '#d8c9a8', r: '#7a4a6a', h: 22, rh: 14, st: 'timber', door: 1, chim: .6, glow: 1, shut: '#7a4a6a', fb: 1 }) + ln([8, 92], [8, 66], '#5a4028', 1.4) + ln([22, 99], [22, 73], '#5a4028', 1.4) + ln([8, 68], [22, 75], '#5a4028', 1) + pl([[9, 69], [13, 71], [13, 82], [9, 80]], '#a8452f') + pl([[14, 71], [18, 73], [18, 84], [14, 82]], '#3d6a9a') + pl([[19, 74], [21, 75], [21, 85], [19, 84]], '#e8c34a') + rc(58, 84, 9, 7, '#8a6a3a') + ln([58, 86], [67, 86], '#d8c9a8', .6) + ln([58, 88], [67, 88], '#d8c9a8', .6) + ci(63, 82, 2.2, '#f2ead8'),
    brewery: () => base() + hut({ id: 'brewery', w: '#cdb88f', r: '#7a5a2c', h: 24, rh: 14, st: 'timber', door: 1, chim: .45, glow: 1, shut: '#7a5a2c' }) + `<rect x="56" y="62" width="9" height="26" rx="2" fill="#b8793a"/><path d="M56 62 A4.5 3 0 0 1 65 62Z" fill="#d89a52"/><rect x="56" y="70" width="9" height="1.2" fill="#6a4a22"/><rect x="56" y="80" width="9" height="1.2" fill="#6a4a22"/>` + barrel(14, 92) + barrel(21, 95) + barrel(17, 88, '#9a6a3a') + (SM.brewery2 = [60.5 - 40, 60 - 84], ''),
    orchard: () => { let r = pl(dia(40, 84, 30, 15), SNOW ? '#e6ecee' : '#8aa84a', 'stroke="#5a7a2a" stroke-width=".6"'); for (let k = 1; k < 6; k++) r += ln(lp([10, 84], [40, 69], k / 6), lp([40, 99], [70, 84], k / 6), SNOW ? '#d2dadc' : '#7a9a3e', 1, .8); return r + smallTree(26, 84, '#5a9a46') + smallTree(54, 84, '#4a8a3c') + smallTree(40, 76, '#6aaa52') + smallTree(40, 94, '#5a9a46') + (SNOW ? '' : ci(30, 98, 1.5, '#d9533a') + ci(33, 99, 1.5, '#d9533a') + rc(56, 92, 6, 5, '#b08a52')); },
    pasture: () => { let r = pl(dia(40, 84, 30, 15), SNOW ? '#e6ecee' : '#7aa850', 'stroke="#4a7a2a" stroke-width=".6"'); r += fence([10, 84], [40, 99], 5) + fence([40, 99], [70, 84], 5) + fence([10, 84], [40, 69], 5); return r + hut({ id: 'pasture', ox: 14, oy: -14, s: .5, w: '#b59a6e', r: '#7a5a35', h: 12, rh: 9, st: 'timber', door: 1, wide: 1 }) + cow(26, 88, .95) + cow(40, 94, .9) + sheep(50, 90, .8); },
    school: () => base() + hut({ id: 'school', w: '#e3d6b4', r: '#3d6a9a', h: 24, rh: 14, st: 'timber', door: 1, rows: 1, glow: 1, shut: '#3d6a9a', fb: 1, dorm: [.5] }) + rc(37, 18, 6, 10, '#e0d4b0') + pl([[35, 18], [40, 10], [45, 18]], '#3d6a9a') + ci(40, 22, 2, '#e0b048') + ln([40, 10], [40, 5], '#4a3320', .9) + ci(14, 91, 1.6, '#f2ead8') + rc(11, 92, 6, 3, '#6b4a2a'),
    library: () => base('#b8a98c', .9) + hut({ id: 'library', w: '#dcd0b4', r: '#4a5a8a', h: 32, rh: 14, st: 'stone', door: 1, rows: 2, glow: 1, shut: '#4a5a8a', arch: 1, cols: [.55, .72, .88] }) + pl([[22, 80], [58, 80], [40, 72]], 'rgba(0,0,0,0)') + rc(58, 90, 7, 5, '#8a4a30') + rc(58, 87, 7, 3, '#4a6a8a') + rc(59, 84.5, 5, 2.5, '#c8a050'),
    scholar: () => base('#6f6a60', .4) + hut({ id: 'scholar', s: .55, h: 56, rh: 8, hip: 1, w: '#c9c3b4', r: '#3d4a7a', st: 'stone', door: 1, arch: 1, shut: '#3d4a7a', glow: 1 }) + dome(40, 20, 8, '#4a5a9a', 0) + ln([40, 14], [54, 4], '#6a6a74', 2.2) + ci(55, 3.4, 1.8, '#b8c0d0') + ci(26, 12, .9, '#fff') + ci(20, 22, .7, '#fff') + ci(60, 20, .8, '#fff') + rc(11, 90, 6, 4, '#5a4a3a') + ci(14, 88, 1.4, '#e0b048'),
    chapel: () => base('#b8a98c', .85) + hut({ id: 'chapel', ox: 6, w: '#e6dfcf', r: '#6b4a3a', h: 22, rh: 15, st: 'stone', door: 1, arch: 1, nowin: 1 }) + rc(14, 52, 11, 34, '#e0d8c4') + pl([[14, 86], [25, 86], [25, 50], [14, 50]], 'rgba(0,0,0,.08)') + pl([[12, 52], [19.5, 36], [27, 52]], '#6b4a3a') + (SNOW ? pl([[19.5, 36], [24, 46], [15, 46]], SN) : '') + ln([19.5, 36], [19.5, 29], '#e0b048', 1.2) + ln([17, 32], [22, 32], '#e0b048', 1.2) + `<path d="M17 60 q2.5 -5 5 0 v5 h-5z" fill="#3d6a9a"/>` + ci(54, 68, 3, '#c8402a', 'opacity=".85"') + ci(54, 68, 1.2, '#f3c969'),
    bath: () => base('#9aa0a0', .75) + hut({ id: 'bath', w: '#dcd3c0', r: '#4a7a8a', h: 22, rh: 12, st: 'stone', door: 1, arch: 1, glass: '#5a8aa8', nowin: 0 }) + `<ellipse cx="60" cy="90" rx="8" ry="3.6" fill="#b8b0a0"/><ellipse cx="60" cy="89.6" rx="6.4" ry="2.8" fill="#6aa8c8"/>` + ci(12, 66, 2.4, 'rgba(235,240,244,.55)') + ci(16, 61, 3, 'rgba(235,240,244,.4)') + (SM.bath = [30 - 40, 58 - 84], ''),
    theater: () => base('#b8a98c', .9) + hut({ id: 'theater', w: '#e0d2b2', r: '#8a3b4a', h: 30, rh: 14, st: 'stone', door: 1, wide: 1, doorc: '#7a1c2a', rows: 1, glow: 1, shut: '#8a3b4a', arch: 1, cols: [.52, .68, .84] }) + `<g transform="translate(40 36)"><circle r="5.5" fill="#e0b048"/><path d="M-3 -1 q3 -3 6 0 q-1 5 -3 5 q-2 0 -3 -5z" fill="#fff" opacity=".9"/></g>` + flag(14, 60, 14, '#8a3b4a') + flag(66, 66, 14, '#8a3b4a', 1),
    cathedral: () => base('#b8a98c', 1) + hut({ id: 'cathedral', s: 1.05, ox: 2, oy: 2, w: '#d9d3c4', r: '#4a5a7a', h: 40, rh: 22, st: 'stone', door: 1, arch: 1, wide: 1, rows: 2, glow: 1 }) + hut({ id: 'ct1', s: .3, ox: -26, oy: 10, w: '#d9d3c4', r: '#4a5a7a', h: 56, rh: 12, hip: 1, st: 'stone', nowin: 1 }) + hut({ id: 'ct2', s: .3, ox: 28, oy: 10, w: '#d9d3c4', r: '#4a5a7a', h: 56, rh: 12, hip: 1, st: 'stone', nowin: 1 }) + `<circle cx="30" cy="62" r="5" fill="#3d5a9a" stroke="#e0d8c4" stroke-width="1"/><circle cx="30" cy="62" r="2" fill="#c8402a"/><path d="M22 62 h16 M30 54 v16 M24 56 l12 12 M36 56 l-12 12" stroke="#e0d8c4" stroke-width=".6"/>` + ln([40, 16], [40, 6], '#e0b048', 1.4) + ln([37, 10], [43, 10], '#e0b048', 1.4),
    univ: () => base('#b8a98c', 1) + hut({ id: 'univ', s: 1.0, w: '#e3dcc8', r: '#3d4a7a', h: 36, rh: 12, st: 'stone', door: 1, arch: 1, wide: 1, rows: 2, glow: 1, cols: [.5, .66, .82], flat: 0 }) + dome(40, 40, 11, '#4a5a9a') + ci(40, 54, 4, '#f2ead8', 'stroke="#3d4a7a" stroke-width=".8"') + ln([40, 54], [40, 51], '#333', .8) + ln([40, 54], [42.4, 54], '#333', .8) + flag(40, 20, 6, '#e0b048') + rc(12, 89, 7, 5, '#8a4a30') + rc(13, 86, 5, 3, '#4a6a8a'),
    firehouse: () => base() + hut({ id: 'firehouse', w: '#b8a98c', r: '#a8302a', h: 22, rh: 14, st: 'timber', door: 1, wide: 1, doorc: '#a8302a', shut: '#a8302a' }) + rc(52, 66, 7, 14, '#c8b898') + pl([[50, 66], [55.5, 58], [61, 66]], '#a8302a') + ci(55.5, 70, 2, '#e0b048') + barrel(14, 92, '#6a8aa8') + barrel(21, 95, '#6a8aa8') + ln([62, 88], [70, 94], '#b8392a', 2),
    barracks: () => base('#9a9684', .9) + hut({ id: 'barracks', s: 1, w: '#a39f92', r: '#4a4a6a', h: 24, rh: 14, st: 'stone', door: 1, wide: 1, shut: '#4a4a6a', arch: 1 }) + flag(14, 70, 18, '#3d5a9a') + flag(66, 76, 18, '#3d5a9a', 1) + ln([58, 94], [64, 78], '#6b4a2a', 1.4) + ci(64, 77, 3.2, '#b8a070', 'stroke="#6b4a2a" stroke-width=".8"') + rc(59, 87, 7, 2, '#8a8a96') + ln([12, 86], [18, 96], '#9a9aa6', 1.4) + ln([16, 86], [22, 96], '#9a9aa6', 1.4),
    castle: () => base('#8a8678', 1) + hut({ id: 'castle', s: 1.0, w: '#aaa699', r: '#5a3b3a', h: 34, flat: 1, mer: 1, st: 'stone', door: 1, wide: 1, doorc: '#3a2a1a', rows: 1, arch: 1 }) + hut({ id: 'ca', s: .34, ox: -26, oy: 8, w: '#aaa699', r: '#5a3b3a', h: 56, rh: 13, hip: 1, st: 'stone', nowin: 1 }) + hut({ id: 'cb', s: .34, ox: 26, oy: 8, w: '#aaa699', r: '#5a3b3a', h: 56, rh: 13, hip: 1, st: 'stone', nowin: 1 }) + hut({ id: 'cc', s: .42, ox: 0, oy: -12, w: '#b6b2a4', r: '#5a3b3a', h: 50, rh: 12, hip: 1, st: 'stone', door: 0, shut: '#3a3a44' }) + ln([40, 24], [40, 10], '#4a3320', 1.3) + pl([[40, 10], [54, 14], [40, 20]], '#8a1c1c') + ln([14, 30], [14, 20], '#4a3320', 1) + pl([[14, 20], [22, 23], [14, 27]], '#8a1c1c'),
    kontor: () => base() + hut({ id: 'kontor', w: '#d6c49a', r: '#2f5a4a', h: 26, rh: 15, st: 'timber', door: 1, chim: .35, rows: 2, glow: 1, shut: '#2f5a4a', fb: 1 }) + ln([62, 90], [62, 70], '#4a3320', 1.2) + ln([62, 72], [72, 72], '#4a3320', 1) + rc(66, 72, 8, 6, '#e8c34a', 'stroke="#8a6a1a" stroke-width=".6"') + ci(70, 75, 2, '#b8892a') + crate(14, 92) + crate(21, 95) + barrel(16, 86),
    harbor: () => `<ellipse cx="40" cy="86" rx="29" ry="11" fill="rgba(255,255,255,.28)"/>` + [[14, 80], [34, 90], [56, 82], [66, 76]].map(([x, y]) => ln([x, y], [x, y + 11], '#4a3320', 2.6)).join('') + pl([[10, 82], [40, 70], [70, 82], [40, 96]], '#8a6a3a', 'stroke="#4a3320" stroke-width=".7"') + ln([16, 84], [40, 73], '#a88a52', .6) + ln([22, 87], [40, 78], '#a88a52', .6) + hut({ id: 'harbor', ox: -8, oy: -10, s: .5, w: '#a98a5a', r: '#3d5a6a', h: 14, rh: 9, st: 'timber', door: 1, wide: 1 }) + ln([56, 84], [56, 54], '#5a4028', 2.4) + ln([56, 56], [70, 62], '#5a4028', 2) + ln([70, 62], [70, 72], '#333', .8) + crate(58, 88) + barrel(24, 90) +
      `<path d="M52 98 Q64 104 78 96 L74 92 Q62 98 52 94Z" fill="#7a5a35" stroke="#4a3320" stroke-width=".6"/>` + ln([66, 94], [66, 70], '#5a4028', 1.2) + pl([[66, 72], [76, 90], [66, 90]], '#f2ead8', 'stroke="#c8b898" stroke-width=".5"'),
    mint: () => base('#8a8678', .8) + hut({ id: 'mint', w: '#c9c3b4', r: '#6a5a2a', h: 26, rh: 13, st: 'stone', door: 1, doorc: '#3a2a1a', chim: .35, glass: '#1c1c22', shut: '#6a5a2a', arch: 1 }) + ci(40, 40, 5.4, '#e0b048', 'stroke="#8a6a1a" stroke-width=".9"') + ci(40, 40, 3.4, '#f3d070') + ln([40, 37], [40, 43], '#8a6a1a', .9) + ci(62, 90, 2.4, '#e0b048', 'stroke="#8a6a1a" stroke-width=".5"') + ci(66, 91.5, 2.4, '#e0b048', 'stroke="#8a6a1a" stroke-width=".5"') + ci(64, 88.4, 2.4, '#f3d070', 'stroke="#8a6a1a" stroke-width=".5"') + crate(14, 92, '#8a8a96'),
  };

  // ---------- Natur ----------
  const trunk = (c = '#5a3d22') => el(22, 51, 9, 3, 'rgba(0,0,0,.2)') + rc(18, 38, 4, 13, c);
  const conifer = se => { const g = se === 0 ? ['#35704a', '#448556', '#56985f'] : ['#2a5e34', '#3a7b44', '#4a8c52']; return trunk() + pl([[20, 22], [36, 46], [4, 46]], g[0]) + pl([[20, 12], [33, 34], [7, 34]], g[1]) + pl([[20, 2], [30, 22], [10, 22]], g[2]) + pl([[20, 12], [33, 34], [20, 34]], 'rgba(0,0,0,.18)') + (se === 3 ? pl([[20, 2], [26, 14], [14, 14]], SN) + pl([[20, 12], [29, 26], [11, 26]], 'rgba(244,248,251,.92)') + pl([[20, 22], [32, 40], [8, 40]], 'rgba(244,248,251,.8)') : ''); };
  const leafy = se => {
    if (se === 3) return trunk() + ln([20, 40], [11, 24], '#5a3d22', 2) + ln([20, 40], [29, 22], '#5a3d22', 2) + ln([20, 36], [20, 16], '#5a3d22', 2.2) + ln([11, 24], [6, 18], '#5a3d22', 1.2) + ln([29, 22], [34, 15], '#5a3d22', 1.2) + ln([20, 24], [14, 12], '#5a3d22', 1.2) + ci(12, 23, 4.5, SN) + ci(28, 21, 5, SN) + ci(20, 16, 5.4, SN) + ci(20, 27, 3.4, '#e4ecef');
    const c = se === 0 ? ['#6aa04a', '#5a9a46', '#7ab05a', '#8ac060', '#98d070'] : se === 2 ? ['#b4552a', '#c8742a', '#d9902f', '#e0b040', '#e8c850'] : ['#3f7a35', '#356b2e', '#4a8a3c', '#5a9a46', '#6aaa52'];
    let r = trunk() + ci(20, 24, 14, c[0]) + ci(12, 28, 9, c[1]) + ci(29, 27, 9, c[2]) + ci(18, 18, 8, c[3]) + ci(24, 14, 5, c[4]);
    if (se === 0) r += ci(13, 20, 1.6, '#f6c6d4') + ci(26, 18, 1.6, '#f6c6d4') + ci(20, 27, 1.6, '#fff') + ci(30, 28, 1.4, '#f6c6d4') + ci(10, 29, 1.4, '#fff');
    return r;
  };
  const birch = se => {
    const trk = el(22, 51, 8, 3, 'rgba(0,0,0,.2)') + rc(18.5, 26, 3, 25, '#e8e4d8') + rc(18.5, 32, 3, 1.5, '#444') + rc(18.5, 40, 3, 1.5, '#444');
    if (se === 3) return trk + ln([20, 30], [11, 18], '#e0dccf', 1.3) + ln([20, 28], [29, 16], '#e0dccf', 1.3) + ln([20, 26], [20, 10], '#e0dccf', 1.4) + ci(12, 18, 3.6, SN) + ci(29, 16, 3.8, SN) + ci(20, 11, 4, SN);
    const c = se === 0 ? ['#a3d070', '#92c460', '#b2dc80'] : se === 2 ? ['#d9b030', '#c89a28', '#e8c850'] : ['#8fb84a', '#7aa840', '#a3c95a'];
    return trk + ci(20, 18, 11, c[0]) + ci(14, 23, 7, c[1]) + ci(27, 22, 7, c[2]);
  };
  const rockSvg = () => pl([[10, 44], [22, 20], [40, 10], [58, 18], [72, 40], [60, 52], [28, 52]], '#9d9686') + pl([[22, 20], [40, 10], [44, 28], [28, 36]], '#b9b2a1') + pl([[40, 10], [58, 18], [56, 34], [44, 28]], '#a8a191') + pl([[58, 18], [72, 40], [60, 52], [56, 34]], '#807a6c') + pl([[28, 36], [44, 28], [56, 34], [60, 52], [28, 52]], '#8f897a') + (SNOW ? pl([[22, 20], [40, 10], [58, 18], [50, 24], [44, 20], [34, 26], [26, 28]], SN) : ci(30, 18, 3, '#5f8a3f') + ci(36, 13, 2.5, '#6a9a45'));

  // ---------- Menschen und Tiere ----------
  const person = (o) => {
    const sk = o.skin || '#e8c9a0'; let r = '';
    const k = o.kid ? .78 : 1, oy = o.kid ? 4 : 0;
    r += `<g transform="translate(${5 * (1 - k)} ${oy}) scale(${k})">`;
    r += rc(3.4, 14, 1.6, 5.4, o.pants || '#4a3a2a') + rc(5.1, 14, 1.6, 5.4, o.pants || '#4a3a2a');
    r += o.dress ? pl([[2.4, 7], [7.6, 7], [8.4, 16], [1.6, 16]], o.shirt) : pl([[2.4, 7], [7.6, 7], [7.2, 15], [2.8, 15]], o.shirt);
    if (o.apron) r += pl([[3.2, 9], [6.8, 9], [7, 15], [3, 15]], '#f2ead8');
    r += rc(1.6, 7.4, 1.2, 5, o.sleeve || o.shirt) + rc(7.2, 7.4, 1.2, 5, o.sleeve || o.shirt) + ci(2.2, 12.8, .8, sk) + ci(7.8, 12.8, .8, sk) + ln([2.8, 11.6], [7.2, 11.6], 'rgba(0,0,0,.25)', .5);
    r += ci(5, 4.6, 2.4, sk);
    if (o.hair) r += `<path d="M2.6 4.4 A2.4 2.4 0 0 1 7.4 4.4 L7 3.6 Q5 2 3 3.6Z" fill="${o.hair}"/>` + (o.long ? rc(2.4, 3.6, 1, 4.4, o.hair) + rc(6.6, 3.6, 1, 4.4, o.hair) : '');
    if (o.hat) r += `<path d="M2.2 4 A2.8 2.4 0 0 1 7.8 4Z" fill="${o.hat}"/>` + rc(1.8, 3.8, 6.4, .9, sh(o.hat, .8));
    if (o.beard) r += `<path d="M3.6 5.4 Q5 8.2 6.4 5.4Z" fill="${o.beard}"/>`;
    if (o.cane) r += ln([8.8, 11], [9.2, 19.4], '#6b4a2a', .8);
    if (o.tool) r += ln([8.6, 10], [9.6, 19], '#6b4a2a', .8) + pl([[8, 9.6], [10.6, 9.4], [10.2, 11]], '#9a9a9a');
    return r + '</g>';
  };
  const PPL = [
    { shirt: '#a8452f', hat: '#d9bd5a', pants: '#4a3a2a' }, { shirt: '#3d6a9a', hair: '#5a3d22', pants: '#3a3a4a' }, { shirt: '#c8a8a8', dress: 1, hair: '#8a5a2a', long: 1, sleeve: '#e8d8c8' },
    { shirt: '#6a8a3a', apron: 1, hat: '#8a6a3a', pants: '#5a4a3a', tool: 1 }, { shirt: '#8a6a9a', dress: 1, hair: '#2a1a10', long: 1 }, { shirt: '#6a6a6a', hair: '#e8e8e8', beard: '#e8e8e8', cane: 1, pants: '#3a3a3a' },
    { shirt: '#d9a02a', kid: 1, hair: '#8a5a2a' }, { shirt: '#a8452f', kid: 1, hair: '#2a1a10', pants: '#5a4a3a' },
  ];

  // ---------- Aufbau ----------
  function genAll() {
    // Gebaeude (Sommerfassung)
    SNOW = false;
    for (const k in H) mk(k, H[k](), 80, 110);
    // Winterfassung (Schnee auf Daechern, weisse Wege)
    SNOW = true;
    for (const k in H) if (k !== 'fish' && k !== 'harbor') mk(k + 'w', H[k](), 80, 110);
    mk('fishw', H.fish(), 80, 110); mk('harborw', H.harbor(), 80, 110);
    // Baeume je Jahreszeit
    const T = [conifer, leafy, birch];
    for (let i = 0; i < 3; i++) for (let se = 0; se < 4; se++) { SNOW = se === 3; mk('tree' + i + ['s', '', 'a', 'w'][se], T[i](se), 40, 56); }
    SNOW = true; mk('rockw', rockSvg(), 80, 60); SNOW = false; mk('rock', rockSvg(), 80, 60);
    const T3 = HI ? 4.5 : 3;
    mk('tuft', ln([4, 9], [2, 3], '#4f7a35', 1) + ln([7, 9], [8, 2], '#5f8a40', 1) + ln([10, 9], [13, 4], '#4f7a35', 1), 16, 10, T3);
    mk('flower', ln([5, 9], [5, 4], '#4f7a35', .8) + ci(5, 3.5, 1.8, '#f4e04a') + ln([11, 9], [11, 5], '#4f7a35', .8) + ci(11, 4.5, 1.8, '#f2f2f2'), 16, 10, T3);
    PPL.forEach((p, i) => mk('v' + i, person(p), 10, 20, T3));
    mk('sheepsp', sheep(7, 5, 1), 14, 10, T3); mk('cowsp', cow(9, 6, 1), 18, 12, T3); mk('hensp', hen(4, 4), 8, 7, T3);
    const rd = rc(3.5, 17, 2, 7, '#2a2a2a') + rc(6.5, 17, 2, 7, '#2a2a2a') + pl([[2.5, 9], [9.5, 9], [9, 18], [3, 18]], '#8a1c1c') + ci(6, 6, 2.8, '#e0b890') + `<path d="M3 5.5 A3 3 0 0 1 9 5.5Z" fill="#777"/>` + ln([10, 7], [11, 19], '#ddd', 1) + ln([3, 12], [1, 16], '#6a1010', 1.2);
    mk('raider', rd, 12, 24, T3); mk('ally', rd.replace(/#8a1c1c/g, '#2a5aa8').replace(/#6a1010/g, '#1c3f7a'), 12, 24, T3);
  }
  buildSprites = function (q) {
    q = q === 'hi' ? 'hi' : 'std';
    if (buildSprites.built === q) return;
    buildSprites.built = q; HI = q === 'hi'; SC = HI ? 3 : 2; genAll();
  };
  buildSprites.H = H; buildSprites.person = person; buildSprites.PPL = PPL;
  let q0 = 'std'; try { q0 = localStorage.getItem('meridian-gfx') === 'hi' ? 'hi' : 'std'; } catch (e) { }
  buildSprites(q0);
})();
