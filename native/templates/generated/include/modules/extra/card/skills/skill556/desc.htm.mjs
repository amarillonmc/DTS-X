// Generated from include/modules/extra/card/skills/skill556/desc.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  r.imports(s, "skill556");
  r.assign(r.slot(s, ["___TEMP_SKILL_ID"]), 556);
  r.assign(r.slot(s, ["skill556var"]), (await r.module("skillbase", "skill_getvalue", 556, "choice")));
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_START"), s));
  await r.write("<span>\r");
  await r.write(r.text(r.get(r.get(s, "clubskillname"), r.get(s, "___TEMP_SKILL_ID"))));
  await r.write("</span>");
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_MID1"), s));
  await r.write("<td class=\"skilldesc_left b3\"><span class=\"skilldesc\">\r\n<span class=\"yellow b\">战斗技</span>&nbsp;&nbsp;标记敌人，可在移动或探索时显示该敌人的位置，<br>仅对玩家有效且只能同时标记一名，消耗<span class=\"yellow b\">");
  await r.write(r.text(r.get(s, "ragecost")));
  await r.write("</span>点怒气<br>\r\n当前标记的敌人：");
  r.assign(r.slot(s, ["tarpid"]), r.int((await r.module("skillbase", "skill_getvalue", 556, "targetpid"))));
  if (r.truth(r.equal(0, r.get(s, "tarpid")))) {
    r.assign(r.slot(s, ["targetname"]), "无");
  } else {
    r.assign(r.slot(s, ["targetname"]), r.get((await r.module("player", "fetch_playerdata_by_pid", r.get(s, "tarpid"))), "name"));
  }
  await r.write("<span class=\"yellow b\">");
  await r.write(r.text(r.get(s, "targetname")));
  await r.write("</span><br>");
  if (r.truth(r.equal(1, r.get(s, "skill556var")))) {
    await r.write("<span class=\"yellow b\">当前不显示目标位置</span>");
  } else {
    await r.write("<span class=\"cyan b\">当前会显示目标位置</span>");
    if (r.truth(r.equal(0, r.get(s, "tarpid")))) {
      await r.write("<span class=\"cyan b\">，</span><span class=\"yellow b\">但没有标记的敌人</span>");
    }
  }
  await r.write("<br>");
  if (r.truth((await r.call("is_array", (await r.call("range", 1, 2)))))) {
    {
      const a0 = r.copy((await r.call("range", 1, 2)));
      for (const [k0, v0] of r.entries(a0)) {
        r.assign(r.slot(s, ["i"]), v0);
        if (r.truth(r.equal(r.get(s, "skill556var"), r.get(s, "i")))) {
          await r.write("<input type=\"button\" style=\"width:70px;margin:4px\" disabled value=\"[已选择]\">");
        } else {
          await r.write("<input type=\"button\" style=\"width:70px;margin:4px\" onclick=\"$('mode').value='special';$('command').value='skill556_special';$('subcmd').value='upgrade';$('skillpara1').value='");
          await r.write(r.text(r.get(s, "i")));
          await r.write("';postCmd('gamecmd','command.php');this.disabled=true;\" value=\"");
          await r.write(r.text(r.get(r.get(s, "skill556stateinfo"), r.get(s, "i"))));
          await r.write("\">");
        }
        if (r.truth((r.compare(r.get(s, "i"), 2) < 0))) {
          await r.write("&nbsp;&nbsp;&nbsp;");
        }
      }
    }
  }
  await r.write("</span></td>\r\n<td class=\"skilldesc_right b3\">\r\n</td>");
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_MID2"), s));
  if (r.truth((!r.truth(r.get(s, "___TEMP_THIS_SKILL_ACQUIRED"))))) {
    await r.write("<span class=\"yellow b\">\r\n10级时解锁\r\n</span>");
  }
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_END"), s));
return 1;
}
