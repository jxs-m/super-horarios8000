require('dotenv').config()
const express = require('express')
const app = express()
const cors = require('cors')
const port = process.env.PORT || 3000

app.use(cors())
app.use(express.json())
const mongoose = require('mongoose')

const mongoURI = process.env.MONGO_URI

const GradeRegular = mongoose.model('GradeRegular', {
    diaSemana: { type: String, required: true },
    horario: { type: String, required: true },
    turma: { type: String, required: true },
    disciplina: { type: String, required: true },
    professor: { type: String, required: true },
    sala: { type: String, required: true }
})

const SabadoLetivo = mongoose.model('SabadoLetivo', {
    data: { type: String, required: true },
    descricao: { type: String, required: true },
    horario: { type: String, required: true },
    turma: { type: String, required: true },
    professor: { type: String, required: true },
    sala: { type: String, required: true }
})

const BancaTcc = mongoose.model('BancaTcc', {
    aluno: { type: [String], required: true },
    tituloTcc: { type: String, required: true },
    dataHora: { type: String, required: true },
    sala: { type: String, required: true },
    orientador: { type: String, required: true },
    coorientador: { type: String, required: true },
    bancaAvaliadora: { type: [String], required: true }
})

const validarDiaSemana = (dia) => {
    if (!dia) return false;
    const diasValidos = ['segunda-feira', 'terça-feira', 'quarta-feira', 'quinta-feira', 'sexta-feira', 'segunda', 'terça', 'quarta', 'quinta', 'sexta'];
    return diasValidos.includes(dia.toLowerCase().trim());
}

app.get('/grade-regular', async (req, res) => {
    try {
        const grades = await GradeRegular.find()
        res.send(grades)
    } catch (error) {
        res.status(500).send({ error: error.message })
    }
})

app.get('/grade-regular/:id', async (req, res) => {
    try {
        const grade = await GradeRegular.findById(req.params.id)
        if (!grade) return res.status(404).send('Registro não encontrado')
        res.send(grade)
    } catch (error) {
        res.status(500).send({ error: error.message })
    }
})

app.post('/grade-regular', async (req, res) => {
    try {
        const { diaSemana, horario, turma, disciplina, professor, sala } = req.body

        if (!diaSemana || !horario || !turma || !disciplina || !professor || !sala) {
            return res.status(400).send('Todos os campos (diaSemana, horario, turma, disciplina, professor, sala) são obrigatórios.')
        }

        if (!validarDiaSemana(diaSemana)) {
            return res.status(400).send('O dia da semana deve ser de segunda a sexta-feira.')
        }

        const conflitoSala = await GradeRegular.findOne({ diaSemana, horario, sala })
        if (conflitoSala) {
            return res.status(400).send(`Conflito: A sala/laboratório "${sala}" já está alocada para a turma "${conflitoSala.turma}" nesse dia e horário.`)
        }

        const conflitoProfessor = await GradeRegular.findOne({ diaSemana, horario, professor })
        if (conflitoProfessor) {
            return res.status(400).send(`Conflito: O professor "${professor}" já está alocado para a turma "${conflitoProfessor.turma}" nesse dia e horário.`)
        }

        const conflitoTurma = await GradeRegular.findOne({ diaSemana, horario, turma })
        if (conflitoTurma) {
            return res.status(400).send(`Conflito: A turma "${turma}" já possui aula da disciplina "${conflitoTurma.disciplina}" nesse dia e horário.`)
        }

        const novaGrade = new GradeRegular({ diaSemana, horario, turma, disciplina, professor, sala })
        await novaGrade.save()
        res.status(201).send(novaGrade)
    } catch (error) {
        res.status(500).send({ error: error.message })
    }
})

