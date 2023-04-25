const mongoose = require("mongoose");
const Joi = require("joi");

//modelagem do BD
const produto = new mongoose.Schema({
    nome: {
        type: String,
        required: true,
    },
    descricao: {
        type: String,
        required: true,
    },
    quantidade: {
        type: Number,
        required: true,
        min: 1,
    },
    preco: {
        type: String,
        required: true,
    },
    desconto: {
        type: String,
        max: 100,
    },
    dataDesconto: {
        type: Date,
        validate: [validateDataDesconto, "Data de desconto inválida"],
    },
    categoria: {
        type: String,
        required: true,
    },
    imagem: {
        type: String,
        required: true,
    },
});

// Função para validar a data de desconto
function validateDataDesconto(value) {
    // O valor de 'this' é o objeto Mongoose que está sendo validado
    return !this.desconto || (value && value >= new Date());
}
// Função para validar a URL da imagem
function validateImagem(value) {
    return /^(http|https):\/\/[^ "]+$/.test(value);
}
const Produto = mongoose.model("Produto", produto);

// Definição do esquema Joi para validação
const produtoJoi = Joi.object({
    nome: Joi.string().messages({
        "any.required": "O campo nome é obrigatório",
    }),
    descricao: Joi.string().required().messages({
        "any.required": "O campo descrição é obrigatório",
    }),
    quantidade: Joi.number().integer().min(1).required().messages({
        "any.required": "O campo quantidade é obrigatório",
        "number.integer": "O campo quantidade deve ser um número inteiro",
        "number.min": "O campo quantidade deve ter valor mínimo de 1",
    }),
    preco: Joi.string().required().messages({
        "any.required": "O campo preço é obrigatório",
        "string.base": "O campo preço deve ser uma string",
    }),
    desconto: Joi.string().min(0).max(100).messages({
        "any.required": "O campo preço é obrigatório",
        "string.base": "O campo preço deve ser uma string",
    }),
    dataDesconto: Joi.date()
        .iso()
        .when("desconto", {
            is: Joi.exist(),
            then: Joi.required(),
        })
        .messages({
            "date.iso":
                "O campo data de desconto deve ser uma data válida no formato ISO",
        }),
    categoria: Joi.string().required().messages({
        "any.required": "O campo categoria é obrigatório",
    }),
});

// Definição do esquema Joi para validação swagger
const produtoJoiAtualiza = Joi.object({
    nome: Joi.string(),
    descricao: Joi.string(),
    quantidade: Joi.number().integer().min(1).messages({
        "number.integer": "O campo quantidade deve ser um número inteiro",
        "number.min": "O campo quantidade deve ter valor mínimo de 1",
    }),
    preco: Joi.string().messages({
        "any.required": "O campo preço é obrigatório",
        "string.base": "O campo preço deve ser uma string",
    }),
    desconto: Joi.string().min(0).max(100).messages({
        "any.required": "O campo preço é obrigatório",
        "string.base": "O campo preço deve ser uma string",
    }),
    dataDesconto: Joi.date()
        .iso()
        .when("desconto", {
            is: Joi.exist(),
            then: Joi.required(),
        })
        .messages({
            "date.iso":
                "O campo data de desconto deve ser uma data válida no formato ISO",
        }),
    categoria: Joi.string(),
});

module.exports = { Produto, produtoJoi, produtoJoiAtualiza };