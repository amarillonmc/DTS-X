// Generated from include/modules/extra/activities/nationalday2017/skill327/desc.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  await r.write("<table><tr>");
  r.imports(s, "skill327");
  await r.write("<td>");
  if (r.truth(r.equal(r.get(s, "c327"), "0"))) {
    await r.write("<img src=\"img/ach/N.gif\">");
  } else {
    if (r.truth(r.equal(r.get(s, "c327"), "999"))) {
      await r.write("<img src=\"img/ach/DA.gif\">");
    } else {
      await r.write("<img src=\"img/ach/D.gif\">");
    }
  }
  await r.write("</td>\r\n<td valign=\"top\" align=\"left\">\r\n<b>");
  if (r.truth(r.equal(r.get(s, "c327"), 0))) {
    await r.write("新的战场 LV1");
  }
  if (r.truth(r.equal(r.get(s, "c327"), 1))) {
    await r.write("新的战场 LV2");
  }
  if (r.truth((r.compare(r.get(s, "c327"), 2) >= 0))) {
    await r.write("新的战场 LV3");
  }
  await r.write("</b>");
  if (r.truth(r.equal(r.get(s, "c327"), "999"))) {
    await r.write("<span class=\"lime b\">[完成]</span>");
  } else {
    if (r.truth(r.equal(r.get(s, "c327"), 0))) {
      await r.write("<span class=\"red b\">[未完成]</span>");
    } else {
      await r.write("<span class=\"cyan b\">[进行中]</span>");
    }
  }
  await r.write("<br>\r\n<font color=\"yellow\"><span>击杀总数：");
  await r.write(r.text(r.get(s, "p327")));
  await r.write("名</span><br></font>");
  if (r.truth(r.equal(r.get(s, "c327"), 0))) {
    await r.write("<font color=\"olive\">奖励： 切糕");
    await r.write(r.text(r.get(r.get(s, "ach327_qiegao_prize"), "1")));
    await r.write(" <br></font> 在<span class=\"cyan b\">荣耀模式</span>房间内击杀全息幻象级NPC共");
    await r.write(r.text(r.get(r.get(s, "ach327_threshold"), "1")));
    await r.write("次。<br>");
  }
  if (r.truth(r.equal(r.get(s, "c327"), 1))) {
    await r.write("<font color=\"olive\">奖励： 切糕");
    await r.write(r.text(r.get(r.get(s, "ach327_qiegao_prize"), "2")));
    await r.write("</font> <span class=\"cyan b\">「Balefire Rekindle」卡片1张</span><br> 在<span class=\"cyan b\">荣耀模式</span>房间内击杀全息幻象级NPC共");
    await r.write(r.text(r.get(r.get(s, "ach327_threshold"), "2")));
    await r.write("次。<br>");
  }
  if (r.truth((r.compare(r.get(s, "c327"), 2) >= 0))) {
    await r.write("<font color=\"olive\">奖励： 切糕");
    await r.write(r.text(r.get(r.get(s, "ach327_qiegao_prize"), "3")));
    await r.write("</font> <span class=\"cyan b\">「Balefire Rekindle」卡片1张</span><br> 在<span class=\"cyan b\">荣耀模式</span>房间内击杀全息幻象级NPC共");
    await r.write(r.text(r.get(r.get(s, "ach327_threshold"), "3")));
    await r.write("次。<br>");
  }
  await r.write("</td>\r\n</tr></table>");
return 1;
}
