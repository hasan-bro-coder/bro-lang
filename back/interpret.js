import { ENV } from "./var.js";
import { Worker } from "node:worker_threads";
// import { Lexer } from "../front/lexer.js";
export class Eval {
  eval_numeric_binary_expr(lhs, rhs, opt) {
    if (
      (lhs.type == "NUMBER" || lhs.type == "BOOL" || lhs.type == "NULL") &&
      (rhs.type == "NUMBER" || lhs.type == "BOOL" || rhs.type == "NULL")
    ) {
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
          return {
            type: "BOOL",
            value: lhs.value == rhs.value ? true : false,
            power: 1,
          };
        case "===":
          return {
            type: "BOOL",
            value:
              lhs.value === rhs.value && lhs.type == rhs.type ? true : false,
            power: 1,
          };
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
          console.error(`Unknown operator provided in operation: `, lhs, rhs);
          this.exit = true;
          return 0;
      }
    } else if (lhs.type == "STR" && rhs.type == "STR") {
      let lval = lhs.value;
      let rval = rhs.value;
      switch (opt) {
        case "+":
          return { type: "STR", value: lval + rval, power: 1 };
        case "==":
          return { type: "BOOL", value: lval == rval ? true : false, power: 1 };
        case "===":
          return {
            type: "BOOL",
            value:
              lhs.value === rhs.value && lhs.type == rhs.type ? true : false,
            power: 1,
          };
        case "!=":
          return { type: "BOOL", value: lval != rval ? true : false, power: 1 };
        case "~=":
          return {
            type: "BOOL",
            value: lval.match(rval) ? true : false,
            power: 1,
          };
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
          console.error(
            `Unknown operator provided in operation: `,
            lhs,
            "&&",
            rhs,
          );
          this.exit = true;
          return 0;
      }
    } else if (
      (lhs.type == "STR" || lhs.type == "NUMBER" || lhs.type == "NULL") &&
      (rhs.type == "STR" || rhs.type == "NUMBER" || rhs.type == "NULL")
    ) {
      let lval = String(lhs.type == "NULL" ? "" : lhs.value);
      let rval = String(rhs.type == "NULL" ? "" : rhs.value);
      switch (opt) {
        case "+":
          return { type: "STR", value: lval + rval, power: 1 };
        case "==":
          return { type: "BOOL", value: lval == rval, power: 1 };
        case "===":
          return {
            type: "BOOL",
            value:
              lhs.value === rhs.value && lhs.type == rhs.type ? true : false,
            power: 1,
          };
        case "!=":
          return { type: "BOOL", value: lval != rval, power: 1 };
        case "|":
          return { type: "BOOL", value: lval || rval ? true : false, power: 1 };
        case "&":
          return { type: "BOOL", value: lval && rval ? true : false, power: 1 };
        default:
          console.error(
            `Unknown operator provided in operation: `,
            lhs,
            opt,
            rhs,
          );
          this.exit = true;
          return 0;
      }
    } else {
      console.error(`cant do operation with: `, lhs, "&&", rhs);
      this.exit = true;
      return { type: "NULL", value: "null_Error", power: 0 };
    }
    // if () {
    //
    // }
  }
  eval_function_run(ast, env) {
    const args = ast.args.map((arg) => this.interpret(arg, env));
    let func;
    if (ast.caller.type == "MEMB") {
      func = this.interpret(ast.caller);
      if (!func) {
        this.exit = true;
        return 0;
      }
      const scope = new ENV(func.declarationEnv);
      for (let i = 0; i < func.parameters.length; i++) {
        const varname = func.parameters[i];
        scope.dec_var(varname, args[i] || { value: "null", type: "NULL" });
      }
      this.return = false;
      if (env.has_def_func(ast.value.value, ast.caller?.var.value)) {
        return env.run_def_obj_func(ast);
      }
      return this.eval_body(func.body, scope, false);
    }
    if (env.has_def_func(ast.value)) {
      func = env.run_def_func(ast, args);
      return func;
    } else if (env.has_func(ast.value)) {
      func = env.run_func(ast.value);
      const scope = new ENV(func.declarationEnv);

      for (let i = 0; i < func.parameters.length; i++) {
        // TODO check the bounds here
        // verify arity of function
        const varname = func.parameters[i];
        scope.dec_var(varname, args[i] || { value: "null", type: "NULL" });
      }
      if (!func?.async) {
        this.return = false;
        return this.eval_body(func.body, scope, true);
      } else {
        let worker = new Worker("./back/worker.js", {
          workerData: { ast: func.body, env: scope },
        });
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
    let val = env.add_func(fn);
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
      return binop.value;
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
          return "errors";
        }

        // if (!program.value[0]) {
        //     return "errors"
        // }
        if (program.value[0].type == "IMPORT") {
          lastEvaluated = await this.interpret(program.value[0], env);
          program.value.shift();
        } else {
          lastEvaluated = this.interpret(program.value[0], env);
          program.value.shift();
        }

        lastEvaluated?.power == 1 ? (res += lastEvaluated.value + "\n") : 0;
      }
    })();
    return res;
  }
  eval_assignment(node, env) {
    // if (node.assigne.type !== "IDENT") {
    // 	console.error(`Invalid LHS inside assignment expr `, node.assigne);
    // 	this.exit = true; return 0;
    // }
    let varname;
    if (node.assigne.type == "IDENT") {
      varname = node.assigne.value;
      if (env.has_var(varname)) {
        if (node.opt != "=") {
          return env.assign_var(
            varname,
            this.eval_numeric_binary_expr(
              env.get_var(varname),
              this.interpret(node.value, env),
              node.opt,
            ),
          );
        }
        return env.assign_var(varname, this.interpret(node.value, env));
      } else {
        if (node.opt != "=") {
          this.exit = true;
          console.error("bro", varname, "aint defined \n define it first");
        }
        return env.dec_var(varname, this.interpret(node.value, env));
        // this.interpret({ type: 'VAR_DEC', value: this.interpret(node.value, env), identifier: varname, grp: 'AST' }, env)
      }
    } else if (node.assigne.type == "MEMB") {
      varname = this.eval_obj_var(node.assigne, env);
		// console.log(varname)
		if(varname.type == "ARRAY") {
			varname.map[Number(varname.ast)] = this.interpret(node.value, env)
		}else {     varname.map?.set(varname.ast, this.interpret(node.value, env))
			  }
    } else {
      console.error(`Invalid LHS inside assignment expr `, node.assigne);
      this.exit = true;
      return 0;
    }
  }
  eval_var_program(declaration, env) {
    const value = this.interpret(declaration.value, env) || {
      type: "NULL",
      value: null,
    };
    if (value.type == "fn_") {
      value.name = declaration.identifier;
      let val = env.add_func(value);
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
    let opt = { type: "BOOL", value: false };
    if (ast.test.type == "BOOL") {
      opt.value = ast.test.value;
    } else {
      opt = this.eval_binary_expr(ast.test, env);
    }
    if (opt.value) {
      return this.eval_body(ast.body, env);
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
    let val = env.add_func(fn);
    return val;
  }
  async eval_import_function(ast, envs) {
    let { readFileSync } = await import("fs");
    (async () => {
      let data = await readFileSync(ast.value.value, "utf8");
      return this.interpret(
        {
          type: "FUN_CALL",
          args: [{ value: data, type: "STR", grp: "AST" }],
          caller: { type: 'IDENT', value: 'run', grp: 'AST' },
          value: "run",
        },
        envs,
      );
    })();
  }
  eval_return_program(ast, env) {
    this.return = true;
    return this.interpret(ast.value, env);
  }
  eval_loop_program(ast, env) {
    // let opt = this.eval_binary_expr(ast.condition)
    let opt = { type: "BOOL", value: false };
    if (ast.condition.type == "BOOL") {
      opt.value = ast.condition.value;
    } else {
      opt = this.eval_binary_expr(ast.condition, env);
    }
    while (opt.value) {
      this.eval_body(ast.body, env);
      opt = this.eval_binary_expr(ast.condition, env);
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
  eval_obj_member(ast, env) {
    if (ast.object.type == "IDENT") {
      let map_var = env.get_var(ast.object.value);
      if (!map_var.value) {
        this.exit = 0;
        return 0;
      }
      if (map_var.type == "ARRAY" && !(ast.value.type == "NUMBER")) {
        console.error("arrays only support numbers bro not", ast.value.type);
        this.exit = 0;
        return 0;
      }
      if (ast.value.type == "NUMBER" || map_var.type == "ARRAY") {
        let arr = [...map_var.value.values()];
        if (arr.length < ast.value.value) {
          this.exit = 0;
          return 0;
        }
        return arr[ast.value.value] == undefined
          ? { type: "NULL", value: "null" }
          : arr[ast.value.value];
      }
      if (map_var.value.has(ast.value.value)) {
        return map_var.value.get(ast.value.value);
      } else {
        this.exit = 0;
        return 0;
      }
    }
    let main_map = this.eval_obj_member(ast.object, env);

    if (ast.value.type == "NUMBER") {
      let arr = [...main_map?.value?.values()];
      if (arr.length < ast.value.value) {
        this.exit = 0;
        return 0;
      }
      return arr[ast.value.value];
    } else {
      if (main_map.value.has(ast.value.value)) {
        return main_map.value.get(ast.value.value);
      } else {
        console.error("cant read proparty of undefined bro ?!");
      }
    }
  }
  eval_obj_var(ast, env) {
    if (ast.object.type == "IDENT") {
      let map_var = env.get_var(ast.object.value);
      let val;
	  if (ast.value.type == "NUMBER" && map_var.type == "ARRAY") {
			let arr = map_var.value;
			// if (arr.length < ast.value.value) {
			//   this.exit = 0;
			//   return 0;
			// }
		  // if(Array.isArray(arr[ast.value.value].value)){
			 //  return { map: arr[ast.value.value].value, ast: ast.value?.value, type: "ARRAY" }
		  // }
			return { map: arr, ast: ast.value?.value, type: "ARRAY" }
				// [ast.value.value] == undefined
			 //  ? { type: "NULL", value: "null" }
			 //  : arr[ast.value.value];
		  }
      if (ast.value.type == "NUMBER") {
        let arr = [...map_var.value.values()];
        val = arr[ast.value.value];
        if (val?.value instanceof Map) {
          return { map: val?.value, ast: ast.value?.value };
        }
        return { map: map_var.value, ast: ast.value?.value };
      }
	
      val = map_var.value.get(ast.value.value);
      if (val?.value instanceof Map) {
        return { map: val?.value, ast: ast.value?.value ,type: "OBJ"};
      }
      return { map: map_var.value, ast: ast.value?.value ,type: "OBJ"};
    }
    let main_map = this.eval_obj_var(ast.object, env);
	  let arr = main_map.map
	  if(Array.isArray(arr[ast.value.value].value)){
			return { map: arr[ast.value.value].value, ast: ast.value?.value, type: "ARRAY" }
		}
	 //  if (ast.value.type == "NUMBER" || main_map.type == "ARRAY") {
		//   let arr = main_map.value;
		//   if (arr.length < ast.value.value) {
		// 	this.exit = 0;
		// 	return 0;
		//   }
		//   return arr[ast.value.value]
		// 	  // [ast.value.value] == undefined
		//    //  ? { type: "NULL", value: "null" }
		//    //  : arr[ast.value.value];
		// }
    return { map: main_map.map, ast: ast.value?.value ,type: main_map.type};
  }
  eval_arr(ast, env) {
    let arr = { type: "ARRAY", value: [] };
    for (const value of ast.props) {
      const runtimeVal = this.interpret(value, env);
      arr.value.push(runtimeVal);
    }

    return arr;
  }
  eval_obj(ast, env) {
    let obj = { type: "OBJ", value: new Map() };
    for (const { key, value } of ast.properties) {
      const runtimeVal =
        value == undefined ? env.has_var(key) : this.interpret(value, env);

      obj.value.set(key, runtimeVal);
    }

    return obj;
  }
  constructor(ast, Env) {
    this.Env = Env;
    this.ast = ast;
    this.exit = false;
    this.return = false;
    this.res = "";
  }
  interpret(ast, env) {
    if (!ast) {
      ast = this.ast;
    }
    if (this.exit) {
      this.exit = true;
      return 0;
    }
    switch (ast.type) {
      case "NUMBER":
        return { type: "NUMBER", value: ast.value };
      case "STR":
        return { type: "STR", value: ast.value };
      case "BOOL":
        return { type: "BOOL", value: ast.value };
      case "BIN_OPT":
        return this.eval_binary_expr(ast, env || this.Env);
      case "DBLOPR":
        return { type: "STR", value: ast.value };
      case "OBJ":
        return this.eval_obj(ast, env || this.Env);
      case "ARRAY":
        return this.eval_arr(ast, env || this.Env);
      case "VAR_DEC":
        return this.eval_var_program(ast, env || this.Env);
      case "PROGRAM":
        return this.eval_program(ast, env || this.Env);
      case "IF":
        return this.eval_if_program(ast, env || this.Env);
      case "LOOP":
        return this.eval_loop_program(ast, env || this.Env);
      case "RETURN":
        return this.eval_return_program(ast, env || this.Env);
      case "FUNC_ANON":
        return this.eval_function__declaration(ast, env || this.Env);
      case "FUNC":
        return this.eval_function_declaration(ast, env || this.Env);
      case "FUNCS":
        return this.eval_functions_declaration(ast, env || this.Env);
      case "FUN_CALL":
        return this.eval_function_run(ast, env || this.Env);
      case "MEMB":
        return this.eval_obj_member(ast, env || this.Env);
      case "NULL":
        return { type: "NULL", value: "null" };
      case "SEMI":
        return {};
      case "IMPORT":
        return this.eval_import_function(ast, env || this.Env);
      case "IDENT":
        return this.eval_identifier(ast, env || this.Env);
      case "ASS":
        return this.eval_assignment(ast, env || this.Env);
      default:
        console.error(
          "This AST node has not yet been setup for interpretation",
          ast,
        );
    }
  }
}