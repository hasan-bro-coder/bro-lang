import { TOKEN_TYPE } from "./lexer.js";
import { Eval } from "../back/interpret.js";
// import { ENV } from "../back/var.js";
export class Parse {
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
		return { value: this.eat().value == 1 ? true : false, type: "BOOL", grp: "AST" };
	  case this.TOKEN_TYPE.FALSE:
		return { value: this.eat().value == 1 ? true : false, type: "BOOL", grp: "AST" };
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
	  case this.TOKEN_TYPE.SEMI:
		this.eat()
		return { value: ";", type: "SEMI", grp: "AST" };
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
	this.light_expect([this.TOKEN_TYPE.SEMI], "bro add a (\";\") or a newline after declaring a variable");
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
  parse_array(){
	  if (this.at().type !== this.TOKEN_TYPE.R_brace) {
			  return this.parse_ken_bool_expr()
	  }
	  this.eat()
	  if(this.at().type == this.TOKEN_TYPE.L_brace){
		this.eat()
	return {type: "ARRAY", props: [], grp: "AST"};

	  }
	  let props = [this.parse_assignment_expr()];
		while (this.at().type == this.TOKEN_TYPE.COMMA && this.eat()) {
			props.push(this.parse_assignment_expr());
		}
	  this.expect(this.TOKEN_TYPE.L_brace,"bro add the fucking ] bro")
	return {type: "ARRAY", props: props, grp: "AST"};
  }
  parse_obj_expr(){
	  if (this.at().type !== this.TOKEN_TYPE.R_brack) {
			return this.parse_array()
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
  let ENV = env
	if(jit){
		(async()=>{
			while (this.eof() && !this.err) {
				let val = this.parse_token()
				program.value.push(val);
				let res = new Eval(val, ENV)
        ENV = res.Env
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