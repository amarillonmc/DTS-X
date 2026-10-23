// Generated from include/modules/extra/item_extra/item_uvo_extra/uvo_extra_mix.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  r.imports(s, "player", "cardbase");
  await r.write("<input type=\"hidden\" name=\"mode\" value=\"command\">\r\n<input type=\"hidden\" id=\"command\" name=\"command\" value=\"card\">\r\n<input type=\"hidden\" id=\"subcmd\" name=\"subcmd\" value=\"cardmix\">\r\n<input type=\"hidden\" name=\"card_choice1\" id=\"card_choice1\" value=\"0\">\r\n<input type=\"hidden\" name=\"card_choice2\" id=\"card_choice2\" value=\"0\">\r\n<span class=\"yellow b\">卡片合成的规则如下：</span><br>\r\n1、卡片合成会消耗两张卡片，得到一张新的卡片；<br>\r\n2、两张非<span class=\"gold b\">S</span>卡的稀有度相同的卡片可合成为一张稀有度高一级的随机卡片，而两张<span class=\"gold b\">S</span>卡会合成为一张随机<span class=\"gold b\">S</span>卡；<br>\r\n3、两张稀有度差一级的卡片可合成为一张稀有度与两者中较高者相同的随机卡片；<br>\r\n4、特别地，<span class=\"grey b\">M</span>卡能和任何卡合成，得到与那张卡稀有度相同的随机卡片，且两张<span class=\"grey b\">M</span>卡可合成一张随机<span class=\"gold b\">S</span>卡；<br>\r\n5、部分卡片为特殊的<span class=\"yellow b\">素材卡</span>，无法被使用，仅可在合成中按照卡片上记述的合成效果发挥作用。一次合成中只能包含一张<span class=\"yellow b\">素材卡</span>。<br><br>\r\n请选择你要合成的卡片：<br>");
  r.assign(r.slot(s, ["cards_uvo"]), (await r.module("item_uvo_extra", "get_cards_uvo_extra", r.get(s, "sdata"))));
  if (r.truth((r.compare((await r.call("count", r.get(s, "cards_uvo"))), 2) < 0))) {
    await r.write("<br><span class=\"yellow b\">你没有足够的卡片。</span><br><br>");
  } else {
    if (r.truth((await r.call("is_array", (await r.call("range", 1, 2)))))) {
      {
        const a0 = r.copy((await r.call("range", 1, 2)));
        for (const [k0, v0] of r.entries(a0)) {
          r.assign(r.slot(s, ["i"]), v0);
          await r.write("<select name=\"card_choice");
          await r.write(r.text(r.get(s, "i")));
          await r.write("\" id=\"card_choice");
          await r.write(r.text(r.get(s, "i")));
          await r.write("\" style=\"width:200px\">");
          if (r.truth((await r.call("is_array", r.get(s, "cards_uvo"))))) {
            {
              const a1 = r.copy(r.get(s, "cards_uvo"));
              for (const [k1, v1] of r.entries(a1)) {
              r.assign(r.slot(s, ["k"]), k1);
                r.assign(r.slot(s, ["cid"]), v1);
                await r.write("<option value=\"");
                await r.write(r.text(r.get(s, "cid")));
                await r.write("\" ");
                if (r.truth(r.equal(r.get(s, "k"), r.subtract(r.get(s, "i"), 1)))) {
                  await r.write("selected");
                }
                await r.write(">【");
                await r.write(r.text(r.get(r.get(r.get(s, "cards"), r.get(s, "cid")), "name")));
                await r.write(" ");
                await r.write(r.text(r.get(r.get(r.get(s, "cards"), r.get(s, "cid")), "rare")));
                await r.write("】</option>");
              }
            }
          }
          await r.write("</select>");
        }
      }
    }
    await r.write("<br><br>\r\n<input type=\"button\" class=\"cmdbutton\" value=\"合成卡片\" onclick=\"postCmd('gamecmd','command.php');this.disabled=true;\">");
  }
  await r.write("<input type=\"button\" class=\"cmdbutton\" id=\"x\" value=\"[X]返回\" onclick=\"$('command').value='menu'; postCmd('gamecmd','command.php');this.disabled=true;\">");
return 1;
}
