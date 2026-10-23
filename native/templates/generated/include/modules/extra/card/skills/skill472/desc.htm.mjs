// Generated from include/modules/extra/card/skills/skill472/desc.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  r.imports(s, "skill472");
  r.assign(r.slot(s, ["___TEMP_SKILL_ID"]), 472);
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_START"), s));
  await r.write("<span>\r\n窃取\r\n</span>");
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_MID1"), s));
  await r.write("<td class=\"skilldesc_left b3\"><span class=\"skilldesc\">\r\n学习任意一个非战斗非限定技能，可以随意改变学习的技能<br>");
  r.assign(r.slot(s, ["sk472"]), r.int((await r.module("skillbase", "skill_getvalue", 472, "l"))));
  if (r.truth((!r.equal(r.get(s, "sk472"), 0)))) {
    r.assign(r.slot(s, ["sk472_learnt"]), r.get(r.get(s, "clubskillname"), r.int((await r.module("skillbase", "skill_getvalue", 472, "l")))));
    await r.write("你现在掌握的技能是“<span class=\"yellow b\">");
    await r.write(r.text(r.get(s, "sk472_learnt")));
    await r.write("</span>”");
  }
  (await r.call("bubblebox_start", "id:learntable472;height:400;width:655;cancellable:1;margin-right:8;"));
  await r.write("<p style=\"margin-left:0px; margin-top:0px; margin-right:0px; margin-bottom:0px;\">\r\n以下是你可以学习的称号技能列表。战斗技和限定技不可以被学习，因此没有显示。<br>\r\n<span class=\"yellow b\">请注意使用“查看”按钮查看技能时，技能的解锁条件没有显示。</span>请阅读帮助以获得完整的技能解锁要求。<br>\r\n少数几个技能出于游戏平衡原因，相对原版技能有所削弱，也请注意查看。<br>\r\n<br>\r\n</p>");
  (await r.module("sklearn_util", "get_skilllearn_table", "\\skill472\\sklearn_checker472"));
  await r.write("<br>\r\n<input type=\"button\" onclick=\"bubblebox_show('clubskill');\" value=\"返回\">");
  (await r.call("bubblebox_end"));
  await r.write("</span></td>\r\n<td class=\"skilldesc_right b3\">\r\n<input type=\"button\" style=\"width:46px\" onclick=\"bubblebox_show('learntable472');\" value=\"学习\">\r\n</td>");
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_MID2"), s));
  if (r.truth((!r.truth(r.get(s, "___TEMP_THIS_SKILL_ACQUIRED"))))) {
    await r.write("<span class=\"yellow b\">\r\n15级时解锁\r\n</span>");
  }
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_END"), s));
return 1;
}
