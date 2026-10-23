// Generated from include/modules/extra/gmskills/skill1010/profilecmd.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  await r.write("<input type=\"button\" class=\"cmdbutton\" id=\"skill1010_special\" value=\"「降神」\" onclick=\"$('mode').value='special';$('command').value='skill1010_special';$('subcmd').value='mani_page';postCmd('gamecmd','command.php');this.disabled=true;\">\r\n");
return 1;
}
