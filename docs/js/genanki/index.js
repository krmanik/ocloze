// The `initSqlJs` function is globally provided by all of the main dist files if loaded in the browser.
// We must specify this locateFile function if we are loading a wasm file from anywhere other than the current html page's folder.
config = {
    locateFile: filename => `js/genanki/sql/sql-wasm.wasm`
}

var SQL;
initSqlJs(config).then(function (sql) {
    //Create the database
    SQL = sql;
});

const m = new ClozeModel({
    name: MODEL_NAME,
    id: "1641896754216",
    flds: FIELDS,
    css: CSS1,
    req: [
        [0, "all", [0]],
    ],
    tmpls: [
        {
            qfmt: QFMT1,
            afmt: AFMT1,
        }
    ],
})

const d = new Deck(1347617346765, deckName)
const p = new Package()

// add note to deck
var addedCount = 0;
var textToExport = [];
var lines = ""
function addNoteToDeck() {
    var container = document.getElementById("add-note");

    textToExport = [];
    for (i = 0; i < container.childElementCount; i++) {
        textToExport.push(container.children[i].children[1].value.trim())
    }

    if (textToExport.every(element => element == "")) {
        showSnackbar("Fields are empty");
        return;
    }

    if (container.children[5].children[1].value.trim() == "") {
        showSnackbar("Fields are empty");
        return;
    }

    // console.log(textToExport);

    else if (textToExport.length == 26) {
        addedCount++;
        d.addNote(m.note(textToExport))
        showSnackbar("Note added to deck");
    }
    clearNote();
}

// add deck to package and export
function _exportDeck() {
    p.addDeck(d)
    p.writeToFile('Cloze-Deck-Export.apkg')
}

function exportDeck() {
    showSnackbar("Wait... deck is exporting");
    _exportDeck();
}