export default (fn: Function) => (arg1: any) => (arg2: any) => fn(arg2, arg1);
