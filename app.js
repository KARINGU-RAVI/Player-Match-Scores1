const express = require('express')
const path = require('path')
const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
const app = express()
app.use(express.json())
const dbPath = path.join(__dirname, 'cricketMatchDetails.db')

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

const convertDbObjectToResponse0bject = dbObject => {
  return {
    playerId: dbObject.player_id,
    playerName: dbObject.player_name,
  }
}
const convertMatch = dbObject => {
  return {
    matchId: dbObject.match_id,
    match: dbObject.match,
    year: dbObject.year,
  }
}

// Get palyers API
app.get('/players/', async (request, response) => {
  const getBooksQuery = `SELECT * FROM player_details; `
  const arrayy = await db.all(getBooksQuery)
  let fin = arrayy.map(book => {
    return convertDbObjectToResponse0bject(book)
  })
  response.send(fin)
})

//Get player API
app.get('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params
  const getBookQuery = `
    SELECT
        *
    FROM
        player_details
    WHERE
         player_id = ${playerId};`

  let book = await db.get(getBookQuery)
  response.send(convertDbObjectToResponse0bject(book))
})

//Get player put API
app.put('/players/:playerId', async (req, res) => {
  let {playerId} = req.params

  //   const bookDetails = req.body
  const {playerName} = req.body

  const updateBookQuery = `
    UPDATE
      player_details
    SET
      player_name='${playerName}';`
  await db.run(updateBookQuery)
  res.send('Player Details Updated')
})
// Matches API
app.get('/matches/:matchId/', async (request, response) => {
  const {matchId} = request.params
  const getBookQuery = `
    SELECT
        *
    FROM
        match_details
    WHERE
         match_id = ${matchId};`

  let book = await db.get(getBookQuery)
  response.send(convertMatch(book))
})
// API 5
app.get('/players/:playerId/matches', async (request, response) => {
  const {playerId} = request.params
  const getBookQuery = `
    SELECT
        match_id as matchId, match,year
    FROM
        player_match_score NATURAL JOIN match_details
    WHERE
         player_id = ${playerId};`

  let book = await db.all(getBookQuery)
  response.send(book)
})

//API 6
app.get('/matches/:matchId/players', async (request, response) => {
  const {matchId} = request.params
  const getBookQuery = `
    SELECT
        player_match_score.player_id as playerId, player_details.player_name as playerName
    FROM
       player_details INNER JOIN  player_match_score  ON player_details.player_id = player_match_score.player_id
    WHERE
         match_id = ${matchId};`

  let book = await db.all(getBookQuery)
  response.send(book)
})
//API 7
app.get('/players/:playerId/playerScores', async (request, response) => {
  const {playerId} = request.params
  const getBookQuery = `
    SELECT
       player_details.player_id as playerId , player_details.player_name as playerName , 
       SUM(player_match_score.score) as totalScore , SUM(player_match_score.fours) as totalFours , SUM(player_match_score.sixes) as totalSixes
    FROM
       player_details INNER JOIN  player_match_score  ON player_details.player_id = player_match_score.player_id
    WHERE
         player_details.player_id = ${playerId};`

  let book = await db.get(getBookQuery)
  response.send(book)
})

module.exports = app
