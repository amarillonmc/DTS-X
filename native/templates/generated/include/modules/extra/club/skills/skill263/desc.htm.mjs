// Generated from include/modules/extra/club/skills/skill263/desc.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  r.imports(s, "skill263", "sys");
  r.assign(r.slot(s, ["___TEMP_SKILL_ID"]), 263);
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_START"), s));
  await r.write("<span>\r\n格斗\r\n</span>");
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_MID1"), s));
  await r.write("<td class=\"skilldesc_left b3\"><span class=\"skilldesc\">");
  if (r.truth(r.equal(r.get(s, "club"), 19))) {
    await r.write("你的基础防御力增加<span class=\"yellow b\">殴熟</span>点<br>\r\n战斗中，你有<span class=\"yellow b\">20%</span>几率抵挡<span class=\"yellow b\">殴熟</span>点伤害(最多800点)");
  } else {
    await r.write("你的基础防御力增加<span class=\"yellow b\">殴熟</span>点<br>\r\n战斗中，你有<span class=\"yellow b\">10%</span>几率抵挡<span class=\"yellow b\">殴熟</span>点伤害(最多800点)");
  }
  await r.write("</span></td>\r\n<td class=\"skilldesc_right b3\">\r\n</td>");
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_MID2"), s));
  if (r.truth((!r.truth(r.get(s, "___TEMP_THIS_SKILL_ACQUIRED"))))) {
    await r.write("<span class=\"yellow b\">\r\n11级时解锁\r\n</span>");
  }
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_END"), s));
return 1;
}
