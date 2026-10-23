// Generated from include/modules/extra/activities/nationalday2017/skill328/desc.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  await r.write("<table><tr>");
  r.imports(s, "skill328");
  await r.write("<td>");
  if (r.truth(r.equal(r.get(s, "c328"), "0"))) {
    await r.write("<img src=\"img/ach/N.gif\">");
  } else {
    if (r.truth(r.equal(r.get(s, "c328"), "999"))) {
      await r.write("<img src=\"img/ach/DA.gif\">");
    } else {
      await r.write("<img src=\"img/ach/D.gif\">");
    }
  }
  await r.write("</td>\r\n<td valign=\"top\" align=\"left\">\r\n<b>");
  if (r.truth(r.equal(r.get(s, "c328"), 0))) {
    await r.write("血染乐园 LV1");
  }
  if (r.truth(r.equal(r.get(s, "c328"), 1))) {
    await r.write("血染乐园 LV2");
  }
  if (r.truth((r.compare(r.get(s, "c328"), 2) >= 0))) {
    await r.write("血染乐园 LV3");
  }
  await r.write("</b>");
  if (r.truth(r.equal(r.get(s, "c328"), "999"))) {
    await r.write("<span class=\"lime b\">[完成]</span>");
  } else {
    if (r.truth(r.equal(r.get(s, "c328"), 0))) {
      await r.write("<span class=\"red b\">[未完成]</span>");
    } else {
      await r.write("<span class=\"cyan b\">[进行中]</span>");
    }
  }
  await r.write("<br>\r\n<font color=\"yellow\"><span>击杀总数：");
  await r.write(r.text(r.get(s, "p328")));
  await r.write("名</span><br></font>");
  if (r.truth(r.equal(r.get(s, "c328"), 0))) {
    await r.write("<font color=\"olive\">奖励： 切糕");
    await r.write(r.text(r.get(r.get(s, "ach328_qiegao_prize"), "1")));
    await r.write("</font> <br> 在<span class=\"cyan b\">荣耀模式</span>房间内共计击杀");
    await r.write(r.text(r.get(r.get(s, "ach328_threshold"), "1")));
    await r.write("名等级≥10、金钱≥2000的玩家。<br>");
  }
  if (r.truth(r.equal(r.get(s, "c328"), 1))) {
    await r.write("<font color=\"olive\">奖励： 切糕");
    await r.write(r.text(r.get(r.get(s, "ach328_qiegao_prize"), "2")));
    await r.write("</font> <br> 在<span class=\"cyan b\">荣耀模式</span>房间内共计击杀");
    await r.write(r.text(r.get(r.get(s, "ach328_threshold"), "2")));
    await r.write("名等级≥10、金钱≥2000的玩家。<br>");
  }
  if (r.truth((r.compare(r.get(s, "c328"), 2) >= 0))) {
    await r.write("<font color=\"olive\">奖励： 切糕");
    await r.write(r.text(r.get(r.get(s, "ach328_qiegao_prize"), "3")));
    await r.write("</font> <span class=\"cyan b\">卡集「Balefire Rekindle」随机卡片1张</span><br> 在<span class=\"cyan b\">荣耀模式</span>房间内共计击杀");
    await r.write(r.text(r.get(r.get(s, "ach328_threshold"), "3")));
    await r.write("名等级≥10、金钱≥2000的玩家。<br>");
  }
  await r.write("</td>\r\n</tr></table>");
return 1;
}
