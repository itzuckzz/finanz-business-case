// Traccia gli eventi del percorso con gli stessi nomi dell'export Mixpanel.
// Nel prototipo gli eventi restano nel browser: li vedi nel pannello "Eventi"
// e nella console.

export type NomeEvento =
  | "Path Started"
  | "Lesson Completed"
  | "Quiz Completed"
  | "Path Completed"
  | "Partner Screen Viewed"
  | "Partner CTA Clicked"
  | "Quote Requested"
  | "Policy Activated"
  | EventoNuovo;

// Eventi che nell'export non ci sono: servono a leggere il test.
// - Lesson Exited: chi abbandona esce a fine lezione o a metà?
// - Partner Screen Exited: quanto resta sulla schermata chi non clicca, e da dove esce
// - Partner Reminder Opened: chi torna alla schermata dal promemoria
export const EVENTI_NUOVI = ["Lesson Exited", "Partner Screen Exited", "Partner Reminder Opened"] as const;
export type EventoNuovo = (typeof EVENTI_NUOVI)[number];

export type Evento = {
  event: NomeEvento;
  time: string;
  properties: Record<string, string | number>;
};

const listeners = new Set<() => void>();
let eventi: Evento[] = [];

export function track(event: NomeEvento, properties: Record<string, string | number> = {}) {
  const e = { event, time: new Date().toISOString(), properties };
  eventi = [...eventi, e];
  console.log("[track]", event, properties);
  listeners.forEach((l) => l());
}

export function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getEventi() {
  return eventi;
}

export function resetEventi() {
  eventi = [];
  listeners.forEach((l) => l());
}
