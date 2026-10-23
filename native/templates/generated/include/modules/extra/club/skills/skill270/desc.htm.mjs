// Generated from include/modules/extra/club/skills/skill270/desc.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  r.imports(s, "skill270");
  r.assign(r.slot(s, ["___TEMP_SKILL_ID"]), 270);
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_START"), s));
  await r.write("<span>\r\n神影\r\n</span>");
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_MID1"), s));
  await r.write("<td class=\"skilldesc_left b3\"><span class=\"skilldesc\">\r\n如果你所用武器熟练度大于敌人所用武器熟练度，<br>你对其命中率<span class=\"cyan b\">+");
  await r.write(r.text(r.get(s, "skill270hitrate")));
  await r.write("%</span>，主动攻击时先制攻击率<span class=\"cyan b\">+");
  await r.write(r.text(r.get(s, "skill270active")));
  await r.write("%</span>\r\n</span></td>\r\n<td class=\"skilldesc_right b3\">\r\n</td>");
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_MID2"), s));
  if (r.truth((!r.truth(r.get(s, "___TEMP_THIS_SKILL_ACQUIRED"))))) {
    await r.write("<span class=\"yellow b\">\r\n9级时解锁\r\n</span>");
  }
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_END"), s));
return 1;
}
