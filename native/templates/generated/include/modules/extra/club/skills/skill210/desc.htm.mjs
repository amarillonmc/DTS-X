// Generated from include/modules/extra/club/skills/skill210/desc.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  r.imports(s, "skill210", "sys", "bufficons");
  r.assign(r.slot(s, ["___TEMP_SKILL_ID"]), 210);
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_START"), s));
  await r.write("<span>\r\n歼灭\r\n</span>");
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_MID1"), s));
  await r.write("<td class=\"skilldesc_left b3\"><span class=\"skilldesc\">");
  r.assign(r.slot(s, ["st"]), (await r.module("bufficons", "bufficons_check_buff_state", 210, r.get(s, "who"))));
  r.assign(r.slot(s, ["rm"]), r.subtract(r.get(s, "tmp_totsec"), r.get(s, "tmp_nowsec")));
  await r.write("发动后获得增益效果：<br>");
  if (r.truth(r.equal(r.get(s, "card"), 5))) {
    if (r.truth(r.equal(r.get(s, "club"), 2))) {
      await r.write("你持斩系武器时，你的攻击有<span class=\"yellow b\">40%</span>概率造成<span class=\"red b\">200%</span>最终伤害；<br>");
    } else {
      await r.write("你持斩系武器时，你的攻击有<span class=\"yellow b\">40%</span>概率造成<span class=\"red b\">200%</span>物理伤害；<br>");
    }
  } else {
    if (r.truth(r.equal(r.get(s, "club"), 2))) {
      await r.write("你持斩系武器时，你的攻击有<span class=\"yellow b\">20%</span>概率造成<span class=\"red b\">200%</span>最终伤害；<br>");
    } else {
      await r.write("你持斩系武器时，你的攻击有<span class=\"yellow b\">20%</span>概率造成<span class=\"red b\">200%</span>物理伤害；<br>");
    }
  }
  if (r.truth((!r.equal(r.get(s, "club"), 2)))) {
    await r.write("计算属性伤害时你基础攻击力的1/2将视作武器攻击力。");
  } else {
    await r.write("计算属性伤害时你的基础攻击力将视作武器攻击力。");
  }
  await r.write("<br>\r\n增益效果持续时间<span class=\"yellow b\">");
  await r.write(r.text(r.get(s, "skill210_act_time")));
  await r.write("</span>秒，冷却时间<span class=\"cyan b\">");
  await r.write(r.text(r.get(s, "skill210_cd")));
  await r.write("</span>秒。<br>");
  if (r.truth(r.equal(1, r.get(s, "st")))) {
    await r.write("<span class=\"yellow b\">技能发动中！持续时间还剩<span>");
    await r.write(r.text(r.get(s, "rm")));
    await r.write("</span>秒</span>");
  } else {
    if (r.truth(r.equal(2, r.get(s, "st")))) {
      await r.write("<span class=\"cyan b\">技能冷却中，冷却时间还剩<span>");
      await r.write(r.text(r.get(s, "rm")));
      await r.write("</span>秒</span>");
    } else {
      if (r.truth(r.equal(3, r.get(s, "st")))) {
        await r.write("<span class=\"cyan b\">技能冷却完毕，可以使用</span>");
      }
    }
  }
  await r.write("</span></td>\r\n<td class=\"skilldesc_right b3\">");
  if (r.truth(r.equal(3, r.get(s, "st")))) {
    await r.write("<input type=\"button\" style=\"width:46px\" onclick=\"$('mode').value='special';$('command').value='skill210_special';$('subcmd').value='activate';postCmd('gamecmd','command.php',this);\" value=\"发动\">");
  } else {
    await r.write("<input type=\"button\" style=\"width:46px\" disabled=\"true\" value=\"发动\">");
  }
  await r.write("</td>");
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_MID2"), s));
  if (r.truth((!r.truth(r.get(s, "___TEMP_THIS_SKILL_ACQUIRED"))))) {
    await r.write("<span class=\"yellow b\">\r\n21级时解锁\r\n</span>");
  }
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_END"), s));
return 1;
}
