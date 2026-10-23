// Generated from include/modules/extra/attr/ex_alternative/use_alternative.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  await r.write("<input type=\"hidden\" id=\"mode\" name=\"mode\" value=\"command\">\r\n<input type=\"hidden\" id=\"command\" name=\"command\" value=\"itm");
  await r.write(r.text(r.get(r.get(s, "theitem"), "itmn")));
  await r.write("\">\r\n<input type=\"hidden\" id=\"alternative_choice\" name=\"alternative_choice\" value=\"0\">");
  r.assign(r.slot(s, ["atype"]), r.int((await r.module("itemmain", "check_in_itmsk", "^atype", r.get(s, "itmsk")))));
  r.assign(r.slot(s, ["altname"]), r.get(r.array([[r.APPEND, "类别"], [r.APPEND, "名称"], [r.APPEND, "属性"]]), r.get(s, "atype")));
  await r.write("你要将<span class=\"yellow b\">");
  await r.write(r.text(r.get(r.get(s, "theitem"), "itm")));
  await r.write("</span>作为哪种");
  await r.write(r.text(r.get(s, "altname")));
  await r.write("使用？<br><br>");
  r.assign(r.slot(s, ["ahid"]), r.int((await r.module("itemmain", "check_in_itmsk", "^ahid", r.get(r.get(s, "theitem"), "itmsk")))));
  r.assign(r.slot(s, ["rand"]), (r.truth(r.equal(r.get(s, "ahid"), 2)) ? 1 : 0));
  r.assign(r.slot(s, ["altlist"]), (await r.module("ex_alternative", "get_altlist", r.get(r.get(s, "theitem"), "itmsk"), r.get(s, "rand"))));
  r.assign(r.slot(s, ["key"]), r.get(r.array([[r.APPEND, "itmk"], [r.APPEND, "itm"], [r.APPEND, "itmsk"]]), r.get(s, "atype")));
  r.assign(r.slot(s, ["altwords"]), (await r.module("ex_alternative", "get_altwords", r.get(r.get(s, "theitem"), r.get(s, "key")), r.get(s, "atype"), 0, r.get(s, "ahid"))));
  await r.write("<input type=\"button\" class=\"cmdbutton\" value=\"");
  await r.write(r.text(r.get(s, "altwords")));
  await r.write("\" onclick=\"$('alternative_choice').value='1';postCmd('gamecmd','command.php');this.disabled=true;\">");
  if (r.truth((await r.call("is_array", r.get(s, "altlist"))))) {
    {
      const a0 = r.copy(r.get(s, "altlist"));
      for (const [k0, v0] of r.entries(a0)) {
      r.assign(r.slot(s, ["k"]), k0);
        r.assign(r.slot(s, ["i"]), v0);
        r.assign(r.slot(s, ["altwords"]), (await r.module("ex_alternative", "get_altwords", r.get(s, "i"), r.get(s, "atype"), 0, r.get(s, "ahid"))));
        r.assign(r.slot(s, ["id"]), r.add(r.get(s, "k"), 2));
        await r.write("<input type=\"button\" class=\"cmdbutton\" value=\"");
        await r.write(r.text(r.get(s, "altwords")));
        await r.write("\" onclick=\"$('alternative_choice').value='");
        await r.write(r.text(r.get(s, "id")));
        await r.write("';postCmd('gamecmd','command.php');this.disabled=true;\">");
      }
    }
  }
  await r.write("<input type=\"button\" class=\"cmdbutton\"  id=\"x\" value=\"[X]返回\" onclick=\"$('command').value='menu'; postCmd('gamecmd','command.php');this.disabled=true;\">");
return 1;
}
