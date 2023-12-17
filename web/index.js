class ENV {
	constructor(parent) {
		this.parent = parent;
		this.msg = document.querySelector("code");
		this.vars = new Map(); 
		this.funcs = new Map();
		this.funcs_def = new Map();
		this.built_in()
	}
	built_in(){
		let math = new Map()
		math.set("pi",{type: "NUMBER", value: 3.141592653})
		math.set("gr",{type: "NUMBER", value: 1.618})
		this.vars.set("MATH",{type: "OBJ",value: math});
		this.add_def_func("say",['a'])
		this.add_def_func("sayf",['code'])
		this.add_def_func("time_start",[])
		this.add_def_func("time_log",[])
		this.add_def_func("run",["code"])
		this.add_def_func("str",["str"])
		this.add_def_func("num",["num"])
		// this.add_def_func("sayf",['code'],"utils")
		this.add_def_func("num",["num"])
	}
	has_def_obj_func(ast,fn){
		this.funcs_def.has("")
	}
	add_def_func(name,param,def="def",caller){
		let arr = this.funcs_def.get(def) || new Map()
		arr.set(name,{
			type: 'fn',
			name: name,
			parameters: param,
			declarationEnv: this,
			body: [],
			caller
		})
		
		this.funcs_def.set(def,arr)
	}
	dec_var(name, value) {
		// if (this.vars.has(name)) {
		// 	console.error("variable '"+name+"' already exists bro")
		// 	process.exit(1)
		// }
		this.vars.set(name, value);
		return value;
	}
	assign_var(name, value) {
		let env = this.resolve(name)
		// if (!env.has_var(name)) return env.dec_var(name, value);
		// throw "variable is undifined bro"
		env.vars.set(name, value);
		return env.get_var(name);
	}
	has_var(name) {
		return this.dec_resolve(name);
	}
	get_var(name) {
		let val = this.resolve(name).vars.get(name)
		return val;
	}
	add_func(ast) {
		this.funcs.set(ast.name, ast)
	}
	has_func(name) {
		return this.func_resolve(name).funcs.has(name)
	}
	run_func(name) {
		return this.func_resolve(name).funcs.get(name)
	}
	has_def_func(name,def) {
		return this.funcs_def.get(def || "def")?.has(name)
	}
	run_def_func(ast, val) {
		let fun = { res: "" }
		switch (ast.value) {
			case "say":
                let that = this;
				function print(data) {
                  that.msg.innerText += data + "\n"
				  typeof data === 'object' || Array.isArray(data) || data instanceof Map ? console.log(util.inspect(data, true, 12, true)) : console.log(data)
				}
				val.forEach(element => print(element?.value || element))
				break;
			case "sayf":
				if(val[0].type != "STR") throw new Error("sayf expected string got " + JSON.stringify(val[0]))
				let main_var = val[0].value.split("{}")
				if(main_var.length > val.length) throw "sayf expected more args"
				val.shift()
				main_var.forEach((element,i) => {
					if(i >= main_var.length - 1) return 0
					let variable = val.shift() || {type:"NULL",value:"null"}
					 main_var[i] = element + (variable?.type == "OBJ" ? print(variable.value) || "^^^" : variable.value)
				})
				print(main_var.join("") +" "+ val.map(el => el.value).join(" "))
				break;
			case "str":
				return {value: String(val[0].value),type: "STR"}
			case "num":
				return {value: Number(val[0].value),type: "NUMBER"}
			case "time_start":
				console.time()
				break;
			case "time_log":
				console.timeLog()
				break;
			case "run":
				new Eval(new Parse(new Lexer(val[0].value).tokenize()).AST(),this).interpret()
				break;
		}
		return fun

	}
	resolve(varname) {
		if (this.vars.has(varname)) return this;
		if (this.parent == undefined) {console.error(`Cannot resolve '${varname}' as it does not exist.`);return this};
		return this.parent.resolve(varname);
	}
	dec_resolve(varname) {
		if (this.vars.has(varname)) return true;
		if (this.parent == undefined) return false;
		return this.parent.dec_resolve(varname);
	}
	func_resolve(varname) {
		if (this.funcs.has(varname)) return this;
		if (this.parent == undefined) {console.error(`Cannot resolve '`,varname,`' as it does not exist.`);return this};
		return this.parent.func_resolve(varname);
	}
}
const TOKEN_TYPE = {
	BIN_OPR: "opr",
	EQ: "eq",
	BOOL_EQ: "==",
	L_paren: ")",
	R_paren: "(",
	L_brack: "}",
	R_brack: "{",
	L_brace: "]",
	R_brace: "[",
	NUM: "num",
	TRUE: "true",
	FALSE: "false",
	STR: "str",
	IDENT: "ident",
	LET: "keyword_let",
	MD: "modulo",
	NULL: "null",
	SEMI: ";",
	COMMENT: "//",
	COMMA: ",",
	DOT: ".",
	COLON: ":",
	IF: "if",
	IMPORT: "add",
	END: "end_kew_word",
	DO: "do",
	SLASH:"/",
	WHILE: "while",
	ELSE: "else",
	RETURN: "return",
	FUN: "function",
	FUNC: "functions",
	EON: "endline",
	DBLOPR:"+=",
	DBLEQ:"+=",
	EOF: "end",
}
class Lexer {
	token(val, type) {
		return { value: val, type: type, grp: "TOKEN" };
	}
	is_int(string) {
		return /^[0-9]*$/.test(string);
	}
	is_char(string) {
		return /^[A-Za-z_]+$/.test(string);
	}
	isskippable(str) {
		return str == " " || str == "\n" || str == "\t" || str == '\r';
	}
	error(str, line, word) {
		this.err = true
		this.err_text = `${str} on\nline: ${line}\nword: ${word}`
		// console.error(`${str}\non line: ${line}\nword:${word}`);

	}
	constructor(code) {
		this.err = false
		this.code = code
		this.err_text = "error bruh"
		this.TOKEN_TYPE = TOKEN_TYPE
		this.KEW_WORD = {
			"var": this.TOKEN_TYPE.LET,
			"null": this.TOKEN_TYPE.NULL,
			"shotto": this.TOKEN_TYPE.TRUE,
			"mittha": this.TOKEN_TYPE.FALSE,
			"true": this.TOKEN_TYPE.TRUE,
			"false": this.TOKEN_TYPE.FALSE,
			"if": this.TOKEN_TYPE.IF,
			"fi": this.TOKEN_TYPE.ELSE,
			"else": this.TOKEN_TYPE.ELSE,
			"loop": this.TOKEN_TYPE.WHILE,
			"func": this.TOKEN_TYPE.FUN,
			"fun": this.TOKEN_TYPE.FUNC,
			"return": this.TOKEN_TYPE.RETURN,
			"do": this.TOKEN_TYPE.DO,
			"end": this.TOKEN_TYPE.END,
			"add": this.TOKEN_TYPE.IMPORT,
			"import": this.TOKEN_TYPE.IMPORT,  
			"#include": this.TOKEN_TYPE.IMPORT,
		}
	}
	tokenize() {
		const tokens = new Array();
		const src = this.code.split("");
		let word_num = 0
		let line_num = 1
		while (src.length > 0) {
			// BEGIN PARSING ONE CHARACTER TOKENS
			if (src[0] == "*" || src[0] == "%" || src[0] == "/") {
				let val = src.shift()
				if(src[0] == "="){
					tokens.push(this.token(val , this.TOKEN_TYPE.DBLEQ));
					src.shift()
				}else tokens.push(this.token(val , this.TOKEN_TYPE.BIN_OPR));
			} else if (src[0] == ")") {
				tokens.push(this.token(src.shift(), this.TOKEN_TYPE.L_paren));
			}else if (src[0] == "(") {
				tokens.push(this.token(src.shift(), this.TOKEN_TYPE.R_paren));
			}else if (src[0] == "]") {
				tokens.push(this.token(src.shift(), this.TOKEN_TYPE.L_brace));
			}else if (src[0] == "[") {
				tokens.push(this.token(src.shift(), this.TOKEN_TYPE.R_brace));
			}else if (src[0] == "}") {
				tokens.push(this.token(src.shift(), this.TOKEN_TYPE.L_brack));
			}else if (src[0] == "{") {
				tokens.push(this.token(src.shift(), this.TOKEN_TYPE.R_brack));
			}else if (src[0] == "%") {
				tokens.push(this.token(src.shift(), this.TOKEN_TYPE.MD));
			}else if (src[0] == ";") {
				tokens.push(this.token(src.shift(), this.TOKEN_TYPE.SEMI));
			}else if (src[0] == ",") {
				tokens.push(this.token(src.shift(), this.TOKEN_TYPE.COMMA));
			}else if (src[0] == ":") {
				tokens.push(this.token(src.shift(), this.TOKEN_TYPE.COLON));
			}else if (src[0] == ".") {
				tokens.push(this.token(src.shift(), this.TOKEN_TYPE.DOT));
			}else if (src[0] == "&") {
				tokens.push(this.token(src.shift(), this.TOKEN_TYPE.BIN_OPR));
			}else if (src[0] == "|") {
				tokens.push(this.token(src.shift(), this.TOKEN_TYPE.BIN_OPR));
			}else {
				if (src[0] == "-") {
					 let tok = src.shift();
					 if (this.is_int(src[0])) {
						let num = "-"
					while (src.length > 0 && this.is_int(src[0]) || src[0] == ".") {
						num += src.shift()
					}
					tokens.push(this.token(num, this.TOKEN_TYPE.NUM));
					 }else if(src[0] == "="){
						 tokens.push(this.token(tok, this.TOKEN_TYPE.DBLEQ));
						 src.shift()
					}else{
				tokens.push(this.token(tok, this.TOKEN_TYPE.BIN_OPR));

					 }          
				}
				else if (src[0] == "+") {
						 let tok = src.shift();
						 if (src[0] == "+") {
						tokens.push(this.token("++", this.TOKEN_TYPE.DBLOPR));
						}else if (src[0] == "="){
						tokens.push(this.token(tok, this.TOKEN_TYPE.DBLEQ));
							 src.shift()
						}else{
					tokens.push(this.token(tok, this.TOKEN_TYPE.BIN_OPR));
						 }          
					}
				else if (this.is_int(src[0])) {
					let num = ""
					while (src.length > 0 && this.is_int(src[0]) || src[0] == ".") {
						num += src.shift()
					}
					tokens.push(this.token(num, this.TOKEN_TYPE.NUM));
				}
				else if (src[0] == "=") {
					src.shift();
					if (src[0] == "=") {
						src.shift();
						if (src[0] == "=") {
							src.shift()
							tokens.push(this.token("===", this.TOKEN_TYPE.BIN_OPR));
						} else {tokens.push(this.token("==", this.TOKEN_TYPE.BIN_OPR))}
					}
					else tokens.push(this.token("=", this.TOKEN_TYPE.EQ));
				}else if (src[0] == "#") {
					src.shift();
					while(src.length > 0 && src[0] != "\n"){
						src.shift()
					}
					// if (src[0] == "/") {
						// src.shift();
					// tokens.push(this.token("#", this.TOKEN_TYPE.COMMENT));
					// }
					// else tokens.push(this.token("/", this.TOKEN_TYPE.SLASH));
				}
				else if (src[0] == ">") {
					src.shift();
					if (src[0] == "=") {
						src.shift();
						tokens.push(this.token(">=", this.TOKEN_TYPE.BIN_OPR));
					}
					else tokens.push(this.token(">", this.TOKEN_TYPE.EQ));
				}else if (src[0] == "<") {
					src.shift();
					if (src[0] == "=") {
						src.shift();
						tokens.push(this.token("<=", this.TOKEN_TYPE.BIN_OPR));
					}
					else tokens.push(this.token("<", this.TOKEN_TYPE.EQ));
				}
				else if (src[0] == "!") {
					src.shift();
					if (src[0] == "=") {
						src.shift();
						tokens.push(this.token("!=", this.TOKEN_TYPE.BIN_OPR));
					}
					else {
						tokens.push(this.token("=", this.TOKEN_TYPE.EQ));
						console.error("bro ! is not recomanded dont use it")
					}
				}
				else if (src[0] == "~") {
					src.shift();
					if (src[0] == "=") {
						src.shift();
						tokens.push(this.token("~=", this.TOKEN_TYPE.BIN_OPR));
					}
					else {
						tokens.push(this.token("=", this.TOKEN_TYPE.EQ));
						console.error("bro ~ is not recomanded dont use it")
					}
				}
				else if (src[0] == "\"" || src[0] == "'") {
					let str = "";
					let types = src[0] == "\"" ? true : false
					src.shift();
					if (types) {
						while (src.length > 0 && src[0] !== '"') {
							str += src.shift();
							if (src[0] == "\\") {
								src.shift();
								str += src.shift();
							}
						}

					}else{
						while (src.length > 0 && src[0] !== '\'') {
							str += src.shift();
							if (src[0] == "\\") {
								src.shift();
								str += src.shift();
							}
						}
					}
					if (src.length == 0 && src[0] !== '"' && types) {
						this.err = true
						this.err_text = "expected \" at the end of string bro"
					}else if (src.length == 0 && src[0] !== '\'' && !types) {
						this.err = true
						this.err_text = "expected ' at the end of string bro"
					}
					// if (src[0] == "\\") {
						// src.shift();
						// src.shift();
					// }
					src.shift();
					tokens.push(this.token(str.replace("\\n","\n").replace("\\t","\t").replace("\\r","\r"), this.TOKEN_TYPE.STR));
				} else if (this.is_char(src[0])) {
					let ident = ""
					while (src.length > 0 && this.is_char(src[0])) {
						ident += src.shift()
					}
					let res_type = this.KEW_WORD[ident]
					if (typeof res_type == "string") {
						//         // if (res_type == "7") {
						tokens.push(this.token(ident == "true" || ident == "shotto" ? 1 : ident == "false" || ident == "mittha" ? 0 : ident, res_type));
						// }
					} else {
						tokens.push(this.token(ident, this.TOKEN_TYPE.IDENT));
					}
				}
				else if (this.isskippable(src[0])) {
					if (src[0] == "\n") {
						line_num++
						word_num = 0
						// tokens.push(this.token("EON", this.TOKEN_TYPE.EON));
					}
					src.shift()
				}
				else {
					this.error("Invalid charecter " + src[0], line_num, word_num)
					break
				}
			}
			//  else {
			//     if (this.is_int(src[0])) {
			//         let num = ""
			//         while (src.length > 0 && this.is_int(src[0])) {
			//             num += src.shift()
			//         }
			//         tokens.push(this.token(num, this.TOKEN_TYPE.NUM));
			//     }
			//     else{ 
			//     if (this.is_char(src[0])) {
			//         let ident = ""
			//         let done = false
			//         while (src.length > 0 && this.is_char(src[0])) {
			//             ident += src.shift()
			//             // if (src[0] == "\"") {
			//             //     is_string = false
			//             //     tokens.push(this.token(ident, this.TOKEN_TYPE.STR));
			//             //     done = true
			//             // }
			//         }
			//         if (!done){
			//             let res_type = this.KEW_WORD[ident]
			//             if (typeof res_type == "string") {
			//             // if (res_type == "7") {
			//                 tokens.push(this.token(ident, res_type));
			//                 // }
			//             } else {
			//                 tokens.push(this.token(ident, this.TOKEN_TYPE.IDENT));
			//             }
			//         }
			//         }
			//         else if (this.isskippable(src[0])) {
			//             if (src[0] == "\n") {
			//                 line_num++
			//             }
			//             src.shift()
			//     }
			//     else {
			//         this.error("Invalid charecter " + src[0], line_num, word_num)
			//         break
			//     }
			// }
			// }
			word_num++
		}
		tokens.push(this.token('END_OF_FILE', this.TOKEN_TYPE.EOF))
		return tokens
	}
}
class Parse {
	eof() {
	  return this.tokens[0].type != this.TOKEN_TYPE.EOF;
	}
	at(i) {
	  return this.tokens[0 + i||0];
	}
	eat() {
	  const prev = this.tokens.shift();
	  return prev;
	}
	expect(type, err) {
	  const prev = this.tokens.shift();
  
	  let found = false
	  if (Array.isArray(type)) {
		type.forEach((el)=>{
  
		  if (!prev || prev.type == el) {
			found = true
			return prev;
		  }
		})
		if (!found) {
		  this.err = true;
		  this.err_txt =  err + "Expecting: " + type + "BRO"
		}
	  }else{
		if (!prev || prev.type != type) {
		  // process.err(1);
		  this.err = true;
		  this.err_txt = err + "Expecting: " + type + "BRO"
		}
	  }
	  return prev;
	}
	light_expect(type, err) {
	  const prev = this.at();
	  if (Array.isArray(type)) {
		type.forEach((el)=>{
		  if (!prev || prev.type == el) {
			return this.eat()
		  }
		})
		  // process.err(1);
	  }else{
		if (!prev || prev.type != type) {
		  return this.eat()
		}
	  }
	  return prev;
	}
	parse_var_declaration() {
	  const isConstant = this.eat().type == this.TOKEN_TYPE.NUM;
	  const identifier = this.expect(
		this.TOKEN_TYPE.IDENT,
		"Expected identifier name following let/const keywords."
	  ).value;
	  if (this.at().type == this.TOKEN_TYPE.SEMI) {
		this.eat(); // expect semicolon
		return {
		  type: "VAR_DEC",
		  value: { type: "NULL", value: "null" },
		  identifier,
		  grp: "AST",
		};
	  }
	  this.expect(
		this.TOKEN_TYPE.EQ,
		"Expected equals token following identifier in var declaration."
	  );
	  const declaration = {
		type: "VAR_DEC",
		value: this.parse_expr(),
		identifier,
		grp: "AST",
	  };
	  // if (this.at().type == this.TOKEN_TYPE.String) this.eat(); // eaat the " at the end
	  this.light_expect([this.TOKEN_TYPE.SEMI], "bro add a (\";\") or a newline after declaring a variable");
  
	  return declaration;
	}
	parse_primary_expr() {
	  const tk = this.at().type;
	  switch (tk) {
		case this.TOKEN_TYPE.IDENT:
		  return this.parse_ident();
		case this.TOKEN_TYPE.RETURN:
		  return this.parse_return();
		case this.TOKEN_TYPE.LET:
		  return this.parse_var_declaration();
		case this.TOKEN_TYPE.FUN:
		  return this.parse_func_statement();
		case this.TOKEN_TYPE.FUNC:
		  return this.parse_funcs_statement();
		case this.TOKEN_TYPE.NULL :
		  this.eat();
		  return { type: "NULL", value: "null", grp: "AST" };
		case this.TOKEN_TYPE.TRUE:
		  return { value: this.eat().value, type: "BOOL", grp: "AST" };
		case this.TOKEN_TYPE.FALSE:
		  return { value: this.eat().value, type: "BOOL", grp: "AST" };
		case TOKEN_TYPE.IF:
		  return this.parse_if_statement();
		case TOKEN_TYPE.WHILE:
		  return this.parse_loop_statement();
		case this.TOKEN_TYPE.NUM:
		  return { value: this.eat().value, type: "NUMBER", grp: "AST" };
		case this.TOKEN_TYPE.STR:
		  return { value: this.eat().value, type: "STR", grp: "AST" };
		case this.TOKEN_TYPE.IMPORT:
		  return this.parse_import_expr();
		// case this.TOKEN_TYPE.SEMI:
		  // this.eat()
		  // return { value: "EON", type: "EON", grp: "AST" };
		// case this.TOKEN_TYPE.EON:
		  // break;
		  // this.eat()
		  // this.ignore_eon()
		  // return this.at()
		  // this.ignore_eon()
		  // return { value: "EON", type: "EON", grp: "AST" };
		case this.TOKEN_TYPE.R_paren:
		  this.eat(); // eat the opening paren
		  const value = this.parse_expr();
		  this.expect(
			this.TOKEN_TYPE.L_paren,
			"bro add the fucking >>>>> ) <<<<"
		  ); //
		  // this.expect(this.TOKEN_TYPE.CloseParen, "Unexpected token inside () expr. Expected \")\""); // closing paren
		  return value;
		default:
		  this.err_txt = "bro token cant be parsable: " + JSON.stringify(this.at())
		  this.err = true
		  // process.err(0);
	  }
	}
	parse_import_expr(){
	  this.eat()
	  let arg = this.eat()
	  if (arg.type == "str") {
		return {type: "IMPORT", value:arg}
	  }else{
		this.err = true
		this.err_txt = "expected filname got " + JSON.stringify(arg)
	  }
	}
	parse_return(){
	  this.eat()
	  let val = this.parse_additive_expr()
	  return {value: val,type: "RETURN"}
	}
	parse_args() {
	  this.expect(this.TOKEN_TYPE.R_paren, "Expected open parenthesis");
	  const args = this.at().type == this.TOKEN_TYPE.L_paren
		  ? []
		  : this.parse_args_list();
	  this.expect(this.TOKEN_TYPE.L_paren, "Missing closing parenthesis inside args list");
	  return args;
  }
  parse_args_list(){
	const args = [this.parse_assignment_expr()];
	while (this.at().type == this.TOKEN_TYPE.COMMA && this.eat()) {
		args.push(this.parse_assignment_expr());
	}
	return args;
  }
	parse_func_statement(){
	  this.eat(); // eat fn keyword
		  const name = this.expect(this.TOKEN_TYPE.IDENT, "Expected function name following fn keyword").value;
		  let anonym = name == "_" || name == "anonym" 
		  const args = this.parse_args();
		  const params = [];
		  for (const arg of args) {
			  if (arg.type !== "IDENT") {
				  this.err = true
				  this.err_txt = "Inside function declaration expected parameters to be of type String"
			  }
			  params.push(arg.value);
		  }
		  const body = this.parse_block_statement();
		  const fn = {
			  body, name, parameters: params, type: anonym ? "FUNC_ANON" : "FUNC"
		  };
		  return fn;
	}
	parse_funcs_statement(){
	  this.eat(); // eat fn keyword
		  const name = this.expect(this.TOKEN_TYPE.IDENT, "Expected function name following fn keyword").value;
		  const args = this.parse_args();
		  const params = [];
		  for (const arg of args) {
			  if (arg.type !== "IDENT") {
				  this.err = true
				  this.err_txt = "Inside function declaration expected parameters to be of type String"
			  }
			  params.push(arg.value);
		  }
		  const body = this.parse_block_statement();
		  const fn = {
			  body, name, parameters: params, type: "FUNCS"
		  };
		  return fn;
	}
	parse_ident(){
	  let val = this.eat()
	  // this.eat();
	  // // this.expect(this.TOKEN_TYPE.R_paren)
	  // if(this.at().type == this.TOKEN_TYPE.R_paren){
	  //   let args = this.parse_args()
	  //   // this.eat();
	  //   // this.expect(this.TOKEN_TYPE.L_paren,"nuh/uh")
	  //   // this.eat();
  
	  //   return {type:"FUN_CALL",args:args,value: val.value}
	  // }else if(this.at().type == this.TOKEN_TYPE.DBLOPR){
	  // 	return {type: "DBLOPR",value: val, opt: this.eat()}
	  // }
  
	  // this.expect(TOKEN_TYPE.R_paren, "Expected opening parenthesis following if keyword");
	  // // const test = this.parse_a();
	  // let hasargs = true;
	  // while (hasargs) {
  
	  // }
	  // this.expect(TOKEN_TYPE.L_paren, "Expected closing parenthesis following if keyword");test:[test]
	  return { type: "IDENT", value: val.value, grp: "AST" }
	}
	parse_call_member_expr(){
		const member = this.parse_member_expr();
  
		if (this.at().type == this.TOKEN_TYPE.R_paren) {
		  return this.parse_call_expr(member);
		}
  
		return member;
	}
	  parse_call_expr(caller){
		  let call_expr = {
				type: "FUN_CALL",
				value:caller.value,
				caller,
				args: this.parse_args(),
			  };
			  if (this.at().type ==  this.TOKEN_TYPE.R_paren) {
				call_expr = this.parse_call_expr(call_expr);
			  }
  
			  return call_expr;
	  }
	  parse_member_expr(){
		  let object = this.parse_primary_expr();
		  let varname = object
	  while (
			this.at().type == this.TOKEN_TYPE.DOT || this.at().type == this.TOKEN_TYPE.R_brace
		  ) {
			const operator = this.eat();
			let property;
			let computed;
			// non-computed values aka obj.expr
			if (operator.type == this.TOKEN_TYPE.DOT) {
			  computed = false;
			  property = this.parse_primary_expr();
			  if (property.type != "IDENT") {
				throw `Cannonot use dot operator without right hand side being a identifier`;
			  }
			} else { // this allows obj[computedValue]
			  computed = true;
			  property = this.parse_expr();
			  this.expect(
				  this.TOKEN_TYPE.L_brace,
				"Missing closing bracket in computed value.",
			  );
			}
  
			object = {
			  var: varname,
			  type: "MEMB",
			  object,
			  value: property,
			  computed,
			};
		  }
		  return object;
	  }
	parse_multiplicative_expr() {
	  // let left = this.parse_primary_expr();
		let left = this.parse_call_member_expr();
	  while (["/", "*", "%"].includes(this.at().value)&& this.at().type == this.TOKEN_TYPE.BIN_OPR) {
		const operator = this.eat().value;
		// const right = this.parse_primary_expr();
			let right = this.parse_call_member_expr();
		left = {
		  type: "BIN_OPT",
		  right: right,
		  left: left,
		  opt: operator,
		  grp: "AST",
		};
	  }
  
	  return left;
	}
	parse_additive_expr() {
	  let left = this.parse_multiplicative_expr();
	  while (["+", "-", "<", ">"].includes(this.at().value) && this.at().type == this.TOKEN_TYPE.BIN_OPR) {
		const operator = this.eat().value;
		const right = this.parse_multiplicative_expr();
		left = {
		  type: "BIN_OPT",
		  right: right,
		  left: left,
		  opt: operator,
		  grp: "AST",
		};
	  }
  
	  return left;
	}
	parse_block_statement(){
	  // this.expect(this.TOKEN_TYPE.R_brack, "Opening brace expected.");
	  let types = this.expect( [this.TOKEN_TYPE.DO,this.TOKEN_TYPE.R_brack] , "Opening brace expected.")
	  const body= []; 
	  while (this.eof() && this.at().type !== this.TOKEN_TYPE.END && this.at().type !== this.TOKEN_TYPE.L_brack) {
		const stmt = this.parse_token(); 
		body.push(stmt); 
	  }
	  if (types.type == this.TOKEN_TYPE.DO) {
		this.expect(this.TOKEN_TYPE.END, "Closing brace expected.");
	  }else this.expect(this.TOKEN_TYPE.L_brack, "Closing brace expected.");
	  return body;
	}
	parse_loop_statement() {
	  this.eat()
	  let types = this.light_expect([TOKEN_TYPE.R_paren,TOKEN_TYPE.R_brace], "Expected opening parenthesis following if keyword");
	  const test = this.parse_expr();
	  if (types.type == this.TOKEN_TYPE.R_paren) {
		this.expect(this.TOKEN_TYPE.L_paren, "Closing brace expected.");
	  }else if (types.type == this.TOKEN_TYPE.R_brace) this.expect(this.TOKEN_TYPE.L_brace, "Closing brace expected.");
	  // this.light_expect([TOKEN_TYPE.L_paren,TOKEN_TYPE.L_brace], "Expected closing parenthesis following if keyword");
	  const body = this.parse_block_statement();
	  return {type: 'LOOP', body: body, condition:test};
	}
	ignore_eon(){
	  while (this.at().type == this.TOKEN_TYPE.EON) {
		this.eat()
	  }
	}
	parse_if_statement() {
	  this.eat()
	  let types = this.light_expect([TOKEN_TYPE.R_paren,TOKEN_TYPE.R_brace], "Expected opening parenthesis following if keyword");
	  // this.expect(TOKEN_TYPE.R_paren, "Expected opening parenthesis following if keyword");
	  const test = this.parse_expr();
	  if (types.type == this.TOKEN_TYPE.R_paren) {
		this.expect(this.TOKEN_TYPE.L_paren, "Closing brace expected.");
	  }else if (types.type == this.TOKEN_TYPE.R_brace) this.expect(this.TOKEN_TYPE.L_brace, "Closing brace expected.");
	  // this.light_expect([TOKEN_TYPE.L_paren,TOKEN_TYPE.L_brace], "Expected closing parenthesis following if keyword");
	  // this.expect(TOKEN_TYPE.L_paren, "Expected closing parenthesis following if keyword");
	  const body = this.parse_block_statement();
	  let alternate;
		  this.ignore_eon()
		  if (this.at().type == this.TOKEN_TYPE.ELSE) {
			  this.eat(); // eat "else"
			  if (this.at().type == this.TOKEN_TYPE.IF) {
				  alternate = [this.parse_if_statement()];
			  } else {
				  alternate = this.parse_block_statement();
			  }
		  }
	  return {type: 'IF', body: body, test:test,alternate};
	}
	parse_bool_expr() {
	  let left = this.parse_additive_expr();
	  while (["==","===", "!=","~=", "<", ">", "<=", ">="].includes(this.at().value)) {
		const operator = this.eat().value;
		const right = this.parse_additive_expr();
		left = {
		  type: "BIN_OPT",
		  right: right,
		  left: left,
		  opt: operator,
		  grp: "AST",
		};
	  }
  
	  return left;
	  //     // return this.parse_additive_expr()
	}
	parse_ken_bool_expr() {
	  let left = this.parse_bool_expr();
	  while (["|", "&"].includes(this.at().value)) {
		const operator = this.eat().value;
		const right = this.parse_bool_expr();
		left = {
		  type: "BIN_OPT",
		  right: right,
		  left: left,
		  opt: operator,
		  grp: "AST",
		};
	  }
  
	  return left;
	  //     // return this.parse_additive_expr()
	}
	  // parse_dblopr(){
  
