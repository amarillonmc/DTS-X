// Generated from include/modules/base/itemmain/itemdrop0.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  await r.write("你的包裹已经满了。想要丢掉哪个物品？<br><br>\r\n<input type=\"hidden\" id=\"mode\" name=\"mode\" value=\"itemmain\">\r\n<!--这里在parse_interface_profile()之前，需要单独生成每个道具的显示数据。暂时是为了外甲显示而加的，但是未来也适用其他显示。至于parse_interface_profile()执行的时候就再重复生成一次吧，毕竟后面也有可能对道具有所修改。-->");
  r.imports(s, "player");
  r.assign(r.slot(s, ["item_words"]), (await r.module("itemmain", "parse_item_words", r.get(s, "sdata"))));
  if (r.truth((r.truth((await r.call("defined", "MOD_SEARCHMEMORY"))) && r.truth((await r.module("searchmemory", "searchmemory_available")))))) {
    await r.write("<input type=\"hidden\" id=\"command\" name=\"command\" value=\"\">\r\n<input type=\"button\" class=\"cmdbutton\" id=\"z\" value=\"[Z]丢弃\" \r\nonclick=\"$('command').value='dropitm0';postCmd('gamecmd','command.php');this.disabled=true;\">\r\n<a onclick=\"$('z').click();\">");
    await r.write(r.text(r.get(r.get(s, "item_words"), "itm0_words")));
    await r.write("/");
    await r.write(r.text(r.get(s, "itme0")));
    await r.write("/");
    await r.write(r.text(r.get(s, "itms0")));
    await r.write("</a>");
    if (r.truth((await r.module("itemmain", "get_item_allow_find_and_use")))) {
      await r.write("<input type=\"button\" class=\"cmdbutton\" style=\"float:right;\" ");
      if (r.truth((await r.module("itemmain", "is_equipable", r.get(s, "itmk0"))))) {
        await r.write("value=\"装备\"");
      } else {
        await r.write("value=\"使用\"");
      }
      await r.write(" onclick=\"$('mode').value='command';$('command').value='itm0';postCmd('gamecmd','command.php');this.disabled=true;\">");
    }
    await r.write("<br><br>\r\n<br><br>");
    r.assign(r.slot(s, ["hotkeys"]), r.array([[r.APPEND, ""], [r.APPEND, "a"], [r.APPEND, "s"], [r.APPEND, "d"], [r.APPEND, "q"], [r.APPEND, "w"], [r.APPEND, "e"]]));
    r.assign(r.slot(s, ["hotkeysu"]), r.array([[r.APPEND, ""], [r.APPEND, "A"], [r.APPEND, "S"], [r.APPEND, "D"], [r.APPEND, "Q"], [r.APPEND, "W"], [r.APPEND, "E"]]));
    r.assign(r.slot(s, ["loopn"]), r.array([[r.APPEND, 1], [r.APPEND, 2], [r.APPEND, 3], [r.APPEND, 4], [r.APPEND, 5], [r.APPEND, 6]]));
    await r.write("<ul style=\"padding-left:24px;\">");
    if (r.truth((await r.call("is_array", r.get(s, "loopn"))))) {
      {
        const a0 = r.copy(r.get(s, "loopn"));
        for (const [k0, v0] of r.entries(a0)) {
          r.assign(r.slot(s, ["n"]), v0);
          if (r.truth((!r.truth((!r.truth(r.get(s, (r.text("itms") + r.text(r.get(s, "n")))))))))) {
            await r.write("<li>\r\n<input type=\"button\" class=\"dropbutton\" id=\"");
            await r.write(r.text(r.get(r.get(s, "hotkeys"), r.get(s, "n"))));
            await r.write("\" value=\"[");
            await r.write(r.text(r.get(r.get(s, "hotkeysu"), r.get(s, "n"))));
            await r.write("]丢弃\" \r\nonclick=\"$('command').value='swapitm");
            await r.write(r.text(r.get(s, "n")));
            await r.write("';postCmd('gamecmd','command.php');this.disabled=true;\"> \r\n<a onclick=\"$('");
            await r.write(r.text(r.get(r.get(s, "hotkeys"), r.get(s, "n"))));
            await r.write("').click();\">");
            await r.write(r.text(r.get(r.get(s, "item_words"), (r.text((r.text("itm") + r.text(r.get(s, "n")))) + r.text("_words")))));
            await r.write("/");
            await r.write(r.text(r.get(s, (r.text("itme") + r.text(r.get(s, "n"))))));
            await r.write("/");
            await r.write(r.text(r.get(s, (r.text("itms") + r.text(r.get(s, "n"))))));
            await r.write("</a>\r\n</li>");
          }
        }
      }
    }
    await r.write("</ul>");
  } else {
    await r.write("<input type=\"radio\" name=\"command\" id=\"dropitm0\" value=\"dropitm0\" checked><a onclick=\"sl('dropitm0'); href='javascript:void(0);'\">");
    await r.write(r.text(r.get(s, "itm0")));
    await r.write("/");
    await r.write(r.text(r.get(s, "itme0")));
    await r.write("/");
    await r.write(r.text(r.get(s, "itms0")));
    await r.write("</a><br><br>");
    r.assign(r.slot(s, ["loopn"]), r.array([[r.APPEND, 1], [r.APPEND, 2], [r.APPEND, 3], [r.APPEND, 4], [r.APPEND, 5], [r.APPEND, 6]]));
    if (r.truth((await r.call("is_array", r.get(s, "loopn"))))) {
      {
        const a1 = r.copy(r.get(s, "loopn"));
        for (const [k1, v1] of r.entries(a1)) {
          r.assign(r.slot(s, ["n"]), v1);
          await r.write("<input type=\"radio\" name=\"command\" id=\"itm");
          await r.write(r.text(r.get(s, "n")));
          await r.write("\" value=\"swapitm");
          await r.write(r.text(r.get(s, "n")));
          await r.write("\"><a onclick=\"sl('itm");
          await r.write(r.text(r.get(s, "n")));
          await r.write("'); href='javascript:void(0);'\">");
          await r.write(r.text(r.get(s, (r.text("itm") + r.text(r.get(s, "n"))))));
          await r.write("/");
          await r.write(r.text(r.get(s, (r.text("itme") + r.text(r.get(s, "n"))))));
          await r.write("/");
          await r.write(r.text(r.get(s, (r.text("itms") + r.text(r.get(s, "n"))))));
          await r.write("</a><br>");
        }
      }
    }
    await r.write("</ul>\r\n<br><br>\r\n<input type=\"button\" class=\"cmdbutton\" id=\"z\" value=\"[Z]确定\" onclick=\"postCmd('gamecmd','command.php');this.disabled=true;\">");
  }
return 1;
}
