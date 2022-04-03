/**
*    Note:  when \ (back slash) then use \\ (double back) other wise it will not work.
*    eg:-   hint.innerHTML.replace(/\[\[oc(\d+)::(.*?)(::(.*?))?\]\]/mg,
*           hint.innerHTML.replace(/\\[\\[oc(\\d+)::(.*?)(::(.*?))?\\]\\]/mg,
**/

pythonCode = `
import random
import csv

import traceback
import js

from glob import glob
from os.path import join

new_title = js.deckName

anki_deck_title = "Ocloze"

if new_title != None:
   anki_deck_title = new_title

anki_model_name = "ocloze-infi"

# model_id = random.randrange(1 << 30, 1 << 31)
model_id = 1918965134

def exportDeck(data_filename, deck_filename):
   try:
      import genanki
      from genanki import Model

      t_fields = [{"name": "Original"},{"name": "Title"}, {"name": "Remarks"}, {"name": "Sources"}, {"name": "Settings"}]
      
      for i in range(1,21):
          t_fields.append({"name":"Text"+str(i)})

      t_fields.append({"name":"Full"})

      # print(self.fields)
      anki_model = genanki.Model(
          model_id,
          anki_model_name,
          fields=t_fields,
          templates=[
              {
                  "name": "Card 1",
                  "qfmt": js.front,     # view template.js
                  "afmt": js.back,      # view template.js
              },
          ],
          css=js.style,                 # view template.js
          model_type=Model.CLOZE
      )

      anki_notes = []

      with open(data_filename, "r", encoding="utf-8") as csv_file:
          csv_reader = csv.reader(csv_file, delimiter="\\t")
          for row in csv_reader:
              flds = []
              for i in range(len(row)):
                  flds.append(row[i])

              anki_note = genanki.Note(
                  model=anki_model,
                  fields=flds,
              )
              anki_notes.append(anki_note)

      anki_deck = genanki.Deck(model_id, anki_deck_title)
      anki_package = genanki.Package(anki_deck)

      for anki_note in anki_notes:
          anki_deck.add_note(anki_note)

      anki_package.write_to_file(deck_filename)

      deck_export_msg = "Deck generated with {} flashcards".format(len(anki_deck.notes))
      js.showSnackbar(deck_export_msg)

   except Exception:
       traceback.print_exc()
    
import micropip

# localhost
# micropip.install("http://localhost:8000/py-whl/beautifulsoup4-4.9.3-py3-none-any.whl")
# micropip.install("http://localhost:8000/py-whl/frozendict-1.2-py3-none-any.whl")
# micropip.install("http://localhost:8000/py-whl/pystache-0.5.4-py3-none-any.whl")
# micropip.install("http://localhost:8000/py-whl/PyYAML-5.3.1-cp38-cp38-win_amd64.whl")
# micropip.install('http://localhost:8000/py-whl/cached_property-1.5.2-py2.py3-none-any.whl')
# micropip.install("http://localhost:8000/py-whl/genanki-0.8.0-py3-none-any.whl")

# from GitHub using CDN
micropip.install("https://cdn.jsdelivr.net/gh/krmanik/ocloze/docs/py-whl/beautifulsoup4-4.9.3-py3-none-any.whl")
micropip.install("https://cdn.jsdelivr.net/gh/krmanik/ocloze/docs/py-whl/soupsieve-2.2-py3-none-any.whl")
micropip.install("https://cdn.jsdelivr.net/gh/krmanik/ocloze/docs/py-whl/frozendict-1.2-py3-none-any.whl")
micropip.install("https://cdn.jsdelivr.net/gh/krmanik/ocloze/docs/py-whl/pystache-0.5.4-py3-none-any.whl")
micropip.install("https://cdn.jsdelivr.net/gh/krmanik/ocloze/docs/py-whl/PyYAML-5.3.1-py3-none-any.whl")
micropip.install("https://cdn.jsdelivr.net/gh/krmanik/ocloze/docs/py-whl/cached_property-1.5.2-py2.py3-none-any.whl")
micropip.install("https://cdn.jsdelivr.net/gh/krmanik/ocloze/docs/py-whl/genanki-0.8.0-py3-none-any.whl")

`

languagePluginLoader.then(() => {
    return pyodide.loadPackage(['micropip'])
}).then(() => {
    pyodide.runPython(pythonCode);

    document.getElementById("loading").style.display = "none";
    document.getElementById("statusMsg").innerHTML = "";

    showSnackbar("Ready to import file");
})

languagePluginLoader.then(function () {
    console.log('Ready');
});

function exportDeck() {
    pyodide.runPython(`exportDeck('output-all-notes.txt', 'output.apkg')`);
}

function downloadDeck() {
    let txt = pyodide.runPython(`                  
    with open('/output.apkg', 'rb') as fh:
        out = fh.read()
    out
    `);

    const blob = new Blob([txt], { type: 'application/zip' });
    let url = window.URL.createObjectURL(blob);

    var downloadLink = document.createElement("a");
    downloadLink.href = url;
    downloadLink.download = "Export-Deck.apkg";
    document.body.appendChild(downloadLink);
    downloadLink.click();
}

function exportText() {
    let txt = pyodide.runPython(`                  
    with open('/output-all-notes.txt', 'r') as fh:
        out = fh.read()
    out
    `);

    console.log(txt);

    const blob = new Blob([txt], { type: 'text/plain' });
    let url = window.URL.createObjectURL(blob);

    var downloadLink = document.createElement("a");
    downloadLink.href = url;
    downloadLink.download = "output.txt";
    document.body.appendChild(downloadLink);
    downloadLink.click();
}