// Generated from include/modules/base/opening/storyboard_container.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  r.imports(s, "opening");
  await r.write("<div id=\"storyboard_container\" style=\"width:720px;height:420px\">\r\n<div id=\"shootings_container\" style=\"width:100%;height:390px;\">");
  (await r.include(r.template("MOD_OPENING_STORYBOARD"), s));
  await r.write("</div><div id=\"storyboard_control\">\r\n<div class=\"glow_buttons h25 w125\" id=\"shooting_previous\" style=\"display:none;position:absolute;left:215px;\" onclick=\"shooting_jump(-1);\">上一页</div><div class=\"glow_buttons h25 w125\" id=\"shooting_next\" style=\"display:none;position:absolute;left:385px;\" onclick=\"shooting_jump(1);\">下一页</div>");
  if (r.truth((r.compare(r.get(s, "gamestate"), 0) > 0))) {
    await r.write("<div class=\"glow_buttons h25 w125\" id=\"shooting_over\" style=\"display:none;position:absolute;left:385px;\" onclick=\"$('command').value='skip_op';postCmd('gamecmd','command.php');\">进入战场</div>");
  }
  await r.write("<div class=\"glow_buttons grey h25 w115\" id=\"shooting_skip\" style=\"position:absolute;left:555px;\" onclick=\"$('command').value='skip_op';postCmd('gamecmd','command.php');\">");
  await r.write(r.text(r.get(s, "op_skip_word")));
  await r.write("</div>\r\n</div>\r\n<img style=\"display:none;\" type=\"hidden\" src=\"img/blank.png\" onload=\"shooting_showdefault();\">\r\n</div>");
return 1;
}
