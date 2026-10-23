// Generated from include/modules/base/armor/profile_armor.2.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  r.assign(r.slot(s, ["tmp_arpos"]), r.array([["b", "B"], ["h", "H"], ["a", "A"], ["f", "F"]]));
  if (r.truth((await r.call("is_array", r.get(s, "tmp_arpos"))))) {
    {
      const a0 = r.copy(r.get(s, "tmp_arpos"));
      for (const [k0, v0] of r.entries(a0)) {
      r.assign(r.slot(s, ["apl"]), k0);
        r.assign(r.slot(s, ["apu"]), v0);
        await r.write("<div class=\"profile_row\">\r\n<div class=\"profile_bar pack itmk\" style=\"margin-left:5px\">\r\n<span ");
        if (r.truth((!r.truth(r.get(s, (r.text((r.text("ar") + r.text(r.get(s, "apl")))) + r.text("s"))))))) {
          await r.write("class=\"grey\"");
        }
        await r.write(">\r");
        await r.write(r.text(r.get(r.get(s, "iteminfo"), (r.text("D") + r.text(r.get(s, "apu"))))));
        await r.write("</span>\r\n</div><div class=\"profile_bar pack itmname\">\r\n<span ");
        if (r.truth((!r.truth(r.get(s, (r.text((r.text("ar") + r.text(r.get(s, "apl")))) + r.text("s"))))))) {
          await r.write("class=\"grey\"");
        }
        await r.write(" ");
        if (r.truth((r.truth(r.get(s, (r.text((r.text("ar") + r.text(r.get(s, "apl")))) + r.text("s")))) && r.truth((!r.equal(r.get(r.get(s, "tpldata"), (r.text((r.text("ar") + r.text(r.get(s, "apl")))) + r.text("_words"))), r.get(s, (r.text("ar") + r.text(r.get(s, "apl")))))))))) {
          await r.write("title=\"");
          await r.write(r.text(r.get(s, (r.text("ar") + r.text(r.get(s, "apl"))))));
          await r.write("\"");
        }
        await r.write(">");
        if (r.truth(r.get(s, (r.text((r.text("ar") + r.text(r.get(s, "apl")))) + r.text("s"))))) {
          await r.write(r.text(r.get(r.get(s, "tpldata"), (r.text((r.text("ar") + r.text(r.get(s, "apl")))) + r.text("_words")))));
        } else {
          if (r.truth(r.equal("b", r.get(s, "apl")))) {
            await r.write(r.text(r.get(s, "noarb")));
          } else {
            await r.write(r.text(r.get(s, "noitm")));
          }
        }
        await r.write("</span>\r\n</div><div class=\"profile_bar pack itmsk\">\r\n<span ");
        if (r.truth((!r.truth(r.get(s, (r.text((r.text("ar") + r.text(r.get(s, "apl")))) + r.text("s"))))))) {
          await r.write("class=\"grey\"");
        }
        await r.write(" ");
        if (r.truth((r.truth(r.get(s, (r.text((r.text("ar") + r.text(r.get(s, "apl")))) + r.text("s")))) && r.truth(r.get(r.get(s, "tpldata"), (r.text((r.text("ar") + r.text(r.get(s, "apl")))) + r.text("sk_desc"))))))) {
          await r.write("title=\"");
          await r.write(r.text(r.get(r.get(s, "tpldata"), (r.text((r.text("ar") + r.text(r.get(s, "apl")))) + r.text("sk_desc")))));
          await r.write("\"");
        }
        await r.write(">");
        if (r.truth(r.get(s, (r.text((r.text("ar") + r.text(r.get(s, "apl")))) + r.text("s"))))) {
          await r.write(r.text(r.get(r.get(s, "tpldata"), (r.text((r.text("ar") + r.text(r.get(s, "apl")))) + r.text("sk_words")))));
        } else {
          await r.write("--");
        }
        await r.write("</span>\r\n</div><div class=\"profile_bar pack itme\">\r\n<span ");
        if (r.truth((!r.truth(r.get(s, (r.text((r.text("ar") + r.text(r.get(s, "apl")))) + r.text("s"))))))) {
          await r.write("class=\"grey\"");
        }
        await r.write(" ");
        if (r.truth((r.truth(r.get(s, (r.text((r.text("ar") + r.text(r.get(s, "apl")))) + r.text("s")))) && r.truth((!r.equal(r.get(r.get(s, "tpldata"), (r.text((r.text("ar") + r.text(r.get(s, "apl")))) + r.text("e_words"))), r.get(s, (r.text((r.text("ar") + r.text(r.get(s, "apl")))) + r.text("e"))))))))) {
          await r.write("title=\"");
          await r.write(r.text(r.get(s, (r.text((r.text("ar") + r.text(r.get(s, "apl")))) + r.text("e")))));
          await r.write("\"");
        }
        await r.write(">");
        if (r.truth(r.get(s, (r.text((r.text("ar") + r.text(r.get(s, "apl")))) + r.text("s"))))) {
          await r.write(r.text(r.get(r.get(s, "tpldata"), (r.text((r.text("ar") + r.text(r.get(s, "apl")))) + r.text("e_words")))));
        } else {
          await r.write("-");
        }
        await r.write("</span>\r\n</div><div class=\"profile_bar pack itms\">\r\n<span ");
        if (r.truth((!r.truth(r.get(s, (r.text((r.text("ar") + r.text(r.get(s, "apl")))) + r.text("s"))))))) {
          await r.write("class=\"grey\"");
        }
        await r.write(" ");
        if (r.truth((r.truth(r.get(s, (r.text((r.text("ar") + r.text(r.get(s, "apl")))) + r.text("s")))) && r.truth((!r.equal(r.get(r.get(s, "tpldata"), (r.text((r.text("ar") + r.text(r.get(s, "apl")))) + r.text("s_words"))), r.get(s, (r.text((r.text("ar") + r.text(r.get(s, "apl")))) + r.text("s"))))))))) {
          await r.write("title=\"");
          await r.write(r.text(r.get(s, (r.text((r.text("ar") + r.text(r.get(s, "apl")))) + r.text("s")))));
          await r.write("\"");
        }
        await r.write(">");
        if (r.truth(r.get(s, (r.text((r.text("ar") + r.text(r.get(s, "apl")))) + r.text("s"))))) {
          await r.write(r.text(r.get(r.get(s, "tpldata"), (r.text((r.text("ar") + r.text(r.get(s, "apl")))) + r.text("s_words")))));
        } else {
          await r.write("-");
        }
        await r.write("</span>\r\n</div>\r\n</div>");
      }
    }
  }
return 1;
}
