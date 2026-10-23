// Generated from include/modules/base/itemmain/itmcommand_subpage.2.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  await r.write("<div class=\"cmd_row\">\r\n<div class=\"cmd_positioner common_cmd\" style=\"width:167px\">\r\n<input type=\"button\" id=\"pack_cmd_tag_eqp\" class=\"cmd_button common_cmd glow_buttons white\" value=\"武器装备\" \r\nonclick=\"jQuery('#pack_cmd_tag_itm').removeClass('yellow forbidden').addClass('white');jQuery(this).removeClass('white').addClass('yellow forbidden');jQuery('#pack_cmd_eqp').css('display','block');jQuery('#pack_cmd_itm').css('display','none');\">\r\n</div><div class=\"cmd_positioner common_cmd\" style=\"width:167px\">\r\n<input type=\"button\" id=\"pack_cmd_tag_itm\" class=\"cmd_button common_cmd glow_buttons yellow forbidden\" value=\"包裹道具\" \r\nonclick=\"jQuery('#pack_cmd_tag_eqp').removeClass('yellow forbidden').addClass('white');jQuery(this).removeClass('white').addClass('yellow forbidden');jQuery('#pack_cmd_itm').css('display','block');jQuery('#pack_cmd_eqp').css('display','none');\">\r\n</div>\r\n</div><div id=\"pack_cmd_eqp\" style=\"display:none;height:320px\">\r\n<div style=\"height:260px\">");
  if (r.truth((await r.call("is_array", r.array([[r.APPEND, "wep"], [r.APPEND, "arb"], [r.APPEND, "arh"], [r.APPEND, "ara"], [r.APPEND, "arf"], [r.APPEND, "art"]]))))) {
    {
      const a0 = r.copy(r.array([[r.APPEND, "wep"], [r.APPEND, "arb"], [r.APPEND, "arh"], [r.APPEND, "ara"], [r.APPEND, "arf"], [r.APPEND, "art"]]));
      for (const [k0, v0] of r.entries(a0)) {
        r.assign(r.slot(s, ["packv"]), v0);
        await r.write("<div class=\"pack_row\">");
        if (r.truth((r.truth((r.truth((!r.equal(r.get(s, (r.text(r.get(s, "packv")) + r.text("k"))), "WN"))) && r.truth((!r.equal(r.get(s, (r.text(r.get(s, "packv")) + r.text("k"))), "DN"))))) && r.truth(r.get(s, (r.text(r.get(s, "packv")) + r.text("s"))))))) {
          await r.write("<div class=\"cmd_positioner pack_button pack_off\">\r\n<div class=\"pack_button bg\"></div>\r\n<input type=\"button\" class=\"pack_button glow_buttons white\" title=\"卸下\" \r\nonclick=\"$('mode').value='itemmain';$('command').value='off");
          await r.write(r.text(r.get(s, "packv")));
          await r.write("';postCmd('gamecmd','command.php',this);\">\r\n</div><div class=\"pack_cell_eqp glow_buttons forbidden white\">");
          await r.write(r.text(r.get(r.get(s, "tpldata"), (r.text(r.get(s, "packv")) + r.text("_words")))));
          await r.write(" / ");
          await r.write(r.text(r.get(r.get(s, "tpldata"), (r.text(r.get(s, "packv")) + r.text("e_words")))));
          await r.write(" / ");
          await r.write(r.text(r.get(r.get(s, "tpldata"), (r.text(r.get(s, "packv")) + r.text("s_words")))));
          await r.write("</div><div class=\"cmd_positioner pack_button pack_drop\">\r\n<div class=\"pack_button bg\"></div>\r\n<input type=\"button\" class=\"pack_button glow_buttons red\" title=\"丢弃\" \r\nonclick=\"$('mode').value='itemmain';$('command').value='drop");
          await r.write(r.text(r.get(s, "packv")));
          await r.write("';postCmd('gamecmd','command.php',this);\">\r\n</div>");
        } else {
          await r.write("<div class=\"pack_cell_eqp glow_buttons forbidden darkgrey\" style=\"width:335px\">");
          if (r.truth(r.equal("wep", r.get(s, "packv")))) {
            await r.write("无武器");
          } else {
            if (r.truth(r.equal("arb", r.get(s, "packv")))) {
              await r.write("无身体防具");
            } else {
              if (r.truth(r.equal("arh", r.get(s, "packv")))) {
                await r.write("无头部防具");
              } else {
                if (r.truth(r.equal("ara", r.get(s, "packv")))) {
                  await r.write("无手臂防具");
                } else {
                  if (r.truth(r.equal("arf", r.get(s, "packv")))) {
                    await r.write("无腿部防具");
                  } else {
                    if (r.truth(r.equal("art", r.get(s, "packv")))) {
                      await r.write("无饰物");
                    } else {
                      await r.write("无");
                    }
                  }
                }
              }
            }
          }
          await r.write("</div>");
        }
        await r.write("</div>");
      }
    }
  }
  await r.write("</div><div class=\"cmd_row\" style=\"margin-top:10px;\">");
  if (r.truth((await r.call("defined", "MOD_WEPCHANGE")))) {
    (await r.include(r.template("MOD_WEPCHANGE_WEPCHANGE_PROFILE"), s));
  }
  if (r.truth((await r.call("defined", "MOD_DUALWEP")))) {
    (await r.include(r.template("MOD_DUALWEP_DUALWEP_ATT_METHOD_PROFILE"), s));
  }
  await r.write("</div>\r\n</div><div id=\"pack_cmd_itm\" style=\"height:320px\">\r\n<div style=\"height:260px\">");
  if (r.truth((await r.call("is_array", (await r.call("range", 1, 6)))))) {
    {
      const a1 = r.copy((await r.call("range", 1, 6)));
      for (const [k1, v1] of r.entries(a1)) {
        r.assign(r.slot(s, ["packi"]), v1);
        await r.write("<div class=\"pack_row\">");
        if (r.truth(r.get(s, (r.text("itms") + r.text(r.get(s, "packi")))))) {
          await r.write("<div class=\"cmd_positioner pack_button pack_switch\">\r\n<div class=\"pack_button bg\"></div>\r\n<input type=\"button\" id=\"pack_switch_");
          await r.write(r.text(r.get(s, "packi")));
          await r.write("\" class=\"pack_button glow_buttons white\" value=\"\"\r\nonclick=\"pack_switch_set(");
          await r.write(r.text(r.get(s, "packi")));
          await r.write(");\">\r\n</div><div class=\"cmd_positioner pack_cell_eqp\">");
          r.assign(r.slot(s, ["tmp_hotkey"]), (await r.call("substr", r.get(r.get(s, "item_hotkey_id_list"), r.get(s, "packi")), 0, 1)));
          await r.write("<span class=\"hotkey_hint\">[");
          await r.write(r.text((await r.call("strtoupper", r.get(s, "tmp_hotkey")))));
          await r.write("]</span>\r\n<span>");
          await r.write(r.text(r.get(r.get(s, "tpldata"), (r.text((r.text("itm") + r.text(r.get(s, "packi")))) + r.text("_words_short")))));
          await r.write(" / ");
          await r.write(r.text(r.get(r.get(s, "tpldata"), (r.text((r.text("itme") + r.text(r.get(s, "packi")))) + r.text("_words")))));
          await r.write(" / ");
          await r.write(r.text(r.get(r.get(s, "tpldata"), (r.text((r.text("itms") + r.text(r.get(s, "packi")))) + r.text("_words")))));
          await r.write("</span>\r\n<input type=\"button\" class=\"pack_cell_eqp glow_buttons white\" id=\"hotkey2_");
          await r.write(r.text(r.get(s, "tmp_hotkey")));
          await r.write("\" value=\"\" \r\nonclick=\"$('mode').value='command';$('command').value='itm");
          await r.write(r.text(r.get(s, "packi")));
          await r.write("';postCmd('gamecmd','command.php',this);\">\r\n</div><div class=\"cmd_positioner pack_button pack_drop\">\r\n<div class=\"pack_button bg\"></div>\r\n<input type=\"button\" class=\"pack_button glow_buttons red\" title=\"丢弃\" \r\nonclick=\"$('mode').value='itemmain';$('command').value='dropitm");
          await r.write(r.text(r.get(s, "packi")));
          await r.write("';postCmd('gamecmd','command.php',this);\">\r\n</div>");
        } else {
          await r.write("<div class=\"pack_cell_eqp glow_buttons forbidden darkgrey\" style=\"width:335px\">无道具</div>");
        }
        await r.write("</div>");
      }
    }
  }
  await r.write("</div><div class=\"cmd_row\" style=\"margin-top:10px;\">\r\n<div class=\"cmd_positioner common_cmd\" style=\"width:80px\">\r\n<input type=\"button\" id=\"pack_cmd_switch\" class=\"cmd_button common_cmd glow_buttons white\" value=\"交换\" \r\nonclick=\"pack_send_cmd_prepare('switch');$('mode').value='itemmain';$('command').value='itemmove';postCmd('gamecmd','command.php',this);\" disabled>\r\n</div><div class=\"cmd_positioner common_cmd\" style=\"width:80px\">\r\n<input type=\"button\" id=\"pack_cmd_merge\" class=\"cmd_button common_cmd glow_buttons white\" value=\"合并\" \r\nonclick=\"pack_send_cmd_prepare('merge');$('mode').value='itemmain';$('command').value='itemmerge';postCmd('gamecmd','command.php',this);\" disabled>\r\n</div>");
  if (r.truth((await r.call("defined", "MOD_ITEMMIX")))) {
    (await r.include(r.template("MOD_ITEMMIX_ITEMMIX_CMD"), s));
  }
  await r.write("</div>\r\n</div>");
return 1;
}
