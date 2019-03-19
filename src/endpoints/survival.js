import { PythonShell } from 'python-shell';
import { get } from 'lodash';

import { getProject } from '@arranger/server';

import { survivalPyFile, pythonPath } from '../env';

const pyOptions = { pythonPath, mode: 'text', pythonOptions: ['-u'] };

const ALIVE = 'Alive';
const DECEASED = 'Deceased';
const STATUSES = [ALIVE, DECEASED];

const convertCensored = value => {
  switch (value) {
    case ALIVE:
      return true;
    case DECEASED:
      return false;
  }
};

const getParticipants = async ({ sqon, projectId }) => {
  const query = `query ($sqon: JSON, $size: Int, $offset: Int) {
      participant{
        hits  (filters: $sqon, first:$size, offset:$offset){
          edges {
            node {
              kf_id 
              outcome {
                age_at_event_days
                vital_status
              }
            }
          }
        }
      }
    }
  `;

  const participants = [];
  let complete = false;
  let offset = 0;
  const size = 1000;

  const project = getProject(projectId);
  if (!project) {
    throw new Error(`ProjectID '${projectId}' cannot be established.`);
  }

  while (!complete) {
    const results = await project.runQuery({
      query,
      variables: { sqon, size, offset },
    });
    offset += size;

    const edges = get(results, 'data.participant.hits.edges', []);
    if (edges.length < size) {
      complete = true;
    }

    const formattedResults = edges
      // Make sure all fields have useable values
      .filter(
        edge =>
          edge.node.kf_id &&
          !isNaN(parseInt(edge.node.outcome.age_at_event_days)) &&
          STATUSES.includes(edge.node.outcome.vital_status),
      )
      // format for use with SurvivalPy
      .map(edge => ({
        id: edge.node.kf_id,
        time: parseInt(edge.node.outcome.age_at_event_days),
        censored: convertCensored(edge.node.outcome.vital_status),
      }));
    participants.push(...formattedResults);
  }

  return participants;
};

const calculateSurvival = async participants => {
  return new Promise((resolve, reject) => {
    let data = [];
    try {
      const pyShell = new PythonShell(survivalPyFile, pyOptions);
      pyShell.on('error', err => {
        reject(err);
      });
      pyShell.on('message', payload => {
        const message = JSON.parse(payload).message;
        // Only expecting one response from our script, but for extra security we add to array, return only uses first message
        data.push(message);
      });

      participants.forEach(participant => pyShell.send(JSON.stringify(participant)));

      pyShell.end(err => {
        if (err) {
          reject(err);
        } else {
          resolve(data[0]);
        }
      });
    } catch (error) {
      reject(error);
    }
  });
};

export default () => async (req, res) => {
  const sqon = req.body.sqon;
  const projectId = req.body.project;
  try {
    // Get the Participant Data from Arranger:
    const participants = await getParticipants({ sqon, projectId });

    const survivalData = await calculateSurvival(participants);

    res.json({ survivalData });
  } catch (err) {
    res.status(500).json({ error: err });
  }
};
