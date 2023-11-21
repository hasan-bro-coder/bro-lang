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
        this.funcs_def.set("time", {
            type: 'fn',
            name: 'time',
            parameters: [],
            declarationEnv: this,
            body: []
        })
        this.funcs_def.set("time_end", {
            type: 'fn',
            name: 'time_end',
            parameters: [],
            declarationEnv: this,
            body: []
        })

    }
    dec_var(name, value) {
        if (this.vars.has(name)) throw "variable already exists bro"
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
                console.log(val.map(element => element.value).join(""))
                break;
            case "time":
                console.time()
            case "time_end":
                console.timeEnd()
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
        if (this.parent == undefined) throw `Cannot resolve '${varname}' as it does not exist.`;
        return this.parent.resolve(varname);
    }
}