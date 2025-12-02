export const validateEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

export const validatePassword = (password) => {
  return password.length >= 8 && /[A-Z]/.test(password) && /[0-9]/.test(password);
};

export const validateDate = (date) => {
  return !isNaN(Date.parse(date));
};

export const validateNumber = (number) => {
  return !isNaN(parseFloat(number)) && isFinite(number);
};

export const validateRequired = (value) => {
  return value !== null && value !== undefined && value !== '';
};