// Generated from include/modules/extra/card/skills/skill514/desc.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  r.assign(r.slot(s, ["___TEMP_SKILL_ID"]), 514);
  r.imports(s, "clubbase");
  r.assign(r.slot(s, ["skill514_var"]), r.divide((await r.module("skillbase", "skill_getvalue", 514, "var", r.get(s, "who"))), 10));
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_START"), s));
  await r.write("<span>\r");
  await r.write(r.text(r.get(r.get(s, "clubskillname"), r.get(s, "___TEMP_SKILL_ID"))));
  await r.write("</span>");
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_MID1"), s));
  await r.write("<td class=\"skilldesc_left b3\"><span class=\"skilldesc\">\r\n敌人对你攻击的命中率不会高于<span class=\"yellow b\">");
  await r.write(r.text(r.get(s, "skill514_var")));
  await r.write("%</span>。<br>每当你命中敌人，攻击结束后这个值都会翻倍。\r\n<br>此外，你的直死属性生效的概率不会高于<span class=\"yellow b\">");
  await r.write(r.text((await r.module("skill514", "get_seckill_limit514", 10, r.get(s, "skill514_var")))));
  await r.write("%</span>。\r\n</span></td>\r\n<td class=\"skilldesc_right b3\">\r\n</td>");
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_MID2"), s));
  if (r.truth((!r.truth(r.get(s, "___TEMP_THIS_SKILL_ACQUIRED"))))) {
    await r.write("<span class=\"yellow b\">\r\n</span>");
  }
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_END"), s));
return 1;
}
