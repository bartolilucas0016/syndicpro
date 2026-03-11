import { useState, useEffect } from "react";
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
  body { font-family: 'DM Sans', sans-serif; background: var(--bleu-nuit); color: var(--blanc); }
  .app { display: flex; min-height: 100vh; }
  .sidebar { width: 240px; min-height: 100vh; background: var(--bleu-profond); border-right: 1px solid var(--bleu-moyen); display: flex; flex-direction: column; position: fixed; top: 0; left: 0; z-index: 100; }
  .sidebar-logo { padding: 24px 20px; border-bottom: 1px solid var(--bleu-moyen); }
  .logo-title { font-family: 'Playfair Display', serif; font-size: 20px; color: var(--or); }
  .logo-sub { font-size: 10px; color: var(--gris); letter-spacing: 2px; text-transform: uppercase; margin-top: 2px; }
  .nav { padding: 16px 10px; flex: 1; }
  .nav-label { font-size: 10px; color: var(--gris); text-transform: uppercase; letter-spacing: 2px; padding: 0 10px; margin: 12px 0 6px; }
  .nav-item { display: flex; align-items: center; gap: 10px; padding: 9px 10px; border-radius: 8px; cursor: pointer; color: var(--gris); font-size: 13px; font-weight: 500; transition: all 0.2s; margin-bottom: 2px; border-left: 3px solid transparent; }
  .nav-item:hover { background: var(--bleu-moyen); color: var(--blanc); }
  .nav-item.active { background: rgba(201,168,76,0.12); color: var(--or-clair); border-left-color: var(--or); }
  .sidebar-user { padding: 14px 20px; border-top: 1px solid var(--bleu-moyen); display: flex; align-items: center; gap: 10px; }
  .avatar { width: 32px; height: 32px; border-radius: 50%; background: linear-gradient(135deg, var(--or), var(--bleu-moyen)); display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 700; color: var(--bleu-nuit); }
  .user-name { font-size: 12px; font-weight: 600; }
  .user-role { font-size: 10px; color: var(--gris); }
  .main { margin-left: 240px; flex: 1; padding: 28px; }
  .topbar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
  .page-title { font-family: 'Playfair Display', serif; font-size: 24px; }
  .page-sub { font-size: 13px; color: var(--gris); margin-top: 2px; }
  .btn { padding: 9px 18px; border-radius: 8px; border: none; font-family: 'DM Sans', sans-serif; font-size: 13px; font-weight: 600; cursor: pointer; transition: all 0.2s; }
  .btn-primary { background: var(--or); color: var(--bleu-nuit); }
  .btn-primary:hover { background: var(--or-clair); transform: translateY(-1px); }
  .btn-secondary { background: var(--bleu-moyen); color: var(--blanc); }
  .btn-danger { background: rgba(231,76,60,0.2); color: var(--rouge); }
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
  .table-wrap { overflow-x: auto; }
  table { width: 100%; border-collapse: collapse; }
  thead th { text-align: left; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: var(--gris); padding: 0 0 10px; border-bottom: 1px solid var(--bleu-moyen); }
  tbody tr { border-bottom: 1px solid rgba(30,58,95,0.5); transition: background 0.15s; }
  tbody tr:hover { background: rgba(30,58,95,0.4); }
  tbody tr:last-child { border-bottom: none; }
  tbody td { padding: 12px 0; font-size: 13px; }
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

