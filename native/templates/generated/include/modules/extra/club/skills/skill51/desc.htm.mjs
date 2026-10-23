// Generated from include/modules/extra/club/skills/skill51/desc.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  r.imports(s, "skill51");
  r.assign(r.slot(s, ["___TEMP_SKILL_ID"]), 51);
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_START"), s));
  await r.write("<span>\r\n百出\r\n</span>");
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_MID1"), s));
  await r.write("<td class=\"skilldesc_left b3\"><span class=\"skilldesc\">\r\n<!--由于这个技能未解锁提示比描述本身还长，只好在没解锁时候多放两个空行撑开距离了……-->");
  if (r.truth((!r.truth(r.get(s, "___TEMP_THIS_SKILL_ACQUIRED"))))) {
    await r.write("<span style=\"height:8px; display:block;\">&nbsp;</span>");
  }
  await r.write("持投系武器时物理伤害<span class=\"yellow b\">+2x%</span>，其中<span class=\"yellow b\">x</span>是你发动“<span class=\"yellow b\">附魔</span>”的次数<br>");
  if (r.truth((!r.truth((!r.truth(r.get(s, "___TEMP_THIS_SKILL_ACQUIRED"))))))) {
    r.assign(r.slot(s, ["sk51cadd"]), (await r.module("skill51", "get_skill51_multiplier", r.get(s, "who"))));
    await r.write("当前情况：持投系武器时，你造成的物理伤害将<span class=\"yellow b\">+");
    await r.write(r.text(r.get(s, "sk51cadd")));
    await r.write("%</span>");
  }
  if (r.truth((!r.truth(r.get(s, "___TEMP_THIS_SKILL_ACQUIRED"))))) {
    await r.write("<span style=\"height:8px; display:block;\">&nbsp;</span>");
  }
  await r.write("</span></td>\r\n<td class=\"skilldesc_right b3\">\r\n</td>");
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_MID2"), s));
  if (r.truth((!r.truth(r.get(s, "___TEMP_THIS_SKILL_ACQUIRED"))))) {
    await r.write("<span class=\"yellow b\">");
    r.assign(r.slot(s, ["sk51progress"]), (await r.module("skill51", "get_skill48_maxbuff", r.get(s, "who"))));
    await r.write("“附魔”中最高的属性伤害加成达到120%时解锁<br>\r\n<span class=\"cyan b\">当前进度");
    await r.write(r.text(r.get(s, "sk51progress")));
    await r.write("/120</span>\r\n</span>");
  }
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_END"), s));
return 1;
}
