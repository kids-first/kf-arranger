import { get } from 'lodash';

import { CONSTANTS } from '../../utils';

const query = `query ($sqon: JSON, $size: Int, $offset: Int) {
  participant {
    hits (filters: $sqon, first:$size, offset:$offset){
      edges {
        node {
          kf_id
          family_id
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
      field: 'family_id',
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
        .filter(participant => participant.family_id === id)
        .map(participant => participant.kf_id);

      return ({
        search: id,
        type: 'FAMILY',
        participantIds,
      });
    });
  }
};
