// Generated from templates/2/command.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  await r.write("<input type=\"hidden\" id=\"mode\" name=\"mode\" value=\"command\">\r\n<input type=\"hidden\" id=\"command\" name=\"command\" value=\"menu\">\r\n<input type=\"hidden\" id=\"subcmd\" name=\"subcmd\" value=\"\">\r\n\r\n<div class=\"cmd_tag_container\">\r\n<div type=\"button\" id=\"common_cmd_tag\" class=\"cmd_tag choosed\" onclick=\"tag_choose('common')\"><img src=\"img/tag_common.png\"> 基本</div><div type=\"button\" id=\"item_cmd_tag\" class=\"cmd_tag\" onclick=\"tag_choose('item')\"><img src=\"img/tag_item.png\"> 道具</div><div type=\"button\" id=\"special_cmd_tag\" class=\"cmd_tag\" style=\"margin-right:0;\" onclick=\"tag_choose('special')\"><img src=\"img/tag_special.png\"> 特殊</div>\r\n</div>\r\n<hr class=\"cmd_tag\">\r\n<div id=\"common_cmd_subpage\" class=\"cmd_subpage\">\r\n<!--探索移动按钮-->");
  if (r.truth((await r.call("defined", "MOD_EXPLORE")))) {
    (await r.include(r.template("MOD_EXPLORE_EXPLORE"), s));
  }
  await r.write("<!--视野-->");
  if (r.truth((await r.call("defined", "MOD_SEARCHMEMORY")))) {
    (await r.include(r.template("MOD_SEARCHMEMORY_SMEMORYLIST"), s));
  }
  await r.write("<!--道具按钮-->\r\n<div class=\"cmd_row\">");
  if (r.truth((await r.call("is_array", r.get(s, "item_hotkey_id_list"))))) {
    {
      const a0 = r.copy(r.get(s, "item_hotkey_id_list"));
      for (const [k0, v0] of r.entries(a0)) {
      r.assign(r.slot(s, ["ii"]), k0);
        r.assign(r.slot(s, ["ihotkey"]), v0);
        await r.write("<div class=\"cmd_positioner itm_cmd\">");
        if (r.truth(r.get(s, (r.text("itms") + r.text(r.get(s, "ii")))))) {
          r.assign(r.slot(s, ["tmp_itmname"]), r.get(r.get(s, "tpldata"), (r.text((r.text("itm") + r.text(r.get(s, "ii")))) + r.text("_words_short"))));
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
          await r.write("\" class=\"cmd_button itm_cmd_button glow_buttons white\" \r\nvalue=\"");
          if (r.truth((r.truth((!r.truth((!r.truth(r.get(s, (r.text("itmk") + r.text(r.get(s, "ii"))))))))) && r.truth((await r.call("in_array", r.get(r.get(s, (r.text("itmk") + r.text(r.get(s, "ii")))), 0), r.array([[r.APPEND, "W"], [r.APPEND, "D"], [r.APPEND, "A"]]))))))) {
            await r.write("装备");
          } else {
            await r.write("使用");
          }
          await r.write("\" \r\ntitle=\"");
          if (r.truth((!r.equal(r.get(s, "tmp_itmname"), r.get(s, (r.text("itm") + r.text(r.get(s, "ii")))))))) {
            await r.write(r.text((r.text(r.get(s, (r.text("itm") + r.text(r.get(s, "ii"))))) + r.text("<br>"))));
          }
          await r.write(r.text(r.get(r.get(s, "tpldata"), (r.text((r.text("itm") + r.text(r.get(s, "ii")))) + r.text("_itmuse_desc")))));
          await r.write("\" \r\nonclick=\"$('mode').value='command';$('command').value='itm");
          await r.write(r.text(r.get(s, "ii")));
          await r.write("';postCmd('gamecmd','command.php',this);\">");
        } else {
          await r.write("<input type=\"button\" class=\"cmd_button itm_cmd_button glow_buttons grey forbidden\" value=\"无道具\">");
        }
        await r.write("</div>");
        if (r.truth(r.equal(r.modulo(r.get(s, "ii"), 3), 0))) {
          await r.write("<br>");
        }
      }
    }
  }
  await r.write("</div><div class=\"cmd_row\">");
  if (r.truth((await r.call("defined", "MOD_ITEMSHOP")))) {
    (await r.include(r.template("MOD_ITEMSHOP_ITEMSHOP_CMD"), s));
  }
  if (r.truth((await r.call("defined", "MOD_CLUBBASE")))) {
    (await r.include(r.template("MOD_CLUBBASE_SKILLPAGE_PROFILE"), s));
  }
  await r.write("</div>\r\n\r\n\r\n</div><div id=\"item_cmd_subpage\" class=\"cmd_subpage\" style=\"display:none\">");
  if (r.truth((await r.call("defined", "MOD_ITEMMAIN")))) {
    (await r.include(r.template("MOD_ITEMMAIN_ITMCOMMAND_SUBPAGE"), s));
  }
  await r.write("</div><div id=\"special_cmd_subpage\" class=\"cmd_subpage\" style=\"display:none\">");
  if (r.truth((await r.call("defined", "MOD_REST")))) {
    (await r.include(r.template("MOD_REST_REST_CMD"), s));
  }
  if (r.truth((await r.call("defined", "MOD_TEAM")))) {
    (await r.include(r.template("MOD_TEAM_TEAM_COMMAND"), s));
  }
  if (r.truth((await r.call("defined", "MOD_SONG")))) {
    (await r.include(r.template("MOD_SONG_SONG_PROFILE"), s));
  }
  await r.write("<div class=\"cmd_row\">");
  if (r.truth((await r.call("defined", "MOD_CLUBBASE")))) {
    (await r.include(r.template("MOD_CLUBBASE_PROFILESKILLPAGE"), s));
  }
  await r.write("</div>\r\n</div>\r\n");
return 1;
}
