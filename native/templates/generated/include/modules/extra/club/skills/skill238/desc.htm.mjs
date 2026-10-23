// Generated from include/modules/extra/club/skills/skill238/desc.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  r.assign(r.slot(s, ["___TEMP_SKILL_ID"]), 238);
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_START"), s));
  await r.write("<span>\r\n过载\r\n</span>");
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_MID1"), s));
  await r.write("<td class=\"skilldesc_left b3\"><span class=\"skilldesc\">");
  if (r.truth(r.equal(r.get(r.get(s, "who"), "card"), 63))) {
    await r.write("你造成的电击伤害没有上限，且电击伤害提高<span class=\"yellow b\">50%</span>");
  } else {
    if (r.truth(r.equal(r.get(r.get(s, "who"), "card"), 64))) {
      await r.write("你造成的电击伤害没有上限，且电击伤害提高<span class=\"yellow b\">25%</span>");
    } else {
      await r.write("你造成的电击伤害没有上限");
    }
  }
  await r.write("</span></td>\r\n<td class=\"skilldesc_right b3\">\r\n</td>");
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_MID2"), s));
  if (r.truth((!r.truth(r.get(s, "___TEMP_THIS_SKILL_ACQUIRED"))))) {
    await r.write("<span class=\"yellow b\">\r\n20级时解锁\r\n</span>");
  }
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_END"), s));
return 1;
}
