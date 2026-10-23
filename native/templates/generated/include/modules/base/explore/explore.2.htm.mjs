// Generated from include/modules/base/explore/explore.2.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  await r.write("<input type=\"hidden\" id=\"moveto\" name=\"moveto\" value=\"0\">\r\n<div class=\"cmd_row\">\r\n<div class=\"cmd_positioner explore_cmd\">\r\n<input type=\"button\" class=\"cmd_button explore_cmd glow_buttons white b\" id=\"zz\" value=\"探索\" onclick=\"$('command').value='search';postCmd('gamecmd','command.php',this);\" ");
  if (r.truth((!r.truth((await r.module("map", "check_can_enter", r.get(s, "pls"))))))) {
    await r.write("disabled");
  }
  await r.write(">\r\n</div><div class=\"cmd_positioner explore_cmd\">\r\n<input type=\"button\" class=\"cmd_button explore_cmd glow_buttons white b\" id=\"x\" value=\"移动\" \r\nonclick=\"bubblebox_switch('move_to_list');\">\r\n</div>\r\n</div>");
  (await r.call("bubblebox_start", "id:move_to_list;height:765;width:360;offset-x:360;scroll-bar:0;cancellable:1;"));
  await r.write("<div style=\"margin-left:10px\">");
  (await r.include(r.template("move"), s));
  await r.write("</div>");
  (await r.call("bubblebox_end"));
return 1;
}
