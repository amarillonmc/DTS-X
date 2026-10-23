// Generated from include/modules/extra/instance/instance10_rogue/skill963/show_shopnpc_items.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  r.imports(s, "cardbase");
  r.assign(r.slot(s, ["shopnpc_shopitem"]), (await r.module("skill963", "get_shopnpc_shopitem", r.get(s, "edata"))));
  await r.write("<input type=\"hidden\" name=\"mode\" value=\"shopnpc\">\r\n<input type=\"hidden\" id=\"command\" name=\"command\" value=\"\">\r\n你可以购买以下道具：<br><br>");
  if (r.truth((await r.call("is_array", r.get(s, "shopnpc_shopitem"))))) {
    {
      const a0 = r.copy(r.get(s, "shopnpc_shopitem"));
      for (const [k0, v0] of r.entries(a0)) {
      r.assign(r.slot(s, ["i"]), k0);
        r.assign(r.slot(s, ["v"]), v0);
        r.assign(r.slot(s, ["k"]), r.add(r.get(s, "i"), 1));
        await r.write("<input type=\"button\" style=\"width:40px\" value=\"购买\" onclick=\"$('command').value='buy");
        await r.write(r.text(r.get(s, "k")));
        await r.write("';postCmd('gamecmd','command.php');this.disabled=true;\">");
        if (r.truth(r.equal(r.get(r.get(s, "v"), "1"), "R"))) {
          r.assign(r.slot(s, ["desc"]), (await r.module("item_recipe", "show_recipe", r.get(r.get(s, "v"), "4"))));
        } else {
          if (r.truth((r.truth(r.identical((await r.call("strpos", r.get(r.get(s, "v"), "1"), "VO1")), 0)) && r.truth(((r.get(r.get(s, "cards"), r.get(r.get(s, "v"), "4")) != null)))))) {
            r.assign(r.slot(s, ["cn"]), (await r.call("str_replace", "\"", "&quot;", r.get(r.get(r.get(s, "cards"), r.get(r.get(s, "v"), "4")), "name"))));
            r.assign(r.slot(s, ["desc"]), (r.text((r.text("装有卡牌「") + r.text(r.get(s, "cn")))) + r.text("」")));
          } else {
            r.assign(r.slot(s, ["desc"]), (await r.module("itemmain", "parse_itmuse_desc", r.get(r.get(s, "v"), "0"), r.get(r.get(s, "v"), "1"), r.get(r.get(s, "v"), "2"), r.get(r.get(s, "v"), "3"), r.get(r.get(s, "v"), "4"))));
          }
        }
        r.assign(r.slot(s, ["itmsk_words"]), (await r.module("itemmain", "parse_itmsk_words", r.get(r.get(s, "v"), "4"), 1)));
        await r.write("<span ");
        if (r.truth(r.get(s, "desc"))) {
          await r.write("style=\"cursor:pointer;\" title=\"");
          await r.write(r.text(r.get(s, "desc")));
          await r.write("\"");
        }
        await r.write(">\r");
        await r.write(r.text(r.get(r.get(s, "v"), "0")));
        await r.write("/");
        await r.write(r.text((await r.module("itemmain", "parse_itmk_words", r.get(r.get(s, "v"), "1")))));
        await r.write("/");
        await r.write(r.text(r.get(r.get(s, "v"), "2")));
        await r.write("/");
        await r.write(r.text(r.get(r.get(s, "v"), "3")));
        await r.write("/");
        await r.write(r.text((r.truth(r.get(s, "itmsk_words")) ? (r.text(r.get(s, "itmsk_words")) + r.text("/")) : "")));
        await r.write("价:");
        await r.write(r.text(r.get(r.get(s, "v"), "5")));
        await r.write("</span><br>");
      }
    }
  }
  await r.write("<br>\r\n<input type=\"button\" class=\"cmdbutton\" id=\"x\" value=\"[X]返回\" onclick=\"$('command').value='shopback'; postCmd('gamecmd','command.php');this.disabled=true;\">");
return 1;
}
