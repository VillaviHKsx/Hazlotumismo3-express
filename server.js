import express from 'express';
import { readFile } from 'fs';
import fs from 'fs/promises';
import Joi from 'joi';
import { v4 as uuidv4 } from 'uuid'; 

const app = express();

// Middleaware para poder datos en formato json
app.use(express.json());

const playerSchema = Joi.object({
  first_name: Joi.string().required(),
  last_name: Joi.string().required(),
  age: Joi.number().required(),
  Team: Joi.string().required(),
});

const playerUpdateSchema = Joi.object({
    first_name: Joi.string(),
    last_name: Joi.string(),
    age: Joi.number(),
    Team: Joi.string(),
});

const getPlayersFromDB = async () => {
    const players = await fs.readFile('./data/players.json');
    return JSON.parse(players);
  };

// "METODO GET - OBTENER TODOS LOS PLAYERS DE players.json"
app.get('/api/v1/players', async (req, res) => {
    // Vamos a obtener los registros que esten almacenados en la base de datos (archivo json)
    // Tenemos que leer los datos almacenados en el archivo json
    const players = await fs.readFile('./data/players.json');
    res.json(JSON.parse(players));
});

// "METODO POST - CREAR UN NUEVO PLAYER"
app.post('/api/v1/players', async (req, res) => {
    const {error} = playerSchema.validate(req.body, { convert: false});
    if (error){
      // El rango de los errores 400 (cualquier codigo de http que vaya desde 400-499 son errores del cliente)
      return res.status(400).json({ error: error.details[0].message });
    }
  
    // Vamos a utilizar la generacion de un  uuid(string -> GSSJDKDKHS) para poder asignar un id unico a nuestro
    const uuid = uuidv4();
    
    // Vamos a leer todos los juguetes del archivo json
    const players = await getPlayersFromDB();
    // Vamos a insertar un nuevo juguete a nuestro arreglo
    players.push({ id: uuid, ...req.body });
  
    await fs.writeFile('./data/players.json', JSON.stringify(players, null, 2));
    
    res.status(201).json({ message: 'Juguete creado con exito'});
});


// "METODO GET - OBTENER EL PLAYER POR SU ID"
app.get('/api/v1/players/:id', async (req, res) => {
    const players = await fs.readFile('./data/players.json');
    const allPlayers = JSON.parse(players);
  
    const playerId = req.params.id;
    const player = allPlayers.find(player => player.id === playerId);
  
    if (player) {
      res.json(player);
    } else {
      res.status(404).json({ mensaje: 'Juguete no encontrado' });
    }
});


// "METODO PATCH - ACTUALIZAR UN PLAYER POR SU ID"
app.patch('/api/v1/players/:id', async (req, res) => {
    const {error} = playerUpdateSchema.validate(req.body, { convert: false});
    if (error){
      return res.status(400).json({ error: error.details[0].message });
    }
  
    const players = await getPlayersFromDB();
    const playerIndex = players.findIndex(player => player.id === req.params.id);
  
    if (playerIndex === -1) {
      return res.status(404).json({ message: 'Player no encontrado' });
    }
  
    const updatedPlayer = { ...players[playerIndex], ...req.body };
    players[playerIndex] = updatedPlayer;
  
    await fs.writeFile('./data/players.json', JSON.stringify(players, null, 2));
  
    res.json({ message: 'Player actualizado' });
});

// "METODO DELETE - BORRAR UN PLAYER POR SU ID"
app.delete('/api/v1/players/:id', async (req, res) => {
    const players = await getPlayersFromDB();
    const playerIndex = players.findIndex(player => player.id === req.params.id);
  
    if (playerIndex === -1) {
      return res.status(404).json({ message: 'Player no encontrado' });
    }
  
    players.splice(playerIndex, 1);
  
    await fs.writeFile('./data/players.json', JSON.stringify(players, null, 2));
  
    res.json({ message: 'Player eliminado' });
});


app.listen(8080);