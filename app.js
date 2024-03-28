const express = require('express')
const path = require('path')

const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
const app = express()
app.use(express.json())

const dbPath = path.join(__dirname, 'moviesData.db')

let db = null

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log('Server Running at http://localhost:3000/')
    })
  } catch (e) {
    console.log(`DB Error: ${e.message}`)
    process.exit(1)
  }
}

initializeDBAndServer()
const movieDbToResponse = dbObject => {
  return {
    movieId: dbObject.movie_id,
    directorId: dbObject.director_id,
    movieName: dbObject.movie_name,
    leadActor: dbObject.lead_actor,
  }
}
const directorDbtoResponse = dbObject => {
  return {
    directorId: dbObject.director_id,
    directorName: dbObject.director_name,
  }
}
//movies entire table
app.get('/movies/', async (request, response) => {
  const getAllMovies = `
  SELECT 
  * 
  FROM 
  movie;`
  const a = await db.all(getAllMovies)
  response.send(a.map(i => ({movieName: i.movie_name})))
})
//POST
app.post('/movies/', async (request, response) => {
  const {directorId, movieName, leadActor} = request.body
  const api2 = `
  INSERT INTO 
  movie (director_id,movie_name,lead_actor)
  VALUES ('${directorId}','${movieName}','${leadActor}');`
  await db.run(api2)
  response.send('Movie Successfully Added')
})
//specific movie
app.get('/movies/:movieId/', async (request, response) => {
  const {movieId} = request.params
  const api3 = `
  SELECT 
  * 
  FROM 
  movie
  WHERE 
  movie_id=${movieId};`
  const b = await db.get(api3)
  response.send(movieDbToResponse(b))
})
//PUT
app.put('/movies/:movieId/', async (request, response) => {
  const {movieId} = request.params
  const {directorId, movieName, leadActor} = request.body
  const api4 = `
  UPDATE 
  movie 
  SET
  director_id='${directorId}',
  movie_name='${movieName}',
  lead_actor='${leadActor}';`
  await db.run(api4)
  response.send('Movie Details Updated')
})
//DELETE
app.delete('/movies/:movieId/', async (request, response) => {
  const {movieId} = request.params
  const api5 = `
  DELETE
  FROM 
  movie
  WHERE 
  movie_id = ${movieId};`
  await db.run(api5)
  response.send('Movie Removed')
})
//GET ALL FROM DIRECTOR
app.get('/directors/', async (request, response) => {
  const api6 = `
  SELECT 
  * 
  FROM 
  director;`
  const c = await db.all(api6)
  response.send(c.map(i => directorDbtoResponse(i)))
})
//SPECIFIC MOVIE WITH DIRECTOR
app.get('/directors/:directorId/movies/', async (request, response) => {
  const {directorId} = request.params
  const api7 = `
  SELECT 
  movie_name
  FROM 
  movie
  WHERE
  director_id=${directorId};`
  const x = await db.all(api7)
  response.send(x.map(i => ({movieName: i.movie_name})))
})
module.exports = app
