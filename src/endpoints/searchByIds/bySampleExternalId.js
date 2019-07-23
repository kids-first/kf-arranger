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
  transform: (data, ids) => {
    const participants = get(data, 'participant', [])
      .filter(p => !!p);

    return ids.map(id => {
      const participantIds = participants
        .filter(participant => {
          const biospecimens = get(participant, 'biospecimens', []);
          return biospecimens.some(bio => bio.external_sample_id === id);
        })
        .map(participant => participant.kf_id);

      return ({
        search: id,
        type: 'SAMPLE EXTERNAL ID',
        participantIds,
      });
    });
  }
};
