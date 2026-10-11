# Finanz · Percorso Assicurazioni (prototipo)

Il prototipo del percorso Academy sulle assicurazioni, per il Business Case Finanz.

Online, senza login: https://finanz-business-case-francesco.vercel.app

## Avvio

```bash
npm install
npm run dev                  # http://localhost:3000
```

## Com'è fatto

Il prototipo riproduce l'app Finanz: Home, Academy, mappa del percorso "Assicurati", 4 lezioni fatte di card (teoria, "Mettiti alla prova", vero o falso, sondaggi, un simulatore), quiz finale, fine percorso e schermata partner. Sul telefono funziona come un'app: il tasto o il gesto indietro torna alla card precedente, i bottom sheet si chiudono trascinandoli giù, la X chiede conferma prima di uscire.

| Schermata | Evento Mixpanel |
|---|---|
| Apertura della mappa del percorso | `Path Started` |
| Ultima card di ogni lezione, bottone "Continua" | `Lesson Completed` (`lesson_number`) |
| Ultima domanda del quiz finale | `Quiz Completed` (`quiz_score`: risposte giuste al primo tentativo) |
| Schermata "Percorso completato" | `Path Completed` |
| Schermata "Trova la tua polizza" | `Partner Screen Viewed` |
| Bottone "Confronta le polizze" | `Partner CTA Clicked` |
| Modulo inviato sul sito del partner | `Quote Requested` (nella realtà è un postback del partner) |

`Policy Activated` arriva dal partner giorni dopo, quindi qui non c'è.

Tre eventi nell'export non esistono e sono stati aggiunti per leggere il test. Nel pannello hanno l'etichetta "nuovo".

| Schermata | Evento nuovo |
|---|---|
| Uscita confermata da una lezione o dal quiz | `Lesson Exited` (`lesson_number`, `card_number`, `cards_total`) |
| Schermata partner, X o secondo bottone | `Partner Screen Exited` (`exit_type`: `close`, `home`, `reminder`, `continue`, `back_to_path`; `seconds_on_screen`, `scroll_depth_pct`) |
| Notifica push del promemoria, tocco (previsto, non nel prototipo) | `Partner Reminder Opened` |

`Partner Screen Viewed` porta in più `screen_version` (ramo e profilo, oppure `originale`) ed `entry_point` (`trofeo`, `lezione2`, `mappa`, `promemoria`). `Partner CTA Clicked` porta `screen_version`, `entry_point`, `seconds_on_screen` e `scroll_depth_pct`.

La schermata partner si apre in tre punti: dopo il trofeo, dopo la lezione 2 (`?da=lezione2`) e dalla mappa (`?da=mappa`, dalla pillola sotto il titolo del percorso, che non compare per chi ha risposto "No"). Il secondo bottone cambia di conseguenza. "Ricordamelo" conferma con un messaggio e basta: nell'app il promemoria arriverebbe una settimana dopo come notifica push, che il prototipo non manda.

Sugli schermi larghi, il pannello a destra mostra gli eventi mentre usi il percorso. Dalla striscia verde in cima alla Home (o dall'avatar) cambi utente di prova: scegli il ramo e la risposta alla domanda di onboarding "Hai attualmente delle assicurazioni?", quindici combinazioni in tutto, una per schermata partner. Lì trovi anche le scorciatoie per ricominciare o saltare al quiz e alla schermata partner. L'avanzamento resta salvato nel browser.

```
app/page.tsx                     Home
app/academy/page.tsx             Academy
app/percorso/page.tsx            mappa del percorso
app/percorso/lezione/            lezioni e quiz finale, card per card (?n=1..4 o n=quiz, &c=card)
app/percorso/completato/         fine percorso
app/percorso/partner/            schermata partner
app/comparatore/page.tsx         sito del partner (simulato)
components/Schede.tsx            le card delle lezioni
components/ui.tsx                chrome, bottoni, bottom sheet, barra in basso
lib/percorso.ts                  testi di lezioni e quiz
lib/navigazione.ts               cronologia card per card (tasto indietro)
lib/utenti.ts                    utenti di prova
lib/track.ts                     tracciamento eventi
```

Cambia quello che vuoi: è un punto di partenza, non un vincolo.

## Pubblicare

Il modo più rapido è Vercel: importa il tuo repo da https://vercel.com/new e pubblica. Il link che ti dà Vercel è quello da mandarci.
