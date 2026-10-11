# Quanto vale ogni collo di bottiglia. Ogni scenario dichiara la sua assunzione.
from clean import *
u=users(load()); u['intent']=u.intent.fillna('(senza risposta)')
u['eur']=u.ramo.map(PAY).where(u['Policy Activated'].notna(),0)
V,C,Q,P='Partner Screen Viewed','Partner CTA Clicked','Quote Requested','Policy Activated'
tot=u.eur.sum(); print('Ricavo trimestre',tot,'| polizze',u[P].notna().sum())
g=u.groupby('intent').agg(view=(V,'count'),click=(C,'count'),quote=(Q,'count'),pol=(P,'count'),eur=('eur','sum'))
g['€/view']=(g.eur/g.view).round(2); g['€/click']=(g.eur/g.click).round(2); g['€/quote']=(g.eur/g.quote).round(2); print(g.to_string())
print('\nvalore medio: €/click',round(tot/u[C].notna().sum(),2),'€/quote',round(tot/u[Q].notna().sum(),2),'€/view',round(tot/u[V].notna().sum(),2))
T='No, ma sto pensando di farne una'; G='Sì, ne ho già una o più'; N='No'
def r(x): return int(round(x))
print('\n--- SCENARI (sul trimestre, a parità di conversione a valle) ---')
# A: schermata partner, click
for seg,target in [(T,.40),(T,.50),(G,g.click[T]/g.view[T]),(N,g.click[G]/g.view[G])]:
    extra=g.view[seg]*target-g.click[seg]; print(f'A click {seg[:18]:18} {g.click[seg]/g.view[seg]:.1%} → {target:.1%}: +{r(extra)} click, +{r(extra*g.eur[seg]/g.click[seg])} €')
allc=sum((g.view[s]*g.click[T]/g.view[T]-g.click[s])*g.eur[s]/g.click[s] for s in [G,N]); print('A tutti al click di "ci sto pensando":',r(allc),'€')
# B: modulo partner, click→preventivo
for seg in [G,N]:
    target=g.quote[T]/g.click[T]; extra=g.click[seg]*target-g.quote[seg]; print(f'B modulo {seg[:18]:18} {g.quote[seg]/g.click[seg]:.1%} → {target:.1%}: +{r(extra)} preventivi, +{r(extra*g.eur[seg]/g.quote[seg])} €')
extra=g.click[T]*.60-g.quote[T]; print(f'B modulo ci sto pensando 45.8% → 60%: +{r(extra)} preventivi, +{r(extra*g.eur[T]/g.quote[T])} €')
# C: bug Android 4.12.0 lezione 3
b=u[(u.ver=='4.12.0')&(u.os=='Android')]; ok=u[~((u.ver=='4.12.0')&(u.os=='Android'))]
rate=ok.L3.notna().sum()/ok.L2.notna().sum(); persi=b.L2.notna().sum()*rate-b.L3.notna().sum()
val=ok.eur.sum()/ok.L3.notna().sum(); print(f'C bug: L2→L3 {b.L3.notna().sum()/b.L2.notna().sum():.1%} vs {rate:.1%} altrove: {r(persi)} utenti persi × {val:.2f} €/utente a L3 = {r(persi*val)} €')
# D: vita preventivo→polizza
v=u[u.ramo=='vita']; o=u[u.ramo!='vita']; ro=o[P].notna().sum()/o[Q].notna().sum(); ex=v[Q].notna().sum()*ro-v[P].notna().sum()
print(f'D vita: {v[P].notna().sum()}/{v[Q].notna().sum()} = {v[P].notna().sum()/v[Q].notna().sum():.1%} vs {ro:.1%} altri rami: +{ex:.1f} polizze × 80 € = {r(ex*80)} €')
# E: censura di giugno
u['sett']=u['Path Started'].dt.to_period('W').dt.start_time.dt.strftime('%m-%d')
w=u.groupby('sett').agg(start=('Path Started','count'),click=(C,'count'),quote=(Q,'count'),pol=(P,'count')); w['q→p%']=(w.pol/w.quote*100).round(0); w['c→q%']=(w.click and 0) if False else (w.quote/w.click*100).round(0); print(w.to_string())

