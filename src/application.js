/*
Created by Jailson Lima and released under the MIT License.
HTTP Server for backend projects.
*/

import express from "express"
import https from "https"
import cors from "cors"
import path from "path"
import url from "url"
import fs from "fs"
import { env } from "./utilities/utilities.js"
import { logger } from "./services/logger.js"
import accountRouter from "./routes/accountRouter.js"
import personRouter from "./routes/personRouter.js"
import addressRouter from "./routes/addressRouter.js"
import taskRouter from "./routes/taskRouter.js"

const app = express()
app.use(express.text())
app.use(express.json())
app.use(cors())

const __dirname = path.dirname(url.fileURLToPath(import.meta.url))

// Middleware Error.
app.use((error, request, response, next) => {
   console.log(request.method, request.url)

   if (error instanceof SyntaxError && error.status == 400) {
      // 400 Bad Request
      response.status(400).send({
         status: 400,
         message: "Bad Request"
      })
   }
   else if (error.status == 500) {
      // 500 Internal Server Error
      response.status(500).send({
         status: 500,
         message: "Internal Server Error"
      })
   }
})

// Middleware Redirect.
app.use((request, response, next) => {
   if (request.secure)
      next()
   else
      response.redirect(301, "https://" + request.headers.host.replace(PORT, PORT_HTTPS) + request.url)
})

// GET
app.get("/", (request, response) => {
   console.log(request.method, request.url)

   // 200 OK
   response.status(200).send({
      status: 200,
      message: "OK"
   })
})

// Routers.
app.use(accountRouter)
app.use(personRouter)
app.use(addressRouter)
app.use(taskRouter)

// Middleware Custom Not Found.
app.use((request, response) => {
   console.log(request.method, request.url)

   // 404 Not Found
   response.status(404).send({
      status: 404,
      message: "Not Found"
   })
})

app.listen(PORT, () => {
   console.log("http://localhost:" + PORT)
})

// SSL (Secure Sockets Layer) options.
const options = {
   key: fs.readFileSync(path.resolve(__dirname, "SSL/certificate.key")),
   cert: fs.readFileSync(path.resolve(__dirname, "SSL/certificate.crt"))
}

const server = https.createServer(options, app)

server.listen(PORT_HTTPS, () => {
   console.log("https://localhost:" + PORT_HTTPS)
})