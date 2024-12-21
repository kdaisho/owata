/**
 * @param {string} data
 * @param {string} endpoint
 * @returns {Promise<string[]>}
 */
export async function submitText(data, endpoint) {
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "text/plain",
    },
    body: data,
  })

  return await response.json()
}