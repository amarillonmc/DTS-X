// Generated from include/modules/extra/card/skills/skill805/castsk805.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  r.imports(s, "clubbase");
  await r.write("<input type=\"hidden\" name=\"mode\" value=\"special\">\r\n<input type=\"hidden\" id=\"command\" name=\"command\" value=\"skill805_special\">\r\n<input type=\"hidden\" id=\"skill805_skillid\" name=\"skill805_skillid\" value=\"0\">\r\n请选择要遗忘的技能：<br><br>");
  r.assign(r.slot(s, ["ls"]), (await r.module("skill805", "skill805_get_sklist", r.get(s, "who"))));
  r.assign(r.slot(s, ["sklist"]), r.get(r.get(s, "ls"), "0"));
  r.assign(r.slot(s, ["locksklist"]), r.get(r.get(s, "ls"), "1"));
  if (r.truth((await r.call("is_array", r.get(s, "sklist"))))) {
    {
      const a0 = r.copy(r.get(s, "sklist"));
      for (const [k0, v0] of r.entries(a0)) {
      r.assign(r.slot(s, ["k"]), k0);
        r.assign(r.slot(s, ["i"]), v0);
        r.assign(r.slot(s, ["id"]), r.add(r.get(s, "k"), 1));
        r.assign(r.slot(s, ["skilldesc_id"]), (r.text("skilldesc_show_") + r.text(r.get(s, "id"))));
        r.assign(r.slot(s, ["m"]), 0);
        await r.write("<input type=\"button\" class=\"cmdbutton\" value=\"");
        await r.write(r.text(r.get(r.get(s, "clubskillname"), r.get(s, "i"))));
        await r.write("\" onclick=\"$('skill805_skillid').value='");
        await r.write(r.text(r.get(s, "i")));
        await r.write("';postCmd('gamecmd','command.php');this.disabled=true;\" onmouseenter=\"$('");
        await r.write(r.text(r.get(s, "skilldesc_id")));
        await r.write("').style.display='block';\" onmouseleave=\"$('");
        await r.write(r.text(r.get(s, "skilldesc_id")));
        await r.write("').style.display='none';\">");
        if (r.truth((r.truth(r.equal(r.modulo(r.get(s, "id"), 3), 0)) || r.truth(r.equal(r.get(s, "id"), (await r.call("count", r.get(s, "sklist")))))))) {
          if (r.truth((await r.call("is_array", (await r.call("range", r.get(s, "m"), r.get(s, "k"))))))) {
            {
              const a1 = r.copy((await r.call("range", r.get(s, "m"), r.get(s, "k"))));
              for (const [k1, v1] of r.entries(a1)) {
                r.assign(r.slot(s, ["j"]), v1);
                await r.write("<div style=\"position:relative;\">\r\n<div id=\"skilldesc_show_");
                await r.write(r.text(r.add(r.get(s, "j"), 1)));
                await r.write("\" class=\"skilldesc_show\" style=\"display:none;position:absolute;background-color:#000000;\">");
                await r.write(r.text((await r.module("skill805", "skill805_parse_skilldesc", r.get(r.get(s, "sklist"), r.get(s, "j"))))));
                await r.write("</div>\r\n</div>");
              }
            }
          }
          r.update(r.slot(s, ["m"]), "add", 3);
        }
      }
    }
  }
  if (r.truth((await r.call("is_array", r.get(s, "locksklist"))))) {
    {
      const a2 = r.copy(r.get(s, "locksklist"));
      for (const [k2, v2] of r.entries(a2)) {
      r.assign(r.slot(s, ["k"]), k2);
        r.assign(r.slot(s, ["i"]), v2);
        r.assign(r.slot(s, ["id"]), r.add(r.get(s, "k"), 1000));
        r.assign(r.slot(s, ["skilldesc_id"]), (r.text("skilldesc_show_") + r.text(r.get(s, "id"))));
        r.assign(r.slot(s, ["m"]), 0);
        await r.write("<input type=\"button\" class=\"cmdbutton\" value=\"");
        await r.write(r.text(r.get(r.get(s, "clubskillname"), r.get(s, "i"))));
        await r.write("\" disabled onmouseenter=\"$('");
        await r.write(r.text(r.get(s, "skilldesc_id")));
        await r.write("').style.display='block';\" onmouseleave=\"$('");
        await r.write(r.text(r.get(s, "skilldesc_id")));
        await r.write("').style.display='none';\">");
        if (r.truth((r.truth(r.equal(r.modulo(r.get(s, "id"), 3), 0)) || r.truth(r.equal(r.get(s, "id"), r.add((await r.call("count", r.get(s, "locksklist"))), 999)))))) {
          if (r.truth((await r.call("is_array", (await r.call("range", r.get(s, "m"), r.get(s, "k"))))))) {
            {
              const a3 = r.copy((await r.call("range", r.get(s, "m"), r.get(s, "k"))));
              for (const [k3, v3] of r.entries(a3)) {
                r.assign(r.slot(s, ["j"]), v3);
                await r.write("<div style=\"position:relative;\">\r\n<div id=\"skilldesc_show_");
                await r.write(r.text(r.add(r.get(s, "j"), 1000)));
                await r.write("\" class=\"skilldesc_show\" style=\"display:none;position:absolute;background-color:#000000;\">");
                await r.write(r.text((await r.module("skill805", "skill805_parse_skilldesc", r.get(r.get(s, "locksklist"), r.get(s, "j"))))));
                await r.write("</div>\r\n</div>");
              }
            }
          }
          r.update(r.slot(s, ["m"]), "add", 3);
        }
      }
    }
  }
return 1;
}
