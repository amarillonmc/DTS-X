// Generated from include/modules/extra/instance/instance10_rogue/skill960/desc.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  r.imports(s, "skill960", "sys", "clubbase");
  r.assign(r.slot(s, ["___TEMP_SKILL_ID"]), 960);
  r.assign(r.slot(s, ["taskarr"]), (await r.module("skill960", "get_taskarr", r.get(s, "who"))));
  r.assign(r.slot(s, ["taskprog"]), (await r.module("skill960", "get_taskprog", r.get(s, "who"))));
  r.assign(r.slot(s, ["taskcount"]), (await r.call("sizeof", r.get(s, "taskarr"))));
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_START"), s));
  await r.write("<span>\r");
  await r.write(r.text(r.get(r.get(s, "clubskillname"), r.get(s, "___TEMP_SKILL_ID"))));
  await r.write("</span>");
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_MID1"), s));
  await r.write("<td class=\"skilldesc_left b3\"><span class=\"skilldesc\">");
  if (r.truth((await r.call("in_array", r.get(s, "gametype"), r.get(s, "invscore_available_mode"))))) {
    r.assign(r.slot(s, ["invscore"]), r.int((await r.module("skillbase", "skill_getvalue", 960, "invscore", r.get(s, "who")))));
    await r.write("当前的调查度为<span class=\"yellow b\">");
    await r.write(r.text(r.get(s, "invscore")));
    await r.write("</span>点。<br>");
    if (r.truth((await r.call("defined", "MOD_INSTANCE10")))) {
      r.imports(s, "instance10");
      r.assign(r.slot(s, ["stage"]), r.int((await r.module("skillbase", "skill_getvalue", 951, "stage", r.get(s, "who")))));
      r.assign(r.slot(s, ["lvup_invscore"]), r.subtract(r.get(r.get(s, "invscore_lvl"), r.get(s, "stage")), r.get(s, "invscore")));
      if (r.truth((r.compare(r.get(s, "lvup_invscore"), 0) > 0))) {
        await r.write("获得<span class=\"yellow b\">");
        await r.write(r.text(r.get(s, "lvup_invscore")));
        await r.write("</span>点调查度后可前往下一层，<br><span class=\"red b\">但在前往下一层前仅能继续完成精英任务</span>。<br>");
      } else {
        if (r.truth((r.compare(r.get(s, "stage"), 7) < 0))) {
          await r.write("你可以点击“前往下层”开启新的地图，<span class=\"lime b\">同时刷新全部任务</span>。<br>");
        }
      }
    }
  }
  if (r.truth((!r.truth(r.get(s, "taskcount"))))) {
    await r.write("<span class=\"yellow b\">你没有接取任务。</span>");
  } else {
    await r.write("当前接取了<span class=\"yellow b\">");
    await r.write(r.text(r.get(s, "taskcount")));
    await r.write("</span>个任务。");
  }
  await r.write("</span></td>\r\n<td class=\"skilldesc_right b3\">\r\n<input type=\"button\" class=\"cmdbutton\" id=\"sp_castsk960\" value=\"查看任务\" onclick=\"$('mode').value='special';$('command').value='skill960_special';$('subcmd').value='show';postCmd('gamecmd','command.php');this.disabled=true;\">\r\n</td>");
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_MID2"), s));
  if (r.truth((!r.truth(r.get(s, "___TEMP_THIS_SKILL_ACQUIRED"))))) {
    await r.write("<span class=\"yellow b\">\r\n</span>");
  }
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_END"), s));
return 1;
}
