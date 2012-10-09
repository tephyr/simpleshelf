Security
========
Some notes on CouchDB_'s security policy:

- A server admin must be added after installing CouchDB_; otherwise, it will be in *admin party* mode, which allows *anyone* to access any part of the server (and all of its databases).
- Users must be added to a global database: ``/_users``.

  - This database may not exist when CouchDB is first installed.
  - This is the only place to define users.

The following instructions assume that the simpleshelf database is on a CouchDB server that is shared, and needs to be protected by CouchDB's security.  If the CouchDB server is local (on your machine, or otherwise secured to your satisfaction), then **no setup is necessary**.

Server security
+++++++++++++++
#. Add a server admin.
#. Add the ``_users`` database.
#. Add a user to the ``_users`` database, using the format available in ``security/user_demo.json``.

  To add the demo user, upload user_demo.json to the server.
  
  To add another user, change the following::
  
    _id      : "org.couchdb.user:$USERNAME"
    name     : "$USERNAME"
    roles    : ["$ROLE1", "$ROLE2"]
    password : "$PASSWORD"

  with the ``$USERNAME/$PASSWORD/$ROLE1/etc.`` values of your choosing.
  
  .. note:: The password is only in clear-text when uploaded to the server; once CouchDB receives it, it will be hashed automatically.
  
4. In the server settings, set ``couch_httpd_auth.require_valid_user`` to ``true``.

  In Futon:
  
  - click "Tools/Configuration"
  - find the ``couch_httpd_auth`` section
  - find the ``require_valid_user`` option
  - if not already set to "true", double-click the value & set it to ``true``

5. To force basic authentication (currently the only way to allow a login without having an external page), set ``httpd.WWW-Authenticate`` to ``Basic realm="CouchDB"`` (the realm name does not matter, as long as it exists).

Database security
+++++++++++++++++
These instructions must be followed for each simpleshelf database on a CouchDB server.

1. Add or choose a user as database admin (this user can be the server admin).
2. Add a ``_security`` document (in Futon, click the "Security" top-level link).

  .. note:: The ``_security`` document will **not** be replicated, so be sure to add it if you copy a simpleshelf database from another server.
  
3. For a database-level admin, add the username to the ``Admins:Names`` list, **OR** add their roles to the ``Admins:Roles`` list.
4. For each user, either add their usernames to the ``Members:Names`` list, **OR** add their roles to the ``Members:Roles`` list.

  .. note:: The default role for the demo user is "demo".  The demo user can view but not add or edit books.

5. Once the database-level security is set (meaning that at least 1 non-admin is specified by username or role), **no unauthenticated users** can see the database.
6. Logout, log back in as one of the users, and verify the security.

.. warning:: Known issue: logging out as one user, and logging back in as another, will maintain CouchDB's authentication as the previous user.  To simulate a "normal" login, restart the browser.

Reference
+++++++++
- `Security Features Overview <http://wiki.apache.org/couchdb/Security_Features_Overview>`__
- `Setting up an Admin account <http://wiki.apache.org/couchdb/Setting_up_an_Admin_account>`__
- `How to create users via script <http://wiki.apache.org/couchdb/How_to_create_users_via_script>`__
    
.. _couchdb: http://couchdb.apache.org/
