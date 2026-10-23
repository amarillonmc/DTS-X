// Generated from include/modules/extra/misc/extra_event/common_event_page.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  await r.write("<input type=\"hidden\" id=\"mode\" name=\"mode\" value=\"command\">\r\n<input type=\"hidden\" id=\"command\" name=\"command\" value=\"event\">\r\n<input type=\"hidden\" id=\"event_selection\" name=\"event_selection\" value=\"99\">\r\n<div style=\"text-align:center;\">");
  if (r.truth((await r.call("is_array", r.get(r.get(r.get(s, "now_texts"), "now_pace"), "branches"))))) {
    {
      const a0 = r.copy(r.get(r.get(r.get(s, "now_texts"), "now_pace"), "branches"));
      for (const [k0, v0] of r.entries(a0)) {
      r.assign(r.slot(s, ["i"]), k0);
        r.assign(r.slot(s, ["v"]), v0);
        if (r.truth((!r.truth((!r.truth(r.get(r.get(s, "v"), "hint"))))))) {
          r.assign(r.slot(s, ["v", "hint"]), (await r.module("extra_event", "extra_event_text_parse", r.get(s, "now_event"), r.get(s, "now_pace"), r.get(r.get(s, "v"), "hint"))));
        }
        await r.write("<div>");
        if (r.truth(r.equal("button", r.get(r.get(s, "v"), "type")))) {
          await r.write("<input type=\"button\" id=\"selection");
          await r.write(r.text(r.get(s, "i")));
          await r.write("\" value=\"");
          await r.write(r.text(r.get(r.get(s, "v"), "text")));
          await r.write("\" class=\"b_button bc_white ");
          if (r.truth((!r.truth((!r.truth(r.get(r.get(s, "v"), "class"))))))) {
            await r.write(r.text(r.get(r.get(s, "v"), "class")));
          }
          await r.write("\" style=\"margin:2px 0;\"");
          if (r.truth((!r.truth((!r.truth(r.get(r.get(s, "v"), "hint"))))))) {
            await r.write("title=\"");
            await r.write(r.text(r.get(r.get(s, "v"), "hint")));
            await r.write("\"");
          }
          await r.write(" \r\nonclick=\"$('event_selection').value='");
          await r.write(r.text(r.get(s, "i")));
          await r.write("';postCmd('gamecmd','command.php');this.disabled=true;\" />");
        } else {
          if (r.truth(r.equal("a", r.get(r.get(s, "v"), "type")))) {
            await r.write("<a ");
            if (r.truth((!r.truth((!r.truth(r.get(r.get(s, "v"), "hint"))))))) {
              await r.write("title=\"");
              await r.write(r.text(r.get(r.get(s, "v"), "hint")));
              await r.write("\"");
            }
            await r.write(" ");
            if (r.truth((!r.truth((!r.truth(r.get(r.get(s, "v"), "class"))))))) {
              await r.write("class=\"");
              await r.write(r.text(r.get(r.get(s, "v"), "class")));
              await r.write("\"");
            }
            await r.write(" \r\nonclick=\"$('event_selection').value='");
            await r.write(r.text(r.get(s, "i")));
            await r.write("';postCmd('gamecmd','command.php');this.disabled=true;\" />>\r");
            await r.write(r.text(r.get(r.get(s, "v"), "text")));
            await r.write("</a>");
          }
        }
        await r.write("</div>");
      }
    }
  }
  await r.write("</div>");
return 1;
}
