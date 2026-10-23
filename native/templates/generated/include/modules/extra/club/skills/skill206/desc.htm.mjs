// Generated from include/modules/extra/club/skills/skill206/desc.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  r.imports(s, "skill206");
  r.assign(r.slot(s, ["___TEMP_SKILL_ID"]), 206);
  r.assign(r.slot(s, ["sk206r"]), (await r.module("skill206", "get_gunner_skillpoint_need", r.get(s, "who"))));
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_START"), s));
  await r.write("<span>\r\n爆头\r\n</span>");
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_MID1"), s));
  await r.write("<td class=\"skilldesc_left b3\"><span class=\"skilldesc\">\r\n使用射系武器造成超过<span class=\"yellow b\">85%</span>目标当前生命值的伤害时，自动将其秒杀\r\n</span></td>\r\n<td class=\"skilldesc_right b3\">\r\n</td>");
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_MID2"), s));
  if (r.truth((!r.truth(r.get(s, "___TEMP_THIS_SKILL_ACQUIRED"))))) {
    await r.write("<span class=\"yellow b\">\r\n在“静息”和“破甲”上共计花费至少15技能点以解锁<br>");
    r.assign(r.slot(s, ["skill206_cprogress"]), r.subtract(15, r.get(s, "sk206r")));
    if (r.truth((r.compare(r.get(s, "skill206_cprogress"), 0) > 0))) {
      await r.write("<span class=\"cyan b\">当前进度");
      await r.write(r.text(r.get(s, "skill206_cprogress")));
      await r.write("/15</span>");
    }
    await r.write("</span>");
  }
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_END"), s));
return 1;
}
