// Generated from templates/default/kujilist.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  (await r.include(r.template("header"), s));
  await r.write("<div class=\"subtitle\" align=\"center\">抽卡选择</div>\r\n<center>\r\n<div style=\"width:900px;\">\r\n<br>\r\n<div align=\"left\">\r\n<div class=\"clearfix\">\r\n<span style=\"float:left;\" ><img border=\"0\" src=\"img/n_7.gif\"></span>\r\n<span class=\"evergreen b\">“现在身份卡系统还没有专门的看板娘，<br>所以我先勉为其难的负责一下好了。<br><br>……我说，你们那算是什么表情？”</span>\r\n</div></div>\r\n<br>\r\n<div style=\"width:600px;text-align:center;\">当前的切糕数量：<span class=\"evergreen b\">");
  await r.write(r.text(r.get(s, "cg")));
  await r.write("</span><br></div>\r\n<br>\r\n<table>\r\n<tr height=75px>\r\n<td width=200px>\r\n<input type=\"button\" class=\"b_button bc_white\" style=\"width:198\" value=\"普通抽卡(");
  await r.write(r.text(r.get(r.get(s, "kreq"), "0")));
  await r.write("切糕)\" \r\nonclick=\"window.location.href='kuji.php?type=0'\" ");
  if (r.truth((r.compare(r.get(s, "cg"), r.get(r.get(s, "kreq"), "0")) < 0))) {
    await r.write("disabled");
  }
  await r.write("><br />\r\n<div style=\"width:93%; text-align:center;\">\r\n<span class=\"evergreen b\">“这里可能抽到所有已经实装的身份卡。不知道该选什么的时候就选这里吧。”</span>\r\n<br>\r\n</div>\r\n</td>\r\n\r\n<td width=200px>\r\n<input type=\"button\" class=\"b_button bc_white\" style=\"width:198\" value=\"定向八连抽(");
  await r.write(r.text(r.get(r.get(s, "kreq"), "3")));
  await r.write("切糕)\" \r\nonclick=\"window.location.href='kuji.php?type=3'\" ");
  if (r.truth((r.compare(r.get(s, "cg"), r.get(r.get(s, "kreq"), "3")) < 0))) {
    await r.write("disabled");
  }
  await r.write("><br />\r\n<div style=\"width:93%; text-align:center;\">\r\n<span class=\"evergreen b\">“这里可以指定一个卡集并且抽8次，其中会有4张来自所选的卡集。”</span>\r\n<br>\r\n</div>\r\n</td>\r\n<td width=200px>\r\n<input type=\"button\" class=\"b_button bc_white\" style=\"width:198\" value=\"十一连(");
  await r.write(r.text(r.get(r.get(s, "kreq"), "1")));
  await r.write("切糕)\" \r\nonclick=\"window.location.href='kuji.php?type=1'\" ");
  if (r.truth((r.compare(r.get(s, "cg"), r.get(r.get(s, "kreq"), "1")) < 0))) {
    await r.write("disabled");
  }
  await r.write("><br />\r\n<div style=\"width:93%; text-align:center;\">\r\n<span class=\"evergreen b\">“好像各种卡牌游戏里都有11连呢，虽然大逃杀并不是一个卡牌游戏。”</span>\r\n<br>\r\n</div>\r\n</td>\r\n</tr>\r\n</table>\r\n<br>\r\n<form method=\"post\" name=\"backprofile\" action=\"user_profile.php\">\r\n<input type=\"submit\" class=\"b_button bc_white\" name=\"enter\" value=\"返回账户页面\">\r\n</form>\r\n</div>\r\n</center>");
  (await r.include(r.template("footer"), s));
return 1;
}
