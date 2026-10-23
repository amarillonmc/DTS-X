// Static native page from include/pages/command_roomcmd.php. Build-only source translation.
export default async function execute(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  (await r.call("define", "CURSCRIPT", "roomcmd"));
  (await r.nativeInclude("room-configuration", s));
  (await r.nativeInclude("room-functions", s));
  if (r.truth((!r.equal(r.get(s, "command"), "ready")))) {
    r.assign(r.slot(s, ["not_ready_command_flag"]), 1);
  }
  if (r.truth((r.truth(r.equal(r.get(s, "command"), "newroom")) || r.truth(r.equal(r.get(s, "command"), "enterroom"))))) {
    if (r.truth((!r.truth((await r.call("room_check_subroom", r.get(s, "room_prefix"))))))) {
      if (r.truth(r.equal(r.get(s, "command"), "newroom"))) {
        r.assign(r.slot(s, ["rn"]), (await r.call("room_create", r.get(s, "para1"))));
        if (r.truth((r.compare(r.get(s, "rn"), 0) > 0))) {
          (await r.call("room_enter", r.get(s, "rn"), 1));
        } else {
          return r.copy(null);
        }
      } else {
        if (r.truth(r.equal(r.get(s, "command"), "enterroom"))) {
          (await r.call("room_enter", r.get(s, "para1")));
        }
      }
      return r.copy(null);
    } else {
      (await r.call("gexit", "你已在房间内，请先退出房间", "include/pages/command_roomcmd.php", 32));
      return r.copy(null);
    }
  } else {
    if (r.truth((!r.truth((await r.call("room_check_subroom", r.get(s, "room_prefix"))))))) {
      if (r.truth(r.equal(r.get(s, "command"), "leave"))) {
        (await r.call("set_current_roomid", 0));
        if (r.truth(r.get(s, "not_ajax"))) {
          await r.write(r.text("redirect:index.php"));
        } else {
          r.assign(r.slot(s, ["gamedata", "url"]), "index.php");
          await r.write(r.text((await r.call("gencode", r.get(s, "gamedata")))));
        }
      } else {
        (await r.call("gexit", "你不在房间内，请先进入房间", "include/pages/command_roomcmd.php", 51));
      }
      return r.copy(null);
    }
  }
  r.assign(r.slot(s, ["room_id_r"]), (await r.call("room_prefix2id", r.get(s, "room_prefix"))));
  if (r.truth((!r.truth((await r.call("file_exists", (r.text((r.text((r.text(r.constant("GAME_ROOT")) + r.text("./gamedata/tmp/rooms/"))) + r.text(r.get(s, "room_id_r")))) + r.text(".txt")))))))) {
    (await r.call("gexit", "房间开关文件不存在。", "include/pages/command_roomcmd.php", 60));
  }
  r.assign(r.slot(s, ["rarr"]), (await r.call("fetch_roomdata", r.get(s, "room_id_r"))));
  if (r.truth((!r.truth(r.get(s, "rarr"))))) {
    (await r.call("gexit", "房间数据记录不存在。", "include/pages/command_roomcmd.php", 70));
    return r.copy(null);
  }
  if (r.truth((r.truth((!r.truth((r.truth((r.compare(r.get(r.get(s, "rarr"), "groomstatus"), 10) >= 0)) && r.truth((r.compare(r.get(r.get(s, "rarr"), "groomstatus"), 40) < 0)))))) && r.truth((!r.equal(r.get(s, "command"), "leave")))))) {
    (await r.call("gexit", "房间不在等待状态，命令无效。", "include/pages/command_roomcmd.php", 78));
    return r.copy(null);
  }
  r.assign(r.slot(s, ["roomdata"]), (await r.call("gdecode", r.get(r.get(s, "rarr"), "roomvars"), 1)));
  if (r.truth(r.equal(r.get(r.get(s, "roomdata"), "readystat"), 2))) {
    (await r.call("gexit", "房间已开始，命令无效。", "include/pages/command_roomcmd.php", 85));
    return r.copy(null);
  }
  if (r.truth((r.compare(r.get(r.get(s, "rarr"), "groomstatus"), 40) >= 0))) {
    r.assign(r.slot(s, ["runflag"]), 1);
  } else {
    r.assign(r.slot(s, ["runflag"]), 0);
  }
  (await r.call("update_roomstate", r.get(s, "roomdata"), r.get(s, "runflag")));
  if (r.truth((await r.call("room_get_vars", r.get(s, "roomdata"), "soleroom")))) {
    if (r.truth(r.equal(r.get(s, "command"), "leave"))) {
      (await r.call("set_current_roomid", 0));
      if (r.truth(r.get(s, "not_ajax"))) {
        await r.write(r.text("redirect:index.php"));
      } else {
        r.assign(r.slot(s, ["gamedata", "url"]), "index.php");
        await r.write(r.text((await r.call("gencode", r.get(s, "gamedata")))));
      }
    }
  } else {
    if (r.truth((await r.call("room_auto_kick_check", r.get(s, "roomdata"))))) {
      (await r.call("room_save_broadcast", r.get(s, "room_id_r"), r.get(s, "roomdata")));
    }
    if (r.truth(r.equal("newchat", r.get(s, "command")))) {
      (await r.call("room_new_chat", r.get(s, "roomdata"), (r.text("<span class=\"white b\"><span class=\"yellow b\">") + r.text(r.get(s, "cuser")) + r.text(":</span>&nbsp;") + r.text(r.get(s, "para1")) + r.text("</span><br>"))));
      (await r.call("room_save_broadcast", r.get(s, "room_id_r"), r.get(s, "roomdata")));
    } else {
      if (r.truth(r.identical((await r.call("strpos", r.get(s, "command"), "pos")), 0))) {
        r.assign(r.slot(s, ["para1"]), (r.truth(r.equal("all", r.get(s, "para1"))) ? r.get(s, "para1") : r.int(r.get(s, "para1"))));
        r.assign(r.slot(s, ["upos"]), (await r.call("room_upos_check", r.get(s, "roomdata"))));
        if (r.truth((r.truth((!r.equal("all", r.get(s, "para1")))) && r.truth(r.equal(r.get(s, "para1"), r.get(s, "upos")))))) {
          (await r.call("room_new_chat", r.get(s, "roomdata"), (r.text("<span class=\"red b\">") + r.text(r.get(s, "cuser")) + r.text("试图操作他自己的位置</span><br>"))));
        } else {
          if (r.truth((r.truth((!r.equal("all", r.get(s, "para1")))) && r.truth((r.truth((r.compare(r.get(s, "para1"), 0) < 0)) || r.truth((r.compare(r.get(s, "para1"), (await r.call("room_get_vars", r.get(s, "roomdata"), "pnum"))) >= 0))))))) {
            (await r.call("room_new_chat", r.get(s, "roomdata"), (r.text("<span class=\"red b\">") + r.text(r.get(s, "cuser")) + r.text("试图操作一个不存在的位置</span><br>"))));
          } else {
            if (r.truth(r.equal(r.get(s, "command"), "pos_enter"))) {
              if (r.truth(r.get(r.get(r.get(r.get(s, "roomdata"), "player"), r.get(s, "para1")), "forbidden"))) {
                (await r.call("room_new_chat", r.get(s, "roomdata"), (r.text("<span class=\"red b\">") + r.text(r.get(s, "cuser")) + r.text("试图进入一个被禁用的位置</span><br>"))));
              } else {
                if (r.truth(r.get(r.get(r.get(r.get(s, "roomdata"), "player"), r.get(s, "para1")), "name"))) {
                  (await r.call("room_new_chat", r.get(s, "roomdata"), (r.text("<span class=\"red b\">") + r.text(r.get(s, "cuser")) + r.text("试图进入一个有人的位置</span><br>"))));
                } else {
                  if (r.truth((r.compare(r.get(s, "upos"), 0) >= 0))) {
                    r.assign(r.slot(s, ["roomdata", "player", r.get(s, "upos"), "name"]), "");
                    r.assign(r.slot(s, ["roomdata", "player", r.get(s, "upos"), "ready"]), 0);
                    if (r.truth(r.equal(r.get(s, "upos"), (await r.call("room_team_leader_check", r.get(s, "roomdata"), r.get(s, "upos")))))) {
                      (await r.call("room_refresh_team_pos", r.get(s, "roomdata"), r.get(s, "upos")));
                    }
                  }
                  r.assign(r.slot(s, ["roomdata", "player", r.get(s, "para1"), "name"]), r.get(s, "cuser"));
                  r.assign(r.slot(s, ["roomdata", "player", r.get(s, "para1"), "ready"]), 0);
                  if (r.truth((r.compare(r.get(s, "upos"), 0) < 0))) {
                    (await r.call("room_new_chat", r.get(s, "roomdata"), (r.text("<span class=\"grey b\">") + r.text(r.get(s, "cuser")) + r.text("进入了一个空位置</span><br>"))));
                  } else {
                    (await r.call("room_new_chat", r.get(s, "roomdata"), (r.text("<span class=\"grey b\">") + r.text(r.get(s, "cuser")) + r.text("移动了位置</span><br>"))));
                  }
                }
              }
            } else {
              if (r.truth((r.compare(r.get(s, "upos"), 0) < 0))) {
                (await r.call("room_new_chat", r.get(s, "roomdata"), (r.text("<span class=\"red b\">不在房间内的") + r.text(r.get(s, "cuser")) + r.text("试图操作一个位置</span><br>"))));
              } else {
                if (r.truth((r.truth(r.equal(r.get(s, "command"), "pos_disable")) || r.truth(r.equal(r.get(s, "command"), "pos_enable"))))) {
                  r.assign(r.slot(s, ["checkpos"]), (r.truth((await r.call("is_numeric", r.get(s, "para1")))) ? r.get(s, "para1") : r.get(s, "upos")));
                  if (r.truth((r.truth((!r.truth((await r.call("is_numeric", r.get(s, "para1")))))) && r.truth((!r.equal("all", r.get(s, "para1"))))))) {
                    (await r.call("room_new_chat", r.get(s, "roomdata"), (r.text("<span class=\"red b\">") + r.text(r.get(s, "cuser")) + r.text("试图操作一个错误的位置</span><br>"))));
                  } else {
                    if (r.truth((r.truth((!r.truth((await r.call("room_creater_check", r.get(s, "upos")))))) && r.truth((!r.equal(r.get(s, "upos"), (await r.call("room_team_leader_check", r.get(s, "roomdata"), r.get(s, "checkpos"))))))))) {
                      (await r.call("room_new_chat", r.get(s, "roomdata"), (r.text("<span class=\"red b\">并非队长的") + r.text(r.get(s, "cuser")) + r.text("试图操作一个位置</span><br>"))));
                    } else {
                      if (r.truth(r.get(r.get(r.get(r.get(s, "roomdata"), "player"), r.get(s, "para1")), "name"))) {
                        (await r.call("room_new_chat", r.get(s, "roomdata"), (r.text("<span class=\"red b\">") + r.text(r.get(s, "cuser")) + r.text("试图操作一个有人的位置</span><br>"))));
                      } else {
                        r.assign(r.slot(s, ["roomdata", "player", r.get(s, "upos"), "ready"]), 0);
                        if (r.truth(r.equal(r.get(s, "command"), "pos_disable"))) {
                          if (r.truth((r.truth((!r.truth((!r.truth((await r.call("room_get_vars", r.get(s, "roomdata"), "cannot-forbid"))))))) || r.truth((r.compare((await r.call("room_get_vars", r.get(s, "roomdata"), "pnum")), 2) <= 0))))) {
                            (await r.call("room_new_chat", r.get(s, "roomdata"), (r.text("<span class=\"red b\">") + r.text(r.get(s, "cuser")) + r.text("试图禁用一个位置，但本房间不允许禁用</span><br>"))));
                          } else {
                            if (r.truth(r.equal("all", r.get(s, "para1")))) {
                              if (r.truth((await r.call("room_creater_check", r.get(s, "upos"))))) {
                                {
                                  const a1 = r.get(r.get(s, "roomdata"), "player");
                                  loop0: for (const [k1, v1] of r.entries(a1)) {
                                  r.assign(r.slot(s, ["rk"]), k1);
                                    r.bind(r.slot(s, ["rv"]), a1, k1);
                                    if (r.truth((!r.truth(r.get(r.get(s, "rv"), "name"))))) {
                                      r.assign(r.slot(s, ["rv", "forbidden"]), 1);
                                    }
                                  }
                                }
                                (await r.call("room_new_chat", r.get(s, "roomdata"), (r.text("<span class=\"grey b\">") + r.text(r.get(s, "cuser")) + r.text("禁用了全部空位置</span><br>"))));
                              } else {
                                {
                                  const a3 = r.get(r.get(s, "roomdata"), "player");
                                  loop2: for (const [k3, v3] of r.entries(a3)) {
                                  r.assign(r.slot(s, ["rk"]), k3);
                                    r.bind(r.slot(s, ["rv"]), a3, k3);
                                    if (r.truth((r.truth((!r.truth(r.get(r.get(s, "rv"), "name")))) && r.truth(r.equal(r.get(s, "upos"), (await r.call("room_team_leader_check", r.get(s, "roomdata"), r.get(s, "rk")))))))) {
                                      r.assign(r.slot(s, ["rv", "forbidden"]), 1);
                                    }
                                  }
                                }
                                (await r.call("room_new_chat", r.get(s, "roomdata"), (r.text("<span class=\"grey b\">") + r.text(r.get(s, "cuser")) + r.text("禁用了其队伍中的全部空位置</span><br>"))));
                              }
                            } else {
                              r.assign(r.slot(s, ["roomdata", "player", r.get(s, "para1"), "name"]), "");
                              r.assign(r.slot(s, ["roomdata", "player", r.get(s, "para1"), "forbidden"]), 1);
                              if (r.truth((!r.truth((await r.call("room_creater_check", r.get(s, "upos"))))))) {
                                (await r.call("room_new_chat", r.get(s, "roomdata"), (r.text("<span class=\"grey b\">") + r.text(r.get(s, "cuser")) + r.text("禁用了其队伍的一个位置</span><br>"))));
                              } else {
                                (await r.call("room_new_chat", r.get(s, "roomdata"), (r.text("<span class=\"grey b\">") + r.text(r.get(s, "cuser")) + r.text("禁用了房间的一个位置</span><br>"))));
                              }
                            }
                          }
                        } else {
                          if (r.truth(r.equal(r.get(s, "command"), "pos_enable"))) {
                            r.assign(r.slot(s, ["roomdata", "player", r.get(s, "para1"), "name"]), "");
                            r.assign(r.slot(s, ["roomdata", "player", r.get(s, "para1"), "forbidden"]), 0);
                            if (r.truth((!r.equal(r.get(s, "upos"), 0)))) {
                              (await r.call("room_new_chat", r.get(s, "roomdata"), (r.text("<span class=\"grey b\">") + r.text(r.get(s, "cuser")) + r.text("重新启用了其队伍的一个位置</span><br>"))));
                            } else {
                              (await r.call("room_new_chat", r.get(s, "roomdata"), (r.text("<span class=\"grey b\">") + r.text(r.get(s, "cuser")) + r.text("重新启用了房间的一个位置</span><br>"))));
                            }
                          }
                        }
                      }
                    }
                  }
                } else {
                  if (r.truth(r.equal(r.get(s, "command"), "pos_kick"))) {
                    if (r.truth((!r.truth(r.get(r.get(r.get(r.get(s, "roomdata"), "player"), r.get(s, "para1")), "name"))))) {
                      (await r.call("room_new_chat", r.get(s, "roomdata"), (r.text("<span class=\"red b\">") + r.text(r.get(s, "cuser")) + r.text("试图踢掉一个不存在的玩家</span><br>"))));
                    } else {
                      if (r.truth((r.truth((!r.truth((await r.call("room_creater_check", r.get(s, "upos")))))) && r.truth((!r.equal(r.get(s, "upos"), (await r.call("room_team_leader_check", r.get(s, "roomdata"), r.get(s, "para1"))))))))) {
                        (await r.call("room_new_chat", r.get(s, "roomdata"), (r.text("<span class=\"red b\">并非房主或队长的") + r.text(r.get(s, "cuser")) + r.text("试图踢人</span><br>"))));
                      } else {
                        if (r.truth(r.equal(r.get(s, "upos"), r.get(s, "para1")))) {
                          (await r.call("room_new_chat", r.get(s, "roomdata"), (r.text("<span class=\"red b\">") + r.text(r.get(s, "cuser")) + r.text("试图踢自己</span><br>"))));
                        } else {
                          if (r.truth(r.equal(r.get(s, "para1"), (await r.call("room_team_leader_check", r.get(s, "roomdata"), r.get(s, "para1")))))) {
                            (await r.call("room_refresh_team_pos", r.get(s, "roomdata"), r.get(s, "para1")));
                          }
                          r.assign(r.slot(s, ["tmp"]), r.get(r.get(r.get(r.get(s, "roomdata"), "player"), r.get(s, "para1")), "name"));
                          r.assign(r.slot(s, ["roomdata", "player", r.get(s, "para1"), "name"]), "");
                          r.assign(r.slot(s, ["roomdata", "player", r.get(s, "para1"), "ready"]), 0);
                          (await r.call("room_new_chat", r.get(s, "roomdata"), (r.text("<span class=\"grey b\">") + r.text(r.get(s, "cuser")) + r.text("将") + r.text(r.get(s, "tmp")) + r.text("踢出了房间</span><br>"))));
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
        (await r.call("room_save_broadcast", r.get(s, "room_id_r"), r.get(s, "roomdata")));
      } else {
        if (r.truth(r.equal("rmsetmode", r.get(s, "command")))) {
          r.assign(r.slot(s, ["para1"]), r.int(r.get(s, "para1")));
          r.assign(r.slot(s, ["upos"]), (await r.call("room_upos_check", r.get(s, "roomdata"))));
          if (r.truth((r.truth((r.truth((r.truth(r.equal(r.get(s, "upos"), 0)) && r.truth((await r.call("in_array", r.get(s, "para1"), (await r.call("array_keys", r.get(s, "roomtypelist")))))))) && r.truth((!r.equal(r.get(s, "para1"), r.get(r.get(s, "roomdata"), "roomtype")))))) && r.truth((!r.truth(r.get(r.get(r.get(s, "roomtypelist"), r.get(s, "para1")), "soleroom"))))))) {
            r.assign(r.slot(s, ["nroomdata"]), (await r.call("room_init", r.get(s, "para1"))));
            r.assign(r.slot(s, ["nroomdata", "chatdata"]), r.get(r.get(s, "roomdata"), "chatdata"));
            r.alias(r.slot(s, ["rdplist"]), (await r.call("room_get_vars_ref", r.get(s, "roomdata"), "player")));
            r.alias(r.slot(s, ["nrdplist"]), (await r.call("room_get_vars_ref", r.get(s, "nroomdata"), "player")));
            r.assign(r.slot(s, ["rdpnum"]), (await r.call("room_get_vars", r.get(s, "roomdata"), "pnum")));
            r.assign(r.slot(s, ["nrdpnum"]), (await r.call("room_get_vars", r.get(s, "nroomdata"), "pnum")));
            r.assign(r.slot(s, ["inum"]), (await r.call("min", r.get(s, "rdpnum"), r.get(s, "nrdpnum"))));
            loop4: for (r.assign(r.slot(s, ["i"]), 0); r.truth((r.compare(r.get(s, "i"), r.get(s, "inum")) < 0)); r.post(r.slot(s, ["i"]), 1)) {
              if (r.truth((r.truth((r.truth((await r.call("in_array", r.get(s, "para1"), r.array([[r.APPEND, 1], [r.APPEND, 2], [r.APPEND, 3], [r.APPEND, 4]])))) && r.truth(r.get(r.get(r.get(s, "rdplist"), r.get(s, "i")), "forbidden")))) && r.truth((!r.truth(r.get(r.get(r.get(s, "rdplist"), r.get(s, "i")), "name"))))))) {
                r.assign(r.slot(s, ["nrdplist", r.get(s, "i"), "forbidden"]), 1);
              } else {
                if (r.truth(r.get(r.get(r.get(s, "rdplist"), r.get(s, "i")), "name"))) {
                  r.assign(r.slot(s, ["nrdplist", r.get(s, "i"), "name"]), r.get(r.get(r.get(s, "rdplist"), r.get(s, "i")), "name"));
                }
              }
            }
            r.assign(r.slot(s, ["nroomdata", "timestamp"]), r.get(r.get(s, "roomdata"), "timestamp"));
            r.assign(r.slot(s, ["roomdata"]), r.get(s, "nroomdata"));
            r.assign(r.slot(s, ["rname"]), (await r.call("room_get_vars", r.get(s, "roomdata"), "name")));
            (await r.call("room_new_chat", r.get(s, "roomdata"), (r.text("<span class=\"grey b\">") + r.text(r.get(s, "cuser")) + r.text("将房间模式修改为了") + r.text(r.get(s, "rname")) + r.text("</span><br>"))));
            (await r.call("room_save_broadcast", r.get(s, "room_id_r"), r.get(s, "roomdata")));
          } else {
            (await r.call("room_new_chat", r.get(s, "roomdata"), (r.text("<span class=\"red b\">") + r.text(r.get(s, "cuser")) + r.text("试图修改房间模式但未成功</span><br>"))));
          }
        } else {
          if (r.truth(r.equal("game-option", r.get(s, "command")))) {
            r.assign(r.slot(s, ["upos"]), (await r.call("room_upos_check", r.get(s, "roomdata"))));
            if (r.truth((!r.equal(r.get(s, "upos"), 0)))) {
              (await r.call("room_new_chat", r.get(s, "roomdata"), (r.text("<span class=\"red b\">并非房主的") + r.text(r.get(s, "cuser")) + r.text("试图改变游戏设置</span><br>"))));
            } else {
              if (r.truth((!r.truth((await r.call("room_check_game_option", r.get(r.get(s, "roomdata"), "roomtype"), r.get(s, "para1"), r.get(s, "para2"))))))) {
                (await r.call("room_new_chat", r.get(s, "roomdata"), (r.text("<span class=\"red b\">") + r.text(r.get(s, "cuser")) + r.text("试图设置一个错误的游戏参数</span><br>"))));
              } else {
                r.assign(r.slot(s, ["go"]), (await r.call("room_get_vars", r.get(s, "roomdata"), "game-option")));
                r.assign(r.slot(s, ["gokey_words"]), r.get(r.get(r.get(s, "go"), r.get(s, "para1")), "title"));
                r.assign(r.slot(s, ["o_oval"]), r.get((await r.call("room_get_vars", r.get(s, "roomdata"), "current_game_option")), r.get(s, "para1")));
                if (r.truth(r.equal(r.get(r.get(r.get(s, "go"), r.get(s, "para1")), "type"), "number"))) {
                  if (r.truth((!r.truth(r.get(s, "o_oval"))))) {
                    r.assign(r.slot(s, ["o_oval"]), 0);
                  }
                  r.assign(r.slot(s, ["o_oval_words"]), r.get(s, "o_oval"));
                  r.assign(r.slot(s, ["n_oval_words"]), r.get(s, "para2"));
                  (await r.call("room_set_game_option", r.get(s, "roomdata"), r.get(s, "para1"), r.get(s, "para2")));
                } else {
                  {
                    const a6 = r.copy(r.get(r.get(r.get(s, "go"), r.get(s, "para1")), "options"));
                    loop5: for (const [k6, v6] of r.entries(a6)) {
                      r.assign(r.slot(s, ["ov"]), v6);
                      if (r.truth(r.equal(r.get(r.get(s, "ov"), "value"), r.get(s, "o_oval")))) {
                        r.assign(r.slot(s, ["o_oval_words"]), r.get(r.get(s, "ov"), "name"));
                      }
                      if (r.truth(r.equal(r.get(r.get(s, "ov"), "value"), r.get(s, "para2")))) {
                        r.assign(r.slot(s, ["n_oval_words"]), r.get(r.get(s, "ov"), "name"));
                      }
                      if (r.truth((r.truth(((r.get(s, "o_oval_words") != null))) && r.truth(((r.get(s, "n_oval_words") != null)))))) {
                        break loop5;
                      }
                    }
                  }
                  (await r.call("room_set_game_option", r.get(s, "roomdata"), r.get(s, "para1"), r.get(s, "para2")));
                }
                if (r.truth((!r.truth(r.get(r.get(r.get(s, "go"), r.get(s, "para1")), "no-notice-when-modified"))))) {
                  (await r.call("room_new_chat", r.get(s, "roomdata"), (r.text("<span class=\"grey b\">") + r.text(r.get(s, "cuser")) + r.text("将 ") + r.text(r.get(s, "gokey_words")) + r.text(" 从 ") + r.text(r.get(s, "o_oval_words")) + r.text(" 变为 ") + r.text(r.get(s, "n_oval_words")) + r.text(" </span><br>"))));
                } else {
                  (await r.call("room_timestamp_tick", r.get(s, "roomdata")));
                }
                if (r.truth(r.equal("group-num", r.get(s, "para1")))) {
                  r.assign(r.slot(s, ["range1"]), r.multiply((await r.call("min", r.get(s, "para2"), r.get(s, "o_oval"))), 5));
                  r.assign(r.slot(s, ["range2"]), r.multiply((await r.call("max", r.get(s, "para2"), r.get(s, "o_oval"))), 5));
                  loop7: for (r.assign(r.slot(s, ["oi"]), r.get(s, "range1")); r.truth((r.compare(r.get(s, "oi"), r.get(s, "range2")) < 0)); r.post(r.slot(s, ["oi"]), 1)) {
                    r.assign(r.slot(s, ["roomdata", "player", r.get(s, "oi"), "name"]), "");
                    r.assign(r.slot(s, ["roomdata", "player", r.get(s, "oi"), "ready"]), 0);
                    r.assign(r.slot(s, ["roomdata", "player", r.get(s, "oi"), "forbidden"]), 0);
                  }
                }
              }
            }
            (await r.call("room_save_broadcast", r.get(s, "room_id_r"), r.get(s, "roomdata")));
          } else {
            if (r.truth(r.equal("leave", r.get(s, "command")))) {
              if (r.truth((r.compare(r.get(r.get(s, "rarr"), "groomstatus"), 40) < 0))) {
                r.assign(r.slot(s, ["upos"]), (await r.call("room_upos_check", r.get(s, "roomdata"))));
                if (r.truth((r.compare(r.get(s, "upos"), 0) >= 0))) {
                  r.alias(r.slot(s, ["rdplist"]), (await r.call("room_get_vars_ref", r.get(s, "roomdata"), "player")));
                  if (r.truth(r.equal(r.get(s, "upos"), (await r.call("room_team_leader_check", r.get(s, "roomdata"), r.get(s, "upos")))))) {
                    (await r.call("room_refresh_team_pos", r.get(s, "roomdata"), r.get(s, "upos")));
                  }
                  r.assign(r.slot(s, ["rdplist", r.get(s, "upos"), "name"]), "");
                  r.assign(r.slot(s, ["rdplist", r.get(s, "upos"), "ready"]), 0);
                }
              }
              (await r.call("room_new_chat", r.get(s, "roomdata"), (r.text("<span class=\"grey b\">") + r.text(r.get(s, "cuser")) + r.text("离开了房间</span><br>"))));
              (await r.call("room_save_broadcast", r.get(s, "room_id_r"), r.get(s, "roomdata")));
              (await r.call("set_current_roomid", 0));
              if (r.truth(r.get(s, "not_ajax"))) {
                await r.write(r.text("redirect:index.php"));
              } else {
                r.assign(r.slot(s, ["gamedata", "url"]), "index.php");
                await r.write(r.text((await r.call("gencode", r.get(s, "gamedata")))));
              }
            } else {
              if (r.truth((r.truth(r.equal("ready", r.get(s, "command"))) && r.truth((!r.truth(r.get(s, "not_ready_command_flag"))))))) {
                if (r.truth((r.truth(r.get(s, "disable_newgame")) || r.truth(r.get(s, "disable_newroom"))))) {
                  (await r.call("set_current_roomid", 0));
                  (await r.call("gexit", "系统维护中，暂时不能进入房间。"));
                  return r.copy(null);
                }
                r.assign(r.slot(s, ["upos"]), (await r.call("room_upos_check", r.get(s, "roomdata"))));
                r.alias(r.slot(s, ["rdplist"]), (await r.call("room_get_vars_ref", r.get(s, "roomdata"), "player")));
                r.assign(r.slot(s, ["rdpnum"]), (await r.call("room_get_vars", r.get(s, "roomdata"), "pnum")));
                if (r.truth((r.truth((r.truth((r.truth((r.compare(r.get(s, "upos"), 0) >= 0)) && r.truth(r.equal(r.get(r.get(s, "roomdata"), "readystat"), 1)))) && r.truth((!r.truth(r.get(r.get(r.get(s, "rdplist"), r.get(s, "upos")), "ready")))))) && r.truth((!r.truth((await r.call("room_get_vars", r.get(s, "roomdata"), "without-ready")))))))) {
                  r.assign(r.slot(s, ["rdplist", r.get(s, "upos"), "ready"]), 1);
                  r.assign(r.slot(s, ["flag"]), 1);
                  loop8: for (r.assign(r.slot(s, ["i"]), 0); r.truth((r.compare(r.get(s, "i"), r.get(s, "rdpnum")) < 0)); r.post(r.slot(s, ["i"]), 1)) {
                    if (r.truth((r.truth((!r.truth(r.get(r.get(r.get(s, "rdplist"), r.get(s, "i")), "forbidden")))) && r.truth((!r.truth(r.get(r.get(r.get(s, "rdplist"), r.get(s, "i")), "ready"))))))) {
                      r.assign(r.slot(s, ["flag"]), 0);
                    }
                  }
                  (await r.call("room_new_chat", r.get(s, "roomdata"), (r.text("<span class=\"grey b\">") + r.text(r.get(s, "cuser")) + r.text("点击了准备</span><br>"))));
                  if (r.truth(r.get(s, "flag"))) {
                    r.assign(r.slot(s, ["roomdata", "readystat"]), 2);
                    (await r.call("room_new_chat", r.get(s, "roomdata"), "<span class=\"grey b\">所有人均已准备，游戏即将开始..</span><br>"));
                  }
                  (await r.call("room_save_broadcast", r.get(s, "room_id_r"), r.get(s, "roomdata")));
                  if (r.truth(r.get(s, "flag"))) {
                    (await r.nativeInclude("battlefield-entry", s));
                    r.assign(r.slot(s, ["roomdata", "readystat"]), 0);
                    (await r.call("roomdata_save", r.get(s, "room_id_r"), r.get(s, "roomdata")));
                    r.assign(r.slot(s, ["gamestate"]), 0);
                    r.assign(r.slot(s, ["gametype"]), (await r.call("room_get_vars", r.get(s, "roomdata"), "gtype")));
                    r.assign(r.slot(s, ["starttime"]), r.get(s, "now"));
                    (await r.call("save_gameinfo"));
                    (await r.module("sys", "routine"));
                    if (r.truth(r.equal(r.get(r.get(s, "roomdata"), "roomtype"), 0))) {
                      (await r.call("addnews", r.get(s, "now"), "roominfo", (await r.call("room_get_vars", r.get(s, "roomdata"), "name")), (r.text((r.text((r.text((r.text("对决者:&nbsp;") + r.text((await r.call("room_getteamhtml", r.get(s, "roomdata"), 0))))) + r.text("&nbsp;<span class=\"yellow b\">VS</span>&nbsp;"))) + r.text((await r.call("room_getteamhtml", r.get(s, "roomdata"), 1))))) + r.text("！"))));
                    } else {
                      if (r.truth(r.equal(r.get(r.get(s, "roomdata"), "roomtype"), 1))) {
                        (await r.call("addnews", r.get(s, "now"), "roominfo", (await r.call("room_get_vars", r.get(s, "roomdata"), "name")), (r.text((r.text((r.text((r.text("对决者:&nbsp;<span style=\"color:#ff0022\">红队&nbsp;") + r.text((await r.call("room_getteamhtml", r.get(s, "roomdata"), 0))))) + r.text("</span>&nbsp;<span class=\"yellow b\">VS</span>&nbsp;<span style=\"color:#5900ff\">蓝队 "))) + r.text((await r.call("room_getteamhtml", r.get(s, "roomdata"), 5))))) + r.text("</span>！"))));
                      } else {
                        if (r.truth(r.equal(r.get(r.get(s, "roomdata"), "roomtype"), 2))) {
                          (await r.call("addnews", r.get(s, "now"), "roominfo", (await r.call("room_get_vars", r.get(s, "roomdata"), "name")), (r.text((r.text((r.text((r.text((r.text((r.text("对决者:&nbsp;<span style=\"color:#ff0022\">红队&nbsp;") + r.text((await r.call("room_getteamhtml", r.get(s, "roomdata"), 0))))) + r.text("</span>&nbsp;<span class=\"yellow b\">VS</span>&nbsp;<span style=\"color:#5900ff\">蓝队 "))) + r.text((await r.call("room_getteamhtml", r.get(s, "roomdata"), 5))))) + r.text("</span>&nbsp;<span class=\"yellow b\">VS</span>&nbsp;<span style=\"color:#8cff00\">绿队 "))) + r.text((await r.call("room_getteamhtml", r.get(s, "roomdata"), 10))))) + r.text("</span>！"))));
                        } else {
                          if (r.truth(r.equal(r.get(r.get(s, "roomdata"), "roomtype"), 3))) {
                            (await r.call("addnews", r.get(s, "now"), "roominfo", (await r.call("room_get_vars", r.get(s, "roomdata"), "name")), (r.text((r.text((r.text((r.text((r.text((r.text((r.text((r.text("对决者:&nbsp;<span style=\"color:#ff0022\">红队&nbsp;") + r.text((await r.call("room_getteamhtml", r.get(s, "roomdata"), 0))))) + r.text("</span>&nbsp;<span class=\"yellow b\">VS</span>&nbsp;<span style=\"color:#5900ff\">蓝队 "))) + r.text((await r.call("room_getteamhtml", r.get(s, "roomdata"), 5))))) + r.text("</span>&nbsp;<span class=\"yellow b\">VS</span>&nbsp;<span style=\"color:#8cff00\">绿队 "))) + r.text((await r.call("room_getteamhtml", r.get(s, "roomdata"), 10))))) + r.text("</span>&nbsp;<span class=\"yellow b\">VS</span>&nbsp;<span style=\"color:#ffc700\">黄队 "))) + r.text((await r.call("room_getteamhtml", r.get(s, "roomdata"), 15))))) + r.text("</span>！"))));
                          } else {
                            if (r.truth(r.equal(r.get(r.get(s, "roomdata"), "roomtype"), 4))) {
                              r.assign(r.slot(s, ["groupnum"]), (await r.call("room_get_vars", r.get(s, "roomdata"), "group-num")));
                              r.assign(r.slot(s, ["newsarr"]), r.array([]));
                              loop9: for (r.assign(r.slot(s, ["gi"]), 0); r.truth((r.compare(r.get(s, "gi"), r.get(s, "groupnum")) < 0)); r.post(r.slot(s, ["gi"]), 1)) {
                                r.assign(r.slot(s, ["newsarr", r.APPEND]), (r.text((r.text((r.text((r.text((r.text((r.text("<span style=\"color:") + r.text(r.get((await r.call("room_get_vars", r.get(s, "roomdata"), "color")), r.multiply(r.get(s, "gi"), 5))))) + r.text("\">"))) + r.text(r.get((await r.call("room_get_vars", r.get(s, "roomdata"), "teamID")), r.multiply(r.get(s, "gi"), 5))))) + r.text("&nbsp;"))) + r.text((await r.call("room_getteamhtml", r.get(s, "roomdata"), r.multiply(r.get(s, "gi"), 5)))))) + r.text("</span>")));
                              }
                              (await r.call("addnews", r.get(s, "now"), "roominfo", (await r.call("room_get_vars", r.get(s, "roomdata"), "name")), "对决者:&nbsp;", "", "", (r.text((await r.call("implode", "&nbsp;<span class=\"yellow b\">VS</span>&nbsp;", r.get(s, "newsarr")))) + r.text("！"))));
                            } else {
                              if (r.truth(r.equal(r.get(r.get(s, "roomdata"), "roomtype"), 5))) {
                                (await r.call("addnews", r.get(s, "now"), "roominfo", (await r.call("room_get_vars", r.get(s, "roomdata"), "name")), (r.text((r.text("挑战者：") + r.text((await r.call("room_getteamhtml", r.get(s, "roomdata"), 0))))) + r.text("！"))));
                              } else {
                                if (r.truth(r.equal(r.get(r.get(s, "roomdata"), "roomtype"), 6))) {
                                  (await r.call("addnews", r.get(s, "now"), "roominfo", (await r.call("room_get_vars", r.get(s, "roomdata"), "name")), (r.text((r.text("挑战者：") + r.text((await r.call("room_getteamhtml", r.get(s, "roomdata"), 0))))) + r.text("！"))));
                                } else {
                                  if (r.truth(r.equal(r.get(r.get(s, "roomdata"), "roomtype"), 11))) {
                                    r.assign(r.slot(s, ["alvl"]), r.int(r.get((await r.call("room_get_vars", r.get(s, "roomdata"), "current_game_option")), "lvl")));
                                    (await r.call("addnews", r.get(s, "now"), "roominfo", (await r.call("room_get_vars", r.get(s, "roomdata"), "name")), (r.text((r.text((r.text((r.text("挑战者：") + r.text((await r.call("room_getteamhtml", r.get(s, "roomdata"), 0))))) + r.text("，挑战等级："))) + r.text(r.get(s, "alvl")))) + r.text("。"))));
                                  }
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                    r.assign(r.slot(s, ["namelist"]), r.array([]));
                    loop10: for (r.assign(r.slot(s, ["i"]), 0); r.truth((r.compare(r.get(s, "i"), r.get(s, "rdpnum")) < 0)); r.post(r.slot(s, ["i"]), 1)) {
                      if (r.truth((!r.truth(r.get(r.get(r.get(s, "rdplist"), r.get(s, "i")), "forbidden"))))) {
                        r.assign(r.slot(s, ["pname"]), r.get(r.get(r.get(s, "rdplist"), r.get(s, "i")), "name"));
                        r.assign(r.slot(s, ["namelist", r.APPEND]), r.text(r.get(s, "pname")));
                      }
                    }
                    r.assign(r.slot(s, ["ulist"]), (await r.call("fetch_udata_multilist", "*", r.array([["username", r.get(s, "namelist")]]))));
                    if (r.truth((!r.truth(r.get(s, "ulist"))))) {
                      return r.copy(null);
                    }
                    if (r.truth((r.truth((await r.call("room_get_vars", r.get(s, "roomdata"), "without-valid"))) || r.truth((r.truth(r.equal(2, (await r.call("room_get_vars", r.get(s, "roomdata"), "card-select")))) || r.truth(r.equal(3, (await r.call("room_get_vars", r.get(s, "roomdata"), "card-select"))))))))) {
                      r.assign(r.slot(s, ["ownercard"]), r.assign(r.slot(s, ["leadercard"]), 0));
                      loop11: for (r.assign(r.slot(s, ["i"]), 0); r.truth((r.compare(r.get(s, "i"), r.get(s, "rdpnum")) < 0)); r.post(r.slot(s, ["i"]), 1)) {
                        if (r.truth((!r.truth(r.get(r.get(r.get(s, "rdplist"), r.get(s, "i")), "forbidden"))))) {
                          r.assign(r.slot(s, ["pname"]), r.get(r.get(r.get(s, "rdplist"), r.get(s, "i")), "name"));
                          r.assign(r.slot(s, ["pname"]), r.text(r.get(s, "pname")));
                          if (r.truth((!r.truth(((r.get(r.get(s, "ulist"), r.get(s, "pname")) != null)))))) {
                            continue loop11;
                          }
                          r.assign(r.slot(s, ["udata"]), r.get(r.get(s, "ulist"), r.get(s, "pname")));
                          if (r.truth(r.equal(0, (await r.call("room_get_vars", r.get(s, "roomdata"), "card-select"))))) {
                            r.assign(r.slot(s, ["pcard"]), r.get(r.get(s, "udata"), "card"));
                          } else {
                            if (r.truth(r.equal(1, (await r.call("room_get_vars", r.get(s, "roomdata"), "card-select"))))) {
                              r.assign(r.slot(s, ["pcard"]), 0);
                            } else {
                              if (r.truth(r.equal(2, (await r.call("room_get_vars", r.get(s, "roomdata"), "card-select"))))) {
                                if (r.truth((!r.truth(r.get(s, "i"))))) {
                                  r.assign(r.slot(s, ["pcard"]), r.assign(r.slot(s, ["ownercard"]), r.get(r.get(s, "udata"), "card")));
                                } else {
                                  r.assign(r.slot(s, ["pcard"]), r.get(s, "ownercard"));
                                }
                              } else {
                                if (r.truth(r.equal(3, (await r.call("room_get_vars", r.get(s, "roomdata"), "card-select"))))) {
                                  if (r.truth(r.equal(r.get(s, "i"), r.get((await r.call("room_get_vars", r.get(s, "roomdata"), "leader-position")), r.get(s, "i"))))) {
                                    r.assign(r.slot(s, ["pcard"]), r.assign(r.slot(s, ["leadercard"]), r.get(r.get(s, "udata"), "card")));
                                  } else {
                                    r.assign(r.slot(s, ["pcard"]), r.get(s, "leadercard"));
                                  }
                                }
                              }
                            }
                          }
                          if (r.truth(((r.get(r.get(r.get(s, "roomtypelist"), r.get(r.get(s, "roomdata"), "roomtype")), "card") != null)))) {
                            r.assign(r.slot(s, ["pcard"]), r.get(r.get(r.get(r.get(s, "roomtypelist"), r.get(r.get(s, "roomdata"), "roomtype")), "card"), r.get(s, "i")));
                          }
                          (await r.call("enter_battlefield", r.get(r.get(s, "udata"), "username"), r.get(r.get(s, "udata"), "password"), r.get(r.get(s, "udata"), "gender"), r.get(r.get(s, "udata"), "icon"), r.get(s, "pcard"), r.get(r.get(s, "udata"), "ip")));
                          (await r.database("query", (r.text("UPDATE ") + r.text(r.get(s, "tablepre")) + r.text("players SET teamID='") + r.text(r.get(r.get(r.get(r.get(s, "roomtypelist"), r.get(r.get(s, "roomdata"), "roomtype")), "teamID"), r.get(r.get(r.get(r.get(s, "roomtypelist"), r.get(r.get(s, "roomdata"), "roomtype")), "leader-position"), r.get(s, "i")))) + r.text("' WHERE name='") + r.text(r.get(s, "pname")) + r.text("' AND type=0"))));
                        }
                      }
                      r.assign(r.slot(s, ["opgamestate"]), (await r.call("room_get_vars", r.get(s, "roomdata"), "opening-gamestate")));
                      r.assign(r.slot(s, ["gamestate"]), 30);
                      if (r.truth((r.truth((await r.call("in_array", r.get(r.get(s, "roomdata"), "roomtype"), r.array([[r.APPEND, 0], [r.APPEND, 1], [r.APPEND, 2], [r.APPEND, 3], [r.APPEND, 4]])))) && r.truth((r.truth((!r.truth(r.get(s, "opgamestate")))) || r.truth(r.equal(40, r.get(s, "opgamestate")))))))) {
                        r.assign(r.slot(s, ["gamestate"]), 40);
                        (await r.call("addnews", r.get(s, "now"), "combo"));
                        (await r.call("systemputchat", r.get(s, "now"), "combo"));
                      } else {
                        if (r.truth((!r.truth((!r.truth(r.get(s, "opgamestate"))))))) {
                          r.assign(r.slot(s, ["gamestate"]), r.get(s, "opgamestate"));
                        } else {
                          if (r.truth(r.equal(r.get(r.get(s, "roomdata"), "roomtype"), 11))) {
                            r.assign(r.slot(s, ["current_go"]), (await r.call("room_get_vars", r.get(s, "roomdata"), "current_game_option")));
                            r.assign(r.slot(s, ["alvl"]), r.int(r.get(r.get(s, "current_go"), "lvl")));
                            if (r.truth((r.compare(r.get(s, "alvl"), 20) >= 0))) {
                              r.assign(r.slot(s, ["gamestate"]), 40);
                              (await r.call("addnews", r.get(s, "now"), "combo"));
                              (await r.call("systemputchat", r.get(s, "now"), "combo"));
                            }
                          }
                        }
                      }
                    } else {
                      r.assign(r.slot(s, ["gamestate"]), 20);
                      r.assign(r.slot(s, ["seat_info"]), r.assign(r.slot(s, ["teamID_info"]), r.array([])));
                      loop12: for (r.assign(r.slot(s, ["i"]), 0); r.truth((r.compare(r.get(s, "i"), r.get(s, "rdpnum")) < 0)); r.post(r.slot(s, ["i"]), 1)) {
                        if (r.truth((!r.truth(r.get(r.get(r.get(s, "rdplist"), r.get(s, "i")), "forbidden"))))) {
                          r.assign(r.slot(s, ["pname"]), r.text(r.get(r.get(r.get(s, "rdplist"), r.get(s, "i")), "name")));
                          if (r.truth((!r.truth(((r.get(r.get(s, "ulist"), r.get(s, "pname")) != null)))))) {
                            continue loop12;
                          }
                          r.assign(r.slot(s, ["seat_info", r.APPEND]), r.get(s, "pname"));
                          r.assign(r.slot(s, ["teamID_info", r.get(s, "pname")]), r.get(r.get(r.get(r.get(s, "roomtypelist"), r.get(r.get(s, "roomdata"), "roomtype")), "teamID"), r.get(r.get(r.get(r.get(s, "roomtypelist"), r.get(r.get(s, "roomdata"), "roomtype")), "leader-position"), r.get(s, "i"))));
                        }
                      }
                      r.assign(r.slot(s, ["gamevars", "seat_info"]), r.get(s, "seat_info"));
                      r.assign(r.slot(s, ["gamevars", "max_player"]), (await r.call("sizeof", r.get(s, "seat_info"))));
                      r.assign(r.slot(s, ["gamevars", "teamID_info"]), r.get(s, "teamID_info"));
                      r.assign(r.slot(s, ["gamevars", "max_opening_sec"]), 180);
                      r.assign(r.slot(s, ["opgamestate"]), (await r.call("room_get_vars", r.get(s, "roomdata"), "opening-gamestate")));
                      if (r.truth((r.truth((await r.call("in_array", r.get(r.get(s, "roomdata"), "roomtype"), r.array([[r.APPEND, 0], [r.APPEND, 1], [r.APPEND, 2], [r.APPEND, 3], [r.APPEND, 4]])))) && r.truth((r.truth((!r.truth(r.get(s, "opgamestate")))) || r.truth(r.equal(40, r.get(s, "opgamestate")))))))) {
                        r.assign(r.slot(s, ["gamevars", "opgamestate"]), 40);
                      } else {
                        if (r.truth((!r.truth((!r.truth(r.get(s, "opgamestate"))))))) {
                          r.assign(r.slot(s, ["gamevars", "opgamestate"]), r.get(s, "opgamestate"));
                        }
                      }
                    }
                    (await r.call("save_gameinfo"));
                    (await r.database("query", (r.text("UPDATE ") + r.text(r.get(s, "gtablepre")) + r.text("game SET groomstatus=40 WHERE groomid='") + r.text(r.get(s, "room_id_r")) + r.text("'"))));
                    r.post(r.slot(s, ["roomdata", "timestamp"]), 1);
                    r.assign(r.slot(s, ["roomdata", "chatdata"]), r.get((await r.call("room_init", r.get(r.get(s, "roomdata"), "roomtype"))), "chatdata"));
                    (await r.call("room_save_broadcast", r.get(s, "room_id_r"), r.get(s, "roomdata")));
                  }
                }
              } else {
                if (r.truth(r.equal("start", r.get(s, "command")))) {
                  if (r.truth((r.truth(r.get(s, "disable_newgame")) || r.truth(r.get(s, "disable_newroom"))))) {
                    (await r.call("set_current_roomid", 0));
                    (await r.call("gexit", "系统维护中，暂时不能进入房间。"));
                    return r.copy(null);
                  }
                  r.assign(r.slot(s, ["upos"]), (await r.call("room_upos_check", r.get(s, "roomdata"))));
                  r.alias(r.slot(s, ["rdplist"]), (await r.call("room_get_vars_ref", r.get(s, "roomdata"), "player")));
                  r.assign(r.slot(s, ["rdpnum"]), (await r.call("room_get_vars", r.get(s, "roomdata"), "pnum")));
                  if (r.truth((r.truth(r.equal(r.get(s, "upos"), 0)) && r.truth((await r.call("room_get_vars", r.get(s, "roomdata"), "without-ready")))))) {
                    r.assign(r.slot(s, ["rdplist", r.get(s, "upos"), "ready"]), 1);
                    r.assign(r.slot(s, ["gamestate"]), 0);
                    r.assign(r.slot(s, ["gametype"]), (await r.call("room_get_vars", r.get(s, "roomdata"), "gtype")));
                    r.assign(r.slot(s, ["starttime"]), r.get(s, "now"));
                    (await r.call("save_gameinfo"));
                    (await r.module("sys", "routine"));
                    r.assign(r.slot(s, ["roomdata", "readystat"]), 2);
                    r.post(r.slot(s, ["roomdata", "timestamp"]), 1);
                    (await r.call("room_save_broadcast", r.get(s, "room_id_r"), r.get(s, "roomdata")));
                    (await r.database("query", (r.text("UPDATE ") + r.text(r.get(s, "gtablepre")) + r.text("game SET groomstatus=40 WHERE groomid='") + r.text(r.get(s, "room_id_r")) + r.text("'"))));
                    r.assign(r.slot(s, ["roomdata", "readystat"]), 0);
                    r.post(r.slot(s, ["roomdata", "timestamp"]), 1);
                    r.assign(r.slot(s, ["roomdata", "chatdata"]), r.get((await r.call("room_init", r.get(r.get(s, "roomdata"), "roomtype"))), "chatdata"));
                    (await r.call("room_save_broadcast", r.get(s, "room_id_r"), r.get(s, "roomdata")));
                  }
                }
              }
            }
          }
        }
      }
    }
  }
  return null;
}
