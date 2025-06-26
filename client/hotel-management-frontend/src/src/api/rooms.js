const BASE_URL = 'http://127.0.0.1:5000';

export async function getRooms() {
  const res = await fetch(`${BASE_URL}/rooms`);
  if (!res.ok) throw new Error('Failed to fetch rooms');
  return res.json();
}
