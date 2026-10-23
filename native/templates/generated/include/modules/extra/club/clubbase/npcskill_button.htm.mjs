// Generated from include/modules/extra/club/clubbase/npcskill_button.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  if (r.truth(((r.get(r.get(s, "tdata"), "showskill") != null)))) {
    await r.write("<td class=\"b2\" height=\"20px\">特殊技能</td>\r\n<td class=\"b3\" height=\"20px\">\r\n<input type=\"button\" class=\"cmdbutton\" style=\"width:125px\"  value=\"查看NPC技能\" onclick=\"bubblebox_show('npcskill');\">\r\n</td>");
  } else {
    await r.write("<td class=\"b8\"></td><td class=\"b8\"></td>");
  }
return 1;
}
