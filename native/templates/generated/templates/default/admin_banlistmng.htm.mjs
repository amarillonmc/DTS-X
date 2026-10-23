// Generated from templates/default/admin_banlistmng.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  await r.write("<form method=\"post\" name=\"banlist\" onsubmit=\"admin.php\">\r\n<input type=\"hidden\" name=\"mode\" value=\"banlistmng\">\r\n<input type=\"hidden\" name=\"command\" id=\"command\" value=\"\">\r\n<table class=\"admin\">\r\n<tr>\r\n<th colspan=\"2\">屏蔽列表管理</th>\r\n</tr>\r\n<tr>\r\n<td colspan=\"2\">输入要屏蔽的用户名和IP段的正则表达式。修改之前请弄明白你正在做什么。</td>\r\n</tr>\r\n<tr>\r\n<th>用户名屏蔽</th>\r\n<th>IP段屏蔽</th>\r\n</tr>\r\n<tr>\r\n<td><textarea name=\"postnmlmt\" style=\"width:400;height:200\">");
  await r.write(r.text(r.get(s, "nmlimit")));
  await r.write("</textarea></td>\r\n<td><textarea name=\"postiplmt\" style=\"width:400;height:200\">");
  await r.write(r.text(r.get(s, "iplimit")));
  await r.write("</textarea></td>\r\n</tr>\r\n</table>\r\n<input type=\"submit\" value=\"提交\" onclick=\"$('command').value='write'\">\r\n</form> ");
return 1;
}
