// Generated from templates/default/log_cardshop.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  (await r.include(r.template("header"), s));
  await r.write("<br><br>\r\n<center>\r\n<input type=\"button\" class=\"b_button bc_white\" style=\"width:198\" value=\"抽卡系统\" onclick=\"window.location.href='kujilist.php'\">\r\n<input type=\"button\" class=\"b_button bc_white\" style=\"width:198\" value=\"卡片商店\" onclick=\"window.location.href='logistics.php?type=1'\">\r\n<input type=\"button\" class=\"b_button bc_white\" style=\"width:198\" value=\"道具商店\" onclick=\"window.location.href='logistics.php?type=2'\">\r\n<input type=\"button\" class=\"b_button bc_white\" style=\"width:198\" value=\"道具仓库\" onclick=\"window.location.href='logistics.php?type=3'\">\r\n<input type=\"button\" class=\"b_button bc_white\" style=\"width:198\" value=\"道具展柜\" onclick=\"window.location.href='logistics.php?type=4'\">\r\n</center>\r\n<br>\r\n\r\n<div class=\"subtitle\" align=\"center\">卡片商店</div>\r\n<center>\r\n<br>\r\n<div style=\"width:600px;text-align:center;font-size:14px;\">");
  if (r.truth((!r.truth(r.get(s, "notice"))))) {
    await r.write("在这里可以用切糕交换卡片。可交换的卡片列表每天0点更新。");
  } else {
    await r.write("<span class=\"yellow b\">");
    await r.write(r.text(r.get(s, "notice")));
    await r.write("</span>");
  }
  await r.write("</div>\r\n<br>\r\n<div style=\"width:600px;text-align:center;\">当前的切糕数量：<span class=\"evergreen b\">");
  await r.write(r.text(r.get(s, "cg")));
  await r.write("</span><br></div>\r\n<br>\r\n<center>\r\n<form method=\"post\" name=\"cardshop\">\r\n<input type=\"hidden\" id=\"cardchoice\" name=\"cardchoice\" value=\"\">");
  r.assign(r.slot(s, ["showpack"]), 1);
  await r.write("<ul style=\"width:1000px;list-style-type:none;\">");
  if (r.truth((await r.call("is_array", r.get(s, "cardshop_list"))))) {
    {
      const a0 = r.copy(r.get(s, "cardshop_list"));
      for (const [k0, v0] of r.entries(a0)) {
      r.assign(r.slot(s, ["k"]), k0);
        r.assign(r.slot(s, ["nowcard"]), v0);
        r.assign(r.slot(s, ["price"]), (await r.module("logistics", "get_card_price", r.get(s, "nowcard"))));
        r.assign(r.slot(s, ["o_blink"]), (await r.module("logistics", "card_check_o_blink", r.get(r.get(s, "nowcard"), "id"), r.get(s, "udata"))));
        await r.write("<li style=\"float:left;margin:5px;margin-bottom:10px\">");
        r.assign(r.slot(s, ["desc_skills"]), (r.truth((!r.truth((!r.truth(r.get(r.get(s, "nowcard"), "desc_skills")))))) ? r.get(r.get(s, "nowcard"), "desc_skills") : ""));
        await r.write("<div title=\"");
        await r.write(r.text(r.get(s, "desc_skills")));
        await r.write("\">");
        (await r.include(r.template("MOD_CARDBASE_CARD_FRAME"), s));
        await r.write("</div>\r\n<br><div style=\"height:20px;\">价格：");
        await r.write(r.text(r.get(s, "price")));
        if (r.truth(((r.get(r.get(s, "nowcard"), "discount") != null)))) {
          await r.write(" <span class=\"L5 b\">(-");
          await r.write(r.text(r.get(r.get(s, "nowcard"), "discount")));
          await r.write("%)</span>");
        }
        await r.write("</div>");
        if (r.truth((r.compare(r.get(s, "o_blink"), r.get(r.get(s, "nowcard"), "blink")) >= 0))) {
          await r.write("<input type=\"button\" class=\"b_button\" style=\"width:120\" value=\"已持有\" disabled />");
        } else {
          if (r.truth((r.compare(r.get(s, "cg"), r.get(s, "price")) < 0))) {
            await r.write("<input type=\"button\" class=\"b_button\" style=\"width:120\" value=\"切糕不足\" disabled />");
          } else {
            await r.write("<input type=\"button\" class=\"b_button\" style=\"width:120\" value=\"购买\" onclick=\"$('cardchoice').value='");
            await r.write(r.text(r.get(s, "k")));
            await r.write("'; document.cardshop.submit();\" />");
          }
        }
        await r.write("</li>");
      }
    }
  }
  await r.write("<div style=\"clear:both;\"></div>\r\n</ul>\r\n</form>\r\n</center>\r\n<br>\r\n</center>");
  (await r.include(r.template("footer"), s));
return 1;
}
