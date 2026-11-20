# MERIDIAN – Eine Stadt entsteht (Kern-Version)
Lokal starten: `cd meridian && python3 -m http.server 8080` → http://localhost:8080 (Service Worker läuft auf localhost).
Veröffentlichen: Ordner per HTTPS hosten (GitHub Pages, Netlify, eigener Server). Pfade sind relativ.
iPhone: Seite in Safari öffnen → Teilen → „Zum Home-Bildschirm“.
Offline testen: einmal online laden, Flugmodus an, App vom Home-Bildschirm starten.
Eigene Sounds: Dateien in assets/audio/ (wind, bird, click, build, bell .wav) ersetzen; bei Änderungen `V` in service-worker.js hochzählen.
Assets neu erzeugen: `python3 tools/make_assets.py`
