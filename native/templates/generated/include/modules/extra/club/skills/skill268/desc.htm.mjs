// Generated from include/modules/extra/club/skills/skill268/desc.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  r.assign(r.slot(s, ["___TEMP_SKILL_ID"]), 268);
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_START"), s));
  await r.write("<span>\r\n不屈\r\n</span>");
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_MID1"), s));
  await r.write("<td class=\"skilldesc_left b3\"><span class=\"skilldesc\">\r\n如果受到的战斗伤害不超过你最大HP的一半，你不会因为这次伤害而死。");
  r.assign(r.slot(s, ["rmt"]), (await r.module("skillbase", "skill_getvalue", 268, "rmt", r.get(s, "who"))));
  if (r.truth((!r.truth(r.get(s, "rmt"))))) {
    r.assign(r.slot(s, ["rmt"]), 0);
  }
  await r.write("本局游戏还可以触发<span class=");
  if (r.truth(r.get(s, "rmt"))) {
    await r.write("\"cyan b\"");
  } else {
    await r.write("\"red b\"");
  }
  await r.write(">");
  await r.write(r.text(r.get(s, "rmt")));
  await r.write("/2</span>次。\r\n</span></td>\r\n<td class=\"skilldesc_right b3\">\r\n</td>");
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_MID2"), s));
  if (r.truth((!r.truth(r.get(s, "___TEMP_THIS_SKILL_ACQUIRED"))))) {
    await r.write("<span class=\"yellow b\">\r\n15级时解锁\r\n</span>");
  }
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_END"), s));
return 1;
}
