// Generated from include/modules/extra/card/skills/skill552/profilecmd.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  if (r.truth((!r.truth((await r.module("skillbase", "skill_getvalue", 552, "activated")))))) {
    await r.write("<input type=\"button\" class=\"cmdbutton\" id=\"sp_castsk552\" value=\"铸造工具\" onclick=\"$('mode').value='special';$('command').value='skill552_special';$('subcmd').value='castsk552';postCmd('gamecmd','command.php');this.disabled=true;\">");
  }
return 1;
}
