import type { BloccoPartner } from "@/lib/partner";

// I blocchi grafici della schermata partner nuova. Ogni schermata ne monta uno o due.

const SFONDO = { rosa: "bg-box-rosa", azzurro: "bg-box-azzurro" };

const PASSI = [
  { titolo: "Compili un modulo", testo: "Sul sito del partner." },
  { titolo: "Ricevi i preventivi via email", testo: "Entro 24 ore, da più compagnie." },
  { titolo: "Decidi tu", testo: "Chiederli è gratis e non ti impegna." },
];

function Cornice({ badge, titolo, children }: { badge: string; titolo?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-2.5 rounded-[22px] bg-badge-sondaggio px-3 pt-3 pb-2.5">
      <span className="rounded-full bg-white px-4 py-1.5 text-sm font-bold tracking-tight uppercase">{badge}</span>
      {titolo && <p className="text-center text-lg leading-snug font-bold tracking-tight">{titolo}</p>}
      {children}
    </div>
  );
}

function Fonte({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <p className={`text-center text-[10.5px] leading-tight tracking-tight whitespace-nowrap text-muted ${className}`}>{children}</p>;
}

// Testo su più righe decise a mano, una voce per riga.
function Righe({ testo }: { testo: string[] }) {
  return testo.map((r) => (
    <span key={r} className="block">
      {r}
    </span>
  ));
}

function Aiuto({ children }: { children: React.ReactNode }) {
  return <p className="text-center text-sm leading-snug text-muted">{children}</p>;
}

export function Blocco({ blocco: b }: { blocco: BloccoPartner }) {
  switch (b.tipo) {
    case "passi":
      return (
        <ol className="flex flex-col rounded-[22px] bg-badge-sondaggio px-3.5 pt-4 pb-0.5">
          {PASSI.map((p, i) => (
            <li key={p.titolo} className="relative grid grid-cols-[34px_1fr] gap-3 pb-4">
              {i < PASSI.length - 1 && <span className="absolute top-[34px] bottom-0 left-4 w-0.5 bg-[#cfe6bf]" />}
              <span className="grid size-[34px] place-items-center rounded-full bg-forest font-bold text-kiwi-400">{i + 1}</span>
              <div>
                <b className="block pt-1.5 text-[17px] leading-tight">{p.titolo}</b>
                <p className="mt-1 text-[15px] leading-snug text-muted">{p.testo}</p>
              </div>
            </li>
          ))}
        </ol>
      );

    // Statico e già risolto: non è una domanda a cui rispondere.
    case "vero_falso":
      return (
        <Cornice badge="🏷️ Vero o falso?" titolo={<Righe testo={b.frase} />}>
          <div className="grid w-full grid-cols-2 gap-2.5 font-semibold">
            <span className="grid h-[46px] place-items-center rounded-[14px] border-[1.5px] border-line bg-white text-muted">Vero</span>
            <span className="grid h-[46px] place-items-center rounded-[14px] bg-kiwi-400 text-forest">Falso ✓</span>
          </div>
          <Aiuto>
            <Righe testo={b.spiegazione} />
          </Aiuto>
        </Cornice>
      );

    case "tre_righe":
      return (
        <Cornice badge={b.badge}>
          <ul className="flex w-full flex-col gap-2">
            {b.righe.map((r) => (
              <li key={r.nome} className="grid grid-cols-[34px_1fr] items-center gap-2.5 rounded-[14px] bg-white px-2.5 py-2 text-left">
                <span className="grid size-[34px] place-items-center rounded-full bg-forest text-[15px]">{r.icona}</span>
                <div>
                  <b className="block text-[15.5px] leading-tight">{r.nome}</b>
                  <small className="text-[13px] leading-tight text-muted">{r.testo}</small>
                </div>
              </li>
            ))}
          </ul>
        </Cornice>
      );

    case "due_numeri":
      return (
        <Cornice badge={b.badge} titolo={b.titolo}>
          <div className="grid w-full grid-cols-2 gap-2.5 text-center">
            {[b.sx, b.dx].map((n) => (
              <div key={n.etichetta} className={`flex flex-col gap-0.5 rounded-2xl px-2 py-3 ${SFONDO[n.colore]}`}>
                <small className="text-[13px] text-muted">{n.etichetta}</small>
                <b className="text-[30px] leading-[1.1] tracking-tight">{n.numero}</b>
                <span className="text-[13.5px] font-semibold">{n.sotto}</span>
              </div>
            ))}
          </div>
          {b.fonte && <Fonte>{b.fonte}</Fonte>}
        </Cornice>
      );

    case "un_numero":
      return (
        <Cornice badge={b.badge} titolo={b.titolo}>
          <div className={`flex w-full flex-col gap-0.5 rounded-2xl px-2.5 py-3.5 text-center ${SFONDO[b.numero.colore]}`}>
            <small className="text-[13px] text-muted">{b.numero.etichetta}</small>
            <b className="text-[44px] leading-[1.1] tracking-tight">{b.numero.numero}</b>
            <span className="text-[14.5px] font-medium">{b.numero.sotto}</span>
          </div>
          {b.fonte && <Fonte>{b.fonte}</Fonte>}
        </Cornice>
      );

    case "categorie":
      return (
        <Cornice badge={b.badge} titolo={b.titolo}>
          <div className="grid w-full grid-cols-2 gap-2.5">
            {[b.sx, b.dx].map((c) => (
              <div key={c.intestazione} className="flex flex-col gap-1.5">
                <p className="text-center text-[13px] font-semibold text-muted">{c.intestazione}</p>
                {c.voci.map((v) => (
                  <div key={v.nome} className={`flex items-center gap-2 rounded-[14px] px-3 py-2 text-[15.5px] font-bold tracking-tight ${SFONDO[c.colore]}`}>
                    <span className="text-[22px] leading-none">{v.icona}</span>
                    {v.nome}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </Cornice>
      );

    case "verticali":
      return (
        <Cornice badge={b.badge} titolo={b.titolo}>
          <div className="grid w-full grid-cols-2 gap-2.5 text-center">
            {[b.sx, b.dx].map((v) => (
              <div key={v.etichetta} className={`flex flex-col items-center gap-1.5 rounded-2xl px-1.5 pt-3 pb-3.5 ${SFONDO[v.colore]}`}>
                <small className="text-[13px] text-muted">{v.etichetta}</small>
                <span className="text-[34px] leading-[1.1]">{v.icona}</span>
                <b className="text-base leading-tight tracking-tight whitespace-nowrap">{v.chi}</b>
              </div>
            ))}
          </div>
          {b.sotto && <Aiuto>{b.sotto}</Aiuto>}
        </Cornice>
      );

    case "cento":
      return (
        <Cornice badge={b.badge} titolo={b.titolo}>
          <div
            role="img"
            aria-label={`${b.legendaPieni}, ${b.legendaVuoti}`}
            className="grid grid-cols-[repeat(20,11px)] justify-center gap-1 pt-1 pb-0.5"
          >
            {Array.from({ length: 100 }, (_, i) => (
              <i key={i} className={`size-[11px] rounded-full ${i < b.pieni ? "bg-forest" : "bg-[#f4b6da]"}`} />
            ))}
          </div>
          <p className="flex justify-center gap-4 text-sm font-semibold">
            <span className="flex items-center gap-1.5">
              <i className="size-2.5 rounded-full bg-forest" />
              {b.legendaPieni}
            </span>
            <span className="flex items-center gap-1.5">
              <i className="size-2.5 rounded-full bg-[#f4b6da]" />
              {b.legendaVuoti}
            </span>
          </p>
          {b.fonte && <Fonte>{b.fonte}</Fonte>}
        </Cornice>
      );

    case "fila_icone":
      return (
        <Cornice badge={b.badge} titolo={b.titolo}>
          <div className="flex w-full justify-center gap-2 py-0.5">
            {b.icone.map((i) => (
              <span key={i} className="grid size-[52px] place-items-center rounded-2xl bg-white text-[28px] leading-none">
                {i}
              </span>
            ))}
          </div>
          <p className="text-center text-[15.5px] leading-snug font-semibold">
            {b.sotto.map((r) => (
              <span key={r} className="block">
                {r}
              </span>
            ))}
          </p>
        </Cornice>
      );

    case "giallo":
      return (
        <div className="flex items-center gap-3 rounded-[18px] bg-box-giallo px-3.5 py-3">
          <span className="grid size-[42px] shrink-0 place-items-center rounded-full bg-white text-[22px]">{b.icona}</span>
          <p className="text-[15.5px] leading-snug">
            <b className={b.diSeguito ? "" : "block"}>{b.forte}</b> {b.resto}
          </p>
        </div>
      );

    case "fonte":
      return <Fonte className="-mt-1">{b.testo}</Fonte>;
  }
}
