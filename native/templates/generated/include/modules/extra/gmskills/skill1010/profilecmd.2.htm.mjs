// Generated from include/modules/extra/gmskills/skill1010/profilecmd.2.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  await r.write("<div class=\"cmd_positioner common_cmd\">\r\n<input type=\"button\" id=\"skill1010_special\" class=\"cmd_button common_cmd glow_buttons white\" value=\"「降神」\" \r\nonclick=\"$('mode').value='special';$('command').value='skill1010_special';$('subcmd').value='mani_page';postCmd('gamecmd','command.php',this);\">\r\n</div>");
return 1;
}
