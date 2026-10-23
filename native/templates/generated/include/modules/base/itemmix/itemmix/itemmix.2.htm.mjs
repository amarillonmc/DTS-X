// Generated from include/modules/base/itemmix/itemmix/itemmix.2.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  await r.write("<!--注意：如果合成提示(smartmix)模块存在，本文件是被跳过的！-->\r\n<input type=\"hidden\" name=\"mode\" id=\"mode\" value=\"itemmain\">\r\n<input type=\"hidden\" name=\"command\" id=\"command\" value=\"menu\">\r\n<div class=\"cmd_row\">\r\n<div class=\"cmd_positioner explore_cmd\" style=\"height:35px;\" >\r\n<input type=\"button\" class=\"cmd_button explore_cmd glow_buttons cyan b\" id=\"z\" value=\"合成\" \r\nonclick=\"$('command').value='itemmix';postCmd('gamecmd','command.php',this);\">\r\n</div><div class=\"cmd_positioner explore_cmd\" style=\"height:35px;\" >\r\n<input type=\"button\" class=\"cmd_button explore_cmd glow_buttons red b\" id=\"x\" value=\"返回\" \r\nonclick=\"postCmd('gamecmd','command.php',this);\">\r\n</div>\r\n</div>");
  if (r.truth((await r.call("is_array", (await r.call("range", 1, 6)))))) {
    {
      const a0 = r.copy((await r.call("range", 1, 6)));
      for (const [k0, v0] of r.entries(a0)) {
        r.assign(r.slot(s, ["packi"]), v0);
        await r.write("<div class=\"pack_row\">");
        if (r.truth(r.get(s, (r.text("itms") + r.text(r.get(s, "packi")))))) {
          await r.write("<input type=\"hidden\" id=\"mitm");
          await r.write(r.text(r.get(s, "packi")));
          await r.write("\" name=\"mitm");
          await r.write(r.text(r.get(s, "packi")));
          await r.write("\" value=\"0\">\r\n<div class=\"cmd_positioner pack_button pack_switch\">\r\n<div class=\"pack_button bg\"></div>\r\n<input type=\"button\" id=\"mitmtick");
          await r.write(r.text(r.get(s, "packi")));
          await r.write("\" class=\"pack_button glow_buttons white\" value=\"\" title=\"选择\"\r\nonclick=\"itemmix_switch(");
          await r.write(r.text(r.get(s, "packi")));
          await r.write(");\">\r\n</div><div class=\"pack_cell_eqp cmd_positioner\" style=\"height:35px;width:299px;\">");
          r.assign(r.slot(s, ["tmp_itmname"]), (await r.module("itemmain", "parse_itmname_words", r.get(s, (r.text("itm") + r.text(r.get(s, "packi")))), 1, 18)));
          r.assign(r.slot(s, ["tmp_itme"]), (await r.module("itemmain", "parse_itmnum_words", r.get(s, (r.text("itme") + r.text(r.get(s, "packi")))), 1)));
          r.assign(r.slot(s, ["tmp_itms"]), (await r.module("itemmain", "parse_itmnum_words", r.get(s, (r.text("itms") + r.text(r.get(s, "packi")))), 1)));
          await r.write("<input type=\"button\" \r\nclass=\"pack_cell_eqp glow_buttons white\" \r\nvalue=\"");
          await r.write(r.text(r.get(s, "tmp_itmname")));
          await r.write(" / ");
          await r.write(r.text(r.get(s, "tmp_itme")));
          await r.write(" / ");
          await r.write(r.text(r.get(s, "tmp_itms")));
          await r.write("\"\r\nonclick=\"itemmix_switch(");
          await r.write(r.text(r.get(s, "packi")));
          await r.write(");\">\r\n</div>");
        } else {
          await r.write("<div class=\"pack_cell_eqp glow_buttons forbidden darkgrey\" style=\"width:335px\">无道具</div>");
        }
        await r.write("</div>");
      }
    }
  }
  r.assign(r.slot(s, ["uip", "display", "log_height"]), 242);
return 1;
}
