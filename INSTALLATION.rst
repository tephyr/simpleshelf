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

.. note:: This section's ideas, and the Docker/Docker Compose layout/``run`` script, are courtesy of `Nick Janetakis <https://nickjanetakis.com>`__, and cribbed from with his gracious permission and my many thanks.  His example app is here__.

__ docker-node-example_

Development
+++++++++++
To develop both the client-side code (single page application) and the server-side code, enable the ``docker-compose.override.yml`` file (by copying it and removing the ``.example`` extension).  Otherwise, the front-end code *will* be built, but *will not* be updated on any further changes.

Not enabling the override file will *not cause any issues* when developing the *server* code.

Production
++++++++++



.. _docker: https://docker.com/
.. _docker-node-example: https://github.com/nickjj/docker-node-example

.. note:: The following is deprecated.

Using Docker Compose
++++++++++++++++++++
If you run multiple instances of SimpleShelf on a machine, rename *both* the **network** (``NETWORK_NAME``) *and* the **project name** (``--project-name``) to keep it isolated from other instances.

Pre-requisites
--------------
#. Pick either ``simpleshelfapp-dev.dockerapp`` or ``simpleshelfapp-prod.dockerapp``.
#. Absolute paths must be used, so set ``WORK_DIR`` to an *absolute* value.

Process (development)
---------------------
#. Choose which settings to modify (see last section of ``simpleshelfapp-dev.dockerapp``).
#. Build the images::

     docker-app render simpleshelfapp-dev --set WORK_DIR=$PWD | docker-compose -f - build
     # Append --pull to build command to get latest images.

#. Run the app::

     docker-app render simpleshelfapp-dev --set WORK_DIR=$PWD | docker-compose -f - up

Process (production)
--------------------
#. Choose which settings to modify (see last section of ``simpleshelfapp-prod.dockerapp``).
#. Choose the project name.
#. Build the production image::

     docker -f .docker/simpleshelf-node-front.production.dockerfile build
     # Append --pull to build command to get latest images.

#. Create & run the Docker Compose file (either by writing it to disk, or building it dynamically through Docker App)::

     # Example production instance, dynamically generated
     docker-app render simpleshelfapp-prod \
        --set WORK_DIR=$PWD \
        --set NODE_PORTS=9191:8080 \
        --set NETWORK_NAME=simpleshelf-network-prod | docker-compose --project-name simpleshelfproduction01 -f - up

     # Example of creating a docker-compose file, then running it separately
     docker-app render simpleshelfapp-prod \
        --set WORK_DIR=$PWD \
        --set NODE_PORTS=9191:8080 \
        --set NETWORK_NAME=simpleshelf-network-prod > docker-compose-simpleshelf-network-prod.yml

     docker-compose --project-name simpleshelfproduction01 -f docker-compose-simpleshelf-network-prod.yml up

.. note:: Starting the app from scratch may require Docker to pull in all the necessary images; you may want to build, pulling the latest images first, before running the "up" command.
