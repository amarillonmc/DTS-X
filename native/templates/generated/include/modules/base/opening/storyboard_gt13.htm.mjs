// Generated from include/modules/base/opening/storyboard_gt13.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  await r.write("<!--///////////////////////////////////////////////////-->\r\n<!--////////////////////  试炼模式  ////////////////////-->\r\n<!--///////////////////////////////////////////////////-->");
  r.assign(r.slot(s, ["alvl"]), r.int(r.get(r.get(r.get(s, "roomvars"), "current_game_option"), "lvl")));
  await r.write("<div id=\"op_sht_0\" class=\"shootings\">\r\n这就是困在果壳里的感觉吗？<br>\r\n<br>\r\n你，作为一名“挑战者”，再次回到了起点。<br>\r\n再次一无所有地挑战这个虚拟世界。<br>\r\n<br>\r\n记忆涌上你的脑海。<br>\r\n无论你死去多少次，只需要一个念头，就能如踏入房间一般轻松复活。<br>\r\n但这并不是因为你拥有超能力，而是因为你和<ruby class=\"ltcrimson b\">那个家伙<rt>红暮</rt></ruby>签下了契约。<br>\r\n——名为<span class=\"red b\">『红色钥匙』</span>的恶魔契约。<br>\r\n以为与魔鬼做交易就能获得力量，到头来自己却被关进了瓶子里。<br>\r\n真是字面意义上的地狱笑话——<br>\r\n<br>\r\n<br>\r\n<br>\r\n——在不考虑故意为之的情况下。<br>\r\n为了查明幻境的真相，你不得不只身犯险。<br>\r\n<br>\r\n<span class=\"b\">");
  if (r.truth((r.compare(r.get(s, "alvl"), 20) <= 0))) {
    await r.write("前所未见的真正危险。<br>");
  } else {
    if (r.truth((r.compare(r.get(s, "alvl"), 29) <= 0))) {
      await r.write("名为试炼的挑战，以及侵蚀着幻境的异象。<br>");
    } else {
      await r.write("所幸，距离结束这一切，只差临门一脚了。<br>");
    }
  }
  await r.write("</span>\r\n</div><div id=\"op_sht_1\" class=\"shootings\">\r\n<img border=\"0\" src=\"./img/story_n8.jpg\" style=\"width:400px;\"><br>\r\n『无月之影』，这个幻境的入口、曾经喧嚣的地狱客厅，如今寂寥无人。<br>\r\n因为这偌大的幻境，<span class=\"yellow b\">此刻只有你一个“挑战者”</span>。<br>\r\n<br>");
  if (r.truth((r.truth((r.compare(r.get(s, "alvl"), 10) <= 0)) || r.truth((r.compare(r.get(s, "alvl"), 30) > 0))))) {
    await r.write("这是监狱。你心想。而刑期是永远。<br>\r\n除非……<br>\r\n<span class=\"ltcrimson\">『……除非你能证明你的力量。』</span><br>\r\n红暮的声音如约响起。<br>\r\n<span class=\"ltcrimson\">『如果你「解离」了这整个世界，我自然会放你离开。』</span><br>");
  } else {
    if (r.truth((r.compare(r.get(s, "alvl"), 29) <= 0))) {
      await r.write("这是监狱。你心想。而刑期是永远。<br>\r\n除非……<br>\r\n<span class=\"vermilion\">『……除非你完成了这整个试炼。』</span><br>\r\n响起的声音来自『红杀』的最强爪牙——芙蓉。<br>\r\n<span class=\"vermilion\">『这是<ruby class=\"ltcrimson b\">红杀将军<rt>红暮</rt></ruby>留下的指令。』</span><br>");
    } else {
      await r.write("这是监狱。<br>\r\n然而这一次，也许就是破狱之日。<br>\r\n<span class=\"vermilion\">『……这就是最后的试炼了。』</span><br>\r\n响起的声音来自『红杀密传』——芙蓉。<br>\r\n<span class=\"vermilion\">『如果你冲破了这一关，一切就都能结束了。』</span><br>");
    }
  }
  await r.write("</div><div id=\"op_sht_2\" class=\"shootings\">");
  if (r.truth((r.truth((r.compare(r.get(s, "alvl"), 10) <= 0)) || r.truth((r.compare(r.get(s, "alvl"), 30) > 0))))) {
    await r.write("<img border=\"0\" src=\"./img/story_n7.jpg\" style=\"width:450px;\">");
  } else {
    await r.write("<img border=\"0\" src=\"./img/story_n9.jpg\" style=\"width:400px;\">");
  }
  await r.write("<br><br>");
  if (r.truth(r.equal(0, r.get(s, "alvl")))) {
    await r.write("<span class=\"b\">“你欺骗了我！”</span>你装作愤怒地喊道。<br>\r\n<span class=\"ltcrimson\">『你太稚嫩了。』</span>红暮的声音听起来很轻蔑。<br>\r\n<br>\r\n<span class=\"ltcrimson\">『这个幻境，就是「红杀」用来培养超能力者的训练场……某种意义上算是吧。</span><br>\r\n<span class=\"ltcrimson\">『而这也正好能提供你梦寐以求的「超能力」。</span><br>\r\n<span class=\"ltcrimson\">『只不过，代价是一点点的时间、以及痛苦……没错，一点点罢了。』</span><br>");
  } else {
    if (r.truth(r.equal(1, r.get(s, "alvl")))) {
      await r.write("<span class=\"b\">“我已经「解离」过这个幻境了！”</span>你故意咬牙切齿。<br>\r\n<span class=\"ltcrimson\">『那是因为幻境给了你虚假的自信。现在，我将对<span class=\"yellow b\">「游戏规则」</span>作一点微小改动。』</span><br>\r\n<br>\r\n红暮话音未落，你感觉你的身躯陡然沉重起来。<br>\r\n<span class=\"ltcrimson\">『我减少了幻境赋予你的一部分等级上限。仅仅是幻境馈赠的一小部分而已。</span><br>\r\n<span class=\"ltcrimson\">『明白了吗？你距离真正冲破这里，还有<span class=\"yellow b\">至少二十九条街</span>的距离。』</span><br>");
    } else {
      if (r.truth((r.compare(r.get(s, "alvl"), 10) <= 0))) {
        await r.write("<span class=\"b\">“这不是我第一次通关了，”</span>你朝红暮投去愤恨的眼神，<span class=\"b\">“你食言了，仍然没有放我出去。”</span><br>\r\n<br>\r\n<span class=\"ltcrimson\">『你通过的试炼，不过是过家家，』</span>红暮摇了摇头，<span class=\"ltcrimson b\">『远远不是真正的考验。』</span><br>\r\n<span class=\"b\">“我甚至被你<span class=\"yellow b\">削弱了力量</span>，”</span>你喊道，<span class=\"b\">“难道这还不算考验吗？”</span><br>\r\n<span class=\"ltcrimson\">『和真正的敌人相比，这根本不算什么。』</span><br>");
        if (r.truth((r.compare(r.get(s, "alvl"), 4) <= 0))) {
          await r.write("你感到身体再次失去力量。");
        } else {
          await r.write("你感到身体再次失去力量，连肉体都变得更加脆弱。");
        }
        await r.write("<br>\r\n<br>\r\n<span class=\"ltcrimson\">『这样，才算有了一点观赏价值。』</span><br>");
      } else {
        if (r.truth((r.compare(r.get(s, "alvl"), 20) <= 0))) {
          await r.write("<span class=\"b\">“红暮这次都不敢面对我了吗？”</span>你冷冷地回应，<span class=\"b\">“堂堂红杀组织的大小姐，就这么喜欢玩猫抓老鼠的游戏吗？”</span><br>\r\n<span class=\"vermilion\">『红暮不是猫，而你可能确实是老鼠。』</span>芙蓉面无表情。<br>");
          if (r.truth((r.compare(r.get(s, "alvl"), 11) <= 0))) {
            await r.write("那种沉重感再次袭来。这次，连你引以为傲的复活能力都失去了。");
          } else {
            if (r.truth((r.compare(r.get(s, "alvl"), 19) <= 0))) {
              await r.write("那种沉重感再次袭来。不仅失去了复活能力，身体还变得更加虚弱。");
            } else {
              await r.write("那种沉重感再次袭来。不仅失去了复活能力，身体还变得更加虚弱。更糟糕的是，还套上了名为『连斗』的枷锁。");
            }
          }
          await r.write("<br>\r\n<span class=\"vermilion\">『就算削弱得如此严重，你也仍然比大多数玩家要强。』</span><br>");
          if (r.truth((r.compare(r.get(s, "alvl"), 15) <= 0))) {
            await r.write("<span class=\"vermilion\">『然而，在真正严酷的挑战面前，这不过是热身运动罢了。』</span><br>");
          } else {
            await r.write("<span class=\"vermilion\">『然而，真正严酷的挑战，现在才刚开始。』</span><br>");
          }
          await r.write("<span class=\"b\">“说什么风凉话，你又怎么能知道？”</span>你抗议道。<br>\r\n<span class=\"vermilion\">『我当然知道，因为这套试炼规则是我设计的。』</span><br>\r\n芙蓉目光凛凛。<br>\r\n<span class=\"vermilion\">『用来磨炼你这种欲壑难填的人最为合适。』</span><br>");
        } else {
          if (r.truth((r.compare(r.get(s, "alvl"), 29) <= 0))) {
            await r.write("<span class=\"b\">“……”</span><br>\r\n被战斗和异象折磨得身心俱惫的你，已经连一句话都说不出来了。<br>\r\n但你十分坚定，甚至有些欣喜……有些惶恐。<br>\r\n种种迹象都表明，你在逐渐接近真相。<br>\r\n尽管真相也许没有那么美好。<br>\r\n<br>\r\n<span class=\"vermilion\">『干得不错，不枉我悉心的「栽培」。』</span><br>\r\n芙蓉的语调里流露着自负，以及……欣慰？<br>\r\n<span class=\"vermilion\">但接下来才是真正残酷的「游戏规则」。</span><br>\r\n<br>");
            if (r.truth((r.compare(r.get(s, "alvl"), 22) <= 0))) {
              await r.write("你觉得身体已经比正常人还要孱弱了。然而，你毫不在乎。");
            } else {
              await r.write("不仅身体比常人还要孱弱，世界的恶意也变得更加汹涌。然而，你毫不在乎。");
            }
            await r.write("<br>\r\n杀穿这个幻境，已经几乎成为铭刻在你血肉中的本能。<br>");
          } else {
            if (r.truth((r.compare(r.get(s, "alvl"), 30) <= 0))) {
              await r.write("你，和面前的“芙蓉”对视着，久久无言。<br>\r\n<span class=\"vermilion\">『没想到你竟然能走到这里。如果我那时有你这样的执念就好了。』</span><br>\r\n“芙蓉”的神情看起来有一丝落寞。<br>\r\n虽然你已经知道，她和“红暮”一样，不过是一个没有灵魂的幻影。<br>\r\n宛如这个残破幻境中最后的孤灯。<br>\r\n<br>\r\n<span class=\"vermilion\">『你是我教过的最强的徒弟。最后的规则也不可能拦住你了吧。』</span><br>\r\n<span class=\"vermilion\">『当然，恐怕我已经看不到了。』</span><br>\r\n你把眼神撇向一边。<br>\r\n是不屑，还是遗憾？你也并不明白。<br>");
            } else {
              await r.write("<span class=\"ltcrimson\">『你是怎么做到的？我应该夸你一句「肮脏的黑客」吗？』</span>红暮看起来努力掩饰着她的惊讶。<br>\r\n你挑衅似的昂着头。<br>\r\n<span class=\"ltcrimson\">『看来已经等不及了呢，这就给你端上来吧。』</span><br>");
            }
          }
        }
      }
    }
  }
  await r.write("</div><div id=\"op_sht_3\" class=\"shootings\">\r\n传送的光圈覆盖了整个视野。<br>\r\n这究竟是第几次了呢？<br>\r\n<br>");
  if (r.truth((r.truth((r.compare(r.get(s, "alvl"), 10) <= 0)) || r.truth((r.compare(r.get(s, "alvl"), 30) > 0))))) {
    await r.write("<span class=\"ltcrimson\">『一切就绪。试炼现在开始。』</span><br>\r\n红暮的播报声逐渐模糊不清。<br>");
  } else {
    if (r.truth((r.compare(r.get(s, "alvl"), 20) <= 0))) {
      await r.write("<span class=\"vermilion\">『好好享受这场游戏吧。』</span><br>\r\n芙蓉的播报声逐渐模糊不清。<br>");
    } else {
      if (r.truth((r.compare(r.get(s, "alvl"), 29) <= 0))) {
        await r.write("<span class=\"vermilion\">『看看这一次，你能坚持到什么地步。』</span><br>\r\n芙蓉的声音逐渐远去。<br>");
      } else {
        await r.write("<span class=\"vermilion\">『你已经比我们走得都要远。接下来，就看你的了。』</span><br>\r\n芙蓉的声音逐渐远去。<br>\r\n也许真的是最后一次了。<br>");
      }
    }
  }
  await r.write("<br>\r\n<span class=\"vermilion b\">■ LIFE GAME: ASCENSION MODE ■</span><br>\r\n<span class=\"vermilion b\" style=\"font-weight:700;font-size:20pt;line-height:20pt;\">大逃杀·试炼模式</span><br>\r\n<br>\r\n<br>");
  if (r.truth((r.truth((r.compare(r.get(s, "alvl"), 10) <= 0)) || r.truth((r.compare(r.get(s, "alvl"), 30) > 0))))) {
    await r.write("<span class=\"yellow\" style=\"background-color: #ffff00;\">“就让我看看这次你能走多远吧。”</span><br>");
  } else {
    await r.write("<span class=\"yellow\" style=\"background-color: #ffff00;\">“你真的以为……能跳出我等的手掌心吗？”</span><br>");
  }
  await r.write("</div>");
return 1;
}
