// Generated from templates/default/log_inventory.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  (await r.include(r.template("header"), s));
  await r.write("<br><br>\r\n<center>\r\n<input type=\"button\" class=\"b_button bc_white\" style=\"width:198\" value=\"抽卡系统\" onclick=\"window.location.href='kujilist.php'\">\r\n<input type=\"button\" class=\"b_button bc_white\" style=\"width:198\" value=\"卡片商店\" onclick=\"window.location.href='logistics.php?type=1'\">\r\n<input type=\"button\" class=\"b_button bc_white\" style=\"width:198\" value=\"道具商店\" onclick=\"window.location.href='logistics.php?type=2'\">\r\n<input type=\"button\" class=\"b_button bc_white\" style=\"width:198\" value=\"道具仓库\" onclick=\"window.location.href='logistics.php?type=3'\">\r\n<input type=\"button\" class=\"b_button bc_white\" style=\"width:198\" value=\"道具展柜\" onclick=\"window.location.href='logistics.php?type=4'\">\r\n</center>\r\n<br>\r\n\r\n<div class=\"subtitle\" align=\"center\">道具仓库</div>\r\n<center>\r\n<br>\r\n<div style=\"width:600px;text-align:center;font-size:14px;\">");
  if (r.truth((!r.truth(r.get(s, "notice"))))) {
    await r.write("在这里可以查看你拥有的道具和装饰品。");
  } else {
    await r.write("<span class=\"yellow b\">");
    await r.write(r.text(r.get(s, "notice")));
    await r.write("</span>");
  }
  await r.write("</div>\r\n<br>\r\n<div style=\"width:600px;text-align:center;\">当前的切糕数量：<span class=\"evergreen b\">");
  await r.write(r.text(r.get(s, "cg")));
  await r.write("</span><br></div>\r\n<br>\r\n<center>\r\n<form method=\"post\" name=\"inventory\">\r\n<input type=\"hidden\" id=\"itemchoice\" name=\"itemchoice\" value=\"\">\r\n<input type=\"hidden\" id=\"itempara\" name=\"itempara\" value=\"\">\r\n<center>\r\n<table style=\"width:1000px;\">\r\n<tr style=\"text-align:center;font-size:18px;\">\r\n<th>名称</th>\r\n<th>描述</th>\r\n<th>持有数</th>\r\n<th></th>\r\n</tr>");
  if (r.truth((await r.call("is_array", r.get(s, "logistics_shop_items"))))) {
    {
      const a0 = r.copy(r.get(s, "logistics_shop_items"));
      for (const [k0, v0] of r.entries(a0)) {
      r.assign(r.slot(s, ["k"]), k0);
        r.assign(r.slot(s, ["lsitem"]), v0);
        r.assign(r.slot(s, ["num"]), (r.truth((!r.truth((!r.truth(r.get(r.get(s, "logitemlist"), r.get(s, "k"))))))) ? r.get(r.get(s, "logitemlist"), r.get(s, "k")) : 0));
        if (r.truth(r.get(s, "num"))) {
          await r.write("<tr>\r\n<td style=\"text-align:center;font-weight:bold;\">");
          await r.write(r.text(r.get(r.get(s, "lsitem"), "0")));
          await r.write("</td>\r\n<td style=\"text-align:center;\">");
          await r.write(r.text(r.get(r.get(s, "logistics_itemtype"), r.get(r.get(s, "lsitem"), "1"))));
          await r.write("。");
          await r.write(r.text(r.get(r.get(s, "lsitem"), "3")));
          await r.write("</td>\r\n<td style=\"text-align:center;\">");
          await r.write(r.text(r.get(s, "num")));
          await r.write("</td>\r\n<td><input type=\"button\" class=\"b_button\" style=\"width:120\" value=\"使用\" onclick=\"$('itemchoice').value='");
          await r.write(r.text(r.get(s, "k")));
          await r.write("';");
          if (r.truth((r.truth((await r.call("in_array", r.get(s, "k"), r.array([[r.APPEND, 2], [r.APPEND, 3], [r.APPEND, 4]])))) || r.truth(r.equal(r.get(r.get(s, "lsitem"), "1"), 2))))) {
            await r.write("bubblebox_show('logitemuse");
            await r.write(r.text(r.get(s, "k")));
            await r.write("');");
          } else {
            if (r.truth((await r.call("in_array", r.get(s, "k"), r.array([[r.APPEND, 201], [r.APPEND, 202], [r.APPEND, 203], [r.APPEND, 204], [r.APPEND, 205], [r.APPEND, 206]]))))) {
              await r.write("bubblebox_show('logcardflip");
              await r.write(r.text(r.get(s, "k")));
              await r.write("');");
            } else {
              await r.write("document.inventory.submit();");
            }
          }
          await r.write("\"></td>\r\n</tr>");
          if (r.truth((r.truth((await r.call("in_array", r.get(s, "k"), r.array([[r.APPEND, 2], [r.APPEND, 3], [r.APPEND, 4]])))) || r.truth(r.equal(r.get(r.get(s, "lsitem"), "1"), 2))))) {
            (await r.call("bubblebox_start", (r.text((r.text("id:logitemuse") + r.text(r.get(s, "k")))) + r.text(";height:150;width:600;cancellable:1;margin-top:20;margin-bottom:20;margin-left:20;margin-right:10;"))));
            await r.write("<div style=\"margin-left:0px; margin-top:0px; margin-right:0px; margin-bottom:0px;\">\r\n<center>\r\n<div style=\"font-weight:bold;\">");
            if (r.truth(r.equal(r.get(s, "k"), 2))) {
              await r.write("使稀有度为<span class=\"gold b\">S</span>、<span class=\"cyan b\">A</span>、<span class=\"brickred b\">B</span>、<span class=\"white b\">C</span>卡片变为闪烁分别需要花费<span class=\"yellow b\">");
              await r.write(r.text(r.get(r.get(r.get(s, "cardblink_upgrade_cost"), "S"), "0")));
              await r.write("/");
              await r.write(r.text(r.get(r.get(r.get(s, "cardblink_upgrade_cost"), "A"), "0")));
              await r.write("/");
              await r.write(r.text(r.get(r.get(r.get(s, "cardblink_upgrade_cost"), "B"), "0")));
              await r.write("/");
              await r.write(r.text(r.get(r.get(r.get(s, "cardblink_upgrade_cost"), "C"), "0")));
              await r.write("</span>切糕。<br><br>请选择要镀层的卡片：<br><br>");
            } else {
              if (r.truth(r.equal(r.get(s, "k"), 3))) {
                await r.write("使稀有度为<span class=\"gold b\">S</span>、<span class=\"cyan b\">A</span>、<span class=\"brickred b\">B</span>卡片变为镜碎分别需要花费<span class=\"yellow b\">");
                await r.write(r.text(r.get(r.get(r.get(s, "cardblink_upgrade_cost"), "S"), "1")));
                await r.write("/");
                await r.write(r.text(r.get(r.get(r.get(s, "cardblink_upgrade_cost"), "A"), "1")));
                await r.write("/");
                await r.write(r.text(r.get(r.get(r.get(s, "cardblink_upgrade_cost"), "B"), "1")));
                await r.write("</span>切糕。<br><br>请选择要镀层的卡片：<br><br>");
              } else {
                if (r.truth(r.equal(r.get(s, "k"), 4))) {
                  await r.write("请选择要充能的卡片：<br><br>");
                } else {
                  await r.write("请选择要摆放到哪个位置：<br><br>\r\n<select name=\"pos\" id=\"pos\" style=\"width:240px\" >");
                  if (r.truth((await r.call("is_array", (await r.call("range", 1, 5)))))) {
                    {
                      const a1 = r.copy((await r.call("range", 1, 5)));
                      for (const [k1, v1] of r.entries(a1)) {
                        r.assign(r.slot(s, ["i"]), v1);
                        await r.write("<option value=\"");
                        await r.write(r.text(r.get(s, "i")));
                        await r.write("\">位置");
                        await r.write(r.text(r.get(s, "i")));
                        await r.write(" ");
                        if (r.truth((!r.truth((!r.truth(r.get(r.get(s, "showcase_logitemlist"), r.subtract(r.get(s, "i"), 1)))))))) {
                          await r.write("已摆放");
                          await r.write(r.text(r.get(r.get(r.get(s, "logistics_shop_items"), r.get(r.get(s, "showcase_logitemlist"), r.subtract(r.get(s, "i"), 1))), "0")));
                        } else {
                          await r.write("未摆放");
                        }
                        await r.write("<br>");
                      }
                    }
                  }
                  await r.write("</select>\r\n<br><br><input type=\"button\" class=\"b_button\" style=\"width:120\" value=\"摆放\" onclick=\"$('itempara').value=$('pos').value;document.inventory.submit();\">");
                }
              }
            }
            await r.write("</div>");
            if (r.truth((await r.call("in_array", r.get(s, "k"), r.array([[r.APPEND, 2], [r.APPEND, 3], [r.APPEND, 4]]))))) {
              await r.write("<select name=\"cardid\" id=\"cardid\">");
              if (r.truth((await r.call("is_array", r.get(s, "cardlist"))))) {
                {
                  const a2 = r.copy(r.get(s, "cardlist"));
                  for (const [k2, v2] of r.entries(a2)) {
                    r.assign(r.slot(s, ["cid"]), v2);
                    await r.write("<option value=\"");
                    await r.write(r.text(r.get(s, "cid")));
                    await r.write("\" ");
                    if (r.truth(r.equal(r.get(s, "card"), r.get(s, "cid")))) {
                      await r.write("selected=\"selected\"");
                    }
                    await r.write(">");
                    await r.write(r.text(r.get(r.get(r.get(s, "cards"), r.get(s, "cid")), "name")));
                    await r.write("</option>");
                  }
                }
              }
              await r.write("</select>\r\n<br><br><input type=\"button\" class=\"b_button\" style=\"width:120\" value=\"使用\" onclick=\"$('itempara').value=$('cardid').value;document.inventory.submit();\">");
            }
            await r.write("<br><br>\r\n</center>\r\n</div>");
            (await r.call("bubblebox_end"));
          } else {
            if (r.truth((await r.call("in_array", r.get(s, "k"), r.array([[r.APPEND, 201], [r.APPEND, 202], [r.APPEND, 203], [r.APPEND, 204], [r.APPEND, 205], [r.APPEND, 206]]))))) {
              (await r.call("bubblebox_start", (r.text((r.text("id:logcardflip") + r.text(r.get(s, "k")))) + r.text(";height:406;width:246;cancellable:1"))));
              await r.write("<p>\r\n你撕开了礼物包装，请点击翻开卡片。<br>\r\n礼物： ");
              await r.write(r.text(r.get(r.get(r.get(s, "logistics_shop_items"), r.get(s, "k")), "3")));
              await r.write("</p>\r\n<div style=\"\r\ncursor:pointer; \r\nposition:relative; -moz-border-radius:8px; \r\n-webkit-border-radius:8px;\r\nborder-radius:8px; height:340px; width:240px; overflow:hidden; \r\n\"\r\ntitle=\"点击翻开\">\r\n<img src=\"img/cardback2.png\" class=\"cardback\" onclick=\"document.inventory.submit();\"></img>\r\n</div>");
              (await r.call("bubblebox_end"));
            }
          }
        }
      }
    }
  }
  await r.write("</table>\r\n</center>\r\n</form>\r\n</center>\r\n<br>\r\n</center>\r\n<script>\r\n\r\n</script>");
  (await r.include(r.template("footer"), s));
return 1;
}