# ---------- Cifre del PDF che gli scenari sopra non stampano ----------
import math
S,PC='Path Started','Path Completed'
print('\n--- FUNNEL ---')
c=u[STEPS].notna().sum(); print(pd.DataFrame({'utenti':c,'% sul passo prima':(c/c.shift()*100).round(1),'persi':(c.shift()-c)}).to_string())
print('non finiscono il percorso',c[S]-c[PC],'| escono sul trofeo',c[PC]-c[V],f'({(c[PC]-c[V])/c[PC]:.1%}) | non vedono mai l\'offerta',c[S]-c[V],f'({(c[S]-c[V])/c[S]:.1%})')
print('di cui "ci sto pensando"',(u.intent==T).sum()-g.view[T],'| vedono e non cliccano',c[V]-c[C])
raw=grezzo(); dd=raw.drop_duplicates('$insert_id')
print('pulizia: righe',len(raw),'duplicati',len(raw)-len(dd),'account di test',dd[~dd.distinct_id.str.fullmatch(r'[0-9a-f]+')].distinct_id.nunique(),'scritture del ramo',raw.ramo.nunique())
print('\n--- PER RISPOSTA DI ONBOARDING ---')
gi=g.assign(partiti=u.groupby('intent')[S].count()); gi['click%']=(gi.click/gi.view*100).round(1); gi['prev/click%']=(gi.quote/gi.click*100).round(1); gi['quota partiti%']=(gi.partiti/len(u)*100).round(1); gi['quota ricavi%']=(gi.eur/tot*100).round(1)
print(gi[['partiti','view','click','click%','quote','prev/click%','pol','eur','quota partiti%','quota ricavi%']].to_string())
print('\n--- PER RAMO ---')
gr=u.groupby('ramo').agg(partiti=(S,'count'),view=(V,'count'),click=(C,'count'),quote=(Q,'count'),pol=(P,'count'),eur=('eur','sum'))
gr['click%']=(gr.click/gr.view*100).round(1); gr['prev/click%']=(gr.quote/gr.click*100).round(1); gr['pol/prev%']=(gr.pol/gr.quote*100).round(1); gr['€/click']=(gr.eur/gr.click).round(3); print(gr.to_string())
print('click altri rami (senza vita)',f'{o[C].notna().sum()/o[V].notna().sum():.1%}')
x=u[(u.ramo=="rc_auto")&(u.intent==G)]; print('RC auto, "ne ho già una": preventivi',x[Q].notna().sum(),'su',x[C].notna().sum(),'click')
print('caselle ramo × risposta (chi vede la schermata):'); print(pd.crosstab(u.intent,u.ramo,values=u[V],aggfunc='count').to_string())
print('\n--- TEMPI ---')
print('percorso, mediana',(u[PC]-u[S]).median(),'| click dopo la schermata, massimo',(u[C]-u[V]).max())
dt=u[Q]-u[C]; print('click → preventivo, mediana',dt.median(),'| entro 1 ora',(dt<pd.Timedelta(hours=1)).sum(),'su',dt.notna().sum(),'| preventivo → polizza, mediana',(u[P]-u[Q]).median())
q=u[Q].notna(); f=dt<pd.Timedelta(hours=12); pol=u[P].notna()
print(f'modulo entro 12 ore: {(q&f&pol).sum()}/{(q&f).sum()} = {(q&f&pol).sum()/(q&f).sum():.1%} | dopo: {(q&~f&pol).sum()}/{(q&~f).sum()} = {(q&~f&pol).sum()/(q&~f).sum():.1%}')
print('medie: percorso',(u[PC]-u[S]).mean(),'| click → preventivo',dt.mean(),'| preventivo → polizza',(u[P]-u[Q]).mean())
print('quiz completati per utente, massimo',load().query("event=='Quiz Completed'").groupby('distinct_id').size().max())
print('visualizzazioni per utente, massimo',load().query("event=='Partner Screen Viewed'").groupby('distinct_id').size().max())
m=u[u.intent==T].groupby(u[S].dt.month)[[V,C]].count(); print('click "ci sto pensando" per mese di partenza:',(m[C]/m[V]*100).round(1).to_dict())
print('\n--- OFFERTA ANTICIPATA (tetti; coorte del bug esclusa dalle percentuali) ---')
bug=(u.ver=='4.12.0')&(u.os=='Android'); nb=u[~bug]; print('coorte del bug',bug.sum(),'utenti')
for s in [T,G,N]:
    a=u[u.intent==s]; x=nb[nb.intent==s]; n=len(a); ev=g.eur[s]/g.view[s]
    pl2=x.L2.notna().mean(); pv=x[V].notna().mean(); pt=(x[PC].notna()&x[V].isna()).mean()
    print(f'{s[:18]:18} L2 {pl2:.1%} schermata {pv:.1%} | mappa {r(n*(1-pv))} persone {r(n*(1-pv)*ev)} € | dopo L2 {r(n*(pl2-pv))} persone {r(n*(pl2-pv)*ev)} € | trofeo {r(n*pt)} persone {r(n*pt*ev)} €')
