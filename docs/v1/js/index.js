/* Do not remove
GPL 3.0 License

Copyright (c) 2020 Mani

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

window.addEventListener('load', () => {
    registerSW();
});

async function registerSW() {
    if ('serviceWorker' in navigator) {
        try {
            await navigator.serviceWorker.register('./sw.js');
        } catch (e) {
            console.log(`SW registration failed`);
        }
    }
}

var jsSetOpts = "";
window.onload = function () {

    document.getElementById("contextBefore").value = "1";
    document.getElementById("clozePrompts").value = "1";
    document.getElementById("contextAfter").value = "0";
    document.getElementById("opt_no_cues_first").checked = false;
    document.getElementById("opt_no_cues_last").checked = false;
    document.getElementById("opt_gradual").checked = false;
    document.getElementById("opt_dont_gen").checked = false;

    jsSetOpts = "1,1,0 | n,n,n,n";
    document.getElementById("noteSettings").value = jsSetOpts;
}


var deckName = "Ocloze";

function showSnackbar(msg) {
    var x = document.getElementById("snackbar");

    x.innerHTML = msg;
    x.className = "show";

    setTimeout(function () { x.className = x.className.replace("show", ""); }, 3000);
}


var originalNoteData = "";
var genClozeData = "";
function generateCloze() {
    var note = document.getElementById("noteOriginal");
    originalNoteData = note.value;

    if (originalNoteData.trim() == "") {
        showSnackbar("Original note empty");
    } else {
        genClozeData = pyodide.runPython(generatorPythonCode)
        //console.log(genClozeData);

        if (originalNoteData.includes("[[oc")) {
            clozeTypeOne(genClozeData);
        } else {
            clozeTypeTwo(genClozeData);
        }

    }
}

// add [[oc_::..]] to {{c_::..}}, where _ is 1,2,3...
var createClickCount = 0;
var origNoteData = "";
function createCloze() {
    var text = window.getSelection().toString();
    //console.log("::" + text);

    var note = document.getElementById("noteOriginal");
    var noteData = document.getElementById("noteOriginal").value;

    if (text != "") {
        createClickCount += 1;
        var text1 = "[[oc" + createClickCount + "::" + text + "]]";

        var start = note.selectionStart;
        var end = note.selectionEnd;

        var noteData1 = noteData.replace(noteData.substring(start, end), text1);
        document.getElementById("noteOriginal").value = noteData1;
    }
}

function clozeTypeOne(genClozeData) {
    for (i=0; i<20; i++) {
        if (genClozeData[0][i] != "") {
            document.getElementById("noteText" + (i+1)).value = genClozeData[0][i];
        }
    }

    document.getElementById("fullText").value = genClozeData[1];
    console.log("Cloze Generated");
}


// for list one per line
function clozeTypeTwo(genClozeData) {    
    for (i=0; i<20; i++) {
        if (genClozeData[0][i] != "") {
            document.getElementById("noteText" + (i+1)).value = "<div>" + genClozeData[0][i].join("</div><div>") + "</div>";
        }
    }

    document.getElementById("fullText").value = genClozeData[1].join("\n");
    console.log("Cloze Generated");
}


// add cloze to pyodide output text file for deck export
var textToExport = "";
var textFileName = "";
function addClozeToList() {
    var container = document.getElementById("add-note");

    for (i = 0; i < container.childElementCount; i++) {
        textToExport += container.children[i].children[1].value.trim().replaceAll("\n", "<br>") + "\t";
    }

    textToExport = textToExport.trim();
    textToExport += "\n";
    //console.log(textToExport);

    textFileName = "output-all-notes.txt";

    var checkText = "";
    for (i = 5; i < container.childElementCount-1; i++) {
        checkText += container.children[i].children[1].value.trim();
    }

    if (checkText.trim() != "") {
        pyodide.runPython("textFileName = js.textFileName")
        pyodide.runPython("textToExport = js.textToExport")

        pyodide.runPython(`with open(textFileName, 'a', encoding='utf-8') as f: 
                                f.write(textToExport)`)

        showSnackbar("Note added to list");

        clearNote();
        createClickCount = 0;
        textToExport = "";

    } else {
        showSnackbar("Note is empty or not generated");
        textToExport = "";
    }
}

// clear current note
function clearNote() {
    var container = document.getElementById("add-note");
    for (i = 0; i < container.childElementCount; i++) {
        container.children[i].children[1].value = "";
    }
    createClickCount = 0;
    textToExport = "";
}

function hideHelp() {
    document.getElementById("settings-sideNav").style.height = "0%";
    document.getElementById("settings-sideNav").style.display = "none";    
}

function changeSettings() {
    if (document.getElementById("settings-sideNav").style.height == "80%") {
        document.getElementById("settings-sideNav").style.height = "0%";
        document.getElementById("settings-sideNav").style.display = "none";
    } else {
        document.getElementById("settings-sideNav").style.height = "80%";
        document.getElementById("settings-sideNav").style.display = "inline-block";
    }

    var cBef = document.getElementById("contextBefore").value;
    var cProm = document.getElementById("clozePrompts").value;
    var cAft = document.getElementById("contextAfter").value;

    var cueFirst = "n";
    var cueLast = "n";
    var gradBuild = "n";
    var dontGenFullCloze = "n";

    // No cues for first item
    if (document.getElementById("opt_no_cues_first").checked) {
        cueFirst = "y";
    } else {
        cueFirst = "n";
    }

    // No cues for last item
    if (document.getElementById("opt_no_cues_last").checked) {
        cueLast = "y";
    } else {
        cueLast = "n";
    }

    // Gradual build up/-down
    if (document.getElementById("opt_gradual").checked) {
        gradBuild = "y";
    } else {
        gradBuild = "n";
    }

    // Don't generate full cloze
    if (document.getElementById("opt_dont_gen").checked) {
        dontGenFullCloze = "y";
    } else {
        dontGenFullCloze = "n";
    }

    jsSetOpts = cBef + "," + cProm + "," + cAft + " | " + cueFirst + "," + cueLast + "," + gradBuild + "," + dontGenFullCloze;

    // "1,1,0 | n,n,n,n"
    document.getElementById("noteSettings").value = jsSetOpts;
}

// export and download deck 
function exportAll() {
    document.getElementById('statusMsg').innerHTML = "Wait, deck generating...";
    setTimeout(function () { document.getElementById('statusMsg').innerHTML = ""; }, 2000);

    exportDeck();
    downloadDeck();
}


function showHelp() {
    document.getElementById("settings-sideNav").style.height = "0%";
    document.getElementById("settings-sideNav").style.display = "none";

    if (document.getElementById("viewHelpSideNav").style.height == "100%") {
        document.getElementById("viewHelpSideNav").style.height = "0%"
    } else {
        document.getElementById("viewHelpSideNav").style.height = "100%"
    }
}


function viewLog() {
    document.getElementById("pyodide-load-status").style.display = "table";
    document.getElementById("settings-sideNav").style.height = "0%";
    document.getElementById("settings-sideNav").style.display = "none";
}


function closeConsole() {
    document.getElementById("pyodide-load-status").style.display = "none";
}