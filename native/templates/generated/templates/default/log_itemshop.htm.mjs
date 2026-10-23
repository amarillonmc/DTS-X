// Generated from templates/default/log_itemshop.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  (await r.include(r.template("header"), s));
  await r.write("<br><br>\r\n<center>\r\n<input type=\"button\" class=\"b_button bc_white\" style=\"width:198\" value=\"抽卡系统\" onclick=\"window.location.href='kujilist.php'\">\r\n<input type=\"button\" class=\"b_button bc_white\" style=\"width:198\" value=\"卡片商店\" onclick=\"window.location.href='logistics.php?type=1'\">\r\n<input type=\"button\" class=\"b_button bc_white\" style=\"width:198\" value=\"道具商店\" onclick=\"window.location.href='logistics.php?type=2'\">\r\n<input type=\"button\" class=\"b_button bc_white\" style=\"width:198\" value=\"道具仓库\" onclick=\"window.location.href='logistics.php?type=3'\">\r\n<input type=\"button\" class=\"b_button bc_white\" style=\"width:198\" value=\"道具展柜\" onclick=\"window.location.href='logistics.php?type=4'\">\r\n</center>\r\n<br>\r\n\r\n<div class=\"subtitle\" align=\"center\">道具商店</div>\r\n<center>\r\n<br>\r\n<div style=\"width:600px;text-align:center;font-size:14px;\">");
  if (r.truth((!r.truth(r.get(s, "notice"))))) {
    await r.write("在这里可以用切糕交换一些非游戏中使用的道具或装饰品。");
  } else {
    await r.write("<span class=\"yellow b\">");
    await r.write(r.text(r.get(s, "notice")));
    await r.write("</span>");
  }
  await r.write("</div>\r\n<br>\r\n<div style=\"width:600px;text-align:center;\">当前的切糕数量：<span class=\"evergreen b\">");
  await r.write(r.text(r.get(s, "cg")));
  await r.write("</span><br></div>\r\n<br>\r\n<center>\r\n<form method=\"post\" name=\"logshop\">\r\n<input type=\"hidden\" id=\"itemchoice\" name=\"itemchoice\" value=\"\">\r\n<table style=\"width:1000px;\">\r\n<tr style=\"text-align:center;font-size:18px;\">\r\n<th>名称</th>\r\n<th>描述</th>\r\n<th>价格</th>\r\n<th>持有数</th>\r\n<th></th>\r\n</tr>");
  if (r.truth((await r.call("is_array", r.get(s, "logistics_shop_items"))))) {
    {
      const a0 = r.copy(r.get(s, "logistics_shop_items"));
      for (const [k0, v0] of r.entries(a0)) {
      r.assign(r.slot(s, ["k"]), k0);
        r.assign(r.slot(s, ["lsitem"]), v0);
        if (r.truth((!r.truth(r.get(r.get(s, "lsitem"), "4"))))) {
          r.assign(r.slot(s, ["price"]), r.get(r.get(s, "lsitem"), "2"));
          r.assign(r.slot(s, ["num"]), (r.truth((!r.truth((!r.truth(r.get(r.get(s, "logitemlist"), r.get(s, "k"))))))) ? r.get(r.get(s, "logitemlist"), r.get(s, "k")) : 0));
          await r.write("<tr>\r\n<td style=\"text-align:center;font-weight:bold;\">");
          await r.write(r.text(r.get(r.get(s, "lsitem"), "0")));
          await r.write("</td>\r\n<td style=\"text-align:center;\">");
          await r.write(r.text(r.get(r.get(s, "logistics_itemtype"), r.get(r.get(s, "lsitem"), "1"))));
          await r.write("。");
          await r.write(r.text(r.get(r.get(s, "lsitem"), "3")));
          await r.write("</td>\r\n<td style=\"text-align:center;\">");
          await r.write(r.text(r.get(s, "price")));
          await r.write("</td>\r\n<td style=\"text-align:center;\">");
          await r.write(r.text(r.get(s, "num")));
          await r.write("</td>\r\n<td><input type=\"button\" class=\"b_button\" style=\"width:120\" value=\"购买\" onclick=\"$('itemchoice').value='");
          await r.write(r.text(r.get(s, "k")));
          await r.write("'; document.logshop.submit();\" ");
          if (r.truth((r.compare(r.get(s, "cg"), r.get(s, "price")) < 0))) {
            await r.write("disabled");
          }
          await r.write("></td>\r\n</tr>");
        }
      }
    }
  }
  await r.write("</table>\r\n</form>\r\n</center>\r\n<br>\r\n</center>");
  (await r.include(r.template("footer"), s));
return 1;
}
