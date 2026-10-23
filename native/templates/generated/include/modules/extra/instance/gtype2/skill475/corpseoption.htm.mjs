// Generated from include/modules/extra/instance/gtype2/skill475/corpseoption.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  await r.write("<input type=\"hidden\" name=\"mode\" value=\"corpse\">\r\n<input type=\"hidden\" id=\"command\" name=\"command\" value=\"\">");
  (await r.call("bubblebox_start", "id:corpseoption;height:500;width:800;"));
  await r.write("<div><div style=\"height:50px\">&nbsp;</div><div style=\"text-align:center; height:40px;\"><span class=\"lime b\" style=\"font-size:40px;\">击杀玩家</span></div><div style=\"display:inline-block;width:35px;\">&nbsp;</div><div style=\"display:inline-block;\">\r\n<br>");
  r.assign(r.slot(s, ["sk475ptgain"]), (await r.call("round", r.multiply(r.divide(r.int((await r.module("skillbase", "skill_getvalue", 475, "bounty", r.get(s, "edata")))), 0.55), 0.15))));
  await r.write("<span>你击杀了<span class=\"yellow b\">");
  await r.write(r.text(r.get(s, "w_name")));
  await r.write("</span>！你获得了<span class=\"orange\">");
  await r.write(r.text(r.get(s, "sk475ptgain")));
  await r.write("</span>点胜利点数。</span><br><br>\r\n<span>请选择一项对敌人的惩罚(请在15秒内选择，15秒后敌人复活即无法再选择)：</span><br>\r\n<table style=\"width:720px;\">\r\n<tr><td class=\"b1\" colspan=2>金钱</td></tr>\r\n<tr><td colspan=2 class=\"b3\" style=\"text-align:left; vertical-align:top;\">\r\n<div style=\"width:720px;\">\r\n<span>敌人携带了<span class=\"yellow b\">");
  await r.write(r.text(r.get(s, "w_money")));
  await r.write("</span>元。</span>");
  r.assign(r.slot(s, ["tmp"]), (await r.call("round", r.multiply(r.get(s, "w_money"), 0.3))));
  await r.write("<br>\r\n<input type=\"radio\" name=\"gtype2corpse\" id=\"money1\" value=\"money1\" checked><a onclick=sl('money1'); href=\"javascript:void(0);\" >销毁敌人<span class=\"yellow b\">30%</span>的金钱(<span>");
  await r.write(r.text(r.get(s, "tmp")));
  await r.write("</span>元)。</a><br>\r\n<input type=\"radio\" name=\"gtype2corpse\" id=\"money2\" value=\"money2\"><a onclick=sl('money2'); href=\"javascript:void(0);\" >获得敌人<span class=\"yellow b\">30%</span>的金钱(<span>");
  await r.write(r.text(r.get(s, "tmp")));
  await r.write("</span>元)，但需要放弃同等数值的胜利点数。</a><br>\r\n</td></tr>\r\n<tr><td class=\"b1\" style=\"width:360px\">装备</td><td class=\"b1\" style=\"width:360px\">物品</td></tr>\r\n<tr><td class=\"b3\" style=\"width:360px; text-align:left; vertical-align:top;\">\r\n削弱敌人的装备，对武器降低<span class=\"yellow b\">12%</span>效果值，对防具降低<span class=\"yellow b\">20%</span>效果值，摧毁饰品。<br>");
  if (r.truth((r.truth(r.get(s, "w_weps")) && r.truth(r.get(s, "w_wepe"))))) {
    await r.write("<input type=\"radio\" name=\"gtype2corpse\" id=\"wep\" value=\"wep\"><a onclick=sl('wep'); href=\"javascript:void(0);\" >");
    await r.write(r.text(r.get(s, "w_wep")));
    await r.write("/");
    await r.write(r.text(r.get(s, "w_wepk_words")));
    await r.write("/");
    await r.write(r.text(r.get(s, "w_wepe")));
    await r.write("/");
    await r.write(r.text(r.get(s, "w_weps")));
    if (r.truth(r.get(s, "w_wepsk_words"))) {
      await r.write("/");
      await r.write(r.text(r.get(s, "w_wepsk_words")));
    }
    await r.write("</a><br>");
  }
  if (r.truth((r.truth(r.get(s, "w_arbs")) && r.truth(r.get(s, "w_arbe"))))) {
    await r.write("<input type=\"radio\" name=\"gtype2corpse\" id=\"arb\" value=\"arb\"><a onclick=sl('arb'); href=\"javascript:void(0);\" >");
    await r.write(r.text(r.get(s, "w_arb")));
    await r.write("/");
    await r.write(r.text(r.get(s, "w_arbk_words")));
    await r.write("/");
    await r.write(r.text(r.get(s, "w_arbe")));
    await r.write("/");
    await r.write(r.text(r.get(s, "w_arbs")));
    if (r.truth(r.get(s, "w_arbsk_words"))) {
      await r.write("/");
      await r.write(r.text(r.get(s, "w_arbsk_words")));
    }
    await r.write("</a><br>");
  }
  if (r.truth(r.get(s, "w_arhs"))) {
    await r.write("<input type=\"radio\" name=\"gtype2corpse\" id=\"arh\" value=\"arh\"><a onclick=sl('arh'); href=\"javascript:void(0);\" >");
    await r.write(r.text(r.get(s, "w_arh")));
    await r.write("/");
    await r.write(r.text(r.get(s, "w_arhk_words")));
    await r.write("/");
    await r.write(r.text(r.get(s, "w_arhe")));
    await r.write("/");
    await r.write(r.text(r.get(s, "w_arhs")));
    if (r.truth(r.get(s, "w_arhsk_words"))) {
      await r.write("/");
      await r.write(r.text(r.get(s, "w_arhsk_words")));
    }
    await r.write("</a><br>");
  }
  if (r.truth(r.get(s, "w_aras"))) {
    await r.write("<input type=\"radio\" name=\"gtype2corpse\" id=\"ara\" value=\"ara\"><a onclick=sl('ara'); href=\"javascript:void(0);\" >");
    await r.write(r.text(r.get(s, "w_ara")));
    await r.write("/");
    await r.write(r.text(r.get(s, "w_arak_words")));
    await r.write("/");
    await r.write(r.text(r.get(s, "w_arae")));
    await r.write("/");
    await r.write(r.text(r.get(s, "w_aras")));
    if (r.truth(r.get(s, "w_arask_words"))) {
      await r.write("/");
      await r.write(r.text(r.get(s, "w_arask_words")));
    }
    await r.write("</a><br>");
  }
  if (r.truth(r.get(s, "w_arfs"))) {
    await r.write("<input type=\"radio\" name=\"gtype2corpse\" id=\"arf\" value=\"arf\"><a onclick=sl('arf'); href=\"javascript:void(0);\" >");
    await r.write(r.text(r.get(s, "w_arf")));
    await r.write("/");
    await r.write(r.text(r.get(s, "w_arfk_words")));
    await r.write("/");
    await r.write(r.text(r.get(s, "w_arfe")));
    await r.write("/");
    await r.write(r.text(r.get(s, "w_arfs")));
    if (r.truth(r.get(s, "w_arfsk_words"))) {
      await r.write("/");
      await r.write(r.text(r.get(s, "w_arfsk_words")));
    }
    await r.write("</a><br>");
  }
  if (r.truth(r.get(s, "w_arts"))) {
    await r.write("<input type=\"radio\" name=\"gtype2corpse\" id=\"art\" value=\"art\"><a onclick=sl('art'); href=\"javascript:void(0);\" >");
    await r.write(r.text(r.get(s, "w_art")));
    await r.write("/");
    await r.write(r.text(r.get(s, "w_artk_words")));
    await r.write("/");
    await r.write(r.text(r.get(s, "w_arte")));
    await r.write("/");
    await r.write(r.text(r.get(s, "w_arts")));
    if (r.truth(r.get(s, "w_artsk_words"))) {
      await r.write("/");
      await r.write(r.text(r.get(s, "w_artsk_words")));
    }
    await r.write("</a><br>");
  }
  await r.write("</div>\r\n</td><td class=\"b3\" style=\"text-align:left; width:360px; vertical-align:top;\">\r\n<div style=\"width:360px;\">\r\n<span>销毁敌人背包中的一件物品。</span><br>");
  if (r.truth(r.get(s, "w_itms0"))) {
    await r.write("<input type=\"radio\" name=\"gtype2corpse\" id=\"itm0\" value=\"itm0\"><a onclick=sl('itm0'); href=\"javascript:void(0);\" >");
    await r.write(r.text(r.get(s, "w_itm0")));
    await r.write("/");
    await r.write(r.text(r.get(s, "w_itmk0_words")));
    await r.write("/");
    await r.write(r.text(r.get(s, "w_itme0")));
    await r.write("/");
    await r.write(r.text(r.get(s, "w_itms0")));
    if (r.truth(r.get(s, "w_itmsk0_words"))) {
      await r.write("/");
      await r.write(r.text(r.get(s, "w_itmsk0_words")));
    }
    await r.write("</a><br>");
  }
  if (r.truth(r.get(s, "w_itms1"))) {
    await r.write("<input type=\"radio\" name=\"gtype2corpse\" id=\"itm1\" value=\"itm1\"><a onclick=sl('itm1'); href=\"javascript:void(0);\" >");
    await r.write(r.text(r.get(s, "w_itm1")));
    await r.write("/");
    await r.write(r.text(r.get(s, "w_itmk1_words")));
    await r.write("/");
    await r.write(r.text(r.get(s, "w_itme1")));
    await r.write("/");
    await r.write(r.text(r.get(s, "w_itms1")));
    if (r.truth(r.get(s, "w_itmsk1_words"))) {
      await r.write("/");
      await r.write(r.text(r.get(s, "w_itmsk1_words")));
    }
    await r.write("</a><br>");
  }
  if (r.truth(r.get(s, "w_itms2"))) {
    await r.write("<input type=\"radio\" name=\"gtype2corpse\" id=\"itm2\" value=\"itm2\"><a onclick=sl('itm2'); href=\"javascript:void(0);\" >");
    await r.write(r.text(r.get(s, "w_itm2")));
    await r.write("/");
    await r.write(r.text(r.get(s, "w_itmk2_words")));
    await r.write("/");
    await r.write(r.text(r.get(s, "w_itme2")));
    await r.write("/");
    await r.write(r.text(r.get(s, "w_itms2")));
    if (r.truth(r.get(s, "w_itmsk2_words"))) {
      await r.write("/");
      await r.write(r.text(r.get(s, "w_itmsk2_words")));
    }
    await r.write("</a><br>");
  }
  if (r.truth(r.get(s, "w_itms3"))) {
    await r.write("<input type=\"radio\" name=\"gtype2corpse\" id=\"itm3\" value=\"itm3\"><a onclick=sl('itm3'); href=\"javascript:void(0);\" >");
    await r.write(r.text(r.get(s, "w_itm3")));
    await r.write("/");
    await r.write(r.text(r.get(s, "w_itmk3_words")));
    await r.write("/");
    await r.write(r.text(r.get(s, "w_itme3")));
    await r.write("/");
    await r.write(r.text(r.get(s, "w_itms3")));
    if (r.truth(r.get(s, "w_itmsk3_words"))) {
      await r.write("/");
      await r.write(r.text(r.get(s, "w_itmsk3_words")));
    }
    await r.write("</a><br>");
  }
  if (r.truth(r.get(s, "w_itms4"))) {
    await r.write("<input type=\"radio\" name=\"gtype2corpse\" id=\"itm4\" value=\"itm4\"><a onclick=sl('itm4'); href=\"javascript:void(0);\" >");
    await r.write(r.text(r.get(s, "w_itm4")));
    await r.write("/");
    await r.write(r.text(r.get(s, "w_itmk4_words")));
    await r.write("/");
    await r.write(r.text(r.get(s, "w_itme4")));
    await r.write("/");
    await r.write(r.text(r.get(s, "w_itms4")));
    if (r.truth(r.get(s, "w_itmsk4_words"))) {
      await r.write("/");
      await r.write(r.text(r.get(s, "w_itmsk4_words")));
    }
    await r.write("</a><br>");
  }
  if (r.truth(r.get(s, "w_itms5"))) {
    await r.write("<input type=\"radio\" name=\"gtype2corpse\" id=\"itm5\" value=\"itm5\"><a onclick=sl('itm5'); href=\"javascript:void(0);\" >");
    await r.write(r.text(r.get(s, "w_itm5")));
    await r.write("/");
    await r.write(r.text(r.get(s, "w_itmk5_words")));
    await r.write("/");
    await r.write(r.text(r.get(s, "w_itme5")));
    await r.write("/");
    await r.write(r.text(r.get(s, "w_itms5")));
    if (r.truth(r.get(s, "w_itmsk5_words"))) {
      await r.write("/");
      await r.write(r.text(r.get(s, "w_itmsk5_words")));
    }
    await r.write("</a><br>");
  }
  if (r.truth(r.get(s, "w_itms6"))) {
    await r.write("<input type=\"radio\" name=\"gtype2corpse\" id=\"itm6\" value=\"itm6\"><a onclick=sl('itm6'); href=\"javascript:void(0);\" >");
    await r.write(r.text(r.get(s, "w_itm6")));
    await r.write("/");
    await r.write(r.text(r.get(s, "w_itmk6_words")));
    await r.write("/");
    await r.write(r.text(r.get(s, "w_itme6")));
    await r.write("/");
    await r.write(r.text(r.get(s, "w_itms6")));
    if (r.truth(r.get(s, "w_itmsk6_words"))) {
      await r.write("/");
      await r.write(r.text(r.get(s, "w_itmsk6_words")));
    }
    await r.write("</a><br>");
  }
  await r.write("</div>\r\n</div>\r\n</td></tr></table>\r\n<br>\r\n<input type=\"button\"  value=\"提交\" onclick=\"\r\nif (jQuery('#money1').is(':checked')) jQuery('#command').val('money1');\r\nif (jQuery('#money2').is(':checked')) jQuery('#command').val('money2');\r\nif (jQuery('#wep').is(':checked')) jQuery('#command').val('wep');\r\nif (jQuery('#arb').is(':checked')) jQuery('#command').val('arb');\r\nif (jQuery('#arh').is(':checked')) jQuery('#command').val('arh');\r\nif (jQuery('#ara').is(':checked')) jQuery('#command').val('ara');\r\nif (jQuery('#arf').is(':checked')) jQuery('#command').val('arf');\r\nif (jQuery('#art').is(':checked')) jQuery('#command').val('art');\r\nif (jQuery('#itm0').is(':checked')) jQuery('#command').val('itm0');\r\nif (jQuery('#itm1').is(':checked')) jQuery('#command').val('itm1');\r\nif (jQuery('#itm2').is(':checked')) jQuery('#command').val('itm2');\r\nif (jQuery('#itm3').is(':checked')) jQuery('#command').val('itm3');\r\nif (jQuery('#itm4').is(':checked')) jQuery('#command').val('itm4');\r\nif (jQuery('#itm5').is(':checked')) jQuery('#command').val('itm5');\r\nif (jQuery('#itm6').is(':checked')) jQuery('#command').val('itm6');\r\npostCmd('gamecmd','command.php');this.disabled=true;\">\r\n</div>");
  (await r.call("bubblebox_end"));
  await r.write("<img style=\"display:none;\" type=\"hidden\" src=\"img/blank.png\" onload=\"bubblebox_show('corpseoption');\">");
return 1;
}
