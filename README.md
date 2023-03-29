This node script allows to parse HTML minutes of a meeting (only tested with the output of W3C's[scribe.perl](https://github.com/w3c/scribe2/) at the moment) and update github issues and pull requests that were discussed in the said meeting. When it finds an issue with a resolution, it copied the said resolution in the comment it posts on the issue.

This is very similar to [David Baron's WGMeeting IRC bot](https://github.com/dbaron/wgmeeting-github-ircbot), but instead of operating live on IRC, it can be run on minutes post-facto (including after they've been edited as necessary) and can be used for meetings that don't rely on IRC minutes.

It's also inspired from [Richard Ishida mins2issue](https://github.com/r12a/mins2issue), but automates the process.

## Install
```sh
npm install
```

## Run
You need a Github personal access token that can post on the relevant repositories. You can either set this in a `config.json` file under the key `GH_TOKEN`, or use the `GH_TOKEN` environment variable
```
GH_TOKEN=ghp_<mytoken> node process.js <url_of_the_minutes>
```

See example output at https://github.com/w3c/webrtc-encoded-transform/issues/172#issuecomment-1488106611

To run it without actually updating github issues (e.g. to check what it would do) you can run it as:
```
node process.js --dry-run <url_of_the_minutes>
```
