/*
    EXERCISE (3.12)
 */

const mongoose = require("mongoose")

let readMode = false

if (process.argv.length < 5){
    console.log("Please provide password, name, and number as an argument: node mongo.js <password> <name> <number>")

    if(process.argv.length !== 3){
        process.exit(1)
    }
    else{
        readMode = true
    }
}

const password = process.argv[2]
let name = null
let phone = null

if (readMode === false){
    name = process.argv[3]
    phone = process.argv[4]
}

const url = `mongodb+srv://fullstack:${password}@cluster0.fgoi49q.mongodb.net/phonebookApp?retryWrites=true&w=majority`

const personSchema = new mongoose.Schema({
    name: String,
    number: String
})

const Person = mongoose.model("Person", personSchema)

mongoose.connect(url).then(() => {
    console.log("connected")

    if (readMode === false){
        const person = new Person({
            name: name,
            number: phone,
        })

        return person.save()
    }
}).then(() => {

    if (readMode === false){
        console.log(`added ${name} number ${phone} to phonebook`)
        mongoose.connection.close()
    }
    else{
        console.log("phonebook:")
        Person.find({}).then(result => {
            result.forEach(person => {
                console.log(`${person.name} ${person.number}`)
            })
            mongoose.connection.close()
        })
    }

}).catch((err) => {
    console.log(err)
})