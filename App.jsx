import { useState, useCallback } from "react";
import {
  Activity, AlertTriangle, Droplets, Heart, Shield, ChevronRight,
  Thermometer, Stethoscope, ClipboardList, UserCheck, FileText,
  RotateCcw, Bug, CheckCircle2, Info, Zap, Syringe, Clock,
  MapPin, FlaskConical, ArrowRight, ChevronLeft, CircleDot,
  HeartPulse, Brain, Pill, Baby, Users, Scale, Bone, Beaker
} from "lucide-react";

// ─── DATA ────────────────────────────────────────────────
const SYMPTOMS = [
  { id: "febre", label: "Febre (2–7 dias)", icon: Thermometer },
  { id: "cefaleia", label: "Cefaleia", icon: Brain },
  { id: "mialgia", label: "Mialgia / Artralgia", icon: Bone },
  { id: "retroorb", label: "Dor retro-orbital", icon: CircleDot },
  { id: "nausea", label: "Náuseas / Vômitos", icon: Activity },
  { id: "exantema", label: "Exantema", icon: CircleDot },
  { id: "petequias", label: "Petéquias", icon: Droplets },
  { id: "laco", label: "Prova do laço positiva", icon: Activity },
  { id: "leucopenia", label: "Leucopenia", icon: FlaskConical },
  { id: "diarreia", label: "Diarreia (fezes pastosas)", icon: Activity },
  { id: "anorexia", label: "Anorexia / Adinamia", icon: Zap },
];

const WARNINGS = [
  { id: "dor_abd", label: "Dor abdominal intensa e contínua" },
  { id: "vomitos", label: "Vômitos persistentes" },
  { id: "liquidos", label: "Acúmulo de líquidos (ascite, derrame pleural/pericárdico)" },
  { id: "hipotensao", label: "Hipotensão postural e/ou lipotimia" },
  { id: "hepato", label: "Hepatomegalia >2 cm abaixo do rebordo costal" },
  { id: "sang_muc", label: "Sangramento de mucosa" },
  { id: "letargia", label: "Letargia e/ou irritabilidade" },
  { id: "ht_prog", label: "Aumento progressivo do hematócrito" },
];

const SEVERITY = [
  { id: "choque", label: "Choque (taquicardia, pulso filiforme, extremidades frias, enchimento capilar >2s, PA convergente <20mmHg)" },
  { id: "hipotensao_art", label: "Hipotensão arterial (PAS <90mmHg ou PAM <70mmHg)" },
  { id: "oliguria", label: "Oligúria (<1,5 mL/kg/h)" },
  { id: "taquipneia", label: "Taquipneia / Desconforto respiratório" },
  { id: "cianose", label: "Cianose" },
  { id: "sang_grave", label: "Sangramento grave" },
  { id: "orgaos", label: "Comprometimento grave de órgãos (fígado, SNC, coração, rins)" },
];

const SPECIAL = [
  { id: "lactente", label: "Lactente (<24 meses)" },
  { id: "gestante", label: "Gestante" },
  { id: "idoso", label: "Adulto >65 anos" },
  { id: "has", label: "Hipertensão arterial / DCV grave" },
  { id: "dm", label: "Diabetes mellitus" },
  { id: "dpoc", label: "DPOC / Asma" },
  { id: "obesidade", label: "Obesidade" },
  { id: "hemato", label: "Doença hematológica crônica" },
  { id: "renal", label: "Doença renal crônica" },
  { id: "hepato_c", label: "Hepatopatia / Doença ácido-péptica" },
  { id: "autoimune", label: "Doença autoimune" },
  { id: "anticoag", label: "Uso de anticoagulantes / antiagregantes" },
  { id: "sang_pele", label: "Sangramento de pele ou prova do laço +" },
];

