let validate = require('validate.js');

module.exports = (filters) => {
  filters['input'] = filters['input'] || {};
  filters.input.validate = (constraints) => {
    return (req, res, next) => {
      for (let idx in req.body) {
        if (!constraints[idx]) {
          delete req.body[idx];
        }
      }

      validate.async(req.body, constraints).then(
        (attributes) => {
          req.body = attributes;
          next();
        },
        (err) => {
          console.log('/preroutes/input.js -> error: ', err);
          let errorKeys = Object.keys(err);
          let validatesErr = '';

          for(let i=0; i<errorKeys.length; i++) {
            validatesErr += err[errorKeys[i]] + '\n';
          }

          return res.status(403).json({
            success: false,
            msg: validatesErr
          });
        }
      );
    }
  }
}