x=nb[nb.intent==T]; k=[x[i].notna().sum() for i in [S,'L1','L2','L3','L4','Quiz Completed',PC,V,C]]; print('"ci sto pensando" senza bug: partiti',k[0],'| persi a ogni passo',[k[i]-k[i+1] for i in range(8)])
print('\n--- TEST ---')
def camp(p1,p2): pb=(p1+p2)/2; return math.ceil((1.96*math.sqrt(2*pb*(1-pb))+0.8416*math.sqrt(p1*(1-p1)+p2*(1-p2)))**2/(p2-p1)**2)  # per gruppo, 5% a due code, potenza 80%
print(f'Test 1: click {c[C]/c[V]:.1%}, preventivi su chi vede {c[Q]/c[V]:.1%} | 19,7→24%: {camp(c[C]/c[V],.24)} per gruppo | {r(c[V]/13)} visualizzazioni a settimana')
tg=u[u.intent.isin([T,G])]; b2=tg[C].notna().sum()/tg.L2.notna().sum()
print(f'Test 2: click su chi finisce L2, due profili {tg[C].notna().sum()}/{tg.L2.notna().sum()} = {b2:.1%} | →19%: {camp(b2,.19)} per gruppo | {r(tg.L2.notna().sum()/13)} a settimana | completamento oggi {tg[PC].notna().sum()/tg.L2.notna().sum():.1%}')
print('\n--- QUOTA A PREVENTIVO ---')
nq=c[Q]; print(f'preventivi {nq}, non diventano polizza {1-c[P]/nq:.1%} | +3 €: {3*nq} | +5 €: {5*nq} | 5 € e payout −20%: {r(5*nq+.8*tot)}')

print('\n--- CONTROLLI SUL CLICK (chi vede la schermata) ---')
# Per ogni variabile: click per gruppo e chi quadro contro la soglia del 5%.
SOGLIA={1:3.84,2:5.99,3:7.81,4:9.49,5:11.07,6:12.59,7:14.07}
vv=u[u[V].notna()].copy(); vv['click']=vv[C].notna()
vv['fascia oraria']=pd.cut(vv[V].dt.hour,[0,6,12,18,24],right=False,labels=['notte','mattina','pomeriggio','sera'])
vv['giorno']=vv[V].dt.dayofweek
vv['quiz']=vv.quiz
vv['durata']=pd.qcut((vv[PC]-vv[S]).dt.total_seconds(),4,labels=['q1','q2','q3','q4'])
vv['sistema']=vv.os
vv['mese']=vv[S].dt.month
def controllo(d,col,nome):
    t=pd.crosstab(d[col],d.click); att=t.sum(1).values[:,None]*t.sum(0).values[None,:]/t.values.sum()
    chi=((t.values-att)**2/att).sum(); gl=len(t)-1; r_=(t[True]/t.sum(1)*100).round(1)
    print(f'{nome:26} {"diverso" if chi>SOGLIA[gl] else "nessun effetto":15} chi2 {chi:5.1f} (soglia {SOGLIA[gl]}) | click% min {r_.min()} max {r_.max()} | {r_.to_dict()}')
