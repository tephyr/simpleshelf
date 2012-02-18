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

Validation for type===book
++++++++++++++++++++++++++
- ``title``:    string|null
- ``author``:   string|null
- ``isbn``:     string|null
- ``status``:   Object

  - ``read``:       null, any value from book.status.read_
  - ``ownership``:  null, any value from book.status.ownership_
  - any other statuses from user

- ``tags``:     Array of strings
- ``urls``:     Object|null

  - any key/value pairs, like ``{"openlibrary": "/works/OL76984W", "powells": "http://powells.com/path/to/book}``

- ``notes``:    Array of objects

  element definition::

    {date: yyyy-mm-dd, public: Bool (default false), text: string}

- ``activity``: Array of objects

  element definition::

    {date: yyyy-mm-dd, action: text}

  examples::

    {date: '2012-01-01', action: 'book.started'}
    {date: '2012-01-08', action: 'book.finished'}

Constants
+++++++++
Constants in CouchDB are tricky: CouchDB does not allow access to other documents when saving one, to preserve atomicity.  Any list of acceptable values must be available to the validation routine and the creation code.  The following lists are allowable sets of values for particular fields in the schema.

book.activity.action
--------------------
- book.started
- book.finished

book.status.read
----------------
- to.read
- reading
- finished

book.status.ownership
---------------------
- personal
- library
- on.loan
- loaned.out
- on.order
