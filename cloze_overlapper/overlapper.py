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

"""
Adds overlapping clozes
"""

from __future__ import (absolute_import, division,
                        print_function, unicode_literals)

import re
from operator import itemgetter
from itertools import groupby

from bs4 import BeautifulSoup

from config import parseNoteSettings, createNoteSettings
from generator import ClozeGenerator

class ClozeOverlapper(object):
    """Reads note, calls ClozeGenerator, writes results back to note"""

    creg = r"(?s)\[\[oc(\d+)::((.*?)(::(.*?))?)?\]\]"

    def __init__(self, note, markup=False, silent=False, parent=None):
        self.markup = markup
        self.silent = silent
        self.parent = parent

    def add(self, original):
        """Add overlapping clozes to note"""
        matches = re.findall(self.creg, original)
        if matches:
            custom = True
            formstr = re.sub(self.creg, "{{\\1}}", original)
            items, keys = self.getClozeItems(matches)
        else:
            custom = False
            formstr = None
            items, keys = self.getLineItems(original)

        setopts = parseNoteSettings("1,1,0 | n,n,n,n")

        gen = ClozeGenerator(setopts, maxfields)
        fields, full, total = gen.generate(items, formstr, keys)

        print(fields, full, total)

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
        text = soup.getText("\n")  # will need to be updated for bs4
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

setOpts = [[1,1,1], ["y","y","y","y"]]
maxfields = 20
data1 = """
Physical Layer
Data Link Layer
Network Layer
Transport Layer
Session Layer
Presentation Layer
Application Layer
"""
data2 = """
In the [[oc1::seven-layer]] OSI model of [[oc2::computer networking]], the network layer is layer 3. The network layer is responsible for [[oc3::packet forwarding]] including routing through [[oc4::intermediate routers]].
"""

data3 = """
<ul>
  <li>Coffee</li>
  <li>Tea
    <ul>
      <li>Black tea</li>
      <li>Green tea</li>
    </ul>
  </li>
  <li>Milk</li>
</ul>
"""
cloze = ClozeOverlapper(data1)

print(cloze.add(data1))
print(cloze.add(data2))
print(cloze.add(data3))