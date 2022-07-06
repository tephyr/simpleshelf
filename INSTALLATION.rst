Installation
============
Simpleshelf uses Docker Compose and a ``run`` shell script to build the development and production versions.

Prerequisites
+++++++++++++
- Docker_, v20.10 or later
- Docker Compose plugin, v2.2 or later.

Concepts
++++++++
The idea behind the compose file, Docker file, overrides and ``.env`` is to reduce the amount of changes necessary to the build files, and *confine all local changes to the .env*.  While this does increase the complexity of the configuration files, it keeps the changes confined to the ``.env`` file, and *whether you wish to enable the override file* (with a simple copy to ``.yml`` extension to enable).

Summary
-------
* Production usage

  * Update the ``.env``.

* Development usage

  * Live updates to the front-end?  Enable the override.
  * Update the ``.env``.

.. note:: This section's ideas, and the Docker/Docker Compose layout/``run`` script, are courtesy of `Nick Janetakis <https://nickjanetakis.com>`__, and cribbed from `An example Node + Docker app`__ with his gracious permission and my many thanks.

__ docker-node-example_

Development
+++++++++++
To develop both the client-side code (single page application) and the server-side code, enable the ``docker-compose.override.yml`` file (by copying it and removing the ``.example`` extension).  Otherwise, the front-end code *will* be built, but *will not* be updated on any further changes.

Not enabling the override file will *not cause any issues* when developing the *server* code.

Overall steps
-------------
#. Copy ``.env.example`` to ``.env``.
#. Update variables in ``.env``.
#. Copy ``docker-compose.override.yml.example`` to ``docker-compose.override.yml`` (**optional**).
#. Build & run system: ``docker compose up --build``.

Production
++++++++++
**TODO**


.. _docker: https://docker.com/
.. _docker-node-example: https://github.com/nickjj/docker-node-example
