'use strict'
const express = require('express')
const app = express()

//body parser
const bodyParser = require('body-parser')
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }))

//jwt
const jwt = require('jsonwebtoken')

//db connect
const Database = require('better-sqlite3')
const db = new Database('dbnas.db')
const port = 3000

const private_key = "PNWRtKfkUp_TcfEEUzaBU"

app.get('/', (req, res) => {
  res.send('Hello World!')
})

//login
app.post('/login', (req, res)=>{
  const username = req.header("username");
  const password = req.header("password");
  //db connect
  const name = db.prepare('SELECT * FROM users WHERE username = ? AND password = ? ')
  if (typeof username ==="undefined" || typeof password === "undefined") {
    res.status(404).json({
      status:"no",
      message:"user auth null"
    })
  }else{
    const cek = name.all(username, password)
    if (cek.length) {
      const userid = cek.userid
      jwt.sign({data: userid}, private_key, {algorithm: 'HS384', expiresIn:'1h'}, function (err, token) {
        if (err) {
          console.log(err);
        }else{
          res.status(200).json({
            status:"ok",
            message:"user found",
            data : {
              cek,
              token
            }
          })
        }
      }) 
    }else{
      res.status(404).json({
        status:"no",
        message:"auth fail"
      })
    }
  }
})
//data nasabah
app.get('/nasabah', (req, res)=>{
  const token = req.header("token");
  if (typeof token !== "undefined") {
      jwt.verify(token, private_key, {algorithms:['HS384']},function (err, decoded) {
        if (err) {
          res.status(404).json({
            status:'no',
            message:'Auth fail',
            data: {
              error : err
            }
          })
        }else{
          const nasabah = db.prepare('SELECT * FROM nasabah').all();
          const all = req.body.nasabah
          if (typeof all === "undefined") {
            res.status(403).json({
              status:"no",
              msg:"req fail"
            })
          }else if(all == "all"){
              res.status(200).json({
                status:"ok",
                msg:"success",
                nasabah : nasabah
              })
          }else{
            const rek = parseInt(all);
            if (Number.isNaN(rek)) {
              const ao = db.prepare('SELECT * FROM nasabah WHERE kd_ao = ?').all(all)
              if (ao.length) {
                res.status(200).json({
                  status:'ok',
                  msg:'success get data',
                  ao
                })
              }else{
                res.status(403).json({
                  status:'no',
                  msg:'get fail'
                })
              }
            }else{
              const rekening = db.prepare('SELECT * FROM nasabah WHERE rekening = ?').all(all)
              if (rekening.length) {
                res.status(200).json({
                  status:'ok',
                  msg:'get success',
                  rekening
                })
              }else{
                res.status(404).json({
                  status:'no',
                  msg:'rekening not found'
                })
              }
            }
          }
        }
      })    
  }else{
    res.status(404).json({
      status:'no',
      message:'auth failed'
    })
  }
})

//data ao
app.get('/ao', (req, res)=>{
  const ao = db.prepare('SELECT * FROM data_ao').all()
  console.log(ao);
  res.status(200).json({
    status:"ok",
    msg:"sukses get data ao",
    data: ao
  })
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})