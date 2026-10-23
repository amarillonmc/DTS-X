// Generated from include/modules/extra/card/skills/skill801/desc.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  r.assign(r.slot(s, ["___TEMP_SKILL_ID"]), 801);
  r.imports(s, "clubbase");
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_START"), s));
  await r.write("<span>");
  if (r.truth((await r.module("skillbase", "skill_getvalue", 801, "lvl", r.get(s, "who"))))) {
    await r.write("首领");
  } else {
    await r.write("爪牙");
  }
  await r.write("</span>");
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_MID1"), s));
  await r.write("<td class=\"skilldesc_left b3\"><span class=\"skilldesc\">");
  if (r.truth((await r.module("skillbase", "skill_getvalue", 801, "lvl", r.get(s, "who"))))) {
    r.assign(r.slot(s, ["fpid"]), (await r.module("skill801", "skill801_get_pidlist")));
    await r.write("你是以下角色的首领：<br>");
    if (r.truth((!r.truth(r.get(s, "fpid"))))) {
      await r.write("<span class=\"yellow b\">无</span>");
    } else {
      if (r.truth((await r.call("is_array", r.get(s, "fpid"))))) {
        {
          const a0 = r.copy(r.get(s, "fpid"));
          for (const [k0, v0] of r.entries(a0)) {
            r.assign(r.slot(s, ["i"]), v0);
            r.assign(r.slot(s, ["fname"]), r.get((await r.module("player", "fetch_playerdata_by_pid", r.get(s, "i"))), "name"));
            await r.write("<span class=\"yellow b\">");
            await r.write(r.text(r.get(s, "fname")));
            await r.write("</span>&nbsp; ");
          }
        }
      }
    }
    await r.write("<br>你被击败后，这些角色会立即脱离战场。");
  } else {
    r.assign(r.slot(s, ["lpid"]), (await r.module("skill801", "skill801_get_pidlist")));
    if (r.truth((!r.truth((!r.truth(r.get(s, "lpid"))))))) {
      r.assign(r.slot(s, ["lname"]), r.get((await r.module("player", "fetch_playerdata_by_pid", r.get(r.get(s, "lpid"), "0"))), "name"));
      await r.write("你是<span class=\"yellow b\">");
      await r.write(r.text(r.get(s, "lname")));
      await r.write("</span>的手下。<br>首领被击败后，你会立即脱离战场。");
    }
  }
  await r.write("</span></td>\r\n<td class=\"skilldesc_right b3\">\r\n</td>");
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_MID2"), s));
  if (r.truth((!r.truth(r.get(s, "___TEMP_THIS_SKILL_ACQUIRED"))))) {
    await r.write("<span class=\"yellow b\">\r\n</span>");
  }
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_END"), s));
return 1;
}
