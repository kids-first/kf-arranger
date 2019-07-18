import { get } from 'lodash';

import { CONSTANTS } from '../../utils';

const query = `query ($sqon: JSON, $size: Int, $offset: Int) {
  participant {
    hits (filters: $sqon, first:$size, offset:$offset){
      edges {
        node {
          kf_id
          biospecimens {
            hits {
              edges {
                node {
                  external_sample_id   
                }
              }
            }
          }
        }
      }
    }
  }
}`;

const getSqon = (ids = []) => ({
  op: CONSTANTS.AND_OP,
  content: [{
    op: CONSTANTS.IN_OP,
    content: {
      field: 'biospecimens.external_sample_id',
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
        .filter(participant => {
          const biospecimens = get(participant, 'biospecimens.hits.edges', []);
          return biospecimens.some(bio => get(bio, 'node.external_sample_id', null) === id);
        })
        .map(participant => participant.kf_id);

      return ({
        search: id,
        type: 'SAMPLE EXTERNAL ID',
        participantIds,
      });
    }).filter(res => res.participantIds.length);
  }
};
