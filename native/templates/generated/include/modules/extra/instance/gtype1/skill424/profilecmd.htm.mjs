// Generated from include/modules/extra/instance/gtype1/skill424/profilecmd.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  await r.write("<input type=\"button\" class=\"cmdbutton ");
  if (r.truth((!r.truth((await r.module("skillbase", "skill_getvalue", 424, "lvl")))))) {
    await r.write("Pulse");
  }
  await r.write("\" id=\"f\" value=\"[F]除错\" onclick=\"$('mode').value='special';$('command').value='skill424_special';$('subcmd').value='wdebug';postCmd('gamecmd','command.php');this.disabled=true;\">\r\n");
return 1;
}
