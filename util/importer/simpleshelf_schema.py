#!/usr/bin/env python
# -*- coding: utf-8 -*-

"""
"Schema" for converting python objects to couchdb documents.
"""

from couchdbkit import *


class Book(Document):
    type         = StringProperty()
    title        = StringProperty()
    author       = StringProperty()
    isbn         = StringProperty()
    publisher    = StringProperty()
    public       = BooleanProperty()
    status       = DictProperty() # read, ownership
    tags         = ListProperty()
    urls         = DictProperty()
    notesPublic  = StringProperty()
    notesPrivate = StringProperty()
    activities   = ListProperty() # Array of ``activity`` objects
    # {date: yyyy-mm-dd, action: text}

