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
        var cloze = new ClozeOverlapper()
        genClozeData = cloze.add(originalNoteData)
        addGeneratedClozeToFields(genClozeData)

        showSnackbar("Cloze generated <br><br> Click + to add to deck")

        //console.log(genClozeData);
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

function addGeneratedClozeToFields(genClozeData) {
    var i=1;
    for (var field in genClozeData) {
        // console.log(genClozeData[field])
        document.getElementById("note"+field).value = genClozeData[field];
        i++;
    }
    console.log("Cloze Generated");
}

// clear current note
function clearNote() {
    var container = document.getElementById("add-note");
    for (i = 0; i < container.childElementCount; i++) {
        container.children[i].children[1].value = "";
    }
    createClickCount = 0;
    textToExport = [];  
    document.getElementById("noteSettings").value = jsSetOpts; 
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

function showHelp() {
    document.getElementById("settings-sideNav").style.height = "0%";
    document.getElementById("settings-sideNav").style.display = "none";

    if (document.getElementById("viewHelpSideNav").style.height == "100%") {
        document.getElementById("viewHelpSideNav").style.height = "0%"
    } else {
        document.getElementById("viewHelpSideNav").style.height = "100%"
    }
}