function Coproprietaires({ showToast }) {
  const [data, setData] = useState([]);
  const [residences, setResidences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ nom: "", prenom: "", email: "", telephone: "", lot: "", tantièmes: "", residence_id: "" });

  async function load() {
    const [c, r] = await Promise.all([supabase.from("coproprietaires").select("*, residences(nom)").order("nom"), supabase.from("residences").select("id, nom")]);
    setData(c.data || []); setResidences(r.data || []); setLoading(false);
  }
  useEffect(() => { load(); }, []);

  async function save() {
    if (!form.nom || !form.prenom || !form.email || !form.lot) return showToast("Remplissez tous les champs obligatoires", "error");
    const { error } = await supabase.from("coproprietaires").insert([{ ...form, tantièmes: parseInt(form.tantièmes) || 0 }]);
    if (error) return showToast("Erreur : " + error.message, "error");
    showToast("Copropriétaire ajouté ✓", "success"); setModal(false);
    setForm({ nom: "", prenom: "", email: "", telephone: "", lot: "", tantièmes: "", residence_id: "" }); load();
  }

  async function supprimer(id) {
    if (!confirm("Supprimer ?")) return;
    await supabase.from("coproprietaires").delete().eq("id", id);
    showToast("Supprimé", "success"); load();
  }

  if (loading) return <div className="loading">⏳ Chargement...</div>;
  return (
    <div>
      <div className="topbar"><div><div className="page-title">👥 Copropriétaires</div><div className="page-sub">{data.length} propriétaire(s)</div></div><button className="btn btn-primary" onClick={() => setModal(true)}>+ Ajouter</button></div>
      <div className="card">
        {data.length === 0 ? <div className="empty"><div className="empty-icon">👤</div><div className="empty-text">Aucun copropriétaire</div></div> : (
          <div className="table-wrap"><table>
            <thead><tr><th>Nom</th><th>Lot</th><th>Email</th><th>Résidence</th><th>Tantièmes</th><th></th></tr></thead>
            <tbody>{data.map(c => <tr key={c.id}><td><strong>{c.prenom} {c.nom}</strong></td><td style={{ color: "var(--or-clair)" }}>{c.lot}</td><td style={{ color: "var(--gris)" }}>{c.email}</td><td>{c.residences?.nom || "—"}</td><td>{c.tantièmes}</td><td><button className="btn btn-danger btn-sm" onClick={() => supprimer(c.id)}>🗑️</button></td></tr>)}</tbody>
          </table></div>
        )}
      </div>
      {modal && <Modal title="➕ Nouveau copropriétaire" onClose={() => setModal(false)}>
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
          <div className="form-group"><label className="form-label">Tantièmes</label><input className="form-input" type="number" value={form.tantièmes} onChange={e => setForm({ ...form, tantièmes: e.target.value })} /></div>
          <div className="form-group"><label className="form-label">Résidence</label>
            <select className="form-input" value={form.residence_id} onChange={e => setForm({ ...form, residence_id: e.target.value })}>
              <option value="">Sélectionner...</option>
              {residences.map(r => <option key={r.id} value={r.id}>{r.nom}</option>)}
            </select>
          </div>
        </div>
        <div className="modal-actions"><button className="btn btn-secondary" onClick={() => setModal(false)}>Annuler</button><button className="btn btn-primary" onClick={save}>✅ Enregistrer</button></div>
      </Modal>}
    </div>
  );
}

