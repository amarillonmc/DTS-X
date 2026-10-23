// Generated from templates/default/news.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  (await r.include(r.template("header"), s));
  await r.write("<div id=\"notice\"></div><div class=\"subtitle\" >进行状况</div><div align=\"left\">\r\n<div class=\"clearfix\">\r\n<span style=\"float:left;\" ><img border=\"0\" src=\"img/ga03aglitch.gif\"></span>\r\n<span><span class=\"evergreen b\">“各位仍在努力奋战，咱很欣慰。<br />以下是到现在为止的游戏状况。<br />请各位再接再厉。”</span></span>\r\n</div>\r\n<br>");
  r.imports(s, "weather");
  await r.write("<span class=\"evergreen b\">当前时间：");
  await r.write(r.text(r.get(s, "month")));
  await r.write("月");
  await r.write(r.text(r.get(s, "day")));
  await r.write("日 星期");
  await r.write(r.text(r.get(r.get(s, "week"), (r.text(r.get(s, "wday"))))));
  await r.write(" ");
  await r.write(r.text(r.get(s, "hour")));
  await r.write(":");
  await r.write(r.text(r.get(s, "min")));
  await r.write("</span><br />\r\n<span class=\"evergreen b\">当前天气：");
  await r.write(r.text(r.get(r.get(s, "wthinfo"), r.get(s, "weather"))));
  await r.write("</span><br />");
  if (r.truth(r.equal(r.get(s, "gamestate"), 40))) {
    await r.write("<span class=\"yellow b\">游戏已经进入连斗阶段！</span><br />");
  }
  if (r.truth(r.equal(r.get(s, "gamestate"), 50))) {
    await r.write("<span class=\"red b\">游戏已经进入死斗模式！</span><br />");
  }
  if (r.truth(r.get(s, "hack"))) {
    await r.write("<span class=\"evergreen b\">（禁区已解除）</span>");
  }
  (await r.include(r.template("areainfo"), s));
  await r.write("<br><br>\r\n<form method=\"post\" name=\"news\" onSubmit=\"return false;\">\r\n<input type=\"hidden\" id=\"newsmode\" name=\"newsmode\" value=\"last\">\r\n<button onClick=\"$('newsmode').name='newsmode';$('newsmode').value='last';postCmd('news','news.php');\">显示最新的");
  await r.write(r.text(r.get(s, "newslimit")));
  await r.write("条消息</button>\r\n<button onClick=\"$('newsmode').name='newsmode';$('newsmode').value='all';postCmd('news','news.php');\">显示全部消息</button>\r\n<button onClick=\"$('newsmode').name='sendmode';$('newsmode').value='newspage';postCmd('news','chat.php');\">显示最新的");
  await r.write(r.text(r.get(s, "chatinnews")));
  await r.write("条聊天纪录</button>\r\n</form>\r\n\r\n\r\n<div id=\"newsinfo\">");
  if (r.truth(r.equal(r.get(s, "newsmode"), "all"))) {
    await r.write(r.text((await r.call("file_get_contents", r.get(s, "newshtm")))));
  } else {
    await r.write(r.text((await r.call("file_get_contents", r.get(s, "lnewshtm")))));
  }
  await r.write("</div>\r\n\r\n</div>\r\n<br>\r\n<form method=\"post\" name=\"backindex\" action=\"index.php\">\r\n<input type=\"submit\" name=\"enter\" value=\"返回首页\">\r\n</form>");
  (await r.include(r.template("footer"), s));
return 1;
}
