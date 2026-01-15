import React, { useState } from "react";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import {
    useGetJournalEntriesQuery,
    useAddJournalEntryMutation,
    useGetJournalSummaryQuery,
    useUpdateJournalEntryMutation,
    useDeleteJournalEntryMutation
} from "../slices/journal/journalApi";
import {
    FiBook,
    FiPlus,
    FiCalendar,
    FiTrendingUp,
    FiMessageSquare,
    FiLoader,
    FiHeart,
    FiZap,
    FiAward,
    FiEdit,
    FiTrash2,
    FiCheck,
    FiX
} from "react-icons/fi";

const Journal = () => {
    const [newEntry, setNewEntry] = useState("");
    const [title, setTitle] = useState("");
    const [isExpanding, setIsExpanding] = useState(false);

    // Edit State
    const [editingId, setEditingId] = useState(null);
    const [editTitle, setEditTitle] = useState("");
    const [editContent, setEditContent] = useState("");

    // Queries & Mutations
    const { data: entriesRes, isLoading: entriesLoading } = useGetJournalEntriesQuery();
    const { data: summaryRes, isLoading: summaryLoading } = useGetJournalSummaryQuery();
    const [addEntry, { isLoading: adding }] = useAddJournalEntryMutation();
    const [updateEntry, { isLoading: updating }] = useUpdateJournalEntryMutation();
    const [deleteEntry, { isLoading: deleting }] = useDeleteJournalEntryMutation();

    const entries = entriesRes?.data || [];
    const weeklySummary = summaryRes?.data?.summary || "Write your first journal entry to see your AI trend analysis!";

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!newEntry.trim()) {
            toast.error("Please write something in your journal first!");
            return;
        }

        try {
            await addEntry({ title, content: newEntry }).unwrap();
            toast.success("Journal saved! AI is analyzing your entry...");
            setNewEntry("");
            setTitle("");
            setIsExpanding(false);
        } catch (err) {
            toast.error("Failed to save journal entry.");
        }
    };

    const handleUpdate = async (id) => {
        if (!editContent.trim()) {
            toast.error("Content cannot be empty!");
            return;
        }

        try {
            await updateEntry({ id, data: { title: editTitle, content: editContent } }).unwrap();
            toast.success("Entry updated and re-analyzed!");
            setEditingId(null);
        } catch (err) {
            toast.error("Failed to update entry.");
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this entry?")) return;

        try {
            await deleteEntry(id).unwrap();
            toast.success("Entry deleted.");
        } catch (err) {
            toast.error("Failed to delete entry.");
        }
    };

    const startEditing = (entry) => {
        setEditingId(entry._id);
        setEditTitle(entry.title);
        setEditContent(entry.content);
    };

    const getSentimentColor = (sentiment) => {
        const s = sentiment?.toLowerCase();
        if (s?.includes("calm") || s?.includes("happy")) return "text-emerald-500 bg-emerald-50 border-emerald-100";
        if (s?.includes("anxious") || s?.includes("sad") || s?.includes("frustrated")) return "text-amber-500 bg-amber-50 border-amber-100";
        return "text-blue-500 bg-blue-50 border-blue-100";
    };

    return (
        <div className="min-h-screen bg-slate-50/50 p-4 md:p-8">
            <div className="max-w-4xl mx-auto space-y-8">

                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-black text-slate-800 flex items-center gap-3">
                            <FiBook className="text-[#00796B]" />
                            Therapy Journal
                        </h1>
                        <p className="text-slate-500 mt-1">Express your thoughts and let AI track your emotional growth.</p>
                    </div>

                    <div className="bg-white p-2 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4 px-4">
                        <div className="bg-[#E0F2F1] p-2 rounded-xl text-[#00796B]">
                            <FiCalendar />
                        </div>
                        <div>
                            <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400">Today</p>
                            <p className="text-sm font-bold text-slate-700">{new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                        </div>
                    </div>
                </div>

                {/* 7-Day Trend Summary (Only show if entries exist) */}
                {entries.length > 0 && (
                    <div className="bg-gradient-to-br from-[#00796B] to-[#004D40] rounded-[2.5rem] p-8 text-white shadow-xl shadow-[#00796B]/20 relative overflow-hidden group">
                        <div className="absolute right-0 top-0 w-64 h-64 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl group-hover:bg-white/20 transition-all duration-700" />
                        <div className="relative z-10 flex items-start gap-6">
                            <div className="bg-white/20 p-4 rounded-3xl backdrop-blur-md shrink-0">
                                <FiTrendingUp size={32} />
                            </div>
                            <div className="flex-1">
                                <h2 className="text-xl font-bold mb-2 flex items-center gap-2">
                                    Last 7 Days Trend
                                    <span className="bg-white/20 text-[10px] px-2 py-1 rounded-full uppercase tracking-tighter">AI Analysis</span>
                                </h2>
                                {summaryLoading ? (
                                    <FiLoader className="animate-spin" />
                                ) : (
                                    <p className="text-emerald-50/90 leading-relaxed italic text-lg font-medium">
                                        "{weeklySummary}"
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* New Entry Form */}
                <div className={`bg-white rounded-[2rem] shadow-sm border border-slate-100 transition-all duration-500 overflow-hidden ${isExpanding ? 'ring-2 ring-[#00796B]/20 shadow-lg' : ''}`}>
                    <form onSubmit={handleSubmit} className="p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="bg-indigo-50 p-2 rounded-xl text-indigo-600">
                                <FiPlus />
                            </div>
                            <h3 className="font-bold text-slate-700">Write Today's Note</h3>
                        </div>

                        <div className="space-y-4">
                            {isExpanding && (
                                <input
                                    type="text"
                                    placeholder="Give your entry a title (Optional)..."
                                    className="w-full px-4 py-3 rounded-2xl bg-slate-50 border-transparent focus:bg-white focus:border-[#00796B]/30 focus:ring-0 transition-all font-medium text-slate-700"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                />
                            )}

                            <textarea
                                placeholder="How are you feeling today? Share your thoughts..."
                                className={`w-full px-5 py-4 rounded-[1.5rem] bg-slate-50 border-transparent focus:bg-white focus:border-[#00796B]/30 focus:ring-4 focus:ring-[#00796B]/5 transition-all outline-none resize-none duration-300 ${isExpanding ? 'h-48' : 'h-16'}`}
                                value={newEntry}
                                onFocus={() => setIsExpanding(true)}
                                onChange={(e) => setNewEntry(e.target.value)}
                            />

                            {isExpanding && (
                                <div className="flex justify-between items-center pt-2">
                                    <button
                                        type="button"
                                        onClick={() => setIsExpanding(false)}
                                        className="text-slate-400 font-bold text-sm hover:text-slate-600 px-4 py-2 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        disabled={adding}
                                        type="submit"
                                        className="bg-[#00796B] hover:bg-[#004D40] text-white px-8 py-3 rounded-2xl font-bold transition-all shadow-lg shadow-[#00796B]/20 flex items-center gap-2 disabled:opacity-50"
                                    >
                                        {adding ? <FiLoader className="animate-spin" /> : <FiZap />}
                                        Save & Analyze
                                    </button>
                                </div>
                            )}
                        </div>
                    </form>
                </div>

                {/* Previous Entries */}
                <div className="space-y-6">
                    <div className="flex items-center justify-between px-2">
                        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                            History
                            <span className="text-slate-400 font-medium text-sm">({entries.length})</span>
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 gap-6">
                        {entriesLoading ? (
                            <div className="flex justify-center p-12">
                                <FiLoader className="animate-spin text-[#00796B]" size={32} />
                            </div>
                        ) : entries.length === 0 ? (
                            <div className="bg-white rounded-[2rem] p-12 text-center border border-dashed border-slate-200">
                                <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                                    <FiBook size={24} />
                                </div>
                                <h3 className="font-bold text-slate-600">Your journal is empty</h3>
                                <p className="text-slate-400 text-sm mt-1">Start writing to track your therapeutic progress.</p>
                            </div>
                        ) : (
                            entries.map((entry) => (
                                <div key={entry._id} className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100 group hover:shadow-md transition-all duration-300 relative">

                                    {editingId === entry._id ? (
                                        // Edit Mode
                                        <div className="space-y-4">
                                            <input
                                                type="text"
                                                className="w-full px-4 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-[#00796B] font-bold"
                                                value={editTitle}
                                                onChange={(e) => setEditTitle(e.target.value)}
                                            />
                                            <textarea
                                                className="w-full px-4 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-[#00796B] h-32 resize-none"
                                                value={editContent}
                                                onChange={(e) => setEditContent(e.target.value)}
                                            />
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => setEditingId(null)}
                                                    className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 transition-colors"
                                                >
                                                    <FiX size={20} />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => handleUpdate(entry._id)}
                                                    disabled={updating}
                                                    className="bg-[#00796B] text-white p-2 rounded-lg hover:bg-[#004D40] transition-colors shadow-sm disabled:opacity-50"
                                                >
                                                    {updating ? <FiLoader className="animate-spin" /> : <FiCheck size={20} />}
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        // View Mode
                                        <>
                                            <div className="flex justify-between items-start mb-4">
                                                <div className="flex items-center gap-3">
                                                    <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${getSentimentColor(entry.sentiment)}`}>
                                                        {entry.sentiment}
                                                    </div>
                                                    <span className="text-slate-400 text-xs font-medium uppercase tracking-tight">
                                                        {new Date(entry.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                                                    </span>
                                                </div>

                                                {/* Actions Overlay */}
                                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button
                                                        type="button"
                                                        onClick={() => startEditing(entry)}
                                                        className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-[#00796B] transition-all"
                                                        title="Edit"
                                                    >
                                                        <FiEdit size={16} />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleDelete(entry._id)}
                                                        className="p-2 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-all"
                                                        title="Delete"
                                                    >
                                                        <FiTrash2 size={16} />
                                                    </button>
                                                </div>
                                            </div>

                                            <h4 className="font-black text-slate-800 mb-2 group-hover:text-[#00796B] transition-colors">{entry.title}</h4>
                                            <p className="text-slate-600 text-sm leading-relaxed mb-6">
                                                {entry.content}
                                            </p>

                                            {entry.aiFeedback && (
                                                <div className="bg-slate-50 rounded-2xl p-4 flex gap-4 items-start relative overflow-hidden">
                                                    <div className="absolute top-0 left-0 w-1 h-full bg-[#00796B]" />
                                                    <div className="text-[#00796B] mt-1 shrink-0">
                                                        <FiMessageSquare size={16} />
                                                    </div>
                                                    <p className="text-xs text-slate-500 italic leading-relaxed">
                                                        <span className="text-[#00796B] font-bold not-italic mr-1">AI Feedback:</span>
                                                        {entry.aiFeedback}
                                                    </p>
                                                </div>
                                            )}
                                        </>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Journal;
