"use client";

import { useRouter } from "next/navigation";
import { useUtente, VUOTO } from "@/components/Providers";
import { Sheet } from "@/components/ui";
import { idUtente, INTENTI, RAMI, TITOLO_RAMO } from "@/lib/utenti";
import { invitoDopoLezione2, PROFILO } from "@/lib/partner";
import { LEZIONI, PERCORSO } from "@/lib/percorso";

// Strumenti per chi prova il prototipo: non esistono nell'app vera.
// Scegli ramo e risposta di onboarding e salti avanti nel percorso senza rifare tutte le lezioni.
export function PannelloTester({ onClose }: { onClose: () => void }) {
  const { utente, setUtente, progresso, impostaProgresso, toast } = useUtente();
  const router = useRouter();
  // La schermata partner a metà percorso non c'è per chi ha risposto "No" né per i rami
  // senza testi nuovi: lì la scorciatoia non compare.
  const aMeta = invitoDopoLezione2(utente.ramo, PROFILO[utente.onboarding_intent]);

  const salta = (lezioni: number, quiz: boolean, dove: string, messaggio: string) => {
    const kiwiExtra = LEZIONI.slice(0, lezioni).reduce((s, l) => s + l.kiwi, 0) + (quiz ? PERCORSO.kiwiTraguardo : 0);
    // Le risposte ai sondaggi restano, tranne quando si ricomincia da zero.
    impostaProgresso({ ...(lezioni === 0 ? VUOTO : progresso), lezioni, quiz, kiwiExtra });
    onClose();
    toast(messaggio);
    router.push(dove);
  };

  return (
    <Sheet onClose={onClose}>
      <p className="text-2xl font-bold">🧪 Utente di prova</p>
      <p className="mt-1 text-sm text-muted">
        Ramo e risposta alla domanda di onboarding decidono la schermata partner e l&apos;ingresso in mappa: quindici
        combinazioni. L&apos;avanzamento resta salvato per ognuna.
      </p>
      <p className="mt-4 text-xs font-semibold tracking-wide text-muted uppercase">Ramo</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {RAMI.map((r) => (
          <button
            key={r}
            onClick={() => setUtente(idUtente(r, utente.onboarding_intent))}
            aria-pressed={r === utente.ramo}
            className={`rounded-full border-[1.5px] px-4 py-2 text-sm font-semibold transition ${r === utente.ramo ? "border-green-600 bg-soft" : "border-line"}`}
          >
            {TITOLO_RAMO[r]}
          </button>
        ))}
      </div>
      <p className="mt-4 text-xs font-semibold tracking-wide text-muted uppercase">
        &quot;Hai attualmente delle assicurazioni?&quot;
      </p>
      <div className="mt-2 flex flex-col gap-2">
        {INTENTI.map((i) => (
          <button
            key={i}
            onClick={() => setUtente(idUtente(utente.ramo, i))}
            aria-pressed={i === utente.onboarding_intent}
            className={`rounded-2xl border-[1.5px] px-4 py-2.5 text-left text-sm font-semibold transition ${i === utente.onboarding_intent ? "border-green-600 bg-soft" : "border-line"}`}
          >
            {i}
          </button>
        ))}
      </div>
      <p className="mt-5 text-xs font-semibold tracking-wide text-muted uppercase">Scorciatoie</p>
      <div className="mt-2 grid grid-cols-2 gap-2 text-sm font-semibold">
        <button className="rounded-2xl bg-soft px-2 py-3" onClick={() => salta(0, false, "/", "Percorso azzerato")}>
          Ricomincia da zero
        </button>
        <button
          className="rounded-2xl bg-soft px-2 py-3"
          onClick={() => salta(LEZIONI.length, false, "/percorso/lezione?n=quiz&c=0", "Lezioni completate")}
        >
          Vai al quiz finale
        </button>
        <button
          className={`rounded-2xl bg-soft px-2 py-3 ${aMeta ? "" : "col-span-2"}`}
          onClick={() => salta(LEZIONI.length, true, "/percorso/partner", "Percorso completato")}
        >
          Vai alla schermata partner
        </button>
        {aMeta && (
          <button
            className="rounded-2xl bg-soft px-2 py-3"
            onClick={() => salta(2, false, "/percorso/partner?da=lezione2", "Lezione 2 completata")}
          >
            Schermata dopo la lezione 2
          </button>
        )}
      </div>
    </Sheet>
  );
}
