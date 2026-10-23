// Generated from include/modules/base/itemmain/profile_backpack.2.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  await r.write("<div class=\"profile_row\">\r\n<div class=\"profile_bar pack packtitle itmk\" style=\"margin-left:5px\">\r\n道具种类\r\n</div><div class=\"profile_bar pack packtitle itmname\">\r\n名称\r\n</div><div class=\"profile_bar pack packtitle itmsk\">\r\n属性\r\n</div><div class=\"profile_bar pack packtitle itme\">\r\n效果值\r\n</div><div class=\"profile_bar pack packtitle itms\">\r\n耐久值\r\n</div>\r\n</div>");
  if (r.truth((await r.call("is_array", (await r.call("range", 1, 6)))))) {
    {
      const a0 = r.copy((await r.call("range", 1, 6)));
      for (const [k0, v0] of r.entries(a0)) {
        r.assign(r.slot(s, ["ii"]), v0);
        await r.write("<div class=\"profile_row\">\r\n<div class=\"profile_bar pack itmk\" style=\"margin-left:5px\">\r\n<span ");
        if (r.truth((!r.truth(r.get(s, (r.text("itms") + r.text(r.get(s, "ii")))))))) {
          await r.write("class=\"grey\"");
        }
        await r.write(" ");
        if (r.truth(r.get(r.get(s, "tpldata"), (r.text((r.text("itmk") + r.text(r.get(s, "ii")))) + r.text("_desc"))))) {
          await r.write("title=\"");
          await r.write(r.text(r.get(r.get(s, "tpldata"), (r.text((r.text("itmk") + r.text(r.get(s, "ii")))) + r.text("_desc")))));
          await r.write("\"");
        }
        await r.write(">");
        if (r.truth(r.get(r.get(s, "tpldata"), (r.text((r.text("itmk") + r.text(r.get(s, "ii")))) + r.text("_words"))))) {
          await r.write(r.text(r.get(r.get(s, "tpldata"), (r.text((r.text("itmk") + r.text(r.get(s, "ii")))) + r.text("_words")))));
        } else {
          await r.write("--");
        }
        await r.write("</span>\r\n</div><div class=\"profile_bar pack itmname\">\r\n<span ");
        if (r.truth((!r.truth(r.get(s, (r.text("itms") + r.text(r.get(s, "ii")))))))) {
          await r.write("class=\"grey\"");
        }
        await r.write(" ");
        if (r.truth((r.truth(r.get(s, (r.text("itms") + r.text(r.get(s, "ii"))))) && r.truth((!r.equal(r.get(r.get(s, "tpldata"), (r.text((r.text("itm") + r.text(r.get(s, "ii")))) + r.text("_words"))), r.get(s, (r.text("itm") + r.text(r.get(s, "ii")))))))))) {
          await r.write("title=\"");
          await r.write(r.text(r.get(s, (r.text("itm") + r.text(r.get(s, "ii"))))));
          await r.write("\"");
        }
        await r.write(">");
        if (r.truth(r.get(s, (r.text("itms") + r.text(r.get(s, "ii")))))) {
          await r.write(r.text(r.get(r.get(s, "tpldata"), (r.text((r.text("itm") + r.text(r.get(s, "ii")))) + r.text("_words")))));
        } else {
          await r.write(r.text(r.get(s, "noitm")));
        }
        await r.write("</span>\r\n</div><div class=\"profile_bar pack itmsk\">\r\n<span ");
        if (r.truth((!r.truth(r.get(s, (r.text("itms") + r.text(r.get(s, "ii")))))))) {
          await r.write("class=\"grey\"");
        }
        await r.write(" ");
        if (r.truth((r.truth(r.get(s, (r.text("itms") + r.text(r.get(s, "ii"))))) && r.truth(r.get(r.get(s, "tpldata"), (r.text((r.text("itmsk") + r.text(r.get(s, "ii")))) + r.text("_desc"))))))) {
          await r.write("title=\"");
          await r.write(r.text(r.get(r.get(s, "tpldata"), (r.text((r.text("itmsk") + r.text(r.get(s, "ii")))) + r.text("_desc")))));
          await r.write("\"");
        }
        await r.write(">\r");
        await r.write(r.text(r.get(r.get(s, "tpldata"), (r.text((r.text("itmsk") + r.text(r.get(s, "ii")))) + r.text("_words")))));
        await r.write("</span>\r\n</div><div class=\"profile_bar pack itme\">\r\n<span ");
        if (r.truth((!r.truth(r.get(s, (r.text("itms") + r.text(r.get(s, "ii")))))))) {
          await r.write("class=\"grey\"");
        }
        await r.write(" ");
        if (r.truth((r.truth(r.get(s, (r.text("itms") + r.text(r.get(s, "ii"))))) && r.truth((!r.equal(r.get(r.get(s, "tpldata"), (r.text((r.text("itme") + r.text(r.get(s, "ii")))) + r.text("_words"))), r.get(s, (r.text("itme") + r.text(r.get(s, "ii")))))))))) {
          await r.write("title=\"");
          await r.write(r.text(r.get(s, (r.text("itme") + r.text(r.get(s, "ii"))))));
          await r.write("\"");
        }
        await r.write(">");
        if (r.truth(r.get(s, (r.text("itms") + r.text(r.get(s, "ii")))))) {
          await r.write(r.text(r.get(r.get(s, "tpldata"), (r.text((r.text("itme") + r.text(r.get(s, "ii")))) + r.text("_words")))));
        } else {
          await r.write("-");
        }
        await r.write("</span>\r\n</div><div class=\"profile_bar pack itms\">\r\n<span ");
        if (r.truth((!r.truth(r.get(s, (r.text("itms") + r.text(r.get(s, "ii")))))))) {
          await r.write("class=\"grey\"");
        }
        await r.write(" ");
        if (r.truth((r.truth(r.get(s, (r.text("itms") + r.text(r.get(s, "ii"))))) && r.truth((!r.equal(r.get(r.get(s, "tpldata"), (r.text((r.text("itms") + r.text(r.get(s, "ii")))) + r.text("_words"))), r.get(s, (r.text("itms") + r.text(r.get(s, "ii")))))))))) {
          await r.write("title=\"");
          await r.write(r.text(r.get(s, (r.text("itms") + r.text(r.get(s, "ii"))))));
          await r.write("\"");
        }
        await r.write(">");
        if (r.truth(r.get(s, (r.text("itms") + r.text(r.get(s, "ii")))))) {
          await r.write(r.text(r.get(r.get(s, "tpldata"), (r.text((r.text("itms") + r.text(r.get(s, "ii")))) + r.text("_words")))));
        } else {
          await r.write("-");
        }
        await r.write("</span>\r\n</div>\r\n</div>");
      }
    }
  }
return 1;
}
