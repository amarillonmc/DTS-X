// Generated from include/modules/extra/card/skills/skill733/profilecmd.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  await r.write("<input type=\"button\" class=\"cmdbutton\" id=\"sp_castsk733\" value=\"扭蛋机\" onclick=\"$('mode').value='special';$('command').value='skill733_special';postCmd('gamecmd','command.php');this.disabled=true;\">");
return 1;
}