app.put('/grade-regular/:id', async (req, res) => {
    try {
        const { diaSemana, horario, turma, disciplina, professor, sala } = req.body
        const id = req.params.id

        if (!diaSemana || !horario || !turma || !disciplina || !professor || !sala) {
            return res.status(400).send('Todos os campos (diaSemana, horario, turma, disciplina, professor, sala) são obrigatórios.')
        }

        if (!validarDiaSemana(diaSemana)) {
            return res.status(400).send('O dia da semana deve ser de segunda a sexta-feira.')
        }

        const conflitoSala = await GradeRegular.findOne({ diaSemana, horario, sala, _id: { $ne: id } })
        if (conflitoSala) {
            return res.status(400).send(`Conflito: A sala/laboratório "${sala}" já está alocada para a turma "${conflitoSala.turma}" nesse dia e horário.`)
        }

        const conflitoProfessor = await GradeRegular.findOne({ diaSemana, horario, professor, _id: { $ne: id } })
        if (conflitoProfessor) {
            return res.status(400).send(`Conflito: O professor "${professor}" já está alocado para a turma "${conflitoProfessor.turma}" nesse dia e horário.`)
        }

        const conflitoTurma = await GradeRegular.findOne({ diaSemana, horario, turma, _id: { $ne: id } })
        if (conflitoTurma) {
            return res.status(400).send(`Conflito: A turma "${turma}" já possui aula da disciplina "${conflitoTurma.disciplina}" nesse dia e horário.`)
        }

        const gradeAtualizada = await GradeRegular.findByIdAndUpdate(id, {
            diaSemana, horario, turma, disciplina, professor, sala
        }, { new: true })

        if (!gradeAtualizada) return res.status(404).send('Registro não encontrado')
        res.send(gradeAtualizada)
    } catch (error) {
        res.status(500).send({ error: error.message })
    }
})

app.delete('/grade-regular/:id', async (req, res) => {
    try {
        const grade = await GradeRegular.findByIdAndDelete(req.params.id)
        if (!grade) return res.status(404).send('Registro não encontrado')
        res.send({ message: 'Registro excluído com sucesso', registro: grade })
    } catch (error) {
        res.status(500).send({ error: error.message })
    }
})

app.get('/sabados-letivos', async (req, res) => {
    try {
        const sabados = await SabadoLetivo.find()
        res.send(sabados)
    } catch (error) {
        res.status(500).send({ error: error.message })
    }
})

app.get('/sabados-letivos/:id', async (req, res) => {
    try {
        const sabado = await SabadoLetivo.findById(req.params.id)
        if (!sabado) return res.status(404).send('Registro não encontrado')
        res.send(sabado)
    } catch (error) {
        res.status(500).send({ error: error.message })
    }
})

app.post('/sabados-letivos', async (req, res) => {
    try {
        const { data, descricao, horario, turma, professor, sala } = req.body

        if (!data || !descricao || !horario || !turma || !professor || !sala) {
            return res.status(400).send('Todos os campos (data, descricao, horario, turma, professor, sala) são obrigatórios.')
        }

        const conflitoSala = await SabadoLetivo.findOne({ data, horario, sala })
        if (conflitoSala) {
            return res.status(400).send(`Conflito: A sala/laboratório "${sala}" já está alocada para a turma "${conflitoSala.turma}" nesse dia e horário.`)
        }

        const conflitoProfessor = await SabadoLetivo.findOne({ data, horario, professor })
        if (conflitoProfessor) {
            return res.status(400).send(`Conflito: O professor "${professor}" já está alocado para a turma "${conflitoProfessor.turma}" nesse dia e horário.`)
        }

        const conflitoTurma = await SabadoLetivo.findOne({ data, horario, turma })
        if (conflitoTurma) {
            return res.status(400).send(`Conflito: A turma "${turma}" já possui atividade cadastrada nesse dia e horário.`)
        }

        const novoSabado = new SabadoLetivo({ data, descricao, horario, turma, professor, sala })
        await novoSabado.save()
        res.status(201).send(novoSabado)
    } catch (error) {
        res.status(500).send({ error: error.message })
    }
})

