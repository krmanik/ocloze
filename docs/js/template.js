var front = `<!--template
######## CLOZE OVERLAPPER DEFAULT TEMPLATE START ########
version: 1.0.0
-->

<!--
PLEASE DO NOT MODIFY THE DEFAULT TEMPLATE SECTIONS.
Any changes between the 'template' markers will be lost once
the add-on updates its template.

Copyright (C) 2016-2019 Aristotelis P. <https://glutanimate.com/>

The Cloze Overlapper card template is licensed under the CC BY-SA 4.0
license (https://creativecommons.org/licenses/by-sa/4.0/). This only
applies to the card template, not the contents of your notes.

Get Cloze Overlapper for Anki at:
https://ankiweb.net/shared/info/969733775
-->

<div class="front">
    {{#Title}}<div class="title">{{Title}}</div>{{/Title}}
    <div class="text">
        <div id="clozed">
            {{cloze:Text1}}
            {{cloze:Text2}}
            {{cloze:Text3}}
            {{cloze:Text4}}
            {{cloze:Text5}}
            {{cloze:Text6}}
            {{cloze:Text7}}
            {{cloze:Text8}}
            {{cloze:Text9}}
            {{cloze:Text10}}
            {{cloze:Text11}}
            {{cloze:Text12}}
            {{cloze:Text13}}
            {{cloze:Text14}}
            {{cloze:Text15}}
            {{cloze:Text16}}
            {{cloze:Text17}}
            {{cloze:Text18}}
            {{cloze:Text19}}
            {{cloze:Text20}}
            {{cloze:Full}}
        </div>
        <div class="hidden">
            <div><span class="cloze">[...]</span></div>
            <div>{{Original}}</div>
        </div>
    </div>
</div>

<script>
// Scroll to cloze
function scrollToCloze () {
    const cloze1 = document.getElementsByClassName("cloze")[0];
    const rect = cloze1.getBoundingClientRect();
    const absTop = rect.top + window.pageYOffset;
    const absBot = rect.bottom + window.pageYOffset;
    if (absBot >= window.innerHeight) {
        const height = rect.top - rect.bottom
        const middle = absTop - (window.innerHeight/2) - (height/2);
        window.scrollTo(0, middle);
    };
}
if ( document.readyState === 'complete' ) {
    setTimeout(scrollToCloze, 1);
} else {
    document.addEventListener('DOMContentLoaded', function() {
        setTimeout(scrollToCloze, 1);
    }, false);
}
</script>

<!--
######## CLOZE OVERLAPPER DEFAULT TEMPLATE END ######## */
template-->

<!-- Add your customizations here: -->`

var style = `/*template
######## CLOZE OVERLAPPER DEFAULT TEMPLATE START ########
version: 1.0.0
*/

/*
PLEASE DO NOT MODIFY THE DEFAULT TEMPLATE SECTIONS.
Any changes between the 'template' markers will be lost once
the add-on updates its template.
*/

/* general card style */

html {
/* scrollbar always visible in order to prevent shift when revealing answer*/
overflow-y: scroll;
}

.card {
font-family: "Helvetica LT Std", Helvetica, Arial, Sans;
font-size: 150%;
text-align: center;
color: black;
background-color: white;
}

/* general layout */

.text {
/* center left-aligned text on card */
display: inline-block;
align: center;
text-align: left;
margin: auto;
max-width: 40em;
}

.hidden {
/* guarantees a consistent width across front and back */
font-weight: bold;
display: block;
line-height:0;
height: 0;
overflow: hidden;
visibility: hidden;
}

.title {
font-weight: bold;
font-size: 1.1em;
margin-bottom: 1em;
text-align: center;
}

/* clozes */

.cloze {
/* regular cloze deletion */
font-weight: bold;
color: #0048FF;
}

.card21 #btn-reveal{
/* no need to display reveal btn on last card */
display:none;
}

/* additional fields */

.extra{
margin-top: 0.5em;
margin: auto;
max-width: 40em;
}

.extra-entry{
margin-top: 0.8em;
font-size: 0.9em;
text-align:left;
}

.extra-descr{
margin-bottom: 0.2em;
font-weight: bold;
font-size: 1em;
}

#btn-reveal {
font-size: 0.5em;
}

.mobile #btn-reveal {
font-size: 0.8em;
}

/*
######## CLOZE OVERLAPPER DEFAULT TEMPLATE END ########
template*/

/* Add your customizations here: */`

