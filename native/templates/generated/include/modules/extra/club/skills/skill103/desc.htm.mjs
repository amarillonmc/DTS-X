// Generated from include/modules/extra/club/skills/skill103/desc.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  r.assign(r.slot(s, ["___TEMP_SKILL_ID"]), 103);
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_START"), s));
  await r.write("<span>\r");
  await r.write(r.text(r.get(r.get(s, "clubskillname"), r.get(s, "___TEMP_SKILL_ID"))));
  await r.write("</span>");
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_MID1"), s));
  await r.write("<td class=\"skilldesc_left b3\"><span class=\"skilldesc\">\r\n你可以在身体里嵌入一把武器，并可以更换该武器，<br>但更换时原先嵌入的武器会消失。<br>你的基础攻击力上升嵌入武器的<span class=\"yellow b\">35%</span>，<br>且在战斗中视为具有嵌入武器的全部属性（对部分属性无效）<br>");
  r.assign(r.slot(s, ["soulwep"]), (await r.module("skillbase", "skill_getvalue", 103, "soulwep")));
  if (r.truth((!r.truth(r.get(s, "soulwep"))))) {
    await r.write("<span class=\"cyan b\">当前未嵌入武器</span>");
  } else {
    r.assign(r.slot(s, ["soulwep_arr"]), (await r.module("skill103", "skill103_decode_itmarr", r.get(s, "soulwep"))));
    r.assign(r.slot(s, ["soulwep_txt"]), (await r.module("itemmix", "parse_itemmix_resultshow", r.get(s, "soulwep_arr"))));
    await r.write("当前嵌入的武器为：<br><span class=\"yellow b\">");
    await r.write(r.text(r.get(s, "soulwep_txt")));
    await r.write("</span>");
  }
  await r.write("</span></td>\r\n<td class=\"skilldesc_right b3\">\r\n</td>");
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_MID2"), s));
  if (r.truth((!r.truth(r.get(s, "___TEMP_THIS_SKILL_ACQUIRED"))))) {
    await r.write("<span class=\"yellow b\">\r\n20级时解锁\r\n</span>");
  }
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_END"), s));
return 1;
}
