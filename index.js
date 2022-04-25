const express = require('express');
const bodyParser = require('body-parser');

const fs = require('fs');

const app = express();
app.use(bodyParser.json());

const HTTP_OK_STATUS = 200;
const PORT = '3000';

// não remova esse endpoint, e para o avaliador funcionar
app.get('/', (_request, response) => {
  response.status(HTTP_OK_STATUS).send();
});

const talkers = JSON.parse(fs.readFileSync('talker.json', 'utf8'));

// 1 - Crie o endpoint GET /talker
app.get('/talker', (req, res) => res.status(200).json(talkers));

// Crie o endpoint GET /talker/:id
app.get('/talker/:id', (req, res) => {
  const { id } = req.params;
  const talker = talkers.find((elem) => elem.id === Number(id));
  if (talker) return res.status(200).json(talker);
  return res.status(404).json({ message: 'Pessoa palestrante não encontrada' });
});

app.listen(PORT, () => {
  console.log('Online');
});
