/*
|--------------------------------------------------------------------------
| 补充参数validate校验逻辑，某些参数校验逻辑复杂，单独处理
|--------------------------------------------------------------------------
*/

export function validatePassword(password: string): boolean {
  const stringReg = /[a-zA-Z]/;
  const numberReg = /\d/;
  if (password.length < 8) {
    return false
  }
  if (!password.match(stringReg)) {
    return false;
  }
  if (!password.match(numberReg)) {
    return false;
  }
  return true
}
