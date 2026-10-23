// Generated from include/modules/extra/card/skills/skill589/profilecmd.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  if (r.truth((!r.truth((await r.module("skillbase", "skill_getvalue", 589, "activated")))))) {
    await r.write("<input type=\"button\" class=\"cmdbutton\" id=\"sp_castsk589\" value=\"地异！\" onclick=\"$('mode').value='special';$('command').value='skill589_special';$('subcmd').value='castsk589';postCmd('gamecmd','command.php');this.disabled=true;\">");
  }
return 1;
}
