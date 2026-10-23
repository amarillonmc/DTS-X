// Generated from include/modules/extra/instance/instance10_rogue/skill952/profilecmd.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  await r.write("<input type=\"button\" class=\"cmdbutton ");
  if (r.truth((await r.module("skill952", "skill952_prepare_itmarr")))) {
    await r.write("Pulse");
  }
  await r.write("\" id=\"sp_castsk952\" hotkey=\"g\" value=\"[G]查奖励\" onclick=\"$('mode').value='special';$('command').value='skill952_special';$('subcmd').value='show';postCmd('gamecmd','command.php');this.disabled=true;\">");
return 1;
}
