import { get } from 'lodash';

import { normalizeResults } from './';

const pageSize = 1000;
  
const runPagedQuery = async (project, query, sqon) => {
  let complete = false;
  let offset = 0;
  let results = {};

  while (!complete) {
    const queryResults = await project.runQuery({
      query,
      variables: { sqon, size: pageSize, offset },
    });

    const normalizedResults = normalizeResults(get(queryResults, 'data', {}));

    // NOTE: does not support multiple entyties in a query, yet.
    const entityType = Object.keys(normalizedResults)[0];
    const edges = get(normalizedResults, entityType, []);
    offset += pageSize;
    if (edges.length < pageSize) {
      complete = true;
    }

    if (!Array.isArray(results[entityType])) {
      results[entityType] = [];
    } 
    results[entityType] = results[entityType].concat(normalizedResults[entityType]);
  }

  return results;
};

export default runPagedQuery;