// Generated from include/modules/base/itemmix/itemmix/itemmix_options.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  r.imports(s, "itemmix");
  r.assign(r.slot(s, ["mt0"]), "");
  if (r.truth((await r.call("is_array", r.get(s, "mix_res"))))) {
    {
      const a0 = r.copy(r.get(s, "mix_res"));
      for (const [k0, v0] of r.entries(a0)) {
      r.assign(r.slot(s, ["mi"]), k0);
        r.assign(r.slot(s, ["mv"]), v0);
        if (r.truth((!r.equal(r.get(r.get(s, "mv"), "type"), r.get(s, "mt0"))))) {
          r.assign(r.slot(s, ["mtype"]), r.get(r.get(s, "mix_type"), r.get(r.get(s, "mv"), "type")));
          await r.write("可");
          await r.write(r.text(r.get(s, "mtype")));
          await r.write("合成： <br>");
          r.assign(r.slot(s, ["mt0"]), r.get(r.get(s, "mv"), "type"));
        }
        r.assign(r.slot(s, ["mname"]), (await r.module("itemmain", "parse_itmname_words", r.get(r.get(r.get(s, "mv"), "result"), "0"), 1, 23)));
        await r.write("<input type=\"button\" class=\"cmdbutton\" style=\"width:200\" value=\"");
        await r.write(r.text(r.get(s, "mname")));
        await r.write("\" onclick=\"$('itemselect').value='");
        await r.write(r.text(r.get(s, "mi")));
        await r.write("';postCmd('gamecmd','command.php');this.disabled=true;\"><br>");
      }
    }
  }
return 1;
}
