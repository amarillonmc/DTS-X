// Generated from include/modules/base/tactic/tactic_profile_cmd.2.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  r.imports(s, "tactic");
  await r.write("<select id=\"tactic\" name=\"tactic\" onchange=\"$('mode').value='special';$('command').value=$('tactic').value;postCmd('gamecmd','command.php');return false;\" ");
  if (r.truth((r.truth((!r.equal(r.constant("CURSCRIPT"), "game"))) || r.truth((!r.equal(r.get(s, "mode"), "command")))))) {
    await r.write("disabled");
  }
  await r.write(">");
  if (r.truth((await r.call("is_array", r.get(s, "tacinfo"))))) {
    {
      const a0 = r.copy(r.get(s, "tacinfo"));
      for (const [k0, v0] of r.entries(a0)) {
      r.assign(r.slot(s, ["key"]), k0);
        r.assign(r.slot(s, ["value"]), v0);
        if (r.truth((r.truth(r.get(r.get(s, "tactic_player_usable"), r.get(s, "key"))) && r.truth((!r.equal(r.get(s, "value"), "")))))) {
          await r.write("<option value=\"tac");
          await r.write(r.text(r.get(s, "key")));
          await r.write("\"");
          if (r.truth(r.equal(r.get(s, "tactic"), r.get(s, "key")))) {
            await r.write("selected");
          }
          await r.write(">");
          await r.write(r.text(r.get(s, "value")));
        }
      }
    }
  }
  await r.write("</select>");
return 1;
}
