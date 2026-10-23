// Generated from templates/default/no_replay.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  (await r.include(r.template("header"), s));
  (await r.call("bubblebox_start", "id:replayhint;height:200;width:500;cancellable:0;"));
  await r.write("<table height=198px width=100%><tr><td align=\"center\" valign=\"middle\">\r\n<span><font size=\"50px\">录像文件不存在</font><br><br>\r\n可能是由于录像功能当时还未开放，或出现了一个系统错误<br><br>\r\n<a href=\"#\" onclick=\"if (history.length>1) javascript:history.back(-1); else window.location.href='index.php';\">请点击这里返回主页</a></span>\r\n</td></tr></table>");
  (await r.call("bubblebox_end"));
  await r.write("<script type=\"text/javascript\">bubblebox_show('replayhint');</script>");
  (await r.include(r.template("game_interface"), s));
  (await r.include(r.template("footer"), s));
return 1;
}
