/**
 * Wraps async route handlers so errors are forwarded to Express error middleware.
 * @param {function} fn
 */
module.exports = function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
