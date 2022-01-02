require('dotenv').config()
const mongoose = require('mongoose')

if (process.argv.length < 3) {
	console.log('Please provide the password as an argument: node mongo.js <password>')
	process.exit(1)
}

const password = process.argv[2]
const url = `mongodb+srv://erik:${password}@cluster0.atem4.mongodb.net/phonebook-app?retryWrites=true&w=majority`
mongoose.connect(url)

const personSchema = new mongoose.Schema({
	name: String,
	number: String,
})

const Person = mongoose.model('Person', personSchema)

if (process.argv.length < 4) {
	Person.find({}).then(result => {
		console.log("Phonebook:")
		result.forEach(person => {
			console.log(`${person.name} ${person.number}`)
		})
		mongoose.connection.close().then(process.exit(1))
		//console.log()
		//console.log("program executed nominally")
		//process.exit(1)
	})
} else if (process.argv.length === 5) {
	const person = new Person({
		name: String(process.argv[3]),
		number: String(process.argv[4])
	})
	person.save().then(result => {
		console.log(`added ${result.name} with number ${result.number} to Phonebook!`)
		mongoose.connection.close()
	})
} else {
	console.log('Wrong number of arguments, cannot understand.')
	mongoose.connection.close().then(process.exit(1))
}