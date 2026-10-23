// Generated from include/modules/base/armor/profile_armor_short.2.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  if (r.truth((await r.call("is_array", r.array([[r.APPEND, "b"], [r.APPEND, "h"], [r.APPEND, "a"], [r.APPEND, "f"]]))))) {
    {
      const a0 = r.copy(r.array([[r.APPEND, "b"], [r.APPEND, "h"], [r.APPEND, "a"], [r.APPEND, "f"]]));
      for (const [k0, v0] of r.entries(a0)) {
        r.assign(r.slot(s, ["apl"]), v0);
        await r.write("<div class=\"profile_row\">");
        r.assign(r.slot(s, ["tmp_eqpname"]), r.get(r.get(s, "tpldata"), (r.text((r.text("ar") + r.text(r.get(s, "apl")))) + r.text("_words_short"))));
        await r.write("<div class=\"profile_bar pack itmname forshort\">\r\n<span ");
        if (r.truth((!r.truth(r.get(s, (r.text((r.text("ar") + r.text(r.get(s, "apl")))) + r.text("s"))))))) {
          await r.write("class=\"grey\"");
        }
        await r.write(" ");
        if (r.truth((r.truth(r.get(s, (r.text((r.text("ar") + r.text(r.get(s, "apl")))) + r.text("s")))) && r.truth((!r.equal(r.get(s, "tmp_eqpname"), r.get(s, (r.text("ar") + r.text(r.get(s, "apl")))))))))) {
          await r.write("title=\"");
          await r.write(r.text(r.get(s, (r.text("ar") + r.text(r.get(s, "apl"))))));
          await r.write("\"");
        }
        await r.write(">");
        if (r.truth(r.get(s, (r.text((r.text("ar") + r.text(r.get(s, "apl")))) + r.text("s"))))) {
          await r.write(r.text(r.get(s, "tmp_eqpname")));
        } else {
          if (r.truth(r.equal("b", r.get(s, "apl")))) {
            await r.write(r.text(r.get(s, "noarb")));
          } else {
            await r.write(r.text(r.get(s, "noitm")));
          }
        }
        await r.write("</span>\r\n</div>\r\n</div>");
      }
    }
  }
return 1;
}
