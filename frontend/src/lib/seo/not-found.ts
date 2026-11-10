function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function notFoundResponse(options?: { title?: string; message?: string }): Response {
  const title = options?.title ?? 'Page not found';
  const message = options?.message ?? 'That page does not exist. Try a trek or a guide from the links below.';
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(title)} | Global Events Travels</title>
  <meta name="robots" content="noindex, follow" />
  <link rel="icon" type="image/png" href="/logo-fevicon.png" />
  <style>
    body { margin: 0; font-family: Inter, system-ui, sans-serif; background: #f8fafc; color: #0f172a; }
    main { max-width: 40rem; margin: 0 auto; padding: 4rem 1.25rem; }
    p { color: #475569; line-height: 1.6; }
    a { color: #c2410c; font-weight: 600; }
    ul { padding-left: 1.1rem; }
    li { margin: 0.4rem 0; }
  </style>
</head>
<body>
  <main>
    <p>Global Events Travels</p>
    <h1>${escapeHtml(title)}</h1>
    <p>${escapeHtml(message)}</p>
    <ul>
      <li><a href="/treks">Browse treks</a></li>
      <li><a href="/blog">Read trek guides</a></li>
      <li><a href="/">Back to the homepage</a></li>
    </ul>
  </main>
</body>
</html>`;

  return new Response(html, {
    status: 404,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'X-Robots-Tag': 'noindex, follow',
      'Cache-Control': 'no-store',
    },
  });
}
