// Generated from include/modules/extra/card/skills/skill439/desc.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  r.imports(s, "skill439", "itemmain");
  r.assign(r.slot(s, ["___TEMP_SKILL_ID"]), 439);
  r.assign(r.slot(s, ["ctype"]), (await r.module("skillbase", "skill_getvalue", 439, "type", r.get(s, "who"))));
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_START"), s));
  await r.write("<span>\r\n面子\r\n</span>");
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_MID1"), s));
  await r.write("<td class=\"skilldesc_left b3\"><span class=\"skilldesc\">\r\n被同种武器第二次攻击时最终伤害<span class=\"yellow b\">-75%</span>，但不能被连续触发。<br>");
  if (r.truth((!r.equal(r.get(s, "ctype"), "X")))) {
    await r.write("当前生效武器系别：<span class=\"cyan b\">");
    await r.write(r.text(r.get(r.get(s, "iteminfo"), (r.text("W") + r.text(r.get(s, "ctype"))))));
    await r.write("</span>");
  } else {
    await r.write("<span class=\"red b\">当前未生效</span>");
  }
  await r.write("</span></td>\r\n<td class=\"skilldesc_right b3\">\r\n</td>");
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_MID2"), s));
  if (r.truth((!r.truth(r.get(s, "___TEMP_THIS_SKILL_ACQUIRED"))))) {
    await r.write("<span class=\"yellow b\">\r\n</span>");
  }
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_END"), s));
return 1;
}
