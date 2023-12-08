import { Lexer } from "../front/lexer.js"
import { Parse } from "../front/parser.js"
import { Eval } from "./interpret.js"
import util from 'util'

export class ENV {
	constructor(parent) {
		this.parent = parent;
		this.vars = new Map();
		this.funcs = new Map();
		this.funcs_def = new Map();
		this.funcs_def.set("say",['a'])
		this.funcs_def.set("sayf",['code'])
		this.funcs_def.set("time_start",[])
		this.funcs_def.set("time_log",[])
		this.funcs_def.set("run",["code"])
		this.funcs_def.set("str",["str"])
		this.funcs_def.set("num",["num"])
	}
	add_def_func(name,param){
		this.funcs_def.set(name,{
			type: 'fn',
			name: name,
			parameters: param,
			declarationEnv: this,
			body: []
		})
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
	has_def_func(name) {
		let val = this.funcs_def.get(name)
		return val ? true : false;
	}
	run_def_func(ast, val) {
		let fun = { res: "" }
		switch (ast.value) {
			case "say":
				function print(data) {
				  typeof data === 'object' || Array.isArray(data) ? console.log(util.inspect(data, true, 12, true)) : console.log(data)
				}
				val.forEach(element => print(String(element?.value)))
				break;
			case "sayf":
				let main_var = val[0].value.split("{}")
				if(val[0].type != "STR") throw "sayf expected string got " 					+ val[0]
				if(main_var.length > val.length) throw "sayf expected more args"
				val.shift()
				main_var.forEach((element,i) => {
					if(i >= main_var.length - 1) return 0
					let variable = val.shift()
					 main_var[i] = element + (variable.type == "OBJ" ? print(variable.value) || "^^^" : variable.value)
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
		if (this.parent == undefined) {console.error(`Cannot resolve '${varname}' as it does not exist.`);return this};
		return this.parent.func_resolve(varname);
	}
}