const GROUP_DATA = {
  A: {
    color: "#2563eb", bg: "#eff6ff", border: "#93c5fd", tag: "AZUL", icon: Shield,
    title: "Grupo A", fullTitle: "Dengue sem sinais de alarme",
    subtitle: "Sem condição especial, sem risco social, sem comorbidades",
    local: "Ambulatorial",
    exames: "A critério médico.",
    conduta: [
      "Hidratação oral conforme cálculo abaixo.",
      "Prescrever paracetamol e/ou dipirona. NÃO usar AAS, AINEs ou corticoides.",
      "Orientar repouso e retorno imediato se surgirem sinais de alarme.",
      "Retorno no dia de melhora da febre (início da fase crítica) ou no 5° dia se persistir.",
      "Preencher e entregar cartão de acompanhamento da dengue.",
      "Notificar o caso.",
    ],
    retorno: "Retorno imediato se sinais de alarme ou no dia da melhora da febre. Sem defervescência: retornar no 5° dia.",
    alta: null,
  },
  B: {
    color: "#16a34a", bg: "#f0fdf4", border: "#86efac", tag: "VERDE", icon: ClipboardList,
    title: "Grupo B", fullTitle: "Dengue sem alarme, com condição especial",
    subtitle: "Sangramento de pele, condição clínica especial ou comorbidades",
    local: "Observação até resultado de exames e reavaliação clínica",
    exames: "Hemograma completo OBRIGATÓRIO. Outros conforme comorbidades.",
    conduta: [
      "Hidratação oral (conforme Grupo A) até resultado dos exames.",
      "Avaliar hemoconcentração no hemograma.",
      "Resultado em até 2h (máx. 4h). Paciente aguarda em observação.",
      "Se Ht normal → ambulatorial com retorno diário.",
      "Se hemoconcentração ou sinais de alarme → conduzir como Grupo C.",
      "Prescrever paracetamol e/ou dipirona. Notificar.",
    ],
    retorno: "Retorno diário para reavaliação clínica e laboratorial até 48h após remissão da febre.",
    alta: null,
  },
  C: {
    color: "#d97706", bg: "#fffbeb", border: "#fcd34d", tag: "AMARELO", icon: AlertTriangle,
    title: "Grupo C", fullTitle: "Dengue com sinais de alarme",
    subtitle: "Urgência — atendimento o mais rápido possível",
    local: "Internação hospitalar até estabilização — mínimo 48h",
    exames: "Hemograma, albumina, transaminases (OBRIGATÓRIOS). Rx tórax, USG abdome (RECOMENDADOS). Gasometria, eletrólitos, TAP, ecocardiograma conforme necessidade.",
    conduta: [
      "Reposição volêmica IMEDIATA: SF 0,9% 10 mL/kg na 1ª hora, em qualquer ponto de atenção.",
      "Reavaliação clínica após 1h (sinais vitais, PA, diurese ≥1 mL/kg/h).",
      "Manter 10 mL/kg/h na 2ª hora até avaliação do Ht (em até 2h).",
      "Sem melhora: repetir expansão até 3x.",
      "Se melhora: manutenção — 25 mL/kg em 6h + 25 mL/kg em 8h.",
      "Sem melhora após 3 expansões → conduzir como Grupo D.",
      "Monitoramento contínuo. Notificar.",
    ],
    retorno: "Após alta: reavaliação conforme orientação do Grupo B.",
    alta: "Estabilização hemodinâmica 48h + sem febre 24h + melhora clínica + Ht normal/estável 24h + plaquetas em elevação.",
  },
  D: {
    color: "#dc2626", bg: "#fef2f2", border: "#fca5a5", tag: "VERMELHO", icon: HeartPulse,
    title: "Grupo D", fullTitle: "Dengue grave",
    subtitle: "Emergência — atendimento IMEDIATO",
    local: "UTI até estabilização — mínimo 48h",
    exames: "Hemograma, albumina, transaminases, tipagem sanguínea, gasometria, eletrólitos, coagulograma, Rx tórax, USG, ecocardiograma.",
    conduta: [
      "EXPANSÃO RÁPIDA: SF 0,9% 20 mL/kg em até 20 min. Repetir até 3x.",
      "Reavaliação clínica a cada 15–30 min. Ht a cada 2h.",
      "Se resposta adequada → seguir protocolo Grupo C.",
      "Ht em ascensão + choque: albumina 0,5–1 g/kg (5%) ou coloides 10 mL/kg/h.",
      "Ht em queda + choque: investigar hemorragia. CH 10–15 mL/kg/dia.",
      "Coagulopatia: PFC 10 mL/kg, vit. K EV, crioprecipitado 1U/5–10kg.",
      "Plaquetas APENAS se: sangramento persistente + coagulação corrigida + INR >1,5x.",
      "Inotrópicos: dopamina 5–10, dobutamina 5–20, milrinona 0,5–0,8 mcg/kg/min.",
    ],
    retorno: "Após critérios de alta: retorno conforme Grupo B.",
    alta: "Estabilização hemodinâmica 48h + sem febre 24h + melhora clínica + Ht normal/estável 24h + plaquetas em elevação.",
  },
};

// ─── STYLES ──────────────────────────────────────────────
const C = {
  bg: "#f0f4f8", card: "#ffffff", text: "#0f172a", dim: "#64748b",
  accent: "#0369a1", accentSoft: "#e0f2fe", accentDark: "#0c4a6e",
  border: "#e2e8f0", r: 16,
};

