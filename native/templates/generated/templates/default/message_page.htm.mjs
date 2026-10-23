// Generated from templates/default/message_page.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  (await r.include(r.template("header"), s));
  await r.write("<div class=\"subtitle\" align=\"center\">站内邮件</div>\r\n<center>\r\n<div class=\"yellow b\" id=\"info\"></div><div>\r\n<form method=\"post\" name=\"message_cmd\" onsubmit=\"messages.php\">\r\n<input type=\"hidden\" id=\"mode\" name=\"mode\" value=\"show\">\r\n<input type=\"hidden\" id=\"extracmd\" name=\"extracmd\" value=\"\">\r\n<div id=\"messages\">");
  (await r.include(r.template("messages"), s));
  await r.write("</div>\r\n</form>\r\n</div>\r\n</center>");
  (await r.include(r.template("footer"), s));
return 1;
}
