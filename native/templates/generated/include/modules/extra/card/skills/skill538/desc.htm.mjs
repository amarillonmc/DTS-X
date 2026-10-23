// Generated from include/modules/extra/card/skills/skill538/desc.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  r.assign(r.slot(s, ["___TEMP_SKILL_ID"]), 538);
  r.assign(r.slot(s, ["dummy"]), r.array([]));
  r.assign(r.slot(s, ["skill538_dmg"]), (await r.module("skill538", "get_skill538_extdmg", r.get(s, "who"), r.get(s, "dummy"), r.get(s, "dummy"))));
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_START"), s));
  await r.write("<span>\r\n仪式\r\n</span>");
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_MID1"), s));
  await r.write("<td class=\"skilldesc_left b3\"><span class=\"skilldesc\">\r\n你每除错1层，战斗中就增加3点物理固定伤害。当前的数值是<span class=\"yellow b\">");
  await r.write(r.text(r.get(s, "skill538_dmg")));
  await r.write("</span>点。\r\n在某些层数能获得额外的除错奖励，但前20层没有金钱和技能点奖励。<br>");
  if (r.truth((!r.truth((!r.truth((await r.module("skillbase", "skill_getvalue", 538, "revive_unlocked", r.get(s, "who"))))))))) {
    if (r.truth((!r.truth((!r.truth((await r.module("skillbase", "skill_getvalue", 538, "revive_activated", r.get(s, "who"))))))))) {
      await r.write("<span class=\"red b\">你已觉醒，但你的残机已经用光了</span>");
    } else {
      await r.write("<span class=\"cyan b\">你已觉醒！现在你可以复活一次！</span>（部分死亡方式无效）");
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
