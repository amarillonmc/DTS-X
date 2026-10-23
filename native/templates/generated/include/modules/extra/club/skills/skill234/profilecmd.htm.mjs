// Generated from include/modules/extra/club/skills/skill234/profilecmd.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  await r.write("<input type=\"button\" class=\"cmdbutton\" id=\"f\" value=\"[F]破解\" onclick=\"$('mode').value='special';$('command').value='skill234_special';$('subcmd').value='wdecode';postCmd('gamecmd','command.php');this.disabled=true;\">");
return 1;
}