for col in ['fascia oraria','giorno','quiz','durata','sistema','mese']: controllo(vv,col,col)
for s in [T,G,N]: controllo(vv[vv.intent==s],'mese','mese, '+s[:16])
controllo(vv,'ramo','ramo'); controllo(vv[vv.intent!='(senza risposta)'],'intent','risposta di onboarding')
for s in [T,G,N]: controllo(vv[vv.intent==s],'ramo','ramo, '+s[:16])

print('\n--- TEST SU UN TRIMESTRE, 50/50 (sostituisce le soglie al 24% e al 19%) ---')
from statistics import NormalDist
ND=NormalDist()
vs=u[u[V].notna()].groupby(u[V].dt.to_period('W')).size(); regime=vs.iloc[2:-2].mean()
print('visualizzazioni a settimana:',vs.values.tolist(),'| a regime',r(regime))
def lettura(n,p,nome):
    se=math.sqrt(2*p*(1-p)/n); m95=1.96*se; mde=(1.96+0.8416)*se
    print(f'{nome:34} base {p:.1%} | {r(n)} per gruppo | margine ±{m95*100:.1f} punti | effetto che il test vede 4 volte su 5: +{mde*100:.1f} punti ({(p+mde):.1%})')
    return se
pc=c[C]/c[V]; ng=regime*13/2
se=lettura(ng,pc,'Test 1, click, tutti')
print('   probabilità di vedere un effetto vero di',{d:f'{(1-ND.cdf(1.96-d/100/se)):.0%}' for d in (2,3,4,5)})
for s in [T,G,N]: lettura(ng*g.view[s]/c[V],g.click[s]/g.view[s],'   '+s[:22])
lettura(ng,c[Q]/c[V],'   preventivi su chi vede')
print(f'   per gruppo: click {r(ng*pc)}, preventivi {r(ng*c[Q]/c[V])}, polizze {r(ng*c[P]/c[V])}')
print('quanto vale un punto di click: ',r(c[V]/100),'click,',r(c[V]/100*tot/c[C]),'€ a trimestre')
print('click in più, in proporzione ai gruppi (€ = click in più × ricavo per click del gruppo):')
for punti in (2.2,3,4,5):
    k=punti/100/pc; eur=sum(g.click[s]*k*g.eur[s]/g.click[s] for s in g.index); print(f'   +{punti} punti ({pc+punti/100:.1%}): +{r(c[C]*k)} click, +{r(eur)} €',{s[:14]:(f'{g.click[s]/g.view[s]*(1+k):.1%}',r(g.click[s]*k),r(g.eur[s]*k)) for s in [T,G,N]})
l2=tg.L2.notna().sum()/13*13/2; lettura(l2,b2,'Test 2, click su chi finisce L2')
# Test 2 misurato su chi inizia il percorso (11 ottobre): l'assegnazione ai gruppi avviene all'inizio,
# e la pillola in mappa serve anche a chi si ferma prima della lezione 2.
b2s=tg[C].notna().sum()/len(tg); se2=lettura(len(tg)/2,b2s,'Test 2, click su chi inizia')
print(f'   {tg[C].notna().sum()} click su {len(tg)} partiti | non funziona sotto +{((1.96+0.8416)-1.96)*se2*100:.1f} punti | completamento oggi {tg[PC].notna().sum()}/{len(tg)} = {tg[PC].notna().mean():.1%} | arriva alla lezione 2 {tg.L2.notna().mean():.1%}')
print(f'   vedono la schermata partner almeno una volta {tg[V].notna().sum()}/{len(tg)} = {tg[V].notna().mean():.1%}')
