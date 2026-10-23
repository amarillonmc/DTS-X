// Generated from include/modules/extra/card/cardbase/card_frame.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  await r.write("<div ");
  if (r.truth((r.truth((!r.truth((!r.truth(r.get(s, "lockcard")))))) || r.truth((!r.truth((!r.truth(r.get(s, "unavailable"))))))))) {
    await r.write("class=\"lockcard\"");
  }
  await r.write(" style=\"position:relative;\">");
  if (r.truth((r.truth((!r.truth((!r.truth(r.get(s, "lockcard")))))) || r.truth((!r.truth((!r.truth(r.get(s, "unavailable"))))))))) {
    await r.write("<img class=\"card_locked_logo\" src=\"img/locked.png\" />");
  }
  if (r.truth((!r.truth((!r.truth(r.get(s, "card_achieved"))))))) {
    await r.write("<img class=\"card_achieved\" src=\"img/card_achieved.png\" />");
  }
  if (r.truth((!r.truth((!r.truth(r.get(s, "nownew"))))))) {
    if (r.truth(r.equal(1, r.get(s, "nownew")))) {
      await r.write("<div class=\"card_newflag\"><span class=\"L5 b\">NEW!</span></div>");
    } else {
      if (r.truth(r.equal(2, r.get(s, "nownew")))) {
        await r.write("<div class=\"card_newflag\"><span class=\"ltazure b\">Wow!</span></div>");
      }
    }
  }
  if (r.truth((r.truth((!r.truth(r.get(s, "lockcard")))) && r.truth((!r.truth((!r.truth(r.get(r.get(s, "nowcard"), "blink"))))))))) {
    if (r.truth((r.compare(r.get(r.get(s, "nowcard"), "blink"), 20) >= 0))) {
      await r.write("<div class=\"card_blink_container blink_maskii\">\r\n<div ");
      if (r.truth(r.equal("S", r.get(r.get(s, "nowcard"), "rare")))) {
        await r.write("class=\"card_blinkii blink_gold\"");
      } else {
        if (r.truth(r.equal("A", r.get(r.get(s, "nowcard"), "rare")))) {
          await r.write("class=\"card_blinkii blink_cyan\"");
        } else {
          if (r.truth(r.equal("B", r.get(r.get(s, "nowcard"), "rare")))) {
            await r.write("class=\"card_blinkii blink_brickred\"");
          } else {
            await r.write("class=\"card_blinkii blink_grey\"");
          }
        }
      }
      await r.write("> </div>\r\n</div>");
    } else {
      await r.write("<div class=\"card_blink_container\">\r\n<div ");
      if (r.truth(r.equal("S", r.get(r.get(s, "nowcard"), "rare")))) {
        await r.write("class=\"card_blink blink_gold\"");
      } else {
        if (r.truth(r.equal("A", r.get(r.get(s, "nowcard"), "rare")))) {
          await r.write("class=\"card_blink blink_cyan\"");
        } else {
          if (r.truth(r.equal("B", r.get(r.get(s, "nowcard"), "rare")))) {
            await r.write("class=\"card_blink blink_brickred\"");
          } else {
            await r.write("class=\"card_blink blink_grey\"");
          }
        }
      }
      await r.write("> </div>\r\n</div>");
    }
  }
  await r.write("<div class=\"card_frame_outer ");
  if (r.truth(r.equal("S", r.get(r.get(s, "nowcard"), "rare")))) {
    await r.write("frame_S");
  } else {
    if (r.truth(r.equal("A", r.get(r.get(s, "nowcard"), "rare")))) {
      await r.write("frame_A");
    } else {
      if (r.truth(r.equal("B", r.get(r.get(s, "nowcard"), "rare")))) {
        await r.write("frame_B");
      }
    }
  }
  await r.write("\">");
  r.assign(r.slot(s, ["nowcardname"]), (r.truth((!r.truth((!r.truth(r.get(r.get(s, "nowcard"), "ruby")))))) ? (r.text((r.text((r.text((r.text("<ruby>") + r.text(r.get(r.get(s, "nowcard"), "name")))) + r.text("<rt>"))) + r.text(r.get(r.get(s, "nowcard"), "ruby")))) + r.text("</rt></ruby>")) : r.get(r.get(s, "nowcard"), "name")));
  await r.write("<div class=\"card_frame_middler\">\r\n<div class=\"card_frame_inner\" style=\"margin-left:50px;width:187px;height:45px;\">\r\n<span id=\"cname\">");
  await r.write(r.text(r.get(s, "nowcardname")));
  await r.write("</span>\r\n</div><div class=\"card_frame_inner\" style=\"height:");
  if (r.truth((r.truth((!r.truth((!r.truth(r.get(r.get(s, "nowcard"), "bigdesc")))))) && r.truth((!r.truth(r.get(s, "lockcard"))))))) {
    await r.write("200px");
  } else {
    await r.write("140px");
  }
  await r.write(";margin-top:3px\">\r\n<span id=\"cdesc\" style=\"max-width:225px\">");
  await r.write(r.text(r.get(r.get(s, "nowcard"), "desc")));
  await r.write("</span>\r\n<span class=\"watermark\">COMMENT</span>\r\n</div><div class=\"card_frame_inner\" style=\"height:");
  if (r.truth((r.truth((!r.truth((!r.truth(r.get(r.get(s, "nowcard"), "bigdesc")))))) && r.truth((!r.truth(r.get(s, "lockcard"))))))) {
    await r.write("40px");
  } else {
    await r.write("100px");
  }
  await r.write("\">\r\n<span id=\"ceffect\">");
  await r.write(r.text(r.get(r.get(s, "nowcard"), "effect")));
  await r.write("</span>\r\n<span class=\"watermark\">EFFECT</span>\r\n</div><div>\r\n<div class=\"card_frame_inner card_frame_float_left\" style=\"margin-right:0;width:170px;height:20px;\">\r\n<span>");
  if (r.truth((r.truth((!r.truth(r.get(s, "lockcard")))) && r.truth((!r.truth(r.get(s, "showpack"))))))) {
    if (r.truth((!r.truth(r.get(r.get(s, "nowcard"), "energy"))))) {
      await r.write("无需充能，可以使用");
    } else {
      if (r.truth((r.compare(r.get(r.get(s, "card_energy"), r.get(r.get(s, "nowcard"), "id")), r.get(r.get(s, "nowcard"), "energy")) < 0))) {
        r.assign(r.slot(s, ["cd_desc"]), (await r.call("convert_tm", r.divide(r.subtract(r.get(r.get(s, "nowcard"), "energy"), r.get(r.get(s, "card_energy"), r.get(r.get(s, "nowcard"), "id"))), (await r.call("max", r.get(r.get(s, "energy_recover_rate"), r.get(r.get(s, "nowcard"), "rare")), 0.00001))), 1)));
        await r.write("<font color=\"red\">充能中，剩余");
        await r.write(r.text(r.get(s, "cd_desc")));
        await r.write("</font>");
      } else {
        await r.write("充能完成，可以使用");
      }
    }
  } else {
    await r.write(r.text(r.get(r.get(s, "nowcard"), "pack")));
  }
  await r.write("</span>\r\n</div><div id=\"cenergy\" class=\"card_frame_inner card_frame_float_right\" style=\"width:60px;height:20px;\">");
  if (r.truth((r.truth((r.truth((r.truth((!r.truth(r.get(s, "lockcard")))) && r.truth((!r.truth(r.get(s, "showpack")))))) && r.truth((!r.truth((!r.truth(r.get(r.get(s, "nowcard"), "energy")))))))) && r.truth((r.compare(r.get(r.get(s, "card_energy"), r.get(r.get(s, "nowcard"), "id")), r.get(r.get(s, "nowcard"), "energy")) < 0))))) {
    r.assign(r.slot(s, ["ecolor"]), (r.truth((r.compare(r.get(r.get(s, "card_energy"), r.get(r.get(s, "nowcard"), "id")), r.divide(r.get(r.get(s, "nowcard"), "energy"), 2)) < 0)) ? "red b" : "yellow b"));
    r.assign(r.slot(s, ["cenergy"]), (await r.call("floor", r.get(r.get(s, "card_energy"), r.get(r.get(s, "nowcard"), "id")))));
    await r.write("<span><span class=\"");
    await r.write(r.text(r.get(s, "ecolor")));
    await r.write("\">");
    await r.write(r.text(r.get(s, "cenergy")));
    await r.write("</span>/");
    await r.write(r.text(r.get(r.get(s, "nowcard"), "energy")));
    await r.write("</span>");
  } else {
    await r.write("<span>");
    await r.write(r.text(r.get(r.get(s, "nowcard"), "energy")));
    await r.write("</span>");
  }
  await r.write("</div>\r\n</div>\r\n</div>\r\n</div><div class=\"card_hexagon ");
  if (r.truth(r.equal("S", r.get(r.get(s, "nowcard"), "rare")))) {
    await r.write("hexagon_S");
  } else {
    if (r.truth(r.equal("A", r.get(r.get(s, "nowcard"), "rare")))) {
      await r.write("hexagon_A");
    } else {
      if (r.truth(r.equal("B", r.get(r.get(s, "nowcard"), "rare")))) {
        await r.write("hexagon_B");
      }
    }
  }
  await r.write("\">\r\n<span id=\"crare\" class=\"");
  await r.write(r.text(r.get(r.get(s, "card_rarecolor"), r.get(r.get(s, "nowcard"), "rare"))));
  await r.write("\">");
  if (r.truth((!r.truth((!r.truth(r.get(r.get(s, "nowcard"), "print_rare_mark"))))))) {
    await r.write(r.text(r.get(r.get(s, "nowcard"), "print_rare_mark")));
  } else {
    await r.write(r.text(r.get(r.get(s, "nowcard"), "rare")));
  }
  await r.write("</span>\r\n</div>\r\n</div>");
return 1;
}
