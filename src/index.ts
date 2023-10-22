import express, { Request, Response } from 'express'
import cors from 'cors'
import { db } from './database/knex'
import { TUserDB } from './database/types'


const app = express()

app.use(cors())
app.use(express.json())

app.listen(3003, () => {
    console.log(`Servidor rodando na porta ${3003}`)
})



// ... configurações do express

app.get("/ping", async (req: Request, res: Response) => {
    try {
			
        res.status(200).send({ message: "Pong!" })
    } catch (error) {
        console.log(error)

        if (req.statusCode === 200) {
            res.status(500)
        }

        if (error instanceof Error) {
            res.send(error.message)
        } else {
            res.send("Erro inesperado")
        }
    }
})

app.get("/users", async (req: Request, res: Response) => {
    try {
        const searchTerm = req.query.q as string | undefined
        console.log(searchTerm);

        if(searchTerm === undefined){
            const result = await db("users")
            res.status(200).send(result)
        }else{
            const result = await db("users").where("name","LIKE",`%${searchTerm}%`)
            res.status(200).send(result)
        }
        
	    
        
    } catch (error) {
        console.log(error)

        if (req.statusCode === 200) {
            res.status(500)
        }

        if (error instanceof Error) {
            res.send(error.message)
        } else {
            res.send("Erro inesperado")
        }
    }
})
app.post("/users", async (req: Request, res: Response) => {
    try {
       
        const {id, name, email, password} = req.body

        if(typeof id !== "string"){
            res.status(400)
            throw new Error('Id é obrigatório')
        }

        if(id.length < 4){
            res.status(400)
            throw new Error('Id deve possuir pelo menos 4 caracteres')
        }
        if(typeof name !== "string"){
            res.status(400)
            throw new Error('name é obrigatório')
        }

        if(name.length < 2){
            res.status(400)
            throw new Error('name deve possuir pelo menos 2 caracteres')
        }

        if(typeof email !== "string"){
            res.status(400)
            throw new Error('name é obrigatório')
        }

        if (!password.match(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\da-zA-Z]).{8,12}$/g)) {
			throw new Error("'password' deve possuir entre 8 e 12 caracteres, com letras maiúsculas e minúsculas e no mínimo um número e um caractere especial")
        }

        const [useridAlreadyExists]: TUserDB[] |undefined[] = await db("users").where({id})

        if(useridAlreadyExists){
            res.status(400)
            throw new Error(`O "id" já existe`)
        }
        const [userEmailAlreadyExists]: TUserDB[] |undefined[] = await db("users").where({id})

        if(userEmailAlreadyExists){
            res.status(400)
            throw new Error(`O "email" já existe`)
        }

        const newUser : TUserDB = {
            id,
            name,
            email,
            password
        }

        await db("users").insert(newUser)

        res.status(201).send({
            message: `Usuário ${name} criado com sucesso!`,
            user: newUser
        })
    } catch (error) {
        console.log(error)

        if (req.statusCode === 200) {
            res.status(500)
        }

        if (error instanceof Error) {
            res.send(error.message)
        } else {
            res.send("Erro inesperado")
        }
    }
})