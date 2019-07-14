#!/usr/bin/python2.7

import fabric.main
import fabric.api
import fabric.colors

RPM_NAME = 'autokpi-api'
UWSGI_INI = '/app/platform/autokpi/api/etc/autokpi-api.ini'
UWSGI_PID = '/tmp/autokpi-api.pid'

#####
# TODO: Commented out any db logic until migration mechanism is in place
#####

def qa():
    #fabric.api.env.migrations_tier = 'qa'
    #fabric.api.env.db_host = 'nadb-ch2-4q.sys.comcast.net'
    fabric.api.env.roledefs = {
        'api': ['autoapp-wc-1q.sys.comcast.net'],
        #'db': ['nadb-ch2-4q.sys.comcast.net'],
    }


def prod():
    #fabric.api.env.migrations_tier = 'production'
    #fabric.api.env.db_host = 'aaamsdb-wc-1d.sys.comcast.net'
    fabric.api.env.roledefs = {
        'web': ['autoapp-wc-1p.sys.comcast.net'],
        #'db': ['nadb-cmc-vip.io.comcast.net'],
    }

"""
API
"""
@fabric.api.roles('api')
def deploy_web():
    fabric.api.sudo('yum install -q -y %s' % RPM_NAME)


@fabric.api.roles('api')
def remove_web():
    fabric.api.sudo('yum erase -q -y %s' % RPM_NAME)


@fabric.api.roles('api')
def downgrade_web(version):
    fabric.api.sudo('yum downgrade -q -y %s-%s' % (RPM_NAME, version))


"""
Web
"""
@fabric.api.roles('web')
def deploy_web():
    fabric.api.sudo('yum install -q -y %s' % RPM_NAME)


@fabric.api.roles('web')
def remove_web():
    fabric.api.sudo('yum erase -q -y %s' % RPM_NAME)


@fabric.api.roles('web')
def downgrade_web(version):
    fabric.api.sudo('yum downgrade -q -y %s-%s' % (RPM_NAME, version))


"""
DB
"""
def deploy_db():
    print fabric.api.env.db_host
    with fabric.context_managers.lcd('db/mysql/'):
        fabric.api.local("mysql -h %s -u %s -p'%s' < create.sql" % (
                         fabric.api.env.db_host, 'root', '``1q2w3e'))
        fabric.api.local('/usr/bin/rake db:migrate RAILS_ENV=%s' %
                         fabric.api.env.migrations_tier)


def deploy():
    #fabric.api.execute(deploy_db)
    fabric.api.execute(deploy_web)
    fabric.api.execute(restart_apache)


def remove():
    fabric.api.execute(remove_web)
    fabric.api.execute(restart_apache)


def downgrade(version):
    fabric.api.execute(downgrade_web, version)
    fabric.api.execute(restart_apache)


@fabric.api.roles('api')
def restart_apache():
    fabric.api.sudo('sudo uwsgi --stop {}'.format(UWSGI_PID))
    fabric.api.sudo('service apachectl stop')
    fabric.api.sudo('service apachectl start')
    fabric.api.sudo('sudo uwsgi --ini {} --pidfile {}'.format(UWSGI_INI,
                                                              UWSGI_PID))


if __name__=="__main__":
    fabric.main.main()
