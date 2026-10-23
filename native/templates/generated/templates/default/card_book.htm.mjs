// Generated from templates/default/card_book.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  (await r.include(r.template("header"), s));
  await r.write("<div class=\"subtitle\" align=\"center\">卡册</div>\r\n<center>\r\n<div>");
  if (r.truth((await r.call("is_array", r.get(s, "packlist"))))) {
    {
      const a0 = r.copy(r.get(s, "packlist"));
      for (const [k0, v0] of r.entries(a0)) {
        r.assign(r.slot(s, ["packname"]), v0);
        if (r.truth(r.equal(r.get(s, "pname"), r.get(s, "packname")))) {
          await r.write("&nbsp;&nbsp;<h2 class=\"evergreen b\" style=\"display:inline\">");
          await r.write(r.text(r.get(s, "packname")));
          await r.write("</h2>&nbsp;&nbsp;");
        } else {
          if (r.truth(r.get(s, "curuser"))) {
            await r.write("&nbsp;&nbsp;<a href=\"cardbook.php?packName=");
            await r.write(r.text(r.get(s, "packname")));
            await r.write("\">");
            await r.write(r.text(r.get(s, "packname")));
            await r.write("</a>&nbsp;&nbsp;");
          } else {
            await r.write("<a href=\"cardbook.php?packName=");
            await r.write(r.text(r.get(s, "packname")));
            await r.write("&amp;playerID=");
            await r.write(r.text(r.get(s, "n")));
            await r.write("\">");
            await r.write(r.text(r.get(s, "packname")));
            await r.write("</a>&nbsp;&nbsp;");
          }
        }
      }
    }
  }
  await r.write("</div>\r\n\r\n</center>");
  if (r.truth(r.get(s, "pname"))) {
    await r.write("<center>\r\n<div style=\"width:600px;height:160px;position: relative;\">");
    r.assign(r.slot(s, ["packname"]), r.get(s, "pname"));
    await r.write("<div style=\"position: absolute;top:0px;left:0px;\">");
    (await r.include(r.template("MOD_CARDBASE_PACK_FRAME"), s));
    await r.write("</div><div style=\"text-align:left;position: absolute;top:40px;left:160px; width: 440px;\">\r\n<span>当前卡集：<span class=\"evergreen b\" style=\"font-size:24px; font-weight: bold;\">");
    await r.write(r.text(r.get(s, "pname")));
    await r.write("</span></span>\r\n<br>\r\n<br>\r\n<span>");
    await r.write(r.text(r.get(r.get(s, "packdesc"), r.get(s, "pname"))));
    await r.write("</span>\r\n<br>\r\n<br>\r\n<span>拥有卡数：");
    await r.write(r.text(r.get(s, "unlock_num")));
    await r.write("/");
    await r.write(r.text(r.get(s, "pack_num")));
    await r.write("</span>\r\n</div>\r\n</div>");
    if (r.truth(r.get(s, "unlock_cards"))) {
      await r.write("<p>下面是你拥有的卡片和未解锁的卡片：</p>");
    } else {
      await r.write("<p>一张卡都没有呢……</p>");
    }
    await r.write("</center>");
    if (r.truth((await r.call("is_array", r.get(s, "card_data_fetched"))))) {
      {
        const a1 = r.copy(r.get(s, "card_data_fetched"));
        for (const [k1, v1] of r.entries(a1)) {
        r.assign(r.slot(s, ["ci"]), k1);
          r.assign(r.slot(s, ["cv"]), v1);
          if (r.truth((r.truth(0) && r.truth((!r.truth((!r.truth(r.get(r.get(s, "cv"), "blink"))))))))) {
            await r.write(r.text((r.text(r.get(r.get(r.get(s, "cards"), r.get(s, "ci")), "name")) + r.text(" "))));
          }
        }
      }
    }
    await r.write("<center>\r\n<ul style=\"width:1000px;list-style-type:none;\">");
    if (r.truth((await r.call("is_array", r.get(s, "unlock_cards"))))) {
      {
        const a2 = r.copy(r.get(s, "unlock_cards"));
        for (const [k2, v2] of r.entries(a2)) {
          r.assign(r.slot(s, ["nowcard"]), v2);
          r.assign(r.slot(s, ["lockcard"]), 0);
          r.assign(r.slot(s, ["card_achieved"]), (await r.call("in_array", r.get(r.get(s, "nowcard"), "id"), r.get(s, "card_achieved_list"))));
          r.assign(r.slot(s, ["nowcard", "blink"]), (r.truth((!r.truth((!r.truth(r.get(r.get(r.get(s, "card_data_fetched"), r.get(r.get(s, "nowcard"), "id")), "blink")))))) ? r.get(r.get(r.get(s, "card_data_fetched"), r.get(r.get(s, "nowcard"), "id")), "blink") : 0));
          await r.write("<li style=\"float:left;margin:5px;margin-bottom:10px\"");
          r.assign(r.slot(s, ["desc_skills"]), (r.truth((!r.truth((!r.truth(r.get(r.get(r.get(s, "cards"), r.get(r.get(s, "nowcard"), "id")), "desc_skills")))))) ? (r.text(r.get(r.get(r.get(s, "cards"), r.get(r.get(s, "nowcard"), "id")), "desc_skills")) + r.text("<br><br>")) : ""));
          await r.write("title=\"");
          await r.write(r.text(r.get(s, "desc_skills")));
          if (r.truth((r.compare(r.get(r.get(s, "card_energy"), r.get(r.get(s, "nowcard"), "id")), r.get(r.get(s, "nowcard"), "energy")) < 0))) {
            r.assign(r.slot(s, ["t"]), r.divide(r.subtract(r.get(r.get(s, "nowcard"), "energy"), r.get(r.get(s, "card_energy"), r.get(r.get(s, "nowcard"), "id"))), r.get(r.get(s, "energy_recover_rate"), r.get(r.get(s, "nowcard"), "rare"))));
            r.assign(r.slot(s, ["now_energy_show"]), (await r.call("floor", r.get(r.get(s, "card_energy"), r.get(r.get(s, "nowcard"), "id")))));
            r.assign(r.slot(s, ["ddl"]), (await r.call("convert_tm", r.get(s, "t"))));
            await r.write("这张卡片目前处于蓄能状态<br>需要");
            await r.write(r.text(r.get(r.get(s, "nowcard"), "energy")));
            await r.write("点能量，目前已蓄积了");
            await r.write(r.text(r.get(s, "now_energy_show")));
            await r.write("点能量<br>预计在");
            await r.write(r.text(r.get(s, "ddl")));
            await r.write("后蓄能完成");
          } else {
            if (r.truth(r.get(r.get(s, "nowcard"), "energy"))) {
              await r.write("这张卡片需要蓄积");
              await r.write(r.text(r.get(r.get(s, "nowcard"), "energy")));
              await r.write("点能量方可使用<br>目前已蓄能完成，可以使用");
            } else {
              await r.write("这张卡片不需要蓄能，可以使用");
            }
          }
          await r.write("\">");
          (await r.include(r.template("MOD_CARDBASE_CARD_FRAME"), s));
          await r.write("</li>");
        }
      }
    }
    if (r.truth((await r.call("is_array", r.get(s, "lock_cards"))))) {
      {
        const a3 = r.copy(r.get(s, "lock_cards"));
        for (const [k3, v3] of r.entries(a3)) {
          r.assign(r.slot(s, ["nowcard"]), v3);
          r.assign(r.slot(s, ["nowcard", "desc"]), r.assign(r.slot(s, ["nowcard", "effect"]), "???"));
          r.assign(r.slot(s, ["lockcard"]), 1);
          r.assign(r.slot(s, ["card_achieved"]), 0);
          r.assign(r.slot(s, ["gaining"]), "你尚未获得这张卡片");
          if (r.truth((!r.truth((!r.truth(r.get(r.get(s, "card_gaining_method"), r.get(r.get(s, "nowcard"), "id")))))))) {
            r.update(r.slot(s, ["gaining"]), "concat", (r.text("<br>") + r.text((await r.call("implode", "<br>", r.get(r.get(s, "card_gaining_method"), r.get(r.get(s, "nowcard"), "id")))))));
          }
          await r.write("<li class=\"lockcard\" style=\"float:left;margin:5px;margin-bottom:10px\" title=\"");
          await r.write(r.text(r.get(s, "gaining")));
          await r.write("\">");
          (await r.include(r.template("MOD_CARDBASE_CARD_FRAME"), s));
          await r.write("</li>");
        }
      }
    }
    await r.write("<div style=\"clear:both;\"></div>\r\n</ul>\r\n</center>");
  } else {
    await r.write("<center>\r\n<p>选择一个卡册</p>\r\n</center>");
  }
  await r.write("<form method=\"post\" name=\"backindex\" action=\"index.php\">\r\n<input type=\"submit\" name=\"enter\" value=\"返回首页\">\r\n</form>");
  (await r.include(r.template("footer"), s));
return 1;
}
