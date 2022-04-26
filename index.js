const express = require('express');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

const fs = require('fs');
const crypto = require('crypto');

const HTTP_OK_STATUS = 200;
const PORT = '3000';

const REGEXEMAIL = /\S+@\S+\.\S+/;

// não remova esse endpoint, e para o avaliador funcionar
app.get('/', (_request, response) => {
  response.status(HTTP_OK_STATUS).send();
});

const talkers = JSON.parse(fs.readFileSync('talker.json', 'utf8'));

// 1 - Crie o endpoint GET /talker
app.get('/talker', (req, res) => res.status(200).json(talkers));

// 2 - Crie o endpoint GET /talker/:id
app.get('/talker/:id', (req, res) => {
  const { id } = req.params;
  const talker = talkers.find((elem) => elem.id === Number(id));
  if (talker) return res.status(200).json(talker);
  return res.status(404).json({ message: 'Pessoa palestrante não encontrada' });
});

// 3 - Crie o endpoint POST /login
// 4 - Adicione as validações para o endpoint /login
app.post('/login', (req, res) => {
  const { email, password } = req.body;
  const token = crypto.randomBytes(8).toString('hex');

  if (!email) return res.status(400).json({ message: 'O campo "email" é obrigatório' });
  if (!password) return res.status(400).json({ message: 'O campo "password" é obrigatório' });
  if (!REGEXEMAIL.test(email)) {
    return res.status(400).json({ message: 'O "email" deve ter o formato "email@email.com"' });
  }
  if (password.length < 6) {
    return res.status(400).json({ message: 'O "password" deve ter pelo menos 6 caracteres' });
  }
  return res.status(200).json({ token });
});

const authenticate = (req, res, next) => {
  const { authorization } = req.headers;
  if (!authorization) return res.status(401).json({ message: 'Token não encontrado' });
  if (authorization.length < 16) return res.status(401).json({ message: 'Token inválido' });
  next();
};

const validatePerson = (req, res, next) => {
  const { name, age } = req.body;
  if (!name) return res.status(400).json({ message: 'O campo "name" é obrigatório' });
  if (name.length < 3) {
    return res.status(400).json({ message: 'O "name" deve ter pelo menos 3 caracteres' });
  }

  if (!age) return res.status(400).json({ message: 'O campo "age" é obrigatório' });
  if (Number(age) < 18) {
    return res.status(400).json({ message: 'A pessoa palestrante deve ser maior de idade' });
  }

  next();
};

const validateTalk = (req, res, next) => {
  const { talk } = req.body;
  if (!talk || talk.watchedAt || talk.rate) {
    return res
      .status(400)
      .json({
        message: 'O campo "talk" é obrigatório e "watchedAt" e "rate" não podem ser vazios',
      });
  }
  next();
};

const validateRateAndWatchedAt = (req, res, next) => {
  const { talk } = req.body;
  if (talk.rate < 0 || talk.rate > 5) {
    return res
    .status(400)
    .json({
      message: 'O campo "rate" deve ser um inteiro de 1 à 5',
    });
  }

  next();
};

app.post('/talker', authenticate, validatePerson, validateTalk, validateRateAndWatchedAt, (req, res) => {
  fs.writeFileSync('talker.json', JSON.stringify(talkers), 'utf8');
  return res.status(200).json(req.body);
});

app.listen(PORT, () => {
  console.log('Online');
});
