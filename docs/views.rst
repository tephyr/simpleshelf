=====
Views
=====

* all_
* authors_
* books_
* recent-items_
* by_status_

Useful queries
++++++++++++++
* `What books am I currently reading? <http://localhost:5984/simpleshelf/_design/simpleshelf/_view/by_status?key=[%22read%22,%20%22reading%22]>`__ (``doc.status.read==reading``)
* `What books mentioned Singapore? <http://localhost:5984/simpleshelf/_design/simpleshelf/_view/by_tags?key=%22mentioned.singapore%22>`__ (``"mentioned.singapore" in doc.tags``)

.. _all: http://localhost:5984/simpleshelf/_design/simpleshelf/_view/all
.. _authors: http://localhost:5984/simpleshelf/_design/simpleshelf/_view/authors
.. _books: http://localhost:5984/simpleshelf/_design/simpleshelf/_view/books
.. _recent-items: http://localhost:5984/simpleshelf/_design/simpleshelf/_view/recent-items
.. _by_status: http://localhost:5984/simpleshelf/_design/simpleshelf/_view/by_status
