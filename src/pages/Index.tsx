import { useState } from 'react';
import { SongList } from '@/components/SongList';
import { SongEditor } from '@/components/SongEditor';
import { CreateSongDialog } from '@/components/CreateSongDialog';
import { useSongs } from '@/hooks/useSongs';
import { usePromptLibrary } from '@/hooks/usePromptLibrary';
import type { Song } from '@/types/song';

const Index = () => {
  const { songs, createSong, updateSong, deleteSong, importSong, getSong, isLoaded } = useSongs();
  const { prompts, addPrompt, updatePrompt, deletePrompt, isLoaded: promptsLoaded } = usePromptLibrary();
  const [selectedSongId, setSelectedSongId] = useState<string | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  const selectedSong = selectedSongId ? getSong(selectedSongId) : null;

  const handleCreateSong = async (title: string, audioFile: File | null) => {
    const newSong = await createSong(title, audioFile);
    setSelectedSongId(newSong.id);
  };

  const handleSelectSong = (song: Song) => {
    setSelectedSongId(song.id);
  };

  const handleBack = () => {
    setSelectedSongId(null);
  };

  const handleUpdateSong = (updates: Partial<Song>, audioFile?: File) => {
    if (selectedSongId) {
      updateSong(selectedSongId, updates, audioFile);
    }
  };

  const handleDeleteSong = async (songId: string) => {
    await deleteSong(songId);
    if (selectedSongId === songId) {
      setSelectedSongId(null);
    }
  };

  const handleImportSong = async (song: Song) => {
    await importSong(song);
    // Optional: auto-select imported song?
    // setSelectedSongId(song.id); 
  };

  if (!isLoaded || !promptsLoaded) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="h-screen overflow-hidden">
      {selectedSong ? (
        <SongEditor
          song={selectedSong}
          onBack={handleBack}
          onUpdate={handleUpdateSong}
          prompts={prompts}
        />
      ) : (
        <SongList
          songs={songs}
          onSelectSong={handleSelectSong}
          onCreateSong={() => setShowCreateDialog(true)}
          onDeleteSong={handleDeleteSong}
          onImportSong={handleImportSong}
          prompts={prompts}
          onAddPrompt={addPrompt}
          onUpdatePrompt={updatePrompt}
          onDeletePrompt={deletePrompt}
        />
      )}

      <CreateSongDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onCreateSong={handleCreateSong}
      />
    </div>
  );
};

export default Index;
