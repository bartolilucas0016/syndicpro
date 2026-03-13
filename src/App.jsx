import { useState, useEffect, useRef } from "react";
import * as XLSX from "xlsx";
import { jsPDF } from "jspdf";
import JSZip from "jszip";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://aotxxqqohvmdqjroeape.supabase.co",
  "sb_publishable_kG7dKwVZmigmgTzCr1W4Ag_Y323DJco"
);

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=DM+Sans:wght@300;400;500;600&display=swap');
  * { margin: 0; padding: 0; box-sizing: border-box; }
  :root {
    --bleu-nuit: #0f1b2d; --bleu-profond: #162236; --bleu-moyen: #1e3a5f;
    --or: #c9a84c; --or-clair: #e8c97a; --blanc: #f0ede6; --gris: #8a9ab5;
    --vert: #2ecc71; --rouge: #e74c3c; --orange: #f39c12; --bleu: #3498db;
  }
  html, body, #root { min-height: 100%; }
  body { font-family: 'DM Sans', sans-serif; background: var(--bleu-nuit); color: var(--blanc); }
  ::-webkit-scrollbar { width: 8px; height: 8px; }
  ::-webkit-scrollbar-track { background: var(--bleu-nuit); }
  ::-webkit-scrollbar-thumb { background: var(--bleu-moyen); border-radius: 4px; }
  ::-webkit-scrollbar-corner { background: var(--bleu-nuit); }
  .app { display: flex; min-height: 100vh; }
  .sidebar { width: 240px; height: 100vh; background: var(--bleu-profond); border-right: 1px solid var(--bleu-moyen); display: flex; flex-direction: column; position: fixed; top: 0; left: 0; z-index: 100; overflow: hidden; }
  .sidebar-logo { padding: 24px 20px; border-bottom: 1px solid var(--bleu-moyen); }
  .logo-title { font-family: 'Playfair Display', serif; font-size: 20px; color: var(--or); }
  .logo-sub { font-size: 10px; color: var(--gris); letter-spacing: 2px; text-transform: uppercase; margin-top: 2px; }
  .nav { padding: 16px 10px; flex: 1; overflow-y: auto; }
  .nav-label { font-size: 10px; color: var(--gris); text-transform: uppercase; letter-spacing: 2px; padding: 0 10px; margin: 12px 0 6px; }
  .nav-item { display: flex; align-items: center; gap: 10px; padding: 9px 10px; border-radius: 8px; cursor: pointer; color: var(--gris); font-size: 13px; font-weight: 500; transition: all 0.2s; margin-bottom: 2px; border-left: 3px solid transparent; }
  .nav-item:hover { background: var(--bleu-moyen); color: var(--blanc); }
  .nav-item.active { background: rgba(201,168,76,0.12); color: var(--or-clair); border-left-color: var(--or); }
  .sidebar-user { padding: 14px 20px; border-top: 1px solid var(--bleu-moyen); display: flex; align-items: center; gap: 10px; }
  .avatar { width: 32px; height: 32px; border-radius: 50%; background: linear-gradient(135deg, var(--or), var(--bleu-moyen)); display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 700; color: var(--bleu-nuit); }
  .user-name { font-size: 12px; font-weight: 600; }
  .user-role { font-size: 10px; color: var(--gris); }
  .main { margin-left: 240px; flex: 1; padding: 28px; background: var(--bleu-nuit); min-height: 100vh; }
  .topbar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
  .page-title { font-family: 'Playfair Display', serif; font-size: 24px; }
  .page-sub { font-size: 13px; color: var(--gris); margin-top: 2px; }
  .btn { padding: 9px 18px; border-radius: 8px; border: none; font-family: 'DM Sans', sans-serif; font-size: 13px; font-weight: 600; cursor: pointer; transition: all 0.2s; }
  .btn-primary { background: var(--or); color: var(--bleu-nuit); }
  .btn-primary:hover { background: var(--or-clair); transform: translateY(-1px); }
  .btn-secondary { background: var(--bleu-moyen); color: var(--blanc); }
  .btn-danger { background: rgba(231,76,60,0.2); color: var(--rouge); }
  .btn-edit { background: rgba(52,152,219,0.15); color: var(--bleu); }
  .btn-sm { padding: 5px 12px; font-size: 12px; }
  .stats-grid { display: grid; grid-template-columns: repeat(4,1fr); gap: 16px; margin-bottom: 24px; }
  .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px; }
  .grid-3 { display: grid; grid-template-columns: repeat(3,1fr); gap: 16px; }
  .card { background: var(--bleu-profond); border: 1px solid var(--bleu-moyen); border-radius: 12px; padding: 20px; }
  .card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
  .card-title { font-size: 14px; font-weight: 600; }
  .stat-card { background: var(--bleu-profond); border: 1px solid var(--bleu-moyen); border-radius: 12px; padding: 18px 20px; }
  .stat-label { font-size: 11px; color: var(--gris); text-transform: uppercase; letter-spacing: 1px; margin-bottom: 10px; }
  .stat-value { font-size: 26px; font-weight: 600; }
  .stat-sub { font-size: 11px; color: var(--gris); margin-top: 4px; }
  .table-wrap { overflow-x: auto; background: var(--bleu-profond); }
  .search-bar { display: flex; align-items: center; gap: 10px; background: var(--bleu-nuit); border: 1px solid var(--bleu-moyen); border-radius: 8px; padding: 8px 14px; margin-bottom: 16px; }
  .search-bar input { background: none; border: none; outline: none; color: var(--blanc); font-size: 13px; width: 100%; }
  .search-bar input::placeholder { color: var(--gris); }
  table { width: 100%; border-collapse: collapse; }
  thead th { text-align: left; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: var(--gris); padding: 8px 16px 10px 0; border-bottom: 1px solid var(--bleu-moyen); }
  thead th:last-child { padding-right: 0; }
  tbody tr { border-bottom: 1px solid rgba(30,58,95,0.5); transition: background 0.15s; }
  tbody tr:hover { background: rgba(30,58,95,0.4); }
  tbody tr:last-child { border-bottom: none; }
  tbody td { padding: 14px 16px 14px 0; font-size: 13px; }
  tbody td:last-child { padding-right: 0; }
  .badge { display: inline-flex; align-items: center; gap: 4px; padding: 3px 9px; border-radius: 20px; font-size: 11px; font-weight: 600; }
  .badge-green { background: rgba(46,204,113,0.15); color: var(--vert); }
  .badge-orange { background: rgba(243,156,18,0.15); color: var(--orange); }
  .badge-red { background: rgba(231,76,60,0.15); color: var(--rouge); }
  .badge-blue { background: rgba(52,152,219,0.15); color: var(--bleu); }
  .badge-gray { background: rgba(138,154,181,0.15); color: var(--gris); }
  .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.7); display: flex; align-items: center; justify-content: center; z-index: 999; }
  .modal { background: var(--bleu-profond); border: 1px solid var(--bleu-moyen); border-radius: 16px; padding: 28px; width: 480px; max-width: 95vw; max-height: 90vh; overflow-y: auto; }
  .modal-title { font-family: 'Playfair Display', serif; font-size: 20px; margin-bottom: 20px; color: var(--or-clair); }
  .form-group { margin-bottom: 14px; }
  .form-label { font-size: 12px; color: var(--gris); margin-bottom: 6px; display: block; text-transform: uppercase; letter-spacing: 0.5px; }
  .form-input { width: 100%; padding: 10px 14px; background: var(--bleu-nuit); border: 1px solid var(--bleu-moyen); border-radius: 8px; color: var(--blanc); font-family: 'DM Sans', sans-serif; font-size: 13px; outline: none; }
  .form-input:focus { border-color: var(--or); }
  .form-input option { background: var(--bleu-nuit); }
  .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
  .modal-actions { display: flex; gap: 10px; justify-content: flex-end; margin-top: 20px; }
  .list-item { display: flex; align-items: center; gap: 12px; padding: 12px; border-radius: 8px; background: rgba(30,58,95,0.3); margin-bottom: 8px; transition: all 0.2s; }
  .list-item:hover { background: rgba(30,58,95,0.6); }
  .list-icon { font-size: 18px; width: 36px; height: 36px; background: var(--bleu-moyen); border-radius: 8px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
  .list-content { flex: 1; min-width: 0; }
  .list-title { font-size: 13px; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .list-sub { font-size: 11px; color: var(--gris); margin-top: 2px; }
  .list-actions { display: flex; gap: 6px; flex-shrink: 0; }
  .empty { text-align: center; padding: 40px 20px; color: var(--gris); }
  .empty-icon { font-size: 36px; margin-bottom: 10px; }
  .empty-text { font-size: 13px; }
  .loading { display: flex; align-items: center; justify-content: center; padding: 40px; color: var(--gris); font-size: 13px; gap: 10px; }
  .toast { position: fixed; bottom: 24px; right: 24px; z-index: 9999; background: var(--bleu-profond); border: 1px solid var(--bleu-moyen); border-radius: 10px; padding: 14px 18px; font-size: 13px; display: flex; align-items: center; gap: 10px; box-shadow: 0 8px 30px rgba(0,0,0,0.4); }
  .toast-success { border-left: 3px solid var(--vert); }
  .toast-error { border-left: 3px solid var(--rouge); }
`;

function Toast({ message, type, onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 3000); return () => clearTimeout(t); }, []);
  return <div className={`toast toast-${type}`}><span>{type === "success" ? "✅" : "❌"}</span>{message}</div>;
}

function Modal({ title, onClose, children }) {
  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <div className="modal-title">{title}</div>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "var(--gris)", fontSize: 20, cursor: "pointer" }}>✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

function Badge({ statut }) {
  const map = {
    paye: ["badge-green", "Payé"], en_attente: ["badge-orange", "En attente"],
    impaye: ["badge-red", "Impayé"], partiel: ["badge-blue", "Partiel"],
    planifie: ["badge-blue", "Planifié"], en_cours: ["badge-orange", "En cours"],
    termine: ["badge-green", "Terminé"], planifiee: ["badge-blue", "Planifiée"],
    tenue: ["badge-green", "Tenue"], ordinaire: ["badge-gray", "Ordinaire"],
    extraordinaire: ["badge-orange", "Extraordinaire"],
    ouvert: ["badge-red", "Ouvert"], resolu: ["badge-green", "Résolu"],
  };
  const [cls, label] = map[statut] || ["badge-gray", statut];
  return <span className={`badge ${cls}`}>{label}</span>;
}

function Dashboard() {
  const [stats, setStats] = useState({ residences: 0, coproprietaires: 0, impayes: 0, travaux: 0 });
  const [paiements, setPaiements] = useState([]);
  const [travaux, setTravaux] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [r, c, p, t, dp] = await Promise.all([
        supabase.from("residences").select("id", { count: "exact" }),
        supabase.from("coproprietaires").select("id", { count: "exact" }),
        supabase.from("paiements").select("*").eq("statut", "impaye"),
        supabase.from("travaux").select("*").order("created_at", { ascending: false }).limit(4),
        supabase.from("paiements").select("*, coproprietaires(nom, prenom, lot), charges(titre)").order("created_at", { ascending: false }).limit(5),
      ]);
      setStats({ residences: r.count || 0, coproprietaires: c.count || 0, impayes: p.data?.length || 0, travaux: t.data?.filter(x => x.statut === "en_cours").length || 0 });
      setPaiements(dp.data || []);
      setTravaux(t.data || []);
      setLoading(false);
    }
    load();
  }, []);

  if (loading) return <div className="loading">⏳ Chargement...</div>;

  return (
    <div>
      <div className="topbar"><div><div className="page-title">Tableau de bord</div><div className="page-sub">Bienvenue — tout est à jour ✓</div></div></div>
      <div className="stats-grid">
        <div className="stat-card"><div className="stat-label">🏢 Résidences</div><div className="stat-value" style={{ color: "var(--or-clair)" }}>{stats.residences}</div><div className="stat-sub">immeubles gérés</div></div>
        <div className="stat-card"><div className="stat-label">👥 Copropriétaires</div><div className="stat-value">{stats.coproprietaires}</div><div className="stat-sub">enregistrés</div></div>
        <div className="stat-card"><div className="stat-label">⚠️ Impayés</div><div className="stat-value" style={{ color: stats.impayes > 0 ? "var(--rouge)" : "var(--vert)" }}>{stats.impayes}</div><div className="stat-sub">en retard</div></div>
        <div className="stat-card"><div className="stat-label">🔧 Travaux actifs</div><div className="stat-value" style={{ color: "var(--orange)" }}>{stats.travaux}</div><div className="stat-sub">en cours</div></div>
      </div>
      <div className="grid-2">
        <div className="card">
          <div className="card-header"><span className="card-title">💰 Derniers paiements</span></div>
          {paiements.length === 0 ? <div className="empty"><div className="empty-icon">💳</div><div className="empty-text">Aucun paiement</div></div> : (
            <div className="table-wrap"><table><thead><tr><th>Copropriétaire</th><th>Montant</th><th>Statut</th></tr></thead>
              <tbody>{paiements.map(p => <tr key={p.id}><td>{p.coproprietaires ? `${p.coproprietaires.prenom} ${p.coproprietaires.nom}` : "—"}</td><td style={{ color: "var(--or-clair)", fontWeight: 600 }}>{p.montant} €</td><td><Badge statut={p.statut} /></td></tr>)}</tbody>
            </table></div>
          )}
        </div>
        <div className="card">
          <div className="card-header"><span className="card-title">🔧 Travaux récents</span></div>
          {travaux.length === 0 ? <div className="empty"><div className="empty-icon">🏗️</div><div className="empty-text">Aucun travaux</div></div> :
            travaux.map(t => <div className="list-item" key={t.id}><div className="list-icon">{t.urgence ? "🚨" : "🔧"}</div><div className="list-content"><div className="list-title">{t.titre}</div><div className="list-sub">{t.prestataire || "—"}</div></div><Badge statut={t.statut} /></div>)
          }
        </div>
      </div>
    </div>
  );
}

function Residences({ showToast, userId }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const emptyForm = { nom: "", adresse: "", ville: "", code_postal: "", nb_lots: "" };
  const [form, setForm] = useState(emptyForm);
  const [recherche, setRecherche] = useState("");

  async function load() {
    const { data: r } = await supabase.from("residences").select("*").order("nom");
    setData(r || []);
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  function openCreate() { setForm(emptyForm); setEditing(null); setModal(true); }
  function openEdit(r) { setForm({ nom: r.nom, adresse: r.adresse, ville: r.ville, code_postal: r.code_postal || "", nb_lots: r.nb_lots || "" }); setEditing(r.id); setModal(true); }
  function closeModal() { setModal(false); setEditing(null); setForm(emptyForm); }

  async function save() {
    if (!form.nom || !form.adresse || !form.ville) return showToast("Remplissez les champs obligatoires", "error");
    const payload = { ...form, nb_lots: parseInt(form.nb_lots) || 0 };
    const { error } = editing
      ? await supabase.from("residences").update(payload).eq("id", editing)
      : await supabase.from("residences").insert([{ ...payload, user_id: userId }]);
    if (error) return showToast("Erreur : " + error.message, "error");
    showToast(editing ? "Résidence mise à jour ✓" : "Résidence ajoutée ✓", "success");
    closeModal(); load();
  }

  async function supprimer(id) {
    if (!confirm("Supprimer cette résidence ?")) return;
    await supabase.from("residences").delete().eq("id", id);
    showToast("Supprimée", "success"); load();
  }

  if (loading) return <div className="loading">⏳ Chargement...</div>;

  return (
    <div>
      <div className="topbar">
        <div><div className="page-title">🏢 Résidences</div><div className="page-sub">{data.length} résidence(s) gérée(s)</div></div>
        <button className="btn btn-primary" onClick={openCreate}>+ Ajouter</button>
      </div>
      <div className="search-bar"><span style={{ color: "var(--gris)" }}>🔍</span><input placeholder="Rechercher par nom, ville, adresse…" value={recherche} onChange={e => setRecherche(e.target.value)} /></div>
      <div className="grid-3">
        {(() => { const filtres = data.filter(r => { const q = recherche.toLowerCase(); return !q || `${r.nom} ${r.ville} ${r.adresse}`.toLowerCase().includes(q); }); return filtres.length === 0 ? (
          <div className="empty"><div className="empty-icon">🏢</div><div className="empty-text">{recherche ? "Aucun résultat" : "Aucune résidence"}</div></div>
        ) : filtres.map(r => (
          <div className="card" key={r.id}>
            <div className="card-header">
              <span className="card-title">🏢 {r.nom}</span>
              <div style={{ display: "flex", gap: 6 }}>
                <button className="btn btn-edit btn-sm" onClick={() => openEdit(r)}>✏️</button>
                <button className="btn btn-danger btn-sm" onClick={() => supprimer(r.id)}>🗑️</button>
              </div>
            </div>
            <div style={{ fontSize: 13, color: "var(--gris)", lineHeight: 1.8 }}>
              <div>📍 {r.adresse}</div>
              <div>🏙️ {r.code_postal} {r.ville}</div>
              <div>🔑 {r.nb_lots} lots</div>
            </div>
          </div>
        )); })()}
      </div>
      {modal && (
        <Modal title={editing ? "✏️ Modifier la résidence" : "🏢 Nouvelle résidence"} onClose={closeModal}>
          <div className="form-group"><label className="form-label">Nom *</label><input className="form-input" placeholder="ex: Les Oliviers" value={form.nom} onChange={e => setForm({ ...form, nom: e.target.value })} /></div>
          <div className="form-group"><label className="form-label">Adresse *</label><input className="form-input" placeholder="ex: 12 Avenue des Mimosas" value={form.adresse} onChange={e => setForm({ ...form, adresse: e.target.value })} /></div>
          <div className="form-row">
            <div className="form-group"><label className="form-label">Ville *</label><input className="form-input" value={form.ville} onChange={e => setForm({ ...form, ville: e.target.value })} /></div>
            <div className="form-group"><label className="form-label">Code postal</label><input className="form-input" value={form.code_postal} onChange={e => setForm({ ...form, code_postal: e.target.value })} /></div>
          </div>
          <div className="form-group"><label className="form-label">Nombre de lots</label><input className="form-input" type="number" value={form.nb_lots} onChange={e => setForm({ ...form, nb_lots: e.target.value })} /></div>
          <div className="modal-actions">
            <button className="btn btn-secondary" onClick={closeModal}>Annuler</button>
            <button className="btn btn-primary" onClick={save}>✅ {editing ? "Mettre à jour" : "Enregistrer"}</button>
          </div>
        </Modal>
      )}
    </div>
  );
}

function Coproprietaires({ showToast, userId }) {
  const [data, setData] = useState([]);
  const [residences, setResidences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const emptyForm = { nom: "", prenom: "", email: "", telephone: "", lot: "", "tantièmes": "", residence_id: "" };
  const [form, setForm] = useState(emptyForm);
  const [recherche, setRecherche] = useState("");
  const fileRef = useRef(null);

  function telechargerTemplate() {
    const ws = XLSX.utils.aoa_to_sheet([
      ["prenom", "nom", "email", "telephone", "lot", "tantiemes"],
      ["Jean", "Dupont", "jean.dupont@email.com", "0601020304", "A01", "150"],
      ["Marie", "Martin", "marie.martin@email.com", "0605060708", "B02", "200"],
    ]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Copropriétaires");
    XLSX.writeFile(wb, "template_coproprietaires.xlsx");
  }

  async function importerExcel(e) {
    const file = e.target.files[0];
    if (!file) return;
    e.target.value = "";
    const reader = new FileReader();
    reader.onload = async (ev) => {
      const wb = XLSX.read(ev.target.result, { type: "array" });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(ws, { defval: "" });
      const lignes = rows.filter(r => r.nom && r.email).map(r => ({
        prenom: String(r.prenom || ""),
        nom: String(r.nom),
        email: String(r.email),
        telephone: String(r.telephone || ""),
        lot: String(r.lot || ""),
        "tantièmes": parseInt(r.tantiemes) || 0,
        user_id: userId,
      }));
      if (lignes.length === 0) return showToast("Aucune ligne valide trouvée (nom + email requis)", "error");
      const { error } = await supabase.from("coproprietaires").insert(lignes);
      if (error) return showToast("Erreur import : " + error.message, "error");
      showToast(`${lignes.length} copropriétaire(s) importé(s) ✓`, "success");
      load();
    };
    reader.readAsArrayBuffer(file);
  }

  async function load() {
    const [c, r] = await Promise.all([supabase.from("coproprietaires").select("*, residences(nom)").order("nom"), supabase.from("residences").select("id, nom")]);
    setData(c.data || []); setResidences(r.data || []); setLoading(false);
  }
  useEffect(() => { load(); }, []);

  function openCreate() { setForm(emptyForm); setEditing(null); setModal(true); }
  function openEdit(c) {
    setForm({ nom: c.nom, prenom: c.prenom, email: c.email || "", telephone: c.telephone || "", lot: c.lot || "", "tantièmes": c["tantièmes"] || "", residence_id: c.residence_id || "" });
    setEditing(c.id); setModal(true);
  }
  function closeModal() { setModal(false); setEditing(null); setForm(emptyForm); }

  async function save() {
    if (!form.nom || !form.prenom || !form.email || !form.lot) return showToast("Remplissez tous les champs obligatoires", "error");
    const payload = { ...form, "tantièmes": parseInt(form["tantièmes"]) || 0 };
    if (editing) {
      const { error } = await supabase.from("coproprietaires").update(payload).eq("id", editing);
      if (error) return showToast("Erreur : " + error.message, "error");
    } else {
      const { data: inserted, error } = await supabase.from("coproprietaires").insert([{ ...payload, user_id: userId }]).select().single();
      if (error) return showToast("Erreur : " + error.message, "error");
      if (inserted && form.email) {
        await fetch("/api/inviter-copro", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: form.email, copro_id: inserted.id, prenom: form.prenom, nom: form.nom, role: "coproprietaire" }),
        });
      }
    }
    showToast(editing ? "Copropriétaire mis à jour ✓" : "Copropriétaire ajouté ✓", "success");
    closeModal(); load();
  }

  async function supprimer(id) {
    if (!confirm("Supprimer ?")) return;
    await supabase.from("coproprietaires").delete().eq("id", id);
    showToast("Supprimé", "success"); load();
  }

  if (loading) return <div className="loading">⏳ Chargement...</div>;
  return (
    <div>
      <div className="topbar">
        <div><div className="page-title">👥 Copropriétaires</div><div className="page-sub">{data.length} propriétaire(s)</div></div>
        <button className="btn btn-primary" onClick={openCreate}>+ Ajouter</button>
      </div>
      <div className="card">
        <div className="search-bar"><span style={{ color: "var(--gris)" }}>🔍</span><input placeholder="Rechercher par nom, lot, email, résidence…" value={recherche} onChange={e => setRecherche(e.target.value)} /></div>
        {(() => { const filtres = data.filter(c => { const q = recherche.toLowerCase(); return !q || `${c.prenom} ${c.nom} ${c.lot} ${c.email} ${c.residences?.nom || ""}`.toLowerCase().includes(q); }); return filtres.length === 0 ? <div className="empty"><div className="empty-icon">👤</div><div className="empty-text">{recherche ? "Aucun résultat" : "Aucun copropriétaire"}</div></div> : (
          <div className="table-wrap"><table>
            <thead><tr><th>Nom</th><th>Lot</th><th>Email</th><th>Résidence</th><th>Tantièmes</th><th></th></tr></thead>
            <tbody>{filtres.map(c => (
              <tr key={c.id}>
                <td><strong>{c.prenom} {c.nom}</strong></td>
                <td style={{ color: "var(--or-clair)" }}>{c.lot}</td>
                <td style={{ color: "var(--gris)" }}>{c.email}</td>
                <td>{c.residences?.nom || "—"}</td>
                <td>{c["tantièmes"]}</td>
                <td>
                  <div style={{ display: "flex", gap: 6 }}>
                    <button className="btn btn-edit btn-sm" onClick={() => openEdit(c)}>✏️</button>
                    <button className="btn btn-danger btn-sm" onClick={() => supprimer(c.id)}>🗑️</button>
                  </div>
                </td>
              </tr>
            ))}</tbody>
          </table></div>
        ); })()}
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 16 }}>
          <button className="btn btn-secondary" onClick={telechargerTemplate}>⬇️ Template Excel</button>
          <button className="btn btn-secondary" onClick={() => fileRef.current.click()}>📂 Importer Excel</button>
          <input ref={fileRef} type="file" accept=".xlsx,.xls,.csv" style={{ display: "none" }} onChange={importerExcel} />
        </div>
      </div>
      {modal && <Modal title={editing ? "✏️ Modifier le copropriétaire" : "➕ Nouveau copropriétaire"} onClose={closeModal}>
        <div className="form-row">
          <div className="form-group"><label className="form-label">Prénom *</label><input className="form-input" value={form.prenom} onChange={e => setForm({ ...form, prenom: e.target.value })} /></div>
          <div className="form-group"><label className="form-label">Nom *</label><input className="form-input" value={form.nom} onChange={e => setForm({ ...form, nom: e.target.value })} /></div>
        </div>
        <div className="form-group"><label className="form-label">Email *</label><input className="form-input" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} /></div>
        <div className="form-row">
          <div className="form-group"><label className="form-label">Téléphone</label><input className="form-input" value={form.telephone} onChange={e => setForm({ ...form, telephone: e.target.value })} /></div>
          <div className="form-group"><label className="form-label">Lot *</label><input className="form-input" value={form.lot} onChange={e => setForm({ ...form, lot: e.target.value })} /></div>
        </div>
        <div className="form-row">
          <div className="form-group"><label className="form-label">Tantièmes</label><input className="form-input" type="number" value={form["tantièmes"]} onChange={e => setForm({ ...form, "tantièmes": e.target.value })} /></div>
          <div className="form-group"><label className="form-label">Résidence</label>
            <select className="form-input" value={form.residence_id} onChange={e => setForm({ ...form, residence_id: e.target.value })}>
              <option value="">Sélectionner...</option>
              {residences.map(r => <option key={r.id} value={r.id}>{r.nom}</option>)}
            </select>
          </div>
        </div>
        <div className="modal-actions"><button className="btn btn-secondary" onClick={closeModal}>Annuler</button><button className="btn btn-primary" onClick={save}>✅ {editing ? "Mettre à jour" : "Enregistrer"}</button></div>
      </Modal>}
    </div>
  );
}

function buildAppalDeFondsPDF(copro, charge, quotePart) {
  const doc = new jsPDF();
  doc.setFillColor(15, 27, 45); doc.rect(0, 0, 210, 40, "F");
  doc.setTextColor(201, 168, 76); doc.setFontSize(22); doc.text("SyndicPro", 14, 18);
  doc.setFontSize(10); doc.setTextColor(138, 154, 181);
  doc.text("Appel de fonds — " + (charge.residences?.nom || ""), 14, 28);
  doc.text("Réf. AF-" + charge.id.slice(0, 8).toUpperCase(), 14, 35);
  doc.setTextColor(240, 237, 230); doc.setFontSize(13); doc.text("Destinataire", 14, 55);
  doc.setFontSize(11); doc.setTextColor(138, 154, 181);
  doc.text(`${copro.prenom} ${copro.nom}`, 14, 63);
  doc.text(`Lot : ${copro.lot || "—"}  ·  Tantièmes : ${copro["tantièmes"] || 0}`, 14, 70);
  doc.setDrawColor(30, 58, 95); doc.line(14, 78, 196, 78);
  doc.setTextColor(240, 237, 230); doc.setFontSize(13); doc.text("Détail de l'appel de fonds", 14, 90);
  doc.setFontSize(11); doc.setTextColor(138, 154, 181);
  doc.text(`Objet : ${charge.titre}`, 14, 100);
  doc.text(`Montant total : ${charge.montant_total} €`, 14, 108);
  doc.text(`Échéance : ${charge.date_echeance || "—"}`, 14, 116);
  doc.text(`Trimestre : ${charge.trimestre || "—"}`, 14, 124);
  doc.setFillColor(22, 34, 54); doc.roundedRect(14, 135, 182, 30, 4, 4, "F");
  doc.setTextColor(138, 154, 181); doc.setFontSize(10); doc.text("Votre quote-part", 20, 146);
  doc.setTextColor(201, 168, 76); doc.setFontSize(20); doc.text(`${quotePart} €`, 20, 158);
  doc.setTextColor(138, 154, 181); doc.setFontSize(9); doc.text("Document généré automatiquement par SyndicPro", 14, 280);
  return doc;
}

function Charges({ showToast, userId }) {
  const [charges, setCharges] = useState([]);
  const [paiements, setPaiements] = useState([]);
  const [copros, setCopros] = useState([]);
  const [residences, setResidences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalCharge, setModalCharge] = useState(false);
  const [modalPaiement, setModalPaiement] = useState(false);
  const [editingCharge, setEditingCharge] = useState(null);
  const [editingPaiement, setEditingPaiement] = useState(null);
  const emptyCharge = { titre: "", montant_total: "", date_echeance: "", residence_id: "", trimestre: "" };
  const emptyPaiement = { charge_id: "", coproprietaire_id: "", montant: "", statut: "paye", mode_paiement: "virement", date_paiement: new Date().toISOString().split("T")[0] };
  const [formCharge, setFormCharge] = useState(emptyCharge);
  const [formPaiement, setFormPaiement] = useState(emptyPaiement);
  const [recherche, setRecherche] = useState("");
  const [filtreResidence, setFiltreResidence] = useState("");
  const [filtreStatut, setFiltreStatut] = useState("");

  async function load() {
    const [ch, p, c, r] = await Promise.all([
      supabase.from("charges").select("*, residences(nom)").order("date_echeance", { ascending: false }),
      supabase.from("paiements").select("*, coproprietaires(nom, prenom, email, lot), charges(titre)").order("created_at", { ascending: false }),
      supabase.from("coproprietaires").select("id, nom, prenom, lot, email, tantièmes, residence_id"),
      supabase.from("residences").select("id, nom"),
    ]);
    setCharges(ch.data || []); setPaiements(p.data || []); setCopros(c.data || []); setResidences(r.data || []); setLoading(false);
  }
  useEffect(() => { load(); }, []);

  function openCreateCharge() { setFormCharge(emptyCharge); setEditingCharge(null); setModalCharge(true); }
  function openEditCharge(c) {
    setFormCharge({ titre: c.titre, montant_total: c.montant_total, date_echeance: c.date_echeance || "", residence_id: c.residence_id || "", trimestre: c.trimestre || "" });
    setEditingCharge(c.id); setModalCharge(true);
  }
  function closeModalCharge() { setModalCharge(false); setEditingCharge(null); setFormCharge(emptyCharge); }

  function openCreatePaiement() { setFormPaiement(emptyPaiement); setEditingPaiement(null); setModalPaiement(true); }
  function openEditPaiement(p) {
    setFormPaiement({ charge_id: p.charge_id, coproprietaire_id: p.coproprietaire_id, montant: p.montant, statut: p.statut, mode_paiement: p.mode_paiement || "virement", date_paiement: p.date_paiement || new Date().toISOString().split("T")[0] });
    setEditingPaiement(p.id); setModalPaiement(true);
  }
  function closeModalPaiement() { setModalPaiement(false); setEditingPaiement(null); setFormPaiement(emptyPaiement); }

  async function saveCharge() {
    if (!formCharge.titre || !formCharge.montant_total) return showToast("Champs obligatoires manquants", "error");
    const payload = { ...formCharge, montant_total: parseFloat(formCharge.montant_total) };
    const { error } = editingCharge
      ? await supabase.from("charges").update(payload).eq("id", editingCharge)
      : await supabase.from("charges").insert([{ ...payload, user_id: userId }]);
    if (error) return showToast("Erreur : " + error.message, "error");
    showToast(editingCharge ? "Appel de fonds mis à jour ✓" : "Charge ajoutée ✓", "success");
    closeModalCharge(); load();
  }

  async function supprimerCharge(id) {
    if (!confirm("Supprimer cet appel de fonds ?")) return;
    await supabase.from("charges").delete().eq("id", id);
    showToast("Supprimé", "success"); load();
  }

  async function savePaiement() {
    if (!formPaiement.charge_id || !formPaiement.coproprietaire_id || !formPaiement.montant) return showToast("Remplissez tous les champs", "error");
    const payload = { ...formPaiement, montant: parseFloat(formPaiement.montant) };
    const { error } = editingPaiement
      ? await supabase.from("paiements").update(payload).eq("id", editingPaiement)
      : await supabase.from("paiements").insert([{ ...payload, user_id: userId }]);
    if (error) return showToast("Erreur : " + error.message, "error");
    showToast(editingPaiement ? "Paiement mis à jour ✓" : "Paiement enregistré ✓", "success");
    closeModalPaiement(); load();
    if (!editingPaiement) {
      try {
        const copro = copros.find(c => c.id === formPaiement.coproprietaire_id);
        if (copro?.email) {
          await fetch("/api/envoyer-email", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ type: "recu", destinataire: copro.email, donnees: { nom: copro.nom, prenom: copro.prenom, lot: copro.lot, montant: formPaiement.montant, date: formPaiement.date_paiement } }),
          });
        }
      } catch (e) { console.error("Email non envoyé", e); }
    }
  }

  function calcQuotePart(chargeId, coproId) {
    if (!chargeId || !coproId) return null;
    const charge = charges.find(c => c.id === chargeId);
    const copro = copros.find(c => c.id === coproId);
    if (!charge || !copro || !charge.residence_id) return null;
    const coprosDeLaResidence = copros.filter(c => c.residence_id === charge.residence_id);
    const totalTantiemes = coprosDeLaResidence.reduce((s, c) => s + (c["tantièmes"] || 0), 0);
    if (totalTantiemes === 0) return null;
    return ((charge.montant_total * (copro["tantièmes"] || 0)) / totalTantiemes).toFixed(2);
  }

  async function supprimerPaiement(id) {
    if (!confirm("Supprimer ce paiement ?")) return;
    await supabase.from("paiements").delete().eq("id", id);
    showToast("Supprimé", "success"); load();
  }

  async function genererPDFs(charge) {
    const { data: coprosRes } = await supabase.from("coproprietaires").select("nom, prenom, lot, tantièmes").eq("residence_id", charge.residence_id);
    const liste = coprosRes || [];
    if (liste.length === 0) return showToast("Aucun copropriétaire dans cette résidence", "error");
    const totalTantiemes = liste.reduce((s, c) => s + (c["tantièmes"] || 0), 0);
    const zip = new JSZip();
    liste.forEach(copro => {
      const quotePart = totalTantiemes > 0 ? ((charge.montant_total * (copro["tantièmes"] || 0)) / totalTantiemes).toFixed(2) : "—";
      const doc = buildAppalDeFondsPDF(copro, charge, quotePart);
      zip.file(`${copro.lot || copro.nom}_${charge.titre}.pdf`, doc.output("arraybuffer"));
    });
    const blob = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `appel_de_fonds_${charge.titre}.zip`; a.click();
    URL.revokeObjectURL(url);
    showToast(`${liste.length} PDF(s) générés ✓`, "success");
  }

  async function envoyerPDFsParEmail(charge) {
    const { data: coprosRes } = await supabase.from("coproprietaires").select("nom, prenom, email, lot, tantièmes").eq("residence_id", charge.residence_id);
    const liste = (coprosRes || []).filter(c => c.email);
    if (liste.length === 0) return showToast("Aucun copropriétaire avec email dans cette résidence", "error");
    const totalTantiemes = liste.reduce((s, c) => s + (c["tantièmes"] || 0), 0);
    showToast(`Envoi en cours… 0 / ${liste.length}`, "success");
    let envoyes = 0;
    for (const copro of liste) {
      const quotePart = totalTantiemes > 0 ? ((charge.montant_total * (copro["tantièmes"] || 0)) / totalTantiemes).toFixed(2) : "0.00";
      const pdfBase64 = buildAppalDeFondsPDF(copro, charge, quotePart).output("datauristring").split(",")[1];
      try {
        await fetch("/api/envoyer-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: "appel_de_fonds",
            destinataire: copro.email,
            donnees: { nom: copro.nom, prenom: copro.prenom, lot: copro.lot, titreCharge: charge.titre, residence: charge.residences?.nom || "", echeance: charge.date_echeance, quotePart, pdfBase64, pdfNom: `appel_de_fonds_${copro.lot || copro.nom}.pdf` },
          }),
        });
        envoyes++;
      } catch (e) { console.error("Échec envoi", copro.email, e); }
    }
    showToast(`${envoyes} email(s) envoyé(s) ✓`, "success");
  }

  if (loading) return <div className="loading">⏳ Chargement...</div>;

  const totalAppele = charges.reduce((s, c) => s + (parseFloat(c.montant_total) || 0), 0);
  const totalEncaisse = paiements.filter(p => p.statut === "paye").reduce((s, p) => s + (parseFloat(p.montant) || 0), 0);
  const totalImpaye = paiements.filter(p => p.statut === "impaye" || p.statut === "en_attente").reduce((s, p) => s + (parseFloat(p.montant) || 0), 0);

  return (
    <div>
      <div className="topbar">
        <div><div className="page-title">💰 Charges & Paiements</div><div className="page-sub">{charges.length} appel(s) de fonds · {paiements.length} paiement(s)</div></div>
        <div style={{ display: "flex", gap: 10 }}>
          <button className="btn btn-secondary" onClick={openCreateCharge}>+ Appel de fonds</button>
          <button className="btn btn-primary" onClick={openCreatePaiement}>+ Paiement</button>
        </div>
      </div>

      <div className="stats-grid" style={{ gridTemplateColumns: "repeat(3,1fr)", marginBottom: 24 }}>
        <div className="stat-card"><div className="stat-label">Total appelé</div><div className="stat-value" style={{ color: "var(--or-clair)" }}>{totalAppele.toFixed(2)} €</div></div>
        <div className="stat-card"><div className="stat-label">Encaissé</div><div className="stat-value" style={{ color: "var(--vert)" }}>{totalEncaisse.toFixed(2)} €</div></div>
        <div className="stat-card"><div className="stat-label">En attente / Impayé</div><div className="stat-value" style={{ color: totalImpaye > 0 ? "var(--rouge)" : "var(--vert)" }}>{totalImpaye.toFixed(2)} €</div></div>
      </div>

      <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
        <div className="search-bar" style={{ flex: 1, minWidth: 200, marginBottom: 0 }}>
          <span style={{ color: "var(--gris)" }}>🔍</span>
          <input placeholder="Rechercher par titre, copropriétaire…" value={recherche} onChange={e => setRecherche(e.target.value)} />
        </div>
        <select className="form-input" style={{ width: "auto" }} value={filtreResidence} onChange={e => setFiltreResidence(e.target.value)}>
          <option value="">Toutes les résidences</option>
          {residences.map(r => <option key={r.id} value={r.id}>{r.nom}</option>)}
        </select>
        <select className="form-input" style={{ width: "auto" }} value={filtreStatut} onChange={e => setFiltreStatut(e.target.value)}>
          <option value="">Tous les statuts</option>
          <option value="non_enregistre">Non enregistré</option>
          <option value="paye">Payé</option>
          <option value="en_attente">En attente</option>
          <option value="impaye">Impayé</option>
          <option value="partiel">Partiel</option>
        </select>
        {(recherche || filtreResidence || filtreStatut) &&
          <button className="btn btn-secondary" onClick={() => { setRecherche(""); setFiltreResidence(""); setFiltreStatut(""); }}>✕ Réinitialiser</button>
        }
      </div>

      {(() => {
        if (charges.length === 0) return <div className="card"><div className="empty"><div className="empty-icon">📄</div><div className="empty-text">Aucun appel de fonds — cliquez sur "+ Appel de fonds"</div></div></div>;
        const chargesFiltrees = charges
          .filter(charge => {
            if (filtreResidence && charge.residence_id !== filtreResidence) return false;
            const q = recherche.toLowerCase();
            if (!q) return true;
            const nomsCopros = copros.filter(c => c.residence_id === charge.residence_id).map(c => `${c.prenom} ${c.nom} ${c.lot}`).join(" ").toLowerCase();
            return charge.titre.toLowerCase().includes(q) || (charge.residences?.nom || "").toLowerCase().includes(q) || nomsCopros.includes(q);
          })
          .filter(charge => {
            if (!filtreStatut) return true;
            const paiementsCharge = paiements.filter(p => p.charge_id === charge.id);
            const coprosDeLaResidence = copros.filter(c => c.residence_id === charge.residence_id);
            if (filtreStatut === "non_enregistre") return coprosDeLaResidence.some(c => !paiementsCharge.find(p => p.coproprietaire_id === c.id));
            return paiementsCharge.some(p => p.statut === filtreStatut);
          });
        if (chargesFiltrees.length === 0) return <div className="card"><div className="empty"><div className="empty-text">Aucun résultat pour ces filtres</div></div></div>;
        return chargesFiltrees.map(charge => {
            const coprosDeLaResidence = copros.filter(c => c.residence_id === charge.residence_id);
            const totalTantiemes = coprosDeLaResidence.reduce((s, c) => s + (c["tantièmes"] || 0), 0);
            const paiementsCharge = paiements.filter(p => p.charge_id === charge.id);
            const encaisseCharge = paiementsCharge.filter(p => p.statut === "paye").reduce((s, p) => s + parseFloat(p.montant || 0), 0);
            return (
              <div className="card" key={charge.id} style={{ marginBottom: 16 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 600 }}>{charge.titre}</div>
                    <div style={{ fontSize: 12, color: "var(--gris)", marginTop: 3 }}>
                      🏢 {charge.residences?.nom || "—"} · 📅 Échéance : {charge.date_echeance || "—"}
                      {charge.trimestre && ` · ${charge.trimestre}`}
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: 20, fontWeight: 700, color: "var(--or-clair)" }}>{parseFloat(charge.montant_total).toFixed(2)} €</div>
                      <div style={{ fontSize: 11, color: "var(--vert)" }}>Encaissé : {encaisseCharge.toFixed(2)} €</div>
                    </div>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button className="btn btn-secondary btn-sm" onClick={() => genererPDFs(charge)} title="Télécharger les PDFs">📄</button>
                      <button className="btn btn-secondary btn-sm" onClick={() => envoyerPDFsParEmail(charge)} title="Envoyer par email">📧</button>
                      <button className="btn btn-edit btn-sm" onClick={() => openEditCharge(charge)}>✏️</button>
                      <button className="btn btn-danger btn-sm" onClick={() => supprimerCharge(charge.id)}>🗑️</button>
                    </div>
                  </div>
                </div>

                {coprosDeLaResidence.length === 0
                  ? <div className="empty" style={{ padding: "12px 0" }}><div className="empty-text">Aucun copropriétaire dans cette résidence</div></div>
                  : <div className="table-wrap">
                      <table>
                        <thead>
                          <tr>
                            <th>Copropriétaire</th>
                            <th>Lot</th>
                            <th>Tantièmes</th>
                            <th>Quote-part</th>
                            <th>Statut</th>
                            <th>Payé le</th>
                            <th></th>
                          </tr>
                        </thead>
                        <tbody>
                          {coprosDeLaResidence.map(copro => {
                            const quotePart = totalTantiemes > 0 ? ((charge.montant_total * (copro["tantièmes"] || 0)) / totalTantiemes).toFixed(2) : "—";
                            const paiement = paiementsCharge.find(p => p.coproprietaire_id === copro.id);
                            return (
                              <tr key={copro.id}>
                                <td style={{ fontWeight: 500 }}>{copro.prenom} {copro.nom}</td>
                                <td style={{ color: "var(--gris)" }}>{copro.lot || "—"}</td>
                                <td style={{ color: "var(--gris)" }}>{copro["tantièmes"] || 0}</td>
                                <td style={{ color: "var(--or-clair)", fontWeight: 600 }}>{quotePart} €</td>
                                <td>{paiement ? <Badge statut={paiement.statut} /> : <span className="badge badge-gray">Non enregistré</span>}</td>
                                <td style={{ color: "var(--gris)", fontSize: 12 }}>{paiement?.date_paiement || "—"}</td>
                                <td>
                                  <div style={{ display: "flex", gap: 6 }}>
                                    {paiement
                                      ? <>
                                          <button className="btn btn-edit btn-sm" onClick={() => openEditPaiement(paiement)}>✏️</button>
                                          {(paiement.statut === "impaye" || paiement.statut === "en_attente") && copro.email &&
                                            <button className="btn btn-danger btn-sm" onClick={async () => {
                                              try {
                                                const r = await fetch("/api/envoyer-email", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ type: "relance", destinataire: copro.email, donnees: { nom: copro.nom, prenom: copro.prenom, lot: copro.lot, montant: paiement.montant } }) });
                                                const j = await r.json();
                                                if (!r.ok) showToast("Erreur : " + j.error, "error");
                                                else showToast("Relance envoyée ✓", "success");
                                              } catch { showToast("Erreur d'envoi", "error"); }
                                            }}>📧</button>
                                          }
                                          <button className="btn btn-danger btn-sm" onClick={() => supprimerPaiement(paiement.id)}>🗑️</button>
                                        </>
                                      : <button className="btn btn-primary btn-sm" onClick={() => {
                                          setFormPaiement({ ...emptyPaiement, charge_id: charge.id, coproprietaire_id: copro.id, montant: quotePart !== "—" ? quotePart : "" });
                                          setEditingPaiement(null);
                                          setModalPaiement(true);
                                        }}>+ Paiement</button>
                                    }
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                }
              </div>
            );
          });
      })()}
      {modalCharge && <Modal title={editingCharge ? "✏️ Modifier l'appel de fonds" : "📋 Nouvel appel de fonds"} onClose={closeModalCharge}>
        <div className="form-group"><label className="form-label">Titre *</label><input className="form-input" value={formCharge.titre} onChange={e => setFormCharge({ ...formCharge, titre: e.target.value })} /></div>
        <div className="form-row">
          <div className="form-group"><label className="form-label">Montant *</label><input className="form-input" type="number" value={formCharge.montant_total} onChange={e => setFormCharge({ ...formCharge, montant_total: e.target.value })} /></div>
          <div className="form-group"><label className="form-label">Échéance</label><input className="form-input" type="date" value={formCharge.date_echeance} onChange={e => setFormCharge({ ...formCharge, date_echeance: e.target.value })} /></div>
        </div>
        <div className="form-group"><label className="form-label">Résidence</label>
          <select className="form-input" value={formCharge.residence_id} onChange={e => setFormCharge({ ...formCharge, residence_id: e.target.value })}>
            <option value="">Sélectionner...</option>
            {residences.map(r => <option key={r.id} value={r.id}>{r.nom}</option>)}
          </select>
        </div>
        <div className="modal-actions"><button className="btn btn-secondary" onClick={closeModalCharge}>Annuler</button><button className="btn btn-primary" onClick={saveCharge}>✅ {editingCharge ? "Mettre à jour" : "Créer"}</button></div>
      </Modal>}
      {modalPaiement && <Modal title={editingPaiement ? "✏️ Modifier le paiement" : "💳 Enregistrer un paiement"} onClose={closeModalPaiement}>
        {(() => {
          const chargeSelectionnee = charges.find(c => c.id === formPaiement.charge_id);
          const coprosFiltrés = chargeSelectionnee ? copros.filter(c => c.residence_id === chargeSelectionnee.residence_id) : copros;
          const quotePart = calcQuotePart(formPaiement.charge_id, formPaiement.coproprietaire_id);
          return (
            <>
              <div className="form-group"><label className="form-label">Appel de fonds *</label>
                <select className="form-input" value={formPaiement.charge_id} onChange={e => {
                  const chargeId = e.target.value;
                  const qp = calcQuotePart(chargeId, formPaiement.coproprietaire_id);
                  setFormPaiement({ ...formPaiement, charge_id: chargeId, coproprietaire_id: "", ...(qp ? { montant: qp } : { montant: "" }) });
                }}>
                  <option value="">Sélectionner...</option>
                  {charges.map(c => <option key={c.id} value={c.id}>{c.titre} — {c.montant_total} €</option>)}
                </select>
              </div>
              <div className="form-group"><label className="form-label">Copropriétaire *</label>
                <select className="form-input" value={formPaiement.coproprietaire_id} onChange={e => {
                  const coproId = e.target.value;
                  const qp = calcQuotePart(formPaiement.charge_id, coproId);
                  setFormPaiement({ ...formPaiement, coproprietaire_id: coproId, ...(qp ? { montant: qp } : {}) });
                }}>
                  <option value="">{chargeSelectionnee ? "Sélectionner..." : "Choisissez d'abord un appel de fonds"}</option>
                  {coprosFiltrés.map(c => <option key={c.id} value={c.id}>{c.prenom} {c.nom} — Lot {c.lot} ({c["tantièmes"] || 0} tantièmes)</option>)}
                </select>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Montant *</label>
                  <input className="form-input" type="number" value={formPaiement.montant} onChange={e => setFormPaiement({ ...formPaiement, montant: e.target.value })} />
                  {quotePart && <div style={{ fontSize: 11, color: "var(--or)", marginTop: 5 }}>Quote-part calculée : {quotePart} €</div>}
                </div>
                <div className="form-group"><label className="form-label">Date</label><input className="form-input" type="date" value={formPaiement.date_paiement} onChange={e => setFormPaiement({ ...formPaiement, date_paiement: e.target.value })} /></div>
              </div>
            </>
          );
        })()}
        <div className="form-row">
          <div className="form-group"><label className="form-label">Statut</label>
            <select className="form-input" value={formPaiement.statut} onChange={e => setFormPaiement({ ...formPaiement, statut: e.target.value })}>
              <option value="paye">Payé</option><option value="en_attente">En attente</option><option value="impaye">Impayé</option><option value="partiel">Partiel</option>
            </select>
          </div>
          <div className="form-group"><label className="form-label">Mode</label>
            <select className="form-input" value={formPaiement.mode_paiement} onChange={e => setFormPaiement({ ...formPaiement, mode_paiement: e.target.value })}>
              <option value="virement">Virement</option><option value="cheque">Chèque</option><option value="especes">Espèces</option>
            </select>
          </div>
        </div>
        <div className="modal-actions"><button className="btn btn-secondary" onClick={closeModalPaiement}>Annuler</button><button className="btn btn-primary" onClick={savePaiement}>✅ {editingPaiement ? "Mettre à jour" : "Enregistrer"}</button></div>
      </Modal>}
    </div>
  );
}

function Travaux({ showToast, userId }) {
  const [data, setData] = useState([]);
  const [residences, setResidences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const emptyForm = { titre: "", description: "", prestataire: "", montant: "", date_debut: "", date_fin_prevue: "", statut: "planifie", urgence: false, residence_id: "" };
  const [form, setForm] = useState(emptyForm);
  const [recherche, setRecherche] = useState("");

  async function load() {
    const [t, r] = await Promise.all([supabase.from("travaux").select("*, residences(nom)").order("created_at", { ascending: false }), supabase.from("residences").select("id, nom")]);
    setData(t.data || []); setResidences(r.data || []); setLoading(false);
  }
  useEffect(() => { load(); }, []);

  function openCreate() { setForm(emptyForm); setEditing(null); setModal(true); }
  function openEdit(t) {
    setForm({ titre: t.titre, description: t.description || "", prestataire: t.prestataire || "", montant: t.montant || "", date_debut: t.date_debut || "", date_fin_prevue: t.date_fin_prevue || "", statut: t.statut, urgence: t.urgence || false, residence_id: t.residence_id || "" });
    setEditing(t.id); setModal(true);
  }
  function closeModal() { setModal(false); setEditing(null); setForm(emptyForm); }

  async function save() {
    if (!form.titre) return showToast("Le titre est obligatoire", "error");
    const payload = { ...form, montant: form.montant ? parseFloat(form.montant) : null };
    const { error } = editing
      ? await supabase.from("travaux").update(payload).eq("id", editing)
      : await supabase.from("travaux").insert([{ ...payload, user_id: userId }]);
    if (error) return showToast("Erreur : " + error.message, "error");
    showToast(editing ? "Travaux mis à jour ✓" : "Travaux ajoutés ✓", "success");
    closeModal(); load();
  }

  async function supprimer(id) {
    if (!confirm("Supprimer ce chantier ?")) return;
    await supabase.from("travaux").delete().eq("id", id);
    showToast("Supprimé", "success"); load();
  }

  if (loading) return <div className="loading">⏳ Chargement...</div>;
  return (
    <div>
      <div className="topbar"><div><div className="page-title">🔧 Travaux & Prestataires</div><div className="page-sub">{data.length} intervention(s)</div></div><button className="btn btn-primary" onClick={openCreate}>+ Nouveau chantier</button></div>
      <div className="search-bar"><span style={{ color: "var(--gris)" }}>🔍</span><input placeholder="Rechercher par titre, prestataire, résidence…" value={recherche} onChange={e => setRecherche(e.target.value)} /></div>
      <div className="grid-3">
        {["planifie", "en_cours", "termine"].map(statut => { const filtres = data.filter(t => { const q = recherche.toLowerCase(); return t.statut === statut && (!q || `${t.titre} ${t.prestataire || ""} ${t.residences?.nom || ""}`.toLowerCase().includes(q)); }); return (
          <div className="card" key={statut}>
            <div className="card-header"><span className="card-title"><Badge statut={statut} /></span><span style={{ color: "var(--gris)", fontSize: 12 }}>{filtres.length}</span></div>
            {filtres.length === 0 ? <div className="empty" style={{ padding: "20px 0" }}><div className="empty-text">Aucun</div></div> :
              filtres.map(t => (
                <div className="list-item" key={t.id} style={{ borderLeft: `3px solid ${t.urgence ? "var(--rouge)" : "transparent"}` }}>
                  <div className="list-content"><div className="list-title">{t.urgence ? "🚨 " : ""}{t.titre}</div><div className="list-sub">{t.prestataire || "—"}{t.montant ? ` · ${t.montant} €` : ""}</div></div>
                  <div className="list-actions">
                    <button className="btn btn-edit btn-sm" onClick={() => openEdit(t)}>✏️</button>
                    <button className="btn btn-danger btn-sm" onClick={() => supprimer(t.id)}>🗑️</button>
                  </div>
                </div>
              ))
            }
          </div>
        ); })}
      </div>
      {modal && <Modal title={editing ? "✏️ Modifier le chantier" : "🔧 Nouveau chantier"} onClose={closeModal}>
        <div className="form-group"><label className="form-label">Titre *</label><input className="form-input" value={form.titre} onChange={e => setForm({ ...form, titre: e.target.value })} /></div>
        <div className="form-group"><label className="form-label">Description</label><textarea className="form-input" rows={2} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} /></div>
        <div className="form-row">
          <div className="form-group"><label className="form-label">Prestataire</label><input className="form-input" value={form.prestataire} onChange={e => setForm({ ...form, prestataire: e.target.value })} /></div>
          <div className="form-group"><label className="form-label">Montant (€)</label><input className="form-input" type="number" value={form.montant} onChange={e => setForm({ ...form, montant: e.target.value })} /></div>
        </div>
        <div className="form-row">
          <div className="form-group"><label className="form-label">Début</label><input className="form-input" type="date" value={form.date_debut} onChange={e => setForm({ ...form, date_debut: e.target.value })} /></div>
          <div className="form-group"><label className="form-label">Fin prévue</label><input className="form-input" type="date" value={form.date_fin_prevue} onChange={e => setForm({ ...form, date_fin_prevue: e.target.value })} /></div>
        </div>
        <div className="form-row">
          <div className="form-group"><label className="form-label">Statut</label>
            <select className="form-input" value={form.statut} onChange={e => setForm({ ...form, statut: e.target.value })}>
              <option value="planifie">Planifié</option><option value="en_cours">En cours</option><option value="termine">Terminé</option>
            </select>
          </div>
          <div className="form-group"><label className="form-label">Résidence</label>
            <select className="form-input" value={form.residence_id} onChange={e => setForm({ ...form, residence_id: e.target.value })}>
              <option value="">Sélectionner...</option>
              {residences.map(r => <option key={r.id} value={r.id}>{r.nom}</option>)}
            </select>
          </div>
        </div>
        <div className="form-group" style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <input type="checkbox" id="urgence" checked={form.urgence} onChange={e => setForm({ ...form, urgence: e.target.checked })} style={{ width: 16, height: 16 }} />
          <label htmlFor="urgence" style={{ fontSize: 13, color: "var(--rouge)", cursor: "pointer" }}>🚨 Urgent</label>
        </div>
        <div className="modal-actions"><button className="btn btn-secondary" onClick={closeModal}>Annuler</button><button className="btn btn-primary" onClick={save}>✅ {editing ? "Mettre à jour" : "Enregistrer"}</button></div>
      </Modal>}
    </div>
  );
}

function Assemblees({ showToast, userId }) {
  const [data, setData] = useState([]);
  const [residences, setResidences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const emptyForm = { titre: "", date_ag: "", lieu: "", type_ag: "ordinaire", statut: "planifiee", residence_id: "" };
  const [form, setForm] = useState(emptyForm);
  const [recherche, setRecherche] = useState("");

  async function load() {
    const [a, r] = await Promise.all([supabase.from("assemblees").select("*, residences(nom)").order("date_ag", { ascending: false }), supabase.from("residences").select("id, nom")]);
    setData(a.data || []); setResidences(r.data || []); setLoading(false);
  }
  useEffect(() => { load(); }, []);

  function openCreate() { setForm(emptyForm); setEditing(null); setModal(true); }
  function openEdit(a) {
    setForm({ titre: a.titre, date_ag: a.date_ag ? a.date_ag.slice(0, 16) : "", lieu: a.lieu || "", type_ag: a.type_ag, statut: a.statut, residence_id: a.residence_id || "" });
    setEditing(a.id); setModal(true);
  }
  function closeModal() { setModal(false); setEditing(null); setForm(emptyForm); }

  async function save() {
    if (!form.titre || !form.date_ag) return showToast("Titre et date obligatoires", "error");
    const { error } = editing
      ? await supabase.from("assemblees").update(form).eq("id", editing)
      : await supabase.from("assemblees").insert([{ ...form, user_id: userId }]);
    if (error) return showToast("Erreur : " + error.message, "error");
    showToast(editing ? "AG mise à jour ✓" : "AG planifiée ✓", "success");
    closeModal(); load();
  }

  async function supprimer(id) {
    if (!confirm("Supprimer cette AG ?")) return;
    await supabase.from("assemblees").delete().eq("id", id);
    showToast("Supprimée", "success"); load();
  }

  function genererPV(ag) {
    const doc = new jsPDF();
    const dateAG = ag.date_ag ? new Date(ag.date_ag).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "—";
    const dateGen = new Date().toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
    // Header
    doc.setFillColor(15, 27, 45); doc.rect(0, 0, 210, 45, "F");
    doc.setTextColor(201, 168, 76); doc.setFontSize(22); doc.text("SyndicPro", 14, 18);
    doc.setFontSize(10); doc.setTextColor(138, 154, 181);
    doc.text("Procès-verbal d'Assemblée Générale", 14, 28);
    doc.text("Réf. AG-" + ag.id.slice(0, 8).toUpperCase(), 14, 36);
    // Titre
    doc.setTextColor(240, 237, 230); doc.setFontSize(15); doc.text(ag.titre, 14, 58);
    doc.setDrawColor(30, 58, 95); doc.line(14, 63, 196, 63);
    // Infos AG
    doc.setFontSize(11); doc.setTextColor(138, 154, 181);
    doc.text(`Résidence : ${ag.residences?.nom || "—"}`, 14, 74);
    doc.text(`Date : ${dateAG}`, 14, 82);
    doc.text(`Lieu : ${ag.lieu || "—"}`, 14, 90);
    doc.text(`Type : AG ${ag.type_ag === "extraordinaire" ? "Extraordinaire" : "Ordinaire"}`, 14, 98);
    doc.text(`Statut : ${ag.statut === "tenue" ? "Tenue" : "Planifiée"}`, 14, 106);
    doc.line(14, 114, 196, 114);
    // Section PV
    doc.setTextColor(240, 237, 230); doc.setFontSize(13); doc.text("Procès-verbal", 14, 126);
    doc.setFontSize(10); doc.setTextColor(138, 154, 181);
    doc.text("L'assemblée générale s'est réunie conformément aux dispositions légales en vigueur.", 14, 136);
    doc.text("Les copropriétaires ont été convoqués dans les délais réglementaires.", 14, 144);
    // Zones à remplir
    const zones = ["Ordre du jour", "Décisions prises", "Résultats des votes", "Questions diverses"];
    let y = 158;
    zones.forEach(zone => {
      doc.setFillColor(22, 34, 54); doc.roundedRect(14, y, 182, 24, 3, 3, "F");
      doc.setTextColor(201, 168, 76); doc.setFontSize(10); doc.text(zone, 20, y + 9);
      doc.setTextColor(138, 154, 181); doc.setFontSize(9); doc.text("________________________________________________________", 20, y + 18);
      y += 32;
    });
    // Signatures
    doc.setDrawColor(30, 58, 95); doc.line(14, 263, 196, 263);
    doc.setTextColor(138, 154, 181); doc.setFontSize(9);
    doc.text("Signature du Président de séance", 14, 272);
    doc.text("Signature du Secrétaire", 120, 272);
    doc.text(`Document généré le ${dateGen} par SyndicPro`, 14, 285);
    doc.save(`PV_AG_${ag.titre.replace(/\s+/g, "_")}.pdf`);
    showToast("PV généré ✓", "success");
  }

  async function envoyerPVParEmail(ag) {
    if (!ag.residence_id) return showToast("Aucune résidence liée à cette AG", "error");
    const { data: coprosRes } = await supabase.from("coproprietaires").select("nom, prenom, email, lot").eq("residence_id", ag.residence_id);
    const liste = (coprosRes || []).filter(c => c.email);
    if (liste.length === 0) return showToast("Aucun copropriétaire avec email dans cette résidence", "error");
    const dateAG = ag.date_ag ? new Date(ag.date_ag).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "—";
    showToast(`Envoi en cours… 0 / ${liste.length}`, "success");
    let envoyes = 0;
    for (const copro of liste) {
      try {
        await fetch("/api/envoyer-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: "convocation",
            destinataire: copro.email,
            donnees: { nom: copro.nom, prenom: copro.prenom, titreAG: ag.titre, dateAG, lieu: ag.lieu || "—" },
          }),
        });
        envoyes++;
      } catch (e) { console.error("Échec envoi", copro.email, e); }
    }
    showToast(`${envoyes} convocation(s) envoyée(s) ✓`, "success");
  }

  if (loading) return <div className="loading">⏳ Chargement...</div>;
  return (
    <div>
      <div className="topbar"><div><div className="page-title">📋 Assemblées Générales</div><div className="page-sub">{data.length} AG enregistrée(s)</div></div><button className="btn btn-primary" onClick={openCreate}>+ Planifier une AG</button></div>
      <div className="search-bar"><span style={{ color: "var(--gris)" }}>🔍</span><input placeholder="Rechercher par titre, lieu, résidence…" value={recherche} onChange={e => setRecherche(e.target.value)} /></div>
      <div className="card">
        {(() => { const filtres = data.filter(a => { const q = recherche.toLowerCase(); return !q || `${a.titre} ${a.lieu || ""} ${a.residences?.nom || ""}`.toLowerCase().includes(q); }); return filtres.length === 0 ? <div className="empty"><div className="empty-icon">📋</div><div className="empty-text">{recherche ? "Aucun résultat" : "Aucune AG planifiée"}</div></div> :
          filtres.map(a => (
            <div className="list-item" key={a.id}>
              <div className="list-icon">{a.statut === "tenue" ? "✅" : "📋"}</div>
              <div className="list-content">
                <div className="list-title">{a.titre}</div>
                <div className="list-sub">{a.date_ag ? new Date(a.date_ag).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" }) : "—"}{a.lieu ? ` · 📍 ${a.lieu}` : ""} · {a.residences?.nom}</div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 4, alignItems: "flex-end", marginRight: 8 }}><Badge statut={a.statut} /><Badge statut={a.type_ag} /></div>
              <div className="list-actions">
                <button className="btn btn-secondary btn-sm" onClick={() => genererPV(a)} title="Télécharger le PV">📄</button>
                <button className="btn btn-secondary btn-sm" onClick={() => envoyerPVParEmail(a)} title="Envoyer la convocation par email">📧</button>
                <button className="btn btn-edit btn-sm" onClick={() => openEdit(a)}>✏️</button>
                <button className="btn btn-danger btn-sm" onClick={() => supprimer(a.id)}>🗑️</button>
              </div>
            </div>
          ))
        ; })()}
      </div>
      {modal && <Modal title={editing ? "✏️ Modifier l'AG" : "📋 Planifier une AG"} onClose={closeModal}>
        <div className="form-group"><label className="form-label">Titre *</label><input className="form-input" value={form.titre} onChange={e => setForm({ ...form, titre: e.target.value })} /></div>
        <div className="form-row">
          <div className="form-group"><label className="form-label">Date & heure *</label><input className="form-input" type="datetime-local" value={form.date_ag} onChange={e => setForm({ ...form, date_ag: e.target.value })} /></div>
          <div className="form-group"><label className="form-label">Lieu</label><input className="form-input" value={form.lieu} onChange={e => setForm({ ...form, lieu: e.target.value })} /></div>
        </div>
        <div className="form-row">
          <div className="form-group"><label className="form-label">Type</label>
            <select className="form-input" value={form.type_ag} onChange={e => setForm({ ...form, type_ag: e.target.value })}>
              <option value="ordinaire">Ordinaire</option><option value="extraordinaire">Extraordinaire</option>
            </select>
          </div>
          <div className="form-group"><label className="form-label">Statut</label>
            <select className="form-input" value={form.statut} onChange={e => setForm({ ...form, statut: e.target.value })}>
              <option value="planifiee">Planifiée</option><option value="tenue">Tenue</option>
            </select>
          </div>
        </div>
        <div className="form-group"><label className="form-label">Résidence</label>
          <select className="form-input" value={form.residence_id} onChange={e => setForm({ ...form, residence_id: e.target.value })}>
            <option value="">Sélectionner...</option>
            {residences.map(r => <option key={r.id} value={r.id}>{r.nom}</option>)}
          </select>
        </div>
        <div className="modal-actions"><button className="btn btn-secondary" onClick={closeModal}>Annuler</button><button className="btn btn-primary" onClick={save}>✅ {editing ? "Mettre à jour" : "Planifier"}</button></div>
      </Modal>}
    </div>
  );
}

function Finance() {
  const [paiements, setPaiements] = useState([]);
  const [charges, setCharges] = useState([]);
  const [paiementsResidence, setPaiementsResidence] = useState([]);
  const [residences, setResidences] = useState([]);
  const [chargesAvenir, setChargesAvenir] = useState([]);
  const [alertes, setAlertes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [periode, setPeriode] = useState("tout");
  const [tri, setTri] = useState("impaye_desc");

  useEffect(() => {
    async function load() {
      const today = new Date().toISOString().split("T")[0];
      const plus90 = new Date(Date.now() + 90 * 86400000).toISOString().split("T")[0];
      const [p, c, pr, r, ca, al] = await Promise.all([
        supabase.from("paiements").select("*, coproprietaires(nom, prenom, lot)"),
        supabase.from("charges").select("*"),
        supabase.from("paiements").select("montant, statut, charges(residence_id, residences(nom))"),
        supabase.from("residences").select("*"),
        supabase.from("charges").select("*, paiements(montant, statut)").gte("date_echeance", today).lte("date_echeance", plus90),
        supabase.from("paiements").select("*, coproprietaires(nom, prenom, lot), charges(titre, date_echeance)").eq("statut", "impaye"),
      ]);
      setPaiements(p.data || []);
      setCharges(c.data || []);
      setPaiementsResidence(pr.data || []);
      setResidences(r.data || []);
      setChargesAvenir(ca.data || []);
      setAlertes(al.data || []);
      setLoading(false);
    }
    load();
  }, []);

  if (loading) return <div className="loading">⏳ Chargement...</div>;

  const now = new Date();
  const limites = { semaine: 7, mois: 30, annee: 365 };
  const paiementsFiltres = paiements.filter(p => {
    if (periode === "tout" || !p.date_paiement) return true;
    const diff = (now - new Date(p.date_paiement)) / (1000 * 60 * 60 * 24);
    return diff <= limites[periode];
  });

  const totalEncaisse = paiementsFiltres.filter(p => p.statut === "paye").reduce((s, p) => s + p.montant, 0);
  const totalImpaye = paiementsFiltres.filter(p => p.statut === "impaye").reduce((s, p) => s + p.montant, 0);
  const totalAttendu = paiementsFiltres.reduce((s, p) => s + p.montant, 0);
  const tauxRecouvrement = totalAttendu > 0 ? Math.round((totalEncaisse / totalAttendu) * 100) : 0;

  const parCopro = {};
  paiementsFiltres.forEach(p => {
    const key = p.coproprietaire_id;
    if (!parCopro[key]) parCopro[key] = { nom: p.coproprietaires ? `${p.coproprietaires.prenom} ${p.coproprietaires.nom}` : "—", lot: p.coproprietaires?.lot, paye: 0, impaye: 0 };
    if (p.statut === "paye") parCopro[key].paye += p.montant;
    else if (p.statut === "impaye") parCopro[key].impaye += p.montant;
  });

  let barres = [];
  let titreGraphique = "";
  const paiementsPaye = paiements.filter(p => p.statut === "paye" && p.date_paiement);

  if (periode === "semaine") {
    titreGraphique = "Encaissements — 7 derniers jours";
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now); d.setDate(now.getDate() - i);
      const key = d.toISOString().split("T")[0];
      const label = d.toLocaleDateString("fr-FR", { weekday: "short" });
      barres.push({ key, label, montant: 0 });
    }
    paiementsPaye.forEach(p => {
      const b = barres.find(b => b.key === p.date_paiement);
      if (b) b.montant += p.montant;
    });
  } else if (periode === "mois") {
    titreGraphique = "Encaissements — ce mois";
    const ym = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    barres = [
      { key: "S1", label: "S1", montant: 0, min: 1, max: 7 },
      { key: "S2", label: "S2", montant: 0, min: 8, max: 14 },
      { key: "S3", label: "S3", montant: 0, min: 15, max: 21 },
      { key: "S4", label: "S4", montant: 0, min: 22, max: 31 },
    ];
    paiementsPaye.filter(p => p.date_paiement.startsWith(ym)).forEach(p => {
      const jour = parseInt(p.date_paiement.split("-")[2]);
      const b = barres.find(b => jour >= b.min && jour <= b.max);
      if (b) b.montant += p.montant;
    });
  } else if (periode === "annee") {
    titreGraphique = "Encaissements — cette année";
    for (let m = 0; m < 12; m++) {
      const d = new Date(now.getFullYear(), m, 1);
      const key = `${now.getFullYear()}-${String(m + 1).padStart(2, "0")}`;
      barres.push({ key, label: d.toLocaleDateString("fr-FR", { month: "short" }), montant: 0 });
    }
    paiementsPaye.forEach(p => {
      const key = p.date_paiement.substring(0, 7);
      const b = barres.find(b => b.key === key);
      if (b) b.montant += p.montant;
    });
  } else {
    titreGraphique = "Encaissements — 12 derniers mois";
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      barres.push({ key, label: d.toLocaleDateString("fr-FR", { month: "short" }), montant: 0 });
    }
    paiementsPaye.forEach(p => {
      const key = p.date_paiement.substring(0, 7);
      const b = barres.find(b => b.key === key);
      if (b) b.montant += p.montant;
    });
  }
  const maxMontant = Math.max(...barres.map(b => b.montant), 1);

  const recouvrementResidences = residences.map(res => {
    const p = paiementsResidence.filter(p => p.charges?.residence_id === res.id);
    const totalPaye = p.filter(p => p.statut === "paye").reduce((s, p) => s + p.montant, 0);
    const totalAttendu = p.reduce((s, p) => s + p.montant, 0);
    const taux = totalAttendu > 0 ? Math.round(totalPaye / totalAttendu * 100) : 0;
    return { nom: res.nom, taux, totalAttendu };
  }).filter(r => r.totalAttendu > 0);

  const totalChargesAvenir = chargesAvenir.reduce((s, c) => s + c.montant_total, 0);
  const totalDejaPayeAvenir = chargesAvenir.reduce((s, c) => s + (c.paiements || []).filter(p => p.statut === "paye").reduce((ss, p) => ss + p.montant, 0), 0);
  const resteACollecterAvenir = totalChargesAvenir - totalDejaPayeAvenir;

  const alertesAvecRetard = alertes
    .filter(p => p.charges?.date_echeance)
    .map(p => ({ ...p, joursRetard: Math.floor((now - new Date(p.charges.date_echeance)) / 86400000) }))
    .filter(p => p.joursRetard > 0)
    .sort((a, b) => b.joursRetard - a.joursRetard);

  const sortFn = {
    impaye_desc: (a, b) => b.impaye - a.impaye,
    impaye_asc: (a, b) => a.impaye - b.impaye,
    alpha_asc: (a, b) => a.nom.localeCompare(b.nom),
    alpha_desc: (a, b) => b.nom.localeCompare(a.nom),
  };

  return (
    <div>
      <div className="topbar"><div><div className="page-title">📊 Tableau de bord financier</div><div className="page-sub">Analyse de la trésorerie</div></div></div>
      <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        {[["tout", "Tout"], ["semaine", "Semaine"], ["mois", "Mois"], ["annee", "Année"]].map(([val, label]) => (
          <button key={val} className={`btn ${periode === val ? "btn-primary" : "btn-secondary"} btn-sm`} onClick={() => setPeriode(val)}>{label}</button>
        ))}
      </div>
      <div className="stats-grid">
        <div className="stat-card"><div className="stat-label">💰 Total encaissé</div><div className="stat-value" style={{ color: "var(--vert)" }}>{totalEncaisse.toFixed(0)} €</div><div className="stat-sub">paiements confirmés</div></div>
        <div className="stat-card"><div className="stat-label">⚠️ Total impayé</div><div className="stat-value" style={{ color: "var(--rouge)" }}>{totalImpaye.toFixed(0)} €</div><div className="stat-sub">en retard</div></div>
        <div className="stat-card"><div className="stat-label">📈 Taux de recouvrement</div><div className="stat-value" style={{ color: tauxRecouvrement >= 80 ? "var(--vert)" : tauxRecouvrement >= 50 ? "var(--orange)" : "var(--rouge)" }}>{tauxRecouvrement}%</div><div className="stat-sub">des charges collectées</div></div>
        <div className="stat-card"><div className="stat-label">📋 Appels de fonds</div><div className="stat-value" style={{ color: "var(--or-clair)" }}>{charges.length}</div><div className="stat-sub">charges enregistrées</div></div>
      </div>
      <div className="card" style={{ marginBottom: 16 }}>
        <div className="card-header"><span className="card-title">🏢 Recouvrement par résidence</span></div>
        {recouvrementResidences.length === 0 ? (
          <div className="empty" style={{ padding: "10px 0" }}><div className="empty-text">Aucune donnée</div></div>
        ) : recouvrementResidences.map((r, i) => (
          <div key={i} style={{ marginBottom: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, fontSize: 13 }}>
              <span>{r.nom}</span>
              <span style={{ fontWeight: 600, color: r.taux >= 80 ? "var(--vert)" : r.taux >= 50 ? "var(--orange)" : "var(--rouge)" }}>{r.taux}%</span>
            </div>
            <div style={{ background: "var(--bleu-moyen)", borderRadius: 4, height: 8, overflow: "hidden" }}>
              <div style={{ width: `${r.taux}%`, height: "100%", background: r.taux >= 80 ? "var(--vert)" : r.taux >= 50 ? "var(--orange)" : "var(--rouge)", borderRadius: 4, transition: "width 0.4s" }} />
            </div>
          </div>
        ))}
      </div>
      <div className="card" style={{ marginBottom: 16 }}>
        <div className="card-header"><span className="card-title">📅 Charges à venir — 90 prochains jours</span></div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 16 }}>
          <div style={{ background: "var(--bleu-nuit)", borderRadius: 8, padding: "12px 16px" }}><div style={{ fontSize: 11, color: "var(--gris)", textTransform: "uppercase", marginBottom: 6 }}>Attendu</div><div style={{ fontSize: 20, fontWeight: 600, color: "var(--or-clair)" }}>{totalChargesAvenir.toFixed(0)} €</div></div>
          <div style={{ background: "var(--bleu-nuit)", borderRadius: 8, padding: "12px 16px" }}><div style={{ fontSize: 11, color: "var(--gris)", textTransform: "uppercase", marginBottom: 6 }}>Déjà payé</div><div style={{ fontSize: 20, fontWeight: 600, color: "var(--vert)" }}>{totalDejaPayeAvenir.toFixed(0)} €</div></div>
          <div style={{ background: "var(--bleu-nuit)", borderRadius: 8, padding: "12px 16px" }}><div style={{ fontSize: 11, color: "var(--gris)", textTransform: "uppercase", marginBottom: 6 }}>Reste à collecter</div><div style={{ fontSize: 20, fontWeight: 600, color: resteACollecterAvenir > 0 ? "var(--rouge)" : "var(--vert)" }}>{resteACollecterAvenir.toFixed(0)} €</div></div>
        </div>
        {chargesAvenir.length === 0 ? (
          <div className="empty" style={{ padding: "10px 0" }}><div className="empty-text">Aucune charge à venir</div></div>
        ) : chargesAvenir.map(c => {
          const payeCharge = (c.paiements || []).filter(p => p.statut === "paye").reduce((s, p) => s + p.montant, 0);
          const tauxCharge = c.montant_total > 0 ? Math.round(payeCharge / c.montant_total * 100) : 0;
          return (
            <div key={c.id} className="list-item">
              <div className="list-content"><div className="list-title">{c.titre}</div><div className="list-sub">{c.date_echeance}</div></div>
              <div style={{ textAlign: "right" }}>
                <div style={{ color: "var(--or-clair)", fontWeight: 600, fontSize: 13, marginBottom: 4 }}>{c.montant_total} €</div>
                <span className={`badge ${tauxCharge >= 80 ? "badge-green" : tauxCharge >= 50 ? "badge-orange" : "badge-red"}`}>{tauxCharge}% payé</span>
              </div>
            </div>
          );
        })}
      </div>
      <div className="card" style={{ marginBottom: 16 }}>
        <div className="card-header"><span className="card-title">🚨 Alertes retard</span></div>
        {alertesAvecRetard.length === 0 ? (
          <div style={{ padding: "16px 0", textAlign: "center", color: "var(--vert)", fontWeight: 600 }}>✓ Aucun retard détecté</div>
        ) : (
          <div className="table-wrap"><table>
            <thead><tr><th>Copropriétaire</th><th>Lot</th><th>Charge</th><th>Montant</th><th>Retard</th></tr></thead>
            <tbody>
              {alertesAvecRetard.map((p, i) => (
                <tr key={i}>
                  <td><strong>{p.coproprietaires ? `${p.coproprietaires.prenom} ${p.coproprietaires.nom}` : "—"}</strong></td>
                  <td style={{ color: "var(--or-clair)" }}>{p.coproprietaires?.lot || "—"}</td>
                  <td>{p.charges?.titre || "—"}</td>
                  <td style={{ color: "var(--rouge)", fontWeight: 600 }}>{p.montant} €</td>
                  <td><span className={`badge ${p.joursRetard > 30 ? "badge-red" : "badge-orange"}`}>{p.joursRetard}j</span></td>
                </tr>
              ))}
            </tbody>
          </table></div>
        )}
      </div>
      <div className="card" style={{ marginBottom: 16 }}>
        <div className="card-header"><span className="card-title">📅 {titreGraphique}</span></div>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height: 140, padding: "8px 0 0" }}>
          {barres.map(b => (
            <div key={b.key} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
              <div style={{ fontSize: 10, color: "var(--or-clair)", fontWeight: 600, minHeight: 14 }}>{b.montant > 0 ? b.montant + "€" : ""}</div>
              <div style={{ width: "100%", background: b.montant > 0 ? "var(--or)" : "var(--bleu-moyen)", borderRadius: "4px 4px 0 0", height: `${Math.max((b.montant / maxMontant) * 80, 4)}px`, transition: "height 0.3s" }} />
              <div style={{ fontSize: 10, color: "var(--gris)" }}>{b.label}</div>
            </div>
          ))}
        </div>
      </div>
      <div className="card">
        <div className="card-header">
          <span className="card-title">👥 Solde par copropriétaire</span>
          <select className="form-input" style={{ width: "auto", padding: "5px 10px", fontSize: 12 }} value={tri} onChange={e => setTri(e.target.value)}>
            <option value="impaye_desc">Impayés ↓</option>
            <option value="impaye_asc">Impayés ↑</option>
            <option value="alpha_asc">A → Z</option>
            <option value="alpha_desc">Z → A</option>
          </select>
        </div>
        {Object.values(parCopro).length === 0 ? (
          <div className="empty"><div className="empty-icon">💳</div><div className="empty-text">Aucun paiement enregistré</div></div>
        ) : (
          <div className="table-wrap"><table>
            <thead><tr><th>Copropriétaire</th><th>Lot</th><th>Payé</th><th>Impayé</th><th>Statut</th></tr></thead>
            <tbody>
              {Object.values(parCopro).sort(sortFn[tri]).map((c, i) => (
                <tr key={i}>
                  <td><strong>{c.nom}</strong></td>
                  <td style={{ color: "var(--or-clair)" }}>{c.lot || "—"}</td>
                  <td style={{ color: "var(--vert)", fontWeight: 600 }}>{c.paye} €</td>
                  <td style={{ color: c.impaye > 0 ? "var(--rouge)" : "var(--gris)", fontWeight: 600 }}>{c.impaye} €</td>
                  <td><span className={`badge ${c.impaye === 0 ? "badge-green" : "badge-red"}`}>{c.impaye === 0 ? "✓ À jour" : `${c.impaye} € dû`}</span></td>
                </tr>
              ))}
            </tbody>
          </table></div>
        )}
      </div>
    </div>
  );
}

function Incidents({ showToast, userId }) {
  const [data, setData] = useState([]);
  const [residences, setResidences] = useState([]);
  const [historique, setHistorique] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [modalDetail, setModalDetail] = useState(null);
  const emptyForm = { titre: "", description: "", residence_id: "" };
  const [form, setForm] = useState(emptyForm);
  const [detailForm, setDetailForm] = useState({ statut: "", commentaire: "" });
  const [recherche, setRecherche] = useState("");

  async function load() {
    const [inc, res] = await Promise.all([
      supabase.from("incidents").select("*, residences(nom)").order("created_at", { ascending: false }),
      supabase.from("residences").select("*"),
    ]);
    setData(inc.data || []);
    setResidences(res.data || []);
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  async function openDetail(inc) {
    setModalDetail(inc);
    setDetailForm({ statut: inc.statut, commentaire: "" });
    const { data: hist } = await supabase.from("incidents_historique").select("*").eq("incident_id", inc.id).order("created_at", { ascending: false });
    setHistorique(hist || []);
  }

  async function save() {
    if (!form.titre) return showToast("Le titre est obligatoire", "error");
    const { error } = await supabase.from("incidents").insert([{ ...form, user_id: userId }]);
    if (error) return showToast("Erreur : " + error.message, "error");
    showToast("Incident signalé ✓", "success");
    setModal(false); setForm(emptyForm); load();
  }

  async function updateStatut() {
    if (!detailForm.commentaire.trim()) return showToast("Le commentaire est obligatoire", "error");
    const ancienStatut = modalDetail.statut;
    const payload = { statut: detailForm.statut, updated_at: new Date().toISOString(), ...(detailForm.statut === "resolu" ? { resolu_at: new Date().toISOString() } : {}) };
    const { error } = await supabase.from("incidents").update(payload).eq("id", modalDetail.id);
    if (error) return showToast("Erreur : " + error.message, "error");
    await supabase.from("incidents_historique").insert([{ incident_id: modalDetail.id, ancien_statut: ancienStatut, nouveau_statut: detailForm.statut, commentaire: detailForm.commentaire }]);
    showToast("Statut mis à jour ✓", "success");
    setModalDetail(null); load();
  }

  function tempsRelatif(date) {
    const diff = Math.floor((Date.now() - new Date(date)) / 1000);
    if (diff < 60) return "à l'instant";
    if (diff < 3600) return `il y a ${Math.floor(diff / 60)} min`;
    if (diff < 86400) return `il y a ${Math.floor(diff / 3600)}h`;
    const jours = Math.floor(diff / 86400);
    if (jours < 30) return `il y a ${jours} jour${jours > 1 ? "s" : ""}`;
    return new Date(date).toLocaleDateString("fr-FR");
  }

  if (loading) return <div className="loading">⏳ Chargement...</div>;

  const filtres = data.filter(i => { const q = recherche.toLowerCase(); return !q || `${i.titre} ${i.description || ""} ${i.residences?.nom || ""}`.toLowerCase().includes(q); });
  const ouverts = filtres.filter(i => i.statut === "ouvert");
  const enCours = filtres.filter(i => i.statut === "en_cours");
  const debutMois = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  const resolus = filtres.filter(i => i.statut === "resolu" && i.resolu_at && new Date(i.resolu_at) >= debutMois);
  const resolusAll = filtres.filter(i => i.statut === "resolu");

  const statutBadge = { ouvert: "badge-red", en_cours: "badge-orange", resolu: "badge-green" };
  const statutLabel = { ouvert: "Ouvert", en_cours: "En cours", resolu: "Résolu" };
  const groupes = [
    { statut: "ouvert", items: ouverts },
    { statut: "en_cours", items: enCours },
    { statut: "resolu", items: resolusAll },
  ];

  return (
    <div>
      <div className="topbar">
        <div><div className="page-title">🔧 Incidents</div><div className="page-sub">{data.length} incident(s) enregistré(s)</div></div>
        <button className="btn btn-primary" onClick={() => setModal(true)}>+ Signaler un incident</button>
      </div>
      <div className="search-bar"><span style={{ color: "var(--gris)" }}>🔍</span><input placeholder="Rechercher par titre, description, résidence…" value={recherche} onChange={e => setRecherche(e.target.value)} /></div>
      <div className="grid-3" style={{ marginBottom: 20 }}>
        <div className="stat-card"><div className="stat-label">🔴 Ouverts</div><div className="stat-value" style={{ color: "var(--rouge)" }}>{ouverts.length}</div><div className="stat-sub">à traiter</div></div>
        <div className="stat-card"><div className="stat-label">🟠 En cours</div><div className="stat-value" style={{ color: "var(--orange)" }}>{enCours.length}</div><div className="stat-sub">en traitement</div></div>
        <div className="stat-card"><div className="stat-label">✅ Résolus ce mois</div><div className="stat-value" style={{ color: "var(--vert)" }}>{resolus.length}</div><div className="stat-sub">ce mois-ci</div></div>
      </div>
      {data.length === 0 && <div className="card"><div className="empty"><div className="empty-icon">✅</div><div className="empty-text">Aucun incident enregistré</div></div></div>}
      {groupes.map(({ statut, items }) => items.length === 0 ? null : (
        <div key={statut} className="card" style={{ marginBottom: 16 }}>
          <div className="card-header"><span className="card-title"><Badge statut={statut} /></span><span style={{ color: "var(--gris)", fontSize: 12 }}>{items.length}</span></div>
          {items.map(inc => (
            <div key={inc.id} className="list-item">
              <div className="list-icon">{statut === "ouvert" ? "🔴" : statut === "en_cours" ? "🟠" : "✅"}</div>
              <div className="list-content">
                <div className="list-title">{inc.titre}</div>
                <div className="list-sub">
                  {inc.residences?.nom || "—"} · {tempsRelatif(inc.created_at)}
                  {inc.description && <span style={{ display: "block", marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 320 }}>{inc.description}</span>}
                </div>
              </div>
              <button className="btn btn-secondary btn-sm" onClick={() => openDetail(inc)}>Voir</button>
            </div>
          ))}
        </div>
      ))}
      {modal && <Modal title="🔧 Signaler un incident" onClose={() => { setModal(false); setForm(emptyForm); }}>
        <div className="form-group"><label className="form-label">Titre *</label><input className="form-input" value={form.titre} onChange={e => setForm({ ...form, titre: e.target.value })} /></div>
        <div className="form-group"><label className="form-label">Description</label><textarea className="form-input" rows={3} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} /></div>
        <div className="form-group"><label className="form-label">Résidence</label>
          <select className="form-input" value={form.residence_id} onChange={e => setForm({ ...form, residence_id: e.target.value })}>
            <option value="">Sélectionner...</option>
            {residences.map(r => <option key={r.id} value={r.id}>{r.nom}</option>)}
          </select>
        </div>
        <div className="modal-actions"><button className="btn btn-secondary" onClick={() => { setModal(false); setForm(emptyForm); }}>Annuler</button><button className="btn btn-primary" onClick={save}>✅ Enregistrer</button></div>
      </Modal>}
      {modalDetail && <Modal title={`🔧 ${modalDetail.titre}`} onClose={() => setModalDetail(null)}>
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 13, color: "var(--gris)", marginBottom: 8 }}>{modalDetail.residences?.nom || "—"} · {tempsRelatif(modalDetail.created_at)} · <Badge statut={modalDetail.statut} /></div>
          {modalDetail.description && <div style={{ fontSize: 13, background: "var(--bleu-nuit)", padding: "10px 14px", borderRadius: 8, lineHeight: 1.6 }}>{modalDetail.description}</div>}
        </div>
        <div style={{ borderTop: "1px solid var(--bleu-moyen)", paddingTop: 16, marginBottom: 16 }}>
          <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 12 }}>Mettre à jour le statut</div>
          <div className="form-group"><label className="form-label">Nouveau statut</label>
            <select className="form-input" value={detailForm.statut} onChange={e => setDetailForm({ ...detailForm, statut: e.target.value })}>
              <option value="ouvert">Ouvert</option>
              <option value="en_cours">En cours</option>
              <option value="resolu">Résolu</option>
            </select>
          </div>
          <div className="form-group"><label className="form-label">Commentaire *</label><textarea className="form-input" rows={2} placeholder="Décrivez l'action effectuée..." value={detailForm.commentaire} onChange={e => setDetailForm({ ...detailForm, commentaire: e.target.value })} /></div>
          <button className="btn btn-primary" style={{ width: "100%" }} onClick={updateStatut}>✅ Mettre à jour</button>
        </div>
        {historique.length > 0 && (
          <div>
            <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 12, borderTop: "1px solid var(--bleu-moyen)", paddingTop: 16 }}>Historique</div>
            {historique.map((h, i) => (
              <div key={h.id} style={{ display: "flex", gap: 12, marginBottom: 12 }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                  <div style={{ width: 10, height: 10, borderRadius: "50%", background: "var(--or)", flexShrink: 0, marginTop: 3 }} />
                  {i < historique.length - 1 && <div style={{ width: 2, flex: 1, background: "var(--bleu-moyen)", marginTop: 4 }} />}
                </div>
                <div style={{ flex: 1, paddingBottom: 8 }}>
                  <div style={{ fontSize: 11, color: "var(--gris)", marginBottom: 4 }}>{tempsRelatif(h.created_at)}</div>
                  <div style={{ fontSize: 12, marginBottom: 4 }}>
                    <span className={`badge ${statutBadge[h.ancien_statut] || "badge-gray"}`}>{statutLabel[h.ancien_statut] || h.ancien_statut}</span>
                    <span style={{ color: "var(--gris)", margin: "0 6px" }}>→</span>
                    <span className={`badge ${statutBadge[h.nouveau_statut] || "badge-gray"}`}>{statutLabel[h.nouveau_statut] || h.nouveau_statut}</span>
                  </div>
                  {h.commentaire && <div style={{ fontSize: 12, color: "var(--gris)", fontStyle: "italic" }}>"{h.commentaire}"</div>}
                </div>
              </div>
            ))}
          </div>
        )}
      </Modal>}
    </div>
  );
}

function CarnetEntretien({ showToast, userId }) {
  const [data, setData] = useState([]);
  const [residences, setResidences] = useState([]);
  const [interventions, setInterventions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [modalIntervention, setModalIntervention] = useState(null);
  const [modalDetail, setModalDetail] = useState(null);

  const TYPE_EMOJI = { ascenseur: "🛗", extincteurs: "🧯", chaudiere: "🔥", electricite: "⚡", colonnes_eau: "💧" };
  const TYPE_LABEL = { ascenseur: "Ascenseur", extincteurs: "Extincteurs", chaudiere: "Chaudière", electricite: "Électricité", colonnes_eau: "Colonnes d'eau" };
  const PERIODICITE_DEFAUT = { ascenseur: 12, extincteurs: 12, chaudiere: 12, electricite: 60, colonnes_eau: 12 };

  const [recherche, setRecherche] = useState("");
  const emptyForm = { type: "ascenseur", label: "", residence_id: "", periodicite_mois: 12, derniere_intervention: "", prestataire: "", notes: "" };
  const emptyFormInt = { date_intervention: new Date().toISOString().split("T")[0], prestataire: "", rapport: "" };
  const [form, setForm] = useState(emptyForm);
  const [formInt, setFormInt] = useState(emptyFormInt);

  function calcProchaine(derniere, periodicite) {
    if (!derniere) return null;
    const d = new Date(derniere);
    d.setMonth(d.getMonth() + parseInt(periodicite));
    return d.toISOString().split("T")[0];
  }

  async function load() {
    const [e, r] = await Promise.all([
      supabase.from("entretiens").select("*, residences(nom)").order("prochaine_echeance", { ascending: true }),
      supabase.from("residences").select("*"),
    ]);
    setData(e.data || []);
    setResidences(r.data || []);
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  async function openDetail(entretien) {
    setModalDetail(entretien);
    const { data: hist } = await supabase.from("entretiens_interventions").select("*").eq("entretien_id", entretien.id).order("date_intervention", { ascending: false });
    setInterventions(hist || []);
  }

  async function save() {
    if (!form.label) return showToast("Le label est obligatoire", "error");
    const payload = { ...form, periodicite_mois: parseInt(form.periodicite_mois), prochaine_echeance: calcProchaine(form.derniere_intervention, form.periodicite_mois) || null, residence_id: form.residence_id || null };
    const { error } = await supabase.from("entretiens").insert([{ ...payload, user_id: userId }]);
    if (error) return showToast("Erreur : " + error.message, "error");
    showToast("Équipement ajouté ✓", "success");
    setModal(false); setForm(emptyForm); load();
  }

  async function saveIntervention() {
    if (!formInt.date_intervention) return showToast("La date est obligatoire", "error");
    const { error } = await supabase.from("entretiens_interventions").insert([{ entretien_id: modalIntervention.id, date_intervention: formInt.date_intervention, prestataire: formInt.prestataire, rapport: formInt.rapport }]);
    if (error) return showToast("Erreur : " + error.message, "error");
    await supabase.from("entretiens").update({ derniere_intervention: formInt.date_intervention, prochaine_echeance: calcProchaine(formInt.date_intervention, modalIntervention.periodicite_mois), ...(formInt.prestataire ? { prestataire: formInt.prestataire } : {}) }).eq("id", modalIntervention.id);
    showToast("Intervention enregistrée ✓", "success");
    setModalIntervention(null); setFormInt(emptyFormInt); load();
  }

  if (loading) return <div className="loading">⏳ Chargement...</div>;

  const today = new Date().toISOString().split("T")[0];
  const plus30 = new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0];

  function urgence(e) {
    if (!e.prochaine_echeance) return "inconnu";
    if (e.prochaine_echeance < today) return "retard";
    if (e.prochaine_echeance <= plus30) return "urgent";
    return "ok";
  }

  const urgOrdre = { retard: 0, urgent: 1, ok: 2, inconnu: 3 };
  const dataFiltree = data.filter(e => { const q = recherche.toLowerCase(); return !q || `${e.label} ${e.prestataire || ""} ${e.residences?.nom || ""}`.toLowerCase().includes(q); });
  const sortedData = [...dataFiltree].sort((a, b) => urgOrdre[urgence(a)] - urgOrdre[urgence(b)]);
  const enRetard = data.filter(e => urgence(e) === "retard").length;
  const urgentCount = data.filter(e => urgence(e) === "urgent").length;
  const aJour = data.filter(e => urgence(e) === "ok").length;

  const parResidence = {};
  sortedData.forEach(e => {
    const key = e.residence_id || "__sans__";
    if (!parResidence[key]) parResidence[key] = { nom: e.residences?.nom || "Sans résidence", items: [] };
    parResidence[key].items.push(e);
  });

  return (
    <div>
      <div className="topbar">
        <div><div className="page-title">📋 Carnet d'entretien</div><div className="page-sub">{data.length} équipement(s) suivi(s)</div></div>
        <button className="btn btn-primary" onClick={() => setModal(true)}>+ Ajouter un équipement</button>
      </div>
      <div className="search-bar"><span style={{ color: "var(--gris)" }}>🔍</span><input placeholder="Rechercher par équipement, prestataire, résidence…" value={recherche} onChange={e => setRecherche(e.target.value)} /></div>
      <div className="grid-3" style={{ marginBottom: 20 }}>
        <div className="stat-card"><div className="stat-label">🔴 En retard</div><div className="stat-value" style={{ color: "var(--rouge)" }}>{enRetard}</div><div className="stat-sub">intervention requise</div></div>
        <div className="stat-card"><div className="stat-label">🟠 Échéance &lt; 30j</div><div className="stat-value" style={{ color: "var(--orange)" }}>{urgentCount}</div><div className="stat-sub">à planifier</div></div>
        <div className="stat-card"><div className="stat-label">✅ À jour</div><div className="stat-value" style={{ color: "var(--vert)" }}>{aJour}</div><div className="stat-sub">conformes</div></div>
      </div>
      {data.length === 0 && <div className="card"><div className="empty"><div className="empty-icon">📋</div><div className="empty-text">Aucun équipement suivi</div></div></div>}
      {Object.values(parResidence).map(({ nom, items }) => (
        <div key={nom} className="card" style={{ marginBottom: 16 }}>
          <div className="card-header"><span className="card-title">🏢 {nom}</span><span style={{ color: "var(--gris)", fontSize: 12 }}>{items.length} équipement(s)</span></div>
          <div className="table-wrap"><table>
            <thead><tr><th>Équipement</th><th>Prochaine échéance</th><th>Prestataire</th><th>Statut</th><th></th></tr></thead>
            <tbody>
              {items.map(e => {
                const urg = urgence(e);
                const badgeCls = urg === "retard" ? "badge-red" : urg === "urgent" ? "badge-orange" : urg === "ok" ? "badge-green" : "badge-gray";
                const badgeLabel = urg === "retard" ? "En retard" : urg === "urgent" ? "< 30 jours" : urg === "ok" ? "OK" : "—";
                return (
                  <tr key={e.id}>
                    <td><strong>{TYPE_EMOJI[e.type] || "🔧"} {e.label}</strong></td>
                    <td style={{ color: urg === "retard" ? "var(--rouge)" : urg === "urgent" ? "var(--orange)" : "var(--gris)" }}>{e.prochaine_echeance ? new Date(e.prochaine_echeance).toLocaleDateString("fr-FR") : "—"}</td>
                    <td style={{ color: "var(--gris)" }}>{e.prestataire || "—"}</td>
                    <td><span className={`badge ${badgeCls}`}>{badgeLabel}</span></td>
                    <td>
                      <div style={{ display: "flex", gap: 6 }}>
                        <button className="btn btn-primary btn-sm" onClick={() => { setModalIntervention(e); setFormInt({ ...emptyFormInt, prestataire: e.prestataire || "" }); }}>✓ Fait</button>
                        <button className="btn btn-secondary btn-sm" onClick={() => openDetail(e)}>Historique</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table></div>
        </div>
      ))}
      {modal && <Modal title="📋 Ajouter un équipement" onClose={() => { setModal(false); setForm(emptyForm); }}>
        <div className="form-row">
          <div className="form-group"><label className="form-label">Type *</label>
            <select className="form-input" value={form.type} onChange={e => setForm({ ...form, type: e.target.value, periodicite_mois: PERIODICITE_DEFAUT[e.target.value] || 12 })}>
              {Object.entries(TYPE_LABEL).map(([k, v]) => <option key={k} value={k}>{TYPE_EMOJI[k]} {v}</option>)}
            </select>
          </div>
          <div className="form-group"><label className="form-label">Label *</label><input className="form-input" placeholder="ex: Ascenseur bât. A" value={form.label} onChange={e => setForm({ ...form, label: e.target.value })} /></div>
        </div>
        <div className="form-row">
          <div className="form-group"><label className="form-label">Résidence</label>
            <select className="form-input" value={form.residence_id} onChange={e => setForm({ ...form, residence_id: e.target.value })}>
              <option value="">Sélectionner...</option>
              {residences.map(r => <option key={r.id} value={r.id}>{r.nom}</option>)}
            </select>
          </div>
          <div className="form-group"><label className="form-label">Périodicité (mois)</label><input className="form-input" type="number" min="1" value={form.periodicite_mois} onChange={e => setForm({ ...form, periodicite_mois: e.target.value })} /></div>
        </div>
        <div className="form-row">
          <div className="form-group"><label className="form-label">Dernière intervention</label><input className="form-input" type="date" value={form.derniere_intervention} onChange={e => setForm({ ...form, derniere_intervention: e.target.value })} /></div>
          <div className="form-group"><label className="form-label">Prestataire habituel</label><input className="form-input" value={form.prestataire} onChange={e => setForm({ ...form, prestataire: e.target.value })} /></div>
        </div>
        <div className="form-group"><label className="form-label">Notes</label><textarea className="form-input" rows={2} value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} /></div>
        <div className="modal-actions"><button className="btn btn-secondary" onClick={() => { setModal(false); setForm(emptyForm); }}>Annuler</button><button className="btn btn-primary" onClick={save}>✅ Enregistrer</button></div>
      </Modal>}
      {modalIntervention && <Modal title={`✓ Intervention — ${TYPE_EMOJI[modalIntervention.type]} ${modalIntervention.label}`} onClose={() => { setModalIntervention(null); setFormInt(emptyFormInt); }}>
        <div className="form-group"><label className="form-label">Date de l'intervention *</label><input className="form-input" type="date" value={formInt.date_intervention} onChange={e => setFormInt({ ...formInt, date_intervention: e.target.value })} /></div>
        <div className="form-group"><label className="form-label">Prestataire</label><input className="form-input" value={formInt.prestataire} onChange={e => setFormInt({ ...formInt, prestataire: e.target.value })} /></div>
        <div className="form-group"><label className="form-label">Rapport / Notes</label><textarea className="form-input" rows={3} value={formInt.rapport} onChange={e => setFormInt({ ...formInt, rapport: e.target.value })} /></div>
        {formInt.date_intervention && <div style={{ fontSize: 12, color: "var(--gris)", marginBottom: 16 }}>Prochaine échéance calculée : <strong style={{ color: "var(--or-clair)" }}>{new Date(calcProchaine(formInt.date_intervention, modalIntervention.periodicite_mois)).toLocaleDateString("fr-FR")}</strong></div>}
        <div className="modal-actions"><button className="btn btn-secondary" onClick={() => { setModalIntervention(null); setFormInt(emptyFormInt); }}>Annuler</button><button className="btn btn-primary" onClick={saveIntervention}>✅ Enregistrer</button></div>
      </Modal>}
      {modalDetail && <Modal title={`📋 Historique — ${TYPE_EMOJI[modalDetail.type]} ${modalDetail.label}`} onClose={() => setModalDetail(null)}>
        <div style={{ fontSize: 13, color: "var(--gris)", marginBottom: 16 }}>{modalDetail.residences?.nom || "—"} · Périodicité : {modalDetail.periodicite_mois} mois</div>
        {interventions.length === 0 ? (
          <div className="empty"><div className="empty-text">Aucune intervention enregistrée</div></div>
        ) : interventions.map((int, i) => (
          <div key={int.id} style={{ display: "flex", gap: 12, marginBottom: 12 }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
              <div style={{ width: 10, height: 10, borderRadius: "50%", background: "var(--vert)", flexShrink: 0, marginTop: 3 }} />
              {i < interventions.length - 1 && <div style={{ width: 2, flex: 1, background: "var(--bleu-moyen)", marginTop: 4 }} />}
            </div>
            <div style={{ flex: 1, paddingBottom: 8 }}>
              <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 2 }}>{new Date(int.date_intervention).toLocaleDateString("fr-FR")}</div>
              {int.prestataire && <div style={{ fontSize: 12, color: "var(--gris)", marginBottom: 2 }}>🔧 {int.prestataire}</div>}
              {int.rapport && <div style={{ fontSize: 12, background: "var(--bleu-nuit)", padding: "6px 10px", borderRadius: 6, marginTop: 4 }}>{int.rapport}</div>}
            </div>
          </div>
        ))}
      </Modal>}
    </div>
  );
}

function Documents({ showToast, userId }) {
  const [residences, setResidences] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedResidence, setSelectedResidence] = useState(null);
  const [selectedCategorie, setSelectedCategorie] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);

  const categories = [
    { id: "ag_pv", label: "AG & PV", icon: "📋" },
    { id: "travaux_devis", label: "Travaux & Devis", icon: "🔧" },
    { id: "contrats", label: "Contrats", icon: "📝" },
    { id: "diagnostics", label: "Diagnostics", icon: "🔍" },
    { id: "reglements", label: "Règlements", icon: "⚖️" },
    { id: "autres", label: "Autres", icon: "📁" },
  ];

  async function load() {
    const [r, d] = await Promise.all([
      supabase.from("residences").select("id, nom"),
      supabase.from("documents").select("*, residences(nom)").order("created_at", { ascending: false }),
    ]);
    setResidences(r.data || []);
    setDocuments(d.data || []);
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  const docsFiltres = documents.filter(d => {
    if (selectedResidence && d.residence_id !== selectedResidence) return false;
    if (selectedCategorie && d.categorie !== selectedCategorie) return false;
    return true;
  });

  function countByCategorie(catId) {
    return documents.filter(d => (!selectedResidence || d.residence_id === selectedResidence) && d.categorie === catId).length;
  }

  function formatTaille(bytes) {
    if (!bytes) return "—";
    if (bytes < 1024) return `${bytes} o`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} Ko`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
  }

  function iconeExtension(nom) {
    const ext = (nom || "").split(".").pop().toLowerCase();
    if (ext === "pdf") return { icon: "📄", color: "var(--rouge)" };
    if (["xls", "xlsx", "csv"].includes(ext)) return { icon: "📊", color: "var(--vert)" };
    if (["doc", "docx"].includes(ext)) return { icon: "📝", color: "var(--bleu)" };
    if (["jpg", "jpeg", "png", "gif", "webp"].includes(ext)) return { icon: "🖼️", color: "var(--orange)" };
    return { icon: "📁", color: "var(--gris)" };
  }

  async function uploadFichier(file) {
    if (!selectedResidence || !selectedCategorie) return showToast("Sélectionnez une résidence et une catégorie d'abord", "error");
    setUploading(true);
    const path = `${selectedResidence}/${selectedCategorie}/${Date.now()}_${file.name}`;
    const { error: storageErr } = await supabase.storage.from("documents").upload(path, file);
    if (storageErr) { setUploading(false); return showToast("Erreur upload : " + storageErr.message, "error"); }
    const { error: dbErr } = await supabase.from("documents").insert([{ nom: file.name, residence_id: selectedResidence, categorie: selectedCategorie, path, taille: file.size }]);
    if (dbErr) { setUploading(false); return showToast("Erreur BDD : " + dbErr.message, "error"); }
    showToast(`${file.name} uploadé ✓`, "success");
    setUploading(false);
    load();
  }

  async function handleDrop(e) {
    e.preventDefault(); setDragOver(false);
    for (const file of Array.from(e.dataTransfer.files)) await uploadFichier(file);
  }

  async function handleFileInput(e) {
    for (const file of Array.from(e.target.files)) await uploadFichier(file);
    e.target.value = "";
  }

  async function telecharger(doc) {
    const { data, error } = await supabase.storage.from("documents").download(doc.path);
    if (error) return showToast("Erreur téléchargement", "error");
    const url = URL.createObjectURL(data);
    const a = document.createElement("a"); a.href = url; a.download = doc.nom; a.click();
    URL.revokeObjectURL(url);
  }

  async function supprimer(doc) {
    if (!confirm(`Supprimer "${doc.nom}" ?`)) return;
    await supabase.storage.from("documents").remove([doc.path]);
    await supabase.from("documents").delete().eq("id", doc.id);
    showToast("Supprimé ✓", "success"); load();
  }

  if (loading) return <div className="loading">⏳ Chargement...</div>;

  return (
    <div>
      <div className="topbar">
        <div><div className="page-title">📁 Documents</div><div className="page-sub">{documents.length} document(s)</div></div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "220px 1fr", gap: 16 }}>

        {/* Sidebar gauche */}
        <div className="card" style={{ padding: 0, overflow: "hidden", alignSelf: "start" }}>
          <div
            className={`nav-item ${!selectedResidence ? "active" : ""}`}
            style={{ borderRadius: 0, borderLeft: "3px solid transparent", margin: 0, padding: "12px 16px", borderBottom: "1px solid var(--bleu-moyen)" }}
            onClick={() => { setSelectedResidence(null); setSelectedCategorie(null); }}
          >
            <span>🏘️</span> Toutes les résidences
          </div>
          {residences.map(r => (
            <div key={r.id}>
              <div
                className={`nav-item ${selectedResidence === r.id && !selectedCategorie ? "active" : ""}`}
                style={{ borderRadius: 0, borderLeft: "3px solid transparent", margin: 0, padding: "10px 16px" }}
                onClick={() => { setSelectedResidence(r.id); setSelectedCategorie(null); }}
              >
                <span>🏢</span> {r.nom}
              </div>
              {selectedResidence === r.id && categories.map(cat => (
                <div
                  key={cat.id}
                  className={`nav-item ${selectedCategorie === cat.id ? "active" : ""}`}
                  style={{ borderRadius: 0, borderLeft: "3px solid transparent", margin: 0, padding: "7px 16px 7px 30px", fontSize: 12 }}
                  onClick={() => setSelectedCategorie(cat.id)}
                >
                  <span>{cat.icon}</span>
                  <span style={{ flex: 1 }}>{cat.label}</span>
                  <span style={{ background: "var(--bleu-moyen)", borderRadius: 10, padding: "1px 7px", fontSize: 11 }}>{countByCategorie(cat.id)}</span>
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* Zone principale */}
        <div>
          {/* Drop zone */}
          <div
            onDragOver={e => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => (selectedResidence && selectedCategorie) && fileInputRef.current.click()}
            style={{
              border: `2px dashed ${dragOver ? "var(--or)" : "var(--bleu-moyen)"}`,
              borderRadius: 12, padding: "24px 20px", textAlign: "center", marginBottom: 16,
              cursor: (selectedResidence && selectedCategorie) ? "pointer" : "default",
              background: dragOver ? "rgba(201,168,76,0.07)" : "var(--bleu-profond)", transition: "all 0.2s",
            }}
          >
            {uploading ? (
              <div style={{ color: "var(--gris)" }}>⏳ Upload en cours…</div>
            ) : (!selectedResidence || !selectedCategorie) ? (
              <div style={{ color: "var(--orange)", fontSize: 13 }}>⚠️ Sélectionnez une résidence et une catégorie à gauche avant d'uploader</div>
            ) : (
              <div>
                <div style={{ fontSize: 26, marginBottom: 6 }}>📂</div>
                <div style={{ color: "var(--gris)", fontSize: 13 }}>Glissez vos fichiers ici ou <span style={{ color: "var(--or)" }}>cliquez pour parcourir</span></div>
              </div>
            )}
            <input ref={fileInputRef} type="file" multiple style={{ display: "none" }} onChange={handleFileInput} />
          </div>

          {/* Liste fichiers */}
          <div className="card">
            <div className="card-header">
              <span className="card-title">
                {selectedCategorie
                  ? `${categories.find(c => c.id === selectedCategorie)?.icon} ${categories.find(c => c.id === selectedCategorie)?.label}`
                  : selectedResidence
                  ? `🏢 ${residences.find(r => r.id === selectedResidence)?.nom}`
                  : "📁 Tous les documents"}
              </span>
              <span style={{ color: "var(--gris)", fontSize: 12 }}>{docsFiltres.length} fichier(s)</span>
            </div>
            {docsFiltres.length === 0
              ? <div className="empty"><div className="empty-icon">📁</div><div className="empty-text">Aucun document</div></div>
              : <div className="table-wrap"><table>
                  <thead><tr><th>Fichier</th><th>Résidence</th><th>Catégorie</th><th>Taille</th><th>Date</th><th></th></tr></thead>
                  <tbody>{docsFiltres.map(doc => {
                    const { icon, color } = iconeExtension(doc.nom);
                    const cat = categories.find(c => c.id === doc.categorie);
                    return (
                      <tr key={doc.id}>
                        <td><span style={{ color, marginRight: 6 }}>{icon}</span>{doc.nom}</td>
                        <td style={{ color: "var(--gris)" }}>{doc.residences?.nom || "—"}</td>
                        <td style={{ color: "var(--gris)" }}>{cat ? `${cat.icon} ${cat.label}` : doc.categorie}</td>
                        <td style={{ color: "var(--gris)" }}>{formatTaille(doc.taille)}</td>
                        <td style={{ color: "var(--gris)" }}>{new Date(doc.created_at).toLocaleDateString("fr-FR")}</td>
                        <td><div style={{ display: "flex", gap: 6 }}>
                          <button className="btn btn-secondary btn-sm" onClick={() => telecharger(doc)}>⬇️</button>
                          <button className="btn btn-danger btn-sm" onClick={() => supprimer(doc)}>🗑️</button>
                        </div></td>
                      </tr>
                    );
                  })}</tbody>
                </table></div>
            }
          </div>
        </div>
      </div>
    </div>
  );
}

function EspaceCopro({ profil, showToast }) {
  const [tab, setTab] = useState("solde");
  const [paiements, setPaiements] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [travaux, setTravaux] = useState([]);
  const [assemblees, setAssemblees] = useState([]);
  const [copro, setCopro] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const coproId = profil.copro_id;
      if (!coproId) { setLoading(false); return; }
      const [c, p, t, a] = await Promise.all([
        supabase.from("coproprietaires").select("*, residences(nom)").eq("id", coproId).single(),
        supabase.from("paiements").select("*, charges(titre)").eq("coproprietaire_id", coproId).order("created_at", { ascending: false }),
        supabase.from("travaux").select("*").order("created_at", { ascending: false }).limit(10),
        supabase.from("assemblees").select("*").order("date_ag", { ascending: false }).limit(10),
      ]);
      setCopro(c.data);
      setPaiements(p.data || []);
      setTravaux(t.data || []);
      setAssemblees(a.data || []);
      if (c.data?.residences?.nom) {
        const { data: files } = await supabase.storage.from("documents").list(c.data.residences.nom, { limit: 50 });
        setDocuments(files || []);
      }
      setLoading(false);
    }
    load();
  }, [profil.copro_id]);

  if (loading) return <div className="loading">⏳ Chargement...</div>;

  const tabs = [
    { id: "solde", label: "💰 Mon solde" },
    { id: "documents", label: "📁 Documents" },
    { id: "travaux", label: "🔧 Travaux" },
    { id: "assemblees", label: "📋 Assemblées" },
  ];

  const solde = paiements.reduce((acc, p) => p.statut === "paye" ? acc + parseFloat(p.montant || 0) : acc, 0);
  const impayes = paiements.filter(p => p.statut === "impaye" || p.statut === "en_attente");

  return (
    <div>
      <div className="topbar">
        <div>
          <div className="page-title">Mon Espace</div>
          <div className="page-sub">{copro ? `Lot ${copro.lot} — ${copro.residences?.nom || ""}` : "Bienvenue"}</div>
        </div>
      </div>
      <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        {tabs.map(t => (
          <button key={t.id} className={`btn ${tab === t.id ? "btn-primary" : "btn-secondary"}`} onClick={() => setTab(t.id)}>{t.label}</button>
        ))}
      </div>

      {tab === "solde" && (
        <div>
          <div className="stats-grid" style={{ gridTemplateColumns: "repeat(3,1fr)" }}>
            <div className="stat-card"><div className="stat-label">Paiements effectués</div><div className="stat-value" style={{ color: "var(--vert)" }}>{solde.toFixed(2)} €</div></div>
            <div className="stat-card"><div className="stat-label">En attente / Impayés</div><div className="stat-value" style={{ color: impayes.length > 0 ? "var(--rouge)" : "var(--vert)" }}>{impayes.length}</div></div>
            <div className="stat-card"><div className="stat-label">Total transactions</div><div className="stat-value">{paiements.length}</div></div>
          </div>
          <div className="card" style={{ marginTop: 16 }}>
            <div className="card-header"><span className="card-title">Historique des paiements</span></div>
            {paiements.length === 0 ? <div className="empty"><div className="empty-text">Aucun paiement enregistré</div></div> : (
              <div className="table-wrap">
                <table><thead><tr><th>Charge</th><th>Montant</th><th>Statut</th><th>Date</th></tr></thead>
                  <tbody>{paiements.map(p => (
                    <tr key={p.id}>
                      <td>{p.charges?.titre || "—"}</td>
                      <td style={{ color: "var(--or-clair)", fontWeight: 600 }}>{p.montant} €</td>
                      <td><Badge statut={p.statut} /></td>
                      <td style={{ color: "var(--gris)" }}>{p.created_at ? new Date(p.created_at).toLocaleDateString("fr-FR") : "—"}</td>
                    </tr>
                  ))}</tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {tab === "documents" && (
        <div className="card">
          <div className="card-header"><span className="card-title">Documents de ma résidence</span></div>
          {documents.length === 0 ? <div className="empty"><div className="empty-icon">📁</div><div className="empty-text">Aucun document disponible</div></div> : (
            <div>{documents.map(f => (
              <div key={f.name} className="list-item">
                <div className="list-icon">📄</div>
                <div className="list-content"><div className="list-title">{f.name}</div></div>
                <button className="btn btn-secondary btn-sm" onClick={async () => {
                  const path = `${copro.residences.nom}/${f.name}`;
                  const { data } = await supabase.storage.from("documents").download(path);
                  const url = URL.createObjectURL(data);
                  const a = document.createElement("a"); a.href = url; a.download = f.name; a.click();
                }}>⬇️ Télécharger</button>
              </div>
            ))}</div>
          )}
        </div>
      )}

      {tab === "travaux" && (
        <div className="card">
          <div className="card-header"><span className="card-title">Travaux en cours</span></div>
          {travaux.length === 0 ? <div className="empty"><div className="empty-text">Aucun travaux</div></div> : (
            <div className="table-wrap">
              <table><thead><tr><th>Titre</th><th>Statut</th><th>Montant</th></tr></thead>
                <tbody>{travaux.map(t => (
                  <tr key={t.id}>
                    <td>{t.titre}</td>
                    <td><Badge statut={t.statut} /></td>
                    <td>{t.montant ? `${t.montant} €` : "—"}</td>
                  </tr>
                ))}</tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {tab === "assemblees" && (
        <div className="card">
          <div className="card-header"><span className="card-title">Assemblées générales</span></div>
          {assemblees.length === 0 ? <div className="empty"><div className="empty-text">Aucune assemblée</div></div> : (
            <div className="table-wrap">
              <table><thead><tr><th>Titre</th><th>Date</th><th>Type</th><th>Statut</th></tr></thead>
                <tbody>{assemblees.map(a => (
                  <tr key={a.id}>
                    <td>{a.titre}</td>
                    <td>{a.date_ag ? new Date(a.date_ag).toLocaleDateString("fr-FR") : "—"}</td>
                    <td><Badge statut={a.type_ag} /></td>
                    <td><Badge statut={a.statut} /></td>
                  </tr>
                ))}</tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function Equipe({ showToast }) {
  const [profils, setProfils] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalInvite, setModalInvite] = useState(false);
  const [formInvite, setFormInvite] = useState({ email: "", prenom: "", nom: "", role: "gestionnaire" });
  const [inviting, setInviting] = useState(false);

  async function load() {
    const { data } = await supabase.from("profiles").select("*").order("role");
    setProfils(data || []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function changerRole(id, role) {
    await supabase.from("profiles").update({ role }).eq("id", id);
    showToast("Rôle mis à jour ✓");
    load();
  }

  async function inviter() {
    if (!formInvite.email) return showToast("Email requis", "error");
    setInviting(true);
    const res = await fetch("/api/inviter-copro", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...formInvite }),
    });
    const json = await res.json();
    setInviting(false);
    if (!res.ok) return showToast("Erreur : " + json.error, "error");
    showToast("Invitation envoyée ✓");
    setModalInvite(false);
    setFormInvite({ email: "", prenom: "", nom: "", role: "gestionnaire" });
    load();
  }

  const roleLabel = { admin: "Admin", gestionnaire: "Gestionnaire", coproprietaire: "Copropriétaire" };
  const roleBadge = { admin: "badge-red", gestionnaire: "badge-blue", coproprietaire: "badge-green" };

  if (loading) return <div className="loading">⏳ Chargement...</div>;

  return (
    <div>
      <div className="topbar">
        <div><div className="page-title">👨‍💼 Équipe</div><div className="page-sub">{profils.length} membre(s)</div></div>
        <button className="btn btn-primary" onClick={() => setModalInvite(true)}>+ Inviter</button>
      </div>
      <div className="card">
        {profils.length === 0 ? <div className="empty"><div className="empty-text">Aucun membre</div></div> : (
          <div className="table-wrap">
            <table>
              <thead><tr><th>Nom</th><th>Rôle</th><th>Changer le rôle</th></tr></thead>
              <tbody>
                {profils.map(p => (
                  <tr key={p.id}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{p.prenom && p.nom ? `${p.prenom} ${p.nom}` : "—"}</div>
                      <div style={{ fontSize: 11, color: "var(--gris)" }}>{p.id}</div>
                    </td>
                    <td><span className={`badge ${roleBadge[p.role] || "badge-gray"}`}>{roleLabel[p.role] || p.role}</span></td>
                    <td>
                      <select value={p.role} onChange={e => changerRole(p.id, e.target.value)} className="form-input" style={{ width: "auto", padding: "4px 8px", fontSize: 12 }}>
                        <option value="admin">Admin</option>
                        <option value="gestionnaire">Gestionnaire</option>
                        <option value="coproprietaire">Copropriétaire</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      {modalInvite && (
        <Modal title="Inviter un membre" onClose={() => setModalInvite(false)}>
          <div className="form-group">
            <label className="form-label">Email *</label>
            <input className="form-input" type="email" value={formInvite.email} onChange={e => setFormInvite(f => ({ ...f, email: e.target.value }))} placeholder="email@exemple.fr" />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Prénom</label>
              <input className="form-input" value={formInvite.prenom} onChange={e => setFormInvite(f => ({ ...f, prenom: e.target.value }))} />
            </div>
            <div className="form-group">
              <label className="form-label">Nom</label>
              <input className="form-input" value={formInvite.nom} onChange={e => setFormInvite(f => ({ ...f, nom: e.target.value }))} />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Rôle</label>
            <select className="form-input" value={formInvite.role} onChange={e => setFormInvite(f => ({ ...f, role: e.target.value }))}>
              <option value="gestionnaire">Gestionnaire</option>
              <option value="admin">Admin</option>
              <option value="coproprietaire">Copropriétaire</option>
            </select>
          </div>
          <div className="modal-actions">
            <button className="btn btn-secondary" onClick={() => setModalInvite(false)}>Annuler</button>
            <button className="btn btn-primary" onClick={inviter} disabled={inviting}>{inviting ? "Envoi…" : "Envoyer l'invitation"}</button>
          </div>
        </Modal>
      )}
    </div>
  );
}

function Login() {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  function switchMode(m) { setMode(m); setError(null); setSuccess(null); setEmail(""); setPassword(""); }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    if (mode === "login") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setError(error.message);
    } else {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) setError(error.message);
      else setSuccess("Compte créé ! Vérifiez votre email pour confirmer votre inscription.");
    }
    setLoading(false);
  }

  const inputStyle = { width: "100%", background: "var(--bleu-nuit)", border: "1px solid var(--bleu-moyen)", borderRadius: 8, padding: "10px 14px", color: "var(--blanc)", fontSize: 14, outline: "none" };

  return (
    <>
      <style>{styles}</style>
      <div style={{ position: "fixed", inset: 0, background: "var(--bleu-nuit)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ background: "var(--bleu-profond)", border: "1px solid var(--bleu-moyen)", borderRadius: 16, padding: "48px 40px", width: 380, boxShadow: "0 20px 60px rgba(0,0,0,0.4)" }}>

          <div style={{ textAlign: "center", marginBottom: 32 }}>
            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, color: "var(--or)", marginBottom: 6 }}>SyndicPro</div>
            <div style={{ color: "var(--gris)", fontSize: 14 }}>Gestion copropriété</div>
          </div>

          <div style={{ display: "flex", background: "var(--bleu-nuit)", borderRadius: 10, padding: 4, marginBottom: 28 }}>
            {["login", "register"].map(m => (
              <button key={m} onClick={() => switchMode(m)} style={{ flex: 1, padding: "8px", borderRadius: 7, border: "none", cursor: "pointer", fontWeight: 500, fontSize: 13, transition: "all 0.2s", background: mode === m ? "var(--bleu-moyen)" : "transparent", color: mode === m ? "var(--blanc)" : "var(--gris)" }}>
                {m === "login" ? "Se connecter" : "S'inscrire"}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", color: "var(--gris)", fontSize: 13, marginBottom: 6 }}>Adresse email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="syndic@exemple.fr" style={inputStyle} />
            </div>
            <div style={{ marginBottom: 24 }}>
              <label style={{ display: "block", color: "var(--gris)", fontSize: 13, marginBottom: 6 }}>
                Mot de passe{mode === "register" && <span style={{ color: "var(--gris)", fontWeight: 400 }}> (6 caractères min.)</span>}
              </label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} required placeholder="••••••••" style={inputStyle} />
            </div>

            {error && <div style={{ background: "rgba(231,76,60,0.15)", border: "1px solid var(--rouge)", borderRadius: 8, padding: "10px 14px", color: "var(--rouge)", fontSize: 13, marginBottom: 16 }}>{error}</div>}
            {success && <div style={{ background: "rgba(46,204,113,0.15)", border: "1px solid var(--vert)", borderRadius: 8, padding: "10px 14px", color: "var(--vert)", fontSize: 13, marginBottom: 16 }}>{success}</div>}

            <button type="submit" disabled={loading} style={{ width: "100%", background: "var(--or)", color: "var(--bleu-nuit)", border: "none", borderRadius: 8, padding: "12px", fontWeight: 600, fontSize: 15, cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.7 : 1 }}>
              {loading ? (mode === "login" ? "Connexion…" : "Inscription…") : (mode === "login" ? "Se connecter" : "Créer mon compte")}
            </button>
          </form>

          <div style={{ textAlign: "center", marginTop: 20, fontSize: 13, color: "var(--gris)" }}>
            {mode === "login"
              ? <><span>Pas encore de compte ?{" "}</span><span onClick={() => switchMode("register")} style={{ color: "var(--or)", cursor: "pointer" }}>S'inscrire</span></>
              : <><span>Déjà un compte ?{" "}</span><span onClick={() => switchMode("login")} style={{ color: "var(--or)", cursor: "pointer" }}>Se connecter</span></>
            }
          </div>

        </div>
      </div>
    </>
  );
}

export default function App() {
  const [session, setSession] = useState(undefined);
  const [profil, setProfil] = useState(null);
  const [page, setPage] = useState("dashboard");
  const [toast, setToast] = useState(null);
  function showToast(message, type = "success") { setToast({ message, type }); }

  async function loadProfil(userId) {
    const { data } = await supabase.from("profiles").select("*").eq("id", userId).single();
    setProfil(data || { role: "admin" });
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) loadProfil(session.user.id);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) loadProfil(session.user.id);
      else setProfil(null);
    });
    return () => subscription.unsubscribe();
  }, []);

  if (session === undefined || (session && !profil)) return (
    <>
      <style>{styles}</style>
      <div style={{ position: "fixed", inset: 0, background: "var(--bleu-nuit)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--gris)", fontSize: 14 }}>
        ⏳ Chargement…
      </div>
    </>
  );
  if (!session) return <Login />;

  const userId = session.user.id;
  const role = profil.role;
  const initiales = session.user.email.slice(0, 2).toUpperCase();
  const roleLabels = { admin: "Administrateur", gestionnaire: "Gestionnaire", coproprietaire: "Copropriétaire" };

  const sidebarUser = (
    <div className="sidebar-user">
      <div className="avatar">{initiales}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="user-name" style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{session.user.email}</div>
        <div className="user-role">{roleLabels[role] || role}</div>
      </div>
      <button onClick={() => supabase.auth.signOut()} title="Déconnexion" style={{ background: "none", border: "none", color: "var(--gris)", cursor: "pointer", fontSize: 18, padding: "4px", flexShrink: 0 }}>⏻</button>
    </div>
  );

  // — Espace copropriétaire —
  if (role === "coproprietaire") {
    return (
      <>
        <style>{styles}</style>
        <div className="app">
          <aside className="sidebar">
            <div className="sidebar-logo"><div className="logo-title">SyndicPro</div><div className="logo-sub">Mon espace</div></div>
            <nav className="nav">
              <div className="nav-label">Mon espace</div>
              <div className="nav-item active"><span>🏠</span>Tableau de bord</div>
            </nav>
            {sidebarUser}
          </aside>
          <main className="main"><EspaceCopro profil={profil} showToast={showToast} /></main>
          {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
        </div>
      </>
    );
  }

  // — Admin & Gestionnaire —
  const pages = {
    dashboard: <Dashboard />,
    residences: <Residences showToast={showToast} userId={userId} />,
    coproprietaires: <Coproprietaires showToast={showToast} userId={userId} />,
    charges: <Charges showToast={showToast} userId={userId} />,
    travaux: <Travaux showToast={showToast} userId={userId} />,
    assemblees: <Assemblees showToast={showToast} userId={userId} />,
    finance: <Finance />,
    incidents: <Incidents showToast={showToast} userId={userId} />,
    carnet: <CarnetEntretien showToast={showToast} userId={userId} />,
    documents: <Documents showToast={showToast} userId={userId} />,
    ...(role === "admin" ? { equipe: <Equipe showToast={showToast} /> } : {}),
  };

  const nav = [
    { id: "dashboard", icon: "🏠", label: "Tableau de bord" },
    { id: "residences", icon: "🏢", label: "Résidences" },
    { id: "coproprietaires", icon: "👥", label: "Copropriétaires" },
    { id: "charges", icon: "💰", label: "Charges & Paiements" },
    { id: "travaux", icon: "🔧", label: "Travaux" },
    { id: "assemblees", icon: "📋", label: "Assemblées Générales" },
    { id: "finance", icon: "📊", label: "Finance" },
    { id: "incidents", icon: "⚠️", label: "Incidents" },
    { id: "carnet", icon: "🗒️", label: "Carnet d'entretien" },
    { id: "documents", icon: "📁", label: "Documents" },
    ...(role === "admin" ? [{ id: "equipe", icon: "👨‍💼", label: "Équipe" }] : []),
  ];

  return (
    <>
      <style>{styles}</style>
      <div className="app">
        <aside className="sidebar">
          <div className="sidebar-logo"><div className="logo-title">SyndicPro</div><div className="logo-sub">Gestion copropriété</div></div>
          <nav className="nav">
            <div className="nav-label">Navigation</div>
            {nav.map(item => <div key={item.id} className={`nav-item ${page === item.id ? "active" : ""}`} onClick={() => setPage(item.id)}><span>{item.icon}</span>{item.label}</div>)}
          </nav>
          {sidebarUser}
        </aside>
        <main className="main">{pages[page] || pages.dashboard}</main>
        {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      </div>
    </>
  );
}
