// Generated from include/modules/extra/item_extra/item_randskills/use_skcore.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  await r.write("<input type=\"hidden\" id=\"mode\" name=\"mode\" value=\"command\">\r\n<input type=\"hidden\" id=\"command\" name=\"command\" value=\"itm");
  await r.write(r.text(r.get(r.get(s, "theitem"), "itmn")));
  await r.write("\">\r\n<input type=\"hidden\" id=\"skcore_choice\" name=\"skcore_choice\" value=\"0\">");
  r.assign(r.slot(s, ["sclist"]), (await r.module("item_randskills", "get_skcore_skilllist", r.get(r.get(s, "theitem"), "itmk"), r.get(r.get(s, "theitem"), "itmsk"))));
  if (r.truth((!r.truth(r.get(s, "sclist"))))) {
    await r.write("你好像没有可以学习的技能。<br>");
  } else {
    r.imports(s, "clubbase");
    await r.write("你可以习得以下技能中的其中一个：<br><br>");
    if (r.truth((await r.call("is_array", r.get(s, "sclist"))))) {
      {
        const a0 = r.copy(r.get(s, "sclist"));
        for (const [k0, v0] of r.entries(a0)) {
        r.assign(r.slot(s, ["k"]), k0);
          r.assign(r.slot(s, ["i"]), v0);
          r.assign(r.slot(s, ["id"]), r.add(r.get(s, "k"), 1));
          r.assign(r.slot(s, ["skilldesc_id"]), (r.text("skilldesc_show_") + r.text(r.get(s, "id"))));
          await r.write("<input type=\"button\" class=\"cmdbutton\" value=\"");
          await r.write(r.text(r.get(r.get(s, "clubskillname"), r.get(s, "i"))));
          await r.write("\" onclick=\"$('skcore_choice').value='");
          await r.write(r.text(r.get(s, "id")));
          await r.write("';postCmd('gamecmd','command.php');this.disabled=true;\" onmouseenter=\"$('");
          await r.write(r.text(r.get(s, "skilldesc_id")));
          await r.write("').style.display='block';\" onmouseleave=\"$('");
          await r.write(r.text(r.get(s, "skilldesc_id")));
          await r.write("').style.display='none';\">\t\r\n<div style=\"position:relative;\">\r\n<div id=\"");
          await r.write(r.text(r.get(s, "skilldesc_id")));
          await r.write("\" class=\"skilldesc_show\" style=\"display:none;position:absolute;background-color:#000000;\">");
          await r.write(r.text((await r.module("item_randskills", "parse_skcore_skilldesc", r.get(s, "i")))));
          await r.write("</div>\r\n</div>");
        }
      }
    }
  }
  await r.write("<input type=\"button\" class=\"cmdbutton\"  id=\"x\" value=\"[X]返回\" onclick=\"$('command').value='menu'; postCmd('gamecmd','command.php');this.disabled=true;\">");
return 1;
}
