// Generated from include/modules/extra/card/skills/skill498/desc.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  r.assign(r.slot(s, ["___TEMP_SKILL_ID"]), 498);
  r.assign(r.slot(s, ["skill498var"]), r.int((await r.module("skillbase", "skill_getvalue", 498, "fv", r.get(s, "who")))));
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_START"), s));
  await r.write("<span>\r\n朋友\r\n</span>");
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_MID1"), s));
  await r.write("<td class=\"skilldesc_left b3\"><span class=\"skilldesc\">\r\n每次所在地区有人唱《ぼくのフレンド》，增加1点「朋友计数」，<br>之后全系熟练增加当前「朋友计数」的数值<br>\r\n当朋友计数达到11点时，失去本技能，获得110s的无敌技能「决然」<br>\r\n你当前的「朋友计数」为<span class=\"cyan b\">");
  await r.write(r.text(r.get(s, "skill498var")));
  await r.write("</span>点\r\n</span></td>\r\n<td class=\"skilldesc_right b3\">\r\n</td>");
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_MID2"), s));
  if (r.truth((!r.truth(r.get(s, "___TEMP_THIS_SKILL_ACQUIRED"))))) {
    await r.write("<span>\r\n</span>");
  }
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_END"), s));
return 1;
}
