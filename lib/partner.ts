// Testi della schermata partner nuova: una schermata per ramo e per risposta di onboarding.
// Il profilo decide la leva e il blocco centrale, il ramo riempie i nomi.
// Stessi testi del mock approvato (build_mock.py): cinque rami per tre profili.

import type { Intento, Ramo } from "@/lib/utenti";

export type Profilo = "pensando" | "ha" | "no";

export const PROFILO: Record<Intento, Profilo> = {
  "No, ma sto pensando di farne una": "pensando",
  "Sì, ne ho già una o più": "ha",
  No: "no",
};

type Colore = "rosa" | "azzurro";
type Numero = { colore: Colore; etichetta: string; numero: string; sotto: string };
type Verticale = { colore: Colore; etichetta: string; icona: string; chi: string };
type Colonna = { colore: Colore; intestazione: string; voci: { icona: string; nome: string }[] };

export type BloccoPartner =
  | { tipo: "passi" }
  | { tipo: "vero_falso"; frase: string[]; spiegazione: string[] }
  | { tipo: "tre_righe"; badge: string; righe: { icona: string; nome: string; testo: string }[] }
  | { tipo: "due_numeri"; badge: string; titolo: string; sx: Numero; dx: Numero; fonte?: string }
  | { tipo: "un_numero"; badge: string; titolo: string; numero: Numero; fonte?: string }
  | { tipo: "categorie"; badge: string; titolo: string; sx: Colonna; dx: Colonna }
  | { tipo: "verticali"; badge: string; titolo: string; sx: Verticale; dx: Verticale; sotto?: string }
  | { tipo: "cento"; badge: string; titolo: string; pieni: number; legendaPieni: string; legendaVuoti: string; fonte?: string }
  | { tipo: "fila_icone"; badge: string; titolo: string; icone: string[]; sotto: string[] }
  | { tipo: "giallo"; icona: string; forte: string; resto: string; diSeguito?: boolean }
  | { tipo: "fonte"; testo: string };

export type SchermataPartner = {
  titolo: string[]; // una voce per riga della hero
  bianca: string;
  blocchi: BloccoPartner[];
  nota: string; // riga piccola sopra il bottone
};

// Da dove si arriva alla schermata. Decide il secondo bottone.
export const INGRESSI = ["trofeo", "lezione2", "mappa", "promemoria"] as const;
export type Ingresso = (typeof INGRESSI)[number];

// Dopo la lezione 2 si prosegue con le lezioni, dalla mappa si torna al percorso.
// Chi ha risposto "No" e arriva dal trofeo torna alla Home. Negli altri casi si può chiedere
// un promemoria: generico, perché non sappiamo quale polizza ha l'utente né quando scade.
export function secondoBottone(ingresso: Ingresso, profilo: Profilo): "prosegui" | "percorso" | "home" | "promemoria" {
  if (ingresso === "lezione2") return "prosegui";
  if (ingresso === "mappa") return "percorso";
  if (ingresso === "trofeo" && profilo === "no") return "home";
  return "promemoria";
}

// L'invito a metà percorso: solo per chi ci sta pensando o ha già una polizza, sui rami con i testi nuovi.
export function invitoDopoLezione2(ramo: Ramo, profilo: Profilo) {
  return profilo !== "no" && !!SCHERMATE[ramo];
}

const SENZA: Verticale = { colore: "rosa", etichetta: "Senza polizza", icona: "🙋", chi: "Paghi tu" };
const CON: Verticale = { colore: "azzurro", etichetta: "Con la polizza", icona: "🏢", chi: "Paga la compagnia" };

