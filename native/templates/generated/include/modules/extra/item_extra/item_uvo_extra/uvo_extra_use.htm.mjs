// Generated from include/modules/extra/item_extra/item_uvo_extra/uvo_extra_use.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  r.imports(s, "player", "cardbase");
  await r.write("<input type=\"hidden\" name=\"mode\" value=\"command\">\r\n<input type=\"hidden\" id=\"command\" name=\"command\" value=\"card\">\r\n<input type=\"hidden\" id=\"subcmd\" name=\"subcmd\" value=\"carduse\">\r\n<input type=\"hidden\" name=\"card_choice1\" id=\"card_choice1\" value=\"0\">\r\n<input type=\"hidden\" name=\"card_choice2\" id=\"card_choice2\" value=\"-1\">\r\n<span class=\"yellow b\">卡片使用的规则如下：</span><br>\r\n1、使用卡片后会获得该卡片的物品、技能和数值变化，当前卡名、内定称号不变；<br>\r\n2、使用部分卡片（如Standard Pack中固定内定称号的卡片）只会随机获得一部分技能；<br>\r\n3、击杀玩家可获得对方所有未使用的卡片，被玩家击杀时会失去所有未使用的卡片。<br>\r\n<span class=\"yellow b\">另外可以在“卡片合成”中以获得的卡片为素材，合成得到新的卡片。</span><br><br>\r\n你在本局游戏中获得的卡片如下：<br>");
  r.assign(r.slot(s, ["cards_uvo"]), (await r.module("item_uvo_extra", "get_cards_uvo_extra", r.get(s, "sdata"))));
  r.assign(r.slot(s, ["cards_used"]), (await r.module("item_uvo_extra", "get_cards_uvo_extra", r.get(s, "sdata"), 1)));
  r.assign(r.slot(s, ["showpack"]), 1);
  r.assign(r.slot(s, ["c"]), (await r.call("count", r.get(s, "cards_uvo"))));
  if (r.truth((!r.truth(r.get(s, "cards_uvo"))))) {
    await r.write("<br><span class=\"yellow b\">你没有未使用的卡片。</span><br>");
  } else {
    if (r.truth((await r.call("is_array", r.get(s, "cards_uvo"))))) {
      {
        const a0 = r.copy(r.get(s, "cards_uvo"));
        for (const [k0, v0] of r.entries(a0)) {
        r.assign(r.slot(s, ["k"]), k0);
          r.assign(r.slot(s, ["cid"]), v0);
          await r.write("<input type=\"button\" style=\"width:60px\" value=\"使用\" onclick=\"$('card_choice1').value='");
          await r.write(r.text(r.get(s, "cid")));
          await r.write("';postCmd('gamecmd','command.php');this.disabled=true;\">");
          r.assign(r.slot(s, ["nowcard"]), r.get(r.get(s, "cards"), r.get(s, "cid")));
          r.assign(r.slot(s, ["cardframe_id"]), (r.text("cardframe_show_") + r.text(r.get(s, "k"))));
          await r.write("&nbsp;<span class=\"");
          await r.write(r.text(r.get(r.get(s, "card_rarecolor"), r.get(r.get(r.get(s, "cards"), r.get(s, "cid")), "rare"))));
          await r.write("\" onmouseenter=\"$('");
          await r.write(r.text(r.get(s, "cardframe_id")));
          await r.write("').style.display='block';\" onmouseleave=\"$('");
          await r.write(r.text(r.get(s, "cardframe_id")));
          await r.write("').style.display='none';\">【");
          await r.write(r.text(r.get(r.get(r.get(s, "cards"), r.get(s, "cid")), "name")));
          await r.write(" ");
          await r.write(r.text(r.get(r.get(r.get(s, "cards"), r.get(s, "cid")), "rare")));
          await r.write("】</span><br>");
          if (r.truth((!r.truth((!r.truth(r.get(s, "nowcard"))))))) {
            await r.write("<div style=\"position:relative;\">\r\n<div id=\"");
            await r.write(r.text(r.get(s, "cardframe_id")));
            await r.write("\" class=\"cardframe_show\" style=\"display:none;position:absolute;z-index:30;left:35px;top:");
            await r.write(r.text((r.truth((r.compare(r.get(s, "k"), 3) > 0)) ? (-r.number(335)) : 0)));
            await r.write("px;\">");
            (await r.include(r.template("MOD_CARDBASE_CARD_FRAME"), s));
            await r.write("</div>\r\n</div>");
          }
        }
      }
    }
  }
  await r.write("<br>");
  if (r.truth((!r.truth((!r.truth(r.get(s, "cards_used"))))))) {
    await r.write("<hr>\r\n<div id=\"cards_used_switch\" style=\"text-align:center;\">\r\n<a id=\"cards_used_open\" onclick=\"this.style.display='none';$('cards_used_shut').style.display='inline';$('cards_used_hidden_box').style.display='block';\">点击查看已使用卡片列表</a>\r\n<a id=\"cards_used_shut\" style=\"display:none\" onclick=\"this.style.display='none';$('cards_used_open').style.display='inline';$('cards_used_hidden_box').style.display='none';\">关闭已使用卡片列表</a>\r\n</div><div id=\"cards_used_hidden_box\" style=\"display:none;text-align:center;\">\r\n你在本局游戏中已使用的卡片如下：<br>");
    if (r.truth((await r.call("is_array", r.get(s, "cards_used"))))) {
      {
        const a1 = r.copy(r.get(s, "cards_used"));
        for (const [k1, v1] of r.entries(a1)) {
        r.assign(r.slot(s, ["k"]), k1);
          r.assign(r.slot(s, ["cid"]), v1);
          r.assign(r.slot(s, ["nowcard"]), r.get(r.get(s, "cards"), r.get(s, "cid")));
          r.assign(r.slot(s, ["cardframe_id"]), (r.text("cardframe_show_") + r.text(r.add(r.get(s, "c"), r.get(s, "k")))));
          await r.write("<span class=\"");
          await r.write(r.text(r.get(r.get(s, "card_rarecolor"), r.get(r.get(r.get(s, "cards"), r.get(s, "cid")), "rare"))));
          await r.write("\" onmouseenter=\"$('");
          await r.write(r.text(r.get(s, "cardframe_id")));
          await r.write("').style.display='block';\" onmouseleave=\"$('");
          await r.write(r.text(r.get(s, "cardframe_id")));
          await r.write("').style.display='none';\">【");
          await r.write(r.text(r.get(r.get(r.get(s, "cards"), r.get(s, "cid")), "name")));
          await r.write(" ");
          await r.write(r.text(r.get(r.get(r.get(s, "cards"), r.get(s, "cid")), "rare")));
          await r.write("】</span><br>");
          if (r.truth((!r.truth((!r.truth(r.get(s, "nowcard"))))))) {
            await r.write("<div style=\"position:relative;\">\r\n<div id=\"");
            await r.write(r.text(r.get(s, "cardframe_id")));
            await r.write("\" class=\"cardframe_show\" style=\"display:none;position:absolute;z-index:30;left:35px;top:");
            await r.write(r.text((r.truth((r.compare(r.add(r.get(s, "c"), r.get(s, "k")), 1) > 0)) ? (-r.number(335)) : 0)));
            await r.write("px;\">");
            (await r.include(r.template("MOD_CARDBASE_CARD_FRAME"), s));
            await r.write("</div>\r\n</div>");
          }
        }
      }
    }
    await r.write("</div>");
  }
  await r.write("<br><br>\r\n<input type=\"button\" class=\"cmdbutton\" value=\"卡片合成\" onclick=\"$('subcmd').value='cardmix';postCmd('gamecmd','command.php');this.disabled=true;\">\r\n&nbsp;&nbsp;<input type=\"button\" class=\"cmdbutton\" id=\"x\" value=\"[X]返回\" onclick=\"$('command').value='menu'; postCmd('gamecmd','command.php');this.disabled=true;\">");
return 1;
}
