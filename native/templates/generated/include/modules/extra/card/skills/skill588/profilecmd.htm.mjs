// Generated from include/modules/extra/card/skills/skill588/profilecmd.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  if (r.truth((!r.truth((await r.module("skillbase", "skill_getvalue", 588, "activated")))))) {
    await r.write("<input type=\"button\" class=\"cmdbutton\" id=\"sp_castsk588\" value=\"天变！\" onclick=\"$('mode').value='special';$('command').value='skill588_special';$('subcmd').value='castsk588';postCmd('gamecmd','command.php');this.disabled=true;\">");
  }
return 1;
}
