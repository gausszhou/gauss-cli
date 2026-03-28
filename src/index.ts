#!/usr/bin/env node
import { program } from "commander";
import { checkCode } from "./commands/stat.js";
import { checkXSS } from "./commands/xss.js";

program
  .name('codecheck')
  .version('1.0.0')
  .description('An example CLI tool');

program
  .command("stat")
  .description("统计代码行数、字符数等信息")
  .option("--path <path>", "指定代码所在目录", "src")
  .action((options) => {
    const { path } = options;
    checkCode(`${path}/**/*.{js,jsx,ts,tsx,json,css,scss,sass,less,html,md,mdx,vue,c,h,cpp,cc,cxx,hpp,hh,hxx,java,go,py,pyw,rs,php,rb,swift,kt,kts,scala,cs,vb,sh,bash,zsh,ps1,psm1,sql,yaml,yml,xml,toml,ini,conf,cfg,lua,pl,pm,r,R,dart,ex,exs,erl,hs,clj,fs,fsx,ml,mli,jl,m,groovy,gradle,Makefile,makefile,mk}`);
  });

program
  .command("xss")
  .description("检查 XSS 漏洞")
  .option("--path <path>", "指定代码所在目录", "src")
  .action((options) => {
    const { path } = options;
    checkXSS(`${path}/**/*.{js,jsx,ts,tsx,vue,html}`);
  });

program.parse(process.argv);
