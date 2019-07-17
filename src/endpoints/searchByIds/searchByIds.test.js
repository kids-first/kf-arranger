import { mockReq, mockRes } from 'sinon-express-mock';

import searchByIds from './';

const mockGetProject = projectId => {
  return {
    runQuery: () => null,
  };
};

describe('searchByIds', () => {
  let search;
  let mockGetProject;

  beforeEach(() => {
    mockGetProject = mockGetProject();
    search = searchByIds(mockProject);
  });

  it('', done => {
    search(mockReq, mockRes)
      .then(() => done())
      .catch(done);
  });
});
