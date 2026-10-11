"use client";

import { Suspense, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useUtente } from "@/components/Providers";
import { Blocco } from "@/components/BlocchiPartner";
import { BottomBar, ChipStato, Icona, PrimaryButton, SecondaryButton, TastoTondo } from "@/components/ui";
import { INGRESSI, PROFILO, SCHERMATE, secondoBottone, type Ingresso, type Profilo, type SchermataPartner as Testi } from "@/lib/partner";
import { NOME_RAMO, type Ramo } from "@/lib/utenti";
import { useRitornoAllaMappa } from "@/lib/navigazione";

const OGGETTO: Partial<Record<Ramo, string>> = { casa: "casa del tuo immobile" };
const AVVISO: Partial<Record<Ramo, string>> = { vita: "Ti chiederemo anche qualche dato sulla tua salute." };
const LEGALE =
  "Finanz non è un intermediario assicurativo e non ti consiglia una polizza specifica. Il confronto è offerto da un partner iscritto al Registro Unico degli Intermediari (RUI).";

export default function Page() {
  return (
    <Suspense>
      <SchermataPartner />
    </Suspense>
  );
}

// La schermata che porta al comparatore del partner.
// Ramo e risposta di onboarding dell'utente scelgono quale versione mostrare.
function SchermataPartner() {
  const { caricato, utente, track, toast, impostaPromemoria } = useUtente();
  const router = useRouter();
  const params = useSearchParams();
  const { allaMappa, allaLezione } = useRitornoAllaMappa();
  const tracciato = useRef(false);
  const inizio = useRef(0);
  const scroll = useRef(0);

  // Solo per controllare le combinazioni senza cambiare utente: ?ramo=casa&profilo=no
  const ramo = (params.get("ramo") as Ramo | null) ?? utente.ramo;
  const profilo = (params.get("profilo") as Profilo | null) ?? PROFILO[utente.onboarding_intent];
  const testi = SCHERMATE[ramo]?.[profilo];
  const versione = testi ? `${ramo}_${profilo}` : "originale";
  // Da dove si arriva: ?da=lezione2, mappa o promemoria. Senza parametro, dal trofeo.
  const da = params.get("da") as Ingresso | null;
  const ingresso: Ingresso = da && INGRESSI.includes(da) ? da : "trofeo";

  useEffect(() => {
    // Dopo un ricaricamento si aspetta l'utente salvato, altrimenti l'evento parte con quello predefinito.
    if (!caricato || tracciato.current) return;
    tracciato.current = true;
    inizio.current = Date.now();
    track("Partner Screen Viewed", { screen_version: versione, entry_point: ingresso });
  }, [caricato, track, versione, ingresso]);

  // Quanto della schermata è stato visto, in percentuale.
  useEffect(() => {
    const el = document.getElementById("scroller");
    if (!el) return;
    const misura = () => {
      scroll.current = Math.max(scroll.current, Math.round(((el.scrollTop + el.clientHeight) / el.scrollHeight) * 100));
    };
    misura();
    el.addEventListener("scroll", misura, { passive: true });
    return () => el.removeEventListener("scroll", misura);
  }, []);

  const misure = () => ({
    screen_version: versione,
    entry_point: ingresso,
    seconds_on_screen: Math.round((Date.now() - inizio.current) / 1000),
    scroll_depth_pct: scroll.current,
  });

  const confronta = () => {
    track("Partner CTA Clicked", misure());
    router.push("/comparatore");
  };
  // Chi arriva da dentro il percorso ci torna, gli altri vanno alla Home.
  // Verso la mappa si riavvolge la cronologia: da lì "indietro" deve portare alla Home, non di nuovo qui.
  const allaHome = () => router.push("/");
  const ritorno = ingresso === "lezione2" || ingresso === "mappa" ? allaMappa : allaHome;
  const esci = (tipo: "close" | "home" | "reminder" | "continue" | "back_to_path", vai: () => void) => {
    track("Partner Screen Exited", { exit_type: tipo, ...misure() });
    vai();
  };
  const chiudi = () => esci("close", ritorno);
  const home = () => esci("home", allaHome);

  if (!testi) return <Originale ramo={ramo} onConfronta={confronta} onChiudi={chiudi} onHome={home} />;

  const secondo = {
    prosegui: { testo: "Continua a imparare", azione: () => esci("continue", () => allaLezione("/percorso/lezione?n=3&c=0")) },
    percorso: { testo: "Torna al percorso", azione: () => esci("back_to_path", allaMappa) },
    home: { testo: "Torna alla Home", azione: home },
    promemoria: {
      testo: "Ricordamelo",
      azione: () => {
        impostaPromemoria("chiesto");
        toast("Te lo ricordiamo tra una settimana 🔔");
        esci("reminder", ritorno);
      },
    },
  }[secondoBottone(ingresso, profilo)];

  return <Nuova testi={testi} secondo={secondo} onConfronta={confronta} onChiudi={chiudi} />;
}

