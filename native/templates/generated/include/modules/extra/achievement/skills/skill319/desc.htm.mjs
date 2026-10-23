// Generated from include/modules/extra/achievement/skills/skill319/desc.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  await r.write("<table><tr>\r\n<td>");
  if (r.truth(r.get(s, "c319"))) {
    await r.write("<img src=\"img/ach/D.gif\">");
  } else {
    await r.write("<img src=\"img/ach/N.gif\">");
  }
  await r.write("</td>\r\n<td valign=\"top\" align=\"left\">\r\n<b>\r\n卡牌大师\r\n</b>");
  if (r.truth(r.equal(r.get(s, "c319"), "999"))) {
    await r.write("<span class=\"lime b\">[完成]</span>");
  } else {
    if (r.truth(r.equal(r.get(s, "c319"), 0))) {
      await r.write("<span class=\"red b\">[未完成]</span>");
    } else {
      await r.write("<span class=\"cyan b\">[进行中]</span>");
    }
  }
  await r.write("<br>\r\n<font color=\"yellow\">完成次数： ");
  await r.write(r.text(r.get(s, "p319")));
  await r.write("次<br></font>\r\n<font color=\"olive\">奖励： 切糕485 <span class=\"brickred b\">姜瘤儿</span><br></font> 以普通方式（非同调/超量）合成15张游戏王卡牌<br>\r\n</td>\r\n</tr></table>\r\n");
return 1;
}
