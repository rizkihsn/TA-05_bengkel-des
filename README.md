# Bengkel DES: Simulasi Kejadian Diskrit Bengkel 2 Montir

Pemodelan dan Simulasi (TA-05). Website statis (HTML, CSS, JavaScript murni) yang menampilkan:
animasi bengkel, grafik, perbandingan dengan JaamSim, dan hitung manual (hand simulation).

## Struktur
```
index.html          halaman utama
css/style.css       tampilan (tema gelap/terang)
js/engine.js        mesin DES (clock, event calendar, antrian)
js/ui.js            tab, animasi canvas, grafik SVG, hitung manual
notebook/           implementasi Python (.ipynb) dengan model yang sama
vercel.json         konfigurasi deploy Vercel
```

## Deploy ke Vercel
1. Push folder ini ke repositori GitHub.
2. Di vercel.com pilih **Add New, Project**, lalu import repositori itu.
3. Framework Preset: **Other**. Build Command dan Output Directory dikosongkan (situs statis).
4. Klik **Deploy**.

aplikasi website : https://ta-05-bengkel-des.vercel.app/ 
