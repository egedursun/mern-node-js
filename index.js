const express = require("express")
const bodyParser = require("body-parser")
const morgan = require("morgan")
const cors = require("cors")
const Person = require("./models/person")

const app = express()
const jsonParser = bodyParser.json()
app.use(jsonParser)
app.use(cors())

// Exercise (3.8)
morgan.token('person-info', function(req) {
    if (req.method === "POST"){
        if(req.body){
            if(req.body.name && req.body.number){
                const name = req.body.name
                const number = req.body.number
                return JSON.stringify({"name": name, "number": number})
            }
        }
        return JSON.stringify({"error" : "Name or number is missing."})
    }
})

// Exercise (3.7)
app.use(morgan(":method :url :response-time :person-info"))

/*
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

 */

const errorHandler = (error, request, response, next) => {

    // EXERCISE (3.16)
    console.log(error.message)

    if (error.name === "CastError"){
        return response.status(400).send({error: "malformatted id"})
    } else if (error.name === "ValidationError") {
        return response.status(400).json({error: error.message})
    }
}
app.use(errorHandler)

app.get("/", (request, response) => {
    response.send("<h1>Welcome to My Server!</h1")
})

// Create an Information Page (Ex. 3.2)
app.get("/info", (request, response) => {
    let personSize = 0
    Person.find({}).then(persons => {
        personSize = persons.length
        response.send(
            `<p>Phonebook has info for ${personSize} people</p> <p>${Date()}</p>`
        )
    })
})

// GET all persons and phonebook data (Ex. 3.1)
app.get("/api/persons", (request, response) => {
    // Exercise (3.13)
    Person.find({}).then(persons => {
        response.json(persons)
    })
})

// GET  a single persons and phonebook entry (Ex. 3.3)
app.get("/api/persons/:id", (request, response) => {
    /*
    const id = Number(request.params.id)
    const person = persons.find(note => note.id === id)

    if (person) {
        response.json(person)
    }
    else{
        response.status(404).end()
    }

     */

    // Exercise (3.13)
    Person.findById(request.params.id).then(
        person => {
            response.json(person)
        }
    )
})

// DELETE a single entry from the phonebook (Ex. 3.4)
app.delete("/api/persons/:id", (request, response, next) => {
    /*
    const id = Number(request.params.id)
    console.log(id)
    persons = persons.filter(person => person.id !== id)
    response.status(204).end()

     */

    // EXERCISE (3.15)
    Person.findByIdAndRemove(request.params.id).then(
        result => {
            response.status(204).end()
        }
    ).catch(error => next(error))
})

// Generate a unique ID
const generateID = () => {
    return Math.floor(100000000000 + Math.random() * 900000000000)
}

// POST a new phonebook entry to the book (Ex. 3.5)
app.post("/api/persons", (request, response, next) => {
    const body = request.body

    /*
    if (!body.name) {
        return response.status(400).json({
            error: "The 'name' field in the content is missing."
        })
    }

    if (!body.number) {
        return response.status(400).json({
            error: "The 'number' field in the content is missing."
        })
    }

     */

    /*
    if (persons.find(person => person.name === body.name)) {
        return response.status(409).json({
            error: "This 'name' field already exists in the database."
        })
    }

     */

    Person.find({}).then(persons => {
        persons.map((person) => {
            if (person.name === body.name){
                response.json({message: "the person name already exists"}).end()
            }
        })
    })

    // Exercise (3.14)
    const person = new Person({
        name: body.name,
        number: body.number
    })

    person.save().then(savedPerson => {
        response.json(savedPerson)
    })
        .catch(error => next(error))

    /*
    persons = persons.concat(person)
    response.json(person)

     */
})


// Update user on phonebook
app.put("/api/persons/:id", (request, response, next) => {
    const { name, number } = request.body

    const person = new Person({
        name: name,
        number: number
    })

    const error = person.validateSync()
    if (error !== undefined){
        response.json({ message: error }).end()
    }

    Person.findByIdAndUpdate(request.params.id, { name, number }, {new: true, runValidators: true, context: "query"})
        .then(updatedPerson => {
            response.json(updatedPerson)
        }).catch(error => next(error))
})


const PORT = process.env.PORT
app.listen(PORT)
console.log(`Server running on port ${PORT}`)