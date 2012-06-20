#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
Import v1 (XML) version of simpleshelf datastore
"""

import argparse
from   xml.etree.ElementTree import ElementTree

from   unipath import Path

from   simpleshelf_schema import Book
from   simpleshelf_importer import Importer


class XmlImporter(object):
    """given a valid XML file from an older version of simpleshelf,
    pull all data into the new objects"""

    def __init__(self, xml_path, couchdb_uri, couchdb_name,
                 debug=False, verbosity=0):
        self.path_to_xml = Path(xml_path).expand()
        self.debug = debug
        self.verbosity = verbosity

        self.xml_store = None

        self.bad_books = [] # title of bad books
        self.good_books = 0 # counter for imported books

        self.importer = Importer()
        self.importer.prep_connection(uri=couchdb_uri,
                                      db_name=couchdb_name)

    def run(self):
        """do the hard work of parsing, reading, and adding all XML-based data
        to the new object model"""
        # parse the original file
        self._parse_xml()

        # show xml store's version
        print 'xml store version: %s' % self.xml_store.getroot().attrib['version']

        # pull out all statuses
        statuses_from_xml = {}
        for status_xml in self.xml_store.findall('statuses/status'):
            status_group = status_xml.attrib['name']
            statuses_from_xml[status_group] = {}
            for status_item_xml in status_xml.getiterator('item'):
                statuses_from_xml[status_group][status_item_xml.attrib['id']] = status_item_xml.text

        ## TODO: prep status objects
        #status_objects = {'Search': {'1': 'do not search',
                                     #'10': 'to search',
                                     #'20': 'searched, has results',
                                     #'30': 'searched, no results'}
                          #}

        #for k, v in statuses_from_xml.items():
            #status_group = k
            #status_objects[status_group] = {}
            #for kx, vx in v.items():
                #status_object = Status(group=status_group, name=vx, title=vx)
                #status_objects[status_group][kx] = status_object

        missing_status_groups = []
        # for each book in library/books
        for book_xml in self.xml_store.findall('books/book'):
            try:
                # make the book
                book = Book()
                book.type = 'book'
                book._id = uuid_fixer(book_xml.attrib['uid'])
                book.title = book_xml.attrib['title']
                book.public = book_xml.attrib['public'] == '1'
                book.isbn = book_xml.attrib['isbn'] or book_xml.attrib['isbnasinput']

                # add notes
                notes_xml = book_xml.find('notes')
                if notes_xml.text:
                    book.notesPublic = notes_xml.text

                # add or get the publisher
                publisher_xml = book_xml.find('publisher')
                if publisher_xml is not None:
                    book.publisher = publisher_xml.text

                # add the authors
                for author_xml in book_xml.getiterator('author'):
                    # set authors until all done, or one is primary
                    book.author = author_xml.text
                    if author_xml.attrib['primary'] == '1':
                        break

                ## add statuses
                #for status_on_book in book_xml.getiterator('status'):
                    #status_group = status_on_book.attrib['name']
                    #if status_group in status_objects.keys():
                        #specific_status = status_objects[status_group][status_on_book.attrib['value']]
                        ##book.statuses[status_group] = specific_status
                        #book.status[status_group] = specific_status
                    #else:
                        ## log it
                        #if status_group not in missing_status_groups:
                            #missing_status_groups.append(status_group)

                print(book.title)

                # save to couchdb
                book.save()
                self.good_books += 1
            except:
                self.bad_books.append(book_xml.attrib['title'])

        if len(self.bad_books) > 0:
            print 'THERE WERE %s IMPORT ERRORS!' % len(self.bad_books)
            for bad_book in self.bad_books:
                print bad_book

        # done adding, let's see what we have
        print('Book count: {0}'.format(self.good_books))
        print('Bad books: {0}'.format(len(self.bad_books)))
        print('Missing status groups: {0}'.format(len(missing_status_groups)))
        if len(missing_status_groups) > 0:
            print('\t{0}'.format(missing_status_groups))

    def _parse_xml(self):
        """parse a simpleshelf library stored in xml"""
        self.xml_store = ElementTree(file=self.path_to_xml)

def uuid_fixer(uuidvalue):
    """
    Strip unnecessary zeros from middle, if this value is too long
    to be a proper UUID.
    """
    if len(uuidvalue) == 40 and uuidvalue[20:28] == '0'*8:
        return uuidvalue[0:20] + uuidvalue[28:]
    else:
        return uuidvalue

def run():
    """run helper; sets up class & runs it"""
    usage = "usage: %prog [options]"
    parser = argparse.ArgumentParser(usage)
    parser.add_argument('-p', '--xml-path',
                        dest='xml_path',
                        help="full path to xml file")
    parser.add_argument('-u', '--couchdb-uri',
                        dest='couchdb_uri',
                        default='http://127.0.0.1:5984',
                        help="URI to couchdb instance")
    parser.add_argument('-n', '--db-name',
                        dest='db_name',
                        help='CouchDB target name')
    parser.add_argument("-d", "--debug",
                        dest="debug",
                        action="store_true",
                        help="debug mode")
    parser.add_argument("-v", "--verbose",
                        action="store_true", dest="verbose")
    args = parser.parse_args()

    xml_importer = XmlImporter(args.xml_path, args.couchdb_uri, args.db_name,
                               args.debug, args.verbose
                               )
    xml_importer.run()

if __name__ == '__main__':
    run()
