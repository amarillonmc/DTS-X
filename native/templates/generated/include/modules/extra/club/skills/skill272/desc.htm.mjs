// Generated from include/modules/extra/club/skills/skill272/desc.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  r.imports(s, "sys", "skill272", "itemmain", "bufficons");
  r.assign(r.slot(s, ["___TEMP_SKILL_ID"]), 272);
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_START"), s));
  await r.write("<span>\r\n吸光\r\n</span>");
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_MID1"), s));
  await r.write("<td class=\"skilldesc_left b3\"><span class=\"skilldesc\">");
  r.assign(r.slot(s, ["clv"]), r.int((await r.module("skillbase", "skill_getvalue", 272, "lvl"))));
  r.assign(r.slot(s, ["st"]), (await r.module("bufficons", "bufficons_check_buff_state", 272, r.get(s, "who"))));
  r.assign(r.slot(s, ["rm"]), r.subtract(r.get(s, "tmp_totsec"), r.get(s, "tmp_nowsec")));
  await r.write("选择1个装备/道具，<span class=\"yellow b\">必须具有以下属性1个以上：</span><br>\r\n<span class=\"grey b\">");
  r.assign(r.slot(s, ["i"]), 1);
  if (r.truth((await r.call("is_array", (await r.module("skill272", "create_effect_list272")))))) {
    {
      const a0 = r.copy((await r.module("skill272", "create_effect_list272")));
      for (const [k0, v0] of r.entries(a0)) {
        r.assign(r.slot(s, ["skval"]), v0);
        await r.write(r.text(r.get(r.get(s, "itemspkinfo"), r.get(s, "skval"))));
        await r.write(" ");
        r.post(r.slot(s, ["i"]), 1);
        if (r.truth(r.equal(r.modulo(r.get(s, "i"), 10), 0))) {
          await r.write("<br>");
        }
      }
    }
  }
  await r.write("</span>\r\n<br>\r\n你将吸收掉这些属性，对每个吸收属性有<span class=\"yellow b\">30%</span>获得一个对应的方块，<br>且属性伤害增加<span class=\"yellow b\">吸收属性数目×");
  await r.write(r.text(r.get(s, "skill272_factor")));
  await r.write("%</span>，持续<span class=\"cyan b\">");
  await r.write(r.text(r.get(s, "skill272_act_time")));
  await r.write("</span>秒，冷却时间<span class=\"cyan b\">");
  await r.write(r.text(r.get(s, "skill272_cd")));
  await r.write("</span>秒。<br>");
  if (r.truth(r.equal(1, r.get(s, "st")))) {
    r.assign(r.slot(s, ["effect272"]), r.multiply(r.get(s, "skill272_factor"), (await r.module("skillbase", "skill_getvalue", 272, "num", r.get(s, "pa")))));
    await r.write("<span class=\"yellow b\">技能发动中，属性伤害增加");
    await r.write(r.text(r.get(s, "effect272")));
    await r.write("%！持续时间还剩<span>");
    await r.write(r.text(r.get(s, "rm")));
    await r.write("</span>秒</span><br>");
  } else {
    if (r.truth(r.equal(2, r.get(s, "st")))) {
      await r.write("<span class=\"yellow b\">技能冷却时间还剩<span>");
      await r.write(r.text(r.get(s, "rm")));
      await r.write("</span>秒</span><br>");
    } else {
      if (r.truth(r.equal(3, r.get(s, "st")))) {
        await r.write("<span class=\"yellow b\">技能冷却完毕，可以发动</span><br>");
      }
    }
  }
  await r.write("</span></td>\r\n<td class=\"skilldesc_right b3\">");
  if (r.truth(r.equal(3, r.get(s, "st")))) {
    await r.write("<input type=\"button\" style=\"width:46px\" onclick=\"$('mode').value='special';$('command').value='skill272_special';$('subcmd').value='';postCmd('gamecmd','command.php',this);\" value=\"发动\">");
  } else {
    await r.write("<input type=\"button\" style=\"width:46px\" disabled=\"true\" value=\"发动\">");
  }
  await r.write("</td>");
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_MID2"), s));
  if (r.truth((!r.truth(r.get(s, "___TEMP_THIS_SKILL_ACQUIRED"))))) {
    await r.write("<span class=\"yellow b\">\r\n3级时解锁\r\n</span>");
  }
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_END"), s));
return 1;
}
