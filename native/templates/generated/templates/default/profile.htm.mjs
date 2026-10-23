// Generated from templates/default/profile.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  await r.write("<div style=\"position:relative;\">\r\n<div id=\"profile_container\" style=\"width:720px;margin-bottom: 10px;position:relative;\">\r\n<table border=\"0\" id=\"profile\" width=\"720\" cellspacing=\"0\" cellpadding=\"0\" valign=\"middle\" >\r\n<tr>\r\n<td width=\"73\"></td><td width=\"82\"></td><td width=\"72\"></td><td width=\"123\"></td><td width=\"61\"></td><td width=\"82\"></td><td width=\"221\"></td>\r\n</tr>\r\n<tr>\r\n<td colspan=\"3\" class=\"b1\">");
  if (r.truth((await r.call("defined", "MOD_CARDBASE")))) {
    (await r.include(r.template("MOD_CARDBASE_PROFILE_CARDNAME"), s));
  } else {
    await r.write("<span id=\"name\">\r");
    await r.write(r.text(r.get(s, "name")));
    await r.write("</span>");
  }
  await r.write("</td>\r\n<td colspan=\"1\" class=\"b1\"><span>");
  await r.write(r.text(r.get(r.get(s, "sexinfo"), r.get(s, "gd"))));
  await r.write(r.text(r.get(s, "sNo")));
  await r.write("号</span></td>");
  if (r.truth((await r.call("defined", "MOD_WEATHER")))) {
    (await r.include(r.template("MOD_WEATHER_PROFILE_WEATHER"), s));
  } else {
    await r.write("<td colspan=\"2\" class=\"b1\"></td>");
  }
  await r.write("<td colspan=\"1\" class=\"b1\">");
  if (r.truth((await r.module("gameflow_duel", "is_gamestate_duel", 1)))) {
    await r.write("<span class=\"red b\">死斗</span>");
  } else {
    if (r.truth((await r.module("gameflow_combo", "is_gamestate_combo", 1)))) {
      await r.write("<span class=\"yellow b\">连斗</span>");
    }
  }
  await r.write(" ");
  (await r.include(r.template("MOD_MAP_PROFILE_AREAINFO"), s));
  await r.write("</td>\r\n</tr>\r\n<tr>\r\n<td colspan=\"4\" valign=\"top\" height=\"200\">\r\n<table border=\"0\" height=\"200\" cellspacing=\"0\" cellpadding=\"0\" valign=\"middle\" >\r\n<tr>\r\n<td colspan=\"2\">\r\n<table border=\"0\" width=156 height=160 cellspacing=\"0\" cellpadding=\"0\" valign=\"middle\" >\r\n<tr>\r\n<td width=\"73\"></td><td width=\"82\"></td>\r\n</tr>\r\n<tr>\r\n<td colspan=\"2\" height=\"80\" class=\"b3\"><span><img src=\"img/");
  await r.write(r.text(r.get(s, "iconImg")));
  await r.write("\" border=\"0\" style=\"width:140;height:80;");
  if (r.truth(r.equal(r.get(s, "hp"), 0))) {
    await r.write("filter: grayscale(100%)");
  }
  await r.write("\" /></span></td>\r\n</tr>\r\n<tr title=\"攻击力 ");
  await r.write(r.text(r.get(r.get(s, "uip"), "att_words")));
  await r.write("\">\r\n<td class=\"b2\" height=\"20\"><span>攻击力</span></td>\r\n<td class=\"b3\"><span>");
  await r.write(r.text(r.get(r.get(s, "uip"), "total_att")));
  await r.write("</span></td>\r\n</tr>\r\n<tr title=\"防御力 ");
  await r.write(r.text(r.get(r.get(s, "uip"), "def_words")));
  await r.write("\">\r\n<td class=\"b2\" height=\"20\"><span>防御力</span></td>\r\n<td class=\"b3\"><span>");
  await r.write(r.text(r.get(r.get(s, "uip"), "total_def")));
  await r.write("</span></td>\r\n</tr>\r\n<tr>");
  if (r.truth((await r.call("defined", "MOD_POSE")))) {
    (await r.include(r.template("MOD_POSE_POSE_PROFILE_CMD"), s));
  } else {
    await r.write("<td class=\"b2\" height=\"20\"></td><td class=\"b3\"></td>");
  }
  await r.write("</tr>\r\n<tr>");
  if (r.truth((await r.call("defined", "MOD_TACTIC")))) {
    (await r.include(r.template("MOD_TACTIC_TACTIC_PROFILE_CMD"), s));
  } else {
    await r.write("<td class=\"b2\" height=\"20\"></td><td class=\"b3\"></td>");
  }
  await r.write("</tr>\r\n</table>\r\n</td>\r\n<td>\r\n<table border=\"0\" width=\"196\" height=160 cellspacing=\"0\" cellpadding=\"0\"  valign=\"middle\" >\r\n<tr>\r\n<td width=\"72\"></td><td width=\"123\">\r\n</tr>\r\n<tr>\r\n<td class=\"b2\" height=\"20\"><span>等级</span></td>\r\n<td class=\"b3\"><span>Lv. ");
  await r.write(r.text(r.get(s, "lvl")));
  await r.write("</span></td>\r\n</tr>\r\n<tr>\r\n<td class=\"b2\" height=\"20\"><span>经验值</span></td>\r\n<td class=\"b3\"><span>");
  await r.write(r.text(r.get(s, "exp")));
  await r.write(" / ");
  await r.write(r.text(r.get(s, "upexp")));
  await r.write("</span></td>\r\n</tr>\r\n<tr>\r\n<td class=\"b2\" height=\"20\"><span>队伍</span></td>\r\n<td class=\"b3\"><span>");
  if (r.truth((r.truth(r.get(s, "teamID")) && r.truth((r.truth((r.compare(r.get(s, "gamestate"), 40) < 0)) || r.truth((await r.call("in_array", r.get(s, "gametype"), r.get(s, "teamwin_mode"))))))))) {
    await r.write(r.text(r.get(s, "teamID")));
  } else {
    await r.write(" 无 ");
  }
  await r.write("</span></td>\r\n</tr>");
  if (r.truth((await r.call("defined", "MOD_CLUBBASE")))) {
    (await r.include(r.template("MOD_CLUBBASE_CLUB_PROFILE"), s));
  } else {
    await r.write("<td class=\"b2\" height=\"20\"></td><td class=\"b3\" height=\"20\"></td>");
  }
  await r.write("</tr>\r\n<tr>\r\n<td class=\"b2\" height=\"20\"><span>金钱</span></td>\r\n<td class=\"b3\"><span>");
  await r.write(r.text(r.get(s, "money")));
  await r.write(" 元</span></td>\r\n</tr>\r\n<tr>\r\n<td class=\"b2\" height=\"20\"><span>体力</span></td>\r\n<td id=\"profile_sp_grid\" class=\"b3\"><span><span class=\"");
  await r.write(r.text(r.get(s, "spcolor")));
  await r.write("\">");
  await r.write(r.text(r.get(s, "sp")));
  await r.write(" / ");
  await r.write(r.text(r.get(s, "msp")));
  await r.write("</span></span></td>\r\n</tr>\r\n<tr>\r\n<td class=\"b2\" height=\"20\"><span>生命</span></td>\r\n<td id=\"profile_hp_grid\" class=\"b3\"><span><span class=\"");
  await r.write(r.text(r.get(s, "hpcolor")));
  await r.write("\">");
  await r.write(r.text(r.get(s, "hp")));
  await r.write(" / ");
  await r.write(r.text(r.get(s, "mhp")));
  await r.write("</span></span></td>\r\n</tr>\r\n<tr>\r\n<td class=\"b2\" height=\"20\"><span>歌魂</span></td>\r\n<td class=\"b3\"><span class=\"");
  if (r.truth((r.compare(r.get(s, "ss"), r.multiply(r.get(s, "mss"), 0.2)) <= 0))) {
    await r.write("grey b");
  } else {
    if (r.truth((r.compare(r.get(s, "ss"), r.multiply(r.get(s, "mss"), 0.5)) <= 0))) {
      await r.write("yellow b");
    } else {
      await r.write("cyan b");
    }
  }
  await r.write("\">");
  await r.write(r.text(r.get(s, "ss")));
  await r.write(" / ");
  await r.write(r.text(r.get(s, "mss")));
  await r.write("</span></td>\r\n</tr>\r\n</table>\r\n</td>\r\n</tr>\r\n<tr>\r\n<td class=\"b3\" style=\"width:73px;height:40px;text-align:center;vertical-align:middle\">");
  if (r.truth((r.truth((r.truth((await r.call("defined", "MOD_INSTANCE10"))) && r.truth(r.equal(r.get(s, "gametype"), 20)))) && r.truth(r.get(s, "hp"))))) {
    (await r.include(r.template("MOD_INSTANCE10_SHOWROGUESTAGE"), s));
  } else {
    if (r.truth((r.truth((await r.module("skillbase", "skill_query", 981))) && r.truth(r.get(s, "hp"))))) {
      (await r.include(r.template("MOD_SKILL981_SHOWTRAINSTAGE"), s));
    } else {
      if (r.truth((r.truth((await r.call("defined", "MOD_INSTANCE_QUIT_BUTTON"))) && r.truth((await r.module("instance_quit_button", "check_instance_quit_available")))))) {
        (await r.include(r.template("MOD_INSTANCE_QUIT_BUTTON_INSTANCE_QUIT_BUTTON"), s));
      } else {
        if (r.truth((r.truth((r.truth((!r.truth(r.get(s, "hp")))) && r.truth((await r.call("defined", "MOD_INSTANCE_CLOSE_BUTTON"))))) && r.truth((await r.module("instance_close_button", "check_instance_close_available")))))) {
          (await r.include(r.template("MOD_INSTANCE_CLOSE_BUTTON_INSTANCE_CLOSE_BUTTON"), s));
        }
      }
    }
  }
  await r.write("</td>\r\n<td class=\"b3\" colspan=\"2\" style=\"min-height:40px;max-width:267px;text-align:center;vertical-align:middle\">");
  if (r.truth((await r.call("defined", "MOD_BUFFICONS")))) {
    (await r.include(r.template("MOD_BUFFICONS_PROFILE"), s));
  }
  await r.write("</td>\r\n</tr>\r\n</table>\r\n</td>\r\n\r\n<td colspan=\"2\" valign=\"top\" height=192>\r\n<table border=\"0\" width=\"144\" height=192 cellspacing=\"0\" cellpadding=\"0\"  valign=\"middle\">\r\n<tr>\r\n<td width=\"61\"></td><td width=\"82\"></td>\r\n</tr>");
  if (r.truth((await r.call("defined", "MOD_WEAPON")))) {
    (await r.include(r.template("MOD_WEAPON_PROFILE_WEPSKILL"), s));
  }
  await r.write("<tr>\r\n<td class=\"b2\" height=\"20\"><span>怒气</span></td>\r\n<td class=\"b3\"><span>");
  if (r.truth((r.compare(r.get(s, "rage"), 30) >= 0))) {
    await r.write("<span class=\"yellow b\">");
    await r.write(r.text(r.get(s, "rage")));
    await r.write("</span>");
  } else {
    await r.write(r.text(r.get(s, "rage")));
  }
  await r.write("</span></td>\r\n</tr>\r\n<tr>\r\n<td class=\"b2\" height=\"20\"><span>技能点</span></td>\r\n<td class=\"b3\">");
  if (r.truth((r.compare(r.get(s, "skillpoint"), 0) > 0))) {
    await r.write("<span class=\"lime b\">");
    await r.write(r.text(r.get(s, "skillpoint")));
  } else {
    await r.write(r.text(r.get(s, "skillpoint")));
  }
  await r.write("</span></td>\r\n</tr>\r\n<tr>");
  if (r.truth((await r.call("defined", "MOD_APM")))) {
    (await r.include(r.template("MOD_APM_PROFILE"), s));
  } else {
    await r.write("<td class=\"b2\" height=\"20\"></td>\r\n<td class=\"b3\" height=\"20\"></td>");
  }
  await r.write("</tr>\r\n<tr>\r\n<!--摸东西模式下杀人数计数改为破解层数显示-->");
  if (r.truth((r.truth((await r.call("defined", "MOD_GTYPE1"))) && r.truth(r.equal(r.get(s, "gametype"), 1))))) {
    (await r.include(r.template("MOD_GTYPE1_SHOWHACKLEVEL"), s));
  } else {
    if (r.truth((r.truth((await r.call("defined", "MOD_GTYPE2"))) && r.truth(r.equal(r.get(s, "gametype"), 2))))) {
      (await r.include(r.template("MOD_SKILL475_SHOWWPT"), s));
    } else {
      await r.write("<td class=\"b2\" height=\"20\"><span>击杀数</span></td>\r\n<td class=\"b3\">\r\n<span title=\"击杀玩家数：");
      await r.write(r.text(r.get(s, "killnum")));
      await r.write(" 击杀NPC数：");
      await r.write(r.text(r.get(s, "npckillnum")));
      await r.write("\">");
      await r.write(r.text(r.add(r.get(s, "killnum"), r.get(s, "npckillnum"))));
      await r.write("</span>\r\n</td>");
    }
  }
  await r.write("</tr>\r\n</table>\r\n</td>\r\n<td class=\"b3\" style=\"height:192px;text-align:center;vertical-align:middle\">\r\n<table border=\"0\" cellspacing=\"0\" cellpadding=\"0\">\r\n<tr>\r\n<td colspan=\"4\">\r\n<div style=\"margin-left:4px; margin-right:5px;");
  if (r.truth((r.truth((await r.call("defined", "MOD_SKILL718"))) && r.truth((await r.module("skillbase", "skill_query", 718)))))) {
    await r.write("transform: rotate(180deg);");
  }
  await r.write("\">\r\n<table border=\"0\" width=215px height=160px cellspacing=\"0\" cellpadding=\"0\">\r\n\r\n<tr>\r\n<td height=160px width=160px background=\"img/state1.gif\" style=\"position:relative;background-repeat:no-repeat;background-position:right top;\">\r\n<div style=\"border:0; margin:0; cellspacing:0; cellpadding:0; position:absolute;z-index:3;top:0;left:0;\">");
  if (r.truth((await r.call("defined", "MOD_WOUND")))) {
    (await r.include(r.template("MOD_WOUND_WOUND_PICTURE"), s));
  }
  if (r.truth((r.compare(r.get(s, "hp"), 0) <= 0))) {
    await r.write("<img src=\"img/dead.gif\" style=\"position:absolute;top:120;left:6;width:94;height:40\">");
  } else {
    if (r.truth((r.compare(r.get(s, "hp"), r.multiply(r.get(s, "mhp"), 0.2)) <= 0))) {
      await r.write("<img src=\"img/danger.gif\" style=\"position:absolute;top:120;left:5;width:95;height:37\">");
    } else {
      if (r.truth((r.truth((r.compare(r.get(s, "hp"), r.multiply(r.get(s, "mhp"), 0.5)) <= 0)) || r.truth((!r.equal(r.get(s, "inf"), "")))))) {
        await r.write("<img src=\"img/caution.gif\" style=\"position:absolute;top:120;left:5;width:95;height:36\">");
      } else {
        await r.write("<img src=\"img/fine.gif\" style=\"position:absolute;top:120;left:12;width:81;height:38\">");
      }
    }
  }
  await r.write("</div><div style=\"border:0; margin:0; cellspacing:0; cellpadding:0; position:absolute;top:0px;left:105px;z-index:2;\">\r");
  await r.write(r.text(r.get(s, "newspimg")));
  await r.write("</div>");
  if (r.truth((r.compare(r.get(s, "sp"), 0) > 0))) {
    await r.write("<div style=\"border:0; margin:0; cellspacing:0; cellpadding:0; position:absolute;top:0px;left:105px;z-index:1;\">\r");
    await r.write(r.text(r.get(s, "splt")));
    await r.write("</div>");
  }
  await r.write("</td>\r\n<td height=160px width=55px background=\"img/state2.gif\" style=\"position:relative;background-repeat:no-repeat;background-position:left top;\">\r\n<div style=\"border:0; margin:0; cellspacing:0; cellpadding:0; position:absolute;top:0px;right:55px;z-index:2;\">\r");
  await r.write(r.text(r.get(s, "newhpimg")));
  await r.write("</div>");
  if (r.truth((r.compare(r.get(s, "hp"), 0) > 0))) {
    await r.write("<div style=\"border:0; margin:0; cellspacing:0; cellpadding:0; position:absolute;top:0px;right:55px;z-index:1;\">\r");
    await r.write(r.text(r.get(s, "hplt")));
    await r.write("</div>");
  }
  await r.write("</td>\r\n</tr>\r\n</table>\r\n</div>\r\n</td>\r\n</tr>\r\n<tr>");
  if (r.truth((await r.call("defined", "MOD_WOUND")))) {
    (await r.include(r.template("MOD_WOUND_WOUND_PROFILE"), s));
  } else {
    await r.write("<td class=\"b2\" width=\"110\" height=\"20\" colspan=\"2\"></td>\r\n<td width=\"114\" height=\"20\" colspan=\"2\"></td>");
  }
  await r.write("</tr>\r\n<tr>");
  if (r.truth((r.truth((r.truth((r.truth((r.truth((await r.call("defined", "MOD_SKILL538"))) && r.truth((await r.call("defined", "MOD_GTYPE1"))))) && r.truth((await r.call("defined", "MOD_SKILLBASE"))))) && r.truth((!r.equal(r.get(s, "gametype"), 1))))) && r.truth((await r.module("skillbase", "skill_query", 538)))))) {
    (await r.include(r.template("MOD_GTYPE1_SHOWHACKLEVEL"), s));
  } else {
    await r.write("<td height=\"20\"></td>\r\n<td></td>");
  }
  await r.write("<td height=\"20\"></td>\r\n<td height=\"20\"></td>\r\n</tr>\r\n</table>\r\n</td>\r\n</tr>");
  if (r.truth((await r.call("defined", "MOD_ADVTEAM")))) {
    (await r.module("advteam", "get_advteam_html"));
  }
  await r.write("</table>\r\n</div><div id=\"packs_container\" style=\"width:720px;position:relative;\">\r\n<table id=\"packs\" border=\"0\" cellSpacing=0 cellPadding=0 height=140 width=720>\r\n<tr>\r\n<td>");
  if (r.truth((await r.call("defined", "MOD_ITEMMAIN")))) {
    await r.write("  ");
    (await r.include(r.template("MOD_ITEMMAIN_PROFILE_EQUIPMENTS"), s));
    await r.write("  ");
  }
  await r.write("  </td>\r\n  <td>\r\n  ");
  if (r.truth((await r.call("defined", "MOD_ITEMMAIN")))) {
    await r.write("  ");
    (await r.include(r.template("MOD_ITEMMAIN_PROFILE_BACKPACK"), s));
    await r.write("  ");
  }
  await r.write("</td>\r\n</tr>\r\n</TABLE>\r\n</div>");
  if (r.truth((r.truth((await r.call("defined", "MOD_SKILL504"))) && r.truth((await r.module("skillbase", "skill_query", 504)))))) {
    (await r.module("skill504", "skill504_get_popko_html"));
  }
  await r.write("</div>");
return 1;
}
