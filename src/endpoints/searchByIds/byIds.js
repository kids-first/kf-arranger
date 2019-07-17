import { get } from 'lodash';

const query = `query ($sqon: JSON, $size: Int, $offset: Int) {
  participant {
    hits (filters: $sqon, first:$size, offset:$offset){
      edges {
        node {
          kf_id
          external_id
        }
      }
    }
  }
}`;

const getSqon = (ids = []) => ({
  op: 'or',
  content: [{
    op: 'in',
    content: {
      field: 'kf_id',
      value: ids,
    },
  }, {
    op: 'in',
    content: {
      field: 'external_id',
      value: ids,
    },
  }],
});

export default {
  query,
  getSqon,
  resultsPath: 'data.participant.hits.edges',
  transform: (results, ids) => {
    const nodes = results.map(datum => get(datum, 'node', {}));
    return ids.map(id => {
      const participantIds = nodes
        .filter(participant => get(participant, 'kf_id') === id || get(participant, 'external_id') === id)
        .map(participant => participant.kf_id);

      return ({
        search: id,
        type: 'PARTICIPANT',
        participantIds,
      });
    }).filter(res => res.participantIds.length);
  }
};
