// Generated from include/modules/extra/club/skills/skill219/profilecmd.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  await r.write("<input type=\"button\" class=\"cmdbutton\" id=\"sp_wpoison\"  value=\"武器淬毒\" onclick=\"$('mode').value='special';$('command').value='skill219_special';$('subcmd').value='wpoison';postCmd('gamecmd','command.php');this.disabled=true;\">\r\n");
return 1;
}
