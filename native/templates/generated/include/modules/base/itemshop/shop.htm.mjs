// Generated from include/modules/base/itemshop/shop.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  await r.write("想购买什么物品？<br><br>\r\n<input type=\"hidden\" name=\"mode\" value=\"shop\">\r\n<input type=\"hidden\" name=\"shoptype\" value=\"");
  await r.write(r.text(r.get(s, "shop")));
  await r.write("\">\r\n<input type=\"hidden\" id=\"command\" name=\"command\" value=\"menu\">\r\n<input type=\"hidden\" id=\"buynum\" name=\"buynum\" value=\"1\">\r\n<input type=\"button\" class=\"cmdbutton\" value=\"放弃购买\" onclick=\"$('command').value='menu';postCmd('gamecmd','command.php');this.disabled=true;\">\r\n&nbsp;\r\n<input type=\"button\" class=\"cmdbutton\" value=\"返回列表\" onclick=\"$('command').value='shop';postCmd('gamecmd','command.php');this.disabled=true;\">\r\n<br><br>");
  if (r.truth((await r.call("is_array", r.get(s, "itemdata"))))) {
    {
      const a0 = r.copy(r.get(s, "itemdata"));
      for (const [k0, v0] of r.entries(a0)) {
        r.assign(r.slot(s, ["idata"]), v0);
        if (r.truth(r.get(r.get(s, "idata"), "sid"))) {
          r.assign(r.slot(s, ["idsid"]), r.get(r.get(s, "idata"), "sid"));
          r.imports(s, "itemshop");
          r.assign(r.slot(s, ["buynumflag"]), (r.truth((await r.call("in_array", r.get(s, "shop"), r.get(s, "shop_allow_input_num")))) ? 1 : 0));
          await r.write("<div class=\"shoprow\">\r\n<div class=\"leftbox\">");
          r.assign(r.slot(s, ["tmp_shop_button_id"]), (await r.call("substr", (await r.call("md5", r.get(r.get(s, "idata"), "item"))), 0, 8)));
          await r.write("<input type=\"button\" class=\"cmdbutton\" style=\"min-width:50px;height:32px;\" value=\"购买\" id=\"buy_");
          await r.write(r.text(r.get(s, "tmp_shop_button_id")));
          await r.write("\" onclick=\"$('command').value='");
          await r.write(r.text(r.get(s, "idsid")));
          await r.write("';");
          if (r.truth(r.get(s, "buynumflag"))) {
            await r.write("$('buynum').value=$('buynum");
            await r.write(r.text(r.get(s, "idsid")));
            await r.write("').value;");
          }
          await r.write("postCmd('gamecmd','command.php');this.disabled=true;\">\r\n</div>");
          if (r.truth(r.equal(r.get(r.get(s, "idata"), "itmk"), "R"))) {
            r.assign(r.slot(s, ["desc"]), (await r.module("item_recipe", "show_recipe", r.get(r.get(s, "idata"), "itmsk"))));
          } else {
            r.assign(r.slot(s, ["desc"]), (await r.module("itemmain", "parse_itmuse_desc", r.get(r.get(s, "idata"), "item"), r.get(r.get(s, "idata"), "itmk"), r.get(r.get(s, "idata"), "itme"), r.get(r.get(s, "idata"), "itms"), r.get(r.get(s, "idata"), "itmsk"))));
          }
          await r.write("<div ");
          if (r.truth(r.get(s, "buynumflag"))) {
            await r.write("style=\"width:185px;\"");
          }
          await r.write(" ");
          if (r.truth(r.get(s, "desc"))) {
            await r.write("style=\"cursor:pointer;\" title=\"");
            await r.write(r.text(r.get(s, "desc")));
            await r.write("\"");
          }
          await r.write(">\r");
          await r.write(r.text(r.get(r.get(s, "idata"), "item")));
          await r.write("/");
          await r.write(r.text(r.get(r.get(s, "idata"), "itmk_words")));
          await r.write("/");
          await r.write(r.text(r.get(r.get(s, "idata"), "itme")));
          await r.write("/");
          await r.write(r.text(r.get(r.get(s, "idata"), "itms")));
          if (r.truth(r.get(r.get(s, "idata"), "itmsk_words"))) {
            await r.write("/");
            await r.write(r.text(r.get(r.get(s, "idata"), "itmsk_words")));
          }
          await r.write("/价:");
          await r.write(r.text(r.get(r.get(s, "idata"), "price")));
          await r.write("/数:");
          await r.write(r.text(r.get(r.get(s, "idata"), "num")));
          await r.write("</div>");
          if (r.truth(r.get(s, "buynumflag"))) {
            await r.write("<div class=\"rightbox\">\r\n<input type=\"number\" id=\"buynum");
            await r.write(r.text(r.get(s, "idsid")));
            await r.write("\" style=\"width:60px\" value=\"1\" min=\"1\" max=\"1000\"><span class=\"inputunit\">个</span>\r\n</div>");
          }
          await r.write("</div>\t");
        }
      }
    }
  }
return 1;
}
