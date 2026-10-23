// Generated from include/modules/extra/attr/wepchange/wepchange_profile.2.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  if (r.truth((await r.module("itemmain", "check_in_itmsk", "j", r.get(s, "wepsk"))))) {
    await r.write("<div class=\"cmd_positioner common_cmd\">\r\n<input type=\"button\" class=\"cmd_button common_cmd glow_buttons white\" value=\"变换武器形态\" \r\nonclick=\"$('command').value='special';$('subcmd').name='sp_cmd';$('subcmd').value='sp_weapon';postCmd('gamecmd','command.php',this);\">\r\n</div>");
  }
return 1;
}
