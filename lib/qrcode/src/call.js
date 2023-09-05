"use strict";
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
function call(funcs, ...args) {
  if (Array.isArray(funcs)) {
    funcs.forEach((func) => call(func, ...args));
  } else {
    return funcs(...args);
  }
}
exports.call = call;
