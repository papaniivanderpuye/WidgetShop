%define _binaries_in_noarch_packages_terminate_build 0
%define _binary_filedigest_algorithm 0
%define _source_filedigest_algorithm 0
%define _source_payload 0
%define _binary_payload 0
%define group Comcast/TES

%define name @name@
%define version @version@
%define release @release@

Summary: @rpm.summary@
Name: %{name}
Version: %{version}
Release: %{release}
Group: Comcast/TES
BuildArch: @rpm.arch@
AutoReq: 0
Source: @rpm.source@
License: Commercial
Requires: python >= 2.7.5, python-requests >= 2.6.0, MySQL-python >= 1.2.5, python27-pip >= 8.1.2
Requires: python-sqlalchemy >= 0.9.8, python-flask >= 0.10.1
Requires: mod_wsgi >= 3.4, uwsgi-plugin-python2, python27-pycountry >= 18.2.23
Requires: python27-us >= 1.0.0, python27-mysql-connector >= 2.1.6
Requires: openldap-devel >= 2.4.44, python-ldap >= 2.4.15
BuildRoot: %{_tmppath}/%{name}-%{version}-%{release}


%description
%{name}


%prep
%setup -q

%install
rm -rf %{buildroot}
mkdir -p -m0755 %{buildroot}/app/platform/autokpi/app
mkdir -p -m0755 %{buildroot}/app/platform/autokpi/app/api
mkdir -p -m0755 %{buildroot}/app/platform/autokpi/app/etc
mkdir -p -m0755 %{buildroot}/app/platform/autokpi/app/server
mkdir -p -m0755 %{buildroot}/app/platform/autokpi/app/static
mkdir -p -m0755 %{buildroot}/var/log
mkdir -p -m0755 %{buildroot}/usr/sbin
mkdir -p -m0755 %{buildroot}/usr/share/man/man8
mkdir -p -m0755 %{buildroot}/etc/httpd/vhosts.d
mkdir -p -m0755 %{buildroot}/app/platform/autokpi/bin
cp -rp api/* %{buildroot}/app/platform/autokpi/app/api
cp -rp etc/* %{buildroot}/app/platform/autokpi/app/etc
cp -rp server/* %{buildroot}/app/platform/autokpi/app/server
cp -rp bin/* %{buildroot}/app/platform/autokpi/bin
cp -rp static/* %{buildroot}/app/platform/autokpi/app/static
cp -p etc/welcome.conf %{buildroot}/app/platform/autokpi/bin/welcome.conf
cp -p bin/autokpictl %{buildroot}/usr/sbin/autokpictl
cp -p etc/autokpictl.man %{buildroot}/usr/share/man/man8/autokpictl.8
cp -p etc/autokpi.conf %{buildroot}/etc/httpd/vhosts.d/autokpi.conf
touch %{buildroot}/var/log/autokpi.log
chmod 777 %{buildroot}/var/log/autokpi.log
chmod 744 %{buildroot}/app/platform/autokpi/bin/post_install
chmod 744 %{buildroot}/app/platform/autokpi/bin/autokpictl

%clean
rm -rf %{buildroot}


%files
%defattr(-,root,root)
/etc/httpd/vhosts.d/autokpi.conf
/app/platform/autokpi/app/
/app/platform/autokpi/bin/
%attr(777,root,root) %ghost /var/log/autokpi.log
%attr(755,root,root) %ghost /usr/sbin/autokpictl
%attr(644,root,root) %ghost /usr/share/man/man8/autokpictl.8.gz
