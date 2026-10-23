// Generated from templates/default/admin_globalgamemng.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  await r.write("<form method=\"post\" name=\"globalgamemng\" onsubmit=\"admin.php\">\r\n<input type=\"hidden\" name=\"mode\" value=\"globalgamemng\">\r\n<input type=\"hidden\" id=\"command\" name=\"command\" value=\"\">\t\r\n<table class=\"admin\">\r\n<tr>\r\n<th>");
  await r.write(r.text(r.get(r.get(s, "lang"), "variable")));
  await r.write("</th>\r\n<th>");
  await r.write(r.text(r.get(r.get(s, "lang"), "value")));
  await r.write("</th>\r\n<th>");
  await r.write(r.text(r.get(r.get(s, "lang"), "comment")));
  await r.write("</th>\r\n</tr>\r\n<tr>\r\n<td>");
  await r.write(r.text(r.get(r.get(s, "lang"), "adminmsg")));
  await r.write("</td>\r\n<td><textarea cols=\"30\" rows=\"4\" style=\"overflow:auto\" name=\"adminmsg\" value=\"\">");
  await r.write(r.text(r.get(s, "adminmsg")));
  await r.write("</textarea></td>\r\n<td>");
  await r.write(r.text(r.get(r.get(s, "lang"), "adminmsg_comment")));
  await r.write("</td>\r\n</tr>\r\n<tr>\r\n<td>");
  await r.write(r.text(r.get(r.get(s, "lang"), "systemmsg")));
  await r.write("</td>\r\n<td><textarea cols=\"30\" rows=\"4\" style=\"overflow:auto\" name=\"systemmsg\" value=\"\">");
  await r.write(r.text(r.get(s, "systemmsg")));
  await r.write("</textarea></td>\r\n<td>");
  await r.write(r.text(r.get(r.get(s, "lang"), "systemmsg_comment")));
  await r.write("</td>\r\n</tr>\r\n<tr>\r\n<td>");
  await r.write(r.text(r.get(r.get(s, "lang"), "startmode")));
  await r.write("</td>\r\n<td>");
  await r.write(r.text(r.get(s, "startmode_input")));
  await r.write("</td>\r\n<td>");
  await r.write(r.text(r.get(r.get(s, "lang"), "startmode_comment")));
  await r.write("</td>\r\n</tr>\r\n<tr>\r\n<td>");
  await r.write(r.text(r.get(r.get(s, "lang"), "starthour")));
  await r.write("</td>\r\n<td><input type=\"text\" name=\"starthour\" value=\"");
  await r.write(r.text(r.get(s, "starthour")));
  await r.write("\" size=\"30\"></td>\r\n<td>");
  await r.write(r.text(r.get(r.get(s, "lang"), "starthour_comment")));
  await r.write("</td>\r\n</tr>\r\n<tr>\r\n<td>");
  await r.write(r.text(r.get(r.get(s, "lang"), "startmin")));
  await r.write("</td>\r\n<td><input type=\"text\" name=\"startmin\" value=\"");
  await r.write(r.text(r.get(s, "startmin")));
  await r.write("\" size=\"30\"></td>\r\n<td>");
  await r.write(r.text(r.get(r.get(s, "lang"), "startmin_comment")));
  await r.write("</td>\r\n</tr>\r\n<tr>\r\n<td>");
  await r.write(r.text(r.get(r.get(s, "lang"), "readymin")));
  await r.write("</td>\r\n<td><input type=\"text\" name=\"readymin\" value=\"");
  await r.write(r.text(r.get(s, "readymin")));
  await r.write("\" size=\"30\"></td>\r\n<td>");
  await r.write(r.text(r.get(r.get(s, "lang"), "readymin_comment")));
  await r.write("</td>\r\n</tr>\r\n<tr>\r\n<td>");
  await r.write(r.text(r.get(r.get(s, "lang"), "iplimit")));
  await r.write("</td>\r\n<td><input type=\"text\" name=\"iplimit\" value=\"");
  await r.write(r.text(r.get(s, "iplimit")));
  await r.write("\" size=\"30\"></td>\r\n<td>");
  await r.write(r.text(r.get(r.get(s, "lang"), "iplimit_comment")));
  await r.write("</td>\r\n</tr>\r\n<tr>\r\n<td>");
  await r.write(r.text(r.get(r.get(s, "lang"), "newslimit")));
  await r.write("</td>\r\n<td><input type=\"text\" name=\"newslimit\" value=\"");
  await r.write(r.text(r.get(s, "newslimit")));
  await r.write("\" size=\"30\"></td>\r\n<td>");
  await r.write(r.text(r.get(r.get(s, "lang"), "newslimit_comment")));
  await r.write("</td>\r\n</tr>\r\n<tr>\r\n<td>");
  await r.write(r.text(r.get(r.get(s, "lang"), "alivelimit")));
  await r.write("</td>\r\n<td><input type=\"text\" name=\"alivelimit\" value=\"");
  await r.write(r.text(r.get(s, "alivelimit")));
  await r.write("\" size=\"30\"></td>\r\n<td>");
  await r.write(r.text(r.get(r.get(s, "lang"), "alivelimit_comment")));
  await r.write("</td>\r\n</tr>\r\n<tr>\r\n<td>");
  await r.write(r.text(r.get(r.get(s, "lang"), "winlimit")));
  await r.write("</td>\r\n<td><input type=\"text\" name=\"winlimit\" value=\"");
  await r.write(r.text(r.get(s, "winlimit")));
  await r.write("\" size=\"30\"></td>\r\n<td>");
  await r.write(r.text(r.get(r.get(s, "lang"), "winlimit_comment")));
  await r.write("</td>\r\n</tr>\r\n<tr>\r\n<td>");
  await r.write(r.text(r.get(r.get(s, "lang"), "chatlimit")));
  await r.write("</td>\r\n<td><input type=\"text\" name=\"chatlimit\" value=\"");
  await r.write(r.text(r.get(s, "chatlimit")));
  await r.write("\" size=\"30\"></td>\r\n<td>");
  await r.write(r.text(r.get(r.get(s, "lang"), "chatlimit_comment")));
  await r.write("</td>\r\n</tr>\r\n<tr>\r\n<td>");
  await r.write(r.text(r.get(r.get(s, "lang"), "chatrefresh")));
  await r.write("</td>\r\n<td><input type=\"text\" name=\"chatrefresh\" value=\"");
  await r.write(r.text(r.get(s, "chatrefresh")));
  await r.write("\" size=\"30\"></td>\r\n<td>");
  await r.write(r.text(r.get(r.get(s, "lang"), "chatrefresh_comment")));
  await r.write("</td>\r\n</tr>\r\n<tr>\r\n<td>");
  await r.write(r.text(r.get(r.get(s, "lang"), "chatinnews")));
  await r.write("</td>\r\n<td><input type=\"text\" name=\"chatinnews\" value=\"");
  await r.write(r.text(r.get(s, "chatinnews")));
  await r.write("\" size=\"30\"></td>\r\n<td>");
  await r.write(r.text(r.get(r.get(s, "lang"), "chatinnews_comment")));
  await r.write("</td>\r\n</tr>\r\n<tr>\r\n<td>");
  await r.write(r.text(r.get(r.get(s, "lang"), "max_room_num")));
  await r.write("</td>\r\n<td><input type=\"text\" name=\"max_room_num\" value=\"");
  await r.write(r.text(r.get(s, "max_room_num")));
  await r.write("\" size=\"30\"></td>\r\n<td>");
  await r.write(r.text(r.get(r.get(s, "lang"), "max_room_num_comment")));
  await r.write("</td>\r\n</tr>\r\n<tr>\r\n<td>");
  await r.write(r.text(r.get(r.get(s, "lang"), "disable_access")));
  await r.write("</td>\r\n<td>\r\n<input type=\"radio\" name=\"disable_access\" value=\"1\" ");
  if (r.truth(r.get(s, "disable_access"))) {
    await r.write("checked");
  }
  await r.write(">是\r\n&nbsp;&nbsp;&nbsp;\r\n<input type=\"radio\" name=\"disable_access\" value=\"0\" ");
  if (r.truth((!r.truth(r.get(s, "disable_access"))))) {
    await r.write("checked");
  }
  await r.write(">否\r\n</td>\r\n<td>");
  await r.write(r.text(r.get(r.get(s, "lang"), "disable_access_comment")));
  await r.write("</td>\r\n</tr>\r\n<tr>\r\n<td>");
  await r.write(r.text(r.get(r.get(s, "lang"), "disable_event")));
  await r.write("</td>\r\n<td>\r\n<input type=\"radio\" name=\"disable_event\" value=\"1\" ");
  if (r.truth(r.get(s, "disable_event"))) {
    await r.write("checked");
  }
  await r.write(">是\r\n&nbsp;&nbsp;&nbsp;\r\n<input type=\"radio\" name=\"disable_event\" value=\"0\" ");
  if (r.truth((!r.truth(r.get(s, "disable_event"))))) {
    await r.write("checked");
  }
  await r.write(">否\r\n</td>\r\n<td>");
  await r.write(r.text(r.get(r.get(s, "lang"), "disable_event_comment")));
  await r.write("</td>\r\n</tr>\r\n<tr>\r\n<td>");
  await r.write(r.text(r.get(r.get(s, "lang"), "disable_newroom")));
  await r.write("</td>\r\n<td>\r\n<input type=\"radio\" name=\"disable_newroom\" value=\"1\" ");
  if (r.truth(r.get(s, "disable_newroom"))) {
    await r.write("checked");
  }
  await r.write(">是\r\n&nbsp;&nbsp;&nbsp;\r\n<input type=\"radio\" name=\"disable_newroom\" value=\"0\" ");
  if (r.truth((!r.truth(r.get(s, "disable_newroom"))))) {
    await r.write("checked");
  }
  await r.write(">否\r\n</td>\r\n<td>");
  await r.write(r.text(r.get(r.get(s, "lang"), "disable_newroom_comment")));
  await r.write("</td>\r\n</tr>\r\n<tr>\r\n<td>");
  await r.write(r.text(r.get(r.get(s, "lang"), "disable_newgame")));
  await r.write("</td>\r\n<td>\r\n<input type=\"radio\" name=\"disable_newgame\" value=\"1\" ");
  if (r.truth(r.get(s, "disable_newgame"))) {
    await r.write("checked");
  }
  await r.write(">是\r\n&nbsp;&nbsp;&nbsp;\r\n<input type=\"radio\" name=\"disable_newgame\" value=\"0\" ");
  if (r.truth((!r.truth(r.get(s, "disable_newgame"))))) {
    await r.write("checked");
  }
  await r.write(">否\r\n</td>\r\n<td>");
  await r.write(r.text(r.get(r.get(s, "lang"), "disable_newgame_comment")));
  await r.write("</td>\r\n</tr>\r\n</table>\r\n<input type=\"submit\" value=\"修改\" onclick=\"$('command').value='edit';\">\r\n</form> ");
return 1;
}
