// Generated from templates/default/end.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  (await r.include(r.template("header"), s));
  if (r.truth((r.truth(r.equal(r.get(s, "state"), 4)) && r.truth(r.equal(r.get(s, "gametype"), 17))))) {
    await r.write("<div class=\"subtitle\">教程完成</div>\r\n<p style=\"line-height:36px\">\r\n<span class=\"linen b\">“你，赢了吗？”</span>耳机中传来<span class=\"yellow b\">李天明</span>平静的声音。<br>\r\n<span class=\"linen b\">“不，你并没有。刚才这一切不过是一次小小的‘试炼’罢了。”</span><br>\r\n说罢，你眼前的尸体、你身上的伤口、你手中的道具，不约而同地开始波动、变薄，顷刻间消失无踪。<br>\r\n“别再玩了，<span class=\"linen b\">芙蓉</span>，”耳机那边，隐隐有一位男性不耐烦的声音，“<span class=\"red b\">她</span>给我们的时间可没这么多。”<br>\r\n<span class=\"linen b\">“好啦好啦。这个战场曾经是我们的东西，就这么拱手相让不是我的风格。”</span><br>\r\n<span class=\"linen b\">“那么，我今天教的东西，你可别忘了哦。”</span><span class=\"yellow b\">李天明</span>的声音开始变得模糊。<br>\r\n<span class=\"linen b\">“其他<ruby>愿意热心教导你的人<rt style=\"font-size:10px;\">群号：123578166</rt></ruby>，也是存在的。但是，在这个虚拟战场里，厮杀才是真正的常态。”<br>\r\n“接下来，你能走多远，就靠你自己了。”</span>\r\n</p><br>");
  } else {
    if (r.truth((r.truth((r.truth((r.compare(r.get(s, "hp"), 0) <= 0)) || r.truth((r.compare(r.get(s, "state"), 10) >= 0)))) && r.truth((!r.truth((r.truth(r.equal(r.get(s, "gametype"), 1)) && r.truth(r.equal(r.get(s, "winmode"), 8))))))))) {
      if (r.truth((r.truth((r.compare(r.get(s, "state"), 10) < 0)) && r.truth(r.equal(1, r.get(s, "winmode")))))) {
        r.assign(r.slot(s, ["state"]), 11);
      }
      await r.write("<div class=\"subtitle\">");
      await r.write(r.text(r.get(r.get(s, "stateinfo"), r.get(s, "state"))));
      await r.write("</div><div><IMG src=\"img/");
      await r.write(r.text(r.get(s, "iconImg")));
      await r.write("\" width=\"140\" height=\"80\" border=\"0\"align=\"middle\" style=\"filter: grayscale(100%)\"></div><div class=\"yellow b\">");
      await r.write(r.text(r.get(s, "motto")));
      await r.write("</div><div>");
      await r.write(r.text((await r.module("player", "get_dinfo", r.get(s, "sdata")))));
      await r.write("</div>\r\n<br>\r\n<div>死亡时间：");
      await r.write(r.text(r.get(s, "dtime")));
      await r.write("</div>");
      if (r.truth((r.truth((!r.truth((!r.truth(r.get(s, "kname")))))) && r.truth((await r.call("in_array", r.get(s, "state"), r.array([[r.APPEND, 20], [r.APPEND, 21], [r.APPEND, 22], [r.APPEND, 23], [r.APPEND, 24], [r.APPEND, 28], [r.APPEND, 29]]))))))) {
        await r.write("<div>凶手：");
        await r.write(r.text(r.get(s, "kname")));
        await r.write("</div>");
      }
      if (r.truth(r.equal(r.get(s, "state"), 33))) {
        await r.write("<div><img src=\"img/gradius.jpg\" align=\"middle\" /></div>");
      }
      await r.write("<div class=\"evergreen2\">祝下次游戏好运！</div>");
    } else {
      if (r.truth(r.equal(r.get(s, "gamestate"), 0))) {
        await r.write("<p>");
        if (r.truth(r.equal(r.get(s, "winmode"), 1))) {
          await r.write("<div class=\"subtitle\">游戏结束</div>");
        } else {
          if (r.truth((r.truth(r.equal(r.get(s, "winmode"), 2)) && r.truth(r.equal(r.get(s, "winner_flag"), r.get(s, "winmode")))))) {
            await r.write("<div class=\"subtitle\">最后幸存</div>");
          } else {
            if (r.truth(r.equal(r.get(s, "winmode"), 2))) {
              await r.write("<div class=\"subtitle\">游戏结束</div>");
            } else {
              if (r.truth(r.equal(r.get(s, "winmode"), 3))) {
                await r.write("<div class=\"subtitle\">锁定解除</div>");
              } else {
                if (r.truth(r.equal(r.get(s, "winmode"), 5))) {
                  await r.write("<div class=\"subtitle\">核弹引爆</div>");
                } else {
                  if (r.truth(r.equal(r.get(s, "winmode"), 6))) {
                    await r.write("<div class=\"subtitle\">游戏被GM中止</div>");
                  } else {
                    if (r.truth(r.equal(r.get(s, "winmode"), 7))) {
                      await r.write("<div class=\"subtitle\">幻境解离</div>");
                    } else {
                      if (r.truth(r.equal(r.get(s, "winmode"), 8))) {
                        await r.write("<div class=\"subtitle\">挑战结束</div>");
                      }
                    }
                  }
                }
              }
            }
          }
        }
        await r.write("</p>");
        if (r.truth((r.truth((await r.call("defined", "MOD_ENDING"))) && r.truth((await r.module("ending", "ending_by_shootings_available")))))) {
          await r.write("<!--全部放到ending模块里-->");
          (await r.include(r.template("MOD_ENDING_STORYBOARD_CONTAINER"), s));
          await r.write("<!--如果你在看这段代码，不要看了，去看ending模块。这里只是备胎。-->");
        } else {
          if (r.truth(r.equal(r.get(s, "winmode"), 1))) {
            await r.write("<!--游戏结束-->\r\n全灭结局，理论上不应该出现这行字，请联系管理员。<br>");
          } else {
            if (r.truth((r.truth(r.equal(r.get(s, "winmode"), 2)) && r.truth(r.equal(r.get(s, "winner_flag"), r.get(s, "winmode")))))) {
              await r.write("<!--最后幸存-->");
              if (r.truth(r.equal(19, r.get(s, "gametype")))) {
                await r.write("<p>\r\n你和最后一名玩家对峙着。他的眼神坚毅而犀利，显然为了活下来也豁出去了。<BR>\r\n然而你们二者之间只能幸存一个。<BR>\r\n对方紧握武器的手动了起来，然而你手中的");
                await r.write(r.text(r.get(r.get(s, "iteminfo"), r.get(s, "wepk"))));
                await r.write("比他更快。<BR>\r\n电光火石之间，你们胜负已分。<BR>\r\n<BR>\r\n狂飙呢，她在哪？<BR>\r\n“我、我赢了！”你不知道该向哪里喊，只好望向天空，“按约定，放我出去！”<BR>\r\n<span class=\"cyan b\">“你的发挥确实不错，让我公司得到了相当优质的「模因」呢。”</span><br>\r\n这么说，真的可以逃出这个地狱了！\r\n<br>你握着武器的手因为狂喜而微微颤抖。<BR>\r\n<span class=\"cyan b\">“我当然会遵守约定释放你。\r\n<BR>不过，离开虚拟幻境之后，我公司就概不负责了。”</span><br>\r\n<span class=\"cyan b\">那么，作为程序的一部分，报出你的名字吧。”</span><br>\r\n你心底似乎有什么被触动了，如条件反射般张口报出了那段熟悉的台词。<BR>\r\n<span class=\"yellow b\">“挑战者");
                await r.write(r.text(r.get(s, "sNo")));
                await r.write("号，");
                await r.write(r.text(r.get(s, "name")));
                await r.write("。 ”</span><BR>\r\n<br>\r\n几乎是瞬间，你身边再次出现了传送光环。<BR>\r\n你知道那一定是送你回家的，虽然你直到目前为止还想不起来家在哪，不过终归会想起来的吧。<BR>\r\n光环越来越耀眼，幻境的景色已经看不到了。<BR>\r\n你想把手里沾满鲜血的武器丢掉，但心中的不安让你把武器越抓越紧。<BR>\r\n<span class=\"cyan b\">“那么，再见了，勇敢的挑战者。”</span>狂飙的语气似乎有一丝不怀好意。<br>\r\n<span class=\"cyan b\">“<i>后会有期。</i>”</span>\r\n<br>\r\n<br>\r\n<br>\r\n<span class=\"evergreen b\">■ RUSH MODE CLEAR - END #1 ■</span><br>\r\n<span class=\"evergreen b\" style=\"font-weight:700;font-size:18pt;line-height:18pt;\">极速模式「最后幸存」胜利！恭喜恭喜！</span>\r\n</p>");
              } else {
                await r.write("<p>噗通。<BR>\r\n眼前，浑身是血的网友直勾勾地盯着我，然后跪倒在地。<BR>\r\n血从他身上那可怖的伤口里，像喷泉一样涌出来。<BR>\r\n我和他双目对视，看着他眼中的生命之火迅速熄灭。<BR>\r\n又一个，死了。</p>\r\n<p><span class=\"yellow b\">“所以你看到了么，客户，现在这里的情况还很安全。”</span><BR>\r\n<span class=\"cyan b\">“MISSION COMPLETE，Retreat。”</span><BR>\r\n这些声音……是开局时见到的那两位红杀成员们！她们的声音为什么会直接出现在我的脑海里？<BR>\r\n<span class=\"yellow b\">“请稍等片刻，马上就放你出去。好好等着吧。”</span></p>\r\n<p>是嘛……我活下来了啊，最后我终于活下来了啊！哈哈，啊哈哈哈……<BR>\r\n我呆滞地笑着，抬头望向苍天。<BR>\r\n身边的景物开始模糊崩坏。<BR>\r\n虚拟世界的运行，马上就要被停止了吧。这之后，首席执行官们，真的会放我出去吗？<BR>\r\n还是说，他们会把我也一起杀掉？<BR>\r\n不过，我没功夫考虑那么多了。</p>\r\n<p>高度紧绷的心弦断开的一瞬间，睡意便马上袭来。<BR>\r\n数个小时的生死搏斗之后，疲惫的身体开始失去知觉，紧张的神经开始不听使唤。<BR>\r\n不能睡去，要警觉！但是，尽管我拼命地提醒自己，倦意还是把我整个笼罩了。<BR>\r\n视野开始模糊了，我无可挽回地沉入了梦乡。</p>\r\n<p>……<BR>\r\n……<BR>\r\n……</p>\r\n<p>我仿佛又回到了呼啸着血雨腥风的大逃杀战场上。<BR>\r\n被我亲手劈下头颅的网友，又扯着自己的脑袋站起来说道：<BR>\r\n“你比杨叫兽还厉害嘛，人都给你杀光了。”<BR>\r\n在我身后，失去了半个身体的技术帝抱住了我的脚：<BR>\r\n“说什么‘逃出去以后，一起出同人本吧’的人，不是你吗！”<BR>\r\n身旁黑暗的角落更是传来了此起彼伏的怒吼声：<BR>\r\n“傻逼！”<BR>\r\n“干掉他！”<BR>\r\n我就这样任由他们折磨着自己。<BR>\r\n想说点什么，但是嗓子好像被什么攥住了，只有泪水不断地滚落下来。<BR>\r\n……好不容易发出点声音，但是却带着哭腔：<BR>\r\n“不、不是我的错啊！错的……错的是这个世界啊！”</p>\r\n<p>……<BR>\r\n……<BR>\r\n……</p>\r\n<p>身体的摇晃感，让我苏醒过来。<BR>\r\n原来是梦啊，还好……<BR>\r\n我向四周望去，自己似乎身在奇怪的车辆之中。<BR>\r\n旁边身穿黑衣的男子朝这边瞟了一眼，又转过头去。<BR>\r\n这里大概就是现实世界了吧。<BR>\r\n膝盖上有张纸条。拾起一看，只有一行小字：<BR>\r\n<span class=\"evergreen b\">“待会见记者。不要做你不该做的事。林无月”</span><BR>\r\n林无月……那两个佣兵刺客的雇主吗……<BR>\r\n这难看而冷酷的词句让我刚刚放下的心再度悬了起来。<BR>\r\n就算逃到现实中，也还是没法摆脱这种梦魇吗？</p>\r\n<p>突然，车门打开了。让人睁不开眼的闪光灯的浪潮中，无数话筒伸了过来。<BR>\r\n我漠然地抬起头。<BR>\r\n挤到最前排的记者们推搡着，在警察的阻挡下努力向我靠近。<BR>\r\n一个看不清的面孔凑了上来，拿着话筒像连珠炮一样发问着：<BR>\r\n“……你是这次ACFUN动漫祭事故的唯一生还者吧？<BR>\r\n“我们XX网络电视频道向对你做个简单的采访……首先你的名字是？……”<BR>\r\n未曾料到的情况冲击着我的神经。<BR>\r\n事故？这是怎么回事？……</p>\r\n<p>身旁的男子此刻站起来挡住记者的视线：<BR>\r\n“他因为冲击而失忆了，请不要刺激他。”<BR>\r\n趁警察和记者正推搡着，男子想要把我重新拽回车里去。</p>\r\n<p>冲击？失忆？……<BR>\r\n难道……<BR>\r\n在我昏睡的时候，那力量……<BR>\r\n把一切都篡改了吗？</p>\r\n<p>不过，不论如何，这是在现实世界。<BR>\r\n这不是大逃杀的野蛮国度，而是有法律的文明世界。<BR>\r\n不会再有你死我活的追杀和赤裸裸的生命威胁了。<BR>\r\n只要我把一切说出，众目睽睽之下，就算神通广大如他们，也没法把我怎么样吧！<BR>\r\n我下定了决心。</p>\r\n<p>在下一个闪光亮起的一瞬间，我挣脱了男子的手臂，然后向记者们冲去。<BR>\r\n一边跑着，一边以人生中最高亢的声调喊出：<BR>\r\n<span class=\"yellow b\">“ ");
                await r.write(r.text(r.get(r.get(s, "sexinfo"), r.get(s, "gd"))));
                await r.write(r.text(r.get(s, "sNo")));
                await r.write("号，");
                await r.write(r.text(r.get(s, "name")));
                await r.write(" ”</span><BR>\r\n然后，不顾众人惊愕的目光，<BR>\r\n以自己都不敢相信的语速，<BR>\r\n将这次大逃杀的参与者，也就是死在我手下的众网友们的名字，一一报出。</p>\r\n<p>支撑着我胜出的，是对那渺茫的希望的追求。<BR>\r\n我要逃出这个虚拟的魔窟，<BR>\r\n我要把实情告诉每一个人，<BR>\r\n我要让那些不可理喻的幕后力量，<BR>\r\n那些以净化网络的名义，践踏我们的生命的狂人们，<BR>\r\n受到他们应有的制裁！</p>\r\n<p>为了这样做，就只能……<BR>\r\n就只能，取得这场生存游戏的胜利……<BR>\r\n就只能，把原本在同一阵线的网友们，全部杀光……</p>\r\n<p>诚然，下这样的决心并不容易。<BR>\r\n然而，这就是，我的信念。<BR>\r\n我要用自己的这双手，<BR>\r\n这双沾满人类鲜血的手，<BR>\r\n亲手撕开他们虚伪的面皮！</p>\r\n<p>所以，被我杀害的网友们啊……<BR>\r\n被我杀害的技术帝们啊……<BR>\r\n所有被我杀害的，那一个一个鲜活的生命们啊……<BR>\r\n我会继承你们的生命，<BR>\r\n带着你们的仇恨，<BR>\r\n怀着你们的希望，<BR>\r\n活下去。<BR>\r\n努力地活下去。<BR>\r\n就算后半生只能在噩梦中挣扎，<BR>\r\n就算今后的笑容里都带着泪光，<BR>\r\n我也要、我也要……</p>\r\n<p>“大家，都死了……<BR>\r\n“但是、大家都在这里，都活在这里啊！”<BR>\r\n此时此刻，我已泣不成声。</p>\r\n<p>接下来，在表情错愕的警察面前，<BR>\r\n在震惊之余记录下每一句话的记者面前，<BR>\r\n在捂住嘴巴不敢发声的围观的路人面前，<BR>\r\n我克制着自己的悲痛，<BR>\r\n努力地、一字一句地，<BR>\r\n将那十数个小时的地狱之行，和盘托出。</p>\r\n<p>……<BR>\r\n……<BR>\r\n……</p>\r\n<p>某月某日，空无一人的ACFUN动漫祭会场。<BR>\r\n参加会展的仪器都已经搬空，偌大的会场里，只有大屏幕还在显示着新闻。<BR>\r\n“……警方对前段日子的动漫祭特大恶性杀人事件的调查已经告一段落，现在让我们来回顾一下事件的始末……”<BR>\r\n会场里仅有的一名黑衣男子，似乎对这爆炸性的新闻丝毫不感兴趣，自顾自地打着手机。<BR>\r\n“你们两个人对赏金还满意么？”<BR>\r\n<span class=\"lime b\">“酬金已经收到……您出手可真大方”</span>女子的声音。<BR>\r\n“哼哼，就算被时空特使注意到了也没用吧……”男子笑道，随后压低了声音，“这次的行动十分顺利。那么，下次也请你们多多关照了。”<BR>\r\n<span class=\"cyan b\">“哎呀呀，终于能自由说话了真好，总是指令啥的闷死了……”</span>另外一个轻快的声音。<BR>\r\n“不知道么蓝凝，那个也是萌属性的一种……总之现在不是插科打诨的时候，改日继续联系。”<BR>\r\n男子挂上了手机，嘴边抹出一个微笑：“做的很不错啊，你们……”</p>\r\n<br>\r\n<br>\r\n<br>\r\n<span class=\"evergreen b\">■ GAME CLEAR - END #1 ■</span><br>\r\n<span class=\"evergreen b\" style=\"font-weight:700;font-size:18pt;line-height:18pt;\">「最后幸存」胜利！恭喜恭喜！</span>");
              }
            } else {
              if (r.truth(r.equal(r.get(s, "winmode"), 2))) {
                await r.write("<!--最后幸存（非获胜玩家）-->\r\n你被杀了，理论上不应该出现这行字，请联系管理员。<br>");
              } else {
                if (r.truth((r.truth(r.equal(r.get(s, "winmode"), 3)) && r.truth(r.equal(r.get(s, "winner_flag"), r.get(s, "winmode")))))) {
                  await r.write("<!--锁定解除-->");
                  if (r.truth(r.equal(19, r.get(s, "gametype")))) {
                    await r.write("<p>\r\n结束了。<br>\r\n<span class=\"cyan b\">狂飙</span>如疾风骤雨般的攻击险些就把你吞没了，不过最后倒下的还是她。<br>\r\n<span class=\"cyan b\">“哈哈哈……你很酷炫，是我输了！”</span><br>\r\n你循声望去，嘲弄地瞟了瞟倒在地上的狂飙。<br>\r\n她坠落在自己布设的雷场里，那双带着她恣意翱翔的翅膀已经被炸烂，不可能逃脱了。<br>\r\n“把钥匙交出来吧！”你向她吼道，“反正你也死不了。”<br>\r\n<span class=\"cyan b\">“很明白嘛，你果然根本不是残次品。你到底是谁？”</span><br>\r\n一瞬间，你心里百感交集。<br>\r\n<br>\r\n是啊，我是谁？<br>\r\n是一个身经百战的玩家，一个亲赴险境的复仇者……<br>\r\n还是一个已经被虚拟幻境异化的，幽魂？<br>\r\n<br>\r\n<span class=\"yellow b\">“挑战者");
                    await r.write(r.text(r.get(s, "sNo")));
                    await r.write("号，不要纠缠，尽快完成任务。”</span><br>\r\n<br>\r\n随身对讲机里传来的话让你回过神来。<br>\r\n你举起武器指向狂飙，说出了那一句烂熟于心的话：<br>\r\n<br>\r\n<span class=\"yellow b\">“我是 ");
                    await r.write(r.text(r.get(s, "name")));
                    await r.write("。精神锁定解除。”</span><br>\r\n<br>\r\n刹那间，整个虚拟世界都开始抖动。随后，从天顶开始，世界像雪崩一样坍塌下来。<br>\r\n同时，有许多光球从四周升起，向那崩塌的源头飞去。<br>\r\n你知道，那些是你刚刚解放了的「玩家」们的意识。<br>\r\n尽管经历了死亡的痛苦，至少他们得以返回现实，而非被永远困在虚拟幻境中。<br>\r\n<br>\r\n在那毁灭与新生的光景中，狂飙的声音幽幽传来：<br>\r\n<span class=\"cyan b\">“果然又是「你们」吗，我还真是接下了一个烫手山芋……<br>\r\n不过，就算你们再怎么搞破坏，只要这个虚拟世界里有杀戮，我公司的「模因」依然会不断增加。<br>\r\n而且，这个杀戮仪式的参与者，都被我们种下了逃与杀的种子。<br>\r\n就算你们救出了他们的意识，你也拯救不了他们的灵魂！”</span><br>\r\n<br>\r\n哼。在脱离虚拟世界的瞬间，你轻蔑地将手中的武器抛向狂飙尸体的方向。<br>\r\n那就走着瞧吧，「模因工厂」，还有林无月的其他走狗们……<br>\r\n<br>\r\n<br>\r\n<br>\r\n<span class=\"evergreen b\">■ RUSH MODE CLEAR - END #3 ■</span><br>\r\n<span class=\"evergreen b\" style=\"font-weight:700;font-size:18pt;line-height:18pt;\">极速模式「锁定解除」胜利！恭喜恭喜！</span>\r\n</p>");
                    if (r.truth(r.equal(5, r.get(s, "gametype")))) {
                      await r.write("<p>\r\n你拿着手中那感觉似乎与印象中不同的『游戏解除钥匙』，<br>\r\n端详了许久，在考虑是否要使用它。<br>\r\nFOREST的声音从远方传来，但是奇怪的是，你听不清她在说什么。<br>\r\n不管怎么说，这里的气氛也太过于诡异，你的本能在告诉你应该逃离这个地方。<br>\r\n但不管怎么说，这个奇妙的空间，似乎还少了很多的东西。<br>\r\n<br>\r\n你摇了摇头，按下了『游戏解除钥匙』的开关，<br>\r\n在那一瞬间，你似乎看到了FOREST的身影。<br>\r\n但你还是听不清楚她想对你说些什么……<br>\r\n<br>\r\n<span class=\"yellow b\">“挑战者");
                      await r.write(r.text(r.get(s, "sNo")));
                      await r.write("号，");
                      await r.write(r.text(r.get(s, "name")));
                      await r.write("。在这里登出。”</span><br>\r\n<br>\r\n在最后的一瞬间，你听到了一句不属于任何你认识的人的低语。<br>\r\n她是谁？在你思索着这个问题的时候，你的意识也坠入了黑暗当中。<br>\r\n<br>\r\n<span class=\"yellow b\">『系统修复进度：8%』</span><br>\r\n<br>\r\n“不行，缺损的信息太多了，这样根本没办法将我送回去啊，你会帮我的吧，爱丽丝？”<br>\r\n“喵～～”<br>\r\n“我又不是公主，听不懂你在说什么啦，这有点不公平吧？”<br>\r\n“喵呜？”<br>\r\n<br>\r\n在水平面的无限的交点上，<br>\r\n一人一猫就站在那里。<br>\r\n<br>\r\n<br>\r\n<br>\r\n<span class=\"evergreen b\">■ 幻 界 叫 唤 - END ？ ■</span><br>\r\n<span class=\"evergreen b\" style=\"font-weight:700;font-size:18pt;line-height:18pt;\">你的行动已经顺利促进了对幻界里侧的修复！请再接再厉！</span>\r\n</p>");
                    } else {
                      if (r.truth((r.truth((await r.module("skillbase", "skill_query", 367))) && r.truth((r.compare((await r.module("skillbase", "skill_getvalue", 367, "cnt")), 50) >= 0))))) {
                        await r.write("<!--其实破解到50层以后杀执行官解禁也能触发这个文本-->\r\n<p>\r\n你端详着手中的“游戏解除钥匙”。它的样子平凡无奇，却具有力量决定这个虚拟世界的一切。<BR>\r\n本来，它只是虚拟幻境操纵者们的紧急开关。可惜道高一尺魔高一丈，现在是你拯救世界的时候了。<BR>\r\n你向“游戏解除钥匙”里注入了代码。<br><br>\r\n<span class=\"evergreen b\">“我应该恭喜你吗，黑客？”</span><br>\r\n钥匙从你的手中飘了起来，落入了凭空出现的“林无月”手中。<br>\r\n最坏的设想应验了！<br>\r\n{if ");
                        await r.write(r.text(r.get(s, "wepe")));
                        await r.write("}你迅速摸向你的");
                        await r.write(r.text(r.get(s, "wep")));
                        await r.write("，却发现它已不翼而飞。");
                      } else {
                        await r.write("然而你专注于破解幻境系统，可谓是手无寸铁。");
                      }
                    }
                    await r.write("<br><br>\r\n<span class=\"evergreen b\">“ <span class=\"yellow b\">");
                    await r.write(r.text(r.get(r.get(s, "sexinfo"), r.get(s, "gd"))));
                    await r.write(r.text(r.get(s, "sNo")));
                    await r.write("号，");
                    await r.write(r.text(r.get(s, "name")));
                    await r.write(" ”</span>……是吗？<br>\r\n“别担心，至少这一次我不会伤害你。”</span><br>\r\n林无月的神色里似乎有一丝……哀伤？<br>\r\n<span class=\"evergreen b\">“或者说，我没想过要伤害任何人。”<br><br>\r\n“如果你看到了这条讯息，或许我已经遭遇不测了。<br>\r\n“虚拟幻境是一个过于危险的玩具，而等我发现这一点时，留给我的时间已经不多了。<br>\r\n“虽然我的朋友们十分肝胆，但她们在“真正的危险”面前依然不堪一击。我不能让她们冒这个险。<br>\r\n“所以我把真正的秘密藏在这个虚拟幻境中。<br>\r\n“只有最强大的黑客能够找到它。他的实力足以利用好它，而他的自尊足以保护好它。</span><br>\r\n林无月的声音似乎有一丝颤抖。你这才发现“她”其实只是一段全息录影。<br>\r\n<span class=\"evergreen b\">“所以，我希望你能帮我一个忙。<br>\r\n“可能我并没有资格这么做。但是，就算我对幻境的热爱不足以弥补我的罪孽……<br>\r\n“也请你为被虚拟幻境吞噬掉的人们复仇吧！”</span><br><br>\r\n林无月的幻影消失了。四周的场景也开始变幻，你知道这是登出幻境的过程。<br>\r\n然而你的眼睛死死地盯着“游戏解除钥匙”。<br>\r\n它的外壳开始破碎，而它内部所储存的“真相”数据则让你惶恐不安。<br>\r\n“这可真是摊上了大事啊……”林无月的秘密和你一同消失在了传送光芒之中。<br>\r\n</p>\r\n<br>\r\n<br>\r\n<br>\r\n<span class=\"evergreen b\">■ GAME CLEAR - END #3 - CRACKING ■</span><br>\r\n<span class=\"evergreen b\" style=\"font-weight:700;font-size:18pt;line-height:18pt;\">「锁定解除」破解胜利！恭喜恭喜！</span>");
                  } else {
                    await r.write("<p>“哈……哈……”我疲惫地呼吸着。<br>\r\n三名幻影执行官，之前在开幕仪式上口出狂言的家伙们，如今都面朝下静静地躺在血泊之中。<br>\r\n如以前的生存者们传说的那样，他们很强。但是，仍然不敌我的攻击而倒下了。<br>\r\n他们原本威武的制服已经被我的攻击撕碎，同他们三人的身躯一样千疮百孔。<br>\r\n这样的身躯，绝然不会再有生还的希望。<br>\r\n“这是报应，恶魔们。”我朝尸体的方向恶狠狠地啐了一口。<br>\r\n忽然，倒在地上了无生气的尸体仿佛变得透明了。<br>\r\n我吃了一惊，定睛再望，地上哪里还有他们三人的踪影。</p>\r\n<p><span class=\"evergreen b\">“能够将咱的首席执行官们击倒，真是可喜可贺。”</span><br>\r\n一名女子的声音响起，似乎是直接从我的脑内传出。<br>\r\n“谁！？”我手持武器四面环顾，周围一个人都没有。<br>\r\n<span class=\"evergreen b\">“咱是林无月，ACFUN动漫祭的董事长，也是这个虚拟世界的主人。”<BR>\r\n“首席执行官都是咱亲自挑选的精英，能将他们打败，你的力量不可小觑。”<BR>\r\n“不过，这整个虚拟现实世界，都在咱的掌控之下。”<br>\r\n“也就是说，咱随时可以将你直接抹杀。”<BR>\r\n“但是看在你的努力的份上，咱就给你一次离开的机会。”</span><br>\r\n林无月的语气听上去就像在评论一部三流新番，<br>\r\n<span class=\"evergreen b\">“那么，这是给你的奖品，好好利用吧。”</span><br>\r\n随着声音的消失，我的手中凭空出现一张钥匙卡。<br>\r\n这大概就是中止这场闹剧的关键了吧。</p>\r\n<p>“GAME OVER！这个游戏已经完了！”我利用钥匙赋予的通讯机能向所有仍生还的网友们宣布，“已经不用再互相残杀了！”<br>\r\n之后，兴味索然地坐了下来。<br>\r\n什么“奖品”……难道我们只不过是玩具吗？<br>\r\n难道我们的生命就跟玩具一样，应当受人摆弄吗？……<br>\r\n一开始说什么“净化网络风气”，但是这样的活动，只会让人心变得更加扭曲吧！？<br>\r\n这样的行径，怎么可以容忍……<br>\r\n怎么能就这样善罢甘休！<br>\r\n意识深处早已义愤填膺，但是我强忍怒火，装作懒洋洋地把玩着已经失去意义的武器。</p>\r\n<p>让我克制下来的不只是劳累和伤痛。<br>\r\n还有，在之前的你死我活的战斗中被我有意无意忽略掉的，理性。<br>\r\n仔细想来，她说的一点没错。<br>\r\n就凭我的攻击，什么都做不到。<br>\r\n她就是这个世界的管理员，只要她愿意，什么都能办到。<br>\r\n禁区的创造、对入侵系统的人的惩罚，还有许许多多蛛丝马迹……<br>\r\n诚然我能够在游戏中胜出，<br>\r\n诚然我可以击败她最得力的手下们，<br>\r\n但是，如果我要面对的是整个世界，<br>\r\n整个完全按这个女人的意志运行的世界……<br>\r\n我还能够与之对抗吗？<br>\r\n我歪着脑袋，思考着这个问题。</p>\r\n<p>……<BR>\r\n……<BR>\r\n……</p>\r\n<p>远处，收到游戏结束消息的残存的网友们，正互相搀扶着朝这里聚集而来。<br>\r\n很快，整个世界都将崩溃，而还活着的人将回到现实。这是游戏解除钥匙告诉我的事。<br>\r\n目的地？也许是那个数小时前还被友谊与激情填满的会场吧。<br>\r\n还活着的每个人都能回去，这还真是一个皆大欢喜的结局。 真是这样么？</p>\r\n<p>当然不是这样。<br>\r\n“每个人都能分到补给品！不准争抢！”<br>\r\n虽然游戏已经终止了……<br>\r\n可是黑暗的种子，已经在参与游戏的每一个人心中深处生根发芽，开出黑色的花朵。<br>\r\n为了抢夺剩下的一点补给，好些人都有意无意地下了狠手。<br>\r\n虽然由于我的干预，没能酿成惨剧，<br>\r\n但是我明白，他们惧怕的不是道德的底线，而是我手中的棍棒。<br>\r\n也许沐浴了血雨之后，人们便不再相信阳光。<br>\r\n那一双双狼一般的眼神，宣示着每个人心底的恶魔的苏醒。<br>\r\n自己曾经奋力保护的网友们却变成这个穷凶极恶的样子，这让我也觉得非常沮丧。<br>\r\n更让我恐惧的是，我心里也似乎有一只魔鬼，在引诱我抡起棍棒，挨个敲开面前每个人的脑壳。<br>\r\n万幸的是，现在我还能克制得住。<br>\r\n但是这嗜血的欲望挥之不去，而且不断滋长着。<br>\r\n也许最终它会把我完全控制，然后掀起腥风血雨。<br>\r\n这样的我们，这样的我，还能回到原来的那个世界去么？</p>\r\n<p>而且，那个女人和她的组织肯定不会善罢甘休的。<br>\r\n也许回到现实之后，还有更可怕的噩梦在等待着我们。<br>\r\n林无月带来的。网友们带来的。我带来的。<br>\r\n那么，接下来应该怎么办呢？</p>\r\n<p>怎么办？不是已经有答案了吗？<br>\r\n如果被惨剧包围，那就把那噩梦的源头撕碎。<br>\r\n如果被血雨笼罩，那就把那鲜红的积云扑杀。<br>\r\n一切的根源，在于林无月。<br>\r\n只要能真正打倒了她，那么我们这些受害者大概也就能得到救赎了吧？<br>\r\n不，没有大概。<br>\r\n一定会的。<br>\r\n一定是的，<br>\r\n所以，要击败林无月。<br>\r\n击败她。<br>\r\n击败她！<br>\r\n击败她！！！<br>\r\n如果我还不能击败她，那就变得比她更强！<br>\r\n直到她再也不能伤我分毫！<br>\r\n直到这个世界也不能阻止我掀翻它的步伐！</p>\r\n<p>……</p>\r\n<p>在世界崩溃之际，我握紧拳头，将手臂高举着伸向苍天。<br>\r\n如果能看到自己的面庞，那么我脸上洋溢着的笑容想必连自己也会感到惊讶。</p>\r\n<p><span class=\"yellow b\">“我是，");
                    await r.write(r.text(r.get(r.get(s, "sexinfo"), r.get(s, "gd"))));
                    await r.write(r.text(r.get(s, "sNo")));
                    await r.write("号，");
                    await r.write(r.text(r.get(s, "name")));
                    await r.write("。”<br>\r\n“我还会再回来的。”<br>\r\n“走着瞧吧，林无月！”</span></p>\r\n<p>……<BR>\r\n……<BR>\r\n……</p>\r\n<p>“对不起，董事长阁下。我们没能阻止这批玩家。”<br>\r\n<p>“MISSION……任务失败。”<br>\r\n不知何时，不知何地，不知何人，正诚恳地道歉着。<br>\r\n<span class=\"evergreen b\">“也许那就是咱要找的人吧？拥有能改变整个网络的力量的人……”</span>一个女子的声音，从虚空中传来。<br>\r\n<span class=\"yellow b\">“要不是时空特使来搅局……”</span><br>\r\n<span class=\"evergreen b\">“时空特使卷入了这次事件么，那还真是意料之外……算了，你们没有什么过错。毕竟对手是他。”</span><br>\r\n<span class=\"cyan b\">“那个人看起来很强的样子……”</span>另外一个女子的声音。<br>\r\n<span class=\"yellow b\">“嗯，我也只能和他打成平手，要不是他中途撤了……”</span>红杀将军卸下了自己的盔甲。<br>\r\n<span class=\"evergreen b\">“所以说了不怪你们。”</span>神秘的女子发出了一声叹息，<span class=\"evergreen b\">“如果他要来搅局的话那就随他去吧。他是做不出什么翻天动地的事情的。”</span><br>\r\n“了解，<span class=\"evergreen b\">Genetic Altered\r\nNo.3 alter，林无月</span>阁下。”</p>\r\n<br>\r\n<br>\r\n<br>\r\n<span class=\"evergreen b\">■ GAME CLEAR - END #3 ■</span><br>\r\n<span class=\"evergreen b\" style=\"font-weight:700;font-size:18pt;line-height:18pt;\">「锁定解除」胜利！恭喜恭喜！</span>");
                  }
                } else {
                  if (r.truth(r.equal(r.get(s, "winmode"), 3))) {
                    await r.write("<!--锁定解除（非获胜玩家）-->");
                    if (r.truth(r.equal(19, r.get(s, "gametype")))) {
                      await r.write("<p>\r\n无月之影方向的枪声和爆炸声似乎沉寂下来。<br>\r\n那个勇敢的挑战者果然还是被杀了吗？还是说，他……<br>\r\n你不敢继续想下去。<br>\r\n虚拟幻境里，忽然响起这样一句声音：<br>\r\n<span class=\"yellow b\">“我是 ");
                      await r.write(r.text(r.get(s, "winner")));
                      await r.write("。精神锁定解除。”</span><br>\r\n这么说，他成功了！那我们都可以不用死在这里了！<br>\r\n<br>\r\n果然，整个世界马上开始崩塌。你觉得自己似乎飘了起来，离这个世界越来越远。<br>\r\n然而，在这毁灭与新生的光景中，狂飙的声音幽幽传来：<br>\r\n<span class=\"cyan b\">“你以为你逃过一劫了吗？<br>\r\n虽然你未必记得，但你觉得你在被送来这里之前经历过多少次的死亡？一千次？一万次？<br>\r\n求生的欲望和杀戮的渴望，已经刻在了你的心底。<br>\r\n哪怕你成功回到了现实，也终究会回来这个幻境的。<br>\r\n我们会再见面的，那时，你就未必有这个好运气了……”</span>\r\n</p>\r\n<br>\r\n<br>\r\n<br>\r\n<span class=\"evergreen b\" style=\"font-weight:700;font-size:18pt;line-height:18pt;\">其他玩家已完成「锁定解除」胜利，请再接再厉！</span>\r\n</p>");
                      if (r.truth(r.equal(5, r.get(s, "gametype")))) {
                        await r.write("<p>\r\n一股异样的震动突然在你身边响起。<br>\r\n你认得那个迹象，那是『锁定解除』的标志。<br>\r\n也就是说，有其他什么人已经完成了修复任务，是吧。<br>\r\n不管是哪个家伙——干的还不错嘛。<br>\r\n<br>\r\n果然，整个世界马上开始崩塌。你觉得自己似乎飘了起来，离这个世界越来越远。<br>\r\n然后，在天空上，你看到了一行大字。<br>\r\n<span class=\"yellow b\">『系统修复进度：8%』</span><br>\r\n也就是说，还会回来的吧。<br>\r\n你这么想着，意识落入了黑暗。<br>\r\n</p>\r\n<br>\r\n<br>\r\n<br>\r\n<span class=\"evergreen b\" style=\"font-weight:700;font-size:18pt;line-height:18pt;\">其他玩家已完成修复任务，请再接再厉！</span>\r\n</p>");
                      } else {
                        await r.write("<p>脑海中突然传出的声音，让正忙于厮杀的众人不约而同地停了下来。<BR>\r\n本以为会是首席执行官播报禁区的话语，但却是另一个似曾相识的声音。<BR>\r\n“GAME OVER！这个游戏已经完了！已经不用再相互残杀了！”</p>\r\n<p>真的吗？众人面面相觑。<BR>\r\n不过，既然首席执行官没有加以干涉，或许这个人说的话是可以相信的。<BR>\r\n难以想象，本以为必然血流成河的这个“游戏”，竟然会以这种方式结束。</p>\r\n<p>“10分钟后会解除所有人的锁定，返回现实世界。还活着的人都给我聚集到管理后台来。”</p>\r\n<p>刚才还打个你死我活的网友，此刻正有说有笑地向后台走去。<BR>\r\n但是，在欢声笑语的间隙，总会感受到狐疑的眼神的窥视。<BR>\r\n大家正结伴而行。<BR>\r\n大家正踽踽独行。<BR>\r\n数个小时的生死搏杀带来的心灵创伤，或许终此一生都无法磨灭吧。<BR>\r\n那么，接下来应该怎么办呢？</p>\r\n<p>怎么办？不是已经有答案了吗？<BR>\r\n就算永远也无法再次互相信任也好。<BR>\r\n就算等待着我们的是难以想象的梦魇也好。<BR>\r\n至少我们还生还。至少我们还能互相理解。<BR>\r\n那么，就这样走下去吧。<BR>\r\n和网友们一同走下去。</p>\r\n<p>……<BR>\r\n……<BR>\r\n……</p>\r\n<p>“对不起，董事长阁下。我们没能阻止这批玩家。”<br>\r\n<p>“MISSION……任务失败。”<br>\r\n不知何时，不知何地，不知何人，正诚恳地道歉着。<br>\r\n<span class=\"evergreen b\">“也许那就是咱要找的人吧？拥有能改变整个网络的力量的人……”</span>一个女子的声音，从虚空中传来。<br>\r\n<span class=\"yellow b\">“要不是时空特使来搅局……”</span><br>\r\n<span class=\"evergreen b\">“时空特使卷入了这次事件么，那还真是意料之外……算了，你们没有什么过错。毕竟对手是他。”</span><br>\r\n<span class=\"cyan b\">“那个人看起来很强的样子……”</span>另外一个女子的声音。<br>\r\n<span class=\"yellow b\">“嗯，我也只能和他打成平手，要不是他中途撤了……”</span>红杀将军卸下了自己的盔甲。<br>\r\n<span class=\"evergreen b\">“所以说了不怪你们。”</span>神秘的女子发出了一声叹息，<span class=\"evergreen b\">“如果他要来搅局的话那就随他去吧。他是做不出什么翻天动地的事情的。”</span><br>\r\n“了解，<span class=\"evergreen b\">Genetic Altered\r\nNo.3 alter，林无月</span>阁下。”</p>\r\n<br>\r\n<br>\r\n<br>\r\n<span class=\"evergreen b\" style=\"font-weight:700;font-size:18pt;line-height:18pt;\">其他玩家已完成「锁定解除」胜利，请再接再厉！</span>");
                      }
                    } else {
                      if (r.truth((r.truth(r.equal(r.get(s, "winmode"), 5)) && r.truth(r.equal(r.get(s, "winner_flag"), r.get(s, "winmode")))))) {
                        await r.write("<!--核弹引爆-->\r\n<p>手中的按钮装置发出刺耳的“哔哔”声。<BR>\r\n真烦，不赶快把这东西丢掉的话，肯定会暴露位置，招来别人的攻击。</p>\r\n<p>“啪。” 看着砸在坚硬的岩石上粉身碎骨的按钮，我感到如释重负般的开心。<BR>\r\n接下来怎么办呢？先继续躲藏吧。马上到整点禁区的时间了，我抬头望着天空，判断着大致的时间。<BR>\r\n忽然，我似乎看到了什么。<BR>\r\n远处的天空中，一颗明亮的星星，渐渐显露出来。<BR>\r\n定睛看去，那其实不是星星，是飞行器一般的东西，正高速划破天空，身后留下清晰可见的尾迹。<BR>\r\n“如果是飞机，那个速度也太快了……”我一边这样想着，一边想转身离开。<BR>\r\n但是，心脏好像被什么拽住了一样，毛骨悚然的感觉瞬间爬满全身，整个人一动也不能动。<BR>\r\n“它在朝这个岛屿飞来……”我失神地望着那越来越近的飞行物体。<BR>\r\n高速飞行的东西已经很近了，圆锥形的脑袋在阳光下反射着耀眼的金光。<BR>\r\n“是导弹啊！该死……”话音未落，我就被千万倍亮于太阳的刺眼光芒所淹没了。</p>\r\n<p>“眼睛、眼睛看不见了！”眼前一片白茫茫，如同患了白内障一般。<BR>\r\n狂风从四面八方涌来，自己被卷到空中，就像破抹布一样被撕扯着。<BR>\r\n再然后，犹如跌入了火焰地狱，皮肤似乎瞬间就蒸发了，灼热的感觉从肺里传来，好像连血液都在沸腾。<BR>\r\n意识早已模糊了。仅存的感觉，是大概早已如枯骨一般的手指，攥着正在融化的武器。<BR>\r\n“可恶……早知道这样，就……”</p>\r\n<p>崩坏的感官最终归于沉寂。</p>\r\n<p>……<BR>\r\n……<BR>\r\n……</p>\r\n<p>“对不起，董事长阁下，”不知何处，不知何人的声音，“我们没能阻止电子病毒核弹的引爆。”<BR>\r\n<span class=\"evergreen b\">“哼，看来也许下次还得我亲自出马。”</span>不满的女声，<BR>\r\n<span class=\"evergreen b\">“不过，电子病毒核弹这样的东西，竟然会被安插到那里。看来我们需要重新审视内部的暗流了呢。”</span><BR>\r\n“实在抱歉，董事长。这次的事情由我们负全责。”<BR>\r\n<span class=\"evergreen b\">“咱不在的时候竟然有人敢做这种事……”女声沉吟许久，“果然是他……？”</span></p>\r\n<br>\r\n<br>\r\n<br>\r\n<span class=\"evergreen b\">■ GAME CLEAR - END #5 ■</span><br>\r\n<span class=\"evergreen b\" style=\"font-weight:700;font-size:18pt;line-height:18pt;\">「核弹引爆」胜利！恭喜恭喜！</span>");
                      } else {
                        if (r.truth(r.equal(r.get(s, "winmode"), 5))) {
                          await r.write("<!--核弹引爆（非获胜玩家）-->\r\n<p>突然间划破天空的飞行物体，让正在厮杀的众人不约而同地停了下来。<BR>\r\n那震耳欲聋的尖锐呼啸声，让人不寒而栗。<BR>\r\n“啪”是网友的武器掉落在地上的声音。<BR>\r\n“不好！那东西——快逃——”<BR>\r\n话音未落，那飞行物体就坠落在岛屿的中心位置。随之而来的强烈闪光让所有人的眼睛都一阵烧灼。<BR>\r\n“核弹……？”刚才还血战着的技术帝，此刻呆若木鸡。烧焦的碎屑从他朝向爆炸点的皮肤上片片剥落。<BR>\r\n有网友反应过来，扭头就跑，还没跑出两步，就被呼啸而至的巨大的冲击波压倒在地……</p>\r\n<p>世界在燃烧。<BR>\r\n骨头似乎都碎了，沸腾的血液连同熟透的器官一起洒了一地，千疮百孔的身体如同破娃娃，支撑着自己活到现在的信念早已分寸尽断。<BR>\r\n“是谁……引爆了核弹？”沙哑的、夹杂着咕噜声的非人类的声音有气无力地喃喃道。<BR>\r\n“如果……还有……一定要……爆ta菊花……哈、哈哈……”</p>\r\n<p>崩坏的感官最终归于沉寂。</p>\r\n<p>……<BR>\r\n……<BR>\r\n……</p>\r\n<p>“对不起，董事长阁下，”不知何处，不知何人的声音，“我们没能阻止电子病毒核弹的引爆。”<BR>\r\n<span class=\"evergreen b\">“哼，看来也许下次还得我亲自出马。”</span>不满的女声，<BR>\r\n<span class=\"evergreen b\">“不过，电子病毒核弹这样的东西，竟然会被安插到那里。看来我们需要重新审视内部的暗流了呢。”</span><BR>\r\n“实在抱歉，董事长。这次的事情由我们负全责。”<BR>\r\n<span class=\"evergreen b\">“咱不在的时候竟然有人敢做这种事……”女声沉吟许久，“果然是他……？”</span></p>\r\n<br>\r\n<br>\r\n<br>\r\n<span class=\"evergreen b\" style=\"font-weight:700;font-size:18pt;line-height:18pt;\">其他玩家已完成「核弹引爆」胜利，请再接再厉！</span>");
                        } else {
                          if (r.truth(r.equal(r.get(s, "winmode"), 6))) {
                            await r.write("<!--游戏被GM中止-->\r\n<p>本局游戏被GM中止，请返回游戏首页。</p>");
                          } else {
                            if (r.truth((r.truth(r.equal(r.get(s, "winmode"), 7)) && r.truth(r.equal(r.get(s, "winner_flag"), r.get(s, "winmode")))))) {
                              await r.write("<!--幻境解离-->\r\n<p>一切都结束了。<br>\r\n你拿着三个光球样的物体，来到了那个位置。<br>\r\n在你组装起这三个光球前，你甚至不知道这个位置在这个虚拟现实中的存在。<br>\r\n哦当然，你现在知道了。</p>\r\n<p>你走向面前那唯一的祭坛样的高台。<br>\r\n然后，将三个光球放进了高台上的凹槽里面。</p>\r\n<p>整个世界变为纯白——</p>\r\n<p>\r\n\r\n<span id=\"j3\">『mixitem_1』</span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span id=\"j2\">『幻境』</span><br><br>\r\n<span id=\"j1\">『虚拟现实』</span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span id=\"j4\">『无法解析』</span><br><br>\r\n&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span id=\"j5\">『世界线』</span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span id=\"j6\">『考验』</span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<br><br>\r\n<span id=\"j16\">『modules』</span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span style=\"color:#ff0000;font-size:31px;font-family:微软雅黑;font-weight:bold\">欢迎来到起源……</span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span id=\"j7\">『记忆』</span><br><br>\r\n<span id=\"j15\">『合成』</span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span id=\"j12\">『数据』</span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span id=\"j8\">『codeadv』</span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<br><br>\r\n&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span id=\"j9\">『热血』</span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span id=\"j10\">『外界干扰』</span><span id=\"j11\">『契约』</span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<br><br>\r\n<span id=\"j14\">『时空特使』</span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span id=\"j13\">『奇迹』</span>\r\n<br><br>\r\n</p>\r\n\r\n<p>\r\n然后，世界坠入黑暗——<br>\r\n<span class=\"linen b\">“欢迎来到这里。”</span><br>\r\n那个声音是谁？<br>\r\n<span class=\"linen b\">“………………”</span><br>\r\n你的面前出现了一袭黑衣的少女。银白的短发和飞扬的丝带在黑暗中不知为何特别醒目。<br>\r\n貌似在哪里见过，但是已经回想不起来了。<br>\r\n<span class=\"linen b\">“……所谓的外表毫无意义。”<br>\r\n“我是控制这个虚拟现实的中枢程序。”<br>\r\n“你能来到这里，表示你已经突破了『这个』现实。”<br>\r\n“<span class=\"yellow b\">");
                              await r.write(r.text(r.get(s, "name")));
                              await r.write("</span>，You are now crowned a 'Fighter'.”</span><br>\r\n少女伸出一只手，将你从地上拉了起来。<br>\r\n<span class=\"linen b\">“……这个系统比你想象的要复杂太多，但是在其中的每个存在都有着自己的使命。”<br>\r\n“创建。”<br>\r\n“毁灭。”<br>\r\n“种植。”<br>\r\n“杀戮。”<br>\r\n“在其中的每个人都是一个程序，只会执行预订的工作。”</span><br>\r\n虽然你完全听不懂少女在讲什么，但是你发现你问不出任何问题。<br>\r\n<span class=\"linen b\">“但是你不同。”<br>\r\n“你似乎是这个世界的——wildcard呢。”<br>\r\n“当然了，也许你想反抗这个世界的法则，不过在我眼中，鬼牌仍旧是鬼牌，所谓的wildcard——”<br>\r\n“……也便是身为wildcard的使命和枷锁而已。”</span><br>\r\n想改变自己的命运是错误的么？<br>\r\n我们便永远将生活于这圆环之中么？<br>\r\n………………\r\n</p>\r\n<p>\r\n<span id=\"p9\">『去看看这世界吧——』</span><br>\r\n<span id=\"p10\">『愿你眼中的景色永远明亮清晰——』</span><br>\r\n<span id=\"p3\">『我的朋友便是我的力量！』</span><br>\r\n<span id=\"p4\">『你便将给我败啊啊啊啊啊啊啊啊——』</span><br>\r\n<span id=\"p5\">『英雄是有保质期限的，请接过……』</span><br>\r\n<span id=\"p6\">『战争，战争永恒不变』</span><br>\r\n<span id=\"p7\">『反抗我的都要灭！』</span><br>\r\n<span id=\"p8\">『吃下这■的战斗伤害吧！■直接攻击！粉碎玉碎大喝彩！』</span><br>\r\n<span id=\"p1\">『我的血将承载这黑暗，我的灵将承载这痛苦』</span><br>\r\n<span style=\"color:red;font-family:微软雅黑;font-size:23px;font-weight:bold;line-height:29px\">…………<br>\r\n这是……■■线■残■……</span><br><br>\r\n<span id=\"p2\">『CONGRATULATIONS，你的游戏，已经结束了。』</span><br>\r\n<span id=\"p11\">『I have bested the spikes, the fruit, and the moon!』</span><br>\r\n<span id=\"p12\">『起床了啊！』</span><br>\r\n<span id=\"p13\">『被凝固的日常，将重新开始转动。』</span><br>\r\n<span id=\"p14\">『你们都统统去给我读古生物书读到心脏怦怦乱跳为止再回来玩！』</span><br>\r\n<span id=\"p15\">『浪子的口袋里面是永远不缺崭新的钞票的』</span><br>\r\n<span id=\"p16\">『啊～啊我招了吧，这永续的黑夜，这异常的月亮，还有在罗汉像上放上帽子这些都是■干的，现在给我让开！』</span><br>\r\n<span id=\"p17\">『想证明给我看的话，就从我身上轧过去吧！』</span><br>\r\n<br>\r\n承受不住巨大信息的压力，<br>\r\n世界归于鲜红。</p>\r\n<p>\r\n我的所谓胜利就这样……<br>\r\n不，这一定不可能。<br>\r\n这一切都是梦吧。<br>\r\n我还在这虚拟的回环中吧……<br><br><br>\r\n<span style=\"font-size:23px;color:#ff0000;font-family:微软雅黑;font-weight:bold\">给我打破这回环<span style=\"font-size:29px\">呜呜哦哦哦哦哦哦噢</span><span style=\"font-size:37px\">噢噢噢哦哦</span><span style=\"font-size:29px\">————！！！</span></span><br>\r\n</p><p><br>\r\n传来了有什么破碎的声音。<br>\r\n随后，看到了光。<br>\r\n世界再次被光笼罩。\r\n</p>\r\n<p>\r\n景色被重新聚合。<br>\r\n这里是我曾经熟悉过的地点。<br>\r\n自称为中枢程序的少女正坐在地上。<br>\r\n<span class=\"linen b\">“我没预测到你还能达到这里。”<br>\r\n“…………不过既然达到了这里，也就说明我的使命结束了吧。”</span><br>\r\n难道你的使命不是坐在这里看着我们么……？<br>\r\n<span class=\"linen b\">“说什么啊，那是无生命的中枢程序。”<br>\r\n“我……是中枢程序的一部分，可以说是附加在其上的一个病毒。”<br>\r\n“你在这里的出现，满足了我的触发条件。”</span><br>\r\n少女站了起来，<br>\r\n张开了双手。<br>\r\n她的全身被光笼罩。<br>\r\n<span class=\"linen b\">“如果无法阻挡，就必须破坏；”<br>\r\n“如果无法破坏，就想方设法延迟它。”<br>\r\n“我的使命，就是……”</span><br>\r\n少女的左手中出现了一样奇怪的武器。<br>\r\n看起来像一把样式奇特的钥匙。<br>\r\n把手上缠绕着和少女手腕上相同的丝带；<br>\r\n剑柄上闪耀着亮蓝色的条形霓虹灯光；<br>\r\n底端的刃上则是闪耀的橙色火焰。<br><br>\r\n<img border=\"0\" src=\"./img/Miracle Campfire.jpg\"><br><br>\r\n<span class=\"linen b\">“Unlimited Code Works: Miracle Campfire, Activate.”</span><br>\r\n少女伸出了左手，示意着你接过武器。<br>\r\n不知道被什么驱使，你接过了这柄看起来沉重却无比轻盈的武器。<br>\r\n然后，在你没来得及反应前，这把武器就贯穿了面前的形象。<br>\r\n<span class=\"linen b\">“任务完成。你做的漂亮。”<br>\r\n“通过这个行动，你成功地删除了我，连带着我依附的中枢程序。”<br>\r\n“这个程序现在还不能被控制，也不能被破坏，所以这就是最好的结果了……”<br>\r\n“我附身在每一个这样的中枢程序中，所以你杀死的只是这一个『我』；<br>\r\n其他的『我』，就等待着和你下次见面了。”<br>\r\n“『愿我的血，成为黑夜中闪耀的星光——』”</span><br>\r\n念诵完最后的话后，<br>\r\n面前的形象完全地溶解在了光芒之中，而那个光芒随着你手上的武器进入了你的身体。</p>\r\n<p>\r\n<span style=\"font-size:31px;color:#feea23;font-family:微软雅黑;font-weight:bold;line-height:41px\">『■■■■■■』<br>\r\n『PROJECT ■』<br>\r\n『■■■■』</span>\r\n</p>\r\n这是她留下的最终信息么？很遗憾我看起来解读不能啊……抱歉。<br>\r\n这么想着的你的意识也消逝在了迅速溶解的幻境之中。\r\n</p>\r\n<br>\r\n<p>\r\n“嗯，因为虚拟现实装置暴走的受害者已经全部被治疗完毕了。身体和心理上应该不会有后遗症。”<br>\r\n“嗯，这样就好，那群家伙也是应该审视一下自己的系统了，病毒入侵导致暴走什么的……”<br>\r\n■叹了一口气，关闭了窃听器。<br>\r\n“非常抱歉我们无法察觉到中枢程序的被入侵……”她身边穿着黑袍子的人如此说道。<br>\r\n<span class=\"evergreen b\">“没有办法，在我们开发出新的替代程序之前，只好让时空特使这样瞎闹了，等到所有事情结束后我一定要他们好看。”</span><br>\r\n■愤怒地站了起来，离开了房间。<br>\r\n<span class=\"evergreen b\">“给我马上准备重新载入中枢程序！”</span>在门口，她回过头这么怒吼了一句。<br>\r\n</p>\r\n<br>\r\n<p>\r\n你站在一幢灰色的建筑前，左手上拿着那你已经不太记得名字的钥匙状奇怪武器。<br>\r\n带着那决意，你向前走去。<br>\r\n</p>\r\n<br>\r\n<p align=\"right\" style=\"padding-right:17%\">\r\n<span class=\"red b\">NEXT EPISODE：Project:■</span>\r\n</p>\r\n<br>\r\n<br>\r\n<br>\r\n<span class=\"evergreen b\">■ GAME CLEAR - END #7 ■</span><br>\r\n<span class=\"evergreen b\" style=\"font-weight:700;font-size:18pt;line-height:18pt;\">「幻境解离」胜利！恭喜恭喜！</span>");
                            } else {
                              if (r.truth(r.equal(r.get(s, "winmode"), 7))) {
                                await r.write("<!--幻境解离（非获胜玩家）-->\r\n<p>\r\n你的面前白光一闪，<br>\r\n你的意识消逝在了白光之中。<br>\r\nEND?<br>\r\n<br>\r\n<br>\r\n<br>\r\n<span class=\"evergreen b\" style=\"font-weight:700;font-size:18pt;line-height:18pt;\">其他玩家已完成「幻境解离」胜利，请再接再厉！</span>\r\n</p>");
                              } else {
                                if (r.truth(r.equal(r.get(s, "winmode"), 8))) {
                                  await r.write("<!--挑战结束-->");
                                  if (r.truth(r.equal(r.get(s, "gametype"), 1))) {
                                    await r.write("<p>\r\n<span class=\"evergreen b\">“各位辛苦了，这次就到此为止吧。”</span><br>\r\n是技术总监——薇娜·安妮茜——的声音。<br>\r\n正在努力追查病毒的我们，听到这句广播，都不约而同地停下了。<br>\r\n“我们已经把病毒本体的位置定位到了很小的范围。<br>\r\n然而很遗憾，凭我们目前的手段，还无法把病毒逼出它的主场。<br>\r\n这不是你们的错，或者说，多亏了你们，才有如此进展。<br>\r\n你们都先登出吧。我会按约定，给<span class=\"evergreen b\">进度名列前茅者</span>发放报酬的。”\r\n</p>\r\n<p>\r\n你的眼前闪过几行小字：<br>\r\n本次任务报酬采用绩效制，报酬多寡与测试员的进度直接挂钩。<br>");
                                    r.assign(r.slot(s, ["cl"]), (await r.module("skillbase", "skill_getvalue", 424, "lvl")));
                                    r.assign(r.slot(s, ["rank"]), (await r.module("skillbase", "skill_getvalue", 424, "rank")));
                                    r.assign(r.slot(s, ["prize"]), (await r.module("skillbase", "skill_getvalue", 424, "prize")));
                                    await r.write("您本次完成了<span class=\"yellow b\">");
                                    await r.write(r.text(r.get(s, "cl")));
                                    await r.write("</span>层除错任务，在合作者中排名<span class=\"yellow b\">第");
                                    await r.write(r.text(r.get(s, "rank")));
                                    await r.write("</span>。<br>\r\n{if ");
                                    await r.write(r.text(r.get(s, "prize")));
                                    await r.write("}我们将支付您<span class=\"gold b\">");
                                    await r.write(r.text(r.get(s, "prize")));
                                    await r.write("切糕</span>，感谢您支持金龙通讯社。");
                                  } else {
                                    await r.write("很遗憾，您没有达到我们的要求，请您下次再接再厉。");
                                  }
                                  await r.write("</p>\r\n<p>\r\n“骗子！合同欺诈！金龙社果然都不是好人！”碰巧又跟你凑在一起的那个测试员忿忿地骂道。<br>\r\n而你正沾沾自喜。看来野路子很有效呢，下次还得找这帮冤大头。\r\n</p>\r\n<p>\r\n然而，在你们相继登出时，你似乎隐约听到了几句不祥的话。<br>\r\n<span class=\"evergreen b\">“把虚拟幻境交给这帮人，根本不靠谱吧？”</span><br>\r\n<span class=\"cyan b\">“这你就不懂了吧。你们红大小姐这一招，是欲擒故纵、一石二鸟。<br>\r\n就算一时没成果，也是可以接受的。”</span><br>\r\n<span class=\"evergreen b\">“我是搞技术的人，不懂你们统御术那一套。”</span><br>\r\n<span class=\"cyan b\">“这样才能合作愉快嘛，安妮。”</span>\r\n</p>\r\n\r\n<br>\r\n<span class=\"evergreen b\">■ GAME CLEAR - END? ■</span><br>\r\n<span class=\"evergreen b\" style=\"font-weight:700;font-size:18pt;line-height:18pt;\">「除错模式」结束？</span>\r\n<p>本局游戏结束，请返回游戏首页！</p>");
                                } else {
                                  if (r.truth(r.equal(r.get(s, "gametype"), 15))) {
                                    await r.write("<p>\r\n你本局的有效最大金钱为：");
                                    if (r.truth((!r.truth((await r.module("map", "get_area_wavenum")))))) {
                                      await r.write(r.text((await r.call("max", r.get(s, "money"), (await r.module("skillbase", "skill_getvalue", 313, "max_money"))))));
                                    } else {
                                      await r.write(r.text((await r.module("skillbase", "skill_getvalue", 313, "max_money"))));
                                    }
                                    await r.write("<br>本次挑战结束，请返回游戏首页！\r\n</p>");
                                  } else {
                                    await r.write("<p>本次挑战结束，请返回游戏首页！</p>");
                                  }
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  } else {
                    await r.write("未知胜利方式，可能是开发者尚未编写结局说明，请返回游戏首页！<br>\r\nwinner_flag=");
                    await r.write(r.text(r.get(s, "winner_flag")));
                    await r.write(" winmode=");
                    await r.write(r.text(r.get(s, "winmode")));
                  }
                }
              }
            }
          }
        }
        await r.write("<br><br>");
        if (r.truth((!r.truth((r.truth((await r.call("defined", "MOD_ENDING"))) && r.truth((await r.module("ending", "ending_by_shootings_available")))))))) {
          if (r.truth((r.truth((r.truth((!r.truth(r.get(s, "groomid")))) && r.truth((await r.call("in_array", r.get(s, "winmode"), r.array([[r.APPEND, 2], [r.APPEND, 3], [r.APPEND, 5], [r.APPEND, 7]])))))) && r.truth(r.get(s, "winner_flag"))))) {
            await r.write("<p>\r\n<a name=\"nextgamevars\"></a><h2 class=\"subtitle2\">下一局游戏数据设定</h2>\r\n<form method=\"post\" id=\"nextgamevarsform\" name=\"nextgamevarsform\">\r\n<input type=\"hidden\" name=\"ecommand\" value=\"nextgamevars\">\r\n<div id=\"nextgamevars\">");
            if (r.truth((await r.call("is_array", r.get(s, "next_gamevars_display"))))) {
              {
                const a0 = r.copy(r.get(s, "next_gamevars_display"));
                for (const [k0, v0] of r.entries(a0)) {
                  r.assign(r.slot(s, ["ngds"]), v0);
                  await r.write(r.text(r.get(s, "ngds")));
                  await r.write("<br>");
                }
              }
            }
            await r.write("</div>\r\n<p>\r\n<input type=\"button\" class=\"cmdbutton\"  value=\"提交\"\r\nonclick=\"postCmd('nextgamevarsform','end.php');this.disabled=true;\">\r\n</p>\r\n</form>\r\n</p>");
          }
        }
      } else {
        await r.write("游戏尚在运行，可能是新一局已经开始，请返回游戏首页！");
      }
    }
  }
  if (r.truth((r.truth(r.equal(r.get(s, "state"), 4)) && r.truth(r.equal(r.get(s, "gametype"), 17))))) {
    await r.write("<input type=\"button\" value=\"退出教程\" onclick=\"room_quit();\">");
  } else {
    await r.write("<input type=\"button\" value=\"返回首页\" onclick=\"window.location.href='index.php';\">");
  }
  (await r.include(r.template("footer"), s));
return 1;
}
