// Static native page from replay.php. Build-only source translation.
export default async function execute(r, s) {
  (await r.call("define", "CURSCRIPT", "game"));
  (await r.call("define", "IN_REPLAY", true));
  (await r.nativeInclude("request-bootstrap", s));
  r.assign(r.slot(s, ["repid"]), r.get(r.get(r.globals, "_GET"), "repid"));
  if (r.truth((!r.truth(((r.get(s, "repid") != null)))))) {
    (await r.call("header", "Location: winner.php"));
    r.exit(null);
  }
  if (r.truth((!r.truth((r.truth((r.truth((r.truth((r.compare("0", r.get(r.get(s, "repid"), 0)) <= 0)) && r.truth((r.compare(r.get(r.get(s, "repid"), 0), "9") <= 0)))) || r.truth((r.truth((r.compare("a", r.get(r.get(s, "repid"), 0)) <= 0)) && r.truth((r.compare(r.get(r.get(s, "repid"), 0), "z") <= 0)))))) || r.truth(r.equal(r.get(r.get(s, "repid"), 0), "."))))))) {
    (await r.call("header", "Location: winner.php"));
    r.exit(null);
  }
  loop0: for (r.assign(r.slot(s, ["i"]), 1); r.truth((r.compare(r.get(s, "i"), (await r.call("strlen", r.get(s, "repid")))) < 0)); r.post(r.slot(s, ["i"]), 1)) {
    if (r.truth((!r.truth((r.truth((r.truth((r.compare("0", r.get(r.get(s, "repid"), r.get(s, "i"))) <= 0)) && r.truth((r.compare(r.get(r.get(s, "repid"), r.get(s, "i")), "9") <= 0)))) || r.truth(r.equal(r.get(r.get(s, "repid"), r.get(s, "i")), "."))))))) {
      (await r.call("header", "Location: winner.php"));
      r.exit(null);
    }
  }
  if (r.truth((r.truth((r.compare("a", r.get(r.get(s, "repid"), 0)) <= 0)) && r.truth((r.compare(r.get(r.get(s, "repid"), 0), "z") <= 0))))) {
    if (r.truth(r.identical((await r.call("strpos", r.get(s, "repid"), ".")), false))) {
      (await r.call("header", "Location: winner.php"));
      r.exit(null);
    }
    r.assign(r.slot(s, ["prefix"]), (await r.call("substr", r.get(s, "repid"), 0, r.add((await r.call("strpos", r.get(s, "repid"), ".")), 1))));
    r.assign(r.slot(s, ["repid"]), (await r.call("substr", r.get(s, "repid"), r.add((await r.call("strpos", r.get(s, "repid"), ".")), 1))));
  } else {
    r.assign(r.slot(s, ["prefix"]), "");
  }
  r.assign(r.slot(s, ["cn"]), 0);
  loop1: for (r.assign(r.slot(s, ["i"]), 0); r.truth((r.compare(r.get(s, "i"), (await r.call("strlen", r.get(s, "repid")))) < 0)); r.post(r.slot(s, ["i"]), 1)) {
    if (r.truth(r.equal(r.get(r.get(s, "repid"), r.get(s, "i")), "."))) {
      r.post(r.slot(s, ["cn"]), 1);
    }
  }
  if (r.truth((r.compare(r.get(s, "cn"), 1) > 0))) {
    (await r.call("header", "Location: winner.php"));
    r.exit(null);
  }
  if (r.truth((r.compare((await r.call("strlen", r.get(s, "repid"))), 20) > 0))) {
    (await r.call("header", "Location: winner.php"));
    r.exit(null);
  }
  r.assign(r.slot(s, ["repid"]), (r.text(r.get(s, "prefix")) + r.text(r.get(s, "repid"))));
  if (r.truth(r.equal(r.get(s, "cn"), 1))) {
    if (r.truth((!r.truth((await r.call("file_exists", (r.text((r.text((r.text(r.constant("GAME_ROOT")) + r.text("./gamedata/replays/"))) + r.text(r.get(s, "repid")))) + r.text(".rep")))))))) {
      if (r.truth((!r.truth((await r.call("file_exists", (r.text((r.text((r.text(r.constant("GAME_ROOT")) + r.text("./gamedata/replays/"))) + r.text(r.get(s, "repid")))) + r.text(".dat")))))))) {
        r.assign(r.slot(s, ["flag"]), (await r.module("replay", "get_replay_remote", r.get(s, "repid"))));
        if (r.truth((!r.truth(r.get(s, "flag"))))) {
          (await r.include(r.template("no_replay"), s, false));
          r.exit(null);
        }
      } else {
        (await r.call("unfold", (r.text((r.text((r.text(r.constant("GAME_ROOT")) + r.text("./gamedata/replays/"))) + r.text(r.get(s, "repid")))) + r.text(".dat"))));
      }
    }
    r.assign(r.slot(s, ["rgnum"]), (await r.call("substr", r.get(s, "repid"), 0, (await r.call("strpos", r.get(s, "repid"), ".")))));
    r.assign(r.slot(s, ["arr"]), r.array([[r.APPEND, (await r.call("substr", r.get(s, "repid"), r.add((await r.call("strpos", r.get(s, "repid"), ".")), 1)))]]));
  } else {
    if (r.truth((!r.truth((await r.call("file_exists", (r.text((r.text((r.text(r.constant("GAME_ROOT")) + r.text("./gamedata/replays/"))) + r.text(r.get(s, "repid")))) + r.text(".rep.index")))))))) {
      if (r.truth((!r.truth((await r.call("file_exists", (r.text((r.text((r.text(r.constant("GAME_ROOT")) + r.text("./gamedata/replays/"))) + r.text(r.get(s, "repid")))) + r.text(".dat")))))))) {
        (await r.include(r.template("no_replay"), s, false));
        r.exit(null);
      } else {
        (await r.call("unfold", (r.text((r.text((r.text(r.constant("GAME_ROOT")) + r.text("./gamedata/replays/"))) + r.text(r.get(s, "repid")))) + r.text(".dat"))));
      }
    }
    r.assign(r.slot(s, ["rgnum"]), r.get(s, "repid"));
    r.assign(r.slot(s, ["arr"]), (await r.call("explode", ",", (await r.call("file_get_contents", (r.text((r.text((r.text(r.constant("GAME_ROOT")) + r.text("./gamedata/replays/"))) + r.text(r.get(s, "repid")))) + r.text(".rep.index")))))));
    r.assign(r.slot(s, ["narr"]), r.array([]));
    {
      const a3 = r.copy(r.get(s, "arr"));
      loop2: for (const [k3, v3] of r.entries(a3)) {
        r.assign(r.slot(s, ["key"]), v3);
        if (r.truth(r.equal(r.get(s, "key"), ""))) {
          continue loop2;
        }
        r.assign(r.slot(s, ["x"]), r.int(r.get(s, "key")));
        if (r.truth((await r.call("file_exists", (r.text((r.text((r.text((r.text((r.text(r.constant("GAME_ROOT")) + r.text("./gamedata/replays/"))) + r.text(r.get(s, "repid")))) + r.text("."))) + r.text(r.get(s, "x")))) + r.text(".rep")))))) {
          (await r.mutate("array_push", r.argument(r.slot(s, ["narr"])), r.text(r.get(s, "x"))));
        }
      }
    }
    r.assign(r.slot(s, ["arr"]), r.get(s, "narr"));
  }
  r.assign(r.slot(s, ["replay_player_num_tot"]), (await r.call("count", r.get(s, "arr"))));
  if (r.truth(r.equal(r.get(s, "replay_player_num_tot"), 0))) {
    (await r.include(r.template("no_replay"), s, false));
    r.exit(null);
  }
  r.assign(r.slot(s, ["rfullsz"]), 0);
  r.assign(r.slot(s, ["repindexdata"]), r.array([]));
  {
    const a5 = r.copy(r.get(s, "arr"));
    loop4: for (const [k5, v5] of r.entries(a5)) {
      r.assign(r.slot(s, ["key"]), v5);
      r.assign(r.slot(s, ["d"]), r.array([]));
      r.list([r.slot(s, ["repdatalib"]), r.slot(s, ["repgnum"]), r.slot(s, ["repname"]), r.slot(s, ["repsz"]), r.slot(s, ["repopcnt"]), r.slot(s, ["jdata"])], (await r.call("explode", ",", (await r.call("file_get_contents", (r.text((r.text((r.text((r.text((r.text(r.constant("GAME_ROOT")) + r.text("./gamedata/replays/"))) + r.text(r.get(s, "rgnum")))) + r.text("."))) + r.text(r.get(s, "key")))) + r.text(".rep")))))));
      r.assign(r.slot(s, ["d"]), (await r.call("json_decode", (await r.call("base64_decode", r.get(s, "jdata"))))));
      r.assign(r.slot(s, ["d", "pid"]), r.get(s, "key"));
      r.assign(r.slot(s, ["d", "repname"]), (await r.call("base64_decode", r.get(s, "repname"))));
      r.assign(r.slot(s, ["d", "repsz"]), r.get(s, "repsz"));
      r.assign(r.slot(s, ["d", "repopcnt"]), r.get(s, "repopcnt"));
      r.assign(r.slot(s, ["d", "repfileid"]), (r.text((r.text(r.get(s, "rgnum")) + r.text("."))) + r.text(r.get(s, "key"))));
      if (r.truth((!r.truth(((r.get(r.get(s, "d"), "color") != null)))))) {
        r.assign(r.slot(s, ["d", "color"]), (await r.module("replay", "get_ident_textcolor", r.get(r.get(s, "d"), "repname"))));
      }
      (await r.mutate("array_push", r.argument(r.slot(s, ["repindexdata"])), r.get(s, "d")));
      r.update(r.slot(s, ["rfullsz"]), "add", r.number((await r.call("substr", r.get(r.get(s, "d"), "repsz"), 0, (-r.number(2))))));
    }
  }
  r.assign(r.slot(s, ["wtablepre"]), (r.text(r.get(s, "gtablepre")) + r.text((r.truth((!r.truth((await r.call("is_numeric", (await r.call("substr", r.get(s, "prefix"), 0, 1))))))) ? (await r.call("substr", r.get(s, "prefix"), 0, 1)) : ""))));
  r.assign(r.slot(s, ["hgnum"]), r.assign(r.slot(s, ["result"]), (await r.database("query", (r.text("SELECT winner,gstime FROM ") + r.text(r.get(s, "wtablepre")) + r.text("history WHERE gid='") + r.text(r.get(s, "repgnum")) + r.text("'"))))));
  r.assign(r.slot(s, ["result"]), (await r.database("fetch_array", r.get(s, "result"))));
  r.assign(r.slot(s, ["rwinner"]), r.get(r.get(s, "result"), "winner"));
  r.assign(r.slot(s, ["rgstime"]), r.get(r.get(s, "result"), "gstime"));
  r.assign(r.slot(s, ["jrepindexdata"]), (await r.call("gencode", r.get(s, "repindexdata"))));
  r.assign(r.slot(s, ["repdatalib"]), (await r.call("base64_decode", r.get(s, "repdatalib"))));
  r.assign(r.slot(s, ["sdata"]), (await r.module("player", "create_dummy_playerdata")));
  r.assign(r.slot(s, ["sdata", "gd"]), "f");
  r.assign(r.slot(s, ["sdata", "icon"]), 0);
  (await r.module("player", "init_playerdata"));
  (await r.module("player", "parse_interface_profile"));
  r.assign(r.slot(s, ["log"]), "");
  (await r.include(r.template("replay"), s, false));
  return null;
}
