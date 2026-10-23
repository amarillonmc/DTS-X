// Generated from include/modules/extra/achievement/skills/skill308/desc.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  r.assign(r.slot(s, ["stitle308"]), (await r.module("achievement_base", "show_ach_title", 308, r.get(s, "c308"))));
  r.assign(r.slot(s, ["atitle308"]), (await r.module("achievement_base", "show_ach_title_2", 308, r.get(s, "c308"))));
  await r.write("<table><tr>\r\n<td>");
  if (r.truth(r.equal(r.get(s, "c308"), "0"))) {
    await r.write("<img src=\"img/ach/a308_n.png\">");
  } else {
    await r.write("<img src=\"img/ach/a308_1.png\">");
  }
  await r.write("</td>\r\n<td class=\"ach_cont\">\r\n<span class=\"ach_title\" ");
  if (r.truth(r.get(s, "atitle308"))) {
    await r.write("title=\"");
    await r.write(r.text(r.get(s, "atitle308")));
    await r.write("\"");
  }
  await r.write(">\r");
  await r.write(r.text(r.get(s, "stitle308")));
  await r.write("</span>");
  if (r.truth(r.get(s, "c308"))) {
    await r.write("<span class=\"lime b\">[完成]</span>");
  } else {
    await r.write("<span class=\"red b\">[未完成]</span>");
  }
  await r.write("<br>\r\n<font color=\"yellow\">最快速度： ");
  await r.write(r.text(r.get(s, "p308")));
  await r.write("秒<br></font>\r\n<font color=\"olive\">奖励： 切糕666 <br></font> \r\n在开局5分钟内合成物品【KEY系催泪弹】。蹲站、组队、解离模式不能完成。<br>\r\n</td>\r\n</tr></table>");
return 1;
}
