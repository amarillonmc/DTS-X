// Generated from include/modules/extra/achievement/skills/skill301/desc.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  r.assign(r.slot(s, ["stitle301"]), (await r.module("achievement_base", "show_ach_title", 301, r.get(s, "c301"))));
  r.assign(r.slot(s, ["atitle301"]), (await r.module("achievement_base", "show_ach_title_2", 301, r.get(s, "c301"))));
  await r.write("<table><tr>\r\n<td>");
  if (r.truth(r.equal(r.get(s, "c301"), "0"))) {
    await r.write("<img src=\"img/ach/a301_n.png\">");
  } else {
    if (r.truth(r.equal(r.get(s, "c301"), "1"))) {
      await r.write("<img src=\"img/ach/a301_1.png\">");
    } else {
      await r.write("<img src=\"img/ach/a301_2.png\">");
    }
  }
  await r.write("</td>\r\n<td class=\"ach_cont\">\r\n<span class=\"ach_title\" ");
  if (r.truth(r.get(s, "atitle301"))) {
    await r.write("title=\"");
    await r.write(r.text(r.get(s, "atitle301")));
    await r.write("\"");
  }
  await r.write(">\r");
  await r.write(r.text(r.get(s, "stitle301")));
  await r.write("</span>");
  if (r.truth(r.equal(r.get(s, "c301"), "999"))) {
    await r.write("<span class=\"lime b\">[完成]</span>");
  } else {
    if (r.truth(r.equal(r.get(s, "c301"), 0))) {
      await r.write("<span class=\"red b\">[未完成]</span>");
    } else {
      await r.write("<span class=\"cyan b\">[进行中]</span>");
    }
  }
  await r.write("<br>\r\n<font color=\"yellow\">目前进度： ");
  await r.write(r.text(r.get(s, "p301")));
  await r.write("次<br></font>");
  if (r.truth(r.equal(r.get(s, "c301"), "0"))) {
    await r.write("<font color=\"olive\">奖励： 切糕300 <br></font> 完成结局：锁定解除 1次<br>");
  }
  if (r.truth(r.equal(r.get(s, "c301"), "1"))) {
    await r.write("<font color=\"olive\">奖励： 切糕1600 <br></font> 完成结局：锁定解除 10次<br>");
  }
  if (r.truth(r.equal(r.get(s, "c301"), "999"))) {
    await r.write("<font color=\"olive\">奖励： 切糕1600 <br></font> 完成结局：锁定解除 10次<br>");
  }
  await r.write("房间外或荣耀、极速模式才能完成\r\n</td>\r\n</tr></table>");
return 1;
}
