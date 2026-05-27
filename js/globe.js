/* =====================================================
   NEXGLOBE Globe Canvas Animation
   ===================================================== */
(function() {
  const canvas = document.getElementById('globe-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let W, H, cx, cy, radius;
  let rotation = 0;
  let animId;

  const resize = () => {
    W = canvas.width = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
    cx = W / 2;
    cy = H / 2;
    radius = Math.min(W, H) * 0.38;
  };
  window.addEventListener('resize', resize);
  resize();

  // Approximate lat/lng of major trade cities
  const cities = [
    { lat: 25.2,  lng: 55.3,  name: 'Dubai' },
    { lat: 51.5,  lng: -0.1,  name: 'London' },
    { lat: 40.7,  lng: -74.0, name: 'New York' },
    { lat: 35.7,  lng: 139.7, name: 'Tokyo' },
    { lat: 22.3,  lng: 114.2, name: 'Hong Kong' },
    { lat: 1.3,   lng: 103.8, name: 'Singapore' },
    { lat: 48.9,  lng: 2.3,   name: 'Paris' },
    { lat: 55.8,  lng: 37.6,  name: 'Moscow' },
    { lat: -33.9, lng: 18.4,  name: 'Cape Town' },
    { lat: 19.1,  lng: 72.9,  name: 'Mumbai' },
    { lat: 24.7,  lng: 46.7,  name: 'Riyadh' },
    { lat: 29.4,  lng: 47.9,  name: 'Kuwait' },
    { lat: 26.2,  lng: 50.6,  name: 'Bahrain' },
    { lat: 23.6,  lng: 58.6,  name: 'Muscat' },
    { lat: 37.6,  lng: -122.4,name: 'San Francisco' },
  ];

  // Trade routes (pairs by index)
  const routes = [
    [0,1],[0,2],[0,4],[0,5],[0,8],[0,9],[0,10],[0,11],[0,12],[0,13],
    [1,4],[1,3],[2,14],[4,5],[5,3],[3,6]
  ];

  // Animated ships along routes
  const ships = routes.map(r => ({ route: r, t: Math.random(), speed: 0.001 + Math.random() * 0.002, dir: Math.random() > 0.5 ? 1 : -1 }));

  function latLngTo3D(lat, lng) {
    const phi = (90 - lat) * Math.PI / 180;
    const theta = (lng + rotation) * Math.PI / 180;
    return {
      x: radius * Math.sin(phi) * Math.cos(theta),
      y: radius * Math.cos(phi),
      z: radius * Math.sin(phi) * Math.sin(theta)
    };
  }

  function project(x, y, z) {
    // Simple orthographic projection
    return { x: cx + x, y: cy - y, visible: z > -radius * 0.2 };
  }

  function lerpLatLng(a, b, t) {
    return {
      lat: a.lat + (b.lat - a.lat) * t,
      lng: a.lng + (b.lng - a.lng) * t
    };
  }

  function drawGlobe() {
    ctx.clearRect(0, 0, W, H);

    // Outer glow
    const grd = ctx.createRadialGradient(cx, cy, radius * 0.3, cx, cy, radius * 1.2);
    grd.addColorStop(0, 'rgba(0,43,127,0.4)');
    grd.addColorStop(0.6, 'rgba(0,31,91,0.15)');
    grd.addColorStop(1, 'transparent');
    ctx.fillStyle = grd;
    ctx.beginPath();
    ctx.arc(cx, cy, radius * 1.2, 0, Math.PI * 2);
    ctx.fill();

    // Globe base
    const globeGrd = ctx.createRadialGradient(cx - radius * 0.3, cy - radius * 0.3, 0, cx, cy, radius);
    globeGrd.addColorStop(0, 'rgba(10,36,88,0.7)');
    globeGrd.addColorStop(1, 'rgba(0,16,64,0.9)');
    ctx.fillStyle = globeGrd;
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.fill();

    // Latitude lines
    for (let lat = -60; lat <= 60; lat += 30) {
      const pts = [];
      for (let lng = 0; lng <= 360; lng += 5) {
        const p3 = latLngTo3D(lat, lng);
        const p = project(p3.x, p3.y, p3.z);
        if (p.visible) pts.push(p);
      }
      if (pts.length < 2) continue;
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(212,175,55,0.1)';
      ctx.lineWidth = 0.5;
      pts.forEach((p, i) => i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y));
      ctx.stroke();
    }

    // Longitude lines
    for (let lng = 0; lng < 360; lng += 30) {
      const pts = [];
      for (let lat = -90; lat <= 90; lat += 5) {
        const p3 = latLngTo3D(lat, lng);
        const p = project(p3.x, p3.y, p3.z);
        if (p.visible) pts.push(p);
      }
      if (pts.length < 2) continue;
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(212,175,55,0.1)';
      ctx.lineWidth = 0.5;
      pts.forEach((p, i) => i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y));
      ctx.stroke();
    }

    // Trade routes
    routes.forEach(([ai, bi]) => {
      const a = cities[ai], b = cities[bi];
      const pts = [];
      for (let t = 0; t <= 1; t += 0.02) {
        const ll = lerpLatLng(a, b, t);
        const p3 = latLngTo3D(ll.lat, ll.lng);
        const p = project(p3.x, p3.y, p3.z);
        if (p.visible) pts.push({ ...p, t });
      }
      if (pts.length < 2) return;
      ctx.beginPath();
      const lineGrd = ctx.createLinearGradient(pts[0].x, pts[0].y, pts[pts.length-1].x, pts[pts.length-1].y);
      lineGrd.addColorStop(0, 'rgba(212,175,55,0.15)');
      lineGrd.addColorStop(0.5, 'rgba(240,210,122,0.5)');
      lineGrd.addColorStop(1, 'rgba(212,175,55,0.15)');
      ctx.strokeStyle = lineGrd;
      ctx.lineWidth = 1;
      pts.forEach((p, i) => i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y));
      ctx.stroke();
    });

    // Moving ships on routes
    ships.forEach(ship => {
      ship.t += ship.speed * ship.dir;
      if (ship.t > 1 || ship.t < 0) { ship.dir *= -1; ship.t = Math.max(0, Math.min(1, ship.t)); }
      const [ai, bi] = ship.route;
      const a = cities[ai], b = cities[bi];
      const ll = lerpLatLng(a, b, ship.t);
      const p3 = latLngTo3D(ll.lat, ll.lng);
      const p = project(p3.x, p3.y, p3.z);
      if (!p.visible) return;
      ctx.beginPath();
      ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(240,210,122,0.9)';
      ctx.shadowBlur = 8;
      ctx.shadowColor = '#D4AF37';
      ctx.fill();
      ctx.shadowBlur = 0;
    });

    // City nodes
    cities.forEach(city => {
      const p3 = latLngTo3D(city.lat, city.lng);
      const p = project(p3.x, p3.y, p3.z);
      if (!p.visible) return;
      // Glow pulse
      const pulse = (Math.sin(Date.now() * 0.002 + city.lat) + 1) * 0.5;
      ctx.beginPath();
      ctx.arc(p.x, p.y, 4 + pulse * 3, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(212,175,55,${0.15 + pulse * 0.1})`;
      ctx.fill();
      // Dot
      ctx.beginPath();
      ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
      ctx.fillStyle = '#D4AF37';
      ctx.shadowBlur = 10;
      ctx.shadowColor = '#D4AF37';
      ctx.fill();
      ctx.shadowBlur = 0;
    });

    // Globe border highlight
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    const borderGrd = ctx.createLinearGradient(cx - radius, cy - radius, cx + radius, cy + radius);
    borderGrd.addColorStop(0, 'rgba(212,175,55,0.5)');
    borderGrd.addColorStop(0.5, 'rgba(212,175,55,0.1)');
    borderGrd.addColorStop(1, 'rgba(212,175,55,0.3)');
    ctx.strokeStyle = borderGrd;
    ctx.lineWidth = 1.5;
    ctx.stroke();

    rotation += 0.07;
    animId = requestAnimationFrame(drawGlobe);
  }

  drawGlobe();
})();
