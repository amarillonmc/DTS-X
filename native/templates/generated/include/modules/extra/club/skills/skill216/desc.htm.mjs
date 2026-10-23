// Generated from include/modules/extra/club/skills/skill216/desc.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  r.imports(s, "skill216");
  r.assign(r.slot(s, ["___TEMP_SKILL_ID"]), 216);
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_START"), s));
  await r.write("<span>\r\n双响\r\n</span>");
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_MID1"), s));
  await r.write("<td class=\"skilldesc_left b3\"><span class=\"skilldesc\">");
  r.assign(r.slot(s, ["skill216_cnt"]), r.int((await r.module("skill216", "get_remaintime216"))));
  await r.write("<span class=\"yellow b\">战斗技</span><span class=\"red b\">&nbsp;&nbsp;限定技&nbsp;本局还可发动<span>");
  await r.write(r.text(r.get(s, "skill216_cnt")));
  await r.write("</span>/2次</span><br>使用爆系武器方可发动，连续攻击2次。\r\n</span></td>\r\n<td class=\"skilldesc_right b3\">\r\n</td>");
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_MID2"), s));
  if (r.truth((!r.truth(r.get(s, "___TEMP_THIS_SKILL_ACQUIRED"))))) {
    await r.write("<span class=\"yellow b\">\r\n19级时解锁\r\n</span>");
  }
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_END"), s));
return 1;
}
