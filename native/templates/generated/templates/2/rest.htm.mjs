// Generated from templates/2/rest.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  r.imports(s, "sys", "rest");
  (await r.module("rest", "init_rest_timing"));
  await r.write("<input type=\"hidden\" id=\"mode\" name=\"mode\" value=\"rest\">\r\n<input type=\"hidden\" id=\"command\" name=\"command\" value=\"rest\">\r\n<div class=\"cmd_row\" style=\"margin-top:10px;\">\r\n<div class=\"glow_buttons grey fobidden\" style=\"margin:0;width:336px;height:35px;\">\r\n<span class=\"white\" style=\"line-height:35px\">");
  await r.write(r.text(r.get(r.get(s, "restinfo"), r.get(s, "state"))));
  await r.write("中……已经过<span class=\"yellow b\" id=\"rest_timing\">");
  await r.write(r.text(r.get(r.get(r.get(r.get(s, "uip"), "timing"), "rest_timing"), "timing")));
  await r.write("</span>秒</span>\r\n</div>\r\n</div><div class=\"cmd_row\">\r\n<div class=\"cmd_positioner explore_cmd\">\r\n<input type=\"button\" class=\"cmd_button explore_cmd glow_buttons white\" id=\"z\" value=\"");
  await r.write(r.text(r.get(r.get(s, "restinfo"), r.get(s, "state"))));
  await r.write("\" \r\nonclick=\"postCmd('gamecmd','command.php',this);\">\r\n</div><div class=\"cmd_positioner explore_cmd\">\r\n<input type=\"button\" class=\"cmd_button explore_cmd glow_buttons white\" id=\"x\" value=\"返回\" \r\nonclick=\"$('command').value='back';postCmd('gamecmd','command.php',this);\">\r\n</div>\r\n</div>");
  if (r.truth(r.equal(r.constant("CURSCRIPT"), "game"))) {
    await r.write("<script type=\"text/javascript\">updateTime('rest_timing', ");
    await r.write(r.text(r.get(r.get(r.get(r.get(s, "uip"), "timing"), "rest_timing"), "timing")));
    await r.write(", ");
    await r.write(r.text(r.get(r.get(r.get(r.get(s, "uip"), "timing"), "rest_timing"), "mode")));
    await r.write(", 1000, 's');</script>");
  }
  await r.write(" ");
return 1;
}
