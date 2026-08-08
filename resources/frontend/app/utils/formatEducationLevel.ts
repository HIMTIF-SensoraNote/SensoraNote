export const formatEducationLevel = (
  jenjang: string, 
  kelas: string | number, 
  semester: number, 
  lang: string,
  t?: any
): string => {
  if (t) {
      const jLevel = t(`edu_levels.${jenjang}`) !== `edu_levels.${jenjang}` ? t(`edu_levels.${jenjang}`) : jenjang;
      const cNum = String(kelas);
      const cStr = t('edu_levels.class_format', { num: cNum }).includes('edu_levels.') ? `Kelas ${cNum}` : t('edu_levels.class_format', { num: cNum });
      const sStr = t('edu_levels.semester_format', { num: semester }).includes('edu_levels.') ? `Semester ${semester}` : t('edu_levels.semester_format', { num: semester });
      return `${jLevel} ${cStr} • ${sStr}`;
  }
  // Common fallback maps
  const levelMap: Record<string, Record<string, string>> = {
    'id': { 'SD': 'SD', 'SMP': 'SMP', 'SMA': 'SMA', 'SMK': 'SMK', 'Kuliah': 'Kuliah' },
    'en': { 'SD': 'Elementary', 'SMP': 'Middle School', 'SMA': 'High School', 'SMK': 'Vocational', 'Kuliah': 'College' },
    'ja': { 'SD': '小学校', 'SMP': '中学校', 'SMA': '高校', 'SMK': '専門学校', 'Kuliah': '大学' },
    'ko': { 'SD': '초등학교', 'SMP': '중학교', 'SMA': '고등학교', 'SMK': '직업학교', 'Kuliah': '대학교' },
    'zh': { 'SD': '小学', 'SMP': '初中', 'SMA': '高中', 'SMK': '职高', 'Kuliah': '大学' },
    'es': { 'SD': 'Primaria', 'SMP': 'Secundaria', 'SMA': 'Preparatoria', 'SMK': 'Vocacional', 'Kuliah': 'Universidad' },
    'fr': { 'SD': 'Primaire', 'SMP': 'Collège', 'SMA': 'Lycée', 'SMK': 'Professionnel', 'Kuliah': 'Université' },
    'de': { 'SD': 'Grundschule', 'SMP': 'Mittelschule', 'SMA': 'Gymnasium', 'SMK': 'Berufsschule', 'Kuliah': 'Universität' },
    'pt': { 'SD': 'Primário', 'SMP': 'Ginásio', 'SMA': 'Ensino Médio', 'SMK': 'Vocacional', 'Kuliah': 'Universidade' },
    'ru': { 'SD': 'Начальная школа', 'SMP': 'Средняя школа', 'SMA': 'Старшая школа', 'SMK': 'ПТУ', 'Kuliah': 'Университет' }
  };

  const getLevel = (j: string) => levelMap[lang]?.[j] || j;

  const kNum = Number(kelas);
  const isNumericKelas = !isNaN(kNum);

  if (lang === 'zh') {
    const chnLevel = jenjang === 'SMA' || jenjang === 'SMK' ? '高' : jenjang === 'SMP' ? '初' : jenjang === 'SD' ? '小' : '大';
    let classStr = String(kelas);
    
    if (isNumericKelas) {
      let year = 1;
      if (jenjang === 'SD') year = kNum;
      else if (jenjang === 'SMP') year = kNum - 6;
      else if (jenjang === 'SMA' || jenjang === 'SMK') year = kNum - 9;
      else year = kNum;

      const zhNumbers = ['一', '二', '三', '四', '五', '六', '七', '八', '九', '十'];
      classStr = `${chnLevel}${zhNumbers[year - 1] || year}`;
    }

    const zhSemNumbers = ['一', '二', '三', '四', '五', '六', '七', '八'];
    const semStr = (semester === 1 || semester === 2) 
      ? (semester === 1 ? '上学期' : '下学期') 
      : `第${zhSemNumbers[semester - 1] || semester}学期`;
      
    return `${classStr} • ${semStr}`;
  } 
  
  if (lang === 'ja') {
    let classStr = String(kelas);
    if (isNumericKelas) {
      let year = 1;
      if (jenjang === 'SD') year = kNum;
      else if (jenjang === 'SMP') year = kNum - 6;
      else if (jenjang === 'SMA' || jenjang === 'SMK') year = kNum - 9;
      else year = kNum;
      classStr = `${year}年生`;
    }
    const jpnLevel = getLevel(jenjang);
    const semStr = (semester === 1 || semester === 2)
      ? (semester === 1 ? '前期' : '後期')
      : `${semester}学期`;
    return `${jpnLevel} ${classStr} • ${semStr}`;
  }

  if (lang === 'ko') {
    let classStr = String(kelas);
    if (isNumericKelas) {
      let year = 1;
      if (jenjang === 'SD') year = kNum;
      else if (jenjang === 'SMP') year = kNum - 6;
      else if (jenjang === 'SMA' || jenjang === 'SMK') year = kNum - 9;
      else year = kNum;
      classStr = `${year}학년`;
    }
    const korLevel = getLevel(jenjang);
    return `${korLevel} ${classStr} • ${semester}학기`;
  }

  const defaultClass = isNumericKelas ? `Grade ${kelas}` : String(kelas);
  
  if (lang === 'en') return `${defaultClass} • Sem ${semester}`;
  if (lang === 'es' || lang === 'pt') return `${isNumericKelas ? `Grado ${kelas}` : String(kelas)} • Sem ${semester}`;
  if (lang === 'fr') return `${isNumericKelas ? `Année ${kelas}` : String(kelas)} • Sem ${semester}`;
  if (lang === 'de') return `${isNumericKelas ? `Klasse ${kelas}` : String(kelas)} • Sem ${semester}`;
  if (lang === 'ru') return `${isNumericKelas ? `${kelas} Класс` : String(kelas)} • ${semester} Семестр`;

  return `${isNumericKelas ? `Kelas ${kelas}` : String(kelas)} • Semester ${semester}`;
};

