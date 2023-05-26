export function newSessionId() {
  return [
    randomStr(8),
    randomStr(4),
    randomStr(4),
    randomStr(4),
    randomStr(12),
  ].join("-");
}

const characters = "abcdefghijklmnopqrstuvwxyz0123456789";
const charactersLength = characters.length;
function randomStr(len: number) {
  let result = "";
  for (let i = 0; i < len; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}
