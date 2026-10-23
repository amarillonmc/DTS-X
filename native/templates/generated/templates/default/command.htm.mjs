// Generated from templates/default/command.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  await r.write("<input type=\"hidden\" id=\"mode\" name=\"mode\" value=\"command\">\r\n<input type=\"hidden\" id=\"command\" name=\"command\" value=\"menu\">\r\n<input type=\"hidden\" id=\"subcmd\" name=\"subcmd\" value=\"\">\r\n\r\n现在想要做什么？<br /><br />");
  if (r.truth((await r.call("defined", "MOD_EXPLORE")))) {
    (await r.include(r.template("MOD_EXPLORE_EXPLORE"), s));
  }
  if (r.truth((await r.call("defined", "MOD_SEARCHMEMORY")))) {
    (await r.include(r.template("MOD_SEARCHMEMORY_SMEMORYLIST"), s));
  }
  await r.write("<br />");
  r.assign(r.slot(s, ["hotkeys"]), r.array([[r.APPEND, ""], [r.APPEND, "a"], [r.APPEND, "s"], [r.APPEND, "d"], [r.APPEND, "q"], [r.APPEND, "w"], [r.APPEND, "e"]]));
  r.assign(r.slot(s, ["hotkeysu"]), r.array([[r.APPEND, ""], [r.APPEND, "A"], [r.APPEND, "S"], [r.APPEND, "D"], [r.APPEND, "Q"], [r.APPEND, "W"], [r.APPEND, "E"]]));
  r.assign(r.slot(s, ["loopn"]), r.array([[r.APPEND, 1], [r.APPEND, 2], [r.APPEND, 3], [r.APPEND, 4], [r.APPEND, 5], [r.APPEND, 6]]));
  if (r.truth((await r.call("is_array", r.get(s, "loopn"))))) {
    {
      const a0 = r.copy(r.get(s, "loopn"));
      for (const [k0, v0] of r.entries(a0)) {
        r.assign(r.slot(s, ["n"]), v0);
        if (r.truth((!r.truth((!r.truth(r.get(s, (r.text("itms") + r.text(r.get(s, "n")))))))))) {
          await r.write("<div class=\"itmsingle\">\r\n<input type=\"button\" id=\"");
          await r.write(r.text(r.get(r.get(s, "hotkeys"), r.get(s, "n"))));
          await r.write(r.text(r.get(r.get(s, "hotkeys"), r.get(s, "n"))));
          await r.write("\" class=\"cmdbutton\" ");
          if (r.truth((await r.module("itemmain", "is_equipable", r.get(s, (r.text("itmk") + r.text(r.get(s, "n")))))))) {
            await r.write("value=\"[");
            await r.write(r.text(r.get(r.get(s, "hotkeysu"), r.get(s, "n"))));
            await r.write("]装备\"");
          } else {
            await r.write("value=\"[");
            await r.write(r.text(r.get(r.get(s, "hotkeysu"), r.get(s, "n"))));
            await r.write("]使用\"");
          }
          await r.write(" \r\ntitle=\"");
          await r.write(r.text(r.get(r.get(s, "tpldata"), (r.text((r.text("itm") + r.text(r.get(s, "n")))) + r.text("_itmuse_desc")))));
          await r.write("\"\r\nonclick=\"$('mode').value='command';$('command').value='itm");
          await r.write(r.text(r.get(s, "n")));
          await r.write("';postCmd('gamecmd','command.php');this.disabled=true;\"><span title=\"");
          await r.write(r.text(r.get(r.get(s, "tpldata"), (r.text((r.text("itm") + r.text(r.get(s, "n")))) + r.text("_itmuse_desc")))));
          await r.write("\"><span class=\"yellow b\">");
          await r.write(r.text(r.get(r.get(s, "tpldata"), (r.text((r.text("itm") + r.text(r.get(s, "n")))) + r.text("_words_noelli")))));
          await r.write("</span>/");
          await r.write(r.text(r.get(s, (r.text("itme") + r.text(r.get(s, "n"))))));
          await r.write("/");
          await r.write(r.text(r.get(s, (r.text("itms") + r.text(r.get(s, "n"))))));
          await r.write("</span>\r\n</div>");
        }
      }
    }
  }
  await r.write("<br>\r\n<!--为保证排版，现在所有按钮后面都带一个空格-->");
  if (r.truth((await r.call("defined", "MOD_ITEMMIX")))) {
    (await r.include(r.template("MOD_ITEMMIX_ITEMMIX_CMD"), s));
  }
  await r.write(" ");
  if (r.truth((await r.call("defined", "MOD_ITEMMAIN")))) {
    (await r.include(r.template("MOD_ITEMMAIN_ITMCOMMAND"), s));
  }
  await r.write(" ");
  if (r.truth((await r.call("defined", "MOD_REST")))) {
    (await r.include(r.template("MOD_REST_REST_CMD"), s));
  }
  await r.write(" ");
  if (r.truth((await r.call("defined", "MOD_TEAM")))) {
    (await r.include(r.template("MOD_TEAM_TEAM_COMMAND"), s));
  }
  await r.write(" ");
  if (r.truth((await r.call("defined", "MOD_ITEMSHOP")))) {
    (await r.include(r.template("MOD_ITEMSHOP_ITEMSHOP_CMD"), s));
  }
  await r.write(" ");
  if (r.truth((await r.call("defined", "MOD_CLUBBASE")))) {
    (await r.include(r.template("MOD_CLUBBASE_SKILLPAGE_PROFILE"), s));
  }
  await r.write(" ");
  if (r.truth((await r.call("defined", "MOD_WEPCHANGE")))) {
    (await r.include(r.template("MOD_WEPCHANGE_WEPCHANGE_PROFILE"), s));
  }
  await r.write(" ");
  if (r.truth((await r.call("defined", "MOD_DUALWEP")))) {
    (await r.include(r.template("MOD_DUALWEP_DUALWEP_ATT_METHOD_PROFILE"), s));
  }
  await r.write(" ");
  if (r.truth((await r.call("defined", "MOD_SONG")))) {
    (await r.include(r.template("MOD_SONG_SONG_PROFILE"), s));
  }
  await r.write(" ");
  if (r.truth((await r.call("defined", "MOD_ITEM_RECIPE")))) {
    (await r.include(r.template("MOD_ITEM_RECIPE_RECIPE_PROFILE"), s));
  }
  await r.write(" ");
  if (r.truth((await r.call("defined", "MOD_EX_STORAGE")))) {
    (await r.include(r.template("MOD_EX_STORAGE_STORAGE_PROFILE"), s));
  }
  await r.write(" ");
  if (r.truth((await r.call("defined", "MOD_ITEM_UVO_EXTRA")))) {
    (await r.include(r.template("MOD_ITEM_UVO_EXTRA_UVO_EXTRA_PROFILE"), s));
  }
  await r.write(" \r\n<br>");
  if (r.truth((!r.truth((!r.truth(r.get(r.get(s, "uip"), "cmd_buttons"))))))) {
    if (r.truth((await r.call("is_array", r.get(r.get(s, "uip"), "cmd_buttons"))))) {
      {
        const a1 = r.copy(r.get(r.get(s, "uip"), "cmd_buttons"));
        for (const [k1, v1] of r.entries(a1)) {
          r.assign(r.slot(s, ["b"]), v1);
          if (r.truth(r.equal("<br>", r.get(s, "b")))) {
            await r.write("<br>");
          } else {
            if (r.truth((await r.call("is_string", r.get(s, "b"))))) {
              (await r.include(r.template(r.get(s, "b")), s));
            } else {
              if (r.truth((await r.call("is_array", r.get(s, "b"))))) {
                await r.write("<input type=\"button\" id=\"");
                await r.write(r.text(r.get(r.get(s, "b"), "id")));
                await r.write("\" class=\"cmdbutton\" value=\"");
                await r.write(r.text(r.get(r.get(s, "b"), "value")));
                await r.write("\" onclick=\"");
                await r.write(r.text(r.get(r.get(s, "b"), "onclick")));
                await r.write(";postCmd('gamecmd','command.php',this);\"");
                if (r.truth((!r.truth((!r.truth(r.get(r.get(s, "b"), "style"))))))) {
                  await r.write("style=\"");
                  await r.write(r.text(r.get(r.get(s, "b"), "style")));
                  await r.write("\"");
                }
                await r.write(" ");
                if (r.truth((!r.truth((!r.truth(r.get(r.get(s, "b"), "title"))))))) {
                  await r.write("title=\"");
                  await r.write(r.text(r.get(r.get(s, "b"), "title")));
                  await r.write("\"");
                }
                await r.write(" />");
              }
            }
          }
        }
      }
    }
  }
  await r.write(" ");
  if (r.truth((await r.call("defined", "MOD_CLUBBASE")))) {
    (await r.include(r.template("MOD_CLUBBASE_PROFILESKILLPAGE"), s));
  }
  await r.write(" \r\n<br>");
return 1;
}
