// Static native page from index.php. Build-only source translation.
export default async function execute(r, s) {
  (await r.call("define", "CURSCRIPT", "index"));
  (await r.nativeInclude("request-bootstrap", s));
  (await r.nativeInclude("room-functions", s));
  r.assign(r.slot(s, ["timing"]), 0);
  if (r.truth((r.compare(r.get(s, "gamestate"), 10) > 0))) {
    r.assign(r.slot(s, ["timing"]), r.multiply(r.subtract(r.get(s, "now"), r.get(s, "starttime")), 1000));
  } else {
    if (r.truth((r.compare(r.get(s, "starttime"), r.get(s, "now")) > 0))) {
      r.assign(r.slot(s, ["timing"]), r.multiply(r.subtract(r.get(s, "starttime"), r.get(s, "now")), 1000));
    } else {
      r.assign(r.slot(s, ["timing"]), 0);
    }
  }
  r.assign(r.slot(s, ["adminmsg"]), (await r.call("file_get_contents", "./gamedata/adminmsg.htm")));
  r.assign(r.slot(s, ["systemmsg"]), (await r.call("file_get_contents", "./gamedata/systemmsg.htm")));
  if (r.truth(r.get(s, "disable_newgame"))) {
    r.assign(r.slot(s, ["systemmsg"]), (r.text("<div class=\"evergreen2\" style=\"color:red\">即将维护 新游戏暂停开放</div>") + r.text(r.get(s, "systemmsg"))));
  } else {
    if (r.truth(r.get(s, "disable_newroom"))) {
      r.assign(r.slot(s, ["systemmsg"]), (r.text("<div class=\"evergreen2\" style=\"color:red\">即将维护 房间暂停开放</div>") + r.text(r.get(s, "systemmsg"))));
    }
  }
  r.assign(r.slot(s, ["roomlist"]), r.array([]));
  r.assign(r.slot(s, ["roomresult"]), (await r.database("query", (r.text("SELECT * FROM ") + r.text(r.get(s, "gtablepre")) + r.text("game WHERE groomid>0 AND groomstatus > 0")))));
  loop0: while (r.truth(r.assign(r.slot(s, ["data"]), (await r.database("fetch_array", r.get(s, "roomresult")))))) {
    if (r.truth((r.truth((r.compare(r.get(r.get(s, "data"), "groomstatus"), 10) >= 0)) && r.truth((r.compare(r.get(r.get(s, "data"), "groomstatus"), 40) < 0))))) {
      r.assign(r.slot(s, ["cnt"]), r.assign(r.slot(s, ["rdpmax"]), 0));
      if (r.truth((await r.call("file_exists", (r.text((r.text((r.text(r.constant("GAME_ROOT")) + r.text("./gamedata/tmp/rooms/"))) + r.text(r.get(r.get(s, "data"), "groomid")))) + r.text(".txt")))))) {
        r.assign(r.slot(s, ["roomdata"]), (await r.call("gdecode", r.get(r.get(s, "data"), "roomvars"), 1)));
        r.assign(r.slot(s, ["infochanged"]), 0);
        if (r.truth((await r.call("update_roomstate", r.get(s, "roomdata"), 0)))) {
          r.assign(r.slot(s, ["infochanged"]), 1);
        }
        if (r.truth((await r.call("room_auto_kick_check", r.get(s, "roomdata"))))) {
          r.assign(r.slot(s, ["infochanged"]), 1);
        }
        if (r.truth(r.get(s, "infochanged"))) {
          (await r.call("room_save_broadcast", r.get(r.get(s, "data"), "groomid"), r.get(s, "roomdata")));
        }
        r.list([r.slot(s, ["cnt"]), r.slot(s, ["rdpmax"])], (await r.call("room_participant_get", r.get(s, "roomdata"))));
      }
      if (r.truth((!r.truth(r.get(s, "cnt"))))) {
        (await r.database("query", (r.text("UPDATE ") + r.text(r.get(s, "gtablepre")) + r.text("game SET groomstatus = 0 WHERE groomid='") + r.text(r.get(r.get(s, "data"), "groomid")) + r.text("'"))));
        (await r.call("unlink", (r.text((r.text((r.text(r.constant("GAME_ROOT")) + r.text("./gamedata/tmp/rooms/"))) + r.text(r.get(r.get(s, "data"), "groomid")))) + r.text(".txt"))));
        r.assign(r.slot(s, ["data", "groomstatus"]), 0);
      } else {
        r.assign(r.slot(s, ["roomlist", r.get(r.get(s, "data"), "groomid"), "id"]), r.get(r.get(s, "data"), "groomid"));
        r.assign(r.slot(s, ["roomlist", r.get(r.get(s, "data"), "groomid"), "gamestate"]), r.get(r.get(s, "data"), "gamestate"));
        r.assign(r.slot(s, ["roomlist", r.get(r.get(s, "data"), "groomid"), "status"]), r.get(r.get(s, "data"), "groomstatus"));
        r.assign(r.slot(s, ["roomlist", r.get(r.get(s, "data"), "groomid"), "nowplayer"]), r.get(s, "cnt"));
        r.assign(r.slot(s, ["roomlist", r.get(r.get(s, "data"), "groomid"), "maxplayer"]), r.get(s, "rdpmax"));
        r.assign(r.slot(s, ["roomlist", r.get(r.get(s, "data"), "groomid"), "roomtype"]), r.get(r.get(s, "roomdata"), "roomtype"));
        r.assign(r.slot(s, ["roomlist", r.get(r.get(s, "data"), "groomid"), "roomdata"]), r.get(s, "roomdata"));
        r.assign(r.slot(s, ["roomlist", r.get(r.get(s, "data"), "groomid"), "soleroom"]), (await r.call("room_get_vars", r.get(s, "roomdata"), "soleroom")));
        r.assign(r.slot(s, ["roomlist", r.get(r.get(s, "data"), "groomid"), "runningtime"]), (r.truth((r.compare(r.get(r.get(s, "data"), "starttime"), 0) > 0)) ? r.subtract(r.get(s, "now"), r.get(r.get(s, "data"), "starttime")) : 0));
      }
    } else {
      if (r.truth((r.compare(r.get(r.get(s, "data"), "groomstatus"), 40) >= 0))) {
        if (r.truth((await r.call("file_exists", (r.text((r.text((r.text(r.constant("GAME_ROOT")) + r.text("./gamedata/tmp/rooms/"))) + r.text(r.get(r.get(s, "data"), "groomid")))) + r.text(".txt")))))) {
          if (r.truth(r.get(s, "___MOD_SRV"))) {
            (await r.call("curl_post", (r.text((await r.call("url_dir"))) + r.text("command.php")), r.array([["command", "room_routine_single"], ["game_roomid", r.get(r.get(s, "data"), "groomid")]]), null, 0.1));
          }
          r.assign(r.slot(s, ["roomdata"]), (await r.call("gdecode", r.get(r.get(s, "data"), "roomvars"), 1)));
          if (r.truth((await r.call("update_roomstate", r.get(s, "roomdata"), 1)))) {
            (await r.call("room_save_broadcast", r.get(r.get(s, "data"), "groomid"), r.get(s, "roomdata")));
          }
          r.assign(r.slot(s, ["roomlist", r.get(r.get(s, "data"), "groomid"), "id"]), r.get(r.get(s, "data"), "groomid"));
          r.assign(r.slot(s, ["roomlist", r.get(r.get(s, "data"), "groomid"), "gamestate"]), r.get(r.get(s, "data"), "gamestate"));
          r.assign(r.slot(s, ["roomlist", r.get(r.get(s, "data"), "groomid"), "status"]), r.get(r.get(s, "data"), "groomstatus"));
          r.assign(r.slot(s, ["roomlist", r.get(r.get(s, "data"), "groomid"), "maxplayer"]), (await r.call("room_get_vars", r.get(s, "roomdata"), "pnum")));
          r.assign(r.slot(s, ["roomlist", r.get(r.get(s, "data"), "groomid"), "roomtype"]), r.get(r.get(s, "roomdata"), "roomtype"));
          r.assign(r.slot(s, ["roomlist", r.get(r.get(s, "data"), "groomid"), "roomdata"]), r.get(s, "roomdata"));
          r.assign(r.slot(s, ["roomlist", r.get(r.get(s, "data"), "groomid"), "soleroom"]), (await r.call("room_get_vars", r.get(s, "roomdata"), "soleroom")));
          r.assign(r.slot(s, ["roomlist", r.get(r.get(s, "data"), "groomid"), "without-ready"]), (await r.call("room_get_vars", r.get(s, "roomdata"), "without-ready")));
          r.assign(r.slot(s, ["roomlist", r.get(r.get(s, "data"), "groomid"), "runningtime"]), (r.truth((r.compare(r.get(r.get(s, "data"), "starttime"), 0) > 0)) ? r.subtract(r.get(s, "now"), r.get(r.get(s, "data"), "starttime")) : 0));
          r.assign(r.slot(s, ["rid"]), (r.text("s") + r.text(r.get(r.get(s, "data"), "groomid"))));
          r.assign(r.slot(s, ["rtablepre"]), (r.text((r.text(r.get(s, "gtablepre")) + r.text(r.get(s, "rid")))) + r.text("_")));
          if (r.truth(r.get(r.get(r.get(s, "roomlist"), r.get(r.get(s, "data"), "groomid")), "without-ready"))) {
            r.assign(r.slot(s, ["endtimelimit"]), r.subtract(r.get(s, "now"), 300));
            r.assign(r.slot(s, ["result"]), (await r.database("query", (r.text("SELECT pid FROM ") + r.text(r.get(s, "rtablepre")) + r.text("players WHERE type=0 AND state <= 3 AND endtime > '") + r.text(r.get(s, "endtimelimit")) + r.text("'")))));
            r.assign(r.slot(s, ["roomlist", r.get(r.get(s, "data"), "groomid"), "nowplayer"]), (await r.database("num_rows", r.get(s, "result"))));
          } else {
            r.assign(r.slot(s, ["result"]), (await r.database("query", (r.text("SELECT name FROM ") + r.text(r.get(s, "rtablepre")) + r.text("players WHERE type=0")))));
            r.assign(r.slot(s, ["validlist"]), r.array([]));
            loop1: while (r.truth(r.assign(r.slot(s, ["vp"]), (await r.database("fetch_array", r.get(s, "result")))))) {
              r.assign(r.slot(s, ["validlist", r.APPEND]), r.get(r.get(s, "vp"), "name"));
            }
            r.assign(r.slot(s, ["roomlist", r.get(r.get(s, "data"), "groomid"), "validlist"]), r.get(s, "validlist"));
          }
        } else {
          (await r.database("query", (r.text("UPDATE ") + r.text(r.get(s, "gtablepre")) + r.text("game SET groomstatus = 0 WHERE groomid='") + r.text(r.get(r.get(s, "data"), "groomid")) + r.text("'"))));
          r.assign(r.slot(s, ["data", "groomstatus"]), 0);
        }
      }
    }
  }
  r.assign(r.slot(s, ["tmp"]), r.array([]));
  {
    const a3 = r.copy(r.get(s, "roomlist"));
    loop2: for (const [k3, v3] of r.entries(a3)) {
    r.assign(r.slot(s, ["key"]), k3);
      r.assign(r.slot(s, ["value"]), v3);
      if (r.truth(r.get(r.get(s, "value"), "soleroom"))) {
        r.assign(r.slot(s, ["wg"]), 0);
      } else {
        if (r.truth((r.compare(r.get(r.get(s, "value"), "status"), 40) >= 0))) {
          r.assign(r.slot(s, ["wg"]), 20000);
        } else {
          r.assign(r.slot(s, ["wg"]), r.subtract(10000, r.multiply(r.subtract(r.get(r.get(s, "value"), "maxplayer"), r.get(r.get(s, "value"), "nowplayer")), 100)));
        }
      }
      r.update(r.slot(s, ["wg"]), "add", r.get(r.get(s, "value"), "id"));
      if (r.truth((r.compare(r.get(s, "wg"), 0) < 0))) {
        r.assign(r.slot(s, ["wg"]), 0);
      }
      if (r.truth((!r.truth(((r.get(r.get(s, "tmp"), r.get(s, "wg")) != null)))))) {
        r.assign(r.slot(s, ["tmp", r.get(s, "wg")]), r.array([]));
      }
      (await r.mutate("array_push", r.argument(r.slot(s, ["tmp", r.get(s, "wg")])), r.get(s, "value")));
    }
  }
  (await r.mutate("ksort", r.argument(r.slot(s, ["tmp"]))));
  r.assign(r.slot(s, ["shroomlist"]), r.array([]));
  {
    const a5 = r.copy(r.get(s, "tmp"));
    loop4: for (const [k5, v5] of r.entries(a5)) {
    r.assign(r.slot(s, ["key"]), k5);
      r.assign(r.slot(s, ["value"]), v5);
      {
        const a7 = r.copy(r.get(s, "value"));
        loop6: for (const [k7, v7] of r.entries(a7)) {
          r.assign(r.slot(s, ["vval"]), v7);
          (await r.mutate("array_push", r.argument(r.slot(s, ["shroomlist"])), r.get(s, "vval")));
        }
      }
    }
  }
  if (r.truth(r.equal(r.get(s, "gametype"), 2))) {
    r.assign(r.slot(s, ["alivenum"]), r.get(s, "validnum"));
  }
  r.assign(r.slot(s, ["areaintv"]), (await r.module("map", "get_area_interval")));
  (await r.include(r.template("index"), s, false));
  await r.write("\r\n<!DOCTYPE html PUBLIC \"-//W3C//DTD XHTML 1.1//EN\" \"http://www.w3.org/TR/xhtml11/DTD/xhtml11.dtd\">\r\n<html>\r\n <head>\r\n<script type=\"text/javascript\">\r\nvar gaJsHost = ((\"https:\" == document.location.protocol) ? \"https://ssl.\" : \"http://www.\");\r\ndocument.write(unescape(\"%3Cscript src='\" + gaJsHost + \"google-analytics.com/ga.js' type='text/javascript'%3E%3C/script%3E\"));\r\n</script>\r\n<script type=\"text/javascript\">\r\ntry {\r\nvar pageTracker = _gat._getTracker(\"UA-9744745-2\");\r\npageTracker._trackPageview();\r\n} catch(err) {}</script>\r\n </head>\r\n</html>");
  return null;
}
