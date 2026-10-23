// Generated from include/modules/extra/card/skills/skill461/desc.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  r.imports(s, "skill461", "sys");
  r.assign(r.slot(s, ["___TEMP_SKILL_ID"]), 461);
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_START"), s));
  await r.write("<span>");
  if (r.truth(r.equal((await r.module("skillbase", "skill_getvalue", 461, "lvl", r.get(s, "who"))), 1))) {
    await r.write("免疫");
  } else {
    await r.write("镇定");
  }
  await r.write("</span>");
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_MID1"), s));
  await r.write("<td class=\"skilldesc_left b3\"><span class=\"skilldesc\">\r\n敌人无法对你施加任何时效性负面状态。<br>");
  if (r.truth(r.equal((await r.module("skillbase", "skill_getvalue", 461, "lvl", r.get(s, "who"))), 1))) {
    await r.write("战斗结束后，你自动从所有异常状态中恢复。");
  }
  await r.write("</span></td>\r\n<td class=\"skilldesc_right b3\">\r\n</td>");
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_MID2"), s));
  if (r.truth((!r.truth(r.get(s, "___TEMP_THIS_SKILL_ACQUIRED"))))) {
    await r.write("<span class=\"yellow b\">\r\n</span>");
  }
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_END"), s));
return 1;
}
