// Generated from include/modules/base/weapon/dualwep/dualwep_att_method_profile.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  if (r.truth((await r.module("dualwep", "get_sec_attack_method", r.get(s, "sdata"))))) {
    await r.write("<input type=\"button\" class=\"cmdbutton\" id=\"sp_dualwep_am\" value=\"武器系别\" onclick=\"$('command').value='special';$('subcmd').name='sp_cmd';$('subcmd').value='sp_dualwep_am';postCmd('gamecmd','command.php');this.disabled=true;\">");
  }
return 1;
}
