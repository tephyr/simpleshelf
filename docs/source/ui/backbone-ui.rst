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

Child views
-----------
- ``TagCloudView``: Show tag cloud; child of ``LibraryInfoView``
- ``BookListView``: Show list of books; child of ``LibraryInfoView``
- ``SpineView``: Show book title with link (using id) to individual book page
- ``SpineListView``: Show list of spines


Backbone models
+++++++++++++++

Book [Model]
------------
Complete info for a single book.

Spine [Model]
-------------
Title and ID for a book.  Used as the model behind the BookList collection.

SpineList [Collection: Spine]
-----------------------------
Collection of Spine models.  Different from BookList in that it uses the bare minimum Spine instead of the heavier Book model.

Populated differently by book list, author list, and tag cloud.  Must be able to load from different CouchDB views, with varying parameters.

Tag [Model]
-----------
An individual tag.

TagList [Collection: Tag]
-------------------------
Collection of Tag models.
