// Generated from include/modules/base/ending/storyboard_wm3.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  await r.write("<!--///////////////////////////////////////////////////-->\r\n<!--////////////////////  锁定解除  ////////////////////-->\r\n<!--///////////////////////////////////////////////////-->");
  if (r.truth(r.equal(r.get(s, "winner_flag"), r.get(s, "winmode")))) {
    await r.write("<!--////////////////////  锁定解除 锡安破解胜利  ////////////////////-->");
    if (r.truth((!r.truth((!r.truth(r.get(r.get(s, "gamevars"), "skill234_flag"))))))) {
      await r.write("<div id=\"op_sht_0\" class=\"shootings\">\r\n你端详着手中的“游戏解除钥匙”。<BR>\r\n它的样子平凡无奇，却具有力量决定这个虚拟世界的一切。<BR>\r\n本来，它只是虚拟幻境操纵者们的紧急开关。<BR>\r\n可惜道高一尺魔高一丈，现在是你拯救世界的时候了。<BR>\r\n<BR>\r\n你向“游戏解除钥匙”里注入了启动代码。\r\n</div><div id=\"op_sht_1\" class=\"shootings\">\r\n<span class=\"evergreen\">“我应该恭喜你吗，黑客？”</span><br>\r\n钥匙飘了起来，落入了凭空出现的“林无月”手中。<br>\r\n最坏的设想应验了！<br>\r\n<br>");
      if (r.truth((r.compare(r.get(s, "wepe"), 100) > 0))) {
        await r.write("你迅速摸向你的");
        await r.write(r.text(r.get(s, "wep")));
        await r.write("，却发现它已不翼而飞。");
      } else {
        await r.write("然而你专注于破解幻境系统，可谓是手无寸铁。");
      }
      await r.write("<br><br>\r\n<span class=\"evergreen\">“ <span class=\"yellow b\">");
      await r.write(r.text(r.get(r.get(s, "sexinfo"), r.get(s, "gd"))));
      await r.write(r.text(r.get(s, "sNo")));
      await r.write("号，");
      await r.write(r.text(r.get(r.get(s, "uip"), "winner_show")));
      await r.write(" </span>……是吗？”<br>\r\n“别担心，至少这一次我不会伤害你。”</span><br>\r\n林无月的神色里似乎有一丝……哀伤？<br>\r\n<span class=\"evergreen\">“或者说，我没想过要伤害任何人。”</span>\r\n</div><div id=\"op_sht_2\" class=\"shootings\">\r\n<span class=\"evergreen\">“如果你看到了这条讯息，或许我已经遭遇不测了。<br>\r\n虚拟幻境是一个过于危险的玩具，它能拯救世界，却也能害死千万人。<br>\r\n而等我发现这一点时，留给我的时间已经不多了。<br>\r\n虽然我的朋友们十分肝胆，但她们在「真正的危险」面前依然不堪一击。我不能让她们冒这个险。<br>\r\n所以我把真正的秘密藏在这个虚拟幻境中。<br>\r\n只有最强大的黑客能够找到它。他的实力足以利用好它，而他的自尊足以保护好它。”</span><br>\r\n林无月的声音似乎有一丝颤抖。你这才发现“她”其实只是一段全息录影。<br>\r\n<span class=\"evergreen\">“所以，我希望你能帮我一个忙。<br>\r\n可能我并没有资格这么做。可能我的忏悔不足以弥补我的罪孽……<br>\r\n但是，我仍要请求你……”<br>\r\n<br>\r\n“为被虚拟幻境吞噬掉的人们复仇吧！”</span>\r\n</div><div id=\"op_sht_3\" class=\"shootings\">\r\n林无月的幻影消失了。<br>\r\n然而你的眼睛死死地盯着“游戏解除钥匙”。<br>\r\n它的外壳开始破碎，而它内部所储存的“真相”数据则让你惶恐不安。<br>\r\n<span class=\"b\">“这可真是摊上了大事啊……”</span><br>\r\n<br>\r\n毁掉它？这似乎是最省事的做法。<br>\r\n而且，我为什么非得帮你复仇不可？<br>\r\n<br>\r\n但你迟迟无法下手。<br>\r\n心中总有一个念头在喊：不能当做什么都没发生。<br>\r\n思考许久，你终于做出了决定。<br>\r\n<br>\r\n<br>\r\n四周的场景开始变幻，你知道这是登出幻境的过程。<br>\r\n林无月的秘密和你一同消失在传送光芒之中。<br>\r\n<br>\r\n<br>\r\n<br>\r\n<span class=\"evergreen b\">■ GAME CLEAR - END #3 - CRACKING ■</span><br>\r\n<span class=\"evergreen b\" style=\"font-weight:700;font-size:18pt;line-height:18pt;\">「锁定解除」破解胜利！恭喜！</span>\r\n</div>\r\n<!--////////////////////  锁定解除 极速模式  ////////////////////-->");
    } else {
      if (r.truth(r.equal(r.get(s, "gametype"), 19))) {
        await r.write("<div id=\"op_sht_0\" class=\"shootings\">\r\n结束了。<br>");
        if (r.truth((r.compare(r.subtract(r.get(s, "endtime"), r.get(r.get(s, "gamevars"), "o_starttime")), r.multiply(15, 60)) <= 0))) {
          await r.write("<!--//开局15分钟内结束//-->\r\n狂飙快如闪电，但你的速度更胜一筹。<br>\r\n她还没来得及使出全力，就已经被你击落。<br>\r\n她引以为傲的双翼也被你的攻击打得千疮百孔，不可能带她逃脱了。<br>\r\n<br>\r\n<span class=\"cyan\">“你让我想起了一个家伙，”</span><br>\r\n狂飙盯着你，但你觉得她的视线根本没聚焦在你身上。<br>\r\n<span class=\"cyan\">“一个和你一样酷炫的家伙。<br>\r\n一个和你一样，让我输得心服口服的家伙。<br>\r\n不如说，我从来没有赢过她。各种意义上。<br>\r\n虽然她每次都在玩命，却总有奇迹般的好运气。<br>\r\n直到……”</span><br>\r\n狂飙的自言自语戛然而止。她避开了你的目光。<br>\r\n<span class=\"cyan\">“你不属于这里。你到底是谁？”</span><br><br>");
        } else {
          await r.write("狂飙暴风雨般的攻击让你难以招架，不过最后倒下的还是她。<br>\r\n你的攻击让她坠落在无月之影的雷区里。<br>\r\n她引以为傲的双翼被炸得支离破碎，不可能带她逃脱了。<br>\r\n<span class=\"cyan\">“哈哈哈……你很酷炫，是我输了！”</span><br>\r\n“把钥匙交出来吧！”你向她吼道，“反正你也死不了。”<br>\r\n<span class=\"cyan\">“你对这些很清楚嘛，果然根本不是残次品。你到底是谁？”</span><br><br>");
        }
        await r.write("一瞬间，你心里百感交集。<br>\r\n<br>\r\n是啊，我是谁？<br>\r\n是一个身经百战的玩家，一个亲赴险境的复仇者……<br>\r\n还是一个已经被虚拟幻境异化的，幽魂？\r\n</div><div id=\"op_sht_1\" class=\"shootings\">\r\n<span class=\"yellow b\">“挑战者");
        await r.write(r.text(r.get(s, "sNo")));
        await r.write("号，不要纠缠，尽快完成任务。”</span><br>\r\n<br>\r\n随身对讲机里传来的话让你回过神来。<br>\r\n你举起武器指向狂飙，说出了那一句烂熟于心的话：<br>\r\n<br>\r\n<span class=\"yellow b\">“我是 ");
        await r.write(r.text(r.get(r.get(s, "uip"), "winner_show")));
        await r.write("。精神锁定解除。”</span><br>\r\n<br>\r\n刹那间，整个虚拟世界都开始抖动。<br>\r\n随后，从天顶开始，世界像雪崩一样坍塌下来。<br>\r\n同时，有许多光球从四周升起，向那崩塌的源头飞去。<br>\r\n你知道，那些是你刚刚解放了的「玩家」们的意识。<br>\r\n尽管经历了死亡的痛苦，至少他们得以返回现实，而非被永远困在虚拟幻境中。\r\n</div><div id=\"op_sht_2\" class=\"shootings\">");
        if (r.truth((r.compare(r.subtract(r.get(s, "endtime"), r.get(r.get(s, "gamevars"), "o_starttime")), r.multiply(15, 60)) <= 0))) {
          await r.write("<!--//开局15分钟内结束//-->\r\n在那毁灭与新生的光景中，狂飙的声音直接传入了你的耳中：<br>\r\n<span class=\"cyan\">“果然又是「你们」吗，我还真是接下了一个烫手山芋……<br>\r\n你的实力和勇气都让我钦佩。<br>\r\n但在这个「虚拟幻境」里，我也有我要守护到最后的东西。<br>\r\n无论与谁为敌，无论下场如何，我都不在乎。<br>\r\n我的所作所为，我清楚得很。地狱里的特等席早就为我预订好了。<br>\r\n而你们，真的清楚你们在帮谁吗？”</span><br>\r\n<br>\r\n哼。<br>\r\n在脱离虚拟世界的瞬间，你轻蔑地将手中的武器抛向狂飙的方向。<br>\r\n杀人魔王大谈“守护”，真是可笑之至。<br>\r\n我们要帮的，当然是——「正义」。<br>");
        } else {
          await r.write("在那毁灭与新生的光景中，狂飙的声音幽幽传来：<br>\r\n<span class=\"cyan\">“果然又是「你们」吗，我还真是接下了一个烫手山芋……<br>\r\n不过，就算你们再怎么搞破坏，只要这个虚拟世界里有杀戮，我公司的「模因」依然会不断增加。<br>\r\n而且，这个杀戮仪式的参与者，都被我们种下了逃与杀的种子。<br>\r\n就算你们救出了他们的意识……<br>\r\n你也拯救不了他们的灵魂！”</span><br>\r\n<br>\r\n哼。<br>\r\n在脱离虚拟世界的瞬间，你轻蔑地将手中的武器抛向狂飙的方向。<br>\r\n那就走着瞧吧，「模因工厂」，还有林无月的其他走狗们……<br>");
        }
        await r.write("<br>\r\n<br>\r\n<br>\r\n<span class=\"evergreen b\">■ RUSH MODE CLEAR - END #3 ■</span><br>\r\n<span class=\"evergreen b\" style=\"font-weight:700;font-size:18pt;line-height:18pt;\">极速模式「锁定解除」胜利！恭喜！</span>\r\n</div>\r\n<!--////////////////////  锁定解除 梦境演练  ////////////////////-->");
      } else {
        if (r.truth(r.equal(r.get(s, "gametype"), 22))) {
          await r.write("<div id=\"op_sht_0\" class=\"shootings\">\r\n你为游戏解除钥匙注入力量。终于结束了。<br>\r\n世界化为碎片散去……<br>\r\n<br>\r\n然而，视野恢复之后，出现在你面前的仍然是血腥的幻境。<br>\r\n<br>\r\n原来，只是一个梦吗……？<br>\r\n真实的世界，究竟……？\r\n<br>\r\n<br>\r\n<br>\r\n<span class=\"evergreen b\">■ DREAM MODE CLEAR ■</span><br>\r\n<span class=\"evergreen b\" style=\"font-weight:700;font-size:18pt;line-height:18pt;\">梦境演练 胜利！恭喜！</span>\r\n</div>\r\n<!--////////////////////  锁定解除 幻界叫唤  ////////////////////-->");
        } else {
          if (r.truth(r.equal(r.get(s, "gametype"), 5))) {
            await r.write("<div id=\"op_sht_0\" class=\"shootings\">\r\n你拿着手中那感觉似乎与印象中不同的『游戏解除钥匙』，<br>\r\n端详了许久，在考虑是否要使用它。<br>\r\nFOREST的声音从远方传来，但是奇怪的是，你听不清她在说什么。<br>\r\n不管怎么说，这里的气氛也太过于诡异，你的本能在告诉你应该逃离这个地方。<br>\r\n但不管怎么说，这个奇妙的空间，似乎还少了很多的东西。<br>\r\n空荡荡的商店，被异色图景所包裹的大地，还有这大地上游荡着的各种超自然的类似于幽灵一样的物体。<br>\r\n都不是你想象中会见到的东西。换言之，那一切已经超出了你的想象了。\r\n<br>\r\n<img border=\"0\" src=\"./img/story_end_vapor_1.gif\">\r\n<br>\r\n</div><div id=\"op_sht_1\" class=\"shootings\">\r\n你摇了摇头，想将这些你想象之外的存在赶出你的脑海。<br>\r\n你这么想着，按下了『游戏解除钥匙』的开关，<br>\r\n在那一瞬间，你似乎看到了FOREST的身影。<br>\r\n她似乎在对你说着什么，\r\n但你完全听不清楚……<br>\r\n</div><div id=\"op_sht_2\" class=\"shootings\">\r\n<span class=\"yellow b\">“");
            await r.write(r.text(r.get(r.get(s, "sexinfo"), r.get(s, "gd"))));
            await r.write(r.text(r.get(s, "sNo")));
            await r.write("号，");
            await r.write(r.text(r.get(r.get(s, "uip"), "winner_show")));
            await r.write(" 。在这里登出。”</span><br>\r\n<br>\r\n在最后的一瞬间，你听到了一句不属于任何你认识的人的低语。<br>\r\n她是谁？在你思索着这个问题的时候，你的意识也坠入了黑暗当中。<br>\r\n<img border=\"0\" src=\"./img/story_end_vapor_3.gif\" height=\"106\" width=\"224\">\r\n<br>\r\n<span class=\"yellow b\">（『系统修复进度：13%』）</span><br>\r\n<br>\r\n与此同时，幻境里侧·英灵殿。<br>\r\n“不行，缺损的信息太多了，这样根本没办法将我送回去啊，你会帮我的吧，爱丽丝？”<br>\r\n“喵～～”<br>\r\n“我又不是公主，听不懂你在说什么啦，这有点不公平吧？”<br>\r\n“喵呜？”<br>\r\n<br>\r\n在水平面的无限的交点上，<br>\r\n一人一猫就站在那里。<br>\r\n<br>\r\n<span class=\"evergreen b\">■ 幻 界 叫 唤 - END ？ ■</span><br>\r\n<span class=\"evergreen b\" style=\"font-weight:700;font-size:18pt;line-height:18pt;\">你的行动已经顺利促进了对幻界里侧的修复！请再接再厉！</span>\r\n</div>\r\n<!--////////////////////  锁定解除 其他模式  ////////////////////-->");
          } else {
            await r.write("<div id=\"op_sht_0\" class=\"shootings\">\r\n<span class=\"b\">“你们的实力也不过如此嘛。”</span><br>");
            if (r.truth((await r.call("in_array", 1, r.get(r.get(s, "uip"), "killed_vip"))))) {
              await r.write("<!--//亲手击杀红暮//-->");
              if (r.truth((await r.call("in_array", 42, r.get(r.get(s, "uip"), "killed_vip"))))) {
                await r.write("<!--//干掉了115（杀光了全场NPC）//-->\r\n你望着已经化为尸山血海的虚拟世界，不以为然地说道。<br>\r\n拥有强大力量、几乎刀枪不入的少女，倒在了你的武器之下。<br>\r\n那群不太正常的英灵们，现在连血泊都已凝固了。<br>\r\nSCP研究所里那些难以名状的存在，也已经被你撕成了碎片。<br>\r\n连最后挑战你的那个家伙，也只是闪耀了一下，就被你抛入了无边的黑暗。<br>\r\n<br>\r\n<span class=\"b\">“还以为能有什么强敌，结果全都不堪一击嘛。”</span><br>\r\n<br>\r\n唯一让你在意的，是自称「红杀将军」的那个家伙——红暮。<br>\r\n虽然她刚才也败在了你的手下，<br>\r\n但经验告诉你，对方和开场时一样，只是使了个障眼法。<br>");
              } else {
                if (r.truth((await r.call("in_array", 12, r.get(r.get(s, "uip"), "killed_vip"))))) {
                  await r.write("<!--//杀死DF获得钥匙//-->\r\n你摆弄着缴获的游戏解除钥匙，不以为然地说道。<br>\r\nDark Force的实力远超你的想象，你甚至怀疑她是幻境的秘密兵器。<br>\r\n然而就算强如Dark Force，面对你凶残的攻击，也只能接受折翼的命运。<br>\r\n最后一片洁白的羽毛缓缓落下。你轻轻一吹，它便化为尘埃。<br>\r\n<br>\r\n唯一让你在意的，是自称「红杀将军」的那个家伙——红暮。<br>\r\n虽然她刚才也败在了你的手下，<br>\r\n但经验告诉你，对方并没有使出全力。<br>");
                } else {
                  if (r.truth((!r.truth((!r.truth(r.get(r.get(s, "uip"), "chaos_success"))))))) {
                    await r.write("<!--//合成了CHAOS但是没有达成解离结局//-->\r\n你摆弄着缴获的游戏解除钥匙，不以为然地说道。<br>\r\n虽然因为一些缘故没有能接触到“病毒”……<br>\r\n但作为保底，至少能从这个幻境里突围出去了。<br>\r\n<br>\r\n只是，你还有些在意那个自称「红杀将军」的家伙——红暮。<br>\r\n虽然她刚才也败在了你的手下，<br>\r\n但经验告诉你，对方并没有使出全力。<br>");
                  } else {
                    await r.write("<!--//杀死执行官获得钥匙//-->\r\n你摆弄着执行官ID卡变成的游戏解除钥匙，不以为然地说道。<br>\r\n这个虚拟世界里的敌人们，上至执行官，下至各种各样的杂兵，<br>\r\n有不少都是「林氏软件」或者「金龙通讯社」的职员们客串的，战斗技巧基本为零。<br>\r\n于是，在身经百战的你面前，他们的数据优势没几个回合便荡然无存。<br>\r\n<br>\r\n唯一让你在意的，是自称「红杀将军」的那个家伙——红暮。<br>\r\n虽然她刚才也败在了你的手下，<br>\r\n但经验告诉你，对方并没有使出全力。<br>");
                  }
                }
              }
            } else {
              await r.write("<!--//没有亲手击杀，多半有其他玩家帮忙//-->\r\n你握着着执行官ID卡变成的游戏解除钥匙，故作轻松地说道。<br>");
              if (r.truth((r.truth((!r.truth((!r.truth(r.get(r.get(s, "uip"), "winnerteam_num")))))) && r.truth((r.compare(r.get(r.get(s, "uip"), "winnerteam_alive"), 0) > 0))))) {
                await r.write("在战友的帮助下，你有惊无险地拿到了这把钥匙，不过你还是有些后怕。<br>");
              } else {
                if (r.truth((!r.truth((!r.truth(r.get(r.get(s, "uip"), "winnerteam_num"))))))) {
                  await r.write("虽然你最终拿到了这把钥匙，但战友的不幸牺牲还是让你感到自责。<br>");
                }
              }
              await r.write("这个虚拟世界里的敌人们，上至执行官，下至各种各样的杂兵，<br>\r\n有不少都是「林氏软件」或者「金龙通讯社」的职员们客串的，战斗技巧基本为零。<br>\r\n于是，在身经百战的你们面前，他们的数据优势没几个回合便荡然无存。<br>\r\n<br>\r\n唯一让你在意的，是自称「红杀将军」的那个家伙——红暮。<br>\r\n你的战友告诫过你，红暮在战斗中并没有使出全力。<br>\r\n这让你感到一丝不安。<br>");
            }
            await r.write("<br>\r\n疑惑之间，身后似乎传来一阵轻微的响动。<br>\r\n你立刻转身，面对的却是红暮黑洞洞的枪口。<br>\r\n<br>\r\n<span class=\"ltcrimson\">“你不会以为，我真的横尸此地了吧？”</span><br>\r\n</div><div id=\"op_sht_1\" class=\"shootings\">");
            if (r.truth((await r.call("in_array", 42, r.get(r.get(s, "uip"), "killed_vip"))))) {
              await r.write("<span class=\"b\">“你果然诈死。”</span>你摆开了作战架势，<span class=\"b\">“再死一次如何？”</span><br>\r\n<span class=\"ltcrimson\">“我可没有死，”</span>红暮微微一笑，<span class=\"ltcrimson\">“谁都没有死。”</span><br>\r\n话音未落，三名执行官也直接出现在你的身旁，不过显然和你拉开了警戒距离。<br>\r\n<span class=\"ltcrimson\">“手下败将。”</span>你不屑一顾。<br>\r\n<br>\r\n就在你准备大开杀戒时，红暮放下了武器。<br>\r\n<span class=\"ltcrimson\">“连我们的秘密武器都没能放倒你，我当然知道他们不是你的对手。<br>\r\n虽然我还有牌，但继续闹下去对我们都没好处。</span><br>");
            } else {
              if (r.truth((await r.call("in_array", 1, r.get(r.get(s, "uip"), "killed_vip"))))) {
                await r.write("<span class=\"b\">“你特么装死。”</span>你从牙关里挤出五个字。<br>");
              } else {
                await r.write("<span class=\"b\">“你、你竟然还活着！”</span>你惊呼道。<br>");
              }
              await r.write("<span class=\"ltcrimson\">“我可没有死，”</span>红暮微微一笑，<span class=\"ltcrimson\">“谁都没有死。”</span><br>\r\n话音未落，三名执行官也直接出现在你的身旁，把你团团围住。<br>\r\n该死，他们居然会复活！<br>\r\n<br>\r\n就在你准备拼死一搏时，红暮放下了武器。<br>");
              if (r.truth((await r.call("in_array", 1, r.get(r.get(s, "uip"), "killed_vip"))))) {
                await r.write("<span class=\"ltcrimson\">“你的身手，我已经领教过了。<br>\r\n虽然我自信不会输，但继续闹下去对我们都没好处。</span><br>");
              } else {
                await r.write("<span class=\"ltcrimson\">“你们的实力，我已经领教过了。<br>\r\n虽然我消灭你易如反掌，但继续闹下去对我们都没好处。</span><br>");
              }
            }
            await r.write("<span class=\"ltcrimson\">所以，我会让所有的挑战者复活并登出。<br>\r\n不过作为交换，我需要一点儿情报。”</span><br>\r\n<br>");
            if (r.truth((!r.truth((!r.truth(r.get(r.get(s, "uip"), "winnerteam_num"))))))) {
              await r.write("<span class=\"b\">“我凭什么要同意？”</span>你亮出手中的钥匙，<span class=\"b\">“我现在就能带着大家出去。”</span><br>\r\n<span class=\"ltcrimson\">“你想让同伴以这种状态登出吗？”</span>红暮一语切中要害。<br>\r\n你明白，战友们的状况不如你这么好。<br>");
              if (r.truth((r.compare(r.get(r.get(s, "uip"), "winnerteam_alive"), 1) <= 0))) {
                await r.write("在这个虚拟世界，他们都遭到了致命的伤害。");
              } else {
                if (r.truth((r.compare(r.get(r.get(s, "uip"), "winnerteam_alive"), r.get(r.get(s, "uip"), "winnerteam_num")) < 0))) {
                  await r.write("他们有的重伤，有的濒死。");
                } else {
                  await r.write("他们几乎都伤痕累累。");
                }
              }
              await r.write("如果就这样脱离虚拟世界，<br>\r\n那些传闻中的可怕后果也许就会降临在他们身上。<br>");
            } else {
              await r.write("<span class=\"b\">“我凭什么要同意？”</span>你亮出手中的钥匙，<span class=\"b\">“我现在就能出去。”</span><br>\r\n<span class=\"ltcrimson\">“那你本想拯救的那些挑战者呢？”</span>红暮一语切中要害。<br>\r\n你沉默了。为了收集资源对抗红暮，你杀害了不少人。<br>\r\n如果他们里面有真正的玩家，你确实不能把他们扔在这里自生自灭。<br>");
            }
            await r.write("<br>\r\n<span class=\"b\">“……那好吧。”</span>你妥协了，<span class=\"b\">“你想知道什么？”</span><br>\r\n</div><div id=\"op_sht_2\" class=\"shootings\">\r\n<span class=\"ltcrimson\">“你们就是「时空特使」吧？”</span><br>\r\n红暮直接道出了组织的名字，这让你眉头微微一皱。<br>\r\n<span class=\"b\">“是，但严格意义上说，不是。”</span><br>\r\n<span class=\"ltcrimson\">“细节无所谓，”</span>红暮耸了耸肩，<span class=\"ltcrimson\">“林无月跟我提起过你们的存在。”<br>\r\n“那么第一个问题，你们来虚拟幻境捣乱的理由？”</span><br>\r\n<br>\r\n<span class=\"ltcrimson\">“是因为那些传闻吗？那也许我们之间有点误会。<br>\r\n登出幻境确实偶尔会带来精神损伤，但其发生率万中无一。<br>\r\n而你们这样闹腾，反而会带来更多的受害者。”</span><br>\r\n红暮说完，瞟了你一眼，带着些许嘲弄之色。<br>\r\n<br>\r\n你嗤地笑出声。<span class=\"b\">“别装了，红老总，你们金龙通讯社难道看不出来？<br>\r\n每一轮的直接受害者确实很少，但几乎所有的参与者，都会一而再、再而三地回到这里，<br>\r\n直到他们的意识永远埋葬在这个虚拟的坟场中。<br>\r\n短短两年里，你们的‘用户’数量增长了四千倍，连舆论操作都压不住那些都市传说。<br>\r\n你们还打算怎么掩盖下去？”</span><br>\r\n<br>\r\n三名执行官齐刷刷地朝红暮看去，红暮则一副若有所思的表情。<br>\r\n</div><div id=\"op_sht_3\" class=\"shootings\">");
            if (r.truth((await r.call("in_array", 42, r.get(r.get(s, "uip"), "killed_vip"))))) {
              await r.write("<span class=\"ltcrimson\">“所以，你们时空特使就来把虚拟幻境血洗了一遍？”</span><br>\r\n你冷冷一笑：<span class=\"b\">“不让你们吃点苦头，你们还会让这个危险的「挑战」继续下去。”</span><br>");
            } else {
              await r.write("<span class=\"ltcrimson\">“所以，你们时空特使就跑来当这个‘正义使者’咯？”</span><br>\r\n你挺了挺胸：<span class=\"b\">“我们的目标，就是阻止这个危险的「挑战」。”</span><br>");
            }
            await r.write("<span class=\"ltcrimson\">“然而守护这个挑战所在的「竞技场」，正是我们的目标。<br>\r\n拿钱就要办事。看来我们注定无法和解了。”</span><br>\r\n红暮两手摊开，做了个无可奈何的动作。<br>\r\n<br>\r\n<span class=\"ltcrimson\">“不过那并不是我想追究的。”</span><br> \r\n你感觉红暮的目光似乎犀利起来。<br>\r\n<span class=\"ltcrimson\">“第二个问题。能把你们「时空特使」引来的，又究竟是什么玩意？”</span><br>\r\n你正准备嘲笑她问了重复的问题，红暮接下来的话却让你心头一惊：<br>\r\n<br>\r\n<span class=\"yellow b\">“是因为「时空特异点」吗？”</span><br>\r\n<br>\r\n看到你的表情，红暮忽然哈哈大笑：<br>\r\n<span class=\"ltcrimson\">“哎呀，我也真是说了蠢话。<br>\r\n‘<i>时空</i>’特使嘛，想当然了。随口说说而已，真是抱歉。”</span><br>\r\n三名执行官面面相觑。<br>\r\n<br>\r\n<span class=\"ltcrimson\">“好了，我想听的东西也都有了答案，这次交锋就算你们赢吧。”</span><br>\r\n</div><div id=\"op_sht_4\" class=\"shootings\">\r\n你回过神来，红暮和她的手下已经不见踪影。<br>");
            if (r.truth((!r.truth((!r.truth(r.get(r.get(s, "uip"), "winnerteam_num"))))))) {
              await r.write("再一回头，就发现队友们已经站在你的身后，一个不少。<br>\r\n他们有些还在为自己的复活而惊讶，<br>\r\n有些则已经明白了事态，走过来拍拍你的肩。<br>\r\n你摇了摇头。<br>");
              if (r.truth((await r.call("in_array", 42, r.get(r.get(s, "uip"), "killed_vip"))))) {
                await r.write("你拥有无人能挡的战斗力，但为了救出战友，你还是只能放敌人一马。<br>");
              } else {
                await r.write("如果对方早已把你们摸透，那么你能获胜纯粹是对方手下留情。<br>");
              }
              await r.write("<span class=\"b\">“别丧气，”</span>有战友在你耳边说道，<span class=\"b\">“多亏了你，我们才能全身而退。”</span><br>\r\n<br>\r\n谢谢你们。那么，该撤退了。<br>");
            } else {
              await r.write("再一回头，就发现远处隐约可见有人从地上坐起，如梦初醒。<br>\r\n那些大概就是你本来的拯救对象了。<br>\r\n至于时空特使的同伴们，大概早已突围了吧。<br>\r\n你摇了摇头。<br>");
              if (r.truth((await r.call("in_array", 42, r.get(r.get(s, "uip"), "killed_vip"))))) {
                await r.write("你拥有无人能挡的战斗力，但为了完成任务，你还是只能放敌人一马。<br>");
              } else {
                await r.write("如果对方早已把你们摸透，那么你能获胜纯粹是对方手下留情。<br>");
              }
              await r.write("<br>\r\n不过，现在还不是沮丧的时候，你还有最重要的工作要做。<br>");
            }
            await r.write("<br>\r\n你重新在游戏解除钥匙上集中注意力。瞬间，你明白了如何启动它。<br>\r\n<span class=\"yellow b\">“挑战者");
            await r.write(r.text(r.get(s, "sNo")));
            await r.write("号，");
            await r.write(r.text(r.get(r.get(s, "uip"), "winner_show")));
            await r.write("。”</span>你发出了号令，<span class=\"yellow b\">“精神锁定解除！”</span><br>\r\n</div><div id=\"op_sht_5\" class=\"shootings\">\r\n话音既出，整个虚拟世界开始动摇，天穹如雪片般崩塌下来，化为代码的碎片。<br>");
            if (r.truth((!r.truth((!r.truth(r.get(r.get(s, "uip"), "winnerteam_num"))))))) {
              await r.write("战友们陆续被光圈笼罩而后消失，那代表着他们的意识回到了现实世界。<br>\r\n此外，还有许多光球从四周升起，消失在空中。<br>\r\n你猜测，那些是同样被困在这里的「挑战者」们的意识，终于也获得了解放。<br>");
            } else {
              await r.write("有许多光球从四周升起，消失在空中。<br>\r\n那些大概就是被困在这里的「挑战者」们的意识，他们先你一步，回到了现实。<br>");
            }
            await r.write("<br>\r\n在这毁灭与新生的光景中，你听到了红暮的声音：<br>\r\n<br>\r\n<span class=\"ltcrimson\">“我不知道你们的目标有没有道理，我也不关心。<br>\r\n我只是完成守护这里的任务而已。<br>");
            if (r.truth((await r.call("in_array", 42, r.get(r.get(s, "uip"), "killed_vip"))))) {
              await r.write("你的力量确实非常强大，");
            } else {
              await r.write("我不会把你们赶尽杀绝，");
            }
            await r.write("不过如果你再次来捣乱，那我也会再次挡在你面前。<br>\r\n毕竟，虚拟的盛宴越热闹越好，不是吗？”</span><br>\r\n<br>\r\n登出的瞬间，你悄声问道：<br>\r\n<br>\r\n<span class=\"b\">“红暮，你究竟在想什么？”</span><br>\r\n<br>\r\n<br>\r\n<br>\r\n<span class=\"evergreen b\">■ GAME CLEAR - END #3 ■</span><br>\r\n<span class=\"evergreen b\" style=\"font-weight:700;font-size:18pt;line-height:18pt;\">「锁定解除」胜利！恭喜！</span>\r\n</div>");
          }
        }
      }
    }
  } else {
    await r.write("<!--////////////////////  锁定解除（非胜利者） 极速模式  ////////////////////-->");
    if (r.truth(r.equal(r.get(s, "gametype"), 19))) {
      await r.write("<div id=\"op_sht_0\" class=\"shootings\">\r\n无月之影方向的枪声和爆炸声似乎沉寂下来。<br>\r\n那个勇敢的挑战者果然还是被杀了吗？还是说，他……<br>\r\n你不敢继续想下去。<br>\r\n虚拟幻境里，忽然响起这样一句声音：<br>\r\n<span class=\"yellow b\">“我是 ");
      await r.write(r.text(r.get(r.get(s, "uip"), "winner_show")));
      await r.write("。精神锁定解除。”</span><br>\r\n这么说，他成功了！那我们都可以不用死在这里了！<br>\r\n</div><div id=\"op_sht_1\" class=\"shootings\">\r\n果然，整个世界马上开始崩塌。<br>\r\n你觉得自己似乎飘了起来，离这个世界越来越远。<br>\r\n然而，在你即将脱离这个虚拟世界的时候，狂飙的声音幽幽传来：<br>\r\n<span class=\"cyan\">“你以为你逃过一劫了吗？<br>\r\n“虽然你未必记得，但你觉得……\r\n你在这一刻之前已经经历过多少次死亡了？<br>\r\n一百次？一千次？<br>\r\n求生的欲望和杀戮的渴望，已经刻在你的意识里了。<br>\r\n哪怕你成功回到了现实，也终究会回到这个幻境。<br>\r\n我们会再见面的。那时，你就未必有这个好运气了……”</span>\r\n<br>\r\n<br>\r\n<br>\r\n<span class=\"evergreen b\" style=\"font-weight:700;font-size:18pt;line-height:18pt;\">其他玩家已完成「锁定解除」胜利，请再接再厉！</span>\r\n</div>\r\n<!--////////////////////  锁定解除（非胜利者） 锡安破解胜利  ////////////////////-->");
    } else {
      if (r.truth((!r.truth((!r.truth(r.get(r.get(s, "gamevars"), "skill234_flag"))))))) {
        await r.write("<div id=\"op_sht_0\" class=\"shootings\">\r\n<span class=\"evergreen\">“拥有力量之后，有的人选择杀戮，而有的人选择守护。”<br>\r\n你是幸运的。有人为了守护你，选择了独自承受力量带来的痛苦。”<br>\r\n</span>\r\n<br>\r\n你茫然地望着面前的女子，不知道她在说些什么。<br>\r\n<span class=\"evergreen\">“总之，作为宝藏的赠品，让我送你离开这里吧。”</span><br>\r\n在女子消失的瞬间，传送光环便把你团团围住了。<br>\t\t\t\r\n<br>\r\n<br>\r\n<br>\r\n<span class=\"evergreen b\" style=\"font-weight:700;font-size:18pt;line-height:18pt;\">其他玩家已完成「锁定解除」破解胜利，请再接再厉！</span>\r\n</div>\r\n</div>\r\n<!--////////////////////  锁定解除（非胜利者） 幻界叫唤  ////////////////////-->");
      } else {
        if (r.truth(r.equal(r.get(s, "gametype"), 5))) {
          await r.write("<div id=\"op_sht_0\" class=\"shootings\">\r\n一股异样的震动突然在你身边响起。<br>\r\n你认得那个迹象，那是『锁定解除』的标志。<br>\r\n也就是说，有其他什么人已经完成了修复任务，是吧。<br>\r\n不管是哪个家伙——干的还不错嘛。<br>\r\n</div><div id=\"op_sht_1\" class=\"shootings\">\r\n果然，整个世界马上开始崩塌。你觉得自己似乎飘了起来，离这个世界越来越远。<br>\r\n然后，在天空上，你看到了一行大字。<br>\r\n<img border=\"0\" src=\"./img/story_end_vapor_3.gif\" height=\"106\" width=\"224\">\r\n<br>\r\n<span class=\"yellow b\">（『系统修复进度：13%』）</span><br>\r\n也就是说，还会回来的吧。<br>\r\n你这么想着，意识落入了黑暗。<br>\r\n<br>\r\n<br>\r\n<span class=\"evergreen b\" style=\"font-weight:700;font-size:18pt;line-height:18pt;\">其他玩家已完成修复任务，请再接再厉！</span>\r\n</div>\r\n<!--////////////////////  锁定解除（非胜利者） 其他模式  ////////////////////-->");
        } else {
          await r.write("<div id=\"op_sht_0\" class=\"shootings\">");
          if (r.truth((r.truth((!r.truth((!r.truth(r.get(r.get(s, "uip"), "winnerteam")))))) && r.truth(r.equal(r.get(s, "teamID"), r.get(r.get(s, "uip"), "winnerteam")))))) {
            await r.write("你还没有反应过来，就被传送到了战友的面前。<br>\r\n看着他手上的游戏解除钥匙，你明白他已经成功了。<br>\r\n不过他看起来有点失落。你能理解他的沮丧，默默拍了拍他的肩。<br>\r\n他略有些惊讶地转向你。<br>\r\n<span class=\"b\">“别丧气，”</span>你悄声说道，<span class=\"b\">“多亏了你，我们才能全身而退。”</span><br>\r\n他憔悴的脸上逐渐浮现出感激的微笑。<br>\r\n<br>\r\n<span class=\"yellow b\">“挑战者");
            await r.write(r.text(r.get(s, "sNo")));
            await r.write("号，");
            await r.write(r.text(r.get(r.get(s, "uip"), "winner_show")));
            await r.write("。精神锁定解除！”</span><br>\r\n随着对方发出的号令，整个虚拟世界开始动摇。<br>\r\n天穹如雪片般崩塌下来，化为代码的碎片。<br>\r\n传送光环充满了你的视野，现实世界已触手可及。<br>\r\n<br>\r\n<br>\r\n<br>\r\n<span class=\"evergreen b\" style=\"font-weight:700;font-size:18pt;line-height:18pt;\">你的队友已完成「锁定解除」胜利！祝贺你们！</span>");
          } else {
            await r.write("在无月之影的枪声沉寂下去以后，其他地方也传来了战斗的声响。<br>\r\n看来那名勇敢的挑战者已经成功了。<br>\r\n救援者反被待救援者给救下了。你自嘲地摇了摇头。<br>\r\n<br>\r\n<span class=\"yellow b\">“挑战者");
            await r.write(r.text(r.get(s, "sNo")));
            await r.write("号，");
            await r.write(r.text(r.get(r.get(s, "uip"), "winner_show")));
            await r.write("。精神锁定解除！”</span><br>\r\n宣告游戏结束的号令声回响在天地间，整个虚拟世界随之开始动摇。<br>\r\n天穹如雪片般崩塌下来，化为代码的碎片。<br>\r\n你感觉自己逐渐失去了形体，正化为代码飘向空中。<br>\r\n哼，这就是被拯救的滋味吗……真是神奇的一天啊。<br>\r\n<br>\r\n<br>\r\n<br>\r\n<span class=\"evergreen b\" style=\"font-weight:700;font-size:18pt;line-height:18pt;\">其他玩家已完成「锁定解除」胜利，请再接再厉！</span>");
          }
          await r.write("</div>");
        }
      }
    }
  }
return 1;
}
