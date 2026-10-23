// Generated from include/modules/extra/card/skills/skill719/desc.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  r.assign(r.slot(s, ["___TEMP_SKILL_ID"]), 719);
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_START"), s));
  await r.write("<span>\r");
  await r.write(r.text(r.get(r.get(s, "clubskillname"), r.get(s, "___TEMP_SKILL_ID"))));
  await r.write("</span>");
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_MID1"), s));
  await r.write("<td class=\"skilldesc_left b3\"><span class=\"skilldesc\">");
  r.assign(r.slot(s, ["skill719_count"]), r.int((await r.module("skillbase", "skill_getvalue", 719, "acount"))));
  r.assign(r.slot(s, ["skill719_release"]), (await r.module("skillbase", "skill_getvalue", 719, "release")));
  if (r.truth((!r.truth(r.get(s, "skill719_release"))))) {
    await r.write("每次发动先制率<span class=\"yellow b\">-1.5%</span>，命中率、闪避率、发现率、造成伤害<span class=\"yellow b\">-5%</span><br>若上一次发动后战斗击杀了<span class=\"yellow b\">15</span>个敌人，则将所有减益变为等量的增益，<br>然后不再能发动此技能<br>");
  }
  if (r.truth((r.compare(r.get(s, "skill719_count"), 0) > 0))) {
    r.assign(r.slot(s, ["val1"]), r.multiply(1.5, r.get(s, "skill719_count")));
    r.assign(r.slot(s, ["val2"]), r.multiply(5, r.get(s, "skill719_count")));
    if (r.truth((!r.truth(r.get(s, "skill719_release"))))) {
      r.assign(r.slot(s, ["knum"]), r.subtract(r.add(r.get(s, "killnum"), r.get(s, "npckillnum")), r.int((await r.module("skillbase", "skill_getvalue", 719, "lastkillnum")))));
      await r.write("当前先制率<span class=\"yellow b\">-");
      await r.write(r.text(r.get(s, "val1")));
      await r.write("%</span>，命中率、闪避率、发现率、造成伤害<span class=\"yellow b\">-");
      await r.write(r.text(r.get(s, "val2")));
      await r.write("%</span><br>\r\n上一次发动后击杀了<span class=\"yellow b\">");
      await r.write(r.text(r.get(s, "knum")));
      await r.write("</span>个敌人");
    } else {
      await r.write("先制率<span class=\"yellow b\">+");
      await r.write(r.text(r.get(s, "val1")));
      await r.write("%</span>，命中率、闪避率、发现率、造成伤害<span class=\"yellow b\">+");
      await r.write(r.text(r.get(s, "val2")));
      await r.write("%</span>");
    }
  }
  await r.write("</span></td>\r\n<td class=\"skilldesc_right b3\">");
  if (r.truth((!r.truth(r.get(s, "skill719_release"))))) {
    await r.write("<input type=\"button\" style=\"width:46px\" onclick=\"$('mode').value='special';$('command').value='skill719_special';$('subcmd').value='upgrade';postCmd('gamecmd','command.php');this.disabled=true;\" value=\"发动\">");
  }
  await r.write("</td>");
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_MID2"), s));
  if (r.truth((!r.truth(r.get(s, "___TEMP_THIS_SKILL_ACQUIRED"))))) {
    await r.write("<span class=\"yellow b\">\r\n</span>");
  }
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_END"), s));
return 1;
}
