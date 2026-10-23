// Generated from include/modules/extra/club/skills/skill62/desc.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  r.imports(s, "skill62");
  r.assign(r.slot(s, ["___TEMP_SKILL_ID"]), 62);
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_START"), s));
  await r.write("<span>\r\n腐蚀\r\n</span>");
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_MID1"), s));
  await r.write("<td class=\"skilldesc_left b3\"><span class=\"skilldesc\">");
  r.assign(r.slot(s, ["skill62_cnt"]), r.int((await r.module("skillbase", "skill_getvalue", 62, "t"))));
  r.assign(r.slot(s, ["skill62_used"]), r.subtract(7, r.get(s, "skill62_cnt")));
  r.assign(r.slot(s, ["skill62_dmgr"]), r.multiply(r.get(s, "skill62_used"), 7));
  await r.write("<span class=\"red b\">限定技&nbsp;本局还可发动<span>");
  await r.write(r.text(r.get(s, "skill62_cnt")));
  await r.write("</span>次</span><br>\r\n每次发动提升<span class=\"yellow b\">50</span>点生命上限，但你的战斗伤害输出将永久降低<span class=\"yellow b\">7%</span><br>");
  if (r.truth((r.compare(r.get(s, "skill62_used"), 0) > 0))) {
    await r.write("<span class=\"cyan b\">你已经发动了这个技能<span>");
    await r.write(r.text(r.get(s, "skill62_used")));
    await r.write("</span>次，你的最终伤害输出将降低");
    await r.write(r.text(r.get(s, "skill62_dmgr")));
    await r.write("%</span><br>");
  }
  await r.write("</span></td>\r\n<td class=\"skilldesc_right b3\">");
  if (r.truth((r.compare(r.get(s, "skill62_cnt"), 0) > 0))) {
    await r.write("<input type=\"button\" style=\"width:46px\" onclick=\"$('mode').value='special';$('command').value='skill62_special';$('subcmd').value='upgrade';postCmd('gamecmd','command.php');this.disabled=true;\" value=\"发动\">");
  } else {
    await r.write("<input type=\"button\" style=\"width:46px\" disabled=\"true\" value=\"发动\">");
  }
  await r.write("</td>");
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_MID2"), s));
  if (r.truth((!r.truth(r.get(s, "___TEMP_THIS_SKILL_ACQUIRED"))))) {
    await r.write("<span class=\"yellow b\">\r\n7级时解锁\r\n</span>");
  }
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_END"), s));
return 1;
}
