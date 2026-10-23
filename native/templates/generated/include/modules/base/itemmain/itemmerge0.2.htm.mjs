// Generated from include/modules/base/itemmain/itemmerge0.2.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  await r.write("<input type=\"hidden\" id=\"mode\" name=\"mode\" value=\"itemmain\">\r\n<input type=\"hidden\" id=\"command\" name=\"command\" value=\"itemmerge\">\r\n<input type=\"hidden\" name=\"merge1\" value=\"0\">\r\n<input type=\"hidden\" id=\"merge2\" name=\"merge2\" value=\"n\">");
  r.imports(s, "itemmain");
  r.assign(r.slot(s, ["blanki"]), (await r.module("itemmain", "get_pack_blank")));
  r.update(r.slot(s, ["tpldata"]), "add", (await r.module("itemmain", "parse_item_words", r.get(s, "sdata"), 0, 1)));
  await r.write("<div class=\"cmd_row\">\r\n<div class=\"cmd_positioner explore_cmd zx_cmd\">\r\n<div class=\"explore_info grey\">");
  if (r.truth((r.compare(r.get(s, "blanki"), 0) > 0))) {
    await r.write("将放入包裹[");
    await r.write(r.text((await r.call("strtoupper", (await r.call("substr", r.get(r.get(s, "item_hotkey_id_list"), r.get(s, "blanki")), 0, 1))))));
    await r.write("]位");
  } else {
    await r.write("包裹已满，需与包裹道具交换");
  }
  await r.write("</div>\r\n<input type=\"button\" class=\"cmd_button explore_cmd glow_buttons yellow b\" style=\"font-size:12pt;padding-bottom:20px;\" id=\"zx\" value=\"不合并\" \r\nonclick=\"postCmd('gamecmd','command.php',this);\">\r\n</div>\r\n</div><div class=\"cmd_row\">");
  if (r.truth((await r.call("is_array", r.get(s, "item_hotkey_id_list"))))) {
    {
      const a0 = r.copy(r.get(s, "item_hotkey_id_list"));
      for (const [k0, v0] of r.entries(a0)) {
      r.assign(r.slot(s, ["ii"]), k0);
        r.assign(r.slot(s, ["ihotkey"]), v0);
        await r.write("<div class=\"cmd_positioner itm_cmd\">");
        if (r.truth((r.truth(r.get(s, (r.text("itms") + r.text(r.get(s, "ii"))))) && r.truth((await r.call("in_array", r.get(s, "ii"), r.get(s, "sameitem"))))))) {
          r.assign(r.slot(s, ["tmp_itmname"]), (await r.module("itemmain", "parse_itmname_words", r.get(s, (r.text("itm") + r.text(r.get(s, "ii")))), 1, 15)));
          await r.write("<div class=\"itm_cmd_info\">\r\n<div class=\"itm_name\">");
          if (r.truth(r.equal(r.get(s, "tmp_itmname"), r.get(s, (r.text("itm") + r.text(r.get(s, "ii"))))))) {
            await r.write(r.text(r.get(s, (r.text("itm") + r.text(r.get(s, "ii"))))));
          } else {
            await r.write(r.text(r.get(s, "tmp_itmname")));
          }
          await r.write("</div><div class=\"grey\">");
          await r.write(r.text(r.get(r.get(s, "tpldata"), (r.text((r.text("itme") + r.text(r.get(s, "ii")))) + r.text("_words")))));
          await r.write(" / ");
          await r.write(r.text(r.get(r.get(s, "tpldata"), (r.text((r.text("itms") + r.text(r.get(s, "ii")))) + r.text("_words")))));
          await r.write("</div>\r\n</div>\r\n<input type=\"button\" id=\"");
          await r.write(r.text(r.get(s, "ihotkey")));
          await r.write("\" class=\"cmd_button itm_cmd_button glow_buttons white b\" value=\"合并\" \r\nonclick=\"$('merge2').value='");
          await r.write(r.text(r.get(s, "ii")));
          await r.write("';postCmd('gamecmd','command.php',this);\">");
        } else {
          if (r.truth(r.get(s, (r.text("itms") + r.text(r.get(s, "ii")))))) {
            await r.write("<input type=\"button\" class=\"cmd_button itm_cmd_button glow_buttons grey forbidden\" value=\"不可合并\">");
          } else {
            await r.write("<div class=\"itm_cmd_info\">\r\n<div class=\"grey\">\r\n包裹空位[");
            await r.write(r.text((await r.call("strtoupper", (await r.call("substr", r.get(r.get(s, "item_hotkey_id_list"), r.get(s, "ii")), 0, 1))))));
            await r.write("]\r\n</div>\r\n</div>\r\n<input type=\"button\" id=\"");
            await r.write(r.text(r.get(s, "ihotkey")));
            await r.write("\" class=\"cmd_button itm_cmd_button glow_buttons cyan b\" value=\"放入\" \r\nonclick=\"$('command').value='swapitm");
            await r.write(r.text(r.get(s, "ii")));
            await r.write("';postCmd('gamecmd','command.php',this);\">");
          }
        }
        await r.write("</div>");
        if (r.truth(r.equal(r.modulo(r.get(s, "ii"), 3), 0))) {
          await r.write("<br>");
        }
      }
    }
  }
  await r.write("</div>");
return 1;
}
