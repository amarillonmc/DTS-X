// Generated from include/modules/extra/card/skills/skill597/profilecmd.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  await r.write("<input type=\"button\" class=\"cmdbutton\" id=\"sp_castsk597\"  value=\"检查推车\" onclick=\"$('mode').value='special';$('command').value='skill597_special';$('subcmd').value='show';postCmd('gamecmd','command.php');this.disabled=true;\">");
return 1;
}
