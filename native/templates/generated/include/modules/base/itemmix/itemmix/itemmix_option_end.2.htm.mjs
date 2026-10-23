// Generated from include/modules/base/itemmix/itemmix/itemmix_option_end.2.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  await r.write("<div class=\"cmd_row\" style=\"margin-top:10px\">\r\n<div class=\"cmd_positioner explore_cmd zx_cmd\" style=\"height:35px;\" >\r\n<input type=\"button\" class=\"cmd_button explore_cmd glow_buttons red b\" id=\"x\" value=\"返回\" \r\nonclick=\"$('command').value='menu';postCmd('gamecmd','command.php',this);\">\r\n</div>\r\n</div>");
return 1;
}
