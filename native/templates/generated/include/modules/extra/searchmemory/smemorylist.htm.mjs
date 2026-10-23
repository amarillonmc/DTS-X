// Generated from include/modules/extra/searchmemory/smemorylist.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  if (r.truth((r.truth((!r.truth((!r.truth(r.get(s, "searchmemory")))))) || r.truth((await r.module("searchmemory", "is_searchmemory_extra_displayed")))))) {
    r.list([r.slot(s, ["sm_slots"]), r.slot(s, ["sm_records"])], (await r.module("searchmemory", "searchmemory_display_prepare")));
    if (r.truth((r.truth((!r.truth((!r.truth(r.get(s, "sm_slots")))))) || r.truth((await r.module("searchmemory", "is_searchmemory_extra_displayed")))))) {
      await r.write("<hr>\r\n<div style=\"text-align:center;\">\r\n<span>视野中道具能立刻拿到，但迎战敌人可能被先制。</span><br>");
      if (r.truth((await r.call("defined", "MOD_SKILL1006")))) {
        (await r.include(r.template("MOD_SKILL1006_BEACONLIST"), s));
      }
      if (r.truth((await r.call("is_array", r.get(s, "sm_slots"))))) {
        {
          const a0 = r.copy(r.get(s, "sm_slots"));
          for (const [k0, v0] of r.entries(a0)) {
            r.assign(r.slot(s, ["sm"]), v0);
            await r.write("<button type=\"button\" class=\"memory_slot\" onclick=\"$('mode').value='command';$('command').value='memory");
            await r.write(r.text(r.get(r.get(s, "sm"), "smn")));
            await r.write("';postCmd('gamecmd','command.php');this.disabled=true;\">");
            if (r.truth(((r.get(r.get(s, "sm"), "itm") != null)))) {
              r.assign(r.slot(s, ["sm", "itm"]), (await r.module("itemmain", "parse_itmname_words", r.get(r.get(s, "sm"), "itm"), 1)));
              await r.write("<span class=\"b\">");
              await r.write(r.text(r.get(r.get(s, "sm"), "itm")));
              await r.write("</span>");
            } else {
              if (r.truth(((r.get(r.get(s, "sm"), "Pname") != null)))) {
                if (r.truth((r.truth(r.equal(r.get(r.get(s, "sm"), "smtype"), "enemy")) || r.truth(r.equal(r.get(r.get(s, "sm"), "smtype"), "unknown"))))) {
                  if (r.truth((r.truth(r.get(s, "fog")) || r.truth(r.equal(r.get(r.get(s, "sm"), "smtype"), "unknown"))))) {
                    await r.write("<span class=\"darkred b\">？？？</span>");
                  } else {
                    await r.write("<span class=\"darkred b\">");
                    await r.write(r.text(r.get(r.get(s, "sm"), "Pname")));
                    await r.write("</span>");
                  }
                } else {
                  if (r.truth(r.equal(r.get(r.get(s, "sm"), "smtype"), "corpse"))) {
                    await r.write("<span class=\"darkred b\">");
                    await r.write(r.text(r.get(r.get(s, "sm"), "Pname")));
                    await r.write("</span>的尸体");
                  } else {
                    if (r.truth(r.equal(r.get(r.get(s, "sm"), "smtype"), "team"))) {
                      if (r.truth(r.get(s, "fog"))) {
                        await r.write("<span class=\"b\">？？？</span>");
                      } else {
                        await r.write("和<span class=\"darkred b\">");
                        await r.write(r.text(r.get(r.get(s, "sm"), "Pname")));
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
      await r.write("</div>");
    }
    await r.write(" ");
    if (r.truth((!r.truth((!r.truth(r.get(s, "sm_records"))))))) {
      await r.write("<hr>\r\n<div id=\"sm_record_switch\" style=\"text-align:center;\">\r\n<a id=\"sm_record_open\" onclick=\"this.style.display='none';$('sm_record_shut').style.display='inline';$('sm_record_hidden_box').style.display='block';\">点击以展开记忆列表</a>\r\n<a id=\"sm_record_shut\" style=\"display:none\" onclick=\"this.style.display='none';$('sm_record_open').style.display='inline';$('sm_record_hidden_box').style.display='none';\">关闭记忆列表</a>\r\n</div><div id=\"sm_record_hidden_box\" style=\"display:none;text-align:center;\">\r\n<span>前往以下位置将离开现有视野并执行一次探索。</span><br>");
      if (r.truth((await r.call("is_array", r.get(s, "sm_records"))))) {
        {
          const a1 = r.copy(r.get(s, "sm_records"));
          for (const [k1, v1] of r.entries(a1)) {
            r.assign(r.slot(s, ["sm"]), v1);
            await r.write("<button type=\"button\" class=\"memory_record\" onclick=\"$('mode').value='command';$('command').value='memory");
            await r.write(r.text(r.get(r.get(s, "sm"), "smn")));
            await r.write("';postCmd('gamecmd','command.php');this.disabled=true;\" ");
            if (r.truth((!r.equal(r.get(r.get(s, "sm"), "pls"), r.get(s, "pls"))))) {
              await r.write("disabled");
            }
            await r.write(">");
            if (r.truth(((r.get(r.get(s, "sm"), "itm") != null)))) {
              r.assign(r.slot(s, ["sm", "itm"]), (await r.module("itemmain", "parse_itmname_words", r.get(r.get(s, "sm"), "itm"), 1)));
              await r.write("<span class=\"memory_name b\">");
              await r.write(r.text(r.get(r.get(s, "sm"), "itm")));
              await r.write("</span>");
            } else {
              if (r.truth(((r.get(r.get(s, "sm"), "Pname") != null)))) {
                if (r.truth((r.truth(r.equal(r.get(r.get(s, "sm"), "smtype"), "enemy")) || r.truth(r.equal(r.get(r.get(s, "sm"), "smtype"), "unknown"))))) {
                  if (r.truth(r.equal(r.get(r.get(s, "sm"), "smtype"), "unknown"))) {
                    await r.write("<span class=\"memory_name darkred b\">？？？</span>");
                  } else {
                    await r.write("<span class=\"memory_name darkred b\">");
                    await r.write(r.text(r.get(r.get(s, "sm"), "Pname")));
                    await r.write("</span>");
                  }
                } else {
                  if (r.truth(r.equal(r.get(r.get(s, "sm"), "smtype"), "corpse"))) {
                    await r.write("<span class=\"memory_name darkred b\">");
                    await r.write(r.text(r.get(r.get(s, "sm"), "Pname")));
                    await r.write("</span>的尸体");
                  } else {
                    if (r.truth(r.equal(r.get(r.get(s, "sm"), "smtype"), "team"))) {
                      await r.write("<span class=\"memory_name darkred b\">");
                      await r.write(r.text(r.get(r.get(s, "sm"), "Pname")));
                      await r.write("</span>");
                    }
                  }
                }
              }
            }
            await r.write(" ");
            if (r.truth((!r.equal(r.get(r.get(s, "sm"), "pls"), r.get(s, "pls"))))) {
              await r.write("<br>（<span class=\"yellow\">");
              await r.write(r.text(r.get(r.get(s, "plsinfo"), r.get(r.get(s, "sm"), "pls"))));
              await r.write("</span>）");
            }
            await r.write(" \r\n</button>");
          }
        }
      }
      await r.write("</div>");
    }
  }
return 1;
}