app.put('/sabados-letivos/:id', async (req, res) => {
    try {
        const { data, descricao, horario, turma, professor, sala } = req.body
        const id = req.params.id

        if (!data || !descricao || !horario || !turma || !professor || !sala) {
            return res.status(400).send('Todos os campos (data, descricao, horario, turma, professor, sala) são obrigatórios.')
        }

        const conflitoSala = await SabadoLetivo.findOne({ data, horario, sala, _id: { $ne: id } })
        if (conflitoSala) {
            return res.status(400).send(`Conflito: A sala/laboratório "${sala}" já está alocada para a turma "${conflitoSala.turma}" nesse dia e horário.`)
        }

        const conflitoProfessor = await SabadoLetivo.findOne({ data, horario, professor, _id: { $ne: id } })
        if (conflitoProfessor) {
            return res.status(400).send(`Conflito: O professor "${professor}" já está alocado para a turma "${conflitoProfessor.turma}" nesse dia e horário.`)
        }

        const conflitoTurma = await SabadoLetivo.findOne({ data, horario, turma, _id: { $ne: id } })
        if (conflitoTurma) {
            return res.status(400).send(`Conflito: A turma "${turma}" já possui atividade cadastrada nesse dia e horário.`)
        }

        const sabadoAtualizado = await SabadoLetivo.findByIdAndUpdate(id, {
            data, descricao, horario, turma, professor, sala
        }, { new: true })

        if (!sabadoAtualizado) return res.status(404).send('Registro não encontrado')
        res.send(sabadoAtualizado)
    } catch (error) {
        res.status(500).send({ error: error.message })
    }
})

app.delete('/sabados-letivos/:id', async (req, res) => {
    try {
        const sabado = await SabadoLetivo.findByIdAndDelete(req.params.id)
        if (!sabado) return res.status(404).send('Registro não encontrado')
        res.send({ message: 'Registro excluído com sucesso', registro: sabado })
    } catch (error) {
        res.status(500).send({ error: error.message })
    }
})

app.get('/bancas-tcc', async (req, res) => {
    try {
        const bancas = await BancaTcc.find()
        res.send(bancas)
    } catch (error) {
        res.status(500).send({ error: error.message })
    }
})

app.get('/bancas-tcc/:id', async (req, res) => {
    try {
        const banca = await BancaTcc.findById(req.params.id)
        if (!banca) return res.status(404).send('Registro não encontrado')
        res.send(banca)
    } catch (error) {
        res.status(500).send({ error: error.message })
    }
})

app.post('/bancas-tcc', async (req, res) => {
    try {
        const { aluno, tituloTcc, dataHora, sala, orientador, coorientador, bancaAvaliadora } = req.body

        if (!aluno || !tituloTcc || !dataHora || !sala || !orientador || !coorientador || !bancaAvaliadora) {
            return res.status(400).send('Todos os campos (aluno, tituloTcc, dataHora, sala, orientador, coorientador, bancaAvaliadora) são obrigatórios.')
        }

        if (!Array.isArray(aluno) || aluno.length < 1 || aluno.length > 2) {
            return res.status(400).send('A banca deve ter 1 ou 2 alunos e ser enviada como uma lista (array).')
        }

        if (!Array.isArray(bancaAvaliadora) || bancaAvaliadora.length !== 3) {
            return res.status(400).send('A banca avaliadora deve possuir exatamente 3 membros.')
        }

        if (!bancaAvaliadora.includes(orientador)) {
            return res.status(400).send('O orientador deve obrigatoriamente ser um dos membros da banca avaliadora.')
        }

        const conflitoSala = await BancaTcc.findOne({ dataHora, sala })
        if (conflitoSala) {
            return res.status(400).send(`Conflito: A sala/local "${sala}" já está reservada para outra banca de TCC (do(s) aluno(s) "${[].concat(conflitoSala.aluno).join(', ')}") neste horário.`)
        }

        const conflitoAluno = await BancaTcc.findOne({ dataHora, aluno: { $in: aluno } })
        if (conflitoAluno) {
            return res.status(400).send(`Conflito: Pelo menos um dos alunos ("${aluno.join(', ')}") já possui uma banca de TCC agendada para este horário.`)
        }

        const bancasNoMesmoHorario = await BancaTcc.find({ dataHora })
        for (const b of bancasNoMesmoHorario) {
            const professoresConflito = bancaAvaliadora.filter(p => b.bancaAvaliadora.includes(p))
            if (professoresConflito.length > 0) {
                return res.status(400).send(`Conflito: O(s) professor(es) "${professoresConflito.join(', ')}" já faz(em) parte da banca do(s) aluno(s) "${[].concat(b.aluno).join(', ')}" neste mesmo horário.`)
            }
        }

        const novaBanca = new BancaTcc({ aluno, tituloTcc, dataHora, sala, orientador, coorientador, bancaAvaliadora })
        await novaBanca.save()
        res.status(201).send(novaBanca)
    } catch (error) {
        res.status(500).send({ error: error.message })
    }
})

