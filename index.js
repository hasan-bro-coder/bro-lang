#!/usr/bin/env node
import { readFile } from "fs";
import { Lexer } from "./front/lexer.js"
import { Parse } from "./front/parser.js"
import { Eval } from "./back/interpret.js"
import { ENV } from "./back/var.js";
import prompt from 'enquirer';
import chalk from 'chalk'
import util from 'util'
// import { timeEnd } from "console";
let prod = true
function print(data) {
  typeof data === 'object' || Array.isArray(data) ? console.log(util.inspect(data, true, 12, true)) : console.log(data)
  // console.log(util.inspect(data,true,12,true))
}
let short = true
let filename = "hsn.bro"
if (prod) {
  if (process.argv[2]) {
    short = false
    filename = process.argv[2]
  }
}
// let short = false
function spit(data, envs) {
  // function spit(data, envs) {
  //   let lex = new Lexer(data.toString())
  //   let lex_res = lex.tokenize()
  //   print(lex_res)
  //   if (lex.err) {
  //     print(lex.err_txt)
  //     return 0
  //   }
  //   let ast = new Parse(lex_res)
  //   let ast_res = ast.AST()
  //   if (ast.err) {
  //     print(chalk.red(ast.err_txt))
  //     return 0
  //   }
  //   let res = new Eval(ast_res, envs)
  //   let res_res = res.interpret()
  //   if (res.err) {
  //     print(chalk.red(res.err_txt))
  //     return 0
  //   }
  //   console.log(data.toString());
  //   console.log("-----------\n");
  //   print(lex_res);
  //   console.log("-----------\n");
  //   print(ast_res);
  //   console.log("-----------\n");
  //   print(res_res);
  console.log(data.toString());
  console.log("-----------\n");
  console.time()
  let lex_res = new Lexer(data.toString())
  let lex = lex_res.tokenize()
  if (lex_res.err){print(chalk.redBright("Lexer error:\t") + chalk.red(lex_res.err_text));return 0}
  print(lex);
  console.log("-----------\n");
  let ast_res = new Parse(lex)
  let ast = ast_res.AST()
  if (ast_res.err){print(chalk.redBright("Parser error:\t") + chalk.red(ast_res.err_text));return 0}
  print(ast);
  console.log("-----------\n");
  let res = new Eval(ast, envs).interpret()
  print(res);
  // console.timeEnd()
}
let env = new ENV()
// env.dec_var("dora",{value:"yo",type:"STR"})
if (short) {
  (async () => {
    while (true) {
      const { datas } = await new prompt().prompt({ name: 'datas', message: chalk.underline(chalk.blue(`bro ~`)), type: 'input', });
      spit(datas, env)
    }
  })();

} else {
  readFile(filename, async (err, data) => {
    spit(data.toString(), env)
  })
}
// (async () => {
//
//
//       spit(data.toString(),env)
//       while (true) {
//         const { datas } = await new prompt().prompt({ name: 'datas', message: chalk.underline(chalk.blue(`bro ~`)), type: 'input', });
//         env.assign_var("dora",{value: datas, type: 'STR'});
//         spit(data.toString(),env)
//         // console.log("\n"+chalk.underline(chalk.green("result:")) + " "+chalk.green(parse(lexer(command)))+"\n")
//       }
//
//     })();