// back side
var back = `<!--template
######## CLOZE OVERLAPPER DEFAULT TEMPLATE START ########
version: 1.0.0
-->

<!--
PLEASE DO NOT MODIFY THE DEFAULT TEMPLATE SECTIONS.
Any changes between the 'template' markers will be lost once
the add-on updates its template.
-->

<div class="back">
    {{#Title}}<div class="title">{{Title}}</div>{{/Title}}
    <div class="text">
        <div id="clozed">
            {{cloze:Text1}}
            {{cloze:Text2}}
            {{cloze:Text3}}
            {{cloze:Text4}}
            {{cloze:Text5}}
            {{cloze:Text6}}
            {{cloze:Text7}}
            {{cloze:Text8}}
            {{cloze:Text9}}
            {{cloze:Text10}}
            {{cloze:Text11}}
            {{cloze:Text12}}
            {{cloze:Text13}}
            {{cloze:Text14}}
            {{cloze:Text15}}
            {{cloze:Text16}}
            {{cloze:Text17}}
            {{cloze:Text18}}
            {{cloze:Text19}}
            {{cloze:Text20}}
            {{cloze:Full}}
        </div>
        <div class="hidden">
            <div><span class="cloze">[...]</span></div>
            <div>{{Original}}</div>
        </div>
    </div>
    <div class="extra"><hr></div>
    <button id="btn-reveal" onclick="olToggle();">Reveal all clozes</button>
    <div class="hidden"><div id="original">{{Original}}</div></div>
    <div class="extra">
        {{#Remarks}}
        <div class="extra-entry">
            <div class="extra-descr">Remarks</div><div>{{Remarks}}</div>
        </div>
        {{/Remarks}}
        {{#Sources}}
        <div class="extra-entry">
            <div class="extra-descr">Sources</div><div>{{Sources}}</div>
        </div>
        {{/Sources}}
    </div>
</div>

<script>
// Remove cloze syntax from revealed hint
var hint = document.getElementById("original");
if (hint) {
    var html = hint.innerHTML.replace(/\\[\\[oc(\\d+)::(.*?)(::(.*?))?\\]\\]/mg,
                                    "<span class='cloze'>$2</span>");
    hint.innerHTML = html
};

// Scroll to cloze
function scrollToCloze () {
    const cloze1 = document.getElementsByClassName("cloze")[0];
    const rect = cloze1.getBoundingClientRect();
    const absTop = rect.top + window.pageYOffset;
    const absBot = rect.bottom + window.pageYOffset;
    if (absBot >= window.innerHeight) {
        const height = rect.top - rect.bottom
        const middle = absTop - (window.innerHeight/2) - (height/2);
        window.scrollTo(0, middle);
    };
}
if ( document.readyState === 'complete' ) {
    setTimeout(scrollToCloze, 1);
} else {
    document.addEventListener('DOMContentLoaded', function() {
        setTimeout(scrollToCloze, 1);
    }, false);
}


// Reveal full list
var olToggle = function() {
    var orig = document.getElementById('original');
    var clozed = document.getElementById('clozed');
    var origHtml = orig.innerHTML
    orig.innerHTML = clozed.innerHTML
    clozed.innerHTML = origHtml
}
</script>

<!--
######## CLOZE OVERLAPPER DEFAULT TEMPLATE END ######## */
template-->

<!-- Add your customizations here: -->`