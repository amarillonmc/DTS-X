// Generated from include/modules/extra/card/skills/skill420/desc.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  r.imports(s, "skill420", "sys", "bufficons");
  r.assign(r.slot(s, ["___TEMP_SKILL_ID"]), 420);
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_START"), s));
  await r.write("<span>\r\n结晶\r\n</span>");
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_MID1"), s));
  await r.write("<td class=\"skilldesc_left b3\"><span class=\"skilldesc\">");
  r.assign(r.slot(s, ["st"]), (await r.module("bufficons", "bufficons_check_buff_state", 420, r.get(s, "who"))));
  r.assign(r.slot(s, ["rm"]), r.subtract(r.get(s, "tmp_totsec"), r.get(s, "tmp_nowsec")));
  await r.write("消耗<span class=\"lime b\">1</span>个技能点，随机获得一个基本方块。<br>");
  if (r.truth((r.truth(r.get(s, "st")) && r.truth((r.compare(r.get(s, "st"), 2) <= 0))))) {
    await r.write("<span class=\"cyan b\">技能冷却中，冷却时间还剩<span>");
    await r.write(r.text(r.get(s, "rm")));
    await r.write("</span>秒。</span><br>");
  }
  await r.write("</span></td>\r\n<td class=\"skilldesc_right b3\">\r\n</td>");
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_MID2"), s));
  if (r.truth((!r.truth(r.get(s, "___TEMP_THIS_SKILL_ACQUIRED"))))) {
    await r.write("<span class=\"yellow b\">\r\n</span>");
  }
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_END"), s));
return 1;
}
