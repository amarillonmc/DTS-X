// Generated from include/modules/extra/club/skills/skill230/profilecmd.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  await r.write("<input type=\"button\" class=\"cmdbutton\" id=\"sp_wele\"  value=\"武器带电\" onclick=\"$('mode').value='special';$('command').value='skill230_special';$('subcmd').value='wele';postCmd('gamecmd','command.php');this.disabled=true;\">\r\n");
return 1;
}
