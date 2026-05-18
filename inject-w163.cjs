#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const htmlFile = path.join(__dirname, 'public', 'cosmos-infinite.html');
const html = fs.readFileSync(htmlFile, 'utf8');

const styleIdx = html.lastIndexOf('</style>');
const sceneIdx = html.lastIndexOf('</a-scene>');
const bodyIdx = html.lastIndexOf('</body>');

if (styleIdx === -1 || sceneIdx === -1 || bodyIdx === -1) {
  console.error('ERROR: Missing required HTML anchors');
  process.exit(1);
}

const cssCode = `

      /* W163: MERKABA HUD/DASHBOARD TELEMETRY SYSTEM */
      #dashboardContainer {
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 580px;
        height: 380px;
        z-index: 1000;
        background: rgba(10, 20, 40, 0.92);
        border: 2px solid #00d4ff;
        border-radius: 12px;
        box-shadow: 0 0 40px rgba(0, 212, 255, 0.4), inset 0 0 30px rgba(0, 212, 255, 0.08);
        display: none;
        flex-direction: column;
        font-family: 'Monaco', 'Courier New', monospace;
        color: #00ff99;
        padding: 20px;
        opacity: 0;
        transition: opacity 0.3s ease;
        backdrop-filter: blur(8px);
      }
      #dashboardContainer.active { display: flex; opacity: 1; }
      .dashboard-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-bottom: 1px solid rgba(0, 212, 255, 0.3);
        padding-bottom: 10px;
        margin-bottom: 15px;
        font-size: 0.9rem;
        letter-spacing: 0.1em;
      }
      .dashboard-title {
        font-size: 1.1rem;
        font-weight: bold;
        color: #00d4ff;
        text-transform: uppercase;
      }
      .dashboard-timestamp {
        font-size: 0.75rem;
        color: #00ff99;
        opacity: 0.7;
      }
      .dashboard-content {
        flex: 1;
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 12px;
        overflow-y: auto;
      }
      .telemetry-widget {
        background: rgba(0, 50, 100, 0.4);
        border: 1px solid rgba(0, 212, 255, 0.2);
        border-radius: 6px;
        padding: 10px;
        display: flex;
        flex-direction: column;
        justify-content: center;
      }
      .widget-label {
        font-size: 0.7rem;
        color: #888;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        margin-bottom: 4px;
      }
      .widget-value {
        font-size: 1.3rem;
        font-weight: bold;
        color: #00ff99;
        font-variant-numeric: tabular-nums;
      }
      .widget-unit {
        font-size: 0.65rem;
        color: #00d4ff;
        margin-left: 4px;
      }
      .gauge-widget { grid-column: span 2; }
      .gauge-bar {
        width: 100%;
        height: 20px;
        background: rgba(0, 20, 50, 0.6);
        border: 1px solid rgba(0, 212, 255, 0.3);
        border-radius: 3px;
        overflow: hidden;
        margin-top: 6px;
      }
      .gauge-fill {
        height: 100%;
        background: linear-gradient(90deg, #00ff99 0%, #00d4ff 50%, #9b5cff 100%);
        width: 0%;
        transition: width 0.2s ease;
        box-shadow: 0 0 10px rgba(0, 255, 153, 0.5);
      }
      .dashboard-footer {
        border-top: 1px solid rgba(0, 212, 255, 0.3);
        padding-top: 10px;
        margin-top: 10px;
        display: flex;
        gap: 8px;
        justify-content: space-between;
      }
      .dashboard-btn {
        background: rgba(0, 212, 255, 0.1);
        border: 1px solid rgba(0, 212, 255, 0.4);
        color: #00d4ff;
        padding: 6px 12px;
        border-radius: 4px;
        cursor: pointer;
        font-size: 0.7rem;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        transition: all 0.2s ease;
      }
      .dashboard-btn:hover { background: rgba(0, 212, 255, 0.2); box-shadow: 0 0 15px rgba(0, 212, 255, 0.3); }
      .dashboard-btn.active { background: rgba(0, 255, 153, 0.2); border-color: #00ff99; color: #00ff99; }
      #dashboardMenu {
        position: fixed;
        bottom: 20px;
        right: 20px;
        z-index: 1001;
        display: flex;
        flex-direction: column;
        gap: 8px;
      }
      .menu-btn {
        background: rgba(0, 212, 255, 0.12);
        border: 1px solid rgba(0, 212, 255, 0.4);
        color: #00d4ff;
        padding: 8px 14px;
        border-radius: 6px;
        cursor: pointer;
        font-size: 0.75rem;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        font-family: 'Monaco', monospace;
        transition: all 0.2s ease;
      }
      .menu-btn:hover { background: rgba(0, 212, 255, 0.22); box-shadow: 0 0 20px rgba(0, 212, 255, 0.3); }
      .menu-btn.active { background: rgba(0, 255, 153, 0.2); border-color: #00ff99; color: #00ff99; box-shadow: 0 0 20px rgba(0, 255, 153, 0.4); }
      .dashboard-content::-webkit-scrollbar { width: 6px; }
      .dashboard-content::-webkit-scrollbar-track { background: rgba(0, 212, 255, 0.05); }
      .dashboard-content::-webkit-scrollbar-thumb { background: rgba(0, 212, 255, 0.3); border-radius: 3px; }
      .dashboard-content::-webkit-scrollbar-thumb:hover { background: rgba(0, 212, 255, 0.5); }
`;

