const express = require('express');
const path = require('path');
const EventEmitter = require('events');

const port = process.env.PORT || 3000;
const app = express();
const chatEmitter = new EventEmitter();

// Serve static files from the "public" directory
app.use(express.static(__dirname + '/public'));

let clients = [];

/**
 * Serves up the chat.html file
 * @param {express.Request} req
 * @param {express.Response} res
 */
function chatApp(req, res) {
  res.sendFile(path.join(__dirname, '/chat.html'));
}

/**
 * Responds with JSON
 */
function respondJson(req, res) {
  res.json({
    text: 'hi',
    numbers: [1, 2, 3],
  });
}

/**
 * Responds with the input string in various formats
 */
function respondEcho(req, res) {
  const { input = '' } = req.query;

  res.json({
    normal: input,
    shouty: input.toUpperCase(),
    charCount: input.length,
    backwards: input.split('').reverse().join(''),
  });
}

/**
 * Handles chat message submission
 */
function handleChat(req, res) {
  const { message = '' } = req.query;
  chatEmitter.emit('message', message);
  res.status(204).end();
}

/**
 * This endpoint will respond to the client with a stream of server sent events
 * @param {express.Request} req
 * @param {express.Response} res
 */
app.get('/sse', respondSSE);

function respondSSE(req, res) {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Connection': 'keep-alive',
  });

  const onMessage = message => res.write(`data: ${message}\n\n`);
  chatEmitter.on('message', onMessage);

  res.on('close', () => {
    chatEmitter.off('message', onMessage);
  });
}

/**
 * Responds with a 404 not found
 */
function respondNotFound(req, res) {
  res.status(404).send('Not Found');
}

// Register the chat app endpoint
app.get('/', chatApp);
app.get('/json', respondJson);
app.get('/echo', respondEcho);
app.get('/chat', handleChat);

// Catch-all route for 404
app.use(respondNotFound);

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