app.put('/bancas-tcc/:id', async (req, res) => {
    try {
        const { aluno, tituloTcc, dataHora, sala, orientador, coorientador, bancaAvaliadora } = req.body
        const id = req.params.id

        if (!aluno || !tituloTcc || !dataHora || !sala || !orientador || !coorientador || !bancaAvaliadora) {
            return res.status(400).send('Todos os campos (aluno, tituloTcc, dataHora, sala, orientador, coorientador, bancaAvaliadora) são obrigatórios.')
        }

        if (!Array.isArray(aluno) || aluno.length < 1 || aluno.length > 2) {
            return res.status(400).send('A banca deve ter 1 ou 2 alunos e ser enviada como uma lista (array).')
        }

        if (!Array.isArray(bancaAvaliadora) || bancaAvaliadora.length !== 3) {
            return res.status(400).send('A banca avaliadora deve possuir exatamente 3 membros.')
        }

        if (!bancaAvaliadora.includes(orientador)) {
            return res.status(400).send('O orientador deve obrigatoriamente ser um dos membros da banca avaliadora.')
        }

        const conflitoSala = await BancaTcc.findOne({ dataHora, sala, _id: { $ne: id } })
        if (conflitoSala) {
            return res.status(400).send(`Conflito: A sala/local "${sala}" já está reservada para outra banca de TCC (do(s) aluno(s) "${[].concat(conflitoSala.aluno).join(', ')}") neste horário.`)
        }

        const conflitoAluno = await BancaTcc.findOne({ dataHora, aluno: { $in: aluno }, _id: { $ne: id } })
        if (conflitoAluno) {
            return res.status(400).send(`Conflito: Pelo menos um dos alunos ("${aluno.join(', ')}") já possui uma banca de TCC agendada para este horário.`)
        }

        const bancasNoMesmoHorario = await BancaTcc.find({ dataHora, _id: { $ne: id } })
        for (const b of bancasNoMesmoHorario) {
            const professoresConflito = bancaAvaliadora.filter(p => b.bancaAvaliadora.includes(p))
            if (professoresConflito.length > 0) {
                return res.status(400).send(`Conflito: O(s) professor(es) "${professoresConflito.join(', ')}" já faz(em) parte da banca do(s) aluno(s) "${[].concat(b.aluno).join(', ')}" neste mesmo horário.`)
            }
        }

        const bancaAtualizada = await BancaTcc.findByIdAndUpdate(id, {
            aluno, tituloTcc, dataHora, sala, orientador, coorientador, bancaAvaliadora
        }, { new: true })

        if (!bancaAtualizada) return res.status(404).send('Registro não encontrado')
        res.send(bancaAtualizada)
    } catch (error) {
        res.status(500).send({ error: error.message })
    }
})

app.delete('/bancas-tcc/:id', async (req, res) => {
    try {
        const banca = await BancaTcc.findByIdAndDelete(req.params.id)
        if (!banca) return res.status(404).send('Registro não encontrado')
        res.send({ message: 'Registro excluído com sucesso', registro: banca })
    } catch (error) {
        res.status(500).send({ error: error.message })
    }
})

app.listen(port, () => {
    mongoose.connect(mongoURI)
        .then(() => console.log('Conectado ao MongoDB com sucesso.'))
        .catch(err => console.error('Erro de conexão ao MongoDB:', err))
    console.log(`Servidor rodando com sucesso na porta ${port}`)
})
