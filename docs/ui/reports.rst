=======
Reports
=======

By year
+++++++
Show a ``SpineList`` of books by year, starting in descending year order, and ascending date order within each year. Each year should have a count of books.

Query: `_view/by_year <http://localhost:5984/simpleshelf/_design/simpleshelf/_view/by_year>`__

Parent view: ``AppView`` (``#items`` page section)

Superclass: ``ReportPresenterView``

View layout
-----------
::

  - ByYearReportPresenterView
    - SingleYearReportView (SpineListView)
      - SpineView


ByYearReportPresenterView
~~~~~~~~~~~~~~~~~~~~~~~~~
Parent of entire view, subclassed from ``ReportPresenterView``, launched when called from router for /reports/by_year.

Loops through data's unique years values to build ``SingleYearReportView``.

SingleYearReportView
~~~~~~~~~~~~~~~~~~~~
Represents single year of this report.  Subclass of ``SpineListView``; outputs SpineViews.
