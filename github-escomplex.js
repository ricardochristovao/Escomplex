const escomplex = require("escomplex");
const fs = require("fs");
const path = require("path");
const os = require("os");
const simpleGit = require("simple-git");
const CsvWriter = require("csv-writer").createObjectCsvWriter;

const githubToken = process.env.GITHUB_TOKEN;
const owner = "facebook";
const repo = "react";


async function cloneOrUpdateRepo(owner, repo) {
  const repoUrl = `https://github.com/${owner}/${repo}.git`;
  const localPath = path.join(os.tmpdir(), "repo");
  const git = simpleGit();

  if (fs.existsSync(localPath)) {
    console.log("Updating existing repository...");
    await git.cwd(localPath).pull();
  } else {
    console.log("Cloning repository...");
    await git.clone(repoUrl, localPath);
  }

  return localPath;
}

async function getLocalRepoFiles(localPath) {
  const allFiles = [];

  async function walk(dir) {
    const files = await fs.promises.readdir(dir);
    for (const file of files) {
      const fullPath = path.join(dir, file);
      const stats = await fs.promises.stat(fullPath);
      if (stats.isDirectory()) {
        await walk(fullPath);
      } else if (path.extname(fullPath) === ".js") {
        allFiles.push(path.relative(localPath, fullPath).replace(/\\/g, "/"));
      }
    }
  }

  await walk(localPath);
  return allFiles;
}

function formatDependencies(dependencies) {
  return dependencies
    .map(
      (dep) =>
        `Type: ${dep.type}, Path: ${dep.path}, Line: ${dep.line}`
    )
    .join("; ");
}

async function main() {
  const localPath = await cloneOrUpdateRepo(owner, repo);
  console.log("Fetching repository files...");
  const files = await getLocalRepoFiles(localPath);

  const csvWriter = CsvWriter({
    path: "results.csv",
    header: [
      { id: "path", title: "PATH" },
      { id: "complexity", title: "COMPLEXITY" },
      { id: "functionCount", title: "FUNCTION_COUNT" },
      { id: "averageComplexity", title: "AVERAGE_COMPLEXITY" },
      { id: "loc", title: "LOC" },
      { id: "sloc", title: "SLOC" },
      { id: "logicalLoc", title: "LOGICAL_LOC" },
      { id: "maintainability", title: "MAINTAINABILITY" },
      { id: "halstead", title: "HALSTEAD" },
      { id: "dependencies", title: "DEPENDENCIES" },
    ],
  });

  const records = [];


  console.log(`Processing ${files.length} JavaScript files...`);
  for (const file of files) {
    try {
      console.log(`Processing file: ${file}`);
      const code = fs.readFileSync(path.join(localPath, file), "utf-8");
      const results = escomplex.analyse(code);
      const functionCount = results.methods ? results.methods.length : 0;
      const averageComplexity =
        results.methods && functionCount > 0
          ? results.methods.reduce((sum, method) => sum + method.cyclomatic, 0) / functionCount
          : 0;

          records.push({
            path: file.path,
            complexity: results.aggregate.cyclomatic,
            functionCount: functionCount,
            averageComplexity: averageComplexity.toFixed(2),
            loc: results.loc,
            sloc: results.sloc,
            logicalLoc: results.logicalLoc,
            maintainability: results.maintainability.toFixed(2),
            halstead: JSON.stringify(results.aggregate.halstead),
            dependencies: formatDependencies(results.dependencies),
          });
    } catch (error) {
      console.error(`Error processing file ${file}: ${error.message}`);
    }
  }
  console.log("Writing results to CSV...");
  await csvWriter.writeRecords(records);
  console.log("Results saved to results.csv");
}

main().catch((error) => console.error(error));
