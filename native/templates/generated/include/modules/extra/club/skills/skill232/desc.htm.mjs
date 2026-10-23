// Generated from include/modules/extra/club/skills/skill232/desc.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  r.imports(s, "skill232", "sys", "bufficons");
  r.assign(r.slot(s, ["___TEMP_SKILL_ID"]), 232);
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_START"), s));
  await r.write("<span>\r\n力场\r\n</span>");
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_MID1"), s));
  await r.write("<td class=\"skilldesc_left b3\"><span class=\"skilldesc\">");
  r.assign(r.slot(s, ["clv"]), r.int((await r.module("skillbase", "skill_getvalue", 232, "lvl"))));
  r.assign(r.slot(s, ["totlv"]), r.subtract((await r.call("count", r.get(s, "upgradecost"))), 1));
  r.assign(r.slot(s, ["st"]), (await r.module("bufficons", "bufficons_check_buff_state", 232, r.get(s, "who"))));
  r.assign(r.slot(s, ["rm"]), r.subtract(r.get(s, "tmp_totsec"), r.get(s, "tmp_nowsec")));
  await r.write("<span class=\"lime b\">当前级别");
  await r.write(r.text(r.get(s, "clv")));
  await r.write("/");
  await r.write(r.text(r.get(s, "totlv")));
  await r.write("</span>&nbsp;");
  if (r.truth((!r.identical(r.get(r.get(s, "upgradecost"), r.get(s, "clv")), (-r.number(1)))))) {
    await r.write("消耗<span class=\"lime b\">");
    await r.write(r.text(r.get(r.get(s, "upgradecost"), r.get(s, "clv"))));
    await r.write("</span>点技能点升至下一级");
  }
  await r.write("<br>\r\n立即恢复满生命值并使额外生命值增加至<span class=\"yellow b\">");
  await r.write(r.text(r.get(r.get(s, "shieldgain"), r.get(s, "clv"))));
  await r.write("</span>点，冷却时间<span class=\"cyan b\">");
  await r.write(r.text(r.get(r.get(s, "skill232_cd"), r.get(s, "clv"))));
  await r.write("</span>秒。<br>\r\n若你有额外生命值，你受到的战斗伤害减少<span class=\"yellow b\">");
  await r.write(r.text(r.get(r.get(s, "shieldeff"), r.get(s, "clv"))));
  await r.write("</span>点，且不受反噬伤害。<br>\r\n升级可以强化效果和缩短下一次发动的冷却时间。<br>");
  if (r.truth(r.equal(2, r.get(s, "st")))) {
    await r.write("<span class=\"yellow b\">技能冷却中，冷却时间还剩<span>");
    await r.write(r.text(r.get(s, "rm")));
    await r.write("</span>秒。</span><br>");
  } else {
    if (r.truth(r.equal(3, r.get(s, "st")))) {
      await r.write("<span class=\"cyan b\">技能冷却完毕，可以使用</span><br>");
    }
  }
  await r.write("</span></td>\r\n<td class=\"skilldesc_right b3\">");
  if (r.truth((!r.identical(r.get(r.get(s, "upgradecost"), r.get(s, "clv")), (-r.number(1)))))) {
    if (r.truth((r.compare(r.get(s, "skillpoint"), r.get(r.get(s, "upgradecost"), r.get(s, "clv"))) >= 0))) {
      await r.write("<input type=\"button\" style=\"width:46px\" onclick=\"$('mode').value='special';$('command').value='skill232_special';$('subcmd').value='upgrade';postCmd('gamecmd','command.php');this.disabled=true;\" value=\"升级\">");
    } else {
      await r.write("<input type=\"button\" style=\"width:46px\" disabled=\"true\" value=\"升级\">");
    }
  }
  await r.write("</td>");
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_MID2"), s));
  if (r.truth((!r.truth(r.get(s, "___TEMP_THIS_SKILL_ACQUIRED"))))) {
    await r.write("<span class=\"yellow b\">\r\n5级时解锁\r\n</span>");
  }
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_END"), s));
return 1;
}
