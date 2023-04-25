const { Router } = require("express");
const { Produto, produtoJoi, produtoJoiAtualiza } = require("../model/produto");
const Joi = require('joi');
const router = Router();
const multer = require('multer');

//função carrega img
const upload = multer({
    storage: multer.diskStorage({}),
    fileFilter: (req, file, cb) => {
        if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
            return cb(new Error('Apenas arquivos JPEG e PNG são permitidos'));
        }
        cb(null, true);
    },
    limits: {
        fileSize: 5 * 1024 * 1024, // 5 MB
    },
});

//Insere produtos POST
router.post("/produtos", upload.single('imagem'), async (req, res) => {
    try {
        // Validar os dados do req.body usando o Joi
        const { error } = produtoJoi.validate(req.body);

        if (error) {
            // Se houver um erro na validação, responder com um código 400 e uma mensagem de erro
            return res.status(400).json({
                mensagem: 'Erro na validação dos dados',
                erro: error.details[0].message
            });
        }

        const file = req.file;
        console.log(file);
        //produto.imagem = req.file.path; Salvar a localização da imagem no produto

        // Caso contrário, criar o produto no banco de dados ou fazer outras operações necessárias
        const { nome, descricao, quantidade, preco, desconto, dataDesconto, categoria } = req.body;
        const produto = new Produto({ nome, descricao, quantidade, preco, desconto, dataDesconto, categoria, imagem: file.filename });
        await produto.save();

        res.status(201).json({ mensagem: 'Produto criado com sucesso', produto });
    } catch (error) {
        console.log("Ocorreu um erro ", error);
        res.status(500).json({ mensagem: "Ocorreu um erro", error });
    }
});

//consulta todos produtos GET
router.get("/produtos", async (req, res) => {
    try {
        // Recebe os parâmetros de consulta da requisição
        const { nome, categoria, precoMin, precoMax } = req.query;

        // Cria um objeto vazio para armazenar os filtros que serão aplicados na busca
        const filtro = {};
        // Se o parâmetro "nome" foi fornecido na consulta, adiciona o filtro "nome" com uma expressão regular que busca o valor do parâmetro em qualquer posição do nome do produto (com opção "i" para ignorar maiúsculas e minúsculas)
        if (nome) {
            filtro.nome = { $regex: nome, $options: "i" };
        }// Se o parâmetro "categoria" foi fornecido na consulta, adiciona o filtro "categoria" com o valor do parâmetro
        if (categoria) {
            filtro.categoria = categoria;
        }// Se ambos os parâmetros "precoMin" e "precoMax" foram fornecidos na consulta, adiciona o filtro "preco" com um operador "$gte" (maior ou igual a) e um operador "$lte" (menor ou igual a), buscando produtos com preços dentro da faixa especificada. Se apenas "precoMin" for fornecido, adiciona apenas o operador "$gte". Se apenas "precoMax" for fornecido, adiciona apenas o operador "$lte".
        if (precoMin && precoMax) {
            filtro.preco = { $gte: precoMin, $lte: precoMax };
        } else if (precoMin) {
            filtro.preco = { $gte: precoMin };
        } else if (precoMax) {
            filtro.preco = { $lte: precoMax };
        }

        // Realiza a busca no banco de dados com os filtros especificados, utilizando o método "find" do Mongoose
        const produtos = await Produto.find(filtro);

        // Se a busca retornar pelo menos um produto, envia uma resposta JSON com os resultados. Caso contrário, envia uma resposta de erro 404.
        if (produtos.length > 0) {
            res.json(produtos);
        } else {
            res.status(404).json({ mensagem: "Nenhum produto encontrado!" });
        }
    } catch (error) {
        // Se ocorrer um erro durante a busca, envia uma resposta de erro 500 com uma mensagem de erro e detalhes sobre o erro.
        console.log("Ocorreu um erro ", error);
        res.status(500).json({ mensagem: "Ocorreu um erro", error });
    }
});


//consulta por id
router.get("/produtos/:id", async (req, res) => {
    try {
        const { id } = req.params;
        //realiza uma busca específica via findById filtrando o id
        const produto = await Produto.findById(id);
        if (produto) {
            res.json({ message: "Produto encontrada: ", produto });
        } else {
            res.status(404).json({ message: "Produto não encontrada!" })
        }
    } catch (error) {
        console.log("Ocorreu um erro ", error);
    }
});

//editar produto PUT
router.put("/produtos/:id", upload.single("imagem"), async (req, res) => {
    try {
        const { id } = req.params;
        const {
            nome,
            descricao,
            quantidade,
            preco,
            desconto,
            dataDesconto,
            categoria,
        } = req.body;
        let produto;

        // Verificar se há uma imagem enviada
        if (req.file) {
            produto = await Produto.findByIdAndUpdate(id, {
                nome,
                descricao,
                quantidade,
                preco,
                desconto,
                dataDesconto,
                categoria,
                imagem: req.file.filename,
            });
        } else {
            produto = await Produto.findByIdAndUpdate(id, {
                nome,
                descricao,
                quantidade,
                preco,
                desconto,
                dataDesconto,
                categoria,
            });
        }

        // Validar os dados do req.body usando o Joi
        const { error } = produtoJoiAtualiza.validate(req.body);

        if (error) {
            // Se houver um erro na validação, responder com um código 400 e uma mensagem de erro
            return res.status(400).json({
                mensagem: "Erro na validação dos dados",
                erro: error.details[0].message,
            });
        } else if (produto) {
            res.json({ message: "Produto editado!" });
        }
    } catch (error) {
        console.log("Ocorreu um erro ", error);
        res.status(500).json({ mensagem: "Ocorreu um erro", error });
    }
});

//excluir produto DELETE
router.delete("/produtos/:id", async (req, res) => {
    try {
        // Checa se a tarefa existe, e então remove do banco
        const { id } = req.params;
        const produto = await Produto.findByIdAndRemove(id);

        if (produto) {
            res.json({ message: "Produto excluída." });
        } else {
            res.status(404).json({ message: "Produto não encontrado." });
        }
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Um erro aconteceu." });
    }
});

module.exports = router;