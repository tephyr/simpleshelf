Installation
============
Using Docker Compose
++++++++++++++++++++
If you run multiple instances of SimpleShelf on a machine, rename the network to keep it isolated from other instances (``NETWORK_NAME``) and the project name (``--project-name``).

Pre-requisites
--------------
#. Install `Docker App <https://github.com/docker/app>`__.
#. Pick either ``simpleshelfapp-dev.dockerapp`` or ``simpleshelfapp-prod.dockerapp``.
#. Absolute paths must be used, so set ``WORK_DIR`` to an *absolute* value.

Process (development)
---------------------
#. Choose which settings to modify (see last section of ``simpleshelfapp-dev.dockerapp``).
#. Build the images::

     docker-app render simpleshelfapp-dev --set WORK_DIR=$PWD | docker-compose -f - build

#. Run the app::

     docker-app render simpleshelfapp-dev --set WORK_DIR=$PWD | docker-compose -f - up

Process (production)
--------------------
#. Choose which settings to modify (see last section of ``simpleshelfapp-prod.dockerapp``).
#. Choose the project name.
#. Create the Docker Compose file either by writing it to disk, or by running it through Docker Compose::

     # Example production instance.
     docker-app render simpleshelfapp-prod \
        --set WORK_DIR=$PWD \
        --set NODE_PORTS=9191:8080 \
        --set NETWORK_NAME=simpleshelf-network-prod | docker-compose --project-name simpleshelfproduction01 -f - up
