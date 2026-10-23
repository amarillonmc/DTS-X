// Generated from templates/default/valid.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  (await r.include(r.template("header"), s));
  await r.write("<div class=\"subtitle\" align=\"center\">入场手续</div>");
  if (r.truth((r.truth(r.equal(1, r.get(s, "gametype"))) || r.truth(r.equal(9, r.get(s, "gametype")))))) {
    await r.write("<p align=\"center\">\r\n即将登录虚拟幻境……<br />\r\n请最后确认您的身份数据。<br />\r\n</p>");
  } else {
    await r.write("<p><img border=\"0\" src=\"img/story_0.gif\" style=\"text-align:center\"></p>\r\n<p align=\"center\">\r\n“欢迎参加本次ACFUN动漫祭。<br />\r\n“我是本次ACFUN动漫祭的工作人员。<br />\r\n“本次动漫祭不同于以往，各项活动将采用虚拟现实系统进行。<br />\r\n“请参加者如实填写身份资料，以便领取神经接入装置。<br />\r\n“身份资料请填写在下面。”<br />\r\n</p>");
  }
  await r.write("<form method=\"post\"  action=\"valid.php\" name=\"valid\">\r\n<input type=\"hidden\" name=\"mode\" value=\"enter\">\r\n<span class=\"yellow b\">姓名 : ");
  await r.write(r.text(r.get(s, "username")));
  await r.write(" </span><br />\r\n<center>");
  (await r.include(r.template("useradvdata"), s));
  await r.write("<input type=\"hidden\" id=\"cardChosen\" name=\"card\" value=\"");
  await r.write(r.text(r.get(s, "cardChosen")));
  await r.write("\"> \r\n\r\n<span class =\"yellow b\">选择一张身份卡</span><br>\r\n<div style=\"height:3px\">&nbsp;</div>");
  if (r.truth((await r.call("defined", "MOD_CARDBASE")))) {
    (await r.include(r.template("MOD_CARDBASE_SELECTCARD"), s));
  }
  await r.write("</center>\r\n<br />\r\n<input type=\"submit\" class=\"b_button bc_black\" onClick=\"$('cardChosen').value=chosen_card_id;\" value=\"提交\">\r\n<input type=\"reset\" class=\"b_button bc_black\" value=\"重设\">\r\n</form>\r\n<br />");
  (await r.include(r.template("footer"), s));
return 1;
}
