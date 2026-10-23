// Generated from include/modules/extra/club/skills/skill95/desc.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  r.assign(r.slot(s, ["___TEMP_SKILL_ID"]), 95);
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_START"), s));
  await r.write("<span>\r");
  await r.write(r.text(r.get(r.get(s, "clubskillname"), r.get(s, "___TEMP_SKILL_ID"))));
  await r.write("</span>");
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_MID1"), s));
  await r.write("<td class=\"skilldesc_left b3\"><span class=\"skilldesc\">");
  r.assign(r.slot(s, ["spid"]), r.int((await r.module("skillbase", "skill_getvalue", 95, "spid", r.get(s, "who")))));
  if (r.truth((!r.truth((!r.truth(r.get(s, "spid"))))))) {
    r.assign(r.slot(s, ["sname"]), r.get((await r.module("player", "fetch_playerdata_by_pid", r.get(s, "spid"))), "name"));
    if (r.truth((r.compare(r.get(r.get(s, "who"), "type"), 0) > 0))) {
      await r.write("生命值低于<span class=\"yellow b\">");
      await r.write(r.text(r.get(s, "sname")));
      await r.write("</span>的生命值的<span class=\"yellow b\">3</span>倍时对其先制率为<span class=\"yellow b\">0</span>，<br>攻击<span class=\"yellow b\">");
      await r.write(r.text(r.get(s, "sname")));
      await r.write("</span>外的其他角色时最终伤害<span class=\"yellow b\">+40%</span>，<br>受到<span class=\"yellow b\">");
      await r.write(r.text(r.get(s, "sname")));
      await r.write("</span>外的其他角色攻击时最终伤害<span class=\"yellow b\">-20%</span>");
    } else {
      await r.write("对<span class=\"yellow b\">");
      await r.write(r.text(r.get(s, "sname")));
      await r.write("</span>先制率<span class=\"yellow b\">-30%</span>");
    }
  }
  await r.write("</span></td>\r\n<td class=\"skilldesc_right b3\">\r\n</td>");
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_MID2"), s));
  if (r.truth((!r.truth(r.get(s, "___TEMP_THIS_SKILL_ACQUIRED"))))) {
    await r.write("<span class=\"yellow b\">\r\n</span>");
  }
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_END"), s));
return 1;
}
