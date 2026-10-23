// Generated from include/modules/extra/card/skills/skill435/mercpanel.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  await r.write("<input type=\"hidden\" id=\"mode\" name=\"mode\" value=\"command\">\r\n<input type=\"hidden\" id=\"command\" name=\"command\" value=\"menu\">\r\n<input type=\"hidden\" id=\"subcmd\" name=\"subcmd\" value=\"\">\r\n<input type=\"hidden\" id=\"skillpara1\" name=\"skillpara1\" value=\"\">\r\n<input type=\"hidden\" id=\"skillpara2\" name=\"skillpara2\" value=\"\">\r\n<input type=\"hidden\" id=\"skillpara3\" name=\"skillpara3\" value=\"\">\r\n<input type=\"hidden\" id=\"skillpara4\" name=\"skillpara4\" value=\"\">\r\n<input type=\"hidden\" id=\"skillpara5\" name=\"skillpara5\" value=\"\">");
  r.imports(s, "sys", "map", "skill435");
  r.assign(r.slot(s, ["merc_num"]), r.int((await r.module("skillbase", "skill_getvalue", 435, "t"))));
  r.assign(r.slot(s, ["merc_num_left"]), r.subtract(r.get(s, "skill435_lim"), r.get(s, "merc_num")));
  (await r.call("bubblebox_start", "id:skill435_merc;height:4350;width:772;cancellable:1;margin-top:20px;margin-bottom:20px;margin-left:20px;margin-right:10px;"));
  await r.write("<p style=\"margin-left:0px; margin-top:0px; margin-right:0px; margin-bottom:0px;\">\r\n以下是所有可能被召唤出的佣兵的列表：<br><br>\r\n</p>");
  (await r.module("npcinfo", "npcinfo_get_npc_description_all", 26));
  (await r.call("bubblebox_end"));
  await r.write("你共雇佣过<span class=\"yellow b\">");
  await r.write(r.text(r.get(s, "merc_num")));
  await r.write("</span>名佣兵，你还可以再招募<span class=\"yellow b\">");
  await r.write(r.text(r.get(s, "merc_num_left")));
  await r.write("</span>名佣兵。<br>");
  if (r.truth((r.compare(r.get(s, "merc_num_left"), 0) > 0))) {
    await r.write("<input type=\"button\" style=\"width:120px\" onclick=\"$('mode').value='special';$('command').value='skill435_special';$('subcmd').value='action435';$('skillpara1').value=1;postCmd('gamecmd','command.php');this.disabled=true;\" value=\"招募一名新佣兵\"><input type=\"button\" style=\"width:170px\" onclick=\"bubblebox_show('skill435_merc')\" value=\"查看所有可能的佣兵列表\">\r\n<br>");
  }
  await r.write("<br>");
  if (r.truth((r.compare(r.get(s, "merc_num"), 0) > 0))) {
    await r.write("以下是你正在雇佣或曾雇佣过的佣兵：<br><br>");
  }
  if (r.truth((await r.call("is_array", (await r.call("range", 1, r.get(s, "merc_num"))))))) {
    {
      const a0 = r.copy((await r.call("range", 1, r.get(s, "merc_num"))));
      for (const [k0, v0] of r.entries(a0)) {
        r.assign(r.slot(s, ["i"]), v0);
        r.assign(r.slot(s, ["now_hirestat"]), r.int((await r.module("skillbase", "skill_getvalue", 435, (r.text("h") + r.text(r.get(s, "i")))))));
        if (r.truth(r.equal(r.get(s, "now_hirestat"), 1))) {
          r.assign(r.slot(s, ["now_mercpid"]), r.int((await r.module("skillbase", "skill_getvalue", 435, (r.text("p") + r.text(r.get(s, "i")))))));
          r.assign(r.slot(s, ["now_merctype"]), r.int((await r.module("skillbase", "skill_getvalue", 435, (r.text("s") + r.text(r.get(s, "i")))))));
          r.assign(r.slot(s, ["now_lastsal"]), r.int((await r.module("skillbase", "skill_getvalue", 435, (r.text("l") + r.text(r.get(s, "i")))))));
          if (r.truth((r.compare(r.get(s, "now_mercpid"), 0) > 0))) {
            r.assign(r.slot(s, ["nowmerc"]), (await r.module("player", "fetch_playerdata_by_pid", r.get(s, "now_mercpid"))));
            if (r.truth((r.compare(r.get(r.get(s, "nowmerc"), "hp"), 0) > 0))) {
              (await r.call("bubblebox_start", (r.text((r.text("id:showmercdata") + r.text(r.get(s, "i")))) + r.text(";height:250;width:752;cancellable:1;margin-top:20px;margin-bottom:20px;margin-left:20px;margin-right:20px;scroll-bar:0;"))));
              (await r.module("npcinfo", "npcinfo_get_npc_description", 25, r.get(s, "now_merctype"), r.get(s, "nowmerc")));
              (await r.call("bubblebox_end"));
            }
            await r.write("<table width=\"300px\" CellPadding=0 CellSpacing=0>\r\n<tr>\r\n<td class=\"b1\" colspan=4>\r\n佣兵信息\r\n</td>\r\n<tr>\r\n<td class=\"b2\" width=60px height=20px>佣兵名称</td>\r\n<td class=\"b3\" ><span class=\"yellow b\">");
            await r.write(r.text(r.get(r.get(s, "nowmerc"), "name")));
            await r.write("</span></td>\r\n<td class=\"b3\" width=40px>状况</td>\r\n<td class=\"b3\" width=80px>");
            if (r.truth((r.compare(r.get(r.get(s, "nowmerc"), "hp"), 0) <= 0))) {
              await r.write("<span class=\"red b\">已经死亡</span>");
            } else {
              if (r.truth((r.compare(r.get(r.get(s, "nowmerc"), "hp"), r.multiply(r.get(r.get(s, "nowmerc"), "mhp"), 0.2)) <= 0))) {
                await r.write("<span class=\"red b\">生命危险</span>");
              } else {
                if (r.truth((r.compare(r.get(r.get(s, "nowmerc"), "hp"), r.multiply(r.get(r.get(s, "nowmerc"), "mhp"), 0.5)) <= 0))) {
                  await r.write("<span class=\"yellow b\">伤痕累累</span>");
                } else {
                  await r.write("<span class=\"cyan b\">并无大碍</span>");
                }
              }
            }
            await r.write("</tr>\r\n<tr>\r\n<td class=\"b2\" width=60px>佣兵位置</td>\r\n<td class=\"b3\"><span >");
            await r.write(r.text(r.get(r.get(s, "plsinfo"), r.get(r.get(s, "nowmerc"), "pls"))));
            await r.write("</span></td>\r\n<td class=\"b3\" colspan=2><input type=\"button\" style=\"width:118px;height:20px;\" value=\"查看佣兵具体状况\" onclick=\"bubblebox_show('showmercdata");
            await r.write(r.text(r.get(s, "i")));
            await r.write("');\" ");
            if (r.truth((r.compare(r.get(r.get(s, "nowmerc"), "hp"), 0) <= 0))) {
              await r.write("disabled=true");
            }
            await r.write("></td>\r\n<td></td>\r\n</tr>");
            if (r.truth((r.compare(r.get(r.get(s, "nowmerc"), "hp"), 0) > 0))) {
              await r.write("<tr>\r\n<td class=\"b2\" width=60px height=40px>薪资状况</td>\r\n<td class=\"b3\" colspan=3>\r\n<span style=\"text-align:left; display:inline-block;\">\r\n<table><tr><td>\r\n该佣兵的雇佣工资是每分钟<span class=\"yellow b\">");
              await r.write(r.text(r.get(r.get(r.get(r.get(s, "skill435_npc"), "sub"), r.get(s, "now_merctype")), "mercsalary")));
              await r.write("</span>元。<br>");
              if (r.truth((r.compare(r.subtract(r.get(s, "now"), r.get(s, "now_lastsal")), 60) >= 0))) {
                r.assign(r.slot(s, ["now_mercnextpay"]), r.subtract(r.get(s, "now"), r.get(s, "now_lastsal")));
                await r.write("<span class=\"yellow b\">因为无钱支付工资，你已经拖欠该佣兵的工资<span>");
                await r.write(r.text(r.get(s, "now_mercnextpay")));
                await r.write("</span>秒了！</span><span class=\"red b\">\r\n拖欠<span>");
                await r.write(r.text(r.get(s, "merc_leave_timeout")));
                await r.write("</span>秒后该佣兵将与你解除雇佣合同！</span>");
              } else {
                r.assign(r.slot(s, ["now_mercnextpay"]), r.subtract(r.add(r.get(s, "now_lastsal"), 60), r.get(s, "now")));
                await r.write("下次工资结算将在<span class=\"yellow b\">");
                await r.write(r.text(r.get(s, "now_mercnextpay")));
                await r.write("</span>秒后进行。");
              }
              await r.write("</td></tr></table>\r\n</span>\r\n</td>\r\n</tr>\r\n<tr>\r\n<td class=\"b2\" height=20px>移动佣兵</td>\r\n<td class=\"b3\" colspan=3>");
              r.assign(r.slot(s, ["now_mercmovecost"]), r.multiply(r.get(r.get(r.get(r.get(s, "skill435_npc"), "sub"), r.get(s, "now_merctype")), "mercsalary"), 2));
              await r.write("<span style=\"text-align:left; display:inline-block;\">\r\n<table><tr><td>\r\n每次移动这名佣兵需要花费<span class=\"yellow b\">");
              await r.write(r.text(r.get(s, "now_mercmovecost")));
              await r.write("</span>元。<br>\r\n移动到\r\n<select name=\"skill435_movepls\" id=\"skill435_movepls\">");
              if (r.truth((await r.call("is_array", (await r.module("map", "get_all_plsno")))))) {
                {
                  const a1 = r.copy((await r.module("map", "get_all_plsno")));
                  for (const [k1, v1] of r.entries(a1)) {
                    r.assign(r.slot(s, ["pl"]), v1);
                    if (r.truth((await r.module("map", "check_can_enter", r.get(s, "pl"))))) {
                      await r.write("<option value=\"");
                      await r.write(r.text(r.get(s, "pl")));
                      await r.write("\" ");
                      if (r.truth(r.equal(r.get(r.get(s, "nowmerc"), "pls"), r.get(s, "pl")))) {
                        await r.write("selected");
                      }
                      await r.write(">");
                      await r.write(r.text(r.get(r.get(s, "plsinfo"), r.get(s, "pl"))));
                      await r.write("<br />");
                    }
                  }
                }
              }
              await r.write("</select>\r\n<input type=\"button\" style=\"width:45px\" onclick=\"$('mode').value='special';$('command').value='skill435_special';$('subcmd').value='action435';$('skillpara1').value=3;$('skillpara2').value=");
              await r.write(r.text(r.get(s, "i")));
              await r.write(";$('skillpara3').value=$('skill435_movepls').value;postCmd('gamecmd','command.php');this.disabled=true;\" value=\"移动\">\r\n</td></tr></table>\r\n</span>\r\n</td>\r\n</tr>\r\n<tr>\r\n<td class=\"b2\" height=20px>预付工资</td>\r\n<td class=\"b3\" colspan=3>\r\n<span style=\"text-align:left; display:inline-block;\">\r\n<table><tr><td>\r\n预付工资以防意外金钱不足而解雇。<br>\r\n预付<select name=\"skill435_prepay\" id=\"skill435_prepay\">\r\n<option value=\"5\">5<br />\r\n<option value=\"10\">10<br />\r\n<option value=\"15\">15<br />\r\n<option value=\"20\">20<br />\r\n</select>分钟的工资<input type=\"button\" style=\"width:45px\" onclick=\"$('mode').value='special';$('command').value='skill435_special';$('subcmd').value='action435';$('skillpara1').value=4;$('skillpara2').value=");
              await r.write(r.text(r.get(s, "i")));
              await r.write(";$('skillpara3').value=$('skill435_prepay').value;postCmd('gamecmd','command.php');this.disabled=true;\" value=\"预付\">\r\n</td></tr></table>\r\n</span>\r\n</tr>\r\n<tr>\r\n<td class=\"b1\" height=20px>解雇佣兵</td>\r\n<td class=\"b3\" colspan=3>");
              (await r.call("bubblebox_start", (r.text((r.text("id:firemercverify") + r.text(r.get(s, "i")))) + r.text(";height:100;width:300;cancellable:1;margin-top:20px;margin-bottom:20px;margin-left:20px;margin-right:20px;scroll-bar:0;"))));
              await r.write("<table height=100% width=100% CellSpacing=0 CellPadding=0>\r\n<tr><td height=50px colspan=2 class=\"b3\">\r\n你确定要解雇佣兵<span class=\"yellow b\">");
              await r.write(r.text(r.get(r.get(s, "nowmerc"), "name")));
              await r.write("</span>吗？\r\n</td></tr>\r\n<tr>\r\n<td width=50% class=\"b3\" height=50px >\r\n<input type=\"button\" style=\"width:80px\" onclick=\"$('mode').value='special';$('command').value='skill435_special';$('subcmd').value='action435';$('skillpara1').value=2;$('skillpara2').value=");
              await r.write(r.text(r.get(s, "i")));
              await r.write(";postCmd('gamecmd','command.php');this.disabled=true;\" value=\"解雇\">\r\n</td>\r\n<td width=50% class=\"b3\" height=50px >\r\n<input type=\"button\" style=\"width:80px\" id=\"z\" value=\"[Z]返回\" onclick=\"bubblebox_hide_all();\">\r\n</td>\r\n</tr></table>");
              (await r.call("bubblebox_end"));
              if (r.truth(r.equal(r.get(r.get(r.get(r.get(s, "skill435_npc"), "sub"), r.get(s, "now_merctype")), "mercfireaction"), 0))) {
                await r.write("解雇后，该佣兵将留在原地。<input type=\"button\" style=\"width:45px; height:20px;\" value=\"解雇\" onclick=\"bubblebox_show('firemercverify");
                await r.write(r.text(r.get(s, "i")));
                await r.write("');\">");
              } else {
                await r.write("解雇后，该佣兵将离开战场。<input type=\"button\" style=\"width:45px; height:20px;\" value=\"解雇\" onclick=\"bubblebox_show('firemercverify");
                await r.write(r.text(r.get(s, "i")));
                await r.write("');\">");
              }
              await r.write("</td>\r\n</tr>");
            }
            await r.write("</table>\r\n<br>");
          }
        } else {
          r.assign(r.slot(s, ["now_mercpid"]), r.int((await r.module("skillbase", "skill_getvalue", 435, (r.text("p") + r.text(r.get(s, "i")))))));
          if (r.truth((r.compare(r.get(s, "now_mercpid"), 0) > 0))) {
            r.assign(r.slot(s, ["nowmerc"]), (await r.module("player", "fetch_playerdata_by_pid", r.get(s, "now_mercpid"))));
            await r.write("<table width=\"300px\" CellPadding=0 CellSpacing=0>\r\n<tr>\r\n<td class=\"b1\" colspan=4>\r\n佣兵信息\r\n</td>\r\n<tr>\r\n<td class=\"b2\" width=60px height=20px>佣兵名称</td>\r\n<td class=\"b3\" ><span class=\"yellow b\">");
            await r.write(r.text(r.get(r.get(s, "nowmerc"), "name")));
            await r.write("</span></td>\r\n</tr>\r\n<tr> \r\n<td class=\"b2\" width=60px height=20px>佣兵状态</td>\r\n<td class=\"b3\" >");
            if (r.truth(r.equal(r.get(s, "now_hirestat"), 2))) {
              r.assign(r.slot(s, ["now_lastsal"]), r.int((await r.module("skillbase", "skill_getvalue", 435, (r.text("l") + r.text(r.get(s, "i")))))));
              r.assign(r.slot(s, ["merc_leave_time"]), (await r.call("date", "H:i:s", r.get(s, "now_lastsal"))));
              await r.write("因为你长期无钱支付工资，该佣兵已经于<span class=\"yellow b\">");
              await r.write(r.text(r.get(s, "merc_leave_time")));
              await r.write("</span>与你解除了雇佣合同。");
            } else {
              await r.write("你主动解雇了该佣兵。");
            }
            await r.write("</td></td></table>\r\n<br>");
          }
        }
      }
    }
  }
  await r.write("<input type=\"button\" class=\"cmdbutton\" onclick=\"$('mode').value='command';$('command').value='menu';postCmd('gamecmd','command.php');this.disabled=true;\" value=\"返回\">\r\n");
return 1;
}
