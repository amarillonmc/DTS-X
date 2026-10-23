// Generated from templates/default/roomteam.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  if (r.truth(r.equal(r.get(r.get(s, "roomdata"), "roomtype"), 0))) {
    await r.write("<table CellSpacing=0 CellPadding=0 width=100%>\r\n<tr>\r\n<td class=\"b3\" height=5px colspan=5>\r\n</td>\r\n</tr>\r\n<tr>\r\n<td class=\"b3\" height=25px width=70px>\r\n</td>\r\n<td class=\"b3\" height=25px width=150px>\r\n<span style=\"color:#ff0022;\">红队</span>\r\n</td>\r\n<td class=\"b3\" height=25px width=70px>\r\n</td>\r\n<td class=\"b3\" height=25px width=150px>\r\n<span style=\"color:#5900ff;\">蓝队</span>\r\n</td>\r\n<td class=\"b3\" height=25px width=70px>\r\n</td>\r\n</tr>\r\n<tr>\r\n<td class=\"b3\" height=40px width=70px>\r\n</td>");
    r.assign(r.slot(s, ["i"]), 0);
    await r.write("<td id=\"room-position-");
    await r.write(r.text(r.get(s, "i")));
    await r.write("\" class=\"b3\" width=150px align=center style=\"position:relative;\">");
    (await r.include(r.template("roomslot"), s));
    await r.write("</td>\r\n<td class=\"b3\" height=40px width=70px>\r\n</td>");
    r.assign(r.slot(s, ["i"]), 1);
    await r.write("<td id=\"room-position-");
    await r.write(r.text(r.get(s, "i")));
    await r.write("\" class=\"b3\" width=150px align=center style=\"position:relative;\">");
    (await r.include(r.template("roomslot"), s));
    await r.write("</td>\r\n<td class=\"b3\" height=40px width=70px>\r\n</td>\r\n</tr>\r\n<tr>\r\n<td class=\"b3\" height=10px colspan=5>\r\n</td>\r\n</tr>\r\n</table>");
  }
  if (r.truth(r.equal(r.get(r.get(s, "roomdata"), "roomtype"), 1))) {
    await r.write("<table CellSpacing=0 CellPadding=0 width=100%>\r\n<tr>\r\n<td class=\"b3\" height=40px width=20px>\r\n</td>\r\n<td class=\"b3\" height=40px width=40px>\r\n<span style=\"color:#ff0022;\">红队</span>\r\n</td>");
    if (r.truth((await r.call("is_array", (await r.call("range", 0, 4)))))) {
      {
        const a0 = r.copy((await r.call("range", 0, 4)));
        for (const [k0, v0] of r.entries(a0)) {
          r.assign(r.slot(s, ["i"]), v0);
          await r.write("<td class=\"b3\" id=\"room-position-");
          await r.write(r.text(r.get(s, "i")));
          await r.write("\" width=90px align=center style=\"position:relative;\">");
          (await r.include(r.template("roomslot_s"), s));
          await r.write("</td>");
        }
      }
    }
    await r.write("</tr>\r\n<tr>\r\n<td class=\"b3\" height=40px width=20px>\r\n</td>\r\n<td class=\"b3\" height=40px width=40px>\r\n<span style=\"color:#5900ff;\">蓝队</span>\r\n</td>");
    if (r.truth((await r.call("is_array", (await r.call("range", 5, 9)))))) {
      {
        const a1 = r.copy((await r.call("range", 5, 9)));
        for (const [k1, v1] of r.entries(a1)) {
          r.assign(r.slot(s, ["i"]), v1);
          await r.write("<td id=\"room-position-");
          await r.write(r.text(r.get(s, "i")));
          await r.write("\" class=\"b3\" width=90px align=center style=\"position:relative;\">");
          (await r.include(r.template("roomslot_s"), s));
          await r.write("</td>");
        }
      }
    }
    await r.write("</tr>\r\n</table>");
  }
  if (r.truth(r.equal(r.get(r.get(s, "roomdata"), "roomtype"), 2))) {
    await r.write("<table CellSpacing=0 CellPadding=0 width=100%>\r\n<tr>\r\n<td class=\"b3\" height=40px width=20px>\r\n</td>\r\n<td class=\"b3\" height=40px width=40px>\r\n<span style=\"color:#ff0022;\">红队</span>\r\n</td>");
    if (r.truth((await r.call("is_array", (await r.call("range", 0, 4)))))) {
      {
        const a2 = r.copy((await r.call("range", 0, 4)));
        for (const [k2, v2] of r.entries(a2)) {
          r.assign(r.slot(s, ["i"]), v2);
          await r.write("<td class=\"b3\" id=\"room-position-");
          await r.write(r.text(r.get(s, "i")));
          await r.write("\" width=90px align=center style=\"position:relative;\">");
          (await r.include(r.template("roomslot_s"), s));
          await r.write("</td>");
        }
      }
    }
    await r.write("</tr>\r\n<tr>\r\n<td class=\"b3\" height=40px width=20px>\r\n</td>\r\n<td class=\"b3\" height=40px width=40px>\r\n<span style=\"color:#5900ff;\">蓝队</span>\r\n</td>");
    if (r.truth((await r.call("is_array", (await r.call("range", 5, 9)))))) {
      {
        const a3 = r.copy((await r.call("range", 5, 9)));
        for (const [k3, v3] of r.entries(a3)) {
          r.assign(r.slot(s, ["i"]), v3);
          await r.write("<td id=\"room-position-");
          await r.write(r.text(r.get(s, "i")));
          await r.write("\" class=\"b3\" width=90px align=center style=\"position:relative;\">");
          (await r.include(r.template("roomslot_s"), s));
          await r.write("</td>");
        }
      }
    }
    await r.write("</tr>\r\n<tr>\r\n<td class=\"b3\" height=40px width=20px>\r\n</td>\r\n<td class=\"b3\" height=40px width=40px>\r\n<span style=\"color:#8cff00;\">绿队</span>\r\n</td>");
    if (r.truth((await r.call("is_array", (await r.call("range", 10, 14)))))) {
      {
        const a4 = r.copy((await r.call("range", 10, 14)));
        for (const [k4, v4] of r.entries(a4)) {
          r.assign(r.slot(s, ["i"]), v4);
          await r.write("<td id=\"room-position-");
          await r.write(r.text(r.get(s, "i")));
          await r.write("\" class=\"b3\" width=90px align=center style=\"position:relative;\">");
          (await r.include(r.template("roomslot_s"), s));
          await r.write("</td>");
        }
      }
    }
    await r.write("</tr>\r\n</table>");
  }
  if (r.truth(r.equal(r.get(r.get(s, "roomdata"), "roomtype"), 3))) {
    await r.write("<table CellSpacing=0 CellPadding=0 width=100%>\r\n<tr>\r\n<td class=\"b3\" height=40px width=20px>\r\n</td>\r\n<td class=\"b3\" height=40px width=40px>\r\n<span style=\"color:#ff0022;\">红队</span>\r\n</td>");
    if (r.truth((await r.call("is_array", (await r.call("range", 0, 4)))))) {
      {
        const a5 = r.copy((await r.call("range", 0, 4)));
        for (const [k5, v5] of r.entries(a5)) {
          r.assign(r.slot(s, ["i"]), v5);
          await r.write("<td class=\"b3\" id=\"room-position-");
          await r.write(r.text(r.get(s, "i")));
          await r.write("\" width=90px align=center style=\"position:relative;\">");
          (await r.include(r.template("roomslot_s"), s));
          await r.write("</td>");
        }
      }
    }
    await r.write("</tr>\r\n<tr>\r\n<td class=\"b3\" height=40px width=20px>\r\n</td>\r\n<td class=\"b3\" height=40px width=40px>\r\n<span style=\"color:#5900ff;\">蓝队</span>\r\n</td>");
    if (r.truth((await r.call("is_array", (await r.call("range", 5, 9)))))) {
      {
        const a6 = r.copy((await r.call("range", 5, 9)));
        for (const [k6, v6] of r.entries(a6)) {
          r.assign(r.slot(s, ["i"]), v6);
          await r.write("<td id=\"room-position-");
          await r.write(r.text(r.get(s, "i")));
          await r.write("\" class=\"b3\" width=90px align=center style=\"position:relative;\">");
          (await r.include(r.template("roomslot_s"), s));
          await r.write("</td>");
        }
      }
    }
    await r.write("</tr>\r\n<tr>\r\n<td class=\"b3\" height=40px width=20px>\r\n</td>\r\n<td class=\"b3\" height=40px width=40px>\r\n<span style=\"color:#8cff00;\">绿队</span>\r\n</td>");
    if (r.truth((await r.call("is_array", (await r.call("range", 10, 14)))))) {
      {
        const a7 = r.copy((await r.call("range", 10, 14)));
        for (const [k7, v7] of r.entries(a7)) {
          r.assign(r.slot(s, ["i"]), v7);
          await r.write("<td id=\"room-position-");
          await r.write(r.text(r.get(s, "i")));
          await r.write("\" class=\"b3\" width=90px align=center style=\"position:relative;\">");
          (await r.include(r.template("roomslot_s"), s));
          await r.write("</td>");
        }
      }
    }
    await r.write("</tr>\r\n<tr>\r\n<td class=\"b3\" height=40px width=20px>\r\n</td>\r\n<td class=\"b3\" height=40px width=40px>\r\n<span style=\"color:#ffc700;\">黄队</span>\r\n</td>");
    if (r.truth((await r.call("is_array", (await r.call("range", 15, 19)))))) {
      {
        const a8 = r.copy((await r.call("range", 15, 19)));
        for (const [k8, v8] of r.entries(a8)) {
          r.assign(r.slot(s, ["i"]), v8);
          await r.write("<td id=\"room-position-");
          await r.write(r.text(r.get(s, "i")));
          await r.write("\" class=\"b3\" width=90px align=center style=\"position:relative;\">");
          (await r.include(r.template("roomslot_s"), s));
          await r.write("</td>");
        }
      }
    }
    await r.write("</tr>\r\n</table>");
  }
  if (r.truth(r.equal(r.get(r.get(s, "roomdata"), "roomtype"), 4))) {
    await r.write("<!--<div style=\"margin:10px\">\r\n<ul class=\"roomteam-ul\" style=\"list-style-type:none;\">\r\n<li style=\"display:block;\">\r\n<div style=\"float:left\">\r\n\r\n</div>\r\n</li>\r\n</ul>\r\n</div>-->\r\n<table CellSpacing=0 CellPadding=0 width=100%>");
    if (r.truth((await r.call("is_array", (await r.call("range", 0, r.subtract((await r.call("room_get_vars", r.get(s, "roomdata"), "pnum")), 1))))))) {
      {
        const a9 = r.copy((await r.call("range", 0, r.subtract((await r.call("room_get_vars", r.get(s, "roomdata"), "pnum")), 1))));
        for (const [k9, v9] of r.entries(a9)) {
          r.assign(r.slot(s, ["i"]), v9);
          r.assign(r.slot(s, ["lp"]), r.get((await r.call("room_get_vars", r.get(s, "roomdata"), "leader-position")), r.get(s, "i")));
          r.assign(r.slot(s, ["tcolor"]), r.get((await r.call("room_get_vars", r.get(s, "roomdata"), "color")), r.get(s, "lp")));
          r.assign(r.slot(s, ["tname"]), r.get((await r.call("room_get_vars", r.get(s, "roomdata"), "teamID")), r.get(s, "lp")));
          if (r.truth(r.equal(r.modulo(r.get(s, "i"), 5), 0))) {
            await r.write("<tr>\r\n<td class=\"b3\" height=40px width=20px>\r\n</td>\r\n<td class=\"b3\" height=40px width=40px>\r\n<span style=\"color:");
            await r.write(r.text(r.get(s, "tcolor")));
            await r.write(";\">");
            await r.write(r.text(r.get(s, "tname")));
            await r.write("</span>\r\n</td>");
          }
          await r.write("<td class=\"b3\" id=\"room-position-");
          await r.write(r.text(r.get(s, "i")));
          await r.write("\" width=90px align=center style=\"position:relative;\">");
          (await r.include(r.template("roomslot_s"), s));
          await r.write("</td>");
          if (r.truth(r.equal(r.modulo(r.get(s, "i"), 5), 4))) {
            await r.write("</tr>");
          }
        }
      }
    }
    await r.write("</table>");
  }
  if (r.truth(r.equal(r.get(r.get(s, "roomdata"), "roomtype"), 5))) {
    await r.write("<table CellSpacing=0 CellPadding=0 width=100%>\r\n<tr>\r\n<td class=\"b3\" height=10px colspan=5>\r\n</td>\r\n</tr>\r\n<tr>\r\n<td class=\"b3\" colspan=3 height=25px width=310px>\r\n<span style=\"color:#ff9933;\">本模式可以熟悉游戏，也可以尝试在1禁前尽可能获取金钱</span>\r\n</td>\r\n</tr>\r\n<tr>\r\n<td class=\"b3\" height=40px width=250>\r\n</td>");
    r.assign(r.slot(s, ["i"]), 0);
    await r.write("<td id=\"room-position-");
    await r.write(r.text(r.get(s, "i")));
    await r.write("\" class=\"b3\" width=150px align=center style=\"position:relative;\">");
    (await r.include(r.template("roomslot"), s));
    await r.write("</td>\r\n<td class=\"b3\">\r\n</td>\r\n</tr>\r\n<tr>\r\n<td class=\"b3\" height=15px colspan=5>\r\n</td>\r\n</tr>\r\n</table>");
  }
  if (r.truth(r.equal(r.get(r.get(s, "roomdata"), "roomtype"), 6))) {
    await r.write("<table CellSpacing=0 CellPadding=0 width=100%>\r\n<tr>\r\n<td class=\"b3\" height=10px colspan=7>\r\n<span style=\"color:#ff9933;\">本模式中可以完成解离相关成就 限制时间为4禁 注意2禁会进入连斗</span>\r\n</td>\r\n</tr>\r\n<tr>\r\n<td class=\"b3\" height=25px width=65px>\r\n</td>\r\n<td class=\"b3\" height=25px width=80px>\r\n<span style=\"color:#ff0022;\">攻坚</span>\r\n</td>\r\n<td class=\"b3\" height=25px width=70px>\r\n</td>\r\n<td class=\"b3\" height=25px width=80px>\r\n<span style=\"color:#5900ff;\">副手</span>\r\n</td>\r\n<td class=\"b3\" height=25px width=70px>\r\n</td>\r\n<td class=\"b3\" height=25px width=80px>\r\n<span style=\"color:#8cff00;\">辅助</span>\r\n</td>\r\n<td class=\"b3\" height=25px width=65px>\r\n</td>\r\n</tr>\r\n<tr>\r\n<td class=\"b3\" height=40px width=65px>\r\n</td>");
    r.assign(r.slot(s, ["i"]), 0);
    await r.write("<td id=\"room-position-");
    await r.write(r.text(r.get(s, "i")));
    await r.write("\" class=\"b3\" width=80px align=center style=\"position:relative;\">");
    (await r.include(r.template("roomslot"), s));
    await r.write("</td>\r\n<td class=\"b3\" height=40px width=70px>\r\n</td>");
    r.assign(r.slot(s, ["i"]), 1);
    await r.write("<td id=\"room-position-");
    await r.write(r.text(r.get(s, "i")));
    await r.write("\" class=\"b3\" width=80px align=center style=\"position:relative;\">");
    (await r.include(r.template("roomslot"), s));
    await r.write("</td>\r\n<td class=\"b3\" height=40px width=70px>\r\n</td>");
    r.assign(r.slot(s, ["i"]), 2);
    await r.write("<td id=\"room-position-");
    await r.write(r.text(r.get(s, "i")));
    await r.write("\" class=\"b3\" width=80px align=center style=\"position:relative;\">");
    (await r.include(r.template("roomslot"), s));
    await r.write("</td>\r\n<td class=\"b3\" height=40px width=65px>\r\n</td>\r\n</tr>\r\n<tr>\r\n<td class=\"b3\" height=15px colspan=5>\r\n</td>\r\n</tr>\r\n</table>");
  }
  if (r.truth(r.equal(r.get(r.get(s, "roomdata"), "roomtype"), 8))) {
    await r.write("<table CellSpacing=0 CellPadding=0 width=100%>\r\n<tr>\r\n<td class=\"b3\" height=10px colspan=5>\r\n</td>\r\n</tr>\r\n<tr>\r\n<td class=\"b3\" height=25px width=310px colspan=3>\r\n<span style=\"color:#ff9933;\">本模式允许其他玩家随时加入，NPC、地图道具与标准模式有区别。此外，本模式偶尔会测试新功能。</span>\r\n</td>\r\n\r\n</tr>\r\n<tr>\r\n<td class=\"b3\" height=40px width=250px>\r\n</td>");
    r.assign(r.slot(s, ["i"]), 0);
    await r.write("<td id=\"room-position-");
    await r.write(r.text(r.get(s, "i")));
    await r.write("\" class=\"b3\" width=150px align=center style=\"position:relative;\">");
    (await r.include(r.template("roomslot"), s));
    await r.write("</td>\r\n<td class=\"b3\" height=40px>\r\n</td>\r\n</tr>\r\n<tr>\r\n<td class=\"b3\" height=15px colspan=5>\r\n</td>\r\n</tr>\r\n</table>");
  }
  if (r.truth(r.equal(r.get(r.get(s, "roomdata"), "roomtype"), 9))) {
    await r.write("<table CellSpacing=0 CellPadding=0 width=100%>\r\n<tr>\r\n<td class=\"b3\" height=10px colspan=5>\r\n</td>\r\n</tr>\r\n<tr>\r\n<td class=\"b3\" height=25px width=310px colspan=3>\r\n<span style=\"color:#ff9933;\">本模式节奏大大快于其他模式！允许其他玩家随时加入。</span>\r\n</td>\r\n</tr>\r\n<tr>\r\n<td class=\"b3\" height=40px width=250px>\r\n</td>");
    r.assign(r.slot(s, ["i"]), 0);
    await r.write("<td id=\"room-position-");
    await r.write(r.text(r.get(s, "i")));
    await r.write("\" class=\"b3\" width=150px align=center style=\"position:relative;\">");
    (await r.include(r.template("roomslot"), s));
    await r.write("</td>\r\n<td class=\"b3\" height=40px>\r\n</td>\r\n</tr>\r\n<tr>\r\n<td class=\"b3\" height=15px colspan=5>\r\n</td>\r\n</tr>\r\n</table>");
  }
  if (r.truth(r.equal(r.get(r.get(s, "roomdata"), "roomtype"), 11))) {
    await r.write("<table CellSpacing=0 CellPadding=0 width=100%>\r\n<tr>\r\n<td class=\"b3\" height=10px colspan=5>\r\n</td>\r\n</tr>\r\n<tr>\r\n<td class=\"b3\" colspan=3 height=90px width=310px>\r\n<span style=\"color:#ff9933;\">本模式胜利条件为完成幻境解离结局，限时2禁，商店部分强化道具于0禁提前出售。</span><br><br>\r\n<span class=\"red b\">注意：本模式供熟练玩家挑战自我，切糕奖励随难度增加<br>进阶16及以上难度极具挑战性，需要小心应对</span>\r\n</td>\r\n</tr>\r\n<tr>\r\n<td class=\"b3\" height=40px width=250>\r\n</td>");
    r.assign(r.slot(s, ["i"]), 0);
    await r.write("<td id=\"room-position-");
    await r.write(r.text(r.get(s, "i")));
    await r.write("\" class=\"b3\" width=150px align=center style=\"position:relative;\">");
    (await r.include(r.template("roomslot"), s));
    await r.write("</td>\r\n<td class=\"b3\">\r\n</td>\r\n</tr>\r\n<tr>\r\n<td class=\"b3\" height=15px colspan=5>\r\n</td>\r\n</tr>\r\n</table>");
  }
return 1;
}
