// Generated from templates/default/game.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  (await r.include(r.template("header"), s));
  (await r.include(r.template("game_interface"), s));
  (await r.include(r.template("footer"), s));
  if (r.truth((r.truth((r.truth((r.truth((r.truth(r.equal(r.constant("CURSCRIPT"), "game")) && r.truth((!r.truth((await r.call("defined", "IN_REPLAY"))))))) && r.truth((!r.equal(r.get(s, "gametype"), 17))))) && r.truth((r.compare(r.get(s, "hp"), 0) > 0)))) && r.truth((r.compare(r.get(s, "state"), 10) < 0))))) {
    r.assign(r.slot(s, ["rf_command"]), (r.truth((r.truth((r.truth(r.equal(1, r.get(s, "state"))) || r.truth(r.equal(2, r.get(s, "state"))))) || r.truth(r.equal(3, r.get(s, "state"))))) ? "rest" : "enter"));
    await r.write("<script type=\"text/javascript\">\r\njQuery(document).ready(function(){\r\n  $('mode').value='");
    await r.write(r.text(r.get(s, "mode")));
    await r.write("';$('command').value='");
    await r.write(r.text(r.get(s, "rf_command")));
    await r.write("';postCmd('gamecmd','command.php');\r\n});\r\n</script>");
  }
return 1;
}
