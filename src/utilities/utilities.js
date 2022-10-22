import path from "path"
import url from "url"
import fs from "fs"

const __dirname = path.dirname(url.fileURLToPath(import.meta.url)).slice(0, -10)

// Load environment variables.
const load = path => {
   const env = JSON.parse(fs.readFileSync(path))

   Object.keys(env).forEach(key => {
      global[key] = env[key]
   })

   return env
}

export const env = load(path.resolve(__dirname + "/environment.json"))

// Encode string UTF-16 in string base64.
export const encode64 = string => {
   return btoa(unescape(encodeURIComponent(string)))
}

// Decode string base64 in string UTF-16.
export const decode64 = string => {
   return decodeURIComponent(escape(atob(string)))
}

// Decode token.
export const tokenDecode = token => {
   const payload = token.split(".")[1]
   return JSON.parse(decode64(payload))
}

// Identifier generator.
export const gid = length => {
   const mask = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
   let id = ""

   if (length)
      id = Array(length + 1).join("x")
   else
      id = "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"

   return id.replace(/[x]/g, () => mask[Math.random() * mask.length | 0])
}

// Timestamp generator.
// data = "2022-08-16T17:10:45.871Z" or data = "2022-08-16" or data = 1660669845871.
export const timestamp = string => {
   let date = null

   if (string) {
      try {
         date = new Date(string)
         return date.toISOString()
      }
      catch (error) {}
   }

   date = new Date()
   date = new Date(date.getTime() - date.getTimezoneOffset() * 60000)
   return date.toISOString()
}

// Parse phone number.
// phone = "+55 83 999998888" or phone = "+55 999998888" or phone = "83 999998888" or phone = "999998888".
export const parsePhone = phone => {
   let countryCode, areaCode, phoneNumber, fullNumber
   if (typeof phone != "string") { return undefined }
   let array = phone.split(" ")

   if (array.length == 3) {
      [countryCode, areaCode, phoneNumber] = array
      if (!countryCode.match(/^\+[\d]+$/) || !areaCode.match(/^[\d]+$/)) { return undefined }
   }
   else if (array.length == 2) {
      [countryCode, phoneNumber] = array
      if (!countryCode.match(/^\+[\d]+$/)) {
         areaCode = countryCode
         countryCode = undefined
         if (!areaCode.match(/^[\d]+$/)) { return undefined }
      }
   }
   else if (array.length == 1) {
      [phoneNumber] = array
   }
   else {
      return undefined
   }

   if (!phoneNumber.match(/^[\d]+$/)) { return undefined }
   fullNumber = array.join("")
   return {countryCode, areaCode, phoneNumber, fullNumber}
}