const css = `
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,600;0,9..40,700;0,9..40,800;1,9..40,400&display=swap');
* { margin:0; padding:0; box-sizing:border-box; -webkit-tap-highlight-color:transparent; }
html { font-family:'DM Sans',system-ui,sans-serif; }
input[type=number]::-webkit-inner-spin-button,
input[type=number]::-webkit-outer-spin-button { -webkit-appearance:none; margin:0; }
input[type=number] { -moz-appearance:textfield; }
`;

// ─── COMPONENT ───────────────────────────────────────────
export default function App() {
  const [page, setPage] = useState("home"); // home | flow
  const [step, setStep] = useState(0);
  const [checked, setChecked] = useState({});
  const [weight, setWeight] = useState("");
  const [ageType, setAgeType] = useState("adult");

  const toggle = useCallback((id) => setChecked((p) => ({ ...p, [id]: !p[id] })), []);
  const getChecked = (list) => list.filter((i) => checked[i.id]);

  const classify = () => {
    if (getChecked(SEVERITY).length > 0) return "D";
    if (getChecked(WARNINGS).length > 0) return "C";
    if (getChecked(SPECIAL).length > 0) return "B";
    return "A";
  };

  const calcHyd = (w, grp) => {
    if (!w || w <= 0) return null;
    const kg = parseFloat(w);
    if (grp === "A" || grp === "B") {
      let total;
      if (ageType === "adult") { total = Math.round(kg * 60); }
      else { total = Math.round(kg * (kg <= 10 ? 130 : kg <= 20 ? 100 : 80)); }
      return { t: "oral", total, sro: Math.round(total / 3), caseiro: Math.round(total * 2 / 3), first6h: Math.round(total / 3) };
    }
    if (grp === "C") {
      const e = Math.round(kg * 10);
      const m1 = Math.round(kg * 25), m2 = Math.round(kg * 25);
      return { t: "iv_c", exp: e, m1, m2 };
    }
    return { t: "iv_d", bolus: Math.round(kg * 20) };
  };

  const STEPS = [
    { id: "symptoms", label: "Sintomas", icon: Thermometer },
    { id: "warnings", label: "Alarme", icon: AlertTriangle },
    { id: "severity", label: "Gravidade", icon: HeartPulse },
    { id: "special", label: "Condições", icon: UserCheck },
    { id: "result", label: "Resultado", icon: FileText },
  ];

  const startFlow = () => { setPage("flow"); setStep(0); setChecked({}); setWeight(""); };

  // ─── HOME PAGE ─────────────────────────────────────────
  if (page === "home") {
    return (
      <div style={{ maxWidth: 430, margin: "0 auto", minHeight: "100dvh", background: C.bg, fontFamily: "'DM Sans',system-ui,sans-serif" }}>
        <style>{css}</style>

        {/* Hero */}
        <div style={{ background: `linear-gradient(145deg, ${C.accentDark} 0%, #0284c7 55%, #0ea5e9 100%)`, padding: "54px 22px 28px", color: "#fff", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: -40, right: -40, width: 180, height: 180, borderRadius: "50%", background: "rgba(255,255,255,0.06)" }} />
          <div style={{ position: "absolute", bottom: -20, left: -30, width: 120, height: 120, borderRadius: "50%", background: "rgba(255,255,255,0.04)" }} />

          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 18, position: "relative" }}>
            <div style={{ width: 56, height: 56, borderRadius: 16, background: "rgba(255,255,255,0.15)", backdropFilter: "blur(10px)", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid rgba(255,255,255,0.2)" }}>
              <Bug size={30} strokeWidth={2} />
            </div>
            <div>
              <h1 style={{ fontSize: 26, fontWeight: 800, letterSpacing: -0.8, lineHeight: 1.1 }}>DengueCare</h1>
              <div style={{ fontSize: 12, opacity: 0.75, marginTop: 2, fontWeight: 600 }}>Classificação clínica da dengue</div>
            </div>
          </div>

          <p style={{ fontSize: 14, lineHeight: 1.65, opacity: 0.9, maxWidth: 340, position: "relative" }}>
            Ferramenta de apoio à decisão clínica para estratificação de risco em dengue — Grupos A, B, C e D.
          </p>

          {/* Stats */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8, marginTop: 20 }}>
            {[
              { v: "4", l: "Grupos" }, { v: "5", l: "Etapas" }, { v: "2024", l: "MS" }, { v: "6ª", l: "Edição" },
            ].map((x) => (
              <div key={x.l} style={{ background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 14, padding: "12px 6px", textAlign: "center", backdropFilter: "blur(6px)" }}>
                <div style={{ fontSize: 18, fontWeight: 800 }}>{x.v}</div>
                <div style={{ fontSize: 10, opacity: 0.7, marginTop: 2 }}>{x.l}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ padding: "16px 16px 32px" }}>

          {/* Protocol flow diagram */}
          <div style={{ background: C.card, borderRadius: C.r, border: `1px solid ${C.border}`, padding: 18, marginBottom: 14 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
              <Activity size={18} color={C.accent} />
              <span style={{ fontSize: 14, fontWeight: 700, color: C.text }}>Fluxo de classificação</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, marginBottom: 16 }}>
              {["A", "B", "C", "D"].map((g, i) => {
                const d = GROUP_DATA[g];
                return (
                  <div key={g} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <div style={{ width: 42, height: 42, borderRadius: 12, background: d.bg, border: `2px solid ${d.border}`, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 16, color: d.color }}>{g}</div>
                    {i < 3 && <ArrowRight size={14} color={C.dim} />}
                  </div>
                );
              })}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              {Object.entries(GROUP_DATA).map(([k, d]) => (
                <div key={k} style={{ padding: "10px 12px", borderRadius: 12, background: d.bg, border: `1.5px solid ${d.border}` }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                    <d.icon size={14} color={d.color} />
                    <span style={{ fontSize: 13, fontWeight: 800, color: d.color }}>{d.title}</span>
                  </div>
                  <div style={{ fontSize: 11, color: C.dim, lineHeight: 1.4 }}>{d.fullTitle}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Steps preview */}
          <div style={{ background: C.card, borderRadius: C.r, border: `1px solid ${C.border}`, padding: 18, marginBottom: 14 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
              <ClipboardList size={18} color={C.accent} />
              <span style={{ fontSize: 14, fontWeight: 700, color: C.text }}>Etapas da triagem</span>
            </div>
            {STEPS.map((st, i) => (
              <div key={st.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: i < STEPS.length - 1 ? `1px solid ${C.border}` : "none" }}>
                <div style={{ width: 34, height: 34, borderRadius: 10, background: C.accentSoft, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <st.icon size={17} color={C.accent} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: C.text }}>{st.label}</div>
                  <div style={{ fontSize: 12, color: C.dim }}>Etapa {i + 1} de {STEPS.length}</div>
                </div>
                <ChevronRight size={16} color={C.dim} />
              </div>
            ))}
          </div>

          {/* Features */}
          <div style={{ background: C.card, borderRadius: C.r, border: `1px solid ${C.border}`, padding: 18, marginBottom: 20 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
              <Stethoscope size={18} color={C.accent} />
              <span style={{ fontSize: 14, fontWeight: 700, color: C.text }}>Recursos incluídos</span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              {[
                { icon: CheckCircle2, label: "Classificação A–D", desc: "Baseada no MS 2024" },
                { icon: Droplets, label: "Cálculo de hidratação", desc: "Oral e venosa por peso" },
                { icon: Syringe, label: "Conduta completa", desc: "Exames, local e manejo" },
                { icon: Clock, label: "Critérios de alta", desc: "Grupos C e D" },
              ].map((f) => (
                <div key={f.label} style={{ padding: "14px 12px", borderRadius: 12, background: "#f8fafc", border: `1px solid ${C.border}` }}>
                  <f.icon size={20} color={C.accent} style={{ marginBottom: 6 }} />
                  <div style={{ fontSize: 13, fontWeight: 700, color: C.text }}>{f.label}</div>
                  <div style={{ fontSize: 11, color: C.dim, marginTop: 2 }}>{f.desc}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Start button */}
          <button onClick={startFlow} style={{ width: "100%", padding: "16px 24px", borderRadius: 14, border: "none", fontSize: 16, fontWeight: 800, cursor: "pointer", background: `linear-gradient(135deg, ${C.accentDark}, #0284c7)`, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", gap: 10, boxShadow: "0 8px 24px rgba(3,105,161,0.3)", transition: "all 0.2s" }}>
            <Stethoscope size={20} />
            Iniciar Triagem
            <ChevronRight size={20} />
          </button>

          {/* Disclaimer */}
          <div style={{ display: "flex", alignItems: "flex-start", gap: 8, marginTop: 16, padding: "12px 14px", borderRadius: 12, background: "#fefce8", border: "1px solid #fde68a" }}>
            <Info size={16} color="#a16207" style={{ flexShrink: 0, marginTop: 2 }} />
            <div style={{ fontSize: 12, lineHeight: 1.5, color: "#92400e" }}>
              Ferramenta educacional de apoio à decisão clínica. Não substitui avaliação médica. Baseada na 6ª edição do manual do Ministério da Saúde (Brasília, 2024).
            </div>
          </div>

          <div style={{ textAlign: "center", fontSize: 11, color: C.dim, marginTop: 16 }}>
            DengueCare v2.0 — Protocolo MS 2024
          </div>
        </div>
      </div>
    );
  }

  // ─── FLOW PAGES ────────────────────────────────────────
  const sid = STEPS[step].id;
  const canNext = step === 0 ? getChecked(SYMPTOMS).length >= 1 : true;

  const CheckItem = ({ item, hasIcon }) => {
    const on = !!checked[item.id];
    return (
      <div onClick={() => toggle(item.id)} style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "12px 14px", borderRadius: 13, marginBottom: 6, background: on ? C.accentSoft : "#f8fafc", border: `1.5px solid ${on ? "#7dd3fc" : "transparent"}`, cursor: "pointer", transition: "all 0.2s" }}>
        <div style={{ width: 22, height: 22, borderRadius: 7, border: `2px solid ${on ? C.accent : "#cbd5e1"}`, background: on ? C.accent : "#fff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1, transition: "all 0.15s" }}>
          {on && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>}
        </div>
        {hasIcon && item.icon && <item.icon size={16} color={on ? C.accent : C.dim} style={{ flexShrink: 0, marginTop: 2 }} />}
        <span style={{ fontSize: 14, lineHeight: 1.45, color: C.text, userSelect: "none" }}>{item.label}</span>
      </div>
    );
  };

  const Metric = ({ label, value, color }) => (
    <div style={{ background: "#fff", borderRadius: 11, padding: "10px 12px", border: `1px solid ${C.border}` }}>
      <div style={{ fontSize: 11, color: C.dim, marginBottom: 2 }}>{label}</div>
      <div style={{ fontSize: 17, fontWeight: 800, color: color || C.text }}>{value}</div>
    </div>
  );

  const renderResult = () => {
    const grp = classify();
    const d = GROUP_DATA[grp];
    const hyd = calcHyd(weight, grp);
    const Icon = d.icon;

    return (
      <>
        {/* Classification */}
        <div style={{ borderRadius: C.r, border: `2px solid ${d.border}`, background: d.bg, padding: 18, marginBottom: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: d.color, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Icon size={24} color="#fff" />
            </div>
            <div>
              <div style={{ fontSize: 11, fontWeight: 800, color: d.color, letterSpacing: 0.5, textTransform: "uppercase" }}>{d.tag} — Classificação</div>
              <h2 style={{ fontSize: 20, fontWeight: 800, color: d.color, margin: 0 }}>{d.title}</h2>
            </div>
          </div>
          <p style={{ fontSize: 14, fontWeight: 600, color: d.color, margin: 0 }}>{d.fullTitle}</p>
          <p style={{ fontSize: 13, color: C.dim, margin: "4px 0 0" }}>{d.subtitle}</p>
        </div>

        {/* Findings summary */}
        <div style={{ background: C.card, borderRadius: C.r, border: `1px solid ${C.border}`, padding: 16, marginBottom: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
            <ClipboardList size={16} color={C.accent} />
            <span style={{ fontSize: 14, fontWeight: 700 }}>Achados clínicos</span>
          </div>
          {[
            { list: SYMPTOMS, label: "SINTOMAS", bg: "#e0f2fe", c: "#0369a1" },
            { list: WARNINGS, label: "SINAIS DE ALARME", bg: "#fef3c7", c: "#92400e" },
            { list: SEVERITY, label: "GRAVIDADE", bg: "#fee2e2", c: "#991b1b" },
            { list: SPECIAL, label: "CONDIÇÕES ESPECIAIS", bg: "#dcfce7", c: "#166534" },
          ].map(({ list, label, bg, c: tc }) => {
            const items = getChecked(list);
            if (!items.length) return null;
            return (
              <div key={label} style={{ marginBottom: 10 }}>
                <div style={{ fontSize: 11, fontWeight: 800, color: tc, marginBottom: 4, letterSpacing: 0.3 }}>{label}</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                  {items.map((i) => <span key={i.id} style={{ fontSize: 12, padding: "3px 9px", borderRadius: 6, background: bg, color: tc, fontWeight: 600 }}>{i.label}</span>)}
                </div>
              </div>
            );
          })}
        </div>

        {/* Conduct */}
        <div style={{ background: C.card, borderRadius: C.r, border: `1px solid ${C.border}`, borderLeft: `4px solid ${d.color}`, padding: 16, marginBottom: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
            <Syringe size={16} color={d.color} />
            <span style={{ fontSize: 14, fontWeight: 700 }}>Conduta — {d.tag}</span>
          </div>
          <div style={{ fontSize: 13, marginBottom: 6 }}><MapPin size={13} color={C.dim} style={{ verticalAlign: -2 }} /> <strong>Local:</strong> {d.local}</div>
          <div style={{ fontSize: 13, marginBottom: 14 }}><FlaskConical size={13} color={C.dim} style={{ verticalAlign: -2 }} /> <strong>Exames:</strong> {d.exames}</div>
          {d.conduta.map((c, i) => (
            <div key={i} style={{ display: "flex", gap: 8, marginBottom: 8, fontSize: 13, lineHeight: 1.55 }}>
              <span style={{ width: 22, height: 22, borderRadius: 7, background: d.bg, border: `1.5px solid ${d.border}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 800, color: d.color, flexShrink: 0 }}>{i + 1}</span>
              <span>{c}</span>
            </div>
          ))}
          {d.retorno && <div style={{ fontSize: 13, marginTop: 10, padding: "10px 12px", borderRadius: 10, background: d.bg, border: `1px solid ${d.border}` }}><Clock size={13} color={d.color} style={{ verticalAlign: -2 }} /> <strong>Retorno:</strong> {d.retorno}</div>}
          {d.alta && <div style={{ fontSize: 13, marginTop: 8, padding: "10px 12px", borderRadius: 10, background: "#fefce8", border: "1px solid #fde68a" }}><CheckCircle2 size={13} color="#a16207" style={{ verticalAlign: -2 }} /> <strong>Alta:</strong> {d.alta}</div>}
        </div>

        {/* Hydration calculator */}
        <div style={{ background: C.card, borderRadius: C.r, border: `2px solid ${d.color}`, padding: 16, marginBottom: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
            <Droplets size={18} color={d.color} />
            <span style={{ fontSize: 15, fontWeight: 800, color: d.color }}>Cálculo de Hidratação</span>
          </div>

          <div style={{ display: "flex", gap: 10, marginBottom: 12, alignItems: "center" }}>
            <Scale size={16} color={C.dim} />
            <input type="number" inputMode="decimal" value={weight} onChange={(e) => setWeight(e.target.value)} placeholder="Peso (kg)" style={{ flex: 1, padding: "12px 14px", borderRadius: 11, border: `1.5px solid ${C.border}`, fontSize: 15, fontWeight: 700, outline: "none", background: "#fff", color: C.text, fontFamily: "inherit" }} />
          </div>

          <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
            {[{ v: "adult", l: "Adulto (≥13a)", ic: Users }, { v: "child", l: "Criança (<13a)", ic: Baby }].map((o) => (
              <button key={o.v} onClick={() => setAgeType(o.v)} style={{ flex: 1, padding: "10px 8px", borderRadius: 10, border: `1.5px solid ${ageType === o.v ? d.color : C.border}`, fontSize: 13, fontWeight: 700, cursor: "pointer", background: ageType === o.v ? d.bg : "#f8fafc", color: ageType === o.v ? d.color : C.dim, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, fontFamily: "inherit" }}>
                <o.ic size={14} />
                {o.l}
              </button>
            ))}
          </div>

          {hyd && hyd.t === "oral" && (
            <div style={{ background: d.bg, borderRadius: 12, padding: 14, border: `1px solid ${d.border}` }}>
              <div style={{ fontSize: 14, fontWeight: 800, color: d.color, marginBottom: 10 }}>Hidratação ORAL</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                <Metric label="Volume total/dia" value={`${hyd.total} mL`} color={d.color} />
                <Metric label="SRO (1/3)" value={`${hyd.sro} mL`} />
                <Metric label="Líquidos caseiros (2/3)" value={`${hyd.caseiro} mL`} />
                <Metric label="Primeiras 4–6h" value={`${hyd.first6h} mL`} color={d.color} />
              </div>
              <div style={{ fontSize: 12, color: C.dim, marginTop: 10 }}>Restante ({hyd.total - hyd.first6h} mL) ao longo do dia. Manter durante febre + 24–48h após defervescência.</div>
            </div>
          )}

          {hyd && hyd.t === "iv_c" && (
            <div style={{ background: d.bg, borderRadius: 12, padding: 14, border: `1px solid ${d.border}` }}>
              <div style={{ fontSize: 14, fontWeight: 800, color: d.color, marginBottom: 10 }}>Hidratação VENOSA — Grupo C</div>
              <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 8, color: "#92400e" }}>Fase de Expansão (SF 0,9%)</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 12 }}>
                <Metric label="1ª hora (10 mL/kg)" value={`${hyd.exp} mL`} color="#d97706" />
                <Metric label="2ª hora (10 mL/kg)" value={`${hyd.exp} mL`} color="#d97706" />
              </div>
              <div style={{ fontSize: 12, color: C.dim, marginBottom: 12 }}>Total expansão: {hyd.exp * 2} mL em 2h. Repetir até 3x.</div>
              <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 8, color: "#166534" }}>Fase de Manutenção</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                <Metric label="25 mL/kg em 6h" value={`${hyd.m1} mL`} color="#16a34a" />
                <Metric label="25 mL/kg em 8h" value={`${hyd.m2} mL`} color="#16a34a" />
              </div>
              <div style={{ fontSize: 12, color: C.dim, marginTop: 8 }}>Total manutenção: {hyd.m1 + hyd.m2} mL em 14h.</div>
            </div>
          )}

          {hyd && hyd.t === "iv_d" && (
            <div style={{ background: d.bg, borderRadius: 12, padding: 14, border: `1px solid ${d.border}` }}>
              <div style={{ fontSize: 14, fontWeight: 800, color: d.color, marginBottom: 10 }}>Hidratação VENOSA — Grupo D</div>
              <Metric label="Bolus SF 0,9% (20 mL/kg)" value={`${hyd.bolus} mL`} color="#dc2626" />
              <div style={{ fontSize: 13, color: "#991b1b", fontWeight: 700, marginTop: 10, display: "flex", alignItems: "center", gap: 6 }}>
                <AlertTriangle size={14} /> Em até 20 min. Repetir até 3x.
              </div>
              <div style={{ fontSize: 12, color: C.dim, marginTop: 8 }}>Após estabilização → seguir protocolo Grupo C.</div>
            </div>
          )}

          {!hyd && <div style={{ fontSize: 13, color: C.dim, textAlign: "center", padding: 20 }}>Insira o peso para calcular os volumes.</div>}
        </div>

        {/* Attention */}
        <div style={{ background: "#fefce8", borderRadius: C.r, border: "1px solid #fde68a", padding: 16, marginBottom: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
            <AlertTriangle size={16} color="#a16207" />
            <span style={{ fontSize: 14, fontWeight: 700, color: "#92400e" }}>Pontos de atenção</span>
          </div>
          <div style={{ fontSize: 13, lineHeight: 1.6, color: "#92400e" }}>
            {(grp === "C" || grp === "D") && <p style={{ marginBottom: 6 }}>• Idosos/cardiopatas: adequar volumes, monitorar edema pulmonar.</p>}
            {(grp === "C" || grp === "D") && <p style={{ marginBottom: 6 }}>• Oferecer O₂ em choque. Evitar procedimentos invasivos desnecessários.</p>}
            <p style={{ marginBottom: 6 }}>• NÃO usar AAS, AINEs ou corticoides.</p>
            <p style={{ marginBottom: 6 }}>• Alarme e agravamento: fase de defervescência (remissão da febre).</p>
            <p>• Ferramenta educacional — conduta final sob responsabilidade médica.</p>
          </div>
        </div>

        <div style={{ textAlign: "center", fontSize: 11, color: C.dim, padding: "4px 0 16px" }}>
          Ref.: MS — Dengue: diagnóstico e manejo clínico, 6ª ed., 2024.
        </div>
      </>
    );
  };

  return (
    <div style={{ maxWidth: 430, margin: "0 auto", minHeight: "100dvh", background: C.bg, fontFamily: "'DM Sans',system-ui,sans-serif", display: "flex", flexDirection: "column" }}>
      <style>{css}</style>

      {/* Header */}
      <div style={{ background: `linear-gradient(135deg, ${C.accentDark} 0%, #0284c7 60%, #0ea5e9 100%)`, padding: "48px 18px 16px", color: "#fff", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
          <button onClick={() => setPage("home")} style={{ background: "rgba(255,255,255,0.15)", border: "none", borderRadius: 10, width: 34, height: 34, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#fff" }}>
            <ChevronLeft size={20} />
          </button>
          <div style={{ flex: 1 }}>
            <h1 style={{ fontSize: 18, fontWeight: 800, margin: 0, letterSpacing: -0.3 }}>DengueCare</h1>
            <div style={{ fontSize: 11, opacity: 0.7 }}>{STEPS[step].label} — Etapa {step + 1}/{STEPS.length}</div>
          </div>
          <button onClick={startFlow} style={{ background: "rgba(255,255,255,0.15)", border: "none", borderRadius: 10, width: 34, height: 34, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#fff" }}>
            <RotateCcw size={16} />
          </button>
        </div>
        {/* Stepper */}
        <div style={{ display: "flex", gap: 4 }}>
          {STEPS.map((st, i) => (
            <div key={st.id} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
              <div style={{ width: "100%", height: 4, borderRadius: 99, background: i < step ? "#38bdf8" : i === step ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.2)", transition: "all 0.3s" }} />
              <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
                <st.icon size={10} style={{ opacity: i === step ? 1 : 0.4 }} />
                <span style={{ fontSize: 9, fontWeight: i === step ? 700 : 400, opacity: i === step ? 1 : 0.5 }}>{st.label}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, padding: "14px 14px 90px", overflowY: "auto" }}>
        {sid === "symptoms" && (
          <div style={{ background: C.card, borderRadius: C.r, border: `1px solid ${C.border}`, padding: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
              <Thermometer size={18} color={C.accent} />
              <span style={{ fontSize: 15, fontWeight: 700 }}>Sintomas iniciais</span>
            </div>
            <div style={{ fontSize: 13, color: C.dim, marginBottom: 14 }}>Febre (2–7 dias) + 2 ou mais manifestações.</div>
            {SYMPTOMS.map((i) => <CheckItem key={i.id} item={i} hasIcon />)}
          </div>
        )}
        {sid === "warnings" && (
          <div style={{ background: C.card, borderRadius: C.r, border: `1px solid ${C.border}`, borderLeft: "4px solid #f59e0b", padding: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
              <AlertTriangle size={18} color="#d97706" />
              <span style={{ fontSize: 15, fontWeight: 700 }}>Sinais de alarme</span>
            </div>
            <div style={{ fontSize: 13, color: C.dim, marginBottom: 14 }}>Fase de defervescência (3°–7° dia). Um sinal → Grupo C.</div>
            {WARNINGS.map((i) => <CheckItem key={i.id} item={i} />)}
          </div>
        )}
        {sid === "severity" && (
          <div style={{ background: C.card, borderRadius: C.r, border: `1px solid ${C.border}`, borderLeft: "4px solid #dc2626", padding: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
              <HeartPulse size={18} color="#dc2626" />
              <span style={{ fontSize: 15, fontWeight: 700 }}>Sinais de gravidade</span>
            </div>
            <div style={{ fontSize: 13, color: C.dim, marginBottom: 14 }}>Qualquer critério → Grupo D (emergência/UTI).</div>
            {SEVERITY.map((i) => <CheckItem key={i.id} item={i} />)}
          </div>
        )}
        {sid === "special" && (
          <div style={{ background: C.card, borderRadius: C.r, border: `1px solid ${C.border}`, borderLeft: "4px solid #16a34a", padding: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
              <UserCheck size={18} color="#16a34a" />
              <span style={{ fontSize: 15, fontWeight: 700 }}>Condições especiais / Comorbidades</span>
            </div>
            <div style={{ fontSize: 13, color: C.dim, marginBottom: 14 }}>Sem alarme, mas com fator de risco → Grupo B.</div>
            {SPECIAL.map((i) => <CheckItem key={i.id} item={i} />)}
          </div>
        )}
        {sid === "result" && renderResult()}
      </div>

      {/* Bottom bar */}
      <div style={{ position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 430, padding: "12px 14px", background: "rgba(240,244,248,0.95)", backdropFilter: "blur(12px)", borderTop: `1px solid ${C.border}`, display: "flex", gap: 10, zIndex: 50 }}>
        {step > 0 && (
          <button onClick={() => setStep(step - 1)} style={{ flex: step === STEPS.length - 1 ? 0 : 1, padding: "13px 18px", borderRadius: 12, border: `1.5px solid ${C.border}`, fontSize: 14, fontWeight: 700, cursor: "pointer", background: C.card, color: C.text, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, fontFamily: "inherit" }}>
            <ChevronLeft size={16} /> Voltar
          </button>
        )}
        {step < STEPS.length - 1 ? (
          <button onClick={() => canNext && setStep(step + 1)} disabled={!canNext} style={{ flex: 2, padding: "13px 18px", borderRadius: 12, border: "none", fontSize: 14, fontWeight: 800, cursor: canNext ? "pointer" : "default", background: canNext ? `linear-gradient(135deg, ${C.accentDark}, #0284c7)` : "#cbd5e1", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, fontFamily: "inherit", boxShadow: canNext ? "0 4px 16px rgba(3,105,161,0.25)" : "none", opacity: canNext ? 1 : 0.5 }}>
            {step === STEPS.length - 2 ? "Ver Resultado" : "Próximo"} <ChevronRight size={16} />
          </button>
        ) : (
          <button onClick={startFlow} style={{ flex: 1, padding: "13px 18px", borderRadius: 12, border: "none", fontSize: 14, fontWeight: 800, cursor: "pointer", background: `linear-gradient(135deg, ${C.accentDark}, #0284c7)`, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, fontFamily: "inherit", boxShadow: "0 4px 16px rgba(3,105,161,0.25)" }}>
            <RotateCcw size={16} /> Nova Avaliação
          </button>
        )}
      </div>
    </div>
  );
}
