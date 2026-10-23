// Generated from include/modules/extra/card/skills/skill746/profilecmd.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  await r.write("<input type=\"button\" class=\"cmdbutton\" id=\"sp_castsk746\" value=\"「艺术」\" onclick=\"$('mode').value='special';$('command').value='skill746_special';$('subcmd').value='castsk746';postCmd('gamecmd','command.php');this.disabled=true;\">");
return 1;
}
