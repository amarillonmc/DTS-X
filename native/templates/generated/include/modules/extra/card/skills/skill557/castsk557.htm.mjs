// Generated from include/modules/extra/card/skills/skill557/castsk557.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  await r.write("<input type=\"hidden\" id=\"mode\" name=\"mode\" value=\"command\">\r\n<input type=\"hidden\" id=\"command\" name=\"command\" value=\"itm");
  await r.write(r.text(r.get(r.get(s, "theitem"), "itmn")));
  await r.write("\">\r\n<input type=\"hidden\" id=\"skill557_choice\" name=\"skill557_choice\" value=\"arf\">\r\n<span class=\"gold b\">“马有四条腿，可以穿两双鞋子。”</span><br><br>你要将<span class=\"yellow b\">");
  await r.write(r.text(r.get(r.get(s, "theitem"), "itm")));
  await r.write("</span>装备到哪个位置？<br><br> \r\n<input type=\"button\" class=\"cmdbutton\" value=\"前腿\" onclick=\"$('skill557_choice').value='ara';postCmd('gamecmd','command.php');this.disabled=true;\">\r\n<input type=\"button\" class=\"cmdbutton\" value=\"后腿\" onclick=\"$('skill557_choice').value='arf';postCmd('gamecmd','command.php');this.disabled=true;\">\r\n<input type=\"button\" class=\"cmdbutton\"  id=\"x\" value=\"[X]返回\" onclick=\"$('command').value='menu'; postCmd('gamecmd','command.php');this.disabled=true;\">");
return 1;
}
