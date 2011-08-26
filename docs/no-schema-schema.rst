================
No-schema schema
================

Required fields
---------------
These fields are required for any document.

- ``type``: book, etc.
- ``docstate``: any of these

  - ``new``: record freshly added
  - ``search_waiting``: queued for next search run
  - ``search_inprogress``: in queue for active search
  - ``search_performed``: search was completed on this book; details in fields TBD

Validation for type===book
--------------------------
- ``title``:    string|null
- ``author``:   string|null
- ``isbn``:     string|null
- ``finished``: date|null (yyyy-mm-dd format)
- ``status``:   Object

  - ``read``:       null, "to.read", "reading", "finished"
  - ``ownership``:  null, "personal", "library", "on.loan", "loaned.out", "on.order"
  - any other statuses from user

- ``tags``: Array
- ``urls``:     Object|null

  - any key/value pairs, like ``{"openlibrary": "/works/OL76984W", "powells": "http://powells.com/path/to/book}``

- ``notes``:    Array

  - elements are {``date``: yyyy-mm-dd, ``public``: Bool (default false), ``text``: string}
