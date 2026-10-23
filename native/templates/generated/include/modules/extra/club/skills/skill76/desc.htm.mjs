// Generated from include/modules/extra/club/skills/skill76/desc.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  r.imports(s, "skill76", "sys", "bufficons");
  r.assign(r.slot(s, ["___TEMP_SKILL_ID"]), 76);
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_START"), s));
  await r.write("<span>\r\n充能\r\n</span>");
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_MID1"), s));
  await r.write("<td class=\"skilldesc_left b3\"><span class=\"skilldesc\">");
  r.assign(r.slot(s, ["st"]), (await r.module("bufficons", "bufficons_check_buff_state", 76, r.get(s, "who"))));
  r.assign(r.slot(s, ["rm"]), r.subtract(r.get(s, "tmp_totsec"), r.get(s, "tmp_nowsec")));
  r.assign(r.slot(s, ["max_rage"]), r.int((await r.module("player", "get_max_rage"))));
  r.assign(r.slot(s, ["rmt"]), r.int((await r.module("skillbase", "skill_getvalue", 76, "rmt", r.get(s, "who")))));
  await r.write("发动后立即回复怒气至上限（<span class=\"yellow b\">");
  await r.write(r.text(r.get(s, "max_rage")));
  await r.write("</span>点）。<br>\r\n前<span class=\"yellow b\">2</span>次发动没有冷却时间，之后冷却时间<span class=\"cyan b\">");
  await r.write(r.text(r.get(s, "skill76_cd")));
  await r.write("</span>秒<br>");
  if (r.truth(r.equal(2, r.get(s, "st")))) {
    await r.write("    <span class=\"yellow b\">技能冷却中，冷却时间还剩<span>");
    await r.write(r.text(r.get(s, "rm")));
    await r.write("</span>秒。</span><br>");
  } else {
    if (r.truth(r.equal(3, r.get(s, "st")))) {
      await r.write("    <span class=\"cyan b\">\r\n        技能冷却完毕，可以发动。\r\n        ");
      if (r.truth(r.get(s, "rmt"))) {
        await r.write("        无需冷却次数还剩：");
        await r.write(r.text(r.get(s, "rmt")));
        await r.write("次\r\n        ");
      } else {
        await r.write("        发动后需要冷却\r\n        ");
      }
      await r.write("    </span>");
    }
  }
  await r.write("</span></td>\r\n<td class=\"skilldesc_right b3\">");
  if (r.truth(r.equal(3, r.get(s, "st")))) {
    await r.write("    <input type=\"button\" style=\"width:46px\" onclick=\"$('mode').value='special';$('command').value='skill76_special';$('subcmd').value='activate';postCmd('gamecmd','command.php',this);\" value=\"发动\">");
  } else {
    await r.write("    <input type=\"button\" style=\"width:46px\" disabled=\"true\" value=\"发动\">");
  }
  await r.write("</td>");
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_MID2"), s));
  if (r.truth((!r.truth(r.get(s, "___TEMP_THIS_SKILL_ACQUIRED"))))) {
    await r.write("<span class=\"yellow b\">\r\n11级时解锁\r\n</span>");
  }
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_END"), s));
return 1;
}
