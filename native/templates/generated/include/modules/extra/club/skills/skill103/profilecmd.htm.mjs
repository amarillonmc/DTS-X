// Generated from include/modules/extra/club/skills/skill103/profilecmd.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  await r.write("<input type=\"button\" class=\"cmdbutton\" id=\"sp_castsk103\" value=\"吞噬魂兵\" onclick=\"$('mode').value='special';$('command').value='skill103_special';$('subcmd').value='castsk103';postCmd('gamecmd','command.php');this.disabled=true;\">");
return 1;
}
