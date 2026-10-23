// Generated from include/modules/extra/achievement/skills/skill318/desc.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  r.assign(r.slot(s, ["stitle318"]), (await r.module("achievement_base", "show_ach_title", 318, r.get(s, "c318"))));
  r.assign(r.slot(s, ["atitle318"]), (await r.module("achievement_base", "show_ach_title_2", 318, r.get(s, "c318"))));
  r.assign(r.slot(s, ["dailytype318"]), (await r.module("achievement_base", "get_daily_type", 318)));
  await r.write("<table><tr>\r\n<td>");
  if (r.truth(r.equal(r.get(s, "c318"), "0"))) {
    await r.write("<img src=\"img/ach/daily");
    await r.write(r.text(r.get(s, "dailytype318")));
    await r.write("_n.png\">");
  } else {
    await r.write("<img src=\"img/ach/daily");
    await r.write(r.text(r.get(s, "dailytype318")));
    await r.write("_1.png\">");
  }
  await r.write("</td>\r\n<td class=\"ach_cont\">\r\n<span class=\"ach_title\" ");
  if (r.truth(r.get(s, "atitle318"))) {
    await r.write("title=\"");
    await r.write(r.text(r.get(s, "atitle318")));
    await r.write("\"");
  }
  await r.write(">\r");
  await r.write(r.text(r.get(s, "stitle318")));
  await r.write("</span>");
  if (r.truth(r.equal(r.get(s, "c318"), "999"))) {
    await r.write("<span class=\"lime b\">[完成]</span>");
  } else {
    if (r.truth(r.equal(r.get(s, "c318"), 0))) {
      await r.write("<span class=\"red b\">[未完成]</span>");
    } else {
      await r.write("<span class=\"cyan b\">[进行中]</span>");
    }
  }
  await r.write("<br>\r\n<font color=\"yellow\">目前进度： ");
  await r.write(r.text(r.get(s, "p318")));
  await r.write("次<br></font>\r\n<font color=\"olive\">奖励：切糕573 <span class=\"evergreen b\">切糕盒子</span><span class=\"yellow b\">×1</span><br></font> 完成结局：幻境解离 1次<br>\r\n房间外或荣耀、解离、试炼模式才能完成\r\n<td>\r\n</table>");
return 1;
}
