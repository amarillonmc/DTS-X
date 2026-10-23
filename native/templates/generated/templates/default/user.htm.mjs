// Generated from templates/default/user.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  (await r.include(r.template("header"), s));
  await r.write("<div class=\"subtitle\" style=\"text-align:center\">帐号资料</div>\r\n\r\n<p class=\"linen b\" style=\"text-align:center\">\r\n<span id=\"notice\"></span><br />\r\n<span id=\"info\" class=\"yellow b\"></span>\r\n</p>\r\n<p style=\"text-align:center\">\r\n<form method=\"post\" action=\"user.php\" name=\"userdata\">\r\n<input type=\"hidden\" name=\"mode\" value=\"edit\">\r\n<input type=\"hidden\" id=\"newCardChoice\" name=\"card\" value=\"");
  await r.write(r.text(r.get(s, "cardChosen")));
  await r.write("\">\r\n<div style=\"vertical-align:top;\">\r\n<div style=\"display:inline-block;\">\r\n<span class =\"yellow b\">账户基本资料</span>");
  (await r.include(r.template("userbasicdata"), s));
  await r.write("</div>\r\n<span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>\r\n<div style=\"display:inline-block;\">\r\n<span class =\"yellow b\">账户个性化资料</span>");
  (await r.include(r.template("useradvdata"), s));
  await r.write("</div>\r\n<span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>\r\n<div style=\"display:inline-block;\">\r\n<span class =\"yellow b\">游戏设置</span>");
  (await r.include(r.template("usersettings"), s));
  await r.write("</div>\r\n</div><div id=\"postdata\" style=\"height:60px\">\r\n<br />\r\n<input type=\"submit\" class=\"b_button bc_black\" id=\"post\" onClick=\"$('newCardChoice').value=chosen_card_id; postCmd('userdata','user.php');return false;\" value=\"提交\">\r\n<input type=\"reset\" class=\"b_button bc_black\" id=\"reset\" value=\"重设\">\r\n</div>");
  if (r.truth((await r.call("defined", "MOD_CARDBASE")))) {
    r.assign(r.slot(s, ["hideDisableButton"]), 0);
    r.assign(r.slot(s, ["showCardUnavailableHint"]), 0);
    await r.write("<span class =\"yellow b\">身份卡选择</span><br>\r\n<div style=\"height:3px\">&nbsp;</div>");
    (await r.include(r.template("MOD_CARDBASE_SELECTCARD"), s));
  }
  await r.write("</form>\r\n</p>");
  (await r.include(r.template("footer"), s));
  await r.write(" ");
return 1;
}
