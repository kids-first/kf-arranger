import { flatten } from 'lodash';
import { getProject } from '@kfarranger/server';

import { executePagedQuery } from '../../utils';
import byIds from './byIds';
import byFamilyId from './byFamilyId';
import byBiospecimenId from './byBiospecimenId';
import bySampleExternalId from './bySampleExternalId';

const searchSources = sources => async (projectId, ids) => {
  const project = getProject(projectId);
  if (!project) {
    throw new Error(`ProjectID '${projectId}' cannot be established.`);
  }

  const promises = sources.map(src => {
    const sqon = src.getSqon(ids);
    // get the data for this source
    return executePagedQuery(project, src.query, sqon)
      // transform normalized data to a "query result"
      .then(results => src.transform(results, ids))
      // remove results without participants (id not found in this source)
      .then(results => results.filter(result => result.participantIds.length));
  });

  return await Promise.all(promises).then(flatten);
};

const searchAllSources = searchSources([byIds, byBiospecimenId, byFamilyId, bySampleExternalId]);

export default () => async (req, res) => {
  const ids = req.body.ids;
  const projectId = req.body.project;

  try {
    const participants = await searchAllSources(projectId, ids);
    res.json({ participants });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err });
  }
};
