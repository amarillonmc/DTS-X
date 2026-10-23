// Generated from include/modules/extra/instance/instance10_rogue/showroguestage.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  r.imports(s, "instance10");
  r.assign(r.slot(s, ["invscore"]), r.int((await r.module("skillbase", "skill_getvalue", 960, "invscore", r.get(s, "sdata")))));
  r.assign(r.slot(s, ["stage"]), r.int((await r.module("skillbase", "skill_getvalue", 951, "stage", r.get(s, "sdata")))));
  await r.write("<span title=\"当前层数\">第<span class=\"orange b\"> ");
  await r.write(r.text(r.get(s, "stage")));
  await r.write(" </span>层</span>\r\n<br>");
  if (r.truth((r.compare(r.get(s, "invscore"), r.get(r.get(s, "invscore_lvl"), r.get(s, "stage"))) < 0))) {
    await r.write("<span class=\"lime b\" title=\"当前的调查度\">");
    await r.write(r.text(r.get(s, "invscore")));
    await r.write(" / ");
    await r.write(r.text(r.get(r.get(s, "invscore_lvl"), r.get(s, "stage"))));
    await r.write("</span>");
  } else {
    if (r.truth((r.compare(r.get(s, "stage"), 7) < 0))) {
      await r.write("<input type=\"button\" class=\"cmdbutton\" id=\"instance10_nextstage\" value=\"前往下层\" onclick=\"$('mode').value='special';$('command').value='nextstage';postCmd('gamecmd','command.php');this.disabled=true;\">");
    } else {
      await r.write("<span class=\"lime b\">");
      await r.write(r.text(r.get(s, "invscore")));
      await r.write(" / --</span>");
    }
  }
return 1;
}
