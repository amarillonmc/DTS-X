// Generated from templates/default/rank.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  (await r.include(r.template("header"), s));
  await r.write("<div id=\"notice\"></div>\r\n<span class=\"subtitle\">玩家排行榜</span>\r\n<center>\r\n<form id='showrank' name=\"showrank\" method=\"post\">\r\n<input type=\"hidden\" name=\"start\" id=\"start\" value=\"0\">\r\n<input type=\"hidden\" name=\"command\" id=\"command\" value=\"ref\">\r\n<input type=\"hidden\" name=\"checkmode\" id=\"checkmode\" value=\"credits\">\r\n<div>\r\n<input type=\"button\" id=\"credits\" value=\"按天梯等级排列\" onClick=\"document['showrank']['start'].value='0';document['showrank']['checkmode'].value='elorate';document['showrank']['command'].value='ref';postCmd('showrank','rank.php');return false;\">\r\n<input type=\"button\" id=\"credits\" value=\"按当前积分排列\" onClick=\"document['showrank']['start'].value='0';document['showrank']['checkmode'].value='credits';document['showrank']['command'].value='ref';postCmd('showrank','rank.php');return false;\">\r\n<input type=\"button\" id=\"credits\" value=\"按荣誉等级排列\" onClick=\"document['showrank']['start'].value='0';document['showrank']['checkmode'].value='total';document['showrank']['command'].value='ref';postCmd('showrank','rank.php');return false;\">\r\n<input type=\"button\" id=\"credits\" value=\"按胜率排列\" onClick=\"document['showrank']['start'].value='0';document['showrank']['checkmode'].value='winrate';document['showrank']['command'].value='ref';postCmd('showrank','rank.php');return false;\">\r\n</div><div>\r\n<input type=\"button\" id=\"last\"  value=\"上一页\" onClick=\"document['showrank']['command'].value='last';postCmd('showrank','rank.php');return false;\">\r\n<span id=\"pageinfo\">第<span class=\"yellow b\" id=\"startnum\">");
  await r.write(r.text(r.get(s, "startnum")));
  await r.write("</span>条至第<span class=\"yellow b\" id=\"endnum\">");
  await r.write(r.text(r.get(s, "endnum")));
  await r.write("</span>条</span>\r\n<input type=\"button\" id=\"next\"  value=\"下一页\" onClick=\"document['showrank']['command'].value='next';postCmd('showrank','rank.php');return false;\">\r\n</div>\r\n</form>\r\n<div id=\"rank\">");
  (await r.include(r.template("rankinfo"), s));
  await r.write("</div>\r\n</center>");
  (await r.include(r.template("footer"), s));
return 1;
}
