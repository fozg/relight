export function getFromStore(key: string) {
  try {
    var str = localStorage.getItem(key)
    let result = JSON.parse(str)
    return result
  } catch (e) {
    return null
  }
}

export function saveToStore(key: string, data: any) {
  return localStorage.setItem(key, JSON.stringify(data))
}
