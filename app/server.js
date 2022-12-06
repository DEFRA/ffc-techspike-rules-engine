const Hapi = require("@hapi/hapi");
const nunjucks = require("nunjucks");
const vision = require("@hapi/vision");
const path = require("path");

require("dotenv").config();

async function createServer() {
  const server = Hapi.server({
    port: process.env.PORT,
  });

  await server.register(require("@hapi/inert"));

  const routes = [].concat(
    require("./routes/assets"),
    require("./routes/form"),
    require("./routes/healthy"),
    require("./routes/healthz"),
    require("./routes/home"),
    require("./routes/land-summary"),
    require("./routes/standards-selection"),
    require("./routes/jbpm-communicator"),
    require("./routes/sbi-summary"),
    require("./routes/application-summary"),
    require("./routes/cannot-proceed"),
    require("./routes/no-elligible-parcel"),
    require("./routes/process-pending")
  );

  await server.register(vision);

  await server.register(require("./plugins/session"));

  server.route(routes);

  server.views({
    engines: {
      njk: {
        compile: (src, options) => {
          const template = nunjucks.compile(src, options.environment);
          return (context) => template.render(context);
        },
        prepare: (options, next) => {
          options.compileOptions.environment = nunjucks.configure(
            [
              "node_modules/govuk-frontend/",
              path.join(options.relativeTo || process.cwd(), options.path),
            ],
            {
              autoescape: true,
              watch: false,
            }
          );

          return next();
        },
      },
    },
    relativeTo: __dirname,
    // compileOptions: {
    //   environment: nunjucks.configure([
    //     path.join(__dirname, "templates"),
    //     path.join(__dirname, "assets", "dist"),
    //     "node_modules/govuk-frontend/",
    //   ]),
    // },
    path: "./views",
    context: {
      assetpath: "/assets",
      govukAssetpath: "/assets", //frontend/dist
      serviceName: "Rules engine POC",
      pageTitle: "Rules engine POC",
    },
  });

  return server;
}

module.exports = createServer;
