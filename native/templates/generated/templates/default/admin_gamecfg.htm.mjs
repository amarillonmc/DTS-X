// Generated from templates/default/admin_gamecfg.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  await r.write("<form method=\"post\" name=\"gamecfgmng\" onsubmit=\"admin.php\">\r\n<input type=\"hidden\" name=\"mode\" value=\"gamecfgmng\">\r\n<input type=\"hidden\" id=\"command\" name=\"command\" value=\"\">\r\n<table class=\"admin\">\r\n<tr>\r\n<th>");
  await r.write(r.text(r.get(r.get(s, "lang"), "variable")));
  await r.write("</th>\r\n<th>");
  await r.write(r.text(r.get(r.get(s, "lang"), "value")));
  await r.write("</th>\r\n<th>");
  await r.write(r.text(r.get(r.get(s, "lang"), "comment")));
  await r.write("</th>\r\n</tr>\r\n<tr>\r\n<td>");
  await r.write(r.text(r.get(r.get(s, "lang"), "areaadd")));
  await r.write("</td>\r\n<td><input type=\"text\" name=\"areaadd\" value=\"");
  await r.write(r.text(r.get(s, "areaadd")));
  await r.write("\" size=\"30\"></td>\r\n<td>");
  await r.write(r.text(r.get(r.get(s, "lang"), "areaadd_comment")));
  await r.write("</td>\r\n</tr>\r\n<tr>\r\n<td>");
  await r.write(r.text(r.get(r.get(s, "lang"), "arealimit")));
  await r.write("</td>\r\n<td><input type=\"text\" name=\"arealimit\" value=\"");
  await r.write(r.text(r.get(s, "arealimit")));
  await r.write("\" size=\"30\"></td>\r\n<td>");
  await r.write(r.text(r.get(r.get(s, "lang"), "arealimit_comment")));
  await r.write("</td>\r\n</tr>\r\n<tr>\r\n<td>");
  await r.write(r.text(r.get(r.get(s, "lang"), "areaesc")));
  await r.write("</td>\r\n<td><input type=\"radio\" name=\"areaesc\" value=\"1\" ");
  if (r.truth(r.get(s, "areaesc"))) {
    await r.write("checked=\"true\"");
  }
  await r.write(">");
  await r.write(r.text(r.get(r.get(s, "lang"), "on")));
  await r.write("&nbsp;&nbsp;&nbsp;<input type=\"radio\" name=\"areaesc\" value=\"0\" ");
  if (r.truth((!r.truth(r.get(s, "areaesc"))))) {
    await r.write("checked=\"true\"");
  }
  await r.write(">");
  await r.write(r.text(r.get(r.get(s, "lang"), "off")));
  await r.write("</td>\r\n<td>");
  await r.write(r.text(r.get(r.get(s, "lang"), "areaesc_comment")));
  await r.write("</td>\r\n</tr>\r\n<tr>\r\n<td>");
  await r.write(r.text(r.get(r.get(s, "lang"), "antiAFKertime")));
  await r.write("</td>\r\n<td><input type=\"text\" name=\"antiAFKertime\" value=\"");
  await r.write(r.text(r.get(s, "antiAFKertime_normal")));
  await r.write("\" size=\"30\"></td>\r\n<td>");
  await r.write(r.text(r.get(r.get(s, "lang"), "antiAFKertime_comment")));
  await r.write("</td>\r\n</tr>\r\n<tr>\r\n<td>");
  await r.write(r.text(r.get(r.get(s, "lang"), "corpseprotect")));
  await r.write("</td>\r\n<td><input type=\"text\" name=\"corpseprotect\" value=\"");
  await r.write(r.text(r.get(s, "corpseprotect")));
  await r.write("\" size=\"30\"></td>\r\n<td>");
  await r.write(r.text(r.get(r.get(s, "lang"), "corpseprotect_comment")));
  await r.write("</td>\r\n</tr>\r\n<tr>\r\n<td>");
  await r.write(r.text(r.get(r.get(s, "lang"), "coldtimeon")));
  await r.write("</td>\r\n<td><input type=\"radio\" name=\"coldtimeon\" value=\"1\" ");
  if (r.truth(r.get(s, "coldtimeon"))) {
    await r.write("checked=\"true\"");
  }
  await r.write(">");
  await r.write(r.text(r.get(r.get(s, "lang"), "on")));
  await r.write("&nbsp;&nbsp;&nbsp;<input type=\"radio\" name=\"coldtimeon\" value=\"0\" ");
  if (r.truth((!r.truth(r.get(s, "coldtimeon"))))) {
    await r.write("checked=\"true\"");
  }
  await r.write(">");
  await r.write(r.text(r.get(r.get(s, "lang"), "off")));
  await r.write("</td>\r\n<td>");
  await r.write(r.text(r.get(r.get(s, "lang"), "coldtimeon_comment")));
  await r.write("</td>\r\n</tr>\r\n<tr>\r\n<td>");
  await r.write(r.text(r.get(r.get(s, "lang"), "movecoldtime")));
  await r.write("</td>\r\n<td><input type=\"text\" name=\"movecoldtime\" value=\"");
  await r.write(r.text(r.get(s, "movecoldtime")));
  await r.write("\" size=\"30\"></td>\r\n<td>");
  await r.write(r.text(r.get(r.get(s, "lang"), "movecoldtime_comment")));
  await r.write("</td>\r\n</tr>\r\n<tr>\r\n<td>");
  await r.write(r.text(r.get(r.get(s, "lang"), "searchcoldtime")));
  await r.write("</td>\r\n<td><input type=\"text\" name=\"searchcoldtime\" value=\"");
  await r.write(r.text(r.get(s, "searchcoldtime")));
  await r.write("\" size=\"30\"></td>\r\n<td>");
  await r.write(r.text(r.get(r.get(s, "lang"), "searchcoldtime_comment")));
  await r.write("</td>\r\n</tr>\r\n<tr>\r\n<td>");
  await r.write(r.text(r.get(r.get(s, "lang"), "itemusecoldtime")));
  await r.write("</td>\r\n<td><input type=\"text\" name=\"itemusecoldtime\" value=\"");
  await r.write(r.text(r.get(s, "itemusecoldtime")));
  await r.write("\" size=\"30\"></td>\r\n<td>");
  await r.write(r.text(r.get(r.get(s, "lang"), "itemusecoldtime_comment")));
  await r.write("</td>\r\n</tr>\r\n<tr>\r\n<td>");
  await r.write(r.text(r.get(r.get(s, "lang"), "showcoldtimer")));
  await r.write("</td>\r\n<td><input type=\"radio\" name=\"showcoldtimer\" value=\"1\" ");
  if (r.truth(r.get(s, "showcoldtimer"))) {
    await r.write("checked=\"true\"");
  }
  await r.write(">");
  await r.write(r.text(r.get(r.get(s, "lang"), "on")));
  await r.write("&nbsp;&nbsp;&nbsp;<input type=\"radio\" name=\"showcoldtimer\" value=\"0\" ");
  if (r.truth((!r.truth(r.get(s, "showcoldtimer"))))) {
    await r.write("checked=\"true\"");
  }
  await r.write(">");
  await r.write(r.text(r.get(r.get(s, "lang"), "off")));
  await r.write("</td>\r\n<td>");
  await r.write(r.text(r.get(r.get(s, "lang"), "showcoldtimer_comment")));
  await r.write("</td>\r\n</tr>\r\n<tr>\r\n<td>");
  await r.write(r.text(r.get(r.get(s, "lang"), "validlimit")));
  await r.write("</td>\r\n<td><input type=\"text\" name=\"validlimit\" value=\"");
  await r.write(r.text(r.get(s, "validlimit")));
  await r.write("\" size=\"30\"></td>\r\n<td>");
  await r.write(r.text(r.get(r.get(s, "lang"), "validlimit_comment")));
  await r.write("</td>\r\n</tr>\r\n<tr>\r\n<td>");
  await r.write(r.text(r.get(r.get(s, "lang"), "splimit")));
  await r.write("</td>\r\n<td><input type=\"text\" name=\"splimit\" value=\"");
  await r.write(r.text(r.get(s, "splimit")));
  await r.write("\" size=\"30\"></td>\r\n<td>");
  await r.write(r.text(r.get(r.get(s, "lang"), "splimit_comment")));
  await r.write("</td>\r\n</tr>\r\n<tr>\r\n<td>");
  await r.write(r.text(r.get(r.get(s, "lang"), "hplimit")));
  await r.write("</td>\r\n<td><input type=\"text\" name=\"hplimit\" value=\"");
  await r.write(r.text(r.get(s, "hplimit")));
  await r.write("\" size=\"30\"></td>\r\n<td>");
  await r.write(r.text(r.get(r.get(s, "lang"), "hplimit_comment")));
  await r.write("</td>\r\n</tr>\r\n<tr>\r\n<td>");
  await r.write(r.text(r.get(r.get(s, "lang"), "rest_sleep_time")));
  await r.write("</td>\r\n<td><input type=\"text\" name=\"rest_sleep_time\" value=\"");
  await r.write(r.text(r.get(s, "rest_sleep_time")));
  await r.write("\" size=\"30\"></td>\r\n<td>");
  await r.write(r.text(r.get(r.get(s, "lang"), "rest_sleep_time_comment")));
  await r.write("</td>\r\n</tr>\r\n<tr>\r\n<td>");
  await r.write(r.text(r.get(r.get(s, "lang"), "rest_heal_time")));
  await r.write("</td>\r\n<td><input type=\"text\" name=\"rest_heal_time\" value=\"");
  await r.write(r.text(r.get(s, "rest_heal_time")));
  await r.write("\" size=\"30\"></td>\r\n<td>");
  await r.write(r.text(r.get(r.get(s, "lang"), "rest_heal_time_comment")));
  await r.write("</td>\r\n</tr>\r\n<tr>\r\n<td>");
  await r.write(r.text(r.get(r.get(s, "lang"), "teamlimit")));
  await r.write("</td>\r\n<td><input type=\"text\" name=\"teamlimit\" value=\"");
  await r.write(r.text(r.get(s, "teamlimit")));
  await r.write("\" size=\"30\"></td>\r\n<td>");
  await r.write(r.text(r.get(r.get(s, "lang"), "teamlimit_comment")));
  await r.write("</td>\r\n</tr>\r\n</table>\r\n<input type=\"submit\" value=\"修改\" onclick=\"$('command').value='edit';\">\r\n</form>");
return 1;
}
