// Generated from include/modules/extra/instance/instance12_dream/skill981/desc.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  r.assign(r.slot(s, ["___TEMP_SKILL_ID"]), 981);
  r.assign(r.slot(s, ["stage"]), r.int((await r.module("skillbase", "skill_getvalue", 981, "stage", r.get(s, "who")))));
  r.assign(r.slot(s, ["rm"]), r.int((await r.module("skillbase", "skill_getvalue", 981, "rm", r.get(s, "who")))));
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_START"), s));
  await r.write("<span>\r");
  await r.write(r.text(r.get(r.get(s, "clubskillname"), r.get(s, "___TEMP_SKILL_ID"))));
  await r.write("</span>");
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_MID1"), s));
  await r.write("<td class=\"skilldesc_left b3\"><span class=\"skilldesc\">");
  if (r.truth((r.compare(r.get(s, "stage"), 0) > 0))) {
    if (r.truth((r.compare(r.get(s, "rm"), 0) > 0))) {
      await r.write("正在挑战第<span class=\"yellow b\">");
      await r.write(r.text(r.get(s, "stage")));
      await r.write("</span>波次，剩余敌人<span class=\"yellow b\">");
      await r.write(r.text(r.get(s, "rm")));
      await r.write("</span>名。");
    } else {
      await r.write("已完成第<span class=\"yellow b\">");
      await r.write(r.text(r.get(s, "stage")));
      await r.write("</span>波次挑战。");
    }
  } else {
    await r.write("<span class=\"yellow b\">尚未开始挑战。</span>");
  }
  await r.write("</span></td>\r\n<td class=\"skilldesc_right b3\">");
  if (r.truth(r.equal(r.get(s, "rm"), 0))) {
    await r.write("<input type=\"button\" class=\"cmdbutton\" id=\"sp_castsk981\" value=\"");
    await r.write(r.text((r.truth((r.compare(r.get(s, "stage"), 0) > 0)) ? "下一波次" : "开始挑战")));
    await r.write("\" onclick=\"$('mode').value='special';$('command').value='skill981_special';postCmd('gamecmd','command.php');this.disabled=true;\">");
  }
  await r.write("</td>");
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_MID2"), s));
  if (r.truth((!r.truth(r.get(s, "___TEMP_THIS_SKILL_ACQUIRED"))))) {
    await r.write("<span class=\"yellow b\">\r\n</span>");
  }
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_END"), s));
return 1;
}
