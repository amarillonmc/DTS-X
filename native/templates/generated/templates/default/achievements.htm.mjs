// Generated from templates/default/achievements.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  r.imports(s, "sys", "achievement_base");
  (await r.module("achievement_base", "ach_show_init"));
  await r.write("<table>");
  if (r.truth((await r.call("is_array", r.get(s, "ach_list"))))) {
    {
      const a0 = r.copy(r.get(s, "ach_list"));
      for (const [k0, v0] of r.entries(a0)) {
      r.assign(r.slot(s, ["k"]), k0);
        r.assign(r.slot(s, ["v"]), v0);
        (await r.include(r.template("achievement_row"), s));
      }
    }
  }
  await r.write("</table>");
  if (r.truth((!r.truth((!r.truth(r.get(s, "ach_expired_list"))))))) {
    await r.write("<div style=\"height:60px;\">\r\n<button type=\"button\" class=\"b_button bc_black\" style=\"width:300px;margin:15px;\" onclick=\"$('ach_expired_list').style.display='block';this.style.display='none'\">点击查看既往活动成就</button>\r\n</div><div id=\"ach_expired_list\" style=\"display:none\">\r\n<table>");
    if (r.truth((await r.call("is_array", r.get(s, "ach_expired_list"))))) {
      {
        const a1 = r.copy(r.get(s, "ach_expired_list"));
        for (const [k1, v1] of r.entries(a1)) {
        r.assign(r.slot(s, ["k"]), k1);
          r.assign(r.slot(s, ["v"]), v1);
          (await r.include(r.template("achievement_row"), s));
        }
      }
    }
    await r.write("</table>\r\n</div>");
  }
  if (r.truth(r.get(s, "refdaily_flag"))) {
    (await r.call("bubblebox_start", "id:newdailyquest;height:200;width:1060;cancellable:1;"));
    await r.write("<div class=\"subtitle\">获得的每日任务：</div><div>");
    r.assign(r.slot(s, ["showarr"]), (await r.module("achievement_base", "show_achievements_single_type", r.get(s, "u_acharr"), 20)));
    if (r.truth((await r.call("is_array", r.get(s, "showarr"))))) {
      {
        const a2 = r.copy(r.get(s, "showarr"));
        for (const [k2, v2] of r.entries(a2)) {
        r.assign(r.slot(s, ["si"]), k2);
          r.assign(r.slot(s, ["sv"]), v2);
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
    await r.write("</div>\r\n<br>\r\n<button type=\"button\" onclick=\"bubblebox_hide_all();\">关闭</button> 点击气泡框外任意位置也可关闭窗口");
    (await r.call("bubblebox_end"));
    await r.write("<script>bubblebox_show('newdailyquest');</script>");
  }
return 1;
}
