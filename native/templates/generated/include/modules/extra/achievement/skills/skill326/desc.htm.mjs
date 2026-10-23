// Generated from include/modules/extra/achievement/skills/skill326/desc.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  r.assign(r.slot(s, ["stitle326"]), (await r.module("achievement_base", "show_ach_title", 326, r.get(s, "c326"))));
  r.assign(r.slot(s, ["atitle326"]), (await r.module("achievement_base", "show_ach_title_2", 326, r.get(s, "c326"))));
  await r.write("<table><tr>\r\n<td>");
  if (r.truth(r.equal(r.get(s, "c326"), "0"))) {
    await r.write("<img src=\"img/ach/a326_n.png\">");
  } else {
    if (r.truth(r.equal(r.get(s, "c326"), "1"))) {
      await r.write("<img src=\"img/ach/a326_1.png\">");
    } else {
      if (r.truth(r.equal(r.get(s, "c326"), "2"))) {
        await r.write("<img src=\"img/ach/a326_2.png\">");
      } else {
        if (r.truth(r.equal(r.get(s, "c326"), "3"))) {
          await r.write("<img src=\"img/ach/a326_3.png\">");
        } else {
          if (r.truth(r.equal(r.get(s, "c326"), "4"))) {
            await r.write("<img src=\"img/ach/a326_4.png\">");
          } else {
            await r.write("<img src=\"img/ach/a326_5.png\">");
          }
        }
      }
    }
  }
  await r.write("</td>\r\n<td class=\"ach_cont\">\r\n<span class=\"ach_title\" ");
  if (r.truth(r.get(s, "atitle326"))) {
    await r.write("title=\"");
    await r.write(r.text(r.get(s, "atitle326")));
    await r.write("\"");
  }
  await r.write(">\r");
  await r.write(r.text(r.get(s, "stitle326")));
  await r.write("</span>");
  if (r.truth(r.equal(r.get(s, "c326"), "999"))) {
    await r.write("<span class=\"lime b\">[完成]</span>");
  } else {
    if (r.truth(r.equal(r.get(s, "c326"), 0))) {
      await r.write("<span class=\"red b\">[未完成]</span>");
    } else {
      await r.write("<span class=\"cyan b\">[进行中]</span>");
    }
  }
  await r.write("<br>\r\n<font color=\"yellow\"><span title=\"");
  await r.write(r.text(r.get(s, "cn326")));
  await r.write("\">目前纪录：");
  await r.write(r.text(r.get(s, "p326")));
  await r.write("张 （悬浮可查看）</span><br></font>");
  if (r.truth(r.equal(r.get(s, "c326"), "0"))) {
    await r.write("<font color=\"olive\">奖励： 切糕888 <br></font> 使用10张不同卡片获得游戏胜利<br>");
  }
  if (r.truth(r.equal(r.get(s, "c326"), "1"))) {
    await r.write("<font color=\"olive\">奖励： 切糕1200 <span class=\"cyan b\">篝火挑战者 <br></font> 使用25张不同卡片获得游戏胜利<br>");
  }
  if (r.truth(r.equal(r.get(s, "c326"), "2"))) {
    await r.write("<font color=\"olive\">奖励： 切糕1600 <br></font> 使用50张不同的卡片获得游戏胜利<br>");
  }
  if (r.truth(r.equal(r.get(s, "c326"), "3"))) {
    await r.write("<font color=\"olive\">奖励： 切糕2000 <br></font> 使用75张不同卡片获得游戏胜利<br>");
  }
  if (r.truth((r.compare(r.get(s, "c326"), "4") >= 0))) {
    await r.write("<font color=\"olive\">奖励： 切糕2500 <br></font> 使用100张不同卡片获得游戏胜利<br>");
  }
  await r.write("房间外或荣耀、极速模式才能完成\r\n</td>\r\n</tr></table>");
return 1;
}
