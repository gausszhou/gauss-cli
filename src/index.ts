#!/usr/bin/env node
import { program } from "commander";
import { checkCode } from "./commands/check-code.js";
import { checkArticle } from "./commands/check-article.js";

program
  .name('gauss-cli')
  .version('1.0.0')
  .description('An example CLI tool');

program
  .command("check")
  .description("检查文章是否符合规范")
  .option("--type <type>", "指定检查类型，可选值：article, code")
  .option("--path <path>", "指定文章所在目录")
  .action((options) => {
    const { type, path } = options;

    switch (type) {
    case "article":
      checkArticle(`${path}/**/*.{md,mdx}`);
      break;
    case "code":
      checkCode(`${path}/**/*.{js,jsx,ts,tsx}`);
      break;
    default:
      console.log("请指定检查类型");
    }
  });

program.parse(process.argv);
