// Generated from include/modules/extra/club/skills/skill94/profilecmd.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  await r.write("<input type=\"button\" class=\"cmdbutton\" id=\"sp_castsk94\" value=\"「天籁」\" onclick=\"$('mode').value='special';$('command').value='skill94_special';$('subcmd').value='castsk94';postCmd('gamecmd','command.php');this.disabled=true;\">");
return 1;
}
