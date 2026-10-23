// Generated from include/modules/base/ending/storyboard_container.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  await r.write("<!--////////////////////  结局显示框架，上面是剧情，下面是最后一页出现的下一局选项  ////////////////////-->\r\n<div id=\"storyboard_container\" style=\"width:720px;height:420px;margin:auto;\">\r\n<div id=\"shootings_container\" style=\"width:100%;height:390px;\">");
  (await r.include(r.template("MOD_ENDING_STORYBOARD"), s));
  await r.write("</div><div id=\"storyboard_control\">\r\n<div class=\"glow_buttons h25 w125\" id=\"shooting_previous\" style=\"display:none;position:absolute;left:215px;\" onclick=\"shooting_jump(-1);\">上一页</div><div class=\"glow_buttons h25 w125\" id=\"shooting_next\" style=\"display:none;position:absolute;left:385px;\" onclick=\"shooting_jump(1);\">下一页</div>\r\n</div>\r\n<img style=\"display:none;\" type=\"hidden\" src=\"img/blank.png\" onload=\"shooting_showdefault();\">\r\n</div>\r\n<!--////////////////////  选择下一局游戏模式的隐藏form  ////////////////////-->");
  if (r.truth((await r.module("ending", "ending_changing_gamevars_available")))) {
    await r.write("<form method=\"post\" id=\"nextgamevarsform\" name=\"nextgamevarsform\">\r\n<input type=\"hidden\" name=\"ecommand\" value=\"nextgamevars\">\r\n<input type=\"hidden\" id=\"ngametype\" name=\"ngametype\" value=\"0\">\r\n</form>\r\n<div style=\"width:720px;height:100px;margin:10 auto;background-color:rgba(17,17,17,0.5);\">\r\n<section id=\"shooting_over\">\r\n<div id=\"nextgamevars\">");
    if (r.truth((await r.call("is_array", r.get(s, "next_gamevars_display"))))) {
      {
        const a0 = r.copy(r.get(s, "next_gamevars_display"));
        for (const [k0, v0] of r.entries(a0)) {
          r.assign(r.slot(s, ["ngds"]), v0);
          await r.write(r.text(r.get(s, "ngds")));
          await r.write("<br>");
        }
      }
    }
    await r.write("</div>\r\n</section>\r\n</div>");
  }
return 1;
}
