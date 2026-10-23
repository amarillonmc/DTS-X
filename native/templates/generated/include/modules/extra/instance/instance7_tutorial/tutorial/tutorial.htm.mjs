// Generated from include/modules/extra/instance/instance7_tutorial/tutorial/tutorial.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  r.imports(s, "sys", "player", "tutorial");
  r.list([r.slot(s, ["t_tips"]), r.slot(s, ["t_object"])], (await r.module("tutorial", "init_current_tutorial", 0)));
  await r.write("<br>");
  if (r.truth((r.truth((r.truth((!r.identical((await r.call("strpos", r.get(s, "action"), "corpse")), 0))) && r.truth((!r.identical((await r.call("strpos", r.get(s, "action"), "pacorpse")), 0))))) && r.truth((!r.truth((!r.truth((await r.module("skillbase", "skill_getvalue", 1000, "showtips")))))))))) {
    await r.write("<span class=\"ltvermilion b\">\r");
    await r.write(r.text(r.get(s, "t_tips")));
    await r.write("</span>");
  }
  await r.write("<br/>");
  if (r.truth(r.equal(r.get(s, "t_object"), "continue"))) {
    await r.write("<input type=\"button\" class=\"cmdbutton\" id=\"continue\" value=\"继续…\" onclick=\"$('command').value='continue';postCmd('gamecmd','command.php');this.disabled=true;\">");
  }
  await r.write("<div style=\"");
  if (r.truth(r.equal(r.get(s, "t_object"), "continue"))) {
    await r.write("display:none");
  }
  await r.write("\">");
  if (r.truth((r.truth((r.compare(r.get(s, "state"), 1) >= 0)) && r.truth((r.compare(r.get(s, "state"), 3) <= 0))))) {
    (await r.include(r.template("rest"), s));
  } else {
    if (r.truth(r.get(s, "itms0"))) {
      (await r.include(r.template("MOD_ITEMMAIN_ITEMFIND"), s));
    } else {
      if (r.truth(r.get(s, "cmd"))) {
        await r.write(r.text(r.get(s, "cmd")));
      } else {
        (await r.include(r.template("command"), s));
      }
    }
  }
  await r.write("</div>");
return 1;
}
