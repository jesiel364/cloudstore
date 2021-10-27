const express = require('express')
const app = express()
const hbs = require('express-handlebars')
const path = require('path')
const mongoose = require('mongoose')
require('./models/Produto')
require('./models/Usuario')
const Produto = mongoose.model('produtos')
const Usuario = mongoose.model('usuarios')
const session = require('express-session')
const flash = require('connect-flash')

//	Sessão
	app.use(session({
		secret: 'ecloudstore',
		resave: true,
		saveUnitialized: true
	}))
	app.use(flash())

//	Middleware
app.use((req, res, next) => {
	res.locals.success_msg = req.flash('success_msg')
	res.locals.error_msg = req.flash('error_msg')
	next()
})

//	Template Engine
	app.engine('hbs', hbs({
		defaultLayout: 'main',
		extname: 'hbs',
		layoutsDir: __dirname + '/views/layouts/',
  		partialsDir: __dirname + '/views/partials/'
	}))
	app.set('view engine', 'hbs')

// Body Parser
	app.use(express.json({limit: '20mb'}));
	app.use(express.urlencoded({ extended: false, limit: '20mb' }))

// Public
		app.use(express.static(path.join(__dirname, 'public')))

//	Mongoose
	mongoose.connect('mongodb://localhost/loja').then(() => {
		console.log('MONGODB Conectado.')
	}).catch((err) => {
		console.log('Erro ao tentar se conectar ao MONGODB: '+err)
	})


//	Rota proncipal
app.get('/', (req, res)=> {
	Produto.find().lean().sort({_id: -1}).then((produtos) => {
		res.render('page1', {produtos: produtos})
	}).catch((err) => {
		res.send('Houve um erro: '+err)
	})
})

//	Rota de cadastro
app.get('/cadastrar', (req, res) => {
	res.render('form')
})

app.post('/cadastrar/novoproduto', (req, res) => {
	const novoProduto = {
		nome: req.body.nome_produto,
		desc: req.body.desc_produto,
		preco: req.body.preco_produto,
		img: req.body.img_produto
	}

	console.log(novoProduto)

	new Produto(novoProduto).save().then(() => {
		req.flash('success_msg', 'Produto cadastrado com sucesso!')
		res.redirect('/')
		console.log('Produto salvo com sucesso!')
	}).catch((err) => {
		req.flash('error_msg', 'Erro ao salvar o produto: '+err)
		res.redirect('/')
		console.log('Erro ao salvar o produto: '+err)
	})
})

//	Carrinho
app.get('/carrinho', (req, res) => {
	Produto.find().lean().sort({_id: -1}).then((produtos) => {
		res.render('carrinho', {produtos: produtos})
	}).catch((err) => {
		res.send('Houve um erro: '+err)
	})
})

app.post('/carrinho/excluir', (req, res) => {
	Produto.deleteOne({_id: req.body.id}).then(() => {
		req.flash('success_msg', 'Produto deletado com sucesso!'),
		res.redirect('/carrinho')
	}).catch((err) => {
		req.flash('error_msg', 'Erro ao excluir o produto! '+err),
		console.log('error_msg', 'Erro ao excluir o produto! '+err),
		res.redirect('/carrinho')
	})
})

//	Criar Conta
app.get('/usuarios/novousuario', (req, res) => {
	res.render('criar_conta')
})

app.post('/usuarios/novousuario/confirmar', (req, res) => {
	const novoUsuario = {
		nome: req.body.username,
		email: req.body.email,
		senha: req.body.password
	}
	console.log(novoUsuario)
	
	new Usuario(novoUsuario).save().then(() => {
		req.flash('success_msg', 'Novo usuário cadastrado com sucesso!')
		res.redirect('/')
	}).catch((err) => {
		req.flash('error_msg', 'Houve um erro ao cadastrar o usuário: '+err)
		res.redirect('/')
	})
})

// Login
app.get('/usuarios', (req, res) => {
	res.render('login')
})

// Painel Admin
app.get('/admin', (req, res) => {
	Usuario.find().lean().sort({_id: -1}).then((usuarios) => {
		res.render('painel_admin', {usuarios: usuarios})
	}).catch((err) => {
		res.send('Houve um erro: '+err)
	})
})

//	Pesquisa
app.get('/results', (req, res) => {
	const a = ({
		res : req.body.pesq
		
	}).then(() => {
		res.render('resultados')
	}).catch((err) => {
		console.log('Algo deu Errado.'+err)
	})
	
	
})






const PORT = 3000
app.listen(PORT, ()=> {
	console.log('Servidor rodando porta 3000')
})