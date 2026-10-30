export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
};

export const isValidPin = (pin: string): boolean => {
  const clean = pin.replace(/\s/g, '');
  return /^\d{6}$/.test(clean);
};

export const isValidPassword = (password: string): boolean => {
  return password.length >= 6;
};
