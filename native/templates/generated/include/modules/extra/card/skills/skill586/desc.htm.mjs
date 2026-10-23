// Generated from include/modules/extra/card/skills/skill586/desc.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  r.imports(s, "skill586", "sys", "clubbase", "npc");
  r.assign(r.slot(s, ["___TEMP_SKILL_ID"]), 586);
  r.assign(r.slot(s, ["skill586_itmarr"]), (await r.module("skill586", "skill586_prepare_itmarr")));
  r.assign(r.slot(s, ["skill586_nowcount_item"]), (await r.call("sizeof", r.get(s, "skill586_itmarr"))));
  r.assign(r.slot(s, ["skill586_npcarr"]), (await r.module("skill586", "skill586_get_npcarr")));
  r.assign(r.slot(s, ["skill586_nowcount_npc"]), (await r.call("sizeof", r.get(s, "skill586_npcarr"))));
  r.assign(r.slot(s, ["skill586_totalcount"]), r.add(r.get(s, "skill586_nowcount_item"), r.get(s, "skill586_nowcount_npc")));
  r.assign(r.slot(s, ["skill586_size"]), (await r.module("skill586", "skill586_get_packsize")));
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_START"), s));
  await r.write("<span>\r");
  await r.write(r.text(r.get(r.get(s, "clubskillname"), r.get(s, "___TEMP_SKILL_ID"))));
  await r.write("</span>");
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_MID1"), s));
  await r.write("<td class=\"skilldesc_left b3\"><span class=\"skilldesc\">\r\n当前异次元中已存放<span class=\"yellow b\">");
  await r.write(r.text(r.get(s, "skill586_nowcount_item")));
  await r.write("</span>个道具和<span class=\"yellow b\">");
  await r.write(r.text(r.get(s, "skill586_nowcount_npc")));
  await r.write("</span>个NPC<br>已使用空间为<span class=\"yellow b\">");
  await r.write(r.text(r.get(s, "skill586_totalcount")));
  await r.write(" / ");
  await r.write(r.text(r.get(s, "skill586_size")));
  await r.write("</span><br>");
  if (r.truth((await r.call("is_array", r.get(s, "skill586_itmarr"))))) {
    {
      const a0 = r.copy(r.get(s, "skill586_itmarr"));
      for (const [k0, v0] of r.entries(a0)) {
        r.assign(r.slot(s, ["v"]), v0);
        await r.write("<span class=\"cyan b\">");
        await r.write(r.text(r.get(r.get(s, "v"), "itm")));
        await r.write(" / ");
        await r.write(r.text(r.get(r.get(s, "v"), "itme")));
        await r.write(" / ");
        await r.write(r.text(r.get(r.get(s, "v"), "itms")));
        await r.write("</span><br>");
      }
    }
  }
  if (r.truth((await r.call("is_array", r.get(s, "skill586_npcarr"))))) {
    {
      const a1 = r.copy(r.get(s, "skill586_npcarr"));
      for (const [k1, v1] of r.entries(a1)) {
        r.assign(r.slot(s, ["i"]), v1);
        r.assign(r.slot(s, ["tnpc"]), (await r.module("player", "fetch_playerdata_by_pid", r.get(s, "i"))));
        await r.write("<span class=\"cyan b\">");
        await r.write(r.text(r.get(r.get(s, "npc_typeinfo"), r.get(r.get(s, "tnpc"), "type"))));
        await r.write(" ");
        await r.write(r.text(r.get(r.get(s, "tnpc"), "name")));
        await r.write("/Lv. ");
        await r.write(r.text(r.get(r.get(s, "tnpc"), "lvl")));
        await r.write("</span><br>");
      }
    }
  }
  await r.write("<span class=\"yellow b\">战斗技</span>&nbsp;&nbsp;将生命值低于自己的NPC装入异次元，消耗<span class=\"yellow b\">");
  await r.write(r.text(r.get(s, "ragecost")));
  await r.write("</span>点怒气\r\n</span></td>\r\n<td class=\"skilldesc_right b3\">\r\n<input type=\"button\" class=\"cmdbutton\" id=\"sp_castskill586\" value=\"打开隙间\" onclick=\"$('mode').value='special';$('command').value='skill586_special';$('subcmd').value='show';postCmd('gamecmd','command.php');this.disabled=true;\">\r\n</td>");
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_MID2"), s));
  if (r.truth((!r.truth(r.get(s, "___TEMP_THIS_SKILL_ACQUIRED"))))) {
    await r.write("<span class=\"yellow b\">\r\n</span>");
  }
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_END"), s));
return 1;
}
