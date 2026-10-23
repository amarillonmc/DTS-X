// Generated from templates/default/log_showcase.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  (await r.include(r.template("header"), s));
  await r.write("<br><br>\r\n<center>\r\n<input type=\"button\" class=\"b_button bc_white\" style=\"width:198\" value=\"抽卡系统\" onclick=\"window.location.href='kujilist.php'\">\r\n<input type=\"button\" class=\"b_button bc_white\" style=\"width:198\" value=\"卡片商店\" onclick=\"window.location.href='logistics.php?type=1'\">\r\n<input type=\"button\" class=\"b_button bc_white\" style=\"width:198\" value=\"道具商店\" onclick=\"window.location.href='logistics.php?type=2'\">\r\n<input type=\"button\" class=\"b_button bc_white\" style=\"width:198\" value=\"道具仓库\" onclick=\"window.location.href='logistics.php?type=3'\">\r\n<input type=\"button\" class=\"b_button bc_white\" style=\"width:198\" value=\"道具展柜\" onclick=\"window.location.href='logistics.php?type=4'\">\r\n</center>\r\n<br>\r\n\r\n<div class=\"subtitle\" align=\"center\">道具展柜</div>\r\n<center>\r\n<br>\r\n<div style=\"width:600px;text-align:center;font-size:14px;\">");
  if (r.truth((!r.truth(r.get(s, "notice"))))) {
    await r.write("在这里可以展示你拥有的卡片、游戏道具或装饰品。");
  } else {
    await r.write("<span class=\"yellow b\">");
    await r.write(r.text(r.get(s, "notice")));
    await r.write("</span>");
  }
  await r.write("</div>\r\n<br>\r\n\r\n<div class=\"subtitle\" align=\"center\">卡片陈列</div>\r\n<center>");
  if (r.truth(r.get(s, "showcase_cardlist"))) {
    await r.write("<form method=\"post\" name=\"showcase\">\r\n<input type=\"hidden\" name=\"showcase_cmd\" value=\"set_card\">\r\n<input type=\"hidden\" id=\"cardchoice\" name=\"cardchoice\" value=\"\">\r\n<input type=\"hidden\" id=\"cardpos\" name=\"cardpos\" value=\"0\">");
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
          await r.write("</div>\r\n<br>\r\n<input type=\"button\" class=\"b_button\" style=\"width:120\" value=\"更换\" onclick=\"$('cardpos').value='");
          await r.write(r.text(r.get(s, "k")));
          await r.write("';bubblebox_show('cardchange");
          await r.write(r.text(r.get(s, "k")));
          await r.write("');\">\r\n</li>");
          (await r.call("bubblebox_start", (r.text((r.text("id:cardchange") + r.text(r.get(s, "k")))) + r.text(";height:150;width:600;cancellable:1;margin-top:20;margin-bottom:20;margin-left:20;margin-right:10;z-index-base:30;"))));
          await r.write("<div style=\"margin-left:0px; margin-top:0px; margin-right:0px; margin-bottom:0px;\">\r\n<center>\r\n<div style=\"font-weight:bold;\">\r\n请选择要设置的卡片：<br><br>\r\n</div>\r\n<select name=\"cardid\" id=\"cardid\">");
          if (r.truth((await r.call("is_array", r.get(s, "cardlist"))))) {
            {
              const a1 = r.copy(r.get(s, "cardlist"));
              for (const [k1, v1] of r.entries(a1)) {
                r.assign(r.slot(s, ["cid"]), v1);
                await r.write("<option value=\"");
                await r.write(r.text(r.get(s, "cid")));
                await r.write("\">");
                await r.write(r.text(r.get(r.get(r.get(s, "cards"), r.get(s, "cid")), "name")));
                await r.write("<br>");
              }
            }
          }
          await r.write("</select>\r\n<br><br>\r\n<input type=\"button\" class=\"b_button\" style=\"width:120\" value=\"设置\" onclick=\"$('cardchoice').value=$('cardid').value;document.showcase.submit();\">\r\n</center>\r\n</div>");
          (await r.call("bubblebox_end"));
        }
      }
    }
    await r.write("<div style=\"clear:both;\"></div>\r\n</ul>\r\n</form>");
  } else {
    await r.write("<div style=\"width:600px;text-align:center;font-size:14px;\">这里什么也没有呢……</div>");
  }
  await r.write("<br>\r\n<div class=\"subtitle\" align=\"center\">道具陈列</div>");
  if (r.truth(r.get(s, "showcase_gameitemlist"))) {
    await r.write("<table style=\"width:750px;\">\r\n<tr style=\"text-align:center;font-size:14px;\">\r\n<th width=\"80\"><span>道具类别</span></td>\r\n<th <span>名称</span></td>\r\n<th width=\"130\"><span>属性</span></td>\r\n<th width=\"40\"><span>效</span></td>\r\n<th width=\"40\"><span>耐</span></td>\r\n</tr>");
    if (r.truth((await r.call("is_array", r.get(s, "showcase_gameitemlist"))))) {
      {
        const a2 = r.copy(r.get(s, "showcase_gameitemlist"));
        for (const [k2, v2] of r.entries(a2)) {
          r.assign(r.slot(s, ["gitm"]), v2);
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
  await r.write("<br><div style=\"width:600px;text-align:center;font-size:14px;\">在游戏中可使用商店中购买的<span class=\"yellow b\">“记录用投影底座”</span>将道具投影保存到展柜中。</div>\r\n\r\n<br>\r\n<div class=\"subtitle\" align=\"center\">装饰陈列</div>");
  if (r.truth(r.get(s, "showcase_logitemlist"))) {
    await r.write("<form method=\"post\" name=\"showcase3\">\r\n<input type=\"hidden\" name=\"showcase_cmd\" value=\"set_item\">\r\n<input type=\"hidden\" id=\"itempos\" name=\"itempos\" value=\"\">\r\n<table style=\"width:750px;\">\r\n<tr style=\"text-align:center;font-size:14px;\">\r\n<th>名称</th>\r\n<th>描述</th>\r\n<th>操作</th>\r\n</tr>");
    if (r.truth((await r.call("is_array", r.get(s, "showcase_logitemlist"))))) {
      {
        const a3 = r.copy(r.get(s, "showcase_logitemlist"));
        for (const [k3, v3] of r.entries(a3)) {
        r.assign(r.slot(s, ["i"]), k3);
          r.assign(r.slot(s, ["lid"]), v3);
          if (r.truth(((r.get(r.get(s, "logistics_shop_items"), r.get(s, "lid")) != null)))) {
            r.assign(r.slot(s, ["lsitem"]), r.get(r.get(s, "logistics_shop_items"), r.get(s, "lid")));
            r.assign(r.slot(s, ["show_i"]), r.add(r.get(s, "i"), 1));
            await r.write("<tr style=\"text-align:center;\">\r\n<td class=\"showcase\" style=\"font-weight:bold;\">");
            await r.write(r.text(r.get(r.get(s, "lsitem"), "0")));
            await r.write("</td>\r\n<td class=\"showcase\">");
            await r.write(r.text(r.get(r.get(s, "lsitem"), "3")));
            await r.write("</td>\r\n<td class=\"showcase\" style=\"width:120px\">\r\n<input type=\"button\" class=\"b_button\" style=\"width:90px\" value=\"取下\" onclick=\"$('itempos').value='");
            await r.write(r.text(r.get(s, "show_i")));
            await r.write("';document.showcase3.submit();\">\r\n</td>\r\n</tr>");
          }
        }
      }
    }
    await r.write("</table>\r\n</form>");
  } else {
    await r.write("<div style=\"width:600px;text-align:center;font-size:14px;\">这里什么也没有呢……</div>");
  }
  await r.write("<br><div style=\"width:600px;text-align:center;font-size:14px;\">可在道具仓库中使用装饰品将其摆放到展柜中。</div>\r\n</center>\r\n\r\n<br>\r\n</center>");
  (await r.include(r.template("footer"), s));
return 1;
}
