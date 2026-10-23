// Generated from include/modules/extra/achievement/skills/skill307/desc.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  r.assign(r.slot(s, ["stitle307"]), (await r.module("achievement_base", "show_ach_title", 307, r.get(s, "c307"))));
  r.assign(r.slot(s, ["atitle307"]), (await r.module("achievement_base", "show_ach_title_2", 307, r.get(s, "c307"))));
  await r.write("<table><tr>\r\n<td>");
  if (r.truth(r.equal(r.get(s, "c307"), "0"))) {
    await r.write("<img src=\"img/ach/a307_n.png\">");
  } else {
    if (r.truth(r.equal(r.get(s, "c307"), "1"))) {
      await r.write("<img src=\"img/ach/a307_1.png\">");
    } else {
      await r.write("<img src=\"img/ach/a307_2.png\">");
    }
  }
  await r.write("</td>\r\n<td class=\"ach_cont\">\r\n<span class=\"ach_title\" ");
  if (r.truth(r.get(s, "atitle307"))) {
    await r.write("title=\"");
    await r.write(r.text(r.get(s, "atitle307")));
    await r.write("\"");
  }
  await r.write(">\r");
  await r.write(r.text(r.get(s, "stitle307")));
  await r.write("</span>");
  if (r.truth(r.equal(r.get(s, "c307"), "999"))) {
    await r.write("<span class=\"lime b\">[完成]</span>");
  } else {
    if (r.truth(r.equal(r.get(s, "c307"), 0))) {
      await r.write("<span class=\"red b\">[未完成]</span>");
    } else {
      await r.write("<span class=\"cyan b\">[进行中]</span>");
    }
  }
  await r.write("<br>\r\n<font color=\"yellow\">目前进度： ");
  await r.write(r.text(r.get(s, "p307")));
  await r.write("次<br></font>");
  if (r.truth(r.equal(r.get(s, "c307"), "0"))) {
    await r.write("<font color=\"olive\">奖励： 切糕500 <br></font> 完成结局：幻境解离 1次<br>");
  }
  if (r.truth(r.equal(r.get(s, "c307"), "1"))) {
    await r.write("<font color=\"olive\">奖励： 切糕2000 <span class=\"cyan b\">篝火挑战者</span><br></font> 完成结局：幻境解离 8次<br>");
  }
  if (r.truth(r.equal(r.get(s, "c307"), "999"))) {
    await r.write("<font color=\"olive\">奖励： 切糕2000 <span class=\"cyan b\">篝火挑战者</span><br></font> 完成结局：幻境解离 8次<br>");
  }
  await r.write("房间外或荣耀、解离、试炼模式才能完成\r\n</td>\r\n</tr></table>");
return 1;
}
