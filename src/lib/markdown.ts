export function convertMarkdown(text: string): string {
  const lines = text.split('\n');
  let html = '';
  let inList = false;

  for (const line of lines) {
    if (line.startsWith('### ')) {
      if (inList) { html += '</ul>'; inList = false; }
      html += '<h3>' + line.slice(4) + '</h3>';
    } else if (line.startsWith('## ')) {
      if (inList) { html += '</ul>'; inList = false; }
      html += '<h2>' + line.slice(3) + '</h2>';
    } else if (line.startsWith('# ')) {
      if (inList) { html += '</ul>'; inList = false; }
      html += '<h1>' + line.slice(2) + '</h1>';
    } else if (line.startsWith('- ') || line.startsWith('* ')) {
      if (!inList) { html += '<ul>'; inList = true; }
      html += '<li>' + line.slice(2) + '</li>';
    } else if (line.startsWith('> ')) {
      if (inList) { html += '</ul>'; inList = false; }
      html += '<blockquote>' + line.slice(2) + '</blockquote>';
    } else if (line.trim() === '') {
      if (inList) { html += '</ul>'; inList = false; }
      html += '<br>';
    } else {
      if (inList) { html += '</ul>'; inList = false; }
      let processed = line.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
      processed = processed.replace(/`(.+?)`/g, '<code>$1</code>');
      html += '<p>' + processed + '</p>';
    }
  }
  if (inList) html += '</ul>';
  return html;
}
