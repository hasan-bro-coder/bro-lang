import { Lexer } from "../front/lexer.js";
import { Parse } from "../front/parser.js";
import { Eval } from "./interpret.js";
import util from "util";

export class ENV {
  constructor(parent) {
    this.parent = parent;
    this.vars = new Map();
    this.funcs = new Map();
	this.global = parent == undefined
    this.funcs_def = new Map();
    if (this.global) this.built_in();
  }
  built_in() {
    this.add_vars("MATH", {
      pi: { type: "NUMBER", value: 3.141592653 },
      goldenRatio: { type: "NUMBER", value: 1.618 },
	  sqrt: {
			  body: [],
			  name: "_",
			  parameters: ["val"],
			  type: "FUNC_ANON",
			  key: "sqrt",
			},
      sum: {
        body: [
          {
            value: {
              type: "BIN_OPT",
              right: { type: "IDENT", value: "b", grp: "AST" },
              left: { type: "IDENT", value: "a", grp: "AST" },
              opt: "+",
              grp: "AST",
            },
            type: "RETURN",
          },
        ],
        name: "_",
        parameters: ["a", "b"],
        type: "FUNC_ANON",
      	key: "sum",
      },
    });
	this.add_vars("ARRAY", {
		len: {
				body: [],
				name: "_",
				parameters: ["val"],
				type: "FUNC_ANON",
				key: "len",
			  },
	  });
      this.add_vars("STRING", {
		revers: {
				body: [],
				name: "_",
				parameters: ["val"],
				type: "FUNC_ANON",
				key: "revers",
			  },
	  });
    this.add_def_func("say", ["a"]);
    this.add_def_func("sayf", ["code"]);
    this.add_def_func("time_start", []);
    this.add_def_func("time_log", []);
    this.add_def_func("run", ["code"]);
    this.add_def_func("str", ["str"]);
    this.add_def_func("num", ["num"]);
    // this.add_def_func("sayf",['code'],"utils")
    this.add_def_func("num", ["num"]);
  }
  add_vars(name, obj = {}) {
    let arr = this.vars.get(name) || new Map();
    for (const key in obj) {
		let val = obj[key]
		if(val.type.match("FUNC_ANON") && val.body.length == 0){
			this.add_def_func(key, val.parameters, name);
		}
      arr.set(key, val);
    }
    this.vars.set(name, { type: "OBJ", value: arr });
  }
  add_def_func(name, param, def, caller) {
	  def ||= "def"
	  // console.log(name, param, def, caller)
    let arr = this.func_def_resolve().get(def) || new Map();
    arr.set(name, {
      type: "fn",
      name: name,
      parameters: param,
      declarationEnv: this,
      body: [],
      caller,
    });

    this.func_def_resolve().set(def, arr);
  }
  dec_var(name, value) {
    if (this.vars.has(name)) {
    	console.error("variable '"+name+"' already exists bro")
    	process.exit(1)
    }
    this.vars.set(name, value);
    return value;
  }
  assign_var(name, value) {
    let env = this.resolve(name);
    env.vars.set(name, value);
    return env.get_var(name);
  }
  has_var(name) {
    return this.dec_resolve(name);
  }
  get_var(name) {
    let val = this.resolve(name).vars.get(name);
    return val;
  }
  add_func(ast) {
    this.funcs.set(ast.name, ast);
  }
  has_func(name) {
    return this.func_resolve(name).funcs.has(name);
  }
  run_func(name) {
    return this.func_resolve(name).funcs.get(name);
  }
  has_def_func(name, def) {
	  let func = this.func_def_resolve()
	  if(!def){
		  return func.get("def").has(name)
	  }
	  if(!func.has(def)){
		  return false
	  }
    return func.get(def).has(name);
  }
  run_def_obj_func(ast){
	  let that = this
	  let caller = ast.caller.var.value
	  let name = ast.value.value
	  let args = ast.args
	  switch (caller) {
		case "MATH":
			  switch (name) {
				  case "sqrt":
					return {type:"NUMBER",value:Math.sqrt(args[0].value)}
					break;
				}
		break;
	  case "ARRAY":
			switch (name) {
				case "len":
					let arr = new Eval(args[0].value,that).interpret(args[0],that)
					if (arr.type != "ARRAY")  return {type:"NUMBER",value: 0}
					return {type:"NUMBER",value: arr.value.length}
			  }
    case "STRING":
    switch (name) {
        case "revers":
            let arg = new Eval(args[0].value,that).interpret(args[0],that)
            return {type:"NUMBER",value: arg.value.split('').reverse().join('')}
        }
	  break;
	  }
  }
  run_def_func(ast, val) {
    let fun = { res: "" };
    switch (ast.value) {
      case "say":
        function print(data) {
          typeof data === "object" || Array.isArray(data) || data instanceof Map
            ? console.log(util.inspect(data, true, 12, true))
            : 
			console.log(data);
        }
        val.forEach((element) => print(element?.value || element));
        break;
      case "sayf":
        if (val[0].type != "STR")
          throw new Error("sayf expected string got " + JSON.stringify(val[0]));
        let main_var = val[0].value.split("{}");
        if (main_var.length > val.length) throw "sayf expected more args";
        val.shift();
        main_var.forEach((element, i) => {
          if (i >= main_var.length - 1) return 0;
          let variable = val.shift() || { type: "NULL", value: "null" };
          main_var[i] =
            element +
            (variable?.type == "OBJ"
              ? print(variable.value) || "^^^"
              : variable.value);
        });
        print(main_var.join("") + " " + val.map((el) => el.value).join(" "));
        break;
      case "str":
        return { value: String(val[0].value), type: "STR" };
      case "num":
        return { value: Number(val[0].value), type: "NUMBER" };
      case "time_start":
        console.time();
        break;
      case "time_log":
        console.timeLog();
        break;
      case "run":
        new Eval(
          new Parse(new Lexer(val[0].value).tokenize()).AST(),
          this,
        ).interpret();
        break;
    }
    return fun;
  }
  resolve(varname) {
    if (this.vars.has(varname)) return this;
    if (this.parent == undefined) {
      console.error(`Cannot resolve '${varname}' as it does not exist.`);
      return this;
    }
    return this.parent.resolve(varname);
  }
  dec_resolve(varname) {
    if (this.vars.has(varname)) return true;
    if (this.parent == undefined) return false;
    return this.parent.dec_resolve(varname);
  }
  func_resolve(varname) {
    if (this.funcs.has(varname)) return this;
    if (this.parent == undefined) {
      console.error(`Cannot resolve '`, varname, `' as it does not exist.`);
      return this;
    }
    return this.parent.func_resolve(varname);
  }
  func_def_resolve() {
		if (this.global) return this.funcs_def;
		return this.parent.func_def_resolve();
	  }
}