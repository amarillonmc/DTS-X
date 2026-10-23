// Generated from include/modules/extra/achievement/skills/skill321/desc.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  r.assign(r.slot(s, ["stitle321"]), (await r.module("achievement_base", "show_ach_title", 321, r.get(s, "c321"))));
  r.assign(r.slot(s, ["atitle321"]), (await r.module("achievement_base", "show_ach_title_2", 321, r.get(s, "c321"))));
  r.assign(r.slot(s, ["dailytype321"]), (await r.module("achievement_base", "get_daily_type", 321)));
  await r.write("<table><tr>\r\n<td>");
  if (r.truth(r.equal(r.get(s, "c321"), "0"))) {
    await r.write("<img src=\"img/ach/daily");
    await r.write(r.text(r.get(s, "dailytype321")));
    await r.write("_n.png\">");
  } else {
    await r.write("<img src=\"img/ach/daily");
    await r.write(r.text(r.get(s, "dailytype321")));
    await r.write("_1.png\">");
  }
  await r.write("</td>\r\n<td class=\"ach_cont\">\r\n<span class=\"ach_title\" ");
  if (r.truth(r.get(s, "atitle321"))) {
    await r.write("title=\"");
    await r.write(r.text(r.get(s, "atitle321")));
    await r.write("\"");
  }
  await r.write(">\r");
  await r.write(r.text(r.get(s, "stitle321")));
  await r.write("</span>");
  if (r.truth(r.equal(r.get(s, "c321"), "999"))) {
    await r.write("<span class=\"lime b\">[完成]</span>");
  } else {
    if (r.truth(r.equal(r.get(s, "c321"), 0))) {
      await r.write("<span class=\"red b\">[未完成]</span>");
    } else {
      await r.write("<span class=\"cyan b\">[进行中]</span>");
    }
  }
  await r.write("<br>\r\n<font color=\"yellow\">击杀总数： ");
  await r.write(r.text(r.get(s, "p321")));
  await r.write("名<br></font>\r\n<font color=\"olive\">奖励： 切糕110 <br></font> 击杀2名全息幻象<br>\r\n</td>\r\n</tr></table>\r\n");
return 1;
}
