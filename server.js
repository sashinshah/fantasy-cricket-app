const express = require("express")
const cors = require("cors")
const multer = require("multer")
const csv = require("csv-parser")
const XLSX = require("xlsx")
const fs = require("fs")

const players = require("./database/players.json")

const app = express()

app.use(cors())
app.use(express.json())
app.use(express.static("."))

const upload = multer({ dest: "uploads/" })

app.get("/", (req,res)=>{
res.send("Fantasy Cricket Server Running")
})

app.get("/players",(req,res)=>{
res.json(players)
})

app.post("/upload-scorecard", upload.single("file"), (req,res)=>{

const filePath = req.file.path

if(req.file.originalname.endsWith(".csv")){

let rows = []

fs.createReadStream(filePath)
.pipe(csv())
.on("data",(row)=>rows.push(row))
.on("end",()=>{

const result = rows.map(p => {

const runs = Number(p.runs || p.Runs || 0)
const wickets = Number(p.wickets || p.Wickets || 0)
const catches = Number(p.catches || p.Catches || 0)

const points =
runs +
(wickets * 25) +
(catches * 8)

return {
name:
p.name ||
p.player ||
p.Player ||
p["Player Name"] ||
p.batsman ||
"Unknown Player",

runs,
wickets,
catches,
points
}

})

res.json(result)

})

}

else{

const workbook = XLSX.readFile(filePath)
const sheet = workbook.Sheets[workbook.SheetNames[0]]
const data = XLSX.utils.sheet_to_json(sheet)

const result = data.map(p => {

const runs = Number(p.runs || p.Runs || 0)
const wickets = Number(p.wickets || p.Wickets || 0)
const catches = Number(p.catches || p.Catches || 0)

const points =
runs +
(wickets * 25) +
(catches * 8)

return {
name:
p.name ||
p.player ||
p.Player ||
p["Player Name"] ||
p.batsman ||
"Unknown Player",

runs,
wickets,
catches,
points
}

})

res.json(result)

}

})

const PORT = process.env.PORT || 5000

app.listen(PORT, () => {
console.log("Server running on port", PORT)
})
