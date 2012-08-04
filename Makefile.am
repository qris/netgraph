# -*- Makefile -*-

AM_CFLAGS        = ${regular_CFLAGS}
AM_CPPFLAGS      = ${regular_CPPFLAGS} -I${top_builddir}/include -I${top_srcdir}/include ${kinclude_CPPFLAGS}

netgraph_SOURCES  = netgraph.c
netgraph_CFLAGS   = ${AM_CFLAGS}
# netgraph_LDADD    = iptables/extensions/libext.a
netgraph_LDADD    = iptables/libxtables/libxtables.la

sbin_PROGRAMS    = netgraph
