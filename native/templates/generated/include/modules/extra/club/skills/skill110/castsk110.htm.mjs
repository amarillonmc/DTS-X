// Generated from include/modules/extra/club/skills/skill110/castsk110.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  r.imports(s, "clubbase");
  await r.write("<input type=\"hidden\" name=\"mode\" value=\"special\">\r\n<input type=\"hidden\" id=\"command\" name=\"command\" value=\"skill110_special\">\r\n<input type=\"hidden\" id=\"subcmd\" name=\"subcmd\" value=\"castsk110\">\r\n你可以选择一个已习得的临时技能，并永久获得它。<br><br>");
  r.assign(r.slot(s, ["tsklist"]), (await r.module("skill110", "skill110_tempskill_list", r.get(s, "who"))));
  await r.write("请选择要记住的技能：<br>\r\n<input type=\"radio\" name=\"skill110_skillid\" id=\"back\" value=\"back\"><a onclick=\"sl('back');$('command').value='menu';\">返回</a><br>");
  if (r.truth((await r.call("is_array", r.get(s, "tsklist"))))) {
    {
      const a0 = r.copy(r.get(s, "tsklist"));
      for (const [k0, v0] of r.entries(a0)) {
        r.assign(r.slot(s, ["v"]), v0);
        await r.write("<input type=\"radio\" name=\"skill110_skillid\" id=\"skillid");
        await r.write(r.text(r.get(s, "v")));
        await r.write("\" value=\"");
        await r.write(r.text(r.get(s, "v")));
        await r.write("\"><a onclick=\"sl('skillid");
        await r.write(r.text(r.get(s, "v")));
        await r.write("');\">技能【");
        await r.write(r.text(r.get(r.get(s, "clubskillname"), r.get(s, "v"))));
        await r.write("】</a><br>");
      }
    }
  }
  await r.write("<br><br>\r\n<input type=\"button\" class=\"cmdbutton\"  id=\"z\" value=\"[Z]提交\" onclick=\"postCmd('gamecmd','command.php');this.disabled=true;\">");
return 1;
}
