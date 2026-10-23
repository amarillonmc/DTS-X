// Generated from include/modules/extra/club/skills/skill23/gemming.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  await r.write("<input type=\"hidden\" name=\"mode\" value=\"special\">\r\n<input type=\"hidden\" id=\"command\" name=\"command\" value=\"skill23_special\">\r\n<input type=\"hidden\" id=\"subcmd\" name=\"subcmd\" value=\"gemming\">\r\n宝石骑士称号可以将各类<span class=\"yellow b\">宝石</span>或<span class=\"yellow b\">方块</span>镶嵌在你的<span class=\"yellow b\">武器</span>或<span class=\"yellow b\">防具</span>上，为其添加不同的<span class=\"yellow b\">防御属性</span>或<span class=\"yellow b\">攻击属性</span>。<br>\r\n各种宝石/方块的效果列表请参见帮助。<br><br>\r\n请选择你将镶嵌的武器或防具：<br>\r\n<select id=\"skill23_t1\" name=\"skill23_t1\" value=\"back\">");
  if (r.truth((r.truth(r.get(s, "weps")) && r.truth((!r.equal(r.get(s, "wepk"), "WN")))))) {
    await r.write("<option value=\"wep\"><span class=\"yellow b\">");
    await r.write(r.text(r.get(s, "wep")));
    await r.write("</span>/");
    await r.write(r.text(r.get(s, "wepe")));
    await r.write("/");
    await r.write(r.text(r.get(s, "weps")));
    await r.write("<br>");
  }
  if (r.truth(r.get(s, "arbs"))) {
    await r.write("<option value=\"arb\"><span class=\"yellow b\">");
    await r.write(r.text(r.get(s, "arb")));
    await r.write("</span>/");
    await r.write(r.text(r.get(s, "arbe")));
    await r.write("/");
    await r.write(r.text(r.get(s, "arbs")));
    await r.write("<br>");
  }
  if (r.truth(r.get(s, "arhs"))) {
    await r.write("<option value=\"arh\"><span class=\"yellow b\">");
    await r.write(r.text(r.get(s, "arh")));
    await r.write("</span>/");
    await r.write(r.text(r.get(s, "arhe")));
    await r.write("/");
    await r.write(r.text(r.get(s, "arhs")));
    await r.write("<br>");
  }
  if (r.truth(r.get(s, "aras"))) {
    await r.write("<option value=\"ara\"><span class=\"yellow b\">");
    await r.write(r.text(r.get(s, "ara")));
    await r.write("</span>/");
    await r.write(r.text(r.get(s, "arae")));
    await r.write("/");
    await r.write(r.text(r.get(s, "aras")));
    await r.write("<br>");
  }
  if (r.truth(r.get(s, "arfs"))) {
    await r.write("<option value=\"arf\"><span class=\"yellow b\">");
    await r.write(r.text(r.get(s, "arf")));
    await r.write("</span>/");
    await r.write(r.text(r.get(s, "arfe")));
    await r.write("/");
    await r.write(r.text(r.get(s, "arfs")));
    await r.write("<br>");
  }
  await r.write("</select>\r\n<br><br>\r\n请选择用于镶嵌的宝石或方块。<br> \r\n<select id=\"skill23_t2\" name=\"skill23_t2\" value=\"back\">\r\n<option value=\"back\">返回<br>");
  if (r.truth((r.truth(r.get(s, "itms1")) && r.truth((!r.identical((await r.call("strpos", r.get(s, "itm1"), "方块")), false)))))) {
    await r.write("<option value=\"1\"><span class=\"yellow b\">");
    await r.write(r.text(r.get(s, "itm1")));
    await r.write("</span>/");
    await r.write(r.text(r.get(s, "itme1")));
    await r.write("/");
    await r.write(r.text(r.get(s, "itms1")));
    await r.write("<br>");
  }
  if (r.truth((r.truth(r.get(s, "itms2")) && r.truth((!r.identical((await r.call("strpos", r.get(s, "itm2"), "方块")), false)))))) {
    await r.write("<option value=\"2\"><span class=\"yellow b\">");
    await r.write(r.text(r.get(s, "itm2")));
    await r.write("</span>/");
    await r.write(r.text(r.get(s, "itme2")));
    await r.write("/");
    await r.write(r.text(r.get(s, "itms2")));
    await r.write("<br>");
  }
  if (r.truth((r.truth(r.get(s, "itms3")) && r.truth((!r.identical((await r.call("strpos", r.get(s, "itm3"), "方块")), false)))))) {
    await r.write("<option value=\"3\"><span class=\"yellow b\">");
    await r.write(r.text(r.get(s, "itm3")));
    await r.write("</span>/");
    await r.write(r.text(r.get(s, "itme3")));
    await r.write("/");
    await r.write(r.text(r.get(s, "itms3")));
    await r.write("<br>");
  }
  if (r.truth((r.truth(r.get(s, "itms4")) && r.truth((!r.identical((await r.call("strpos", r.get(s, "itm4"), "方块")), false)))))) {
    await r.write("<option value=\"4\"><span class=\"yellow b\">");
    await r.write(r.text(r.get(s, "itm4")));
    await r.write("</span>/");
    await r.write(r.text(r.get(s, "itme4")));
    await r.write("/");
    await r.write(r.text(r.get(s, "itms4")));
    await r.write("<br>");
  }
  if (r.truth((r.truth(r.get(s, "itms5")) && r.truth((!r.identical((await r.call("strpos", r.get(s, "itm5"), "方块")), false)))))) {
    await r.write("<option value=\"5\"><span class=\"yellow b\">");
    await r.write(r.text(r.get(s, "itm5")));
    await r.write("</span>/");
    await r.write(r.text(r.get(s, "itme5")));
    await r.write("/");
    await r.write(r.text(r.get(s, "itms5")));
    await r.write("<br>");
  }
  if (r.truth((r.truth(r.get(s, "itms6")) && r.truth((!r.identical((await r.call("strpos", r.get(s, "itm6"), "方块")), false)))))) {
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
