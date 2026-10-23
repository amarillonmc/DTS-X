// Generated from include/modules/extra/card/skills/skill552/desc.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  r.imports(s, "skill552", "sys");
  r.assign(r.slot(s, ["___TEMP_SKILL_ID"]), 552);
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_START"), s));
  await r.write("<span>\r");
  await r.write(r.text(r.get(r.get(s, "clubskillname"), r.get(s, "___TEMP_SKILL_ID"))));
  await r.write("</span>");
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_MID1"), s));
  await r.write("<td class=\"skilldesc_left b3\"><span class=\"skilldesc\">");
  if (r.truth((!r.truth((await r.module("skillbase", "skill_getvalue", 552, "activated", r.get(s, "who"))))))) {
    await r.write("你可以消耗<span class=\"yellow b\">");
    await r.write(r.text(r.get(s, "skill552_cost")));
    await r.write("</span>点生命上限，<br>将手持武器改造为锐器，并改名为「");
    await r.write(r.text(r.get(s, "skill552_wep")));
    await r.write("」（只能发动一次）。");
  } else {
    await r.write("<span class=\"yellow b\">你已经铸造过一把伐木斧了！</span>");
  }
  await r.write("<br>\r\n当你装备该武器在战斗中击杀敌人时，<br>立即获得<span class=\"yellow b\">（武器熟练度×");
  await r.write(r.text(r.get(s, "skill552_gain_rate")));
  await r.write("）</span>元的金钱。\r\n</span></td>\r\n<td class=\"skilldesc_right b3\">\r\n</td>");
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_MID2"), s));
  if (r.truth((!r.truth(r.get(s, "___TEMP_THIS_SKILL_ACQUIRED"))))) {
    await r.write("<span class=\"yellow b\">\r\n12级时解锁\r\n</span>");
  }
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_END"), s));
return 1;
}
