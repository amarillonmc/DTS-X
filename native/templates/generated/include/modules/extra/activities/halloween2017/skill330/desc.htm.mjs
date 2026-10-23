// Generated from include/modules/extra/activities/halloween2017/skill330/desc.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  await r.write("<table><tr>");
  r.imports(s, "skill330");
  await r.write("<td style=\"vertical-align:top\">");
  if (r.truth(r.equal(r.get(s, "c330"), "999"))) {
    await r.write("<img src=\"img/ach/DA_h2017.png\">");
  } else {
    if (r.truth(r.equal(r.get(s, "c330"), "0"))) {
      await r.write("<img src=\"img/ach/N_h2017.png\">");
    } else {
      await r.write("<img src=\"img/ach/D_h2017.png\">");
    }
  }
  await r.write("</td>\r\n<td valign=\"top\" align=\"left\">\r\n<b>");
  if (r.truth(r.equal(r.get(s, "c330"), 0))) {
    await r.write("噩梦之夜 LV1");
  }
  if (r.truth(r.equal(r.get(s, "c330"), 1))) {
    await r.write("噩梦之夜 LV2");
  }
  if (r.truth((r.compare(r.get(s, "c330"), 2) >= 0))) {
    await r.write("噩梦之夜 LV3");
  }
  await r.write("</b>");
  if (r.truth(r.equal(r.get(s, "c330"), "999"))) {
    await r.write("<span class=\"lime b\">[完成]</span>");
  } else {
    if (r.truth(r.equal(r.get(s, "c330"), 0))) {
      await r.write("<span class=\"red b\">[未完成]</span>");
    } else {
      await r.write("<span class=\"cyan b\">[进行中]</span>");
    }
  }
  await r.write("<br>\r\n<font color=\"yellow\"><span>目前总数：");
  await r.write(r.text(r.get(s, "p330")));
  await r.write("个</span><br></font>");
  if (r.truth(r.equal(r.get(s, "c330"), 0))) {
    await r.write("<font color=\"olive\">奖励： 切糕");
    await r.write(r.text(r.get(r.get(s, "ach330_qiegao_prize"), "1")));
    await r.write("</font> <br> 获胜时身上拥有「万圣节X色糖果」总数超过");
    await r.write(r.text(r.get(r.get(s, "ach330_threshold"), "1")));
    await r.write("个<br>");
  }
  if (r.truth(r.equal(r.get(s, "c330"), 1))) {
    await r.write("<font color=\"olive\">奖励： 切糕");
    await r.write(r.text(r.get(r.get(s, "ach330_qiegao_prize"), "2")));
    await r.write("</font> <span class=\"cyan b\">卡片「梦魇瑞尔提」</span><br> 获胜时身上拥有「万圣节X色糖果」总数超过");
    await r.write(r.text(r.get(r.get(s, "ach330_threshold"), "2")));
    await r.write("个<br>");
  }
  if (r.truth((r.compare(r.get(s, "c330"), 2) >= 0))) {
    await r.write("<font color=\"olive\">奖励： 切糕");
    await r.write(r.text(r.get(r.get(s, "ach330_qiegao_prize"), "3")));
    await r.write("</font> <br> 获胜时身上拥有「万圣节X色糖果」总数超过");
    await r.write(r.text(r.get(r.get(s, "ach330_threshold"), "3")));
    await r.write("个<br>");
  }
  await r.write("</td>\r\n</tr></table>");
return 1;
}
