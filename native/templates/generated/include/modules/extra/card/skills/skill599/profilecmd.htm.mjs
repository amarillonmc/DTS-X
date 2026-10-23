// Generated from include/modules/extra/card/skills/skill599/profilecmd.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  if (r.truth((!r.truth((await r.module("skillbase", "skill_getvalue", 599, "activated")))))) {
    await r.write("<input type=\"button\" class=\"cmdbutton\" id=\"sp_castsk599\" value=\"「迷梦」\" onclick=\"$('mode').value='special';$('command').value='skill599_special';$('subcmd').value='castsk599';postCmd('gamecmd','command.php');this.disabled=true;\">");
  }
return 1;
}
