# -*- Makefile -*-

AM_CFLAGS        = ${regular_CFLAGS}
AM_CPPFLAGS      = ${regular_CPPFLAGS} -I${top_builddir}/include \
	-I${top_srcdir}/iptables/include \
	${kinclude_CPPFLAGS} \
	${JSON_GLIB_CFLAGS} ${GLIB_CFLAGS} ${CGICC_CFLAGS}

netgraph_server_SOURCES = netgraph-server.cc
netgraph_server_CFLAGS  = ${AM_CFLAGS}
netgraph_server_LDADD   = iptables/libxtables/libxtables.la -lm \
	${JSON_GLIB_LIBS} ${GLIB_LIBS} ${CGICC_LIBS}

if ENABLE_IPV4
netgraph_server_CFLAGS  += -DENABLE_IPV4
netgraph_server_LDADD   += iptables/libiptc/libip4tc.la iptables/extensions/libext4.a
endif

if ENABLE_IPV6
netgraph_server_CFLAGS  += -DENABLE_IPV6
netgraph_server_LDADD   += iptables/libiptc/libip6tc.la iptables/extensions/libext6.a
endif

sbin_PROGRAMS = netgraph-server
