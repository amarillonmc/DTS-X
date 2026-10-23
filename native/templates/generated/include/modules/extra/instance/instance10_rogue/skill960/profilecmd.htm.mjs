// Generated from include/modules/extra/instance/instance10_rogue/skill960/profilecmd.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  await r.write("<input type=\"button\" class=\"cmdbutton\" id=\"sp_castsk960\" hotkey=\"h\" value=\"[H]查任务\" onclick=\"$('mode').value='special';$('command').value='skill960_special';$('subcmd').value='show';postCmd('gamecmd','command.php');this.disabled=true;\">");
return 1;
}
