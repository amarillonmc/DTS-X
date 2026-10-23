// Generated from include/modules/extra/card/skills/skill737/castsk737.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  await r.write("<input type=\"hidden\" name=\"mode\" value=\"special\">\r\n<input type=\"hidden\" id=\"command\" name=\"command\" value=\"skill737_special\">\r\n<input type=\"hidden\" id=\"subcmd\" name=\"subcmd\" value=\"castsk737\">\r\n你可以选择一个补给品道具，将其变为<span class=\"yellow b\">黄色雏菊/歌魂增加/120/1/天然</span>，但使用效果不变。<br><br>\r\n请选择要雕花的道具：<br><br>");
  if (r.truth((await r.call("is_array", (await r.call("range", 1, 6)))))) {
    {
      const a0 = r.copy((await r.call("range", 1, 6)));
      for (const [k0, v0] of r.entries(a0)) {
        r.assign(r.slot(s, ["i"]), v0);
        if (r.truth((r.truth(r.get(s, (r.text("itms") + r.text(r.get(s, "i"))))) && r.truth((r.truth(r.equal(r.get(r.get(s, (r.text("itmk") + r.text(r.get(s, "i")))), 0), "H")) || r.truth(r.equal(r.get(r.get(s, (r.text("itmk") + r.text(r.get(s, "i")))), 0), "P"))))))) {
          await r.write("\t\r\n<input type=\"radio\" name=\"skill737_choice\" id=\"skill737_choice");
          await r.write(r.text(r.get(s, "i")));
          await r.write("\" value=\"");
          await r.write(r.text(r.get(s, "i")));
          await r.write("\"><a onclick=\"sl('skill737_choice");
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
