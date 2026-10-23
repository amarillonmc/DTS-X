// Generated from include/modules/extra/instance/gtype5/skill1005/profilecmd.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  await r.write("<input type=\"button\" class=\"cmdbutton\" id=\"sp_wdebug\"  value=\"进行修复\" onclick=\"$('mode').value='special';$('command').value='skill1005_special';$('subcmd').value='wdebug';postCmd('gamecmd','command.php');this.disabled=true;\">\r\n");
return 1;
}
