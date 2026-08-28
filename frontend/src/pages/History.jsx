import React, { useEffect, useMemo, useState } from "react";

const API_BASE_URL = "http://127.0.0.1:8000";

const isHealthy = (value) => {
    const v = String(value || "").trim().toLowerCase();
    return v === "healthy" || v === "healthy leaf" || v.includes("healthy");
};

const jsonArray = (value) => {
    if (Array.isArray(value)) return value;
    if (!value) return [];
    try {
        const x = JSON.parse(value);
        return Array.isArray(x) ? x : [];
    } catch { return []; }
};

const probabilities = (value) => {
    if (!value) return {};
    if (typeof value === "object" && !Array.isArray(value)) return value;
    try {
        const x = JSON.parse(value);
        return x && typeof x === "object" ? x : {};
    } catch { return {}; }
};

const normalize = (item) => ({
    ...item,
    recommendation: item.recommendation && typeof item.recommendation === "object"
        ? item.recommendation
        : {
            severity: item.severity,
            symptoms: jsonArray(item.symptoms),
            immediate_action: jsonArray(item.immediate_action),
            treatment: jsonArray(item.treatment),
            spray_guidance: jsonArray(item.spray_guidance),
            prevention: jsonArray(item.prevention),
            farmer_action: item.farmer_action,
        },
});

