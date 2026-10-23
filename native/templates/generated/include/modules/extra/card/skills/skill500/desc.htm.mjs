// Generated from include/modules/extra/card/skills/skill500/desc.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  r.imports(s, "skill500", "sys", "bufficons");
  r.assign(r.slot(s, ["___TEMP_SKILL_ID"]), 500);
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_START"), s));
  await r.write("<span>\r\n时停\r\n</span>");
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_MID1"), s));
  await r.write("<td class=\"skilldesc_left b3\"><span class=\"skilldesc\">\r\n<span class=\"ltpurple b\">时间能力</span> ");
  r.assign(r.slot(s, ["st"]), (await r.module("bufficons", "bufficons_check_buff_state", 500, r.get(s, "who"))));
  r.assign(r.slot(s, ["rm"]), r.subtract(r.get(s, "tmp_totsec"), r.get(s, "tmp_nowsec")));
  await r.write("消耗<span class=\"yellow b\">");
  await r.write(r.text(r.get(s, "skill500_rage")));
  await r.write("</span>怒气，让所有NPC和当前地图其他玩家<span class=\"cyan b\">时间停止");
  await r.write(r.text(r.get(s, "skill500_act_time")));
  await r.write("秒</span>。<br>\r\n在时间停止中，你不会遭遇任何陷阱，命中率变为原来的<span class=\"yellow b\">150%</span>，不会被其他角色发现、先制、反击，但对同样拥有时间能力的角色无效。<br>\r\nCD时间<span class=\"yellow b\">");
  await r.write(r.text(r.get(s, "skill500_cd")));
  await r.write("秒</span>");
  if (r.truth(r.equal(1, r.get(s, "st")))) {
    await r.write("<br><span class=\"cyan b\">时间停止中！</span>");
  } else {
    if (r.truth(r.equal(2, r.get(s, "st")))) {
      await r.write("<br><span class=\"yellow b\">技能冷却中，冷却时间还剩");
      await r.write(r.text(r.get(s, "rm")));
      await r.write("秒。</span>");
    } else {
      if (r.truth(r.equal(3, r.get(s, "st")))) {
        await r.write("<br><span class=\"cyan b\">技能冷却完毕，可以使用。</span>");
      }
    }
  }
  await r.write("</span></td>\r\n<td class=\"skilldesc_right b3\">");
  if (r.truth(r.equal(3, r.get(s, "st")))) {
    await r.write("<input type=\"button\" style=\"width:46px\" onclick=\"$('mode').value='special';$('command').value='skill500_special';$('subcmd').value='activate';postCmd('gamecmd','command.php',this);\" value=\"发动\">");
  } else {
    await r.write("<input type=\"button\" style=\"width:46px\" disabled=\"true\" value=\"发动\">");
  }
  await r.write("</td>");
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_MID2"), s));
  if (r.truth((!r.truth(r.get(s, "___TEMP_THIS_SKILL_ACQUIRED"))))) {
    await r.write("<span class=\"yellow b\">\r\n</span>");
  }
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_END"), s));
return 1;
}
