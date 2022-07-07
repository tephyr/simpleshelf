How to
======
Build the documentation
+++++++++++++++++++++++
#. Install Sphinx_.  Requires Python_.
#. From ``docs/``, run ``make html``.
#. View output in ``docs/build/html/``.


Update front-end libraries
++++++++++++++++++++++++++
From source root::

    # Show outdated dependencies
    ./run npm:outdated:frontend

    # Add/update dependencies
    ./run npm:install:frontend PACKAGENAME@">=semver" --save # or --save-dev

Alternate method, accessing the container directly::

    ./run shell:frontend

    # Run all npm commands directly.  Current working directory is the frontend root.

.. _python: https://python.org/
.. _sphinx: https://www.sphinx-doc.org/
