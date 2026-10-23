// Static native page from cardbook.php. Build-only source translation.
export default async function execute(r, s) {
  (await r.call("define", "CURSCRIPT", "cardbook"));
  (await r.nativeInclude("request-bootstrap", s));
  r.imports(s, "cardbase");
  r.assign(r.slot(r.globals, ["_REQUEST"]), (await r.call("gstrfilter", r.get(r.globals, "_REQUEST"))));
  if (r.truth((!r.truth(r.get(r.get(r.globals, "_REQUEST"), "playerID"))))) {
    r.assign(r.slot(s, ["udata"]), (await r.call("udata_check")));
    r.assign(r.slot(s, ["n"]), r.get(s, "cuser"));
    r.extract(s, r.get(s, "udata"));
    r.assign(r.slot(s, ["curuser"]), true);
  } else {
    r.assign(r.slot(s, ["uname"]), (await r.call("urldecode", r.get(r.get(r.globals, "_REQUEST"), "playerID"))));
    r.assign(r.slot(s, ["udata"]), (await r.call("fetch_udata_by_username", r.get(s, "uname"))));
    if (r.truth((!r.truth(r.get(s, "udata"))))) {
      (await r.call("gexit", r.get(r.get(s, "_ERROR"), "user_not_exists"), "cardbook.php", 20));
    }
    r.extract(s, r.get(s, "udata"));
    r.assign(r.slot(s, ["curuser"]), false);
    if (r.truth(r.equal(r.get(s, "uname"), r.get(s, "cuser")))) {
      r.assign(r.slot(s, ["curuser"]), true);
    }
    r.assign(r.slot(s, ["n"]), r.get(s, "uname"));
  }
  (await r.module("cardbase", "parse_card_index"));
  (await r.module("cardbase", "parse_card_gaining_method"));
  r.assign(r.slot(s, ["cgmfile"]), (r.text(r.constant("GAME_ROOT")) + r.text("./gamedata/cache/card_gaining_method.config.php")));
  if (r.truth((await r.call("file_exists", r.get(s, "cgmfile"))))) {
    (await r.include(r.get(s, "cgmfile"), s, false));
  }
  r.assign(r.slot(s, ["userCardData"]), (await r.module("cardbase", "get_user_cardinfo", r.get(s, "n"))));
  r.assign(r.slot(s, ["user_cards"]), r.get(r.get(s, "userCardData"), "cardlist"));
  r.assign(r.slot(s, ["card_energy"]), r.get(r.get(s, "userCardData"), "cardenergy"));
  r.assign(r.slot(s, ["card_data_fetched"]), r.get(r.get(s, "userCardData"), "card_data"));
  r.assign(r.slot(s, ["cardChosen"]), r.get(r.get(s, "userCardData"), "cardchosen"));
  r.assign(r.slot(s, ["packlist"]), (await r.module("cardbase", "pack_filter", r.get(s, "packlist"))));
  r.assign(r.slot(s, ["pname"]), r.get(r.get(r.globals, "_REQUEST"), "packName"));
  if (r.truth((!r.equal(r.get(s, "pname"), "")))) {
    if (r.truth((await r.module("cardbase", "in_card_pack", r.get(s, "pname"))))) {
      r.assign(r.slot(s, ["pack"]), (await r.module("cardbase", "get_card_pack", r.get(s, "pname"))));
      r.assign(r.slot(s, ["energy_recover_rate"]), (await r.module("cardbase", "get_energy_recover_rate", r.get(s, "user_cards"), r.get(s, "gold"))));
      r.assign(r.slot(s, ["unlock_cards"]), r.array([]));
      {
        const a1 = r.copy(r.get(s, "user_cards"));
        loop0: for (const [k1, v1] of r.entries(a1)) {
          r.assign(r.slot(s, ["card_index"]), v1);
          if (r.truth((await r.call("array_key_exists", r.get(s, "card_index"), r.get(s, "pack"))))) {
            r.assign(r.slot(s, ["unlock_cards", r.get(s, "card_index")]), r.get(r.get(s, "pack"), r.get(s, "card_index")));
          }
        }
      }
      r.assign(r.slot(s, ["lock_cards"]), (await r.call("array_diff_key", r.get(s, "pack"), r.get(s, "unlock_cards"))));
      r.assign(r.slot(s, ["unlock_cards"]), (await r.module("cardbase", "card_sort", r.get(s, "unlock_cards"))));
      r.assign(r.slot(s, ["lock_cards"]), (await r.module("cardbase", "card_sort", r.get(s, "lock_cards"))));
      r.assign(r.slot(s, ["pack_num"]), (await r.call("count", r.get(s, "pack"))));
      r.assign(r.slot(s, ["unlock_num"]), (await r.call("count", r.get(s, "unlock_cards"))));
    }
  }
  r.assign(r.slot(s, ["card_achieved_list"]), r.array([]));
  if (r.truth((await r.call("defined", "MOD_ACHIEVEMENT_BASE")))) {
    r.assign(r.slot(s, ["d_achievements"]), (await r.module("achievement_base", "decode_achievements", r.get(s, "udata"))));
    if (r.truth((!r.truth((!r.truth(r.get(r.get(s, "d_achievements"), "326"))))))) {
      r.assign(r.slot(s, ["card_achieved_list"]), r.get(r.get(s, "d_achievements"), "326"));
    }
  }
  (await r.include(r.template("card_book"), s, false));
  return null;
}
