const API_URL = '/api/blocks'; // Adjust as needed

export async function getBlocks() {
  const res = await fetch(API_URL);
  if (!res.ok) throw new Error('Failed to fetch blocks');
  return res.json();
}

export async function updateBlock(id: string, content: string) {
  const res = await fetch(`${API_URL}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content }),
  });
  if (!res.ok) throw new Error('Failed to update block');
  return res.json();
} 