function History() {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState("");
    const [selected, setSelected] = useState(null);
    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState("all");

    const token = () => {
        const keys = ["access_token", "token", "accessToken", "authToken", "jwt", "auth"];
        for (const store of [localStorage, sessionStorage]) {
            for (const key of keys) {
                const value = store.getItem(key);
                if (!value) continue;
                try {
                    const parsed = JSON.parse(value);
                    if (typeof parsed === "string" && parsed.length > 20) return parsed;
                    if (parsed?.access_token) return parsed.access_token;
                    if (parsed?.token) return parsed.token;
                } catch { return value; }
            }
        }
        return null;
    };

    const load = async (refresh = false) => {
        try {
            refresh ? setRefreshing(true) : setLoading(true);
            setError("");
            const t = token();
            if (!t) throw new Error("Not authenticated. Please login again.");

            const res = await fetch(`${API_BASE_URL}/history`, {
                headers: { Authorization: `Bearer ${t}`, "Content-Type": "application/json" },
            });
            const data = await res.json();
            if (res.status === 401) throw new Error("Authentication expired. Please login again.");
            if (!res.ok) throw new Error(data.detail || data.message || "Failed to load history.");
            setHistory(Array.isArray(data.history) ? data.history.map(normalize) : []);
        } catch (e) {
            console.error(e);
            setError(e.message || "Unable to connect to AI server.");
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => { load(); }, []);

    const clearHistory = async () => {
        if (!window.confirm("Are you sure you want to delete all detection history?")) return;
        try {
            const t = token();
            if (!t) throw new Error("Not authenticated. Please login again.");
            const res = await fetch(`${API_BASE_URL}/history`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${t}`, "Content-Type": "application/json" },
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok) throw new Error(data.detail || data.message || "Failed to clear history.");
            setHistory([]);
            setSelected(null);
        } catch (e) { setError(e.message || "Unable to clear history."); }
    };

    const summary = useMemo(() => {
        const healthy = history.filter(x => isHealthy(x.prediction)).length;
        const avg = history.length
            ? history.reduce((s, x) => s + Number(x.confidence || 0), 0) / history.length
            : 0;
        return { total: history.length, healthy, disease: history.length - healthy, avg };
    }, [history]);

    const records = useMemo(() => {
        const q = search.trim().toLowerCase();
        return history.filter(item => {
            const okFilter = filter === "all" ||
                (filter === "healthy" && isHealthy(item.prediction)) ||
                (filter === "disease" && !isHealthy(item.prediction));
            const text = `${item.id || ""} ${item.crop || ""} ${item.prediction || ""}`.toLowerCase();
            return okFilter && (!q || text.includes(q));
        });
    }, [history, search, filter]);

    const date = (v) => {
        if (!v) return "Unknown date";
        const d = new Date(v);
        return Number.isNaN(d.getTime()) ? String(v) : d.toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" });
    };

    if (loading) return <><style>{styles}</style><div className="empty"><div>🕘</div><h2>Loading Detection History</h2><p>AgriMind AI is loading your previous results...</p></div></>;

    if (error && !history.length) return <><style>{styles}</style><div className="empty"><div>⚠️</div><h2>Unable to Load History</h2><p>{error}</p><button className="greenBtn" onClick={() => load()}>🔄 Try Again</button></div></>;

    return (
        <div className="history-page">
            <style>{styles}</style>

            <header className="header">
                <div>
                    <span className="eyebrow">AGRIMIND AI • RECORDS</span>
                    <h1>Detection History</h1>
                    <p>Review your previous crop health detection results and AI recommendations.</p>
                </div>
                <div className="actions">
                    <button className="refresh" onClick={() => load(true)} disabled={refreshing}>{refreshing ? "⏳ Refreshing..." : "↻ Refresh"}</button>
                    {history.length > 0 && <button className="delete" onClick={clearHistory}>🗑 Clear History</button>}
                </div>
            </header>

            {error && history.length > 0 && <div className="error">⚠️ {error}</div>}

            {history.length > 0 && <>
                <section className="hero">
                    <div><span>AI DETECTION RECORDS</span><h2>{summary.disease > summary.healthy ? "More attention is needed" : "Your recorded crop health looks good"}</h2><p>{summary.total} detection{summary.total !== 1 ? "s" : ""} recorded with average AI confidence of <b>{summary.avg.toFixed(1)}%</b>.</p></div>
                    <div className="heroCount"><b>{summary.total}</b><span>Total Records</span></div>
                </section>

                <section className="stats">
                    <Stat icon="📊" label="Total Detections" value={summary.total}/>
                    <Stat icon="🌿" label="Healthy" value={summary.healthy} cls="green"/>
                    <Stat icon="🦠" label="Disease Detected" value={summary.disease} cls="red"/>
                    <Stat icon="🎯" label="Avg. Confidence" value={`${summary.avg.toFixed(1)}%`} cls="blue"/>
                </section>

                <section className="toolbar">
                    <div className="search"><span>🔍</span><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search crop, disease or ID..."/></div>
                    <div className="filters">
                        <button className={filter === "all" ? "active" : ""} onClick={() => setFilter("all")}>All ({summary.total})</button>
                        <button className={filter === "healthy" ? "active healthy" : "healthy"} onClick={() => setFilter("healthy")}>🌿 Healthy ({summary.healthy})</button>
                        <button className={filter === "disease" ? "active disease" : "disease"} onClick={() => setFilter("disease")}>🦠 Disease ({summary.disease})</button>
                    </div>
                </section>
            </>}

            {!history.length ? (
                <div className="empty"><div>🕘</div><h2>No Detection History Yet</h2><p>Perform your first AI disease detection. Your result will appear here automatically.</p></div>
            ) : !records.length ? (
                <div className="empty compact"><div>🔎</div><h2>No Matching Results</h2><p>Try another search term or filter.</p></div>
            ) : (
                <div className="list">
                    {records.map(item => <HistoryCard key={item.id || `${item.created_at}-${item.prediction}`} item={item} onDetails={() => setSelected(item)} date={date}/>) }
                </div>
            )}

            {selected && <Modal item={selected} close={() => setSelected(null)} date={date}/>} 
        </div>
    );
}

function Stat({ icon, label, value, cls = "" }) {
    return <div className="stat"><div className={`statIcon ${cls}`}>{icon}</div><div><span>{label}</span><b className={cls}>{value}</b></div></div>;
}

function HistoryCard({ item, onDetails, date }) {
    const healthy = isHealthy(item.prediction);
    const probs = probabilities(item.probabilities);
    const confidence = Number(item.confidence || 0);
    return <article className="card">
        <div className="cardTop">
            <div className="titleRow"><div className={`recordIcon ${healthy ? "goodBg" : "badBg"}`}>{healthy ? "🌿" : "🦠"}</div><div><small>AI DETECTION</small><h2>{item.prediction || "Unknown Prediction"}</h2><p>📅 {date(item.created_at)}</p></div></div>
            <span className={`badge ${healthy ? "good" : "bad"}`}>{healthy ? "✓ Healthy" : "⚠ Disease Detected"}</span>
        </div>
        <div className="resultGrid">
            <Info label="🌱 CROP" value={item.crop || "Unknown Crop"}/>
            <Info label="🎯 CONFIDENCE" value={`${confidence.toFixed(2)}%`} progress={confidence}/>
            <Info label="🆔 RECORD" value={`#${item.id ?? "—"}`}/>
        </div>
        {Object.keys(probs).length > 0 && <div className="probSection"><h3>📊 AI Class Probabilities</h3><p>Confidence across detected classes.</p>{Object.entries(probs).sort(([,a],[,b]) => Number(b)-Number(a)).map(([name,val]) => <Bar key={name} name={name} value={Number(val)} />)}</div>}
        <div className="footer"><span>AgriMind AI analysis record</span><button onClick={onDetails}>🔎 View Full Details →</button></div>
    </article>;
}

function Info({ label, value, progress }) {
    return <div className="info"><span>{label}</span><b>{value}</b>{progress !== undefined && <div className="mini"><i style={{width: `${Math.min(Math.max(progress,0),100)}%`}}/></div>}</div>;
}

function Bar({ name, value }) {
    const healthy = isHealthy(name);
    return <div className="barRow"><div><span>{name}</span><b>{value.toFixed(2)}%</b></div><div className="track"><i className={healthy ? "greenBar" : "redBar"} style={{width: `${Math.min(Math.max(value,0),100)}%`}}/></div></div>;
}

function ListSection({ title, items }) {
    if (!Array.isArray(items) || !items.length) return null;
    return <div className="recSection"><h4>{title}</h4><ul>{items.map((x,i)=><li key={i}>{x}</li>)}</ul></div>;
}

function Modal({ item, close, date }) {
    const probs = probabilities(item.probabilities);
    const rec = item.recommendation;
    return <div className="overlay" onClick={close}><div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modalHead"><div><span className="eyebrow">AGRIMIND AI • DETECTION</span><h2>🧠 Detection Details</h2><p>Record #{item.id ?? "—"}</p></div><button className="x" onClick={close}>×</button></div>
        <div className="modalGrid"><Info label="🌱 CROP" value={item.crop || "Unknown Crop"}/><Info label="🦠 PREDICTION" value={item.prediction || "Unknown"}/><Info label="🎯 CONFIDENCE" value={`${Number(item.confidence || 0).toFixed(2)}%`}/></div>
        <div className="dateBox"><b>📅 Detection Date</b><span>{date(item.created_at)}</span></div>
        {Object.keys(probs).length > 0 && <div className="modalSection"><h3>📊 AI Class Probabilities</h3>{Object.entries(probs).sort(([,a],[,b])=>Number(b)-Number(a)).map(([name,val])=><Bar key={name} name={name} value={Number(val)}/>)}</div>}
        {rec && <div className="recommendation"><div className="recHead"><div>💡</div><section><span>AGRIMIND AI</span><h3>AI Crop Health Recommendation</h3></section></div>
            {rec.severity && <div className="severity"><b>⚠️ Severity</b><span>{rec.severity}</span></div>}
            <ListSection title="🔎 Symptoms" items={rec.symptoms}/>
            <ListSection title="🚨 Immediate Action" items={rec.immediate_action}/>
            <ListSection title="💊 Treatment / What You Should Do" items={rec.treatment}/>
            <ListSection title="🛡️ Prevention" items={rec.prevention}/>
            {Array.isArray(rec.spray_guidance) && rec.spray_guidance.length > 0 && <div className="spray"><h4>🧴 Spray Guidance</h4><ul>{rec.spray_guidance.map((x,i)=><li key={i}>{x}</li>)}</ul></div>}
            {rec.farmer_action && <div className="farmer"><h4>👨‍🌾 Farmer Action</h4><p>{rec.farmer_action}</p></div>}
        </div>}
        <div className="modalFooter"><button onClick={close}>Close Details</button></div>
    </div></div>;
}

const styles = `
.history-page{min-height:100%;padding:30px 34px 70px;color:#10261a;background:radial-gradient(circle at 90% 0%,rgba(34,197,94,.06),transparent 30%)}
.history-page *{box-sizing:border-box}.header{display:flex;align-items:flex-end;justify-content:space-between;gap:25px;margin-bottom:25px}.eyebrow{display:inline-block;margin-bottom:8px;color:#16a34a;font-size:11px;font-weight:900;letter-spacing:2px}.header h1{margin:0;font-size:36px;font-weight:900;letter-spacing:-1px}.header p{margin:8px 0 0;color:#718096;font-size:15px}.actions{display:flex;gap:10px;flex-wrap:wrap}.refresh,.delete,.greenBtn{height:44px;padding:0 17px;border-radius:11px;font-weight:800;cursor:pointer}.refresh{border:1px solid #16a34a;background:#fff;color:#15803d}.delete{border:0;background:#dc2626;color:#fff}.refresh:disabled{opacity:.6}.error{margin-bottom:20px;padding:13px 16px;border:1px solid #fecaca;border-radius:12px;background:#fff7f7;color:#991b1b}.hero{display:flex;align-items:center;justify-content:space-between;gap:30px;min-height:215px;margin-bottom:22px;padding:35px 40px;border-radius:23px;color:#fff;background:linear-gradient(135deg,#087a3a,#16a34a,#22c55e);box-shadow:0 16px 38px rgba(21,128,61,.17)}.hero>div:first-child{max-width:780px}.hero span{font-size:11px;font-weight:900;letter-spacing:2px;opacity:.85}.hero h2{margin:11px 0 9px;font-size:31px;font-weight:900}.hero p{margin:0;color:rgba(255,255,255,.9);line-height:1.7}.heroCount{width:120px;height:120px;min-width:120px;display:flex;flex-direction:column;align-items:center;justify-content:center;border:1px solid rgba(255,255,255,.3);border-radius:50%;background:rgba(255,255,255,.13)}.heroCount b{font-size:30px}.heroCount span{margin-top:3px;font-size:10px}.stats{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:16px;margin-bottom:22px}.stat{display:flex;align-items:center;gap:14px;min-height:105px;padding:19px;border:1px solid #e3ebe6;border-radius:17px;background:#fff;box-shadow:0 6px 22px rgba(15,60,30,.05)}.statIcon{width:52px;height:52px;min-width:52px;display:flex;align-items:center;justify-content:center;border-radius:15px;font-size:24px;background:#dcfce7}.statIcon.red{background:#fef2f2}.statIcon.blue{background:#eff6ff}.stat span{display:block;margin-bottom:5px;color:#718096;font-size:12px;font-weight:700}.stat b{font-size:24px}.stat b.green{color:#15803d}.stat b.red{color:#dc2626}.stat b.blue{color:#2563eb}.toolbar{display:flex;align-items:center;justify-content:space-between;gap:15px;margin-bottom:20px;padding:14px;border:1px solid #e3ebe6;border-radius:17px;background:#fff;box-shadow:0 5px 20px rgba(15,60,30,.04)}.search{width:min(430px,100%);height:44px;display:flex;align-items:center;gap:9px;padding:0 13px;border:1px solid #dce8e1;border-radius:11px;background:#f8faf9}.search input{width:100%;border:0;outline:0;background:transparent;font-size:13px}.filters{display:flex;gap:7px;flex-wrap:wrap}.filters button{height:38px;padding:0 12px;border:1px solid #dfe8e2;border-radius:10px;background:#fff;color:#64748b;cursor:pointer;font-size:12px;font-weight:800}.filters button.active{border-color:#86efac;background:#ecfdf3;color:#15803d}.filters button.active.disease{border-color:#fecaca;background:#fff1f2;color:#dc2626}.list{display:flex;flex-direction:column;gap:18px}.card{padding:24px;border:1px solid #e3ebe6;border-radius:19px;background:#fff;box-shadow:0 6px 22px rgba(15,60,30,.05);transition:.2s}.card:hover{transform:translateY(-2px);box-shadow:0 12px 30px rgba(15,60,30,.08)}.cardTop{display:flex;align-items:center;justify-content:space-between;gap:18px;margin-bottom:20px}.titleRow{display:flex;align-items:center;gap:13px}.recordIcon{width:54px;height:54px;min-width:54px;display:flex;align-items:center;justify-content:center;border-radius:15px;font-size:25px}.goodBg{background:#dcfce7}.badBg{background:#fef2f2}.titleRow small{color:#94a3b8;font-size:9px;font-weight:900;letter-spacing:1.5px}.titleRow h2{margin:4px 0;font-size:19px}.titleRow p{margin:0;color:#718096;font-size:12px}.badge{padding:8px 12px;border-radius:999px;font-size:11px;font-weight:900;white-space:nowrap}.badge.good{background:#ecfdf3;color:#15803d}.badge.bad{background:#fff1f2;color:#dc2626}.resultGrid,.modalGrid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px}.info{padding:16px;border:1px solid #edf2ef;border-radius:13px;background:#fbfdfc}.info>span{display:block;margin-bottom:7px;color:#94a3b8;font-size:9px;font-weight:900;letter-spacing:1.2px}.info>b{font-size:16px}.mini{height:7px;overflow:hidden;margin-top:9px;border-radius:99px;background:#e9efeb}.mini i{display:block;height:100%;border-radius:99px;background:#22c55e}.probSection{padding-top:20px;margin-top:20px;border-top:1px solid #edf2ef}.probSection h3,.modalSection h3{margin:0 0 4px;font-size:16px}.probSection>p{margin:0 0 17px;color:#718096;font-size:12px}.barRow{margin-bottom:14px}.barRow>div:first-child{display:flex;justify-content:space-between;gap:15px;margin-bottom:6px}.barRow span,.barRow b{font-size:12px}.track{height:9px;overflow:hidden;border-radius:99px;background:#edf2ef}.track i{display:block;height:100%;border-radius:99px}.greenBar{background:linear-gradient(90deg,#16a34a,#4ade80)}.redBar{background:linear-gradient(90deg,#ef4444,#f97316)}.footer{display:flex;align-items:center;justify-content:space-between;gap:15px;margin-top:18px;padding-top:16px;border-top:1px solid #edf2ef}.footer span{color:#94a3b8;font-size:11px}.footer button{height:40px;padding:0 15px;border:0;border-radius:10px;background:#15803d;color:#fff;cursor:pointer;font-weight:850}.empty{max-width:700px;margin:65px auto;padding:55px 30px;text-align:center;border:1px solid #e3ebe6;border-radius:20px;background:#fff;box-shadow:0 8px 25px rgba(15,60,30,.05)}.empty>div{font-size:52px;margin-bottom:12px}.empty h2{margin:0 0 8px;font-size:24px}.empty p{margin:0;color:#718096;line-height:1.6}.greenBtn{margin-top:20px;border:0;background:#16a34a;color:#fff}.compact{margin:30px auto}.overlay{position:fixed;inset:0;z-index:9999;display:flex;align-items:center;justify-content:center;padding:20px;background:rgba(7,20,12,.62);backdrop-filter:blur(5px)}.modal{width:100%;max-width:900px;max-height:90vh;overflow-y:auto;padding:28px;border-radius:22px;background:#fff;box-shadow:0 25px 70px rgba(0,0,0,.25)}.modalHead{display:flex;justify-content:space-between;gap:20px;margin-bottom:22px}.modalHead h2{margin:0 0 5px;font-size:24px}.modalHead p{margin:0;color:#718096;font-size:12px}.x{width:38px;height:38px;border:0;border-radius:50%;background:#f1f5f3;cursor:pointer;font-size:22px}.dateBox{display:flex;justify-content:space-between;gap:15px;margin:18px 0;padding:15px 17px;border:1px solid #bbf7d0;border-radius:12px;background:#f0fdf4;font-size:12px}.dateBox span{color:#166534;font-weight:750}.modalSection{padding:22px;margin-bottom:20px;border:1px solid #edf2ef;border-radius:16px;background:#fbfdfc}.recommendation{padding:22px;border:1px solid #bbf7d0;border-radius:17px;background:linear-gradient(135deg,#f0fdf4,#fff)}.recHead{display:flex;align-items:center;gap:12px;margin-bottom:20px}.recHead>div{width:48px;height:48px;display:flex;align-items:center;justify-content:center;border-radius:14px;background:#dcfce7;font-size:23px}.recHead span{color:#16a34a;font-size:9px;font-weight:900;letter-spacing:1.5px}.recHead h3{margin:3px 0;font-size:19px}.severity{display:flex;align-items:center;gap:8px;padding:12px;margin-bottom:20px;border-radius:11px;background:#fffbeb}.severity span{padding:5px 10px;border-radius:99px;background:#fef3c7;color:#92400e;font-size:11px;font-weight:800}.recSection{padding:16px 0;border-top:1px solid #e0f2e6}.recSection h4,.spray h4,.farmer h4{margin:0 0 9px;font-size:14px}.recSection ul,.spray ul{margin:0;padding-left:22px;color:#334155;font-size:13px;line-height:1.75}.spray{padding:16px;margin:14px 0;border:1px solid #fed7aa;border-radius:12px;background:#fff7ed}.spray ul{color:#7c2d12}.farmer{margin-top:15px;padding:16px 18px;border:1px solid #a7f3d0;border-radius:12px;background:#ecfdf5}.farmer p{margin:0;color:#166534;font-size:13px;line-height:1.7}.modalFooter{display:flex;justify-content:center;margin-top:24px}.modalFooter button{height:43px;padding:0 24px;border:0;border-radius:10px;background:#15803d;color:#fff;cursor:pointer;font-weight:850}
@media(max-width:1150px){.stats{grid-template-columns:repeat(2,1fr)}.toolbar{align-items:stretch;flex-direction:column}.search{width:100%}}
@media(max-width:850px){.history-page{padding:24px 20px 50px}.header{align-items:flex-start;flex-direction:column}.hero{padding:30px}.hero h2{font-size:27px}.resultGrid,.modalGrid{grid-template-columns:1fr}.cardTop{align-items:flex-start;flex-direction:column}.badge{align-self:flex-start}}
@media(max-width:600px){.stats{grid-template-columns:1fr}.header h1{font-size:30px}.hero{align-items:flex-start;flex-direction:column;padding:25px}.card{padding:18px}.footer{align-items:stretch;flex-direction:column}.footer button{width:100%}.modal{max-height:94vh;padding:20px}.dateBox{align-items:flex-start;flex-direction:column}}
`;

export default History;
