import { get } from 'lodash';

const runPagedQuery = async (project, query, sqon) => {
  let complete = false;
  let offset = 0;
  const size = 1000;
  let results = {};

  while (!complete) {
    const queryResults = await project.runQuery({
      query,
      variables: { sqon, size, offset },
    });

    const normalizedResults = normalizeResults(get(queryResults, 'data', {}));

    // NOTE: does not support multiple entyties in a query, yet.
    const entityType = Object.keys(normalizedResults)[0];
    const edges = get(normalizedResults, entityType, []);
    offset += size;
    if (edges.length < size) {
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