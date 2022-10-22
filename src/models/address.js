export class Address {
   constructor(id, street, number, district, city, state, country, complement, zipCode, personId) {
      this.id = id || ""
      this.street = street || ""
      this.number = number || ""
      this.district = district || ""
      this.city = city || ""
      this.state = state || ""
      this.country = country || ""
      this.complement = complement || ""
      this.zipCode = zipCode || ""
      this.personId = personId || ""
   }

   static from(address) {
      return new Address(
         address.id,
         address.street,
         address.number,
         address.district,
         address.city,
         address.state,
         address.country,
         address.complement,
         address.zipCode,
         address.personId
      )
   }
}