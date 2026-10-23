// Generated from include/modules/extra/misc/npcinfo/npcinfo.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  r.assign(r.slot(s, ["showskill_tmp_name"]), (r.text((r.text((r.text((r.text(r.get(s, "npckind")) + r.text("_"))) + r.text(r.get(s, "npcsubkind")))) + r.text("_"))) + r.text((await r.call("substr", (await r.call("md5", r.get(r.get(s, "nownpc"), "name"))), 0, 6)))));
  await r.write("<table border=\"1\" cellspacing=\"0\" cellpadding=\"0\" valign=\"middle\">\r\n<tr>\r\n<td>\r\n<table border=\"1\" cellspacing=\"0\" cellpadding=\"0\" valign=\"middle\">\r\n<tr>\r\n<td>\r\n<IMG width=140px src=\"");
  r.list([r.slot(s, ["icon1"]), r.slot(s, ["icon2"])], (await r.module("player", "icon_parser", 1, r.get(r.get(s, "nownpc"), "gd"), r.get(r.get(s, "nownpc"), "icon"))));
  await r.write(r.text((r.text("img/") + r.text(r.get(s, "icon1")))));
  await r.write("\" border=\"0\" valign=\"middle\"/>\r\n</td>\r\n<td>\r\n<table border=\"1\" height=100% width=100% cellspacing=\"0\" cellpadding=\"0\">\r\n<tr>\r\n\r\n<td width=100px align=\"center\" class=\"b1\">\r\nNPC类别\r\n</td>\r\n<td width=100px align=\"center\" class=\"b3\">\r");
  await r.write(r.text(r.get(r.get(s, "typeinfo"), r.get(s, "npckind"))));
  await r.write("</td>");
  if (r.truth(((r.get(r.get(s, "nownpc"), "___count") != null)))) {
    await r.write("<td width=100px align=\"center\" class=\"b1\">\r\n数目\r\n</td>\r\n<td width=100px align=\"center\" class=\"b3\">\r");
    await r.write(r.text(r.get(r.get(s, "nownpc"), "___count")));
    await r.write("</td>");
  } else {
    await r.write("<td width=100px align=\"center\" class=\"b1\">\r\n数目\r\n</td>\r\n<td width=100px align=\"center\" class=\"b3\">\r\n1\r\n</td>");
  }
  await r.write("<td width=80px align=\"center\" class=\"b1\">\r\n所处地点\r\n</td>\r\n<td width=120px align=\"center\" class=\"b3\">");
  if (r.truth(r.equal(r.get(r.get(s, "nownpc"), "pls"), 99))) {
    await r.write("随机");
  } else {
    if (r.truth((!r.truth((await r.call("is_numeric", r.get(r.get(s, "nownpc"), "pls"))))))) {
      await r.write("<span class=\"yellow b\">\r");
      await r.write(r.text(r.get(r.get(s, "nownpc"), "pls")));
      await r.write("</span>");
    } else {
      await r.write("<span class=\"yellow b\">\r");
      await r.write(r.text(r.get(r.get(s, "plsinfo"), r.get(r.get(s, "nownpc"), "pls"))));
      await r.write("</span>");
    }
  }
  await r.write("</td>\r\n</tr>\r\n<tr>\r\n<td width=100px align=\"center\" class=\"b1\">\r\nNPC等级\r\n</td>\r\n<td width=100px align=\"center\" class=\"b3\">\r\n<span>\r\nLv. ");
  await r.write(r.text(r.get(r.get(s, "nownpc"), "lvl")));
  await r.write("</span>\r\n</td>\r\n<td width=100px align=\"center\" class=\"b1\">\r\nNPC名称\r\n</td>\t\r\n<td width=100px align=\"center\" class=\"b3\">\r\n<span class=\"lime b\">\r");
  await r.write(r.text(r.get(r.get(s, "nownpc"), "name")));
  await r.write("</span>\r\n</td>\r\n<td width=80px align=\"center\" class=\"b1\">\r\n性别\r\n</td>\r\n<td width=120px align=\"center\" class=\"b3\">");
  if (r.truth(r.equal(r.get(r.get(s, "nownpc"), "gd"), "m"))) {
    await r.write("男");
  } else {
    if (r.truth(r.equal(r.get(r.get(s, "nownpc"), "gd"), "f"))) {
      await r.write("女");
    } else {
      await r.write("随机");
    }
  }
  await r.write("</td>\r\n</tr>\t\t\t\t\t\r\n<tr>\r\n<td width=100px align=\"center\" class=\"b1\">\r\n内定称号\r\n</td>\t\t\t\t\t\r\n<td width=100px align=\"center\" class=\"b3\">");
  if (r.truth(((r.get(r.get(s, "nownpc"), "club") != null)))) {
    await r.write(r.text(r.get(r.get(s, "clubinfo"), r.get(r.get(s, "nownpc"), "club"))));
  } else {
    await r.write("无");
  }
  await r.write("</td>\r\n<td width=100px align=\"center\" class=\"b1\">\r\n基础姿态\r\n</td>\r\n<td width=100px align=\"center\" class=\"b3\">\r");
  await r.write(r.text(r.get(r.get(s, "poseinfo"), r.get(r.get(s, "nownpc"), "pose"))));
  await r.write("</td>\r\n<td width=80px align=\"center\" class=\"b1\">\r\n应战策略\r\n</td>\r\n<td width=120px align=\"center\" class=\"b3\">\r");
  await r.write(r.text(r.get(r.get(s, "tacinfo"), r.get(r.get(s, "nownpc"), "tactic"))));
  await r.write("</td>\r\n</tr>\r\n<tr>\r\n<td width=100px align=\"center\" class=\"b1\">");
  if (r.truth(((r.get(r.get(s, "nownpc"), "___count") != null)))) {
    await r.write("生命上限");
  } else {
    await r.write("生命状况");
  }
  await r.write("</td>\r\n<td width=100px align=\"center\" class=\"b3\">");
  if (r.truth(((r.get(r.get(s, "nownpc"), "___count") != null)))) {
    await r.write(r.text(r.get(r.get(s, "nownpc"), "mhp")));
  } else {
    await r.write("<span class=\"");
    if (r.truth((r.compare(r.get(r.get(s, "nownpc"), "hp"), r.multiply(r.get(r.get(s, "nownpc"), "mhp"), 0.2)) <= 0))) {
      await r.write("red");
    } else {
      if (r.truth((r.compare(r.get(r.get(s, "nownpc"), "hp"), r.multiply(r.get(r.get(s, "nownpc"), "mhp"), 0.5)) <= 0))) {
        await r.write("yellow");
      } else {
        await r.write("cyan");
      }
    }
    await r.write("\">");
    await r.write(r.text(r.get(r.get(s, "nownpc"), "hp")));
    await r.write(" / ");
    await r.write(r.text(r.get(r.get(s, "nownpc"), "mhp")));
    await r.write("</span>");
  }
  await r.write("</td>\r\n<td width=100px align=\"center\" class=\"b1\">\r\n熟练度\r\n</td>\r\n<td width=100px align=\"center\" class=\"b3\">");
  if (r.truth(((r.get(r.get(s, "nownpc"), "___count") != null)))) {
    if (r.truth((await r.call("is_array", r.get(r.get(s, "nownpc"), "skill"))))) {
      await r.write("<span title=\"");
      if (r.truth((await r.call("is_array", r.get(r.get(s, "nownpc"), "skill"))))) {
        {
          const a0 = r.copy(r.get(r.get(s, "nownpc"), "skill"));
          for (const [k0, v0] of r.entries(a0)) {
          r.assign(r.slot(s, ["nskk"]), k0);
            r.assign(r.slot(s, ["nskv"]), v0);
            await r.write(r.text(r.get(r.get(s, "skilltypeinfo"), r.get(s, "nskk"))));
            await r.write("熟:");
            await r.write(r.text(r.get(s, "nskv")));
            await r.write("<br>");
          }
        }
      }
      await r.write("\">不定值</span>");
    } else {
      await r.write("<span>");
      await r.write(r.text(r.get(r.get(s, "nownpc"), "skill")));
      await r.write("</span>");
    }
  } else {
    await r.write(r.text(r.get(r.get(s, "nownpc"), "wp")));
  }
  await r.write("</td>\r\n<td width=80px align=\"center\" class=\"b1\">\r\n怒气值\r\n</td>\r\n<td width=120px align=\"center\" class=\"b3\">\r");
  await r.write(r.text(r.get(r.get(s, "nownpc"), "rage")));
  await r.write("</td>\r\n</tr>\r\n<tr>\r\n<td width=100px align=\"center\" class=\"b1\">\r\n基础攻击\r\n</td>\r\n<td width=100px align=\"center\" class=\"b3\">\r");
  await r.write(r.text(r.get(r.get(s, "nownpc"), "att")));
  await r.write("</td>\r\n<td width=100px align=\"center\" class=\"b1\">\r\n基础防御\r\n</td>\r\n<td width=100px align=\"center\" class=\"b3\">\r");
  await r.write(r.text(r.get(r.get(s, "nownpc"), "def")));
  await r.write("</td>\r\n<td width=80px align=\"center\" class=\"b1\">\r\n持有金钱\r\n</td>\r\n<td width=120px align=\"center\" class=\"b3\">\r\n<span>");
  await r.write(r.text(r.get(r.get(s, "nownpc"), "money")));
  await r.write("</span>元\r\n</td>\r\n</tr>\r\n</table>\r\n</td>\r\n</tr>\r\n</table>\r\n</td>\r\n</tr>\r\n<tr>\r\n<td>\r\n<table border=\"1\" cellspacing=\"0\" cellpadding=\"0\" valign=\"middle\">\r\n<tr>\r\n<td width=140px>\r");
  await r.write(r.text(r.get(r.get(s, "nownpc"), "description")));
  await r.write("</td>\r\n<td ");
  if (r.truth((await r.module("skillbase", "skill_query", 460, r.get(s, "nownpc"))))) {
    await r.write("rowspan=2");
  }
  await r.write(">\r\n<table border=\"1\" cellspacing=\"0\" cellpadding=\"0\" valign=\"middle\">\r\n<tr>\r\n<td width=100px align=\"center\" class=\"b1\">\r\n武器名称\r\n</td>\r\n<td width=505px align=\"center\" class=\"b3\">");
  (await r.module("npcinfo", "npcinfo_gen_item_description", r.get(r.get(s, "nownpc"), "wep"), r.get(r.get(s, "nownpc"), "wepk"), r.get(r.get(s, "nownpc"), "wepe"), r.get(r.get(s, "nownpc"), "weps"), r.get(r.get(s, "nownpc"), "wepsk")));
  await r.write("</td>\r\n</tr>\r\n<tr>\r\n<td width=100px align=\"center\" class=\"b1\">\r\n身体装备\r\n</td>\r\n<td width=505px align=\"center\" class=\"b3\">");
  (await r.module("npcinfo", "npcinfo_gen_item_description", r.get(r.get(s, "nownpc"), "arb"), "", r.get(r.get(s, "nownpc"), "arbe"), r.get(r.get(s, "nownpc"), "arbs"), r.get(r.get(s, "nownpc"), "arbsk")));
  await r.write("</td>\r\n</tr>\r\n<tr>\r\n<td width=100px align=\"center\" class=\"b1\">\r\n头部装备\r\n</td>\r\n<td width=505px align=\"center\" class=\"b3\">");
  (await r.module("npcinfo", "npcinfo_gen_item_description", r.get(r.get(s, "nownpc"), "arh"), "", r.get(r.get(s, "nownpc"), "arhe"), r.get(r.get(s, "nownpc"), "arhs"), r.get(r.get(s, "nownpc"), "arhsk")));
  await r.write("</td>\r\n</tr>\r\n<tr>\r\n<td width=100px align=\"center\" class=\"b1\">\r\n手臂装备\r\n</td>\r\n<td width=505px align=\"center\" class=\"b3\">");
  (await r.module("npcinfo", "npcinfo_gen_item_description", r.get(r.get(s, "nownpc"), "ara"), "", r.get(r.get(s, "nownpc"), "arae"), r.get(r.get(s, "nownpc"), "aras"), r.get(r.get(s, "nownpc"), "arask")));
  await r.write("</td>\r\n</tr>\r\n<tr>\r\n<td width=100px align=\"center\" class=\"b1\">\r\n腿部装备\r\n</td>\r\n<td width=505px align=\"center\" class=\"b3\">");
  (await r.module("npcinfo", "npcinfo_gen_item_description", r.get(r.get(s, "nownpc"), "arf"), "", r.get(r.get(s, "nownpc"), "arfe"), r.get(r.get(s, "nownpc"), "arfs"), r.get(r.get(s, "nownpc"), "arfsk")));
  await r.write("</td>\r\n</tr>\r\n<tr>\r\n<td width=100px align=\"center\" class=\"b1\">\r\n饰品 \r\n</td>\r\n<td width=505px align=\"center\" class=\"b3\">");
  (await r.module("npcinfo", "npcinfo_gen_item_description", r.get(r.get(s, "nownpc"), "art"), r.get(r.get(s, "nownpc"), "artk"), "", "", r.get(r.get(s, "nownpc"), "artsk")));
  await r.write("</td>\r\n</tr>");
  if (r.truth((await r.call("is_array", r.array([[r.APPEND, 1], [r.APPEND, 2], [r.APPEND, 3], [r.APPEND, 4], [r.APPEND, 5], [r.APPEND, 6]]))))) {
    {
      const a1 = r.copy(r.array([[r.APPEND, 1], [r.APPEND, 2], [r.APPEND, 3], [r.APPEND, 4], [r.APPEND, 5], [r.APPEND, 6]]));
      for (const [k1, v1] of r.entries(a1)) {
        r.assign(r.slot(s, ["id"]), v1);
        if (r.truth((!r.equal(r.get(r.get(s, "nownpc"), (r.text("itm") + r.text(r.get(s, "id")))), "")))) {
          await r.write("<tr>\r\n<td width=100px align=\"center\" class=\"b1\">\r\n掉落物品\r\n</td>\r\n<td width=505px align=\"center\" class=\"b3\">");
          (await r.module("npcinfo", "npcinfo_gen_item_description", r.get(r.get(s, "nownpc"), (r.text("itm") + r.text(r.get(s, "id")))), r.get(r.get(s, "nownpc"), (r.text("itmk") + r.text(r.get(s, "id")))), r.get(r.get(s, "nownpc"), (r.text("itme") + r.text(r.get(s, "id")))), r.get(r.get(s, "nownpc"), (r.text("itms") + r.text(r.get(s, "id")))), r.get(r.get(s, "nownpc"), (r.text("itmsk") + r.text(r.get(s, "id"))))));
          await r.write("</td>\r\n</tr>");
        }
      }
    }
  }
  await r.write("</table>\r\n</td>\r\n</tr>");
  if (r.truth((await r.module("skillbase", "skill_query", 460, r.get(s, "nownpc"))))) {
    await r.write("<tr>\r\n<td align=\"center\">\r\n<input class=\"bigbutton\" onclick=\"bubblebox_show('");
    await r.write(r.text((r.text("help_npcskill_") + r.text(r.get(s, "showskill_tmp_name")))));
    await r.write("', 1);\" value=\"显示该NPC技能\" type=\"button\">\r\n</td>\r\n</tr>");
  }
  await r.write("</table>\r\n</td>\r\n</tr>\r\n</table> ");
  if (r.truth((await r.module("skillbase", "skill_query", 460, r.get(s, "nownpc"))))) {
    (await r.call("bubblebox_start", (r.text((r.text("id:help_npcskill_") + r.text(r.get(s, "showskill_tmp_name")))) + r.text(";height:353;width:518;cancellable:1;z-index-base:20;"))));
    await r.write("<p style=\"margin-left:0px; margin-top:0px; margin-right:0px; margin-bottom:0px;\">\r\n<br>\r\n<!--于是经过各种边框，最后工作区的大小是height:314px width:509px--> \r\n以下是<span class=\"yellow b\">");
    await r.write(r.text(r.get(r.get(s, "typeinfo"), r.get(s, "npckind"))));
    await r.write(" ");
    await r.write(r.text(r.get(r.get(s, "nownpc"), "name")));
    await r.write("</span>的称号技能以外的技能列表。请注意描述文字中的“<span class=\"yellow b\">你</span>”指代的是这个NPC。<br><br>\r\n</p>\r\n<TABLE border=\"0\" cellSpacing=0 cellPadding=0 width=509px>\r\n<tr>\r\n<td width=\"0\"></td>\r\n<TD class=b1 width=\"40\"><span>名称</span></TD>\r\n<TD class=b1><span></span></TD>\r\n</tr>");
    (await r.module("clubbase", "get_npcskillpage", r.get(s, "nownpc")));
    await r.write("</table>\r\n<br>\r\n<p>\r\n\r\n<input class=\"cmdbutton\" onclick=\"bubblebox_hide('");
    await r.write(r.text((r.text("help_npcskill_") + r.text(r.get(s, "showskill_tmp_name")))));
    await r.write("');\" value=\"关闭技能列表\" type=\"button\">\r\n\r\n&nbsp;&nbsp;&nbsp; 提示:点击技能界面外任意位置也可以关闭技能列表<br>\r\n</p>");
    (await r.call("bubblebox_end"));
  }
return 1;
}
