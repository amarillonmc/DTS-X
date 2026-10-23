// Generated from include/modules/extra/club/skills/skill234/desc.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  r.imports(s, "skill234", "sys");
  r.assign(r.slot(s, ["___TEMP_SKILL_ID"]), 234);
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_START"), s));
  await r.write("<span>\r\n破解\r\n</span>");
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_MID1"), s));
  await r.write("<td class=\"skilldesc_left b3\"><span class=\"skilldesc\">");
  r.assign(r.slot(s, ["skill234_proc"]), r.multiply(r.int((await r.module("skillbase", "skill_getvalue", 234, "lvl"))), 2));
  r.assign(r.slot(s, ["skill234_need1"]), r.int((await r.module("skillbase", "skill_getvalue", 234, "cur1"))));
  r.assign(r.slot(s, ["skill234_need2"]), r.int((await r.module("skillbase", "skill_getvalue", 234, "cur2"))));
  await r.write("通过消耗特定的物品来破解游戏系统，每次破解成功都会获得奖励。<br>\r\n破解进度：<span class=\"yellow b\">");
  await r.write(r.text(r.get(s, "skill234_proc")));
  await r.write("</span>%<br>需求物品：<span class=\"yellow b\">");
  await r.write(r.text(r.get(r.get(s, "goal234"), r.get(s, "skill234_need1"))));
  await r.write("</span> 或 <span class=\"yellow b\">");
  await r.write(r.text(r.get(r.get(s, "goal234"), r.get(s, "skill234_need2"))));
  await r.write("</span><br>\r\n</span></td>\r\n<td class=\"skilldesc_right b3\">\r\n</td>");
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_MID2"), s));
  if (r.truth((!r.truth(r.get(s, "___TEMP_THIS_SKILL_ACQUIRED"))))) {
    await r.write("<span class=\"yellow b\">\r\n</span>");
  }
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_END"), s));
return 1;
}
