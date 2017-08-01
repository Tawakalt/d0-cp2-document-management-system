import express from 'express';
import path from 'path';
import logger from 'morgan';
import bodyParser from 'body-parser';

const app = express();
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// Require our routes into the application.
require('./routes')(app);

app.use(express.static(path.resolve(__dirname, './../public')));

app.get('/', (request, response) => {
  response.sendFile(path.resolve(__dirname, './../public', 'index.html'));
});
app.get('*', (req, res) => res.status(404).send({
  message: 'INVALID ROUTE!!!.',
}));
app.post('*', (req, res) => res.status(404).send({
  message: 'INVALID ROUTE!!!.',
}));
app.put('*', (req, res) => res.status(404).send({
  message: 'INVALID ROUTE!!!.',
}));
app.delete('*', (req, res) => res.status(404).send({
  message: 'INVALID ROUTE!!!.',
}));

export default app;
