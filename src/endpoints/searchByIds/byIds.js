import { get } from 'lodash';

import { CONSTANTS } from '../../utils';

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
  op: CONSTANTS.OR_OP,
  content: [{
    op: CONSTANTS.IN_OP,
    content: {
      field: 'kf_id',
      value: ids,
    },
  }, {
    op: CONSTANTS.IN_OP,
    content: {
      field: 'external_id',
      value: ids,
    },
  }],
});

export default {
  query,
  getSqon,
  transform: (data, ids) => {
    return ids.map(id => {
      const participantIds = get(data, 'participant', [])
        .filter(p => !!p)
        .filter(participant => participant.kf_id === id || participant.external_id === id)
        .map(participant => participant.kf_id);

      return ({
        search: id,
        type: 'PARTICIPANT',
        participantIds,
      });
    });
  }
};
