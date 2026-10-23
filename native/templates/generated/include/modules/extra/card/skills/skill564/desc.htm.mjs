// Generated from include/modules/extra/card/skills/skill564/desc.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  r.imports(s, "skill564");
  r.assign(r.slot(s, ["___TEMP_SKILL_ID"]), 564);
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_START"), s));
  await r.write("<span>\r");
  await r.write(r.text(r.get(r.get(s, "clubskillname"), r.get(s, "___TEMP_SKILL_ID"))));
  await r.write("</span>");
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_MID1"), s));
  await r.write("<td class=\"skilldesc_left b3\"><span class=\"skilldesc\">\r\n每升<span class=\"yellow b\">");
  await r.write(r.text(r.get(s, "sk564_lvl_req")));
  await r.write("</span>级，可在五个非限定技能或称号特性中选择一个学习，<br>");
  r.assign(r.slot(s, ["sk564_limit"]), r.int((await r.module("skillbase", "skill_getvalue", 564, "limit"))));
  await r.write("最多学习<span class=\"yellow b\">");
  await r.write(r.text(r.get(s, "sk564_chance_limit")));
  await r.write("</span>次，还能获得<span class=\"yellow b\">");
  await r.write(r.text(r.get(s, "sk564_limit")));
  await r.write("</span>次<br>");
  r.assign(r.slot(s, ["sk564_chance"]), r.int((await r.module("skillbase", "skill_getvalue", 564, "chance"))));
  await r.write("当前可以学习<span class=\"yellow b\">");
  await r.write(r.text(r.get(s, "sk564_chance")));
  await r.write("</span>次");
  (await r.call("bubblebox_start", "id:learntable564;height:400;width:655;cancellable:1;margin-right:8;"));
  await r.write("<p style=\"margin-left:0px; margin-top:0px; margin-right:0px; margin-bottom:0px;\">\r\n以下是你可以学习的称号技能列表。少数技能不可以被学习，因此它们没有被显示。<br>\r\n<span class=\"yellow b\">请注意使用“查看”按钮查看技能时，技能的解锁条件没有显示。</span>请阅读帮助以获得完整的技能解锁要求。<br>\r\n少数几个技能出于游戏平衡原因，相对原版技能有所削弱，也请注意查看。<br>\r\n<br>\r\n</p>");
  (await r.module("sklearn_util", "get_skilllearn_table", "\\skill564\\sklearn_checker564"));
  await r.write("<br>\r\n<input type=\"button\" onclick=\"bubblebox_show('clubskill');\" value=\"返回\">");
  (await r.call("bubblebox_end"));
  await r.write("</span></td>\r\n<td class=\"skilldesc_right b3\">");
  if (r.truth((r.compare(r.get(s, "sk564_chance"), 0) > 0))) {
    await r.write("<input type=\"button\" style=\"width:46px\" onclick=\"bubblebox_show('learntable564');\" value=\"学习\">");
  } else {
    await r.write("<input type=\"button\" style=\"width:46px\" onclick=\"bubblebox_show('learntable564');\" disabled=\"true\" value=\"学习\">");
  }
  await r.write("</td>");
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_MID2"), s));
  if (r.truth((!r.truth(r.get(s, "___TEMP_THIS_SKILL_ACQUIRED"))))) {
    await r.write("<span class=\"yellow b\">\r\n</span>");
  }
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_END"), s));
return 1;
}
