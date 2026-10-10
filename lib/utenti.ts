// Utenti finti per provare il percorso. I valori di onboarding_intent e ramo
// sono gli stessi dell'export Mixpanel.

export type Intento =
  | "Sì, ne ho già una o più"
  | "No, ma sto pensando di farne una"
  | "No";

export type Ramo = "rc_auto" | "casa" | "salute" | "vita" | "dentale";

export type Utente = {
  id: string;
  os: "iOS" | "Android";
  onboarding_intent: Intento;
  ramo: Ramo;
  kiwi: number;
};

// Nell'ordine in cui si scelgono nel pannello dell'utente di prova.
export const RAMI: Ramo[] = ["rc_auto", "salute", "casa", "dentale", "vita"];
export const INTENTI: Intento[] = ["No, ma sto pensando di farne una", "Sì, ne ho già una o più", "No"];

export const idUtente = (ramo: Ramo, intento: Intento) => `${ramo}-${INTENTI.indexOf(intento)}`;

// Un utente di prova per ogni combinazione di ramo e risposta di onboarding: quindici,
// quante sono le schermate partner. Il primo è quello con cui si apre il prototipo.
export const UTENTI: Utente[] = RAMI.flatMap((ramo) =>
  [INTENTI[1], INTENTI[0], INTENTI[2]].map((onboarding_intent) => ({
    id: idUtente(ramo, onboarding_intent),
    os: "iOS" as const,
    onboarding_intent,
    ramo,
    kiwi: 800,
  })),
);

// Per le etichette: maiuscola iniziale, e la risposta di onboarding in breve.
export const TITOLO_RAMO: Record<Ramo, string> = {
  rc_auto: "RC auto",
  salute: "Salute",
  casa: "Casa",
  dentale: "Dentale",
  vita: "Vita",
};
export const INTENTO_IN_BREVE: Record<Intento, string> = {
  "No, ma sto pensando di farne una": "ci sta pensando",
  "Sì, ne ho già una o più": "ne ha già una",
  No: "non ne ha",
};

export const NOME_RAMO: Record<Ramo, string> = {
  rc_auto: "RC auto",
  casa: "casa",
  salute: "salute",
  vita: "vita",
  dentale: "cure dentali",
};
