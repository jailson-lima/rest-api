import sqlite3 from "sqlite3"
import { open } from "sqlite"

export const opendb = async filename => {
   return open({
      filename: "./dataset/" + filename + ".db",
      driver: sqlite3.Database
   })
}