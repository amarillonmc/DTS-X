// Generated from templates/default/admin_menu.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  await r.write("<form method=\"post\" name=\"admin\" onsubmit=\"admin.php\">\r\n<input type=\"hidden\" name=\"mode\" id=\"mode\" value=\"admin_menu\">\r\n<input type=\"hidden\" name=\"command\" id=\"command\" value=\"menu\">\r\n<table>\r\n<tr>\r\n<td valign=\"top\">\r\n<table class=\"admin\">\r\n<tr>\r\n<td colspan=3 class=\"tdtitle\">");
  await r.write(r.text(r.get(r.get(s, "lang"), "emenu")));
  await r.write("</td>\r\n</tr>\r\n<tr>\r\n<th>");
  await r.write(r.text(r.get(r.get(s, "lang"), "options")));
  await r.write("</th>\r\n<th width=\"240\">");
  await r.write(r.text(r.get(r.get(s, "lang"), "comments")));
  await r.write("</th>\r\n<th width=\"30\">");
  await r.write(r.text(r.get(r.get(s, "lang"), "groups")));
  await r.write("</th>\r\n</tr>\r\n<tr height=\"45px\">\r\n<td><input type=\"submit\" style=\"width:100;height:40;\" value=\"");
  await r.write(r.text(r.get(r.get(s, "lang"), "gmlist")));
  await r.write("\" onclick=\"$('command').value='gmlist'\" ");
  if (r.truth((r.compare(r.get(s, "mygroup"), r.get(r.get(s, "admin_cmd_list"), "gmlist")) < 0))) {
    await r.write("disabled=\"true\"");
  }
  await r.write("></td>\r\n<td>");
  await r.write(r.text(r.get(r.get(s, "lang"), "gmlist_comment")));
  await r.write("</td>\r\n<td>");
  await r.write(r.text(r.get(r.get(s, "admin_cmd_list"), "gmlist")));
  await r.write("</td>\r\n</tr>\r\n<tr height=\"45px\">\r\n<td><input type=\"submit\" style=\"width:100;height:40;\" value=\"");
  await r.write(r.text(r.get(r.get(s, "lang"), "urlist")));
  await r.write("\" onclick=\"$('command').value='urlist'\" ");
  if (r.truth((r.compare(r.get(s, "mygroup"), r.get(r.get(s, "admin_cmd_list"), "urlist")) < 0))) {
    await r.write("disabled=\"true\"");
  }
  await r.write("></td>\r\n<td>");
  await r.write(r.text(r.get(r.get(s, "lang"), "urlist_comment")));
  await r.write("</td>\r\n<td>");
  await r.write(r.text(r.get(r.get(s, "admin_cmd_list"), "urlist")));
  await r.write("</td>\r\n</tr>\r\n<tr height=\"45px\">\r\n<td><input type=\"submit\" style=\"width:100;height:40;\" value=\"");
  await r.write(r.text(r.get(r.get(s, "lang"), "configmng")));
  await r.write("\" onclick=\"$('command').value='configmng'\" ");
  if (r.truth((r.compare(r.get(s, "mygroup"), r.get(r.get(s, "admin_cmd_list"), "configmng")) < 0))) {
    await r.write("disabled=\"true\"");
  }
  await r.write("></td>\r\n<td>");
  await r.write(r.text(r.get(r.get(s, "lang"), "configmng_comment")));
  await r.write("</td>\r\n<td>");
  await r.write(r.text(r.get(r.get(s, "admin_cmd_list"), "configmng")));
  await r.write("</td>\r\n</tr>\r\n<tr height=\"45px\">\r\n<td><input type=\"submit\" style=\"width:100;height:40;\" value=\"");
  await r.write(r.text(r.get(r.get(s, "lang"), "globalgamemng")));
  await r.write("\" onclick=\"$('command').value='globalgamemng'\" ");
  if (r.truth((r.compare(r.get(s, "mygroup"), r.get(r.get(s, "admin_cmd_list"), "globalgamemng")) < 0))) {
    await r.write("disabled=\"true\"");
  }
  await r.write("></td>\r\n<td>");
  await r.write(r.text(r.get(r.get(s, "lang"), "globalgamemng_comment")));
  await r.write("</td>\r\n<td>");
  await r.write(r.text(r.get(r.get(s, "admin_cmd_list"), "globalgamemng")));
  await r.write("</td>\r\n</tr>\r\n<tr height=\"45px\">\r\n<td><input type=\"submit\" style=\"width:100;height:40;\" value=\"");
  await r.write(r.text(r.get(r.get(s, "lang"), "gamecfgmng")));
  await r.write("\" onclick=\"$('command').value='gamecfgmng'\" ");
  if (r.truth((r.compare(r.get(s, "mygroup"), r.get(r.get(s, "admin_cmd_list"), "gamecfgmng")) < 0))) {
    await r.write("disabled=\"true\"");
  }
  await r.write("></td>\r\n<td>");
  await r.write(r.text(r.get(r.get(s, "lang"), "gamecfgmng_comment")));
  await r.write("</td>\r\n<td>");
  await r.write(r.text(r.get(r.get(s, "admin_cmd_list"), "gamecfgmng")));
  await r.write("</td>\r\n</tr>\r\n<tr height=\"45px\">\r\n<td><input type=\"submit\" style=\"width:100;height:40;\" value=\"");
  await r.write(r.text(r.get(r.get(s, "lang"), "banlistmng")));
  await r.write("\" onclick=\"$('command').value='banlistmng'\" ");
  if (r.truth((r.compare(r.get(s, "mygroup"), r.get(r.get(s, "admin_cmd_list"), "banlistmng")) < 0))) {
    await r.write("disabled=\"true\"");
  }
  await r.write("></td>\r\n<td>");
  await r.write(r.text(r.get(r.get(s, "lang"), "banlistmng_comment")));
  await r.write("</td>\r\n<td>");
  await r.write(r.text(r.get(r.get(s, "admin_cmd_list"), "banlistmng")));
  await r.write("</td>\r\n</tr>\r\n<tr height=\"45px\">\r\n<td><input type=\"submit\" style=\"width:100;height:40;\" value=\"");
  await r.write(r.text(r.get(r.get(s, "lang"), "roomclose")));
  await r.write("\" onclick=\"$('command').value='roomclose'\" ");
  if (r.truth((r.compare(r.get(s, "mygroup"), r.get(r.get(s, "admin_cmd_list"), "roomclose")) < 0))) {
    await r.write("disabled=\"true\"");
  }
  await r.write("></td>\r\n<td>");
  await r.write(r.text(r.get(r.get(s, "lang"), "roomclose_comment")));
  await r.write("</td>\r\n<td>");
  await r.write(r.text(r.get(r.get(s, "admin_cmd_list"), "roomclose")));
  await r.write("</td>\r\n</tr>\r\n\r\n</table>\r\n</td>\r\n<td valign=\"top\">\t\r\n<table class=\"admin\">\r\n<tr>\r\n<td colspan=3 class=\"tdtitle\">");
  await r.write(r.text(r.get(r.get(s, "lang"), "gmenu")));
  await r.write(" ");
  if (r.truth(r.get(s, "room_prefix"))) {
    await r.write(r.text(r.get(r.get(s, "lang"), "room")));
    await r.write(r.text(r.get(s, "room_prefix")));
  } else {
    await r.write(r.text(r.get(r.get(s, "lang"), "standard")));
  }
  await r.write("</td>\r\n</tr>\r\n<tr>\r\n<th>");
  await r.write(r.text(r.get(r.get(s, "lang"), "options")));
  await r.write("</th>\r\n<th width=\"240\">");
  await r.write(r.text(r.get(r.get(s, "lang"), "comments")));
  await r.write("</th>\r\n<th width=\"30\">");
  await r.write(r.text(r.get(r.get(s, "lang"), "groups")));
  await r.write("</th>\r\n</tr>\r\n<tr height=\"45px\">\r\n<td><input type=\"submit\" style=\"width:100;height:40;\" value=\"");
  await r.write(r.text(r.get(r.get(s, "lang"), "pcmng")));
  await r.write("\" onclick=\"$('command').value='pcmng'\" ");
  if (r.truth((r.compare(r.get(s, "mygroup"), r.get(r.get(s, "admin_cmd_list"), "pcmng")) < 0))) {
    await r.write("disabled=\"true\"");
  }
  await r.write("></td>\r\n<td>");
  await r.write(r.text(r.get(r.get(s, "lang"), "pcmng_comment")));
  await r.write("</td>\r\n<td>");
  await r.write(r.text(r.get(r.get(s, "admin_cmd_list"), "pcmng")));
  await r.write("</td>\r\n</tr>\r\n<tr height=\"45px\">\r\n<td><input type=\"submit\" style=\"width:100;height:40;\" value=\"");
  await r.write(r.text(r.get(r.get(s, "lang"), "npcmng")));
  await r.write("\" onclick=\"$('command').value='npcmng'\" ");
  if (r.truth((r.compare(r.get(s, "mygroup"), r.get(r.get(s, "admin_cmd_list"), "npcmng")) < 0))) {
    await r.write("disabled=\"true\"");
  }
  await r.write("></td>\r\n<td>");
  await r.write(r.text(r.get(r.get(s, "lang"), "npcmng_comment")));
  await r.write("</td>\r\n<td>");
  await r.write(r.text(r.get(r.get(s, "admin_cmd_list"), "npcmng")));
  await r.write("</td>\r\n</tr>\r\n<tr height=\"45px\">\r\n<td><input type=\"submit\" style=\"width:100;height:40;\" value=\"");
  await r.write(r.text(r.get(r.get(s, "lang"), "gameinfomng")));
  await r.write("\" onclick=\"$('command').value='gameinfomng'\" ");
  if (r.truth((r.compare(r.get(s, "mygroup"), r.get(r.get(s, "admin_cmd_list"), "gameinfomng")) < 0))) {
    await r.write("disabled=\"true\"");
  }
  await r.write("></td>\r\n<td>");
  await r.write(r.text(r.get(r.get(s, "lang"), "gameinfomng_comment")));
  await r.write("</td>\r\n<td>");
  await r.write(r.text(r.get(r.get(s, "admin_cmd_list"), "gameinfomng")));
  await r.write("</td>\r\n</tr>\r\n<tr height=\"45px\">\r\n<td><input type=\"submit\" style=\"width:100;height:40;\" value=\"");
  await r.write(r.text(r.get(r.get(s, "lang"), "antiAFKmng")));
  await r.write("\" onclick=\"$('command').value='antiAFKmng'\" ");
  if (r.truth((r.compare(r.get(s, "mygroup"), r.get(r.get(s, "admin_cmd_list"), "antiAFKmng")) < 0))) {
    await r.write("disabled=\"true\"");
  }
  await r.write("></td>\r\n<td>");
  await r.write(r.text(r.get(r.get(s, "lang"), "antiAFKmng_comment")));
  await r.write("</td>\r\n<td>");
  await r.write(r.text(r.get(r.get(s, "admin_cmd_list"), "antiAFKmng")));
  await r.write("</td>\r\n</tr>\r\n<tr height=\"45px\">\r\n<td><input type=\"submit\" style=\"width:100;height:40;\" value=\"");
  await r.write(r.text(r.get(r.get(s, "lang"), "gamecheck")));
  await r.write("\" onclick=\"$('command').value='gamecheck'\" ");
  if (r.truth((r.compare(r.get(s, "mygroup"), r.get(r.get(s, "admin_cmd_list"), "gamecheck")) < 0))) {
    await r.write("disabled=\"true\"");
  }
  await r.write("></td>\r\n<td>");
  await r.write(r.text(r.get(r.get(s, "lang"), "gamecheck_comment")));
  await r.write("</td>\r\n<td>");
  await r.write(r.text(r.get(r.get(s, "admin_cmd_list"), "gamecheck")));
  await r.write("</td>\r\n</tr>\r\n<tr height=\"45px\">\r\n<td><input type=\"submit\" style=\"width:100;height:40;\" value=\"");
  await r.write(r.text(r.get(r.get(s, "lang"), "adminlogcheck")));
  await r.write("\" onclick=\"$('command').value='adminlogcheck'\" ");
  if (r.truth((r.compare(r.get(s, "mygroup"), r.get(r.get(s, "admin_cmd_list"), "adminlogcheck")) < 0))) {
    await r.write("disabled=\"true\"");
  }
  await r.write("></td>\r\n<td>");
  await r.write(r.text(r.get(r.get(s, "lang"), "adminlogcheck_comment")));
  await r.write("</td>\r\n<td>");
  await r.write(r.text(r.get(r.get(s, "admin_cmd_list"), "adminlogcheck")));
  await r.write("</td>\r\n</tr>\r\n<tr height=\"45px\">\r\n<td><input type=\"submit\" style=\"width:100;height:40;\" value=\"");
  await r.write(r.text(r.get(r.get(s, "lang"), "rankclear")));
  await r.write("\" onclick=\"$('command').value='rankclear'\" ");
  if (r.truth((r.compare(r.get(s, "mygroup"), r.get(r.get(s, "admin_cmd_list"), "rankclear")) < 0))) {
    await r.write("disabled=\"true\"");
  }
  await r.write(" disabled></td>\r\n<td>");
  await r.write(r.text(r.get(r.get(s, "lang"), "rankclear_comment")));
  await r.write("</td>\r\n<td>");
  await r.write(r.text(r.get(r.get(s, "admin_cmd_list"), "rankclear")));
  await r.write("</td>\r\n</tr>\r\n</table>\r\n</td>\r\n</tr>\r\n</table>\r\n\r\n</form> ");
return 1;
}
