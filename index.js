const express = require("express")
const bodyParser = require("body-parser")
const morgan = require("morgan")
const cors = require("cors")

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

app.get("/", (request, response) => {
    response.send("<h1>Welcome to My Server!</h1")
})

// Create an Information Page (Ex. 3.2)
app.get("/info", (request, response) => {
    response.send(
        `<p>Phonebook has info for ${persons.size} people</p> <p>${Date()}</p>`
    )
})

// GET all persons and phonebook data (Ex. 3.1)
app.get("/api/persons", (request, response) => {
    response.json(persons)
})

// GET  a single persons and phonebook entry (Ex. 3.3)
app.get("/api/persons/:id", (request, response) => {
    const id = Number(request.params.id)
    const person = persons.find(note => note.id === id)

    if (person) {
        response.json(person)
    }
    else{
        response.status(404).end()
    }
})

// DELETE a single entry from the phonebook (Ex. 3.4)
app.delete("/api/persons/:id", (request, response) => {

    const id = Number(request.params.id)
    console.log(id)
    persons = persons.filter(person => person.id !== id)
    response.status(204).end()
})

// Generate a unique ID
const generateID = () => {
    return Math.floor(100000000000 + Math.random() * 900000000000)
}

// POST a new phonebook entry to the book (Ex. 3.5)
app.post("/api/persons", (request, response) => {
    const body = request.body

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

    if (persons.find(person => person.name === body.name)) {
        return response.status(409).json({
            error: "This 'name' field already exists in the database."
        })
    }

    const person = {
        id: generateID(),
        name: body.name,
        number: body.number
    }

    persons = persons.concat(person)
    response.json(person)
})



const PORT = 3002
app.listen(PORT)
console.log(`Server running on port ${PORT}`)