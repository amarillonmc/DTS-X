// Static native page from include/pages/command_logistics.php. Build-only source translation.
export default async function execute(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  r.imports(s, "sys");
  if (r.truth((r.truth((!r.truth(r.get(s, "cuser")))) || r.truth((!r.truth(r.get(s, "cpass"))))))) {
    (await r.call("gexit", r.get(r.get(s, "_ERROR"), "no_login"), "include/pages/command_logistics.php", 9));
    return r.copy(null);
  }
  if (r.truth((!r.truth((!r.truth(r.get(s, "userdb_remote_storage"))))))) {
    r.assign(r.slot(s, ["cudata"]), (await r.call("fetch_udata_by_username", r.get(s, "cuser"))));
  }
  r.assign(r.slot(s, ["udata"]), (await r.call("udata_check")));
  r.extract(s, r.get(s, "udata"));
  r.assign(r.slot(s, ["type"]), r.readReference((await r.lookupReference("get_var_input", "type"))));
  if (r.truth((!r.truth(r.get(s, "type"))))) {
    r.assign(r.slot(s, ["type"]), 0);
  }
  r.assign(r.slot(s, ["template_id"]), "");
  r.imports(s, "logistics");
  if (r.truth((r.truth((!r.truth(r.get(s, "type")))) || r.truth(r.equal(r.get(s, "type"), 1))))) {
    r.imports(s, "cardbase");
    r.assign(r.slot(s, ["cardchoice"]), r.readReference((await r.lookupReference("get_var_input", "cardchoice"))));
    if (r.truth((!r.truth((!r.truth(r.get(s, "cardchoice"))))))) {
      r.assign(r.slot(s, ["res"]), (await r.module("logistics", "logistics_buy", r.get(s, "cardchoice"), 1, r.get(s, "udata"))));
      if (r.truth((r.compare(r.get(s, "res"), 0) > 0))) {
        r.assign(r.slot(s, ["notice"]), "购买成功。");
      } else {
        r.assign(r.slot(s, ["notice"]), "购买失败。");
        if (r.truth((!r.truth((!r.truth(r.get(s, "logistics_error_info"))))))) {
          r.update(r.slot(s, ["notice"]), "concat", r.get(s, "logistics_error_info"));
        }
      }
    }
    r.assign(r.slot(s, ["card_data"]), r.get((await r.module("cardbase", "get_cardlist_energy_from_udata", r.get(s, "udata"))), 2));
    r.assign(r.slot(s, ["cardshop_list"]), (await r.module("logistics", "get_cardshop_list", r.get(s, "udata"))));
    r.assign(r.slot(s, ["template_id"]), "log_cardshop");
  } else {
    if (r.truth(r.equal(r.get(s, "type"), 2))) {
      r.assign(r.slot(s, ["itemchoice"]), r.readReference((await r.lookupReference("get_var_input", "itemchoice"))));
      if (r.truth((!r.truth((!r.truth(r.get(s, "itemchoice"))))))) {
        r.assign(r.slot(s, ["res"]), (await r.module("logistics", "logistics_buy", r.get(s, "itemchoice"), 2, r.get(s, "udata"))));
        if (r.truth((r.compare(r.get(s, "res"), 0) > 0))) {
          r.assign(r.slot(s, ["notice"]), "购买成功。");
        } else {
          r.assign(r.slot(s, ["notice"]), "购买失败。");
          if (r.truth((!r.truth((!r.truth(r.get(s, "logistics_error_info"))))))) {
            r.update(r.slot(s, ["notice"]), "concat", r.get(s, "logistics_error_info"));
          }
        }
      }
      r.assign(r.slot(s, ["logitemlist"]), (await r.module("logistics", "logistics_get_itemlist_from_udata", r.get(s, "udata"))));
      r.assign(r.slot(s, ["template_id"]), "log_itemshop");
    } else {
      if (r.truth(r.equal(r.get(s, "type"), 4))) {
        r.imports(s, "cardbase");
        r.assign(r.slot(s, ["showcase_cmd"]), r.readReference((await r.lookupReference("get_var_input", "showcase_cmd"))));
        if (r.truth(r.equal("set_card", r.get(s, "showcase_cmd")))) {
          r.assign(r.slot(s, ["cardchoice"]), r.readReference((await r.lookupReference("get_var_input", "cardchoice"))));
          r.assign(r.slot(s, ["cardpos"]), r.readReference((await r.lookupReference("get_var_input", "cardpos"))));
          if (r.truth((!r.identical(null, r.get(s, "cardchoice"))))) {
            r.assign(r.slot(s, ["res"]), (await r.module("logistics", "set_showcase_card", r.get(s, "cardchoice"), r.get(s, "cardpos"), r.get(s, "udata"))));
            if (r.truth((r.compare(r.get(s, "res"), 0) > 0))) {
              r.assign(r.slot(s, ["notice"]), "设置成功。");
            } else {
              r.assign(r.slot(s, ["notice"]), "设置失败。");
              if (r.truth((!r.truth((!r.truth(r.get(s, "logistics_error_info"))))))) {
                r.update(r.slot(s, ["notice"]), "concat", r.get(s, "logistics_error_info"));
              }
            }
          }
        } else {
          if (r.truth(r.equal("set_item", r.get(s, "showcase_cmd")))) {
            r.assign(r.slot(s, ["itempos"]), r.readReference((await r.lookupReference("get_var_input", "itempos"))));
            if (r.truth((!r.identical(null, r.get(s, "itempos"))))) {
              r.assign(r.slot(s, ["res"]), (await r.module("logistics", "set_showcase_logitem", 0, r.get(s, "itempos"), r.get(s, "udata"), 2)));
              if (r.truth((r.compare(r.get(s, "res"), 0) > 0))) {
                r.assign(r.slot(s, ["notice"]), "取下道具成功。");
              } else {
                r.assign(r.slot(s, ["notice"]), "取下道具失败。");
                if (r.truth((!r.truth((!r.truth(r.get(s, "logistics_error_info"))))))) {
                  r.update(r.slot(s, ["notice"]), "concat", r.get(s, "logistics_error_info"));
                }
              }
            }
          }
        }
        r.assign(r.slot(s, ["showcase_cardlist"]), (await r.module("logistics", "get_showcase_cardlist_from_udata", r.get(s, "udata"))));
        r.list([r.slot(s, ["cardlist"]), r.slot(s, ["cardenergy"]), r.slot(s, ["card_data"])], (await r.module("cardbase", "get_cardlist_energy_from_udata", r.get(s, "udata"))));
        r.assign(r.slot(s, ["showcase_gameitemlist"]), (await r.module("logistics", "get_showcase_gameitemlist_from_udata", r.get(s, "udata"))));
        r.assign(r.slot(s, ["showcase_logitemlist"]), (await r.module("logistics", "get_showcase_logitemlist_from_udata", r.get(s, "udata"))));
        r.assign(r.slot(s, ["template_id"]), "log_showcase");
      } else {
        r.imports(s, "cardbase");
        r.assign(r.slot(s, ["itemchoice"]), r.readReference((await r.lookupReference("get_var_input", "itemchoice"))));
        r.assign(r.slot(s, ["itempara"]), r.readReference((await r.lookupReference("get_var_input", "itempara"))));
        if (r.truth((!r.truth((!r.truth(r.get(s, "itemchoice"))))))) {
          r.assign(r.slot(s, ["res"]), (await r.module("logistics", "logistics_itemuse", r.get(s, "itemchoice"), r.get(s, "itempara"), r.get(s, "udata"))));
          if (r.truth((!r.truth((!r.truth(r.get(s, "res"))))))) {
            r.assign(r.slot(s, ["notice"]), (r.text("使用成功。") + r.text(r.get(s, "res"))));
          } else {
            r.assign(r.slot(s, ["notice"]), "使用失败。");
            if (r.truth((!r.truth((!r.truth(r.get(s, "logistics_error_info"))))))) {
              r.update(r.slot(s, ["notice"]), "concat", r.get(s, "logistics_error_info"));
            }
          }
        }
        r.assign(r.slot(s, ["logitemlist"]), (await r.module("logistics", "logistics_get_itemlist_from_udata", r.get(s, "udata"))));
        r.assign(r.slot(s, ["cardlist"]), r.get((await r.module("cardbase", "get_cardlist_energy_from_udata", r.get(s, "udata"))), 0));
        r.assign(r.slot(s, ["showcase_logitemlist"]), (await r.module("logistics", "get_showcase_logitemlist_from_udata", r.get(s, "udata"))));
        r.assign(r.slot(s, ["template_id"]), "log_inventory");
      }
    }
  }
  r.assign(r.slot(s, ["cg"]), r.get(r.get(s, "udata"), "gold"));
  if (r.truth((!r.truth((!r.truth(r.get(s, "template_id"))))))) {
    (await r.call("ob_start"));
    (await r.include(r.template(r.get(s, "template_id")), s, false));
    (await r.call("ob_end_flush"));
  }
  return null;
}
