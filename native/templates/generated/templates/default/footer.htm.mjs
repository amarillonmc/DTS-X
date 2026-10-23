// Generated from templates/default/footer.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  await r.write("<!-- 悬浮提示功能 -->\r\n<div id=\"hoverHintMsg\">\r\n<div id=\"hoverHintMsgInner\" class=\"noselect\">\r\n</div>\r\n</div>\r\n<script>\r\nfloating_hint();\r\n</script>");
  r.assign(r.slot(s, ["noclick"]), (r.truth((r.truth((!r.truth((!r.truth(r.get(s, "page")))))) && r.truth(r.equal("command_game", r.get(s, "page"))))) ? 1 : 0));
  await r.write("<div style=\"width:100%;position:relative;\">\r\n<div><hr></div>");
  if (r.truth(r.get(s, "noclick"))) {
    await r.write("<div style=\"position:absolute;width:100%;height:75px;z-index:5\"></div>");
  }
  await r.write("<div style=\"float:left;text-align:left\">\r\n<div>\r\n<a href=\"http://en.wikipedia.org/wiki/Wikipedia:CC-BY-SA\"><img src=\"img/cc-by-sa.png\" style=\"width:96px;height:32px;\"></a>\r\n</div><div id=\"copyright\">\r\n<span>ACFUN大逃杀、电波大逃杀或常磐大逃杀之源代码遵循 <a class=\"evergreen b\" href=\"http://en.wikipedia.org/wiki/Wikipedia:CC-BY-SA\">知识共享 署名-相同方式共享 3.0协议</a>；<br>\r\n游戏背景、剧情及原创角色设定遵循 <b class=\"evergreen b\">知识共享 署名-非商业性使用-相同方式共享 3.0协议</b>。<br></span>\r\n</div>\r\n</div><div style=\"float:right;text-align:right\">\r\n<div>\r\n<span class=\"b\">感谢所有为这个游戏做出贡献的人！</span><br><br>");
  if (r.truth((!r.truth(r.get(s, "noclick"))))) {
    await r.write("<a class=\"evergreen b\" href=\"donate.php\">>>>ACFUN大逃杀的历史及捐助页面<<<</a>");
  }
  await r.write("</div>");
  if (r.truth((!r.truth(r.get(s, "noclick"))))) {
    await r.write("<div id=\"credits1\">\r\n<a onclick=\"$('credits1').style.display='none';$('credits2').style.display='block';\">>>>点此展开 常磐大逃杀电波版 制作者及鸣谢列表<<<</a>\r\n</div><div id=\"credits2\" class=\"ver\" style=\"display:none\">\r");
    await r.write(r.text(r.get(s, "gamecredits")));
    await r.write("</div>\r\n<br>");
  }
  await r.write("<div style=\"float: right;width:80px;clear:right;\">\r\n<!-- Histats.com  START  (standard)-->\r\n<script type=\"text/javascript\">document.write(unescape(\"%3Cscript src=%27http://s10.histats.com/js15_gif.js%27 type=%27text/javascript%27%3E%3C/script%3E\"));</script>\r\n<a href=\"http://www.histats.com\" target=\"_blank\" title=\"site hit counter\" >\r\n<script  type=\"text/javascript\" >\r\ntry {Histats.startgif(1,1323746,4,10043,\"\");\r\nHistats.track_hits();} catch(err){};\r\n</script>\r\n</a>\r\n<noscript>\r\n<a href=\"http://www.histats.com\" alt=\"site hit counter\" target=\"_blank\" ><div id=\"histatsC\"><img border=\"0\" src=\"http://s4is.histats.com/stats/i/1323746.gif?1323746&amp;103\"></div></a>\r\n</noscript>\r\n<!-- Histats.com  END  -->\r\n</div>\r\n</div><div id=\"error\" style=\"float:left;text-align:left;clear:left;\">\r");
  await r.write(r.text(r.get(s, "error")));
  await r.write("</div>\r\n\r\n</div>\r\n</body>\r\n</html>");
return 1;
}
