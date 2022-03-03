====================
Backbone interaction
====================

Events
++++++

SpineListView
-------------
- **bind**

  - collection

    - add -> this.addOne
    - reset -> this.render

  - spineview:selected -> this.bookSelected

- **trigger**

  - spinelistview:bookSelected

SpineView
---------
- **bind**

  - model

	- remove -> view.remove
	- change -> this.render
	- destroy -> this.remove

- **trigger**

  - spineview:selected {bookId:}, in ``bookSelected``

TagCloudView
------------
- **bind**

  - model

	- change -> this.render
	- destroy -> this.remove
	- tag:highlight -> this.highlightIfMatch

  - tagview:selected -> this.tagSelected

- **trigger**

  - tagcloud:tagselected, {tag:}, in ``tagSelected`` & ``resetTags``

TagView
-------
- **trigger**

  - tagview:selected, {tag:}, in ``tagSelected``

