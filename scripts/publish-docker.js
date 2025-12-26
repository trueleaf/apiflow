const { spawnSync } = require("child_process");
const fs = require("fs");
const path = require("path");

function parseArgs(argv) {
  const args = {
    user: process.env.DOCKERHUB_USER || "",
    serverImage: "apiflow-server",
    webImage: "apiflow-web",
    platforms: "linux/amd64,linux/arm64",
    useNpmMirror: false,
    pushMongo: false,
    mongoImage: "mongo",
    mongoTag: "6",
  };

  for (let i = 2; i < argv.length; i += 1) {
    const arg = argv[i];
    switch (arg) {
      case "--user":
      case "-u":
        args.user = argv[i + 1] || "";
        i += 1;
        break;
      case "--server-image":
        args.serverImage = argv[i + 1] || args.serverImage;
        i += 1;
        break;
      case "--web-image":
        args.webImage = argv[i + 1] || args.webImage;
        i += 1;
        break;
      case "--platforms":
        args.platforms = argv[i + 1] || args.platforms;
        i += 1;
        break;
      case "--use-npm-mirror":
        args.useNpmMirror = true;
        break;
      case "--push-mongo":
        args.pushMongo = true;
        break;
      case "--mongo-image":
        args.mongoImage = argv[i + 1] || args.mongoImage;
        i += 1;
        break;
      case "--mongo-tag":
        args.mongoTag = argv[i + 1] || args.mongoTag;
        i += 1;
        break;

      case "--help":
      case "-h":
        printUsage();
        process.exit(0);
      default:
        throw new Error(`Unknown argument: ${arg}`);
    }
  }

  return args;
}

function printUsage() {
  console.log(`Usage:
  node scripts/publish-docker.js --user <DOCKERHUB_USER> [options]

Options:
  -u, --user <name>           Docker Hub username (or env DOCKERHUB_USER)
  --server-image <name>       Server image name (default: apiflow-server)       
  --web-image <name>          Web image name (default: apiflow-web)
  --platforms <list>          Platforms (default: linux/amd64,linux/arm64)      
  --use-npm-mirror            Use npm mirror during build
  --push-mongo                Mirror mongo image to the same registry
  --mongo-image <name>        Target mongo image name (default: mongo)
  --mongo-tag <tag>           Mongo image tag to mirror (default: 6)
  -h, --help                  Show help
`);
}

function readJson(filePath) {
  const raw = fs.readFileSync(filePath, "utf8");
  return JSON.parse(raw);
}

function runCapture(cmd, args, options) {
  const result = spawnSync(cmd, args, {
    encoding: "utf8",
    ...options,
  });
  if (result.status !== 0) {
    throw new Error(`Command failed: ${cmd} ${args.join(" ")}`);
  }
  return result.stdout.trim();
}

function run(cmd, args, options) {
  const result = spawnSync(cmd, args, {
    stdio: "inherit",
    ...options,
  });
  if (result.status !== 0) {
    throw new Error(`Command failed: ${cmd} ${args.join(" ")}`);
  }
}

function buildAndPush({
  dockerfile,
  image,
  version,
  repoRoot,
  dockerHubUser,
  platforms,
  useNpmMirror,
  gitSha,
}) {
  const tags = [
    `${dockerHubUser}/${image}:latest`,
    `${dockerHubUser}/${image}:v${version}`,
    `${dockerHubUser}/${image}:${gitSha}`,
  ];

  const buildArgs = [
    "buildx",
    "build",
    "--platform",
    platforms,
    "--push",
    "--file",
    dockerfile,
  ];

  if (useNpmMirror) {
    buildArgs.push("--build-arg", "USE_NPM_MIRROR=true");
  }

  for (const tag of tags) {
    buildArgs.push("-t", tag);
  }

  buildArgs.push(repoRoot);

  console.log(`Building and pushing ${image}`);
  console.log(`Tags: ${tags.join(", ")}`);
  run("docker", buildArgs);
}

function mirrorMongo({ dockerHubUser, mongoImage, mongoTag }) {
  const source = `mongo:${mongoTag}`;
  const target = `${dockerHubUser}/${mongoImage}:${mongoTag}`;
  console.log(`Mirroring ${source} to ${target}`);
  run("docker", ["buildx", "imagetools", "create", "-t", target, source]);
}

function main() {
  const args = parseArgs(process.argv);
  if (!args.user) {
    printUsage();
    throw new Error("Missing Docker Hub username. Use --user or DOCKERHUB_USER.");
  }

  const repoRoot = path.resolve(__dirname, "..");
  const serverPackageJson = path.join(repoRoot, "packages/server/package.json");
  const webPackageJson = path.join(repoRoot, "packages/web/package.json");
  const serverDockerfile = path.join(repoRoot, "packages/server/Dockerfile");
  const webDockerfile = path.join(repoRoot, "packages/web/Dockerfile");

  const serverVersion = readJson(serverPackageJson).version;
  const webVersion = readJson(webPackageJson).version;
  if (!serverVersion || !webVersion) {
    throw new Error("Missing version in package.json.");
  }

  const gitSha = runCapture("git", [
    "-C",
    repoRoot,
    "rev-parse",
    "--short=12",
    "HEAD",
  ]);

  if (!gitSha) {
    throw new Error("Unable to resolve git SHA.");
  }

  buildAndPush({
    dockerfile: serverDockerfile,
    image: args.serverImage,
    version: serverVersion,
    repoRoot,
    dockerHubUser: args.user,
    platforms: args.platforms,
    useNpmMirror: args.useNpmMirror,
    gitSha,
  });

  buildAndPush({
    dockerfile: webDockerfile,
    image: args.webImage,
    version: webVersion,
    repoRoot,
    dockerHubUser: args.user,
    platforms: args.platforms,
    useNpmMirror: args.useNpmMirror,
    gitSha,
  });

  if (args.pushMongo) {
    mirrorMongo({
      dockerHubUser: args.user,
      mongoImage: args.mongoImage,
      mongoTag: args.mongoTag,
    });
  }
}

main();
