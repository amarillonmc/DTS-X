// Generated from include/modules/extra/club/skills/skill112/desc.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  r.imports(s, "skill112");
  r.assign(r.slot(s, ["___TEMP_SKILL_ID"]), 112);
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_START"), s));
  await r.write("<span>\r");
  await r.write(r.text(r.get(r.get(s, "clubskillname"), r.get(s, "___TEMP_SKILL_ID"))));
  await r.write("</span>");
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_MID1"), s));
  await r.write("<td class=\"skilldesc_left b3\"><span class=\"skilldesc\">\r\n<span class=\"yellow b\">战斗技</span>&nbsp;&nbsp;本次攻击物理伤害<span class=\"yellow b\">+30%</span>，且无视敌人的所有减半防御属性，<br>若击杀敌人，随机复制敌人的一个技能（不会复制玩家的卡片技能），<br>该<span class=\"cyan b\">临时</span>技能持续<span class=\"cyan b\">");
  await r.write(r.text(r.get(s, "skill112_tempskill_time")));
  await r.write("</span>秒<br>消耗<span class=\"yellow b\">");
  await r.write(r.text(r.get(s, "ragecost")));
  await r.write("</span>点怒气与<span class=\"yellow b\">1</span>点理智值，未击杀时有<span class=\"yellow b\">70%</span>概率不消耗理智值\r\n</span></td>\r\n<td class=\"skilldesc_right b3\">\r\n</td>");
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_MID2"), s));
  if (r.truth((!r.truth(r.get(s, "___TEMP_THIS_SKILL_ACQUIRED"))))) {
    await r.write("<span class=\"yellow b\">\r\n15级时解锁\r\n</span>");
  }
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_END"), s));
return 1;
}
