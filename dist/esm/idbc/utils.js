/**
 * 获取随机字符串
 */
export var getRandomString = function getRandomString() {
  return Math.random().toString(32).slice(2);
};