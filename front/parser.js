import { TOKEN_TYPE } from "./lexer.js";
export class Parse {
  eof() {
    return this.tokens[0].type != this.TOKEN_TYPE.EOF;
  }
  at() {
    return this.tokens[0];
  }
  eat() {
    const prev = this.tokens.shift();
    return prev;
  }
  expect(type, err) {
    const prev = this.tokens.shift();
    if (!prev || prev.type != type) {
      console.error(`Parser error:\n`, err, "Expecting: ", type);
      // process.exit(1);
      this.exit = true;
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
      if (isConstant)
        throw "Must assign value to constant expression. No value provided.";
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
    this.expect(this.TOKEN_TYPE.EON, "bro add a (\";\") or a newline after declaring a variable");

    return declaration;
  }
  parse_primary_expr() {
    const tk = this.at().type;
    switch (tk) {
      case this.TOKEN_TYPE.IDENT:
        return this.parse_ident();
      case this.TOKEN_TYPE.LET:
        return this.parse_var_declaration();
      case this.TOKEN_TYPE.FUN:
        return this.parse_func_statement();
      case this.TOKEN_TYPE.NULL:
        this.eat();
        return { type: "NULL", value: "null", grp: "AST" };
      case this.TOKEN_TYPE.TRUE:
        return { value: this.eat().value, type: "BOOL", grp: "AST" };
      case this.TOKEN_TYPE.TRUE:
        return { value: this.eat().value, type: "BOOL", grp: "AST" };
      case TOKEN_TYPE.IF:
        return this.parse_if_statement();
        case TOKEN_TYPE.WHILE:
          return this.parse_loop_statement();
      case this.TOKEN_TYPE.FALSE:// eat if keyword
        return { value: this.eat().value, type: "BOOL", grp: "AST" };
      case this.TOKEN_TYPE.NUM:
        return { value: this.eat().value, type: "NUMBER", grp: "AST" };
      case this.TOKEN_TYPE.STR:
        return { value: this.eat().value, type: "STR", grp: "AST" };
      case this.TOKEN_TYPE.SEMI:
        this.eat()
        return { value: "EON", type: "EON", grp: "AST" };
      case this.TOKEN_TYPE.EON:
        this.eat()
        return { value: "EON", type: "EON", grp: "AST" };
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
        console.error("bro token cant be parsable:", this.at());
        this.exit = true
        // process.exit(0);
    }
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

        const args = this.parse_args();
        const params = [];
        for (const arg of args) {
            if (arg.type !== "IDENT") {
                throw "Inside function declaration expected parameters to be of type String"
            }
            params.push(arg.value);
        }
        const body = this.parse_block_statement();
        const fn = {
            body, name, parameters: params, type: "FUNC"
        };
        return fn;
  }
  parse_ident(){
    let val = this.eat()
    // this.eat();
    // // this.expect(this.TOKEN_TYPE.R_paren)
    if(this.at().type == this.TOKEN_TYPE.R_paren){
      let args = this.parse_args()
      // console.log(args);
      // this.eat();
      // this.expect(this.TOKEN_TYPE.L_paren,"nuh/uh")
      // this.eat();

      return {type:"FUN_CALL",args:args,value: val.value}
    }
    // console.log(this.at());
    // this.expect(TOKEN_TYPE.R_paren, "Expected opening parenthesis following if keyword");
    // // const test = this.parse_a();
    // let hasargs = true;
    // while (hasargs) {

    // }
    // this.expect(TOKEN_TYPE.L_paren, "Expected closing parenthesis following if keyword");test:[test]
    return { type: "IDENT", value: val.value, grp: "AST" }
  }
  parse_multiplicative_expr() {
    let left = this.parse_primary_expr();
    while (["/", "*", "%"].includes(this.at().value)) {
      const operator = this.eat().value;
      const right = this.parse_primary_expr();
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
    while (["+", "-", "<", ">"].includes(this.at().value)) {
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
    this.expect(this.TOKEN_TYPE.R_brack, "Opening brace expected.");
    const body= [];
    while (this.eof() && this.at().type !== this.TOKEN_TYPE.L_brack) {
      const stmt = this.parse_token();
      body.push(stmt);
    }
    this.expect(this.TOKEN_TYPE.L_brack, "Closing brace expected.");
    return body;
  }
  parse_loop_statement() {
    this.eat()
    this.expect(TOKEN_TYPE.R_paren, "Expected opening parenthesis following if keyword");
    const test = this.parse_expr();
    this.expect(TOKEN_TYPE.L_paren, "Expected closing parenthesis following if keyword");
    const body = this.parse_block_statement();
    return {type: 'LOOP', body: body, condition:test,};
  }
  parse_if_statement() {
    this.eat()
    this.expect(TOKEN_TYPE.R_paren, "Expected opening parenthesis following if keyword");
    const test = this.parse_expr();
    this.expect(TOKEN_TYPE.L_paren, "Expected closing parenthesis following if keyword");
    const body = this.parse_block_statement();
    let alternate;
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
    while (["==", "!=", "<", ">", "<=", ">="].includes(this.at().value)) {
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
  parse_assignment_expr() {
    const left = this.parse_ken_bool_expr();
    // const left = this.parse_additive_expr()
    if (this.at().type == this.TOKEN_TYPE.EQ) {
      this.eat(); // advance past the equals
      const value = this.parse_assignment_expr();
      // this.expect(this.TOKEN_TYPE.EON, "bro add a (\";\") or a newline after declaring a variable");
      return { value, assigne: left, type: "ASS", grp: "AST" };
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
    this.exit = false
  }
  AST(json) {
    let program = { type: "PROGRAM", value: [], grp: "AST" };
    while (this.eof() && !this.exit) {
      program.value.push(this.parse_token());
    }
    if (this.exit) {
      return "error"
    }
    return json ? JSON.stringify(program) : program;
  }
}