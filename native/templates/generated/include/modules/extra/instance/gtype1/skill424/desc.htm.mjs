// Generated from include/modules/extra/instance/gtype1/skill424/desc.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  r.imports(s, "skill424", "sys");
  r.assign(r.slot(s, ["___TEMP_SKILL_ID"]), 424);
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_START"), s));
  await r.write("<span>\r\n除错\r\n</span>");
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_MID1"), s));
  await r.write("<td class=\"skilldesc_left b3\"><span class=\"skilldesc\">");
  r.assign(r.slot(s, ["skill424_proc"]), r.int((await r.module("skillbase", "skill_getvalue", 424, "lvl"))));
  r.assign(r.slot(s, ["skill424_need1"]), r.int((await r.module("skillbase", "skill_getvalue", 424, "cur1"))));
  r.assign(r.slot(s, ["skill424_need2"]), r.int((await r.module("skillbase", "skill_getvalue", 424, "cur2"))));
  await r.write("提交指定的物品来追查病毒、修复幻境系统。除错成功会获得奖励。<br>\r\n除错进度：<span class=\"yellow b\">");
  await r.write(r.text(r.get(s, "skill424_proc")));
  await r.write("</span>次<br>需求物品：");
  await r.write(r.text((await r.module("skill424", "wdebug_showreq"))));
  await r.write("<br>\r\n</span></td>\r\n<td class=\"skilldesc_right b3\">\r\n</td>");
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_MID2"), s));
  if (r.truth((!r.truth(r.get(s, "___TEMP_THIS_SKILL_ACQUIRED"))))) {
    await r.write("<span class=\"yellow b\">\r\n</span>");
  }
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_END"), s));
return 1;
}
