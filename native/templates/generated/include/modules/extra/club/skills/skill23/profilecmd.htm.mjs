// Generated from include/modules/extra/club/skills/skill23/profilecmd.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  await r.write("<input type=\"button\" class=\"cmdbutton\" id=\"sp_gemming\"  value=\"镶嵌宝石\" onclick=\"$('mode').value='special';$('command').value='skill23_special';$('subcmd').value='gemming';postCmd('gamecmd','command.php');this.disabled=true;\">");
return 1;
}
