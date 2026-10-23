// Generated from include/modules/extra/attr/wepchange/wepchange_profile.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  if (r.truth((r.truth((await r.module("itemmain", "check_in_itmsk", "j", r.get(s, "wepsk")))) || r.truth((await r.module("itemmain", "check_in_itmsk", "T", r.get(s, "wepsk"))))))) {
    await r.write("<input type=\"button\" class=\"cmdbutton\" id=\"sp_weapon\"  value=\"武器模式\" onclick=\"$('command').value='special';$('subcmd').name='sp_cmd';$('subcmd').value='sp_weapon';postCmd('gamecmd','command.php');this.disabled=true;\">");
  }
return 1;
}
