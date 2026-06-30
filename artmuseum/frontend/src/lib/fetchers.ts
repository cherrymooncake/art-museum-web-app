// lib/fetchers.ts
export async function fetchExhibitions() {
  const res = await fetch('http://localhost:4000/artmuseum/exhibitions', {
    cache: 'no-store',
  });
  if (!res.ok) throw new Error('Failed to fetch exhibitions');
  return res.json();
}

export async function fetchArtworks() {
  const res = await fetch('http://localhost:4000/artmuseum/artworks', {
    cache: 'no-store',
  });
  if (!res.ok) throw new Error('Failed to fetch artworks');
  return res.json();
}
