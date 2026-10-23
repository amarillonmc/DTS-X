// Generated from include/modules/base/team/team.2.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  await r.write("<input type=\"hidden\" id=\"mode\" name=\"mode\" value=\"team\">\r\n<input type=\"hidden\" id=\"command\" name=\"command\" value=\"");
  await r.write(r.text(r.get(s, "teamcmd")));
  await r.write("\">\r\n<div class=\"cmd_row\">\r\n<br>\r\n<div>队伍名称 : <input size=\"15\" type=\"text\" name=\"nteamID\" maxlength=\"30\"> <span class=\"grey\">15个字以内。</span></div>\r\n<br>\r\n<div>队伍密码 : <input size=\"15\" type=\"text\" name=\"nteamPass\" maxlength=\"30\"> <span class=\"grey\">15个字以内。</span></div>\r\n</div><div class=\"cmd_row\">\r\n<div class=\"cmd_positioner common_cmd\" style=\"width:167px\">\r\n<input type=\"button\" class=\"cmd_button common_cmd glow_buttons white\" value=\"");
  if (r.truth(r.equal("teammake", r.get(s, "teamcmd")))) {
    await r.write("组建队伍");
  } else {
    await r.write("加入队伍");
  }
  await r.write("\" \r\nonclick=\"postCmd('gamecmd','command.php',this);\">\r\n</div><div class=\"cmd_positioner common_cmd\" style=\"width:167px\">\r\n<input type=\"button\" class=\"cmd_button common_cmd glow_buttons white\" value=\"返回\" \r\nonclick=\"$('mode').value='command';$('command').value='menu';postCmd('gamecmd','command.php',this);\">\r\n</div>\r\n</div>");
return 1;
}
