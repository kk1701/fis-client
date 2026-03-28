// decode JWT payload without a library
export function decodeToken(token: string): {
  sub: number;
  email: string;
  name: string;
  role: string;
  exp: number;
} | null {
  try {
    const payload = token.split('.')[1];
    return JSON.parse(atob(payload));
  } catch {
    return null;
  }
}

export function isTokenExpired(token: string): boolean {
  const decoded = decodeToken(token);
  if (!decoded) return true;
  return decoded.exp * 1000 < Date.now();
}