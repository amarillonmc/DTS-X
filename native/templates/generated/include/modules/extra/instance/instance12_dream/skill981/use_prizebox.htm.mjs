// Generated from include/modules/extra/instance/instance12_dream/skill981/use_prizebox.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  r.imports(s, "cardbase");
  await r.write("<input type=\"hidden\" id=\"mode\" name=\"mode\" value=\"command\">\r\n<input type=\"hidden\" id=\"command\" name=\"command\" value=\"itm");
  await r.write(r.text(r.get(r.get(s, "theitem"), "itmn")));
  await r.write("\">\r\n<input type=\"hidden\" id=\"pbx_choice\" name=\"pbx_choice\" value=\"0\">");
  r.assign(r.slot(s, ["pbx_itemlist"]), (await r.module("skill981", "get_prizebox_itemlist", r.get(r.get(s, "theitem"), "itme"), r.get(r.get(s, "theitem"), "itmsk"))));
  await r.write("你可以选择并获得以下道具中的一个：<br><br>");
  if (r.truth((await r.call("is_array", r.get(s, "pbx_itemlist"))))) {
    {
      const a0 = r.copy(r.get(s, "pbx_itemlist"));
      for (const [k0, v0] of r.entries(a0)) {
      r.assign(r.slot(s, ["k"]), k0);
        r.assign(r.slot(s, ["v"]), v0);
        r.assign(r.slot(s, ["id"]), r.add(r.get(s, "k"), 1));
        r.assign(r.slot(s, ["skilldesc_id"]), (r.text("skilldesc_show_") + r.text(r.get(s, "id"))));
        await r.write("<input type=\"button\" class=\"cmdbutton\" style=\"min-width:50px;height:28px;\" value=\"获得\" onclick=\"$('pbx_choice').value='");
        await r.write(r.text(r.get(s, "id")));
        await r.write("';postCmd('gamecmd','command.php');this.disabled=true;\"> ");
        if (r.truth(r.equal(r.get(r.get(s, "v"), "itmk"), "R"))) {
          r.assign(r.slot(s, ["desc"]), (await r.module("item_recipe", "show_recipe", r.get(r.get(s, "v"), "itmsk"))));
        } else {
          if (r.truth((r.truth(r.identical((await r.call("strpos", r.get(r.get(s, "v"), "itmk"), "VO1")), 0)) && r.truth(((r.get(r.get(s, "cards"), r.get(r.get(s, "v"), "itmsk")) != null)))))) {
            r.assign(r.slot(s, ["cn"]), (await r.call("str_replace", "\"", "&quot;", r.get(r.get(r.get(s, "cards"), r.get(r.get(s, "v"), "itmsk")), "name"))));
            r.assign(r.slot(s, ["desc"]), (r.text((r.text("装有卡牌「") + r.text(r.get(s, "cn")))) + r.text("」")));
          } else {
            r.assign(r.slot(s, ["desc"]), (await r.module("itemmain", "parse_itmuse_desc", r.get(r.get(s, "v"), "itm"), r.get(r.get(s, "v"), "itmk"), r.get(r.get(s, "v"), "itme"), r.get(r.get(s, "v"), "itms"), r.get(r.get(s, "v"), "itmsk"))));
          }
        }
        r.assign(r.slot(s, ["itmsk_words"]), (await r.module("itemmain", "parse_itmsk_words", r.get(r.get(s, "v"), "itmsk"), 1)));
        await r.write("<span ");
        if (r.truth(r.get(s, "desc"))) {
          await r.write("style=\"cursor:pointer;\" title=\"");
          await r.write(r.text(r.get(s, "desc")));
          await r.write("\"");
        }
        await r.write(">\r");
        await r.write(r.text(r.get(r.get(s, "v"), "itm")));
        await r.write("/");
        await r.write(r.text((await r.module("itemmain", "parse_itmk_words", r.get(r.get(s, "v"), "itmk")))));
        await r.write("/");
        await r.write(r.text(r.get(r.get(s, "v"), "itme")));
        await r.write("/");
        await r.write(r.text(r.get(r.get(s, "v"), "itms")));
        await r.write(r.text((r.truth(r.get(s, "itmsk_words")) ? (r.text("/") + r.text(r.get(s, "itmsk_words"))) : "")));
        await r.write("</span>");
        if (r.truth((r.truth((r.truth(r.equal(r.get(r.get(s, "v"), "itmk"), "VS")) && r.truth((!r.truth((!r.truth(r.get(r.get(s, "v"), "itmsk")))))))) && r.truth((!r.equal(r.get(r.get(s, "v"), "itmsk"), 983)))))) {
          await r.write("  \r\n<input type=\"button\" class=\"cmdbutton\" style=\"min-width:50px;\" value=\"查看\" onmouseenter=\"$('");
          await r.write(r.text(r.get(s, "skilldesc_id")));
          await r.write("').style.display='block';\" onmouseleave=\"$('");
          await r.write(r.text(r.get(s, "skilldesc_id")));
          await r.write("').style.display='none';\">\r\n<div style=\"position:relative;\">\r\n<div id=\"");
          await r.write(r.text(r.get(s, "skilldesc_id")));
          await r.write("\" class=\"skilldesc_show\" style=\"display:none;position:absolute;background-color:#000000;\">");
          await r.write(r.text((await r.module("item_randskills", "parse_skcore_skilldesc", r.get(r.get(s, "v"), "itmsk")))));
          await r.write("</div>\r\n</div>\r\n<br>");
        }
        await r.write("<br>");
      }
    }
  }
  await r.write("<br>\r\n<input type=\"button\" class=\"cmdbutton\"  id=\"x\" value=\"[X]返回\" onclick=\"$('command').value='menu'; postCmd('gamecmd','command.php');this.disabled=true;\">");
  if (r.truth((await r.call("defined", "MOD_SKILL985")))) {
    (await r.include(r.template("MOD_SKILL985_SKCMD985"), s));
  }
return 1;
}
