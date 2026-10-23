// Generated from templates/default/sp_pswd.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  await r.write("请输入旧密码和新密码，20个字以内。留空为不修改。<br>\r\n\r\n<input type=\"hidden\" name=\"mode\" value=\"chgpassword\">\r\n<div>旧密码：<input size=\"20\" type=\"password\" name=\"oldpswd\" maxlength=\"20\" value=\"\"></div>\r\n<br />\r\n<div>新密码：<input size=\"20\" type=\"password\" name=\"newpswd\" maxlength=\"20\" value=\"\"></div>\r\n<br />\r\n<div>重复输入：<input size=\"20\" type=\"password\" name=\"newpswd2\" maxlength=\"20\" value=\"\"></div>\r\n<br />\r\n\r\n<br />\r\n<input type=\"button\" class=\"cmdbutton\"  value=\"提交\" onclick=\"postCmd('gamecmd','command.php');this.disabled=true;\">");
return 1;
}
