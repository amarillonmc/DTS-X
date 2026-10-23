// Generated from include/modules/extra/achievement/skills/skill309/desc.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  r.assign(r.slot(s, ["stitle309"]), (await r.module("achievement_base", "show_ach_title", 309, r.get(s, "c309"))));
  r.assign(r.slot(s, ["atitle309"]), (await r.module("achievement_base", "show_ach_title_2", 309, r.get(s, "c309"))));
  await r.write("<table><tr>\r\n<td>");
  if (r.truth(r.equal(r.get(s, "c309"), "0"))) {
    await r.write("<img src=\"img/ach/a309_n.png\">");
  } else {
    await r.write("<img src=\"img/ach/a309_1.png\">");
  }
  await r.write("</td>\r\n<td class=\"ach_cont\">\r\n<span class=\"ach_title\" ");
  if (r.truth(r.get(s, "atitle309"))) {
    await r.write("title=\"");
    await r.write(r.text(r.get(s, "atitle309")));
    await r.write("\"");
  }
  await r.write(">\r");
  await r.write(r.text(r.get(s, "stitle309")));
  await r.write("</span>");
  if (r.truth(r.get(s, "c309"))) {
    await r.write("<span class=\"lime b\">[完成]</span>");
  } else {
    await r.write("<span class=\"red b\">[未完成]</span>");
  }
  await r.write("<br>\r\n<font color=\"yellow\">最快速度： ");
  await r.write(r.text(r.get(s, "p309")));
  await r.write("秒<br></font>\r\n<font color=\"olive\">奖励： 切糕666 <span class=\"cyan b\">方块挑战者</span><br></font> \r\n在开局15分钟内合成火水木金土符『贤者之石』。蹲站、组队、解离模式不能完成。<br>\r\n</td>\r\n</tr></table>");
return 1;
}
