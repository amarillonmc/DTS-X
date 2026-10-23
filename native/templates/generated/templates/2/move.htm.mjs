// Generated from templates/2/move.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  await r.write("<div style=\"margin-left:5px;\">");
  r.assign(r.slot(s, ["count_plsinfo"]), (await r.call("count", r.get(s, "plsinfo"))));
  r.assign(r.slot(s, ["i"]), 0);
  r.imports(s, "itemshop", "rest");
  if (r.truth((await r.call("is_array", r.get(s, "plsinfo"))))) {
    {
      const a0 = r.copy(r.get(s, "plsinfo"));
      for (const [k0, v0] of r.entries(a0)) {
      r.assign(r.slot(s, ["plsi"]), k0);
        r.assign(r.slot(s, ["plsn"]), v0);
        if (r.truth((!r.truth((await r.module("map", "check_can_enter", r.get(s, "plsi"))))))) {
          await r.write("<input type=\"button\" class=\"move_to_button glow_buttons darkgrey forbidden\" value=\"");
          await r.write(r.text(r.get(s, "plsn")));
          await r.write("\" style=\"background-image:url('img/icons/map_forbidden.png');\">");
        } else {
          if (r.truth(r.equal(r.get(s, "pls"), r.get(s, "plsi")))) {
            await r.write("<input type=\"button\" class=\"move_to_button glow_buttons yellow forbidden");
            if (r.truth((await r.call("in_array", r.get(s, "plsi"), r.get(s, "shops"))))) {
              await r.write(" map_shop");
            } else {
              if (r.truth((await r.call("in_array", r.get(s, "plsi"), r.get(s, "rest_hospital_list"))))) {
                await r.write(" map_rest");
              }
            }
            await r.write("\" value=\"");
            await r.write(r.text(r.get(s, "plsn")));
            await r.write("\">");
          } else {
            await r.write("<input type=\"button\" class=\"move_to_button glow_buttons white");
            if (r.truth((await r.call("in_array", r.get(s, "plsi"), r.get(s, "shops"))))) {
              await r.write(" map_shop");
            } else {
              if (r.truth((await r.call("in_array", r.get(s, "plsi"), r.get(s, "rest_hospital_list"))))) {
                await r.write(" map_rest");
              }
            }
            await r.write("\" value=\"");
            await r.write(r.text(r.get(s, "plsn")));
            await r.write("\" \r\nonclick=\"$('command').value='move';$('moveto').value='");
            await r.write(r.text(r.get(s, "plsi")));
            await r.write("';postCmd('gamecmd','command.php',this);\">");
          }
        }
      }
    }
  }
  await r.write("</div><div class=\"glow_buttons red\" style=\"text-align:center;line-height:35px;width:335px;height:35px;margin:5px 0 0 5px;\" onclick=\"bubblebox_hide_all();\">返回</div>");
return 1;
}
