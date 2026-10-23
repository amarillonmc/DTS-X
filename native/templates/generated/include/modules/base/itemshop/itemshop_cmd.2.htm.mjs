// Generated from include/modules/base/itemshop/itemshop_cmd.2.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  r.imports(s, "itemshop");
  if (r.truth((await r.module("itemshop", "check_in_shop_area", r.get(s, "pls"))))) {
    await r.write("<div class=\"cmd_positioner common_cmd\">\r\n<input type=\"button\" class=\"cmd_button common_cmd glow_buttons white\" id=\"c\" value=\"商店\" \r\nonclick=\"$('command').value='special';$('subcmd').name='sp_cmd';$('subcmd').value='sp_shop';postCmd('gamecmd','command.php',this);\">\r\n</div>");
  }
return 1;
}
