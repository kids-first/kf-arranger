import { PythonShell } from 'python-shell';
import { get, min } from 'lodash';

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

const getDiagnosesAge = diagnoses => {
  const ages = diagnoses
    .map(diagnosis => parseInt(get(diagnosis, 'node.age_at_event_days')))
    .filter(age => !isNaN(age));
  return min(ages);
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
              diagnoses {
                hits {
                  edges {
                    node {
                      age_at_event_days
                    }
                  }
                }
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

    const filteredList = edges
      // get values we need
      .map(edge => ({
        id: edge.node.kf_id,
        outcomeAge: parseInt(edge.node.outcome.age_at_event_days),
        censored: convertCensored(edge.node.outcome.vital_status),
        diagnosesAge: getDiagnosesAge(get(edge, 'node.diagnoses.hits.edges', [])),
        status: edge.node.outcome.vital_status,
      }))
      // Make sure all fields have useable values
      .filter(
        item =>
          item.id &&
          !isNaN(item.outcomeAge) &&
          !isNaN(item.diagnosesAge) &&
          item.outcomeAge >= item.diagnosesAge &&
          STATUSES.includes(item.status),
      );
    const formattedResults = filteredList
      // Calculate time and format for survivalPy
      .map(item => ({
        id: item.id,
        censored: item.censored,
        time: item.outcomeAge - item.diagnosesAge,
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

      participants.forEach(participant => {
        pyShell.send(JSON.stringify(participant));
      });

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

    const data = await calculateSurvival(participants);

    res.json({ data });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err });
  }
};
