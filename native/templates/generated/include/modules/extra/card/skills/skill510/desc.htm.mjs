// Generated from include/modules/extra/card/skills/skill510/desc.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  r.assign(r.slot(s, ["___TEMP_SKILL_ID"]), 510);
  r.imports(s, "clubbase");
  r.assign(r.slot(s, ["lvl510"]), (await r.module("skillbase", "skill_getvalue", 510, "lvl", r.get(s, "who"))));
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_START"), s));
  await r.write("<span>\r");
  await r.write(r.text(r.get(r.get(s, "clubskillname"), r.get(s, "___TEMP_SKILL_ID"))));
  await r.write("</span>");
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_MID1"), s));
  await r.write("<td class=\"skilldesc_left b3\"><span class=\"skilldesc\">");
  if (r.truth(r.equal(2, r.get(s, "lvl510")))) {
    await r.write("你的减半防御、抹消和控伤属性不会失效，被贯穿概率变为1/10");
  } else {
    if (r.truth(r.equal(1, r.get(s, "lvl510")))) {
      await r.write("你的减半防御和抹消属性不会失效，控伤失效和被贯穿概率减半");
    }
  }
  if (r.truth((await r.module("skillbase", "skill_query", 507, r.get(s, "who"))))) {
    await r.write("<br>「断罪」触发时会暂时失效");
  }
  await r.write("</span></td>\r\n<td class=\"skilldesc_right b3\">\r\n</td>");
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_MID2"), s));
  if (r.truth((!r.truth(r.get(s, "___TEMP_THIS_SKILL_ACQUIRED"))))) {
    await r.write("<span class=\"red b\">\r\n「断罪」解锁时不可用\r\n</span>");
  }
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_END"), s));
return 1;
}
