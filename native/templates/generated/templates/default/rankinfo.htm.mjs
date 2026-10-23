// Generated from templates/default/rankinfo.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  await r.write("<TABLE border=\"0\" cellspacing=\"0\" cellpadding=\"0\">\r\n<TR height=\"20\">\r\n<TD class=\"b1\"><span>排名</span></TD>\r\n<TD class=\"b1\"><span>UID</span></TD>\r\n<TD class=\"b1\"><span>姓名</span></TD>\r\n<TD class=\"b1\"><span>性别</span></TD>\r\n<TD class=\"b1\"><span>头像</span></TD>\r\n<TD class=\"b1\" style=\"maxwidth:120\"><span>口头禅</span></TD>\r\n<TD class=\"b1\"><span>积分</span></TD>\r\n<TD class=\"b1\"><span>游戏场数</span></TD>\r\n<TD class=\"b1\"><span>获胜场数</span></TD>\r\n<TD class=\"b1\"><span>胜率</span></TD>\r\n<TD class=\"b1\"><span>荣誉等级</span></TD>");
  if (r.truth((await r.call("defined", "MOD_ELORATING")))) {
    await r.write("<TD class=\"b1\"><span>天梯积分</span></TD>");
  }
  await r.write("<!--\r\n<TD class=\"b1\"><span>最后游戏</span></TD>\r\n-->\r\n</TR>");
  if (r.truth((await r.call("is_array", r.get(s, "rankdata"))))) {
    {
      const a0 = r.copy(r.get(s, "rankdata"));
      for (const [k0, v0] of r.entries(a0)) {
        r.assign(r.slot(s, ["urdata"]), v0);
        await r.write("<TR height=\"20\">\r\n<TD class=\"b2\"><span>");
        if (r.truth(r.equal(r.get(r.get(s, "urdata"), "number"), 1))) {
          await r.write("<a title=\"触手！\"><span class=\"red b\">榜首</span></a>");
        } else {
          if (r.truth((r.compare(r.get(r.get(s, "urdata"), "number"), 10) <= 0))) {
            await r.write("<span class=\"yellow b\">");
            await r.write(r.text(r.get(r.get(s, "urdata"), "number")));
            await r.write("</span>");
          } else {
            await r.write(r.text(r.get(r.get(s, "urdata"), "number")));
          }
        }
        await r.write("</span></TD>\r\n<TD class=\"b3\"><span>");
        await r.write(r.text(r.get(r.get(s, "urdata"), "uid")));
        await r.write("</span></TD>");
        r.assign(r.slot(s, ["urdata", "urlname"]), (await r.call("htmlentities", (await r.call("urlencode", r.get(r.get(s, "urdata"), "username"))))));
        await r.write("<TD class=\"b3\"><a style=\"cursor:pointer;\" href=\"user_profile.php?playerID=");
        await r.write(r.text(r.get(r.get(s, "urdata"), "urlname")));
        await r.write("\"><span>");
        await r.write(r.text(r.get(r.get(s, "urdata"), "username")));
        await r.write("</span></a></TD>\r\n<TD class=\"b3\"><span>");
        if (r.truth(r.get(r.get(s, "urdata"), "gender"))) {
          await r.write(r.text(r.get(r.get(s, "sexinfo"), r.get(r.get(s, "urdata"), "gender"))));
        } else {
          await r.write(r.text(r.get(r.get(s, "sexinfo"), "0")));
        }
        await r.write("</span></TD>\r\n<TD class=\"b3\"><span><IMG src=\"img/");
        await r.write(r.text(r.get(r.get(s, "urdata"), "img")));
        await r.write("\" width=\"70\" height=\"40\" border=\"0\" align=\"absmiddle\"></span></TD>\r\n<TD class=\"b3\"><span>");
        await r.write(r.text(r.get(r.get(s, "urdata"), "motto")));
        await r.write("</span></TD>\r\n<TD class=\"b3\"><span><span class=\"yellow b\">");
        await r.write(r.text(r.get(r.get(s, "urdata"), "credits")));
        await r.write("</span></span></TD>\r\n<TD class=\"b3\"><span>");
        await r.write(r.text(r.get(r.get(s, "urdata"), "validgames")));
        await r.write("</span></TD>\r\n<TD class=\"b3\"><span>");
        await r.write(r.text(r.get(r.get(s, "urdata"), "wingames")));
        await r.write("</span></TD>\r\n<TD class=\"b3\"><span>");
        await r.write(r.text(r.get(r.get(s, "urdata"), "winrate")));
        await r.write("</span></TD>\r\n<TD class=\"b3\"><span>");
        await r.write(r.text(r.get(r.get(s, "urdata"), "totalcredits")));
        await r.write("</span></TD>");
        if (r.truth((await r.call("defined", "MOD_ELORATING")))) {
          await r.write("<TD class=\"b3\">");
          if (r.truth(r.equal(r.get(r.get(s, "urdata"), "elo_history"), ""))) {
            await r.write("1500");
          } else {
            await r.write("<span style=\"color:");
            await r.write(r.text((await r.module("elorating", "elorating_get_color", r.get(r.get(s, "urdata"), "elo_rating")))));
            await r.write("\"><span style=\"font-weight:bold;\">");
            await r.write(r.text(r.get(r.get(s, "urdata"), "elo_rating")));
            await r.write("</span></span>");
          }
          await r.write("</td></TD>");
        }
        await r.write("<!--\r\n<TD class=\"b3\"><span>");
        await r.write(r.text(r.get(r.get(s, "urdata"), "lastgame")));
        await r.write("</span></TD>\r\n-->\r\n</TR>");
      }
    }
  }
  await r.write("</TABLE>\r\n");
return 1;
}
