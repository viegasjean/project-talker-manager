const Joi = require('joi');

const REGEXDATA = /^(0[1-9]|1\d|2\d|3[01])\/(0[1-9]|1[0-2])\/(19|20)\d{2}$/;

const userSchema = Joi.object({
  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.email': 'O "email" deve ter o formato "email@email.com"',
      'any.required': 'O campo "email" é obrigatório',
    }),
  password: Joi.string()
    .min(6)
    .required()
    .messages({
      'string.min': 'O "password" deve ter pelo menos 6 caracteres',
      'any.required': 'O campo "password" é obrigatório',
    }),
});

const tokenSchema = Joi.object({
  authorization: Joi.string()
    .length(16)
    .required()
    .messages({
      'string.length': 'Token inválido',
      'any.required': 'Token não encontrado',
    }),
});

const talkerSchema = Joi.object({
  name: Joi.string()
    .min(3)
    .required()
    .messages({
      'string.min': 'O "name" deve ter pelo menos 3 caracteres',
      'any.required': 'O campo "name" é obrigatório',
    }),
  age: Joi.number()
    .greater(18)
    .required()
    .messages({
      'number.greater': 'A pessoa palestrante deve ser maior de idade',
      'any.required': 'O campo "age" é obrigatório',
    }),
  talk: Joi.object()
    .keys({
      watchedAt: Joi
        .string().pattern(REGEXDATA)
        .required(),
      rate: Joi
        .number().min(1).max(5)
        .required(),
    })
    .required()
    .messages({
      'any.required': 'O campo "talk" é obrigatório e "watchedAt" e "rate" não podem ser vazios',
      'number.min': 'O campo "rate" deve ser um inteiro de 1 à 5',
      'number.max': 'O campo "rate" deve ser um inteiro de 1 à 5',
      'string.pattern.base': 'O campo "watchedAt" deve ter o formato "dd/mm/aaaa"',
    }),

});

module.exports = { userSchema, tokenSchema, talkerSchema };
