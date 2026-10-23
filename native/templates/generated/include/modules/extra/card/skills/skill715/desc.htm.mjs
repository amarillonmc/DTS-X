// Generated from include/modules/extra/card/skills/skill715/desc.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  r.imports(s, "skill715", "sys");
  r.assign(r.slot(s, ["___TEMP_SKILL_ID"]), 715);
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_START"), s));
  await r.write("<span>\r");
  await r.write(r.text(r.get(r.get(s, "clubskillname"), r.get(s, "___TEMP_SKILL_ID"))));
  await r.write("</span>");
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_MID1"), s));
  await r.write("<td class=\"skilldesc_left b3\"><span class=\"skilldesc\">\r\n无法行动，达到<span class=\"yellow b\">");
  await r.write(r.text(r.get(s, "skill715_act_time")));
  await r.write("</span>秒或受到其他人的攻击时解除。<br>解除后的第一次探索必定发现一件特定的腿部外甲防具。<br>");
  r.assign(r.slot(s, ["skill715_rm"]), r.subtract((await r.module("skillbase", "skill_getvalue", 715, "expire")), r.get(s, "now")));
  if (r.truth((r.compare(r.get(s, "skill715_rm"), 0) > 0))) {
    await r.write("<span class=\"yellow b\">技能生效时间还剩<span>");
    await r.write(r.text(r.get(s, "skill715_rm")));
    await r.write("</span>秒。</span><br>");
  } else {
    await r.write("<span class=\"yellow b\">技能生效时间已经结束。</span><br>");
  }
  await r.write("</span></td>\r\n<td class=\"skilldesc_right b3\">\r\n</td>");
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_MID2"), s));
  if (r.truth((!r.truth(r.get(s, "___TEMP_THIS_SKILL_ACQUIRED"))))) {
    await r.write("<span class=\"yellow b\">\r\n</span>");
  }
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_END"), s));
return 1;
}
