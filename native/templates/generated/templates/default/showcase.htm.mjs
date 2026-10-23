// Generated from templates/default/showcase.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  (await r.include(r.template("header"), s));
  await r.write("<br><br>\r\n<div class=\"subtitle\" align=\"center\">道具展柜</div>\r\n<center>\r\n<br>\r\n<div style=\"width:600px;text-align:center;font-size:13px;\">你正在查看玩家<span class=\"yellow b\">");
  await r.write(r.text(r.get(r.get(s, "udata"), "username")));
  await r.write("</span>的展柜。</div>\r\n<br>\r\n\r\n<div class=\"subtitle\" align=\"center\">卡片陈列</div>\r\n<center>");
  r.assign(r.slot(s, ["showpack"]), 1);
  await r.write("<ul style=\"width:750px;list-style-type:none;\">");
  if (r.truth((await r.call("is_array", r.get(s, "showcase_cardlist"))))) {
    {
      const a0 = r.copy(r.get(s, "showcase_cardlist"));
      for (const [k0, v0] of r.entries(a0)) {
      r.assign(r.slot(s, ["i"]), k0);
        r.assign(r.slot(s, ["cid"]), v0);
        await r.write("<li style=\"float:left;margin:5px;margin-bottom:10px\">");
        r.assign(r.slot(s, ["k"]), r.add(r.get(s, "i"), 1));
        r.assign(r.slot(s, ["nowcard"]), r.get(r.get(s, "cards"), r.get(s, "cid")));
        r.assign(r.slot(s, ["desc_skills"]), (r.truth((!r.truth((!r.truth(r.get(r.get(s, "nowcard"), "desc_skills")))))) ? r.get(r.get(s, "nowcard"), "desc_skills") : ""));
        r.assign(r.slot(s, ["nowcard", "blink"]), (r.truth((!r.truth((!r.truth(r.get(r.get(r.get(s, "card_data"), r.get(s, "cid")), "blink")))))) ? r.get(r.get(r.get(s, "card_data"), r.get(s, "cid")), "blink") : 0));
        await r.write("<div title=\"");
        await r.write(r.text(r.get(s, "desc_skills")));
        await r.write("\">");
        (await r.include(r.template("MOD_CARDBASE_CARD_FRAME"), s));
        await r.write("</div>\r\n</li>");
      }
    }
  }
  await r.write("<div style=\"clear:both;\"></div>\r\n</ul>\r\n\r\n<br>\r\n<div class=\"subtitle\" align=\"center\">道具陈列</div>");
  if (r.truth(r.get(s, "showcase_gameitemlist"))) {
    await r.write("<table style=\"width:750px;\">\r\n<tr style=\"text-align:center;font-size:14px;\">\r\n<th width=\"80\"><span>道具类别</span></td>\r\n<th <span>名称</span></td>\r\n<th width=\"130\"><span>属性</span></td>\r\n<th width=\"40\"><span>效</span></td>\r\n<th width=\"40\"><span>耐</span></td>\r\n</tr>");
    if (r.truth((await r.call("is_array", r.get(s, "showcase_gameitemlist"))))) {
      {
        const a1 = r.copy(r.get(s, "showcase_gameitemlist"));
        for (const [k1, v1] of r.entries(a1)) {
          r.assign(r.slot(s, ["gitm"]), v1);
          if (r.truth(r.get(s, "gitm"))) {
            await r.write("<tr style=\"text-align:center;\">\r\n<td class=\"showcase\"><span>");
            await r.write(r.text((await r.module("itemmain", "parse_itmk_words", r.get(r.get(s, "gitm"), "1"), 1))));
            await r.write("</span></td>\r\n<td class=\"showcase\"><span>");
            await r.write(r.text(r.get(r.get(s, "gitm"), "0")));
            await r.write("</span></td>\r\n<td class=\"showcase\"><span>");
            await r.write(r.text((await r.module("itemmain", "parse_itmsk_words", r.get(r.get(s, "gitm"), "4"), 1))));
            await r.write("</span></td>\r\n<td class=\"showcase\"><span>");
            await r.write(r.text(r.get(r.get(s, "gitm"), "2")));
            await r.write("</td>\r\n<td class=\"showcase\"><span>");
            await r.write(r.text(r.get(r.get(s, "gitm"), "3")));
            await r.write("</span></td>\r\n</tr>");
          }
        }
      }
    }
    await r.write("</table>");
  } else {
    await r.write("<div style=\"width:600px;text-align:center;font-size:14px;\">这里什么也没有呢……</div>");
  }
  await r.write("<br>\r\n<br>\r\n<div class=\"subtitle\" align=\"center\">装饰陈列</div>");
  if (r.truth(r.get(s, "showcase_logitemlist"))) {
    await r.write("<form method=\"post\" name=\"showcase3\">\r\n<input type=\"hidden\" name=\"showcase_cmd\" value=\"set_item\">\r\n<input type=\"hidden\" id=\"itempos\" name=\"itempos\" value=\"\">\r\n<table style=\"width:750px;\">\r\n<tr style=\"text-align:center;font-size:14px;\">\r\n<th>名称</th>\r\n<th>描述</th>\r\n</tr>");
    if (r.truth((await r.call("is_array", r.get(s, "showcase_logitemlist"))))) {
      {
        const a2 = r.copy(r.get(s, "showcase_logitemlist"));
        for (const [k2, v2] of r.entries(a2)) {
        r.assign(r.slot(s, ["i"]), k2);
          r.assign(r.slot(s, ["lid"]), v2);
          if (r.truth(((r.get(r.get(s, "logistics_shop_items"), r.get(s, "lid")) != null)))) {
            r.assign(r.slot(s, ["lsitem"]), r.get(r.get(s, "logistics_shop_items"), r.get(s, "lid")));
            r.assign(r.slot(s, ["show_i"]), r.add(r.get(s, "i"), 1));
            await r.write("<tr style=\"text-align:center;\">\r\n<td class=\"showcase\" style=\"font-weight:bold;\">");
            await r.write(r.text(r.get(r.get(s, "lsitem"), "0")));
            await r.write("</td>\r\n<td class=\"showcase\">");
            await r.write(r.text(r.get(r.get(s, "lsitem"), "3")));
            await r.write("</td>\r\n</tr>");
          }
        }
      }
    }
    await r.write("</table>\r\n</form>");
  } else {
    await r.write("<div style=\"width:600px;text-align:center;font-size:14px;\">这里什么也没有呢……</div>");
  }
  await r.write("<br>\r\n<br>\r\n</center>");
  (await r.include(r.template("footer"), s));
return 1;
}
