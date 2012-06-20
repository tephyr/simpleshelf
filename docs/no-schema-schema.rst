================
No-schema schema
================

Required fields
+++++++++++++++
These fields are required for any document.

- ``type``: book, etc.
- ``docstate``: any of these

  - ``new``: record freshly added
  - ``search_waiting``: queued for next search run
  - ``search_inprogress``: in queue for active search
  - ``search_performed``: search was completed on this book; details in fields TBD

  .. note:: ``docstate`` may be superseded by book/activity/action logging.

Validation for type===book
++++++++++++++++++++++++++
- ``title``:    string|null
- ``author``:   string|null **should this be an array?**
- ``publisher``: string|null
- ``isbn``:     string|null
- ``public``:   Boolean, defaults to ``true``
- ``status``:   Object

  - ``read``:       ``null`` | any value from `book/status/read`_
  - ``ownership``:  ``null`` | any value from `book/status/ownership`_
  - user-defined statuses, in the form {``statusName``: ``statusValue``}

- ``tags``:     Array of strings
- ``urls``:     Object | ``null``

  - any key/value pairs, like ``{"openlibrary": "/works/OL76984W", "powells": "http://powells.com/path/to/book}``

- ``notesPublic``:  string
- ``notesPrivate``: string

  Both ``notes*`` are strings of arbitrary length; notesPrivate will never be published.

- ``activities``: Array of ``activity`` objects

  element definition::

    {date: yyyy-mm-dd, action: text}

  examples::

    {date: '2012-01-01T08:00:00', action: 'book.added'}
    {date: '2012-01-01', action: 'book.started'}
    {date: '2012-01-08', action: 'book.finished'}

Constants
+++++++++
Constants in CouchDB are tricky: CouchDB does not allow access to other documents when saving one, to preserve atomicity.  Any list of acceptable values must be available to the validation routine and the creation code.  The following lists are allowable sets of values for particular fields in the schema.

book/activities/action
----------------------
- book.added
- book.read.started
- book.read.finished
- book.read.stopped
- search.requested
- search.finished

book/status/read
----------------
- to.read (*adds book.read.queued to actions*)
- reading (*adds book.read.started to actions*)
- finished (*adds book.read.finished to actions*)
- abandoned (*adds book.read.stopped to actions*)
- reference

book/status/ownership
---------------------
- personal
- library
- on.loan
- loaned.out
- on.order
