export const HIGHLIGHT_COLORS = [
  { id: 'yellow', color: 'var(--hl-yellow)', label: 'Kuning' },
  { id: 'green', color: 'var(--hl-green)', label: 'Hijau' },
  { id: 'blue', color: 'var(--hl-blue)', label: 'Biru' },
  { id: 'red', color: 'var(--hl-red)', label: 'Merah' },
  { id: 'purple', color: 'var(--hl-purple)', label: 'Ungu' },
  { id: 'orange', color: 'var(--hl-orange)', label: 'Oranye' },
];

export const jenjangOptions = [
  { id: 'SD', label: 'SD', kelas: ['1', '2', '3', '4', '5', '6'], kelasLabel: 'Kelas', maxSemester: 2 },
  { id: 'SMP', label: 'SMP', kelas: ['7', '8', '9'], kelasLabel: 'Kelas', maxSemester: 2 },
  { id: 'SMA', label: 'SMA/SMK', kelas: ['10', '11', '12'], kelasLabel: 'Kelas', maxSemester: 2 },
  { id: 'Kuliah', label: 'Kuliah', kelas: ['D3', 'S1/D4', 'S2', 'S3'], kelasLabel: 'Strata', maxSemester: 8 }
];

export const getFormulaPresets = (t: (key: string) => string): Record<string, { label: string; latex: string }[]> => ({
  [t('formulas.cat_matematika') !== 'formulas.cat_matematika' ? t('formulas.cat_matematika') : 'Matematika']: [
    { label: t('formulas.lbl_kuadrat') !== 'formulas.lbl_kuadrat' ? t('formulas.lbl_kuadrat') : 'Rumus abc (Kuadrat)', latex: 'x_{1,2} = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}' },
    { label: t('formulas.lbl_pythagoras') !== 'formulas.lbl_pythagoras' ? t('formulas.lbl_pythagoras') : 'Pythagoras', latex: 'a^2 + b^2 = c^2' },
    { label: t('formulas.lbl_luas_lingkaran') !== 'formulas.lbl_luas_lingkaran' ? t('formulas.lbl_luas_lingkaran') : 'Luas Lingkaran', latex: 'A = \\pi r^2' },
    { label: t('formulas.lbl_integral') !== 'formulas.lbl_integral' ? t('formulas.lbl_integral') : 'Integral Tentu', latex: '\\int_{a}^{b} f(x) \\, dx' },
    { label: t('formulas.lbl_limit') !== 'formulas.lbl_limit' ? t('formulas.lbl_limit') : 'Limit Mendekati', latex: '\\lim_{x \\to \\infty} f(x)' },
    { label: t('formulas.lbl_sigma') !== 'formulas.lbl_sigma' ? t('formulas.lbl_sigma') : 'Deret (Sigma)', latex: '\\sum_{i=1}^{n} i^2 = \\frac{n(n+1)(2n+1)}{6}' },
    { label: t('formulas.lbl_trigonometri') !== 'formulas.lbl_trigonometri' ? t('formulas.lbl_trigonometri') : 'Trigonometri (Identitas)', latex: '\\sin^2\\theta + \\cos^2\\theta = 1' },
    { label: t('formulas.lbl_logaritma') !== 'formulas.lbl_logaritma' ? t('formulas.lbl_logaritma') : 'Logaritma', latex: '\\log_b(xy) = \\log_b(x) + \\log_b(y)' },
    { label: t('formulas.lbl_akar') !== 'formulas.lbl_akar' ? t('formulas.lbl_akar') : 'Akar', latex: '\\sqrt[n]{x}' },
    { label: t('formulas.lbl_matriks2') !== 'formulas.lbl_matriks2' ? t('formulas.lbl_matriks2') : 'Matriks 2x2', latex: '\\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix}' },
    { label: t('formulas.lbl_matriks3') !== 'formulas.lbl_matriks3' ? t('formulas.lbl_matriks3') : 'Matriks 3x3', latex: '\\begin{pmatrix} a & b & c \\\\ d & e & f \\\\ g & h & i \\end{pmatrix}' },
    { label: t('formulas.lbl_turunan') !== 'formulas.lbl_turunan' ? t('formulas.lbl_turunan') : 'Turunan (Diferensial)', latex: `f'(x) = \\lim_{h \\to 0} \\frac{f(x+h) - f(x)}{h}` },
    { label: t('formulas.lbl_permutasi') !== 'formulas.lbl_permutasi' ? t('formulas.lbl_permutasi') : 'Permutasi', latex: 'P(n,r) = \\frac{n!}{(n-r)!}' },
    { label: t('formulas.lbl_kombinasi') !== 'formulas.lbl_kombinasi' ? t('formulas.lbl_kombinasi') : 'Kombinasi', latex: 'C(n,r) = \\frac{n!}{r!(n-r)!}' },
    { label: t('formulas.lbl_garis') !== 'formulas.lbl_garis' ? t('formulas.lbl_garis') : 'Persamaan Garis', latex: 'y - y_1 = m(x - x_1)' },
    { label: t('formulas.lbl_jarak') !== 'formulas.lbl_jarak' ? t('formulas.lbl_jarak') : 'Jarak 2 Titik', latex: 'd = \\sqrt{(x_2 - x_1)^2 + (y_2 - y_1)^2}' }
  ],
  [t('formulas.cat_fisika') !== 'formulas.cat_fisika' ? t('formulas.cat_fisika') : 'Fisika']: [
    { label: t('formulas.lbl_newton') !== 'formulas.lbl_newton' ? t('formulas.lbl_newton') : 'Hukum Newton II', latex: '\\Sigma F = m \\cdot a' },
    { label: t('formulas.lbl_ek') !== 'formulas.lbl_ek' ? t('formulas.lbl_ek') : 'Energi Kinetik', latex: 'E_k = \\frac{1}{2}mv^2' },
    { label: t('formulas.lbl_ep') !== 'formulas.lbl_ep' ? t('formulas.lbl_ep') : 'Energi Potensial', latex: 'E_p = mgh' },
    { label: t('formulas.lbl_gravitasi') !== 'formulas.lbl_gravitasi' ? t('formulas.lbl_gravitasi') : 'Gravitasi Newton', latex: 'F = G\\frac{m_1 m_2}{r^2}' },
    { label: t('formulas.lbl_hooke') !== 'formulas.lbl_hooke' ? t('formulas.lbl_hooke') : 'Hukum Hooke', latex: 'F = -kx' },
    { label: t('formulas.lbl_gelombang') !== 'formulas.lbl_gelombang' ? t('formulas.lbl_gelombang') : 'Gelombang', latex: 'v = \\lambda \\cdot f' },
    { label: t('formulas.lbl_gas_ideal') !== 'formulas.lbl_gas_ideal' ? t('formulas.lbl_gas_ideal') : 'Gas Ideal', latex: 'PV = nRT' },
    { label: t('formulas.lbl_einstein') !== 'formulas.lbl_einstein' ? t('formulas.lbl_einstein') : 'Massa-Energi', latex: 'E = mc^2' },
    { label: t('formulas.lbl_ohm') !== 'formulas.lbl_ohm' ? t('formulas.lbl_ohm') : 'Hukum Ohm', latex: 'V = I \\cdot R' },
    { label: t('formulas.lbl_momentum') !== 'formulas.lbl_momentum' ? t('formulas.lbl_momentum') : 'Momentum', latex: 'p = m \\cdot v' },
    { label: t('formulas.lbl_torsi') !== 'formulas.lbl_torsi' ? t('formulas.lbl_torsi') : 'Torsi (Momen Gaya)', latex: '\\tau = r \\times F' },
    { label: t('formulas.lbl_kapasitansi') !== 'formulas.lbl_kapasitansi' ? t('formulas.lbl_kapasitansi') : 'Kapasitansi', latex: 'C = \\frac{Q}{V}' },
    { label: t('formulas.lbl_faraday_induksi') !== 'formulas.lbl_faraday_induksi' ? t('formulas.lbl_faraday_induksi') : 'Induksi Faraday', latex: '\\varepsilon = -N \\frac{d\\Phi}{dt}' },
    { label: t('formulas.lbl_bernoulli') !== 'formulas.lbl_bernoulli' ? t('formulas.lbl_bernoulli') : 'Hukum Bernoulli', latex: `P + \\frac{1}{2}\\rho v^2 + \\rho gh = \\text{${t('formulas.txt_konstan') !== 'formulas.txt_konstan' ? t('formulas.txt_konstan') : 'konstan'}}` }
  ],
  [t('formulas.cat_kimia') !== 'formulas.cat_kimia' ? t('formulas.cat_kimia') : 'Kimia']: [
    { label: t('formulas.lbl_molaritas') !== 'formulas.lbl_molaritas' ? t('formulas.lbl_molaritas') : 'Molaritas', latex: 'M = \\frac{n}{V}' },
    { label: t('formulas.lbl_kesetimbangan') !== 'formulas.lbl_kesetimbangan' ? t('formulas.lbl_kesetimbangan') : 'Kesetimbangan', latex: 'K_c = \\frac{[C]^c [D]^d}{[A]^a [B]^b}' },
    { label: t('formulas.lbl_ph_lemah') !== 'formulas.lbl_ph_lemah' ? t('formulas.lbl_ph_lemah') : 'pH Asam Lemah', latex: 'pH = \\frac{1}{2}(pK_a - \\log[HA])' },
    { label: t('formulas.lbl_arrhenius') !== 'formulas.lbl_arrhenius' ? t('formulas.lbl_arrhenius') : 'Persamaan Arrhenius', latex: 'k = A e^{-E_a/RT}' },
    { label: t('formulas.lbl_entalpi') !== 'formulas.lbl_entalpi' ? t('formulas.lbl_entalpi') : 'Entalpi Reaksi', latex: `\\Delta H = \\sum \\Delta H_f(\\text{${t('formulas.txt_produk') !== 'formulas.txt_produk' ? t('formulas.txt_produk') : 'produk'}}) - \\sum \\Delta H_f(\\text{${t('formulas.txt_reaktan') !== 'formulas.txt_reaktan' ? t('formulas.txt_reaktan') : 'reaktan'}})` },
    { label: t('formulas.lbl_faraday_kimia') !== 'formulas.lbl_faraday_kimia' ? t('formulas.lbl_faraday_kimia') : 'Hukum Faraday I', latex: 'W = \\frac{e \\cdot i \\cdot t}{96500}' },
    { label: t('formulas.lbl_titrasi') !== 'formulas.lbl_titrasi' ? t('formulas.lbl_titrasi') : 'Titrasi Asam Basa', latex: 'V_1 M_1 = V_2 M_2' },
    { label: t('formulas.lbl_osmotik') !== 'formulas.lbl_osmotik' ? t('formulas.lbl_osmotik') : 'Tekanan Osmotik', latex: '\\pi = M R T i' },
    { label: t('formulas.lbl_beku') !== 'formulas.lbl_beku' ? t('formulas.lbl_beku') : 'Penurunan Titik Beku', latex: '\\Delta T_f = K_f \\cdot m \\cdot i' },
    { label: t('formulas.lbl_orde1') !== 'formulas.lbl_orde1' ? t('formulas.lbl_orde1') : 'Laju Reaksi Orde 1', latex: '\\ln[A]_t = -kt + \\ln[A]_0' }
  ],
  [t('formulas.cat_statistika') !== 'formulas.cat_statistika' ? t('formulas.cat_statistika') : 'Statistika']: [
    { label: t('formulas.lbl_mean') !== 'formulas.lbl_mean' ? t('formulas.lbl_mean') : 'Rata-rata (Mean)', latex: '\\bar{x} = \\frac{1}{n} \\sum_{i=1}^{n} x_i' },
    { label: t('formulas.lbl_varians') !== 'formulas.lbl_varians' ? t('formulas.lbl_varians') : 'Varians (Sampel)', latex: 's^2 = \\frac{\\sum (x_i - \\bar{x})^2}{n-1}' },
    { label: t('formulas.lbl_normal') !== 'formulas.lbl_normal' ? t('formulas.lbl_normal') : 'Distribusi Normal', latex: 'f(x) = \\frac{1}{\\sigma\\sqrt{2\\pi}} e^{-\\frac{1}{2}(\\frac{x-\\mu}{\\sigma})^2}' },
    { label: t('formulas.lbl_pearson') !== 'formulas.lbl_pearson' ? t('formulas.lbl_pearson') : 'Korelasi Pearson', latex: 'r = \\frac{\\sum (x_i - \\bar{x})(y_i - \\bar{y})}{\\sqrt{\\sum (x_i - \\bar{x})^2 \\sum (y_i - \\bar{y})^2}}' },
    { label: t('formulas.lbl_binomial') !== 'formulas.lbl_binomial' ? t('formulas.lbl_binomial') : 'Probabilitas Binomial', latex: 'P(X = k) = \\binom{n}{k} p^k (1-p)^{n-k}' },
    { label: t('formulas.lbl_bersyarat') !== 'formulas.lbl_bersyarat' ? t('formulas.lbl_bersyarat') : 'Peluang Bersyarat', latex: 'P(A|B) = \\frac{P(A \\cap B)}{P(B)}' },
    { label: t('formulas.lbl_kuartil') !== 'formulas.lbl_kuartil' ? t('formulas.lbl_kuartil') : 'Kuartil Bawah (Q1)', latex: 'Q_1 = L_1 + \\left( \\frac{\\frac{1}{4}n - F_k}{f} \\right) c' }
  ],
  [t('formulas.cat_ekonomi') !== 'formulas.cat_ekonomi' ? t('formulas.cat_ekonomi') : 'Ekonomi & Bisnis']: [
    { label: t('formulas.lbl_elastisitas') !== 'formulas.lbl_elastisitas' ? t('formulas.lbl_elastisitas') : 'Elastisitas Permintaan', latex: 'E_d = \\frac{\\% \\Delta Q}{\\% \\Delta P}' },
    { label: t('formulas.lbl_bep') !== 'formulas.lbl_bep' ? t('formulas.lbl_bep') : 'Break Even Point', latex: 'BEP = \\frac{FC}{P - VC}' },
    { label: t('formulas.lbl_laba') !== 'formulas.lbl_laba' ? t('formulas.lbl_laba') : 'Laba/Rugi', latex: '\\Pi = TR - TC' },
    { label: t('formulas.lbl_pendapatan') !== 'formulas.lbl_pendapatan' ? t('formulas.lbl_pendapatan') : 'Pendapatan Nasional', latex: 'Y = C + I + G + (X - M)' },
    { label: t('formulas.lbl_roi') !== 'formulas.lbl_roi' ? t('formulas.lbl_roi') : 'Return on Investment (ROI)', latex: `ROI = \\frac{\\text{${t('formulas.txt_laba_bersih') !== 'formulas.txt_laba_bersih' ? t('formulas.txt_laba_bersih') : 'Laba Bersih'}}}{\\text{${t('formulas.txt_total_inv') !== 'formulas.txt_total_inv' ? t('formulas.txt_total_inv') : 'Total Investasi'}}} \\times 100\\%` },
    { label: t('formulas.lbl_roe') !== 'formulas.lbl_roe' ? t('formulas.lbl_roe') : 'Return on Equity (ROE)', latex: `ROE = \\frac{\\text{${t('formulas.txt_laba_bersih') !== 'formulas.txt_laba_bersih' ? t('formulas.txt_laba_bersih') : 'Laba Bersih'}}}{\\text{${t('formulas.txt_ekuitas') !== 'formulas.txt_ekuitas' ? t('formulas.txt_ekuitas') : 'Ekuitas'}}} \\times 100\\%` },
    { label: t('formulas.lbl_penyusutan') !== 'formulas.lbl_penyusutan' ? t('formulas.lbl_penyusutan') : 'Penyusutan Garis Lurus', latex: `D = \\frac{\\text{${t('formulas.txt_harga_perolehan') !== 'formulas.txt_harga_perolehan' ? t('formulas.txt_harga_perolehan') : 'Harga Perolehan'}} - \\text{${t('formulas.txt_nilai_residu') !== 'formulas.txt_nilai_residu' ? t('formulas.txt_nilai_residu') : 'Nilai Residu'}}}{\\text{${t('formulas.txt_umur_ekonomis') !== 'formulas.txt_umur_ekonomis' ? t('formulas.txt_umur_ekonomis') : 'Umur Ekonomis'}}}` }
  ],
  [t('formulas.cat_teknik') !== 'formulas.cat_teknik' ? t('formulas.cat_teknik') : 'Teknik']: [
    { label: t('formulas.lbl_tegangan_normal') !== 'formulas.lbl_tegangan_normal' ? t('formulas.lbl_tegangan_normal') : 'Tegangan Normal', latex: '\\sigma = \\frac{P}{A}' },
    { label: t('formulas.lbl_regangan') !== 'formulas.lbl_regangan' ? t('formulas.lbl_regangan') : 'Regangan', latex: '\\epsilon = \\frac{\\Delta L}{L_0}' },
    { label: t('formulas.lbl_daya_listrik') !== 'formulas.lbl_daya_listrik' ? t('formulas.lbl_daya_listrik') : 'Daya Listrik', latex: 'P = V \\cdot I \\cdot \\cos\\phi' },
    { label: t('formulas.lbl_efisiensi') !== 'formulas.lbl_efisiensi' ? t('formulas.lbl_efisiensi') : 'Efisiensi Termal', latex: '\\eta = 1 - \\frac{Q_{out}}{Q_{in}}' },
    { label: t('formulas.lbl_inersia') !== 'formulas.lbl_inersia' ? t('formulas.lbl_inersia') : 'Momen Inersia Silinder', latex: 'I = \\frac{1}{2}mr^2' },
    { label: t('formulas.lbl_tegangan_geser') !== 'formulas.lbl_tegangan_geser' ? t('formulas.lbl_tegangan_geser') : 'Tegangan Geser', latex: '\\tau = \\frac{V \\cdot Q}{I \\cdot t}' },
    { label: t('formulas.lbl_kontinuitas') !== 'formulas.lbl_kontinuitas' ? t('formulas.lbl_kontinuitas') : 'Persamaan Kontinuitas', latex: 'A_1 v_1 = A_2 v_2' },
    { label: t('formulas.lbl_pompa') !== 'formulas.lbl_pompa' ? t('formulas.lbl_pompa') : 'Daya Pompa', latex: 'P = \\rho \\cdot g \\cdot Q \\cdot H' }
  ],
  [t('formulas.cat_biologi') !== 'formulas.cat_biologi' ? t('formulas.cat_biologi') : 'Kedokteran & Biologi']: [
    { label: t('formulas.lbl_bmi') !== 'formulas.lbl_bmi' ? t('formulas.lbl_bmi') : 'BMI (Body Mass Index)', latex: `BMI = \\frac{\\text{${t('formulas.txt_berat') !== 'formulas.txt_berat' ? t('formulas.txt_berat') : 'Berat (kg)'}}}{\\text{${t('formulas.txt_tinggi') !== 'formulas.txt_tinggi' ? t('formulas.txt_tinggi') : 'Tinggi'}}^2 (m^2)}` },
    { label: t('formulas.lbl_hardy') !== 'formulas.lbl_hardy' ? t('formulas.lbl_hardy') : 'Hukum Hardy-Weinberg', latex: 'p^2 + 2pq + q^2 = 1' },
    { label: t('formulas.lbl_gfr') !== 'formulas.lbl_gfr' ? t('formulas.lbl_gfr') : 'Laju Filtrasi Glomerulus', latex: 'GFR = \\frac{U_c \\times V}{P_c}' },
    { label: t('formulas.lbl_mitotik') !== 'formulas.lbl_mitotik' ? t('formulas.lbl_mitotik') : 'Indeks Mitotik', latex: `MI = \\frac{\\text{${t('formulas.txt_sel_mitosis') !== 'formulas.txt_sel_mitosis' ? t('formulas.txt_sel_mitosis') : 'Jumlah Sel Mitosis'}}}{\\text{${t('formulas.txt_total_sel') !== 'formulas.txt_total_sel' ? t('formulas.txt_total_sel') : 'Total Sel'}}} \\times 100\\%` }
  ],
  [t('formulas.cat_komputer') !== 'formulas.cat_komputer' ? t('formulas.cat_komputer') : 'Komputer & Informatika']: [
    { label: t('formulas.lbl_bayes') !== 'formulas.lbl_bayes' ? t('formulas.lbl_bayes') : 'Teorema Bayes', latex: 'P(A|B) = \\frac{P(B|A) \\cdot P(A)}{P(B)}' },
    { label: t('formulas.lbl_and') !== 'formulas.lbl_and' ? t('formulas.lbl_and') : 'Logika Boolean (AND)', latex: 'Y = A \\cdot B' },
    { label: t('formulas.lbl_or') !== 'formulas.lbl_or' ? t('formulas.lbl_or') : 'Logika Boolean (OR)', latex: 'Y = A + B' },
    { label: t('formulas.lbl_xor') !== 'formulas.lbl_xor' ? t('formulas.lbl_xor') : 'Logika Boolean (XOR)', latex: 'Y = A \\oplus B' },
    { label: t('formulas.lbl_big_o') !== 'formulas.lbl_big_o' ? t('formulas.lbl_big_o') : 'Kompleksitas (Big O)', latex: 'O(n \\log n)' },
    { label: t('formulas.lbl_shannon') !== 'formulas.lbl_shannon' ? t('formulas.lbl_shannon') : 'Rumus Shannon-Hartley', latex: 'C = B \\log_2 \\left(1 + \\frac{S}{N}\\right)' }
  ],
  [t('formulas.cat_umum') !== 'formulas.cat_umum' ? t('formulas.cat_umum') : 'Umum & Simbol']: [
    { label: t('formulas.lbl_pecahan') !== 'formulas.lbl_pecahan' ? t('formulas.lbl_pecahan') : 'Pecahan', latex: '\\frac{a}{b}' },
    { label: t('formulas.lbl_pangkat') !== 'formulas.lbl_pangkat' ? t('formulas.lbl_pangkat') : 'Pangkat', latex: 'x^{n}' },
    { label: t('formulas.lbl_akar') !== 'formulas.lbl_akar' ? t('formulas.lbl_akar') : 'Akar', latex: '\\sqrt{x}' },
    { label: t('formulas.lbl_subskrip') !== 'formulas.lbl_subskrip' ? t('formulas.lbl_subskrip') : 'Subskrip', latex: 'x_{i}' },
    { label: t('formulas.lbl_panah') !== 'formulas.lbl_panah' ? t('formulas.lbl_panah') : 'Tanda Panah', latex: 'A \\rightarrow B' },
    { label: t('formulas.lbl_kurung_cabang') !== 'formulas.lbl_kurung_cabang' ? t('formulas.lbl_kurung_cabang') : 'Kurung Percabangan', latex: `\\begin{cases} x & \\text{${t('formulas.txt_if') !== 'formulas.txt_if' ? t('formulas.txt_if') : 'if '}} x > 0 \\\\ 0 & \\text{${t('formulas.txt_otherwise') !== 'formulas.txt_otherwise' ? t('formulas.txt_otherwise') : 'otherwise'}} \\end{cases}` },
    { label: t('formulas.lbl_himpunan') !== 'formulas.lbl_himpunan' ? t('formulas.lbl_himpunan') : 'Himpunan', latex: 'A \\cup B, A \\cap B' },
    { label: t('formulas.lbl_vektor') !== 'formulas.lbl_vektor' ? t('formulas.lbl_vektor') : 'Vektor', latex: '\\vec{v} = v_x \\hat{i} + v_y \\hat{j} + v_z \\hat{k}' },
    { label: t('formulas.lbl_topi') !== 'formulas.lbl_topi' ? t('formulas.lbl_topi') : 'Topi (Hat)', latex: '\\hat{p}' },
    { label: t('formulas.lbl_bar') !== 'formulas.lbl_bar' ? t('formulas.lbl_bar') : 'Garis Atas (Bar)', latex: '\\bar{x}' },
    { label: t('formulas.lbl_derajat') !== 'formulas.lbl_derajat' ? t('formulas.lbl_derajat') : 'Derajat', latex: '90^\\circ' },
    { label: t('formulas.lbl_tak_hingga') !== 'formulas.lbl_tak_hingga' ? t('formulas.lbl_tak_hingga') : 'Tak Hingga', latex: '\\infty' },
    { label: t('formulas.lbl_elemen') !== 'formulas.lbl_elemen' ? t('formulas.lbl_elemen') : 'Elemen / Bukan Elemen', latex: 'x \\in A, y \\notin B' },
    { label: t('formulas.lbl_aproksimasi') !== 'formulas.lbl_aproksimasi' ? t('formulas.lbl_aproksimasi') : 'Tanda Aproksimasi', latex: '\\approx' },
    { label: t('formulas.lbl_kurang_lebih') !== 'formulas.lbl_kurang_lebih' ? t('formulas.lbl_kurang_lebih') : 'Tanda Kurang Lebih', latex: '\\pm' }
  ]
});

export const QUILL_FORMATS = [
  'header', 'bold', 'italic', 'underline', 'strike', 'background',
  'list', 'bullet', 'link', 'image', 'video', 'formula',
  'blockquote', 'code-block', 'divider', 'layout', 'alt', 'align', 'code'
];
