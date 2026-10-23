// Generated from include/modules/extra/gmskills/skill1011/profilecmd.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  await r.write("<input type=\"button\" class=\"cmdbutton\" id=\"skill1011_special\" value=\"「具现」\" onclick=\"$('mode').value='special';$('command').value='skill1011_special';$('subcmd').value='cons_page';postCmd('gamecmd','command.php');this.disabled=true;\">\r\n");
return 1;
}
