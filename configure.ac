AC_INIT([NetGraph], [1.1], [chris-netgraph@qwirx.com], [netgraph], [http://github.com/qris/netgraph])
AM_INIT_AUTOMAKE([-Wall -Werror foreign])
AC_PROG_CC
AC_PROG_CXX
AM_PROG_LIBTOOL

AC_ARG_ENABLE([ipv4],
        AS_HELP_STRING([--disable-ipv4], [Do not build iptables]),
        [enable_ipv4="$enableval"], [enable_ipv4="yes"])
AC_ARG_ENABLE([ipv6],
        AS_HELP_STRING([--disable-ipv6], [Do not build ip6tables]),
        [enable_ipv6="$enableval"], [enable_ipv6="yes"])

AM_CONDITIONAL([ENABLE_IPV4], [test "$enable_ipv4" = "yes"])
AM_CONDITIONAL([ENABLE_IPV6], [test "$enable_ipv6" = "yes"])

PKG_CHECK_MODULES([GLIB], [glib-2.0])
PKG_CHECK_MODULES([JSON_GLIB], [json-glib-1.0])
PKG_CHECK_MODULES([CGICC], [cgicc])

AC_CONFIG_SUBDIRS([iptables server ])
AC_CONFIG_FILES([Makefile])
AC_OUTPUT
