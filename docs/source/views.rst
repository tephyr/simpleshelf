=====
Views
=====

* all_
* authors_
* books_
* books_by_tags_
* recent-items_
* by_status_
* tags_

  * raw view just returns sum of all tags
  * use ``?group=true`` to see all tags with their individual counts (aka **group by**)

Useful queries
++++++++++++++
* `What books am I currently reading? <http://localhost:5984/simpleshelf/_design/simpleshelf/_view/by_status?key=[%22read%22,%20%22reading%22]>`__ (``doc.status.read==reading``)
* `What books mentioned Singapore? <http://localhost:5984/simpleshelf/_design/simpleshelf/_view/by_tags?key=%22mentioned.singapore%22>`__ (``"mentioned.singapore" in doc.tags``)
* `All tags, with count <http://localhost:5984/simpleshelf/_design/simpleshelf/_view/tags?group=true>`__
* `Books finished, sorted by year <http://localhost:5984/simpleshelf/_design/simpleshelf/_view/by_year>`__, as spine list
* Backup of all books: book_backup_

  * Call this from the command line: ``curl -P GET "$URL" > simpleshelf.backup.json``

    Always put ``$URL`` in quotes, to prevent '?' or '"' from being interpreted by the shell.

.. _all: http://localhost:5984/simpleshelf/_design/simpleshelf/_view/all
.. _authors: http://localhost:5984/simpleshelf/_design/simpleshelf/_view/authors
.. _books: http://localhost:5984/simpleshelf/_design/simpleshelf/_view/books
.. _recent-items: http://localhost:5984/simpleshelf/_design/simpleshelf/_view/recent-items
.. _by_status: http://localhost:5984/simpleshelf/_design/simpleshelf/_view/by_status
.. _tags: http://localhost:5984/simpleshelf/_design/simpleshelf/_view/tags
.. _books_by_tags: http://localhost:5984/simpleshelf/_design/simpleshelf/_view/books_by_tags
.. _book_backup: http://localhost:5984/simpleshelf/_design/simpleshelf/_view/all?key=%22book%22&include_docs=true
