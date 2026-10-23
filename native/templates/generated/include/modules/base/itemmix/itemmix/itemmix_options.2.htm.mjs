// Generated from include/modules/base/itemmix/itemmix/itemmix_options.2.htm; edit source migration/compiler, not generated code.
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
          await r.write("<span style=\"margin-left:10px\">可");
          await r.write(r.text(r.get(s, "mtype")));
          await r.write("合成： </span>");
          r.assign(r.slot(s, ["mt0"]), r.get(r.get(s, "mv"), "type"));
        }
        r.assign(r.slot(s, ["mname"]), (await r.module("itemmain", "parse_itmname_words", r.get(r.get(r.get(s, "mv"), "result"), "0"), 1, 40)));
        await r.write("<div class=\"pack_row\">\r\n<div class=\"cmd_positioner explore_cmd zx_cmd\" style=\"height:35px;\" >\r\n<input type=\"button\" class=\"cmd_button explore_cmd glow_buttons white\"  value=\"");
        await r.write(r.text(r.get(s, "mname")));
        await r.write("\" \r\nonclick=\"$('itemselect').value='");
        await r.write(r.text(r.get(s, "mi")));
        await r.write("';postCmd('gamecmd','command.php',this);\">\r\n</div>\r\n</div>");
      }
    }
  }
return 1;
}
