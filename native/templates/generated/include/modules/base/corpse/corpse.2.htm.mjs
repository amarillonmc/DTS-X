// Generated from include/modules/base/corpse/corpse.2.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  if (r.truth((r.truth((!r.equal(r.get(s, "gametype"), 2))) || r.truth((r.compare(r.get(s, "w_type"), 0) > 0))))) {
    await r.write("<input type=\"hidden\" id=\"mode\" name=\"mode\" value=\"corpse\">\r\n<input type=\"hidden\" id=\"command\" name=\"command\" value=\"menu\">");
    r.assign(r.slot(s, ["corpse_row_num"]), r.add(1, (r.truth(r.get(s, "w_money")) ? 1 : 0)));
    r.assign(r.slot(s, ["corpse_extra_height_lvl"]), 0);
    await r.write("<div class=\"cmd_row\">");
    if (r.truth(r.get(s, "w_can_destroy"))) {
      await r.write("<div class=\"cmd_positioner corpse_cmd\" style=\"width:165px;\">\r\n<input type=\"button\" class=\"corpse_cmd glow_buttons ");
      if (r.truth(r.equal(r.get(s, "default_selection"), "destroy"))) {
        await r.write("red");
      } else {
        await r.write("white");
      }
      await r.write("\" style=\"width:165px;\"  ");
      if (r.truth(r.equal(r.get(s, "default_selection"), "destroy"))) {
        await r.write("id=\"z\"");
      }
      await r.write(" value=\"销毁尸体\" \r\nonclick=\"$('command').value='destroy';postCmd('gamecmd','command.php',this);\">\r\n</div>");
    }
    await r.write("<div class=\"cmd_positioner corpse_cmd\" ");
    if (r.truth(r.get(s, "w_can_destroy"))) {
      await r.write("style=\"width:165px;\"");
    }
    await r.write(">\r\n<input type=\"button\" class=\"corpse_cmd glow_buttons yellow\" ");
    if (r.truth(r.get(s, "w_can_destroy"))) {
      await r.write("style=\"width:165px;\"");
    }
    await r.write(" id=\"x\" value=\"返回\" onclick=\"postCmd('gamecmd','command.php',this);\">\r\n</div>");
    if (r.truth((r.truth(r.get(s, "w_money")) && r.truth(r.get(s, "w_can_pick_money"))))) {
      await r.write("<div class=\"cmd_positioner corpse_cmd\">\r\n<input type=\"button\" class=\"corpse_cmd glow_buttons ");
      if (r.truth(r.equal(r.get(s, "default_selection"), "money"))) {
        await r.write("cyan");
      } else {
        await r.write("white");
      }
      await r.write("\" ");
      if (r.truth(r.equal(r.get(s, "default_selection"), "money"))) {
        await r.write("id=\"z\"");
      }
      await r.write(" value=\"");
      await r.write(r.text(r.get(s, "w_money")));
      await r.write(" 元\" \r\nonclick=\"$('command').value='money';postCmd('gamecmd','command.php',this);\">\r\n</div>");
    } else {
      if (r.truth(r.get(s, "w_money"))) {
        r.imports(s, "corpse");
        await r.write("<div class=\"cmd_positioner corpse_cmd\">\r\n<input type=\"button\" class=\"corpse_cmd glow_buttons grey forbidden\" value=\"");
        await r.write(r.text(r.get(s, "w_money")));
        await r.write(" 元 ");
        await r.write(r.text(r.get(s, "cannot_pick_notice")));
        await r.write("\">\r\n</div>");
      }
    }
    if (r.truth((await r.call("is_array", r.array([[r.APPEND, "wep"], [r.APPEND, "arb"], [r.APPEND, "arh"], [r.APPEND, "ara"], [r.APPEND, "arf"], [r.APPEND, "art"]]))))) {
      {
        const a0 = r.copy(r.array([[r.APPEND, "wep"], [r.APPEND, "arb"], [r.APPEND, "arh"], [r.APPEND, "ara"], [r.APPEND, "arf"], [r.APPEND, "art"]]));
        for (const [k0, v0] of r.entries(a0)) {
          r.assign(r.slot(s, ["eqpv"]), v0);
          if (r.truth((r.truth(r.get(s, (r.text((r.text("w_") + r.text(r.get(s, "eqpv")))) + r.text("s")))) && r.truth((!r.equal((await r.call("substr", r.get(s, (r.text((r.text("w_") + r.text(r.get(s, "eqpv")))) + r.text("k"))), 1, 1)), "N")))))) {
            r.post(r.slot(s, ["corpse_row_num"]), 1);
            r.assign(r.slot(s, ["tmp_eqpname"]), (await r.module("itemmain", "parse_itmname_words", r.get(s, (r.text("w_") + r.text(r.get(s, "eqpv")))), 1)));
            r.assign(r.slot(s, ["tmp_eqpe"]), (await r.module("itemmain", "parse_itmnum_words", r.get(s, (r.text((r.text("w_") + r.text(r.get(s, "eqpv")))) + r.text("e"))), 1)));
            r.assign(r.slot(s, ["tmp_eqps"]), (await r.module("itemmain", "parse_itmnum_words", r.get(s, (r.text((r.text("w_") + r.text(r.get(s, "eqpv")))) + r.text("s"))), 1)));
            r.assign(r.slot(s, ["tmp_eqpsk"]), (await r.module("itemmain", "parse_itmsk_words", r.get(s, (r.text((r.text("w_") + r.text(r.get(s, "eqpv")))) + r.text("sk"))), 1, 1)));
            r.assign(r.slot(s, ["tmp_hint"]), (r.text("<span class='b'>") + r.text(r.get(s, "tmp_eqpname")) + r.text("</span><span class='grey'> | </span>") + r.text(r.get(s, (r.text((r.text("w_") + r.text(r.get(s, "eqpv")))) + r.text("k_words")))) + r.text("<span class='grey'> | </span>") + r.text(r.get(s, "tmp_eqpe")) + r.text("<span class='grey'> | </span>") + r.text(r.get(s, "tmp_eqps"))));
            if (r.truth((r.truth(r.get(s, (r.text((r.text("w_") + r.text(r.get(s, "eqpv")))) + r.text("sk_words")))) && r.truth((!r.equal("--", r.get(s, (r.text((r.text("w_") + r.text(r.get(s, "eqpv")))) + r.text("sk_words"))))))))) {
              r.update(r.slot(s, ["tmp_hint"]), "concat", (r.text("<span class='grey'> | </span><span>") + r.text(r.get(s, (r.text((r.text("w_") + r.text(r.get(s, "eqpv")))) + r.text("sk_words")))) + r.text("</span>")));
            }
            r.assign(r.slot(s, ["tmp_lnum"]), (await r.module("logger", "log_linenum_counter", r.get(s, "tmp_hint"), 50)));
            if (r.truth((r.compare(r.get(s, "tmp_lnum"), 0) > 0))) {
              r.post(r.slot(s, ["corpse_extra_height_lvl"]), 1);
            }
            await r.write("<div class=\"cmd_positioner corpse_cmd multi_cont\"");
            if (r.truth((r.compare(r.get(s, "tmp_lnum"), 0) > 0))) {
              await r.write(" style=\"height:50px\"");
            }
            await r.write(">\r\n<div class=\"corpse_info\">\r");
            await r.write(r.text(r.get(s, "tmp_hint")));
            await r.write("</div>\r\n<input type=\"button\" class=\"corpse_cmd glow_buttons white\" style=\"position:absolute;\" value=\"\" \r\nonclick=\"$('command').value='");
            await r.write(r.text(r.get(s, "eqpv")));
            await r.write("';postCmd('gamecmd','command.php',this);\">\r\n</div>");
          }
        }
      }
    }
    if (r.truth((await r.call("is_array", (await r.call("range", 0, 6)))))) {
      {
        const a1 = r.copy((await r.call("range", 0, 6)));
        for (const [k1, v1] of r.entries(a1)) {
          r.assign(r.slot(s, ["itmi"]), v1);
          if (r.truth(r.get(s, (r.text("w_itms") + r.text(r.get(s, "itmi")))))) {
            r.post(r.slot(s, ["corpse_row_num"]), 1);
            r.assign(r.slot(s, ["tmp_itmname"]), (await r.module("itemmain", "parse_itmname_words", r.get(s, (r.text("w_itm") + r.text(r.get(s, "itmi")))), 1)));
            r.assign(r.slot(s, ["tmp_itme"]), (await r.module("itemmain", "parse_itmnum_words", r.get(s, (r.text("w_itme") + r.text(r.get(s, "itmi")))), 1)));
            r.assign(r.slot(s, ["tmp_itms"]), (await r.module("itemmain", "parse_itmnum_words", r.get(s, (r.text("w_itms") + r.text(r.get(s, "itmi")))), 1)));
            r.assign(r.slot(s, ["tmp_itmsk"]), (await r.module("itemmain", "parse_itmsk_words", r.get(s, (r.text("w_itmsk") + r.text(r.get(s, "itmi")))), 1, 1)));
            r.assign(r.slot(s, ["tmp_hint"]), (r.text("<span class='b'>") + r.text(r.get(s, "tmp_itmname")) + r.text("</span><span class='grey'> | </span>") + r.text(r.get(s, (r.text((r.text("w_itmk") + r.text(r.get(s, "itmi")))) + r.text("_words")))) + r.text("<span class='grey'> | </span>") + r.text(r.get(s, "tmp_eqpe")) + r.text("<span class='grey'> | </span>") + r.text(r.get(s, "tmp_eqps"))));
            if (r.truth((r.truth(r.get(s, (r.text((r.text("w_itmsk") + r.text(r.get(s, "itmi")))) + r.text("_words")))) && r.truth((!r.equal("--", r.get(s, (r.text((r.text("w_itmsk") + r.text(r.get(s, "itmi")))) + r.text("_words"))))))))) {
              r.update(r.slot(s, ["tmp_hint"]), "concat", (r.text("<span class='grey'> | </span><span>") + r.text(r.get(s, (r.text((r.text("w_itmsk") + r.text(r.get(s, "itmi")))) + r.text("_words")))) + r.text("</span>")));
            }
            r.assign(r.slot(s, ["tmp_lnum"]), (await r.module("logger", "log_linenum_counter", r.get(s, "tmp_hint"), 50)));
            if (r.truth((r.compare(r.get(s, "tmp_lnum"), 0) > 0))) {
              r.post(r.slot(s, ["corpse_extra_height_lvl"]), 1);
            }
            await r.write("<div class=\"cmd_positioner corpse_cmd multi_cont\"");
            if (r.truth((r.compare(r.get(s, "tmp_lnum"), 0) > 0))) {
              await r.write(" style=\"height:50px\"");
            }
            await r.write(">\r\n<div class=\"corpse_info\">\r");
            await r.write(r.text(r.get(s, "tmp_hint")));
            await r.write("</div>\r\n<input type=\"button\" class=\"corpse_cmd glow_buttons white\" style=\"position:absolute;\" value=\"\" \r\nonclick=\"$('command').value='itm");
            await r.write(r.text(r.get(s, "itmi")));
            await r.write("';postCmd('gamecmd','command.php',this);\">\r\n</div>");
          }
        }
      }
    }
    await r.write("</div>");
    r.assign(r.slot(s, ["uip", "display", "log_height"]), (await r.call("max", 40, r.subtract(r.subtract(290, (await r.call("max", 0, r.multiply(40, r.subtract(r.get(s, "corpse_row_num"), 8))))), (await r.call("max", 0, r.subtract(r.multiply(10, r.get(s, "corpse_extra_height_lvl")), (await r.call("max", 0, r.multiply(40, r.subtract(8, r.get(s, "corpse_row_num"))))))))))));
    r.assign(r.slot(s, ["tmp_log_lnum"]), (await r.module("logger", "log_linenum_counter")));
    r.assign(r.slot(s, ["tmp_log_detail_height"]), (await r.call("min", 640, r.add(r.multiply(r.get(s, "tmp_log_lnum"), 15), 10))));
    if (r.truth((!r.truth(r.get(s, "command"))))) {
      await r.write("<!--game页面直接载入的拾取界面，直接写js-->\r\n<img style=\"display:none;\" type=\"hidden\" src=\"img/blank.png\" \r\nonload=\"jQuery('#log').css('height','");
      await r.write(r.text(r.get(r.get(r.get(s, "uip"), "display"), "log_height")));
      await r.write("');\">");
    }
    if (r.truth((r.compare(r.get(s, "tmp_log_detail_height"), r.get(r.get(r.get(s, "uip"), "display"), "log_height")) > 0))) {
      await r.write("<!--伸缩log效果-->\r\n<img style=\"display:none;\" type=\"hidden\" src=\"img/blank.png\" \r\nonload=\"log_hover_detail_init(");
      await r.write(r.text(r.get(s, "tmp_log_detail_height")));
      await r.write(");\">");
    }
  } else {
    (await r.include(r.template("MOD_SKILL475_CORPSEOPTION"), s));
  }
return 1;
}
