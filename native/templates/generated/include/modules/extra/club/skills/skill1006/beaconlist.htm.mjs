// Generated from include/modules/extra/club/skills/skill1006/beaconlist.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  r.assign(r.slot(s, ["beacons"]), (await r.module("skill1006", "decode_beacon", r.get(s, "sdata"))));
  if (r.truth((await r.call("is_array", r.get(s, "beacons"))))) {
    {
      const a0 = r.copy(r.get(s, "beacons"));
      for (const [k0, v0] of r.entries(a0)) {
      r.assign(r.slot(s, ["bi"]), k0);
        r.assign(r.slot(s, ["bm"]), v0);
        await r.write("<button type=\"button\" class=\"memory_slot beacon_slot\" onclick=\"$('mode').value='command';$('command').value='beacon");
        await r.write(r.text(r.get(s, "bi")));
        await r.write("';postCmd('gamecmd','command.php');this.disabled=true;\">");
        if (r.truth(((r.get(r.get(s, "bm"), "itm") != null)))) {
          r.assign(r.slot(s, ["bm", "itm"]), (await r.module("itemmain", "parse_itmname_words", r.get(r.get(s, "bm"), "itm"), 1)));
          await r.write("<span class=\"b\">");
          await r.write(r.text(r.get(r.get(s, "bm"), "itm")));
          await r.write("</span>");
        } else {
          if (r.truth(((r.get(r.get(s, "bm"), "Pname") != null)))) {
            if (r.truth((r.truth(r.equal(r.get(r.get(s, "bm"), "smtype"), "enemy")) || r.truth(r.equal(r.get(r.get(s, "bm"), "smtype"), "unknown"))))) {
              if (r.truth((r.truth(r.get(s, "fog")) || r.truth(r.equal(r.get(r.get(s, "bm"), "smtype"), "unknown"))))) {
                await r.write("<span class=\"darkred b\">？？？</span>");
              } else {
                await r.write("<span class=\"darkred b\">");
                await r.write(r.text(r.get(r.get(s, "bm"), "Pname")));
                await r.write("</span>");
              }
            } else {
              if (r.truth(r.equal(r.get(r.get(s, "bm"), "smtype"), "corpse"))) {
                await r.write("<span class=\"darkred b\">");
                await r.write(r.text(r.get(r.get(s, "bm"), "Pname")));
                await r.write("</span>的尸体");
              } else {
                if (r.truth(r.equal(r.get(r.get(s, "bm"), "smtype"), "team"))) {
                  if (r.truth(r.get(s, "fog"))) {
                    await r.write("<span class=\"b\">？？？</span>");
                  } else {
                    await r.write("和<span class=\"darkred b\">");
                    await r.write(r.text(r.get(r.get(s, "bm"), "Pname")));
                    await r.write("</span>打招呼");
                  }
                }
              }
            }
          }
        }
        await r.write(" \r\n</button>");
      }
    }
  }
return 1;
}
