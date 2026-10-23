// Generated from include/modules/base/weapon/dualwep/dualwep_att_method_profile.2.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  if (r.truth((await r.module("dualwep", "get_sec_attack_method", r.get(s, "sdata"))))) {
    await r.write("<div class=\"cmd_positioner common_cmd\">\r\n<input type=\"button\" class=\"cmd_button common_cmd glow_buttons white\" value=\"切换武器系别\" \r\nonclick=\"$('command').value='special';$('subcmd').name='sp_cmd';$('subcmd').value='sp_dualwep_am';postCmd('gamecmd','command.php',this);\">\r\n</div>");
  }
return 1;
}
