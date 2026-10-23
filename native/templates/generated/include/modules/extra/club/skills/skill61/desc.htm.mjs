// Generated from include/modules/extra/club/skills/skill61/desc.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  r.imports(s, "skill61");
  r.assign(r.slot(s, ["___TEMP_SKILL_ID"]), 61);
  r.assign(r.slot(s, ["skprocrate"]), (await r.module("skill61", "get_sk_procrate61")));
  r.assign(r.slot(s, ["hpprocrate"]), (await r.module("skill61", "get_hp_procrate61")));
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_START"), s));
  await r.write("<span>\r\n黑暗\r\n</span>");
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_MID1"), s));
  await r.write("<td class=\"skilldesc_left b3\"><span class=\"skilldesc\">\r\n当你攻击敌人时，你有<span class=\"yellow b\">");
  await r.write(r.text(r.get(s, "skprocrate")));
  await r.write("%</span>几率吸取敌人<span class=\"yellow b\">1</span>点全系熟练，<br>\r\n<span class=\"yellow b\">");
  await r.write(r.text(r.get(s, "hpprocrate")));
  await r.write("%</span>几率吸取敌人<span class=\"yellow b\">1</span>点生命上限\r\n</span></td>\r\n<td class=\"skilldesc_right b3\">\r\n</td>");
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_MID2"), s));
  if (r.truth((!r.truth(r.get(s, "___TEMP_THIS_SKILL_ACQUIRED"))))) {
    await r.write("<span class=\"yellow b\">\r\n</span>");
  }
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_END"), s));
return 1;
}
