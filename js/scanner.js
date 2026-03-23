(function() {
    function applyScannerLayout() {
      const overlay = document.getElementById('scanner-overlay');
      const dialog = document.getElementById('scanner-dialog');
      const mobileHdr = document.getElementById('scanner-mobile-header');
      const closeBtn = document.getElementById('scanner-close-btn');
      const viewport = document.getElementById('scanner-viewport');
      const box = document.getElementById('scanner-box');

      // Same dialog style on all screen sizes.
      // Full-screen blurred backdrop, centered floating card
      overlay.style.background = 'rgba(10,14,20,0.92)';
      overlay.style.backdropFilter = 'blur(12px)';
      overlay.style.alignItems = 'center';
      overlay.style.justifyContent = 'center';
      overlay.style.top = overlay.style.left = overlay.style.right = overlay.style.bottom = '0';
      overlay.style.flexDirection = 'column';
      overlay.style.overflowY = 'auto';
      overlay.style.padding = '0';  // Card handles its own max width.

      // Dialog card uses CSS sizing, no JS pixel math.
      dialog.style.cssText = `
    width: min(480px, calc(100vw - 2rem));
    max-height: min(92vh, 92dvh);
    background: #111620;
    border: 1px solid #1e2736;
    border-radius: 20px;
    padding: 0;
    box-shadow: 0 24px 80px rgba(0,0,0,0.8);
    flex: none;
    overflow: hidden;
    position: relative;
    display: flex;
    flex-direction: column;
    box-sizing: border-box;
    animation: scannerIn 0.22s ease;
  `;

      // Always hide mobile header (header lives inside the card)
      mobileHdr.style.display = 'none';

      // Ensure desktop header exists inside dialog
      let deskHdr = document.getElementById('scanner-desk-header');
      if (!deskHdr) {
        deskHdr = document.createElement('div');
        deskHdr.id = 'scanner-desk-header';
        deskHdr.style.cssText = 'padding:1.5rem 1.5rem 0;flex-shrink:0;';
        deskHdr.innerHTML = `
      <div style="font-family:'Syne',sans-serif;font-size:1.25rem;font-weight:800;color:#e8edf5;text-align:center;margin-bottom:4px;">Scan Barcode</div>
      <div style="font-size:0.78rem;color:#5a6680;text-align:center;">Point camera at barcode or enter manually</div>`;
        dialog.insertBefore(deskHdr, dialog.firstChild);
      }
      deskHdr.style.display = 'block';

      // Close button in the top-right corner of the dialog card.
      closeBtn.style.cssText = `
    position:absolute;top:0.85rem;right:0.85rem;z-index:10;
    width:36px;height:36px;border-radius:50%;
    border:1px solid #1e2736;background:#171d28;
    color:#e8edf5;font-size:1rem;
    display:flex;align-items:center;justify-content:center;
    cursor:pointer;touch-action:manipulation;-webkit-tap-highlight-color:transparent;
    transition:all 0.2s;
  `;
      if (closeBtn.parentElement !== dialog) dialog.insertBefore(closeBtn, dialog.firstChild);

      // Camera viewport height
      const vpHeight = window.innerWidth <= 480 ? '280px'
        : window.innerWidth <= 768 ? '260px'
          : '300px';
      viewport.style.height = vpHeight;

      // Reset box layout; CSS handles sizing via the wrapper padding.
      box.style.margin = '';
      box.style.width = '';
      box.style.maxWidth = '';
      box.style.boxSizing = '';
      box.style.borderRadius = '12px';
      box.style.overflow = 'hidden';
    }

    // Inject keyframe once
    if (!document.getElementById('scanner-kf')) {
      const s = document.createElement('style');
      s.id = 'scanner-kf';
      s.textContent = '@keyframes scannerIn{from{opacity:0;transform:scale(0.96) translateY(10px)}to{opacity:1;transform:scale(1) translateY(0)}}';
      document.head.appendChild(s);
    }

    function openScanner() {
      const overlay = document.getElementById('scanner-overlay');
      overlay.style.display = 'flex';
      applyScannerLayout();
      const cameraWrap = document.getElementById('scanner-camera-wrap');
      if (cameraWrap) cameraWrap.style.display = 'block';
      const sr = document.getElementById('scan-result');
      const nd = document.getElementById('new-drug-card');
      if (sr) sr.style.display = 'none';
      if (nd) nd.style.display = 'none';
      document.getElementById('manual-barcode').value = '';
      document.getElementById('scanner-status').textContent = 'Ready - point camera at barcode';
      document.getElementById('scanner-status').style.color = '#5a6680';
      startCamera();
    }

    function closeScanner() {
      document.getElementById('scanner-overlay').style.display = 'none';
      stopCamera();
    }

    function scanAgain() {
      const cameraWrap = document.getElementById('scanner-camera-wrap');
      if (cameraWrap) cameraWrap.style.display = 'block';
      document.getElementById('scan-result').style.display = 'none';
      document.getElementById('new-drug-card').style.display = 'none';
      document.getElementById('manual-barcode').value = '';
      document.getElementById('scanner-status').textContent = 'Ready - point camera at barcode';
      document.getElementById('scanner-status').style.color = '#5a6680';
      scanCounts = {}; // FIX: reset stale counts so previous barcode can't trigger instantly
      const scrollArea = document.querySelector('#scanner-dialog > div:last-child');
      if (scrollArea) scrollArea.scrollTop = 0;
      startCamera();
    }

    let zxingReader = null;
    let zxingActive = false;
    let scanCounts = {}; // Require consistent reads before accepting a barcode.

    let barcodeDetector = null;
    let barcodeDetectorFrame = null;
    let zxingScriptPromise = null;

    function ensureZXingLoaded() {
      if (window.ZXing) return Promise.resolve(window.ZXing);
      if (zxingScriptPromise) return zxingScriptPromise;

      zxingScriptPromise = new Promise((resolve, reject) => {
        const existingScript = document.getElementById('zxing-runtime');
        if (existingScript) {
          existingScript.addEventListener('load', () => resolve(window.ZXing), { once: true });
          existingScript.addEventListener('error', () => reject(new Error('Unable to load scanner library')), { once: true });
          return;
        }

        const script = document.createElement('script');
        script.id = 'zxing-runtime';
        script.src = 'https://unpkg.com/@zxing/library@0.19.1/umd/index.min.js';
        script.onload = () => resolve(window.ZXing);
        script.onerror = () => reject(new Error('Unable to load scanner library'));
        document.head.appendChild(script);
      }).catch((error) => {
        zxingScriptPromise = null;
        throw error;
      });

      return zxingScriptPromise;
    }

    function getRequiredReads() {
      return window.innerWidth <= 768 ? 1 : 2;
    }

    function handleDetectedCode(code) {
      if (!code) return;
      scanCounts[code] = (scanCounts[code] || 0) + 1;
      if (scanCounts[code] >= getRequiredReads()) {
        stopCamera();
        const cameraWrap = document.getElementById('scanner-camera-wrap');
        if (cameraWrap) cameraWrap.style.display = 'none';
        document.getElementById('manual-barcode').value = code;
        document.getElementById('scanner-status').textContent = 'Captured: ' + code;
        document.getElementById('scanner-status').style.color = '#00c97b';
        lookupBarcode(code);
      } else {
        document.getElementById('scanner-status').textContent = 'Confirming...';
        document.getElementById('scanner-status').style.color = '#00d4aa';
      }
    }

    async function tuneCameraTrack(track) {
      if (!track?.getCapabilities || !track?.applyConstraints) return;
      const caps = track.getCapabilities();
      const advanced = [];
      if (Array.isArray(caps.focusMode) && caps.focusMode.includes('continuous')) advanced.push({ focusMode: 'continuous' });
      if (Array.isArray(caps.exposureMode) && caps.exposureMode.includes('continuous')) advanced.push({ exposureMode: 'continuous' });
      if (Array.isArray(caps.whiteBalanceMode) && caps.whiteBalanceMode.includes('continuous')) advanced.push({ whiteBalanceMode: 'continuous' });
      // Zoom intentionally removed: applyConstraints zoom on iOS resets focusMode to manual, killing autofocus.
      if (!advanced.length) return;
      try {
        await track.applyConstraints({ advanced });
      } catch (error) {
        console.warn('Camera tuning skipped', error);
      }
    }

    function startBarcodeDetectorLoop(video, onFallback) {
      if (!('BarcodeDetector' in window)) return false;
      try {
        barcodeDetector = new window.BarcodeDetector({
          formats: ['ean_13', 'ean_8', 'upc_a', 'upc_e', 'code_128', 'code_39', 'itf', 'data_matrix', 'qr_code']
        });
      } catch (error) {
        barcodeDetector = null;
        return false;
      }

      // Fall back on wall-clock time rather than frame count so behavior stays
      // consistent across slower and faster mobile browsers.
      const fallbackDeadline = Date.now() + 2500;

      const detectFrame = async () => {
        if (!zxingActive || !barcodeDetector) return;
        try {
          if (video.readyState >= 2) {
            const codes = await barcodeDetector.detect(video);
            if (codes?.length) {
              const rawValue = codes[0].rawValue || codes[0].rawText || '';
              if (rawValue) {
                handleDetectedCode(rawValue);
                return; // success -- stop loop
              }
            }
            if (Date.now() >= fallbackDeadline) {
              console.warn('BarcodeDetector: timed out -- switching to ZXing');
              barcodeDetector = null;
              if (barcodeDetectorFrame) {
                cancelAnimationFrame(barcodeDetectorFrame);
                barcodeDetectorFrame = null;
              }
              document.getElementById('scanner-status').textContent = 'Trying compatibility scan...';
              document.getElementById('scanner-status').style.color = '#f5c96a';
              if (onFallback) onFallback();
              return;
            }
          }
        } catch (error) {
          console.warn('BarcodeDetector failed -- switching to ZXing', error);
          barcodeDetector = null;
          if (barcodeDetectorFrame) {
            cancelAnimationFrame(barcodeDetectorFrame);
            barcodeDetectorFrame = null;
          }
          document.getElementById('scanner-status').textContent = 'Trying compatibility scan...';
          document.getElementById('scanner-status').style.color = '#f5c96a';
          if (onFallback) onFallback();
          return;
        }
        barcodeDetectorFrame = requestAnimationFrame(detectFrame);
      };

      barcodeDetectorFrame = requestAnimationFrame(detectFrame);
      return true;
    }

    function startCamera() {
      if (zxingActive) return;
      document.getElementById('scanner-box').classList.add('scanning');
      document.getElementById('scanner-status').textContent = 'Starting camera...';
      document.getElementById('scanner-status').style.color = '#5a6680';
      scanCounts = {};

      const video = document.getElementById('scanner-video');

      navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: 'environment' },
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      }).then(async stream => {
        video.srcObject = stream;
        video.setAttribute('playsinline', true);
        const track = stream.getVideoTracks?.()[0];
        await tuneCameraTrack(track);
        await video.play();

        zxingActive = true;
        document.getElementById('scanner-status').textContent = 'Point camera at barcode';
        document.getElementById('scanner-status').style.color = '#00d4aa';

        // FIX: use decodeFromStream, NOT decodeFromVideoElement.
        // decodeFromVideoElement re-calls getUserMedia internally, creating a second
        // competing stream. On iOS Safari this causes ZXing to decode a frozen/black
        // frame and never detect any barcode.
        async function startZXing() {
          if (!zxingActive || zxingReader) return;
          try {
            await ensureZXingLoaded();
            const hints = new Map();
            hints.set(ZXing.DecodeHintType.POSSIBLE_FORMATS, [
              ZXing.BarcodeFormat.EAN_13,
              ZXing.BarcodeFormat.EAN_8,
              ZXing.BarcodeFormat.CODE_128,
              ZXing.BarcodeFormat.CODE_39,
              ZXing.BarcodeFormat.UPC_A,
              ZXing.BarcodeFormat.UPC_E,
              ZXing.BarcodeFormat.ITF,
              ZXing.BarcodeFormat.DATA_MATRIX,
              ZXing.BarcodeFormat.QR_CODE,
            ]);
            hints.set(ZXing.DecodeHintType.TRY_HARDER, true);
            zxingReader = new ZXing.BrowserMultiFormatReader(hints, 300);
            document.getElementById('scanner-status').textContent = 'Compatibility scan active';
            document.getElementById('scanner-status').style.color = '#00d4aa';
            zxingReader.decodeFromStream(stream, video, (result) => {
              if (!result) return;
              const code = result.getText();
              if (!code) return;
              handleDetectedCode(code);
              return;
              const requiredReads = getRequiredReads();
              scanCounts[code] = (scanCounts[code] || 0) + 1;
              if (scanCounts[code] >= requiredReads) {
                stopCamera();
                document.getElementById('manual-barcode').value = code;
                document.getElementById('scanner-status').textContent = 'Captured: ' + code;
                document.getElementById('scanner-status').style.color = '#00c97b';
                lookupBarcode(code);
              } else {
                document.getElementById('scanner-status').textContent = 'Confirming...';
                document.getElementById('scanner-status').style.color = '#00d4aa';
              }
            });
          } catch (e) {
            console.error('ZXing error', e);
            document.getElementById('scanner-status').textContent = 'Scanner error -- use manual input';
            document.getElementById('scanner-status').style.color = '#ff6b35';
            document.getElementById('scanner-box').classList.remove('scanning');
          }
        }

        // Try native BarcodeDetector first (fastest on Android Chrome).
        // startZXing is passed as fallback: if BarcodeDetector goes ~3s without
        // a read, it automatically hands off to ZXing.
        const usingNative = startBarcodeDetectorLoop(video, startZXing);
        if (!usingNative) {
          startZXing(); // BarcodeDetector unavailable -- go straight to ZXing
        }

      }).catch(err => {
        const msg = err.name === 'NotAllowedError'
          ? 'Camera permission denied - type barcode below'
          : err.name === 'NotFoundError'
            ? 'No camera found - type barcode below'
            : 'Camera unavailable -- use manual input below';
        document.getElementById('scanner-status').textContent = msg;
        document.getElementById('scanner-status').style.color = '#ff6b35';
        document.getElementById('scanner-box').classList.remove('scanning');
      });
    }
    function stopCamera() {
      if (barcodeDetectorFrame) {
        cancelAnimationFrame(barcodeDetectorFrame);
        barcodeDetectorFrame = null;
      }
      barcodeDetector = null;
      if (zxingReader) {
        try { zxingReader.reset(); } catch (e) { }
        zxingReader = null;
      }
      zxingActive = false;
      scanCounts = {};
      document.getElementById('scanner-box').classList.remove('scanning');
      // Stop all video tracks to release camera LED
      const video = document.getElementById('scanner-video');
      if (video) {
        if (video.srcObject) {
          video.srcObject.getTracks().forEach(t => t.stop());
          video.srcObject = null;
        }
        video.load(); // reset video element
      }
    }

    function lookupBarcode(code) {
      const input = code || document.getElementById('manual-barcode').value.trim();
      if (!input) return;
      const cameraWrap = document.getElementById('scanner-camera-wrap');
      if (cameraWrap) cameraWrap.style.display = 'none';

      const med = inventory.find(m => m.barcode === input);
      const statusEl = document.getElementById('scanner-status');
      const resultEl = document.getElementById('scan-result');

      if (!med) {
        // Smart new-barcode flow.
        // Step 1: parse locally first for an instant result.
        const dm = parseDataMatrix(input);

        resultEl.style.display = 'none';
        document.getElementById('new-drug-card').style.display = 'none';

        if (dm.isFMD) {
          // DataMatrix already contains structured data, then enrich in background.
          // then enrich with name from BDPM in background
          statusEl.textContent = 'DataMatrix decoded - loading name...';
          statusEl.style.color = '#00d4aa';
          showNewDrugCard(input, {
            name: '', generic: dm.cip13 ? `CIP: ${dm.cip13}` : '',
            mfr: '', expiry: dm.expiry, batch: dm.batch, cip: dm.cip13,
            source: 'DataMatrix/FMD'
          }, dm);
          // Update the card in the background when lookup finishes.
          enrichInBackground(input, dm);
        } else {
          // EAN-13 and other 1D barcodes open the add form immediately.
          // run online lookup in background, update card when done
          statusEl.textContent = 'New barcode - opening form...';
          statusEl.style.color = '#00d4aa';
          showNewDrugCard(input, { name: '', generic: '', mfr: '', expiry: '', source: '' }, dm);
          // Background lookup updates the card silently without blocking UX.
          enrichInBackground(input, dm);
        }
        return;
      }

      statusEl.textContent = `Found: ${med.name}`;
      statusEl.style.color = '#00c97b';

      document.getElementById('result-name').textContent = med.name + (med.generic ? ` (${med.generic})` : '');
      document.getElementById('result-barcode').textContent = '# ' + med.barcode;
      document.getElementById('result-box-price').textContent = '$' + med.price_box.toFixed(2);
      const up = med.units_per_box ? (med.price_box / med.units_per_box).toFixed(2) : '-';
      document.getElementById('result-unit-price').textContent = '$' + up;
      document.getElementById('result-stock').textContent = med.stock + ' boxes';
      document.getElementById('result-expiry').textContent = med.expiry;
      document.getElementById('result-location').textContent = med.shelf || 'Unknown';
      document.getElementById('result-zone').textContent = med.zone;

      let sb = '';
      if (med.stock === 0) sb = '<span class="stock-badge stock-out">Out of Stock</span>';
      else if (med.stock <= med.reorder) sb = '<span class="stock-badge stock-low">Low</span>';
      else sb = '<span class="stock-badge stock-ok">In Stock</span>';
      document.getElementById('result-stock-badge').innerHTML = sb;
      resultEl.style.display = 'block';

      const now = new Date();
      const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
      scanHistory.unshift({ name: med.name, barcode: med.barcode, time: timeStr });
      if (scanHistory.length > 50) scanHistory.pop();
      if (document.querySelector('.page.active')?.id === 'page-dashboard' && typeof globalThis.renderDashboard === 'function') {
        globalThis.renderDashboard();
      }
      window._lastScannedMed = med;
    }

    // Show new-drug card immediately with whatever data we have
    function showNewDrugCard(barcode, drug, dm) {
      dm = dm || {};
      window._pendingNewBarcode = barcode;
      window._pendingNewDrug = drug;

      const nameEl = document.getElementById('nd-name');
      const genericEl = document.getElementById('nd-generic');
      const mfrEl = document.getElementById('nd-mfr');
      const barcodeEl = document.getElementById('nd-barcode');
      const expiryRow = document.getElementById('nd-expiry-row');
      const batchRow = document.getElementById('nd-batch-row');
      const expiryVal = document.getElementById('nd-expiry-val');
      const batchVal = document.getElementById('nd-batch-val');

      nameEl.textContent = drug.name || '...';
      nameEl.style.color = drug.name ? '#e8edf5' : '#5a6680';
      genericEl.textContent = drug.generic || (dm.isFMD ? `CIP: ${dm.cip13 || '-'}` : '-');
      mfrEl.textContent = drug.mfr || '-';
      barcodeEl.textContent = barcode + (dm.isFMD ? ' - DataMatrix/FMD' : '');

      if (drug.expiry || dm.expiry) {
        expiryRow.style.display = 'block';
        expiryVal.textContent = drug.expiry || dm.expiry;
      } else {
        expiryRow.style.display = 'none';
      }
      if (dm.batch) {
        batchRow.style.display = 'block';
        batchVal.textContent = dm.batch;
      } else {
        batchRow.style.display = 'none';
      }

      document.getElementById('new-drug-card').style.display = 'block';
    }

    // Background enrichment runs online lookups silently.
    // ============================
    // GLOBAL LOOKUP ENGINE
    // Detects barcode origin from GS1 prefix, picks best sources first
    // Works across multiple regions and falls back globally.
    // ============================

    // Detect region from GS1 country prefixes.
    function detectRegion(barcode) {
      if (!barcode || barcode.length < 3) return 'global';
      const p3 = parseInt(barcode.substring(0, 3));
      const p2 = parseInt(barcode.substring(0, 2));
      // France: 30-37
      if (p2 >= 30 && p2 <= 37) return 'france';
      // USA and Canada: 000-139
      if (p3 >= 0 && p3 <= 139) return 'usa';
      // Cambodia: 884
      if (p3 === 884) return 'cambodia';
      // Thailand: 885
      if (p3 === 885) return 'thailand';
      // Vietnam: 893
      if (p3 === 893) return 'vietnam';
      // China: 690-699
      if (p3 >= 690 && p3 <= 699) return 'china';
      // India: 890
      if (p3 === 890) return 'india';
      // Japan: 45x, 49x
      if ((p3 >= 450 && p3 <= 459) || (p3 >= 490 && p3 <= 499)) return 'japan';
      // Korea: 880
      if (p3 === 880) return 'korea';
      // Other EU ranges use the generic EU fallback.
      if ((p2 >= 40 && p2 <= 44) || p2 === 50 || p2 === 54 || p2 === 57 || p2 === 87 || p2 === 88) return 'eu';
      return 'global';
    }

    async function enrichInBackground(barcode, dm) {
      const statusEl = document.getElementById('scanner-status');

      if (!navigator.onLine) {
        statusEl.textContent = dm.isFMD ? 'DataMatrix decoded - offline' : 'Offline - fill manually';
        statusEl.style.color = dm.isFMD ? '#00d4aa' : '#ff6b35';
        return;
      }

      const searchCode = dm.cip13 || barcode;
      const cip7 = searchCode.length >= 7 ? searchCode.slice(-7) : '';
      const region = detectRegion(barcode);

      // Build source list with region-specific sources first.
      // All run in parallel, first winner used, 5s hard timeout
      const sources = [];

      // Region-priority sources
      if (region === 'france') {
        sources.push(lookupBDPM(searchCode, cip7));           // Best for France
        sources.push(lookupOpenFoodFacts(barcode, 'fr'));
      } else if (region === 'cambodia' || region === 'thailand' || region === 'vietnam') {
        sources.push(lookupOpenFoodFacts(barcode, 'asia'));    // Best regional coverage
        sources.push(lookupUPCItemDB(barcode));               // Global barcode DB
        sources.push(lookupGoUPC(barcode));                   // Strong Asian coverage
      } else if (region === 'usa') {
        sources.push(lookupOpenFDA(barcode));                 // Best for USA
        sources.push(lookupRxNorm(barcode));
      } else if (region === 'india') {
        sources.push(lookupOpenFoodFacts(barcode, 'asia'));
        sources.push(lookupOpenFDA(barcode));                 // Many Indian pharma in FDA
        sources.push(lookupUPCItemDB(barcode));
      }

      // Global fallbacks are always included.
      sources.push(lookupOpenFoodFacts(barcode, 'global'));
      sources.push(lookupUPCItemDB(barcode));
      sources.push(lookupGoUPC(barcode));
      sources.push(lookupOpenFDA(barcode));
      sources.push(lookupRxNorm(barcode));
      if (region !== 'france') sources.push(lookupBDPM(searchCode, cip7)); // still try for EU drugs sold in Asia

      try {
        const results = await Promise.race([
          Promise.allSettled(sources),
          new Promise(res => setTimeout(() => res([]), 5000))
        ]);

        let found = null;
        for (const r of (results || [])) {
          if (r?.status === 'fulfilled' && r.value?.name) {
            found = r.value;
            break;
          }
        }

        if (found) {
          window._pendingNewDrug = {
            ...window._pendingNewDrug,
            name: found.name || window._pendingNewDrug.name,
            generic: found.generic || window._pendingNewDrug.generic,
            mfr: found.mfr || window._pendingNewDrug.mfr,
            category: found.category || window._pendingNewDrug.category,
            source: found.source,
          };
          const nameEl = document.getElementById('nd-name');
          const genericEl = document.getElementById('nd-generic');
          const mfrEl = document.getElementById('nd-mfr');
          if (nameEl && document.getElementById('new-drug-card').style.display !== 'none') {
            if (found.name) { nameEl.textContent = found.name; nameEl.style.color = '#e8edf5'; }
            if (found.generic) genericEl.textContent = found.generic;
            if (found.mfr) mfrEl.textContent = found.mfr;
          }
          const flag = { france: '[FR]', cambodia: '[KH]', thailand: '[TH]', vietnam: '[VN]', usa: '[US]', india: '[IN]', china: '[CN]', japan: '[JP]', korea: '[KR]', eu: '[EU]', global: '[Global]' };
          statusEl.textContent = `${flag[region] || '[Global]'} Found: ${found.name} - ${found.source}`;
          statusEl.style.color = '#00c97b';
        } else {
          statusEl.textContent = dm.isFMD
            ? 'DataMatrix decoded - name not found'
            : 'Not found globally - add manually';
          statusEl.style.color = dm.isFMD ? '#00d4aa' : '#ff6b35';
        }
      } catch (e) {
        statusEl.textContent = dm.isFMD ? 'DataMatrix decoded' : 'Lookup failed - add manually';
        statusEl.style.color = dm.isFMD ? '#00d4aa' : '#ff6b35';
      }
    }

    // BDPM: French official drug database (CIP codes).
    async function lookupBDPM(code, cip7) {
      const codes = [code, cip7].filter(Boolean);
      for (const c of codes) {
        try {
          const r = await fetch(`https://api.medicaments.fr/v1/medicaments?cip=${c}`, { signal: AbortSignal.timeout(3000) });
          if (r.ok) {
            const d = await r.json();
            const item = Array.isArray(d) ? d[0] : d;
            if (item?.denomination || item?.nom) {
              return {
                name: item.denomination || item.nom,
                generic: item.substance_active || item.denominationCommune || '',
                mfr: item.titulaire || item.laboratoire || '',
                source: 'BDPM France'
              };
            }
          }
        } catch (e) { }
      }
      return null;
    }

    // Open Food Facts: global product database.
    async function lookupOpenFoodFacts(code, hint) {
      try {
        const r = await fetch(
          `https://world.openfoodfacts.org/api/v0/product/${code}.json`,
          { signal: AbortSignal.timeout(4000) }
        );
        const d = await r.json();
        if (d.status === 1 && d.product) {
          const p = d.product;
          // Pick best name: prefer local language, fallback to English
          const name = p.product_name_fr || p.product_name_km ||
            p.product_name || p.product_name_en || '';
          if (name) {
            return {
              name,
              generic: p.generic_name || p.generic_name_en || '',
              mfr: p.brands || p.manufacturing_places || '',
              source: 'Open Food Facts'
            };
          }
        }
      } catch (e) { }
      return null;
    }

    // UPC Item DB: global barcode database.
    async function lookupUPCItemDB(code) {
      try {
        const r = await fetch(
          `https://api.upcitemdb.com/prod/trial/lookup?upc=${code}`,
          { signal: AbortSignal.timeout(4000) }
        );
        if (r.ok) {
          const d = await r.json();
          const item = d?.items?.[0];
          if (item?.title) {
            return {
              name: item.title,
              generic: item.description || '',
              mfr: item.brand || '',
              source: 'UPC Item DB'
            };
          }
        }
      } catch (e) { }
      return null;
    }

    // Go-UPC: global barcode lookup.
    async function lookupGoUPC(code) {
      try {
        // go-upc.com free lookup (no key required for basic use)
        const r = await fetch(
          `https://go-upc.com/api/v1/code/${code}`,
          { signal: AbortSignal.timeout(4000) }
        );
        if (r.ok) {
          const d = await r.json();
          if (d?.product?.name) {
            return {
              name: d.product.name,
              generic: d.product.description || '',
              mfr: d.product.brand || '',
              source: 'Go-UPC Global'
            };
          }
        }
      } catch (e) { }
      return null;
    }

    // OpenFDA: US FDA database.
    async function lookupOpenFDA(code) {
      const endpoints = [
        `https://api.fda.gov/drug/ndc.json?search=package_ndc:"${code}"&limit=1`,
        `https://api.fda.gov/drug/label.json?search=openfda.upc:"${code}"&limit=1`,
      ];
      for (const url of endpoints) {
        try {
          const r = await fetch(url, { signal: AbortSignal.timeout(3500) });
          const d = await r.json();
          const item = d?.results?.[0];
          if (item) {
            const ofd = item.openfda || {};
            const name = item.brand_name || (ofd.brand_name?.[0]) || item.generic_name || (ofd.generic_name?.[0]) || '';
            if (name) {
              return {
                name,
                generic: item.generic_name || ofd.generic_name?.[0] || '',
                mfr: item.labeler_name || ofd.manufacturer_name?.[0] || '',
                source: 'OpenFDA'
              };
            }
          }
        } catch (e) { }
      }
      return null;
    }

    // RxNorm (NIH): drug name database.
    async function lookupRxNorm(code) {
      try {
        const r = await fetch(
          `https://rxnav.nlm.nih.gov/REST/rxcui.json?idtype=NDC&id=${code}`,
          { signal: AbortSignal.timeout(3000) }
        );
        if (r.ok) {
          const d = await r.json();
          const rxcui = d?.idGroup?.rxnormId?.[0];
          if (rxcui) {
            const r2 = await fetch(
              `https://rxnav.nlm.nih.gov/REST/rxcui/${rxcui}/properties.json`,
              { signal: AbortSignal.timeout(3000) }
            );
            if (r2.ok) {
              const d2 = await r2.json();
              const p = d2?.properties;
              if (p?.name) {
                return { name: p.name, generic: p.synonym || '', mfr: '', source: 'RxNorm (NIH)' };
              }
            }
          }
        }
      } catch (e) { }
      return null;
    }

    function fillScannerWith(barcode) {
      openScanner();
      setTimeout(() => {
        document.getElementById('manual-barcode').value = barcode;
        lookupBarcode(barcode);
      }, 200);
    }

    // ============================
    // DATAMATRIX / GS1 PARSER
    // EU FMD DataMatrix contains GS1 Application Identifiers:
    //   (01) = GTIN/CIP13  (17) = Expiry YYMMDD  (10) = Batch  (21) = Serial
    // ============================
    function parseDataMatrix(raw) {
      const result = { gtin: '', expiry: '', batch: '', serial: '', isFMD: false };
      if (!raw) return result;

      // GS1 DataMatrix format: starts with ]d2 or \u001d (FNC1) or contains (01)
      // Strip leading FNC1 / group separators
      let s = raw.replace(/^\]d2/, '').replace(/\u001d/g, '\x1d');

      // Try structured GS1 parsing (AI prefix in parens or raw)
      const aiMap = {
        '01': 'gtin',   // 14 digits
        '17': 'expiry', // 6 digits YYMMDD
        '10': 'batch',  // variable length, ends at \x1d or next AI
        '21': 'serial', // variable length
        '11': 'mfgDate',
        '30': 'qty',
      };

      // Pattern: groups of (AI)value or raw concatenated
      // Try parenthesized form first: (01)03400936345507(17)261231(10)ABC(21)123
      const parenRe = /\((\d{2,4})\)([^\(]*)/g;
      let m;
      let matched = false;
      while ((m = parenRe.exec(raw)) !== null) {
        matched = true;
        result.isFMD = true;
        const ai = m[1], val = m[2].trim();
        if (ai === '01') result.gtin = val;
        else if (ai === '17') result.expiry = formatGS1Date(val);
        else if (ai === '10') result.batch = val;
        else if (ai === '21') result.serial = val;
      }

      // Raw concatenated GS1 (no parens): 010340093634550717261231...
      if (!matched && raw.length > 14) {
        let pos = 0;
        const rawAIs = { '01': 14, '17': 6, '10': -1, '21': -1, '11': 6, '30': 8 };
        while (pos < s.length) {
          const ai2 = s.substr(pos, 2);
          const ai3 = s.substr(pos, 3);
          const ai4 = s.substr(pos, 4);
          let ai = null, len = 0;
          if (rawAIs[ai2] !== undefined) { ai = ai2; }
          if (ai && rawAIs[ai] > 0) {
            len = rawAIs[ai];
            const val = s.substr(pos + ai.length, len);
            if (ai === '01') { result.gtin = val; result.isFMD = true; }
            else if (ai === '17') { result.expiry = formatGS1Date(val); result.isFMD = true; }
            else if (ai === '10') { result.batch = val; result.isFMD = true; }
            pos += ai.length + len;
          } else if (ai && rawAIs[ai] === -1) {
            // Variable length; read until group separator or end.
            const sep = s.indexOf('\x1d', pos + ai.length);
            const val = sep === -1 ? s.substr(pos + ai.length) : s.substr(pos + ai.length, sep - pos - ai.length);
            if (ai === '10') { result.batch = val; result.isFMD = true; }
            else if (ai === '21') { result.serial = val; result.isFMD = true; }
            pos = sep === -1 ? s.length : sep + 1;
          } else {
            break;
          }
        }
      }

      // Extract CIP13 from GTIN (last 13 digits of 14-digit GTIN, drop leading 0)
      if (result.gtin && result.gtin.length >= 13) {
        result.cip13 = result.gtin.replace(/^0/, '').slice(-13);
      }

      return result;
    }

    function formatGS1Date(s) {
      // Convert YYMMDD into YYYY-MM-DD.
      if (!s || s.length < 6) return '';
      const yy = parseInt(s.substr(0, 2));
      const mm = s.substr(2, 2);
      const dd = s.substr(4, 2) === '00' ? '28' : s.substr(4, 2);
      const yyyy = yy <= 49 ? 2000 + yy : 1900 + yy; // GS1 spec pivot is 49.
      return `${yyyy}-${mm}-${dd}`;
    }


    function openAddFromScan() {
      const drug = window._pendingNewDrug || {};
      const barcode = window._pendingNewBarcode || '';
      closeScanner();

      editId = null;
      document.getElementById('modal-title').textContent = 'Add New Medicine';
      document.getElementById('f-name').value = drug.name || '';
      document.getElementById('f-generic').value = drug.generic || '';
      document.getElementById('f-barcode').value = barcode;
      document.getElementById('f-mfr').value = drug.mfr || '';
      document.getElementById('f-category').value = drug.category || 'Other';
      document.getElementById('f-price-box').value = '';
      document.getElementById('f-units').value = '';
      document.getElementById('f-stock').value = '';
      document.getElementById('f-reorder').value = '10';
      document.getElementById('f-zone').value = 'A - Antibiotics';
      document.getElementById('f-shelf').value = '';
      // Pre-fill expiry from DataMatrix if available
      document.getElementById('f-expiry').value = drug.expiry || '';
      openOverlay('modal-overlay');

      // Focus first empty critical field
      setTimeout(() => {
        const firstEmpty = ['f-name', 'f-price-box', 'f-stock'].find(id => !document.getElementById(id).value);
        if (firstEmpty) document.getElementById(firstEmpty).focus();
      }, 350);
    }


    function highlightOnMap() {
      const med = window._lastScannedMed;
      if (!med) return;
      highlightShelf = med.shelf;
      closeScanner();
      showPage('map');
    }

    async function quickUpdateStock() {
      const med = window._lastScannedMed;
      if (!med) return;
      showStockModal(med, async (n) => {
        try {
          await runWithSessionRetry(() => supabaseService.updateMedicine(med.id, { stock: n }));
          await refreshInventory();
          // FIX: update in-memory reference and re-render card directly.
          // lookupBarcode() would restart the camera while the scanner is still open.
          const updated = inventory.find(m => m.id === med.id);
          if (updated) { window._lastScannedMed = updated; lookupBarcode(updated.barcode); }
          showToast(`Stock updated to ${n} boxes`);
        } catch (error) {
          console.error(error);
          showToast(error.message || 'Unable to update stock', true);
        }
      });
    }

  globalThis.openScanner = openScanner;
  globalThis.closeScanner = closeScanner;
  globalThis.scanAgain = scanAgain;
  globalThis.lookupBarcode = lookupBarcode;
  globalThis.fillScannerWith = fillScannerWith;
  globalThis.parseDataMatrix = parseDataMatrix;
  globalThis.formatGS1Date = formatGS1Date;
  globalThis.openAddFromScan = openAddFromScan;
  globalThis.highlightOnMap = highlightOnMap;
  globalThis.quickUpdateStock = quickUpdateStock;
})();

