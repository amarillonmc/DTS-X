// Generated from include/modules/extra/card/skills/skill407/desc.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  r.imports(s, "skill407");
  r.assign(r.slot(s, ["___TEMP_SKILL_ID"]), 407);
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_START"), s));
  await r.write("<span>\r\n红石\r\n</span>");
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_MID1"), s));
  await r.write("<td class=\"skilldesc_left b3\"><span class=\"skilldesc\">\r\n生命值在<span class=\"yellow b\">50</span>%以上时防御力增加相当于攻击力<span class=\"yellow b\">50</span>%的数值<br>\r\n生命值在<span class=\"yellow b\">50</span>%以下时攻击力增加相当于防御力<span class=\"yellow b\">50</span>%的数值<br>\r\n（增加值不会超过100000）\r\n</span></td>\r\n<td class=\"skilldesc_right b3\">\r\n</td>");
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_MID2"), s));
  if (r.truth((!r.truth(r.get(s, "___TEMP_THIS_SKILL_ACQUIRED"))))) {
    await r.write("<span class=\"yellow b\">\r\n</span>");
  }
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_END"), s));
return 1;
}
