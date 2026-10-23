// Generated from include/modules/base/itemshop/shop.2.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  await r.write("<input type=\"hidden\" id=\"mode\" name=\"mode\" value=\"shop\">\r\n<input type=\"hidden\" id=\"command\" name=\"command\" value=\"menu\">\r\n<input type=\"hidden\" name=\"shoptype\" value=\"");
  await r.write(r.text(r.get(s, "shop")));
  await r.write("\">");
  r.imports(s, "itemshop");
  await r.write("<div class=\"cmd_row\">\r\n<div class=\"glow_buttons grey forbidden\" style=\"margin:10px 0 0 0;width:335px;height:25px;text-align:center;\">\r\n<span class=\"white\" style=\"line-height:25px;\">当前类别：");
  await r.write(r.text((await r.call("strip_tags", r.get(r.get(s, "shop_tag_list"), r.get(s, "shop"))))));
  await r.write("</span>\r\n</div>\r\n</div><div class=\"cmd_row\">");
  if (r.truth((await r.call("is_array", r.get(s, "itemdata"))))) {
    {
      const a0 = r.copy(r.get(s, "itemdata"));
      for (const [k0, v0] of r.entries(a0)) {
        r.assign(r.slot(s, ["idata"]), v0);
        if (r.truth(r.get(r.get(s, "idata"), "sid"))) {
          r.assign(r.slot(s, ["tmp_name"]), (await r.module("itemmain", "parse_itmname_words", r.get(r.get(s, "idata"), "item"), 1)));
          r.assign(r.slot(s, ["tmp_hint"]), (r.text((r.text((r.text((r.text(r.get(r.get(s, "idata"), "itmk_words")) + r.text("<span class='grey'> | </span>"))) + r.text(r.get(r.get(s, "idata"), "itme")))) + r.text("<span class='grey'> | </span>"))) + r.text(r.get(r.get(s, "idata"), "itms"))));
          if (r.truth(r.get(r.get(s, "idata"), "itmsk_words"))) {
            r.update(r.slot(s, ["tmp_hint"]), "concat", (r.text("<span class='grey'> | </span>") + r.text(r.get(r.get(s, "idata"), "itmsk_words"))));
          }
          r.assign(r.slot(s, ["tmp_hint_price"]), (r.text((r.text((r.text("<span class=\"grey\"> | </span>价:") + r.text(r.get(r.get(s, "idata"), "price")))) + r.text("<span class=\"grey\"> | </span>数:"))) + r.text(r.get(r.get(s, "idata"), "num"))));
          await r.write("<div class=\"cmd_positioner corpse_cmd multi_cont\">\r\n<div class=\"corpse_info\">\r\n<span>");
          await r.write(r.text(r.get(s, "tmp_name")));
          await r.write("</span><span style=\"float:right;margin-right:10px;\">");
          await r.write(r.text(r.get(s, "tmp_hint_price")));
          await r.write("</span>\r\n</div>\r\n<input type=\"button\" id=\"shop_option_");
          await r.write(r.text(r.get(r.get(s, "idata"), "sid")));
          await r.write("\" class=\"corpse_cmd glow_buttons white\" style=\"position:absolute;\" value=\"\" title=\"");
          await r.write(r.text(r.get(s, "tmp_hint")));
          await r.write("\" \r\nonclick=\"$('command').value='");
          await r.write(r.text(r.get(r.get(s, "idata"), "sid")));
          await r.write("';shop_selected_display(");
          await r.write(r.text(r.get(r.get(s, "idata"), "sid")));
          await r.write(");\">\r\n</div>");
        }
      }
    }
  }
  await r.write("</div><div class=\"cmd_row\">\r\n<div class=\"cmd_positioner explore_cmd glow_buttons grey forbidden\" style=\"width:140px;height:33px;\">\r\n<span style=\"line-height:33px;\">购买数量：<input type=\"number\" style=\"width:45px\" name=\"buynum\" value=\"1\" min=\"1\" max=\"999\"></span>\r\n</div><div class=\"cmd_positioner explore_cmd\" style=\"width:194px;height:35px;\" >\r\n<input type=\"button\" class=\"cmd_button explore_cmd glow_buttons cyan b\" id=\"z\" value=\"确认购买\" \r\nonclick=\"postCmd('gamecmd','command.php',this);\">\r\n</div>\r\n</div><div class=\"cmd_row\">\r\n<div class=\"cmd_positioner explore_cmd\" style=\"height:35px;\" >\r\n<input type=\"button\" class=\"cmd_button explore_cmd glow_buttons red b\" id=\"x\" value=\"离开商店\" \r\nonclick=\"$('command').value='menu';postCmd('gamecmd','command.php',this);\">\r\n</div><div class=\"cmd_positioner explore_cmd\" style=\"height:35px;\" >\r\n<input type=\"button\" class=\"cmd_button explore_cmd glow_buttons white b\" id=\"c\" value=\"返回列表\" \r\nonclick=\"$('command').value='shop';postCmd('gamecmd','command.php',this);\">\r\n</div>\r\n</div>");
return 1;
}
