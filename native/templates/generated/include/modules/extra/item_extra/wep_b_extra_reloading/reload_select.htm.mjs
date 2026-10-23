// Generated from include/modules/extra/item_extra/wep_b_extra_reloading/reload_select.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  await r.write("<input type=\"hidden\" id=\"mode\" name=\"mode\" value=\"command\">\r\n<input type=\"hidden\" id=\"command\" name=\"command\" value=\"itm");
  await r.write(r.text(r.get(r.get(s, "theitem"), "itmn")));
  await r.write("\">\r\n<input type=\"hidden\" id=\"subcmd\" name=\"subcmd\" value=\"normal\">\r\n你要如何使用<span class=\"yellow b\">");
  await r.write(r.text(r.get(r.get(s, "theitem"), "itm")));
  await r.write("</span>？<br><br> \r\n<input type=\"button\" class=\"cmdbutton\" id=\"z\" value=\"[Z]装填到弓上\" onclick=\"$('subcmd').value='extra_reloading';postCmd('gamecmd','command.php');this.disabled=true;\">\r\n<input type=\"button\" class=\"cmdbutton\" value=\"装备\" onclick=\"postCmd('gamecmd','command.php');this.disabled=true;\"> \r\n<br><br>\r\n<input type=\"button\" class=\"cmdbutton\" id=\"x\" value=\"[X]返回\" onclick=\"$('command').value='menu'; postCmd('gamecmd','command.php');this.disabled=true;\">");
return 1;
}
