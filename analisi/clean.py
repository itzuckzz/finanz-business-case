# Pulizia dell'export Mixpanel: via i duplicati e gli account di test, rami scritti in un modo solo.
# Poi una riga per utente, con l'istante di ogni passo del percorso.
import pandas as pd
pd.set_option('display.width',250)
# L'export va nella stessa cartella degli script, con il nome con cui è stato consegnato.
EXPORT='export_mixpanel_assicurazioni.xlsx'
def grezzo():
    return pd.read_excel(EXPORT,sheet_name='export')
def load():
    d=grezzo().drop_duplicates('$insert_id').copy()
    d=d[d.distinct_id.str.fullmatch(r'[0-9a-f]+')].copy()  # via account di test/demo
    r=d.ramo.str.strip().str.lower().str.replace(' ','_')
    d['ramo']=r.replace({'dental':'dentale','vita_tcm':'vita'})
    return d
STEPS=['Path Started','L1','L2','L3','L4','Quiz Completed','Path Completed','Partner Screen Viewed','Partner CTA Clicked','Quote Requested','Policy Activated']
PAY={'rc_auto':45,'casa':40,'salute':75,'vita':80,'dentale':35}
def users(d):
    d=d.copy()
    d['step']=d.event
    m=d.event=='Lesson Completed'
    d.loc[m,'step']='L'+d.loc[m,'lesson_number'].astype(int).astype(str)
    u=d.pivot_table(index='distinct_id',columns='step',values='time',aggfunc='min')[STEPS]
    first=d.sort_values('time').groupby('distinct_id')
    u['ramo']=first.ramo.first(); u['intent']=first.onboarding_intent.first().reindex(u.index)
    u['os']=first['$os'].first(); u['ver']=first['$app_version_string'].first()
    u['quiz']=d[d.event=='Quiz Completed'].groupby('distinct_id').quiz_score.first().reindex(u.index)
    return u
