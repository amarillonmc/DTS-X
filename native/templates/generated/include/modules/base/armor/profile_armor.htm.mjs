// Generated from include/modules/base/armor/profile_armor.htm; edit source migration/compiler, not generated code.
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
        if (r.truth(r.get(s, (r.text((r.text("ar") + r.text(r.get(s, "apl")))) + r.text("s"))))) {
          r.assign(r.slot(s, ["tpldata", (r.text((r.text("ar") + r.text(r.get(s, "apl")))) + r.text("_words"))]), (await r.module("itemmain", "replace_crlf", r.get(r.get(s, "tpldata"), (r.text((r.text("ar") + r.text(r.get(s, "apl")))) + r.text("_words"))))));
        }
        await r.write("<tr>\r\n<TD class=b2 height=\"26\"><span>");
        if (r.truth(r.get(s, (r.text((r.text("ar") + r.text(r.get(s, "apl")))) + r.text("s"))))) {
          await r.write(r.text(r.get(r.get(s, "iteminfo"), (r.text("D") + r.text(r.get(s, "apu"))))));
        } else {
          await r.write("<span class=\"grey b\">");
          await r.write(r.text(r.get(r.get(s, "iteminfo"), (r.text("D") + r.text(r.get(s, "apu"))))));
          await r.write("</span>");
        }
        await r.write("</span></TD>\r\n<TD class=b3>");
        if (r.truth((r.truth((r.truth(r.equal(r.constant("CURSCRIPT"), "game")) && r.truth(r.equal(r.get(s, "mode"), "command")))) && r.truth(r.get(s, (r.text((r.text("ar") + r.text(r.get(s, "apl")))) + r.text("s"))))))) {
          await r.write("<span><input type=\"button\" value=\"卸下\" onclick=\"$('mode').value='itemmain';$('command').value='offar");
          await r.write(r.text(r.get(s, "apl")));
          await r.write("';postCmd('gamecmd','command.php');return false;\"</span>");
        }
        await r.write("<span>");
        if (r.truth(r.get(s, (r.text((r.text("ar") + r.text(r.get(s, "apl")))) + r.text("s"))))) {
          await r.write(r.text(r.get(r.get(s, "tpldata"), (r.text((r.text("ar") + r.text(r.get(s, "apl")))) + r.text("_words")))));
        } else {
          if (r.truth(r.equal("b", r.get(s, "apl")))) {
            await r.write(r.text(r.get(s, "noarb")));
          } else {
            await r.write(r.text(r.get(s, "noitm")));
          }
        }
        await r.write("</span>\r\n</TD>\r\n<TD class=b3><span ");
        if (r.truth((r.truth(r.get(s, (r.text((r.text("ar") + r.text(r.get(s, "apl")))) + r.text("s")))) && r.truth(r.get(r.get(s, "tpldata"), (r.text((r.text("ar") + r.text(r.get(s, "apl")))) + r.text("sk_desc"))))))) {
          await r.write("title=\"");
          await r.write(r.text(r.get(r.get(s, "tpldata"), (r.text((r.text("ar") + r.text(r.get(s, "apl")))) + r.text("sk_desc")))));
          await r.write("\"");
        }
        await r.write(">");
        if (r.truth((!r.truth((!r.truth(r.get(r.get(s, "tpldata"), (r.text((r.text("ar") + r.text(r.get(s, "apl")))) + r.text("sk_words"))))))))) {
          await r.write(r.text(r.get(r.get(s, "tpldata"), (r.text((r.text("ar") + r.text(r.get(s, "apl")))) + r.text("sk_words")))));
        } else {
          await r.write("--");
        }
        await r.write("</span></TD>\r\n<TD class=b3><span>");
        if (r.truth(r.get(s, (r.text((r.text("ar") + r.text(r.get(s, "apl")))) + r.text("s"))))) {
          await r.write(r.text(r.get(r.get(s, "tpldata"), (r.text((r.text("ar") + r.text(r.get(s, "apl")))) + r.text("e_words")))));
        } else {
          await r.write("0");
        }
        await r.write("</span></TD>\r\n<TD class=b3><span>");
        await r.write(r.text(r.get(r.get(s, "tpldata"), (r.text((r.text("ar") + r.text(r.get(s, "apl")))) + r.text("s_words")))));
        await r.write("</span></TD>\r\n</tr>");
      }
    }
  }
return 1;
}
