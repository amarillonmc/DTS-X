// Generated from include/modules/extra/gmskills/skill1013/profilecmd.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  await r.write("<input type=\"button\" class=\"cmdbutton\" id=\"skill1013_special\" value=\"「禁录」\" onclick=\"$('mode').value='special';$('command').value='skill1013_special';$('subcmd').value='sub_page';postCmd('gamecmd','command.php',this);\">");
return 1;
}
