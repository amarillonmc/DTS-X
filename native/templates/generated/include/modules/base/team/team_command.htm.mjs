// Generated from include/modules/base/team/team_command.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  if (r.truth((await r.module("team", "check_team_button_exist")))) {
    if (r.truth((!r.truth(r.get(s, "teamID"))))) {
      await r.write("<input type=\"button\" class=\"cmdbutton\" id=\"teammake\"  value=\"组建队伍\" onclick=\"$('command').value='team';$('subcmd').name='teamcmd';$('subcmd').value='teammake';postCmd('gamecmd','command.php');this.disabled=true;\">\r\n<input type=\"button\" class=\"cmdbutton\" id=\"teammake\"  value=\"加入队伍\" onclick=\"$('command').value='team';$('subcmd').name='teamcmd';$('subcmd').value='teamjoin';postCmd('gamecmd','command.php');this.disabled=true;\">");
    } else {
      await r.write("<input type=\"button\" class=\"cmdbutton\" id=\"teammake\"  value=\"脱离队伍\" onclick=\"$('command').value='team';$('subcmd').name='teamcmd';$('subcmd').value='teamquit';postCmd('gamecmd','command.php');this.disabled=true;\">");
    }
    await r.write("<br />");
  }
return 1;
}
