// Generated from templates/2/profile.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  await r.write("<div style=\"position:relative;height:520px;\">\r\n<div class=\"profile_box\" style=\"width:475px; height:65px;\">\r\n<div class=\"profile_row\">\r\n<div class=\"profile_bar\" style=\"width:118px\">");
  if (r.truth((await r.call("defined", "MOD_WEATHER")))) {
    (await r.include(r.template("MOD_WEATHER_PROFILE_WEATHER"), s));
  }
  await r.write("</div><div class=\"profile_bar\" style=\"width:203px\">\r\n<span class=\"typename\">地点</span><span class=\"main_cont\"><span class=\"yellow b\">");
  await r.write(r.text(r.get(r.get(s, "plsinfo"), r.get(s, "pls"))));
  await r.write("</span></span>\r\n</div><div class=\"profile_bar\" style=\"width:128px\">");
  if (r.truth((r.truth(r.equal(r.get(s, "gamestate"), 40)) || r.truth((r.truth(r.equal(r.get(s, "gametype"), 17)) && r.truth((r.compare((await r.module("skillbase", "skill_getvalue", 1000, "step")), 206) >= 0))))))) {
    await r.write("<span class=\"yellow b\">连斗</span> ");
  }
  if (r.truth(r.equal(r.get(s, "gamestate"), 50))) {
    await r.write("<span class=\"red b\">死斗</span> ");
  }
  await r.write(" \r\n<span class=\"typename\">剩余</span><span class=\"main_cont\">");
  await r.write(r.text(r.get(s, "alivenum")));
  await r.write("人</span>\r\n</div>\r\n</div><div class=\"profile_row\">\r\n<div class=\"profile_bar\" style=\"width:118px\">");
  (await r.include(r.template("MOD_MAP_PROFILE_AREAINFO"), s));
  await r.write("</div><div class=\"profile_bar\" style=\"width:338px\">\r\n<span class=\"typename\">下次禁区</span><span class=\"main_cont\">");
  await r.write(r.text(r.get(r.get(s, "uip"), "next_area")));
  await r.write("</span>\r\n</div>\r\n</div>\r\n</div><div class=\"profile_box\" style=\"width:235px; height:296px; left:485px;\">\r\n<div class=\"profile_row\">\r\n<div class=\"profile_bar right_panel\">\r\n<span class=\"main_cont\">");
  await r.write(r.text(r.get(r.get(s, "uip"), "cardname_show")));
  await r.write(" ");
  await r.write(r.text(r.get(s, "name")));
  await r.write("</span>\r\n</div>\r\n</div><div class=\"profile_row\">\r\n<!--头像和CD显示-->\r\n<div class=\"profile_bar right_panel\" style=\"width:140px;height:80px;\">\r\n<img src=\"img/");
  await r.write(r.text(r.get(s, "iconImg")));
  await r.write("\" border=\"0\" style=\"width:140;height:80;");
  if (r.truth(r.equal(r.get(s, "hp"), 0))) {
    await r.write("filter: grayscale(100%)");
  }
  await r.write("\">\r\n</div><div class=\"profile_bar right_panel\" style=\"width:76px\">\r\n<span class=\"main_cont\">");
  await r.write(r.text(r.get(r.get(s, "sexinfo"), r.get(s, "gd"))));
  await r.write(r.text(r.get(s, "sNo")));
  await r.write("号</span>\r\n</div><div class=\"profile_bar right_panel\" style=\"position:absolute;top:30px;left:147px;width:76px;height:50px\">\r\n<span class=\"typename\">队伍</span><br><span class=\"main_cont\">");
  if (r.truth((!r.truth((!r.truth(r.get(s, "teamID"))))))) {
    await r.write(r.text(r.get(s, "teamID")));
  } else {
    await r.write("<span class=\"grey\">无</span>");
  }
  await r.write("</span>\r\n</div>\r\n</div><div class=\"profile_row\">\r\n<div class=\"profile_bar right_panel state_panel\" style=\"height:168px;position:relative;\">\r\n<div style=\"display:inline-block;position:absolute;z-index:5;left:5px;top:5px;width:100px;height:165px;\">");
  if (r.truth((await r.call("defined", "MOD_WOUND")))) {
    (await r.include(r.template("MOD_WOUND_WOUND_PICTURE"), s));
  }
  await r.write("<div>");
  if (r.truth((r.compare(r.get(s, "hp"), 0) <= 0))) {
    await r.write("<img src=\"img/dead.gif\" style=\"width:94;height:40\">");
  } else {
    if (r.truth((r.compare(r.get(s, "hp"), r.multiply(r.get(s, "mhp"), 0.2)) <= 0))) {
      await r.write("<img src=\"img/danger.gif\" style=\"width:95;height:37\">");
    } else {
      if (r.truth((r.truth((r.compare(r.get(s, "hp"), r.multiply(r.get(s, "mhp"), 0.5)) <= 0)) || r.truth((!r.equal(r.get(s, "inf"), "")))))) {
        await r.write("<img src=\"img/caution.gif\" style=\"width:95;height:36\">");
      } else {
        await r.write("<img src=\"img/fine.gif\" style=\"width:81;height:38\">");
      }
    }
  }
  await r.write("</div>\r\n</div><div class=\"hpstate_container\" style=\"margin-left:100px;\">\r\n<img src=\"img/state1.gif\" class=\"hpstate_elm\">\r\n<div class=\"hpstate_elm\" style=\"z-index:2;\">\r");
  await r.write(r.text(r.get(s, "newspimg")));
  await r.write("</div>");
  if (r.truth((r.compare(r.get(s, "sp"), 0) > 0))) {
    await r.write("<div class=\"hpstate_elm\" style=\"z-index:1;\">\r");
    await r.write(r.text(r.get(s, "splt")));
    await r.write("</div>");
  }
  await r.write("</div><div class=\"hpstate_container\">\r\n<img src=\"img/state2.gif\" class=\"hpstate_elm\">\r\n<div class=\"hpstate_elm\" style=\"z-index:2;\">\r");
  await r.write(r.text(r.get(s, "newhpimg")));
  await r.write("</div>");
  if (r.truth((r.compare(r.get(s, "hp"), 0) > 0))) {
    await r.write("<div class=\"hpstate_elm\" style=\"z-index:1;\">\r");
    await r.write(r.text(r.get(s, "hplt")));
    await r.write("</div>");
  }
  await r.write("</div>\r\n</div>\r\n</div>\r\n</div><div class=\"profile_box\" style=\"width:475px; height:221px; top:75px;\">\r\n<div class=\"profile_row\">\r\n<div class=\"profile_bar\">\r\n<span class=\"typename\">等级</span><span class=\"main_cont\" title=\"经验值 ");
  await r.write(r.text(r.get(s, "exp")));
  await r.write(" / ");
  await r.write(r.text(r.get(s, "upexp")));
  await r.write(" 升级阈值\">Lv. ");
  await r.write(r.text(r.get(s, "lvl")));
  await r.write("</span>\r\n</div><div class=\"profile_bar\">");
  if (r.truth((r.truth((await r.call("defined", "MOD_GTYPE1"))) && r.truth(r.equal(r.get(s, "gametype"), 1))))) {
    (await r.include(r.template("MOD_GTYPE1_SHOWHACKLEVEL"), s));
  } else {
    await r.write("<span class=\"typename\">击杀数</span><span class=\"main_cont\" title=\"击杀玩家数 + 击杀NPC数\">");
    await r.write(r.text(r.get(s, "killnum")));
    await r.write(" <span class=\"grey\">+</span> ");
    await r.write(r.text(r.get(s, "npckillnum")));
    await r.write("</span>");
  }
  await r.write("</div><div class=\"profile_bar\">");
  if (r.truth((await r.call("defined", "MOD_APM")))) {
    (await r.include(r.template("MOD_APM_PROFILE"), s));
  }
  await r.write("</div>\r\n</div><div class=\"profile_row\">\r\n<div class=\"profile_bar\">\r\n<span class=\"typename\">金钱</span><span class=\"main_cont\">");
  if (r.truth((r.compare(r.get(s, "money"), 20) > 0))) {
    await r.write("<span class=\"gold b\">");
    await r.write(r.text(r.get(s, "money")));
    await r.write("</span>");
  } else {
    await r.write(r.text(r.get(s, "money")));
  }
  await r.write("</span>\r\n</div><div class=\"profile_bar\">\r\n<span class=\"typename\">怒气</span><span class=\"main_cont\">");
  if (r.truth((r.compare(r.get(s, "rage"), 30) >= 0))) {
    await r.write("<span class=\"yellow b\">");
    await r.write(r.text(r.get(s, "rage")));
    await r.write("</span>");
  } else {
    await r.write(r.text(r.get(s, "rage")));
  }
  await r.write("</span>\r\n</div><div class=\"profile_bar\">\r\n<span class=\"typename\">技能点</span><span class=\"main_cont\">");
  if (r.truth((r.compare(r.get(s, "skillpoint"), 0) > 0))) {
    await r.write("<span class=\"lime b\">");
    await r.write(r.text(r.get(s, "skillpoint")));
    await r.write("</span>");
  } else {
    await r.write(r.text(r.get(s, "skillpoint")));
  }
  await r.write("</span>\r\n</div>\r\n</div><div class=\"profile_row\">\r\n<div class=\"profile_bar\">\r\n<span class=\"typename\">攻击</span><span class=\"main_cont\" title=\"攻击力 ");
  await r.write(r.text(r.get(r.get(s, "uip"), "att_words")));
  await r.write("\">");
  await r.write(r.text(r.get(r.get(s, "uip"), "total_att")));
  await r.write("</span>\r\n</div><div class=\"profile_bar\">\r\n<span class=\"typename\">防御</span><span class=\"main_cont\" title=\"防御力 ");
  await r.write(r.text(r.get(r.get(s, "uip"), "def_words")));
  await r.write("\">");
  await r.write(r.text(r.get(r.get(s, "uip"), "total_def")));
  await r.write("</span>\r\n</div><div class=\"profile_bar\">");
  r.assign(r.slot(s, ["dummy"]), (await r.module("player", "create_dummy_playerdata")));
  r.assign(r.slot(s, ["dummy", "type"]), 1);
  r.assign(r.slot(s, ["tmp_active_rate"]), (await r.module("enemy", "get_final_active_obbs", r.get(s, "sdata"), r.get(s, "dummy"))));
  r.assign(r.slot(s, ["tmp_active_words"]), r.get(r.get(s, "sdata"), "active_words"));
  r.assign(r.slot(s, ["dummy", "pose"]), 4);
  r.assign(r.slot(s, ["tmp_active_rate_2"]), (await r.module("enemy", "get_final_active_obbs", r.get(s, "sdata"), r.get(s, "dummy"))));
  r.assign(r.slot(s, ["tmp_active_words_2"]), r.get(r.get(s, "sdata"), "active_words"));
  r.assign(r.slot(s, ["dummy", "pose"]), 2);
  r.assign(r.slot(s, ["tmp_active_rate_3"]), (await r.module("enemy", "get_final_active_obbs", r.get(s, "sdata"), r.get(s, "dummy"))));
  r.assign(r.slot(s, ["tmp_active_words_3"]), r.get(r.get(s, "sdata"), "active_words"));
  await r.write("<span class=\"typename\">先手</span><span class=\"main_cont\" title=\"先手率(VS通常NPC) ");
  await r.write(r.text(r.get(s, "tmp_active_rate")));
  await r.write(" = ");
  await r.write(r.text(r.get(s, "tmp_active_words")));
  await r.write("<br>先手率(VS偷袭NPC) ");
  await r.write(r.text(r.get(s, "tmp_active_rate_2")));
  await r.write(" = ");
  await r.write(r.text(r.get(s, "tmp_active_words_2")));
  await r.write("<br>先手率(VS强袭NPC) ");
  await r.write(r.text(r.get(s, "tmp_active_rate_3")));
  await r.write(" = ");
  await r.write(r.text(r.get(s, "tmp_active_words_3")));
  await r.write("<br>面对玩家时，先手率基础值-5%\">");
  await r.write(r.text(r.get(s, "tmp_active_rate")));
  await r.write("%</span>\r\n</div>\r\n</div><div class=\"profile_row\">\r\n<div class=\"profile_bar\">\r\n<span class=\"typename\">生命</span><span class=\"main_cont\"><span class=\"");
  await r.write(r.text(r.get(s, "hpcolor")));
  await r.write("\">");
  await r.write(r.text(r.get(s, "hp")));
  await r.write(" / ");
  await r.write(r.text(r.get(s, "mhp")));
  await r.write("</span></span>\r\n</div><div class=\"profile_bar\">\r\n<span class=\"typename\">体力</span><span class=\"main_cont\"><span class=\"");
  await r.write(r.text(r.get(s, "spcolor")));
  await r.write("\">");
  await r.write(r.text(r.get(s, "sp")));
  await r.write(" / ");
  await r.write(r.text(r.get(s, "msp")));
  await r.write("</span></span>\r\n</div><div class=\"profile_bar\">\r\n<span class=\"typename\">歌魂</span><span class=\"main_cont\"><span class=\"");
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
  await r.write("</span></span>\r\n</div>\r\n</div><div class=\"profile_row\">\r\n<div class=\"profile_bar\">\r\n<span class=\"typename\">称号</span><span class=\"main_cont\">");
  if (r.truth((await r.call("defined", "MOD_CLUBBASE")))) {
    (await r.include(r.template("MOD_CLUBBASE_CLUB_PROFILE"), s));
  }
  await r.write("</span>\r\n</div><div class=\"profile_bar\">\r\n<span class=\"typename\">基础姿态</span><span class=\"main_cont\">");
  if (r.truth((await r.call("defined", "MOD_POSE")))) {
    (await r.include(r.template("MOD_POSE_POSE_PROFILE_CMD"), s));
  }
  await r.write("</span>\r\n</div><div class=\"profile_bar\">\r\n<span class=\"typename\">应战策略</span><span class=\"main_cont\">");
  if (r.truth((await r.call("defined", "MOD_TACTIC")))) {
    (await r.include(r.template("MOD_TACTIC_TACTIC_PROFILE_CMD"), s));
  }
  await r.write("</span>\r\n</div>\r\n</div>\r\n<hr>");
  if (r.truth((await r.call("defined", "MOD_WEAPON")))) {
    (await r.include(r.template("MOD_WEAPON_PROFILE_WEPSKILL"), s));
  }
  await r.write("</div>");
  if (r.truth((await r.call("defined", "MOD_ITEMMAIN")))) {
    await r.write("<div class=\"profile_box\" id=\"profile_eqp\" style=\"width:570px; height:210px; left:0px; top:308px;\">");
    (await r.include(r.template("MOD_ITEMMAIN_PROFILE_EQUIPMENTS"), s));
    await r.write("</div><div class=\"profile_box\" id=\"profile_eqp_short\" style=\"width:140px; height:210px; left:0px; top:308px; display:none;\">");
    (await r.include(r.template("MOD_ITEMMAIN_PROFILE_EQUIPMENTS_SHORT"), s));
    await r.write("</div><div class=\"profile_box\" id=\"profile_pack\" style=\"width:570px; height:210px; left:150px; top:308px; display:none;\">");
    (await r.include(r.template("MOD_ITEMMAIN_PROFILE_BACKPACK"), s));
    await r.write("</div><div class=\"profile_box\" id=\"profile_pack_short\" style=\"width:140px; height:210px; left:580px; top:308px;\">");
    (await r.include(r.template("MOD_ITEMMAIN_PROFILE_BACKPACK_SHORT"), s));
    await r.write("</div>");
  }
  await r.write("</div>");
  if (r.truth((r.truth((await r.call("defined", "MOD_SKILL504"))) && r.truth((await r.module("skillbase", "skill_query", 504)))))) {
    (await r.module("skill504", "skill504_get_popko_html"));
  }
  await r.write("</div>");
return 1;
}
