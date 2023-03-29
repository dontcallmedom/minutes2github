/**
 * Wrapper around Octokit to add throttling and avoid hitting rate limits
 * TODO: DRY with Webref?
 */
import { throttling } from "@octokit/plugin-throttling";
import OctokitRest from "@octokit/rest";
const DefaultOctokit = OctokitRest.Octokit.plugin(throttling);

const MAX_RETRIES = 3;

export function Octokit (params) {
  params = params || {};

  const octoParams = Object.assign({
    throttle: {
      onRateLimit: (retryAfter, options) => {
        if (options.request.retryCount < MAX_RETRIES) {
          console.warn(`Rate limit exceeded, retrying after ${retryAfter} seconds`)
          return true;
        } else {
          console.error(`Rate limit exceeded, giving up after ${MAX_RETRIES} retries`);
          return false;
        }
      },
      onSecondaryRateLimit: (retryAfter, options) => {
        if (options.request.retryCount < MAX_RETRIES) {
          console.warn(`Abuse detection triggered, retrying after ${retryAfter} seconds`)
          return true;
        } else {
          console.error(`Abuse detection triggered, giving up after ${MAX_RETRIES} retries`);
          return false;
        }
      }
    }
  }, params);

  return new DefaultOctokit(octoParams);
}
