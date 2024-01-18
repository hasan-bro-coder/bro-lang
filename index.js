#!/usr/bin/env node
import { readFile } from "fs";
import { Lexer } from "./front/lexer.js"
import { Parse } from "./front/parser.js"
import { Eval } from "./back/interpret.js"
import { ENV } from "./back/var.js";
// import { Lexer } from "./mini/front/lexer.js"
// import { Parse } from "./mini/front/parser.js"
// import { Eval } from "./mini/back/interpret.js"
// import { ENV } from "./mini/back/var.js";
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
if (process.argv[2]) {
  short = false
  filename = process.argv[2].match(".bro") ? process.argv[2] : short = true

}
// let short = false
function spit(data, envs) {
  let ast;
  let jit = process.argv.includes("-jit")
  if (process.argv.includes("-ast") ) {
	console.log("------code-----\n");
	console.log(data.toString());
	console.log("------lexer-----\n");
	let lex_res = new Lexer(data.toString())
	let lex = lex_res.tokenize()
	if (lex_res.err){print(chalk.redBright("Lexer error bro:\t") + chalk.red(lex_res.err_text));return 0}
	print(lex);
	console.log("------parser-----\n");
	let ast_res = new Parse(lex)
	ast = ast_res.AST(jit)
	if (ast_res.err){print(chalk.redBright("Parser error bro:\t") + chalk.red(ast_res.err_txt));return 0}
	print(ast);
	console.log("------result-----\n");

  }
  else{
	let lex_res = new Lexer(data.toString())
	let lex = lex_res.tokenize()
	if (lex_res.err){print(chalk.redBright("Lexer error bro:\t") + chalk.red(lex_res.err_text));return 0}
	let ast_res = new Parse(lex)
	ast = ast_res.AST(jit)
	if (ast_res.err){print(chalk.redBright("Parser error bro:\t") + chalk.red(ast_res.err_txt));return 0}
  }
	if(!jit){
  let res = new Eval(ast, envs)
  let res_res = res.interpret()
  // res_res&&console.log(res_res);
	}
		// console.timeLog()
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