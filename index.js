const express = require('express');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

const fs = require('fs');
const crypto = require('crypto');

const HTTP_OK_STATUS = 200;
const PORT = '3000';

const { userSchema, tokenSchema, talkerSchema } = require('./schema');

// não remova esse endpoint, e para o avaliador funcionar
app.get('/', (_request, response) => {
  response.status(HTTP_OK_STATUS).send();
});

const readFile = () => JSON.parse(fs.readFileSync('talker.json', 'utf8'));

// 1 - Crie o endpoint GET /talker
app.get('/talker', (req, res) => {
  const talkers = readFile();
  return res.status(200).json(talkers);
});

// 3 - Crie o endpoint POST /login
// 4 - Adicione as validações para o endpoint /login
app.post('/login', (req, res) => {
  const { email, password } = req.body;
  const token = crypto.randomBytes(8).toString('hex');
  const { error } = userSchema.validate({ email, password });
  if (error) return res.status(400).json({ message: error.message });
  return res.status(200).json({ token });
});

const authenticate = (req, res, next) => {
  const { authorization } = req.headers;
  const { error } = tokenSchema.validate({ authorization });
  if (error) return res.status(401).json({ message: error.message });
  next();
};

const validateTalkerInfo = (req, res, next) => {
  const { name, age, talk } = req.body;
  const { error } = talkerSchema.validate({ name, age, talk });
  if (error) return res.status(400).json({ message: error.message });
  next();
};

app.post('/talker',
  authenticate, validateTalkerInfo, (req, res) => {
  const talkers = readFile();
  const talker = {
    id: talkers[talkers.length - 1].id + 1,
    ...req.body,
  };
  talkers.push(talker);
  fs.writeFileSync('talker.json', JSON.stringify(talkers), 'utf8');

  return res.status(201).json(talker);
});

app.put('/talker/:id',
  authenticate, validateTalkerInfo, (req, res) => {
  const { id } = req.params;
  const talkers = readFile();
  const talkerIndex = talkers.findIndex((talker) => talker.id === Number(id));
  talkers[talkerIndex] = {
    ...talkers[talkerIndex],
    ...req.body,
  };
  fs.writeFileSync('talker.json', JSON.stringify(talkers), 'utf8');

  return res.status(200).json(talkers[talkerIndex]);
});

app.delete('/talker/:id',
  authenticate, (req, res) => {
  const { id } = req.params;
  const talkers = readFile();
  const talkerIndex = talkers.findIndex((talker) => talker.id === Number(id));
  talkers.splice(talkerIndex, 1);
  fs.writeFileSync('talker.json', JSON.stringify(talkers), 'utf8');

  return res.status(204).json();
});

app.get('/talker/search', authenticate, (req, res) => {
  const { q } = req.query;
  const talkers = readFile();
  const filtered = talkers.filter((talker) => talker.name.includes(q));
  return res.status(200).json(filtered);
});

// 2 - Crie o endpoint GET /talker/:id
app.get('/talker/:id', (req, res) => {
  const { id } = req.params;
  const talkers = readFile();
  const talker = talkers.find((elem) => elem.id === Number(id));
  if (!talker) return res.status(404).json({ message: 'Pessoa palestrante não encontrada' });
  return res.status(200).json(talker);
});

app.listen(PORT, () => {
  console.log('Online');
});
