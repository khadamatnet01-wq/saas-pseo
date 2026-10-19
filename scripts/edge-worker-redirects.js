export default {
  async fetch(request) {
    const url = new URL(request.url);
    const compareMatch = url.pathname.match(/^\/compare\/([a-z0-9-]+)-vs-([a-z0-9-]+)\/?$/);
    if (compareMatch) {
      const [, slugA, slugB] = compareMatch;
      const [first, second] = [slugA, slugB].sort((a, b) => a.localeCompare(b));
      const canonicalPath = `/compare/${first}-vs-${second}`;
      if (url.pathname !== canonicalPath) {
        url.pathname = canonicalPath;
        return Response.redirect(url.toString(), 301);
      }
    }

    if (url.pathname.length > 1 && url.pathname.endsWith('/')) {
      url.pathname = url.pathname.slice(0, -1);
      return Response.redirect(url.toString(), 301);
    }

    const response = await fetch(request);
    const newHeaders = new Headers(response.headers);
    newHeaders.set('Cache-Control', 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800');
    newHeaders.set('X-Content-Type-Options', 'nosniff');

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: newHeaders
    });
  }
};
