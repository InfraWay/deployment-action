import * as core from "@actions/core";
import * as github from "@actions/github";

type DeploymentState =
  | "error"
  | "failure"
  | "inactive"
  | "in_progress"
  | "queued"
  | "pending"
  | "success";

async function run() {
  try {
    const context = github.context;

    const prStringInput = core.getInput("pr", {
      required: false
    });
    const pr: boolean = prStringInput === "true";

    const pr_id = core.getInput("pr_id", {required: false}) || 0;

    const owner = core.getInput("owner", {required: false}) || context.repo.owner;
    const repo = core.getInput("repo", {required: false}) || context.repo.repo;
    const logUrl = pr ? `https://github.com/${owner}/${repo}/pull/${pr_id}/checks` : `https://github.com/${owner}/${repo}/commit/${context.sha}/checks`;

    const token = core.getInput("token", { required: true });
    const ref = core.getInput("ref", { required: false }) || context.ref;
    const url = core.getInput("target_url", { required: false }) || logUrl;
    const payload = JSON.parse(`{"web_url": "${url}"}`)
    const environment = core.getInput("environment", { required: false }) || "production";
    const description = core.getInput("description", { required: false });
    const initialStatus =
      (core.getInput("initial_status", {
        required: false
      }) as DeploymentState) || "pending";
    const autoMergeStringInput = core.getInput("auto_merge", {
      required: false
    });
    const transientEnvironmentStringInput = core.getInput("transient_environment", {
      required: false
    });

    const auto_merge: boolean = autoMergeStringInput === "true";
    const transient_environment: boolean = transientEnvironmentStringInput === "true";

    const client = new github.GitHub(token, { previews: ["flash", "ant-man"] });

    const deployment = await client.repos.createDeployment({
      owner,
      repo,
      ref: ref,
      payload,
      required_contexts: [],
      environment,
      transient_environment,
      auto_merge,
      description
    });

    await client.repos.createDeploymentStatus({
      ...context.repo,
      owner,
      repo,
      deployment_id: deployment.data.id,
      state: initialStatus,
      log_url: logUrl,
      environment_url: url,
      description
    });

    core.setOutput("deployment_id", deployment.data.id.toString());
  } catch (error) {
    core.error(error);
    core.setFailed(error.message);
  }
}

run();
