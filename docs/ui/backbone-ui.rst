==============
Backbone.js UI
==============

Pages
+++++
- `Primary page <http://localhost:5984/simpleshelf/_design/simpleshelf/library.html>`__

  - Book list
  - Author list
  - Tag cloud

- Books page

  Shows all the info for a specific book.  Accessible by clean URL.

- Reports page

Backbone layout
+++++++++++++++

Primary page views
------------------

- ``LibraryInfoView``: Show basic info about entire library; based on Library [collection]
- ``TagCloudView``: Show tag cloud; child of ``LibraryInfoView``
