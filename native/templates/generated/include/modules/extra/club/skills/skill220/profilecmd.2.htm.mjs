// Generated from include/modules/extra/club/skills/skill220/profilecmd.2.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  await r.write("<div class=\"cmd_positioner common_cmd\">\r\n<input type=\"button\" id=\"sp_pcheck\" class=\"cmd_button common_cmd glow_buttons white\" value=\"检查毒物\" \r\nonclick=\"$('mode').value='special';$('command').value='skill220_special';$('subcmd').value='pcheck';postCmd('gamecmd','command.php',this);\">\r\n</div>");
return 1;
}
