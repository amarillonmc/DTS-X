// Generated from include/modules/extra/club/clubbase/club_profile.2.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  r.imports(s, "clubbase");
  if (r.truth((!r.equal(r.get(s, "club"), 0)))) {
    await r.write(r.text(r.get(r.get(s, "clubinfo"), r.get(s, "club"))));
  } else {
    await r.write("<select id=\"clubsel\" name=\"clubsel\" onchange=\"$('mode').value='special';$('command').value=$('clubsel').value;replay_record_DOM_path(this.options[this.selectedIndex]);postCmd('gamecmd','command.php');return false;\" ");
    if (r.truth((r.truth((!r.equal(r.constant("CURSCRIPT"), "game"))) || r.truth((!r.equal(r.get(s, "mode"), "command")))))) {
      await r.write("disabled");
    }
    await r.write(">");
    if (r.truth((await r.call("is_array", (await r.module("clubbase", "get_club_choice_array")))))) {
      {
        const a0 = r.copy((await r.module("clubbase", "get_club_choice_array")));
        for (const [k0, v0] of r.entries(a0)) {
        r.assign(r.slot(s, ["key"]), k0);
          r.assign(r.slot(s, ["value"]), v0);
          await r.write("<option value=\"clubsel");
          await r.write(r.text(r.get(s, "key")));
          await r.write("\"");
          if (r.truth(r.equal(r.get(s, "club"), r.get(s, "key")))) {
            await r.write("selected");
          }
          await r.write(">");
          await r.write(r.text(r.get(r.get(s, "clubinfo"), r.get(s, "value"))));
        }
      }
    }
    await r.write("</select>");
  }
return 1;
}
