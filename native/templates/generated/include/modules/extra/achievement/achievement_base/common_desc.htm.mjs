// Generated from include/modules/extra/achievement/achievement_base/common_desc.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  await r.write("<table>\r\n<tr>\r\n<td>\r\n<img src=\"img/ach/");
  await r.write(r.text(r.get(s, "ach_icon")));
  await r.write("\">\r\n</td>\r\n<td class=\"ach_cont\">");
  if (r.truth((r.truth((!r.truth((await r.module("skillbase", "check_skill_info", r.get(s, "achid"), "secret;"))))) || r.truth((!r.truth((!r.truth(r.get(s, "p"))))))))) {
    r.assign(r.slot(s, ["globalflag"]), (await r.module("skillbase", "check_skill_info", r.get(s, "achid"), "global")));
    await r.write("<span class=\"ach_title\" ");
    if (r.truth((r.truth((!r.truth(r.get(s, "globalflag")))) && r.truth(r.get(s, "atitle"))))) {
      await r.write("title=\"");
      await r.write(r.text(r.get(s, "atitle")));
      await r.write("\"");
    }
    await r.write(">\r");
    await r.write(r.text(r.get(s, "stitle")));
    await r.write("</span>\r");
    await r.write(r.text(r.get(s, "ach_state_desc")));
    await r.write("<br>");
    if (r.truth((r.truth((!r.truth(r.get(s, "globalflag")))) || r.truth(r.get(s, "p"))))) {
      await r.write("<span class=\"yellow b\" style=\"font-weight:normal\" ");
      if (r.truth(r.get(s, "ptitle"))) {
        await r.write("title=\"");
        await r.write(r.text(r.get(s, "ptitle")));
        await r.write("\"");
      }
      await r.write(">");
      await r.write(r.text(r.get(s, "proc_words")));
      await r.write("：");
      await r.write(r.text(r.get(s, "p")));
      await r.write(r.text(r.get(s, "unit")));
      await r.write(r.text(r.get(s, "proc_words2")));
      await r.write("</span><br>");
    }
    await r.write("<font color=\"olive\">奖励：</font>");
    await r.write(r.text(r.get(s, "prize_desc")));
    await r.write("<br> \r");
    await r.write(r.text(r.get(s, "ach_desc")));
  } else {
    await r.write("<span class=\"grey b\">\r\n………………？………………\r\n</span>");
  }
  await r.write("</td>\r\n</tr>\r\n</table>");
return 1;
}
