import { get } from 'lodash';

/**
 * Normalizes the results of a graphql query to make it easier to manipulate,
 * turning hits to plain arrays and removing extra 'node' level.
 * @example
 * result:
 *  {
 *    "participant": {
 *      "hits": {
 *        "edges": [{
 *          "node": {
 *            "kf_id": "PT_CYBYN18G",
 *            "biospecimens": {
 *              "hits": {
 *                "edges": [{
 *                  "node": {
 *                    "kf_id": "BS_T1SNKF50"
 *                  }
 *                }]
 *              }
 *            }
 *          }
 *        }]
 *      }
 *    }
 *  }
 * becomes:
 *  {
 *    "participant": [{
 *      "kf_id": "PT_CYBYN18G",
 *      "biospecimens": [{
 *        "kf_id": "BS_T1SNKF50"
 *      }]
 *    }]
 *  }
 * @param {Object} results - The result of a graphql query
 * @returns {Object} a normalized result (see example).
 */
const normalizeResults = results => {
  if (Array.isArray(results)) {
    return results.map(normalizeResults);
  }

  // detect 'hits: { edges: [] }' and shortcut it
  const hits = get(results, 'hits.edges', null);
  if (hits !== null) {
    return normalizeResults(hits);
  }

  if (typeof results === 'object' && results !== null) {
    return Object.keys(results)
      .reduce((norm, key) => {
        const prop = results[key];

        // detect 'node' and shortcut them
        if (key === 'node' && typeof prop === 'object' && prop !== null) {
          return Object.keys(prop)
            .reduce((acc, p) => {
              acc[p] = normalizeResults(prop[p]);
              return acc;
            }, norm);
        }

        norm[key] = normalizeResults(prop);
        return norm;
      }, {});
  }

  return results;
};
export default normalizeResults;
