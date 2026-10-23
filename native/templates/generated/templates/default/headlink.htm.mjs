// Generated from templates/default/headlink.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  await r.write("<div class=\"headerlink\" >\r\n<a href=\"index.php\">>>首页</a>\r\n<a href=\"game.php\">>>进入游戏</a>\r\n<a href=\"map.php\">>>战场地图</a>\r\n<a href=\"news.php\">>>进行状况</a>\r\n<a href=\"alive.php\">>>当前幸存</a>\r\n<a href=\"winner.php\">>>历史优胜</a>\r\n<a href=\"help.php\">>>游戏帮助</a>\r\n<a href=\"admin.php\">>>游戏管理</a>\r\n<a href=\"http://nmforce.net/forum.php?mod=forumdisplay&amp;fid=14\">>>官方讨论区</a>\r\n<a href=\"");
  await r.write(r.text(r.get(s, "homepage")));
  await r.write("\" target=\"_blank\">>>官方网站</a>\r\n</div>\r\n");
return 1;
}
