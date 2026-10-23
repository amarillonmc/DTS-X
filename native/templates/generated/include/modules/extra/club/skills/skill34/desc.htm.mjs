// Generated from include/modules/extra/club/skills/skill34/desc.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  r.imports(s, "skill34");
  r.imports(s, "itemmain");
  r.assign(r.slot(s, ["___TEMP_SKILL_ID"]), 34);
  r.assign(r.slot(s, ["nchoice"]), (await r.module("skillbase", "skill_getvalue", 34, "choice")));
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_START"), s));
  await r.write("<span>\r\n百战\r\n</span>");
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_MID1"), s));
  await r.write("<td class=\"skilldesc_left b3\"><span class=\"skilldesc\">\r\n选择任一单体减半防御属性，你视为具有它。<br>\r\n当前选择是：<span class=\"yellow b\">");
  if (r.truth((!r.equal(r.get(s, "nchoice"), "")))) {
    await r.write(r.text(r.get(r.get(s, "itemspkinfo"), r.get(s, "nchoice"))));
  } else {
    await r.write("无");
  }
  await r.write("</span>\r\n&nbsp;\r\n变更选择为：\r\n<select name=\"skill34_choice\" id=\"skill34_choice\" onchange=\"$('mode').value='special';$('command').value='skill34_special';$('subcmd').value='upgrade';$('skillpara1').value=$('skill34_choice').value;postCmd('gamecmd','command.php');this.disabled=true;\">");
  if (r.truth(r.equal(r.get(s, "nchoice"), ""))) {
    await r.write("<option value=\"\" selected>无<br />");
  }
  if (r.truth((await r.call("is_array", (await r.module("skill34", "get_avaliable_attr")))))) {
    {
      const a0 = r.copy((await r.module("skill34", "get_avaliable_attr")));
      for (const [k0, v0] of r.entries(a0)) {
        r.assign(r.slot(s, ["key"]), v0);
        if (r.truth((!r.equal(r.get(s, "key"), r.get(s, "nchoice"))))) {
          await r.write("<option value=\"");
          await r.write(r.text(r.get(s, "key")));
          await r.write("\">");
          await r.write(r.text(r.get(r.get(s, "itemspkinfo"), r.get(s, "key"))));
          await r.write("<br />");
        } else {
          await r.write("<option value=\"");
          await r.write(r.text(r.get(s, "key")));
          await r.write("\" selected>");
          await r.write(r.text(r.get(r.get(s, "itemspkinfo"), r.get(s, "key"))));
          await r.write("<br />");
        }
      }
    }
  }
  await r.write("</select>\r\n&nbsp;\r\n可随时改变\r\n<br>\r\n</span></td>\r\n<td class=\"skilldesc_right b3\">\r\n</td>");
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_MID2"), s));
  if (r.truth((!r.truth(r.get(s, "___TEMP_THIS_SKILL_ACQUIRED"))))) {
    await r.write("<span class=\"yellow b\">\r\n18级时解锁\r\n</span>");
  }
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_END"), s));
return 1;
}
