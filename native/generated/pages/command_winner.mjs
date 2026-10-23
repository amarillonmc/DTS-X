// Static native page from include/pages/command_winner.php. Build-only source translation.
export default async function execute(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  r.imports(s, "player", "cardbase");
  if (r.truth(((r.get(s, "user_prefix") != null)))) {
    r.assign(r.slot(s, ["room_prefix"]), r.get(s, "user_prefix"));
  } else {
    r.assign(r.slot(s, ["user_prefix"]), (await r.call("room_prefix_kind", r.get(s, "room_prefix"))));
  }
  if (r.truth(((r.get(s, "show_all") != null)))) {
    r.assign(r.slot(s, ["showall"]), r.get(s, "show_all"));
  } else {
    r.assign(r.slot(s, ["showall"]), 1);
  }
  r.assign(r.slot(s, ["wmode_max"]), 8);
  r.assign(r.slot(s, ["gtype_max"]), 30);
  loop0: for (r.assign(r.slot(s, ["i"]), 1); r.truth((r.compare(r.get(s, "i"), r.get(s, "wmode_max")) <= 0)); r.post(r.slot(s, ["i"]), 1)) {
    if (r.truth((!r.truth(((r.get(s, (r.text("winner_show_wmode_") + r.text(r.get(s, "i")))) != null)))))) {
      r.assign(r.slot(s, [(r.text("winner_show_wmode_") + r.text(r.get(s, "i")))]), 0);
    }
  }
  loop1: for (r.assign(r.slot(s, ["i"]), 0); r.truth((r.compare(r.get(s, "i"), r.get(s, "gtype_max")) <= 0)); r.post(r.slot(s, ["i"]), 1)) {
    if (r.truth((!r.truth(((r.get(s, (r.text("winner_show_gtype_") + r.text(r.get(s, "i")))) != null)))))) {
      r.assign(r.slot(s, [(r.text("winner_show_gtype_") + r.text(r.get(s, "i")))]), 0);
    }
  }
  if (r.truth((!r.truth(((r.get(s, "winner_show_winner") != null)))))) {
    r.assign(r.slot(s, ["winner_show_winner"]), "");
  }
  r.assign(r.slot(s, ["room_gprefix"]), "");
  if (r.truth((await r.call("room_check_subroom", r.get(s, "room_prefix"))))) {
    r.assign(r.slot(s, ["room_gprefix"]), (r.text(r.text(r.get(s, "room_prefix"))) + r.text(".")));
  }
  if (r.truth((!r.equal(r.get(s, "room_gprefix"), "")))) {
    r.assign(r.slot(s, ["wtablepre"]), (r.text(r.get(s, "gtablepre")) + r.text(r.get(r.get(s, "room_gprefix"), 0))));
  } else {
    r.assign(r.slot(s, ["wtablepre"]), r.get(s, "gtablepre"));
  }
  if (r.truth((!r.truth(((r.get(s, "command") != null)))))) {
    r.assign(r.slot(s, ["command"]), "ref");
  }
  if (r.truth((!r.truth((await r.call("function_exists", "winner_parse")))))) {
    {
      const static2 = Object.create(null);
      r.defineLocal("winner_parse", async (...args) => {
        const s = Object.create(null);
      r.parameter(s, "wdata", args.length > 0 ? args[0] : null, false);
        r.assign(r.slot(s, ["wdata", "winnerpdata"]), (await r.call("gdecode", r.get(r.get(s, "wdata"), "winnerpdata"), 1)));
        r.assign(r.slot(s, ["wdata", "validlist"]), (await r.call("gdecode", r.get(r.get(s, "wdata"), "validlist"), 1)));
        {
          const a4 = r.copy(r.get(r.get(s, "wdata"), "winnerpdata"));
          loop3: for (const [k4, v4] of r.entries(a4)) {
          r.assign(r.slot(s, ["wdk"]), k4);
            r.assign(r.slot(s, ["wdv"]), v4);
            r.assign(r.slot(s, ["wdata", r.get(s, "wdk")]), r.get(s, "wdv"));
          }
        }
        r.unset(r.slot(s, ["wdata", "winnerpdata"]));
        if (r.truth((!r.truth(r.get(r.get(s, "wdata"), "gd"))))) {
          r.assign(r.slot(s, ["wdata", "gd"]), "m");
        }
        if (r.truth((!r.truth(r.get(r.get(s, "wdata"), "icon"))))) {
          r.assign(r.slot(s, ["wdata", "icon"]), 0);
        }
        if (r.truth((!r.truth(r.get(r.get(s, "wdata"), "wep"))))) {
          r.assign(r.slot(s, ["wdata", "wep"]), "");
        }
        return r.copy(r.get(s, "wdata"));
        return null;
      });
    }
  }
  if (r.truth(r.equal(r.get(s, "command"), "info"))) {
    r.assign(r.slot(s, ["result"]), (await r.database("query", (r.text("SELECT * FROM ") + r.text(r.get(s, "wtablepre")) + r.text("history WHERE gid='") + r.text(r.get(s, "gnum")) + r.text("' LIMIT 1")))));
    if (r.truth((await r.database("num_rows", r.get(s, "result"))))) {
      r.assign(r.slot(s, ["wdata"]), (await r.database("fetch_array", r.get(s, "result"))));
      r.assign(r.slot(s, ["wdata"]), (await r.pageCall("winner_parse", r.get(s, "wdata"))));
      r.assign(r.slot(s, ["wdata", "gdate"]), (r.text((r.text((r.text((r.text((await r.call("floor", r.divide(r.get(r.get(s, "wdata"), "gtime"), 3600)))) + r.text(":"))) + r.text((await r.call("floor", r.divide(r.modulo(r.get(r.get(s, "wdata"), "gtime"), 3600), 60)))))) + r.text(":"))) + r.text(r.modulo(r.get(r.get(s, "wdata"), "gtime"), 60))));
      r.assign(r.slot(s, ["wdata", "gsdate"]), (await r.call("date", "m/d/Y H:i:s", r.get(r.get(s, "wdata"), "gstime"))));
      r.assign(r.slot(s, ["wdata", "gedate"]), (await r.call("date", "m/d/Y H:i:s", r.get(r.get(s, "wdata"), "getime"))));
      r.assign(r.slot(s, ["wdata", "duration"]), (r.truth((!r.truth((!r.truth(r.get(r.get(s, "wdata"), "validtime")))))) ? r.subtract(r.get(r.get(s, "wdata"), "getime"), r.get(r.get(s, "wdata"), "validtime")) : r.subtract(r.get(r.get(s, "wdata"), "getime"), r.get(r.get(s, "wdata"), "gstime"))));
    }
    r.assign(r.slot(s, ["pdata"]), r.get(s, "wdata"));
    (await r.module("player", "load_playerdata", r.get(s, "pdata")));
    (await r.module("player", "init_playerdata"));
    (await r.module("player", "parse_interface_profile"));
    r.extract(s, r.get(s, "pdata"));
    r.list([r.slot(s, ["vapm"]), r.slot(s, ["aapm"])], (await r.module("apm", "calc_winner_apm", r.get(s, "wdata"), r.get(r.get(s, "wdata"), "duration"))));
  } else {
    if (r.truth(r.equal(r.get(s, "command"), "news"))) {
      r.assign(r.slot(s, ["hnewsinfo"]), "");
      r.assign(r.slot(s, ["result"]), (await r.database("query", (r.text("SELECT hnews FROM ") + r.text(r.get(s, "wtablepre")) + r.text("history WHERE gid='") + r.text(r.get(s, "gnum")) + r.text("' LIMIT 1")))));
      if (r.truth((await r.database("num_rows", r.get(s, "result"))))) {
        r.assign(r.slot(s, ["whd"]), (await r.database("fetch_array", r.get(s, "result"))));
        if (r.truth(r.get(r.get(s, "whd"), "hnews"))) {
          r.assign(r.slot(s, ["hnewsinfo"]), (await r.call("gdecode", r.get(r.get(s, "whd"), "hnews"), 1)));
        }
      }
      if (r.truth((!r.truth(r.get(s, "hnewsinfo"))))) {
        r.assign(r.slot(s, ["hnewsfile1"]), (r.text(r.constant("GAME_ROOT")) + r.text((r.text("./gamedata/bak/") + r.text(r.get(s, "room_gprefix")) + r.text(r.get(s, "gnum")) + r.text("_newsinfo.dat")))));
        r.assign(r.slot(s, ["hnewsfile2"]), (r.text(r.constant("GAME_ROOT")) + r.text((r.text("./gamedata/bak/") + r.text(r.get(s, "room_gprefix")) + r.text(r.get(s, "gnum")) + r.text("_newsinfo.html")))));
        if (r.truth((await r.call("file_exists", r.get(s, "hnewsfile1"))))) {
          r.assign(r.slot(s, ["hnewsinfo"]), (await r.call("readover", r.get(s, "hnewsfile1"))));
          r.assign(r.slot(s, ["hnewsinfo"]), (await r.call("gdecode", r.get(s, "hnewsinfo"), 1)));
        } else {
          if (r.truth((await r.call("file_exists", r.get(s, "hnewsfile2"))))) {
            r.assign(r.slot(s, ["hnewsinfo"]), (await r.call("readover", r.get(s, "hnewsfile2"))));
          }
        }
      }
    } else {
      r.assign(r.slot(s, ["max_gamenum"]), 0);
      r.assign(r.slot(s, ["result"]), (await r.database("query", (r.text("SELECT gid FROM ") + r.text(r.get(s, "wtablepre")) + r.text("history ORDER BY gid DESC LIMIT 1")))));
      if (r.truth((await r.database("num_rows", r.get(s, "result"))))) {
        r.assign(r.slot(s, ["tmp_rst"]), (await r.database("fetch_array", r.get(s, "result"))));
        r.assign(r.slot(s, ["max_gamenum"]), r.get(r.get(s, "tmp_rst"), "gid"));
      }
      if (r.truth((r.truth((!r.truth(((r.get(s, "start") != null))))) || r.truth((!r.truth(r.get(s, "start"))))))) {
        r.assign(r.slot(s, ["start"]), 0);
      } else {
        r.assign(r.slot(s, ["start"]), r.int(r.get(s, "start")));
        if (r.truth((r.compare(r.get(s, "start"), r.get(s, "max_gamenum")) > 0))) {
          r.assign(r.slot(s, ["start"]), r.get(s, "max_gamenum"));
        } else {
          if (r.truth((r.compare(r.get(s, "start"), r.get(s, "winlimit")) < 0))) {
            r.assign(r.slot(s, ["start"]), r.get(s, "winlimit"));
          }
        }
      }
      r.assign(r.slot(s, ["query_gid"]), (r.truth((r.compare(r.get(s, "start"), 0) > 0)) ? (r.text("gid<='") + r.text(r.get(s, "start")) + r.text("'")) : ""));
      r.assign(r.slot(s, ["query_gtype"]), "");
      r.assign(r.slot(s, ["show_gtype_arr"]), r.array([]));
      loop5: for (r.assign(r.slot(s, ["i"]), 0); r.truth((r.compare(r.get(s, "i"), r.get(s, "gtype_max")) <= 0)); r.post(r.slot(s, ["i"]), 1)) {
        if (r.truth((!r.truth((!r.truth(r.get(s, (r.text("winner_show_gtype_") + r.text(r.get(s, "i")))))))))) {
          r.assign(r.slot(s, ["show_gtype_arr", r.APPEND]), r.get(s, "i"));
        }
      }
      (await r.mutate("sort", r.argument(r.slot(s, ["show_gtype_arr"]))));
      if (r.truth((!r.truth((!r.truth(r.get(s, "show_gtype_arr"))))))) {
        r.assign(r.slot(s, ["query_gtype"]), (r.text((r.text("gametype IN ('") + r.text((await r.call("implode", "','", r.get(s, "show_gtype_arr")))))) + r.text("')")));
      }
      r.assign(r.slot(s, ["query_wmode"]), "");
      r.assign(r.slot(s, ["show_wmode_arr"]), r.array([]));
      loop6: for (r.assign(r.slot(s, ["i"]), 1); r.truth((r.compare(r.get(s, "i"), r.get(s, "wmode_max")) <= 0)); r.post(r.slot(s, ["i"]), 1)) {
        if (r.truth((!r.truth((!r.truth(r.get(s, (r.text("winner_show_wmode_") + r.text(r.get(s, "i")))))))))) {
          r.assign(r.slot(s, ["show_wmode_arr", r.APPEND]), r.get(s, "i"));
        }
      }
      (await r.mutate("sort", r.argument(r.slot(s, ["show_wmode_arr"]))));
      if (r.truth((!r.truth((!r.truth(r.get(s, "show_wmode_arr"))))))) {
        r.assign(r.slot(s, ["query_wmode"]), (r.text((r.text("wmode IN ('") + r.text((await r.call("implode", "','", r.get(s, "show_wmode_arr")))))) + r.text("')")));
      }
      r.assign(r.slot(s, ["query_winner"]), "");
      if (r.truth((!r.truth((!r.truth(r.get(s, "winner_show_winner"))))))) {
        r.assign(r.slot(s, ["query_winner"]), (r.text("winner='") + r.text(r.get(s, "winner_show_winner")) + r.text("'")));
      }
      r.assign(r.slot(s, ["query_where"]), "");
      if (r.truth((r.truth((r.truth((!r.truth((!r.truth(r.get(s, "query_wmode")))))) || r.truth((!r.truth((!r.truth(r.get(s, "query_gtype")))))))) || r.truth((!r.truth((!r.truth(r.get(s, "query_winner"))))))))) {
        r.update(r.slot(s, ["query_where"]), "concat", r.get(s, "query_wmode"));
        r.update(r.slot(s, ["query_where"]), "concat", (r.text((r.truth((r.truth((!r.truth((!r.truth(r.get(s, "query_where")))))) && r.truth((!r.truth((!r.truth(r.get(s, "query_gtype")))))))) ? " AND " : "")) + r.text(r.get(s, "query_gtype"))));
        r.update(r.slot(s, ["query_where"]), "concat", (r.text((r.truth((r.truth((!r.truth((!r.truth(r.get(s, "query_where")))))) && r.truth((!r.truth((!r.truth(r.get(s, "query_winner")))))))) ? " AND " : "")) + r.text(r.get(s, "query_winner"))));
        r.assign(r.slot(s, ["query_where"]), (r.text("WHERE ") + r.text(r.get(s, "query_where"))));
      }
      r.assign(r.slot(s, ["query_count"]), (r.text("SELECT gid FROM ") + r.text(r.get(s, "wtablepre")) + r.text("history ") + r.text(r.get(s, "query_where")) + r.text(" ORDER BY gid DESC")));
      r.assign(r.slot(s, ["result"]), (await r.database("query", r.get(s, "query_count"))));
      r.assign(r.slot(s, ["result_num"]), (await r.database("num_rows", r.get(s, "result"))));
      r.assign(r.slot(s, ["max_result_gamenum"]), r.assign(r.slot(s, ["min_result_gamenum"]), 0));
      r.assign(r.slot(s, ["winfo"]), r.array([]));
      r.assign(r.slot(s, ["largest_mark"]), r.assign(r.slot(s, ["larger_mark"]), r.assign(r.slot(s, ["smaller_mark"]), r.assign(r.slot(s, ["smallest_mark"]), 0))));
      if (r.truth(r.get(s, "result_num"))) {
        r.assign(r.slot(s, ["wgidarr"]), r.array([]));
        loop7: while (r.truth(r.assign(r.slot(s, ["wgid"]), (await r.database("fetch_array", r.get(s, "result")))))) {
          r.assign(r.slot(s, ["wgidarr", r.APPEND]), r.get(r.get(s, "wgid"), "gid"));
        }
        (await r.mutate("rsort", r.argument(r.slot(s, ["wgidarr"]))));
        r.assign(r.slot(s, ["max_result_gamenum"]), r.get(r.get(s, "wgidarr"), 0));
        r.assign(r.slot(s, ["min_result_gamenum"]), r.get(r.get(s, "wgidarr"), r.subtract(r.get(s, "result_num"), 1)));
        r.assign(r.slot(s, ["query_where"]), "");
        if (r.truth((r.truth((r.truth((r.truth((!r.truth((!r.truth(r.get(s, "query_gid")))))) || r.truth((!r.truth((!r.truth(r.get(s, "query_wmode")))))))) || r.truth((!r.truth((!r.truth(r.get(s, "query_gtype")))))))) || r.truth((!r.truth((!r.truth(r.get(s, "query_winner"))))))))) {
          r.update(r.slot(s, ["query_where"]), "concat", r.get(s, "query_gid"));
          r.update(r.slot(s, ["query_where"]), "concat", (r.text((r.truth((r.truth((!r.truth((!r.truth(r.get(s, "query_where")))))) && r.truth((!r.truth((!r.truth(r.get(s, "query_wmode")))))))) ? " AND " : "")) + r.text(r.get(s, "query_wmode"))));
          r.update(r.slot(s, ["query_where"]), "concat", (r.text((r.truth((r.truth((!r.truth((!r.truth(r.get(s, "query_where")))))) && r.truth((!r.truth((!r.truth(r.get(s, "query_gtype")))))))) ? " AND " : "")) + r.text(r.get(s, "query_gtype"))));
          r.update(r.slot(s, ["query_where"]), "concat", (r.text((r.truth((r.truth((!r.truth((!r.truth(r.get(s, "query_where")))))) && r.truth((!r.truth((!r.truth(r.get(s, "query_winner")))))))) ? " AND " : "")) + r.text(r.get(s, "query_winner"))));
          r.assign(r.slot(s, ["query_where"]), (r.text("WHERE ") + r.text(r.get(s, "query_where"))));
        }
        r.assign(r.slot(s, ["query_limit"]), (r.text("SELECT gid,wmode,winner,motto,gametype,vnum,gtime,gstime,getime,hdmg,hdp,hkill,hkp,winnernum,winnerteamID,winnerlist,winnerpdata,validlist FROM ") + r.text(r.get(s, "wtablepre")) + r.text("history ") + r.text(r.get(s, "query_where")) + r.text(" ORDER BY gid DESC LIMIT ") + r.text(r.get(s, "winlimit"))));
        r.assign(r.slot(s, ["result"]), (await r.database("query", r.get(s, "query_limit"))));
        loop8: while (r.truth(r.assign(r.slot(s, ["wdata"]), (await r.database("fetch_array", r.get(s, "result")))))) {
          r.assign(r.slot(s, ["wdata", "date"]), (await r.call("date", "Y-m-d", r.get(r.get(s, "wdata"), "getime"))));
          r.assign(r.slot(s, ["wdata", "time"]), (await r.call("date", "H:i:s", r.get(r.get(s, "wdata"), "getime"))));
          r.assign(r.slot(s, ["wdata"]), (await r.pageCall("winner_parse", r.get(s, "wdata"))));
          r.assign(r.slot(s, ["wdata", "duration"]), (r.truth((!r.truth((!r.truth(r.get(r.get(s, "wdata"), "validtime")))))) ? r.subtract(r.get(r.get(s, "wdata"), "getime"), r.get(r.get(s, "wdata"), "validtime")) : r.subtract(r.get(r.get(s, "wdata"), "getime"), r.get(r.get(s, "wdata"), "gstime"))));
          r.list([r.slot(s, ["wiconImg"]), r.slot(s, ["wiconImgB"])], (await r.module("player", "icon_parser_shell", r.get(s, "wdata"))));
          r.assign(r.slot(s, ["wdata", "iconImg"]), r.get(s, "wiconImg"));
          r.list([r.slot(s, ["vapm"]), r.slot(s, ["aapm"])], (await r.module("apm", "calc_winner_apm", r.get(s, "wdata"), r.get(r.get(s, "wdata"), "duration"))));
          r.assign(r.slot(s, ["wdata", "apm_words"]), (r.text((r.text(r.get(s, "vapm")) + r.text(" / "))) + r.text(r.get(s, "aapm"))));
          if (r.truth(r.equal("- / -", r.get(r.get(s, "wdata"), "apm_words")))) {
            r.assign(r.slot(s, ["wdata", "apm_words"]), "<span class=\"grey b\">-</span>");
          } else {
            r.assign(r.slot(s, ["wdata", "apm_words"]), (await r.call("str_replace", "-", "<span class=\"grey b\">-</span>", r.get(r.get(s, "wdata"), "apm_words"))));
          }
          r.assign(r.slot(s, ["winfo", r.get(r.get(s, "wdata"), "gid")]), r.get(s, "wdata"));
        }
        r.assign(r.slot(s, ["winfo_keys"]), (await r.call("array_keys", r.get(s, "winfo"))));
        (await r.mutate("rsort", r.argument(r.slot(s, ["winfo_keys"]))));
        r.assign(r.slot(s, ["max_wdata_num"]), r.get(r.get(s, "winfo_keys"), 0));
        r.assign(r.slot(s, ["min_wdata_num"]), r.get(r.get(s, "winfo_keys"), r.subtract((await r.call("sizeof", r.get(s, "winfo_keys"))), 1)));
        if (r.truth((r.compare(r.get(s, "result_num"), r.get(s, "winlimit")) > 0))) {
          if (r.truth((r.truth((!r.truth(((r.get(s, "start") != null))))) || r.truth((!r.truth(r.get(s, "start"))))))) {
            r.assign(r.slot(s, ["start"]), r.get(s, "max_result_gamenum"));
          }
          r.assign(r.slot(s, ["largest_mark"]), r.get(s, "max_result_gamenum"));
          r.assign(r.slot(s, ["smallest_mark"]), (await r.call("max", r.get(s, "min_result_gamenum"), r.get(s, "winlimit"))));
          if (r.truth((await r.call("in_array", r.get(s, "start"), r.get(s, "wgidarr"))))) {
            r.assign(r.slot(s, ["start_n"]), (await r.call("array_search", r.get(s, "start"), r.get(s, "wgidarr"))));
          } else {
            r.assign(r.slot(s, ["tmp_wgidarr"]), r.get(s, "wgidarr"));
            r.assign(r.slot(s, ["tmp_wgidarr", r.APPEND]), r.get(s, "start"));
            (await r.mutate("rsort", r.argument(r.slot(s, ["tmp_wgidarr"]))));
            r.assign(r.slot(s, ["start_n"]), (await r.call("array_search", r.get(s, "start"), r.get(s, "tmp_wgidarr"))));
          }
          if (r.truth((r.compare(r.get(s, "start"), r.get(s, "largest_mark")) < 0))) {
            r.assign(r.slot(s, ["larger_n"]), (await r.call("max", 0, r.subtract(r.get(s, "start_n"), r.get(s, "winlimit")))));
            r.assign(r.slot(s, ["larger_mark"]), r.get(r.get(s, "wgidarr"), r.get(s, "larger_n")));
          }
          if (r.truth((r.compare(r.get(s, "start"), r.get(s, "smallest_mark")) > 0))) {
            r.assign(r.slot(s, ["smaller_n"]), (await r.call("min", r.subtract(r.get(s, "result_num"), 1), r.add(r.get(s, "start_n"), r.get(s, "winlimit")))));
            r.assign(r.slot(s, ["smaller_mark"]), r.get(r.get(s, "wgidarr"), r.get(s, "smaller_n")));
          }
        }
      }
      if (r.truth(r.equal(r.get(s, "command"), "replay"))) {
        r.assign(r.slot(s, ["result"]), (await r.database("query", (r.text("SELECT wmode FROM ") + r.text(r.get(s, "wtablepre")) + r.text("history where gid='") + r.text(r.get(s, "gnum")) + r.text("'")))));
        if (r.truth((await r.database("num_rows", r.get(s, "result"))))) {
          r.assign(r.slot(s, ["zz"]), (await r.database("fetch_array", r.get(s, "result"))));
          r.assign(r.slot(s, ["rep_winmode"]), r.get(r.get(s, "zz"), "wmode"));
        } else {
          r.assign(r.slot(s, ["rep_winmode"]), 4);
        }
      }
    }
  }
  (await r.call("ob_start"));
  (await r.include(r.template("winner"), s, false));
  (await r.call("ob_end_flush"));
  return null;
}
