// Static native page from kuji.php. Build-only source translation.
export default async function execute(r, s) {
  (await r.call("define", "CURSCRIPT", "kuji"));
  (await r.nativeInclude("request-bootstrap", s));
  r.assign(r.slot(r.globals, ["_REQUEST"]), (await r.call("gstrfilter", r.get(r.globals, "_REQUEST"))));
  r.assign(r.slot(s, ["ktype"]), r.get(r.get(r.globals, "_REQUEST"), "type"));
  if (r.truth(r.equal(r.get(s, "ktype"), ""))) {
    r.assign(r.slot(s, ["ktype"]), 0);
  }
  if (r.truth(((r.get(r.get(r.globals, "_POST"), "choice") != null)))) {
    r.assign(r.slot(s, ["choice"]), r.int(r.get(r.get(r.globals, "_POST"), "choice")));
    if (r.truth((r.truth((r.compare(r.get(s, "choice"), 1) < 0)) || r.truth((r.compare(r.get(s, "choice"), 4) > 0))))) {
      r.assign(r.slot(s, ["choice"]), 0);
    }
  } else {
    r.assign(r.slot(s, ["choice"]), 0);
  }
  r.assign(r.slot(s, ["udata"]), (await r.call("udata_check")));
  r.extract(s, r.get(s, "udata"));
  r.assign(r.slot(s, ["userCardData"]), (await r.module("cardbase", "get_user_cardinfo", r.get(s, "cuser"))));
  r.assign(r.slot(s, ["oc"]), r.get(r.get(s, "userCardData"), "cardlist"));
  (await r.module("cardbase", "parse_card_index"));
  if (r.truth((r.truth((r.truth(r.equal(r.get(s, "ktype"), 1)) || r.truth((r.compare(r.get(s, "choice"), 0) > 0)))) || r.truth((!r.truth((!r.truth(r.get(s, "packchoice"))))))))) {
    r.imports(s, "kujibase");
    r.assign(r.slot(s, ["kreq"]), r.get(s, "kujicost"));
    r.assign(r.slot(s, ["kres"]), (await r.module("cardbase", "kuji", r.get(s, "ktype"), r.get(s, "udata"))));
    if (r.truth((await r.call("is_array", r.get(s, "kres"))))) {
      if (r.truth((r.truth(r.equal(r.get(s, "ktype"), 0)) || r.truth(r.equal(r.get(s, "ktype"), 2))))) {
        r.assign(r.slot(s, ["t"]), r.array([]));
        r.assign(r.slot(s, ["tmp"]), r.array([]));
        loop0: for (r.assign(r.slot(s, ["i"]), 1); r.truth((r.compare(r.get(s, "i"), 4) <= 0)); r.post(r.slot(s, ["i"]), 1)) {
          if (r.truth(r.equal(r.get(s, "i"), r.get(s, "choice")))) {
            r.assign(r.slot(s, ["t", r.get(s, "i")]), r.get(r.get(s, "kres"), 0));
          } else {
            r.assign(r.slot(s, ["t", r.get(s, "i")]), r.get((await r.module("cardbase", "kuji", r.get(s, "ktype"), r.get(s, "tmp"), true)), 0));
          }
        }
        r.assign(r.slot(s, ["kres"]), r.get(s, "t"));
      }
      r.assign(r.slot(s, ["isnew"]), r.array([]));
      r.assign(r.slot(s, ["ishighlight"]), r.array([]));
      if (r.truth((r.truth(r.equal(r.get(s, "ktype"), 0)) || r.truth(r.equal(r.get(s, "ktype"), 2))))) {
        loop1: for (r.assign(r.slot(s, ["i"]), 1); r.truth((r.compare(r.get(s, "i"), 4) <= 0)); r.post(r.slot(s, ["i"]), 1)) {
          r.assign(r.slot(s, ["ishighlight", r.get(s, "i")]), r.equal(r.get(s, "i"), r.get(s, "choice")));
        }
      } else {
        if (r.truth((r.compare(r.get(r.get(s, "kujinum_in_pack"), r.get(s, "ktype")), 0) > 0))) {
          r.assign(r.slot(s, ["kres"]), (await r.call("array_reverse", r.get(s, "kres"))));
          loop2: for (r.assign(r.slot(s, ["i"]), r.get(r.get(s, "kujinum"), r.get(s, "ktype"))); r.truth((r.compare(r.get(s, "i"), r.subtract(r.get(r.get(s, "kujinum"), r.get(s, "ktype")), r.get(r.get(s, "kujinum_in_pack"), r.get(s, "ktype")))) > 0)); r.post(r.slot(s, ["i"]), -1)) {
            r.assign(r.slot(s, ["ishighlight", r.subtract(r.get(s, "i"), 1)]), 1);
          }
        }
      }
      r.assign(r.slot(s, ["isblink"]), r.array([]));
      {
        const a4 = r.copy(r.get(s, "kres"));
        loop3: for (const [k4, v4] of r.entries(a4)) {
        r.assign(r.slot(s, ["key"]), k4);
          r.assign(r.slot(s, ["val"]), v4);
          if (r.truth((!r.identical((await r.call("strpos", r.get(s, "val"), "_")), false)))) {
            r.list([r.slot(s, ["kres", r.get(s, "key")]), r.slot(s, ["isblink", r.get(s, "key")])], (await r.call("explode", "_", r.get(s, "val"))));
          }
        }
      }
      {
        const a6 = r.copy(r.get(s, "kres"));
        loop5: for (const [k6, v6] of r.entries(a6)) {
        r.assign(r.slot(s, ["key"]), k6);
          r.assign(r.slot(s, ["val"]), v6);
          if (r.truth((r.truth((r.truth(r.equal(r.get(s, "ktype"), 0)) || r.truth(r.equal(r.get(s, "ktype"), 2)))) && r.truth((!r.equal(r.get(s, "choice"), r.get(s, "key"))))))) {
            r.assign(r.slot(s, ["isnew", r.get(s, "key")]), 0);
            continue loop5;
          }
          if (r.truth((!r.truth((await r.call("in_array", r.get(s, "val"), r.get(s, "oc"))))))) {
            r.assign(r.slot(s, ["isnew", r.get(s, "key")]), 1);
          } else {
            if (r.truth((r.compare((r.truth((!r.truth((!r.truth(r.get(r.get(s, "isblink"), r.get(s, "key"))))))) ? r.get(r.get(s, "isblink"), r.get(s, "key")) : 0), (r.truth((!r.truth((!r.truth(r.get(r.get(r.get(r.get(s, "userCardData"), "card_data"), r.get(s, "val")), "blink")))))) ? r.get(r.get(r.get(r.get(s, "userCardData"), "card_data"), r.get(s, "val")), "blink") : 0)) > 0))) {
              r.assign(r.slot(s, ["isnew", r.get(s, "key")]), 2);
            } else {
              r.assign(r.slot(s, ["isnew", r.get(s, "key")]), 0);
            }
          }
        }
      }
      (await r.include(r.template("kujiresult"), s, false));
    } else {
      (await r.call("gexit", r.get(r.get(s, "_ERROR"), "kuji_failure"), "kuji.php", 86));
    }
  } else {
    (await r.include(r.template("kujipick"), s, false));
  }
  await r.write(" ");
  return null;
}
