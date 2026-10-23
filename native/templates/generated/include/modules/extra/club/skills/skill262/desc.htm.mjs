// Generated from include/modules/extra/club/skills/skill262/desc.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  r.imports(s, "skill262", "sys");
  r.assign(r.slot(s, ["___TEMP_SKILL_ID"]), 262);
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_START"), s));
  await r.write("<span>\r\n蓄力\r\n</span>");
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_MID1"), s));
  await r.write("<td class=\"skilldesc_left b3\"><span class=\"skilldesc\">");
  if (r.truth(r.equal(r.get(s, "club"), 19))) {
    await r.write("主动发起战斗时，可以通过蓄力增加物理伤害，最高可达<span class=\"yellow b\">2</span>倍<br>\r\n蓄力<span class=\"yellow b\">1</span>秒后伤害开始增加，之后每蓄力<span class=\"yellow b\">1</span>秒增加<span class=\"yellow b\">17%</span>伤害");
  } else {
    await r.write("主动发起战斗时，你可以通过蓄力增加物理伤害，最高可达<span class=\"yellow b\">1.5</span>倍<br>\r\n蓄力<span class=\"yellow b\">2</span>秒后伤害开始增加，之后每蓄力<span class=\"yellow b\">1</span>秒增加<span class=\"yellow b\">5%</span>伤害");
  }
  await r.write("</span></td>\r\n<td class=\"skilldesc_right b3\">\r\n</td>");
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_MID2"), s));
  if (r.truth((!r.truth(r.get(s, "___TEMP_THIS_SKILL_ACQUIRED"))))) {
    await r.write("<span class=\"yellow b\">\r\n8级时解锁\r\n</span>");
  }
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_END"), s));
return 1;
}
