// Generated from include/modules/extra/activities/halloween2017/skill331/desc.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  await r.write("<table><tr>");
  r.imports(s, "skill331");
  await r.write("<td style=\"vertical-align:top\">");
  if (r.truth(r.equal(r.get(s, "c331"), "999"))) {
    await r.write("<img src=\"img/ach/DA_h2017.png\">");
  } else {
    if (r.truth(r.equal(r.get(s, "c331"), "0"))) {
      await r.write("<img src=\"img/ach/N_h2017.png\">");
    } else {
      await r.write("<img src=\"img/ach/D_h2017.png\">");
    }
  }
  await r.write("</td>\r\n<td valign=\"top\" align=\"left\">\r\n<b>\r\n不给糖就解禁\r\n</b>");
  if (r.truth(r.equal(r.get(s, "c331"), "999"))) {
    await r.write("<span class=\"lime b\">[完成]</span>");
  } else {
    if (r.truth(r.equal(r.get(s, "c331"), 0))) {
      await r.write("<span class=\"red b\">[未完成]</span>");
    } else {
      await r.write("<span class=\"cyan b\">[进行中]</span>");
    }
  }
  await r.write("<br>\r\n<font color=\"yellow\"><span>完成次数：");
  await r.write(r.text(r.get(s, "p331")));
  await r.write("次</span><br></font>\r\n<font color=\"olive\">奖励： 切糕");
  await r.write(r.text(r.get(r.get(s, "ach331_qiegao_prize"), "1")));
  await r.write("</font> <span class=\"cyan b\">「Balefire Rekindle」卡片1张</span><br> 开局20分钟内解禁完成，且身上拥有总数");
  await r.write(r.text(r.get(s, "ach331_itemnum")));
  await r.write("个以上的万圣节糖果<br>\r\n</td>\r\n</tr></table>");
return 1;
}
