// Generated from include/modules/base/team/team_command.2.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  if (r.truth((await r.module("team", "check_team_button_exist")))) {
    await r.write("<div class=\"cmd_row\">");
    if (r.truth((!r.truth(r.get(s, "teamID"))))) {
      await r.write("<div class=\"cmd_positioner common_cmd\" style=\"width:167px\">\r\n<input type=\"button\" class=\"cmd_button common_cmd glow_buttons white\" value=\"组建队伍\" \r\nonclick=\"$('command').value='team';$('subcmd').name='teamcmd';$('subcmd').value='teammake';postCmd('gamecmd','command.php',this);\">\r\n</div><div class=\"cmd_positioner common_cmd\" style=\"width:167px\">\r\n<input type=\"button\" class=\"cmd_button common_cmd glow_buttons white\" value=\"加入队伍\" \r\nonclick=\"$('command').value='team';$('subcmd').name='teamcmd';$('subcmd').value='teamjoin';postCmd('gamecmd','command.php',this);\">\r\n</div>");
    } else {
      await r.write("<div class=\"cmd_positioner common_cmd\" style=\"width:336px\">\r\n<input type=\"button\" class=\"cmd_button common_cmd glow_buttons white\" value=\"脱离队伍\" \r\nonclick=\"$('command').value='team';$('subcmd').name='teamcmd';$('subcmd').value='teamquit';postCmd('gamecmd','command.php',this);\">\r\n</div>");
    }
    await r.write("</div>");
  }
return 1;
}
