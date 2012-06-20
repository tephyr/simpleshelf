#!/usr/bin/env python
# -*- coding: utf-8 -*-

from couchdbkit import Server

from simpleshelf_schema import Book


class Importer(object):
    def __init__(self):
        self.server = None
        self.db = None

    def prep_connection(self, uri, db_name):
        # create server object
        self.server = Server(uri=uri)

        # create database
        self.db = self.server.get_or_create_db(db_name)

        # associate local objects to the db
        Book.set_db(self.db)

