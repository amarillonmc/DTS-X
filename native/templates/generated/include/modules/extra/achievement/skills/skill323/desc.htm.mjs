// Generated from include/modules/extra/achievement/skills/skill323/desc.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  r.assign(r.slot(s, ["stitle323"]), (await r.module("achievement_base", "show_ach_title", 323, r.get(s, "c323"))));
  r.assign(r.slot(s, ["atitle323"]), (await r.module("achievement_base", "show_ach_title_2", 323, r.get(s, "c323"))));
  await r.write("<table><tr>\r\n<td>");
  if (r.truth(r.equal(r.get(s, "c323"), "0"))) {
    await r.write("<img src=\"img/ach/a323_n.png\">");
  } else {
    await r.write("<img src=\"img/ach/a323_1.png\">");
  }
  await r.write("</td>\r\n<td class=\"ach_cont\">\r\n<span class=\"ach_title\" ");
  if (r.truth(r.get(s, "atitle323"))) {
    await r.write("title=\"");
    await r.write(r.text(r.get(s, "atitle323")));
    await r.write("\"");
  }
  await r.write(">\r");
  await r.write(r.text(r.get(s, "stitle323")));
  await r.write("</span>");
  if (r.truth(r.get(s, "c323"))) {
    await r.write("<span class=\"lime b\">[完成]</span>");
  } else {
    await r.write("<span class=\"red b\">[未完成]</span>");
  }
  await r.write("<br>\r\n<font color=\"yellow\">最快速度： ");
  await r.write(r.text(r.get(s, "p323")));
  await r.write("秒<br></font>\r\n<font color=\"olive\">奖励： 切糕666 <span class=\"gold b\">随机S级卡片</span><br></font> \r\n在开场45分钟内完成幻境解离。房间外或荣耀、解离、试炼模式才能完成<br>\r\n</td>\r\n</tr></table>");
return 1;
}
