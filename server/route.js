import express from 'express';
import logger from 'morgan';
import bodyParser from 'body-parser';

const app = express();
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// Require our routes into the application.
require('./routes')(app);

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
