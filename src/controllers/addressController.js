import { Role } from "../models/role.js"
import { addressRepository } from "../repository/addressRepository.js"

/*
GET /address
*/
export const getAll = async (request, response) => {
   console.log(request.method, request.url)
   logger.info(request)

   let { index, size } = request.query

   let addresses = await addressRepository.findAll(index, size)
   let count = await addressRepository.count()

   if (addresses) {
      index = Number(index || 0)
      size = Number(size || PAGE_SIZE)
      index = (index < 0) ? 0 : index
      size = (size < 0 || size > PAGE_SIZE) ? PAGE_SIZE : size

      response.status(200).json({
         data: addresses,
         index,
         size,
         count
      })
   }
   else {
      response.status(204).send()
   }
}

/*
PUT /address
{
   "id": "2",
   "street": "",
   "number": "",
   "district": "",
   "city": "",
   "state": "",
   "country": "",
   "complement": "",
   "zipCode": ""
}
*/
export const update = async (request, response) => {
   console.log(request.method, request.url)
   logger.info(request)

   const { role } = request.user

   if (role == Role.MEMBER) {
      // 403 Forbidden
      return response.status(403).send({
         status: 403,
         message: "Forbidden"
      })
   }

   if (typeof request.body.id != "string") {
      // 400 Bad Request
      return response.status(400).send({
         status: 400,
         message: "Bad Request"
      })
   }

   let address = await addressRepository.findById(request.body.id)

   if (address) {
      if (typeof request.body.street == "string") { address.street = request.body.street }
      if (typeof request.body.number == "string") { address.number = request.body.number }
      if (typeof request.body.district == "string") { address.district = request.body.district }
      if (typeof request.body.city == "string") { address.city = request.body.city }
      if (typeof request.body.state == "string") { address.state = request.body.state }
      if (typeof request.body.country == "string") { address.country = request.body.country }
      if (typeof request.body.complement == "string") { address.complement = request.body.complement }
      if (typeof request.body.zipCode == "string") { address.zipCode = request.body.zipCode }

      let result = await addressRepository.update(address)

      if (result) {
         response.status(200).json(address)
      }
      else {
         response.status(204).send()
      }
   }
   else {
      response.status(204).send()
   }
}

/*
GET /address/count
*/
export const getCount = async (request, response) => {
   console.log(request.method, request.url)
   logger.info(request)

   let count = await addressRepository.count()

   if (count != undefined) {
      response.status(200).json({count})
   }
   else {
      response.status(204).send()
   }
}

/*
GET /address/2
*/
export const get = async (request, response) => {
   console.log(request.method, request.url)
   logger.info(request)

   let address = await addressRepository.findById(request.params.id)

   if (address) {
      response.status(200).json(address)
   }
   else {
      response.status(204).send()
   }
}