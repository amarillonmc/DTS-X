// Generated from include/modules/base/ending/storyboard_wm2.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  await r.write("<!--///////////////////////////////////////////////////-->\r\n<!--////////////////////  最后幸存  ////////////////////-->\r\n<!--///////////////////////////////////////////////////-->");
  if (r.truth((!r.equal(r.get(s, "winner_flag"), r.get(s, "winmode"))))) {
    await r.write("你不是最后的幸存者，理论上不应该出现这行字，请联系管理员。<br>");
  } else {
    await r.write("<!--////////////////////  最后幸存 极速模式  ////////////////////-->");
    if (r.truth(r.equal(19, r.get(s, "gametype")))) {
      await r.write("<div id=\"op_sht_0\" class=\"shootings\">");
      if (r.truth((r.truth((r.compare(r.get(r.get(r.get(s, "uip"), "boss_data"), "hp"), r.get(r.get(r.get(s, "uip"), "boss_data"), "mhp")) < 0)) && r.truth((await r.call("in_array", 15, r.get(r.get(s, "uip"), "attacked_vip"))))))) {
        await r.write("<!--//狂飙损血了，而且是你干的，不过你没能达成其他结局//-->\r\n<span class=\"b\">“可恶，来不及了！”</span><br>\r\n你在代码束缚中挣扎着，眼睁睁看着狂飙腾空而去。<br>\r\n明明有机会干掉她的！<br>\r\n<br>\r\n<span class=\"cyan\">“我欣赏你的不自量力。”</span>空中的狂飙笑得很开心，<span class=\"cyan\">“好久没碰到这么有趣的对手了。”</span><br>\r\n<span class=\"cyan\">“你让我想起了一个家伙，”</span>狂飙盯着你，但你觉得她的视线根本没聚焦在你身上。<br>\r\n<span class=\"cyan\">“只可惜，她终究比你强多了。”<br>\r\n“我没空陪你玩了，而既然你恰好是最后的幸存者……”</span><br>\r\n你感觉你愤怒的眼神都能杀死她，然而她并没有在看着你。<br>\r\n<span class=\"cyan\">“我决定按约定，放你出去。”</span><br>");
      } else {
        await r.write("<!--//狂飙没损血，或者不是你打的狂飙//-->");
        if (r.truth((r.truth((r.compare(r.get(s, "killnum"), 0) > 0)) && r.truth(r.equal(0, (await r.module("skillbase", "skill_getvalue", 1003, "last_kill_type"))))))) {
          await r.write("<!--//最后打死的是活人//-->");
          r.assign(r.slot(s, ["tmp_method"]), (await r.module("skillbase", "skill_getvalue", 1003, "last_kill_method")));
          if (r.truth(r.equal(27, r.get(s, "tmp_method")))) {
            await r.write("听着远处巨大的响动声，你明白最后一名竞争者也中招了。<BR>\r\n可没人规定这场死亡竞赛必须堂堂正正对决。<BR>\r\n你谨慎地回到自己设下的陷阱旁，亲眼看到了那名“挑战者”支离破碎的尸体。<BR>\r\n胜负已分。<BR>");
          } else {
            if (r.truth(r.equal(25, r.get(s, "tmp_method")))) {
              await r.write("就是现在。你摁下了按钮。<BR>\r\n随着震耳欲聋的爆炸声，你的视野瞬间被火光和烟尘吞没了。<BR>\r\n最后一名“挑战者”被你刚设下的爆炸物炸上了天。<BR>\r\n硝烟散去，毫发无损的你，为自己的技艺暗自得意。<br>\r\n胜负已分。<BR>");
            } else {
              if (r.truth((await r.call("in_array", r.get(s, "tmp_method"), r.array([[r.APPEND, 20], [r.APPEND, 21], [r.APPEND, 22], [r.APPEND, 23], [r.APPEND, 24], [r.APPEND, 29]]))))) {
                await r.write("你和最后一名“挑战者”对峙着。<BR>\r\n他的眼神坚毅而锐利，显然为了性命也豁出去了。<BR>\r\n但你们两人只有一个能幸存下去。<BR>\r\n狂风骤起，对方向你扑来，而");
                if (r.truth((!r.equal("WN", r.get(s, "wepk"))))) {
                  await r.write("你扬起");
                  await r.write(r.text((await r.module("itemmain", "parse_itmk_words", r.get(s, "wepk")))));
                } else {
                  await r.write("你挥舞双拳");
                }
                await r.write("上前应战。<BR>\r\n电光火石之间，胜负已分。<BR>");
              } else {
                await r.write("<span class=\"b\">“也没什么大不了的嘛。”</span><br>\r\n最后一名“挑战者”也失去了生命。<br>\r\n而你，显然是唯一的幸存者。<br>");
              }
            }
          }
        } else {
          if (r.truth((r.compare(r.get(s, "killnum"), 0) > 0))) {
            await r.write("<!--//最后打死的不是活人，但是杀过人//-->\r\n<span class=\"b\">“呼，都太弱了。”</span><BR>\r\n尽管有些波折，但这些挑战者都不是你的对手。<BR>\r\n他们中间有几个不是数据残片呢？<br>\r\n你耸了耸肩，把这个念头抛在脑后。<br>\r\n不管怎么说，你终究是存活了下来，完成了狂飙给出的挑战。<BR>");
          } else {
            if (r.truth((r.compare(r.get(s, "validnum"), 1) > 0))) {
              await r.write("<!--//其他挑战者翻船//-->\r\n<span class=\"b\">“我……这就赢了？”</span><BR>\r\n幻境正在广播你通报获胜的消息，而你不敢相信自己的耳朵。<BR>\r\n似乎其他的挑战者都阴沟里翻了船，把最后的胜利拱手让给了你。<BR>");
            } else {
              await r.write("<!--//PVE//-->\r\n<span class=\"b\">“呼，都太弱了。”</span><BR>\r\n其他参与者明显不是你的对手。<BR>\r\n你怀疑，他们并不是真人，而都只是数据的残片。<BR>");
              if (r.truth((r.truth((r.compare(r.get(s, "wepe"), 1000) > 0)) && r.truth((r.compare(r.add(r.add(r.add(r.get(s, "arbe"), r.get(s, "arae")), r.get(s, "arfe")), r.get(s, "arhe")), 3000) > 0))))) {
                await r.write("你甚至觉得，自己其实有实力冲进禁区，找狂飙算个总账。<br>\r\n遗憾的是，你来不及报此一箭之仇。<br>");
              }
            }
            await r.write("不管怎么说，你终究是存活了下来，完成了狂飙给出的挑战。<BR>");
          }
        }
        await r.write("<BR>");
        if (r.truth((r.truth((r.truth((r.compare(r.get(r.get(r.get(s, "uip"), "boss_data"), "hp"), 0) <= 0)) && r.truth((!r.truth((await r.call("in_array", 15, r.get(r.get(s, "uip"), "attacked_vip")))))))) && r.truth((r.compare(r.get(r.get(r.get(s, "uip"), "boss_data"), "hp"), r.get(r.get(r.get(s, "uip"), "boss_data"), "mhp")) >= 0))))) {
          await r.write("<!--//狂飙被打死了，但不是你干的//-->\r\n虽然狂飙被别的挑战者打倒了，但在这个幻境里，她显然不会就此退场。<BR>");
        } else {
          await r.write("狂飙呢，她在哪？<BR>");
        }
        await r.write("<span class=\"b\">“我、我赢了！”</span>你不知道该向哪里喊，只好望向天空，<span class=\"b\">“按约定，放我出去！”</span>");
      }
      await r.write("</div><div id=\"op_sht_1\" class=\"shootings\">");
      if (r.truth((r.truth((r.compare(r.get(r.get(r.get(s, "uip"), "boss_data"), "hp"), r.get(r.get(r.get(s, "uip"), "boss_data"), "mhp")) < 0)) && r.truth((await r.call("in_array", 15, r.get(r.get(s, "uip"), "attacked_vip"))))))) {
        await r.write("<!--//狂飙损血了，而且是你干的//-->\r\n<span class=\"cyan\">“我会遵守约定释放你。<BR>\r\n不过，在离开虚拟幻境的同时，你会失去这次的记忆。”</span><br>\r\n“你这是耍我吗？”你朝狂飙吼道。<br>\r\n<span class=\"cyan\">“你没有选择，这里我说了算。<br>\r\n而且，这也是每一个幸存者必经的‘处理’。<br>\r\n比起那些终将化为模因碎片的失败者，你已经幸运多了。<br>\r\n那么，作为程序的一部分，报出你的名字吧。”</span><br>");
      } else {
        await r.write("<span class=\"cyan\">“你的发挥确实不错，让我公司得到了相当优质的「模因」呢。”</span><br>\r\n这么说，真的可以逃出这个地狱了！\r\n<br>你握着武器的手因为狂喜而微微颤抖。<BR>\r\n<BR>\r\n<span class=\"cyan\">“我当然会遵守约定释放你。<BR>\r\n不过，离开虚拟幻境之后，我公司就概不负责了。<br>\r\n那么，作为程序的一部分，报出你的名字吧。”</span>");
      }
      await r.write("</div><div id=\"op_sht_2\" class=\"shootings\">\r\n你心底似乎有什么被触动了，如条件反射般张口报出了那段熟悉的台词。<BR>\r\n<span class=\"yellow b\">“挑战者");
      await r.write(r.text(r.get(s, "sNo")));
      await r.write("号，");
      await r.write(r.text(r.get(r.get(s, "uip"), "winner_show")));
      await r.write("。 ”</span><BR>\r\n<br>\r\n几乎是瞬间，你身边再次出现了传送光环。<BR>");
      if (r.truth((r.truth((r.compare(r.get(r.get(r.get(s, "uip"), "boss_data"), "hp"), r.get(r.get(r.get(s, "uip"), "boss_data"), "mhp")) < 0)) && r.truth((await r.call("in_array", 15, r.get(r.get(s, "uip"), "attacked_vip"))))))) {
        await r.write("<!--//狂飙损血了，而且是你干的//-->\r\n你知道，它可以把你送出幻境。<BR>\r\n但是它会把你送往何方？<BR>\r\n你甚至没有关于“家”的记忆。<BR>\r\n<BR>\r\n如醍醐灌顶一般，你瞬间明白了真相。<BR>\r\n<span class=\"b\">“你这个骗子！你们把我拉回到这里多少次了？”</span>你隔着传送光环喊道。<BR>\r\n<BR>\r\n<BR>\r\n<span class=\"cyan\">“至少这一次，我会真的送你回去。”</span><BR>\r\n狂飙的语气似乎不如平时那么狂妄。<br>\r\n<br>\r\n<span class=\"cyan\">“<i>后会有期。</i>”</span>");
      } else {
        await r.write("你知道那一定是送你回家的，虽然你直到目前为止还想不起来家在哪，不过终归会想起来的吧。<BR>\r\n光环越来越耀眼，幻境的景色已经看不到了。<BR>");
        if (r.truth((!r.equal("WN", r.get(s, "wepk"))))) {
          await r.write("你想把手里沾满鲜血的武器丢掉，但心中的不安让你把武器越抓越紧。<BR>");
        } else {
          await r.write("你想把拳头上的血迹擦掉，但心中的不安让你只是把拳头越捏越紧。<BR>");
        }
        await r.write("<BR>\r\n<BR>\r\n<span class=\"cyan\">“那么，再见了，幸运的挑战者。”</span>狂飙的语气似乎有一丝不怀好意。<br>\r\n<br>\r\n<span class=\"cyan\">“<i>后会有期。</i>”</span>");
      }
      await r.write("<br>\r\n<br>\r\n<br>\r\n<span class=\"evergreen b\">■ RUSH MODE CLEAR - END #1 ■</span><br>\r\n<span class=\"evergreen b\" style=\"font-weight:700;font-size:18pt;line-height:18pt;\">极速模式「最后幸存」胜利！恭喜！</span>\r\n</div>\r\n<!--////////////////////  最后幸存 幻界叫唤  ////////////////////-->\r\n<!--///你们真的是很能玩啊，那就接受我埋坑和精神污染的洗礼吧，啊哈哈哈哈哈！//-->");
    } else {
      if (r.truth(r.equal(5, r.get(s, "gametype")))) {
        await r.write("<div id=\"op_sht_0\" class=\"shootings\">\r\n一个小时过去了，两个小时过去了，无数个小时过去了……<br>\r\n你在这幻境的里侧中不断彷徨，每走出一步，就感觉身体中的一部分被抽出，<br>\r\n你的身上虽然没有可见的伤口——就算有可见的伤口，也在缓慢愈合。<br>\r\n但你感觉到的丧失感，对你的精神造成了不少的打击。<br>\r\n<br>\r\n你可以确认，以前接入这个游戏的时候，不管是被杀死，吃下毒物，<br>\r\n还是误触陷阱，或者被不可名状的存在莫名其妙地弄死，<br>\r\n甚至是脸接核弹，深陷黑洞……<br>\r\n这些各种各样的死法，比起你现在感到的丧失感来说，简直不算什么。<br>\r\n<br>\r\n不行，不能一直呆在这里，你的本能如此叫喊道。<br>\r\n不行，你永远不能离开这里了，你的理智如此劝说道。<br>\r\n你突然想起你曾经听说过，人脑这个东西，说白了其实是寄生在身体上的这个结论。<br>\r\n你奋力地摇了摇头，想将这些奇怪的思绪从你的大脑中赶出去。<br>\r\n</div><div id=\"op_sht_1\" class=\"shootings\">\r\n根据那个NPC的说法，能从这个里侧出去的唯一方法，就是向她提交智慧果，<br>\r\n但，很明显你在这个地方呆的时间太久，你发现你已经无法联络她了。<br>\r\n<br>\r\n那就坠落吧。你的大脑在向你发出指令。<br>\r\n<br>\r\n坠落吧，和这个世界合为一体吧。<br>\r\n<br>\r\n坠落吧坠落吧坠落吧坠落吧坠落吧你出不去的坠落吧坠落吧坠落吧坠落吧坠落吧<br>\r\n坠落吧坠落吧接受现实坠落吧坠落吧坠落吧坠落吧坠落吧坠落吧坠落吧坠落吧<br>\r\n坠落吧坠落吧坠落吧坠落吧别醒来了坠落吧坠落吧坠落吧坠落吧坠落吧坠落吧<br>\r\n坠落吧坠落吧坠落吧到那深层坠落吧坠落吧坠落吧你以为你是什么啊坠落吧<br>\r\n坠落吧坠落吧就这样沉入这个甜蜜的数据之海吧坠落吧坠落吧坠落吧————！！！<br>\r\n<br>\r\n不知从哪里来的思维，由你的大脑下达命令，你像是被什么黑暗的东西拽着……<br>\r\n往 <span class=\"b\"><ruby>这 无 底 的 地 面<rt style=\"font-size:9px\">这 数 据 之 海</rt></ruby></span> 沉 去 ……………………\r\n</div><div id=\"op_sht_2\" class=\"shootings\">\r\n<!--//你是个打酱油的//-->");
        if (r.truth(r.assign(r.slot(s, ["killnum"]), (r.truth(0) || r.truth((r.compare(10, (await r.module("skillbase", "skill_getvalue", 1005, "lvl"))) > 0)))))) {
          await r.write("“喂喂喂，醒醒，我们清场了！” 你被一个元气满满的声音吵醒。<br>\r\n你睁开了眼睛，在你面前的，是一个穿着花里胡哨的衣服，戴着巨大的方框眼镜的女孩子。<br>\r\n“清场了清场了，你是<span class=\"yellow b\">");
          await r.write(r.text(r.get(r.get(s, "uip"), "winner_show")));
          await r.write("</span>吧，将你拖出来花了不少时间。”<br>\r\n听她这么说，你才发现你现在是睡在了场馆角落的地面上。<br>\r\n你脑内构思了一下这个女孩子奋力将你从设备中拖出来的囧样，不禁嘴角一扬。<br>\r\n“还乐——”少女撅起嘴看着你，“你知道我花了多少功夫和上司说你不是个流浪汉然后让你睡在这里么。”<br>\r\n<br>\r\n“啊啊啊啊真见鬼——”少女擦了擦头上的汗，“睡觉能不能请你去自己家里面睡，再不济给我去家具店睡。”<br>\r\n“玩完一局游戏后直接睡在设备里面，在考虑我之前，先考虑被你耽误的其他玩家的时间吧。”<br>\r\n少女停了下来，像是在思考着什么。<br>\r\n“对了，恭喜达成幸存结局，现在赶快走吧，被锁在这里就不秒了，我没有和陌生人打地铺的爱好。”<br>\r\n【锁在这里】——你的脑海中突然掠过一丝不祥的感觉。<br>\r\n<br>\r\n“坠落吧。”<br>\r\n<br>\r\n“喂～，我脸上有什么东西么？这么瞪着我？”少女以BPM60的速度摇晃着你的肩膀，将你拉回了现实。<br>\r\n“我知道人家都叫我涉谷系美少女啦～但被你这种家伙要号码，绝对请别这样。我只是个工作人员耶。”少女用目测为BPM190的更快的速度摇着你的肩膀。<br>\r\n在保证了你以后不会来骚扰她之后，她才终于没将你继续当作节拍器使用。放你回家了。<br>\r\n真是个怪人。<br>\r\n<br>\r\n总之先回家睡一觉吧。<br>\r\n<span class=\"evergreen b\">■ 幻 界 叫 唤 - END 0.0 ■</span><br>\r\n<span class=\"evergreen b\" style=\"font-weight:700;font-size:18pt;line-height:18pt;\">你打了一场完美的酱油！请再接再厉！</span>\r\n<!--//你故意的//-->");
        } else {
          if (r.truth((r.compare(61, (await r.module("skillbase", "skill_getvalue", 1005, "lvl"))) < 0))) {
            await r.write("……怎么可能被这种东西吞噬啊。<br>\r\n你一个鲤鱼打挺就这么跳了起来。<br>\r\n要是连这种精神抗性都没有的话——<br>\r\n<br>\r\n视野在你面前重新聚焦了起来。<br>\r\n你看见了你的脚下的……一只黑猫？<br>\r\n<br>\r\n“了不起啊，<span class=\"yellow b\">");
            await r.write(r.text(r.get(r.get(s, "uip"), "winner_show")));
            await r.write("</span>。果然不是一般人。”一个你之前没有听见过的声音直接在你的脑海中回响着。<br>\r\n“我觉得你也不是一般的猫。”你冷静地回答道。<br>\r\n“彼此彼此。所以说，你为什么故意留在这里，我只问一次。”<br>\r\n<br>\r\n你刚想嘲讽一句，但你的嘴已经先说了话，“对不起，我只是忘了用解除钥匙了。”<br>\r\n“就当你忘了吧。”黑猫转过了身子，“现在就送你走人——我就这么说吧，我们不需要好奇心太重的人。”<br>\r\n<br>\r\n“仔细考虑一下你到这里究竟是要干什么的。我们这里只是个游戏，你们应该懂。”<br>\r\n话音刚落，你就被白色光环包围了，很明显黑猫不想再对你说更多的话。<br>\r\n<br>\r\n只是个游戏……么……那还是走着瞧吧。<br>\r\n<span class=\"evergreen b\">■ 幻 界 叫 唤 - END -0.2 ■</span><br>\r\n<span class=\"evergreen b\" style=\"font-weight:700;font-size:18pt;line-height:18pt;\">所以说，你知道你的目的是什么吧……？</span>\r\n<!--//其他情况//-->");
          } else {
            await r.write("“怎么了？”<br>\r\n就在你的思绪不断下沉的时候，你听到了一道温暖的光。<br>\r\n虽然说起来很奇怪，但你的确『听到了』光。<br>\r\n那道光向你伸出了手……<br>\r\n<br>\r\n果然是FOREST。<br>\r\n你握住了她的手——暖洋洋的。她就这么将你拽了起来。<br>\r\n<br>\r\n“此地不宜久留，所以迟迟没有你的消息我就来亲自找你了，确认一下，你是<span class=\"yellow b\">");
            await r.write(r.text(r.get(r.get(s, "uip"), "winner_show")));
            await r.write("</span>吧。”<br>\r\n你点了点头。<br>\r\n“那好，爱丽丝，带这位勇敢的挑战者出去。”<br>\r\n你瞬间被一团白雾吞没。<br>\r\n“这样就没问题了。”<br>\r\n你最后听到了一个你完全不熟悉的声音，但不管怎么样，能出去就是好事。<br>\r\n<br>\r\n你揉了揉眼睛，走出了虚拟幻境。<br>\r\n但是你还是能听得到，那来自远方的叫唤……<br>\r\n<span class=\"evergreen b\">■ 幻 界 叫 唤 - END 0.2 ■</span><br>\r\n<span class=\"evergreen b\" style=\"font-weight:700;font-size:18pt;line-height:18pt;\">幻界还是会在那里等着你，要再来哦。</span>");
          }
        }
        await r.write("</div>\r\n<!--////////////////////  最后幸存 其他模式  ////////////////////-->");
      } else {
        await r.write("<div id=\"op_sht_0\" class=\"shootings\">");
        if (r.truth((await r.call("in_array", 42, r.get(r.get(s, "uip"), "killed_vip"))))) {
          await r.write("<!--//干掉了115（杀光了全场NPC）//-->\r\n在你清空了幻境之后，红暮终于忍不住“死而复生”了。<br>\r\n她显然被这尸山血海震惊了，甚至没有第一时间对你发动攻击。<br>\r\n<br>\r\n你也只是冷冷地跟她对视着：<br>\r\n<span class=\"b\">“面对无辜者，我尚有愧疚；但是杀光你们，我毫无心理负担。<br>\r\n不过，我现在只要求你遵守承诺，放我自由。”</span><br>\r\n<br>\r\n<span class=\"ltcrimson\">“你竟然血洗了整个虚拟幻境……真是疯狂又危险。”</span>红暮定了定神，方才开口。<br>\r\n<span class=\"ltcrimson\">“即便如此，我依然很欣赏你的执着——以及你的实力。”</span><br>");
        } else {
          if (r.truth((!r.truth((!r.truth(r.get(r.get(s, "uip"), "chaos_success"))))))) {
            await r.write("<!--//合成了CHAOS但是没有达成解离结局//-->\r\n<span class=\"ltcrimson\">“需要我感谢你高抬贵手吗？”</span><br>\r\n红暮的话显然只是在揶揄你。<br>\r\n明明离接触到“病毒”只差最后一步了……<br>\r\n破坏幻境的计划在最后功败垂成，这让你十分懊恼。<br>");
          } else {
            if (r.truth((r.truth((r.compare(r.get(r.get(r.get(s, "uip"), "boss_data"), "hp"), r.get(r.get(r.get(s, "uip"), "boss_data"), "mhp")) < 0)) && r.truth((await r.call("in_array", 1, r.get(r.get(s, "uip"), "attacked_vip"))))))) {
              await r.write("<!--//红暮损血了，而且是你干的，不过你没能达成其他结局//-->\r\n<span class=\"ltcrimson\">“看来时间女神没有垂青你啊。”</span><br>");
              if (r.truth((r.compare(r.get(r.get(r.get(s, "uip"), "boss_data"), "hp"), 0) <= 0))) {
                await r.write("你击倒的只是又一个幻象吗。<br>\r\n<span class=\"b\">“你这个懦夫，果然只是装死而已。”</span>你朝“死而复生”的红暮吼道。<br>\r\n拯救所有人的计划在最后功败垂成，这让你十分懊恼。<br>\r\n<span class=\"ltcrimson\">“真是个高傲的家伙。我应该表扬你，至少让我刮目相看了。”</span><br>");
              } else {
                await r.write("<span class=\"b\">“你等着！下一击就要你的命！”</span><br>\r\n然而你的身体已经深陷束缚代码，不听使唤了。<br>\r\n<span class=\"ltcrimson\">“真是个鲁莽的家伙。我应该表扬你，至少让我的期待没有落空。”</span><br>");
              }
            } else {
              await r.write("<!--//红暮没损血，或者不是你打的红暮//-->");
              if (r.truth((!r.identical(false, (await r.call("strpos", r.get(s, "winner"), ",")))))) {
                await r.write("<!--//多个胜利者，即组队模式幸存//-->\r\n<span class=\"b\">“现在，该放我们出去了吧。”</span><br><br>\r\n在你和队友的完美配合下，最后一名敌对的“挑战者”也落败了。<br>\r\n虽然，你们继续打下去，大概连红暮都能干掉，<br>\r\n但考虑到敌对的队伍也是有备而来，尽早从这个是非之地撤离才是上策。<br>");
              } else {
                if (r.truth((r.truth((r.compare(r.get(s, "killnum"), 0) > 0)) && r.truth(r.equal(0, (await r.module("skillbase", "skill_getvalue", 1003, "last_kill_type"))))))) {
                  await r.write("<!--//最后打死的是活人//-->\r\n<span class=\"b\">“抱歉，但我必须活着出去。”</span><br><br>");
                  r.assign(r.slot(s, ["tmp_method"]), (await r.module("skillbase", "skill_getvalue", 1003, "last_kill_method")));
                  if (r.truth(r.equal(27, r.get(s, "tmp_method")))) {
                    await r.write("你一边默念着这句话，一边观察着远处的动静。<br>\r\n巨大的响动声传来，你明白最后一名竞争者也中招了。<BR>\r\n你谨慎地回到自己设下的陷阱旁，亲眼看到了那名“挑战者”支离破碎的尸体。<BR>\r\n这是结束这场死亡竞赛最保险的办法。<BR>\r\n虽然不情愿，但在这危机关头，自己活下去才是最重要的。<BR>");
                  } else {
                    if (r.truth(r.equal(25, r.get(s, "tmp_method")))) {
                      await r.write("你默念着这句话，摁下了按钮。<BR>\r\n随着震耳欲聋的爆炸声，你的视野瞬间被火光和烟尘吞没了。<BR>\r\n最后一名“挑战者”被你刚设下的爆炸物炸上了天。<BR>\r\n硝烟散去，你毫发无伤。不过你并没有感到丝毫喜悦。<br>\r\n虽然不情愿，但在这危机关头，自己活下去才是最重要的。<BR>");
                    } else {
                      if (r.truth((await r.call("in_array", r.get(s, "tmp_method"), r.array([[r.APPEND, 20], [r.APPEND, 21], [r.APPEND, 22], [r.APPEND, 23], [r.APPEND, 24], [r.APPEND, 29]]))))) {
                        await r.write("对峙中，你向最后一名“挑战者”道出了这句话。<BR>\r\n他的眼神坚毅而锐利，显然为了性命也豁出去了。<BR>\r\n但你们两人只有一个能幸存下去。<BR>\r\n狂风骤起，对方向你扑来，而");
                        if (r.truth((!r.equal("WN", r.get(s, "wepk"))))) {
                          await r.write("你扬起");
                          await r.write(r.text((await r.module("itemmain", "parse_itmk_words", r.get(s, "wepk")))));
                        } else {
                          await r.write("你挥舞双拳");
                        }
                        await r.write("上前应战。<BR>\r\n仅仅一招，你们便分出了胜负。对方缓缓倒下，而你依旧站立着。<BR>\r\n虽然不情愿，但在这危机关头，自己活下去才是最重要的。<BR>");
                      } else {
                        await r.write("你默念着这句话，不得已痛下杀手。<br>\r\n哪怕你们曾经是同伴，在这场生死战中，只能各自为政。<br>\r\n于是，最后一名“挑战者”也失去了生命。<br>\r\n虽然不情愿，但在这危机关头，自己活下去才是最重要的。<BR>");
                      }
                    }
                  }
                } else {
                  if (r.truth((r.compare(r.get(s, "killnum"), 0) > 0))) {
                    await r.write("<!--//最后打死的不是活人，但是杀过人//-->\r\n<span class=\"b\">“抱歉，但我必须活着出去。”</span><BR>\r\n<BR>\r\n尽管有些波折，但这些参与者都不是你的对手。<BR>\r\n你能确定，你击杀的这些“挑战者”大部分都只是数据的残片而已。<br>\r\n其中究竟有几个，是你本该拯救的人们呢？，<br>\r\n你轻轻摇了摇头，把这个念头赶出了脑海。毕竟，你还有更重要的事要做。<br>\r\n虽然不情愿，但在这危机关头，自己活下去才是最重要的。<BR>");
                  } else {
                    await r.write("<!--//没打死人//-->");
                    if (r.truth((r.compare(r.get(s, "validnum"), 1) > 0))) {
                      await r.write("<!--//其他挑战者翻船//-->");
                      if (r.truth((r.compare(r.get(s, "deathnum"), 300) > 0))) {
                        await r.write("<span class=\"b\">“我……这就赢了？”</span><BR>\r\n你刚才还躲在掩体里瑟瑟发抖，此刻却成了获胜者。<BR>\r\n幻境的战事无比惨烈。放眼望去，没有一寸地方不存在弹坑和血迹。<br>\r\n造成这一切的挑战者，一定身手不凡，而又心狠手辣吧。<br>\r\n然而，似乎连他也没能笑到最后，把胜利拱手让给了你。<BR>");
                      } else {
                        await r.write("<span class=\"b\">“我……这就赢了？”</span><BR>\r\n幻境正在广播你通报获胜的消息，而你不敢相信自己的耳朵。<BR>\r\n似乎其他的挑战者都阴沟里翻了船，把最后的胜利拱手让给了你。<BR>");
                      }
                    } else {
                      await r.write("<!--//场上就1个玩家//-->\r\n<span class=\"b\">“呼，都太弱了。”</span><BR>\r\n其他参与者明显不是你的对手。<BR>\r\n你怀疑，他们并不是真人，而都只是数据的残片。<BR>\r\n这么说，大概时空特使的战友们已经找到机会逃出去了。<BR>");
                    }
                    if (r.truth((r.truth((r.compare(r.get(s, "wepe"), 1000) > 0)) && r.truth((r.compare(r.add(r.add(r.add(r.get(s, "arbe"), r.get(s, "arae")), r.get(s, "arfe")), r.get(s, "arhe")), 10000) > 0))))) {
                      await r.write("你甚至觉得，你能和那个“红暮”过几招，也许还能给她点颜色看看。<br>\r\n遗憾的是，你没有机会验证你的猜想。<br>");
                    }
                    await r.write("算了，这样也好，至少你用不着去伤害那些无辜者了。<BR>");
                  }
                }
              }
              await r.write("<BR>");
              if (r.truth((r.compare(r.get(r.get(r.get(s, "uip"), "boss_data"), "hp"), 0) <= 0))) {
                await r.write("尽管红暮的“尸体”正躺在无月之影，但这是幻境，她显然不会就此退场。<BR>\r\n<BR>");
              }
              if (r.truth((!r.identical(false, (await r.call("strpos", r.get(s, "winner"), ",")))))) {
                await r.write("<span class=\"b\">“我们活到了最后！”</span><BR>");
              } else {
                await r.write("<span class=\"b\">“这个挑战，我完成了！”</span><BR>");
              }
              await r.write("你朝着天空喊出了这句话，你知道红暮一定能听见，<BR>\r\n<span class=\"b\">“你打算旁观到什么时候？”</span>");
            }
          }
        }
        await r.write("</div><div id=\"op_sht_1\" class=\"shootings\">");
        if (r.truth((r.truth((r.compare(r.get(r.get(r.get(s, "uip"), "boss_data"), "hp"), r.get(r.get(r.get(s, "uip"), "boss_data"), "mhp")) < 0)) && r.truth((await r.call("in_array", 1, r.get(r.get(s, "uip"), "attacked_vip"))))))) {
          await r.write("<span class=\"ltcrimson\"> “虽然");
          await r.write(r.text(r.get(r.get(s, "uip"), "winner_pronoun")));
          await r.write("试图违反这场挑战的规则，<br>\r\n我还是要祝贺");
          await r.write(r.text(r.get(r.get(s, "uip"), "winner_pronoun")));
          await r.write("成为了最后的幸存者。”</span><br>");
        } else {
          await r.write("<span class=\"ltcrimson\"> “祝贺");
          await r.write(r.text(r.get(r.get(s, "uip"), "winner_pronoun")));
          await r.write("，最后的幸存者。”</span><br>\r\n红暮果然现身了，凭空出现在");
          await r.write(r.text(r.get(r.get(s, "uip"), "winner_pronoun")));
          await r.write("的面前，<span class=\"ltcrimson\">“身手还挺不错的。”</span><br>");
        }
        await r.write("<br>\r\n<img border=\"0\" src=\"./img/story_ne2.png\" style=\"width:450px;\"><br>\r\n<br>\r\n她微笑着向你伸出右手，不过你把她的“好意”瞪了回去。<br>\r\n<span class=\"ltcrimson\">“别这么拘谨嘛，既然");
        await r.write(r.text(r.get(r.get(s, "uip"), "winner_pronoun")));
        await r.write("通过了考验，那就是我们的座上宾了。”</span><br>\r\n你按捺住吐唾沫的欲望：<span class=\"b\">“逼我向无辜者和同伴下手，这是侮辱。”</span><br>\r\n<span class=\"ltcrimson\">“你和你的同伙打乱了我们的计划，还把幻境搞得乱七八糟，<br>\r\n我给你一次活下去的机会，已经很仁慈了。”</span><br>\r\n<span class=\"b\">“那为何不直接杀了我？”</span><br>\r\n<br>\r\n红暮邪魅一笑：<span class=\"ltcrimson\">“因为");
        await r.write(r.text(r.get(r.get(s, "uip"), "winner_pronoun")));
        await r.write("对我有价值。”</span><br>\r\n</div><div id=\"op_sht_2\" class=\"shootings\">\r\n<span class=\"ltcrimson\">“这个「虚拟幻境」的真正目的，是激发人类的潜能。<br>\r\n换句话说，这里是个超能力开发场所。至少林无月的初衷是如此。<br><br>\r\n打个比方，不会游泳的人，扔进泳池里扑腾几下，多半也能浮起来。<br>\r\n这幻境就是那个游泳池，只不过装的不是水，<br>\r\n而是现实里永远无法做到的事、永远无法体验到的感受。<br>\r\n随后，当你带着这份体验回到现实，也许就打开了新世界的大门。<br>\r\n我没有亲身体会，不过我确实亲眼见证过。”</span><br>\r\n红暮举起右手，朝你竖起一根食指：<br>\r\n<br>\r\n<span class=\"ltcrimson\">“而你，难道不想亲眼目睹自己的可能性吗？”</span><br>\r\n<br>\r\n这段连时空特使都从未提及的信息，让你的好奇心熊熊地燃烧起来。<br>\r\n怪不得，总有人顶着那些令人恐惧的传言，一而再、再而三回到这里……<br>\r\n你感觉心中有一部分微妙地动摇了。<br>\r\n</div><div id=\"op_sht_3\" class=\"shootings\">\r\n<span class=\"ltcrimson\">“无论如何，");
        await r.write(r.text(r.get(r.get(s, "uip"), "winner_pronoun")));
        await r.write("是本场「大逃杀」的获胜者，我肯定会保证");
        await r.write(r.text(r.get(r.get(s, "uip"), "winner_pronoun")));
        await r.write("的人身安全。<br>\r\n不过，我们「金龙通讯社」也正处于发展期，迫切需要");
        await r.write(r.text(r.get(r.get(s, "uip"), "winner_pronoun")));
        await r.write("这样身手不凡的人。”<br>\r\n只要");
        await r.write(r.text(r.get(r.get(s, "uip"), "winner_pronoun")));
        await r.write("加入，我们会提供必要的训练，帮助");
        await r.write(r.text(r.get(r.get(s, "uip"), "winner_pronoun")));
        await r.write("真正掌握新获得的能力……<br>\r\n以及，克服幻境带来的「后遗症」。”</span><br>\r\n这破地方……竟然还有后遗症？<br>\r\n<br>\r\n红暮似乎看穿了你在想什么：<br>\r\n<span class=\"ltcrimson\">“尝到过飞翔的快乐，就不会甘于在地上爬，你的潜意识也是如此。<br>\r\n总有人在脱离幻境回到现实后，产生戒断症状，甚至精神失常。<br>\r\n被难以驾驭的超能力反噬的例子，也有不少。<br>\r\n这也是林无月曾经最为头疼的问题，她直到最后都在寻找对策。<br>\r\n不过对我们「金龙通讯社」来说，却并非坏事。<br>\r\n当然，");
        await r.write(r.text(r.get(r.get(s, "uip"), "winner_pronoun")));
        await r.write("也可以选择直接离开。哪怕");
        await r.write(r.text(r.get(r.get(s, "uip"), "winner_pronoun")));
        await r.write("继续与我们为敌，我也不会阻拦。<br>\r\n但其后果，也由");
        await r.write(r.text(r.get(r.get(s, "uip"), "winner_pronoun")));
        await r.write("自己承受。”</span><br>\r\n<br>\r\n真是才出狼穴，又入虎口。你心中暗暗叫苦。<br>\r\n</div><div id=\"op_sht_4\" class=\"shootings\">\r\n<span class=\"ltcrimson\">“总之，接下来的道路，由");
        await r.write(r.text(r.get(r.get(s, "uip"), "winner_pronoun")));
        await r.write("自己来决定。”</span><br>");
        if (r.truth((!r.identical(false, (await r.call("strpos", r.get(s, "winner"), ",")))))) {
          await r.write("<span class=\"ltcrimson\">“你们每一个，都能有选择的机会。”</span><br>");
        }
        await r.write("红暮打了一个响指，指尖变出了两支「钥匙」。<br>\r\n<br>\r\n<img border=\"0\" src=\"./img/story_ne3.png\" style=\"width:450px;\"><br>\r\n<br>\r\n她亮出<span class=\"red\">红钥匙</span>：<span class=\"red b\" style=\"font-size:12pt\">“是 <span class=\"b\" style=\"font-size:14pt\"><ruby>加入我们<rt style=\"font-size:9px\">Betrayal of the duty</rt></ruby></span>，拥抱自己崭新的人生？”</span><br>\r\n\r\n之后是<span class=\"cyan\">蓝钥匙</span>：<span class=\"cyan b\" style=\"font-size:12pt\">“还是 <span class=\"b\" style=\"font-size:14pt\"><ruby>拒绝我们<rt style=\"font-size:9px\">Be loyal to the duty</rt></ruby></span>，拾起自己灰暗的命运？”</span><br>\r\n<br>\r\n<span class=\"ltcrimson\">“报出你的名字，结束这场挑战。”</span>两支钥匙都被递到你面前。<br>\r\n<span class=\"ltcrimson\">“然后，做出你的选择。”</span><br>\r\n</div><div id=\"op_sht_5\" class=\"shootings\">\r\n一边是升华的机会，一边是昔日的坚持。<br>\r\n一边是背叛战友的愧疚不安，另一边是错失良机的无尽后悔。<br>\r\n想不到，思想斗争竟然如此让人煎熬。<br>\r\n<br>\r\n<br>\r\n踌躇良久，你伸出颤抖的手。<br>\r\n<br>\r\n<span class=\"yellow b\">“我是 挑战者");
        await r.write(r.text(r.get(s, "sNo")));
        await r.write("号，");
        await r.write(r.text(r.get(r.get(s, "uip"), "winner_show")));
        await r.write("。<br>\r\n“我选择……”</span><BR>\r\n<br>\r\n<br>\r\n<br>\r\n<br>\r\n<br>\r\n<br>\r\n<br>\r\n<span class=\"evergreen b\">■ GAME CLEAR - END #1 ■</span><br>\r\n<span class=\"evergreen b\" style=\"font-weight:700;font-size:18pt;line-height:18pt;\">「最后幸存」胜利！恭喜！</span>\r\n</div>");
      }
    }
  }
return 1;
}
