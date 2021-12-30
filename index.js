const express = require('express')
// Middleware for logging requests in the terminal window running the server
const morgan = require('morgan')
const cors = require('cors')
const app = express()
// Use middleware by syntax "app.use"
app.use(express.json())
// Define morgan token to display request content in logger
morgan.token('reqbody', (request, response) => (JSON.stringify(request.body)))
// Custom format for morgan logging, see documentation: https://github.com/expressjs/morgan
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :reqbody'))
// Enable inter-origin http requests
app.use(cors())
// Middleware to serve static builds
app.use(express.static('build'))

let persons = [
	{
		"id": 1,
		"name": "Arto Hellas",
		"number": "040-123456"
	},
	{
		"id": 2,
		"name": "Ada Lovelace",
		"number": "39-44-5323523"
	},
	{
		"id": 3,
		"name": "Dan Abramov",
		"number": "12-43-234345"
	},
	{
		"id": 4,
		"name": "Mary Poppendieck",
		"number": "39-23-6423122"
	}
]

app.get('/', (request, response) => (response.send('<h1>This page only shows if front end static build is broken</h1>')))

app.get('/info/', (request, response) => {
	response.send(`<p>Phonebook has info for ${persons.length} people.</p><p>${new Date}</p>`)
})

app.get('/api/persons/', (request, response) => {
	response.json(persons)
})

app.get('/api/persons/:id', (request, response) => {
	const id = Number(request.params.id)
	const person = persons.find(p => p.id === id)

	if (person) {
		response.json(person)
	} else {
		response.status(404).end()
	}
})

const generateId = () => {
	return Math.floor(Math.random()*100000)
}

app.post('/api/persons/', (request, response) => {
	const body = request.body

	// Error handling
	if (!body.number) {
		return response.status(400).json({ error: 'The number is missing' })
	} else if (!body.name) {
		return response.status(400).json({ error: 'The name is missing' })
	} else if (persons.find(p => p.name === body.name)) {
		return response.status(409).json({ error: 'name must be unique' })
	}

	const newPerson = {
		id: generateId(),
		name: body.name,
		number: body.number
	}

	persons = persons.concat(newPerson)
	response.json(newPerson)
})

app.delete('/api/persons/:id', (request, response) => {
	const id = Number(request.params.id)
	persons = persons.filter(p => p.id !== id)

	response.status(204).end()
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => console.log(`Server running on port ${PORT}`))