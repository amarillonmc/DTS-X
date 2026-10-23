// Generated from include/modules/extra/club/skills/skill72/desc.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  r.imports(s, "skill72");
  r.assign(r.slot(s, ["___TEMP_SKILL_ID"]), 72);
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_START"), s));
  await r.write("<span>\r\n学习\r\n</span>");
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_MID1"), s));
  await r.write("<td class=\"skilldesc_left b3\"><span class=\"skilldesc\">");
  r.assign(r.slot(s, ["skill72_num"]), r.int((await r.module("skillbase", "skill_getvalue", 72, "t"))));
  r.assign(r.slot(s, ["skill72_left"]), r.subtract(r.get(s, "sk72_max_learn_num"), r.get(s, "skill72_num")));
  r.assign(r.slot(s, ["skill72_bnum"]), r.int((await r.module("skillbase", "skill_getvalue", 72, "b"))));
  r.assign(r.slot(s, ["skill72_bleft"]), r.subtract(1, r.get(s, "skill72_bnum")));
  await r.write("你可以学习任意<span class=\"yellow b\">");
  await r.write(r.text(r.get(s, "sk72_max_learn_num")));
  await r.write("</span>个非限定技能，其中至多<span class=\"yellow b\">1</span>个战斗技能<br>");
  if (r.truth((r.truth((r.compare(r.get(s, "skill72_num"), 0) > 0)) && r.truth((r.compare(r.get(s, "skill72_left"), 0) > 0))))) {
    await r.write("<span class=\"cyan b\">你还可以学习<span>");
    await r.write(r.text(r.get(s, "skill72_left")));
    await r.write("</span>个技能，其中至多<span>");
    await r.write(r.text(r.get(s, "skill72_bleft")));
    await r.write("</span>个战斗技能。</span>");
  } else {
    if (r.truth(r.equal(r.get(s, "skill72_left"), 0))) {
      await r.write("<span class=\"cyan b\">学习技能数目已达上限</span>");
    }
  }
  if (r.truth((r.compare(r.get(s, "skill72_left"), 0) > 0))) {
    (await r.call("bubblebox_start", "id:learntable72;height:620;width:672;cancellable:1;margin-right:8;"));
    await r.write("<p style=\"margin-left:0px; margin-top:0px; margin-right:0px; margin-bottom:0px;\">\r\n以下是可以学习的称号技能列表。少数技能不可以被学习，");
    if (r.truth(r.equal(r.get(s, "skill72_bleft"), 0))) {
      await r.write("战斗技能学习数目已达上限，");
    }
    await r.write("因此它们没有被显示。<br>\r\n<span class=\"yellow b\">请注意使用“查看”按钮查看技能时，技能的解锁条件没有显示。</span>请阅读帮助以获得完整的技能解锁要求。<br>\r\n少数几个技能出于游戏平衡原因，相对原版技能有所削弱，也请注意查看。<br>\r\n“费用”一栏指的是学习该技能需要消耗的技能点数目。<br>\r\n<br>\r\n</p>");
    (await r.module("sklearn_util", "get_skilllearn_table", "\\skill72\\sklearn_checker72"));
    await r.write("<br>");
    if (r.truth((!r.truth((!r.truth(r.get(r.globals, "___IN_HELP"))))))) {
      await r.write("<input type=\"button\" onclick=\"bubblebox_show('club18');\" value=\"返回\">");
    } else {
      await r.write("<input type=\"button\" onclick=\"bubblebox_show('clubskill');\" value=\"返回\">");
    }
    (await r.call("bubblebox_end"));
  }
  await r.write("</span></td>\r\n<td class=\"skilldesc_right b3\">");
  if (r.truth((r.compare(r.get(s, "skill72_left"), 0) > 0))) {
    await r.write("<input type=\"button\" style=\"width:46px\" onclick=\"bubblebox_show('learntable72');\" value=\"学习\">");
  } else {
    await r.write("<input type=\"button\" style=\"width:46px\" disabled=\"true\" value=\"学习\">");
  }
  await r.write("</td>");
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_MID2"), s));
  if (r.truth((!r.truth(r.get(s, "___TEMP_THIS_SKILL_ACQUIRED"))))) {
    await r.write("<span class=\"yellow b\">\r\n\r\n</span>");
  }
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_END"), s));
return 1;
}
