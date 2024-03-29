require("dotenv").config()
const express = require("express")
const morgan = require("morgan")
const cors = require("cors")
const dayjs = require("dayjs")
//import dayjs from 'dayjs' // ES 2015
dayjs().format()
//port
const port = process.env.PORT


//mongoose stuff
const mongoose = require('mongoose');
const ShoppingList = require("./models/ShoppingList");
mongoose.connect(process.env.DATABASE_URL);
const db = mongoose.connection;
db.once("open", () => console.log("connected to mongoDB"));

//app.use
const app = express()
app.use(morgan('dev'))
app.use(express.json())
app.use(cors())

//endpoints
//GET all
app.get('/shoppinglists', (req, res) => {
    ShoppingList.find(/* {}, 'title' */).then((results) => {
      if (results) {
        res.status(200).json(results)
      }else {
        res.status(404).json({ message: 'not found'})
      }
      })
      .catch((error) => res.status(400).json({ message: 'Bad request' }))
})
//GET list by title
app.get('/shoppinglists/?title=shoppingTitle', (req, res) => {
  ShoppingList.findOne({ title: req.params.shoppingTitle}).then((results) => {
    if (results) {
      res.status(200).json(results)
    }else {
      res.status(404).json({ message: 'not found'})
    }
    })
    .catch((error) => res.status(400).json({ message: 'Bad request' }))
})

//POST new list
app.post('/shoppinglists', (req, res) => {
    const newShoppingList = new ShoppingList(req.body)
    newShoppingList.save()
    res.status(201).json(newShoppingList)
})

//GET target list
/* app.get('/shoppinglists/:shoppinglistId', (req, res) => {
    ShoppingList.findById(req.params.shoppinglistId)
      .then((results) => {
        if (results) {
          res.status(200).json(results)
        } else {
          res.status(404).json({ message: 'not found' })
        }
      })
      .catch((error) => res.status(400).json({ message: 'Bad request' }))
  }) */

  //PATCH item
  app.patch('/shoppinglists/:shoppinglistId/items', (req, res) => {
    ShoppingList.findById(req.params.shoppinglistId).then((shoppinglist) => {
        if (shoppinglist) {
        shoppinglist.title = req.body.title || shoppinglist.title
        shoppinglist.updatedAt = req.body.updatedAt
        shoppinglist.items = req.body.items 
        shoppinglist.save()
        res.status(200).json(shoppinglist)
    }else {
        res.status(404).json({ "message": "not found" })
    }})
    .catch((error) => res.status(404).json({ "message": "bad request" }))
})

  //DELETE target list
  app.delete('/shoppinglists/:shoppinglistId', (req, res) => {
    ShoppingList.findByIdAndDelete(req.params.shoppinglistId).then((shoppinglist) => {
        if (shoppinglist) {
            res.status(200).json({ deleted: shoppinglist })
        }else {
            res.status(404).json({ "message": "not found" })
        }})
        .catch((error) => res.status(404).json({ "message": "bad request" }))
})

///Post items to array DOESN'T WORK WITH DB
/* app.post('/shoppinglists/:shoppinglistId/items', (req, res) => {
  ShoppingList.findById(req.params.shoppinglistId).then((shoppinglist) => {
    if (shoppinglist) {
  shoppinglist.items.push(req.body.items)
  shoppinglist.save()
  res.status(201).json(shoppinglist)
}else {
  res.status(404).json({ "message": "not found" })
}})
.catch((error) => res.status(404).json({ "message": "bad request" }))
}) */

// GET one target item 
app.get('/shoppinglists/:shoppinglistId/items/:itemId', (req, res) => {
  ShoppingList.findById(req.params.shoppinglistId).then((shoppinglist) => {
    if (!shoppinglist) {
      res.status(400).json({ "message": "List not found" })
    } else { 
      const item = shoppinglist.items.id(req.params.itemId)
        if(!item) {
          res.status(400).json({ "message": "Item not found" })
        } else {
        res.status(201).json(item)
        .catch((error) => res.status(404).json({ "message": "Bad request" }))
        }
    }
  })
.catch((error) => res.status(404).json({ "message": "bad request" }))
})

//DELETE target item
app.delete('/shoppinglists/:shoppinglistId/items/:itemId', (req, res) => {
  ShoppingList.findById(req.params.shoppinglistId).then((shoppinglist) => {
      if (shoppinglist) {
        shoppinglist.items.id(req.params.itemId).deleteOne()
        shoppinglist.save()
          res.status(200).json(shoppinglist)
      }else {
          res.status(400).json({ "message": "not found" })
      }})
      .catch((error) => res.status(404).json({ "message": "bad request" }))
})
///PATCH indvidual items? 
app.patch('/shoppinglists/:shoppinglistId/items/:itemId', (req, res) => {
  ShoppingList.findById(req.params.shoppinglistId).then((shoppinglist) => {
    if (!shoppinglist) {
      res.status(400).json({ "message": "List not found" })
    } else { 
      const item = shoppinglist.items.id(req.params.itemId)
        if(!item) {
          res.status(400).json({ "message": "Item not found" })
        } else {
        const { name, quantity, purchased } = req.body
        item.name = name || item.name
        item.quantity = quantity || item.quantity
        item.purchased = purchased || item.purchased
        shoppinglist.save()
        .then(() => res.status(201).json(item))
        .catch((error) => res.status(404).json({ "message": "Bad request" }))
        }
    }
  })
.catch((error) => res.status(404).json({ "message": "bad request" }))
})

  //all-else error
  app.get('*', function (req, res) {
    res.status(404).json({ error: 'route not found' })
  })
//port listen
  app.listen(port, () => console.log(`Application is running on port ${port}`))