export interface ISynchronizeOptions {
  hostname?: string;
  port?: number;
  delay?: number;
  retry?: number;
  verbose?: boolean;
}

/**
 * Experimental
 *
 * Reload webpack dev server only if a remote server is up.
 * This is useful if we have wds + nodemon
 *
 * @param options
 */
export const synchronize = (options: ISynchronizeOptions = {}) => {
  const http = require("http");
  const Server = require("webpack-dev-server/lib/Server");
  const sendStats = Server.prototype._sendStats;
  const hostname = options.hostname || "localhost";
  const port = options.port || 3000;
  const delay = options.delay || 800;
  const retry = options.retry || 4;
  const log = (message) => {
    if (options.verbose) {
      // tslint:disable-next-line
      console.log(message);
    }
  };

  function tryUntilSuccess(o, i, callback) {
    if (i > retry) {
      log("webpack: Server not found.");
      callback(null);
      return;
    }
    log("webpack: Check server until (" + i + "/" + retry + ")");
    const req = http.request({
      hostname: o.hostname,
      port: o.port,
    }, (res) => {
      let acc = "";
      res.on("data", (msg) => acc += msg.toString("utf-8"));
      res.on("end", () => {
        if (acc.indexOf("app") > -1) {
          log("webpack: Connected.");
          callback(null);
        } else {
          log("webpack: Server is't ready, retry...");
          setTimeout(() => {
            tryUntilSuccess(o, i + 1, callback);
          }, delay);
        }
      });
    });
    req.setTimeout(delay);
    req.end();
    req.on("error", () => {
      log("webpack: Server is't started, retry...");
      setTimeout(() => {
        tryUntilSuccess(options, i + 1, callback);
      }, delay);
    });
  }

  Server.prototype._sendStats = function _sendStats() {
    const args = arguments;
    const self = this;
    tryUntilSuccess({
      port,
      hostname,
    }, 0, () => {
      sendStats.apply(self, args);
    });
  };
};
