#!/usr/bin/env node
import { readFile } from "fs";
import { Lexer } from "./front/lexer.js"
import { Parse } from "./front/parser.js"
import { Eval } from "./back/interpret.js"
import { ENV } from "./back/var.js";
import prompt from 'enquirer';
import chalk from 'chalk'
import  util from 'util'
let prod = true
function print (data){
  typeof data === 'object' || Array.isArray(data) ? console.log(util.inspect(data,true,12,true)) : console.log(data)
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
function spit(data,envs){
  console.log(data.toString());
          console.log("-----------\n");
          print(new Lexer(data.toString()).tokenize());
          console.log("-----------\n");
          print(new Parse(new Lexer(data.toString()).tokenize()).AST());
          console.log("-----------\n");
          print(new Eval(new Parse(new Lexer(data.toString()).tokenize()).AST(),envs).interpret());
}
let env = new ENV()
env.dec_var("dora",{value:"yo",type:"STR"})
if (short) {
(async () => {
  while (true) {
    const { datas } = await new prompt().prompt({ name: 'datas', message: chalk.underline(chalk.blue(`bro ~`)), type: 'input', });
    spit(datas,env)
  }
})();
  
}else{
  readFile(filename,async (err,data)=>{
      spit(data.toString(),env)
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