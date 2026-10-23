// Generated from include/modules/base/ending/storyboard_wm8.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  await r.write("<!--///////////////////////////////////////////////////-->\r\n<!--////////////////////  挑战结束  ////////////////////-->\r\n<!--///////////////////////////////////////////////////-->\r\n\r\n<!--////////////////////  除错模式  ////////////////////-->");
  if (r.truth(r.equal(r.get(s, "gametype"), 1))) {
    await r.write("    <div id=\"op_sht_0\" class=\"shootings\">\r\n        <span class=\"lightpink\">“各位辛苦了，这次就到此为止吧。”</span><br>\r\n        是技术总监——薇娜·安妮茜——的声音。<br>\r\n        听到这句广播，你，以及正在努力追查病毒的其他黑客们，都不约而同地停下了。<br>\r\n        <span class=\"lightpink\">“我们已经把病毒本体的位置定位到了很小的范围。<br>\r\n        然而很遗憾，凭我们目前的手段，还无法把病毒逼出它的主场。<br>\r\n        这不是你们的错。应该说，多亏了你们，才有如此进展。<br>\r\n        你们都先登出吧。我会按约定，给<span class=\"yellow b\">进度名列前茅者</span>发放报酬的。”</span>\r\n    </div>\r\n    <div id=\"op_sht_1\" class=\"shootings\">\r\n        你的眼前闪过几行小字：<br>\r\n        <br>\r\n        本次任务报酬采用绩效制，报酬多寡与测试员的进度直接挂钩。<br>\r\n        ");
    r.assign(r.slot(s, ["cl"]), (await r.module("skillbase", "skill_getvalue", 424, "lvl")));
    await r.write("        ");
    r.assign(r.slot(s, ["rank"]), (await r.module("skillbase", "skill_getvalue", 424, "rank")));
    await r.write("        ");
    r.assign(r.slot(s, ["prize"]), (await r.module("skillbase", "skill_getvalue", 424, "prize")));
    await r.write("        您本次完成了<span class=\"yellow b\">");
    await r.write(r.text(r.get(s, "cl")));
    await r.write("</span>层除错任务，在合作者中排名<span class=\"yellow b\">第");
    await r.write(r.text(r.get(s, "rank")));
    await r.write("</span>。<br>\r\n        ");
    if (r.truth(r.get(s, "prize"))) {
      await r.write("我们将支付您<span class=\"gold b\">");
      await r.write(r.text(r.get(s, "prize")));
      await r.write("切糕</span>，感谢您支持金龙通讯社。\r\n        ");
    } else {
      await r.write("很遗憾，您没有达到我们的要求，请您下次再接再厉。");
    }
    await r.write("    </div>\r\n    <div id=\"op_sht_2\" class=\"shootings\">\r\n        “骗子！合同欺诈！金龙社果然都不是好人！”碰巧又跟你凑在一起的那个测试员忿忿地骂道。<br>\r\n        而你正沾沾自喜。看来野路子很有效呢，下次还得找这帮冤大头。<br>\r\n        然而，在你们相继登出时，你隐约听到了几句不祥的话。<br>\r\n        <br>\r\n        ");
    if (r.truth((r.compare(r.get(s, "cl"), 70) >= 0))) {
      await r.write("            <span class=\"lightpink\">“目标已经很明确了。”</span><br>\r\n            <span class=\"ltcrimson\">“能招揽到这样的高手，看来「算法大师」并不是只懂算法。<br>\r\n                不过你真要把幻境翻个底朝天吗？<br>\r\n                我总觉得，<span class=\"evergreen b\">她</span>的老朋友薇娜，会珍惜<span class=\"evergreen b\">她留下来的东西</span>才对？”</span><br>\r\n            <span class=\"lightpink\">“属于谁不重要，在谁手里才重要。”</span><br>\r\n            <br>\r\n            <span class=\"ltcrimson\">“哼……我还以为你不会如此绝情呢，薇娜·安妮茜。”</span><br>\r\n            <br>\r\n            <span class=\"lightpink\">“这话轮不到你来说，红暮。”</span><br>\r\n        ");
    } else {
      await r.write("            <span class=\"lightpink\">“把虚拟幻境交给这帮人，根本不靠谱吧？”</span><br>\r\n            <span class=\"ltcrimson\">“这你就不懂了吧。我真正的目的，是欲擒故纵。<br>\r\n                就算一时没成果，也是可以接受的。”</span><br>\r\n            <span class=\"lightpink\">“我是搞技术的人，不懂你那一套统御术。”</span><br>\r\n            <span class=\"ltcrimson\">“这样才能合作愉快嘛，薇娜。”</span>\r\n        ");
    }
    await r.write("        <br>\r\n        <br>\r\n        <br>\r\n        <span class=\"evergreen b\">■ GAME CLEAR - END? ■</span><br>\r\n        <span class=\"evergreen b\" style=\"font-weight:700;font-size:18pt;line-height:18pt;\">「除错模式」结束？</span>\r\n    </div>\r\n<!--////////////////////  伐木模式  ////////////////////-->");
  } else {
    if (r.truth((r.truth(r.equal(r.get(s, "gametype"), 15)) && r.truth((await r.module("skillbase", "skill_query", 313)))))) {
      await r.write("    <span>你本局的有效最大金钱为：<span class=\"yellow\">\r\n    ");
      if (r.truth((!r.truth((await r.module("map", "get_area_wavenum")))))) {
        await r.write("        ");
        await r.write(r.text((await r.call("max", r.get(s, "money"), (await r.module("skillbase", "skill_getvalue", 313, "max_money"))))));
        await r.write("    ");
      } else {
        await r.write("        ");
        await r.write(r.text((await r.module("skillbase", "skill_getvalue", 313, "max_money"))));
        await r.write("    ");
      }
      await r.write("</span><br>\r\n    本次挑战结束，请返回游戏首页！</span>\r\n<!--////////////////////  其他模式  ////////////////////-->");
    } else {
      await r.write("    本次挑战结束，请返回游戏首页！");
    }
  }
return 1;
}
