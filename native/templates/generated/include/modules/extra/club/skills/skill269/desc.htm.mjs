// Generated from include/modules/extra/club/skills/skill269/desc.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  r.imports(s, "skill269");
  r.assign(r.slot(s, ["___TEMP_SKILL_ID"]), 269);
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_START"), s));
  await r.write("<span>\r\n浴血\r\n</span>");
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_MID1"), s));
  await r.write("<td class=\"skilldesc_left b3\"><span class=\"skilldesc\">\r\n<span class=\"yellow b\">战斗技</span>：附加等于<br><span class=\"yellow b\">(你-敌方当前生命)/2</span>与<span class=\"yellow b\">你25%生命上限</span>中较大者的物理伤害。<br>\r\n发动消耗<span class=\"yellow b\">");
  await r.write(r.text(r.get(s, "ragecost")));
  await r.write("</span>点怒气 <span class=\"cyan b\">或者</span> <span class=\"yellow b\">");
  await r.write(r.text(r.get(s, "ragecost0")));
  await r.write("</span>点怒气+<span class=\"red b\">附加伤害数值的</span>当前生命\r\n</span></td>\r\n<td class=\"skilldesc_right b3\">\r\n</td>");
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_MID2"), s));
  if (r.truth((!r.truth(r.get(s, "___TEMP_THIS_SKILL_ACQUIRED"))))) {
    await r.write("<span class=\"yellow b\">\r\n21级时解锁\r\n</span>");
  }
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_END"), s));
return 1;
}
