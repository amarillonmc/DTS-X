// Generated from include/modules/extra/activities/nationalday2017/skill329/desc.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  await r.write("<table><tr>");
  r.imports(s, "skill329");
  await r.write("<td>");
  if (r.truth(r.equal(r.get(s, "c329"), "0"))) {
    await r.write("<img src=\"img/ach/N.gif\">");
  } else {
    if (r.truth(r.equal(r.get(s, "c329"), "999"))) {
      await r.write("<img src=\"img/ach/DA.gif\">");
    } else {
      await r.write("<img src=\"img/ach/D.gif\">");
    }
  }
  await r.write("</td>\r\n<td valign=\"top\" align=\"left\">\r\n<b>");
  if (r.truth(r.equal(r.get(s, "c329"), 0))) {
    await r.write("极光处刑 LV1");
  }
  if (r.truth(r.equal(r.get(s, "c329"), 1))) {
    await r.write("极光处刑 LV2");
  }
  if (r.truth((r.compare(r.get(s, "c329"), 2) >= 0))) {
    await r.write("极光处刑 LV3");
  }
  await r.write("</b>");
  if (r.truth(r.equal(r.get(s, "c329"), "999"))) {
    await r.write("<span class=\"lime b\">[完成]</span>");
  } else {
    if (r.truth(r.equal(r.get(s, "c329"), 0))) {
      await r.write("<span class=\"red b\">[未完成]</span>");
    } else {
      await r.write("<span class=\"cyan b\">[进行中]</span>");
    }
  }
  await r.write("<br>\r\n<font color=\"yellow\"><span>完成次数：");
  await r.write(r.text(r.get(s, "p329")));
  await r.write("次</span><br></font>");
  if (r.truth(r.equal(r.get(s, "c329"), 0))) {
    await r.write("<font color=\"olive\">奖励： 切糕");
    await r.write(r.text(r.get(r.get(s, "ach329_qiegao_prize"), "1")));
    await r.write("</font> <br> 在<span class=\"cyan b\">荣耀模式</span>房间内使用『破灭之诗』共计");
    await r.write(r.text(r.get(r.get(s, "ach329_threshold"), "1")));
    await r.write("次。<br>");
  }
  if (r.truth(r.equal(r.get(s, "c329"), 1))) {
    await r.write("<font color=\"olive\">奖励： 切糕");
    await r.write(r.text(r.get(r.get(s, "ach329_qiegao_prize"), "2")));
    await r.write("</font> <br> 在<span class=\"cyan b\">荣耀模式</span>房间内使用『破灭之诗』共计");
    await r.write(r.text(r.get(r.get(s, "ach329_threshold"), "2")));
    await r.write("次。<br>");
  }
  if (r.truth((r.compare(r.get(s, "c329"), 2) >= 0))) {
    await r.write("<font color=\"olive\">奖励： 切糕");
    await r.write(r.text(r.get(r.get(s, "ach329_qiegao_prize"), "3")));
    await r.write("</font> <span class=\"cyan b\">「Balefire Rekindle」随机卡片1张</span><br> 在<span class=\"cyan b\">荣耀模式</span>房间内使用『破灭之诗』共计");
    await r.write(r.text(r.get(r.get(s, "ach329_threshold"), "3")));
    await r.write("次。<br>");
  }
  await r.write("</td>\r\n</tr></table>");
return 1;
}
