// Generated from include/modules/extra/club/skills/skill56/profilecmd.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  await r.write("<input type=\"button\" class=\"cmdbutton\" id=\"sp_summon\"  value=\"佣兵管理\" onclick=\"$('mode').value='special';$('command').value='skill56_special';$('subcmd').value='summon';postCmd('gamecmd','command.php');this.disabled=true;\"> \r\n");
return 1;
}
