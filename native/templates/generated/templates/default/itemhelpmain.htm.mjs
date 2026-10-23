// Generated from templates/default/itemhelpmain.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  await r.write("<head>\r\n<meta http-equiv=\"Content-Type\" content=\"text/html; charset=utf-8\">\r\n</head>");
  (await r.include(r.template("header"), s));
  await r.write("<div align=\"middle\">\r\n<table border=\"0\" cellspacing=\"0\" cellpadding=\"0\" valign=\"middle\">\r\n<tr>\r\n<td>\r\n<br>\r\n<p><span class=\"lime b\"><font size=\"3\">ACFUN大逃杀 物品掉落表：</font></span></p>\r\n<p><span class=\"grey b\">请利用浏览器的查找功能（Ctrl+F）查找你所需的内容。</span></p>\r\n<p><span>小提示： <br>如果你只是想查找<span class=\"yellow b\">合成表中的物品</span>的掉落位置，只需<a href=\"help.php\"><u>返回帮助</u></a>，并<span class=\"yellow b\">将鼠标停留在合成表中该物品上</span>，就会出现这个物品的获取方式了。</span></p>\r\n<br>\r\n</td>\r\n</tr>\r\n</table>\r\n<div align=\"middle\">\r");
  await r.write(r.text(r.get(s, "itemhelpcont")));
  await r.write("</div>\r\n<form method=\"post\" name=\"backindex\" action=\"help.php\"><input type=\"submit\" name=\"enter\" value=\"返回帮助页面\"></form>");
  (await r.include(r.template("footer"), s));
return 1;
}
