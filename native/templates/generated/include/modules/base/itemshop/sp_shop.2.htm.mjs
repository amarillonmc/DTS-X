// Generated from include/modules/base/itemshop/sp_shop.2.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  await r.write("<input type=\"hidden\" id=\"mode\" name=\"mode\" value=\"special\">\r\n<input type=\"hidden\" id=\"command\" name=\"command\" value=\"menu\">\r\n<div class=\"cmd_row\">\r\n<div class=\"glow_buttons grey forbidden\" style=\"margin:10px 0 0 0;width:335px;height:25px;text-align:center;\">\r\n<span class=\"white\" style=\"line-height:25px;\">想购买什么类别的物品？</span>\r\n</div>\r\n</div>");
  r.assign(r.slot(s, ["list"]), (await r.module("itemshop", "get_shop_tag_list")));
  if (r.truth((await r.call("is_array", r.get(s, "list"))))) {
    {
      const a0 = r.copy(r.get(s, "list"));
      for (const [k0, v0] of r.entries(a0)) {
      r.assign(r.slot(s, ["sid"]), k0);
        r.assign(r.slot(s, ["scmt"]), v0);
        await r.write("<div class=\"cmd_row\">\r\n{loop ");
        await r.write(r.text(r.get(s, "shop_tag_list")));
        await r.write(" ");
        await r.write(r.text(r.get(s, "si")));
        await r.write(" ");
        await r.write(r.text(r.get(s, "sn")));
        await r.write("}\r\n<div class=\"cmd_positioner itm_cmd\">\r\n<div class=\"itm_cmd_info\" style=\"height:60px;\">\r\n<div class=\"itm_bg\" style=\"background-image: url('img/itm/");
        await r.write(r.text(r.get(s, "si")));
        await r.write(".png');\"></div><div class=\"itm_name\">\r");
        await r.write(r.text(r.get(s, "sn")));
        await r.write("</div>\r\n</div>\r\n<input type=\"button\" class=\"cmd_button itm_cmd_button glow_buttons white\" \r\nonclick=\"$('command').value='shop");
        await r.write(r.text(r.get(s, "si")));
        await r.write("';postCmd('gamecmd','command.php',this);\">\r\n</div>");
      }
    }
  }
  await r.write("</div><div class=\"cmd_row\">\r\n<div class=\"cmd_positioner explore_cmd zx_cmd\">\r\n<input type=\"button\" class=\"cmd_button explore_cmd glow_buttons red b\" style=\"font-size:12pt;\" id=\"x\" value=\"离开商店\" \r\nonclick=\"postCmd('gamecmd','command.php',this);\">\r\n</div>\r\n</div>");
return 1;
}
