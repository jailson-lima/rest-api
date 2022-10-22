import jwt from "jsonwebtoken"

export const authenticate = (request, response, next) => {
   const authorizationHeader = request.headers.authorization

   if (authorizationHeader) {
      const token = authorizationHeader.split(" ")[1] // token == accessToken

      jwt.verify(token, SECRET_KEY, (error, user) => {
         if (error) {
            // 403 Forbidden
            return response.status(403).send({
               status: 403,
               message: "Forbidden"
            })
         }

         request.user = user
         next()
      })
   }
   else {
      // 401 Unauthorized
      response.status(401).send({
         status: 401,
         message: "Unauthorized"
      })
   }
}