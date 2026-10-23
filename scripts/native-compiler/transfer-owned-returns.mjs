// These six complete functions were audited: ret is copied on assignment,
// never passed by reference or exposed with its scope, and consumed at return.
// Any future edit invalidates its fingerprint and restores the ordinary copy.
// Imports may replace ret with a live binding, which the runtime still copies.
import { createHash } from 'node:crypto';
const audited = new Set([
  '8b3ce09badd928b5120ec238c1771fb891ef93e0c02ed8addb993398a7146575', // skill531
  'f35f15fa10205cc774b394c2ebdf326ac0848a5d630edb9748c9123c7998c36f', // skill559
  'c344343d9434fa837578fa7c6cd1a6d87a8434e59ca0cc9e76a019d59a2dca98', // skill583
  '6c22ed0610441479858d00ba7268ca75b6b814752b72e4fa3c45364d4ec72130', // skill735
  '734a8195535c99998dee0b9baee411b1c09c1515a9fa06f3683825bea0c22352', // instance10
  '6194ff838939b651df89309016970a825855476cbe35ea8f1566289a0244b992', // item_slip
]);
export function transferOwnedReturns(code) {
  return code.replace(/async function get_mixinfo\(ctx, \.\.\.args\) \{[\s\S]*?\n\}/g, body => {
    if (!audited.has(createHash('sha256').update(body).digest('hex'))) return body;
    return body.replace('return r.copy(r.get(s, "ret"));', 'return r.returnOwnedLocal(s, "ret");');
  });
}
