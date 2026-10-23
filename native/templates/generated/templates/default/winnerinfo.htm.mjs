// Generated from templates/default/winnerinfo.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  await r.write("<table align=\"center\">\r\n<tr><td>\r\n<div id=\"main\" style=\"width:720px\">");
  (await r.include(r.template("profile"), s));
  await r.write("</div>\r\n</td>\r\n<td>\r\n<table border=\"1\" width=\"250\" height=\"300\" cellspacing=\"0\" cellpadding=\"0\" >\r\n<tr height=\"1\">\r\n<td height=\"20\" class=\"b1\"><span><span class=\"yellow b\">系统状况</span></td>\r\n</tr>\r\n<tr><td valign=\"top\"class=\"b3\" style=\"text-align: left\"><div>");
  if (r.truth(r.get(s, "groomtype"))) {
    await r.write("房间局");
  }
  await r.write("第 ");
  await r.write(r.text(r.get(s, "gid")));
  await r.write(" 回大逃杀<br>\r\n参加人数： ");
  await r.write(r.text(r.get(s, "vnum")));
  await r.write(" 人<br>\r\n胜利方式： ");
  await r.write(r.text(r.get(r.get(s, "gwin"), r.get(s, "wmode"))));
  await r.write("<br>\r\n游戏进行时间：");
  await r.write(r.text(r.get(s, "gdate")));
  await r.write("<br>\r\n游戏开始时间：");
  await r.write(r.text(r.get(s, "gsdate")));
  await r.write("<br>           \r\n游戏结束时间：");
  await r.write(r.text(r.get(s, "gedate")));
  await r.write("<br>\r\n本场最高伤害者： ");
  await r.write(r.text(r.get(s, "hdp")));
  await r.write(" (");
  await r.write(r.text(r.get(s, "hdmg")));
  await r.write(")<br>\r\n本场最多杀人者： ");
  await r.write(r.text(r.get(s, "hkp")));
  await r.write(" (");
  await r.write(r.text(r.get(s, "hkill")));
  await r.write(")<br>\r\n<br>\r\n<form method=\"post\" name=\"back\" action=\"winner.php\">\r\n<input type=\"submit\" name=\"submit\" value=\"返回\">\r\n</form>\r\n\r\n</div></td>\r\n</tr>\r\n</table>\r\n</td>\r\n</tr>\r\n</table>\r\n");
return 1;
}
