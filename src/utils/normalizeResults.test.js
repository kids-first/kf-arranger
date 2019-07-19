import { expect } from 'chai';

import normalizeResults from './normalizeResults';

const getMockResults = () => ({
  data: {
    participant: {
      hits: {
        edges: [{
          node: {
            kf_id: 'PT_CYBYN18G',
            biospecimens: {
              hits: {
                edges: [{
                  node: {
                    kf_id: 'BS_T1SNKF50'
                  }
                }, {
                  node: {
                    kf_id: 'BS_C5SDFG56'
                  }
                }]
              }
            }
          }
        }, {
          node: {
            kf_id: 'PT_DJFU48GR',
            biospecimens: {
              hits: {
                edges: []
              }
            }
          }
        }]
      }
    }
  }
});

describe('normalizeResults', () => {
  let normalized;

  beforeEach(() => {
    const mockResult = getMockResults();
    normalized = normalizeResults(mockResult.data);
  });

  it('shortcuts "hits.edges" properties', () => {
    expect(normalized.participant).to.be.instanceOf(Array);
    expect(normalized.participant).to.be.lengthOf(2);
  });

  it('shortcuts "hits.edges" properties recursively', () => {
    expect(normalized.participant[0].biospecimens).to.be.instanceOf(Array);
    expect(normalized.participant).to.be.lengthOf(2);
  });

  it('shortcuts "node" property', () => {
    expect(normalized.participant[0]).not.to.have.property('node');
    expect(normalized.participant[0]).to.have.property('kf_id');
  });

  it('shortcuts "node" property recursively', () => {
    expect(normalized.participant[0].biospecimens[0]).not.to.have.property('node');
    expect(normalized.participant[0]).to.have.property('kf_id');
  });
});
