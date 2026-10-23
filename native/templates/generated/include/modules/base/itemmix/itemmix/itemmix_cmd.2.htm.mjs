// Generated from include/modules/base/itemmix/itemmix/itemmix_cmd.2.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  await r.write("<div class=\"cmd_positioner common_cmd\" style=\"width:170px\">\r\n<input type=\"button\" class=\"cmd_button common_cmd glow_buttons white\" value=\"道具合成\" \r\nonclick=\"$('command').value='itemmain';$('subcmd').name='itemcmd';$('subcmd').value='itemmix';postCmd('gamecmd','command.php',this);\">\r\n</div>");
return 1;
}
