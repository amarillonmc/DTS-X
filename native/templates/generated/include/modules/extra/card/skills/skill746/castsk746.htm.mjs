// Generated from include/modules/extra/card/skills/skill746/castsk746.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  await r.write("<input type=\"hidden\" name=\"mode\" value=\"special\">\r\n<input type=\"hidden\" id=\"command\" name=\"command\" value=\"skill746_special\">\r\n<input type=\"hidden\" id=\"subcmd\" name=\"subcmd\" value=\"castsk746\">\r\n你可以选择一个仅装有爆炸物的<span class=\"yellow b\">储物</span>道具，将其改造为爆炸物。<br><br>\r\n请选择要改造的道具：<br><br>");
  if (r.truth((await r.call("is_array", (await r.call("range", 1, 6)))))) {
    {
      const a0 = r.copy((await r.call("range", 1, 6)));
      for (const [k0, v0] of r.entries(a0)) {
        r.assign(r.slot(s, ["i"]), v0);
        if (r.truth((r.truth(r.get(s, (r.text("itms") + r.text(r.get(s, "i"))))) && r.truth((await r.module("itemmain", "check_in_itmsk", "^st", r.get(s, (r.text("itmsk") + r.text(r.get(s, "i")))))))))) {
          await r.write("\t\r\n<input type=\"radio\" name=\"skill746_choice\" id=\"skill746_choice");
          await r.write(r.text(r.get(s, "i")));
          await r.write("\" value=\"");
          await r.write(r.text(r.get(s, "i")));
          await r.write("\"><a onclick=\"sl('skill746_choice");
          await r.write(r.text(r.get(s, "i")));
          await r.write("');\">");
          await r.write(r.text(r.get(s, (r.text("itm") + r.text(r.get(s, "i"))))));
          await r.write("/");
          await r.write(r.text(r.get(s, (r.text("itme") + r.text(r.get(s, "i"))))));
          await r.write("/");
          await r.write(r.text(r.get(s, (r.text("itms") + r.text(r.get(s, "i"))))));
          await r.write("</a><br>");
        }
      }
    }
  }
  await r.write("<br><br>\r\n<input type=\"button\" class=\"cmdbutton\"  id=\"z\" value=\"[Z]提交\" onclick=\"postCmd('gamecmd','command.php');this.disabled=true;\">\r\n<input type=\"button\" class=\"cmdbutton\"  id=\"x\" value=\"[X]返回\" onclick=\"$('command').value='menu'; postCmd('gamecmd','command.php');this.disabled=true;\">");
return 1;
}
