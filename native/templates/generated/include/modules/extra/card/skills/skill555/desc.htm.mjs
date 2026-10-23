// Generated from include/modules/extra/card/skills/skill555/desc.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  r.imports(s, "skill555", "sys", "bufficons");
  r.assign(r.slot(s, ["___TEMP_SKILL_ID"]), 555);
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_START"), s));
  await r.write("<span>\r");
  await r.write(r.text(r.get(r.get(s, "clubskillname"), r.get(s, "___TEMP_SKILL_ID"))));
  await r.write("</span>");
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_MID1"), s));
  await r.write("<td class=\"skilldesc_left b3\"><span class=\"skilldesc\">\r\n发动后，主动探索时不会遇到任何敌人和尸体，效果持续<span class=\"yellow b\">");
  await r.write(r.text(r.get(s, "skill555_act_time")));
  await r.write("</span>秒，<br>\r\n冷却时间<span class=\"cyan b\">");
  await r.write(r.text(r.get(s, "skill555_cd")));
  await r.write("</span>秒。");
  r.assign(r.slot(s, ["st"]), (await r.module("bufficons", "bufficons_check_buff_state", 555, r.get(s, "who"))));
  r.assign(r.slot(s, ["rm"]), r.subtract(r.get(s, "tmp_totsec"), r.get(s, "tmp_nowsec")));
  if (r.truth(r.equal(1, r.get(s, "st")))) {
    await r.write("<br><span class=\"yellow b\">技能发动中！持续时间还剩<span>");
    await r.write(r.text(r.get(s, "rm")));
    await r.write("</span>秒</span>");
  } else {
    if (r.truth(r.equal(2, r.get(s, "st")))) {
      await r.write("<br><span class=\"cyan b\">技能冷却中，冷却时间还剩<span>");
      await r.write(r.text(r.get(s, "rm")));
      await r.write("</span>秒</span>");
    } else {
      if (r.truth(r.equal(3, r.get(s, "st")))) {
        await r.write("<br><span class=\"cyan b\">技能冷却完毕，可以使用</span>");
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
