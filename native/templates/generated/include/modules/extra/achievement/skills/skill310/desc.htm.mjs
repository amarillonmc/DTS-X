// Generated from include/modules/extra/achievement/skills/skill310/desc.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  r.assign(r.slot(s, ["stitle310"]), (await r.module("achievement_base", "show_ach_title", 310, r.get(s, "c310"))));
  r.assign(r.slot(s, ["atitle310"]), (await r.module("achievement_base", "show_ach_title_2", 310, r.get(s, "c310"))));
  await r.write("<table><tr>\r\n<td>");
  if (r.truth(r.equal(r.get(s, "c310"), "0"))) {
    await r.write("<img src=\"img/ach/a310_n.png\">");
  } else {
    if (r.truth(r.equal(r.get(s, "c310"), "1"))) {
      await r.write("<img src=\"img/ach/a310_1.png\">");
    } else {
      if (r.truth(r.equal(r.get(s, "c310"), "2"))) {
        await r.write("<img src=\"img/ach/a310_2.png\">");
      } else {
        await r.write("<img src=\"img/ach/a310_3.png\">");
      }
    }
  }
  await r.write("</td>\r\n<td class=\"ach_cont\">\r\n<span class=\"ach_title\" ");
  if (r.truth(r.get(s, "atitle310"))) {
    await r.write("title=\"");
    await r.write(r.text(r.get(s, "atitle310")));
    await r.write("\"");
  }
  await r.write(">\r");
  await r.write(r.text(r.get(s, "stitle310")));
  await r.write("</span>");
  if (r.truth(r.equal(r.get(s, "c310"), "999"))) {
    await r.write("<span class=\"lime b\">[完成]</span>");
  } else {
    if (r.truth(r.equal(r.get(s, "c310"), 0))) {
      await r.write("<span class=\"red b\">[未完成]</span>");
    } else {
      await r.write("<span class=\"cyan b\">[进行中]</span>");
    }
  }
  await r.write("<br>\r\n<font color=\"yellow\">击杀总数： ");
  await r.write(r.text(r.get(s, "p310")));
  await r.write("名<br></font>");
  if (r.truth(r.equal(r.get(s, "c310"), "0"))) {
    await r.write("<font color=\"olive\">奖励： 切糕100 <br></font> 击杀100名NPC<br>");
  }
  if (r.truth(r.equal(r.get(s, "c310"), "1"))) {
    await r.write("<font color=\"olive\">奖励： 切糕400 <span class=\"cyan b\">随机A级卡片</span><br></font> 击杀2500名NPC<br>");
  }
  if (r.truth(r.equal(r.get(s, "c310"), "2"))) {
    await r.write("<font color=\"olive\">奖励： 切糕1500 <span class=\"cyan b\">随机A级卡片</span><br></font> 击杀10000名NPC<br>");
  }
  if (r.truth(r.equal(r.get(s, "c310"), "999"))) {
    await r.write("<font color=\"olive\">奖励： 切糕1500 <span class=\"cyan b\">随机A级卡片</span><br></font> 击杀10000名NPC<br>");
  }
  await r.write("</td>\r\n</tr></table>\r\n");
return 1;
}
