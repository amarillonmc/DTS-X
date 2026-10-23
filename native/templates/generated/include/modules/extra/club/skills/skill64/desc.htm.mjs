// Generated from include/modules/extra/club/skills/skill64/desc.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  r.imports(s, "skill64");
  r.assign(r.slot(s, ["___TEMP_SKILL_ID"]), 64);
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_START"), s));
  await r.write("<span>\r\n索魂\r\n</span>");
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_MID1"), s));
  await r.write("<td class=\"skilldesc_left b3\"><span class=\"skilldesc\">\r\n当你击杀敌人时，你的<span class=\"yellow b\">命体上限</span>、<span class=\"yellow b\">经验值</span>、<br><span class=\"yellow b\">全系熟练</span>、<span class=\"yellow b\">基础攻防</span>中随机一项的数值<span class=\"yellow b\">+3～5</span>点<br>\r\n使用技能“<span class=\"yellow b\">恐惧</span>”击杀敌人时，改为获得上述全部四项的加成\r\n</span></td>\r\n<td class=\"skilldesc_right b3\">\r\n</td>");
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_MID2"), s));
  if (r.truth((!r.truth(r.get(s, "___TEMP_THIS_SKILL_ACQUIRED"))))) {
    await r.write("<span class=\"yellow b\">\r\n15级时解锁\r\n</span>");
  }
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_END"), s));
return 1;
}