export const SCHERMATE: Partial<Record<Ramo, Record<Profilo, SchermataPartner>>> = {
  rc_auto: {
    pensando: {
      titolo: ["Quanto costa la tua RC auto?"],
      bianca: "Ci stai pensando. Ecco cosa succede dopo.",
      blocchi: [{ tipo: "passi" }],
      nota: "Bastano pochi dati per ricevere i preventivi.",
    },
    ha: {
      titolo: ["RC auto: quanto ti costa oggi?"],
      bianca: "Confronta i preventivi con quanto paghi ora.",
      blocchi: [
        {
          tipo: "vero_falso",
          frase: ["Due compagnie ti chiedono lo stesso prezzo per la stessa auto."],
          spiegazione: ["Il prezzo ha due ingredienti: il rischio e i costi di gestione. Ogni compagnia ha i suoi."],
        },
        { tipo: "giallo", icona: "🗓️", forte: "Prima di rinnovare, confronta.", resto: "A ogni scadenza puoi cambiare compagnia." },
      ],
      nota: "Tieni la polizza sotto mano: i dati sono lì.",
    },
    no: {
      titolo: ["RC auto: quanto ti costerebbe?"],
      bianca: "Dipende da te, non solo dall'auto.",
      blocchi: [
        {
          tipo: "tre_righe",
          badge: "🔍 Da cosa dipende",
          righe: [
            { icona: "🧑", nome: "Chi guida", testo: "Età, patente e incidenti passati." },
            { icona: "📍", nome: "Dove vivi", testo: "Cambia da zona a zona." },
            { icona: "🚗", nome: "Che auto hai", testo: "Conta anche la potenza." },
          ],
        },
        { tipo: "giallo", icona: "📋", forte: "Se guidi, la polizza è obbligatoria.", resto: "Il prezzo no: lo scopri solo con un preventivo." },
      ],
      nota: "Ricevi solo i preventivi, senza acquistare niente.",
    },
  },
  salute: {
    pensando: {
      titolo: ["La salute", "non aspetta"],
      bianca: "Le liste d'attesa, invece, sì.",
      blocchi: [
        {
          tipo: "due_numeri",
          badge: "⏳ I tempi di attesa",
          titolo: "Per una visita o un esame, in media:",
          sx: { colore: "rosa", etichetta: "Nel pubblico", numero: "60 giorni", sotto: "con il ticket" },
          dx: { colore: "azzurro", etichetta: "Nel privato", numero: "7 giorni", sotto: "a pagamento" },
          fonte: "Media di 11 visite ed esami. C.R.E.A. Sanità 2018, 4 regioni.",
        },
        { tipo: "giallo", icona: "🩺", forte: "Nel privato paga la compagnia.", resto: "Con una polizza salute, nei limiti del contratto." },
      ],
      nota: "Ci stai pensando? Bastano pochi dati per i preventivi.",
    },
    ha: {
      titolo: ["Una polizza non", "copre tutto"],
      bianca: "Ogni polizza lascia una parte a te.",
      blocchi: [
        {
          tipo: "categorie",
          badge: "🔍 Cosa resta a te",
          titolo: "Cosa copre una polizza salute?",
          sx: { colore: "azzurro", intestazione: "Di solito sì", voci: [{ icona: "🏥", nome: "Ricoveri" }, { icona: "🩹", nome: "Interventi" }] },
          dx: { colore: "rosa", intestazione: "Non è detto", voci: [{ icona: "🦷", nome: "Dentista" }, { icona: "💊", nome: "Farmaci" }] },
        },
        { tipo: "giallo", icona: "📄", forte: "Cambia da polizza a polizza.", resto: "Lo vedi solo confrontandole." },
      ],
      nota: "Hai già una polizza salute? Confrontala.",
    },
    no: {
      titolo: ["Curarsi", "è gratis?"],
      bianca: "Una famiglia spende in media 1.362€ l'anno per la salute.",
      blocchi: [
        {
          tipo: "verticali",
          badge: "🚲 Ricordi la bici rubata?",
          titolo: "Una polizza non ferma il ladro. E nemmeno un problema di salute.",
          sx: SENZA,
          dx: CON,
          sotto: "Cambia chi paga il conto.\nNei limiti del contratto.",
        },
        { tipo: "fonte", testo: "Spesa media per la salute a famiglia. ISTAT 2022, analisi GIMBE." },
      ],
      nota: "Non ne hai una? Scopri quanto costerebbe.",
    },
  },
  casa: {
    pensando: {
      titolo: ["E se il danno", "lo fai tu?"],
      bianca: "Non si ferma al tuo pavimento.",
      blocchi: [
        { tipo: "verticali", badge: "💧 Un tubo che si rompe", titolo: "L'acqua scende di sotto. Chi paga?", sx: SENZA, dx: CON },
        { tipo: "giallo", icona: "🏠", forte: "Non protegge solo i tuoi muri.", resto: "Può coprire anche i danni agli altri." },
      ],
      nota: "Ci stai pensando? Bastano pochi dati per i preventivi.",
    },
    ha: {
      titolo: ["Il clima cambia.", "E casa tua?"],
      bianca: "Nel 2025, 376 eventi meteo estremi in Italia.",
      blocchi: [
        {
          tipo: "cento",
          badge: "🌧️ Calamità naturali",
          titolo: "Su 100 case, solo 7 sono coperte.",
          pieni: 7,
          legendaPieni: "7 coperte",
          legendaVuoti: "93 scoperte",
          fonte: "Eventi: Legambiente, 2025. Case coperte: ANIA, 2026.",
        },
        { tipo: "giallo", icona: "☔", forte: "Copre l'incendio. L'alluvione no.", resto: "La polizza casa di base si ferma lì." },
      ],
      nota: "Hai già una polizza casa? Confrontala.",
    },
    no: {
      titolo: ["A te non", "succede?"],
      bianca: "In Italia, 404 furti in casa al giorno.",
      blocchi: [
        {
          tipo: "fila_icone",
          badge: "🚲 Ricordi la bici rubata?",
          titolo: "Era una bici. In casa hai molto di più.",
          icone: ["👜", "💻", "📱", "💍", "⌚"],
          sotto: ["Senza polizza le ricompri tu.", "Con la polizza giusta paga la compagnia."],
        },
        { tipo: "fonte", testo: "Furti del 2023. Censis su dati del Ministero dell'Interno." },
      ],
      nota: "Non ne hai una? Scopri quanto costerebbe.",
    },
  },
  dentale: {
    pensando: {
      titolo: ["Chi paga", "il dentista?"],
      bianca: "Tu. E non sai mai quanto.",
      blocchi: [
        {
          tipo: "un_numero",
          badge: "🦷 Il conto del dentista",
          titolo: "Un ciclo di cure dal dentista costa:",
          numero: { colore: "rosa", etichetta: "In media", numero: "462€", sotto: "senza polizza li paghi tu" },
          fonte: "Key-Stone, osservatorio OmniSalus, 2025. 10.880 intervistati.",
        },
        { tipo: "giallo", icona: "🦷", forte: "È una media: c'è chi spende di più.", resto: "Meglio se il conto non è solo tuo." },
      ],
      nota: "Ci stai pensando? Bastano pochi dati per i preventivi.",
    },
    ha: {
      titolo: ["Il dentista", "è coperto?"],
      bianca: "Spesso no, nemmeno con la polizza salute.",
      blocchi: [
        {
          tipo: "verticali",
          badge: "🔍 Cosa copre davvero",
          titolo: "Una polizza salute, di solito:",
          sx: { colore: "azzurro", etichetta: "Ricovero", icona: "🏥", chi: "Paga la compagnia" },
          dx: { colore: "rosa", etichetta: "Dentista", icona: "🦷", chi: "Spesso paghi tu" },
        },
        {
          tipo: "giallo",
          icona: "📄",
          forte: "Il dentista è spesso una copertura a parte.",
          resto: "Qui le metti a confronto.",
          diSeguito: true,
        },
      ],
      nota: "Hai già una polizza? Confronta le dentali.",
    },
    no: {
      titolo: ["Il dentista", "costa troppo?"],
      bianca: "Per molti sì.",
      blocchi: [
        {
          tipo: "un_numero",
          badge: "🦷 Chi rinuncia al dentista",
          titolo: "In Italia:",
          numero: { colore: "rosa", etichetta: "Quasi", numero: "1 su 3", sotto: "rinuncia alle cure dal dentista" },
          fonte: "Eurispes, Rapporto Italia 2026.",
        },
        { tipo: "giallo", icona: "🦷", forte: "Rimandare non cura i denti.", resto: "Anzi, può far salire il conto." },
      ],
      nota: "Non hai una polizza? Scopri quanto costerebbe.",
    },
  },
  vita: {
    pensando: {
      titolo: ["Troppo presto", "per pensarci?"],
      bianca: "L'età fa la differenza.",
      blocchi: [
        {
          tipo: "vero_falso",
          frase: ["Una polizza vita costa uguale", "a 20 e a 40 anni."],
          spiegazione: ["Il prezzo nasce dal rischio.", "Più sei giovane, meno costa."],
        },
        { tipo: "giallo", icona: "👨‍👩‍👧", forte: "Prima ci pensi, meglio è.", resto: "Per proteggere chi ami." },
      ],
      nota: "Ci stai pensando? Servono età e dati di salute.",
    },
    ha: {
      titolo: ["Stesso prezzo,", "stessa polizza?"],
      bianca: "Sembrano uguali finché non le apri.",
      blocchi: [
        {
          tipo: "tre_righe",
          badge: "🔍 Cosa confrontare",
          righe: [
            { icona: "💶", nome: "Il capitale", testo: "Quanto lascia a chi ami." },
            { icona: "📅", nome: "La durata", testo: "Per quanti anni sei coperto." },
            { icona: "🚫", nome: "Le esclusioni", testo: "I casi in cui non paga." },
          ],
        },
        { tipo: "giallo", icona: "📄", forte: "Il prezzo non dice tutto.", resto: "Lo vedi solo confrontandole." },
      ],
      nota: "Hai già una polizza vita? Confrontala.",
    },
    no: {
      titolo: ["Non è per te.", "È per loro."],
      bianca: "Per chi ami.",
      blocchi: [
        {
          tipo: "vero_falso",
          frase: ["I soldi di una polizza vita", "vanno agli eredi, per legge."],
          spiegazione: ["Li riceve chi scegli tu,", "anche se non è un erede."],
        },
        { tipo: "giallo", icona: "👨‍👩‍👧", forte: "A te non serve. A loro sì.", resto: "E chi sono, lo decidi tu." },
      ],
      nota: "Non ne hai una? Scopri quanto costerebbe.",
    },
  },
};
