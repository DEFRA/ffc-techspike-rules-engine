const Hapi = require("@hapi/hapi");
const nunjucks = require("nunjucks");
const vision = require("@hapi/vision");
const path = require("path");

async function createServer() {
  const server = Hapi.server({
    port: process.env.PORT,
  });

  const routes = [].concat(
    require("./routes/healthy"),
    require("./routes/healthz"),
    require("./routes/home"),
    require("./routes/sbi"),
    require("./routes/form")
  );

  await server.register(vision);

  server.route(routes);

  server.views({
    engines: {
      njk: {
        compile: (src, options) => {
          const template = nunjucks.compile(src, options.environment);
          return (context) => template.render(context);
        },
      },
    },
    relativeTo: __dirname,
    compileOptions: {
      environment: nunjucks.configure([
        path.join(__dirname, "templates"),
        path.join(__dirname, "assets", "dist"),
        "node_modules/govuk-frontend/",
      ]),
    },
    path: "./templates",
    context: {
      assetpath: "/assets",
      govukAssetpath: "/assets",
      serviceName: "Rules engine POC",
      pageTitle: "Rules engine POC",
    },
  });

  return server;
}

module.exports = createServer;
