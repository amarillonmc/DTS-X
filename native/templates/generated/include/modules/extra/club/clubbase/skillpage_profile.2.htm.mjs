// Generated from include/modules/extra/club/clubbase/skillpage_profile.2.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  await r.write("<div class=\"cmd_positioner common_cmd\">\r\n<input type=\"button\" class=\"cmd_button common_cmd glow_buttons white\" id=\"v\"  value=\"技能表\" \r\nonclick=\"$('mode').value='special';$('command').value='viewskills';postCmd('gamecmd','command.php',this);\">\r\n</div>");
return 1;
}
