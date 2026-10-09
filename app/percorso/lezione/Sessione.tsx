"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUtente } from "@/components/Providers";
import { Scheda, SchedaDomanda } from "@/components/Schede";
import { Chip, Icona, LessonChrome, PrimaryButton, SecondaryButton, SheetScheda } from "@/components/ui";
import { LEZIONI, PERCORSO, QUIZ } from "@/lib/percorso";
import { useSchede } from "@/lib/navigazione";
import { invitoDopoLezione2, PROFILO } from "@/lib/partner";

export function Sessione() {
  const { params, vai, esci } = useSchede();
  const n = params.get("n");
  const c = params.get("c") ?? "0";

  if (n === "quiz") return <Quiz key="quiz" c={Number(c) || 0} vai={vai} esci={esci} />;

  const indice = Math.min(Math.max(Number(n) || 1, 1), LEZIONI.length) - 1;
  if (c === "fine")
    return <LezioneCompletata key={`fine-${indice}`} indice={indice} nuova={params.get("nuova") === "1"} vai={vai} esci={esci} />;
  return <Lezione key={`l-${indice}`} indice={indice} c={Number(c) || 0} vai={vai} esci={esci} />;
}

type Nav = Pick<ReturnType<typeof useSchede>, "vai" | "esci">;

function ConfermaUscita({ onResta, onEsci }: { onResta: () => void; onEsci: () => void }) {
  return (
    <SheetScheda
      onClose={onResta}
      icona={<span className="grid size-32 place-items-center rounded-full bg-[#fdf3c4] text-[76px]">🥺</span>}
      titolo="Aspetta, non uscire!"
      testo="Ti bastano meno di 5 minuti per completare una lezione, non mollare!"
    >
      <PrimaryButton onClick={onResta}>Continua a studiare</PrimaryButton>
      <SecondaryButton onClick={onEsci}>Esci</SecondaryButton>
    </SheetScheda>
  );
}

function Lezione({ indice, c, vai, esci }: { indice: number; c: number } & Nav) {
  const { caricato, track, progresso, completaLezione, rispondiSondaggio } = useUtente();
  const [uscita, setUscita] = useState(false);
  const lezione = LEZIONI[indice];
  const card = lezione.card[Math.min(c, lezione.card.length - 1)];

  const sondaggio = (risposta: string) => {
    rispondiSondaggio(indice + 1, risposta);
    track("Survey Answered", { lesson_number: indice + 1, question: card.tipo === "sondaggio" ? card.testo : "", answer: risposta });
  };

  const abbandona = () => {
    track("Lesson Exited", { lesson_number: indice + 1, card_number: c + 1, cards_total: lezione.card.length });
    esci();
  };

  const avanti = () => {
    if (c < lezione.card.length - 1) return vai({ n: indice + 1, c: c + 1 });
    track("Lesson Completed", { lesson_number: indice + 1 });
    // Kiwi solo la prima volta: il ripasso non ne dà.
    const nuova = indice >= progresso.lezioni;
    completaLezione(indice);
    vai({ n: indice + 1, c: "fine", nuova: nuova ? 1 : 0 });
  };

  return (
    <div className="flex flex-1 flex-col">
      <LessonChrome progress={(c / lezione.card.length) * 100} onEsci={() => setUscita(true)} />
      {/* key: tornando indietro la card riparte pulita, e dopo un ricaricamento ritrova la risposta salvata */}
      <Scheda key={`${c}-${caricato}`} card={card} onAvanti={avanti} risposta={progresso.sondaggi[indice + 1]} onSondaggio={sondaggio} />
      {uscita && <ConfermaUscita onResta={() => setUscita(false)} onEsci={abbandona} />}
    </div>
  );
}

