// Generated from include/modules/extra/attr/blessstone/use_blessstone.2.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  await r.write("<input type=\"hidden\" id=\"mode\" name=\"mode\" value=\"item\">\r\n<input type=\"hidden\" id=\"command\" name=\"command\" value=\"menu\">\r\n<input type=\"hidden\" name=\"usemode\" value=\"blessstone\">\r\n<input type=\"hidden\" name=\"itmp\" value=\"");
  await r.write(r.text(r.get(r.get(s, "theitem"), "itmn")));
  await r.write("\">\r\n<div class=\"cmd_row\">\r\n<div class=\"glow_buttons grey forbidden\" style=\"margin:10px 0 0 0;width:335px;height:25px;text-align:center;\">\r\n<span class=\"white\" style=\"line-height:25px;\">请选择想要强化的装备道具</span>\r\n</div>\r\n</div><div class=\"cmd_row\">");
  if (r.truth((await r.call("is_array", (await r.call("range", 1, 6)))))) {
    {
      const a0 = r.copy((await r.call("range", 1, 6)));
      for (const [k0, v0] of r.entries(a0)) {
        r.assign(r.slot(s, ["i"]), v0);
        if (r.truth((r.truth((await r.module("itemmain", "check_in_itmsk", "Z", r.get(s, (r.text("itmsk") + r.text(r.get(s, "i"))))))) && r.truth(r.identical((await r.call("strpos", r.get(s, (r.text("itm") + r.text(r.get(s, "i")))), "宝石』")), false))))) {
          await r.write("<div class=\"cmd_positioner common_cmd zx_cmd\">");
          r.assign(r.slot(s, ["tmp_itmname"]), (await r.module("itemmain", "parse_itmname_words", r.get(s, (r.text("itm") + r.text(r.get(s, "i")))), 1, 18)));
          r.assign(r.slot(s, ["tmp_itme"]), (await r.module("itemmain", "parse_itmnum_words", r.get(s, (r.text("itme") + r.text(r.get(s, "i")))), 1)));
          r.assign(r.slot(s, ["tmp_itms"]), (await r.module("itemmain", "parse_itmnum_words", r.get(s, (r.text("itms") + r.text(r.get(s, "i")))), 1)));
          await r.write("<input type=\"button\" class=\"cmd_button common_cmd glow_buttons white\" id=\"");
          await r.write(r.text((await r.call("substr", r.get(r.get(s, "item_hotkey_id_list"), r.get(s, "i")), 0, 1))));
          await r.write("\" value=\"");
          await r.write(r.text(r.get(s, "tmp_itmname")));
          await r.write(" / ");
          await r.write(r.text(r.get(s, "tmp_itme")));
          await r.write(" / ");
          await r.write(r.text(r.get(s, "tmp_itms")));
          await r.write("\" \r\nonclick=\"$('command').value='itm");
          await r.write(r.text(r.get(s, "i")));
          await r.write("';postCmd('gamecmd','command.php',this);\">\r\n</div>");
        }
      }
    }
  }
  await r.write("</div><div class=\"cmd_row\">\r\n<div class=\"cmd_positioner common_cmd zx_cmd\">\r\n<input type=\"button\" class=\"cmd_button common_cmd glow_buttons red b\" id=\"x\" value=\"返回\" \r\nonclick=\"$('mode').value='command';postCmd('gamecmd','command.php',this);\">\r\n</div>\r\n</div>");
return 1;
}
