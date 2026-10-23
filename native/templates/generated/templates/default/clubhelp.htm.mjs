// Generated from templates/default/clubhelp.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  if (r.truth((await r.call("is_array", r.get(s, "tmp_clublist"))))) {
    {
      const a0 = r.copy(r.get(s, "tmp_clublist"));
      for (const [k0, v0] of r.entries(a0)) {
        r.assign(r.slot(s, ["nowclub"]), v0);
        r.assign(r.slot(s, ["sdata"]), (await r.module("player", "create_dummy_playerdata")));
        (await r.module("clubbase", "club_acquire", r.get(s, "nowclub"), r.get(s, "sdata")));
        r.assign(r.slot(s, ["acquired_list"]), r.get(r.get(s, "sdata"), "acquired_list"));
        r.assign(r.slot(s, ["parameter_list"]), r.get(r.get(s, "sdata"), "parameter_list"));
        (await r.include(r.template("MOD_CLUBBASE_SKILLPAGE"), s));
      }
    }
  }
  await r.write("<table cellSpacing=0 cellPadding=0 width=\"700px\">\r\n<tr>\r\n<td class=\"b1\" height=20px>\r\n<span>称号名</span>\r\n</td>\r\n<td class=\"b1\">\r\n<span>种类</span>\r\n</td>\r\n<td class=\"b1\">\r\n<span>基本特性</span></td>\r\n<td class=\"b1\">\r\n<span>技能</span>\r\n</td>\r\n</tr>");
  if (r.truth((await r.call("is_array", r.get(s, "tmp_clublist"))))) {
    {
      const a1 = r.copy(r.get(s, "tmp_clublist"));
      for (const [k1, v1] of r.entries(a1)) {
        r.assign(r.slot(s, ["clubn"]), v1);
        await r.write("<tr>\r\n<td class=\"b2\" height=24px>\r\n<span>");
        await r.write(r.text(r.get(r.get(s, "clubinfo"), r.get(s, "clubn"))));
        await r.write("</span>\r\n</td>\r\n<td class=\"b3\">");
        if (r.truth(r.get(r.get(r.get(s, "clublist"), r.get(s, "clubn")), "type"))) {
          await r.write("<span>特殊</span>");
        } else {
          await r.write("<span>一般</span>");
        }
        await r.write("</td>\r\n<td class=\"b3\" style=\"padding:5px\">\r\n<span>");
        await r.write(r.text(r.get(r.get(s, "clubdesc_h"), r.get(s, "clubn"))));
        await r.write("</span>\r\n</td>\r\n<td class=\"b3\" width=\"125px\">\r\n<span>\r\n<input class=\"bigbutton\" onclick=\"bubblebox_show('club");
        await r.write(r.text(r.get(s, "clubn")));
        await r.write("');\" value=\"点我查看称号技能\" type=\"button\">\r\n</span>\r\n</td>\r\n</tr>");
      }
    }
  }
  await r.write("</table>\r\n<br>\r\n<br>\r\n<p>\r\n※ 对涉及“眩晕敌人”技能的解释：眩晕状态与黑衣组织的“衰弱”、边缘行者的“EMP”类似，是一个时效性负面状态：它无法被解除，只能等待效果时间过去自行消失。<br>\r\n眩晕期间，角色无法进行任何行动或战斗（包括反击敌人的攻击）。出于平衡原因，“死斗”模式下眩晕时长为面板数值的三分之一。<br>\r\n<BR>\r\n※ 宝石骑士技能中，每颗宝石/方块都会为装备增加一定效果值和耐久值（无限耐久装备只增加效果值）。如成功获得属性则获得少量经验，而未能成功获得属性则获得较多经验和一些怒气。\r\n各类方块/宝石可以为装备添加的属性如下：</p><br>");
  r.imports(s, "itemmain", "skill23");
  await r.write("<table cellSpacing=0 cellPadding=0>\r\n<tr>\r\n<td class=\"b1\" height=24px>\r\n<span>道具名称</span>\r\n</td>\r\n<td class=\"b1\">\r\n<span>镶嵌至武器上的效果</span>\r\n</td>\r\n<td class=\"b1\">\r\n<span>镶嵌至防具上的效果</span>\r\n</td>\r\n</tr>");
  if (r.truth((await r.call("is_array", r.get(s, "bufflist23"))))) {
    {
      const a2 = r.copy(r.get(s, "bufflist23"));
      for (const [k2, v2] of r.entries(a2)) {
      r.assign(r.slot(s, ["bl23k"]), k2);
        r.assign(r.slot(s, ["bl23v"]), v2);
        await r.write("<tr>\r\n<td class=\"b2\" height=24px>\r\n<span>");
        await r.write(r.text(r.get(s, "bl23k")));
        await r.write("</span>\r\n</td>\r\n<td class=\"b3\" style=\"max-width:300px;padding:5px\">\r\n<span>");
        if (r.truth((await r.call("is_array", r.get(r.get(s, "bl23v"), "W"))))) {
          {
            const a3 = r.copy(r.get(r.get(s, "bl23v"), "W"));
            for (const [k3, v3] of r.entries(a3)) {
              r.assign(r.slot(s, ["bl23vs"]), v3);
              await r.write(r.text(r.get(r.get(s, "bl23vs"), "0")));
              await r.write("%");
              await r.write(r.text(r.get(r.get(s, "itemspkinfo"), r.get(r.get(s, "bl23vs"), "1"))));
              await r.write(" ");
            }
          }
        }
        await r.write("</span>\r\n</td>\r\n<td class=\"b3\" style=\"max-width:300px;padding:5px\">\r\n<span>");
        if (r.truth((await r.call("is_array", r.get(r.get(s, "bl23v"), "D"))))) {
          {
            const a4 = r.copy(r.get(r.get(s, "bl23v"), "D"));
            for (const [k4, v4] of r.entries(a4)) {
              r.assign(r.slot(s, ["bl23vs"]), v4);
              await r.write(r.text(r.get(r.get(s, "bl23vs"), "0")));
              await r.write("%");
              await r.write(r.text(r.get(r.get(s, "itemspkinfo"), r.get(r.get(s, "bl23vs"), "1"))));
              await r.write(" ");
            }
          }
        }
        await r.write("</span>\r\n</td>\r\n</tr>");
      }
    }
  }
  await r.write("</table>");
return 1;
}
