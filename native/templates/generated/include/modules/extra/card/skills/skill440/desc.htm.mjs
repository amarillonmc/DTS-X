// Generated from include/modules/extra/card/skills/skill440/desc.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  r.imports(s, "skill440", "sys", "bufficons");
  r.assign(r.slot(s, ["___TEMP_SKILL_ID"]), 440);
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_START"), s));
  await r.write("<span>\r\n父爱\r\n</span>");
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_MID1"), s));
  await r.write("<td class=\"skilldesc_left b3\"><span class=\"skilldesc\">");
  r.assign(r.slot(s, ["st"]), (await r.module("bufficons", "bufficons_check_buff_state", 440, r.get(s, "who"))));
  r.assign(r.slot(s, ["rm"]), r.subtract(r.get(s, "tmp_totsec"), r.get(s, "tmp_nowsec")));
  await r.write("<span class=\"yellow b\">战斗技</span>&nbsp;&nbsp;本次战斗中敌方玩家所有技能无效，并使敌人<span class=\"red b\">烧伤</span><span class=\"purple b\">中毒</span>，且<span class=\"yellow b\">40</span>秒内无法解除异常状态，技能冷却时间<span class=\"cyan b\">");
  await r.write(r.text(r.get(s, "skill440_cd")));
  await r.write("</span>秒<br>");
  if (r.truth(r.equal(2, r.get(s, "st")))) {
    await r.write("<span class=\"cyan b\">技能冷却中，冷却时间还剩<span>");
    await r.write(r.text(r.get(s, "rm")));
    await r.write("</span>秒。</span><br>");
  } else {
    if (r.truth(r.equal(3, r.get(s, "st")))) {
      await r.write("<span class=\"yellow b\">技能已经就绪，可以发动<span>");
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
