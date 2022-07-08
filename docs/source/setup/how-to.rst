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
    ./run npm:outdated:fe

    # Add/update dependencies
    ./run npm:install:fe PACKAGENAME@">=semver" --save # or --save-dev

Alternate method, accessing the container directly::

    ./run shell:fe

    # Run all npm commands directly.  Current working directory is the frontend root.

Enable source maps for browser code
+++++++++++++++++++++++++++++++++++
Either add a ``"debug": true`` to ``frontend/config/default.json``, or run the ``appWatch`` gulp task::

    ./run shell:fe

    npx gulp appWatch


.. _python: https://python.org/
.. _sphinx: https://www.sphinx-doc.org/
