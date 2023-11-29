// import promt from  'prompt-sync'
import { Lexer } from "../front/lexer.js"
import { Parse } from "../front/parser.js"
import { Eval } from "./interpret.js"
export class ENV {
    constructor(parent) {
        this.parent = parent;
        this.vars = new Map();
        this.funcs = new Map();
        this.funcs_def = new Map();
        this.funcs_def.set("say", {
            type: 'fn',
            name: 'say',
            parameters: ['a'],
            declarationEnv: this,
            body: [{ type: 'IDENT', value: 'a', grp: 'AST' }]
        })
        this.funcs_def.set("time_start", {
            type: 'fn',
            name: 'time_start',
            parameters: [],
            declarationEnv: this,
            body: []
        })
        this.funcs_def.set("time_log", {
            type: 'fn',
            name: 'time_log',
            parameters: [],
            declarationEnv: this,
            body: []
        })
        this.funcs_def.set("run", {
            type: 'fn',
            name: 'run',
            parameters: ["code"],
            declarationEnv: this,
            body: []
        })

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
        let env = this.resolve(name)
        if (!env.vars.has(name)) env.dec_var(name, value);
        // throw "variable is undifined bro"
        env.vars.set(name, value);
        return env.vars.get(name);
    }
    has_var(name) {
        let val = this.vars.get(name)
        return val ? true : false;
    }

    get_var(name) {
        let val = this.resolve(name).vars.get(name)
        // this.vars.get(name)
        if (val) {
            return val;
        }
        throw "variable " + val + " aint exists bro";
    }
    add_func(ast) {
        this.funcs.set(ast.name, ast)
    }
    has_func(name) {
        let val = this.funcs.get(name)
        return val ? true : false;
    }
    run_func(name) {
        return this.funcs.get(name)
    }
    has_def_func(name) {
        let val = this.funcs_def.get(name)
        return val ? true : false;
    }
    run_def_func(ast, val) {
        let fun = { res: "" }
        switch (ast.value) {
            case "say":
                // console.log(ast);
                console.log(val.map(element => element?.value).join(""))
                break;
            case "time_start":
                console.time()
                break;
            case "time_log":
                console.timeLog()
                break;
            case "run":
                // console.log(val);
                new Eval(new Parse(new Lexer(val[0].value).tokenize()).AST(),this).interpret()
                /* TODO NODE */
                // const readlines = promt({sigint: true})(val[0].value)
                // readlines.
                //   console.log(readlines);
                //   readlines.question(, name => {
                //     console.log(`Hey there ${name}!`);
                //     readlines.close();
                //   });
                break;

            //     console.timeEnd()
        }
        // if ( == ) {
        // }
        // else if (ast.value == "time") {
            // console.log(val.map(element => element.value).join(""))
        // }
        return fun
        // return this.funcs_def.get(name)
    }
    resolve(varname) {
        if (this.vars.has(varname)) return this;
        if (this.parent == undefined) {console.error(`Cannot resolve '${varname}' as it does not exist.`);return {type:"NULL",value:"null"}};
        return this.parent.resolve(varname);
    }
}