const htmlCode = `
    <!-- W163: MERKABA HUD/DASHBOARD TELEMETRY -->
    <div id="dashboardContainer">
      <div class="dashboard-header">
        <div class="dashboard-title" id="dashboardTitle">CARS DASHBOARD</div>
        <div class="dashboard-timestamp" id="dashboardTimestamp">--:--:--</div>
      </div>
      <div class="dashboard-content" id="dashboardContent"></div>
      <div class="dashboard-footer">
        <button class="dashboard-btn" onclick="switchDashboard('cars')">CARS</button>
        <button class="dashboard-btn" onclick="switchDashboard('aircraft')">AIRCRAFT</button>
        <button class="dashboard-btn" onclick="switchDashboard('medical')">MEDICAL</button>
        <button class="dashboard-btn" onclick="switchDashboard('remote')">REMOTE</button>
        <button class="dashboard-btn" onclick="switchDashboard('crane')">CRANE</button>
      </div>
    </div>
    <div id="dashboardMenu">
      <button class="menu-btn active" onclick="toggleDashboard()">DASHBOARD</button>
      <button class="menu-btn" onclick="rotateDashboard('left')">&lt; ROT</button>
      <button class="menu-btn" onclick="rotateDashboard('right')">ROT &gt;</button>
    </div>
`;

