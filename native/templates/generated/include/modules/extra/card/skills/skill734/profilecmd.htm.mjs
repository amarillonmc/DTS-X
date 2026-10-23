// Generated from include/modules/extra/card/skills/skill734/profilecmd.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  await r.write("<input type=\"button\" class=\"cmdbutton\" id=\"sp_castsk734\" value=\"打牌！\" onclick=\"$('mode').value='special';$('command').value='skill734_special';postCmd('gamecmd','command.php');this.disabled=true;\">");
return 1;
}
