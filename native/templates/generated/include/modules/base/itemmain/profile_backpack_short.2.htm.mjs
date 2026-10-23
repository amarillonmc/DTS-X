// Generated from include/modules/base/itemmain/profile_backpack_short.2.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  await r.write("<div class=\"profile_row\">\r\n<div class=\"profile_bar pack packtitle itmname forshort\">\r\n包裹道具\r\n</div><div class=\"glow_buttons yellow profile_mode_button\" onclick=\"profile_mode_switch();\"><></div>\r\n</div>");
  if (r.truth((await r.call("is_array", (await r.call("range", 1, 6)))))) {
    {
      const a0 = r.copy((await r.call("range", 1, 6)));
      for (const [k0, v0] of r.entries(a0)) {
        r.assign(r.slot(s, ["ii"]), v0);
        await r.write("<div class=\"profile_row\">\r\n<div class=\"profile_bar pack itmname forshort\">");
        if (r.truth(r.get(s, (r.text("itms") + r.text(r.get(s, "ii")))))) {
          r.assign(r.slot(s, ["tmp_itmname"]), r.get(r.get(s, "tpldata"), (r.text((r.text("itm") + r.text(r.get(s, "ii")))) + r.text("_words_short"))));
          await r.write("<span ");
          if (r.truth((!r.equal(r.get(s, "tmp_itmname"), r.get(s, (r.text("itm") + r.text(r.get(s, "ii")))))))) {
            await r.write("title=\"");
            await r.write(r.text(r.get(s, (r.text("itm") + r.text(r.get(s, "ii"))))));
            await r.write("\"");
          }
          await r.write(">");
          await r.write(r.text(r.get(s, "tmp_itmname")));
          await r.write("</span>");
        } else {
          await r.write("<span class=\"grey\">");
          await r.write(r.text(r.get(s, "noitm")));
          await r.write("</span>");
        }
        await r.write("</div>\r\n</div>");
      }
    }
  }
return 1;
}