	  // }
	parse_obj_expr(){
		if (this.at().type !== this.TOKEN_TYPE.R_brack) {
			  return this.parse_ken_bool_expr()
		}
		this.eat(); // advance past open brace.
		const properties = [];
  
		while (this.eof() && this.at().type != this.TOKEN_TYPE.L_brack) {
		  const key =
			this.expect(this.TOKEN_TYPE.IDENT, "Object literal key exprected").value;
  
		  // Allows shorthand key: pair -> { key, }
		  if (this.at().type == this.TOKEN_TYPE.COMMA) {
			this.eat(); // advance past comma
			properties.push({ key, type: "PROP" });
			continue;
		  } // Allows shorthand key: pair -> { key }
		  else if (this.at().type == this.TOKEN_TYPE.L_brack) {
			properties.push({ key, type: "PROP" });
			continue;
		  }
		  // { key: val }
		  this.expect(
		  this.TOKEN_TYPE.COLON,
			"Missing colon following identifier in ObjectExpr",
		  );
		  const value = this.parse_expr();
  
		  properties.push({ type: "PROP", value, key });
		  if (this.at().type != this.TOKEN_TYPE.L_brack) {
			this.expect(
				this.TOKEN_TYPE.COMMA,
			  "Expected comma or closing bracket following property",
			);
		  }
		}
  
		this.expect(this.TOKEN_TYPE.L_brack, "Object literal missing closing brace.");
		return { type: "OBJ", properties , grp: "AST" };
  
	}
	parse_assignment_expr() {
	  const left = this.parse_obj_expr();
	  // const left = this.parse_additive_expr()
	  if (this.at().type == this.TOKEN_TYPE.EQ || this.at().type == this.TOKEN_TYPE.DBLEQ) {
		let val = this.eat(); // advance past the equals
		const value = this.parse_assignment_expr();
		// this.expect(this.TOKEN_TYPE.EON, "bro add a (\";\") or a newline after declaring a variable");
		return { value, assigne: left,opt: val.type == this.TOKEN_TYPE.DBLEQ ? val.value : "=", type: "ASS", grp: "AST" };
	  }
	  return left;
  }			
	parse_expr() {
	  // return this.parse_additive_expr()
	  return this.parse_assignment_expr();
	}
	parse_token() {
	  return this.parse_expr();
	}
	constructor(tokens) {
	  this.tokens = tokens;
	  this.TOKEN_TYPE = TOKEN_TYPE;
	  this.err = false
	  this.err_txt = "donno what is the error bro"
	}
	AST(jit,env) {
	  let program = { type: "PROGRAM", value: [], grp: "AST" };
	  if(jit){
		  (async()=>{
			  while (this.eof() && !this.err) {
				  let val = this.parse_token()
				  program.value.push(val);
				  let res = new Eval(val, env)
				  let res_res = res.interpret()
			  }
		  })()
	  }else{
		  while (this.eof() && !this.err) {
			  let val = this.parse_token()
			  program.value.push(val);
		  }
	  }
	  if (this.err) {
		return this.err_txt
	  }
	  return program;
	}
}
class Eval {
	eval_numeric_binary_expr(lhs, rhs, opt) {
		if ((lhs.type == 'NUMBER' || lhs.type == 'BOOL' || lhs.type == "NULL") && (rhs.type == 'NUMBER' || lhs.type == 'BOOL' || rhs.type == 'NULL')) {
			let lval = Number(lhs.value == "null" ? 0 : lhs.value);
			let rval = Number(rhs.value == "null" ? 0 : rhs.value);
			switch (opt) {
				case "+":
					return { type: "NUMBER", value: lval + rval, power: 1 };
				case "-":
					return { type: "NUMBER", value: lval - rval, power: 1 };
				case "*":
					return { type: "NUMBER", value: lval * rval, power: 1 };
				case "/":
					return { type: "NUMBER", value: lval / rval, power: 1 };
				case "%":
					return { type: "NUMBER", value: lval % rval, power: 1 };
				case "==":
					return { type: "BOOL", value: lval == rval ? true : false, power: 1 };
				case "===":
					return { type: "BOOL", value: lhs.value === rhs.value ? true : false, power: 1 };
				case "!=":
					return { type: "BOOL", value: lval != rval ? true : false, power: 1 };
				case ">":
					return { type: "BOOL", value: lval > rval ? true : false, power: 1 };
				case "<":
					return { type: "BOOL", value: lval < rval ? true : false, power: 1 };
				case "<=":
					return { type: "BOOL", value: lval <= rval ? true : false, power: 1 };
				case ">=":
					return { type: "BOOL", value: lval >= rval ? true : false, power: 1 };
				case "|":
					return { type: "BOOL", value: lval || rval ? true : false, power: 1 };
				case "&":
					return { type: "BOOL", value: lval && rval ? true : false, power: 1 };
				default:
					console.error(`Unknown operator provided in operation: `, lhs, rhs)
					this.exit = true; return 0;

			}
		} else if (lhs.type == 'STR' && rhs.type == 'STR') {
			let lval = lhs.value;
			let rval = rhs.value;
			switch (opt) {
				case "+":
					return { type: "STR", value: lval + rval, power: 1 };
				case "==":
					return { type: "BOOL", value: lval == rval ? true : false, power: 1 };
				case "===":
					return { type: "BOOL", value: lhs.value === rhs.value ? true : false, power: 1 };
				case "!=":
					return { type: "BOOL", value: lval != rval ? true : false, power: 1 };
				case "~=":
					return { type: "BOOL", value: lval.match(rval) ? true : false, power: 1 };
				case ">":
					return { type: "BOOL", value: lval > rval ? true : false, power: 1 };
				case "<":
					return { type: "BOOL", value: lval < rval ? true : false, power: 1 };
				case "<=":
					return { type: "BOOL", value: lval <= rval ? true : false, power: 1 };
				case ">=":
					return { type: "BOOL", value: lval >= rval ? true : false, power: 1 };
				case "|":
					return { type: "BOOL", value: lval || rval ? true : false, power: 1 };
				case "&":
					return { type: "BOOL", value: lval && rval ? true : false, power: 1 };
				default:
					console.error(`Unknown operator provided in operation: `, lhs, "&&", rhs)
					this.exit = true; return 0;
			}
		} else if ((lhs.type == 'STR' || lhs.type == 'NUMBER' || lhs.type == 'NULL') && (rhs.type == 'STR' || rhs.type == 'NUMBER' || rhs.type == 'NULL')) {
			let lval = String(lhs.type == "NULL" ? "" : lhs.value);
			let rval = String(rhs.type == "NULL" ? "" : rhs.value);
			switch (opt) {
				case "+":
					return { type: "STR", value: lval + rval, power: 1 };
				case "==":
					return { type: "BOOL", value: lval == rval ? true : false, power: 1 };
				case "===":
					return { type: "BOOL", value: (lhs.value === rhs.value) && lhs.type == rhs.type ? true : false, power: 1 };
				case "!=":
					return { type: "BOOL", value: lval != rval ? true : false, power: 1 };
				case "|":
					return { type: "BOOL", value: lval || rval ? true : false, power: 1 };
				case "&":
					return { type: "BOOL", value: lval && rval ? true : false, power: 1 };
				default:
					console.error(`Unknown operator provided in operation: `, lhs, opt, rhs)
					this.exit = true; return 0;
			}
		} else {

			console.error(`cant do operation with: `, lhs, "&&", rhs)
			this.exit = true; return { type: "NULL", value: "null_Error", power: 0 };
		}
		// if () {
		//     
		// } 
	}
	eval_function_run(ast, env) {
		const args = ast.args.map(arg => this.interpret(arg, env));
		let func
		if (ast.caller?.type == "MEMB") {
			func = this.interpret(ast.caller)
			if (!func) {
				this.exit = true
				return 0
			}
			const scope = new ENV(func.declarationEnv);
			for (let i = 0; i < func.parameters.length; i++) {
				const varname = func.parameters[i];
				scope.dec_var(varname, args[i] || { value: "null", type: "NULL" });
			}
			this.return = false
			if (env.has_def_func(ast.value,ast.caller?.var)) {
				return env.run_def_obj_func(ast,func)
			} 
			return this.eval_body(func.body, scope, false)

		}
		if (env.has_def_func(ast.value)) {
			func = env.run_def_func(ast, args)
			return func
		}
		else if (env.has_func(ast.value)) {
			func = env.run_func(ast.value)
			const scope = new ENV(func.declarationEnv);

			for (let i = 0; i < func.parameters.length; i++) {
				// TODO check the bounds here
				// verify arity of function
				const varname = func.parameters[i];
				scope.dec_var(varname, args[i] || { value: "null", type: "NULL" });
			}
			if (!func?.async) {
				this.return = false
				return this.eval_body(func.body, scope, true)
			} else {
					let worker = new Worker('./back/worker.js', { workerData: { ast: func.body, env: scope } });
						// let lastEvaluated = ""
						// worker.on('message', (data) => {
							// lastEvaluated = data.data
						// });
					// return lastEvaluated
				// return { value: ress }

			}
		}
		// Create new function scope

		// const fn = {
		//     type: "fn",
		//     name: declaration.name,
		//     parameters: declaration.parameters,
		//     declarationEnv: env,
		//     body: declaration.body,
		// };
		// let val = env.add_func(fn)
		// return val;
	}
	eval_function_declaration(declaration, env) {
		// Create new function scope
		const fn = {
			type: "fn",
			name: declaration.name,
			parameters: declaration.parameters,
			declarationEnv: new ENV(env),
			body: declaration.body,
		};
		let val = env.add_func(fn)
		return val;
	}
	eval_identifier(ident, env) {
		// if (ident.group == "var") ,env{
		// if (env.has_var(ident.value)) {
			const val = env.get_var(ident.value);
			return val;
		// } else {
			// console.error(`bro \"${ident.value}\" is not defined`)
			// this.exit = true;
			// return { type: "NULL", value: "null" }
		// }
		// else {
		//         console.error("this is not defined:", ident);
		//         this.exit = true; return 0;
		//     }
		// } else {
		//     if (this.Env.has_var(ident.value)) {
		//         this.Env.run_func(ident.value)
		//         // const val = this.Env.get_var(ident.value);
		//         // return val;
		//     } else {
		//         console.error("this is not defined:", ident);
		//         this.exit = true; return 0;
		//     }
		// }
	}
	eval_binary_expr(binop, env) {
		if (binop.type == "BOOL") {
			return binop.value == 1 ? { type: "BOOL", value: true } : { type: "BOOL", value: false };
		}
		const lhs = this.interpret(binop.left, env);
		const rhs = this.interpret(binop.right, env);
		return this.eval_numeric_binary_expr(lhs, rhs, binop.opt);
	}
	eval_program(program, env) {
		let lastEvaluated = { type: "NULL", value: "null" };
		let res = "";
		(async () => {

			while (program.value.length > 0) {
				if (!program.value[0]) {
					return "errors"
				}

				// if (!program.value[0]) {
				//     return "errors" 
				// }
				if (program.value[0].type == "IMPORT") {
					lastEvaluated = await this.interpret(program.value[0], env)
					program.value.shift()
				} else {
					lastEvaluated = this.interpret(program.value[0], env)
					program.value.shift()
				}

				lastEvaluated?.power == 1 ? res += lastEvaluated.value + "\n" : 0;
			}
		})()
		return res
	}
	eval_assignment(node, env) {
		// if (node.assigne.type !== "IDENT") {
		// 	console.error(`Invalid LHS inside assignment expr `, node.assigne);
		// 	this.exit = true; return 0;
		// }
		let varname;
		if(node.assigne.type == "IDENT"){
			varname = (node.assigne).value
		if (env.has_var(varname)) {
			if(node.opt != "="){
				return env.assign_var(varname, this.eval_numeric_binary_expr(env.get_var(varname),this.interpret(node.value, env), node.opt))
			}
			return env.assign_var(varname, this.interpret(node.value, env));
		}
		else {
			if(node.opt != "="){
				this.exit = true
				console.error("bro",varname,"aint defined \n define it first")
			}
			return env.dec_var(varname, this.interpret(node.value, env));
			// this.interpret({ type: 'VAR_DEC', value: this.interpret(node.value, env), identifier: varname, grp: 'AST' }, env)
		}
		}else if(node.assigne.type == "MEMB") {
			varname = this.eval_obj_var(node.assigne,env)
			varname.map.set(varname.ast,this.interpret(node.value, env))
		}else{
			console.error(`Invalid LHS inside assignment expr `, node.assigne);
			this.exit = true; return 0;
		};
	}
	eval_var_program(declaration, env) {
		const value = this.interpret(declaration.value, env) || { type: "NULL", value: null };
		if (value.type == "fn_") {
			value.name = declaration.identifier
			let val = env.add_func(value)
		}
		return env.dec_var(declaration.identifier, value);
	}
	eval_body(body, env, new_env) {
		let scope;
		if (new_env) {
			scope = new ENV(env);
		} else {
			scope = env;
		}
		let result = { value: "null", type: "NULL" };
		for (const stmt of body) {
			if (!this.return) {
				result = this.interpret(stmt, env);
			}
		}
		return result;
	}
	eval_if_program(ast, env) {
		let opt = { type: "BOOL", value: false }
		if (ast.test.type == "BOOL") {
			opt.value = ast.test.value == 1 ? true : false;
		} else { opt = this.eval_binary_expr(ast.test, env) }
		if (opt.value) {
			return this.eval_body(ast.body, env)
		} else if (ast.alternate) {
			return this.eval_body(ast.alternate, env);
		} else {
			return { value: "null", type: "NULL" };
		}
		// return opt
	}
	eval_functions_declaration(declaration, env) {
		const fn = {
			type: "fn",
			name: declaration.name,
			parameters: declaration.parameters,
			declarationEnv: new ENV(env),
			body: declaration.body,
			async: true,
		};
		let val = env.add_func(fn)
		return val;
	}
	async eval_import_function(ast, envs) {

		// let { Lexer } = await import("../front/lexer.js")
		// let { Parse } = await import("../front/parser.js")
		let { readFileSync } = await import("fs");
		(async () => {
			let data = await readFileSync(ast.value.value, "utf8")
			return this.interpret({ type: "FUN_CALL", args: [{ value: data, type: 'STR', grp: 'AST' }], value: "run" }, envs)
			//   {
			//         let lex_res = new Lexer(data.toString())
			//         let lex = lex_res.tokenize()
			//         // print(lex)
			//         // if (lex_res.err) { print(chalk.redBright("Lexer error:\t") + chalk.red(lex_res.err_text)); return 0 }
			//         let ast_res = new Parse(lex)
			//         let ast = ast_res.AST()
			//         // if (ast_res.err) { print(chalk.redBright("Parser error:\t") + chalk.red(ast_res.err_txt)); return 0 }
			//         // print(ast);
			//         let val = new Eval(ast, envs).interpret()
			//         return val
			//     }
		})()
	}
	eval_return_program(ast, env) {
		this.return = true
		return this.interpret(ast.value, env);
	}
	eval_loop_program(ast, env) {
		// let opt = this.eval_binary_expr(ast.condition)
		let opt = { type: "BOOL", value: false }
		if (ast.condition.type == "BOOL") {
			opt.value = ast.condition.value == 1 ? true : false;
		} else { opt = this.eval_binary_expr(ast.condition, env) }
		while (opt.value) {

			this.eval_body(ast.body, env)
			opt = this.eval_binary_expr(ast.condition, env)
		}

	}
	eval_function__declaration(declaration, env) {
		const fn = {
			type: "fn_",
			parameters: declaration.parameters,
			declarationEnv: new ENV(env),
			body: declaration.body,
		};
		// let val = env.add_func(fn)
		return fn;
	}
	eval_obj_member(ast,env){
		if(ast.object.type == "IDENT"){
			let map_var = env.get_var(ast.object.value)
			if (!map_var) {
				this.exit = 0;
					return 0
			}
			let val;
			if(ast.value.type == "NUMBER"){
				let arr = [...map_var.value.values()]
				if (arr.length < ast.value.value) {
					this.exit = 0;
					return 0
				}
				return arr[ast.value.value]
			}
			if(map_var.value.has(ast.value.value)){
			val = map_var.value.get(ast.value.value)

			return val
			}
			else{
				this.exit = 0;
					return 0
			}
		}
		let main_map = this.eval_obj_member(ast.object,env)

		if(ast.value.type == "NUMBER"){
			let arr = [...main_map?.value?.values()]
				if (arr.length < ast.value.value) {
					this.exit = 0;
					return 0
				}
				return arr[ast.value.value]
		}else{
			if(main_map.value.has(ast.value.value)){
			return main_map.value.get(ast.value.value)
			}else{
			console.error("cant read proparty of undefined bro ?!")
			}
		}

	}
	eval_obj_var(ast,env){
		if(ast.object.type == "IDENT"){
			let map_var = env.get_var(ast.object.value)
			let val;
			if(ast.value.type == "NUMBER"){
			let arr = [...map_var.value.values()]
			val = arr[ast.value.value]
			if (val?.value instanceof Map) {
				return {map: val?.value,ast:ast.value?.value}
			}
			return {map:map_var.value,ast:ast.value?.value}
			// 	let arr = [...map_var.value.values()]
			// 	if (arr.length < ast.value.value) {
			// 		console.error("cant read proparty of undefined bro")
			// 		process.exit(0)
			// 	}
			// 	return arr[ast.value.value]
			}
			// if(map_var.has(ast)){
			val = map_var.value.get(ast.value.value)
			if (val?.value instanceof Map) {
				return {map: val?.value,ast:ast.value?.value}
			}
			return {map:map_var.value,ast:ast.value?.value}
			// }
		}
		let main_map = this.eval_obj_var(ast.object,env).map
		// if (main_map instanceof Map) {
		return {map: main_map,ast:ast.value?.value}
		// }
		// return {map:main_map.value,ast:ast.value?.value}
		// return {map: main_map.value,ast:ast.value}

	}
	eval_dblopt(){

	}
	eval_obj(ast,env){
		let obj = {type: "OBJ",value: new Map()}
		  for (const { key, value } of ast.properties) {
			const runtimeVal = (value == undefined)
			  ? env.has_var(key)
			  : this.interpret(value, env);

			obj.value.set(key, runtimeVal);
		  }

		  return obj;
	}
	constructor(ast, Env) {
		this.Env = Env
		this.ast = ast;
		this.exit = false
		this.return = false
		this.res = ""
	}
	interpret(ast, env) {
		if (!ast) {
			ast = this.ast
		}
		if (this.exit) {
			this.exit = true; return 0
		}
		switch (ast.type) {
			case "NUMBER":
				return { type: "NUMBER", value: ast.value, };
			case "STR":
				return { type: "STR", value: ast.value, };
			case "BOOL":
				return { type: "BOOL", value: ast.value, };
			case "BIN_OPT":
				return this.eval_binary_expr(ast, env || this.Env)
			case "DBLOPR":
				return {type: "STR", value: ast.value,}
			case "OBJ":
				return this.eval_obj(ast, env || this.Env)
			case "VAR_DEC":
				return this.eval_var_program(ast, env || this.Env)
			case "PROGRAM":
				return this.eval_program(ast, env || this.Env)
			case "IF":
				return this.eval_if_program(ast, env || this.Env)
			case "LOOP":
				return this.eval_loop_program(ast, env || this.Env)
			case "RETURN":
				return this.eval_return_program(ast, env || this.Env)
			case "FUNC_ANON":
				return this.eval_function__declaration(ast, env || this.Env)
			case "FUNC":
				return this.eval_function_declaration(ast, env || this.Env)
			case "FUNCS":
				return this.eval_functions_declaration(ast, env || this.Env)
			case "FUN_CALL":
				return this.eval_function_run(ast, env || this.Env);
			case "MEMB":
				return this.eval_obj_member(ast, env || this.Env);
			case "NULL":
				return { type: "NULL", value: "null" }
			case "IMPORT":
				return this.eval_import_function(ast, env || this.Env)
			case "IDENT":
				return this.eval_identifier(ast, env || this.Env)
			case "ASS":
				return this.eval_assignment(ast, env || this.Env)
			default:
				console.error("This AST node has not yet been setup for interpretation", ast);
		}
	}
}
function print(data,err) {
    // typeof data === 'object' || Array.isArray(data) ? console.log(util.inspect(data, true, 12, true)) : 
    console.log(data)
    if (err) document.querySelector("code").innerHTML = `<p style="color: red">${data}\n</p>`;
} 
async function run(data){
    document.querySelector("code").innerText = ""
    let envs = new ENV(undefined, document.querySelector("code").innerHTML)
    let jit = false
    console.log("------code-----\n");
    console.log(data.toString());
    console.log("------lexer-----\n");
    let lex_res = new Lexer(data.toString())
    let lex = lex_res.tokenize()
    if (lex_res.err){print("Lexer error bro:\t" + (lex_res.err_text),true);return 1}
    print(lex);
    console.log("------parser-----\n");
    let ast_res = new Parse(lex)
    ast = ast_res.AST(jit,envs)
    if (ast_res.err){print(("Parser error bro:\t") + (ast_res.err_txt),true);return 1}
    print(ast);
    console.log("------result-----\n");
    let res = new Eval(ast, envs)
    let res_res = res.interpret()
    return res_res
    // document.querySelector("code").innerHTML = res_res
}
let finish = 0;
document.querySelector(".run").onclick = async ()=>{
    if (finish == 0) {
        finish = await run(document.querySelector("textarea").value)
    }
    // else{
        // finsh = 0
    // }
}
