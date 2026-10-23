// Generated from include/modules/extra/card/skills/skill485/desc.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  r.assign(r.slot(s, ["___TEMP_SKILL_ID"]), 485);
  r.imports(s, "skill485");
  r.assign(r.slot(s, ["lvl485"]), (await r.module("skillbase", "skill_getvalue", 485, "lvl", r.get(s, "who"))));
  r.assign(r.slot(s, ["skill485fac"]), r.get(r.get(s, "skill485factors"), r.get(s, "lvl485")));
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_START"), s));
  await r.write("<span>\r\n嫉恶\r\n</span>");
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_MID1"), s));
  await r.write("<td class=\"skilldesc_left b3\"><span class=\"skilldesc\">\r\n战斗中，你的敌人每有1杀人数，其受到的伤害增加");
  await r.write(r.text(r.get(s, "skill485fac")));
  await r.write("%。只对玩家有效。\r\n</span></td>\r\n<td class=\"skilldesc_right b3\">\r\n</td>");
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_MID2"), s));
  if (r.truth((!r.truth(r.get(s, "___TEMP_THIS_SKILL_ACQUIRED"))))) {
    await r.write("<span class=\"yellow b\">\r\n</span>");
  }
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_END"), s));
return 1;
}
