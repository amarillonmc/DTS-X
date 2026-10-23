// Generated from include/modules/extra/card/skills/skill586/profilecmd.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  await r.write("<input type=\"button\" class=\"cmdbutton\" id=\"sp_castsk586\" value=\"打开隙间\" onclick=\"$('mode').value='special';$('command').value='skill586_special';$('subcmd').value='show';postCmd('gamecmd','command.php');this.disabled=true;\">");
return 1;
}
