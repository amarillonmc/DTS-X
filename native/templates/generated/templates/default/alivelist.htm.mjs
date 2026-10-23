// Generated from templates/default/alivelist.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  await r.write("<TABLE border=\"1\">\r\n<tr align=\"center\" class=\"b1\">\r\n<td class=\"b1\"><span>名字&编号</span></td>\r\n<td width=\"140\" class=\"b1\"><span>头像</span></td>");
  if (r.truth((await r.call("defined", "MOD_APM")))) {
    await r.write("<td class=\"b1\"><span>APM</span></td>");
  }
  if (r.truth((r.truth((await r.call("defined", "MOD_CARDBASE"))) && r.truth((!r.truth((await r.call("in_array", r.get(s, "gametype"), r.array([[r.APPEND, 0], [r.APPEND, 1]]))))))))) {
    await r.write("<td class=\"b1\"><span>所用卡片</span></td>");
  }
  await r.write("<td class=\"b1\"><span>等级</span></td>\r\n<td class=\"b1\" ");
  if (r.truth(r.equal(r.get(s, "gametype"), 2))) {
    await r.write("title=\"胜利点数最高的玩家将获得游戏胜利\"");
  }
  await r.write("><span>");
  if (r.truth(r.equal(r.get(s, "gametype"), 1))) {
    await r.write("除错层数");
  } else {
    if (r.truth(r.equal(r.get(s, "gametype"), 2))) {
      await r.write("胜利点数");
    } else {
      await r.write("击杀玩家数");
    }
  }
  await r.write("</span></td>");
  if (r.truth(r.equal(r.get(s, "gametype"), 2))) {
    await r.write("<td class=\"b1\" title=\"击杀玩家将获得相当于其15%赏金的胜利点数\"><span>赏金</span></td>");
  }
  if (r.truth((!r.equal(r.get(s, "gametype"), 1)))) {
    await r.write("<td class=\"b1\"><span>击杀NPC数</span></td>");
  }
  if (r.truth((r.compare(r.get(s, "gamestate"), 40) < 0))) {
    await r.write("<td class=\"b1\"><span>队伍名</span></td>");
  }
  await r.write("<td width=\"300\" class=\"b1\"><span>口头禅</span></td>\r\n</tr>");
  if (r.truth((await r.call("is_array", r.get(s, "alivedata"))))) {
    {
      const a0 = r.copy(r.get(s, "alivedata"));
      for (const [k0, v0] of r.entries(a0)) {
        r.assign(r.slot(s, ["alive"]), v0);
        if (r.truth((!r.truth((await r.module("player", "check_alive_player_displayable", r.get(s, "alive"))))))) {
          continue;
        }
        r.assign(r.slot(s, ["alive", "urlname"]), (await r.call("htmlentities", (await r.call("urlencode", r.get(r.get(s, "alive"), "name"))))));
        r.list([r.slot(s, ["alive", "vapm"]), r.slot(s, ["alive", "aapm"])], (await r.module("apm", "calc_apm", r.get(s, "alive"))));
        r.assign(r.slot(s, ["showpack"]), 1);
        await r.write("<tr class=\"b3\">\r\n<td align=\"center\" class=\"b3\"><a style=\"cursor:pointer;\" href=\"user_profile.php?playerID=");
        await r.write(r.text(r.get(r.get(s, "alive"), "urlname")));
        await r.write("\"><span>");
        await r.write(r.text(r.get(r.get(s, "alive"), "dispname")));
        await r.write("<br>");
        await r.write(r.text(r.get(r.get(s, "alive"), "sexnsno")));
        await r.write("</span></a></td>\r\n<td align=\"center\" class=\"b3\"><span><IMG src=\"img/");
        await r.write(r.text(r.get(r.get(s, "alive"), "iconImg")));
        await r.write("\" width=\"140\" height=\"80\" border=\"0\" align=\"absmiddle\"></span></td>");
        if (r.truth((await r.call("defined", "MOD_APM")))) {
          await r.write("<td class=\"b3\"><span>");
          await r.write(r.text(r.get(r.get(s, "alive"), "vapm")));
          await r.write("</span></td>");
        }
        if (r.truth((r.truth((await r.call("defined", "MOD_CARDBASE"))) && r.truth((!r.truth((await r.call("in_array", r.get(s, "gametype"), r.array([[r.APPEND, 0], [r.APPEND, 1]]))))))))) {
          r.assign(r.slot(s, ["nowcard"]), r.get(r.get(s, "alive"), "nowcardinfo"));
          r.assign(r.slot(s, ["cardframe_id"]), (r.text("cardframe_show_") + r.text(r.get(r.get(s, "alive"), "pid"))));
          await r.write("<td class=\"b3\">\r\n<span class=\"");
          await r.write(r.text(r.get(r.get(s, "card_rarecolor"), r.get(r.get(s, "alive"), "nowcardrare"))));
          await r.write("\" ");
          if (r.truth((!r.truth((!r.truth(r.get(s, "nowcard"))))))) {
            await r.write("onmouseenter=\"$('");
            await r.write(r.text(r.get(s, "cardframe_id")));
            await r.write("').style.display='block';\" onmouseleave=\"$('");
            await r.write(r.text(r.get(s, "cardframe_id")));
            await r.write("').style.display='none';\" ");
          }
          await r.write(">\r");
          await r.write(r.text(r.get(r.get(s, "alive"), "cardname")));
          await r.write("</span>");
          if (r.truth((!r.truth((!r.truth(r.get(s, "nowcard"))))))) {
            r.assign(r.slot(s, ["nowcard", "blink"]), r.get(r.get(s, "alive"), "nowcardblink"));
            await r.write("<div style=\"position:relative;\">\r\n<div id=\"");
            await r.write(r.text(r.get(s, "cardframe_id")));
            await r.write("\" class=\"cardframe_show\" style=\"display:none;position:absolute;z-index:10;left:80px;top:-50px;\">");
            (await r.include(r.template("MOD_CARDBASE_CARD_FRAME"), s));
            await r.write("</div>\r\n</div>");
          }
          await r.write("</td>");
        }
        await r.write("<td class=\"b3\"><span>");
        await r.write(r.text(r.get(r.get(s, "alive"), "lvl")));
        await r.write("</span></td>\r\n<td class=\"b3\" ");
        if (r.truth(r.equal(r.get(s, "gametype"), 2))) {
          await r.write("title=\"胜利点数最高的玩家将获得游戏胜利\"");
        }
        await r.write("><span ");
        if (r.truth(r.equal(r.get(s, "gametype"), 2))) {
          await r.write("class=\"orange\"");
        }
        await r.write(">");
        await r.write(r.text(r.get(r.get(s, "alive"), "killnum")));
        await r.write("</span></td>");
        if (r.truth(r.equal(r.get(s, "gametype"), 2))) {
          await r.write("<td class=\"b3\" title=\"击杀玩家将获得相当于其15%赏金的胜利点数\"><span>");
          await r.write(r.text(r.get(r.get(s, "alive"), "bounty")));
          await r.write("</span></td>");
        }
        if (r.truth((!r.equal(r.get(s, "gametype"), 1)))) {
          await r.write("<td class=\"b3\"><span>");
          await r.write(r.text(r.get(r.get(s, "alive"), "npckillnum")));
          await r.write("</span></td>");
        }
        if (r.truth((r.compare(r.get(s, "gamestate"), 40) < 0))) {
          await r.write("<td class=\"b3\"><span>");
          if (r.truth(r.get(r.get(s, "alive"), "teamID"))) {
            await r.write(r.text(r.get(r.get(s, "alive"), "teamID")));
          } else {
            await r.write("无");
          }
          await r.write("</span></td>");
        }
        await r.write("<td class=\"b3\"><span>");
        await r.write(r.text(r.get(r.get(s, "alive"), "motto")));
        await r.write("</span></td>\r\n</tr>");
      }
    }
  }
  await r.write("</table><BR>\r\n【生存者数：");
  await r.write(r.text((await r.module("player", "get_alivenum_for_display"))));
  await r.write("人  死亡数：");
  await r.write(r.text(r.get(s, "deathnum")));
  await r.write("人】<br>\r\n<div style=\"height:100px;\"></div>");
return 1;
}
