// Generated from include/modules/extra/achievement/skills/skill317/desc.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  await r.write("<table><tr>\r\n<td>");
  if (r.truth(r.get(s, "c317"))) {
    await r.write("<img src=\"img/ach/D.gif\">");
  } else {
    await r.write("<img src=\"img/ach/N.gif\">");
  }
  await r.write("</td>\r\n<td valign=\"top\" align=\"left\">\r\n<b>\r\n聚集的祈愿\r\n</b>");
  if (r.truth(r.equal(r.get(s, "c317"), "999"))) {
    await r.write("<span class=\"lime b\">[完成]</span>");
  } else {
    if (r.truth(r.equal(r.get(s, "c317"), 0))) {
      await r.write("<span class=\"red b\">[未完成]</span>");
    } else {
      await r.write("<span class=\"cyan b\">[进行中]</span>");
    }
  }
  await r.write("<br>\r\n<font color=\"yellow\">完成次数： ");
  await r.write(r.text(r.get(s, "p317")));
  await r.write("次<br></font>\r\n<font color=\"olive\">奖励： 切糕233 <br></font> 合成带有“奇迹”属性的物品<br>\r\n</td>\r\n</tr></table>\r\n");
return 1;
}
