import React, { useState, useMemo } from 'react';
import { useStudyData } from '../../context/StudyDataContext';
import { Note } from '../../types';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { EmptyState } from '../common/EmptyState';
import { useToast } from '../common/Toast';
import {
  FileText,
  Plus,
  Search,
  Pin,
  Trash2,
  Download,
  Copy,
  Tag,
  Eye,
  Edit3,
  Check,
} from 'lucide-react';
import { formatDate } from '../../lib/utils';

export const NotesView: React.FC = () => {
  const { notes, subjects, addNote, updateNote, deleteNote, togglePinNote } = useStudyData();
  const toast = useToast();

  const [activeNoteId, setActiveNoteId] = useState<string>(notes[0]?.id || '');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFolder, setSelectedFolder] = useState<string>('All');
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('All');
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [copied, setCopied] = useState(false);

  const activeNote = notes.find(n => n.id === activeNoteId) || notes[0];

  // Filter notes
  const filteredNotes = useMemo(() => {
    return notes
      .filter(n => {
        const matchesSearch =
          n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          n.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
          n.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));

        const matchesFolder = selectedFolder === 'All' || n.folder === selectedFolder;
        const matchesSubject = selectedSubjectId === 'All' || n.subjectId === selectedSubjectId;

        return matchesSearch && matchesFolder && matchesSubject;
      })
      .sort((a, b) => {
        if (a.pinned && !b.pinned) return -1;
        if (!a.pinned && b.pinned) return 1;
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      });
  }, [notes, searchQuery, selectedFolder, selectedSubjectId]);

  const handleCreateNewNote = () => {
    const created = addNote({
      title: 'Untitled Note',
      content: '# New Note\n\nStart typing your study notes, equations, or concepts here...',
      subjectId: selectedSubjectId !== 'All' ? selectedSubjectId : subjects[0]?.id,
      tags: ['Study'],
      pinned: false,
      folder: selectedFolder !== 'All' ? selectedFolder : 'Lectures',
    });
    setActiveNoteId(created.id);
    setIsPreviewMode(false);
    toast.success('Created new note');
  };

  const handleDelete = (id: string) => {
    if (confirm('Delete this note?')) {
      deleteNote(id);
      toast.info('Note deleted');
      const remaining = notes.filter(n => n.id !== id);
      if (remaining.length > 0) {
        setActiveNoteId(remaining[0].id);
      }
    }
  };

  const handleCopyContent = () => {
    if (!activeNote) return;
    navigator.clipboard.writeText(activeNote.content);
    setCopied(true);
    toast.success('Copied note to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadMarkdown = () => {
    if (!activeNote) return;
    const blob = new Blob([activeNote.content], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${activeNote.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.md`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success('Downloaded .md file');
  };

  const insertFormatting = (prefix: string, suffix = '') => {
    if (!activeNote) return;
    const textarea = document.getElementById('note-textarea') as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = activeNote.content.substring(start, end);
    const replacement = `${prefix}${selectedText || 'text'}${suffix}`;

    const newContent =
      activeNote.content.substring(0, start) +
      replacement +
      activeNote.content.substring(end);

    updateNote(activeNote.id, { content: newContent });
  };

  return (
    <div className="h-[calc(100vh-7.5rem)] flex flex-col space-y-4 max-w-7xl mx-auto animate-fade-in">
      {/* Top Header */}
      <div className="flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#F472B6]" />
            Smart Notes Workspace
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Apple Notes inspired markdown repository with subject tagging and live formatting.
          </p>
        </div>

        <Button
          icon={<Plus className="w-4 h-4" />}
          onClick={handleCreateNewNote}
          className="bg-[#0071E3] hover:bg-[#005BB6] text-white shadow-sm"
        >
          New Note
        </Button>
      </div>

      {/* Main 2-Panel Layout */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-5 min-h-0">
        {/* Left List Panel (4 cols) */}
        <div className="md:col-span-4 apple-glass-card rounded-3xl flex flex-col overflow-hidden shadow-apple-glass dark:shadow-apple-glass-dark">
          {/* Search & Subject Filter */}
          <div className="p-3.5 border-b border-black/[0.05] dark:border-white/[0.08] space-y-2.5 shrink-0">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search notes, tags, contents..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-white/60 dark:bg-white/[0.05] border border-black/[0.08] dark:border-white/[0.1] text-xs rounded-xl pl-8 pr-3 py-2 outline-none focus:border-[#0071E3] placeholder:text-muted-foreground/50 text-foreground backdrop-blur-md"
              />
            </div>

            {/* Subject Selector Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
              <button
                onClick={() => setSelectedSubjectId('All')}
                className={`text-[11px] px-2.5 py-1 rounded-full whitespace-nowrap transition-colors ${
                  selectedSubjectId === 'All'
                    ? 'bg-[#0071E3] text-white font-medium shadow-2xs'
                    : 'text-muted-foreground hover:bg-black/[0.04] dark:hover:bg-white/[0.05]'
                }`}
              >
                All Subjects
              </button>
              {subjects.map(s => (
                <button
                  key={s.id}
                  onClick={() => setSelectedSubjectId(s.id)}
                  className={`text-[11px] px-2.5 py-1 rounded-full whitespace-nowrap transition-colors ${
                    selectedSubjectId === s.id
                      ? 'bg-[#0071E3] text-white font-medium shadow-2xs'
                      : 'text-muted-foreground hover:bg-black/[0.04] dark:hover:bg-white/[0.05]'
                  }`}
                >
                  {s.code}
                </button>
              ))}
            </div>
          </div>

          {/* Notes List */}
          <div className="flex-1 overflow-y-auto p-2.5 space-y-1.5">
            {filteredNotes.length === 0 ? (
              <div className="py-12 text-center text-xs text-muted-foreground">
                No matching notes found.
              </div>
            ) : (
              filteredNotes.map(note => {
                const isSelected = activeNote?.id === note.id;
                const subject = subjects.find(s => s.id === note.subjectId);

                return (
                  <div
                    key={note.id}
                    onClick={() => setActiveNoteId(note.id)}
                    className={`p-3.5 rounded-2xl border text-left cursor-pointer transition-all duration-150 group ${
                      isSelected
                        ? 'bg-[#0071E3]/12 border-[#0071E3]/30 shadow-xs'
                        : 'border-transparent hover:bg-black/[0.03] dark:hover:bg-white/[0.04] hover:border-black/[0.05]'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="text-xs font-semibold text-foreground truncate group-hover:text-[#0071E3] transition-colors">
                        {note.title || 'Untitled Note'}
                      </h4>
                      {note.pinned && (
                        <Pin className="w-3 h-3 text-[#FB7185] fill-[#FB7185] shrink-0" />
                      )}
                    </div>

                    <p className="text-[11px] text-muted-foreground line-clamp-2 mt-1 font-mono">
                      {note.content.replace(/^[#*>\-\s]+/gm, '').substring(0, 80) || 'Empty note'}
                    </p>

                    <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-black/[0.04] dark:border-white/[0.06] text-[10px] text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        {subject && (
                          <span
                            className="font-mono px-1.5 py-0.2 rounded-full border"
                            style={{
                              backgroundColor: `${subject.color}15`,
                              color: subject.color,
                              borderColor: `${subject.color}30`,
                            }}
                          >
                            {subject.code}
                          </span>
                        )}
                        <span>{note.folder || 'Lectures'}</span>
                      </div>
                      <span>{formatDate(note.updatedAt)}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Editor Panel (8 cols) */}
        <div className="md:col-span-8 apple-glass-card rounded-3xl flex flex-col overflow-hidden shadow-apple-glass dark:shadow-apple-glass-dark">
          {activeNote ? (
            <>
              {/* Note Top Toolbar */}
              <div className="p-3.5 border-b border-black/[0.05] dark:border-white/[0.08] flex flex-wrap items-center justify-between gap-2 shrink-0">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => togglePinNote(activeNote.id)}
                    className={`p-1.5 rounded-xl hover:bg-black/[0.04] dark:hover:bg-white/[0.06] transition-colors ${
                      activeNote.pinned ? 'text-[#FB7185]' : 'text-muted-foreground'
                    }`}
                    title={activeNote.pinned ? 'Unpin Note' : 'Pin Note'}
                  >
                    <Pin className={`w-3.5 h-3.5 ${activeNote.pinned ? 'fill-[#FB7185]' : ''}`} />
                  </button>

                  <select
                    value={activeNote.subjectId || ''}
                    onChange={e => updateNote(activeNote.id, { subjectId: e.target.value || undefined })}
                    className="text-xs bg-white/60 dark:bg-white/[0.05] border border-black/[0.08] dark:border-white/[0.1] text-foreground rounded-xl px-2.5 py-1 outline-none"
                  >
                    <option value="">No Subject</option>
                    {subjects.map(s => (
                      <option key={s.id} value={s.id}>
                        {s.code}: {s.name}
                      </option>
                    ))}
                  </select>

                  <Input
                    placeholder="Folder (e.g. Lectures)"
                    value={activeNote.folder || ''}
                    onChange={e => updateNote(activeNote.id, { folder: e.target.value })}
                    className="text-xs py-1 px-2.5 w-28 h-7 bg-white/40 dark:bg-white/[0.04]"
                  />
                </div>

                {/* Actions: Edit/Preview toggle, Copy, Download, Delete */}
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setIsPreviewMode(!isPreviewMode)}
                    className="flex items-center gap-1.5 text-xs px-3 py-1 rounded-xl bg-white/60 dark:bg-white/[0.08] border border-black/[0.06] dark:border-white/[0.08] text-muted-foreground hover:text-foreground transition-colors shadow-2xs"
                  >
                    {isPreviewMode ? <Edit3 className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                    <span>{isPreviewMode ? 'Edit' : 'Preview'}</span>
                  </button>

                  <button
                    onClick={handleCopyContent}
                    className="p-1.5 text-muted-foreground hover:text-foreground rounded-xl hover:bg-black/[0.04] dark:hover:bg-white/[0.06] transition-colors"
                    title="Copy Markdown"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-[#10B981]" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>

                  <button
                    onClick={handleDownloadMarkdown}
                    className="p-1.5 text-muted-foreground hover:text-foreground rounded-xl hover:bg-black/[0.04] dark:hover:bg-white/[0.06] transition-colors"
                    title="Export as .md"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => handleDelete(activeNote.id)}
                    className="p-1.5 text-muted-foreground hover:text-[#FB7185] rounded-xl hover:bg-[#FFF5F7] dark:hover:bg-[#FB7185]/20 transition-colors"
                    title="Delete Note"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Note Title Input */}
              <div className="px-8 pt-5 pb-2 shrink-0">
                <input
                  type="text"
                  value={activeNote.title}
                  onChange={e => updateNote(activeNote.id, { title: e.target.value })}
                  placeholder="Note Title..."
                  className="w-full text-2xl font-bold bg-transparent border-none text-foreground placeholder:text-muted-foreground/40 outline-none tracking-tight"
                />

                {/* Tags row */}
                <div className="flex items-center gap-1.5 mt-2">
                  <Tag className="w-3 h-3 text-[#F472B6]" />
                  <input
                    type="text"
                    value={activeNote.tags.join(', ')}
                    onChange={e =>
                      updateNote(activeNote.id, {
                        tags: e.target.value.split(',').map(t => t.trim()).filter(Boolean),
                      })
                    }
                    placeholder="Add tags separated by comma..."
                    className="text-xs bg-transparent border-none text-muted-foreground placeholder:text-muted-foreground/40 outline-none w-full"
                  />
                </div>
              </div>

              {/* Formatting Toolbar */}
              {!isPreviewMode && (
                <div className="px-8 py-2 border-y border-black/[0.04] dark:border-white/[0.06] bg-black/[0.015] dark:bg-white/[0.02] flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground shrink-0">
                  <button onClick={() => insertFormatting('# ')} className="px-2 py-0.5 rounded-lg hover:bg-black/[0.05] dark:hover:bg-white/[0.08] font-bold">H1</button>
                  <button onClick={() => insertFormatting('## ')} className="px-2 py-0.5 rounded-lg hover:bg-black/[0.05] dark:hover:bg-white/[0.08] font-bold">H2</button>
                  <button onClick={() => insertFormatting('**', '**')} className="px-2 py-0.5 rounded-lg hover:bg-black/[0.05] dark:hover:bg-white/[0.08] font-bold">B</button>
                  <button onClick={() => insertFormatting('*', '*')} className="px-2 py-0.5 rounded-lg hover:bg-black/[0.05] dark:hover:bg-white/[0.08] italic">I</button>
                  <button onClick={() => insertFormatting('- ')} className="px-2 py-0.5 rounded-lg hover:bg-black/[0.05] dark:hover:bg-white/[0.08]">• List</button>
                  <button onClick={() => insertFormatting('> ')} className="px-2 py-0.5 rounded-lg hover:bg-black/[0.05] dark:hover:bg-white/[0.08]">Quote</button>
                  <button onClick={() => insertFormatting('```\n', '\n```')} className="px-2 py-0.5 rounded-lg hover:bg-black/[0.05] dark:hover:bg-white/[0.08] font-mono">&lt;/&gt;</button>
                  <button onClick={() => insertFormatting('$$', '$$')} className="px-2 py-0.5 rounded-lg hover:bg-black/[0.05] dark:hover:bg-white/[0.08] font-mono">fx</button>
                  <span className="ml-auto text-[10px] text-muted-foreground/70 flex items-center gap-1 font-mono">
                    <Check className="w-3 h-3 text-[#10B981]" /> Auto-saved
                  </span>
                </div>
              )}

              {/* Note Content (Textarea vs Rendered Markdown Preview) */}
              <div className="flex-1 p-8 overflow-y-auto min-h-0">
                {isPreviewMode ? (
                  <div className="prose prose-sm dark:prose-invert max-w-none space-y-3 font-sans">
                    {activeNote.content.split('\n\n').map((block, idx) => {
                      if (block.startsWith('# ')) {
                        return <h1 key={idx} className="text-xl font-bold border-b border-black/[0.06] dark:border-white/[0.08] pb-2 text-foreground">{block.replace('# ', '')}</h1>;
                      }
                      if (block.startsWith('## ')) {
                        return <h2 key={idx} className="text-lg font-semibold text-foreground mt-4">{block.replace('## ', '')}</h2>;
                      }
                      if (block.startsWith('### ')) {
                        return <h3 key={idx} className="text-sm font-semibold text-foreground mt-3">{block.replace('### ', '')}</h3>;
                      }
                      if (block.startsWith('> ')) {
                        return (
                          <blockquote key={idx} className="border-l-2 border-[#0071E3] pl-3 text-muted-foreground italic my-2 bg-[#0071E3]/5 py-1 rounded-r-xl">
                            {block.replace('> ', '')}
                          </blockquote>
                        );
                      }
                      if (block.startsWith('```')) {
                        return (
                          <pre key={idx} className="bg-black/[0.04] dark:bg-white/[0.06] p-3.5 rounded-2xl font-mono text-xs overflow-x-auto text-foreground border border-black/[0.06] dark:border-white/[0.08]">
                            <code>{block.replace(/```[a-z]*\n?/g, '')}</code>
                          </pre>
                        );
                      }
                      if (block.startsWith('- ')) {
                        return (
                          <ul key={idx} className="list-disc list-inside space-y-1 text-xs text-foreground">
                            {block.split('\n').map((line, liIdx) => (
                              <li key={liIdx}>{line.replace(/^- /, '')}</li>
                            ))}
                          </ul>
                        );
                      }
                      return <p key={idx} className="text-xs leading-relaxed text-foreground/90 whitespace-pre-wrap">{block}</p>;
                    })}
                  </div>
                ) : (
                  <textarea
                    id="note-textarea"
                    value={activeNote.content}
                    onChange={e => updateNote(activeNote.id, { content: e.target.value })}
                    placeholder="Write your study notes using markdown..."
                    className="w-full h-full bg-transparent border-none text-foreground font-mono text-xs leading-relaxed outline-none resize-none placeholder:text-muted-foreground/40"
                  />
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <EmptyState
                icon={<FileText className="w-8 h-8" />}
                title="No note selected"
                description="Select a note from the sidebar or create a new one to begin writing."
                actionLabel="Create Note"
                onAction={handleCreateNewNote}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
