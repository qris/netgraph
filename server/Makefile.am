# -*- Makefile -*-

AM_CFLAGS        = ${regular_CFLAGS}
AM_CPPFLAGS      = ${regular_CPPFLAGS} \
	-I${srcdir}/../iptables/include \
	-I${srcdir}/../iptables/iptables \
	${kinclude_CPPFLAGS} \
	${JSON_GLIB_CFLAGS} ${GLIB_CFLAGS} ${CGICC_CFLAGS}

netgraph_server_SOURCES = netgraph-server.cc FCgiIO.cpp
netgraph_server_CFLAGS  = ${AM_CFLAGS}
netgraph_server_LDADD   = \
	${builddir}/../iptables/libxtables/libxtables.la -lm \
	${JSON_GLIB_LIBS} ${GLIB_LIBS} ${CGICC_LIBS} -lfcgi++ -lfcgi

if ENABLE_IPV4
netgraph_server_CFLAGS  += -DENABLE_IPV4
netgraph_server_LDADD   += ${builddir}/../iptables/libiptc/libip4tc.la \
	${builddir}/../iptables/extensions/libext4.a
endif

if ENABLE_IPV6
netgraph_server_CFLAGS  += -DENABLE_IPV6
netgraph_server_LDADD   += ${builddir}/../iptables/libiptc/libip6tc.la \
	${builddir}/../iptables/extensions/libext6.a
endif

sbin_PROGRAMS = netgraph-server
