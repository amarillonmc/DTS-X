// Generated from include/modules/extra/searchmemory/smemorylist.2.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  await r.write("<div class=\"cmd_row\" style=\"height:110px;width:340px;text-align:center;\">");
  r.assign(r.slot(s, ["tmp_sm_i"]), 0);
  r.assign(r.slot(s, ["sm_count"]), (await r.call("count", r.get(s, "searchmemory"))));
  if (r.truth((await r.call("is_array", r.get(s, "searchmemory"))))) {
    {
      const a0 = r.copy(r.get(s, "searchmemory"));
      for (const [k0, v0] of r.entries(a0)) {
      r.assign(r.slot(s, ["smn"]), k0);
        r.assign(r.slot(s, ["sm"]), v0);
        r.post(r.slot(s, ["tmp_sm_i"]), 1);
        await r.write("<div class=\"cmd_positioner searchmemory_cmd\">\r\n<div class=\"searchmemory_info\">");
        if (r.truth(((r.get(r.get(s, "sm"), "itm") != null)))) {
          r.assign(r.slot(s, ["sm", "itm"]), (await r.module("itemmain", "parse_itmname_words", r.get(r.get(s, "sm"), "itm"), 1, 13)));
          await r.write("<span class=\"item\">");
          await r.write(r.text(r.get(r.get(s, "sm"), "itm")));
          await r.write("</span>");
        } else {
          if (r.truth(((r.get(r.get(s, "sm"), "Pname") != null)))) {
            r.assign(r.slot(s, ["sm", "Pname"]), (await r.module("itemmain", "parse_itmname_words", r.get(r.get(s, "sm"), "Pname"), 1, 13)));
            if (r.truth(r.equal(r.get(r.get(s, "sm"), "smtype"), "enemy"))) {
              await r.write("<span class=\"danger\">");
              if (r.truth(r.get(s, "fog"))) {
                await r.write("？？？");
              } else {
                await r.write(r.text(r.get(r.get(s, "sm"), "Pname")));
              }
              await r.write("</span>");
            } else {
              if (r.truth(r.equal(r.get(r.get(s, "sm"), "smtype"), "corpse"))) {
                await r.write("<span class=\"corpse\">");
                await r.write(r.text(r.get(r.get(s, "sm"), "Pname")));
                await r.write("</span>");
              } else {
                if (r.truth(r.equal(r.get(r.get(s, "sm"), "smtype"), "team"))) {
                  if (r.truth(r.get(s, "fog"))) {
                    await r.write("<span class=\"danger\">？？？</span>");
                  } else {
                    await r.write("<span class=\"safe\">");
                    await r.write(r.text(r.get(r.get(s, "sm"), "Pname")));
                    await r.write("</span>");
                  }
                }
              }
            }
          }
        }
        await r.write("</div>\r\n<input type=\"button\" class=\"cmd_button searchmemory_cmd glow_buttons white\" ");
        if (r.truth(((r.get(r.get(s, "sm"), "itm") != null)))) {
          await r.write("value=\"获取\"");
        } else {
          if (r.truth(((r.get(r.get(s, "sm"), "Pname") != null)))) {
            if (r.truth(r.equal(r.get(r.get(s, "sm"), "smtype"), "enemy"))) {
              if (r.truth(r.get(s, "fog"))) {
                await r.write("value=\"再探\"");
              } else {
                await r.write("value=\"迎战\"");
              }
            } else {
              if (r.truth(r.equal(r.get(r.get(s, "sm"), "smtype"), "corpse"))) {
                await r.write("value=\"检查尸体\"");
              } else {
                if (r.truth(r.equal(r.get(r.get(s, "sm"), "smtype"), "team"))) {
                  if (r.truth(r.get(s, "fog"))) {
                    await r.write("value=\"再探\"");
                  } else {
                    await r.write("value=\"问候\"");
                  }
                }
              }
            }
          }
        }
        await r.write(" \r\nonclick=\"$('mode').value='command';$('command').value='memory");
        await r.write(r.text(r.get(s, "smn")));
        await r.write("';postCmd('gamecmd','command.php',this);\">\r\n</div>");
      }
    }
  }
  await r.write("</div>");
return 1;
}
