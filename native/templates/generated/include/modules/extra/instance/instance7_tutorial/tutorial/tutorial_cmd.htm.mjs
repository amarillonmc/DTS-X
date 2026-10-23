// Generated from include/modules/extra/instance/instance7_tutorial/tutorial/tutorial_cmd.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  r.imports(s, "sys", "player", "tutorial");
  r.list([r.slot(s, ["t_tips"]), r.slot(s, ["t_object"])], (await r.module("tutorial", "init_current_tutorial")));
  await r.write("<br>");
  if (r.truth((!r.truth((!r.truth((await r.module("skillbase", "skill_getvalue", 1000, "showtips")))))))) {
    await r.write("<span class=\"ltvermilion b\">\r");
    await r.write(r.text(r.get(s, "t_tips")));
    await r.write("</span>");
  }
  await r.write("<br/>");
  (await r.include(r.template(r.get(r.get(s, "uip"), "tutorial_cmd_inner_tpl")), s));
return 1;
}
