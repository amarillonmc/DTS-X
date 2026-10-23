// Generated from include/modules/base/itemmain/itemdrop.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  await r.write("你想丢掉什么？<br><br>\r\n<input type=\"hidden\" name=\"mode\" value=\"itemmain\">");
  r.imports(s, "player");
  r.assign(r.slot(s, ["item_words"]), (await r.module("itemmain", "parse_item_words", r.get(s, "sdata"))));
  r.assign(r.slot(s, ["drop_equip_list"]), r.array([[r.APPEND, "wep"], [r.APPEND, "arb"], [r.APPEND, "arh"], [r.APPEND, "ara"], [r.APPEND, "arf"], [r.APPEND, "art"], [r.APPEND, "itm0"], [r.APPEND, "itm1"], [r.APPEND, "itm2"], [r.APPEND, "itm3"], [r.APPEND, "itm4"], [r.APPEND, "itm5"], [r.APPEND, "itm6"]]));
  if (r.truth((r.truth((await r.call("defined", "MOD_SEARCHMEMORY"))) && r.truth((await r.module("searchmemory", "searchmemory_available")))))) {
    await r.write("<input type=\"hidden\" id=\"command\" name=\"command\" value=\"\">\r\n<input type=\"button\" class=\"cmdbutton\" id=\"x\" value=\"[X]返回\" onclick=\"$('command').value='menu';postCmd('gamecmd','command.php');this.disabled=true;\"><br>\r\n<br>");
    r.assign(r.slot(s, ["hotkeys"]), r.array([[r.APPEND, ""], [r.APPEND, "a"], [r.APPEND, "s"], [r.APPEND, "d"], [r.APPEND, "q"], [r.APPEND, "w"], [r.APPEND, "e"]]));
    r.assign(r.slot(s, ["hotkeysu"]), r.array([[r.APPEND, ""], [r.APPEND, "A"], [r.APPEND, "S"], [r.APPEND, "D"], [r.APPEND, "Q"], [r.APPEND, "W"], [r.APPEND, "E"]]));
    await r.write("<ul style=\"padding-left:24px;\">");
    if (r.truth((await r.call("is_array", r.get(s, "drop_equip_list"))))) {
      {
        const a0 = r.copy(r.get(s, "drop_equip_list"));
        for (const [k0, v0] of r.entries(a0)) {
          r.assign(r.slot(s, ["pos"]), v0);
          if (r.truth((!r.identical((await r.call("substr", r.get(s, "pos"), 0, 3)), "itm")))) {
            if (r.truth((r.truth((!r.truth((!r.truth(r.get(s, (r.text(r.get(s, "pos")) + r.text("s")))))))) && r.truth((r.truth((!r.truth((!r.truth(r.get(s, (r.text(r.get(s, "pos")) + r.text("e")))))))) || r.truth((r.truth((!r.equal("wep", r.get(s, "pos")))) && r.truth((!r.equal("arb", r.get(s, "pos"))))))))))) {
              await r.write("<li>\r\n<input type=\"button\" class=\"dropbutton\" id=\"drop");
              await r.write(r.text(r.get(s, "pos")));
              await r.write("\" value=\"丢弃\" \r\nonclick=\"$('command').value='drop");
              await r.write(r.text(r.get(s, "pos")));
              await r.write("';postCmd('gamecmd','command.php');this.disabled=true;\"> \r\n<a onclick=$('drop");
              await r.write(r.text(r.get(s, "pos")));
              await r.write("').click();>");
              await r.write(r.text(r.get(r.get(s, "item_words"), (r.text(r.get(s, "pos")) + r.text("_words")))));
              await r.write("/");
              await r.write(r.text(r.get(s, (r.text(r.get(s, "pos")) + r.text("e")))));
              await r.write("/");
              await r.write(r.text(r.get(s, (r.text(r.get(s, "pos")) + r.text("s")))));
              await r.write("</a>\r\n</li>");
            }
          } else {
            r.assign(r.slot(s, ["in"]), (await r.call("substr", r.get(s, "pos"), 3)));
            if (r.truth((!r.truth((!r.truth(r.get(s, (r.text("itms") + r.text(r.get(s, "in")))))))))) {
              await r.write("<li>\r\n<input type=\"button\" class=\"dropbutton\" id=\"");
              await r.write(r.text(r.get(r.get(s, "hotkeys"), r.get(s, "in"))));
              await r.write("\" value=\"[");
              await r.write(r.text(r.get(r.get(s, "hotkeysu"), r.get(s, "in"))));
              await r.write("]丢弃\" \r\nonclick=\"$('command').value='dropitm");
              await r.write(r.text(r.get(s, "in")));
              await r.write("';postCmd('gamecmd','command.php');this.disabled=true;\"> \r\n<a onclick=$('");
              await r.write(r.text(r.get(r.get(s, "hotkeys"), r.get(s, "in"))));
              await r.write("').click();>");
              await r.write(r.text(r.get(r.get(s, "item_words"), (r.text((r.text("itm") + r.text(r.get(s, "in")))) + r.text("_words")))));
              await r.write("/");
              await r.write(r.text(r.get(s, (r.text("itme") + r.text(r.get(s, "in"))))));
              await r.write("/");
              await r.write(r.text(r.get(s, (r.text("itms") + r.text(r.get(s, "in"))))));
              await r.write("</a>\r\n</li>");
            }
          }
          if (r.truth(r.equal("art", r.get(s, "pos")))) {
            await r.write("<br>");
          }
        }
      }
    }
    await r.write("</ul>");
  } else {
    await r.write("<input type=\"radio\" name=\"command\" id=\"menu\" value=\"menu\" checked><a onclick=sl('menu'); href=\"javascript:void(0);\" >返回</a><br><br>");
    if (r.truth((await r.call("is_array", r.get(s, "drop_equip_list"))))) {
      {
        const a1 = r.copy(r.get(s, "drop_equip_list"));
        for (const [k1, v1] of r.entries(a1)) {
          r.assign(r.slot(s, ["pos"]), v1);
          if (r.truth((!r.identical((await r.call("substr", r.get(s, "pos"), 0, 3)), "itm")))) {
            if (r.truth((r.truth((!r.truth((!r.truth(r.get(s, (r.text(r.get(s, "pos")) + r.text("s")))))))) && r.truth((r.truth((!r.truth((!r.truth(r.get(s, (r.text(r.get(s, "pos")) + r.text("e")))))))) || r.truth((r.truth((!r.equal("wep", r.get(s, "pos")))) && r.truth((!r.equal("arb", r.get(s, "pos"))))))))))) {
              await r.write("<input type=\"radio\" name=\"command\" id=\"");
              await r.write(r.text(r.get(s, "pos")));
              await r.write("\" value=\"drop");
              await r.write(r.text(r.get(s, "pos")));
              await r.write("\">\r\n<a onclick=sl('");
              await r.write(r.text(r.get(s, "pos")));
              await r.write("'); href=\"javascript:void(0);\" >");
              await r.write(r.text(r.get(r.get(s, "item_words"), (r.text(r.get(s, "pos")) + r.text("_words")))));
              await r.write("/");
              await r.write(r.text(r.get(s, (r.text(r.get(s, "pos")) + r.text("e")))));
              await r.write("/");
              await r.write(r.text(r.get(s, (r.text(r.get(s, "pos")) + r.text("s")))));
              await r.write("</a>\r\n<br>");
            }
          } else {
            r.assign(r.slot(s, ["in"]), (await r.call("substr", r.get(s, "pos"), 3)));
            if (r.truth((!r.truth((!r.truth(r.get(s, (r.text("itms") + r.text(r.get(s, "in")))))))))) {
              await r.write("<input type=\"radio\" name=\"command\" id=\"itm");
              await r.write(r.text(r.get(s, "in")));
              await r.write("\" value=\"dropitm");
              await r.write(r.text(r.get(s, "in")));
              await r.write("\">\r\n<a onclick=sl('itm");
              await r.write(r.text(r.get(s, "in")));
              await r.write("'); href=\"javascript:void(0);\" >");
              await r.write(r.text(r.get(r.get(s, "item_words"), (r.text((r.text("itm") + r.text(r.get(s, "in")))) + r.text("_words")))));
              await r.write("/");
              await r.write(r.text(r.get(s, (r.text("itme") + r.text(r.get(s, "in"))))));
              await r.write("/");
              await r.write(r.text(r.get(s, (r.text("itms") + r.text(r.get(s, "in"))))));
              await r.write("</a>\r\n<br>");
            }
          }
          if (r.truth(r.equal("art", r.get(s, "pos")))) {
            await r.write("<br>");
          }
        }
      }
    }
    await r.write("<br><br>\r\n<input type=\"button\" class=\"cmdbutton\" id=\"z\" value=\"[Z]确定丢弃\" onclick=\"postCmd('gamecmd','command.php');this.disabled=true;\">");
  }
return 1;
}
