// Generated from include/modules/extra/card/skills/skill716/profilecmd.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  await r.write("<input type=\"button\" class=\"cmdbutton\" id=\"sp_castsk716_1\" value=\"抛硬币\" onclick=\"$('mode').value='special';$('command').value='skill716_special';$('subcmd').value='castsk716_1';postCmd('gamecmd','command.php');this.disabled=true;\">\r\n<input type=\"button\" class=\"cmdbutton\" id=\"sp_castsk716_2\" value=\"丢骰子\" onclick=\"$('mode').value='special';$('command').value='skill716_special';$('subcmd').value='castsk716_2';postCmd('gamecmd','command.php');this.disabled=true;\">");
return 1;
}
