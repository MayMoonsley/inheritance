/// <reference path="SoundManager.ts" />

class Game {

    static currentRun: Run;

    static showTitle(): void {
        let options;
        SoundManager.playSong(MusicTracks.MainTheme);
        // If we've started a run, we can resume it
        if (Game.currentRun) {
            options = [
                ['New Game', () => Game.showCharSelect()],
                ['Resume Play', () => Game.resumeRun()],
                ['Settings', () => Game.showSettings()],
                ['Journal', () => Game.showJournal()],
                ['Credits', () => Game.showCredits()],
            ];
        } else {
            options = [
                ['New Game', () => Game.showCharSelect()],
                ['Settings', () => Game.showSettings()],
                ['Journal', () => Game.showJournal()],
                ['Credits', () => Game.showCredits()],
            ];
        }
        UI.fillScreen(UI.renderTitleScreen(options));
    }

    static showCharSelect(): void {
        //TODO: This should only restrict to inFinalGame characters in the final build.
        let charas: Player[] = characters.getAll([CharacterTags.inFinalGame]);
        UI.fillScreen(
            UI.renderCharacterSelect(Game.newRun, Game.showTitle, ...charas)
        );
        debugLog(characters.getAll());
    }

    static newRun(character: Player): void {
        // if the player character is being used for the first time, unlock its lore note
        let charNote = NotePool.unlockCharacterNote(character);
        if (charNote) {
            // show the unlocked note, and then start the run when the player closes that note
            UI.fillScreen(UI.renderNote((() => Game.newRun(character)), charNote));
            return;
        }

        // if the tutorial note is not yet unlocked (i.e., this is the first run), we unlock and show it
        let tutorialNote: Note = NotePool.getNoteByTitle("Tutorial");
        if (!tutorialNote.unlocked) {
            // unlock the tutorial if it hasn't been seen yet
            tutorialNote.unlocked = true;
            // show the tutorial note, and then start the run when the player closes that note
            UI.fillScreen(UI.renderNote((() => Game.newRun(character)), tutorialNote));
            Save.saveNotes(); // save the fact that we've unlocked the tutoral
            return;
        }

        Game.currentRun = new Run(character);
        Game.currentRun.start();
    }

    static resumeRun(): void {
        UI.showMapScreen();
    }

    // clears local storage and restarts game
    static resetGame(): void {
        Save.clearLocalStorage();
        window.location.reload();
    }

    static showCredits(): void {
        UI.fillScreen(
            UI.renderCredits([
                new CreditsEntry('May Lawver', 'Team Lead', 'Design', 'Programming', 'Writing'),
                new CreditsEntry('Grace Rarer', 'Programming', 'Design'),
                new CreditsEntry('Pranay Rapolu', 'Music'),
                new CreditsEntry('Prindle', 'Programming'),
                new CreditsEntry('Mitchell Philipp', 'Programming'),
                new CreditsEntry('Prince Bull', 'Art'),
                new CreditsEntry('Seong Ryoo', 'Art', 'Music'),
                new CreditsEntry('Finn Schiesser', 'Logo'),
            ], () => Game.showTitle())
        );
    }

    static showSettings(inGame: boolean = false): void {
        UI.fillScreen(UI.renderSettings(Game.showTitle));
    }

    static showJournal(): void {
        UI.fillScreen(UI.renderJournal(() => Game.showTitle(), NotePool.getUnlockedNotes()));
    }

    static showGameOver(run: Run): void {
        this.currentRun = undefined;
        UI.fillScreen(
            UI.makeHeader('Game Over'),
            UI.renderRun(run),
            UI.renderOptions([
                ['Back to Title Screen', () => Game.showTitle()]
            ]),
        );
    }

    static showVictory(run: Run): void {
        this.currentRun = undefined;
        UI.fillScreen(
            UI.makeHeader('Victory!'),
            UI.renderRun(run),
            UI.renderOptions([
                ['Back to Title Screen', () => Game.showTitle()]
            ]),
        );
    }

}
