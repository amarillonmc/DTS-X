// Generated from templates/default/login_page.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  (await r.include(r.template("header"), s));
  await r.write("<div class=\"subtitle\">用户登录</div><div>\r\n<form method=\"post\" name=\"login\" action=\"login.php\">\r\n    <input type=\"hidden\" name=\"mode\" value=\"main\">\r\n    账号<input type=\"text\" name=\"username\" size=\"20\" maxlength=\"20\" value=\"");
  await r.write(r.text(r.get(s, "cuser")));
  await r.write("\"><br>\r\n    密码<input type=\"password\" name=\"password\" size=\"20\" maxlength=\"24\" value=\"");
  await r.write(r.text(r.get(s, "cpass")));
  await r.write("\"><br>\r\n    <input type=\"submit\" name=\"enter\" value=\"登录\">\r\n</form>\r\n</div>");
  (await r.include(r.template("footer"), s));
return 1;
}
