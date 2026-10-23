// Generated from include/modules/extra/card/skills/skill527/desc.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  r.assign(r.slot(s, ["rmt"]), (await r.module("skill527", "get_remaintime527", r.get(s, "who"))));
  r.assign(r.slot(s, ["___TEMP_SKILL_ID"]), 527);
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_START"), s));
  await r.write("<span>\r\n攻击\r\n</span>");
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_MID1"), s));
  await r.write("<td class=\"skilldesc_left b3\"><span class=\"skilldesc\">\r\n<span class=\"yellow b\">战斗技</span>：");
  if (r.truth((r.compare(r.get(s, "rmt"), 0) > 0))) {
    await r.write("你的攻击性有待提高。<br>在攻击结束时让你的基础攻击力永久翻倍，本局还能发动<span class=\"yellow b\">");
    await r.write(r.text(r.get(s, "rmt")));
    await r.write("</span>次。");
  } else {
    await r.write("<span class=\"red b\">你的攻击性已经无法再提高了。</span>");
  }
  await r.write("</span>\r\n</td>\r\n<td class=\"skilldesc_right b3\">\r\n</td>");
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_MID2"), s));
  if (r.truth((!r.truth(r.get(s, "___TEMP_THIS_SKILL_ACQUIRED"))))) {
    await r.write("<span class=\"yellow b\">\r\n</span>");
  }
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_END"), s));
return 1;
}
