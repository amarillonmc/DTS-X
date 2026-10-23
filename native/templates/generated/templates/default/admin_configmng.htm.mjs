// Generated from templates/default/admin_configmng.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  await r.write("<form method=\"post\" name=\"configmng\" onsubmit=\"admin.php\">\r\n<input type=\"hidden\" id=\"mode\" name=\"mode\" value=\"configmng\">\r\n<input type=\"hidden\" id=\"command\" name=\"command\" value=\"\">\r\n\r\n<table class=\"admin\">\r\n<tr>\r\n<th>");
  await r.write(r.text(r.get(r.get(s, "lang"), "variable")));
  await r.write("</th>\r\n<th>");
  await r.write(r.text(r.get(r.get(s, "lang"), "value")));
  await r.write("</th>\r\n<th>");
  await r.write(r.text(r.get(r.get(s, "lang"), "comment")));
  await r.write("</th>\r\n</tr>\r\n<tr>\r\n  <td>");
  await r.write(r.text(r.get(r.get(s, "lang"), "moveut")));
  await r.write("</td>\r\n  <td><input type=\"text\" name=\"moveut\" value=\"");
  await r.write(r.text(r.get(s, "moveut")));
  await r.write("\" size=\"5\">小时<input type=\"text\" name=\"moveutmin\" value=\"");
  await r.write(r.text(r.get(s, "moveutmin")));
  await r.write("\" size=\"5\">分钟</td>\r\n  <td>");
  await r.write(r.text(r.get(r.get(s, "lang"), "moveut_comment")));
  await r.write("<br>");
  await r.write(r.text(r.get(r.get(s, "lang"), "orin_time")));
  await r.write(r.text(r.get(s, "orin_time")));
  await r.write("<br>");
  await r.write(r.text(r.get(r.get(s, "lang"), "set_time")));
  await r.write(r.text(r.get(s, "set_time")));
  await r.write("</td>\r\n</tr>\r\n<tr>\r\n  <td>");
  await r.write(r.text(r.get(r.get(s, "lang"), "gtitle")));
  await r.write("</td>\r\n  <td><input type=\"text\" name=\"gtitle\" value=\"");
  await r.write(r.text(r.get(s, "gtitle")));
  await r.write("\" size=\"30\"></td>\r\n  <td>");
  await r.write(r.text(r.get(r.get(s, "lang"), "gtitle_comment")));
  await r.write("</td>\r\n</tr>\r\n<tr>\r\n  <td>");
  await r.write(r.text(r.get(r.get(s, "lang"), "server_address")));
  await r.write("</td>\r\n  <td><input type=\"text\" name=\"server_address\" value=\"");
  await r.write(r.text(r.get(s, "server_address")));
  await r.write("\" size=\"30\"></td>\r\n  <td>");
  await r.write(r.text(r.get(r.get(s, "lang"), "server_address_comment")));
  await r.write("</td>\r\n</tr>\r\n<tr>\r\n  <td>");
  await r.write(r.text(r.get(r.get(s, "lang"), "tplrefresh")));
  await r.write("</td>\r\n  <td><input type=\"radio\" name=\"tplrefresh\" value=\"1\" ");
  if (r.truth(r.get(s, "tplrefresh"))) {
    await r.write("checked=\"true\"");
  }
  await r.write(">");
  await r.write(r.text(r.get(r.get(s, "lang"), "on")));
  await r.write("&nbsp;&nbsp;&nbsp;<input type=\"radio\" name=\"tplrefresh\" value=\"0\" ");
  if (r.truth((!r.truth(r.get(s, "tplrefresh"))))) {
    await r.write("checked=\"true\"");
  }
  await r.write(">");
  await r.write(r.text(r.get(r.get(s, "lang"), "off")));
  await r.write("</td>\r\n  <td>");
  await r.write(r.text(r.get(r.get(s, "lang"), "tplrefresh_comment")));
  await r.write("</td>\r\n</tr>\r\n<tr>\r\n  <td>");
  await r.write(r.text(r.get(r.get(s, "lang"), "errorinfo")));
  await r.write("</td>\r\n  <td><input type=\"radio\" name=\"errorinfo\" value=\"1\" ");
  if (r.truth(r.get(s, "errorinfo"))) {
    await r.write("checked=\"true\"");
  }
  await r.write(">");
  await r.write(r.text(r.get(r.get(s, "lang"), "on")));
  await r.write("&nbsp;&nbsp;&nbsp;<input type=\"radio\" name=\"errorinfo\" value=\"0\" ");
  if (r.truth((!r.truth(r.get(s, "errorinfo"))))) {
    await r.write("checked=\"true\"");
  }
  await r.write(">");
  await r.write(r.text(r.get(r.get(s, "lang"), "off")));
  await r.write("</td>\r\n  <td>");
  await r.write(r.text(r.get(r.get(s, "lang"), "errorinfo_comment")));
  await r.write("</td>\r\n</tr>\r\n<tr>\r\n  <td>");
  await r.write(r.text(r.get(r.get(s, "lang"), "bbsurl")));
  await r.write("</td>\r\n  <td><input type=\"text\" name=\"bbsurl\" value=\"");
  await r.write(r.text(r.get(s, "bbsurl")));
  await r.write("\" size=\"30\"></td>\r\n  <td>");
  await r.write(r.text(r.get(r.get(s, "lang"), "bbsurl_comment")));
  await r.write("</td>\r\n</tr>\r\n<tr>\r\n  <td>");
  await r.write(r.text(r.get(r.get(s, "lang"), "gameurl")));
  await r.write("</td>\r\n  <td><input type=\"text\" name=\"gameurl\" value=\"");
  await r.write(r.text(r.get(s, "gameurl")));
  await r.write("\" size=\"30\"></td>\r\n  <td>");
  await r.write(r.text(r.get(r.get(s, "lang"), "gameurl_comment")));
  await r.write("</td>\r\n</tr>\r\n<tr>\r\n  <td>");
  await r.write(r.text(r.get(r.get(s, "lang"), "homepage")));
  await r.write("</td>\r\n  <td><input type=\"text\" name=\"homepage\" value=\"");
  await r.write(r.text(r.get(s, "homepage")));
  await r.write("\" size=\"30\"></td>\r\n  <td>");
  await r.write(r.text(r.get(r.get(s, "lang"), "homepage_comment")));
  await r.write("</td>\r\n</tr>\r\n\r\n<tr>\r\n  <td>");
  await r.write(r.text(r.get(r.get(s, "lang"), "userdb_remote_storage")));
  await r.write("</td>\r\n  <td><input type=\"text\" name=\"userdb_remote_storage\" value=\"");
  await r.write(r.text(r.get(s, "userdb_remote_storage")));
  await r.write("\" size=\"30\"></td>\r\n  <td>");
  await r.write(r.text(r.get(r.get(s, "lang"), "userdb_remote_storage_comment")));
  await r.write("</td>\r\n</tr>\r\n<tr>\r\n  <td>");
  await r.write(r.text(r.get(r.get(s, "lang"), "userdb_remote_storage_sign")));
  await r.write("</td>\r\n  <td><input type=\"text\" name=\"userdb_remote_storage_sign\" value=\"");
  await r.write(r.text(r.get(s, "userdb_remote_storage_sign")));
  await r.write("\" size=\"30\"></td>\r\n  <td>");
  await r.write(r.text(r.get(r.get(s, "lang"), "userdb_remote_storage_sign_comment")));
  await r.write("</td>\r\n</tr>\r\n<tr>\r\n  <td>");
  await r.write(r.text(r.get(r.get(s, "lang"), "userdb_remote_storage_pass")));
  await r.write("</td>\r\n  <td><input type=\"password\" name=\"userdb_remote_storage_pass\" value=\"");
  await r.write(r.text(r.get(s, "userdb_remote_storage_pass")));
  await r.write("\" size=\"30\"></td>\r\n  <td>");
  await r.write(r.text(r.get(r.get(s, "lang"), "userdb_remote_storage_pass_comment")));
  await r.write("</td>\r\n</tr>\r\n<tr>\r\n  <td>");
  await r.write(r.text(r.get(r.get(s, "lang"), "replay_remote_send")));
  await r.write("</td>\r\n  <td><input type=\"radio\" name=\"replay_remote_send\" value=\"1\" ");
  if (r.truth(r.get(s, "replay_remote_send"))) {
    await r.write("checked=\"true\"");
  }
  await r.write(">");
  await r.write(r.text(r.get(r.get(s, "lang"), "on")));
  await r.write("&nbsp;&nbsp;&nbsp;<input type=\"radio\" name=\"replay_remote_send\" value=\"0\" ");
  if (r.truth((!r.truth(r.get(s, "replay_remote_send"))))) {
    await r.write("checked=\"true\"");
  }
  await r.write(">");
  await r.write(r.text(r.get(r.get(s, "lang"), "off")));
  await r.write("</td>\r\n  <td>");
  await r.write(r.text(r.get(r.get(s, "lang"), "replay_remote_send_comment")));
  await r.write("</td>\r\n</tr>\r\n<tr>\r\n  <td>");
  await r.write(r.text(r.get(r.get(s, "lang"), "replay_remote_storage")));
  await r.write("</td>\r\n  <td><input type=\"text\" name=\"replay_remote_storage\" value=\"");
  await r.write(r.text(r.get(s, "replay_remote_storage")));
  await r.write("\" size=\"30\"></td>\r\n  <td>");
  await r.write(r.text(r.get(r.get(s, "lang"), "replay_remote_storage_comment")));
  await r.write("</td>\r\n</tr>\r\n<tr>\r\n  <td>");
  await r.write(r.text(r.get(r.get(s, "lang"), "replay_remote_storage_sign")));
  await r.write("</td>\r\n  <td><input type=\"text\" name=\"replay_remote_storage_sign\" value=\"");
  await r.write(r.text(r.get(s, "replay_remote_storage_sign")));
  await r.write("\" size=\"30\"></td>\r\n  <td>");
  await r.write(r.text(r.get(r.get(s, "lang"), "replay_remote_storage_sign_comment")));
  await r.write("</td>\r\n</tr>\r\n<tr>\r\n  <td>");
  await r.write(r.text(r.get(r.get(s, "lang"), "replay_remote_storage_key")));
  await r.write("</td>\r\n  <td><input type=\"password\" name=\"replay_remote_storage_key\" value=\"");
  await r.write(r.text(r.get(s, "replay_remote_storage_key")));
  await r.write("\" size=\"30\"></td>\r\n  <td>");
  await r.write(r.text(r.get(r.get(s, "lang"), "replay_remote_storage_key_comment")));
  await r.write("</td>\r\n</tr>\r\n</table>\r\n<input type=\"submit\" value=\"提交\" onclick=\"$('command').value='edit';\">\r\n</form>");
return 1;
}
