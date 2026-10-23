// Generated from include/modules/extra/card/skills/skill560/desc.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  r.imports(s, "skill560");
  r.assign(r.slot(s, ["___TEMP_SKILL_ID"]), 560);
  r.assign(r.slot(s, ["shownames"]), (await r.module("skill560", "showlist560", r.get(s, "who"))));
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_START"), s));
  await r.write("<span>\r");
  await r.write(r.text(r.get(r.get(s, "clubskillname"), r.get(s, "___TEMP_SKILL_ID"))));
  await r.write("</span>");
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_MID1"), s));
  await r.write("<td class=\"skilldesc_left b3\"><span class=\"skilldesc\">\r\n<span class=\"yellow b\">战斗技</span>&nbsp;&nbsp;在发现敌人时，可选择放弃攻击并受到对方攻击，之后的游戏中对该敌人的先制率上升<span class=\"yellow b\">15%</span>。消耗<span class=\"yellow b\">");
  await r.write(r.text(r.get(s, "ragecost")));
  await r.write("</span>点怒气<br>");
  if (r.truth((!r.truth(r.get(s, "shownames"))))) {
    await r.write("当前尚未影响任何敌人");
  } else {
    await r.write("当前已经影响的敌人有：<span class=\"yellow b\">");
    await r.write(r.text(r.get(s, "shownames")));
    await r.write("</span>");
  }
  await r.write("</span></td>\r\n<td class=\"skilldesc_right b3\">\r\n</td>");
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_MID2"), s));
  if (r.truth((!r.truth(r.get(s, "___TEMP_THIS_SKILL_ACQUIRED"))))) {
    await r.write("<span class=\"yellow b\">\r\n</span>");
  }
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_END"), s));
return 1;
}
