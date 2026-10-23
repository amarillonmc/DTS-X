// Generated from include/modules/extra/misc/set_gametype/next_gametype.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  if (r.truth((!r.truth((!r.truth(r.get(s, "noticelog"))))))) {
    await r.write("<p class=\"yellow b\">");
    await r.write(r.text(r.get(s, "noticelog")));
    await r.write("</p>");
  } else {
    if (r.truth(((r.get(r.get(s, "gamevars"), "next_gametype") != null)))) {
      await r.write("<p class=\"yellow b\">下一局标准房的游戏模式已设置为");
      await r.write(r.text(r.get(r.get(s, "gtinfo"), r.get(r.get(s, "gamevars"), "next_gametype"))));
      await r.write("</p>");
    } else {
      await r.write("<p class=\"yellow b\">请选择下一局标准房的游戏模式：</p>");
    }
  }
  await r.write("<input type=\"radio\" id=\"ngametype0\" name=\"ngametype\" value=\"0\" ");
  if (r.truth(((r.get(r.get(s, "gamevars"), "next_gametype") != null)))) {
    await r.write("disabled");
    if (r.truth(r.equal(0, r.get(r.get(s, "gamevars"), "next_gametype")))) {
      await r.write("checked");
    }
  }
  await r.write(">");
  if (r.truth(((r.get(r.get(s, "gamevars"), "next_gametype") != null)))) {
    await r.write("<span ");
    if (r.truth(r.equal(0, r.get(r.get(s, "gamevars"), "next_gametype")))) {
      await r.write("class=\"yellow b\"");
    }
    await r.write(">标准模式</span>");
  } else {
    await r.write("<a onclick=\"sl('ngametype0');\">标准模式</a>");
  }
  await r.write("<br>\r\n\r\n\r\n<input type=\"radio\" id=\"ngametype4\" name=\"ngametype\" value=\"4\" ");
  if (r.truth(((r.get(r.get(s, "gamevars"), "next_gametype") != null)))) {
    await r.write("disabled");
    if (r.truth(r.equal(4, r.get(r.get(s, "gamevars"), "next_gametype")))) {
      await r.write("checked");
    }
  }
  await r.write(">");
  if (r.truth(((r.get(r.get(s, "gamevars"), "next_gametype") != null)))) {
    await r.write("<span ");
    if (r.truth(r.equal(4, r.get(r.get(s, "gamevars"), "next_gametype")))) {
      await r.write("class=\"yellow b\"");
    }
    await r.write(">卡片模式</span>");
  } else {
    await r.write("<a onclick=\"sl('ngametype4');\">卡片模式</a>");
  }
return 1;
}
