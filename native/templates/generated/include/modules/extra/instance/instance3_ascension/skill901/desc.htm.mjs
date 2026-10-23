// Generated from include/modules/extra/instance/instance3_ascension/skill901/desc.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  r.assign(r.slot(s, ["___TEMP_SKILL_ID"]), 901);
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_START"), s));
  await r.write("<span>\r");
  await r.write(r.text(r.get(r.get(s, "clubskillname"), r.get(s, "___TEMP_SKILL_ID"))));
  await r.write("</span>");
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_MID1"), s));
  await r.write("<td class=\"skilldesc_left b3\"><span class=\"skilldesc\">");
  r.assign(r.slot(s, ["skill901_lvl"]), r.int((await r.module("skillbase", "skill_getvalue", 901, "lvl", r.get(s, "who")))));
  if (r.truth((r.compare(r.get(s, "skill901_lvl"), 1) >= 0))) {
    await r.write("等级上限<span class=\"yellow b\">-100</span>");
    if (r.truth((r.compare(r.get(s, "skill901_lvl"), 2) >= 0))) {
      await r.write("，购买物品价格<span class=\"yellow b\">+25%</span>");
      if (r.truth((r.compare(r.get(s, "skill901_lvl"), 3) >= 0))) {
        await r.write("，<br>开局欠债<span class=\"yellow b\">1000</span>元");
        if (r.truth((r.compare(r.get(s, "skill901_lvl"), 4) >= 0))) {
          await r.write("，开局<span class=\"yellow b\">5</span>分钟内攻击无法获得熟练度");
          if (r.truth((r.compare(r.get(s, "skill901_lvl"), 5) >= 0))) {
            await r.write("，<br>无法装备身体防具");
          }
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
