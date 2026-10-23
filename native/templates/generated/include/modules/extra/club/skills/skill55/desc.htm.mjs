// Generated from include/modules/extra/club/skills/skill55/desc.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  r.imports(s, "skill55");
  r.assign(r.slot(s, ["___TEMP_SKILL_ID"]), 55);
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_START"), s));
  await r.write("<span>\r\n家教\r\n</span>");
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_MID1"), s));
  await r.write("<td class=\"skilldesc_left b3\"><span class=\"skilldesc\">");
  r.assign(r.slot(s, ["skill55_nchoice"]), r.int((await r.module("skillbase", "skill_getvalue", 55, "l"))));
  r.assign(r.slot(s, ["needed_money"]), (await r.module("skill55", "get_needed_money55")));
  if (r.truth(r.equal(r.get(s, "skill55_nchoice"), 0))) {
    await r.write("学习任意一个非限定技能<br>\r\n可以随意变更学习的技能，但需花费<span class=\"yellow b\">");
    await r.write(r.text(r.get(s, "needed_money")));
    await r.write("</span>元<br>");
  } else {
    await r.write("你当前习得的技能是“<span class=\"yellow b\">");
    await r.write(r.text(r.get(r.get(s, "clubskillname"), r.get(s, "skill55_nchoice"))));
    await r.write("</span>”<br>\r\n可以重新学习一个技能，但这将花费<span class=\"yellow b\">");
    await r.write(r.text(r.get(s, "needed_money")));
    await r.write("</span>元<br>");
  }
  await r.write("每次更换技能都将使下次的花费翻倍");
  (await r.call("bubblebox_start", "id:learntable55;height:620;width:655;cancellable:1;margin-right:8;"));
  await r.write("<p style=\"margin-left:0px; margin-top:0px; margin-right:0px; margin-bottom:0px;\">\r\n以下是你可以学习的称号技能列表。少数技能不可以被学习，因此没有显示。<br>\r\n<span class=\"yellow b\">请注意使用“查看”按钮查看技能时，技能的解锁条件没有显示。</span>请阅读帮助以获得完整的技能解锁要求。<br>\r\n少数几个技能出于游戏平衡原因，相对原版技能有所削弱，也请注意查看。<br>");
  if (r.truth((!r.equal(r.get(s, "skill55_nchoice"), 0)))) {
    await r.write("本次学习将花费<span class=\"yellow b\">");
    await r.write(r.text(r.get(s, "needed_money")));
    await r.write("</span>元，并失去目前已习得的技能<span class=\"yellow b\">");
    await r.write(r.text(r.get(r.get(s, "clubskillname"), r.get(s, "skill55_nchoice"))));
    await r.write("</span>。<br>");
  }
  await r.write("<br>\r\n</p>");
  (await r.module("sklearn_util", "get_skilllearn_table", "\\skill55\\sklearn_checker55"));
  await r.write("<br>");
  if (r.truth((!r.truth((!r.truth(r.get(r.globals, "___IN_HELP"))))))) {
    await r.write("<input type=\"button\" onclick=\"bubblebox_show('club11');\" value=\"返回\">");
  } else {
    await r.write("<input type=\"button\" onclick=\"bubblebox_show('clubskill');\" value=\"返回\">");
  }
  (await r.call("bubblebox_end"));
  await r.write("</span></td>\r\n<td class=\"skilldesc_right b3\">");
  if (r.truth((r.truth(r.equal(r.get(s, "skill55_nchoice"), 0)) || r.truth((r.compare(r.get(s, "money"), r.get(s, "skill55_need")) >= 0))))) {
    await r.write("<input type=\"button\" style=\"width:46px\" onclick=\"bubblebox_show('learntable55');\" value=\"学习\">");
  } else {
    await r.write("<input type=\"button\" style=\"width:46px\" disabled=\"true\" value=\"学习\">");
  }
  await r.write("</td>");
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_MID2"), s));
  if (r.truth((!r.truth(r.get(s, "___TEMP_THIS_SKILL_ACQUIRED"))))) {
    await r.write("<span class=\"yellow b\">\r\n3级时解锁");
    if (r.truth((!r.truth((!r.truth(r.get(r.globals, "___IN_HELP"))))))) {
      await r.write("<input type=\"button\" style=\"width:46px;margin-right:25px;float:right;\" onclick=\"bubblebox_show('learntable55');\" value=\"学习\">");
    }
    await r.write("</span>");
  }
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_END"), s));
return 1;
}
