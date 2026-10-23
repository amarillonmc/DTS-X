// Generated from include/modules/extra/club/skills/skill63/desc.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  r.imports(s, "skill63");
  r.assign(r.slot(s, ["___TEMP_SKILL_ID"]), 63);
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_START"), s));
  await r.write("<span>\r\n噩梦\r\n</span>");
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_MID1"), s));
  await r.write("<td class=\"skilldesc_left b3\"><span class=\"skilldesc\">");
  r.assign(r.slot(s, ["skill63_cnt"]), r.int((await r.module("skillbase", "skill_getvalue", 63, "t"))));
  if (r.truth((r.compare(r.get(s, "skill63_cnt"), 0) > 0))) {
    await r.write("<span class=\"yellow b\">战斗技</span>&nbsp;&nbsp;<span class=\"red b\">限定技&nbsp;本局还可发动<span>");
    await r.write(r.text(r.get(s, "skill63_cnt")));
    await r.write("</span>次</span><br>\r\n本次战斗的敌人对你的造成的伤害将永久降低<span class=\"yellow b\">20%</span><br>");
  } else {
    r.assign(r.slot(s, ["skill63_nm"]), (await r.module("skillbase", "skill_getvalue", 63, "n")));
    await r.write("<span class=\"yellow b\">战斗技</span>&nbsp;&nbsp;<span class=\"red b\">限定技&nbsp;已发动</span><br>\r\n敌人<span class=\"cyan b\">");
    await r.write(r.text(r.get(s, "skill63_nm")));
    await r.write("</span>在战斗中对你造成的伤害将永久减少<span class=\"yellow b\">20%</span><br>");
  }
  await r.write("</span></td>\r\n<td class=\"skilldesc_right b3\">\r\n</td>");
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_MID2"), s));
  if (r.truth((!r.truth(r.get(s, "___TEMP_THIS_SKILL_ACQUIRED"))))) {
    await r.write("<span class=\"yellow b\">\r\n21级时解锁\r\n</span>");
  }
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_END"), s));
return 1;
}
