#!/usr/bin/env python
#coding:utf-8

import doit
import sh


def task_docs():
    """
    Build documentation using sphinx.
    """

    def cmd_build():
        """
        Build docs
        """
        # change to ``docs/``
        sh.cd('docs')
        # run ``make html``
        output = sh.make('html')
        sh.cd('..')

    return {'actions': [(cmd_build, )]}

def task_couchapp_push():
    """
    Push a couchapp to a CouchDB server
    """

    config = {"app": doit.get_var('app', '')}
    return {
        'actions': ['couchapp push simpleshelf/ %s' % config.get('app')]
    }
