"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

// Lezioni e quiz scorrono card per card dentro la stessa pagina. Ogni card è una voce
// della cronologia del browser: il tasto indietro del telefono (o del browser) torna
// alla card precedente, come ci si aspetta.
//
// In history.state teniamo quante card abbiamo aperto da quando siamo entrati
// e se ci siamo arrivati dalla mappa del percorso: "Esci" torna alla mappa
// riavvolgendo la cronologia, invece di accumulare voci.

type Stato = { profondita?: number; dallaMappa?: boolean; passiMappa?: number };

const CHIAVE = "finanz-apri-dalla-mappa";
const CHIAVE_RITORNO = "finanz-passi-verso-la-mappa";
const CHIAVE_PROFONDITA = "finanz-profondita-iniziale";

// Da chiamare sulla mappa prima di aprire una lezione.
export function segnaAperturaDallaMappa() {
  try {
    sessionStorage.setItem(CHIAVE, "1");
  } catch {}
}

function stato(): Stato {
  return (typeof window !== "undefined" && (window.history.state as Stato)) || {};
}

// Da chiamare in una lezione prima di aprire una schermata fuori dalle card (la schermata
// partner a metà percorso): ricorda quante voci di cronologia ci separano dalla mappa.
export function segnaRitornoAllaMappa() {
  const s = stato();
  try {
    if (s.dallaMappa) sessionStorage.setItem(CHIAVE_RITORNO, String((s.profondita ?? 0) + 2));
    else sessionStorage.removeItem(CHIAVE_RITORNO);
  } catch {}
}

// Per la schermata aperta dopo segnaRitornoAllaMappa: torna alla mappa riavvolgendo la
// cronologia, così dalla mappa "indietro" porta alla Home e non di nuovo qui.
export function useRitornoAllaMappa() {
  const router = useRouter();

  // Il conto resta nella voce di cronologia: vale anche tornando qui dal sito del partner.
  useEffect(() => {
    let passi = 0;
    try {
      passi = Number(sessionStorage.getItem(CHIAVE_RITORNO)) || 0;
      sessionStorage.removeItem(CHIAVE_RITORNO);
    } catch {}
    if (passi) window.history.replaceState({ ...window.history.state, passiMappa: passi }, "");
  }, []);

  const allaMappa = () => {
    const passi = stato().passiMappa;
    if (passi) window.history.go(-passi);
    else router.replace("/percorso");
  };

  // Riprende le lezioni da qui. La lezione che si apre sa ancora quanto dista la mappa,
  // così la sua X ci torna senza lasciare questa schermata nella cronologia.
  const allaLezione = (href: string) => {
    const passi = stato().passiMappa;
    if (!passi) return router.replace(href);
    try {
      sessionStorage.setItem(CHIAVE, "1");
      sessionStorage.setItem(CHIAVE_PROFONDITA, String(passi));
    } catch {}
    router.push(href);
  };

  return { allaMappa, allaLezione };
}

export function useSchede() {
  const params = useSearchParams();
  const router = useRouter();

  // Alla prima card: segna da dove arriviamo.
  useEffect(() => {
    if (stato().profondita !== undefined) return;
    let dallaMappa = false;
    let profondita = 0;
    try {
      dallaMappa = sessionStorage.getItem(CHIAVE) === "1";
      profondita = Number(sessionStorage.getItem(CHIAVE_PROFONDITA)) || 0;
      sessionStorage.removeItem(CHIAVE);
      sessionStorage.removeItem(CHIAVE_PROFONDITA);
    } catch {}
    window.history.replaceState({ ...window.history.state, profondita, dallaMappa }, "");
  }, []);

  // A ogni cambio di card (avanti o indietro) si riparte dall'alto.
  const chiave = params.toString();
  useEffect(() => {
    document.getElementById("scroller")?.scrollTo(0, 0);
  }, [chiave]);

  const vai = (query: Record<string, string | number>) => {
    const s = stato();
    const url = `${window.location.pathname}?${new URLSearchParams(Object.entries(query).map(([k, v]) => [k, String(v)]))}`;
    window.history.pushState({ profondita: (s.profondita ?? 0) + 1, dallaMappa: s.dallaMappa }, "", url);
  };

  const esci = () => {
    const s = stato();
    if (s.dallaMappa) window.history.go(-((s.profondita ?? 0) + 1));
    else router.replace("/percorso");
  };

  return { params, vai, esci };
}
