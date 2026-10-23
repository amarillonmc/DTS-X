// Static native page from itemhelp.php. Build-only source translation.
export default async function execute(r, s) {
  (await r.call("define", "CURSCRIPT", "help"));
  (await r.nativeInclude("request-bootstrap", s));
  r.assign(r.slot(s, ["selffile"]), (r.text(r.constant("GAME_ROOT")) + r.text("/itemhelp.php")));
  r.assign(r.slot(s, ["mapitemfile"]), (r.text(r.constant("GAME_ROOT")) + r.text("/include/modules/base/itemmain/config/mapitem.config.php")));
  r.assign(r.slot(s, ["mapitemfile_i8"]), (r.text(r.constant("GAME_ROOT")) + r.text("./include/modules/extra/instance/instance8_proud/config/mapitem.config.php")));
  r.assign(r.slot(s, ["mapitemfile_i9"]), (r.text(r.constant("GAME_ROOT")) + r.text("./include/modules/extra/instance/instance9_rush/config/mapitem.config.php")));
  r.assign(r.slot(s, ["writefile"]), (r.text((r.text(r.constant("GAME_ROOT")) + r.text(r.constant("TPLDIR")))) + r.text("/tmp_itemhelp.htm")));
  if (r.truth((await r.call("check_filemtime_expired", r.get(s, "writefile"), r.array([[r.APPEND, r.get(s, "selffile")], [r.APPEND, r.get(s, "mapitemfile")], [r.APPEND, r.get(s, "mapitemfile_i8")], [r.APPEND, r.get(s, "mapitemfile_i9")]]))))) {
    r.assign(r.slot(s, ["iinfo_all"]), r.array([]));
    r.assign(r.slot(s, ["list"]), r.array([["标准局道具列表", r.get(s, "mapitemfile")], ["荣耀模式道具列表", r.get(s, "mapitemfile_i8")], ["极速模式道具列表", r.get(s, "mapitemfile_i9")]]));
    {
      const a1 = r.copy(r.get(s, "list"));
      loop0: for (const [k1, v1] of r.entries(a1)) {
      r.assign(r.slot(s, ["fkey"]), k1);
        r.assign(r.slot(s, ["fval"]), v1);
        r.assign(r.slot(s, ["iinfo_list"]), r.array([]));
        r.assign(r.slot(s, ["itemlist"]), (await r.call("openfile", r.get(s, "fval"))));
        r.assign(r.slot(s, ["in"]), (await r.call("sizeof", r.get(s, "itemlist"))));
        loop2: for (r.assign(r.slot(s, ["i"]), 1); r.truth((r.compare(r.get(s, "i"), r.get(s, "in")) < 0)); r.post(r.slot(s, ["i"]), 1)) {
          if (r.truth((r.truth((!r.truth((!r.truth(r.get(r.get(s, "itemlist"), r.get(s, "i"))))))) && r.truth((!r.identical((await r.call("strpos", r.get(r.get(s, "itemlist"), r.get(s, "i")), ",")), false)))))) {
            r.list([r.slot(s, ["iarea"]), r.slot(s, ["imap"]), r.slot(s, ["inum"]), r.slot(s, ["iname"]), r.slot(s, ["ikind"]), r.slot(s, ["ieff"]), r.slot(s, ["ista"]), r.slot(s, ["iskind"])], (await r.call("explode", ",", r.get(r.get(s, "itemlist"), r.get(s, "i")))));
            if (r.truth((r.compare(r.get(s, "iarea"), 100) > 0))) {
              continue loop2;
            }
            if (r.truth(r.equal(r.get(s, "imap"), 99))) {
              r.assign(r.slot(s, ["imap_w"]), "全图随机");
            } else {
              r.assign(r.slot(s, ["imap_w"]), r.get(r.get(s, "plsinfo"), r.get(s, "imap")));
            }
            r.assign(r.slot(s, ["ikind_w"]), (await r.module("itemmain", "parse_itmk_words", r.get(s, "ikind"), 0)));
            if (r.truth(r.equal((await r.call("substr", r.get(s, "ikind"), 0, 2)), "TO"))) {
              r.update(r.slot(s, ["ikind_w"]), "concat", "（已埋设）");
            } else {
              if (r.truth(r.equal((await r.call("substr", r.get(s, "ikind"), 0, 2)), "TN"))) {
                r.update(r.slot(s, ["ikind_w"]), "concat", "（可拾取）");
              } else {
                if (r.truth(r.equal(r.get(r.get(s, "ikind"), 0), "P"))) {
                  r.assign(r.slot(s, ["psign"]), (r.truth((r.compare((await r.call("strlen", r.get(s, "ikind"))), 3) >= 0)) ? (await r.call("substr", r.get(s, "ikind"), 2, 1)) : 0));
                  if (r.truth(r.identical("1", r.get(s, "psign")))) {
                    r.assign(r.slot(s, ["psign"]), 1.5);
                  }
                  if (r.truth((!r.truth(r.get(s, "psign"))))) {
                    r.update(r.slot(s, ["ikind_w"]), "concat", "（有毒）");
                  } else {
                    r.update(r.slot(s, ["ikind_w"]), "concat", (r.text("（") + r.text(r.get(s, "psign")) + r.text("倍毒）")));
                  }
                }
              }
            }
            r.assign(r.slot(s, ["iskind_w"]), (await r.module("itemmain", "parse_itmsk_words", r.get(s, "iskind"), 0)));
            if (r.truth(r.equal(r.get(s, "iarea"), 99))) {
              r.assign(r.slot(s, ["iarea_w"]), "每禁");
            } else {
              if (r.truth(r.equal(r.get(s, "iarea"), 98))) {
                r.assign(r.slot(s, ["iarea_w"]), "1禁后每禁");
              } else {
                r.assign(r.slot(s, ["iarea_w"]), (r.text(r.get(s, "iarea")) + r.text("禁")));
              }
            }
            r.update(r.slot(s, ["iarea_w"]), "concat", (r.text("刷新") + r.text(r.get(s, "inum")) + r.text("个")));
            r.assign(r.slot(s, ["iinfo_list", r.APPEND]), r.array([[r.APPEND, r.get(s, "iarea_w")], [r.APPEND, r.get(s, "imap_w")], [r.APPEND, r.get(s, "inum")], [r.APPEND, r.get(s, "iname")], [r.APPEND, r.get(s, "ikind_w")], [r.APPEND, r.get(s, "ieff")], [r.APPEND, r.get(s, "ista")], [r.APPEND, r.get(s, "iskind_w")]]));
          }
        }
        r.assign(r.slot(s, ["iinfo_all", r.get(s, "fkey")]), r.get(s, "iinfo_list"));
      }
    }
    r.assign(r.slot(s, ["itemdata"]), (await r.call("dump_template", "itemhelpcont")));
    (await r.call("writeover", r.get(s, "writefile"), r.get(s, "itemdata")));
  }
  r.assign(r.slot(s, ["itemhelpcont"]), (await r.call("file_get_contents", r.get(s, "writefile"))));
  (await r.include(r.template("itemhelpmain"), s, false));
  return null;
}
