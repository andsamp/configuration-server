const PLAIN_TEXT = 'text/plain'
const TYPE_JSON = 'application/json'

function handlePlainTextResponse(response, code, data) {
  response.writeHead(code, {'Content-Type': PLAIN_TEXT});
  response.end(data);
}
exports.handlePlainTextResponse = handlePlainTextResponse;

function handleJsonResponse(response, code, data) {
  response.writeHead(code, {'Content-Type': TYPE_JSON});
  response.end(data);
}
exports.handleJsonResponse = handleJsonResponse;

function handle404(response) {
  handlePlainTextResponse(response, 404, 'Unable to locate requested resource')
}
exports.handle404 = handle404;

function handle400(response) {
  handlePlainTextResponse(response, 400, 'Bad Request.');
}
exports.handle400 = handle400;
