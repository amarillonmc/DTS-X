// Generated from include/modules/extra/achievement/skills/skill311/desc.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  r.assign(r.slot(s, ["stitle311"]), (await r.module("achievement_base", "show_ach_title", 311, r.get(s, "c311"))));
  r.assign(r.slot(s, ["atitle311"]), (await r.module("achievement_base", "show_ach_title_2", 311, r.get(s, "c311"))));
  await r.write("<table><tr>\r\n<td>");
  if (r.truth(r.equal(r.get(s, "c311"), "0"))) {
    await r.write("<img src=\"img/ach/a311_n.png\">");
  } else {
    if (r.truth(r.equal(r.get(s, "c311"), "1"))) {
      await r.write("<img src=\"img/ach/a311_1.png\">");
    } else {
      if (r.truth(r.equal(r.get(s, "c311"), "2"))) {
        await r.write("<img src=\"img/ach/a311_2.png\">");
      } else {
        await r.write("<img src=\"img/ach/a311_3.png\">");
      }
    }
  }
  await r.write("</td>\r\n<td class=\"ach_cont\">\r\n<span class=\"ach_title\" ");
  if (r.truth(r.get(s, "atitle311"))) {
    await r.write("title=\"");
    await r.write(r.text(r.get(s, "atitle311")));
    await r.write("\"");
  }
  await r.write(">\r");
  await r.write(r.text(r.get(s, "stitle311")));
  await r.write("</span>");
  if (r.truth(r.equal(r.get(s, "c311"), "999"))) {
    await r.write("<span class=\"lime b\">[完成]</span>");
  } else {
    if (r.truth(r.equal(r.get(s, "c311"), 0))) {
      await r.write("<span class=\"red b\">[未完成]</span>");
    } else {
      await r.write("<span class=\"cyan b\">[进行中]</span>");
    }
  }
  await r.write("<br>\r\n<font color=\"yellow\">击杀总数： ");
  await r.write(r.text(r.get(s, "p311")));
  await r.write("名<br></font>");
  if (r.truth(r.equal(r.get(s, "c311"), "0"))) {
    await r.write("<font color=\"olive\">奖励： 切糕200 <br></font> 在战斗中击杀10名玩家");
  }
  if (r.truth(r.equal(r.get(s, "c311"), "1"))) {
    await r.write("<font color=\"olive\">奖励： 切糕1200 <br></font> 在战斗中击杀100名玩家");
  }
  if (r.truth(r.equal(r.get(s, "c311"), "2"))) {
    await r.write("<font color=\"olive\">奖励： 切糕4000 <br></font> 在战斗中击杀1000名玩家");
  }
  if (r.truth(r.equal(r.get(s, "c311"), "999"))) {
    await r.write("<font color=\"olive\">奖励： 切糕4000 <br></font> 在战斗中击杀1000名玩家");
  }
  await r.write("。蹲站、伐木、解离、试炼模式不能完成\r\n</td>\r\n</tr></table>");
return 1;
}
