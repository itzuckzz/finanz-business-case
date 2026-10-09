"use client";

import { useSyncExternalStore } from "react";
import { EVENTI_NUOVI, getEventi, resetEventi, subscribe } from "@/lib/track";

const EMPTY: ReturnType<typeof getEventi> = [];

// Pannello laterale, visibile solo su schermi larghi: mostra gli eventi
// che il percorso manda, con gli stessi nomi dell'export Mixpanel.
// Quelli che nell'export non esistono hanno l'etichetta "nuovo".
export function EventLog() {
  const eventi = useSyncExternalStore(subscribe, getEventi, () => EMPTY);

  return (
    <aside className="sticky top-4 hidden w-80 shrink-0 rounded-2xl border border-line bg-white p-4 text-sm lg:block">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-bold">Eventi ({eventi.length})</h2>
        <button onClick={resetEventi} className="text-xs text-muted underline">
          svuota
        </button>
      </div>
      {eventi.length === 0 && <p className="text-muted">Usa il percorso: qui compaiono gli eventi Mixpanel.</p>}
      <ol className="flex max-h-[min(700px,calc(100dvh-6rem))] flex-col-reverse gap-2 overflow-y-auto">
        {eventi.map((e, i) => (
          <li key={i} className="rounded-lg bg-kiwi-50 px-3 py-2">
            <div className="flex items-center justify-between gap-2 font-semibold text-forest">
              {e.event}
              {(EVENTI_NUOVI as readonly string[]).includes(e.event) && (
                <span className="rounded-full bg-kiwi-400 px-2 py-0.5 text-[10px] tracking-wide uppercase">nuovo</span>
              )}
            </div>
            <div className="text-xs text-muted">
              {Object.entries(e.properties)
                .filter(([k]) => !["distinct_id", "$os", "onboarding_intent"].includes(k))
                .map(([k, v]) => `${k}: ${v}`)
                .join(" · ")}
            </div>
          </li>
        ))}
      </ol>
    </aside>
  );
}
