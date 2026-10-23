// Generated from templates/default/npchelp.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  await r.write("<p><span class=\"lime b\">剧情BOSS NPC简介</span>：</p>\r\n此类NPC是<span class=\"lime b\">达成特殊胜利</span>必须要击倒的对象。红暮坐镇于<span class=\"yellow b\">无月之影</span>，蓝凝则呆在<span class=\"yellow b\">冰封墓场</span>。\r\n<br>她们对游戏前中期的玩家拥有压倒性的优势，但只要不去招惹她们，玩家并无性命之忧。\r\n<br>如果成功击倒了他们，能够获取<span class=\"lime b\">优质的装备</span>和<span class=\"lime b\">特殊胜利关键道具</span>。<br>\r\n<br>此外，");
  await r.write(r.text(r.get(r.get(s, "gtinfo"), "19")));
  await r.write("拥有特殊的剧情BOSS NPC。<input class=\"bigbutton\" onclick=\"bubblebox_show('i9_npc');\" value=\"点击这里查看\" type=\"button\"><br>\r\n<br>");
  if (r.truth((await r.call("is_array", r.array([[r.APPEND, 1], [r.APPEND, 9]]))))) {
    {
      const a0 = r.copy(r.array([[r.APPEND, 1], [r.APPEND, 9]]));
      for (const [k0, v0] of r.entries(a0)) {
        r.assign(r.slot(s, ["key"]), v0);
        (await r.module("npcinfo", "npcinfo_get_npc_description_all", r.get(s, "key")));
      }
    }
  }
  (await r.call("bubblebox_start", "id:i9_npc;height:560;width:772;cancellable:1;margin-top:20px;margin-bottom:20px;margin-left:20px;margin-right:10px;"));
  await r.write("<p><span class=\"lime b\">");
  await r.write(r.text(r.get(r.get(s, "gtinfo"), "19")));
  await r.write(" 剧情BOSS NPC简介</span>：</p>\r\n<p>");
  await r.write(r.text(r.get(r.get(s, "gtinfo"), "19")));
  await r.write("的BOSS NPC的数据和技能与标准模式略有差异。由于极速模式禁区节奏较快，其BOSS<span class=\"yellow b\">击杀难度比标准模式稍大</span>。</p>\r\n<br>");
  (await r.module("npcinfo", "npcinfo_get_npc_description_all", 15, r.get(s, "npcinfo_instance9")));
  (await r.module("npcinfo", "npcinfo_get_npc_description_all", 15, r.get(s, "enpcinfo_show")));
  (await r.module("npcinfo", "npcinfo_get_npc_description_all", 40, r.get(s, "npcinfo_instance9")));
  await r.write("<br> ");
  (await r.call("bubblebox_end"));
  await r.write("<p><span class=\"lime b\">高危NPC简介</span>：</p>\r\n此类NPC对玩家<span class=\"yellow b\">均有较大威胁</span>，在<span class=\"yellow b\">没有足够高的防御</span>的情况下，请<span class=\"yellow b\">尽可能避免和它们的接触</span>，也<span class=\"yellow b\">不要贸然攻击它们</span>，否则很可能导致自己被击杀。<br>\r\n当然，如果成功击杀了这些NPC，它们也会掉落<span class=\"lime b\">大量有用的道具或金钱</span>。<br>\r\n<br>");
  if (r.truth((await r.call("is_array", r.array([[r.APPEND, 6], [r.APPEND, 5], [r.APPEND, 88]]))))) {
    {
      const a1 = r.copy(r.array([[r.APPEND, 6], [r.APPEND, 5], [r.APPEND, 88]]));
      for (const [k1, v1] of r.entries(a1)) {
        r.assign(r.slot(s, ["key"]), v1);
        (await r.module("npcinfo", "npcinfo_get_npc_description_all", r.get(s, "key")));
      }
    }
  }
  await r.write("<br>\r\n<p><span class=\"lime b\">杂兵NPC简介</span>：</p>\r\n此类NPC对玩家基本无威胁。每个小兵NPC掉落金钱220元，是玩家<span class=\"yellow b\">最主要的熟练度、经验来源，也是最主要的击杀对象</span>。每个小兵NPC掉落金钱220元，是玩家<span class=\"lime b\">主要金钱来源</span>。<br>\r\n<br>");
  if (r.truth((await r.call("is_array", r.array([[r.APPEND, 90]]))))) {
    {
      const a2 = r.copy(r.array([[r.APPEND, 90]]));
      for (const [k2, v2] of r.entries(a2)) {
        r.assign(r.slot(s, ["key"]), v2);
        (await r.module("npcinfo", "npcinfo_get_npc_description_all", r.get(s, "key")));
      }
    }
  }
  await r.write("<br>\r\n<p><span class=\"lime b\">全息幻象NPC简介</span>：</p>\r\n全息幻象虽然比杂兵更难以击倒，但也掉落<span class=\"lime b\">更多的金钱</span>以及<span class=\"lime b\">各系优秀的武器或强化道具</span>。\r\n<br>借助<span class=\"lime b\">探测器、进行状况，甚至记忆</span>来找到全息幻象的位置并尽快击倒，往往是<span class=\"yellow b\">拉开玩家差距、建立优势乃至取得最终胜利的关键</span>。\r\n<br>此外，把同名的全息幻象击倒后，会有对应的<span class=\"yellow b\">全息实体</span>加入战场。<input class=\"bigbutton\" onclick=\"bubblebox_show('i8_npc');\" value=\"点击这里查看\" type=\"button\"><br>\r\n<br>");
  if (r.truth((await r.call("is_array", r.array([[r.APPEND, 2]]))))) {
    {
      const a3 = r.copy(r.array([[r.APPEND, 2]]));
      for (const [k3, v3] of r.entries(a3)) {
        r.assign(r.slot(s, ["key"]), v3);
        (await r.module("npcinfo", "npcinfo_get_npc_description_all", r.get(s, "key")));
      }
    }
  }
  await r.write("<br>");
  (await r.call("bubblebox_start", "id:i8_npc;height:560;width:772;cancellable:1;margin-top:20px;margin-bottom:20px;margin-left:20px;margin-right:10px;"));
  await r.write("<p><span class=\"lime b\">");
  await r.write(r.text(r.get(r.get(s, "gtinfo"), "18")));
  await r.write(" 全息实体NPC简介</span>：</p>\r\n<p>全息实体比全息幻象的强度更高且<span class=\"yellow b\">具有独特的技能</span>，对玩家具有一定的威胁性，<span class=\"yellow b\">击杀难度也稍大</span>。</p>\r\n<br>");
  if (r.truth((await r.call("is_array", r.array([[r.APPEND, 46]]))))) {
    {
      const a4 = r.copy(r.array([[r.APPEND, 46]]));
      for (const [k4, v4] of r.entries(a4)) {
        r.assign(r.slot(s, ["key"]), v4);
        (await r.module("npcinfo", "npcinfo_get_npc_description_all", r.get(s, "key"), r.get(s, "anpcinfo")));
      }
    }
  }
  await r.write("<br> ");
  (await r.call("bubblebox_end"));
  await r.write("<p><span class=\"lime b\">真职人NPC简介</span>：</p>\r\n此类NPC在开局对<span class=\"yellow b\">无防具的玩家有较大威胁</span>，这类NPC的特点是<span class=\"yellow b\">防御非常高</span>，且<span class=\"yellow b\">武器均带有“电击+冻气+带毒+火焰+音波”属性</span>，很容易导致玩家中异常状态。<br>如果防具很差，或没有属性防御也没钱买药剂，请不要贸然攻击它们，否则很可能导致自己中大量异常状态后难以恢复，苦不堪言。<br>\r\n当然，击杀这些NPC后可以获取<span class=\"lime b\">极为优秀的防具</span>，在游戏中后期<span class=\"lime b\">击杀它们并拾取它们的防具保护自己</span>往往是玩家取胜的关键。<br>\r\n<br>");
  if (r.truth((await r.call("is_array", r.array([[r.APPEND, 11]]))))) {
    {
      const a5 = r.copy(r.array([[r.APPEND, 11]]));
      for (const [k5, v5] of r.entries(a5)) {
        r.assign(r.slot(s, ["key"]), v5);
        (await r.module("npcinfo", "npcinfo_get_npc_description_all", r.get(s, "key")));
      }
    }
  }
  await r.write("<br>\r\n<p><span class=\"lime b\">电波幽灵NPC简介</span>：</p>\r\n此类NPC在开局对<span class=\"yellow b\">无防具的玩家有较大威胁</span>，<span class=\"yellow b\">受到一定伤害之后会狂暴</span>，而且<span class=\"yellow b\">探测器上并不能看到他们</span>，麻烦程度相当高。\r\n<br>不过，电波幽灵比全息幻象掉落<span class=\"lime b\">更多的金钱</span>以及<span class=\"lime b\">更优秀的武器和防具</span>，如果能找到并且顺利击倒，<span class=\"yellow b\">对游戏的帮助非常大。</span><br>\r\n<br>");
  if (r.truth((await r.call("is_array", r.array([[r.APPEND, 45]]))))) {
    {
      const a6 = r.copy(r.array([[r.APPEND, 45]]));
      for (const [k6, v6] of r.entries(a6)) {
        r.assign(r.slot(s, ["key"]), v6);
        (await r.module("npcinfo", "npcinfo_get_npc_description_all", r.get(s, "key")));
      }
    }
  }
  await r.write("<br>\r\n\r\n<p><span class=\"lime b\">数据碎片NPC简介</span>：</p>\r\n此类NPC对玩家威胁不大，但当玩家击杀它们后，它们会变身为<span class=\"yellow b\">“第二形态”</span>，此时<span class=\"yellow b\">攻击力会变得极强</span>。<br>可别不小心击杀了它们后被第二形态秒杀哦～ 不过，当自己处于劣势时，偷偷击杀这类NPC，并期望对手撞上它们并被它们秒杀，也是不错的翻盘思路哦～\r\n<br><input class=\"bigbutton\" onclick=\"bubblebox_show('ev_npc');\" value=\"点击这里查看\" type=\"button\">女主的第二形态。<br>");
  if (r.truth((await r.call("is_array", r.array([[r.APPEND, 14]]))))) {
    {
      const a7 = r.copy(r.array([[r.APPEND, 14]]));
      for (const [k7, v7] of r.entries(a7)) {
        r.assign(r.slot(s, ["key"]), v7);
        (await r.module("npcinfo", "npcinfo_get_npc_description_all", r.get(s, "key")));
      }
    }
  }
  await r.write("<br>");
  (await r.call("bubblebox_start", "id:ev_npc;height:560;width:772;cancellable:1;margin-top:20px;margin-bottom:20px;margin-left:20px;margin-right:10px;"));
  await r.write("<p><span class=\"lime b\">数据碎片第二形态NPC简介</span>：</p>\r\n<p>女主的第二形态实力强大，无准备的情况下遭遇她们<span class=\"yellow b\">有性命之忧！</span>不过，击倒她们也是<span class=\"lime b\">特殊胜利</span>的必经之路。</p>\r\n<br>");
  if (r.truth((await r.call("is_array", r.array([[r.APPEND, 14]]))))) {
    {
      const a8 = r.copy(r.array([[r.APPEND, 14]]));
      for (const [k8, v8] of r.entries(a8)) {
        r.assign(r.slot(s, ["key"]), v8);
        r.assign(r.slot(s, ["enpcinfo_show", "enpcflag"]), 1);
        (await r.module("npcinfo", "npcinfo_get_npc_description_all", r.get(s, "key"), r.get(s, "enpcinfo_show")));
      }
    }
  }
  await r.write("<br> ");
  (await r.call("bubblebox_end"));
  await r.write("<p><span class=\"lime b\">拟似意识NPC简介</span>：</p>\r\n在雏菊之丘有一位特殊的NPC，她平时以<span class=\"yellow b\">特殊事件</span>的形式存在，不加入战斗。但如果玩家击倒三女主的第二形态，之后合成<span class=\"yellow b\">破灭之诗</span>并使用，这名NPC就会加入战场。<br>\r\n她掉落的道具是<span class=\"lime b\">特殊胜利</span>的必须道具。虽然她血量甚至不如玩家开局状态，但攻击力和防御力都十分吓人，并且装备属性拥有<span class=\"yellow b\">物抹+属抹</span>的双重抗性，要击倒她必须动点脑筋。<br>\r\n<br>");
  if (r.truth((await r.call("is_array", r.array([[r.APPEND, 4]]))))) {
    {
      const a9 = r.copy(r.array([[r.APPEND, 4]]));
      for (const [k9, v9] of r.entries(a9)) {
        r.assign(r.slot(s, ["key"]), v9);
        (await r.module("npcinfo", "npcinfo_get_npc_description_all", r.get(s, "key"), r.get(s, "anpcinfo")));
      }
    }
  }
  await r.write("<br>\r\n\r\n<p><span class=\"lime b\">佣兵NPC 简介</span>：</p>\r\n佣兵是<u><A href=\"help.php#称号与技能\">富家子弟的称号技能</A></u>召唤出的NPC。不同的佣兵实力差距很大，能召唤出什么佣兵纯靠运气。<br>\r\n以下是所有佣兵的列表：<input class=\"bigbutton\" onclick=\"bubblebox_show('skill56_merc');\" value=\"点击这里查看\" type=\"button\"><br>\r\n<br>");
  (await r.call("bubblebox_start", "id:yl_npc;height:560;width:772;cancellable:1;margin-top:20px;margin-bottom:20px;margin-left:20px;margin-right:10px;"));
  await r.write("<p style=\"margin-left:0px; margin-top:0px; margin-right:0px; margin-bottom:0px;\">\r\n以下是英灵殿中的主要NPC简介。<br><br>\r\n<span class=\"lime b\">天神NPC 简介</span>：\r\n</p>\r\n<p>天神称号授予对ACFUN大逃杀的创造和发展有里程碑式贡献的人物。目前有冴月麟、四面、虚子、lemon四人。<br>\r\n虽然理论上还应该有初七等人，但是由于GM的偷懒并没有加入。该等级的NPC对玩家基本就是<span class=\"yellow b\">一击即死</span>。<br>\r\n但是攻击面与防御面实际上并不是英灵殿最突出的。 <br></p>\r\n<br>");
  if (r.truth((await r.call("is_array", r.array([[r.APPEND, 22]]))))) {
    {
      const a10 = r.copy(r.array([[r.APPEND, 22]]));
      for (const [k10, v10] of r.entries(a10)) {
        r.assign(r.slot(s, ["key"]), v10);
        (await r.module("npcinfo", "npcinfo_get_npc_description_all", r.get(s, "key")));
      }
    }
  }
  await r.write("<br>\r\n<p><span class=\"lime b\">武神NPC 简介</span>：</p>\r\n<p>武神称号授予参与过ACFUN大逃杀开发工作的人员。武神装备有接近10000总防御的防具，拥有很高的基础攻防，并各有特色。<br>\r\n武神统一拥有<span class=\"yellow b\">“伤害制御”</span>属性，<span class=\"lime b\">有90%的几率把受到的伤害压缩到2000点</span>。<br>\r\n由於大多数武神拥有<span class=\"yellow b\">“强袭姿态”</span>，先攻率远高于其他NPC，是进军英灵殿玩家的最大威胁。<br></p>\r\n<br>");
  if (r.truth((await r.call("is_array", r.array([[r.APPEND, 21]]))))) {
    {
      const a11 = r.copy(r.array([[r.APPEND, 21]]));
      for (const [k11, v11] of r.entries(a11)) {
        r.assign(r.slot(s, ["key"]), v11);
        (await r.module("npcinfo", "npcinfo_get_npc_description_all", r.get(s, "key")));
      }
    }
  }
  await r.write("<br> ");
  (await r.call("bubblebox_end"));
  await r.write("<p><span class=\"lime b\">英灵殿NPC 简介</span>：</p>\r\n此外，<span class=\"yellow b\">英灵殿</span>中还有大量高强度NPC，供有兴趣的PVE玩家挑战。<br>\r\n它们与正常游戏几乎没有什么关系，但如果你依然有兴趣，请点击下面的按钮查看它们的数据。<br>\r\n<input class=\"bigbutton\" onclick=\"bubblebox_show('yl_npc');\" value=\"点击这里查看\" type=\"button\">\r\n<br>");
  (await r.call("bubblebox_start", "id:final_npc;height:560;width:772;cancellable:1;margin-top:20px;margin-bottom:20px;margin-left:20px;margin-right:10px;"));
  await r.write("<p><span class=\"lime b\">幻境的最后防线 简介</span>：</p>\r\n<p>断罪女神 一一五将会在玩家全灭场上NPC时，刷新在英灵殿。她的数值高得可怕，而且还有非常麻烦的装备属性和技能。不过对于走到这一步的玩家来说，已经没有什么可以阻挡他们了吧……？</p>\r\n<br>");
  if (r.truth((await r.call("is_array", r.array([[r.APPEND, 42]]))))) {
    {
      const a12 = r.copy(r.array([[r.APPEND, 42]]));
      for (const [k12, v12] of r.entries(a12)) {
        r.assign(r.slot(s, ["key"]), v12);
        (await r.module("npcinfo", "npcinfo_get_npc_description_all", r.get(s, "key"), r.get(s, "anpcinfo")));
      }
    }
  }
  if (r.truth((await r.call("is_array", r.array([[r.APPEND, 42]]))))) {
    {
      const a13 = r.copy(r.array([[r.APPEND, 42]]));
      for (const [k13, v13] of r.entries(a13)) {
        r.assign(r.slot(s, ["key"]), v13);
        (await r.module("npcinfo", "npcinfo_get_npc_description_all", r.get(s, "key"), r.get(s, "enpcinfo_show")));
      }
    }
  }
  await r.write("<br> ");
  (await r.call("bubblebox_end"));
  await r.write("<p><span class=\"lime b\">幻境的最后防线 简介</span>：</p>\r\n当玩家将场上的NPC全灭时，将有一名特殊的NPC入场挑战玩家。<br>\r\n她与正常游戏几乎没有什么关系，但如果你依然有兴趣，请点击下面的按钮查看她的数据。<br>\r\n<input class=\"bigbutton\" onclick=\"bubblebox_show('final_npc');\" value=\"点击这里查看\" type=\"button\">\r\n<br>");
return 1;
}
