import {
  isValidPhoneNumber,
  parsePhoneNumberWithError,
} from "libphonenumber-js";

export class Validators {
  static phoneNumber(phone: string | undefined) {
    // Mozambique phone number validation
    const mozambiquePhoneRegex = /^8[2-7]\d{7}$/;
    if (!phone) return "Telefone é obrigatório";

    try {
      const phoneNumber = parsePhoneNumberWithError(phone);

      if (!phoneNumber) {
        return "Telefone inválido";
      }

      // Mozambique-specific validation
      if (phoneNumber.country === "MZ") {
        // Get national number (without country code)
        const nationalNumber = phoneNumber.nationalNumber;

        // Mozambique validation: 9 digits, first digit 8, second digit 2-7
        if (nationalNumber.length !== 9) {
          return "Telefone moçambicano deve ter exatamente 9 dígitos";
        }
        if (!mozambiquePhoneRegex.test(nationalNumber)) {
          return "Telefone moçambicano deve começar com 8 seguido de 2, 3, 4, 5, 6 ou 7";
        }
      } else {
        // For other countries, use library validation
        if (!isValidPhoneNumber(phone)) {
          return "Telefone inválido";
        }
      }

      return true;
    } catch (error) {
      return "Telefone inválido";
    }
  }

  static dateDMY(value: string | undefined) {
    if (!value) return "Data é obrigatória";
    // dd/mm/yyyy with basic range checks
    const match = value.match(/^([0-2]\d|3[01])\/(0\d|1[0-2])\/(\d{4})$/);
    if (!match) return "Use o formato dd/mm/aaaa";
    const day = parseInt(match[1], 10);
    const month = parseInt(match[2], 10) - 1; // JS months 0-11
    const year = parseInt(match[3], 10);
    const d = new Date(year, month, day);
    if (
      d.getFullYear() !== year ||
      d.getMonth() !== month ||
      d.getDate() !== day
    )
      return "Data inválida";
    // must be strictly in the past (before today)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dateOnly = new Date(d);
    dateOnly.setHours(0, 0, 0, 0);
    if (dateOnly >= today)
      return "Use uma data anterior a de hoje (dd/mm/aaaa).";
    return true;
  }
}
