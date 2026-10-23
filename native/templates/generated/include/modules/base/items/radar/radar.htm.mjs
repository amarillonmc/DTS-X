// Generated from include/modules/base/items/radar/radar.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  r.imports(s, "radar", "npc", "map");
  r.assign(r.slot(s, ["tmp_height"]), r.multiply(r.add((await r.call("count", r.get(s, "plsinfo"))), 1), 20));
  await r.write("<div id=\"scroll-pane-radarpage\" class=\"gscroll\" style=\"width:720px;height:");
  await r.write(r.text(r.get(s, "tmp_height")));
  await r.write("px;\">\r\n<table style=\"min-width:720px\" class=\"radar\">\r\n<tr>\r\n<td class=\"b2\" width=\"120px\"></td>");
  if (r.truth((await r.call("is_array", r.get(s, "radar_tplist"))))) {
    {
      const a0 = r.copy(r.get(s, "radar_tplist"));
      for (const [k0, v0] of r.entries(a0)) {
        r.assign(r.slot(s, ["ni"]), v0);
        await r.write("<td class=\"b2\">");
        await r.write(r.text(r.get(r.get(s, "typeinfo"), r.get(s, "ni"))));
        await r.write("</td>");
      }
    }
  }
  await r.write("</tr>");
  if (r.truth((await r.call("is_array", r.get(s, "plsinfo"))))) {
    {
      const a1 = r.copy(r.get(s, "plsinfo"));
      for (const [k1, v1] of r.entries(a1)) {
      r.assign(r.slot(s, ["plsi"]), k1);
        r.assign(r.slot(s, ["plsn"]), v1);
        await r.write("<tr>\r\n<td class=\"b2\">");
        await r.write(r.text(r.get(s, "plsn")));
        await r.write("</td>");
        if (r.truth((await r.call("is_array", r.get(s, "radar_tplist"))))) {
          {
            const a2 = r.copy(r.get(s, "radar_tplist"));
            for (const [k2, v2] of r.entries(a2)) {
              r.assign(r.slot(s, ["ni"]), v2);
              await r.write("<td class=\"b3\">");
              if (r.truth((await r.call("is_array", r.get(r.get(s, "radardata"), r.get(s, "plsi")))))) {
                await r.write("<span ");
                if (r.truth(r.equal(r.get(s, "plsi"), r.get(s, "pls")))) {
                  await r.write("class=\"yellow b\"");
                }
                await r.write(">");
                if (r.truth((!r.truth((!r.truth(r.get(r.get(r.get(r.get(s, "radardata"), r.get(s, "plsi")), r.get(s, "ni")), "namelist"))))))) {
                  await r.write("<a title=\"");
                  await r.write(r.text(r.get(r.get(r.get(r.get(s, "radardata"), r.get(s, "plsi")), r.get(s, "ni")), "namelist")));
                  await r.write("\"><span class=\"grey\">[</span>&nbsp;");
                }
                await r.write(r.text(r.get(r.get(r.get(r.get(s, "radardata"), r.get(s, "plsi")), r.get(s, "ni")), "num")));
                if (r.truth((!r.truth((!r.truth(r.get(r.get(r.get(r.get(s, "radardata"), r.get(s, "plsi")), r.get(s, "ni")), "namelist"))))))) {
                  await r.write("&nbsp;<span class=\"grey\">]</span></a>");
                }
                await r.write("</span>");
              } else {
                if (r.truth(r.equal("x", r.get(r.get(s, "radardata"), r.get(s, "plsi"))))) {
                  await r.write("<span class=\"red b\">×</span>");
                } else {
                  if (r.truth(r.equal("?", r.get(r.get(s, "radardata"), r.get(s, "plsi"))))) {
                    await r.write("<span class=\"darkgrey\">??</span>");
                  } else {
                    await r.write("<span>ER</span>");
                  }
                }
              }
              await r.write("</td>");
            }
          }
        }
        await r.write("</tr>");
      }
    }
  }
  await r.write("</table>\r\n</div>");
return 1;
}
