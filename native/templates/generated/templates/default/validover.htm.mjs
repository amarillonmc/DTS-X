// Generated from templates/default/validover.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  (await r.include(r.template("header"), s));
  await r.write("<div class=\"subtitle\" >入场表格填写完成</div>\r\n<p><img border=\"0\" src=\"img/story_0.gif\" style=\"align:center\"></p>\r\n<table border=\"0\" cellspacing=\"0\" align=\"center\">\r\n  <tbody>\r\n<tr>\r\n<td class=\"b1\"><span>姓名</span></td>\r\n<td class=\"b3\"><span>");
  await r.write(r.text(r.get(s, "cuser")));
  await r.write("</span></td>\r\n<td rowspan=\"3\" colspan=\"2\" class=\"b3\"><span><img src=\"./img/");
  await r.write(r.text(r.get(s, "gd")));
  await r.write("_");
  await r.write(r.text(r.get(s, "icon")));
  await r.write(".gif\" border=\"0\" /></span></td>\r\n</tr>\r\n<tr>\r\n<td class=\"b1\"><span>学号</span></td>\r\n<td class=\"b3\"><span>");
  await r.write(r.text(r.get(r.get(s, "sexinfo"), r.get(s, "gd"))));
  await r.write(r.text(r.get(s, "sNo")));
  await r.write("号</span></td>\r\n\r\n</tr>\r\n<tr>\r\n<td class=\"b1\"><span>身份卡</span></td>\r\n<td class=\"b3\"><span>");
  await r.write(r.text(r.get(r.get(s, "cardinfo"), "name")));
  await r.write("</span></td>\r\n</tr>\r\n<tr>\r\n<td class=\"b1\"><span>生命</span></td>\r\n<td class=\"b3\"><span>");
  await r.write(r.text(r.get(s, "hp")));
  await r.write(" / ");
  await r.write(r.text(r.get(s, "mhp")));
  await r.write("</span></td>\r\n<td class=\"b1\"><span>体力</span></td>\r\n<td class=\"b3\"><span>");
  await r.write(r.text(r.get(s, "sp")));
  await r.write(" / ");
  await r.write(r.text(r.get(s, "msp")));
  await r.write("</span></td>\r\n</tr>\r\n<tr>\r\n<td class=\"b1\"><span>攻击力</span></td>\r\n<td class=\"b3\"><span>");
  await r.write(r.text(r.get(s, "att")));
  await r.write("</span></td>\r\n<td class=\"b1\"><span>防御力</span></td>\r\n<td class=\"b3\"><span>");
  await r.write(r.text(r.get(s, "def")));
  await r.write("</span></td>\r\n</tr>\r\n<tr>\r\n<td class=\"b1\"><span>武器</span></td>\r\n<td class=\"b3\" colspan=\"3\"><span>");
  await r.write(r.text(r.get(s, "wep")));
  await r.write("</span></td>\r\n</tr>\r\n<tr>\r\n<td class=\"b1\"><span>随机道具1</span></td>\r\n<td class=\"b3\" colspan=\"3\"><span>");
  await r.write(r.text(r.get(r.get(s, "itm"), "3")));
  await r.write("</span></td>\r\n</tr>\r\n<tr>\r\n<td class=\"b1\"><span>随机道具2</span></td>\r\n<td class=\"b3\" colspan=\"3\"><span>");
  await r.write(r.text(r.get(r.get(s, "itm"), "4")));
  await r.write("</span></td>\r\n</tr>\r\n  </tbody>\r\n</table>\r\n<p align=\"center\">“");
  await r.write(r.text(r.get(s, "cuser")));
  await r.write("，对吧？正在为您创建虚拟身份……<br>\r\n“创建完成！您可以凭这个身份参加我们的特别活动了。\r\n<br>\r\n“会场入口就在前面。动漫祭的开幕仪式就要开始了，请您尽快入场。”<br><br>\r\n\r\n<form method=\"post\"  action=\"valid.php\" style=\"margin: 0px\">\r\n<input type=\"hidden\" name=\"mode\" value=\"notice\">\r\n<input type=\"submit\" name=\"enter\" value=\"进入会场\">\r\n</form>\r\n</p>");
  (await r.include(r.template("footer"), s));
return 1;
}
