// Generated from templates/default/map_display.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  r.imports(s, "sys", "map");
  r.assign(r.slot(s, ["map_display_config"]), (await r.module("map_display", "get_map_display_config")));
  r.assign(r.slot(s, ["bg"]), r.get(r.get(s, "map_display_config"), "background-image"));
  r.assign(r.slot(s, ["xnum"]), r.get(r.get(s, "map_display_config"), "x"));
  r.assign(r.slot(s, ["ynum"]), r.get(r.get(s, "map_display_config"), "y"));
  r.assign(r.slot(s, ["xt"]), r.get(r.get(s, "map_display_config"), "background-width"));
  r.assign(r.slot(s, ["xw"]), r.subtract((await r.call("round", r.divide(r.get(s, "xt"), r.get(s, "xnum")))), 1));
  r.assign(r.slot(s, ["yt"]), r.get(r.get(s, "map_display_config"), "background-height"));
  r.assign(r.slot(s, ["yh"]), r.subtract((await r.call("round", r.divide(r.get(s, "yt"), r.get(s, "ynum")))), 1));
  r.assign(r.slot(s, ["xrange"]), (await r.call("range", 0, r.get(s, "xnum"))));
  r.assign(r.slot(s, ["yrange"]), (await r.call("range", 0, r.get(s, "ynum"))));
  await r.write("<table id=\"map_display\" style=\"background-image:url('");
  await r.write(r.text(r.get(s, "bg")));
  await r.write("');background-size: ");
  await r.write(r.text(r.get(s, "xt")));
  await r.write("px ");
  await r.write(r.text(r.get(s, "yt")));
  await r.write("px;\">");
  if (r.truth((await r.call("is_array", r.get(s, "yrange"))))) {
    {
      const a0 = r.copy(r.get(s, "yrange"));
      for (const [k0, v0] of r.entries(a0)) {
        r.assign(r.slot(s, ["y"]), v0);
        await r.write("<tr>");
        if (r.truth((await r.call("is_array", r.get(s, "xrange"))))) {
          {
            const a1 = r.copy(r.get(s, "xrange"));
            for (const [k1, v1] of r.entries(a1)) {
              r.assign(r.slot(s, ["x"]), v1);
              if (r.truth((!r.truth(r.get(s, "y"))))) {
                await r.write("<td class=\"map\">");
                if (r.truth((!r.truth(r.get(s, "x"))))) {
                  await r.write("<div style=\"width:49px;height:49px\">坐标</div>");
                } else {
                  await r.write("<div style=\"width:");
                  await r.write(r.text(r.get(s, "xw")));
                  await r.write("px;height:50px\">");
                  await r.write(r.text(r.get(s, "x")));
                  await r.write("</div>");
                }
                await r.write("</td>");
              } else {
                r.assign(r.slot(s, ["now_ycoor"]), (await r.module("map_display", "map_display_y2coor", r.get(s, "y"))));
                await r.write("<td class=\"map\">");
                if (r.truth((!r.truth(r.get(s, "x"))))) {
                  await r.write("<div style=\"width:49px;height:");
                  await r.write(r.text(r.get(s, "yh")));
                  await r.write("px\">");
                  await r.write(r.text(r.get(s, "now_ycoor")));
                  await r.write("</div>");
                } else {
                  await r.write("<div style=\"width:");
                  await r.write(r.text(r.get(s, "xw")));
                  await r.write("px;height:");
                  await r.write(r.text(r.get(s, "yh")));
                  await r.write("px\">");
                  r.assign(r.slot(s, ["now_xycoor"]), (r.text((r.text(r.get(s, "now_ycoor")) + r.text("-"))) + r.text(r.get(s, "x"))));
                  if (r.truth((!r.truth((!r.truth(r.get(r.get(r.get(s, "map_display_config"), "xyinfo"), r.get(s, "now_xycoor")))))))) {
                    r.assign(r.slot(s, ["now_plsno"]), r.get(r.get(r.get(s, "map_display_config"), "xyinfo"), r.get(s, "now_xycoor")));
                    if (r.truth((await r.module("map_display", "map_display_check_pls_available", r.get(s, "now_plsno"))))) {
                      await r.write("<span class=\"");
                      await r.write(r.text((await r.module("map_display", "map_display_get_pls_color", r.get(s, "now_plsno")))));
                      await r.write("\">");
                      await r.write(r.text(r.get(r.get(s, "plsinfo"), r.get(s, "now_plsno"))));
                      await r.write("</span>\t");
                    }
                  }
                  await r.write("</div>");
                }
                await r.write("</td>");
              }
            }
          }
        }
        await r.write("</tr>");
      }
    }
  }
  await r.write("</table>");
return 1;
}
