// Generated from include/modules/extra/card/skills/skill458/castsk458.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  await r.write("<input type=\"hidden\" name=\"mode\" value=\"special\">\r\n<input type=\"hidden\" id=\"command\" name=\"command\" value=\"skill458_special\">\r\n<input type=\"hidden\" id=\"subcmd\" name=\"subcmd\" value=\"castsk458\">\r\n这个技能允许你将任意物品转换为命体恢复补给。已经是补给类型的物品不能转换。<br><br>\r\n请选择将转换为补给的物品。转换过程不可逆！<br> \r\n<select id=\"skill458_choice\" name=\"skill458_choice\" value=\"back\">\r\n<option value=\"back\">返回<br>");
  if (r.truth((r.truth((r.truth(r.get(s, "itms1")) && r.truth((!r.equal(r.get(r.get(s, "itmk1"), "0"), "H"))))) && r.truth((!r.equal(r.get(r.get(s, "itmk1"), "0"), "P")))))) {
    await r.write("<option value=\"1\"><span class=\"yellow b\">");
    await r.write(r.text(r.get(s, "itm1")));
    await r.write("</span>/");
    await r.write(r.text(r.get(s, "itme1")));
    await r.write("/");
    await r.write(r.text(r.get(s, "itms1")));
    await r.write("<br>");
  }
  if (r.truth((r.truth((r.truth(r.get(s, "itms2")) && r.truth((!r.equal(r.get(r.get(s, "itmk2"), "0"), "H"))))) && r.truth((!r.equal(r.get(r.get(s, "itmk2"), "0"), "P")))))) {
    await r.write("<option value=\"2\"><span class=\"yellow b\">");
    await r.write(r.text(r.get(s, "itm2")));
    await r.write("</span>/");
    await r.write(r.text(r.get(s, "itme2")));
    await r.write("/");
    await r.write(r.text(r.get(s, "itms2")));
    await r.write("<br>");
  }
  if (r.truth((r.truth((r.truth(r.get(s, "itms3")) && r.truth((!r.equal(r.get(r.get(s, "itmk3"), "0"), "H"))))) && r.truth((!r.equal(r.get(r.get(s, "itmk3"), "0"), "P")))))) {
    await r.write("<option value=\"3\"><span class=\"yellow b\">");
    await r.write(r.text(r.get(s, "itm3")));
    await r.write("</span>/");
    await r.write(r.text(r.get(s, "itme3")));
    await r.write("/");
    await r.write(r.text(r.get(s, "itms3")));
    await r.write("<br>");
  }
  if (r.truth((r.truth((r.truth(r.get(s, "itms4")) && r.truth((!r.equal(r.get(r.get(s, "itmk4"), "0"), "H"))))) && r.truth((!r.equal(r.get(r.get(s, "itmk4"), "0"), "P")))))) {
    await r.write("<option value=\"4\"><span class=\"yellow b\">");
    await r.write(r.text(r.get(s, "itm4")));
    await r.write("</span>/");
    await r.write(r.text(r.get(s, "itme4")));
    await r.write("/");
    await r.write(r.text(r.get(s, "itms4")));
    await r.write("<br>");
  }
  if (r.truth((r.truth((r.truth(r.get(s, "itms5")) && r.truth((!r.equal(r.get(r.get(s, "itmk5"), "0"), "H"))))) && r.truth((!r.equal(r.get(r.get(s, "itmk5"), "0"), "P")))))) {
    await r.write("<option value=\"5\"><span class=\"yellow b\">");
    await r.write(r.text(r.get(s, "itm5")));
    await r.write("</span>/");
    await r.write(r.text(r.get(s, "itme5")));
    await r.write("/");
    await r.write(r.text(r.get(s, "itms5")));
    await r.write("<br>");
  }
  if (r.truth((r.truth((r.truth(r.get(s, "itms6")) && r.truth((!r.equal(r.get(r.get(s, "itmk6"), "0"), "H"))))) && r.truth((!r.equal(r.get(r.get(s, "itmk6"), "0"), "P")))))) {
    await r.write("<option value=\"6\"><span class=\"yellow b\">");
    await r.write(r.text(r.get(s, "itm6")));
    await r.write("</span>/");
    await r.write(r.text(r.get(s, "itme6")));
    await r.write("/");
    await r.write(r.text(r.get(s, "itms6")));
    await r.write("<br>");
  }
  await r.write("</select>\r\n<br><br>\r\n<input type=\"button\" class=\"cmdbutton\"  id=\"z\" value=\"[Z]提交\" onclick=\"postCmd('gamecmd','command.php');this.disabled=true;\">\r\n<input type=\"button\" class=\"cmdbutton\"  id=\"x\" value=\"[X]返回\" onclick=\"$('command').value='menu'; postCmd('gamecmd','command.php');this.disabled=true;\">");
return 1;
}
