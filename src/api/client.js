const BASE_URL = process.env.REACT_APP_API_BASE_URL || '';

export async function fetchData(endpoint) {
  const response = await fetch(`${BASE_URL}/api/${endpoint}`);
  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }
  return response.json();
}

export async function postData(endpoint, data) {
  const response = await fetch(`${BASE_URL}/api/${endpoint}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }
  return response.json();
}
