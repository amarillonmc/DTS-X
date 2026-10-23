// Generated from include/modules/base/itemmix/itemmix/itemmix_cmd.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  await r.write("<input type=\"button\" class=\"cmdbutton ");
  if (r.truth((r.truth((await r.call("defined", "MOD_SKILL100"))) || r.truth((await r.call("defined", "MOD_SKILL101")))))) {
    if (r.truth((r.truth((await r.module("skillbase", "skill_getvalue", 100, "rageused"))) || r.truth((await r.module("skillbase", "skill_getvalue", 101, "activated")))))) {
      await r.write("Pulse");
    }
  }
  await r.write("\" id=\"c\" value=\"[C]合成\" onclick=\"$('command').value='itemmain';$('subcmd').name='itemcmd';$('subcmd').value='itemmix';postCmd('gamecmd','command.php');this.disabled=true;\">\r\n \r\n");
return 1;
}
