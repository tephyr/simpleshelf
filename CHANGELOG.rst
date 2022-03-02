Changelog
=========

All notable changes to this project will be documented in this file.

The format is based on `Keep a Changelog <https://keepachangelog.com/en/1.0.0/>`__.

[Unreleased]
++++++++++++

[2.0.3] - 2022-03-02
++++++++++++++++++++
Changed
-------
- Rearranged server code & configuration locations.
- Fixed frontend build on change.
- Fixed frontend code watch & browser sync.

[2.0.2] - 2022-02-19
++++++++++++++++++++
Changed
-------
- Properly launch the node server after preparing CouchDB.
- Used gulp tasks in server Dockerfile setup (see Dockerfile's ``app`` label).
- Change default exposed port to 8090.
- Copy frontend build output to server-accessible location, update server static file path.
- Use `pm2 <https://pm2.keymetrics.io/docs/usage/docker-pm2-nodejs/>`__'s Docker container binaries to start server. 

[2.0.1] - 2022-02-18
++++++++++++++++++++
Added
-----
- This changelog.

Changed
-------
- Upgraded node images to latest LTS (16.14.0).
- Removed version keys in ``package.json`` file (using this file to track versions).

[2.0.0] - 2022-02-18
++++++++++++++++++++
Changed
-------
Almost everything.  The Docker build and deployment system was upgraded to follow `Nick Janetakis <https://nickjanetakis.com>`__'s system (see `Installation <./INSTALLATION.rst>`__).

[1.2.0] - 2019-05-13
++++++++++++++++++++
This version used Docker App to create standalone development & production containers.  Docker App was discontinued.

.. note:: Version numbers are stored *in this file only*.
