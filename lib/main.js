"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const core = __importStar(require("@actions/core"));
const github = __importStar(require("@actions/github"));
function run() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const context = github.context;
            const prStringInput = core.getInput("pr", {
                required: false
            });
            const pr = prStringInput === "true";
            const pr_id = core.getInput("pr_id", { required: false }) || 0;
            const owner = core.getInput("owner", { required: false }) || context.repo.owner;
            const repo = core.getInput("repo", { required: false }) || context.repo.repo;
            const logUrl = pr ? `https://github.com/${owner}/${repo}/pull/${pr_id}/checks` : `https://github.com/${owner}/${repo}/commit/${context.sha}/checks`;
            const token = core.getInput("token", { required: true });
            const ref = core.getInput("ref", { required: false }) || context.ref;
            const url = core.getInput("target_url", { required: false }) || logUrl;
            const payload = JSON.parse(`{"web_url": "${url}"}`);
            const environment = core.getInput("environment", { required: false }) || "production";
            const description = core.getInput("description", { required: false });
            const initialStatus = core.getInput("initial_status", {
                required: false
            }) || "pending";
            const autoMergeStringInput = core.getInput("auto_merge", {
                required: false
            });
            const transientEnvironmentStringInput = core.getInput("transient_environment", {
                required: false
            });
            const auto_merge = autoMergeStringInput === "true";
            const transient_environment = transientEnvironmentStringInput === "true";
            const client = new github.GitHub(token, { previews: ["flash", "ant-man"] });
            const deployment = yield client.repos.createDeployment({
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
            yield client.repos.createDeploymentStatus(Object.assign({}, context.repo, { owner,
                repo, deployment_id: deployment.data.id, state: initialStatus, log_url: logUrl, environment_url: url, description }));
            core.setOutput("deployment_id", deployment.data.id.toString());
        }
        catch (error) {
            core.error(error);
            core.setFailed(error.message);
        }
    });
}
run();
