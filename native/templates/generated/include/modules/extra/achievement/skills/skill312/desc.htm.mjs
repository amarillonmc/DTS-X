// Generated from include/modules/extra/achievement/skills/skill312/desc.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  r.assign(r.slot(s, ["stitle312"]), (await r.module("achievement_base", "show_ach_title", 312, r.get(s, "c312"))));
  r.assign(r.slot(s, ["atitle312"]), (await r.module("achievement_base", "show_ach_title_2", 312, r.get(s, "c312"))));
  await r.write("<table><tr>\r\n<td>");
  if (r.truth(r.equal(r.get(s, "c312"), "0"))) {
    await r.write("<img src=\"img/ach/a312_n.png\">");
  } else {
    await r.write("<img src=\"img/ach/a312_1.png\">");
  }
  await r.write("</td>\r\n<td class=\"ach_cont\">\r\n<span class=\"ach_title\" ");
  if (r.truth(r.get(s, "atitle312"))) {
    await r.write("title=\"");
    await r.write(r.text(r.get(s, "atitle312")));
    await r.write("\"");
  }
  await r.write(">\r");
  await r.write(r.text(r.get(s, "stitle312")));
  await r.write("</span>");
  if (r.truth(r.equal(r.get(s, "c312"), "999"))) {
    await r.write("<span class=\"lime b\">[完成]</span>");
  } else {
    if (r.truth(r.equal(r.get(s, "c312"), 0))) {
      await r.write("<span class=\"red b\">[未完成]</span>");
    } else {
      await r.write("<span class=\"cyan b\">[进行中]</span>");
    }
  }
  await r.write("<br>\r\n<font color=\"yellow\">击杀总数： ");
  await r.write(r.text(r.get(s, "p312")));
  await r.write("名<br></font>\r\n<font color=\"olive\">奖励： 切糕888 <span class=\"gold b\">Dr.Clef</span><br></font> \r\n击杀4只SCP<br>\r\n</td>\r\n</tr></table>");
return 1;
}
