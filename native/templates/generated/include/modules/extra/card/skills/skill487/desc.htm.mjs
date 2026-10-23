// Generated from include/modules/extra/card/skills/skill487/desc.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  r.assign(r.slot(s, ["___TEMP_SKILL_ID"]), 487);
  r.imports(s, "player", "skill487");
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_START"), s));
  await r.write("<span>\r\n后手\r\n</span>");
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_MID1"), s));
  await r.write("<td class=\"skilldesc_left b3\"><span class=\"skilldesc\">\r\n你主动操作时因战斗或陷阱导致不足半血时，自动服用上一次吃的无毒回复道具直到HP回满或道具耗尽。这一技能不会产生道具CD。<br>");
  if (r.truth((!r.truth((!r.truth((await r.module("skill487", "show_last_hitem487", r.get(s, "who"))))))))) {
    await r.write("当前首选的回复道具是<span class=\"lime b\">");
    await r.write(r.text((await r.module("skill487", "show_last_hitem487", r.get(s, "who")))));
    await r.write("</span>");
  } else {
    await r.write("当前还没有准备好这样的回复道具");
  }
  await r.write("</span></td>\r\n<td class=\"skilldesc_right b3\">\r\n</td>");
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_MID2"), s));
  if (r.truth((!r.truth(r.get(s, "___TEMP_THIS_SKILL_ACQUIRED"))))) {
    await r.write("<span class=\"yellow b\">\r\n</span>");
  }
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_END"), s));
return 1;
}
