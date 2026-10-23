// Generated from include/modules/extra/instance/instance3_ascension/skill902/desc.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  r.assign(r.slot(s, ["___TEMP_SKILL_ID"]), 902);
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_START"), s));
  await r.write("<span>\r");
  await r.write(r.text(r.get(r.get(s, "clubskillname"), r.get(s, "___TEMP_SKILL_ID"))));
  await r.write("</span>");
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_MID1"), s));
  await r.write("<td class=\"skilldesc_left b3\"><span class=\"skilldesc\">");
  r.assign(r.slot(s, ["skill902_lvl"]), r.int((await r.module("skillbase", "skill_getvalue", 902, "lvl", r.get(s, "who")))));
  if (r.truth((r.compare(r.get(s, "skill902_lvl"), 1) >= 0))) {
    await r.write("全息幻象受到伤害<span class=\"yellow b\">-15%</span>");
    if (r.truth((r.compare(r.get(s, "skill902_lvl"), 2) >= 0))) {
      await r.write("<br>杏仁豆腐、黑幕、真职人、电波幽灵受到伤害<span class=\"yellow b\">-15%</span>");
      if (r.truth((r.compare(r.get(s, "skill902_lvl"), 3) >= 0))) {
        await r.write("<br>数据碎片NPC造成伤害<span class=\"yellow b\">+25%</span>");
        if (r.truth((r.compare(r.get(s, "skill902_lvl"), 4) >= 0))) {
          await r.write("<br>剧情BOSS和英灵殿NPC造成伤害<span class=\"yellow b\">+25%</span>");
        }
      }
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
