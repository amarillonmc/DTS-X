// Generated from include/modules/extra/club/skills/skill204/desc.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  r.assign(r.slot(s, ["___TEMP_SKILL_ID"]), 204);
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_START"), s));
  await r.write("<span>\r\n掠夺\r\n</span>");
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_MID1"), s));
  r.assign(r.slot(s, ["gold_r"]), (r.truth(r.equal(r.get(s, "club"), 3)) ? 2.5 : 1.5));
  r.assign(r.slot(s, ["gold_p"]), (await r.call("round", r.multiply(r.get(s, "lvl"), r.get(s, "gold_r")))));
  await r.write("<td class=\"skilldesc_left b3\"><span class=\"skilldesc\">\r\n当你在战斗中击杀敌人时，你立即获得<span class=\"yellow b\">(你的等级×");
  await r.write(r.text(r.get(s, "gold_r")));
  await r.write(")</span>点金钱。<br>\r\n</span></td>\r\n<td class=\"skilldesc_right b3\">\r\n</td>");
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_MID2"), s));
  if (r.truth((!r.truth(r.get(s, "___TEMP_THIS_SKILL_ACQUIRED"))))) {
    await r.write("<span class=\"yellow b\">\r\n8级时解锁\r\n</span>");
  }
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_END"), s));
return 1;
}
