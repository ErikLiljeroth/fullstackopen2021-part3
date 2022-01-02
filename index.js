require('dotenv').config()
const Person = require('./models/person')

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

// Define endpoints
app.get('/', (request, response) => (response.send('<h1>This page only shows if front end static build is broken</h1>')))

app.get('/info/', (request, response, next) => {
	Person.find({}).then(persons => response.send(`<p>Phonebook has info for ${persons.length} people.</p><p>${new Date}</p>`))
		.catch(error => next(error))
})

app.get('/api/persons/', (request, response, next) => {
	Person.find({}).then(persons => response.json(persons))
		.catch(error => next(error))
})

app.get('/api/persons/:id', (request, response, next) => {
	const id = Number(request.params.id)
	Person.findById(request.params.id).then(person => {
		if (person) {
			response.json(person)
		} else {
			response.status(404).end()
		}
	})
		.catch(error => next(error))
})

app.post('/api/persons/', (request, response, next) => {
	const body = request.body
	// Error handling
	if (!body.number) {
		return response.status(400).json({ error: 'The number is missing' })
	} else if (!body.name) {
		return response.status(400).json({ error: 'The name is missing' })
	} /*else if (persons.find(p => p.name === body.name)) {
		return response.status(409).json({ error: 'name must be unique' })
	}*/

	const newPerson = new Person({
		name: body.name,
		number: body.number
	})

	newPerson.save()
		.then(savedPerson => response.json(savedPerson))
		.catch(error => next(error))
})


app.put('/api/persons/:id', (request, response, next) => {
	const body = request.body

	const person = {
		name: body.name,
		number: body.number
	}

	Person.findByIdAndUpdate(request.params.id, person, { new: true, runValidators:true })
		.then(updatedPerson => {
			console.log(updatedPerson)
			if (updatedPerson === null) {
				response.status(404).end("Person to update not existing, might have been already deleted.")
			}
			response.json(updatedPerson)
		})
		.catch(error => next(error))
})

app.delete('/api/persons/:id', (request, response, next) => {
	Person.findByIdAndRemove(request.params.id)
		.then(result => {
			response.status(204).end()
		})
		.catch(error => next(error))
})

// custom middleware to handle unknown endpoints
const unknownEndpoint = (request, response) => {
	response.status(404).send({ error: 'unknown endpoint' })
}

app.use(unknownEndpoint)

// custom middleware for handling errors
const errorHandler = (error, request, response, next) => {
	console.error(error.message)

	if (error.name === 'CastError') {
		return response.status(400).send({ error: 'malformatted id' })
	} else if (error.name === 'ValidationError') {
		return response.status(400).json({ error: error.message })


	}
	next(error)
}

// Error middleware must be loaded as the last middleware
app.use(errorHandler)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => console.log(`Server running on port ${PORT}`))