function LezioneCompletata({ indice, nuova, vai, esci }: { indice: number; nuova: boolean } & Nav) {
  const { kiwi, utente } = useUtente();
  const router = useRouter();
  const lezione = LEZIONI[indice];
  const ultima = indice === LEZIONI.length - 1;
  // A metà percorso, la prima volta: la schermata partner prima della lezione 3.
  const invito = indice === 1 && nuova && invitoDopoLezione2(utente.ramo, PROFILO[utente.onboarding_intent]);

  const prosegui = () => {
    if (invito) return router.push("/percorso/partner?da=lezione2");
    vai(ultima ? { n: "quiz", c: 0 } : { n: indice + 2, c: 0 });
  };

  return (
    <div className="flex flex-1 flex-col bg-forest text-white">
      <div className="flex items-center justify-between px-4 pt-4">
        <button
          onClick={esci}
          aria-label="Torna al percorso"
          className="grid size-10 place-items-center rounded-full bg-white/15 transition active:scale-90"
        >
          <Icona nome="x" size={22} />
        </button>
        <div className="flex gap-2 [&>span]:border-white/40">
          <Chip>∞ 💛</Chip>
          <Chip>{kiwi.toLocaleString("it-IT")} 🥝</Chip>
        </div>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center gap-6 px-6 py-6">
        <span className="grid size-52 animate-pop place-items-center rounded-full bg-kiwi-100 text-[104px]">{lezione.premio}</span>
        <p className="text-center font-display text-[64px] leading-[0.95] font-bold text-kiwi-400 uppercase">
          Lezione
          <br />
          completata
        </p>
        <div className="flex gap-4">
          <div className="flex flex-col items-center gap-2">
            <span className="flex h-16 w-40 items-center justify-center gap-2 rounded-2xl border-2 border-kiwi-400 text-2xl font-semibold">
              🥝 {nuova ? lezione.kiwi : 0}
            </span>
            <span className="text-sm">Kiwi guadagnati</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <span className="flex h-16 w-40 items-center justify-center gap-2 rounded-2xl border-2 border-kiwi-400 text-2xl font-semibold">
              💛 ∞
            </span>
            <span className="text-sm">Vite infinite</span>
          </div>
        </div>
      </div>

      <div className="sticky bottom-0 px-4 pb-6">
        <PrimaryButton onClick={prosegui}>
          {ultima ? "Vai al quiz finale" : "Prosegui"}
        </PrimaryButton>
      </div>
    </div>
  );
}

// Quiz finale: conta le domande giuste al primo tentativo (quiz_score da 0 a 5).
function Quiz({ c, vai, esci }: { c: number } & Nav) {
  const { track, completaQuiz } = useUtente();
  const router = useRouter();
  const [uscita, setUscita] = useState(false);
  const [giuste, setGiuste] = useState<Record<number, boolean>>({});
  const q = Math.min(c, QUIZ.length - 1);
  const d = QUIZ[q];

  const avanti = (primaGiusta?: boolean) => {
    const tutte = { ...giuste, [q]: giuste[q] ?? !!primaGiusta };
    setGiuste(tutte);
    if (q < QUIZ.length - 1) return vai({ n: "quiz", c: q + 1 });
    const punteggio = Object.values(tutte).filter(Boolean).length;
    track("Quiz Completed", { quiz_score: punteggio });
    completaQuiz(PERCORSO.kiwiTraguardo);
    router.push(`/percorso/completato?punteggio=${punteggio}`);
  };

  return (
    <div className="flex flex-1 flex-col">
      <LessonChrome progress={(q / QUIZ.length) * 100} onEsci={() => setUscita(true)} />
      <SchedaDomanda
        key={q}
        emoji="🎓"
        badge={
          <span className="rounded-full bg-badge-prova px-5 py-2 text-base font-bold tracking-tight uppercase">
            🏆 Quiz finale · {q + 1} di {QUIZ.length}
          </span>
        }
        testo={d.testo}
        risposte={d.risposte}
        corretta={d.corretta}
        onAvanti={avanti}
      />
      {uscita && (
        <ConfermaUscita
          onResta={() => setUscita(false)}
          onEsci={() => {
            track("Lesson Exited", { lesson_number: "quiz", card_number: q + 1, cards_total: QUIZ.length });
            esci();
          }}
        />
      )}
    </div>
  );
}
