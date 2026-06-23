/** 省市区选择 + 智能识别粘贴地址 */

function initAddressForm(root) {
  if (!root || !window.REGIONS) return;

  const provinceSel = root.querySelector('[name="province"]');
  const citySel = root.querySelector('[name="city"]');
  const districtSel = root.querySelector('[name="district"]');
  const detailInput = root.querySelector('[name="detail"]');
  const pasteArea = root.querySelector('#addressPaste');
  const parseBtn = root.querySelector('#parseAddressBtn');

  fillSelect(provinceSel, Object.keys(REGIONS), '请选择省份');

  provinceSel.addEventListener('change', () => {
    const cities = REGIONS[provinceSel.value] ? Object.keys(REGIONS[provinceSel.value]) : [];
    fillSelect(citySel, cities, '请选择城市');
    fillSelect(districtSel, [], '请选择区县');
    citySel.disabled = !provinceSel.value;
    districtSel.disabled = true;
  });

  citySel.addEventListener('change', () => {
    const districts =
      REGIONS[provinceSel.value]?.[citySel.value] || [];
    fillSelect(districtSel, districts, '请选择区县');
    districtSel.disabled = !citySel.value;
  });

  parseBtn?.addEventListener('click', () => {
    const text = pasteArea?.value.trim();
    if (!text) return;
    const parsed = parseAddress(text);
    if (!parsed?.province) {
      showToast?.('未能识别省份，请手动选择或检查地址格式');
      return;
    }
    applyParsedAddress(root, parsed);
    showToast?.('地址已识别，请核对省市区与详细地址');
  });

  citySel.disabled = true;
  districtSel.disabled = true;

  return { provinceSel, citySel, districtSel, detailInput };
}

function fillSelect(sel, options, placeholder) {
  if (!sel) return;
  sel.innerHTML =
    `<option value="">${placeholder}</option>` +
    options.map((o) => `<option value="${o}">${o}</option>`).join('');
}

function applyParsedAddress(root, parsed) {
  const provinceSel = root.querySelector('[name="province"]');
  const citySel = root.querySelector('[name="city"]');
  const districtSel = root.querySelector('[name="district"]');
  const detailInput = root.querySelector('[name="detail"]');

  if (parsed.province && REGIONS[parsed.province]) {
    provinceSel.value = parsed.province;
    provinceSel.dispatchEvent(new Event('change'));
  }

  setTimeout(() => {
    if (parsed.city && [...citySel.options].some((o) => o.value === parsed.city)) {
      citySel.value = parsed.city;
      citySel.dispatchEvent(new Event('change'));
    }
    setTimeout(() => {
      if (parsed.district && [...districtSel.options].some((o) => o.value === parsed.district)) {
        districtSel.value = parsed.district;
      }
      if (parsed.detail) detailInput.value = parsed.detail;
    }, 0);
  }, 0);
}

function parseAddress(text) {
  text = (text || '').replace(/\s+/g, '').replace(/,/g, '，');
  if (!text || !window.REGIONS) return null;

  let province = '';
  let rest = text;

  const provinces = Object.keys(REGIONS);
  for (const p of provinces.sort((a, b) => b.length - a.length)) {
    const idx = text.indexOf(p);
    if (idx === 0 || (idx > 0 && idx < 5)) {
      province = p;
      rest = text.slice(idx + p.length);
      break;
    }
    const short = p.replace(/(省|市|自治区|壮族|回族|维吾尔|特别行政区).*$/g, '');
    if (short.length >= 2 && text.startsWith(short)) {
      province = p;
      rest = text.slice(short.length);
      if (rest.startsWith('省')) rest = rest.slice(1);
      break;
    }
  }

  let city = '';
  let district = '';
  let detail = rest;

  if (province && REGIONS[province]) {
    const cities = Object.keys(REGIONS[province]).sort((a, b) => b.length - a.length);
    for (const c of cities) {
      if (rest.startsWith(c)) {
        city = c;
        detail = rest.slice(c.length);
        break;
      }
      const cAlt = c.replace(/市辖区|县|市/g, '');
      if (cAlt && rest.startsWith(cAlt)) {
        city = c;
        detail = rest.slice(cAlt.length);
        if (detail.startsWith('市') || detail.startsWith('县')) detail = detail.slice(1);
        break;
      }
    }

    if (!city) {
      const m = rest.match(/^(.+?(?:市|州|盟|地区|自治州))/);
      if (m) {
        const guess = m[1];
        const found = cities.find((c) => c.includes(guess.replace(/市$/, '')) || guess.includes(c.replace(/市辖区/, '')));
        if (found) {
          city = found;
          detail = rest.slice(guess.length);
        }
      }
    }

    if (city && REGIONS[province][city]) {
      const districts = REGIONS[province][city].slice().sort((a, b) => b.length - a.length);
      for (const d of districts) {
        if (detail.startsWith(d)) {
          district = d;
          detail = detail.slice(d.length);
          break;
        }
        const dShort = d.replace(/(区|县|市|旗)$/g, '');
        if (dShort.length >= 2 && detail.startsWith(dShort)) {
          district = d;
          detail = detail.slice(dShort.length);
          if (/^[区县市旗]/.test(detail)) detail = detail.slice(1);
          break;
        }
      }
    }
  }

  detail = detail.replace(/^[，、\-—]+/, '').trim();
  return { province, city, district, detail };
}

function getAddressFromForm(form) {
  const province = form.province.value.trim();
  const city = form.city.value.trim();
  const district = form.district.value.trim();
  const detail = form.detail.value.trim();
  const full = `${province}${city}${district}${detail}`;
  return { province, city, district, detail, address: full };
}

function validateAddress(form) {
  const a = getAddressFromForm(form);
  if (!a.province || !a.city || !a.district) return '请选择完整的省、市、区';
  if (!a.detail || a.detail.length < 4) return '请填写详细地址（街道、门牌号等）';
  return null;
}
