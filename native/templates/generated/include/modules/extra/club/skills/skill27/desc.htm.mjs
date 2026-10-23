// Generated from include/modules/extra/club/skills/skill27/desc.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  r.assign(r.slot(s, ["___TEMP_SKILL_ID"]), 27);
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_START"), s));
  await r.write("<span>\r\n流火\r\n</span>");
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_MID1"), s));
  await r.write("<td class=\"skilldesc_left b3\"><span class=\"skilldesc\">\r\n你的<span class=\"red b\">火焰</span>/<span class=\"red b\">灼焰</span>伤害将对敌方一件随机防具造成<span class=\"yellow b\">1点</span>/<span class=\"yellow b\">2点</span>耐久损伤。<br>\r\n如防具破碎（或该部位无防具），敌人烧伤。<br>\r\n在你发动“<span class=\"yellow b\">聚能</span>”时效果对敌人的所有防具发生且损伤<span class=\"yellow b\">+1</span>点。\r\n</span></td>\r\n<td class=\"skilldesc_right b3\">\r\n\r\n</td>");
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_MID2"), s));
  if (r.truth((!r.truth(r.get(s, "___TEMP_THIS_SKILL_ACQUIRED"))))) {
    await r.write("<span class=\"yellow b\">\r\n\r\n</span>");
  }
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_END"), s));
return 1;
}