type Secondo = { testo: string; azione: () => void };

function Nuova({
  testi,
  secondo,
  onConfronta,
  onChiudi,
}: {
  testi: Testi;
  secondo: Secondo;
  onConfronta: () => void;
  onChiudi: () => void;
}) {
  return (
    <div className="flex flex-1 flex-col">
      <div className="sticky top-0 z-10 bg-forest px-4 pt-3.5 pb-1.5">
        <button
          onClick={onChiudi}
          aria-label="Chiudi"
          className="grid size-10 place-items-center rounded-full bg-white/15 text-white transition active:scale-90"
        >
          <Icona nome="x" size={22} />
        </button>
      </div>
      <div className="flex flex-col gap-2.5 rounded-b-[28px] bg-forest px-4 pt-0.5 pb-4 text-white">
        <h1 className="font-display text-[46px] leading-[0.95] font-bold text-kiwi-400 uppercase">
          {testi.titolo.map((r) => (
            <span key={r} className="block">
              {r}
            </span>
          ))}
        </h1>
        <p className="leading-snug">{testi.bianca}</p>
      </div>

      <div className="flex flex-col gap-3 px-4 pt-3 pb-2">
        {testi.blocchi.map((b, i) => (
          <Blocco key={i} blocco={b} />
        ))}
        <p className="text-[12.5px] leading-normal text-muted">{LEGALE}</p>
      </div>

      <div className="sticky bottom-0 z-10 mt-auto flex flex-col gap-2.5 border-t border-line bg-white px-4 pt-3 pb-5">
        <p className="mb-0.5 text-center text-[13.5px] leading-tight text-muted">{testi.nota}</p>
        <PrimaryButton onClick={onConfronta}>Confronta le polizze</PrimaryButton>
        <SecondaryButton onClick={secondo.azione}>{secondo.testo}</SecondaryButton>
      </div>
    </div>
  );
}

// La schermata di partenza, uguale per tutti i profili. Resta per i rami senza testi nuovi.
function Originale({
  ramo,
  onConfronta,
  onChiudi,
  onHome,
}: {
  ramo: Ramo;
  onConfronta: () => void;
  onChiudi: () => void;
  onHome: () => void;
}) {
  return (
    <div className="flex flex-1 flex-col">
      <div className="sticky top-0 z-10 flex items-center justify-between bg-white px-4 py-4">
        <TastoTondo label="Chiudi" onClick={onChiudi}>
          <Icona nome="x" size={22} />
        </TastoTondo>
        <ChipStato serie={false} />
      </div>

      <div className="flex flex-col gap-5 px-4 pt-4 pb-8">
        <h1 className="text-[34px] leading-tight font-bold tracking-tight">🛡️ Trova la tua polizza</h1>
        <p className="text-lg leading-snug font-semibold">
          Confronta in pochi minuti le offerte di tante compagnie per la polizza {OGGETTO[ramo] ?? NOME_RAMO[ramo]}.
        </p>
        <p className="rounded-2xl bg-box-azzurro px-6 py-4 text-lg leading-relaxed">
          Un solo modulo, tanti preventivi. Vedi prezzi, massimali e franchigie uno accanto all&apos;altro.
        </p>
        <p className="rounded-2xl bg-box-giallo px-6 py-4 text-lg leading-relaxed">
          Il confronto è gratis e non ti impegna. {AVVISO[ramo]}
        </p>
        <p className="text-sm leading-relaxed text-muted">{LEGALE}</p>
      </div>

      <BottomBar>
        <PrimaryButton onClick={onConfronta}>Confronta le polizze</PrimaryButton>
        <SecondaryButton onClick={onHome}>Torna alla Home</SecondaryButton>
      </BottomBar>
    </div>
  );
}
