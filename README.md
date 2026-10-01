# 🏊‍♂️ SwimCoach Pro - Mobile PWA

Aplicación móvil (PWA) de alto rendimiento para entrenadores de natación, diseñada para calcular en tiempo real los ritmos de entrenamiento, zonas fisiológicas, control de pulso y diseño de series en el borde de la pileta.

Basada en la metodología y fórmulas exactas de entrenamiento deportivo:
- **Zonas Fisiológicas**: A1, A2 (80% y 85%), MVO2 / USRPT (90% y 95%), TL (Tolerancia al Lactato), RL (Resistencia al Lactato) y VEL (Velocidad Pura).
- **Proyecciones de Carrera**: Objetivos de mejora (-3%) y base de entrenamiento (+3%).
- **Control Cardíaco**: Frecuencia Cardíaca Máxima ($220 - \text{edad}$) y control de pulso en 5 segundos ($\text{BPM} / 12$).
- **Estilos y Pruebas**: Libre (50m a 1500m), Pecho, Espalda, Mariposa (50m a 200m) y Combinado (100m a 400m).

---

## 📱 Instalación en el Celular (PWA)

Esta aplicación está optimizada como Progressive Web App y puede ser instalada sin pasar por tiendas:
1. Abre el enlace en el navegador de tu celular (Safari en iPhone o Chrome en Android).
2. Presiona el botón de **Compartir** o los **3 puntos** del menú.
3. Selecciona **"Añadir a la pantalla de inicio"** (o *"Instalar aplicación"*).
4. ¡Listo! Tendrás el icono de la aplicación en tu pantalla de inicio y funcionará incluso sin conexión a internet.

---

## 🚀 Tecnologías

- **React 18 + TypeScript**
- **Vite 6**
- **Tailwind CSS**
- **Lucide Icons**
- **Vite Plugin PWA** (Service Worker offline)
- **Local Storage API** (Persistencia local en el dispositivo del entrenador)

---

## 🛠️ Desarrollo Local

```bash
git clone https://github.com/joaquindev65/swimcoach-app.git
cd swimcoach-app
npm install
npm run dev
```
