module.exports = {
    apps: [
      {
        name: "webserver",
        cwd: "./apps/webserver",
        script: "npm",
        args: "run start",
        env: {
          NODE_ENV: "production",
        },
      },
      {
        name: "websocket",
        cwd: "./apps/websocket",
        script: "npm",
        args: "run start",
        env: {
          NODE_ENV: "production",
        },
      },
      {
        name: "cron-job",
        cwd: "./apps/cron-job",
        script: "npm",
        args: "run start",
        env: {
          NODE_ENV: "production",
        },
      },
    ],
  };
  