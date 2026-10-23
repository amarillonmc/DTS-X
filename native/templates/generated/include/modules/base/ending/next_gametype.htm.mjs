// Generated from include/modules/base/ending/next_gametype.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  await r.write("<div style=\"margin:10 auto\">");
  if (r.truth((!r.truth((!r.truth(r.get(s, "noticelog"))))))) {
    await r.write("<span class=\"yellow b\">");
    await r.write(r.text(r.get(s, "noticelog")));
    await r.write("</span>");
  } else {
    if (r.truth(((r.get(r.get(s, "gamevars"), "next_gametype") != null)))) {
      await r.write("<span class=\"yellow b\">下一局游戏模式已设置为");
      await r.write(r.text(r.get(r.get(s, "gtinfo"), r.get(r.get(s, "gamevars"), "next_gametype"))));
      await r.write("</span>");
    } else {
      await r.write("<span class=\"yellow b\">你可以选择下一局游戏的模式：</span>");
    }
  }
  await r.write("</div>");
  if (r.truth((!r.truth(((r.get(r.get(s, "gamevars"), "next_gametype") != null)))))) {
    await r.write("<div class=\"glow_buttons h50 w115 cyan\" style=\"display:inline-block\" onclick=\"$('ngametype').value='6';postCmd('nextgamevarsform','end.php');\">\r\n<span class=\"h50 b\">");
    await r.write(r.text(r.get(r.get(s, "gtinfo"), "6")));
    await r.write("模式</span>\r\n</div><div class=\"glow_buttons h50 w115 red\" style=\"display:inline-block;margin:0 0 0 50px\" onclick=\"$('ngametype').value='4';postCmd('nextgamevarsform','end.php');\">\r\n<span class=\"h50 b\">");
    await r.write(r.text(r.get(r.get(s, "gtinfo"), "4")));
    await r.write("模式</span>\r\n</div>");
  } else {
    await r.write("<!--暂时只有两个选项-->");
    if (r.truth((!r.equal(4, r.get(r.get(s, "gamevars"), "next_gametype"))))) {
      await r.write("<div class=\"glow_buttons h50 w115 cyan\" style=\"display:inline-block\">\r\n<span class=\"h50 b\">");
      await r.write(r.text(r.get(r.get(s, "gtinfo"), "6")));
      await r.write("模式</span>\r\n</div><div class=\"glow_buttons h50 w115 darkgrey forbidden\" style=\"display:inline-block;margin:0 0 0 50px\">\r\n<span class=\"h50 b\">");
      await r.write(r.text(r.get(r.get(s, "gtinfo"), "4")));
      await r.write("模式</span>\r\n</div>");
    } else {
      await r.write("<div class=\"glow_buttons h50 w115 darkgrey forbidden\" style=\"display:inline-block\">\r\n<span class=\"h50 b\">");
      await r.write(r.text(r.get(r.get(s, "gtinfo"), "6")));
      await r.write("模式</span>\r\n</div><div class=\"glow_buttons h50 w115 red\" style=\"display:inline-block;margin:0 0 0 50px\">\r\n<span class=\"h50 b\">");
      await r.write(r.text(r.get(r.get(s, "gtinfo"), "4")));
      await r.write("模式</span>\r\n</div>");
    }
  }
return 1;
}