function Charges({ showToast }) {
  const [charges, setCharges] = useState([]);
  const [paiements, setPaiements] = useState([]);
  const [copros, setCopros] = useState([]);
  const [residences, setResidences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalCharge, setModalCharge] = useState(false);
  const [modalPaiement, setModalPaiement] = useState(false);
  const [formCharge, setFormCharge] = useState({ titre: "", montant_total: "", date_echeance: "", residence_id: "", trimestre: "" });
  const [formPaiement, setFormPaiement] = useState({ charge_id: "", coproprietaire_id: "", montant: "", statut: "paye", mode_paiement: "virement", date_paiement: new Date().toISOString().split("T")[0] });

  async function load() {
    const [ch, p, c, r] = await Promise.all([
      supabase.from("charges").select("*, residences(nom)").order("date_echeance", { ascending: false }),
      supabase.from("paiements").select("*, coproprietaires(nom, prenom, lot), charges(titre)").order("created_at", { ascending: false }),
      supabase.from("coproprietaires").select("id, nom, prenom, lot"),
      supabase.from("residences").select("id, nom"),
    ]);
    setCharges(ch.data || []); setPaiements(p.data || []); setCopros(c.data || []); setResidences(r.data || []); setLoading(false);
  }
  useEffect(() => { load(); }, []);

  async function saveCharge() {
    if (!formCharge.titre || !formCharge.montant_total) return showToast("Champs obligatoires manquants", "error");
    const { error } = await supabase.from("charges").insert([{ ...formCharge, montant_total: parseFloat(formCharge.montant_total) }]);
    if (error) return showToast("Erreur : " + error.message, "error");
    showToast("Charge ajoutée ✓", "success"); setModalCharge(false);
    setFormCharge({ titre: "", montant_total: "", date_echeance: "", residence_id: "", trimestre: "" }); load();
  }

  async function savePaiement() {
    if (!formPaiement.charge_id || !formPaiement.coproprietaire_id || !formPaiement.montant) return showToast("Remplissez tous les champs", "error");
    const { error } = await supabase.from("paiements").insert([{ ...formPaiement, montant: parseFloat(formPaiement.montant) }]);
    if (error) return showToast("Erreur : " + error.message, "error");
    showToast("Paiement enregistré ✓", "success"); setModalPaiement(false); load();
  }

  if (loading) return <div className="loading">⏳ Chargement...</div>;
  return (
    <div>
      <div className="topbar">
        <div><div className="page-title">💰 Charges & Paiements</div><div className="page-sub">{charges.length} appel(s) · {paiements.length} paiement(s)</div></div>
        <div style={{ display: "flex", gap: 10 }}>
          <button className="btn btn-secondary" onClick={() => setModalCharge(true)}>+ Appel de fonds</button>
          <button className="btn btn-primary" onClick={() => setModalPaiement(true)}>+ Paiement</button>
        </div>
      </div>
      <div className="grid-2">
        <div className="card">
          <div className="card-header"><span className="card-title">📋 Appels de fonds</span></div>
          {charges.length === 0 ? <div className="empty"><div className="empty-icon">📄</div><div className="empty-text">Aucun appel de fonds</div></div> :
            charges.map(c => <div className="list-item" key={c.id}><div className="list-icon">💰</div><div className="list-content"><div className="list-title">{c.titre}</div><div className="list-sub">{c.residences?.nom} · {c.date_echeance}</div></div><div style={{ color: "var(--or-clair)", fontWeight: 600 }}>{c.montant_total} €</div></div>)
          }
        </div>
        <div className="card">
          <div className="card-header"><span className="card-title">💳 Paiements</span></div>
          {paiements.length === 0 ? <div className="empty"><div className="empty-icon">💳</div><div className="empty-text">Aucun paiement</div></div> : (
            <div className="table-wrap"><table>
              <thead><tr><th>Copropriétaire</th><th>Montant</th><th>Statut</th></tr></thead>
              <tbody>{paiements.map(p => <tr key={p.id}><td>{p.coproprietaires ? `${p.coproprietaires.prenom} ${p.coproprietaires.nom}` : "—"}</td><td style={{ color: "var(--or-clair)", fontWeight: 600 }}>{p.montant} €</td><td><Badge statut={p.statut} /></td></tr>)}</tbody>
            </table></div>
          )}
        </div>
      </div>
      {modalCharge && <Modal title="📋 Nouvel appel de fonds" onClose={() => setModalCharge(false)}>
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
        <div className="modal-actions"><button className="btn btn-secondary" onClick={() => setModalCharge(false)}>Annuler</button><button className="btn btn-primary" onClick={saveCharge}>✅ Créer</button></div>
      </Modal>}
      {modalPaiement && <Modal title="💳 Enregistrer un paiement" onClose={() => setModalPaiement(false)}>
        <div className="form-group"><label className="form-label">Appel de fonds *</label>
          <select className="form-input" value={formPaiement.charge_id} onChange={e => setFormPaiement({ ...formPaiement, charge_id: e.target.value })}>
            <option value="">Sélectionner...</option>
            {charges.map(c => <option key={c.id} value={c.id}>{c.titre}</option>)}
          </select>
        </div>
        <div className="form-group"><label className="form-label">Copropriétaire *</label>
          <select className="form-input" value={formPaiement.coproprietaire_id} onChange={e => setFormPaiement({ ...formPaiement, coproprietaire_id: e.target.value })}>
            <option value="">Sélectionner...</option>
            {copros.map(c => <option key={c.id} value={c.id}>{c.prenom} {c.nom} — {c.lot}</option>)}
          </select>
        </div>
        <div className="form-row">
          <div className="form-group"><label className="form-label">Montant *</label><input className="form-input" type="number" value={formPaiement.montant} onChange={e => setFormPaiement({ ...formPaiement, montant: e.target.value })} /></div>
          <div className="form-group"><label className="form-label">Date</label><input className="form-input" type="date" value={formPaiement.date_paiement} onChange={e => setFormPaiement({ ...formPaiement, date_paiement: e.target.value })} /></div>
        </div>
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
        <div className="modal-actions"><button className="btn btn-secondary" onClick={() => setModalPaiement(false)}>Annuler</button><button className="btn btn-primary" onClick={savePaiement}>✅ Enregistrer</button></div>
      </Modal>}
    </div>
  );
}

