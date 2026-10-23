// Static native page from include/pages/command_help.php. Build-only source translation.
export default async function execute(r, s) {
  if (r.truth((!r.truth(r.get(r.globals, "___IN_HELP"))))) {
    r.exit("Access Denied");
  }
  r.imports(s, "pose", "tactic", "itemmain", "npc");
  if (r.truth((await r.call("defined", "MOD_EX_ALTERNATIVE")))) {
    r.imports(s, "ex_alternative");
  }
  (await r.include("include/itemplace.func.php", s, true));
  r.assign(r.slot(s, ["mixfile"]), (r.text(r.constant("GAME_ROOT")) + r.text("./include/modules/base/itemmix/itemmix/config/itemmix.config.php")));
  (await r.include(r.get(s, "mixfile"), s, false));
  r.assign(r.slot(s, ["writefile"]), (r.text((r.text(r.constant("GAME_ROOT")) + r.text(r.constant("TPLDIR")))) + r.text("/tmp_mixhelp.htm")));
  if (r.truth((r.truth((!r.truth((await r.call("file_exists", r.get(s, "writefile")))))) || r.truth((r.compare((await r.call("filemtime", r.get(s, "mixfile"))), (await r.call("filemtime", r.get(s, "writefile")))) > 0))))) {
    if (r.truth((!r.truth(r.get(s, "iplacedata"))))) {
      (await r.call("init_item_place"));
    }
    r.assign(r.slot(s, ["mixitem"]), r.array([]));
    {
      const a1 = r.copy(r.get(s, "mixinfo"));
      loop0: for (const [k1, v1] of r.entries(a1)) {
        r.assign(r.slot(s, ["mix"]), v1);
        if (r.truth((!r.identical(r.get(r.get(s, "mix"), "class"), "hidden")))) {
          r.assign(r.slot(s, ["mixitmk"]), (await r.module("itemmain", "parse_itmk_words", r.get(r.get(r.get(s, "mix"), "result"), 1), 1)));
          r.assign(r.slot(s, ["mixitmsk"]), "");
          if (r.truth((!r.truth((!r.truth(r.get(r.get(r.get(s, "mix"), "result"), 4))))))) {
            r.assign(r.slot(s, ["mix", "result", 4]), (await r.module("attrbase", "config_process_encode_comp_itmsk", r.get(r.get(r.get(s, "mix"), "result"), 4))));
            r.assign(r.slot(s, ["mixitmsk"]), (await r.module("itemmain", "parse_itmsk_words", r.get(r.get(r.get(s, "mix"), "result"), 4))));
          }
          if (r.truth(r.equal(r.get(s, "mixitmsk"), "--"))) {
            r.assign(r.slot(s, ["mixitmsk"]), "");
          }
          r.assign(r.slot(s, ["resultjwords"]), (await r.call("get_resultjwords", r.get(r.get(s, "mix"), "result"))));
          if (r.truth((!r.truth((!r.truth(r.get(r.get(s, "mix"), "tips"))))))) {
            r.assign(r.slot(s, ["resultjwords"]), (r.text((r.text((r.text("<span class='yellow b'>") + r.text(r.get(r.get(s, "mix"), "tips")))) + r.text("</span><br>"))) + r.text(r.get(s, "resultjwords"))));
          }
          if (r.truth((!r.truth((!r.truth(r.get(r.get(r.get(s, "mix"), "result"), 4))))))) {
            if (r.truth((r.truth((!r.identical((await r.call("strpos", r.get(r.get(r.get(s, "mix"), "result"), 4), "^eqpsk")), false))) || r.truth((!r.identical((await r.call("strpos", r.get(r.get(r.get(s, "mix"), "result"), 4), "^alt")), false)))))) {
              if (r.truth((!r.identical((await r.call("strpos", r.get(r.get(r.get(s, "mix"), "result"), 4), "^alt")), false)))) {
                r.assign(r.slot(s, ["i"]), (await r.call("strpos", r.get(r.get(r.get(s, "mix"), "result"), 4), "^ahid")));
                if (r.truth((!r.identical(false, r.get(s, "i"))))) {
                  r.assign(r.slot(s, ["tmp_ex_alternative_atype"]), 4);
                } else {
                  r.assign(r.slot(s, ["i"]), (await r.call("strpos", r.get(r.get(r.get(s, "mix"), "result"), 4), "^atype")));
                  if (r.truth((!r.identical(false, r.get(s, "i"))))) {
                    r.assign(r.slot(s, ["tmp_ex_alternative_atype"]), r.int((await r.call("substr", r.get(r.get(r.get(s, "mix"), "result"), 4), r.add(r.get(s, "i"), 6), 1))));
                  } else {
                    r.assign(r.slot(s, ["tmp_ex_alternative_atype"]), 0);
                  }
                }
              }
              r.assign(r.slot(s, ["sk_arr"]), (await r.module("itemmain", "get_itmsk_array", r.get(r.get(r.get(s, "mix"), "result"), 4))));
              {
                const a3 = r.copy(r.get(s, "sk_arr"));
                loop2: for (const [k3, v3] of r.entries(a3)) {
                  r.assign(r.slot(s, ["sv"]), v3);
                  if (r.truth((r.truth(r.identical((await r.call("strpos", r.get(s, "sv"), "^eqpsk")), 0)) || r.truth(r.identical((await r.call("strpos", r.get(s, "sv"), "^alt")), 0))))) {
                    if (r.truth(r.get(s, "resultjwords"))) {
                      r.update(r.slot(s, ["resultjwords"]), "concat", "<br>");
                    }
                    r.update(r.slot(s, ["resultjwords"]), "concat", (await r.module("itemmain", "get_itmsk_desc_single", r.get(s, "sv"))));
                  }
                }
              }
            }
          }
          r.assign(r.slot(s, ["mixitem", r.get(r.get(s, "mix"), "class"), r.APPEND]), r.array([["stuff", r.get(r.get(s, "mix"), "stuff")], ["result", r.array([[r.APPEND, r.get(r.get(r.get(s, "mix"), "result"), 0)], [r.APPEND, r.get(s, "mixitmk")], [r.APPEND, r.get(r.get(r.get(s, "mix"), "result"), 2)], [r.APPEND, r.get(r.get(r.get(s, "mix"), "result"), 3)], [r.APPEND, r.get(s, "mixitmsk")]])], ["resultjwords", r.get(s, "resultjwords")]]));
        }
      }
    }
    r.assign(r.slot(s, ["mixclass"]), r.array([["wp", r.array([[r.APPEND, "殴系武器"], [r.APPEND, "yellow b"]])], ["wk", r.array([[r.APPEND, "斩系武器"], [r.APPEND, "yellow b"]])], ["wg", r.array([[r.APPEND, "射系武器"], [r.APPEND, "yellow b"]])], ["wc", r.array([[r.APPEND, "投系武器"], [r.APPEND, "yellow b"]])], ["wd", r.array([[r.APPEND, "爆系武器"], [r.APPEND, "yellow b"]])], ["wf", r.array([[r.APPEND, "灵系武器"], [r.APPEND, "yellow b"]])], ["w", r.array([[r.APPEND, "其他武器"], [r.APPEND, "yellow b"]])], ["d", r.array([[r.APPEND, "防具"], [r.APPEND, "yellow b"]])], ["h", r.array([[r.APPEND, "补给品"], [r.APPEND, "lime b"]])], ["wp_mrm", r.array([[r.APPEND, "殴系武器（人形降临系列）"], [r.APPEND, "yellow b"]])], ["wf_pn", r.array([[r.APPEND, "灵系武器（帕秋莉·诺雷姬系列）"], [r.APPEND, "yellow b"]])], ["ut", r.array([[r.APPEND, "灵系武器（地下系）"], [r.APPEND, "yellow b"]])], ["pokemon", r.array([[r.APPEND, "小黄系武器"], [r.APPEND, "yellow b"]])], ["ocg", r.array([[r.APPEND, "游戏王系武器"], [r.APPEND, "cyan b"]])], ["key", r.array([[r.APPEND, "KEY系道具"], [r.APPEND, "lime b"]])], ["cube", r.array([[r.APPEND, "方块系道具"], [r.APPEND, "yellow b"]])], ["madoka", r.array([[r.APPEND, "最终战术系道具"], [r.APPEND, "yellow b"]])], ["item", r.array([[r.APPEND, "其他道具"], [r.APPEND, "yellow b"]])]]));
    r.assign(r.slot(s, ["mixhelpinfo"]), "");
    {
      const a5 = r.copy(r.get(s, "mixitem"));
      loop4: for (const [k5, v5] of r.entries(a5)) {
      r.assign(r.slot(s, ["class"]), k5);
        r.assign(r.slot(s, ["list"]), v5);
        r.assign(r.slot(s, ["classname"]), r.get(r.get(r.get(s, "mixclass"), r.get(s, "class")), 0));
        r.assign(r.slot(s, ["classcolor"]), r.get(r.get(r.get(s, "mixclass"), r.get(s, "class")), 1));
        r.update(r.slot(s, ["mixhelpinfo"]), "concat", (r.text("<p><span class=\"") + r.text(r.get(s, "classcolor")) + r.text("\">") + r.text(r.get(s, "classname")) + r.text("合成表</span>：</p>\n")));
        r.update(r.slot(s, ["mixhelpinfo"]), "concat", "<table>\r\n\t<tr>\r\n\t\t<td class=\"b1\" height=20px><span>素材1</span></td>\r\n\t\t<td class=\"b1\"><span>素材2</span></td>\r\n\t\t<td class=\"b1\"><span>素材3</span></td>\r\n\t\t<td class=\"b1\"><span>素材4</span></td>\r\n\t\t<td class=\"b1\"><span>素材5</span></td>\r\n\t\t<td class=\"b1\"><span>素材6</span></td>\r\n\t\t<td class=\"b1\"></td>\r\n\t\t<td class=\"b1\"><span>合成结果</span></td>\r\n\t\t<td class=\"b1\"><span>用途</span></td>\r\n\t</tr>");
        {
          const a7 = r.copy(r.get(s, "list"));
          loop6: for (const [k7, v7] of r.entries(a7)) {
            r.assign(r.slot(s, ["val"]), v7);
            r.assign(r.slot(s, ["itmskword"]), "");
            if (r.truth((!r.truth((!r.truth(r.get(r.get(r.get(s, "val"), "result"), 4))))))) {
              r.assign(r.slot(s, ["itmskword"]), (r.text("/") + r.text(r.get(r.get(r.get(s, "val"), "result"), 4))));
            }
            loop8: for (r.assign(r.slot(s, ["i"]), 2); r.truth((r.compare(r.get(s, "i"), 6) < 0)); r.post(r.slot(s, ["i"]), 1)) {
              if (r.truth((!r.truth(((r.get(r.get(r.get(s, "val"), "stuff"), r.get(s, "i")) != null)))))) {
                r.assign(r.slot(s, ["val", "stuff", r.get(s, "i")]), "-");
              }
            }
            r.update(r.slot(s, ["mixhelpinfo"]), "concat", (r.text((r.text("<tr>\r\n\t\t\t\t<td class=\"b3\" height='19px' title='") + r.text((await r.call("get_item_place_single", r.get(r.get(r.get(s, "val"), "stuff"), 0)))))) + r.text((r.text("'><span>") + r.text(r.get(r.get(r.get(s, "val"), "stuff"), 0)) + r.text("</span></td>\r\n\t\t\t\t")))));
            loop9: for (r.assign(r.slot(s, ["i"]), 1); r.truth((r.compare(r.get(s, "i"), 6) < 0)); r.post(r.slot(s, ["i"]), 1)) {
              r.update(r.slot(s, ["mixhelpinfo"]), "concat", "<td class=\"b3\"");
              if (r.truth((!r.equal(r.get(r.get(r.get(s, "val"), "stuff"), r.get(s, "i")), "-")))) {
                r.update(r.slot(s, ["mixhelpinfo"]), "concat", (r.text((r.text("title='") + r.text((await r.call("get_item_place_single", r.get(r.get(r.get(s, "val"), "stuff"), r.get(s, "i"))))))) + r.text("'")));
              }
              r.update(r.slot(s, ["mixhelpinfo"]), "concat", (r.text("><span>") + r.text(r.get(r.get(r.get(s, "val"), "stuff"), r.get(s, "i"))) + r.text("</span></td>\r\n\t\t\t\t")));
            }
            r.assign(r.slot(s, ["resultjwords"]), "");
            if (r.truth((!r.truth((!r.truth(r.get(r.get(s, "val"), "resultjwords"))))))) {
              r.assign(r.slot(s, ["resultjwords"]), (r.text((r.text(" title=\"") + r.text(r.get(r.get(s, "val"), "resultjwords")))) + r.text("\"")));
            }
            r.update(r.slot(s, ["mixhelpinfo"]), "concat", (r.text("<td class=\"b3\"><span>→</span></td>\r\n\t\t\t\t<td class=\"b3\"") + r.text(r.get(s, "resultjwords")) + r.text("><span>") + r.text(r.get(r.get(r.get(s, "val"), "result"), 0)) + r.text("</span></td>\r\n\t\t\t\t<td class=\"b3\"><span>") + r.text(r.get(r.get(r.get(s, "val"), "result"), 1)) + r.text("/") + r.text(r.get(r.get(r.get(s, "val"), "result"), 2)) + r.text("/") + r.text(r.get(r.get(r.get(s, "val"), "result"), 3)) + r.text(r.get(s, "itmskword")) + r.text("</span></td>\r\n\t\t\t</tr>\r\n\t\t\t")));
          }
        }
        r.update(r.slot(s, ["mixhelpinfo"]), "concat", "</table>\n");
      }
    }
    (await r.call("writeover", r.get(s, "writefile"), r.get(s, "mixhelpinfo")));
  }
  r.assign(r.slot(s, ["syncfile"]), (r.text(r.constant("GAME_ROOT")) + r.text("./include/modules/base/itemmix/itemmix_sync/config/sync.config.php")));
  r.assign(r.slot(s, ["writefile"]), (r.text((r.text(r.constant("GAME_ROOT")) + r.text(r.constant("TPLDIR")))) + r.text("/tmp_mixhelp_sync.htm")));
  if (r.truth((r.truth((!r.truth((await r.call("file_exists", r.get(s, "writefile")))))) || r.truth((r.compare((await r.call("filemtime", r.get(s, "syncfile"))), (await r.call("filemtime", r.get(s, "writefile")))) > 0))))) {
    if (r.truth((!r.truth(r.get(s, "iplacedata"))))) {
      (await r.call("init_item_place"));
    }
    r.assign(r.slot(s, ["syncinfo"]), (await r.call("openfile", r.get(s, "syncfile"))));
    r.assign(r.slot(s, ["syncitem"]), r.array([]));
    r.assign(r.slot(s, ["syncitem_special"]), r.array([]));
    {
      const a11 = r.copy(r.get(s, "syncinfo"));
      loop10: for (const [k11, v11] of r.entries(a11)) {
        r.assign(r.slot(s, ["sync"]), v11);
        r.assign(r.slot(s, ["sync_arr"]), (await r.call("array_combine", r.array([[r.APPEND, "itm"], [r.APPEND, "itmk"], [r.APPEND, "itme"], [r.APPEND, "itms"], [r.APPEND, "itmsk"], [r.APPEND, "star"], [r.APPEND, "special"]]), (await r.call("array_slice", (await r.call("explode", ",", r.get(s, "sync"))), 0, 7)))));
        r.assign(r.slot(s, ["sync_arr", "resultjwords"]), (await r.call("get_resultjwords", r.get(s, "sync_arr"))));
        r.assign(r.slot(s, ["sync_arr", "itmk"]), (await r.module("itemmain", "parse_itmk_words", r.get(r.get(s, "sync_arr"), "itmk"), 1)));
        if (r.truth((!r.truth((!r.truth(r.get(r.get(s, "sync_arr"), "itmsk"))))))) {
          r.assign(r.slot(s, ["sync_arr", "itmsk"]), (await r.module("attrbase", "config_process_encode_comp_itmsk", r.get(r.get(s, "sync_arr"), "itmsk"))));
          r.assign(r.slot(s, ["sync_arr", "itmsk"]), (await r.module("itemmain", "parse_itmsk_words", r.get(r.get(s, "sync_arr"), "itmsk"))));
        }
        if (r.truth((!r.truth((!r.truth(r.get(r.get(s, "sync_arr"), "special"))))))) {
          r.assign(r.slot(s, ["sync_arr", "special"]), (await r.call("explode", "+", r.get(r.get(s, "sync_arr"), "special"))));
          r.assign(r.slot(s, ["special_tags"]), (await r.call("preg_replace", "/\\d/", "", r.get(r.get(s, "sync_arr"), "special"))));
          if (r.truth((r.truth((r.truth((!r.truth((await r.call("in_array", "t", r.get(s, "special_tags")))))) && r.truth((!r.truth((await r.call("in_array", "st", r.get(s, "special_tags")))))))) && r.truth((!r.truth((await r.call("in_array", "sm", r.get(s, "special_tags"))))))))) {
            r.assign(r.slot(s, ["sync_x"]), 0);
            {
              const a13 = r.copy(r.get(r.get(s, "sync_arr"), "special"));
              loop12: for (const [k13, v13] of r.entries(a13)) {
                r.assign(r.slot(s, ["ssv"]), v13);
                (await r.match("/★(\\d+)/s", r.get(s, "ssv"), r.argument(r.slot(s, ["matches"])), 0, 0, false));
                if (r.truth(r.get(s, "matches"))) {
                  r.update(r.slot(s, ["sync_x"]), "add", r.get(r.get(s, "matches"), 1));
                }
              }
            }
            r.assign(r.slot(s, ["otherstar"]), r.subtract(r.get(r.get(s, "sync_arr"), "star"), r.get(s, "sync_x")));
            if (r.truth(r.equal(1, r.get(s, "otherstar")))) {
              r.assign(r.slot(s, ["sync_arr", "special", r.APPEND]), "星数为1的素材");
            } else {
              r.assign(r.slot(s, ["sync_arr", "special", r.APPEND]), (r.text((r.text("星数合计为") + r.text(r.get(s, "otherstar")))) + r.text("的素材")));
            }
          } else {
            {
              const a15 = r.get(r.get(s, "sync_arr"), "special");
              loop14: for (const [k15, v15] of r.entries(a15)) {
                r.bind(r.slot(s, ["ssv"]), a15, k15);
                if (r.truth(r.identical((await r.call("strpos", r.get(s, "ssv"), "t")), 0))) {
                  r.assign(r.slot(s, ["tnum"]), r.int((await r.call("substr", r.get(s, "ssv"), 1))));
                  if (r.truth((r.compare(r.get(s, "tnum"), 1) < 0))) {
                    r.assign(r.slot(s, ["tnum"]), 1);
                  }
                  r.assign(r.slot(s, ["ssv"]), (r.text((r.text(" 带“调整”属性的素材") + r.text(r.get(s, "tnum")))) + r.text("体 ")));
                } else {
                  if (r.truth(r.equal("st", r.get(s, "ssv")))) {
                    r.assign(r.slot(s, ["ssv"]), " 带“同调”和“调整”属性的素材1体 ");
                  } else {
                    if (r.truth(r.identical((await r.call("strpos", r.get(s, "ssv"), "sm")), 0))) {
                      r.assign(r.slot(s, ["smnum"]), r.int((await r.call("substr", r.get(s, "ssv"), 2))));
                      if (r.truth((r.compare(r.get(s, "smnum"), 1) < 0))) {
                        r.assign(r.slot(s, ["smnum"]), 1);
                      }
                      r.assign(r.slot(s, ["ssv"]), (r.text((r.text(" 带“同调”但不带“调整”属性的素材") + r.text(r.get(s, "smnum")))) + r.text("体以上 ")));
                    }
                  }
                }
              }
            }
          }
          r.assign(r.slot(s, ["syncitem_special", r.APPEND]), r.get(s, "sync_arr"));
        } else {
          r.assign(r.slot(s, ["syncitem", r.APPEND]), r.get(s, "sync_arr"));
        }
      }
    }
    r.assign(r.slot(s, ["synchelpinfo"]), "<p><span class=\"yellow b\">通常同调合成表</span>：</p>");
    r.update(r.slot(s, ["synchelpinfo"]), "concat", "<table>\r\n\t<tr>\r\n\t\t<td class=\"b1\" height=20px><span>同调产物</span></td>\r\n\t\t<td class=\"b1\"><span>用途</span></td>\r\n\t</tr>");
    r.assign(r.slot(s, ["synchelpinfo_special"]), "<p><span class=\"lime b\">特殊同调合成表</span>：</p>");
    r.update(r.slot(s, ["synchelpinfo_special"]), "concat", "<table>\r\n\t<tr>\r\n\t\t<td class=\"b1\" height=20px><span>同调素材一</span></td>\r\n\t\t<td class=\"b1\"><span>同调素材二</span></td>\r\n\t\t<td class=\"b1\"><span>同调素材三</span></td>\r\n\t\t<td class=\"b1\"><span>同调素材四</span></td>\r\n\t\t<td class=\"b1\"><span>同调素材五</span></td>\r\n\t\t<td class=\"b1\"></td>\r\n\t\t<td class=\"b1\"><span>同调产物</span></td>\r\n\t\t<td class=\"b1\"><span>用途</span></td>\r\n\t</tr>");
    {
      const a17 = r.copy(r.get(s, "syncitem"));
      loop16: for (const [k17, v17] of r.entries(a17)) {
        r.assign(r.slot(s, ["sval"]), v17);
        if (r.truth((!r.truth((!r.truth(r.get(r.get(s, "sval"), "itmsk"))))))) {
          r.assign(r.slot(s, ["itmskwords"]), (r.text("/") + r.text(r.get(r.get(s, "sval"), "itmsk"))));
        } else {
          r.assign(r.slot(s, ["itmskwords"]), "");
        }
        r.assign(r.slot(s, ["resultjwords"]), "");
        if (r.truth(r.get(r.get(s, "sval"), "resultjwords"))) {
          r.assign(r.slot(s, ["resultjwords"]), (r.text((r.text(" title=\"") + r.text(r.get(r.get(s, "sval"), "resultjwords")))) + r.text("\"")));
        }
        r.update(r.slot(s, ["synchelpinfo"]), "concat", (r.text("\t<tr>\r\n\t\t<td class='b3' height='20px' ") + r.text(r.get(s, "resultjwords")) + r.text("><span>") + r.text(r.get(r.get(s, "sval"), "itm")) + r.text("</span></td>\r\n\t\t<td class='b3'><span>") + r.text(r.get(r.get(s, "sval"), "itmk")) + r.text("/") + r.text(r.get(r.get(s, "sval"), "itme")) + r.text("/") + r.text(r.get(r.get(s, "sval"), "itms")) + r.text(r.get(s, "itmskwords")) + r.text("</span></td>\r\n\t</tr>")));
      }
    }
    r.update(r.slot(s, ["synchelpinfo"]), "concat", "</table>");
    {
      const a19 = r.copy(r.get(s, "syncitem_special"));
      loop18: for (const [k19, v19] of r.entries(a19)) {
        r.assign(r.slot(s, ["sval"]), v19);
        if (r.truth((!r.truth((!r.truth(r.get(r.get(s, "sval"), "itmsk"))))))) {
          r.assign(r.slot(s, ["itmskwords"]), (r.text("/") + r.text(r.get(r.get(s, "sval"), "itmsk"))));
        } else {
          r.assign(r.slot(s, ["itmskwords"]), "");
        }
        r.update(r.slot(s, ["synchelpinfo_special"]), "concat", "<tr>");
        loop20: for (r.assign(r.slot(s, ["i"]), 0); r.truth((r.compare(r.get(s, "i"), 4) <= 0)); r.post(r.slot(s, ["i"]), 1)) {
          r.update(r.slot(s, ["synchelpinfo_special"]), "concat", "<td class=\"b3\"");
          if (r.truth(((r.get(r.get(r.get(s, "sval"), "special"), r.get(s, "i")) != null)))) {
            r.update(r.slot(s, ["synchelpinfo_special"]), "concat", (r.text((r.text("title='") + r.text((await r.call("get_item_place_single", r.get(r.get(r.get(s, "sval"), "special"), r.get(s, "i"))))))) + r.text("'")));
          }
          r.update(r.slot(s, ["synchelpinfo_special"]), "concat", (r.truth(((r.get(r.get(r.get(s, "sval"), "special"), r.get(s, "i")) != null))) ? (r.text("><span>") + r.text(r.get(r.get(r.get(s, "sval"), "special"), r.get(s, "i"))) + r.text("</span></td>")) : "><span>-</span></td>"));
        }
        r.assign(r.slot(s, ["resultjwords"]), "");
        if (r.truth(r.get(r.get(s, "sval"), "resultjwords"))) {
          r.assign(r.slot(s, ["resultjwords"]), (r.text((r.text(" title=\"") + r.text(r.get(r.get(s, "sval"), "resultjwords")))) + r.text("\"")));
        }
        r.update(r.slot(s, ["synchelpinfo_special"]), "concat", (r.text("\t\t<td class='b3'>→</td>\r\n\t\t<td class='b3'") + r.text(r.get(s, "resultjwords")) + r.text("><span>") + r.text(r.get(r.get(s, "sval"), "itm")) + r.text("</span></td>\r\n\t\t<td class='b3'><span>") + r.text(r.get(r.get(s, "sval"), "itmk")) + r.text("/") + r.text(r.get(r.get(s, "sval"), "itme")) + r.text("/") + r.text(r.get(r.get(s, "sval"), "itms")) + r.text(r.get(s, "itmskwords")) + r.text("</span></td>\r\n\t</tr>")));
      }
    }
    r.update(r.slot(s, ["synchelpinfo_special"]), "concat", "</table>");
    r.assign(r.slot(s, ["writecont"]), (r.text("<p>以下是可能获得的同调结果的列表。</p>\r\n") + r.text(r.get(s, "synchelpinfo")) + r.text("\r\n<p>另外，上述只是一般情况。有一些同调结果除了<span class=\"yellow b\">星数符合要求、“调整”属性道具数目正确</span>之外，还必须<span class=\"yellow b\">包含特定的素材</span>才能合成，这些合成将在下表中列出。</p>\r\n") + r.text(r.get(s, "synchelpinfo_special")) + r.text("\r\n<br>")));
    (await r.call("writeover", r.get(s, "writefile"), r.get(s, "writecont")));
  }
  r.assign(r.slot(s, ["overlayfile"]), (r.text(r.constant("GAME_ROOT")) + r.text("./include/modules/base/itemmix/itemmix_overlay/config/overlay.config.php")));
  r.assign(r.slot(s, ["writefile"]), (r.text((r.text(r.constant("GAME_ROOT")) + r.text(r.constant("TPLDIR")))) + r.text("/tmp_mixhelp_overlay.htm")));
  if (r.truth((r.truth((!r.truth((await r.call("file_exists", r.get(s, "writefile")))))) || r.truth((r.compare((await r.call("filemtime", r.get(s, "overlayfile"))), (await r.call("filemtime", r.get(s, "writefile")))) > 0))))) {
    if (r.truth((!r.truth(r.get(s, "iplacedata"))))) {
      (await r.call("init_item_place"));
    }
    r.assign(r.slot(s, ["overlayinfo"]), (await r.call("openfile", r.get(s, "overlayfile"))));
    r.assign(r.slot(s, ["overlayitem"]), r.array([]));
    {
      const a22 = r.copy(r.get(s, "overlayinfo"));
      loop21: for (const [k22, v22] of r.entries(a22)) {
        r.assign(r.slot(s, ["overlay"]), v22);
        r.assign(r.slot(s, ["overlay_arr"]), (await r.call("array_combine", r.array([[r.APPEND, "itm"], [r.APPEND, "itmk"], [r.APPEND, "itme"], [r.APPEND, "itms"], [r.APPEND, "itmsk"], [r.APPEND, "star"], [r.APPEND, "num"]]), (await r.call("array_slice", (await r.call("explode", ",", r.get(s, "overlay"))), 0, 7)))));
        r.assign(r.slot(s, ["overlay_arr", "resultjwords"]), (await r.call("get_resultjwords", r.get(s, "overlay_arr"))));
        r.assign(r.slot(s, ["overlay_arr", "itmk"]), (await r.module("itemmain", "parse_itmk_words", r.get(r.get(s, "overlay_arr"), "itmk"), 1)));
        if (r.truth((!r.truth((!r.truth(r.get(r.get(s, "overlay_arr"), "itmsk"))))))) {
          r.assign(r.slot(s, ["overlay_arr", "itmsk"]), (await r.module("attrbase", "config_process_encode_comp_itmsk", r.get(r.get(s, "overlay_arr"), "itmsk"))));
          r.assign(r.slot(s, ["overlay_arr", "itmsk"]), (await r.module("itemmain", "parse_itmsk_words", r.get(r.get(s, "overlay_arr"), "itmsk"))));
        }
        r.assign(r.slot(s, ["overlayitem", r.APPEND]), r.get(s, "overlay_arr"));
      }
    }
    r.assign(r.slot(s, ["overlayhelpinfo"]), "<p><span class=\"yellow b\">超量合成表</span>：</p>");
    r.update(r.slot(s, ["overlayhelpinfo"]), "concat", "<table>\r\n\t<tr>\r\n\t\t<td class=\"b1\" height=20px><span>超量素材类型</span></td>\r\n\t\t<td class=\"b1\"><span>数目</span></td>\r\n\t\t<td class=\"b1\"><span>超量产物</span></td>\r\n\t\t<td class=\"b1\"><span>用途</span></td>\r\n\t</tr>");
    r.assign(r.slot(s, ["overlay_star_words"]), r.array([[1, "游戏王一星素材"], [2, "游戏王二星素材"], [3, "游戏王三星素材"], [4, "游戏王四星素材"], [5, "游戏王五星素材"], [6, "游戏王六星素材"], [7, "游戏王七星素材"], [8, "游戏王八星素材"], [9, "游戏王九星素材"], [10, "游戏王十星素材"]]));
    {
      const a24 = r.copy(r.get(s, "overlayitem"));
      loop23: for (const [k24, v24] of r.entries(a24)) {
        r.assign(r.slot(s, ["oval"]), v24);
        if (r.truth((!r.truth((!r.truth(r.get(r.get(s, "oval"), "itmsk"))))))) {
          r.assign(r.slot(s, ["itmskwords"]), (r.text("/") + r.text(r.get(r.get(s, "oval"), "itmsk"))));
        } else {
          r.assign(r.slot(s, ["itmskwords"]), "");
        }
        r.assign(r.slot(s, ["resultjwords"]), "");
        if (r.truth(r.get(r.get(s, "oval"), "resultjwords"))) {
          r.assign(r.slot(s, ["resultjwords"]), (r.text((r.text(" title=\"") + r.text(r.get(r.get(s, "oval"), "resultjwords")))) + r.text("\"")));
        }
        r.update(r.slot(s, ["overlayhelpinfo"]), "concat", (r.text("\t<tr>\r\n\t\t<td class='b3' height='20px'><span>") + r.text(r.get(r.get(s, "overlay_star_words"), r.get(r.get(s, "oval"), "star"))) + r.text("</span></td>\r\n\t\t<td class='b3'><span> × ") + r.text(r.get(r.get(s, "oval"), "num")) + r.text("</span></td>\r\n\t\t<td class='b3' ") + r.text(r.get(s, "resultjwords")) + r.text("><span>") + r.text(r.get(r.get(s, "oval"), "itm")) + r.text("</span></td>\r\n\t\t<td class='b3'><span>") + r.text(r.get(r.get(s, "oval"), "itmk")) + r.text("/") + r.text(r.get(r.get(s, "oval"), "itme")) + r.text("/") + r.text(r.get(r.get(s, "oval"), "itms")) + r.text(r.get(s, "itmskwords")) + r.text("</span></td>\r\n\t</tr>")));
      }
    }
    r.update(r.slot(s, ["overlayhelpinfo"]), "concat", "</table>");
    r.assign(r.slot(s, ["writecont"]), (r.text("<p>以下是可能获得的超量结果的列表。</p>\r\n") + r.text(r.get(s, "overlayhelpinfo")) + r.text("")));
    (await r.call("writeover", r.get(s, "writefile"), r.get(s, "writecont")));
  }
  r.assign(r.slot(s, ["npcfile"]), (r.text(r.constant("GAME_ROOT")) + r.text("./include/modules/base/npc/config/npc.data.config.php")));
  r.assign(r.slot(s, ["npcfile_i8"]), (r.text(r.constant("GAME_ROOT")) + r.text("./include/modules/extra/instance/instance8_proud/config/npc.data.config.php")));
  r.assign(r.slot(s, ["npcfile_i9"]), (r.text(r.constant("GAME_ROOT")) + r.text("./include/modules/extra/instance/instance9_rush/config/npc.data.config.php")));
  r.assign(r.slot(s, ["npcfile_av"]), (r.text(r.constant("GAME_ROOT")) + r.text("./include/modules/base/addnpc/config/addnpc.config.php")));
  r.assign(r.slot(s, ["npcfile_ev"]), (r.text(r.constant("GAME_ROOT")) + r.text("./include/modules/extra/club/skills/skill21/config/evonpc.config.php")));
  (await r.include(r.get(s, "npcfile_i8"), s, false));
  (await r.include(r.get(s, "npcfile_i9"), s, false));
  (await r.include(r.get(s, "npcfile_av"), s, false));
  (await r.include(r.get(s, "npcfile_ev"), s, false));
  r.assign(r.slot(s, ["enpcinfo_show"]), r.array([]));
  {
    const a26 = r.copy(r.get(s, "enpcinfo"));
    loop25: for (const [k26, v26] of r.entries(a26)) {
    r.assign(r.slot(s, ["enkey"]), k26);
      r.assign(r.slot(s, ["enval"]), v26);
      r.assign(r.slot(s, ["enpcinfo_show", r.get(s, "enkey")]), r.array([["sub", r.array([])]]));
      {
        const a28 = r.copy(r.get(s, "enval"));
        loop27: for (const [k28, v28] of r.entries(a28)) {
          r.assign(r.slot(s, ["enval2"]), v28);
          r.assign(r.slot(s, ["enpcinfo_show", r.get(s, "enkey"), "sub", r.APPEND]), r.get(s, "enval2"));
        }
      }
    }
  }
  r.assign(r.slot(s, ["srcfile"]), (r.text((r.text(r.constant("GAME_ROOT")) + r.text(r.constant("TPLDIR")))) + r.text("/npchelp.htm")));
  r.assign(r.slot(s, ["writefile"]), (r.text((r.text(r.constant("GAME_ROOT")) + r.text(r.constant("TPLDIR")))) + r.text("/tmp_npchelp.htm")));
  r.assign(r.slot(s, ["need_refresh"]), 0);
  if (r.truth((!r.truth((await r.call("file_exists", r.get(s, "writefile"))))))) {
    r.assign(r.slot(s, ["need_refresh"]), 1);
  } else {
    {
      const a30 = r.copy(r.array([[r.APPEND, r.get(s, "npcfile")], [r.APPEND, r.get(s, "npcfile_i8")], [r.APPEND, r.get(s, "npcfile_i9")], [r.APPEND, r.get(s, "npcfile_av")], [r.APPEND, r.get(s, "npcfile_ev")], [r.APPEND, r.get(s, "srcfile")]]));
      loop29: for (const [k30, v30] of r.entries(a30)) {
        r.assign(r.slot(s, ["fv"]), v30);
        if (r.truth((r.compare((await r.call("filemtime", r.get(s, "fv"))), (await r.call("filemtime", r.get(s, "writefile")))) > 0))) {
          r.assign(r.slot(s, ["need_refresh"]), 1);
        }
      }
    }
  }
  if (r.truth(r.get(s, "need_refresh"))) {
    r.assign(r.slot(s, ["writecont"]), (await r.call("dump_template", "npchelp")));
    (await r.call("writeover", r.get(s, "writefile"), r.get(s, "writecont")));
  }
  r.imports(s, "skillbase", "clubbase");
  r.assign(r.slot(s, ["sdata"]), (await r.module("player", "create_dummy_playerdata")));
  r.assign(r.slot(s, ["srcfile"]), (r.text((r.text(r.constant("GAME_ROOT")) + r.text(r.constant("TPLDIR")))) + r.text("/clubhelp.htm")));
  r.assign(r.slot(s, ["writefile"]), (r.text((r.text(r.constant("GAME_ROOT")) + r.text(r.constant("TPLDIR")))) + r.text("/tmp_clubhelp.htm")));
  r.assign(r.slot(s, ["tmp_clublist"]), r.array([[r.APPEND, 1], [r.APPEND, 2], [r.APPEND, 3], [r.APPEND, 4], [r.APPEND, 5], [r.APPEND, 9], [r.APPEND, 6], [r.APPEND, 7], [r.APPEND, 8], [r.APPEND, 10], [r.APPEND, 11], [r.APPEND, 13], [r.APPEND, 14], [r.APPEND, 18], [r.APPEND, 19], [r.APPEND, 20], [r.APPEND, 21], [r.APPEND, 24], [r.APPEND, 25], [r.APPEND, 26], [r.APPEND, 27]]));
  r.assign(r.slot(s, ["need_refresh"]), 0);
  if (r.truth((r.truth((!r.truth((await r.call("file_exists", r.get(s, "writefile")))))) || r.truth((r.compare((await r.call("filemtime", r.get(s, "srcfile"))), (await r.call("filemtime", r.get(s, "writefile")))) > 0))))) {
    r.assign(r.slot(s, ["need_refresh"]), 1);
  }
  if (r.truth(r.get(s, "need_refresh"))) {
    r.assign(r.slot(s, ["writecont"]), (await r.call("dump_template", "clubhelp")));
    (await r.call("writeover", r.get(s, "writefile"), r.get(s, "writecont")));
  }
  r.assign(r.slot(s, ["extrahead"]), (r.text("<STYLE type=text/css>\r\nBODY {\r\n\tFONT-SIZE: 10pt;MARGIN: 0; color:#eee; FONT-FAMILY: \"Trebuchet MS\",\"Gill Sans\",\"Microsoft Sans Serif\",sans-serif;\r\n}\r\nA {\r\n\tCOLOR: #eee\r\n}\r\nA:visited {\r\n\tCOLOR: #eee\r\n}\r\nA:active {\r\n\tcolor: #98fb98;text-decoration:underline\r\n}\r\nP{ line-height:16px\r\n}\r\n\r\n.subtitle2 {\r\n\tfont-family: \"微软雅黑\"; color: #98fb98; width: 100%;font-size: 16px;font-weight:900;\r\n}\r\n\r\nDL {\r\n\tline-height:20px; font-size: 10pt;\r\n}\r\nDT {\r\n\tCOLOR: #98fb98;font-weight:bold;\r\n}\r\nDD {\r\n\t\r\n}\r\n\r\nDIV.help_body {\r\n\tmargin-left:12px;text-align:left;width:900px\r\n}\r\n\r\nDIV.help_body A {\r\n\tcolor:#98fb98\r\n}\r\n\r\nDIV.help_body img {\r\n\tmargin:10px 20px;border:1.5px dashed #999;border-radius:5px;\r\n}\r\nDIV.help_body table td.b2h{\r\n\tborder:1px #000 solid;\r\n\tborder-width:1px 0;\r\n}\r\nDIV.help_body table td.b3{\r\n\tborder:1px rgba(98,135,163,0.3) solid;\r\n\tborder-width:1px 0;\r\n}\r\n</STYLE>")));
  (await r.include(r.template("help"), s, false));
  return null;
}
