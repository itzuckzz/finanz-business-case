# Analisi dell'export

I due script da cui escono le cifre del PDF ricavate dall'export.

- `clean.py` pulisce l'export: toglie le righe duplicate e gli account di test, scrive i rami in un modo solo e costruisce una riga per utente.
- `valore.py` stampa il funnel, il valore di ogni passo, gli scenari in euro, i controlli sul click e i campioni dei due test.

## Come si lanciano

L'export non è in questo repo. Va copiato in questa cartella con il nome con cui è stato consegnato, `export_mixpanel_assicurazioni.xlsx`.

```bash
pip install pandas openpyxl
python valore.py
```

Stampa circa 110 righe, divise in blocchi con un titolo. Ogni cifra del PDF si ritrova lì.
