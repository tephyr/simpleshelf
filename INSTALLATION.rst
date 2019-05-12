Installation
============
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
