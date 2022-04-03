generatorPythonCode = `
# -*- coding: utf-8 -*-

# Cloze Overlapper Add-on for Anki
#
# Copyright (C)  2016-2019 Aristotelis P. <https://glutanimate.com/>
#
# This program is free software: you can redistribute it and/or modify
# it under the terms of the GNU Affero General Public License as
# published by the Free Software Foundation, either version 3 of the
# License, or (at your option) any later version, with the additions
# listed at the end of the accompanied license file.
#
# This program is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU Affero General Public License for more details.
#
# You should have received a copy of the GNU Affero General Public License
# along with this program.  If not, see <https://www.gnu.org/licenses/>.
#
# NOTE: This program is subject to certain additional terms pursuant to
# Section 7 of the GNU Affero General Public License.  You should have
# received a copy of these additional terms immediately following the
# terms and conditions of the GNU Affero General Public License which
# accompanied this program.
#
# If not, please request a copy through one of the means of contact
# listed here: <https://glutanimate.com/contact/>.
#
# Any modifications to this file must keep this entire header intact.

from __future__ import (absolute_import, division,
                        print_function, unicode_literals)


import re
from typing import Match
import re
from operator import itemgetter
from itertools import groupby

from bs4 import BeautifulSoup


reComment = re.compile("(?s)<!--.*?-->")
reStyle = re.compile("(?si)<style.*?>.*?</style>")
reScript = re.compile("(?si)<script.*?>.*?</script>")
reTag = re.compile("(?s)<.*?>")
reEnts = re.compile(r"&#?\\w+;")
reMedia = re.compile("(?i)<img[^>]+src=[\\"']?([^\\"'>]+)[\\"']?[^>]*>")


def stripHTML(s: str) -> str:
    s = reComment.sub("", s)
    s = reStyle.sub("", s)
    s = reScript.sub("", s)
    s = reTag.sub("", s)
    s = entsToTxt(s)
    return s

def entsToTxt(html: str) -> str:
    # entitydefs defines nbsp as \\xa0 instead of a standard space, so we
    # replace it first
    html = html.replace("&nbsp;", " ")

    def fixup(m: Match) -> str:
        text = m.group(0)
        if text[:2] == "&#":
            # character reference
            try:
                if text[:3] == "&#x":
                    return chr(int(text[3:-1], 16))
                else:
                    return chr(int(text[2:-1]))
            except ValueError:
                pass
        else:
            # named entity
            try:
                text = chr(name2codepoint[text[1:-1]])
            except KeyError:
                pass
        return text  # leave as is

    return reEnts.sub(fixup, html)

def parseNoteSettings(html):
    """Return note settings. Fall back to defaults if necessary."""
    options, settings, opts, sets = None, None, None, None
    field = stripHTML(html)

    lines = field.replace(" ", "").split("|")
    if not lines:
        return (dflt_set, dflt_opt)
    settings = lines[0].split(",")
    if len(lines) > 1:
        options = lines[1].split(",")

    if not options and not settings:
        return (dflt_set, dflt_opt)

    if not settings:
        sets = dflt_set
    else:
        sets = []
        for idx, item in enumerate(settings[:3]):
            try:
                sets.append(int(item))
            except ValueError:
                sets.append(None)
        length = len(sets)
        if length == 3 and isinstance(sets[1], int):
            pass
        elif length == 2 and isinstance(sets[0], int):
            sets = [sets[1], sets[0], sets[1]]
        elif length == 1 and isinstance(sets[0], int):
            sets = [dflt_set[0], sets[0], dflt_set[2]]
        else:
            sets = dflt_set

    if not options:
        opts = dflt_opt
    else:
        opts = []
        for i in range(4):
            try:
                if options[i] == "y":
                    opts.append(True)
                else:
                    opts.append(False)
            except IndexError:
                opts.append(dflt_opt[i])

    return (sets, opts)


def createNoteSettings(setopts):
    """Create plain text settings string"""
    set_str = ",".join(str(i) if i is not None else "all" for i in setopts[0])
    opt_str = ",".join("y" if i else "n" for i in setopts[1])
    return set_str + " | " + opt_str

class ClozeOverlapper(object):
    """Reads note, calls ClozeGenerator, writes results back to note"""

    creg = r"(?s)\\[\\[oc(\\d+)::((.*?)(::(.*?))?)?\\]\\]"

    def __init__(self, markup=False, silent=False):
        self.markup = markup
        self.silent = silent

    def add(self, original):
        """Add overlapping clozes to note"""
        matches = re.findall(self.creg, original)
        if matches:
            custom = True
            formstr = re.sub(self.creg, "{{\\\\1}}", original)
            items, keys = self.getClozeItems(matches)
        else:
            custom = False
            formstr = None
            items, keys = self.getLineItems(original)

        setopts = parseNoteSettings(jsSetopts)

        gen = ClozeGenerator(setopts, maxfields)
        fields, full, total = gen.generate(items, formstr, keys)

        return fields, full, total

    def getClozeItems(self, matches):
        """Returns a list of items that were clozed by the user"""
        matches.sort(key=lambda x: int(x[0]))
        groups = groupby(matches, itemgetter(0))
        items = []
        keys = []
        for key, data in groups:
            phrases = tuple(item[1] for item in data)
            keys.append(key)
            if len(phrases) == 1:
                items.append(phrases[0])
            else:
                items.append(phrases)
        return items, keys

    def getLineItems(self, html):
        """Detects HTML list markups and returns a list of plaintext lines"""
        soup = BeautifulSoup(html, "html.parser")
        text = soup.getText("\\n")  # will need to be updated for bs4
        if soup.findAll("ol"):
            self.markup = "ol"
        elif soup.findAll("ul"):
            self.markup = "ul"
        else:
            self.markup = "div"
        # remove empty lines:
        lines = re.sub(r"^(&nbsp;)+$", "", text,
                       flags=re.MULTILINE).splitlines()
        items = [line for line in lines if line.strip() != '']
        return items, None

    def processField(self, field):
        """Convert field contents back to HTML based on previous markup"""
        markup = self.markup
        if markup == "div":
            tag_start, tag_end = "", ""
            tag_items = "<div>{0}</div>"
        else:
            tag_start = '<{0}>'.format(markup)
            tag_end = '</{0}>'.format(markup)
            tag_items = "<li>{0}</li>"
        lines = "".join(tag_items.format(line) for line in field)
        return tag_start + lines + tag_end    
    

class ClozeGenerator(object):
    """Cloze generator"""

    cformat = "{{c%i::%s}}"

    def __init__(self, setopts, maxfields):
        self.maxfields = maxfields
        self.before, self.prompt, self.after = setopts[0]
        self.options = setopts[1]
        self.start = None
        self.total = None

    def generate(self, items, original=None, keys=None):
        """Returns an array of lists with overlapping cloze deletions"""
        length = len(items)
        # print(self.before, self.prompt, self.after)
        if self.prompt > length:
            return 0, None, None
        if self.options[2]:
            self.total = length + self.prompt - 1
            self.start = 1
        else:
            self.total = length
            self.start = self.prompt
        if self.total > self.maxfields:
            return None, None, self.total

        fields = []

        for idx in range(self.start, self.total+1):
            snippets = ["..."] * length
            start_c = self.getClozeStart(idx)
            start_b = self.getBeforeStart(idx, start_c)
            end_a = self.getAfterEnd(idx)

            if start_b is not None:
                snippets[start_b:start_c] = self.removeHints(
                    items[start_b:start_c])
            if end_a is not None:
                snippets[idx:end_a] = self.removeHints(items[idx:end_a])
            snippets[start_c:idx] = self.formatCloze(
                items[start_c:idx], idx-self.start+1)

            field = self.formatSnippets(snippets, original, keys)
            fields.append(field)
        nr = len(fields)
        if self.maxfields > self.total:  # delete contents of unused fields
            fields = fields + [""] * (self.maxfields - len(fields))
        fullsnippet = self.formatCloze(items, self.maxfields + 1)
        full = self.formatSnippets(fullsnippet, original, keys)
        return fields, full, nr

    def formatCloze(self, items, nr):
        """Apply cloze deletion syntax to item"""
        res = []
        for item in items:
            if not isinstance(item, (list, tuple)):
                res.append(self.cformat % (nr, item))
            else:
                res.append([self.cformat % (nr, i) for i in item])
        return res

    def removeHints(self, items):
        """Removes cloze hints from items"""
        res = []
        for item in items:
            if not isinstance(item, (list, tuple)):
                res.append(item.split("::")[0])
            else:
                res.append([i.split("::")[0] for i in item])
        return res

    def formatSnippets(self, snippets, original, keys):
        """Insert snippets back into original text, if available"""
        html = original
        if not html:
            return snippets
        for nr, phrase in zip(keys, snippets):
            if phrase == "...":  # placeholder, replace all instances
                html = html.replace("{{" + nr + "}}", phrase)
            elif not isinstance(phrase, (list, tuple)):
                html = html.replace("{{" + nr + "}}", phrase, 1)
            else:
                for item in phrase:
                    html = html.replace("{{" + nr + "}}", item, 1)
        return html

    def getClozeStart(self, idx):
        """Determine start index of clozed items"""
        if idx < self.prompt or idx > self.total:
            return 0
        return idx-self.prompt  # looking back from current index

    def getBeforeStart(self, idx, start_c):
        """Determine start index of preceding context"""
        if (self.before == 0 or start_c < 1 or
                (self.before and self.options[1] and idx == self.total)):
            return None
        if self.before is None or self.before > start_c:
            return 0
        return start_c-self.before

    def getAfterEnd(self, idx):
        """Determine end index of following context"""
        left = self.total - idx
        if (self.after == 0 or left < 1 or
                (self.after and self.options[0] and idx == self.start)):
            return None
        if self.after is None or self.after > left:
            return self.total
        return idx+self.after

# setOpts = [[1,1,1], ["y","y","y","y"]]

if js.jsSetOpts == None:
    jsSetopts = "1,1,0 | n,n,n,n"
else:
    jsSetopts = js.jsSetOpts

maxfields = 20

cloze = ClozeOverlapper()

if js.originalNoteData != None:
    data = cloze.add(js.originalNoteData)
# fields, full, total
data
`