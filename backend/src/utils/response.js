/** Wrap a value in the standard { data, message, success } envelope. */
function ok(res, data, message = 'OK', statusCode = 200) {
  return res.status(statusCode).json({ success: true, message, data });
}

/** Send a structured error response. */
function fail(res, code, message, statusCode = 400) {
  return res.status(statusCode).json({ success: false, code, message });
}

module.exports = { ok, fail };
