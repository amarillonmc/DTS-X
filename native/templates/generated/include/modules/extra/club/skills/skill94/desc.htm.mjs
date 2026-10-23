// Generated from include/modules/extra/club/skills/skill94/desc.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  r.imports(s, "skill94");
  r.assign(r.slot(s, ["___TEMP_SKILL_ID"]), 94);
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_START"), s));
  await r.write("<span>\r");
  await r.write(r.text(r.get(r.get(s, "clubskillname"), r.get(s, "___TEMP_SKILL_ID"))));
  await r.write("</span>");
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_MID1"), s));
  await r.write("<td class=\"skilldesc_left b3\"><span class=\"skilldesc\">\r\n你可以演唱自定义的歌曲，作用时间与效果随消耗歌魂增加而增加<br>");
  r.assign(r.slot(s, ["schoice"]), (await r.module("skillbase", "skill_getvalue", 94, "schoice")));
  await r.write("当前自定义歌曲效果为：<br><span class=\"yellow b\">");
  if (r.truth((!r.truth((!r.truth(r.get(s, "schoice"))))))) {
    await r.write(r.text(r.get(r.get(r.get(s, "skill94_song_words"), "1"), r.get(r.get(s, "schoice"), "0"))));
    await r.write("，");
    await r.write(r.text(r.get(r.get(r.get(s, "skill94_song_words"), "2"), r.get(r.get(s, "schoice"), "1"))));
    await r.write("并");
    await r.write(r.text(r.get(r.get(r.get(s, "skill94_song_words"), "3"), r.get(r.get(s, "schoice"), "2"))));
  } else {
    await r.write("无");
  }
  await r.write("</span><br>");
  if (r.truth((await r.call("is_array", (await r.call("range", 1, 3)))))) {
    {
      const a0 = r.copy((await r.call("range", 1, 3)));
      for (const [k0, v0] of r.entries(a0)) {
        r.assign(r.slot(s, ["i"]), v0);
        await r.write("<select name=\"skill94_choice");
        await r.write(r.text(r.get(s, "i")));
        await r.write("\" id=\"skill94_choice");
        await r.write(r.text(r.get(s, "i")));
        await r.write("\" style=\"width:120px\">");
        if (r.truth((await r.call("is_array", (await r.call("range", 1, 3)))))) {
          {
            const a1 = r.copy((await r.call("range", 1, 3)));
            for (const [k1, v1] of r.entries(a1)) {
              r.assign(r.slot(s, ["k"]), v1);
              await r.write("<option value=\"");
              await r.write(r.text(r.get(s, "k")));
              await r.write("\" ");
              if (r.truth(r.equal(r.get(s, "k"), r.get(r.get(s, "schoice"), r.subtract(r.get(s, "i"), 1))))) {
                await r.write("selected");
              }
              await r.write(">");
              await r.write(r.text(r.get(r.get(r.get(s, "skill94_song_words"), r.get(s, "i")), r.get(s, "k"))));
              await r.write("<br />");
            }
          }
        }
        await r.write("</select>");
      }
    }
  }
  await r.write("<br>只能同时存在一种“<span class=\"yellow b\">天籁</span>”增益\r\n</span></td>\r\n<td class=\"skilldesc_right b3\">\r\n<input type=\"button\" style=\"width:46px\" onclick=\"$('mode').value='special';$('command').value='skill94_special';$('subcmd').value='upgrade';$('skillpara1').value=$('skill94_choice1').value;$('skillpara2').value=$('skill94_choice2').value;$('skillpara3').value=$('skill94_choice3').value;postCmd('gamecmd','command.php');this.disabled=true;\" value=\"切换\">\r\n</td>");
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_MID2"), s));
  if (r.truth((!r.truth(r.get(s, "___TEMP_THIS_SKILL_ACQUIRED"))))) {
    await r.write("<span class=\"yellow b\">\r\n17级时解锁\r\n</span>");
  }
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_END"), s));
return 1;
}
