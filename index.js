const { inspect } = require('util');

const core = require('@actions/core');
const { Octokit } = require('@octokit/action');
const { request } = require('@octokit/request');
const { withCustomRequest } = require('@octokit/graphql');

main();

async function main() {
  try {
    ``;
    const octokit = new Octokit();
    const { query, ...variables } = getAllInputs();

    core.info(query);
    for (const [name, value] of Object.entries(variables)) {
      core.info(`> ${name}: ${value}`);
    }

    const time = Date.now();

    const previewHeadersRequest = request.defaults({
      headers: {
        Accept: 'application/vnd.github.packages-preview+json',
      },
    });

    const previewGraphql = withCustomRequest(previewHeadersRequest);
    const data = await previewGraphql(query, variables);

    core.info(`< 200 ${Date.now() - time}ms`);

    core.setOutput('data', JSON.stringify(data, null, 2));
  } catch (error) {
    core.debug(inspect(error));
    core.setFailed(error.message);
  }
}

function getAllInputs() {
  return Object.entries(process.env).reduce((result, [key, value]) => {
    if (!/^INPUT_/.test(key)) return result;

    const inputName = key.substr('INPUT_'.length).toLowerCase();
    result[inputName] = value;
    result[inputName] =
      result[inputName] == parseInt(result[inputName], 10)
        ? parseInt(result[inputName], 10)
        : result[inputName];
    return result;
  }, {});
}
