// Generated from include/modules/extra/instance/instance7_tutorial/tutorial/tutorial_corpse.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  await r.write("想要从尸体上拾取什么？<br><br>\r\n<input type=\"hidden\" name=\"mode\" value=\"corpse\">\r\n<input type=\"radio\" name=\"command\" id=\"menu\" value=\"menu\" ");
  if (r.truth((r.truth((!r.truth(r.get(s, "w_money")))) && r.truth((!r.equal(r.get(s, "w_type"), 90)))))) {
    await r.write("checked");
  }
  await r.write("><a onclick=sl('menu'); href=\"javascript:void(0);\" >返回</a><br><br>");
  if (r.truth((r.truth(r.get(s, "w_weps")) && r.truth(r.get(s, "w_wepe"))))) {
    await r.write("<input type=\"radio\" name=\"command\" id=\"wep\" value=\"wep\"><a onclick=sl('wep'); href=\"javascript:void(0);\" >");
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
    await r.write("<input type=\"radio\" name=\"command\" id=\"arb\" value=\"arb\"><a onclick=sl('arb'); href=\"javascript:void(0);\" >");
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
    await r.write("<input type=\"radio\" name=\"command\" id=\"arh\" value=\"arh\"><a onclick=sl('arh'); href=\"javascript:void(0);\" >");
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
    await r.write("<input type=\"radio\" name=\"command\" id=\"ara\" value=\"ara\"><a onclick=sl('ara'); href=\"javascript:void(0);\" >");
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
    await r.write("<input type=\"radio\" name=\"command\" id=\"arf\" value=\"arf\"><a onclick=sl('arf'); href=\"javascript:void(0);\" >");
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
    await r.write("<input type=\"radio\" name=\"command\" id=\"art\" value=\"art\"><a onclick=sl('art'); href=\"javascript:void(0);\" >");
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
  if (r.truth(r.get(s, "w_itms0"))) {
    await r.write("<input type=\"radio\" name=\"command\" id=\"itm0\" value=\"itm0\"><a onclick=sl('itm0'); href=\"javascript:void(0);\" >");
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
    await r.write("<input type=\"radio\" name=\"command\" id=\"itm1\" value=\"itm1\"><a onclick=sl('itm1'); href=\"javascript:void(0);\" >");
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
    await r.write("<input type=\"radio\" name=\"command\" id=\"itm2\" value=\"itm2\"><a onclick=sl('itm2'); href=\"javascript:void(0);\" >");
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
    await r.write("<input type=\"radio\" name=\"command\" id=\"itm3\" value=\"itm3\"><a onclick=sl('itm3'); href=\"javascript:void(0);\" >");
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
    await r.write("<input type=\"radio\" name=\"command\" id=\"itm4\" value=\"itm4\"><a onclick=sl('itm4'); href=\"javascript:void(0);\" >");
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
    await r.write("<input type=\"radio\" name=\"command\" id=\"itm5\" value=\"itm5\"><a onclick=sl('itm5'); href=\"javascript:void(0);\" >");
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
    await r.write("<input type=\"radio\" name=\"command\" id=\"itm6\" value=\"itm6\"><a onclick=sl('itm6'); href=\"javascript:void(0);\" >");
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
  if (r.truth(r.get(s, "w_money"))) {
    await r.write("<input type=\"radio\" name=\"command\" id=\"money\" value=\"money\" checked><a id=\"amoney\" onclick=sl('money'); href=\"javascript:void(0);\" >");
    await r.write(r.text(r.get(s, "w_money")));
    await r.write(" 元 </a><br>");
  }
  await r.write("<input type=\"button\"  id=\"z\" value=\"[Z]提交\" onclick=\"postCmd('gamecmd','command.php');this.disabled=true;\">");
return 1;
}