const jsCode = `
    <script>
      const MAL_DASHBOARD_LIBRARY = {
        cars: {
          title: 'CARS DASHBOARD',
          category: 'GROUND_VEHICLE',
          merkaba: { sector: 2, latticeNode: 6 },
          widgets: [
            { id: 'speed', label: 'SPEED', unit: 'km/h', value: 0, max: 300, isGauge: true },
            { id: 'rpm', label: 'RPM', unit: 'x100', value: 0, max: 8000 },
            { id: 'fuel', label: 'FUEL', unit: '%', value: 75, max: 100, isGauge: true },
            { id: 'temp', label: 'TEMP', unit: String.fromCharCode(176) + 'C', value: 85, max: 120 },
            { id: 'battery', label: 'BATTERY', unit: 'V', value: 12.6, max: 15 },
            { id: 'odometer', label: 'ODO', unit: 'km', value: 45230 }
          ]
        },
        aircraft: {
          title: 'AIRCRAFT DASHBOARD',
          category: 'AIR_VEHICLE',
          merkaba: { sector: 3, latticeNode: 12 },
          widgets: [
            { id: 'altitude', label: 'ALTITUDE', unit: 'ft', value: 0, max: 50000, isGauge: true },
            { id: 'airspeed', label: 'AIRSPEED', unit: 'kt', value: 0, max: 500 },
            { id: 'heading', label: 'HEADING', unit: String.fromCharCode(176), value: 0, max: 360 },
            { id: 'fuel', label: 'FUEL', unit: 'lbs', value: 10000, max: 20000, isGauge: true },
            { id: 'vsi', label: 'VSI', unit: 'ft/min', value: 0, max: 3000 },
            { id: 'aoa', label: 'AOA', unit: String.fromCharCode(176), value: 5, max: 30 }
          ]
        },
        medical: {
          title: 'MEDICAL DASHBOARD',
          category: 'BIOMETRIC',
          merkaba: { sector: 6, latticeNode: 32 },
          widgets: [
            { id: 'heart_rate', label: 'HEART RATE', unit: 'bpm', value: 72, max: 200, isGauge: true },
            { id: 'spo2', label: 'SpO2', unit: '%', value: 98, max: 100 },
            { id: 'systolic', label: 'SYS', unit: 'mmHg', value: 120, max: 200 },
            { id: 'diastolic', label: 'DIA', unit: 'mmHg', value: 80, max: 130 },
            { id: 'temp', label: 'TEMP', unit: String.fromCharCode(176) + 'C', value: 37.0, max: 40 },
            { id: 'glucose', label: 'GLUCOSE', unit: 'mg/dL', value: 95, max: 400, isGauge: true }
          ]
        },
        remote: {
          title: 'REMOTE DASHBOARD',
          category: 'REMOTE_CONTROL',
          merkaba: { sector: 5, latticeNode: 26 },
          widgets: [
            { id: 'signal', label: 'SIGNAL', unit: 'dBm', value: -45, max: 0, isGauge: true },
            { id: 'battery', label: 'BATTERY', unit: '%', value: 85, max: 100 },
            { id: 'latency', label: 'LATENCY', unit: 'ms', value: 25, max: 500 },
            { id: 'packets', label: 'PACKETS', unit: 'tx/s', value: 120, max: 1000 },
            { id: 'link_quality', label: 'LINK', unit: '%', value: 98, max: 100, isGauge: true },
            { id: 'uptime', label: 'UPTIME', unit: 'h', value: 143.5 }
          ]
        },
        crane: {
          title: 'CRANE DASHBOARD',
          category: 'HEAVY_EQUIPMENT',
          merkaba: { sector: 7, latticeNode: 38 },
          widgets: [
            { id: 'load', label: 'LOAD', unit: 'tons', value: 2.5, max: 5, isGauge: true },
            { id: 'height', label: 'HEIGHT', unit: 'm', value: 8.3, max: 50 },
            { id: 'tilt', label: 'TILT', unit: String.fromCharCode(176), value: 1.2, max: 15 },
            { id: 'stress', label: 'STRESS', unit: '%', value: 42, max: 100, isGauge: true },
            { id: 'wind', label: 'WIND', unit: 'km/h', value: 12, max: 50 },
            { id: 'hydraulic', label: 'HYDRAULIC', unit: 'bar', value: 210, max: 280 }
          ]
        }
      };

      let currentDashboard = 'cars';
      let dashboardVisible = false;
      let dashboardRotation = 0;

      const telemetrySimulators = {
        cars: () => ({ speed: Math.floor(Math.random() * 150) + 20, rpm: Math.floor(Math.random() * 6000) + 800, fuel: Math.max(20, 75 - Math.random() * 10), temp: 80 + Math.random() * 20, battery: 12 + Math.random() * 2, odometer: 45230 + Math.floor(Math.random() * 50) }),
        aircraft: () => ({ altitude: Math.floor(Math.random() * 30000) + 1000, airspeed: Math.floor(Math.random() * 400) + 100, heading: Math.floor(Math.random() * 360), fuel: Math.floor(Math.random() * 15000) + 5000, vsi: Math.floor(Math.random() * 2000) - 1000, aoa: Math.random() * 15 + 2 }),
        medical: () => ({ heart_rate: Math.floor(Math.random() * 40) + 60, spo2: Math.floor(Math.random() * 4) + 96, systolic: Math.floor(Math.random() * 30) + 110, diastolic: Math.floor(Math.random() * 20) + 70, temp: 36.8 + Math.random() * 0.8, glucose: Math.floor(Math.random() * 80) + 85 }),
        remote: () => ({ signal: Math.floor(Math.random() * 20) - 50, battery: Math.max(20, 85 - Math.random() * 15), latency: Math.floor(Math.random() * 100) + 10, packets: Math.floor(Math.random() * 400) + 200, link_quality: Math.max(85, 98 - Math.random() * 10), uptime: 143.5 + Math.random() * 0.5 }),
        crane: () => ({ load: Math.random() * 4 + 0.5, height: Math.random() * 40 + 2, tilt: Math.random() * 5 + 0.5, stress: Math.random() * 50 + 20, wind: Math.floor(Math.random() * 30) + 5, hydraulic: Math.floor(Math.random() * 50) + 200 })
      };

      function renderDashboard() {
        const dashboard = MAL_DASHBOARD_LIBRARY[currentDashboard];
        if (!dashboard) return;
        const container = document.getElementById('dashboardContent');
        container.innerHTML = '';
        const telemetry = telemetrySimulators[currentDashboard]();

        dashboard.widgets.forEach(w => {
          const v = telemetry[w.id];
          const pct = (v / w.max) * 100;
          const div = document.createElement('div');
          div.className = 'telemetry-widget' + (w.isGauge ? ' gauge-widget' : '');
          let html = '<div class="widget-label">' + w.label + '</div>';
          html += '<div style="display: flex; align-items: ' + (w.isGauge ? 'center' : 'baseline') + '; justify-content: space-between;">';
          html += '<div class="widget-value">' + (typeof v === 'number' && v % 1 !== 0 ? v.toFixed(1) : v) + '</div>';
          html += '<div class="widget-unit">' + w.unit + '</div></div>';
          if (w.isGauge) html += '<div class="gauge-bar"><div class="gauge-fill" style="width: ' + Math.min(100, pct) + '%"></div></div>';
          div.innerHTML = html;
          container.appendChild(div);
        });

        document.getElementById('dashboardTitle').textContent = dashboard.title;
        const now = new Date();
        document.getElementById('dashboardTimestamp').textContent = now.toLocaleTimeString('en-US', { hour12: false });
        document.querySelectorAll('.dashboard-footer .dashboard-btn').forEach(b => b.classList.remove('active'));
        const ab = document.querySelector('.dashboard-footer .dashboard-btn[onclick="switchDashboard(\'' + currentDashboard + '\')"]');
        if (ab) ab.classList.add('active');
      }

      function toggleDashboard() {
        const c = document.getElementById('dashboardContainer');
        dashboardVisible = !dashboardVisible;
        c.classList.toggle('active', dashboardVisible);
        document.querySelector('#dashboardMenu .menu-btn').classList.toggle('active', dashboardVisible);
      }

      function switchDashboard(t) {
        if (MAL_DASHBOARD_LIBRARY[t]) { currentDashboard = t; renderDashboard(); }
      }

      function rotateDashboard(d) {
        const c = document.getElementById('dashboardContainer');
        dashboardRotation += d === 'left' ? -30 : 30;
        c.style.transform = 'translate(-50%, -50%) rotateZ(' + dashboardRotation + 'deg)';
      }

      renderDashboard();
      setInterval(renderDashboard, 500);
      console.log('%c🚀 W163: Merkaba HUD/Dashboard Telemetry', 'color: #00d4ff; font-weight: bold;');
      console.log('📊 MAL Dashboard Library: Cars, Aircraft, Medical, Remote, Crane');
    </script>
`;

const step1 = html.slice(0, styleIdx) + cssCode + html.slice(styleIdx);
const step2 = step1.slice(0, sceneIdx) + htmlCode + step1.slice(sceneIdx);
const final = step2.slice(0, bodyIdx) + jsCode + step2.slice(bodyIdx);

fs.writeFileSync(htmlFile, final, 'utf8');

console.log('\n✅ W163 WAVE INJECTION COMPLETE\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n📊 Merkaba HUD/Dashboard Telemetry System\n\n✨ Dashboards:\n   • CARS: Speed, RPM, Fuel, Temp, Battery, Odometer\n   • AIRCRAFT: Altitude, Speed, Heading, Fuel, VSI, AOA\n   • MEDICAL: Heart Rate, SpO2, BP, Temp, Glucose\n   • REMOTE: Signal, Battery, Latency, Link Quality\n   • CRANE: Load, Height, Tilt, Stress, Wind, Hydraulic\n\n📡 Telemetry:\n   • Animated gauges with real-time updates (500ms)\n   • Merkaba-EIGHT sector alignment\n   • Dashboard switching + rotation\n   • MAL Library organization\n\n💾 Updated: public/cosmos-infinite.html\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
