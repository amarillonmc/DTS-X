// Generated from include/modules/extra/instance/instance10_rogue/skill960/castsk960.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  r.imports(s, "sys", "player", "skill960");
  r.assign(r.slot(s, ["taskarr"]), (await r.module("skill960", "get_taskarr", r.get(s, "sdata"))));
  r.assign(r.slot(s, ["taskprog"]), (await r.module("skill960", "get_taskprog", r.get(s, "sdata"))));
  r.assign(r.slot(s, ["taskcount"]), (await r.call("sizeof", r.get(s, "taskarr"))));
  await r.write("<input type=\"hidden\" name=\"mode\" value=\"special\">\r\n<input type=\"hidden\" id=\"command\" name=\"command\" value=\"skill960_special\">\r\n<input type=\"hidden\" id=\"subcmd\" name=\"subcmd\" value=\"\">\r\n<input type=\"hidden\" id=\"taskid_submit\" name=\"taskid_submit\" value=\"\">");
  if (r.truth((await r.call("in_array", r.get(s, "gametype"), r.get(s, "invscore_available_mode"))))) {
    r.assign(r.slot(s, ["invscore"]), r.int((await r.module("skillbase", "skill_getvalue", 960, "invscore", r.get(s, "sdata")))));
    await r.write("当前的调查度为<span class=\"yellow b\">");
    await r.write(r.text(r.get(s, "invscore")));
    await r.write("</span>点。<br>");
    if (r.truth((await r.call("defined", "MOD_INSTANCE10")))) {
      r.imports(s, "instance10");
      r.assign(r.slot(s, ["stage"]), r.int((await r.module("skillbase", "skill_getvalue", 951, "stage", r.get(s, "sdata")))));
      r.assign(r.slot(s, ["lvup_invscore"]), r.subtract(r.get(r.get(s, "invscore_lvl"), r.get(s, "stage")), r.get(s, "invscore")));
      if (r.truth((r.compare(r.get(s, "lvup_invscore"), 0) > 0))) {
        await r.write("获得<span class=\"yellow b\">");
        await r.write(r.text(r.get(s, "lvup_invscore")));
        await r.write("</span>点调查度后可前往下一层，<span class=\"red b\">但在前往下一层前仅能继续完成精英任务</span>。<br>");
      } else {
        if (r.truth((r.compare(r.get(s, "stage"), 7) < 0))) {
          await r.write("你可以点击“前往下层”开启新的地图，<span class=\"lime b\">同时刷新全部任务</span>。<br>");
        }
      }
    }
    await r.write("<br>");
  }
  if (r.truth((!r.truth(r.get(s, "taskcount"))))) {
    await r.write("<span class=\"yellow b\">你没有接取任务。</span><br><br>");
  } else {
    await r.write("当前接取了<span class=\"yellow b\">");
    await r.write(r.text(r.get(s, "taskcount")));
    await r.write("</span>个任务：<br><br>");
    if (r.truth((await r.call("is_array", r.get(s, "taskarr"))))) {
      {
        const a0 = r.copy(r.get(s, "taskarr"));
        for (const [k0, v0] of r.entries(a0)) {
        r.assign(r.slot(s, ["i"]), k0);
          r.assign(r.slot(s, ["taskid"]), v0);
          r.assign(r.slot(s, ["task_tip"]), (await r.module("skill960", "show_task_tip", r.get(s, "taskid"), r.get(r.get(s, "taskprog"), r.get(s, "i")), 1)));
          await r.write(r.text(r.get(s, "task_tip")));
          await r.write("<br>\r\n<input type=\"button\" class=\"cmdbutton\" value=\"提交\" onclick=\"$('taskid_submit').value='");
          await r.write(r.text(r.get(s, "taskid")));
          await r.write("';postCmd('gamecmd','command.php');this.disabled=true;\">");
          await r.write(r.text((await r.module("skill960", "show_extra_task_cmds", r.get(s, "sdata"), r.get(s, "taskid")))));
          await r.write("<br><br>");
        }
      }
    }
  }
  await r.write("<br><br>\r\n<input type=\"button\" class=\"cmdbutton\"  id=\"x\" value=\"[X]返回\" onclick=\"$('command').value='menu'; postCmd('gamecmd','command.php');this.disabled=true;\">");
return 1;
}
