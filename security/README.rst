=============
Security data
=============

For the demo database, the `_security.json` document must be uploaded (or added via Futon) to the simpleshelf database.  If it is not, or the `_security` document has no settings for admins & users, then the database will be world-writeable (no authentication necessary).

The information in `user_demo.json` must be added to the CouchDB server.  The password value will automatically be hashed & salted.

.. note:: Any user with a role of "demo" will have read-only access to the simpleshelf database, by virtue of a function within `simpleshelf/validate_doc_update.js`.
