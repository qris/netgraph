/*
 * Netgraph -- network data collection and graphing, server component
 * Author: Chris Wilson <chris+netgraph@qwirx.com>
 *
 * Based on: iptables -- IP firewall administration for kernels with
 * firewall table (aimed for the 2.3 kernels)
 *
 * Author: Paul.Russell@rustcorp.com.au and mneuling@radlogic.com.au
 *
 * Based on the ipchains code by Paul Russell and Michael Neuling
 *
 * (C) 2000-2002 by the netfilter coreteam <coreteam@netfilter.org>:
 * 		    Paul 'Rusty' Russell <rusty@rustcorp.com.au>
 * 		    Marc Boucher <marc+nf@mbsi.ca>
 * 		    James Morris <jmorris@intercode.com.au>
 * 		    Harald Welte <laforge@gnumonks.org>
 * 		    Jozsef Kadlecsik <kadlec@blackhole.kfki.hu>
 *
 *	This program is free software; you can redistribute it and/or modify
 *	it under the terms of the GNU General Public License as published by
 *	the Free Software Foundation; either version 2 of the License, or
 *	(at your option) any later version.
 *
 *	This program is distributed in the hope that it will be useful,
 *	but WITHOUT ANY WARRANTY; without even the implied warranty of
 *	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *	GNU General Public License for more details.
 *
 *	You should have received a copy of the GNU General Public License
 *	along with this program; if not, write to the Free Software
 *	Foundation, Inc., 675 Mass Ave, Cambridge, MA 02139, USA.
 */

#include <stdio.h>
#include <stdlib.h>
#include <errno.h>
#include <string.h>
#include <iptables.h>

#include <glib-object.h>
#include <json-glib/json-glib.h>

/*
static int
list_entries(const xt_chainlabel chain, int rulenum, int verbose,
	int numeric, int expanded, int linenumbers, 
	struct xtc_handle *handle)
{
	int found = 0;
	unsigned int format;
	const char *this;

	format = FMT_OPTIONS;
	if (!verbose)
		format |= FMT_NOCOUNTS;
	else
		format |= FMT_VIA;

	if (numeric)
		format |= FMT_NUMERIC;

	if (!expanded)
		format |= FMT_KILOMEGAGIGA;

	if (linenumbers)
		format |= FMT_LINENUMBERS;

	for (this = iptc_first_chain(handle);
	     this;
	     this = iptc_next_chain(handle)) {
		const struct ipt_entry *i;
		unsigned int num;

		if (chain && strcmp(chain, this) != 0)
			continue;

		if (found) printf("\n");

		if (!rulenum)
			print_header(format, this, handle);
		i = iptc_first_rule(this, handle);

		num = 0;
		while (i) {
			num++;
			if (!rulenum || num == rulenum)
				print_firewall(i,
					       iptc_get_target(i, handle),
					       num,
					       format,
					       handle);
			i = iptc_next_rule(i, handle);
		}
		found = 1;
	}

	errno = ENOENT;
	return found;
}
*/

int
main(int argc, char *argv[])
{
	int ret;
	const char *table = "filter";
	const char *chain = NULL;
	struct xtc_handle *handle = NULL;
	
	g_type_init();

	iptables_globals.program_name = "iptables";
	ret = xtables_init_all(&iptables_globals, NFPROTO_IPV4);
	if (ret < 0) {
		fprintf(stderr, "%s/%s Failed to initialize xtables\n",
				iptables_globals.program_name,
				iptables_globals.program_version);
				exit(1);
	}
#if defined(ALL_INCLUSIVE) || defined(NO_SHARED_LIBS)
	init_extensions();
	init_extensions4();
#endif

	xtables_load_ko(xtables_modprobe_program, false);
	handle = iptc_init(table);
	if (!handle)
	{
		xtables_error(VERSION_PROBLEM,
			   "can't initialize iptables table `%s': %s",
			   table, iptc_strerror(errno));
	}
	
	JsonBuilder *builder = json_builder_new();
	json_builder_begin_object(builder);

	json_builder_set_member_name(builder, "app");
	json_builder_add_string_value(builder, "https://github.com/qris/netgraph");

	json_builder_set_member_name(builder, "version");
	json_builder_begin_array(builder);
	json_builder_add_int_value(builder, 1);
	json_builder_add_int_value(builder, 1);
	json_builder_end_array(builder);
	
	// ret = list_entries(chain, handle);

	json_builder_end_object(builder);

	if (ret)
	{
		ret = iptc_commit(handle);
		iptc_free(handle);
	}
	else
	{
		if (errno == EINVAL) {
			fprintf(stderr, "iptables: %s. "
					"Run `dmesg' for more information.\n",
				iptc_strerror(errno));
		} else {
			fprintf(stderr, "iptables: %s.\n",
				iptc_strerror(errno));
		}
		if (errno == EAGAIN) {
			exit(RESOURCE_PROBLEM);
		}
	}

	JsonGenerator *gen = json_generator_new();
	JsonNode * root = json_builder_get_root(builder);
	json_generator_set_root(gen, root);
	gchar *str = json_generator_to_data(gen, NULL);

	json_node_free(root);
	g_object_unref(gen);
	g_object_unref(builder);
	
	puts(str);

	exit(!ret);
}
