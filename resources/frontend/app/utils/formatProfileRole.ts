export const formatProfileRole = (
    profesiRaw: string | undefined,
    jenjangRaw: string | undefined,
    school: string | undefined,
    profesiLabel: string,
    jenjangLabel: string,
    pelajarLabel: string,
    umumLabel: string,
    language: string
) => {
    const atMap: Record<string, string> = {
        id: "di", en: "at", ja: "の", ko: "소속:", zh: "在", es: "en", fr: "à", de: "an der", pt: "em", ru: "в"
    };
    const atLabel = atMap[language] || "di";

    if (school) {
        if (profesiRaw === "Umum") return school;
        if (!profesiLabel) return school;

        if (language === 'ja') return `${school}${atLabel}${profesiLabel}`;
        if (language === 'zh') return `${atLabel}${school}的${profesiLabel}`;
        if (language === 'ko') return `${school} ${profesiLabel}`;
        
        return `${profesiLabel} ${atLabel} ${school}`;
    }

    if (profesiRaw === "Umum") return umumLabel;

    if (profesiRaw === "Pelajar" && jenjangRaw && jenjangRaw !== "Umum" && jenjangRaw !== "Kuliah") {
        if (language === 'en') return `${jenjangLabel} ${pelajarLabel}`;
        if (language === 'ja' || language === 'ko' || language === 'zh') return `${jenjangLabel}${pelajarLabel}`;
        
        // e.g. "Pelajar SMA"
        return `${pelajarLabel} ${jenjangLabel}`;
    }

    if (profesiLabel) return profesiLabel;

    return jenjangRaw ? `${pelajarLabel} ${jenjangLabel}` : pelajarLabel;
};
