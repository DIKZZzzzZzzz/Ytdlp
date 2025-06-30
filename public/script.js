async function download() {
  const url = document.getElementById("url").value;
  const resultDiv = document.getElementById("result");
  resultDiv.innerHTML = "⏳ Mengambil data video...";

  try {
    const res = await fetch(`/api/ytdl?url=${encodeURIComponent(url)}`);
    const data = await res.json();

    if (!data.status) return resultDiv.innerHTML = "❌ " + data.message;

    let html = `
      <h2>${data.title}</h2>
      <img src="${data.thumbnail}" />
      <p><b>Durasi:</b> ${formatDuration(data.duration)}</p>
      <p><b>Deskripsi:</b> ${data.description?.slice(0, 150)}...</p>
      <h3>🎯 Pilih Kualitas:</h3>
      <ul>
    `;

    data.formats.slice(0, 10).forEach(f => {
      html += `
        <li>
          🔹 <a href="${f.url}" target="_blank">
            ${f.quality || f.ext} (${(f.filesize / 1024 / 1024).toFixed(1)} MB)
          </a>
        </li>
      `;
    });

    html += "</ul>";
    resultDiv.innerHTML = html;
  } catch (e) {
    resultDiv.innerHTML = "❌ Terjadi kesalahan saat memproses.";
  }
}

function formatDuration(seconds) {
  const min = Math.floor(seconds / 60);
  const sec = seconds % 60;
  return `${min}m ${sec}s`;
}