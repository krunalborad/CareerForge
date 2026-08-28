import { useEffect, useRef, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Mic, Square } from "lucide-react";
import api, { errMsg } from "../api/client.js";
import { Alert, ScoreRing } from "../components/ui.jsx";

export default function InterviewRoom() {
  const { id } = useParams();
  const [interview, setInterview] = useState(null);
  const [idx, setIdx] = useState(0);
  const [transcript, setTranscript] = useState("");
  const [recording, setRecording] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [msg, setMsg] = useState({ type: "", text: "" });
  const [busy, setBusy] = useState(false);

  const mediaRef = useRef(null);
  const chunksRef = useRef([]);
  const blobRef = useRef(null);
  const recogRef = useRef(null);
  const startedAt = useRef(0);

  useEffect(() => {
    api.get(`/interviews/${id}`).then(({ data }) => setInterview(data)).catch((e) => setMsg({ type: "error", text: errMsg(e) }));
  }, [id]);

  const startRecording = async () => {
    setFeedback(null); setTranscript(""); setMsg({ type: "", text: "" });
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const rec = new MediaRecorder(stream);
      chunksRef.current = [];
      rec.ondataavailable = (e) => chunksRef.current.push(e.data);
      rec.onstop = () => {
        blobRef.current = new Blob(chunksRef.current, { type: "audio/webm" });
        stream.getTracks().forEach((t) => t.stop());
      };
      rec.start();
      mediaRef.current = rec;
      startedAt.current = Date.now();
      setRecording(true);

      const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SR) {
        const recog = new SR();
        recog.continuous = true; recog.interimResults = true; recog.lang = "en-US";
        recog.onresult = (e) => {
          let text = "";
          for (let i = 0; i < e.results.length; i++) text += e.results[i][0].transcript + " ";
          setTranscript(text.trim());
        };
        recog.start();
        recogRef.current = recog;
      } else {
        setMsg({ type: "info", text: "Live transcription isn't supported in this browser — type your answer below instead." });
      }
    } catch (e) {
      setMsg({ type: "error", text: "Microphone access denied. You can still type your answer." });
    }
  };

  const stopRecording = () => {
    mediaRef.current?.state === "recording" && mediaRef.current.stop();
    recogRef.current?.stop();
    setRecording(false);
  };

  const submit = async () => {
    if (!transcript.trim()) return setMsg({ type: "error", text: "Record or type an answer first." });
    setBusy(true);
    try {
      const fd = new FormData();
      fd.append("questionIndex", String(idx));
      fd.append("transcript", transcript);
      fd.append("durationSec", String(Math.round((Date.now() - startedAt.current) / 1000) || 0));
      if (blobRef.current) fd.append("audio", blobRef.current, "answer.webm");
      const { data } = await api.post(`/interviews/${id}/answer`, fd, { headers: { "Content-Type": "multipart/form-data" } });
      setFeedback(data.answer.feedback);
      setInterview((i) => ({ ...i, overallScore: data.overallScore, status: data.status }));
      blobRef.current = null;
    } catch (e) { setMsg({ type: "error", text: errMsg(e) }); } finally { setBusy(false); }
  };

  const next = () => { setIdx((i) => Math.min(i + 1, interview.questions.length - 1)); setFeedback(null); setTranscript(""); };

  if (!interview) return <p className="text-sm text-slate-500">Loading…</p>;
  const q = interview.questions[idx];

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
      <div className="card space-y-4 p-6">
        <div className="flex items-center justify-between text-sm text-slate-500">
          <span>Question {idx + 1} of {interview.questions.length}</span>
          <span className="chip capitalize">{q.category}</span>
        </div>
        <h1 className="text-xl font-bold text-ink">{q.text}</h1>
        {msg.text && <Alert type={msg.type}>{msg.text}</Alert>}

        <div className="flex flex-wrap gap-2">
          {!recording
            ? <button className="btn-primary" onClick={startRecording}><Mic size={15} /> Record answer</button>
            : <button className="btn-danger" onClick={stopRecording}><Square size={14} /> Stop recording</button>}
          <button className="btn-ghost" onClick={submit} disabled={busy}>{busy ? "Scoring…" : "Get AI feedback"}</button>
          {idx < interview.questions.length - 1 && <button className="btn-ghost" onClick={next}>Next question</button>}
        </div>

        <div>
          <label className="label">Transcript {recording && <span className="text-rose-600">● recording</span>}</label>
          <textarea className="input h-40" value={transcript} onChange={(e) => setTranscript(e.target.value)} placeholder="Your spoken answer appears here — you can edit it before submitting." />
        </div>

        {feedback && (
          <div className="rounded-lg border border-slate-200 p-4">
            <div className="flex items-center gap-4">
              <ScoreRing score={feedback.score} size={80} />
              <p className="text-sm text-slate-700">{feedback.summary}</p>
            </div>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <div><p className="label">Strengths</p><ul className="list-disc pl-5 text-sm text-emerald-700">{feedback.strengths.map((s, i) => <li key={i}>{s}</li>)}</ul></div>
              <div><p className="label">Improvements</p><ul className="list-disc pl-5 text-sm text-amber-700">{feedback.improvements.map((s, i) => <li key={i}>{s}</li>)}</ul></div>
            </div>
          </div>
        )}
      </div>

      <aside className="space-y-4">
        <div className="card grid place-items-center gap-2 p-5">
          <ScoreRing score={interview.overallScore} label="Overall" />
          <p className="text-xs capitalize text-slate-500">{interview.status}</p>
        </div>
        <div className="card p-4">
          <h3 className="section-title">Questions</h3>
          <ul className="mt-2 space-y-1 text-sm">
            {interview.questions.map((qq, i) => (
              <li key={i}>
                <button onClick={() => { setIdx(i); setFeedback(null); setTranscript(""); }}
                  className={`w-full truncate rounded px-2 py-1 text-left ${i === idx ? "bg-brand-50 font-semibold text-brand-700" : "hover:bg-slate-50"}`}>
                  {i + 1}. {qq.text}
                </button>
              </li>
            ))}
          </ul>
        </div>
        <Link to="/interviews" className="btn-ghost w-full">Interview history</Link>
      </aside>
    </div>
  );
}
