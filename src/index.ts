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
  .description("检查代码或文章")
  .argument("<type>", "指定检查类型，可选值：article, code")
  .option("--path <path>", "指定代码或文章所在目录")
  .action((type, options) => {
    const { path = "src" } = options;
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
