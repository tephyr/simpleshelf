Setup for developers
====================
Overview
++++++++
#. Build or install CouchDB.
#. Create & secure the database.
#. Install couchapp build tools.
#. Publish couchapp to database.

Steps
+++++
Secure the database
-------------------
simpleshelf expects the database to require authentication.

#. Use futon to add yourself as the CouchDB instance admin (see bottom right of the futon UI).
#. Use futon to add a user to the CouchDB instance (if you are already the admin, you can simply use that login).

   #. Open the database.
   #. Click the Security link at the top.
   #. If you are an admin, add your name to the admin's names list (``["myname"]``).
#. Test by going to the main page.

   There should now be a login link, if you have logged out of futon.  Otherwise, you will see the first page.
