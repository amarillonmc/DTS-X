// Generated from templates/default/achievement_row.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  await r.write("<tr>\r\n<td>\r\n<span class=\"subtitle\" align=\"left\">");
  await r.write(r.text(r.get(s, "v")));
  await r.write("</span>");
  if (r.truth((r.truth(((r.get(r.get(s, "ach_available_period"), r.get(s, "k")) != null))) && r.truth((r.compare(r.get(r.get(r.get(s, "ach_available_period"), r.get(s, "k")), "0"), 0) > 0))))) {
    await r.write("开始时间：");
    await r.write(r.text((await r.call("gmdate", "Y-n-j", r.get(r.get(r.get(s, "ach_available_period"), r.get(s, "k")), "0")))));
  }
  await r.write("&nbsp;&nbsp;&nbsp;");
  if (r.truth((r.truth(((r.get(r.get(s, "ach_available_period"), r.get(s, "k")) != null))) && r.truth((r.compare(r.get(r.get(r.get(s, "ach_available_period"), r.get(s, "k")), "1"), 0) > 0))))) {
    await r.write("结束时间：");
    await r.write(r.text((await r.call("gmdate", "Y-n-j", r.get(r.get(r.get(s, "ach_available_period"), r.get(s, "k")), "1")))));
    if (r.truth((r.compare(r.get(r.get(r.get(s, "ach_available_period"), r.get(s, "k")), "1"), r.get(s, "now")) < 0))) {
      await r.write(" <span class=\"red b\">已结束</span>");
    }
  }
  if (r.truth(r.equal(r.get(s, "v"), "日常任务"))) {
    if (r.truth(r.get(s, "curuser"))) {
      if (r.truth((!r.truth(r.get(s, "ff"))))) {
        await r.write("<span class=\"yellow b\">下次可获取每日任务时间：");
        await r.write(r.text(r.get(s, "ftd")));
        await r.write("</span>");
      } else {
        await r.write("<button type=\"button\" class=\"b_button bc_white\" onclick=\"window.location.href='user_profile.php?action=refdaily';this.disabled=true\">点击获得新的每日任务</button>");
      }
    }
    await r.write("<br>");
  }
  await r.write("<div>");
  r.assign(r.slot(s, ["showarr"]), (await r.module("achievement_base", "show_achievements_single_type", r.get(s, "u_acharr"), r.get(s, "k"))));
  if (r.truth((await r.call("is_array", r.get(s, "showarr"))))) {
    {
      const a0 = r.copy(r.get(s, "showarr"));
      for (const [k0, v0] of r.entries(a0)) {
      r.assign(r.slot(s, ["si"]), k0);
        r.assign(r.slot(s, ["sv"]), v0);
        if (r.truth(r.equal(r.modulo(r.get(s, "si"), r.get(s, "ach_show_num_per_row")), 0))) {
          await r.write("<div>");
        }
        await r.write("<div class=\"");
        if (r.truth(r.get(s, "sv"))) {
          await r.write("ach_box");
        } else {
          await r.write("ach_box_empty");
        }
        await r.write("\" align=\"left\" valign=\"top\">\r\n<div>");
        await r.write(r.text(r.get(s, "sv")));
        await r.write("</div>\r\n</div>");
        if (r.truth(r.equal(r.modulo(r.get(s, "si"), r.get(s, "ach_show_num_per_row")), r.subtract(r.get(s, "ach_show_num_per_row"), 1)))) {
          await r.write("</div>");
        }
      }
    }
  }
  await r.write("</div>\r\n</td>\r\n</tr>");
return 1;
}
