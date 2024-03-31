/**
 * 判断字符串是否 base64
 * @param str 
 * @returns 
 */
function isBase64(str: string) {
  if (str === '' || str.trim() === '') { 
      return false; 
  }
  try {
      return btoa(atob(str)) === str;
  } catch (err) {
      return false;
  }
}

export {
  isBase64,
}