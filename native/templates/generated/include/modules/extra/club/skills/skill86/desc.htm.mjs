// Generated from include/modules/extra/club/skills/skill86/desc.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  r.imports(s, "skill86");
  r.assign(r.slot(s, ["___TEMP_SKILL_ID"]), 86);
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_START"), s));
  await r.write("<span>\r");
  await r.write(r.text(r.get(r.get(s, "clubskillname"), r.get(s, "___TEMP_SKILL_ID"))));
  await r.write("</span>");
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_MID1"), s));
  await r.write("<td class=\"skilldesc_left b3\"><span class=\"skilldesc\">\r\n与你在同一地点的每一个佣兵有<span class=\"yellow b\">10%</span>在你攻击后进行一次追加攻击<br>\r\n<span class=\"yellow b\">战斗技</span>&nbsp;&nbsp;佣兵的追加攻击率上升至<span class=\"yellow b\">50%</span>。<br>消耗<span class=\"yellow b\">");
  await r.write(r.text(r.get(s, "ragecost")));
  await r.write("</span>点怒气，并支付每个追击的佣兵<span class=\"yellow b\">");
  await r.write(r.text(r.get(s, "moneycost")));
  await r.write("</span>元金钱\r\n</span></td>\r\n<td class=\"skilldesc_right b3\">\r\n</td>");
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_MID2"), s));
  if (r.truth((!r.truth(r.get(s, "___TEMP_THIS_SKILL_ACQUIRED"))))) {
    await r.write("<span class=\"yellow b\">\r\n15级时解锁\r\n</span>");
  }
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_END"), s));
return 1;
}
