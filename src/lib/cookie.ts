export function getCookie(name: string): string | null {
  const cookieString = document.cookie;
  const cookies = cookieString.split(";");

  for (const cookie of cookies) {
    const [cookieName, cookieValue] = cookie.trim().split("=");

    if (cookieName === name) {
      return decodeURIComponent(cookieValue);
    }
  }

  return null;
}

export function setCookie(
  name: string,
  value: string | number | boolean,
): void {
  document.cookie = `${name}=${encodeURIComponent(value)};path=/`;
}

export function deleteCookie(name: string): void {
  const cookieString = document.cookie;
  const cookies = cookieString.split(";");

  for (const cookie of cookies) {
    const [cookieName] = cookie.trim().split("=");

    if (cookieName === name) {
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
      break;
    }
  }
}
