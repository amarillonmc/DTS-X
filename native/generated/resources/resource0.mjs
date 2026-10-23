// Static native page from include/itemplace.func.php. Build-only source translation.
export default async function execute(r, s) {
  {
    const static0 = Object.create(null);
    r.defineLocal("init_item_place", async (...args) => {
      const s = Object.create(null);
      r.global(s, "npc_typeinfo");
      r.global(s, "plsinfo");
      r.global(s, "gamecfg");
      r.global(s, "iplacedata");
      r.assign(r.slot(s, ["iplacefilelist"]), r.array([["mapitem", (r.text(r.constant("GAME_ROOT")) + r.text("/include/modules/base/itemmain/config/mapitem.config.php"))], ["mapitem_i8", (r.text(r.constant("GAME_ROOT")) + r.text("./include/modules/extra/instance/instance8_proud/config/mapitem.config.php"))], ["mapitem_i9", (r.text(r.constant("GAME_ROOT")) + r.text("./include/modules/extra/instance/instance9_rush/config/mapitem.config.php"))], ["shopitem", (r.text(r.constant("GAME_ROOT")) + r.text("./include/modules/base/itemshop/config/shopitem.config.php"))], ["mixitem", (r.text(r.constant("GAME_ROOT")) + r.text("./include/modules/base/itemmix/itemmix/config/itemmix.config.php"))], ["syncitem", (r.text(r.constant("GAME_ROOT")) + r.text("./include/modules/base/itemmix/itemmix_sync/config/sync.config.php"))], ["overlayitem", (r.text(r.constant("GAME_ROOT")) + r.text("./include/modules/base/itemmix/itemmix_overlay/config/overlay.config.php"))], ["presentitem", (r.text(r.constant("GAME_ROOT")) + r.text("./include/modules/base/items/boxes/config/present.config.php"))], ["present2item", (r.text(r.constant("GAME_ROOT")) + r.text("./include/modules/base/items/boxes/config/present2.config.php"))], ["ygoitem", (r.text(r.constant("GAME_ROOT")) + r.text("./include/modules/base/items/boxes/config/ygobox.config.php"))], ["fyboxitem", (r.text(r.constant("GAME_ROOT")) + r.text("./include/modules/base/items/boxes/config/fybox.config.php"))], ["rdollitem", (r.text(r.constant("GAME_ROOT")) + r.text("./include/modules/base/items/boxes/config/rdoll.config.php"))], ["npc", (r.text(r.constant("GAME_ROOT")) + r.text("./include/modules/base/npc/config/npc.data.config.php"))], ["npc_i8", (r.text(r.constant("GAME_ROOT")) + r.text("./include/modules/extra/instance/instance8_proud/config/npc.data.config.php"))], ["npc_i9", (r.text(r.constant("GAME_ROOT")) + r.text("./include/modules/extra/instance/instance9_rush/config/npc.data.config.php"))], ["addnpc", (r.text(r.constant("GAME_ROOT")) + r.text("./include/modules/base/addnpc/config/addnpc.config.php"))], ["evonpc", (r.text(r.constant("GAME_ROOT")) + r.text("./include/modules/extra/club/skills/skill21/config/evonpc.config.php"))], ["wepchange", (r.text(r.constant("GAME_ROOT")) + r.text("./include/modules/extra/attr/wepchange/config/wepchange.config.php"))]]));
      r.assign(r.slot(s, ["iplacefiledata"]), r.array([]));
      {
        const a2 = r.copy(r.get(s, "iplacefilelist"));
        loop1: for (const [k2, v2] of r.entries(a2)) {
        r.assign(r.slot(s, ["ipfkey"]), k2);
          r.assign(r.slot(s, ["ipfval"]), v2);
          if (r.truth(r.equal(r.get(s, "ipfkey"), "mixitem"))) {
            (await r.include(r.get(s, "ipfval"), s, false));
            r.assign(r.slot(s, ["iplacefiledata", r.get(s, "ipfkey")]), r.get(s, "mixinfo"));
          } else {
            if (r.truth((!r.identical((await r.call("strpos", r.get(s, "ipfkey"), "npc")), false)))) {
              (await r.include(r.get(s, "ipfval"), s, false));
              if (r.truth(r.equal(r.get(s, "ipfkey"), "npc"))) {
                r.assign(r.slot(s, ["varname"]), "npcinfo");
              } else {
                if (r.truth(r.equal(r.get(s, "ipfkey"), "npc_i8"))) {
                  r.assign(r.slot(s, ["varname"]), "npcinfo_instance8");
                } else {
                  if (r.truth(r.equal(r.get(s, "ipfkey"), "npc_i9"))) {
                    r.assign(r.slot(s, ["varname"]), "npcinfo_instance9");
                  } else {
                    if (r.truth(r.equal(r.get(s, "ipfkey"), "addnpc"))) {
                      r.assign(r.slot(s, ["varname"]), "anpcinfo");
                    } else {
                      if (r.truth(r.equal(r.get(s, "ipfkey"), "evonpc"))) {
                        r.assign(r.slot(s, ["varname"]), "enpcinfo");
                      }
                    }
                  }
                }
              }
              if (r.truth((!r.truth((!r.truth(r.get(s, "varname"))))))) {
                r.assign(r.slot(s, ["iplacefiledata", r.get(s, "ipfkey")]), r.get(s, r.get(s, "varname")));
              }
            } else {
              r.assign(r.slot(s, ["iplacefiledata", r.get(s, "ipfkey")]), (await r.call("openfile", r.get(s, "ipfval"))));
            }
          }
        }
      }
      {
        const a4 = r.copy(r.array([[r.APPEND, "mapitem"], [r.APPEND, "mapitem_i8"], [r.APPEND, "mapitem_i9"]]));
        loop3: for (const [k4, v4] of r.entries(a4)) {
          r.assign(r.slot(s, ["val"]), v4);
          r.assign(r.slot(s, ["combined"]), r.array([]));
          {
            const a6 = r.copy(r.get(r.get(s, "iplacefiledata"), r.get(s, "val")));
            loop5: for (const [k6, v6] of r.entries(a6)) {
              r.assign(r.slot(s, ["ndv"]), v6);
              r.assign(r.slot(s, ["ndv_a"]), (await r.call("explode", ",", (await r.call("trim", r.get(s, "ndv"))))));
              if (r.truth((r.compare((await r.call("sizeof", r.get(s, "ndv_a"))), 1) <= 0))) {
                continue loop5;
              }
              r.assign(r.slot(s, ["ndv_num"]), r.get(r.get(s, "ndv_a"), 2));
              r.assign(r.slot(s, ["ndv_a", 2]), 0);
              r.assign(r.slot(s, ["ndv_a", 4]), "");
              r.assign(r.slot(s, ["ndv_a", 5]), 0);
              r.assign(r.slot(s, ["ndv_a", 6]), 1);
              r.assign(r.slot(s, ["ndv_a", 7]), "");
              r.assign(r.slot(s, ["ndv"]), (await r.call("implode", ",", r.get(s, "ndv_a"))));
              if (r.truth((!r.truth(((r.get(r.get(s, "combined"), r.get(s, "ndv")) != null)))))) {
                r.assign(r.slot(s, ["combined", r.get(s, "ndv")]), r.get(s, "ndv_num"));
              } else {
                r.update(r.slot(s, ["combined", r.get(s, "ndv")]), "add", r.get(s, "ndv_num"));
              }
            }
          }
          r.assign(r.slot(s, ["iplacefiledata", r.get(s, "val")]), r.array([]));
          {
            const a8 = r.copy(r.get(s, "combined"));
            loop7: for (const [k8, v8] of r.entries(a8)) {
            r.assign(r.slot(s, ["ck"]), k8);
              r.assign(r.slot(s, ["cv"]), v8);
              r.assign(r.slot(s, ["ck_a"]), (await r.call("explode", ",", r.get(s, "ck"))));
              r.assign(r.slot(s, ["ck_a", 2]), r.get(s, "cv"));
              r.assign(r.slot(s, ["iplacefiledata", r.get(s, "val"), r.APPEND]), (await r.call("implode", ",", r.get(s, "ck_a"))));
            }
          }
        }
      }
      {
        const a10 = r.copy(r.array([[r.APPEND, "shopitem"]]));
        loop9: for (const [k10, v10] of r.entries(a10)) {
          r.assign(r.slot(s, ["val"]), v10);
          {
            const a12 = r.copy(r.get(r.get(s, "iplacefiledata"), r.get(s, "val")));
            loop11: for (const [k12, v12] of r.entries(a12)) {
            r.assign(r.slot(s, ["ndk"]), k12);
              r.assign(r.slot(s, ["ndv"]), v12);
              r.assign(r.slot(s, ["iplacefiledata", r.get(s, "val"), r.get(s, "ndk")]), (await r.call("trim", r.get(s, "ndv"))));
            }
          }
        }
      }
      {
        const a14 = r.copy(r.array([[r.APPEND, "mapitem"], [r.APPEND, "shopitem"]]));
        loop13: for (const [k14, v14] of r.entries(a14)) {
          r.assign(r.slot(s, ["val"]), v14);
          r.assign(r.slot(s, ["basedata"]), r.get(r.get(s, "iplacefiledata"), r.get(s, "val")));
          r.assign(r.slot(s, ["modelist"]), r.array([[r.APPEND, "i8"], [r.APPEND, "i9"]]));
          {
            const a16 = r.copy(r.get(s, "modelist"));
            loop15: for (const [k16, v16] of r.entries(a16)) {
              r.assign(r.slot(s, ["mval"]), v16);
              if (r.truth(((r.get(r.get(s, "iplacefiledata"), (r.text((r.text(r.get(s, "val")) + r.text("_"))) + r.text(r.get(s, "mval")))) != null)))) {
                r.assign(r.slot(s, ["diff1"]), (await r.call("array_diff", r.get(r.get(s, "iplacefiledata"), (r.text((r.text(r.get(s, "val")) + r.text("_"))) + r.text(r.get(s, "mval")))), r.get(s, "basedata"))));
                r.assign(r.slot(s, ["diff2"]), (await r.call("array_diff", r.get(s, "basedata"), r.get(r.get(s, "iplacefiledata"), (r.text((r.text(r.get(s, "val")) + r.text("_"))) + r.text(r.get(s, "mval")))))));
                r.assign(r.slot(s, ["diff"]), (await r.call("array_merge", r.get(s, "diff1"), r.get(s, "diff2"))));
                r.assign(r.slot(s, ["changedlist"]), r.array([]));
                {
                  const a18 = r.copy(r.get(s, "diff"));
                  loop17: for (const [k18, v18] of r.entries(a18)) {
                    r.assign(r.slot(s, ["dfv"]), v18);
                    r.assign(r.slot(s, ["dfv"]), (await r.call("explode", ",", r.get(s, "dfv"))));
                    if (r.truth((!r.truth((await r.call("in_array", r.get(r.get(s, "dfv"), 3), r.get(s, "changedlist"))))))) {
                      r.assign(r.slot(s, ["changedlist", r.APPEND]), r.get(r.get(s, "dfv"), 3));
                    }
                  }
                }
                r.assign(r.slot(s, ["addlist"]), r.array([]));
                {
                  const a20 = r.copy(r.get(r.get(s, "iplacefiledata"), (r.text((r.text(r.get(s, "val")) + r.text("_"))) + r.text(r.get(s, "mval")))));
                  loop19: for (const [k20, v20] of r.entries(a20)) {
                    r.assign(r.slot(s, ["ipmv"]), v20);
                    r.assign(r.slot(s, ["tmp_ipmv"]), (await r.call("explode", ",", r.get(s, "ipmv"))));
                    if (r.truth((await r.call("in_array", r.get(r.get(s, "tmp_ipmv"), 3), r.get(s, "changedlist"))))) {
                      r.assign(r.slot(s, ["addlist", r.APPEND]), r.get(s, "ipmv"));
                    }
                  }
                }
                r.assign(r.slot(s, ["iplacefiledata", (r.text((r.text(r.get(s, "val")) + r.text("_"))) + r.text(r.get(s, "mval")))]), r.get(s, "addlist"));
              }
            }
          }
          r.unset(r.slot(s, ["basedata"]));
        }
      }
      r.assign(r.slot(s, ["iplacedata"]), r.array([]));
      {
        const a22 = r.copy(r.get(s, "iplacefiledata"));
        loop21: for (const [k22, v22] of r.entries(a22)) {
        r.assign(r.slot(s, ["ipdkey"]), k22);
          r.assign(r.slot(s, ["ipdval"]), v22);
          {
            const a24 = r.copy(r.get(s, "ipdval"));
            loop23: for (const [k24, v24] of r.entries(a24)) {
            r.assign(r.slot(s, ["ipdkey2"]), k24);
              r.assign(r.slot(s, ["ipdval2"]), v24);
              r.assign(r.slot(s, ["idata"]), "");
              if (r.truth(r.identical((await r.call("strpos", r.get(s, "ipdkey"), "mapitem")), 0))) {
                if (r.truth((r.truth((!r.truth((!r.truth(r.get(s, "ipdval2")))))) && r.truth((!r.identical((await r.call("strpos", r.get(s, "ipdval2"), ",")), false)))))) {
                  r.list([r.slot(s, ["iarea"]), r.slot(s, ["imap"]), r.slot(s, ["inum"]), r.slot(s, ["iname"]), r.slot(s, ["ikind"]), r.slot(s, ["ieff"]), r.slot(s, ["ista"]), r.slot(s, ["iskind"])], (await r.call("explode", ",", r.get(s, "ipdval2"))));
                  if (r.truth(r.equal(r.get(s, "iarea"), 99))) {
                    r.update(r.slot(s, ["idata"]), "concat", "每禁");
                  } else {
                    if (r.truth(r.equal(r.get(s, "iarea"), 98))) {
                      r.update(r.slot(s, ["idata"]), "concat", "1禁后每禁");
                    } else {
                      r.update(r.slot(s, ["idata"]), "concat", (r.text(r.get(s, "iarea")) + r.text("禁")));
                    }
                  }
                  if (r.truth(r.equal(r.get(s, "imap"), 99))) {
                    r.update(r.slot(s, ["idata"]), "concat", "全图随机");
                  } else {
                    r.update(r.slot(s, ["idata"]), "concat", (r.text("于") + r.text(r.get(r.get(s, "plsinfo"), r.get(s, "imap")))));
                  }
                  r.update(r.slot(s, ["idata"]), "concat", (r.text("刷新") + r.text(r.get(s, "inum")) + r.text("个")));
                  if (r.truth((!r.identical((await r.call("strpos", r.get(s, "ipdkey"), "_")), false)))) {
                    if (r.truth(r.equal(r.get(s, "ipdkey"), "mapitem_i8"))) {
                      r.assign(r.slot(s, ["idata"]), (r.text("<span class=cyan>荣耀模式</span>：") + r.text(r.get(s, "idata"))));
                    } else {
                      if (r.truth(r.equal(r.get(s, "ipdkey"), "mapitem_i9"))) {
                        r.assign(r.slot(s, ["idata"]), (r.text("<span class=red>极速模式</span>：") + r.text(r.get(s, "idata"))));
                      }
                    }
                  }
                }
              } else {
                if (r.truth(r.identical((await r.call("strpos", r.get(s, "ipdkey"), "shopitem")), 0))) {
                  if (r.truth((r.truth((!r.truth((!r.truth(r.get(s, "ipdval2")))))) && r.truth((!r.identical((await r.call("strpos", r.get(s, "ipdval2"), ",")), false)))))) {
                    r.list([r.slot(s, ["kind"]), r.slot(s, ["num"]), r.slot(s, ["price"]), r.slot(s, ["area"]), r.slot(s, ["iname"])], (await r.call("explode", ",", r.get(s, "ipdval2"))));
                    if (r.truth((!r.truth(r.get(r.get(s, "iplacedata"), r.get(s, "iname")))))) {
                      r.assign(r.slot(s, ["iplacedata", r.get(s, "iname")]), r.array([]));
                    }
                    r.update(r.slot(s, ["idata"]), "concat", (r.text(r.get(s, "area")) + r.text("禁起在商店中出售(") + r.text(r.get(s, "price")) + r.text("元)")));
                    if (r.truth((!r.identical((await r.call("strpos", r.get(s, "ipdkey"), "_")), false)))) {
                      if (r.truth(r.equal(r.get(s, "ipdkey"), "shopitem_i8"))) {
                        r.assign(r.slot(s, ["idata"]), (r.text("<span class=cyan>荣耀模式</span>：") + r.text(r.get(s, "idata"))));
                      } else {
                        if (r.truth(r.equal(r.get(s, "ipdkey"), "shopitem_i9"))) {
                          r.assign(r.slot(s, ["idata"]), (r.text("<span class=red>极速模式</span>：") + r.text(r.get(s, "idata"))));
                        }
                      }
                    }
                  }
                } else {
                  if (r.truth(r.identical((await r.call("strpos", r.get(s, "ipdkey"), "mixitem")), 0))) {
                    if (r.truth((!r.equal(r.get(r.get(s, "ipdval2"), "class"), "hidden")))) {
                      r.assign(r.slot(s, ["iname"]), (await r.call("trim", r.get(r.get(r.get(s, "ipdval2"), "result"), 0))));
                      r.assign(r.slot(s, ["idata"]), (r.text("通过合成获取：") + r.text((await r.call("implode", "+", r.get(r.get(s, "ipdval2"), "stuff"))))));
                    }
                  } else {
                    if (r.truth((r.truth(r.identical((await r.call("strpos", r.get(s, "ipdkey"), "sync")), 0)) || r.truth(r.identical((await r.call("strpos", r.get(s, "ipdkey"), "overlay")), 0))))) {
                      if (r.truth((r.truth((!r.truth((!r.truth(r.get(s, "ipdval2")))))) && r.truth((!r.identical((await r.call("strpos", r.get(s, "ipdval2"), ",")), false)))))) {
                        r.list([r.slot(s, ["iname"]), r.slot(s, ["kind"])], (await r.call("explode", ",", r.get(s, "ipdval2"))));
                        if (r.truth((!r.truth(r.get(r.get(s, "iplacedata"), r.get(s, "iname")))))) {
                          r.assign(r.slot(s, ["iplacedata", r.get(s, "iname")]), r.array([]));
                        }
                        r.assign(r.slot(s, ["idata"]), (r.truth(r.identical((await r.call("strpos", r.get(s, "ipdkey"), "sync")), 0)) ? "通过同调合成获取" : "通过超量合成获取"));
                      }
                    } else {
                      if (r.truth((r.truth((r.truth((r.truth(r.identical((await r.call("strpos", r.get(s, "ipdkey"), "present")), 0)) || r.truth(r.identical((await r.call("strpos", r.get(s, "ipdkey"), "ygo")), 0)))) || r.truth(r.identical((await r.call("strpos", r.get(s, "ipdkey"), "fybox")), 0)))) || r.truth(r.identical((await r.call("strpos", r.get(s, "ipdkey"), "rdoll")), 0))))) {
                        if (r.truth((r.truth((!r.truth((!r.truth(r.get(s, "ipdval2")))))) && r.truth((!r.identical((await r.call("strpos", r.get(s, "ipdval2"), ",")), false)))))) {
                          r.list([r.slot(s, ["iname"]), r.slot(s, ["kind"])], (await r.call("explode", ",", r.get(s, "ipdval2"))));
                          if (r.truth(r.identical((await r.call("strpos", r.get(s, "ipdkey"), "present")), 0))) {
                            r.assign(r.slot(s, ["idata"]), "打开礼品盒时有概率获得");
                          } else {
                            if (r.truth(r.identical((await r.call("strpos", r.get(s, "ipdkey"), "present2")), 0))) {
                              r.assign(r.slot(s, ["idata"]), "打开银色盒子时有概率获得");
                            } else {
                              if (r.truth(r.identical((await r.call("strpos", r.get(s, "ipdkey"), "ygo")), 0))) {
                                r.assign(r.slot(s, ["idata"]), "打开游戏王卡包时有概率获得");
                              } else {
                                if (r.truth(r.identical((await r.call("strpos", r.get(s, "ipdkey"), "fybox")), 0))) {
                                  r.assign(r.slot(s, ["idata"]), "打开浮云时有概率获得");
                                } else {
                                  if (r.truth(r.identical((await r.call("strpos", r.get(s, "ipdkey"), "rdoll")), 0))) {
                                    r.assign(r.slot(s, ["idata"]), "打开★奇怪的盒子★时有概率获得");
                                  }
                                }
                              }
                            }
                          }
                        }
                      } else {
                        if (r.truth((!r.identical((await r.call("strpos", r.get(s, "ipdkey"), "npc")), false)))) {
                          r.assign(r.slot(s, ["nownpclist"]), r.array([[r.APPEND, r.get(s, "ipdval2")]]));
                          if (r.truth(((r.get(r.get(s, "ipdval2"), "sub") != null)))) {
                            r.assign(r.slot(s, ["ipdval2", "type"]), r.get(s, "ipdkey2"));
                            r.assign(r.slot(s, ["nownpclist"]), r.array([]));
                            {
                              const a26 = r.copy(r.get(r.get(s, "ipdval2"), "sub"));
                              loop25: for (const [k26, v26] of r.entries(a26)) {
                                r.assign(r.slot(s, ["subval"]), v26);
                                r.assign(r.slot(s, ["nownpclist", r.APPEND]), (await r.call("array_merge", r.get(s, "ipdval2"), r.get(s, "subval"))));
                              }
                            }
                          } else {
                            if (r.truth(r.equal(r.get(s, "ipdkey"), "evonpc"))) {
                              r.assign(r.slot(s, ["nownpclist"]), r.get(s, "ipdval2"));
                              {
                                const a28 = r.get(s, "nownpclist");
                                loop27: for (const [k28, v28] of r.entries(a28)) {
                                  r.bind(r.slot(s, ["nval"]), a28, k28);
                                  r.assign(r.slot(s, ["nval", "type"]), r.get(s, "ipdkey2"));
                                }
                              }
                            }
                          }
                          {
                            const a30 = r.copy(r.get(s, "nownpclist"));
                            loop29: for (const [k30, v30] of r.entries(a30)) {
                              r.assign(r.slot(s, ["nownpc"]), v30);
                              {
                                const a32 = r.copy(r.array([[r.APPEND, "wep"], [r.APPEND, "arb"], [r.APPEND, "arh"], [r.APPEND, "ara"], [r.APPEND, "arf"], [r.APPEND, "art"], [r.APPEND, "itm1"], [r.APPEND, "itm2"], [r.APPEND, "itm3"], [r.APPEND, "itm4"], [r.APPEND, "itm5"], [r.APPEND, "itm6"]]));
                                loop31: for (const [k32, v32] of r.entries(a32)) {
                                  r.assign(r.slot(s, ["nipval"]), v32);
                                  if (r.truth((!r.truth((!r.truth(r.get(r.get(s, "nownpc"), r.get(s, "nipval")))))))) {
                                    r.assign(r.slot(s, ["iname"]), r.get(r.get(s, "nownpc"), r.get(s, "nipval")));
                                    r.assign(r.slot(s, ["idata"]), (r.text((r.text((r.text((r.text("击倒") + r.text(r.get(r.get(s, "npc_typeinfo"), r.get(r.get(s, "nownpc"), "type"))))) + r.text(" "))) + r.text(r.get(r.get(s, "nownpc"), "name")))) + r.text("可拾取")));
                                    if (r.truth((r.truth(((r.get(r.get(s, "iplacedata"), r.get(s, "iname")) != null))) && r.truth((await r.call("in_array", r.get(s, "idata"), r.get(r.get(s, "iplacedata"), r.get(s, "iname")))))))) {
                                      r.assign(r.slot(s, ["idata"]), "");
                                    } else {
                                      if (r.truth((!r.identical((await r.call("strpos", r.get(s, "ipdkey"), "_")), false)))) {
                                        if (r.truth(r.equal(r.get(s, "ipdkey"), "npc_i8"))) {
                                          r.assign(r.slot(s, ["idata"]), (r.text("<span class=cyan>荣耀模式</span>：") + r.text(r.get(s, "idata"))));
                                        } else {
                                          if (r.truth(r.equal(r.get(s, "ipdkey"), "npc_i9"))) {
                                            r.assign(r.slot(s, ["idata"]), (r.text("<span class=rdd>极速模式</span>：") + r.text(r.get(s, "idata"))));
                                          }
                                        }
                                      }
                                    }
                                    if (r.truth((!r.truth(r.get(r.get(s, "iplacedata"), r.get(s, "iname")))))) {
                                      r.assign(r.slot(s, ["iplacedata", r.get(s, "iname")]), r.array([]));
                                    }
                                    if (r.truth((r.truth((!r.truth((!r.truth(r.get(s, "iname")))))) && r.truth((!r.truth((!r.truth(r.get(s, "idata"))))))))) {
                                      r.assign(r.slot(s, ["iplacedata", r.get(s, "iname"), r.APPEND]), r.get(s, "idata"));
                                    }
                                  }
                                }
                              }
                            }
                          }
                        } else {
                          if (r.truth(r.identical((await r.call("strpos", r.get(s, "ipdkey"), "wepchange")), 0))) {
                            if (r.truth((r.truth((!r.truth((!r.truth(r.get(s, "ipdval2")))))) && r.truth((!r.identical((await r.call("strpos", r.get(s, "ipdval2"), ",")), false)))))) {
                              r.list([r.slot(s, ["iname0"]), r.slot(s, ["iname"])], (await r.call("explode", ",", r.get(s, "ipdval2"))));
                              r.assign(r.slot(s, ["idata"]), (r.text((r.text("从") + r.text(r.get(s, "iname0")))) + r.text("切换「武器模式」获得")));
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
              if (r.truth((!r.truth(r.get(r.get(s, "iplacedata"), r.get(s, "iname")))))) {
                r.assign(r.slot(s, ["iplacedata", r.get(s, "iname")]), r.array([]));
              }
              if (r.truth((r.truth((!r.truth((!r.truth(r.get(s, "iname")))))) && r.truth((!r.truth((!r.truth(r.get(s, "idata"))))))))) {
                if (r.truth((r.truth((r.truth(r.identical((await r.call("strpos", r.get(s, "ipdkey"), "present")), 0)) || r.truth(r.identical((await r.call("strpos", r.get(s, "ipdkey"), "ygo")), 0)))) || r.truth(r.identical((await r.call("strpos", r.get(s, "ipdkey"), "fybox")), 0))))) {
                  if (r.truth((!r.truth((await r.call("in_array", r.get(s, "idata"), r.get(r.get(s, "iplacedata"), r.get(s, "iname")))))))) {
                    r.assign(r.slot(s, ["iplacedata", r.get(s, "iname"), r.APPEND]), r.get(s, "idata"));
                  }
                } else {
                  if (r.truth(r.identical((await r.call("strpos", r.get(s, "ipdkey"), "npc")), false))) {
                    r.assign(r.slot(s, ["iplacedata", r.get(s, "iname"), r.APPEND]), r.get(s, "idata"));
                  }
                }
              }
            }
          }
        }
      }
      return r.copy(r.get(s, "iplacedata"));
      return null;
    });
  }
  {
    const static33 = Object.create(null);
    r.defineLocal("get_item_place_single", async (...args) => {
      const s = Object.create(null);
    r.parameter(s, "which", args.length > 0 ? args[0] : null, false);
      if (r.truth(r.equal(r.get(s, "which"), "-"))) {
        return r.copy("-");
      }
      r.global(s, "iplacedata");
      r.assign(r.slot(s, ["result"]), "");
      if (r.truth((await r.match("/\\[\\+\\d+\\]/s", r.get(s, "which"), r.argument(r.slot(s, ["matches"])), 0, 0, false)))) {
        r.assign(r.slot(s, ["enhance"]), r.get(r.get(s, "matches"), 0));
        r.assign(r.slot(s, ["which"]), (await r.call("preg_replace", "/\\[\\+\\d+\\]/s", "", r.get(s, "which"))));
      }
      if (r.truth((!r.truth((!r.truth(r.get(r.get(s, "iplacedata"), r.get(s, "which")))))))) {
        r.assign(r.slot(s, ["result"]), (await r.call("implode", "<br>", r.get(r.get(s, "iplacedata"), r.get(s, "which")))));
      }
      if (r.truth(r.equal(r.get(s, "which"), "悲叹之种"))) {
        if (r.truth((!r.truth((!r.truth(r.get(s, "result"))))))) {
          r.update(r.slot(s, ["result"]), "concat", "<br>");
        }
        r.update(r.slot(s, ["result"]), "concat", "通过使用『灵魂宝石』强化物品失败获得<br>");
      }
      if (r.truth((!r.truth((!r.truth(r.get(s, "enhance"))))))) {
        r.update(r.slot(s, ["result"]), "concat", (r.text("<br>并使用『祝福宝石』/『灵魂宝石』强化到") + r.text(r.get(s, "enhance")) + r.text("<br>")));
      }
      return r.copy(r.get(s, "result"));
      return null;
    });
  }
  {
    const static34 = Object.create(null);
    r.defineLocal("get_item_place", async (...args) => {
      const s = Object.create(null);
    r.parameter(s, "which", args.length > 0 ? args[0] : null, false);
      if (r.truth(r.equal(r.get(s, "which"), "-"))) {
        return r.copy("-");
      }
      r.global(s, "plsinfo");
      r.global(s, "gamecfg");
      r.assign(r.slot(s, ["result"]), "");
      r.assign(r.slot(s, ["file"]), (r.text(r.constant("GAME_ROOT")) + r.text("./include/modules/base/itemmain/config/mapitem.config.php")));
      r.assign(r.slot(s, ["itemlist"]), (await r.call("openfile", r.get(s, "file"))));
      r.assign(r.slot(s, ["in"]), (await r.call("sizeof", r.get(s, "itemlist"))));
      loop35: for (r.assign(r.slot(s, ["i"]), 1); r.truth((r.compare(r.get(s, "i"), r.get(s, "in")) < 0)); r.post(r.slot(s, ["i"]), 1)) {
        if (r.truth((r.truth((!r.truth((!r.truth(r.get(r.get(s, "itemlist"), r.get(s, "i"))))))) && r.truth((!r.identical((await r.call("strpos", r.get(r.get(s, "itemlist"), r.get(s, "i")), ",")), false)))))) {
          r.list([r.slot(s, ["iarea"]), r.slot(s, ["imap"]), r.slot(s, ["inum"]), r.slot(s, ["iname"]), r.slot(s, ["ikind"]), r.slot(s, ["ieff"]), r.slot(s, ["ista"]), r.slot(s, ["iskind"])], (await r.module("itemmain", "mapitem_row_data_seperate", r.get(r.get(s, "itemlist"), r.get(s, "i")))));
          if (r.truth(r.equal(r.get(s, "iname"), r.get(s, "which")))) {
            if (r.truth(r.equal(r.get(s, "iarea"), 99))) {
              r.update(r.slot(s, ["result"]), "concat", "每禁");
            } else {
              r.update(r.slot(s, ["result"]), "concat", (r.text(r.get(s, "iarea")) + r.text("禁")));
            }
            if (r.truth(r.equal(r.get(s, "imap"), 99))) {
              r.update(r.slot(s, ["result"]), "concat", "全图随机");
            } else {
              r.update(r.slot(s, ["result"]), "concat", (r.text("于") + r.text(r.get(r.get(s, "plsinfo"), r.get(s, "imap")))));
            }
            r.update(r.slot(s, ["result"]), "concat", (r.text("刷新") + r.text(r.get(s, "inum")) + r.text("个<br>")));
          }
        }
      }
      r.assign(r.slot(s, ["file"]), (r.text(r.constant("GAME_ROOT")) + r.text("./include/modules/base/itemshop/config/shopitem.config.php")));
      r.assign(r.slot(s, ["shoplist"]), (await r.call("openfile", r.get(s, "file"))));
      {
        const a37 = r.copy(r.get(s, "shoplist"));
        loop36: for (const [k37, v37] of r.entries(a37)) {
          r.assign(r.slot(s, ["lst"]), v37);
          if (r.truth((r.truth((!r.truth((!r.truth(r.get(s, "lst")))))) && r.truth((!r.identical((await r.call("strpos", r.get(s, "lst"), ",")), false)))))) {
            r.list([r.slot(s, ["kind"]), r.slot(s, ["num"]), r.slot(s, ["price"]), r.slot(s, ["area"]), r.slot(s, ["item"])], (await r.module("itemshop", "shopitem_row_data_seperate", r.get(s, "lst"))));
            if (r.truth(r.equal(r.get(s, "item"), r.get(s, "which")))) {
              r.update(r.slot(s, ["result"]), "concat", (r.text(r.get(s, "area")) + r.text("禁起在商店中出售(") + r.text(r.get(s, "price")) + r.text("元)<br>")));
            }
          }
        }
      }
      (await r.include("include/modules/base/itemmix/itemmix/config/itemmix.config.php", s, true));
      r.global(s, "mixinfo");
      {
        const a39 = r.copy(r.get(s, "mixinfo"));
        loop38: for (const [k39, v39] of r.entries(a39)) {
          r.assign(r.slot(s, ["lst"]), v39);
          if (r.truth((r.truth(r.equal(r.get(r.get(r.get(s, "lst"), "result"), 0), r.get(s, "which"))) || r.truth(r.equal(r.get(r.get(r.get(s, "lst"), "result"), 0), (r.text(r.get(s, "which")) + r.text(" "))))))) {
            r.update(r.slot(s, ["result"]), "concat", "通过合成获取<br>");
            break loop38;
          }
        }
      }
      r.assign(r.slot(s, ["file"]), (r.text(r.constant("GAME_ROOT")) + r.text("./include/modules/base/itemmix/itemmix_sync/config/sync.config.php")));
      r.assign(r.slot(s, ["synlist"]), (await r.call("openfile", r.get(s, "file"))));
      {
        const a41 = r.copy(r.get(s, "synlist"));
        loop40: for (const [k41, v41] of r.entries(a41)) {
          r.assign(r.slot(s, ["lst"]), v41);
          if (r.truth((r.truth((!r.truth((!r.truth(r.get(s, "lst")))))) && r.truth((!r.identical((await r.call("strpos", r.get(s, "lst"), ",")), false)))))) {
            r.list([r.slot(s, ["item"]), r.slot(s, ["kind"])], (await r.call("explode", ",", r.get(s, "lst"))));
            if (r.truth(r.equal(r.get(s, "item"), r.get(s, "which")))) {
              r.update(r.slot(s, ["result"]), "concat", "通过同调合成获取<br>");
              break loop40;
            }
          }
        }
      }
      r.assign(r.slot(s, ["file"]), (r.text(r.constant("GAME_ROOT")) + r.text("./include/modules/base/itemmix/itemmix_overlay/config/overlay.config.php")));
      r.assign(r.slot(s, ["ovllist"]), (await r.call("openfile", r.get(s, "file"))));
      {
        const a43 = r.copy(r.get(s, "ovllist"));
        loop42: for (const [k43, v43] of r.entries(a43)) {
          r.assign(r.slot(s, ["lst"]), v43);
          if (r.truth((r.truth((!r.truth((!r.truth(r.get(s, "lst")))))) && r.truth((!r.identical((await r.call("strpos", r.get(s, "lst"), ",")), false)))))) {
            r.list([r.slot(s, ["item"]), r.slot(s, ["kind"])], (await r.call("explode", ",", r.get(s, "lst"))));
            if (r.truth(r.equal(r.get(s, "item"), r.get(s, "which")))) {
              r.update(r.slot(s, ["result"]), "concat", "通过超量合成获取<br>");
              break loop42;
            }
          }
        }
      }
      r.assign(r.slot(s, ["file"]), (r.text(r.constant("GAME_ROOT")) + r.text("./include/modules/base/items/boxes/config/present.config.php")));
      r.assign(r.slot(s, ["prslist"]), (await r.call("openfile", r.get(s, "file"))));
      {
        const a45 = r.copy(r.get(s, "prslist"));
        loop44: for (const [k45, v45] of r.entries(a45)) {
          r.assign(r.slot(s, ["lst"]), v45);
          if (r.truth((r.truth((!r.truth((!r.truth(r.get(s, "lst")))))) && r.truth((!r.identical((await r.call("strpos", r.get(s, "lst"), ",")), false)))))) {
            r.list([r.slot(s, ["item"]), r.slot(s, ["kind"])], (await r.call("explode", ",", r.get(s, "lst"))));
            if (r.truth(r.equal(r.get(s, "item"), r.get(s, "which")))) {
              r.update(r.slot(s, ["result"]), "concat", "打开礼品盒时有概率获得<br>");
              break loop44;
            }
          }
        }
      }
      r.assign(r.slot(s, ["file"]), (r.text(r.constant("GAME_ROOT")) + r.text("./include/modules/base/items/boxes/config/ygobox.config.php")));
      r.assign(r.slot(s, ["boxlist"]), (await r.call("openfile", r.get(s, "file"))));
      {
        const a47 = r.copy(r.get(s, "boxlist"));
        loop46: for (const [k47, v47] of r.entries(a47)) {
          r.assign(r.slot(s, ["lst"]), v47);
          if (r.truth((r.truth((!r.truth((!r.truth(r.get(s, "lst")))))) && r.truth((!r.identical((await r.call("strpos", r.get(s, "lst"), ",")), false)))))) {
            r.list([r.slot(s, ["item"]), r.slot(s, ["kind"])], (await r.call("explode", ",", r.get(s, "lst"))));
            if (r.truth(r.equal(r.get(s, "item"), r.get(s, "which")))) {
              r.update(r.slot(s, ["result"]), "concat", "打开游戏王卡包时有概率获得<br>");
              break loop46;
            }
          }
        }
      }
      if (r.truth(r.equal(r.get(s, "which"), "悲叹之种"))) {
        r.update(r.slot(s, ["result"]), "concat", "通过使用『灵魂宝石』强化物品失败获得<br>");
      }
      return r.copy(r.get(s, "result"));
      return null;
    });
  }
  {
    const static48 = Object.create(null);
    r.defineLocal("get_resultjwords", async (...args) => {
      const s = Object.create(null);
    r.parameter(s, "mixresult", args.length > 0 ? args[0] : null, false);
      r.assign(r.slot(s, ["resultjwords"]), "");
      r.assign(r.slot(s, ["mixr"]), r.array([]));
      if (r.truth((!r.truth(((r.get(r.get(s, "mixresult"), "itm") != null)))))) {
        r.list([r.slot(s, ["mixr", "itm"]), r.slot(s, ["mixr", "itmk"]), r.slot(s, ["mixr", "itme"]), r.slot(s, ["mixr", "itms"]), r.slot(s, ["mixr", "itmsk"])], r.get(s, "mixresult"));
      } else {
        r.assign(r.slot(s, ["mixr"]), r.get(s, "mixresult"));
      }
      if (r.truth((r.truth((!r.truth((!r.truth(r.get(r.get(s, "mixr"), "itmsk")))))) && r.truth((!r.identical((await r.call("strpos", r.get(r.get(s, "mixr"), "itmsk"), "j")), false)))))) {
        r.assign(r.slot(s, ["rarr"]), r.array([]));
        r.assign(r.slot(s, ["wname"]), r.get(r.get(s, "mixr"), "itm"));
        r.assign(r.slot(s, ["i"]), 0);
        loop49: do {
          r.post(r.slot(s, ["i"]), 1);
          if (r.truth((r.compare(r.get(s, "i"), 99) > 0))) {
            break loop49;
          }
          r.assign(r.slot(s, ["wret"]), (await r.module("wepchange", "get_weaponswap_obj", r.get(s, "wname"))));
          if (r.truth((!r.truth(r.get(s, "wret"))))) {
            break loop49;
          }
          r.assign(r.slot(s, ["wnlist", r.APPEND]), r.get(s, "wname"));
          r.assign(r.slot(s, ["wname"]), r.get(r.get(s, "wret"), 1));
          r.assign(r.slot(s, ["rarr", r.APPEND]), (r.text((r.text((r.text((r.text((r.text((r.text((r.text((r.text("<span class='yellow b'>") + r.text(r.get(r.get(s, "wret"), 1)))) + r.text("</span>/"))) + r.text((await r.module("itemmain", "parse_itmk_words", r.get(r.get(s, "wret"), 2), 1))))) + r.text("/"))) + r.text(r.get(r.get(s, "wret"), 3)))) + r.text("/"))) + r.text(r.get(r.get(s, "wret"), 4)))) + r.text((r.truth((!r.truth((!r.truth(r.get(r.get(s, "wret"), 5)))))) ? (r.text("/") + r.text((await r.module("itemmain", "parse_itmsk_words", r.get(r.get(s, "wret"), 5))))) : ""))));
        } while (r.truth((r.truth((r.truth((!r.truth((await r.call("in_array", r.get(r.get(s, "wret"), 1), r.get(s, "wnlist")))))) && r.truth((!r.truth((!r.truth(r.get(r.get(s, "wret"), 5)))))))) && r.truth((!r.identical((await r.call("strpos", r.get(r.get(s, "wret"), 5), "j")), false))))));
        if (r.truth((!r.truth((!r.truth(r.get(s, "rarr"))))))) {
          r.assign(r.slot(s, ["resultjwords"]), (r.text("用『武器模式』可变换为：<br>") + r.text((await r.call("implode", "<br>→", r.get(s, "rarr"))))));
        }
      }
      return r.copy(r.get(s, "resultjwords"));
      return null;
    });
  }
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  return null;
}