function Travaux({ showToast }) {
  const [data, setData] = useState([]);
  const [residences, setResidences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ titre: "", description: "", prestataire: "", montant: "", date_debut: "", date_fin_prevue: "", statut: "planifie", urgence: false, residence_id: "" });

  async function load() {
    const [t, r] = await Promise.all([supabase.from("travaux").select("*, residences(nom)").order("created_at", { ascending: false }), supabase.from("residences").select("id, nom")]);
    setData(t.data || []); setResidences(r.data || []); setLoading(false);
  }
  useEffect(() => { load(); }, []);

  async function save() {
    if (!form.titre) return showToast("Le titre est obligatoire", "error");
    const { error } = await supabase.from("travaux").insert([{ ...form, montant: form.montant ? parseFloat(form.montant) : null }]);
    if (error) return showToast("Erreur : " + error.message, "error");
    showToast("Travaux ajoutés ✓", "success"); setModal(false);
    setForm({ titre: "", description: "", prestataire: "", montant: "", date_debut: "", date_fin_prevue: "", statut: "planifie", urgence: false, residence_id: "" }); load();
  }

  if (loading) return <div className="loading">⏳ Chargement...</div>;
  return (
    <div>
      <div className="topbar"><div><div className="page-title">🔧 Travaux & Prestataires</div><div className="page-sub">{data.length} intervention(s)</div></div><button className="btn btn-primary" onClick={() => setModal(true)}>+ Nouveau chantier</button></div>
      <div className="grid-3">
        {["planifie", "en_cours", "termine"].map(statut => (
          <div className="card" key={statut}>
            <div className="card-header"><span className="card-title"><Badge statut={statut} /></span><span style={{ color: "var(--gris)", fontSize: 12 }}>{data.filter(t => t.statut === statut).length}</span></div>
            {data.filter(t => t.statut === statut).length === 0 ? <div className="empty" style={{ padding: "20px 0" }}><div className="empty-text">Aucun</div></div> :
              data.filter(t => t.statut === statut).map(t => (
                <div className="list-item" key={t.id} style={{ borderLeft: `3px solid ${t.urgence ? "var(--rouge)" : "transparent"}` }}>
                  <div className="list-content"><div className="list-title">{t.urgence ? "🚨 " : ""}{t.titre}</div><div className="list-sub">{t.prestataire || "—"}{t.montant ? ` · ${t.montant} €` : ""}</div></div>
                </div>
              ))
            }
          </div>
        ))}
      </div>
      {modal && <Modal title="🔧 Nouveau chantier" onClose={() => setModal(false)}>
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
        <div className="modal-actions"><button className="btn btn-secondary" onClick={() => setModal(false)}>Annuler</button><button className="btn btn-primary" onClick={save}>✅ Enregistrer</button></div>
      </Modal>}
    </div>
  );
}
function Residences({ showToast }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ nom: "", adresse: "", ville: "", code_postal: "", nb_lots: "" });

  async function load() {
    const { data: r } = await supabase.from("residences").select("*").order("nom");
    setData(r || []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function save() {
    if (!form.nom || !form.adresse || !form.ville) return showToast("Remplissez les champs obligatoires", "error");
    const { error } = await supabase.from("residences").insert([{ ...form, nb_lots: parseInt(form.nb_lots) || 0 }]);
    if (error) return showToast("Erreur : " + error.message, "error");
    showToast("Résidence ajoutée ✓", "success");
    setModal(false);
    setForm({ nom: "", adresse: "", ville: "", code_postal: "", nb_lots: "" });
    load();
  }

  async function supprimer(id) {
    if (!confirm("Supprimer cette résidence ?")) return;
    await supabase.from("residences").delete().eq("id", id);
    showToast("Supprimée", "success");
    load();
  }

  if (loading) return <div className="loading">⏳ Chargement...</div>;

  return (
    <div>
      <div className="topbar">
        <div>
          <div className="page-title">🏢 Résidences</div>
          <div className="page-sub">{data.length} résidence(s) gérée(s)</div>
        </div>
        <button className="btn btn-primary" onClick={() => setModal(true)}>+ Ajouter</button>
      </div>
      <div className="grid-3">
        {data.length === 0 ? (
          <div className="empty"><div className="empty-icon">🏢</div><div className="empty-text">Aucune résidence</div></div>
        ) : data.map(r => (
          <div className="card" key={r.id}>
            <div className="card-header">
              <span className="card-title">🏢 {r.nom}</span>
              <button className="btn btn-danger btn-sm" onClick={() => supprimer(r.id)}>🗑️</button>
            </div>
            <div style={{ fontSize: 13, color: "var(--gris)", lineHeight: 1.8 }}>
              <div>📍 {r.adresse}</div>
              <div>🏙️ {r.code_postal} {r.ville}</div>
              <div>🔑 {r.nb_lots} lots</div>
            </div>
          </div>
        ))}
      </div>
      {modal && (
        <Modal title="🏢 Nouvelle résidence" onClose={() => setModal(false)}>
          <div className="form-group"><label className="form-label">Nom *</label><input className="form-input" placeholder="ex: Les Oliviers" value={form.nom} onChange={e => setForm({ ...form, nom: e.target.value })} /></div>
          <div className="form-group"><label className="form-label">Adresse *</label><input className="form-input" placeholder="ex: 12 Avenue des Mimosas" value={form.adresse} onChange={e => setForm({ ...form, adresse: e.target.value })} /></div>
          <div className="form-row">
            <div className="form-group"><label className="form-label">Ville *</label><input className="form-input" value={form.ville} onChange={e => setForm({ ...form, ville: e.target.value })} /></div>
            <div className="form-group"><label className="form-label">Code postal</label><input className="form-input" value={form.code_postal} onChange={e => setForm({ ...form, code_postal: e.target.value })} /></div>
          </div>
          <div className="form-group"><label className="form-label">Nombre de lots</label><input className="form-input" type="number" value={form.nb_lots} onChange={e => setForm({ ...form, nb_lots: e.target.value })} /></div>
          <div className="modal-actions">
            <button className="btn btn-secondary" onClick={() => setModal(false)}>Annuler</button>
            <button className="btn btn-primary" onClick={save}>✅ Enregistrer</button>
          </div>
        </Modal>
      )}
    </div>
  );
}
function Assemblees({ showToast }) {
  const [data, setData] = useState([]);
  const [residences, setResidences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ titre: "", date_ag: "", lieu: "", type_ag: "ordinaire", statut: "planifiee", residence_id: "" });

  async function load() {
    const [a, r] = await Promise.all([supabase.from("assemblees").select("*, residences(nom)").order("date_ag", { ascending: false }), supabase.from("residences").select("id, nom")]);
    setData(a.data || []); setResidences(r.data || []); setLoading(false);
  }
  useEffect(() => { load(); }, []);

  async function save() {
    if (!form.titre || !form.date_ag) return showToast("Titre et date obligatoires", "error");
    const { error } = await supabase.from("assemblees").insert([form]);
    if (error) return showToast("Erreur : " + error.message, "error");
    showToast("AG planifiée ✓", "success"); setModal(false);
    setForm({ titre: "", date_ag: "", lieu: "", type_ag: "ordinaire", statut: "planifiee", residence_id: "" }); load();
  }

  if (loading) return <div className="loading">⏳ Chargement...</div>;
  return (
    <div>
      <div className="topbar"><div><div className="page-title">📋 Assemblées Générales</div><div className="page-sub">{data.length} AG enregistrée(s)</div></div><button className="btn btn-primary" onClick={() => setModal(true)}>+ Planifier une AG</button></div>
      <div className="card">
        {data.length === 0 ? <div className="empty"><div className="empty-icon">📋</div><div className="empty-text">Aucune AG planifiée</div></div> :
          data.map(a => (
            <div className="list-item" key={a.id}>
              <div className="list-icon">{a.statut === "tenue" ? "✅" : "📋"}</div>
              <div className="list-content">
                <div className="list-title">{a.titre}</div>
                <div className="list-sub">{a.date_ag ? new Date(a.date_ag).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" }) : "—"}{a.lieu ? ` · 📍 ${a.lieu}` : ""} · {a.residences?.nom}</div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 4, alignItems: "flex-end" }}><Badge statut={a.statut} /><Badge statut={a.type_ag} /></div>
            </div>
          ))
        }
      </div>
      {modal && <Modal title="📋 Planifier une AG" onClose={() => setModal(false)}>
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
          <div className="form-group"><label className="form-label">Résidence</label>
            <select className="form-input" value={form.residence_id} onChange={e => setForm({ ...form, residence_id: e.target.value })}>
              <option value="">Sélectionner...</option>
              {residences.map(r => <option key={r.id} value={r.id}>{r.nom}</option>)}
            </select>
          </div>
        </div>
        <div className="modal-actions"><button className="btn btn-secondary" onClick={() => setModal(false)}>Annuler</button><button className="btn btn-primary" onClick={save}>✅ Planifier</button></div>
      </Modal>}
    </div>
  );
}

export default function App() {
  const [page, setPage] = useState("dashboard");
  const [toast, setToast] = useState(null);
  function showToast(message, type = "success") { setToast({ message, type }); }
const pages = {
    dashboard: <Dashboard />,
    residences: <Residences showToast={showToast} />,
    coproprietaires: <Coproprietaires showToast={showToast} />,
    charges: <Charges showToast={showToast} />,
    travaux: <Travaux showToast={showToast} />,
    assemblees: <Assemblees showToast={showToast} />,
  };

  const nav = [
    { id: "dashboard", icon: "🏠", label: "Tableau de bord" },
    { id: "residences", icon: "🏢", label: "Résidences" },
    { id: "coproprietaires", icon: "👥", label: "Copropriétaires" },
    { id: "charges", icon: "💰", label: "Charges & Paiements" },
    { id: "travaux", icon: "🔧", label: "Travaux" },
    { id: "assemblees", icon: "📋", label: "Assemblées Générales" },
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
          <div className="sidebar-user"><div className="avatar">SD</div><div><div className="user-name">Syndic</div><div className="user-role">Administrateur</div></div></div>
        </aside>
        <main className="main">{pages[page]}</main>
        {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      </div>
    </>
  );
}

