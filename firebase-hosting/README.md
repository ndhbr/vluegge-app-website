# Firebase Hosting für die mobilen App-Links

Eigenständiges statisches Hosting für `https://vluegge.web.app`. Die Astro-Website
und ihr GitHub-Pages-Deployment bleiben unabhängig davon. Kein Build erforderlich.

## Öffentliche URLs

- `https://vluegge.web.app/auth/password-recovery`
- `https://vluegge.web.app/identity/return`
- `https://vluegge.web.app/.well-known/assetlinks.json`
- `https://vluegge.web.app/.well-known/apple-app-site-association`

Die Callback-Routen verwenden interne Rewrites auf die HTML-Dateien. Es gibt keine
HTTP-Weiterleitung; Query-Parameter und URL-Fragmente bleiben in der Browser-URL.
Die Seiten lesen oder zeigen diese Daten nicht an und laden weder JavaScript noch
Analytics, externe Schriften oder andere externe Ressourcen.

Beide Association-Dateien werden mit `Content-Type: application/json` ausgeliefert.
`appAssociation: NONE` verhindert automatisch generierte Association-Dateien.
Die Ignore-Liste lässt `.well-known` ausdrücklich zu; nicht die übliche
Firebase-Ignore-Regel `**/.*` ergänzen.

## Lokal prüfen

Voraussetzungen: Node.js 22 oder neuer und eine funktionierende Firebase CLI
(`firebase-tools`; geprüft mit Version 15.30.1).
Bei einer defekten globalen Installation kann in den Befehlen `firebase` durch
`npx --yes firebase-tools@15.30.1` ersetzt werden.

Aus dem Repository-Stamm:

```sh
cd firebase-hosting
firebase emulators:exec --only hosting --project demo-vluegge "node check.mjs"
```

Der Test prüft HTTP 200 ohne Redirect, JSON-Inhalte, Content-Type, Schutz-Header,
unveränderte Antworten mit Test-Query-Parametern und HTTP 404 für unbekannte Pfade.
Er akzeptiert den gewünschten Android-Platzhalter und meldet ihn ausdrücklich.
Für eine manuelle Vorschau: `firebase emulators:start --only hosting --project demo-vluegge`.
Die Vorschau läuft unter `http://127.0.0.1:5055`.
Nur erfundene Testdaten verwenden: Der lokale Emulator protokolliert Anfragen.

## Veröffentlichen

Das Firebase-Projekt ist in `.firebaserc` auf `vluegge` voreingestellt;
die Hosting-Site-ID in `firebase.json` ist ebenfalls `vluegge`.
Die Befehle weiterhin aus dem Ordner `firebase-hosting` ausführen:

```sh
firebase login
firebase hosting:sites:list
firebase deploy --only hosting
node check.mjs https://vluegge.web.app
```

Das Deployment veröffentlicht den gesamten Inhalt dieser Hosting-Site. Vorher
prüfen, ob `vluegge` bereits andere benötigte Inhalte enthält. Es wurde durch das
Anlegen dieses Ordners noch nichts veröffentlicht.

## Mit der App abstimmen

- iOS Associated Domains: `applinks:vluegge.web.app`.
- Android: verifizierte HTTPS-App-Links für Host `vluegge.web.app` und genau die
  beiden Callback-Pfade im Manifest registrieren (`android:autoVerify="true"`).
- Passwort-Recovery-Ziel und gegebenenfalls erlaubte Redirect-URLs beim
  Auth-Anbieter auf `https://vluegge.web.app/auth/password-recovery` setzen.
- Stripe-Return-URL direkt auf `https://vluegge.web.app/identity/return` setzen.
  Den Verifizierungsstatus weiterhin im Backend über Stripe prüfen; die Rückkehr
  auf diese Seite bestätigt keine erfolgreiche Identitätsprüfung.
- Vor dem Android-Produktionstest den Platzhalter in
  `public/.well-known/assetlinks.json` durch den SHA-256-Fingerprint des
  Produktions-App-Signaturzertifikats ersetzen (bei Play App Signing aus der Play
  Console, nicht Upload- oder Debug-Key).
- Beide Abläufe auf echten Geräten mit und ohne installierte App testen.

## Callback-Daten und Logging

Die statischen Seiten enthalten keine Datenverarbeitung oder Protokollierung.
`no-store`, `no-referrer`, eine restriktive Content Security Policy und `noindex`
begrenzen Caching, Datenweitergabe und Indexierung.

Die Firebase-Hosting-Integration mit Cloud Logging vor Veröffentlichung prüfen und
für diese Site deaktiviert lassen: Webrequest-Logs enthalten vollständige URLs
einschließlich Query-Parametern. Bei einem geteilten Projekt bestehende Integrationen
nicht ungeprüft ändern. Anbieterinterne Protokollierung wird durch `firebase.json`
nicht gesteuert; die strikte Anforderung „keine Callback-Daten in Logs“ muss auch
auf Hosting-Ebene geklärt werden.

## Referenzen

- [Firebase Hosting: Konfiguration](https://firebase.google.com/docs/hosting/full-config)
- [Firebase Hosting: Webrequest-Logs](https://firebase.google.com/docs/hosting/web-request-logs-and-metrics)
