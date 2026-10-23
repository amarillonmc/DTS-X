// Generated from include/modules/extra/gmskills/skill1013/sub_page.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  await r.write("<input type=\"hidden\" name=\"mode\" value=\"special\">\r\n<input type=\"hidden\" id=\"command\" name=\"command\" value=\"skill1013_special\">\r\n<input type=\"hidden\" id=\"subcmd\" name=\"subcmd\" value=\"acquire\">\r\n<input type=\"hidden\" id=\"skillid\" name=\"skillid\" value=\"0\">\r\n<input type=\"button\" class=\"cmdbutton\" value=\"返回\" onclick=\"$('command').value='menu'; postCmd('gamecmd','command.php',this);\">\r\n<br>");
  r.imports(s, "clubbase");
  r.assign(r.slot(s, ["skilllist"]), (await r.call("array_keys", r.get(s, "clubskillname"))));
  (await r.mutate("sort", r.slot(s, ["skilllist"])));
  r.assign(r.slot(s, ["min"]), r.get(r.get(s, "skilllist"), "0"));
  r.assign(r.slot(s, ["max"]), r.get(r.get(s, "skilllist"), r.subtract((await r.call("count", r.get(s, "skilllist"))), 1)));
  if (r.truth((await r.call("is_array", (await r.call("range", r.get(s, "min"), r.get(s, "max"))))))) {
    {
      const a0 = r.copy((await r.call("range", r.get(s, "min"), r.get(s, "max"))));
      for (const [k0, v0] of r.entries(a0)) {
        r.assign(r.slot(s, ["i"]), v0);
        await r.write("    ");
        if (r.truth((r.truth((r.truth((r.truth((await r.call("defined", (r.text("MOD_SKILL") + r.text(r.get(s, "i")))))) && r.truth((!r.truth((await r.module("skillbase", "check_skill_info", r.get(s, "i"), "debuff"))))))) && r.truth((!r.truth((await r.module("skillbase", "check_skill_info", r.get(s, "i"), "achievement"))))))) && r.truth((!r.truth((await r.module("skillbase", "skill_query", r.get(s, "i"))))))))) {
          await r.write("    <button onclick=\"$('skillid').value=");
          await r.write(r.text(r.get(s, "i")));
          await r.write(";postCmd('gamecmd','command.php',this);\" >\r\n        ");
          if (r.truth((!r.truth((!r.truth(r.get(r.get(s, "clubskillname"), r.get(s, "i")))))))) {
            await r.write("        ");
            await r.write(r.text(r.get(s, "i")));
            await r.write("：");
            await r.write(r.text((await r.call("strip_tags", r.get(r.get(s, "clubskillname"), r.get(s, "i"))))));
            await r.write("        ");
          } else {
            await r.write("        ");
            await r.write(r.text(r.get(s, "i")));
            await r.write("号无名技能\r\n        ");
          }
          await r.write("    </button>\r\n    <br>\r\n    ");
        }
      }
    }
  }
return 1;
}
