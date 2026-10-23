// Generated from include/modules/base/itemmain/itemfind.2.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  await r.write("<input type=\"hidden\" id=\"mode\" name=\"mode\" value=\"itemmain\">\r\n<input type=\"hidden\" id=\"command\" name=\"command\" value=\"itemget\">");
  r.imports(s, "itemmain");
  r.assign(r.slot(s, ["blanki"]), (await r.module("itemmain", "get_pack_blank")));
  r.update(r.slot(s, ["tpldata"]), "add", (await r.module("itemmain", "parse_item_words", r.get(s, "sdata"), 0, 1)));
  await r.write("<div class=\"cmd_row\">");
  if (r.truth((r.compare(r.get(s, "blanki"), 0) > 0))) {
    await r.write("<div class=\"cmd_positioner explore_cmd\">\r\n<div class=\"explore_info grey\">");
    if (r.truth((r.compare(r.get(s, "blanki"), 0) > 0))) {
      await r.write("将放入包裹[");
      await r.write(r.text((await r.call("strtoupper", (await r.call("substr", r.get(r.get(s, "item_hotkey_id_list"), r.get(s, "blanki")), 0, 1))))));
      await r.write("]位");
    } else {
      await r.write("将与包裹[E]位道具交换<!--暂时不用-->");
    }
    await r.write("</div>\r\n<input type=\"button\" class=\"cmd_button explore_cmd glow_buttons cyan b\" style=\"padding-bottom:20px\" id=\"z\" value=\"拾取\" \r\nonclick=\"");
    if (r.truth((!r.truth(r.get(s, "blanki"))))) {
      await r.write("$('command').value='swapitm6';");
    }
    await r.write("postCmd('gamecmd','command.php',this,1);\">\r\n</div>");
  }
  await r.write("<div class=\"cmd_positioner explore_cmd");
  if (r.truth((!r.truth(r.get(s, "blanki"))))) {
    await r.write(" zx_cmd");
  }
  await r.write("\">\r\n<div class=\"explore_info grey\">");
  await r.write(r.text((await r.module("itemmain", "parse_itmname_words", r.get(s, "itm0"), 1, (r.truth((!r.truth(r.get(s, "blanki")))) ? 13 : 10)))));
  await r.write(r.text(r.get(s, "itemmain_drophint")));
  await r.write("</div>\r\n<input type=\"button\" class=\"cmd_button explore_cmd glow_buttons red b\" style=\"padding-bottom:20px\" ");
  if (r.truth((!r.truth(r.get(s, "blanki"))))) {
    await r.write("id=\"zx\"");
  } else {
    await r.write("id=\"x\"");
  }
  await r.write(" value=\"丢弃\" onclick=\"$('command').value='dropitm0';postCmd('gamecmd','command.php',this,1);\">\r\n</div>\r\n</div><div class=\"cmd_row\">");
  if (r.truth((await r.call("is_array", r.get(s, "item_hotkey_id_list"))))) {
    {
      const a0 = r.copy(r.get(s, "item_hotkey_id_list"));
      for (const [k0, v0] of r.entries(a0)) {
      r.assign(r.slot(s, ["ii"]), k0);
        r.assign(r.slot(s, ["ihotkey"]), v0);
        await r.write("<div class=\"cmd_positioner itm_cmd\">");
        if (r.truth(r.get(s, (r.text("itms") + r.text(r.get(s, "ii")))))) {
          r.assign(r.slot(s, ["tmp_itmname"]), (await r.module("itemmain", "parse_itmname_words", r.get(s, (r.text("itm") + r.text(r.get(s, "ii")))), 1, 15)));
          await r.write("<div class=\"itm_cmd_info\">\r\n<div class=\"grey b\">");
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
          await r.write("\" class=\"cmd_button itm_cmd_button glow_buttons yellow b\" value=\"替换\" \r\nonclick=\"$('command').value='swapitm");
          await r.write(r.text(r.get(s, "ii")));
          await r.write("';postCmd('gamecmd','command.php',this);\">");
        } else {
          await r.write("<div class=\"itm_cmd_info\">\r\n<div class=\"grey\">\r\n包裹空位[");
          await r.write(r.text((await r.call("strtoupper", (await r.call("substr", r.get(r.get(s, "item_hotkey_id_list"), r.get(s, "ii")), 0, 1))))));
          await r.write("]\r\n</div>\r\n</div>\r\n<input type=\"button\" id=\"");
          await r.write(r.text(r.get(s, "ihotkey")));
          await r.write("\" class=\"cmd_button itm_cmd_button glow_buttons cyan b\" value=\"拾取\" \r\nonclick=\"$('command').value='swapitm");
          await r.write(r.text(r.get(s, "ii")));
          await r.write("';postCmd('gamecmd','command.php',this);\">");
        }
        await r.write("</div>");
        if (r.truth(r.equal(r.modulo(r.get(s, "ii"), 3), 0))) {
          await r.write("<br>");
        }
      }
    }
  }
  await r.write("</div>");
  r.assign(r.slot(s, ["uip", "display", "log_height"]), 242);
  if (r.truth((!r.truth(r.get(s, "command"))))) {
    await r.write("<!--game页面直接载入的拾取界面，直接写js-->\r\n<img style=\"display:none;\" type=\"hidden\" src=\"img/blank.png\" onload=\"jQuery('#log').css('height','242px');\">");
  }
return 1;
}
