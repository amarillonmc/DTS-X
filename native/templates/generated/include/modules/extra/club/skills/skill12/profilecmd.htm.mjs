// Generated from include/modules/extra/club/skills/skill12/profilecmd.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  if (r.truth((r.compare(r.get(s, "skillpoint"), 1) >= 0))) {
    await r.write("<input type=\"button\" class=\"cmdbutton\" id=\"b\" value=\"[B]治愈\" onclick=\"$('mode').value='special';$('command').value='skill12_special';$('subcmd').value='castsk12';postCmd('gamecmd','command.php');this.disabled=true;\">");
  } else {
    await r.write("<input type=\"button\" class=\"cmdbutton\" id=\"b\" value=\"[B]治愈\" disabled=\"true\">");
  }
return 1;
}
