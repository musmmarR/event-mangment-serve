// Change from ES Module syntax to CommonJS syntax
class HttpError extends Error {
    constructor(code = 400, message) {
        super(message);
        this.code = code;
        this.name = this.constructor.name;
        Error.captureStackTrace(this, this.constructor);
    }
}

//  class HttpError extends Error {
//     constructor(code, message, statusCode) {
//       super(message)
//       this.code = code
//       this.statusCode = statusCode
//     }
//   }
// Use module.exports instead of export default
module.exports = HttpError;