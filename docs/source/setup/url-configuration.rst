URL configuration
=================

Understanding _rewrite
++++++++++++++++++++++
The _rewrite directive is *only* used *if the original URL passes through it*.  In other words:

- this goes directly to the design document: http://localhost:5984/simpleshelf/_design/simpleshelfmobile/index.html
- this passes through ``_rewrite`` and goes *to the same design doc*: http://localhost:5984/simpleshelf/_design/simpleshelfmobile/_rewrite/index

To use both a virtual host (``vhost``) and a "direct" (non-vhost) connection to the design document, **both** must go through the _rewrite directive AND _rewrite must handle all references inside the design doc (``styles/``, ``code/``, etc.).

Steps
+++++
#. Set a name on the network for the database's server.

   Add ``simpleshelf-example`` as an alias to ``127.0.0.1`` to ``/etc/hosts``, or the same name to the server's address to the router configuration.

#. Test it.

   ``ping simpleshelf-example`` (should see a list of the expected IP address and timings)

#. Add an entry to your configuration file in the [vhosts]* section.

   This should point to the ``_rewrite`` data on the simpleshelf database's ``simpleshelfmobile`` design doc::

     [vhosts]
     simpleshelf-example:5984 = /simpleshelf/_design/simpleshelfmobile/_rewrite

#. Modify the ``_rewrites`` handler.

   ::

        {
            "from": "index",
            "to": "/index.html",
            "method": "GET",
            "query": ""
        }

#. Test by issuing a request to ``simpleshelf-local:5984/index``.

References
++++++++++
- `Pretty URLs with Cloudant <https://cloudant.com/blog/pretty-urls-with-cloudant/#.Vszqq4P6zys>`__
- `StackOverflow: Rewrite URLs with CouchDB <http://stackoverflow.com/questions/24874096/rewrite-urls-with-couchdb>`__
