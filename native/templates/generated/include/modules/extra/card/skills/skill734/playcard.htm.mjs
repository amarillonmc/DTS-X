// Generated from include/modules/extra/card/skills/skill734/playcard.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  r.imports(s, "player", "cardbase");
  await r.write("<input type=\"hidden\" name=\"mode\" value=\"special\">\r\n<input type=\"hidden\" id=\"command\" name=\"command\" value=\"skill734_special\">\r\n<input type=\"hidden\" id=\"skill734_opid\" name=\"skill734_opid\" value=\"1000\">\r\n<table>\r\n<tr>\r\n<th>\r\n你的卡片：<br>");
  r.assign(r.slot(s, ["pa_step"]), r.int((await r.module("skillbase", "skill_getvalue", 734, "step", r.get(s, "sdata")))));
  r.assign(r.slot(s, ["pa_cards"]), (await r.call("gdecode", (await r.module("skillbase", "skill_getvalue", 734, "cards", r.get(s, "sdata"))), 1)));
  if (r.truth((await r.call("is_array", r.get(s, "pa_cards"))))) {
    {
      const a0 = r.copy(r.get(s, "pa_cards"));
      for (const [k0, v0] of r.entries(a0)) {
        r.assign(r.slot(s, ["v"]), v0);
        await r.write("<span class=\"");
        await r.write(r.text(r.get(r.get(s, "card_rarecolor"), r.get(r.get(r.get(s, "cards"), r.get(r.get(s, "v"), "cid")), "rare"))));
        await r.write("\">【");
        await r.write(r.text(r.get(r.get(r.get(s, "cards"), r.get(r.get(s, "v"), "cid")), "name")));
        await r.write(" ");
        await r.write(r.text(r.get(r.get(r.get(s, "cards"), r.get(r.get(s, "v"), "cid")), "rare")));
        await r.write("】");
        if (r.truth(((r.get(r.get(s, "v"), "open") != null)))) {
          await r.write("（明牌）");
        }
        await r.write("</span><br>");
      }
    }
  }
  await r.write("</th>\r\n<th>\r\n对手的卡片：<br>");
  r.assign(r.slot(s, ["pd_cards"]), (await r.call("gdecode", (await r.module("skillbase", "skill_getvalue", 734, "cards_op", r.get(s, "sdata"))), 1)));
  if (r.truth((await r.call("is_array", r.get(s, "pd_cards"))))) {
    {
      const a1 = r.copy(r.get(s, "pd_cards"));
      for (const [k1, v1] of r.entries(a1)) {
        r.assign(r.slot(s, ["v"]), v1);
        if (r.truth(((r.get(r.get(s, "v"), "open") != null)))) {
          await r.write("<span class=\"");
          await r.write(r.text(r.get(r.get(s, "card_rarecolor"), r.get(r.get(r.get(s, "cards"), r.get(r.get(s, "v"), "cid")), "rare"))));
          await r.write("\">【");
          await r.write(r.text(r.get(r.get(r.get(s, "cards"), r.get(r.get(s, "v"), "cid")), "name")));
          await r.write(" ");
          await r.write(r.text(r.get(r.get(r.get(s, "cards"), r.get(r.get(s, "v"), "cid")), "rare")));
          await r.write("】</span><br>");
        } else {
          await r.write("<span class=\"grey b\">【未知】</span><br>");
        }
      }
    }
  }
  await r.write("</th>\r\n</tr>");
  if (r.truth(r.equal(r.get(s, "pa_step"), 2))) {
    r.assign(r.slot(s, ["s"]), 0);
    await r.write("<tr>\r\n<th>\r\n你的出牌：<br>");
    if (r.truth((await r.call("is_array", r.get(s, "pa_cards"))))) {
      {
        const a2 = r.copy(r.get(s, "pa_cards"));
        for (const [k2, v2] of r.entries(a2)) {
          r.assign(r.slot(s, ["v"]), v2);
          if (r.truth(((r.get(r.get(s, "v"), "played") != null)))) {
            await r.write("<span class=\"");
            await r.write(r.text(r.get(r.get(s, "card_rarecolor"), r.get(r.get(r.get(s, "cards"), r.get(r.get(s, "v"), "cid")), "rare"))));
            await r.write("\">【");
            await r.write(r.text(r.get(r.get(r.get(s, "cards"), r.get(r.get(s, "v"), "cid")), "name")));
            await r.write(" ");
            await r.write(r.text(r.get(r.get(r.get(s, "cards"), r.get(r.get(s, "v"), "cid")), "rare")));
            await r.write("】");
            if (r.truth(((r.get(r.get(s, "v"), "open") != null)))) {
              await r.write("（明牌）");
            }
            await r.write("</span><br>");
          }
        }
      }
    }
    await r.write("</th>\r\n<th>\r\n对手的出牌：<br>");
    if (r.truth((await r.call("is_array", r.get(s, "pd_cards"))))) {
      {
        const a3 = r.copy(r.get(s, "pd_cards"));
        for (const [k3, v3] of r.entries(a3)) {
          r.assign(r.slot(s, ["v"]), v3);
          if (r.truth(((r.get(r.get(s, "v"), "played") != null)))) {
            if (r.truth(((r.get(r.get(s, "v"), "open") != null)))) {
              await r.write("<span class=\"");
              await r.write(r.text(r.get(r.get(s, "card_rarecolor"), r.get(r.get(r.get(s, "cards"), r.get(r.get(s, "v"), "cid")), "rare"))));
              await r.write("\">【");
              await r.write(r.text(r.get(r.get(r.get(s, "cards"), r.get(r.get(s, "v"), "cid")), "name")));
              await r.write(" ");
              await r.write(r.text(r.get(r.get(r.get(s, "cards"), r.get(r.get(s, "v"), "cid")), "rare")));
              await r.write("】</span><br>");
            } else {
              await r.write("<span class=\"grey b\">【未知】</span><br>");
            }
          }
        }
      }
    }
    await r.write("</th>\r\n</tr>");
  }
  await r.write("</table>\r\n<br>要出的牌：<br>");
  if (r.truth((await r.call("is_array", (await r.call("range", 1, 3)))))) {
    {
      const a4 = r.copy((await r.call("range", 1, 3)));
      for (const [k4, v4] of r.entries(a4)) {
        r.assign(r.slot(s, ["i"]), v4);
        r.assign(r.slot(s, ["flag"]), 0);
        await r.write("<select name=\"skill734_card");
        await r.write(r.text(r.get(s, "i")));
        await r.write("\" id=\"skill734_card");
        await r.write(r.text(r.get(s, "i")));
        await r.write("\" style=\"width:160px\">");
        if (r.truth((await r.call("is_array", (await r.call("range", 1, 5)))))) {
          {
            const a5 = r.copy((await r.call("range", 1, 5)));
            for (const [k5, v5] of r.entries(a5)) {
              r.assign(r.slot(s, ["k"]), v5);
              if (r.truth(r.equal(r.get(s, "pa_step"), 1))) {
                await r.write("<option value=\"");
                await r.write(r.text(r.get(s, "k")));
                await r.write("\" ");
                if (r.truth(r.equal(r.get(s, "k"), r.get(s, "i")))) {
                  await r.write("selected");
                }
                await r.write(">【");
                await r.write(r.text(r.get(r.get(r.get(s, "cards"), r.get(r.get(r.get(s, "pa_cards"), r.get(s, "k")), "cid")), "name")));
                await r.write(" ");
                await r.write(r.text(r.get(r.get(r.get(s, "cards"), r.get(r.get(r.get(s, "pa_cards"), r.get(s, "k")), "cid")), "rare")));
                await r.write("】<br />");
              } else {
                if (r.truth((r.truth(r.equal(r.get(s, "pa_step"), 2)) && r.truth(((r.get(r.get(r.get(s, "pa_cards"), r.get(s, "k")), "played") != null)))))) {
                  await r.write("<option value=\"");
                  await r.write(r.text(r.get(s, "k")));
                  await r.write("\" ");
                  if (r.truth((r.truth((r.compare(r.get(s, "k"), r.get(s, "s")) > 0)) && r.truth((!r.truth(r.get(s, "flag"))))))) {
                    r.assign(r.slot(s, ["flag"]), 1);
                    r.assign(r.slot(s, ["s"]), r.get(s, "k"));
                    await r.write("selected");
                  }
                  await r.write(">【");
                  await r.write(r.text(r.get(r.get(r.get(s, "cards"), r.get(r.get(r.get(s, "pa_cards"), r.get(s, "k")), "cid")), "name")));
                  await r.write(" ");
                  await r.write(r.text(r.get(r.get(r.get(s, "cards"), r.get(r.get(r.get(s, "pa_cards"), r.get(s, "k")), "cid")), "rare")));
                  await r.write("】<br />");
                }
              }
            }
          }
        }
        await r.write("</select>");
        if (r.truth((r.truth(r.equal(r.get(s, "pa_step"), 1)) && r.truth(r.equal(r.get(s, "i"), 1))))) {
          await r.write("（这张牌会变为明牌）");
        }
        await r.write("<br>");
      }
    }
  }
  await r.write("<br>\r\n<input type=\"button\" class=\"cmdbutton\" id=\"z\" value=\"[Z]提交\" onclick=\"postCmd('gamecmd','command.php');this.disabled=true;\">\r\n<input type=\"button\" class=\"cmdbutton\" id=\"x\" value=\"[X]返回\" onclick=\"$('command').value='menu';postCmd('gamecmd','command.php');this.disabled=true;\">\r\n");
return 1;
}
