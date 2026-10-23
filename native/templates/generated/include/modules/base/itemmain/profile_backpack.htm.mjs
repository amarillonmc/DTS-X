// Generated from include/modules/base/itemmain/profile_backpack.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  await r.write("<TABLE border=\"0\" cellSpacing=0 cellPadding=0 height=100% width=100%>\r\n<tr>\r\n<TD class=b1 width=\"60\"><span>道具用途</span></TD>\r\n<TD class=b1><span>名称</span></TD>\r\n<TD class=b1 width=\"70\"><span>属性</span></TD>\r\n<TD class=b1 width=\"40\"><span>效</span></TD>\r\n<TD class=b1 width=\"40\"><span>耐</span></TD>\r\n</TR>");
  if (r.truth((await r.call("is_array", (await r.call("range", 1, 6)))))) {
    {
      const a0 = r.copy((await r.call("range", 1, 6)));
      for (const [k0, v0] of r.entries(a0)) {
        r.assign(r.slot(s, ["i"]), v0);
        await r.write("<tr>");
        if (r.truth(r.get(s, (r.text("itms") + r.text(r.get(s, "i")))))) {
          r.assign(r.slot(s, ["tpldata", (r.text((r.text("itm") + r.text(r.get(s, "i")))) + r.text("_words"))]), (await r.module("itemmain", "replace_crlf", r.get(r.get(s, "tpldata"), (r.text((r.text("itm") + r.text(r.get(s, "i")))) + r.text("_words"))))));
        }
        await r.write("      \t\t\t  \r\n<TD class=b2 height=\"26\"><span>");
        if (r.truth((r.truth(r.get(s, (r.text("itms") + r.text(r.get(s, "i"))))) && r.truth(r.get(r.get(s, "tpldata"), (r.text((r.text("itmk") + r.text(r.get(s, "i")))) + r.text("_words"))))))) {
          await r.write(r.text(r.get(r.get(s, "tpldata"), (r.text((r.text("itmk") + r.text(r.get(s, "i")))) + r.text("_words")))));
        } else {
          await r.write("<span class=\"grey b\">包裹");
          await r.write(r.text(r.get(s, "i")));
          await r.write("</span>");
        }
        await r.write("</span></TD>\r\n<TD class=b3><span>");
        if (r.truth(r.get(s, (r.text("itms") + r.text(r.get(s, "i")))))) {
          await r.write(r.text(r.get(r.get(s, "tpldata"), (r.text((r.text("itm") + r.text(r.get(s, "i")))) + r.text("_words")))));
        } else {
          await r.write(r.text(r.get(s, "noitm")));
        }
        await r.write("</span></TD>\r\n<TD class=b3><span ");
        if (r.truth((r.truth(r.get(s, (r.text("itms") + r.text(r.get(s, "i"))))) && r.truth(r.get(r.get(s, "tpldata"), (r.text((r.text("itmsk") + r.text(r.get(s, "i")))) + r.text("_desc"))))))) {
          await r.write("title=\"");
          await r.write(r.text(r.get(r.get(s, "tpldata"), (r.text((r.text("itmsk") + r.text(r.get(s, "i")))) + r.text("_desc")))));
          await r.write("\"");
        }
        await r.write(">");
        if (r.truth((!r.truth((!r.truth(r.get(r.get(s, "tpldata"), (r.text((r.text("itmsk") + r.text(r.get(s, "i")))) + r.text("_words"))))))))) {
          await r.write(r.text(r.get(r.get(s, "tpldata"), (r.text((r.text("itmsk") + r.text(r.get(s, "i")))) + r.text("_words")))));
        } else {
          await r.write("--");
        }
        await r.write("</span></TD>\r\n<TD class=b3><span>");
        if (r.truth(r.get(s, (r.text("itms") + r.text(r.get(s, "i")))))) {
          await r.write(r.text(r.get(s, (r.text("itme") + r.text(r.get(s, "i"))))));
        } else {
          await r.write("0");
        }
        await r.write("</span></TD>\r\n<TD class=b3><span>");
        await r.write(r.text(r.get(s, (r.text("itms") + r.text(r.get(s, "i"))))));
        await r.write("</span></TD>\r\n</tr>");
      }
    }
  }
  await r.write("</table>");
return 1;
}
