API
===

``/`` (root)
++++++++++++
Primary route, static content (from ``public`` build directory) served here.

``/serverinfo``
+++++++++++++++
Access info about current db through nano.

``/auth/_session``
++++++++++++++++++
Access session calls.

``/data``
+++++++++
Access data from current db.

``/view``
+++++++++
Access specific view functions from current design doc.  Proxies access to ``api/_design/simpleshelfmobile/_view/global``.

``/getdocs``
++++++++++++
Get the database's data in bulk-load-ready format.

``/setdocs``
++++++++++++
Add documents to db using the `bulk docs API <https://docs.couchdb.org/en/stable/api/database/bulk-api.html#db-bulk-docs>`__.
