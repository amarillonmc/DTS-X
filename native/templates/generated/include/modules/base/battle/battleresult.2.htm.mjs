// Generated from include/modules/base/battle/battleresult.2.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  await r.write("<input type=\"hidden\" name=\"mode\" value=\"command\">\r\n<input type=\"hidden\" name=\"command\" value=\"back\">\r\n<div class=\"cmd_row\">\r\n<div class=\"cmd_positioner explore_cmd zx_cmd\">\r\n<input type=\"button\" class=\"cmd_button explore_cmd glow_buttons white\" style=\"font-size:12pt;\" id=\"zx\" value=\"确定\" onclick=\"postCmd('gamecmd','command.php',this);\">\r\n</div>\r\n</div>");
  r.assign(r.slot(s, ["uip", "display", "log_height"]), (r.truth((r.compare((await r.module("logger", "log_linenum_counter")), 15) > 0)) ? (r.truth((r.compare(r.get(s, "hp"), 0) > 0)) ? 550 : 360) : 240));
return 1;
}