export const formatClassOption = (jenjang: string, kelas: string | number, lang: string, t?: any): string => {
  if (kelas === 'Semua' || kelas === '-') return String(kelas);

  if (t) {
      const cNum = String(kelas);
      const cStr = t('edu_levels.class_format', { num: cNum });
      if (!cStr.includes('edu_levels.')) return cStr;
  }

  const kNum = Number(kelas);
  const isNumericKelas = !isNaN(kNum);

  if (lang === 'zh') {
    if (!isNumericKelas) return String(kelas);
    const chnLevel = jenjang === 'SMA' || jenjang === 'SMK' ? '高' : jenjang === 'SMP' ? '初' : jenjang === 'SD' ? '小' : '大';
    let year = 1;
    if (jenjang === 'SD') year = kNum;
    else if (jenjang === 'SMP') year = kNum - 6;
    else if (jenjang === 'SMA' || jenjang === 'SMK') year = kNum - 9;
    else year = kNum;
    const zhNumbers = ['一', '二', '三', '四', '五', '六', '七', '八', '九', '十'];
    return `${chnLevel}${zhNumbers[year - 1] || year}`;
  }

  if (lang === 'ja') return isNumericKelas ? `${kelas}年生` : String(kelas);
  if (lang === 'ko') return isNumericKelas ? `${kelas}학년` : String(kelas);
  if (lang === 'en') return isNumericKelas ? `Grade ${kelas}` : String(kelas);
  if (lang === 'es' || lang === 'pt') return isNumericKelas ? `Grado ${kelas}` : String(kelas);
  if (lang === 'fr') return isNumericKelas ? `Année ${kelas}` : String(kelas);
  if (lang === 'de') return isNumericKelas ? `Klasse ${kelas}` : String(kelas);
  if (lang === 'ru') return isNumericKelas ? `${kelas} Класс` : String(kelas);

  return isNumericKelas ? `Kelas ${kelas}` : String(kelas);
};

export const formatSemesterOption = (semester: number, lang: string, t?: any): string => {
  if (t) {
      const sStr = t('edu_levels.semester_format', { num: semester });
      if (!sStr.includes('edu_levels.')) return sStr;
  }
  if (lang === 'zh') {
    const zhSemNumbers = ['一', '二', '三', '四', '五', '六', '七', '八'];
    return (semester === 1 || semester === 2) 
      ? (semester === 1 ? '上学期' : '下学期') 
      : `第${zhSemNumbers[semester - 1] || semester}学期`;
  }
  if (lang === 'ja') return (semester === 1 || semester === 2) ? (semester === 1 ? '前期' : '後期') : `${semester}学期`;
  if (lang === 'ko') return `${semester}학기`;
  if (lang === 'ru') return `${semester} Семестр`;
  return `Semester ${semester}`;
};
