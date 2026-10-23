// Generated from include/modules/extra/instance/gtype1/skill495/desc.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  r.imports(s, "skill495");
  r.assign(r.slot(s, ["___TEMP_SKILL_ID"]), 495);
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_START"), s));
  await r.write("<span>\r\n额度\r\n</span>");
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_MID1"), s));
  await r.write("<td class=\"skilldesc_left b3\"><span class=\"skilldesc\">");
  r.assign(r.slot(s, ["clv"]), r.int((await r.module("skillbase", "skill_getvalue", 495, "lvl"))));
  r.assign(r.slot(s, ["rmtlv"]), r.subtract(r.subtract((await r.call("count", r.get(s, "upgradecost"))), 1), r.get(s, "clv")));
  if (r.truth(r.get(s, "rmtlv"))) {
    await r.write("你已被限额了！只有在拾取后总金钱数不超过<span class=\"yellow b\">");
    await r.write(r.text(r.get(r.get(s, "moneylimit"), r.get(s, "clv"))));
    await r.write("</span>时才能拾取金钱<br>\r\n<span class=\"yellow b\">当前还需还款");
    await r.write(r.text(r.get(s, "rmtlv")));
    await r.write("次</span>&nbsp;\r\n消耗<span class=\"yellow b\">");
    await r.write(r.text(r.get(r.get(s, "upgradecost"), r.get(s, "clv"))));
    await r.write("</span>点技能点还款");
  } else {
    await r.write("<span class=\"lime b\">您的欠款已还清，谢谢惠顾！</span>");
  }
  await r.write("</span></td>\r\n<td class=\"skilldesc_right b3\">");
  if (r.truth((!r.identical(r.get(r.get(s, "upgradecost"), r.get(s, "clv")), (-r.number(1)))))) {
    if (r.truth((r.compare(r.get(s, "skillpoint"), r.get(r.get(s, "upgradecost"), r.get(s, "clv"))) >= 0))) {
      await r.write("<input type=\"button\" style=\"width:46px\" onclick=\"$('mode').value='special';$('command').value='skill495_special';$('subcmd').value='upgrade';postCmd('gamecmd','command.php');this.disabled=true;\" value=\"还款\">");
    } else {
      await r.write("<input type=\"button\" style=\"width:46px\" disabled=\"true\" value=\"还款\">");
    }
  }
  await r.write("</td>");
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_MID2"), s));
  if (r.truth((!r.truth(r.get(s, "___TEMP_THIS_SKILL_ACQUIRED"))))) {
    await r.write("<span class=\"yellow b\">\r\n</span>");
  }
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_END"), s));
return 1;
}
