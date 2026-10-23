// Generated from include/modules/base/itemshop/itemshop_cmd.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  r.imports(s, "itemshop");
  if (r.truth((await r.module("itemshop", "check_in_shop_area", r.get(s, "pls"))))) {
    await r.write("<input type=\"button\" class=\"cmdbutton\" id=\"t\" value=\"[T]商店\" onclick=\"$('command').value='special';$('subcmd').name='sp_cmd';$('subcmd').value='sp_shop';postCmd('gamecmd','command.php');this.disabled=true;\">");
  }
return 1;
}
