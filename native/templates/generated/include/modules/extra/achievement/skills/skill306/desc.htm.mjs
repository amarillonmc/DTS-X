// Generated from include/modules/extra/achievement/skills/skill306/desc.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  r.assign(r.slot(s, ["stitle306"]), (await r.module("achievement_base", "show_ach_title", 306, r.get(s, "c306"))));
  r.assign(r.slot(s, ["atitle306"]), (await r.module("achievement_base", "show_ach_title_2", 306, r.get(s, "c306"))));
  await r.write("<table><tr>\r\n<td>");
  if (r.truth(r.equal(r.get(s, "c306"), "0"))) {
    await r.write("<img src=\"img/ach/a306_n.png\">");
  } else {
    if (r.truth(r.equal(r.get(s, "c306"), "1"))) {
      await r.write("<img src=\"img/ach/a306_1.png\">");
    } else {
      await r.write("<img src=\"img/ach/a306_2.png\">");
    }
  }
  await r.write("</td>\r\n<td class=\"ach_cont\">\r\n<span class=\"ach_title\" ");
  if (r.truth(r.get(s, "atitle306"))) {
    await r.write("title=\"");
    await r.write(r.text(r.get(s, "atitle306")));
    await r.write("\"");
  }
  await r.write(">\r");
  await r.write(r.text(r.get(s, "stitle306")));
  await r.write("</span>");
  if (r.truth(r.equal(r.get(s, "c306"), "999"))) {
    await r.write("<span class=\"lime b\">[完成]</span>");
  } else {
    if (r.truth(r.equal(r.get(s, "c306"), 0))) {
      await r.write("<span class=\"red b\">[未完成]</span>");
    } else {
      await r.write("<span class=\"cyan b\">[进行中]</span>");
    }
  }
  await r.write("<br>\r\n<font color=\"yellow\">目前进度： ");
  await r.write(r.text(r.get(s, "p306")));
  await r.write("次<br></font>");
  if (r.truth(r.equal(r.get(s, "c306"), "0"))) {
    await r.write("<font color=\"olive\">奖励： 切糕200 <br></font> 完成结局：核爆全灭 1次<br>");
  }
  if (r.truth(r.equal(r.get(s, "c306"), "1"))) {
    await r.write("<font color=\"olive\">奖励： 切糕500 <span class=\"gold b\">DK^BurNIng</span><br></font> 完成结局：核爆全灭 5次<br>");
  }
  if (r.truth(r.equal(r.get(s, "c306"), "999"))) {
    await r.write("<font color=\"olive\">奖励： 切糕500 <span class=\"gold b\">DK^BurNIng</span><br></font> 完成结局：核爆全灭 5次<br>");
  }
  await r.write("房间外或荣耀、极速模式才能完成\r\n</td>\r\n</tr></table>");
return 1;
}
