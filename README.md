This software allows to parse HTML minutes of a meeting (only tested with the output of W3C's [scribe.perl](https://github.com/w3c/scribe2/) at the moment) and update github issues and pull requests that were discussed in the said meeting. When it finds an issue with a resolution, it copied the said resolution in the comment it posts on the issue.

If it finds PDF slides linked from the minutes using [scribe.perl `Slideset:`](https://w3c.github.io/scribe2/scribedoc.html#slides) convention, it will also report links to github issues from the said slides.

The overall goal is very similar to [David Baron's WGMeeting IRC bot](https://github.com/dbaron/wgmeeting-github-ircbot), but instead of operating live on IRC, it can be run on minutes post-facto (including after they've been edited as necessary) and can be used for meetings that don't rely on IRC minutes.

It's also inspired from [Richard Ishida mins2issue](https://github.com/r12a/mins2issue), but automates the process.

See also [ghurlbot](https://github.com/w3c/GHURLBot) that can be used as IRC bot to read from, create and close issues.

## Install
```sh
npm install
```

## Run
The tool can be used either [in a browser](https://dontcallmedom.github.io/minutes2github/) or via a node script.

In both cases, you need a Github personal access token that can post on the relevant repositories.

See example output at https://github.com/w3c/webrtc-encoded-transform/issues/172#issuecomment-1488106611


### Web interface

The [Web interface](https://dontcallmedom.github.io/minutes2github/) offers a form that requires the URL of the minutes. **NB** fetching the said minutes from a different origin will only work if it is CORS-allowed, which isn't the case at the moment for minutes hosted on www.w3.org.

Once the minutes have been fetched and parsed, the UI allows to review the comments that would be posted, and select which ones to proceed with. Posting the said comments require providing a github personal access token in the form.

### Node script

The Github personal access token can either be set in a `config.json` file under the key `GH_TOKEN`, or be provided via the `GH_TOKEN` environment variable

```
GH_TOKEN=ghp_<mytoken> node process.mjs <url_of_the_minutes> [<more_urls>...]
```

To run it without actually updating github issues (e.g. to check what it would do) you can run it as:
```
node process.mjs --dry-run <url_of_the_minutes>
```


