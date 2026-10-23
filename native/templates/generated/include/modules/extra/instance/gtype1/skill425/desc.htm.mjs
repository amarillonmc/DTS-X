// Generated from include/modules/extra/instance/gtype1/skill425/desc.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  r.imports(s, "skill425", "player", "sys", "bufficons");
  r.assign(r.slot(s, ["___TEMP_SKILL_ID"]), 425);
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_START"), s));
  await r.write("<span>\r\n重载\r\n</span>");
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_MID1"), s));
  await r.write("<td class=\"skilldesc_left b3\"><span class=\"skilldesc\">");
  r.assign(r.slot(s, ["st"]), (await r.module("skill425", "check_skill425_state", r.get(s, "who"))));
  r.assign(r.slot(s, ["rm"]), r.subtract(r.get(s, "tmp_totsec"), r.get(s, "tmp_nowsec")));
  r.assign(r.slot(s, ["skill425_bt"]), r.int((await r.module("skillbase", "skill_getvalue", 425, "bribe_times", r.get(s, "who")))));
  r.assign(r.slot(s, ["skill425_rt"]), (await r.call("max", 0, r.subtract((await r.module("skill425", "get_skill425_max_times")), r.get(s, "skill425_bt")))));
  await r.write("更换除错所需求的物品，冷却时间<span class=\"cyan b\">");
  await r.write(r.text(r.get(s, "skill425_cd")));
  await r.write("</span>秒<br>");
  if (r.truth((r.compare(r.get(s, "st"), 0) > 0))) {
    if (r.truth((!r.equal(3, r.get(s, "st"))))) {
      await r.write("<span class=\"cyan b\">技能冷却中，冷却时间还剩<span>");
      await r.write(r.text(r.get(s, "rm")));
      await r.write("</span>秒。</span><br>");
      if (r.truth(r.equal(1, r.get(s, "st")))) {
        await r.write("<span class=\"yellow b\">你当前金钱不足以贿赂工作人员！</span>");
      } else {
        if (r.truth(r.equal(4, r.get(s, "st")))) {
          await r.write("<span class=\"yellow b\">你的贿赂次数已经耗尽，请提升除错层数！</span>");
        } else {
          await r.write("可花费<span class=\"yellow b\">");
          await r.write(r.text(r.get(s, "skill425_cost")));
          await r.write("</span>元贿赂后台工作人员来无视CD发动技能，<br>当前级别还剩<span class=\"yellow b\">");
          await r.write(r.text(r.get(s, "skill425_rt")));
          await r.write("</span>次机会<br>");
        }
      }
    }
  }
  await r.write("</span></td>\r\n<td class=\"skilldesc_right b3\">");
  if (r.truth(r.equal(3, r.get(s, "st")))) {
    await r.write("<input type=\"button\" style=\"width:46px\" onclick=\"$('mode').value='special';$('command').value='skill425_special';$('subcmd').value='activate';postCmd('gamecmd','command.php',this);\" value=\"发动\">");
  } else {
    if (r.truth(r.equal(2, r.get(s, "st")))) {
      await r.write("<input type=\"button\" style=\"width:46px\" onclick=\"$('mode').value='special';$('command').value='skill425_special';$('subcmd').value='activate';postCmd('gamecmd','command.php',this);\" value=\"花钱\">");
    } else {
      await r.write("<input type=\"button\" style=\"width:46px\" disabled value=\"花钱\">");
    }
  }
  await r.write("</td>");
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_MID2"), s));
  if (r.truth((!r.truth(r.get(s, "___TEMP_THIS_SKILL_ACQUIRED"))))) {
    await r.write("<span class=\"yellow b\">\r\n</span>");
  }
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_END"), s));
return 1;
}
