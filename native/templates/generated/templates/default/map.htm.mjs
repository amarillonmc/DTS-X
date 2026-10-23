// Generated from templates/default/map.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  (await r.include(r.template("header"), s));
  await r.write("<div class=\"subtitle\" >虚拟世界地图</div><div id=\"notice\"></div>\r\n<center>\r\n<div>");
  (await r.include(r.template("map_display"), s));
  await r.write("</div>\r\n<p>\r\n<span class=\"red b\">红字=禁区</span>；<span class=\"yellow b\">黄字=即将成为禁区</span>；<span class=\"lime b\">绿字=正常通行</span>\r\n</p>\r\n</center>");
  (await r.include(r.template("footer"), s));
return 1;
}
