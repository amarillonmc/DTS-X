// Generated from templates/default/userbasicdata.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  await r.write("<table align=\"center\">");
  if (r.truth(r.equal(r.constant("CURSCRIPT"), "register"))) {
    await r.write("<tr>\r\n<td>账号</td>\r\n<td><input type=\"text\" name=\"username\" size=\"24\" maxlength=\"15\" value=\"\" placeholder=\"最长15个字符，半角符号除外\"></td>\r\n</tr>\r\n<tr>\r\n<td>新密码</td>\r\n<td><input type=\"password\" id=\"npass\" name=\"npass\" size=\"24\" maxlength=\"24\" value=\"\" placeholder=\"最长24个字符\"></td>\r\n</tr>\r\n<tr>\r\n<td>重复新密码</td>\r\n<td><input type=\"password\" id=\"rnpass\" name=\"rnpass\" size=\"24\" maxlength=\"24\" value=\"\" placeholder=\"密码与重复密码需相同\"></td>\r\n</tr>");
  } else {
    if (r.truth(r.equal(r.constant("CURSCRIPT"), "user"))) {
      await r.write("<tr>\r\n<td>账号</td>\r\n<td>");
      await r.write(r.text(r.get(s, "username")));
      await r.write("</td>\r\n</tr>\r\n<tr>\r\n<td>原密码</td>\r\n<td><input type=\"password\" id=\"opass\" name=\"opass\" size=\"24\" maxlength=\"24\" value=\"\" placeholder=\"修改密码需输入正确的原密码\"></td>\r\n</tr>\r\n<tr>\r\n<td>新密码</td>\r\n<td><input type=\"password\" id=\"npass\" name=\"npass\" size=\"24\" maxlength=\"24\" value=\"\" placeholder=\"最长24个字符，留空为不修改\"/></td>\r\n</tr>\r\n<tr>\r\n<td>重复新密码</td>\r\n<td><input type=\"password\" id=\"rnpass\" name=\"rnpass\" size=\"24\" maxlength=\"24\" value=\"\" placeholder=\"最长24个字符，留空为不修改\"></td>\r\n</tr>");
    } else {
      await r.write("<tr>\r\n<td>账号</td>\r\n<td>");
      await r.write(r.text(r.get(s, "username")));
      await r.write("</td>\r\n</tr>\r\n<tr>\r\n<td>密码</td>\r\n<td>!cannotedit!</td>\r\n</tr>");
    }
  }
  await r.write("</table>");
return 1;
}
