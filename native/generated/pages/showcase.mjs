// Static native page from showcase.php. Build-only source translation.
export default async function execute(r, s) {
  (await r.call("define", "CURSCRIPT", "logistics"));
  (await r.nativeInclude("request-bootstrap", s));
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
      (await r.call("gexit", r.get(r.get(s, "_ERROR"), "user_not_exists"), "showcase.php", 18));
    }
    r.extract(s, r.get(s, "udata"));
    r.assign(r.slot(s, ["curuser"]), false);
    if (r.truth(r.equal(r.get(s, "uname"), r.get(s, "cuser")))) {
      r.assign(r.slot(s, ["curuser"]), true);
    }
    r.assign(r.slot(s, ["n"]), r.get(s, "uname"));
  }
  r.imports(s, "logistics", "cardbase");
  r.assign(r.slot(s, ["showcase_cardlist"]), (await r.module("logistics", "get_showcase_cardlist_from_udata", r.get(s, "udata"))));
  r.assign(r.slot(s, ["showcase_gameitemlist"]), (await r.module("logistics", "get_showcase_gameitemlist_from_udata", r.get(s, "udata"))));
  r.assign(r.slot(s, ["showcase_logitemlist"]), (await r.module("logistics", "get_showcase_logitemlist_from_udata", r.get(s, "udata"))));
  r.list([r.slot(s, ["cardlist"]), r.slot(s, ["cardenergy"]), r.slot(s, ["card_data"])], (await r.module("cardbase", "get_cardlist_energy_from_udata", r.get(s, "udata"))));
  (await r.include(r.template("showcase"), s, false));
  return null;
}
